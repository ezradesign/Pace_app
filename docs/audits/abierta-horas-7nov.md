# PACE abierto toda la jornada · auditoría del 7 nov. 2026

Sobre `main` en v0.192.0 (6a75e948), probando el `index.html` compilado. Rama `claude/abierta-horas-7nov-a2419d`.
La pregunta: qué le pasa a quien deja PACE abierto ocho o diez horas, cierra el portátil al comer y lo usa
durante meses. Cada fallo se reprodujo dos veces (el banco y su prueba en rojo) antes de apuntarlo.

**Máquina:** Intel Core i7-12650H (10 núcleos, 16 hilos), 15,7 GB de RAM, Windows 11 Home; Chromium de
Playwright 1.62.1 sin cabeza, Node 24.15. Huso Europe/Madrid. Los bancos viven en el scratchpad de la sesión
(no se versionan): `jornada.js`, `sueno.js`, `anio.js` y `sw.js`.

## Lo que se arregló (tres fallos de código, cada uno con su prueba)

Las tres pruebas están en `tests/abierta-horas.spec.js`, salen en rojo contra v0.192.0 y cada mutante (quitar
su arreglo un momento) tumba solo la suya. Las tres reglas tienen su fila arriba del todo en
`DECISIONES_TECNICAS_VIGENTES.md`.

### A1 · El bloque que acaba con el portátil cerrado se apuntaba hasta la hora de volver · molesta

- **Dónde:** `ritmoBloqueTerminado` (`app/state-ritmo.recolocar.jsx`), llamado desde `FocusTimer.jsx` por `main.jsx`.
- **Pasos:** jornada de 9:00, «Empezar jornada» (bloque de 45 min), a las 9:20 se cierra el portátil y se abre a
  las 10:20. Igual cerrando PACE y abriéndolo a las 10:20.
- **Qué pasaba:** el bloque contaba una vez (bien), pero el día lo congelaba de 9:00 a 10:20, 80 minutos: la
  línea lo pintaba así y la cabecera del panel («7 h 35 min de foco») sumaba como foco el rato con la tapa
  cerrada. Con el último bloque del día pasaba lo mismo hasta la hora de volver (de 17:10 a 18:15, 65 min).
- **Qué debería pasar:** el bloque dura lo que duró (9:00-9:45) y lo de en medio es margen libre, que es como la
  línea ya pinta el hueco entre lo hecho y ahora. Ahora es así: `FocusTimer` pasa `finBloque`, el final que ya
  usaba para contar la pausa (`ritmoPausaEmpieza`), y el día se sigue recomponiendo desde la hora de volver.

### A2 · Las losetas de «A tu ritmo» no seguían la hora · molesta

- **Dónde:** `RitmoTarjeta` y `RitmoHome` (`app/ritmo/`): sin día elegido, cada opción se compone desde
  `ritmoAhora()` al pintar, y nada repintaba la home si el estado no cambiaba.
- **Pasos:** con tu semana guardada, abrir PACE a las 8:00 y no tocarlo.
- **Qué pasaba:** a las 12:00 seguía ofreciendo «Una hora · Hasta las 9:00», «Dos horas · Hasta las 10:00» y
  «Media jornada · De 8:00 a 12:00» (foto en el banco). Al pulsar, el día salía bien, desde ahora: lo falso era
  lo que se leía.
- **Ahora:** `usePaceMinuto()` (`app/state-core.dia.js`) repinta cada minuto con la página a la vista y al volver
  al frente, desde el mismo vigilante que ya cambia el día.

### A3 · Sin poder guardar, la medianoche tiraba lo hecho por la tarde · bloquea (pierde datos)

- **Dónde:** `ensureDayFresh(true)` (`app/state-core.jsx`), que relevaba el día desde lo guardado.
- **Pasos:** el navegador deja de poder guardar (lleno; PACE ya enseña la barra «Este navegador no deja
  guardar»), se beben tres vasos a las 23:30 y pasa la medianoche con PACE a la vista.
- **Qué pasaba:** el día de ayer se archivaba desde lo guardado, la copia de antes del primer fallo: los tres
  vasos desaparecían también de la memoria, así que ni «Exportar una copia» los salvaba ya.
- **Ahora:** si la última escritura falló, el cambio de día parte de la memoria. Lo que ya había guardado no se
  toca nunca: `persistState` no escribe nada cuando falla y `loadState` sigue sin volver al estado de fábrica.

