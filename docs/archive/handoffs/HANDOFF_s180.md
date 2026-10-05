# HANDOFF s180 → s181 · La sidebar, a medio camino

> **Escrito al quedarnos sin contexto, con trabajo SIN COMMITEAR en el árbol.**
> Lo primero que hay que hacer al abrir la sesión siguiente es leer esto y
> decidir si se commitea o se revierte. Nada de lo de abajo está publicado.

---

## 0 · Estado exacto al cerrar

| | |
|---|---|
| Última versión **publicada** | **v0.112.0**, commit `718acbc`, CI en verde (`verify` + `e2e`) |
| En el árbol, **sin commitear** | todo lo de las §3 y §4 de abajo |
| Suite local | **170/170** · `npm run verify` en verde |
| `index.html` | regenerado y al día con las fuentes |
| `PACE_standalone.html` | intacto (congelado desde s134) |

**Lo que el usuario ve en `paceweb.pages.dev` es v0.112.0**, o sea SIN lo de la
§4. Para ver el estado real: `http://localhost:8765/index.html` con el preview
`pace-preview` levantado.

---

## 1 · Qué se hizo en s180 (dos versiones publicadas)

- **v0.111.0** — la sidebar reescrita entera: `Sidebar.selectors.js` (nuevo, con
  los cuatro selectores puros), `Sidebar.jsx` como orquestador, `.parts` y
  `.support` rehechos, `ABFocus` nuevo en `ActivityBar.jsx`, y
  `tests/sidebar-redesign.spec.js` (nuevo).
- **v0.112.0** — geometría fija en escritorio, los ajustes de aire medidos y
  tres defectos que estaban publicados (tarjeta no clicable, miniatura a 16,1 px,
  «1 días en ritmo»).

Diario completo con los números: `docs/sessions/session-180-la-sidebar-como-brujula.md`.

---

## 2 · Las decisiones de producto que gobiernan esta sidebar

Todas del usuario, todas tomadas **mirándolo**, y todas ya escritas en
`docs/product/DECISIONES_TECNICAS_VIGENTES.md`:

1. **Geometría FIJA en escritorio.** La columna mide lo mismo en cualquier
   monitor; el pie anclado abajo y el sobrante al final. Se probó repartir el
   aire y el usuario pidió volver: *un ritmo que cambia con la pantalla no se
   puede afinar*.
2. **CTB queda FUERA de v1**, con permiso para un prototipo técnico. El ROADMAP
   no se toca.
3. **La tarjeta SÍ cambia de rótulo** — CONTINÚA / REPETIR / PARA AHORA. Esto
   **ANULA** la regla original de la propia s180 («nunca sugiere»), y la
   anulación está escrita con sus palabras. Lo que evita que vuelva el problema
   es que el rótulo cambia de verdad, con su color.
4. **El logo al 64 %** del ancho de la banda (80 % menos un 20 %), recortado
   **por CSS** y no con un archivo nuevo.
5. **Orden:** logo → Esta semana → Hoy → Continúa → Último logro → pie.

---

## 3 · Lo que está en el árbol SIN COMMITEAR

Archivos tocados: `app/shell/Sidebar.{jsx,parts.jsx,support.jsx,selectors.js}`,
`app/main.jsx`, `app/i18n/strings/ui.js`, `scripts/verify.integridad.js`,
`tests/sidebar-redesign.spec.js`, `docs/product/DECISIONES_TECNICAS_VIGENTES.md`,
`index.html`.

- **Contadores de sesión** en Foco / Respira / Cuerpo, desde `pace.events.v1`
  (`selectSidebarTodayCounts`). Cuerpo suma `move` + `stretch`. **Círculos
  llenos**, no gotas: el agua tiene meta y los otros solo cuentan.
  **Devuelve `null` y no ceros** cuando el adaptador está inerte (`file://`,
  Capacitor) — pintar «0 sesiones» junto a «25 min» sería mentir.
- **La tarjeta nunca desaparece**: tercera rama `suggest`, que reutiliza
  `libraryParaAhora` (la regla de la biblioteca) con el pozo filtrado por
  `safety` **y** por `canAccessRoutine`.
- **Último logro en caja**, con el mismo lenguaje que Repetir, y «Ver la
  colección» dentro de su sección.
- **«Mis rutinas»** en el pie con `PremiumSeal`. Con rutinas propias abre la
  biblioteca de Mueve; sin ninguna, el constructor.
- **La pill naranja de apoyo** de vuelta en el pie.
- **La flecha de Repetir** en la línea del título (antes flotaba y **pisaba la
  meta 15 px en horizontal y 9,3 en vertical** — el defecto que el usuario
  reportó a 1920×1080 con Windows al 125 %).
- La regla del logo **vuelve** (se probó quitarla y prefirió devolverla), con la
  simetría a **25,5 px arriba y 25,5 abajo**.

---

## 4 · LO PRIMERO DE LA SIGUIENTE SESIÓN

