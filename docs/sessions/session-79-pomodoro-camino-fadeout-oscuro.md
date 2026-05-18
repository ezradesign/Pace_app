# Sesion 79 -- Pomodoro contextual en Camino + fade-out toasts + recalibrado oscuro

**Fecha:** 2026-05-18
**Version:** v0.32.0 -> **v0.32.1**
**Tipo:** fix UX (PathFocusStep + Toast) + recalibrado tokens (paleta oscura)
**Diario predecesor:** [session-78-catalogo-caminos.md](./session-78-catalogo-caminos.md)

---

## TL;DR

Tres tareas pequenas e independientes que cierran los flecos UX abiertos
tras s78:

1. **`PathFocusStep` rediseniado** como Pomodoro contextual de Camino.
   Hereda el subtitulo "Concentracion profunda" del Pomodoro de home
   (alineacion visual iniciada en s76 con `TimerDial` compartido) y los
   controles pasan a **tres botones del mismo peso visual** --
   Pausar/Reanudar, Reset y Saltar. Sin presets de minutos (el Camino
   define), sin puntos de ciclo (el Camino lleva), sin badge tipo
   sesion (la lectura del progreso vive en `SenderoBar` y
   `PathTransitions`).
2. **Toast con fade-out de 300ms** antes del desmontaje. La duracion
   visible (`TOAST_DURATION_MS = 3000`) no cambia; el fade es aditivo.
   Sustituye el corte seco anterior por una salida suave que respeta el
   ritmo calmado del producto.
3. **Paleta oscura recalibrada +10%** luminosidad en superficies y
   bordes (`--paper`, `--paper-2`, `--paper-3`, `--line`, `--line-2`).
   `--ink-*` intactos para preservar contraste y calidez nocturna.

Sin cambios en arquitectura, transiciones del Camino, catalogo,
Pomodoro de home, BreatheSession ni MoveSession. Limite autoimpuesto:
no se splittea `PathRunner.jsx` (programado para s80) y no se extrae
nada nuevo a `app/ui/`.

---

## Contexto

s78 cerro el catalogo de Caminos a 7, redisenio `PathHydrateStep` para
alinearlo con `HydrateModule`, y aterrizo `master.path.all7`. El
overlay del Camino quedo coherente en su mayor parte, con dos
disonancias residuales:

- **`PathFocusStep`** seguia con los controles minimos heredados de su
  primera version (`Pausar/Saltar`), sin posibilidad de resetear el
  bloque actual sin abandonar el Camino entero. Ademas, el `TimerDial`
  compartido con FocusTimer (desde s76) se renderizaba con
  `subtitle=null`, por lo que el aro del Camino mostraba menos
  contenido tipografico que el aro del home -- aunque visualmente
  son el mismo componente, comunicaban distinto.
- **Toasts de logros** desaparecian de golpe tras `TOAST_DURATION_MS`
  (3000ms desde s77b). El corte seco se notaba especialmente al
  encadenar varios logros en la misma sesion: el segundo aparecia
  antes de que el primero hubiera dado tiempo a leerse y desaparecia
  igual de bruscamente.
- **Paleta oscura**: tras s74 (recalibrado a negro calido sutil) el
  texto secundario en superficies oscuras se sentia un punto apagado.
  No suficiente para abrir una sesion solo por eso, pero si para
  abordarlo aprovechando el cambio en `PathFocusStep` y `Toast`.

---

## Auditoria A.1 -- PathFocusStep vs FocusTimer

| Elemento | FocusTimer (home, v0.31.0) | PathFocusStep (v0.32.0 -- antes de s79) |
|---|---|---|
| Aro circular de progreso (`TimerDial`) | si | si (compartido desde s76) |
| Contador Garamond italic | si (dentro del aro) | si (dentro del aro) |
| `modeLabel` "Foco" arriba | si | si |
| Subtitulo "Concentracion profunda" | **si** (debajo del contador) | **NO** (pasa `subtitle={null}`) |
| Presets 15/25/35/45/Otro | si (MinutesPicker) | no (correcto: la duracion la define el Camino) |
| Boton Pausar/Reanudar | si (dentro del aro) | si (fuera, texto plano) |
| Boton Reset | **si** (dentro del aro, circulo con icono) | **NO** |
| Boton Saltar | no aplica | si (fuera) |
| Puntos de ciclo (4 pomodoros) | si (dentro del aro) | no (correcto: el ciclo lo lleva el Camino) |
| Badge FOCO/PAUSA/LARGA | TopBar arriba | no (correcto: ya en `SenderoBar`) |

