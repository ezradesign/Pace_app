# HANDOFF · Glifos de LOGRO · el estado exacto antes de ingestar

> **AGOTADO EN s167 (v0.97.0).** Todo lo que pedia esta HECHO: los 19 dibujos
> ingestados (77 de 96 con mascara), el arte consolidado en UNA carpeta y la
> trampa del §2 **cerrada en el codigo** con un prevuelo probado en rojo -- ya no
> hace falta acordarse de correr el censo antes. **No ejecutes nada de aqui.**
> El estado vivo esta en la seccion «Proxima sesion» de [`STATE.md`](../STATE.md)
> y el relato en [`session-167`](./sessions/session-167-glifos-logro-e-ingles.md).

**Abierto en s167** (sobre v0.96.0). Nada implementado todavía: esto es el
levantamiento del terreno, que resultó tener **dos trampas que destruyen trabajo**
si se corre la ingesta a ciegas.

---

## 1 · Dónde está el arte (y por qué importa)

| Carpeta | Qué hay | Estado |
|---|---|---|
| `..\.old\Glifos_logros` | **91 archivos = 58 dibujos distintos** (el mismo asset exportado con varios timestamps) | **TODOS ya implementados.** 0 sin mapear |
| `..\Glifos de logros` | **19 PNG** | **Los nuevos.** 0 de los 19 está en `MAPEO` |
| `..\Glifos_logros` | — | **NO EXISTE**, y es la ruta que `ingest-glifos-logro.js` trae por defecto |

> **El censo mintió la primera vez y el usuario lo cazó antes que yo.** Contaba
> por NOMBRE DE ARCHIVO, así que los 91 ficheros de `.old` daban «33 dibujos
> libres» que en realidad eran **duplicados de los 58 ya implementados**. La
> unidad es el **dibujo**, no el fichero: se deduplica por id de asset
> (`asset_<id>_<timestamp>.png`). Corregido en
> `scripts/audit/censo-glifos-logro-huecos.js`.

## 2 · LA TRAMPA QUE DESTRUYE TRABAJO

`scripts/ingest-glifos-logro.js` **borra TODAS las máscaras del destino antes de
regenerarlas**:

```js
for (const f of fs.readdirSync(DESTINO)) if (/\.webp$/i.test(f)) fs.unlinkSync(...)
```

Y regenera **solo lo que encuentre**. Como el arte vive hoy en **dos carpetas** y
el script acepta **una sola**, correrlo apuntando a `..\Glifos de logros`
**destruiría las 58 máscaras que funcionan** y dejaría 19.

**Antes de ingestar hay que hacer una de estas dos:**

- **(a)** enseñar al script a aceptar **varias carpetas de origen** (es lo
  limpio: el arte está repartido y va a seguir estándolo), o
- **(b)** juntar todo el arte en una sola carpeta y apuntar ahí.

El censo comprueba justo esto y lo imprime: *«assets del MAPEO que NO se
encuentran en disco: 0 ← si esto no es 0, NO correr la ingesta»*.

## 3 · El hueco

- **96** logros en el catálogo · **58** con arte · **38 sin arte**.
- **19** dibujos nuevos ⇒ taparán 19 y **quedarán 19 sin arte**.

## 4 · Lo que falta decidir: qué dibujo va a qué logro

Los PNG vienen con nombre de **timestamp**, así que la asignación es una decisión
de MIRAR y la toma el usuario. Hoja de contactos numerada:
`node scripts/audit/hoja-glifos-logro-nuevos.js <repo> <salida.png>`

**El número es solo para conversar.** El `MAPEO` se escribe por **nombre de
archivo** — clave estable. Indexar por posición es exactamente lo que s146
demostró que reasigna los glifos en silencio (0 de 50 posiciones seguían
coincidiendo al añadir 8 dibujos).

### Propuesta, con su nivel de confianza

**Alta — el dibujo casi nombra al logro:**

