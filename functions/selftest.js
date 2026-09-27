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
  alt: "", alt_ja: "", polite: "", polite_ja: "", swap: { en: "", ja: "" }, used: [], missed: [], good_ja: "", next_ja: "" };
class FakeAnthropic {
  constructor() { this.messages = { parse: async (req) => {
    if (!req.output_config || !req.output_config.format) throw new Error("output_config.format がない");
    return { parsed_output: JSON.parse(JSON.stringify(anything)), stop_reason: "end_turn" };
  } }; }
}
["RateLimitError", "AuthenticationError", "APIConnectionError"].forEach((n) => { FakeAnthropic[n] = class extends Error {}; });

const origLoad = Module._load;
Module._load = function (req, ...rest) {
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
  ["chat(case)", { mode: "chat", scene: "case", caseText: "a parent", messages: opening }],
  ["translate", { mode: "translate", text: "こんにちは" }],
  ["explain", { mode: "explain", en: "Hello.", ja: "こんにちは" }],
  ["review", { mode: "review", caseText: "a parent", facts: [], model: ["open"], parts: [{ id: "open", title: "はじまり", en: ["Hi"] }], transcript: "Doctor: Hi" }]
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