### A · Decidir el problema de altura, que está ABIERTO

**El contenido mide ~747 px y a 1536×714 hace scroll.** En la pantalla del
usuario (1920×1080 al 125 % = 864 CSS) cabe de sobra, por eso no lo ve.

Se le dieron tres salidas y **no eligió ninguna todavía**:

1. Aceptarlo: a 720/714 hace scroll y no rompe nada.
2. Sacar 1536×714 de los objetivos — era un viewport del brief, no una pantalla
   suya.
3. Recortar ~33 px. La rejilla de Hoy es la pieza cara (232 px).

**Cómo medirlo bien** (el único método que resultó fiable): forzar el alto de
`[data-pace-sidebar]`, ocultar `[data-pace-sidebar-spacer]` y leer
`scrollHeight`. Medir con `height:auto` **miente**: daba 6 px de más en las
cuatro variantes y volteó un veredicto.

### B · El móvil no se ha revisado con estos ojos

Lleva sus propios números (9/9 donde escritorio va a 12/12) y **nadie los ha
mirado a tamaño real** desde el rediseño. El usuario dijo «ahora compruebo en el
teléfono» y no llegó a hacerlo.

### C · Commitear o revertir

Si se commitea, **es v0.113.0** y toca el cierre completo: versión en los 7
sitios, `CHANGELOG` (fila + detalle), «Última sesión» de `STATE.md`, y el diario
`session-180-*.md` ampliado con esta tercera tanda.

---

## 5 · Trampas que mordieron en esta sesión

- **Backticks dentro del template literal del CSS** de `Sidebar.support.jsx`:
  **tres veces**. El `verify` las caza siempre como error de sintaxis, antes del
  build.
- **Un estilo EN LÍNEA gana a la hoja** sin `!important` del otro lado. Costó
  que el recorte del logo no hiciera nada (la caja recortaba, el dibujo no) y
  que la tarjeta no fuera clicable (React no crea pseudo-elementos desde un
  estilo en línea: el `::after` **tiene** que estar en la hoja).
- **Mutar la fuente sin `node build-standalone.js` no prueba nada**: la suite
  corre sobre `index.html`. El primer mutante de calibración no mordió por eso.
- **Sembrar `weeklyStats` o `water` en un test exige `lastActiveDay` Y las tres
  guardas de migración**, o el rollover y `_historyRecalculated_v0_28_8` lo
  dejan todo a ceros. Tres rojos con el mismo síntoma.
- **`paceEventsAppend` NO es síncrono**: `localStorage` sigue a 0 en el mismo
  tick. Hay que esperar con `waitForFunction`.
- **Un evento hecho a mano lo rechaza el almacén en silencio.** Usar
  `window.makeEvent`.
- **`document.fonts.check()` miente**: comprueba una cara concreta y da `false`
  con las fuentes cargadas.
- **Leer `innerText` justo tras un `reload()` da el render ANTERIOR.** Me hizo
  reportar una tarjeta desaparecida que estaba ahí.
- **Las capturas del panel fallan** (`UnknownVizError`, y en blanco si el panel
  está oculto). Las medidas por API de layout sí valen.
- **La maqueta se abre como `data:`** desde la tarjeta de archivo, y ahí las
  rutas relativas no tienen base: 0 de 25 imágenes. `_maqueta-s180-sidebar.html`
  ya lleva las fuentes y el logo **incrustados** para que no vuelva a pasar.

---

## 6 · Qué NO tocar sin leer antes

- `docs/product/DECISIONES_TECNICAS_VIGENTES.md`, filas de **s180** — son cinco
  y una está anulada a propósito.
- La **rama `path`** de `selectSidebarPrimaryAction` es **inalcanzable hoy**:
  `PathRunner` monta overlay a pantalla completa siempre que `paths.current`
  existe, y salir llama a `abandonPath()`. Está escrita, documentada y **sin
  probar**, y eso se dice en su comentario.
- La **aritmética del recorte del logo** vive en la hoja de `Sidebar.support.jsx`
  con sus cuatro números: si cambia el PNG, hay que volver a medir el alfa.
- El **`marginTop: -6`** del `logoBar` no es decorativo: sale de la suma que
  mantiene la simetría, y depende del margen de la regla.

---

## 7 · La cola de después

1. **La cola que s178 eligió y s180 desplazó**: gemelo de pie, flexor de cadera
   contra la mesa, aductores sentado, y la decisión sobre `move.chair.antidote`.
2. **CTB**, fuera de v1, con prototipo permitido. El brief completo del usuario
   sigue vivo como especificación (arco de sesión, motor de audio por segmentos,
   máquina de estados, `activeBreathSession`, manifiestos offline).
3. **Fase 4 · Stats**, el tercer chip «Discreta», la música y el arte pendiente.

**Y una cosa que ya no dice ninguna superficie:** que el agua sola no enciende el
día. La frase se pintó en tres redacciones y el usuario la descartó.
