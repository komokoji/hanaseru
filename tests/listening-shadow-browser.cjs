const {webkit}=require('playwright');const assert=require('node:assert/strict');
const BASE=process.env.HANASERU_TEST_URL||'http://127.0.0.1:8087';
(async()=>{const browser=await webkit.launch({headless:true});try{
 const p=await browser.newPage({viewport:{width:390,height:844},serviceWorkers:'block'});await p.route('https://www.gstatic.com/**',r=>r.abort());const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{localStorage.setItem('hanaseru-listening-route-v1',JSON.stringify({index:1,step:1,issue:'sound',planDay:Math.floor((Date.now()+9*3600000)/86400000),results:[]}));});
 await p.goto(BASE+'/?practice=listening');await p.waitForSelector('#lrPracticeText');
 assert.match(await p.locator('#lrTitle').innerText(),/隣席/);assert.equal(await p.$eval('.lr-full',e=>e.open),false);
 await p.click('[data-lr="practice-play"]');await p.waitForFunction(()=>!document.querySelector('#hsAudio').paused&&document.querySelector('#hsAudio').currentTime>0.1);assert(await p.locator('#lrPractice').evaluate(e=>e.classList.contains('is-playing')));
 await p.click('[data-lr="practice-hidden"]');assert.equal(await p.isVisible('#lrPracticeText'),false);assert(await p.$eval('#hsAudio',a=>a.paused));
 await p.click('[data-lr="practice-visible"]');assert.equal(await p.isVisible('#lrPracticeText'),true);
 await p.selectOption('#lrPracticeRate','0.8');await p.click('[data-lr="practice-play"]');assert.equal(await p.$eval('#hsAudio',a=>a.playbackRate),0.8);
 const first=await p.locator('#lrPracticeText').innerText();await p.click('[data-lr="practice-next"]');assert.notEqual(await p.locator('#lrPracticeText').innerText(),first);assert(await p.$eval('#hsAudio',a=>a.paused));
 await p.check('#lrPracticeRepeat');await p.click('[data-lr="practice-play"]');await p.waitForFunction(()=>!document.querySelector('#hsAudio').paused&&document.querySelector('#hsAudio').currentTime>0.1);
 await p.evaluate(()=>{const a=document.querySelector('#hsAudio');a.currentTime=a.duration-0.05;});await p.waitForFunction(()=>document.querySelector('#lrPracticeStatus').textContent==='もう一度…');await p.click('#hsStop');await p.waitForTimeout(1000);assert(await p.$eval('#hsAudio',a=>a.paused),'global stop must cancel repeat delay');
 await p.click('[data-lr="practice-play"]');await p.waitForFunction(()=>!document.querySelector('#hsAudio').paused);await p.click('#navHome');await p.waitForTimeout(900);assert(await p.$eval('#hsAudio',a=>a.paused),'home stops audio and repetition');
 await p.click('[data-action="listeningRoute"]');await p.click('[data-lr="next"]');assert.match(await p.locator('#lrProgress').innerText(),/3 \/ 4/);
 for(const width of [320,390,768]){await p.setViewportSize({width,height:844});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert(await p.$eval('.lr-lab',e=>{const r=e.querySelector('.lr-reading').getBoundingClientRect(),c=e.querySelector('.lr-controls').getBoundingClientRect();return r.bottom<=c.top+1&&r.height>=99&&c.bottom<=e.getBoundingClientRect().bottom+1;}),'two panes fit');}
 await p.setViewportSize({width:390,height:844});await p.locator('.lr-lab').scrollIntoViewIfNeeded();await p.screenshot({path:'/private/tmp/hanaseru-shadow-two-pane.png',fullPage:true});assert.deepEqual(errors,[]);
 console.log('PASS two-pane shadowing: actual audio, text modes, speed, selection, repeat cancellation, mobile layout');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