| # | Dibujo | Logro | Por qué |
|---|---|---|---|
| 3 | jarra con marcas de medida | `hydrate.week.perfect` | «8 vasos / 7 días». Es el que **perdió** su dibujo a propósito en s147 y la prioridad nº1 de STATE |
| 13 | manantial brotando de la roca | `master.hydrate.90` | el logro se llama literalmente **«Manantial»** |
| 15 | farol con sol Y luna | `season.equinox.autumn` | equinoccio = día y noche iguales |
| 19 | dos hojas (roble) | `season.autumn` | otoño |
| 6 | escritorio con silla | `explore.desk` | «tres sesiones **sin levantarse**» |
| 2 | rodilla / esqueleto de pierna | `master.atg.20` | «**Rodillas** de acero» |
| 7 | rosa de los vientos vegetal | `explore.all.move` | «Cuerpo de campo · **todas** las movilidades» — las direcciones |
| 12 | lasca de sílex | `explore.ancestral` | ancestral |

**Media — encaja, pero admite discusión:**

| # | Dibujo | Logro | Por qué |
|---|---|---|---|
| 5 | vértebras | `explore.neck` | cuello |
| 10 | bisagra | `master.hips.20` | «**hip hinge**» es literalmente el término del movimiento |
| 14 | sandalias de esparto | `master.ancestral.10` | «Primitiva» |
| 16 | reloj de bolsillo | `master.midnight.never` | «30 días sin uso tras las 23 h» |
| 17 | campana de mano | `secret.lunch` | la campana del mediodía |
| 9 | vela encendida | `secret.dark.mode` | 7 días en oscuro |
| 18 | puente de madera | `streak.7` o `master.hydrate.30` («Río constante») | salvar días seguidos / cruzar el río |

**Sin propuesta — hay que mirarlos:** **1** (planta del pie), **4** (cepillo de
carpintero), **8** (piedra de afilar), **11** (banco / tablero sobre patas).

### Los 38 sin arte, por categoría

- **constancia (4)** — `streak.7` · `streak.14` · `breathe.sessions.50` · `hydrate.week.perfect`
- **estacionales (3)** — `season.summer` · `season.autumn` · `season.equinox.autumn`
- **estadísticas (2)** — `stats.month.focus` · `stats.streak.30`
- **exploración (10)** — `explore.box` · `explore.rounds` · `explore.kapalabhati` · `explore.shoulders` · `explore.atg` · `explore.ancestral` · `explore.neck` · `explore.desk` · `explore.all.move` · `explore.all.extra`
- **maestría (12)** — `master.pomodoro.8` · `master.long.focus` · `master.box.15` · `master.rounds.15` · `master.atg.20` · `master.hips.20` · `master.shoulders.20` · `master.ancestral.10` · `master.hydrate.30` · `master.hydrate.90` · `master.extra.all.week` · `master.midnight.never`
- **secretos (7)** — `secret.cow.click` · `secret.lunch` · `secret.rain` · `secret.first.monday` · `secret.new.year` · `secret.dark.mode` · `secret.zen`

## 5 · El orden de trabajo cuando se retome

1. Correr el censo y comprobar que **«assets que NO se encuentran» sea 0**.
2. Resolver §2 (varias carpetas de origen, o juntar el arte).
3. Cerrar la asignación con el usuario sobre la hoja de contactos.
4. Añadir las filas al `MAPEO` **por nombre de archivo** y anotar el porqué en
   `docs/product/MAPEO_GLIFOS_LOGRO.md`.
5. Correr la ingesta, `node build-standalone.js`, `npm run verify` (el CENSO de
   máscaras subirá de **58** y hay que actualizarlo) y `npm run test:e2e`.
6. **Revisar el resultado con el usuario a tamaño real**: la lección de s147 es
   que **la revisión al tamaño real ES el detector** — allí salieron el sello
   flotando 11 px y el moteado del tramado.

## 6 · Lo que NO se ha tocado

Nada de `app/`, nada del `MAPEO`, ninguna máscara. Los dos scripts nuevos
(`censo-glifos-logro-huecos.js` y `hoja-glifos-logro-nuevos.js`) **solo leen**.
