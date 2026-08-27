# Auditoría integral · s175

> **Qué es y qué no.** Es un cruce entre **lo que el plan dice** (`ROADMAP.md`,
> `DECISIONES_PRODUCTO.md`, `DECISIONES_TECNICAS_VIGENTES.md`) y **lo que el
> árbol hace**, medido hoy. Cada cifra sale de correr algo, y donde no la he
> medido lo digo. **No reescribe el plan**: el plan operativo único sigue siendo
> «Camino a v1.0» del ROADMAP, con sus 15 fases.
>
> Punto de partida verificado: `npm run verify` **PASA** · `npm run test:e2e`
> **133/133** · árbol limpio salvo lo de esta sesión.

---

## 0 · Lo que hay que decidir antes de programar nada

Tres cosas de esta lista **chocan con decisiones escritas**. No las resuelvo yo.

### 0.1 · La voz de Respira contra la regla «Voz/TTS: NUNCA»

Los seis MP3 de `Audio - Respira` son **locuciones**: dos voces (`bradford`,
`sulafat`) × tres señales (`inhala`, `mantén`, `exhala`).

**La regla que lo prohíbe no es una nota suelta.** Aparece en **cuatro filas**
de `DECISIONES_TECNICAS_VIGENTES.md` (s114, s115, s116, s118) y **dos veces** en
`ROADMAP.md`:

- FASE 5: *«La regla **voz/TTS: NUNCA** sigue en pie: esto es aire y música, no
  locución.»*
- Marco de decisión s132: *«Viajes de respiración NO — audio, voz, música y
  facilitadores quedan para después de v1.»*

**RESUELTO EN LA MISMA SESIÓN: el usuario decidió que las voces entran.** La
regla queda anulada como manda la convención del propio documento —las cuatro
filas marcadas `SUPERSEDED por s175`, no borradas— más los tres sitios del
`ROADMAP.md`, y hay una fila nueva que recoge la decisión y sus límites.
Implementada la voz `sulafat` (`app/ui/Sound.voz.jsx`).

### 0.2 · Y aunque se cambie, la voz NO cabe en todas las rutinas

Medido con `scripts/audit/censo-respira-fases.js`, cruzando la duración real de
cada locución con las fases que devuelve `getSequence()` en las 20 rutinas:

| Voz | inhala | mantén | exhala | Rutinas donde CABE |
|---|---|---|---|---|
| `sulafat` | 2,44 s | 2,56 s | 4,96 s | **8 de 20** |
| `bradford` | *sin medir* | *sin medir* | *sin medir* | *desconocido* |

> **Corrección, y es mía.** La primera versión de esta tabla calculaba la
> duración desde la cabecera MPEG y daba 1,26 · 1,32 · 2,52 para `sulafat`,
> **casi la mitad de lo real**, con un «14 de 20» que era falso. El dato bueno
> es `audio.duration` — abrir el archivo. Las de `bradford` siguen siendo
> estimaciones de cabecera y por tanto **no valen**.

**Doce rutinas no admiten la voz.** Las tres de fases de **1 s**
(`Suspiro fisiológico`, `Bhastrika`, `Kapalabhati`), las tres de rondas y las
de 2 s — y además, por lo largo del «exhala», `Box 4·4·4·4`, `Diafragmática`,
`Coherente 5·5` y `Ujjayi`.

**El cuello de botella es la GRABACIÓN, no el mecanismo**: el «exhala» dura
4,96 s y con margen son **5,11**, así que se cae de toda rutina con exhalación
de 4 o 5 s. Con un «exhala» de **≤ 3,85 s** entraría además en las siete de
exhalación de 4 s — de 8 a 15 de 20.

> **Cómo quedó resuelto en el código**: la decisión es **por fase, no global**.
> `paceVozIntenta(nombre, segundosDeLaFase)` sólo canta si el clip entra entero
> con su margen; si no, `playSound` sigue al sintetizador de siempre. Y como
> `audio.play()` es asíncrono, la disponibilidad se sabe por precarga
> (`canplaythrough`), no intentando y fallando tarde.

> **Efecto colateral buscado**: en `PACE_standalone.html` no hay voz —los MP3
> no viajan en él—, así que allí sigue el motor sintetizado, que es lo que
> decidió s134.

**Y el «mantén» rompe otro silencio deliberado**: hasta hoy la retención no
sonaba a propósito. Con voz sí dice «mantén» una vez al entrar. Es reversible
en cuatro líneas y está marcado en el código.

### 0.3 · CTB está «fuera de v1» por escrito

