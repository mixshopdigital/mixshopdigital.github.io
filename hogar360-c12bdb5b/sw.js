/* HomeFlow 360 service worker: cache-first, versioned. Bump VERSION on every release. */
var VERSION = 'hf360-v1.0.5';
var FILES = ['./', './index.html', './manifest.webmanifest', './css/styles.css', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png',
  './js/i18n.js', './js/core.js', './js/ui.js', './js/data.js', './js/v-tasks.js', './js/v-calendar.js', './js/v-meals.js', './js/v-shopping.js', './js/v-money.js', './js/v-inventory.js',
  './js/v-maintenance.js', './js/v-family.js', './js/v-docs.js', './js/v-templates.js', './js/v-home.js', './js/v-settings.js', './js/app.js'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request; if (r.method !== 'GET') return;
  var u = new URL(r.url); if (u.origin !== location.origin) return;
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(function (hit) {
    if (hit) return hit;
    return fetch(r).then(function (res) { if (res && res.ok) { var cp = res.clone(); caches.open(VERSION).then(function (c) { c.put(r, cp); }); } return res; })
      .catch(function () { return r.mode === 'navigate' ? caches.match('./index.html') : Response.error(); });
  }));
});
