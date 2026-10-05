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

## 🧭 Camino a v1.0 — PLAN OPERATIVO ÚNICO (reescrito en s200)

> **Este es el ÚNICO orden de trabajo vigente.** Sustituye al plan de 15 fases de s132, que se
> conserva entero —con su registro de lo HECHO en las Fases 1 a 3.6— en
> [`docs/archive/ROADMAP_CAMINO_V1_S132_HISTORICO.md`](./docs/archive/ROADMAP_CAMINO_V1_S132_HISTORICO.md).
> El anterior a ese, el de s93, en
> [`docs/archive/ROADMAP_CAMINO_V1_HISTORICO.md`](./docs/archive/ROADMAP_CAMINO_V1_HISTORICO.md).
>
> Reparto de autoridad: [`AUDITORIA_SISTEMA_PACE.md`](./docs/product/AUDITORIA_SISTEMA_PACE.md)
> fija el **qué y el por qué** de producto · **este apartado fija el ORDEN** ·
> [`STATE.md`](./STATE.md) fija el presente y la sesión siguiente. La base del giro es la
> auditoría externa [`audit-externa-v0.133.1.md`](./docs/audits/audit-externa-v0.133.1.md).

### Marco de decisión (Ez, 5 de octubre de 2026 · s200)

- **Pace se quiere vender pronto.** v1.0 sigue siendo la primera versión PAGADA: que se pueda
  comprar, en la web y en Android.
- **Android entra en v1**, y la prueba cerrada de Play Console se abre **cuanto antes**, con la app
  tal como esté: el plazo de Google corre mientras se trabaja en lo demás.
- **El producto ha girado al método guiado día a día («A tu ritmo»).** Por eso **Travesías (antigua
  Fase 7) y la reescritura de Caminos (antigua Fase 6) SALEN de v1.** Los 7 Caminos se quedan como
  están.
- **Quitar los Caminos de la home NO se hace ahora**: es un cambio visual y queda anotado para una
  maqueta futura.
- **Sin fecha**, pero con la regla nueva de abajo: el alcance ya no puede crecer.

### El reparto gratis / pago (Ez, s200)

| Gratis | De pago — 19,99 € una vez |
|---|---|
| Pomodoro completo | «A tu ritmo» **a lo largo de la semana**: variación por día, aprende de «¿te ayudó?», lecturas A y C de s194 |
| «A tu ritmo» **del día** | Las **19 rutinas premium** |
| Las **32 rutinas gratuitas** | El **constructor** de rutinas propias |
| Hidrátate | Stats de **semana y año** |
| Logros y Stats **«Hoy»** | |

Se afina **al final de la prueba cerrada de Android**, preguntando a los testers «¿qué echarías de
menos?».

### Fases

### FASE 1 · Saneamiento corto

Lo mínimo para que lo que ya existe sea fiable antes de meterlo en un teléfono.

- **Eventos a IndexedDB** — **HECHO en s200 (v0.134.0)**: con dos pestañas el almacén perdía hasta
  la mitad de los eventos (`localStorage` se propaga entre procesos de forma asíncrona y el lock no
  fuerza una lectura fresca). El adaptador web vive ahora en IndexedDB con la misma interfaz y migra
  una vez el contenedor antiguo.
- **Timer de Mueve por timestamps** (hoy `setInterval` en primer plano) — necesario igualmente para
  el ciclo de vida en Android.
- **Adelgazar el método**: menos documentación por sesión y cierres más cortos (ver la auditoría
  externa de s199).

### FASE 2 · Capacitor Android y prueba cerrada

- Build de Capacitor y detección de runtime (la app ya es estática y sin servidor: el envoltorio es
  la parte barata).
- **Adaptadores nativos de `pace.events.v1`** (SQLite + Preferences), que la arquitectura por
  adaptadores ya contempla: hoy Capacitor cae al adaptador inerte y no registra nada.
- Notificaciones, safe areas, ciclo de vida, export/import; pruebas en dispositivo real.
- **Prueba cerrada en Play Console cuanto antes, con la app tal como esté.** Las cuentas personales
  nuevas necesitan **unos 12 testers durante 14 días** antes de poder publicar — *a confirmar en Play
  Console*. Al final de la prueba se pregunta a los testers **«¿qué echarías de menos?»** para
  afinar el reparto gratis/pago.

### FASE 3 · «A tu ritmo» semanal — lo que se paga

Lo que hoy es la Fase 3.6 a lo largo de la semana: **variación por día** (lectura A, ya empezada en
v0.128.0), **aprende de «¿te ayudó?»** y la **lectura C** de s194 (el sistema enseña qué cambió y
propone ajustes, con el `origin` de cada sesión que se registra desde v0.124.0). La lectura B
(planificar la semana de antemano) sigue aparcada. El `.ics` sigue aparcado hasta usar el aviso.

### FASE 4 · Stats «Hoy» y «Semana»

