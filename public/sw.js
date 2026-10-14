// خدمة بسيطة: تخزّن الملفات الثابتة وتعرض آخر نسخة عند انقطاع الشبكة. لا تلمس /api.
const CACHE = 'halba-v1';
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api') || url.pathname.startsWith('/auth') || url.pathname.startsWith('/admin')) return;
  e.respondWith(
    fetch(req).then((res) => {
      if (res.ok && (url.pathname.startsWith('/_next/static') || url.pathname.startsWith('/media') || url.pathname.startsWith('/icon') || req.mode === 'navigate')) {
        const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match(req).then((r) => r || caches.match('/play'))),
  );
});
