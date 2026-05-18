# Sesion 78 -- Catalogo Caminos 5 -> 7 (path.tea + path.breath) + redisenio PathHydrateStep + logro master.path.all7

**Fecha:** 2026-05-17
**Version:** v0.31.0 -> **v0.32.0**
**Tipo:** feature (catalogo) + redisenio (step Hydrate) + logro nuevo + extension getSuggestedPath
**Diario predecesor:** [session-77b-fix-microcopia.md](./session-77b-fix-microcopia.md)

---

## TL;DR

Cierra el catalogo de Caminos a **7**, anyadiendo `path.tea` (Infusion --
sobremesa) y `path.breath` (Halito -- micropausa de respiracion). Introduce
un slot horario nuevo `'anytime'` para Caminos sin hora fija (consumido
solo por `path.breath`) y enriquece `getSuggestedPath` para que, ademas de
respetar la preferencia del usuario (`lastViewed`, s75), pueda sugerir el
Camino del momento por hora del dia con `'anytime'` como fallback antes de
`catalog[0]`.

El step `PathHydrateStep` del PathRunner se reescribe de cero para que
hable el mismo lenguaje visual que el `HydrateModule` del home: contador
Garamond italic gigante (`today/goal`) en `var(--hydrate)`, grid de vasos
visualizando el estado actual y dos botones (`Saltar` outline / `Beber`
relleno) del **mismo peso visual** para reforzar la naturaleza opcional.

Se anyade un unico logro nuevo, `master.path.all7` ("Cartografa"), que se
desbloquea al completar al menos una vez cada uno de los 7 Caminos. Glifo:
heptagono regular (7 puntos + centro), familia visual de `streak.7` y
`streak.365`.

Sin cambios en `PathTransitions`, `SenderoBar`, `TimerDial` ni en la
maquina de phases del PathRunner. Limite autoimpuesto: 1 solo logro nuevo
en esta sesion.

---

## Contexto

s77/s77b cerraron el ciclo UX del overlay del Camino (PathTransitions
+ retirada de sticky + microcopia + CTAs en `--focus-cta`). v0.31.0 quedo
publicado y sin observaciones abiertas. El catalogo seguia en 5 Caminos
desde s49 (`dawn / midday / afternoon / dusk / weekend`) -- s78 lo
completa a los 7 prometidos en el prompt original del proyecto.

El step `PathHydrateStep` era el unico de los 4 kinds que NO seguia el
lenguaje visual del modulo equivalente del home (circulo 64px con emoji
`💧` + un parrafo en Garamond + dos botones de jerarquia desigual --
"Saltar" outline gris vs "He bebido" oscuro). Visualmente se sentia
extranyo dentro del overlay y reforzaba mal la opcionalidad del paso.

---

## Que se hizo

### 1. `app/paths/registry.js` -- +2 entradas en PATH_CATALOG

```js
{
  id: 'path.tea',
  nameKey: 'paths.path.tea.name',
  taglineKey: 'paths.path.tea.tagline',
  timeOfDay: 'afternoon',
  steps: [
    { kind: 'breathe', routineId: 'breathe.coherent.55' },
    { kind: 'hydrate',                                    optional: true },
    { kind: 'focus',                                      min: 10 },
  ],
  access: 'free',
},
```

Insertada entre `path.afternoon` y `path.dusk` para preservar el orden
cronologico del catalogo. Duracion total ~17 min (5 breathe + ~2 hydrate
opcional + 10 focus). Reenganche progresivo: respiracion coherente baja
revoluciones, hidratacion suma vaso si apetece, foco corto sin presion
(10 min vs 25 estandar) para volver a la tarea sin sentir que se entra
en otra Pomodoro entera.

```js
{
  id: 'path.breath',
  nameKey: 'paths.path.breath.name',
  taglineKey: 'paths.path.breath.tagline',
  timeOfDay: 'anytime',
  steps: [
    { kind: 'breathe', routineId: 'breathe.478' },
    { kind: 'breathe', routineId: 'breathe.coherent.55' },
  ],
  access: 'free',
},
```

Anyadida al final del array. Duracion ~8 min: dos respiraciones distintas
back-to-back (4-7-8 relajante + coherente 5-5 balance) que dan una
micropausa rica sin tocar foco ni cuerpo. Primer Camino con `timeOfDay:
'anytime'`.

### 2. `app/state-paths.jsx` -- `getSuggestedPath` enriquecida

