/* Personal-audio workflow, storage, actual decoding and microphone cleanup. No external writes. */
const {webkit}=require('playwright');const assert=require('node:assert/strict');
const fs=require('fs');
const base=process.env.HANASERU_TEST_URL||'http://127.0.0.1:8087';
function wav(){const b=Buffer.alloc(44+16000*4);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(16000,24);b.writeUInt32LE(32000,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(b.length-44,40);return b.toString('base64');}
const sound=wav();const fixture={format:'hanaseru-original-audio-v1',id:'private-audio-test',title:'Private lesson <safe>',audio:sound,segments:[{start:0,end:2,text:'We have time for a short break.',audio:sound},{start:2,end:4,text:'Let us plan our next trip.',audio:sound}]};
const payload=x=>({name:'lesson.hanaseru.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(x))});
(async()=>{const browser=await webkit.launch({headless:true});try{
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 await context.route('https://www.gstatic.com/**',r=>r.abort());
 await context.addInitScript(()=>{
  window.TEST_STOPS=0;window.TEST_TTS=0;window.TEST_MIC_DELAY=false;
  Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async()=>{if(window.TEST_DENY)throw Error('denied');const s={getTracks:()=>[{stop:()=>window.TEST_STOPS++}]};if(window.TEST_MIC_DELAY)return new Promise(resolve=>window.TEST_MIC_RESOLVE=()=>resolve(s));return s;}}});
  window.MediaRecorder=class {constructor(){this.state='inactive';this.mimeType='audio/webm';}start(){this.state='recording';}stop(){this.state='inactive';if(this.ondataavailable)this.ondataavailable({data:new Blob(['test'],{type:'audio/webm'})});if(this.onstop)this.onstop();}};
  Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>[],cancel(){},speak(){window.TEST_TTS++;}}});
 });
 const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const uploads=[];p.on('request',r=>{if(r.method()==='POST')uploads.push(r.url());});
 await p.goto(base);await p.waitForFunction(()=>window.Hanaseru);
 const open=async()=>{await p.click('#homeTiles [data-action="skillsOpen"]');await p.click('[data-action="ownAudioOpen"]');await p.waitForSelector('#oaFile',{state:'attached'});};
 await open();await p.setInputFiles('#oaFile',payload(fixture));await p.waitForSelector('#oaAnswer');
 assert.equal(await p.locator('#oaMissing').count(),0,'answer hidden before reveal');
 assert.match(await p.locator('#skProgress').innerText(),/<safe>/,'title displayed as text');
 await p.click('[data-oa="play"]');await p.waitForFunction(()=>!document.getElementById('hsAudio').paused&&document.getElementById('hsAudio').currentTime>0.05);
 await p.selectOption('#oaRate','0.75');await p.click('[data-oa="play"]');assert.equal(await p.$eval('#hsAudio',a=>a.playbackRate),0.75);
 await p.fill('#oaAnswer','We have a break');await p.click('[data-oa="reveal"]');assert.match(await p.locator('#oaMissing').innerText(),/time.*for.*short/);
 await p.check('#oaSpoken');await p.click('[data-oa="next"]');await p.fill('#oaAnswer','my second answer');
 await p.reload();await p.waitForFunction(()=>window.Hanaseru);await open();await p.waitForSelector('#oaAnswer');assert.equal(await p.inputValue('#oaAnswer'),'my second answer');
 await p.click('[data-oa="prev"]');assert.equal(await p.inputValue('#oaAnswer'),'We have a break');assert.equal(await p.isChecked('#oaSpoken'),true);
 await p.locator('[data-oa="record"]').first().click();await p.waitForFunction(()=>document.getElementById('oaStatus').textContent.includes('録音中'));
 await p.locator('[data-oa="stopRecord"]').first().click();assert.match(await p.locator('#oaStatus').innerText(),/録音しました/);assert.equal(await p.evaluate(()=>window.TEST_STOPS),1);
 // Starting another original must keep the finished recording for comparison.
 await p.click('[data-oa="play"]');await p.locator('[data-oa="playRecord"]').first().click();assert.doesNotMatch(await p.locator('#oaStatus').innerText(),/先に録音/);
 // Decode failure on recorded fake data must not silently become speech synthesis.
 await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>window.TEST_TTS),0);
 await p.locator('[data-oa="record"]').first().click();await p.waitForFunction(()=>document.getElementById('oaStatus').textContent.includes('録音中'));await p.click('#navHome');assert.equal(await p.evaluate(()=>window.TEST_STOPS),2);
 await open();await p.waitForSelector('#oaAnswer');await p.evaluate(()=>window.TEST_DENY=true);await p.locator('[data-oa="record"]').first().click();await p.waitForFunction(()=>document.getElementById('oaStatus').textContent.includes('マイクを使えません'));await p.evaluate(()=>{window.TEST_DENY=false;window.TEST_MIC_DELAY=true;});
 await p.locator('[data-oa="record"]').first().click();await p.waitForFunction(()=>window.TEST_MIC_RESOLVE);await p.click('#navHome');await p.evaluate(()=>window.TEST_MIC_RESOLVE());await p.waitForFunction(()=>window.TEST_STOPS===3);
 await open();await p.waitForSelector('#oaAnswer');await p.setInputFiles('#oaFile',payload({...fixture,segments:[{...fixture.segments[0],start:-1}]}));await p.waitForFunction(()=>document.getElementById('oaStatus').textContent.includes('読み込めませんでした'));assert.equal(await p.inputValue('#oaAnswer'),'We have a break','bad import does not overwrite lesson');
 await p.click('[data-oa="next"]');await p.click('[data-oa="next"]');assert.equal(await p.$eval('#oaTransfer',e=>e.open),true);await p.fill('#oaOwn','We will travel together.');await p.click('[data-oa="hideOwn"]');assert.equal(await p.isVisible('#oaOwn'),false);
 const state=await p.evaluate(()=>JSON.stringify(window.Hanaseru.getState()));assert(!state.includes('my second answer')&&!state.includes('We will travel together.'),'private drafts not in synced state');
 assert.equal(uploads.length,0,'no uploads');
 if(process.env.HANASERU_AUDIO_PACKAGE){await p.setInputFiles('#oaFile',process.env.HANASERU_AUDIO_PACKAGE);await p.waitForFunction(()=>document.getElementById('skProgress').textContent.includes('Vision Jet'));await p.click('[data-oa="play"]');await p.waitForFunction(()=>!document.getElementById('hsAudio').paused&&document.getElementById('hsAudio').currentTime>0.1);assert.equal(await p.$eval('#hsAudio',a=>a.playbackRate),1);}
 p.once('dialog',d=>d.accept());await p.click('[data-oa="remove"]');await p.waitForSelector('#oaAnswer',{state:'detached'});await p.reload();await p.waitForFunction(()=>window.Hanaseru);await open();assert.equal(await p.locator('#oaAnswer').count(),0);
 assert.deepEqual(errors,[]);console.log('PASS original audio: import, playback, rate, dictation, persistence, speaking, microphone cleanup, privacy, invalid import, deletion');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
