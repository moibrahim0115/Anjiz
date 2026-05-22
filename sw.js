const CACHE_NAME = 'anjiz-matrix-cache-v2';

// الملفات المحلية الأساسية الواجب تخزينها مسبقاً
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './login.html'
];

// 1. مرحلة التثبيت (Install): التخزين المسبق بطريقة مرنة (تمنع انهيار الكاش لو فُقد ملف)
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('ANJIZ: Pre-caching core assets...');
      for (const asset of PRECACHE_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn(`ANJIZ PWA Warning: Could not cache [${asset}]. Path might be incorrect.`, err);
        }
      }
    }).then(() => self.skipWaiting())
  );
});

// 2. مرحلة التفعيل (Activate): تنظيف إصدارات الكاش القديمة تلقائياً
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('ANJIZ: Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. مرحلة جلب البيانات (Fetch): استراتيجية Stale-While-Revalidate مع الكاش الديناميكي
self.addEventListener('fetch', (e) => {
  // تجاهل الطلبات التي لا تدعم بروتوكول http/https (مثل إضافات المتصفح Chrome Extensions)
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // إذا كان الملف مخزناً بالفعل (سواء محلي أو خارجي)، قم بعرضه فوراً لسرعة فائقة
      // وفي نفس الوقت، قم بتحديثه من الشبكة في الخلفية لضمان عمل أي تعديلات جديدة في المرة القادمة
      const networkFetch = fetch(e.request).then((networkResponse) => {
        // تأكد من أن الاستجابة ناجحة وصالحة للتخزين
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            // هنا السحر: يتم تخزين أي ملف خارجي (مثل خطوط جوجل وأيقونات FontAwesome) تلقائياً بمجرد جلبه
            cache.put(e.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {
        // فشلت الشبكة تماماً (المستخدم في وضع الأوفلاين)
        console.log('ANJIZ: Running completely offline for:', e.request.url);
      });

      return cachedResponse || networkFetch;
    })
  );
});
