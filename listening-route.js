/* 今日の耳トレの画面。会話は創作（実在の録音ではない）。 */
(function(){
'use strict';
const H=window.Hanaseru, $=id=>document.getElementById(id), KEY='hanaseru-listening-route-v1';
// 会話の本文は listening-lessons.js（骨太の10場面・話し手ごとに男女の声）。
const lessons=window.HANASERU_LISTENING_LESSONS;
let state={index:0,step:0,issue:'',answer:'',heard:false,results:[]}, token=0;
let practice={index:0,hidden:false,rate:1,repeat:false,playing:false};
try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&Number.isInteger(s.index)&&s.index>=0&&s.index<lessons.length&&Number.isInteger(s.step)&&s.step>=0&&s.step<=4)state={...state,...s};}catch(_){}
function plan(){state=window.HanaseruDailyListening.prepare(state,Date.now(),lessons);save();}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(_){$('lrStatus').textContent='この端末に保存できません。開いている間は続けられます。';}home();}
function esc(x){return String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function button(action,text){return '<button type="button" data-lr="'+action+'">'+text+'</button>';}
function home(){ $('lrHome').textContent=(state.step===4?'今日は一区切り：':state.step>0?'続きから：':'今日の会話：')+lessons[state.index].title+'（'+(lessons[state.index].place||'')+'）'+(state.review&&!state.reviewDone?' ＋ 昨日の一表現（約30秒）':''); }
// 鳴らす・止めるは共通プレーヤー（audio-core.js）。公開済みMP3を使うのでログイン不要。
function stop(){token++;practice.playing=false;window.HanaseruAudio.stop('');}
function play(parts){
 stop();const t=token;
 $('lrStatus').textContent='音声を読み込んでいます…';
 window.HanaseruAudio.say(parts.join(' '),{rate:1,ttsRate:0.9,callbacks:{
  start:()=>{if(t===token)$('lrStatus').textContent='再生中です。画面下の ■ で停止、▶ で聞き直しができます。';},
  end:()=>{if(t!==token)return;state.heard=true;save();$('lrStatus').textContent='もう一度聞いても、次へ進んでも大丈夫です。';},
  blocked:()=>{if(t===token)$('lrStatus').textContent='画面下の ▶ を押してください。聞こえない場合は音量とBluetoothの出力先を確認してください。';},
  error:()=>{if(t===token)$('lrStatus').textContent='音声を読み込めませんでした。通信を確認し「会話を聞く」をもう一度押してください。';}
 }});
}


// Two panes: the current phrase stays above the playback controls. Existing phrase MP3s retain the speaker's voice.
function practiceHTML(){
 const l=lessons[state.index], i=Math.min(practice.index,l.chunks.length-1), c=l.chunks[i];practice.index=i;
 return '<div class="lr-lab" aria-label="英文と再生操作の2段練習"><div class="lr-reading">'
  +'<p class="lr-counter">練習する表現 '+(i+1)+' / '+l.chunks.length+'</p>'
  +'<p id="lrPracticeText" class="lr-practice-en" lang="en"'+(practice.hidden?' hidden':'')+'>'+esc(c[0])+'</p>'
  +(practice.hidden?'<p class="lr-ear-cue">英文は隠しています。<br>聞こえた音を、少し遅れて追いかけます。</p>':'')
  +'<details'+(practice.hidden?' hidden':'')+'><summary>意味を見る</summary><p>'+esc(c[1])+'</p></details></div>'
  +'<div class="lr-controls"><div class="lr-mode">'+button('practice-visible','① 見ながら重ねる')+button('practice-hidden','② 隠して追いかける')+'</div>'
  +'<p class="lr-guide">'+(practice.hidden?'音声より少し遅れて、止まらずに言ってみます。難しければ①へ戻れます。':'まず一度聞きます。次は英文を見ながら、音声と一緒に声を出します。')+'</p>'
  +'<div class="lr-playrow">'+button('practice-prev','← 前')+button('practice-play','▶ この表現')+button('practice-stop','■ 止める')+button('practice-next','次 →')+'</div>'
  +'<div class="lr-options"><label>速さ <select id="lrPracticeRate"><option value="0.8"'+(practice.rate===0.8?' selected':'')+'>ゆっくり</option><option value="1"'+(practice.rate===1?' selected':'')+'>通常</option></select></label><label><input id="lrPracticeRepeat" type="checkbox"'+(practice.repeat?' checked':'')+'> 同じ表現をくり返す</label></div>'
  +'<p id="lrPracticeStatus" role="status"></p>'
  +button('mark-'+i,state.markedChunk===i?'✓ 明日もう一度':'明日もう一度')+'</div></div>';
}
function practicePaint(){const host=$('lrPractice');if(!host)return;host.innerHTML=practiceHTML();host.querySelector('[data-lr="practice-prev"]').disabled=practice.index===0;host.querySelector('[data-lr="practice-next"]').disabled=practice.index===lessons[state.index].chunks.length-1;host.querySelector('[data-lr="practice-visible"]').setAttribute('aria-pressed',String(!practice.hidden));host.querySelector('[data-lr="practice-hidden"]').setAttribute('aria-pressed',String(practice.hidden));}
function practicePlay(){
 stop();const t=token,c=lessons[state.index].chunks[practice.index];practice.playing=true;
 const sayStatus=text=>{if(t===token&&$('lrPracticeStatus'))$('lrPracticeStatus').textContent=text;};
 const run=()=>{if(t!==token||$('listeningRoute').hidden)return;
  window.HanaseruAudio.say(c[0],{rate:practice.rate,ttsRate:0.9*practice.rate,callbacks:{
   start:()=>{if(t!==token)return;H.recordActivity();$('lrPractice').classList.add('is-playing');sayStatus(practice.hidden?'音を追いかけてみましょう。':'今の英文に声を重ねてみましょう。');},
   end:()=>{if(t!==token)return;$('lrPractice').classList.remove('is-playing');if(practice.repeat){sayStatus('もう一度…');setTimeout(()=>{if(t===token&&practice.repeat&&window.HanaseruAudio.isActive())run();},700);}else{practice.playing=false;sayStatus('もう一度でも、次の表現へ進んでも大丈夫です。');}},
   blocked:()=>sayStatus('画面下の ▶ を押すと再生します。'),
   error:()=>{practice.playing=false;if(t===token)$('lrPractice').classList.remove('is-playing');sayStatus('再生できませんでした。もう一度押してください。');}
  }});
 };run();
}

function render(){
 const l=lessons[state.index];$('lrTitle').textContent=l.title;$('lrProgress').textContent=['1 / 4 聞く','2 / 4 つまずきを確認','3 / 4 聞き直す','4 / 4 自分の言葉で使う','今日の一区切り'][state.step];
 let html='';
 if(state.review&&!state.reviewDone){
  const r=state.review,c=lessons[r.index].chunks[r.chunk];
  $('lrTitle').textContent='まず、昨日の一表現';$('lrProgress').textContent='約30秒の復習 → 今日の会話 約2分30秒';
  $('lrBody').innerHTML='<p>'+ (r.explicit?'昨日「ここでつまずいた」と残した表現です。':'昨日つまずきを記録した会話から、一表現を選びました。')+'</p>'+button('reviewPlay','▶ 聞いて、一度まねる')+button('stop','■ 停止')+'<details><summary>表現と意味を見る</summary><p lang="en">'+esc(c[0])+'</p><p>'+esc(c[1])+'</p></details>'+button('reviewDone','できた・今日の会話へ')+button('reviewSkip','飛ばす')+'';
  $('lrBack').hidden=true;$('lrStatus').textContent='';$('lrTitle').focus();home();return;
 }

 if(state.step===0)html='<p class="lr-where">'+esc(l.place||'')+'：'+esc(l.who?l.who.A+' と '+l.who.B:'')+'</p>'+button('play','▶ 会話を聞く')+button('stop','■ 停止')+'<label for="lrAnswer">どんな話？（任意）</label><textarea id="lrAnswer" rows="2" maxlength="600" placeholder="頭の中で答えるだけでもOK">'+esc(state.answer)+'</textarea>'+button('next','答え合わせ →');
 if(state.step===1)html='<details class="lr-gist"><summary>話の要点を見る</summary><p>'+esc(l.gist)+'</p></details><div id="lrPractice"></div><details class="lr-full"><summary>会話の全文を見る</summary><div class="lr-lines">'+l.lines.map(x=>'<p lang="en"><b>'+esc((l.who&&l.who[x[0]])||x[0])+'</b>'+esc(x[1])+'</p>').join('')+'</div></details><label for="lrIssue">どこで止まった？</label><select id="lrIssue"><option value="">選んでください</option>'+[['sound','音が単語として分からなかった'],['structure','文のつながりを追えなかった'],['memory','後半で前の内容を忘れた'],['clear','要点はつかめた']].map(x=>'<option value="'+x[0]+'" '+(state.issue===x[0]?'selected':'')+'>'+x[1]+'</option>').join('')+'</select>'+button('next','区切って聞き直す →');
 if(state.step===2){const advice={sound:l.sound,structure:'説明の途中でも、主語と動作、条件・理由・結果のつながりを追いましょう。',memory:'一区切りごとに短く意味を思い浮かべ、最後に全体をつなげます。',clear:'同じ音声で確認したあと、内容を変えて使ってみましょう。'};html='<p>'+esc(advice[state.issue]||l.sound)+'</p>'+'<div id="lrPractice"></div>'+button('next','英文を閉じて、もう一度 →');}
 if(state.step===3)html=button('play','▶ 英文なしで聞き直す')+button('stop','■ 停止')+'<p>'+esc(l.reply)+'</p><details><summary>使う表現を確認する</summary><p lang="en">'+esc(l.pattern)+'</p></details>'+button('finish','できた・終わる')+button('ai','🗣 AIと使う');
 if(state.step===4)html='<p>今日の耳トレ、できました。</p>'+button('ai','🗣 AIと使う')+button('new','もう一度聞く');
 $('lrBody').innerHTML=html; if(state.step===1||state.step===2)practicePaint(); $('lrBack').hidden=state.step===0||state.step===4; $('lrStatus').textContent='';$('lrTitle').focus();home();
}
function finish(){state.results=(Array.isArray(state.results)?state.results:[]).concat({index:state.index,issue:state.issue,at:Date.now()}).slice(-60);state.step=4;H.recordActivity();save();render();}
document.addEventListener('click',e=>{
 const open=e.target.closest('[data-action="listeningRoute"]');if(open){plan();H.openListeningRoute();render();return;}
 const b=e.target.closest('[data-lr]');if(!b)return;const a=b.dataset.lr,l=lessons[state.index];
 if(a.startsWith('practice-')){
  if(a==='practice-play')return practicePlay();
  stop();$('lrPractice').classList.remove('is-playing');
  if(a==='practice-stop'){$('lrPracticeStatus').textContent='停止しました。';return;}
  if(a==='practice-visible')practice.hidden=false;
  if(a==='practice-hidden'){practice.hidden=true;const full=$('lrBody').querySelector('.lr-full');if(full)full.open=false;}
  if(a==='practice-prev')practice.index=Math.max(0,practice.index-1);
  if(a==='practice-next')practice.index=Math.min(l.chunks.length-1,practice.index+1);
  practicePaint();return;
 }
 if(a==='reviewPlay'&&state.review)return play([lessons[state.review.index].chunks[state.review.chunk][0]]);
 if(a==='play')return play(l.lines.map(x=>x[1]));
 if(a.startsWith('chunk-'))return play([l.chunks[Number(a.slice(6))][0]]);
 stop();if(a==='stop'){$('lrStatus').textContent='音声を停止しました。';return;}
 if(a==='reviewDone'||a==='reviewSkip'){state.reviewDone=true;if(a==='reviewDone')H.recordActivity();save();render();}
 if(a.startsWith('mark-')){const i=Number(a.slice(5));if(l.chunks[i]){state.markedChunk=state.markedChunk===i?null:i;save();render();}}
 if(a==='next'){if(state.step===0)state.answer=$('lrAnswer').value;if(state.step===1){state.issue=$('lrIssue').value;if(!state.issue){$('lrStatus').textContent='近いものを一つ選んでください。';return;}}state.step++;save();render();}
 if(a==='back'){state.step=Math.max(0,state.step-1);save();render();}
 if(a==='finish')finish();
 if(a==='new'){practice.index=0;state={...state,index:state.index,step:0,issue:'',answer:'',heard:false};save();render();}
 if(a==='ai'){H.openTalk();document.dispatchEvent(new CustomEvent('hanaseru:practiceTalk',{detail:{domain:'travel',ja:l.scenario,en:'Target expression: '+l.pattern+'. Ask one short question at a time. Use a different detail from the sample. Let me answer without showing a model answer.'}}));}
});
document.addEventListener('input',e=>{if(e.target.id==='lrAnswer'){state.answer=e.target.value;save();}});
document.addEventListener('change',e=>{if(e.target.id==='lrPracticeRate'){stop();practice.rate=Number(e.target.value);practicePaint();return;}if(e.target.id==='lrPracticeRepeat'){practice.repeat=e.target.checked;return;}if(e.target.id==='lrIssue'){state.issue=e.target.value;save();}});
$('hsStop').addEventListener('click',()=>{token++;practice.playing=false;if($('lrPractice'))$('lrPractice').classList.remove('is-playing');});
document.addEventListener('hanaseru:leave',stop);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&!$('listeningRoute').hidden)stop();else if(!document.hidden){const before=state.planDay;plan();if(before!==state.planDay&&!$('listeningRoute').hidden)render();}});
plan();
if(new URLSearchParams(location.search).get("practice")==="listening"){H.openListeningRoute();render();}
}());
