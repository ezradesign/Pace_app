# PACE · Estado del proyecto

> **Presente + proximo.** Para el historial, ver
> [`CHANGELOG.md`](./CHANGELOG.md) (versiones) y
> [`docs/sessions/`](./docs/sessions/) (diario de trabajo).
>
> **Al cerrar sesion:** escribir el detalle en `docs/sessions/session-NN-xxx.md`,
> destilar una entrada en `CHANGELOG.md`, y **sustituir** (no anadir) la
> seccion "Ultima sesion" de este archivo. Este archivo no debe crecer.

---

**Version actual:** v0.110.0 (s179 — **EL RUNNER EN MOVIL CORTO, Y UN UMBRAL ELEGIDO MIRANDO UN SOLO LADO**. Cierra el bloque que s178 dejo abierto. El arreglo llegaba escrito y **no arreglaba lo que decia**: su `max-height: 660` salio del viewport que se estaba mirando (360x640), y ampliado el barrido HEAD solapaba a **375x667 — el iPhone SE/8 — con 7,2 px** y a **360x661 con 10,8**, los dos justo por encima del umbral; 360x680 sobrevivia por 1,9 px. **Mismo error que s177**, que declaro 641 cuando el borde real era 575: sube a **700**, el breakpoint que la hoja ya usaba. **El guard de cero pidio el control positivo** y hacia falta — servido el `index.html` de HEAD con sus `fonts/`, la misma sonda daba 26,3 px a 360x640, el numero exacto del diagnostico. **El banco dijo «arreglado» y el censo lo desmintio** (el banco mide UNA rutina y lo declara): quedaban 5 de 19 rutinas y 7 de 79 pasos, de 16 y 60. **LA CAUSA REAL, invisible desde hace cinco sesiones**: la pantalla de colocacion pinta `[data-pace-v1-num]` y **no** `-timer`, asi que todos los tramos cortos —**los de s119 en escritorio tambien**— comprimian un elemento que ahi no existe. Con eso y el nombre fijado a **30 px, el suelo que su propio clamp ya declara**, **ninguna rutina solapa** a 360x640, 375x667 ni 360x600. **Declarado y no arreglado**: por debajo de ~575 sigue solapando, porque lo unico que queda es el glifo y **la fuente unica de s177 prohibe encogerlo por CSS**. **153/153** (eran 150) y `verify` en verde.)
**Version anterior:** v0.108.0 (s178 — **LA AUDITORIA COMPLETA**, el encargo del usuario. Lo primero que contesta es que **el papel iba por detras del codigo, y siempre en la misma direccion**: el ROADMAP pintaba MAS trabajo del que hay. La Fase 3 seguia «EN CURSO (s155)» con los emisores entregados en **v0.102.0** y la retencion corriendo sola desde **s174**; la ola B decia **20 dibujos** y son **3**; el arte de logros decia **58 de 96 / 38 sin dibujo** y es **77 de 96 / 19**. Trece hallazgos con evidencia file:line, **once cerrados en la misma sesion**. **`privacy.html` se habia tocado UNA vez en toda la vida del proyecto** (v0.46.0) y llevaba dentro justo el absoluto que s151 prohibio — reescrito en ES y EN **y fechado**, porque la propia pagina promete que su fecha cambia con ella. **EL VUELO NO ESTABA INERTE**: `main.jsx` lo llamaba en CADA entrada a sesion, clonaba un nodo y gastaba 24 frames buscando un destino que s175 se llevo; borrado en sus DOS sitios. La tabla de deuda **mentia en 10 de 14 filas** —s162 la cazo en cinco, o sea que empeoro— y pierde su columna de numeros: la cuenta la lleva el trinquete del `verify`. **El instrumento mintio SEIS veces**, y la cara fue excluir en un grep lo precedido por punto, que mata `window.X` y daba por muertos dos archivos vivisimos. **150/150 y `verify` en verde.**)
**Version anterior:** v0.107.0 (s177 — **LO QUE NO SE OIA**. Cuatro bloques y los cuatro salieron de lo que el usuario vio y oyo al probar, que va por CUATRO sesiones seguidas reproduciendo. **EL RUNNER SE CONGELA**: el «Cuidate» se metia **15,0 px dentro de la barra en 11 de 47 pasos** —causado por el anclaje de s176, que dio al bloque `min-height: 0` y le permite ENCOGER bajo su contenido— y entre pantallas se movian el nombre 26,4 px, el numero **51,2** y su etiqueta 4,6. Ahora **las SIETE piezas a 0,0**, y el numero unificado a **76 px** ANULA la decision de s112. «Subir el numero» no se podia hacer moviendolo: arriba habia 10,0 px y abajo **−15,0**. **STATS**: el modal gastaba 820 de 1536 y «Anio» dejaba **163,7 px muertos** de sus 385; ahora 1240, celda 19 y 52,4 — y **el MES no puede crecer**, medido (421,4 / 474,4 / 527,4 contra 385). **LA MUSICA**, cinco «no se oye» y tres errores mios: la ganancia **se iguala por RMS y no por pico** (igualar picos la dejaba 20 dB bajo la voz), una pieza con el **82,6 % de su energia bajo 200 Hz no sale de un altavoz de portatil**, y **el criterio con que la elegi estaba invertido** — la puntue mejor por «dejar el hueco de voz mas limpio», que es lo que la hacia inaudible. **150/150 y 6 de 6 mutantes muerden.**)
**Version anterior:** v0.106.0 (s176 — **LOS CUATRO SITIOS DONDE EL USUARIO TENIA RAZON**. Respira recibe la PANTALLA anulando s174; la barra del runner se ancla al centro; Stats iguala sus cuatro pestanias; y la voz gana interruptor y hermana. 146/146.)
**Version anterior (2):** v0.103.0 (s173 — **LA INGESTA DEJA DE SER TODO-O-NADA**: entran 4 dibujos con `--fusionar` y nace `verify.mascaras.js`.)
**Ultima sesion:** #175 -- 2026-08-27 - **LA VOZ DE RESPIRA, Y LOS CUATRO DEFECTOS QUE EL USUARIO VIO ANTES QUE YO**. Bump **v0.104.0 -> v0.105.0**. **(1) LOS CUATRO DEFECTOS REPRODUCEN, y el dato que faltaba no estaba en sus capturas**: su pantalla es 1920x1080 **al 125 % de escala**, o sea **1536 CSS px**; a 1920 el recorte no ocurria. Huecos del rail **11/25/0/11**, y el cero **no era un valor mal puesto**: la regla da aire a lo que sigue a un rotulo y «Tus rutinas» es el unico bloque que no lleva ninguno encima, asi que **se caia del selector**. El rail era `static` con la caja estirada a **1250 px** sobre **566** de contenido, y al fondo quedaban **144 px de rail y 697 de columna vacia**. **(2) OCHO VARIANTES PINTADAS** en iframes de 1536x714 reales, con la tarjeta de produccion renderizada de verdad (`react-dom/server`) y el CSS **extraido de `library.css.jsx`**, cada marco **midiendose a si mismo**. De ahi el hallazgo que no se ve razonando: **dar aire EMPEORA el recorte** (22 -> 48 px), asi que «mas aire» y «que quepa» no caben juntas con dos sugerencias. Entregado **A2**: huecos **11/25/25/11**, recorte **0**, **481 px de rail intactos** al fondo, medido contra el artefacto de HEAD servido en paralelo. **UNA sugerencia en las DOS pieles** porque lo que sube se RETIRA del catalogo. **(3) EL PREPARATE PIERDE EL GLIFO** y con el **se cae la transicion de s174**: aquel circulo era su UNICO destino, asi que el vuelo se retira solo y `library-transition.js` queda **inerte** (130 lineas, con test que vigila que no deje rastro). Las tres bibliotecas comparten ya la preparacion de Respira. **(4) ENTRA LA VOZ `sulafat`**, lo que **anula «Voz/TTS: NUNCA»** —cuatro filas marcadas `SUPERSEDED por s175` y tres sitios del ROADMAP—. **El numero costo TRES intentos y los tres estan escritos**: cabecera MPEG «14 de 20» (daba casi la mitad de la duracion real), `audio.duration` «8 de 20» (correcta pero **incluye los silencios**) y, tras el apunte del usuario, **17 de 20** midiendo los extremos de la onda — el «exhala» ocupa **4,96 s de archivo y la palabra acaba a los 2,12**. **La misma equivocacion las dos veces: medir el CONTENEDOR en vez del CONTENIDO.** De paso destapo un defecto no visto: **0,65 s de silencio inicial** hacian que la senal llegara **tarde**. Decision **por FASE y no global**; disponibilidad **por precarga** porque `play()` es asincrono. Fuera solo las tres de bombeo. **(5) AUDITORIA INTEGRAL** en [audit-integral-s175](./docs/audits/audit-integral-s175.md). **(6) OCHO MENTIRAS DEL INSTRUMENTO, y casi todas MIAS**: la maqueta enseñaba el «despues» en el marco del «antes» (lee la hoja de produccion, que ya llevaba el arreglo); dibuje «Tus rutinas» a mano y daba 9 px donde la app da 0; el marco no heredaba `box-sizing` y se regalaba 40 px; **consulte el DOM sin filtrar por caja visible** —la trampa que s174 documento SEIS veces, y la septima fue en mi instrumento—; el alto del modal movil clavado en 706 px sacaba barra en un telefono de 568; el badge media **antes de cargar las fuentes**; y un control que estrechaba el root a mano **no recalcula el arte**, asi que no probaba nada. **(7) VERIFICACION**: `verify` PASA · **136/136** · **10 mutantes de 11 muerden** — el que no (quitar el `flex-shrink`) **paso en verde** porque el arte se encoge solo, asi que su test **se retira** y se corrige el comentario que afirmaba lo contrario. Diario: [session-175](./docs/sessions/session-175-la-voz-y-lo-que-el-usuario-vio.md)

**Sesion anterior:** #171 -- 2026-08-19 - **EL CIRCULO DEL GLIFO, Y LOS DOS DIBUJOS QUE SOBRABAN**. Bump **v0.100.0 -> v0.101.0**. **La sesion NO hizo lo que traia el handoff**: el plan era el emisor de la Fase 3 y a mitad de la revision de glifos el usuario mando cinco capturas con tres defectos visuales, que pasaron a ser el trabajo. Diario: [session-171](./docs/sessions/session-171-el-circulo-del-glifo.md).


**Sesion anterior:** #166 -- 2026-08-18 - **CUATRO FRENTES Y NUEVE MENTIRAS DEL INSTRUMENTO**. Bump **v0.95.0 -> v0.96.0**. **(0) EL ESTADO DECLARADO NO REPRODUCIA.** El arranque daba el `72/72` por bueno y daban **68**; tres pasadas sobre el mismo arbol (68/72, 70/72, **5/5 aislada**), siempre `respira-progreso.spec.js` y siempre `Test timeout of 60000ms exceeded`. El numero esta en los que SI pasaron: **58,0 s y 59,6 s contra 60**. La variable es `workers: CI ? 2 : undefined` = **8 en local**, y el control cierra el diagnostico: **2 workers dan 72/72 en 1,0 min contra 2,2 min y rojo con 8**. El CI lleva verde desde s165 **por correr en la condicion tranquila**. **SIN ARREGLAR a proposito**: es decision del usuario entre capar workers, subir el plazo (s165 lo rechazo por escrito) o abaratar los cuatro tests; toda la sesion corrio con `--workers=2` sin tocar la config. **(1) EL CTA DEL POMODORO.** Decia «Empezar foco» en Pausa y Larga sobre un reloj que no es de foco. Una sola `startLabel` para los dos sitios que arrancan —idle y completed—, porque tenerlas separadas fue como nacio el desajuste. `banco-cta-pomodoro.js` mide **12 casos** (`{foco,pausa,larga} × {es,en} × {claro,oscuro}`): 0 discrepancias. **El usuario lo reporto como no arreglado con capturas de `paceweb.pages.dev`** — el sitio publicado, no el arbol local. **(2) LA BARRA DE RESPIRA EN MOVIL CABE**: caso peor 5 rondas a 320 px, **5 segmentos de 48,8 px** y 100 px de holgura, 16 escenas y 0 fuera de vista. Pero la primera version del banco era una **TAUTOLOGIA** —medir «desborda a su padre» cuando la barra es `width:100%` DE ESE PADRE—, demostrado saboteando `maxWidth` de 260 a 600: la barra crecio a 374 px y siguio diciendo «0 desbordes». El guard de cero no bastaba: **un detector que no puede decir que SI no esta midiendo**. Rehecho para mirar el ancho de segmento y que la barra entre entera —el riesgo de movil es VERTICAL— y con **control positivo** a 320x300 que TIENE que caer. **(3) UN SOLO ORDEN DE HOME**, aro → Actividades → Camino en las dos pieles, pedido por el usuario mirando movil y web al lado. Actividades hereda el papel de horizonte **sin mecanismo nuevo** (el selector de hermano adyacente de s156 ya decia «el primero despues del aro») y la tarjeta suelta su margen negativo como escritorio desde s126. **El lector de `--pace-skin` en JS se retira entero**: existia solo para elegir el orden y era un re-render de la home al cruzar el breakpoint a cambio de nada. **SE RETIRAN DOS AFIRMACIONES HECHAS AL USUARIO**: «el solapamiento pasa de 64 a 54 px» y «arregla un retroceso de foco a 320». La primera era medir **a media convergencia** —el motor publica mas de una vez— y sale **identica en las 5 vistas** (47/47 · 54/54 · 57/57 · 1/1 · 80/80, publicado == real); la segunda, que a 320 la home **desborda 8 px** y tabular arrastra el viewport (22 paradas en vez de 12). Las cuatro trampas estaban **ya resueltas en `tests/home.helpers.js`** con su porque al lado, asi que el banco pasa a **consumir la sonda de la suite**. De propina: **los chips SI llevan subtitulo** a 360/375/390 y solo desaparecen a 320. **(4) EL TIEMPO DE RETENCION**, aprobado en s165. Se fotografian **seis variantes sobre el panel Ritmo real** y se implementa como **serie semanal en SEGUNDOS** (`weeklyStats.holdSeconds`, que baja al historico por el rollover): esa escala **soporta las seis** y la de por vida no. Linea al pie que **NO aparece si vale cero** —solo 3 de 20 rutinas tienen retencion—. **No es «empezar a contar la apnea»**: `activeMsRef` la suma desde s98. El reloj vive en `BreatheSession.support.jsx` por §1. **EL BANCO DE MUTACIONES OBLIGO A CAMBIAR EL CODIGO**: M1 no mordio dos veces, y la segunda la culpa era del producto —**dos mecanismos redundantes** tapandose entre si—; se quito uno y **las cuatro muerden**. **(5) EL MECANISMO DE LAS MASCARAS DE EJERCICIO** con el mapa **VACIO** y precedencia sobre el SVG: con el mapa vacio la app pinta lo de ayer y **los 62 no tienen que llegar de golpe**. `ingest-glifos-ejercicio.js` probado sobre PNG sinteticos (un trazo de L=120 llega a **alfa 255**; sin normalizar, al 49 %) y **corregido dos veces por si mismo**: 51 identidades leyendo solo el registro y 62 contando dibujos huerfanos que el encargo dice no rehacer, hasta dar **61 = 61**. Sus dos asertos costaron **tres rojos** (la biblioteca no pinta glifos, reabrir navegando pierde el estado inyectado, y una ruta falsa da 404). **VERIFICACION**: `verify` PASA, **78/78**, `PACE_standalone.html` intacto en v0.71.0 tras ~15 builds, consola limpia en los cinco bancos. **NO CUBIERTO**: la variante de retencion es **suposicion** (V4 es una linea) · el instrumento E2E sigue abierto · la ingesta sin arte real · retencion sin mirar en movil · `BreatheSession.jsx` en **493 de 500** · la **pill de Foco/Pausa/Larga en pantallas largas** anotada con sus dos preguntas sin responder. Diario: [session-166](docs/sessions/session-166-retencion-orden-y-mascaras.md).
**Sesion anterior:** #165 -- 2026-08-17 - **UNA BARRA QUE DICE LO QUE LA APP SABE**. Bump **v0.94.0 -> v0.95.0**. **(1) LA DECISION NO SE DEDUJO, SE MIRO — Y CAMBIO DE SIGNO POR EL CAMINO.** Se implanto 1C con **puntos** (vocabulario del Pomodoro) y se fotografio contra el `index.html` de HEAD servido **en paralelo**; el usuario, viendolo, devolvio **la pantalla de HOY**, o sea contra 1C. En vez de interpretarlo se le dijo que esa captura era la de hoy y **se pregunto**, y pidio lo que abrio la sesion de verdad: revisar **las 20 rutinas** antes de proponer nada. **(2) EL CENSO DESTAPA TRES FAMILIAS DE RITMO, NO DOS**: por bloques (3), por tiempo (15) y **BOMBEO** —Bhastrika y Kapalabhati, fases de **1 s** y 90 ciclos en 3 min—, medido preguntandole a `getSequence()`, no leyendo el codigo. **(3) Y CORRIGE TRES COSAS ESCRITAS**: el **hueco muerto de la cuenta atras es de 5 rutinas y no de 3** (las de bombeo tampoco la enseñan nunca, y s164 solo conto las de rondas); una **barra de TIEMPO mentiria en las rondas**, porque no terminan por reloj; y **«un segmento por ciclo» no era exacto** en las cinco donde los ciclos no caen redondos (18,8 · 17,5 · 37,5 · 9,5 · 12,9), con el tope de 24 agrupando ya en **10 de las 17**. **(4) EL LISTON LO PUSO UNA DECISION DEL USUARIO, NO EL GUSTO**: s139 §A4 descarto marcas y enso **porque miden** —«invita a mirar la medida en vez de a respirar», el mismo criterio por el que s107 saco el cronometro de la retencion—, asi que la pregunta pasa a ser **cual es el mas periferico que todavia orienta**. De ahi entraron al menu **ningun indicador** y una **linea a sangre**, y tambien el **aro**, que choca con esa decision, porque el usuario pidio que las restricciones se le notifiquen y se le propongan. **(5) 18 CAPTURAS SOBRE LA APP REAL**, no maquetas: la sesion se conduce de verdad y solo se sustituye el indicador, apagando variantes con los hooks recien creados ⇒ **ni una bandera queda en produccion**. Hoja de revision entregada al usuario con el censo, los hallazgos y las 18 opciones. **(6) RESULTADO: T1 + R3**, y las dos barras se igualaron a **5 px** porque la maqueta de la segmentada traia los 6 px de Mueve y en el mismo hueco se notaba el escalon. La ronda sale de la cabecera en la sesion activa y **se queda en la retencion**, que no lleva barra: **una vez por pantalla**. **(7) LA RETENCION NO SE TOCA** (eleccion del usuario) y **medir su tiempo se aplaza a la sesion siguiente** — total acumulado, invisible durante la practica, **sin record y sin logro** (B1). Dato que cambio como se planteo: la apnea **ya se acredita** hoy, `activeMsRef` suma `hold`. **(8) CINCO ASERTOS NUEVOS Y LOS CINCO MORDIERON**, escritos como CONTRATOS (el numero de segmentos se lee de `data-pace-breathe-rounds` y se exige que coincida con los hijos, no se escribe a mano). **(9) EL INSTRUMENTO MINTIO SEIS VECES.** El banco de rojos dio **«0 failed / 0 passed» en las cuatro** y no era «no muerden»: `spawnSync('npx.cmd')` da **EINVAL en Node 24** y no corrio ni un test ⇒ se invoca el CLI por su `.js` y entra un **guard de cero** que distingue «no muerde» de «no corrio». El de capturas mintio cuatro veces mas: el **loto seguia moviendose** entre disparos (reloj virtual, transiciones CSS en tiempo real) y dos variantes salieron con el loto de distinto tamaño cuando la unica diferencia real era una linea de texto —congelado, la diferencia medida son **1090 pixeles de 4 096 000**, la caja del «RONDA 1 / 2» y nada mas—; un **`;` suelto** invalidaba la regla siguiente; la barra segmentada se pinto **dentro de la fila del texto** y lo partio en dos lineas; y el radio del aro se **dedujo** del `inset: 14%` en vez de medirse (147 px donde la linea real esta a 126). Y la sexta fue del estado elegido: las rondas se fotografiaban en la **ronda 1**, donde no hay ningun bloque completado ⇒ se repitio todo en la **ronda 2**. **(10) DOS DEFECTOS PROPIOS EN LOS ASERTOS**: el de D1 apuntaba al **segundo 96** calculado a mano y alli la sesion ya estaba en la retencion (reescrito para recorrer la ronda ENTERA con guard de cero, y quedo mas fuerte); y dos tests **pasaban aislados y se comian el timeout con la suite a 8 workers** — no era el producto, era el instrumento: ~500 viajes al navegador, abaratados a **una sola llamada por muestra** en vez de subir el plazo. **(11) UNA CARRERA PREEXISTENTE EN LAS PRUEBAS DE EVENTOS**, destapada por la carga de los 5 tests nuevos: el import recarga la app y la lectura siguiente caia dentro de la navegacion ⇒ `leerContenedor` reintenta UNA vez tras asentar la carga, propagando cualquier otro error. **(12) VERIFICACION**: `verify` PASA · **72/72 en dos pasadas seguidas** con el codigo de salida leido de archivo · consola limpia en las seis pasadas del banco · `PACE_standalone.html` **restaurado byte a byte** (los builds del banco de mutaciones lo reescriben: la torpeza de s162, repetida y cazada). **(13) LO QUE NO SE CUBRE**: **movil sin medir** (con `maxWidth: 260` el caso de 5 rondas aprieta mas, sospecha razonable sin medir) · **ingles y paleta oscura sin mirar** · **las dos rutinas de bombeo no se fotografiaron** · los 5 asertos miran **atributos, no pixeles** · el **tiempo de retencion** sin implementar, aplazado a proposito. Diario: [session-165](./docs/sessions/session-165-respira-progreso.md).

