# HANDOFF s181 → s182 · El móvil de la sidebar, ya medido

> **v0.113.0 está PUBLICADA y el árbol está LIMPIO.** Commit `493a754`, CI en
> verde (`verify` + `e2e`), 173/173 en local. Aquí no hay nada sin commitear:
> esto es una cola de trabajo, no un rescate.

---

## 0 · Estado exacto

| | |
|---|---|
| Última versión | **v0.113.0**, commit `493a754`, CI verde los dos jobs |
| Árbol | limpio salvo este documento |
| Suite | **173/173** · `npm run verify` en verde |
| `index.html` | al día con las fuentes |
| `PACE_standalone.html` | intacto (congelado desde s134) |

Revisión visual de móvil publicada como artefacto:
**https://claude.ai/code/artifact/755765a1-3793-44bc-9b96-a01594592c65**
(doce viewports a escala 1:1, con cuánto queda fuera de la primera pantalla).

---

## 1 · LO PRIMERO: los tres encargos del usuario, con sus números

Los tres salieron de mirar el artefacto de arriba. **Ya están medidos**: no hace
falta volver a diagnosticar, sólo decidir e implementar.

### A · «375 × 844 sale cortada por la derecha» — NO ES DE LA APP

**Medido:** a 375×844 el cajón da `right = 375`, **desborde 0** y
`scrollWidth − clientWidth = 0` en el documento. La app no corta nada.

**El corte era de la página de revisión**: monté cada banda como carrusel
horizontal y recortaba las capturas que no cabían, sin nada que lo indicara. Ya
está arreglado (las bandas envuelven). **No hay trabajo de producto aquí** —
queda escrito para que nadie vuelva a perseguirlo.

### B · «428 × 800 necesita más aire abajo» — hay 28 px que sobran arriba de él

El usuario propone sacarlo de la caja de «Para ahora», y **tiene razón en dónde
mirar**: medido, bajo la última línea de la tarjeta hay **28 px** (16 de
`padding-bottom` + ~12 del descender de la línea).

- Dónde se toca: `sidebarStyles.accion`, hoy `padding: '11px 14px 12px'` en la
  rama de escritorio… **ojo, en móvil manda el mismo objeto**, así que un cambio
  aquí toca las dos pieles. Si sólo se quiere en móvil, va en la hoja
  (`Sidebar.hoja.jsx`) dentro del `@media (max-width: 768px)`.
- **Cuánto se gana:** bajar el `padding-bottom` de 16 a 8 devuelve **8 px**. El
  cajón pasaría de **780** a 772, y a 428×800 el pie dejaría de estar a 1,4 px
  del borde para tener ~9,4.
- **Cuidado:** el aire de la tarjeta se afinó mirándolo en s180 («más aire entre
  líneas, pedido mirándolo: la tarjeta pasa de 98 a ~118 px»). Reducirlo revierte
  parte de aquello, así que **se pinta antes de decidir**.

### C · «Quizás la escala sea la mejor opción, si no queda diminuto» — MEDIDO: a 560 sí queda

**El cajón mide 780 px de natural** (constante, no depende del viewport). Con la
misma escala del escritorio encendida en móvil:

| viewport | escala | el texto de 11 px quedaría en |
|---|---|---|
| 360 × 560 | **0,718** | **7,9 px** |
| 360 × 640 | 0,821 | 9,0 px |
| 375/390 × 667 | 0,855 | 9,4 px |
| 390 × 736 | 0,944 | 10,4 px |
| 428 × 800 | **1** (ya cabe) | 11 px |
| ≥ 844 | 1 | 11 px |

**Respuesta a su pregunta: a 560 sí queda diminuto** — 7,9 px, y encima en la
piel donde se pulsa con el dedo.

**Propuesta concreta (no implementada, es decisión suya): escala CON SUELO.**
`Math.max(0.85, …)` deja el factor entre 0,85 y 1, y como 0,85 × 780 = **663**,
**todo viewport de 667 para arriba entraría entero sin desplazar**. Sólo 560 y
640 seguirían con scroll, que es donde encoger dolería de verdad. Con el recorte
de la §B el suelo baja a ~656 y cubre lo mismo con algo más de margen.

