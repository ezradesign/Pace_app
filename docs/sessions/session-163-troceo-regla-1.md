# Sesión 163 — Los cinco de la regla §1, y dos pruebas en vez de una mirada

**Fecha:** 2026-08-17 · **Versión:** v0.93.0 → **v0.94.0**

> El trinquete que nació en s162 congeló cinco archivos por encima de las 500
> líneas de `CLAUDE.md` §1. Esta sesión los troceó **todos**, y `DEUDA_500` queda
> **vacía**. Lo caro no fue mover el código: fue demostrar que no se movió nada.

---

## 0 · El reparto, con sus números

| Archivo | Antes | Ahora | A dónde fue lo que salió |
|---|---|---|---|
| `app/main/_responsive.js` | **1132** | **438** | `_responsive.atmosfera.js` (396) + `_responsive.pieles.js` (403) |
| `app/focus/FocusTimer.jsx` | **686** | **481** | `FocusTimer.support.jsx` (129 → 290) + `FocusTimer.parts.jsx` (161 → 256) |
| `app/tokens.css` | **676** | **322** | `app/motion.css` (400) |
| `app/tweaks/TweaksPanel.jsx` | **534** | **467** | `TweaksPanel.support.jsx` (100) |
| `app/state-core.jsx` | **515** | **449** | `state-core.palette.jsx` (107) |

3833 líneas antes, 4109 después: **+276, y ni una de código**. Todo lo que creció
son cabeceras y punteros — el cuerpo se movió byte a byte.

**Ningún archivo nuevo se inventó donde ya había sitio.** `FocusTimer` repartió en
sus dos hermanos, que nacieron para esto en s102 y s124; `TweaksPanel` estrenó el
`.support.jsx` que ya usan Sidebar, MoveSessionV1 y BreatheVisual.

Verificación después de **cada** troceo, no al final: `npm run verify` (que incluye
el análisis de ámbito del compilado, la biyección `app/` ↔ `PACE.html` y el propio
guard §1) + la suite de 67 tests. Cinco veces verde.

---

## 1 · El método: mover bytes, no reescribir

Cada troceo se hizo con un script de un solo uso que **extrae el rango exacto de
líneas** y lo pega en el destino, con aserciones en los dos bordes y en lo que
tiene que quedar en cada mitad. Nunca se reteclea el cuerpo: si el bloque se
transcribe a mano, la diferencia entre «lo moví» y «lo reescribí parecido» deja de
ser comprobable.

Las aserciones pagaron dos veces:

- **El export no era la última línea.** `FocusTimer.support.jsx` **sí** acaba en
  salto de línea y `FocusTimer.jsx` **no** — de ahí que el guard cuente 686 donde
  `wc -l` dice 685. El script suponía «el `Object.assign` es `[-1]`» y saltó
  `AssertionError` contra una cadena vacía **antes de escribir nada**. Ahora el
  export se **localiza** y se comprueba que detrás no queda código.
- **La lista de nombres que cruzan se derivó, no se escribió.** Para
  `_responsive.js` el script extrae las 22 interpolaciones `${…}` del template
  literal, saca sus identificadores y **exige que el conjunto sea exactamente** la
  lista de 13 que se publica. Si mañana alguien mete una interpolación nueva sin
  publicar su nombre, el troceo no habría colado.

---

## 2 · Los dos casos delicados, y por qué se cortan en vez de extraerse

`tokens.css` y `_responsive.js` son CSS, y en CSS **el orden ES la semántica**.
Sacar un bloque de en medio y enlazarlo al final deja las mismas reglas en otra
cascada.

Así que ninguno de los dos se «extrajo»: se **cortaron por un punto**, y las
mitades se enlazan/inyectan en el mismo orden. Con eso, la concatenación que ve el
navegador es la de antes.

**`tokens.css` → VALORES | COMPORTAMIENTO.** Corte en la línea 307: arriba la
tipografía self-hosted y las dos paletas; abajo el cruce entre paletas (s161), el
kill de `prefers-reduced-motion` y los dos packs de microinteracciones de s99. La
división no es por tamaño: `tokens.css` dice **cuánto vale** cada cosa y
`motion.css` **cómo se pasa** de un valor al siguiente.

**`_responsive.js` → tres, por dominio.** El JS que compone los degradados
(`_responsive.atmosfera.js`), la hoja base + la atmósfera (`_responsive.js`) y las
dos pieles `@media` (`_responsive.pieles.js`). Dos detalles que lo hacen limpio:

- **las pieles no tienen ni una interpolación** (medido: 0 de 22), así que ese
  archivo no lleva una línea de lógica;
