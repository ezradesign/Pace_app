# La octava pasada externa (la red de seguridad: pruebas, `verify` y CI), comprobada punto a punto

Contra `main` (v0.199.0, 99f53694), el 11 nov. de 2026, leyendo código y con el CI de la rama
`claude/octava-11nov-418170`. El texto entero, en `externa-octava-11nov.md`. Lo que la pasada «supone» se
ha mirado en el código; lo que solo se sabe ejecutándolo en una fecha o un móvil concretos va marcado.

**Cuenta:** 28 hallazgos. **20 ciertos** (uno, el nº 18, ya era la pregunta O1), **6 a medias** (nº 4, 5,
7, 13, 14 y 28) y **2 falsos** (nº 8 y 15). Las cinco preguntas, contestadas por
Ez el 11 nov. (O1 a O5, todas la A).

**Lo más grave, por orden:**
1. **nº 13, a medias:** el aviso de la apnea **sale** en todas las entradas que lo necesitan (leído:
   biblioteca, barra, «Continúa» y Caminos), pero **ninguna prueba falla si deja de salir**. Es la prueba 1.
2. **nº 22, cierto:** `android.yml` firma el AAB y lo deja en el borrador de la versión con cada push a
   `main`, sin esperar al CI. Es la O4.
3. **nº 1 y nº 3, ciertos:** la regla de relojes de `verify` solo ve un caso de los que fallan de noche, y
   el CI nunca corre a las horas en que esos fallos salen.
4. **nº 18, cierto:** `pasoV1.hasta` se alarga editando una copia (O1).

## (a) Hora, día, idioma, huso

- **nº 1** La regla de relojes es estrecha · **cierto**: `scripts/verify.pruebas.js:21-23` y `:50-57` solo
  fallan si el mismo archivo tiene `clock.install()` vacío **y** `new Date().getDay|getDate|toDateString()`.
  Hay 43 `clock.install()` sin hora en 30+ archivos de `tests/` y la regla no ve `Date.now()`,
  `getMonth()` ni `toISOString()`.
- **nº 2** respira-5, 6 y 12 a la hora real · **cierto**: `tests/caza-respira.spec.js:30`, `:52` y `:120`
  instalan el reloj sin hora; respira-5 adelanta hasta 200 s (`:38`). Que de verdad cambie algo entre las
  23:56 y las 24:00 **no se ha comprobado** (pide correrla a esa hora).
- **nº 3** El CI sin horas fijas · **cierto**: `.github/workflows/ci.yml`, bloque `on:` (push, pull_request
  y workflow_dispatch). Sin `schedule`.
- **nº 4** v1 sin reloj y la línea de los lunes · **a medias**: `tests/caza-v1-compra.spec.js:29` apaga la
  bandera y `:62`, `:87`, `:103` usan `Date.now()` sin reloj. La línea de los lunes solo sale en v1 y sin
  PACE completo (`tests/lunes.spec.js:3-12`), así que el riesgo existe; que alguna prueba caiga un lunes
  **no se ha comprobado** (se sabrá el lunes 16, o pasando la suite con el reloj en lunes).
- **nº 5** Solo Madrid · **a medias**: `playwright.config.js` fija `Europe/Madrid`, pero
  `tests/fecha-corta-huso.spec.js` ya prueba `America/Mexico_City`. No hay ninguna de Asia ni de noche en
  América con vaso, Foco y sesión.

## (b) Asertos que no pueden fallar

- **nº 6** `estado-saneado`, «weeklyStats roto» · **cierto**: `tests/estado-saneado.spec.js:59-61` espera
  200 ms y exige 4321, el valor de la semilla.
- **nº 7** `eventos-backup`, «sección corrupta» · **a medias**: la primera duda es **falsa** (la app no mira
  el campo `version` de la copia: no sale en `app/tweaks/TweaksData.importar.jsx`; lo que rechaza es
  `schemaVersion` 99, `app/events/events-model.js:443`, que es justo la sección «corrupta»). La segunda es
  **cierta y menor**: `tests/eventos-backup.spec.js:148-155` lee el estado en cuanto sale el error y no
  vuelve a mirar.
- **nº 8** `importar-borrar`, «si el navegador no deja borrar» · **falso**: borrar no espera 900 ms.
  `app/tweaks/TweaksPanel.jsx:122-124` recarga o avisa en la misma llamada, en ramas que se excluyen: si
  sale el aviso (`tests/importar-borrar.spec.js:137`), ya no puede venir la recarga.
- **nº 9** «el mensual no se vende sin dónde cancelarlo» · **cierto**: `tests/caza-v1-compra.spec.js:118`,
  `if (t.mes)`; hoy no aserta nada.
- **nº 10** `lunes`, «un martes no sale» · **cierto, leve**: `tests/lunes.spec.js:109-114` aserta
  `toHaveCount(0)` en el cajón sin el `runFor(600)` que sí lleva la del lunes (`:70`).
- **nº 11** `compra-tienda`, «ya tiene PACE completo» · **cierto**: `tests/compra-tienda.spec.js:155-167`
  solo compara funciones; no abre ninguna pantalla.
