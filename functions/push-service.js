'use strict';
const {createHash}=require('node:crypto');
const {HttpsError}=require('firebase-functions/v2/https');
const OWNER='komorikoji@lifecrescendo.com';
function endpoint(value){
 if(typeof value!=='string'||value.length>2048)throw new HttpsError('invalid-argument','通知先が不正です');
 let u;try{u=new URL(value);}catch(_){throw new HttpsError('invalid-argument','通知先が不正です');}
 const host=u.hostname;
 const trusted=host==='web.push.apple.com'||/^[a-z0-9-]+\.push\.apple\.com$/.test(host)||host==='fcm.googleapis.com'||host==='updates.push.services.mozilla.com';
 if(u.protocol!=='https:'||u.port||u.username||u.password||u.hash||!trusted)throw new HttpsError('invalid-argument','この通知サービスには対応していません');
 return value;
}
function subscription(s){
 const ep=endpoint(s&&s.endpoint),keys=s&&s.keys;
 function key(k,n){if(typeof k!=='string'||!/^[\w-]+={0,2}$/.test(k)||Buffer.from(k,'base64url').length!==n)throw new HttpsError('invalid-argument','通知鍵が不正です');return k;}
 const p=key(keys&&keys.p256dh,65);if(Buffer.from(p,'base64url')[0]!==4)throw new HttpsError('invalid-argument','通知鍵が不正です');
 return {endpoint:ep,keys:{p256dh:p,auth:key(keys&&keys.auth,16)}};
}
function id(ep){return createHash('sha256').update(ep).digest('hex');}
function day(date){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);}
function payload(test=false){return JSON.stringify({title:test?'ハナセル：テスト通知':'ハナセル：今日の3分',body:'今日は3分だけ。途中で終えても大丈夫です。',tag:test?'hanaseru-test':'hanaseru-daily',url:'/?practice=listening'});}
function createService(db,send,now=()=>Date.now()){
 const devices=db.collection('hanaseru_push_devices');
 async function updateExisting(ref,patch){await db.runTransaction(async tx=>{const doc=await tx.get(ref);if(doc.exists)tx.update(ref,patch);});}
 async function deliver(ref,s,test){
  // Revalidate stored endpoints before outbound requests; do not log capability URLs or keys.
  const clean=subscription(s);
  try{await send(clean,payload(test));await updateExisting(ref,{lastAcceptedAt:now(),lastError:null});return true;}
  catch(e){const code=Number(e.statusCode)||0;if(code===404||code===410)await ref.delete();else await updateExisting(ref,{lastError:code||'delivery-failed'});return false;}
 }
 async function handle(r){
  if(!r.auth)throw new HttpsError('unauthenticated','ログインが必要です');
  if(r.auth.token.email!==OWNER||r.auth.token.email_verified!==true)throw new HttpsError('permission-denied','院長のGoogleアカウントでログインしてください');
  const d=r.data||{},action=d.action;
  if(!['enable','disable','status','test'].includes(action))throw new HttpsError('invalid-argument','操作が不正です');
  const ep=endpoint(d.endpoint||(d.subscription&&d.subscription.endpoint)),ref=devices.doc(id(ep));
  if(action==='disable'){await ref.delete();return {enabled:false};}
  if(action==='status'){const s=await ref.get();return {enabled:s.exists,lastAcceptedAt:s.exists?s.data().lastAcceptedAt||null:null,lastError:s.exists?s.data().lastError||null:null};}
  if(action==='enable'){
   const sub=subscription(d.subscription);
   await db.runTransaction(async tx=>{const all=await tx.get(devices.limit(11));if(!all.docs.some(x=>x.id===ref.id)&&all.size>=10)throw new HttpsError('resource-exhausted','通知端末が上限です。使わない端末で停止してください');tx.set(ref,{subscription:sub,updatedAt:now()},{merge:true});});
   return {enabled:true};
  }
  const sub=await db.runTransaction(async tx=>{const snap=await tx.get(ref);if(!snap.exists)throw new HttpsError('failed-precondition','先に通知を有効にしてください');const s=snap.data();if(now()-(s.lastTestAt||0)<60000)throw new HttpsError('resource-exhausted','テスト通知は1分あけてください');tx.update(ref,{lastTestAt:now()});return s.subscription;});
  if(!await deliver(ref,sub,true))throw new HttpsError('unavailable','送信できませんでした。通知を再登録してお試しください');
  return {accepted:true};
 }
 async function daily(){
  const current=day(new Date(now())),all=await devices.limit(10).get();let sent=0,failed=0;
  for(const doc of all.docs){
   // Claim before sending: duplicate Scheduler runs do not send twice. No catch-up spam on failure.
   const sub=await db.runTransaction(async tx=>{const snap=await tx.get(doc.ref);if(!snap.exists)return null;const s=snap.data();if(s.lastAttemptDay===current)return null;tx.update(doc.ref,{lastAttemptDay:current});return s.subscription;});
   if(sub){try{if(await deliver(doc.ref,sub,false))sent++;else failed++;}catch(_){failed++;}}
  }
  return {sent,failed};
 }
 return {handle,daily};
}
module.exports={createService,endpoint,subscription,day,payload};