La funcion vivia desde s75 en "lastViewed wins; si no, `catalog[0]`".
Pasaba por encima de `timeOfDay` por completo. s78 la reescribe con
jerarquia explicita de 4 niveles:

```
1. lastViewed (s75)    -- preferencia del usuario manda siempre.
2. timeOfDay match     -- sabado/domingo: slot 'weekend' gana.
                          Resto: slot horario actual (morning < 9h,
                          midday < 13h, afternoon < 17h, evening >=17h).
3. 'anytime' (s78)     -- fallback antes de catalog[0].
4. catalog[0]          -- ultimo recurso, nunca devuelve null si hay
                          al menos un Camino.
```

Decision clave: **lastViewed sigue ganando**. El usuario validar runtime
en s75 que prefiere que la card del home muestre el ultimo Camino abierto
(memoria > sugerencia contextual). La logica horaria entra solo cuando
nunca abriste ninguno (primer uso o tras reset). Esto evita romper la
inversion de decisiones que ya validamos en s75 mientras se incorpora la
informacion horaria que el catalogo ya tenia.

Se anyade un hook en `advancePathStep` para disparar `checkAllPathsCompleted`
tras cerrar un Camino. Se llama con `setTimeout(0)` para que el detector
lea el `state` ya actualizado (post-`setState` que escribe el nuevo
`completed[id].count`) y se evite cualquier re-entrada en el reducer.

### 3. `app/i18n/strings.js` -- +8 claves ES/EN

**Caminos nuevos (4 claves x 2 idiomas = 8):**

| Clave | ES | EN |
|---|---|---|
| `paths.path.tea.name` | Infusion | Steeping |
| `paths.path.tea.tagline` | Un vapor breve, y la tarde recobra forma. | A brief steam, and the afternoon takes shape again. |
| `paths.path.breath.name` | Halito | Breath |
| `paths.path.breath.tagline` | Dos vientos cortos para volver. | Two short winds to return. |

