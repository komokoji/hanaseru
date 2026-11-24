/* Persistent navigation, independent of Firebase and login state. */
(function(){
'use strict';
const menu=document.getElementById('appMenu'),toggle=document.getElementById('navToggle');
function close(focus=false){menu.hidden=true;toggle.setAttribute('aria-expanded','false');if(focus)toggle.focus();}
toggle.addEventListener('click',()=>{const opening=menu.hidden;menu.hidden=!opening;toggle.setAttribute('aria-expanded',String(opening));if(opening)menu.querySelector('button').focus();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){close(true);}});
document.addEventListener('click',e=>{
 const nav=e.target.closest('[data-nav]');
 if(!nav){if(!e.target.closest('.app-header'))close();return;}
 const action=nav.dataset.nav;close();
 if(action==='home'){window.Hanaseru.openHome();document.getElementById('navHome').focus({preventScroll:true});return;}
 if(action==='account'){window.Hanaseru.openHome();const button=document.getElementById('cloudBtn');button.scrollIntoView({block:'center'});button.focus({preventScroll:true});return;}
 if(action==='settings'){
  window.Hanaseru.openHome();const settings=document.getElementById('pushSettings');settings.open=true;settings.scrollIntoView({block:'start'});settings.querySelector('summary').focus({preventScroll:true});return;
 }
 const selector=action==='personal'?'[data-action="sceneTrack"][data-track="personal"]':'[data-action="'+action+'"]';
 const target=document.querySelector('#setup '+selector);
 if(target){target.click();window.scrollTo(0,0);}
});
document.addEventListener('hanaseru:leave',()=>close());
}());
