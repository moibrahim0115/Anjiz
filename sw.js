const CACHE_NAME = 'anjiz-v1';
const ASSETS = [
  'index.html',
  'login.html',
  // أضف هنا مسارات ملفات الـ CSS أو الصور أو الأيقونات الخاصة بك
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});
