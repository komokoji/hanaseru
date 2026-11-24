/* Opt-in Web Push. Permission must be requested from the user's tap on iOS. */
import {getApp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {getAuth,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import {getFunctions,httpsCallable} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-functions.js';
const $=id=>document.getElementById(id),auth=getAuth(getApp());
const call=httpsCallable(getFunctions(getApp(),'asia-northeast1'),'hanaseruPush');
const ios=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const supported='serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;
let busy=false,enabled=false,registration=null;
function note(t){$('pushStatus').textContent=t;}
function controls(){
 const owner=auth.currentUser?.email==='komorikoji@lifecrescendo.com';
 $('pushEnable').disabled=busy||!supported||!owner||(ios&&!standalone);
 $('pushDisable').disabled=busy||!supported||!owner;
 $('pushTest').disabled=busy||!enabled||!owner;
}
function bytes(key){return Uint8Array.from(atob(key.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-key.length%4)%4)),c=>c.charCodeAt(0));}
async function ready(){if(!registration)registration=await Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>setTimeout(()=>reject(new Error('画面を再読み込みしてお試しください。')),12000))]);return registration;}
async function refresh(){
 controls();
 if(ios&&!standalone){note('iPhoneでは、共有 →「ホーム画面に追加」。追加したアイコンから開いて、このボタンを押してください。');return;}
 if(!supported){note('このブラウザでは通知を設定できません。対応するOSとブラウザで開いてください。');return;}
 if(!auth.currentUser){enabled=false;note('通知を設定するには、下のクラウド同期からGoogleログインしてください。');controls();return;}
 if(auth.currentUser.email!=='komorikoji@lifecrescendo.com'){note('院長のGoogleアカウントでログインしてください。');return;}
 try{
  const sub=await (await ready()).pushManager.getSubscription();
  if(!sub){enabled=false;note(Notification.permission==='denied'?'通知が拒否されています。iPhoneの「設定」→「通知」→ Hanaseruで許可してください。':'この端末の通知は未登録です。毎日20時（日本時間）に届きます。');}
  else {const {data}=await call({action:'status',endpoint:sub.endpoint});enabled=data.enabled;note(enabled?'毎日20時（日本時間）の配信に登録済みです。「テスト通知」で実際に届くか確認できます。':'端末の許可はありますが、毎日の配信は未登録です。');if(data.lastError)note('配信時にエラーがありました。「通知を有効にする」で再登録し、テスト通知をお試しください。');}
 }catch(_){enabled=false;note('配信状態を確認できませんでした。通信を確認して「状態を確認」を押してください。');}
 controls();
}
$('pushEnable').addEventListener('click',async()=>{
 if(busy)return;busy=true;controls();
 // Invoke before any await/network, preserving the gesture required by Safari.
 try{
  const permission=Notification.requestPermission();
  if(await permission!=='granted')throw new Error('通知は許可されていません。許可を変更する場合は端末の通知設定を開いてください。');
  note('毎日20時の通知を登録しています…');
  const reg=await ready();
  let sub=await reg.pushManager.getSubscription();
  if(!sub){const res=await fetch('./push-public.json');if(!res.ok)throw new Error('通知の設定を読み込めません。');const config=await res.json();sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:bytes(config.publicKey)});}
  await call({action:'enable',subscription:sub.toJSON()});enabled=true;
  note('毎日20時（日本時間）の配信を登録しました。次に「テスト通知」で届くか確認してください。');
 }catch(e){note(e.message||'登録できませんでした。通信を確認して再度お試しください。');}
 finally{busy=false;controls();}
});
$('pushDisable').addEventListener('click',async()=>{
 if(busy)return;busy=true;controls();
 try{const sub=await (await ready()).pushManager.getSubscription();if(sub){await call({action:'disable',endpoint:sub.endpoint});enabled=false;try{await sub.unsubscribe();}catch(_){/* server registration is already removed */}}note('この端末への毎日の通知を停止しました。');enabled=false;}
 catch(_){note('停止を確認できません。通信を確認して再度停止してください。');}
 finally{busy=false;controls();}
});
$('pushTest').addEventListener('click',async()=>{
 if(busy)return;busy=true;controls();
 try{const sub=await (await ready()).pushManager.getSubscription();if(!sub)throw new Error('通知を再登録してください。');await call({action:'test',endpoint:sub.endpoint});note('通知サービスがテスト送信を受け付けました。通知が表示されたらタップして練習が開くか確認してください。');}
 catch(e){note(e.message||'送信できませんでした。');}
 finally{busy=false;controls();}
});
$('pushRefresh').addEventListener('click',()=>{if(!busy)refresh();});
onAuthStateChanged(auth,()=>{if(!busy)refresh();});
