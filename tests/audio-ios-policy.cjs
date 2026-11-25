/* iPhone の再生の決まりをまねた試験（実iPhoneではない）。
   まねる決まり：①<audio>.play() はタップの中か、一度タップで鳴らした同じ要素でしか通らない
               ②端末の読み上げは、タップの外で呼ぶと何も起きない
   Run: NODE_PATH=<playwright> node tests/audio-ios-policy.cjs （http.server 8087） */
const {webkit}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');
const BASE=process.env.HANASERU_TEST_URL||'http://127.0.0.1:8087';
const MP3=fs.readFileSync(__dirname+'/fixtures/speech-check.mp3').toString('base64');
const policy=`(()=>{
  let gesture=false;
  ['touchend','click','keydown'].forEach(t=>window.addEventListener(t,()=>{gesture=true;setTimeout(()=>{gesture=false;},0);},true));
  const play=HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play=function(){
    if(gesture||this.__unlocked){this.__unlocked=true;return play.call(this);}
    window.TEST_REJECTED=(window.TEST_REJECTED||0)+1;return Promise.reject(new DOMException('not allowed','NotAllowedError'));
  };
  window.TEST_TTS=[];window.TEST_TTS_DROPPED=0;
  const S={speaking:false,pending:false,getVoices:()=>[],cancel(){this.speaking=false;},resume(){},pause(){},
    speak(u){if(!gesture){window.TEST_TTS_DROPPED++;return;}window.TEST_TTS.push(u.text);this.speaking=true;
      setTimeout(()=>u.onstart&&u.onstart({}),5);setTimeout(()=>{this.speaking=false;u.onend&&u.onend({});},60);}};
  Object.defineProperty(window,'speechSynthesis',{value:S,configurable:true});
  window.TEST_MP3=${JSON.stringify(MP3)};
  class Rec{start(){window.TEST_REC=(window.TEST_REC||0)+1;window.TEST_REC_LANG=this.lang;setTimeout(()=>this.onstart&&this.onstart(),5);if(window.TEST_HEARD)setTimeout(()=>{this.onresult&&this.onresult({results:[[{transcript:window.TEST_HEARD}]]});this.onend&&this.onend();},30);}abort(){}stop(){}}
  window.SpeechRecognition=Rec;
})();`;
const firebase=route=>{
  const url=route.request().url();let body='';
  if(url.endsWith('firebase-app.js'))body='export const initializeApp=()=>({}); export const getApp=()=>({});';
  if(url.endsWith('firebase-auth.js'))body=`export const getAuth=()=>({currentUser:window.TEST_LOGGED_IN?{uid:'test'}:null}); export class GoogleAuthProvider{}; export const onAuthStateChanged=(a,f)=>{f(a.currentUser);}; export const signInWithPopup=async()=>{}; export const signInWithRedirect=async()=>{}; export const getRedirectResult=async()=>null; export const signOut=async()=>{}; export const setPersistence=async()=>{}; export const browserLocalPersistence={};`;
  if(url.endsWith('firebase-firestore.js'))body='export const getFirestore=()=>({}); export const doc=()=>({}); export const getDoc=async()=>({exists:()=>false}); export const setDoc=async()=>{}; export const serverTimestamp=()=>0;';
  if(url.endsWith('firebase-functions.js'))body=`const wait=ms=>new Promise(r=>setTimeout(r,ms)); export const getFunctions=()=>({}); export const httpsCallable=(f,name)=>async(data)=>{await wait(300); if(name==='hanaseruSpeech'){window.TEST_SPEECH_CALLS=(window.TEST_SPEECH_CALLS||0)+1; if(window.TEST_SPEECH_FAIL)throw new Error('unavailable'); return {data:{audioContent:window.TEST_MP3}};} (window.TEST_CHAT=window.TEST_CHAT||[]).push({mode:data.mode,split:data.split}); if(data.mode==='feedback'){await wait(400);return {data:{result:{better:'It helps children feel better.',better_ja:'子どもが楽になるからです',tip:'理由を一文で',phrases:[{en:'feel better',ja:'楽になる'}]}}};} return {data:{result:{reply:'Why is that important to you? '+(window.TEST_N=(window.TEST_N||0)+1),ended:false},audioContent:window.TEST_SPEECH_FAIL?null:window.TEST_MP3}};};`;
  route.fulfill({status:200,contentType:'text/javascript',body});
};
const playing=p=>p.waitForFunction(()=>{const a=document.querySelector('#hsAudio');return a&&!a.paused&&a.currentTime>0.05;},null,{timeout:8000});
const paused=p=>p.locator('#hsAudio').evaluate(a=>a.paused);
(async()=>{const b=await webkit.launch({headless:true});try{
  const open=async(path,logged)=>{
    const c=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'});
    await c.addInitScript(policy);if(logged)await c.addInitScript('window.TEST_LOGGED_IN=true;');
    await c.route('https://www.gstatic.com/**',firebase);
    const p=await c.newPage();p.on('pageerror',e=>{throw e;});await p.goto(BASE+path);return p;
  };

  // 1) 未ログイン：今日の3分＝公開済みMP3。再生・停止・ホームで停止。端末の読み上げは使わない。
  let p=await open('/?practice=listening',false);
  await p.waitForSelector('[data-lr=play]');await p.click('[data-lr=play]');await playing(p);
  assert.match(await p.locator('#hsStatus').innerText(),/再生中/);
  await p.click('#hsStop');assert.equal(await paused(p),true);
  await p.click('[data-lr=play]');await playing(p);await p.click('#navHome');assert.equal(await paused(p),true);
  assert.equal(await p.locator('#hsPlayer').isHidden(),true);
  assert.equal(await p.evaluate(()=>window.TEST_TTS.length+window.TEST_TTS_DROPPED),0);
  console.log('PASS 1 未ログイン・今日の3分：再生／停止／ホームで停止（MP3・読み上げ不使用）');

  // 2) 未ログイン：公開MP3が無い文は、タップの中で端末の読み上げを始める（待たない）。
  await p.evaluate(()=>window.Hanaseru.speak('This sentence has no prepared audio.'));   // タップの外＝断られる
  await p.waitForFunction(()=>document.querySelector('#hsPlayer').dataset.state==='blocked',null,{timeout:8000});
  assert.equal(await p.evaluate(()=>window.TEST_TTS.length),0);
  await p.click('#hsPlay');                                                              // ▶ のタップで鳴る
  await p.waitForFunction(()=>window.TEST_TTS.length===1);
  await p.waitForFunction(()=>document.querySelector('#hsPlayer').dataset.state==='idle');
  console.log('PASS 2 未ログイン・MP3なし：断られたら ▶ を出し、▶ のタップで読み上げが始まる');

  // 2b) 未ログイン：カードの手本は公開済みMP3で鳴る（端末の読み上げ・ログイン・通信待ちなし）
  const before=await p.evaluate(()=>window.TEST_TTS.length);
  await p.click('#navHome');await p.selectOption('#practiceFocus','travel');await p.click('#practiceStart');
  await p.click('[data-action=prListen]');await playing(p);
  assert.match(await p.locator('#hsAudio').evaluate(a=>a.src),/audio\/cards\//);
  assert.equal(await p.evaluate(()=>window.TEST_TTS.length),before);
  await p.click('[data-action=prNext]');assert.equal(await paused(p),true);
  console.log('PASS 2b 未ログイン・カードの手本：公開済みMP3で鳴り、次の画面で止まる');

  // 3) ログイン中のAI会話：場面をタップ → 返答は通信のあとに届く → それでも自動で鳴る（最初のタップで <audio> を開けてあるため）
  p=await open('/',true);
  await p.waitForFunction(()=>window.Hanaseru&&window.HanaseruAudio);
  await p.evaluate(()=>window.Hanaseru.openTalk());
  await p.click('#tkChips [data-scene]');
  await p.waitForSelector('#tkLog .ai');await playing(p);
  assert.equal(await p.evaluate(()=>window.TEST_REJECTED||0),0);
  assert.equal(await p.evaluate(()=>window.TEST_TTS.length+window.TEST_TTS_DROPPED),0);
  // 返答と一緒に音声が届く＝音声を作るための別の通信はしない
  assert.equal(await p.evaluate(()=>window.TEST_SPEECH_CALLS||0),0);
  assert.deepEqual(await p.evaluate(()=>window.TEST_CHAT),[{mode:'chat',split:true}]);
  // 「相手の声を聞く」＝同じ文は作り直さず、すぐ鳴る
  await p.click('#hsStop');const calls=await p.evaluate(()=>window.TEST_SPEECH_CALLS||0);
  await p.click('#tkLog .speak[data-say]');await playing(p);
  assert.equal(await p.evaluate(()=>window.TEST_SPEECH_CALLS||0),calls);
  // マイクを始めると、相手の声は止まる
  await p.click('#tkMic');assert.equal(await paused(p),true);
  await p.waitForFunction(()=>document.querySelector('#tkVoiceStatus').textContent.includes('聞いています'));
  await p.click('#tkMic');assert.match(await p.locator('#tkVoiceStatus').innerText(),/停止/);
  // 文字で送る → 次の返答も自動で鳴る
  await p.fill('#tkInput','Because it helps children.');await p.click('#tkSend');
  await p.waitForFunction(()=>document.querySelectorAll('#tkLog .ai').length===2);await playing(p);
  // 言い方のヒントは返答のあとから届き、自分の吹き出しに付く（返答を待たせない）
  await p.waitForSelector('#tkLog .me .fb');assert.match(await p.locator('#tkLog .me .fb').innerText(),/こう言うとより良い/);
  assert.equal(await p.locator('#tkLog .me .fbphrase').count(),1);
  // その場で聞く → 言い直す（聞き取れた言葉を見せるだけ。AIには送らない）
  const sent=await p.evaluate(()=>window.TEST_CHAT.length);
  await p.click('#tkLog .me .fb [data-say]:not(.fbphrase)');await playing(p);
  await p.evaluate(()=>{window.TEST_HEARD='it helps children feel better';});
  await p.click('#tkLog .me .fb [data-retry-en]');assert.equal(await paused(p),true);
  await p.waitForFunction(()=>/5 語のうち 5 語/.test(document.querySelector('#tkLog .me .fbheard').textContent));
  assert.equal(await p.evaluate(()=>window.TEST_CHAT.length),sent);
  // 言葉が出ないとき：日本語で言う（日本語で聞き取り、そのまま相手に送る）
  await p.evaluate(()=>{window.TEST_HEARD=null;});
  await p.click('#tkMicJa');assert.equal(await p.evaluate(()=>window.TEST_REC_LANG),'ja-JP');
  await p.click('#tkMic');
  assert.equal(await p.evaluate(()=>window.TEST_CHAT.filter(c=>c.mode==='feedback').length),1);
  await p.click('#navHome');assert.equal(await paused(p),true);
  console.log('PASS 3 ログイン中・AI会話：通信後の返答が自動で鳴る／聞き直し／マイク開始で停止／ホームで停止');

  // 4) リンクから直接開いた直後（まだ一度もタップしていない）：自動再生は断られる → ▶ を出す → ▶ で鳴る
  p=await open('/?practice=talk',true);
  await p.waitForSelector('#tkLog .ai');
  await p.waitForFunction(()=>document.querySelector('#hsPlayer').dataset.state==='blocked',null,{timeout:10000});
  assert.match(await p.locator('#tkVoiceStatus').innerText(),/▶/);
  await p.click('#hsPlay');await playing(p);
  console.log('PASS 4 タップ前の自動再生：黙って失敗せず ▶ を出し、▶ で鳴る');

  // 5) 音声を作れないとき：読み上げへ切り替え。タップの外なら ▶ を出し、▶ で読み上げる
  await p.evaluate(()=>{window.TEST_SPEECH_FAIL=true;});
  await p.fill('#tkInput','Could you say that again?');await p.click('#tkSend');
  await p.waitForFunction(()=>document.querySelectorAll('#tkLog .ai').length===2);
  await p.waitForFunction(()=>document.querySelector('#hsPlayer').dataset.state==='blocked',null,{timeout:10000});
  await p.click('#hsPlay');await p.waitForFunction(()=>window.TEST_TTS.length===1);
  console.log('PASS 5 音声を作れないとき：▶ を出し、▶ で端末の読み上げに切り替わる');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
