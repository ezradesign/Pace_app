# PACE · Estado del proyecto

> **Presente + proximo.** Para el historial, ver
> [`CHANGELOG.md`](./CHANGELOG.md) (versiones) y
> [`docs/sessions/`](./docs/sessions/) (diario de trabajo).
>
> **Al cerrar sesion:** escribir el detalle en `docs/sessions/session-NN-xxx.md`,
> destilar una entrada en `CHANGELOG.md`, y **sustituir** (no anadir) la
> seccion "Ultima sesion" de este archivo. Este archivo no debe crecer.

---

**Version actual:** v0.115.0 (s184 - **EL RECORRIDO QUE SOLO PISA LO QUE SE VE**. El arco del Pomodoro deja de dar los 360 grados y recorre **exactamente el tramo visible**: nace en el cruce izquierdo del horizonte, sube por las 12 y muere en el derecho. **Y ese «unos 270» no se escribe, se mide** -- el ratio horizonte/D no es constante, asi que el barrido va de **~266 a ~276 grados**; medido **271,58** a 1280x800 y **271,84** a 390x844, y un 270 fijo dejaria los cabos **1,9 px** fuera del corte. **Tres defectos solo aparecieron midiendo**: mi primera version **se quedo redonda con el motor funcionando** (devolvi «360» donde la respuesta era «aun no lo se»), el cabo derecho caia **0,78 px** por debajo del izquierdo (Chrome dibuja el circulo con beziers de 297,97, no con la circunferencia de 298,451), y al redimensionar aparecia un **fantasma de color con el Pomodoro parado**. Luego, **LOS TRES BORDES** que pidio el usuario: el horizonte pasa de filo a **NIEBLA con curva**, y **el halo dejaba de pintar la fila de minutos** -- que no era precaucion, **estaba pasando**: la premisa escrita en su propio comentario («~59 px hasta la fila») era falsa, hoy hay **24,5**, y la banda recibia **57 sobre 255**. Ahora **0-1 en seis viewports**. Se retira `--pace-abre`. **Y ENTONCES EL USUARIO LO PROBO**, y salieron tres cosas que ninguna suite iba a encontrar: el arco **tardaba ~2,2 min en verse** (nace EN el corte, donde la mascara vale cero, y le habia puesto encima la niebla larga) · arriba habia una **linea de corte**, que era el CODO de mi rampa · y el aro debia bajar **hasta el canto de las tarjetas**, para que lo termine una OCLUSION y no un desvanecido en el aire. Eso obligo a separar `--pace-corte` de `--pace-horizon`, porque ese token TAMBIEN mueve el layout. Barrido final **295,8 grados**. **187 → 191**, con **9 mutantes en rojo**, uno declarado que no muerde, y dos specs nuevos.)

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
| `app/main/_responsive.atmosfera.js` | **EL JS QUE COMPONE LA LUZ (s163)**, cortado de `_responsive.js`. Construye como CADENAS los degradados y mascaras que la hoja interpola — halo, limbo, bloom, horizonte y las paradas de color de la hora — y **no tiene ni una regla CSS**. Publica `window.paceAtmosfera` con los nombres que la hoja usa y ni uno mas. **CARGA ANTES** de `_responsive.js`, que lo desestructura en su cuerpo. **s184: los TRES BORDES viven aqui juntos y a proposito** (`LUZ_TECHO`, `LUZ_PLENO`, `LUZ_COLA`, `NIEBLA`, `CURVA_NIEBLA`) -- el horizonte pasa de filo a niebla con curva, la rampa de arriba MUERE en vez de atenuar al 72 % (la fila de minutos recibia 57 sobre 255) y la luz se apaga 0,22 D bajo el horizonte. Sale `--pace-abre`; entran `colaLimbo` y `colaBloom`: **15 exportados** | **v0.115.0 · 485 ln** |
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
| `tests/aro-recorrido.spec.js` | **EL RECORRIDO DEL ARO (s184)**. 3 tests, **4 mutantes y los 4 muerden**. El aserto del barrido **no compara contra 270**: deriva el angulo esperado de la MASCARA del horizonte -- camino independiente del que recorre el componente, que lee la custom property-- y exige 0,2 grados de tolerancia. Mide **por los dos lados** (la leccion de s179: el cabo izquierdo esta donde esta tambien con el arco entero; el que distingue es el derecho) y su simetria. Con la sesion viva comprueba que a mitad de bloque la punta cae en las **12** -- el mutante «sin giro» la deja a 136 grados-- y que el punto guia recorre el MISMO barrido. **El angulo del punto se lee del ATRIBUTO**: su grupo lleva una transicion de 1 s y `page.clock` no mueve las transiciones CSS, asi que su rectangulo tras un `fastForward` da 139 px de diferencia con la app intacta. **Declara que NO cubre Caminos** | **NUEVO s184 · 3 tests** |
| `tests/home-luz-bordes.spec.js` | **DONDE ACABAN LA LUZ Y EL ANILLO (s184)**, cortado de `home-luz.spec.js` por DOMINIO. 3 tests, **3 mutantes**. Se lleva `perfilDeLuz`, que no usa nadie mas: dos capturas del **MISMO fotograma** con el reloj congelado apagando solo `[data-pace-sun]` -- restar «apagada» contra «al 50 %» mide tambien digitos, CTA y arco, con picos de 211 en la banda del numero. El aserto de la fila de minutos es **RELACIONAL** (fraccion de la luz pegada al aro) con guard por arriba, para que un halo apagado del todo no lo pase con matricula. **El aserto de la cola SI se pone rojo**, cuando su version anterior declaraba por escrito que no se habia conseguido: el contrato cambio de «distinguir dos intensidades» a «distinguir algo de nada» | **NUEVO s184 · 3 tests** |
| `tests/home.helpers.js` | **Utilidades compartidas de la home (s159)**: la semilla del Camino en curso, la sonda unica de geometria, el parser de px y la espera a que la home se asiente. Extraidas al partir `home-geometria.spec.js`, que habia llegado a **631 lineas** — **ni una linea de cuerpo cambio**. **s160: nace `asentarGeometria()`**, que espera a que `--pace-timer-d` **repita valor tres frames seguidos** — el motor converge en varias pasadas y con la suite en 8 workers no le caben en dos frames (medido: el aro leido a destiempo daba **420 px**, su valor de PARTIDA). **NO se mete dentro de `asentar`** a proposito: lo llaman veinte sitios, algunos con `page.clock` instalado, y ahi rAF **solo corre cuando el reloj avanza** | **s160** |
| `tests/home-luz.spec.js` | **El CONTRATO de la atmosfera (s158, extraido en s159)**: cuando existe, de donde saca el color, que no toca la geometria y que se apaga sola. **s184: los tres asertos de BORDES salen a `home-luz-bordes.spec.js`** al llegar este archivo a 581 lineas (581 → 322), y con ellos `perfilDeLuz`, que era su instrumento. El aserto del horizonte se reescribio: de «corta en seco» a «es niebla, muere en la linea, y no depende de la sesion» | **v0.115.0 · 322 ln** |
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
| `app/ui/TimerDial.jsx` | Anillo circular compartido (FocusTimer + PathFocusStep). **s184: en la home el recorrido es el TRAMO VISIBLE, no los 360**, y **pista y arco van en CAPAS SEPARADAS** porque no pueden llevar la misma niebla — el arco nace EN el corte y con la larga tardaba ~2,2 min en verse. -- nace en el cruce izquierdo del horizonte, sube por las 12 y muere en el derecho, y el angulo lo MIDE de `--pace-dial-d` y `--pace-horizon` (`asin((D/2-H)/0,475D)`), porque el ratio no es constante: **266-276 grados** segun el breakpoint. La medida devuelve `null` cuando no puede decidir -- devolver «360» congelo el aro redondo con el motor funcionando-- y la dispara un `MutationObserver` sobre el `style` de `<html>`. `pathLength=360` deja el trazo en grados y quita **0,78 px** de asimetria entre cabos. El `key` del arco cuelga del barrido: la geometria no se transiciona. **Caminos va por `ticks` y no cambia** | **v0.115.0** |
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

> s184 recorta el arco del Pomodoro al tramo visible, lo baja hasta el canto de las
> tarjetas y suaviza los bordes de la luz. Publica **v0.115.0**. Suite **187 → 191**,
> `verify` en verde, artefacto regenerado. **La mitad del trabajo salio de la
> revision del usuario, no del encargo inicial.**
>
> Diario: [session-184](./docs/sessions/session-184-el-recorrido-visible.md)

- **[«NO LO SE» NO ES «360»: UNA MEDIDA TIENE TRES RESPUESTAS]** El defecto mas
  reutilizable de la sesion, y era mio. La primera version del barrido devolvia
  «vuelta entera» cuando `--pace-horizon` aun no resolvia -- caso del ARRANQUE--, y
  como el marco ya tenia sus 420 px definitivos **el `ResizeObserver` no volvia a
  disparar nunca**: el aro se quedaba redondo con toda la maquinaria nueva
  funcionando. Un valor por defecto plausible **congela el estado en silencio**. La
  forma correcta: `null` cuando no se puede decidir, y el disparador puesto donde
  el motor **escribe** (`MutationObserver` sobre el `style` de `<html>`), no donde
  se espera que algo cambie de tamano.

- **[UNA PREMISA ESCRITA AL LADO DEL CODIGO QUE GOBIERNA PUEDE SER FALSA]** La
  rampa superior del limbo decia «por encima del aro solo hay ~59 px hasta la fila
  de minutos» y por eso solo ATENUABA. Hoy hay **24,5 px**, el limbo muere **64 px**
  pasado el aro, y la fila recibia **57 sobre 255**. Es la misma clase que la
  auditoria de s183: un comentario que fue cierto y dejo de serlo sin que nadie
  pasara por su archivo. **La cifra estaba escrita; lo que faltaba era volver a
  medirla.**

- **[UN MUTANTE PUEDE MENTIR EN VERDE]** La hoja declara la mascara DOS veces,
  `-webkit-mask-image` y `mask-image`. Mutar solo la primera no cambia un pixel en
  Chrome, que usa la segunda, y el mutante salio verde **dos pasadas seguidas**
  pareciendo que el aserto no servia. Antes de declarar «este aserto no se pone
  rojo», comprobar que el mutante LLEGA al artefacto.

- **[EL SERVICE WORKER SIRVE `.jsx` CACHEADOS, Y SE RE-REGISTRA EN CADA CARGA]** La
  trampa de s139, pagada cuatro veces seguidas: llegue a diagnosticar «el efecto no
  se ejecuta nunca» sobre una version que el navegador **ni habia cargado**.
  Purgarlo una vez no basta -- vuelve en la siguiente navegacion.

- **[EL PERFIL DE LUZ SE MIDE SOBRE EL MISMO FOTOGRAMA]** Restar «sesion apagada»
  contra «sesion al 50 %» mide tambien digitos, CTA y arco: picos de **211** en la
  banda del numero. Con el reloj congelado y apagando solo `[data-pace-sun]`, lo
  que queda es la luz y nada mas. Es el instrumento que decidio los tres bordes.

- **[LA REVISION ENCONTRO TRES DEFECTOS QUE LA SUITE NO PODIA VER]** Y ese es el
  resumen de la sesion. Con 191 tests en verde, `verify` limpio y todo medido, el
  usuario probo la app y salieron: un arco que **tardaba ~2,2 min en verse**, una
  **linea de corte** en el halo, y un aro que debia bajar hasta el canto de las
  tarjetas. Ninguno era una regresion: los tres eran decisiones mias que solo se
  juzgan mirando. **La revision a tamano real sigue siendo el detector que manda**
  (s147), y la red esta para que lo que se arregla no vuelva.

