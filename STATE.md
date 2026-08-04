# PACE · Estado del proyecto

> **Presente + proximo.** Para el historial, ver
> [`CHANGELOG.md`](./CHANGELOG.md) (versiones) y
> [`docs/sessions/`](./docs/sessions/) (diario de trabajo).
>
> **Al cerrar sesion:** escribir el detalle en `docs/sessions/session-NN-xxx.md`,
> destilar una entrada en `CHANGELOG.md`, y **sustituir** (no anadir) la
> seccion "Ultima sesion" de este archivo. Este archivo no debe crecer.

---

**Version actual:** v0.88.1 (s155 — **LA MEMORIA ES DEL USUARIO, NO NUESTRA**. **FASE 3** del plan operativo: nace **`pace.events.v1`**, el registro **LOCAL** de uso, en su **Fase 1** (modelo canonico + adaptador web + Web Locks + baseline + export/import/reset + recuperacion + pruebas multi-pestana) y **SIN UN SOLO EMISOR** — §25 prohibe emitir antes de estar en `READ_WRITE`, asi que **no hay ni un cambio visible en la UI**. Lo caro no fue el contrato: fueron **dos contradicciones con una pagina PUBLICA** que crea el mero hecho de existir una segunda clave de almacenamiento. `privacy.html` promete que desde Ajustes «puedes borrarlo todo» y el reset solo quitaba `pace.state.v2` ⇒ **arreglado**, pasa por la barrera. Y promete exportar «**TODO** tu estado» cuando el backup no llevara eventos ⇒ **no se arregla hoy, se le pone un GATE**: si aparece un emisor fuera de `app/events/` y el export no lleva la seccion, el `verify` se pone **rojo**. **17 rojos y los 17 mordieron a la primera** —frente a los cuatro que fallaron en s154— porque el banco ahora **exige que la cadena aparezca EXACTAMENTE una vez**. Detalle abajo.)
**Version anterior:** v0.87.0 (s154 — **UN TEST QUE NO HAS VISTO FALLAR NO PRUEBA NADA**. Segunda pieza del frente **CI**: **Playwright**, que cubre exactamente el **primer hueco que el `verify` declara e imprime en cada pasada** («comportamiento: no abre navegador, no monta la app, no pulsa nada»). Entra **el checklist de cierre de `CLAUDE.md` ENTERO**, ejecutado sobre `index.html` en un navegador real: **13 tests, ~25 s**. El Pomodoro llega hasta el BreakMenu con el **reloj virtual** de Playwright —viable porque `useCountdown` es *timestamp-based*—, y con él Respira y su **modal de seguridad de apnea**, Mueve con Preview §18.3 y pasos, Hidratate, Logros con **toast**, Tweaks y persistencia. **No se invento ni un selector**: once bancos de reconocimiento condujeron el artefacto ANTES de escribir un aserto. **21 rojos verificados**, los 21 restaurados **byte a byte con hash comprobado**, y **cuatro no mordieron a la primera** — tres eran **debilidad real de mis asertos** (`getByRole({name})` casa por **SUBCADENA**) y el cuarto rompia **la linea equivocada**. Casi ningun aserto lleva numero: RELACIONAL sobre CENSO, como fijo s152. **Job `e2e` aparte** con `needs: verify`. Detalle abajo.)
**Version anterior:** v0.86.0 (s153 — **EL CI NO COMPRUEBA NADA QUE NO CORRA EN LOCAL**. Primera pieza del frente **CI**, lo unico que quedaba detras de la red de seguridad; la razon de aparcarlo —«el YAML tiene que invocar algo que ya funcione en local»— dejo de aplicar en s152. Nace **`.github/`**, que no existia: un job en `ubuntu-latest` con Node 24 que hace `npm ci` e **invoca `npm run verify` tal cual**. Lo **unico** que el workflow anade por su cuenta es que **`index.html` sea el build de las fuentes**, porque el `verify` no puede: corre justo ANTES de regenerarlo, asi que su aviso de deriva es `[INFO]` a proposito. El diff va **acotado a `index.html`** —si no, seria rojo permanente por el standalone congelado (s134)— y se compara con **`git diff`, nunca con un hash**: el worktree de Windows deja **500 bytes CR** dentro del artefacto. **Cinco riesgos medidos antes de escribir una linea** porque el runner es Linux: determinismo, orden de directorio, finales de linea, **190 rutas con capitalizacion exacta** y el lock. Probado en **verde y en rojo** con el escenario real. Detalle abajo.)
**Ultima sesion:** #155 -- 2026-08-04 - **LA MEMORIA ES DEL USUARIO, NO NUESTRA**. Bump **v0.87.0 -> v0.88.0**. **(1) FRENTE ELEGIDO CON EL USUARIO ANTES DE TOCAR NADA**: producto, no Wrangler — Wrangler queda **INERTE** hasta que existan los secretos de la cuenta, y cerrar con YAML que nadie ha visto correr contradice a s153 («simular no es ejecutar»); la Fase 2 (ola B) y la 2.5 siguen esperando arte, asi que eventos era **lo siguiente real**, y es lo unico cuyo valor **CADUCA**: el historico que no se emite no se reconstruye. **(2) ALCANCE = FASE 1 DEL ESQUEMA, TAL COMO LA FIJA §25.** No se rediseña nada: el documento esta cerrado y APTO desde s117. Entra el contrato entero (`exportSnapshot` · `validateImport` · `replaceFromImport` · `reset`), **no** la seccion de eventos en el backup publico —hoy el contenedor esta vacio y seria superficie sin dato— y **si** lo imprescindible del import: reiniciar el contenedor, porque sin eso un backup importado convive con un baseline capturado del estado **anterior**. **(3) DOS CONTRADICCIONES CON UNA PAGINA PUBLICA, Y NO LAS TRAJO EL CODIGO NUEVO.** Las crea que exista una **segunda clave**. `privacy.html` ↔ `TweaksPanel.jsx`: «puedes borrarlo todo desde Ajustes… el borrado es **definitivo**», y el reset hacia `removeItem('pace.state.v2')` **y nada mas** ⇒ el contenedor **sobrevivia**. **Arreglado hoy**: pasa por la barrera y borra los dos, bajo la **misma exclusion** que el resto de mutaciones. `privacy.html` ↔ `TweaksData.jsx`: «puedes exportar **TODO** tu estado», falso **en cuanto haya emisores**. Eso **no tiene arreglo inmediato** —el usuario decidio no meter eventos en el backup mientras este vacio— y una nota en el backlog es **justo el mecanismo que ya fallo en s149 y s151**, asi que se instalo un **GATE MECANICO en el `verify`**: emisor fuera de `app/events/` + export sin seccion de eventos = **ROJO**. Es RELACIONAL: no dice cuantos emisores hay ni cuando llegan, solo que **los dos lados van juntos**. **(4) LO QUE GUARDA Y LO QUE NO.** `localStorage`, clave `pace.events.v1`, **FUERA** de `pace.state.v2`: `{schemaVersion, activatedAt, events[], baseline{capturedAt,feedback,totalsByType}, pruneCursor, marker}`. Guarda el instante de activacion, hechos con esquema **CERRADO** y **lista permitida** de campos, totales consolidados y la mecanica de poda y recuperacion. **NO guarda** texto libre, datos medicos, nombres de archivo, IP, ubicacion, contactos, credenciales, portapapeles ni identificador alguno de usuario, dispositivo, publicidad o fingerprint. **Y en Fase 1 no guarda ninguna categoria NUEVA de informacion**: `activatedAt`, un array **vacio** y una **copia** de tallies que ya viven en `routineFeedback` — por eso `privacy.html` no se toca todavia. **Verificado en vez de supuesto**: el `routineId` de una rutina personalizada es `custom.<Date.now()>`, o sea **el nombre que escribe el usuario NO entra en el id**. **(5) CERO ENVIO REMOTO**, asertado y medido: no hay `fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`, `EventSource` ni una sola URL en los cuatro archivos, y la suite lo comprueba **en el cable** (ninguna peticion fuera del origen mientras opera el contenedor). **(6) CAPA A Y CAPA B, SEPARADAS DE VERDAD** (§5): `events-model.js` **no nombra** `localStorage` ni `navigator.locks`; el adaptador web si, porque son detalles de ESE backend. El **adaptador INERTE no es relleno**: §20 prohibe que Capacitor caiga al web por parecer `https://localhost` y §19.2 que `file://` emita aunque haya Web Locks. **(7) EL BUILD SOLO RE-EXPONE `function` Y `var`** — leido antes de escribir una linea (`build-standalone.js:365-377`), porque un `const` **no cruza la IIFE** y eso es el crash de s144, que estuvo dos versiones publicado. Aun asi **el `verify` mordio dos veces en la primera pasada**: **`Uint8Array`** faltaba en su lista de plataforma (entra, con toda la familia de arrays tipados) y **`chrome` estaba MAL en mi codigo** —solo existe en Chromium, la referencia pelada es incorrecta de por si— y pasa a `window.chrome`. La distincion importa: meter un nombre de la app en `PLATAFORMA` lo dejaria **sin vigilar para siempre**. **(8) CINCO COMPROBACIONES NUEVAS EN EL `verify`, TODAS RELACIONALES** (cero red · una fuente de verdad por dominio · reset por la barrera · import por la barrera · el gate del punto 3) mas el **guard de cero**. **La de «cero red» casi se autoinculpa**: las cabeceras de `app/events/*` **NOMBRAN** `fetch` y `WebSocket` para prohibirlos, asi que un `grep` a secas habria dado rojo sobre su propia documentacion — la trampa de s146 por otra puerta. Se mira el **CODIGO SIN COMENTARIOS** (Babel con `comments:false`). **(9) DIEZ PRUEBAS E2E, Y EL P0 EXIGIA DOS PESTANAS DE VERDAD.** Dos read-modify-write concurrentes **pierden eventos**, y eso motivo la arquitectura entera: se abren dos paginas reales, emiten 10 cada una y quedan **20 con id unico y en orden canonico** (de paso queda asertado que la segunda **no recaptura** el baseline). Ademas: activacion **idempotente** —si `activatedAt` se moviera, cada arranque recapturaria el baseline y **contaria de mas**—, la **lista permitida** descartando `notaLibre`/`ip`/ruta de archivo, `replaceFromImport` dejando **1 y no 7**, seis snapshots invalidos rechazados con su razon concreta y el contenedor **byte a byte** igual, el reset y el import por la **UI real**, y marcador + **recuperacion idempotente**. **(10) 16 ROJOS Y LOS 16 MORDIERON A LA PRIMERA.** Dos endurecimientos sobre el banco de s154: se **exige que la cadena a sustituir aparezca EXACTAMENTE una vez** (en s154 se rompio **la linea equivocada**) y se invoca el CLI **sin `shell:true`**. El **guard de cero** necesito banco propio y ahi **el exit code no basta**: su escenario real no es «alguien borra los archivos» —eso lo caza la biyeccion— sino un **refactor legitimo** que mueve el subsistema y actualiza `PACE.html`, dejando las cinco comprobaciones mirando al vacio; se reprodujo **moviendo la carpeta** y se exigio **el MENSAJE del guard**. **(11) RETENCION: IMPLEMENTADA, NO PROGRAMADA.** Los 120 dias de §12 estan cerrados desde s117 y **destilan antes de podar** (el lote se funde en `baseline`: se pierde el detalle, nunca el total). La poda por **calendario NO se programa** —sin emisores no hay nada que barrer y §25 la situa en la Fase 3—, con el punto de extension **declarado en el codigo**; la poda por **presion de presupuesto SI** (~500 KB logicos con `TextEncoder`, reintento unico, se conserva el ultimo contenedor valido, nunca el `catch(e){}` mudo de `persistState()`). Declarado en `NO_CUBRE`. **(12) VERIFICACION**: `npm run verify` **PASA en 7,4 s** con v0.88.0 coherente en los 3 sitios y **101 archivos de `app/`** sin huerfanos · **`npm run test:e2e` PASA 23/23 en 29,2 s** contra el artefacto **recien regenerado**, con las **13 de s154 sin una regresion** · **17/17 rojos** restaurados byte a byte con hash comprobado · `index.html` **`54A04ABAFEE0E61C`**, **0 bytes CR** de 1 353 478 · `PACE_standalone.html` restaurado **`998E3E358D689036`** · en el navegador con SW y caches purgados: contenedor `READ_WRITE`, **20 emisiones concurrentes sin perder una**, snapshot de 1,65 MB rechazado por presupuesto, **ingles sin regresion** y **consola sin errores**. **(13) ADDENDUM v0.88.1 — TRES DEFECTOS QUE ENCONTRO EL USUARIO REVISANDO, los tres confirmados contra el codigo.** **(a) P0**: el import lanzaba la barrera **SIN ESPERARLA**, y dentro de ella el `true/false` de la escritura legacy **solo se usaba en la rama `!canWrite`** ⇒ con `setItem` fallando por cuota, **cuatro mentiras seguidas**: el estado no se guardaba, el contenedor de eventos se reiniciaba igual, la UI decia «Importado» y la pagina recargaba. Contradecia de frente lo que esta misma sesion habia escrito. **Y el arreglo no era un `if`**: al abortar, **el marcador ya esta escrito**, y como el arranque reinicia el contenedor en cuanto ve uno vivo, abortar sin mas habria dejado que el siguiente arranque hiciera **justo lo que se evitaba** ⇒ hizo falta `eventsWebClearMarker` (volver a un estado conocido). Ahora se espera, se aborta limpiando, el resultado lleva `legacyWritten` y la UI solo canta victoria con eso en `true`; copy nuevo ES+EN («No se pudo guardar. Tus datos siguen intactos.») y **CENSO de i18n a 510**, el acto deliberado que su propio mensaje pide. Mismo trato en el reset: `wipeLocalState()` devuelve si pudo. **(b)** Un contenedor de **version FUTURA** se reescribia: el gate vivia solo en la ruta de import, asi que la lectura normal lo normalizaba y le tiraba en silencio los campos que esta version no conoce ⇒ ahora `schemaVersion` mayor = **READ_ONLY**, con la comprobacion **dos veces** (en la capacidad, para que `canWrite()` no mienta, y **dentro del lock**, que es el autoritativo). **(c)** Las filas de `PACE.html` e `index.html` de la tabla seguian en v0.87.0. **Y UN QUINTO ASERTO QUE NO MORDIO**: de los cuatro rojos nuevos, el del contenedor futuro **siguio verde con el guard roto**, porque el aserto pasaba por la fachada —que corta antes en `canWrite()`— y **el guard de dentro del lock no llegaba a ejecutarse**: probaba dos veces la barrera exterior. Se arreglo llamando al **adaptador a pelo**. Mas una trampa de instrumento: la prueba del fallo forzado fallo primero por **falta de `page.on('dialog')`** —Playwright descarta los dialogos por defecto, asi que el `confirm()` del import devolvia false y la importacion **ni empezaba**—. **Verificacion v0.88.1**: verify PASA con i18n **510 = 510** · **test:e2e 25/25** · **4/4 rojos**. Diario: [session-155](./docs/sessions/session-155-eventos-fase-1.md).