**Hallazgo principal**: el `TimerDial` ya es compartido pixel-a-pixel,
pero `PathFocusStep` no le pasaba `subtitle` y carecia del Reset. Los
demas elementos del home (presets, puntos de ciclo) NO se anyaden --
contradicen la pauta del Camino. Los demas elementos eliminados (badge
tipo sesion) ya estaban fuera por decision previa.

---

## Decision sobre `ProgressRing`

El prompt sugeria extraer el SVG del aro a `app/ui/ProgressRing.jsx`
o, alternativamente, copiarlo en `PathFocusStep` con comentario
explicativo si la extraccion fuera no trivial.

**Decision: ya extraido**. `app/ui/TimerDial.jsx` (creado en s76 /
v0.30.0) es el componente compartido. Encapsula el SVG circular
(viewBox 100, radio 47.5, strokeWidth base 0.35, arco 0.7,
`strokeOpacity 0.7`, `strokeLinecap round`), el helper
`interpolateRingColor` (gradiente terracota -> ocre -> oliva en modo
foco) y el bloque interior con `modeLabel`, contador, `subtitle`
opcional, divider opcional y slot `inner`. Esta exportado a `window`
y consumido por ambos sitios.

No se introduce `ProgressRing.jsx` ni se copia SVG. El requerimiento
del prompt esta cubierto desde s76; lo unico que cambia en s79 es que
`PathFocusStep` empieza a pasar `subtitle={t('focus.subtitle.focus')}`
en vez de `null`.

---

## Que se hizo

### Tarea A -- `PathFocusStep` rediseniado (`app/paths/PathRunner.jsx`)

**Antes** (~103 ln, sin contar comentarios):

```jsx
{!done ? (
  <div style={{ display: 'flex', gap: 12 }}>
    <button onClick={() => setRunning(r => !r)} style={{ /* fill ink */ }}>
      {running ? t('session.pause') : (remaining < totalSec ? t('session.resume') : t('topbar.mode.focus'))}
    </button>
    <button onClick={() => onExit('skip')} style={{ /* outline paper-2/line */ }}>
      {t('path.runner.skip')}
    </button>
  </div>
) : ( <button>{t('path.runner.done')}</button> )}
```

`<TimerDial>` recibia `subtitle={null}` y `inner={null}`.

**Despues** (~111 ln):

- `<TimerDial>` recibe `subtitle={t('focus.subtitle.focus')}` -- cierra
  la alineacion con el aro del home.
- Tres botones del mismo peso visual via `btnBase` compartido (mismo
  patron que `PathHydrateStep` en s78):

  ```js
  const btnBase = {
    padding: '10px 22px', borderRadius: 'var(--r-sm)',
    cursor: 'pointer', fontSize: 13, letterSpacing: '0.08em',
    fontFamily: 'var(--font-display)', fontStyle: 'italic',
    background: 'transparent',
    border: '1px solid var(--line-2)',
    color: 'var(--ink-2)',
    transition: 'all 180ms var(--ease)',
  };
  ```

- Etiquetas via i18n existentes (cero claves nuevas):
  - Pausar/Reanudar: `focus.pause` / `focus.continue` / `focus.start`
    (toggle segun `running` y `remaining < totalSec`).
  - Reset: `focus.restart` ("Reiniciar" / "Restart").
  - Saltar: `path.runner.skip`.
- Nuevo handler `handleReset()`:

  ```js
  const handleReset = () => {
    setRunning(false);
    setRemaining(totalSec);
  };
  ```

  Pausa el timer y restaura `remaining = totalSec`. **NO toca**
  `creditedRef.current` (sin acreditar foco) ni avanza el Camino.