- **la hoja desestructura** `window.paceAtmosfera` en su cuerpo, así que **el
  template literal no se tocó ni un carácter**. Se publica un objeto y no trece
  globales: son piezas de un mecanismo, y `window` ya tiene 447 inquilinos.

### El contrato de orden que casi nadie ve

`--pace-skin` vale `movil` en la hoja base y `escritorio` dentro del `@media` de
las pieles, **las dos veces sobre `:root`**: misma especificidad, así que a ≥769 px
gana **la que se inyecta después**. Si las pieles cargaran antes, la home de
escritorio se creería móvil y `main.jsx` (s160) renderizaría el orden de lectura de
la otra piel — un fallo de a11y invisible en la captura. Está escrito en las tres
cabeceras y en `PACE.html`.

---

## 3 · Dos pruebas, porque la suite no compara ni un píxel

Prometí en s162 que este troceo pedía una pasada visual. En vez de mirar, se midió
dos veces.

**(a) La huella de reglas.** Un script reproduce lo que hace el build —concatenar
las hojas de `app/` en el orden de sus `<link>`—, quita los comentarios y
normaliza el espacio. Lo que tiene que quedar igual son las **reglas y su orden**,
no la prosa. Para `_responsive.js`, que inyecta desde JS, la misma huella se toma
**en el navegador**, leyendo el `textContent` de los 18 `<style>` del documento en
orden.

```
antes del troceo de CSS:  45435 bytes de reglas · sha 473c5319… (archivos)
después:                  45435 bytes de reglas · sha 473c5319…
antes del troceo de la hoja inyectada: 45435 bytes · sha c022e1c9… (navegador)
después:                               45435 bytes · sha c022e1c9…
```

Y de paso **el banco cazó una mentira del instrumento**: la primera captura leyó
un `tokens.css` de 36883 bytes, o sea el **anterior** al corte. `npm run verify`
compara el build con el disco y luego **restaura** el artefacto, así que
`index.html` seguía siendo el de antes. Regenerar es el paso 3 del cierre, y el
banco lo estaba pidiendo a gritos.

**(b) Los píxeles.** Se sirvió el `index.html` de HEAD **en paralelo** con el
nuevo, mismo servidor y mismo estado sembrado, y se fotografiaron los dos en
cuatro combinaciones. Comparación pixel a pixel con `sharp`:

| Vista | Píxeles distintos | Delta máx | Consola |
|---|---|---|---|
| escritorio / crema (1280×720) | **0** de 921 600 | 0 | limpia |
| escritorio / oscuro | **0** de 921 600 | 0 | limpia |
| móvil / crema (390×844) | **0** de 329 160 | 0 | limpia |
| móvil / oscuro | **0** de 329 160 | 0 | limpia |

Ni un píxel en las cuatro. Es la primera vez que este proyecto compara píxeles.

---

## 4 · El trinquete se vació, y hubo que corregir lo que decía de sí mismo

El tercer diente pidió borrar cada fila **en cuanto el archivo bajaba de 500**, uno
por uno, en cinco pasadas del verify. Con `DEUDA_500` vacía quedaban dos cosas
falsas dentro del propio checker, y las dos se arreglaron:

- el `NO_CUBRE` decía «los cinco archivos registrados siguen por encima del
  límite»;
- el mensaje verde decía «**0** con deuda registrada y ninguna ha crecido», que es
  verdad y no se entiende. Ahora, con la lista vacía, dice «NINGUNO pasa de 500 ln
  y no queda deuda registrada · el mayor es `app/move/MoveSessionV1.jsx` con 500».

**Y el guard se comprobó con la lista vacía**: un archivo nuevo de 501 líneas en
`scripts/` lo pone rojo con «trocear, no anadir a DEUDA_500». Borrado, vuelve a
verde.

---

## 5 · Lo que NO se cubre

- **`MoveSessionV1.jsx` está exactamente en 500** — el techo, no una violación.
  Lo siguiente que se le añada va a `MoveSessionV1.support.jsx`, y ahora el verify
  lo dice en cada pasada porque es «el mayor».
- **`build-standalone.js` sigue en 567 líneas** y fuera del alcance de la regla,
  declarado en `NO_CUBRE`: trocear el build es una decisión, no una limpieza.
- **Los píxeles se compararon en dos anchos y dos paletas, con el Pomodoro
  PARADO.** No se fotografió una sesión viva, ni Respira, ni Mueve, ni un Camino:
  la prueba fuerte de esta sesión es la huella de reglas, y la de píxeles es su
  confirmación en la superficie que el troceo tocaba.
- **Inglés sin mirar**, como siempre.
- **Respira sigue sin diagnóstico** (quinta sesión) y **el tirón del arco** sigue
  esperando el banco en el teléfono del usuario.
