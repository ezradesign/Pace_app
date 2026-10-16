# Auditoría completa de PACE en v0.171.0

Pedida por Ez el 16 oct. 2026: «cómo vamos, qué fallos hay, qué queda pendiente y qué
implementaciones útiles se le pueden hacer; sé muy meticuloso». Este archivo es el cuaderno de
trabajo: se va llenando por partes y se puede retomar desde otra cuenta. Lo que Ez lee al final es
una página con lo encontrado, las opciones y una recomendación.

## Cómo se reparte

| Parte | Quién | Estado |
|---|---|---|
| 1. Reglas de código de CLAUDE.md y `verify` | coordinadora | hecho |
| 2. Lo que falta hasta v1 (ROADMAP, STATE) | coordinadora | primera pasada |
| 3. La app real, pantalla a pantalla (360 y 1280 px, castellano e inglés, claro y oscuro, consola) | una sesión, solo mira | sin empezar |
| 4. Lo que prometen las rutinas frente a su ritmo (Gemelos y el resto) | la sesión de Gemelos (Ez, 16 oct.) | sin empezar |
| 5. Datos y lo guardado: migraciones, saneador, copia e importación, cuota llena, dos pestañas | coordinadora | primera pasada |
| 6. Seguridad y privacidad: licencia, `privacy.html` frente a lo que hace la app, cabeceras, alertas de Dependabot | coordinadora | primera pasada |
| 7. Rendimiento y carga: tamaño de `index.html`, service worker, primera carga en móvil | coordinadora | primera pasada |
| 8. Accesibilidad: teclado, foco, lector de pantalla, contraste, movimiento reducido | dentro de la parte 3 | sin empezar |
| 9. Repo y proceso: worktrees y ramas viejas, CI, documentos que se contradicen | coordinadora | primera pasada |
| 10. Ideas útiles, con su coste y lo que sacarían de v1 (regla «ninguna fase entra sin sacar otra») | coordinadora, al final | sin empezar |

## 1. Reglas de código y `verify` (hecho)

- `npm run verify` pasa: 0 problemas y 1 aviso (el de siempre: restaura `PACE_standalone.html` tras el build). Ya vigila la sintaxis, el build
  reproducible, que no haya huérfanos, la paridad ES/EN (895 claves), los logros y sus detectores,
  las máscaras y el precache, los eventos sin red, Android e iOS, ningún archivo de más de 500
  líneas, el lienzo, las llaves, la autoría y la versión en sus siete sitios.
- Lo que `verify` no mira, buscado a mano: ningún `type="module"`; ningún objeto de estilos llamado
  `styles` (el de `TimerDial.jsx:37` es una variable local de `getComputedStyle`); todo
  `playSound()` va en `try`; un solo `console.log` en `app/`.
- `new Date(fecha)` en `paceFechaCorta` (`app/i18n/useT.jsx:58`): sería el fallo de la medianoche UTC
  (en Latinoamérica, el día anterior), pero sus cuatro llamadas le pasan un `Date` o una cadena con
  hora local (`iso + 'T00:00:00'` en `PathStats.jsx:34`). Hoy no falla. Idea: que acepte solo `Date`
  o use `parseLocalDateKey()`, para que no falle mañana. Importa más con la ficha de Play en
  español de Latinoamérica.

## 2. Lo que falta hasta v1 (primera pasada)

- **Fase 2, Android:** todo hecho en código. Falta probar el APK en un móvil real (Ez) y abrir la
  prueba cerrada en Play Console (unos 12 testers durante 14 días; Ez tiene 5 o 6).
- **Fase 3, «A tu ritmo» semanal (lo que se paga):** las series y la capa 1 de «PACE que aprende»
  están en v0.171.0, gratis. El motor de la semana y la carta del lunes esperan a tener semanas de
  datos (`ritmo.day.closed` se guarda desde v0.149.0).
- **Fase 4, Estadísticas:** hecha (v0.160.0 y v0.170.0). «Qué te ayuda» espera al motor de la
  semana.
- **Fase 5:** cerrada tal como está; los dibujos entran si llegan.
- **Fase 6, venta:** es lo grande que falta y no tiene nada de código: k2, la función de Cloudflare
  que firma, Stripe, gracias y `/recuperar`, la renovación del mensual, Play Billing con su
  `PurchaseAdapter`, la bienvenida con los dos precios, `/premium`, «Avísame», el aviso antes del
  cobro, la valoración de Play, `privacy.html` y la revisión legal. Depende de Ez: gestor, cuenta
  de Stripe, Cloudflare y los datos del aviso legal.

## 5. Datos y lo guardado (primera pasada)

- `persistState` (`app/state-core.jsx:391`): si el navegador no deja guardar (lleno o bloqueado),
  la app lo dice (`AvisoNoGuarda`), no lo calla.
- Lo que crece está acotado o crece despacio: las fechas de logros guardan 30, las de agua 14,
  `history.days` una fila por día (unos 30 KB al año), `ritmo.servidos` siete días. Los eventos van a
  IndexedDB, con su copia en «Tus datos».
- Los pases del calendario (Google y Microsoft) viven en `sessionStorage` y se olvidan al cerrar la
  pestaña.
- Falta mirar a mano: importar una copia vieja (de antes de v0.149.0) sobre una instalación nueva, y
  qué pasa con la cuota llena en Android.

## 6. Seguridad y privacidad (primera pasada)

- La app solo habla con `googleapis.com`, `accounts.google.com`, `login.microsoftonline.com` y
  `graph.microsoft.com` (el calendario, si se conecta), con `buymeacoffee.com` (un enlace, no en
  Android) y con `pacegrass.app`. `fetch` solo en el calendario y para cargar la voz y la música
  propias. `verify` prohíbe la red en `app/events/`.
- Ninguna llave privada en el repo; la licencia se comprueba sin servidor con la llave pública.
- Dependabot: 0 alertas abiertas.
- **No hay cabeceras de seguridad en la web** (ningún `_headers` de Cloudflare Pages): ni
  `X-Content-Type-Options`, ni `Referrer-Policy`, ni `Permissions-Policy`, ni `frame-ancestors`
  (que otra web no pueda meter PACE en un marco). Son baratas y no tocan la app. Una política de
  contenido (CSP) completa costaría más, porque el build mete los scripts en línea (haría falta su
  huella). Recomendable antes de cobrar, cuando la web guarde una licencia de pago.

## 7. Rendimiento y carga (primera pasada)

- `index.html` pesa 1,79 MB, 518 KB comprimido: React de producción y todo el JS compilado dentro,
  sin Babel en el navegador. El service worker precarga 236 archivos: unos 3 MB de dibujos `.webp`
  y 0,6 MB de voces en la primera visita.
- Idea: que los dibujos de logros y las voces en el otro idioma se descarguen cuando hagan falta, no
  en la primera visita. Primero medir la primera carga en un móvil lento.

## 9. Repo y proceso (primera pasada)

- CI de `main`: 26 en verde de las 30 últimas, 1 caída (v0.169.0, una prueba que dependía de la
  velocidad, ya arreglada) y 3 canceladas porque llegó otra detrás.
- Hay 15 carpetas en `.claude/worktrees/` y, con v0.171.0 en `main`, ninguna guarda trabajo sin
  juntar: `caza-foco-estado` y `claude/tus-rutinas-arreglos` salen con 400 commits «de más» porque
  son de antes de reescribir la historia (sus mensajes están en `main` con otro número), y lo de
  `series-aprende` también está. Se pueden borrar las 15, con el sí de Ez.
