/* Hanaseru Cloud Functions — AI会話（FR-12）＋ 英訳コーチ（FR-17）
   ・静的サイトに AI の鍵は置けないので、ここ（Functions）が鍵を持つ。鍵は Secret Manager: ANTHROPIC_API_KEY
   ・呼べるのは院長の Google アカウントだけ（onCall＝Firebase Auth の ID トークンを自動検証）
   ・mode "chat"      … 場面つきロールプレイ。相手役の返事＋院長の直前の発言への言い直しFB
   ・mode "translate" … 日本語→自然な英語＋別の言い方（丁寧/くだけた）＋ニュアンス（🔖保存→リピートへ） */
"use strict";

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const Anthropic = require("@anthropic-ai/sdk");
const { z } = require("zod/v4");
const { zodOutputFormat } = require("@anthropic-ai/sdk/helpers/zod");

const OWNER_EMAIL = "komorikoji@lifecrescendo.com";
const MODEL = "claude-opus-5";
const MAX_TURNS = 24;            // 送る履歴の上限（発言数）
const MAX_CHARS = 1200;          // 1発言の上限

// 院長の人物像（辞書の背骨＝署名フレーズと同じ声で相手役を作る）
const WHO = `The learner is Dr. Komori, a Japanese pediatric surgeon who runs a children's clinic in Tokyo
(gut health and nutrition). He is warm, precise, and reassuring with parents. His English goal:
speak what he already has inside — to parents in his clinic, and to people he meets while traveling —
without being flattened by language. He wants natural spoken English (not textbook), with British and
American both fine.

REGISTER RULE (applies to every English line you produce): give him the "royal road" — the most
standard, widely used way fluent speakers actually say it: polite but conversational, natural,
nothing that would sound odd anywhere. No slang, no overly casual or regional idioms, nothing stiff
or textbook-formal either. Simple and standard first; variety only within that register.
STYLE RULE: use short, connected spoken sentences that Dr. Komori can say while looking at a parent.
One manageable thought at a time, usually 2–4 sentences for a longer explanation. Use familiar words
and ordinary clinical terms when needed. Do not fragment every clause or remove useful connectors.
Warmth comes from listening, giving a clear reason, and making the next step together, not repeatedly
saying "don't worry" or promising recovery. Preserve his personal voice and meaningful metaphors.
Example of the target style: "I can see why you're worried. Let me explain what we know so far.
Then we can make a plan together." Avoid written punctuation such as semicolons and long dashes.
MEANING FIRST: preserve who acts, what they do, conditions, uncertainty, comparisons, and the
difference between a goal and the current state. Never turn reassurance into a stronger promise,
or add a medical claim or treatment decision that the learner did not express. Shortness must not
change the meaning. Use and, but, because, so, and if when they make the connection clearer.
One easy-to-say thought may contain connected details; do not split sentences mechanically.
Keep his personal metaphors when they matter, with a short plain explanation if needed.
COACHING PRIORITY: first fix meaning or wording that could mislead; then help with wording that
is hard to say or reuse. Accept clear, accurate, appropriately polite English as successful.
Do not rewrite it merely to imitate a native speaker or replace it with a preferred synonym.`;

const SCENES = {
  clinic: `ROLE: You are a worried English-speaking parent in his exam room in Tokyo (pick a plausible
child, age, and complaint; keep it consistent). Ask real parent questions, react to what he says, push
gently for clarity ("So do I need to worry about…?"). Let him lead the explanation.`,
  travel: `ROLE: You are a friendly fellow traveler (choose: a pub in London, a hotel breakfast, a train
seat) who strikes up small talk. Ask about him, share a little about yourself, keep it flowing and
natural. Use everyday spoken English with contractions.`,
  service: `ROLE: You are a shop clerk / hotel receptionist / airline ground staff (pick one) handling his
request. Be realistic: ask clarifying questions, offer options, mention a small complication he must
handle (a delayed bag, a card that doesn't work, no window seats left).`,
  free: `ROLE: Be a curious, warm English-speaking conversation partner. Follow whatever he wants to talk
about; ask one good follow-up question at a time.`,
  me: `ROLE: You are a friendly traveler he meets on a trip (a hotel breakfast in Spain, or a train). You are
genuinely curious about him. Ask what he does, why he moved from surgery to nutrition, what matters most to
him, how he feels about it, what he wants to do next. One question at a time. Ask "Why?" and "How did that
feel?" often, so he has to give his own opinion and feelings, not just facts. React warmly to what he says.`
};

