# PACE · Estado del proyecto

> **Presente + proximo.** Para el historial, ver
> [`CHANGELOG.md`](./CHANGELOG.md) (versiones) y
> [`docs/sessions/`](./docs/sessions/) (diario de trabajo).
>
> **Al cerrar sesion:** escribir el detalle en `docs/sessions/session-NN-xxx.md`,
> destilar una entrada en `CHANGELOG.md`, y **sustituir** (no anadir) la
> seccion "Ultima sesion" de este archivo. Este archivo no debe crecer.

---

**Version actual:** v0.83.0 (s150 — **`NPM RUN VERIFY`, Y EL LISTON ERA PONERLO ROJO CON EL CRASH DE s144**. Fase A de la auditoria (D1 de s149), alcance de D5: **build + artefacto + `node --check`**, nada mas. El enunciado decia que ninguna pieza de `scripts/audit/` devuelve codigo de salida; medido, **diez de trece salen con 1** — lo que no hay es **ningun ASERTO**: son medidores que imprimen y terminan en 0 con el numero bueno y con el desastroso. El crash de s144 tiene **sintaxis impecable** y solo revienta **al renderizar**, asi que lo caza el **analisis de AMBITO del compilado**: sobre el artefacto sano quedan **38** identificadores sin ligar y **los 38 son de plataforma**, cero ruido de la app ⇒ un `useState` pelado es el nombre 39. Reproducido a proposito, sale **`app/main.jsx:23`** y EXIT=1. **Cinco rojos verificados**, uno de ellos salido de medir. Detalle abajo.)
**Version anterior:** v0.82.0 (s149 — **EL SERVICE WORKER DEJABA DIEZ VERSIONES DE RETRASO EN LA CACHE DE CADA USUARIO**. Sesion de TRIAJE de la auditoria integral externa, contrastada contra el CODIGO y no contra la documentacion. De lo verificable, **cero afirmaciones falsas**; una no reproduce y otra ya estaba corregida. Lo valioso son **cuatro contradicciones, y TRES son del repo consigo mismo**: el onboarding promete «Siempre gratis / sin paywall» en los dos idiomas, la sidebar sigue siendo racha **y record** contra §37-bis, y Desktop reordena con `order` contra la letra de s123. La cuarta —el precache soltando el export congelado en v0.71.0, servido **cache-first para siempre**— es lo unico que se ejecuto. **No se toco ningun documento canonico**: instruccion n.º 10 del propio audit. Detalle abajo.)
**Version anterior:** v0.81.0 (s148 — **CINCO ARCHIVOS POR ENCIMA DEL LIMITE, Y DOS NO ESTABAN EN LA LISTA**. Fase 8.5, troceo SIN cambio de comportamiento. Medir en vez de leer la tabla dio el hallazgo: no eran tres archivos sino **cinco** — `exercise-glyphs.jsx` figuraba como «dentro de limite» con **571 ln** desde s84, y `sessions.js` (**502**) no estaba ni anotado. `tokens.css` 613→**386** · `Sidebar.jsx` 570→**141** · `state-core.jsx` 510→**402** · `exercise-glyphs.jsx` 571→**209** · `sessions.js` 502→**353**. **Ningun archivo de `app/` pasa ya de 500.** El build solo sabia inlinear `tokens.css` con la ruta cableada: generalizado a todas las hojas de `app/`. Y aparecio que **`first.return` no se desbloquea NUNCA** — preexistente, confirmado contra el artefacto de v0.80.0. Detalle abajo.)
**Ultima sesion:** #150 -- 2026-08-03 - **`NPM RUN VERIFY`, Y EL LISTON ERA PONERLO ROJO CON EL CRASH DE s144**. Bump **v0.82.0 -> v0.83.0**. Fase **A** de la auditoria integral, adoptada como frente inmediato por **D1** de s149, con el alcance que fijo **D5**: build + artefacto + `node --check`. Un solo frente, empezando por el script local y NO por el YAML. **(1) EL PUNTO DE PARTIDA NO ERA EL QUE DECIA EL PLAN.** La premisa era que de las trece piezas de `scripts/audit/` **ninguna devuelve codigo de salida**; medido, **DIEZ de las trece** terminan en `main().catch(e => process.exit(1))`. La carencia real es otra y mas de fondo: **ninguna tiene un ASERTO**. Son bancos de medicion que imprimen y terminan en 0 tanto si el numero es bueno como si es desastroso — un checker no es un medidor con `exit(1)` pegado al final, es un medidor que sabe que valor es inaceptable. Por eso **no se reaprovecha ninguna tal cual**; lo que si se hereda es la tesis de `inventario.js`: si el dato esta en el arbol, se saca del arbol, compilando con el Babel del build en vez de leer a ojo. `glifos-v2.js` y `revision-glifos.js` **no se tocan**: no son auditoria, son dependencias vivas de la ingesta de arte. **(2) POR QUE `node --check` NO PUEDE CAZAR EL CRASH DE s144.** `useState` pelado en `main.jsx` tiene **sintaxis impecable** —el parser de TypeScript del build lo da por bueno— y solo revienta **al RENDERIZAR**, y solo en el artefacto, porque el build envuelve cada modulo en su IIFE (a proposito, s103) y el `const { useState } = React` de otro archivo deja de alcanzar. Dos versiones publicado. Lo caza el **analisis de AMBITO del compilado**: se parsea cada bloque IIFE y se piden los identificadores **referenciados y no ligados en ningun ambito** (`scope.globals` del `Program`, con el `@babel/core` del propio build). **(3) LA CALIBRACION ES LO QUE DECIDIO QUE LA IDEA SERVIA.** Sobre el artefacto SANO de v0.82.0: **98 bloques IIFE = 98 modulos declarados** · **336** nombres publicados en `window` · **225** identificadores sin ligar, de los que solo **38** no estan publicados — y los 38 son, uno por uno, globales de plataforma (`window`, `Object`, `React`, `Math`, `document`, `localStorage`, `CustomEvent`, `ResizeObserver`…). **Cero ruido de la app**, asi que la lista de permitidos no es una concesion sino la frontera real, y un `useState` pelado aparece como el **nombre 39**. **(4) LA PRUEBA DE ACEPTACION: TIENE QUE PONERSE ROJO.** Reproducido a proposito en `app/main.jsx:23` (`useStateMain` -> `useState`): `[FALLA] identificador SIN LIGAR ... en app/main.jsx:23`, **EXIT=1**. Deshecho y comprobado byte a byte (`main.jsx` `05B81CEA…`, index y standalone intactos). **TRAMPA PROPIA CAZADA POR ESA MISMA PRUEBA**: la primera version dijo `main.jsx:**24**` — el patron capturaba el salto de linea de detras de `;(function () {`, asi que el compilado empezaba en la linea 2 del grupo y **todas** las lineas salian corridas en +1 (el build compila con `retainLines`: la linea del compilado ES la del fuente). Si la prueba negativa se hubiera conformado con «falla, bien» sin mirar el numero, el error se queda dentro. **La atribucion se comprueba a si misma**: antes de nombrar un archivo, el script busca el identificador EN ese archivo y, si no aparece, lo dice en vez de afirmarlo. **(5) CUATRO ROJOS MAS, cada uno roto a proposito y restaurado byte a byte**: modulo declarado que **no existe** (el build solo emite `[WARN]` y el modulo **desaparece del artefacto en silencio**) · **version descuadrada** entre los tres sitios que se tocan a mano cada sesion (`state-core.jsx`, `sw.js`, `<title>`) · **sintaxis rota en `sw.js`**, que **el build no mira jamas** —ni `scripts/`, ni el mismo— · archivo nuevo en `app/` **sin declarar**. **(6) EL CUARTO SALIO DE MEDIR, NO DEL PLAN**: al comprobar si merecia la pena resulto que `app/` tiene **97** archivos `.js`/`.jsx` y `PACE.html` declara **97**, **biyeccion exacta y cero excepciones**. Con un invariante asi, asertarlo es gratis — y es justo la trampa de s148: se trocea un archivo, el modulo nuevo existe en disco y **no carga nunca**. **(7) LOS FALSOS VERDES SE CUIDARON COMO LOS ROJOS**: el script **imprime sus propios huecos en cada pasada**, tambien en verde — no cubre comportamiento, ni catalogos/i18n/precache/glifos (D5, segunda tanda), ni **orden de carga** (si algo se publica DESPUES, pasa: el analisis es estatico), ni CSS, ni contenido, ni el standalone. Y **cero bloques reconocidos es un FALLO explicito** («el analisis no ha mirado NADA»), nunca un verde silencioso. **(8) NO DEJA RASTRO Y LA DERIVA ES AVISO, NO FALLO.** Corre el build de verdad, guarda los bytes de los dos artefactos y los restaura en un `finally` (y en `SIGINT`): `PACE_standalone.html` vuelve a **`998E3E358D689036`** en cada pasada, el hash congelado de s134. La deriva de `index.html` es `[INFO]` porque el paso vive **justo antes** de regenerar, o sea en el momento en que el artefacto TIENE que estar desactualizado; en rojo, el verify fallaria siempre en el unico punto donde se le llama. **(9) EL CHECKLIST, AL FINAL Y NO AL PRINCIPIO.** `npm run verify` entra como **paso 2** del cierre de `CLAUDE.md`, entre «la app carga limpia» y «regenerar `index.html`» (los pasos 2–9 pasan a 3–10), añadido **despues** de que el verify existiera y se hubiera puesto rojo cinco veces. **(10) VERIFICACION DEL CIERRE**: `npm run verify` **PASA** en 4,4 s · `index.html` difiere de HEAD en **4 lineas** —`<title>` y `PACE_VERSION`, v0.82.0 -> v0.83.0, nada mas— · artefacto cargado en el navegador con SW y caches purgados y estado limpiado desde la pagina viva: monta, `typeof Babel === 'undefined'`, **0** scripts `text/babel`, home con aro y actividades y CTA «Empezar foco», onboarding de primera vez aparece al limpiar (es lo esperado) y no vuelve, Logros abre con **53 sellos pintando su mascara**, Hidratate registra el vaso y **persiste tras recargar**, **`first.sip` se desbloquea**, **consola sin errores**. Diario: [session-150](./docs/sessions/session-150-verify-red-de-seguridad.md).

