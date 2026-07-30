# Roadmap

> **GOBIERNA el ORDEN de trabajo** (seccion «Camino a v1.0»). El que/por que de producto vive
> en [`docs/product/AUDITORIA_SISTEMA_PACE.md`](./docs/product/AUDITORIA_SISTEMA_PACE.md).
> Indice de autoridad: [`docs/product/AUDITORIA_DOCUMENTAL.md`](./docs/product/AUDITORIA_DOCUMENTAL.md).

Visión a medio y largo plazo de PACE.
Para el estado del día a día, ver [`STATE.md`](./STATE.md).
Para el catálogo de contenido, ver [`CONTENT.md`](./CONTENT.md).
Para el modelo de monetización, ver [`MONETIZATION.md`](./MONETIZATION.md).

> **Recreado en sesión 85 (2026-06-05, v0.34.1)** tras ~60 sesiones
> borrado (commit `be81606`). Refleja lo ya hecho hasta v0.34.0 y el
> plan vigente del bloque Contenido+Premium.

---

## ✅ Hecho desde el roadmap original (s21 → s84)

Buena parte de la visión de corto/medio plazo de 2026-04 ya está en
producción:

- **Responsive móvil** — sidebar fullscreen + home en viewport (s22+).
- **Loop post-Pomodoro** — `BreakMenu` con sugerencias de pausa activa.
- **Ritmos** — vistas semanal / mensual / anual (heatmaps) (s43-s54).
- **Sonidos** — sintetizados con Web Audio (432 Hz), no WAVs (s28+).
- **Caminos** — secuencias guiadas por hora del día, 7 caminos (s49-s80).
- **i18n ES/EN completo** + PWA en Cloudflare Pages.
- **Logros** — catálogo de 106 (69 activos) con glifos heráldicos.
- **Sistema de glifos** de ejercicios (line-art) — iter cerrado 31/46 (s84).

---

## 🎯 Bloque Contenido + Premium (post-v0.34.0) — ✅ CERRADO (s94, v0.39.0)

Bloque grande en fases (1 fase = 1 sesión cerrable). Planificado en la
Fase 0 (s84-bis / 2026-06-05), cerrado en s94 (2026-07-08) con las 8 fases
hechas. Detalle de catálogo en [`CONTENT.md`](./CONTENT.md). El plan
vigente pasa a ser la secuencia post-bloque de "Camino a v1.0" (abajo).

| Fase | Alcance | Estado |
|---|---|---|
| **F1** | Copy Buy Me a Coffee (truth-fix) + recrear `CONTENT.md` y `ROADMAP.md` | **hecho (s85, v0.34.1)** |
| **F2** | Auditoría de tracking punta a punta + micro-fixes | **hecho (s86, v0.34.2)** — tracking sano + fix F-1 |
| **F3a** | Mecanismo de gating: token `--premium` + `PremiumSeal` + `RoutineCard` lee `access` (sello + "Pronto" + clic off) | **hecho (s87, v0.34.3)** — dormante, todas las rutinas `free` |
| **F3b** | Activación: gating encendido sobre rutinas existentes (8 premium / 26, binario free/premium) + `premiumUnlocked` cableado (sin compra real) + superficie premium display-only en Tweaks | **hecho (s88, v0.34.4)** — `locked.*` y licencia real diferidos a post-v1.0 |
| **F4** | Contenido Respira → ~20 técnicas (incl. CTB largas premium, con seguridad) | **hecho (s90, v0.35.0)** — 20 técnicas, 8 premium; `rounds.long` 5×35 como precursora CTB; la experiencia CTB completa queda para post-bloque (abajo) |
| **F5** | Contenido Estira → ~12-15 rutinas (~mitad premium), categorizado | **hecho (s91, v0.36.0)** — 14 rutinas, 6 premium, 4 grupos como Respira; 11 pasos nuevos con DefaultGlyph (cola D-4) |
| **F6** | Contenido Mueve → ~12-15 rutinas (~mitad premium), reclasifica la fuerza | **hecho (s92, v0.37.0)** — 14 rutinas, 6 premium, 4 grupos free-first (`mueve.cat.*`); 9 pasos nuevos con DefaultGlyph (cola D-4 → 35); strings-content.js troceado en `app/i18n/content/` |
| **F7** | Registro interno de ejercicios + **constructor de rutinas premium** (`custom.sequence`) | **hecho (s93, v0.38.0)** — registro curado 65 ejercicios / 8 grupos (`app/custom/`) + sección "Tus rutinas" al final de la biblioteca Mueve (superficie premium entera); crédito vía `completeMoveSession`, sin logros nuevos; ids `custom.<ts>` |
| **F8** | Visual de Caminos — auditoría DESIGN_SYSTEM + polish de los 6 componentes | **hecho (s94, v0.39.0)** — huérfanas `--olive`/`--terracota` → tokens reales por reemplazo directo (barra de acento invisible + botón salir ilegible corregidos); clipPath único (vivía en Sidebar, no en SenderoBar); títulos de Caminos a `var(--font-display)` (siguen data-font); SenderoBar auditado limpio, cero cambios — **CIERRA EL BLOQUE** |