**Dónde se enciende:** `Sidebar.jsx`, en `recalcular()`, la guarda
`if (esCajon()) { aplicar(1); return; }`. Hoy apaga la escala en móvil **a
propósito** y está documentado; cambiarlo **anula esa decisión** y hay que
escribirlo así en `DECISIONES_TECNICAS_VIGENTES.md`, no borrarlo.

**Y el coste, que en móvil pesa más que en escritorio:** los objetivos táctiles
encogen con todo. A 0,85 el bloque de la semana (45 px) se queda en 38,3 — sobre
el mínimo de WCAG 2.2 AA (24) pero por debajo de los 44 que s180 buscó. En
escritorio se aceptó; en móvil es otra conversación.

---

## 2 · Su pregunta sobre los glifos, contestada con lo que SÉ y lo que NO

> «Los ejercicios nuevos de Mueve y Estira a los que aún les faltan glifos,
> ¿dónde están? No los veo en el listado.»

**Lo que sé, y explica por qué no los ve:** los dos documentos del encargo
—[`GLIFOS_A_DIBUJAR.md`](product/GLIFOS_A_DIBUJAR.md) y el generado
[`GLIFOS_EJERCICIOS_PENDIENTES.md`](product/GLIFOS_EJERCICIOS_PENDIENTES.md)—
**se generaron en s170/s173**, y las tres rutinas de oficina entraron en
**v0.109.0 (s178)**, que además añadió un archivo de datos nuevo
(`app/extra/extra.data.piernas.js`, 267 líneas). **Por construcción, ese listado
no puede contener nada posterior a s173.** Los dos siguen diciendo «62
identidades, 59 con arte, 3 pendientes» (`descanso`, `pica-en-escritorio`,
`rana`), que es la foto de entonces.

**Lo que NO pude verificar, y no lo doy por bueno:** intenté regenerar el censo y
cruzarlo con `app/glyphs/exercise-masks.js`, y me salió **«61 identidades, 61 sin
entrada»**. Eso no es un resultado: 61 de 61 significa que **el cruce no está
casando** (mismo patrón que ya mordió tres veces esta sesión). Además el 61
contradice el 62 que s172 dejó fijado tras corregir exactamente ese tipo de
punto ciego, así que **hay que mirar el generador antes de creerse ningún
número**.

**Lo primero que haría s182 con esto:**
1. Regenerar el censo **de verdad** (`scripts/ingest-glifos-ejercicio.censo.js`
   expone `identidadesVisuales()` y `slug()`; el emparejamiento vive en
   `.mapa.js`, que es quien sabe la forma real del mapa — yo leí el archivo de
   máscaras a pelo y por ahí se rompió el cruce).
2. Cruzarlo con el mapa **usando el mismo camino que la ingesta**, no un
   `includes` sobre el texto.
3. Comprobar por qué `verify.encargo.js` está en verde: o su alcance no incluye
   identidades nuevas, o de verdad no falta ninguna. **Las dos respuestas son
   informativas**; lo que no vale es no mirarlo.
4. Si aparecen identidades nuevas sin arte, **regenerar los dos documentos** y
   avisar al usuario con la lista.

**Y la advertencia que este repo ya se ha ganado dos veces**: el número de
identidades ha sido erróneo en s164 (61) y en s172 (corregido a 62), y las dos
veces **parecía creíble porque coincidía con otro censo que arrastraba el mismo
punto ciego**.

---

## 3 · La cola que queda detrás

1. **La pill naranja de «Mis rutinas»** es lo más llamativo de la columna (fondo
   tintado + borde a plena fuerza). El usuario la dejó «así de momento»;
   quitarle el fondo la calmaría sin dejar de ser naranja.
