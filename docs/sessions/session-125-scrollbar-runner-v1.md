# Sesión 125 — Barra de scroll del runner v1: ocultar conservando el scroll (confinada)

**Fecha:** 2026-07-28
**Versión:** v0.67.0 → **v0.68.0**
**Tipo:** sesión de CÓDIGO (CSS puramente aditivo; sin motor, sin geometría, sin contabilidad)
**Base:** `main` @ 9dc60cb (v0.67.0 publicado)

---

## Encuadre

Corte: «SCROLLBAR VISIBLE / POSIBLE DESBORDE DEL RUNNER v1 — centro de sesión en
alturas ≤~660px en pasos `perSide` de texto largo (SIN compactar copy/glifos/tipografía)».

Es el HALLAZGO abierto desde s122 (chip de tarea creado) y el 2º punto del «Bloque 0 ·
Consolidación» del audit. NO es responsive de la home (§32, PENDIENTE de confirmación del
usuario, no se toca). NO toca contabilidad ni motor de sesiones.

**Restricción dura del usuario:** NO compactar copy, ni glifos, ni tipografía para forzar el
ajuste; NO clipear con `overflow:hidden` (contenido siempre alcanzable). Ocultar la BARRA
conservando el scroll (patrón s123) SÍ es admisible.

**Instrucción del corte:** NO asumir que los ~17px son overflow vertical; distinguir por
MEDICIÓN entre (a) ancho de scrollbar clásica, (b) overflow vertical real, (c) diferencia de
bordes, (d) barra superpuesta de ancho efectivo 0. Decidir el enfoque por AskUserQuestion
con la medición delante. Bump SOLO si entra cambio de código observable.

---

## Auditoría medida (runtime, navegador)

Medición device-independent: `overflowV = max(0, scrollHeight − clientHeight)` del
`[data-pace-session-center]`. Nota de entorno: el navegador de preview usa scrollbars
**overlay** (ancho efectivo 0); la máquina del usuario (Windows 11) usa scrollbars
**clásicas** (~17px). Por eso el usuario ve barra donde el preview no la pinta — pero el
disparador (`overflowV > 0`) es portable. Además los bloques de texto están capados a
`maxWidth` 440–460px (muy por debajo de los ~704px del centro), así que la reducción de 17px
por la barra clásica NO cambia el wrapping → `overflowV` es una medida limpia.

**Régimen ANCHO (≥641px — matriz 768/844/1024 × 620–720): `overflowV = 0` en TODOS los
casos.**
- Cossack squat (perSide, ES) barrido 620/640/660/680/700/720 → siempre 0 (holgura 36–77px).
  El fix de s119 (curva de glifo continua + tiers por altura + reservas `cue` 3.1em / `care`
  3em) SOSTIENE.
- Análisis de los **184 strings** `instruction.action`/`care` (ES+EN) renderizados offscreen
  con la tipografía exacta del runner + prefijo de lado «Right. »: **ningún** `action` ni
  `care` supera 2 líneas a maxWidth 460/440 → las reservas nunca se exceden.

**Régimen MÓVIL (≤640px): el número del timer se compacta a 72px (`MoveModule.jsx:332`,
`[data-pace-move-timer]`, heredado por el número v1) y NO hay reservas.** Aquí SÍ aparece un
desborde mínimo:
- **360×620, World's greatest stretch (perSide, EN): `overflowV = 3px`** (scrollHeight 501 >
  clientHeight 498, maxScrollTop 2.4px).
- 360×640: `overflowV = 0` (holgura 14px). Umbral ≈ 624px.
- **Causa raíz medida: NO es el cue/care** (2 líneas, absorbidas) **sino el NOMBRE del
  ejercicio** `<h1>` con `clamp(30px, 6.5vh, 52px)` que a 360px de ancho **envuelve a 2
  líneas (85px vs ~42px de un nombre de 1 línea)** → +43px que rebasan por 3px.
- Solo ocurre en móvil: a ≥641px el nombre cabe en 1 línea → 0 desborde. A alturas más cortas
  (fuera de la matriz, 360×600) el desborde crece y el scroll pasa a ser LEGÍTIMO.

