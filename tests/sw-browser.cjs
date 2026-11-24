/* Service worker が登録でき、必要な部品を端末に保存し、その場で作った音声の控えを消さないこと。 */
const {chromium}=require('playwright');const assert=require('node:assert/strict');
const BASE=process.env.HANASERU_TEST_URL||'http://127.0.0.1:8087';
(async()=>{const b=await chromium.launch({headless:true,channel:'chrome'});try{
  const c=await b.newContext();const p=await c.newPage();await p.route('https://www.gstatic.com/**',r=>r.abort());
  await p.goto(BASE+'/');
  await p.evaluate(async()=>{const k=await caches.open('hanaseru-tts-v1');await k.put('/__tts/keep.mp3',new Response('x'));await caches.open('hanaseru-v1').then(k=>k.put('/old',new Response('x')));});
  const state=await p.evaluate(async()=>{const r=await navigator.serviceWorker.register('sw.js');await navigator.serviceWorker.ready;await new Promise(r=>setTimeout(r,1500));
    const keys=await caches.keys();const current=keys.find(k=>/^hanaseru-v\d+$/.test(k)&&k!=='hanaseru-v1');const cached=(await (await caches.open(current)).keys()).map(r=>new URL(r.url).pathname);
    return {keys,current,cached,active:!!r.active};});
  assert(state.active);assert(state.keys.includes('hanaseru-tts-v1'),'TTS cache must survive');assert(!state.keys.includes('hanaseru-v1'),'old app cache removed');
  for(const f of ['/audio-core.js','/card-audio.js','/talk.js','/listening-route.js','/index.html'])assert(state.cached.includes(f),f+' cached');
  assert(!state.cached.includes('/speech-player.js'));
  const label=await p.locator('#appMenu button[onclick]').textContent();assert(label.includes(state.current.replace('hanaseru-','')),'menu version matches cache version');
  console.log('PASS service worker:',state.current,'/',state.cached.length,'files cached, TTS cache kept, menu label matches');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
