# Aviso del Foco en el PC y miniventana · dónde me quedo

19 nov. 2026, sobre la 0.211.0. Solo maqueta: no se ha tocado la app.

- **Página para Ez** (cuenta EcLj6): https://claude.ai/artifact/NUbh7w6PypKwdPqnjF2vDV
  (id `NUbh7w6PypKwdPqnjF2vDV`). Fuente: `index.html` en esta carpeta, con las dos fotos.
- **Prototipo**: `prototipo.html`. Abre la miniventana de verdad (Document Picture-in-Picture) en
  Chrome, Edge y Firefox 151+ de escritorio, y prueba el final: título «● Foco terminado · PACE»,
  icono terracota, campana y aviso con `requireInteraction` si hay permiso. En el navegador de la
  app de Claude no abre (`InvalidStateError`, va incrustado); en un Chrome de verdad no se ha probado.
- **Recomendado**: 1A · 1.2A · 2A · 2.2A. Espera a que Ez elija.

## Lo comprobado hoy en la 0.211.0

- `maybeNotifyFocusEnd` (FocusTimer.support.jsx): solo con la pestaña oculta, `silent`, sin
  `requireInteraction`: en Windows se va solo a los pocos segundos.
- Al acabar, `useTituloCuenta` devuelve el título a «PACE · Foco · Cuerpo — v…»: medido en el
  navegador, no dice que acabó. El icono no cambia nunca.
- `useCountdown` mira el final con un `setInterval` de 1 s: con la pestaña oculta más de 5 min,
  Chrome lo despierta una vez por minuto y la campana y el aviso llegan hasta un minuto tarde. El
  arreglo del prototipo es un único `setTimeout` a la hora del final (no encadenado, Chrome no lo frena).
- Con el permiso `denied`, Ajustes enseña el interruptor apagado y `settings.notify.blocked`, que
  no dice cómo desbloquearlo (foto `hoy-ajustes-bloqueado.jpg`).

## Si Ez elige, para montarlo

- 1A: `requireInteraction: true` en `maybeNotifyFocusEnd` (sigue `silent`, una sola campana);
  título de terminado en `FocusTimer.titulo.jsx` hasta volver a la pestaña; icono dibujado en un
  canvas (aro que avanza, punto terracota al acabar) y vuelta al PNG al volver; el `setTimeout` al
  final en `useCountdown`. Fila nueva en DECISIONES (supera en parte la de s102).
- 2A: `documentPictureInPicture.requestWindow` desde un clic, el aro pintado con `createRoot`
  dentro de la ventana, con su propio `setInterval` (es la ventana visible). El botón solo existe
  si `'documentPictureInPicture' in window`. Se cierra sola si se cierra o recarga la pestaña.

## Montaje de lo elegido (19 nov.): hecho

Ez eligió: «1a+ 1c + tres toques de campana / 1.2A + 2b + 2.2A aunque se abra sola es interesante».

Todo montado en esta rama, una letra por commit, cada una con su prueba vista caer antes del arreglo
(`tests/aviso-pc.spec.js`, 14 pruebas, puerto 8965, `--workers=1`) y `npm run verify` en verde:
- `d0e0a017` 1A: `requireInteraction` (sigue `silent`) y el final con un `setTimeout` a `endsAt` (useCountdown).
- `955f23e6` 1C: título «● Foco terminado · PACE» e icono (aro que se llena; terracota al acabar), solo si
  acabó sin mirarla y hasta volver (FocusTimer.titulo.jsx).
- `c8a21f75` Tres toques: `PACE_TOQUES_FIN_FOCO = 3` (Sound.jsx), din din din seguidos; el .wav del móvil no
  cambia. Si Ez quería que insista al minuto (la 1D), es otra cosa: dicho en la página.
- `5d5aa83b` 1.2A: la nota de Ajustes con los pasos de Chrome, Edge, Firefox o Safari (`paceNavegador`) y
  «la pestaña y la campana siguen avisando», es y en.
- `c5981143` 2B: la tira 300 × 84 (FocusTimer.mini.jsx, Document Picture-in-Picture), repintada con el reloj
  de su ventana; «Pausar»/«Continuar» mandan sobre el aro; terracota al acabar.
- `425b1c52` 2.2A: «Miniventana» junto a «Pausar», solo mientras corre un Foco, con la API y sin otra abierta.
- Fila nueva arriba en DECISIONES_TECNICAS_VIGENTES.md. Censo i18n 1295.
- Fotos a 1280, es y en, en `montado/`. Página republicada (versión 2) en NUbh7w6PypKwdPqnjF2vDV.

Sin bump, sin CHANGELOG ni STATE (lo hace la coordinadora al juntar) y sin la suite entera.

Lo que falta mirar a mano: en el Chrome de Ez, que el aviso se quede y que la miniventana se abra encima
de todo (en el navegador de la app de Claude no abre: va incrustado); oír los tres toques; Firefox 151.

Paso siguiente pequeño, sin montar: «Abrir la miniventana al empezar el Foco», un interruptor en Ajustes
(«Empezar foco» ya es el toque que pide el navegador). Unas dos horas.
