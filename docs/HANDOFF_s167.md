# HANDOFF · s167 → siguiente sesión

**v0.97.0** · 2026-08-18 · sustituye a [`HANDOFF_s166.md`](./HANDOFF_s166.md) y a
[`HANDOFF_glifos_logro.md`](./HANDOFF_glifos_logro.md), los dos **agotados**.

Aquí viven **solo las tres cosas que esperan una decisión del usuario**, cada una
con su pregunta concreta y una sugerencia. Lo demás (estado, herramientas,
trampas) está en la sección «Próxima sesión» de [`STATE.md`](../STATE.md).

---

## 1 · El farol del equinoccio

**Lo observado, a tamaño real sobre la app**: el dibujo #15 se lee como un farol,
y **el sol y la luna que justifican el equinoccio son ilegibles a 56 px**. No es
un defecto del arte: es que el argumento del logro —día y noche iguales— vive
justo en el detalle que desaparece.

Los otros 18 sellos del lote se leen bien; este es el único con esta objeción.

### Preguntas

1. **¿Un sello tiene que argumentar, o basta con que sea un emblema?** Varios de
   los 77 ya funcionan como emblema y no como explicación (la lasca de sílex no
   «explica» ancestral, la nombra). Si la respuesta es «basta con emblema», aquí
   no hay nada que arreglar y se cierra.
2. Si tiene que argumentar: **¿se pide un dibujo nuevo** con el sol y la luna
   como **motivo principal** —no como detalle dentro de un objeto—, o **se
   reasigna el farol** y el equinoccio espera?

### Sugerencia

**Mover el farol a `stats.streak.30` («Treinta amaneceres»)** y dejar que el
equinoccio espere su dibujo.

El motivo no es de conveniencia: **sol y luna juntos son literalmente el
amanecer**, el momento en que uno releva al otro. Ahí el detalle pequeño es un
**bonus**, no el argumento — el sello ya dice «farol al alba» aunque no distingas
los dos astros. En el equinoccio, en cambio, el detalle **es** el logro.

Y encaja doblemente porque `stats.streak.30` acaba de cambiar de condición en
s167: ya no es «un mes seguido» sino **treinta días con sesión antes de las 9**.

Para el equinoccio, el encargo ya tenía escrita la imagen correcta en
[`GLIFOS_LOGROS_ENCARGO.md`](./product/GLIFOS_LOGROS_ENCARGO.md): *una balanza de
dos platos a la misma altura, con una hoja en un plato y una espiga en el otro*.
Eso sí se lee a 56 px, porque la horizontalidad de los dos platos es una forma,
no un detalle.

**Coste**: cambiar dos filas del `MAPEO` y re-correr la ingesta. Ojo al efecto de
conjunto (§ abajo).

### Los 19 logros que siguen sin arte

| Familia | Logros |
|---|---|
| constancia (3) | `streak.7` «Cuarto creciente» · `streak.14` · `breathe.sessions.50` |
| estacionales (1) | `season.summer` |
| estadísticas (2) | `stats.month.focus` · `stats.streak.30` |
| exploración (5) | `explore.box` · `explore.rounds` · `explore.kapalabhati` · `explore.shoulders` · `explore.all.extra` |
| maestría (3) | `master.pomodoro.8` · `master.box.15` · `master.shoulders.20` |
| secretos (5) | `secret.cow.click` · `secret.rain` · `secret.first.monday` · `secret.new.year` · `secret.zen` |

**`streak.7` merece una luna en cuarto creciente**, ahora que se llama así.

> **Al re-correr la ingesta, recordar**: reescribe **todas** las máscaras y el
> peso de tinta se iguala contra la **mediana del conjunto entero**, así que
> meter dibujos nuevos **cambia máscaras viejas** (17 de 58 en s167). No es un
> bug, pero conviene mirarlo después.

---

## 2 · Las familias del catálogo

**Reparto actual**: primeros 10 · constancia 15 · exploración 18 · maestría 26 ·
secretos 13 · estacionales 10 · estadísticas 4 = **96**.

**Tres costuras medidas, no opiniones:**

**(a) Maestría (26) mezcla dos cosas distintas.** Por un lado profundidad en una
práctica (`master.box.15`, `master.atg.20`, `master.hips.20`…); por otro
**hábitos de hora del día** (`master.dawn`, `master.dusk`, `master.silent.day`,
`master.midnight.never`) y **cargas de una jornada** (`master.pomodoro.8`,
`master.focus.day`, `master.retreat`). Son criterios diferentes bajo un mismo
título, y es la familia más grande con diferencia.

**(b) Estadísticas (4) se solapa con constancia.** El duplicado que s167 arregló
—dos logros desbloqueados por la misma línea— era el **síntoma**, no la causa: la
categoría se definió por «viene del panel de stats», que es una procedencia
técnica, no una idea que el usuario reconozca.

