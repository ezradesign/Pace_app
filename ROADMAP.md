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

### FASE 1 · Dirección cerrada — ✅ HECHA (s132–s133)

- **Plan operativo único** (este apartado) — s132.
- **§37 re-decidido y CERRADO** — s133, audit §37 bis: constancia = **ritmo semanal** (fuera
  racha y récord) · equilibrio = **tres marcas foco·cuerpo·respiración, sin nota** · calendario
  **por tipos de jornada**, no por volumen (`computeDayScore` deja de colorear) · **check-in de
  cierre ocasional** en cierres naturales (requiere eventos ⇒ Fase 3) · comparación
  retrospectiva sin cambios.
- **Preguntas comerciales de §36 → reasignadas a la FASE 7, con motivo**: el precio objetivo, el
  precio fundador, la prueba empresarial y el orden Android/iOS **no se deciden aquí** porque el
  propio plan exige revisar Starter Story **a fondo antes** de fijar pricing, y porque móvil y
  empresas caen fuera de v1. Decidirlas sin esos datos sería inventárselas.

Criterio de cierre **cumplido**: ninguna sesión posterior necesita adivinar el orden ni reabrir
el §37.

### FASE 2 · Que Mueve y Estira se entiendan

**SIGUIENTE.** El bloque del feedback beta. La más importante.

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
2. **Glifos: inventario y set completo.** Matriz §19.2 (existe / aprobado / revisar / placeholder
   / alias / una o dos poses / zona corporal / revisión técnica) y cierre de la cola D-4. Los
   glifos que dibuje o apruebe el usuario se portan **literales** (regla s84).
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

### FASE 3 · Eventos, fase 1 web (`pace.events.v1`)
Por qué aquí: es lo único cuyo valor **depende de haberlo hecho pronto** — el histórico que no se
emite no se reconstruye, y de él dependen «Qué te ayuda», las comparaciones y media pestaña
Semana. Diseño cerrado y aprobado desde s117: no se rediseña, se implementa.
Criterio de cierre: se emiten eventos en web/PWA con single-writer, `file://` no emite, y el
export/import sigue siendo reemplazo total.

### FASE 4 · Stats

Fase 0 (marco de altura estable, agnóstica al contenido) y Fase 1 (Hoy +
Semana), según [`STATS_DESTINO_PROPUESTA.md`](./docs/product/STATS_DESTINO_PROPUESTA.md).
Por qué aquí: es el escaparate del *free*, y con eventos ya emitiendo puede nacer completa en vez
de a medias. Requiere el §37 cerrado en la Fase 1.

### FASE 5 · Travesías

el argumento de compra.
Contrato de datos · capítulos flexibles · progreso y reanudación · primera Travesía de 3
capítulos · primera de 7 · mapa visual. Reutiliza el motor de Caminos y la capa de hitos
dinámicos. Va **después** de la Fase 2 a propósito: una Travesía de 7 capítulos construida sobre
ejercicios que no se entienden multiplica el problema por siete.

### FASE 6 · Descubrimiento

taxonomía de necesidades y contexto · filtros · previews ·
reorganización de las tres bibliotecas para reducir scroll y **sacar el constructor a Mueve Y
Estira** (ítem pendiente del Bloque 0) · «Déjate guiar» discreto · Caminos al centro de la home +
After Pomodoro (lo que quedó huérfano del plan anterior).

### FASE 7 · Venta

los bloqueantes duros y la pre-venta.
Licencia firmada offline ECDSA P-256 + **trial explícito** (hoy el acceso es un booleano
`premiumUnlocked`; exige cambiar formalmente la decisión F3b) · proveedor / Merchant of Record ·
landing separada de la app · **Términos y Privacidad revisados por un profesional** · revisión
profesional del contenido corporal · **Starter Story a fondo ANTES de fijar pricing** · ASO.
Nota: el precio que aparece más abajo en este archivo (~20 € Lifetime, 3,99 € Pase, ~5 €
Temporadas) es **provisional** hasta esa investigación.

### Reglas del plan

- **Un solo frente por sesión.** Se cierra con verificación y documentación antes de abrir otro.
- **Auditoría antes de código** en cualquier sesión que toque un subsistema con reglas propias:
  leer su fila en [`DECISIONES_TECNICAS_VIGENTES.md`](./docs/product/DECISIONES_TECNICAS_VIGENTES.md).
- **El standalone sigue vivo** como artefacto de exportación en todas las fases.
- **local-first ≠ cero servicios**: infraestructura de compra y licencias sí; backend de producto
  y tracking no.
- Las fases 3 y 4 pueden adelantarse a la 2 **solo** si una sesión de la Fase 2 queda bloqueada
  esperando material del usuario (glifos dibujados, revisión fisio).

### Fuera de v1 (explícito)

Viajes de respiración con voz/música/facilitadores y CTB · Android e iOS (Capacitor) · extensión
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
