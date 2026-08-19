# HANDOFF · s171

**Punto de partida limpio.** Versión **v0.100.0** en los 7 sitios, `npm run verify`
PASA, `npm run test:e2e` **97/97**, `PACE_standalone.html` intacto en v0.71.0.

> El ESTADO vive en [`STATE.md`](../STATE.md). Esto es el **plan de trabajo**: lo
> que ya está medido para no volver a medirlo, y las trampas que costaron tiempo.
> Si los dos se contradicen, gana `STATE.md`.

---

## 1 · Lo que hay que decidir ANTES de tocar nada

Tres preguntas al usuario, las tres bloquean trabajo real:

1. **Las 2 piezas sin identificar** (`09` y `14` de la hoja de contactos). `09` es
   un segundo glúteo de pie casi calcado al 33; `14` parece otra vista del 90/90 con
   la flecha de rotación. Están en la hoja de comprobación.
2. **¿Alguno de los 47 está mal asignado?** Es lo único que no se puede verificar
   sin el ojo del usuario, y es lo que más caro sale si se queda.
3. **Los 17 «media-alta»**: Fondos en silla, Sentadilla a silla, Flexiones
   inclinadas, Hueco en silla y Puente torácico **deberían llevar silla o mesa**
   según el encargo y el generador las dibujó sin nada. ¿Se regeneran o se aceptan?

---

## 2 · Fase 3 de `pace.events.v1` · PASO 2, los emisores

**El PASO 1 está CERRADO** (contabilidad de pausa en los dos runners de cuerpo).
Lo que queda es el emisor, y **las cuatro decisiones abiertas ya están contestadas**
por `docs/product/EVENTOS_SCHEMA.md` — que es el documento que hay que leer ANTES de
razonar nada, porque en s170 tres de cuatro respuestas «deducidas» salieron mal:

- **`runId`** (§7.1/§7.2): obligatorio en `session.completed` y `feedback.answered`,
  el mismo en los dos. **La receta UUIDv4 ya está implementada** en
  `events-model.js:58` — no hay que escribirla. Se genera en el runner (donde hoy se
  fija `sessionStart`) y se pasa como prop nueva a `SessionFeedback`; **no necesita
  persistirse**, porque el feedback sólo se contesta con el DONE montado.
  - Consecuencia a aceptar por escrito: el feedback **no se muestra dentro de un
    Camino**, así que `feedback.answered` nunca correlacionará con una sesión de
    Camino. Ya es cierto hoy; el evento sólo lo hereda.
- **`plannedSeconds`** (§6.4): Foco = preset (15/25/35/45), `preset` · v1 =
  `estimateDuration().minSec`, `derived` · legacy = `routine.min × 60`, `declared`.
  `routine.min` NO sirve para v1: `v1DevCheckDuration` existe porque el declarado se
  desvía del calculado.
- **`completionReason`** (§6.3): `early` **sí tiene referente** —`finishRepsEarly`
  («Terminar antes», `MoveSessionV1.jsx`) y el «Saltar» del descanso son «control
  explícito de finalización anticipada»—. Salir por `× Salir` **no emite nada**.
- **`context` / `pathRunId`** (§7.1): la distinción ya viaja por
  `completeFocusSession('path'|'home')` y por la prop `inPath` de los runners.
  `paths.current` (en `state-paths.jsx`) nace y muere con la ejecución: ahí va el
  `pathRunId`.

### EL DESAJUSTE QUE HAY QUE MAPEAR, o se pierden eventos en silencio

`EVENT_STEP_KINDS` es `['focus','breathe','move','stretch','hydrate']`, pero el
registro de Caminos usa **`kind:'body'`** (`app/paths/registry.js`). Hay que mapear
`'body'` → `move` si el `routineId` empieza por `move.`, `stretch` si empieza por
`extra.`. Sin ese mapeo `normalizeEventPayload` devuelve `null` para **todos** los
pasos de cuerpo y `path.step.completed` se pierde **sin hacer ruido**.

