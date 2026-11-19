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
