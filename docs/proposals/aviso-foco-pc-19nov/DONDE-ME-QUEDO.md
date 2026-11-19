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

## Montaje de lo elegido (19 nov., parado por uso al 98 %)

Ez eligió: «1a+ 1c + tres toques de campana / 1.2A + 2b + 2.2A aunque se abra sola es interesante».

Hecho en esta rama, cada uno con su prueba vista caer antes del arreglo (`tests/aviso-pc.spec.js`,
5 pruebas, puerto 8965, `--workers=1`) y `npm run verify` en verde:
- `d0e0a017` 1A: `requireInteraction` (sigue `silent`) y el final con un `setTimeout` a `endsAt` (useCountdown).
- `955f23e6` 1C: título «● Foco terminado · PACE» e icono (aro que se llena; terracota al acabar) hasta volver
  (FocusTimer.titulo.jsx; clave `focus.tab.done`; censo i18n 1286).
- `c8a21f75` Tres toques: `PACE_TOQUES_FIN_FOCO = 3` (Sound.jsx); el .wav del móvil no cambia.

Falta, en este orden:
1. 1.2A: nota de Ajustes con el permiso bloqueado por navegador (Chrome, Edge, Firefox, Safari) y «la
   pestaña y la campana siguen avisando», es y en (TweaksPanel.jsx ~347, `settings.notify.blocked`).
   Ojo: subir el censo i18n en `scripts/verify.integridad.js`.
2. 2B + 2.2A: la tira 300 × 84 con Document Picture-in-Picture, archivo nuevo (FocusTimer.jsx está a
   494 líneas: solo una línea para el hook y otra para el botón en la fila de «Pausar»). Repintar con
   `pipWindow.setInterval` (la pestaña oculta va frenada); «Pausar»/«Continuar» llaman a `handlePause`
   y `handleNormalStart`. Prueba: `documentPictureInPicture` falso que devuelve el `contentWindow` de
   un iframe. Dejar en la página «que se abra sola» como paso siguiente pequeño.
3. Fila en DECISIONES (aviso del PC: `requireInteraction`, el `setTimeout` del final, el «terminado»
   solo si no mirabas), fotos a 1280 en es y en, página republicada en NUbh7w6PypKwdPqnjF2vDV.