Y ojo: el enum del evento llama **`stretch`** a lo que el código llama `extra`.

### Dónde va el emisor (decisión ya tomada en s169)

En la **capa de estado**: las `complete*` ganan un argumento opcional y emiten junto
a la escritura legacy (dual-write). Un punto de emisión por módulo en vez de seis
repartidos, que es además lo que hace auditable el gate del `verify`.

### Lo que el PASO 1 dejó listo

`useActiveClock` (`app/ui/SessionClock.jsx`) y `v1TrabajoActivo`
(`MoveSessionV1.support.jsx`). El valor ya se publica en el DONE como
`data-pace-active-sec` — **ése es el consumidor provisional**; cuando el emisor lo
consuma de verdad, ese atributo puede quedarse (lo usa `tests/cuerpo-tiempo-activo.spec.js`)
o retirarse migrando el test.

---

## 3 · Glifos · lo que queda y cómo entra

- **47 de 61 con arte.** Pendientes: `docs/product/GLIFOS_EJERCICIOS_PENDIENTES.md`
  (las 14) y `docs/product/GLIFOS_ESTIRA_PENDIENTES.md` (las 11 que salen en Estira).
- **El utillaje vive en `scripts/glifos/`**: `mapa-estira.txt` (la asignación
  cerrada), `aplicar-mapa.js` (valida y renombra) y `generar-pendientes.js`.

**LA TRAMPA QUE MÁS CARO SALE**: la ingesta **reescribe el mapa ENTERO**. Si se corre
con una carpeta que sólo lleva los dibujos nuevos, **los 47 que ya están se borran**.
La carpeta de origen tiene que llevarlos todos.

Ajustes por defecto (todos apagables por bandera, y todos **inertes** sobre un
dibujo de línea negra ya encuadrado):
`--recorte 220` · `--gamma 3.0` · `--nitidez 1.6` · `--rojo-lum 150` ·
`--radio 0.98` · `--centro-x circulo` · `--centro-y circulo` ·
`--min-lado 192` · `--min-gamma 5` · `--min-grosor 3`.

Tras ingestar: `node build-standalone.js` · `npm run verify` · `npm run test:e2e`,
y **subir a mano** el censo `precache` de `scripts/verify.integridad.js` —
**dos filas por pieza** desde s170 (la máscara y su miniatura).

---

## 4 · Trampas medidas en s170 (no volver a pagarlas)

- **`file://` bloquea la máscara por CORS.** Un glifo en blanco ahí no dice nada del
  producto. Servir por HTTP para mirar `index.html`.
- **`sharp` reordena sus operaciones**: `extend` va DESPUÉS de `resize`. Encadenar
  `.extract().extend().resize()` da un lienzo del tamaño equivocado; relleno lateral
  ⇒ **rayas diagonales**. Pasadas separadas.
- **`sharp` promueve un raw de 1 canal al redimensionar.** Leer `info.channels`,
  nunca suponerlo. Costó tres rojos en una sola sesión.
- **La ingesta sale con código 1 mientras queden identidades sin arte**, así que
  encadenarla con `&&` corta el resto del comando.
- **Un aserto atado a un nombre de ejercicio caduca** en cuanto ese ejercicio recibe
  arte. Los tests de glifos preguntan al mapa, no nombran piezas.
- El **standalone** se restaura tras cada build (`git checkout -- PACE_standalone.html`):
  el build reescribe los dos artefactos y el standalone es export bajo demanda (s134).

---

## 5 · Lo demás que sigue vivo

Los **19 glifos de logro** sin dibujar · la decisión **A vs B** del tamaño de glifo
(hoy el +50 % lo llevan sólo los anatómicos; pasarlo a los 41 SVG es cambiar `44/72`
por `57/72` en `MoveModule.jsx:342`) · el **tirón del arco** · **D3** · **Wrangler** ·
**proteger `main`** · el camino de fallo de caché del CI, nunca ejercitado.
