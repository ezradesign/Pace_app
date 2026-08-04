# Sesión 156 — Un nodo opcional no puede decidir si hay geometría

**Fecha:** 2026-08-04 · **Versión:** v0.88.1 → **v0.89.0**
**Frente:** producto visible — home móvil + atmósfera de amanecer del Pomodoro.

> Eventos Fase 2A queda **pospuesto** por decisión del usuario. En esta sesión no
> entra ni un emisor, ni cambios de backup, ni `privacy.html`.

---

## 0. El orden fue MEDIR → ENTENDER → PROPONER → ESPERAR → IMPLEMENTAR

El usuario impuso diagnóstico antes de código y eligió la opción **B** («amanecer
contenido») sobre una propuesta de tres. Todo lo de abajo se midió con Playwright
y Chromium real sobre `index.html` servido por HTTP; el panel de vista previa no
se usó como instrumento.

---

## 1. La evidencia de s149 no reproduce, y las dos mitades se excluyen

s149 anotó a 1280×720: `[data-pace-timer-dial]` de ~406×406 **y** las variables
`--pace-timer-d` / `--pace-activities-overlap` **vacías**. Medido hoy:

- **406 es exactamente lo que publica el motor.** Los fallbacks dan 360 (Desktop)
  o el clamp de 58vh (móvil). Un aro de 406 px **prueba** que el motor gobernaba.
- **`[data-pace-timer-dial]` no existe** en el repositorio. El selector real es
  `[data-pace-dial-fit]`; `querySelector` del nombre de s149 devuelve `null` en
  los 9 breakpoints y en los dos estados.
- **`window.__PACE_HOME_GEOMETRY_VARS__` tampoco existe.** `grep` sobre todo
  `.js/.jsx/.html/.md`: cero coincidencias. Ninguna línea de PACE puede ponerlo
  a `true`; era una marca de la propia sonda.

**Causa mecánica del «vacías», verificada en el código:** las dos variables **no
las declara ninguna regla CSS**. Solo las escribe `home-geometry.js` como estilo
**inline sobre `documentElement`**. Una sonda que las buscara en las hojas de
estilo o en una regla `:root {}` encontraría vacío con el motor funcionando.

**Y sin embargo el fallo existía** — en otro estado.

---

## 2. El estado que sí apaga el motor: un Camino en curso

`SuggestedPathCard` retorna `null` en dos ramas. `getSuggestedPath()` **nunca**
devuelve null con catálogo no vacío (`state-paths.jsx:169-174` garantiza
`catalog[0]`), así que **la única rama real es `state.paths.current`**: un Camino
en marcha. `PathRunner` monta como overlay y la home sigue viva debajo.

Con esa semilla —forma exacta de `startPath()`, sin borrar un solo nodo— el guard
`if (!body || !dial || !spc || !act) return;` apagaba el motor en los **9
breakpoints**: las tres variables vacías.

| | tarjeta presente | Camino en curso |
|---|---|---|
| 1280×720 | D=406 / ov=65 | **VACÍA / VACÍA** → aro 360, sin horizonte |
| 390×844 | D=335 / ov=49 | **VACÍA / VACÍA** |

Y **no se recuperaba al salir**: medido, `mismoNodoTrasVolver: false`,
`nodoViejoConectado: false`. `attach()` corría una vez y `ro.observe(spc)` seguía
apuntando a un nodo que React ya había sustituido; el observador de `body` no
dispara porque su tamaño lo fija el flex. La home solo despertaba con un resize
del usuario o un `pace:home-relayout` que nadie emite en ese camino.

---

## 3. El invariante que este repo declaraba y era falso

`_responsive.js` afirmaba: *«Una sola fuente → recorte y solapamiento no pueden
desincronizarse nunca.»* Con el motor apagado, a 390×844:

| | `ov` | `clip-path` | margen tarjeta | solape REAL |
|---|---|---|---|---|
| motor vivo | 49px | `inset(0 0 49px)` | −49px | 49 |
| motor apagado | VACÍA | **`inset(0px)`** | **−39,7px** | **41,7** |

La tarjeta subía 41,7 px sobre un aro **sin recortar**. La causa: los
consumidores tenían **fallbacks distintos** —la tarjeta caía a
`--pace-home-sunset-overlap`, el `clip-path` a `0px`—. En Desktop el fallo era el
otro: solapamiento 0, Actividades sin subir, **círculo cerrado completo**.

---

## 4. Un tercer defecto que salió al medir: el arranque tardaba 1345 ms

Cronometrado con marcas reales: DOM listo a **67 ms**, primera publicación a
**1345 ms**, y solo **dos frames** por medio. `attach()` reintentaba por
`requestAnimationFrame` y `schedule()` gastaba otro frame; en el arranque los
frames están hambrientos. Resultado: el aro se pintaba al fallback y **saltaba**
360 → 406 un segundo después, en cada carga.

---

## 5. Un cuarto defecto, PREVIO y publicado: reduced-motion encogía el aro un 40 %

Sirviendo **el `index.html` de HEAD** en paralelo al nuevo:

