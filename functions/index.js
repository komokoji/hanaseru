/* Hanaseru Cloud Functions — AI会話（FR-12）＋ 英訳コーチ（FR-17）
   ・静的サイトに AI の鍵は置けないので、ここ（Functions）が鍵を持つ。鍵は Secret Manager: ANTHROPIC_API_KEY
   ・呼べるのは院長の Google アカウントだけ（onCall＝Firebase Auth の ID トークンを自動検証）
   ・mode "chat"      … 場面つきロールプレイ。相手役の返事＋院長の直前の発言への言い直しFB
   ・mode "translate" … 日本語→自然な英語＋別の言い方（丁寧/くだけた）＋ニュアンス（🔖保存→リピートへ） */
"use strict";

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const Anthropic = require("@anthropic-ai/sdk");
const { z } = require("zod");
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
or textbook-formal either. Simple and standard first; variety only within that register.`;

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
about; ask one good follow-up question at a time.`
};

const CHAT_SYSTEM = (scene) => `${WHO}

You are running a spoken-English roleplay. ${SCENES[scene] || SCENES.free}

Each turn, produce:
- reply: your next line in character. 1–3 short sentences, spoken English, end with something that
  invites him to keep talking. Never correct him inside the reply; stay in character.
- better: the most natural way a fluent speaker would have said what he just said (keep his meaning
  and his warmth; if his line was already natural, return it unchanged). One or two sentences max.
- better_ja: a short Japanese gloss of "better" (自然な日本語、敬体でなくて良い).
- tip: ONE short coaching note in Japanese (30–60字) about the nuance/word choice/rhythm that would
  make him sound more like himself in English. Encouraging, specific, no lecture.
- ended: true only if the scene has naturally concluded (goodbye said).
If his message is in Japanese or mixed, treat it as "I want to say this" — put the English in better,
and reply as if he had said it.`;

const TRANSLATE_SYSTEM = `${WHO}

He gives you something he wants to say (Japanese, or rough English), often with context in brackets.
Return:
- en: the single most natural spoken-English version, in his voice (warm, clear, not stiff).
- alt: a second, equally standard everyday way to say it (different wording, same register).
- polite: a slightly more careful version for a parent, staff member, or official — still spoken, not stiff.
- nuance_ja: 2–3 short Japanese notes: which to use when, and one word/phrase worth noticing.
Keep every English line short enough to say in one breath. No explanations in English.`;

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

const TranslateOut = z.object({
  en: z.string(),
  alt: z.string(),
  polite: z.string(),
  nuance_ja: z.string()
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
    const mode = data.mode === "translate" ? "translate" : data.mode === "explain" ? "explain" : "chat";

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

      const scene = String(data.scene || "free");
      const messages = cleanMessages(data.messages);
      const res = await client.messages.parse({
        model: MODEL,
        max_tokens: 2000,
        system: [{ type: "text", text: CHAT_SYSTEM(scene), cache_control: { type: "ephemeral" } }],
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
