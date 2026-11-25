/* Hanaseru — 📏 現在地チェック（アプリ内の目安。公式の試験ではない）
   2026-11-25：「本気で取り組んでも、届いたかどうかが分からない」をなくすための、同じ物差し。
   ・聞く10問（初見・自然な速さ・聞けるのは2回まで）＋話す3問（院長の3つの目標＝意見と理由／その場で返す／言い換える）。
   ・3つの版（A・B・C）を順に使う。12週ごとが目安。結果は前回と並べて見せる。
   ・話す3問は、音声入力の文字起こしをAIが 0〜4 で見る（発音は見ない）。話した語数・速さ・つなぎ言葉の数は機械で数える。
   ・話す部分はログインと音声入力が要る。使えないときは聞く部分だけ記録する。 */
(function () {
  'use strict';
  var H = window.Hanaseru, $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var KIND = { opinion: '意見＋理由', respond: 'その場で返す', rephrase: '言い換える' };
  var S = null;   // 進行中の1回分
  function records() { var s = H.getState(); if (!Array.isArray(s.assess)) s.assess = []; return s.assess; }
  function form() { var f = window.HANASERU_ASSESS.forms; return f[records().length % f.length]; }
  function linkWords() {
    var base = ['because', 'so', 'but', 'for example', 'however', 'also', 'actually', 'i mean', "that's why", 'in other words', 'by the way', 'to be honest', 'well', 'which means', 'on top of that', 'the reason is', 'i see', 'right', 'that makes sense'];
    (window.HANASERU_LINK_SCENES || []).forEach(function (s) { (s.phrases || []).forEach(function (p) { var k = p.toLowerCase().replace(/[^a-z' ]/g, ' ').replace(/\s+/g, ' ').trim(); if (k && base.indexOf(k) < 0) base.push(k); }); });
    return base;
  }
  function countLinks(text) {
    var t = ' ' + String(text).toLowerCase().replace(/[^a-z' ]/g, ' ').replace(/\s+/g, ' ') + ' ', n = 0;
    linkWords().forEach(function (k) { var i = 0, key = ' ' + k + ' '; while ((i = t.indexOf(key, i)) >= 0) { n++; i += key.length - 1; } });
    return n;
  }
  H.countLinks = countLinks;

  function intro() {
    var prev = records().slice(-1)[0], can = SR && H.loggedIn && H.loggedIn();
    H.openSection('assess');
    $('asTitle').textContent = '📏 現在地チェック';
    $('asBody').innerHTML = '<div class="card"><p>同じ物差しで、いまの力を測ります。<b>聞く10問</b>（約4分）と、<b>話す3問</b>（約3分）。12週ごとが目安です。</p>'
      + '<p class="muted">アプリ内の目安で、公式の試験ではありません。聞く問題は初見の音声を自然な速さで流します。話す問題は、発音ではなく「伝わる中身」を見ます。</p>'
      + (can ? '' : '<p class="fbtip">' + (SR ? '話す3問はログインが必要です。ログインしていないときは、聞く10問だけ記録します。' : 'この画面では音声入力が使えないため、聞く10問だけ記録します（iPhone は Safari で開くと使えます）。') + '</p>')
      + (prev ? '<p>前回：' + date(prev.at) + '（聞く ' + prev.L.score + ' / ' + prev.L.total + (prev.S ? '・話す ' + sum(prev.S) + ' / ' + prev.S.length * 4 : '') + '）</p>' : '<p>今回が1回目です。</p>')
      + '<p class="muted">静かな所で、通して行ってください。途中でやめると記録されません。</p></div>';
    $('asActions').innerHTML = '<button class="big" data-as="go">始める（聞く10問から）</button>' + (records().length ? '<button class="speak" data-as="history">これまでの記録を見る</button>' : '') + '<button class="speak" data-action="home">ホームへ</button>';
  }
  function date(ms) { var d = new Date(ms); return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate(); }
  function sum(a) { return a.reduce(function (n, x) { return n + (x.score || 0); }, 0); }

  function startListening() {
    var f = form(); S = { form: f.id, f: f, L: null, S: null, si: 0, said: [] };
    window.HanaseruQuiz.start(f.listening.map(function (x) { return { id: x.id, en: x.en, ja: x.ja, q: x.q, options: x.options, answer: x.answer, level: x.level }; }), {
      title: '📏 現在地チェック：聞く', sub: '答えは最後に', feedback: false, maxPlays: 2,
      onDone: function (r) {
        var by = [0, 0, 0], tot = [0, 0, 0], miss = [];
        r.items.forEach(function (x, i) { tot[x.level - 1]++; if (r.picks[i] === x.answer) by[x.level - 1]++; else miss.push(x); });
        S.L = { score: by[0] + by[1] + by[2], total: r.items.length, by: by, tot: tot }; S.miss = miss;
        if (SR && H.loggedIn && H.loggedIn()) speaking(); else finish();
      } });
    window.HanaseruQuiz.playFirst();
  }

  // ---- 話す3問 ----
  var rec = null, tick = null;
  function stopRec() { clearInterval(tick); tick = null; var r = rec; rec = null; if (r) { r.onresult = r.onerror = r.onend = null; try { r.abort(); } catch (_) {} } }
  function speaking() {
    var p = S.f.speaking[S.si];
    if (!p) return score();
    H.openSection('assess');
    $('asTitle').textContent = '📏 現在地チェック：話す ' + (S.si + 1) + ' / ' + S.f.speaking.length;
    var done = S.said[S.si];
    $('asBody').innerHTML = '<div class="card"><p class="muted">' + KIND[p.kind] + '：' + esc(p.hintJa) + '</p>'
      + '<button class="speak" data-as="hear">▶ 相手の言葉を聞く</button>'
      + '<details><summary>聞き取れなかったら、意味を見る</summary><p lang="en">' + esc(p.promptEn) + '</p><p>' + esc(p.promptJa) + '</p></details>'
      + '<p id="asTimer" class="stat" role="status">' + (done ? '話した言葉（音声入力）：' : '聞いたら、「話す」を押して英語で答えてください（最大 ' + p.seconds + ' 秒）。') + '</p>'
      + (done ? '<p class="bubble me" style="max-width:100%">' + esc(done.text || '（聞き取れませんでした）') + '</p>' : '') + '</div>';
    $('asActions').innerHTML = (done ? '<button class="big" data-as="nextS">' + (S.si + 1 < S.f.speaking.length ? '次の問いへ' : '結果を見る') + '</button><button class="speak" data-as="talk">録り直す</button>'
      : '<button class="big" data-as="talk">🎤 話す</button>') + '<button class="speak" data-action="home">中断してホームへ</button>';
  }
  function capture() {
    var p = S.f.speaking[S.si], text = '', t0 = Date.now(), first = 0, last = 0;
    window.HanaseruAudio.stop(''); stopRec();
    var r; try { r = new SR(); } catch (_) { $('asTimer').textContent = 'マイクを準備できませんでした。もう一度押してください。'; return; }
    rec = r; r.lang = 'en-US'; r.interimResults = true; r.continuous = true;
    r.onresult = function (e) {
      var fin = '', tmp = ''; for (var i = 0; i < e.results.length; i++) { if (e.results[i].isFinal) fin += e.results[i][0].transcript + ' '; else tmp += e.results[i][0].transcript; }
      text = (fin + tmp).trim(); if (text && !first) first = Date.now(); last = Date.now();
    };
    r.onend = function () { if (tick && rec === r) { try { r.start(); } catch (_) {} } };   // iPhone は途中で切れるので、時間内は続ける
    r.onerror = function (e) { if (e && (e.error === 'not-allowed' || e.error === 'service-not-allowed')) { stopRec(); $('asTimer').textContent = 'マイクが許可されていません。Safariの設定でマイクを許可してから、もう一度どうぞ。'; } };
    try { r.start(); } catch (_) { stopRec(); $('asTimer').textContent = 'マイクを開始できませんでした。もう一度押してください。'; return; }
    $('asActions').innerHTML = '<button class="big" data-as="stopTalk">■ 話し終えた</button>';
    var end = function () {
      if (!tick) return; stopRec();
      var words = text ? text.split(/\s+/).length : 0, sec = first ? Math.max(3, (last - first) / 1000) : 0;
      S.said[S.si] = { text: text, words: words, wpm: sec ? Math.round(words / sec * 60) : 0, links: countLinks(text) };
      H.bumpTalk(1); speaking();
    };
    S.end = end;
    tick = setInterval(function () {
      var left = Math.max(0, p.seconds - Math.floor((Date.now() - t0) / 1000));
      var el = $('asTimer'); if (el) el.textContent = '🔴 聞いています。あと ' + left + ' 秒。止まっても、言い換えて続けてください。';
      if (left <= 0) setTimeout(end, 500);
    }, 250);
  }
  function score() {
    H.openSection('assess');
    $('asTitle').textContent = '📏 現在地チェック'; $('asBody').innerHTML = '<p class="muted">話した内容を見ています…</p>'; $('asActions').innerHTML = '';
    var items = S.f.speaking.map(function (p, i) { return { kind: p.kind, prompt: p.promptEn, said: (S.said[i] || {}).text || '' }; });
    H.ai({ mode: 'assess', items: items }).then(function (res) {
      var sc = res.data.result.scores || [];
      S.S = S.f.speaking.map(function (p, i) { var a = S.said[i] || {}; return { kind: p.kind, words: a.words || 0, wpm: a.wpm || 0, links: a.links || 0, score: (sc[i] || {}).score || 0, comment: (sc[i] || {}).comment_ja || '' }; });
      finish();
    }).catch(function (e) {
      S.S = null; S.note = '話す3問は採点できませんでした（' + (e && (e.message || e.code) || e) + '）。聞く10問だけ記録します。'; finish();
    });
  }
  function finish() {
    var recs = records(), prev = recs.slice(-1)[0];
    var r = { at: Date.now(), d: H.today(), form: S.form, L: S.L, S: S.S, updatedAt: Date.now() };
    recs.push(r); if (recs.length > 40) H.getState().assess = recs.slice(-40);
    (S.miss || []).slice(0, 3).forEach(function (x) { /* 聞き取れなかった文は、つまずき直しで英文を見て聞き直す */ H.focus.add(x.en, x.ja, 'assess'); });
    H.commit(); H.recordActivity();
    show(r, prev, S.note); S = null;
  }
  function diff(now, before) { if (before == null) return ''; var d = now - before; return d === 0 ? '（前回と同じ）' : '（前回より ' + (d > 0 ? '+' : '') + d + '）'; }
  function show(r, prev, note) {
    H.openSection('assess');
    $('asTitle').textContent = '📏 現在地：' + date(r.at) + '（版 ' + r.form + '）';
    var L = r.L, lv = ['やさしい', 'ふつう', '速い・くだけた'];
    var html = '<div class="card"><h3>聞く：' + L.score + ' / ' + L.total + ' ' + diff(L.score, prev && prev.L.score) + '</h3>'
      + L.by.map(function (n, i) { return '<p class="stat">' + lv[i] + '：' + n + ' / ' + L.tot[i] + '</p>'; }).join('') + '</div>';
    if (r.S) {
      var words = r.S.reduce(function (n, x) { return n + x.words; }, 0), links = r.S.reduce(function (n, x) { return n + x.links; }, 0);
      var sp = r.S.filter(function (x) { return x.wpm; }), wpm = sp.length ? Math.round(sp.reduce(function (n, x) { return n + x.wpm; }, 0) / sp.length) : 0;
      var pw = prev && prev.S ? prev.S.reduce(function (n, x) { return n + x.words; }, 0) : null, pl = prev && prev.S ? prev.S.reduce(function (n, x) { return n + x.links; }, 0) : null;
      html += '<div class="card"><h3>話す：' + sum(r.S) + ' / ' + r.S.length * 4 + ' ' + diff(sum(r.S), prev && prev.S ? sum(prev.S) : null) + '</h3>'
        + r.S.map(function (x) { return '<p><b>' + KIND[x.kind] + '：' + x.score + ' / 4</b><br><span class="muted">' + esc(x.comment) + '</span></p>'; }).join('')
        + '<p class="stat">話した語数 ' + words + ' ' + diff(words, pw) + ' ・ 速さ 1分あたり約 ' + wpm + ' 語 ・ つなぎ言葉 ' + links + ' 回 ' + diff(links, pl) + '</p>'
        + '<p class="muted">語数・速さ・つなぎ言葉は、音声入力の文字起こしから機械で数えた目安です。</p></div>';
    } else html += '<div class="card"><p class="muted">' + esc(note || '今回は聞く10問だけを記録しました。') + '</p></div>';
    html += '<div class="card"><p>次の目安は ' + date(r.at + 84 * 86400000) + ' ごろ（12週後）。別の版の問題で、同じ物差しを当てます。</p>'
      + '<p class="muted">聞き取れなかった文は「つまずき直し」に入れました。数字は目安で、B2 などの判定ではありません。</p></div>';
    $('asBody').innerHTML = html;
    $('asActions').innerHTML = '<button class="speak" data-as="history">これまでの記録を見る</button><button class="big" data-action="home">ホームへ</button>';
  }
  function history() {
    var recs = records().slice().reverse();
    H.openSection('assess'); $('asTitle').textContent = '📏 これまでの現在地';
    $('asBody').innerHTML = recs.length ? '<div class="card"><table class="as-table"><tr><th>日付</th><th>聞く</th><th>話す</th><th>語数</th><th>つなぎ</th></tr>' + recs.map(function (r) {
      return '<tr><td>' + date(r.at) + '</td><td>' + r.L.score + '/' + r.L.total + '</td><td>' + (r.S ? sum(r.S) + '/' + r.S.length * 4 : '—') + '</td><td>' + (r.S ? r.S.reduce(function (n, x) { return n + x.words; }, 0) : '—') + '</td><td>' + (r.S ? r.S.reduce(function (n, x) { return n + x.links; }, 0) : '—') + '</td></tr>';
    }).join('') + '</table></div>' : '<p class="muted">まだ記録がありません。</p>';
    $('asActions').innerHTML = '<button class="speak" data-action="assessOpen">現在地チェックへ</button><button class="speak" data-action="home">ホームへ</button>';
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-action="assessOpen"]'); if (t) { stopRec(); intro(); return; }
    var b = e.target.closest('[data-as]'); if (!b) return; var a = b.dataset.as;
    if (a === 'go') startListening();
    else if (a === 'history') history();
    else if (!S) return;
    else if (a === 'hear') { H.recordActivity(); window.HanaseruAudio.say(S.f.speaking[S.si].promptEn, { rate: 1 }); }
    else if (a === 'talk') { S.said[S.si] = null; capture(); }
    else if (a === 'stopTalk') { if (S.end) S.end(); }
    else if (a === 'nextS') { S.si++; speaking(); }
  });
  document.addEventListener('hanaseru:leave', function () { stopRec(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) stopRec(); });
}());
