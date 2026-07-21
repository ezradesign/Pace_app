const CACHE_NAME = 'pace-v0.58.0';
const PRECACHE = [
  '/',
  '/index.html',
  '/PACE_standalone.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-192-maskable.png',
  '/icons/icon-512-maskable.png',
  '/icons/apple-touch-icon.png',
  /* s104: láminas de Caminos (arte D-4) -- en la web viajan como archivo
     (el standalone las inlinea como data URI); precache = offline fiel. */
  '/app/paths/illustrations/assets/dawn.webp',
  '/app/paths/illustrations/assets/midday.webp',
  '/app/paths/illustrations/assets/afternoon.webp',
  '/app/paths/illustrations/assets/tea.webp',
  '/app/paths/illustrations/assets/dusk.webp',
  '/app/paths/illustrations/assets/weekend.webp',
  '/app/paths/illustrations/assets/breath.webp',
  /* s105: fuentes self-hosted (subset latin). En la web viajan como archivo
     (el standalone las inlinea como data URI); precache = offline fiel. */
  '/fonts/ebgaramond-400-italic.woff2',
  '/fonts/ebgaramond-500-italic.woff2',
  '/fonts/ebgaramond-400-normal.woff2',
  '/fonts/ebgaramond-500-normal.woff2',
  '/fonts/intertight-300-normal.woff2',
  '/fonts/intertight-400-normal.woff2',
  '/fonts/intertight-500-normal.woff2',
  '/fonts/intertight-600-normal.woff2',
  '/fonts/cormorantgaramond-400-italic.woff2',
  '/fonts/cormorantgaramond-500-italic.woff2',
  '/fonts/cormorantgaramond-400-normal.woff2',
  '/fonts/cormorantgaramond-500-normal.woff2'
];

/* s102 (PWA completa): el skipWaiting() incondicional del install se retiró.
   Con él, el SW nuevo activaba al instante y NUNCA existía un worker en
   waiting -> el update prompt era imposible. Ahora el worker nuevo queda en
   waiting hasta que la app lo acepte (mensaje SKIP_WAITING desde el
   UpdatePrompt) o hasta que se cierren todas las pestañas. Las navegaciones
   siguen network-first (s89), así que el HTML fresco llega igual sin esperar
   al SW; el prompt gobierna la activación del worker y su precache. */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

/* s89 (A-3 auditoria): borrar caches de versiones anteriores. Antes cada
   release dejaba un cache pace-vX.Y.Z huerfano ocupando storage del usuario
   para siempre. */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((k) => k.indexOf('pace-') === 0 && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* s102: click en la notificación de fin de Pomodoro -> enfocar la app (o
   abrirla si no hay ventana). La notificación se muestra desde la página
   (FocusTimer.support.jsx) vía registration.showNotification. */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ('focus' in c) return c.focus();
      }
      return clients.openWindow('/');
    })
  );
});

/* s89 (A-3 auditoria): navegaciones HTML pasan a network-first (con fallback
   a cache si no hay red) para que las actualizaciones lleguen sin esperar al
   re-chequeo del SW. El resto de assets sigue cache-first. */
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type !== 'opaque') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((cached) => cached || caches.match('/'))
        )
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
