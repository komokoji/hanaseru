/* Hanaseru — 最小アプリのロジック（段階1 MVP）
   ・毎日1ルーティン：日本語を見て声に出す → 言えた/まだ → 次
   ・間隔反復（Leitnerボックス）：言えた行は間隔が延び、詰まった行は翌日また出る
   ・進捗はこの端末の localStorage にだけ保存（サーバーなし・オフラインOK）
   ※ 判定は「自己申告」。発音の自動採点は段階3（ELSA等の借りエンジン）で。 */
(function () {
  "use strict";

  var CARDS = window.HANASERU_CARDS || [];
  var KEY = "hanaseru.v1";
  var SESSION_SIZE = 12;              // 1日の枚数
  var INTERVALS = [0, 1, 2, 4, 8, 16]; // ボックス→次に出るまでの日数

  // ---- 日付（ローカル真夜中基準の通し番号） ----
  function dayNum(d) { d = d || new Date(); return Math.floor(new Date(d).setHours(0, 0, 0, 0) / 86400000); }

  // ---- 保存/読み込み ----
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch (e) { return {}; }
  }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }

  var state = load();
  if (!state.cards) state.cards = {};        // id -> {box, due(dayNum)}
  if (state.streak == null) state.streak = 0;
  if (state.lastDone == null) state.lastDone = null; // 最後にセッション完了した dayNum
  if (!state.rate) state.rate = "slow";      // 音声速度 slow/fast
  if (!state.captures) state.captures = [];  // その場で貯めた「言いたいこと」（日本語・未英訳）

  function cardState(id) {
    if (!state.cards[id]) state.cards[id] = { box: 0, due: dayNum() };
    return state.cards[id];
  }

  // ---- 今日の出題を組む ----
  function buildQueue(domain) {
    var today = dayNum();
    var pool = CARDS.filter(function (c) { return domain === "all" || c.domain === domain; });
    var due = [], fresh = [];
    pool.forEach(function (c) {
      var st = state.cards[c.id];
      if (!st) fresh.push(c);                         // 未学習
      else if (st.due <= today) due.push(c);           // 復習期限
    });
    shuffle(due); shuffle(fresh);
    var q = due.concat(fresh).slice(0, SESSION_SIZE);
    shuffle(q);
    return q;
  }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } }

  // ---- 採点 ----
  function grade(card, ok) {
    var st = cardState(card.id);
    if (ok) st.box = Math.min(st.box + 1, INTERVALS.length - 1);
    else st.box = 0;
    st.due = dayNum() + INTERVALS[st.box];
    save(state);
  }

  // ---- 進捗 ----
  function mastered(domain) {
    return CARDS.filter(function (c) {
      if (domain !== "all" && c.domain !== domain) return false;
      var st = state.cards[c.id]; return st && st.box >= 4;
    }).length;
  }
  function totalIn(domain) { return CARDS.filter(function (c) { return domain === "all" || c.domain === domain; }).length; }

  function finishSession() {
    var today = dayNum();
    if (state.lastDone === today) return;              // 二重加算しない
    if (state.lastDone === today - 1) state.streak += 1;
    else state.streak = 1;
    state.lastDone = today;
    save(state);
  }

  // ---- 音声（英語の手本） ----
  function speak(text) {
    try {
      if (!window.speechSynthesis) return;
      var u = new SpeechSynthesisUtterance(String(text).replace(/___/g, "…"));
      u.lang = "en-US"; u.rate = (state.rate === "fast") ? 1.05 : 0.85;
      window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  // ---- 画面 ----
  var el = {};
  ["setup", "study", "done", "cardFront", "cardBack", "ja", "en", "note",
    "progress", "streak", "counter", "domainName"].forEach(function (id) { el[id] = document.getElementById(id); });

  var queue = [], idx = 0, curDomain = "all", revealed = false;

  function startSession(domain) {
    curDomain = domain;
    queue = buildQueue(domain);
    idx = 0;
    if (queue.length === 0) { showDone(true); return; }
    show(el.setup, false); show(el.done, false); show(el.study, true);
    renderCard();
  }

  function renderCard() {
    var c = queue[idx];
    revealed = false;
    el.ja.textContent = c.ja;
    el.en.textContent = c.en;
    var jb = document.getElementById("jaBack"); if (jb) jb.textContent = c.ja;
    el.counter.textContent = (idx + 1) + " / " + queue.length;
    show(el.cardBack, false); show(el.cardFront, true);
  }

  function reveal() {
    revealed = true;
    show(el.cardFront, false); show(el.cardBack, true);
    updateRateBtn();
    speak(queue[idx].en);
  }

  function answer(ok) {
    grade(queue[idx], ok);
    idx += 1;
    if (idx >= queue.length) { finishSession(); showDone(false); }
    else renderCard();
  }

  function showDone(empty) {
    show(el.study, false); show(el.setup, false); show(el.done, true);
    var m = mastered(curDomain), t = totalIn(curDomain);
    var ds = document.getElementById("doneStat");
    if (ds) ds.textContent = "身についた（4箱以上）：" + m + " / " + t + "　・　連続 " + state.streak + " 日";
    el.streak.textContent = "連続 " + state.streak + " 日";
    el.done.querySelector("[data-msg]").textContent =
      empty ? "この範囲は今日ぶんの出題がありません。別の範囲を選ぶか、また明日。"
            : "今日の練習、完了です。";
  }

  function backToSetup() {
    show(el.study, false); show(el.done, false); show(el.setup, true);
    renderSetup();
  }

  function renderSetup() {
    el.streak.textContent = "連続 " + state.streak + " 日";
    el.progress.textContent = "身についた：" + mastered("all") + " / " + totalIn("all");
    capToggle(false); renderCaptures();
  }

  function show(node, on) { if (node) node.hidden = !on; }

  // ---- 音声速度トグル ----
  function updateRateBtn() {
    var b = document.getElementById("rateBtn");
    if (b) b.textContent = (state.rate === "fast") ? "🐇 実速" : "🐢 ゆっくり";
  }
  function toggleRate() {
    state.rate = (state.rate === "fast") ? "slow" : "fast";
    save(state); updateRateBtn();
    if (revealed) speak(queue[idx].en);
  }

  // ---- 「＋言いたいこと」捕獲（その場は日本語で貯めるだけ） ----
  function capToggle(on) { var box = document.getElementById("capBox"); if (box) box.hidden = !on; }
  function capOpen() { capToggle(true); renderCaptures(); var i = document.getElementById("capInput"); if (i) i.focus(); }
  function capSave() {
    var i = document.getElementById("capInput"); if (!i) return;
    var v = (i.value || "").trim(); if (!v) return;
    state.captures.push({ ja: v, ts: Date.now() }); save(state);
    i.value = ""; renderCaptures();
  }
  function capDelete(k) { state.captures.splice(k, 1); save(state); renderCaptures(); }
  function capCopy() {
    var txt = state.captures.map(function (c) { return c.ja; }).join("\n");
    try {
      navigator.clipboard.writeText(txt);
      var b = document.getElementById("capCopyBtn");
      if (b) { var o = b.textContent; b.textContent = "📋 コピーしました"; setTimeout(function () { b.textContent = o; }, 1500); }
    } catch (e) {}
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]; }); }
  function renderCaptures() {
    var list = document.getElementById("capList"); if (!list) return;
    if (!state.captures.length) {
      list.innerHTML = '<p class="muted" style="margin:8px 0">まだありません。日本語で「これ言いたい」を書いて「ためる」。あとで私（Claude）が英語にして辞書に入れます。</p>';
    } else {
      list.innerHTML = state.captures.map(function (c, k) {
        return '<div class="capitem"><span>' + escapeHtml(c.ja) + '</span><button class="capx" data-action="capDel" data-idx="' + k + '">×</button></div>';
      }).join("");
    }
    var btn = document.getElementById("capCopyBtn"); if (btn) btn.hidden = !state.captures.length;
  }

  // ---- イベント ----
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-action]");
    if (!t) return;
    var a = t.getAttribute("data-action");
    if (a === "start") startSession(t.getAttribute("data-domain"));
    else if (a === "reveal") reveal();
    else if (a === "ok") answer(true);
    else if (a === "ng") answer(false);
    else if (a === "speak") speak(queue[idx].en);
    else if (a === "home") backToSetup();
    else if (a === "rate") toggleRate();
    else if (a === "capOpen") capOpen();
    else if (a === "capCancel") capToggle(false);
    else if (a === "capSave") capSave();
    else if (a === "capCopy") capCopy();
    else if (a === "capDel") capDelete(+t.getAttribute("data-idx"));
  });
  // カード表面はどこをタップしても英語を出す
  if (el.cardFront) el.cardFront.addEventListener("click", function () { if (!revealed) reveal(); });

  renderSetup();

  // service worker（オフライン用・任意）
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  }
})();
