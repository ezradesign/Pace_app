# Sesión 154 — UN TEST QUE NO HAS VISTO FALLAR NO PRUEBA NADA

**Fecha:** 2026-08-04
**Versión:** v0.86.0 → **v0.87.0**
**Frente:** CI, segunda pieza — Playwright
**Artefacto verificado:** `index.html` v0.87.0 · `PACE_standalone.html` intacto (`998E3E358D689036`)

---

## 0. Qué entraba, decidido con el usuario antes de tocar nada

Playwright cubre exactamente **el primer hueco que el `verify` declara e imprime en cada
pasada**: *«comportamiento: no abre navegador, no monta la app, no pulsa nada»*
(`scripts/verify.js:384`). Pero «montar Playwright» son tres decisiones muy distintas y se
cerraron antes de escribir una línea:

| Decisión | Elegido |
|---|---|
| ¿Dónde vive en el CI? | **Job `e2e` aparte**, con `needs: verify`, invocando `npm run test:e2e` |
| ¿Qué cubre? | **El checklist de cierre de CLAUDE.md entero**, con `page.clock` para el Pomodoro |
| ¿Contra qué se sirve? | **`.claude/static-server.js`**, que ya existía y está committeado |

**Fuera**: Wrangler, proteger `main`, D3/D6/D7 y el ayudante de geometría de la home.

---

## 1. Antes de escribir un aserto: reconocimiento del DOM real

No se inventó ni un selector. Once bancos de reconocimiento condujeron el artefacto y
volcaron lo que había, y de ahí salieron cosas que ninguna lectura del código habría dado:

- Las filas de rutina de Respira/Mueve **no son `<button>`**: son `<div class`-menos con
  `cursor:pointer` y un `<h4>` dentro. Se pulsa el encabezado y el evento burbujea.
- La biblioteca de Mueve **no abre la sesión**: abre el **Preview de §18.3** (s144), cuyo CTA
  es «Empezar» a secas.
- El toast **no sale al desbloquear**. Desde s145 `unlockAchievement` **encola** y el aviso lo
  drena un cierre de sesión; el vaso de agua es la única acción que acredita sin pasar por uno,
  y por eso drena su propia cola (`state-hydrate.jsx:70`). Dice **«Nuevo sello · Primer sorbo»**
  y vive 3 s.
- **`page.clock` funciona limpio** con el Pomodoro, porque `useCountdown` es *timestamp-based*:
  25:00 → 24:58 con `runFor(2000)`, y `runFor(25 min)` abre el BreakMenu de verdad.

Y confirmó, sin re-medirlos, los datos que traía la sesión: **53** sellos en el modal, **0/88 →
1/88** con `first.sip`, Hidrátate persiste, oscuro `rgb(29,26,20)`, caché `pace-v0.86.0` con
**86** entradas y **58** bajo `/logros/`.

---

## 2. La primera trampa era MÍA: `addInitScript` corre en CADA navegación

La suite tiene que sembrar `firstSeen` o todos los tests arrancan **dentro del onboarding**
(aviso que venía en el encargo). Sembrarlo a secas parecía obvio… y dejó **la prueba de
persistencia en rojo con la app intacta**: `addInitScript` se ejecuta también en los
`reload()`, así que mi semilla machacaba lo que la app acababa de guardar y `water` volvía a
salir vacío.

El arreglo es de una línea y está documentado en `tests/helpers.js`: **sembrar solo si falta**.
El primer arranque siembra, la recarga respeta.

> Si hubiera reportado eso sin mirar debajo, habría sido «Hidrátate no persiste» — un bug
> inexistente, como el de s151.

---

## 3. El instrumento midió una cosa y los asertos comparan otra

El primer `npm run test:e2e` dio **10 verdes y 3 rojos**, y los tres eran la misma causa:

| Reconocimiento (`innerText`) | DOM real (`textContent`) |
|---|---|
| `FOCO MANUAL` | `Foco manual` |
| `COLÓCATE` | `Colócate` |
| `NUEVO SELLO` | `Nuevo sello` |

