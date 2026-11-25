/* 学びが次に生きる仕組みの試験（模擬。実iPhoneではない）：
   今日のメニュー／熟語の耳トレ→外した問題がつまずき直しへ／つまずき直しの出し直し／現在地チェック（聞く＋話す）／
   会話のつなぎ・ドバイ／連続で聞く→聞いた時間／AIの新しい会話／AI会話に練習中の言い回しが渡る */
const {webkit}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');
// ホームの「こまかい設定」は折りたたみ。試験では開いておき、中の操作も確かめる。
const openMore=async p=>{await p.addInitScript(()=>document.addEventListener('DOMContentLoaded',()=>{const d=document.getElementById('homeMore');if(d)d.open=true;}));return p;};
const BASE=process.env.HANASERU_TEST_URL||'http://127.0.0.1:8087';
const MP3=fs.readFileSync(__dirname+'/fixtures/speech-check.mp3').toString('base64');
const init=`window.TEST_MP3=${JSON.stringify(MP3)};
  class Rec{start(){window.TEST_REC_LANG=this.lang;setTimeout(()=>this.onstart&&this.onstart(),5);if(window.TEST_HEARD)setTimeout(()=>{this.onresult&&this.onresult({results:[Object.assign([{transcript:window.TEST_HEARD}],{isFinal:true})]});},30);}abort(){}stop(){}}
  window.SpeechRecognition=Rec;`;