**Sesion anterior:** #154 -- 2026-08-04 - **UN TEST QUE NO HAS VISTO FALLAR NO PRUEBA NADA**. Bump **v0.86.0 -> v0.87.0**. Segunda pieza del frente **CI**. **(1) ALCANCE CERRADO CON EL USUARIO ANTES DE TOCAR NADA**, en tres decisiones: job **`e2e` APARTE** con `needs: verify` · **el checklist de cierre de `CLAUDE.md` ENTERO**, con `page.clock` para el Pomodoro · servido por **`.claude/static-server.js`**, que ya existia y esta committeado. **(2) QUE CUBRE.** Los siete items del checklist mas el arranque del artefacto, sobre `index.html` y en un navegador de verdad: Pomodoro que cuenta **25:00 -> 24:58**, se pausa —y el numero **NO se mueve** mientras el reloj corre, que es lo que prueba que la pausa es real y no un cambio de etiqueta—, se reanuda y **abre el BreakMenu** con sus cuatro salidas · Respira con su **modal de seguridad de apnea**, que es obligacion de producto: el aserto exige el aviso, el consentimiento y que **Cancelar no arranque nada** · Mueve con Preview §18.3, cuenta atras que **baja de verdad** (se mide dos veces) y pasos del runner v1 · Hidratate `+`/`-` y persistencia · el primer sello, su **toast** y su supervivencia a la recarga · Tweaks cambiando el color **COMPUTADO** · y que `index.html` sea el **compilado** (Babel ausente, cero scripts `text/babel`, manifest, consola limpia). **13 tests en ~25 s.** **(3) NO SE INVENTO NI UN SELECTOR.** Once bancos de reconocimiento condujeron el artefacto antes de escribir un aserto, y de ahi salio lo que ninguna lectura del codigo habria dado: las filas de rutina **no son `<button>`** (son `div` con `cursor:pointer` y un `h4` dentro), la biblioteca de Mueve **no abre la sesion** sino el **Preview de §18.3** (s144), y el toast **no sale al desbloquear** — desde s145 `unlockAchievement` **ENCOLA** y el aviso lo drena un cierre de sesion; el vaso de agua es la unica accion que acredita sin pasar por uno (`state-hydrate.jsx:70`), dice **«Nuevo sello · Primer sorbo»** y vive 3 s. **(4) 21 ROJOS, Y LOS CUATRO QUE NO MORDIERON SON EL HALLAZGO.** Mismo liston que s150 y s152: romper algo REAL, exigir salida != 0, restaurar en un `finally` **comprobando el hash**. Se parchea `index.html` y `sw.js` directamente en vez de tocar `app/` y rebuildear: es lo que los tests cargan, evita 21 builds y **no reescribe `PACE_standalone.html`**, congelado desde s134. Antes de romper nada, **calibracion**: cada `-g` tiene que apuntar a **UN solo test** —la primera version del banco dio cuatro «rojos» que eran `No tests found`, porque con `shell:true` los argumentos se concatenan **sin comillas** y un grep con espacios llegaba partido—. De los 21, **cuatro siguieron VERDES con la app rota**: tres por **debilidad real de mis asertos** (`getByRole({name})` y `getByText` casan por **SUBCADENA**, asi que «PausarX» contiene «Pausar»; se arreglaron con `exact: true`, y el del toast cambiando la rotura por la regresion de verdad —que la cola no se drene—, porque `toContainText` es subcadena por definicion), y el cuarto porque **rompi la linea equivocada**: el artefacto tiene **varias** llamadas a `renderGlyph` y la miniatura del sidebar resuelve por `achMini`. Lo dijo la **cadena de ancestros** de la mascara sobrante, no una deduccion — s147 unifico el render en una funcion, pero **los puntos de llamada siguen siendo cuatro**. **21 de 21 en rojo.** **(5) CASI NADA LLEVA NUMERO**, aplicando la decision RELACIONAL vs CENSO de s152: el precache se aserta comparando las rutas **declaradas en `sw.js`** con las que el navegador tiene **de verdad** en su cache (`addAll` es atomico ⇒ mismo conjunto, y crecer el precache a proposito **no** lo pone rojo), el nombre de la cache se **deriva** de `PACE_VERSION` —lo que el bump a v0.87.0 acaba de validar solo—, y los sellos se **derivan del catalogo vivo** con la regla de s152 («58 mascaras menos los secretos con mascara aun bloqueados») en vez de escribir 53, con **guard de cero**: si no hay ni una mascara es **FALLO explicito**, y ese guard es justo el que cazo la rotura de `achievementMaskUrl`. Y la trampa de s152 se **ASERTA en vez de sortearse**: contar sobre la pagina tiene que dar **mas** que dentro de `[data-pace-modal-backdrop]`. **(6) EL JOB VA APARTE, Y LA TESIS DE s153 NO SE TOCA.** El YAML sigue **INVOCANDO** un comando que corre igual en local. Aparte porque las dos redes tienen coste distinto: el `verify` son ~5 s sin dependencias y es el paso 2 del cierre del que depende «si falla, no se sigue», mientras que esto descarga un Chromium de ~115 MB. **`needs: verify` no es orden estetico**: la suite carga el `index.html` **COMMITTEADO**, y es el job de arriba el que acaba de probar que ese artefacto es el build de las fuentes — sin eso, un rojo aqui querria decir «cambio el comportamiento» **o** «el artefacto esta viejo». YAML validado **parseandolo**: 2 jobs, `e2e` con `needs: verify`, 6 pasos. **(7) EL VERIFY DECLARA MENOS HUECOS, SIN MENTIR.** Dos de sus lineas de `NO_CUBRE` pasan a decir **donde se cubren** en vez de quedarse en la queja (comportamiento, y el contraste del precache con la cache real). Siguen siendo huecos **del verify**; ya no lo son del proyecto. **(8) EL INSTRUMENTO MINTIO CUATRO VECES, NINGUNA ERA EL CODIGO.** `innerText` devuelve el texto con el `text-transform` de CSS **ya aplicado** y los matchers comparan **`textContent`** (`Foco manual`, no `FOCO MANUAL`) ⇒ **3 rojos** en la primera pasada. **`addInitScript` corre en CADA navegacion**, tambien en los `reload()`, asi que mi semilla machacaba el estado y **la persistencia parecia rota con la app intacta** — de haberlo reportado habria sido un bug inexistente, como el de s151. Un **`grep -c $'\r'` conto TODAS las lineas** y estuve a punto de reportar **22 589 CR** en un artefacto que **no tiene ninguno** (medido byte a byte: 0). Y **un banco en segundo plano parcheaba `index.html` mientras yo corria el `verify`**, que aviso de una deriva que no existia: dos procesos mios escribiendo el mismo archivo. **(9) VERIFICACION**: `npm run verify` **PASA en 6,3 s** con version v0.87.0 coherente en los tres sitios · **`npm run test:e2e` PASA: 13/13 en 24,1 s** contra el artefacto v0.87.0 recien regenerado · **21/21 rojos** con los 21 archivos restaurados byte a byte · `index.html` regenerado difiere de HEAD en **exactamente 2 lineas** (`<title>` y `PACE_VERSION`) y no contiene **ni un byte CR** (0 de 1 290 777) · `PACE_standalone.html` restaurado a **`998E3E358D689036`** · `npm ci` **sincronizado**. **(10) LO QUE LA SUITE NO CUBRE, DECLARADO**: un solo navegador (Chromium), un solo idioma (ES), un solo viewport (1280x720), cero movil, cero Caminos, cero premium y **ni un pixel comparado**. Diario: [session-154](./docs/sessions/session-154-playwright.md).

