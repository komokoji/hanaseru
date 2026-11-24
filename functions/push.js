'use strict';
const {onCall}=require('firebase-functions/v2/https');
const {onSchedule}=require('firebase-functions/v2/scheduler');
const {defineSecret}=require('firebase-functions/params');
const {getApps,initializeApp}=require('firebase-admin/app');
const {getFirestore}=require('firebase-admin/firestore');
const webpush=require('web-push');
const {createService}=require('./push-service');
const {publicKey}=require('./push-public.json');
const privateKey=defineSecret('HANASERU_WEBPUSH_V1_PRIVATE');
function service(){
 if(!getApps().length)initializeApp();
 return createService(getFirestore(),(sub,data)=>webpush.sendNotification(sub,data,{TTL:3600,timeout:10000,urgency:'normal',vapidDetails:{subject:'https://hanaseru.web.app',publicKey,privateKey:privateKey.value()}}));
}
const options={region:'asia-northeast1',secrets:[privateKey],maxInstances:1,memory:'256MiB',timeoutSeconds:180};
exports.hanaseruPush=onCall({...options,cors:['https://hanaseru.web.app'],invoker:'public'},r=>service().handle(r));
exports.hanaseruDailyReminder=onSchedule({...options,schedule:'0 20 * * *',timeZone:'Asia/Tokyo',retryCount:0},async()=>{const result=await service().daily();console.log('Hanaseru reminder counts',result);});