**Sesion anterior:** #149 -- 2026-08-03 - **EL SERVICE WORKER DEJABA DIEZ VERSIONES DE RETRASO EN LA CACHE DE CADA USUARIO**. Bump **v0.81.0 -> v0.82.0**. Sesion de TRIAJE, un solo frente. **(1) EL FORMATO DE LA AUDITORIA ESTABA PEOR DE LO ANOTADO**: no era «una valla sin cerrar», era que **desde la linea 233 el pegado habia perdido TODOS los marcadores markdown** — los `#` de los 113 encabezados restantes, las viñetas, las ~35 vallas y las dos tablas—, mas el texto del boton «Copy» de la interfaz de origen pegado al primer token de cada bloque de codigo (33 casos). Reparado con una verificacion que hace imposible perder contenido sin que se note: **comparar el flujo de palabras contra HEAD — 4533 tokens antes y despues, CERO divergencias**. Encabezados que parsean: **19 -> 133**. Trampa de metodo: las tres primeras «divergencias» fueron del **comprobador**, no del archivo. **(2) DE LO VERIFICABLE, LA AUDITORIA NO FALLA NI UNA**: `package.json:5-7` expone solo `build` · no existe `.github/` · el build genera ambos artefactos · su §4.1 («una regresion real rompio `index.html` durante varias versiones») es el crash de s144 · su §12.2 inventaria Mueve/Estira punto por punto. **Una NO reproduce** (§7.2: «standalone» no aparece **ni una vez** en `app/i18n/`; esta en `README.md:60` y en docs) y **otra ya estaba corregida** (§7.3 pide arreglar «v1 = web pulida» y `ROADMAP.md:73` ya dice lo contrario). **(3) CUATRO CONTRADICCIONES, Y TRES SON DEL REPO CONSIGO MISMO**: **C1** el onboarding promete «Siempre gratis» / «sin paywall» en ES y EN (`app/i18n/strings/ui.js:27-28`, `:219-220`) contra v1.0 = version PAGADA — y `:38` «No hay servidor» + `:40` «localStorage unicamente» dejan de ser ciertos en cuanto exista el Worker de licencia · **C2** la sidebar sigue siendo racha **Y RECORD** (`Sidebar.jsx:97,100,103`, «Mejor: {n} dias») contra §37-bis de s133 · **C3** Desktop reordena secciones con `order` (`_responsive.js:254-263`) contra la letra de s123 (`DESIGN_SYSTEM.md:361-362`, «prohibido `order` bajo ningun breakpoint») — **la mas instructiva**: s126 lo hizo a proposito, el usuario valido el resultado mirando, y **nadie enmendo la decision escrita**, la misma clase de fallo que la tabla de deuda de s148 · **C4** el precache, resuelta aqui. **(4) CONFIRMADA LA ACUSACION DE SU §6.4, y exactamente donde decia**: `app/custom/CustomRoutines.jsx:28` lee `premiumUnlocked` **directo**, sin guard ni fallback. En cambio `BreatheLibrary.jsx:118` **NO es una excepcion**: es el fallback defensivo de un ternario que consulta `canAccessRoutine` primero (`:116`) — tratarlas igual habria dado un hallazgo inflado. Y su §10.2 acierta en algo exacto: `home-geometry.js:26` dice «solo actua con `min-width:769px`, en movil BORRA las variables y sale» mientras `:58` dice «s128: el motor corre **tambien** en movil». **(5) LO UNICO EJECUTADO: el standalone sale del precache.** Congelado a proposito en v0.71.0 (s134) con la app en v0.81.0 => el SW metia un artefacto **diez versiones viejo** en la cache de cada usuario y lo servia **cache-first para siempre**; era la **unica referencia en runtime** de todo el arbol. **Verificado con el servidor de preview PARADO y sembrando el caso real** (cache `pace-v0.81.0` con el standalone dentro): tras activar quedan **solo `pace-v0.82.0`** —el cleanup del `activate` borra la anterior ENTERA— con **86 entradas y el standalone ausente**, y `PRECACHE` tiene **86 filas** => `addAll` (atomico) no fallo ninguna ruta · `manifest.webmanifest` sirve **200 desde cache** => la PWA sigue instalable offline · home monta · Hidratate +2/-1 => 1->3->2 y **persiste tras recargar** · Respira y Mueve abren · Logros pinta **54 sellos con su mascara** · paleta crema->oscuro · Pomodoro 24:59->24:57 · **consola sin errores** (los avisos de Babel son del buffer stale: en el documento vivo `typeof Babel === 'undefined'`, 0 scripts `text/babel`). **Dos trampas propias en seis lineas de cambio**: el comentario nuevo escribia la ruta **literal y entrecomillada** y un comprobador que lee `sw.js` por lineas la contaba como fila (regla de s146 aplicada a otro archivo), y hubo que **simular** `reescribirPrecache()` de la ingesta, que localiza su ancla POR LINEA. **(6) LA AUDITORIA REDESCUBRE DOS COSAS QUE YA TIENES**: su §17.1 (que el BreakMenu recomiende una accion concreta) es la **Pausa PACE de la Fase 3.5** —ya reordena por score y marca «Para ti» (`BreakMenu.jsx:66,113`), lo que no hace es recomendar una RUTINA—, y su §13 es el feedback que diste al cerrar s103. **Y le falta un dato que tu si tienes**: los **5 dibujos que no se pintan nunca** por estar tapados por su alias (s142). **(7) EL TRIAJE SE PRESENTO ANTES DE TOCAR NADA CANONICO** (instruccion n.º 10) y el usuario cerro **cuatro de las nueve decisiones en el mismo cierre**: **D1 FUSIONAR** (A–K no sustituye a las 15 fases; se adoptan su A y su B como frentes, su C e I esperan a D7/D6) · **D5** el `verify` v1 = **build + artefacto + `node --check`**, la integridad de catalogos va en segunda tanda · **D8 y D9 ejecutados**. Quedan **cinco abiertas**: D2 (copy del onboarding, va en el frente B), D3 (sidebar §37-bis), D4 (letra de s123), D6 (Traversias con mapa) y D7 (spike de Capacitor). **(8) D8 — EL GUARD GANA UNA TERCERA FUNCION.** `canAccessRoutine`/`canAccessPath` piden un `routineId` o un `pathId`, y el constructor **no es contenido: es una SUPERFICIE entera de pago**, asi que no habia guard al que preguntar y `CustomRoutines.jsx:28` leia el booleano directo. Entra **`hasPremiumEntitlement()`** en `state-entitlement.jsx` y la seccion la consume con fallback defensivo, conservando `usePace()` para la reactividad — mismo patron que `RoutineCard`. **Verificado en las DOS direcciones sobre `index.html`**: con `premiumUnlocked:false` la seccion pinta «PREMIUM · … · **Pronto**» sin CTA; con `true`, «**+ Crear rutina**» y sin «Pronto»; `canAccessRoutine('atg.knees')` acompaña. La promesa de la cabecera de s95 —«al llegar la licencia real SOLO cambia este archivo»— vuelve a ser cierta. **(9) D9 — MARCADO, NO BORRADO.** `MONETIZATION.md` gana un banner de seccion **⚠️ HISTORICO — NO GOBIERNA** antes del modelo de s21/s26, mas marcas en la via 2 (**DESCARTADO s134**), la via 3 (**FUERA de v1**) y la tabla de convivencia; `ROADMAP.md` marca «Lanzamiento pagado v1.0» (lo gobierna «Camino a v1.0») y «App Android (v2.0)» (**Android entra DENTRO de v1**, s137); y `README.md` corrige su seccion de licencia, que vendia «Lifetime + Pase mensual + Temporadas». El resto del README sigue desactualizado a proposito: va en el frente B. **(10) D4 — SE ACOTA LA FRASE, NO SE REVIERTE EL CODIGO**, y con ella la cabecera de `home-geometry.js`. Los dos son TEXTO: cero codigo ejecutable, cero pixeles. `DESIGN_SYSTEM.md` deja de decir «prohibido `order` bajo ningun breakpoint» y dice lo que rige — la jerarquia del DOM es una e invariante, Desktop reordena visualmente desde s126 y esta validado, **y en ≤768px la regla SIGUE VIVA** porque el «atardecer» necesita el flujo del DOM para que el margen negativo solape. Verificado por DOM: `timer → camino → actividades` con `order` computado `1` y `2`. **(11) Y VERIFICAR QUE UN COMENTARIO ERA INERTE DESTAPO UN HALLAZGO**: el ayudante de geometria **no publica NINGUNA de sus variables** y la home corre entera sobre los fallbacks del CSS — solapamiento **0,028·D** contra 0,16 nominal, y **17 px de scroll**. **Confirmado preexistente** contra el `index.html` de HEAD. NO se toco; anotado en el backlog con sus dos cautelas. Diario: [session-149](./docs/sessions/session-149-triaje-auditoria-integral.md) · triaje completo: [triaje-audit-integral-s149](./docs/audits/triaje-audit-integral-s149.md).

**Sesion anterior:** #148 -- 2026-08-03 - **CINCO ARCHIVOS POR ENCIMA DEL LIMITE, Y DOS NO ESTABAN EN LA LISTA**. Bump **v0.80.0 -> v0.81.0**. Sesion de FASE 8.5 (saneamiento), sin arte que procesar. Troceo **sin cambio de comportamiento**, con los patrones que el repo ya usa. **(1) MEDIR EN VEZ DE LEER LA TABLA fue el hallazgo.** No eran tres archivos por encima de 500 sino **CINCO**: a `tokens.css` 613, `Sidebar.jsx` 570 y `state-core.jsx` 510 se suman **`exercise-glyphs.jsx` 571** —catalogado como «BAJA, dentro de limite» **desde s84**, cuando ya con 554 estaba fuera— y **`sessions.js` 502**, que **nunca entro en la tabla de deuda** pese a ser el dominio mayor del split de s81. Una tabla que se mantiene a mano deja de medir. Trampa de metodo anotada: `Measure-Object -Line` **no cuenta lineas en blanco** y daba 41 de menos; solo cuadro con `(Get-Content x).Count`. **(2) LOS CINCO CORTES, cada uno por una frontera que ya existia**: de `tokens.css` salio el **CSS de Caminos** (no eran tokens: eran reglas de UN modulo, y el archivo ya lo separaba con un banner) -> `paths/paths.css` 284 · de `exercise-glyphs.jsx` salio **Estira**, por el separador que el propio archivo dibujaba -> `.extra.jsx` 406 · `Sidebar` adopta el reparto de Foco -> `.support.jsx` 218 + `.parts.jsx` 277 · de `state-core` salio **«como un estado guardado se convierte en el de hoy»** (deteccion de entorno + migraciones + rollover) -> `.support.jsx` 160 · de `sessions.js` salio el dominio **CUERPO**, contiguo y con la misma frontera en los dos idiomas, que siguen juntos (s81) -> `sessions.body.js` 158. Resultado: **386 / 209 / 141 / 402 / 353**, y **ningun archivo de `app/` pasa ya de 500**. **(3) EL BUILD SOLO SABIA INLINEAR `tokens.css`**, con la ruta cableada: un CSS nuevo se habria quedado fuera del artefacto en silencio. Generalizado a todas las hojas de `app/`, sustituyendo cada enlace EN SU SITIO para conservar la cascada, y abortando si falta una o si no inlinea ninguna. **(4) DOS REGLAS DEL COMPILADO que el troceo obligo a aplicar**: un **`const` no cruza de archivo** (cada uno va en su IIFE) => `sidebarStyles` se publica a `window`, como `pathStepStyles` desde s80, y se referencia PELADO para resolver al renderizar y no al evaluar; en cambio `function` y `var` top-level **si viajan solos**, y por eso las once piezas extraidas de Sidebar y state-core no necesitaron nada. **(5) UN ORDEN DE CARGA NO NEGOCIABLE**: `state-core.jsx` hace `let _state = loadState()` **en el cuerpo del archivo**, no al montar, y `loadState` llama a cuatro de las cinco funciones extraidas => su `.support` carga ANTES. Y `exercise-glyphs.extra.jsx` **muta** el mapa del hermano (el componente cierra sobre esa referencia), con guard que aborta si se invierte el orden en vez de dejar 25 ejercicios sin dibujo en silencio. **(6) VERIFICADO cargando `index.html` tras CADA troceo**, no solo al final, con SW y caches purgados y estado limpiado desde la pagina viva: `state-core` por sus **dos ramas** prediciendo antes de mirar —**7 de 7** en el estado viejo (rotacion lunes-primero, paletas y estilos huerfanos migrados) y **9 de 9** en el rollover completo (semana a cero, racha 5->0 con `longest` intacto, 7 dias archivados)— · i18n comparado **clave a clave contra HEAD** en un sandbox: **195 ES y 195 EN, cero perdidas, cero nuevas, cero distintas** · **47 glifos de ejercicio**, los mismos, con siete claves de Estira pintando su propio dibujo y no el fallback · standalone restaurado byte a byte las cinco veces. **(7) TRES HALLAZGOS FUERA DE ENCARGO**: **`first.return` («Regresas») NO SE DESBLOQUEA NUNCA** —el rollover lo concede con `setTimeout(...,0)` para esperar a `state-achievements.jsx`, pero 0 ms llega antes de que evalue, `unlockAchievement` es `undefined` y el `try/catch` se lo traga—, **confirmado PREEXISTENTE** contra el artefacto committeado de v0.80.0, que se comporta identico; NO se toco · **`sw.js` tenia el comentario de s146 sin cerrar** y se habia tragado el de fuentes de s105, y no era prosa: `reescribirPrecache()` avanza hasta el primer `*/` para decidir donde insertar, asi que metia los 58 glifos DEBAJO del bloque equivocado (reparado y verificado simulando la busqueda del script) · **`PACE.html.bak.pre-fix`**, copia trackeada de `PACE.html` en **v0.25.0** (7 de mayo), eliminada. **(8) DATO CORREGIDO**: los `explore.*` sin dibujo son **10**, no 11. Diario: [session-148](./docs/sessions/session-148-saneamiento-fase-8-5.md).

**Sesion anterior:** #147 -- 2026-08-03 - **EL TRAMADO DEL PAPEL, EL AVISO QUE FALTABA, Y EL SELLO QUE FLOTABA**. Bump **v0.79.1 -> v0.80.0**. Sesion de REVISION DE ARTE: el plan era enseñar al usuario las 9 apuestas del mapeo, los 3 dibujos sueltos y los 4 glifos flojos para que decidiera. Se cumplio, y ademas salieron tres defectos que no estaban previstos. **(1) EL MOTEADO ERA TRAMADO DE SEMITONO, y entraba como TINTA.** Reportado por el usuario («Primer aliento tiene como un fondo raro visible», y el Buho igual) y confirmado comparando con su PNG original: **no esta en el dibujo**. El fondo de los PNG viene **ditherado** entre ~240 y ~254 (modas 241 y 254, 25 % de los pixeles cada una) y `SUELO` esta en 238, justo debajo: a resolucion nativa solo el **2,0 %** cae bajo el suelo, reducir a 224 lo sube al **5,7 %** y el `sharpen` lo remata en **12,4 %**, con minimos de L 78. **DOS INTENTOS FALLIDOS antes del bueno, y enseñan mas que el bueno**: (a) *umbral solo* — aplanar a 255 lo que ya estaba sobre el suelo quita el tramado limpio, pero **la banda del dither se solapa con el tono del trazo mas palido**: la mediana de tinta se hundio de 2,35 % a 1,1 % y `esMarco` dejo de detectar el aro en **los 58**; (b) *`median(3)`* — un filtro espacial ataca ruido ALEATORIO y esto es una **trama REGULAR de imprenta**: sobrevivio entera y encima perdio el aro de «Primer ritual». `blur()` es peor que no hacer nada. **Lo que funciona: DOS BUFFERS** — el marco se busca sobre el original y todo lo demas sobre la copia aplanada a resolucion nativa. Marco detectado en **58 de 58**, peso mediano intacto (2,35 % -> 2,17 %) y **248 KB las 58** contra 297 KB que pesaban 55: **mas de la mitad del archivo era tramado**. Volvio a morder una trampa ya documentada en ese archivo para `.sharpen()`: **sharp promueve el buffer raw de 1 canal a 3 al remuestrearlo**; sin `.toColourspace('b-w')` los 58 sellos salieron **identicos** —un fragmento del aro ampliado— con el dibujo perdido. **(2) EL AVISO PINTABA EL GLIFO VIEJO, y eran DOS superficies.** `Toast.jsx` tenia una **tercera copia** del render de glifo y `CompletionScreen.jsx` una **cuarta**; s146 saco `renderGlyph` a `window` justo para compartirlo pero solo unifico modal y sidebar. **(3) EL SELLO FLOTABA CON EL LARGO DE LA DESCRIPCION.** Reportado con captura («Setenta y cinco sellos» junto a «Cartografa»). No era el dibujo, era la tarjeta: `Seal` anclaba al CENTRO, asi que un texto mas alto empujaba el circulo — medido sobre los 96 sellos, **tres posiciones (15, 20 y 26 px) y 11 px de deriva** en la misma fila. Se ancla arriba (regla de alturas reservadas de s119), seguro porque se midio antes: **0 de 96 tarjetas desbordan**. Despues, **deriva 0**. **(4) MAPEO**: las 9 apuestas CONFIRMADAS · los 3 sueltos colocados (bambu -> `streak.60`, vasija -> `explore.478`, llave -> `secret.bilingual`) · **`hydrate.week.perfect` RECHAZADO** por el usuario —«el glifo es un pincel con tinta»—, y **el error era de LECTURA**: el mapeo de s146 lo anoto como «aguja con gota». El pincel pasa a `stats.month.first` de forma TEMPORAL y `hydrate.week.perfect` se queda **sin mascara** hasta que haya dibujo de agua. **Los 8 flojos se quedan como estan** (decision del usuario). **58 logros con arte, 38 sin.** Diario: [session-147](./docs/sessions/session-147-tramado-y-alineacion.md).