**Sesion anterior:** #153 -- 2026-08-04 - **EL CI NO COMPRUEBA NADA QUE NO CORRA EN LOCAL**. Bump **v0.85.0 -> v0.86.0**. Primera pieza del frente **CI**, que era lo unico que quedaba detras de la red de seguridad. **(1) ALCANCE CERRADO CON EL USUARIO ANTES DE TOCAR NADA**, porque las cuatro piezas son de tamanos muy distintos: entran el workflow y la frescura del artefacto; **Playwright y Wrangler quedan FUERA**, anotados como siguiente paso; proteger `main` entra **solo como instrucciones**. **(2) LA TESIS: EL CI INVOCA, NO REINTERPRETA.** `.github/workflows/ci.yml` es **un** job, `verify`, en `ubuntu-latest` con Node 24 (el del desarrollo local): `npm ci` -> `npm run verify` -> frescura. **No comprueba nada que no corra en local**, asi que lo que sale rojo en GitHub se reproduce con un solo comando; vigilancia nueva se anade al `verify`, **no al YAML**, o el CI se vuelve un oraculo que nadie sabe interrogar. **(3) LO UNICO QUE ANADE POR SU CUENTA, Y POR QUE VA APARTE.** El `verify` avisa de que `index.html` difiere de las fuentes, pero como **`[INFO]` a proposito**: corre justo ANTES de regenerarlo en el cierre, o sea en el unico momento en que el artefacto TIENE que estar desactualizado. Esperar que se ponga rojo **no funciona**. **Dos cosas que no se pueden simplificar ahi**: el diff va **ACOTADO a `index.html`** —a secas seria rojo SIEMPRE por `PACE_standalone.html`, congelado en v0.71.0 (s134) y que el build acaba de reescribir (medido: `998E3E35...` -> `5C310793...`)—, y se compara con **`git diff`, NUNCA con un hash SHA-256**: `.gitattributes` normaliza a LF *en el repo*, pero en el worktree de Windows hay **5 fuentes en CRLF** que el build inlinea tal cual (`readFileClean` quita el BOM, no normaliza saltos) => el artefacto sale con finales mixtos y su hash de Windows **no puede** igualar al de Linux. El propio git lo avisa durante la prueba. **(4) CINCO RIESGOS MEDIDOS ANTES DE ESCRIBIR UNA LINEA**, porque el runner es Linux y el desarrollo Windows, y cualquiera lo habria dejado rojo desde el primer run: el build **es determinista** (dos pasadas repiten el hash de HEAD) · su unico recorrido de directorio (`validateAppFiles`) va con **`.sort()`** y ademas **no emite nada al artefacto** · **ningun archivo del repo se desvia de LF** y `.gitattributes` ya cubre `*.yml` · las **190** rutas declaradas en `PACE.html` (104) y en el `PRECACHE` (86) coinciden **exactas** con `git ls-files` —Linux distingue mayusculas y Windows no— · y el lock v3 esta **sincronizado** y trae `sharp-linux-x64` (`sharp` no la usan ni el build ni el verify). **(5) PROBADO EN VERDE Y EN ROJO, CON EL ESCENARIO REAL.** El script probado **se extrajo del YAML parseado**, no se reescribio a mano. El rojo se provoco con el descuido que esto caza —**una fuente cambia y nadie regenera el artefacto**—, no con uno comodo: tocar `index.html` directamente **no sirve**, porque el paso **regenera antes de comparar**. `::error` + `index.html | 1 +` + **EXIT=1**, y restaurado byte a byte con los **tres hashes comprobados**. El YAML se valido **parseandolo** con `js-yaml`, no a ojo. **(6) PROTEGER `main` NO SE PUEDE DESDE AQUI, Y LA OPCION ELEGIDA ESTABA MAL PLANTEADA.** **`gh` NO esta instalado** (comprobado en Bash y PowerShell) => la afirmacion de la auditoria integral **sigue SIN VERIFICAR**. Y al redactar las instrucciones aparecio que **«exigir que el check pase sin requerir PR» es contradictorio**: un check solo puede pasar DESPUES de que el commit exista, asi que requerirlo **bloquea el push directo**. `WORKFLOW.md` §8 entrega el ruleset que **si** preserva el flujo (**Restrict deletions** + **Block force pushes**) y documenta la alternativa, que no es una casilla sino cambiar el cierre entero a rama -> PR -> merge. **(7) UN TERCER SITIO QUE DECIA LO CONTRARIO.** `docs/WORKFLOW.md` seguia exigiendo regenerar `PACE_standalone.html` en cada cierre y tratando su fecha antigua como senal de alarma: **falso desde s134**, y mas caro aqui porque contradecia al YAML que se estaba escribiendo. Es el defecto de s151 repetido. **(8) EL INSTRUMENTO MINTIO TRES VECES, NINGUNA ERA EL CODIGO.** Reporte que **el onboarding no aparecia** con estado limpio —lo que habria contradicho a s152— y era falso: lei `innerText` **recortado a 120 caracteres** y el onboarding se monta **al final del DOM**, detras de la home (`main.jsx:318`); lo zanjo buscar la placa de valores de s151 en el HTML. Ademas el **`grep` mostro `//` como `\`** en `main.jsx:89`, o sea un archivo imposible que el `verify` acababa de aprobar —leido directo, intacto—. Y `performance.now()` no basta para saber que un documento es nuevo. **Cuando dos instrumentos se contradicen, el que miente no es el que tiene asertos.** **(9) VERIFICACION**: `npm run verify` **PASA en 4,7 s** con version v0.86.0 coherente en los tres sitios · **secuencia completa del CI ejecutada en local en el orden del workflow** (verify EXIT=0 -> frescura EXIT=0) · `index.html` regenerado difiere de HEAD en **exactamente 2 lineas** (`<title>` y `PACE_VERSION`) · `PACE_standalone.html` restaurado a **`998E3E358D689036`** · sobre `index.html` con SW y caches purgados y estado limpiado desde la pagina viva: `typeof Babel === 'undefined'`, **0** scripts `text/babel`, manifest presente, la home monta, **onboarding de primera vez presente** con `firstSeen: null`, **consola sin errores**. **(10) EL PRIMER RUN SE PUSO ROJO, Y LA CAUSA NO ERA EL YAML — ni se dio por bueno sin mirarlo.** Tras el push se comprobo el run (via **API publica**, porque `gh` no esta instalado): **FALLO**. `npm run verify` **paso en Linux** —la red de seguridad es portable, que era la duda razonable— y rompio **mi** paso de frescura, pese a que la secuencia completa se habia simulado en local **en verde**. **Reproducido, no deducido**: convertidos a LF los 5 fuentes que aqui estan en CRLF —lo que ve un checkout de Linux— y rebuildeado, el diff contra el artefacto committeado es **UNA linea**, y la diferencia es **UN espacio**: **con CRLF, Babel emite otra indentacion en los comentarios que conserva**. O sea que el build **no producia el mismo artefacto desde fuentes CRLF que desde LF**, y el `index.html` committeado **dependia del worktree de quien lo genero** — la afirmacion del punto (4) era cierta *dada la misma entrada*, y la entrada NO es la misma entre Windows y Linux. **Arreglado en el BUILD, no en el YAML**: `readFileClean` normaliza a LF al leer. Normalizar los 5 archivos a mano era un parche —**`git checkout` NO los devuelve a LF**, comprobado— y la siguiente edicion con una herramienta CRLF volveria a romperlo con un diff de un espacio. **Prueba de aceptacion**: las mismas fuentes en CRLF y en LF producen ahora el **MISMO `index.html` byte a byte** (`8F65BD6C57592B00`), sin **ni un CR**. **El CI sirvio para lo que se puso**: cazo un defecto real de reproducibilidad que llevaba tiempo en el repo y que **ninguna red local podia ver**, porque en local las dos mitades del descuadre se cancelan. Y la leccion de metodo: **simular no es ejecutar**. Diario: [session-153](./docs/sessions/session-153-ci-github-actions.md).