## Para Ez (cambia lo que hace o lo que se ve)

### E1 · Elegido el día y sin empezar, el plan se queda en la hora de elegir · molesta

Elegir «Jornada entera» a las 8:00 y volver a las 11:00 sin haber empezado: el aro dice «Bloque 1 de 11»,
la barra lateral «Siguiente pausa: A las 8:45» y el panel «7 h 40 min de foco · 9 pausas», todo en el
pasado. Al pulsar «Empezar jornada» el día se recoloca bien. **Recomendación:** mientras no se ha empezado
nada, que el día elegido se recomponga desde ahora, como ya hace la propuesta de tu semana. Cambia lo que
enseña la línea, por eso no lo toco.

### Para la sesión del cierre y la ventana de la pausa (no lo toco: es `app/breakmenu/*`)

- **V1 · La ventana de la pausa sale horas después diciendo una hora vieja · molesta.** Con la pestaña
  oculta desde las 8:10 (los temporizadores frenados), el bloque termina a las 8:45 y la ventana no sale hasta
  volver al frente a las 12:10, y entonces dice «8:45 · Lo que toca ahora.» con «Hacer la pausa» y «Seguir con
  el bloque 2», mientras el aro dice «Pausa terminada». Igual con el portátil cerrado de 9:20 a 10:20: el aro
  dice «Pausa terminada» y la ventana ofrece la pausa. **Recomendación:** si la pausa entera ya pasó al volver,
  no abrir la ventana sola, o que diga la hora de verdad.
- **V2 · El último bloque con la tapa cerrada hasta pasada la salida.** De 17:30 a 18:15: el bloque cuenta
  una vez, el aro queda en «Foco manual · Ciclo completado» con «Empezar otro ciclo» y la ventana abre el
  cierre «Tu pausa». La duración del bloque ya sale bien con A1; lo demás es del cierre de la jornada.

## Lo que se midió y salió bien

### Una jornada entera abierta (8:00-18:00, comida 14:00)

Doce bloques de 45 min con sus pausas, el reloj adelantado a saltos (`page.clock`), midiendo tras cada bloque
y cada pausa con el recolector de basura pasado (CDP `HeapProfiler.collectGarbage` y `Memory.getDOMCounters`).

| | al abrir | tras 12 bloques | máximo en el día |
|---|---|---|---|
| Nodos del DOM | 1.566 | 1.226 | 1.659 (con la ventana de la pausa abierta) |
| Oyentes JS | 246 | 226 | 267 |
| Heap JS usado | 4,4 MB | 6,3 MB | 6,9 MB |
| `setInterval` vivos | 6 | 6 | 7 (el tic del aro) |
| `setTimeout` vivos | 9 (arranque) | 0-2 | 3 |
| `pace.state.v2` | 1,7 KB | 6,5 KB | |

Nada crece de un ciclo a otro: los nodos y los oyentes suben al abrir la ventana y vuelven al cerrarla, y el
heap se queda entre 6,1 y 6,6 MB desde el tercer bloque. **Deriva de la cuenta atrás: cero**: a mitad de cada
bloque el aro pinta exactamente lo que queda (22:30 con 1.350 s), porque se deriva de `endsAt`.

### Pestaña de fondo, portátil cerrado, salida y medianoche

| Caso | Al volver | ¿Verdad? |
|---|---|---|
| Portátil cerrado 1 h a mitad de bloque | bloque contado una vez (un evento, 45 min), pausa ya pasada | sí, salvo A1 (arreglado) y V1 |
| Portátil cerrado 1 h a mitad de pausa | «Bloque 2 · Pausa terminada», nada contado de más | sí |
| Pestaña oculta 4 h (temporizadores a uno por minuto) | bloque contado a su hora (8:45), un evento | sí, salvo V1 |
| Tapa cerrada hasta pasada la salida | bloque contado una vez | ver V2 |
| Tapa cerrada de 23:40 a 0:20 con un bloque que acababa a las 23:45 | no cuenta (la A de Ez del 12 oct.), el día de ayer se resume (`ritmo.day.closed`) | sí, es la regla |
| Foco por libre de 23:30 que acababa a las 23:55, tapa cerrada hasta las 0:20 | no cuenta, el aro vuelve a empezar | sí, es la regla |

Ningún bloque se contó dos veces ni salió una pausa fantasma en el aro. Sin errores de consola en ningún caso.

