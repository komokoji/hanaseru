/* Hanaseru — 最小アプリのロジック（段階1 MVP）
   ・毎日1ルーティン：日本語を見て声に出す → 言えた/まだ → 次
   ・間隔反復（Leitnerボックス）：言えた行は間隔が延び、詰まった行は翌日また出る
   ・進捗はこの端末の localStorage にだけ保存（サーバーなし・オフラインOK）
   ※ 判定は「自己申告」。発音の自動採点は段階3（ELSA等の借りエンジン）で。 */
(function () {
  "use strict";

  var LISTEN = (window.HANASERU_VISIT_UNITS || []).concat(window.HANASERU_LISTEN || []);
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
  if (!state.talks) state.talks = [];        // 🗣 声で話した記録 {d: dayNum, n: 発言数}（AI会話の発言・1分で語る）
  if (!state.mono) state.mono = {};          // 🎤 1分で語るのお題ごと {box, due}＝札と同じ節目で「またこのお題」
  var saveListeners = [];
  function allCards() {                      // 辞書（data.js）＋院長が保存したフレーズ（state.mine）
    return CARDS.concat(state.mine.map(function (m) { return { id: m.id, domain: "mine", ja: m.ja, en: m.en }; }));
  }

  function cardState(id) {
    if (!state.cards[id]) state.cards[id] = { box: 0, due: dayNum() };
    return state.cards[id];
  }

  // ---- 今日の出題を組む ----
  // ---- 🧩 部品と流れ（parts.js）----
  var PARTS = window.HANASERU_PARTS || [], PART = window.HANASERU_PART_BY_ID || {};
  var FLOWS = window.HANASERU_FLOWS || [], CASES = window.HANASERU_CASES || [];
  function partCards(pid) {           // 部品の札（練習中に部品名を出すため part を付けた写し。採点は id で行う）
    var p = PART[pid]; if (!p) return [];
    return p.ids.map(function (id) { var c = cardById(id); return c ? { id: c.id, domain: c.domain, ja: c.ja, en: c.en, note: c.note, part: p.title } : null; }).filter(Boolean);
  }
  function flowById(id) { for (var i = 0; i < FLOWS.length; i++) if (FLOWS[i].id === id) return FLOWS[i]; return null; }
  // 範囲の札：flow:◯◯＝流れの順／part:◯◯＝部品の順／flow:all＝部品の棚ぜんぶ／それ以外＝domain
  function cardsFor(domain) {
    if (domain.indexOf("flow:") === 0) {
      var f = domain === "flow:all" ? { parts: PARTS.map(function (p) { return p.id; }) } : flowById(domain.slice(5));
      return f ? [].concat.apply([], f.parts.map(partCards)) : [];
    }
    if (domain.indexOf("part:") === 0) return partCards(domain.slice(5));
    return allCards().filter(function (c) { return domain === "all" || c.domain === domain; });
  }
  function isOrdered(domain) { return domain.indexOf(":") > 0; }   // 流れ・部品は並べた順に全部出す（シャッフルしない）
  function buildQueue(domain) {
    var today = dayNum();
    if (isOrdered(domain)) return cardsFor(domain);
    var pool = cardsFor(domain);
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
    return cardsFor(domain).filter(function (c) {
      var st = state.cards[c.id]; return st && st.box >= 4;
    }).length;
  }
  function totalIn(domain) { return cardsFor(domain).length; }

  function finishSession() {
    var today = dayNum();
    if (state.lastDone === today) return;              // 二重加算しない
    if (state.lastDone === today - 1) state.streak += 1;
    else state.streak = 1;
    state.lastDone = today;
    save(state);
  }

  // ---- 音声（英語の手本） ----
  // Mac/iOS には英語扱いの"おもちゃ声"（Bubbles, Bells, Bahh…）が多数あり、言語だけで選ぶとそれを拾う。
  // 質の良い声を名前の優先順で選び、見つからなければブラウザ既定（＝以前と同じ）に任せる。
  var GOOD_VOICES = {
    "en-US": ["Google US English", "Samantha", "Ava", "Allison", "Zoe", "Nicky", "Alex", "Evan", "Tom", "Microsoft Aria Online", "Microsoft Jenny Online"],
    "en-GB": ["Google UK English Female", "Google UK English Male", "Daniel", "Kate", "Serena", "Oliver", "Jamie", "Stephanie", "Microsoft Sonia Online", "Microsoft Ryan Online"]
  };
  function pickVoice(lang) {
    var all = window.speechSynthesis.getVoices();
    var names = GOOD_VOICES[lang] || [];
    for (var i = 0; i < names.length; i++) {
      for (var j = 0; j < all.length; j++) {
        if (all[j].name.indexOf(names[i]) === 0 && all[j].lang.replace("_", "-").indexOf(lang) === 0) return all[j];
      }
    }
    if (lang !== "en-US") return pickVoice("en-US");   // 英国声が無ければ米国の良い声
    return null;
  }
  if (window.speechSynthesis) window.speechSynthesis.getVoices();   // 一覧を先に読み込ませる（初回が空になる対策）
  function speak(text, lang) {
    try {
      if (!window.speechSynthesis) return;
      var u = new SpeechSynthesisUtterance(String(text).replace(/___/g, "…"));
      u.lang = lang || "en-US"; u.rate = (state.rate === "fast") ? 1.05 : 0.85;
      var v = pickVoice(u.lang); if (v) u.voice = v;   // 良い声だけを名前で選ぶ（おもちゃ声を拾わない）
      window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  // ---- 画面 ----
  var el = {};
  ["setup", "study", "done", "cardFront", "cardBack", "ja", "en", "note",
    "progress", "streak", "counter", "domainName"].forEach(function (id) { el[id] = document.getElementById(id); });

  var queue = [], idx = 0, curDomain = "all", revealed = false;
  var results = [];   // この回の結果（true=言えた / false=まだ / undefined=未回答）
  var snaps = {};     // この回で最初に採点する前のカード状態＝戻って付け直しても二重に進まない

  function startSession(domain) {
    curDomain = domain;
    queue = buildQueue(domain);
    if (queue.length === 0) { showDone(true); return; }
    beginQueue();
  }
  function beginQueue() {
    idx = 0; results = []; snaps = {};
    hideMain();
    show(el.study, true);
    renderCard();
  }

  function renderCard() {
    var c = queue[idx];
    revealed = false;
    el.ja.textContent = c.ja;
    el.en.textContent = c.en;
    if (el.note) el.note.hidden = true;   // 補足説明は通常画面に出さない（2026-09-29 院長方針：日本語→英語だけ。❓解説は押したときだけ）
    var jb = document.getElementById("jaBack"); if (jb) jb.textContent = c.ja;
    el.counter.textContent = (idx + 1) + " / " + queue.length + (c.part ? "　" + c.part : "")
      + (results[idx] === true ? "　✅ 言えた" : results[idx] === false ? "　🔁 まだ" : "");
    var pv = document.getElementById("prevBtn"); if (pv) pv.disabled = idx === 0;
    var ql = document.getElementById("qList"); if (ql) ql.hidden = true;
    var xb = document.getElementById("xpStudy"); if (xb) { xb.hidden = true; xb.dataset.id = ""; }
    show(el.cardBack, false); show(el.cardFront, true);
  }

  function reveal() {
    revealed = true;
    show(el.cardFront, false); show(el.cardBack, true);
    updateRateBtn();
    speak(queue[idx].en);
  }

  function answer(ok) {
    var c = queue[idx];
    // 戻って付け直したときは、この回の最初の状態に戻してから採点（言えたを2回押しても箱が2つ進まない）
    if (!(c.id in snaps)) snaps[c.id] = state.cards[c.id] ? JSON.parse(JSON.stringify(state.cards[c.id])) : null;
    else if (snaps[c.id]) state.cards[c.id] = JSON.parse(JSON.stringify(snaps[c.id]));
    else delete state.cards[c.id];
    grade(c, ok);
    results[idx] = ok;
    idx += 1;
    if (idx >= queue.length) { finishSession(); showDone(false); }
    else renderCard();
  }
  function goPrev() { if (idx > 0) { idx -= 1; renderCard(); } }
  function goNext() { if (idx < queue.length - 1) { idx += 1; renderCard(); } }
  function goTo(i) { hideMain(); show(el.study, true); idx = i; renderCard(); }
  // この回の一覧：どこでもタップで戻って練習し直せる
  function renderQList() {
    var box = document.getElementById("qList"); if (!box) return;
    var ok = results.filter(function (r) { return r === true; }).length;
    var ng = results.filter(function (r) { return r === false; }).length;
    box.innerHTML = '<p class="stat" style="margin:0 0 6px">この回：✅ ' + ok + '　🔁 ' + ng + '　／ ' + queue.length + '枚（タップでその札へ）</p>'
      + queue.map(function (c, i) {
        var mk = results[i] === true ? "✅" : results[i] === false ? "🔁" : "・";
        return '<div class="clrow' + (i === idx ? ' cur' : '') + '" data-action="qGo" data-idx="' + i + '" style="cursor:pointer">'
          + '<span style="width:22px">' + mk + '</span><div class="cltext"><div class="clja">' + (i + 1) + '. ' + escapeHtml(c.ja) + '</div>'
          + '<div style="font-size:13px;color:var(--teal-d)">' + escapeHtml(c.en) + '</div></div></div>';
      }).join("");
  }
  function toggleQList() {
    var box = document.getElementById("qList"); if (!box) return;
    if (box.hidden) { renderQList(); box.hidden = false; box.scrollIntoView({ block: "nearest" }); } else box.hidden = true;
  }
  function retryMisses() {       // 「まだ」だけもう一度
    var miss = queue.filter(function (c, i) { return results[i] === false; });
    if (!miss.length) return;
    queue = miss; beginQueue();
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
    var misses = results.filter(function (r) { return r === false; }).length;
    var dr = document.getElementById("doneRetry");
    if (dr) { dr.hidden = empty || !queue.length; }
    var dm = document.getElementById("doneMiss");
    if (dm) { dm.hidden = empty || !misses; dm.textContent = "🔁「まだ」の " + misses + " 枚だけもう一度"; }
    var dl = document.getElementById("doneList");
    if (dl) dl.hidden = empty || !queue.length;
  }

  function backToSetup() {
    hideMain();
    show(el.setup, true);
    renderSetup();
  }

  function renderSetup() {
    el.streak.textContent = "連続 " + state.streak + " 日";
    el.progress.textContent = "身についた：" + mastered("all") + " / " + totalIn("all");
    // 🗣 今週、声で話した回数（AI会話の発言＋1分で語る）＝B2 の3つは「話した回数」で決まる
    var wk = dayNum() - 6, nTalk = 0; state.talks.forEach(function (t) { if (t.d >= wk) nTalk += t.n; });
    var tl = document.getElementById("talkLine"); if (tl) tl.textContent = "🗣 今週 声で話した：" + nTalk + " 回（目安 週30回＝1分で語る1回が3回分、AI会話は1発言が1回分）";
    // 📅 今日の一手＝復習期限が来ている札の数と、節目が来ているお題
    var today = dayNum(), dueCards = 0; allCards().forEach(function (c) { var st = state.cards[c.id]; if (st && st.due <= today) dueCards++; });
    var topics = window.HANASERU_MONO_TOPICS || [], dueTopic = null;
    topics.forEach(function (t) { var m = state.mono[t]; if (!dueTopic && m && m.due <= today) dueTopic = t; });
    var tdl = document.getElementById("todayLine");
    if (tdl) tdl.textContent = "📅 今日の一手：復習期限の札 " + dueCards + " 枚" + (dueTopic ? "　／　🎤 節目のお題「" + dueTopic + "」" : "　／　🎤 1分で語るを1回");
    // 🎯 目標への道のり＝3場面（診察・旅・自分）で「考えずに出る」札の数
    var gl = document.getElementById("goalLine");
    if (gl) gl.textContent = "🎯 道のり　診察 " + mastered("flow:all") + "/" + totalIn("flow:all")
      + "　旅 " + (mastered("trip") + mastered("trip2") + mastered("travel")) + "/" + (totalIn("trip") + totalIn("trip2") + totalIn("travel"))
      + "　自分 " + mastered("flow:me") + "/" + totalIn("flow:me") + "（身についた＝4箱以上）";
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
    ["clinic", "build", "patterns", "mono"].forEach(function (id) { var n = document.getElementById(id); if (n) n.hidden = true; });
    var co = document.getElementById("coach"); if (co) co.hidden = true;
  }

  // ---- 🎧 聞き取り（実際に耳にした英語を、聞く→意味→英文→口に出す の順で） ----
  var lsUnit = 0, lsIdx = 0, lsShown = false;
  function openListen() { hideMain(); var l = document.getElementById("listen"); if (l) l.hidden = false; lsIdx = 0; renderListen(); }
  function renderListen() {
    var u = LISTEN[lsUnit]; if (!u) return;
    var p = u.passages[lsIdx];
    lsShown = false;
    var ch = document.getElementById("lsUnits");
    if (ch) ch.innerHTML = LISTEN.map(function (x, i) {
      return '<button class="chip' + (i === lsUnit ? ' on' : '') + '" data-action="lsUnit" data-idx="' + i + '">' + escapeHtml(x.title) + '</button>';
    }).join("");
    var t = document.getElementById("lsTitle"); if (t) t.textContent = u.title;
    var sc = document.getElementById("lsScene"); if (sc) sc.textContent = u.scene;
    var pt = document.getElementById("lsPassage"); if (pt) pt.textContent = p.title;
    var cn = document.getElementById("lsCounter"); if (cn) cn.textContent = (lsIdx + 1) + " / " + u.passages.length;
    var body = document.getElementById("lsBody"); if (body) body.hidden = true;
    var en = document.getElementById("lsEn"); if (en) en.textContent = p.en;
    var ja = document.getElementById("lsJa"); if (ja) ja.textContent = "要点：" + p.ja;
    var pk = document.getElementById("lsPick"); if (pk) pk.innerHTML = (p.pick || []).map(function (x) { return "<li>" + escapeHtml(x) + "</li>"; }).join("");
    var phh = document.getElementById("lsPhrasesH"); if (phh) phh.hidden = !u.phrases.length;
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

  // ---- 🧩 診察の会話：① 流れ ② 部品 ③ 組み立て（症例）----
  function openClinic() {
    hideMain(); document.getElementById("clinic").hidden = false;
    document.getElementById("flowBtns").innerHTML = FLOWS.map(function (f) {
      return '<button class="choice" data-action="start" data-domain="flow:' + f.id + '"><span>' + f.parts.length + 'つの部品</span><b>' + escapeHtml(f.title) + ' ▸</b></button>';
    }).join("");
    document.getElementById("partChips").innerHTML = PARTS.map(function (p) {
      return '<button class="chip" data-action="start" data-domain="part:' + p.id + '">' + escapeHtml(p.title) + '</button>';
    }).join("");
  }
  var bCase = 0, bOrder = [];
  function openBuild(i) {
    hideMain(); document.getElementById("build").hidden = false;
    if (i != null) { bCase = i; bOrder = []; }
    renderBuild();
  }
  function curCase() { return CASES[bCase]; }
  function renderBuild(result) {
    var c = curCase(); if (!c) return;
    // 症例を 一般／便秘／栄養 に分けて見せる
    document.getElementById("caseChips").innerHTML = ["一般", "便秘", "栄養"].map(function (cat) {
      var chips = CASES.map(function (x, i) {
        if ((x.cat || "一般") !== cat) return "";
        return '<button class="chip' + (i === bCase ? ' on' : '') + '" data-action="bCase" data-idx="' + i + '">' + escapeHtml(x.title) + '</button>';
      }).join("");
      return chips ? '<div class="muted" style="font-size:12px;margin:8px 0 4px;width:100%">' + cat + '</div>' + chips : "";
    }).join("");
    document.getElementById("bFacts").innerHTML = c.facts.map(function (f) { return "<li>" + escapeHtml(f) + "</li>"; }).join("");
    // 部品の棚を3つに分けて見せる（共通・診療／便秘／栄養）。題名の「便秘：」「栄養：」は棚の見出しに回す
    var groups = [["共通・診療", ""], ["🟤 便秘", "便秘："], ["🟢 栄養", "栄養："]];   // 胃腸炎・発熱・けいれん等は「共通・診療」
    document.getElementById("bPalette").innerHTML = groups.map(function (g) {
      var ps = PARTS.filter(function (p) { return g[1] ? p.title.indexOf(g[1]) === 0 : !/^(便秘|栄養)：/.test(p.title); });
      return '<div class="muted" style="font-size:12px;margin:8px 0 4px;width:100%">' + g[0] + '</div>' + ps.map(function (p) {
        var on = bOrder.indexOf(p.id) >= 0;
        return '<button class="chip' + (on ? ' on' : '') + '" data-action="bAdd" data-id="' + p.id + '">' + escapeHtml(g[1] ? p.title.slice(g[1].length) : p.title) + '</button>';
      }).join("");
    }).join("");
    document.getElementById("bOrder").innerHTML = bOrder.length ? bOrder.map(function (pid, k) {
      return '<div class="clrow"><span style="width:22px;color:var(--teal-d);font-weight:700">' + (k + 1) + '</span><div class="cltext">' + escapeHtml(PART[pid].title) + '</div>'
        + '<button class="capx" data-action="bUp" data-idx="' + k + '" title="上へ">↑</button><button class="capx" data-action="bDel" data-idx="' + k + '">×</button></div>';
    }).join("") : '<p class="muted" style="margin:6px 0">上の部品を、話す順にタップしてください。</p>';
    document.getElementById("bResult").innerHTML = result || "";
  }
  function buildCheck() {
    var c = curCase(), model = c.model;
    var rows = model.map(function (pid) {
      return '<li>' + (bOrder.indexOf(pid) >= 0 ? "✅ " : "⚠️ <b>抜け</b>：") + escapeHtml(PART[pid].title) + '</li>';
    }).join("");
    var extra = bOrder.filter(function (pid) { return model.indexOf(pid) < 0; });
    var html = '<div class="xp"><div class="xpg" style="margin-top:0"><b>お手本の並べ方</b>（これだけが正解ではありません）</div><ol style="margin:6px 0 0;padding-left:20px">' + rows + '</ol>'
      + (extra.length ? '<div class="xpg">➕ 追加した部品：' + extra.map(function (pid) { return escapeHtml(PART[pid].title); }).join("、") + '（この子に必要なら、あってよい）</div>' : "")
      + '<div class="xpg">💡 ' + escapeHtml(c.tip) + '</div></div>';
    renderBuild(html);
  }
  function buildRun() {     // 自分の並べ方で通す：日本語を見て声に出す → タップで英語と音声
    var order = bOrder.length ? bOrder : curCase().model;
    var html = '<div class="xp"><div class="xpg" style="margin-top:0">日本語を見て声に出す → タップで英語と音声。上から通して話します。</div>'
      + order.map(function (pid) {
        return '<div style="margin-top:10px;font-weight:700;color:var(--teal-d)">' + escapeHtml(PART[pid].title) + '</div>'
          + partCards(pid).map(function (cd) {
            return '<div class="clrow" data-action="bLine" data-id="' + cd.id + '" style="cursor:pointer"><div class="cltext"><div class="clja">' + escapeHtml(cd.ja) + '</div>'
              + '<div class="clen" id="bl-' + cd.id + '" hidden>' + escapeHtml(cd.en) + '</div></div></div>';
          }).join("");
      }).join("") + '</div>';
    renderBuild(html);
  }

  // ---- 🧱 喋り始めの型（patterns.js）：型＋ミニ解説＋辞書から拾った例文 ----
  var PATTERNS = window.HANASERU_PATTERNS || [];
  function openPatterns() {
    hideMain(); var sec = document.getElementById("patterns"); if (!sec) return; sec.hidden = false;
    var all = allCards();
    document.getElementById("ptList").innerHTML = PATTERNS.map(function (pt) {
      var ex = [], seen = {};
      all.forEach(function (c) {
        c.en.split(/(?<=[.!?])\s+/).forEach(function (sen) {
          var t = sen.replace(/^["(]+/, "");
          if (pt.re.test(t) && !seen[t] && ex.length < 4) { seen[t] = true; ex.push({ en: t, ja: c.ja }); }
        });
      });
      return '<div class="clrow" style="flex-direction:column;align-items:stretch">'
        + '<div class="cltext" data-action="ptToggle" data-id="' + pt.id + '"><div class="clen" style="margin-top:0">' + escapeHtml(pt.kata) + '</div><div class="clja" style="font-size:14px;color:var(--sub)">' + escapeHtml(pt.ja) + '</div></div>'
        + '<div id="pt-' + pt.id + '" hidden><div class="xp" style="margin-top:8px"><div class="xpg" style="margin-top:0">' + escapeHtml(pt.why) + '</div>'
        + (ex.length ? '<div class="xpg"><b>辞書の中の例</b></div>' + ex.map(function (e) {
            return '<div class="clrow" style="margin-top:4px"><div class="cltext"><div class="clen" style="margin-top:0;font-size:15px">' + escapeHtml(e.en) + '</div><div class="clja" style="font-size:13px;color:var(--sub)">' + escapeHtml(e.ja) + '</div></div><button class="speak" data-action="ptSay" data-en="' + escapeHtml(e.en) + '" style="padding:4px 10px">🔊</button></div>';
          }).join("") : "") + '</div></div></div>';
    }).join("");
  }

  // ---- 🎧 シャドーイング（手本を聞いて追いかける＝シャドテンの核） ----
  var shQueue = [], shIdx = 0, shDomain = "all";
  function openShadow() {
    hideMain();
    var s = document.getElementById("shadow"); if (s) s.hidden = false;
    buildShadow();
  }
  function setShadowDomain(d) { shDomain = d; buildShadow(); }
  function buildShadow() {
    shQueue = cardsFor(shDomain);
    if (!isOrdered(shDomain)) shuffle(shQueue); shIdx = 0;
    highlightChips("#shChips", shDomain);
    renderShadow();
  }
  function renderShadow() {
    if (!shQueue.length) return;
    var c = shQueue[shIdx];
    var en = document.getElementById("shEn"); if (en) en.textContent = String(c.en).replace(/___/g, "…");
    var ja = document.getElementById("shJa"); if (ja) ja.textContent = c.ja;
    var cn = document.getElementById("shCounter"); if (cn) cn.textContent = (shIdx + 1) + " / " + shQueue.length;
    var xb = document.getElementById("xpShadow"); if (xb) { xb.hidden = true; xb.dataset.id = ""; }
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
    var pool = cardsFor(clDomain);
    var done = pool.filter(function (c) { var s = state.cards[c.id]; return s && s.practiced; }).length;
    var cnt = document.getElementById("clCount"); if (cnt) cnt.textContent = "見た所：" + done + " / " + pool.length;
    list.innerHTML = pool.map(function (c) {
      var s = state.cards[c.id]; var on = s && s.practiced;
      return '<div class="clrow">'
        + '<button class="clcheck' + (on ? ' on' : '') + '" data-action="clCheck" data-id="' + c.id + '">' + (on ? '☑' : '☐') + '</button>'
        + '<div class="cltext" data-action="clShow" data-id="' + c.id + '">'
        + '<div class="clja">' + escapeHtml(c.ja) + '</div>'
        + '<div class="clen" id="clen-' + c.id + '" hidden>' + escapeHtml(c.en)
        + '</div>'
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
    else if (a === "prev") goPrev();
    else if (a === "next") goNext();
    else if (a === "qList") toggleQList();
    else if (a === "qGo") goTo(+t.getAttribute("data-idx"));
    else if (a === "again") beginQueue();
    else if (a === "missAgain") retryMisses();
    else if (a === "doneList") { goTo(0); toggleQList(); }
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
    else if (a === "clinic") openClinic();
    else if (a === "patterns") openPatterns();
    else if (a === "mono") { hideMain(); document.getElementById("mono").hidden = false; document.dispatchEvent(new CustomEvent("hanaseru:mono")); }
    else if (a === "ptToggle") { var pe = document.getElementById("pt-" + t.getAttribute("data-id")); if (pe) pe.hidden = !pe.hidden; }
    else if (a === "ptSay") speak(t.getAttribute("data-en"));
    else if (a === "buildOpen") openBuild(null);
    else if (a === "bCase") openBuild(+t.getAttribute("data-idx"));
    else if (a === "bAdd") { var pid = t.getAttribute("data-id"), k = bOrder.indexOf(pid); if (k >= 0) bOrder.splice(k, 1); else bOrder.push(pid); renderBuild(); }
    else if (a === "bDel") { bOrder.splice(+t.getAttribute("data-idx"), 1); renderBuild(); }
    else if (a === "bUp") { var i2 = +t.getAttribute("data-idx"); if (i2 > 0) { var tmp = bOrder[i2 - 1]; bOrder[i2 - 1] = bOrder[i2]; bOrder[i2] = tmp; } renderBuild(); }
    else if (a === "bClear") { bOrder = []; renderBuild(); }
    else if (a === "bCheck") buildCheck();
    else if (a === "bRun") buildRun();
    else if (a === "bLine") { var bl = document.getElementById("bl-" + t.getAttribute("data-id")); if (bl) { bl.hidden = !bl.hidden; if (!bl.hidden) { var bc = cardById(t.getAttribute("data-id")); if (bc) speak(bc.en); } } }
    else if (a === "bTalk") { hideMain(); document.getElementById("talk").hidden = false; document.dispatchEvent(new CustomEvent("hanaseru:case", { detail: curCase() })); }
    else if (a === "talk") { hideMain(); document.getElementById("talk").hidden = false; }   // 会話の中身は talk.js
    else if (a === "coach") { hideMain(); document.getElementById("coach").hidden = false; }
    else if (a === "lsPlay") listenPlay();
    else if (a === "lsShow") listenShow();
    else if (a === "lsNext") listenNext();
    else if (a === "lsPrev") listenPrev();
    else if (a === "lsUnit") { lsUnit = +t.getAttribute("data-idx"); lsIdx = 0; renderListen(); }
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
      if (!state.cards) state.cards = {}; if (state.streak == null) state.streak = 0; if (state.lastDone === undefined) state.lastDone = null;
      if (!state.rate) state.rate = "slow"; if (!state.captures) state.captures = []; if (!state.mine) state.mine = [];
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
      if (!el.setup.hidden) renderSetup();
    },
    onChange: function (f) { saveListeners.push(f); },
    summary: function () {
      var wk = dayNum() - 6, k = 0; state.talks.forEach(function (t) { if (t.d >= wk) k += t.n; });
      return { streak: state.streak, lastDone: state.lastDone, talks7d: k,
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
    speak: function (t) { speak(t); },
    bumpTalk: function (n) {               // 声で話した回数を記録（今日の分に足す）
      var d = dayNum(), last = state.talks[state.talks.length - 1];
      if (last && last.d === d) last.n += (n || 1); else state.talks.push({ d: d, n: n || 1 });
      if (state.talks.length > 60) state.talks = state.talks.slice(-60);
      save(state);
    },
    // 🎤 お題の間隔反復：語ったら次の節目へ。due＝次に出す日
    monoDone: function (topic) { var m = state.mono[topic] || { box: 0, due: dayNum() }; m.box = Math.min(m.box + 1, INTERVALS.length - 1); m.due = dayNum() + INTERVALS[m.box]; state.mono[topic] = m; save(state); },
    monoDue: function (topic) { var m = state.mono[topic]; return !m || m.due <= dayNum(); },
    monoBox: function (topic) { var m = state.mono[topic]; return m ? m.box : 0; },
    today: function () { return dayNum(); },
    talksThisWeek: function () { var wk = dayNum() - 6, k = 0; state.talks.forEach(function (t) { if (t.d >= wk) k += t.n; }); return k; },
    parts: function () { return PARTS.map(function (p) { return { id: p.id, title: p.title, en: partCards(p.id).map(function (c) { return c.en; }) }; }); },
    partCards: function (pid) { return partCards(pid); },
    partTitle: function (pid) { return PART[pid] ? PART[pid].title : pid; },
    current: function (where) {           // ❓解説用：いま画面に出ているカード
      if (where === "shadow") return shQueue[shIdx] || null;
      return queue[idx] || null;
    }
  };

  renderSetup();

  // service worker（オフライン用・任意）
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  }
})();
