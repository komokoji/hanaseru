/* Personal priority course. Local-only progress intentionally separate from cloud records. */
(function(){
'use strict';
const H=window.Hanaseru,C=window.HanaseruPriorityCore,items=window.HANASERU_PRIORITY;
const ids=items.map(x=>x.id),key='hanaseru-priority-v1',box=document.getElementById('priority'),body=document.getElementById('p30Body');
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let storageError=false,raw=null;
try{raw=JSON.parse(localStorage.getItem(key));}catch(e){storageError=true;}
let state=C.clean(raw,ids);
function save(){try{localStorage.setItem(key,JSON.stringify(state));storageError=false;}catch(e){storageError=true;}notice();home();}
function notice(){document.getElementById('p30Storage').textContent=storageError?'この端末に進捗を保存できません。いまの画面では練習できますが、閉じると続きが失われることがあります。':'進捗はこの端末に保存します。判定は自分で行います。';}
function source(item){const scene=window.HANASERU_SCENES.find(s=>s.id===item.scene);return {scene,turn:scene&&scene.turns[item.turn]};}
function status(id){const r=state.items[id];return !r?'これから':C.stable(r)?'別の日にも返せた':r.outcome==='pass'?'違う質問にも返せた':'手本ともう一度';}
function home(){
 const limit=C.unlock(state,ids),n=ids.slice(0,limit).filter(id=>C.stable(state.items[id])).length;
 const q=state.session,pending=q&&q.index<q.queue.length;
 document.getElementById('p30HomeTitle').textContent='私のトップ'+limit;
 document.getElementById('p30HomeProgress').textContent='まずはトップ'+limit+' · 別の日にも返せた '+n+' / '+limit+'（自己評価）';
 document.getElementById('p30Start').textContent=pending?'今日の練習を続ける':'今日の練習を始める';
 document.getElementById('p30HomeNote').textContent=storageError?'進捗を保存できません。練習画面で確認してください。':'1回3つのやり取り。途中で終えても、続きから。';
 document.getElementById('p30Catalog').innerHTML=[10,20,30].map((end,i)=>'<h3>'+['トップ10：会話の土台','トップ20：診療で使う','トップ30：本・仕事・旅先'][i]+'</h3><ol start="'+(i*10+1)+'">'+items.slice(i*10,end).map(x=>'<li>'+esc(x.title)+' <small>'+esc(status(x.id))+'</small></li>').join('')+'</ol>').join('');
}
function button(action,label,kind='big'){return '<button type="button" class="'+kind+'" data-pr="'+action+'">'+label+'</button>';}
function open(extra){H.openSection('priority');C.begin(state,ids,C.today(),extra);save();render();}
function render(){
 const q=state.session;
 notice();
 if(!q||q.index>=q.queue.length){
  document.getElementById('p30Title').textContent='今日はここまで';
  document.getElementById('p30Progress').textContent='トップ'+C.unlock(state,ids)+' · 少しずつ、口から出る会話へ';
  body.innerHTML='<div class="card"><h3>おつかれさまでした</h3><p>次はまた別の日に、見ずに返せるか確かめましょう。</p>'+(q?'<ul>'+q.queue.map(id=>'<li>'+esc(items.find(x=>x.id===id).title)+'：'+esc(status(id))+'</li>').join('')+'</ul>':'')+'</div>'+button('home','ホームへ')+button('extra','もう3つ練習する','link');
  return;
 }
 const item=items.find(x=>x.id===q.queue[q.index]),{scene,turn:t}=source(item);
 if(!t){body.innerHTML='<p>教材を読み込めませんでした。ホームから最新版を読み込んでください。</p>'+button('home','ホームへ');return;}
 const step=q.step,labels=['相手の言葉を聞く','手本をまねて話す','見ずに返す','聞かれ方が変わっても返す'];
 document.getElementById('p30Title').textContent=(items.indexOf(item)+1)+'. '+item.title;
 document.getElementById('p30Progress').textContent='今日の '+(q.index+1)+' / '+q.queue.length+' · '+(step+1)+' / 4 '+labels[step];
 let html='<p>'+esc(step===0?'まず相手の言葉を聞きましょう。':step===1?'手本を聞いたら、声に出してまねてみましょう。':step===2?'英文を見ずに、相手へ声で返してください。言い換えも大丈夫です。':'同じ意味を、別の聞かれ方でも伝えてみましょう。')+'</p>';
 html+='<div class="card">'+button(step===3?'alt':'heard','▶ 相手の言葉を聞く','speak');
 if(step===1)html+='<p lang="en">'+esc(t.heard)+'</p>';
 else html+='<details><summary>相手の英文・意味を見る</summary><p lang="en">'+esc(step===3?item.alternate.heard:t.heard)+'</p><p>'+esc(step===3?item.alternate.ja:t.heardJa)+'</p></details>';
 html+='</div>';
 if(step===0)html+=button('next','手本へ');
 if(step===1)html+='<div class="card"><p class="en" lang="en">'+esc(t.en)+'</p>'+button('model','▶ 手本を聞く','speak')+'<p>'+esc(t.intent)+'</p></div>'+button('next','声に出した → 手本を閉じる');
 if(step===2)html+='<details><summary>伝えたいことのヒント</summary><p>'+esc(t.intent)+'</p></details>'+button('next','見ずに返せた → 別の聞かれ方へ')+button('help','まだ難しい → 手本を見直す','link');
 if(step===3)html+=button('pass','自分の言葉で返せた')+button('again','まだ難しい → 次回もう一度','ng')+button('help','手本を見直す','link');
 if(step===1||step===2)html+=button('again','今日は難しい → 次回もう一度','link');
 html+='<details><summary>この会話の場面</summary><p>'+esc(scene.context)+'</p></details>';
 body.innerHTML=html;window.scrollTo(0,0);document.getElementById('p30Title').focus({preventScroll:true});
}
function play(text){H.speak(text);}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-pr]');if(!b)return;
 const a=b.dataset.pr;
 if(a==='start')return open(false);
 if(a==='extra')return open(true);
 if(a==='home')return H.openHome();
 const q=state.session;if(!q||q.index>=q.queue.length)return;
 const item=items.find(x=>x.id===q.queue[q.index]),t=source(item).turn;if(!t)return;
 if(a==='heard')return play(t.heard);
 if(a==='model')return play(t.en);
 if(a==='alt')return play(item.alternate.heard);
 window.HanaseruAudio.stop('');
 if(a==='next'&&q.step<3){q.step++;}
 else if(a==='help'){q.step=1;}
 else if((a==='pass'&&q.step===3)||(a==='again'&&q.step>=1)){C.grade(state,item.id,a==='pass',C.today());H.recordActivity();q.index++;q.step=0;}
 save();render();
});
document.addEventListener('hanaseru:leave',()=>{window.HanaseruAudio.stop('');home();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)home();});
home();notice();
}());