**Decisión clave:** el gating va **antes** del contenido (no se puede
etiquetar `access` con honestidad sin el campo ni el sello). La unidad
gateable es la sesión, no el ejercicio suelto (ver `CONTENT.md`).

---

## 🧭 Camino a v1.0 — PLAN OPERATIVO ÚNICO (reescrito en s132)

> **Este es el ÚNICO orden de trabajo vigente.** Sustituye a la secuencia adoptada en s93, que
> llevaba 23 sesiones mostrando como «siguiente» una fila (`s107 · Caminos al centro`) que nunca
> se ejecutó, mientras las sesiones reales seguían otro orden. Texto anterior conservado en
> [`docs/archive/ROADMAP_CAMINO_V1_HISTORICO.md`](./docs/archive/ROADMAP_CAMINO_V1_HISTORICO.md).
>
> Reparto de autoridad: [`AUDITORIA_SISTEMA_PACE.md`](./docs/product/AUDITORIA_SISTEMA_PACE.md)
> fija el **qué y el por qué** de producto (Bloques 0–9 de su §23) · **este apartado fija el
> ORDEN** · [`STATE.md`](./STATE.md) fija el presente y la sesión siguiente. Si el audit y este
> plan discrepan en el orden, gana este plan; en decisión de producto, gana el audit.

### Marco de decisión (usuario, s132)

- **v1.0 = la primera versión PAGADA.** No es «la web pulida»: es que se pueda comprar.
- **Travesías SÍ entran en v1** y son el **argumento principal de compra**.
- **Viajes de respiración NO** — audio, voz, música y facilitadores quedan para después de v1.
- **Sin fecha.** Se prioriza la coherencia del producto sobre el calendario.

### La evidencia que manda: lo que dijeron los beta testers

Feedback real recogido tras el envío de s128 (aportado por el usuario en s132). **Los cinco
puntos caen en el mismo sitio: Mueve y Estira no se entienden.**

1. No está claro **cómo hacer exactamente** el ejercicio.
2. **Los glifos son flojos.**
3. La forma de **describirlos es vaga**.
4. En la versión española **se mezclan nombres en inglés**.
5. Hay **ejercicios muy complejos mezclados con ejercicios muy sencillos**.

Verificado contra el código en s132 (los tres puntos comprobables son ciertos):

| Queja | Medición |
|---|---|
| Nombres en inglés | **34 de 93** nombres de ejercicio (37 %) llevan término inglés: `Dead hang`, `Chin tucks`, `Hollow hold`, `Scapular squeeze`, `Wall sit`, `Cossack squat`, `Superman`, `Pigeon`, `Band pull-apart`… |
| Glifos flojos | **46 glifos definidos para 92 nombres de paso distintos** ⇒ del orden de la mitad de los pasos cae en `DefaultGlyph` (inventario exacto = tarea §19.2 del audit) |
| Complejo mezclado con sencillo | `level` e `intensity` están **declarados 44 veces en los datos y NO los consume nadie en la UI**: la información para separar ya existe y no se muestra |

