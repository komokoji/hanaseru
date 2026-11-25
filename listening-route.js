/* 今日の耳トレの画面。会話は創作（実在の録音ではない）。 */
(function(){
'use strict';
const H=window.Hanaseru, $=id=>document.getElementById(id), KEY='hanaseru-listening-route-v1';
// 会話の本文は listening-lessons.js（骨太の10場面・話し手ごとに男女の声）。
const lessons=window.HANASERU_LISTENING_LESSONS;
let state={index:0,step:0,issue:'',answer:'',heard:false,results:[]}, token=0;
try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&Number.isInteger(s.index)&&s.index>=0&&s.index<lessons.length&&Number.isInteger(s.step)&&s.step>=0&&s.step<=4)state={...state,...s};}catch(_){}
function plan(){state=window.HanaseruDailyListening.prepare(state,Date.now(),lessons);save();}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(_){$('lrStatus').textContent='この端末に保存できません。開いている間は続けられます。';}home();}
function esc(x){return String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function button(action,text){return '<button type="button" data-lr="'+action+'">'+text+'</button>';}
function home(){ $('lrHome').textContent=(state.step===4?'今日は一区切り：':state.step>0?'続きから：':'今日の会話：')+lessons[state.index].title+'（'+(lessons[state.index].place||'')+'）'+(state.review&&!state.reviewDone?' ＋ 昨日の一表現（約30秒）':''); }
// 鳴らす・止めるは共通プレーヤー（audio-core.js）。公開済みMP3を使うのでログイン不要。
function stop(){token++;window.HanaseruAudio.stop('');}
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

function render(){
 const l=lessons[state.index];$('lrTitle').textContent=l.title;$('lrProgress').textContent=['1 / 4 聞く','2 / 4 つまずきを確認','3 / 4 聞き直す','4 / 4 自分の言葉で使う','今日の一区切り'][state.step];
 let html='';
 if(state.review&&!state.reviewDone){
  const r=state.review,c=lessons[r.index].chunks[r.chunk];
  $('lrTitle').textContent='まず、昨日の一表現';$('lrProgress').textContent='約30秒の復習 → 今日の会話 約2分30秒';
  $('lrBody').innerHTML='<p>'+ (r.explicit?'昨日「ここでつまずいた」と残した表現です。':'昨日つまずきを記録した会話から、一表現を選びました。')+'</p>'+button('reviewPlay','▶ 聞いて、一度まねる')+button('stop','■ 音声を停止')+'<details><summary>表現と意味を見る</summary><p lang="en">'+esc(c[0])+'</p><p>'+esc(c[1])+'</p></details>'+button('reviewDone','一度まねた・今日の会話へ')+button('reviewSkip','今日は復習を飛ばす')+'<p>今日の会話：'+esc(l.title)+'。埋め合わせや課題の追加はありません。</p>';
  $('lrBack').hidden=true;$('lrStatus').textContent='';$('lrTitle').focus();home();return;
 }

 if(state.step===0)html='<p class="lr-where">'+esc(l.place||'')+'：'+esc(l.who?l.who.A+' と '+l.who.B:'')+'</p><p>まず英文を見ずに、何が起きた会話か聞いてみましょう。自然な速さです。</p>'+button('play','▶ 会話を聞く')+button('stop','■ 音声を停止')+'<label for="lrAnswer">どんな話？（日本語でも・入力は任意）</label><textarea id="lrAnswer" rows="2" maxlength="600" placeholder="頭の中で答えるだけでもOK">'+esc(state.answer)+'</textarea>'+button('next','つまずきを確認する →');
 if(state.step===1)html='<p>自分の理解と比べましょう。採点ではなく、次に聞く場所を選びます。</p><p><b>話の要点：</b>'+esc(l.gist)+'</p><div class="lr-lines">'+l.lines.map(x=>'<p lang="en"><b>'+esc((l.who&&l.who[x[0]])||x[0])+'</b>'+esc(x[1])+'</p>').join('')+'</div><label for="lrIssue">どこで止まった？</label><select id="lrIssue"><option value="">選んでください</option>'+[['sound','音が単語として分からなかった'],['structure','文のつながりを追えなかった'],['memory','後半で前の内容を忘れた'],['clear','要点はつかめた']].map(x=>'<option value="'+x[0]+'" '+(state.issue===x[0]?'selected':'')+'>'+x[1]+'</option>').join('')+'</select>'+button('next','区切って聞き直す →');
 if(state.step===2){const advice={sound:l.sound,structure:'説明の途中でも、主語と動作、条件・理由・結果のつながりを追いましょう。',memory:'一区切りごとに短く意味を思い浮かべ、最後に全体をつなげます。',clear:'同じ音声で確認したあと、内容を変えて使ってみましょう。'};html='<p>'+esc(advice[state.issue]||l.sound)+'</p>'+l.chunks.map((x,i)=>'<div class="goal-start">'+button('chunk-'+i,'▶ このまとまりを聞く')+'<p lang="en">'+esc(x[0])+'</p><p>'+esc(x[1])+'</p>'+button('mark-'+i,state.markedChunk===i?'✓ 明日この表現を復習':'ここでつまずいた・明日少し復習')+'</div>').join('')+button('next','英文を閉じて、もう一度 →');}
 if(state.step===3)html='<p>もう一度聞いて、話の流れを追いましょう。</p>'+button('play','▶ 英文なしで聞き直す')+button('stop','■ 音声を停止')+'<p>'+esc(l.reply)+'</p><details><summary>使う表現を確認する</summary><p lang="en">'+esc(l.pattern)+'</p></details><p>口に出して一度返したら、今日はここまででも十分です。</p>'+button('finish','一度返した・今日はここまで')+button('ai','この表現をAIとの会話で使う');
 if(state.step===4)html='<p>取り組んだことを記録しました。習得や聞き取り正解の判定ではありません。</p>'+button('ai','余裕があればAIと使う')+button('new','今日の会話をもう一度')+'<p class="muted">今日は終えて大丈夫。埋め合わせは要りません。</p>';
 $('lrBody').innerHTML=html; $('lrBack').hidden=state.step===0||state.step===4; $('lrStatus').textContent='';$('lrTitle').focus();home();
}
function finish(){state.results=(Array.isArray(state.results)?state.results:[]).concat({index:state.index,issue:state.issue,at:Date.now()}).slice(-60);state.step=4;H.recordActivity();save();render();}
document.addEventListener('click',e=>{
 const open=e.target.closest('[data-action="listeningRoute"]');if(open){plan();H.openListeningRoute();render();return;}
 const b=e.target.closest('[data-lr]');if(!b)return;const a=b.dataset.lr,l=lessons[state.index];
 if(a==='reviewPlay'&&state.review)return play([lessons[state.review.index].chunks[state.review.chunk][0]]);
 if(a==='play')return play(l.lines.map(x=>x[1]));
 if(a.startsWith('chunk-'))return play([l.chunks[Number(a.slice(6))][0]]);
 stop();if(a==='stop'){$('lrStatus').textContent='音声を停止しました。';return;}
 if(a==='reviewDone'||a==='reviewSkip'){state.reviewDone=true;if(a==='reviewDone')H.recordActivity();save();render();}
 if(a.startsWith('mark-')){const i=Number(a.slice(5));if(l.chunks[i]){state.markedChunk=state.markedChunk===i?null:i;save();render();}}
 if(a==='next'){if(state.step===0)state.answer=$('lrAnswer').value;if(state.step===1){state.issue=$('lrIssue').value;if(!state.issue){$('lrStatus').textContent='近いものを一つ選んでください。';return;}}state.step++;save();render();}
 if(a==='back'){state.step=Math.max(0,state.step-1);save();render();}
 if(a==='finish')finish();
 if(a==='new'){state={...state,index:state.index,step:0,issue:'',answer:'',heard:false};save();render();}
 if(a==='ai'){H.openTalk();document.dispatchEvent(new CustomEvent('hanaseru:practiceTalk',{detail:{domain:'travel',ja:l.scenario,en:'Target expression: '+l.pattern+'. Ask one short question at a time. Use a different detail from the sample. Let me answer without showing a model answer.'}}));}
});
document.addEventListener('input',e=>{if(e.target.id==='lrAnswer'){state.answer=e.target.value;save();}});
document.addEventListener('change',e=>{if(e.target.id==='lrIssue'){state.issue=e.target.value;save();}});
document.addEventListener('hanaseru:leave',stop);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&!$('listeningRoute').hidden)stop();else if(!document.hidden){const before=state.planDay;plan();if(before!==state.planDay&&!$('listeningRoute').hidden)render();}});
plan();
if(new URLSearchParams(location.search).get("practice")==="listening"){H.openListeningRoute();render();}
}());