- **[UNA SOLA NIEBLA PARA DOS COSAS QUE NO SON LA MISMA]** El arco nace EN el corte,
  justo donde la mascara vale cero, asi que ponerle encima la niebla larga (0,14 D)
  le costaba **~2,2 min** de un bloque de 25. El reparto correcto ya estaba escrito
  en `tokens.css` desde s158 —**«Arco = informacion; halo = ambiente»**— y no lo
  aplique. Ahora son dos capas: la pista se disuelve, el recorrido solo se remata.
  **Leccion**: cuando un mecanismo sirve a dos cosas con contratos distintos, el
  numero unico no es simplicidad, es una de las dos mal servida.

- **[UN QUIEBRE DE PENDIENTE SE VE COMO UN BORDE]** La «linea de corte» de arriba no
  era un corte: era el CODO donde mi rampa pasaba de una pendiente a otra cuatro
  veces menor. El propio archivo lo tenia escrito tres bloques mas arriba, en el
  porque de que el limbo lleve **once** paradas y no cinco. Con una S de seis
  paradas desaparece — y de paso pesa MAS en el tramo medio, que era la otra mitad
  de la queja («demasiado difusa»).

- **[UN TOKEN QUE SIRVE A DOS PREGUNTAS HAY QUE PARTIRLO, NO MOVERLO]** Bajar el aro
  hasta las tarjetas parecia cambiar un numero, y no: `--pace-horizon` **tambien
  mueve el layout** (las dos pieles lo usan como margin-top negativo, y
  `SuggestedPathCard` igual), asi que bajarlo habria bajado las tarjetas con el aro.
  Nace `--pace-corte`. **La garantia de s156 no se pierde, cambia de forma**: el
  motor lo calcula restandole al MISMO solapamiento la banda del rotulo, que MIDE.
  Una fuente, dos consumidores.

- **[UN CUSTOM PROPERTY SIN REGISTRAR NO SE COMPUTA]** Con la resta escrita en CSS,
  `--pace-corte` valia el TEXTO `max(4px, calc(67px - 32px - 6px))`: `parseFloat` da
  NaN y el aro se quedo dando la vuelta entera. Es **el mismo modo de fallo** que el
  del arranque de arriba —una lectura que no puede decidir— por otra causa. Lo
  publica el motor ya en px, como los otros dos.

- **[«RESPONSIVE OK» NO ES «SE APLICO»]** Un script imprimio su mensaje de exito y yo
  no verifique el reemplazo: la regla de la mascara de la pista **nunca se anadio**,
  y la pista llevo la niebla del arco durante dos rondas de capturas mientras yo
  describia lo contrario. Lo cazo un aserto que hubo que escribir **despues** de que
  su mutante saliera verde.

- **[LO QUE ESTA SESION NO CUBRE, DICHO]** Caminos no se toca (su aro va por
  `ticks`, sin arco ni horizonte). Los estilos `barra` y `analogico` no pasan por
  `TimerDial`. El perfil de la luz en **movil** lo mide el banco, no la suite. Las
  dos nieblas se calibraron a 1280x800 y en movil se juzgaron **mirando**. Que un
  degradado tenga un codo visible **no lo caza ningun aserto** — se intento y sale
  verde. Y el aro pasa por detras de las tarjetas, pero **no se comprueba que hay en
  los HUECOS** entre ellas a cada ancho: el cabo cae dentro de una tarjeta en los
  cuatro viewports medidos, y en otros podria caer en un hueco.

---

## Decisiones activas -- indice

> El TEXTO COMPLETO de cada decision vive en
> [`docs/product/DECISIONES_TECNICAS_VIGENTES.md`](docs/product/DECISIONES_TECNICAS_VIGENTES.md) (GOBIERNA).
> Aqui solo el indice, para que este archivo siga siendo ligero en cada arranque.
> **Antes de tocar un subsistema, leer su fila alli.**

- **El corte del aro NO es el horizonte: baja hasta el canto de las tarjetas, y se derivan de la misma fuente** (s184)
- **La PISTA y el ARCO no pueden llevar la misma niebla: uno es ambiente y el otro informacion** (s184)
- **El recorrido del aro es el TRAMO VISIBLE, y su angulo se MIDE del horizonte -- nunca se escribe** (s184)
- **La luz de la home muere ANTES de la fila de minutos, y el horizonte es NIEBLA, no filo** (s184)
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
