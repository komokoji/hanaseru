const {webkit}=require('playwright'),assert=require('node:assert/strict');
const BASE=process.env.HANASERU_TEST_URL||'http://127.0.0.1:8087';
(async()=>{const browser=await webkit.launch({headless:true});try{
 const c=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 await c.route('https://www.gstatic.com/**',r=>r.abort());
 const p=await c.newPage(),errors=[],networkErrors=[];let offline=false;
 p.on('pageerror',e=>{if(offline&&(/Load failed/.test(e.message)||e.message.includes('/apis.google.com/js/api.js')))networkErrors.push(e.message);else errors.push(e.message);});
 await p.goto(BASE);await p.waitForSelector('#p30Start');
 assert.equal(await p.locator('#homeMore').getAttribute('open'),null);
 assert.equal(await p.locator('#homeTiles').isVisible(),false);
 for(const width of [320,390,768]){await p.setViewportSize({width,height:844});assert(await p.locator('#p30Start').evaluate(e=>e.getBoundingClientRect().bottom<700));assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await p.setViewportSize({width:390,height:844});
 await p.click('#p30Start');await p.click('[data-pr=heard]');
 await p.waitForFunction(()=>{const a=document.getElementById('hsAudio');return !a.paused&&a.currentTime>0.1;});
 assert.match(await p.locator('#p30Title').innerText(),/名前と今の仕事/);
 await p.click('[data-pr=next]');assert.match(await p.locator('#p30Body .en').innerText(),/Koji Komori/);
 await p.click('[data-pr=model]');await p.waitForFunction(()=>!document.getElementById('hsAudio').paused);
 await p.click('[data-pr=next]');assert.equal(await p.locator('#p30Body .en').count(),0);
 await p.click('#navHome');assert(await p.locator('#setup').isVisible());assert.equal(await p.locator('#priority').isVisible(),false);
 await p.reload();await p.click('#p30Start');assert.match(await p.locator('#p30Progress').innerText(),/3 \/ 4/);
 await p.click('[data-pr=next]');await p.click('[data-pr=alt]');
 await p.waitForFunction(()=>{const a=document.getElementById('hsAudio');return !a.paused&&a.currentTime>0.1;});
 await p.click('[data-pr=pass]');assert.match(await p.locator('#p30Title').innerText(),/小児外科/);
 await p.click('[data-pr=next]');await p.click('[data-pr=again]');assert.match(await p.locator('#p30Title').innerText(),/会話を始める/);
 await p.click('[data-pr=next]');await p.click('[data-pr=next]');await p.click('[data-pr=next]');await p.click('[data-pr=pass]');
 assert.match(await p.locator('#p30Title').innerText(),/今日はここまで/);
 const record=await p.evaluate(()=>JSON.parse(localStorage.getItem('hanaseru-priority-v1')));
 assert.equal(record.items.p01.days.length,1);assert.equal(record.items.p02.outcome,'again');assert.equal(record.unlocked,10);
 await p.click('[data-pr=home]');await p.click('#p30Start');assert.match(await p.locator('#p30Title').innerText(),/今日はここまで/);
 // Returning on a later JST day offers the failed/due item and the next new ones.
 await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('hanaseru-priority-v1'));s.session.day-=1;Object.values(s.items).forEach(x=>{x.last-=1;x.due-=1;});localStorage.setItem('hanaseru-priority-v1',JSON.stringify(s));});
 await p.reload();await p.click('#p30Start');assert.match(await p.locator('#p30Title').innerText(),/名前と今の仕事/);
 await p.click('[data-pr=next]');await p.click('[data-pr=again]');assert.match(await p.locator('#p30Title').innerText(),/聞き取れなかった/);
 // Existing routes stay available; menu navigation hides the new course.
 await p.click('#navToggle');await p.click('[data-nav=personal]');assert(await p.locator('#scenes').isVisible());assert.equal(await p.locator('#priority').isVisible(),false);
 await p.click('#navHome');await p.click('#priorityHome summary');assert.equal(await p.locator('#p30Catalog li').count(),30);
 // Pre-cached course and audio remain available offline after installation.
 await p.evaluate(()=>navigator.serviceWorker.ready);await p.waitForFunction(()=>navigator.serviceWorker.controller);
 await p.evaluate(async()=>{const c=await caches.open('hanaseru-v89');const xs=await c.keys();if(!xs.some(x=>x.url.includes('priority-audio.js')))throw Error('priority offline assets missing');});
 assert.deepEqual(errors,[]);offline=true;await c.setOffline(true);await p.reload();await p.click('#p30Start');await p.click('[data-pr=heard]');
 await p.waitForFunction(()=>{const a=document.getElementById('hsAudio');return !a.paused&&a.currentTime>0.1;});
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await p.screenshot({path:'/tmp/hanaseru-top10-practice.png',fullPage:true});
 await p.click('#navHome');await p.screenshot({path:'/tmp/hanaseru-top10-home.png',fullPage:true});
 assert.deepEqual(errors,[]);
 // Storage denial is explicit, and practice still runs in memory.
 const denied=await browser.newContext({serviceWorkers:'block'});await denied.route('https://www.gstatic.com/**',r=>r.abort());
 await denied.addInitScript(()=>{Storage.prototype.setItem=function(){throw new Error('storage blocked');};});
 const d=await denied.newPage();await d.goto(BASE);await d.click('#p30Start');assert.match(await d.locator('#p30Storage').innerText(),/保存できません/);await denied.close();
 console.log('PASS priority: narrow home, resume, varied prompt audio, honest ratings, capped daily queue, old navigation, 30 list, offline playback, storage denial');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