Tono editorial alineado con las taglines existentes ("Una flor que abre
con la primera luz", "Un circulo de luz, todo lo demas en penumbra"):
imagenes sensoriales breves, sin metricas, sin verbos imperativos.

**Microcopy hydrate redisenada (4 claves x 2 idiomas = 8, 2 reemplazos +
2 nuevas):**

| Clave | ES | EN |
|---|---|---|
| `path.hydrate.copy` *(reemplazo)* | Si te apetece, suma un vaso. | If you feel like it, add a glass. |
| `path.hydrate.drank` *(reemplazo)* | Beber | Drink |
| `path.hydrate.skip` *(nueva)* | Saltar | Skip |
| `path.hydrate.glasses.today` *(nueva)* | Vasos hoy | Glasses today |

La nueva `path.hydrate.skip` permite hacer el boton de skip especifico
del step (mismo texto que el global `path.runner.skip` por ahora, pero
disponible para futuras variantes). `path.hydrate.glasses.today` etiqueta
el meta-label del contador, mismo formato que el `hydrate.glasses.today`
del HydrateModule del home (sin reusar la clave para no acoplar dominios).

### 4. `app/paths/PathRunner.jsx` -- redisenio PathHydrateStep

Componente de ~50 ln pasa a ~108 ln. Nuevo layout vertical:

- **Contador grande** -- `clamp(72px, 12vw, 112px)` en EB Garamond italic.
  `today` en `var(--hydrate)`, ` / goal` en `var(--ink-3)` a 0.42em. Mismo
  patron que `HydrateTracker.jsx:15-22`.
- **Meta-label** -- 11px, tracking 0.22em, uppercase, `var(--ink-3)`,
  "Vasos hoy".
- **Grid de vasos visuales** -- `gridTemplateColumns: 'repeat(${goal}, 1fr)'`,
  gap 6px, max-width 360px. Cada vaso `aspectRatio: '1/1.3'` con border
  `1.5px solid var(--line)`. Los `today` primeros se rellenan con fondo
  `var(--hydrate-soft)` y border `var(--hydrate)`, y llevan un overlay
  interno desde `top: 40%` con `var(--hydrate-soft)` + `borderTop` --
  copia 1:1 del patron del HydrateModule. **Diferencia importante**: en el
  PathRunner los vasos **NO son interactivos** (es un step de Camino, no
  un tracker). Visualizan; no permiten +/- desde aqui. La accion canonica
  es el boton "Beber" abajo.
- **Copy** -- 18px EB Garamond italic, `var(--ink-2)`, max-width 360px.
- **Botones del mismo peso visual** -- ambos comparten `btnBase` (padding
  `10px 28px`, radius `--r-sm`, fontSize 13, font display italic). Unica
  diferencia: "Saltar" outline (`border: 1px solid var(--line-2)`,
  background transparent, color `--ink-2`), "Beber" relleno (`background:
  var(--hydrate)`, border `--hydrate`, color `--paper`). Sin jerarquia
  visual de CTA principal/secundario: la accion es de verdad opcional,
  el boton no manda.

Lectura de estado via `usePace()`: `today = state.water.today || 0`,
`goal = state.water.goal || 8`. Defensa contra estados no inicializados.
"Beber" llama `addWaterGlass(1)` dentro de try/catch (regla del proyecto:
sonido y mutaciones colaterales no rompen la app) y luego `onDone()`.

### 5. `app/achievements/Achievements.jsx` -- logro `master.path.all7`

**Entrada en catalogo (categoria maestria, posicion final):**

```js
{ id: 'master.path.all7', cat: 'maestria',
  title: 'Cartografa',
  desc: 'Recorre los siete caminos al menos una vez',
  glyph: '✦',
  glyphSvg: GLYPH_SVG['master.path.all7'] },
```

Patron consistente con los 90+ logros del catalogo: `title` y `desc` como
strings hardcoded en espanyol. La traduccion del catalogo de logros sigue
diferida -- introducir `t()` para UNA entrada nueva crearia inconsistencia
con el resto.

**Glifo SVG (heptagono):**

```svg
7 circulos r=1.6 en los vertices del heptagono inscrito en 32x32 +
1 circulo central r=2.4 + path conectando los 7 vertices en bucle,
stroke 0.5 opacity 0.5.
```

Familia visual de `streak.7` (heptagono) y `streak.365` (multipunto). El
centro mayor marca "completo / cerrado". Coordenadas calculadas a partir
de centro (22, 22) con radio 16, vertices en angulos 12 grados / 90 / 168
/ 240 / 270 / 300 / 24 (aprox).

**Anyadido a `IMPLEMENTED_ACHIEVEMENTS`** bajo nuevo subgrupo "Caminos
(1/1)". Sin la entrada en este Set el logro saldria como "Pronto" en la
biblioteca aunque su detector estuviera vivo.

### 6. `app/state-achievements.jsx` -- detector `checkAllPathsCompleted`

```js
function checkAllPathsCompleted() {
  const s = getState();
  const catalog = (typeof window !== 'undefined' && window.PATH_CATALOG) || [];
  if (catalog.length < 7) return;
  const compl = (s.paths && s.paths.completed) || {};
  for (let i = 0; i < catalog.length; i++) {
    const entry = compl[catalog[i].id];
    if (!entry || (entry.count || 0) < 1) return;
  }
  unlockAchievement('master.path.all7');
}
```

Guard `catalog.length < 7` evita que se dispare en escenarios futuros
donde el catalogo cambie de tamano (reduccion accidental, A/B test, etc.).
La comprobacion es por id, no por count agregado -- exigir uno de cada
hace el logro mas significativo que "completar 7 cualquiera".

Exportada a `window` para que `state-paths.jsx` la consuma via
`window.checkAllPathsCompleted` (mantiene la convencion de no acoplar
modulos via import en este proyecto sin build-step).

### 7. Bump version v0.32.0

- `app/state-core.jsx`: `PACE_VERSION = 'v0.32.0'`.
- `PACE.html`: `<title>PACE · Foco · Cuerpo — v0.32.0</title>`.
- `sw.js`: `CACHE_NAME = 'pace-v0.32.0'`.

---

## Decisiones tomadas (sin consulta -- "lo mas profesional")

El usuario delego con "lo que sea mas profesional" tras presentar el
plan. Decisiones tomadas:

| # | Decision | Razon |
|---|---|---|
| **D1** | `getSuggestedPath`: lastViewed > horario > anytime > catalog[0] | Preservar inversion s75 (lastViewed gana) e introducir la logica horaria como capa nueva que solo entra cuando lastViewed no aplica. |
| **D2** | Logros con `title`/`desc` hardcoded en ES (no `t()`) | Consistencia con los 90+ logros existentes. Introducir i18n para 1 sola entrada generaria deuda mayor. |
| **D3** | path.tea: nombre `Infusion`/`Steeping` + tagline "Un vapor breve, y la tarde recobra forma." / "A brief steam, and the afternoon takes shape again." | Encaja con el lexico sensorial-objeto de las taglines vigentes (Morning Glory / Spearmint / Matchstrike / Desk Lamp / Open Window). |
| **D4** | path.breath: nombre `Halito`/`Breath` + tagline "Dos vientos cortos para volver." / "Two short winds to return." | Mismo registro poetico. "Dos vientos" + "volver" alude al patron back-to-back. |
| **D5** | Logro: nombre "Cartografa" | Coherente con "caminos" como dominio. Mejor que "Las siete vidas" (folklore) o "Constelacion" (astral). |
| **D6** | Glifo: heptagono regular | Familia visual de streak.7. Mejor que probar algo nuevo cuando el set ya tiene un modelo. |
| **D7** | PathsLibrary con 7 cards: verificar runtime, ajustar solo si rompe | El modal ya scrollea con `maxHeight: 85vh + overflowY: auto`. 7 cards probablemente caben sin ajustar; solo intervengo si la validacion encuentra un problema visual. |

---

## Validacion runtime (usuario)

Usuario valido con "si, valido" tras la presentacion de la lista de
checks (path.tea ejecutable, path.breath ejecutable, PathHydrateStep
rediseniado, PathsLibrary 7 cards, SuggestedPathCard con jerarquia nueva,
logro master.path.all7, recarga durante step, i18n EN, consola limpia).
Sin observaciones que devolvieran al codigo. Se procede al build.

---

## Build

- `PACE_standalone.html`: **605 KB** (619,615 bytes; +7,412 bytes vs
  v0.31.0). El crecimiento corresponde a las 2 entradas del catalogo +
  i18n duplicada (ES/EN) + redisenio del PathHydrateStep (+102 ln) +
  glifo SVG del logro nuevo + detector + extension de getSuggestedPath.
- `index.html`: identico byte-a-byte.
- 43 archivos validados (sin cambios vs s77b).
- Backup creado: `backups/PACE_standalone_v0.31.0_20260517.html` (605 KB,
  copia de la version pre-build). Rotado el mas antiguo:
  `backups/PACE_standalone_v0.27.0_20260509.html`.

---

## Diferido a sesiones siguientes

- **Split `PathRunner.jsx`** -- ya en 815 ln (717 -> 815 por el redisenio
  del PathHydrateStep). Sigue marcado como deuda ALTA en STATE.md.
  Candidato natural a s79 puro tecnico: extraer `CompletionScreen` y los
  4 `Path*Step` a archivos hijos.
- **i18n del catalogo de logros** -- 90+ entradas con `title`/`desc`
  hardcoded en ES. Migracion completa a `t()` es un proyecto en si mismo,
  fuera de scope. Probable s80+.
- **Logica horaria fina** -- el slot `evening` cubre 17h-3am. Quiza
  conviene distinguir `night` (>=22h) en alguna iteracion, pero hoy no
  hay Camino que lo justifique.
- **Visualizacion en stats** -- `path.tea` y `path.breath` aparecen
  automaticamente en `PathStats` y `PathYearView` porque ambos leen del
  catalogo dinamicamente. No requiere cambios.

---

## Lecciones tecnicas

- **`setTimeout(0)` para hooks post-setState**: el hook a
  `checkAllPathsCompleted` desde `advancePathStep` vive fuera del closure
  del reducer para que `getState()` vea el estado ya actualizado. Patron
  reusable para futuros detectores que reaccionan a transiciones de
  estado.
- **Componentes step del PathRunner pueden leer `usePace()`**: el
  PathHydrateStep rediseniado lo demuestra. No estaba documentado pero es
  lo natural dentro del paradigma del proyecto. Util para futuros steps
  que necesiten ver estado global (PathFocusStep ya lo hace via
  `addFocusMinutes`, que llama `setState` internamente).
- **Botones del mismo peso visual = senyal de opcionalidad real**: si
  uno de los dos es claramente CTA principal, la opcionalidad es teatral.
  Pequeno principio editable a otras decisiones binarias (skip/continue,
  cancel/confirm).

---

## Estado al cerrar

- Catalogo Caminos: **7 / 7** (cerrado).
- Logro master.path.all7: vivo y cazable.
- PathHydrateStep coherente con HydrateModule del home.
- Working tree dirty, pendiente del commit unico v0.32.0 del usuario.
- v0.32.0 sin push.
