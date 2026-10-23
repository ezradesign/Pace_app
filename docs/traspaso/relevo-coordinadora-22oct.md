# Relevo de la coordinadora · 22 oct. 2026 (noche)

Coordina desde las 21:35 del 22 oct. la sesión `local_4fd476ac-ed0f-4377-b209-2819ee49933d`, en la cuenta
de la hoja https://claude.ai/artifact/5iWBfHE7kD3dUVocdskmb6 (5 h al 1 % y la semana al 14 % al empezar; se repone
a las 02:30). Antes, `local_40565a0f-bb09-49ec-af11-5f5f20bdc5bb` en la cuenta de EcLj6… (llegó al 91 %),
`local_f20bfd4a-d23a-4420-8608-915558f91136` y `local_7f8a7a6d-68cd-45e8-9548-a7425f60ae05`.
Este archivo es lo que necesita la siguiente para seguir, también desde la otra cuenta de Claude.
**La cola de abajo es la única lista de lo pendiente** (Ez, 22 oct.: «todo lo que vaya quedando
pendiente vete organizando para ir haciéndolo y no perder nada»): lo que aparece, entra aquí.

## 23 oct., mañana: coordina la cuenta de EcLj6… (sesión `local_d53e9265-d16f-4c15-ba7b-83faa4b9fb37`)

Al empezar (~09:40): 5 h al 2 %, **la semana al 74 %** (se repone el 27 oct. a las 14:00). Si la semana pasa del
85 %, se prefiere la otra cuenta (`docs/WORKFLOW.md` §10). Lo hecho del bloque «AL RELEVO» de abajo:
1. **El CI de 48ec001 salió verde entero.** La caída de d8030aa era `tests/aro-de-golpe.spec.js` leyendo tarde: un
   segundo render con el mismo restante devuelve el 1 s. Ahora lee la transición en el mismo cambio que mueve el arco
   (MutationObserver). Comprobado: sin `deGolpe` cae (1 s en el salto) y con él, 6 de 6.
2. **`/beta`, los dos enlaces encendidos** (`https://groups.google.com/g/pace-tests` y la prueba de Play). La prueba
   de 360 px mira cada paso según el bloque y la de pendientes los simula.
3. **«Maqueta» retomada en su carpeta**: sesión `local_0d59f656-7920-4237-9b06-ec0c56ae1b85` («Maqueta: «Ver
   ejercicio» y v0.175.0»), rama `claude/maqueta-inicio-3a2a59`, puerto 8803; encargo en `.claude/relevo/RELEVO.md`
   de su carpeta. Acaba con fotos para Ez; se junta con su sí y la suite entera con todo junto.
4. «Página para testers» (`local_be95e077-…`) y la coordinadora de anoche (`local_4fd476ac-…`) son de la cuenta de
   5iWBf…: desde esta no se ven; se archivan desde allí.
5. **v0.175.0 juntada** con el «júntala» de Ez sobre https://claude.ai/artifact/Hh3tA7SCTqm2N7b84QzFpJ; el sello que
   tapa 3 s la invitación la primera vez, «déjalo así». Suite entera con todo junto: 836 en verde, 2 saltadas y 2
   caídas por la decisión nueva (`ritmo-bloque-siguiente.spec.js`, puesta al día). En el CI cayeron después dos pruebas
   frágiles, arregladas y comprobadas provocándolas: `aro-de-golpe` (2f5d3c3, el salto por la cifra del reloj) y
   `bloques-cortos` 4c (9c1dfd6, el aviso del sello llega tarde y tapa la frase). **CI de 9c1dfd6 en verde entero**
   (hubo que relanzarlo: GitHub lo canceló al preparar Node). La sesión «Maqueta»
   (`local_0d59f656-…`) terminó: archivarla con el sí de Ez.
