/* Hanaseru — 🗣 AI会話（FR-12）と ✍️ 英訳コーチ（FR-17）の画面側
   ・Cloud Functions `hanaseruChat`（asia-northeast1）を Firebase Auth 付きで呼ぶ。ログイン必須（院長のみ）
   ・相手役の返事は音声で読み上げ、院長は 🎤（音声入力）か文字で返す
   ・「言い直し」と「英訳」は 🔖保存 で state.mine に入り、瞬発トレ／シャドーイングでリピートできる */
import { getApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-functions.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const H = window.Hanaseru;
const call = httpsCallable(getFunctions(getApp(), "asia-northeast1"), "hanaseruChat");
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

let scene = "clinic";
let history = [];       // {role, content}
let busy = false;

// ---- 🎤 音声入力（Web Speech API。iOS Safari / Chrome で動く。無ければボタンを隠す） ----
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null;
function micToggle() {
  const btn = $("tkMic");
  if (rec) { rec.stop(); return; }
  rec = new SR(); rec.lang = "en-US"; rec.interimResults = true; rec.continuous = false;
  btn.textContent = "🔴 聞いています…（もう一度押すと止まる）";
  let finalText = "";
  rec.onresult = (e) => {
    let t = "";
    for (let i = e.resultIndex; i < e.results.length; i++) { t += e.results[i][0].transcript; if (e.results[i].isFinal) finalText += e.results[i][0].transcript; }
    $("tkInput").value = (finalText || t).trim();
  };
  rec.onend = () => { rec = null; btn.textContent = "🎤 話す"; if ($("tkInput").value.trim()) send(); };
  rec.onerror = () => { rec = null; btn.textContent = "🎤 話す"; };
  rec.start();
}

function needLogin() {
  if (getAuth(getApp()).currentUser) return false;
  setNote("まず下の「Google でログインして同期」でログインしてください（AI会話は院長専用です）。");
  return true;
}
function setNote(t) { const n = $("tkNote"); if (n) n.textContent = t || ""; }
function setBusy(b) { busy = b; const s = $("tkSend"); if (s) { s.disabled = b; s.textContent = b ? "…" : "送る"; } }

function addBubble(role, text, extra) {
  const log = $("tkLog"); if (!log) return;
  const div = document.createElement("div");
  div.className = "bubble " + role;
  div.innerHTML = '<div class="btext">' + esc(text) + '</div>' + (extra || "");
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}
function feedbackHtml(r, said) {
  const same = r.better.trim() === said.trim();
  return '<div class="fb">'
    + (same ? '<div class="fbok">👍 自然です</div>'
            : '<div class="fbline">💬 こう言うと自然：<b>' + esc(r.better) + '</b><span class="fbja">' + esc(r.better_ja) + '</span></div>')
    + '<div class="fbtip">' + esc(r.tip) + '</div>'
    + '<div class="speakrow"><button class="speak" data-say="' + esc(r.better) + '">🔊 聞く</button>'
    + '<button class="speak" data-save-en="' + esc(r.better) + '" data-save-ja="' + esc(r.better_ja) + '">🔖 保存してリピート</button></div>'
    + '</div>';
}

async function start(newScene) {
  if (needLogin()) return;
  scene = newScene || scene;
  history = [];
  $("tkLog").innerHTML = "";
  document.querySelectorAll("#tkChips [data-scene]").forEach((c) => c.classList.toggle("on", c.getAttribute("data-scene") === scene));
  setNote("");
  // 相手役に先に話してもらう（院長の最初の一言は "Hello." 扱い＝FBは出さない）
  history.push({ role: "user", content: "(The learner walks in and greets you. Start the scene with your first line.)" });
  await ask(true);
}

async function send() {
  if (busy) return;
  if (needLogin()) return;
  const text = $("tkInput").value.trim(); if (!text) return;
  $("tkInput").value = "";
  addBubble("me", text);
  history.push({ role: "user", content: text });
  await ask(false, text);
}

async function ask(opening, said) {
  setBusy(true);
  try {
    const res = await call({ mode: "chat", scene, messages: history });
    const r = res.data.result;
    history.push({ role: "assistant", content: r.reply });
    if (!opening && said) {
      const log = $("tkLog"); const last = log.lastElementChild;
      if (last) last.insertAdjacentHTML("beforeend", feedbackHtml(r, said));
    }
    addBubble("ai", r.reply, '<div class="speakrow"><button class="speak" data-say="' + esc(r.reply) + '">🔊 もう一度</button></div>');
    H.speak(r.reply);
    if (r.ended) setNote("この場面はここまで。別の場面を選ぶか、もう一度どうぞ。");
  } catch (e) {
    history.pop();
    setNote("送れませんでした：" + (e && (e.message || e.code) || e));
  } finally { setBusy(false); }
}

// ---- ✍️ 英訳コーチ ----
async function translate() {
  if (busy) return;
  if (needLogin()) return;
  const text = $("trInput").value.trim(); if (!text) return;
  setBusy(true); const out = $("trOut"); out.innerHTML = '<p class="muted">英語にしています…</p>';
  try {
    const res = await call({ mode: "translate", text });
    const r = res.data.result;
    const row = (label, en) => '<div class="clrow"><div class="cltext"><div class="clja" style="font-size:12px;color:var(--sub)">' + label + '</div><div class="clen" style="margin-top:0">' + esc(en) + '</div>'
      + '<div class="speakrow" style="margin-top:6px"><button class="speak" data-say="' + esc(en) + '">🔊</button><button class="speak" data-save-en="' + esc(en) + '" data-save-ja="' + esc(text) + '">🔖 保存</button></div></div></div>';
    out.innerHTML = row("いちばん自然", r.en) + row("くだけて", r.casual) + row("ていねいに", r.polite)
      + '<p class="stat" style="white-space:pre-wrap;margin-top:10px">' + esc(r.nuance_ja) + '</p>';
    H.speak(r.en);
  } catch (e) {
    out.innerHTML = '<p class="muted">できませんでした：' + esc(e && (e.message || e.code) || e) + '</p>';
  } finally { setBusy(false); }
}

document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-say],[data-save-en],[data-action],[data-scene]"); if (!t) return;
  if (t.hasAttribute("data-say")) { H.speak(t.getAttribute("data-say")); return; }
  if (t.hasAttribute("data-save-en")) {
    const ok = H.addMine(t.getAttribute("data-save-ja"), t.getAttribute("data-save-en"));
    t.textContent = ok ? "🔖 保存しました" : "🔖 保存済み"; return;
  }
  if (t.hasAttribute("data-scene")) { start(t.getAttribute("data-scene")); return; }
  const a = t.getAttribute("data-action");
  if (a === "talk") { if (!SR) $("tkMic").hidden = true; if (!history.length) start(scene); }
  else if (a === "tkSend") send();
  else if (a === "tkMic") micToggle();
  else if (a === "tkRestart") start(scene);
  else if (a === "trGo") translate();
});
$("tkInput") && $("tkInput").addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } });
