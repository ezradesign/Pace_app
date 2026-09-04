# PACE · Estado del proyecto

> **Presente + proximo.** Para el historial, ver
> [`CHANGELOG.md`](./CHANGELOG.md) (versiones) y
> [`docs/sessions/`](./docs/sessions/) (diario de trabajo).
>
> **Al cerrar sesion:** escribir el detalle en `docs/sessions/session-NN-xxx.md`,
> destilar una entrada en `CHANGELOG.md`, y **sustituir** (no anadir) la
> seccion "Ultima sesion" de este archivo. Este archivo no debe crecer.

---

**Version actual:** v0.114.1 (s183 — **EL LOGRO QUE HABLABA EN ESPANOL, Y OCHO PREMISAS QUE YA NO ERAN**. Cierra el unico defecto medido y **publicado** que quedaba de s182: con la app en ingles la fila del ultimo logro decia «Regresas». **Sobrevivio a s167 porque entonces esa superficie no decia ningun nombre** -- pintaba cinco sellos sin texto-- y **s180 los sustituyo por UNA fila con el nombre** sin que nadie tocara i18n. Dos asertos nuevos con dos mutantes que muerden, y el de espanol sigue verde con el primero: el par no se mide a si mismo. **185 → 187.** Y la **AUDITORIA DE PREMISAS** que encargo el usuario, reutilizando los checkers de s178 y atacando la clase que aquellos declararon no poder ver. **Ocho hallazgos**, y el mas peligroso es que **la musica pide dos cosas incompatibles a la vez** -- los briefs quieren «200 Hz-3 kHz despejado» y s177 midio que eso es justo lo que hacia la pieza inaudible. `CLAUDE.md` tenia **cuatro datos falsos**, `EVENTOS_SCHEMA.md` decia «ninguna parte se ha cableado» con 1.453 lineas vivas, el troceo de >500 de la Fase 8.5 **ya estaba hecho**, y `CONTENT.md` lleva **77 versiones** de deriva. **Tanda 0 ejecutada**: cinco documentos corregidos. De Stats se decidio mucho y **no se implemento nada**.)

## Red de seguridad -- archivos vivos

> Mapa de archivos y **version actual**. El HISTORIAL por archivo (que sesion cambio que) se
> archivo en [`docs/archive/RED_DE_SEGURIDAD_HISTORICO.md`](docs/archive/RED_DE_SEGURIDAD_HISTORICO.md);
> para el detalle de un cambio concreto, `CHANGELOG.md` y `docs/sessions/`.

