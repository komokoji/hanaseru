/* 自分のことば帳：場面と学習状態を分ける。実使用の記録は復習成績とは別。 */
(function(){
  'use strict';
  var H=window.Hanaseru, C=window.HanaseruPracticeCore;
  var $=function(id){return document.getElementById(id);};
  var esc=function(s){return String(s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];});};
  var tab='want', limit=30;
  var labels={inbox:'メモ・未英訳',want:'これから',learning:'練習中',used:'実際に使えた',paused:'今は休む'};
  function owned(){return H.cards().filter(function(c){return c.domain==='mine' || H.getState().cards[c.id];});}
  function button(action,text,id){return '<button class="speak" data-action="'+action+'" data-id="'+esc(id)+'">'+text+'</button>';}
  function render(){
    if($('shelf').hidden) return;
    var state=H.getState(), cards=owned(), captures=state.captures.filter(function(c){return !c.phraseId;});
    $('shelfTabs').innerHTML=Object.keys(labels).map(function(k){
      var n=k==='inbox'?captures.length:cards.filter(function(c){return C.stage(c,state.cards[c.id])===k;}).length;
      return '<button class="chip'+(tab===k?' on':'')+'" data-action="shelfTab" data-tab="'+k+'" aria-pressed="'+(tab===k)+'">'+labels[k]+' '+n+'</button>';
    }).join('');
    var search=$('shelfSearch').value.trim().toLowerCase(), topic=$('shelfTopic').value;
    if(tab==='inbox'){
      var memos=captures.filter(function(c){return (topic==='all'||C.topic({domain:'mine',ja:(c.scene||'')+' '+c.ja})===topic)&&c.ja.toLowerCase().includes(search);});
      $('shelfCount').textContent=memos.length+'件。英訳する前のメモです。保存を急がなくても大丈夫。';
      $('shelfList').innerHTML=memos.slice(0,limit).map(function(c){
        return '<article class="shelf-entry"><p>'+esc(c.ja)+'</p><p class="muted">'+esc([c.scene,c.obstacle].filter(Boolean).join(' ・ '))+'</p>'
          +'<button class="speak" data-action="capCoach" data-idx="'+state.captures.indexOf(c)+'">英語にする</button></article>';
      }).join('') || '<p class="muted">該当するメモはありません。</p>';
      $('shelfList').innerHTML+=button('openCaptureHome','＋ 言いたいことを残す','');
      $('shelfMore').hidden=memos.length<=limit; return;
    }
    var filtered=cards.filter(function(c){return C.stage(c,state.cards[c.id])===tab && (topic==='all'||C.topic(c)===topic) && (c.ja+' '+c.en).toLowerCase().includes(search);});
    $('shelfCount').textContent=filtered.length+'文。'+({want:'保存した文と「あとで練習」に選んだ文です。',learning:'見た文・声に出して練習した文です。',used:'実際の会話で使えたという自己記録です。復習は続けられます。',paused:'毎日の自動出題から外しています。いつでも戻せます。'}[tab]);
    $('shelfList').innerHTML=filtered.slice(0,limit).map(function(c){
      var st=state.cards[c.id]||{}, note=st.usedAt?'実際に使えた記録あり':st.lastPracticeDay!=null?'声に出して練習済み':st.practiced?'見た・練習したチェックあり':'これから口に入れる文';
      return '<article class="shelf-entry"><p>'+esc(c.ja)+'</p><details><summary>英文を見る</summary><p class="clen">'+esc(c.en)+'</p>'+button('shelfListen','🔊 聞く',c.id)+'</details><p class="muted">'+note+'</p><div class="speakrow">'
        +button(st.paused?'shelfResume':'practiceOne',st.paused?'練習に戻す':'この文を練習',c.id)
        +button('shelfUsed',st.usedAt?'使えた記録を取り消す':'実際の会話で使えた',c.id)
        +(!st.paused?button('shelfPause','今は休む',c.id):'')+'</div></article>';
    }).join('') || '<p class="muted">まだ該当する文はありません。教材一覧の「あとで練習」、または自分の言いたいことの保存から始められます。</p>';
    $('shelfMore').hidden=filtered.length<=limit;
  }
  document.addEventListener('click',function(e){
    var t=e.target.closest('[data-action]'); if(!t)return;
    var a=t.dataset.action,id=t.dataset.id,st=H.getState().cards[id]||{};
    if(a==='shelfOpen'){H.openShelf();limit=30;render();$('shelfTitle').focus();}
    else if(a==='shelfTab'){tab=t.dataset.tab;limit=30;render();}
    else if(a==='shelfMore'){limit+=30;render();}
    else if(a==='shelfListen'){var c=H.cards().find(function(c){return c.id===id;});if(c)H.speak(c.en);}
    else if(a==='shelfPause')H.setCardFlag(id,'paused',true);
    else if(a==='shelfResume')H.setCardFlag(id,'paused',false);
    else if(a==='shelfUsed')H.setCardFlag(id,'usedAt',st.usedAt?null:Date.now());
  });
  $('shelfTopic').addEventListener('change',function(){limit=30;render();});
  $('shelfSearch').addEventListener('input',function(){limit=30;render();});
  document.addEventListener('toggle',function(e){
    if(e.target.tagName==='DETAILS' && e.target.open && e.target.closest('.shelf-entry')) H.recordActivity();
  },true);
  var lastContent=JSON.stringify([H.getState().cards,H.getState().captures,H.getState().mine]);
  H.onChange(function(){
    var state=H.getState(), content=JSON.stringify([state.cards,state.captures,state.mine]);
    if(content!==lastContent){lastContent=content;render();}
  });
  document.addEventListener('hanaseru:state',render);
})();
