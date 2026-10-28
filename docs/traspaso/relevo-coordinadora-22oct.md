# Relevo de la coordinadora · 22 oct. 2026 (noche)

Coordina desde las 21:35 del 22 oct. la sesión `local_4fd476ac-ed0f-4377-b209-2819ee49933d`, en la cuenta
de la hoja https://claude.ai/artifact/5iWBfHE7kD3dUVocdskmb6 (5 h al 1 % y la semana al 14 % al empezar; se repone
a las 02:30). Antes, `local_40565a0f-bb09-49ec-af11-5f5f20bdc5bb` en la cuenta de EcLj6… (llegó al 91 %),
`local_f20bfd4a-d23a-4420-8608-915558f91136` y `local_7f8a7a6d-68cd-45e8-9548-a7425f60ae05`.
Este archivo es lo que necesita la siguiente para seguir, también desde la otra cuenta de Claude.
**La cola de abajo es la única lista de lo pendiente** (Ez, 22 oct.: «todo lo que vaya quedando
pendiente vete organizando para ir haciéndolo y no perder nada»): lo que aparece, entra aquí.

## 28 oct., mañana: la auditoría de v0.181.1 (coordina la cuenta de 5iWBf…, desde el 27 oct. a las 23:10)

**Si llegas de la otra cuenta, empieza aquí.** `main` está en **0.184.0**: la auditoría y sus documentos, y
encima las tres ramas que esperaban a Ez. Nada a medias en `main`. Las tres ramas que esperaban a Ez ya están en `main`, cada una con
su «júntalo». **Ninguna se junta sin su «júntalo»** (Ez, 27 oct.: «Nunca juntes nada en main sin
mi sí»).
1. **«Qué te ayuda» (0.183.0), en `main` desde el 28 oct. a mediodía** con el «júntalo» de Ez: sin ningún choque (en `main`
   solo había documentos), el `index.html` igual byte a byte al de la rama, y /premium ya dice «Tu mes, tu año y qué
   te ayuda». Su worktree (con el `node_modules` enlazado: `cmd /c rmdir node_modules` antes de quitarlo) y su sesión de
   EcLj6… (`local_a9b8f784-…`), para quitar y archivar con el sí de Ez. **Android a fondo, en `main` como 0.184.0 desde el 28 oct.**
   (Ez la probó en su Android: «va bien, júntalo»): la unión se quedó en 0.183.0 (choques en la versión, los documentos
   y el censo de claves, 1051) y la 0.184.0 va en un commit aparte; la suite entera, 986 en verde. Su worktree y su
   sesión de EcLj6… (`local_d565db9c-…`), para quitar y archivar con el sí de Ez. **El AAB de la 0.184.0, bajado**
   con el sí de Ez a `subidas-play\PACE-0.184.0.aab` (artefacto `pace-play-v0.184.0`; firmado con `PACE-UPL`, 184000 y
   los mismos permisos que la 0.174.0): lo sube Ez a la prueba cerrada con las notas de `SUBIDAS.md`, antes de invitar
   testers. TestFlight sigue en la 0.175.0: el trabajo `testflight`, a mano y con su sí.
2. **`claude/pruebas-medianoche`** (bef9a7d, sin versión), **en `main` desde el 28 oct. con el «júntalo» de Ez** (choque
   solo en la fila de arriba de DECISIONES; la suite entera, 966 en verde): el reloj de la página a `MEDIODIA` en seis archivos de
   pruebas, y una regla nueva en `scripts/verify.pruebas.js`. El CI de cee0095 cayó en `caza-sesiones` («la hora
   oculta», 1 esperado y 0 recibido) porque corrió a las 23:07: lo que esas pruebas adelantan cruzaba la medianoche, y
   la app apuntaba la sesión al día siguiente, como debe. Lo provoqué a las 23:19 y salió en verde con el arreglo a la
   misma hora; los seis archivos dan 60 en verde y `verify` pasa. Su CI:
   https://github.com/ezradesign/Pace_app/actions/runs/40659917411. Explica 4 de las 14 caídas de `main` desde el 18
   oct. (las tres del 21 por la noche). Las otras dos ramas no tocan sus archivos ni traen pruebas que la regla nueva
   haga fallar: se junta limpia en cualquier orden, salvo la fila de arriba de DECISIONES.
3. **La auditoría** (`docs/audits/auditoria-v0.181.1.md`): el código está sano (verify en verde, 955 pruebas, 0 avisos
   de `npm audit`, ningún secreto en git, la web en la 0.181.1) y **la fecha de v1 ya no depende del código**: la fijan los
   12 testers con sus 14 días, que no han empezado, y el alta para cobrar. Encontró piezas decididas que el orden no
   tenía: la valoración de Play, el paso a v1 sin quitar nada, `/recuperar`, lo legal con la función de desistimiento,
   y que `state-compra.js` aún dice que el iPhone no tiene tienda hasta después de v1. El orden nuevo, abajo («El
   orden lógico hasta v1», ya de 17 puntos) y en el ROADMAP.
