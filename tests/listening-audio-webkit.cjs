const {webkit}=require('playwright');const assert=require('node:assert/strict');
// ホームの「こまかい設定」は折りたたみ。試験では開いておき、中の操作も確かめる。
const openMore=async p=>{await p.addInitScript(()=>document.addEventListener('DOMContentLoaded',()=>{const d=document.getElementById('homeMore');if(d)d.open=true;}));return p;};
(async()=>{const b=await webkit.launch({headless:true});try{
 const c=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'});const p=await openMore(await c.newPage());await p.route('https://**',r=>r.abort());
 await p.goto(process.env.HANASERU_TEST_URL||'http://127.0.0.1:8087/?practice=listening');await p.waitForSelector('[data-lr=play]');
 await p.evaluate(()=>{window.speechSynthesis.speak=()=>{throw Error('Device TTS must not be used');};});
 await p.click('[data-lr=play]');await p.waitForFunction(()=>document.querySelector('#hsAudio').currentTime>0.1);assert.match(await p.locator('#lrStatus').innerText(),/再生中/);
 await p.click('[data-lr=stop]');assert.equal(await p.locator('#hsAudio').evaluate(a=>a.paused),true);
 await p.click('[data-lr=play]');await p.waitForFunction(()=>document.querySelector('#hsAudio').currentTime>0.1);
 await p.click('[data-lr=next]');assert.equal(await p.locator('#hsAudio').evaluate(a=>a.paused),true);
 await p.selectOption('#lrIssue','sound');await p.click('[data-lr=next]');await p.click('[data-lr=chunk-0]');await p.waitForFunction(()=>document.querySelector('#hsAudio').currentTime>0.1);
 await p.click('#navHome');assert.equal(await p.locator('#hsAudio').evaluate(a=>a.paused),true);
 console.log('PASS WebKit mobile: real MP3 playback, stop/replay, chunk playback, stop on leave; no login or device TTS');
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