`innerText` devuelve el texto **renderizado**, con el `text-transform` de CSS ya aplicado; los
matchers de Playwright (`toHaveText`, `getByText`) comparan contra **`textContent`**. Medir con
un instrumento y asertar con otro cuesta tres rojos. Queda escrito en la cabecera de
`tests/helpers.js`, que es donde se va a volver a pisar.

Van cinco sesiones seguidas con el mismo patrón (s151, s152, s153 y esta, dos veces).

---

## 4. Los 21 rojos — y los CUATRO que no mordieron, que son el hallazgo

Mismo listón que s150 y s152: banco que guarda los bytes, rompe algo **real**, corre el spec,
exige salida ≠ 0, restaura en un `finally` y **comprueba el hash**. Se parchea `index.html` y
`sw.js` directamente en vez de tocar `app/` y rebuildear: es lo que los tests cargan, evita 21
builds y —sobre todo— **no reescribe `PACE_standalone.html`**, congelado desde s134.

Y antes de romper nada, **calibración**: cada `-g` tiene que apuntar a **un solo test**. La
primera versión del banco no lo hacía y dio cuatro «rojos» que eran `No tests found` — con
`shell:true` los argumentos se concatenan **sin comillas**, así que un grep con espacios llegaba
partido. Un rojo que no es el que crees vale menos que ninguno.

**Los cuatro que siguieron VERDES con la app rota:**

| Rotura | Por qué no mordió |
|---|---|
| `'Pausar'` → `'PausarX'` | `getByRole({name})` casa por **SUBCADENA**: `PausarX` contiene `Pausar` |
| `Pausa bien hecha` → `…X` | igual, `getByText` sin `exact` |
| `Nuevo sello` → `…X` | `toContainText` es subcadena **por definición** |
| miniatura del sidebar | **rompí la línea equivocada** |

Los dos primeros eran **debilidad real de mis asertos**: se arreglaron con `exact: true`, y
ahora un renombrado de etiqueta se caza. El tercero se arregló cambiando la rotura por la
regresión de verdad —que **la cola no se drene** (`flushAchievementToast('hydrate')`)—, que es
lo que ese aserto tiene que proteger.

El cuarto es el más instructivo. El artefacto tiene **varias** llamadas a `renderGlyph` y yo
rompí una que no era: la miniatura del sidebar resuelve por `const dibuja = window.renderGlyph`
(`achMini`). Lo dijo **la cadena de ancestros de la máscara sobrante**
(`data-pace-sidebar-achievements`), no una deducción. s147 unificó el render en una sola
función, pero **los puntos de llamada siguen siendo cuatro**, y no son intercambiables.

**Resultado final: 21 de 21 en rojo, los 21 restaurados byte a byte con hash comprobado.**

---

## 5. Qué se aserta, y por qué casi nada lleva número

La decisión RELACIONAL vs CENSO de s152 se aplicó tal cual, y aquí casi todo pudo ser
relacional:

- **Precache**: en vez de censar 86, se leen las rutas **declaradas en `sw.js`** y se comparan
  con las que el navegador tiene **de verdad** en su caché, como conjuntos. `addAll` es atómico,
  así que tienen que ser el mismo. Crecer el precache a propósito **no** pone esto rojo. Y el
  nombre de la caché se aserta contra `PACE_VERSION`, no contra un literal.
- **Sellos**: el número esperado se **deriva del catálogo vivo** con la regla de s152 —«58
  máscaras menos los secretos con máscara aún bloqueados»— en vez de escribir 53. Con su
  **guard de cero**: si el catálogo no declara ni una máscara, es **fallo explícito**, no un
  `0 == 0` silencioso. Ese guard es justo el que cazó la rotura de `achievementMaskUrl`.
- **Versión**: forma de versión, no el número. Ese ya lo aserta el verify en sus tres sitios.

Y la **trampa de s152 se aserta en vez de sortearse**: el test exige que contar sobre la página
entera dé **más** que contar dentro de `[data-pace-modal-backdrop]`, porque la miniatura del
sidebar pinta por el mismo `renderGlyph`. Quien cuente sin acotar medirá otra cosa.

---

## 6. El job aparte, y por qué no viola la tesis de s153