**Conclusión:** es el caso (b)/(d) del corte — desborde real pero mínimo → una barra CLÁSICA
de 17px para 3px de recorrido: fea e inútil. NO es entorno (SW/caché purgados; reproducible y
determinista).

---

## Decisión (AskUserQuestion) → enfoque A

Con la medición delante, el usuario eligió **A · Ocultar la barra conservando el scroll,
CONFINADO al runner v1**. Es el enfoque robusto (cubre el caso cosmético de 3px Y el scroll
legítimo de alturas extremas), no fragiliza el anclaje de s119 y reutiliza el patrón s123.
B (recuperar holgura) se descartó: el driver es el nombre a 2 líneas, no los márgenes, así
que recuperar espacio sería marginal y rozaría s119.

---

## Qué entró (P0)

CSS puramente aditivo en `MoveSessionV1.support.jsx` (bloque `pace-move-v1-css`), tras el
keyframe `pace-rep-pulse`:

```css
[data-pace-session-center]:has([data-pace-v1-progress]) {
  scrollbar-width: none;          /* Firefox */
  -ms-overflow-style: none;       /* Edge/IE legacy */
}
[data-pace-session-center]:has([data-pace-v1-progress])::-webkit-scrollbar {
  display: none;                  /* WebKit / Blink */
}
```

- **Conserva `overflow-y: auto`** (no lo toca) → el scroll sigue disponible por rueda, gesto
  y teclado; los controles de sesión viven en el footer del shell (siempre visible), y el
  contenido del centro no es interactivo → nada queda inalcanzable.
- **CONFINADO al runner v1** vía `:has([data-pace-v1-progress])`: el bloque de progreso se
  renderiza SIEMPRE en el runner v1 y es un marcador **exclusivo** suyo (Respira y el runner
  LEGACY no lo tienen). `:has()` verificado en el runtime objetivo (evergreen). Cero JSX,
  cero motor.
- **Sin media query**: en el régimen ancho no hay barra que ocultar (overflow 0), así que la
  regla es inocua ahí; en móvil oculta la barra cuando aparece.

---

## Verificación (navegador, con evidencia medida)

| Check | Resultado |
|---|---|
| Regla aplica en centro v1 (paso con progreso) | `scrollbar-width: none` + `overflow-y: auto` |
| Caso que reproducía (WGS perSide EN 360×620) | barra oculta, 3px alcanzables (maxScrollTop 2.4, último hijo visible tras scroll) |
| Gate con desborde real de 31px | barra oculta, scroll conservado (maxScrollTop 30.4) |
| Confinamiento Respira (sesión real) | `scrollbar-width: auto` (regla NO aplica) |
| Confinamiento Legacy (Desk Express, paso real) | `scrollbar-width: auto` |
| Prep del runner v1 (sin barra de progreso) | `scrollbar-width: auto` (correcto; prep es contenido mínimo) |
| FASE A (glifo anclado / footer / banda 720) | intacta — cambio CSS aditivo, sin geometría |
| Motor / consola | sin errores nuevos |

**Standalone v0.68.0** verificado: monta, es bundle compilado (sin Babel), la regla está en
el CSS inyectado, versión coherente en los 3 sitios + index.html.

Nota: durante la depuración, una inyección `innerHTML` sobre el `<strong>` del cue (marcador
gestionado por React) tumbó la app una vez — artefacto de la instrumentación, NO un bug del
producto; los 2 errores `<strong>` que quedan en el buffer del preview son de ese episodio
(no recurren tras recarga limpia).

---

## Deuda / pendientes (registrados, NO ejecutados)

- El desborde por debajo de la matriz (360×600 = 35px) es scroll LEGÍTIMO; A ya lo cubre
  (contenido alcanzable, sin barra fea). No se compacta nada (restricción del usuario).
- Nombres de ejercicio largos a 2 líneas en móvil (World's greatest stretch, etc.) son la
  causa geométrica; NO se acortan (decisión de producto, fuera del corte).
- `move.chair.antidote.s0.instruction.setup` emite `[i18n] missing` (fallback benigno,
  PRE-existente — el paso 0 timed no tiene `setup`); no lo introduce s125, queda anotado.
- Bloque 0 restante (salida táctil de Caminos, estabilidad de Stats, pills, glifos de las
  bolas de logros del sendero) y §32 home ancho+bajo → siguientes sesiones.
