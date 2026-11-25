/* Hanaseru — 聞いて、意味を選ぶ（耳の練習と、現在地チェックの聞き取りの共通の仕組み）
   ・英文は見せずに音だけを流す → 日本語の4択 → 答えのあとで英文と意味を見せる。
   ・🧩 熟語の耳トレ：簡単な言葉の熟語（get over / run out of …）を、自然な速さの文の中で聞き取る。
     外した問題は「つまずき直し」に入り、AI会話と新しい耳トレにもう一度出る。
   ・現在地チェックでは、答えを最後まで見せない（assess.js が run() を使う）。 */
(function () {
  'use strict';
  var H = window.Hanaseru, $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var run = null;   // {items:[{id,en,ja,q,options,answer,after}], i, picks, plays, opts}
  function rng(seed) { var x = seed % 2147483647 || 7; return function () { x = x * 16807 % 2147483647; return (x - 1) / 2147483646; }; }
  function shuffle(a, r) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function play(x) { run.plays[run.i] = (run.plays[run.i] || 0) + 1; H.recordActivity(); window.HanaseruAudio.say(x.en, { rate: 1 }); }

  function render() {
    var o = run.opts, x = run.items[run.i];
    if (!x) { window.HanaseruAudio.stop(''); var done = run; run = null; done.opts.onDone(done); return; }
    var picked = run.picks[run.i], answered = picked != null && o.feedback;
    $('qzTitle').textContent = o.title; $('qzProgress').textContent = (run.i + 1) + ' / ' + run.items.length + (o.sub ? ' ・ ' + o.sub : '');
    var limit = o.maxPlays && (run.plays[run.i] || 0) >= o.maxPlays;
    $('qzBody').innerHTML = '<div class="card"><p class="muted">英文は見ずに、音だけで。' + (o.maxPlays ? '聞けるのは' + o.maxPlays + '回までです。' : '') + '</p>'
      + '<button class="big" data-qz="play"' + (limit ? ' disabled' : '') + '>▶ 聞く</button>'
      + '<p class="qz-q">' + esc(x.q) + '</p>'
      + x.options.map(function (t, n) {
        var cls = 'qz-opt' + (answered ? (n === x.answer ? ' right' : n === picked ? ' wrong' : '') : (picked === n ? ' picked' : ''));
        return '<button class="' + cls + '" data-qz="pick" data-n="' + n + '"' + (answered ? ' disabled' : '') + '>' + esc(t) + '</button>';
      }).join('')
      + (answered ? '<div class="qz-after"><p class="' + (picked === x.answer ? 'fbok' : 'fbtip') + '">' + (picked === x.answer ? '✓ 聞き取れました' : '✗ ここが聞き取りの伸びしろです（つまずき直しに入れました）') + '</p>'
        + '<p class="en" lang="en">' + esc(x.en) + '</p><p>' + esc(x.ja) + '</p>' + (x.after ? '<p class="muted">' + esc(x.after) + '</p>' : '') + '</div>' : '')
      + '</div>';
    $('qzActions').innerHTML = (answered ? '<button class="speak" data-qz="play">🔊 英文を見ながら、もう一度</button><button class="big" data-qz="next">' + (run.i + 1 < run.items.length ? '次へ' : '結果を見る') + '</button>'
      : (!o.feedback && picked != null ? '<button class="big" data-qz="next">' + (run.i + 1 < run.items.length ? '次へ' : '聞き取りを終える') + '</button>' : ''))
      + '<button class="speak" data-action="home">中断してホームへ</button>';
  }
  function start(items, opts) {
    H.openSection('quiz');   // 先に画面を開く（開くときの「画面を離れた」合図で、進行中の内容が消えないように）
    run = { items: items, i: 0, picks: [], plays: [], opts: opts }; render(); $('qzTitle').focus();
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-qz]'); if (!b || !run) return; var a = b.dataset.qz, x = run.items[run.i];
    if (a === 'play') { play(x); if (run.opts.maxPlays) render(); }
    else if (a === 'pick') {
      run.picks[run.i] = +b.dataset.n;
      if (run.opts.feedback) { window.HanaseruAudio.stop(''); if (run.opts.onAnswer) run.opts.onAnswer(x, run.picks[run.i] === x.answer); }
      render();
    } else if (a === 'next') { run.i++; render(); if (run && run.items[run.i]) play(run.items[run.i]); window.scrollTo(0, 0); }   // 「次へ」のタップの中で次の音を鳴らす
  });
  document.addEventListener('hanaseru:leave', function () { run = null; });

  // ---- 🧩 熟語の耳トレ ----
  function phrasalItems(n) {
    var all = window.HANASERU_PHRASALS || [], log = (H.getState().quiz || {}).pv || {}, r = rng(H.today() * 31 + Object.keys(log).length);
    var rank = function (p) { var g = log[p.id]; return !g ? 1 : g.ng > g.ok ? 0 : 2 + (g.last || 0) / 1e5; };   // 外した問題→まだの問題→前に解いた問題の順
    var chosen = shuffle(all, r).sort(function (a, b) { return rank(a) - rank(b); }).slice(0, n);
    return chosen.map(function (p) {
      var same = shuffle(all.filter(function (q) { return q.id !== p.id && q.base === p.base; }), r).slice(0, 2);
      var others = shuffle(all.filter(function (q) { return q.id !== p.id && same.indexOf(q) < 0 && q.pv !== p.pv; }), r).slice(0, 3 - same.length);
      var opts = shuffle([p].concat(same, others), r);
      return { id: p.id, en: p.en, ja: p.enJa, q: 'この文の中の熟語は、どの意味でしたか。', options: opts.map(function (q) { return q.ja; }), answer: opts.indexOf(p), after: p.pv + ' ＝ ' + p.ja, pv: p };
    });
  }
  function startPhrasal() {
    start(phrasalItems(8), { title: '🧩 熟語の耳トレ', sub: '簡単な言葉の熟語を、耳で', feedback: true,
      onAnswer: function (x, ok) {
        var s = H.getState(); if (!s.quiz) s.quiz = {}; if (!s.quiz.pv) s.quiz.pv = {};
        var g = s.quiz.pv[x.id] || { ok: 0, ng: 0 }; if (ok) g.ok++; else g.ng++; g.last = H.today(); s.quiz.pv[x.id] = g; H.commit();
        if (!ok) H.focus.add(x.en, x.pv.pv + '（' + x.pv.ja + '）：' + x.ja, 'pv');
      },
      onDone: function (r) {
        var ok = r.items.filter(function (x, i) { return r.picks[i] === x.answer; }).length, log = (H.getState().quiz || {}).pv || {};
        var seen = Object.keys(log).length, total = (window.HANASERU_PHRASALS || []).length;
        H.openSection('quiz'); H.menuDone('focus');
        $('qzTitle').textContent = '🧩 熟語の耳トレ：' + ok + ' / ' + r.items.length; $('qzProgress').textContent = 'これまでに聞いた熟語 ' + seen + ' / ' + total;
        $('qzBody').innerHTML = '<div class="card">' + r.items.map(function (x, i) { return '<p>' + (r.picks[i] === x.answer ? '✓' : '✗') + ' <b lang="en">' + esc(x.pv.pv) + '</b>　' + esc(x.pv.ja) + '</p>'; }).join('')
          + '<p class="muted">外した熟語は「つまずき直し」に入りました。AI会話の相手も、会話の中でもう一度使います。</p></div>';
        $('qzActions').innerHTML = '<button class="big" data-action="quizPhrasal">もう8問</button><button class="speak" data-action="focusOpen">つまずき直しへ</button><button class="speak" data-action="home">ホームへ</button>';
      } });
    play(run.items[0]);
  }
  document.addEventListener('click', function (e) { var t = e.target.closest('[data-action="quizPhrasal"]'); if (t) startPhrasal(); });
  window.HanaseruQuiz = { start: start, playFirst: function () { if (run && run.items[0]) play(run.items[0]); } };
}());