**(c) La clave dice `exploracion` y la etiqueta dice «Repertorio».** Y hay una
segunda igual: `estadisticas` apunta a la clave i18n `ach.cat.stats`.

### Dato que cambia el coste de decidir

**`cat` NO se persiste.** A `localStorage` solo va `{ id: timestamp }`, así que
**renombrar o reordenar familias es seguro y no le quita un logro a nadie** — al
revés que renombrar un `id`, que sí lo borraría.

**Pero cada familia gasta un token de color** (`--focus`, `--breathe`,
`--achievement`, `--move`, `--hydrate`, `--ink-2`, `--ink-3`), y hoy los siete
están asignados. Una familia nueva obliga a repartirlos otra vez.

### Preguntas

1. **¿Cuántas familias quieres?** Hoy son 7 y el color las tiene todas cogidas.
   ¿Se sube a 8 (repartiendo colores de nuevo) o el número es un tope?
2. **¿Cuál es el criterio de familia?** Hoy hay dos mezclados: **qué haces**
   (respirar, moverse) y **cómo lo haces** (primera vez, constancia,
   profundidad). Ninguno se aplica de forma consistente. ¿Cuál manda?
3. **En «Repertorio»: ¿manda la clave o la etiqueta?** ¿Renombro `exploracion` a
   `repertorio`, o devuelvo la etiqueta a «Exploración»?

### Sugerencias

- **Partir maestría**, que es la costura más clara. Quedaría «Maestría» para la
  profundidad (15/20 sesiones de una práctica) y una familia nueva para el ritmo
  del día — **«Ritmo»** o **«Las horas»** — con Amanecer, Ocaso, Día silencioso,
  Nunca a medianoche, Jornada de ocho, Día de foco y Retiro personal. Baja
  maestría de 26 a ~19 y crea una familia con una idea reconocible.
- **Disolver estadísticas** repartiendo sus 4 entre constancia (`stats.streak.30`,
  que ahora son amaneceres) y la familia nueva o estacionales (`stats.month.first`,
  `stats.month.focus`, `stats.year.first` son hitos de **calendario**). Con eso
  se libera el color que necesita la familia nueva y desaparece el solape que
  produjo el duplicado.
- **Alinear las dos claves con sus etiquetas**, en la dirección que elijas.

**Si se toca esto**: mueve `cat` en `catalog.js`, `CAT_META`, las etiquetas i18n
(ES y EN) y **los números del CENSO** de `verify.integridad.js` (`categorias`, y
`logrosSecretos` si algún secreto cambia de sitio).

---

## 3 · La pill de Foco/Pausa/Larga en móvil

Pedida por el usuario al ver que **sobra espacio arriba y abajo** en pantallas
largas. Hoy está oculta **por decisión de s46**, porque allí la selección
post-Pomodoro la hace el **BreakMenu**. La regla vive en
`app/main/_responsive.pieles.js`:
`[data-pace-topbar] [data-pace-tabs] { display: none !important; }`.

Sigue **intacta desde s166**: las dos preguntas nunca se respondieron.

### Preguntas

1. **¿Conviven la pill y el BreakMenu, o la pill lo sustituye** en esos altos?
2. **¿El umbral de «pantalla larga» se fija a ojo o se mide primero?**

### Sugerencias

- **Que convivan**, porque hacen trabajos distintos: el BreakMenu **aparece** al
  terminar un Pomodoro y propone, mientras que la pill deja **elegir modo
  deliberadamente** en cualquier momento. Sustituir uno por otro perdería el
  momento en que la app recomienda, que es lo que s46 protegía. No hay conflicto:
  no compiten por el mismo instante.
- **Medir antes de fijar el umbral**, y hay un precedente que dice por qué: en
  s167 el aire de las tarjetas de logro parecía cosmético a 1280 y resultó ser el
  **55 % de la tarjeta a 320**. Un número elegido a ojo en una sola altura repite
  ese error.
  **Medida concreta que lo contesta**: espacio vertical libre de la home (lo que
  sobra por encima del aro y por debajo del último bloque) en las alturas reales
  de móvil —**568 · 667 · 736 · 844 · 932 px**— y con el aro ya asentado. El
  umbral sale de la primera altura donde la pill entera cabe **sin mover nada**.
  Reutilizar `tests/home.helpers.js` (`sonda`, `asentarGeometria`, `px`) y **no
  reimplementar la sonda**: el motor publica más de una vez y esperar
  milisegundos fijos mide a media convergencia.

---

## 4 · Lo que NO está aquí

Sigue vivo y documentado en `STATE.md`: el **tirón del arco** (espera el banco de
cuatro aros en el teléfono del usuario), **D3** (sidebar con racha y récord), la
**Fase 2 de `pace.events.v1`**, **Wrangler**, **proteger `main`**, los **glifos de
ejercicio** (mecanismo listo desde s166, nunca corrido sobre arte real) y
**«muy similar a web» en móvil** (solo queda la rejilla 2×2 contra la fila de
cuatro).
