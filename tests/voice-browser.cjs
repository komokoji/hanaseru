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
    await context.addInitScript(()=>{
      window.SpeechRecognition=class {
        start(){window.TEST_MIC=this;window.TEST_STARTS=(window.TEST_STARTS||0)+1;}
        abort(){window.TEST_ABORTED=true;}
      };
    });
    const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(BASE);
    await page.waitForFunction(()=>window.Hanaseru && document.querySelector('#cloudStatus').textContent.includes('ログイン前'));
    await page.click('[data-action=quickTalk]');
    assert.match(await page.locator('#tkNote').innerText(),/ログイン/);
    await page.click('#talk [data-action=home]');
    await page.evaluate(()=>{
      window.TEST_LOGGED_IN=true;
      window.Hanaseru.speak=(text,callbacks)=>{window.TEST_SPOKEN=text;if(callbacks)setTimeout(()=>callbacks.end(),5);};
    });
    await page.selectOption('#lpTrack','book');
    await page.click('[data-action=quickTalk]');
    await page.waitForFunction(()=>window.TEST_CALLS?.some(c=>c.mode==='chat'));
    assert.equal(await page.evaluate(()=>window.TEST_CALLS[0].scene),'me');
    assert.equal(await page.locator('#tkLog .ai details:not([open])').count(),1);
    await page.click('#tkAuto');
    for(let i=0;i<5;i++){
      await page.waitForFunction(n=>window.TEST_STARTS===n,i+1);
      await page.evaluate(()=>{
        const r=window.TEST_MIC;
        r.onresult({results:[Object.assign([{transcript:'I work in a community clinic.'}],{isFinal:true})]});r.onend();
      });
      await page.waitForFunction(n=>window.TEST_CALLS.filter(x=>x.mode==='chat').length===n,i+2);
      await page.waitForFunction(()=>!document.querySelector('#tkSend').disabled);
    }
    assert.match(await page.locator('#tkVoiceStatus').innerText(),/5回/);
    assert.equal(await page.evaluate(()=>window.TEST_STARTS),5);
    assert.equal(await page.locator('#tkLog .me').count(),5);
    await page.click('#tkAuto');
    await page.waitForFunction(()=>window.TEST_STARTS===6);
    await page.click('#talk [data-action=home]');
    assert.equal(await page.evaluate(()=>window.TEST_ABORTED),true);
    assert.equal(await page.locator('#talk').isVisible(),false);
    assert.deepEqual(errors,[]);
    console.log('PASS: internal entry, login gate, hidden transcript, five-turn voice loop, stop on leave');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
