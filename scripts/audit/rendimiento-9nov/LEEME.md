# Caza de rendimiento (9 nov.) · dónde me quedo

**Segunda tanda (cuenta EcLj6, 9 nov., tarde).** Hecho y subido a la rama:
- `7cc6b238` las cuatro barras con `transform` (`rellenoDeBarra`, ui/Primitives.jsx). Respira a 360 y CPU 4×: hilo ocupado
  2,44 → 2,16 s de cada 6 (mediana de cinco pasadas; los fotogramas lentos bailan con la carga del PC y no concluyen).
  Barra antes/después a 360 y 1280: solo el suavizado de los extremos (≤ 24/255). Prueba `tests/barras-transform.spec.js`.
- `301c2b4b` fuentes: los cinco woff2 son VARIABLES (tabla fvar) → una @font-face por familia y estilo con rango de pesos,
  0 píxeles distintos (1× y 2×, pesos 200-800, cursiva), 12 → 5 descargas, precache 272 → 265. Prueba `tests/fuentes-unicas.spec.js`.
- Página para Ez: https://claude.ai/artifact/4Fohyqi7Cth9iKGxE2FSSD (cuenta EcLj6): lo medido, lo arreglado y el aro A/B/C (B recomendada).
- Montaje en esta tanda: `git archive HEAD` a `<scratchpad>/antes` y `despues` (con los cambios encima), `node scripts/web-dist.js`
  en cada uno, y los bancos copiados a `<scratchpad>/banco/` (servidor.js sirve `../<nombre>/dist`).
Queda: el banco del paso de versión (sin empezar), el resultado de repetir `dia.js` y las propuestas de build (punto 5).

## La primera tanda

Parada al 89 % de la ventana de 5 h (resetea a las 21:00). Rama `claude/caza-rendimiento-9nov`.
Nada del producto tocado todavía. Los bancos, en `scripts/audit/rendimiento-9nov/` (WIP en la rama).
Montaje: `git archive 9ed68749` (0.194.0) y `git archive HEAD` (0.195.0) en el scratchpad, `node scripts/web-dist.js`
en cada uno, y `PORT=8910 node servidor.js v195` (imita Cloudflare: brotli, ETag, max-age=0; `/__version?to=v194`
cambia de versión; `/__red?lat=562&bps=180000` es Slow 4G en el servidor, que así frena también al SW).

## Medido (móvil 360×640, CPU 4×, Slow 4G)
- Primera visita: HTML entero 4,47 s (546 KB brotli), app montada 4,94 s, primera pintura 5,40 s, mayor pintura
  7,37 s (la lámina dawn.webp, 164 KB), se puede tocar 7,73 s. 1,62 MB en 39 peticiones antes del precache.
- Hilo principal en la primera visita (3,0 s ocupados): estilos 698 ms + maquetar 397 ms (la tarea de montar, 647 ms,
  con 542 ms de estilos/maquetado forzados dentro), scripts 494 ms en total (FocusTimer 50, react-dom 47), pintar 150.
- Vuelta con SW: primer byte 572 ms (navegación network-first = 1 RTT con 304), primera pintura 1,93 s, tocar 2,32 s.
- Precache: 272 archivos, 6,5 MB por la red (ejercicios grandes 2,1 MB, láminas 1,1, html 0,96 ('/' y '/index.html'
  bajan los dos), voz 0,6, fuentes 0,5, logros 0,47, ejercicios.min 0,44).
- FUENTES DUPLICADAS: 12 woff2 y solo 5 distintos (Inter Tight 300/400/500/600 = el mismo archivo; Cormorant y
  EB Garamond 400/500 iguales). El navegador baja cada nombre aparte (en la primera visita, 3× Inter y 2× Cormorant).
  Arreglo invisible: una @font-face por familia y estilo con `font-weight: 300 600` → mirar antes si el woff2 es
  variable (comparar anchos de texto a 300/400/600 antes y después; píxeles iguales).
- Respira (Suspiro, a 360, CPU 4×): 45 % del hilo ocupado, 31 fotogramas >33 ms y 17 tareas largas en 6 s. La barra de
  progreso anima `width 1s linear` (BreatheSession.jsx:484) → maquetar y pintar cada fotograma. Sin esa transición:
  2,82 → 2,24 s ocupados, 31 → 13 fotogramas malos, 17 → 6 tareas largas. El loto (mask + transform) va por la GPU.
- Home con Foco en marcha (360, CPU 4×): 76 % del hilo ocupado, media 28 ms por fotograma, 16 tareas largas en 6 s.
  Lo pagan `stroke-dashoffset 1s linear` del aro y `transform 1s linear` del punto en SVG (TimerDial.jsx:200, 203, 351):
  60 fotogramas por segundo para mover ~0,5 px por segundo en un bloque de 25 min. Sin ellas: 4,57 → 1,87 s.

## Qué toca (orden)
1. ARREGLO INVISIBLE: las barras `width 1s linear` → relleno a todo lo ancho con `transform: translateX((p-1)*100%)`
   (padre con overflow hidden; p acotado a [0,1]): BreatheSession.jsx:484, FocusTimer.parts.jsx:210, MoveModule.jsx:371,
   MoveSessionV1.cuerpo.jsx:270. Prueba: durante Respira no hay ninguna transición de `width` viva
   (`document.getAnimations()`), y la barra mide lo mismo (getBoundingClientRect del relleno visible). Mutante: volver una.
   La línea de «A tu ritmo» (ritmo.css.jsx:165, 900 ms cada ~16 s) no: su padre no recorta.
2. PARA EZ (cambia el movimiento): el aro con Foco. A = como ahora; B = sin deslizar cuando el paso por segundo es
   menor de 1 px (bloques largos: igual a la vista) y deslizando en los cortos (recomendada); C = a saltos siempre.
3. Banco del día: hasta las 15:00 nada crece (heap 4,2 → 5,6 MB tras GC, 1415 nodos, 8 intervalos, 245 escuchas fijas,
   0 escrituras y 0 cambios del DOM con la pestaña de fondo). En `dia.js` la pestaña SE CAYÓ («Target crashed») en
   el Foco de las 15:00 tras el salto de una hora; `caida.js` NO lo reproduce sin el instrumento (salto, salto oculta,
   con y sin Foco: heap estable 6-7 MB). Repetir `dia.js` para ver si es el instrumento. Falta actividad: tras el
   primer bloque, «Empezar foco» ya no está a la vista (mirar qué botón queda y pulsarlo cada hora).
4. Banco de la versión nueva (sin empezar): 0.194 instalada → servidor a v195 → ¿aviso estando ya en la nueva
   (navegación network-first)? ¿lo precacheado viejo se sirve primero (caches.match busca en todas)? Dos pestañas:
   «Actualizar» en una recarga la otra (controllerchange) a mitad de sesión. Una pestaña abierta todo el día no se
   entera nunca (sin `reg.update()` periódico).
5. Propuestas de build con su ganancia: minificar los scripts en línea (medir con @babel/core compact+sin comentarios),
   sacar el logo en base64 (103 KB) del HTML, precache de los ejercicios grandes al usarlos.
6. Al acabar: verify, suite de lo tocado con --workers=1 (PACE_E2E_PORT=8911), fila en DECISIONES, commit sin
   Co-Authored-By, push a la rama, y la página para Ez (<500 KB) con las letras.