- Bloque `done` sin cambios: un solo CTA "Hecho" centrado
  (`path.runner.done`, fill `var(--ink)`) reemplaza los 3 botones al
  completar. Decision D4: tras `done` los 3 botones contemplativos ya
  no aplican (tiempo acreditado, contador a 0) y el CTA solido tiene
  sentido porque es la unica accion pendiente: avanzar.

### Tarea B -- Fade-out 300ms en `app/ui/Toast.jsx`

Patron de tres fases:

```js
const fadeMs = 300;
// 1. Tras durationMs visibles, marca exiting -> arranca fade.
setTimeout(() => {
  setToasts(prev => prev.map(x => x._id === full._id ? { ...x, exiting: true } : x));
}, durationMs);
// 2. Tras durationMs + fadeMs, desmonta del array.
setTimeout(() => {
  setToasts(prev => prev.filter(x => x._id !== full._id));
}, durationMs + fadeMs);
```

Toast insertado con `exiting: false`. El `<div>` aplica
`opacity: toast.exiting ? 0 : 1` con
`transition: 'opacity 300ms ease-out'`. La animacion de entrada
(`pace-slide-up 320ms var(--ease)`) no se modifica -- juega solo con
transform y no compite con el fade-out final.

Duracion total visible: 3300ms (3000 visible + 300 fade).
`TOAST_DURATION_MS` no se modifica.

### Tarea C -- Recalibrar paleta oscura +10% (`app/tokens.css`)

Bloque `[data-palette="oscuro"]`:

| Token | Antes | Despues |
|---|---|---|
| `--paper` | `#15130f` | `#1d1a14` |
| `--paper-2` | `#1d1a15` | `#26211a` |
| `--paper-3` | `#252119` | `#2f2920` |
| `--line` | `#332d24` | `#3d362b` |
| `--line-2` | `#403930` | `#4a4238` |

`--ink-*` intactos (`#EDE5D3` / `#c0b49e` / `#756D5D`). El ajuste solo
libera la base lo justo para que el texto secundario respire mejor
sin perder el tono nocturno.

---

## Decisiones tomadas

| ID | Decision | Razon |
|---|---|---|
| D1 | No extraer `ProgressRing.jsx` | El aro ya esta compartido desde s76 como `TimerDial.jsx`. Crear otro componente seria duplicacion |
| D2 | Tres botones outline sin CTA dominante en PathFocusStep | "Mismo peso visual" segun el prompt; outline mantiene consistencia con `PathHydrateStep` (s78) y refuerza que durante la sesion ningun control predomina |
| D3 | Reset NO acredita foco | `handleReset` solo limpia contador local. `addFocusMinutes` se llama solo al llegar a 0 estando running (sin cambios respecto a s75) |
| D4 | `done` mantiene CTA solido "Hecho" | Tras completar, los 3 botones contemplativos ya no aplican. El solido marca la unica accion pendiente: avanzar |
| D5 | Fade aditivo, `TOAST_DURATION_MS` sin cambios | El prompt lo pide explicito: "Mantener `duration` actual sin cambios -- el fade es adicional" |
| D6 | Cambio inline en style del toast (no clase CSS) | El render actual ya usa inline style; mantener consistencia evita mezclar tecnicas |
| D7 | Tokens del bloque oscuro modificados in-place, comentario explicando el +10% | Trazabilidad sin necesidad de tabla de cambios en el propio archivo |

---

## Archivos modificados

- `app/paths/PathRunner.jsx` -- `PathFocusStep` rediseniado (815->835
  ln neto, +20 con cabecera de doc-comment y `btnBase`).
- `app/ui/Toast.jsx` -- fade-out aditivo (+~8 ln en useEffect + 2 props
  en style inline).
- `app/tokens.css` -- 5 valores hex en `[data-palette="oscuro"]` + 4
  lineas de comentario.
