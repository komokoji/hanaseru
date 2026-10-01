/* Run against local http.server: NODE_PATH=<bundled node_modules> node tests/browser-smoke.cjs */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const BASE = process.env.HANASERU_TEST_URL || 'http://127.0.0.1:8087';
(async () => {
  const browser = await chromium.launch({headless:true, channel:'chrome', args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});
  try {
    const context = await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
    // Mock Firebase at the module boundary. Never access production or invoke paid AI in this test.
    await context.route('https://www.gstatic.com/**', route => {
      const url=route.request().url();
      let body='';
      if(url.endsWith('firebase-app.js')) body='export const initializeApp=()=>({}); export const getApp=()=>({});';
      if(url.endsWith('firebase-auth.js')) body=`export const getAuth=()=>({currentUser:window.TEST_LOGGED_IN ? {uid:'test'}:null}); export class GoogleAuthProvider{}; export const onAuthStateChanged=(a,f)=>f(null); export const signInWithPopup=async()=>{}; export const signInWithRedirect=async()=>{}; export const getRedirectResult=async()=>null; export const signOut=async()=>{}; export const setPersistence=async()=>{}; export const browserLocalPersistence={};`;
      if(url.endsWith('firebase-firestore.js')) body='export const getFirestore=()=>({}); export const doc=()=>({}); export const getDoc=async()=>({exists:()=>false}); export const setDoc=async()=>{}; export const serverTimestamp=()=>0;';
      if(url.endsWith('firebase-functions.js')) body=`export const getFunctions=()=>({}); export const httpsCallable=()=>async(data)=>{ window.TEST_CALLS=(window.TEST_CALLS||[]).concat(data); return {data:{result: data.mode==='explain' ? {chunks:[{en:data.en,ja:data.ja,note:'会話を切り出す表現'}],grammar:'短い表現で話を始める。',swap:{en:'Well, ...',ja:'少し考えながら話を始めるとき'}} : data.mode==='translate' ? {en:'Could we move to a quieter room?',chunks:[],grammar:'依頼の形',alt:'Could we have a quiet room?',alt_ja:'',polite:'Could we have a quieter room, please?',polite_ja:''} : {reply:'Why is that important to you?',better:'',better_ja:'',tip:'',ended:false}}}; };`;
      route.fulfill({status:200,contentType:'text/javascript',body});
    });
    const page=await context.newPage(); const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(BASE);
    await page.waitForFunction(()=>window.Hanaseru && document.querySelector('#practiceSummary').textContent);
    assert.match(await page.locator('#activityStatus').innerText(),/ひとつ取り組めばOK/);
    // Modules are loaded before using coach events.
    await page.waitForFunction(()=>document.querySelector('#cloudStatus').textContent.includes('ログイン前'));
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth),true);
    await page.screenshot({path:'/tmp/hanaseru-home.png',fullPage:true});
    await page.selectOption('#practiceFocus','travel');
    await page.click('#practiceStart');
    assert.equal(await page.locator('#prBody .en').count(),0);
    await page.click('[data-action=prNext]');
    await page.waitForSelector('#prBody .en');
    assert.match(await page.locator('#activityStatus').innerText(),/今日も取り組めました/);
    assert.equal(await page.evaluate(()=>window.Hanaseru.getState().streak),1);
    assert.deepEqual(await page.evaluate(()=>window.Hanaseru.getState().cards),{});
    await page.screenshot({path:'/tmp/hanaseru-practice.png',fullPage:true});
    await page.click('[data-action=prNext]');
    assert.equal(await page.locator('#prBody .en').count(),0);
    await page.reload(); await page.click('#practiceStart');
    assert.equal(await page.inputValue('#practiceFocus'),'travel');
    assert.match(await page.locator('#prTitle').innerText(),/見ずに/);
    await page.click('[data-action=prPeek]');
    assert.equal(await page.locator('[data-action=prRecall]').count(),0);
    await page.click('[data-action=prPeek]');
    await page.click('[data-action=prRecall]');
    await page.click('[data-action=prTransfer]');
    for(let i=0;i<2;i++) {
      await page.click('[data-action=prNext]'); await page.click('[data-action=prNext]'); await page.click('[data-action=prAgain]');
    }
    assert.match(await page.locator('#prTitle').innerText(),/完了/);
    assert.equal(await page.evaluate(()=>window.Hanaseru.getState().streak),1);
    await page.click('[data-action=home]:visible');
    await page.click('.quick-start [data-action=capOpen]');
    await page.selectOption('#capScene',{label:'旅行'});
    await page.fill('#capInput','静かな部屋に変えてほしい');
    await page.click('[data-action=capSave]');
    await page.click('[data-action=capCoach]');
    assert.match(await page.inputValue('#trInput'),/旅行.*静かな部屋/);
    await page.click('[data-action=trGo]');
    assert.match(await page.locator('#trNote').innerText(),/ログイン/);
    await page.evaluate(()=>window.TEST_LOGGED_IN=true);
    await page.click('[data-action=trGo]');
    await page.waitForSelector('[data-action=trPractice]');
    await page.click('[data-action=trPractice]');
    await page.waitForSelector('#practice:not([hidden])');
    const state=await page.evaluate(()=>window.Hanaseru.getState());
    assert.equal(state.mine.length,1); assert.equal(state.captures[0].phraseId,state.mine[0].id);
    await page.reload(); await page.click('#practiceStart');
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('hanaseru.practice.v1')).ids.length),1);
    await page.evaluate(()=>window.TEST_LOGGED_IN=true);
    // Fake device exercises capture lifecycle; this is not a real-microphone quality test.
    await page.click('[data-action=prRecord]');
    await page.waitForFunction(()=>document.querySelector('#prRecord').textContent.includes('止める'));
    await page.waitForTimeout(200);
    await page.click('[data-action=prRecord]');
    await page.waitForSelector('#prAudio:not([hidden])');
    await page.click('[data-action=prNext]');
    assert.equal(await page.locator('#prAudio').getAttribute('src'),null);
    await page.click('[data-action=prNext]'); await page.click('[data-action=prRecall]'); await page.click('[data-action=prTransfer]');
    await page.click('[data-action=prTalk]');
    await page.waitForSelector('#tkLog .bubble.ai');
    assert.match((await page.evaluate(()=>window.TEST_CALLS)).at(-1).messages[0].content,/quieter room/);
    // A rejected microphone permission must not block speaking practice.
    await page.evaluate(()=>{
      window.TEST_MEDIA=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException('Denied','NotAllowedError');};
      document.dispatchEvent(new CustomEvent('hanaseru:practice',{detail:{id:window.Hanaseru.getState().mine[0].id}}));
    });
    await page.click('[data-action=prRecord]');
    await page.waitForFunction(()=>document.querySelector('#prRecordNote').textContent.includes('マイクを使えません'));
    await page.click('[data-action=prNext]');
    // A permission response arriving after leaving must release every acquired track.
    await page.evaluate(()=>{
      navigator.mediaDevices.getUserMedia=()=>new Promise(resolve=>window.TEST_RESOLVE_MEDIA=resolve);
    });
    await page.click('[data-action=prRecord]');
    await page.click('#practice [data-action=home]');
    await page.evaluate(()=>window.TEST_RESOLVE_MEDIA({getTracks:()=>[{stop:()=>{window.TEST_TRACK_STOPPED=true;}}]}));
    await page.waitForFunction(()=>window.TEST_TRACK_STOPPED);
    for(const width of [320,768]) {
      await page.setViewportSize({width,height:844});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth),true);
    }
    await page.setViewportSize({width:390,height:844});
    await page.click('[data-action=practiceBrief]');
    await page.click('#prBody summary');
    await page.click('[data-action=prBeforeStuck]');
    await page.click('[data-action=prNext]'); await page.click('[data-action=prNext]');
    assert.match(await page.locator('[data-action=prRecall]').innerText(),/今日はここまで/);
    await page.click('[data-action=prRecall]');
    assert.match(await page.locator('#prTitle').innerText(),/完了/);
    assert.match(await page.locator('#prBody').innerText(),/練習前：言葉が出なかった/);
    assert.match(await page.locator('#prBody').innerText(),/練習後：見ずに言えた/);
    assert.match(await page.locator('#activityStatus').innerText(),/1日/);
    await page.click('[data-action=home]:visible');
    await page.click('[data-action=shelfOpen]');
    await page.click('[data-action=shelfTab][data-tab=learning]');
    await page.fill('#shelfSearch','静かな部屋');
    const ownId=await page.evaluate(()=>window.Hanaseru.getState().mine[0].id);
    const boxBefore=await page.evaluate(id=>window.Hanaseru.getState().cards[id].box,ownId);
    await page.click('[data-action=shelfUsed][data-id="'+ownId+'"]');
    assert.equal(await page.evaluate(id=>window.Hanaseru.getState().cards[id].box,ownId),boxBefore);
    await page.click('[data-action=shelfTab][data-tab=used]');
    await page.waitForSelector('[data-action=shelfPause][data-id="'+ownId+'"]');
    await page.screenshot({path:'/tmp/hanaseru-shelf.png',fullPage:true});
    await page.click('[data-action=shelfPause][data-id="'+ownId+'"]');
    await page.click('[data-action=shelfTab][data-tab=paused]');
    await page.click('[data-action=shelfResume][data-id="'+ownId+'"]');
    await page.click('[data-action=shelfTab][data-tab=used]');
    await page.click('[data-action=shelfUsed][data-id="'+ownId+'"]');
    await page.click('[data-action=shelfTab][data-tab=learning]');
    assert.equal(await page.locator('#shelf [data-action=practiceOne][data-id="'+ownId+'"]').count(),1);
    await page.click('#shelf [data-action=home]');
    await page.screenshot({path:'/tmp/hanaseru-home.png',fullPage:true});
    await page.evaluate(()=>{
      const H=window.Hanaseru,s=structuredClone(H.getState()),day=H.today();
      s.practiceDays=[day-7];s.lastDone=day-7;localStorage.removeItem('hanaseru.practice.v1');H.applyRemote(s);
    });
    assert.match(await page.locator('#practiceStart').innerText(),/1文から再開/);
    await page.click('#practiceStart');
    assert.match(await page.locator('#prCounter').innerText(),/1 \/ 1文/);
    await page.click('[data-action=prNext]'); await page.click('[data-action=prNext]'); await page.click('[data-action=prRecall]');
    assert.match(await page.locator('#activityStatus').innerText(),/1日/);
    console.log('PASS: one-phrase day, weekly effort, shelf search/status/real-use undo/pause/resume; real use does not inflate recall grade');
    await page.click('#practice [data-action=home]');
    await page.evaluate(()=>document.querySelector('[data-action=start][data-domain=travel]').click());
    const firstRow=page.locator('#clList .clrow').first();
    await firstRow.locator('[data-action=clShow]').click();
    const explanation=firstRow.locator('.cl-explanation');
    const explanationButton=firstRow.locator('[data-action=explain]');
    await explanationButton.click();
    await page.waitForFunction(()=>document.querySelector('#clList .cl-explanation').textContent.includes('別の言い方'));
    assert.match(await explanation.innerText(),/Well/);
    assert.equal(await explanationButton.getAttribute('aria-expanded'),'true');
    assert.equal(await firstRow.locator('.clen').isVisible(),true);
    await explanation.locator('[data-say]').click();
    assert.equal(await explanation.isVisible(),true);
    const calls=await page.evaluate(()=>window.TEST_CALLS.filter(c=>c.mode==='explain').length);
    await explanationButton.click();assert.equal(await explanation.isVisible(),false);
    await explanationButton.click();assert.equal(await explanation.isVisible(),true);
    assert.equal(await page.evaluate(()=>window.TEST_CALLS.filter(c=>c.mode==='explain').length),calls);
    for(const width of [320,390]) {
      await page.setViewportSize({width,height:844});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    }
    await page.screenshot({path:'/tmp/hanaseru-explanation.png',fullPage:false});
    console.log('PASS: checklist explanation, alternative audio, collapse/reopen cache and mobile fit');
    assert.deepEqual(errors,[]);
    console.log('PASS: mobile layout (320/390/768), hidden-answer recall, focus/single-card resume, grading, capture → translation → saved practice, mock audio cleanup, mic denial/pending permission cleanup, focused AI conversation');
    await context.close();
    const offlineContext = await browser.newContext({viewport:{width:390,height:844}});
    await offlineContext.route('https://**', r => r.request().url().startsWith(BASE) ? r.continue() : r.abort());
    const offlinePage = await offlineContext.newPage();
    await offlinePage.goto(BASE);
    await offlinePage.evaluate(()=>navigator.serviceWorker.ready);
    await offlinePage.waitForFunction(()=>!!navigator.serviceWorker.controller);
    await offlineContext.setOffline(true);
    await offlinePage.reload();
    await offlinePage.click('#practiceStart');
    await offlinePage.click('[data-action=prNext]');
    assert.ok(await offlinePage.locator('#prBody .en').innerText());
    console.log('PASS: installed service worker serves new practice assets offline');
    await offlineContext.close();
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