`.github/workflows/ci.yml` pasa a **dos jobs**. La regla de s153 —**el CI invoca, no
reinterpreta**— sigue intacta: el YAML solo llama a `npm run test:e2e`, que corre igual en
local con un comando.

Va **aparte** y no como pasos del job `verify` porque las dos redes tienen coste y naturaleza
distintos: el `verify` son ~5 s sin dependencias y es el **paso 2 del cierre**, del que depende
«si falla, no se sigue»; esto descarga un Chromium de ~115 MB. Meter los navegadores dentro de
`npm run verify` convertiría ese comando en minutos.

**`needs: verify` no es orden estético**: la suite carga el `index.html` **committeado**, y es
el job de arriba el que acaba de probar que ese artefacto es el build de las fuentes. Sin esa
garantía, un rojo aquí significaría «cambió el comportamiento» **o** «el artefacto está viejo»,
que son dos arreglos muy distintos.

El YAML se validó **parseándolo**, no a ojo: 2 jobs, `e2e` con `needs: verify`, 6 pasos.

---

## 7. Una carrera que me contaminó dos medidas

A mitad de sesión el `npm run verify` avisó de que `index.html` **difería de las fuentes**, y no
era cierto: **el banco de rojos estaba parcheando el artefacto en ese mismo momento** en
segundo plano. Dos procesos míos escribiendo el mismo archivo. Las dos pasadas se repitieron
limpias con el banco ya terminado.

Es la misma lección de siempre, en versión nueva: **antes de creerse una medida, comprobar que
nada más estaba tocando lo que se mide**.

---

## 8. Verificación

- **`npm run verify` PASA — 0 problemas en 6,3 s**, 4 tandas, versión **v0.87.0** coherente en los
  tres sitios. Los 2 avisos son los de siempre (standalone restaurado, deriva del artefacto antes
  del paso 3).
- **`npm run test:e2e` PASA — 13 de 13 en 24,1 s**, contra el `index.html` **v0.87.0 recién
  regenerado**. Incluye la caché del SW, que ahora es `pace-v0.87.0`: **el aserto relacional
  sobrevivió al bump solo**, que era exactamente el punto de derivarlo de `PACE_VERSION`.
- **21 de 21 rojos**, los 21 archivos restaurados **byte a byte con el hash comprobado**
  (`8F65BD6C57592B00` para `index.html`, `25E86D08F5FFDF40` para `sw.js`).
- **`index.html` regenerado**: difiere de HEAD en **exactamente 2 líneas** —`<title>` y
  `PACE_VERSION`— y contiene **0 bytes CR** de 1 290 777. Hash `C47EA596DBDEB67D`.
- **`PACE_standalone.html` restaurado** a `998E3E358D689036` (comprobado, no supuesto).
- **`npm ci` sincronizado** con el lock, que es lo que corre el CI.
- **YAML validado parseándolo**: 2 jobs, `e2e` con `needs: verify`, 6 pasos.

**Lo que NO se pudo verificar en esta sesión**: el run real del CI. El cierre entrega el commit y
es el usuario quien empuja, así que el job `e2e` **todavía no se ha ejecutado en GitHub**. Y la
lección de s153 sigue en pie — **simular no es ejecutar**: la secuencia local en verde no es
prueba de que el runner lo esté. Conviene mirar el run después del push, con la API pública
porque `gh` sigue sin instalar.

---

## 9. Estado al cerrar

El frente CI queda con **dos de sus cuatro piezas dentro**. El `verify` sigue declarando sus
huecos, y el primero ya **dice dónde se cubre** en vez de quedarse en la queja.

**Lo que sigue:**

1. **Wrangler** — deploy a Cloudflare Pages. Inerte hasta que existan los secretos de la cuenta
   del usuario en GitHub.
2. **Proteger `main`** — instrucciones en `WORKFLOW.md` §8, acción del usuario. `gh` sigue sin
   instalar.

Y lo que esta suite **no** cubre, declarado igual que hace el verify: un solo navegador
(Chromium), un solo idioma (ES), un solo viewport (1280×720), cero móvil, cero Caminos, cero
premium, y **ni un píxel comparado** — no hay capturas de referencia.
