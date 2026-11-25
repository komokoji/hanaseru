/* Hanaseru — 耳トレの量を増やす（2026-11-25「聞く量が圧倒的に足りない」への対応）
   ① 🎧 連続で聞く：公開済みの会話（耳トレ10本＋診察＋ドバイ）を、順番を混ぜて流し続ける。ながら聞き用。
   ② ✨ 新しい会話：AIがその場で新しい会話を作り、男女の声で読む（要ログイン）。尽きない量の初見の音声。
      練習中の言い回し（つまずき直し）を会話の中に入れてもらう。
   画面は耳トレの枠（#listeningRoute）を借りる。 */
(function () {
  'use strict';
  var H = window.Hanaseru, $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var btn = function (a, t, extra) { return '<button type="button" data-lx="' + a + '" ' + (extra || '') + '>' + t + '</button>'; };
  var mode = null, list = [], pos = 0, token = 0, made = null, busy = false;
  function frame(title, progress) {
    if ($('listeningRoute').hidden) H.openListeningRoute();   // 開くときの「画面を離れた」合図で進行が止まらないよう、開いていれば開き直さない
    $('lrTitle').textContent = title; $('lrProgress').textContent = progress; $('lrBack').hidden = true; $('lrStatus').textContent = '';
  }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // ---- ① 連続で聞く ----
  function playlist() {
    var out = [];
    (window.HANASERU_LISTENING_LESSONS || []).forEach(function (l) { out.push({ title: l.title, sub: l.place, text: l.lines.map(function (x) { return x[1]; }).join(' '), lines: l.lines.map(function (x) { return x[1]; }) }); });
    (window.HANASERU_SCENES || []).filter(function (s) { return s.voices && (s.track === 'consult' || s.track === 'dubai'); }).forEach(function (s) {
      out.push({ title: s.title, sub: s.track === 'dubai' ? 'ドバイ：発表と質疑' : '診察：' + (s.group || ''), text: s.turns.map(function (t) { return t.heard + ' ' + t.en; }).join(' '), lines: s.turns.reduce(function (a, t) { return a.concat([t.heard, t.en]); }, []) });
    });
    return out;
  }
  function loopRender(status) {
    var x = list[pos];
    frame('🎧 連続で聞く', (pos + 1) + ' / ' + list.length + ' 本 ・ 今日 ' + Math.round(H.listenedSec(1) / 60) + '分');
    $('lrBody').innerHTML = '<p><b>' + esc(x.title) + '</b><br><span class="muted">' + esc(x.sub || '') + '</span></p>'
      + btn('loopStop', '■ 止める') + btn('loopNext', '⏭ 次の会話')
      + '<details><summary>いまの会話の英文を見る</summary><div class="lr-lines">' + x.lines.map(function (l) { return '<p lang="en">' + esc(l) + '</p>'; }).join('') + '</div></details>'
      + '<p class="muted">画面を見ずに、流しておくだけで構いません。聞いた時間は記録されます。耳トレ・診察・ドバイの会話が、順番を混ぜて続きます。</p>';
    $('lrStatus').textContent = status || '';
  }
  function loopPlay() {
    loopRender('再生中です。'); var t = ++token, x = list[pos];
    window.HanaseruAudio.say(x.text, { rate: 1, callbacks: {
      end: function () { if (t !== token || mode !== 'loop') return; pos = (pos + 1) % list.length; loopPlay(); },
      blocked: function () { if (t === token) $('lrStatus').textContent = '画面下の ▶ を押すと続きます。'; },
      error: function () { if (t !== token || mode !== 'loop') return; pos = (pos + 1) % list.length; loopPlay(); }
    } });
  }
  function loopStart() { var all = shuffle(playlist()); if (!all.length) return; frame('🎧 連続で聞く', ''); list = all; pos = 0; mode = 'loop'; H.recordActivity(); loopPlay(); }

  // ---- ② 新しい会話（AI） ----
  var TOPICS = [['airport', '空港'], ['plane', '機内'], ['hotel', 'ホテル'], ['street', '街なか・お店'], ['conference', '学会の休憩'], ['daily', '初対面の雑談']];
  function newRender(note) {
    frame('✨ 新しい会話を作る', '初見の会話を、いくつでも'); mode = 'new';
    var logged = H.loggedIn && H.loggedIn();
    $('lrBody').innerHTML = '<p>AIが、その場で新しい会話を作って、男女の声で読みます。毎回ちがう内容なので、初見で聞く練習になります。</p>'
      + '<label for="lxTopic">場面</label><select id="lxTopic">' + TOPICS.map(function (x) { return '<option value="' + x[0] + '">' + x[1] + '</option>'; }).join('') + '</select>'
      + (logged ? btn('make', busy ? '作っています…（10〜20秒）' : '会話を作る', busy ? 'disabled' : '') : '<p class="fbtip">新しい会話を作るには、Googleログインが必要です（ホームの下「ログイン・同期」）。</p>')
      + '<p class="muted">つまずき直しに入っている言い回しを、会話の中に入れてもらいます。作った会話は創作で、この画面を離れると消えます。</p>';
    $('lrStatus').textContent = note || '';
  }
  function make() {
    if (busy) return; busy = true; var topic = $('lxTopic').value; newRender('会話を作っています…'); var t = ++token;
    $('lxTopic').value = topic;
    H.ai({ mode: 'listen', topic: topic, seed: String(Date.now() % 100000), focus: H.focus.forAI() }).then(function (res) {
      busy = false; if (t !== token || mode !== 'new') return;
      var d = res.data.result;
      made = { d: d, text: d.lines.map(function (l) { return l.en; }).join(' '), audio: res.data.audioContent, shown: false };
      madeRender(); playMade();
    }).catch(function (e) { busy = false; if (t === token && mode === 'new') newRender('作れませんでした：' + (e && (e.message || e.code) || e)); });
  }
  function playMade() {
    H.recordActivity();
    window.HanaseruAudio.say(made.text, { rate: 1, audio: made.audio, callbacks: {
      start: function () { $('lrStatus').textContent = '再生中です。'; }, end: function () { $('lrStatus').textContent = 'もう一度聞いても、英文を確かめても大丈夫です。'; },
      blocked: function () { $('lrStatus').textContent = '画面下の ▶ を押すと再生します。'; }
    } });
  }
  function madeRender() {
    var d = made.d; frame(d.title_ja, d.place_ja + '：' + d.who_a + ' と ' + d.who_b); mode = 'made';
    $('lrBody').innerHTML = '<p>まず英文を見ずに、何が起きた会話か聞いてみましょう。</p>' + btn('replay', '▶ もう一度聞く') + btn('stop', '■ 停止')
      + '<details><summary>話の要点を見る</summary><p>' + esc(d.gist_ja) + '</p></details>'
      + '<details><summary>英文を見る</summary><div class="lr-lines">' + d.lines.map(function (l) { return '<p lang="en"><b>' + esc(l.s === 'A' ? d.who_a : d.who_b) + '</b>' + esc(l.en) + '</p>'; }).join('') + '</div></details>'
      + '<details><summary>聞き取りの要所（' + d.chunks.length + '）</summary>' + d.chunks.map(function (c, i) {
        return '<div class="goal-start">' + btn('chunk', '▶ ここだけ聞く', 'data-i="' + i + '"') + '<p lang="en">' + esc(c.en) + '</p><p>' + esc(c.ja) + '</p>' + btn('keep', 'つまずき直しに入れる', 'data-i="' + i + '"') + '</div>';
      }).join('') + '</details>'
      + '<p>' + esc(d.reply_ja) + '</p>' + btn('talk', 'この場面でAIと話す') + btn('again', '✨ もう1本作る');
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-action]');
    if (a && a.dataset.action === 'lrLoop') { loopStart(); return; }
    if (a && a.dataset.action === 'lrNew') { made = null; newRender(); return; }
    var b = e.target.closest('[data-lx]'); if (!b) return; var k = b.dataset.lx;
    if (k === 'loopStop') { token++; mode = null; window.HanaseruAudio.stop(); $('lrStatus').textContent = '止めました。'; $('lrBody').innerHTML = btn('loopStartAgain', '▶ もう一度、連続で聞く') + '<p class="muted">今日 ' + Math.round(H.listenedSec(1) / 60) + '分、この7日で ' + Math.round(H.listenedSec(7) / 60) + '分 聞きました。</p>'; }
    else if (k === 'loopStartAgain') loopStart();
    else if (k === 'loopNext') { pos = (pos + 1) % list.length; loopPlay(); }
    else if (k === 'make') make();
    else if (!made) return;
    else if (k === 'replay') playMade();
    else if (k === 'stop') { window.HanaseruAudio.stop(); $('lrStatus').textContent = '音声を停止しました。'; }
    else if (k === 'chunk') { H.speak(made.d.chunks[+b.dataset.i].en); }
    else if (k === 'keep') { var c = made.d.chunks[+b.dataset.i]; H.focus.add(c.en, c.ja, 'listen'); b.textContent = '✓ 入れました'; b.disabled = true; }
    else if (k === 'again') { made = null; newRender(); }
    else if (k === 'talk') {
      var d = made.d; H.openTalk();
      document.dispatchEvent(new CustomEvent('hanaseru:practiceTalk', { detail: { domain: 'travel', ja: 'ROLEPLAY BRIEF (not a script). Situation (Japanese): ' + d.place_ja + '。相手＝' + d.who_a + '。 Start a new conversation in the same kind of situation with different details. Speak at a natural pace, one or two sentences at a time, and let him respond.', en: '(Expressions he just heard, for your reference: ' + d.chunks.map(function (c) { return c.en; }).join(' / ') + ')' } }));
    }
  });
  document.addEventListener('hanaseru:leave', function () { token++; mode = null; });
}());
