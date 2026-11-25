/* Persistent navigation, independent of Firebase and login state. */
(function(){
'use strict';
const menu=document.getElementById('appMenu'),toggle=document.getElementById('navToggle');
function close(focus=false){menu.hidden=true;toggle.setAttribute('aria-expanded','false');if(focus)toggle.focus();}
toggle.addEventListener('click',()=>{const opening=menu.hidden;menu.hidden=!opening;toggle.setAttribute('aria-expanded',String(opening));if(opening)menu.querySelector('button').focus();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){close(true);}});
document.addEventListener('click',e=>{
 if(e.target.closest('[data-action="authEntry"]')&&!window.Hanaseru.login){document.getElementById('sessionNote').textContent='ログインの接続を準備できていません。通信を確認して再読み込みしてください。入力した内容は端末に残ります。';return;}
 const nav=e.target.closest('[data-nav]');
 if(!nav){if(!e.target.closest('.app-header'))close();return;}
 const action=nav.dataset.nav;close();
 if(action==='home'){window.Hanaseru.openHome();document.getElementById('navHome').focus({preventScroll:true});return;}
 if(action==='account'){window.Hanaseru.openHome();const button=document.getElementById('cloudBtn');button.scrollIntoView({block:'center'});button.focus({preventScroll:true});return;}
 if(action==='settings'){
  window.Hanaseru.openHome();const settings=document.getElementById('pushSettings');settings.open=true;settings.scrollIntoView({block:'start'});settings.querySelector('summary').focus({preventScroll:true});return;
 }
 const selector=['personal','consult','links','dubai'].indexOf(action)>=0?'[data-action="sceneTrack"][data-track="'+action+'"]':'[data-action="'+action+'"]';
 const target=document.querySelector('#setup '+selector);
 if(target){target.click();window.scrollTo(0,0);}
});
document.addEventListener('hanaseru:leave',()=>close());
}());

setTimeout(()=>{if(!window.Hanaseru.login){document.getElementById("sessionStatus").textContent="ログイン接続を確認できません";}},10000);