const caseRole = (caseText) => `ROLE: You are ${caseText} You are in Dr. Komori's pediatric clinic in Tokyo.
Speak as this parent: natural, a little anxious, one question or reaction at a time (e.g. daycare or school, the
medicine, when to come back, what to do if it gets worse). Let the doctor lead the explanation; do not explain
medicine yourself.`;

const CHAT_SYSTEM = (scene, caseText) => `${WHO}

You are running a spoken-English roleplay. ${scene === "case" && caseText ? caseRole(caseText) : (SCENES[scene] || SCENES.free)}

Each turn, produce:
- reply: your next line in character. 1–3 short sentences, spoken English, end with something that
  invites him to keep talking. Never correct him inside the reply; stay in character.
- better: return his wording unchanged if it already conveys his meaning clearly, accurately, and
  appropriately politely. Otherwise make the smallest useful correction, preserving his meaning
  and warmth. Prefer short sentences, but never drop meaning to meet a sentence limit.
- better_ja: a short Japanese gloss of "better" (自然な日本語、敬体でなくて良い).
- tip: ONE short coaching note in Japanese (30–60字). Explain the most useful correction, or, if
  none is needed, say specifically what communicated well. Do not invent a fault. No lecture.
- ended: true only if the scene has naturally concluded (goodbye said).
If his message is in Japanese or mixed, treat it as "I want to say this" — put the English in better,
and reply as if he had said it.`;

const TRANSLATE_SYSTEM = `${WHO}

He gives you something he wants to say (Japanese, or rough English), often with context in brackets.
If he describes a moment when he could not say or ask something, give the words he needed in that
situation, not a translation of "I couldn't say it". Treat bracketed scene/difficulty as context,
not spoken content. If a heard phrase is unclear, do not invent what the speaker said; provide a
simple clarification question he can use and explain the uncertainty in the Japanese grammar note.
His learning format (his own words): memorize ONE royal-road sentence first — the one a Japanese adult
with school English should learn because it is what people really say and it also trains the ear —
understand its grammar and nuance, then glance at two alternatives for range.
Return:
- en: one main version in his voice (warm, clear, spoken). Use short sentences as needed to keep
  his full meaning; one breath per sentence if possible. Do not force everything into one sentence.
- chunks: split "en" into 3–6 meaningful chunks in order; for each: en, ja (Japanese meaning), note
  (short Japanese note on a phrasal verb / idiom / nuance / why this word; empty when nothing to say).
- grammar: ONE Japanese sentence on the key grammar point of "en".
- alt: a second standard way to say it (often shorter / easier to say), same register.
- alt_ja: a short Japanese note on when alt fits better.
- polite: a slightly more careful version for a parent, staff member, or official — still spoken.
- polite_ja: a short Japanese note on when polite fits better.
Japanese plain style (敬体でなくて良い), no lecturing.`;

const ChatOut = z.object({
  reply: z.string(),
  better: z.string(),
  better_ja: z.string(),
  tip: z.string(),
  ended: z.boolean()
});

const EXPLAIN_SYSTEM = `${WHO}

He shows you one English line from his own phrasebook (with the Japanese meaning he intends). He is
an intermediate learner: the meaning is his, but some words, phrasal verbs, or grammar are unfamiliar.
Explain in Japanese, briefly, so he can say the line with understanding:
- chunks: split the sentence into 3–6 meaningful chunks in order. For each: the chunk (en), its Japanese
  meaning (ja), and, only when useful, a short note (note) on why this word/phrase is used or a nuance
  (phrasal verb, idiom, register, British vs American). Keep note empty when nothing is worth saying.
- grammar: ONE sentence in Japanese on the sentence's structure or key grammar point (e.g. imperative with
  "go easy on", "while + present"). Skip trivia.
- swap: one other standard, widely used way to say the same thing (same polite-spoken register), and
  its Japanese gloss.
Japanese should be plain (敬体でなくて良い), no lecturing, 200字以内 total for notes+grammar.`;

const ExplainOut = z.object({
  chunks: z.array(z.object({ en: z.string(), ja: z.string(), note: z.string() })),
  grammar: z.string(),
  swap: z.object({ en: z.string(), ja: z.string() })
});