`ROADMAP.md` lo pone en **«Fuera de v1 (explícito)»** y en «Medio plazo». Su
entregable mínimo **antes de código** ya está definido: *guion de 1 sesión +
pista musical + mockup inmersivo*. Pensarlo ahora es gratis; meterlo en v1 es
reabrir el alcance que s132 y s137 cerraron.

---

## 1 · Defectos vivos, medidos

| # | Qué | Medida | Coste si se olvida |
|---|---|---|---|
| 1 | **`library-transition.js` es código muerto** | 130 líneas cargadas que no pueden dispararse: su único destino era el arte de la preparación, que s175 quitó | Deuda invisible; un test lo vigila para que no deje rastro |
| 2 | **`CLAUDE.md` describe Mueve y Estira al revés** | Dice «Mueve (movilidad silla) · Estira (calistenia oficina)»; medido, Mueve = `MOVE_ROUTINES` = flexiones/fondos/plancha y Estira = movilidad. Además los **ids están cruzados**: Mueve lleva ids `extra.*` y Estira `move.*` | Manda a la sesión siguiente al archivo equivocado. Ya pasó algo así en s172 |
| 3 | **9 de las 14 de Estira piden suelo** | En una biblioteca pensada para la oficina, dos tercios no se pueden hacer en una oficina | Es **contenido**, no diseño. Ninguna maqueta lo arregla |
| 4 | **Las 18 piezas de la 2ª tanda no las ha mirado nadie** | Entraron en s171; **8 de ellas SUSTITUYEN** a un dibujo anterior. Hoja lista: `_revision-tanda2.html` | El fallo que importa —el dibujo correcto del ejercicio equivocado— sólo se ve a 700 px. Ya pasó con «Fondos en silla» |
| 5 | **El `CHANGELOG` tiene tres bloques de detalle** | La convención es dos; v0.103.0 nunca tuvo el suyo | Cosmético |

---

## 2 · Frente por frente

### 2.1 · Arte que falta

**Ejercicio** — censo regenerado hoy: **62 identidades · 59 con arte · 3 pendientes**.

- **`Rana`** — capitular de «Caderas · suelo», **la única vacía de las 28
  tarjetas**, a 62 px. Vista **decidida en s175: frontal en cuadrupedia**. Hay
  una imagen candidata válida pendiente de dos arreglos (fondo aplanado sobre
  blanco; flecha que diga «cadera atrás», no lateral).
- **`Pica en escritorio`** — en la tira, a 20 px.
- **`Nordics`** — **aplazada**: no sale en ninguna rutina fija y ya tiene SVG.
- **`Descanso`** — fuera del censo a propósito. **18 pasos en 10 rutinas de
  Mueve**, y se ve **sólo en el círculo del runner**: `libraryGlifos` lo descarta
  por nombre, así que `descanso.png` **no cambia ni un píxel de las bibliotecas**.

**Logro** — **19 sin arte**, en seis familias: constancia (4) · exploración (5) ·
secretos (5) · maestría (2) · estacionales (2) · la jornada (1). El único hueco
de «La jornada», `master.pomodoro.8`, se ve como un `VIII` de texto entre ocho
dibujos.

### 2.2 · Sidebar

**636 líneas** en tres archivos (`Sidebar.jsx` 141 · `.parts` 277 · `.support`
218). **No hay ningún rediseño escrito**: no aparece como fase del ROADMAP ni
tiene documento propio. Es decir, «rediseñar la sidebar» hoy **no tiene ni
diagnóstico ni destino** — habría que empezar por medir qué se usa de ella.

### 2.3 · Estadísticas

**1.111 líneas** ya escritas (`StatsPanel` 477 · `YearView` 349 · `PathYearView`
180 · `PathStats` 105). El destino está **decidido y documentado** desde s129:
`STATS_DESTINO_PROPUESTA.md`, en 4 fases, y el ROADMAP lo coloca como **FASE 4**
con una nota importante: *«Es el escaparate del free: con eventos emitiendo puede
nacer completa»*.

**Depende de la Fase 3**, que ya tiene emisores desde s172. O sea: **la Fase 4
está desbloqueada**.

### 2.4 · Caminos y Travesías

**7 Caminos** hoy (`path.dawn`, `midday`, `afternoon`, `tea`, `dusk`, `weekend`,
`breath`). El plan es explícito y el orden **no es negociable sin coste**:

- **FASE 6 · Caminos repensados** — los 7 se reescriben como experiencias
  editoriales. El audit ya dictaminó que *«hoy reutilizan demasiado contenido,
  casi todos tienen 3 pasos y se sienten como playlists»*.
