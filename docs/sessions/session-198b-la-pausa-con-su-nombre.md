# s198 (bis) · La pausa te llama por su nombre (v0.133.0)

**Fecha:** 2026-10-04 · **Versión publicada:** v0.133.0 · **Suite:** 316 → **320**

> Sigue a [session-198](./session-198-saneamiento.md), que publicó v0.131.0 y v0.132.0 (con dos commits
> separados y push). A «¿por dónde seguimos?» el usuario pidió una página
> ([`por-donde-seguir-s198.html`](../proposals/por-donde-seguir-s198.html)); con ella delante dijo «no sé por
> dónde seguir», se le dio una recomendación con una tabla «si lo que quieres es… → entonces», y contestó
> «vale, empieza con D2»: texto V1, sin `.ics`.

---

## 1 · Qué cambia

En la oficina PACE vive en una pestaña de fondo. Cuando el bloque acaba, lo primero que se ve **no es la app sino
el aviso del sistema**, y decía siempre «Foco completado · Ciclo cerrado. Elige tu micro-pausa.». Con un día de
«A tu ritmo» servido ahora dice qué pausa toca y cuándo vuelves:

```
Tu pausa: Caderas de pie · 4 min
Bloque 1 de 9 hecho. El siguiente, a las 9:50.
```

Y sus variantes, con las mismas reglas que ya cuenta la línea del día (para que el aviso y la app no se
contradigan): la larga nombra todos sus platos y dura lo que la PARADA («Tu pausa larga: Coherente 6·6 + Cuello ·
15 min», con los platos del lunes 5 de la foto de la página); la comida dice hasta cuándo («Hora de comer · Hasta
las {hora del bloque siguiente}. Luego, el bloque {n}.»); el cierre, «Para
cerrar: …»; el último bloque, «Con esto cierras el día». En inglés, con el nombre de la rutina en inglés. **Por
libre, el aviso de siempre.**

## 2 · Lo que no se veía: el aviso iba ANTES de cerrar el bloque

`FocusTimer` avisaba al llegar a cero, **antes** de `completeFocusSession` (que sube `cycle`) y de `onFinish`
(que llama a `ritmoBloqueTerminado`, que recoloca el día si llegaste tarde). Con ese orden, el plan aún cree que el
bloque está en marcha y no sabe qué pausa sigue. El aviso pasa detrás, y un `finally` conserva lo de antes: aunque
abrir la pausa fallara, el aviso sale. El banco lo demuestra con un mutante que calcula con el estado de antes:
nombra la pausa equivocada.

## 3 · La red

- `tests/ritmo-aviso.spec.js` (4). El aviso del sistema se sustituye por uno falso que guarda lo que la app le pide
  mostrar; la pestaña se declara oculta (con ella delante, la app no avisa: decisión de s102); y el registro del
  service worker se anula para que la app caiga a `new Notification`. **Los nombres y las horas se piden al motor
  del día**, no se escriben en el test: lo que se defiende es que el aviso diga lo mismo que la app.
- Contra v0.132.0: **3 en rojo** por la razón de su mensaje (esperaba «Tu pausa: Caderas de pie · 4 min», recibía
  «Foco completado») y **un control** que pasa en las dos versiones a propósito (por libre y con la pestaña
  delante, nada cambia).
- `scripts/audit/banco-aviso-s198.js`: **10 de 10 muerden** (el cableado, el momento del cálculo, el plato, la
  hora, la larga ×2, la comida, el cierre, el último bloque, el inglés).

## 4 · Lo que aprendí

- **«No sé por dónde seguir» no pide más opciones: pide que alguien decida y diga por qué.** Una recomendación con
  tres razones y una tabla de «si lo que quieres es… → entonces» se contestó con «vale».
- **El orden en que pasan las cosas al acabar un bloque es una decisión.** El aviso, la campana, el contador y la
  recolocación ocurren en el mismo instante para la persona, pero no para el código: un texto que depende del
  plan tiene que ir después de que el plan cambie.
- **Una prueba de una API del sistema se escribe sustituyendo la API, y lo declara**: aquí no se mira ni un píxel
  del aviso real ni se prueba con la pestaña de verdad en segundo plano.
- **Un control que pasa en las dos versiones no es un test flojo si se dice que es un control.**

## 5 · Lo que queda

- **Que el usuario use la app una semana** con el aviso nuevo.
- El `.ics` (D2b), aparcado a propósito hasta usar el aviso unos días.
- D3 Estadísticas «Hoy» (la siguiente fase del plan), D4 Android, D5 pulido.

## 6 · Después: la versión con un solo comando (sin versión nueva)

Tras el push de v0.133.0, «haz el handoff y sigamos aprovechando para ver qué implementar». Lo primero, algo
invisible y sin decisiones de diseño: **`npm run bump -- X.Y.Z`** (`scripts/version.js`) cambia los siete sitios
de la versión a la vez, con la lista en `scripts/version.sitios.js`, que ahora también lee el `verify` (antes la
lista vivía dentro de él y el cambio se hacía a mano en siete sitios). Se niega a bajar la versión y a partir de
sitios descuadrados. Probado: subir a 0.133.1 → `verify` coherente → volver con `--forzar` → `git diff` vacío en
los cinco archivos (CRLF intacto); y con `sw.js` descuadrado a mano, se niega y enseña cuál dice qué. No cambia
la app: el artefacto conserva el hash de v0.133.0.

## 7 · Y el cambio de hora que se comía un día (v0.133.1)

Buscando el patrón `86400000` (lo vi en la auditoría de la primera parte), tres sitios contaban días restando 24 h.
El domingo del cambio de hora de primavera dura 23:
- **La racha**: el lunes siguiente, de 00:00 a 01:00, «ayer» salía sábado y la racha volvía a 1 (medido con el reloj en
  el 30 de marzo de 2026 a las 00:30: 4 esperado, 1 recibido contra v0.133.0).
- **Las etiquetas de mes de los mapas anuales**: `Math.floor` daba un día menos entre los dos cambios y la etiqueta
  caía una columna antes que su día 1. **Calculado antes de tocar nada** para 2025–2027: «sep» en 2025, «jun» en 2026,
  ninguna en 2027 — un defecto que depende del año en que mires. Las celdas usaban ya el índice bueno.
- La migración vieja de s43, con el mismo patrón (solo instalaciones anteriores a v0.28).

Arreglado por calendario o redondeando, con su test en el día del cambio y un control en un lunes normal. Es la
primera versión que se sube con `npm run bump`.
