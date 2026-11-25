/* hanaseruChat の自己点検（AI を呼ばない・費用ゼロ）。デプロイ前に firebase.json の predeploy で必ず走る。
   なぜ：2026-09-27、英訳コーチの書き換えで ChatOut（AI会話の型）を消してしまい、AI会話が本番で壊れたまま公開された。
   各モードを偽の AI で一度ずつ通し、型の書き忘れ・参照切れ（ReferenceError）をデプロイ前に止める。exit 0=OK / 1=NG */
"use strict";
const Module = require("module");
const path = require("path");

class HttpsError extends Error { constructor(code, msg) { super(msg); this.code = code; } }
let handler = null;
const fakeFunctions = { onCall: (opts, h) => { handler = h; return h; }, HttpsError };

const anything = { reply: "", better: "", better_ja: "", tip: "", ended: false, en: "", chunks: [], grammar: "",
  alt: "", alt_ja: "", polite: "", polite_ja: "", swap: { en: "", ja: "" }, used: [], missed: [], good_ja: "", next_ja: "", opinion_ja: "", respond_ja: "", rephrase_ja: "",
  phrases: [], scores: [{ score: 3, comment_ja: "" }, { score: 2, comment_ja: "" }, { score: 9, comment_ja: "" }],
  title_ja: "", place_ja: "", who_a: "", who_b: "", gender_a: "f", gender_b: "m", gist_ja: "", reply_ja: "",
  lines: [{ s: "A", en: "Hi." }, { s: "B", en: "Hello." }, { s: "A", en: "How are you?" }, { s: "B", en: "Fine." }] };
class FakeAnthropic {
  constructor() { this.messages = { parse: async (req) => {
    if (!req.output_config || !req.output_config.format) throw new Error("output_config.format がない");
    return { parsed_output: JSON.parse(JSON.stringify(anything)), stop_reason: "end_turn" };
  } }; }
}
["RateLimitError", "AuthenticationError", "APIConnectionError", "BadRequestError"].forEach((n) => { FakeAnthropic[n] = class extends Error {}; });

const origLoad = Module._load;
Module._load = function (req, ...rest) {
  if (req === "./push" || req === "./speech") return {}; // notification handlers have their own tests
  if (req === "firebase-functions/v2/https") return fakeFunctions;
  if (req === "@anthropic-ai/sdk") return FakeAnthropic;
  return origLoad.call(this, req, ...rest);
};
process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "selftest";
require(path.join(__dirname, "index.js"));

const call = (data) => handler({ auth: { token: { email: "komorikoji@lifecrescendo.com" } }, data });
const opening = [{ role: "user", content: "(start)" }];
const cases = [
  ["chat", { mode: "chat", scene: "clinic", messages: opening }],
  ["chat(split)", { mode: "chat", split: true, scene: "travel", messages: opening }],
  ["feedback", { mode: "feedback", scene: "travel", messages: opening }],
  ["chat(split+focus)", { mode: "chat", split: true, scene: "travel", messages: opening, focus: ["end up", "to be honest"] }],
  ["assess", { mode: "assess", items: [{ kind: "opinion", prompt: "What do you think?", said: "I think so because it helps." }, { kind: "respond", prompt: "There is a problem.", said: "" }, { kind: "rephrase", prompt: "What is that?", said: "I mean a clinic." }] }],
  ["listen", { mode: "listen", topic: "hotel", seed: "1", focus: ["sort out"] }],
  ["chat(case)", { mode: "chat", scene: "case", caseText: "a parent", messages: opening }],
  ["translate", { mode: "translate", text: "こんにちは" }],
  ["explain", { mode: "explain", en: "Hello.", ja: "こんにちは" }],
  ["review", { mode: "review", caseText: "a parent", facts: [], model: ["open"], parts: [{ id: "open", title: "はじまり", en: ["Hi"] }], transcript: "Doctor: Hi" }],
  ["review(no case)", { mode: "review", scene: "me", transcript: "Doctor: Hi" }],
  ["chat(me)", { mode: "chat", scene: "me", messages: opening }],
  ["review(monologue)", { mode: "review", scene: "monologue", caseText: "Topic: x", transcript: "Doctor: Hi" }]
];
(async () => {
  let ng = 0;
  for (const [name, data] of cases) {
    try { await call(data); console.log("  ✅ " + name); }
    catch (e) { ng = 1; console.log("  ❌ " + name + " … " + (e.code || "") + " " + e.message); }
  }
  console.log(ng ? "→ hanaseruChat 自己点検 NG（デプロイを止めます）" : "→ hanaseruChat 自己点検 OK");
  process.exit(ng);
})();