- `app/state-core.jsx` -- `PACE_VERSION` -> `v0.32.1`.
- `PACE.html` -- titulo `v0.32.1`.
- `sw.js` -- `CACHE_NAME` `pace-v0.32.1`.
- `DESIGN_SYSTEM.md` -- tabla paleta oscuro actualizada.
- `CHANGELOG.md` -- entrada `v0.32.1` + archivado de v0.31.0.
- `STATE.md` -- version, "Ultima sesion", backups.
- `docs/sessions/session-79-pomodoro-camino-fadeout-oscuro.md` -- este
  archivo.

---

## Build

- `PACE_standalone.html`: **607 KB** (621,446 bytes; +1,831 bytes vs
  v0.32.0 = 619,615).
- `index.html`: identico byte-a-byte.
- SHA-256:
  `143c219e8faf37592b2a1aeb6d597259d597cf92930f6b3209ad893a74a53c5b`.
- 43 archivos validados (sin cambios estructurales vs s78).
- Backup creado: `backups/PACE_standalone_v0.32.0_20260518.html`
  (607 KB; copia previa al rebuild).
- Rotado el mas antiguo:
  `backups/PACE_standalone_v0.27.2_20260509.html` (cap 20 mantenido).

`check-session.ps1` reporta avisos esperables (cambios sin commitear --
pendiente del cierre Git manual del usuario) y un aviso de tamano de
un rango antiguo del script (530-600 KB) que no corresponde al rango
actual del proyecto (605-615 KB segun prompt). Bundle dentro del
rango actual.

---

## Verificacion manual (pendiente del usuario)

1. Abrir incognito, titulo `v0.32.1` en la pestana.
2. Modo oscuro: la tipografia secundaria (`--ink-2`, `--ink-3`) lee
   comoda sobre las superficies recalibradas sin perder el tono
   nocturno.
3. Iniciar Morning Glory. Llegar al bloque de Foco. Verificar:
   - Subtitulo "Concentracion profunda" visible bajo el contador.
   - Aro de progreso (`TimerDial`) alrededor del contador. Se vacia
     conforme avanza el timer.
   - Tres botones: Comenzar/Pausar/Continuar (toggle), Reiniciar,
     Saltar. Mismo peso visual.
   - **No** debe haber: badge tipo sesion (FOCO/PAUSA/LARGA), presets
     de minutos (15/25/35/45/Otro), puntos de ciclo de Pomodoros.
4. Pausar/Reanudar: contador se detiene y reanuda; el aro respeta el
   estado.
5. Reset: contador vuelve a la duracion inicial del bloque, sin
   abortar el Camino. El timer queda pausado.
6. Saltar: avanza al siguiente paso. NO acredita foco a stats
   globales.
7. SenderoBar y TransitionCards (Intro/Step/Outro) siguen funcionando.
8. Provocar un toast (vaso de agua que dispara
   `hydrate.first.glass`). Confirmar fade-out suave, sin corte seco.
9. Alternar claro/oscuro varias veces -- sin glitches de fondo,
   bordes o contraste.

---

## Diferido a s80

- **Split `app/paths/PathRunner.jsx`** (~820 ln tras s79). Sigue
  marcada como deuda ALTA. Candidatos:
  - `CompletionScreen` -> `app/paths/PathCompletion.jsx`.
  - 4 `Path*Step` (Breathe/Focus/Body/Hydrate) -> archivos hijos.
  - `ExitConfirmModal` + `PathTopBar` + `StepError` -> `PathRunner.parts.jsx`.
- Si aparece tercer consumidor de los numerales romanos (`CS_ROMAN`
  en PathRunner y `SB_ROMAN` en SenderoBar): extraer a
  `app/ui/numerals.js`.
- Revisar si la `animation: pace-slide-up` de entrada del Toast
  compite con la `transition: opacity` de salida durante los 300ms
  finales. Runtime no muestra conflicto pero es revisable.

---

## Mensaje de commit propuesto

```
fix(ui): pomodoro contextual en Camino (aro + pausa/reset/saltar) + fade-out toasts + oscuro +10% (v0.32.1)
```
