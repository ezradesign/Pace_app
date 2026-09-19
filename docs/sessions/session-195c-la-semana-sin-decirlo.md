# s195 (ter) · La semana, sin decirlo (v0.128.0)

**Fecha:** 2026-09-19 · **Versión publicada:** v0.128.0 → v0.128.1 · **Suite:** 282 → **286**

> Tras `semana-copy-s195.html` (tres sistemas de copy) el usuario dudó: «no sé si pondría copy,
> menos es más, ¿qué opinas?». Se pusieron en el panel real las tres formas mínimas —un chip, nada,
> una línea de cuatro palabras— con su coste medido (el chip partía el título en dos líneas a
> 1536×704) y la recomendación fue la línea. **El usuario: «2, nada».** Así que la pieza 3 del norte
> (lectura A) entra en la app sin una palabra nueva en pantalla.

---

## 1 · Lo hecho

- **`app/ritmo/ritmo.semana.js`** (nuevo, PURO como la regla): `semanaISO` (sin `new Date("YYYY-MM-DD")`,
  regla §10), `SEMANA_TEMAS` (seis, en ciclo por semana ISO: cuello · caderas · manos · espalda · aire ·
  ligera, con sus tags del catálogo), `SEMANA_ACENTOS` (1..7: arranque · sostener · mitad · aire · cierre ·
  libre · libre), `semanaDe(iso)`, `semanaPozos` (reordena cada pozo por afinidad al tema; `corta` pone
  los cortos delante; `respiraLarga` los Respira largos), `semanaComponer` (la regla de siempre sobre los
  pozos del tema y hasta tres retoques de PLATOS: el lunes la primera pausa es de Mueve, el jueves la
  última corta antes de comer es de Respira, el viernes el cierre es el Respira más largo que quede).
- **«La mitad» ya no se falsea con `previos`** (el prototipo pasaba `{ pausas: 1 }`, y eso hacía empezar
  el día en «ahora» aunque eligieras antes de tu hora): es **`horario.desfaseLarga`**, que la regla
  entiende (`ritmo.regla.js`, en los dos sitios donde decide la larga) y que sobrevive a recolocar.
- **Los acentos respetan lo hecho**: «arrancar» solo si la primera pausa del día es de esta
  composición (`previos.pausas === 0`); las claves de «otra» son las de la pausa retocada.
- **El fin de semana lleva tema y no acento**: el menú sigue existiendo (el usuario lo usa en sábado).
- **El enganche**: `ritmoMenu` compone con `semanaComponer(…, semanaDe(hoy), previos)`. Nada más cambia:
  ni la línea, ni la hoja, ni la barra lateral saben que hay semana. Los nombres de los temas quedan
  como dato (no se pintan). El prototipo llevaba un campo `larga` que nadie leía: fuera (lección de s194).

Medido con el artefacto (jornada 9–17, comida a las 14), semana 38 («caderas»): lunes arranca con
Glúteos invisibles (Mueve); miércoles la larga es la segunda parada (y también la quinta y la octava,
por la cadencia: opción A de la ronda 1, «como sale»); jueves antes de comer, Coherente 6·6; viernes
el cierre es Coherente 6·6; sábado, sin acento. Seis lunes seguidos, seis temas: los primeros platos
cambian con la región (Glúteos → Grip → Postura reset → Gemelos → Gemelos → Postura reset).

## 2 · La red

- **`tests/ritmo-semana.spec.js`, 4 tests**: la semana ISO (14/9 → 38, 1/1 → 1, 31/12 → 53, 4/1/27 → 1)
  y el ciclo · el tema lidera los cinco días de la 38 y los tres primeros de la 39, y los cinco acentos
  hacen lo que dicen (el sábado es la regla sobre los pozos del tema) · los acentos respetan lo hecho
  (con un GUARD: la primera pausa de la recomposición tiene que ser corta y de Estira, o «arrancar» no
  tendría nada que pisar), la semana varía y es determinista · la app compone por la semana (miércoles:
  la larga es la segunda parada del panel) y no pinta ni una palabra nueva.
- **`scripts/audit/banco-semana-s195.js`: 11 de 11 muerden.** La primera pasada dio 9 de 11: «el tema
  no reordena» vivía porque el lunes la rotación diaria ya ponía la cadera primero (se aserta los cinco
  días y la semana siguiente); «arrancar pisa aunque haya pausas hechas» vivía porque con dos pausas
  hechas la siguiente era la larga y con una, la de Mueve (nada que pisar): se recoloca con TRES hechas,
  y el GUARD lo deja escrito.

## 3 · Lo que se declara sin cubrir

- La hoja no distingue los platos del acento; Stats no sabe de semanas.
- Los nombres de los temas (por intención) no se ven en ningún sitio: si algún día se pintan, son dato.
- El miércoles con tres largas (2.ª, 5.ª, 8.ª): opción A de la ronda 1 sin decidir; se dejó «como sale».

## 4 · v0.128.1 · Los acentos sirven lo que cabe (mismo día, tras publicar)

Al escribir el informe al usuario, **la semana se re-midió sobre `fa5cc56`** en vez de copiarla del hilo
(`semana-medida.js`, en el scratchpad: los cinco días de la semana 38 y el lunes de la 39, plato a plato).
Y el jueves decía **«Coherente 6·6 10'» en una pausa corta**; el viernes, lo mismo en el cierre. Los dos
huecos duran 5' (`ritmo.regla.js:154,157`).

**Por qué no lo vio nadie**: la regla no filtra platos por duración porque nunca le hizo falta —Estira y
Mueve caben en 5' y Respira (4-10') solo iba a la larga de 15'—, y `toma()` de la semana se calcó de
`toma()` de la regla. Los acentos «aire» y «cerrar suave» son **el primer Respira fuera de la larga**, y
el test de v0.128.0 preguntaba «¿es Respira?» y «¿es el más largo?», no «¿cabe?». Otra vez: **el test
aserta la intención y el defecto está en el invariante que nadie escribió.**

**Arreglo**: `toma(modulo, clave, cabe)` filtra `min <= cabe`; «aire» pasa `it.dur` y, si no hay Respira
que quepa, devuelve el plato a `usados` y deja la parada como la sirvió la regla; el cierre filtra por
`cierre.dur`. Medido después: jueves **Diafragmática 5'** antes de comer, viernes cierre **Diafragmática
5'** (la regla ponía Suspiro 2'). El test añade el invariante —**ningún plato más largo que su parada, los
cinco días**— y el viernes pide «el más largo que cabe» con GUARD de que existe y supera al pozo del
cierre. Banco: dos mutantes más (quitar el filtro de `toma`, quitar el del cierre), **13 de 13**.

**Lección**: lo que se publica se re-mide sobre el commit, no sobre el hilo. El informe iba a decir
«viernes cierre Coherente 6·6» como si fuera bueno.