- **FASE 7 · Travesías de 3, 7 y 14 capítulos** — «el argumento de compra».
  **Va después, y el ROADMAP dice por qué: «las Travesías se construyen encima».**

Pensar las Travesías antes de reescribir los Caminos es construir sobre lo que
el propio audit llama playlists.

### 2.5 · Que la app enganche y guíe

Es el punto más difícil de tu lista porque **no es una fase**: está repartido.
Lo que YA existe: racha, 96 logros en 7 familias, feedback por rutina, Caminos,
onboarding. Lo que el plan dice que falta, y es justo lo que produce la
sensación de «no guía»:

- **FASE 8 · Descubrimiento**, con un hueco detectado en s137 que es la raíz:
  **onboarding contextual**. Sin capturar *sentado / puede levantarse / suelo /
  espacio / ruido / material*, **los filtros y la recomendación no tienen con qué
  filtrar**. Hoy la app no sabe nada de ti, así que no puede guiarte.
- **FASE 3.5 · Pausa PACE** — el recomendador. La s143 dejó una pista dura: «no
  recomendar avanzado por defecto» **no tiene consumidor**; nace aquí.
- `reminders: []` existe en el estado y **no tiene UI** (notificaciones opt-in,
  medio plazo).

**Mi lectura, y es opinión, no medida**: la recurrencia no se arregla con más
contenido ni con más logros, sino con **que la app sepa quién eres y proponga**.
Eso es la Fase 8 + la 3.5, y ninguna de las dos está empezada.

### 2.6 · Premium

`state-entitlement.jsx` son **76 líneas** y hoy todo cuelga de **un booleano**,
`premiumUnlocked`, con el punto único ya bien montado (`canAccessRoutine` /
`canAccessPath` / `hasPremiumEntitlement`). El diseño de destino está escrito en
la **FASE 10**: licencia firmada offline ECDSA P-256 con `expiresAt` + trial +
`PurchaseAdapter` (web · Play).

**El aviso del propio ROADMAP**: *«Lo caro no es el envoltorio: es la
facturación»* — Google Play **obliga** a Play Billing, lo que exige un **segundo
camino de entitlement** reconciliado con la clave firmada.

### 2.7 · Capacitor

**FASE 9**, con coste ya estimado por ti: **~4–6 sesiones** más los ciclos de
revisión de Google. La arquitectura está preparada a propósito —los eventos van
por adaptadores desde s117 justamente para esto—, pero la fase pide además
adaptadores nativos (SQLite + Preferences), notificaciones, safe areas y pruebas
en dispositivo real.

**Cuándo**: el plan lo pone **después** de Stats, Caminos, Travesías,
Descubrimiento y Saneamiento. Adelantarlo significaría portar una app que
todavía va a cambiar de forma.

---

## 3 · Lo que yo haría, y por qué

No es el plan: es una recomendación de orden, con el criterio de **qué desbloquea
más y qué cuesta más si se olvida**.

1. **Cerrar las decisiones del §0** (voz, y si CTB entra o no). Son documentos,
   no código, y bloquean a las demás.
2. **FASE 4 · Stats.** Está desbloqueada, tiene destino escrito, hay 1.111 líneas
   sobre las que construir y es «el escaparate del free». Es la que más devuelve
   por sesión.
3. **El arte que queda**: `Rana` (la única capitular vacía) y los 19 de logro.
   Barato y muy visible.
4. **FASE 8 · onboarding contextual**, que es la raíz real de «no me guía».
5. **FASE 6 → 7** (Caminos y luego Travesías), en ese orden.
6. **Capacitor y venta al final**, como dice el plan.

**La sidebar no está en esta lista** a propósito: no tiene diagnóstico. Si te
molesta algo concreto de ella, eso sí es una sesión — pero «rediseñarla» sin
saber qué falla es empezar por el final.

---

## 4 · Lo que esta auditoría NO cubre

- **No he medido la sidebar por dentro** (qué se usa, qué sobra): sin diagnóstico
  previo no hay nada que auditar.
- **No he escuchado los seis MP3**: sólo he leído sus cabeceras. Del timbre, el
  ruido de fondo o si las dos voces pegan con el tono de la app, **no sé nada**.
- **No he revisado los términos de uso comercial** del audio, que la FASE 5 exige
  expresamente si el material se genera con IA.
- **Ni un píxel comparado** en móvil real, ni inglés, ni paleta oscura.
- **No he auditado el contenido corporal** (la FASE 10 pide revisión
  profesional).