**Sesion anterior:** #162 -- 2026-08-17 - **EL TEST INTERMITENTE TENIA RAZON**. Bump **v0.92.0 -> v0.93.0**. **(1) LA AUDITORIA, MEDIDA Y NO LEIDA.** Version coherente, arbol limpio, `verify` PASA, `index.html` committeado = build de las fuentes, y **el CI en SUCCESS en sus dos ultimos runs**. Pero `npm run test:e2e` **no era estable**: pasada 1 **64/1**, pasada 2 **65/65**. Y la PRIMERA mentira del instrumento fue mia: lance la suite como `| tail`, y el 0 que devolvio era el de `tail` - a un paso de dar por verde una pasada con un rojo dentro. **(2) EL ROJO ERA DEL PRODUCTO.** No es contencion (12/12 con 8 workers) ni hambre de frames en el helper (banco con freno de CPU por CDP: **406 en las cuatro tasas**), y ese primer banco **media otra cosa** -ponia `reducedMotion` en el CONTEXTO, cuando el test carga NORMAL y el reduce entra por `emulateMedia` + `reload`-. Espejado, reprodujo: **a 1x el aro se queda en 420, y dos segundos despues SIGUE en 420**, o sea que el helper no miente. La radiografia: el desbordamiento vale **11** con reduce contra **-1** sin reduce, y **un `resize` a mano lo baja a 406** - el motor podia medirlo y no lo volvio a medir. **(3) LA CAUSA, CON CONTROL**: sin reduce el margen del horizonte aterriza en la misma tarea (-65 -> -51, stack 655 -> 669) y **no hay transicion viva**; con reduce el margen sigue en -65, el stack en 655, `getAnimations()` devuelve **`margin-top:running`** y el valor llega dos frames despues. Arreglo: `transition-property: none !important` sobre `[data-pace-activitybar]` y `[data-pace-spc]` **dentro de `@media (prefers-reduced-motion: reduce)`** - acotado a proposito, porque fuera de reduce la medida ya responde y esos nodos si tienen transiciones legitimas. Verificado: banco `ok` en las cuatro tasas, radiografia 406/-1 en las tres condiciones, y la suite **65/65 en tres pasadas** con el codigo de salida leido de verdad. De paso, la quinta vez que muerde la trampa del template literal: un backtick en un comentario de `_responsive.js` **aborto el build** (s139, s156, s157, s158 y ahora). **(4) REGRESAS NO ERA «NUNCA»: ERA UNA CARRERA, Y LA SUITE TENIA RAZON.** El hallazgo de s148 llevaba catorce sesiones diciendo que `first.return` no se desbloquea jamas. **Primera conclusion mia, equivocada**: medido con un estado de ayer sembrado y el codigo tal cual salia CONCEDIDO en los dos entries, y con el control —artefacto SIN mi arreglo— los dos asertos nuevos **pasaban igual**, asi que revertí el arreglo por innecesario. **La suite completa lo desmintio DOS VECES**, con el sello en `false` tras diez segundos de poll. **El mecanismo, medido en el artefacto**: `index.html` tiene **109 etiquetas `<script>`**, una por modulo, o sea que los modulos corren en TAREAS SEPARADAS; `unlockAchievement` vive en un modulo que se evalua DESPUES y aqui se referencia PELADA, asi que se resuelve contra `window` **al llamar** - y un `setTimeout(0)` armado antes puede ganarle, con el `catch` vacio enterrando el ReferenceError. **Quien gana depende de la CARGA**: pagina quieta, se concede; suite con ocho workers, se pierde. **La leccion del instrumento**: mi control corria en una condicion **mas tranquila** que el fallo, y un control que no reproduce las condiciones del rojo no es un control. Arreglo definitivo: la concesion va **dentro del estado que devuelve el rollover** (sin timer, sin orden de carga, retroactivo e idempotente), con `checkCollectorAchievements()` declarado como lo unico que no corre. **67/67 en tres pasadas completas seguidas.** **(5) DOS ASERTOS NUEVOS Y SUS DOS MUTACIONES**: "volver un dia despues concede Regresas" muerde borrando el trigger (1/88 -> 0/88) y "quien ya lo tiene no lo vuelve a ganar" **no** muerde con esa -la suya es quitar el guard de idempotencia de `unlockAchievement`, y ahi da cola de **3** en vez de vacia-. Nace **`sembrarPisando()`**, porque `beforeEach(sembrar)` mas `sembrar` ("solo si falta", s154) hacia que mi segunda siembra **no entrara nunca**: el aserto salio rojo con el producto correcto. Y un hecho nuevo medido de paso: **`loadState()` NO PERSISTE** su resultado -el rollover vive en memoria hasta el primer `setState`-, preexistente y benigno, pero un aserto contra `localStorage` ahi sale rojo con el producto sano. **(6) LA REGLA 1, VIGILADA.** Nace `scripts/verify.tamano.js` y **se cazo a si mismo**: escrito dentro de `verify.js` lo dejo en **544 lineas** y salio rojo sobre su autor (la leccion de s155: se arregla el diseño, no el checker). `DEUDA_500` es un **TRINQUETE** con tres dientes mas guard de cero, **los cuatro verificados en rojo**; y se cazo un defecto propio: los dientes 2 y 3 imprimian el `[OK]` **detras del `[FALLA]`**. **(7) LOS CINCO ARCHIVOS QUE ROMPEN LA REGLA 1** salieron de la auditoria y la tabla de deuda de STATE **mentia en los cinco** (`_responsive.js` **1132** y ni figuraba; `tokens.css` 676 donde decia 386). Reconstruido con `git show`: los tres primeros cruzaron el limite **en s159**, `_responsive.js` de 465 a 1039 en un solo commit. **(8) DOCUMENTACION**: los **26** enlaces del CHANGELOG a diarios de las sesiones 1-26 que nunca se escribieron pasan a "(sin diario)" y quedan **cero enlaces rotos**; los dos README van de **v0.84.0 a v0.93.0** -ocho versiones de deriva- y **entran en la comprobacion de version del `verify`** (7 sitios, dos por README), verificada en rojo. **(9) LO QUE NO SE CUBRE**: los cinco archivos **siguen** sobre 500 lineas (el trinquete los congela; trocear los tres del sistema visual quiere una pasada VISUAL del usuario, que la suite no da) - ni un pixel comparado - movil sin medir - **Respira sin abrir por cuarta sesion** - el tiron del arco sigue esperando el banco en el telefono - **D3 pendiente de mirarlo** (el usuario eligio decidirlo viendo las dos versiones). **(10) EL PRIMER PUSH PUSO EL CI ROJO, Y SE OBSERVO.** Un solo test, `home-luz-curva.spec.js:140` («GUARD: la luz se apago a mitad del recorrido»), con `verify` en verde. **Descartado que fuera mio sin medir nada**: ese archivo no siembra `lastActiveDay` -mi cambio del rollover esta gateado en el- y no usa reduced-motion, asi que mis dos ediciones de producto no pueden alcanzarlo. Es **el defecto de s161 en el archivo que quedo pendiente**: s159 partio la suite de la luz en dos y s161 reparo los dos asertos del hermano. `--pace-on` vale **cero exacto** en el instante en que aparece `data-pace-dial-running`, y el guard exige `on > 0` en las 21 paradas. **No reproducia en local** (12/12 con 8 workers, 4/4 con `CI=true`), asi que se midio el valor en el instante de la lectura: **3 de 10 arranques dan 0,0000 y los otros 7 dan 0,0002** — la prueba vivia sobre el filo. `abrirBloque` **espera ahora a que la luz encienda**; se espera, no se baja el liston, y muerde saboteando `publicarLuz`. **(11) Y UNA TORPEZA PROPIA**: el commit del arreglo se llevo `PACE_standalone.html` **regenerado a v0.93.0** contra la decision s134. La trampa: el build reescribe los DOS artefactos y **`npm run verify` solo restaura el standalone alrededor de SU propia pasada**, no de las mias. Devuelto a v0.71.0, byte a byte igual que antes de la sesion. **El CI cierra VERDE y OBSERVADO** en `513aa67`: los dos jobs en success, **`67 passed (57.6s)`** leido del log y el paso propio del verify confirmando el artefacto. Tres commits: `ca9f3c1` (v0.93.0), `79c06cc` (la espera de la luz, sin bump) y `513aa67` (el standalone). Diario: [session-162](./docs/sessions/session-162-carrera-reduced-motion-y-trinquete.md).