**Consecuencia para el orden:** esto no es pulido, es el núcleo. Mueve y Estira son lo que
diferencia a PACE de un Pomodoro cualquiera, las Travesías se construyen **encima** de estos
ejercicios, y los glifos placeholder ya eran un bloqueante de venta declarado («no se puede
vender packs cuyos pasos rendericen `DefaultGlyph`»). Tres razones que apuntan al mismo sitio.

### Fases

### FASE 1 · Dirección cerrada — ✅ HECHA (s132–s134)

- **Plan operativo único** (este apartado) — s132.
- **§37 re-decidido y CERRADO** — s133, audit §37 bis: constancia = **ritmo semanal** (fuera
  racha y récord) · equilibrio = **tres marcas foco·cuerpo·respiración, sin nota** · calendario
  **por tipos de jornada**, no por volumen (`computeDayScore` deja de colorear) · **check-in de
  cierre ocasional** en cierres naturales (requiere eventos ⇒ Fase 3) · comparación
  retrospectiva sin cambios.
- **Precio y estructura comercial CERRADOS** — s134, ver `MONETIZATION.md`: **19,99 € lifetime
  como único plan al lanzamiento**, formato de licencia con `expiresAt` **opcional desde el día
  uno** · **mensual descartado** · si algún día llega un pase anual, **9,99 €** (a 4,99 €
  canibaliza el lifetime al 25 %) · todos los planes desbloquean lo mismo.
- **Reparto de artefactos CERRADO** — s134: **web y Capacitor son los objetivos canónicos**; el
  standalone baja a **export bajo demanda**.

Criterio de cierre **cumplido**: ninguna sesión posterior necesita adivinar el orden ni reabrir
el §37 ni el precio.

### FASE 1.5 · Pulido visible — ✅ HECHA (s138, v0.72.0)

Los cuatro ítems, cerrados y verificados en runtime:

1. **BUG del punto del pomodoro — MEDIDO.** Desfase real **1003 ms a 25 min** y **1999 ms a 45**.
   Causa confirmada por predicción: el gate `progress > 0.001` equivale a segundos distintos según
   la duración, mientras el arco avanza siempre en el segundo 1. Fix: comparar contra `0`.
   **Verificado a 0 ms en los cuatro presets.**
2. **Atmósfera en los ejercicios sueltos** — se levanta la restricción de s99. Obligó a una
   **segunda pasada anti-banding**: la misma rampa repartida entre más píxeles se ve en PC.
3. **Constructor premium en Mueve Y Estira**, y **al principio** de ambas bibliotecas. **Sin campo
   de módulo** (decisión del usuario). De paso se cerró un agujero de crédito: las rutinas propias
   lanzadas desde Estira no sumaban a `moveSessionsTotal`.
4. **Loto de Respira** integrado como **máscara CSS** con el color por token — que es lo que
   resuelve el contraste. 959 KB → 146 KB.

**Cinco correcciones más** salieron del feedback del usuario durante la sesión (recorte del visual,
capas a distinta velocidad, giro a tirones, tinta lavada en claro y salto de texto de 21 px en
Suspiro fisiológico). **Abierto**: los aros del visual siguen siendo dos hairlines y el usuario
quiere otra cosa; falta su dirección.

### FASE 1.6 · Ajustes y dos retiradas — ✅ HECHA (s139, v0.73.0)

Separada de la 1.5 a propósito: son ocho ítems de pulido en total y la regla es un frente por
sesión, cerrado y verificado. Los cuatro entregados en s139; detalle en
[session-139](./docs/sessions/session-139-respira-y-ajustes.md).

> **Cola de la 1.5/1.6, cerrada en s140 (v0.73.1):** el **banding de la atmósfera**, que arrastraba
> desde s100. Causa real —medida sobre los píxeles de la página, no sobre el tile— : el grano no
> ditheraba (solo tapaba, y por debajo de lo necesario) y apilar el mismo degradado dos veces
> duplicaba el escalón. Diario: [session-140](./docs/sessions/session-140-banding-atmosfera.md).

