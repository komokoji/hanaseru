/* Personal original-audio lessons. Package and drafts stay on this device; no cloud calls. */
(function () {
  'use strict';
  var H = window.Hanaseru, A = window.HanaseruAudio;
  var $ = function (id) { return document.getElementById(id); };
  var lesson = null, draft = null, active = false, epoch = 0, recorder = null, stream = null, recording = null, timer = null;
  var MAX = 12 * 1024 * 1024, DB = 'hanaseru-original-audio-v1';
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function button(id, text, cls) { return '<button type="button" class="' + (cls || 'speak') + '" data-oa="' + id + '">' + text + '</button>'; }
  function status(text) { if ($('oaStatus')) $('oaStatus').textContent = text; }
  function dbOp(mode, value) {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB, 1);
      req.onupgradeneeded = function () { req.result.createObjectStore('lesson'); };
      req.onerror = function () { reject(req.error); };
      req.onsuccess = function () {
        var db = req.result, tx = db.transaction('lesson', mode), store = tx.objectStore('lesson');
        var op = mode === 'readonly' ? store.get('current') : value === null ? store.delete('current') : store.put(value, 'current');
        tx.oncomplete = function () { db.close(); resolve(op.result); };
        tx.onerror = tx.onabort = function () { db.close(); reject(tx.error || new Error('保存できませんでした')); };
      };
    });
  }
  function validAudio(s) { return typeof s === 'string' && s.length > 40 && s.length < MAX && /^[A-Za-z0-9+/]+={0,2}$/.test(s); }
  function validate(x) {
    if (!x || x.format !== 'hanaseru-original-audio-v1' || typeof x.id !== 'string' || !/^[a-z0-9-]{1,80}$/.test(x.id) || typeof x.title !== 'string' || x.title.length > 160 || !validAudio(x.audio) || !Array.isArray(x.segments) || !x.segments.length || x.segments.length > 100) throw new Error('Hanaseru用の音声教材ファイルを選んでください。');
    var end = 0;
    x.segments.forEach(function (s) {
      if (!s || typeof s.text !== 'string' || !s.text.trim() || s.text.length > 3000 || !validAudio(s.audio) || !Number.isFinite(s.start) || !Number.isFinite(s.end) || s.start < end || s.end <= s.start || s.end > 3600) throw new Error('教材の区切りを読み取れませんでした。');
      end = s.end;
    });
    // Keep only expected fields. Imported strings are rendered as text, never code.
    return { format:x.format, id:x.id, title:x.title, audio:x.audio, segments:x.segments.map(function (s) { return {text:s.text, start:s.start, end:s.end, audio:s.audio}; }) };
  }
  function blob(base64) { var bin = atob(base64), bytes = new Uint8Array(bin.length); for (var i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i); return new Blob([bytes], {type:'audio/mpeg'}); }
  function key() { return 'hanaseru-original-draft:' + lesson.id; }
  function loadDraft() {
    var d; try { d = JSON.parse(localStorage.getItem(key())); } catch (_) {}
    draft = d && typeof d === 'object' ? d : {};
    draft.i = Number.isInteger(draft.i) ? Math.max(0, Math.min(lesson.segments.length - 1, draft.i)) : 0;
    if (!draft.lines || typeof draft.lines !== 'object' || Array.isArray(draft.lines)) draft.lines = {};
    draft.rate = [0.75,0.9,1].indexOf(draft.rate) >= 0 ? draft.rate : 1;
    draft.own = typeof draft.own === 'string' ? draft.own : '';
  }
  function save() { try { localStorage.setItem(key(), JSON.stringify(draft)); } catch (_) { status('練習できますが、回答を保存できませんでした。空き容量をご確認ください。'); } }
  function row() { if (!draft.lines[draft.i]) draft.lines[draft.i] = {answer:'', shown:false, spoken:false}; return draft.lines[draft.i]; }
  function cancelRecord() {
    epoch++; clearTimeout(timer);
    if (recorder) { recorder.ondataavailable = recorder.onstop = recorder.onerror = null; if (recorder.state !== 'inactive') { try { recorder.stop(); } catch (_) {} } recorder = null; }
    if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
    recording = null;
  }
  function leave() { active = false; cancelRecord(); }
  function shell() {
    $('skTitle').textContent = '🎧 原音で聞く・書く・話す';
    $('skProgress').textContent = lesson ? lesson.title : '音声と英文を読み込む';
  }
  function importUI() { return '<details><summary>教材を読み込む・入れ替える</summary><p>音声と英文をまとめた教材ファイル（.hanaseru.json）を選んでください。この端末の中だけに保存されます。</p><input id="oaFile" type="file" accept=".json,application/json" aria-label="音声教材ファイル"><p class="muted">別の端末では、同じファイルを一度読み込んでください。</p></details>'; }
  function render() {
    shell();
    if (!lesson) {
      $('skBody').innerHTML = '<div class="card"><p>原音を短く聞く → 聞こえた英文を書く → 確認して話す。最後に、自分のことを英語にします。</p>' + importUI().replace('<details>','<details open>') + '<p id="oaStatus" role="status"></p></div>';
      $('skActions').innerHTML = '<button class="speak" data-action="skillsOpen">基礎トレへ戻る</button>'; return;
    }
    var s = lesson.segments[draft.i], r = row();
    $('skBody').innerHTML = '<div class="card"><p><b>' + (draft.i+1) + ' / ' + lesson.segments.length + '</b> ・ ' + s.start.toFixed(1) + '–' + s.end.toFixed(1) + '秒</p>'
      + '<label>速度 <select id="oaRate">' + [0.75,0.9,1].map(function(n){return '<option value="'+n+'"'+(draft.rate===n?' selected':'')+'>'+(n===1?'原速（1倍）':n+'倍')+'</option>';}).join('') + '</select></label><div class="speakrow">' + button('play','▶ この区切りを聞く','big') + button('all','全体を原速で聞く') + '</div>'
      + '<h3>1. 聞こえた英文を書く</h3><textarea id="oaAnswer" rows="3" maxlength="3000" lang="en" aria-label="聞き取った英文" placeholder="英文を見ずに、聞こえた言葉を書きます" style="width:100%;box-sizing:border-box">' + esc(r.answer || '') + '</textarea>'
      + button('reveal','英文を確認する')
      + (r.shown ? '<div class="qz-after"><p class="en" lang="en">'+esc(s.text)+'</p><p class="muted">自動文字起こしです。聞き違いが残る場合があります。</p><p>見直す言葉：<span id="oaMissing"></span></p></div>' : '')
      + '<h3>2. 声に出して、聞き比べる</h3><p>一度まねてから、英文を隠して言ってみましょう。</p><div class="speakrow">'+button('hide','英文を隠す')+button('record','🎤 録音する')+button('stopRecord','■ 録音を止める')+button('playRecord','自分の声を聞く')+'</div>'
      + '<p class="muted">録音は送信・保存しません。区切りや画面を移ると消えます。マイクが使えないときも、声に出して練習できます。</p>'
      + '<label><input id="oaSpoken" type="checkbox"'+(r.spoken?' checked':'')+'> 英文を見ずに言ってみた</label><p id="oaStatus" role="status"></p></div>'
      + '<details id="oaTransfer"><summary>3. 自分の言葉で書く・話す</summary><p>この話で使えそうな表現を一つ選び、自分の経験や予定について2〜3文書きます。次に、英文を隠して30秒話してみましょう。</p><textarea id="oaOwn" rows="4" maxlength="3000" aria-label="自分の英作文" style="width:100%;box-sizing:border-box">'+esc(draft.own)+'</textarea><div class="speakrow">'+button('hideOwn','自分の英文を隠す／表示')+button('record','🎤 録音する')+button('stopRecord','■ 録音を止める')+button('playRecord','自分の声を聞く')+'</div></details>'
      + importUI() + button('remove','この教材と回答を端末から消す');
    $('skActions').innerHTML = button('prev','← 前へ') + button('next',draft.i+1===lesson.segments.length?'まとめへ →':'次の区切り →','big') + '<button class="speak" data-action="skillsOpen">基礎トレへ戻る</button>';
    $('skActions').querySelector('[data-oa="prev"]').disabled = draft.i === 0;
    missing();
  }
  // Ordered word alignment: repeated words are counted once per occurrence. Not a language/proficiency score.
  function missing() {
    if (!$('oaMissing')) return;
    var tokens = function(t){return t.toLowerCase().replace(/[^a-z0-9' ]/g,' ').split(/\s+/).filter(Boolean);};
    var expected=tokens(lesson.segments[draft.i].text), actual=tokens(row().answer||'');
    var table=Array.from({length:expected.length+1},function(){return new Uint16Array(actual.length+1);});
    for(var i=expected.length-1;i>=0;i--) for(var j=actual.length-1;j>=0;j--) table[i][j]=expected[i]===actual[j]?1+table[i+1][j+1]:Math.max(table[i+1][j],table[i][j+1]);
    var out=[];i=0;j=0;while(i<expected.length){if(j<actual.length&&expected[i]===actual[j]){i++;j++;}else if(j<actual.length&&table[i][j+1]>table[i+1][j])j++;else out.push(expected[i++]);}
    $('oaMissing').textContent=out.length?out.join(' / '):'語の並びが一致しました。';
  }
  function play(all) { var savedRecording = recording; cancelRecord(); recording = savedRecording; A.playBlob(blob(all?lesson.audio:lesson.segments[draft.i].audio),{rate:all?1:draft.rate}); H.recordActivity(); }
  async function record() {
    cancelRecord(); A.stop(''); var t=epoch;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) { status('この環境では録音できません。英文を見ずに声に出して練習してください。'); return; }
    status('マイクを準備しています…');
    try {
      var got=await navigator.mediaDevices.getUserMedia({audio:true});
      if(!active||t!==epoch){got.getTracks().forEach(function(x){x.stop();});return;}
      stream=got; var chunks=[], rec=new MediaRecorder(got); recorder=rec;
      rec.ondataavailable=function(e){if(e.data.size)chunks.push(e.data);};
      rec.onstop=function(){if(t!==epoch)return;recording=new Blob(chunks,{type:rec.mimeType||'audio/webm'});stream.getTracks().forEach(function(x){x.stop();});stream=null;recorder=null;clearTimeout(timer);status('録音しました。「自分の声を聞く」で聞き比べてください。');};
      rec.onerror=function(){cancelRecord();status('録音できませんでした。もう一度お試しください。');};
      rec.start(); timer=setTimeout(function(){if(rec.state==='recording')rec.stop();},60000); H.recordActivity(); status('録音中です。終わったら「録音を止める」を押してください（最大60秒）。');
    } catch(_){cancelRecord();status('マイクを使えませんでした。許可を確認するか、声に出す練習を続けてください。');}
  }
  async function open() {
    H.openSection('skills'); active=true; var t=epoch; lesson=null;
    $('skBody').innerHTML='<p>教材を読み込んでいます…</p>'; $('skActions').innerHTML='';shell();
    try { var stored=await dbOp('readonly'); if(!active||t!==epoch)return;lesson=stored?validate(stored):null;if(lesson)loadDraft();render(); }
    catch(_){if(active&&t===epoch){render();status('保存済み教材を読めませんでした。教材ファイルを読み込んでください。');}}
  }
  document.addEventListener('change',async function(e){
    if(!active)return;
    if(e.target.id==='oaRate'){draft.rate=Number(e.target.value);save();A.stop('');}
    if(e.target.id==='oaSpoken'){row().spoken=e.target.checked;save();H.recordActivity();}
    if(e.target.id!=='oaFile')return;
    var file=e.target.files[0];if(!file)return;
    cancelRecord(); A.stop(''); var t=epoch;status('教材を読み込んでいます…');
    try {
      if(file.size>MAX)throw new Error('教材ファイルは12MB以内にしてください。');
      var imported=validate(JSON.parse(await file.text()));
      if(!active||t!==epoch)return;
      await dbOp('readwrite',imported);
      if(!active||t!==epoch)return;
      cancelRecord();A.stop('');lesson=imported;loadDraft();render();status('教材をこの端末に保存しました。');
    }catch(err){if(active&&t===epoch)status('読み込めませんでした：'+err.message);}
  });
  document.addEventListener('input',function(e){if(!active||!lesson)return;if(e.target.id==='oaAnswer'){row().answer=e.target.value;save();missing();}if(e.target.id==='oaOwn'){draft.own=e.target.value;save();}});
  document.addEventListener('click',async function(e){
    if(e.target.closest('[data-action="ownAudioOpen"]')){open();return;}
    if(e.target.closest('[data-action="skillsOpen"]')&&active){leave();A.stop('');return;}
    var b=e.target.closest('[data-oa]');if(!b||!active||!lesson)return;
    var k=b.dataset.oa;
    if(k==='play'||k==='all')play(k==='all');
    else if(k==='reveal'||k==='hide'){row().shown=k==='reveal';save();render();if(k==='reveal')H.recordActivity();}
    else if(k==='record')record();
    else if(k==='stopRecord'){if(recorder&&recorder.state==='recording')recorder.stop();}
    else if(k==='playRecord'){if(recording)A.playBlob(recording);else status('先に録音してください。');}
    else if(k==='hideOwn')$('oaOwn').hidden=!$('oaOwn').hidden;
    else if(k==='next'||k==='prev'){
      cancelRecord();A.stop('');
      if(k==='next'&&draft.i===lesson.segments.length-1){$('oaTransfer').open=true;$('oaTransfer').scrollIntoView({behavior:'smooth'});status('最後に全体を原速で聞き、自分の言葉で話してみましょう。');return;}
      draft.i+=k==='next'?1:-1;draft.i=Math.max(0,Math.min(lesson.segments.length-1,draft.i));save();render();
    } else if(k==='remove'){
      if(!window.confirm('この端末の教材と回答を消しますか？元の教材ファイルは残ります。'))return;
      try{await dbOp('readwrite',null);localStorage.removeItem(key());cancelRecord();A.stop('');lesson=null;draft=null;if(active)render();}catch(_){status('削除できませんでした。もう一度お試しください。');}
    }
  });
  document.addEventListener('hanaseru:leave',leave);
  document.addEventListener('visibilitychange',function(){if(document.hidden){cancelRecord();if(active)status('録音を停止しました。もう一度録音できます。');}});
  window.addEventListener('pagehide',leave);
}());
