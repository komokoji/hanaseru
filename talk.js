/* Hanaseru — 🗣 AI会話（FR-12）と ✍️ 英訳コーチ（FR-17）の画面側
   ・Cloud Functions `hanaseruChat`（asia-northeast1）を Firebase Auth 付きで呼ぶ。ログイン必須（院長のみ）
   ・相手役の返事は音声で読み上げ、院長は 🎤（音声入力）か文字で返す
   ・「言い直し」と「英訳」は 🔖保存 で state.mine に入り、瞬発トレ／シャドーイングでリピートできる */
import { getApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-functions.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const H = window.Hanaseru;
const call = httpsCallable(getFunctions(getApp(), "asia-northeast1"), "hanaseruChat");
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

let scene = "clinic";
let caseCtx = null;     // 🧩 組み立て練習の症例（scene "case" のときだけ）
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
  if (scene !== "case") caseCtx = null;
  setNote(caseCtx ? "症例：" + caseCtx.title + "（親役と話して、最後に 📋 ふり返り）" : "話し終えたら 📋 ふり返り（3つの物差しで見る）");
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
  H.bumpTalk(1);
  await ask(false, text);
}

async function ask(opening, said) {
  setBusy(true);
  try {
    const res = await call({ mode: "chat", scene, caseText: caseCtx ? caseCtx.parent : "", messages: history });
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
    const row = (label, en, note, ja) => '<div class="clrow"><div class="cltext"><div class="clja" style="font-size:12px;color:var(--sub)">' + label + '</div><div class="clen" style="margin-top:0">' + esc(en) + '</div>'
      + (note ? '<div class="clja" style="font-size:13px;color:var(--sub);margin-top:2px">' + esc(note) + '</div>' : '')
      + '<div class="speakrow" style="margin-top:6px"><button class="speak" data-say="' + esc(en) + '">🔊</button><button class="speak" data-save-en="' + esc(en) + '" data-save-ja="' + esc(ja) + '">🔖 保存</button></div></div></div>';
    // 院長の型：王道1本を覚える → 文法・ニュアンスを理解 → 類似2つは眺める
    out.innerHTML = row("① 王道（まずこれを覚える）", r.en, "", text)
      + explainHtml({ chunks: r.chunks || [], grammar: r.grammar, swap: null })
      + '<p class="muted" style="font-size:12px;margin:12px 0 0">② 類似（眺めるだけでOK）</p>'
      + row("もう一つの王道", r.alt, r.alt_ja, text) + row("ていねいに", r.polite, r.polite_ja, text);
    H.speak(r.en);
  } catch (e) {
    out.innerHTML = '<p class="muted">できませんでした：' + esc(e && (e.message || e.code) || e) + '</p>';
  } finally { setBusy(false); }
}

// ---- ❓ 解説（かたまりの意味＋文法＋言い換え）。一度出したら Firestore hanaseru_notes/{cardId} に保存＝次から即・端末共通 ----
const db = getFirestore(getApp());
const noteCache = {};
function explainHtml(r) {
  return '<div class="xp">'
    + '<div class="xpchunks">' + r.chunks.map((c) => '<div class="xpc"><b>' + esc(c.en) + '</b><span>' + esc(c.ja) + '</span>' + (c.note ? '<em>' + esc(c.note) + '</em>' : '') + '</div>').join("") + '</div>'
    + (r.grammar ? '<div class="xpg">📐 ' + esc(r.grammar) + '</div>' : '')
    + (r.swap && r.swap.en ? '<div class="xpg">🔁 別の言い方：<b>' + esc(r.swap.en) + '</b>　' + esc(r.swap.ja) + ' <button class="speak" data-say="' + esc(r.swap.en) + '" style="padding:2px 8px;font-size:12px">🔊</button></div>' : '')
    + '</div>';
}
async function explain(box, id, ja, en) {
  if (!box) return;
  if (!box.hidden && box.dataset.id === id) { box.hidden = true; return; }   // 2回目のタップで閉じる
  box.hidden = false; box.dataset.id = id;
  if (noteCache[id]) { box.innerHTML = explainHtml(noteCache[id]); return; }
  box.innerHTML = '<p class="muted">解説を用意しています…</p>';
  try {
    if (getAuth(getApp()).currentUser) {
      const snap = await getDoc(doc(db, "hanaseru_notes", id));
      if (snap.exists() && snap.data().en === en) { noteCache[id] = snap.data().note; box.innerHTML = explainHtml(noteCache[id]); return; }
    } else { box.innerHTML = '<p class="muted">解説は Google ログイン後に使えます（画面下のボタン）。</p>'; return; }
    const res = await call({ mode: "explain", ja, en });
    noteCache[id] = res.data.result;
    box.innerHTML = explainHtml(noteCache[id]);
    setDoc(doc(db, "hanaseru_notes", id), { en, ja, note: noteCache[id], updatedAt: serverTimestamp() }).catch(() => {});
  } catch (e) {
    box.innerHTML = '<p class="muted">解説を取れませんでした：' + esc(e && (e.message || e.code) || e) + '</p>';
  }
}