| Archivo | Rol | Version |
|---|---|---|
| `app/ui/library-rules.js` | **LAS REGLAS DE LAS BIBLIOTECAS, SIN UI (s174)**: filtros, orden, «Para ahora», la tira de glifos y la linea de series, como funciones puras. Viven aparte para que se puedan asertar **sin abrir un navegador** — dentro del componente, la unica forma de probar que «Corto» filtra bien seria levantar Chromium y contar tarjetas. **El umbral de «Corto» es RELATIVO** y se calcula (el mayor cuyo recuento no pase de la mitad): con ≤3 min fijo dejaba **12 de 14 en Mueve** —quita dos: no filtra— y 3 de 14 en Estira, porque Mueve va de 1 a 4 min y Estira de 2 a 6. **`var`/`function` a proposito**: un `const` no cruza la IIFE del artefacto | **NUEVO s174 · 188 ln** |
| `app/ui/RoutineCard.jsx` | **LA TARJETA, compartida por las TRES bibliotecas (s174)**. Sale de `BreatheLibrary.jsx`, donde vivia desde s34 por accidente historico. **NO es un boton gigante**, y eso no es estilo: un elemento con `role=button` vuelve **presentacionales a sus descendientes**, asi que el nombre dejaba de existir como encabezado — la primera version lo hacia y **tumbo 9 tests**. El encabezado lleva DENTRO un boton que se extiende sobre toda la tarjeta con un `::after`; se conserva el encabezado y se gana el teclado, que `Card` nunca tuvo. **La pill va FUERA del `<h4>`**: dentro, el nombre accesible pasaba a ser «Cuello · 3 min SUAVE». El gating de contenido (`access` + `canAccessRoutine`) viajo con ella, intacto | **NUEVO s174 · 155 ln** |
| `app/ui/library.css.jsx` | **LA HOJA DE LAS TRES BIBLIOTECAS (s174)**, inyectada con su guard de id. Va en CSS y no en estilos en linea porque el color de modulo se comporta **distinto en cada piel** —filo en reposo en movil, solo en el hover en escritorio— y eso es una media query; con estilos en linea haria falta un listener de resize. **El breakpoint es 768/769, el MISMO que `--pace-skin`**. Recorta el chrome del modal solo para esta superficie con `:has(.pace-lib)` y **con `!important`, que no es pereza**: el padding del modal es un estilo EN LINEA y sin el las reglas no mueven un pixel. **Ni un backtick dentro del template literal** — el build aborta (trampa de s172b, que se cobro una pasada en s174) | **NUEVO s174 · 300 ln** |
| `app/ui/LibraryShell.jsx` | **LA PANTALLA DE MUEVE Y ESTIRA (s174)**, que son gemelas. Respira NO la usa: se ordena por TIEMPO y no por contexto. **El estado de filtro vive aqui y NO en `pace.state.v2`** —un filtro es una intencion de este momento, no una preferencia— y **se limpia a mano al cerrar**, porque el modal se OCULTA y no se desmonta. **Un grupo vacio PORQUE sus rutinas subieron a «Para ahora» no se pinta**: si se pintara, su linea diria que faltan por el filtro cuando estan dos dedos mas arriba (lo destapo calibrar en rojo). El «Para ahora» de movil va **FUERA de la rejilla**: dentro, un subarbol oculto envenena toda consulta a `.pace-lib-rejilla` | **NUEVO s174 · 199 ln** |
| `app/ui/SessionPrep.jsx` | **LA PANTALLA DE PREPARACION (s174)**, extraida de `SessionShell.jsx` al pasar aquel de 500 lineas. **Puede llevar el ARTE de la rutina**, y lo DERIVA ella sola de `routine.steps[0]` — los dos runners no le pasan nada, o «que dibujo enseña y de que tamaño» seria una decision escrita en tres sitios. El tamaño sale de `v1GlyphSizeAhora`, **la misma fuente que el circulo del runner**, por eso el relevo no salta. **El circulo va PRIMERO y el rotulo debajo**: con el rotulo encima el dibujo pegaba un salto de **171 px** (escritorio) y **221** (movil) al terminar la cuenta. Respira no se entera: sus rutinas no tienen `steps` | **NUEVO s174 · 137 ln** |
| `app/ui/library-transition.js` | **LA CAPITULAR VUELA A LA SESION (s174)** — el pago de que la biblioteca no lleve wash. **Aterriza en la CUENTA ATRAS y no en el circulo del runner**, que es lo que el diseño decia: medido, entre los dos hay **dos pantallas y 3.114 ms**, asi que no hay movimiento continuo hasta alli. **Coge la copia VISIBLE de la tarjeta**: «Para ahora» esta dos veces en el DOM y con un `querySelector` a secas **en movil no volaba nada**. Se retira en silencio si falta cualquier pieza, y con `prefers-reduced-motion` no anima — usa la Web Animations API sobre un CLON, que el kill de s160 no toca, por eso comprueba la preferencia a mano | **NUEVO s174 · 133 ln** |
| `tests/sidebar-altura.spec.js` | **QUE LA SIDEBAR QUEPA ENTERA (nace en s181**, al pasar el spec de redesign de 500 lineas). 3 tests a 1000/836/800/714/660/620: que cabe y **nada se recorta por dentro**, que la composicion de LAYOUT es identica y solo cambia el factor de escala, y que **encoger no hunde los objetivos tactiles** bajo WCAG 2.2 AA (la semana, 45 → 37,1 px). **Calibrados en rojo**, y el orden de los asertos se corrigio calibrando: el primer rojo tiene que nombrar la causa, no el efecto. **Declara lo que NO cubre**: el camino del `ResizeObserver`, que bajo headless no dispara | **v0.113.0** |
| `tests/sidebar-movil.spec.js` | **QUE EL CAJON DE MOVIL QUEPA, Y QUE POR DEBAJO DEL SUELO SE DESPLACE SIN RECORTARSE (s182)**. Nace porque `sidebar-altura` declaraba por escrito «NO CUBRE: movil», y eso dejo de ser cierto al encender la escala alli. **Cada viewport es su propio `describe` con `test.use`** y no un `setViewportSize`: asi la pagina nace en su tamano y se prueba el camino que recorre un telefono al abrir, sin el parche de emitir `resize` a mano. **El aserto clave no mira alturas**: hace scroll y comprueba que el pie SE VE, porque el fallo que la lente puede causar es un recorte MUDO. Y el suelo se le PREGUNTA a la app (`window.SUELO_CAJON`) en vez de copiarlo -- por eso hace falta ademas el aserto de WCAG, que es el unico que caza un suelo temerario. 12 asertos, 6 mutantes calibrados en rojo | **NUEVO s182 · 12 tests** |
| `tests/biblioteca.spec.js` | **LAS TRES BIBLIOTECAS REDISEÑADAS (s174)**. 7 tests, **7 mutantes y los 7 muerden**. Todo RELACIONAL: **el catalogo se lee de las FUENTES, no de la pagina** — no se puede leer de la pagina (`EXTRA_ROUTINES` y `BREATHE_ROUTINES` son `const` y no cruzan la IIFE), y aunque se pudiera, cruzar la pantalla contra un dato de esa MISMA pantalla no prueba nada. **El reloj va congelado** con `setFixedTime`: «Para ahora» rota por DIA y sin fijarlo hay asertos que muerden un martes y no un miercoles. **Toda consulta filtra por lo VISIBLE**, que costo cuatro medidas equivocadas antes de acotarlo | **NUEVO s174 · 7 tests** |
| `tests/transicion-biblioteca.spec.js` | **EL VUELO DE LA CAPITULAR (s174)**. 5 tests, **5 mutantes**. El que importa **no dice ninguna cifra**: compara el circulo de la preparacion con el del paso y exige que midan lo mismo **y esten en el mismo sitio** — el tamaño es una decision viva. Vuela **en las dos pieles** (el fallo de movil no lo habria cazado ningun aserto de la biblioteca), con reduced-motion **no anima y aun asi se entra**, y Respira **no se entera**. Dos asertos **pasaban por carrera** y se corrigieron: el vuelo no empieza en el clic sino un frame despues de montarse la preparacion. **Un mutante NO muerde con razon** y esta dicho: la limpieza del clon tiene dos caminos a proposito | **NUEVO s174 · 5 tests** |
| `tests/eventos-retencion.spec.js` | **LA RETENCION POR CALENDARIO (s174)**, la de `pace.events.v1` — **`tests/retencion.spec.js` es OTRA**, la de la apnea de Respira. 4 tests, **4 mutantes**. El que importa es **«se dispara SOLA en el arranque»**: estar implementada no servia de nada. **Ningun numero de dias vive dentro** (el suelo se lee de `eventsRetentionFloorKey`). Y una leccion del calibrado: **comparar el JSON del contenedor no prueba que no se escriba** —reescribir lo mismo da la misma cadena—, asi que se espia `setItem` con control positivo en la misma prueba | **NUEVO s174 · 4 tests** |
| `app/main/_responsive.atmosfera.js` | **EL JS QUE COMPONE LA LUZ (s163)**, cortado de `_responsive.js`. Construye como CADENAS los degradados y mascaras que la hoja interpola — halo, limbo, bloom, horizonte y las paradas de color de la hora — y **no tiene ni una regla CSS**. Publica `window.paceAtmosfera` con los **13** nombres que la hoja usa y ni uno mas: la lista se derivo de las 22 interpolaciones reales y el troceo la asertaba. Un objeto y no 13 globales a proposito. **CARGA ANTES** de `_responsive.js`, que lo desestructura en su cuerpo | **NUEVO s163 · 396 ln** |
| `app/main/_responsive.pieles.js` | **LAS DOS PIELES (s163)**, cortadas de `_responsive.js`: el `@media (max-width: 768px)`, el de pantallas cortas y el `@media (min-width: 769px)`. **Cero interpolaciones** (medido), asi que no lleva una linea de logica. **SE INYECTA DESPUES de `_responsive.js` Y ESO ES CONTRATO**: `--pace-skin` vale `movil` en la hoja base y `escritorio` aqui, las dos veces sobre `:root` — misma especificidad, gana la de despues. Al reves, la home de escritorio se cree movil y `main.jsx` (s160) renderiza el orden de lectura equivocado | **s163 · s169 · 478 ln** |
| `app/motion.css` | **EL COMPORTAMIENTO (s163)**, cortado de `tokens.css`, que se queda con los VALORES. Aqui viven el cruce entre paletas (s161, con sus `@property` y los dos atributos del fundido), el kill de `prefers-reduced-motion` y los dos packs de microinteracciones de s99. **Su `<link>` va entre `tokens.css` y `paths/paths.css`**: aquella declara `[data-pace-reveal] > *` y esta lo anula por ORDEN | **NUEVO s163 · 400 ln** |
| `app/state-core.palette.jsx` | **COMO LA PALETA LLEGA AL DOM (s163)**, extraido de `state-core.jsx`: `applyTheme` y los dos marcadores del cruce (`data-pace-palette-ready`, `data-pace-palette-crossing`, s161). **El estado entra por PARAMETRO** — carga ANTES de `state-core.jsx` porque `applyTheme(_state)` se llama en el CUERPO de aquel, y alli todavia no existe ni `_state` ni `getState`. Las REGLAS que consumen esos atributos viven en `app/motion.css` | **NUEVO s163 · 107 ln** |
| `app/tweaks/TweaksPanel.support.jsx` | **ESTILO SIN UI del panel de Ajustes (s163)**: `tweaksStyles`, la hoja responsive del bottom sheet (s27) y `TWEAKS_PILL_TRANSITION` con el porque del boton fantasma de s139. Patron de `Sidebar.support.jsx`. **Los dos nombres viajan por `window`** porque un `const` no cruza la IIFE del build (trampa de s148) | **NUEVO s163 · 100 ln** |
| `PACE.html` | Entry point de desarrollo modular | **v0.92.0** |
| `PACE_standalone.html` | Bundle offline autocontenido — export BAJO DEMANDA (s134), NO se regenera al cerrar | **v0.71.0** |
| `index.html` | Artefacto WEB/PWA canonico (mismo compilado + `<link rel="manifest">`). **Es lo que conduce la suite E2E de s154**, nunca `PACE.html` | **v0.92.0** |
| `tests/runner-circulo.spec.js` | **EL CIRCULO DEL GLIFO (s171)**: que mida lo mismo y este en el mismo sitio en todos los pasos, que **los dos runners coincidan** y que las miniaturas del preview no se pisen. **Ni un numero de pixeles vive dentro**: el defecto no era un tamaño equivocado sino **dos superficies que no coincidian**, asi que se aserta la igualdad, no la cifra — que ademas es una decision de diseño viva. La deriva va **parametrizada por PIEL con guard de `--pace-skin`**: escrita solo contra el viewport del config (1280×720) **habria pasado en verde antes del arreglo**, porque a esa anchura las reservas ya existian desde s119. Lleva **control positivo** de que legacy y v1 siguen siendo dos runners (si aquella rutina se migrara, el test compararia v1 consigo mismo) y **guard de cero** en cada bucle. Los tres asertos de **desborde en retrato** son el precio de extender las reservas a movil, vigilado en vez de anotado. **Los 8 calibrados en rojo** | **NUEVO s171 · 8 tests** |
| `tests/topbar-pill-movil.spec.js` | **LA PILL EN MOVIL (s169)**: las 9 combinaciones del gate de dos suelos (`min-width: 390` + `min-height: 760`), cada suelo con su pareja al otro lado. Cruza la pill contra **TODOS** los `button, a, [role=button]` **del documento** y no contra un subarbol — el banco de s168 miraba `[data-pace-topbar] > *` y daba verde a 320 px mientras la pill pisaba el **boton de menu**, que **no es hijo de la topbar**. El aro se mide **A/B dentro del mismo viewport** (con la pill y con la pill a `display:none`), nunca contra una constante escrita aqui. Y aserta el **orden de foco de la topbar**, que `home-a11y.spec.js` **excluye a proposito** al filtrar a `[data-pace-home-stack]` | **NUEVO s169 · 11 tests** |
| `app/move/MoveSessionV1.css.jsx` | **LA HOJA DE ESTILO DEL RUNNER V1 (s172b)**, cortada del support al rebasar este las 500 lineas. El pulso de las reps, **el anclaje del bloque** (alineado ARRIBA desde s172b: los `min-height` en vh solo funcionaban por encima de sus suelos y con un pixel menos se apagaban enteros) y los tiers de compactacion por ALTURA. No exporta nada: se inyecta al cargar con su guard de id. **Ni un backtick dentro de su template literal** — el build aborta y las medidas siguientes corren contra el artefacto viejo | **NUEVO s172b** |
| `app/state-events.jsx` | **EL EMISOR de `pace.events.v1` (s172)**: el puente entre el dominio y el envelope. Los cuatro tipos, en **dual-write** junto a la escritura legacy, y con el `paceEventsAppend` **fuera de `app/events/`** a proposito — el gate del verify define «emisor» asi. Dentro viven el mapeo de `kind:'body'` **por catalogo** (`resolveBodyRoutine`, nunca por prefijo), el `routineId` sintetico de Foco, el `pathRunId` leido de `paths.current` y la memoria del `runId` para correlacionar el feedback. **No se mueve de sitio.** | **NUEVO s172** |
| `tests/eventos-emisor.spec.js` | **QUE EL EVENTO LLEGA, Y CON QUE (s172)**. 7 tests, **10 mutaciones y todas muerden**: una sesion de cuerpo deja UN `session.completed` con su payload y el feedback **comparte su `runId`** · salir por «Salir» no emite · el **censo relacional** del mapeo `kind:'body'` contra el catalogo entero, **con prueba negativa** (si ningun id contradice ya su prefijo, avisa de que el censo se volvio tautologia) · un Camino agrupa pasos y cierre bajo un mismo `pathRunId` · el feedback de otra rutina **no** se cuelga de la ultima sesion · Respira emite su plan declarado · «Finalizar» a mitad es `early`. **Se ordena por `stepIndex`**: el almacen guarda por instante y desempata por `id` aleatorio, y los tres pasos caen en el mismo milisegundo | **NUEVO s172 · 7 tests** |
| `tests/glifos-por-lado.spec.js` | **EL ESPEJO POR LADOS (s172)**. 2 tests, **4 mutaciones**: el glifo no se espeja en un paso que no es `perSide`, el primer lado va tal cual, **la transicion ya pinta el lado que entra** (la pantalla lo anuncia) y el segundo lado lo mantiene; mas la politica pura de `v1LadoGlifo` caso a caso. Lee el `transform` **computado**, no el atributo. **Lo que NO prueba, y esta dicho en la cabecera**: que el lado dibujado sea el anatomicamente correcto — en una figura de perfil eso no es legible ni con un dibujo propio | **NUEVO s172 · 2 tests** |
| `tests/eventos-backup.spec.js` | **EL BACKUP LLEVA `pace.events.v1` Y LO DEVUELVE (s169)**, condición de entrada de la Fase 2. Defiende la frase de `privacy.html` **entera**: exportar todo tu estado **e importarlo en otro dispositivo**. Tres asertos, los tres en rojo primero — el export leído sobre **el archivo que el navegador descarga de verdad** (no el objeto que lo construye) · un backup **con** sección devuelve ese historial en vez de reiniciarlo, con el número de partida DISTINTO para que reinicio (0) y fusión (11) fallen los dos · y una sección **corrupta** aborta el import **entero**, incluido `pace.state.v2`. Su primera versión comparaba el estado ENTERO y salió roja con el producto sano: la app re-persiste su propio estado al arrancar | **NUEVO s169 · 3 tests** |
| `tests/paleta-auto.spec.js` | **EL MODO AUTO DE PALETA (s161)**: que Auto siga al sistema **en caliente** y que a mano NO lo siga (las dos mitades en la MISMA prueba, o «no cambia» podria significar que el gesto no llego a producirse) · que un **bloque vivo SUSPENDA** el cambio —tambien pausado— y que al terminarlo entre **solo** · que el primer papel entre **seco** · que **nadie persiga al token** durante el cruce · y que en Auto un dia en oscuro **no cuente** para el logro secreto, con **control positivo en la misma prueba** (a mano SI cuenta). **Todos RELACIONALES**: ninguno dice de que color es la paleta ni cuantos tokens cruzan. **Tres trampas medidas viven aqui**: en Ajustes hay **DOS** botones «Automatico» (idioma y paleta) y `getByRole` sin acotar revienta por strict mode · con Auto, `emulateMedia` **corre contra la navegacion** y bajo carga la prueba se sembraba su propio defecto · y el guard de cero va en **dos ejes** (frames mirados Y valores distintos del token), porque contar frames solo mide cuanto se miro, no que lo mirado se moviera | **NUEVO s161** |
| `tests/home-a11y.spec.js` | **EL ORDEN DE LECTURA DE LA HOME (s160)**: recorre con **Tab de verdad** y exige que el foco **nunca retroceda** en pantalla, en las dos pieles. Cierra la deuda WCAG 2.4.3 que s156 documento y decidio no asertar. **Aserta el CONTRATO, no el mecanismo**: el orden del DOM no se toca en el aserto, para poder arreglarlo manana de otra forma. Lleva **guard de piel** (`--pace-skin`): sin el, la prueba de escritorio mediria la de movil, que nunca tuvo el defecto, y pasaria sin demostrar nada | **NUEVO s160** |
| `scripts/verify.js` | **Red de seguridad LOCAL** (`npm run verify`, s150): `node --check` de todos los `.js` + build con salida 0 + **analisis de AMBITO del artefacto** (el crash de s144) + biyeccion `app/` ↔ `PACE.html` + coherencia de version. **Restaura los dos artefactos byte a byte**; imprime sus propios huecos en cada pasada. **s152: orquesta ademas la tanda [4/4]** y lee `PACE.html` UNA vez para las dos que la necesitan | **415 ln · s152** |
| `scripts/verify.integridad.js` | **Segunda tanda del verify (s152)**: integridad de **i18n · precache · glifos · catalogos**. **NO es un script suelto** — lo invoca `verify.js` como su tanda `[4/4]` en cada `npm run verify`; vive aparte solo por el limite de 500 ln. Dos clases de comprobacion que **no se mezclan**: RELACIONAL (sin numero, no caduca) y **CENSO** (los numeros esperados, TODOS en la constante `CENSO`, que se sube a mano cuando el contenido crece a proposito). Carga cada archivo **en su propia IIFE** —`GLYPH_SVG` es `const` en dos archivos— y declara sus propios huecos. **s155: suma la tanda de `pace.events.v1`**, cinco comprobaciones RELACIONALES (cero red en `app/events/` · una fuente de verdad por dominio · reset por la barrera · import por la barrera · **el gate export ↔ emisor**) mas su **guard de cero**. La de «cero red» **mira el CODIGO SIN COMENTARIOS** (Babel con `comments:false`): las cabeceras de `app/events/*` NOMBRAN `fetch` y `WebSocket` para prohibirlos, asi que un grep a secas **se autoinculpa** — la trampa de s146 por otra puerta. **s168: dos comprobaciones mas** — familia declarada y VACIA (el panel itera `CAT_META`, asi que pintaria su cabecera con nada debajo) y **`labelKey` sin cadena i18n en los DOS idiomas** (pintaria la clave cruda); para la segunda, `chequeaI18n` pasa a **devolver** las cadenas, porque eran dos tandas que no se hablaban | **s168 · 451 ln** |
| `scripts/verify.sandbox.js` | **EL `window` DE MENTIRA Y EL CARGADOR POR IIFE (s168)**, cortados de `verify.integridad.js` cuando aquel llego a **503 ln** al ganar dos comprobaciones y el propio verify se puso rojo por la regla §1. Se eligio ESTA costura y no la de una tanda porque aqui **no hay ni una comprobacion**: es infraestructura pura, no aserta nada y no conoce el dominio, mientras que mover `chequeaLogros` habria arrastrado `censo`, `CENSO` y `listaCorta` detras. Los **nombres locales se conservan** en el sitio de donde sale, asi que las 5 llamadas de las tandas no cambian | **NUEVO s168 · 78 ln** |
| `.github/workflows/ci.yml` | **Red de seguridad REMOTA (s153)** — un job, `verify`, en `ubuntu-latest` con Node 24: `npm ci` -> **`npm run verify` invocado tal cual** -> frescura del artefacto. **No comprueba nada que no corra en local**: vigilancia nueva se anade al `verify`, NO aqui, o el CI se vuelve un oraculo que nadie sabe interrogar. **Lo unico propio** es que el `index.html` **committeado** sea el build de las fuentes — el `verify` no puede, su aviso de deriva es `[INFO]` a proposito. **Dos cosas que no se pueden simplificar**: el diff va **ACOTADO a `index.html`** (a secas seria rojo SIEMPRE por el standalone congelado de s134) y se compara con **`git diff`, nunca con un hash** (el worktree de Windows deja 500 bytes CR dentro del artefacto). Proteger `main`: instrucciones en `docs/WORKFLOW.md` §8, **accion del usuario**. **s154: pasa a DOS jobs** — se suma `e2e`, que invoca `npm run test:e2e` con **`needs: verify`** (la suite carga el `index.html` COMMITTEADO, y es el job de arriba el que acaba de probar que esta al dia). Va aparte y no como pasos del primero porque el `verify` son ~5 s sin dependencias y esto descarga un Chromium de ~115 MB | **s154** |
| `playwright.config.js` | **Configuracion de la suite E2E (s154)**. Levanta `.claude/static-server.js` como `webServer` y apunta a **`/index.html`** explicito (el servidor mapea `/` a `PACE.html`, el entry de DESARROLLO). Fija a proposito **`locale: es-ES`** (los textos asertados son los espanoles; `detectInitialLang` los elige), `timezoneId`, **`colorScheme: light`** (o la prueba de paleta no tendria de donde salir) y **viewport 1280x720**. **`retries: 0`**: un test que solo pasa al segundo intento esta diciendo algo. Sin `devices[...]`, que puede traer un `channel` exigiendo un Chrome del sistema | **NUEVO s154** |
| `tests/helpers.js` | Utilidades compartidas de la suite. **Tres trampas medidas viven documentadas aqui**: (1) la semilla de `firstSeen` se escribe **SOLO SI FALTA**, porque `addInitScript` corre en CADA navegacion y a secas machaca el estado en los `reload()`; (2) los matchers comparan **`textContent`**, no lo que se ve — `innerText` trae el `text-transform` de CSS aplicado; (3) contar sellos exige **acotar a `[data-pace-modal-backdrop]`** (s152), y por eso el contador ofrece las dos cuentas: para poder asertar la diferencia | **NUEVO s154** |
| `tests/eventos.spec.js` | **12 tests de `pace.events.v1` (s155)**. Defienden promesas escritas en una pagina **PUBLICA** (`privacy.html`) y en el diseño: activacion **idempotente** (si `activatedAt` se moviera, cada arranque recapturaria el baseline y **contaria de mas**) · **cero peticiones fuera del origen** mientras opera el contenedor, medido en el **cable** · la **lista permitida** del payload descartando `notaLibre`/`ip`/ruta de archivo · `reset` y el **«Borrar todos mis datos» de Ajustes** borrando los DOS almacenes · un **backup antiguo** reiniciando el contenedor por la UI real · `replaceFromImport` dejando **1 y no 7** · seis snapshots invalidos rechazados con el contenedor **byte a byte** igual · **DOS pestañas de verdad** emitiendo a la vez sin perder un evento (el **P0** del diseño) · marcador y **recuperacion idempotente** | **s155 · v0.88.1** |
| `tests/home.helpers.js` | **Utilidades compartidas de la home (s159)**: la semilla del Camino en curso, la sonda unica de geometria, el parser de px y la espera a que la home se asiente. Extraidas al partir `home-geometria.spec.js`, que habia llegado a **631 lineas** — **ni una linea de cuerpo cambio**. **s160: nace `asentarGeometria()`**, que espera a que `--pace-timer-d` **repita valor tres frames seguidos** — el motor converge en varias pasadas y con la suite en 8 workers no le caben en dos frames (medido: el aro leido a destiempo daba **420 px**, su valor de PARTIDA). **NO se mete dentro de `asentar`** a proposito: lo llaman veinte sitios, algunos con `page.clock` instalado, y ahi rAF **solo corre cuando el reloj avanza** | **s160** |
| `tests/home-luz.spec.js` | **El CONTRATO de la atmosfera (s158, extraido en s159)**: cuando existe, de donde saca el color, que no toca la geometria y que se apaga sola. **s159 suma el alcance de la cola**, el unico aserto que mira PIXELES — y declara lo que no puede medir: halo y cola son un campo continuo, y separarlos por bandas de filas no funciona (Actividades **sube sobre el aro** por el solapamiento, y los chips opacos se comen las filas cercanas). Ese aserto **no se ha conseguido poner rojo**, y se dice | **NUEVO s159** |
| `tests/home-luz-curva.spec.js` | **La FORMA de la luz en el tiempo (s159)**: pico en la mitad, meseta 45-55 %, la hora con el mediodia centrado, el enfriamiento sin repunte y el maximo de calor centrado. **El calor se mide por el eje `b` de OKLab**, que es lo que el navegador ya devuelve —`--pace-luz` esta registrado con `@property`, asi que su valor computado llega como `oklab(L a b / alfa)`— y la presencia como alfa × envolvente × **distancia OKLab al papel**: la version con `max(0, L − L del papel)` es un modelo de papel OSCURO y en la paleta clara valia **cero en las diez paradas**, con el bucle comparando ceros. **Declara que no aserta la monotonia de la presencia compuesta en dia**, medida y presentada pero no compensada | **NUEVO s159** |
| `tests/home-geometria.spec.js` | **20 tests de la geometria de la home (s156, +6 en s159)**. Defienden que el motor gobierne **con y sin tarjeta de Camino** (estado real: un Camino en curso, sembrado, **nunca borrando nodos**), que se recupere al salir **sin resize ni evento manual**, que recorte y solapamiento **no puedan** desincronizarse, el orden VISUAL de las dos pieles, 320 px sin desborde, la atmosfera por **atributo estable** y reduced-motion. La de «el contador no despierta al observador» se prueba **sin instrumentar el codigo**: instala un MutationObserver con la MISMA configuracion sobre la MISMA raiz. **NO aserta el orden del DOM** a proposito — es deuda de a11y conocida y consagrarla la volveria intocable | **NUEVO s156** |
| `tests/*.spec.js` | **13 tests**: `artefacto` (es el compilado, consola limpia, precache real ↔ declarado) · `onboarding` (con estado limpio arranca AHI, y montado **detras** de la home en el DOM — la trampa de s153, convertida en aserto) · `checklist-foco` (Pomodoro con **reloj virtual** hasta el BreakMenu) · `checklist-cuerpo` (Respira + **modal de seguridad de apnea** + Mueve) · `checklist-estado` (Hidratate, Logros con toast, Tweaks, persistencia). **Al anadir un aserto: se pone ROJO a proposito** y se comprueba que muerde — `getByRole({name})` casa por **SUBCADENA**, asi que sin `exact: true` un renombrado sigue pasando | **NUEVO s154** |
| `app/events/events-payloads.js` | **ESQUEMA DE PAYLOADS (s155)** — la mitad de la capa A donde vive la **MINIMIZACION**: cada payload se reconstruye **campo a campo** desde una **LISTA PERMITIDA**, no desde una lista de campos prohibidos (que siempre se queda corta). Lo que no esta en el esquema **no puede colarse aunque nadie lo haya previsto** — medido: un payload con `notaLibre`, `ip` y una ruta de archivo sale con tres claves. **Carga ANTES de `events-model.js`** | **NUEVO s155 · 112 ln** |
| `scripts/verify.eventos.js` | **Tanda de `pace.events.v1` en el verify (s155)**. Como `verify.integridad.js`, **no es un script suelto**: aquella lo invoca dentro de la tanda [4/4]. Cinco comprobaciones RELACIONALES + guard de cero, y **dos de ellas defienden frases de `privacy.html`** en vez de invariantes internos. `listaCorta` llega **por parametro**: un segundo formateador daria mensajes distintos para el mismo problema | **NUEVO s155 · 176 ln** |
| `scripts/verify.encargo.js` | **EL ENCARGO DE ARTE DICE LA VERDAD (s169)**. Como `verify.eventos.js`, lo invoca `verify.integridad.js` en la tanda [4/4]. Cruza las filas de `docs/product/GLIFOS_LOGROS_ENCARGO.md` contra el mapa de máscaras REAL, **en las dos direcciones**: lo que sobra (ids que ya no existen) se ve leyendo, pero **lo que falta —un logro sin arte que el documento no menciona— NO**, y ése es el fallo por omisión. Cuatro comprobaciones **relacionales** (ningún número vive dentro; la cifra que compara es la que el propio documento afirma) más **guard de cero**, porque cambiar el formato de la tabla las apagaría todas en silencio. Nace porque el documento **pedía 38 dibujos cuando faltaban 19**: s167 entregó y nadie volvió a marcar la lista. **Los 7 rojos, verificados** | **NUEVO s169 · 162 ln** |
| `app/events/events-model.js` | **MODELO CANONICO de `pace.events.v1` (s155)** — capa A de `EVENTOS_SCHEMA.md`: envelope, tipos, payloads con **lista permitida**, correlacion tipada, orden canonico, retencion, baseline, presupuesto y export/validacion. **REGLA DURA: no nombra `localStorage`, `setItem`, `navigator.locks` ni SQLite.** Si una funcion de aqui necesita tocar el almacenamiento, esta en el archivo equivocado | **NUEVO s155 · 448 ln** |
| `app/events/events-adapter-web.js` | **ADAPTADOR WEB/PWA (s155)** — capa B: `localStorage` + **Web Locks**. Toda read-modify-write corre DENTRO del lock; esta **prohibido** cualquier sucedaneo con evento `storage`, heartbeat o `BroadcastChannel` (comunican pestañas, no dan exclusion). Sin `navigator.locks` **no se emite**. Trae la poda por **presion de presupuesto**, que **destila en `baseline` antes de borrar** — y el punto de extension declarado para la poda por calendario de la Fase 3 | **NUEVO s155 · 351 ln** |
| `app/events/events-adapter-null.js` | **ADAPTADOR INERTE (s155)**. NO es relleno: §20 prohibe que Capacitor caiga al adaptador web porque el WebView parezca `https://localhost`, y §19.2 que `file://` emita aunque el navegador exponga Web Locks. Apagar el registro **NO** convierte la app en solo-lectura (§19.5), y **no** se acumulan eventos «en memoria para guardarlos luego» | **NUEVO s155 · 70 ln** |
| `app/events/events-store.js` | **FACHADA (s155)**: detecta runtime (§20), elige adaptador y publica el contrato. **Nadie habla con un adaptador directamente.** Aqui vive la **barrera entre almacenes**: `pace.state.v2` y `pace.events.v1` no son atomicos entre si, asi que import y reset van marcador -> estado legacy -> contenedor reiniciado, y un corte a medias lo completa el arranque. Su cabecera documenta **que guarda, donde, para que y que NO guarda** | **NUEVO s155 · 293 ln** |
| `app/onboarding/Onboarding.jsx` | Orquestador del onboarding de primera vez: maquina de pasos 0-4, chrome… **s151: la placa de 3 valores va en `stretch` + columna flex con el label creciendo** — con `center` un label de dos lineas arrastraba su sub 8 px (alturas reservadas, s119) | **v0.84.0** |
| `app/onboarding/OnboardingScreens.jsx` | Piezas puras: ONBOARDING_QUESTIONS (definicion de las 3 preguntas) + OnbScene… | **v0.56.0** |
| `app/onboarding/pickFirstPath.js` | Primer Camino desde el perfil: candidatos por necesidad + sesgo por tiempo +… | **NUEVO s106** |
| `app/i18n/strings/onboarding.js` | i18n del flujo: navegacion + 3 preguntas + primer Camino, ES+EN | **NUEVO s106** |
| `vendor/` | React 18.3.1 production UMD self-hosted (react + react-dom .min.js) | **NUEVO s103** |
| `package.json` + `package-lock.json` | Toolchain del build (devDependencies) + scripts `build`, **`verify`** (s150) y **`test:e2e`** (s154). Sin campo `engines`: la version de Node del CI vive en el YAML | **s154** |
| `app/paths/illustrations/paths.index.js` | Indice de laminas: pathId → dots {x,y,r,color} + paper + focusY + finish… | **NUEVO s104** |
| `app/paths/illustrations/PathIllustration.jsx` | Escena cover full-bleed del runner: casquetes gris→color de actividad… | **NUEVO s104** |
| `app/paths/illustrations/assets/*.webp` | Las 7 laminas normalizadas (1365x768, WebP q82) | **NUEVO s104** |
| `scripts/ingest-lamina.js` | Ingesta de laminas: normaliza + mide bolas/papel + emite bloque del indice | **NUEVO s104** |
| `safety.html` | Pagina estatica `/safety` (Cloudflare Pages) -- disclaimers… | **v0.46.0** |
| `privacy.html` | Pagina estatica `/privacy` (Cloudflare Pages) -- local-first, sin… | **v0.46.0** |
| `app/state-entitlement.jsx` | Guard central de entitlement: `canAccessRoutine` / `canAccessPath` / **`hasPremiumEntitlement` (s149, para SUPERFICIES de pago sin `routineId`)** -- UNICO punto de verdad del acceso | **v0.82.0** |
| `app/custom/exercise-registry.js` | Registro interno de ejercicios (65 items / 8 grupos, curado a mano) +… | **v0.54.0** |
| `app/custom/CustomRoutines.jsx` | Seccion "Tus rutinas" en MoveLibrary (locked/empty/cards + crear) +… | **v0.72.0** |
| `app/custom/CustomBuilder.jsx` | Modal constructor 2 vistas (editor con steppers/reordenar/borrar 2-toques +… | **v0.38.0** |
| `app/state-custom.jsx` | CUSTOM_LIMITS + CRUD de customRoutines (sanitize + lectura defensiva) | **v0.38.0** |
| `app/i18n/content/custom.js` | Patch EN del registro: custom.ex.<name ES>.{name,cue} + custom.cat.*.label | **v0.54.0** |
| `app/glyphs/exercise-glyphs.jsx` | Sistema 1 (line-art): wrapper `G` + glifos de **MUEVE** + `DefaultGlyph` + `ExerciseGlyph`. Estira salio en s148 | **v0.81.0** |
| `app/glyphs/exercise-glyphs.extra.jsx` | Glifos de **ESTIRA** del sistema 1. **MUTA** `window.EXERCISE_GLYPHS` en vez de crear otro mapa (el componente cierra sobre esa referencia); carga DESPUES y lleva **guard que aborta** si se invierte el orden. Entre los dos, **47** | **NUEVO s148** |
| `app/glyphs/achievement-glyphs.jsx` | 34 glifos SVG heraldica para Logros (sistema 2) -- strings de SVG… | **v0.33.3** |
| `app/glyphs/achievement-masks.js` | Mapa `id de logro -> archivo de mascara` (**58**, sistema 3). Solo el mapa: el arte vive en `assets/logros/`. **Las rutas van enteras y literales, ni en comentarios** — el inliner del build sustituye cadenas | **NUEVO s146** |
| `app/glyphs/assets/logros/*.webp` | Las 58 mascaras (224 px, alfa = densidad de tinta; el color lo pone el token). **248 KB** | **s147** |
| `scripts/ingest-glifos-logro.js` | Ingesta del arte de logro: mapeo por **clave estable** (nunca por posicion) + igualacion de peso de tinta + reescribe mapa y precache. Regla D-4: se RE-CORRE, no se retoca un `.webp` | **s147** |
| `scripts/audit/glifos-v2.js` | Procesado compartido con la ingesta: deteccion y borrado del marco por angulo + encuadre + **suelo de papel ANTES del remuestreo, marco sobre el ORIGINAL** (s147) | **s147** |
| `scripts/audit/revision-glifos.js` | Hoja de revision del arte de logro -> `_revision-glifos.html` (ignorado por git). Pinta con el mecanismo REAL, a tamaño de sello y a 3x | **NUEVO s147** |
| `LICENSE` | Elastic License 2.0 en la raiz | Sin cambios desde v0.12.9 |
| `app/ui/pace-logo.png` | Logo oficial local | Presente; se inlinea en el standal… |
| `app/ui/Sound.jsx` | Sonidos sintetizados Web Audio | **v0.58.0** |
| `app/ui/SessionShell.jsx` | Cascara compartida de sesiones activas (+ `sessionAtmosphere` de UNA capa con alpha compuesto, `paceGlowRamp`, `PaceDither` y `PACE_GRAIN_OPACITY` — s140) | **v0.73.1** |
| `app/ui/SessionShell.responsive.js` | CSS responsive de las sesiones (IIFE que inyecta… | **NUEVO s116** |
| `app/ui/SessionFeedback.jsx` | Bloque de feedback del cierre («¿Te ayudó esta pausa?») — B2.2b-2 | **NUEVO s116** |
| `app/ui/RoutinePreview.jsx` | Preview «antes de empezar» (§18.3): requisitos, posicion, duracion, intensidad y pasos con glifo. Solo desde la BIBLIOTECA | **NUEVO s144** |
| `app/ui/Primitives.jsx` | Modal, Card, Tag, Button, Divider, Meta, PremiumSeal, displayItalic | **v0.44.0** |
| `app/tweaks/TweakSecretsWatcher.jsx` | Detectores de secretos | **v0.52.0** |
| `app/tweaks/TweaksPanel.jsx` | Panel de Ajustes (ejes + agua + notificacion + **Sesiones** + reset + legal… **s155: el reset borra los DOS almacenes** — `privacy.html` promete que desde Ajustes «puedes borrarlo todo» y que el borrado es «definitivo», y desde que existe `pace.events.v1` eso solo es cierto si pasa por `paceEventsStoreBarrier`. Lo aserta el `verify` y lo prueba la suite | **v0.88.0** |
| `app/tweaks/TweaksData.jsx` | Seccion "Tus datos" -- Export/Import JSON + msg + iconos + tweaksDataStyles. **s155: el import pasa por la barrera** y REINICIA `pace.events.v1` con `activatedAt` nuevo — un backup de PACE no trae seccion de eventos, y conservar el contenedor anterior junto a un estado importado seria la MEZCLA que §17 prohibe (el baseline describiria unos contadores que ya no son los de ese estado). **El export NO cambia todavia**, a proposito: sin emisores el contenedor esta vacio, y el `verify` tiene un GATE que lo exigira en cuanto aparezca el primero | **v0.88.0** |
| `app/tweaks/PremiumSection.jsx` | Superficie premium display-only (sello + input licencia disabled + copy… | **v0.34.5** |
| `app/breathe/BreatheVisual.jsx` | Respiracion - visual + getSequence | **v0.73.0** |
| `app/flags.js` | **Banderas de superficie** (Fase 1.6): `SHOW_TIMER_STYLE` / `SHOW_BREATH_ORGANICO`. La MISMA bandera oculta la opcion y gobierna la migracion del valor huerfano en `loadState`. NO es codigo muerto: leer su cabecera | **NUEVO s139** |
| `app/breathe/BreatheVisual.support.jsx` | Hoja inyectada del loto: keyframes de giro y **vela**, tinta por paleta, reparto de alto del centro y reclamo del hueco muerto. Extraido al rebasar BreatheVisual las 500 ln | **NUEVO s139** |
| `app/breathe/assets/loto.webp` | Loto de Respira como **MASCARA CSS** (640x640, 146 KB, alfa = densidad de tinta; el color lo pone el token) | **NUEVO s138** |
| `scripts/ingest-loto.js` | Ingesta del loto: recorte + mascara desde luminancia + WebP con alfa SIN perdida. Regla D-4: si llega arte nuevo se RE-CORRE, no se sustituye el .webp a mano | **NUEVO s138** |
| `app/breathe/BreatheLibrary.jsx` | Respiracion - biblioteca + seguridad (define `RoutineCard`, compartido por… | **v0.59.0** |
| `app/breathe/BreatheSession.support.jsx` | **EL RELOJ DE RETENCION (s166)**. Nace aqui y no dentro de `BreatheSession.jsx` por la regla §1 (aquel estaba en 480 de 500). **CARGA ANTES**: el componente lo llama en su cuerpo. Cuenta timestamp-based el tiempo en `hold` sin pausar. **NO es «empezar a contar la apnea»**: `activeMsRef` la suma desde s98; esto la saca a un numero propio. La linea que carga con el dato es la que suma el **segmento abierto** — y por eso `finish()` ya NO cierra el reloj a mano: eran dos mecanismos tapandose entre si y el banco de mutaciones demostro que asi ninguno se podia probar | **NUEVO s166 · 65 ln** |
| `app/glyphs/exercise-masks.js` | **EL MAPA DE MASCARAS DE EJERCICIO (s166)**, cuarto sistema visual de `app/glyphs/`. **NACE VACIO a proposito**: `ExerciseGlyph` le da PRECEDENCIA sobre su SVG, asi que con el mapa vacio la app pinta exactamente lo de ayer y **los 62 dibujos pueden llegar por PARTES**. Se indexa por **identidad visual** (`resolveVisualId`), no por nombre de ejercicio: mapear por nombre dejaria los alias apuntando a nada (s141). **Las rutas van enteras y literales, y NO pueden aparecer en los comentarios** — el guardarrail del inliner aborta el build | **NUEVO s166 · 57 ln** |
| `app/breathe/BreatheSession.jsx` | Respiracion - sesion guiada. **s165: el progreso de sesion se dibuja por FAMILIA DE RITMO** — barra **continua** en las 17 por tiempo, **segmentada por rondas** (con el bloque en curso marcado por carril, sin relleno por respiraciones) en las 3 de bloques, misma altura de 5 px. Lo que decide cual va donde es lo que la app SABE: las de rondas **no terminan por reloj** (la retencion no tiene duracion fijada, B1), asi que su `min` es NOMINAL. El hueco de la cuenta atras se reserva **por rutina** (`anyLongPhase`), no por fase — la razon de s138 sigue viva donde alguna fase llega a 4 s. **481 ln**, con los 6 hooks `data-pace-breathe-*` que hacen asertable el progreso | **v0.95.0** |
| `tests/respira-progreso.spec.js` | **EL PROGRESO DE RESPIRA (s165)**, lo primero que lo vigila: hasta ahora la sesion no tenia un solo `data-pace-*` y nada asertaba su avance. Cinco contratos, **los cinco puestos en rojo** contra producto saboteado: cada familia dibuja lo suyo (**el numero de segmentos se LEE de `data-pace-breathe-rounds`**, no se escribe a mano) · la barra no va una respiracion por delante · por tiempo empieza en cero y avanza · el hueco se reserva por RUTINA · la ronda se dice **una vez por pantalla**. **Dos trampas medidas viven aqui**: un `fastForward` grande NO avanza la sesion (el ticker se resuscribe por fase) y hay que ir de 1 s en 1 s; y por eso mismo el bucle es **caro** — leer contador, barra y retencion por separado daba ~500 viajes al navegador y **se comia el timeout con la suite a 8 workers pasando aislado**, asi que se abarata la medida a **una llamada por muestra** en vez de subir el plazo | **NUEVO s165** |
| `app/move/MoveModule.jsx` | MoveLibrary + **MoveSession dispatcher** (legacy vs v1) + StepGlyph… | **v0.72.0** |
| `app/move/move.data.js` | `MOVE_ROUTINES` (14 rutinas) + `getMoveRoutine` — extraido de MoveModule | **v0.64.0** |
| `app/move/MoveSessionV1.jsx` | Runner del **contrato de pasos v1** por MODO (place/work/change + side) | **v0.72.0** |
| `app/move/MoveSessionV1.support.jsx` | Soporte sin UI del runner v1: constantes + helpers de método/duración + CSS… | **v0.68.0** |
| `app/custom/exercise-aliases.js` | `VISUAL_ALIAS` + `resolveVisualId` — identidad visual compartida (visualId) | **NUEVO s110** |
| `app/extra/ExtraModule.jsx` | Modulo Estira (EXTRA_ROUTINES + getExtraRoutine) | **v0.72.0** |
| `app/hydrate/HydrateModule.jsx` | Tracker de vasos | **v0.21.0** |
| `app/shell/Sidebar.escala.jsx` | **EL MOTOR DE LA ESCALA (nace en s182**, al pasar `Sidebar.jsx` de 500 a 506 lineas). Mide la columna, calcula el factor y lo aplica; no sabe nada de secciones. **El corte no es por kilometraje**: `Sidebar.jsx` es el ORQUESTADOR y esto es geometria que mide el DOM. Aqui vive `SUELO_CAJON = 0,80`, el suelo de la escala en movil, con las dos medidas que lo eligen. **Lo dificil no es el factor sino de donde sale el alto disponible**: en escritorio lo da la lente (hijo flexible), y en el cajon la lente se dimensiona AL CONTENIDO, asi que preguntarle devuelve escala 1 -- verde, silenciosa y falsa. Alli manda el aside menos su padding, y hay que ALTAR la lente a mano con `--sb-alto` o recorta el pie sin barra que lo diga | **NUEVO s182 · 208 ln** |
| `app/shell/Sidebar.jsx` | Sidebar izquierdo colapsable — **solo ORQUESTADOR** desde s148 (compone secciones, no dibuja ninguna ni decide ninguna). **REESCRITO s180**: semana · Hoy · accion · logro · pie, compuestas en una **lista** con los separadores **entre** ellas. **s181: aqui vive EL CALCULO DE LA ESCALA** — mide el alto natural con `offsetHeight` (LAYOUT, que la transformacion no toca) y lo divide entre el alto de la lente; **nunca agranda**, y se redispara con `ResizeObserver`, `resize` **y `document.fonts.ready`** | **v0.113.0** |
| `app/shell/Sidebar.hoja.jsx` | **LA HOJA CSS INYECTADA (nace en s181** al pasar `support` de 500 lineas). Responsive del cajon, rejilla de Hoy, recorte del logo, y la geometria de **la lente y la envoltura que escala**. Aqui vive lo que NO puede ir en linea: React no crea pseudo-elementos desde un estilo en linea, no hay media queries en linea, y **un estilo en linea gana a la hoja**. **CUIDADO: todo va dentro de un template literal y un backtick en un comentario ROMPE el archivo** (ha pasado cuatro veces) | **v0.113.0** |
| `app/shell/Sidebar.support.jsx` | `sidebarStyles`, los estilos EN LINEA (la hoja se fue a `Sidebar.hoja.jsx` en s181). **Viaja por `window`** porque el build encierra cada archivo en su IIFE. **`accion` lleva `flexShrink: 0` desde s181** y no es cosmetico: con `overflow: hidden` un hijo flex pierde su minimo automatico y se come el deficit de la columna amputandose | **v0.113.0** |
| `app/shell/Sidebar.selectors.js` | **Los cuatro selectores PUROS de la sidebar (s180)** — `selectSidebarToday` · `selectSidebarWeek` · `selectSidebarPrimaryAction` · `selectSidebarLatestAchievement`. **No leen `window`**: los eventos entran POR PARAMETRO, asi que se prueban sin montar el almacen. Aqui vive el criterio de dia activo (foco/respira/cuerpo; **el agua sola NO**) y el indice lunes-primero | **NUEVO s180** |
| `app/shell/Sidebar.parts.jsx` | Piezas de UI del sidebar. **REESCRITO s180**: `SidebarToday` (rejilla 2x2 con los glifos de `ActivityBar`) · `sidebarActionView` + `SidebarPrimaryAction` · `SidebarWeek` (el bloque ENTERO es un boton) · `SidebarFooter` (lleva el ultimo logro) · `achMini` · `ChevronLeftIcon`. **RETIRADOS**: `SenderoDelDia`, `WeekDots`, `AchievementsPreview` y `StatusBar` | **NUEVO s148 · reescrito s180** |
| `app/main/_responsive.js` | Hoja responsive global de la app (IIFE que inyecta un `<style>`). **s160: dos cosas nuevas y ninguna es cosmetica** — (1) `transition-property: none` en `[data-pace-dial-fit]` y en sus **cuatro nodos interiores**, que es la condicion para que el motor de geometria pueda MEDIRLOS bajo reduced-motion (leer su fila en DECISIONES); (2) publica **`--pace-skin`** (`movil` global, `escritorio` dentro del `@media (min-width: 769px)`) y **desaparecen los `order`** del bloque de escritorio: el orden lo trae el DOM. **OJO AL EDITAR: ni un backtick dentro del template literal** — ha abortado el build en s139, s156, s157 y s158 | **s160** |
| `app/main.jsx` | Orquestador: shell + modales + sesiones + overlays. **s160: el stack de la home renderiza el orden canonico POR PIEL**, leyendo `--pace-skin` del estilo computado (no un tercer `matchMedia` con el 769 escrito otra vez) y con **`key` estable** en los tres bloques, porque sin ella React reconcilia por posicion y **remonta** tarjeta y ActivityBar al cruzar el breakpoint | **s160** |
| `app/focus/FocusTimer.jsx` | Modulo Foco (pomodoro). **s159: publica los CINCO mandos de la luz** en `[data-pace-home-body]` — `--pace-k` (la hora), `--pace-i` (la envolvente), `--pace-on` (interruptor), `--pace-pausado` (la pausa) y `--pace-arco` (el tono del recorrido, para que la cola lo herede). Aqui no se dibuja nada: son derivadas presentacionales de `progress` y `status`. **La PROFUNDIDAD de la pausa no se publica**, solo el interruptor: cuanto se recoge la luz es un valor por PALETA (`--sun-pausa`) y las paletas viven en CSS | **v0.90.0** |
| `app/focus/useCountdown.jsx` | Motor de cuenta atras timestamp-based compartido (FocusTimer home +… | **v0.47.0** |
| `app/ui/TimerDial.jsx` | Anillo circular compartido (FocusTimer + PathFocusStep) | **v0.73.0** |
| `app/breakmenu/BreakMenu.jsx` | Menu post-Pomodoro | **v0.73.0** |
| `app/achievements/Achievements.jsx` | UI pura del catalogo (modal + `Seal` + **`renderGlyph`, unico resolutor de glifo de logro**: mascara -> SVG -> caracter). El sello se ancla ARRIBA en la tarjeta (s147) | **v0.80.0** |
| `app/achievements/catalog.js` | ACHIEVEMENT_CATALOG (**96** entradas) + CAT_META (7 categorias) + IMPLEMENTED (**88**) + la regla de denominador unico de §15.4 | **v0.79.1** |
| `app/stats/PathYearView.jsx` | Heatmap anual de Caminos | **v0.28.5** |
| `app/stats/PathStats.jsx` | Seccion Caminos en Stats | **v0.28.4** |
| `app/stats/YearView.jsx` | Heatmap anual | **v0.52.0** |
| `app/stats/StatsPanel.jsx` | Panel stats | **v0.46.0** |
| `docs/WORKFLOW.md` | Protocolo de cierre de sesion Git | **v0.27.6** |
| `docs/audits/triaje-audit-integral-s149.md` | **Triaje** de la auditoria integral externa contra el CODIGO: las 9 decisiones abiertas (D1 bloquea), las 4 contradicciones con evidencia `file:line`, la clasificacion de §1 a §22 y los archivos a tocar. **Se lee antes de abrir cualquier frente que salga de esa auditoria** | **NUEVO s149** |
| `scripts/check-session.ps1` | Diagnostico Git solo lectura | **v0.27.6** |
| `app/state-history.jsx` | Utils de fecha + helpers de history + **`getHistoryWithToday` (stats vivos)**… | **v0.52.0** |
| `app/state-core.jsx` | Store, `loadState`, tema y toast. El rollover y las migraciones **salieron en s148** | **v0.85.0** |
| `app/state-core.support.jsx` | Deteccion de entorno + MIGRACIONES + rollover (`isMobileViewport`, `detectInitialPalette`, `migrateWeeklyStatsToHistory`, `reindexWeeklyStatsMondayFirst`, `rolloverIfNeeded`). **CARGA ANTES de `state-core.jsx` y NO ES NEGOCIABLE**: `let _state = loadState()` corre en el CUERPO del archivo, no al montar, y llama a cuatro de las cinco | **NUEVO s148** |
| `app/state-timer.jsx` | addFocusMinutes, completePomodoro, completeFocusSession | **v0.79.0** |
| `app/state-hydrate.jsx` | addWaterGlass | **v0.79.0** |
| `app/state-achievements.jsx` | unlockAchievement (ENCOLA, no avisa) + `flushAchievementToast` + detectores + complete*Session | **v0.79.0** |
| `app/state-achievements.support.jsx` | Soporte sin UI de los logros: contadores generalizados (`bumpCount`/`getCount`/`contarHoy`/`contarRutina`) + los 23 detectores que faltaban (volumen, exploracion completa, efemerides, secretos de hora) | **NUEVO s146** |
| `scripts/audit/logros.js` | Banco de medicion de la CURVA de logros: inventario estatico de `unlockAchievement` + simulacion con reloj controlable. `node scripts/audit/logros.js` | **NUEVO s146** |
| `app/state-paths.jsx` | Caminos CRUD + stats | **v0.52.0** |
| `app/state-settings.jsx` | setLang | **v0.27.5** |
| `app/state-feedback.jsx` | Feedback ligero por rutina (B2.2b-2): slice `routineFeedback` + acciones | **NUEVO s116** |
| `app/state.jsx` | Indice — re-export consolidado | **v0.60.0** |
| ~~`app/welcome/WelcomeModule.jsx`~~ | ~~Welcome de primera vez~~ | **RETIRADO s106** |
| `app/ui/Toast.jsx` | Notificaciones de logros — delega el glifo en `renderGlyph` (s147; era la 3.a copia del render) | **v0.80.0** |
| `app/support/SupportModule.jsx` | Boton + modal Buy Me a Coffee | v0.12.8 |
| `app/ui/CowLogo.jsx` | Logo component + lockup | **v0.28.9** |
| `app/main.jsx` | Orquestador puro (composicion + state + handlers + JSX root) | **v0.79.0** |
| `app/main/home-geometry.js` | Motor de geometria de la home (**las DOS pieles** desde s128): mide y publica en `:root` `--pace-timer-d`, `--pace-activities-overlap`, `--pace-home-squeeze` y (s156) `--pace-home-slack`. **s156: la tarjeta de Camino y Actividades son OPCIONALES** — exigirlas apagaba el motor entero con un Camino en curso, el UNICO estado real sin tarjeta. **Observadores en dos fases**: uno espera al montaje y se desconecta, otro vigila el `childList` **DIRECTO** del stack (sin `subtree`/`attributes`/`characterData`, o el contador del Pomodoro recalcularia 60 veces por minuto) y re-suscribe el ResizeObserver a los nodos VIVOS. **Primera pasada SINCRONA** (por rAF tardaba 1345 ms y el aro saltaba). **Nunca encoge a ciegas**: si una pasada no mejora la medida vuelve al ultimo D no desmentido — eso arreglo el aro de 244 px con `prefers-reduced-motion` | **v0.89.0** |
| `app/main/_responsive.js` | IIFE: inyecta `<style id="pace-main-responsive-css">` con las reglas @media globales del shell y **el modelo de la home**. **s156: aqui vive la RESOLUCION UNICA** — `--pace-dial-d` y `--pace-horizon` deciden en UN solo sitio si manda el motor o el fallback CSS; antes cada consumidor traia el suyo y no coincidian (Desktop tenia un `360px` a mano), asi que con el motor apagado **la tarjeta subia sobre un aro sin recortar**. Recorte y solapamiento salen ya del MISMO token. Trae ademas el **amanecer** (halo + linea de alba), reutilizando `paceGlowRamp`/`paceGrainUrl` de SessionShell. **Cuidado: el CSS va en un template literal — un backtick en un comentario aborta el build** (trampa de s139, repetida en s156) | **v0.89.0** |
| `app/main/TopBar.jsx` | Tabs Foco/Pausa/Larga + 3 iconos top-right (Stats prop / Logros CustomEvent /… | **v0.33.2** |
| `app/main/ActivityBar.jsx` | 4 chips Respira/Estira/Mueve/Hidratate + 4 iconos SVG inline… | **v0.33.2** |
| `app/i18n/strings/_bootstrap.js` | Crea window.PACE_STRINGS = { es:{}, en:{} } vacio | **v0.33.1** |
| `app/i18n/strings/ui.js` | i18n shell UI: welcome + support + sidebar + topbar + activity + settings +… **s151: el copy no promete gratuidad ABSOLUTA** («Nucleo gratuito / disponible», no «Siempre gratis / sin paywall») y los claims de servidor estan redactados para sobrevivir al Worker de licencia. **Sus claves EN son literales, NO posicionales** (la trampa de s144 es de otros catalogos) | **v0.84.0** |
| `app/i18n/strings/sessions.js` | i18n actividades vivas: session + common + focus + breathe + lib.breathe + hydrate + seguridad + constructor + feedback. **El dominio CUERPO salio en s148** | **v0.81.0** |
| `app/i18n/strings/sessions.body.js` | i18n del CUERPO (Mueve/Estira): `lib.move.*` · `lib.extra.*` · `move.*` de sesion · contrato v1 · runner guiado · capa editorial · el descanso que guia. **ES y EN juntos** (s81). Antes de `useT.jsx`; `content/*` debe seguir cargando al final (override D-1) | **NUEVO s148** |
| `app/i18n/strings/paths.js` | i18n Caminos: path runner + names + kind + library + suggested + hydrate +… | **v0.65.0** |
| `app/i18n/strings/stats.js` | i18n panel Ritmo: stats base + tabs + heatmap mensual + vista anual + caminos | **v0.52.0** |
| `app/i18n/strings/achievements.js` | i18n catalogo de logros: ach.cat/seal/toast | **v0.33.1** |
| `app/i18n/content/breathe.js` | Patch EN de contenido Respira: fases (con override D-1) + categorias + 20… | **v0.52.0** |
| `app/i18n/content/move.js` | Patch EN de contenido Mueve (ids extra.*): grupos mueve.cat.* + 14 rutinas | **v0.64.0** |
| `app/i18n/content/extra.js` | Patch EN de contenido Estira (ids move.*): grupos extra.cat.* + 14 rutinas | **v0.63.0** |
| `app/tokens.css` | Tokens CSS + base + microinteracciones. El CSS de Caminos salio en s148 | **v0.81.0** |
| `app/paths/paths.css` | CSS de Caminos: SenderoBar + escena ilustrada + variante `lg` + orbe. **Su `<link>` va DESPUES del de `tokens.css`**: la regla que saca la escena del rise escalonado gana por ORDEN, no por especificidad. NO va en el precache (viaja inlineado en `index.html`) | **NUEVO s148** |
| `app/paths/registry.js` | Catalogo PATH_CATALOG + helpers | **v0.40.0** |
| `app/paths/PathRunner.jsx` | Runner de caminos -- SOLO orquestador (maquina de fases + dispatcher) | **v0.49.0** |
| `app/paths/PathRunner.parts.jsx` | PathTopBar + ExitConfirmModal + StepError + PathStepLocked (chrome del… | **v0.40.0** |
| `app/paths/CompletionScreen.jsx` | Pantalla de Camino completado (ceremonia editorial sobre la escena ilustrada) — glifos via `renderGlyph` (s147; era la 4.a copia) | **v0.80.0** |
| `app/paths/steps/_shared.js` | window.pathStepStyles = { btnTypography, btnOutline } | **v0.33.0** |
| `app/paths/steps/PathBreatheStep.jsx` | Step Respira + SafetyGate | **v0.44.0** |
| `app/paths/steps/PathFocusStep.jsx` | Step Foco (Pomodoro contextual de Camino) | **v0.67.0** |
| `app/paths/steps/PathHydrateStep.jsx` | Step Hidratacion | **v0.44.0** |
| `app/paths/steps/PathBodyStep.jsx` | Step Cuerpo (dispatcher Move/Extra via resolveBodyRoutine) | **v0.44.0** |
| `app/paths/PathTransitions.jsx` | Cards intro/step entre pantallas del Camino | **v0.49.0** |
| `app/paths/SenderoBar.jsx` | Sendero visual clasico -- FALLBACK vivo para caminos sin lamina (hoy los 7… | **v0.45.0** |
| `app/paths/SuggestedPathCard.jsx` | Tarjeta sugerida home | **v0.66.0** |
| `app/paths/PathsLibrary.jsx` | Overlay biblioteca de caminos | **v0.44.0** |
| `manifest.webmanifest` | PWA manifest (renombrado desde manifest.json en s102) | **v0.47.0** |
| `sw.js` | Service Worker PWA. **s149: el export offline SALE del precache** (congelado a proposito en v0.71.0 y servido cache-first para siempre). **86 filas de `PRECACHE`**; si se toca, contar filas contra las entradas reales de la cache — `addAll` es atomico. **s152: eso ya lo aserta `npm run verify`** (fila ↔ archivo en disco, sin duplicados, sin rutas entrecomilladas en comentarios y mapa de mascaras ↔ precache); medido en vivo, la cache trae **86 entradas** | **v0.85.0** |
| `app/ui/UpdatePrompt.jsx` | Aviso de version nueva del SW ("Actualizar / Luego") | **v0.47.0** |
| `app/focus/FocusTimer.support.jsx` | Helpers sin UI del Pomodoro: `getFocusDescriptorKey` + `maybeNotifyFocusEnd`… | **v0.67.0** |
| `app/focus/FocusTimer.parts.jsx` | Piezas de UI del Pomodoro extraídas: `MinutesPicker` (selector de duración… | **NUEVO s124** |
| `build-standalone.js` | Genera el bundle offline (AHORA compilador: Etapa A). **s153: `readFileClean` NORMALIZA los finales de linea a LF al leer** — sin eso el artefacto dependia del worktree de quien lo generaba (con CRLF, Babel indenta distinto los comentarios que conserva: **una linea, un espacio**) y el CI se ponia rojo sin causa visible. **Todo el texto que entra en el artefacto debe seguir pasando por esa funcion.** **s148: el inlineado de CSS deja de estar cableado a `tokens.css`** y recorre TODAS las hojas de `app/`, cada una en su sitio (conserva la cascada), abortando si falta o si no inlinea ninguna | **v0.81.0** |
| `.claude/static-server.js` | Mini servidor estatico del preview (s80). **Desde s154 es tambien el `webServer` de la suite E2E** —esta committeado y no tiene dependencias—, asi que **el CI depende de el**: no se mueve ni se borra sin tocar `playwright.config.js`. Su `Cache-Control: no-store` juega a favor | **v0.49.0 · usado por s154** |

## Ultima sesion -- lo que sigue vivo

> s183 cierra el defecto arrastrado de s182 y entrega la **auditoria de premisas**
> que pidio el usuario. Publica **v0.114.1**. Suite **185 → 187**, `verify` en
> verde, CI de v0.114.0 comprobado y **verde**.
>
> Diario: [session-183](./docs/sessions/session-183-auditoria-de-premisas.md) ·
> Auditoria: [`audit-premisas-v0.114.0.md`](./docs/audits/audit-premisas-v0.114.0.md)

- **[EL HUECO DE i18n QUE ABRIO UN REDISENIO, NO UN DESCUIDO]** `achMini()` devolvia
  `a.title` crudo. s167 enruto por `tR()` las dos superficies que **entonces**
  decian el nombre de un logro -- panel y toast-- y la sidebar no lo decia:
  pintaba cinco sellos **sin texto**. **s180 los sustituyo por UNA fila con el
  nombre** y el hueco se abrio sin tocar i18n. Leccion: **un redisenio puede
  reabrir un defecto cerrado sin pasar por su archivo**. Ahora `achMini(id, tR)`
  recibe la funcion por parametro, porque es una funcion suelta y no puede llamar
  a `useT()`.

- **[UN ASERTO EN VERDE SOBRE EL ESTADO VACIO NO DICE NADA]** El hallazgo mas
  reutilizable de la auditoria. `tests/stats-pestanas.spec.js` siembra la
  **nada**, asi que su verde no dice nada del panel con datos: medido a 1536x714
  con un anio sembrado, «Semana» **se corta 33 px** -- lo causa la linea de
  retencion de s166, que solo ve quien practica apnea-- y «Caminos» de **60 a
  146** segun cuantos haya. A 1920x1080 no se corta, pero las cuatro pestanias
  dejan de medir lo mismo: **59,5 px de salto**, justo lo que s176 quito.

- **[LA MUSICA PIDE DOS COSAS INCOMPATIBLES A LA VEZ]** El hallazgo mas peligroso,
  porque alimenta a un generador. `MUSICA_RESPIRA_BRIEFS.md` exige «rango medio
  despejado (≈200 Hz-3 kHz sin nada denso)» en **cinco de sus seis prompts**, y la
  decision de s177 que GOBIERNA exige lo contrario -- «el grueso de la energia
  entre 200 Hz y 2 kHz»-- porque **midio que aquella restriccion era la causa** de
  que la pieza no sonara (82,6 % de la energia bajo 200 Hz, 0 % sobre 2 kHz). **No
  es que falte anadir un requisito: hay dos vivos y se excluyen.** Generar musica
  antes de resolverlo es tirar el trabajo.

- **[`CLAUDE.md` MINTIO POR TERCERA VEZ SOBRE EL MISMO PARRAFO]** s176 corrigio los
  ids y **cruzo las rutas**; s178 arreglo las rutas y **el troceo de aquel mismo
  dia** saco el dato de Estira de `ExtraModule.jsx`, asi que la tabla volvio a
  apuntar a un archivo sin dato. Corregido en s183, con la historia escrita dentro
  para que la cuarta vez se note. Ademas: el arbol de `app/` listaba **14**
  carpetas y hay **19**, `WeeklyStats.jsx` **no existe**, y decia «65 tests, ~25 s»
  cuando son **187 y 3,1 min**.

- **[TRABAJO QUE YA NO HAY QUE HACER, Y NADIE LO SABIA]** La vinieta «trocear lo que
  pasa de 500 lineas» de la Fase 8.5 esta **hecha**: `tokens.css` 613 → **322**,
  `exercise-glyphs.jsx` 513 → **261**, `Sidebar.jsx` 510 → **318**, y de **239
  archivos ninguno pasa de 500**. Cayo sola, por el trinquete que s162 metio en el
  `verify`. Un plan que no se re-mide acumula tareas fantasma.

- **[DE STATS SE DECIDIO MUCHO Y NO SE IMPLEMENTO NADA, Y SE DICE]** Cinco vueltas
  de maqueta. Cerrado: **«Hoy» NO entra** («ya esta en la sidebar»), lo que **anula
  el §4.1 y el §37.4** de `STATS_DESTINO_PROPUESTA.md` · **la vista no se rehace**
  (se tiraron tres redisenios completos ya pintados) · la barra es **cinta
  escalonada** · el dia es **un arco por tipo de jornada con relleno** · **los
  Caminos no entran de momento**. El defecto de la barra actual, nombrado: **el
  valor va en el GROSOR de la linea**. Lo que falta es que el disenio convenza.

- **[MI PROPIA MAQUETA PROPONIA EL DEFECTO QUE DENUNCIABA]** La primera «Semana»
  media **432 px** sobre un suelo de 385. Y el banco volvio a fotografiar una
  animacion a medias: «Semana» a **1192,3** de ancho donde las otras daban 1240 --
  el **96 % exacto** del `scale(.96)` de entrada. **Una tabla que se contradice a
  si misma es la senial.**

- **[UN NUMERO QUE OSCILA NO SE ESCRIBE COMO SI FUERA FIJO]** Cite el `verify` en
  «18,9 s» y al re-medirlo dio **11,4**. En `CLAUDE.md` va como rango. Y mi propia
  auditoria **cito mal una linea** -- dijo que `CONTENT.md:158` daba Estira a 14 y
  esa linea habla de **Mueve**, donde 14 es correcto--; corregido, porque con los
  ids cruzados una cita mal atribuida es el error que este proyecto ya ha cometido
  tres veces.

### Diferido (documentado, NO ejecutado)

- **[FASE 3 · `pace.events.v1`, Fase 2 del esquema] CERRADA en s172.** v0.99.1 cablo el
  backup en las dos direcciones **antes** que el primer emisor, y v0.102.0 puso los
  cuatro emisores. Lo que queda de la Fase 3 del PLAN es la **Fase 3 del esquema**
  (reducers de `aggregates`, encaje con `state-history`, normalizacion P1).
  **CORREGIDO EN s178**: esta linea decia ademas que la retencion por calendario
  «sigue sin programar», y **lleva programada desde s174** — se dispara sola una
  vez por arranque tras `loadState` (`app/events/events-store.js:370`), con su
  spec en `tests/eventos-retencion.spec.js`. Dato que ahorra un susto: el
  store **se inicializa solo** (`paceEventsBoot()` al cargar `events-store.js`), asi que
  no hay que arrancarlo desde producto.
- **[s169 · CERRADO, con UN hueco declarado]** Las cuatro decisiones del handoff de s168
  están resueltas. Medidas en [`docs/HANDOFF_s169.md`](docs/HANDOFF_s169.md).
  - ~~**A · la pill**~~ **v0.99.0** (`05a113a`) · ~~**B**~~ no pedía código ·
    ~~**C · el encargo de glifos**~~ **v0.99.0**, y creció: decía 38 y faltaban 19.
  - ~~**D · quitar el `apt` de los DOS caminos del CI**~~ **HECHO** (`d14d2a2`) **y
    observado en verde**. El paso desaparece entero: con acierto de caché el job pasa de
    **121 s a 101 s** (`Librerías de sistema` costaba 14 s en ese run) y **la varianza se
    va con él** — era de 14 s a **10 min 49 s**. Chromium arrancó sin las fuentes CJK ni
    cirílicas y los **92 tests pasaron**, que era el riesgo asumido.
  - **HUECO ABIERTO, y es el arriesgado: el camino de FALLO de caché no se ha
    ejercitado.** El run de verificación fue un **acierto**, así que
    `npx playwright install chromium` —ya sin `--with-deps`— **nunca ha corrido**. Sólo
    ocurre al cambiar `package-lock.json`. Se fuerza borrando la caché
    (`gh cache delete`) y lanzando un `workflow_dispatch`: un run, reversible, la caché
    se reconstruye sola.
  - ~~**El cruce del encargo, a mano**~~ **HECHO**: `scripts/verify.encargo.js`, cuatro
    comprobaciones relacionales más guard de cero, **los 7 rojos verificados**. Cierra el
    bucle que dejó C: ahora entregar arte sin marcar la lista **pone el `verify` rojo**.

- **[RED DE SEGURIDAD]** ~~tanda 1 (s150)~~ y ~~tanda 2 (s152)~~ **HECHAS y verificadas**: el
  `verify` tiene **4 tandas** y las 26 de entonces se pusieron **rojas a propósito**. (El «32
  comprobaciones» que decía esta línea era el censo de s152 y **ya estaba obsoleto en dos**
  cuando s169 lo miró: s168 añadió 2 y s169 otras 4. Se retira el número en vez de
  re-contarlo cada vez — es justo la clase de cifra que nadie mantiene.)
  Queda:
  - ~~**CI: GitHub Actions / YAML**~~ **HECHO en s153** — `.github/workflows/ci.yml`, un job que
    invoca `npm run verify` tal cual y anade lo unico que el verify no puede: que el `index.html`
    committeado sea el build de las fuentes. Probado en verde y en rojo. Queda del frente CI:
    - ~~**Playwright**~~ **HECHO en s154** — `npm run test:e2e`, **13 tests en ~25 s** sobre
      `index.html`, con el checklist de cierre de `CLAUDE.md` entero y el Pomodoro completado con
      el reloj virtual. **21 rojos verificados**, restaurados byte a byte. Segundo job del CI, con
      `needs: verify`. **Lo que la suite NO cubre y hay que mirar a mano**: movil, ingles, Caminos,
      premium y cualquier cosa visual — **no compara ni un pixel**, no hay capturas de referencia.
    - **Wrangler** — deploy a Cloudflare Pages. Exige secretos de la cuenta del usuario en GitHub;
      el YAML se puede dejar escrito, pero **inerte** hasta que existan.
    - **[s155] El `verify` gana una quinta tanda de vigilancia**: `pace.events.v1`. Cinco
      comprobaciones RELACIONALES en `scripts/verify.eventos.js` (cero red · una fuente de verdad
      por dominio · reset por la barrera · import por la barrera · **el gate export ↔ emisor**)
      mas su guard de cero. **Dos de ellas defienden frases de `privacy.html`**, no invariantes
      internos: es la primera vez que la red de seguridad protege una promesa PUBLICA.
    - **Proteger `main`** — instrucciones exactas en `docs/WORKFLOW.md` §8, **accion del usuario**:
      `gh` ya esta instalado y autenticado desde s161, asi que la afirmacion de la auditoria de que `main` esta
      sin proteger **sigue SIN VERIFICAR**. Y ojo: **«exigir el check sin requerir PR» no existe**
      — requerir status checks **bloquea el push directo**, porque el check solo puede pasar
      DESPUES de que el commit exista. El ruleset entregado (deletions + force pushes) preserva el
      cierre actual; el gate de verdad obliga a pasar a rama → PR → merge.
  - **Huecos declarados del verify**, por si algún día pesan — el script los imprime en cada
    pasada, también en verde. De la tanda 1: no cubre **orden de carga** (un nombre publicado
    DESPUÉS pasa igual, el análisis es estático) y su lista de plataforma tiene **99 nombres**,
    así que declarar ahí un identificador de la app lo dejaría sin vigilar. De la tanda 2: i18n
    comprueba que la clave **exista**, no que esté traducida ni que **quepa** (s151: 85 px por
    columna) · los catálogos se **cuentan**, no se validan (dosis, cues, pasos, acceso) · el
    precache mira el **disco**, no el navegador · de los glifos **no se mira un píxel** · y los
    números del `CENSO` **se suben a mano** cuando el contenido crece a propósito.
- **[DOCS, detectado en s152, NO tocado]** La tabla de `CHANGELOG.md` tiene **~10 filas antiguas**
  cuyo enlace `[abajo](#…)` apunta a una sección de detalle que **ya no existe** (se archivó en
  `docs/archive/CHANGELOG_TABLA_HISTORICA.md` cuando el archivo pasó a detallar solo las 2 últimas
  versiones). Es el mismo defecto que s152 corrigió para la fila de v0.83.0 al degradarla, pero en
  filas históricas: `v0.32.0`, `v0.28.11`, `v0.28.10`, `v0.28.0`, `v0.27.6`, `v0.27.3`, `v0.27.2`,
  `v0.27.1`, `v0.27.0` y `v0.26.1`. Arreglo mecánico (apuntar cada una a su diario); fuera del
  frente de s152, que era la red de seguridad.
- ~~**s125 — scrollbar del runner v1**~~ **RESUELTO en s125/v0.68.0** (barra oculta conservando el scroll, confinada a v1 con `:has()`). Entrada OBSOLETA detectada en el recorrido de s137; se conserva el texto por su diagnostico medido:
  `data-pace-session-center` (`overflowY:auto`) desborda ~17px a alturas ≤~660px en pasos
  v1 `perSide` de texto largo. NO compactar copy/glifos/tipografía → sesión corta de runner
  responsive. **Chip de tarea creado.** (El patrón de ocultar la barra de scroll de s123
  puede reutilizarse.)
- **Colisión CTA↔tarjeta en estilos barra/analógico** (no-default): PRE-existente de s123
  (el solapamiento se dimensiona para el aro; los controles de esos estilos van fuera del
  aro). Fuera de s124.
- **git**: `focus/FocusTimer.jsx`, `focus/FocusTimer.support.jsx`, `focus/FocusTimer.parts.jsx`
  (nuevo), `paths/steps/PathFocusStep.jsx`, `ui/TimerDial.jsx`, `i18n/strings/sessions.js` +
  los de bump/build (state-core, PACE.html, sw.js, PACE_standalone, index) + docs; NADA de
  `.claude/settings.local.json`.

### Pendiente

- **[EL REMAPEO DEL ARCO — aprobado en s159 PARA SU PROPIA SESION]** El horizonte tapa
  **94,3° del aro, o sea el 26 % del bloque con la cabeza del recorrido invisible** detras de
  los chips. La idea es del usuario y tiene dos mitades: **(A)** que el tiempo **no se gaste**
  en el tramo oculto —el recorrido se reparte solo por los 265,7° visibles, de modo que el arco
  visible se llena ENTERO al terminar— y **(B)** que el tramo enterrado **sea el que tiñe la
  cola de luz**. **(B) ya entro en s159**; **(A) se aparto a proposito**: toca el arco, los 60
  ticks y `TimerDial`, que esta **compartido con Caminos** (alli no hay horizonte, asi que el
  remapeo tiene que cerrarse a la home con el mismo gate que ya usa la mascara). Se monto un
  mock en banco y el usuario lo vio. **Las cinco decisiones que hay que tomar al abrirlo**, con
  la recomendacion de s159: (1) **la cabeza al cruzar el horizonte** — que se desvanezca al
  entrar y aparezca al salir, no que salte 94° en un frame, que seria el mismo corte que s159
  quito dos veces; (2) **el track** cortado tambien, coherente con el corte seco; (3) **los 60
  ticks** remapeados igual, o dirian una cosa distinta del trazo; (4) **Caminos intacto**;
  (5) **el numero sigue contando tiempo real** — solo cambia donde se dibuja el avance.
- ~~**[REDUCED-MOTION — deuda de s156]**~~ **CERRADA en s160/v0.91.0 — y tenia una SEGUNDA
  CAUSA, cerrada en s162/v0.93.0**: el mismo mecanismo un nodo mas abajo (el `margin-top`
  negativo del horizonte no estaba en la exencion), que dejaba el aro en 420 con 11 px de
  desbordamiento PERMANENTES en la maquina rapida. Era el rojo intermitente de la suite.
  Lo de s160: La microcausa era que el
  kill de `tokens.css` deja `transition-duration` en 0,01 ms sobre TODO y `transition-property`
  vale **`all`** por defecto ⇒ cada cambio de geometria era una **transicion** y su valor
  aterrizaba en otro frame, mientras el motor mide en la misma tarea. Arreglado con
  `transition-property: none` en el aro y sus cuatro nodos interiores; aro **406** y solape
  **-65** identicos con y sin reduced-motion. Fila propia en DECISIONES + aserto en la suite.
- ~~**[A11Y — orden de foco en escritorio, deuda de s156]**~~ **CERRADA en s160/v0.91.0.** El
  `order` del CSS reordenaba con el DOM quieto (foco: 387 → 622 → 698 → **496**). Ahora el DOM
  lleva el orden canonico de cada piel via `--pace-skin` y con `key` estable; **el orden visual
  no cambia ni un pixel**. Aserto nuevo: `tests/home-a11y.spec.js`.
- **[EL TIRON DEL ARCO — ABIERTO, esperando al usuario]** Reportado en uso real: «el aro da un
  tick por segundo», en **paceweb.pages.dev**, **Doogee Blade 20 Max + Brave**, bloque de **1
  minuto**, y lo que salta es **el punto brillante, no el trazo**. **NO reproduce en banco**: la
  transicion cubre el segundo entero (0 ms quieto) en v0.90.0 **y** en v0.89.0, las publicaciones
  de s159 son 2 en 8 s y forzando 60/s la transicion **sigue corriendo**; en pixeles, la cabeza se
  arrastra en todas las tomas. Descartados por medida: reduced-motion (su sistema tiene las
  animaciones activadas y en su movil la luz se funde), motor (Brave = Chromium) y artefacto
  viejo (el desplegado es **byte a byte identico**). **Siguiente paso**: el usuario corre el banco
  de cuatro aros en su telefono; segun cual de los cuatro de tirones, la causa es la mascara de
  s158 (mia), el `transform` por atributo SVG (previo) o el coste de la luz en su dispositivo
  (mia: con CPU frenada 10x, **42,6 fps contra 57,4**). **Sin ese dato no se toca nada.**
- **[PRESENCIA PUBLICA — reportado por el usuario al cerrar s139]** De las dos cosas, **la
  primera esta RESUELTA en s151** y la segunda sigue siendo decision del usuario:
  - ~~**`README.md` MUY desactualizado**~~ **RESUELTO en s151/v0.84.0**, y eran **DOS archivos**:
    tambien existia un **`README_EN.md` en v0.18.0** que **seguia vendiendo «Lifetime, Pase and
    Seasons»** —s149 corrigio la licencia solo en el espanol—. Reescritos los dos en paridad con
    cifras medidas del arbol; de paso salieron **dos enlaces rotos** (`HANDOFF.md` y
    `docs/porting.md`, que no existen) y una **tabla de 5 ejes de personalizacion falsa en cuatro
    filas** (solo la Paleta tiene control). Queda VIVO de este bloque: la **landing** de la
    estrategia premium, que es otra cosa.
  - **Claude aparece en «Contributors»**: NINGUN commit esta AUTORIZADO por Claude —los 166 son de
    `ezradesign`, con dos correos (personal y el `noreply` de GitHub)—. Sale de **4 commits con
    trailer `Co-Authored-By`**: `b1118a3` (v0.34.1), `97431ea` (s97), `0ac5707` (s115) y `6acd1e2`
    (s119), **los cuatro ANTERIORES a la decision s127** que prohibio la coautoria; desde s127 el
    historial esta limpio. **OJO al coste**: quitarlos exige REESCRIBIR EL HISTORIAL
    (`git filter-repo` o rebase) y **force-push**, y como el mas antiguo es de v0.34.1 cambiarian
    los hashes de mas de 100 commits — destructivo sobre un repo ya publicado. Decision del
    usuario: (a) dejarlo y que los 4 queden como historia, (b) reescribir y forzar el push
    asumiendo el riesgo, o (c) reescribir solo si algun dia se hace limpieza mayor del repo.

- **Diferidos de s122 (claridad de la home)**:
  - ~~**§0 solapamiento responsive a alturas <720px**~~ **RESUELTO en s126/v0.69.0 y s128/v0.71.0** (composicion proporcional + horizonte + squeeze, y motor universal en movil). Entrada OBSOLETA detectada en s137: el aro grande fijo + la
    tarjeta no caben sin la geometría responsive de §0 (círculo que encoge por
    altura, safe-zones). El solapamiento «sol» de s122 va con GATE ≥760px; por
    debajo NO se aplica. Sesión propia de §0 (círculo responsive + solapamiento
    controlado en todos los viewports del §8).
  - **§7**: pills «Breve/Tranquilo/Amplio» de Tweaks + estabilidad del contenedor
    de Estadísticas entre pestañas Semana/Mes/Año.
  - **Scrollbar del runner v1 (HALLAZGO s122)**: `data-pace-session-center`
    (`overflowY:auto`) desborda **~17px a alturas ≤~660px** en pasos v1 `perSide`
    de texto largo (glifo v1 escala con la altura → contenido crece con el
    viewport; legacy NO desborda). Restricción del usuario: NO compactar
    copy/glifos/tipografía ni ocultar el overflow → sesión corta de runner
    responsive (`MoveSessionV1.support` / `SessionShell.responsive`; verificar
    ready/timed/reps/perSide/descansos/DONE en 360×640, 390×660, 412×667, ES/EN).
    **Chip de tarea creado.**
- **Las 3 deudas de layout del runner v1 — RESUELTAS s119** (FASE A): barra de
  scroll fantasma (curva de glifo continua + tier de banda 701–768), glifo/botones
  sin anclar (alturas reservadas) y warning rep-pulse (`MoveSessionV1.jsx:441`,
  shorthand→longhand). Ya NO son deuda. (NOTA s122: la barra fantasma reaparece por
  otra vía en pasos `perSide` de texto largo ≤660px — ver diferido arriba.)
- **Migración MECÁNICA de B2.3 CERRADA (s121)** con OLA 4 (core.plank + wall.sit).
  **Quedan 6 rutinas legacy BLOQUEADAS por reescritura editorial / progresión
  técnica / revisión fisio** (`atg.knees` espera la revisión de Sissy squat). **No
  son deuda mecánica.** NO se abrirá una OLA 5 mecánica salvo que una auditoría NUEVA
  demuestre que alguna se puede migrar sin cambiar copy, dosis, estructura,
  lateralidad ni escalones. Las 6: `push.ladder` (negativas sin nº de reps + Pica sin
  escalón) · `legs.single` (aritmética imposible + 3/4 avanzados) · `desk.quick`
  (Seated twist, falta 2º lado) · `hips.ground` (Ground transitions «con manos») ·
  `ancestral` (Ground transitions + Rib pull identidad) · `atg.knees` (editorial +
  FISIO Sissy squat, B4). + escalón de regresión de Puente torácico (`spine.waves`,
  s120). **s122 (claridad UX de la home) HECHA**; la migración editorial de las 6
  legacy sigue condicionada a la validación real de la home (ver "Proxima sesion").
  La IMPLEMENTACIÓN de eventos (EventStore + adaptadores web/Capacitor +
  emisores; diseño `EVENTOS_SCHEMA.md` rev.5, s117) es de fases futuras, antes de
  stats premium / licencia.
- **Consumidor del feedback** (Pausa PACE / recomendador scoring v2 / «qué te
  ayuda» premium): queda para su fase — hoy solo se ALMACENA (nada de
  porcentajes ni comparaciones, decisión s116).
- **Latente (no bloqueante, pre-existente)**: `v1GlyphSize` lee `innerHeight` en
  render y no hay listener de resize → redimensionar EN PAUSA no recomputa el glifo
  hasta el próximo render; con re-render fresco al mismo viewport, los pasos anclan
  (verificado). Place↔work del MISMO paso conserva un pequeño salto (gate 56px vs
  timer 128px) — es transición de fase, no drift entre pasos; no se reserva.
- **Diseño pendiente**: diagramas de dos poses (los itera el usuario, regla
  D-4; candidatos Flexiones inclinadas + Flexor de cadera).
- **Deuda de tamaño**: `MoveSessionV1.jsx` **498 ln** (margen JUSTO — el próximo
  añadido va a `MoveSessionV1.support.jsx`) · `MoveSessionV1.support.jsx` ~305 ln ·
  `ExtraModule.jsx` **447 ln** (cerca del techo 500; al retomar Estira, trocear los
  datos ANTES) · `move.data.js` **396 ln** · `SessionShell.jsx` 336 ln · `dur` en
  pasos `reps` sigue como reserva del fallback legacy.
- **Deuda de entorno (s112/s113/s119)**: SW dev **re-registra tras cada carga
  fresca** → tras editar hay que desregistrar SW + limpiar caches ANTES de recargar
  (si no, sirve código stale; confirmado en s119) · buffer de consola del pane
  duplica y sobrevive recargas → los 4 warnings de rep-pulse que aún aparecen son
  STALE (el compilado es longhand, imposible que React los emita) · a11y (tarjetas sin teclado,
  onboarding sin focus trap) · «Serie X de Y» inexistente (metadatos ya
  presentes, sin consumidor UI aún) · timer de Move sigue setInterval
  (foreground, aceptado).
- **[Feedback s107-cierre] aun sin rutar**: salir de un Camino a la home
  (via tactil explicita; el «×» avanza, diseño s99) · visual Respira «Loto»
  (PNG del usuario, falta en el repo) · laminas HQ de Caminos (re-ingesta con
  `ingest-lamina.js`, REGLA D-4: re-MEDIR, nunca swap directo).
- **PWA en navegador REAL** (instalacion + notificacion): sigue del usuario
  desde s102.
- **B2.3 tras OLA 4 — migración MECÁNICA CERRADA (s121)**: quedan **6 rutinas legacy
  BLOQUEADAS** por reescritura editorial / progresión técnica / revisión fisio, NO
  por mecánica — 4 Mueve premium/free (`push.ladder`, `legs.single`) + parte de
  Estira (`desk.quick`, `hips.ground`, `atg.knees`, `ancestral`) · trabajo de
  lenguaje BASE §7-9: 4 cues (Seated twist, Rib pull, WGS, Ground transitions) + 2
  rutinas (`legs.single`, resto de `atg.knees`) + escalón de Puente torácico
  (`spine.waves`); `atg.knees` además espera la revisión FISIO de Sissy squat (B4).
  (Conteo: 23 pre-OLA-1 → 18 tras s118 → 13 tras s119 → 8 tras s120 → **6 tras
  s121**.)
- ~~`tokens.css` 613 ln y `FocusTimer.jsx` 496 ln~~ **OBSOLETO**: s148 dejo `tokens.css` en 386
  y el recuento real de `FocusTimer.jsx` es 450 (la cifra 496 era anterior al split de s124).
- Automatizar el bump de version en el build (package.json como fuente).
- ~~**[HALLAZGO s149] El ayudante de geometria de la home NO PUBLICA NINGUNA variable.**~~
  **OBSOLETO, comprobado en s162**: el motor publica. La suite lee `--pace-timer-d` = **406 px**
  en navegador real, y `asentarGeometria()` (s160) existe precisamente para esperar a que ese
  token repita valor tres frames. La cautela que el propio hallazgo declaraba —«esta medido en
  el panel de vista previa, no en un navegador real»— era la correcta. Texto original:
  Salio al verificar que la correccion de la cabecera de `home-geometry.js` era inerte. Medido en
  el panel de vista previa a **1280x720**, estado limpio y SW purgado: `--pace-timer-d`,
  `--pace-activities-overlap`, `--pace-home-squeeze`, `--pace-home-timer-size` y
  `--pace-home-sunset-overlap` **vacias**, `document.documentElement` **sin atributo `style`**, aro
  de **360 px** —que es exactamente el fallback de `var(--pace-timer-d, 360px)`—, solapamiento de
  **10 px = 0,028·D** contra el 0,16 nominal (banda de aceptacion **0,14–0,17** en
  `DESIGN_SYSTEM.md`) y **17 px de scroll** en la home, cuando el modelo de s126 encoge D hasta
  `overflowV <= 1`. **CONFIRMADO PREEXISTENTE**: se extrajo `index.html` de HEAD (v0.81.0), se
  sirvio desde el mismo servidor y dio **lo mismo**. **Dos cautelas antes de perseguirlo**: (1)
  esta medido en el panel de vista previa, no en un navegador real — reproducirlo fuera antes de
  llamarlo bug de produccion; (2) la home **se ve bien** y el usuario la valido asi, lo que falla
  no es el resultado visible sino que el contrato medido de s126 no se aplica. Encaja con el §10.2
  de la auditoria integral, que pedia «auditar el contrato geometrico» sin poder medirlo.
- ~~**[HALLAZGO s148] `first.return` («Regresas») no se desbloquea NUNCA.**~~ **CERRADO en
  s162/v0.93.0, y no era «nunca»: era una CARRERA.** El artefacto son **109 etiquetas
  `<script>`** (tareas separadas) y `unlockAchievement` se referencia PELADA desde un modulo
  que corre ANTES del suyo, asi que el `setTimeout(0)` puede ganarle y el `try/catch` vacio
  entierra el ReferenceError. Pagina quieta: se concede. Maquina cargada: se pierde. Ahora la
  concesion va dentro del estado que devuelve el rollover, sin timer. Texto original: El rollover
  lo concede con `setTimeout(unlockAchievement, 0)` para esperar a `state-achievements.jsx`, pero
  0 ms llega **antes** de que ese archivo evalue: la funcion es `undefined` y el `try/catch` se lo
  traga en silencio. **Confirmado PREEXISTENTE** contra el artefacto committeado de v0.80.0, que
  se comporta identico — no lo introdujo el troceo. Hay `.webp` para un logro que nadie puede
  ganar. Arreglo probable: diferir con `requestIdleCallback`, o concederlo desde
  `state-achievements.jsx` al evaluar en vez de desde el rollover.

### Backlog registrado en s117 (propuestas + multiplataforma; docs-only, SIN implementar)

Registrado al cerrar s117; **ninguna de estas entradas se ha implementado**.

**Visual / UX** (propuesta: [`HOME_REDISENO_PROPUESTA.md`](./docs/product/HOME_REDISENO_PROPUESTA.md)):
- Pills **Breve / Tranquilo / Amplio** de Tweaks: corregir el tratamiento visual.
- **Estadísticas**: dimensiones estables de la carcasa al alternar Semana/Mes/Año
  (responsive entre viewports OK, no entre pestañas del mismo viewport).
- **Jerarquía del Home**: Caminos / Camino sugerido POR ENCIMA de los accesos
  manuales (Respira/Mueve/Estira/Hidrátate).
- **Solapamiento editorial** intencional y responsive (margen negativo con
  `clamp()`, círculo `aspect-ratio:1`, nunca tapar timer/controles/ciclo).

**Multiplataforma** (arquitectura aprobada en `EVENTOS_SCHEMA.md`; implementación PENDIENTE):
- **Capacitor compartido Android/iOS**: build dedicado, detección de runtime,
  adaptadores nativos (SQLite log + Preferences/UserDefaults), lifecycle,
  notificaciones, safe areas, export/import; pruebas en dispositivo real +
  TestFlight iOS.
- **`PurchaseAdapter`**: web · Google Play Billing · StoreKit (tiendas = fuente de
  verdad de precio/moneda; no hardcodear importes en traducciones).
- **Timer de Mueve multiplataforma basado en timestamps** (hoy `setInterval`
  foreground; deuda menor ya registrada en plan-maestro).

**i18n** (propuesta: [`I18N_EXPANSION_PROPUESTA.md`](./docs/product/I18N_EXPANSION_PROPUESTA.md)):
- **I18N-1** modo Automático (detección BCP 47 web+Capacitor, override manual
  persistente, fallback inglés).
- **I18N-2** robustez (paridad de claves, pseudolocalización, pluralización).
- **I18N-3** expansión comercial (validar alemán · pt-BR volumen · francés).
- **I18N-4** localización nativa (permisos, notificaciones, compras, fichas y
  capturas de tienda).

## Proxima sesion -- **la decide el usuario**

> **LA COLA SALE DE LA AUDITORIA DE s183**, con su evidencia medida en
> [`audit-premisas-v0.114.0.md`](./docs/audits/audit-premisas-v0.114.0.md).
> El criterio del orden: primero lo que hace que la proxima sesion no se
> equivoque, luego lo que desbloquea a otros, luego lo grande.
>
> **La Tanda 0 -- que los documentos dejen de mentir-- YA ESTA HECHA** (s183):
> corregidos `CLAUDE.md`, `EVENTOS_SCHEMA.md`, `ROADMAP.md`,
> `STATS_DESTINO_PROPUESTA.md` y `CONTENT.md`.

### TANDA 1 · El conflicto de la musica *(decision, no codigo)*

**Bloquea generar las seis piezas.** `MUSICA_RESPIRA_BRIEFS.md` exige «rango medio
despejado (≈200 Hz-3 kHz)» en cinco de sus seis prompts; la decision de s177 que
GOBIERNA exige «el grueso de la energia entre 200 Hz y 2 kHz» porque midio que
aquella restriccion **era la causa** de que la pieza no sonara. **Son
incompatibles y hay que elegir** -- probablemente subiendo el hueco de voz por
encima de 2 kHz, pero eso se decide midiendo. Hasta entonces, **generar musica es
tirar el trabajo**. Y los terminos de uso comercial siguen sin verificar.

### TANDA 2 · Lo que ya estaba en la cola del usuario

1. **La pill naranja de «Mis rutinas»** en la sidebar: es lo mas llamativo de la
   columna (fondo tintado + borde a plena fuerza) y quitarle el fondo la calmaria.
   Lo mas corto de todo; se decide mirando una imagen.
2. **De la maqueta del usuario quedaron dos cosas sin copiar**, porque aviso de
   que algun elemento podia no estar bien colocado: en su imagen **no aparece el
   lema** y **«Ver la coleccion» va a la derecha**.
3. **Los tres ejercicios de oficina que HOY NO EXISTEN** en el catalogo -- cola de
   s178, intacta: **gemelo de pie** (no hay estiramiento de gemelo, solo
   `Elevacion de talones`, que es fuerza), **flexor de cadera contra la mesa** (el
   unico que hay pide arrodillarse) y **aductores sentado**. Cada uno nace con su
   dibujo. Arrastra la decision de **`move.chair.antidote`**: de sus seis pasos
   solo `Flexor de cadera` pide suelo, y por el la rutina que se llama «Antidoto
   silla» queda FUERA del chip «Aqui mismo».
4. **El tercer chip «Discreta»** (14 de 20), ultima pregunta viva de s176. **Hay
   que pintarlo antes de preguntar.**
5. **El arte**: **19** glifos de logro y **3** de ejercicio (`Rana`, `Pica en
   escritorio`). Depende del usuario. (`Nordics` sigue FUERA por decision de s173.)

### TANDA 3 · Lo grande

1. **FASE 4 · Stats.** Queda **una sola vista**, la Semana. Ya decidido: la barra
   es **cinta escalonada**, el dia es **un arco por tipo de jornada con relleno**,
   **«Hoy» no entra** y **los Caminos tampoco de momento**. **Lo que falta es que
   el disenio convenza** -- cinco vueltas de maqueta en s183 y sigue sin hacerlo.
   Y de paso: que `stats-pestanas.spec.js` **siembre datos**, o el corte de 33 y
   60 px volvera sin que nadie lo vea.
2. **FASE 3 del esquema de eventos**: reducers de `aggregates`. Es lo que le daria
   a Stats algo que leer -- hoy `pace.events.v1` tiene **un solo consumidor en toda
   la app**, la sidebar (`Sidebar.jsx:74`), y `aggregates` no aparece ni una vez en
   `app/`.
3. **FASE 3.5 · Pausa PACE**: la recomendacion concreta. Necesita lo anterior.
   Verificado en s183: el BreakMenu **solo ordena** (`computeScore` mira solo
   `plan` y `water`) y `routineFeedback` **sigue sin consumidor** de recomendacion.
4. **CTB**, fuera de v1, con permiso para un **prototipo tecnico**. Nada tocado.
5. **FASE 8 · onboarding contextual.**

### LO QUE SIGUE ABIERTO, dicho y no escondido

- **La rama «CONTINUA» de la tarjeta de la sidebar es INALCANZABLE** hasta que los
  Caminos se puedan pausar. Escrita y **sin probar**.
- Por debajo de **~575 px de alto en movil el runner SIGUE SOLAPANDO** (s179): lo
  unico que queda por encoger es el glifo y la fuente unica de s177 lo prohibe.
  **Es decision del usuario.**
- **360x560 desplaza 101 px y 360x640, 21** en el cajon de la sidebar. Es la
  decision que tomo el usuario mirando las capturas, no un pendiente.
- **D-1, D-2 y D-3** siguen vivas (decision del usuario: no urgentes).
- **El onboarding sigue sin focus trap** (Fase 8.5), verificado en s183.
- **`CONTENT.md` no se ha rehecho ficha a ficha**: s183 solo declaro la deriva y
  dijo que la cifra que manda es la del `verify`.
- Que el agua sola no enciende el dia **ya no lo dice ninguna superficie**.

---

## Decisiones activas -- indice

> El TEXTO COMPLETO de cada decision vive en
> [`docs/product/DECISIONES_TECNICAS_VIGENTES.md`](docs/product/DECISIONES_TECNICAS_VIGENTES.md) (GOBIERNA).
> Aqui solo el indice, para que este archivo siga siendo ligero en cada arranque.
> **Antes de tocar un subsistema, leer su fila alli.**

- **UN ASERTO QUE SIEMBRA EL ESTADO VACIO NO VIGILA NADA: la semilla es parte del aserto** (s183)
- **Toda superficie que pinte el nombre de un logro pasa por `tR`, y un redisenio puede reabrir ese hueco sin tocar i18n** (s183)
- **EL CAJON DE MOVIL TAMBIEN ESCALA, con suelo: se ANULA «en movil no aplica» (s181)** (s182)
- **El alto disponible de la sidebar se pregunta en SITIOS DISTINTOS segun la piel, y en el cajon la lente hay que ALTARLA a mano** (s182)
- **Un censo del catalogo se lee del OBJETO evaluado, nunca del fuente** (s182)
- **LA SIDEBAR SE ESCALA ENTERA PARA CABER: se AFINA la geometria fija de v0.112.0** (s181)
- **`overflow: hidden` APAGA el tamano minimo automatico del flex, y eso convierte a un hijo en el amortiguador de su columna** (s181)
- **Una fila de adorno que solo existe a veces DESALINEA la rejilla: se reserva siempre** (s181)
- **Playwright NO emite `resize` al cambiar el viewport, y el `ResizeObserver` tampoco dispara en headless** (s181)
- ~~**La tarjeta de la sidebar solo puede decir CONTINUAR o REPETIR: NUNCA sugiere**~~ **ANULADA en la misma s180**: la tercera rama es PARA AHORA (s182 lo detecto: el indice no llevaba la marca que el documento que gobierna si tiene)
- **El recorte del logo va en CSS y necesita `!important`, porque un estilo EN LINEA gana a la hoja** (s180)
- **Siete objetivos tactiles de 44 px NO CABEN en 243: la semana entera es UN boton** (s180)
- **Las secciones de la sidebar se componen en una LISTA y los separadores van ENTRE ellas** (s180)
- **Sembrar `weeklyStats` o `water` en un test exige TAMBIEN `lastActiveDay` y las guardas de migracion** (s180)
- **La pantalla del runner se CONGELA, y el numero del gate deja de ser mas pequenio (se ANULA s112)** (s177)
- **El modal de Stats sube a 1240 y cada vista lleva SU ancho** (s177)
- **La musica de fondo se nivela por RMS y necesita banda AUDIBLE (200 Hz-2 kHz)** (s177)
- **LA VOZ ENTRA EN RESPIRA: se ANULA la regla «Voz/TTS: NUNCA»** (s175)
- **Toda opcion que yo proponga se PINTA antes de preguntar** (s174)
- **La maqueta se dibuja sobre un marco a pelo; la superficie real tiene CHROME** (s174)
- **Una pieza que se pinta DOS veces obliga a filtrar por lo VISIBLE, siempre** (s174)
- **Una tarjeta clicable NO es un `role="button"`** (s174)
- **Entre la biblioteca y el circulo del runner hay DOS pantallas y 3.114 ms** (s174)
- **La retencion por calendario se dispara en el ARRANQUE, no en el rollover** (s174)

| Decision | Desde |
|---|---|
| **Una rutina de Estira que quiera servir en una oficina se compone VERIFICANDO cada ejercicio contra su propio `setup`, no por su etiqueta** | s178 |
| **El dato de Estira vive en DOS archivos y el orden es contrato** | s178 |
| **Respira usa `LibraryShell`: se ANULA «comparte la tarjeta y no la pantalla» (s174)** | s176 |
| **La barra de progreso del runner se ancla al CENTRO, no al contenido** | s176 |
| **La reserva de 2 lineas bajo la descripcion del runner se RETIRA** | s176 |
| **El bloque de sonido de Ajustes va POR FUNCION, no por interruptores** | s176 |
| **Las cuatro pestañas de Stats comparten caja en escritorio** | s176 |
| **`getAnimations()` y no «dos lecturas iguales» para esperar a un modal** | s176 |
| **Foco emite `focus` (una identidad) y Respira sin rondas su plan `declared` — esquema rev. 6** | s172c |
| **El bloque del runner v1 se ALINEA ARRIBA (el anclaje en vh era un acantilado bajo sus suelos)** | s172b |
| **La ingesta de arte de ejercicio es FUSIONABLE (`--fusionar`), y el arte tiene su red RELACIONAL (`verify.mascaras.js`)** | s173 |
| **El color de MODULO marca lo que se TOCA, no lo que hay: `Card` es neutra en reposo y pone el accent en el hover** | s173 |
| **El emisor de eventos vive en la CAPA DE ESTADO y FUERA de `app/events/` (lo define el gate del verify)** | s172 |
| **El modulo de un paso `kind:'body'` se pregunta al CATALOGO, nunca al prefijo del `routineId`** | s172 |
| **El `runId` se genera al emitir y se recuerda en memoria: cero lineas en los runners** | s172 |
| **El paso de DESCANSO pinta su circulo, apagado por COLOR y no por ausencia** | s172 |
| **El segundo lado de un `perSide` es el ESPEJO del primero (y solo 12 de los 15 pueden recibir lado)** | s172 |
| **`ExerciseGlyph` pinta DENTRO de la caja que se le pide (`maskScale` explicito, defecto 1)** | s171 |
| **Un solo tamaño de circulo para los DOS runners, con factor por PIEL leido de `--pace-skin`** | s171 |
| **Las reservas de altura del runner v1 valen en las DOS pieles -- y su linea vacia ES el anclaje** | s171 |
| **Las tablas editoriales del encargo de glifos llevan CUATRO columnas (el generador se come las de tres)** | s171 |
| **Tiempo de retencion: DATO SI, RECORD NO** | s166 |
| **El arte de ejercicio entra por PRECEDENCIA, no por sustitucion** | s166 |
| **Trocear CSS es CORTAR por un punto, nunca extraer un bloque -- y el orden de las hojas es contrato** | s163 |
| **Un `setTimeout(0)` NO alcanza a un modulo que se evalua despues: el artefacto son 109 scripts en tareas separadas** | s162 |
| **Lo que el motor mide incluye el MARGEN NEGATIVO del horizonte, y ese nodo tambien tiene que ser inmedible-por-transicion** | s162 |
| **La regla §1 la vigila el `verify` con un TRINQUETE, no una tabla a mano** | s162 |
| **La paleta puede seguir al sistema EN CALIENTE, pero NUNCA a mitad de bloque** | s161 |
| **Registrar un token con `@property` cambia lo que `getComputedStyle` devuelve de el** | s161 |
| **Con un token fundiendose, NADIE puede perseguirlo (y armar la transicion exige forzar el recalculo)** | s161 |
| **Lo que el motor de geometria mide NO PUEDE SER TRANSICIONABLE — bajo reduced-motion todo lo es por defecto** | s160 |
| **El orden VISUAL de la home lo trae el DOM, no `order`: son la misma lectura** | s160 |
| **La luz de la home se gobierna con MANDOS SEPARADOS, y dos transiciones no pueden perseguirse** | s159 |
| **El parpadeo de una luz grande se arregla con RESOLUCION, no con una transicion — y la de opacidad no suaviza el color** | s159 |
| **Para medir la luz: el navegador ya da OKLab, la presencia es una DISTANCIA al papel, y la referencia no puede apagar el interruptor** | s159 |
| **El techo del aro y el padding de su contenedor son dos capas que no se conocen: si el bloque no cabe, el grid lo alinea al START** | s159 |
| **`pace.events.v1` es MEMORIA DEL USUARIO, no telemetria** — y una promesa escrita en una pagina publica se defiende con un checker, no con una nota | s155 |
| **El comportamiento se prueba EJECUTANDOLO, y un test que no has visto fallar no prueba nada** — cubre el primer hueco declarado del `verify` | s154 |
| **El artefacto tiene que ser REPRODUCIBLE entre plataformas: el build normaliza los finales de linea al leer** — lo destapo el primer run del CI | s153 |
| **El CI INVOCA la red de seguridad local, no la reinterpreta — y lo unico propio que comprueba es la frescura del artefacto** | s153 |
| **Un checker mezcla dos clases de comprobacion y hay que saber cual se escribe: RELACIONAL o CENSO** — cierra la segunda tanda de s150 | s152 |
| **Un logro SECRETO y bloqueado no pinta su glifo: por eso el mapa tiene 58 mascaras y la pantalla enseña 53** | s152 |
| **El copy no promete lo que v1.0 va a incumplir: nada de gratuidad ABSOLUTA ni de «no hay servidor»** | s151 |
| **Lo que rompe el artefacto y no la sintaxis se caza por AMBITO: `npm run verify` antes de regenerar** — automatiza s146 | s150 |
| **Un artefacto CONGELADO a proposito no entra en el precache del SW** | s149 |
| **Una SUPERFICIE de pago tambien pasa por el guard: `hasPremiumEntitlement()`** — AMPLIA s95 | s149 |
| **Un `const` NO cruza de archivo en el compilado: los estilos compartidos se publican a `window` y se leen PELADOS** — amplia s80 | s148 |
| **Si un archivo llama a algo AL EVALUARSE, quien se lo da carga antes; y si no puede garantizarse, guard que aborte** | s148 |
| **La deuda de tamaño se MIDE antes de tocarla; la tabla de `STATE.md` es un indice, no la fuente** | s148 |
| **El build inlinea TODAS las hojas de `app/`, cada una en su sitio; ninguna ruta cableada** | s148 |
| **El glifo de un logro se pinta SIEMPRE desde `renderGlyph`; ninguna superficie lo resuelve por su cuenta** | s147 |
| **El suelo de papel se aplica ANTES del remuestreo, y el marco se busca sobre el ORIGINAL** | s147 |
| **En una rejilla de sellos, el sello se ancla ARRIBA, nunca al centro de su tarjeta** — aplica s119 | s147 |
| **AMNISTIA: un logro concedido NO se retira nunca** — ANULA la excepcion consciente de s136 | s146 |
| **Un hook con alias NO crea el binding pelado; el compilado no perdona lo que `PACE.html` si** | s146 |
| **Un secreto sin detector es indistinguible de uno alcanzable: o se implementa o sale del catalogo** | s146 |
| **Un umbral que cuenta LOGROS se mide contra el techo real de detectores** | s146 |
| **La curva de logros se decide MIDIENDO** — banco en `scripts/audit/logros.js` | s146 |
| **Un logro se GANA al instante; lo que se escalona es el AVISO (uno por sesion)** | s145 |
| **El Preview de §18.3 sale desde la BIBLIOTECA, nunca dentro de un Camino** | s144 |
| **Intensidad y nivel tecnico son DOS ejes; el nivel solo se ensena cuando NO es basico** | s143 |
| **Un alias TAPA el glifo propio: `ExerciseGlyph` resuelve el alias PRIMERO** | s142 |
| **Renombrar un ejercicio exige TAMBIEN su entrada en `VISUAL_ALIAS`** — AMPLIA s108 | s141 |
| **Un nombre de ejercicio no se renombra sin su PAREJA** | s141 |
| **Un degradado NUNCA se apila sobre si mismo: el alpha se compone en UNA capa** | s140 |
| **El grano NO es un dither: entra despues de la cuantizacion y solo puede TAPAR** | s140 |
| **Un cambio visual se mide sobre los PIXELES DE LA PAGINA, no sobre la pieza aislada** | s140 |
| **Ninguna actividad EN CURSO ensena barra de scroll** — AMPLIA s125 | s139 |
| **Un visual elastico se mide contra el HUECO del centro, nunca contra `vh`** | s139 |
| **Si el estado de un elemento cambia el `fontWeight`, NUNCA `transition:'all'`** | s139 |
| **Retirar una opcion de la UI exige bandera UNICA que gobierne tambien la migracion** | s139 |
| **El idioma «Auto» es un MODO aparte; `state.lang` siempre es un idioma real** | s139 |
| **El punto guia del aro existe desde el ARRANQUE (`running`)** — ENMIENDA s138 | s139 |
| **Un tile de dither OPACO solo es viable donde haya backdrop garantizado** | s139 |
| **Atmosfera del `SessionShell` en TODA sesion, no solo en Camino** — REVISA s99 | s138 |
| **El arte de linea del usuario se integra como MASCARA CSS, no como imagen** | s138 |
| **Un visual que respira reserva su MAXIMO en el wrap y escala con UN SOLO factor** | s138 |
| **Movimiento continuo = animacion CSS; NUNCA derivado de `progress`** | s138 |
| **Las rutinas propias NO pertenecen a un modulo y acreditan SIEMPRE por `completeMoveSession`** | s138 |
| **El punto guia del aro se monta con `progress > 0`, sin umbral** | s138 |
| **Barra de scroll del runner v1 OCULTA conservando el scroll; CONFINADA a v1, NUNCA global** | s125 |
| **Layout del runner v1: bloque de alto CONSTANTE (alturas reservadas) + curva de glifo continua… | s119 |
| **B2.3 = migración MECÁNICA de contenido al contrato v1, en OLAS; el runner NO se rediseña** | s118 |
| **Arquitectura de eventos APROBADA (solo DISEÑO), NO implementada** — `pace.events.v1` por… | s117 |
| Feedback ligero por rutina (B2.2b-2): «¿Te ayudó esta pausa?» — solo captura + almacenamiento… | s116 |
| Contrato formal de pasos v1 (B2.2b-1): `instruction.*` + `tempo` + `transition` + `completion`… | s115 |
| CAPA EDITORIAL del runner (CIERRA el GIRO): instrucción por CAPAS · pantalla final por módulo… | s114 |
| Runner GUIADO (enmiendas R2/R3): el usuario toca para empezar, pausar o adaptar — NO para… | s113 |
| Gate de colocacion con TRES modos: `setup:'ready'` espera al usuario; auto deriva del `mode`… | s112 |
| Contrato de pasos v1: `mode` en el step elige runner; sin `mode` = legacy intacto | s110 |
| visualId: identidad visual compartida via alias, SIN tocar `step.name`/localStorage | s110 |
| Editorial de seguridad CERRADO (B1.2): sin lenguaje de fallo/limite/maximo, material anunciado… | s108 |
| Renombrar un `name` de paso EXIGE renombrar su key de glifo EN EL MISMO cambio | s108 |
| Defaults opt-out: `soundOn:true` + `notifyFocusEnd:true`; el permiso de notificacion se pide en… | s108 |
| Claves ISO de fecha SIEMPRE con `parseLocalDateKey()` (regla #10 CLAUDE.md) | s107 |
| Apnea FUERA del producto: sin cronometro de retencion, sin logros por aguantar | s107 (decision auditoria 2026-07-16) |
| Onboarding = flujo FULL-SCREEN sobre las laminas; el WelcomeModal NO vuelve | s106 |
| Cierre del onboarding SUGIERE en home (no auto-arranca el runner) | s106 |
| `profile` en state: null = pregunta saltada; consumidor futuro = scoring s107 | s106 |
| Dentro de `[data-pace-reveal]`, NO señalizar estado con `opacity` inline | s106 |
| Identidad tipografica = **Cormorant** (titulos) + EB Garamond (cifras/glifos/logo) + Inter… | s105 |
| Un Camino cuenta como completado solo con >=1 paso hecho de verdad | s105 |
| Toasts de logro APLAZADOS durante un Camino | s105 |
| Escena ilustrada de Caminos SOLO en el runner; SenderoBar = lenguaje fuera + fallback dentro | s104 |
| Marcadores "casquetes": gris → color de actividad; SIN orbe | s104 |
| "Sobre el arte siempre es de dia" | s104 |
| Laminas: archivo+precache en WEB / data URI SOLO en standalone; el arte se mide UNA vez | s104 |
| Build Etapa A: artefactos COMPILADOS con semantica de eval reproducida (IIFE + re-exposicion… | s103 |
| Toolchain del build PINEADO: Babel major 7 + TypeScript major 5 | s103 |
| SW: updates con PROMPT (worker en waiting), nunca skipWaiting incondicional | s102 |
| Notificacion fin-pomodoro: solo pestaña oculta, silent, solo foco — **default SUPERSEDED s108**… | s102 |
| Pomodoro persiste la recarga via `pace.timer.v1`, FUERA de pace.state.v2 (cierra fork s96) | s102 |
| manifest.webmanifest unico; el build re-inserta el link SOLO en index.html | s102 |
| Enlaces legales (/safety /privacy) viven en Ajustes, solo en web | s102 |
| Stats vivos: los paneles leen `getHistoryWithToday`, el rollover sigue siendo el UNICO escritor… | s101 |
| La serie `moveMinutes` se etiqueta "Cuerpo" en stats (Mueve+Estira comparten cubo) | s101 |
| `/safety` y `/privacy` = paginas estaticas AUTOCONTENIDAS en raiz | s101 |
| CompletionScreen = ceremonia editorial; sin OutroCard; draw-in SOLO alli | s100 |
| Todos los steps de Camino usan el SessionShell compartido | s99 |
| Atmosfera por paso (SessionShell `atmosphere`), SOLO en Camino | s99 |
| Timer: variante `ticks` (aro de marcas de minuto) para el Foco de Camino | s99 |
| Botones del Foco por color (revisa s79) | s99 |
| Sendero: curva fluida original + hito actual acentuado (cierra iteracion cresta/valle) | s99 |
| "Siguiente" (no "Volver al inicio") en el done de una sesion dentro de Camino | s99 |
| BreatheSession: un solo reloj de tiempo activo (timestamp-based) | s98 |
| Logo en oscuro NO se reemplaza (PNG invertido = original) | s97 |
| Progreso de sesiones activas = BARRA SEGMENTADA por bloques, no bolas | s97 |
| 2a recalibracion oscuro EN BLOQUE (`--ink-3`/`--line`/`--line-2`) | s97 |
| Motor de timer timestamp-based, LOCAL (no persiste en pace.state) | s96 |
| Bloque Contenido+Premium: gating a nivel sesion | s85 |
| Gating ANTES del contenido | s85 |
| Copy BMC: nucleo libre (opcion A) + premium aparte | s85 |
| Campo `access` solo en paths/registry.js -- SUPERSEDED s88 | s85 |
| F3b solo binario free/premium (locked.* y licencia real diferidos) | s88 |
| Set premium = 8/26, ~1/3 por modulo, solo lo mas profundo | s88 |
| `premiumUnlocked` controla el bloqueo real; el sello marca "es de pago" | s88 |
| Guard central de entitlement = UNICO punto de verdad del acceso | s95 |
| `path.weekend` = degustacion curada, ahora EXPLICITA (`tasting:true`) | s89, explicita s95 |
| Autofocus del Welcome solo con puntero fino | s95 |
| Reduced-motion con excepcion `data-pace-essential` | s89 |
| ~~Paleta oscura automatica SOLO en primer arranque~~ **SUPERSEDED por s161** | s89 |
| Steppers con patch funcional `set(s=>...)` | s89 |
| SW: navegaciones network-first, assets cache-first, cleanup en activate | s89 |
| Free-first dentro de cada grupo de biblioteca | s90 |
| `ambientDrone.start(force)` para sesiones con drone integral | s90 |
| Sin logros `explore.*` para tecnicas F4 (y cola D-8b cerrada) | s90 |
| Bibliotecas de cuerpo agrupadas (mismo shape que BREATHE_ROUTINES) | s91, cerrado s92 |
| Prefijo i18n `mueve.cat.*` para los grupos de Mueve | s92 |
| strings-content.js troceado en `app/i18n/content/` por modulo visual | s92 |
| Pasos nuevos sin glifo usan DefaultGlyph hasta aprobacion (D-4) | s91, s92 |
| Registro de ejercicios CURADO a mano en `app/custom/` (no derivado runtime) | s93 |
| Rutinas custom: prefijo `custom.<Date.now()>` + credito via completeMoveSession | s93 |
| i18n del registro por NOMBRE canonico ES como key (`custom.ex.<name>.*`) | s93 |
| Builder como overlay singleton que OCULTA MoveLibrary mientras esta abierto | s93 |
| Preview: purgar SW+caches tras CADA tanda de edits + static-server con no-store | s93 |
| Sin tokens sinonimos en tokens.css (huerfanas por reemplazo directo) | s94 |
| Plan maestro v1.0 adoptado — secuencia s94→ en ROADMAP.md | s93 |
| Sintetizar audio (no WAVs) | s28 |
| Elastic License 2.0 | s26 |
| Anti-truncamiento: Python write | s48-s52 |
| Build con TS parser real | s56 |
| Overlay via CustomEvent | s50+ |
| Transiciones Camino volatiles | s77, revisada s100 |
| Progreso del Camino solo entre pantallas | s77b |
| Labels SenderoBar: solo hitos done | s77b |
| Nuevo token --focus-cta para CTA Comenzar home | s77b |
| Slot horario 'anytime' como fallback (no compite con slots fijos) | s78 |
| Logro master.path.all7 ("Cartografa") = cap de 1 logro nuevo por sesion | s78 |
| PathHydrateStep usa mismo lenguaje visual que HydrateModule home | s78 |
| PathFocusStep es Pomodoro CONTEXTUAL, no libre | s79 |
| Toast: fade-out aditivo 300ms tras TOAST_DURATION_MS | s79 |
| Paleta oscura recalibrada +10% en superficies/bordes, --ink-* intactos | s79 |
| PathRunner.jsx splittado en `steps/` + `PathRunner.parts.jsx` + `CompletionScreen.jsx` | s80 |
| Estilos comunes entre Steps via `window.pathStepStyles` | s80 |
| PathBodyStep dispatcher (kind:'body' resuelve Move/Extra via resolveBodyRoutine), NO… | s80 |
| i18n splittado en `app/i18n/strings/` con bootstrap explicito + 5 dominios | s81 |
| ES y EN en mismo archivo del split (no separar por idioma) | s81 |
| Override silencioso strings-content.js sobre 3 keys breathe.phase.* (deuda explicita D-1) | s81 |
| `app/main.jsx` splittado en `app/main/` (variante B equilibrada) | s82 |
| CSS responsive global del shell vive en `app/main/_responsive.js` (IIFE) | s82 |
| `Object.assign(window, { TopBar, ActivityBar })` preservado tras split | s82 |
| `app/achievements/Achievements.jsx` splittado en `achievements/` + `glyphs/` (variante B) | s83 |
| Convencion `app/glyphs/` como home definitivo de sistemas de glifos | s83 |
| `IMPLEMENTED_ACHIEVEMENTS` expuesto a window | s83 |
| Achievements.jsx lee globales como `const X = window.X \|\| fallback` al inicio del archivo | s83 |
| Iter glifos canonicos Mueve/Estira cerrado (port literal desde HTML del usuario) | s84 |
| Wrapper G de `exercise-glyphs.jsx` mantenido a strokeWidth 1.8 aunque las versiones aprobadas… | s84 |
| Para los 15 glifos PENDIENTES (sin entrada en `window.APPROVED`), mantener s60 hasta nueva… | s84 |

## Deuda tecnica activa

> **DESDE s162 ESTA TABLA NO ES LA FUENTE DE VERDAD.** Los numeros vivos los mide
> `scripts/verify.tamano.js` en cada `npm run verify`, y su `DEUDA_500` es un trinquete: la
> deuda no puede crecer, no puede aparecer una nueva, y cuando un archivo baja de 500 el propio
> verify exige borrar su fila. **Lo que la auditoria de s162 encontro aqui**: la tabla mentia en
> CINCO filas — `_responsive.js` **1132 ln y ni figuraba**, `FocusTimer.jsx` 686 donde decia
> 450, `tokens.css` 676 donde decia 386, `TweaksPanel.jsx` 534 donde decia 493 y
> `state-core.jsx` 515 donde decia 402. Los tres primeros cruzaron el limite **en s159** (una
> sola sesion), y la frase «ningun archivo de `app/` pasa de 500» era falsa desde entonces.
> Las filas de abajo se conservan por su HISTORIA, no por sus numeros.
>
> **RECONTADA ENTERA EN s148, y por eso hay que desconfiar de ella.** Esta tabla se
> mantiene a mano y **se habia desincronizado en silencio**: daba `exercise-glyphs.jsx`
> por «dentro de limite» con **571 lineas reales**, y `sessions.js` (**502**) no
> figuraba. Antes de trocear nada, **MEDIR**, no leer esta tabla.
>
> **Trampa de medicion**: `Get-Content x | Measure-Object -Line` **no cuenta lineas en
> blanco** (41 de menos en `tokens.css`). Usar `(Get-Content x).Count`.
>
> **s178 · LA COLUMNA DE LINEAS SE HA IDO, y la tabla se queda con la historia.** La
> auditoria de s178 la midio archivo a archivo y **mentia en 10 de las 14 filas medidas** —
> s162 la cazo mintiendo en cinco, o sea que **empeoro**. Los peores: `FocusTimer.jsx` decia
> 450 y estaba en 499, `state-core.jsx` decia 402 y estaba en 477, `tokens.css` decia 386 y
> estaba en 322. Mantener a mano una copia de lo que el `verify` YA mide es el mecanismo que
> ha fallado tres veces (s148, s162, s178), asi que se retira el numero, no se actualiza.
> **Decision del usuario, s178.**
>
> **Donde esta el numero vivo:** `npm run verify`, que mide los archivos de `app/`, `tests/` y
> `scripts/` en cada pasada y cuyo `DEUDA_500` es un trinquete — la deuda no puede crecer ni
> aparecer una nueva. **Estado medido en s178: ningun archivo pasa de 500**, y el techo lo
> reporta el propio verify.

| Archivo | Historia y criterio |
|---|---|
| `app/move/MoveSessionV1.jsx` | **ALTA -- EN EL TOPE** (sin cambios en s148: no esta POR ENCIMA, pero es el proximo en caer. Lo que se añada va SI O SI a `MoveSessionV1.support.jsx`) |
| `app/tweaks/TweaksPanel.jsx` | MEDIA (s148: recontado; el candidato natural sigue siendo extraer el bloque de notificacion a seccion propia) |
| `app/extra/ExtraModule.jsx` | MEDIA (s148: recontado. Al retomar Estira, trocear los DATOS antes) |
| `app/breathe/BreatheSession.jsx` | MEDIA (s165: 454 -> 481 al rehacer el progreso; el guard §1 la freno una vez a 507 y se recorto comentario, no codigo. Lo siguiente que entre aqui va a un `.support`) |
| `app/ui/SessionShell.jsx` | BAJA (s148: recontado) |
| `app/focus/FocusTimer.jsx` | BAJA (s148: recontado; helpers en `.support`, piezas de UI en `.parts`) |
| `app/glyphs/exercise-glyphs.extra.jsx` | BAJA (**NUEVO s148**) |
| `app/state-core.jsx` | BAJA (**s148: 510 -> 402**, migraciones y rollover a `.support`) |
| `app/tokens.css` | BAJA (**s148: 613 -> 386**, el CSS de Caminos a `paths/paths.css`) |
| `app/i18n/strings/sessions.js` | BAJA (**s148: 502 -> 353**, el dominio CUERPO a `sessions.body.js`) |
| `app/glyphs/exercise-glyphs.jsx` | SALE (**s148: 571 -> 209**, Estira a `.extra.jsx`; la fila vieja lo daba por sano desde s84) |
| `app/shell/Sidebar.jsx` | SALE (**s148: 570 -> 141**, reparto `.support` + `.parts` + orquestador) |
| `app/i18n/strings/ui.js` | BAJA (s138: etiqueta del visual Flor -> Loto, ES+EN; dominio mas grande del split) |
| `app/i18n/strings-content.js` | SALE (s92: troceado en `app/i18n/content/` breathe 94 + move 186 + extra 202 ln al superar ~470 con F6) |
| `app/breathe/BreatheVisual.jsx` | BAJA (s139: llego a **512** con el encaje, el banding y la vela ⇒ TROCEADO a `BreatheVisual.support.jsx` (117 ln) con el patron `*.support.jsx`; queda en 421) |
| `app/achievements/Achievements.jsx` | SALE (s83, antes 409 -- split en achievements/catalog.js + glyphs/achievement-glyphs.jsx) |
| `app/main.jsx` | BAJA (s138: +14 ln del enrutado de credito de las rutinas propias; s82: split en main/_responsive + TopBar + ActivityBar) |
| `app/state-achievements.jsx` | BAJA (s146: la curva nueva no cabia bajo 500 ⇒ los contadores y los 23 detectores nuevos viven en `state-achievements.support.jsx` (179 ln), patron `*.support`) |
| `app/paths/PathRunner.jsx` | SALE (s80, antes 835 -- split en steps/ + parts + CompletionScreen) |
| `app/i18n/strings.js` | SALE (s81, antes 791 -- split en strings/_bootstrap + ui + sessions + paths + stats + achievements) |

**Backlog tecnico MEDIA:** ver la tabla recontada arriba. Del P2 de
la auditoria (`docs/audits/audit-producto-v0.34.4.md`): build precompilado
(A-5) **HECHO en s103 salvo fuentes (s104)**; quedan tests del state (A-6)
e import sanitizado (A-7). El "manifest rico" del P2 quedo HECHO en s102.

### Deudas semanticas (no de tamaño, no urgentes)

| Item | Detectado en | Detalle |
|---|---|---|
| D-1 override silencioso content/breathe.js (antes strings-content.js) | s81 audit, movido s92 | 3 keys `breathe.phase.*` con valores distintos (Inhale again vs more; Oceanic vs Ocean). 8 keys mas duplicadas pero coincidentes. Tras el split s92 el override vive en `app/i18n/content/breathe.js` (mismo orden de carga). Decision futura |
| D-2 duplicidad "Hecho hoy" | s81 audit | `path.card.done` + `paths.library.doneToday` mismo valor, dos keys. Consolidar a una |
| D-3 namespaces path / paths inconsistentes | s81 audit (existente desde s53) | Singular `path.*` (runner, hydrate, card, error) + plural `paths.*` (library, suggested, path, kind, runner.repeat). Mezcla historica |
| D-4 35 glifos pendientes sin aprobar (15 de s84 + 11 de s91/F5 + 9 de s92/F6) | s84 + s91 + s92 | De s84 (iteraciones v8-v13 en exploracion, no en `window.APPROVED`): World's greatest stretch, Cossack squat, Pigeon, ATG split squat, Tibialis raise, Nordics, Sissy squat, Deep squat hold, Crawling, Ground sitting transitions, Inclinacion lateral, Escalenos, Wrist circles, Seated twist, Ankle circles. De s91/F5 (sin iteracion aun, renderizan DefaultGlyph): Gato-camello, Palmas al suelo, Rezo invertido, Circulos de hombro, Couch stretch, Onda espinal, Puente toracico, Rodar hacia abajo, Rana, Pliegue adelante, Isquio a una pierna. De s92/F6 (idem): Sentadilla a silla, Apretar gluteos, Superman, Pica en escritorio, Sentadilla bulgara, Plancha, Plancha lateral, Hollow hold, Hang activo. Portar cuando el usuario apruebe |
| D-5 divergencia move.desk.quick paso 5 | s84 | HTML del usuario lista `Apertura de pecho` donde repo lista `Chin tucks`. Decision de catalogo en sesion futura (modificar EXTRA_ROUTINES o mantener repo) |
| D-6 strokeWidth wrapper G | s84 | Versiones aprobadas del HTML usan 1.5 (v3-v8, v12) o 2.0 (v9), pero wrapper G del repo unifica a 1.8. Si el usuario quiere unificar a 2.0 (estilo V9), cambio aislado del wrapper afecta los 46 glifos por igual |
| D-7 racha foco-en-Camino (F-1) -- RESUELTO s86 | s86 audit | `PathFocusStep` no llamaba `updateStreak` -> un dia de solo-foco-en-Camino salia activo en heatmap/YearView pero no sumaba a `streak.current`. **Corregido en v0.34.2** (anadido `updateStreak()` tras el credito, idempotente por dia). Ver `docs/audits/audit-tracking-v0.34.1.md` |
| D-8 fuga premium via `path.weekend` + logros ligados a premium -- RESUELTO s89 (decision) + cola cerrada s90 | s88 audit | (a) `path.weekend` declarado **degustacion curada** (decision activa s89, cero codigo). (b) Logros premium-tied aceptados. (c) Cola cerrada en s90: `master.collector.half/full` usa umbrales fijos 50/100 logros desbloqueados, NO un denominador por catalogo -- crecer F4-F6 no lo distorsiona. Ver `docs/audits/audit-producto-v0.34.4.md` |

### Backlog de pulido / UX (feedback usuario s96)

Recogido con capturas al cerrar s96. Lista completa en `ROADMAP.md` ->
"Backlog de pulido / UX (feedback s96)" + memoria `ux-refinement-backlog`.

**Hecho en s97 (v0.42.0):**
- ✓ **Modo oscuro legible**: recalibracion tokens (`--ink-3`/`--line`/
  `--line-2`). El "logo descolorido" NO era bug -> el usuario valida el
  invertido (ver decisiones activas).
- ✓ **Precontador "3" solapa caption** (SessionPrep) + **countdown de Mueve**
  descentrado + **bolas de Respira** sin sentido -> barra segmentada por bloques.

**Hecho en s99 + s100 (v0.44.0 / v0.45.0):**
- ✓ **Caminos runner refinado**: overhaul premium s99 (SessionShell en los 4
  tipos de paso, timer ticks, botones por color, atmosfera, kicker romano) +
  remate s100 (CompletionScreen ceremonia editorial, OutroCard eliminada,
  banding suavizado). Queda OPCIONAL: ilustracion por Camino (espera arte, D-4).

**Hecho en s101 (v0.46.0):**
- ✓ **Stats a fondo** (P2 del usuario, s100): auditoria 8 hallazgos + stats
  vivos (Mes/Año con el dia actual) + WeekDots criterio s69 + fila "Cuerpo" +
  racha Caminos viva + fix DST + WeeklyStats muerto borrado. Diferidos: H7
  (credito solo-al-completar de Mueve/Estira, "Move timer: bajo") y H8
  (proxies del Sendero del dia → s106 sidebar).

**Pendiente (sin planificar):**
- **[Visual]** pomodoro web con semicirculo fijo integrado en las pills
  (no depender del zoom) · sidebar (divisor logo↔Ritmo sube + mas util).
- **[Producto]** builder premium mas visible + ejercicios de Mueve Y Estira
  · filtros en bibliotecas para movil (mapea a la fase de taxonomia+filtros).
- **[Feedback s101-cierre]** AUDIO: Sound.jsx mas pulido y atractivo (encaje:
  sesion de audio premium ANTES del bloque CTB) · GLIFOS: los de Mueve/Estira
  "tienen fallas, no coherentes ni premium" → la iter pre-venta pasa de la
  cola D-4 a revision COMPLETA del set (el usuario itera, port literal) ·
  CONTENIDO: titulos de ejercicios en ingles dificiles de entender →
  auditoria de nomenclatura ES (mapea a s107-108; OJO name ES = key de
  glifo/i18n custom, s93). Detalle en ROADMAP "Backlog de pulido".
- **[Feedback s102-cierre]** POMODORO: subtitulo dinamico por duracion
  (15/25/35/45, ≥2 frases estilo PACE rotando aleatorio por preset; hoy
  `focus.subtitle.focus` es fijo) · CTA: "Comenzar" poco atractivo →
  explorar opciones y que el usuario ELIJA · STATS: panel Ritmo SIN scroll
  vertical en web (reaparecio; la fila "Cuerpo" s101 sumo una fila) ·
  **GAMIFICACION SUAVE** (matiza CLAUDE.md: agresiva no, suave si; video
  ref "I built a habit system as addicting as a casino" de SpoonFedStudy;
  sesion de DISEÑO propia antes de codigo) · PLATAFORMAS: web + Android +
  **iOS** cuando corresponda (Capacitor cubre ambos, post-venta). Principios
  transversales del usuario: bonita, simple, util, profesional, vistosa,
  sencilla y facil de usar. Detalle en ROADMAP "Backlog de pulido".
- **[Feedback s103-cierre]** i18n 3+ IDIOMAS para la app final (preparar
  cuando toque; arquitectura lista, decision s81) · RESEARCH competidores
  Google Play + App Store (leer reseñas, destilar insights; pre-venta) ·
  canal **@StarterStoryBuild** + video monetizacion (memoria
  premium-strategy-sources) · BUILDER "Tus rutinas" para Mueve Y Estira +
  mucho mas visible · boton **(i) de informacion por ejercicio** (mapea
  s107-108) · UI general mas atractiva y vistosa · SIDEBAR mas bonita/
  organizada/util (¿custom routines premium ahi? → decidir en s106) ·
  LOGROS: pacing inicial (demasiados sellos sin casi hacer nada → sesion
  gamificacion suave) + glifos de logros sin coherencia de constelaciones
  (ej. Cuello atendido, Escritorio express) → la revision COMPLETA pre-venta
  cubre TAMBIEN los de logros · estilos de TIMER Barra/Analogico feos vs
  Aro · OPS: protocolo de updates con clientes reales (base SW s102 hecha;
  falta smoke tests + rollback + versionado de datos; pre-venta) · VISUAL
  RESPIRA mas bonito/grafico (sesion de diseño, propuestas registradas) ·
  WELCOME mas vistosa/cercana/explicativa (amplia s105) · BREAKMENU sin los
  glifos de ActivityBar de la home (fix pequeño, proxima sesion de pulido) ·
  **BUG aro del timer**: en PAUSA y LARGA el aro se mueve del sitio y no
  respeta el diseño de FOCO (la fila MIN de presets solo existe en Foco →
  la columna sube; reservar el espacio o equivalente). Detalle en ROADMAP.
- **[Entre sesiones — experimento ilustraciones Caminos]** El usuario
  planea una sesion experimental aparte: ilustracion editorial como fondo
  del modulo Caminos (empieza por path.dawn, asset a
  `app/paths/illustrations/assets/`). Patron arte s84/D-4 (el usuario
  aporta, se porta literal). Si aterriza antes de s104, la Tarea 0 de git
  debe esperar cambios en `app/paths/` + assets nuevos.
