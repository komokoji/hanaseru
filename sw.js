/* Hanaseru service worker — オフラインで開けるように主要ファイルをキャッシュ */
var CACHE = "hanaseru-v17";
var ASSETS = ["./", "./index.html", "./app.js", "./data.js", "./listen.js", "./cloud.js", "./talk.js", "./manifest.webmanifest", "./icon.svg"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var sameOrigin = new URL(e.request.url).origin === self.location.origin;
  // 自サイトの部品はネット優先（更新がすぐ届く）→ 圏外ならキャッシュ。外部（Firebase SDK）はキャッシュ優先。
  if (sameOrigin) {
    e.respondWith(
      fetch(e.request).then(function (res) {
        return caches.open(CACHE).then(function (c) { try { c.put(e.request, res.clone()); } catch (x) {} return res; });
      }).catch(function () {
        return caches.match(e.request).then(function (hit) { return hit || caches.match("./index.html"); });
      })
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      return hit || fetch(e.request).then(function (res) {
        return caches.open(CACHE).then(function (c) { try { c.put(e.request, res.clone()); } catch (x) {} return res; });
      });
    })
  );
});
