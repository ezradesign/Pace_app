# Changelog

Todos los cambios notables del proyecto PACE.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).
Versionado semántico informal — ver [`CLAUDE.md`](./CLAUDE.md#versionado-semántico-informal).

**Convención:** este archivo solo detalla las **2 últimas versiones**. Para
versiones anteriores, la tabla enlaza al diario completo en
[`docs/sessions/`](./docs/sessions/).

---

## Historial completo

> **Nota — s137 (2026-07-30): sesión SOLO-DOCUMENTAL, sin versión nueva.** **Recorrido sistemático:
> 10 bloques del audit × 16 fases.** Motivado por dos huecos seguidos que destapó la lista del
> usuario y no la auditoría (Respira en s134, logros en s136). Se cruzaron los Bloques 0–9, los 4
> backlogs vivos de `STATE.md`, la deuda técnica y las deudas semánticas: **8 de 10 bloques ya
> estaban cubiertos**. **Convergencia**: las pills «Breve/Tranquilo/Amplio» del backlog de s117 son
> los botones del descanso entre series ⇒ el bug del botón fantasma, ya en la 1.6. **11 huecos
> colocados**: **§17 «Pausa PACE»** —el BreakMenu debe RECOMENDAR una acción concreta y es el
> **consumidor del feedback capturado desde s116 sin usar**, además de responder al problema D del
> §27.3— → **FASE 3.5** · trocear >500 líneas (**`tokens.css` 613**, `exercise-glyphs.jsx` ~513,
> `Sidebar.jsx` ~510), **a11y**, **tests del state (A-6)**, **import sanitizado (A-7)**, **i18n
> I18N-2 + deudas D-1/D-2/D-3**, bump automático y timer de Mueve por timestamps → **FASE 8.5
> saneamiento** · **onboarding contextual** → Fase 8 · **logros de Caminos y Travesías** → Fases 6
> y 7. **DECISIÓN: Android ENTRA en v1** (Fase 9) con el coste asumido: el envoltorio de Capacitor
> es barato, pero **Play Billing obliga a un segundo camino de entitlement** que choca con la
> licencia offline sin cuentas ⇒ ~4–6 sesiones y ciclos de revisión de Google. Se recomendó web
> primero; el usuario eligió Android igualmente. **iOS fuera de v1.** Consecuencia: la Fase 3 debe
> respetar la arquitectura por adaptadores desde el día uno. **Limpieza**: marcadas **2 entradas
> obsoletas de `STATE.md`** que contradecían la realidad (scrollbar del runner y §0 de alturas
> <720px, resueltos en s125 y s126/s128). Diario:
> [session-137](./docs/sessions/session-137-recorrido-sistematico.md).

> **Nota — s136 (2026-07-30): sesión SOLO-DOCUMENTAL, sin versión nueva.** **Fase 2.5 definida:
> logros (Bloque 6).** **Segundo hueco del plan destapado por la lista del usuario y no por la
> auditoría** (el primero fue Respira en s134): el Bloque 6 no estaba en ninguna fase, porque las
> fases se construyeron desde el feedback beta y los bloqueantes de venta sin recorrer
> sistemáticamente los Bloques 0–9 — **queda pendiente ese recorrido completo**. **Corrección al
> item de las miniaturas**: la lógica de «las 5 últimas sustituyendo a las antiguas» **YA existe**
> (`Sidebar.jsx:376-379` ordena por `unlockedAt` desc y toma 5); lo que falta es el **glifo** —
> hoy toda miniatura desbloqueada pinta un **`'✦'` fijo** (`Sidebar.jsx:403`), por eso parecen
> inactivas. **Muro**: solo **34 glifos para 106 logros**. **Decisiones**: graduar con **entrega
> escalonada** (máx 1 por sesión y día, resto en cola; precedente s105) **y** condiciones al alza
> (§15.3) · **recalcular todo con las reglas nuevas**, **EXCEPCIÓN CONSCIENTE a §2.5 y §2.2**
> —puede hacer que alguien pierda logros, avisado y elegido igualmente; al implementarlo hay que
> decidir cómo se comunica— · **sello por categoría como transición** para los ~72 sin glifo
> (`CAT_META`, 7 categorías) **+ entrada de los glifos ya diseñados por el usuario**, portados
> **literales** (regla s84) · **fase propia tras Mueve y Estira**, porque la matriz §15.2 y la
> §19.2 son el mismo trabajo. Diario:
> [session-136](./docs/sessions/session-136-fase-2-5-logros.md).

> **Nota — s135 (2026-07-30): sesión SOLO-DOCUMENTAL, sin versión nueva.** **Fase 1.6 definida:
> ajustes y dos retiradas.** El usuario pidió ocultar el estilo de timer y el círculo «orgánico»,
> arreglar un flash al cambiar el descanso entre sesiones y añadir un «Auto» de idioma. **Tres
> hallazgos al verificarlo cambiaron el trabajo**: (1) **el idioma YA se auto-configura** en la
> primera apertura (`detectInitialLang()` desde s35, usado por `loadState()`) — lo que falta es la
> opción **«Auto» persistente** que re-evalúe en cada arranque; (2) el **botón fantasma** tiene
> sospechoso concreto: `transition:'all 180ms'` con `fontWeight` entre las propiedades que cambian
> (`TweaksPanel.jsx:290-295`) ⇒ **anima el peso de la fuente**; hipótesis SIN confirmar, hay que
> medir, y el patrón se repite en `statsPanelTabStyles.tab`; (3) **ocultar sin migrar dejaría gente
> atrapada**: el default de `timerStyle` ya es `'aro'` pero `FocusTimer.jsx:117` lee el valor
> guardado y `BreatheVisual.jsx:197` conserva su rama de `organico`, así que quien los eligió no
> podría salir sin resetear. **Decisiones**: migrar los valores huérfanos al cargar · ocultar con
> **una constante en un solo sitio** sin borrar y con la razón anotada en
> `DECISIONES_TECNICAS_VIGENTES.md` · «Auto» como default de instalaciones nuevas verificando que no
> dispare `secret.bilingual` · y **repartir los 8 ítems de pulido en dos sesiones** (1.5 visual,
> 1.6 ajustes). Diario: [session-135](./docs/sessions/session-135-fase-1-6-ajustes.md).

> **Nota — s134 (2026-07-30): sesión SOLO-DOCUMENTAL, sin versión nueva.** **Precio, artefactos y
> plan de 9 fases.** **PRECIO CERRADO** (`MONETIZATION.md`): **19,99 € lifetime como único plan al
> lanzamiento**, con `expiresAt` **opcional en la licencia desde el día uno** (añadir un pase
> temporal después = cambio de datos, no de arquitectura) · **mensual DESCARTADO**: sin cuentas ni
> auto-renovación obligaría a pegar clave nueva cada mes, 12 fricciones/año por 2,99 € · si llega
> anual, **9,99 € y no 4,99** (a 4,99 sale al 25 % del lifetime y lo canibaliza) · todos los planes
> desbloquean lo mismo. **ARTEFACTOS**: **web y Capacitor pasan a ser los objetivos canónicos** y
> el standalone baja a **export BAJO DEMANDA** — deja de regenerarse en cada cierre (checklist,
> árbol y versionado de `CLAUDE.md` actualizados). Evidencia: no comparte `localStorage` con la web
> (otro origen) · **`file://` no emite eventos** por diseño · instalar desde él causó el bug de
> icono y pantalla completa de s128 (sin `manifest`) · y con CTB de 20–60 min es **ininlineable**
> (1 h en Opus 48 kbps ≈ 21 MB, +33 % en base64). **AUDIO**: como archivos en web y Capacitor
> (patrón de láminas y fuentes), fondo cacheado al usarlo; **una sesión CTB completa empaquetada**
> —cumple el «al menos un Viaje completo gratuito» de §20.5— y el resto **bajo demanda** desde
> hosting estático, compatible con «local-first ≠ cero servicios». Voz/TTS sigue prohibido.
> **HUECO RECONOCIDO**: las 7 fases de s132 omitían el Bloque 1 (Respira y Loto) ⇒ el plan pasa a
> **9 fases + una 1.5**; el **loto entra ya** en la 1.5 y **sonido + catálogo** son la Fase 5.
> **Caminos se repiensa ANTES de Travesías.** Diario:
> [session-134](./docs/sessions/session-134-precio-artefactos-plan.md).

> **Nota — s133 (2026-07-30): sesión SOLO-DOCUMENTAL, sin versión nueva.** **§37 re-decidido y
> CERRADO · FASE 1 completa.** Estaba PROVISIONAL desde s130 («se añadió sin pensarse bien»); se
> cerró decisión a decisión y queda como **§37 bis** del audit, conservando el texto original como
> historia. **(1) Constancia = RITMO SEMANAL**: fuera racha actual y mejor racha
> (`PathStats.jsx:74-84`), entran «días con ritmo» sobre la tira de 7 con el criterio de día activo
> de s69 y hueco neutro. **(2) Equilibrio = TRES MARCAS foco·cuerpo·respiración, SIN nota** (la
> hidratación acompaña, no es ámbito) — **nuevo, no estaba en el spec de Stats**. **(3) Calendario
> de Mes y Año por TIPOS DE JORNADA**: `computeDayScore` (`YearView.jsx:11-24`) deja de colorear;
> los tipos se deducen de lo que hubo ⇒ aplican a todo el histórico sin necesitar eventos, con «con
> Camino» como marca superpuesta. **(4) Check-in de cierre SÍ, ocasional** en cierres naturales ⇒
> requiere eventos, Fase 3. La 5ª (comparación retrospectiva) se mantuvo sin preguntar: no añade
> nada a lo que ya prohíbe §2.2. **§36**: 5 preguntas RESUELTAS, 1 pendiente editorial, 1 abierta a
> propósito (sidebar → §14). **`STATS_DESTINO_PROPUESTA.md` sin condicionantes.** Las
> **comerciales de §36 se reasignan a la FASE 7 con motivo**: el precio no se fija antes de revisar
> Starter Story, y móvil y empresas caen fuera de v1. **Próxima sesión ya definida**: Fase 2,
> sesión 1 = **auditoría de nombres y glifos** (matriz §19.2 de los 92 pasos, sin código), porque
> `name` ES es la clave del glifo y renombrar sin el mapa lo tumbaría a `DefaultGlyph` en silencio.
> Diario: [session-133](./docs/sessions/session-133-cierre-fase-1.md).

> **Nota — s132 (2026-07-30): sesión SOLO-DOCUMENTAL, sin versión nueva.** **Dirección**: había
> **dos órdenes de trabajo compitiendo** (la secuencia de `ROADMAP.md`, que llevaba 23 sesiones
> mostrando como «siguiente» la fila «s107 Caminos al centro» nunca ejecutada, y los Bloques 0–9
> del audit) y las sesiones s107→s131 no siguieron ninguno. La sección «Camino a v1.0» se
> reescribió como **PLAN OPERATIVO ÚNICO de 7 fases** (38→15 KB; la anterior en
> [`ROADMAP_CAMINO_V1_HISTORICO.md`](./docs/archive/ROADMAP_CAMINO_V1_HISTORICO.md)). Reparto:
> **audit = qué/por qué · ROADMAP = ORDEN · STATE = presente**. Marco del usuario: **v1.0 =
> primera versión PAGADA · Travesías SÍ (argumento principal de compra) · Viajes de respiración
> NO · sin fecha**. **Llegó el feedback beta real** y reordenó el plan: los 5 puntos caen en el
> mismo sitio —**Mueve y Estira no se entienden**— y la verificación contra el código lo confirma:
> **34 de 93 nombres (37 %) llevan inglés** en la versión española · **46 glifos para 92 nombres
> de paso** (~la mitad cae en `DefaultGlyph`) · **`level`/`intensity` declarados 44 veces y con
> CERO consumidores en la UI**. Por eso la comprensibilidad de Mueve/Estira pasa a **FASE 2**,
> por delante de eventos, Stats y Travesías. **La FASE 1 no está cerrada**: faltan la re-decisión
> del §37 y las preguntas comerciales de §36. Diario:
> [session-132](./docs/sessions/session-132-direccion-plan-unico.md).

> **Nota — s131 (2026-07-30): sesión SOLO-DOCUMENTAL, sin versión nueva.** Limpieza
> estructural que ejecuta el §4 de [`AUDITORIA_DOCUMENTAL.md`](./docs/product/AUDITORIA_DOCUMENTAL.md):
> **`STATE.md` 153→57 KB** y **este archivo 95→41 KB**. Los pesos gordos de STATE eran
> «Decisiones activas» (62 KB, 108 filas) y «Red de seguridad» (53 KB, 105 filas). Distinción
> clave: el historial por archivo **sí es historia** → `docs/archive/RED_DE_SEGURIDAD_HISTORICO.md`
> (la tabla viva conserva archivo · rol · **versión actual**), pero las **decisiones técnicas NO**
> —son reglas en vigor que evitan reintroducir regresiones— así que se mudaron a
> [`DECISIONES_TECNICAS_VIGENTES.md`](./docs/product/DECISIONES_TECNICAS_VIGENTES.md), que
> **GOBIERNA**, con el índice de títulos en STATE. Aquí las 106 filas conservan su **titular** y
> el texto largo (celdas de 4.000+ caracteres) se archivó en
> [`CHANGELOG_TABLA_HISTORICA.md`](./docs/archive/CHANGELOG_TABLA_HISTORICA.md); **el detalle de
> las 2 últimas versiones queda intacto**. Diario:
> [session-131](./docs/sessions/session-131-limpieza-estructural.md).

> **Nota — s130 (2026-07-30): sesión SOLO-DOCUMENTAL, sin versión nueva.** Auditoría
> **documental**: el usuario aportó una copia del audit desde su escritorio como «las
> decisiones más actualizadas» y el diff línea a línea demostró que es un **snapshot
> ANTERIOR** (2.200 vs 2.309 líneas; sus 12 líneas exclusivas son la versión sin anotar de
> líneas ya actualizadas en el repo; al repo le sobran el §37, el §32.6 y el bloque de
> jerarquía) ⇒ **ninguna decisión existe solo en esa copia**. Entregable:
> [`AUDITORIA_DOCUMENTAL.md`](./docs/product/AUDITORIA_DOCUMENTAL.md) — cadena de autoridad
> única (audit → DECISIONES → STATE → CHANGELOG/diarios), inventario de **20 documentos + 7
> auditorías etiquetados** con evidencia, drift detectado en `CONTENT.md`/`ROADMAP.md`, y la
> regla **«un documento que no declare su estado no gobierna»**. **Ejecutado**: 4 documentos
> a `docs/archive/` con banner (`PACE_EVOLUTION_CONTEXT` ya destilado · `CONTEXTO_UX_RUNNER_WELCOME`
> gobernaba B2.2a.5 cerrada en s112 · `license-analysis` afirmaba que no había LICENSE, que
> existe desde v0.12.9 · `smoke-tests` de v0.27.2) + READMEs en `docs/archive/` y
> `docs/audits/` + cabeceras de autoridad + fila nueva en `CLAUDE.md`. **Decisión del
> usuario: el §37 (ronda M1–M4) pasa a PROVISIONAL** y sus 5 preguntas vuelven a §36;
> §31.4/§31.6 no están afectados, así que el spec de Stats de s129 conserva su columna
> vertebral (solo quedan condicionados sus §4.4 y §4.5). **Pendiente**: adelgazar `STATE.md`
> (150 KB) y `CHANGELOG.md` (94 KB) con el método de §4. Diario:
> [session-130](./docs/sessions/session-130-auditoria-documental.md).

> **Nota — s129 (2026-07-30): sesión SOLO-DOCUMENTAL, sin versión nueva** (patrón
> s117/s109). Se iba a ejecutar «Estabilidad de Stats» (Bloque 0 · §23) y el usuario
> paró la sesión para auditar primero qué dice el sistema completo sobre Stats. El
> hallazgo: **el audit no pide reestilizar el panel, decide un panel distinto** —
> §37.4 fija el contenido en **Hoy y Semana**, §31.6 manda **Mes y Año a premium**, la
> pestaña **Hoy no existe**, y §37.3 sustituye dos mecanismos vivos (el color por
> volumen de `computeDayScore` y las **rachas** de PathStats) ⇒ estabilizar las 4
> pestañas de hoy habría sido trabajo sobre vistas condenadas. Se especificó el destino
> completo en [`STATS_DESTINO_PROPUESTA.md`](./docs/product/STATS_DESTINO_PROPUESTA.md)
> (vistas Free/premium, contenido de Hoy y Semana, **ritmo semanal** en vez de racha,
> taxonomía de **tipos de jornada** deducidos, qué se retira, **gap de datos** y 4
> fases). Decisiones nuevas del usuario: tipos de jornada **deducidos** de lo que hubo ·
> la pestaña **Caminos se integra** en Hoy y Semana (progreso profundo → premium) · la
> **sidebar** se decide al repensarla (§14). **Medición conservada** (v0.71.0, peor
> caso): chrome 221px · Semana 397 / Mes 368 / Año 226 / **Caminos 529** ⇒ la card salta
> de 448 a 751px y su techo 152px; en 1366×610 el hueco útil es 298px ⇒ el exceso es de
> **volumen**, no de CSS. Dos suposiciones corregidas por la medida: la pestaña más alta
> es **Caminos**, no Semana; y la cuadrícula de **Año no puede crecer** porque la limita
> el ANCHO (53 semanas × 13px = 689 de 756 útiles). **Cero código, cero bump, cero
> build/standalone.** Diario:
> [session-129](./docs/sessions/session-129-stats-destino-diseno.md).

> **Nota — s117 (2026-07-21): sesión SOLO-DOCUMENTAL, sin versión nueva** (patrón
> s109). Se diseñó la capa de eventos local `pace.events.v1` en
> [`docs/product/EVENTOS_SCHEMA.md`](./docs/product/EVENTOS_SCHEMA.md) (rev. 1→5;
> **arquitectura por adaptadores**, P0 single-writer resuelto; **Android e iOS via
> Capacitor previstos**) — **DISEÑO aprobado, NO implementado** (cero código, cero
> bump, cero build/standalone). Se guardaron además dos propuestas pendientes de
> valorar: [`HOME_REDISENO_PROPUESTA.md`](./docs/product/HOME_REDISENO_PROPUESTA.md)
> (solapamiento editorial + jerarquía del home) e
> [`I18N_EXPANSION_PROPUESTA.md`](./docs/product/I18N_EXPANSION_PROPUESTA.md)
> (detección automática + expansión comercial). Diario:
> [session-117](./docs/sessions/session-117-b2-2b-3-eventos-diseno.md).

> Cada fila lleva su **titular**; el detalle completo vive en el diario de su sesion (ultima
> columna). El texto largo que estaba aqui se archivo en
> [`docs/archive/CHANGELOG_TABLA_HISTORICA.md`](./docs/archive/CHANGELOG_TABLA_HISTORICA.md).

| Versión | Fecha | Título | Sesión | Detalle |
|---|---|---|---|---|
| **v0.79.0** | 2026-08-02 | fix+feat(logros): **la web volvió a abrir, y la curva dejó de desplomarse** — `useState` pelado en `main.jsx` rompía el artefacto compilado **desde s144** (en `PACE.html` no rompe: el build envuelve en IIFE) · curva medida con banco propio: el día 1 daba el **35 % de lo que da un año**, ahora el **18 %** · **AMNISTÍA**: nadie pierde un logro, se anula la excepción a §2.5 de s136 | #146 | [abajo](#v0790----2026-08-02----fixfeatlogros-la-curva-de-logros-y-la-amnistía) |
| **v0.78.0** | 2026-08-02 | feat(logros): **entrega escalonada — uno por sesión** — una primera sesión a las 6:50 daba **4 logros de golpe** (medido); ahora se gana igual y se **anuncia de uno en uno**, con cola persistida. §2.5 intacta: nada se pierde | #145 | [abajo](#v0780----2026-08-02----featlogros-entrega-escalonada--uno-por-sesión) |
| **v0.77.0** | 2026-07-31 | feat(ui): **Preview «antes de empezar» (§18.3)** — qué necesitas · posición · duración · intensidad · pasos con glifo, entre la tarjeta y la sesión. **16 de 28 descripciones llevaban el requisito escrito a mano** porque no tenía sitio; ahora lo tiene | #144 | [abajo](#v0770----2026-07-31----featui-preview-antes-de-empezar-183) |
| **v0.76.0** | 2026-07-31 | feat(content): **ola E — nivel e intensidad visibles** — las 28 rutinas declaran ya los dos ejes (17 básicas · 9 intermedias · **2 avanzadas**) · `advanced` **no existía** en los datos · «no recomendar avanzado por defecto» **no tiene consumidor**: nace en la Fase 3.5 | #143 | [session-143](./docs/sessions/session-143-ola-e-nivel-intensidad.md) |
| **v0.75.0** | 2026-07-31 | feat(content): **ola C — el inglés fuera del español** — 30 nombres de ejercicio renombrados con migración por `VISUAL_ALIAS`: de **31 nombres con término inglés a 1** · hallazgo: **5 de 47 dibujos no se pintan nunca** (4 tapados por su alias + `Nordics`) | #142 | [session-142](./docs/sessions/session-142-ola-c-nombres.md) |
| **v0.74.0** | 2026-07-31 | feat+docs: **Fase 2 arranca — matriz §19.2 y ola A de nombres** — 3 de las 4 premisas del plan NO reproducen (65 nombres, no 92; **55 %** con inglés, no 37 %; 20 sin glifo, no ~46) · 41 de 47 glifos son una sola pose estática · 5 renombrados con migración por `VISUAL_ALIAS` | #141 | [session-141](./docs/sessions/session-141-fase-2-auditoria.md) |
| **v0.73.1** | 2026-07-30 | fix(ui): **banding de la atmósfera, medido en los píxeles de la página** — el grano NO ditheraba (0,314 con él / 0,318 sin él) y apilar el mismo degradado dos veces DUPLICABA el escalón (17 de 24 niveles) · una capa con alpha compuesto + grano en sRGB | #140 | [session-140](./docs/sessions/session-140-banding-atmosfera.md) |
| **v0.73.0** | 2026-07-30 | fix+feat: **regresión de encaje de Respira + Fase 1.6** — el visual se mide contra el hueco REAL · nada de barra en actividad en curso · vela del loto · banderas con migración · botón fantasma MEDIDO · idioma «Auto» | #139 | [session-139](./docs/sessions/session-139-respira-y-ajustes.md) |
| **v0.72.0** | 2026-07-30 | fix+feat: **Fase 1.5 · pulido visible** — desfase del punto guía MEDIDO y a 0 ms · atmósfera fuera de Caminos · constructor en Mueve **y** Estira · **loto de Respira** | #138 | [session-138](./docs/sessions/session-138-pulido-visible.md) |
| **v0.71.0** | 2026-07-29 | feat(home): **home móvil universal · «amanecer del Camino»** | #128 | [session-128](./docs/sessions/session-128-home-movil-universal.md) |
| **v0.70.0** | 2026-07-29 | fix(paths): **«Salir» de un Camino vuelve a la home en vez de avanzar** | #127 | [session-127](./docs/sessions/session-127-salida-caminos.md) |
| **v0.69.0** | 2026-07-29 | fix(home): **composición proporcional del timer y horizonte del aro (Desktop)** | #126 | [session-126](./docs/sessions/session-126-home-desktop-horizonte.md) |
| **v0.68.0** | 2026-07-28 | fix(move): **barra de scroll del runner v1…** | #125 | [session-125](./docs/sessions/session-125-scrollbar-runner-v1.md) |
| **v0.67.0** | 2026-07-28 | feat(focus): **timer editorial — descriptor por duración, controles/estados y fix del `completed` inerte** | #124 | [session-124](./docs/sessions/session-124-timer-editorial-descriptor.md) |
| **v0.66.0** | 2026-07-27 | feat(home): **modelo «atardecer» responsive de la home** | #123 | [session-123](./docs/sessions/session-123-atardecer-responsive-home.md) |
| **v0.65.0** | 2026-07-26 | feat(home): **claridad UX de la home** | #122 | [session-122](./docs/sessions/session-122-claridad-ux-home.md) |
| **v0.64.0** | 2026-07-24 | feat(move): **B2.3 OLA 4 — cierre de la migración mecánica (core.plank + wall.sit)** | #121 | [session-121](./docs/sessions/session-121-b2-3-ola-4-cierre-mecanico.md) |
| **v0.63.0** | 2026-07-22 | feat(move): **B2.3 OLA 3 — 5 rutinas mixtas al contrato v1** | #120 | [session-120](./docs/sessions/session-120-b2-3-ola-3.md) |
| **v0.62.0** | 2026-07-22 | feat(move): **estabilidad de layout del runner v1 + B2.3 OLA 2** (sesión FUSIONADA 2 fases; FASE A cerrada y verificada ANTES de FASE B) | #119 | [session-119](./docs/sessions/session-119-layout-runner-y-b2-3-ola-2.md) |
| **v0.61.0** | 2026-07-22 | feat(move): **B2.3 — migración de rutinas legacy al contrato v1 (OLA 1)** | #118 | [session-118](./docs/sessions/session-118-b2-3-migracion-ola-1.md) |
| **v0.60.0** | 2026-07-21 | feat: **B2.2b-2 — feedback ligero «¿te ayudó esta pausa?»** (captura + almacenamiento, SIN consumidor visible; 5 decisiones por AskUserQuestion… | #116 | [session-116](./docs/sessions/session-116-b2-2b-2-feedback-ligero.md) |
| **v0.59.0** | 2026-07-21 | feat(move): **B2.2b-1 — contrato formal + duración derivada** (los 5 pilotos; el GIRO del runner guiado quedó CERRADO en s114, aquí NO se reabre… | #115 | [session-115](./docs/sessions/session-115-b2-2b-1-contrato-duracion.md) |
| **v0.58.0** | 2026-07-21 | feat(move): **runner guiado · capa editorial** (GIRO 2ª de 2 | #114 | [session-114](./docs/sessions/session-114-runner-guiado-editorial.md) |
| **v0.57.0** | 2026-07-20 | feat(move): **runner guiado · motor** (GIRO post-s112, 1ª de 2: s113 motor · s114 capa editorial; aplica las ENMIENDAS R2/R3/BASE §3-A ya… | #113 | [session-113](./docs/sessions/session-113-runner-guiado-motor.md) |
| **v0.56.0** | 2026-07-18 | feat+fix(ux): **B2.2a.5 — auditoría UX del runner + corte de afinado** (B2.2b EN PAUSA; gobernada por `CONTEXTO_UX_RUNNER_WELCOME.md`, entregable de… | #112 | [session-112](./docs/sessions/session-112-b2-2a5-afinado-ux-runner.md) |
| **v0.55.0** | 2026-07-17 | fix(move): **B2 — método del runner v1: gate que fluye + reps a gusto** (feedback de cierre s110; gobernado por `BASE_MUEVE_ESTIRA.md` §3/§6) | #111 | [session-111](./docs/sessions/session-111-b2-metodo-runner.md) |
| **v0.54.0** | 2026-07-17 | feat+refactor: **B2.2a — contrato de pasos v1 (pilotado) + visualId** (2ª sesión de B2, 1ª de código; gobernada por `BASE_MUEVE_ESTIRA.md`) | #110 | [session-110](./docs/sessions/session-110-b2-2a-contrato-pasos.md) |
| **v0.53.0** | 2026-07-16 | fix+feat: **B1.2 editorial de seguridad ES+EN** (CIERRA el bloque B1) | #108 | [session-108](./docs/sessions/session-108-b1-2-editorial-seguridad.md) |
| **v0.52.0** | 2026-07-16 | fix+feat: **B1.1 saneamiento** (plan de evolución, 1ª sesión de código) | #107 | [session-107](./docs/sessions/session-107-b1-saneamiento.md) |
| **v0.51.0** | 2026-07-16 | feat(onboarding): **onboarding de primera vez…** | #106 | [session-106](./docs/sessions/session-106-onboarding.md) |
| **v0.50.0** | 2026-07-15 | feat: **fuentes self-hosted (cierra Etapa A) + todayISO local + integridad de Caminos** | #105 | [session-105](./docs/sessions/session-105-fuentes-todayiso-caminos.md) |
| **v0.49.0** | 2026-07-14 | feat(paths): **escenas ilustradas de Caminos…** | #104 | [session-104](./docs/sessions/session-104-arte-caminos.md) |
| **v0.48.0** | 2026-07-13 | build: **Etapa A — precompilado Babel + React production** (plan maestro s103, 1ª de 2) | #103 | [session-103](./docs/sessions/session-103-build-etapa-a.md) |
| **v0.47.0** | 2026-07-13 | feat(pwa): **PWA completa** (plan maestro s102) | #102 | [session-102](./docs/sessions/session-102-pwa-completa.md) |
| **v0.46.0** | 2026-07-10 | feat(stats): **stats a fondo** (P2 del usuario) | #101 | [session-101](./docs/sessions/session-101-stats-a-fondo.md) |
| **v0.45.0** | 2026-07-10 | feat(paths): **remate premium de Caminos** (los 3 pendientes de feedback de s99) | #100 | [session-100](./docs/sessions/session-100-remate-caminos.md) |
| **v0.44.0** | 2026-07-09 | feat(ui+paths): **pulido global + overhaul premium de Caminos** | #99 | [session-99](./docs/sessions/session-99-pulido-caminos-premium.md) |
| **v0.43.0** | 2026-07-09 | fix(breathe): **tiempo activo en Respira** | #98 | [session-98](./docs/sessions/session-98-tiempo-activo-breathe.md) |
| **v0.42.0** | 2026-07-08 | fix(ui): pulido **modo oscuro legible** (recalibracion en bloque `--ink-3 #756D5D→#B2A995` que gobierna toda la letra fina + `--line`/`--line-2` para… | #97 | [session-97](./docs/sessions/session-97-pulido-oscuro-progreso.md) |
| **v0.41.0** | 2026-07-08 | refactor(focus): Cirugia 2 -- **motor de timer basado en timestamps** (`app/focus/useCountdown.jsx`, estados idle/running/paused/completed… | #96 | [session-96](./docs/sessions/session-96-timer-engine.md) |
| **v0.40.0** | 2026-07-08 | feat(entitlement): Cirugia 1 -- **guard central `canAccessRoutine`/`canAccessPath`** (UNICO punto de verdad del acceso, hoy derivado de… | #95 | [session-95](./docs/sessions/session-95-guard-entitlement.md) |
| **v0.39.0** | 2026-07-08 | feat(paths): F8 -- polish visual de los 6 componentes de Caminos contra DESIGN_SYSTEM (**CIERRA el bloque Contenido+Premium**) · fix huerfanas… | #94 | [session-94](./docs/sessions/session-94-f8-visual-caminos.md) |
| **v0.38.0** | 2026-07-08 | feat(custom): F7 -- registro interno de ejercicios (65 items / 8 grupos, curado a mano) + constructor de rutinas premium (crear/editar/borrar/lanzar… | #93 | [session-93](./docs/sessions/session-93-f7-constructor-rutinas.md) |
| **v0.37.0** | 2026-07-07 | feat(move): F6 -- catalogo Mueve 7 -> 14 rutinas (7 nuevas Strengthside/Jess Martin-inspired: sentadillas de silla, gluteos invisibles, espalda de… | #92 | [session-92](./docs/sessions/session-92-f6-contenido-mueve.md) |
| **v0.36.0** | 2026-07-07 | feat(extra): F5 -- catalogo Estira 7 -> 14 rutinas (7 nuevas Strengthside-inspired: despertar matinal, muñecas y manos, hombros·circulos, couch… | #91 | [session-91](./docs/sessions/session-91-f5-contenido-estira.md) |
| **v0.35.0** | 2026-07-07 | feat(breathe): F4 -- catalogo Respira 12 -> 20 tecnicas (8 nuevas: diafragmatica, exhalacion 4·6, ritmica yin, coherente 432 con drone forzado… | #90 | [session-90](./docs/sessions/session-90-f4-contenido-respira.md) |
| **v0.34.5** | 2026-07-07 | fix+feat(P0 auditoria): SW limpia caches viejos + network-first navegaciones · reduced-motion con excepcion motion esencial (BreathVisual) · paleta… | #89 | [session-89](./docs/sessions/session-89-p0-auditoria-fixes.md) |
| **v0.34.4** | 2026-07-07 | feat(premium): F3b -- activacion del gating sobre las rutinas existentes (8 premium / 26, binario free/premium) + `premiumUnlocked` en defaultState… | #88 | [session-88](./docs/sessions/session-88-f3b-activacion-gating.md) |
| **v0.34.3** | 2026-06-30 | feat(premium): F3a -- mecanismo de gating a nivel sesion (campo `access` + componente `PremiumSeal` + sello/Pronto en `RoutineCard` + token… | #87 | [session-87](./docs/sessions/session-87-f3a-gating-mecanismo.md) |
| **v0.34.2** | 2026-06-05 | fix(tracking): F-1 PathFocusStep llama updateStreak (el foco-en-Camino cuenta para la racha, como la home) + docs auditoria F2 de tracking (informe +… | #86 | [session-86](./docs/sessions/session-86-f2-tracking-audit.md) |
| **v0.34.1** | 2026-06-05 | fix(support)+docs: copy Buy Me a Coffee honesto (nucleo libre, fuera "sin pro") + recrear CONTENT.md y ROADMAP.md (borrados en be81606) | #85 | [session-85](./docs/sessions/session-85-f1-bmc-docs.md) |
| **v0.34.0** | 2026-05-24 | feat(glyphs): cierre iter glifos canonicos Mueve/Estira | #84 | [session-84](./docs/sessions/session-84-glifos-cierre-iter.md) |
| **v0.33.3** | 2026-05-23 | refactor(achievements): split `app/achievements/Achievements.jsx` (409 ln) en `achievements/` + `glyphs/` (catalog.js + achievement-glyphs.jsx) | #83 | [session-83](./docs/sessions/session-83-achievements-split.md) |
| **v0.33.2** | 2026-05-23 | refactor(main): split `app/main.jsx` (600 ln) en `app/main/` (_responsive + TopBar + ActivityBar) | #82 | [session-82](./docs/sessions/session-82-main-split.md) |
| **v0.33.1** | 2026-05-19 | refactor(i18n): split `app/i18n/strings.js` (791 ln) en `app/i18n/strings/` (_bootstrap + ui + sessions + paths + stats + achievements) | #81 | [session-81](./docs/sessions/session-81-strings-split.md) |
| **v0.33.0** | 2026-05-18 | refactor(paths): split PathRunner.jsx en steps/ (Breathe/Focus/Hydrate/Body) | #80 | [session-80](./docs/sessions/session-80-split-pathrunner.md) |
| **v0.32.1** | 2026-05-18 | fix(ui): pomodoro contextual en Camino (aro + pausa/reset/saltar) + fade-out toasts + oscuro +10% | #79 | [session-79](./docs/sessions/session-79-pomodoro-camino-fadeout-oscuro.md) |
| **v0.32.0** | 2026-05-17 | feat(camino): catalogo 5 -> 7 (path.tea + path.breath) + redisenio PathHydrateStep + getSuggestedPath jerarquica (lastViewed > horario > anytime >… | #78 | [abajo](#v0320----2026-05-17----featcamino-catalogo-5--7) |
| **v0.31.0** | 2026-05-17 | feat(camino): PathTransitions + fix SenderoBar visible + retirada de sticky + microcopia (Toast 3s, CTA verde musgo) | #77 + #77b | [session-77](./docs/sessions/session-77-path-transitions.md) + [s77b](./docs/sessions/session-77b-fix-microcopia.md) |
| **v0.30.0** | 2026-05-16 | feat(camino): arquitectura overlay | #76 | [session-76](./docs/sessions/session-76-overlay-arquitectura.md) |
| **v0.29.0** | 2026-05-16 | feat(camino): sendero hibrido + renombrado sensorial + fix dawn/dusk + foco interno suma a stats | #75 | [session-75](./docs/sessions/session-75-sendero-implementacion.md) |
| **v0.28.12** | 2026-05-12 | style(ui): recalibrar oscuro a negro calido sutil con escalonamiento reducido | #74 | [session-74](./docs/sessions/session-74-oscuro-recalibrado.md) |
| **v0.28.11** | 2026-05-12 | style(ui): subir luminosidad y escalonar fondos modo oscuro | #73 | [abajo](#v02811----2026-05-12----styleui-subir-luminosidad-y-escalonar-fondos-modo-oscuro) |
| **v0.28.10** | 2026-05-12 | style(ui): marron oscuro calido + aro suavizado en modo oscuro | #72 | [abajo](#v02810----2026-05-12----styleui-marron-oscuro-calido--aro-suavizado) |
| **v0.28.9** | 2026-05-12 | feat(ux): aro dinamico + retira envejecido + logo modo oscuro + reorden tweaks | #71 | [session-71](./docs/sessions/session-71-aro-dinamico-limpieza-tweaks.md) |
| **v0.28.8** | 2026-05-12 | fix(tracking): C1+C2+C3+A1+A2 weeklyStats reset semanal + history idempotente + streak proactivo + dia activo unificado | #69 | [session-69](./docs/sessions/session-69-fix-tracking-idempotente.md) |
| **v0.28.7** | 2026-05-11 | fix(breathe): inhalacion suena en arranque y reinicio de ciclo | #67 | [session-67](./docs/sessions/session-67-fix-breathe-play-inhale.md) |
| **v0.28.6** | 2026-05-12 | fix(ui): logo completo + tagline sidebar movil + cache-bust iconos maskable safe zone | #66 | [session-66](./docs/sessions/session-66-fix-logo-tagline-movil.md) |
| **v0.28.5** | 2026-05-11 | fix(deploy): index.html root + manifest PWA + iconos PNG vaca pastando (Cloudflare Pages) | #65 | [session-65](./docs/sessions/session-65-fix-cloudflare-pwa.md) |
| **v0.28.5** | 2026-05-12 | fix(ui): logo movil cortado + hueco sidebar movil + scroll vertical heatmaps anuales + nota Semana restaurada (desktop only) | #64 | [session-64](./docs/sessions/session-64-fixes-ui-menores.md) |
| **v0.28.4** | 2026-05-12 | feat(ui): scroll residual Stats desktop eliminado (WeekView sin nota, Mes 56->48px, Año futuros solo borde, Caminos margenes) + sidebar movil… | #63 | [session-63](./docs/sessions/session-63-fix-desktop-movil.md) |
| **v0.28.3** | 2026-05-11 | chore(ui): WeekView + PathStats compactacion segunda pasada | #61/62 | [session-61](./docs/sessions/session-61-cleanup-sidebar-ritmo.md) |
| **v0.28.2** | 2026-05-11 | chore(ui): sidebar mas limpio (eliminados 3 contadores hoy) + Ritmo web sin scroll en Semana/Mes/Ano/Caminos + camino sugerido compacto en movil +… | #61 | [session-61](./docs/sessions/session-61-cleanup-sidebar-ritmo.md) |
| **v0.28.1** | 2026-05-11 | refactor(glyphs): iteracion parcial 13/46 glifos hacia lenguaje home (objeto/forma/parte aislada/metafora) | #60 | [session-60](./docs/sessions/session-60-glyphs-iter-incompleto.md) |
| **v0.28.0** | 2026-05-11 | feat(glyphs): 46 glifos canonicos por paso individual Mueve/Estira | #59 | [abajo](#v0280----2026-05-11----featglyphs-46-glifos-canonicos-por-paso) |
| **v0.27.6** | 2026-05-11 | chore(workflow): blindaje Git -- WORKFLOW.md, check-session.ps1, README actualizado a version real, bump version | #58 | [abajo](#v0276----2026-05-11----choreworkflow-blindaje-git) |
| **v0.27.5** | 2026-05-11 | refactor(state): state.jsx dividido en 6 modulos por dominio (core/timer/hydrate/achievements/paths/settings) sin cambios de comportamiento | #57 | [session-57](./docs/sessions/session-57-refactor-state.md) |
| **v0.27.3** | 2026-05-09 | chore(build): blindaje build con parser sintactico real | #56 | [abajo](#v0273----2026-05-09----chorebuild-blindaje-build-con-parser-real) |
| **v0.27.2** | 2026-05-09 | chore(polish): i18n sync ES/EN, a11y overlays (role/Escape/focus), mobile audit, smoke tests documentados | #55 | [abajo](#v0272----2026-05-09----chorpolish-i18n-sync-a11y-overlays-mobile-smoke-tests) |
| **v0.27.1b** | 2026-05-09 | fix(i18n): restaurar claves paths.path.*.name/tagline EN truncadas en s54 + refuerzo build check-d/e | #54b | (hotfix, sin seccion detalle) |
| **v0.27.1** | 2026-05-09 | feat(stats): seccion Caminos en Stats | #54 | [abajo](#v0271--2026-05-09) |
| **v0.27.0** | 2026-05-08 | feat(paths): Caminos parte 2 -- PathsLibrary overlay, sistema favorito, boton Repetir, sugerencia dual favorito+hora | #53 | [abajo](#v0270--2026-05-08) |
| **v0.26.1** | 2026-05-08 | chore: saneamiento tecnico - encoding STATE.md, validateFileEnd en build, 0 WARN, audit deuda 5 archivos >500 lineas | #52 | [abajo](#v0261--2026-05-08--chore-saneamiento-tecnico) |
| **v0.26.0** | 2026-05-08 | feat(paths): SuggestedPathCard -- tarjeta home que sugiere el camino del momento, 4 icons de paso, doneToday badge, 10 claves i18n -- cierra sistema… | #51 | [abajo ↓](#v0260--2026-05-08--featpaths-suggestedpathcard) |
| **v0.26.0-beta** | 2026-05-08 | feat(paths): PathRunner UI — overlay full-screen, 4 kinds, modal in-app de salida, pantalla de completado, reanudacion tras recarga | #50 | [abajo ↓](#v0260-beta--2026-05-08--featpaths-pathrunner-ui) |
| **v0.26.0-alpha** | 2026-05-08 | feat(paths): Caminos parte 1 — capa de datos (5 caminos canónicos, helpers lookup, funciones state, migración defensiva) | #49 | [abajo ↓](#v0260-alpha--2026-05-08--featpaths-caminos-parte-1--capa-de-datos) |
| **v0.25.4** | 2026-05-08 | fix(achievements): hotfix Achievements.jsx truncado en s48d | #48d.1 | [session-48d1](./docs/sessions/session-48d1-hotfix-achievements-truncado.md) |
| **v0.25.3** | 2026-05-08 | fix(achievements): auditoría glifos Dirección D | #48d | [session-48d](./docs/sessions/session-48d-auditoria-glifos.md) |
| **v0.25.2** | 2026-05-07 | fix(standalone): repara crash post-s48b | #48c | [abajo ↓](#v0252--2026-05-07--fixstandalone-repara-crash-post-s48b) |
| **v0.25.1** | 2026-05-07 | fix(achievements): 20 glifos Dirección D portados literal de design/glyphs-explorations.html (viewBox 44×44, currentColor) | #48b | [abajo ↓](#v0251--2026-05-07--fixachievements-glifos-canónicos-dirección-d) |
| **v0.25.0** | 2026-05-06 | feat: stats achievements (4 logros nuevos) + mobile UX fixes (sidebar+tabs) + 10 glifos SVG constelaciones + renderGlyph en Seal y Toast | #46 | [session-46](./docs/sessions/session-46-stats-ux-glifos.md) |
| **v0.24.0** | 2026-05-06 | fix(standalone): regenerar build roto de s44 (truncamiento transitorio | #45 | [session-45](./docs/sessions/session-45-fix-standalone-build.md) |
| **v0.24.0** | 2026-05-06 | feat(stats): YearView — heatmap anual 53×7, score compuesto, 5 niveles tierra→oliva, navegación entre años, click celda→zoom mes, responsive… | #44 | [session-44](./docs/sessions/session-44-yearview.md) |
| **v0.23.0** | 2026-05-06 | feat(history): capa de datos history (days/months/years) + migration guard + MonthHeatmap con tabs Semana\|Mes\|Año + tooltip responsive | #43 | [abajo ↓](#v0230--2026-05-06--feathistory-capa-de-datos--heatmap-mensual) |
| **v0.22.1** | 2026-05-06 | fix(ux): hints teclado ocultos en móvil + title attrs eliminados en MoveSession + cronómetro reescalado (128→72px) + shortcut BreakMenu oculto | #42 | [abajo ↓](#v0221--2026-05-06--fixux-corrección-ux-móvil) |
| **v0.22.0** | 2026-05-06 | feat: split TweakSecretsWatcher + i18n ambient toggle + 5 detectores logros (hydrate.week.perfect + master.box/coherent/rounds.10 + master.atg.20) | #41 | [session-41](./docs/sessions/session-41-drone-toggle-logros.md) |
| **v0.21.0** | 2026-05-06 | feat(audio): sonidos move.start/step/end + hydrate.sip/goal + achievement.unlock/secret | #40 | [abajo ↓](#v0210--2026-05-06--feataudio-sonidos-movhydrateachievements) |
| **v0.20.0** | 2026-05-06 | fix: crash ToastHost variable shadowing (t/useT) + mount loop 6-check + guard breathNoise | #38b patch | [abajo ↓](#v0200--2026-05-05--feataudio-refactor-432-hz) |
| **v0.20.0** | 2026-05-05 | feat(audio): refactor 432 Hz + primitivas componibles + respiración realista con ruido blanco filtrado + pomodoro.start/end | #38a | [abajo ↓](#v0200--2026-05-05--feataudio-refactor-432-hz) |
| **v0.19.1** | 2026-05-05 | fix(i18n): crash al cargar — useT() faltante en AchievementsPreview + auditoría defensiva de 8 componentes | #37 hotfix | [session-37](./docs/sessions/session-37-i18n-pwa-ajustes.md) |
| **v0.19.0** | 2026-05-05 | Cierre i18n total (fases respiración + 8 strings restantes) + PWA activada (manifest+SW) + panel Ajustes limpiado (audio primero, timer 3 ops, layout… | #37 | [abajo ↓](#v0190--2026-05-05--cierre-i18n--pwa--ajustes) |
| **v0.18.0** | 2026-05-05 | i18n de contenido (ejercicios Respira/Mueve/Estira) + FocusTimer i18n completo + toggle ES·EN en WelcomeModal + dot verde del aro eliminado | #36 | [abajo ↓](#v0180--2026-05-05--i18n-contenido--focustimer--dot-eliminado) |
| **v0.17.0** | 2026-05-05 | i18n ES/EN completo: auditoría + 3 bugs críticos corregidos + migración de 6 módulos (BreatheLibrary, MoveModule, ExtraModule, HydrateModule… | #35 | [session-35](./docs/sessions/session-35-i18n-completo.md) |
| **v0.16.0** | 2026-05-05 | Split BreatheModule (3 archivos: BreatheVisual + BreatheLibrary + BreatheSession) + 4 detectores nuevos (master.collector.half/full… | #34 | [session-34](./docs/sessions/session-34-split-breathe-logros.md) |
| **v0.15.0** | 2026-05-04 | Loop post-Pomodoro: BreakMenu con rotación inteligente (computeScore + sort + "Para ti" + done indicator) | #33 | [session-33](./docs/sessions/session-33-loop-post-pomodoro.md) |
| **v0.14.3** | 2026-05-04 | Code review: 7 fixes de calidad (dead state, condición redundante, aria-live, sip sound, logros recientes) | #32 | [session-32](./docs/sessions/session-32-code-review-fixes.md) |
| **v0.14.2** | 2026-04-30 | Fix de comillas en DESIGN_SYSTEM.md (revisión externa commit cd75d27) | #31 | [session-31](./docs/sessions/session-31-fix-comillas-design-system.md) |
| **v0.14.1** | 2026-04-30 | DESIGN_SYSTEM.md creado + limpieza de duplicación: tokens, paletas, tipografía, espaciado, breakpoints y utilidades centralizados | #30 | [session-30](./docs/sessions/session-30-design-system.md) |
| **v0.14.0** | 2026-04-29 | Fruta fácil II: 6 logros nuevos cazables (`breathe.sessions.10/50`, `move.sessions.25`, `morning.5`, `master.long.focus`, `master.dawn`… | #29 | [session-29](./docs/sessions/session-29-logros-aplazados-glifos.md) |
| **v0.13.0** | 2026-04-29 | Fruta fácil: 8 logros nuevos cazables (5 primeros pasos + 3 rachas largas) + módulo `Sound.jsx` con Web Audio sintetizado (4 tonos) cableado a fin de… | #28 | [session-28-fruta-facil-logros-sonidos.md](./docs/sessions/session-28-fruta-facil-logros-sonidos.md) |
| **v0.12.10** | 2026-04-23 | Modales responsive en móvil: patrón `<style>` + `data-pace-*` + `!important` aplicado a Primitives.Modal (10 modales de golpe), SessionShell… | #27 | [session-27-modales-mobile.md](./docs/sessions/session-27-modales-mobile.md) |
| **v0.12.9** | 2026-04-23 | Licencia: `LICENSE` (Elastic License 2.0) + cabeceras de copyright en fuentes principales + sección "Licencia" en README + 4ª vía de monetización… | #26 | [session-26-refactor-fase2.md](./docs/sessions/session-26-refactor-fase2.md) |
| v0.12.8 | 2026-04-23 | Refactor Fase 2: extracción de `SessionShell`, limpieza de Support, saneo de exports a `window`, helper `displayItalic` | #26 | [session-26-refactor-fase2.md](./docs/sessions/session-26-refactor-fase2.md) |
| **v0.12.7** | 2026-04-23 | Auditoría interna previa al refactor · sin cambios de código · informe en [`docs/audits/audit-v0.12.7.md`](./docs/audits/audit-v0.12.7.md) | #25 | [abajo ↓](#v0127--2026-04-23--auditoria-interna) |
| v0.12.7 | 2026-04-23 | Scroll asimétrico: home con `100dvh` puro (4 botones siempre) + sidebar con `min-height: calc(100dvh + 1px)` que recupera el auto-hide de la barra… | #24 | [session-24-scroll-asimetrico.md](./docs/sessions/session-24-scroll-asimetrico.md) |
| v0.12.6 | 2026-04-23 | DVH fit: `100dvh` con fallback a `100vh` para que el móvil encaje con o sin barra de URL | #23 | [session-23-dvh-fit.md](./docs/sessions/session-23-dvh-fit.md) |
| v0.12.5 | 2026-04-23 | Responsive móvil: sidebar desacoplada fullscreen + home que cabe en 375×812 sin scroll | #22 | [session-22-responsive-movil.md](./docs/sessions/session-22-responsive-movil.md) |
| v0.12.4 | 2026-04-23 | Briefing de dirección: gating 2+2+2, modelo Lifetime, CTB, Ritmos, responsive móvil | #21 | [session-21-briefing-direccion.md](./docs/sessions/session-21-briefing-direccion.md) |
| v0.12.3 | 2026-04-22 | Timer: número gigante con más aire sobre el subtítulo + pill "Otro" para minutos personalizados | #20 | [session-20-timer-aire-otro.md](./docs/sessions/session-20-timer-aire-otro.md) |
| v0.12.2 | 2026-04-22 | Pill de apoyo consolidada + Tweaks de logo/copy retirados + standalone autocontenido | #19 | [session-19-pill-consolidada-standalone.md](./docs/sessions/session-19-pill-consolidada-standalone.md) |
| v0.12.1 | 2026-04-22 | Pulido: bugs de race condition, sidebar más limpio, Welcome compacto | #18 | [session-18-pulido-bugs-layout.md](./docs/sessions/session-18-pulido-bugs-layout.md) |
| v0.12.0 | 2026-04-22 | Welcome de primera vez + Export/Import JSON + 6 tweak-secrets | #17 | [session-17-welcome-export.md](./docs/sessions/session-17-welcome-export.md) |
| v0.11.11 | 2026-04-22 | Integración Buy Me a Coffee: frente 1 de monetización | #16 | [session-16-bmc-integracion.md](./docs/sessions/session-16-bmc-integracion.md) |
| v0.11.10 | 2026-04-22 | Logros: arreglo `explore.*` + estado "Próximamente" | #15 | [session-15-logros-proximamente.md](./docs/sessions/session-15-logros-proximamente.md) |
| v0.11.9 | 2026-04-22 | Swap Mueve ↔ Estira: contenido reubicado + título del modal | #14 | [session-14-swap-mueve-estira.md](./docs/sessions/session-14-swap-mueve-estira.md) |
| v0.11.8 | 2026-04-22 | Backlog de robustez: 6 bugs del informe de auditoría | #13 | [session-13-backlog-robustez.md](./docs/sessions/session-13-backlog-robustez.md) |
| v0.11.7 | 2026-04-22 | Barra horizontal del sidebar: logo 2.5× + iconos gráficos | #12 | [session-12-barra-horizontal.md](./docs/sessions/session-12-barra-horizontal.md) |
| v0.11.6 | 2026-04-22 | Limpieza sin riesgo: dead code del backlog de auditoría | #11 | [session-11-limpieza.md](./docs/sessions/session-11-limpieza.md) |
| v0.11.5 | 2026-04-22 | Auditoría: 7 bugs críticos + logo local | #10 | [session-10-auditoria.md](./docs/sessions/session-10-auditoria.md) |
| v0.11.4 | 2026-04-22 | Timer "Aro" alineado a referencia visual | #9 | [session-09-timer-aro.md](./docs/sessions/session-09-timer-aro.md) |
| v0.11.3 | 2026-04-22 | Logo oficial v2, Tweaks topbar-derecha, viewport 1920×1080 | #8 | [session-08-logo-oficial.md](./docs/sessions/session-08-logo-oficial.md) |
| v0.11.2 | 2026-04-22 | Sidebar colapsable, Sendero, logo Pace. lockup | #7 | [session-07-sidebar-sendero.md](./docs/sessions/session-07-sidebar-sendero.md) |
| v0.11.1 | 2026-04-22 | Iconos ActivityBar restaurados | #6 | [session-06-iconos-activitybar.md](./docs/sessions/session-06-iconos-activitybar.md) |
| v0.11.0 | 2026-04-22 | Fortalecimiento del proyecto: README, CHANGELOG, ROADMAP | #5 | [session-05-fortalecimiento.md](./docs/sessions/session-05-fortalecimiento.md) |
| v0.10.1 | 2026-04-22 | Reorganización modular post-GitHub | #4 | [session-04-reorganizacion.md](./docs/sessions/session-04-reorganizacion.md) |
| v0.10 | 2026-04-22 | Pulido del core (Respira + Mueve) | #3 | [session-03-pulido-core.md](./docs/sessions/session-03-pulido-core.md) |
| v0.9.2 | 2026-04-22 | Refinamiento post-feedback: Aro + Flor + Estira | #2 | [session-02-refinamiento.md](./docs/sessions/session-02-refinamiento.md) |
| v0.9 | 2026-04-22 | Base inicial — 14 JSX + 100 logros + 5 módulos | #1 | [session-01-base.md](./docs/sessions/session-01-base.md) |

---

## [v0.79.0] -- 2026-08-02 -- fix+feat(logros): la curva de logros, y la amnistía

Sesión **#146**. Diario: [session-146](./docs/sessions/session-146-curva-de-logros.md).

### Fixed — la web llevaba rota desde s144, no desde el último push

- **`ReferenceError: useState is not defined`** al abrir el artefacto compilado.
  `main.jsx` aliasa los hooks a propósito (`const { useState: useStateMain, ... } = React`)
  y sus 12 llamadas usan `useStateMain`; la línea 134, que entró con el Preview de s144,
  usaba el **`useState` pelado**. Un destructuring con alias **no crea** ese binding.
- **Por qué no se vio**: en `PACE.html` no rompe y en el compilado sí — el build de Etapa A
  envuelve cada módulo en un IIFE. Verificado que el `index.html` de **v0.77.0 ya lo traía**.
- **Barrido de la clase entera** sobre los 90 archivos de `app/`: **un solo caso**.

### Added — `scripts/audit/logros.js`, banco de medición de la curva

Inventario estático de los `unlockAchievement` (llamada literal · mapa con id calculado ·
tabla recorrida en bucle) + **simulación sobre los módulos de estado reales con reloj
controlable**. Reprodujo de forma independiente el hallazgo de s145 (primera sesión = 4
logros, 1 avisado, 3 en cola).

**Lo que midió antes de tocar nada:** el día 1 entregaba **11 logros, el 35 % de lo que da
un año entero** (31), y la primera semana el 55 % · **52 % de los implementados (36 de 69)
eran de una sola vez**, con «primeros» (10/10) y «exploración» (16/16) sin pedir repetición
nunca · **37 de 106 no los podía ganar nadie** por no tener detector, y **11 de ellos eran
secretos**, que se pintan idénticos a los alcanzables · **`master.collector.full` era
imposible por aritmética**: pedía 100 logros existiendo 69 con detector (§3.4).

### Changed — la curva (§15.3)

`explore.*` (16) de 1 a **3 sesiones** · `first.day` de «primera sesión de la vida» a **día
con 2 actividades distintas** · `first.plan`, que tenía la **condición idéntica** a
`first.ritual`, pasa a **3 días** · `master.dawn`/`dusk`/`silent.day` de 1 a **5 días** ·
`master.long.focus` de 1 bloque a **5** · `master.box`/`coherent`/`rounds` de 10 a **15** ·
`master.collector.half`/`full` de 50/100 a **30/60** · `stats.month.focus` de 600 min/mes
(caía en 6 días) a **1200**.

**Resultado medido:** primera sesión 4 → **2** · primer día 11 → **8** · 365 días 31 → **44**
· **día 1 como % del año: 35 % → 18 %**.

### Changed — AMNISTÍA: se anula la excepción consciente de s136

Puesto delante de las cifras, el usuario eligió que **nadie pierda un logro ya concedido**.
**§2.5 «progreso sin culpa» y §2.2 «nada de pérdida punitiva» quedan intactas** y no hay
nada que comunicar. **Sale gratis por construcción**: la única escritura sobre
`state.achievements` es el spread aditivo de `unlockAchievement`, así que un logro ganado no
se puede retirar ni queriendo — cero código de migración.

### Added — 23 detectores que faltaban · Removed — 6 inviables

Implementados: `master.pomodoro.12` · `centurion` · `marathon` · `gardener` · `hips.20` ·
`shoulders.20` · `ancestral.10` · `antidote` (contador por etiqueta SIT) · `hydrate.30/90` ·
`explore.all.breathe/move/extra` · 6 secretos (`night.owl`, `lunch`, `zen`, `first.monday`,
`new.year`, `rain`) · los 4 solsticios y equinoccios, a **fecha civil**.

Retirados por no tener forma razonable de detectarse: `explore.chrome`, `secret.konami`,
`secret.birthday`, `secret.skip.none`, `secret.tweak.all`, `secret.pause.long`. **Ninguno
tenía detector ⇒ nadie podía tenerlos ⇒ la amnistía no se rompe.**

Catálogo **106 → 100**, con detector **69 → 92**, sin detector **37 (35 %) → 8 (8 %)**, y
**secretos fantasma 11 → 0**: todos los secretos del catálogo se pueden descubrir ya.

### Added — `app/state-achievements.support.jsx` (179 ln)

Contadores generalizados y los detectores nuevos. Nace porque `state-achievements.jsx` no
cabía bajo las 500 líneas con la curva. Mismo patrón que `MoveSessionV1.support.jsx`.

### Fixed — bug propio cazado por el banco

`first.day` colgaba de `updateStreak`, que **retorna pronto si el día ya está marcado**: solo
corría en la primera actividad de la jornada, con una marca en el plan, así que la condición
de dos **no se cumplía nunca**. No se ganaba ni con un año exhaustivo. Movido a
`checkPlanAchievements`.

---

## [v0.78.0] -- 2026-08-02 -- feat(logros): entrega escalonada — uno por sesión

Sesión **#145**. Diario: [session-145](./docs/sessions/session-145-logros-entrega-escalonada.md).

Primera mitad de la **Fase 2.5**, la que no necesita glifos.

### Corregido

- **La queja del usuario, medida en el código**: una primera sesión de Respira a las 6:50
  desbloqueaba **cuatro logros de golpe** con sus cuatro toasts en cascada — `first.breath`
  (siempre) + `explore.<tipo>` (lo tienen **12 de las 20** rutinas) + `master.dawn` (antes de
  las 7) + `first.day` (`updateStreak` lo da con `current >= 1`). Con el plan del día completo
  entraban además `first.ritual` y `first.plan`.
- **Entrega escalonada: uno por sesión**, el resto en **cola invisible**. Decisión del usuario
  entre tres opciones; descartó «1 por sesión y día» (lento para quien arranca fuerte) y «todos
  en fila» (arregla el solapamiento, no la sensación de regalo).

### Lo que NO cambia

El logro se **gana** en el momento y se registra en `achievements` al instante: solo se aplaza
el **aviso**. Nadie ve progreso retroceder ⇒ **§2.5 «progreso sin culpa» queda intacta**. (El
recálculo de umbrales, que sí es una excepción consciente, va aparte y no se ha tocado.)

### Detalles que importan

- La cola se **persiste** (`achievementQueue`): en memoria, una recarga se comería las
  celebraciones pendientes — el logro seguiría ahí, pero no se anunciaría nunca.
- `flushAchievementToast()` drena **gane o no gane** un logro nuevo: si solo drenara al
  desbloquear, una cola de tres esperaría para siempre a que hubiera un cuarto.
- **El agua tiene drenaje propio**: `addWaterGlass` acredita sin pasar por un cierre de sesión.

### Verificado

Con estado sembrado limpio: sesión 1 gana 3 y anuncia **1** (quedan 2); sesión 2 gana 1 más y
anuncia **1**, el más antiguo. FIFO, y el recuento de `achievements` sube en el instante.

---

## [v0.77.0] -- 2026-07-31 -- feat(ui): Preview «antes de empezar» (§18.3)

Sesión **#144**. Diario: [session-144](./docs/sessions/session-144-preview-antes-de-empezar.md).

Ítem 6 de la Fase 2, elegido porque los datos **ya existían sin consumidor** (igual que en la ola
E), el audit lo pide explícitamente y **desbloquea la reescritura editorial** aparcada en s143.

### Añadido

- **`RoutinePreview`**: modal entre la tarjeta y la sesión con **qué necesitas**, **posición**,
  **duración**, **intensidad y nivel** y **los pasos con su glifo**.
- **Sale solo desde la BIBLIOTECA, no dentro de un Camino** —ahí la rutina ya viene elegida y el
  ritmo manda—, y sale gratis **por construcción**: se engancha en los handlers de `main.jsx`,
  que son la puerta de la biblioteca. La biblioteca **se queda abierta detrás**: cerrar el
  preview te devuelve a ella. Misma forma que el modal de seguridad de Respira (s90).
- **Las series del mismo ejercicio se agrupan** (`Fondos en silla ×3`): tres veces el mismo
  nombre seguido es ruido, no información. Solo repeticiones CONSECUTIVAS.
- **Requisitos completados en las 6 rutinas que no los declaraban**; en dos casos el valor salía
  de su propia descripción («Necesitas pared y suelo»). **Las 28 los declaran ya** (11 de suelo).

### Por qué ahora

**16 de las 28 descripciones llevaban el requisito escrito a mano** —«Silla estable y sin
ruedas», «Necesitas pared; barra opcional», «Pasarás por el suelo»— porque no tenía dónde ir.
Ese es el mismo síntoma que hacía sonar desiguales a las descripciones (s143), y por eso este
ítem iba **antes** que la reescritura. Los datos estaban desde s115 en 22 de 28 rutinas, sin
que los leyera nadie.

### Corregido antes de llegar a pantalla

La lista de pasos filtra los descansos, pero las claves EN son **posicionales sobre el array
completo** (`<id>.s4.name` cuenta los descansos): usar el índice nuevo habría desplazado todos
los nombres en inglés. Se conserva el índice original.

---