const firebase=logged=>route=>{
  const url=route.request().url();let body='';
  if(url.endsWith('firebase-app.js'))body='export const initializeApp=()=>({}); export const getApp=()=>({});';
  if(url.endsWith('firebase-auth.js'))body=`export const getAuth=()=>({currentUser:${logged}?{uid:'test'}:null}); export class GoogleAuthProvider{}; export const onAuthStateChanged=(a,f)=>{f(a.currentUser);}; export const signInWithPopup=async()=>{}; export const signInWithRedirect=async()=>{}; export const getRedirectResult=async()=>null; export const signOut=async()=>{}; export const setPersistence=async()=>{}; export const browserLocalPersistence={};`;
  if(url.endsWith('firebase-firestore.js'))body='export const getFirestore=()=>({}); export const doc=()=>({}); export const getDoc=async()=>({exists:()=>false}); export const setDoc=async()=>{}; export const serverTimestamp=()=>0;';
  if(url.endsWith('firebase-functions.js'))body=`export const getFunctions=()=>({}); export const httpsCallable=(f,name)=>async(data)=>{(window.TEST_CALLS=window.TEST_CALLS||[]).push(data);
    if(name==='hanaseruSpeech')return {data:{audioContent:window.TEST_MP3}};
    if(data.mode==='assess')return {data:{result:{scores:data.items.map((x,i)=>({score:[3,2,4][i],comment_ja:'理由を一つ足すと上がります'}))}}};
    if(data.mode==='listen')return {data:{result:{title_ja:'部屋の鍵',place_ja:'ホテル',who_a:'フロント係',who_b:'宿泊客',gender_a:'f',gender_b:'m',lines:[{s:'A',en:'Good evening. How can I help?'},{s:'B',en:'My key card has stopped working.'},{s:'A',en:'Let me sort that out for you.'},{s:'B',en:'Thanks. I ended up waiting outside.'}],gist_ja:'鍵が使えない。直してもらう。',chunks:[{en:'sort that out',ja:'解決する'}],reply_ja:'困っていることを一文で伝える。'},audioContent:window.TEST_MP3}};
    if(data.mode==='feedback')return {data:{result:{better:'It ended up taking longer than I expected.',better_ja:'思ったより長くかかりました',tip:'end up を使う',phrases:[{en:'end up',ja:'結局〜になる'}]}}};
    return {data:{result:{reply:'Oh, I see. What happened then?',ended:false},audioContent:window.TEST_MP3}};};`;
  route.fulfill({status:200,contentType:'text/javascript',body});
};
(async()=>{const b=await webkit.launch({headless:true});try{
  const open=async(logged)=>{const c=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'});await c.addInitScript(init);await c.route('https://www.gstatic.com/**',firebase(logged));
    const p=await openMore(await c.newPage());const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(BASE+'/');await p.waitForFunction(()=>window.Hanaseru&&window.Hanaseru.focus&&window.HanaseruQuiz);return {p,errors};};
  const playing=p=>p.waitForFunction(()=>{const a=document.querySelector('#hsAudio');return !a.paused&&a.currentTime>0.05;},null,{timeout:8000});
  const state=p=>p.evaluate(()=>JSON.parse(JSON.stringify(window.Hanaseru.getState())));

  // ---- 未ログイン ----
  let {p,errors}=await open(false);
  // 教材データ：新しい教材のすべての英文に公開済みMP3がある
  const missing=await p.evaluate(()=>{const m=window.HANASERU_CARD_AUDIO,n=t=>String(t).trim(),out=[];
    window.HANASERU_PHRASALS.forEach(x=>{if(!m[n(x.en)])out.push(x.id);});
    window.HANASERU_ASSESS.forms.forEach(f=>{f.listening.forEach(x=>{if(!m[n(x.en)])out.push(x.id);});f.speaking.forEach(x=>{if(!m[n(x.promptEn)])out.push(x.id);});});
    window.HANASERU_LINK_SCENES.concat(window.HANASERU_DUBAI_SCENES).forEach(s=>s.turns.concat([s.challenge]).forEach(t=>{if(!m[n(t.heard)]||!m[n(t.en)])out.push(s.id);}));
    window.HANASERU_DUBAI_SCENES.forEach(s=>{if(!m[n(s.turns.map(t=>t.heard+' '+t.en).join(' '))]||!s.source)out.push('full:'+s.id);});return out;});
  assert.deepEqual(missing,[]);
  // 今日のメニュー：3行＋現在地チェックの案内
  assert.equal(await p.locator('#homeTiles .tile').count(),16);assert.equal(await p.locator('#homeTiles .tile.today').count(),3);assert.match(await p.locator('#coachStat').innerText(),/まず現在地チェックを1回/);
  assert(await p.locator('#homeTiles').evaluate(e=>e.getBoundingClientRect().bottom<700),'ボタンは最初の1画面に収まる');assert.equal(await p.locator('#practiceStart').isVisible(),true);
  // 熟語の耳トレ：音が鳴る→外す→英文と意味が出る→つまずき直しに入る
  await p.click('#homeTiles [data-action="quizPhrasal"]');await playing(p);
  assert.equal(await p.locator('#qzBody .en').count(),0);
  await p.locator('.qz-opt').nth(0).click();
  assert.equal(await p.locator('#qzBody .en').count(),1);assert.equal(await p.evaluate(()=>document.querySelector('#hsAudio').paused),true);
  for(let i=1;i<8;i++){await p.click('[data-qz="next"]');await playing(p);await p.locator('.qz-opt').nth(i%4).click();}
  await p.click('[data-qz="next"]');assert.match(await p.locator('#qzTitle').innerText(),/熟語の耳トレ：\d \/ 8/);
  let s=await state(p);const answered=Object.keys(s.quiz.pv).length,missed=Object.values(s.quiz.pv).filter(g=>g.ng).length;
  assert.equal(answered,8);assert.equal(s.focus.filter(x=>x.src==='pv').length,missed);assert(missed>0,'at least one miss with fixed picks');
  // つまずき直し：日本語→聞く→言えた→次は明日以降
  await p.click('#navHome');assert.match(await p.locator('#coachStat').innerText(),/つまずき直し \d+件/);assert.equal(await p.locator('#homeTiles [data-menu="focus"].today').count(),1);
  await p.click('#homeTiles [data-action="focusOpen"]');assert.match(await p.locator('#fcTitle').innerText(),/つまずき直し 1 \//);
  assert.equal(await p.locator('#fcBody .en').count(),0);await p.click('[data-action="fcSay"]');await playing(p);assert.equal(await p.locator('#fcBody .en').count(),1);
  await p.click('[data-action="fcOk"]');s=await state(p);assert.equal(s.focus.filter(x=>x.box===1&&x.due>s.focus[0].due-2).length>=1,true);
  // 会話のつなぎ・ドバイ：一覧と、指定の一言から返す手本
  await p.click('#navHome');await p.click('#setup [data-action="sceneTrack"][data-track="links"]');assert.equal(await p.locator('#scBody .sc-row').count(),8);
  await p.click('[data-action="scChoose"][data-id="links-receive"]');assert.match(await p.locator('#scBody').innerText(),/〈受ける〉/);
  await p.click('[data-action="scHear"]');await playing(p);
  await p.click('[data-action="scGrade"][data-result="again"]');s=await state(p);assert(s.focus.some(x=>x.src==='scene'),'「まだ難しい」がつまずき直しへ');
  await p.click('#navHome');await p.click('#setup [data-action="sceneTrack"][data-track="dubai"]');assert.equal(await p.locator('#scBody .sc-row').count(),4);
  await p.click('[data-action="scChoose"][data-id="dubai-qa-cac"]');await p.click('[data-action="scFull"]');await playing(p);
  // 連続で聞く：次々に流れ、聞いた時間が記録される
  await p.click('#navHome');await p.click('#setup [data-action="lrLoop"]');await playing(p);assert.match(await p.locator('#lrProgress').innerText(),/1 \/ \d+ 本/);
  await p.evaluate(()=>{const a=document.querySelector('#hsAudio');a.currentTime=Math.max(0,a.duration-1);});
  await p.waitForFunction(()=>/^2 \//.test(document.querySelector('#lrProgress').textContent),null,{timeout:10000});await playing(p);
  await p.click('[data-lx="loopStop"]');s=await state(p);assert(s.listen[0].s>=20,'聞いた秒数が記録される');
  // 現在地チェック（未ログイン＝聞く10問だけ）
  await p.click('#navHome');await p.click('#setup [data-action="assessOpen"]');assert.match(await p.locator('#asBody').innerText(),/聞く10問だけ記録/);
  await p.click('[data-as="go"]');await playing(p);
  const key=await p.evaluate(()=>window.HANASERU_ASSESS.forms[0].listening.map(x=>x.answer));
  for(let i=0;i<10;i++){assert.equal(await p.locator('#qzBody .en').count(),0,'答えは最後まで見せない');await p.locator('.qz-opt').nth(i<7?key[i]:(key[i]+1)%4).click();await p.click('[data-qz="next"]');}
  await p.waitForFunction(()=>/現在地：/.test(document.querySelector('#asTitle').textContent));
  assert.match(await p.locator('#asBody').innerText(),/聞く：7 \/ 10/);
  s=await state(p);assert.equal(s.assess.length,1);assert.deepEqual(s.assess[0].L.by,[3,4,0]);assert.equal(s.assess[0].S,null);assert(s.focus.some(x=>x.src==='assess'));
  await p.click('#navHome');assert.match(await p.locator('#coachStat').innerText(),/現在地チェックまで 84日/);
  assert.deepEqual(errors,[]);
  console.log('PASS 1 未ログイン：今日のメニュー／熟語の耳トレ→つまずき直し／会話のつなぎ・ドバイ／連続で聞く→聞いた時間／現在地チェック（聞く）');

  // ---- ログイン中 ----
  ({p,errors}=await open(true));
  await p.waitForFunction(()=>window.Hanaseru.loggedIn&&window.Hanaseru.loggedIn());
  await p.evaluate(()=>window.Hanaseru.focus.add('sort out','（問題を）解決する','pv'));
  // AIの新しい会話：作る→音が鳴る→要所をつまずき直しへ。練習中の言い回しがAIに渡る
  await p.click('#setup [data-action="lrNew"]');await p.click('[data-lx="make"]');await p.waitForFunction(()=>document.querySelector('#lrTitle').textContent==='部屋の鍵');await playing(p);
  assert.deepEqual(await p.evaluate(()=>window.TEST_CALLS.find(c=>c.mode==='listen').focus),['sort out']);
  // AI会話：練習中の言い回しが相手役に渡り、助言の言い回しがつまずき直しに入る。使えたら「使えた」になる
  await p.evaluate(()=>window.Hanaseru.openTalk());await p.click('#tkChips [data-scene]');await p.waitForSelector('#tkLog .ai');
  await p.fill('#tkInput','It took long time.');await p.click('#tkSend');await p.waitForSelector('#tkLog .me .fb');
  assert.deepEqual(await p.evaluate(()=>window.TEST_CALLS.filter(c=>c.mode==='chat'||!c.mode).pop().focus),['sort out']);
  s=await state(p);assert(s.focus.some(x=>x.en==='end up'&&x.src==='talk'));assert(s.focus.some(x=>/ended up taking/.test(x.en)));
  await p.fill('#tkInput','They helped me sort out the booking.');await p.click('#tkSend');await p.waitForFunction(()=>/使えました/.test(document.querySelector('#tkNote').textContent));
  s=await state(p);assert.equal(s.focus.find(x=>x.en==='sort out').box,1);
  // 現在地チェック（聞く＋話す3問）：文字起こし→AIが 0〜4 →語数・つなぎ言葉を数える
  await p.click('#navHome');await p.click('#setup [data-action="assessOpen"]');await p.click('[data-as="go"]');
  for(let i=0;i<10;i++){await p.locator('.qz-opt').nth(0).click();await p.click('[data-qz="next"]');}
  await p.waitForFunction(()=>/話す 1 \/ 3/.test(document.querySelector('#asTitle').textContent));
  for(let i=0;i<3;i++){await p.click('[data-as="hear"]');await playing(p);
    await p.evaluate(()=>{window.TEST_HEARD='Well, I think they eat worse because they have more sweets. For example, my patients often skip breakfast.';});
    await p.click('[data-as="talk"]');await p.waitForTimeout(400);await p.click('[data-as="stopTalk"]');assert.match(await p.locator('#asBody').innerText(),/I think they eat worse/);await p.click('[data-as="nextS"]');}
  await p.waitForFunction(()=>/現在地：/.test(document.querySelector('#asTitle').textContent));
  assert.match(await p.locator('#asBody').innerText(),/話す：9 \/ 12/);assert.match(await p.locator('#asBody').innerText(),/つなぎ言葉 9 回/);
  s=await state(p);assert.equal(s.assess[0].S.length,3);assert.equal(s.assess[0].S[0].links,3);assert(s.assess[0].S[0].words>=15);
  assert.equal(await p.evaluate(()=>window.TEST_CALLS.find(c=>c.mode==='assess').items.length),3);
  assert.deepEqual(errors,[]);
  console.log('PASS 2 ログイン中：AIの新しい会話／AI会話とつまずき直しの行き来／現在地チェック（聞く＋話す）');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