**Ultima actualizacion de este archivo:** 2026-08-18 - sesion 169 (v0.99.0; se retiro del encabezado el resumen de la version v0.95.0 y de la sesion #161, que sigue en `CHANGELOG.md` y en su diario - este archivo no debe crecer)
**Build entregado:** `index.html` **v0.99.1** (sha256 `26930D67D96294C9`; **no contiene ni un byte CR** (0 de **1 524 977**, medido en s169): desde s153 el build normaliza los finales de linea al leer, asi que el artefacto **ya no depende del worktree de quien lo genera**. `PACE_standalone.html` restaurado **byte-identico** — hash `998e3e35...`, decision s134). **OJO**: verificar SIEMPRE el cierre cargando `index.html`, no solo `PACE.html` — el build envuelve cada modulo en un IIFE y hay fallos que solo salen ahi (el `useState` pelado de s144 estuvo DOS versiones publicado). **Desde s150 eso ya no depende de acordarse**: `npm run verify` lo caza por analisis de ambito y devuelve codigo de salida, y **desde s152 comprueba ademas catalogos, i18n, precache y glifos**. **Desde s154 hay ademas `npm run test:e2e`**, que abre un navegador de verdad sobre ese mismo `index.html` y ejecuta el checklist de cierre entero — es el **paso 4** del cierre y va DESPUES de regenerar, para probar el artefacto que se va a commitear; **s169 la deja en 95 tests**, con los 11 de la pill en movil y los 3 del backup de eventos; **s167 fijo los workers en 2 en los dos lados** tras medir que a 4 el cuello es la MEMORIA, y **s162 la habia dejado en 67** con los 2 del orden de foco y el de reduced-motion; **la prueba de Foco pasa de `runFor` a `fastForward`** porque 1500 callbacks con su re-render no caben en el plazo bajo carga — y de paso aserta que el contador es timestamp-based. **El CI repite los tres en cada push**. `PACE_standalone.html` sigue en v0.71.0 A PROPOSITO (export bajo demanda, s134).

---

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
| `app/shell/Sidebar.jsx` | Sidebar izquierdo colapsable — **solo ORQUESTADOR** desde s148 (compone secciones, no dibuja ninguna) | **v0.81.0** |
| `app/shell/Sidebar.support.jsx` | Soporte sin UI del sidebar: hoja responsive inyectada + `sidebarStyles`. **`sidebarStyles` viaja por `window`** (un `const` no cruza la IIFE del build; misma solucion que `pathStepStyles`) y se referencia PELADO. **Carga ANTES** de `.parts` y de `Sidebar.jsx` | **NUEVO s148** |
| `app/shell/Sidebar.parts.jsx` | Piezas de UI del sidebar: `SenderoDelDia` · `WeekDots` · `AchievementsPreview` · `achMini` · `StatusBar` · `ChevronLeftIcon`. Tras `.support` y tras `SupportModule` (monta `<SupportButton/>`) | **NUEVO s148** |
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

> s179 cierra el bloque que s178 dejo abierto: **el runner por debajo de 641 px
> de alto, y movil**. Una sola linea de trabajo, y casi todo lo caro fue
> descubrir que el arreglo que ya estaba escrito no arreglaba lo que decia.

- **[UN UMBRAL NO SE DECLARA, SE MIDE POR LOS DOS LADOS]** El tramo movil venia
  con `max-height: 660`, y 660 salio **del viewport que se estaba mirando**
  (360x640). Ampliado el barrido, HEAD solapaba a **375x667 — el iPhone SE/8 —
  con 7,2 px** y a **360x661 con 10,8**, los dos JUSTO POR ENCIMA del umbral y
  por tanto sin cubrir; 360x680 sobrevivia por **1,9 px**, que no es holgura
  sino suerte. **Es el mismo error de s177**, que declaro el suelo en 641 cuando
  el borde real estaba en 575.

- **[EL GUARD DE CERO PIDIO EL CONTROL POSITIVO, Y HACIA FALTA]** El banco daba
  **0 de 14** sobre el artefacto arreglado. Servido el `index.html` de **HEAD**
  en un puerto aparte —con sus `fonts/`, porque sin ellas las metricas de texto
  son otras y la comparacion no vale— la misma sonda solapaba a 1280x575 y
  360x640 con **26,3 px**, el numero exacto del diagnostico.

- **[EL BANCO DIJO «ARREGLADO» Y EL CENSO LO DESMINTIO]** El banco **mide UNA
  rutina** y lo declara en su cabecera. El censo de s177 recorre las 28: a
  360x640 quedaban **5 de 19 rutinas y 7 de 79 pasos** (de 16 y 60). El 88 % del
  defecto no es el defecto.

- **[LA COMPRESION APUNTABA A UN ELEMENTO QUE EN ESA PANTALLA NO EXISTE]** La
  causa real, y llevaba cinco sesiones invisible: la **pantalla de colocacion**
  pinta `[data-pace-v1-num]` (el numero pequenio de la puerta, s112) y **no**
  `[data-pace-v1-timer]`. Todos los tramos cortos —**los de s119 en escritorio
  tambien**— comprimen `-timer`. En la pantalla de trabajo el mismo elemento
  lleva los dos atributos, y por eso alli si funcionaba.

- **[UN NUMERO QUE NO HAY QUE INVENTAR PORQUE EL DISENIO YA LO DECLARA]** El
  nombre a 360 de ancho envolvia a **dos lineas** (87,3 px de una pieza) con
  `clamp(30px, 6.5vh, 52px)`. Fijado a **30 px** —el **suelo de su propio
  clamp**— cabe en una. No es un valor nuevo: es el minimo que el diseno ya
  admitia.

- **[UNA DECISION ESCRITA IMPIDIO ARREGLAR UN SALTO CREANDO OTRO]** A 360x560 lo
  unico que queda por encoger es el **glifo**, y por CSS funcionaba (123 -> 96,
  +8,4 px). **La fuente unica de s177 lo prohibe por escrito**: el circulo de la
  sesion dejaria de relevar al de la preparacion. Queda **declarado**.

> Diario con las cinco trampas del instrumento:
> [`docs/sessions/session-179-el-runner-en-movil-corto.md`](docs/sessions/session-179-el-runner-en-movil-corto.md).


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

## Proxima sesion -- **mas rutinas de oficina, y esta vez SIN limite de glifos**

> **Eleccion del usuario al cerrar s178**, y con una restriccion levantada: «no hay problema
> si hay que disenar mas glifos». Las tres de s178 se compusieron con arte YA existente, asi
> que se quedaron cortas a proposito. Lo siguiente ya no depende del set dibujado.

1. **Ejercicios de oficina que HOY NO EXISTEN en el catalogo.** Los huecos que se vieron al
   componer: **gemelo de pie** (no hay estiramiento de gemelo, solo `Elevacion de talones`,
   que es fuerza), **flexor de cadera contra la mesa** (el unico que hay pide arrodillarse) y
   **aductores sentado**. Cada uno nace con su dibujo.
2. **`move.chair.antidote`, pendiente de decision.** De sus SEIS pasos solo `Flexor de cadera`
   pide suelo, y por el la rutina que se llama «Antidoto silla» —con etiqueta `SIT`— queda
   FUERA del chip «Aqui mismo». Se le puso al usuario delante en s178 y no se decidio.

> **DESPUES, la cola tal como quedo:**
>
> 1. **El tercer chip «Discreta»** (14 de 20), la ultima pregunta viva de s176. Hay que
>    **pintarlo antes de preguntar**.
> 2. **FASE 4 · Stats de verdad.** s177 arreglo el ANCHO; el destino de
>    `STATS_DESTINO_PROPUESTA.md` sigue entero. El ROADMAP lo llama «el escaparate del free».
> 3. **La musica.** Los seis briefs necesitan el requisito que faltaba: **el grueso de la
>    energia entre 200 Hz y 2 kHz**. Y los **terminos de uso comercial**, sin verificar.
> 4. **El arte**: `Rana` (1 de los 3 glifos de ejercicio que faltan) y los **19** de logro.
> 5. **FASE 8 · onboarding contextual.**

> **LO QUE s178 DEJA CERRADO Y NO HAY QUE VOLVER A MIRAR:**
> - Los cuatro marcadores del ROADMAP, el indice de decisiones, `privacy.html`, la tabla de
>   deuda, el guard de `sw.js`, el borrado del vuelo y **el cruce Mueve/Estira de `CLAUDE.md`**.
> - **La biblioteca de Respira**: el usuario eligio **C**, y C es **lo ya publicado desde
>   s176**. Verificado en la app (3 columnas, tarjeta 283 px, rail 262, cero aside) contra la
>   maqueta (288). **No hay nada que implementar ahi.** La variante F (rail + aside) se pinto
>   y se descarto viendola.
> - **Cifras vivas medidas**: Estira **17** rutinas, **8** sin suelo · Mueve 14, 12 sin suelo ·
>   77 de 96 logros con arte (19 sin dibujo) · 59 de 62 identidades de ejercicio (3 pendientes).

> **LO QUE SIGUE ABIERTO, dicho y no escondido:**
> - **D-1, D-2 y D-3** siguen vivas (decision del usuario: no urgentes).
> - El **CHANGELOG** conserva sus bloques de detalle donde la convencion son dos (decision del
>   usuario en s178: no se descarta texto).
> - ~~Por debajo de **641 px de alto** el runner no esta congelado, y movil tampoco~~ **CERRADO
>   en s179 (v0.110.0)**, con un tramo declarado: por debajo de **~575 px de alto en movil**
>   SIGUE SOLAPANDO. No es un olvido — lo unico que queda por encoger ahi es el **glifo** (123
>   px a esa altura) y **la fuente unica de s177 prohibe encogerlo por CSS solo en el runner**,
>   porque el circulo de la sesion dejaria de relevar al de la preparacion. La unica salida
>   seria bajar el coeficiente en `v1GlyphSize`, que **afecta a todos los viewports** y
>   contradice la queja del usuario de s174 («el circulo es muy pequenio»). **Es decision suya.**
> - En las pantallas de **cambio de lado** la linea «El lado siguiente empieza solo» todavia se
>   mueve **99,7 px** entre pasos.
> - El **lote de musica sin decidir**: cinco de las seis piezas sin usar.

> **TRAMPAS VIGENTES:**
> - **LA SEMILLA ES `firstSeen`, NO `onboarded`** (`tests/helpers.js` lo avisa).
> - **`getBoundingClientRect()` devuelve la caja YA TRANSFORMADA.** Congelar antes de medir.
> - **Al medir la biblioteca, EXCLUIR lo que vive dentro del rail**: la tarjeta de «Para ahora»
>   se cuela y da «1 columna» donde hay 3 (s178).
> - **Backticks y backslashes en el shell**: el heredoc **se come los backslashes** y las
>   comillas dobles **ejecutan los backticks**. Escribir con la herramienta de escritura o por
>   stdin de node.
> - **`node build-standalone.js` a mano reescribe el standalone** congelado (s134).
> - **`git checkout` restaura al ULTIMO COMMIT.** Copia antes de mutar.

> Orden vigente: «Camino a v1.0» de [`ROADMAP.md`](./ROADMAP.md) (15 fases).
---

## Decisiones activas -- indice

> El TEXTO COMPLETO de cada decision vive en
> [`docs/product/DECISIONES_TECNICAS_VIGENTES.md`](docs/product/DECISIONES_TECNICAS_VIGENTES.md) (GOBIERNA).
> Aqui solo el indice, para que este archivo siga siendo ligero en cada arranque.
> **Antes de tocar un subsistema, leer su fila alli.**

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
