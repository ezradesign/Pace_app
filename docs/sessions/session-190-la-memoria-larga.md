# s190 · La memoria larga, y la guarda que sobraba (v0.121.0)

**Fecha:** 2026-09-16 · **Versión publicada:** v0.121.0 · **Suite:** 228 → **236**

> Encargo: los **reducers de `aggregates`** de la Fase 3, lo único que
> desbloquea la Fase 4 (Stats). Lo que salió por el camino: el encargo ya estaba
> medio hecho, la deuda P1 era real y **una de las guardas nuevas sobraba**.

---

## 0 · La auditoría corrigió el encargo

El ROADMAP y el esquema decían «los reducers de `aggregates`, sin cablear», y
`aggregates` **no aparece ni una vez en `app/`**. Las dos cosas son ciertas y
juntas engañan: **`baseline` ya consolidaba dos de los cuatro candidatos**.
`foldEventsIntoBaseline` ([events-model.js:315](../../app/events/events-model.js:315))
acumulaba `totalsByType` y los recuentos de feedback por rutina desde s155.

Lo que faltaba de verdad:

| Pieza | Estado real |
|---|---|
| `totalsByType` · tallies de feedback | **Ya estaban** en `baseline` |
| **Una API que devuelva el valor vivo** (`baseline + fold(retenidos)`) | No existía |
| Totales **por rutina** | No existían |
| Desglose `natural`/`early` · «días con ritmo» | No existían — y **siguen fuera** por decisión |

Y un dato que el único consumidor destapa: la sidebar lee `snap.events` **en
crudo** e ignora `baseline`. Hoy no le pasa nada porque solo cuenta lo de hoy,
pero cualquier consumidor de totales escrito así daría un número corto en cuanto
la poda empiece a morder.

---

## 1 · Las decisiones, con el número que las decidió

Las cinco se le pusieron delante al usuario y eligió las recomendadas:

| Decisión | El dato que la sostiene |
|---|---|
| Solo **totales por rutina** | Es el único agregado que ninguna otra capa puede dar: `state.routineCounts` cuenta por **categoría** (`box`, `coherent`, `rounds`, `atg`), no por id |
| **Un consumidor visible** en la misma sesión | El feedback se capturó en s116 y tardó **28 sesiones** en tener quien lo leyera; los eventos, 17 versiones en tener emisores |
| «Días con ritmo» **NO lo calcula** `aggregates` | `state-history` sigue siendo el dueño (§14). Dos cálculos vivos del mismo número divergen, y el día que lo hagan el test solo dirá que no coinciden |
| Los huérfanos **se conservan** | El total es historia, y la poda ya es irreversible. Quien no sepa nombrar la rutina, no la pinta |
| «Lo has hecho N veces», **sin fecha** | Ver §2 |

---

## 2 · Por qué la copy no lleva fecha, medido

- **No hay nada legacy que sembrar**: ningún contador por rutina existía, así que
  la cuenta arranca en cero para todo el mundo.
- **Las sesiones se emiten desde v0.102.0 (2026-08-20)**, no desde que el
  contenedor se activó (v0.88.0, 2026-08-04). Decir «desde el 4 de agosto»
  exageraría **16 días**.
- Hoy es el 16 de septiembre: el historial máximo real es de **27 días**. Y con
  una ventana de 120 días, **todavía no se ha podado nada** en ninguna
  instalación: el `baseline` está vacío y cada cuenta sale de los crudos.

Así que «N veces» es cierto hoy (son N veces registradas) y **seguirá siendo
cierto en un año**, cuando cubra el año. Un «en los últimos 120 días» habría
envejecido al revés, y además habría dejado `baseline` sin nadie que lo mire.

---

## 3 · La regla del esquema, cumplida literalmente

```
valor vivo = baseline + fold(retenidos)
```

`paceEventsAggregates()` **reutiliza el fold de la poda** en vez de escribir un
segundo contador. Eso da tres cosas gratis: la idempotencia por `pruneCursor`,
el mismo trato a los tipos desconocidos, y que un arreglo en el fold arregle las
dos lecturas. Dos funciones que suman lo mismo es como se acaba con dos cifras
distintas del mismo dato en dos pantallas.

`paceEventsRoutineCount(id)` distingue **tres estados, no dos**: `null` es «el
almacén no puede responder» (`file://`, contenedor ilegible) y `0` es «nunca».
En los dos casos el preview calla — pintar «0 veces» es ruido, y pintar cero
cuando no se sabe es mentir.

