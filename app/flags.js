/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   flags.js — banderas de superficie (Fase 1.6, sesión 139)
   ========================================================
   ⚠️ ESTO NO ES CÓDIGO MUERTO. Cada bandera de aquí apaga una opción de la UI
   cuyo código se conserva ENTERO a propósito. Poner una a `true` la devuelve —
   una línea, sin arqueología. Si estás leyendo esto porque ibas a borrar la
   rama de `timerStyle` de FocusTimer o la de `organico` de BreatheVisual: no lo
   hagas sin hablarlo; la razón de conservarlas está más abajo y en
   `docs/product/DECISIONES_TECNICAS_VIGENTES.md`.

   POR QUÉ UNA BANDERA Y NO BORRAR. Las dos opciones se retiran por criterio
   VISUAL, no porque estorben: el usuario las juzgó peores que la que queda
   («los estilos de timer Barra/Analógico son feos frente a Aro», feedback
   s103). Un criterio visual puede cambiar; una rama borrada hay que
   reconstruirla. El coste de conservarlas es un `if`.

   POR QUÉ LA MISMA BANDERA GOBIERNA LA MIGRACIÓN. Ocultar la opción de Ajustes
   NO basta: quien ya eligiera «barra» u «orgánico» seguiría viéndolo para
   siempre, con el selector escondido — ATRAPADO, sin forma de volver. Por eso
   `loadState` (state-core.jsx) normaliza el valor huérfano leyendo ESTA misma
   constante. La consecuencia buena de atarlo así: devolver la bandera a `true`
   reabre el selector Y detiene la migración en el mismo gesto, sin que las dos
   mitades puedan desincronizarse.

   Precedente del proyecto: la paleta 'envejecido' se retiró en s71 con una
   migración directa en `loadState`, pero SIN bandera — es decir, sin vuelta
   atrás. Esta variante conserva esa reversibilidad.
   ============================================================ */

/* Estilo del timer del Pomodoro (aro · barra · analógico).
   Apagado ⇒ el eje entero desaparece de Ajustes y todo el mundo ve «aro».
   El código de las variantes sigue vivo en `FocusTimer.jsx` (`isAro`, y el
   `style={state.timerStyle}` que pasa a TimerDial). */
const SHOW_TIMER_STYLE = false;

/* Estilo 'orgánico' del círculo de Respira (el blob que deforma su
   border-radius con `progress`).
   Apagado ⇒ desaparece de la lista de estilos y quien lo tuviera pasa a 'flor'
   —hoy el loto—. La rama `if (style === 'organico')` sigue viva en
   `BreatheVisual.jsx`. Nota: su radial de 2 paradas quedó SIN tratar en el
   banding de s139 justamente porque esta bandera lo retira; si algún día se
   reactiva, hay que pasarlo por `paceGlowRamp` + `PaceDither` como los otros. */
const SHOW_BREATH_ORGANICO = false;

Object.assign(window, { SHOW_TIMER_STYLE, SHOW_BREATH_ORGANICO });
