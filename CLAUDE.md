# PACE · Foco · Cuerpo

App de pausas activas para quien trabaja sentado: Foco (Pomodoro), Respira, Mueve, Estira, Hidrátate,
logros y «A tu ritmo». Web/PWA hoy y Android con Capacitor en v1. El logo es una vaca paciendo («pace»:
ir a tu ritmo). React 18.3.1 sin bundler: Babel standalone en desarrollo (`PACE.html`) y
`build-standalone.js` compila lo que se publica (`index.html`). Con Ez se habla en español.

## Al empezar

1. Lee `STATE.md`: versión, qué sigue y qué espera a Ez.
2. Antes de tocar un subsistema, busca su fila en `docs/product/DECISIONES_TECNICAS_VIGENTES.md` (con
   grep: el archivo es largo).
3. Si el cambio es visual, lee `DESIGN_SYSTEM.md`; si es de contenido, `CONTENT.md`.
4. Lee el código antes de editarlo y no reinventes un componente que ya existe.

## Al terminar un cambio

1. `npm run verify`. Si falla, no se sigue.
2. Si hay versión nueva, `npm run bump -- X.Y.Z`: cambia a la vez los siete sitios de la versión.
3. `node build-standalone.js` regenera `index.html`. También reescribe `PACE_standalone.html`, que es un
   export bajo demanda: déjalo como estaba con `git checkout -- PACE_standalone.html`.
4. `npm run test:e2e`, después del build, para probar el `index.html` que se va a subir. No mira el
   móvil, los Caminos, el premium ni los píxeles: eso se comprueba a mano, a 360 px y a 1280 px.
5. `STATE.md`: cambia lo que haya cambiado, y que siga cabiendo en una pantalla.
6. `CHANGELOG.md`: una línea por versión nueva.
7. Si nace una regla técnica que evita una regresión, una fila arriba del todo en
   `DECISIONES_TECNICAS_VIGENTES.md`.
8. Commit sin línea `Co-Authored-By`, con el porqué en el mensaje, y push a `main`.
9. Espera al CI (`gh run watch`). No está cerrado hasta que `verify` y `e2e` salen en verde.

Ya no se escriben diarios de sesión, handoffs ni prompts: la historia es `git log`. Lo anterior está en
`docs/sessions/` y `docs/archive/`, y no se toca. Lo que haya que vigilar se añade al `verify` o a la
suite, nunca solo al YAML del CI.

## Reglas de código

1. Archivos de menos de 500 líneas (lo mide `verify`). Si crecen, se trocean en `.support` o `.parts`.
2. Cada JSX exporta a `window` al final: `Object.assign(window, { Componente });`.
3. Estilos con nombre único: `const focusTimerStyles = {}`, nunca `const styles = {}`.
4. Orden de carga en `PACE.html`: `i18n/*` → `state.jsx` → `ui/*` → `shell/*` → módulos → `main.jsx`.
5. Nada de `type="module"`: rompe Babel standalone.
6. Hooks desde el global: `const { useState } = React;`.
7. El estado persiste en `localStorage` (`pace.state.v2`); los eventos, en IndexedDB (`pace.events.v1`).
8. Dentro de un `.map()`, ningún nombre que ya exista fuera.
9. `playSound()` siempre dentro de `try/catch`: el sonido nunca puede romper la app.
10. Prohibido `new Date("YYYY-MM-DD")`, que se lee como medianoche UTC: usa `parseLocalDateKey()`.
11. Los comentarios explican el porqué de hoy, sin números de sesión. La historia va en el commit.

## Mueve y Estira: los ids van cruzados (solo los ids)

| Módulo | Datos | Lo pinta | ids |
|---|---|---|---|
| Mueve (calistenia y fuerza) | `app/move/move.data.js` | `MoveModule.jsx` | `extra.*` |
| Estira (movilidad) | `app/extra/extra.data.js` y `extra.data.piernas.js` | `ExtraModule.jsx` | `move.*` |

No se renombran porque se borrarían datos de la gente. Si dudas, mira `catPrefix` y `lib.*.title`.

## Trampas conocidas

- En el PC de Ez la copia de trabajo está en CRLF (`core.autocrlf=true`): un reemplazo con LF no casa.
- Un service worker caducado en el preview mide otra versión: hay que purgarlo antes de medir.
- Un backtick en un comentario dentro de un template literal rompe el build.
- Un `catch` que devuelve el estado de fábrica es un borrado diferido: falla en la primera escritura.
- Un componente que lee el estado antes de mirar si está abierto falla aunque no se vea.

## Producto y tono

Calmado, artesanal y cuidado, con copy corto en español. Paleta tierra (oliva, crema, terracota, tinta)
y serif itálica en los títulos. Nada de emojis en la UI, gradientes llamativos, sombras exageradas,
tipografías trilladas ni gamificación agresiva. Ningún consejo de salud sin aviso: la apnea lleva
siempre su modal de seguridad. Antes de un cambio visual, maqueta con opciones y una recomendación, y
Ez elige.

## Dónde vive cada cosa

| Qué | Dónde |
|---|---|
| Presente y siguiente paso | `STATE.md` |
| Orden de trabajo hasta v1 | `ROADMAP.md`, sección «Camino a v1.0» |
| Reglas técnicas vigentes | `docs/product/DECISIONES_TECNICAS_VIGENTES.md` |
| Decisiones de producto | `docs/product/DECISIONES_PRODUCTO.md` |
| Tokens, paleta y tipografía | `DESIGN_SYSTEM.md` |
| Rutinas y logros | `CONTENT.md` |
| Una línea por versión | `CHANGELOG.md` |
| Build, worktrees y bancos de medida | `docs/BUILD.md`, `docs/WORKFLOW.md`, `docs/BANCOS.md` |

Versiones: v0.X es antes del lanzamiento; **v1.0 es la primera versión de pago**, en web y en Android.
iOS llega después de v1.
