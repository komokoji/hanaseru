/* Hanaseru service worker — オフラインで開けるように主要ファイルをキャッシュ */
var CACHE = "hanaseru-v74";
var ASSETS = ["./", "./index.html", "./app.js", "./navigation.js", "./practice-core.js", "./practice.js", "./shelf.js", "./scenes-data.js", "./personal-scenes.js", "./clinic-dialogues.js", "./clinic-dialogues-constipation.js", "./scenes.js", "./learning-plan.js", "./listening-lessons.js", "./listening-route.js", "./daily-listening.js", "./data.js", "./trip.js", "./visit.js", "./gutnutri.js", "./me.js", "./basics.js", "./conversation.js", "./patterns.js", "./parts.js", "./listen.js", "./cloud.js", "./talk.js", "./audio-core.js", "./card-audio.js", "./voice-loop.js", "./notifications.js", "./push-public.json", "./manifest.webmanifest", "./icon.svg"];

importScripts("./listening-audio.js");
ASSETS=ASSETS.concat(["./listening-audio.js"],Object.values(self.HANASERU_LISTENING_AUDIO));

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE && k.indexOf("hanaseru-tts-") !== 0; /* その場で作った音声の控えは残す */ }).map(function (k) { return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var sameOrigin = new URL(e.request.url).origin === self.location.origin;
  // 自サイトの部品はネット優先（更新がすぐ届く）→ 圏外ならキャッシュ。外部（Firebase SDK）はキャッシュ優先。
  if (sameOrigin) {
    e.respondWith(
      fetch(e.request).then(function (res) {
        return caches.open(CACHE).then(function (c) { if(res.status===200)c.put(e.request, res.clone()).catch(function(){}); return res; });
      }).catch(function () {
        return caches.match(e.request).then(function (hit) { return hit || caches.match("./index.html"); });
      })
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      return hit || fetch(e.request).then(function (res) {
        return caches.open(CACHE).then(function (c) { if(res.status===200)c.put(e.request, res.clone()).catch(function(){}); return res; });
      });
    })
  );
});

// Every push displays a notification; no silent push or background learning tracking.
self.addEventListener('push', function(e){
  var data={};try{data=e.data?e.data.json():{};}catch(_){}
  var test=data.tag==='hanaseru-test';
  e.waitUntil(self.registration.showNotification(test?'ハナセル：テスト通知':'ハナセル：今日の3分',{
    body:'今日は3分だけ。途中で終えても大丈夫です。',
    tag:test?'hanaseru-test':'hanaseru-daily',
    icon:'./icon.svg',data:{url:'/?practice=listening'}
  }));
});
self.addEventListener('notificationclick', function(e){
  e.notification.close();
  var url=new URL('/?practice=listening',self.location.origin).href;
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(async function(list){
    for(var client of list){
      if(new URL(client.url).origin===self.location.origin && 'navigate' in client){
        try{var target=await client.navigate(url);if(target){await target.focus();return;}}catch(_){}
      }
    }
    return self.clients.openWindow(url);
  }));
});
