/* 🩺 診察を英語で：一覧 → 通しで聞く → 保護者の言葉 → 手本（医師の声）→ 次の往復。未ログイン・公開済みMP3だけで動くこと。 */
const {webkit}=require('playwright');const assert=require('node:assert/strict');
const BASE=process.env.HANASERU_TEST_URL||'http://127.0.0.1:8087';
(async()=>{const b=await webkit.launch({headless:true});try{
  const c=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'});
  const p=await c.newPage();await p.route('https://www.gstatic.com/**',r=>r.abort());const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(BASE+'/');await p.waitForFunction(()=>window.HANASERU_CONSULT_SCENES&&window.HanaseruAudio);
  await p.evaluate(()=>{window.speechSynthesis.speak=()=>{window.TEST_TTS=(window.TEST_TTS||0)+1;};});
  // 教材データ：医師の手本・保護者の言葉・通しの会話すべてに公開済みMP3がある
  const missing=await p.evaluate(()=>{const m=window.HANASERU_CARD_AUDIO,n=t=>String(t).trim(),out=[];
    window.HANASERU_CONSULT_SCENES.forEach(s=>{s.turns.concat([s.challenge]).forEach(t=>{if(!m[n(t.heard)])out.push(t.heard);if(!m[n(t.en)])out.push(t.en);});if(!m[n(s.turns.map(t=>t.heard+' '+t.en).join(' '))])out.push('dialogue:'+s.id);if(!s.source||s.turns.length<5)out.push('meta:'+s.id);});return out;});
  assert.deepEqual(missing,[]);
  assert.match(await p.locator('#sceneHome-consult').innerText(),/0 \/ 32/);
  await p.click('[data-action="sceneTrack"][data-track="consult"]');
  assert.match(await p.locator('#scTitle').innerText(),/診察を英語で/);
  assert.equal(await p.locator('#scBody .shelf-entry').count(),32);assert(await p.locator('#scBody .sc-group').count()>=3);
  await p.click('[data-action="scChoose"][data-id="consult-flu"]');
  const playing=()=>p.waitForFunction(()=>{const a=document.querySelector('#hsAudio');return !a.paused&&a.currentTime>0.05;},null,{timeout:8000});
  await p.click('[data-action="scFull"]');await playing();
  assert(await p.locator('#hsAudio').evaluate(a=>a.duration>40),'full consultation is one long recording');
  await p.click('[data-action="scStop"]');assert.equal(await p.locator('#hsAudio').evaluate(a=>a.paused),true);
  await p.click('[data-action="scHear"]');await playing();const parent=await p.locator('#hsAudio').evaluate(a=>a.src);
  await p.click('[data-action="scModel"]');await p.click('[data-action="scModelAudio"]');await playing();const doctor=await p.locator('#hsAudio').evaluate(a=>a.src);
  assert.notEqual(parent,doctor);assert.match(doctor,/audio\/cards\//);
  await p.click('[data-action="scModel"]');await p.click('[data-action="scGrade"][data-result="said"]');
  assert.match(await p.locator('#scBody').innerText(),/2 \/ 6往復/);assert.equal(await p.locator('[data-action="scFull"]').count(),0);
  // 便秘外来のまとまりと、院長が聞く側の問診の回がある。台本なしの通し稽古の入口がある
  await p.click('[data-action="scList"]');
  assert.match(await p.locator('#scBody').innerText(),/便秘外来/);assert.equal(await p.locator('[data-id="consult-const-history"]').count(),1);
  await p.click('[data-action="scChoose"][data-id="consult-const-history"]');
  assert.match(await p.locator('#scBody').innerText(),/台本なしで、AIの保護者と通し稽古/);
  await p.click('#navHome');assert.equal(await p.locator('#hsAudio').evaluate(a=>a.paused),true);
  assert.equal(await p.evaluate(()=>window.TEST_TTS||0),0);assert.deepEqual(errors,[]);
  console.log('PASS consult: 32 scenes with prepared audio, full playback, parent and doctor voices, progress, no device TTS');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
