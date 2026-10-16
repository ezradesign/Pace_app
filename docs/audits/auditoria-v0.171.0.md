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
  `series-aprende` también está. Entre todas ocupan 3,3 GB. Se pueden borrar las 15, con el sí de Ez.
- **Documentos que ya no dicen lo mismo:** la tabla del reparto en `ROADMAP.md:87` dice «19,99 € una
  vez», pero desde el 15 oct. son dos planes (2,99 € al mes con 7 días, o 19,99 € de por vida, como
  ya dice la Fase 6 del mismo archivo); «32 rutinas gratuitas» y «19 premium» (`ROADMAP.md:90-91`)
  no cuentan Piernas de pie ni Espalda de pie (hoy hay 53: 20 de Respira, 15 de Mueve y 18 de
  Estira); y «22 dibujos pendientes» (`ROADMAP.md:169`) choca con los 21 de `STATE.md`, que ahora
  son 22 con «Rotación torácica de pie». Arreglo de texto, sin decisión.
- `privacy.html` sí cuenta el calendario (14 menciones).

## 10. Ideas útiles (primera lista, por orden de lo que acercan a v1)

| Idea | Qué cuesta | Por qué |
|---|---|---|
| Cabeceras de seguridad en la web (`_headers`) | poco, sin tocar la app | antes de cobrar, que la web no se pueda meter en un marco ni filtre de dónde vienes |
| Empezar la Fase 6 por lo que no espera a Ez: `/premium`, la lista «Avísame», la bienvenida con los dos precios y el `PurchaseAdapter` vacío | una o dos sesiones | lo grande que falta para v1 no tiene código; Stripe y k2 se enchufan después |
| Rutinas de pie para la tarde (el paseo corto que quedó fuera) | contenido + una prueba | con el aro a 10 o 15, la jornada llega a cuatro pausas sentadas seguidas |
| Decidir el final de «Dos horas» con el aro a 25 (hoy, un bloque de 55 min) | una pregunta a Ez y poco código | 55 min sin pausa contradice la promesa de la app |
| `paceFechaCorta` que no acepte cadenas sueltas | muy poco | que no aparezca el día anterior en Latinoamérica el día que alguien la llame mal |
| Los dibujos de logros y las voces del otro idioma, bajo demanda | medio | menos descarga en la primera visita; antes, medir en un móvil lento |
| Borrar las 15 carpetas de trabajo terminadas | nada, con el sí de Ez | ocupan disco y confunden al buscar |
| Arreglar las cifras viejas de `ROADMAP.md` | muy poco | que el plan diga lo mismo que STATE |

Lo que no es código y sigue esperando a Ez está en `STATE.md` («Espera a Ez»): probar el APK en un
móvil, la prueba cerrada de Play, las altas de Google y Microsoft para el calendario, el gestor y
Stripe, y las voces y los dibujos.

## Lo que queda de la auditoría (al reponerse el uso)

- Parte 3: una sesión que recorra la app real pantalla a pantalla, solo mirando (360 y 1280 px,
  castellano e inglés, claro y oscuro, la consola y lo básico de accesibilidad) y dé una lista.
- Parte 4: la sesión de Gemelos, que mira todas las rutinas.
- Luego, la página para Ez con todo, las opciones y una recomendación.

## 4. Lo que prometen las rutinas (hecho, 16 oct.)

`node scripts/audit/censo-promesas.js` lee las 33 rutinas de Mueve y Estira (157 pasos) y compara lo
que dice cada paso, en castellano y en inglés, con su ritmo, sus repeticiones, sus segundos y sus
lados. Salieron 11 hallazgos:

- **«Más lentas» que no lo eran: Gemelos subrepticios (el de Ez) y Sentadillas de silla.** La 2.ª
  ronda llevaba el mismo ritmo y menos repeticiones. Ez eligió (16 oct.) que lo sean: bajan en 3 s.
  Gemelos pasa a 1 + 2 min (declara 2), Sentadillas sigue en 3.
