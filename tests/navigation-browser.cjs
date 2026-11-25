/* Run against local http.server: NODE_PATH=<bundled node_modules> node tests/browser-smoke.cjs */
const { chromium } = require('playwright');
// ホームの「こまかい設定」は折りたたみ。試験では開いておき、中の操作も確かめる。
const openMore=async p=>{await p.addInitScript(()=>document.addEventListener('DOMContentLoaded',()=>{const d=document.getElementById('homeMore');if(d)d.open=true;}));return p;};
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

    const page=await openMore(await context.newPage()),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(BASE+'/?practice=talk');
    await page.waitForSelector('#talk:visible');
    for(const width of [320,390,768]){
      await page.setViewportSize({width,height:844});
      await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
      const box=await page.locator('#navHome').boundingBox();assert(box.y>=0&&box.y+box.height<150);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    }
    await page.click('#navHome');assert(await page.locator('#setup').isVisible());
    assert.equal(await page.evaluate(()=>scrollY),0);
    await page.click('#navToggle');assert.equal(await page.locator('#navToggle').getAttribute('aria-expanded'),'true');
    await page.keyboard.press('Escape');assert.equal(await page.locator('#appMenu').isVisible(),false);
    for(const [action,panel] of [['listeningRoute','listeningRoute'],['personal','scenes'],['shelfOpen','shelf'],['talk','talk']]){
      await page.click('#navToggle');await page.click('#appMenu [data-nav="'+action+'"]');
      assert(await page.locator('#'+panel).isVisible());assert.equal(await page.locator('#appMenu').isVisible(),false);
      await page.click('#navHome');assert(await page.locator('#setup').isVisible());
    }
    await page.click('#navToggle');await page.click('[data-nav=account]');assert.equal(await page.evaluate(()=>document.activeElement.id),'cloudBtn');
    await page.click('#navHome');
    await page.click('#navToggle');await page.click('[data-nav=settings]');assert(await page.locator('#pushSettings').getAttribute('open')!==null);
    assert.deepEqual(errors,[]);
    console.log('PASS: sticky home across widths, menu navigation, escape, account and notification entries');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