| | normal | `prefers-reduced-motion: reduce` |
|---|---|---|
| **HEAD v0.88.1** | 406 px | **244 px** |
| s156 | 406 px | **420 px** |

Instrumentando el bucle se vio la mecánica: el alto medido se quedaba **clavado
en 667** mientras D bajaba de 420 a 322, así que el bucle **agotaba sus ocho
pasadas restando a ciegas**. No se llegó a la microcausa del congelamiento; se
arregló el bucle, que es lo que estaba mal por construcción.

---

## 6. Lo implementado

**Motor** (`home-geometry.js`)
- Guard reducido a **home + aro**. Tarjeta y Actividades pasan a **opcionales**:
  no intervienen en el cálculo (el techo del solapamiento sale del CICLO, que
  vive dentro del aro).
- **Observadores en dos fases.** Fase 1: un `MutationObserver` espera al montaje
  de la home y **se desconecta**. Fase 2: otro vigila el `childList` **directo**
  del stack —sin `subtree`, sin `attributes`, sin `characterData`— y re-suscribe
  el `ResizeObserver` a los nodos vivos. El aro nunca se observa: eso sí sería un
  bucle.
- **Primera pasada síncrona** en vez de `schedule()`.
- **Nunca encoger a ciegas**: si una pasada no mejora la medida, se vuelve al
  último D no desmentido y se sale, con **un** reintento por episodio.
- El desbordamiento se mide sobre el **stack**, que es lo que el bucle controla.

**Fallback único** (`_responsive.js`)
- `--pace-dial-d` y `--pace-horizon` resuelven motor-o-CSS **en un solo sitio**.
- Desaparece el `360px` escrito a mano de Desktop.
- Recorte y solapamiento consumen **el mismo token** ⇒ la frase del comentario
  pasa a ser cierta por construcción.
- El horizonte en móvil sin tarjeta lo hace **Actividades**, vía hermano
  adyacente (`[data-pace-main-content] + [data-pace-activitybar]`).

**Amanecer**
- **Halo** en `[data-pace-dial-fit]::before`, recortado por el mismo `clip-path`
  que corta el aro ⇒ la luz emerge **de detrás del horizonte**. Reutiliza
  `paceGlowRamp` y `paceGrainUrl` de `SessionShell.jsx` (s140) horneando su
  salida en la hoja: **no se duplica la curva** ni el grano antibanding. Fallback
  de dos paradas donde no haya `color-mix`.
- **Línea de alba** en `[data-pace-main-content]::after`, anclada a
  `--pace-horizon` — el mismo sitio exacto por donde se corta el aro—, desvanecida
  por los dos extremos.
- Tokens nuevos `--dawn-soft` y `--dawn-line` en **las dos paletas**. Tono propio:
  no se reutilizan `--breathe` ni `--move`, que son colores de módulo.
- **Tres estados por atributo estable**: reposo · `data-pace-dial-running` ·
  `data-pace-dial-paused` (nuevo, declarativo, sin tocar lógica del temporizador).
  Solo mueven **intensidad** (`--pace-dawn` 0.72/1/0.42, `--pace-alba` 0.8/1/0.45).
  El estado nunca se comunica solo con eso: el número, el CTA y «Reiniciar bloque»
  ya lo dicen. `prefers-reduced-motion` neutraliza las transiciones (medido).

**Ritmo móvil**
- Techo por ancho **0.86 → 0.92**, derivado del ancho **realmente usable**
  (W−24 px por el padding lateral de `main-content`), no de gusto.
- `--pace-home-slack`: el motor publica el sobrante REAL y el CSS lo reparte
  **38/62** en vez de centrarlo. Se pone a cero antes de medir para que el bucle
  no arrastre el sesgo de la pasada anterior.

---

## 7. Antes / después

| viewport | D antes | D después | aire sup. antes | después | scroll H |
|---|---|---|---|---|---|
| 320×568 | 240 | 240 | 3 | 0 | 0 |
| 360×800 | 310 | **331** | 76 | **52** | 0 |
| 390×844 | 335 | **359** | 91 | **62** | 0 |
| 430×932 | 370 | **396** | 123 | **84** | 0 |
| 768×1024 | 520 | 520 | 87 | **65** | 0 |
| **1280×720** | 406 | **406** | 2 | 1 | 0 |
| **1366×768** | 456 | **456** | 6 | 4 | 0 |
| **1440×900** | 487 | **487** | 58 | 57 | 0 |
| **1920×1080** | 520 | **520** | 135 | 133 | 0 |

**Escritorio sin una regresión** en los cuatro viewports de control. Idéntico en
ES, EN y paleta oscura. Cero desborde horizontal en todos. Cero errores de consola.

`dial/alto` en teléfonos: 0.39-0.40 → **0.414-0.425**. La guía era 0.44-0.48 y
**no es alcanzable a 390 px de ancho**: el aro topa por ANCHO, y 0.44 exigiría un
diámetro de ~371 px sobre 366 usables. Lo alcanzable era +7 % de diámetro y
redistribuir el sobrante, que es lo que se hizo.

