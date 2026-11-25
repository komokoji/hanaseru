/* Hanaseru — 🎯 基礎トレ：院長の4つの課題に直接効く練習（2026-11-25）
   院長「途中で一生懸命聞くあまり何を言ったか忘れ」「一旦悩むとその後聞こえなくなる」
       「音が繋がったり、なまったりすると分かりづらく」「単語は出るけれど、文脈になかなかならない」
   ① 持つ（保持）　　　：1文→2文→3文と続けて聞き、「前に言ったこと」を答える。持てた長さが記録になる。
   ② 止まらない（立て直し）：前の文はわざと速く流し、「最後に言ったこと」だけを答える。分からなくても次を聞く練習。
   ③ 音（音の変化）　　：つながる音・弱い音・まぎらわしい音を、聞いて書かれた文から選ぶ。ゆっくり版と聞き比べる。
   ④ まねる　　　　　　：聞いてすぐ言う。機械が聞き取れた語と、落とした語を見せる（発音の採点ではない）。
   ⑤ 文にする　　　　　：日本語と3つの単語と型から1文 → 理由・例・次の一手を足して伸ばす。
   ①②は、いまある診察とドバイの音声（保護者・聞き手の言葉）をそのまま使う。 */
(function () {
  'use strict';
  var H = window.Hanaseru, A = window.HanaseruAudio, $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var btn = function (k, t, cls, extra) { return '<button type="button" class="' + (cls || 'speak') + '" data-sk="' + k + '" ' + (extra || '') + '>' + t + '</button>'; };
  var S = null, token = 0, rec = null;
  function log() { var s = H.getState(); if (!s.skills) s.skills = {}; return s.skills; }
  function save() { log().updatedAt = Date.now(); H.commit(); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function frame(title, progress) { if ($('skills').hidden) H.openSection('skills'); $('skTitle').textContent = title; $('skProgress').textContent = progress || ''; }
  function words(t) { return String(t).toLowerCase().replace(/[^a-z0-9' ]/g, ' ').split(/\s+/).filter(Boolean); }
  function stopRec() { var r = rec; rec = null; if (r) { r.onresult = r.onerror = r.onend = null; try { r.abort(); } catch (_) {} } }
  // 一度だけ声を拾う（言い終わると止まる）。聞き取れた文字を cb に渡す。
  function hearOnce(cb, statusEl) {
    A.stop(''); stopRec();
    if (!SR) { cb(null); return; }
    var r; try { r = new SR(); } catch (_) { cb(null); return; }
    rec = r; r.lang = 'en-US'; r.interimResults = false; r.continuous = false; var got = false;
    if (statusEl) statusEl.textContent = '🎤 どうぞ。';
    var timer = setTimeout(function () { if (rec === r) { stopRec(); if (!got) cb(''); } }, 15000);
    r.onresult = function (e) { got = true; clearTimeout(timer); var t = Array.prototype.map.call(e.results, function (x) { return x[0].transcript; }).join(' ').trim(); if (rec === r) rec = null; H.bumpTalk(1); cb(t); };
    r.onerror = function () { clearTimeout(timer); if (rec === r) { rec = null; if (!got) cb(''); } };
    r.onend = function () { clearTimeout(timer); if (rec === r) { rec = null; if (!got) cb(''); } };
    try { r.start(); } catch (_) { rec = null; cb(''); }
  }

  // ---- 入口 ----
  function menu() {
    stopRec(); token++; S = null; var k = log();
    frame('🎯 基礎トレ', '聞く力と、文にする力');
    var row = function (id, icon, name, sub) { return '<button class="sc-row" data-sk="open" data-id="' + id + '"><b>' + icon + ' ' + name + '</b><span>' + sub + '</span></button>'; };
    $('skBody').innerHTML = row('sound', '🔊', '音：つながる音・まぎらわしい音', k.sound ? Object.keys(k.sound).length + ' / ' + (window.HANASERU_SOUNDS || []).length : '')
      + row('hold', '🧠', '持つ：前に言ったことを覚えておく', k.hold ? '最長 ' + (k.hold.best || 1) + '文' : '')
      + row('recover', '⏩', '止まらない：最後の一文をつかむ', k.recover ? k.recover.ok + ' / ' + (k.recover.ok + k.recover.ng) : '')
      + row('repeat', '🗣', 'まねる：聞いてすぐ言う', k.repeat ? k.repeat.n + '回' : '')
      + row('talk', '📻', '長い話：区切って聞き、要点をつかむ', k.talk ? k.talk.n + '本' : '')
      + row('build', '🧱', '文にする：単語から、つながった文へ', k.build ? Object.keys(k.build).length + ' / ' + (window.HANASERU_BUILDS || []).length : '');
    $('skActions').innerHTML = '';
  }

  // ---- ①② 持つ・止まらない ----
  function pool() { return (window.HANASERU_SCENES || []).filter(function (s) { return s.voices && (s.track === 'consult' || s.track === 'dubai') && s.turns.length >= 5; }); }
  function spanRound(mode) {
    var k = log(), span = mode === 'hold' ? Math.max(1, Math.min(5, (S && S.span) || (k.hold && k.hold.span) || 2)) : pick([2, 2, 3]);
    var s = pick(pool()), start = Math.floor(Math.random() * (s.turns.length - span + 1)), played = s.turns.slice(start, start + span);
    var ti = mode === 'hold' ? (span === 1 ? 0 : Math.floor(Math.random() * (span - 1))) : span - 1, target = played[ti];
    var rest = s.turns.filter(function (t) { return played.indexOf(t) < 0; });
    var opts = [target].concat(mode === 'hold' && span > 1 ? [played[span - 1]] : [], shuffle(rest)).slice(0, 3);
    S = { kind: mode, span: span, played: played, target: target, ti: ti, opts: shuffle(opts), phase: 'ready', round: (S && S.kind === mode ? S.round : 0) + 1, ok: S && S.kind === mode ? S.ok : 0, best: S && S.kind === mode ? S.best : 0, role: s.role, title: s.title, replay: 0 };
    spanRender();
  }
  function spanPlay() {
    var t = ++token, i = 0; S.phase = 'listening'; spanRender(); H.recordActivity();
    var next = function () {
      if (t !== token || !S) return;
      if (i >= S.played.length) { S.phase = 'answer'; spanRender(); return; }
      var line = S.played[i], last = i === S.played.length - 1; i++;
      A.say(line.heard, { rate: S.kind === 'recover' && !last ? 1.3 : 1, callbacks: { end: function () { setTimeout(next, 250); }, error: next, blocked: function () { if (t === token) $('skProgress').textContent = '画面下の ▶ を押すと続きます。'; } } });
    };
    next();
  }
  function spanRender() {
    var hold = S.kind === 'hold', n = S.played.length;
    frame(hold ? '🧠 持つ' : '⏩ 止まらない', S.round + ' / 6 ・ ' + (hold ? n + '文を続けて' : '前は速く流れます'));
    var q = hold ? (n === 1 ? '何と言いましたか。' : (S.ti + 1) + '番目に言ったのは、どれですか。') : '最後に言ったのは、どれですか。';
    var html = '<div class="card"><p class="muted">' + esc(S.role) + '</p>';
    if (S.phase === 'ready') html += btn('spanPlay', '▶ 聞く（' + n + '文）', 'big');
    else if (S.phase === 'listening') html += '<p class="stat">聞いています…</p>';
    else {
      var done = S.phase === 'done';
      html += '<p class="qz-q">' + q + '</p>' + S.opts.map(function (o, i) {
        var cls = 'qz-opt' + (done ? (o === S.target ? ' right' : i === S.pick ? ' wrong' : '') : '');
        return '<button class="' + cls + '" data-sk="spanPick" data-n="' + i + '"' + (done ? ' disabled' : '') + '>' + esc(o.heardJa) + '</button>';
      }).join('');
      if (!done && S.replay < 1) html += btn('spanReplay', '🔁 もう一度だけ聞く');
      if (done) html += '<div class="qz-after"><p class="' + (S.right ? 'fbok' : 'fbtip') + '">' + (S.right ? '✓ 持てました' : (hold ? '✗ 前の文が抜けました' : '✗ 最後の文をつかめませんでした')) + '</p>'
        + S.played.map(function (l, i) { return '<p lang="en"' + (l === S.target ? ' class="en"' : '') + '>' + (i + 1) + '. ' + esc(l.heard) + '</p><p class="muted">' + esc(l.heardJa) + '</p>'; }).join('')
        + (!hold ? '<p class="muted">聞き返すなら：<span lang="en">Sorry, could you say the last part again?</span></p>' : '') + '</div>';
    }
    $('skBody').innerHTML = html + '</div>';
    $('skActions').innerHTML = (S.phase === 'done' ? btn('spanNext', S.round < 6 ? '次へ' : '結果を見る', 'big') + btn('spanAgain', '🔊 もう一度聞く') : '') + btn('menu', '基礎トレへ戻る');
  }
  function spanPicked(n) {
    S.pick = n; S.right = S.opts[n] === S.target; S.phase = 'done'; A.stop('');
    var k = log();
    if (S.kind === 'hold') {
      if (S.right) { S.ok++; S.best = Math.max(S.best, S.span); }
      var h = k.hold || { span: 2, best: 1, n: 0 }; h.n++; if (S.right) h.best = Math.max(h.best || 1, S.span);
      h.span = S.right ? Math.min(5, S.span + 1) : Math.max(1, S.span - 1); k.hold = h; S.nextSpan = h.span;
    } else { var r = k.recover || { ok: 0, ng: 0 }; if (S.right) { r.ok++; S.ok++; } else r.ng++; k.recover = r; }
    if (!S.right) H.focus.add(S.target.heard, S.target.heardJa, 'listen');
    save(); spanRender();
  }
  function spanSummary() {
    var hold = S.kind === 'hold'; frame(hold ? '🧠 持つ：できました' : '⏩ 止まらない：できました', '');
    $('skBody').innerHTML = '<div class="card"><p>' + (hold ? '正解 ' + S.ok + ' / 6。持てた最長は <b>' + (S.best || 1) + '文</b>。これまでの最長 ' + (log().hold.best || 1) + '文。' : '最後の一文をつかめた：<b>' + S.ok + ' / 6</b>') + '</p>'
      + '<p class="muted">外した文は、つまずき直しに入れました。</p></div>';
    $('skActions').innerHTML = btn('open', 'もう6問', 'big', 'data-id="' + S.kind + '"') + btn('menu', '基礎トレへ戻る') + '<button class="speak" data-action="home">ホームへ</button>';
    H.menuDone('pv'); S = null;
  }

  // ---- ③ 音 ----
  function soundStart() {
    var all = window.HANASERU_SOUNDS || [], k = log(), seen = k.sound || {};
    var rank = function (x) { var g = seen[x.id]; return !g ? 1 : g.ng > g.ok ? 0 : 2; };
    var items = shuffle(all).sort(function (a, b) { return rank(a) - rank(b); }).slice(0, 8).map(function (x) {
      return { id: x.id, en: x.en, ja: x.ja, q: '何と言いましたか。（' + x.focus + '）', options: x.options, answer: x.answer, after: x.note, slow: x.slow || null, optLang: 'en', written: x.options[x.answer] };
    });
    if (!items.length) return;
    window.HanaseruQuiz.start(items, { title: '🔊 音', sub: 'つながる音・まぎらわしい音', feedback: true,
      onAnswer: function (x, ok) { var s = log(); if (!s.sound) s.sound = {}; var g = s.sound[x.id] || { ok: 0, ng: 0 }; if (ok) g.ok++; else g.ng++; s.sound[x.id] = g; save(); if (!ok) H.focus.add(x.written, x.ja, 'listen'); },
      onDone: function (r) {
        var ok = r.items.filter(function (x, i) { return r.picks[i] === x.answer; }).length;
        frame('🔊 音：' + ok + ' / ' + r.items.length, 'これまでに聞いた ' + Object.keys(log().sound || {}).length + ' / ' + all.length);
        $('skBody').innerHTML = '<div class="card">' + r.items.map(function (x, i) { return '<p>' + (r.picks[i] === x.answer ? '✓' : '✗') + ' <span lang="en">' + esc(x.written) + '</span></p>'; }).join('') + '</div>';
        $('skActions').innerHTML = btn('open', 'もう8問', 'big', 'data-id="sound"') + btn('menu', '基礎トレへ戻る') + '<button class="speak" data-action="home">ホームへ</button>';
        H.menuDone('pv');
      } });
    window.HanaseruQuiz.playFirst();
  }

  // ---- ④ まねる ----
  function repeatItems() {
    var out = [];
    (window.HANASERU_LISTENING_LESSONS || []).forEach(function (l) { l.chunks.forEach(function (c) { if (words(c[0]).length >= 4) out.push({ en: c[0], ja: c[1] }); }); });
    (window.HANASERU_SOUNDS || []).forEach(function (x) { if (x.kind === 'reduce') out.push({ en: x.en, ja: x.ja, written: x.options[x.answer] }); });
    return shuffle(out).slice(0, 6);
  }
  function repeatRender() {
    var x = S.items[S.i];
    if (!x) {
      var avg = S.scores.length ? Math.round(S.scores.reduce(function (a, b) { return a + b; }, 0) / S.scores.length) : 0;
      frame('🗣 まねる：できました', ''); var k = log(); k.repeat = { n: ((k.repeat || {}).n || 0) + S.scores.length, last: avg }; save();
      $('skBody').innerHTML = '<div class="card"><p>機械が聞き取れた語：平均 <b>' + avg + '%</b></p><p class="muted">発音の採点ではありません。落とした語は、弱く短く言う語であることが多いです。</p></div>';
      $('skActions').innerHTML = btn('open', 'もう6文', 'big', 'data-id="repeat"') + btn('menu', '基礎トレへ戻る') + '<button class="speak" data-action="home">ホームへ</button>';
      H.menuDone('speak'); S = null; return;
    }
    frame('🗣 まねる', (S.i + 1) + ' / ' + S.items.length);
    var target = x.written || x.en, html = '<div class="card">' + btn('repPlay', '▶ 聞く', 'big');
    if (S.heard != null) {
      var got = {}; words(S.heard).forEach(function (w) { got[w] = (got[w] || 0) + 1; });
      var hit = 0, tw = target.split(/\s+/), marked = tw.map(function (w) { var k = words(w)[0]; if (k && got[k]) { got[k]--; hit++; return esc(w); } return '<mark>' + esc(w) + '</mark>'; }).join(' ');
      S.score = Math.round(hit / tw.length * 100);
      html += '<p class="en" lang="en">' + marked + '</p><p>' + esc(x.ja) + '</p><p class="stat">聞き取れた語 ' + hit + ' / ' + tw.length + (S.heard ? '' : '（声が届きませんでした）') + '。印は、機械が拾えなかった語です。</p>';
    } else if (S.shown) html += '<p class="en" lang="en">' + esc(target) + '</p><p>' + esc(x.ja) + '</p>';
    else html += '<p class="muted" id="skStatus">聞いたら、すぐ同じように言う。</p>';
    $('skBody').innerHTML = html + '</div>';
    $('skActions').innerHTML = (S.heard != null ? btn('repNext', '次へ', 'big') + btn('repTalk', '🎤 もう一度言う')
      : (SR ? btn('repTalk', '🎤 言う', 'big') : '') + btn('repShow', '英文を見る') + (S.shown || !SR ? btn('repNext', '次へ') : '')) + btn('menu', '基礎トレへ戻る');
  }

  // ---- ⑤ 文にする ----
  function buildStart() {
    var all = window.HANASERU_BUILDS || [], seen = log().build || {};
    var rank = function (x) { var g = seen[x.id]; return !g ? 1 : g.ng > g.ok ? 0 : 2; };
    S = { kind: 'build', items: shuffle(all).sort(function (a, b) { return rank(a) - rank(b); }).slice(0, 5), i: 0, step: 0, said: null, tip: null, ok: 0 };
    buildRender();
  }
  function buildRender() {
    var x = S.items[S.i];
    if (!x) {
      frame('🧱 文にする：できました', ''); $('skBody').innerHTML = '<div class="card"><p>伸ばして言えた：<b>' + S.ok + ' / ' + S.items.length + '</b></p><p class="muted">「まだ」の文は、つまずき直しに入れました。</p></div>';
      $('skActions').innerHTML = btn('open', 'もう5文', 'big', 'data-id="build"') + btn('menu', '基礎トレへ戻る') + '<button class="speak" data-action="home">ホームへ</button>';
      H.menuDone('speak'); S = null; return;
    }
    var first = S.step < 2, shown = S.step === 1 || S.step === 3, goal = first ? x.model : x.longer;
    frame('🧱 文にする', (S.i + 1) + ' / ' + S.items.length + ' ・ ' + (first ? '① 1文にする' : '② 足して伸ばす'));
    var html = '<div class="card"><p class="ja">' + esc(first ? x.ja : x.addJa) + '</p>'
      + (first ? '<p class="sk-keys">' + x.keys.map(function (k) { return '<span lang="en">' + esc(k) + '</span>'; }).join('') + '</p><p class="stat">型：<span lang="en">' + esc(x.frame) + '</span></p>'
               : '<p class="muted" lang="en">' + esc(x.model) + ' …</p>');
    if (S.said != null) html += '<p class="bubble me" style="max-width:100%">' + esc(S.said || '（声が届きませんでした）') + '</p>' + (S.tip ? '<p class="fbtip">' + esc(S.tip) + '</p>' : '');
    if (shown) html += '<div class="qz-after"><p class="muted">手本</p><p class="en" lang="en">' + esc(goal) + '</p>' + (first ? '' : '<p>' + esc(x.longerJa) + '</p>') + '<p class="muted">' + esc(x.note) + '</p>' + btn('bldPlay', '▶ 手本を聞く') + '</div>';
    else html += '<p class="muted" id="skStatus"></p>';
    $('skBody').innerHTML = html + '</div>';
    $('skActions').innerHTML = (shown ? (first ? btn('bldNext', '理由や例を足す →', 'big') : '<div class="speakrow">' + btn('bldOk', '言えた', 'ok') + btn('bldNg', 'まだ', 'ng') + '</div>')
      : (SR ? btn('bldTalk', '🎤 言ってみる', 'big') : '') + btn('bldShow', '手本を見る')) + btn('menu', '基礎トレへ戻る');
  }
  function buildSaid(text) {
    if (!S || S.kind !== 'build') return;
    S.said = text || ''; S.tip = null; S.step = S.step < 2 ? 1 : 3; buildRender();
    var x = S.items[S.i], at = S.i + ':' + S.step;
    // ログイン中は、言った文への一言をAIからもらう（会話と同じ助言の仕組み）
    if (text && H.loggedIn && H.loggedIn() && H.ai) H.ai({ mode: 'feedback', scene: 'free', messages: [{ role: 'user', content: '(I am trying to say: ' + (S.step === 1 ? x.model : x.longer) + ') ' + text }] })
      .then(function (res) { if (S && S.kind === 'build' && S.i + ':' + S.step === at) { S.tip = res.data.result.tip; buildRender(); } }).catch(function () {});
  }

  // ---- 📻 長い話 ----
  // 一人が1分ほど話す英語を、3つの区切りで聞く。区切りごとに要点を確かめ、最後に通しで聞く（保持の練習）。
  function talkList(note) {
    S = null; frame('📻 長い話', '区切って聞き、要点をつかむ');
    var logged = H.loggedIn && H.loggedIn();
    $('skBody').innerHTML = (window.HANASERU_TALKS || []).map(function (t) { return '<button class="sc-row" data-sk="talkOpen" data-id="' + t.id + '"><b>' + esc(t.title) + '</b><span>' + esc(t.topic) + '</span></button>'; }).join('')
      + '<div class="card"><p><b>📋 自分で選んだ英文を貼って聞く</b></p>'
      + '<textarea id="skOwn" rows="4" maxlength="4000" placeholder="好きなページの英文を、ここに貼る（この端末の中だけに保存）" lang="en"></textarea>'
      + btn('ownStart', '区切って聞く', 'big')
      + ownList().map(function (o) { return '<div class="sk-own"><button class="sc-row" data-sk="ownOpen" data-id="' + o.id + '"><b lang="en">' + esc(o.text.slice(0, 44)) + '…</b><span>' + o.words + '語</span></button><button class="speak" data-sk="ownDel" data-id="' + o.id + '" aria-label="この英文を消す">✕</button></div>'; }).join('')
      + '<p class="muted" style="font-size:11px">ご自身の学習用です。患者さんの情報は貼らないでください。ログイン中は、区切りごとの要点の問いをAIが作ります。</p></div>'
      + '<div class="card"><p><b>✨ 好きな話題で、新しい話を作る</b></p>'
      + '<input id="skTopic" type="text" maxlength="120" placeholder="例：小型機のパイロットが、着陸の手順を話す" lang="ja">'
      + '<div class="speakrow sk-topics">' + ['飛行機・パイロットの話', '旅の工夫', '医師の仕事の一日', '料理・食べ物'].map(function (x) { return '<button class="chip" data-sk="talkTopic" data-t="' + x + '">' + x + '</button>'; }).join('') + '</div>'
      + (logged ? btn('talkMake', '話を作る（10〜20秒）', 'big') : '<p class="fbtip">新しい話を作るには、Googleログインが必要です。上の3本はログインなしで使えます。</p>')
      + '<p class="stat" id="skStatus" role="status">' + esc(note || '') + '</p></div>';
    $('skActions').innerHTML = btn('menu', '基礎トレへ戻る');
  }
  // ---- 📋 自分で貼った英文（この端末の中だけ。同期しない・公開しない） ----
  var OWN_KEY = 'hanaseru-own-texts-v1';
  function ownList() { try { var a = JSON.parse(localStorage.getItem(OWN_KEY)); return Array.isArray(a) ? a : []; } catch (_) { return []; } }
  function ownSave(a) { try { localStorage.setItem(OWN_KEY, JSON.stringify(a.slice(0, 12))); } catch (_) {} }
  // 文の切れ目で、40〜70語ずつの区切りにする（最大8区切り）
  function ownChunks(text) {
    var sents = String(text).replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s+(?=[A-Z0-9"'“(])/), out = [], cur = [];
    var count = function (a) { return a.join(' ').split(/\s+/).filter(Boolean).length; };
    sents.forEach(function (x) {
      if (!x) return;
      if (cur.length && count(cur.concat([x])) > 70) { out.push(cur.join(' ')); cur = []; }
      cur.push(x);
      if (count(cur) >= 40) { out.push(cur.join(' ')); cur = []; }
    });
    if (cur.length) { if (out.length && count(cur) < 15) out[out.length - 1] += ' ' + cur.join(' '); else out.push(cur.join(' ')); }
    return out.map(function (c) { return c.slice(0, 780); }).slice(0, 8);
  }
  function ownBegin(o) {
    var chunks = ownChunks(o.text); if (!chunks.length) return;
    var t = { id: o.id, own: true, title: '自分で選んだ英文', speaker: chunks.length + '区切り・' + o.words + '語', note: '', parts: chunks.map(function (c) { return { en: c, ja: '', q: '', options: null, answer: -1 }; }) };
    talkBegin(t);
    // ログイン中は、区切りごとの要点と問いをAIに作ってもらう（英文は作らせない）。届いた分から使う。
    if (H.loggedIn && H.loggedIn() && H.ai) H.ai({ mode: 'listen', style: 'own', chunks: chunks }).then(function (res) {
      (res.data.result.parts || []).forEach(function (x, i) { var p = t.parts[i]; if (!p) return; p.ja = x.gist_ja || ''; if (x.options_ja && x.options_ja.length === 3) { p.q = x.q_ja; p.options = x.options_ja; p.answer = x.answer; } });
      if (S && S.t === t && S.phase === 'answer') talkRender();
    }).catch(function () {});
  }
  function talkBegin(t, audio) { S = { kind: 'talk', t: t, i: 0, phase: 'ready', ok: 0, audio: audio || null }; talkRender(); talkPlay(); }
  function talkPlay() {
    var t = ++token, p = S.t.parts[S.i]; S.phase = 'listening'; talkRender(); H.recordActivity();
    A.say(p.en, { rate: 1, audio: S.audio ? S.audio[S.i] : null, callbacks: {
      end: function () { if (t === token && S && S.kind === 'talk') { S.phase = 'answer'; talkRender(); } },
      error: function () { if (t === token && S && S.kind === 'talk') { S.phase = 'answer'; talkRender(); } },
      blocked: function () { if (t !== token) return; $('skProgress').textContent = '画面下の ▶ を押すと再生します。'; if (S && S.kind === 'talk' && S.t.own) { S.phase = 'answer'; talkRender(); } } } });   // 自分の英文は読み上げが始まらないことがあるので、先へ進めるようにする
  }
  function talkAll() {
    var t = ++token, i = 0; H.recordActivity();
    var next = function () { if (t !== token || !S || i >= S.t.parts.length) return; var p = S.t.parts[i], a = S.audio ? S.audio[i] : null; i++; A.say(p.en, { rate: 1, audio: a, callbacks: { end: function () { setTimeout(next, 200); }, error: next } }); };
    next();
  }
  function talkRender() {
    var T = S.t, n = T.parts.length, p = T.parts[S.i];
    if (S.phase === 'all') {
      frame('📻 ' + T.title, '要点 ' + S.ok + ' / ' + n);
      $('skBody').innerHTML = '<div class="card">' + btn('talkAll', '▶ 通しで聞く（区切りなし）', 'big') + '<p class="muted">' + esc(T.note || '') + '</p>'
        + '<details><summary>英文と要点を見る</summary>' + T.parts.map(function (x, i) { return '<p lang="en">' + (i + 1) + '. ' + esc(x.en) + '</p><p class="muted">' + esc(x.ja) + '</p>'; }).join('') + '</details></div>';
      $('skActions').innerHTML = btn('talkBack', 'ほかの話へ', 'big') + btn('menu', '基礎トレへ戻る') + '<button class="speak" data-action="home">ホームへ</button>';
      return;
    }
    frame('📻 ' + T.title, (S.i + 1) + ' / ' + n + ' ・ ' + (T.speaker || ''));
    var html = '<div class="card">';
    if (S.phase === 'ready') html += btn('talkPlay', '▶ 聞く', 'big');
    else if (S.phase === 'listening') html += '<p class="stat">聞いています…</p>';
    else {
      var done = S.phase === 'done';
      if (p.options) html += '<p class="qz-q">' + esc(p.q) + '</p>' + p.options.map(function (o, i) {
        var cls = 'qz-opt' + (done ? (i === p.answer ? ' right' : i === S.pick ? ' wrong' : '') : '');
        return '<button class="' + cls + '" data-sk="talkPick" data-n="' + i + '"' + (done ? ' disabled' : '') + '>' + esc(o) + '</button>';
      }).join('');
      else if (!done) html += '<p class="qz-q">いまの区切りの要点を、日本語で言えますか。</p><div class="speakrow">' + btn('talkSelf', '言えた', 'ok', 'data-ok="1"') + btn('talkSelf', 'あいまい', 'ng', 'data-ok="0"') + '</div>';
      if (!done) html += btn('talkPlay', '🔁 もう一度聞く');
      else html += '<div class="qz-after"><p class="' + (S.right ? 'fbok' : 'fbtip') + '">' + (S.right ? '✓ 要点をつかめました' : '✗ ここが抜けました') + '</p>' + (p.ja ? '<p>' + esc(p.ja) + '</p>' : '') + '<details' + (S.t.own ? ' open' : '') + '><summary>英文を見る</summary><p class="en" lang="en">' + esc(p.en) + '</p></details></div>';
    }
    $('skBody').innerHTML = html + '</div>';
    $('skActions').innerHTML = (S.phase === 'done' ? btn('talkNext', S.i + 1 < n ? '続きを聞く →' : '通しで聞く →', 'big') + btn('talkPlay', '🔊 この区切りをもう一度') : '') + btn('talkBack', 'ほかの話へ');
  }
  function talkMake() {
    var topic = ($('skTopic').value || '').trim(); if (!topic) { $('skStatus').textContent = '話題を入れるか、下の例を選んでください。'; return; }
    var t = ++token; $('skStatus').textContent = '話を作っています…（10〜20秒）';
    H.ai({ mode: 'listen', style: 'talk', topicText: topic, focus: H.focus.forAI() }).then(function (res) {
      if (t !== token) return; var d = res.data.result;
      talkBegin({ id: 'ai', title: d.title_ja, speaker: d.speaker_ja, note: d.note_ja, parts: d.parts.map(function (x) { return { en: x.en, ja: x.gist_ja, q: x.q_ja, options: x.options_ja, answer: x.answer }; }) }, res.data.audioParts);
    }).catch(function (e) { if (t === token && $('skStatus')) $('skStatus').textContent = '作れませんでした：' + (e && (e.message || e.code) || e); });
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-action="skillsOpen"]'); if (a) { menu(); return; }
    var b = e.target.closest('[data-sk]'); if (!b) return; var k = b.dataset.sk, id = b.dataset.id;
    if (k === 'menu') return menu();
    if (k === 'open') {
      stopRec(); token++;
      if (id === 'hold' || id === 'recover') { S = null; spanRound(id); spanPlay(); }
      else if (id === 'sound') { S = null; soundStart(); }
      else if (id === 'repeat') { S = { kind: 'repeat', items: repeatItems(), i: 0, heard: null, shown: false, scores: [] }; repeatRender(); A.say(S.items[0].en, { rate: 1 }); }
      else if (id === 'build') buildStart();
      else if (id === 'talk') talkList();
      return;
    }
    if (k === 'talkOpen') { var tk = (window.HANASERU_TALKS || []).find(function (x) { return x.id === id; }); if (tk) talkBegin(tk); return; }
    if (k === 'talkTopic') { $('skTopic').value = b.dataset.t; return; }
    if (k === 'talkMake') return talkMake();
    if (k === 'ownStart') {
      var text = ($('skOwn').value || '').replace(/\s+/g, ' ').trim(), n = text.split(/\s+/).filter(Boolean).length;
      if (n < 15 || !/[a-zA-Z]{3}/.test(text)) { $('skStatus').textContent = '英文を15語以上、貼ってください。'; return; }
      var o = { id: 'own' + Date.now().toString(36), text: text.slice(0, 4000), words: n, ts: Date.now() };
      ownSave([o].concat(ownList())); return ownBegin(o);
    }
    if (k === 'ownOpen') { var ow = ownList().find(function (x) { return x.id === id; }); if (ow) ownBegin(ow); return; }
    if (k === 'ownDel') { ownSave(ownList().filter(function (x) { return x.id !== id; })); return talkList('消しました。'); }
    if (k === 'talkBack') { token++; A.stop(''); return talkList(); }
    if (!S) return;
    if (k === 'talkPlay') talkPlay();
    else if (k === 'talkAll') talkAll();
    else if ((k === 'talkPick' || k === 'talkSelf') && S.phase === 'answer') {
      var part = S.t.parts[S.i]; S.pick = k === 'talkPick' ? +b.dataset.n : -1; S.right = k === 'talkPick' ? S.pick === part.answer : b.dataset.ok === '1'; S.phase = 'done'; A.stop('');
      if (S.right) S.ok++; else if (!S.t.own) H.focus.add(part.en.split(/(?<=[.!?])\s+/)[0], part.ja, 'listen');   // 自分で貼った英文は、つまずき直し（同期される記録）には入れない
      talkRender();
    }
    else if (k === 'talkNext') {
      if (S.i + 1 < S.t.parts.length) { S.i++; talkPlay(); }
      else { var lg = log(); lg.talk = { n: ((lg.talk || {}).n || 0) + 1, last: S.ok + '/' + S.t.parts.length }; save(); H.menuDone('pv'); S.phase = 'all'; talkRender(); }
    }
    else if (k === 'spanPlay' || k === 'spanAgain') spanPlay();
    else if (k === 'spanReplay') { S.replay++; spanPlay(); }
    else if (k === 'spanPick' && S.phase === 'answer') spanPicked(+b.dataset.n);
    else if (k === 'spanNext') { if (S.round >= 6) spanSummary(); else { var kind = S.kind; if (kind === 'hold') S.span = S.nextSpan; spanRound(kind); spanPlay(); } }
    else if (k === 'repPlay') { stopRec(); H.recordActivity(); A.say(S.items[S.i].en, { rate: 1 }); }
    else if (k === 'repShow') { S.shown = true; repeatRender(); }
    else if (k === 'repTalk') { S.heard = null; repeatRender(); hearOnce(function (t) { if (S && S.kind === 'repeat') { S.heard = t == null ? '' : t; repeatRender(); } }, $('skStatus')); }
    else if (k === 'repNext') { if (S.heard != null) S.scores.push(S.score || 0); S.i++; S.heard = null; S.shown = false; repeatRender(); if (S && S.items[S.i]) A.say(S.items[S.i].en, { rate: 1 }); }
    else if (k === 'bldTalk') { hearOnce(function (t) { buildSaid(t == null ? '' : t); }, $('skStatus')); }
    else if (k === 'bldShow') { S.step = S.step < 2 ? 1 : 3; buildRender(); }
    else if (k === 'bldPlay') { var x = S.items[S.i]; H.speak(S.step < 2 ? x.model : x.longer); }
    else if (k === 'bldNext') { S.step = 2; S.said = null; S.tip = null; buildRender(); }
    else if (k === 'bldOk' || k === 'bldNg') {
      var it = S.items[S.i], s = log(); if (!s.build) s.build = {}; var g = s.build[it.id] || { ok: 0, ng: 0 };
      if (k === 'bldOk') { g.ok++; S.ok++; } else { g.ng++; H.focus.add(it.longer, it.longerJa, 'talk'); }
      s.build[it.id] = g; save(); H.recordActivity(); S.i++; S.step = 0; S.said = null; S.tip = null; buildRender();
    }
  });
  document.addEventListener('hanaseru:leave', function () { token++; stopRec(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) { token++; stopRec(); } });
}());
