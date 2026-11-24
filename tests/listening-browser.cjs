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

    const page=await context.newPage(), errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(BASE+"/?practice=listening");
    await page.waitForSelector("#listeningRoute:visible");
    await page.click("#listeningRoute [data-action=home]");
    await page.waitForFunction(()=>window.Hanaseru && window.HANASERU_LISTENING_LESSONS);
    await page.evaluate(()=>{window.Hanaseru.speak=(t,c)=>{window.TEST_AUDIO=t;if(c)setTimeout(c.end,1);};});
    await page.click('[data-action=listeningRoute]');
    assert.equal(await page.locator('#lrBody').innerText().then(t=>t.includes('We should')),false);
    await page.fill('#lrAnswer','間に合うか相談');
    await page.click('[data-lr=play]');
    await page.waitForFunction(()=>document.querySelector('#hsAudio').currentTime>0.1);
    assert.equal(await page.locator('#hsAudio').evaluate(a=>a.paused),false);
    await page.click('[data-lr=stop]');
    assert.equal(await page.locator('#hsAudio').evaluate(a=>a.paused),true);
    assert.match(await page.locator('#lrStatus').innerText(),/停止しました/);
    await page.click('[data-lr=play]');
    await page.waitForFunction(()=>document.querySelector('#hsAudio').currentTime>0.1);
    await page.click('[data-lr=next]');
    assert.equal(await page.locator('#hsAudio').evaluate(a=>a.paused),true);
    await page.click('[data-lr=next]');
    assert.match(await page.locator('#lrStatus').innerText(),/選んで/);
    await page.selectOption('#lrIssue','structure');
    await page.click('[data-lr=next]');
    assert.match(await page.locator('#lrBody').innerText(),/条件/);
    await page.reload();
    await page.waitForSelector('#listeningRoute:visible');
    assert.match(await page.locator('#lrProgress').innerText(),/3 \/ 4/);
    await page.click('[data-lr=next]');
    assert.equal(await page.locator('#lrBody').innerText().then(t=>t.includes('We should')),false);
    await page.click('[data-lr=finish]');
    assert.match(await page.locator('#lrProgress').innerText(),/一区切り/);
    await page.evaluate(()=>window.TEST_LOGGED_IN=true);
    await page.click('[data-lr=ai]');
    await page.waitForFunction(()=>window.TEST_CALLS?.length);
    assert.equal(await page.evaluate(()=>window.TEST_CALLS[0].scene),'travel');
    assert.match(await page.evaluate(()=>window.TEST_CALLS[0].messages[0].content),/as long as/);
    await page.click('#talk [data-action=home]');
    await page.click('[data-action=listeningRoute]');
    await page.click('[data-lr=new]');
    assert.match(await page.locator('#lrTitle').innerText(),/乗り継ぎ/);
    // Yesterday's explicitly marked chunk appears once before the automatically selected next scene.
    await page.evaluate(()=>{
      const key='hanaseru-listening-route-v1',s=JSON.parse(localStorage.getItem(key));
      s.planDay=window.HanaseruDailyListening.day(Date.now())-1;s.step=2;s.issue='structure';s.markedChunk=2;
      localStorage.setItem(key,JSON.stringify(s));
    });
    await page.reload();
    await page.waitForSelector('[data-lr=reviewDone]');
    assert.match(await page.locator('#lrTitle').innerText(),/昨日/);
    assert.equal(await page.locator('#lrBody').innerText().then(t=>t.includes('If it doesn’t')),false);
    await page.click('#lrBody summary');assert.match(await page.locator('#lrBody').innerText(),/If it doesn’t/);
    await page.click('[data-lr=reviewPlay]');
    await page.waitForFunction(()=>document.querySelector('#hsAudio').currentTime>0.1);
    await page.click('[data-lr=reviewDone]');
    assert.match(await page.locator('#lrTitle').innerText(),/隣席/);
    await page.reload();
    await page.waitForSelector('#listeningRoute:visible');
    assert.equal(await page.locator('[data-lr=reviewDone]').count(),0);
    assert.match(await page.locator('#lrTitle').innerText(),/隣席/);
    for(const width of [320,390,768]){
      await page.setViewportSize({width,height:844});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    }
    assert.deepEqual(errors,[]);
    console.log('PASS: listening route hidden transcript, diagnosis, persistence, completion, AI transfer, same-day stability, yesterday review, mobile fit');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