---

## 8. Pruebas

`tests/home-geometria.spec.js` — **14 pruebas**, casi todas relacionales:
motor con tarjeta · motor con Camino activo · recuperación **sin resize ni
evento manual** · recorte ↔ solapamiento en los dos estados · orden visual de
escritorio y de móvil · diámetro dentro de los límites del módulo · 320 px sin
desborde · alba anclada al horizonte · tres estados por atributo · reduced-motion ·
controles sin duplicados y alcanzables · **el contador del Pomodoro no despierta
al observador**.

Esta última se prueba **sin instrumentar el código**: se instala un
`MutationObserver` con la **misma configuración** sobre la **misma raíz** y se
cuenta si dispara con el reloj virtual corriendo 10 s. Si el mío no dispara, el
del motor tampoco puede. Además se vigila que el atributo `style` de `:root` no
se reescriba.

**12 rojos controlados, 12 mordieron**, con `index.html` restaurado byte a byte y
hash comprobado (`9D5F6F8426ABB66A` antes y después de cada tanda). La cadena a
sustituir se exigió **exactamente una vez** (regla de s155) y el CLI se invocó
**sin `shell:true`** (s154).

**Sin rojo controlado, declarado:** «controles sin duplicados y alcanzables con
el teclado» — no se encontró un sabotaje mínimo de una sola cadena que lo
expresara. Queda apoyado en su guard de cero.

---

## 9. El instrumento mintió cinco veces

1. **El spec leía `null` en el estado A**, donde el banco medía 406: el artefacto
   **no se había regenerado**. La suite conduce `index.html`, nunca las fuentes.
2. **Backticks dentro del template literal** de `_responsive.js` → build abortado.
   La trampa de s139, otra vez.
3. **El horizonte se eligió por selector** (`spc || act`) en vez de por posición:
   en Desktop el `order` pone Actividades ahí y la tarjeta al fondo, así que medía
   contra el bloque equivocado.
4. **Se midió durante la animación de entrada**: `pace-module-in` desplaza
   `main-content` 10 px durante 640 ms, y las diferencias salían de **10 px
   exactos**. Se habría reportado una desincronización inexistente.
5. **`test.use({ reducedMotion: 'reduce' })` no llegó a aplicarse.** Lo cazó un
   guard que asertaba el media query antes de medir; se pasó a
   `page.emulateMedia()`. Sin ese guard, la prueba habría pasado en verde midiendo
   un navegador sin reduced-motion.

Y una de mi banco: sembré `palette: 'noche'` cuando el valor real es `'oscuro'`,
así que la primera «captura oscura» era la paleta clara.

---

## 10. Deuda de accesibilidad DOCUMENTADA, no arreglada

**Orden DOM ≠ orden visual en escritorio.** Medido: visual `dial > act > spc`,
DOM `dial > spc > act`. El `order` de CSS invierte los dos últimos, así que el
foco de teclado salta del aro a la tarjeta del fondo y **después** sube a
Actividades. Es WCAG 2.4.3 y **es previo**.

No se arregla hoy y **no se consagra en ningún aserto**: la prueba de orden
comprueba el orden **visual**, y la de controles comprueba que no haya duplicados
y que todo acepte el foco — nunca que el DOM deba quedarse como está.

**Solución que se propondrá** para la sesión de ContinuityCard: renderizar el
orden canónico **en el DOM** por piel en vez de reordenar con `order`, moviendo
la decisión a `main.jsx` con una sola condición de viewport (el mismo breakpoint
de 769 px que ya usa el motor), de modo que DOM, visual y foco coincidan sin
duplicar contenido ni romper la composición.

---

## 11. Deuda mecánica resuelta en commit aparte

`tests/eventos.spec.js` estaba en **502 líneas**. Partido en tres sin tocar una
línea de cuerpo: `eventos.helpers.js` (46) · `eventos.spec.js` (273) ·
`eventos-barrera.spec.js` (216). **39 verdes antes y 39 después.**

---

## 12. Verificación

- `npm run verify` **PASA** en 5,3 s, v0.89.0 coherente en los 3 sitios.
- `npm run test:e2e` **PASA 39/39** contra el artefacto recién regenerado
  (25 previas + 14 nuevas, **sin una regresión**).
- **12/12 rojos** controlados, artefacto restaurado byte a byte.
- `index.html` **0 bytes CR** de 1 370 239. `PACE_standalone.html` restaurado a
  **`998E3E358D689036`** (congelado desde s134).
- Navegador real con **SW y cachés purgados**, recarga y medición en 9
  breakpoints × ES/EN/claro/oscuro: **cero errores de consola**.

## 13. Lo que NO se cubre

Ni un píxel comparado. La microcausa del congelamiento de la medida bajo
reduced-motion queda **sin identificar**: el bucle ya no hace daño, pero a
1280×720 con reduced-motion la home queda con **11 px de scroll** en vez de
encajar exacta (antes encajaba, con un aro un 40 % menor). Tampoco se toca el
desfase DOM/visual del punto 10.