4. **La hoja de esta cuenta** (https://claude.ai/artifact/5iWBfHE7kD3dUVocdskmb6), republicada desde
   `docs/traspaso/hoja-de-ruta-20oct.html` con «Cómo vamos». La de EcLj6… va un paso por detrás: al volver allí,
   republicarla desde el archivo.
5. **El PC de Ez se durmió de 23:30 a 09:50**: lo que quede corriendo de noche se para, como ya pasó
   el 26 oct. (memoria `coordinadora_26oct`).
6. **Para limpiar, con el sí de Ez**: 16 ramas locales y 16 en GitHub ya juntadas, y 7 worktrees de ramas juntadas
   (`beta-testers`, `caza-sesiones`, `logros-creditos`, `magical-robinson`, `maqueta-inicio`, `beautiful-perlman` y
   `happy-allen`), con copia en un bundle, como el 27 oct. `calendario-reescrita` y `play-rutina-subidas` se guardan.
7. **Cloudflare Pages falló al publicar 4dfd4db y c42ab77** («Build failed», a los 19 y a los 7 min, cuando los buenos
   tardan unos 35 s). No es el código: entre cee0095, que publicó bien, y 4dfd4db no cambió nada de lo que se publica,
   y `node scripts/web-dist.js` funciona aquí (269 archivos, 13,2 MB). Ese día Cloudflare tenía abiertas incidencias
   de red en Ashburn y de Durable Objects. La web siguió en 0.181.1 con `main` en 0.183.0. Se reintenta con el
   siguiente push a `main` o con «Retry deployment» en el panel de Pages (proyecto `paceweb`, de Ez). Antes de dar
   una versión por publicada, mirar `sw.js` en pacegrass.app y el check «Cloudflare Pages» del commit.
8. **Para la cola: `ritmo-pausa-libre:45` cae con la suite entera** (28 oct., en la unión de Android: 1 roja de 989).
   Su bucle avanza el reloj minuto a minuto mientras no ve la pausa, y con el PC cargado se pasa: la pausa del día ya
   había acabado al pulsar «Cambiar», y el botón dice «Empezar otro ciclo» en vez de «Empezar foco». Sola pasa 3 de 3.
   Hay que hacerla esperar a la pausa de verdad, como `ritmo-pausa` y `ritmo-pausa-entera`, que caen igual.

## AL RELEVO (27 oct., ~23:10 en España; cuenta de EcLj6… con las 5 h al 91 % y la semana al 24 %; se repone a la 01:10)

**Si llegas de la otra cuenta, empieza aquí.** `main` está en **0.181.1** (6185951), con el CI entero en verde (CI,
Android e iOS). Nada a medias en `main`. Las dos ramas de abajo están terminadas, limpias y subidas a GitHub, y
esperan a Ez. **Ninguna se junta sin su «júntalo»**.
1. **«Qué te ayuda» (0.183.0)**: rama `claude/que-te-ayuda-maqueta-6c3534` en 5244961, worktree
   `.claude/worktrees/que-te-ayuda-maqueta-6c3534`, 966 en verde. Ez estaba mirando las fotos al relevar:
   https://claude.ai/artifact/1p6iNP6KVETGEBuZKxRPY5. Es de esta cuenta, así que desde la otra sale 404; Ez la ve aquí
   o te dice lo que vio. Va primero.
   - Al juntar, cambia en /premium «Tu mes y tu año» para que nombre «Qué te ayuda».
   - Su `node_modules` es un ENLACE al del repo. Quítalo con `cmd /c rmdir node_modules` (nunca con un borrado
     recursivo) antes de quitar el worktree.
2. **Android a fondo (0.182.0)**: rama `claude/android-a-fondo-6edf2e` en fc7e666, worktree
   `.claude/worktrees/android-a-fondo-6edf2e`, 974 en verde. Espera a que Ez lo pruebe en su móvil.
   - El APK «PACE prueba» es `pace-android-debug`, en https://github.com/ezradesign/Pace_app/actions/runs/40580116946.
   - Los seis puntos ya se los di a Ez: aviso con el móvil bloqueado; al final, un solo sonido; lo mismo cerrando
     PACE; pausar y que no llegue aviso; activar avisos con Ajustes abierto; la pausa como «Privado» en Google Calendar.
   - Si entra después de la 0.183.0, la unión se queda en 0.183.0 y la sube a **0.184.0 en un commit aparte**,
     con su línea en CHANGELOG.
3. **Al juntar las dos** chocan los siete sitios de la versión, STATE, CHANGELOG, LEEME, DECISIONES y el censo de
   claves de `verify` (1041 en la de «Qué te ayuda»). Después: `verify`, build, la suite entera en un puerto libre,
   push y `gh run watch`. Usa el resolvedor de siempre: lo de la rama arriba y lo de `main` debajo.
4. **Las sesiones de esta cuenta no se ven desde la otra**, y no hacen falta para juntar: las ramas están en este
   PC y en GitHub. Si hay que tocar algo en una rama, `start_session` con `cwd` en su worktree, diciéndole qué falta y
   que lea su `git log`.
   - Las tres sesiones de esta cuenta, para archivar con el sí de Ez y solo desde aquí: `que-te-ayuda`
     (`local_a9b8f784-…`), `android-a-fondo` (`local_d565db9c-…`) y `mueve-y-estira-los-texto` (`local_f17856c9-…`, ya
     en `main`; su worktree `magical-robinson-ced87d` se puede quitar).
5. **La hoja de Ez en la otra cuenta** (https://claude.ai/artifact/5iWBfHE7kD3dUVocdskmb6) va vieja. Al llegar,
   republícala tal cual desde `docs/traspaso/hoja-de-ruta-20oct.html`, que es la buena (la de aquí, EcLj6…, va en la
   versión 61).
6. **Espera el sí de Ez**: bajar el AAB a `subidas-play\` para la prueba cerrada antes de invitar testers. Mejor el de
   la versión que quede tras juntar las dos.
7. **Para después**, ya en la cola:
   - en el iPhone, los mismos cuatro fallos de los avisos (`app/ui/ios.js`);
   - el aviso de fin en Android, que no nombra la pausa de «A tu ritmo»;
   - los botones de verdad del aviso (la C de N4);
   - `generar-pendientes.js`, que cae al arrancar;
   - las seis fichas con la colocación que no se ve (lo decide Ez);
   - los 16 dibujos de la página https://claude.ai/artifact/6RsAsyovu4emmzHhWjhMLT (de esta cuenta; el porqué y la
     cuenta de 38, en `docs/product/GLIFOS_A_DIBUJAR.md`).

## 27 oct., tarde: 0.180.0 y 0.181.0 en main (coordina la cuenta de EcLj6…, desde las 10:20)

1. **Retomadas desde esta cuenta.** Las suites que dejó la otra cuenta seguían como procesos `node` sin navegador
   (huérfanas: nunca acaban). La bienvenida, en una sesión nueva en su worktree (`local_abf2e28b-…`,
   `bienvenida-0180`), cerró la 0.180.0 (75ec512): 930 en verde y las fotos
   https://claude.ai/artifact/RGuZouekZoBxCLdedtpmbH. La hora, comprobada aquí: 918 en verde y cinco rojas por correr
   a la vez que la de la bienvenida, que pasan solas. «Hacer la pausa» y la pausa larga caían igual en `main`.
2. **Ez: «junta la bienvenida y después la hora»** (tras mirar las fotos). Merges d7863fe y 749423f. Choques solo en
   la versión, CHANGELOG, DECISIONES, STATE y LEEME. Con todo junto, `verify` en verde y la suite entera en el 8807:
   949 en verde, 2 saltadas (las de Web Audio en WebKit) y ninguna roja, en 23,5 min.
3. **Lo siguiente de la cola**: la sesión pequeña de los textos de Mueve y Estira con la revisión de ChatGPT (punto 4
   del bloque de abajo) y, con la 0.180.0 ya en `main`, **Android a fondo** (punto 7), con el móvil de Ez. Los textos,
   **en `main` con 0.181.1** (merge 01d4705, con el «júntalo» de Ez sobre
   https://claude.ai/artifact/9Y61HfjdAKzQGKJFGNKUPq), de la sesión `local_f17856c9-…` (worktree `magical-robinson-ced87d`,
   puerto 8808). Sin choques; el `index.html` junto, igual byte a byte que el de la rama (953 en verde). Hallazgo suyo:
   seis fichas tienen la colocación escrita y no se ve nunca (tras un descanso no sale); otra tanda si Ez quiere.
4. **Limpieza, con el sí de Ez**: la sesión `bienvenida-0180`, archivada. Las ramas `claude/bienvenida-ajustes-6e6e31`
   y `claude/gracious-pascal-ea1249`, borradas aquí y en GitHub, con copia en `PACE-ramas-borradas-27oct.bundle`, junto a
   la carpeta del proyecto. Sus dos worktrees (`mueve-estira-capas-e9ab74` y `premium-capturas-c316bb`), quitados
   cuando se pararon los seis procesos `node` huérfanos de las 9:39 y las 9:46 (el modo automático no dejó pararlos
   antes de que Ez lo pidiera). El 8805 y el 8806, libres otra vez.
5. **El CI de 3bde26f cayó en `eventos-backup`, y no era la app** (Ez: «analicemos esto»). `page.waitForFunction(async …)`
   no espera en Playwright 1.62.1 (vuelve en ~20 ms con `false`): once esperas así en siete archivos. Provocado con la
   lectura de la copia 300 ms más lenta (5 de 5 rojas) y con una espera de verdad (5 de 5 verdes). Arreglado sin versión
   con `esperarEnPagina` (tests/helpers.js) y vigilado por `scripts/verify.pruebas.js` (fila arriba de DECISIONES); la
   suite entera, 953 en verde. Lo que hoy parecía «carga» en `sw-aviso`, `eventos-origen` y `ritmo-pausa-entera` pudo ser
   esto: si vuelven a caer, ya no hay esa excusa.
6. **Los dibujos**: página con los 16 de ejercicios para Ez (https://claude.ai/artifact/6RsAsyovu4emmzHhWjhMLT); no se
   dibujan Sentadilla de cuádriceps ni Puente torácico (Ez, 27 oct.). Ninguno está aún: ni en la app, ni en sus carpetas
   «Glifos de ejercicios…» junto al proyecto, ni en `dibujos-22oct`. **Pendiente mío**: `node scripts/glifos/generar-pendientes.js`
   cae al arrancar (`ERR_INVALID_ARG_TYPE`), así que `GLIFOS_EJERCICIOS_PENDIENTES.md` es de antes de los seis nuevos.
7. **Abiertas a la vez con el sí de Ez** (27 oct., tarde), cada una en su worktree:
   | Sesión | id | Puerto | Lleva |
   |---|---|---|---|
   | Android a fondo | `local_d565db9c-8b1e-43b5-a7be-6d72695956b3` (`android-a-fondo`) | 8805 | 0.182.0: A1-A4, el puente del calendario (C2/S6), lo privado en el calendario del móvil con su pieza nativa, y N4 con maqueta antes |
   | «Qué te ayuda» | `local_a9b8f784-d298-4701-a4ca-1e1e1e08ab63` (`que-te-ayuda`, rama `claude/que-te-ayuda-maqueta-6c3534`) | 8806 | Maqueta https://claude.ai/artifact/6e5BmLDHsLmYPqmVtX26eD (b820213); **Ez eligió 1A 2A 3A** (tres ideas, «Todavía es pronto», pestaña propia con candado); la monta como 0.183.0. Su `node_modules` es un ENLACE al del repo: quitarlo como enlace antes de archivar |

   **Las dos, terminadas en su rama y sin juntar** (27 oct., noche): «Qué te ayuda» 0.183.0 en 5244961 (966 en verde;
   fotos https://claude.ai/artifact/1p6iNP6KVETGEBuZKxRPY5; /premium sigue diciendo «Tu mes y tu año», cambiarlo al
   juntar) y Android a fondo 0.182.0 en fc7e666 en `claude/android-a-fondo-6edf2e` (974 en verde; APK «PACE prueba» en
   https://github.com/ezradesign/Pace_app/actions/runs/40580116946, `pace-android-debug`; Ez lo prueba con seis puntos).
   Al juntar las dos chocan la versión, STATE, CHANGELOG y el censo de claves de `verify` (1041 en la de «Qué te ayuda»).
   **Para después, de Android a fondo**: el iPhone tiene los mismos cuatro fallos de avisos (`app/ui/ios.js`, sin
   tocar) y el aviso de fin en Android dice siempre «Foco completado» sin nombrar la pausa de «A tu ritmo».
   Android a fondo: Ez eligió **N4: A · N4b: A** sobre https://claude.ai/artifact/7UeHuMypeom7TinrAXoKpL («Vale la A
   ahora»; le gustaba la C «si los botones funcionan», pero su «Pausar» abría PACE: los botones de verdad, más adelante
   sobre la misma pieza nativa).
   Espera el sí de Ez: bajar el AAB de 0.181.1 a `subidas-play\` para la prueba cerrada antes de invitar testers.

## 27 oct., mañana: el relevo, listo (coordina `local_2f317ec7-3cae-4cf2-95a0-d66cc703d4d2`, cuenta de 5iWBf…)

**AL RELEVO (27 oct., 10:10 en España, esta cuenta con las 5 h al 91 % y la semana al 25 %; se repone a las 14:00).**
Nada a medias en `main`: ninguna rama se ha juntado, y los documentos están subidos.
- **La bienvenida (0.180.0)**: paró al 88 % con un «wip», 05438b6, subido a `claude/bienvenida-ajustes-6e6e31`, en el
  worktree `.claude/worktrees/mueve-estira-capas-e9ab74`, puerto 8805.
  - Hecho: 1C (visita de cuatro paradas; de la B solo entra «Al acabar, PACE te propone una pausa corta…» en la
    parada del aro), 2A (PACE completo «abierto hasta v1» al final, con los precios de la tienda del canal y un solo
    «Comenzar»; en Android e iPhone, sin importe) y 3A («Tus datos» plegado por debajo de 860 px de alto, «Copias,
    borrar y PACE completo», interruptor de 40×24, textos sin JSON ni «backup», y avisos de PACE en vez de los del
    navegador, vigilados por `verify`).
  - Falta: una línea en `tests/eventos-barrera.spec.js`, relanzar sus pruebas (quedaban 6 rojas, arregladas en el
    wip sin confirmar), la fila de DECISIONES, el bump a 0.180.0 con CHANGELOG, STATE y LEEME, la suite entera en el
    8805 y la página de fotos para Ez.
- **La hora y la medianoche (0.181.0)**: commit edae192 subido a `claude/gracious-pascal-ea1249`, con H5 según la A,
  y `verify` en verde. Al relevar, su suite entera seguía corriendo en el 8806, así que no se da por buena sin mirarla.
  Se junta con el sí de Ez, después de la 0.180.0 o antes si esta tarda; los choques, solo en los sitios de la versión
  y en el CHANGELOG.
- **Desde la otra cuenta** no se ven estas sesiones. Para seguir cada una, `start_session` con `cwd` en su worktree,
  diciéndole qué falta y que lea su `git log`.

**Si llegas de la otra cuenta, empieza aquí.** `main` está en 0.179.0 con el CI en verde entero. Del 24 al 26 oct.
entraron 0.175.2, 0.176.0, 0.176.1, 0.176.2, 0.177.0, 0.178.0 y 0.179.0 (el detalle, en «El orden lógico hasta v1»,
puntos 1-6). **Regla de uso de Ez (27 oct.)**: al 85 % de uso, todo listo para cambiar de cuenta: cada sesión hace
commit «wip» y push de su rama, y la coordinadora deja este bloque y la hoja al día y sube los documentos.
1. **La bienvenida y los Ajustes (punto 8)**: Ez eligió **1C 2A 3A** sobre https://claude.ai/artifact/6p1BHbVqSrgtwnJgrXWLka,
   con esta nota: «1C (creo que es la que más explica para nuevos usuarios aunque a lo mejor puede añadir o
   complementar explicaciones que se encuentran en la B)». Pasado a la sesión, que lo monta como 0.180.0: la C de
   base, lo que falte de la B solo si cabe sin scroll a 360 px y señalado en las fotos. A1-A5 y A7 ya están arreglados
   en su rama, con 0.179.0 dentro. Al acabar: fotos para Ez y, con su «júntalo», unión con la suite entera.
2. **La hora y la medianoche y la voz de Respira (punto 10)**: propuesta como segunda sesión (tarjeta `task_ae9c2c5d`,
   la abre Ez). Va antes que «Android a fondo» (punto 7) porque este toca `app/ui/android.js` y los Ajustes, lo mismo
   que la bienvenida: Android a fondo, en cuanto la 0.180.0 esté en `main`, con el móvil de Ez.
3. Sin archivar todavía, ya juntadas: `seguridad-cobro` (`local_4168f925-…`) y `privacidad` (`local_7ca2e612-…`).
4. **La revisión de ChatGPT de los textos nuevos de Mueve y Estira volvió** (Ez, 27 oct.), comprobada contra el código
   en `docs/proposals/mueve-estira-chatgpt-revision-respuesta-27oct.md`. No sube ninguna dosis.
   - Aporta cinco fichas con un fallo de verdad: muñeca, desliza el talón, gateo, círculos de brazos y remo con
     banda. Además, colocaciones que faltaban y el inglés que suena traducido.
   - Falta en PACE el aviso común de parar con dolor o mareo, en «Antes de empezar».
   - El descanso entre series y no proponer solas las pausas de suelo ya estaban.
   - **Se monta en una sesión pequeña en cuanto acabe una de las dos de ahora** (como 0.181.1 o la que toque), con
     fotos antes/después para Ez. Toca `app/move/move.data.js`, `app/extra/extra.data*.js`,
     `app/i18n/content/*` y `sessions.body.js`. Las frases de ChatGPT, cortas y con el tono de PACE.
5. **H5, el Foco que acaba antes de medianoche con PACE cerrado o el portátil dormido**: Ez se queda con la 2, la A
   del 12 oct. (27 oct., con la opinión de ChatGPT). Vuelves el mismo día: cuenta. Vuelves al día siguiente: no
   cuenta. Nunca se apunta al día siguiente. Pasado a la sesión de la hora. **Idea para después, con maqueta**:
   preguntar al volver «Este Foco terminó mientras no estabas. ¿Lo completaste?» y, si dices que sí, apuntarlo el día
   en que acabó.

| Sesión | id | Rama | Puerto | Versión | Lleva |
|---|---|---|---|---|---|
| La bienvenida, un onboarding y los Ajustes | `local_26a8e10e-3544-474b-80d8-94f446d81999` (`bienvenida-ajustes`) | `claude/bienvenida-ajustes-6e6e31` (worktree `mueve-estira-capas-e9ab74`) | 8805 | 0.180.0 | Parte 3 con 1C 2A 3A; toca `app/onboarding/*`, `app/tweaks/*`, `RitmoSemanaTipo.jsx`, `app/ui/android.js` |
| La hora y la medianoche, y la voz de Respira | tarjeta `task_ae9c2c5d`, sin abrir | la suya | 8806 | 0.181.0 | H1-H5 con prueba que falla antes, y la voz por `<audio>`; nada de los archivos de la otra |

## 23 oct., noche: coordina la cuenta de 5iWBf… (desde las 19:45)

Al empezar: 5 h al 1 %, **la semana al 27 %** (se repone el 26 oct. hacia las 18:00). Ninguna sesión abierta.
1. **Subidos los tres commits que la de EcLj6… dejó sin subir** (e65b9d0 Safari con más margen, b63eb7e /premium
   refinada con el sí de Ez, 2ec16f8 la hoja), tras el CI de 907e78b en verde entero y `verify` en local. El CI de
   v0.175.1 (65a56b2) había caído solo en «Librerías de WebKit», sin prueba roja: es lo que arregla e65b9d0.
2. **Mueve y Estira: la página para elegir, publicada** (https://claude.ai/artifact/9L6RZTPCYpZH57iywsNnHE,
   `docs/proposals/mueve-estira-elegir-23oct.html`). Fotos de la app real (index.html de v0.175.1) con la propuesta
   metida en el index antes de montar la app (`page.route`), así que los filtros y «Para ahora» cuentan con ella.
   Guiones en `docs/traspaso/archivos/mueve-estira-23oct/` (`propuesta.js` con los datos de cada opción, `fotos.js`,
   `pagina-elegir.js`). Cuatro decisiones, la A recomendada en todas: **1** nombres, cuentas y los ~40 avisos de
   ChatGPT ya (versión pequeña) · B solo nombres y cuentas · C todo con la 2. **2** tres capas: «Para empezar» (10
   pausas que rehacen las rutinas de hoy parecidas, con su id: Sentadillas de silla, Flexiones de escritorio, Piernas
   de pie, Cuello, Hombros · círculos, Muñecas y manos, Columna en la silla, Cadena posterior de pie, Despertar
   matinal, más «Fuerza en suelo» nueva), Sigilo, «Con material» («Espalda con banda» nueva y Colgarse) y «Para ir a
   más»; Postura reset, Grip + antebrazos y Espalda de oficina pasan a Estira; ATG y Ancestral dejan de salir; los
   cuatro ambiguos salen de sus rutinas · B solo añadir las diez encima. **3** seis ejercicios nuevos (remo con banda,
   remo con tu mano, bisagra, desliza el talón, inclinación de tronco, gemelo en pared) · B cinco · C ninguno; los
   encogimientos, solo si Ez los pide. **4** «Para empezar» entera gratis · B lo nuevo de pago. Lo que hoy es gratis
   sigue gratis (promesa de /premium). **Espera la línea de Ez**; con ella, la 1 va en una sesión pequeña y la 2 y la
   4 en otra (rehace también el reparto de «Ver ejercicio» y lo que propone «A tu ritmo»).
3. **Ez eligió 1A 2A 3A 4A** (23 oct., ~20:15; apuntado en `DECISIONES_PRODUCTO.md`, «Mueve y Estira, cómo
   quedan»). 1A y 2A tocan los mismos datos, así que van en UNA sesión, una versión detrás de otra.
4. **El CI de 2ec16f8 cayó** en `bloques-cortos` 4c (aro a 15): el sello de «first.step» tapa la línea del aro y en
   el CI llegaba entre ver la frase y contarla. Arreglado en d255367 sembrando ese logro (medido: sin sello en 15 s;
   26 de 26 dos veces). Safari agotó otra vez sus 22 min bajando del espejo de Azure a ~40 KB/s: el segundo intento
   pasa al espejo de Ubuntu (mismo commit). Mirar que el CI de lo subido salga verde.

| Sesión | id | Rama | Puerto | Lleva |
|---|---|---|---|---|
| Mueve y Estira: textos y tres capas | `local_0812deb0-b9e7-4f39-b952-98fef14eacff` (`mueve-estira`) | `…mueve-estira-capas` | 8805 | Parte 1: v0.175.2, los textos (1A), con fotos antes/después; avisa con el hash y sigue. Parte 2 en la misma rama: v0.176.0, capas, seis ejercicios y gratis/pago. Se junta la 1 sola (hasta su commit) con el sí de Ez |
| Capturas de lo de pago para /premium | `local_28ad6083-ff54-4f52-9df4-a5619be68930` (`capturas-premium`) | `…premium-capturas` | 8806 | 5c: capturas (Tus rutinas, la carta, mes y año, una de Respira) y maqueta con 2-3 formas; espera a que Ez elija. Solo `premium/`, `scripts/play/`, `scripts/web-dist.js` y sus pruebas |

5. **/premium con las capturas, en main** (merge 3830f94, ~21:15): Ez eligió la B «mosaico, optimizando para móvil»
   en la propia sesión (sobre https://claude.ai/artifact/EbyxaxDviP1kb5HvQHhQXR) y dijo «júntalo» viendo las fotos de lo
   montado. Sin versión nueva (la app no cambia). Con todo junto: verify y las 20 pruebas de /premium, /beta, el
   artefacto y las cabeceras en verde; la suite entera, la del CI. La sesión `capturas-premium`, archivada el 24 oct. con el
   sí de Ez (antes se quitó su `node_modules`, que era un enlace, con `[System.IO.Directory]::Delete`). El CI de
   884304c, verde entero, también Safari.
   **24 oct., 10:05**: la sesión `mueve-estira` se paró anoche por el límite de uso con un wip subido (abbc9d9, la
   parte 1 casi cerrada); retomada con un mensaje, que también le pide juntar `origin/main` antes de cerrar la parte 1.
   Safari: el segundo intento de b6afcae seguía contra Azure porque el runner lee `/etc/apt/apt-mirrors.txt`; b403b65 lo
   quita de ahí. Mirar el registro del CI: imprime la lista de espejos.
6. **24 oct.: v0.175.2 en main** (merge 8e3c789 de 487a7c8, con el «júntalo» de Ez sobre
   https://claude.ai/artifact/GfpUt5usTb9DJtR3JRAC2c). Suite entera en Chromium con todo junto: 822 en verde. Ez eligió
   **A para los logros de ATG y Ancestral** (https://claude.ai/artifact/CZmu2xWwyid26tEG6gn1Ei; `DECISIONES_PRODUCTO.md`),
   pasado a la sesión con un aviso para «Fuerte en la oficina» (`explore.all.extra`, todas las rutinas de Mueve).
   La sesión sigue con la parte 2 (0.176.0) en la misma rama: al juntarla, solo lo que va después de 487a7c8.
7. **24 oct., ~11:20: pausa por uso** (5 h al 95 %, se repone hacia las 15:00; semana al 53 %). La sesión
   `mueve-estira` paró al 93 % con la parte 2 en wip bdd2192 (subido; su punto arriba de `docs/traspaso/LEEME.md` de
   la rama): falta la suite entera, las fotos (`fotos-2.js` escrito), su página, el commit final y el aviso. Al
   reponerse, retomarla con un mensaje. No juntar nada de la parte 2 hasta su aviso y el «júntalo» de Ez.
8. **25 oct., ~10:00**: `mueve-estira` retomada para cerrar la parte 2. Ez preguntó si estaba arreglado todo lo
   de sus dos listas del móvil: la del 22 (M1-M7), todo hecho (0.174.5, 0.174.6, 0.175.0); la del 23, Mueve y Estira en
   marcha y N2-N9 pendientes. Con su sí, sesión **`franjas-maqueta`** (`local_30f25719-da75-47f8-bacc-9df789a93186`,
   rama `…franjas-maqueta-n5-n8`, puerto 8806): N2 arreglado sin versión (la pone la coordinadora), N9 solo
   investigar, maqueta de N5-N8 sin tocar la app (N5 y N6 viven en el runner, que es de `mueve-estira`). Ez tiene un
   dibujo de «Rodar hacia abajo» que sí casa: pedírselo a `dibujos-22oct`.
9. **En cuanto 0.176.0 esté en main: la revisión de ChatGPT de los textos nuevos** (Ez, 25 oct.: «sí, y avísame para
   cuando tenga que mandarla»). Sacar con un script del catálogo ya junto las fichas de los seis ejercicios nuevos y las
   diez pausas de «Para empezar» (colocación, cómo, cuidado y dosis, en español y en inglés), y darle a Ez una página
   con el texto y un botón «Copiar», AVISÁNDOLE de que ya toca mandarla. Lo que conteste se comprueba en el código y
   contra la base NHS/ACSM/OMS antes de creerlo, y entra en esta cola. Ninguna otra auditoría general por ahora: la
   cola ya tiene trabajo auditado de sobra.
9b. **25 oct., ~11:30: v0.176.0 en main** (merge d07221b de c9be19f, con el «júntalo» de Ez sobre
   https://claude.ai/artifact/M32hjPa2qFUZDNfaURn8dQ). Choque solo en STATE.md, juntado a mano. Suite entera en
   Chromium: 825 en verde y 1 caída por la herramienta (`pestanas-estado`, «Resulting promise was garbage
   collected»), que sola pasa 18 de 18. **Revisión de ChatGPT publicada y avisada a Ez**
   (https://claude.ai/artifact/DuBukvPPSULtiMdtJ9nTn1, `docs/proposals/mueve-estira-revision-chatgpt-25oct.md`). Lo que
   traiga se comprueba y entra en la cola. Los prompts de los dibujos, en https://claude.ai/artifact/EkSbpYm7dZYL96ddioiFiM.
   La sesión `mueve-estira` terminó: archivarla con el sí de Ez (quitar antes su `node_modules` si es un enlace).
9c. **25 oct., ~11:40: uso al 87 % de las 5 h** (se repone hacia las 14:40; semana al 65 %). `franjas-maqueta`:
   N2 hecho (7c7d357; verify, sus e2e y las compilaciones de Android e iPhone en verde), N9 no sale, la maqueta N5-N8
   con las fotos hechas y la página a medias; wip d704826 en `claude/franjas-maqueta-n5-n8-7312c7`, sigue hasta el 95 % y
   deja lo que falte en `docs/traspaso/archivos/franjas-maqueta-25oct/LEEME.md`. La sesión de seguridad y cobro web
   NO se ha abierto todavía: se abre con el «sí» de Ez cuando haya uso.
9d. **25 oct., ~11:50: Ez eligió en la maqueta N5-N8** (https://claude.ai/artifact/MLCNMXzaDjwLiZ2K1Rmero), tal cual:
   «1A + 2A (pero con el número bien centrado, a veces da toc ver que el 4 o el 7 o el que sea va más por debajo que el
   resto) + 3C en cursiva pero todos los elementos incluido el botón tienen que bajar un 15 % más + 4B queda más fino así
   que con degradado». Lo del número: las cifras de Cormorant son de estilo antiguo (el 4, el 7 y el 9 bajan de la línea);
   con `font-variant-numeric: lining-nums` quedan alineadas, como en /beta. Al reponerse el uso (14:40): pasar
   esto a la sesión `franjas-maqueta` para montarlo en su rama (el runner ya es libre: 0.176.0 está en main), y juntar N2:
   **Ez dijo «sí, júntalo» a N2 (7c7d357) el 25 oct., ~11:55**, al tope de uso: juntarlo a las 14:40. La sesión de seguridad y cobro web, sin abrir. Uso al 95 %.
9e. **25 oct., ~15:45 (uso repuesto): v0.176.1 en main** (merge dcd68a8 de 70709e5, N2 con el «júntalo» de Ez):
   suite entera 830 en verde; choque solo en `DECISIONES_TECNICAS_VIGENTES.md`, se quedan todas las filas. La elección
   de N5-N8 pasada a `franjas-maqueta`, que la monta como 0.176.2. La 4B es «la B tal cual», más elegante, no más
   estrecha: era mala lectura mía, y la sesión lo vio. Abierta **`seguridad-cobro`**
   (`local_4168f925-798b-4dbc-8bab-7defdb4e4bae`, rama `…seguridad-cobro-web`, puerto 8807): parte 1, S1 S2 S4 S5 S6 como
   0.177.0, que se junta sola; parte 2, maqueta de gracias, aviso de fin de prueba y «Gestionar», y luego k2 y lo
   demás sin Stripe. `mueve-estira` sigue sin archivar (falta el sí de Ez).
9f. **25 oct., ~16:15: Ez dijo «junta las dos»** (0.176.2 de `franjas-maqueta`, e85ec4c, sobre
   https://claude.ai/artifact/9RJYVucfQrGgJztT2dN3GG; y la seguridad 0.177.0 de `seguridad-cobro`, 380ba88). **Sin juntar
   todavía: uso al 94 %**, se hace a las ~20:00. Primero e85ec4c y luego 380ba88; los choques de versión, a la más alta
   (0.177.0, con las dos líneas en el CHANGELOG); la suite entera con las dos dentro y push. Al intentarlo apareció que
   el bump de 0.176.1 no había entrado en el commit de la unión: arreglado en 40b14f2. **Tras `npm run bump` en
   mitad de una unión, `git add` de los siete sitios antes del commit.**
9g. **26 oct., ~15:50: 0.178.0 en main** (cobro web, merge d6dc3fd; suite 876 en verde). Semana al 93 % (se repone
   a las 18:00). Ez: «sigue hasta acabar la sesión y cuando se reinicie ya continúas aquí». **Al reponerse, aquí
   mismo**: abrir la sesión de **lo que prometemos sobre los datos** (P1-P5, punto 4; más /api/renovar, que solo usa la
   mensual cerca del fin de su código, y la huella de IP de una hora de «Avísame»), con antes y después de
   `privacy.html` para Ez antes de tocarlo. La sesión `seguridad-cobro` terminó: archivarla cuando Ez lo diga (lo
   preguntado, sin respuesta clara).
10. **Lo siguiente en cuanto acabe `mueve-estira`** (Ez, 25 oct.: «justo detrás de Mueve y Estira: primero la
   seguridad y luego lo de cobrar en la web que no necesita Stripe»). Una sesión, en este orden:
   - **Seguridad** (punto 10 de la cola de abajo): S1 `premiumUnlocked` abre sin compra, S2 licencia aceptada antes de
     verificarla, S4 «Avísame» sin límites, S5 CSP y S6 los eventos de Android por texto. S3 (código portable) es de Ez.
   - **Cobrar en la web sin Stripe** (Fase 6, `ROADMAP.md`; `docs/audits/cobro-chatgpt-22oct.md`, «3. Lo que tiene
     que hacer la app»):
     - el aviso dos días antes del fin de la prueba, desde la licencia;
     - «Gestionar» en Ajustes: Play en Android; en la web, oculto hasta tener el enlace del portal;
     - la página de gracias;
     - la función de Cloudflare que firma con k2, probada con pagos inventados (k2 la genera Ez con un guion en su
       PC y la pone como secreto; ni la llave ni los códigos por el chat);
     - sin conexión: «sin red» frente a «caducada».
   - Lo de Stripe (enlaces de pago, secreto del webhook, portal) queda como una pieza fina que se enchufa con la cuenta.
     Se abre cuando `mueve-estira` acabe su trabajo, para no pasar de dos sesiones trabajando a la vez.
11. Después, por orden de Ez: cuando Apple apruebe la prueba de TestFlight, su enlace en /beta (5b); y lo que siga en
   la cola.

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
5c. **`/premium`, refinada como `/beta`**: hecha en la cuenta de EcLj6… con Ez subiendo el tope al 97 % (maqueta
   https://claude.ai/artifact/XxaqNNuG9n1A9TXiggUWyC): logo grande, dibujos de los módulos, pie con «Contacto», «+» en
   las preguntas, sin el rótulo «PACE · Foco · Cuerpo» y el iPhone junto a Android (también en «Avísame» y en
   `privacy.html`: «a Google Play y a la App Store»). **Falta, de Ez (23 oct.): «capturas de las funciones premium y
   hacerla más visual»**: no hay capturas de lo de pago (las de Play son jornada, pausa, Respira, Estira, Foco y
   logros). Sacar «Tus rutinas», la carta del lunes, tu mes y tu año y una rutina honda, en es y en, a 540 px en
   WebP como la tira de `/beta` (guion como `docs/launch/google-play/capturas.js`), y una tira o un mosaico en
   /premium, con maqueta. Lo que se propuso al principio: el logo
   grande, los dibujos de los módulos en vez de puntos, el pie nuevo con «Contacto», el «+» verde en las preguntas y
   las cifras alineadas, como `/beta` (copiar sus reglas, que ya pasaron la revisión de Ez); y el iPhone donde hoy solo
   dice Android o Google Play (los textos de «Avísame» y su aviso de privacidad nombran solo Google Play: con el
   iPhone en v1, también la App Store). Lo que cambie de privacidad, enseñárselo a Ez antes.
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

### El orden lógico hasta v1 (Ez, 25 oct.: «ordena el roadmap de la manera más lógica»)

**Manda sobre la numeración de abajo**, que se queda como detalle de cada punto. Es el mismo orden que el camino de la
hoja de Ez. El criterio: primero lo que ya está en marcha; luego lo que otro punto necesita, como la seguridad
antes de cobrar o los precios antes de la bienvenida; lo que espera algo de Ez, cuando llegue; lo pequeño, en los
huecos.
1. ~~Mueve y Estira~~ **HECHO** (0.175.2 y 0.176.0, 24-25 oct.), con los retoques de la revisión de ChatGPT en la
   0.181.1 (27 oct.). Quedan los dibujos de Ez (https://claude.ai/artifact/6RsAsyovu4emmzHhWjhMLT, de la cuenta de
   EcLj6…).
2. ~~N2 y la maqueta de N5-N8~~ **HECHO** (0.176.1 y 0.176.2, 25-26 oct.). N9 no se reproduce: espera un vídeo de Ez.
3. ~~La seguridad de PACE completo~~ **HECHO** (0.177.0, 26 oct.; S1, S2, S4, S5, S6).
4. ~~Cobrar en la web sin Stripe~~ **HECHO** (0.178.0, 26 oct., merge d6dc3fd; suite 876 en verde) con el 1A 2A 3A de Ez: gracias, k2, aviso de fin de
   prueba como hoja, «Gestionar» en su fila, sin conexión y la renovación de la mensual. Se enchufa Stripe cuando Ez
   tenga la cuenta («Stripe, paso a paso» en la hoja).
5. ~~Lo que prometemos sobre los datos~~ **HECHO** (0.179.0, 26 oct., merge 23086f7; suite 881 en verde; 1A 2A 3A de Ez; lo privado en el calendario del móvil, con la pieza nativa de «Android a fondo») (P1-P5, punto 4) junto con lo que cambia al cobrar y la huella de
   IP de una hora que guarda «Avísame» para su límite (S4), en `privacy.html`. Antes de conectar «Avísame» y de vender;
   enseñárselo a Ez antes.
6. ~~Montar lo que Ez elija de N5-N8~~ **HECHO** con la 2 (0.176.2).
7. ~~Android a fondo~~ **HECHO** (0.184.0, en `main` el 28 oct., probada por Ez en su Android): los avisos A1-A4, N4
   con la A de Ez, el puente del calendario con S6 y lo privado en el calendario del móvil.
8. ~~La bienvenida y los Ajustes~~ **HECHO** (0.180.0, 27 oct., con el 1C 2A 3A de Ez).
9. ~~«Qué te ayuda» en Estadísticas~~ **HECHO** (0.183.0, en `main` el 28 oct., con el 1A 2A 3A de Ez y su «júntalo»).
10. ~~La hora y la medianoche, y la voz de Respira~~ **HECHO** (0.181.0, 27 oct.).
11. **La prueba cerrada de Play y TestFlight con la 0.184.0** (hoy tienen la 0.174.0 y la 0.175.0), antes de invitar
   testers. El AAB, bajado el 28 oct. a `subidas-play\`: lo sube Ez. TestFlight, con su sí.
12. **Lo que falta para vender y no espera a nadie** (auditoría del 28 oct.): la valoración de Play tras la quinta pausa
   entera, el paso a v1 sin quitar nada (la semana de prueba con aviso y las rutinas de pago ya hechas, abiertas para
   siempre), `/recuperar` y la invitación con los botones de compra.
13. **El llavero del calendario**, cuando Ez tenga las altas de Google y Microsoft. Para abrir Google Calendar a todo el
   mundo, Google verifica la app, y tarda semanas.
14. **Cobrar en Android (Play Billing)**, con los 12 testers y sus 14 días, y el regalo de los testers. Pide el perfil
   de pagos de Play, que pide el alta de Ez.
15. **El iPhone: la compra de Apple, «Restaurar compras», la ficha y la revisión**, a la vez que 14. Antes, el
   enlace público de TestFlight en `/beta` (5b, en cuanto Apple apruebe). Pide el acuerdo de apps de pago.
16. **Lo legal de /premium**: condiciones, devoluciones, aviso legal y la función de desistimiento en línea (UE, desde
   el 19 jun. 2026), con los datos de Ez y, mejor, una revisión profesional.
17. **v1.0**: apagar `PREMIUM_ABIERTO_HASTA_V1` sin quitar nada a quien lo usaba, quitar «Da de pastar a la vaca» de la
   web, y QA de compra, restaurar y cancelar en las tres tiendas.
- **El punto 7 de abajo** (ejercicios de pie para las pausas cortas) queda dentro del 1: las diez pausas de entrada lo
  cubren.
- **Lo de Ez, en paralelo**: la cuenta de Stripe (desde el 25 oct.), el gestor y el alta, los testers, las altas de
  Google y Microsoft, el logo, las llaves en un disco y los dibujos.

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
   `docs/proposals/mueve-estira-comprobacion-23oct.md`. **La página para que Ez elija, publicada el 23 oct. por la noche**
   (https://claude.ai/artifact/9L6RZTPCYpZH57iywsNnHE; arriba, «23 oct., noche»): espera su línea. Sin renombrar ids (CLAUDE.md, «los ids van
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
