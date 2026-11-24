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
      if(url.endsWith('firebase-auth.js')) body=`export const getAuth=()=>({currentUser:window.TEST_LOGGED_IN ? {uid:'test',email:'komorikoji@lifecrescendo.com'}:null}); export class GoogleAuthProvider{}; export const onAuthStateChanged=(a,f)=>f(a.currentUser); export const signInWithPopup=async()=>{}; export const signInWithRedirect=async()=>{}; export const getRedirectResult=async()=>null; export const signOut=async()=>{}; export const setPersistence=async()=>{}; export const browserLocalPersistence={};`;
      if(url.endsWith('firebase-firestore.js')) body='export const getFirestore=()=>({}); export const doc=()=>({}); export const getDoc=async()=>({exists:()=>false}); export const setDoc=async()=>{}; export const serverTimestamp=()=>0;';
      if(url.endsWith('firebase-functions.js')) body=`export const getFunctions=()=>({}); export const httpsCallable=()=>async(data)=>{window.TEST_CALLS=(window.TEST_CALLS||[]).concat(data);if(window.TEST_FAIL)throw new Error('通信できません');if(data.action==='enable')window.TEST_ENABLED=true;if(data.action==='disable')window.TEST_ENABLED=false;return {data:{enabled:!!window.TEST_ENABLED,accepted:true}};};`;

      route.fulfill({status:200,contentType:'text/javascript',body});
    });
    await context.addInitScript(()=>{
      window.TEST_LOGGED_IN=true;
      window.PushManager=class {};
      window.Notification={permission:'default',requestPermission:async()=>{window.TEST_PERMISSION_CALLS=(window.TEST_PERMISSION_CALLS||0)+1;return window.Notification.permission='granted';}};
      const sub={endpoint:'https://web.push.apple.com/browser-test',toJSON(){return {endpoint:this.endpoint,keys:{p256dh:'mock',auth:'mock'}};},unsubscribe:async()=>{window.TEST_SUB=null;return true;}};
      Object.defineProperty(navigator.serviceWorker,'ready',{value:Promise.resolve({pushManager:{getSubscription:async()=>window.TEST_SUB||null,subscribe:async()=>window.TEST_SUB=sub}})});
    });
    const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(BASE);await page.click('#pushSettings summary');
    await page.waitForFunction(()=>document.querySelector('#pushStatus').textContent.includes('未登録'));
    assert.equal(await page.evaluate(()=>window.TEST_PERMISSION_CALLS||0),0);
    await page.click('#pushEnable');await page.waitForFunction(()=>window.TEST_ENABLED);
    assert.match(await page.locator('#pushStatus').innerText(),/登録しました/);
    assert.equal(await page.evaluate(()=>window.TEST_PERMISSION_CALLS),1);
    await page.click('#pushTest');await page.waitForFunction(()=>window.TEST_CALLS.some(x=>x.action==='test'));
    assert.match(await page.locator('#pushStatus').innerText(),/受け付け/);
    await page.evaluate(()=>window.TEST_FAIL=true);await page.click('#pushDisable');
    await page.waitForFunction(()=>document.querySelector('#pushStatus').textContent.includes('停止を確認できません'));
    assert.equal(await page.evaluate(()=>window.TEST_ENABLED),true);
    await page.evaluate(()=>window.TEST_FAIL=false);await page.click('#pushDisable');
    await page.waitForFunction(()=>!window.TEST_ENABLED);assert.equal(await page.evaluate(()=>window.TEST_SUB),null);
    assert.match(await page.locator('#pushStatus').innerText(),/停止しました/);
    await page.setViewportSize({width:320,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    const iosPage=await context.newPage();
    await iosPage.addInitScript(()=>Object.defineProperty(navigator,'userAgent',{get:()=> 'iPhone'}));
    await iosPage.goto(BASE);await iosPage.click('#pushSettings summary');
    await iosPage.waitForFunction(()=>document.querySelector('#pushStatus').textContent.includes('ホーム画面に追加'));
    assert(await iosPage.locator('#pushEnable').isDisabled());
    assert.equal(await iosPage.evaluate(()=>window.TEST_PERMISSION_CALLS||0),0);
    await iosPage.close();
    assert.deepEqual(errors,[]);
    console.log('PASS: opt-in gesture, registration, test send, failed stop preserves registration, successful stop, mobile layout');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
