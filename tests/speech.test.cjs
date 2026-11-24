const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');
function setup(){let stored={},calls=0;class HttpsError extends Error{constructor(code,message){super(message);this.code=code;}}
 const context={exports:{},require:n=>n.includes('/https')?{HttpsError,onCall:(_,fn)=>fn}:n.includes('/app')?{getApps:()=>[{}]}:{},console,AbortSignal,fetch,Date};
 vm.runInNewContext(fs.readFileSync('functions/speech.js','utf8'),context);
 const deps={db:{collection:()=>({doc:()=>({})}),runTransaction:async f=>f({get:async()=>({exists:true,data:()=>stored}),set:(_,d)=>{stored=d;}})},credential:{getAccessToken:async()=>({access_token:'test'})},fetch:async(url,o)=>{calls++;assert.equal(url,'https://texttospeech.googleapis.com/v1/text:synthesize');assert.equal(JSON.parse(o.body).audioConfig.audioEncoding,'MP3');return {ok:true,json:async()=>({audioContent:'YWJj'})};}};
 const request={auth:{uid:'test',token:{email:'komorikoji@lifecrescendo.com',email_verified:true}},data:{text:'Hello.'}};
 return {run:context.exports.synthesize,deps,request,calls:()=>calls};}
test('speech requires owner verified auth and bounded input before provider',async()=>{const s=setup();for(const r of [{data:{}},{...s.request,auth:{token:{email:'other',email_verified:true}}},{...s.request,auth:{token:{email:'komorikoji@lifecrescendo.com'}}},{...s.request,data:{text:'x'.repeat(1201)}}])await assert.rejects(s.run(r,s.deps));assert.equal(s.calls(),0);});
test('MP3 output and daily quota protect provider',async()=>{const s=setup();for(let i=0;i<100;i++)assert.equal((await s.run(s.request,s.deps)).audioContent,'YWJj');await assert.rejects(s.run(s.request,s.deps),e=>e.code==='resource-exhausted');assert.equal(s.calls(),100);});