// ---- 🧩 症例の親役 → ふり返り（使えた部品・抜けた部品）----
document.addEventListener("hanaseru:case", (e) => { caseCtx = e.detail; if (!SR) $("tkMic").hidden = true; start("case"); });
async function review() {
  if (busy) return;
  if (needLogin()) return;
  const talk = history.slice(1);   // 先頭は「場面を始めて」の合図なので外す
  if (talk.filter((m) => m.role === "user").length < 2) { setNote("もう少し話してから、ふり返りを押してください（院長の発言が2回以上）。"); return; }
  setBusy(true); setNote("ふり返りをしています…");
  try {
    const transcript = talk.map((m) => (m.role === "user" ? "Doctor: " : "Parent: ") + m.content).join("\n");
    const parts = caseCtx ? H.parts().map((p) => ({ id: p.id, title: p.title, en: p.en.slice(0, 3) })) : [];
    const res = await call({ mode: "review", scene, caseText: caseCtx ? caseCtx.parent : "", facts: caseCtx ? caseCtx.facts : [], model: caseCtx ? caseCtx.model : [], parts, transcript });
    const r = res.data.result;
    const b2 = '<div class="xpg" style="margin-top:0"><b>🎯 3つの物差し</b></div>'
      + '<div class="xpg">① 意見＋理由：' + esc(r.opinion_ja) + '</div>'
      + '<div class="xpg">② その場で返す・聞き返す：' + esc(r.respond_ja) + '</div>'
      + '<div class="xpg">③ 詰まったら言い換える：' + esc(r.rephrase_ja) + '</div>';
    const chip = (pid) => '<span class="chip on" style="font-size:12px;padding:4px 10px">' + esc(H.partTitle(pid)) + '</span>';
    const missed = (r.missed || []).map((pid) => '<div style="margin-top:8px;font-weight:700;color:var(--amber)">⚠️ ' + esc(H.partTitle(pid)) + '</div>'
      + H.partCards(pid).map((c) => '<div class="clrow"><div class="cltext"><div class="clen" style="margin-top:0">' + esc(c.en) + '</div><div class="clja" style="font-size:13px;color:var(--sub)">' + esc(c.ja) + '</div></div><button class="speak" data-say="' + esc(c.en) + '" style="padding:4px 10px">🔊</button></div>').join("")).join("");
    const html = '<div class="xp">' + b2
      + (caseCtx ? '<div class="xpg"><b>使えた部品</b></div><div class="chips" style="margin-top:4px">' + ((r.used || []).map(chip).join("") || '<span class="muted">なし</span>') + '</div>'
        + (missed ? '<div class="xpg"><b>この症例なら足したい部品</b>（王道の文）</div>' + missed : '<div class="xpg">抜けた部品はありません。</div>') : "")
      + '<div class="xpg">👍 ' + esc(r.good_ja) + '</div>'
      + '<div class="xpg">➡️ ' + esc(r.next_ja) + '</div></div>';
    $("tkLog").insertAdjacentHTML("beforeend", html);
    $("tkLog").scrollTop = $("tkLog").scrollHeight;
    setNote("");
  } catch (e) {
    setNote("ふり返りができませんでした：" + (e && (e.message || e.code) || e));
  } finally { setBusy(false); }
}