1. **Ocultar el estilo de timer** (queda siempre «aro») y **ocultar «orgánico»** del círculo de
   respiración. **Sin borrar**: una constante por opción en un solo sitio (`SHOW_TIMER_STYLE`,
   `SHOW_BREATH_ORGANICO`) que retira la opción de la UI y deja el motor intacto. Reversible en
   una línea, y la razón se anota en `DECISIONES_TECNICAS_VIGENTES.md` para que nadie lo borre
   más adelante creyendo que es código muerto.
2. **Migración de valores huérfanos** — la parte que no se ve y sin la cual lo anterior rompe.
   Al cargar, si el `timerStyle` o el estilo de respiración guardados son de los que se ocultan,
   se reescriben al que queda. Sin esto quien eligió el analógico **queda atrapado**:
   `FocusTimer.jsx:117` sigue leyendo `state.timerStyle` y `BreatheVisual.jsx:197` conserva su
   rama de `organico`. El default de `timerStyle` ya es `'aro'` (`state-core.jsx:33`), así que
   solo afecta a instalaciones antiguas que lo cambiaron a mano.
3. **BUG del botón fantasma** al cambiar el descanso entre series. Sospechoso identificado: esos
   botones llevan `transition: 'all 180ms'` y entre lo que cambia al activarse está el
   **`fontWeight`** (`TweaksPanel.jsx:290-295`), así que la transición anima el peso de la fuente.
   **Es una hipótesis, no está confirmada**: reproducir y medir antes de tocar. Si se confirma, el
   fix es declarar la transición solo de `background`, `color` y `border-color`. El mismo patrón
   aparece en `statsPanelTabStyles.tab`: revisarlo de paso.
4. **Idioma «Auto»**: tercera opción del selector y **default de las instalaciones nuevas**.
   Resuelve con el idioma del dispositivo **en cada arranque**, reutilizando `detectInitialLang()`
   (`useT.jsx:8`), que hoy solo se consulta una vez dentro de `loadState()`. Las instalaciones
   actuales conservan su elección explícita. **Verificar** que no dispare el logro secreto
   `secret.bilingual`, que se desbloquea con cualquier cambio de `state.lang` tras montar.

Criterio de cierre: ninguna opción retirada deja a nadie atrapado, el bug medido antes de
tocarlo, y el «Auto» verificado cambiando de verdad el idioma del sistema.

### FASE 2 · Que Mueve y Estira se entiendan — ⏭ SIGUIENTE

El bloque del feedback beta. La más importante.

**Arranca por una sesión de AUDITORÍA, sin tocar código** (protocolo del proyecto: auditar antes
de escribir). Entregable: la **matriz §19.2 completa** cruzando, para los 92 nombres de paso,
qué glifo existe · si está aprobado o es placeholder · si hay alias · una o dos poses · zona
corporal · si el nombre lleva inglés y cuál sería su nombre en español · nivel técnico e
intensidad declarados. De esa matriz salen las olas de trabajo, y no antes: renombrar sin tener
el mapa completo rompe claves de glifo en silencio.

1. **Nombres en español.** Los 34 nombres con inglés. Ojo: `name` ES es la **clave del glifo** y
   de la i18n del constructor ⇒ renombrar exige tocar `exercise-glyphs.jsx` y
   `content/*.js` **en el mismo cambio** (decisión s108); si se olvida, cae en silencio a
   `DefaultGlyph`. Migración por olas con verificación en runtime de que la clave nueva resuelve.
2. **Glifos: inventario y set completo.** Matriz §19.2 y cierre de la cola D-4. Los glifos que
   dibuje o apruebe el usuario se portan **literales** (regla s84).
3. **Dos niveles visuales** (§19.3): el glifo de 44×44 **identifica**; el **diagrama de ejecución**
   del runner **enseña**. Hoy se le pide al pequeño que explique la técnica y por eso se percibe
   flojo. Es la respuesta directa al «no sé cómo hacerlo».