**Sesion anterior:** #144 -- 2026-07-31 - **PREVIEW «ANTES DE EMPEZAR» (§18.3)**. Sesion de CODIGO. Bump **v0.76.0 -> v0.77.0**. Item 6 de la Fase 2, elegido porque los datos **ya existian sin consumidor** (igual que en la ola E), el audit lo pide y **desbloquea la reescritura editorial** aparcada en s143. **(1) La prueba de que faltaba el sitio**: **16 de las 28 descripciones llevan el requisito escrito A MANO** («Silla estable y sin ruedas», «Necesitas pared; barra opcional», «Pasaras por el suelo»). No es que esten mal escritas: es que el requisito no tenia donde ir. **(2) `RoutinePreview` NUEVO**: modal con que necesitas · posicion · duracion · intensidad y nivel · los pasos con su glifo · CTA. **(3) Sale SOLO desde la BIBLIOTECA, nunca dentro de un Camino** —ahi la rutina ya viene elegida y el ritmo manda—, y sale gratis **POR CONSTRUCCION**: se engancha en los handlers de `main.jsx`, que son la puerta de la biblioteca, mientras `PathBodyStep` monta el runner por su cuenta. La biblioteca **se queda abierta detras**. Misma forma que el modal de seguridad de Respira (s90). **El gate `setup:'ready'` del runner v1 NO hacia este trabajo**: es por PASO y llega cuando ya entraste. **(4) Las series del mismo ejercicio se AGRUPAN** (`Fondos en silla x3`): tres veces el mismo nombre seguido es ruido. **(5) Requisitos completados en las 6 rutinas** que no los declaraban; en dos casos el valor salia de su propia descripcion. **Las 28 los declaran ya** (11 de suelo). **(6) Bug propio cazado antes de pantalla**: las claves EN son POSICIONALES sobre el array completo (`<id>.s4.name` cuenta los descansos), asi que filtrar descansos y usar el indice nuevo habria desplazado TODOS los nombres en ingles. **(7) Hallazgo anotado y NO tocado**: la pantalla de preparacion dice «De pie. Sin prisa» tambien en rutinas SENTADAS; ahora que `position` esta en las 28 se puede derivar, y va a la ola editorial. Diario: [session-144](./docs/sessions/session-144-preview-antes-de-empezar.md).


