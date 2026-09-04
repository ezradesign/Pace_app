# Changelog

Todos los cambios notables del proyecto PACE.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).
Versionado semántico informal — ver [`CLAUDE.md`](./CLAUDE.md#versionado-semántico-informal).

**Convención:** este archivo solo detalla las **2 últimas versiones**. Para
versiones anteriores, la tabla enlaza al diario completo en
[`docs/sessions/`](./docs/sessions/).

---

## Historial completo

> **Nota — s173 (2026-08-25): bloque SOLO-DOCUMENTAL tras v0.103.0.** **El rediseno de las tres librerias, aprobado MIRANDOLO y sin implementar.** Doce iteraciones de maqueta HTML con el catalogo real, las mascaras reales y los tokens de `DESIGN_SYSTEM.md`, a 360x730, 412x844 y 1280. Todo en [`LIBRERIAS_REDISENO.md`](docs/product/LIBRERIAS_REDISENO.md). **La tesis cambio a mitad**: empece proponiendo comprimir la tarjeta y los cuatro comentarios del usuario pedian MAS informacion, asi que **si la tarjeta tiene que crecer, lo paga el FILTRO** — medido, la tarjeta crecio y aun asi scrollea menos (**4,50 → 3,57** pantallas), y con un filtro cae a **1,53**. Los ejes se eligieron **midiendo cual parte el catalogo**: en cuerpo la duracion no separa nada (todo entre 1 y 6 min) y el contexto parte casi por la mitad; en Respira al reves (2 a 20 min) — de ahi «gemelas + una aparte». **Dos de los cuatro filtros no filtraban**: «Aqui mismo» + «Con suelo» = 14 de 14 y «De pie» esta contenido entero en el primero. **El color lo decidio la app**: `Card` es NEUTRA en reposo y pone el accent en el HOVER, o sea que en PACE el color de modulo **no dice lo que hay, dice lo que estas tocando**. Cuatro defectos solo aparecieron midiendo la maqueta, y el peor fue el bloque «Para ahora» **VACIO durante dos versiones** por usar ids `extra.*` en Estira, **cuyas 14 rutinas empiezan por `move.`** — la trampa que la decision de s172 prohibe expresamente. Y una regla de continuidad del usuario: **el diseno se aprueba VIENDOLO, en maqueta, antes de implementar nada**. Diario: [session-173](./docs/sessions/session-173-fusionar-y-las-librerias.md).

> **Nota — s172 (2026-08-21): bloque SOLO-DOCUMENTAL tras v0.102.2, sin versión nueva.** **El encargo de arte, y un censo que veía 61 identidades donde hay 62.** Se escriben los prompts de lo que falta describiendo el estilo **que ya está en producción** —las convenciones salen de mirar las 57 piezas, no de un documento: pared = línea vertical pegada al cuerpo, suelo = línea horizontal corta, silla/mesa = una recta a la altura del apoyo, movimiento = línea de puntos con flecha— con lo que **§1 de `GLIFOS_EJERCICIOS_REDISENO.md` queda superado** (pedía pictograma y lo que hay es grabado anatómico). **Una contradicción cazada**: la ficha de `Deslizamientos en pared` decía «de frente contra la pared» y su propio cue dice «de espaldas» — manda el cue, y desde ahora cada ficha lo lleva escrito al lado. **Y las dos preguntas del usuario destaparon lo caro.** «¿Seguro que hacen falta todos?» → se mide el alcance de cada pieza y **`Nordics` SALE de la cola** (no está en ninguna rutina del catálogo, sólo en el constructor, y ya tiene SVG). «¿Ésos seis sólo?» → **NO: faltaba `Puente isquio a una pierna`**, invisible por **dos errores independientes** — el patrón del generador sacaba los nombres con `/name: '...', mode:/` y **los pasos legacy declaran `dur:`**, y el encargo la daba por «dibujo que no usa nadie» cuando es **la única de esas cinco SIN alias que la tape**. Lo que lo hacía invisible es que **el número salía redondo**: 61 coincidía con el censo de s164, que arrastraba el mismo punto ciego. Censo regenerado: **62 · 57 · 5**, y su guard de «sin fila en el encargo» de 1 a **0**. Nace [`GLIFOS_A_DIBUJAR.md`](docs/product/GLIFOS_A_DIBUJAR.md), autocontenido y con las **7** piezas ordenadas por lo que más se nota — `Descanso` sale 18 veces y las otras seis suman 8 entre todas. Diario: [session-172](./docs/sessions/session-172-el-emisor-y-los-dos-mapeos-al-reves.md).

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
| **v0.114.1** | 2026-09-04 | fix(i18n)+docs(audit): **el logro que hablaba en espanol, y ocho premisas que ya no eran** — Cierra el unico defecto medido y **publicado** que quedaba de s182: con la app en ingles la fila del ultimo logro decia «Regresas». **Sobrevivio a s167 porque entonces esa superficie no decia ningun nombre** — pintaba cinco sellos sin texto, y **s180 los sustituyo por UNA fila con el nombre** sin tocar i18n. `achMini` recibe `tR` por parametro. **Dos asertos nuevos, con dos mutantes que muerden**, y el de espanol sigue verde con el primero: el par no se mide a si mismo. **185 → 187.** Y la **auditoria de premisas** encargada por el usuario, reutilizando los checkers de s178 y atacando la clase que aquellos declararon no poder ver. **Ocho hallazgos**: `CLAUDE.md` con cuatro datos falsos (arbol de 14 carpetas donde hay **19**, `WeeklyStats.jsx` inexistente, el dato de Estira apuntando a un archivo que ya no lo tiene -- **tercera vez que ese parrafo miente**-- y «65 tests» donde hay **187**) · **la musica pide dos cosas incompatibles a la vez**, y esa contradiccion es exactamente la causa que s177 midio de que la pieza no sonara · `EVENTOS_SCHEMA.md` decia «ninguna parte se ha cableado» con **1.453 lineas y 5 specs** vivas · el troceo de >500 lineas de la Fase 8.5 **ya estaba hecho** (322/261/318, y de 239 archivos ninguno pasa de 500) · `CONTENT.md` con **77 versiones** de deriva y Estira a 14 donde hay **17**, sospechado en s130 y sin verificar en 53 sesiones · y `stats-pestanas` **verde sobre el estado vacio**, ciego a que con datos «Semana» se corta 33 px y «Caminos» hasta 146. **Tanda 0 ejecutada**: cinco documentos corregidos. De Stats se decidio mucho y **no se implemento nada**: «Hoy» **no entra** (anula el §4.1 y el §37.4), la vista no se rehace, la barra es cinta escalonada y los Caminos se quedan fuera. | s183 | [session-183](./docs/sessions/session-183-auditoria-de-premisas.md) |
| **v0.114.0** | 2026-09-02 | feat(sidebar)+fix(censo): **el cajon de movil encoge tambien, y el censo que un troceo dejo ciego** — Los tres encargos que el usuario saco de mirar la revision de s181, medidos y **pintados antes de decidir**. **A NO ERA UN DEFECTO**: 375x844 no corta nada -- el corte era del carrusel horizontal de la propia pagina de revision. **B y C los decidio el usuario viendo las 30 capturas**, y su respuesta a C no era ninguna de las cuatro opciones: «escalarla en todas las resoluciones que quede bien y en las mas pequenas aceptamos un pequeno scroll **sin barra**». **UN NUMERO MIO DEL HANDOFF ERA FALSO Y HABRIA VICIADO LA DECISION**: 0,85 no hace caber 667, porque faltaba contar los 45 px del propio cajon. El suelo real es **0,80**, elegido por dos medidas (la semana se queda en 36 px, sobre los 24 de WCAG 2.2 AA; y hace caber entero el iPhone SE/8). **EL BANCO FOTOGRAFIO SU PROPIA MUTACION**: su limpieza entre variantes borraba `--sb-escala`, la propiedad que escribe el producto, y con el memo de `aplicar` no se volvia a escribir nunca -- dio «factor 1» sobre una app que en vivo estaba a 0,8083, y ahora recarga por variante y **cruza dos instrumentos**. Y el censo de glifos: **s178 lo dejo ciego a Estira entera** al trocear el dato, y devolvia **61 donde hay 62** sin que nada saltara. **173 → 185**, con 6 mutantes calibrados en rojo. | s182 | [session-182](./docs/sessions/session-182-el-cajon-de-movil.md) |
| **v0.113.0** | 2026-09-02 | fix(sidebar): **la sidebar encoge entera, y la tarjeta que se amputaba sola** — Cierra el trabajo que s180 dejo sin commitear y resuelve el problema de altura que su handoff dejo ABIERTO, con un diagnostico DISTINTO del que ese handoff daba por bueno. **LOS 747 px DEL HANDOFF ERAN EL SUELO COMPRIMIDO, NO LA ALTURA**: la natural eran **835,9** (dos cuentas independientes: la suma de las piezas menos el chevron, que es absolute, y el primer viewport sin sobrante). **EL SINTOMA NO ERA UNA BARRA DE SCROLL sino la TARJETA quedandose sin texto**: `sidebarStyles.accion` lleva `overflow: hidden`, y eso **APAGA el tamano minimo automatico del flex** -- que solo aplica con `overflow: visible`-- asi que era el UNICO hijo comprimible de doce y absorbia el deficit entero amputandose. **DOS UMBRALES**: por debajo de 836 pierde contenido, y entre 750 y 836 lo pierde **sin barra que avise**. A 714 la tarjeta media **33 px**: rotulo y nada mas. **Y ESTABA PUBLICADO**: HEAD trae la misma linea y desborda **50 px** a 714, mas que el arbol. **SE CONSTRUYO LA SOLUCION EQUIVOCADA Y EL USUARIO LA TIRO MIRANDOLA**: apurar el aire bajaba la columna a **700,3** (135,6 px, de los que **56 salian solo de las cuatro reglas**) pero cambiaba las PROPORCIONES. Su instruccion: «si hay que hacer a la vez pequenos a TODOS los elementos, perfecto» ⇒ **la columna se ESCALA entera** con `transform`, misma composicion y solo mas pequena: **1 · 0,926 · 0,822 · 0,708** a 1000/800/714/620, con el pie siempre a 18 px del borde y sin agrandar nunca por encima de su tamano natural. **LA LENTE NO ESTABA EN EL PLAN**: la envoltura mide `100%/escala` de ancho y desbordaba **52 px** en layout, tumbando un guard de scroll lateral que ya existia -- se arreglo el diseno, no el guard. **LOS MINUTOS DE HOY YA COMPARTEN LINEA**: `puntosSesion` devolvia `null` sin sesiones, asi que tres celdas no tenian fila de bolas y Agua si, y con `marginTop: auto` el valor caia al fondo en tres y no en la cuarta. **EL ROJO INTERMITENTE TENIA RAZON Y ERA DEL PRODUCTO**: si las webfonts cargan DESPUES de calcular la escala, el numero queda hecho con la fuente de reserva y **nada lo corrige**. Ademas: regla nueva en el pie y **pill naranja** en «Mis rutinas». **El precio, dicho**: encoger encoge los objetivos tactiles (la semana, de 45 a **37,1 px** a 1280x720; sigue sobre el minimo AA de 24). **Tres mentiras del instrumento nuevas**: `setViewportSize` de Playwright **no emite `resize`**, el `ResizeObserver` no dispara sobre la lente en headless, y fotografie mi propia mutacion. **173/173** (eran 170), 3 tests nuevos y dos troceos por la regla §1. | s181 | [session-181](./docs/sessions/session-181-la-sidebar-que-encoge-entera.md) |
| **v0.112.0** | 2026-09-02 | fix(sidebar): **la geometria fija, y el corte de CSS que se llevo un arreglo por delante** — Segunda mitad de s180: el usuario prueba la sidebar publicada y reporta diez cosas. **DECIDE GEOMETRIA FIJA EN ESCRITORIO**: la columna mide lo mismo en un portatil que en un monitor de 1440, con el pie anclado abajo. Se habia probado lo contrario -- repartir el aire con `margin: auto`-- y **NUNCA REPARTIO NADA**: el espaciador con `flex: 1` se comia el sobrante (378 px a 1030 de alto) porque el flex-grow va antes que los margenes automaticos, **y el numero estaba a la vista en la maqueta** (la variante «aire repartido» daba 455 px de hueco contra los 389 de la que no repartia) sin que yo lo leyera. **AJUSTES MEDIDOS uno a uno**: aire sobre el logo −12,7 % (31,5 → 27,5), del logo a su regla −19,8 % (35,6 → 28,5), «Esta semana» +15,8 % de aire arriba, la tarjeta de Repetir de 98 a 117 px, el logo un 20 % mas pequenio (216,9 → 173,4 de ancho) y el ultimo logro centrado, en peso 400 y tinta secundaria. **EL «+» DE AGUA DESAPARECE**: era un segundo objetivo en una celda de 117 px **y pisaba los ocho vasos 17,2 px**; ahora la celda entera suma el vaso y su etiqueta dice lo que hace. **TRES DEFECTOS QUE ESTABAN PUBLICADOS**: la tarjeta de accion **no era clicable entera** (el objetivo eran 74 x 23 px de 243 x 117, porque el patron de s174 necesita un `::after` y **React no crea pseudo-elementos desde un estilo en linea**), la miniatura del logro renderizaba a **16,1 px** y la semana decia **«1 dias en ritmo»**. **Y EL METODO SE COBRO UNA**: al retirar el CSS del «+», el corte se llevo por delante la regla del `::after` -- **la cazo su propio test**, escrito veinte minutos antes, probando las cuatro esquinas y el centro. El ultimo logro **recupera su rotulo**: en el pie «se entendia raro», y era el mismo problema que el hueco del final. Orden nuevo: Hoy → Continua → Ultimo logro → Esta semana. **171/171** (eran 153), 3 tests nuevos. | s180 | [session-180](./docs/sessions/session-180-la-sidebar-como-brujula.md) |
| **v0.111.0** | 2026-09-01 | feat(sidebar): **la sidebar como brujula, y el margen transparente que tapaba una compresion** — Primera mitad de un brief largo (sidebar + CTB musical); **CTB queda FUERA DE v1** por decision del usuario y el ROADMAP no se toca. La sidebar deja de informar y pasa a responder cuatro preguntas: que he hecho hoy, que puedo continuar, como va la semana y cual fue mi ultimo logro. **SE APROBO MIRANDOLA** (nueve variantes sobre cajas a medida real) y ahi el usuario eligio: logo al 80 %, Hoy en rejilla 2x2 con glifos y centrado, y la tarjeta que **solo puede decir CONTINUAR o REPETIR** — nunca «prueba esto». **EL LOGO: 716x471 DE LIENZO PARA UN DIBUJO DE 488x194** (93,53 % a alfa 0). Puesto en la banda gastaba **178,3 px de los que 104,9 eran aire**, y de regalo la banda **ya se comprimia 7,3 px** con la imagen desbordandola **13,7** — invisible **porque lo que desbordaba era transparencia**. Se recorta **por CSS y no con un archivo nuevo**: el `<img id="pace-logo-src">` lo leen DOS consumidores y un segundo PNG son ~100 KB de base64 en el artefacto. **LOS GLIFOS NO HUBO QUE DIBUJARLOS**: pulmones, mancuerna y gota son los de `ActivityBar.jsx`, que el BreakMenu ya reutilizaba desde s105. El unico nuevo es `ABFocus`, y faltaba porque en la home Foco **es el aro**. **TRES HALLAZGOS QUE CAMBIAN LO ACORDADO**: la rama «CONTINUA» de Camino es **hoy inalcanzable** (`PathRunner` tapa la pantalla y salir llama a `abandonPath()`); el ultimo logro **baja al pie**, porque su seccion costaba ~100 px y con ellos no cabe a 1280x720 con tarjeta; y la celda de Foco **no es un boton** porque no hay nada que abrir. **DOS DEFECTOS MIOS**: el recorte no se aplicaba —los estilos EN LINEA de la imagen ganan a la hoja, el mordisco de s174— y la celda «Respira» **se llamaba igual que el chip de la home**, lo que dejo **15 tests en rojo y ninguno del producto** (arreglado con «Abrir Respira», que ademas es mejor a11y). **Suelo 662** contra los **720 exactos con el espaciador ya a 0** de antes: a 1536x714 la sidebar vieja ya scrolleaba. Movil sin scroll a 390x844 **y a 320x568**. **169/169** (eran 153), con `tests/sidebar-redesign.spec.js` y 3 mutantes que muerden. | s180 | [session-180](./docs/sessions/session-180-la-sidebar-como-brujula.md) |
| **v0.110.0** | 2026-09-01 | fix(runner): **el runner en movil corto, y un umbral elegido mirando un solo lado** — Cierra el bloque que s178 dejo abierto. **EL BANCO DIJO «CERO» Y SU GUARD PIDIO EL CONTROL POSITIVO**: servido el `index.html` de HEAD en un puerto aparte con sus `fonts/` —sin ellas las metricas de texto son otras y la comparacion no vale— la misma sonda solapaba a **1280x575 (4,7 px)** y **360x640 (26,3 px)**, el numero exacto que el diagnostico habia anotado. **EL UMBRAL ESTABA ELEGIDO MIRANDO UN SOLO LADO**: `max-height: 660` salio del viewport que se miraba (360x640), y ampliado el barrido HEAD solapaba a **375x667 — el iPhone SE/8 — con 7,2 px** y a **360x661 con 10,8**, los dos JUSTO POR ENCIMA del umbral y por tanto sin cubrir; 360x680 sobrevivia por **1,9 px**. Es el mismo error de s177, que declaro 641 cuando el borde real era 575. Sube a **700**, que es el breakpoint que la hoja YA usa. **EL BANCO DIJO ARREGLADO Y EL CENSO LO DESMINTIO** (mide UNA rutina y lo declara): a 360x640 quedaban **5 de 19 rutinas y 7 de 79 pasos**, de 16 y 60. **LA CAUSA REAL**: la pantalla de colocacion pinta `[data-pace-v1-num]` y **no** `-timer`, asi que todos los tramos cortos —**los de s119 en escritorio tambien**— comprimian un elemento que ahi no existe. Con el numero correcto y el nombre fijado a **30 px, el suelo que su propio clamp ya declara**, **ninguna rutina solapa** a 360x640, 375x667 ni 360x600. **Declarado y no arreglado**: por debajo de ~575 sigue solapando — lo unico que queda es el glifo y la fuente unica de s177 **prohibe** encogerlo por CSS. **153/153** (eran 150), 3 tests nuevos calibrados en rojo contra HEAD. | s179 | [session-179](./docs/sessions/session-179-el-runner-en-movil-corto.md) |
| **v0.109.0** | 2026-08-31 | feat(estira)+fix(claude.md): **las tres rutinas de oficina, y el documento que mandaba al archivo equivocado** — Segunda mitad de s178. **`CLAUDE.md` tenia las RUTAS cambiadas** en el bloque escrito justo para evitarlo: lo cruzado son los ids y SOLO los ids, y por creerme la ruta un censo midio **Mueve creyendo que era Estira** y devolvio 2 donde la respuesta es 9. **ESTIRA 14 → 17**: `Caderas de pie`, `Cadena posterior de pie` y `Columna en la silla` suben las rutinas compatibles con oficina de **5 a 8** y cubren por primera vez caderas, cadena posterior y columna **sin bajar al suelo**. Salieron de un censo y **no se retiro ninguna**. Cada ejercicio verificado contra su propio `setup`. **La regla §1 mordio**: el dato se troceo en `extra.data.js` + `extra.data.piernas.js` con guard de orden, y `ExtraModule.jsx` baja de 553 a **53** lineas. **La suite lo cazo con SIETE rojos y ninguno era el producto.** Respira NO se toco: el usuario eligio C y C era **lo ya publicado**. | s178 | [session-178](./docs/sessions/session-178-la-auditoria-completa.md) |
| **v0.108.0** | 2026-08-31 | docs(auditoria)+fix(sw+vuelo): **la auditoria completa** — El encargo del usuario abre s178. Cinco preguntas cruzadas contra el codigo con dos checkers calibrados en rojo: **trece hallazgos con evidencia `file:line`, once cerrados en la misma sesion**. **EL PAPEL IBA POR DETRAS Y SIEMPRE HACIA EL MISMO LADO**: los cuatro marcadores desfasados del ROADMAP pintaban **MAS** trabajo del que hay — la Fase 3 «EN CURSO (s155)» con los emisores en **v0.102.0** y la retencion corriendo desde s174; la ola B decia **20 dibujos** y son **3**; el arte de logros decia **58 de 96 / 38** y es **77 de 96 / 19**. **`privacy.html` se habia tocado UNA vez en toda la vida del proyecto** (v0.46.0) y llevaba el absoluto que s151 prohibio: reescrito en ES y EN **y fechado**, porque la pagina promete que su fecha cambia con ella. **EL VUELO NO ESTABA INERTE** — `main.jsx:153` lo llamaba en cada sesion, clonaba un nodo y gastaba 24 frames buscando un destino que s175 se llevo: borrado en sus dos sitios. Guard de metodo en `sw.js` (dos `cache.put`, ningun `.catch()`). La tabla de deuda **mentia en 10 de 14 filas** y pierde su columna de numeros. **El instrumento mintio SEIS veces.** | s178 | [session-178](./docs/sessions/session-178-la-auditoria-completa.md) |
| **v0.107.0** | 2026-08-31 | fix(runner+stats)+feat(musica): **lo que no se oia** — Cuatro bloques, los cuatro salidos de lo que el usuario vio y oyo al probar (van **cuatro sesiones seguidas** reproduciendo). **EL RUNNER SE CONGELA**: el «Cuidate» se metia **15,0 px dentro de la barra en 11 de 47 pasos** —causado por el anclaje de s176, que dio al bloque `min-height: 0` y le permite ENCOGER bajo su contenido— y entre pantallas se movian el nombre y la descripcion 26,4 px, el numero **51,2** y su etiqueta 4,6. Ahora **las SIETE piezas a 0,0 px**; el numero unificado a **76** (elegido mirando tres variantes) **ANULA la decision de s112**. «Subir el numero» no se podia hacer moviendolo: arriba 10,0 px, abajo **−15,0**. **STATS**: el modal gastaba 820 de 1536 y «Anio» dejaba **163,7 px muertos** de sus 385; ahora 1240, celda 19 y 52,4 — y **el mes no puede crecer**, medido (421,4 / 474,4 / 527,4 contra 385). **LA MUSICA**, cinco «no se oye» y tres errores de disenio: la ganancia **se iguala por RMS y no por pico**, una pieza con el **82,6 % de su energia bajo 200 Hz no sale de un altavoz de portatil**, y **el criterio con que la elegi estaba invertido**. **150/150 · 6 de 6 mutantes muerden.** | [177](docs/sessions/session-177-lo-que-no-se-oia.md) | [ver](#v01070) |
| **v0.106.0** | 2026-08-27 | fix(respira+runner+stats): **los cuatro sitios donde el usuario tenia razon** — Probo v0.105.0 y trajo cuatro defectos: **los cuatro reproducen**, a 1536x714. **RESPIRA RECIBE LA PANTALLA**, lo que **anula «comparte la tarjeta y no la pantalla» (s174)**: aquella razon era cierta —se ordena por TIEMPO y no por contexto— y la consecuencia no, porque sin pantalla propia sus 20 tarjetas caian en el flujo del modal a **810 px de ancho para llevar ~380 de contenido**, con el sello a **700 px del nombre**, y gastaban **3,90 pantallas de scroll contra las 3,82 de la biblioteca ANTERIOR al redisenio**: el redisenio se llevo el ancho y **no cobro nada**. Seis variantes pintadas en iframes reales; elegida **C** (rail). Ahora: modal 1240, rejilla de 3 x **288 px**, **1,98 pantallas**, y en movil estrena chips que nunca tuvo. Es **menos codigo**: `LibraryShell` se parametriza con cinco props que traen el valor de cuerpo por defecto. **Dos hallazgos de la maqueta**: el tercer chip («Sin rondas») era un **SUBCONJUNTO ESTRICTO** del segundo —quita las tres que «Sin retencion» ya quita— y se cayo antes de cablearse; y la sugerencia del dia salia **`Kumbhaka 1:4:2`**, apnea avanzada, premium y con modal de seguridad, porque el pozo de cuerpo **no descarta nada** en Respira. **«TUS RUTINAS» SE SALIA 18 px** del rail: rejilla con minimo de **260 px** en un hueco de **242**, y un minimo **no encoge** (chips en 428,93, ella en 446,21). **LA VOZ GANA INTERRUPTOR Y HERMANA**: `bradford` medida **abriendo el archivo** (onda decodificada, umbral −50 dBFS, con `sulafat` de control reproduciendo **0,003 / 0 / 0** de diferencia) — palabra **0,911 · 1,218 · 3,572** y **~121 Hz** contra los ~193 de `sulafat`, asi que cabe en **14 de 20** donde la otra cabe en 17. **El 14 casi lo digo mal**: el test lo puso rojo con **12** porque exigia que las tres senales cupieran en la fase MAS CORTA, y el producto decide **senal por senal** — los dos modelos coinciden en `sulafat` (17 y 17) y se separan en `yin` y `nadi.shodhana`. El bloque de Ajustes pasa a **DOS decisiones y no cinco interruptores** (variante V3, elegida mirando): *que marca la fase* (Tono|Voz→Clara|Grave) y *que suena detras* (Nada|Ambiente); no es orden, **es lo unico que describe el mecanismo**, porque `playSound` sintetiza **solo si la voz no cabe**. **EL RUNNER**: la barra de progreso **fluia**, asi que caia **47,2 px mas abajo** en el ejercicio que en «colocate» y se metia **15 px dentro del pie**. Anclarla no basto —el bloque se centra con `margin:auto` (s112), asi que `auto` la pegaba al fondo del BLOQUE: 18 px de hueco contra 52— y hubo **segunda vuelta por especificidad**: cuatro tiers fijan su `margin-top` con `!important` y gana la ultima regla del archivo. **Y el hueco del contador no era un margen**: la caja decia 10/10, pero debajo de la descripcion habia **una linea vacia reservada** (s119) que **s172b ya habia dejado obsoleta y lo dice en su propio comentario**. Quitarla pago el anclaje **sin tocar el numero** (sigue en 104 px): **586,5 px en las dos pantallas**, y a 360x730 de **−29,5 a −1,5**. **STATS**: el modal saltaba **163,2 px** entre pestanias y dos de las cuatro tenian scroll → **0 px y ninguna**, con el suelo puesto en **lo que cabe** (385) y el calendario compactado (48→42 px, celdas vacias incluidas — se quedaron en 48 y por eso la primera pasada solo recupero 30 de 36). **SEIS MENTIRAS DEL INSTRUMENTO**, y la mejor: **«dos lecturas iguales» no es esperar a un modal** —la curva se aplana y coinciden a mitad del fundido—, asi que el aserto de Stats salio **rojo con la app ya arreglada**; ahora `getAnimations()` pregunta en vez de estimar. Ademas: un `</script>` dentro de un bloque de datos dejaba **seis iframes vacios sin un error en consola**, y el primer guard **no podia cazarlo**. **Deuda de documentacion pagada**: la fila de voz de `DECISIONES_TECNICAS_VIGENTES` llevaba las cifras que s175 **descarto** —y es la que el handoff mandaba leer—, `CLAUDE.md` describia **Mueve y Estira al reves**, y el ROADMAP daba «6 de 20» para las dos voces cuando son 3 y 6. **Briefs de musica** por familia, con los numeros del catalogo: **Pranayama no cabe en una sola pieza con pulso** (2,1 a 30 respiraciones/min). **146/146** (+10) y **12 mutantes, 12 muerden**. | 176 | [session-176](docs/sessions/session-176-lo-que-el-usuario-probo.md) |
| **v0.105.0** | 2026-08-27 | feat(voz+bibliotecas): **la voz de Respira, y los cuatro defectos que el usuario vio antes que yo** — El handoff traia «el arte y Respira»; el usuario mando **cuatro defectos de la biblioteca vistos en la app publicada** y pasaron a ser el trabajo. **Los cuatro reproducen, y el dato que faltaba era su pantalla**: 1920x1080 **al 125 % de escala son 1536 CSS px**, y a 1920 no reproducia. Huecos del rail **11/25/0/11** — y el cero **no era un valor mal puesto**: la regla da aire a lo que sigue a un rotulo y «Tus rutinas» es el unico bloque que **no lleva ninguno encima**, asi que se caia del selector. El rail era static con la caja estirada a **1250 px** sobre **566** de contenido: con el scroll al fondo quedaban **144 px de rail y 697 de columna vacia**. **Se pintaron ocho variantes en iframes de 1536x714 reales**, con las tarjetas de produccion y el CSS extraido de la hoja real, y **cada marco midiendose a si mismo** — de ahi salio lo que no se ve razonando: **dar aire EMPEORA el recorte** (de 22 px a 48), asi que «mas aire» y «que quepa» no caben juntas con dos sugerencias. Entregado **A2** (rail sticky, aire igual, **una** sugerencia): huecos **11/25/25/11**, recorte **0**, **481 px de rail intactos** al fondo. Y **una sugerencia en las DOS pieles** porque lo que sube se RETIRA del catalogo: pintar dos en movil y una en el lateral dejaria la segunda **sin aparecer en ninguna parte**. **EL PREPARATE PIERDE EL GLIFO** por decision del usuario, y con el **se cae la transicion de s174**: aquel circulo era su UNICO destino, asi que el vuelo se retira solo y library-transition.js queda **inerte** (130 lineas, con un test que vigila que no deje rastro). Las tres bibliotecas comparten ya la preparacion de Respira. **ENTRA LA VOZ**, lo que **anula «Voz/TTS: NUNCA»** —cuatro filas marcadas SUPERSEDED por s175 y tres sitios del ROADMAP—, y **el numero costo tres intentos**: por cabecera MPEG «14 de 20» (daba **casi la mitad** de la duracion real), por audio.duration «8 de 20» (correcta pero **incluye los silencios**) y, tras el apunte del usuario —«calcula lo que dura la palabra, el audio tiene colas»—, **17 de 20** midiendo los extremos de la onda. El «exhala» ocupa **4,96 s de archivo y la palabra acaba a los 2,12**. La misma equivocacion las dos veces: **medir el contenedor en vez del contenido**. De paso destapo un defecto que no habia visto: **0,65 s de silencio inicial** hacian que la senal llegara tarde. La decision es **por FASE y no global** y la disponibilidad se sabe **por precarga**, porque play() es asincrono. Fuera quedan solo las tres de bombeo. **Auditoria integral** en audit-integral-s175.md. **136/136** y **10 mutantes de 11 muerden** — el que no, retirado con su porque, y corregido el comentario que afirmaba lo contrario. | 175 | [session-175](docs/sessions/session-175-la-voz-y-lo-que-el-usuario-vio.md) |
| **v0.104.0** | 2026-08-27 | feat(librerias): **las tres bibliotecas, implementadas — y la transicion que no existia** — s173 dejo el rediseno aprobado y sin una linea de codigo. Se cierran **las siete decisiones abiertas preguntando primero**, y el usuario amplia su regla de continuidad: **«dame SIEMPRE ejemplos en html para que pueda decidir»** — no basta con maquetar lo que se va a implementar, **toda opcion que yo proponga tiene que estar pintada antes de preguntar**. Nacen `library-rules.js` (reglas puras, asertables sin navegador), `library.css.jsx`, `RoutineCard.jsx` (sale de `BreatheLibrary`, donde vivia desde s34) y `LibraryShell.jsx`; Mueve y Estira quedan en 17 y 16 lineas de biblioteca. **SEIS numeros no cuadraban con lo dado por sabido**: «14 patrones» son **13 motores / 19 ritmos**; el sello de seguridad son **6** rutinas y no 5 (Kapalabhati no es apnea); las «12 premium» son 12 **solo si Respira se queda fuera** (19 en total); **1 de 28 capitulares no tiene arte** y en Mueve la media por tarjeta es **2,9** contra 5,1 en Estira; el estado vacio que ocurre es el **GRUPO** y no la biblioteca (`caderas` 0 de 5, `flujos` 0 de 2); y «Corto» a ≤3 min **quita dos rutinas de 14 en Mueve** — de ahi el **umbral relativo con su numero en el chip** (≤2 en Mueve, ≤4 en Estira). El **glifo como filtro** se descarta con dato: **84 %** de las identidades de Mueve sale en **una sola rutina**. **LA MAQUETA MENTIA SIN QUERER**: se dibujo sobre un marco de telefono a pelo y la biblioteca es un **modal**. Ancho util a 360: aprobado **328**, real **286** — y eso subia el scroll de las 3,50 pantallas prometidas a **4,33**, casi lo mismo que la app de hoy (4,50), o sea que **el rediseno no habria cobrado su promesa**. Recortado el chrome solo de este modal: **310 px y 3,97**; columna de escritorio **242 → 288**. El `!important` **no es pereza**: el padding del modal es un estilo EN LINEA y sin el las reglas no movian un pixel. **Cuatro defectos de mirar y medir**: «**1 SERIES** · 5 REPS» (dos rutinas de Estira tienen un UNICO paso de reps entre cuatro y cinco ⇒ la linea exige **dos series**, **10 de 28 → 8**); el separador **se comia su espacio** por ser `::before` de un flex item y **abria renglon** al partirse la linea; **`role="button"` en la tarjeta tumbo 9 tests** porque vuelve **presentacionales a sus descendientes** y el nombre dejaba de ser encabezado (reescrita al patron correcto, y gana teclado, que `Card` nunca tuvo); y **el grano se aplicaba dos veces** (0,011², invisible) — lo destapo el verify quejandose de un `const`, con lo que **el aviso era de ambito y el defecto de composicion**. **LA TRANSICION QUE EL DISENO DESCRIBIA NO EXISTE**: entre la capitular y el circulo del runner hay **DOS pantallas** y el circulo **tarda 3.114 ms** en existir. Se pintan los dos destinos posibles y el usuario elige **la cuenta atras**, que ademas es donde el circulo va a aparecer — y de paso deja de ser **un numero sobre nada**. Ponerlo ahi **introdujo un salto de 171 px (escritorio) y 221 (movil)**, porque el runner ancla arriba (s172b) y la preparacion se centraba: con el mismo anclaje, **salto 0**. **Y una duplicacion engano SEIS veces** (la copia oculta de «Para ahora»): cinco a las sondas y **la sexta al codigo que se publica** — en movil no volaba nada. La quinta se arreglo **moviendo el nodo**, no la sonda. **Se programa la RETENCION por calendario** (§12, 120 d), implementada y sin disparar desde s155: `eventsWebPruneByCalendar`, **una vez por arranque tras `loadState`** (y no en el rollover, que es sincrono), reutilizando las tres piezas que §12 nombraba y **sin escribir si no hay nada que podar**. **Tres nombres del catalogo** pierden su coletilla (`Cuello · 3 min`, `Hombros · 5 pasos`, `Caderas · 5 pasos`): decian lo que la tarjeta ya dice, y el primero ademas la contradecia. Los ids no se tocan. **131/131 tests** (+16) y **16 mutantes, 16 muerden** — con cuatro lecciones del calibrado: la linea de grupo vacio **mentia** si «Para ahora» subia sus rutinas, un guard de cero estaba **por biblioteca** cuando Estira no tiene ninguna rutina con dos series, comparar el JSON **no prueba** que no se escriba (se espia `setItem`), y dos asertos **pasaban por carrera**. | 174 | [session-174](docs/sessions/session-174-las-librerias-implementadas.md) |
| **v0.103.0** | 2026-08-25 | feat(glifos+verify): **la ingesta deja de ser todo-o-nada, y el arte de ejercicio gana su red** — Entran **4 dibujos** (`Fondos en silla` ahora CON silla, `Onda espinal`, `Puente isquio a una pierna` y `Deslizamientos en pared`): **57 → 59 de 62**, y la cola baja de 7 a 3. Pero no entraban: el `--seco` daba **62 identidades, 102 PNG, 0 emparejados** —los originales llegan con nombre opaco y el emparejamiento es por slug— y renombrando solo esas cuatro el mapa **se reescribe entero** y las otras 57 desaparecen. La via de s171 (emparejar por CONTENIDO) **no sale limpia**: peor pareja **0,383** contra el 0,849 de entonces. Nace **`--fusionar`**: las identidades que no vienen en la carpeta CONSERVAN su fila, con la escritura y la fusion en `ingest-glifos-ejercicio.mapa.js`. **Lo que no se relaja**: una fila conservada tiene que apuntar a un archivo que exista o **aborta sin escribir nada**; un mapa sin **ni una** fila reconocible es fallo explicito; y un PNG huerfano sigue siendo salida 1. **El codigo de salida cambia de significado en la otra mitad**: con fusion, «identidad sin dibujo» ya no es un fallo sino el estado normal mientras la cola no este vacia — un exit code que siempre vale 1 es un exit code que se aprende a ignorar. Control medido: sin la bandera, **58 identidades «sin dibujo»** y el mapa en 4 filas; con ella, **3 y 59**. Calibrado con **tres mutantes** del modulo, cada uno con su rojo y solo el suyo. El script llego a **511 lineas** y el censo salio a `.censo.js` (regla §1), lo que obligo a **redeclarar `ROOT`** — el modo de fallo de s144 por otra puerta, y ahi el verify no mira porque su analisis de ambito es del artefacto. **NACE `verify.mascaras.js`**: el arte de ejercicio **no tenia ni una comprobacion relacional** (el precache cruzaba solo con el mapa de LOGROS), y `--fusionar` abre un fallo MUDO — una fila conservada sin archivo hace que el glifo caiga a su SVG viejo y el usuario vea **otro ejercicio**, sin un error en consola. Cinco relacionales en los dos sentidos, **los cinco calibrados en rojo**, y el **guard de cero** justifica a los otros cuatro: con el mapa vacio las cuatro cruzaban conjuntos vacios y salian **VERDES**. `CENSO.precache` **219 → 223**. Y la ficha de `descanso.png` **estaba mal desde hacia dos sesiones**: pedia una silla, y medido, **11 de los 18 descansos ocurren en rutinas `standing`** — una silla contradice 13 de 18. | 173 | [session-173](docs/sessions/session-173-fusionar-y-las-librerias.md) |
| **v0.102.2** | 2026-08-21 | fix(eventos): **las dos decisiones del emisor, decididas y escritas en el esquema** — Las dos decisiones que s172 tomo porque el esquema no las cerraba **pasan a estar decididas POR EL USUARIO y escritas en el esquema** (rev. 6), asi que deja de haber desviacion que recordar. **Foco emite `focus`**, una sola identidad: la duracion ya viaja en `plannedSeconds` y los cuatro cubos de `focus.<minutos>` **no tenian consumidor** — «que te ayuda» agrupa por `routineId` y en Foco NO se pide feedback (`SessionFeedback` solo se monta en Respira, Mueve y Estira). **Respira sin rondas mantiene `routine.min x 60` `declared`** —es el numero contra el que corre el motor, no una estimacion— y la fila que le faltaba a §6.4 **se escribe**, con las tres familias separadas y el limite de las rondas dicho: ahi la retencion la suelta el usuario, asi que su plan queda por debajo del activo real. El aserto que fija la identidad de Foco vive sobre la funcion PURA, porque conducir un bloque entero costaria 25 minutos virtuales; calibrado en rojo devolviendo `focus.<min>`. | 172c | [session-172](docs/sessions/session-172-el-emisor-y-los-dos-mapeos-al-reves.md) |
| **v0.102.1** | 2026-08-20 | fix(runner): **el circulo deja de moverse a cualquier altura** — El bloque del runner se ALINEA ARRIBA, y con eso el circulo deja de moverse a CUALQUIER altura de viewport. El anclaje en vh de s171 era un ACANTILADO: funcionaba por encima de sus suelos (780 movil / 880 escritorio) y con UN PIXEL menos se apagaba entero — 61 px de salto a 1280x879 y 53 a 360x730, que son los dos viewports REALES del usuario, y por eso lo seguia viendo en su portatil y en su telefono. La causa vive un nivel mas arriba de donde s171 y s172 la buscaron: `centerBody` centra con `margin:auto` (s112) un bloque cuya ALTURA VARIA con el contenido, asi que el centrado reparte una holgura distinta en cada pantalla; el footer (89 -> 39 px) es UNA de las fuentes de esa variacion, no la unica. Se anula el margen SUPERIOR y se conserva el inferior —acotado al runner v1 con `:has()`, y con `!important` porque el margen es un estilo EN LINEA—, asi que la holgura cae debajo, que es donde s171 la queria. Medido en **8 viewports: 0 px en los ocho**. Y los **3 px que aun movian el NOMBRE** eran la reserva del rotulo vacio (1.2em) contra el rotulo lleno con interlineado normal (~1.45): se fija `line-height: 1.2` y las dos formas miden lo mismo por construccion. **El trinquete baja de 30 a 0.** El CSS del runner sale a `MoveSessionV1.css.jsx` (el support rebasaba las 500 lineas: trocear, no recortar comentarios), y la trampa de los **backticks dentro del template literal** volvio a morder **tres veces** en este mismo cambio, dos de ellas con la salida del build silenciada. | 172b | [session-172](docs/sessions/session-172-el-emisor-y-los-dos-mapeos-al-reves.md) |
| **v0.102.0** | 2026-08-20 | feat(eventos+runner+glifos): **el emisor, y dos mapeos que estaban al reves** — cierra el **PASO 2 de la Fase 3**: los cuatro tipos de `pace.events.v1` ya se emiten (`session.completed` en los cuatro modulos, `feedback.answered`, `path.step.completed`, `path.completed`) en **dual-write**, con el emisor en `app/state-events.jsx` — en la capa de estado y **fuera de `app/events/`**, porque el gate de `verify.eventos.js` define «emisor» justo asi y escondido dentro habria seguido diciendo «sin emisores» con emisores puestos. **EL MAPEO DE `kind:'body'` QUE TRAIA EL PLAN ESTABA AL REVES EN LOS CINCO CASOS QUE EXISTEN**: `move.neck.3`, `move.hips.5`, `move.atg.knees` y `move.chair.antidote` viven en `EXTRA_ROUTINES` y `extra.desk.pushups` en `MOVE_ROUTINES` — los ids son historicos (s15) y no dicen de que modulo son; ahora se pregunta a `resolveBodyRoutine()`. Con el prefijo, los eventos habrian salido con el modulo cambiado **sin romper nada**. El `runId` se genera al emitir y se recuerda en memoria (§7.2): **cero lineas** en los runners, y el feedback correlaciona solo si su rutina es la de esa sesion. **7 tests y 10 mutaciones**, con censo relacional del mapeo contra el catalogo entero **y prueba negativa**. **EL DESCANSO VUELVE A TENER CIRCULO**: el glifo iba dentro de un `{!isRest && ...}` y en el paso **mas repetido de la app** (18 apariciones) no es que se moviera, **desaparecia**; R5 se respeta por color y no por ausencia. Al medirlo se cayo la causa escrita de la deuda de s171: los ~25 px **no** son el gate «ready» sin contador, es el **FOOTER** (89 → 39 px, el centro crece 50 y el bloque centrado baja la mitad). **LOS 15 POR LADOS ENTRAN COMO ESPEJO** —`scaleX(-1)`, cero dibujos nuevos— y solo **12** pueden recibir lado: `90/90`, `Elevacion de talones` y `Sentadilla bulgara` no tienen ni un paso `perSide`. Y los **dos prompts de arte pedidos eran la MISMA pieza**: las 12 apariciones de «Respira.» son todas de `Descanso`. | 172 | [session-172](docs/sessions/session-172-el-emisor-y-los-dos-mapeos-al-reves.md) |
| **v0.101.0** | 2026-08-19 | fix(runner+glifos): **el circulo del glifo, y los dos dibujos que sobraban** — tres defectos visuales que reporto el usuario, los tres **medidos antes de tocar**. (1) Las **miniaturas del preview se pisaban 5 px**: `ExerciseGlyph` multiplicaba el tamaño **×1,5 por dentro**, asi que la lista reservaba 30 px y recibia 45 mientras los 41 SVG, que si respetan la caja, quedaban limpios; ahora `maskScale` es **explicito con defecto 1** —la caja que se pinta es la que el llamante reserva— y la variante `.min` se elige por los pixeles que se **pintan**, no por los que se piden (el preview pedia la de 30 y la dibujaba a 45). Medido: **9,6 px de aire**. (2) El **circulo media 72 px en 6 rutinas y 179 en las otras 22** en el mismo viewport, porque unas corren en el runner **legacy** y otras en el **v1**: el legacy pasa a la curva de v1 y a su `clamp(30px, 6.5vh, 52px)` — su nombre de ejercicio estaba a **56 px fijos**, que era el «letras muy grandes» del reporte. (3) El circulo **se movia 43 px entre pasos en MOVIL**, porque las reservas de altura que lo anclan existian **solo para ≥641 px** desde s119; se aplican a las **dos pieles** y el desborde que aquella sesion temia **no reproduce**: 0 px a 360×640, 375×812 y 390×844. Ademas el circulo **crece un 30 % en escritorio** (198 → 257 a 1440×900, **0 px de desborde**: cabia en el hueco que ya habia), con el factor **despues del clamp** y la piel leida del contrato `--pace-skin`. Nace `tests/runner-circulo.spec.js` — **8 tests, los 8 calibrados en rojo** y **sin un solo numero de pixeles dentro**, porque el defecto no era un tamaño equivocado sino **dos superficies que no coincidian**; la primera version corria solo a 1280×720 y **habria pasado en verde antes del arreglo**. Revision del arte: las **47 mascaras miradas una a una**, **cero mal asignadas**, y las **2 piezas sin identificar de s170 resueltas emparejando por CONTENIDO** (la numeracion de aquella hoja no es reproducible) — son tomas alternativas, no identidades nuevas. **Faltan 10 muebles, no 5**, y `Puente torácico` no es un mueble que falta sino **otra postura**. **SEGUNDA MITAD**: entra la **segunda tanda de arte** — 18 dibujos que suben el catálogo de **47 a 57 identidades** (10 nuevas + 8 reemplazos por el mueble), con los **39 viejos recuperados emparejando por CONTENIDO** porque la ingesta reescribe el mapa entero y la numeración de s170 no es reproducible (peor pareja **0,849**); 0 piezas fuera del círculo, `precache` 199 → 219. Y **el bloque del runner declara alto mínimo** (70vh móvil / 72vh escritorio, con suelo **medido** de 780/880 px) con el rótulo de fase reservado vacío: el círculo y el nombre pasan de moverse **43–94 px a 0** entre pasos de trabajo. Queda **~25 px cruzando fases** por el gate «ready», que no pinta contador — **asertado con trinquete de 30 px, no anotado**. | 171 | [session-171](docs/sessions/session-171-el-circulo-del-glifo.md) |
| **v0.100.0** | 2026-08-19 | feat(eventos+glifos): **el tiempo activo de Mueve, y el arte anatomico entra de verdad** — cierra el **PASO 1 de la Fase 3**: `useActiveClock` compartido da a Mueve/Estira la contabilidad de pausa que Respira tiene desde s98, con la politica de §6.4 aparte y pura (`v1TrabajoActivo`) y **4 mutaciones que muerden**; medido, activo 120 s contra 220 de pared. Las **cuatro decisiones abiertas del handoff las contestaba `EVENTOS_SCHEMA.md`** y tres de mis respuestas deducidas estaban mal. Entran **47 de los 61 glifos de ejercicio** como arte anatomico del usuario, y con ellos cinco defectos: el precache de la ingesta de s166 escribia `./` donde el resto de `sw.js` usa `/`; **`sharp` reordena sus operaciones** (`extend` va DESPUES de `resize`, y el relleno lateral convertia el dibujo en **rayas diagonales**); la **trampa de canales TRES veces**; y **dos umbrales de tinta distintos** que dejaban material fuera del encuadre y dentro del dibujo. El **encuadre se corrigio tres veces mirando**: caja → masa → **circunferencia minima**, que resuelve a la vez «esta descentrado» y «es pequeño» porque minimizar el radio ES maximizar el dibujo dentro del disco (**+17,7 % de area**, mismo tamaño optico por construccion). El **detector de rojo se comia el trazo** —la tinta es sepia y el 39-43 % de lo marcado era lum<120—, arreglado con suelo de luminancia (**+208 %** de trazo firme en el peor caso). Y la **miniatura gana archivo propio** (`.min.webp`, trazo engordado antes de reducir) porque a 30 px no es cuestion de ajustes. El test de glifos **caduco dos veces en la misma sesion** y se reescribio para no nombrar ninguna pieza. | 170 | [session-170](docs/sessions/session-170-tiempo-activo-y-arte-anatomico.md) |
| **v0.99.1** | 2026-08-18 | feat(eventos): **el backup lleva `pace.events.v1`, y lo devuelve** — **condicion de entrada de la Fase 2**, puesta **ANTES que el primer emisor** para que el gate del `verify` no pille a nadie a mitad de camino. `privacy.html` promete exportar «**todo** tu estado ... e **importarlo** en otro dispositivo», y eso era cierto solo mientras el contenedor estuviera vacio. **No bastaba con exportarlo: el import lo TIRABA**, con su razon escrita al lado —«un backup de PACE no trae seccion de eventos»— y por eso reiniciaba el contenedor para evitar la MEZCLA de §17. Esa frase caduca el mismo dia que exista un emisor, asi que **las dos mitades se mueven juntas**: exportar historial que al restaurar se descarta seria **peor** que no exportarlo. Ahora el backup gana una seccion `events` **hermana** de `state` —y no dentro, porque son dos almacenes con ciclos de vida independientes y mezclarlos en el JSON invitaria a escribirlos como si fueran uno—, y el import tiene **tres caminos**: **CON seccion** reemplaza por completo (sin merge, sin deduplicar, idempotente) · **SIN seccion** reinicia como siempre, que es todo backup anterior · y **seccion CORRUPTA aborta el import ENTERO**, incluido **no escribir `pace.state.v2`**, que ni siquiera es de este subsistema — el fallo tentador es descartar la seccion mala y «al menos salvar el estado», y eso deja al usuario con estado nuevo e historial ajeno. La validacion vive **en la barrera** y no en el llamador, porque es quien puede garantizar el «antes de tocar nada»; y si el proceso muere entre la escritura legacy y el paso 3, la recuperacion del marcador **reinicia** en vez de reemplazar: se pierde el historial importado, no el del usuario. **3 asertos nuevos (92 -> 95) y los 3 calibrados en rojo**, el primero leyendo **el archivo que el navegador descarga de verdad** y no el objeto que lo construye. **DOS CORRECCIONES AL INSTRUMENTO**: el aserto de «no se toco el estado» comparaba `pace.state.v2` **entero** y **salio rojo con el producto SANO**, porque la app normaliza y re-persiste su propio estado al arrancar —comparar un documento que la app tambien escribe no es comprobar que el import no escribio—, y dos de las tres esperas aguardaban **solo el desenlace bueno**, dando timeouts mudos con el producto roto en vez del aserto que explica que paso. **Y UNA TRAMPA PROPIA, CARA**: el primer script de calibracion restauraba las mutaciones con `git checkout`, pero la linea base de esos archivos **no estaba committeada** — los devolvio a HEAD y **borro la implementacion entera**, con los tres tests en rojo por ausencia de producto. `git checkout` restaura al **ultimo commit**, no a como estaba hace un minuto | 169 | [abajo](#v0991----2026-08-18----feateventos-el-backup-lleva-paceeventsv1-y-lo-devuelve) |
| **v0.99.0** | 2026-08-18 | feat(movil): **la pill vuelve a movil, y el censo que miraba el sitio equivocado** — sesion **cortada por limite de tokens** y cerrada en una pasada posterior: de las cuatro decisiones de s168 se implementan **dos** —A y C— y **D** (el `apt` del CI) queda **decidida y sin hacer**. Foco/Pausa/Larga vuelve a verse en movil, en **su propia fila y arriba**. El arreglo no es «dejar sitio»: `[data-pace-tabs]` es `position:absolute` centrada, o sea **fuera de flujo** —no empuja, no encoge, solo puede **solaparse**, e identico de 568 a 932 px de alto—, asi que se la **saca de la fila de los iconos** con `align-items: flex-end` y `padding-top: calc(10px - 4px * squeeze + 42px)`, recentrandola **solo en X** porque el `top: 50%` de una fila que ahora mide 102 px la dejaria encima de ellos. **Va ARRIBA y eso no es estetico**: el DOM la tiene **antes** que los iconos, asi que ponerla debajo haria que el foco recorriera la topbar **de abajo arriba** (WCAG 2.4.3, el defecto que s160 arreglo en la home) — y **ninguna prueba se habria enterado**, porque `home-a11y.spec.js` filtra a `[data-pace-home-stack]` y excluye la topbar a proposito. **EL GATE TIENE DOS SUELOS Y CADA UNO SALE DE UNA MEDIDA DISTINTA**: **alto >= 760** por el **aro** —la fila propia cuesta **+42 px** y salen de el; barrido de 9 anchos x 8 alturas A/B en el mismo viewport: a 736 paga 4 px a 412, 20 a 428 y 30 a 440, y **a 760 es gratis en todos**— y **ancho >= 390** por el **boton de menu**, que vive **FUERA** de la topbar: la pill mide 244 px fijos y va centrada, asi que el hueco es `ancho/2 - 175,5` y a 320 lo **PISA 15 px**, a 360 deja 5, a 375 deja 12 y a 390 deja 20 (el usuario descarto los 12 por justos). **Dos correcciones medidas al handoff de s168**: «alto >= 844» **no era el umbral** —era la siguiente altura que se habia medido— y **«squeeze == 0» no sirve de gate**, porque una media query **no lee custom properties** y ademas vale 0 desde 736, justo por debajo del umbral bueno. **EL DEFECTO QUE SE ESCAPO**: el banco de s168 cruzaba `[data-pace-topbar] > *` y la primera sonda `[data-pace-topbar-icon]`, y **las dos daban cero solapes a 320 px mientras la pill pisaba el boton de menu 15x34 px** — porque ese boton no es hijo de la topbar. Un censo que mira donde no esta el problema **dice «limpio» con la misma cara** que uno que mira donde si. **11 asertos nuevos (81 -> 92) y los 11 calibrados en rojo**, con el aro medido **A/B dentro del mismo viewport** y no contra una constante. De propina, medido y **sin ejecutar** (es la decision D): **`gh` SI esta instalado** —s153 lo dio por ausente y la nota se arrastro 16 sesiones—, y leyendo los logs de los 11 ultimos runs **la cola del CI no era la descarga de Chromium (~10 s) sino `apt` bajando 21,1 MB de FUENTES** (10 min 49 s en el run de 672 s, 3 min 15 s en el de 217, que fue **fallo** de cache), asi que la cache **no puede tocarla** y el comentario del YAML es falso. **C · EL ENCARGO DE GLIFOS**: la decision era mover una fila y al medir por que hacia falta salio algo mayor — el documento decia **«los 38 glifos que faltan»** y ya solo faltan **19**, porque **s167 entrego 19 y nadie volvio a tocar la lista**: quien la abriera para dibujar se encontraria **la mitad del trabajo ya hecho**, sin nada que lo marcara (la misma deriva que s168 cazo en `CONTENT.md`, pero esta se paga en horas de dibujo). Las 19 entregadas quedan tachadas, cruzadas **id a id contra el mapa de mascaras real**, y la cuenta cierra por **biyeccion**: 19 + 19 = 38 filas, cero ids fantasma y cero logros sin arte sin listar. El equinoccio entra de **Prioridad 1** en un hueco que estaba **libre**, porque `hydrate.week.perfect` —su unica fila— tambien se entrego; y su motivo no es el sello suelto (el `⚖` de texto aguanta) sino **el par**, porque `season.equinox.spring` **si** tiene balanza dibujada y son adyacentes en la misma familia. **El propio cruce cazo un defecto mio**: al mover esa fila a una nota dejo de contar, la biyeccion cayo a 37 = 18 + 19 y la cabecera recien escrita seguia diciendo 38 | 169 | [abajo](#v0990----2026-08-18----featmovil-la-pill-vuelve-a-movil-y-el-censo-que-miraba-el-sitio-equivocado) |
| **v0.98.0** | 2026-08-18 | feat(logros+glifos+red): **las familias del catalogo, el farol que se muda, y una pregunta que estaba mal hecha** — **tres cifras** de la documentacion salieron mal al medirlas: el reparto de familias que daba `STATE.md` (gana el handoff: `exploracion` **18** y `secretos` **13**, no 19 y 12) y el **100/92** de `CONTENT.md` contra **96/88** reales; ademas `explore.tweaks` vive en `secretos`, unico id cuyo prefijo no casa con su familia, y ese **no se arregla renombrando** porque los ids si se persisten. **LAS FAMILIAS**: maestria (26) mezclaba profundidad en una practica con habitos de hora del dia, y «estadisticas» (4) se definia por su **procedencia tecnica** —«viene del panel de stats»—, que no es una idea reconocible: de ahi el duplicado de s167. Se parte maestria (**26 → 19**), se disuelve estadisticas y nace **«La jornada»** (9) heredando su color: **siguen siendo 7** y ningun token se reparte de nuevo. **La familia no se invento — el codigo ya la trataba junta**: `checkTimeOfDayAchievements()` desbloquea `master.dawn`, `master.dusk`, `morning.5` y `stats.streak.30` **en la MISMA funcion**, y los dos ultimos comparten la lista `morningDates`, o sea **la misma condicion a dos umbrales** (5 y 30 dias) repartida en **tres familias**. Los tres hitos de calendario van a **constancia** (acumulacion sostenida, hermanos de `focus.hours.*`) y no a estacionales. **«Ritmo» se descarto midiendo**: `stats.title` **es** «Ritmo». «Repertorio» vuelve a **«Exploracion»** (s146 lo renombro sin dejar motivo escrito). **RED**: dos comprobaciones RELACIONALES nuevas —**familia declarada y VACIA** (el panel pinta cabecera y nada debajo) y **`labelKey` sin cadena i18n en los dos idiomas** (pintaria la clave cruda)— con sus **tres rojos verificados**, guard de cero incluido; `chequeaI18n` pasa a devolver las cadenas porque eran dos tandas que no se hablaban. Eso dejo `verify.integridad.js` en **503 lineas** y el verify se puso rojo por su propia regla §1 ⇒ **troceo** en `verify.sandbox.js` (**451 + 78**), eligiendo la costura de la **infraestructura pura** y no la de una tanda. **EL FAROL** deja el equinoccio —el sol y la luna que lo justifican son **ilegibles a 56 px**— y pasa a `stats.streak.30`, donde ese detalle es **bonus** y no argumento. Y **afina el aviso del handoff**: la ingesta cambio **CERO** mascaras viejas (77 → 77, las 76 comunes **byte a byte identicas**), porque el efecto de conjunto viene de cambiar el **conjunto de dibujos**, no de re-correrla; los cuatro numeros del CENSO tampoco se movieron. El equinoccio cae a su glifo de **texto ⚖** justo al lado de `season.equinox.spring`, que **si** tiene balanza dibujada. **LA PILL**: se pidio medir a partir de que ALTURA cabe y la respuesta fue **«no se mueve nada en las 15 combinaciones»** — que no era que quepa, sino que la pregunta era otra: es **`position:absolute`** centrada, esta **fuera de flujo** y no puede empujar nada por construccion. Lo que si hace es **SOLAPARSE** con los iconos: **320** pisa tres (40+40+15 px), **375** dos (40+32), **414** dos (40+12), **identico de 568 a 932** — la altura no interviene —, y solo se limpia **entre 520 y 560 px de ANCHO**. Su propia linea cuesta **+42 px** y ahi el umbral es doble: **667** a 320, **736** a 375, **844** a 414. **El diagnostico llevaba archivado desde s128** y los handoffs no lo arrastraron. **INSTRUMENTOS**: `revision-sellos-tamano-real.js` esperaba 15 s a `[data-pace-home]`, **que no existe**, con un `.catch` que se lo tragaba desde s167; y `revision-glifos.js` duplicaba CAT_META con un fallback silencioso. **CI**: cache de Chromium, pero con su motivo corregido — medido sobre 9 runs, el paso tardo **672 s UNA vez** y 21-28 s las otras ocho, o sea que se cachea por la **cola**, no por 11 minutos por push | 168 | [session-168](./docs/sessions/session-168-familias-farol-y-pill.md) |
| **v0.97.0** | 2026-08-18 | feat(glifos+i18n+logros): **los 19 dibujos, los 96 logros en ingles, y una recomendacion retirada** — entran los **19 glifos de logro** nuevos (**77 de 96** con mascara, quedan 19) y la asignacion la cierra el usuario **mirando** la hoja de contactos. Las dos trampas del handoff eran ciertas pero **medirlas las afino en las dos direcciones**: mas pequenas —lo que la app consume son las `.webp` **committeadas**, no los PNG del archivo de disenos— y mas grandes —el `ABORTADO — no existe el dibujo` vivia **despues** del borrado (305 contra 296), y ese si era el camino destructivo—. Ahora hay **prevuelo**: resuelve las 77 claves antes de tocar nada, probado en rojo (58 huerfanas → exit 1, 58 mascaras intactas). El censo se valida con una **biyeccion**: 91 PNG = 83 `asset_*` (50 ids) + 8 `Premium_*` = **58 dibujos = 58 filas**; y como el lote nuevo comparte slug y solo cambia el timestamp, sus duplicados se descartan por **19 md5 distintos**, no por nombre. La ingesta **modifico 17 mascaras viejas** —por diseno: el peso de tinta se iguala contra la mediana del CONJUNTO— y una sospecha mia de que los nuevos iban apretados **la desmintio la medida** (58,5–86,2 % contra 54,5–85,3 %). **EL INGLES DE LOS 96 LOGROS** cierra el hallazgo abierto desde **s146**: `Achievements.jsx` y `Toast.jsx` leian `a.title`/`a.desc` crudos del catalogo. Van a `i18n/content/` —patch de **solo EN**, que es lo que el propio verify exige—, asi que el castellano no se duplica y el **CENSO de i18n se queda en 515**, corrigiendo una estimacion mia de ~707. **192 claves, biyeccion 96 = 96.** **EL AIRE DE LAS TARJETAS** lo reporto el usuario y a 1280 parecia cosmetico (24,3 px); **medirlo en siete anchos cambio el diagnostico**: a 320 la tarjeta media **283 px con 157 de aire, el 55 % vacia**, porque `aspectRatio: 1/1.15` ataba el **alto al ancho**. Sus dos ideas no lo arreglaban —encoger rompia «Cartografa» (0,6 px de reserva) y **centrar es lo que s147 quito a peticion suya**—, asi que se quita el alto proporcional y la rejilla iguala **por fila**: a 320, de 283 a **127 px**. **Yo recomende primero la opcion equivocada y la retire antes de tocar nada.** Buscando otra cosa salio un **DUPLICADO MEDIDO**: `state-achievements.jsx:278` desbloqueaba «Luna llena» y «Treinta amaneceres» **con la misma condicion**; ahora el segundo mide treinta amaneceres **de verdad** sobre `morningDates`, que ya existia capada a 30. «Curiosidad» pasa a **secretos**. `streak.7` deja de llamarse «Semana vaca» y pasa a **«Cuarto creciente»** (7 dias = un cuarto del ciclo lunar, y enhebra 7→30→365). **EL INSTRUMENTO**: se abaratan los tests de Respira retirando el `waitForTimeout` por segundo (20,9 → 15,8 s, control rojo verificado), pero **no basto** — a 4 workers medi **3 de 3 verde** y **era una ventana afortunada**: repetido, **rojo 3 de 3**, con el reloj pasando de 49 s a 3,1 min. La maquina: **CPU al 6 % y 5,8 GB libres de 15,7** → el cuello es **MEMORIA**, no CPU. A 2 workers, **81/81 dos veces**. Se fija **2 en los dos lados**. **+3 asertos (78 → 81)**, los tres primeros de la suite sobre el **IDIOMA** | 167 | [session-167](./docs/sessions/session-167-glifos-logro-e-ingles.md) |
| **v0.96.0** | 2026-08-18 | feat(retencion+home+glifos): **cuatro frentes y nueve mentiras del instrumento** — la sesion arranca destapando que el `72/72` declarado **no reproducia**: 68 y 70 en dos pasadas, siempre los cuatro tests de bucle de `respira-progreso.spec.js` y siempre por **timeout**, con los que si pasaban en **58,0 s y 59,6 s contra un plazo de 60**. La variable es `workers: CI ? 2 : undefined`, o sea **8 en local**; el control lo cierra: **a 2 workers, 72/72 y al DOBLE de velocidad** (1,0 min contra 2,2). El defecto es del INSTRUMENTO y **queda sin arreglar**, esperando decision. **(1) EL CTA DEL POMODORO** decia «Empezar foco» en Pausa y Larga sobre un reloj que no es de foco: una sola `startLabel` para los dos sitios que arrancan, y **12 casos medidos** —`{foco,pausa,larga} × {es,en} × {claro,oscuro}`— con 0 discrepancias. **(2) LA BARRA DE RESPIRA EN MOVIL CABE**, y de sobra: caso peor 5 rondas a 320 px, **segmentos de 48,8 px** y 100 px de holgura. Pero el primer banco era una **TAUTOLOGIA** —medir «desborda a su padre» cuando la barra es `width:100%` de ese padre—, comprobado saboteando `maxWidth` de 260 a 600 y viendo «0 desbordes» con la barra a 374; rehecho con **control positivo** que cae. **(3) UN SOLO ORDEN DE HOME**, aro → Actividades → Camino en las dos pieles: Actividades hereda el papel de horizonte por el selector de hermano adyacente que s156 ya tenia, y **el lector de `--pace-skin` en JS se retira entero** por quedarse sin consumidor. Se **RETIRAN DOS AFIRMACIONES** hechas al usuario —«el solapamiento pasa de 64 a 54» y «arregla un retroceso de foco a 320»—: la primera era medir a media convergencia (el motor publica mas de una vez) y sale **identica en las 5 vistas**; la segunda, que a 320 la home desborda 8 px y tabular arrastra el viewport. El banco pasa a **consumir la sonda de la suite** en vez de la suya. **(4) EL TIEMPO DE RETENCION**, aprobado en s165 con sus tres condiciones: se guarda como **serie semanal en segundos** (`weeklyStats.holdSeconds`) porque esa escala soporta las seis variantes fotografiadas y la de por vida no, y se pinta como **linea al pie**, que **no aparece si vale cero** —solo 3 de 20 rutinas tienen retencion—. **El banco de mutaciones obligo a cambiar el CODIGO**: M1 no mordia porque habia **dos mecanismos redundantes** tapandose entre si; se quito uno y las cuatro muerden. **(5) EL MECANISMO DE LAS MASCARAS DE EJERCICIO**, montado con el mapa **VACIO** y precedencia sobre el SVG, para que los 62 dibujos puedan llegar **por partes**; la ingesta se corrigio sola dos veces (51 identidades leyendo solo el registro, 62 contando dibujos huerfanos que el encargo dice no rehacer) hasta dar **61 = 61**. **+6 asertos (72 -> 78)**, i18n **511 -> 515** | 166 | [session-166](./docs/sessions/session-166-retencion-orden-y-mascaras.md) |
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

## [v0.114.1] -- 2026-09-04 -- fix(i18n)+docs(audit): el logro que hablaba en espanol, y ocho premisas que ya no eran

Dos entregas y un tercer bloque que **no entra en producto** y se dice: cinco vueltas de
diseno de la Semana de Stats, sin una sola linea implementada porque el diseno no convencio.

### El unico defecto medido que quedaba de s182

Con la app en ingles, la fila del ultimo logro de la sidebar decia «Regresas» en vez de «You
return». Estaba **publicado** desde v0.108.0.

**Por que sobrevivio a s167.** Aquel arreglo enruto por `tR()` las dos superficies que
**entonces** decian el nombre de un logro -- el panel y el toast-- y la sidebar no lo decia:
pintaba cinco sellos **sin texto**, solo dibujo. **s180 los sustituyo por UNA fila con el
nombre** y el hueco se abrio sin que nadie tocara i18n.

`achMini(id, tR)` recibe la funcion por parametro -- es una funcion suelta, no un componente,
asi que no puede llamar a `useT()`. El secreto sigue siendo `'?'`: ahi no se oculta una
traduccion, se oculta el logro.

**Dos asertos nuevos, relacionales y calibrados en rojo con dos mutantes**: `achMini`
devolviendo `a.title` crudo da `Expected "First step" · Received "Primer paso"`, y sacar el
tooltip de `mini.title` muerde **por los dos lados**. Con el primer mutante el test en
espanol **sigue verde**, que es lo que demuestra que el par no se mide a si mismo. El gancho
es del TITULO y no de la fila: el `textContent` de la fila arrastra el glifo cuando es un
caracter. **185 → 187.**

### La auditoria de premisas

Encargo del usuario: «audita todo el proyecto para detectar premisas obsoletas». Se
**reutilizan los dos checkers de s178** en vez de inventar otros, y el trabajo se centra en
la clase que aquellos declararon no poder ver: *una decision cuyo simbolo sigue vivo pero que
ya describe mal lo que el codigo hace*. Ocho hallazgos, todos con evidencia medida:

- **`CLAUDE.md`, el archivo que se lee primero, con cuatro datos falsos**: el arbol de `app/`
  listaba 14 carpetas y hay **19** (faltaban `events/`, `paths/`, `glyphs/`, `main/`,
  `custom/`); `WeeklyStats.jsx` **no existe**; el dato de Estira apuntaba a `ExtraModule.jsx`
  cuando vive en `extra.data.js` + `.piernas.js` -- **tercera vez que ese parrafo miente**, y
  esta vez porque el troceo de s178 lo rompio el mismo dia en que se arreglaba; y «65 tests,
  ~25 s» cuando son **187 y 3,1 min**.
- **LA MAS PELIGROSA, porque alimenta a un generador**: `MUSICA_RESPIRA_BRIEFS.md` pide
  «rango medio despejado (≈200 Hz-3 kHz)» en cinco de sus seis prompts, y la decision de s177
  que GOBIERNA pide **lo contrario** -- «el grueso de la energia entre 200 Hz y 2 kHz»--
  porque midio que aquella restriccion **era la causa** de que la pieza no sonara. No es que
  «falte anadir un requisito»: **hay dos incompatibles vivos a la vez**.
- **`EVENTOS_SCHEMA.md` decia «ninguna parte de este documento se ha cableado»**. Falso desde
  s155: **5 archivos, 1.453 lineas, 4 emisores, 5 specs**. Lo que si falta es su Fase 3, y
  `aggregates` **no aparece ni una vez** en `app/`.
- **Trabajo que ya no hay que hacer**: la vinieta «trocear lo que pasa de 500 lineas» de la
  Fase 8.5 esta **hecha** -- `tokens.css` 613→**322**, `exercise-glyphs.jsx` 513→**261**,
  `Sidebar.jsx` 510→**318**, y de **239 archivos ninguno pasa de 500**. Cayo sola, por el
  trinquete que s162 metio en el `verify`.
- **`CONTENT.md` lleva 77 versiones de deriva** (declara reflejar v0.37.0) y da **Estira a
  14** donde hay **17**. La `AUDITORIA_DOCUMENTAL` §3 sospecho esto en **s130** y lo dejo «a
  verificar»: **53 sesiones despues, verificado y real**.
- **El aserto de Stats esta ciego por su semilla**: `stats-pestanas.spec.js` siembra el estado
  **vacio**, asi que su verde no dice nada del panel con datos -- medido, «Semana» se corta
  **33 px** y «Caminos» de **60 a 146**.
- **«106 logros»** en tres documentos → **96** en catalogo, 88 con detector, **88** el
  denominador de la UI.

**Tanda 0 ejecutada en la misma sesion**: corregidos los cinco documentos. Y se cierra una
duda del handoff de s182: **el CI de v0.114.0 esta verde** (`gh run list`, 4 m 42 s).

### Lo que se decidio de Stats sin implementar nada

**«Hoy» NO entra** -- «ya esta en la sidebar»--, lo que **anula el §4.1 y el §37.4** de
`STATS_DESTINO_PROPUESTA.md` · **la vista no se rehace** (se tiraron tres redisenios
completos ya pintados) · la barra es **cinta escalonada** · el dia es **un arco por tipo de
jornada con relleno** · y **los Caminos no entran de momento**. El defecto de la barra
actual, nombrado: **el valor va en el GROSOR de la linea**.

### Tres trampas medidas

**Mi propia maqueta proponia el defecto que denunciaba**: la primera «Semana» media **432 px**
sobre un suelo de 385. **El banco volvio a fotografiar una animacion a medias** -- «Semana» a
**1192,3** de ancho donde las otras daban 1240, el **96 % exacto** del `scale(.96)` de
entrada; una tabla que se contradice a si misma es la senial. Y **cite el verify en 18,9 s y
al re-medirlo dio 11,4**: oscila con la carga, asi que en `CLAUDE.md` va como rango.

Diario: [session-183](./docs/sessions/session-183-auditoria-de-premisas.md).

---

## [v0.114.0] -- 2026-09-02 -- feat(sidebar)+fix(censo): el cajon de movil encoge tambien

Los tres encargos que el usuario saco de mirar la revision de s181, medidos y
**pintados antes de decidir**, mas su pregunta sobre los glifos.

### A · 375x844 no era un defecto de la app

Verificado y cerrado sin tocar codigo: el cajon llega a `right = 375`, el
documento da `scrollWidth - clientWidth = 0` y **queda 0 px fuera de la primera
pantalla**. El corte era del **carrusel horizontal de la propia pagina de
revision** de s181, que recortaba capturas sin decirlo. Un instrumento que
recorta en silencio manda a alguien a buscar un defecto que no existe.

### B · El aire de la caja «Para ahora», solo en el cajon

Bajo su ultima linea habia **28 px** (16 de `padding-bottom` + ~12 del
descender). Bajar el padding a 8 devuelve **8 px exactos**, y a 428x800 eso mueve
el pie de estar **1,4 px por debajo del borde** a tener **6,6 dentro**.

Va en la hoja y **no** en `sidebarStyles.accion`, que comparten las dos pieles:
en escritorio ese aire se afino mirandolo en s180 y no se toca. Y lleva
`!important` **por necesidad**: el padding lo pone un estilo EN LINEA, que gana a
la hoja sin que haga falta `!important` del otro lado (trampa de s180 con el
recorte del logo).

### C · La escala en movil, y el numero del handoff que era falso

El handoff proponia un suelo de 0,85 «porque 0,85 x 780 = 663, asi que de 667
para arriba cabe entero». **Medido: a 375x667 con 0,85 todavia se salen 38 px.**
Faltaba contar el propio cajon -- **22 px de padding arriba y abajo** mas un
`min-height: calc(100dvh + 1px)`-- asi que a 667 el hueco real son **622**. El
numero estaba construido sobre el VIEWPORT en vez de sobre el HUECO, y habria
viciado la decision entera.

**La respuesta del usuario no fue ninguna de las cuatro opciones ofrecidas**:
«escalarla en todas las resoluciones que quede bien y en las mas pequenas
aceptamos un pequeno scroll **sin barra**». Las cuatro eran «si con este suelo» o
«no»; su respuesta anade un requisito que ninguna llevaba.

**`SUELO_CAJON = 0,80`**, elegido por dos medidas y no a ojo: el bloque de la
semana -- el objetivo tactil que s180 afino a 45 px-- se queda en **36**, holgado
sobre el minimo de WCAG 2.2 AA (24), y hace caber ENTERO **375x667**, el iPhone
SE/8.

| viewport | escala | fuera | el pie termina a |
|---|---|---|---|
| 360 x 560 | **0,80** (suelo) | 101 px | -79,1 |
| 360 x 640 | **0,80** (suelo) | 21 px (solo padding) | +0,9 |
| 375 x 667 | 0,809 | **0** | +21,5 |
| 390 x 736 | 0,898 | **0** | +21,5 |
| 428 x 800 | 0,981 | **0** | +21,6 |
| 375 x 844 | 1 | **0** | +50,6 |

El precio, dicho: el texto secundario de 11 px se ve a **8,8** y las iniciales de
los dias, de 9, a **7,2**.

### Lo que la implementacion tuvo que resolver, y no estaba en el plan

**El alto disponible no se pregunta en el mismo sitio en las dos pieles.** En
escritorio la lente es un hijo FLEXIBLE y su `clientHeight` es el hueco real. En
el cajon es `display: block` y **se dimensiona al contenido**, asi que
preguntarle devuelve el alto natural y la escala sale exactamente 1: sin error,
sin aviso y sin efecto.

**Y el reves del mismo hecho:** una transformacion no cambia la caja de layout,
asi que el alto que la columna escalada OCUPA tampoco lo sabe el CSS. Lo escribe
el motor en `--sb-alto` y la hoja lo consume. Si ese numero fuera menor que el
contenido escalado, la lente -- que lleva `overflow: hidden`-- se comeria el pie
**sin barra que lo dijera**. Por eso el test no mira alturas: hace scroll y
comprueba que el pie SE VE.

**El observador cambia y la guarda deja de ser una optimizacion.** En el cajon la
lente ya no avisa de nada, porque su alto lo escribimos nosotros DESPUES del
calculo; alli avisa el aside. Se observan los dos, y la guarda de valor de
`aplicar()` pasa a **cortar un bucle**: converge en una pasada.

**La barra se oculta y el scroll se conserva** (`scrollbar-width: none` +
`::-webkit-scrollbar`), el patron del centro de sesion. `overflow: hidden` haria
lo primero matando lo segundo, que no es lo que se pidio.

**La regla §1 mordio**: `Sidebar.jsx` llego a 506 lineas y el motor sale a
`app/shell/Sidebar.escala.jsx`. La costura no es de kilometraje -- `Sidebar.jsx`
es el orquestador y esto es geometria-- y deja el orquestador en **318**.

### El banco fotografio su propia mutacion

Con la escala ya implementada, el banco devolvio «escala 1 · fuera 0 · pie
-126,4»: tres cosas incompatibles en una fila. Su limpieza entre variantes hacia
`removeProperty('--sb-escala')`, y **esa es exactamente la propiedad que escribe
la implementacion**; con el memo de `aplicar()` el producto no la volvia a
escribir nunca. Fotografiaba su propio borrado sobre una app que en vivo estaba a
**0,8083**. Es la trampa que el handoff de s181 lista con nombre, y volvio a
morder en el mismo banco.

Arreglado con **recarga por variante** y, lo que de verdad importa, **cruzando
dos instrumentos**: la escala geometrica (rect / offsetHeight) contra lo que el
producto dice en `--sb-escala`. Si no coinciden, se para con un error en vez de
imprimir una fila creible.

### El censo de glifos llevaba ciego a Estira desde s178

`scripts/ingest-glifos-ejercicio.censo.js` sacaba los pasos con una expresion
regular sobre `app/extra/ExtraModule.jsx`, y **s178 troceo ese dato** dejando el
archivo con **cero pasos**. Devolvia **61 donde hay 62** sin que nada saltara,
porque el registro tapaba 24 de las 25 identidades de Estira. La que se perdia,
`Puente isquio a una pierna`, **si tiene arte**: regenerar el encargo habria
escrito una identidad de menos y una fila de arte aparentemente huerfana.

**Tercera vez que este censo da un numero erroneo y creible** (s164: 61 · s172:
el patron pedia `mode:` y los pasos legacy declaran `dur:` · s182: el archivo se
vacio), y las tres con el mismo sintoma: un total redondo que coincidia con otro
censo que arrastraba el mismo punto ciego.

Ahora lee `window.MOVE_ROUTINES` y `window.EXTRA_ROUTINES` **ya evaluados**, que
es lo que la app consume, con **guard de cero por modulo** calibrado
reproduciendo el fallo de s178 exacto. Prueba de que el arreglo es correcto: el
documento regenerado sale **identico byte a byte** al commiteado.

**La pregunta del usuario, contestada:** las tres rutinas de oficina de s178
reutilizan ejercicios que ya tenian arte, **15 de 15 pasos**. El censo bueno:
**62 identidades · 59 con arte · 3 sin** (`Nordics`, `Pica en escritorio`,
`Rana`) **· 0 de arte que nadie pida**.

### La red

`tests/sidebar-movil.spec.js`, **12 asertos**, **173 → 185**. Seis mutantes sobre
`index.html` -- que es lo que la suite lee-- y **los seis mordieron**: el apagado
de movil (4 rojos), la lente sin alto (3), la lente recortando de mas (2), la
barra de vuelta (1), el aire al objeto compartido (1) y un suelo temerario (2).

Los dos ultimos muerden **uno cada uno a proposito**: son los asertos por LADO.
Que en movil el padding este recortado no prueba que en escritorio siga entero.

**Dos rojos que no eran del producto**: la primera pasada dio 2 timeouts en
`home-geometria.spec.js`, uno llamado «el contador del Pomodoro no dispara el
observador de montaje» justo despues de anadir yo un observador. No se dio por
ruido: el run tardo **31,3 min** en vez de ~1,5 (contencion de memoria,
documentada en `playwright.config.js`) y esos dos, solos, pasan en **1,1 s y
1,6 s** sobre un timeout de 60. Sola, la suite da **185/185 en 3,2 min**.

---

## [v0.113.0] -- 2026-09-02 -- fix(sidebar): la sidebar encoge entera

### El diagnostico que corrige al handoff de s180

`docs/HANDOFF_s180.md` dejaba el problema de altura abierto con este numero:
«el contenido mide ~747 px y a 1536x714 hace scroll». **Los 747 eran reales pero
no eran la altura del contenido: eran el suelo con la tarjeta YA aplastada.** La
natural eran **835,9 px**, y coincidieron dos cuentas independientes -- la suma
de las piezas menos el chevron (`position: absolute`, no ocupa columna) y el
primer viewport donde no sobra nada.

### El mecanismo

`sidebarStyles.accion` lleva `overflow: 'hidden'`, y eso **apaga el tamano
minimo automatico del flex**, que solo se aplica con `overflow: visible`. Los
doce hijos de la columna tenian `flex-shrink: 1` y `min-height: auto`, y **once
estaban protegidos por ese minimo; la tarjeta no**. Como su contenido interior no
se mueve, lo que quedaba por debajo del recorte se **amputaba**.

| viewport | desborde | tarjeta |
|---|---|---|
| 714 | 36 px | **33,0** -- solo el rotulo |
| 750 | 0 | 35,7 |
| 800 | 0 | 83,1 |
| 836 | 0 | **117,3** integra |

Entre 750 y 836 el contenido se perdia **sin barra de scroll que avisara**. Y no
lo introducia el trabajo sin commitear: HEAD trae la misma linea y desborda
**50 px** a 714, mas que el arbol.

### La solucion la eligio el usuario, tirando la mia

Se construyo la compactacion -- apurar aire hasta **700,3 px** sin quitar
secciones, 135,6 px de los que **56 salian solo de las cuatro reglas**-- y la
rechazo al verla: apretar el aire **cambia las proporciones**, las reglas encogen
y el texto no. Su instruccion, textual: «si hay que hacer a la vez pequenos a
TODOS los elementos de la sidebar, perfecto».

Asi que la columna **se escala entera**. Misma composicion, solo mas pequena:
escala **1 / 0,926 / 0,822 / 0,708** a 1000/800/714/620, con el pie terminando
**siempre a 18 px** del borde. **Nunca agranda**: por encima del tamano natural
se queda quieta y el sobrante va al espaciador (geometria fija de v0.112.0).

### La lente

La envoltura escalada mide `100%/escala` de ancho, o sea que **desborda 52 px en
layout** aunque a la vista quepa -- una transformacion no cambia la caja. Ese
desborde llegaba al `<aside>` y **tumbaba el guard de scroll lateral que ya
existia**. Se arreglo el diseno y no el guard: una caja intermedia lo absorbe, y
**solo recorta cuando hay escala de verdad**, para que sin ella el
comportamiento siga siendo scroll y nunca un recorte mudo.

### Los minutos de Hoy

`puntosSesion` devolvia **`null`** sin sesiones: Foco, Respira y Cuerpo no tenian
fila de bolas y Agua si, y con `marginTop: auto` el valor caia al fondo en tres
celdas y una fila mas arriba en la cuarta. Ahora la fila se reserva siempre
(`minHeight: 7`, el alto exacto de una gota) y los cuatro valores estan a `top`
**57,6**.

### El rojo intermitente era del producto

Uno de cada tres, y el valor que daba era **exactamente el del arranque**. El
alto natural depende de las metricas de la fuente, asi que **si las webfonts
terminan de cargar despues de calcular la escala, el numero queda hecho con la
fuente de reserva y nada lo corrige** -- el observador vigila la caja, y la caja
no cambia porque cambien las fuentes. En conexion lenta la sidebar se quedaba mal
escalada de forma permanente. Se recalcula tambien en `document.fonts.ready`.

### El precio, dicho

**Encoger encoge tambien lo que se pulsa**: el bloque de la semana pasa de 45 px
a **37,1** a 1280x720. Sigue sobre el minimo de WCAG 2.2 AA (24x24) pero por
debajo de los 44 que s180 busco a proposito. Lleva su propio aserto.

### Estructura, contra la referencia del usuario

Regla nueva entre «Mis rutinas» y la pill de apoyo, y **pill naranja** en «Mis
rutinas» (forma de `SupportButton`, color de `--premium`). Una lectura mia
equivocada de su segunda captura me hizo quitar la regla entre el logo y la
semana; la tercera la mostraba puesta y se restauro -- y de paso quedo
comprobado que el `marginBottom` del `logoBar` **depende** de esa regla: sin ella
el aire de abajo cae a 13,5 contra 25,5 arriba.

### Oficina

Dos troceos por la regla §1: nace `tests/sidebar-altura.spec.js` (el spec llego a
557) y `app/shell/Sidebar.hoja.jsx` (el support llego a 526). Los dos por una
costura que el propio archivo ya declaraba.

---

## [v0.112.0] -- 2026-09-02 -- fix(sidebar): la geometria fija

Segunda mitad de s180. El usuario prueba en produccion lo que se publico en
v0.111.0 y reporta **diez cosas**. Tres eran defectos que estaban publicados.

### La decision: GEOMETRIA FIJA

La columna mide lo mismo en un portatil que en un monitor de 1440, con el pie
anclado abajo y el sobrante al final. Palabras del usuario: «la barra va a
disponer de una geometria fija independientemente de la resolucion del
desktop». **Un ritmo que cambia con la pantalla no se puede afinar**, porque
cada numero vale una cosa distinta en cada equipo.

Antes se probo lo contrario -- repartir el sobrante entre las reglas con
`margin: auto`-- y hay que decir que **NUNCA REPARTIO NADA**: el espaciador con
`flex: 1` se comia el sobrante entero (**378 px** a 1030 de alto) porque el
flex-grow se resuelve antes que los margenes automaticos. Y **el numero estaba
a la vista en la maqueta**: su variante «aire repartido» daba **455 px** de
hueco contra los **389** de la que no repartia, o sea MAS. No lo lei.

### Los ajustes, medidos uno a uno

| | Antes | Ahora | Pedido |
|---|---|---|---|
| Aire sobre el logo | 31,5 | **27,5** | −12 % |
| Del logo a su regla | 35,6 | **28,5** | −20 % |
| Aire sobre «Esta semana» | 19 | **22** | +15 % |
| Tarjeta de Repetir | 98 px | **117 px** | mas aire entre lineas |
| Logo (ancho del dibujo) | 216,9 | **173,4** | −20 % |

El ultimo logro pasa a **centrado, peso 400 y tinta secundaria**: el 500 lo
hacia competir con el nombre de la rutina, que es el unico titulo que deberia
pesar. Todas las reglas quedan a **14/14** salvo la del logo, corta a proposito.

### El «+» de Agua desaparece

Era un **segundo objetivo** dentro de una celda de 117 px, y ademas **pisaba
los ocho vasos 17,2 px** -- por eso se veia como un glifo raro encima de ellos.
Ahora **la celda entera suma el vaso** (decision del usuario entre tres
opciones) y su etiqueta dice lo que hace, no «Abrir Agua». Es la unica celda
que ACTUA en vez de navegar.

### Tres defectos que estaban publicados

- **La tarjeta de accion no era clicable entera.** El objetivo eran **74 x 23
  px** de una tarjeta de 243 x 117: el patron de s174 necesita un `::after`
  absoluto y **React no crea pseudo-elementos desde un estilo en linea**. Tiene
  que estar en la hoja, y ademas medirse contra la TARJETA y no contra el `<h4>`.
- **La miniatura del logro renderizaba a 16,1 px.** El 62 % venia de cuando
  eran cinco miniaturas diminutas; con el sello a 36 y el 72 %, ahora son 24,5.
- **«1 dias en ritmo».** El singular va como clave aparte y no como un
  `n === 1 ? 'dia' : 'dias'`: en ingles la frase entera cambia de forma.

### Y el metodo se cobro una

Al retirar el CSS del «+», el corte **se llevo por delante la regla del
`::after`** que acababa de arreglar la clicabilidad. **La cazo su propio test**,
escrito veinte minutos antes, que prueba las CUATRO esquinas y el centro en vez
de un punto. Cinco minutos en vez de publicarlo roto otra vez.

### El ultimo logro recupera su rotulo

En v0.111.0 bajo al pie por espacio, y el usuario lo reporto: ahi «se entiende
raro». Era **el mismo problema que el hueco del final** -- al quitarle la
seccion se quedo sin lo que lo explicaba. Vuelve como seccion compacta (sin
fecha, sello a 36) en el orden que eligio: **Hoy → Continua → Ultimo logro →
Esta semana**.

**171/171** (eran 153), con tres tests nuevos: el orden, la clicabilidad de la
tarjeta y la celda de Agua.

Diario: [session-180](./docs/sessions/session-180-la-sidebar-como-brujula.md).

---

## [v0.111.0] -- 2026-09-01 -- feat(sidebar): la sidebar como brujula

**El encargo llego como un brief largo** (sidebar + sesiones CTB musicales). Se
implemento la **primera mitad**: la sidebar entera, escritorio y movil. **CTB
queda fuera de v1** por decision del usuario -- el ROADMAP dice literalmente, en
su seccion «Fuera de v1 (explicito)», *«Viajes de respiracion con
musica/facilitadores y CTB»*, y no se toca. Se le puso la contradiccion delante
y eligio: **fuera de v1, prototipo si**.

### Lo que el brief daba por hacer y ya estaba

Cinco encargos ya existian, y decirlo ahorro trabajo: el reparto de acceso de las
tres rondas (`express` free, `full`/`long` premium), `canAccessRoutine()` como
guard central, la retencion libre sin cronometro ni record (s166), el payload
completo de `session.completed` y el criterio «el agua sola no mantiene racha»
(s69).

### El diseno se aprobo MIRANDOLO

Nueve variantes sobre cajas **a medida real** (280 de ancho, 18 de padding, 1 de
borde => 243 de contenido, 271 de banda de logo). Lo que el usuario eligio
viendolo: **logo al 80 %**, **Hoy en rejilla 2x2 con los glifos y centrado**, la
**regla del logo de vuelta** con el margen de las otras, **fuera la frase del dia
activo** (no se entendia, y con razon: «hoy ya cuenta» no dice contar PARA QUE),
**fuera la barra de progreso** y la tarjeta reducida a **CONTINUAR o REPETIR**.

**Y tres veces escribi un numero que no habia medido.** Predije «Hoy» en 118 px
contra 106 y son **85,0 y 84,3** -- la diferencia real es **0,7 px**, asi que
entre las dos formas no se elige espacio sino lectura. Predije la banda en 178,9
y son 178,3. Y el metodo para medir el suelo **mutaba el layout** y devolvia
**6 px de mas en las cuatro variantes**, suficiente para voltear un veredicto:
cambiado por uno que no toca nada y **estable en tres tomas**.

### El logo, medido

```
lienzo 716x471 . dibujo 488x194 . 93,53 % a alfa 0
margenes  izq 85 . dcha 143 . arriba 123 . abajo 154
```

En la banda de 271 px eso son **178,3 px de alto de los que 104,9 son aire**. Y
la banda **ya se comprimia 7,3 px** (`flex-shrink: 1`, contenido 172), con la
imagen desbordandola **13,7** sin que se notara **porque lo que desbordaba era
transparencia**: el margen del PNG llevaba meses tapando un defecto real.

**No se crea `pace-logo-sidebar.png`**: ese `<img>` lo leen `CowLogo.jsx` **y**
`OnboardingScreens.jsx`, asi que mover el archivo le cambia el logo al
onboarding, y anadir un segundo lo inlinearia otra vez (~100 KB de base64 por un
dibujo que se pinta una vez). Se recorta **por CSS**, con la aritmetica escrita
en la hoja.

### Tres hallazgos que cambian lo acordado

- **La rama «CONTINUA» de Camino es HOY INALCANZABLE.** `PathRunner` monta un
  overlay a pantalla completa siempre que `paths.current` existe, y salir llama a
  `abandonPath()`, que lo pone a `null`. Un Camino en curso **tapa la sidebar**,
  o no existe. La rama se conserva escrita y **se dice que no esta probada**.
- **El ultimo logro baja al PIE.** Con seccion propia costaba **~100 px** y con
  ellos no cabe a 1280x720 en cuanto aparece la tarjeta. Se sigue enseñando uno.
- **La celda de Foco no es un boton**: el timer ES la home, no hay nada que abrir.

### Dos defectos mios

**El recorte no se aplicaba**: la caja recortaba (107,8 px) pero el dibujo seguia
a 271 x 178,4 -- los estilos **en linea** de `PaceLogoImage` ganan a la hoja, que
es el mordisco que s174 ya documento con el padding del modal. Y estaba al 100 %
cuando el usuario habia elegido **80 %**.

**La celda «Respira» se llamaba igual que el chip de la ActivityBar**, asi que
`getByRole('button', {name: /^Respira/})` dejo de ser unico: **15 tests en rojo y
ninguno del producto**. El arreglo bueno no era tocar los tests -- la etiqueta
pasa a «Abrir Respira», que es lo que un boton debe decir (WCAG 2.5.3).

Y **dos veces** cai en los backticks dentro del template literal del CSS, la
trampa anotada desde s139.

### Los tests, y las tres semillas que hacian falta

Nace `tests/sidebar-redesign.spec.js`, **16 asertos**, con 3 mutantes que
muerden. **El primer mutante no mordio**, y no por debilidad del test: la suite
corre sobre `index.html` y yo habia mutado la fuente **sin reconstruir**.

**Tres rojos con el mismo sintoma** (la sidebar a ceros) antes de dar con la
causa: sembrar `weeklyStats` o `water` **no basta**. Sin `lastActiveDay` el
rollover archiva la semana; sin las guardas de migracion,
`_historyRecalculated_v0_28_8` **recalcula `weeklyStats` desde un historico
vacio** y la deja a ceros.

`leerLogros` cambia de sonda: leia el contador «N/M» de un bloque que ya no
existe, y ahora `leerUltimoLogro` lee **cual** fue el ultimo logro. El contador
sigue donde manda 15.4: el modal.

### Las tres de pulido

**El chevron a 24, no a 44** -- WCAG 2.2 AA pide 24 y 22 se queda corto; a 44
**pisa el dibujo 23 px**, a 24 lo pisa 3. Antes del recorte no se tocaban nunca:
**el recorte crea este roce**. **En movil la accion va primera** (orden de DOM,
no `order`: s160). **El cajon se cierra al elegir.**

Y mover la accion de sitio destapo un defecto invisible leyendo: colgar el
separador de cada bloque daba **dos reglas seguidas** en escritorio y ninguna
antes de la tarjeta. Se arreglo el diseno: las secciones se componen en una lista
y **los separadores van entre ellas**.

### Numeros

| | |
|---|---|
| Suelo escritorio | **662** (cabe a 720 con 58 px y a 714 con 52) |
| La sidebar de s179 | **720 exactos, espaciador ya a 0** -- a 1536x714 ya scrolleaba |
| Banda del logo | 96 px (dibujo 216,9 x 86,2) contra 164,7 (dibujo 271 x 178,4) |
| Movil | 390x844 y **320x568 sin scroll**, cero scroll horizontal |
| Suite | **169/169** (eran 153) |

Diario: [session-180](./docs/sessions/session-180-la-sidebar-como-brujula.md).

---

## [v0.110.0] -- 2026-09-01 -- fix(runner): el runner en movil corto

### Un umbral elegido mirando un solo lado

El arreglo llegaba escrito de la primera mitad de la sesion, con `max-height:
660` en el tramo movil nuevo. **660 salio del viewport que se estaba mirando**
(360x640), no de medir por los dos lados. Ampliado el barrido, HEAD solapaba a:

- **375x667 — el iPhone SE/8 — con 7,2 px**
- **360x661 con 10,8 px**
- 360x680 sobrevivia por **1,9 px**

Los dos primeros quedaban **justo por encima** del umbral, o sea sin cubrir. Es
el mismo error que s177, que declaro el suelo en 641 cuando el borde real
estaba en 575. Sube a **700**, que no es un numero nuevo: es el breakpoint que
esta misma hoja ya usa para «retrato estrecho con poca altura» (s27/s171b).

### El banco dijo «cero» y su guard pidio el control positivo

Sobre el artefacto arreglado el banco daba **0 de 14**, y su propio guard avisa
de que «cero» y «no he medido» se parecen demasiado. Se sirvio el `index.html`
de **HEAD** en un puerto aparte —con sus `fonts/`, porque sin ellas las metricas
de texto son otras y la comparacion no vale— y la misma sonda, los mismos clics:
**4,7 px a 1280x575 y 26,3 px a 360x640**, este ultimo el numero exacto que el
diagnostico habia dejado anotado.

### El banco dijo «arreglado» y el censo lo desmintio

El banco declara que **mide UNA rutina**. Pasado el censo de s177, que recorre
las 28 paso a paso, a 360x640:

| | HEAD | primer arreglo |
|---|---|---|
| rutinas con solape | 16 de 19 | **5 de 19** |
| pasos con solape | 60 de 79 | **7 de 79** |
| el peor | 70,0 px | **34,0 px** |

El 88 % del defecto, pero no el defecto.

### La causa real: la compresion apuntaba a un elemento que ahi no existe

Medidas las piezas de la pantalla que solapaba: la **pantalla de colocacion**
pinta `[data-pace-v1-num]` (el numero pequenio de la puerta, s112) y **no**
`[data-pace-v1-timer]`. Todos los tramos cortos —**incluidos los de s119 en
escritorio**— comprimen `-timer`. En la pantalla de trabajo el mismo elemento
lleva los dos atributos, y por eso alli funcionaba. Por eso el texto que se
metia era el de colocarse en **4 de los 5 casos** que quedaban.

La segunda pieza era el **nombre**: `clamp(30px, 6.5vh, 52px)` da 41,6 px a 640
de alto y a 360 de ancho **envuelve a dos lineas** (87,3 px). Fijado a **30 px**
—el suelo que su propio clamp ya declara aceptable— cabe en una y devuelve 53,7.

**Ninguna rutina solapa** a 360x640, 375x667 ni 360x600.

### Lo que queda declarado y no arreglado

A **360x560** siguen solapando ~18,6 px. Lo unico que queda por encoger es el
**glifo** (123 px), y por CSS funcionaba (123 -> 96, +8,4 px). **No se hizo**:
la fuente unica de s177 lo prohibe por escrito, porque el circulo de la sesion
dejaria de relevar al de la preparacion — arreglar un salto creando otro. Sin el
glifo, apurando margenes y numero, se queda en **-1,1 px**, y apurar a +4,9
seria quedarse sin red donde s176 midio que el CI se desvia hasta **9,4 px**.

### La red

Tres tests nuevos en `runner-congelado.spec.js` (360x640, 375x667, 360x600),
**calibrados en rojo contra el `index.html` de HEAD**, con guard de cero. Y se
corrigio la cabecera del spec, que declaraba «NO CUBRE: alturas por debajo de
641 px. Ni movil» — cierto hasta hoy. **153/153** y `verify` en verde.

---


## [v0.109.0] -- 2026-08-31 -- feat(estira)+fix(claude.md): las tres rutinas de oficina

### El documento que mandaba al archivo equivocado

`CLAUDE.md` llevaba las RUTAS cambiadas en el bloque «OJO CON LOS IDS». Lo cruzado son los
ids y **solo** los ids; cada modulo vive en la carpeta de su nombre:

    MUEVE  (lib.move.title)  <- app/move/move.data.js      ids extra.*
    ESTIRA (lib.extra.title) <- app/extra/extra.data*.js   ids move.*

Hasta s176 el parrafo describia los ids al reves; s176 los corrigio y **cruzo tambien las
rutas, que estaban bien**. Coste medido: el primer censo de «cuantas de Estira piden suelo»
midio MUEVE y devolvio **2** donde la respuesta es **9**. El codigo lo tenia bien desde
s174 — lo decia `ExtraModule.jsx` en su propio comentario.

### Estira: 14 -> 17 rutinas, y las de oficina de 5 a 8

Salieron de `scripts/audit/censo-suelo-s178.js`, no de una idea: **9 de 14** pedian suelo,
**las cuatro de caderas** eran de suelo, y las cinco sin suelo eran **todas de tren
superior** — en la biblioteca cuyo subtitulo es «antidoto a la silla».

- **`move.hips.standing` · Caderas de pie** — Sentadilla profunda · Sentadilla lateral ·
  Zancada profunda · Pliegue adelante.
- **`move.hamstrings.standing` · Cadena posterior de pie** — Rodar hacia abajo · Isquio a una
  pierna · Sentadilla de cuadriceps · Pliegue adelante.
- **`move.spine.chair` · Columna en la silla** — Extension toracica · Rotacion toracica ·
  Inclinacion lateral · Barbilla atras.

**No se retiro ninguna rutina** (decision del usuario): las nueve de suelo siguen enteras.
**Ningun glifo nuevo**: los doce ejercicios ya tenian arte. Cada uno **verificado contra su
propio `setup`** antes de componer — fuera `Cuadriceps en pared` («la rodilla al fondo») y
`Marcha del elefante` («camina con las manos por el suelo»: no pide tumbarse, pero no es
discreto). Unidades por BASE §3-C y §6; `Barbilla atras` en `reps` porque §3-E prohibe
cronometrar el chin tuck con nombre y apellidos.

### La regla §1 se cobro el crecimiento, y estaba previsto

`ExtraModule.jsx` llego a **553 lineas**. El dato se troceo **por grupo** en
`app/extra/extra.data.js` (oficina + hombros) y `app/extra/extra.data.piernas.js` (caderas +
flujos), con **guard de orden** que aborta si el segundo se evalua antes. `ExtraModule.jsx`
queda en **53 lineas**. La tabla de deuda de `STATE.md` ya lo tenia planificado desde s148.

**La suite lo cazo con siete rojos y ninguno era el producto**: `biblioteca.spec.js` lee el
catalogo **del archivo fuente** a proposito, y su guard de cero vio el archivo recien vaciado.

### Respira: no se toco una linea

El usuario eligio **C** tras mirar la maqueta —incluida la variante **F** (rail + aside), que
se pinto para el y se descarto viendola— y **C es lo ya publicado desde s176**. Verificado en
la app real: 3 columnas, tarjeta **283 px**, rail 262, cero aside, contra los 288 px de la
maqueta. Honesta dentro de 5 px.

### Red de seguridad

`npm run verify` PASA · `npm run test:e2e` **150/150** · standalone intacto en **v0.71.0**.


## [v0.108.0] -- 2026-08-31 -- docs(auditoria)+fix(sw+vuelo): la auditoria completa

> El informe con la evidencia `file:line` vive en
> [`docs/audits/audit-completa-s178.md`](./docs/audits/audit-completa-s178.md) y **gobierna**
> sobre este resumen.

### El ROADMAP pintaba mas trabajo del que hay

- **Fase 3** — marcador «EN CURSO (s155, v0.88.0)» con los **cuatro emisores entregados en
  v0.102.0** (`app/state-events.jsx:69` y su suite) y la **retencion por calendario corriendo
  sola desde s174** (`app/events/events-store.js:370`). Lo que queda de verdad es la Fase 3 del
  esquema. `STATE.md` tambien la daba por no programada: corregido.
- **Ola B de la Fase 2** — «los 20 dibujos» son **3** (`GLIFOS_EJERCICIOS_PENDIENTES.md`).
- **Arte de logros** — «58 de 96 / 38 sin dibujo» es **77 de 96 / 19**.
- **Fase 5** — sin marcador pese a llevar dentro la voz de s175 y la musica de s177.

### Las promesas publicas

`privacy.html` se ha tocado **una sola vez en toda la vida del proyecto** (`5317563`, v0.46.0):
no paso por s151, ni por s155, ni por s175/s177. Llevaba «Sin servidores propios... no
podriamos ver tus datos aunque quisieramos», un claim **sobre el producto entero** de la clase
que s151 prohibio y que deja de ser cierto con el Worker de licencia. Reescrito en ES y EN con
el criterio de s151, **y con la fecha actualizada**: la propia pagina promete que cambia con
ella, asi que no fecharla incumplia una promesa escrita dentro.

### El vuelo de la capitular, borrado

`library-transition.js` estaba documentado como «inerte». **No lo estaba**: `app/main.jsx:153`
lo llamaba en CADA entrada a sesion, clonaba un nodo y gastaba **24 frames (~400 ms)** buscando
el destino que s175 se llevo. Fuera el modulo, su `<script>` y la llamada. Los tests **se
quedan**: vigilan el resultado —que no aparezca un clon suelto— y no la implementacion.

### `sw.js` cacheaba sin mirar el metodo

Dos `cache.put` (`:320` y `:338`) recibian `event.request` tal cual, y la Cache API **rechaza**
un `HEAD`. Como ninguna cadena llevaba `.catch()`, era una **rejection no capturada**. Guard de
metodo al entrar al `fetch`, que cubre los dos. **Sin `.catch()` mudo a proposito**: enterrar el
error deja el fallo indistinguible de que no lo haya (la leccion de s177).

### La tabla de deuda pierde sus numeros

Mentia en **10 de 14 filas** medidas — s162 la cazo mintiendo en cinco, o sea que **empeoro**.
La deuda de tamaño en si **no esta viva**: el trinquete del `verify` funciona y ningun archivo
pasa de 500. Se retira la columna en vez de actualizarla: copiar a mano lo que el `verify` ya
mide es el mecanismo que ha fallado tres veces (s148, s162, s178). Decision del usuario.

### Herramientas

- **`docs/BANCOS.md`** — los **17 bancos** de `scripts/audit/` que no aparecian en ningun
  documento, con que pregunta contesta cada uno.
- **`scripts/audit/auditoria-s178.decisiones.js`** — cruza las 196 filas de decisiones contra el
  codigo y el indice de `STATE.md` contra el documento que gobierna. Acepta otro documento por
  `argv` para poder mutarlo y verlo morder.
- **`scripts/audit/auditoria-s178.huerfanos.js`** — que se publica a `window` y no consume nadie.

### Red de seguridad

`npm run verify` PASA · `npm run test:e2e` **150/150** sobre el `index.html` regenerado ·
consola limpia · `PACE_standalone.html` intacto en **v0.71.0**.

**El instrumento mintio seis veces**, y la cara fue excluir en un grep lo precedido por punto:
mata `window.X`, que es como consume media app, y daba por **inertes** dos archivos vivisimos.


## [v0.107.0] -- 2026-08-31 -- fix(runner+stats)+feat(musica): lo que no se oia

Ningun bloque estaba en el plan. Los cuatro salieron de lo que el usuario vio y
oyo al probar, que va por **cuatro sesiones seguidas** reproduciendo.

### El runner: la pantalla se congela

Censadas **las 28 rutinas de Mueve y Estira paso a paso** a 1536x714:

| | antes | ahora |
|---|---|---|
| «Cuidate» dentro de la barra | **15,0 px** en 11 de 47 pasos, 7 de 16 rutinas | **0 de 47** |
| Salto de nombre y descripcion | **26,4 px** | **0** |
| Salto del numero | **51,2 px**, y de 56 a 104 px de tamanio | **0**, y **76 px en las dos** |
| Salto de la etiqueta | 4,6 px | **0** |
| Huecos arriba / abajo | 10,0 / **−15,0** | **9,8 / 9,7** |

**El solape lo causo un arreglo**: el anclaje de la barra de s176 dio al bloque
`flex: 1 1 auto; min-height: 0`, y eso le permite ENCOGER por debajo de su
contenido — el bloque encoge, el texto no, y el texto pinta encima.

**«Subir el numero» no se podia hacer moviendolo**: no habia holgura, faltaba
sitio, y reservar el rotulo de fase (la causa exacta del salto de 26,4) cuesta
otros 26,4. El tamanio lo eligio el usuario **mirando tres variantes pintadas
sobre la app real**; gana 76, lo que **anula la decision de s112**. El color no
se unifica.

Los pixeles salen del glifo (`V1_GLYPH_WEB` 1,3 -> 1,118, o sea 204 -> 181 px) y
de dos margenes del tramo 701-768. **El glifo se toca en la fuente unica**
porque la consumen tres sitios y desviarla haria que «el circulo de la sesion no
relevara al de la preparacion sino que saltara».

**Alcance `min-height: 641`**, y por debajo no se aplica: limitacion medida — a
1280x600 sigue solapando 7,0 px con el numero a 58 y 12,7 con 64.

### Stats: el calendario usa el ancho de la ventana

El modal gastaba **820 px de 1536** y la rejilla del anio llevaba celdas de
11x11 px cableadas, asi que «Anio» dejaba **163,7 px muertos de sus 385** — el
42 % de su caja — mientras las otras tres dejaban 0. Ahora **1240** (el de sus
tres hermanas desde s176), celda **19**, **52,4** px muertos.

**El mes no puede crecer y esta medido**: con celda 48 su vista se va a 421,4 px,
con 56 a 474,4 y con 64 a 527,4, contra los 385 de las demas — o sea vuelve el
salto entre pestanias que s176 quito a peticion del usuario. Por eso las vistas
que no son el anio se acotan a 820 y se centran.

### La musica: tercera capa de fondo, y tres errores de nivel

Se monta `Sound.musica.jsx` y el usuario reporta **cinco veces** que no la oye.

1. **La ganancia se iguala por RMS, no por pico.** Igualar picos con el drone
   daba 0,12 y dejaba la pieza en **−48,9 dBFS, unos 20 dB bajo la voz**.
2. **Una pieza con el 82,6 % de su energia bajo 200 Hz no sale de un altavoz de
   portatil** (0 % sobre 2 kHz; con ponderacion A pierde 12,7 dB).
3. **El criterio de seleccion estaba invertido**: la recomende por «dejar el
   hueco de voz mas limpio», que es la medida que la hacia inaudible.

Queda montada **una sola pieza en las seis familias, provisional**, para poder
ver el conjunto con musica. Nunca suena con el drone. Y el modulo **ya no se
calla**: cada salida deja su motivo en `paceMusica.ultimo`.

> **Al reescribir los seis briefs**, anadir el requisito que faltaba: **el grueso
> de la energia entre 200 Hz y 2 kHz**.

### Red de seguridad

`npm run verify` PASA · `npm run test:e2e` **150/150** (146 + 4 asertos nuevos) ·
**6 mutantes calibrados, 6 muerden**, todos llegando al artefacto · standalone
intacto en v0.71.0. Seis bancos nuevos en `scripts/audit/`, incluido uno de
escucha **en otro puerto**, sin service worker ni app.

---

## [v0.106.0] -- 2026-08-27 -- fix(respira+runner+stats): los cuatro sitios donde el usuario tenia razon

### Los cuatro defectos, medidos a 1536x714 (su pantalla)

| lo que dijo | lo que estaba pasando | ahora |
|---|---|---|
| «la biblioteca de Respira se ve demasiado feo» | 1 columna de **810 px** con ~380 de contenido; **3,90 pantallas**, mas que las **3,82** de antes del redisenio | rejilla de 3 x **288 px** + rail; **1,98 pantallas** |
| «Tus rutinas va demasiado a la derecha» | minimo de **260 px** en un rail de **242**; sobresalia **18 px** | alineada (242 = 242) |
| «la barra casi se superpone con los botones» | **15 px DENTRO** del pie, y **47,2 px** mas abajo que en «colocate» | **586,5 px en las dos**, 16 de aire |
| «los paneles de Stats, mismo tamanio y sin scroll» | **163,2 px** de salto y dos de cuatro cortadas | **0 px** y ninguna |

### Respira usa `LibraryShell` (se anula la decision de s174)

La razon de s174 seguia siendo cierta y la consecuencia no. Lo propio de Respira
entra por **props** —`filtros`, `variant`, `conTuyas`, `pozoAhora`, `ancho`— con
el valor de cuerpo por defecto: **Mueve y Estira no cambian**.

- **Sus filtros son DOS.** Los de cuerpo dejarian pasar las 20 (ninguna declara
  `position` ni `equipment`) y el tercero que se pinto, «Sin rondas», **resulto
  ser un subconjunto estricto** de «Sin retencion»: se cayo antes de cablearse.
- **El pozo de «Para ahora» entra por parametro.** El de cuerpo no descarta nada
  aqui y la sugerencia del dia salia `Kumbhaka 1:4:2`. Ahora excluye las que
  llevan aviso.

### La voz

`bradford` medida decodificando la onda, umbral −50 dBFS, con `sulafat` de
control reproduciendo sus cifras exactas. **14 de 20** contra **17**, y ~121 Hz
contra ~193 — de ahi `Clara` y `Grave` en vez de `Ella` y `El`.

**El 14 casi lo digo mal**: el test exigia que las tres senales cupieran en la
fase mas corta de la rutina (12) y el producto decide **senal por senal** (14).
Los dos modelos coinciden en `sulafat` y solo se separan con una voz cuyo
«exhala» dura el doble.

El bloque de Ajustes pasa a **dos decisiones**: *que marca la fase* y *que suena
detras*. «Musica» no se pinta hasta que haya archivos.

### El runner

La barra se ancla **al centro**, no al contenido — y no basto `margin-top: auto`,
porque el bloque se centra con `margin:auto` (s112). La regla va **al final de
la hoja**: cuatro tiers fijan su `margin-top` con `!important`.

**El hueco del contador no era un margen**: era una **linea vacia reservada**
(s119) que **s172b ya habia dejado obsoleta**. Quitarla pago el anclaje sin
tocar el numero. Darle aire rompe la igualdad (596,7 contra 586,5): «mas aire» y
«que quepa» no caben juntas, otra vez.

### Stats

El suelo es **lo que cabe** (385 px de vista), no lo que mide la mas alta:
estirar la caja habria fijado el tamanio **dejando** el scroll. Calendario 48 →
42 px — las celdas **vacias** se quedaron en 48 en la primera pasada y por eso
solo recupero 30 de los 36. La hoja sale a `StatsPanel.css.jsx` (regla §1).

### Red de seguridad

**146/146** (+10) y **12 mutantes calibrados, 12 muerden**. Nace
`esperarModalAsentado` en los helpers: **«dos lecturas iguales» no es esperar a
un modal** — la curva se aplana y coinciden a mitad del fundido, asi que el
aserto de Stats salio rojo con la app ya arreglada.

### Deuda de documentacion pagada

- La fila de voz de `DECISIONES_TECNICAS_VIGENTES.md` llevaba **las cifras que
  s175 descarto** (`8 de 20`, «DOCE rutinas», «el unico dato bueno es
  `audio.duration`») — y es justo la fila que el handoff mandaba leer.
- `CLAUDE.md` describia **Mueve y Estira al reves**, y ahora dice que los ids van
  cruzados.
- El ROADMAP daba «6 de las 20 para cualquiera de las dos voces»: son **3** para
  `sulafat` y **6** para `bradford`.

Nace [`MUSICA_RESPIRA_BRIEFS.md`](docs/product/MUSICA_RESPIRA_BRIEFS.md).

---

## [v0.105.0] -- 2026-08-27 -- feat(voz+bibliotecas): la voz de Respira, y los cuatro defectos que el usuario vio antes que yo

### Lo que el usuario vio, y lo que hubo que preguntarle

Cuatro defectos de la biblioteca reportados sobre la app publicada. **Los cuatro
reproducen**, pero ninguno a la resolucion que yo probaba: su pantalla es
**1920x1080 al 125 % de escala**, o sea **1536 CSS px**. Ese dato no se deduce de
una captura y hubo que pedirlo.

- **«Apretado entre Tus rutinas y Para ahora»** — huecos **11 / 25 / 0 / 11 px**.
  El cero **no era un valor mal puesto**: la regla da aire a lo que sigue a un
  rotulo y «Tus rutinas» es el unico bloque que no lleva ninguno encima, asi que
  **se caia del selector**.
- **«Al bajar, el lado se queda vacio»** — rail estatico con la caja estirada a
  **1250 px** sobre **566** de contenido: al fondo quedaban **144 px de rail y
  697 de columna vacia**.
- **«Que quepa sin scroll»** — a su altura la segunda sugerencia **se corta 9 px**;
  el umbral esta en **~723 px** de viewport.
- **«Caderas · suelo sin glifo»** — es **la unica capitular vacia de las 28**, y
  lo vio por su cuenta.

### Lo que se pinto antes de preguntar

Ocho variantes —cuatro de rail, cuatro de preparacion— en **iframes de 1536x714
reales**, con la tarjeta de produccion renderizada de verdad y el CSS **extraido
de la hoja real**, y **cada marco midiendose a si mismo**.

De ahi salio lo que no se ve razonando: **dar aire empeora el recorte**. La
variante que solo anadia los 26 px pasaba de cortar 22 px a cortar **48**. Las dos
peticiones —mas aire y que quepa— **no caben juntas con dos sugerencias**.

Entregado **A2**: rail fijo, aire igual en todos los bloques y **una** sugerencia.
Medido contra el artefacto de HEAD servido en paralelo: huecos **11/25/25/11**,
recorte **0**, **481 px de rail intactos** con el scroll al fondo. Y **una
sugerencia en las dos pieles**: lo que sube a «Para ahora» se RETIRA del catalogo,
asi que pintar dos en movil y una en el lateral dejaria la segunda **sin aparecer
en ninguna parte** de la pantalla de escritorio.

### El preparate pierde el glifo, y con el la transicion de s174

Decision del usuario: **solo el contador**. Aquel circulo era el **UNICO destino**
del vuelo de la capitular, asi que el vuelo **se retira solo** — esta escrito para
eso. Con el se fueron sus tres reglas de hoja, incluida la que se acababa de
implementar para recoger el CTA: sin anclaje no hay hueco que recoger. El modulo
de la transicion queda **inerte**, con un test que vigila que no deje rastro.

### La voz, y el numero que costo tres intentos

Entra la voz `sulafat`, lo que **anula la regla «Voz/TTS: NUNCA»** escrita en
**seis sitios**. Se marcan SUPERSEDED por s175 en vez de borrarse, como manda la
convencion del propio documento.

| Como lo medi | Resultado | Por que era falso |
|---|---|---|
| Cabecera MPEG | «14 de 20» | Daba **casi la mitad** de la duracion real |
| Duracion del archivo | «8 de 20» | Correcta, pero **incluye los silencios** |
| **Extremos de la onda** | **17 de 20** | Es lo que suena, y lo unico que puede pisar |

El apunte que lo resolvio fue del usuario: «calcula lo que dura la palabra porque
el audio tiene colas con silencio». El «exhala» ocupa **4,96 s de archivo y la
palabra acaba a los 2,12** — 2,84 s de cola muda. **La misma equivocacion las dos
veces: medir el CONTENEDOR en vez del CONTENIDO**, y por eso va escrita en la
cabecera del modulo.

De paso destapo **un defecto que no habia visto**: **0,65 s de silencio inicial**
hacian que la senal llegara tarde. El clip entra ahora por donde empieza la voz.

La decision es **por FASE y no global**, y la disponibilidad se sabe **por
precarga** porque la reproduccion es asincrona y el fallo llegaria tarde. Fuera
quedan solo las tres de bombeo (fases de 1 s). **El «manten» rompe un silencio
deliberado** y es reversible en cuatro lineas.

Dos trampas del build: aborta si queda una referencia bajo la carpeta de arte de
Respira que no pueda inlinear —los MP3 viven aparte— y **volvio a abortar por el
comentario que lo explicaba**, porque el guard busca la CADENA y Babel conserva
los comentarios.

### Verificacion

`npm run verify` PASA · **136/136** · **10 mutantes de 11 muerden**. El que no
—quitar el shrink del centro— **paso en verde** porque el arte se encoge solo con
la altura y el centro nunca desborda: su test se **retira** con el porque escrito,
y se corrige el comentario del codigo, que afirmaba que caia sin el.

## [v0.104.0] -- 2026-08-27 -- feat(librerias): las tres bibliotecas, implementadas — y la transicion que no existia

s173 dejo el rediseno **aprobado mirandolo y sin una linea de codigo**, con siete
decisiones abiertas. Esta version las cierra —**preguntando antes de escribir**—
y las implementa. Por el camino aparecen seis numeros que no cuadraban, cuatro
defectos que solo se ven mirando y **una decision del diseno que la app no puede
cumplir**.

### La regla del usuario se amplia: las opciones se VEN, no se leen

La quinta pregunta se hizo **describiendo** las tres formas de «ya la hiciste», y
la respuesta fue: «dame **siempre** ejemplos en html para que pueda decidir».
Eso extiende la regla de continuidad de s173: no basta con maquetar el diseno
que se va a implementar — **toda opcion que yo proponga tiene que estar pintada
antes de preguntar**, incluidas las que invento dentro de la pregunta. Se pinto
la tercera forma y se volvio a preguntar; la respuesta final fue **ninguna**, y
como ninguna cambiaba la geometria de la tarjeta, se puede anadir despues sin
tocarla.

### La maqueta mentia sin querer: el chrome del modal

Se dibujo sobre un marco de telefono a pelo, y la biblioteca es un **modal**.

| | Maqueta | App | Tras recortar |
|---|---|---|---|
| Ancho util a 360 | 328 px | **286** | **310** |
| Pantallas a 360 | 3,50 | **4,33** | **3,97** |
| Columna en escritorio | 310 px | **242** | **288** |

Las 4,33 son la cifra que importa: **la app de hoy iba por 4,50**, asi que el
rediseno no habria cobrado su promesa. El recorte va acotado con `:has(.pace-lib)`
y con `!important`, que **no es pereza**: el padding del modal es un estilo EN
LINEA, y sin el la primera version de esas reglas **no movio ni un pixel**.

### La transicion que el diseno describia no existe

«La capitular crece hasta el circulo del runner». Medido sobre la app ya
implementada: entre las dos cosas hay **DOS pantallas** —el Preview y la cuenta
atras— y el circulo **tarda 3.114 ms** en existir desde que se pulsa «Empezar».
Nunca estan cerca en el tiempo.

Se pintaron los dos destinos posibles y el usuario eligio **la cuenta atras**,
que ademas es **donde el circulo va a aparecer** — y que hasta hoy era un numero
sobre nada. **Ponerlo ahi introdujo un defecto peor del que venia a arreglar**:
el circulo **saltaba 171 px en escritorio y 221 en movil**, porque el runner
ancla su bloque arriba (s172b) y la preparacion se centraba. Con el mismo
anclaje y el circulo el primero, **el salto es 0**.

### Seis veces la misma trampa, y la sexta en produccion

«Para ahora» y los filtros se pintan **dos veces** —lateral y movil— y la hoja
apaga la copia que sobra. Es lo correcto: **s166 quito a proposito** el lector de
piel en JS porque costaba un re-render de la home en cada cruce del breakpoint.
El coste cae en quien consulta el DOM, y cayo **seis veces**: cinco en sondas de
medida y la sexta en `library-transition.js`, donde hacia que **en movil no
volara nada**. Una se arreglo **moviendo el nodo** y no la sonda: el «Para ahora»
de movil estaba **dentro de la rejilla**, y un subarbol oculto ahi envenena toda
consulta a ella.

### La retencion, por fin programada

Llevaba desde s155 **implementada y sin disparar**. De las dos vias posibles, el
usuario eligio **el arranque tras `loadState`** y no el rollover:
`rolloverIfNeeded` es **sincrono** y la poda no. Nace `eventsWebPruneByCalendar`,
que usa exactamente las tres piezas que §12 nombraba y **no escribe si no hay
nada que podar** — cada arranque pasa por ahi, y una escritura inutil despierta a
la otra pestana por nada.

### Lo que dijo calibrar en rojo

**16 mutantes, 16 muerden**, y cuatro cosas solo se supieron ahi: la linea de
grupo vacio **mentia** cuando «Para ahora» subia las rutinas del grupo; un guard
de cero estaba **por biblioteca** cuando **Estira no tiene ni una rutina con dos
series**; **comparar el JSON del contenedor no prueba que no se escriba**
(reescribir lo mismo da la misma cadena — ahora se espia `setItem`); y dos
asertos **pasaban por carrera**, uno de ellos en verde por azar de milisegundos.

Diario completo: [session-174](./docs/sessions/session-174-las-librerias-implementadas.md).

---

## [v0.102.2] -- 2026-08-21 -- fix(eventos): las dos decisiones del emisor, decididas y escritas en el esquema

s172 tomo dos decisiones porque `EVENTOS_SCHEMA.md` no las cerraba, y las dejo
anotadas como **desviaciones conscientes**. El usuario las reviso con las dos
opciones delante y ahora estan **decididas y escritas en el propio esquema**
(rev. 6), asi que codigo y documento dicen lo mismo y no queda nota que recordar.

### Foco emite `focus`, una sola identidad

`§8` exige `routineId` y un bloque de foco **no tiene catalogo detras**. Se
descarta `focus.<minutos>` por dos razones medidas:

- **la duracion ya viaja en `plannedSeconds`**, asi que ponerla tambien en el id
  deja el mismo hecho en dos sitios y obliga a sumar cuatro cubos para responder
  «total de foco»;
- **los cuatro cubos no tenian consumidor**: el que agrupa por `routineId` es
  «que te ayuda», que se alimenta del feedback, y **en Foco no se pide feedback**
  (`SessionFeedback` solo se monta en Respira, Mueve y Estira).

Comparar 25 contra 45 sigue siendo posible leyendo `plannedSeconds`. La decision
es **reversible en las dos direcciones** justamente por eso.

### Respira sin rondas mantiene su plan, y §6.4 gana la fila que le faltaba

La fila del esquema hablaba solo de «rondas x ciclo», que son **3 de las 20**
rutinas. Las otras 17 terminan cuando el **tiempo activo** alcanza
`routine.min x 60`: es el numero contra el que corre el motor, no una estimacion.
Emitir `null` habria tirado un dato exacto en 17 rutinas **sin poder recuperarlo
despues**, y `plannedSecondsSource` ya permite al consumidor estricto ignorarlo.

§6.4 pasa a separar las tres familias, y dice el limite de las rondas por
escrito: ahi **la retencion la suelta el usuario**, asi que su plan cubre solo la
parte respirada y queda por debajo del activo real.

### La red

El aserto que fija la identidad de Foco vive sobre la **funcion pura**, porque
conducir un bloque de foco entero costaria 25 minutos virtuales de reloj.
Calibrado en rojo devolviendo `focus.<min>`: cae, y cae solo el suyo.

---

## [v0.102.1] -- 2026-08-20 -- fix(runner): el circulo deja de moverse a cualquier altura

**El usuario lo reporto con capturas de su portatil y de su telefono, y tenia razon
en los dos.** El anclaje que s171 puso —y que s172 dio por bueno— era un ACANTILADO:

| viewport | min-height | salto |
|---|---|---|
| 1280x900 | 648px | 0 px |
| 1280x880 | 633px | 3 px |
| **1280x879** | **auto** | **61 px** |
| 390x844 | 591px | 0 px |
| **360x730** (su movil) | **auto** | **53 px** |

Sus dos pantallas caen JUSTO por debajo de los suelos (780 movil / 880 escritorio).

**La causa esta un nivel mas arriba de donde la buscaron s171 y s172.** `centerBody`
centra con `margin:auto` (s112) un bloque cuya ALTURA VARIA con el contenido; el
centrado reparte una holgura distinta en cada pantalla y el circulo baja la mitad de
esa diferencia. El footer (89 -> 39 px al pasar de dos filas de controles a una) es
**una** de las fuentes de variacion, no la unica: la otra es el propio contenido (la
pantalla de colocarse no pinta contador). Ningun `min-height` del bloque podia
arreglarlo por debajo del suelo, porque ahi el bloque ya no llega a ese alto.

**El arreglo**: se anula el margen SUPERIOR y se conserva el inferior, acotado al
runner v1 con `:has()` y con `!important` —el margen es un estilo EN LINEA, y sin el
la regla se aplica, no falla, y no cambia nada—. La holgura cae debajo, que es donde
s171 la queria. **Medido en 8 viewports: 0 px en los ocho.**

Y los **3 px que aun movian el NOMBRE**: la reserva del rotulo vacio era `1.2em` y el
rotulo lleno se pintaba con el interlineado normal de la fuente (~1.45). Se fija
`line-height: 1.2` y las dos formas miden lo mismo **por construccion**, en vez de que
una reserva adivine lo que la otra mide. **El trinquete de `runner-circulo.spec.js`
baja de 30 a 0**, que es lo que su propio comentario mandaba hacer si esto se arreglaba.

**Troceo**: el CSS del runner sale a `app/move/MoveSessionV1.css.jsx` (211 lineas) —
el support rebasaba las 500 y la regla §1 dice trocear, no recortar comentarios.

> **La trampa de los backticks dentro del template literal del CSS mordio TRES veces
> en este mismo cambio** (s139, s156, s157, s158, s162, s171 y ahora s172b), y dos de
> ellas con la salida del build silenciada: las medidas salian identicas y parecia que
> el arreglo no servia. **Si una medida no cambia cuando deberia, mirar PRIMERO si el
> build paso.** La cabecera del archivo nuevo lo lleva escrito.

---