4. **Descripciones que enseñan.** Cerrar la **ola editorial** de las 6 rutinas legacy y subir el
   listón de `instruction.action`/`care` en el resto. Tono ya fijado: realista y explicativo,
   sin lenguaje de fallo/límite (BASE §7-9).
5. **Nivel e intensidad visibles** + no mezclar: consumir los metadatos que ya existen, separar
   **intensidad** de **nivel técnico** (§29.2) y dejar de recomendar contenido avanzado por
   defecto (§29.4: Sissy squat, Nordics y compañía llevan requisitos y regresión).
6. **Preview antes de empezar** (§18.3): qué necesitas, posición, duración, pasos, adaptación.

Criterio de cierre: una persona que nunca ha hecho el ejercicio sabe **qué va a hacer, cómo y
cómo cuidarse** sin salir de la app — y ningún nombre está en inglés en la versión española.

### FASE 2.5 · Logros: curva, entrega y miniaturas

**Bloque 6 del audit**, que faltaba en el plan hasta s136 — hueco destapado por la lista del
usuario, no por la auditoría. Va aquí porque la **matriz de logros (§15.2)** y la **matriz de
ejercicios (§19.2)** de la Fase 2 son el mismo tipo de trabajo y sus glifos comparten criterio
visual: hacerlas seguidas evita repetir la discusión.

El problema, en palabras del usuario: *«con hacer media cosa o incluso saltando algo ya consigues
4 logros seguidos»*. Es literalmente lo que ya anotaban §3.4 («desbloqueos iniciales demasiado
juntos») y §15.3 («no deben desbloquearse todos juntos»).

1. **Matriz de los 106 logros** (§15.2), sin código: id · categoría · nombre · promesa · condición
   · dificultad · momento de desbloqueo · free/premium · visible/secreto · **detector real** ·
   estado · glifo. Sirve además para detectar los «inalcanzables presentados como implementados»
   que señala §3.4.
2. **Curva de progresión** (§15.3): umbrales más altos y basados en repetición o variedad real, no
   en la primera vez. Los primeros deben enseñar el sistema y conducir a la siguiente acción.
3. **Entrega escalonada**: como máximo **un logro nuevo por sesión y por día**; el resto espera en
   cola. Precedente directo: los toasts de logro ya se aplazan durante un Camino (s105).
4. **Recálculo completo con las reglas nuevas** — **decisión del usuario, EXCEPCIÓN CONSCIENTE** a
   §2.5 («progreso sin culpa») y §2.2 («nada de pérdida punitiva de progreso»): alguien puede
   abrir la app y ver que ha perdido logros que tenía. Se ejecuta así por decisión explícita; al
   implementarlo hay que **decidir cómo se comunica** (aviso único que explique el recálculo) para
   que no se lea como un bug. Contrasta con el precedente de s107, donde los ids retirados se
   dejaron como inofensivos.
5. **Miniaturas de la sidebar**: la lógica de «las 5 últimas sustituyendo a las antiguas» **ya
   existe** (`Sidebar.jsx:376-379` ordena por `unlockedAt` descendente y toma 5). Lo que falta es
   el glifo: hoy **toda miniatura desbloqueada pinta un `'✦'` fijo** (`Sidebar.jsx:403`), por eso
   parece que no se activan. Se sustituye por el glifo real reutilizando `AchGlyph` y
   `ACHIEVEMENT_GLYPHS`.
6. **Cobertura de glifos: 34 de 106.** **Sello por categoría como solución de transición** para
   los que falten (`CAT_META` ya define las 7 categorías) **+ entrada de los glifos que el usuario
   ya tiene diseñados**, que se portan **LITERALES** (regla s84: el usuario dibuja o aprueba, se
   porta tal cual, sin inventar versiones). El resto del set queda como cola de dibujo.
7. **Denominadores únicos** (§15.4): sidebar, modal, stats y toasts deben contar lo mismo — §3.4
   dice que hoy no lo hacen.

Criterio de cierre: ningún logro cae en ráfaga, cada miniatura de la sidebar se distingue de las
demás, y las cuatro superficies cuentan la misma cifra.