---

## 4 · La deuda P1, y la guarda que sobraba

El tercer punto de la Fase 3 era la «normalización P1», y **reproducía**:
`nextRoutineFeedback` guardaba con `cur.yes || 0`, que conserva el TIPO, así que
un `'3'` —de un backup editado a mano o del import, que aún no sanea (deuda
A-7)— pasaba la guarda y la suma lo **concatenaba**: `'3' + 1 === '31'`. Y un
contador corrupto alimenta el veto de la pausa de s189, así que no era
cosmético. Cerrado con `feedbackCount`, el mismo criterio que `eventCount`.

**Y aquí el banco enseñó algo mejor que un mutante en rojo.** Puse *dos* guardas
—una por campo y otra en el incremento— y **ninguna de las dos mordía**: con las
dos puestas, romper cualquiera dejaba los asertos en verde, porque la otra
rescataba el valor. Es exactamente lo que s187 documentó con el filtro de
seguridad duplicado. La solución no fue inventar un mutante más fino: fue
**quitar la guarda de sobra**. Una guarda, un mutante, y muerde.

---

## 5 · La red

| Añadido | Qué defiende |
|---|---|
| **8 tests** en `tests/eventos-agregados.spec.js` | El fold por rutina · que la poda se lleve el detalle y **no el total** · idempotencia · el huérfano · que el preview lo diga y **calle** cuando no hay nada · el **inglés y el singular** · la poda interrumpida · la deuda P1 |
| El aserto de la **poda interrumpida** | Es el **único** sitio donde el filtro por `pruneCursor` defiende algo (ver abajo) |

**Mutantes: 10, y los 10 muerden.** Pero tres hubo que reescribirlos, y las tres
veces por lo mismo — **medir el seam equivocado**:

- **El del cursor no mordía** porque en el camino feliz la poda borra lo que
  acaba de consolidar: retenidos y baseline nunca se solapan y el filtro es
  cinturón y tirantes. Donde sí importa es en la **recuperación** (§22): una poda
  interrumpida que escribió el baseline y no borró los crudos. Ese estado el
  producto no lo sabe fabricar, así que el test lo escribe a mano — la única vez
  en todo el archivo, y por esa razón.
- **Los dos de la deuda P1** no mordían por ser guardas redundantes entre sí
  (§4).

Por qué se siembran eventos viejos en vez de esperar a diciembre: hoy el
`baseline` está vacío en cualquier instalación, así que los dos extremos de la
suma no se distinguen mirando. Se siembra con `occurredAt` inyectado —que
`makeEvent` acepta, derivando el día civil de ese instante y no de hoy (§7.3)— y
se poda a mano. Sigue siendo el contrato: ni una línea del JSON se escribe a
dedo, salvo el caso declarado de arriba.

---

## 6 · Trampas que costaron un rojo

- **El módulo de un evento no se llama como la carpeta**: `EVENT_MODULES_SESSION`
  es `focus`/`breathe`/`move`/**`stretch`**, así que un payload con `module:
  'extra'` **no valida** y `makeEvent` devuelve `null`. Los ids de rutina siguen
  cruzados (`move.*` es Estira); el módulo del evento, no.
- **Cada pieza de la biblioteca existe DOS veces en el DOM** (escritorio y
  móvil) y la hoja apaga la que sobra, así que hay que tomar la de ancho > 0. Ya
  estaba documentado en `transicion-biblioteca.spec.js`; volvió a costar un rojo
  por no leerlo antes.
- **El censo de i18n del verify hay que subirlo a mano** cuando el contenido
  crece a propósito: 588 → 590.

---

## 7 · Lo que NO cubre, dicho

- **El desglose `natural`/`early` no entra**, aunque el dato ya viaje en el
  evento (`completionReason`). Decisión del usuario, no olvido.
- **La cuenta del preview no se prueba tras una sesión REAL**: el test siembra
  eventos por el contrato. Que una sesión de verdad emita ya lo prueba
  `eventos-emisor.spec.js`, pero el camino completo —hacer la rutina y ver subir
  el número— no tiene aserto.
- **`null` vs `0` no está defendido por ningún test**: la suite sirve por HTTP,
  así que el adaptador inerte de `file://` no se ejercita. Es diseño declarado,
  no red.
- **Móvil y ni un píxel**: la línea nueva del preview se colocó leyendo, no
  midiendo. La revisión visual sigue siendo humana.