5b. **`/beta` más vistosa, subida con el sí de Ez** (23 oct., noche; maqueta https://claude.ai/artifact/6DgzpjqCQXC6WoZddpVGRg):
   los dibujos de los módulos, la insignia oficial de Google Play (`beta/google-play-es.png` y `-en.png`, de
   play.google.com/badges, con permiso de Ez), la parte del iPhone con TestFlight, el logo grande, el regalo también en
   iPhone (códigos de Apple con v1), preguntas del iPhone y el pie nuevo con «Contacto». **Cuando Apple apruebe la
   prueba beta**: el enlace público del grupo «Testers iPhone» va en `data-enlaces` → `iphone.url`, con
   `pendiente: false` (la prueba exige `https://testflight.apple.com/join/…`). Sin insignia de Apple: solo vale con la
   app en la App Store.
6. **Mueve y Estira**: las dos respuestas de ChatGPT, guardadas; Ez tiene una segunda pregunta para pegarle (botón en
   https://claude.ai/artifact/AvZHxJKrvrHQUcJKB2NEqp, texto en `docs/proposals/mueve-estira-chatgpt-2-23oct.md`):
   la ficha de cada uno de los 63 ejercicios con su texto real, las pausas sencillas con lo que hay y cuáles de los 22
   nuevos hacen falta. Con esa respuesta, la página de las siete decisiones (`mueve-estira-comprobacion-23oct.md`).

## AL RELEVO (22 oct., ~22:50, esta cuenta al 92 %; la otra se repone a las 00:30)

**Lo primero, en la carpeta principal (nunca `cd` en Bash; rutas absolutas y `git -C`):**
1. **v0.174.7 en main** (merge f23cbf0: /beta y /premium con la letra de la app; Ez dijo «júntalas» mirando
   https://claude.ai/artifact/DH7ZDJ9aSFqEzrpiD5zAyE). Suite entera con todo junto: 824 en verde, 2 saltadas y 1
   caída por carga (`ritmo-linea.spec.js:176`, las fuentes que llegan tarde, con la Maqueta probando a la vez):
   sola, 3 de 3 en verde. Subida al relevo: **mirar primero el CI de main** (`gh run list --branch main --workflow CI`).
   **El CI de d8030aa (v0.174.6) salió rojo en e2e (1/2) por una prueba frágil**, no por el cambio:
   `tests/aro-de-golpe.spec.js:52` (de v0.174.5) lee las transiciones del aro un segundo tarde en el CI y ve «1s»
   en vez de «0s»; en local pasó en las dos suites enteras y v0.174.6 no toca `TimerDial.jsx`. Endurecerla
   (congelar el reloj con `page.clock` o leer las transiciones en el mismo pintado del salto) antes de seguir
   juntando; si el CI de v0.174.7 vuelve a caer solo por ella, es esto.
2. **Encender los dos enlaces de /beta** (en `beta/index.html`, bloque `data-enlaces`): `grupo.url` =
   `https://groups.google.com/g/pace-tests` y `pendiente: false` en los dos (el de Play ya es
   `https://play.google.com/apps/testing/com.ezradesign.pace`, confirmado por Ez). Ajustar
   `tests/beta-pagina.spec.js`: la prueba de 360 px hoy exige los dos pendientes; que mire cada enlace según el
   bloque, y que la de los enlaces puestos pase a simular los dos pendientes (así se prueban los dos estados).
3. **Hechos de Ez esta noche:** la prueba cerrada ESTÁ APROBADA (Prueba cerrada · Alpha, 0.174.0, disponible desde el
   21 oct. 23:40). Grupo de Google creado: **pace-tests@googlegroups.com** («PACE testers»; pace-testers estaba
   cogido). En Play eligió «Grupos de Google» con ese correo y lo envió a revisión: **LinkedIn y avisar a sus dos
   testers, cuando el Resumen de la publicación ya no tenga nada en revisión**. Cuenta de Apple Developer pagada
   con la cuenta de PACE (el recibo fue al otro correo de Ez, solo facturación): «Pending» hasta 48 h; no volver a
   pagar. Botón de la invitación: **«Ver ejercicio»**, no «Hacerla»; las fotos de la hoja → pantalla de
   ejercicio, aprobadas con sus dos recomendaciones (`DECISIONES_PRODUCTO.md`).
4. **Sesiones:** «Maqueta» (`local_95664ff9-…`, carpeta `.claude/worktrees/maqueta-inicio-3a2a59`, rama
   `claude/maqueta-inicio-3a2a59`, puerto 8803) montando v0.175.0; se le pidió wip, push y su punto en LEEME:
   retomarla con `start_session` + `cwd` (WORKFLOW §10). «Página para testers» (`local_be95e077-…`), terminada y
   juntada: archivarla con el sí de Ez.
5. Página de pasos de esta cuenta, al día: https://claude.ai/artifact/5iWBfHE7kD3dUVocdskmb6 (la otra cuenta publica
   el mismo archivo en https://claude.ai/artifact/EcLj6io4wM9pGjtQ5wd1CT).

## Quién soy y qué hago

Coordino desde la carpeta principal (`main`). Las sesiones trabajan cada una en su rama y su worktree,
**nunca suben a main**. Cuando una acaba: reviso su rama, se lo enseño a Ez en palabras llanas y, con
su sí, la junto (`git merge --no-commit`, choques de versión a la más alta), build, `verify`, la suite
entera con todo junto y push. Como mucho dos sesiones a la vez, con archivos y puertos
(`PACE_E2E_PORT`) repartidos. Commits sin `Co-Authored-By` (`verify` lo rechaza).

## Dónde está main

**v0.174.6** juntada el 22 oct. hacia las 22:10 con el sí de Ez (commit 86e1958): la app abre con los módulos,
los Ajustes del móvil sin scroll y la voz grave en Rondas (1A 2A 3A). Suite entera con todo junto: 819 en verde y
2 saltadas. **Mirar primero el CI** (`gh run list --branch main --workflow CI`); no subir nada a main mientras
corre, porque un push nuevo cancela el anterior. Antes, v0.174.5 (3dfe0fc, logros solo con la sesión entera); su
rama `claude/logros-creditos-6ea13b` ya está dentro y su sesión (`local_6078ef5d-…`), terminada: archivarla con el
sí de Ez. **Desde la carpeta principal, nunca `cd` en Bash**: rutas absolutas y `git -C` (un `cd` a un worktree
movió el directorio de la sesión dos veces el 22 oct.).

## Sesiones en marcha

| Sesión | id | Carpeta y rama | Puerto | Versión | Lleva |
|---|---|---|---|---|---|
| Maqueta: inicio, Ajustes y la voz | `local_95664ff9-51ad-4ce0-95c9-7963e794bb52` (retomada a las 21:40; antes `local_6ea49468-…` y `local_6c95115f-…`) | `.claude/worktrees/maqueta-inicio-3a2a59`, `claude/maqueta-inicio-3a2a59` | 8803 | v0.174.6 | v0.174.6 lista (0707b36), esperando el sí de Ez para juntarla; la pregunta 5 («Hacerla»), sin contestar. Mientras, solo lectura: la lista del reparto de «Hacerla». No toca la rama hasta que v0.174.6 esté en main; luego junta `origin/main` y monta las pausas como v0.175.0 |
| Página para testers y letra de /premium | `local_be95e077-a320-47ba-9cd5-47f585894330` (22:25) | su worktree, rama `claude/beta-testers-…` | 8804 | v0.174.7 provisional | Punto 3 de la cola: `/beta` (1A · 2A) y la letra A en `/beta` y `/premium`. Solo `beta/`, `premium/index.html`, `scripts/web-dist.js` y sus pruebas; nada de `app/`. Sin navegadores hasta el aviso de v0.174.6 en main |

Al juntar v0.174.6 (22 oct., ~22:20), el CI de main de 4a6fc34 ya había acabado: `verify` y los dos trozos de
`e2e` en verde; `e2e-safari` se colgó 30 min en `npx playwright install-deps webkit` (apt de GitHub, no el código:
en 3dfe0fc tardó 2 min) y GitHub lo dio por cancelado. Si se repite, ponerle un `timeout-minutes` corto a ese paso.

Sabe que al 85 % hacen «wip» y push, y que al 90 % dejan su punto en el bloque de arriba de
`docs/traspaso/LEEME.md` de su rama. Para retomarlas desde la otra cuenta: `docs/WORKFLOW.md` §10
(sesión nueva en la MISMA carpeta, con la misma rama y el mismo puerto; `start_session` con `cwd`).

**Al relevo (22 oct., ~21:00, al 75-90 % de esta cuenta; se repone a las 00:30):**
- La otra cuenta tiene margen desde las 21:10. Retomar «Maqueta» en su MISMA carpeta, rama y puerto
  (`node scripts/relevo-hilo.js .claude/worktrees/maqueta-inicio-3a2a59`, leer su punto arriba de
  `docs/traspaso/LEEME.md` de su rama y `start_session` con `cwd` y `use_worktree: false`).
- **Lo primero al retomar: v0.174.6 está lista en la rama `claude/maqueta-inicio-3a2a59` (commit 0707b36, subida):**
  la app abre con los módulos, los Ajustes del móvil sin scroll y la voz grave en Rondas (1A 2A 3A). Revisarla,
  contársela a Ez en palabras llanas y, con su sí, juntarla con la suite entera (unos 27 min). Al relevo, la
  sesión hizo la maqueta de «Hacerla»: **pregunta 5 de https://claude.ai/artifact/LjDEPtgQssnNm16iZ8EJdA (versión 2,
  commit fa75d9e, subida), sin contestar.** Recomienda 5a A («Un momento para moverte»; B «Un ejercicio antes de
  seguir»; C el ejercicio y lo que dura) y 5b A (dentro del aro: «Mueve · 25 veces», la cifra que cuenta, el glifo
  del módulo con el título y la instrucción; B una hoja abajo). Al montarlo: revisar uno a uno el reparto (unos 48
  ejercicios de 20 rutinas; alguno pide pared o suelo dentro de una rutina que no lo pide) y, sin el día preparado,
  la letra de la instrucción en el aro más bajo. La página es de la cuenta de EcLj6…; desde la otra, página nueva
  desde `docs/proposals/maqueta-inicio-22oct.html` de su rama. La sesión paró al 91 % con la rama limpia.
  Lo que dijo la sesión de v0.174.6, para contárselo a Ez: 1A, sin haber dicho cuánto trabajas se ven los cuatro
  módulos con la tarjeta corta y «Comienza» abre la pregunta; con la semana guardada, la tarjeta dice «Hoy, como
  cada jueves · Jornada entera, 9:00–17:00» y «Comienza» abre ese día; no contestar ya no es «por libre» ni quita
  nada del calendario. 2A, los Ajustes del móvil caben sin scroll y «Tus datos» se abre aparte («Copias, borrar y
  código ›», se vuelve con «‹»); en el ordenador, igual que antes. 3A, la voz grave dice «exhala» en Rondas y sin
  chasquido. Pruebas: tres nuevas (caen 18 de 19 contra v0.174.4), la home sin scroll en 108 casos; su suite dio
  19 caídas por estas mismas decisiones (18 de «A tu ritmo» que esperaban la pregunta al abrir y una de Android),
  ya puestas al día y repasadas (97 y 63 en verde), pero **la suite entera no se volvió a pasar**: al juntar, la
  suite entera con todo junto. Choca la versión en los siete sitios, CHANGELOG, STATE y LEEME (a la más alta). Después, **la maqueta nueva de «Hacerla»**
  (Ez, 22 oct. noche): al pulsar «Hacerla» sale UN ejercicio de los que ya hay en Mueve o Estira (de pie o
  sentado, sin suelo ni material), con su título, su instrucción, su duración propia aunque pase de 2 min y el
  glifo GENÉRICO del módulo, no el del ejercicio; sin consulta a ChatGPT. Ez: «la integración era para tener
  opción a hacerlos con más frecuencia en pomodoros cortos, o no». Propone dos o tres nombres para la
  invitación, porque ya no son siempre dos minutos. Se republica en https://claude.ai/artifact/LjDEPtgQssnNm16iZ8EJdA
  (esta cuenta: desde la otra, página nueva desde `docs/proposals/maqueta-inicio-22oct.html` de su rama).
- Cuando avise de v0.174.6: revisar la rama, contárselo a Ez en palabras llanas y, con su sí, juntarla (los
  choques de versión, a la más alta: main ya está en v0.174.5).
- La hoja de ruta de esta cuenta está al día (https://claude.ai/artifact/EcLj6io4wM9pGjtQ5wd1CT); la de la otra
  (https://claude.ai/artifact/5iWBfHE7kD3dUVocdskmb6) se pone al día publicando el mismo archivo con su `url`.
- La rana: Ez la deja de momento. Las dos de hoy no valían (de lado, rodillas juntas, flecha hacia delante).
  El estilo bueno es el prefijo «Classical anatomical plate…» de `PROMPTS_IMAGENES.md`; la rana se pinta de frente.
- Ez busca testers y tiene dos prompts de ChatGPT: lo legal y lo que falta para cobrar (en el chat). Lo
  que traiga, se comprueba en el código y entra en la cola.

## La cola, por orden

Cuando una sesión acaba y se junta, entra la siguiente de esta lista que no pise archivos de la otra.
El detalle de cada caso está en `STATE.md`, «Deuda conocida».

1. **Los bloques cortos (M2): la invitación** (Ez eligió la propuesta de ChatGPT «por partes»;
   `DECISIONES_PRODUCTO.md`, «Lo que Ez vio en su móvil»). **Maqueta hecha y elegida: 4a A · 4b A (solo con el
   día empezado) · 4c A** (https://claude.ai/artifact/LjDEPtgQssnNm16iZ8EJdA). La monta la sesión «Maqueta» como
   v0.175.0 cuando acabe 1A 2A 3A (ya puede: v0.174.5 está en main), tras la maqueta nueva de «Hacerla» (un
   ejercicio de Mueve o Estira con el glifo del módulo; arriba, «Al relevo») y con el sí de Ez. Las guiadas no cambian. Con la opción «A mi ritmo · Después de cada bloque» para bloques cortos (Ez, gratis; en ese modo las rutinas pueden repetirse, nunca dos seguidas). Toca
   `ritmo.regla.js` (`ritmoComponer`), `state-ritmo.jsx` (`ritmoPrevios`), `ritmo.series.js`
   (`ritmoServir`: la invitación no consume rutinas) y `FocusTimer.jsx`. **Pregunta 5 contestada (22 oct., ~22:15):
   5a A · 5b B con un cambio**: «Un momento para moverte»; «Hacerla» abre una hoja abajo y de ahí la pantalla de
   ejercicio de siempre con uno de los 31 de `docs/proposals/hacerla-reparto.md` (rama de la Maqueta); en el aro, no.
   Pasado a la sesión: tras v0.174.6 en main, fotos de la hoja → runner → vuelta al aro para Ez (republica
   https://claude.ai/artifact/H7mBXKbcv1mR8pVSg61N5d) y, mientras, monta 4a, 4b y 4c. **La segunda parte de lo de ChatGPT**,
   el aviso a mitad de un bloque largo (45 min o más), se mira con Ez después de que pruebe la primera en su
   móvil (`DECISIONES_PRODUCTO.md`, «después de verlo»): sin maqueta todavía.
1b. **Mueve y Estira, revisión de fondo** (Ez, 23 oct., tras probar 0.174.0 en su móvil: «lo más vital y
   prioritario… MUY IMPORTANTE, son dos bloques centrales y tienen que ser originales y útiles»). Comprobado en
   el código: todo lo que nombra existe. Estira = estiramientos, casi yoga o pilates; Mueve = calistenia en un
   cuarto, sin objetos ni tecnicismos. Casos: (a) dibujos que no casan: «Core silencioso» (`extra.core.stealth`),
   «Sentadilla de cuádriceps» (parece un estiramiento de cuádriceps en el suelo: el dibujo vale para un estiramiento
   nuevo), «Rodar hacia abajo» (Ez tiene uno que sí: pedírselo), «Gato-camello» (mejorable), «Puente torácico» (sale a
   dos niveles, no en el suelo), «90/90» (se confunde con «Paloma»), «Sentarse y levantarse del suelo» (no lo
   enseña; el dibujo vale para otro ejercicio); (b) estiramientos dentro de Mueve que ya están en Estira («Apertura
   de pecho», «Juntar omóplatos»…); (c) lo que pide banda o barra («Apertura con banda», «Colgarse»…): que se pueda
   saltar y siga contando, y en su propio grupo «con material», sin mezclarse con lo de escritorio o cuarto (silla y
   pared sí valen para todos); (d) rutinas con títulos distintos y casi los mismos ejercicios: cada una con sentido
   propio, aunque alguno se repita; (e) Mueve pide más fuerza: abdominales, sentadillas, flexiones y parecidos.
   Ez ofrece auditorías de ChatGPT y dibujar los glifos nuevos. **Ez eligió «inventario + ChatGPT»** (23 oct.):
   inventario y texto para ChatGPT en https://claude.ai/artifact/AvZHxJKrvrHQUcJKB2NEqp
   (`docs/proposals/mueve-estira-inventario-23oct.html` y `…-chatgpt-23oct.md`; se rehacen con los dos scripts de
   `docs/traspaso/archivos/mueve-estira-23oct/`). **ChatGPT contestó (23 oct.)**: 26 rutinas (12 Mueve + 14
   Estira), dos ejercicios cada una, 13 gratis, 22 ejercicios nuevos, dosis de entrada bajas; tal cual en
   `docs/proposals/mueve-estira-chatgpt-respuesta-23oct.md`; **su segunda respuesta lo corrige**: tres capas
   (pausas recomendadas, catálogo libre con filtros, rutinas de progresión) y no se borra ningún ejercicio que pase
   la revisión. Primera comprobación y las siete decisiones de Ez en
   `docs/proposals/mueve-estira-comprobacion-23oct.md`. **Lo siguiente: la página para que Ez elija**, con maqueta
   de una rutina nueva en la app. Sin renombrar ids (CLAUDE.md, «los ids van
   cruzados»). Absorbe el «repaso de todos los dibujos» del punto 6 y el punto 7. Va antes que todo lo demás, en
   cuanto entre v0.175.0 (su reparto de «Ver ejercicio», de 31 ejercicios de Mueve y Estira, se rehace con esto).
1c. **Del móvil de Ez, 23 oct.** (0.174.0 de Play; comprobado en el código), cada uno con maqueta salvo N2 y N3:
   **N2** Android: las franjas de arriba (batería) y abajo (Atrás) siguen el modo del móvil (`values-night`) y no la
   paleta de PACE: con PACE en oscuro y el móvil en claro, salen claras. Fallo; arreglarlo pintándolas con la paleta
   (y mirar el iPhone). · **N3** La paleta automática sigue solo el modo oscuro del móvil: la luz nocturna no es modo
   oscuro (no se puede leer desde la app) y no hay cambio por la hora. **Ez eligió «como el móvil»** (23 oct.): no
   se toca; programa el modo oscuro de su Android del atardecer al amanecer.
   · **N4** Con el móvil bloqueado, un aviso fijo con lo que lleva el Foco, el bloque y la pausa que viene (con los
   avisos de Android, punto 11; en iPhone sería otra cosa). · **N5** Un «Auto» en los ejercicios para que avancen
   solos, sin pulsar. · **N6** El número que late en las repeticiones (`pace-rep-pulse`): fijo, con un degradado de
   naranja o rojo a verde según se acerca el final, solo en el número; probarlo. · **N7** «Hasta las HH:MM» debajo de
   «Bloque 1 de X», y el número y «Empezar bloque» más abajo, en proporción (ojo: la home no tiene 26 px libres a
   640). · **N8** Las barras de progreso (las de la barra lateral, a confirmar en la maqueta), con el degradado del
   logo, de naranja a verde según se llenan. · **N9** La barra lateral cuesta volver a ponerla durante un Foco:
   reproducirlo; si no sale, pedir a Ez una frase o una captura. N5-N8 en una sola maqueta.
2. **Montar 1A 2A 3A de la maqueta** (M7, M6, M4) como v0.174.6, en la misma sesión de la maqueta: **lista**
   (0707b36), esperando el sí de Ez para juntarla con la suite entera.
3. **Una página para captar testers de Android, `pacegrass.app/beta`** (idea de Ez, 22 oct. noche; va
   aquí porque los testers fijan la fecha de v1). En español e inglés: qué es PACE, qué se pide (instalar
   desde Play, tenerla 14 días, abrirla y contar qué falla) y PACE completo de por vida como gracias
   (`codigos-tester.csv`). Dos pasos: unirse a un grupo de Google «PACE testers» y abrir el enlace de Play.
   El grupo, como lista de testers de la prueba cerrada en Play Console, junto a «Testers PACE»: así se
   apunta cada uno y PACE no guarda correos. Lo que hace Ez: crear el grupo y añadirlo en Play. Maqueta
   primero. El enlace de Play funciona cuando Google apruebe la prueba cerrada. **Maqueta hecha: Ez eligió
   1A · 2A** (https://claude.ai/artifact/8Vj5rGU6aE9Ewr9JfYFJXL, `docs/proposals/beta-testers-22oct.html`): como
   /premium, con las capturas de Google Play en tira (Ez: «para que luzca más»), y «PACE completo de por vida,
   en la web y en Android» (en Android, con códigos de regalo de Google Play al salir v1). **La A se queda** (Ez: «en el ordenador queda
   perfecto»), **pero con la letra y los botones de PACE**: «la cursiva de los títulos grandes no me convence, las
   letras de los botones son genéricas, todo tiene que tener mucho más estilo PACE». La maqueta calcó /premium, que
   usa EB Garamond y botones genéricos; la app usa Cormorant Garamond por defecto (`data-font="cormorant"`,
   `DESIGN_SYSTEM.md`) y sus propios botones (`--focus-cta`). **Y lo mismo en /premium** (Ez: «con esto
   arreglaremos la tipografía de premium»). Antes de montarlo, un antes/después de los títulos y los botones de
   /beta y /premium, calcados de la app, para que Ez lo vea: **hecho**, https://claude.ai/artifact/KMBL3zRVKHADG5GR5uSKri
   (`docs/proposals/letra-beta-premium-22oct.html`; A Cormorant itálica y el botón de «Empezar» del Foco, la
   recomendada; B la misma letra sin cursiva). **Ez eligió A** («como la app, en cursiva») **y los colores clásicos
   de PACE, si procede, para darle un toque** (los de los módulos en `app/tokens.css`: el oliva del Foco, la
   terracota de Respira, el de Mueve, Estira y Agua). Se montan /beta y /premium a la vez; los colores, con un
   antes/después rápido si cambian algo más que un detalle. **Con `/beta` publicada, la publicación de LinkedIn**
   (idea de Ez, 22 oct.): el texto, en `docs/launch/google-play/testers.md`, «LinkedIn, con la página /beta»;
   la publica Ez, mejor con el grupo creado y la prueba cerrada aprobada. **Ez dijo «júntalas» a /beta y /premium
   (22 oct., ~22:20)**, sobre https://claude.ai/artifact/DH7ZDJ9aSFqEzrpiD5zAyE. **Ojo, Play deja un solo método de
   testers en la prueba cerrada** (la ayuda de Google: lista de correos O grupo de Google): el grupo sustituye a la
   lista «Testers PACE», no va junto a ella; Ez y sus dos testers entran también por el grupo, y el cambio en Play,
   mejor con la prueba ya aprobada. Al juntar, corregir lo que diga «junto a tu lista» (`testers.md` de la rama).
3b. **El iPhone entra en v1** (Ez, 22 oct., ~22:40; `DECISIONES_PRODUCTO.md`, «El iPhone entra en v1»).
   **La cuenta de Apple Developer de Ez está validada (23 oct.)**; espera su llave (`docs/launch/app-store/guia.html`,
   punto 4). **23 oct., tarde**: el trabajo `testflight` de `.github/workflows/ios.yml` ya está (solo a mano, Run
   workflow): archiva sin firmar y exporta firmando en la nube con la llave Administrador (sin certificado ni iPhone
   registrado), y sube. Sin probar: espera que Ez cree la llave «GitHub PACE», apunte su ID de equipo y cree la app
   en App Store Connect (nombre e idioma de Play: `PACE: Pomodoro, Break Reminder`, English U.S.; SKU `pace-ios`).
   **Hecho por Ez (23 oct., tarde)**: el identificador `com.ezradesign.pace` registrado, su ID de equipo apuntado y
   la app creada en App Store Connect (id de Apple 6826321825; su ficha de la versión 1.0 está vacía, se rellena con
   v1). **Primera subida hecha (23 oct., 16:49 UTC)**: 0.175.0 (175000), firmada y subida por el trabajo `testflight`
   («Upload succeeded»); Apple la procesa. **El apartado del iPhone en `privacy.html`, subido con el sí de Ez** (23
   oct.): notificaciones, pantalla encendida, el calendario como archivo, iCloud y lo que TestFlight pasa a PACE.
   **Ez creó el grupo externo «Testers iPhone»** (el «Testers PACE» le salió interno: Apple lo crea así desde el
   enlace del recuadro; el externo, con el + de «Pruebas externas»), rellenó la información de las pruebas, puso «qué
   probar» en inglés y en español y **lo envió a la revisión beta de Apple (23 oct., tarde)**. Falta: que Apple lo
   apruebe, el enlace público en `/beta` (con la maqueta de abajo) y que Ez invite a sus testers. **Ideas de Ez para
   `/beta`** (23 oct.), con maqueta antes: la insignia de Google Play «para que sea más profesional», la parte del
   iPhone con TestFlight (sin logo de Apple: solo deja sus insignias, y la de la App Store es para apps publicadas)
   y los glifos de los módulos en vez de los puntos de color («¡sé más creativo!»). Ez puso los secretos `PACE_ASC_KEY_ID`, `PACE_ASC_ISSUER_ID`, `PACE_ASC_KEY` (el .p8) y `PACE_APPLE_TEAM`
   con `gh secret set` (órdenes con botón; ni la llave ni los códigos por el chat) y se lanza.
   Con ellas, antes que lo que siga en esta cola: la firma y la subida a TestFlight desde GitHub
   (`.github/workflows/ios.yml`, sin Mac), el apartado del iPhone en `privacy.html` (enseñárselo a Ez antes:
   es pública) y el texto de «qué probar»; y una sección iPhone en `/beta` con el enlace público de
   TestFlight, con maqueta antes. Con la Fase 6 (punto 14): la compra de Apple como tercera tienda, la mensual
   como suscripción de Apple, «Restaurar compras», códigos de oferta para los testers, la ficha, las capturas
   y la revisión. Los testers de iPhone no cuentan para los 12 de Play.
4. **Lo que prometemos sobre los datos** (P1-P5, auditoría de privacidad de ChatGPT, comprobada): antes
   de conectar «Avísame» y antes de v1.
5. **La bienvenida y los Ajustes** (A1-A5, A7), después de M6, que también toca los Ajustes.
6. **Los dibujos** que vaya entregando Ez en `dibujos-22oct/` (fuera de git): rana, pica en escritorio,
   rotación torácica de pie, los 5 ejercicios con el dibujo equivocado y los logros
   (`docs/product/GLIFOS_A_DIBUJAR.md`, 30 en total). Comprobar cada uno antes de meterlo: la rana de
   Genspark salió dos veces mal (otra postura, fondo de cuadros pintado, pecho con detalles). Y **un repaso
   de todos los dibujos** (Ez, 22 oct. noche: «Glúteos sentado, sus glifos son de pie»; «Apretar glúteos» ya
   estaba entre los 5): una página con cada ejercicio, su dibujo y lo que dice su texto (sentado, de pie, en
   el suelo), marcando los que no casan; Ez decide cuáles se rehacen.
7. **Más ejercicios de pie para las pausas cortas** (idea de Ez; falta contenido de pie con el aro a 10
   o 15), con maqueta. Ayuda a M2.
8. **La voz de Respira por `<audio>`** (auditoría externa del 21 oct.; estaba en `STATE.md` y faltaba aquí):
   `paceVozIntenta` da por buena la señal antes de que `play()` arranque y, si falla, no suena ni el tono de
   respaldo. Pequeño. Toca `Sound.voz.jsx`, como la 3A: después de juntar v0.174.6.
9. **El puente del calendario de Android**, que se traga los errores (PACE ve un calendario vacío y
   puede volver a crear lo que ya estaba), junto con S6.
10. **Seguridad antes de cobrar** (S1, S2, S4, S5, S6), antes de la Fase 6.
11. **Los avisos de Android** (A1-A4): Ez ya tiene la app en su móvil; preguntarle por los avisos.
12. **La hora y la medianoche** (H1-H5), antes de marzo.
13. **«Qué te ayuda» en Estadísticas**, lo último de pago, con maqueta.
14. Con lo que Ez traiga: la Fase 6 del cobro. **Su lista, la auditoría de ChatGPT del 22 oct. noche,
    comprobada en lo que toca al código: `docs/audits/cobro-chatgpt-22oct.md`** (la tienda web y Play vacías, la
    función de desistimiento, el aviso de fin de prueba de 7 días que Stripe no cubre, el alta en Hacienda y RETA
    antes de vender, «de por vida» y la privacidad con pagos). (Cuenta de Stripe; antes de cobrar, comprobar restaurar la compra, cancelar, sin conexión y el paso desde la beta, y montar y comprobar lo prometido por escrito: las rutinas de pago usadas antes de v1 y la prueba que pide tarjeta. ChatGPT, 22 oct.: el reparto gratis/de pago ya decidido le parece bien; 19,99 € de por vida son 6,7 meses de 2,99 €, así que empuja a la compra de por vida), el llavero del calendario (altas en
    Google Cloud y Microsoft) y el logo nuevo («EVEN» se lee «FVFN»).

**Para ChatGPT** (Ez tiene uso de sobra): ya le di los prompts de «qué pasa cuando sale una versión
nueva», «volver a la app» y «los bloques del día guiado». Lo que traiga se comprueba en el código antes
de creerlo y entra en esta cola. **Repaso del 22 oct., 21:45:** «los bloques del día guiado» volvió y está
decidido (M2, punto 1); las auditorías del 21-22 oct. (datos, «A tu ritmo», calendario, «Tus rutinas»,
pausas, privacidad, cobro) están todas hechas o en esta cola (la voz por `<audio>` y la segunda parte de M2
faltaban: puntos 8 y 1). **Las otras dos, «qué pasa cuando sale una versión nueva» y «volver a la app», no
tienen respuesta apuntada en ningún sitio: preguntado a Ez si ChatGPT contestó.** Los prompts no se guardaron;
si hacen falta, se reescriben.

**Para Ez, por orden**: los testers (y, con la página de arriba, el grupo de Google), la cuenta de Apple
Developer y su llave (el iPhone entra en v1), el gestor para darse
de alta y cobrar, la consulta de ChatGPT de lo legal para cobrar, los dibujos (la rana, en pausa), y cuando pueda: las altas de Google y Microsoft, Stripe, el gestor, el aviso legal, el
logo, copiar sus dos llaves a un disco y la voz «Más»/«More» del suspiro.

## Decisiones de Ez de hoy

- La comida: «B · lo que queda de comida» (`DECISIONES_PRODUCTO.md`), en v0.174.2.
- Dos pestañas a la vez (caso 8 de datos): «A · aceptarlo».
- Calendario: C3 sin pegas; C2 «A · Cuatro casos». En v0.174.3.
- «Tus rutinas»: 1A 2A 3A 4A 5A. En v0.174.4. La pared opcional: «Una pared, si la necesitas».
- Del móvil (`DECISIONES_PRODUCTO.md`, «Lo que Ez vio en su móvil»): logros solo con la sesión entera,
  y «entera» como se montó (v0.174.5). Las pausas con bloques cortos: 4a A · 4b A (solo con el día empezado)
  · 4c A, y al pulsar «Hacerla», un ejercicio de Mueve o Estira con el glifo del módulo (maqueta pendiente).
- La página para testers (`/beta`), en la cola, «en el orden que proceda».
- Privacidad: la respuesta «No» de Play se mantiene (escribir en el calendario lo pide la persona;
  `/premium` no va en el APK); se corrigen las frases que prometen de más.
- **Uso de la cuenta:** «cuando quede un 90 % de esta sesión migramos hacia otra cuenta de Claude sin
  perder absolutamente nada». Leído como 90 % usado.

## Play Console

App creada, ficha y cuestionarios hechos. Prueba cerrada e interna enviadas con 0.174.0. Ez ya instaló la
interna en su Android y la probó (22 oct.). Pendiente de Ez: los correos de los testers (a la lista
«Testers PACE»). Detalle en la memoria `play_console_21oct`.

## Cómo trabajar con Ez

- A «¿qué toca?», una sola cosa. Sin jerga. Las decisiones, con AskUserQuestion y la recomendada primero;
  lo que no se entiende, con una tabla de casos.
- Su página de pasos (`docs/traspaso/hoja-de-ruta-20oct.html`) se republica en cada paso. Hay una por
  cuenta: https://claude.ai/artifact/EcLj6io4wM9pGjtQ5wd1CT en una y
  https://claude.ai/artifact/5iWBfHE7kD3dUVocdskmb6 en la otra; cada coordinadora pone al día la suya.
- Ez pasa auditorías de ChatGPT: comprobar cada punto en el código antes de creerlo, decir qué es cierto,
  qué ya está arreglado y qué no urge, y meterlo en la cola de arriba.
- Las imágenes que Ez pega sí llegan a esta cuenta. Los dibujos van a `dibujos-22oct/`.
- Una sesión solo se puede abrir en un turno que empezó Ez con un mensaje suyo; desde un aviso
  automático, se deja como tarjeta para que Ez la arranque.
- Un mensaje a una sesión dice «queued», no «leído»: comprobar en su rama que una decisión llegó.
