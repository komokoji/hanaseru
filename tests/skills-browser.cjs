/* 🎯 基礎トレの試験（模擬。実iPhoneではない）：持つ／止まらない／音／まねる／文にする。未ログイン・公開済みMP3で動くこと。 */
const {webkit}=require('playwright');const assert=require('node:assert/strict');
const openMore=async p=>{await p.addInitScript(()=>document.addEventListener('DOMContentLoaded',()=>{const d=document.getElementById('homeMore');if(d)d.open=true;}));return p;};
const BASE=process.env.HANASERU_TEST_URL||'http://127.0.0.1:8087';
const init=`class Rec{start(){setTimeout(()=>{if(this.onresult&&window.TEST_HEARD!=null)this.onresult({results:[[{transcript:window.TEST_HEARD}]]});this.onend&&this.onend();},40);}abort(){}stop(){}}
  window.SpeechRecognition=Rec;
  // 端末の読み上げの代わり（自分で貼った英文は、未ログインだと端末の読み上げで聞く）
  Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{speaking:false,pending:false,getVoices:()=>[],cancel(){},resume(){},speak(u){window.TEST_TTS=(window.TEST_TTS||[]).concat(u.text);setTimeout(()=>u.onstart&&u.onstart({}),5);setTimeout(()=>u.onend&&u.onend({}),40);}}});
  // 試験を速くする：音が鳴り始めたら、終わりの手前まで飛ばす
  document.addEventListener('DOMContentLoaded',()=>{const a=document.getElementById('hsAudio');a.addEventListener('playing',()=>{window.TEST_PLAYED=(window.TEST_PLAYED||0)+1;window.TEST_RATES=(window.TEST_RATES||[]).concat(a.playbackRate);if(window.TEST_FAST&&a.duration>0.6)a.currentTime=a.duration-0.25;});});`;