- **«Despacio» con una bajada de 1 s en Piernas de pie** (talones y puntas, la rutina nueva de las
  series). Ez eligió bajar en 2 s.
- Sin cambio: «10 reps» y «8 reps» en los pasos con reloj de «Escalera de empuje» y «Barbilla atrás 5
  veces» en un paso de 20 s. Son pasos con reloj (la opción A del runner guiado) y el número es una
  guía; caben en su tiempo.
- `tests/rutinas-promesas.spec.js` cae si vuelve a pasar: roja contra `main` con los cuatro casos,
  verde con el arreglo.

## 3. La app real (primera pasada, 16 oct.)

`scripts/audit/recorrido-app.js` abre el `index.html` compilado en 360×640, 360×800, 1280×800 y
1536×710, en castellano e inglés y en claro y oscuro, llega a cada pantalla y mira errores, botones
tapados (con `elementFromPoint`), scroll, texto cortado, castellano en inglés, botones sin nombre,
toques pequeños, contraste y emojis. A mano: la bienvenida, una sesión de Respira y su cierre en el
móvil (bien: «Sesión sin contar» con menos de medio minuto, como eligió Ez).

Visto a mano, para Ez:
- El sello de lo de pago dice «Premium» (`lib.premium`, `premium.seal`) y el cajón «Mis rutinas ·
  PREMIUM», mientras que lo de pago se llama «PACE completo» desde v0.157.0 y la sección se llama
  «Tus rutinas». No es un fallo: una pregunta de nombre.
- Los botones de la sesión llevan el icono dentro del nombre: el lector de pantalla dice «▶|
  Terminar». El icono debería ir oculto al lector.

Resultado del recorrido automático (16 oct., 4 tamaños × 2 idiomas × claro y oscuro, unas 250
pantallas; `scripts/audit/recorrido-app.js`):
- **Nada grave:** ningún error en la consola, ningún botón tapado ni cortado, ningún scroll de lado
  y la home del móvil sin scroll en ningún momento.
- **El gris `--ink-3` (#8A8372) en el modo claro** da 3,2:1 sobre `--paper` y 3,0:1 sobre `--paper-2`
  (la barra lateral). Es el color de casi todos los rótulos de 9 a 11 px: «BIBLIOTECAS», «HOY», «3
  SERIES · 12·10·8 REPS», los días de la semana, la versión del pie. WCAG AA pide 4,5:1. En oscuro da
  7,4:1. #6B6454 daría 5,0 y 4,6. Cambio visual: decide Ez.
- Rótulos en el color de un módulo por debajo de 4,5:1: «Premium» (3,6), «Empezar» en las tarjetas
  (3,4 a 4,0), las familias «Maestría» (2,5) y «Exploración» (2,8) en Logros, a 22 px.
- Toques pequeños en el móvil (WCAG 2.5.8 pide 24 px): los interruptores de Ajustes (32×18), los
  enlaces «Seguridad» y «Privacidad» (15 px de alto) y la fila del agua en el cajón (21 px).
- Falsos avisos que no cuentan: «Español» en el selector de idioma, y los contrastes de 1,2:1 que
  salían de fondos escritos como `color(srgb …)` (arreglado en el script).

## Lo que se hizo con lo encontrado (16 oct.)

- v0.171.1: las rondas «más lentas» y Piernas de pie; el lector no lee los símbolos.
- v0.171.2: el gris de los rótulos a #77705F (Ez eligió el punto intermedio), las cabeceras de
  seguridad (`_headers`, ya en pacegrass.app) y «Tus rutinas» en la barra lateral.
- v0.171.3: «Dos horas» con el aro a 25 (sesión aparte).
- v0.171.4: la zona de toque de Ajustes y la fecha corta; las cifras del ROADMAP al día.
- Las 14 carpetas de trabajo terminadas, borradas (3,3 GB).
- Sin hacer, por decisión de Ez: el sello sigue diciendo «Premium»; «Rana» espera a su dibujo; el
  contraste de las familias de Logros («Maestría» 2,5, «Exploración» 2,8) queda para otra vez.