**Ultima actualizacion de este archivo:** 2026-08-04 - sesion 155 (v0.88.0; se retiraron del encabezado la version v0.85.0 y el resumen de la sesion #152, que siguen en `CHANGELOG.md` y en su diario — este archivo no debe crecer)
**Build entregado:** `index.html` **v0.88.0** (hash `54A04ABAFEE0E61C`; **no contiene ni un byte CR** (0 de 1 353 478): desde s153 el build normaliza los finales de linea al leer, asi que el artefacto **ya no depende del worktree de quien lo genera**. `PACE_standalone.html` restaurado **byte-identico** — hash `998e3e35...`, decision s134). **OJO**: verificar SIEMPRE el cierre cargando `index.html`, no solo `PACE.html` — el build envuelve cada modulo en un IIFE y hay fallos que solo salen ahi (el `useState` pelado de s144 estuvo DOS versiones publicado). **Desde s150 eso ya no depende de acordarse**: `npm run verify` lo caza por analisis de ambito y devuelve codigo de salida, y **desde s152 comprueba ademas catalogos, i18n, precache y glifos**. **Desde s154 hay ademas `npm run test:e2e`**, que abre un navegador de verdad sobre ese mismo `index.html` y ejecuta el checklist de cierre entero — es el **paso 4** del cierre y va DESPUES de regenerar, para probar el artefacto que se va a commitear; **s155 la sube a 23 tests (~29 s)** con las diez de `pace.events.v1`, dos de ellas conduciendo **dos pestanas de verdad**. **El CI repite los tres en cada push** (`verify` + frescura + `e2e`), e incluye lo unico que el `verify` NO puede comprobar: que el `index.html` **committeado** sea el build de las fuentes (su aviso de deriva es `[INFO]` a proposito, porque corre justo ANTES de regenerar). `PACE_standalone.html` sigue en v0.71.0 A PROPOSITO (export bajo demanda, s134).

---

## Red de seguridad -- archivos vivos

> Mapa de archivos y **version actual**. El HISTORIAL por archivo (que sesion cambio que) se
> archivo en [`docs/archive/RED_DE_SEGURIDAD_HISTORICO.md`](docs/archive/RED_DE_SEGURIDAD_HISTORICO.md);
> para el detalle de un cambio concreto, `CHANGELOG.md` y `docs/sessions/`.

| Archivo | Rol | Version |
|---|---|---|
| `PACE.html` | Entry point de desarrollo modular | **v0.88.1** |
| `PACE_standalone.html` | Bundle offline autocontenido — export BAJO DEMANDA (s134), NO se regenera al cerrar | **v0.71.0** |
| `index.html` | Artefacto WEB/PWA canonico (mismo compilado + `<link rel="manifest">`). **Es lo que conduce la suite E2E de s154**, nunca `PACE.html` | **v0.88.1** |
| `scripts/verify.js` | **Red de seguridad LOCAL** (`npm run verify`, s150): `node --check` de todos los `.js` + build con salida 0 + **analisis de AMBITO del artefacto** (el crash de s144) + biyeccion `app/` ↔ `PACE.html` + coherencia de version. **Restaura los dos artefactos byte a byte**; imprime sus propios huecos en cada pasada. **s152: orquesta ademas la tanda [4/4]** y lee `PACE.html` UNA vez para las dos que la necesitan | **415 ln · s152** |
| `scripts/verify.integridad.js` | **Segunda tanda del verify (s152)**: integridad de **i18n · precache · glifos · catalogos**. **NO es un script suelto** — lo invoca `verify.js` como su tanda `[4/4]` en cada `npm run verify`; vive aparte solo por el limite de 500 ln. Dos clases de comprobacion que **no se mezclan**: RELACIONAL (sin numero, no caduca) y **CENSO** (los numeros esperados, TODOS en la constante `CENSO`, que se sube a mano cuando el contenido crece a proposito). Carga cada archivo **en su propia IIFE** —`GLYPH_SVG` es `const` en dos archivos— y declara sus propios huecos. **s155: suma la tanda de `pace.events.v1`**, cinco comprobaciones RELACIONALES (cero red en `app/events/` · una fuente de verdad por dominio · reset por la barrera · import por la barrera · **el gate export ↔ emisor**) mas su **guard de cero**. La de «cero red» **mira el CODIGO SIN COMENTARIOS** (Babel con `comments:false`): las cabeceras de `app/events/*` NOMBRAN `fetch` y `WebSocket` para prohibirlos, asi que un grep a secas **se autoinculpa** — la trampa de s146 por otra puerta | **s155 · 455 ln** |
| `.github/workflows/ci.yml` | **Red de seguridad REMOTA (s153)** — un job, `verify`, en `ubuntu-latest` con Node 24: `npm ci` -> **`npm run verify` invocado tal cual** -> frescura del artefacto. **No comprueba nada que no corra en local**: vigilancia nueva se anade al `verify`, NO aqui, o el CI se vuelve un oraculo que nadie sabe interrogar. **Lo unico propio** es que el `index.html` **committeado** sea el build de las fuentes — el `verify` no puede, su aviso de deriva es `[INFO]` a proposito. **Dos cosas que no se pueden simplificar**: el diff va **ACOTADO a `index.html`** (a secas seria rojo SIEMPRE por el standalone congelado de s134) y se compara con **`git diff`, nunca con un hash** (el worktree de Windows deja 500 bytes CR dentro del artefacto). Proteger `main`: instrucciones en `docs/WORKFLOW.md` §8, **accion del usuario**. **s154: pasa a DOS jobs** — se suma `e2e`, que invoca `npm run test:e2e` con **`needs: verify`** (la suite carga el `index.html` COMMITTEADO, y es el job de arriba el que acaba de probar que esta al dia). Va aparte y no como pasos del primero porque el `verify` son ~5 s sin dependencias y esto descarga un Chromium de ~115 MB | **s154** |
| `playwright.config.js` | **Configuracion de la suite E2E (s154)**. Levanta `.claude/static-server.js` como `webServer` y apunta a **`/index.html`** explicito (el servidor mapea `/` a `PACE.html`, el entry de DESARROLLO). Fija a proposito **`locale: es-ES`** (los textos asertados son los espanoles; `detectInitialLang` los elige), `timezoneId`, **`colorScheme: light`** (o la prueba de paleta no tendria de donde salir) y **viewport 1280x720**. **`retries: 0`**: un test que solo pasa al segundo intento esta diciendo algo. Sin `devices[...]`, que puede traer un `channel` exigiendo un Chrome del sistema | **NUEVO s154** |
| `tests/helpers.js` | Utilidades compartidas de la suite. **Tres trampas medidas viven documentadas aqui**: (1) la semilla de `firstSeen` se escribe **SOLO SI FALTA**, porque `addInitScript` corre en CADA navegacion y a secas machaca el estado en los `reload()`; (2) los matchers comparan **`textContent`**, no lo que se ve — `innerText` trae el `text-transform` de CSS aplicado; (3) contar sellos exige **acotar a `[data-pace-modal-backdrop]`** (s152), y por eso el contador ofrece las dos cuentas: para poder asertar la diferencia | **NUEVO s154** |
| `tests/eventos.spec.js` | **12 tests de `pace.events.v1` (s155)**. Defienden promesas escritas en una pagina **PUBLICA** (`privacy.html`) y en el diseño: activacion **idempotente** (si `activatedAt` se moviera, cada arranque recapturaria el baseline y **contaria de mas**) · **cero peticiones fuera del origen** mientras opera el contenedor, medido en el **cable** · la **lista permitida** del payload descartando `notaLibre`/`ip`/ruta de archivo · `reset` y el **«Borrar todos mis datos» de Ajustes** borrando los DOS almacenes · un **backup antiguo** reiniciando el contenedor por la UI real · `replaceFromImport` dejando **1 y no 7** · seis snapshots invalidos rechazados con el contenedor **byte a byte** igual · **DOS pestañas de verdad** emitiendo a la vez sin perder un evento (el **P0** del diseño) · marcador y **recuperacion idempotente** | **s155 · v0.88.1** |
| `tests/*.spec.js` | **13 tests**: `artefacto` (es el compilado, consola limpia, precache real ↔ declarado) · `onboarding` (con estado limpio arranca AHI, y montado **detras** de la home en el DOM — la trampa de s153, convertida en aserto) · `checklist-foco` (Pomodoro con **reloj virtual** hasta el BreakMenu) · `checklist-cuerpo` (Respira + **modal de seguridad de apnea** + Mueve) · `checklist-estado` (Hidratate, Logros con toast, Tweaks, persistencia). **Al anadir un aserto: se pone ROJO a proposito** y se comprueba que muerde — `getByRole({name})` casa por **SUBCADENA**, asi que sin `exact: true` un renombrado sigue pasando | **NUEVO s154** |
| `app/events/events-payloads.js` | **ESQUEMA DE PAYLOADS (s155)** — la mitad de la capa A donde vive la **MINIMIZACION**: cada payload se reconstruye **campo a campo** desde una **LISTA PERMITIDA**, no desde una lista de campos prohibidos (que siempre se queda corta). Lo que no esta en el esquema **no puede colarse aunque nadie lo haya previsto** — medido: un payload con `notaLibre`, `ip` y una ruta de archivo sale con tres claves. **Carga ANTES de `events-model.js`** | **NUEVO s155 · 112 ln** |
| `scripts/verify.eventos.js` | **Tanda de `pace.events.v1` en el verify (s155)**. Como `verify.integridad.js`, **no es un script suelto**: aquella lo invoca dentro de la tanda [4/4]. Cinco comprobaciones RELACIONALES + guard de cero, y **dos de ellas defienden frases de `privacy.html`** en vez de invariantes internos. `listaCorta` llega **por parametro**: un segundo formateador daria mensajes distintos para el mismo problema | **NUEVO s155 · 176 ln** |
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
| `app/breathe/BreatheSession.jsx` | Respiracion - sesion guiada | **v0.73.0** |
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
| `app/focus/FocusTimer.jsx` | Modulo Foco (pomodoro) | **v0.67.0** |
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
| `app/main/home-geometry.js` | Ayudante de geometría de la HOME **Desktop**: mide y publica en `:root`… | **v0.71.0** |
| `app/main/_responsive.js` | IIFE: inyecta `<style id="pace-main-responsive-css">` con reglas @media… | **v0.71.0** |
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

> El informe operativo de cada sesion (cambios entregados y verificacion) vive en su diario
> en [`docs/sessions/`](./docs/sessions/) y destilado en [`CHANGELOG.md`](./CHANGELOG.md).
> Aqui solo lo que sigue VIVO: diferido y pendiente.

### Diferido (documentado, NO ejecutado)

- **[RED DE SEGURIDAD]** ~~tanda 1 (s150)~~ y ~~tanda 2 (s152)~~ **HECHAS y verificadas**: el
  `verify` tiene 4 tandas y 32 comprobaciones, y las 26 nuevas se pusieron **rojas a propósito**.
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
      `gh` **NO esta instalado** (s153), asi que la afirmacion de la auditoria de que `main` esta
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
- **[HALLAZGO s149, NO tocado] El ayudante de geometria de la home NO PUBLICA NINGUNA variable.**
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
- **[HALLAZGO s148, NO tocado] `first.return` («Regresas») no se desbloquea NUNCA.** El rollover
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

## Proxima sesion -- **FASE 2 del esquema de eventos** (los emisores), o WRANGLER

> **La red de seguridad esta COMPLETA en sus dos mitades**: la ESTATICA (`npm run verify`, 4
> tandas, ~8 s) y la de COMPORTAMIENTO (`npm run test:e2e`, **23 tests, ~29 s**). **El CI repite
> las dos en cada push**, en dos jobs, y anade la frescura del artefacto.
>
> **FASE 3 del plan (`pace.events.v1`) esta en su Fase 1 y CERRADA**: modelo canonico, adaptador
> web, Web Locks, baseline, export/import/reset, recuperacion y pruebas multi-pestaña. **Sin
> emisores.** Lo siguiente del subsistema es la **Fase 2 del esquema** —`session.completed`,
> `path.step.completed`, `path.completed` y `feedback.answered` (dual-write)—, y tiene **dos
> condiciones de entrada que ya no dependen de que nadie se acuerde**:
> - el `verify` exigira que el export de «Tus datos» lleve la **seccion de eventos** en cuanto
>   aparezca el primer `paceEventsAppend(` fuera de `app/events/`, porque `privacy.html` promete
>   exportar **TODO** el estado;
> - la poda por **calendario** (120 d) se engancha al **rollover diario** en la Fase 3 del
>   esquema, reutilizando `selectEventsToPrune` + `foldEventsIntoBaseline` + `nextPruneCursor`.
>   Hoy solo corre la poda por **presion de presupuesto**, y esta declarado en `NO_CUBRE`.
>
> **Antes de tocar `app/events/`**, leer su fila en `DECISIONES_TECNICAS_VIGENTES.md`: capa A sin
> nombrar el backend · minimizacion por **lista permitida** · exclusion por operacion · barrera
> entre almacenes · y **cero canal de red**, que no es un detalle de implementacion sino la
> promesa del subsistema.
>
> **Del frente CI queda una pieza y media**:
> - **Wrangler** — deploy a Cloudflare Pages. Exige **secretos de la cuenta del usuario** en
>   GitHub; el YAML se puede dejar escrito pero queda **inerte** hasta que existan. Es la unica
>   pieza que no depende de nada del repo.
> - **Proteger `main`** — `WORKFLOW.md` §8, **accion del usuario**. `gh` **sigue sin instalar**,
>   asi que la afirmacion de la auditoria **sigue SIN VERIFICAR**. Y ojo con la trampa
>   conceptual: **«exigir el check sin requerir PR» no existe** — requerir status checks bloquea
>   el push directo, porque el check solo puede pasar DESPUES de que el commit exista.
>
> **Antes de tocar `.github/workflows/ci.yml`**: el CI **no comprueba nada que no corra en
> local**. Vigilancia nueva se anade al `verify` **o a la suite**, y el YAML no se toca — asi lo
> que sale rojo en GitHub se reproduce con un comando. Y las dos trampas del paso de frescura: el
> diff va **acotado a `index.html`** (el standalone esta congelado desde s134 y el build lo
> reescribe en cada pasada) y se compara con **`git diff`, nunca con un hash**.
>
> **Antes de tocar `scripts/verify*.js`**, leer su fila en `DECISIONES_TECNICAS_VIGENTES.md`:
> una comprobacion nueva es **RELACIONAL o CENSO** (no se mezclan), se pone **roja a proposito**
> antes de darla por buena, cero elementos reconocidos es **FALLO explicito**, y **lo que se
> anade se declara** en el bloque `NO_CUBRE`.
>
> **Antes de tocar `tests/`**, leer su fila y la cabecera de `tests/helpers.js`. Las cuatro que
> mas caro salieron: los matchers comparan **`textContent`** y no lo que se ve · `getByRole` y
> `getByText` casan por **SUBCADENA** (sin `exact: true` un renombrado sigue pasando) ·
> **`addInitScript` corre en CADA navegacion** (la semilla se escribe solo si falta) · y **cada
> aserto nuevo se pone ROJO a proposito**, porque de los 21 primeros **cuatro no mordieron**.
>
> **Y algo que ahora por fin se puede medir**: el ayudante de geometria de la home no publica
> ninguna variable (hallazgo de s149), y la cautela era que estaba medido en el panel de vista
> previa y no en un navegador real. **Playwright ES un navegador real**, asi que reproducirlo ya
> no tiene excusa tecnica — pero sigue **fuera de alcance** hasta que el usuario lo pida.
>
> **De la lista de s149 siguen abiertas**: **D3** (la sidebar es racha **y record** contra
> §37-bis), **D6** (Travesias con mapa) y **D7** (spike de Capacitor).
>
> Orden vigente: «Camino a v1.0» de [`ROADMAP.md`](./ROADMAP.md) (15 fases). **D1 se cerro
> FUSIONANDO**: A–K no lo sustituye; se adoptan su A y su B como frentes, y su C e I esperan a
> D7 y D6.
> **FASE 2**: auditoria (s141) · ola A (s141) · ola C (s142) · ola E (s143) · Preview §18.3
> (s144). **Falta la ola B**: los 20 glifos de ejercicio, EN PAUSA esperando arte.
> **FASE 2.5**: entrega escalonada (s145) · curva, detectores y amnistia (s146) · **denominador
> unico §15.4 (s146)** · arte de logro y sus tres defectos (s147). **Cerrada salvo arte.**
> **FASE 8.5**: el troceo de >500 lineas **HECHO en s148** (cinco archivos, no tres). Siguen
> pendientes a11y, tests del state, import sanitizado, I18N-2 y el bump automatico.

### El usuario avisa cuando tenga arte nuevo

Decision de cierre de s147: la siguiente sesion de glifos **la dispara el usuario** cuando
tenga los dibujos que faltan. Dos tandas posibles, independientes entre si:

- **Glifos de LOGRO** (38 sin arte). Prioridad dentro de esa tanda:
  **`hydrate.week.perfect`** primero — es el unico que **perdio** su dibujo a proposito en
  s147 (llevaba un pincel de caligrafia, que no pinta nada en hidratacion) y hoy cae a su
  caracter. Necesita un dibujo de AGUA. Despues, las familias sin dibujo evidente:
  `streak.7`, `streak.14`, y los **10** de `explore.*` que siguen con el sistema heraldico
  (s148 recuento: eran 10, no 11 — `box`, `rounds`, `kapalabhati`, `shoulders`, `atg`,
  `ancestral`, `neck`, `desk`, `all.move`, `all.extra`).
- **Glifos de EJERCICIO — ola B** (20 sin dibujo, Mueve/Estira). Es lo unico que falta para
  cerrar la Fase 2. Sale de la matriz §19.2 de
  [`audit-mueve-estira-v0.73.1`](./docs/audits/audit-mueve-estira-v0.73.1.md).

**Al re-correr la ingesta de logro no hay que tocar nada mas**: `ingest-glifos-logro.js`
reescribe solo el mapa y el precache, y valida contra el catalogo. Solo se añade la fila al
objeto `MAPEO` (por **clave estable**, jamas por posicion) y se anota el porque en
[`MAPEO_GLIFOS_LOGRO.md`](./docs/product/MAPEO_GLIFOS_LOGRO.md).

### AUDITORIA INTEGRAL EXTERNA — TRIADA en s149. **NUEVE DECISIONES ESPERANDO AL USUARIO**

Triaje completo, con evidencia `file:line` y los archivos a tocar, en
[`triaje-audit-integral-s149.md`](./docs/audits/triaje-audit-integral-s149.md). El original
reparado (formato, sin tocar una palabra) sigue en
[`audit-integral-v0.80.0.md`](./docs/audits/audit-integral-v0.80.0.md).
**Ningun documento canonico se ha tocado** — instruccion nº 10 del propio audit.

**RESUELTAS al cerrar s149 (CINCO de nueve): D1 · D4 · D5 · D8 · D9.** D4 se lee tachada mas
abajo, en su sitio de la lista.

- **D1 · FUSIONAR, no sustituir.** El orden A–K **no reemplaza** las 15 fases: `ROADMAP.md`
  conserva su numeracion y su secuencia. De A–K se adopta **A como frente inmediato** (red de
  seguridad) y **B como frente corto detras** (copy y coherencia). **C (Capacitor temprano) e I
  (Travesias con mapa) NO entran** hasta que se decidan D7 y D6.
- **D5 · el `verify` v1 cubre build + artefacto + `node --check`.** Nada mas: es exactamente lo que
  habria cazado el crash de s144. La integridad de catalogos/i18n/precache/glifos es una **segunda
  tanda**, no la primera.
- **D8 · HECHO en s149.** El guard central gana una tercera funcion, `hasPremiumEntitlement()`
  (`state-entitlement.jsx`), porque el constructor es una **superficie** de pago y no tiene
  `routineId` que pasar a `canAccessRoutine`. `CustomRoutines.jsx` la consume con fallback
  defensivo. **Ya no queda ninguna lectura de `premiumUnlocked` fuera del guard** que no sea un
  fallback. Verificado en las dos direcciones (ver «Ultima sesion»).
- **D9 · HECHO en s149.** Marcado como historico —**no borrado**— el modelo de cuatro vias:
  `MONETIZATION.md` (banner de seccion + las vias 2 y 3 + la tabla de convivencia),
  `ROADMAP.md` («Lanzamiento pagado v1.0» y «App Android (v2.0)») y la seccion de licencia de
  `README.md`.

**ABIERTAS (CUATRO): D2 · D3 · D6 · D7.**

- **D2 · el copy del onboarding promete «Siempre gratis / sin paywall»** en ES y EN
  (`ui.js:27-28`, `:219-220`), y `:38` «No hay servidor» + `:40` «localStorage unicamente» dejan
  de ser ciertos con el Worker de licencia. **Va en el frente B**, detras de la red de seguridad.
- **D3 · la sidebar sigue siendo racha Y RECORD** (`Sidebar.jsx:97,100,103`) contra §37-bis de
  s133. ¿Sigue viva esa decision? Si si, esto es **deuda de implementacion**, no propuesta nueva.
- ~~**D4 · Desktop reordena con `order`**~~ **RESUELTA al cerrar s149: se ACOTA la decision escrita
  a ≤768px, el codigo NO se toca.** `DESIGN_SYSTEM.md` deja de decir «prohibido `order` bajo ningun
  breakpoint» y dice lo que de verdad rige: la jerarquia del DOM es una sola e invariante, pero
  **Desktop (≥769px) SI reordena visualmente** desde s126 —`order:1` a Actividades y `order:2` al
  Camino— y esta validado. **Y la regla original sigue viva donde nacio**: en ≤768px el modelo
  «atardecer» necesita que el flujo sea el del DOM para que el margen negativo solape de verdad.
  Verificado por DOM: orden `timer → camino → actividades`, `order` computado `1` y `2`. Se
  corrigio ademas la cabecera de `home-geometry.js` (ver el hallazgo nuevo del backlog).
- **D6 · ¿Travesias con MAPA en v1?** s132 decidio «Travesias si»; el **mapa ilustrado, el paisaje
  que se transforma y el «Atlas»** son de esta auditoria — arte nuevo (D-4), motor nuevo y
  contrato de datos nuevo.
- **D7 · ¿se adelanta el spike de Capacitor?** Su aviso tecnico es correcto: **no existe `dist/`**,
  el build escribe `index.html` en la raiz, y `webDir: "."` empaquetaria el repo entero.

**Dos apuntes que no son decision:**

- `main` no protegida: la auditoria lo afirma y **no se ha verificado** (requiere `gh`).
- `scripts/audit/` tiene **13 piezas y ninguna devuelve codigo de salida**: imprimen. Es el punto
  de partida real del `verify` de D5.
- **Arreglo sin decision, aparcado para no mezclar frentes**: `home-geometry.js:26` dice que el
  ayudante «solo actua con `min-width:769px` y en movil borra las variables y sale» mientras
  `:58` dice «s128: el motor corre **tambien** en movil». La cabecera miente sobre su archivo.

### Sin depender de arte, si se quiere avanzar ya

- **README**: dice v0.27.6 y lleva ~90 commits sin tocarse, con la app en v0.82.0 (`README.md:6,13`).
  s149 le añade un cargo: `README.md:152` sigue vendiendo «Lifetime + Pase mensual + Temporadas»
  (ver **D9**). Es el
  escaparate del repo y encaja con el bloque de presentacion publica pre-venta.
- **Reescritura editorial de las 28 descripciones**: el Preview de s144 la desbloqueo, pero
  sigue faltando **la referencia de tono del usuario** (rechazo la muestra de s143 en bloque).
  **No proponer otra ronda a ciegas**: pedirle dos o tres descripciones que de por buenas.
- ~~**Fase 8.5 · trocear >500 lineas**~~ **HECHO en s148/v0.81.0**: eran **cinco**, no tres
  (`exercise-glyphs.jsx` 571 y `sessions.js` 502 no estaban en la lista). Ningun archivo de
  `app/` pasa ya de 500. **Lo que SIGUE pendiente de la Fase 8.5**: a11y (tarjetas sin teclado,
  onboarding sin focus trap) · tests del state (A-6) · import sanitizado (A-7) · I18N-2 y las
  deudas D-1/D-2/D-3 · bump automatico de version en el build · timer de Mueve por timestamps.
- **[HALLAZGO s146, no tocado] Los titulos y descripciones de logro son SOLO espanol**, tambien
  en la version inglesa: salen literales de `catalog.js` sin pasar por i18n (solo se traducen
  las etiquetas de categoria y el chrome, `ach.*`). Encaja con I18N-2.
- **Los 8 logros sin detector** que sobreviven (`master.extra.all.week`, `master.midnight.never`
  y las 6 estacionales de estacion entera): viables pero caros, piden seguimiento semanal o de
  estacion completa. Se pintan «Pronto», que es honesto.

### Decisiones de catalogo abiertas (Fase 2)

- **5 de los 47 dibujos de ejercicio no se pintan nunca** (s142): cuatro **tapados por su
  propio alias** y `Nordics`, sin uso. O se borran, o se les quita el alias.
- **Ingles en 5 NOMBRES de rutina**: `Grip + antebrazos` · `Core silencioso` · `Postura
  reset` · `Core · plancha` · `ATG · Rodillas a prueba`. Propuestas dadas: **Agarre +
  antebrazos**, **Postura a punto**, **Rodillas a prueba**; con `Core` la recomendacion fue
  NO tocarlo.
- **`Superman`**: unico nombre de PASO con ingles, mantenido a proposito.
- **`Sentadilla de cuadriceps`** (ex `Sissy squat`) espera **revision FISIO** (B4).
- **El pincel en `stats.month.first` es TEMPORAL** (s147). Alternativa anotada: `secret.zen`.

**Restricciones vivas**: `MoveSessionV1.jsx` esta **exactamente en 500 ln** => lo nuevo va a
`MoveSessionV1.support.jsx`; `ExtraModule.jsx` ronda las 460, asi que al retomar Estira **se
trocean los datos ANTES**.

## Decisiones activas -- indice

> El TEXTO COMPLETO de cada decision vive en
> [`docs/product/DECISIONES_TECNICAS_VIGENTES.md`](docs/product/DECISIONES_TECNICAS_VIGENTES.md) (GOBIERNA).
> Aqui solo el indice, para que este archivo siga siendo ligero en cada arranque.
> **Antes de tocar un subsistema, leer su fila alli.**

| Decision | Desde |
|---|---|
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
| Paleta oscura automatica SOLO en primer arranque | s89 |
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

> **RECONTADA ENTERA EN s148, y por eso hay que desconfiar de ella.** Esta tabla se
> mantiene a mano y **se habia desincronizado en silencio**: daba `exercise-glyphs.jsx`
> por «dentro de limite» con **571 lineas reales**, y `sessions.js` (**502**) no
> figuraba. Antes de trocear nada, **MEDIR**, no leer esta tabla.
>
> **Trampa de medicion**: `Get-Content x | Measure-Object -Line` **no cuenta lineas en
> blanco** (41 de menos en `tokens.css`). Usar `(Get-Content x).Count`.
>
> **Estado tras s148: ningun archivo de `app/` pasa de 500.** El techo es
> `MoveSessionV1.jsx`, EXACTAMENTE en 500.

| Archivo | Lineas | Prioridad |
|---|---|---|
| `app/move/MoveSessionV1.jsx` | **500** | **ALTA -- EN EL TOPE** (sin cambios en s148: no esta POR ENCIMA, pero es el proximo en caer. Lo que se añada va SI O SI a `MoveSessionV1.support.jsx`) |
| `app/tweaks/TweaksPanel.jsx` | **493** | MEDIA (s148: recontado; el candidato natural sigue siendo extraer el bloque de notificacion a seccion propia) |
| `app/extra/ExtraModule.jsx` | **462** | MEDIA (s148: recontado. Al retomar Estira, trocear los DATOS antes) |
| `app/breathe/BreatheSession.jsx` | **454** | BAJA (s148: recontado, no estaba en la tabla) |
| `app/ui/SessionShell.jsx` | **451** | BAJA (s148: recontado) |
| `app/focus/FocusTimer.jsx` | **450** | BAJA (s148: recontado; helpers en `.support`, piezas de UI en `.parts`) |
| `app/glyphs/exercise-glyphs.extra.jsx` | 406 | BAJA (**NUEVO s148**) |
| `app/state-core.jsx` | 402 | BAJA (**s148: 510 -> 402**, migraciones y rollover a `.support`) |
| `app/tokens.css` | 386 | BAJA (**s148: 613 -> 386**, el CSS de Caminos a `paths/paths.css`) |
| `app/i18n/strings/sessions.js` | 353 | BAJA (**s148: 502 -> 353**, el dominio CUERPO a `sessions.body.js`) |
| `app/glyphs/exercise-glyphs.jsx` | 209 | SALE (**s148: 571 -> 209**, Estira a `.extra.jsx`; la fila vieja lo daba por sano desde s84) |
| `app/shell/Sidebar.jsx` | 141 | SALE (**s148: 570 -> 141**, reparto `.support` + `.parts` + orquestador) |
| `app/i18n/strings/ui.js` | 395 | BAJA (s138: etiqueta del visual Flor -> Loto, ES+EN; dominio mas grande del split) |
| `app/i18n/strings-content.js` | -- | SALE (s92: troceado en `app/i18n/content/` breathe 94 + move 186 + extra 202 ln al superar ~470 con F6) |
| `app/breathe/BreatheVisual.jsx` | 421 | BAJA (s139: llego a **512** con el encaje, el banding y la vela ⇒ TROCEADO a `BreatheVisual.support.jsx` (117 ln) con el patron `*.support.jsx`; queda en 421) |
| `app/achievements/Achievements.jsx` | 184 | SALE (s83, antes 409 -- split en achievements/catalog.js + glyphs/achievement-glyphs.jsx) |
| `app/main.jsx` | 380 | BAJA (s138: +14 ln del enrutado de credito de las rutinas propias; s82: split en main/_responsive + TopBar + ActivityBar) |
| `app/state-achievements.jsx` | **397** | BAJA (s146: la curva nueva no cabia bajo 500 ⇒ los contadores y los 23 detectores nuevos viven en `state-achievements.support.jsx` (179 ln), patron `*.support`) |
| `app/paths/PathRunner.jsx` | 244 | SALE (s80, antes 835 -- split en steps/ + parts + CompletionScreen) |
| `app/i18n/strings.js` | -- | SALE (s81, antes 791 -- split en strings/_bootstrap + ui + sessions + paths + stats + achievements) |

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
