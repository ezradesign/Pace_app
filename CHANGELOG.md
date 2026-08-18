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
| **v0.97.0** | 2026-08-18 | feat(glifos+i18n+logros): **los 19 dibujos, los 96 logros en ingles, y una recomendacion retirada** — entran los **19 glifos de logro** nuevos (**77 de 96** con mascara, quedan 19) y la asignacion la cierra el usuario **mirando** la hoja de contactos. Las dos trampas del handoff eran ciertas pero **medirlas las afino en las dos direcciones**: mas pequenas —lo que la app consume son las `.webp` **committeadas**, no los PNG del archivo de disenos— y mas grandes —el `ABORTADO — no existe el dibujo` vivia **despues** del borrado (305 contra 296), y ese si era el camino destructivo—. Ahora hay **prevuelo**: resuelve las 77 claves antes de tocar nada, probado en rojo (58 huerfanas → exit 1, 58 mascaras intactas). El censo se valida con una **biyeccion**: 91 PNG = 83 `asset_*` (50 ids) + 8 `Premium_*` = **58 dibujos = 58 filas**; y como el lote nuevo comparte slug y solo cambia el timestamp, sus duplicados se descartan por **19 md5 distintos**, no por nombre. La ingesta **modifico 17 mascaras viejas** —por diseno: el peso de tinta se iguala contra la mediana del CONJUNTO— y una sospecha mia de que los nuevos iban apretados **la desmintio la medida** (58,5–86,2 % contra 54,5–85,3 %). **EL INGLES DE LOS 96 LOGROS** cierra el hallazgo abierto desde **s146**: `Achievements.jsx` y `Toast.jsx` leian `a.title`/`a.desc` crudos del catalogo. Van a `i18n/content/` —patch de **solo EN**, que es lo que el propio verify exige—, asi que el castellano no se duplica y el **CENSO de i18n se queda en 515**, corrigiendo una estimacion mia de ~707. **192 claves, biyeccion 96 = 96.** **EL AIRE DE LAS TARJETAS** lo reporto el usuario y a 1280 parecia cosmetico (24,3 px); **medirlo en siete anchos cambio el diagnostico**: a 320 la tarjeta media **283 px con 157 de aire, el 55 % vacia**, porque `aspectRatio: 1/1.15` ataba el **alto al ancho**. Sus dos ideas no lo arreglaban —encoger rompia «Cartografa» (0,6 px de reserva) y **centrar es lo que s147 quito a peticion suya**—, asi que se quita el alto proporcional y la rejilla iguala **por fila**: a 320, de 283 a **127 px**. **Yo recomende primero la opcion equivocada y la retire antes de tocar nada.** Buscando otra cosa salio un **DUPLICADO MEDIDO**: `state-achievements.jsx:278` desbloqueaba «Luna llena» y «Treinta amaneceres» **con la misma condicion**; ahora el segundo mide treinta amaneceres **de verdad** sobre `morningDates`, que ya existia capada a 30. «Curiosidad» pasa a **secretos**. `streak.7` deja de llamarse «Semana vaca» y pasa a **«Cuarto creciente»** (7 dias = un cuarto del ciclo lunar, y enhebra 7→30→365). **EL INSTRUMENTO**: se abaratan los tests de Respira retirando el `waitForTimeout` por segundo (20,9 → 15,8 s, control rojo verificado), pero **no basto** — a 4 workers medi **3 de 3 verde** y **era una ventana afortunada**: repetido, **rojo 3 de 3**, con el reloj pasando de 49 s a 3,1 min. La maquina: **CPU al 6 % y 5,8 GB libres de 15,7** → el cuello es **MEMORIA**, no CPU. A 2 workers, **81/81 dos veces**. Se fija **2 en los dos lados**. **+3 asertos (78 → 81)**, los tres primeros de la suite sobre el **IDIOMA** | 167 | [abajo](#v0970----2026-08-18----featglifosi18nlogros-los-19-dibujos-los-96-logros-en-ingles-y-una-recomendacion-retirada) |
| **v0.96.0** | 2026-08-18 | feat(retencion+home+glifos): **cuatro frentes y nueve mentiras del instrumento** — la sesion arranca destapando que el `72/72` declarado **no reproducia**: 68 y 70 en dos pasadas, siempre los cuatro tests de bucle de `respira-progreso.spec.js` y siempre por **timeout**, con los que si pasaban en **58,0 s y 59,6 s contra un plazo de 60**. La variable es `workers: CI ? 2 : undefined`, o sea **8 en local**; el control lo cierra: **a 2 workers, 72/72 y al DOBLE de velocidad** (1,0 min contra 2,2). El defecto es del INSTRUMENTO y **queda sin arreglar**, esperando decision. **(1) EL CTA DEL POMODORO** decia «Empezar foco» en Pausa y Larga sobre un reloj que no es de foco: una sola `startLabel` para los dos sitios que arrancan, y **12 casos medidos** —`{foco,pausa,larga} × {es,en} × {claro,oscuro}`— con 0 discrepancias. **(2) LA BARRA DE RESPIRA EN MOVIL CABE**, y de sobra: caso peor 5 rondas a 320 px, **segmentos de 48,8 px** y 100 px de holgura. Pero el primer banco era una **TAUTOLOGIA** —medir «desborda a su padre» cuando la barra es `width:100%` de ese padre—, comprobado saboteando `maxWidth` de 260 a 600 y viendo «0 desbordes» con la barra a 374; rehecho con **control positivo** que cae. **(3) UN SOLO ORDEN DE HOME**, aro → Actividades → Camino en las dos pieles: Actividades hereda el papel de horizonte por el selector de hermano adyacente que s156 ya tenia, y **el lector de `--pace-skin` en JS se retira entero** por quedarse sin consumidor. Se **RETIRAN DOS AFIRMACIONES** hechas al usuario —«el solapamiento pasa de 64 a 54» y «arregla un retroceso de foco a 320»—: la primera era medir a media convergencia (el motor publica mas de una vez) y sale **identica en las 5 vistas**; la segunda, que a 320 la home desborda 8 px y tabular arrastra el viewport. El banco pasa a **consumir la sonda de la suite** en vez de la suya. **(4) EL TIEMPO DE RETENCION**, aprobado en s165 con sus tres condiciones: se guarda como **serie semanal en segundos** (`weeklyStats.holdSeconds`) porque esa escala soporta las seis variantes fotografiadas y la de por vida no, y se pinta como **linea al pie**, que **no aparece si vale cero** —solo 3 de 20 rutinas tienen retencion—. **El banco de mutaciones obligo a cambiar el CODIGO**: M1 no mordia porque habia **dos mecanismos redundantes** tapandose entre si; se quito uno y las cuatro muerden. **(5) EL MECANISMO DE LAS MASCARAS DE EJERCICIO**, montado con el mapa **VACIO** y precedencia sobre el SVG, para que los 62 dibujos puedan llegar **por partes**; la ingesta se corrigio sola dos veces (51 identidades leyendo solo el registro, 62 contando dibujos huerfanos que el encargo dice no rehacer) hasta dar **61 = 61**. **+6 asertos (72 -> 78)**, i18n **511 -> 515** | 166 | [abajo](#v0960----2026-08-18----featretencionhomeglifos-cuatro-frentes-y-nueve-mentiras-del-instrumento) |
| **v0.95.0** | 2026-08-17 | feat(respira): **una barra que dice lo que la app sabe** — el progreso de una sesion de Respira se rehace tras el diagnostico de s164, y la decision se tomo **mirando capturas de la app real**, no leyendo codigo. Primero se implanto 1C con **puntos** y el usuario, viendolo, devolvio la pantalla de HOY; en vez de deducir por que, se le pregunto — y pidio **revisar las 20 rutinas antes de proponer nada**. El censo (`censo-respira-ritmos.js`, preguntandole a `getSequence()`) destapa **tres familias de ritmo y no dos**: por bloques (3), por tiempo (15) y **BOMBEO** (Bhastrika y Kapalabhati, fases de **1 s** y 90 ciclos en 3 min). Y corrige tres cosas escritas: **el hueco muerto de la cuenta atras es de 5 rutinas, no de 3** (las de bombeo tampoco la enseñan jamas); **una barra de TIEMPO mentiria en las rondas**, porque no terminan por reloj —la retencion no tiene duracion fijada (B1) y sus 4/12/20 min son NOMINALES—; y «un segmento por ciclo» **no era exacto** en las cinco donde los ciclos no caen redondos (18,8 · 17,5 · 37,5 · 9,5 · 12,9), con el tope de 24 agrupando ya en **10 de las 17**. El liston no lo puso el gusto sino una decision del propio usuario, recuperada de **s139 §A4**: descarto marcas y enso **porque miden**, «invita a mirar la medida en vez de a respirar». Con eso entraron al menu dos opciones que no estabamos explorando —**ningun indicador** y una **linea a sangre**— y el **aro**, que choca con esa decision, para verlo en su sitio. **18 capturas sobre la app real** (la sesion se conduce de verdad y solo se sustituye el indicador, apagando variantes con los hooks recien creados: **ni una bandera en produccion**). Resultado: **T1 + R3** — barra **continua** en las 17 por tiempo, barra **segmentada por rondas** en las 3 de bloques con el bloque en curso marcado por **carril** (vocabulario de Mueve) y sin relleno por respiraciones. Mismo sitio, mismo ancho y **misma altura (5 px)** en las dos familias. La ronda pasa a decirse **una vez por pantalla**: la barra en la sesion, la cabecera en la retencion —que se queda como estaba, por decision del usuario—. **5 asertos nuevos (67 -> 72) y los 5 mordieron** contra producto saboteado | 165 | [session-165](./docs/sessions/session-165-respira-progreso.md) |
| **v0.94.0** | 2026-08-17 | refactor(estructura): **los cinco de la regla 1, y dos pruebas en vez de una mirada** — el trinquete de s162 tenia congelados cinco archivos por encima de las 500 lineas de `CLAUDE.md` §1 y esta version los trocea **todos**: `_responsive.js` **1132 -> 438** (el JS de la luz a `_responsive.atmosfera.js` y las dos pieles @media a `_responsive.pieles.js`), `FocusTimer.jsx` **686 -> 481** (reparte en sus dos hermanos, que nacieron para esto en s102 y s124), `tokens.css` **676 -> 322** (el comportamiento a `motion.css`), `TweaksPanel.jsx` **534 -> 467** y `state-core.jsx` **515 -> 449**. `DEUDA_500` queda **vacia**. 3833 lineas antes y 4109 despues: **+276 y ni una de codigo** — todo lo que crece son cabeceras y punteros, porque el cuerpo se movio con scripts que **extraen el rango exacto** y asertan los dos bordes en vez de reteclearlo. **Los dos casos de CSS se CORTAN por un punto, no se extraen**: en CSS el orden es la semantica, y sacar un bloque de en medio dejaria las mismas reglas en otra cascada — hay un contrato que depende de eso (`--pace-skin` vale `movil` en la hoja base y `escritorio` en el @media de las pieles, misma especificidad, asi que a >=769px gana la que se inyecta DESPUES; al reves la home de escritorio se creeria movil y `main.jsx` renderizaria el orden de lectura de la otra piel). **Y se probo dos veces, porque la suite no compara ni un pixel**: la huella de REGLAS (comentarios fuera) es identica en archivos y en navegador —45435 bytes, `473c5319…` y `c022e1c9…`— y sirviendo el `index.html` de HEAD en paralelo salen **0 pixeles distintos** de 921 600 y 329 160, en dos anchos y dos paletas, con la consola limpia. El guard §1 se comprobo con la lista vacia | 163 | [session-163](./docs/sessions/session-163-troceo-regla-1.md) |
| **v0.93.0** | 2026-08-17 | fix(home): **el test intermitente tenia razon** — sesion que empieza como AUDITORIA y acaba como saneamiento. La suite llevaba **un rojo cada dos pasadas** en reduced-motion («el aro mide distinto, 420 vs 406») y **no era el instrumento**: es el mecanismo de s160 **un nodo mas abajo**. El bloque que hace de horizonte consume `--pace-activities-overlap` como `margin-top` negativo y no estaba en la exencion de s160 (solo el aro y sus cuatro nodos interiores), asi que bajo el kill de reduced-motion ese margen **es una transicion**: el alto del stack aterriza en otro frame mientras el motor mide en la misma tarea, el desbordamiento se queda clavado en **11 px** —los de s156, dados por cerrados en s160—, el guard «nunca encoger a ciegas» revierte D a 420 y **gasta su unico reintento**; cuando el reintento corre la misma carrera, el motor **se rinde en 420 y ahi se queda**. El rojo sale en la maquina **rapida** y desaparece con la CPU frenada, y **un `resize` a mano lo baja a 406**: el motor podia medirlo y no lo volvio a medir. Arreglo acotado a la media query, con control (sin reduce el margen ya aterriza en la misma tarea y no hay transicion viva; con reduce, `margin-top:running`). Ademas: **«Regresas» (`first.return`) se perdia por una CARRERA**, no «nunca» como decia s148 — el artefacto son **109 etiquetas `<script>`** (tareas separadas) y `unlockAchievement` se referencia PELADA desde un modulo que corre antes del suyo, asi que el `setTimeout(0)` del rollover puede ganarle y el `try/catch` vacio entierra el ReferenceError; **lo decide la carga de la maquina**, y por eso dos sondas tranquilas dijeron «funciona» mientras la suite completa lo desmentia dos veces. Ahora la concesion va **dentro del estado que devuelve el rollover**; **la regla 1 pasa a estar vigilada** por `scripts/verify.tamano.js`, que **se cazo a si mismo** al dejar `verify.js` en 544 lineas, con un **trinquete** de tres dientes verificados en rojo; los dos README suben de v0.84.0 a v0.93.0 y **entran en la comprobacion de version**; y el CHANGELOG pierde sus **26** enlaces a diarios que nunca se escribieron. **2 asertos nuevos (65 -> 67) y los 2 mordieron** | 162 | [session-162](./docs/sessions/session-162-carrera-reduced-motion-y-trinquete.md) |
| **v0.92.0** | 2026-08-08 | feat(settings): **la paleta sigue al sistema, salvo cuando el aro es el sol** — nace el modo **Auto** de paleta, que REVISA la decisión de s89 («el sistema solo manda en el primer arranque»): esa fila sigue siendo cierta para quien elige a mano, y lo que cambia es que ahora se puede elegir **que mande el sistema**. Cuatro decisiones del usuario, cada una con su coste medido delante: **por sistema y no por hora** —esta app **ya tiene un día y dura 25 minutos**, `--pace-k` recorre amanecer→mediodía→noche dentro de cada bloque, así que una paleta por reloj metería un segundo ciclo a otra velocidad—, **suspender durante un bloque** —cambiar en vivo cuesta 32 de 66 frames, y sobre todo en oscuro `--sun-shade` y `--sun-cast` valen **cero** por decisión de s158, así que a mitad de sesión el sol perdería su sombra—, **tercera pill «Auto»** como el idioma, y **fundido de tokens por `@property`**. **El cambio de paleta no era un corte seco**: movía **1875 declaraciones** sobre 87 nodos, de las que **88 se fundían a cuatro velocidades a la vez** (180/200/220/320 ms) y **1787 saltaban**. Ahora los tokens interpolan solos —única vía que alcanza los estilos **inline**, que es como pinta esta app— y con el Pomodoro parado es **gratis**: 66 frames contra 67 del control negativo. **Dos defectos cazados antes de publicar**: el `transition` de 320 ms del `body` **perseguía** al token de 640 (una transición cuyo destino cambia cada frame **se reinicia cada frame**) y dejaba **188 unidades RGB** entre el fondo y unas tarjetas ya oscuras — el defecto de s159 en otra superficie, corregido de **237 a 15** de desviación contra una verdad de campo; y **registrar `--breathe` apagaba la atmósfera del Pomodoro**, porque un token registrado computa `rgb(...)` en vez de `#hex` y el `hexToRgb` de `interpolateRingColor` devolvía NaN ⇒ `--pace-arco` inválido ⇒ el bloom entero a `background-image: none`. Auditados los 15: solo `--breathe` y `--focus` tenían lector en JS, y **se arregló el lector** — `aRgb` acepta las dos formas y devuelve un respaldo en vez de NaN, así que entran los quince. Además, guard de Auto en `secret.dark.mode` (gemelo del de s139): el logro premia haber **elegido** el oscuro. **6 rojos y los 6 mordieron** | 161 | [session-161](./docs/sessions/session-161-paleta-automatica.md) |
| **v0.91.0** | 2026-08-07 | fix(home): **una transición de 0,01 ms sigue siendo una transición** — dos deudas de s156 cerradas y un tirón que **no reproduce**. **Reduced-motion**: el aro salía a 420 px con 11 px de scroll y la microcausa llevaba una sesión sin identificar; es que el kill de `tokens.css` pone `transition-duration` en 0,01 ms sobre TODO y, como el valor inicial de `transition-property` es **`all`**, cualquier cambio de geometría **pasa a ser una transición** — cuyo valor aterriza en otro frame, mientras `applyD()` mide en la MISMA tarea. Se demostró porque **ni un `height !important` en línea movía el aro**: en la cascada solo una transición viva gana a `!important`. Arreglo validado antes de proponerlo (`transition-property: none` en el aro **y en sus cuatro nodos interiores**, que es de donde salían los 3 px que quedaban): aro **406** y solapamiento **−65** con y sin reduced-motion, idénticos. **A11y**: en escritorio el `order` del CSS reordenaba con el DOM quieto, así que el foco bajaba a la tarjeta del fondo (622, 698) y **subía** a los chips (496) — WCAG 2.4.3, medido con Tab real. Ahora el DOM lleva el orden canónico de cada piel, leyendo `--pace-skin` **de la propia hoja** para no escribir una tercera copia del breakpoint, y con `key` estable para que React **mueva** en vez de remontar; el orden visual no cambia ni un píxel. **El tirón del arco NO reproduce**: la transición cubre el segundo entero (0 ms quieto) en v0.90.0 **y** en v0.89.0, y la sospecha de las publicaciones de s159 cae por ritmo (2 en 8 s) y por control positivo (forzando 60/s la transición sigue corriendo). El instrumento **sí** ve el defecto: con reduced-motion da 1 frame y 983 ms quieto | 160 | [session-160](./docs/sessions/session-160-tiron-reduced-motion-y-foco.md) |
| **v0.90.0** | 2026-08-06 | feat(home): **la luz del Pomodoro** — cierra el frente que s157 y s158 dejaron en el árbol sin commit. **El Pomodoro no estaba centrado en móvil y el defecto era PREVIO**: medido contra HEAD servido en paralelo, +11,80 px a 320 y +12,09 a 390 en los dos; la atmósfera no lo introdujo, lo hizo visible. La causa son dos capas descontando padding sin saber la una de la otra, y una pista de grid que desborda y se alinea al START. Además: el máximo perceptual **se retima a la mitad del bloque** (estaba en 0,375), el enfriamiento pasa a ser continuo **sin repunte en p=1**, el parpadeo baja de **47 saltos ≥2 % a uno**, la cola recupera el reflejo bajo los chips y **el arco enterrado la tiñe**. Tres defectos más que encontró el usuario mirando, los tres del mismo tipo: transiciones que se pisan | 159 | [session-159](./docs/sessions/session-159-luz-del-pomodoro.md) |
| **v0.89.0** | 2026-08-04 | feat(home): **un nodo opcional no puede decidir si hay geometria** — el motor de la home exigia los cuatro nodos y se callaba si faltaba uno; como `getSuggestedPath()` **nunca** devuelve null con catalogo no vacio, el unico estado real sin tarjeta —**un Camino en curso**— apagaba el motor entero y Desktop caia a un `360px` escrito a mano pintando el aro **sin horizonte**, sin recuperarse al salir (`attach()` corria una vez y el ResizeObserver seguia mirando un nodo que React ya habia sustituido) · **la evidencia de s149 no reproduce y sus dos mitades se excluyen**: 406×406 es justo lo que publica el motor, `[data-pace-timer-dial]` y `window.__PACE_HOME_GEOMETRY_VARS__` **no existen en el repo**, y las variables «vacias» salen de que **ninguna regla CSS las declara** — solo se escriben inline sobre `documentElement` · **el invariante que este repo declaraba era falso**: con el motor apagado la tarjeta subia 39,7 px sobre un aro **sin recortar** ⇒ ahora `--pace-dial-d` y `--pace-horizon` resuelven motor-o-CSS **en un solo sitio** y recorte y solapamiento salen del **mismo token** · **dos defectos mas que salieron al medir**: el arranque tardaba **1345 ms y dos frames** en publicar (el aro se pintaba al fallback y **saltaba**; ahora publica a 164 ms, sincrono) y —**previo y publicado**— con `prefers-reduced-motion` el aro salia a **244 px** en vez de 406 porque el bucle **encogia a ciegas** ocho pasadas sobre una medida congelada · **amanecer**: halo detras del aro recortado por el **mismo** horizonte y linea de alba anclada a `--pace-horizon`, **reutilizando** `paceGlowRamp` y `paceGrainUrl` de s140 en vez de duplicar la curva, con tokens `--dawn-soft`/`--dawn-line` en las dos paletas y **tres estados por atributo estable** que solo mueven intensidad · **ritmo movil** con el techo por ancho derivado del ancho **realmente usable** (0.86 → 0.92) y `--pace-home-slack` repartiendo el sobrante 38/62 ⇒ a 390×844 el aro pasa de 335 a 359 y el aire muerto de 91 a 62 px, **con escritorio sin una regresion** (406/65 · 456/73 · 487/78 · 520/83) · **12 rojos controlados y los 12 mordieron**; el instrumento mintio **cinco** veces, y una la cazo un **guard** que asertaba el media query antes de medir | #156 | [session-156](./docs/sessions/session-156-home-amanecer.md) |
| **v0.88.1** | 2026-08-04 | fix(events): **una operación de dos almacenes que no espera no es atómica** — tres defectos que el usuario encontró revisando v0.88.0, los tres confirmados contra el código. **P0**: el import lanzaba la barrera **sin esperarla** y el resultado de la escritura legacy **se descartaba** en el camino normal ⇒ con `setItem` fallando por cuota, el estado no se guardaba, el contenedor de eventos **se reiniciaba igual**, la UI decía «Importado» y la página recargaba — cuatro mentiras seguidas sobre una promesa de integridad que esta misma sesión había escrito. **Y el arreglo no era un `if`**: al abortar, el **marcador ya está escrito**, y como el arranque reinicia el contenedor en cuanto ve uno vivo, abortar sin limpiarlo habría dejado que el siguiente arranque hiciera justo lo que se evitaba ⇒ nace `eventsWebClearMarker`. Ahora se espera, se aborta a un estado conocido, el resultado lleva `legacyWritten` y la UI solo canta victoria con eso en `true`; copy nuevo ES+EN y **CENSO de i18n a 510**. Mismo trato en el reset: `wipeLocalState()` devuelve si pudo, y si no pudo **no se borra el historial de alguien cuyo estado sigue ahí**. **Segundo**: un contenedor de **versión FUTURA** se reescribía —el gate vivía solo en la ruta de import— y le tiraba en silencio los campos que esta versión no conoce; ahora `schemaVersion` mayor = **READ_ONLY**, comprobado **dos veces** (capacidad y **dentro del lock**, que es el autoritativo). **Tercero**: dos filas de la tabla de `STATE.md` seguían en v0.87.0. **Y un quinto aserto que no mordió**: el del contenedor futuro siguió **verde con el guard roto**, porque pasaba por la fachada —que corta antes en `canWrite()`— y el guard interior **no llegaba a ejecutarse**; se arregló llamando al adaptador a pelo. Trampa de instrumento de propina: la prueba del fallo forzado falló primero por **falta de `page.on('dialog')`**, así que el `confirm()` del import devolvía false y la importación **ni empezaba** | #155 | [session-155](./docs/sessions/session-155-eventos-fase-1.md) |
| **v0.88.0** | 2026-08-04 | feat(events): **la memoria es del usuario, no nuestra** — FASE 3 del plan: nace **`pace.events.v1`**, el registro **local** de uso, en su **Fase 1** (modelo canónico + adaptador web + Web Locks + baseline + export/import/reset + recuperación + pruebas multi-pestaña) y **sin un solo emisor**, porque §25 prohíbe emitir antes de estar en `READ_WRITE` · **dos contradicciones con una página PÚBLICA**, las dos creadas por el mero hecho de existir una segunda clave: `privacy.html` promete que desde Ajustes «puedes borrarlo todo» y el reset solo quitaba `pace.state.v2` (**arreglado**: pasa por la barrera y borra los dos almacenes), y promete exportar «**todo** tu estado» cuando el backup no llevará eventos (**no se arregla hoy, se le pone un gate**: si aparece un emisor fuera de `app/events/` y el export no lleva la sección, el `verify` se pone **rojo**) · **capa A / capa B separadas** como exige §5 — el modelo canónico no nombra `localStorage` ni `navigator.locks`, y el **adaptador inerte** existe para que `file://` no emita y Capacitor **no caiga al web** por parecer `https://localhost` · **5 comprobaciones nuevas en el `verify`**, todas RELACIONALES, más el **guard de cero**; la de «cero red» tuvo que mirar el **código sin comentarios**, porque las cabeceras **nombran** `fetch` y `WebSocket` para prohibirlos y un `grep` a secas **se autoinculpa** (trampa de s146 por otra puerta) · **10 pruebas E2E**, entre ellas **DOS pestañas de verdad** emitiendo a la vez sin perder un evento (el **P0** del diseño), la lista permitida descartando `notaLibre`/`ip`/ruta de archivo, y seis snapshots inválidos rechazados dejando el contenedor **byte a byte** igual · **17 rojos, y los 17 mordieron a la primera** —frente a los cuatro que fallaron en s154— porque el banco ahora **exige que la cadena aparezca exactamente una vez** y calibra antes; el **guard de cero** necesitó banco propio, moviendo la carpeta de verdad y exigiendo **el mensaje**, no solo el exit 1 · el `verify` cazó **dos identificadores sin ligar** en código nuevo: `Uint8Array` faltaba en su lista de plataforma, y `chrome` estaba **mal en mi código** (solo existe en Chromium) | #155 | [session-155](./docs/sessions/session-155-eventos-fase-1.md) |
| **v0.87.0** | 2026-08-04 | test(e2e): **un test que no has visto fallar no prueba nada** — segunda pieza del frente CI: **Playwright**, que cubre justo el **primer hueco que el `verify` declara e imprime en cada pasada** («no abre navegador, no monta la app, no pulsa nada»). Entra **el checklist de cierre de `CLAUDE.md` entero**, ejecutado: Pomodoro hasta el BreakMenu con el **reloj virtual** —viable porque `useCountdown` es *timestamp-based*—, Respira con su **modal de seguridad de apnea**, Mueve con Preview y pasos, Hidrátate, Logros con toast, Tweaks y persistencia · **13 tests, ~25 s** · **no se inventó un selector**: once bancos de reconocimiento condujeron el artefacto primero, y de ahí salió que las filas de rutina **no son `<button>`**, que la biblioteca de Mueve abre el **Preview de §18.3** y que el toast **no sale al desbloquear** sino cuando una sesión drena la cola (s145) · **21 rojos verificados**, los 21 restaurados **byte a byte con hash comprobado**, y **cuatro no mordieron a la primera**: tres eran **debilidad real de mis asertos** —`getByRole({name})` casa por **SUBCADENA**, así que renombrar «Pausar» a «PausarX» seguía pasando— y el cuarto rompía **la línea equivocada** (el artefacto tiene varias llamadas a `renderGlyph` y la miniatura del sidebar resuelve por `achMini`) · casi nada lleva número: el precache se aserta comparando lo **declarado en `sw.js`** con lo que el navegador tiene **de verdad** en su caché, y los sellos se **derivan del catálogo vivo** con la regla de s152 en vez de escribir 53, con **guard de cero** · **job `e2e` aparte** con `needs: verify`, porque la suite carga el `index.html` **committeado** y es el job de arriba el que acaba de probar que está al día · **el instrumento mintió cuatro veces**: `innerText` da el texto con el `text-transform` ya aplicado y los matchers comparan `textContent` (3 rojos), `addInitScript` corre en **cada** navegación y mi semilla machacaba el estado en la recarga, un `grep -c $'\r'` contó todas las líneas y casi reporto CR inexistentes, y un banco en segundo plano parcheaba el artefacto mientras yo medía | #154 | [session-154](./docs/sessions/session-154-playwright.md) |
| **v0.86.0** | 2026-08-04 | chore(ci): **el CI no comprueba nada que no corra en local** — primera pieza del frente CI, lo único que quedaba detrás de la red de seguridad. Nace `.github/`, que no existía: un job en `ubuntu-latest` con Node 24 que hace `npm ci` e **invoca `npm run verify` tal cual**, sin reinterpretarlo — así lo que sale rojo en GitHub se reproduce con un comando, y vigilancia nueva se añade al `verify`, no al YAML · lo **único** que el workflow añade por su cuenta es que **`index.html` sea el build de las fuentes**, porque el `verify` no puede: corre justo ANTES de regenerarlo, así que su aviso de deriva es `[INFO]` **a propósito** y nunca se pondrá rojo · el diff va **acotado a `index.html`** o el CI sería rojo permanente por `PACE_standalone.html`, congelado desde s134 y que el build acaba de reescribir · y se compara con **`git diff`, nunca con un hash**: el worktree de Windows deja **500 bytes CR** dentro del artefacto (5 fuentes en CRLF que `readFileClean` no normaliza) y su SHA-256 no puede igualar al de Linux · **medido antes de escribir una línea**, porque el runner es Linux: el build es determinista, las **190** rutas declaradas coinciden **exactas** con el repo (Linux distingue mayúsculas y Windows no) y el lock trae `sharp-linux-x64` · probado en **verde y en rojo** con el escenario real —una fuente cambia y nadie regenera el artefacto—, restaurado byte a byte · **proteger `main` no se puede hacer desde aquí** (`gh` no instalado) y la opción «exigir el check sin requerir PR» **es contradictoria**: requerir checks bloquea el push directo · `WORKFLOW.md` seguía exigiendo regenerar el standalone en cada cierre, falso desde s134 · **y el primer run se puso ROJO y tenía razón**: `npm run verify` pasó en Linux, pero el artefacto **no era reproducible entre plataformas** — con CRLF **Babel indenta distinto los comentarios que conserva**, así que el `index.html` committeado **dependía del worktree de quien lo generó** (**una línea, un espacio**, invisible en local porque `git diff` normaliza y artefacto y fuentes comparten worktree). Arreglado **en el build**: `readFileClean` normaliza a LF al leer, y las mismas fuentes en CRLF y en LF dan ahora el mismo artefacto **byte a byte**. Un CI que solo confirma lo que ya sabes no vale nada | #153 | [session-153](./docs/sessions/session-153-ci-github-actions.md) |
| **v0.85.0** | 2026-08-03 | chore(tooling): **cinco sellos no se pintan nunca, y eso no era un bug** — segunda tanda de la red de seguridad, lo que **D5 aparcó** del `verify` v1: integridad de **i18n, precache, glifos y catálogos**, dentro de `npm run verify` y con **asertos**. Antes de escribir uno solo hubo que resolver un número que no cuadraba: el mapa tiene **58** máscaras, s150 contó **53** sellos y s151 **54** — y las tres cifras son correctas, porque **un logro secreto y bloqueado pinta una `?` en vez de su glifo** y 5 de las 58 son de secretos; s151 vio 54 porque midió en inglés y eso desbloquea `secret.bilingual`. Se asertan **las dos mitades** (53 + 5) para que el número deje de sorprender · **dos clases de comprobación que no se mezclan**: relacionales (no caducan) y **censo** (números esperados en un solo sitio, con el mensaje diciendo que subirlos es un acto deliberado) · el dato se saca del árbol **compilando cada archivo en su propia IIFE**, porque `GLYPH_SVG` es `const` en **dos** archivos y en ámbito compartido el catálogo sale vacío sin quejarse · **un hueco salió de una prueba negativa fallida**: un secreto **sin detector** entra en el denominador de §15.4 sin que nadie pueda ganarlo · **26 rojos verificados**, EXIT=1 y 15 archivos restaurados byte a byte · la caché real del navegador trae **86 entradas**, las mismas que aserta el checker | #152 | [session-152](./docs/sessions/session-152-red-seguridad-segunda-tanda.md) |
| **v0.84.0** | 2026-08-03 | docs+fix(copy): **la promesa estaba en tres sitios, y el tercero no lo miró nadie** — frente B de la auditoría (D1), copy y presencia pública. El onboarding prometía «Siempre gratis / sin paywall» en los dos idiomas contra v1.0 = versión **pagada**: pasa a «**Núcleo gratuito / disponible**» · los claims de servidor se reformulan **ya** para que sobrevivan al Worker de licencia («No hay servidor» → «Tus datos no salen de aquí», «localStorage únicamente» → «en tu dispositivo»); `tweaks.data.note` **se deja** porque su claim está acotado al backup · el copy elegido destapó un defecto que **no era del copy**: `valuesPlate` centraba cada columna por su cuenta, así que un label de dos líneas arrastraba su sub **8 px** — mismo defecto que el sello de s147, arreglado con alturas reservadas (s119) en vez de recortando texto · **existe un `README_EN.md`** que nadie había mirado: estaba en **v0.18.0** y **seguía vendiendo «Lifetime, Pase and Seasons»**, el modelo de cuatro vías descartado en s134 que s149 creyó cerrar — corrigió solo el español · los dos README enlazaban a **`HANDOFF.md` y `docs/porting.md`, que no existen**, y anunciaban **5 ejes de personalización de los que solo uno tiene control** (dos apagados por bandera, dos dormidos desde s20) | #151 | [diario](./docs/sessions/session-151-frente-b-copy-y-presencia.md) |
| **v0.83.0** | 2026-08-03 | chore(tooling): **`npm run verify`, y el listón era ponerlo rojo con el crash de s144** — fase A de la auditoría (D1), alcance de D5: build + artefacto + `node --check`. El enunciado decía que ninguna pieza de `scripts/audit/` devuelve código de salida; medido, **diez de trece salen con 1** — lo que no hay es **ningún aserto**, así que no se reaprovecha ninguna · el crash de s144 tiene sintaxis impecable y solo revienta **al renderizar**, así que lo caza el **análisis de ámbito del compilado**: sobre el artefacto sano hay **38** identificadores sin ligar y los 38 son de plataforma, **cero ruido de la app** ⇒ un `useState` pelado es el nombre 39 · reproducido a propósito, sale `app/main.jsx:23` (la primera versión dijo **24**: el patrón se comía un salto de línea) · **cuatro rojos más**: módulo declarado inexistente (el build solo avisa), versión descuadrada, sintaxis en `sw.js` (**el build no lo mira jamás**) y archivo de `app/` sin declarar — este último salió de medir la **biyección 97 = 97** · el script **imprime sus propios huecos en cada pasada** y no deja rastro: restaura los dos artefactos byte a byte | #150 | [session-150](./docs/sessions/session-150-verify-red-de-seguridad.md) |
| **v0.82.0** | 2026-08-03 | chore(sw)+fix(entitlement)+docs: **el service worker dejaba diez versiones de retraso en la caché de cada usuario** — triaje de la auditoría integral externa contra el código real: de lo verificable, **cero afirmaciones falsas**, y **cuatro contradicciones** de las que **tres son del repo consigo mismo** (el onboarding promete «Siempre gratis», la sidebar sigue siendo racha + récord contra §37-bis, y Desktop reordena con `order` contra la letra de s123) · el precache soltaba el export congelado en v0.71.0, servido **cache-first para siempre**; el cleanup del `activate` lo borra solo al bumpear · el pegado de la auditoría había perdido **todos** los marcadores markdown desde la línea 233, no solo la valla · **cuatro de las nueve decisiones cerradas en el mismo cierre**: A–K se **fusiona** (no sustituye), el `verify` v1 = build + artefacto + `node --check`, el guard gana **`hasPremiumEntitlement()`** para superficies de pago, y el modelo de cuatro vías queda **marcado como histórico** en `MONETIZATION.md` / `ROADMAP.md` / `README.md` | #149 | [session-149](./docs/sessions/session-149-triaje-auditoria-integral.md) |
| **v0.81.0** | 2026-08-03 | chore(estructura): **cinco archivos por encima del límite, y dos no estaban en la lista** — Fase 8.5, troceo sin cambio de comportamiento. La tabla de deuda daba `exercise-glyphs.jsx` por «dentro de límite» con **571 ln** y no registraba `sessions.js` (**502**) · `tokens.css` 613→**386**, `Sidebar.jsx` 570→**141**, `state-core.jsx` 510→**402**, `exercise-glyphs.jsx` 571→**209**, `sessions.js` 502→**353** · el build solo sabía inlinear `tokens.css`: generalizado a todas las hojas de `app/` · **`first.return` no se desbloquea NUNCA** (preexistente, confirmado contra el artefacto de v0.80.0) | #148 | [session-148](./docs/sessions/session-148-saneamiento-fase-8-5.md) |
| **v0.80.0** | 2026-08-03 | fix(logros): **el papel deja de contar como tinta, y el sello deja de flotar** — el moteado alrededor de los dibujos era **tramado de semitono del PNG**, y el suelo de papel se aplicaba DESPUÉS del remuestreo que lo viola: 2,0 % → 5,7 % → **12,4 %** de píxeles «con tinta» · el aviso pintaba el glifo VIEJO porque `Toast.jsx` y `CompletionScreen.jsx` eran la **3.ª y 4.ª copia** del render, y s146 solo unificó dos · el sello se anclaba al centro de la tarjeta y flotaba **11 px** con el largo de la descripción | #147 | [session-147](./docs/sessions/session-147-tramado-y-alineacion.md) |
| **v0.79.1** | 2026-08-03 | fix+feat(logros): **el aviso vuelve a hablar de lo que acabas de hacer, y los sellos son dibujos** — la cola FIFO de s145 anunciaba la actividad ANTERIOR (al acabar 4·7·8 salía «Primer estirón») · §15.4: sidebar dividía entre 96 y el modal entre 88, ahora **denominador único** · **55 glifos del usuario** como máscara CSS, con marco detectado y recortado · «Repertorio» sustituye a «Exploración» | #146 | [session-146](./docs/sessions/session-146-curva-de-logros.md) |
| **v0.79.0** | 2026-08-02 | fix+feat(logros): **la web volvió a abrir, y la curva dejó de desplomarse** — `useState` pelado en `main.jsx` rompía el artefacto compilado **desde s144** (en `PACE.html` no rompe: el build envuelve en IIFE) · curva medida con banco propio: el día 1 daba el **35 % de lo que da un año**, ahora el **18 %** · **AMNISTÍA**: nadie pierde un logro, se anula la excepción a §2.5 de s136 | #146 | [session-146](./docs/sessions/session-146-curva-de-logros.md) |
| **v0.78.0** | 2026-08-02 | feat(logros): **entrega escalonada — uno por sesión** — una primera sesión a las 6:50 daba **4 logros de golpe** (medido); ahora se gana igual y se **anuncia de uno en uno**, con cola persistida. §2.5 intacta: nada se pierde | #145 | [session-145](./docs/sessions/session-145-logros-entrega-escalonada.md) |
| **v0.77.0** | 2026-07-31 | feat(ui): **Preview «antes de empezar» (§18.3)** — qué necesitas · posición · duración · intensidad · pasos con glifo, entre la tarjeta y la sesión. **16 de 28 descripciones llevaban el requisito escrito a mano** porque no tenía sitio; ahora lo tiene | #144 | [session-144](./docs/sessions/session-144-preview-antes-de-empezar.md) |
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
| **v0.32.0** | 2026-05-17 | feat(camino): catalogo 5 -> 7 (path.tea + path.breath) + redisenio PathHydrateStep + getSuggestedPath jerarquica (lastViewed > horario > anytime >… | #78 | [session-78](./docs/sessions/session-78-catalogo-caminos.md) |
| **v0.31.0** | 2026-05-17 | feat(camino): PathTransitions + fix SenderoBar visible + retirada de sticky + microcopia (Toast 3s, CTA verde musgo) | #77 + #77b | [session-77](./docs/sessions/session-77-path-transitions.md) + [s77b](./docs/sessions/session-77b-fix-microcopia.md) |
| **v0.30.0** | 2026-05-16 | feat(camino): arquitectura overlay | #76 | [session-76](./docs/sessions/session-76-overlay-arquitectura.md) |
| **v0.29.0** | 2026-05-16 | feat(camino): sendero hibrido + renombrado sensorial + fix dawn/dusk + foco interno suma a stats | #75 | [session-75](./docs/sessions/session-75-sendero-implementacion.md) |
| **v0.28.12** | 2026-05-12 | style(ui): recalibrar oscuro a negro calido sutil con escalonamiento reducido | #74 | [session-74](./docs/sessions/session-74-negro-calido-sutil.md) |
| **v0.28.11** | 2026-05-12 | style(ui): subir luminosidad y escalonar fondos modo oscuro | #73 | [session-73](./docs/sessions/session-73-ajuste-luminosidad-oscuro.md) |
| **v0.28.10** | 2026-05-12 | style(ui): marron oscuro calido + aro suavizado en modo oscuro | #72 | [session-72](./docs/sessions/session-72-pulido-modo-oscuro.md) |
| **v0.28.9** | 2026-05-12 | feat(ux): aro dinamico + retira envejecido + logo modo oscuro + reorden tweaks | #71 | [session-71](./docs/sessions/session-71-aro-dinamico-limpieza-tweaks.md) |
| **v0.28.8** | 2026-05-12 | fix(tracking): C1+C2+C3+A1+A2 weeklyStats reset semanal + history idempotente + streak proactivo + dia activo unificado | #69 | [session-69](./docs/sessions/session-69-fixes-tracking-criticos.md) |
| **v0.28.7** | 2026-05-11 | fix(breathe): inhalacion suena en arranque y reinicio de ciclo | #67 | [session-67](./docs/sessions/session-67-fix-respira-audio-inhalacion.md) |
| **v0.28.6** | 2026-05-12 | fix(ui): logo completo + tagline sidebar movil + cache-bust iconos maskable safe zone | #66 | [session-66](./docs/sessions/session-66-fix-logo-tagline-movil.md) |
| **v0.28.5** | 2026-05-11 | fix(deploy): index.html root + manifest PWA + iconos PNG vaca pastando (Cloudflare Pages) | #65 | [session-65](./docs/sessions/session-65-fix-cloudflare-pwa.md) |
| **v0.28.5** | 2026-05-12 | fix(ui): logo movil cortado + hueco sidebar movil + scroll vertical heatmaps anuales + nota Semana restaurada (desktop only) | #64 | [session-64](./docs/sessions/session-64-fixes-ui-menores.md) |
| **v0.28.4** | 2026-05-12 | feat(ui): scroll residual Stats desktop eliminado (WeekView sin nota, Mes 56->48px, Año futuros solo borde, Caminos margenes) + sidebar movil… | #63 | [session-63](./docs/sessions/session-63-fix-desktop-movil.md) |
| **v0.28.3** | 2026-05-11 | chore(ui): WeekView + PathStats compactacion segunda pasada | #61/62 | [session-61](./docs/sessions/session-61-cleanup-sidebar-ritmo.md) |
| **v0.28.2** | 2026-05-11 | chore(ui): sidebar mas limpio (eliminados 3 contadores hoy) + Ritmo web sin scroll en Semana/Mes/Ano/Caminos + camino sugerido compacto en movil +… | #61 | [session-61](./docs/sessions/session-61-cleanup-sidebar-ritmo.md) |
| **v0.28.1** | 2026-05-11 | refactor(glyphs): iteracion parcial 13/46 glifos hacia lenguaje home (objeto/forma/parte aislada/metafora) | #60 | [session-60](./docs/sessions/session-60-glyphs-iter-incompleto.md) |
| **v0.28.0** | 2026-05-11 | feat(glyphs): 46 glifos canonicos por paso individual Mueve/Estira | #59 | [session-59](./docs/sessions/session-59-glifos-ejercicios.md) |
| **v0.27.6** | 2026-05-11 | chore(workflow): blindaje Git -- WORKFLOW.md, check-session.ps1, README actualizado a version real, bump version | #58 | sin diario (s58 no lo dejo) |
| **v0.27.5** | 2026-05-11 | refactor(state): state.jsx dividido en 6 modulos por dominio (core/timer/hydrate/achievements/paths/settings) sin cambios de comportamiento | #57 | [session-57](./docs/sessions/session-57-refactor-state.md) |
| **v0.27.3** | 2026-05-09 | chore(build): blindaje build con parser sintactico real | #56 | [session-56](./docs/sessions/session-56-blindaje-build.md) |
| **v0.27.2** | 2026-05-09 | chore(polish): i18n sync ES/EN, a11y overlays (role/Escape/focus), mobile audit, smoke tests documentados | #55 | [session-55](./docs/sessions/session-55-polish.md) |
| **v0.27.1b** | 2026-05-09 | fix(i18n): restaurar claves paths.path.*.name/tagline EN truncadas en s54 + refuerzo build check-d/e | #54b | (hotfix, sin seccion detalle) |
| **v0.27.1** | 2026-05-09 | feat(stats): seccion Caminos en Stats | #54 | [session-54](./docs/sessions/session-54-estadisticas-caminos.md) |
| **v0.27.0** | 2026-05-08 | feat(paths): Caminos parte 2 -- PathsLibrary overlay, sistema favorito, boton Repetir, sugerencia dual favorito+hora | #53 | [session-53](./docs/sessions/session-53-caminos-parte2.md) |
| **v0.26.1** | 2026-05-08 | chore: saneamiento tecnico - encoding STATE.md, validateFileEnd en build, 0 WARN, audit deuda 5 archivos >500 lineas | #52 | [session-52](./docs/sessions/session-52-saneamiento.md) |
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
| **v0.12.9** | 2026-04-23 | Licencia: `LICENSE` (Elastic License 2.0) + cabeceras de copyright en fuentes principales + sección "Licencia" en README + 4ª vía de monetización… | #26 | (sin diario) |
| v0.12.8 | 2026-04-23 | Refactor Fase 2: extracción de `SessionShell`, limpieza de Support, saneo de exports a `window`, helper `displayItalic` | #26 | (sin diario) |
| **v0.12.7** | 2026-04-23 | Auditoría interna previa al refactor · sin cambios de código · informe en [`docs/audits/audit-v0.12.7.md`](./docs/audits/audit-v0.12.7.md) | #25 | [abajo ↓](#v0127--2026-04-23--auditoria-interna) |
| v0.12.7 | 2026-04-23 | Scroll asimétrico: home con `100dvh` puro (4 botones siempre) + sidebar con `min-height: calc(100dvh + 1px)` que recupera el auto-hide de la barra… | #24 | (sin diario) |
| v0.12.6 | 2026-04-23 | DVH fit: `100dvh` con fallback a `100vh` para que el móvil encaje con o sin barra de URL | #23 | (sin diario) |
| v0.12.5 | 2026-04-23 | Responsive móvil: sidebar desacoplada fullscreen + home que cabe en 375×812 sin scroll | #22 | (sin diario) |
| v0.12.4 | 2026-04-23 | Briefing de dirección: gating 2+2+2, modelo Lifetime, CTB, Ritmos, responsive móvil | #21 | (sin diario) |
| v0.12.3 | 2026-04-22 | Timer: número gigante con más aire sobre el subtítulo + pill "Otro" para minutos personalizados | #20 | (sin diario) |
| v0.12.2 | 2026-04-22 | Pill de apoyo consolidada + Tweaks de logo/copy retirados + standalone autocontenido | #19 | (sin diario) |
| v0.12.1 | 2026-04-22 | Pulido: bugs de race condition, sidebar más limpio, Welcome compacto | #18 | (sin diario) |
| v0.12.0 | 2026-04-22 | Welcome de primera vez + Export/Import JSON + 6 tweak-secrets | #17 | (sin diario) |
| v0.11.11 | 2026-04-22 | Integración Buy Me a Coffee: frente 1 de monetización | #16 | (sin diario) |
| v0.11.10 | 2026-04-22 | Logros: arreglo `explore.*` + estado "Próximamente" | #15 | (sin diario) |
| v0.11.9 | 2026-04-22 | Swap Mueve ↔ Estira: contenido reubicado + título del modal | #14 | (sin diario) |
| v0.11.8 | 2026-04-22 | Backlog de robustez: 6 bugs del informe de auditoría | #13 | (sin diario) |
| v0.11.7 | 2026-04-22 | Barra horizontal del sidebar: logo 2.5× + iconos gráficos | #12 | (sin diario) |
| v0.11.6 | 2026-04-22 | Limpieza sin riesgo: dead code del backlog de auditoría | #11 | (sin diario) |
| v0.11.5 | 2026-04-22 | Auditoría: 7 bugs críticos + logo local | #10 | (sin diario) |
| v0.11.4 | 2026-04-22 | Timer "Aro" alineado a referencia visual | #9 | (sin diario) |
| v0.11.3 | 2026-04-22 | Logo oficial v2, Tweaks topbar-derecha, viewport 1920×1080 | #8 | (sin diario) |
| v0.11.2 | 2026-04-22 | Sidebar colapsable, Sendero, logo Pace. lockup | #7 | (sin diario) |
| v0.11.1 | 2026-04-22 | Iconos ActivityBar restaurados | #6 | (sin diario) |
| v0.11.0 | 2026-04-22 | Fortalecimiento del proyecto: README, CHANGELOG, ROADMAP | #5 | (sin diario) |
| v0.10.1 | 2026-04-22 | Reorganización modular post-GitHub | #4 | (sin diario) |
| v0.10 | 2026-04-22 | Pulido del core (Respira + Mueve) | #3 | (sin diario) |
| v0.9.2 | 2026-04-22 | Refinamiento post-feedback: Aro + Flor + Estira | #2 | (sin diario) |
| v0.9 | 2026-04-22 | Base inicial — 14 JSX + 100 logros + 5 módulos | #1 | (sin diario) |

---

## [v0.97.0] -- 2026-08-18 -- feat(glifos+i18n+logros): los 19 dibujos, los 96 logros en ingles, y una recomendacion retirada

### Los 19 glifos de logro

- **77 de 96 logros tienen mascara** (eran 58). Quedan **19 sin arte**.
- La asignacion la cerro el usuario **mirando** la hoja de contactos; el `MAPEO`
  se escribe por **nombre de archivo**, nunca por posicion (leccion de s146).
- Efecto secundario por diseno: la ingesta **modifico 17 mascaras que ya
  existian**, porque el peso de tinta se iguala contra la **mediana del conjunto
  entero** y 19 dibujos la mueven. Las otras 41, identicas byte a byte.
- Una sospecha mia que **la medida desmintio**: los 19 nuevos ocupan del **58,5 %
  al 86,2 %** del lienzo y los 58 viejos del **54,5 % al 85,3 %**. Mismo rango.

### Las dos trampas del handoff, afinadas en las dos direcciones

- **Mas pequenas**: lo que la app consume son las `.webp` de
  `app/glyphs/assets/logros/`, **committeadas**. Los PNG son el archivo de
  disenos del usuario, fuera del repo, y la app no los abre nunca.
- **Mas grandes**: el `ABORTADO — no existe el dibujo` vivia **despues** del
  borrado (linea 305 contra 296). Ese si era el camino destructivo.
- **Prevuelo nuevo**: resuelve las 77 claves **antes** de borrar. Probado en
  rojo — 58 filas huerfanas, aborta con exit 1, las 58 mascaras intactas.
- **Documentacion corregida** (gana el codigo): la ruta por defecto apuntaba a
  una carpeta inexistente, y la cabecera anunciaba un flag `--todos` **que no
  existe** — no hay un solo `argv` en el script.
- El arte fuente se consolida en **una carpeta**, por decision del usuario, con
  los 19 movidos y su **md5 comprobado antes y despues**.

### La biyeccion que valida el censo

```
.old\Glifos_logros = 91 PNG = 83 `asset_*` (→ 50 ids) + 8 `Premium_*` (→ 8 slugs)
                            = 58 dibujos = las 58 filas del MAPEO
```

El lote nuevo **no tiene esa senal**: los 19 comparten slug y solo cambian el
timestamp, asi que las re-exportaciones se descartan por **19 md5 distintos**.

### Los 96 logros en ingles

Cierra el hallazgo abierto desde **s146**: `Achievements.jsx` y `Toast.jsx` leian
`a.title`/`a.desc` **crudos** del catalogo, asi que en ingles se mostraban en
castellano.

- **192 claves** nuevas en `app/i18n/content/achievements.js`, con la **biyeccion
  96 = 96** comprobada antes de generarlo.
- Van a `content/` y no a `strings/` porque **el propio verify lo exige**:
  `strings/*` es biyectivo ES/EN y `content/*` es un patch de **solo ingles** —
  anadir una clave espanola desde ahi es un FALLO explicito. El castellano sigue
  viviendo **solo** en `catalog.js` y los componentes caen a el con
  `tR(clave, fallback)`, el mismo patron de Respira/Mueve/Extra.
- Consecuencia que **corrige una estimacion mia**: el CENSO de i18n **se queda en
  515**, no sube a ~707. Las claves de `content/*` no se cuentan ahi.
- **+3 asertos (78 → 81)**, los tres primeros de la suite sobre el **IDIOMA**,
  que era uno de sus huecos declarados. Control rojo: reintroducido el defecto de
  s146, **caen ingles y aviso y pasa el espanol** — la firma exacta.

### El aire de las tarjetas: el defecto no era el que parecia

Reportado por el usuario. A 1280 parecia cosmetico (24,3 px de mediana);
**medirlo en siete anchos cambio el diagnostico**:

| Viewport | Tarjeta antes | Aire minimo | Tarjeta ahora |
|---|---|---|---|
| 1440 | 127 × 146 | 0,6 px | 127 × **134** |
| 768 | 154 × 178 | 39 px | 154 × **140** |
| **320** | 246 × **283** | **156,6 px** | 246 × **127** |

La causa era `aspectRatio: '1/1.15'`, que ataba el **alto al ancho**: con
`minmax(128px, 1fr)`, al estrechar caben menos columnas, cada tarjeta se ensancha
y la proporcion la estira mientras el texto sigue midiendo lo mismo.

**Las dos ideas del usuario no lo arreglaban**: encoger rompia
`master.path.all7` («Cartografa»), que consumia la reserva entera y le sobraban
**0,6 px**; y **centrar es exactamente lo que s147 quito, a peticion suya**. Se le
notifico como restriccion previa.

Arreglo: sin alto proporcional, la rejilla iguala **por fila**. La regla de s147
sigue en pie porque su defecto era la deriva *dentro* de una fila.

**Yo recomende primero la opcion equivocada** —acortar el copy y encoger el alto
fijo— y la medida por anchos me hizo retirarla antes de tocar nada.

### El duplicado medido, y dos arreglos de catalogo

```js
state-achievements.jsx:278
if (current >= 30) { unlockAchievement('streak.30'); unlockAchievement('stats.streak.30'); }
```

**La misma condicion desbloqueaba dos logros en dos categorias.**
`stats.streak.30` pasa a medir **treinta amaneceres de verdad** — 30 dias
distintos con sesion antes de las 9:00 — sobre la lista `morningDates`, que ya
existia capada a 30 justo al lado de `morning.5`. Sin estado nuevo, y el titulo
pasa a ser literal.

- **«Curiosidad»** (`explore.tweaks`) pasa a **secretos** con `secret: true`: los
  otros 18 de exploracion son «Tres sesiones de X» y este es «Abre los Tweaks».
- **`streak.7`** deja de llamarse «Semana vaca» —sonaba a *semana vacia*— y pasa
  a **«Cuarto creciente»**: siete dias son un cuarto del ciclo lunar, enhebra
  7 → 30 → 365 con «Luna llena» y «Vuelta al sol», y «creciente» es lo que hace
  una racha.
- **Ningun `id` se toca**: renombrarlo borraria el logro a quien ya lo tuviera.

### El instrumento E2E

El usuario eligio **abaratar los tests**, no calibrar workers. Se retiro el
`waitForTimeout(12)` por segundo simulado —**1 de cada 2 viajes al navegador**—
con control rojo verificado: la spec sola pasa de **20,9 s a 15,8 s**.

**No basto.** A 8 workers seguia rojo 2 de 3, y caian tests **distintos** a los
del diagnostico heredado. A 4 medi **3 de 3 en verde** y lo di por bueno:
**era una ventana afortunada**. Repetido mas tarde, **rojo 3 de 3**, con el reloj
pasando de **49 s a 3,1 min** para el mismo trabajo.

Medida de la maquina: **CPU al 6 %** y **5,8 GB libres de 15,7**. El cuello **no
es CPU, es memoria**, y depende de cuanta tenga cogida el navegador del usuario.
**A 2 workers: 81/81 dos veces.** Se fija **2 en los dos lados** — una red de
seguridad que falla segun lo que tengas abierto no es una red.

### Verificacion

- `npm run verify` **PASA** · v0.97.0 coherente en los 7 sitios.
- `npm run test:e2e` **81/81** con la config committeada.
- CENSO a mano: mascaras **58 → 77**, de secreto **5 → 8**, visibles **53 → 69**,
  precache **86 → 105**, logros secretos **12 → 13**. i18n **sigue en 515**.
- `index.html` regenerado · **`PACE_standalone.html` intacto en v0.71.0**.
- Revision **a tamano real** de los 19 sellos sobre la app, guard exacto 19 = 19
  y cero errores de consola.

### Cinco mentiras del instrumento

| Mentira | Causa |
|---|---|
| «el censo dedupe mal» | lei un `ls \| head -8` y `Premium_*` ordena **antes** que `asset_*` |
| la captura «del panel» era del **onboarding** | invente `onboarded: true`; la clave real es `firstSeen`, y el helper lo avisa por escrito |
| «19 de 19 tarjetas» cuando eran **20** | la sidebar pinta su propia previsualizacion, y mi guard solo miraba «no falta ninguna» |
| el test acusaba a la app de colar ingles en espanol | `includes` casa por **SUBCADENA**: «Coherent» ⊂ «Coherente» |
| «EXIT=0, el guard no aborta» | era el codigo de `head`, no del script |

La segunda es la que mas ensena: **el guard de cero decia la verdad y aun asi la
captura no revisaba nada** — los 77 sellos si estaban pintados, detras del
onboarding. Lo caza **mirar la imagen**.

### Abierto

- **19 logros sin arte**, y `season.equinox.autumn`: el farol se lee, pero el sol
  y la luna que justifican el equinoccio **son ilegibles a 56 px**.
- **Las familias del catalogo**: **maestria (26) mezcla** profundidad con habitos
  de hora del dia, **estadisticas se solapa con constancia** (el duplicado era su
  sintoma) y la clave dice `exploracion` mientras la etiqueta dice «Repertorio».

---

## [v0.96.0] -- 2026-08-18 -- feat(retencion+home+glifos): cuatro frentes y nueve mentiras del instrumento

### El estado declarado no reproducia

El arranque daba el `72/72` por bueno. **Daba 68.** Tres pasadas sobre el mismo
arbol: 68/72, 70/72 y **5/5 con la spec aislada**. Los cuatro fallos, siempre de
`respira-progreso.spec.js` y siempre `Test timeout of 60000ms exceeded`. El numero
que lo explica esta en los que SI pasaron: **58,0 s y 59,6 s contra 60 s de plazo**.

Control con la unica variable cambiada -- `workers` --:

| Condicion | Resultado | Reloj |
|---|---|---|
| 8 workers (el `undefined` en local, 16 hilos) | 68/72 y 70/72 | 2,2 / 2,0 min |
| **2 workers (lo que usa el CI)** | **72/72** | **1,0 min** |

A 2 workers **no solo sale verde: sale al doble de velocidad**. El CI lleva verde
desde s165 por correr en la condicion tranquila. **Queda SIN ARREGLAR**, esperando
decision entre capar workers, subir el plazo (s165 lo rechazo por escrito) o
abaratar los cuatro tests. Toda la sesion se corrio con `--workers=2`, sin tocar
`playwright.config.js`.

### Anadido

- **El tiempo de retencion**, aprobado en s165 con tres condiciones que son la
  decision: **total acumulado y nunca un maximo** (B1/s89 retiro la cifra por ser
  un RECORD, no por ser un dato), **invisible durante la practica** y **sin logro**.
  Se guarda como **serie semanal en SEGUNDOS** (`weeklyStats.holdSeconds`; en
  minutos seria siempre 0 o 1) que baja al historico por el rollover. La escala
  semanal se eligio porque **soporta las seis variantes fotografiadas** y la de por
  vida no. Se pinta como **linea al pie** del panel Ritmo, y **no aparece si vale
  cero**: solo 3 de las 20 rutinas de Respira tienen retencion. **No es «empezar a
  contar la apnea»**: `activeMsRef` la suma desde s98; esto la saca a un numero
  propio. El reloj vive en `BreatheSession.support.jsx` (§1: el componente estaba
  en 480 de 500).
- **`focus.startPause`**: el CTA del Pomodoro en Pausa y Larga. **12 casos medidos**
  en los dos idiomas y las dos paletas, 0 discrepancias.
- **El mecanismo de las mascaras de ejercicio**: `exercise-masks.js` con el mapa
  **VACIO** y precedencia sobre el SVG en `ExerciseGlyph`, igual que s146 con los
  sellos. Con el mapa vacio la app pinta exactamente lo de ayer, y cada dibujo que
  entre sustituye al suyo: **los 62 no tienen que llegar de golpe**.
- **`scripts/ingest-glifos-ejercicio.js`**, probado sobre PNG sinteticos: empareja
  por **slug contra la identidad visual** (nunca por posicion), escribe `.webp` a
  384 px y reescribe mapa y precache. La normalizacion lleva un trazo de L=120 a
  **alfa 255**; sin ella se quedaria en el 49 %.
- **Cinco bancos** en `scripts/audit/`: CTA del Pomodoro, barra de Respira en movil,
  orden de la home contra HEAD, variantes de retencion y los cuatro cuadrantes.
- **+6 asertos (72 -> 78)**: `tests/retencion.spec.js` (4) y
  `tests/glifos-mascara-ejercicio.spec.js` (2).

### Cambiado

- **Un solo orden de home para las dos pieles**: aro -> Actividades -> Camino.
  Actividades hereda el papel de horizonte **sin mecanismo nuevo** —el selector de
  hermano adyacente de s156 ya decia «el horizonte es el primero despues del aro»—
  y la tarjeta suelta su margen negativo, como escritorio desde s126.
- **`ExerciseGlyph` da precedencia a la mascara** sobre su SVG.
- CENSO de i18n **511 -> 515**.

### Retirado

- **El lector de `--pace-skin` en JS** (s160), con su listener de resize y su rAF:
  existia solo para elegir el orden del DOM y se quedo sin consumidor. Era un
  re-render de la home entera al cruzar el breakpoint a cambio de nada.
  `--pace-skin` sigue publicandose y las hojas lo siguen leyendo.
- **Un mecanismo redundante en el reloj de retencion.** El banco de mutaciones lo
  destapo: `finish()` cerraba el segmento **y** `segundos()` contaba el abierto, asi
  que romper cualquiera de los dos no cambiaba el resultado. Eso no es defensa: es
  codigo del que no se puede saber si funciona.

### Corregido

- **DOS AFIRMACIONES HECHAS AL USUARIO, retiradas.** Se le reporto que el
  solapamiento pasaba de **64 a 54 px** a 375 y que el cambio arreglaba un retroceso
  de foco previo a 320. Las dos eran del banco:

| Mentira | Causa | Bien medido |
|---|---|---|
| «el solapamiento cambia» | esperar 500 ms fijos en vez de a que el motor CALLE (publica mas de una vez) | **identico en las 5 vistas**: 47/47 · 54/54 · 57/57 · 1/1 · 80/80, publicado == real |
| «arregla un retroceso de foco» | a 320 la home desborda 8 px y tabular arrastra el viewport | la lectura **no vale** en ninguna columna |
| «`--pace-dial-d` es NaN» | leerlo de `:root`, donde no esta | los tokens son `--pace-timer-d` y `--pace-activities-overlap` |
| «1 retroceso en toda vista movil» | contar el ciclo del foco dando la vuelta | 0 |

  Las cuatro estaban **ya resueltas** en `tests/home.helpers.js` con su porque al
  lado; el banco pasa a **consumir la sonda de la suite** en vez de la suya.
- **El banco de movil era una tautologia**: medir «desborda a su padre» cuando la
  barra es `width:100%` **de ese padre**. Saboteando `maxWidth` de 260 a 600 seguia
  diciendo «0 desbordes» con la barra a 374 px. Rehecho con **control positivo**.
- **La ingesta se corrigio sola dos veces**: 51 identidades leyendo solo el registro
  (faltaban los pasos de las rutinas; `EXTRA_ROUTINES` no se publica en `window`) y
  62 al anadir los dibujos huerfanos, que el encargo dice **expresamente** que no hay
  que rehacer. **61 = 61**, lo que la app PIDE.
- **La semilla de los bancos mintio dos veces**: sin
  `_weeklyStatsReindexed_v0_28_8`, `loadState` aplica la reindexacion de v0.28.8 y
  **rota la semana un dia**; y un cero **no pinta `<span>`**, que es lo correcto.
  Casi cuesta acusar al producto de un defecto que no tenia.

### Verificacion

- `npm run verify` **PASA** · v0.96.0 coherente en los 7 sitios.
- `npm run test:e2e` **78/78** con `--workers=2`.
- `index.html` regenerado · **`PACE_standalone.html` intacto en v0.71.0**,
  restaurado tras cada uno de los ~15 builds de la sesion.
- Consola **limpia** en todas las pasadas de los cinco bancos.

### Lo que NO se cubre, declarado

- La **variante de la retencion es una suposicion**: la nota de s165 decia «a escala
  de semanas» y no hubo eleccion mirando. Pasar a la de por vida es una linea.
- El **arreglo del instrumento E2E** sigue abierto.
- La **ingesta no se ha corrido sobre arte real**: dos PNG sinteticos.
- La **retencion se miro a 1280x900**; en movil, sin medir.
- **`BreatheSession.jsx` queda en 493 de 500.**
- La **pill de Foco/Pausa/Larga en movil de pantallas largas** queda anotada con sus
  dos preguntas sin responder.

---