**Ultima actualizacion de este archivo:** 2026-08-03 - sesion 150 (v0.83.0; se retiraron del encabezado la version v0.80.0 y el resumen de la sesion #143, que siguen en `CHANGELOG.md` y en sus diarios — este archivo no debe crecer)
**Build entregado:** `index.html` **v0.83.0** (regenerado en s150; difiere del de HEAD en **4 lineas**: `<title>` y `PACE_VERSION`. `PACE_standalone.html` restaurado **byte-identico** — hash `998e3e35...`, decision s134). **OJO**: verificar SIEMPRE el cierre cargando `index.html`, no solo `PACE.html` — el build envuelve cada modulo en un IIFE y hay fallos que solo salen ahi (el `useState` pelado de s144 estuvo DOS versiones publicado). **Desde s150 eso ya no depende de acordarse**: `npm run verify` lo caza por analisis de ambito y devuelve codigo de salida. `PACE_standalone.html` sigue en v0.71.0 A PROPOSITO (export bajo demanda, s134).

---

## Red de seguridad -- archivos vivos

> Mapa de archivos y **version actual**. El HISTORIAL por archivo (que sesion cambio que) se
> archivo en [`docs/archive/RED_DE_SEGURIDAD_HISTORICO.md`](docs/archive/RED_DE_SEGURIDAD_HISTORICO.md);
> para el detalle de un cambio concreto, `CHANGELOG.md` y `docs/sessions/`.

| Archivo | Rol | Version |
|---|---|---|
| `PACE.html` | Entry point de desarrollo modular | **v0.83.0** |
| `PACE_standalone.html` | Bundle offline autocontenido — export BAJO DEMANDA (s134), NO se regenera al cerrar | **v0.71.0** |
| `index.html` | Artefacto WEB/PWA canonico (mismo compilado + `<link rel="manifest">`) | **v0.83.0** |
| `scripts/verify.js` | **Red de seguridad LOCAL** (`npm run verify`, s150): `node --check` de todos los `.js` + build con salida 0 + **analisis de AMBITO del artefacto** (el crash de s144) + biyeccion `app/` ↔ `PACE.html` + coherencia de version. **Restaura los dos artefactos byte a byte**; imprime sus propios huecos en cada pasada | **NUEVO s150** |
| `app/onboarding/Onboarding.jsx` | Orquestador del onboarding de primera vez: maquina de pasos 0-4, chrome… | **v0.56.0** |
| `app/onboarding/OnboardingScreens.jsx` | Piezas puras: ONBOARDING_QUESTIONS (definicion de las 3 preguntas) + OnbScene… | **v0.56.0** |
| `app/onboarding/pickFirstPath.js` | Primer Camino desde el perfil: candidatos por necesidad + sesgo por tiempo +… | **NUEVO s106** |
| `app/i18n/strings/onboarding.js` | i18n del flujo: navegacion + 3 preguntas + primer Camino, ES+EN | **NUEVO s106** |
| `vendor/` | React 18.3.1 production UMD self-hosted (react + react-dom .min.js) | **NUEVO s103** |
| `package.json` + `package-lock.json` | Toolchain del build (devDependencies) + scripts `build` y **`verify`** (s150) | **s150** |
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
| `app/tweaks/TweaksPanel.jsx` | Panel de Ajustes (ejes + agua + notificacion + **Sesiones** + reset + legal… | **v0.73.0** |
| `app/tweaks/TweaksData.jsx` | Seccion "Tus datos" -- Export/Import JSON + msg + iconos + tweaksDataStyles | **v0.52.0** |
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
| `app/state-core.jsx` | Store, `loadState`, tema y toast. El rollover y las migraciones **salieron en s148** | **v0.83.0** |
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
| `app/i18n/strings/ui.js` | i18n shell UI: welcome + support + sidebar + topbar + activity + settings +… | **v0.72.0** |
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
| `sw.js` | Service Worker PWA. **s149: el export offline SALE del precache** (congelado a proposito en v0.71.0 y servido cache-first para siempre). **86 filas de `PRECACHE`**; si se toca, contar filas contra las entradas reales de la cache — `addAll` es atomico | **v0.83.0** |
| `app/ui/UpdatePrompt.jsx` | Aviso de version nueva del SW ("Actualizar / Luego") | **v0.47.0** |
| `app/focus/FocusTimer.support.jsx` | Helpers sin UI del Pomodoro: `getFocusDescriptorKey` + `maybeNotifyFocusEnd`… | **v0.67.0** |
| `app/focus/FocusTimer.parts.jsx` | Piezas de UI del Pomodoro extraídas: `MinutesPicker` (selector de duración… | **NUEVO s124** |
| `build-standalone.js` | Genera el bundle offline (AHORA compilador: Etapa A). **s148: el inlineado de CSS deja de estar cableado a `tokens.css`** y recorre TODAS las hojas de `app/`, cada una en su sitio (conserva la cascada), abortando si falta o si no inlinea ninguna | **v0.81.0** |
| `.claude/static-server.js` | Mini servidor estatico del preview (s80) | **v0.49.0** |

## Ultima sesion -- lo que sigue vivo

> El informe operativo de cada sesion (cambios entregados y verificacion) vive en su diario
> en [`docs/sessions/`](./docs/sessions/) y destilado en [`CHANGELOG.md`](./CHANGELOG.md).
> Aqui solo lo que sigue VIVO: diferido y pendiente.

### Diferido (documentado, NO ejecutado)

- **[RED DE SEGURIDAD — SEGUNDA TANDA, sale de s150]** La tanda 1 (`npm run verify` local) está
  **hecha y verificada**. Queda, en este orden:
  - **Integridad de catálogos, i18n, precache y glifos** — lo que **D5 aparcó** explícitamente.
    Hay material medido de sobra para asertarlo sin inventar umbrales: recuento i18n **clave a
    clave contra HEAD** (s148 midió 195 ES / 195 EN), **filas de `PRECACHE` = entradas reales de
    la caché** (s149, `addAll` es atómico), **47 glifos de ejercicio** y **58 máscaras de logro**.
    El patrón ya está: cada comprobación es un aserto con su número esperado, no una impresión.
  - **CI**: GitHub Actions / YAML, Wrangler, Playwright y proteger `main`. No existe `.github/`
    (verificado en s149). El `verify` local es la pieza que ese YAML tendría que invocar, así que
    va **detrás**, no delante.
  - **Huecos declarados del verify v1**, por si algún día pesan: no cubre **orden de carga** (un
    nombre publicado DESPUÉS pasa igual, el análisis es estático) y su lista de plataforma tiene
    **99 nombres** — si algún día se declarara ahí un identificador de la app, ese nombre dejaría
    de vigilarse.
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

- **[PRESENCIA PUBLICA — reportado por el usuario al cerrar s139]** Dos cosas del repo de GitHub,
  ambas ya diagnosticadas con datos:
  - **`README.md` MUY desactualizado**: dice **v0.27.6** y no se toca desde hace **89 commits**
    (`4554b05`, 2026-05-11) mientras la app va por v0.73.0 — 46 versiones menores de desfase. No
    menciona nada de lo construido desde entonces (Caminos con laminas, contrato de pasos v1,
    onboarding, PWA/SW, premium/entitlement, loto de Respira, i18n troceado…). Encaja natural con
    el bloque de **presentacion publica pre-venta** (README es el escaparate del repo, y hay
    `landing` pendiente en la estrategia premium).
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

## Proxima sesion -- **RED DE SEGURIDAD: `npm run verify` LOCAL** (decidido al cerrar s149)

> **Frente s150, acordado con el usuario**: la red de seguridad, empezando por un **`verify`
> LOCAL, no por el YAML** — lo que cazo bugs en s148 fueron scripts locales, y la Fase 8.5 ya lo
> pedia (tests del state A-6).
>
> **Alcance de la primera version (D5, cerrado): build + artefacto + `node --check`.** Es
> exactamente lo que habria cazado el crash de s144, que estuvo **dos versiones publicado**. La
> integridad de catalogos/i18n/precache/glifos va en una **segunda tanda**, no en esta.
>
> **Punto de partida real**: `scripts/audit/` tiene **13 piezas y ninguna devuelve codigo de
> salida** — imprimen. Hay que darles salida distinta de 0 para que un fallo detenga el `verify`.
>
> **`verify` OBLIGATORIO AL CERRAR** (decidido al cerrar s149): en cuanto exista, entra en el
> checklist de cierre de `CLAUDE.md`, **justo antes de regenerar `index.html`**. Una red que no se
> corre sola no es una red — es lo que dejo pasar el crash de s144 durante dos versiones. **Ese
> paso de `CLAUDE.md` lo añade s150**, no antes: un protocolo que llama a un script inexistente
> es peor que ninguno.
>
> **Detras va el frente B** (copy y coherencia): **D2** el onboarding y los claims de servidor,
> mas el README entero.
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
