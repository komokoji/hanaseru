/* Auth SDK boundary is mocked: tests app persistence intent and redirect recovery, not Google/iPhone account success. */
const {webkit}=require('playwright');const assert=require('node:assert/strict');
const BASE=process.env.HANASERU_TEST_URL||'http://127.0.0.1:8087';
const text=process.env.HANASERU_TRANSLATION_INPUT?require('fs').readFileSync(process.env.HANASERU_TRANSLATION_INPUT,'utf8'):'私は小児外科出身で、今は地域の子どもたちを診療しています。便秘診療の経験を論文や本にまとめ、海外でその内容を話したいと思っています。';
const auth=`const auth={get currentUser(){return localStorage.getItem('test-auth-user')?{uid:'test',email:'test@example.invalid'}:null;}};
const callbacks=[];export const getAuth=()=>auth;export class GoogleAuthProvider{};
export const onAuthStateChanged=(a,f)=>{callbacks.push(f);setTimeout(()=>f(a.currentUser),150);};
export const browserLocalPersistence={type:'LOCAL'};export const setPersistence=async(a,p)=>{if(p.type!=='LOCAL')throw Error('not durable');window.TEST_PERSIST=(window.TEST_PERSIST||0)+1;};
export const signInWithPopup=async()=>{if(window.TEST_CANCEL)throw {code:'auth/popup-closed-by-user'};window.TEST_POPUPS=(window.TEST_POPUPS||0)+1;localStorage.setItem('test-auth-user','1');callbacks.forEach(f=>f(auth.currentUser));};
export const signInWithRedirect=async()=>{if(!window.TEST_PERSIST)throw Error('missing persistence');localStorage.setItem('test-auth-user','1');location.assign('/?test-auth-return=1');return new Promise(()=>{});};
export const getRedirectResult=async()=>null;export const signOut=async()=>{localStorage.removeItem('test-auth-user');callbacks.forEach(f=>f(null));};`;
(async()=>{const b=await webkit.launch({headless:true});try{
 const c=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block',userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile Safari/604.1'});
 await c.route('https://www.gstatic.com/**',r=>{const url=r.request().url();let body='';
 if(url.endsWith('firebase-app.js'))body='export const initializeApp=()=>({});export const getApp=()=>({});';
 if(url.endsWith('firebase-auth.js'))body=auth;
 if(url.endsWith('firebase-firestore.js'))body='export const getFirestore=()=>({});export const doc=()=>({});export const getDoc=async()=>({exists:()=>false});export const setDoc=async()=>{};export const serverTimestamp=()=>0;';
 if(url.endsWith('firebase-functions.js'))body=`export const getFunctions=()=>({});export const httpsCallable=(f,name)=>async(data)=>{if(name==='hanaseruSpeech')return {data:{audioContent:null}};window.TEST_CALLS=(window.TEST_CALLS||[]).concat(data);return {data:{result:{en:'I trained as a pediatric surgeon. I now care for children in my community.',chunks:[],grammar:'',alt:'I run a community clinic for children.',alt_ja:'',polite:'I would like to share my experience.',polite_ja:''}}};};`;
 r.fulfill({contentType:'text/javascript',body});});
 const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(BASE);await p.waitForFunction(()=>window.Hanaseru.waitForAuth);
 await p.waitForFunction(()=>document.querySelector('#sessionStatus').textContent.includes('必要'));assert(await p.isVisible('#sessionLogin'));
 await p.click('#navCapture');await p.fill('#capInput',text);await p.click('[data-action="capNow"]');await p.waitForSelector('#trLogin:visible');assert.match(await p.locator('#trNote').innerText(),/保存済み/);assert((await p.inputValue('#trInput')).includes(text));
 assert.equal(await p.evaluate(()=>window.TEST_CALLS?.length||0),0);
 await p.click('#trLogin');await p.waitForURL('**/?test-auth-return=1');await p.waitForSelector('#trOut .clen');assert.equal(await p.evaluate(()=>window.TEST_CALLS.length),1,'only one translation after redirect');assert((await p.evaluate(()=>window.TEST_CALLS[0].text)).includes(text));assert.match(await p.locator('#sessionStatus').innerText(),/ログイン済み/);
 assert((await p.inputValue('#trInput')).includes(text));assert.equal(await p.locator('#trLogin').isVisible(),false);
 await p.reload();await p.waitForFunction(()=>document.querySelector('#sessionStatus').textContent.includes('ログイン済み'));assert.equal(await p.evaluate(()=>window.TEST_CALLS?.length||0),0,'no repeat request on reload');assert((await p.inputValue('#trInput')).includes(text));
 await p.click('#sessionLogin');assert.equal(await p.evaluate(()=>document.activeElement.id),'cloudBtn');assert.equal(await p.evaluate(()=>location.search),'?test-auth-return=1','account button must not sign out');
 await p.click('#navCapture');await p.fill('#capInput','次に家族旅行について話したいです。');await p.click('[data-action="capNow"]');await p.waitForSelector('#trOut .clen');assert.equal(await p.evaluate(()=>window.TEST_CALLS.length),1,'logged-in capture translates directly');
 // Logout is explicit; pending drafts remain available.
 await p.click('#sessionLogin');p.once('dialog',d=>d.accept());await p.click('#cloudBtn');await p.waitForFunction(()=>document.querySelector('#sessionStatus').textContent.includes('必要'));
 // A user-cancelled popup must not fall through to a redirect.
 await p.evaluate(()=>{Object.defineProperty(navigator,'userAgent',{configurable:true,value:'Desktop browser'});window.TEST_CANCEL=true;});
 const beforeURL=p.url();await p.click('#sessionLogin');await p.waitForFunction(()=>document.querySelector('#sessionNote').textContent.includes('popup-closed-by-user'));assert.equal(p.url(),beforeURL);assert.equal(await p.evaluate(()=>localStorage.getItem('test-auth-user')),null);
 for(const w of [320,390,768]){await p.setViewportSize({width:w,height:844});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 assert.deepEqual(errors,[]);console.log('PASS login: visible entry, LOCAL intent, redirect preserves long capture, single automatic resume, reload restore, no auto retransmission, explicit logout, mobile fit');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1);});
