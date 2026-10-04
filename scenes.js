/* Two personal goals: contextual response practice, resumable across devices. */
(function () {
  'use strict';
  var H=window.Hanaseru, scenes=window.HANASERU_SCENES, selected=null, track='clinic', model=false;
  var $=function(id){return document.getElementById(id);};
  var esc=function(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
  function button(action,label,extra){return '<button class="speak" data-action="'+action+'" '+(extra||'')+'>'+esc(label)+'</button>';}
  function scene(){return scenes.find(function(s){return s.id===selected;});}
  function state(s){return (H.getState().scenes||{})[s.id]||{};}
  function count(s){return s.turns.length+1;}
  function index(s){var i=state(s).index; return Number.isInteger(i)&&i>=0&&i<=count(s)?i:0;}
  function current(s){return s.turns[index(s)]||s.challenge;}
  function stopAudio(){if(window.speechSynthesis) window.speechSynthesis.cancel();}
  function status(s){
    var p=state(s),i=index(s);
    if(i>0&&i<count(s))return '続きから：'+(i+1)+'往復目';
    if(i===count(s)) return (p.due<=H.today()?'もう一度、見ずに返す日':'ひと通り練習済み')+'（自己評価）';
    return 'まず1往復から';
  }
  function home(){
    ['clinic','travel'].forEach(function(t){
      var list=scenes.filter(function(s){return s.track===t;});
      var n=list.filter(function(s){return index(s)===count(s);}).length;
      $('sceneHome-'+t).textContent=n+' / '+list.length+'場面をひと通り練習。途中からでも、1往復だけでも。';
    });
  }
  function openList(t){H.openScenes();track=t;selected=null;model=false;renderList();}
  function renderList(){
    $('scTitle').textContent=track==='clinic'?'診療で話す':'12月のドイツで話す';
    $('scContext').textContent='相手の言葉を聞く → 自分で返す → 必要なら手本 → 見ずにもう一度。最後に違う質問にも答えてみます。';
    var list=scenes.filter(function(s){return s.track===track;});
    $('scBody').innerHTML='<p class="muted">休んだ分のまとめ取りは不要です。今日は使いたい場面を一つ。進み具合はこの端末に保存し、ログイン中は同期します。</p>'+list.map(function(s){return '<div class="shelf-entry"><h3>'+esc(s.title)+'</h3><p>'+esc(s.goal)+'</p><p class="stat">'+esc(status(s))+'</p>'+button('scChoose','この場面を開く','data-id="'+s.id+'"')+'</div>';}).join('')+'<p class="muted">診療は普段の説明の流れをもとに組み直した練習用会話です。個別の治療判断や患者情報をそのまま収録したものではありません。旅行の返答・時刻・条件も練習用です。</p>';
    $('scActions').innerHTML='';$('scTitle').focus();
  }
  function render(){
    var s=scene();if(!s)return renderList();
    stopAudio();var p=state(s),i=index(s),t=current(s),challenge=i===s.turns.length;
    $('scTitle').textContent=s.title;
    $('scContext').textContent=s.context;
    if(i===count(s)){
      var results=p.results||[],miss=results.filter(function(r){return r==='again';}).length;
      var independent=results.filter(function(r){return r==='own';}).length;
      $('scBody').innerHTML='<div class="card"><h3>今日の一歩、できました</h3><p>手本を開かず返せた：'+independent+' / '+count(s)+'往復<br>もう一度練習したい：'+miss+'往復</p><p>これは自分で振り返った記録です。音声の正確さやB2到達を判定したものではありません。</p><p>次は'+(p.due<=H.today()?'今日':p.due===H.today()+1?'明日':'少し間を空けて')+'、相手の言葉だけで返してみましょう。</p></div>';
      $('scActions').innerHTML=button('scRestart','相手の言葉だけでもう一度')+button('scAI','この場面でAIと話す（要ログイン）')+button('scList','場面を選ぶ')+button('home','今日はここまで');
      return;
    }
    var test=p.mode==='test';
    $('scBody').innerHTML='<p class="stat">'+(challenge?'最後に、違う質問に返す':(i+1)+' / '+s.turns.length+'往復')+' · 1往復で終えてもOK</p>'
      +'<div class="card"><p class="muted">'+esc(s.role)+'の言葉</p>'+button('scHear','相手の言葉を聞く')
      +(test?'<details><summary>相手の英文を見る</summary><p class="en">'+esc(t.heard)+'</p></details>':'<p class="en">'+esc(t.heard)+'</p>')
      +'<details><summary>相手の言葉の意味</summary><p>'+esc(t.heardJa)+'</p></details></div>'
      +(test?'<p>相手の問いに、自分の言葉で声に出して返してください。</p>':'<p><b>伝えたいこと：</b>'+esc(t.intent)+'</p>')
      +(model?'<div class="card sc-model"><p class="muted">自分の返し方の例 · 一字一句同じでなくてOK</p><p class="en">'+esc(t.en)+'</p>'+button('scModelAudio','手本を聞く・少し遅れてまねる')+'<details><summary>区切って練習・言い方のヒント</summary><p>'+esc(t.note)+'</p>'+t.en.match(/[^.!?]+[.!?]+|[^.!?]+$/g).map(function(chunk,n){return '<p>'+esc(chunk.trim())+' '+button('scChunk','この一文を聞く','data-chunk="'+n+'"')+'</p>';}).join('')+'</details>'+button('scSave','自分のことば帳にも保存')+'<span id="scSaveNote" role="status"></span></div>':'')
      +'<p class="muted">'+(model?'音をまねたら、手本を閉じて相手に返しましょう。':'まず声に出してみましょう。詰まったら手本を見て、閉じてもう一度。')+'</p>';
    $('scActions').innerHTML=button('scModel',model?'手本を閉じて、自分で返す':'返し方の手本・解説を開く')
      +(!model?'<div class="speakrow">'+button('scGrade','声に出して返せた','data-result="said"')+button('scGrade','まだ難しい・次でまた練習','data-result="again"')+'</div>':'')
      +button('home','今日はここまで（続きは保存済み）')+button('scList','別の場面へ');
  }
  document.addEventListener('click',function(e){
    var el=e.target.closest('[data-action]');if(!el)return;var a=el.dataset.action;
    if(a==='sceneTrack'){openList(el.dataset.track);return;}
    if(a==='scChoose'){
      if(!scenes.some(function(s){return s.id===el.dataset.id;}))return;
      selected=el.dataset.id;model=false;render();$('scTitle').focus();return;
    }
    if(a==='scList'){stopAudio();selected=null;renderList();return;}
    var s=scene();if(!s||$('scenes').hidden)return;var t=current(s),p=state(s);
    if(a==='scHear')H.speak(t.heard);
    else if(a==='scModelAudio')H.speak(t.en);
    else if(a==='scChunk'){var chunks=t.en.match(/[^.!?]+[.!?]+|[^.!?]+$/g);if(chunks[+el.dataset.chunk])H.speak(chunks[+el.dataset.chunk].trim());}
    else if(a==='scModel'){
      model=!model;
      if(model){H.updateScene(s.id,{hinted:true});H.recordActivity();}
      render();
    }else if(a==='scSave'){
      H.addMine((s.track==='clinic'?'【診療】':'【旅行】')+s.title+'：'+t.intent,t.en);
      $('scSaveNote').textContent='保存しました。ことば帳で繰り返し練習できます。';el.disabled=true;
    }else if(a==='scGrade'&&!model&&index(s)<count(s)){
      var results=(p.results||[]).slice();results[index(s)]=el.dataset.result==='again'?'again':p.hinted?'supported':'own';
      var next=index(s)+1,complete=next===count(s);
      var update={index:next,results:results,hinted:false};
      if(complete){update.finishedAt=Date.now();update.due=H.today()+(results.every(function(r){return r==='own';})?3:1);}
      H.updateScene(s.id,update);H.recordActivity();render();$('scTitle').focus();
    }else if(a==='scRestart'){
      H.updateScene(s.id,{index:0,results:[],hinted:false,mode:'test'});model=false;render();
    }else if(a==='scAI'){
      H.openTalk();document.dispatchEvent(new CustomEvent('hanaseru:practiceTalk',{detail:{domain:s.track==='clinic'?'medical':'travel',ja:s.context+' 練習の目標：'+s.goal,en:s.turns.map(function(t){return t.en;}).join(' ')}}));
    }
  });
  document.addEventListener('hanaseru:leave',stopAudio);
  document.addEventListener('hanaseru:state',function(){home();if(!$('scenes').hidden){model=false;render();}});
  H.onChange(home);home();
})();
