/* 3分練習：聞く → まねる → 見ずに言う → 場面を変える。録音はメモリ内だけ。 */
(function () {
  'use strict';
  var H = window.Hanaseru, Core = window.HanaseruPracticeCore;
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (m) { return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[m]; }); };
  var KEY = 'hanaseru.practice.v1', session = null, peek = false;
  var recorder = null, stream = null, audioURL = null, timer = null, generation = 0;
  function stored() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (_) { return null; } }
  function valid(s) { return s && s.day === H.today() && Array.isArray(s.ids) && s.ids.length && Number.isInteger(s.index) && s.index >= 0 && s.index <= s.ids.length && Number.isInteger(s.phase) && s.phase >= 0 && s.phase <= 3 && s.ids.every(function(id){return H.cards().some(function(c){return c.id===id;});}) && s.ids.slice(s.index).every(function(id){return !(H.getState().cards[id] || {}).paused;}); }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(session)); } catch (_) { $('prNote').textContent = '途中経過を保存できません。この画面のまま練習を続けられます。'; } }
  function card() { return session && H.cards().find(function(c){return c.id === session.ids[session.index];}); }
  function returning() {
    var st=H.getState(), days=(st.practiceDays || []).concat(st.lastDone == null ? [] : [st.lastDone]);
    var last=days.length ? Math.max.apply(null,days) : null;
    return last != null && last < H.today()-2;
  }
  function briefCard(focus) {
    var choices = Core.select(H.cards(), H.getState().cards, H.today(), focus);
    var familiar=returning() ? H.cards().filter(function(c){
      var st=H.getState().cards[c.id]; return Core.eligible(c,focus) && st && !st.paused && (st.box>0 || st.lastPracticeDay != null);
    }).sort(function(a,b){return a.en.split(/\s+/).length-b.en.split(/\s+/).length;})[0] : null;
    return familiar || choices[0] || H.cards().find(function(c){return (focus !== 'all' || c.domain === 'mine' || H.getState().cards[c.id]) && Core.eligible(c,focus) && !(H.getState().cards[c.id] || {}).paused;});
  }
  function homeSummary() {
    var focus = $('practiceFocus').value, s = stored();
    var resume = valid(s) && s.focus === focus && s.index < s.ids.length;
    var next = Core.select(H.cards(), H.getState().cards, H.today(), focus);
    var target = resume ? H.cards().find(function(c){return c.id===s.ids[s.index];}) : returning() ? briefCard(focus) : next[0];
    $('practiceTarget').textContent = target ? '次に口にすること：' + target.ja : '今、いちばん言えるようになりたいことを一つ残しましょう。';
    $('practiceStart').textContent = resume ? '途中から続ける（' + (s.index + 1) + '文目）' : returning() ? '1文から再開する' : '3分練習を始める';
    $('practiceSummary').textContent = resume ? '途中で閉じても、この端末で続きから。' : next.length ? '今日の候補 ' + next.length + '文。復習と、自分の保存文から選びます。' : '今日の候補はありません。言いたいことを追加するか、教材から使いたい文だけを選べます。';
    var activity = Core.activity(H.getState(), H.today());
    $('habitPill').textContent = activity.streak ? '連続 ' + activity.streak + '日' : '今日のひとこと';
    $('activityStatus').textContent = (activity.done ? '✓ 今日も取り組めました！' : '今日は、ひとつ取り組めばOK。') + ' この7日で ' + activity.week + '日';
    $('activityStatus').classList.toggle('achieved', activity.done);
    $('streak').textContent = '連続 ' + activity.streak + '日（聞く・見る・メモするだけでも継続）';
    if (returning()) $('practiceSummary').textContent = 'おかえりなさい。休んだ分を取り戻す必要はありません。今日は1文から。';
  }
  function start(id, brief) {
    var focus = $('practiceFocus').value, s = stored();
    var resume=valid(s) && s.focus === focus && s.index < s.ids.length;
    if (!id && !resume && returning()) brief=true;
    if (brief) {
      var one = briefCard(focus);
      session = { day:H.today(), focus:focus, ids:one ? [one.id] : [], index:0, phase:0, outcomes:[], brief:true };
    } else if (id) {
      if (!H.cards().some(function(c){return c.id===id;})) return;
      session = { day:H.today(), focus:focus, ids:[id], index:0, phase:0, outcomes:[] };
    } else if (valid(s) && s.focus === focus && s.index < s.ids.length) session = s;
    else session = { day:H.today(), focus:focus, ids:Core.select(H.cards(), H.getState().cards, H.today(), focus).map(function(c){return c.id;}), index:0, phase:0, outcomes:[] };
    H.openPractice(); peek = false; persist(); render(); $('prTitle').focus();
  }
  function btn(action, text, klass) { return '<button class="' + (klass || 'speak') + '" data-action="' + action + '">' + text + '</button>'; }
  function cleanup() {
    generation++;
    clearTimeout(timer);
    if (recorder && recorder.state !== 'inactive') recorder.stop();
    recorder = null;
    if (stream) stream.getTracks().forEach(function(t){t.stop();}); stream = null;
    var a = $('prAudio'); a.pause(); a.removeAttribute('src'); a.hidden = true;
    if (audioURL) URL.revokeObjectURL(audioURL); audioURL = null;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    $('prRecord').textContent = '🎙 自分の声を録る'; $('prRecord').disabled = false;
    $('prRecordNote').textContent = '録音はこの画面で聞き比べるためだけに使います。送信・保存はしません。';
  }
  function render() {
    cleanup(); var c = card(); $('prNote').textContent = '';
    $('prRecording').hidden = !c;
    if (!c) {
      $('prTitle').textContent = session.ids.length ? '今日の一歩、完了です' : '今日の復習は済んでいます';
      $('prCounter').textContent = session.ids.length ? session.ids.length + '文を練習しました' : '';
      var missed = (session.outcomes || []).filter(function(o){return o==='again';}).length;
      $('prBody').innerHTML = '<div class="card"><p>' + (session.ids.length ? '言えなかった文は明日もう一度。言えた文は、間を空けてまた思い出します。' : '別の場面を選ぶか、新しく言いたいことを残しましょう。') + '</p>'
        + (missed ? '<p>明日もう一度：' + missed + '文</p>' : '')
        + (session.before || []).map(function(before,i){
          if (!before || !session.outcomes[i]) return '';
          var phrase=H.cards().find(function(c){return c.id===session.ids[i];});
          return '<p><b>' + esc(phrase ? phrase.ja : '') + '</b><br>練習前：' + ({stuck:'言葉が出なかった',some:'途中まで言えた',said:'言えた'}[before])
            + '<br>練習後：' + ({again:'まだ練習したい',recalled:'見ずに言えた',transfer:'言い換えて伝えられた'}[session.outcomes[i]]) + '</p>';
        }).join('')
        + '<p class="muted">これは今日の自己評価です。次はAIとのやりとりや実際の会話で試しましょう。</p></div>';
      $('prActions').innerHTML = (session.ids.length ? btn('prTalk','この表現をAIとの会話で使う','big') : '') + btn('home','ホームへ');
      return;
    }
    var phase = session.phase;
    $('prTitle').textContent = ['① 今の言葉で試して、聞く','② 音をまねる','③ 見ずに言う','④ 自分の場面で使う'][phase];
    $('prCounter').textContent = (session.index + 1) + ' / ' + session.ids.length + '文 ・ ' + (phase + 1) + ' / ' + (session.brief ? 3 : 4) + 'ステップ';
    var body = '', actions = '';
    if (phase === 0) {
      body = '<p class="ja">' + esc(c.ja) + '</p><p class="muted">手本を聞く前に、今の英語で言ってみましょう。詰まっても大丈夫。ここから練習します。</p>'
        + '<details><summary>練習前の手応えを残す（任意）</summary><div class="speakrow">'
        + btn('prBeforeStuck','言葉が出なかった') + btn('prBeforeSome','途中まで言えた') + btn('prBeforeSaid','言えた')
        + '</div><p id="prBeforeNote" class="stat" role="status"></p></details>';
      actions = btn('prListen','🔊 手本を聞く','big') + btn('prNext','意味と英文を見る');
    } else if (phase === 1) {
      body = '<p class="ja-sm">' + esc(c.ja) + '</p><p class="en">' + esc(c.en) + '</p><p class="muted">意味を確かめて、まず一緒に読む。慣れたら少し遅れて追いかける。録音と手本を聞き比べ、つながりやリズムを一つだけ意識しましょう。</p>';
      actions = btn('prListen','🔊 手本をもう一度') + btn('rate','速度を切り替える') + btn('prNext','英文を隠して言ってみる','big');
    } else if (phase === 2) {
      body = '<p class="ja">' + esc(c.ja) + '</p><p class="muted">英語を見ずに声に出してください。同じ意味なら、違う言い方でも大丈夫です。</p>';
      if (peek) body += '<p class="en">' + esc(c.en) + '</p>';
      actions = btn('prPeek', peek ? 'もう一度隠す' : '手本を確認する') + (!peek ? btn('prRecall',session.brief ? '見ずに言えた・今日はここまで' : '見ずに言えた → 場面を変える','big') + btn('prAgain','まだ → 明日もう一度') : btn('prListen','🔊 手本を聞く'));
    } else {
      var medical = ['medical','visit','asthma','gut','nutri','sign'].includes(c.domain) || /診療/.test(c.ja);
      var prompts = medical ? ['同じ説明を、別の簡単な言い方で。最後に相手の理解を確かめましょう。', '相手に「どういう意味ですか？」と聞かれました。同じ内容を、より簡単な言葉で説明しましょう。', '説明のあと、相手が気にしていることを一つ尋ねましょう。'] : ['相手や場所を思い浮かべて、内容を一つ変えて言ってみましょう。', 'その考え・お願いの理由や気持ちを、一言足してみましょう。', '相手に伝わらなかったつもりで、別の簡単な言い方を試しましょう。'];
      body = '<p class="ja-sm">元の意図：' + esc(c.ja) + '</p><p class="ja">' + prompts[(H.today() + session.index) % prompts.length] + '</p><p class="muted">' + (medical ? '治療の条件や意味は変えずに、表現だけ変えます。' : '数字・相手・頼みたいことなど、自分が使う内容で。') + ' 詰まったら、知っている単語で続けましょう。</p>';
      actions = btn('prTransfer','言い換えて伝えられた','big') + btn('prSame','元の文は言えた・言い換えは次回') + btn('prAgain','元の文もまだ → 明日もう一度');
    }
    $('prBody').innerHTML = '<div class="card">' + body + '</div>';
    $('prActions').innerHTML = actions;
    if (phase === 0 && session.index > 0) $('prActions').innerHTML += btn('prFinishEarly','今日はここまで（' + session.index + '文できました）');
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      $('prRecord').hidden = true;
      $('prRecordNote').textContent = 'このブラウザでは録音できません。声に出す練習はそのまま続けられます。';
    }
  }
  function advance() { H.recordActivity(); session.phase++; peek = false; persist(); render(); }
  function grade(outcome) {
    var c = card(); if (!c) return;
    H.practiceGrade(c.id, outcome);
    session.outcomes = session.outcomes || []; session.outcomes[session.index] = outcome;
    session.index++; session.phase = 0; peek = false;
    if (session.index === session.ids.length) H.practiceDone();
    persist(); render(); homeSummary();
  }
  async function record() {
    if (recorder && recorder.state === 'recording') { recorder.stop(); return; }
    cleanup(); var token = generation;
    $('prRecord').disabled = true;
    $('prRecordNote').textContent = 'マイクを準備しています…';
    try {
      var acquired = await navigator.mediaDevices.getUserMedia({audio:true});
      if (token !== generation || $('practice').hidden) { acquired.getTracks().forEach(function(t){t.stop();}); return; }
      stream = acquired;
      recorder = new MediaRecorder(stream); var chunks = [], current = recorder;
      recorder.ondataavailable = function(e){if(e.data.size) chunks.push(e.data);};
      recorder.onstop = function(){
        acquired.getTracks().forEach(function(t){t.stop();}); clearTimeout(timer);
        if (token !== generation) return;
        recorder = null; stream = null;
        $('prRecord').textContent = '🎙 録り直す'; $('prRecord').disabled = false;
        if (!chunks.length) { $('prRecordNote').textContent = '録音できませんでした。声に出す練習は続けられます。'; return; }
        audioURL = URL.createObjectURL(new Blob(chunks,{type:current.mimeType}));
        $('prAudio').src = audioURL; $('prAudio').hidden = false;
        $('prRecordNote').textContent = '自分の声を再生して確認できます。録音は画面を移ると消えます。';
      };
      recorder.onerror = function(){cleanup(); $('prRecordNote').textContent = '録音できませんでした。声に出す練習は続けられます。';};
      recorder.start(); H.recordActivity(); $('prRecord').disabled = false; $('prRecord').textContent = '■ 録音を止める';
      $('prRecordNote').textContent = '録音中です。最大60秒で止まります。';
      timer = setTimeout(function(){if(current.state==='recording') current.stop();},60000);
    } catch (_) {
      if (token !== generation) return;
      cleanup(); $('prRecordNote').textContent = 'マイクを使えませんでした。ブラウザの許可を確認するか、録音なしで声に出して続けてください。';
    }
  }
  document.addEventListener('click', function(e){
    var t = e.target.closest('[data-action]'); if(!t) return;
    var a=t.dataset.action;
    if(a==='practiceStart') start();
    else if(a==='home') homeSummary();
    else if(a==='practiceBrief') start(null,true);
    else if(a==='practiceOne') start(t.dataset.id);
    else if(a==='prListen' && card()) { $('prAudio').pause(); H.speak(card().en); }
    else if(a==='prNext') advance();
    else if(a.indexOf('prBefore') === 0) {
      var before={prBeforeStuck:'stuck',prBeforeSome:'some',prBeforeSaid:'said'}[a];
      if(before) { H.recordActivity(); session.before=session.before || []; session.before[session.index]=before; persist(); $('prBeforeNote').textContent='記録しました。練習後と比べてみましょう。'; }
    }
    else if(a==='prPeek') { peek=!peek; render(); }
    else if(a==='prRecall') { if(session.brief) grade('recalled'); else advance(); }
    else if(a==='prAgain') grade('again');
    else if(a==='prSame') grade('recalled');
    else if(a==='prTransfer') grade('transfer');
    else if(a==='prRecord') record();
    else if(a==='prFinishEarly') { session.ids=session.ids.slice(0,session.index); H.practiceDone(); persist(); render(); homeSummary(); }
    else if(a==='prTalk') {
      var c=H.cards().find(function(c){return c.id===session.ids[session.ids.length-1];});
      H.openTalk(); document.dispatchEvent(new CustomEvent('hanaseru:practiceTalk',{detail:c}));
    }
  });
  document.addEventListener('hanaseru:leave', cleanup);
  document.addEventListener('hanaseru:practice', function(e){start(e.detail.id);});
  document.addEventListener('hanaseru:state', homeSummary);
  document.addEventListener('visibilitychange', function(){if(document.hidden) cleanup(); else homeSummary();});
  window.addEventListener('pagehide', cleanup);
  $('practiceFocus').addEventListener('change',homeSummary);
  var saved = stored();
  if (valid(saved) && ['all','clinic','travel','me','mine'].includes(saved.focus)) $('practiceFocus').value = saved.focus;
  H.onChange(homeSummary); homeSummary();
})();