// ---- 🎤 1分で語る：お題 → 声だけ60秒 → 3つの物差し → 別の言い方で30秒 ----
const MONO_TOPICS = [
  "自分の仕事を、初対面の人に説明する", "なぜ外科から栄養に来たのか", "一番大事にしていること", "今回の旅で楽しみなこと",
  "最近うれしかったこと", "子どもの便秘について、親に一番伝えたいこと", "栄養外来で何をしているか", "日本のクリニックはどんな所か",
  "今日はどんな一日だったか", "自分の家族について"
];
window.HANASERU_MONO_TOPICS = MONO_TOPICS;
let moTopic = 0, moRec = null, moTick = null, moText = "", moPrev = "", moSecs = 60;
function moRender() {
  // 節目が来ているお題（📅）を先に。語るたびに次の節目へ（翌日→3日→1週→2週→1か月→3か月＝札と同じ）
  const order = MONO_TOPICS.map((t, i) => i).sort((a, b) => (H.monoDue(MONO_TOPICS[a]) ? 0 : 1) - (H.monoDue(MONO_TOPICS[b]) ? 0 : 1));
  $("moTopics").innerHTML = order.map((i) => { const t = MONO_TOPICS[i], due = H.monoDue(t), box = H.monoBox(t);
    return '<button class="chip' + (i === moTopic ? ' on' : '') + '" data-action="moTopic" data-idx="' + i + '">' + (due ? "📅 " : "") + esc(t) + (box ? " ・" + box + "回目済" : "") + '</button>'; }).join("");
  $("moTopic").textContent = MONO_TOPICS[moTopic];
}
document.addEventListener("hanaseru:mono", () => { const first = MONO_TOPICS.findIndex((t) => H.monoDue(t)); moTopic = first >= 0 ? first : 0; moRender(); $("moOut").innerHTML = ""; $("moAgain").hidden = true; $("moNote").textContent = SR ? "" : "この端末は音声入力に対応していません（iPhone の Safari か Chrome で）。"; });
function moStart(secs) {
  if (!SR) return;
  if (needLogin()) return;
  moSecs = secs; moText = "";
  $("moStart").hidden = true; $("moStop").hidden = false; $("moOut").innerHTML = ""; $("moAgain").hidden = true;
  $("moNote").textContent = "🔴 聞いています。止まっても、言い換えて続けてください。";
  moRec = new SR(); moRec.lang = "en-US"; moRec.interimResults = true; moRec.continuous = true;
  moRec.onresult = (e) => { let fin = "", tmp = ""; for (let i = 0; i < e.results.length; i++) { if (e.results[i].isFinal) fin += e.results[i][0].transcript + " "; else tmp += e.results[i][0].transcript; } moText = (fin + tmp).trim(); };
  moRec.onend = () => { if (moTick) { try { moRec.start(); } catch (e) {} } };   // iOS は途中で切れるので、時間内は再開
  moRec.onerror = () => {};
  moRec.start();
  const t0 = Date.now();
  moTick = setInterval(() => {
    const left = Math.max(0, moSecs - Math.floor((Date.now() - t0) / 1000));
    $("moTimer").textContent = Math.floor(left / 60) + ":" + String(left % 60).padStart(2, "0");
    if (left <= 0) moStop();
  }, 250);
}
async function moStop() {
  if (!moTick) return;
  clearInterval(moTick); moTick = null;
  try { moRec && moRec.stop(); } catch (e) {}
  $("moStart").hidden = false; $("moStop").hidden = true; $("moTimer").textContent = "1:00";
  await new Promise((r) => setTimeout(r, 600));
  const said = moText.trim();
  if (!said) { $("moNote").textContent = "声が拾えませんでした。もう一度どうぞ。"; return; }
  H.bumpTalk(3);
  $("moNote").textContent = "3つの物差しで見ています…";
  $("moOut").innerHTML = '<div class="bubble me" style="max-width:100%">' + esc(said) + '</div>';
  setBusy(true);
  try {
    const transcript = (moPrev ? "Doctor (first try): " + moPrev + "\n" : "") + "Doctor" + (moPrev ? " (second try, said another way)" : "") + ": " + said;
    const res = await call({ mode: "review", scene: "monologue", caseText: "Topic (Japanese): " + MONO_TOPICS[moTopic], transcript });
    const r = res.data.result;
    $("moOut").insertAdjacentHTML("beforeend", '<div class="xp"><div class="xpg" style="margin-top:0"><b>🎯 3つの物差し</b></div>'
      + '<div class="xpg">① 意見＋理由：' + esc(r.opinion_ja) + '</div><div class="xpg">② その場で返す・聞き返す：' + esc(r.respond_ja) + '</div><div class="xpg">③ 詰まったら言い換える：' + esc(r.rephrase_ja) + '</div>'
      + '<div class="xpg">👍 ' + esc(r.good_ja) + '</div><div class="xpg">➡️ ' + esc(r.next_ja) + '</div></div>');
    $("moNote").textContent = "";
    moPrev = said; $("moAgain").hidden = false;
    H.monoDone(MONO_TOPICS[moTopic]); moRender();
  } catch (e) { $("moNote").textContent = "見られませんでした：" + (e && (e.message || e.code) || e); }
  finally { setBusy(false); }
}

document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-say],[data-save-en],[data-action],[data-scene]"); if (!t) return;
  if (t.getAttribute("data-action") === "explain") {
    const c = H.current(t.getAttribute("data-where")); if (!c) return;
    explain($(t.getAttribute("data-box")), c.id, c.ja, c.en); return;
  }
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
  else if (a === "tkReview") review();
  else if (a === "moTopic") { moTopic = +t.getAttribute("data-idx"); moPrev = ""; moRender(); $("moOut").innerHTML = ""; $("moAgain").hidden = true; }
  else if (a === "moStart") { moPrev = ""; moStart(60); }
  else if (a === "moStop") moStop();
  else if (a === "moAgain") moStart(30);
  else if (a === "trGo") translate();
});
$("tkInput") && $("tkInput").addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } });
