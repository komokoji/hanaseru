/* Original travel practice scripts, not recordings of actual travellers. */
(function(){
'use strict';
const H=window.Hanaseru, $=id=>document.getElementById(id), KEY='hanaseru-listening-route-v1';
const lessons=[
 {title:'乗り継ぎがぎりぎり',lines:[['A','Do you think we’ll make the connection?'],['B','We should, as long as this flight leaves on time. If it doesn’t, we’ll have to ask about the next one.']],gist:'この便が定刻に出れば間に合いそう。遅れたら次の便を相談する。',chunks:[['We should,','間に合うはず。shouldの後ろはmake the connectionを省略。'],['as long as this flight leaves on time.','この便が定刻に出る限りは。条件を付け足す。'],['If it doesn’t,','定刻に出なければ。doesn’tはleaves on timeを受ける。'],['we’ll have to ask about the next one.','次の便について聞く必要がある。oneはflight。']],sound:'we’ll / have to / the next one を一語ずつでなく、まとまりとして聞き直す。',pattern:'We should, as long as …',reply:'「時間どおりなら間に合いそう」と、自分の予定に置き換えて返す。',scenario:'At an airport, discuss a tight connection. Change the departure time. Invite the learner to use as long as or if, without giving their answer.'},
 {title:'機内の隣席で雑談',lines:[['A','Are you heading home, or is this a holiday?'],['B','A bit of both, actually. I’m visiting family, but I’m hoping to spend a couple of days exploring as well.']],gist:'家族を訪ねる旅行で、観光にも数日使いたい。',chunks:[['A bit of both, actually.','実は両方少しずつ。相手の二択を受けて返す。'],['I’m visiting family,','家族を訪ねる予定。'],['but I’m hoping to spend a couple of days exploring as well.','でも観光にも数日使えたらと思っている。spend＋時間＋動詞ing。']],sound:'a bit of both / a couple of days / as well の短い語も含めて聞く。',pattern:'I’m …, but I’m hoping to … as well.',reply:'仕事と観光など、旅行の目的を二つつないで返す。',scenario:'You are a friendly fellow passenger. Ask about the learner’s trip and respond with a follow-up. Invite a two-part explanation using but or as well.'},
 {title:'ホテルで静かな部屋へ',lines:[['A','How was your first night?'],['B','The room itself was lovely, but it was a bit noisier than I expected. Is there any chance we could move somewhere quieter?']],gist:'部屋はよかったが予想より騒がしく、静かな部屋への移動を頼みたい。',chunks:[['The room itself was lovely,','部屋そのものはよかった。'],['but it was a bit noisier than I expected.','でも予想より少し騒がしかった。than I expectedで比較を補う。'],['Is there any chance','可能性はありますか、と柔らかく切り出す。'],['we could move somewhere quieter?','もっと静かな所へ移れないか。']],sound:'than I expected / Is there any chance / somewhere quieter を区切って聞く。',pattern:'It was a bit … than I expected.',reply:'予想との違いを伝えて、静かな部屋をお願いする。',scenario:'You are a hotel receptionist. Ask about the stay, then offer an alternative room with a trade-off. Let the learner explain and request a change.'},
 {title:'カフェのおすすめ',lines:[['A','What would you recommend if I don’t want anything too sweet?'],['B','I’d go for the plain yogurt. It comes with honey on the side, so you can add as much or as little as you like.']],gist:'甘さを調節できる、はちみつ別添えのヨーグルトがおすすめ。',chunks:[['I’d go for the plain yogurt.','私ならプレーンヨーグルトを選ぶ。I’dはI would。'],['It comes with honey on the side,','はちみつが別添えで付く。'],['so you can add as much or as little as you like.','だから好きなだけ多くも少なくも加えられる。']],sound:'I’d go for / comes with / as much or as little as をまとめて聞く。',pattern:'I’d go for … because …',reply:'自分ならどれを選ぶか、理由を添えて話す。',scenario:'At a cafe, help the learner choose between two breakfast options. Ask about preferences and invite a reason. No medical or dietary advice.'},
 {title:'駅への道を聞く',lines:[['A','Is the station within walking distance?'],['B','It is, but the route that shows up on your phone takes you up a steep hill. I’d take the road along the river instead.']],gist:'歩けるがスマホの経路は急坂。川沿いの道がおすすめ。',chunks:[['It is,','歩ける距離です。質問のwithin walking distanceを受ける。'],['but the route that shows up on your phone','でもスマホに出る経路は。that以下はrouteを説明する。'],['takes you up a steep hill.','急な坂を上る道になる。ここでrouteの動作が分かる。'],['I’d take the road along the river instead.','私なら代わりに川沿いの道を行く。']],sound:'the route that / shows up / along the river instead を聞き、何が何をするか追う。',pattern:'The … that …',reply:'おすすめされた道を確認し、所要時間を聞く。',scenario:'Give directions to a station with two possible routes. Change one detail and ask the learner to confirm which route they will take.'},
 {title:'天気で予定を変更',lines:[['A','Did you manage to get out on the boat yesterday?'],['B','We were going to, but it got cancelled because of the wind. We ended up wandering around the old town, which was actually really nice.']],gist:'風で船が欠航し、代わりに旧市街を歩いた。結果的には楽しかった。',chunks:[['We were going to,','行くつもりだった。後ろのget out on the boatを省略。'],['but it got cancelled because of the wind.','でも風のため中止になった。'],['We ended up wandering around the old town,','結局、旧市街をぶらぶら歩いた。ended up＋動詞ing。'],['which was actually really nice.','それが実はとてもよかった。whichで直前の体験を補足する。']],sound:'were going to / ended up / which was actually を聞いて、予定と結果を分ける。',pattern:'We were going to …, but … We ended up …',reply:'予定が変わった経験を、予定→理由→結果の順に話す。',scenario:'Chat with a traveller about a changed plan. Ask what they intended to do, what changed, and how it turned out. Do not assume their personal history.'}
];
window.HANASERU_LISTENING_LESSONS=lessons;
let state={index:0,step:0,issue:'',answer:'',heard:false,results:[]}, token=0;
try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&Number.isInteger(s.index)&&s.index>=0&&s.index<lessons.length&&Number.isInteger(s.step)&&s.step>=0&&s.step<=4)state={...state,...s};}catch(_){}
function plan(){state=window.HanaseruDailyListening.prepare(state,Date.now(),lessons);save();}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(_){$('lrStatus').textContent='この端末に保存できません。開いている間は続けられます。';}home();}
function esc(x){return String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function button(action,text){return '<button type="button" data-lr="'+action+'">'+text+'</button>';}
function home(){ $('lrHome').textContent=(state.step===4?'今日は一区切り：':state.step>0?'続きから：':'今日の会話：')+lessons[state.index].title+(state.review&&!state.reviewDone?' ＋ 昨日の一表現（約30秒）':''); }
const audio=$('lrAudio');let audioWait=null;
function stop(){token++;clearTimeout(audioWait);audio.onplaying=audio.onended=audio.onerror=null;audio.pause();audio.removeAttribute('src');audio.load();if(window.speechSynthesis)window.speechSynthesis.cancel();}
function play(parts){
 stop();const t=token,path=(window.HANASERU_LISTENING_AUDIO||{})[parts.join(' ')];
 if(!path){$('lrStatus').textContent='音声ファイルを読み込めません。ページを再読み込みしてください。';return;}
 audio.hidden=false;audio.src=path;audio.currentTime=0;
 $('lrStatus').textContent='音声を読み込んでいます…';
 audio.onplaying=()=>{if(t!==token)return;clearTimeout(audioWait);$('lrStatus').textContent='再生中です。下の音声プレーヤーでも停止・聞き直しができます。';};
 audio.onended=()=>{if(t!==token)return;clearTimeout(audioWait);state.heard=true;save();$('lrStatus').textContent='もう一度聞いても、次へ進んでも大丈夫です。';};
 audio.onerror=()=>{if(t!==token)return;clearTimeout(audioWait);$('lrStatus').textContent='音声を読み込めませんでした。通信を確認し「会話を聞く」をもう一度押してください。';};
 audioWait=setTimeout(()=>{if(t===token)$('lrStatus').textContent='音声プレーヤーの ▶ を押してください。聞こえない場合は音量とBluetoothの出力先を確認してください。';},8000);
 const started=audio.play();if(started&&started.catch)started.catch(()=>{if(t===token){clearTimeout(audioWait);$('lrStatus').textContent='下の音声プレーヤーの ▶ を押してください。';}});
}

function render(){audio.hidden=true;
 const l=lessons[state.index];$('lrTitle').textContent=l.title;$('lrProgress').textContent=['1 / 4 聞く','2 / 4 つまずきを確認','3 / 4 聞き直す','4 / 4 自分の言葉で使う','今日の一区切り'][state.step];
 let html='';
 if(state.review&&!state.reviewDone){
  const r=state.review,c=lessons[r.index].chunks[r.chunk];
  $('lrTitle').textContent='まず、昨日の一表現';$('lrProgress').textContent='約30秒の復習 → 今日の会話 約2分30秒';
  $('lrBody').innerHTML='<p>'+ (r.explicit?'昨日「ここでつまずいた」と残した表現です。':'昨日つまずきを記録した会話から、一表現を選びました。')+'</p>'+button('reviewPlay','▶ 聞いて、一度まねる')+button('stop','■ 音声を停止')+'<details><summary>表現と意味を見る</summary><p lang="en">'+esc(c[0])+'</p><p>'+esc(c[1])+'</p></details>'+button('reviewDone','一度まねた・今日の会話へ')+button('reviewSkip','今日は復習を飛ばす')+'<p>今日の会話：'+esc(l.title)+'。埋め合わせや課題の追加はありません。</p>';
  $('lrBack').hidden=true;$('lrStatus').textContent='';$('lrTitle').focus();home();return;
 }

 if(state.step===0)html='<p>まず英文を見ずに、何が起きた会話か聞いてみましょう。</p>'+button('play','▶ 会話を聞く')+button('stop','■ 音声を停止')+'<label for="lrAnswer">どんな話？（日本語でも・入力は任意）</label><textarea id="lrAnswer" rows="2" maxlength="600" placeholder="頭の中で答えるだけでもOK">'+esc(state.answer)+'</textarea>'+button('next','つまずきを確認する →');
 if(state.step===1)html='<p>自分の理解と比べましょう。採点ではなく、次に聞く場所を選びます。</p><p><b>話の要点：</b>'+esc(l.gist)+'</p><p>'+l.lines.map(x=>esc(x[0]+': '+x[1])).join('<br>')+'</p><label for="lrIssue">どこで止まった？</label><select id="lrIssue"><option value="">選んでください</option>'+[['sound','音が単語として分からなかった'],['structure','文のつながりを追えなかった'],['memory','後半で前の内容を忘れた'],['clear','要点はつかめた']].map(x=>'<option value="'+x[0]+'" '+(state.issue===x[0]?'selected':'')+'>'+x[1]+'</option>').join('')+'</select>'+button('next','区切って聞き直す →');
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