- **nº 12** Saltos en silencio · **cierto**: nada en `verify` prohíbe `.skip(`/`.fixme(` ni vigila que el
  número de pruebas no baje. Hoy hay uno, a propósito: `tests/ios-nativo.safari.spec.js:276`.

## (c) Promesas sin defensa

- **nº 13** El aviso de la apnea · **a medias**: en el producto está bien, en las pruebas no.
  `app/main.jsx:126-135` pasa por el aviso toda rutina con `safety` (biblioteca, barra por
  `app/main/main.eventos.jsx:50-56`, y «Continúa»); los Caminos tienen su puerta en
  `app/paths/steps/PathBreatheStep.jsx:19-35`; la pausa y «A tu ritmo» no proponen rutinas con aviso
  (`app/breakmenu/BreakMenu.support.jsx:139`). El aviso no se recuerda: la casilla es estado local
  (`app/breathe/BreatheLibrary.jsx:193-198`), así que ya se acepta cada vez (O5 A). Lo cierto: el
  `abrirRespira` de `tests/caza-sesiones.spec.js:56-60` lo acepta solo «si sale», y ninguna prueba mira el
  botón apagado, Escape e Intro ni las entradas una a una.
- **nº 14** Almacenamiento lleno · **a medias**: `tests/estado-no-guarda.spec.js:21-22` solo hace fallar
  `pace.state.v2`. La escritura que cita, `pace.aro.carta.v1`, **sí** va protegida
  (`app/main/home-geometry.horario.js:65`); el resto se comprueba con la prueba 2.
- **nº 15** Copias antiguas sin marcas · **falso**: una copia sin `_weeklyStatsReindexed_v0_28_8` es, por
  definición, de antes de la v0.28.8 (todas las de después la llevan, `app/state-core.jsx:222` y `:265`), y
  su semana está en el orden viejo: reindexarla al leer (`app/state-core.jsx:322-325`) es lo correcto.
- **nº 16** La home sin scroll · **cierto**: `tests/home-sin-scroll.spec.js:82-83` mide solo el cuerpo de
  la home; `:58-59` abre el contexto inglés con `locale: 'es-ES'` (la app va en inglés por la semilla
  `lang`, pero el navegador no). La letra grande de Android no se prueba (O2).
- **nº 17** La landing delante · **cierto**: `tests/landing-cara.spec.js:116` dispara `pagehide`, `blur` y
  `visibilitychange`; no cambia el tamaño ni pulsa el idioma.
- **nº 18** La semana de prueba editable · **cierto**: `app/state-paso-v1.js:152` y `:158` se fían de
  `hasta` tal cual. Ez: O1 A (topar a siete días desde `at`).
- **nº 19** «Nada tapa nada» · **cierto, leve**: hay casos sueltos y ningún barrido general.

## (d) Frágil con la máquina cargada

- **nº 20** `asentarGeometria` · **cierto**: `tests/home.helpers.js:167` sale a los 90 fotogramas sin
  decir si convergió; `tests/home-sin-scroll.spec.js:66` y `:80` la usan con el reloj instalado.
- **nº 21** Esperas fijas antes de una ausencia · **cierto**: `tests/caza-v1-compra.spec.js:53`
  (2500 ms) y `tests/compra-tienda.spec.js:149` (700 ms).

## (e) CI frente a local

- **nº 22** El AAB firmado sin esperar al CI · **cierto**: `.github/workflows/android.yml:23-26` (push a
  `main`) y `:102-118` (borrador de la versión). Ez: O4 A.
- **nº 23** Las pruebas sirven la raíz, no `dist/` · **cierto**: ninguna prueba abre `dist/`.
- **nº 24** Frescura de `index.html` solo en el YAML · **cierto**: en local, `tests/servidor-propio.setup.js`
  mira que el servidor sea el de esta carpeta, no que `index.html` sea el build.
- **nº 25** `verify.web` se salta `index.html` · **cierto**: `scripts/verify.web.js:102`.
- **nº 26** `verify.privacidad` mira solo /premium · **cierto**: `scripts/verify.privacidad.js:13`; las
  piezas del calendario se buscan en texto con comentarios.
- **nº 27** `verify.licencia` solo ve PEM · **cierto**: `scripts/verify.licencia.js:33` y `:53`; un
  `.p8`, `.p12` o `.jks` no está en `TEXTO` y pasa.
- **nº 28** Sintaxis moderna · **a medias**: el build **sí** rebaja la sintaxis
  (`build-standalone.js:57-58`, Chrome 90 y Safari 14.1), pero la app usa CSS más nuevo que eso:
  `color-mix()` en 15 archivos (Chrome 111, Safari 16.2), `:has()`, `@container`, `dvh`. Nada une esas
  cifras con lo que se dice soportar. Es la O3.

## Lo que NO se ha podido comprobar aquí

- nº 2 y nº 4: si de verdad cae algo a las 23:56 o un lunes (pide correr la suite a esa hora o ese día).
- nº 16, la letra del sistema: cómo la escala el WebView de un móvil real (aquí se emula).
- nº 22: que el AAB llegue al borrador tras un CI verde solo se ve con un push a `main`.
