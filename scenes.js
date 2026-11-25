/* Two personal goals: contextual response practice, resumable across devices. */
(function () {
  'use strict';
  var H=window.Hanaseru, scenes=window.HANASERU_SCENES, selected=null, track='clinic', model=false, listens=0;
  var $=function(id){return document.getElementById(id);};
  var esc=function(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
  function button(action,label,extra){return '<button class="speak" data-action="'+action+'" '+(extra||'')+'>'+esc(label)+'</button>';}
  function scene(){return scenes.find(function(s){return s.id===selected;});}
  function state(s){return (H.getState().scenes||{})[s.id]||{};}
  function count(s){return s.turns.length+1;}
  function index(s){var i=state(s).index; return Number.isInteger(i)&&i>=0&&i<=count(s)?i:0;}
  function chunks(t){return t.chunks || t.en.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [t.en];}
  function current(s){return s.turns[index(s)]||s.challenge;}
  function stopAudio(){window.HanaseruAudio.stop('');}
  function status(s){
    var p=state(s),i=index(s);
    if(i>0&&i<count(s))return '続きから：'+(i+1)+'往復目';
    if(i===count(s)) return (p.due<=H.today()?'もう一度、見ずに返す日':'ひと通り練習済み')+'（自己評価）';
    return 'まず1往復から';
  }
  function home(){
    ['consult','links','dubai','clinic','travel','personal'].forEach(function(t){
      if(!$('sceneHome-'+t))return;
      var list=scenes.filter(function(s){return s.track===t;});
      var n=list.filter(function(s){return index(s)===count(s);}).length;
      $('sceneHome-'+t).textContent=n+' / '+list.length+' 場面を練習';
    });
  }
  function openList(t){H.openScenes();track=t;selected=null;model=false;renderList();}
  function renderList(){
    $('scTitle').textContent=track==='links'?'🔗 会話のつなぎ':track==='dubai'?'🎤 ドバイ：発表と質疑':track==='consult'?'🩺 診察を英語で':track==='personal'?'自己紹介・接続表現を練習する':track==='clinic'?'診療で話す':'12月のドイツで話す';
    $('scContext').textContent=track==='links'?'聞く → 指定のつなぎの一言から返す → 手本':track==='dubai'?'聞く → 返す → 手本。決まっていないことは言い切らない':'聞く → 自分で返す → 手本 → 見ずにもう一度';
    var list=scenes.filter(function(s){return s.track===track;}).sort(function(a,b){var o=['便秘外来','熱・かぜ','咳・ゼーゼー','発疹・感染症','お腹','栄養外来','皮ふ・けが','外科','予防接種・健診'],x=o.indexOf(a.group),y=o.indexOf(b.group);return (x<0?99:x)-(y<0?99:y)||String(a.group||'').localeCompare(String(b.group||''),'ja');});   // 診察は便秘外来を先頭に
    $('scBody').innerHTML=list.map(function(s,n){return (s.group&&(n===0||list[n-1].group!==s.group)?'<h3 class="sc-group">'+esc(s.group)+'</h3>':'')+'<button class="sc-row" data-action="scChoose" data-id="'+s.id+'"><b>'+esc(s.title)+'</b><span>'+esc(status(s))+'</span></button>';}).join('')+'<p class="muted" style="font-size:11px">練習用に組み直した会話です。患者さんの情報は含みません。</p>';
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
      $('scActions').innerHTML=button('scRestart','相手の言葉だけでもう一度')+button('scAI','🗣 AIと話す')+button('scList','場面を選ぶ')+button('home','今日はここまで');
      return;
    }
    var test=p.mode==='test';
    $('scBody').innerHTML=((s.track==='consult'||s.track==='dubai')&&s.voices&&!challenge&&i===0?'<div class="speakrow sc-top">'+button('scFull','▶ 通しで聞く')+button('scStop','■')+button('scAI','🗣 台本なしでAIと稽古')+'</div>':'')+'<p class="stat">'+(challenge?'最後に、違う質問に返す':(i+1)+' / '+s.turns.length+'往復')+'</p>'
      +'<div class="card"><p class="muted">'+esc(s.role)+'</p>'+button('scHear','▶ 聞く')
      +(test?'<details><summary>英文</summary><p class="en">'+esc(t.heard)+'</p></details>':'<p class="en">'+esc(t.heard)+'</p>')
      +'<details><summary>意味</summary><p>'+esc(t.heardJa)+'</p></details></div>'
      +(test?'':'<p><b>伝える：</b>'+esc(t.intent)+'</p>')
      +(model?'<div class="card sc-model"><p class="muted">手本</p><p class="en">'+esc(t.en)+'</p>'+button('scModelAudio','▶ 手本を聞く')+'<span id="scListenCount" class="stat" role="status"></span><details><summary>区切り・ヒント</summary><p>'+esc(t.note)+'</p>'+chunks(t).map(function(chunk,n){return '<p>'+esc(chunk.trim())+' '+button('scChunk','▶','data-chunk="'+n+'"')+'</p>';}).join('')+'</details>'+button('scSave','🔖 保存')+'<span id="scSaveNote" role="status"></span></div>':'')
      +(t.transfer?'<details><summary>次は内容を変えて、もう一度</summary><p>'+esc(t.transfer)+'</p><p>理由や具体例を一文足し、声に出してみましょう。</p></details>':'')
      ;
    $('scActions').innerHTML=button('scModel',model?'手本を閉じる':'手本を見る')
      +(!model?'<div class="speakrow">'+button('scGrade','言えた','data-result="said"')+button('scGrade','まだ','data-result="again"')+'</div>':'')
      +((s.track==='consult'||s.track==='dubai')?'':button('scAI','🗣 AIと話す'))+button('scList','一覧へ');
  }
  document.addEventListener('click',function(e){
    var el=e.target.closest('[data-action]');if(!el)return;var a=el.dataset.action;
    if(a==='sceneTrack'){openList(el.dataset.track);return;}
    if(a==='scChoose'){
      if(!scenes.some(function(s){return s.id===el.dataset.id;}))return;
      selected=el.dataset.id;model=false;listens=0;render();$('scTitle').focus();return;
    }
    if(a==='scList'){stopAudio();selected=null;renderList();return;}
    var s=scene();if(!s||$('scenes').hidden)return;var t=current(s),p=state(s);
    if(a==='scFull'){window.HanaseruAudio.say(s.turns.map(function(x){return x.heard+' '+x.en;}).join(' '),{rate:1});H.recordActivity();}
    else if(a==='scStop')stopAudio();
    else if(a==='scHear')H.speak(t.heard);
    else if(a==='scModelAudio'){H.speak(t.en);listens++;var counter=$('scListenCount');if(counter)counter.textContent=' '+listens+'回';}
    else if(a==='scChunk'){var parts=chunks(t);if(parts[+el.dataset.chunk])H.speak(parts[+el.dataset.chunk].trim());}
    else if(a==='scModel'){
      model=!model;
      if(model){H.updateScene(s.id,{hinted:true});H.recordActivity();}
      render();
    }else if(a==='scSave'){
      H.addMine((s.track==='personal'?'【自分のこと】':s.track==='clinic'||s.track==='consult'?'【診療】':'【旅行】')+s.title+'：'+t.intent,t.en);
      $('scSaveNote').textContent='保存しました。ことば帳で繰り返し練習できます。';el.disabled=true;
    }else if(a==='scGrade'&&!model&&index(s)<count(s)){
      var results=(p.results||[]).slice();results[index(s)]=el.dataset.result==='again'?'again':p.hinted?'supported':'own';
      // 「まだ難しい」は、つまずき直しへ（間をあけてもう一度出し、AI会話にも出す）
      if(el.dataset.result==='again'&&H.focus)H.focus.add(t.en,t.intent.replace(/^〈[^〉]*〉/,''),'scene');
      if(H.menuDone)H.menuDone('speak');
      var next=index(s)+1,complete=next===count(s);
      var update={index:next,results:results,hinted:false};
      if(complete){update.finishedAt=Date.now();update.due=H.today()+(results.every(function(r){return r==='own';})?3:1);}
      H.updateScene(s.id,update);H.recordActivity();listens=0;render();$('scTitle').focus();
    }else if(a==='scRestart'){
      H.updateScene(s.id,{index:0,results:[],hinted:false,mode:'test'});model=false;render();
    }else if(a==='scAI'){
      H.openTalk();
      // 診察は「台本なし」で：AIが保護者になり、細部を変え、院長が質問でリードする。手本の文は言わせない。
      var brief=s.track==='dubai'
        ? 'ROLEPLAY BRIEF (not a script). You are an attendee at a medical conference in Dubai talking with Dr. Komori after his talk ('+s.role+'). Topic (Japanese): '+s.context
          +' Ask ONE question at a time, in one or two natural spoken sentences, then follow up on what he actually says. Vary your questions from any sample; sometimes challenge him politely or say you did not quite follow.'
          +' If he says something is not measured, not decided, or still in progress, accept that and move on; never push him to claim results, dates, or agreements. Examples of the kind of thing you might ask: '+s.turns.slice(0,4).map(function(t){return '"'+t.heard+'"';}).join(' / ')
        : s.track==='consult'
        ? 'ROLEPLAY BRIEF (not a script). You are the '+(s.role==='父親'?'father':'mother')+' of a child in Dr. Komori\'s clinic. Situation (Japanese): '+s.context
          +' Change small details from any sample (age, number of days, wording). Open with ONE short natural sentence about why you came, then stop and let the doctor lead.'
          +' Answer only what he asks, in one or two natural spoken sentences. Sometimes be a little vague, so that he has to ask a follow-up question.'
          +' When there is a natural pause, bring up one worry of your own, such as: '+s.turns.slice(0,4).map(function(t){return '"'+t.heard+'"';}).join(' / ')
          +' React to what he actually says (Oh, right. / Hmm, but ... / Sorry, what does that mean?). Never explain the medicine yourself.'
        : s.context+' 練習の目標：'+s.goal;
      document.dispatchEvent(new CustomEvent('hanaseru:practiceTalk',{detail:{domain:s.track==='personal'||s.track==='dubai'?'me':s.track==='clinic'||s.track==='consult'?'medical':'travel',ja:brief,en:s.track==='consult'||s.track==='dubai'?'(The points he may want to get across, for your reference only; do not say them for him: '+s.turns.map(function(t){return t.en;}).join(' ')+')':s.turns.map(function(t){return t.en;}).join(' ')}}));
    }
  });
  document.addEventListener('hanaseru:leave',stopAudio);
  document.addEventListener('hanaseru:state',function(){home();if(!$('scenes').hidden){model=false;render();}});
  H.onChange(home);home();
})();
