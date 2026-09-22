# s197 (bis) · La tableta vertical lleva la piel de móvil (v0.130.0)

**Fecha:** 2026-09-22 · **Versión publicada:** v0.130.0 · **Suite:** 296 → **300**

> Cierra lo último que quedaba decidido del handoff de s196: «768×1100 · piel de móvil, una columna, barra
> abajo: así se ve perfecto» y «vertical hasta 1024». Sigue a [session-197](./session-197-media-jornada-y-lo-contado.md).

---

## 1 · El corte, en un solo sitio

El corte entre las dos pieles estaba escrito a mano en **19 sitios de 8 archivos** (`max-width: 768px` /
`min-width: 769px` en el CSS inyectado y en tres `matchMedia`). Moverlo obligaba a acertar en los 19. Ahora
nace **`app/main/_responsive.corte.js`**, que se carga el primero y declara:

```
PIEL DE MÓVIL      (max-width: 768px), (orientation: portrait) and (max-width: 1024px)
PIEL DE ESCRITORIO (min-width: 1025px), (min-width: 769px) and (orientation: landscape)
```

Las hojas lo interpolan (`@media ${PACE_CORTE_MOVIL}`) y el JS pregunta `paceEsMovil()`. **Sin `not`**: las
dos condiciones son complementarias escritas con listas separadas por coma, que es CSS de nivel 3 —
`@media (... and (not (...)))` es nivel 4 y no existe en Safari anterior a 16.4.

Dos cosas que solo se ven midiendo, y por eso van en el test:
- **Una ventana cuadrada cuenta como vertical**: `orientation: portrait` casa con alto ≥ ancho.
- **Un teléfono apaisado (844×390) ya llevaba piel de escritorio antes de esto**, porque mide 844 de ancho.
  Este corte solo **añade** verticales; no toca lo apaisado.

## 2 · El defecto que estrenó el corte

Al mudar las verticales de hasta 1024 a la piel de móvil, **entre 820 y 1024 desaparecían los tres modos**
(FOCO · PAUSA · LARGA) de la topbar: la piel de móvil esconde la pill —a ancho de teléfono se solapa con los
iconos— y la regla que se la devuelve en su propia fila estaba topada en 768. Medido, no supuesto: `tabs=3`
(los tres iconos) en vez de `tabs=6` a 820 y a 1024.

El arreglo lo dictaba un comentario de s169 que ya estaba escrito: «sólo se limpiaría por encima de ~560 px
de ANCHO, que ningún teléfono alcanza en vertical». Una tableta vertical mide 768–1024: la pill vuelve a su
sitio **sin** la fila extra de 42 px. Medido después: a 820 la pill ocupa 287–533 y los iconos empiezan en
680 (147 px de aire); a 1024, 249 px.

## 3 · Lo que NO se tocó, y por qué

- Los dos sub-bloques de `_responsive.pieles.js` que son del **teléfono** y no de la piel: la pill entre 390 y
  767 con alto ≥ 760, y el apretón de la ActivityBar con alto ≤ 720. Una tableta vertical es ancha y alta: no
  entra en ninguno.
- **La composición**. El sobrante vertical de una tableta (200 px a 820×1180, 315 a 1024×1366) lo reparte el
  modelo «atardecer» 38 % arriba / 62 % abajo, como en el teléfono. Es lo que el usuario vio en las fotos
  forzadas de s196 cuando dijo «así se ve perfecto».

## 4 · El troceo de `_responsive.pieles.js`

Añadir la regla de la pill dejó el archivo en **517 líneas** y el trinquete de §1 lo paró: «trocear, no añadir
a DEUDA_500». Se cortó **por un punto**, no se extrajo: el bloque final `@media ${PACE_CORTE_ESC}` sale tal
cual a **`app/main/_responsive.pieles.esc.js`** (340 + 191). Va cargado **justo después** en `PACE.html` y eso
no es cosmético: las dos hojas escriben los mismos selectores con la misma especificidad, así que gana quien
se inyecta último — el mismo orden que tenían dentro del archivo único.

De propina, la trampa de siempre: un **backtick** en un comentario dentro del template literal abortó el
build. Ya pasó en s195; el comentario ahora lo dice en su propia línea.

## 5 · La red

- **`tests/pieles-corte.spec.js` (4)**: el corte por los cuatro lados sobre una rejilla de 14 viewports
  (complementariedad y exhaustividad, con GUARD de que la rejilla tiene casos de los dos lados), la tableta
  vertical sin columna y sin scroll con la pill en su sitio, el cajón que **se cierra al pulsar una acción**
  —la prueba de que el JS también sabe que es cajón— y el teléfono sin cambios. Tres caen contra HEAD; el
  cuarto pasa a propósito, porque defiende que el teléfono NO cambió (documenta, no protege: s189).
- **`scripts/audit/banco-corte-s197.js`: 8 de 8 muerden**, con pasada de control. El octavo tardó: el mutante
  que devolvía `esCajon()` a su corte copiado **vivía**, porque el test solo miraba la geometría. `esCajon()`
  decide tres cosas —colapsar al pulsar, la acción primero, y medir el alto como bloque (ahí
  `Sidebar.escala.jsx` avisa de que preguntar al otro sale «verde, silencioso y falso»)—, y asertar la
  primera lo mata. **Un mutante vivo señaló un aserto flojo, no un código sobrante.**
- **Auditoría de viewports re-medida** (`auditoria-viewports-s195.js`): 820×1100 sale de la lista de
  escritorio y entra en la de la otra piel, junto a 820×1180, 834×1194, 1024×1366 y 900×1200; escritorio gana
  1180×820 y 1025×1366. **21 viewports × ~10 escenas = 199 escenas, 5 con scroll y ninguna de las nuevas.**
- Dos tests de s195b reescritos: asertaban que 820×1100 era piel de **escritorio** con la copia compacta por
  container query. Ahora la copia compacta es la de su piel, y se aserta eso.

## 6 · Lo que se declara sin cubrir

- **Cinco escenas con scroll que ya estaban antes** y no son de esta versión: la tarjeta «por libre» arrastra
  **72 px a 375×667** y **32 a 360×730** (comprobado contra HEAD: idéntico), y 1 px en dos escenas de
  1024×650. Quedan medidas y sin arreglar.
- Ningún píxel comparado: la suite no compara imágenes. Las tabletas se miraron a mano, tres a la vez.
- Nadie ha usado la app una semana entera todavía.
