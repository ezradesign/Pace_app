const CACHE_NAME = 'pace-v0.100.0';
/* s149: el export offline (PACE_standalone) SALE del precache. Es un export
   BAJO DEMANDA congelado a proposito (decision s134): estaba en v0.71.0 con la
   app en v0.81.0, asi que el SW metia un artefacto DIEZ versiones viejo en la
   cache de cada usuario, y ademas lo servia cache-first para siempre. No lo
   enlaza nadie desde la app (verificado: la unica referencia en runtime era
   esta fila). Quien lo tenga cacheado lo pierde solo: el cleanup del `activate`
   borra ENTERA la cache `pace-` de la version anterior.
   Su ruta NO se escribe literal aqui (regla s146: las rutas literales, ni en
   comentarios — hay scripts que leen este archivo por lineas). */
const PRECACHE = [
  '/app/glyphs/assets/ejercicios/90-90.min.webp',
  '/app/glyphs/assets/ejercicios/90-90.webp',
  '/app/glyphs/assets/ejercicios/abrir-y-cerrar-el-puno.min.webp',
  '/app/glyphs/assets/ejercicios/abrir-y-cerrar-el-puno.webp',
  '/app/glyphs/assets/ejercicios/apertura-con-banda.min.webp',
  '/app/glyphs/assets/ejercicios/apertura-con-banda.webp',
  '/app/glyphs/assets/ejercicios/apertura-de-costillas-respiracion.min.webp',
  '/app/glyphs/assets/ejercicios/apertura-de-costillas-respiracion.webp',
  '/app/glyphs/assets/ejercicios/apertura-de-pecho.min.webp',
  '/app/glyphs/assets/ejercicios/apertura-de-pecho.webp',
  '/app/glyphs/assets/ejercicios/apretar-gluteos.min.webp',
  '/app/glyphs/assets/ejercicios/apretar-gluteos.webp',
  '/app/glyphs/assets/ejercicios/circulos-de-hombro.min.webp',
  '/app/glyphs/assets/ejercicios/circulos-de-hombro.webp',
  '/app/glyphs/assets/ejercicios/circulos-de-muneca.min.webp',
  '/app/glyphs/assets/ejercicios/circulos-de-muneca.webp',
  '/app/glyphs/assets/ejercicios/circulos-de-tobillo.min.webp',
  '/app/glyphs/assets/ejercicios/circulos-de-tobillo.webp',
  '/app/glyphs/assets/ejercicios/cuello-y-trapecios.min.webp',
  '/app/glyphs/assets/ejercicios/cuello-y-trapecios.webp',
  '/app/glyphs/assets/ejercicios/deslizamientos-en-pared.min.webp',
  '/app/glyphs/assets/ejercicios/deslizamientos-en-pared.webp',
  '/app/glyphs/assets/ejercicios/elevacion-de-puntas.min.webp',
  '/app/glyphs/assets/ejercicios/elevacion-de-puntas.webp',
  '/app/glyphs/assets/ejercicios/elevacion-de-talones.min.webp',
  '/app/glyphs/assets/ejercicios/elevacion-de-talones.webp',
  '/app/glyphs/assets/ejercicios/encogimiento-de-hombros.min.webp',
  '/app/glyphs/assets/ejercicios/encogimiento-de-hombros.webp',
  '/app/glyphs/assets/ejercicios/escalenos.min.webp',
  '/app/glyphs/assets/ejercicios/escalenos.webp',
  '/app/glyphs/assets/ejercicios/estiramiento-de-muneca.min.webp',
  '/app/glyphs/assets/ejercicios/estiramiento-de-muneca.webp',
  '/app/glyphs/assets/ejercicios/extension-de-dedos.min.webp',
  '/app/glyphs/assets/ejercicios/extension-de-dedos.webp',
  '/app/glyphs/assets/ejercicios/extension-toracica.min.webp',
  '/app/glyphs/assets/ejercicios/extension-toracica.webp',
  '/app/glyphs/assets/ejercicios/flexiones-inclinadas.min.webp',
  '/app/glyphs/assets/ejercicios/flexiones-inclinadas.webp',
  '/app/glyphs/assets/ejercicios/flexor-de-cadera.min.webp',
  '/app/glyphs/assets/ejercicios/flexor-de-cadera.webp',
  '/app/glyphs/assets/ejercicios/fondos-en-silla.min.webp',
  '/app/glyphs/assets/ejercicios/fondos-en-silla.webp',
  '/app/glyphs/assets/ejercicios/gateo.min.webp',
  '/app/glyphs/assets/ejercicios/gateo.webp',
  '/app/glyphs/assets/ejercicios/gato-camello.min.webp',
  '/app/glyphs/assets/ejercicios/gato-camello.webp',
  '/app/glyphs/assets/ejercicios/giro-sentado.min.webp',
  '/app/glyphs/assets/ejercicios/giro-sentado.webp',
  '/app/glyphs/assets/ejercicios/hueco-abdominal.min.webp',
  '/app/glyphs/assets/ejercicios/hueco-abdominal.webp',
  '/app/glyphs/assets/ejercicios/hueco-en-silla.min.webp',
  '/app/glyphs/assets/ejercicios/hueco-en-silla.webp',
  '/app/glyphs/assets/ejercicios/juntar-omoplatos.min.webp',
  '/app/glyphs/assets/ejercicios/juntar-omoplatos.webp',
  '/app/glyphs/assets/ejercicios/marcha-del-elefante.min.webp',
  '/app/glyphs/assets/ejercicios/marcha-del-elefante.webp',
  '/app/glyphs/assets/ejercicios/palmas-al-suelo.min.webp',
  '/app/glyphs/assets/ejercicios/palmas-al-suelo.webp',
  '/app/glyphs/assets/ejercicios/paloma.min.webp',
  '/app/glyphs/assets/ejercicios/paloma.webp',
  '/app/glyphs/assets/ejercicios/plancha-lateral.min.webp',
  '/app/glyphs/assets/ejercicios/plancha-lateral.webp',
  '/app/glyphs/assets/ejercicios/plancha.min.webp',
  '/app/glyphs/assets/ejercicios/plancha.webp',
  '/app/glyphs/assets/ejercicios/pliegue-adelante.min.webp',
  '/app/glyphs/assets/ejercicios/pliegue-adelante.webp',
  '/app/glyphs/assets/ejercicios/puente-con-marcha.min.webp',
  '/app/glyphs/assets/ejercicios/puente-con-marcha.webp',
  '/app/glyphs/assets/ejercicios/puente-toracico.min.webp',
  '/app/glyphs/assets/ejercicios/puente-toracico.webp',
  '/app/glyphs/assets/ejercicios/reset-respiracion.min.webp',
  '/app/glyphs/assets/ejercicios/reset-respiracion.webp',
  '/app/glyphs/assets/ejercicios/rezo-invertido.min.webp',
  '/app/glyphs/assets/ejercicios/rezo-invertido.webp',
  '/app/glyphs/assets/ejercicios/rodar-hacia-abajo.min.webp',
  '/app/glyphs/assets/ejercicios/rodar-hacia-abajo.webp',
  '/app/glyphs/assets/ejercicios/rotacion-externa.min.webp',
  '/app/glyphs/assets/ejercicios/rotacion-externa.webp',
  '/app/glyphs/assets/ejercicios/rotacion-toracica.min.webp',
  '/app/glyphs/assets/ejercicios/rotacion-toracica.webp',
  '/app/glyphs/assets/ejercicios/sentadilla-a-silla.min.webp',
  '/app/glyphs/assets/ejercicios/sentadilla-a-silla.webp',
  '/app/glyphs/assets/ejercicios/sentadilla-de-cuadriceps.min.webp',
  '/app/glyphs/assets/ejercicios/sentadilla-de-cuadriceps.webp',
  '/app/glyphs/assets/ejercicios/silla-en-la-pared.min.webp',
  '/app/glyphs/assets/ejercicios/silla-en-la-pared.webp',
  '/app/glyphs/assets/ejercicios/superman.min.webp',
  '/app/glyphs/assets/ejercicios/superman.webp',
  '/app/glyphs/assets/ejercicios/suspension-activa.min.webp',
  '/app/glyphs/assets/ejercicios/suspension-activa.webp',
  '/app/glyphs/assets/ejercicios/suspension-pasiva.min.webp',
  '/app/glyphs/assets/ejercicios/suspension-pasiva.webp',
  '/app/glyphs/assets/ejercicios/zancada-profunda.min.webp',
  '/app/glyphs/assets/ejercicios/zancada-profunda.webp',
  '/',
  '/index.html',
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
  /* s138: loto de Respira (arte D-4). Mismo trato que las láminas: archivo en
     web + precache, data URI solo en el standalone. Es una MÁSCARA CSS -- si
     no está, el visual `flor` se queda sin dibujo (el fondo se recorta a nada),
     así que va en el precache y no bajo demanda. */
  '/app/breathe/assets/loto.webp',
  /* s146: glifos de logro del usuario, MASCARAS CSS.
     Mismo trato que el loto: archivo en web + precache, data URI solo en el
     standalone.
     ESTAS FILAS LAS REESCRIBE scripts/ingest-glifos-logro.js — no se editan a
     mano. El script localiza esta cabecera por su primera linea y avanza hasta
     el PRIMER cierre de comentario para saber donde insertar. s148: ese cierre
     faltaba, asi que la busqueda se pasaba de largo hasta el del bloque de
     fuentes de abajo y metia los glifos DEBAJO de el, dejando las fuentes sin
     cabecera. Si se toca este comentario, que siga cerrandose aqui. */
  '/app/glyphs/assets/logros/breathe.sessions.10.webp',
  '/app/glyphs/assets/logros/explore.478.webp',
  '/app/glyphs/assets/logros/explore.all.breathe.webp',
  '/app/glyphs/assets/logros/explore.all.move.webp',
  '/app/glyphs/assets/logros/explore.ancestral.webp',
  '/app/glyphs/assets/logros/explore.atg.webp',
  '/app/glyphs/assets/logros/explore.bhastrika.webp',
  '/app/glyphs/assets/logros/explore.coherent.webp',
  '/app/glyphs/assets/logros/explore.desk.webp',
  '/app/glyphs/assets/logros/explore.hips.webp',
  '/app/glyphs/assets/logros/explore.nadi.webp',
  '/app/glyphs/assets/logros/explore.neck.webp',
  '/app/glyphs/assets/logros/explore.physiological.webp',
  '/app/glyphs/assets/logros/explore.tweaks.webp',
  '/app/glyphs/assets/logros/explore.ujjayi.webp',
  '/app/glyphs/assets/logros/first.breath.webp',
  '/app/glyphs/assets/logros/first.cycle.webp',
  '/app/glyphs/assets/logros/first.day.webp',
  '/app/glyphs/assets/logros/first.extra.webp',
  '/app/glyphs/assets/logros/first.plan.webp',
  '/app/glyphs/assets/logros/first.return.webp',
  '/app/glyphs/assets/logros/first.ritual.webp',
  '/app/glyphs/assets/logros/first.sip.webp',
  '/app/glyphs/assets/logros/first.step.webp',
  '/app/glyphs/assets/logros/first.stretch.webp',
  '/app/glyphs/assets/logros/focus.hours.10.webp',
  '/app/glyphs/assets/logros/focus.hours.100.webp',
  '/app/glyphs/assets/logros/focus.hours.50.webp',
  '/app/glyphs/assets/logros/hydrate.week.perfect.webp',
  '/app/glyphs/assets/logros/master.ancestral.10.webp',
  '/app/glyphs/assets/logros/master.antidote.webp',
  '/app/glyphs/assets/logros/master.atg.20.webp',
  '/app/glyphs/assets/logros/master.centurion.webp',
  '/app/glyphs/assets/logros/master.coherent.15.webp',
  '/app/glyphs/assets/logros/master.collector.full.webp',
  '/app/glyphs/assets/logros/master.collector.half.webp',
  '/app/glyphs/assets/logros/master.dawn.webp',
  '/app/glyphs/assets/logros/master.dusk.webp',
  '/app/glyphs/assets/logros/master.extra.all.week.webp',
  '/app/glyphs/assets/logros/master.focus.day.webp',
  '/app/glyphs/assets/logros/master.gardener.webp',
  '/app/glyphs/assets/logros/master.hips.20.webp',
  '/app/glyphs/assets/logros/master.hydrate.30.webp',
  '/app/glyphs/assets/logros/master.hydrate.90.webp',
  '/app/glyphs/assets/logros/master.long.focus.webp',
  '/app/glyphs/assets/logros/master.marathon.webp',
  '/app/glyphs/assets/logros/master.midnight.never.webp',
  '/app/glyphs/assets/logros/master.path.all7.webp',
  '/app/glyphs/assets/logros/master.pomodoro.12.webp',
  '/app/glyphs/assets/logros/master.retreat.webp',
  '/app/glyphs/assets/logros/master.rounds.15.webp',
  '/app/glyphs/assets/logros/master.silent.day.webp',
  '/app/glyphs/assets/logros/morning.5.webp',
  '/app/glyphs/assets/logros/move.sessions.25.webp',
  '/app/glyphs/assets/logros/season.autumn.webp',
  '/app/glyphs/assets/logros/season.cycle.webp',
  '/app/glyphs/assets/logros/season.equinox.spring.webp',
  '/app/glyphs/assets/logros/season.four.webp',
  '/app/glyphs/assets/logros/season.solstice.summer.webp',
  '/app/glyphs/assets/logros/season.solstice.winter.webp',
  '/app/glyphs/assets/logros/season.spring.webp',
  '/app/glyphs/assets/logros/season.winter.webp',
  '/app/glyphs/assets/logros/secret.backup.webp',
  '/app/glyphs/assets/logros/secret.bilingual.webp',
  '/app/glyphs/assets/logros/secret.dark.mode.webp',
  '/app/glyphs/assets/logros/secret.lunch.webp',
  '/app/glyphs/assets/logros/secret.night.owl.webp',
  '/app/glyphs/assets/logros/secret.safety.read.webp',
  '/app/glyphs/assets/logros/secret.supporter.webp',
  '/app/glyphs/assets/logros/stats.month.first.webp',
  '/app/glyphs/assets/logros/stats.streak.30.webp',
  '/app/glyphs/assets/logros/stats.year.first.webp',
  '/app/glyphs/assets/logros/streak.100.webp',
  '/app/glyphs/assets/logros/streak.3.webp',
  '/app/glyphs/assets/logros/streak.30.webp',
  '/app/glyphs/assets/logros/streak.365.webp',
  '/app/glyphs/assets/logros/streak.60.webp',
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