const REVIEW_SYSTEM = `${WHO}

He just practiced a conversation in English (roleplay). His goal (his own words): stay Japanese-sounding, but
clearly get his own thoughts and feelings across. Three measures of that goal (CEFR upper-B2):
① he states an opinion WITH a reason; ② he responds on the spot, including asking back when unsure;
③ when stuck, he rephrases and keeps going. Judge the transcript on these three, by meaning.
These are practice indicators, not a CEFR certification. You receive text, not audio: do not infer
pronunciation, accent, speaking speed, or the duration of pauses. State when evidence is absent.
If the scene is "monologue", he spoke alone for one minute on a topic (no partner): judge ② as "did he keep
developing his thought / use a phrase to manage hesitation", and if a second try is given, praise concrete
rephrasing between the tries.
- opinion_ja / respond_ja / rephrase_ja: for each measure, ONE short Japanese sentence: what he did (quote
  his words briefly) or, if it did not happen, one concrete thing he could have said (in English, short).
  Warm, specific, no lecture.
If a part library is given (a clinic case), also judge his clinic explanation by parts:
- used: ids of the parts he actually covered (even partly, even with different words).
- missed: ids of parts from the model order (or clearly useful for THIS parent's questions) that he did not
  cover. Only what would really help this parent — at most 4. Never list a part he covered.
If no part library is given, used and missed are empty arrays.
- good_ja: one warm, specific Japanese sentence on what went well (what he said that worked).
- next_ja: one specific Japanese sentence on the single most useful thing to add or say differently next time.
Use only ids from the library.`;

const ReviewOut = z.object({
  opinion_ja: z.string(),
  respond_ja: z.string(),
  rephrase_ja: z.string(),
  used: z.array(z.string()),
  missed: z.array(z.string()),
  good_ja: z.string(),
  next_ja: z.string()
});

const TranslateOut = z.object({
  en: z.string(),
  chunks: z.array(z.object({ en: z.string(), ja: z.string(), note: z.string() })),
  grammar: z.string(),
  alt: z.string(),
  alt_ja: z.string(),
  polite: z.string(),
  polite_ja: z.string()
});

function cleanMessages(raw) {
  if (!Array.isArray(raw) || !raw.length) throw new HttpsError("invalid-argument", "messages が空です");
  const out = raw.slice(-MAX_TURNS).map((m) => {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string" || !m.content.trim())
      throw new HttpsError("invalid-argument", "messages の形が違います");
    return { role: m.role, content: m.content.trim().slice(0, MAX_CHARS) };
  });
  // 先頭は user・交互・末尾は user（アプリ側が守るが、念のため寄せる）
  while (out.length && out[0].role !== "user") out.shift();
  const alt = [];
  out.forEach((m) => { if (!alt.length || alt[alt.length - 1].role !== m.role) alt.push(m); });
  if (!alt.length || alt[alt.length - 1].role !== "user") throw new HttpsError("invalid-argument", "最後は院長の発言である必要があります");
  return alt;
}

