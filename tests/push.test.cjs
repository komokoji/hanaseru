const {test}=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {createService,endpoint,subscription,day}=require('../functions/push-service');
function store(){
 const rows=new Map();
 function ref(id){return {id,get:async()=>snap(id),delete:async()=>rows.delete(id)};}
 function snap(id){return {id,ref:ref(id),exists:rows.has(id),data:()=>structuredClone(rows.get(id))};}
 const collection={doc:ref,limit:n=>({get:async()=>({docs:[...rows.keys()].slice(0,n).map(snap),size:Math.min(n,rows.size)})})};
 const db={collection:()=>collection,runTransaction:async f=>f({get:r=>r.get(),set:(r,d)=>rows.set(r.id,{...rows.get(r.id),...d}),update:(r,d)=>{assert(rows.has(r.id));rows.set(r.id,{...rows.get(r.id),...d});}})};
 return {db,rows};
}
const ec=crypto.createECDH('prime256v1');ec.generateKeys();
const sub={endpoint:'https://web.push.apple.com/test-capability',keys:{p256dh:ec.getPublicKey().toString('base64url'),auth:crypto.randomBytes(16).toString('base64url')}};
const auth={token:{email:'komorikoji@lifecrescendo.com',email_verified:true}};
const request=(action,extra={})=>({auth,data:{action,subscription:sub,endpoint:sub.endpoint,...extra}});
test('only verified owner can register; endpoint validation rejects SSRF and malformed keys',async()=>{
 const {db}=store(),s=createService(db,async()=>{});
 await assert.rejects(s.handle({data:{action:'enable'}}),e=>e.code==='unauthenticated');
 await assert.rejects(s.handle({...request('enable'),auth:{token:{email:'other@example.com',email_verified:true}}}),e=>e.code==='permission-denied');
 await assert.rejects(s.handle({...request('enable'),auth:{token:{email:auth.token.email,email_verified:false}}}),e=>e.code==='permission-denied');
 for(const url of ['http://web.push.apple.com/x','https://localhost/x','https://web.push.apple.com.attacker.test/x','https://user@web.push.apple.com/x','https://web.push.apple.com:123/x'])assert.throws(()=>endpoint(url));
 assert.throws(()=>subscription({...sub,keys:{p256dh:'bad',auth:'bad'}}));
 assert.equal(day(new Date('2026-11-24T15:00:00Z')),'2026-11-25');
});
test('registration is idempotent, daily sends once, test throttles, disable prevents later delivery',async()=>{
 const {db,rows}=store();let sent=0,now=Date.parse('2026-11-24T11:00:00Z');
 const s=createService(db,async()=>{sent++;},()=>now);
 await s.handle(request('enable'));await s.handle(request('enable'));assert.equal(rows.size,1);
 assert.deepEqual(await s.daily(),{sent:1,failed:0});assert.deepEqual(await s.daily(),{sent:0,failed:0});
 await s.handle(request('test'));await assert.rejects(s.handle(request('test')),e=>e.code==='resource-exhausted');
 await s.handle(request('disable'));now+=86400000;await s.daily();assert.equal(sent,2);assert.equal(rows.size,0);
});
test('expired destinations are removed and a stop during a send is never resurrected',async()=>{
 const f=store();let fail=true;const s=createService(f.db,async()=>{if(fail)throw {statusCode:410};await s.handle(request('disable'));});
 await s.handle(request('enable'));assert.deepEqual(await s.daily(),{sent:0,failed:1});assert.equal(f.rows.size,0);
 fail=false;await s.handle(request('enable'));await s.handle(request('test'));assert.equal(f.rows.size,0);
});
test('failed delivery does not produce repeated daily alerts, ten-device cap enforced',async()=>{
 const f=store(),s=createService(f.db,async()=>{throw {statusCode:503};});
 await s.handle(request('enable'));assert.deepEqual(await s.daily(),{sent:0,failed:1});assert.deepEqual(await s.daily(),{sent:0,failed:0});
 for(let i=1;i<10;i++)await s.handle(request('enable',{subscription:{...sub,endpoint:sub.endpoint+i},endpoint:sub.endpoint+i}));
 await assert.rejects(s.handle(request('enable',{subscription:{...sub,endpoint:sub.endpoint+'overflow'},endpoint:sub.endpoint+'overflow'})),e=>e.code==='resource-exhausted');
});
test('service worker displays a notification and click opens only our fixed practice URL',async()=>{
 const fs=require('node:fs'),vm=require('node:vm'),handlers={},shown=[],opened=[];
 const self={location:{origin:'https://hanaseru.web.app'},addEventListener:(n,f)=>handlers[n]=f,registration:{showNotification:async(...a)=>shown.push(a)},clients:{matchAll:async()=>[],openWindow:async u=>opened.push(u)}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../sw.js'),'utf8'),{self,URL,importScripts:()=>{self.HANASERU_LISTENING_AUDIO={};}});
 let pending;handlers.push({data:{json:()=>({tag:'hanaseru-test',url:'https://attacker.test'})},waitUntil:p=>pending=p});await pending;
 assert.equal(shown[0][0],'ハナセル：テスト通知');
 handlers.notificationclick({notification:{close(){}},waitUntil:p=>pending=p});await pending;assert.deepEqual(opened,['https://hanaseru.web.app/?practice=listening']);
});