### Un año de uso

364 días simulados con las funciones de la app (días laborables con «Jornada entera», seis focos de 45 min,
Mueve, Estira, Respira, seis vasos y «¿te ayudó?»), esperando cada día a que los eventos se escriban, y luego
cinco arranques en frío sin reloj falso con ese almacenamiento.

| | medido |
|---|---|
| Hasta ver la home (cinco arranques) | 226, 239, 333, 360 y 400 ms (`DOMContentLoaded` a 74-149 ms) |
| `pace.state.v2` | 45,7 KB (el historial, 38,7 KB para 363 días: unos 107 bytes por día; lejos de los ~5 MB de `localStorage`) |
| `pace.events.v1` en IndexedDB | 415,7 KB y 873 eventos, con 2.573 sesiones, 572 respuestas y 47 días ya consolidados en los totales |
| Uso del origen (`navigator.storage.estimate`) | 7,9 MB, casi todo la caché del service worker |
| Estadísticas: abrir / Año / «Qué te ayuda» | 79 ms / ~375 ms / ~56 ms, sin errores; las cifras del año cuadran (1.395 h de foco = 310 días × 6 × 45 min) |

**Una nota sin fallo:** con este uso intenso el registro llega al tope de 500 KB antes de los 120 días de
retención y poda por presupuesto (conserva unos 80 días de detalle). Los totales no se pierden: se consolidan
en `baseline`, y «Qué te ayuda» lee los contadores del estado. Si un día hace falta más detalle, el tope es
`EVENTS_BUDGET_BYTES`.

**QuotaExceeded:** con `localStorage` lleno, lo ya guardado no se toca (`persistState` no escribe y `loadState`
no vuelve al estado de fábrica) y la barra lo avisa una vez; el único camino que perdía datos era A3.

### Sin red y con un service worker viejo

**Sin medir todavía** (ver «Dónde me quedé»). Lo que dice el código de `sw.js`, sin reproducir y por eso sin
apuntarlo como fallo: el HTML va primero a la red y el resto primero a la caché, y `caches.match` busca en todas
las cachés. Con una versión nueva publicada y el service worker viejo aún al mando (hasta pulsar «Hay una
versión nueva» o cerrar todas las pestañas), el HTML nuevo puede convivir con un dibujo viejo del mismo nombre.
El código de la app no se mezcla, porque va entero dentro de `index.html`. El banco que lo comprueba está
escrito (`sw.js` en el scratchpad: v1 y v2 de `dist/` servidas por turnos en el 8880, con un dibujo cambiado).

## Dónde me quedé (7 nov., cuenta al 90 % de las 5 h)

- Hecho y en el commit: los tres arreglos, sus pruebas (5 en verde con el arreglo; rojas contra v0.192.0;
  los tres mutantes, rojos) y las tres filas de DECISIONES.
- `npm run verify`: pasa, 0 problemas.
- Las pruebas vecinas (`hora-y-medianoche`, `cambio-de-dia`, `estado-no-guarda`, `ritmo-pausa*`, `ritmo-juntos`,
  `ritmo-larga-sin-sitio`, `aro-jornada`, `ritmo-reloj`, `pestanas-estado`, `inicio-modulos`, `ritmo-aviso`,
  `cambio-de-hora`, `ritmo` y la nueva) en el 8880: 97 de 99 en una pasada de 9,6 min con el PC cargado por
  otras sesiones. Las dos que cayeron (`ritmo-aviso.spec.js:95` y `ritmo-pausa.spec.js:106`) pasan solas; repetidas
  tres veces cayeron 4 de 6 en una pasada lenta (5,2 min) y pasaron 6 de 6 en otra normal (1,2 min); con el
  `index.html` de v0.192.0, 6 de 6 (1,1 min). Lo leo como carga y no como el arreglo, pero **no está
  demostrado**: que la coordinadora lo mire al pasar la suite entera.
- Falta: el banco del service worker sin red.

## Lo que no se cubre

- El freno real de Chromium a una pestaña oculta se imita con `page.clock` (temporizadores una vez por minuto)
  y `visibilitychange`; el sueño del sistema, con `fastForward`, que corre una sola vez lo vencido. No se probó
  en un portátil de verdad ni en Safari.
- La memoria se midió en una jornada (doce bloques), no en una semana sin recargar.
- La suite entera no se pasó: la pasa la coordinadora al juntar.
