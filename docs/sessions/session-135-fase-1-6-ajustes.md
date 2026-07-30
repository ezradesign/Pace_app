# Sesión 135 — Fase 1.6 definida: ajustes y dos retiradas

**Fecha:** 2026-07-30
**Tipo:** SOLO-DOCUMENTAL — sin versión nueva, cero código, cero build
**Versión de referencia:** v0.71.0

---

## Lo que pidió el usuario

Cuatro cosas de Ajustes: **ocultar el estilo de timer** (queda siempre «aro»), **ocultar
«orgánico»** del círculo de respiración, arreglar un **flash o botón fantasma** al cambiar el
descanso entre sesiones, y añadir un **«Auto»** de idioma que se configure según el dispositivo.

## Tres hallazgos al verificarlo, y los tres cambian el trabajo

**1 · El idioma ya se auto-configura.** `detectInitialLang()` existe desde s35 y `loadState()` lo
usa, así que la primera apertura ya coge el idioma del dispositivo
([`useT.jsx:8-11`](../../app/i18n/useT.jsx)). Lo que **no** existe es una opción **«Auto»
persistente**: una vez guardado, `state.lang` queda fijo y no vuelve a mirar el sistema. El
trabajo real es bastante menor de lo que parecía, pero no es cero.

**2 · El botón fantasma tiene un sospechoso concreto.** Los botones de descanso llevan
`transition: 'all 180ms'`, y entre lo que cambia al activarse está el **`fontWeight`**
([`TweaksPanel.jsx:290-295`](../../app/tweaks/TweaksPanel.jsx)). `transition: all` anima también
el peso de la fuente, y eso produce exactamente ese parpadeo al re-renderizar el texto.

**Es una hipótesis, no un diagnóstico.** Hay que reproducir y medir antes de tocar: en esta app la
causa «evidente» ya falló dos veces (el aro recortado de s126 y los tres síntomas móviles de
s128). Si se confirma, el fix es declarar la transición solo de `background`, `color` y
`border-color`. El mismo patrón aparece en `statsPanelTabStyles.tab`, así que se revisa de paso.

**3 · Ocultar sin migrar dejaría gente atrapada.** El default de `timerStyle` ya es `'aro'`
([`state-core.jsx:33`](../../app/state-core.jsx)), así que las instalaciones nuevas no se enteran
de nada. Pero `FocusTimer.jsx:117` sigue leyendo el valor guardado y `BreatheVisual.jsx:197`
conserva su rama de `organico`: quien eligió el timer analógico o el círculo orgánico **se
quedaría con esa variante para siempre, sin selector para salir de ella** salvo resetear la app.
Ese es el detalle que convierte «ocultar dos opciones» en algo con una parte invisible obligatoria.

## Decisiones

- **Migrar los valores huérfanos** al cargar: si lo guardado es una de las opciones ocultas, se
  reescribe a la que queda.
- **Ocultar con una constante en un solo sitio** (`SHOW_TIMER_STYLE`, `SHOW_BREATH_ORGANICO`), sin
  borrar, dejando el motor intacto y **anotando la razón** en `DECISIONES_TECNICAS_VIGENTES.md`
  para que nadie lo borre más adelante creyendo que es código muerto. Reversible en una línea.
- **«Auto» como default de las instalaciones nuevas**, re-evaluando en cada arranque; las actuales
  conservan su elección explícita. A verificar: que no dispare el logro secreto
  `secret.bilingual`, que se desbloquea con cualquier cambio de `state.lang` tras montar.
- **Repartir los 8 ítems de pulido en dos sesiones**: 1.5 visual (pomodoro, atmósfera,
  constructor, loto) y 1.6 ajustes (las cuatro de hoy). La regla de un frente por sesión se acaba
  de fijar; ocho verificaciones en una sola sesión la rompen.

## Estado del plan

1 Dirección ✅ · **1.5 Pulido visible ⏭** · 1.6 Ajustes · 2 Mueve y Estira se entiendan ·
3 Eventos web · 4 Stats · 5 Respira · 6 Caminos · 7 Travesías · 8 Descubrimiento · 9 Venta.
