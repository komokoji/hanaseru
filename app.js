/* Hanaseru — 最小アプリのロジック（段階1 MVP）
   ・毎日1ルーティン：日本語を見て声に出す → 言えた/まだ → 次
   ・間隔反復（Leitnerボックス）：言えた行は間隔が延び、詰まった行は翌日また出る
   ・進捗はこの端末の localStorage にだけ保存（サーバーなし・オフラインOK）
   ※ 判定は「自己申告」。発音の自動採点は段階3（ELSA等の借りエンジン）で。 */
(function () {
  "use strict";

  var LISTEN = window.HANASERU_LISTEN || [];
  var CARDS = (window.HANASERU_CARDS || []).concat(LISTEN.reduce(function (a, u) { return a.concat(u.phrases || []); }, []));
  var KEY = "hanaseru.v1";
  var SESSION_SIZE = 12;              // 1日の枚数
  var INTERVALS = [0, 1, 3, 7, 14, 30, 90]; // ボックス→次に出るまでの日数（記憶が伸びる節目：翌日→3日→1週→2週→1ヶ月→3ヶ月）

  // ---- 日付（ローカル真夜中基準の通し番号） ----
  function dayNum(d) { d = d || new Date(); return Math.floor(new Date(d).setHours(0, 0, 0, 0) / 86400000); }

  // ---- 保存/読み込み ----
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch (e) { return {}; }
  }
  function save(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
    saveListeners.forEach(function (f) { try { f(); } catch (e) {} });
  }

  var state = load();
  if (!state.cards) state.cards = {};        // id -> {box, due(dayNum)}
  if (state.streak == null) state.streak = 0;
  if (state.lastDone == null) state.lastDone = null; // 最後にセッション完了した dayNum
  if (!state.rate) state.rate = "slow";      // 音声速度 slow/fast
  if (!state.captures) state.captures = [];  // その場で貯めた「言いたいこと」（日本語・未英訳）
  if (!state.mine) state.mine = [];          // 🔖 アプリ内で保存したフレーズ（AI会話・英訳コーチから）{id, ja, en, ts}
  var saveListeners = [];
  function allCards() {                      // 辞書（data.js）＋院長が保存したフレーズ（state.mine）
    return CARDS.concat(state.mine.map(function (m) { return { id: m.id, domain: "mine", ja: m.ja, en: m.en }; }));
  }

  function cardState(id) {
    if (!state.cards[id]) state.cards[id] = { box: 0, due: dayNum() };
    return state.cards[id];
  }

  // ---- 今日の出題を組む ----
  function buildQueue(domain) {
    var today = dayNum();
    var pool = allCards().filter(function (c) { return domain === "all" || c.domain === domain; });
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
    return allCards().filter(function (c) {
      if (domain !== "all" && c.domain !== domain) return false;
      var st = state.cards[c.id]; return st && st.box >= 4;
    }).length;
  }
  function totalIn(domain) { return allCards().filter(function (c) { return domain === "all" || c.domain === domain; }).length; }

  function finishSession() {
    var today = dayNum();
    if (state.lastDone === today) return;              // 二重加算しない
    if (state.lastDone === today - 1) state.streak += 1;
    else state.streak = 1;
    state.lastDone = today;
    save(state);
  }

  // ---- 音声（英語の手本） ----
  function speak(text, lang) {
    try {
      if (!window.speechSynthesis) return;
      var u = new SpeechSynthesisUtterance(String(text).replace(/___/g, "…"));
      u.lang = lang || "en-US"; u.rate = (state.rate === "fast") ? 1.05 : 0.85;
      var vs = window.speechSynthesis.getVoices().filter(function (v) { return v.lang.replace("_", "-") === u.lang; });
      if (vs.length) u.voice = vs[0];   // 英国訛りなど、指定の訛りの声があれば使う
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
    hideMain();
    show(el.study, true);
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
    hideMain();
    show(el.setup, true);
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
    var bs = document.querySelectorAll(".rateBtn");
    for (var i = 0; i < bs.length; i++) bs[i].textContent = (state.rate === "fast") ? "🐇 実速" : "🐢 ゆっくり";
  }
  function highlightChips(sel, dom) {
    var chips = document.querySelectorAll(sel + " [data-domain]");
    for (var i = 0; i < chips.length; i++) chips[i].classList.toggle("on", chips[i].getAttribute("data-domain") === dom);
  }
  function hideMain() {
    show(el.setup, false); show(el.study, false); show(el.done, false);
    var c = document.getElementById("checklist"); if (c) c.hidden = true;
    var s = document.getElementById("shadow"); if (s) s.hidden = true;
    var l = document.getElementById("listen"); if (l) l.hidden = true;
    var tk = document.getElementById("talk"); if (tk) tk.hidden = true;
    var co = document.getElementById("coach"); if (co) co.hidden = true;
  }

  // ---- 🎧 聞き取り（実際に耳にした英語を、聞く→意味→英文→口に出す の順で） ----
  var lsUnit = 0, lsIdx = 0, lsShown = false;
  function openListen() { hideMain(); var l = document.getElementById("listen"); if (l) l.hidden = false; lsIdx = 0; renderListen(); }
  function renderListen() {
    var u = LISTEN[lsUnit]; if (!u) return;
    var p = u.passages[lsIdx];
    lsShown = false;
    var t = document.getElementById("lsTitle"); if (t) t.textContent = u.title;
    var sc = document.getElementById("lsScene"); if (sc) sc.textContent = u.scene;
    var pt = document.getElementById("lsPassage"); if (pt) pt.textContent = p.title;
    var cn = document.getElementById("lsCounter"); if (cn) cn.textContent = (lsIdx + 1) + " / " + u.passages.length;
    var body = document.getElementById("lsBody"); if (body) body.hidden = true;
    var en = document.getElementById("lsEn"); if (en) en.textContent = p.en;
    var ja = document.getElementById("lsJa"); if (ja) ja.textContent = "要点：" + p.ja;
    var pk = document.getElementById("lsPick"); if (pk) pk.innerHTML = (p.pick || []).map(function (x) { return "<li>" + escapeHtml(x) + "</li>"; }).join("");
    var ph = document.getElementById("lsPhrases");
    if (ph) ph.innerHTML = u.phrases.map(function (c) {
      return '<div class="clrow"><div class="cltext" data-action="lsSpeak" data-id="' + c.id + '">'
        + '<div class="clen" style="margin-top:0">' + escapeHtml(c.en) + '</div><div class="clja" style="font-size:14px;color:var(--sub)">' + escapeHtml(c.ja) + '</div></div></div>';
    }).join("");
    updateRateBtn();
  }
  function listenPlay() { var u = LISTEN[lsUnit]; if (u) speak(u.passages[lsIdx].en, u.voice); }
  function listenShow() { var b = document.getElementById("lsBody"); if (b) { b.hidden = !b.hidden; lsShown = !b.hidden; } }
  function listenNext() { var u = LISTEN[lsUnit]; if (lsIdx < u.passages.length - 1) { lsIdx++; renderListen(); } else backToSetup(); }
  function listenPrev() { if (lsIdx > 0) { lsIdx--; renderListen(); } }

  // ---- 🎧 シャドーイング（手本を聞いて追いかける＝シャドテンの核） ----
  var shQueue = [], shIdx = 0, shDomain = "all";
  function openShadow() {
    hideMain();
    var s = document.getElementById("shadow"); if (s) s.hidden = false;
    buildShadow();
  }
  function setShadowDomain(d) { shDomain = d; buildShadow(); }
  function buildShadow() {
    shQueue = allCards().filter(function (c) { return shDomain === "all" || c.domain === shDomain; });
    shuffle(shQueue); shIdx = 0;
    highlightChips("#shChips", shDomain);
    renderShadow();
  }
  function renderShadow() {
    if (!shQueue.length) return;
    var c = shQueue[shIdx];
    var en = document.getElementById("shEn"); if (en) en.textContent = String(c.en).replace(/___/g, "…");
    var ja = document.getElementById("shJa"); if (ja) ja.textContent = c.ja;
    var cn = document.getElementById("shCounter"); if (cn) cn.textContent = (shIdx + 1) + " / " + shQueue.length;
    updateRateBtn();
    speak(c.en);
  }
  function shadowReplay() { if (shQueue[shIdx]) speak(shQueue[shIdx].en); }
  function shadowNext() { if (shIdx < shQueue.length - 1) { shIdx++; renderShadow(); } else backToSetup(); }
  function shadowPrev() { if (shIdx > 0) { shIdx--; renderShadow(); } }
  function toggleRate() {
    state.rate = (state.rate === "fast") ? "slow" : "fast";
    save(state); updateRateBtn();
    if (revealed && !el.study.hidden) speak(queue[idx].en);
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

  // ---- チェックリスト（覚えたかのテストでなく「見た・練習した」を潰す） ----
  var clDomain = "all";
  function cardById(id) { var cs = allCards(); for (var i = 0; i < cs.length; i++) if (cs[i].id === id) return cs[i]; return null; }
  function openChecklist() {
    hideMain();
    var c = document.getElementById("checklist"); if (c) c.hidden = false;
    renderChecklist();
  }
  function setClDomain(d) { clDomain = d; renderChecklist(); }
  function renderChecklist() {
    var list = document.getElementById("clList"); if (!list) return;
    var pool = allCards().filter(function (c) { return clDomain === "all" || c.domain === clDomain; });
    var done = pool.filter(function (c) { var s = state.cards[c.id]; return s && s.practiced; }).length;
    var cnt = document.getElementById("clCount"); if (cnt) cnt.textContent = "見た所：" + done + " / " + pool.length;
    list.innerHTML = pool.map(function (c) {
      var s = state.cards[c.id]; var on = s && s.practiced;
      return '<div class="clrow">'
        + '<button class="clcheck' + (on ? ' on' : '') + '" data-action="clCheck" data-id="' + c.id + '">' + (on ? '☑' : '☐') + '</button>'
        + '<div class="cltext" data-action="clShow" data-id="' + c.id + '">'
        + '<div class="clja">' + escapeHtml(c.ja) + '</div>'
        + '<div class="clen" id="clen-' + c.id + '" hidden>' + escapeHtml(c.en) + '</div>'
        + '</div></div>';
    }).join("");
    var chips = document.querySelectorAll("#clChips [data-domain]");
    for (var i = 0; i < chips.length; i++) {
      chips[i].classList.toggle("on", chips[i].getAttribute("data-domain") === clDomain);
    }
  }
  function clCheck(id) { var s = cardState(id); s.practiced = !s.practiced; save(state); renderChecklist(); }
  function clShow(id) {
    var e = document.getElementById("clen-" + id); if (!e) return;
    e.hidden = !e.hidden;
    if (!e.hidden) { var c = cardById(id); if (c) speak(c.en); }
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
    else if (a === "checklist") openChecklist();
    else if (a === "clDomain") setClDomain(t.getAttribute("data-domain"));
    else if (a === "clCheck") clCheck(t.getAttribute("data-id"));
    else if (a === "clShow") clShow(t.getAttribute("data-id"));
    else if (a === "shadow") openShadow();
    else if (a === "shDomain") setShadowDomain(t.getAttribute("data-domain"));
    else if (a === "shadowReplay") shadowReplay();
    else if (a === "shadowNext") shadowNext();
    else if (a === "shadowPrev") shadowPrev();
    else if (a === "listen") openListen();
    else if (a === "talk") { hideMain(); document.getElementById("talk").hidden = false; }   // 会話の中身は talk.js
    else if (a === "coach") { hideMain(); document.getElementById("coach").hidden = false; }
    else if (a === "lsPlay") listenPlay();
    else if (a === "lsShow") listenShow();
    else if (a === "lsNext") listenNext();
    else if (a === "lsPrev") listenPrev();
    else if (a === "lsSpeak") { var lc = cardById(t.getAttribute("data-id")); if (lc) speak(lc.en, LISTEN[lsUnit] && LISTEN[lsUnit].voice); }
  });
  // カード表面はどこをタップしても英語を出す
  if (el.cardFront) el.cardFront.addEventListener("click", function () { if (!revealed) reveal(); });

  // ---- ☁️ クラウド同期への公開口（cloud.js が使う） ----
  window.Hanaseru = {
    getState: function () { return state; },
    applyRemote: function (merged) {
      Object.keys(state).forEach(function (k) { delete state[k]; });
      Object.keys(merged).forEach(function (k) { state[k] = merged[k]; });
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
      if (!el.setup.hidden) renderSetup();
    },
    onChange: function (f) { saveListeners.push(f); },
    summary: function () {
      return { streak: state.streak, lastDone: state.lastDone,
               lastDoneISO: state.lastDone ? new Date(state.lastDone * 86400000).toISOString().slice(0, 10) : null,
               mastered: mastered("all"), total: totalIn("all") };
    },
    // 🔖 保存フレーズを足す（AI会話・英訳コーチから）。同じ英文は二重に入れない
    addMine: function (ja, en) {
      var e = String(en).trim(), j = String(ja).trim(); if (!e) return false;
      if (state.mine.some(function (m) { return m.en === e; })) return false;
      state.mine.push({ id: "mine-" + Date.now().toString(36), ja: j, en: e, ts: Date.now() });
      save(state); return true;
    },
    speak: function (t) { speak(t); }
  };

  renderSetup();

  // service worker（オフライン用・任意）
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  }
})();
