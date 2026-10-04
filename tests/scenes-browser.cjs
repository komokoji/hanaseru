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

    await page.click('[data-action=sceneTrack][data-track=clinic]');
    await page.click('[data-action=scChoose][data-id=clinic-bowel]');
    assert.equal(await page.locator('.sc-model').count(),0);
    assert.equal(await page.evaluate(()=>Object.keys(window.Hanaseru.getState().scenes||{}).length),0);
    await page.click('[data-action=scModel]');
    assert.equal(await page.locator('[data-action=scGrade]').count(),0,'cannot grade while reading');
    assert.match(await page.locator('.sc-model').innerText(),/How often/);
    await page.click('[data-action=scSave]');
    assert.equal(await page.evaluate(()=>window.Hanaseru.getState().mine.length),1);
    await page.click('[data-action=scModel]');
    assert.equal(await page.locator('.sc-model').count(),0);
    await page.click('[data-action=scGrade][data-result=said]');
    let p=await page.evaluate(()=>window.Hanaseru.getState().scenes['clinic-bowel']);
    assert.equal(p.index,1);assert.deepEqual(p.results,['supported']);
    await page.reload();
    await page.click('[data-action=sceneTrack][data-track=clinic]');
    assert.match(await page.locator('#scBody').innerText(),/続きから：2往復目/);
    await page.click('[data-action=scChoose][data-id=clinic-bowel]');
    assert.match(await page.locator('#scBody').innerText(),/stop the medicine/);
    for(let i=1;i<5;i++) await page.click('[data-action=scGrade][data-result=said]');
    assert.match(await page.locator('#scBody').innerText(),/4 \/ 5往復/);
    p=await page.evaluate(()=>window.Hanaseru.getState().scenes['clinic-bowel']);
    assert.equal(p.due,await page.evaluate(()=>window.Hanaseru.today()+1));
    assert.deepEqual(await page.evaluate(()=>window.Hanaseru.getState().cards),{});
    assert.equal(await page.evaluate(()=>window.Hanaseru.getState().streak),1);
    await page.click('[data-action=scRestart]');
    assert.equal(await page.locator('#scBody .en').isVisible(),false,'test mode hides partner transcript');
    assert.equal(await page.locator('.sc-model').count(),0);
    await page.click('[data-action=scGrade][data-result=again]');
    p=await page.evaluate(()=>window.Hanaseru.getState().scenes['clinic-bowel']);
    assert.deepEqual(p.results,['again']);
    // Remote progress advances this scene without exposing its model answer.
    await page.evaluate(()=>{
      const H=window.Hanaseru,s=JSON.parse(JSON.stringify(H.getState()));
      s.scenes['clinic-bowel'].index=2;H.applyRemote(s);
    });
    assert.match(await page.locator('#scBody').innerText(),/3 \/ 4往復/);
    await page.click('[data-action=home]:visible');
    await page.click('[data-action=sceneTrack][data-track=travel]');
    await page.click('[data-action=scChoose][data-id=de-hotel]');
    await page.setViewportSize({width:320,height:720});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.click('[data-action=scModel]');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.screenshot({path:'/tmp/hanaseru-v53-scene.png',fullPage:true});
    await page.click('[data-action=scModel]');
    for(let i=0;i<5;i++) await page.click('[data-action=scGrade][data-result=said]');
    await page.waitForFunction(()=>document.querySelector('#cloudStatus').textContent.includes('ログイン前'));
    await page.evaluate(()=>window.TEST_LOGGED_IN=true);
    await page.click('[data-action=scAI]');
    await page.waitForFunction(()=>window.TEST_CALLS?.some(c=>c.mode==='chat'));
    const call=await page.evaluate(()=>window.TEST_CALLS.find(c=>c.mode==='chat'));
    assert.equal(call.scene,'travel');assert.match(call.messages[0].content,/チェックイン/);
    assert.equal(await page.locator('#scenes').isVisible(),false);
    assert.deepEqual(errors,[]);
    const offline=await browser.newContext({viewport:{width:390,height:844}});
    await offline.route('https://**',r=>r.request().url().startsWith(BASE)?r.continue():r.abort());
    const q=await offline.newPage();await q.goto(BASE);
    await q.evaluate(()=>navigator.serviceWorker.ready);
    await q.waitForFunction(()=>!!navigator.serviceWorker.controller);
    await offline.setOffline(true);await q.reload();
    await q.click('[data-action=sceneTrack][data-track=travel]');
    await q.click('[data-action=scChoose][data-id=de-train]');
    await q.click('[data-action=scModel]');
    assert.match(await q.locator('.sc-model').innerText(),/which train/);
    await offline.close();
    console.log('PASS: dialogue recall, honest self-rating, resume, remote state, daily credit, saving, mobile layout, AI handoff, offline');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
