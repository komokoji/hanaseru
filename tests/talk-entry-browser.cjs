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
      if(url.endsWith('firebase-auth.js')) body=`export const getAuth=()=>({currentUser:window.TEST_LOGGED_IN ? {uid:'test'}:null}); export class GoogleAuthProvider{}; export const onAuthStateChanged=(a,f)=>{(window.TEST_AUTH_CALLBACKS||=[]).push(f);f(a.currentUser);}; export const signInWithPopup=async()=>{window.TEST_LOGGED_IN=true;for(const f of window.TEST_AUTH_CALLBACKS||[])f({uid:"test"});}; export const signInWithRedirect=async()=>{}; export const getRedirectResult=async()=>null; export const signOut=async()=>{}; export const setPersistence=async()=>{}; export const browserLocalPersistence={};`;
      if(url.endsWith('firebase-firestore.js')) body='export const getFirestore=()=>({}); export const doc=()=>({}); export const getDoc=async()=>({exists:()=>false}); export const setDoc=async()=>{}; export const serverTimestamp=()=>0;';
      if(url.endsWith('firebase-functions.js')) body=`export const getFunctions=()=>({}); export const httpsCallable=()=>async(data)=>{ window.TEST_CALLS=(window.TEST_CALLS||[]).concat(data); return {data:{result: data.mode==='explain' ? {chunks:[{en:data.en,ja:data.ja,note:'会話を切り出す表現'}],grammar:'短い表現で話を始める。',swap:{en:'Well, ...',ja:'少し考えながら話を始めるとき'}} : data.mode==='translate' ? {en:'Could we move to a quieter room?',chunks:[],grammar:'依頼の形',alt:'Could we have a quiet room?',alt_ja:'',polite:'Could we have a quieter room, please?',polite_ja:''} : {reply:'Why is that important to you?',better:'',better_ja:'',tip:'',ended:false}}}; };`;
      route.fulfill({status:200,contentType:'text/javascript',body});
    });
    const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(BASE+'/?practice=talk');
    await page.waitForSelector('#tkLogin:visible');
    assert.match(await page.locator('#tkNote').innerText(),/ログイン/);
    assert.equal(await page.evaluate(()=>window.TEST_CALLS?.length||0),0);
    assert(await page.locator('#tkLog').evaluate(e=>e.getBoundingClientRect().height<10));
    // ログイン直後はタップの外なので、再生が断られた想定（共通プレーヤーが ▶ を出す）
    await page.evaluate(()=>window.Hanaseru.speak=(t,c)=>{if(c&&c.blocked)setTimeout(c.blocked,5);});
    await page.click('#tkLogin');
    await page.waitForSelector('#tkLog .ai');
    assert.equal(await page.locator('#tkGate').isVisible(),false);
    await page.waitForFunction(()=>document.querySelector('#tkVoiceStatus').textContent.includes('▶ を押すと相手の声'));
    assert.match(await page.locator('#tkLog .speak').innerText(),/相手の声を聞く/);
    await page.evaluate(()=>window.Hanaseru.speak=text=>window.TEST_MANUAL_AUDIO=text);
    await page.click('#tkLog .speak');
    assert.equal(await page.evaluate(()=>window.TEST_MANUAL_AUDIO),'Why is that important to you?');
    await context.route('https://komokoji.github.io/hanaseru/**',async route=>{
      const u=new URL(route.request().url());const local=BASE+'/'+u.pathname.replace(/^\/hanaseru\//,'')+u.search;
      const res=await context.request.get(local);await route.fulfill({response:res});
    });
    await page.goto('https://komokoji.github.io/hanaseru/?practice=talk');
    await page.waitForSelector('#tkCanonical:visible');
    assert(await page.locator('#legacySite').isVisible());
    assert.equal(await page.locator('#tkLogin').isVisible(),false);
    assert.equal(await page.locator('#tkCanonical').getAttribute('href'),'https://hanaseru.web.app/?practice=talk');
    assert.equal(await page.evaluate(()=>window.TEST_CALLS?.length||0),0);
    assert.deepEqual(errors,[]);
    console.log('PASS: inline login, resume conversation, empty log collapsed, silent-audio fallback, manual playback, old-site canonical entry');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
