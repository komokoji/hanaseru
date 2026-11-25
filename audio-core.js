/* Hanaseru — 音声の共通プレーヤー（v70）
   手本・相手の声・聞き取り教材は、すべてここを通って鳴る。停止もここ1か所。
   iPhone の決まり：音は「タップした直後」でないと鳴らせない。通信を待ったあとの再生は断られる。
   そのため ①画面に1つだけ置いた <audio> を最初のタップで開けておく（以後は待ったあとでも鳴らせる）
            ②断られたときは必ず ▶ を見せる（黙って失敗しない）
   音源の順：公開済みMP3（ログイン不要）→ この端末に残したMP3 → ログイン中はその場で作るMP3 → 端末の読み上げ。 */
(function (root) {
  'use strict';
  var doc = root.document;
  var audio = doc.getElementById('hsAudio'), bar = doc.getElementById('hsPlayer');
  var statusEl = doc.getElementById('hsStatus'), playBtn = doc.getElementById('hsPlay');
  var token = 0, current = null, watch = null, hideTimer = null, loader = null, canLoad = null, unlocked = false, utterance = null;
  var memory = new Map(), TTS_CACHE = 'hanaseru-tts-v1', silentUrl = null;

  var GOOD_VOICES = {
    'en-US': ['Google US English', 'Samantha', 'Ava', 'Allison', 'Zoe', 'Nicky', 'Alex', 'Evan', 'Tom', 'Microsoft Aria Online', 'Microsoft Jenny Online'],
    'en-GB': ['Google UK English Female', 'Google UK English Male', 'Daniel', 'Kate', 'Serena', 'Oliver', 'Jamie', 'Stephanie', 'Microsoft Sonia Online', 'Microsoft Ryan Online']
  };
  function pickVoice(lang) {
    var all = root.speechSynthesis.getVoices(), names = GOOD_VOICES[lang] || [];
    for (var i = 0; i < names.length; i++) for (var j = 0; j < all.length; j++) {
      if (all[j].name.indexOf(names[i]) === 0 && all[j].lang.replace('_', '-').indexOf(lang) === 0) return all[j];
    }
    return lang !== 'en-US' ? pickVoice('en-US') : null;
  }
  try { if (root.speechSynthesis) root.speechSynthesis.getVoices(); } catch (_) {}

  function normalize(text) { return String(text == null ? '' : text).replace(/___/g, '…').trim(); }
  function staticUrl(text) {
    return (root.HANASERU_CARD_AUDIO || {})[text] || (root.HANASERU_LISTENING_AUDIO || {})[text] || null;
  }
  function call(name, arg) { var cb = current && current.callbacks; if (cb && typeof cb[name] === 'function') { try { cb[name](arg); } catch (_) {} } }
  function show(message, state) {
    clearTimeout(hideTimer);
    statusEl.textContent = message; bar.hidden = false; bar.dataset.state = state;
    playBtn.textContent = state === 'blocked' ? '▶ 押して再生' : '▶ もう一度';
    doc.body.classList.add('hs-on');
  }
  function hideSoon(ms) { clearTimeout(hideTimer); hideTimer = setTimeout(function () { bar.hidden = true; doc.body.classList.remove('hs-on'); }, ms); }

  // ---- 停止（すべての音はここで止まる） ----
  function halt() {
    token++; clearTimeout(watch);
    try { audio.pause(); } catch (_) {}
    var S = root.speechSynthesis;
    try { if (S && (S.speaking || S.pending)) S.cancel(); } catch (_) {}
    utterance = null;
  }
  function stop(message) {
    var was = current; halt(); current = null;
    if (was && !bar.hidden) { statusEl.textContent = message || '音声を停止しました。'; bar.dataset.state = 'idle'; hideSoon(1500); }
  }

  // ---- MP3 ----
  function blocked(t) {
    if (t !== token) return;
    clearTimeout(watch);
    show('▶ を押すと再生します。', 'blocked'); call('blocked');
  }
  function playUrl(url, t) {
    if (t !== token) return;
    current.kind = 'audio'; current.url = url;
    audio.src = url;
    audio.defaultPlaybackRate = audio.playbackRate = current.rate;
    show('音声を読み込んでいます…', 'loading');
    startAudio(t);
  }
  function startAudio(t) {
    clearTimeout(watch);
    watch = setTimeout(function () { if (t === token && audio.paused) blocked(t); }, 6000);
    var started;
    try { started = audio.play(); } catch (_) { blocked(t); return; }
    if (started && started.catch) started.catch(function (e) { if (t === token && !(e && e.name === 'AbortError')) blocked(t); });
  }
  audio.addEventListener('playing', function () {
    if (!current || current.kind !== 'audio' || audio.src === silentUrl) return;
    clearTimeout(watch); unlocked = true;
    show('再生中です。', 'playing'); call('start');
  });
  audio.addEventListener('ended', function () {
    if (!current || current.kind !== 'audio' || audio.src === silentUrl) return;
    show('もう一度聞くには ▶ を押してください。', 'idle'); hideSoon(6000); call('end');
  });
  audio.addEventListener('error', function () {
    if (!current || current.kind !== 'audio' || !audio.getAttribute('src') || audio.src === silentUrl) return;
    var t = token; clearTimeout(watch);
    if (!current.triedTts) { speakDevice(t, '音声ファイルを読み込めなかったため、端末の読み上げに切り替えました。'); return; }
    fail(t, '音声を読み込めませんでした。通信を確認して、もう一度押してください。');
  });
  function fail(t, message) {
    if (t !== token) return;
    clearTimeout(watch); show(message, 'blocked'); call('error');
  }

  // ---- 端末の読み上げ（MP3が無いときの控え） ----
  function speakDevice(t, note) {
    if (t !== token || !current) return;
    var S = root.speechSynthesis;
    current.kind = 'tts'; current.triedTts = true;
    if (!S || !root.SpeechSynthesisUtterance) { fail(t, 'この端末では読み上げを利用できません。ログインするとMP3で再生できます。'); return; }
    var u = new root.SpeechSynthesisUtterance(current.text), started = false;
    utterance = u;   // 参照を保つ（途中で回収されて無音になるのを防ぐ）
    u.lang = current.lang; u.rate = current.ttsRate;
    try { var v = pickVoice(u.lang); if (v) u.voice = v; } catch (_) {}
    u.onstart = function () { started = true; if (t !== token) return; clearTimeout(watch); show(note || '再生中です（端末の読み上げ）。', 'playing'); call('start'); };
    u.onend = function () { if (t !== token) return; clearTimeout(watch); show('もう一度聞くには ▶ を押してください。', 'idle'); hideSoon(4000); call('end'); };
    u.onerror = function (e) {
      if (t !== token || (e && (e.error === 'canceled' || e.error === 'interrupted'))) return;
      fail(t, '読み上げを始められませんでした。▶ を押すか、iPhoneの消音モードと音量を確認してください。');
    };
    var go = function () { if (t !== token) return; try { S.resume(); S.speak(u); } catch (_) { fail(t, '読み上げを始められませんでした。▶ をもう一度押してください。'); } };
    // 読み上げ中に cancel() と speak() を続けて呼ぶと、iPhone では新しい声まで消えることがある。少し間を置く。
    if (S.speaking || S.pending) { try { S.cancel(); } catch (_) {} setTimeout(go, 80); } else go();
    show(note || '読み上げを始めています…', 'loading');
    clearTimeout(watch);
    watch = setTimeout(function () {
      if (t !== token || started) return;
      show('読み上げが始まりません。▶ を押すか、iPhoneの消音モードと音量を確認してください。', 'blocked'); call('blocked');
    }, 3500);
  }

  // ---- その場で作ったMP3を端末に残す（同じ文は次から通信なし・作成回数も減らない） ----
  function cacheKey(text) {
    if (!root.crypto || !root.crypto.subtle || !root.TextEncoder) return Promise.resolve(null);
    return root.crypto.subtle.digest('SHA-256', new root.TextEncoder().encode('en-US-Standard-F:0.9:' + text)).then(function (buf) {
      return '/__tts/' + Array.prototype.map.call(new Uint8Array(buf).subarray(0, 12), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('') + '.mp3';
    });
  }
  function cacheGet(text) {
    if (!root.caches) return Promise.resolve(null);
    return cacheKey(text).then(function (key) {
      if (!key) return null;
      return root.caches.open(TTS_CACHE).then(function (c) { return c.match(key); }).then(function (res) { return res ? res.blob() : null; });
    }).catch(function () { return null; });
  }
  function cachePut(text, blob) {
    if (!root.caches) return;
    cacheKey(text).then(function (key) {
      if (!key) return;
      return root.caches.open(TTS_CACHE).then(function (c) {
        return c.put(key, new root.Response(blob, { headers: { 'Content-Type': 'audio/mpeg' } })).then(function () { return c.keys(); })
          .then(function (keys) { if (keys.length > 400) return Promise.all(keys.slice(0, 60).map(function (k) { return c.delete(k); })); });
      });
    }).catch(function () {});
  }
  function toBlob(base64) {
    var bin = root.atob(base64), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new root.Blob([bytes], { type: 'audio/mpeg' });
  }
  function remember(text, blob) {
    var url = root.URL.createObjectURL(blob); memory.set(text, url);
    if (memory.size > 60) { var first = memory.keys().next().value; root.URL.revokeObjectURL(memory.get(first)); memory.delete(first); }
    return url;
  }
  function prepare(text, t) {
    show('音声を準備しています…', 'loading');
    var timeout = new Promise(function (_, reject) { setTimeout(function () { reject(new Error('timeout')); }, 15000); });
    Promise.race([cacheGet(text).then(function (blob) {
      if (blob) return blob;
      if (!loader) return null;
      return Promise.resolve(loader(text)).then(function (base64) {
        if (typeof base64 !== 'string' || !base64) return null;
        var made = toBlob(base64); cachePut(text, made); return made;
      });
    }), timeout]).then(function (blob) {
      if (t !== token) return;
      if (blob) playUrl(remember(text, blob), t); else speakDevice(t);
    }).catch(function () { speakDevice(t, '音声を作れなかったため、端末の読み上げに切り替えました。'); });
  }

  // ---- 入口 ----
  function say(text, options) {
    options = options || {};
    halt();
    var clean = normalize(text), t = token;
    current = { text: clean, callbacks: options.callbacks || null, lang: options.lang || 'en-US',
      rate: options.rate || 1, ttsRate: options.ttsRate || 0.9, kind: null, triedTts: false };
    if (!clean) { call('error'); current = null; return; }
    // 呼び出し側がMP3を持っているとき（AI会話の返答は、返答と一緒に音声が届く）は、それをすぐ鳴らす。
    if (typeof options.audio === 'string' && options.audio && !memory.get(clean)) { try { remember(clean, toBlob(options.audio)); } catch (_) {} }
    var url = staticUrl(clean) || memory.get(clean);
    if (url) playUrl(url, t);
    // その場で作るMP3は「ログイン中・米国の声」だけ。それ以外は、タップの中ですぐ端末の読み上げを始める（待つと iPhone で断られる）。
    else if (current.lang !== 'en-US' || !loader || (canLoad && !canLoad(clean))) speakDevice(t);
    else prepare(clean, t);
  }

  // ▶：断られたとき・聞き直すとき。必ずタップの中で鳴らす。
  playBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (!current) return;
    var t = token; clearTimeout(watch);
    if (current.kind === 'audio' && current.url) {
      try { audio.currentTime = 0; } catch (_) {}
      show('音声を読み込んでいます…', 'loading'); startAudio(t);
    } else if (current.kind === 'tts') speakDevice(t);
  });
  doc.getElementById('hsStop').addEventListener('click', function (e) { e.stopPropagation(); stop(); });

  // 最初のタップで <audio> を開けておく（無音を一瞬だけ流す）。以後、通信のあとでも同じ <audio> なら鳴らせる。
  function silence() {
    if (silentUrl) return silentUrl;
    var samples = 400, buf = new ArrayBuffer(44 + samples * 2), v = new DataView(buf);
    var w = function (o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); v.setUint32(4, 36 + samples * 2, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, 8000, true); v.setUint32(28, 16000, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, samples * 2, true);
    silentUrl = root.URL.createObjectURL(new root.Blob([buf], { type: 'audio/wav' }));
    return silentUrl;
  }
  function unlock() {
    if (unlocked || current) return;
    try {
      audio.src = silence();
      var p = audio.play();
      if (p && p.then) p.then(function () { unlocked = true; if (audio.src === silentUrl) audio.pause(); }).catch(function () {});
    } catch (_) {}
  }
  ['touchend', 'click', 'keydown'].forEach(function (type) { doc.addEventListener(type, unlock, true); });

  // 画面を移る・閉じる・裏に回す → 止める
  doc.addEventListener('hanaseru:leave', function () { stop(''); bar.hidden = true; doc.body.classList.remove('hs-on'); });
  doc.addEventListener('visibilitychange', function () { if (doc.hidden) stop(); });
  root.addEventListener('pagehide', function () { stop(); });

  root.HanaseruAudio = {
    say: say, stop: stop,
    setLoader: function (f, can) { loader = f; canLoad = can || null; },
    isActive: function () { return !!current; }
  };
}(window));