### FASE 3 · Eventos, fase 1 web (`pace.events.v1`)

Por qué aquí: es lo único cuyo valor **depende de haberlo hecho pronto** — el histórico que no se
emite no se reconstruye, y de él dependen «Qué te ayuda», las comparaciones, el check-in de cierre
y media pestaña Semana. Diseño cerrado y aprobado desde s117: no se rediseña, se implementa.
Criterio de cierre: se emiten eventos en web/PWA con single-writer, `file://` no emite, y el
export/import sigue siendo reemplazo total.

### FASE 3.5 · Pausa PACE (§17)

**Hueco detectado en el recorrido sistemático de s137**: no estaba en ninguna fase, y es el bucle
que hace útil la app a diario.

Hoy el BreakMenu solo **ordena** módulos según lo hecho en el día. Debe **recomendar una acción
concreta**: *«Llevas 50 minutos sentado. Te propongo Hombros ligeros, 4 minutos y sin material.»*
Usa duración del Foco · actividades del día · hora · contexto habitual · última pausa · zona
corporal · tiempo disponible · **feedback anterior**.

Aquí es donde el **feedback ligero «¿te ayudó esta pausa?»**, que se captura desde s116 **sin
ningún consumidor**, empieza por fin a servir para algo. Y responde al **problema D** del
posicionamiento (§27.3): «sé que debería parar, pero no sé qué me conviene».

Va después de eventos porque la recomendación necesita historial real, no contadores agregados.

### FASE 4 · Stats

Fase 0 (marco de altura estable, agnóstica al contenido) y Fase 1 (Hoy + Semana), según
[`STATS_DESTINO_PROPUESTA.md`](./docs/product/STATS_DESTINO_PROPUESTA.md), ya sin condicionantes
tras el cierre del §37. Es el escaparate del *free*: con eventos emitiendo puede nacer completa.

### FASE 5 · Respira: sonido real y catálogo

- **Sonido**: inhalaciones y exhalaciones reales + fondo meditativo tipo hang drum. **Como
  archivos** en web y Capacitor; el standalone conserva el motor sintetizado. La pista de fondo se
  cachea al usarla, no en el precache. Si el material se genera con IA, **verificar y guardar
  constancia de los términos de uso comercial**. La regla **voz/TTS: NUNCA** sigue en pie: esto es
  aire y música, no locución.
- **Catálogo**: revisión de las 20 técnicas y **separar Técnicas de Viajes** (§9.1).
- El **loto** ya entró en la Fase 1.5.

### FASE 6 · Caminos repensados

Los 7 actuales se reescriben como **experiencias editoriales** (Bloque 3 del audit: hoy reutilizan
demasiado contenido, casi todos tienen 3 pasos y se sienten como playlists). Formatos
Semilla/Pausa/Ritual · pasos editoriales propios · motor de hitos variables · transiciones y
cierres · revisión de duración · láminas nuevas donde haga falta.
**+ logros de Caminos** (Bloque 6): nacen aquí, con los Caminos ya reescritos, no antes.
Va **antes** de las Travesías porque las Travesías se construyen encima.

### FASE 7 · Travesías de 3, 7 y 14 capítulos

El argumento de compra. Contrato de datos · capítulos flexibles · progreso y reanudación ·
primera de 3 · primera de 7 · mapa visual · **logros de Travesías** (Bloque 6, nacen con ellas).
Ritmo propuesto pero **nunca obligatorio**: saltarse un
día no rompe nada ni culpabiliza.

### FASE 8 · Descubrimiento

**Onboarding contextual** (Bloque 2, hueco detectado en s137): capturar el contexto habitual —sentado, si puede levantarse, suelo, espacio, ruido, material— de forma opcional y editable con chips. Sin esto, los filtros y la recomendación no tienen con qué filtrar.

Taxonomía de necesidades y contexto · filtros · previews · reorganización de las tres bibliotecas
para reducir scroll · «Déjate guiar» discreto · Caminos al centro de la home + After Pomodoro (lo
que quedó huérfano del plan anterior).

### FASE 8.5 · Saneamiento (antes de vender)

