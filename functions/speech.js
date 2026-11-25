'use strict';
const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {getApps,initializeApp,applicationDefault}=require('firebase-admin/app');
const {getFirestore}=require('firebase-admin/firestore');
// 英文をMP3（base64）にする。AI会話の返答にも使う（index.js）。本文はログにもDBにも残さない。
async function speak(text, deps={}) {
  const token=await (deps.credential||applicationDefault()).getAccessToken();
  const res=await (deps.fetch||fetch)('https://texttospeech.googleapis.com/v1/text:synthesize',{
    method:'POST',headers:{Authorization:'Bearer '+token.access_token,'Content-Type':'application/json'},
    body:JSON.stringify({input:{text},voice:{languageCode:'en-US',name:deps.voice||'en-US-Standard-F'},audioConfig:{audioEncoding:'MP3',speakingRate:deps.rate||0.9}}),signal:AbortSignal.timeout(deps.timeoutMs||20000)
  });
  if(!res.ok)throw new Error('TTS status '+res.status);
  const data=await res.json();
  if(!data.audioContent)throw new Error('Missing audio');
  return data.audioContent;
}
async function synthesize(request, deps={}) {
  if(!request.auth)throw new HttpsError('unauthenticated','Googleログインが必要です。');
  if(request.auth.token.email!=='komorikoji@lifecrescendo.com'||request.auth.token.email_verified!==true)throw new HttpsError('permission-denied','このアカウントでは利用できません。');
  const text=request.data?.text;
  if(typeof text!=='string'||!text.trim()||text.length>1200)throw new HttpsError('invalid-argument','音声は1〜1200文字で指定してください。');
  if(!getApps().length)initializeApp();
  const db=deps.db||getFirestore();
  const ref=db.collection('hanaseru_speech_quota').doc(request.auth.uid);
  const day=new Date().toISOString().slice(0,10);
  await db.runTransaction(async tx=>{
    const snap=await tx.get(ref),old=snap.exists?snap.data():{};
    const count=old.day===day?(old.count||0):0;
    if(count>=100)throw new HttpsError('resource-exhausted','今日の音声作成の上限です。明日また利用できます。');
    tx.set(ref,{day,count:count+1});
  });
  try {
    return {audioContent:await speak(text,deps)};
  }catch(e){console.error('Hanaseru speech unavailable',e.name);throw new HttpsError('unavailable','音声を作れませんでした。少し待ってもう一度押してください。');}
}
exports.synthesize=synthesize;
exports.speak=speak;
exports.hanaseruSpeech=onCall({region:'asia-northeast1',maxInstances:1,concurrency:10,memory:'256MiB',timeoutSeconds:30,cors:['https://hanaseru.web.app'],invoker:'public'},r=>synthesize(r));