**Se desaparca la antigua Fase 4.** «Hoy» enseña el menú del día (motivo por el que se aparcó en
s192) y es gratis; «Semana» (y el año) es de pago. Punto de partida: las maquetas de s191
(`docs/proposals/stats-*`) y [`STATS_DESTINO_PROPUESTA.md`](./docs/product/STATS_DESTINO_PROPUESTA.md).

### FASE 5 · Cerrar con lo que hay

Las fases abiertas del plan de s132 **se cierran tal como están**, sin abrir trabajo nuevo:

- **Fase 2** (que Mueve y Estira se entiendan) — olas A, C, E y preview hechas.
- **Fase 2.5** (logros) — los siete puntos hechos.
- **Fase 3.5** (Pausa PACE) — la propuesta y el feedback hechos; zona corporal y contexto habitual
  quedan fuera.
- **Fase 3.6** («A tu ritmo» del día) — lo que siga en la semana va a la Fase 3 de este plan.
- **Fase 5** (Respira: voz y música) — lo entregado se queda; el catálogo y la separación Técnicas /
  Viajes quedan fuera.
- **Los 22 dibujos pendientes** (3 de ejercicio y 19 de logro) **entran si llegan**; si no, la
  precedencia máscara → SVG → carácter ya cubre el hueco.

### FASE 6 · Venta

- **Licencia web**: firmada offline ECDSA P-256 con `expiresAt` opcional + trial explícito.
- **Play Billing** con un **`PurchaseAdapter`** (web · Play) que pase por
  **`app/state-entitlement.jsx` como punto único**. Las tiendas son la fuente de verdad de precio y
  moneda: no se hardcodean importes en las traducciones.
- **Proveedor de pago** / Merchant of Record para la web.
- **Landing** separada de la app.
- **Revisión legal**: Términos y Privacidad revisados por un profesional (y el contenido corporal).
- **Ficha de Play** (y ASO); QA de compra, reinstalación y cambio de fecha.

### Reglas del plan

- **NINGUNA FASE ENTRA EN v1 SIN SACAR OTRA** (s200). Si algo nuevo tiene que estar en v1, se dice
  qué sale a cambio.
- **Un solo frente por sesión.** Se cierra con verificación y documentación antes de abrir otro.
- **Auditoría antes de código** en cualquier subsistema con reglas propias: leer su fila en
  [`DECISIONES_TECNICAS_VIGENTES.md`](./docs/product/DECISIONES_TECNICAS_VIGENTES.md).
- **Web y Capacitor son los objetivos canónicos** (s134). El standalone es **export bajo demanda**.
- **local-first ≠ cero servicios**: infraestructura de compra y licencias sí; backend de producto y
  tracking no. Excepción decidida en s192: estadísticas **anónimas y con permiso explícito**
  (apagadas por defecto, totales semanales), junto al servidor de licencias — exige tocar
  `privacy.html` y el gate del `verify` que prohíbe canales de salida en `app/events/`.

### Fuera de v1 (explícito)

**Travesías** (antigua Fase 7) · **reescritura de Caminos** (antigua Fase 6; los 7 actuales se quedan
como están) · **Fase 8 Descubrimiento** (onboarding contextual, filtros, reorganización de
bibliotecas) · **Viajes de respiración y CTB** (la voz sí está dentro desde s175) · **iOS** ·
**extensión de Chrome** · **Vite/ESM** (Etapa B del build) · Path Builder público · Modo Retiro ·
temporadas · versión para empresas · Wrapped.

Pendiente de maqueta, sin fase: **quitar los Caminos de la home**.

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

### ~~Lanzamiento pagado v1.0~~ · **HISTÓRICO — lo gobierna «Camino a v1.0»** (marcado s149)

> **Este apartado ya no manda.** El lanzamiento pagado **es v1.0** y su plan vivo es la sección
> «Camino a v1.0» de este mismo archivo (seis fases desde s200). Se conserva por sus pre-requisitos, que
> siguen siendo correctos.
>
> **Lo que quedó obsoleto**: el precio es **19,99 € Lifetime y UN SOLO PLAN** (s134) — el «~20 € +
> Pase mensual 3,99 € + Temporadas ~5 €» de abajo describe el modelo de cuatro vías **descartado**,
> hoy marcado como histórico en [`MONETIZATION.md`](./MONETIZATION.md).

Ver [`MONETIZATION.md`](./MONETIZATION.md). ~~Lifetime ~20 € + Pase mensual
3,99 € + Temporadas ~5 €~~ + donaciones BMC. Validación de **clave firmada
offline** (sin backend, sin cuentas). Pre-requisitos: bloque
Contenido+Premium cerrado, ≥2 CTB grabadas, constructor de rutinas
funcional, Términos + Privacidad redactados por abogado.

### ~~App Android (v2.0)~~ · **HISTÓRICO — Android entra DENTRO de v1** (marcado s149)

> **Superado por la decisión de s137**: Android no es v2, es parte de v1, y su coste real está
> asumido — el envoltorio de Capacitor es barato, pero **Play Billing obliga a un segundo camino de
> entitlement** que choca con la licencia offline sin cuentas. Ver «Camino a v1.0». **iOS sí queda
> fuera de v1.**

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