Agrupado a propósito justo antes de la venta: vender una app con el onboarding sin focus trap y
sin tests del estado es un riesgo que se paga en soporte.

- **Trocear lo que pasa de 500 líneas** (regla propia): **`tokens.css` 613** — el peor y el que
  nadie miraba —, `exercise-glyphs.jsx` ~513 y `Sidebar.jsx` ~510. Candidatos ya anotados:
  extraer los `@font-face` (~90 ln) y el CSS del SenderoBar (~110 ln) de `tokens.css`; extraer
  `SenderoDelDia` + `StatusBar` de `Sidebar.jsx`.
- **Accesibilidad** (Bloque 9): tarjetas sin acceso por teclado · onboarding sin focus trap.
- **Tests del state (A-6)** e **import sanitizado (A-7)**, del P2 de `audit-producto-v0.34.4.md`.
- **i18n robustez (I18N-2)**: paridad de claves ES/EN, pseudolocalización, pluralización — una
  clave que falta es un **bug visible** en una app de pago. Más las deudas semánticas **D-1**
  (override silencioso en `content/breathe.js`), **D-2** («Hecho hoy» duplicado) y **D-3**
  (namespaces `path.*` / `paths.*` mezclados).
- **Automatizar el bump de versión** en el build (`package.json` como fuente).
- **Timer de Mueve por timestamps** (hoy `setInterval` en foreground) — necesario de todos modos
  para el ciclo de vida en Android.

### FASE 9 · Capacitor Android

**Decisión del usuario (s137): Android entra en v1**, con el coste asumido (~4–6 sesiones y
dependencia de los ciclos de revisión de Google).

- Build de Capacitor y detección de runtime. La app ya es estática y sin servidor, así que el
  envoltorio es la parte barata.
- **Adaptadores nativos de `pace.events.v1`** (SQLite log + Preferences), que la arquitectura por
  adaptadores de s117 ya contempla: por eso la Fase 3 debe respetarla desde el día uno y no
  cablear `localStorage` directamente.
- Notificaciones, safe areas, ciclo de vida, export/import.
- Pruebas en dispositivo real.

**Lo caro no es el envoltorio: es la facturación.** Google Play **obliga a usar Play Billing** para
vender funciones dentro de la app, y eso choca de frente con la licencia offline sin cuentas ni
backend. Implica un **segundo camino de entitlement** (`PurchaseAdapter`: web · Play) reconciliado
con el de la clave firmada — y el entitlement debe seguir pasando por
`app/state-entitlement.jsx` como **punto único**, o el reparto se vuelve inmanejable.

### FASE 10 · Venta

Licencia firmada offline ECDSA P-256 **con `expiresAt` opcional** + **trial explícito** (hoy el
acceso es un booleano `premiumUnlocked`; exige cambiar formalmente la decisión F3b) ·
**`PurchaseAdapter` web + Play Billing** (las tiendas son la fuente de verdad de precio y moneda:
**no hardcodear importes en las traducciones**) · proveedor / Merchant of Record para la web ·
landing separada de la app · **Términos y Privacidad revisados por un profesional** · revisión
profesional del contenido corporal · **Starter Story a fondo** para validar el precio ya fijado y
la estrategia de distribución · ficha de Play y **ASO** · QA de compra, reinstalación y cambio de
fecha.

### Reglas del plan

- **Un solo frente por sesión.** Se cierra con verificación y documentación antes de abrir otro.
- **Auditoría antes de código** en cualquier sesión que toque un subsistema con reglas propias:
  leer su fila en [`DECISIONES_TECNICAS_VIGENTES.md`](./docs/product/DECISIONES_TECNICAS_VIGENTES.md).
- **Web y Capacitor son los objetivos canonicos** (decision s134). El standalone pasa a **export bajo demanda**: se genera cuando se pide, no en cada cierre, y no condiciona la arquitectura (nada de inlinear audio en el). Motivos medidos: no comparte `localStorage` con la web (otro origen), `file://` **no emite eventos** por diseno, instalar desde el produjo el bug de icono/pantalla completa de s128 (sin `manifest`), y el catalogo de sesiones largas es imposible de inlinear (1 hora en Opus 48 kbps = ~21 MB, +33 % en base64).
- **local-first ≠ cero servicios**: infraestructura de compra y licencias sí; backend de producto
  y tracking no.