(async()=>{const b=await webkit.launch({headless:true});try{
  const c=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'});await c.addInitScript(init);await c.route('https://www.gstatic.com/**',r=>r.abort());
  const p=await openMore(await c.newPage());const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(BASE+'/');await p.waitForFunction(()=>window.Hanaseru&&window.Hanaseru.focus&&window.HANASERU_SOUNDS&&window.HANASERU_BUILDS&&window.HANASERU_TALKS&&window.HANASERU_NUMBERS);
  const state=()=>p.evaluate(()=>JSON.parse(JSON.stringify(window.Hanaseru.getState())));
  const playing=()=>p.waitForFunction(()=>{const a=document.querySelector('#hsAudio');return !a.paused&&a.currentTime>0.05;},null,{timeout:8000});
  // ホームは1画面のまま。基礎トレの入口がある
  assert.equal(await p.locator('#homeTiles .tile').count(),16);assert(await p.locator('#homeTiles').evaluate(e=>e.getBoundingClientRect().bottom<720),'ボタンは最初の1画面に収まる');
  await p.click('#homeTiles [data-action="skillsOpen"]');assert.equal(await p.locator('#skBody .sc-row').count(),8);
  // 🧠 持つ：続けて聞く → 聞き終わってから選ぶ → 持てた長さを記録
  await p.evaluate(()=>{window.TEST_FAST=true;});
  await p.click('[data-sk="open"][data-id="hold"]');
  for(let i=0;i<6;i++){
    assert.equal(await p.locator('.qz-opt').count(),0,'聞いている間は選択肢を出さない');
    await p.waitForSelector('.qz-opt',{timeout:30000});await p.locator('.qz-opt').nth(0).click();await p.waitForSelector('.qz-after');
    assert(await p.locator('.qz-after [lang=en]').count()>=1);await p.click('[data-sk="spanNext"]');
  }
  assert.match(await p.locator('#skTitle').innerText(),/持つ：できました/);
  let s=await state();assert.equal(s.skills.hold.n,6);assert(s.skills.hold.span>=1&&s.skills.hold.span<=5);
  // ⏩ 止まらない：前の文は速く、最後の文はふつうの速さ
  await p.click('[data-sk="menu"]');await p.evaluate(()=>{window.TEST_RATES=[];});await p.click('[data-sk="open"][data-id="recover"]');
  await p.waitForSelector('.qz-opt',{timeout:30000});const rates=await p.evaluate(()=>window.TEST_RATES);
  assert(rates.length>=2&&rates.slice(0,-1).every(r=>r>1.2)&&rates[rates.length-1]===1,'前は速く・最後はふつう：'+rates);
  await p.locator('.qz-opt').nth(1).click();assert.match(await p.locator('.qz-after').innerText(),/could you say the last part again/);
  s=await state();assert.equal(s.skills.recover.ok+s.skills.recover.ng,1);
  // 📻 長い話：区切りごとに聞く → 聞き終わってから要点を選ぶ → 最後に通しで
  await p.click('[data-sk="menu"]');await p.click('[data-sk="open"][data-id="talk"]');assert.equal(await p.locator('[data-sk="talkOpen"]').count(),3);
  await p.click('[data-sk="talkOpen"][data-id="talk-jet-load"]');
  const key=await p.evaluate(()=>window.HANASERU_TALKS.find(t=>t.id==='talk-jet-load').parts.map(x=>x.answer));
  for(let i=0;i<3;i++){assert.equal(await p.locator('.qz-opt').count(),0);await p.waitForSelector('.qz-opt',{timeout:30000});assert.equal(await p.locator('#skBody .en').isVisible().catch(()=>false),false,'答える前に英文を見せない');
    await p.locator('.qz-opt').nth(i<2?key[i]:(key[i]+1)%3).click();await p.waitForSelector('.qz-after');await p.click('[data-sk="talkNext"]');}
  assert.match(await p.locator('#skProgress').innerText(),/要点 2 \/ 3/);assert.equal(await p.locator('[data-sk="talkAll"]').count(),1);
  s=await state();assert.equal(s.skills.talk.n,1);assert(s.focus.some(x=>x.src==='listen'));
  await p.click('[data-sk="talkBack"]');assert.match(await p.locator('#skBody').innerText(),/Googleログインが必要/);
  // 📋 自分で選んだ英文を貼って聞く：この端末の中だけに保存。区切って聞き、聞いてから英文を見る
  const own='Zebrafish quietly appear in the opening line of this pasted text. '+'The pilot checks the weather before every single flight and writes the numbers down. '.repeat(3)+'After that, she walks around the airplane and looks at the tyres and the fuel caps. '.repeat(3)+'Finally, she calls the tower and asks for permission to taxi to the runway.';
  await p.fill('#skOwn',own);await p.click('[data-sk="ownStart"]');
  await p.waitForSelector('[data-sk="talkSelf"]',{timeout:20000});assert.equal(await p.locator('#skBody .en').count(),0,'聞く前に英文を見せない');
  assert((await p.evaluate(()=>window.TEST_TTS||[])).some(t=>/Zebrafish/.test(t)),'未ログインは端末の読み上げで聞く');
  const nParts=await p.evaluate(()=>/(\d+)区切り/.exec(document.querySelector('#skProgress').textContent)[1]);assert(+nParts>=2);
  await p.click('[data-sk="talkSelf"][data-ok="0"]');assert.match(await p.locator('#skBody .en').innerText(),/Zebrafish/);
  s=await state();assert(!JSON.stringify(s).includes('Zebrafish'),'貼った英文は、同期される記録に入れない');
  assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('hanaseru-own-texts-v1')).length),1);
  await p.click('[data-sk="talkBack"]');assert.equal(await p.locator('[data-sk="ownOpen"]').count(),1);
  await p.click('[data-sk="ownDel"]');assert.equal(await p.locator('[data-sk="ownOpen"]').count(),0);assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('hanaseru-own-texts-v1')).length),0);
  // 🔊 音：聞いて、書かれた文から選ぶ → ゆっくり版
  await p.evaluate(()=>{window.TEST_FAST=false;});
  await p.click('[data-sk="menu"]');await p.click('[data-sk="open"][data-id="sound"]');await playing();
  assert(await p.locator('.qz-opt[lang=en]').count()>=2);assert.equal(await p.locator('#qzBody .en').count(),0);
  await p.locator('.qz-opt').nth(0).click();assert.equal(await p.locator('#qzBody .en').count(),1);
  await p.click('[data-qz="slow"]');await playing();
  s=await state();assert.equal(Object.keys(s.skills.sound).length,1);
  // 🔢 数字：速い数字を聞く → 4つの数字から選ぶ → 量のイメージを見る
  await p.click('#navHome');await p.click('#homeTiles [data-action="skillsOpen"]');await p.click('[data-sk="open"][data-id="number"]');await playing();
  assert.equal(await p.locator('.qz-opt').count(),4);assert((await p.locator('.qz-opt').allInnerTexts()).every(t=>/[0-9]/.test(t)));
  await p.locator('.qz-opt').nth(2).click();assert.match(await p.locator('.qz-after').innerText(),/イメージ：/);
  s=await state();assert.equal(Object.keys(s.skills.number).length,1);
  // 🗣 まねる：聞く → 言う → 拾えなかった語に印
  await p.click('#navHome');await p.click('#homeTiles [data-action="skillsOpen"]');await p.click('[data-sk="open"][data-id="repeat"]');await playing();
  assert.equal(await p.locator('#skBody .en').count(),0);
  await p.evaluate(()=>{window.TEST_HEARD='the';});await p.click('[data-sk="repTalk"]');await p.waitForSelector('#skBody .en');
  assert(await p.locator('#skBody mark').count()>=1,'拾えなかった語に印');await p.click('[data-sk="repNext"]');await playing();
  // 🧱 文にする：1文 → 手本 → 足して伸ばす → 言えた／まだ
  await p.click('[data-sk="menu"]');await p.click('[data-sk="open"][data-id="build"]');
  assert.equal(await p.locator('.sk-keys span').count(),3);assert.equal(await p.locator('#skBody .en').count(),0);
  await p.evaluate(()=>{window.TEST_HEARD='fever three days come back';});await p.click('[data-sk="bldTalk"]');await p.waitForSelector('#skBody .en');
  assert.match(await p.locator('#skBody').innerText(),/fever three days come back/);
  await p.click('[data-sk="bldPlay"]');await playing();
  await p.click('[data-sk="bldNext"]');assert.match(await p.locator('#skProgress').innerText(),/足して伸ばす/);
  await p.click('[data-sk="bldShow"]');const longer=await p.locator('#skBody .en').innerText();await p.click('[data-sk="bldNg"]');
  s=await state();assert.equal(Object.keys(s.skills.build).length,1);assert(s.focus.some(x=>x.en===longer),'「まだ」はつまずき直しへ');
  assert.deepEqual(errors,[]);
  console.log('PASS 基礎トレ：数字（量のイメージ）／長い話（区切って要点）／自分で貼った英文（端末の中だけ）／持つ（持てた長さを記録）／止まらない（前は速く）／音（ゆっくり版）／まねる（拾えなかった語）／文にする（足して伸ばす）');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