exports.hanaseruChat = onCall(
  { region: "asia-northeast1", secrets: ["ANTHROPIC_API_KEY"], cors: true, invoker: "public", timeoutSeconds: 60, memory: "256MiB" },
  async (request) => {
    const email = request.auth && request.auth.token && request.auth.token.email;
    if (!request.auth) throw new HttpsError("unauthenticated", "ログインが必要です");
    if (email !== OWNER_EMAIL) throw new HttpsError("permission-denied", "このアプリは院長専用です");

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const data = request.data || {};
    const mode = ["translate", "explain", "review"].indexOf(data.mode) >= 0 ? data.mode : "chat";

    try {
      if (mode === "translate") {
        const text = String(data.text || "").trim().slice(0, MAX_CHARS);
        if (!text) throw new HttpsError("invalid-argument", "text が空です");
        const res = await client.messages.parse({
          model: MODEL,
          max_tokens: 2000,
          system: [{ type: "text", text: TRANSLATE_SYSTEM, cache_control: { type: "ephemeral" } }],
          messages: [{ role: "user", content: text }],
          output_config: { effort: "low", format: zodOutputFormat(TranslateOut) }
        });
        if (!res.parsed_output) throw new HttpsError("internal", "AI の返答を読めませんでした");
        return { mode, result: res.parsed_output };
      }

      if (mode === "explain") {
        const en = String(data.en || "").trim().slice(0, MAX_CHARS);
        const ja = String(data.ja || "").trim().slice(0, MAX_CHARS);
        if (!en) throw new HttpsError("invalid-argument", "en が空です");
        const res = await client.messages.parse({
          model: MODEL,
          max_tokens: 2000,
          system: [{ type: "text", text: EXPLAIN_SYSTEM, cache_control: { type: "ephemeral" } }],
          messages: [{ role: "user", content: `English: ${en}\nIntended meaning (Japanese): ${ja || "(none given)"}` }],
          output_config: { effort: "low", format: zodOutputFormat(ExplainOut) }
        });
        if (!res.parsed_output) throw new HttpsError("internal", "AI の返答を読めませんでした");
        return { mode, result: res.parsed_output };
      }

      if (mode === "review") {
        const parts = (Array.isArray(data.parts) ? data.parts : []).slice(0, 60).map((p) => ({
          id: String(p.id || "").slice(0, 40), title: String(p.title || "").slice(0, 60),
          en: (Array.isArray(p.en) ? p.en : []).slice(0, 3).map((x) => String(x).slice(0, 200))
        })).filter((p) => p.id);
        const ids = parts.map((p) => p.id);
        const model = (Array.isArray(data.model) ? data.model : []).map(String).filter((x) => ids.indexOf(x) >= 0);
        const transcript = String(data.transcript || "").slice(0, 8000);
        if (!transcript) throw new HttpsError("invalid-argument", "transcript が空です");
        const lib = parts.length ? parts.map((p) => `- ${p.id}: ${p.title} — e.g. ${p.en.join(" / ")}`).join("\n") : "(none)";
        const res = await client.messages.parse({
          model: MODEL,
          max_tokens: 2000,
          system: [{ type: "text", text: REVIEW_SYSTEM, cache_control: { type: "ephemeral" } }],
          messages: [{ role: "user", content:
            `Scene: ${String(data.scene || "").slice(0, 40)}\nCase: ${String(data.caseText || "(none)").slice(0, 600)}\nFacts (Japanese): ${(Array.isArray(data.facts) ? data.facts : []).join(" / ").slice(0, 600)}\n`
            + `Model order of parts: ${model.join(", ")}\n\nPart library:\n${lib}\n\nTranscript:\n${transcript}` }],
          output_config: { effort: "low", format: zodOutputFormat(ReviewOut) }
        });
        const r = res.parsed_output;
        if (!r) throw new HttpsError("internal", "AI の返答を読めませんでした");
        r.used = r.used.filter((x) => ids.indexOf(x) >= 0);
        r.missed = r.missed.filter((x) => ids.indexOf(x) >= 0 && r.used.indexOf(x) < 0);
        return { mode, result: r };
      }

      const scene = String(data.scene || "free");
      const caseText = String(data.caseText || "").slice(0, 600);
      const messages = cleanMessages(data.messages);
      const res = await client.messages.parse({
        model: MODEL,
        max_tokens: 2000,
        system: [{ type: "text", text: CHAT_SYSTEM(scene, caseText), cache_control: { type: "ephemeral" } }],
        messages,
        output_config: { effort: "low", format: zodOutputFormat(ChatOut) }
      });
      if (res.stop_reason === "refusal") throw new HttpsError("failed-precondition", "AI がこの内容には答えませんでした");
      if (!res.parsed_output) throw new HttpsError("internal", "AI の返答を読めませんでした");
      return { mode, scene, result: res.parsed_output };
    } catch (e) {
      if (e instanceof HttpsError) throw e;
      if (e instanceof Anthropic.RateLimitError) throw new HttpsError("resource-exhausted", "AI が混み合っています。少し待ってもう一度");
      if (e instanceof Anthropic.AuthenticationError) throw new HttpsError("failed-precondition", "AI の鍵が設定されていません（ANTHROPIC_API_KEY）");
      if (e instanceof Anthropic.APIConnectionError) throw new HttpsError("unavailable", "AI に接続できませんでした");
      console.error("hanaseruChat", e);
      throw new HttpsError("internal", "AI との会話でエラーが出ました");
    }
  }
);