- Las fases 3 y 4 pueden adelantarse a la 2 **solo** si una sesión de la Fase 2 queda bloqueada
  esperando material del usuario (glifos dibujados, revisión fisio).

### Fuera de v1 (explícito)

Viajes de respiración con voz/música/facilitadores y CTB · **iOS** (Android SÍ entra, Fase 9) · extensión
Chrome · Vite/ESM real (Etapa B del build) · Path Builder público · Modo Retiro · temporadas ·
versión para empresas · Wrapped.

## 🌱 Medio plazo — tras el bloque

### CTB · Respiración en Trance Consciente (premium)
Sesiones largas (20-45 min): música ambiental sin voz, respiración
guiada prolongada, retenciones conscientes, timer silencioso con hitos
visuales. 4-6 sesiones en el lanzamiento Lifetime. Entregable mínimo
antes de código: guion de 1 sesión + pista musical + mockup inmersivo.
(F4/s90 dejó la precursora `breathe.rounds.long` 5×35 en el catálogo;
converge con el modo "Retiro".)

### Retos semanales (opcional)
Reto que aparece el lunes (ej: "3 sesiones de Respira"). Sin penalización.
Al completarlo, sello de colección. Sin presión.

### Notificaciones inteligentes (opt-in)
El state ya conserva `reminders: []`. Reintroducir UI como modal opt-in:
hidratación, pausa activa tras X horas, sugerencia contextual. Nunca por
defecto, sin spam.

### Feedback literario en Ritmos
Texto breve al cerrar semana/mes que contextualiza sin juzgar
("semana de foco profundo, menos movilidad — mañana suave"). Literario,
no numérico.

### Extensión Chrome
Popup 340×480 (resumen + acciones rápidas) + nueva pestaña (newtab
pantalla completa). Manifest V3, permisos mínimos (`storage`, `alarms`),
persistencia vía `chrome.storage`.

---

## 🌲 Largo plazo — v1.0+

### Lanzamiento pagado v1.0
Ver [`MONETIZATION.md`](./MONETIZATION.md). Lifetime ~20 € + Pase mensual
3,99 € + Temporadas ~5 € + donaciones BMC. Validación de **clave firmada
offline** (sin backend, sin cuentas). Pre-requisitos: bloque
Contenido+Premium cerrado, ≥2 CTB grabadas, constructor de rutinas
funcional, Términos + Privacidad redactados por abogado.

### App Android (v2.0)
Wrapping (Capacitor/Expo), layout móvil heredado del responsive, widget
de inicio (próximo break + vasos).

### Modo "Retiro"
Sesión larga combinando respiración + movilidad con música opcional.
Cercano a CTB — podrían converger en una sección "sesiones largas".

---

## 💭 Ideas sueltas (explorar / descartar)

- Reloj de escritorio (Electron ligero).
- Exportar `.ics` del plan del día (sin OAuth, alineado con "todo local").
- Plugin Notion / Obsidian ("espacio de respiración" entre bloques).

---

## 🚫 Fuera de alcance (nunca)

- Gamificación agresiva (rachas rojas, push abrumador).
- Emojis en la UI.
- Tracking / analytics sin opt-in explícito.
- Publicidad o monetización intrusiva.
- Suscripción mensual clásica con renovación automática (ver `MONETIZATION.md`).
- Consejos médicos sin disclaimer en técnicas de riesgo.
- Copia literal de listas de rutinas de terceros.
- Biometría / wearables (decisión s21 — no encaja con el tono artesanal).
- Muro de pago a mitad de una sesión (el candado vive en la puerta, nunca dentro).
- Modo oscuro OLED #000 — los negros de PACE son cálidos.
- IA generativa como feature visible.
- Backend de cuentas (infra de compra/licencias externa sí; cuentas no).