2. **Dos cosas de su maqueta que NO se copiaron**, porque avisó de que algún
   elemento podía no estar bien colocado: en su imagen **no aparece el lema** y
   **«Ver la colección» va a la derecha**.
3. **Defecto previo y publicado**: con la app en inglés, el título del último
   logro sale en español («Regresas» en vez de «You return»). `achMini()` en
   `Sidebar.parts.jsx` devuelve `a.title` sin pasar por i18n, mientras
   `Achievements.jsx:232` lo hace bien con `tR('ach.item.' + a.id + '.title', a.title)`.
   La traducción existe (`app/i18n/content/achievements.js:37`).
4. **La cola de s178, intacta**: gemelo de pie, flexor de cadera contra la mesa y
   aductores sentado — ejercicios que **hoy no existen** en el catálogo. Y
   `move.chair.antidote` sigue pendiente de decisión.
5. **CTB**, fuera de v1, con prototipo permitido.
6. **Fase 4 · Stats**, el tercer chip «Discreta», la música y el arte.

---

## 4 · Trampas vigentes (las de esta sesión, además de las de `STATE.md`)

- **`page.setViewportSize()` de Playwright NO emite `resize`**, y el
  `ResizeObserver` **tampoco dispara sobre la lente** en headless. En navegador
  real las dos vías funcionan. Los tests de altura emiten el evento a mano y lo
  declaran.
- **Backticks dentro del template literal del CSS** de `Sidebar.hoja.jsx`: van
  cuatro veces. El `verify` los caza como error de sintaxis.
- **Las comillas dobles del shell ejecutan los backticks**: `python -c "…"` se
  come lo que vaya entre backticks. Escribir por stdin con heredoc entrecomillado.
- **No fotografiar tras medir**: una medición que muta el DOM y luego se
  captura enseña la mutación, no el producto.
- **N entradas distintas devolviendo el mismo número no es un resultado**, es que
  la inyección o el cruce no llegan. Poner control positivo, y que el control
  esté bien diseñado (120 equis seguidas son **una palabra impartible** y no
  fuerzan salto de línea en una fila flex).
- **`getBoundingClientRect()` devuelve la caja YA transformada**; `offsetHeight`
  no. Con la sidebar escalada, mezclarlos da números sin sentido.
- **`node build-standalone.js` reescribe el standalone congelado**: copiarlo
  antes y restaurarlo después.

---

## 5 · Prompt para arrancar s182

```
Sesión s182 de PACE. Lee CLAUDE.md, STATE.md y DESIGN_SYSTEM.md como manda el
arranque, y después docs/HANDOFF_s181.md, que trae la cola ya medida.

Estado: v0.113.0 publicada (commit 493a754), CI en verde, árbol limpio,
173/173. No hay nada que rescatar.

Empieza por la §1 del handoff, que son tres encargos del usuario con sus
números ya tomados:
  A) 375x844 NO es un defecto de la app — está verificado, no lo persigas.
  B) recortar el aire de la caja «Para ahora» (28 px medidos bajo la última
     línea); píntalo antes de decidir, que es la regla de este repo.
  C) decidir si se enciende la escala en móvil CON SUELO (0,85 cubre de 667
     para arriba; a 560 el texto se queda en 7,9 px y eso el usuario ya sabe
     que es diminuto). Es decisión suya: pínta las opciones y pregunta.

Y contesta de una vez la §2: los documentos de glifos son de s173 y las
rutinas de oficina entraron en s178, así que el listado no puede incluirlas.
Mi cruce dio «61 de 61 sin arte», que NO es un resultado sino un cruce roto —
regenéralo por el camino de la ingesta, no con un includes sobre el texto, y
desconfía del número: ya fue erróneo en s164 y en s172.

Reglas que no se negocian aquí: el diseño se aprueba MIRÁNDOLO en una maqueta
o en el producto, nunca leyendo una tabla; toda opción que propongas se PINTA
antes de preguntar; y ningún número entra en un documento sin haberlo medido
en esta sesión.
```
