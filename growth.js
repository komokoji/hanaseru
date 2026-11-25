/* Hanaseru — 学びが次に生きる仕組み（2026-11-25 院長「学んでいったら、その学びとともにブラッシュアップされる」）
   ① つまずき直し（focus）：詰まった言い回しを集め、間隔をあけて出し直す。AI会話と新しい耳トレにも、もう一度出す。
      集める所＝AI会話の「こう言うとより良い」と言い回し／場面練習の「まだ難しい」／熟語の耳トレで外した問題。
   ② 聞いた時間の記録（listen）：共通プレーヤーが鳴らした秒数を日ごとに足す。
   ③ 今日のメニュー：耳→つまずき直し→曜日ごとの話す練習、の3つを毎日同じ形で出す。
   記録はこの端末に保存し、ログイン中は同期する（cloud.js）。 */
(function () {
  'use strict';
  var H = window.Hanaseru, $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var STEPS = [1, 3, 7, 14, 30];   // 言えたら、次は 1日後→3日後→1週→2週→1か月
  var st = function () { return H.getState(); };
  var key = function (en) { return String(en).toLowerCase().replace(/[^a-z0-9' ]/g, ' ').replace(/\s+/g, ' ').trim(); };
  function list() { var s = st(); if (!Array.isArray(s.focus)) s.focus = []; return s.focus; }

  // ---- ① つまずき直し ----
  var Focus = {
    add: function (en, ja, src) {
      en = String(en || '').trim(); if (!en || en.length > 240 || !/[a-zA-Z]/.test(en)) return false;
      var k = key(en), now = Date.now(), items = list(), hit = items.find(function (x) { return key(x.en) === k; });
      if (hit) {   // 同じ所でまた詰まった＝早めに出し直す
        if (!hit.gone) { hit.hits = (hit.hits || 1) + 1; hit.box = 0; hit.due = H.today(); hit.updatedAt = now; H.commit(); }
        return false;
      }
      items.push({ id: 'f' + now.toString(36) + Math.floor(Math.random() * 1e3), en: en, ja: String(ja || '').trim().slice(0, 200), src: src || 'talk', box: 0, due: H.today(), ts: now, updatedAt: now, hits: 1 });
      if (items.length > 300) st().focus = items.filter(function (x) { return !x.gone; }).slice(-300);
      H.commit(); return true;
    },
    due: function (n) {
      var today = H.today();
      return list().filter(function (x) { return !x.gone && x.due <= today; }).sort(function (a, b) { return (b.hits || 1) - (a.hits || 1) || a.due - b.due; }).slice(0, n || 99);
    },
    all: function () { return list().filter(function (x) { return !x.gone; }); },
    mark: function (id, ok) {
      var x = list().find(function (i) { return i.id === id; }); if (!x) return;
      if (ok) { x.box = Math.min((x.box || 0) + 1, STEPS.length); x.due = H.today() + STEPS[Math.min(x.box, STEPS.length) - 1]; if (x.box >= STEPS.length) x.gone = true; }
      else { x.box = 0; x.due = H.today() + 1; x.hits = (x.hits || 1) + 1; }
      x.updatedAt = Date.now(); H.commit();
    },
    // AI会話と新しい耳トレに渡す、練習中の短い言い回し（最大5つ）
    forAI: function () {
      return Focus.due(30).concat(Focus.all()).filter(function (x, i, a) { return a.indexOf(x) === i && x.en.split(/\s+/).length <= 8; }).slice(0, 5).map(function (x) { return x.en; });
    },
    // 院長の発話の中に、練習中の言い回しが入っていたら「使えた」として次の節目へ
    noticeUse: function (said) {
      var s = ' ' + key(said) + ' ', used = [];
      Focus.all().forEach(function (x) { var k = key(x.en); if (k.split(' ').length <= 8 && k.length > 3 && s.indexOf(' ' + k + ' ') >= 0) { Focus.mark(x.id, true); used.push(x.en); } });
      return used;
    }
  };
  H.focus = Focus;

  var drill = { items: [], i: 0, shown: false, ok: 0 };
  function openDrill() {
    drill = { items: Focus.due(8), i: 0, shown: false, ok: 0 };
    H.openSection('focus'); renderDrill();
  }
  function renderDrill() {
    var x = drill.items[drill.i];
    if (!x) {
      var left = Focus.due().length, total = Focus.all().length;
      $('fcTitle').textContent = drill.items.length ? '今日のつまずき直し、できました' : 'つまずき直し';
      $('fcBody').innerHTML = '<div class="card"><p>' + (drill.items.length ? '言えた：' + drill.ok + ' / ' + drill.items.length + '。言えたものは間をあけて、まだのものは明日もう一度出します。'
        : (total ? '今日出す分はありません。練習中の言い回しは ' + total + ' 件。節目の日にまた出します。' : 'まだ集まっていません。AIと話す・場面で練習する・熟語の耳トレをすると、詰まった言い回しがここに集まります。')) + '</p>'
        + (left ? '<p class="muted">今日の分があと ' + left + ' 件あります。</p>' : '') + '</div>';
      $('fcActions').innerHTML = (left ? '<button class="big" data-action="focusOpen">続けてあと ' + Math.min(left, 8) + ' 件</button>' : '') + '<button class="speak" data-action="focusList">練習中の言い回しを見る（' + total + '）</button><button class="speak" data-action="home">ホームへ</button>';
      if (drill.items.length) menuDone('focus');
      return;
    }
    $('fcTitle').textContent = 'つまずき直し ' + (drill.i + 1) + ' / ' + drill.items.length;
    var label = { talk: 'AI会話で', scene: '場面練習で', pv: '熟語の耳トレで', listen: '耳トレで', assess: '現在地チェックで' }[x.src] || '';
    $('fcBody').innerHTML = '<div class="card"><p class="muted">' + label + '詰まった言い回し' + ((x.hits || 1) > 1 ? '（' + x.hits + '回目）' : '') + '</p>'
      + '<p class="ja">' + esc(x.ja || '（意味は英文を見て確かめる）') + '</p><p class="muted">まず、英語で声に出してみましょう。</p>'
      + (drill.shown ? '<p class="en" lang="en">' + esc(x.en) + '</p>' : '') + '</div>';
    $('fcActions').innerHTML = '<button class="speak" data-action="fcSay">🔊 聞く</button>'
      + (drill.shown ? '<div class="speakrow"><button class="ok" data-action="fcOk">言えた</button><button class="ng" data-action="fcNg">まだ → 明日もう一度</button></div><button class="speak" data-action="fcDrop">もう覚えた・外す</button>'
        : '<button class="big" data-action="fcShow">英語を見る</button>');
  }
  function renderAll() {
    var items = Focus.all().slice().sort(function (a, b) { return a.due - b.due; });
    $('fcTitle').textContent = '練習中の言い回し（' + items.length + '）';
    $('fcBody').innerHTML = items.length ? items.map(function (x) {
      var d = x.due - H.today();
      return '<div class="clrow"><div class="cltext"><div class="clen" style="margin-top:0" lang="en">' + esc(x.en) + '</div><div class="clja" style="font-size:13px;color:var(--sub)">' + esc(x.ja) + '</div><div class="stat">' + (d <= 0 ? '今日' : d + '日後') + 'に出す・' + (x.box || 0) + ' / ' + STEPS.length + ' 段</div></div><button class="speak" data-say-focus="' + esc(x.en) + '">🔊</button></div>';
    }).join('') : '<p class="muted">まだありません。</p>';
    $('fcActions').innerHTML = '<button class="speak" data-action="focusOpen">つまずき直しへ戻る</button><button class="speak" data-action="home">ホームへ</button>';
  }

  // ---- ② 聞いた時間 ----
  document.addEventListener('hanaseru:listened', function (e) {
    var sec = Math.round((e.detail && e.detail.sec) || 0); if (sec < 1 || sec > 600) return;
    var s = st(), d = H.today(); if (!Array.isArray(s.listen)) s.listen = [];
    var last = s.listen[s.listen.length - 1];
    if (last && last.d === d) last.s += sec; else s.listen.push({ d: d, s: sec });
    if (s.listen.length > 120) s.listen = s.listen.slice(-120);
    H.commit(); renderHome();
  });
  function listenedSec(days) { var from = H.today() - (days - 1), n = 0; (st().listen || []).forEach(function (x) { if (x.d >= from) n += x.s; }); return n; }
  H.listenedSec = listenedSec;

  // ---- ③ 今日のメニュー ----
  function menu() { var s = st(), d = H.today(); if (!s.menu || s.menu.d !== d) s.menu = { d: d, done: {} }; return s.menu; }
  function menuDone(k) { var m = menu(); if (!m.done[k]) { m.done[k] = true; H.commit(); } renderHome(); }
  H.menuDone = menuDone;
  var SPEAK = [   // 日曜から。話す練習は曜日で替える（診察を週3回）
    { a: 'quickTalk', t: '🗣 AIと自由に話す', s: '5往復から。詰まったら「日本語で言う」' },
    { a: 'sceneTrack', track: 'consult', t: '🩺 診察を英語で', s: '1本を通しで聞いて、自分で返す' },
    { a: 'sceneTrack', track: 'links', t: '🔗 会話のつなぎ', s: '聞いて、つなぎの一言から返す' },
    { a: 'sceneTrack', track: 'consult', t: '🩺 診察を英語で', s: '台本なしで、AIの保護者と通し稽古' },
    { a: 'sceneTrack', track: 'links', t: '🔗 会話のつなぎ', s: '聞いて、つなぎの一言から返す' },
    { a: 'sceneTrack', track: 'consult', t: '🩺 診察を英語で', s: '問診の回で、自分から聞く' },
    { a: 'sceneTrack', track: 'dubai', t: '🎤 ドバイ：発表と質疑', s: '60秒の自己紹介と、質問への返し' }
  ];
  function renderHome() {
    var box = $('coachMenu'); if (!box) return;
    var m = menu(), due = Focus.due().length, sp = SPEAK[new Date().getDay()];
    var heardToday = listenedSec(1), week = Math.round(listenedSec(7) / 60);
    if (heardToday >= 40 && !m.done.listen) { m.done.listen = true; H.commit(); }
    var row = function (done, attrs, title, sub) { return '<button type="button" class="menu-row' + (done ? ' done' : '') + '" ' + attrs + '><span class="menu-mark">' + (done ? '✓' : '') + '</span><span class="menu-text"><b>' + title + '</b><small>' + sub + '</small></span></button>'; };
    var a = (st().assess || []).slice(-1)[0], next = a ? a.d + 84 - H.today() : null;
    box.innerHTML = row(m.done.listen, 'data-action="listeningRoute"', '👂 耳トレ', '今日の会話を聞く（今日 ' + Math.round(heardToday / 60) + '分）')
      + (due ? row(m.done.focus, 'data-action="focusOpen"', '🔁 つまずき直し', '詰まった言い回し ' + due + ' 件')
             : row(m.done.focus, 'data-action="quizPhrasal"', '🧩 熟語の耳トレ', '聞いて意味を選ぶ 8問'))
      + row(m.done.speak, 'data-action="' + sp.a + '"' + (sp.track ? ' data-track="' + sp.track + '"' : ''), sp.t, sp.s)
      + '<p class="menu-stat">今週 聞いた ' + week + '分 ・ 話した ' + H.talksThisWeek() + '回 ・ '
      + (a ? (next > 0 ? '次の現在地チェックまで ' + next + '日' : '<b>現在地チェックの時期です</b>') : '<b>まず現在地チェックを1回</b>') + '</p>';
  }
  H.renderGrowth = renderHome;

  document.addEventListener('click', function (e) {
    var say = e.target.closest('[data-say-focus]'); if (say) { H.speak(say.getAttribute('data-say-focus')); return; }
    var t = e.target.closest('[data-action]'); if (!t) return; var a = t.dataset.action, x = drill.items[drill.i];
    if (a === 'focusOpen') openDrill();
    else if (a === 'focusList') { H.openSection('focus'); renderAll(); }
    else if (a === 'fcSay' && x) { drill.shown = true; H.speak(x.en); renderDrill(); }
    else if (a === 'fcShow' && x) { drill.shown = true; renderDrill(); }
    else if ((a === 'fcOk' || a === 'fcNg') && x) { Focus.mark(x.id, a === 'fcOk'); if (a === 'fcOk') drill.ok++; drill.i++; drill.shown = false; H.recordActivity(); renderDrill(); }
    else if (a === 'fcDrop' && x) { x.gone = true; x.updatedAt = Date.now(); H.commit(); drill.i++; drill.shown = false; renderDrill(); }
    else if (a === 'home') setTimeout(renderHome, 0);
  });
  document.addEventListener('hanaseru:state', renderHome);
  H.onChange(function () { if (!$('setup').hidden) renderHome(); });
  renderHome();
}());
