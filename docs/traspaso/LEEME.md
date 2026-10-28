# Traspaso de PACE: léelo primero

Este archivo es para un Claude que empieza de cero, en esta cuenta o en otra, y tiene que retomar
PACE sin preguntarle a Ez lo que ya se decidió. Junto con `CLAUDE.md` y `STATE.md`, basta para seguir.
Se actualiza en cada hito (regla en `CLAUDE.md`). Última actualización: 28 de octubre de 2026, v0.185.0.

## 28 oct., noche: lo que faltaba para vender y los avisos del iPhone (v0.185.0), en `main` con el «júntalo» de Ez

Ez dio el «júntalo» a lo que faltaba para vender (1A 2A 3A 4A, tras ver las fotos del montaje) y eligió la **A** para los
avisos del iPhone: con «A tu ritmo», el aviso de fin de los dos móviles dice la pausa que toca, como la web. Las dos
ramas entraron con un solo choque, el censo de `verify` (1063 + 1 = 1064), y la versión fue en un commit aparte. Con eso,
la versión de prueba definitiva ya tiene todo el código y espera los 16 dibujos y el logo. `STATE.md` se rehízo corto.
El mismo día ChatGPT revisó el cobro (seis casos) y las rutinas sin «Auto» (cuatro). La coordinadora los comprobó en el
código de la 0.185.0, y tiene razón en los diez: van antes de cobrar y antes de la versión de prueba definitiva. La
lista y los encargos, en el relevo. Y el primer dibujo de la tanda, «Remo con banda», se repite: la flecha iba hacia
delante y la banda parecían dos palos (su prompt, ya corregido en `GLIFOS_A_DIBUJAR.md` y en la página de los dibujos).

## 28 oct., tarde: lo que falta para vender (1A 2A 3A 4A de Ez) y los avisos del iPhone, en sus ramas

Ez eligió **1A 2A 3A 4A** en la maqueta del punto 12 (`docs/proposals/vender-punto-12-28oct.html`): la hoja del día
de v1 con las rutinas que se quedan, `/recuperar` con «¿Lo has perdido?» en PACE, los botones de compra como en la
bienvenida y la ventana de valorar también en el iPhone. La prueba sigue en **7 días** (Ez volvió a preguntar por 3 y
se quedó en 7: en tres días no se ve una semana de «A tu ritmo»). Lo monta `claude/clever-gagarin-6701aa`; los avisos
del iPhone y tres arreglos pequeños, `claude/awesome-albattani-270a62`. Las dos se juntan solo con el «júntalo» de Ez,
y después sale la versión de prueba definitiva. Estado y sesiones: el bloque del 28 oct., ~18:20, del relevo.
Stripe, el mismo día: la cuenta de Ez (autónomo), «vende por ti», los productos y los enlaces en real pero apagados, y
k2 pública en la app (v0.184.1). Ez quiere vender en la web antes de v1; antes hace falta lo legal de /premium.

## 28 oct.: Android a fondo (v0.184.0), en `main` con el «júntalo» de Ez

Ez la probó en su Android y dijo «va bien, júntalo». Hecha como 0.182.0 en `claude/android-a-fondo-6edf2e`: los
avisos A1-A4, el puente del calendario que leía «vacío» cuando Android fallaba (C2/S6), lo privado en el calendario
del móvil con una pieza propia (`PaceCalendario.java`) y N4, el aviso fijo con el móvil bloqueado (la A de Ez: la
cuenta que corre sola, sin botones, con `PaceAvisoFijo.java` lista para añadirlos). Entró detrás de «Qué te ayuda»:
la unión se quedó en 0.183.0 y la 0.184.0 va en un commit aparte. Queda para después, en la cola: los mismos cuatro
casos de avisos en el iPhone (`app/ui/ios.js`), el aviso de fin que no nombra la pausa de «A tu ritmo» y los botones
de verdad del aviso (la C de N4). Lo técnico: la fila de v0.184.0 en `DECISIONES_TECNICAS_VIGENTES.md`.

## 28 oct.: «Qué te ayuda» (v0.183.0), en `main` con el «júntalo» de Ez

La pestaña «Qué te ayuda» de Estadísticas, con el 1A 2A 3A de Ez (tres ideas con umbral, «Todavía es pronto» antes y
su candado sin PACE completo), juntada el 28 oct. desde `claude/que-te-ayuda-maqueta-6c3534` sin ningún choque: en
`main` solo había documentos. El `index.html` juntado es igual byte a byte al de la rama. En la unión, /premium pasa a
decir «Tu mes, tu año y qué te ayuda», como la invitación de la app. Lo técnico, en la fila de v0.183.0 de
`DECISIONES_TECNICAS_VIGENTES.md`. Sigue esperando a Ez Android a fondo (entra como 0.184.0); el arreglo de las
pruebas de noche se juntó detrás, el mismo día.

## 28 oct., mañana: la auditoría de v0.181.1, y el arreglo de las pruebas que caían de noche, a la espera de Ez

La auditoría (`docs/audits/auditoria-v0.181.1.md`) deja el código sano y una conclusión: **la fecha de v1 ya no
depende del código**, sino de los 12 testers de Android con sus 14 días y del alta para cobrar. El orden hasta v1 pasa
a 17 puntos (`ROADMAP.md`, «Camino a v1.0»), con lo decidido que aún faltaba: la valoración de Play, el paso a v1 sin
quitar nada, `/recuperar` y lo legal con la función de desistimiento. La rama
`claude/pruebas-medianoche`, sin versión, pone a mediodía el reloj de seis archivos de pruebas (de noche cruzaban la
medianoche: así cayó el CI de cee0095); en `main` desde el 28 oct. con el «júntalo» de Ez. Lo que queda por juntar: el
bloque del 28 oct. de `docs/traspaso/relevo-coordinadora-22oct.md`.

## 27 oct., noche: v0.181.1 en `main`; «Qué te ayuda» (0.183.0) y Android a fondo (0.182.0), en su rama, a la espera de Ez

`main` tiene la bienvenida (0.180.0), la hora y la medianoche (0.181.0) y los textos de Mueve y Estira (0.181.1), y
el CI está en verde entero. Dos ramas están terminadas y subidas, y se juntan solo con el «júntalo» de Ez:
`claude/que-te-ayuda-maqueta-6c3534`, que va primero (la pestaña «Qué te ayuda» de Estadísticas con el 1A 2A 3A de
Ez), y `claude/android-a-fondo-6edf2e` (los avisos y el calendario de Android, con N4: A · N4b: A; espera a que Ez la
pruebe en su móvil). Cómo juntarlas y lo que choca: el bloque «AL RELEVO (27 oct., ~23:10…)» de
`docs/traspaso/relevo-coordinadora-22oct.md`, que manda sobre lo de abajo.

## 27 oct.: la revisión de ChatGPT de Mueve y Estira (v0.181.1), en `main` con el «júntalo» de Ez

Rama `claude/magical-robinson-ced87d` (puerto 8808: el 8805 lo retiene un servidor huérfano de la mañana que sirve otra carpeta). Monta lo que
aporta la respuesta de ChatGPT, comprobada contra el código en
`docs/proposals/mueve-estira-chatgpt-revision-respuesta-27oct.md`: las cinco fichas con un fallo de verdad (desliza el
talón, gateo, círculos de brazos, muñeca y remo con banda), las colocaciones que faltaban, el inglés que sonaba
traducido y el aviso común de parar con dolor o mareo en «Antes de empezar». Manda el dibujo: los círculos enseñan un
brazo (ocho con cada uno) y los deslizamientos, los brazos en W. Las frases van reescritas cortas, nunca las de
ChatGPT. Ninguna dosis sube; el descanso entre series y las pausas de suelo ya estaban. Fotos de antes y después para
Ez: https://claude.ai/artifact/9Y61HfjdAKzQGKJFGNKUPq. Se junta cuando Ez diga «júntalo». Lo técnico: la fila de v0.181.1 en
`DECISIONES_TECNICAS_VIGENTES.md`.

## 27 oct.: la hora y la medianoche y la voz de Respira (v0.181.0), en `main` con el sí de Ez

Juntada el 27 oct. detrás de la 0.180.0 («junta la bienvenida y después la hora»). Venía de la rama
`claude/gracious-pascal-ea1249` (puerto 8806), el punto 10 del orden hasta v1. Nada que se vea. El texto de la
auditoría de H1-H3 no se guardó en ningún sitio (solo «la hora repetida del 25 oct.»): se sacaron del código los tres
sitios que fallan con el reloj falso, y cada caso se prueba con el cambio de octubre y con el de marzo. **H5 lo decidió
Ez (27 oct., por la coordinadora): se mantiene su A del 12 oct.** Un Foco cuenta si PACE se entera de su final el mismo
día y nunca se apunta al siguiente; preguntar «¿Lo completaste?» al volver queda para más adelante, con maqueta.
Detalle y reglas: la fila de v0.181.0 en `DECISIONES_TECNICAS_VIGENTES.md`.
## 27 oct.: la bienvenida y los Ajustes (v0.180.0), en `main` con el 1C 2A 3A de Ez

Rama `claude/bienvenida-ajustes-6e6e31` (puerto 8805). Ez eligió sobre https://claude.ai/artifact/6p1BHbVqSrgtwnJgrXWLka
1C, la visita guiada por la home («creo que es la que más explica para nuevos usuarios aunque a lo mejor puede añadir o
complementar explicaciones que se encuentran en la B»): de la B solo entra, en la parada del aro, «Al acabar, PACE te
propone una pausa corta…», porque a 360 px no cabe más sin scroll. 2A, PACE completo al final de la bienvenida, abierto
hasta v1, con un solo «Comenzar». 3A, los Ajustes: «Tus datos» plegada por debajo de 860 px de alto, el interruptor de
40 × 24, sin JSON ni backup y con avisos de PACE en vez de los del navegador. Con A1-A5 y A7 de la auditoría. Juntada
el 27 oct. después de que Ez mirara las fotos (https://claude.ai/artifact/RGuZouekZoBxCLdedtpmbH).

## 26 oct.: lo que prometemos sobre los datos (v0.179.0), en su rama, con el 1A 2A 3A de Ez

Rama `claude/privacidad-p1-p5-a973d0` (puerto 8806). Ez eligió la recomendada sobre
https://claude.ai/artifact/QMy8fBJtxgf4SR8weSi7wY («Me vale la privacidad»): 1A las pausas, libres y privadas en Google,
Outlook y el archivo (en el calendario del móvil, cuando Ez pruebe una pieza nativa que falta); 2A la compra en la web
contada ya en `privacy.html`, empezando por «Aún no se puede comprar en la web» (esa línea se quita al encender Stripe);
3A los correos de «Avísame», un año. De una reunión, PACE solo pide y guarda las horas. Play y App Store Connect no
cambian ninguna respuesta. El detalle: `docs/traspaso/archivos/privacidad-26oct/LEEME.md`.

## 25 oct.: Mueve y Estira en capas (v0.176.0), lista en su rama a la espera de Ez

Rama `claude/mueve-estira-capas-e9ab74` (carpeta `.claude/worktrees/mueve-estira-capas-e9ab74`, puerto 8805). La parte 1
(1A, v0.175.2) ya está en main; la parte 2 (2A 3A 4A y los logros con la A de Ez) está hecha, con `verify` y la suite
entera en verde. Fotos para Ez: https://claude.ai/artifact/M32hjPa2qFUZDNfaURn8dQ. Se junta cuando Ez diga «júntalo».

## 23 oct., noche: v0.175.1 en `main`, con /premium refinada; coordina la cuenta de 5iWBf…

Relevo y cola: `docs/traspaso/relevo-coordinadora-22oct.md`, bloque «23 oct., noche». Página de pasos de esta
cuenta: https://claude.ai/artifact/5iWBfHE7kD3dUVocdskmb6. **Espera a Ez: la página de Mueve y Estira**
(https://claude.ai/artifact/9L6RZTPCYpZH57iywsNnHE, `docs/proposals/mueve-estira-elegir-23oct.html`), cuatro
decisiones con fotos de la app real y la A recomendada en todas; contesta con una línea («1A 2A 3A 4A»). La
primera versión del iPhone (0.175.0) está en TestFlight y el grupo externo «Testers iPhone», en la revisión beta de
Apple.

## 23 oct., mañana: v0.175.0 en `main`; coordina la cuenta de EcLj6…

Relevo y cola: `docs/traspaso/relevo-coordinadora-22oct.md`, bloque «23 oct., mañana». Página de pasos de esta
cuenta: https://claude.ai/artifact/EcLj6io4wM9pGjtQ5wd1CT. Los dos enlaces de `/beta` (el grupo `pace-tests` y la
prueba de Play) están encendidos. La respuesta de ChatGPT sobre Mueve y Estira llegó y espera su comprobación
(`docs/proposals/mueve-estira-chatgpt-respuesta-23oct.md`).

**v0.175.0, las pausas con bloques cortos, juntada con el sí de Ez** («júntala», sobre las fotos del recorrido de
verdad, https://claude.ai/artifact/Hh3tA7SCTqm2N7b84QzFpJ; guion
`docs/traspaso/archivos/maqueta-inicio-22oct/fotos-ver-ejercicio.js`). El aviso del sello «Primer paso», que la
primera vez tapa unos 3 s la línea de la invitación, se queda así (Ez: «déjalo así»). Rama
`claude/maqueta-inicio-3a2a59`, sesión «Maqueta», puerto 8803.
- **Lo que eligió Ez**: 4a A · 4b A (solo con el día empezado) · 4c A · 5a A · 5b B, y su sí a las fotos de
  https://claude.ai/artifact/H7mBXKbcv1mR8pVSg61N5d con las dos recomendaciones (sin «¿Te ayudó?»; solo suman los
  minutos, sin logros ni rutina hecha) y el botón **«Ver ejercicio»** («See exercise») en vez de «Hacerla».
- **Montado**: la invitación, la elección del aro y la cuenta sin día (`app/state-ritmo.bloques.jsx`,
  `app/focus/FocusTimer.bloques.jsx`); la hoja (`app/focus/RitmoHacerla.jsx`) con uno de los 31 de
  `docs/proposals/hacerla-reparto.md`, uno por invitación y nunca el de la anterior (`app/state-ritmo.hacerla.jsx`,
  `hacerlaVez`); «Empezar» a la pantalla de ejercicio con una rutina de un paso (`pace:hacerla`), que no guarda
  para «Continúa» ni borra otra a medias, no pregunta y solo suma minutos; «1 paso» en singular. Dos filas nuevas
  arriba en `DECISIONES_TECNICAS_VIGENTES.md`.
- **Pruebas**: `tests/ver-ejercicio.spec.js` (6) y las tres de `tests/bloques-cortos.spec.js` que buscan el botón
  caen contra la rama de antes (4cf8e82, con «Hacerla» y sin la hoja) y pasan; las de los archivos que tocan la pantalla de ejercicio, las pausas y la home sin
  scroll, en verde con `PACE_E2E_PORT=8803`. **Suite entera con todo junto (17 min): 836 en verde, 2 saltadas y 2
  caídas por la decisión nueva**: `tests/ritmo-bloque-siguiente.spec.js` esperaba «Empezar bloque 2» y «Empezar otro
  ciclo» tras un bloque de 15, donde ahora el aro invita (4a y 4c); puesta al día sin tocar lo que vigila (el reloj
  del bloque siguiente), 15 de 15 con `bloques-cortos` y `ver-ejercicio`.

## 22 oct., noche (hacia las 22:00): v0.174.6 en `main`; coordina la cuenta de 5iWBf…

Relevo, sesión abierta y cola: `docs/traspaso/relevo-coordinadora-22oct.md`. Página de pasos de esta cuenta:
https://claude.ai/artifact/5iWBfHE7kD3dUVocdskmb6.

- **v0.174.6, juntada con el sí de Ez** (rama `claude/maqueta-inicio-3a2a59`, sesión «Maqueta», puerto 8803; 1A
  2A 3A de https://claude.ai/artifact/RHBJDiTX5Rix3EXYfN8ugj): sin contestar, la home abre con los módulos y la
  tarjeta corta, y «Comienza» abre la pregunta (`ritmoAbrirPregunta`, `ritmo.pregunta` = hoy; ya no escribe
  `libre`); con la semana guardada, la tarjeta dice tu día de siempre. Los Ajustes del móvil, sin scroll, con «Tus
  datos» en su propia vista del panel. La voz calla en `fin` + 100 ms (`PACE_VOZ_COLA`): el «exhala» grave cabe en
  Rondas y su chasquido ya no suena. Suite entera con todo junto: 819 en verde y 2 saltadas (17,7 min).
- **Las pausas con bloques cortos** (4a A · 4b A, solo con el día empezado · 4c A) y la **pregunta 5**: al pulsar
  «Hacerla», un ejercicio de Mueve o Estira con el glifo del módulo (maqueta en
  `docs/proposals/maqueta-inicio-22oct.html`). Esperan las letras de Ez; las monta la sesión «Maqueta» como
  v0.175.0 después de juntar `origin/main`.
- Al repasar lo de ChatGPT entraron en la cola la voz por `<audio>` (auditoría del 21 oct.) y la segunda parte
  de los bloques cortos (el aviso a mitad de un bloque largo). Dos consultas suyas, «qué pasa cuando sale una
  versión nueva» y «volver a la app», no tienen respuesta apuntada: preguntado a Ez.

## 22 oct., noche: v0.174.5 en `main`; relevo por uso hacia las 21:00

**Lo que sigue, la sesión abierta («Maqueta», puerto 8803) y cómo retomarla**: `docs/traspaso/relevo-coordinadora-22oct.md`,
«Al relevo» y «La cola, por orden». Páginas de pasos: https://claude.ai/artifact/EcLj6io4wM9pGjtQ5wd1CT (la cuenta
que coordinó esta noche) y https://claude.ai/artifact/5iWBfHE7kD3dUVocdskmb6 (la otra).

- **Ez eligió** las pausas con bloques cortos (4a A · 4b A solo con el día empezado · 4c A) y que «Hacerla» saque
  un ejercicio de Mueve o Estira con el glifo del módulo (maqueta pendiente). Idea suya, en la cola: una página
  `/beta` para captar testers con un grupo de Google.

- **v0.174.5, juntada con el sí de Ez** (rama `claude/logros-creditos-6ea13b`, sesión «Pausas, logros y créditos»):
  cinco arreglos, cada uno con su prueba, que cae contra v0.174.4. M3, los logros solo con la sesión
  entera (la decisión de Ez); A9, una Respira a medias en dos pestañas se retoma en una y se acredita
  una vez; A8, Intro y Espacio del menú de pausa son del botón con el foco; M1, el aro llega de golpe
  al volver a la app; y M5, «Ponle ritmo al día» en Estadísticas cierra el panel. Sin cambios a la
  vista más allá de los fallos. M2 sigue en espera de Ez.
- **Juntados con el sí de Ez**: el calendario que se mantiene solo (C1-C3, v0.174.3) y «Tus rutinas» con
  Estadísticas (once casos y las cinco A de su maqueta, v0.174.4; `session.completed` pasa a `v:2` con
  `creditedMinutes`). Con ellos, la frase que eligió Ez para la pared opcional de «Espalda de oficina»
  («Una pared, si la necesitas»; en la tarjeta, «pared opcional»), que salía como clave. Suite entera con todo junto: 790 en verde, 2 saltadas.
- **Ez probó la prueba interna en su Android** y decidió (`DECISIONES_PRODUCTO.md`, «Lo que Ez vio en su
  móvil»): logros solo con la sesión entera. Con el aro corto, la pausa a los 15 min de foco, EN ESPERA:
  Ez lo consulta con ChatGPT. Lo demás (M1-M7), en `STATE.md`.
- **La auditoría de privacidad de ChatGPT** (P1-P5), comprobada: nada sale a escondidas, cinco frases
  prometen de más. La respuesta «No» de Play se mantiene. Hecha en v0.179.0 (26 oct., arriba).
## 14 oct. 2026, tarde: la coordinadora es la sesión de `caza-sesiones`, en esta cuenta

Manda sobre todo lo de abajo. Ez lo decidió: mientras se siga en esta cuenta, coordina la sesión que
trabaja en `.claude/worktrees/caza-sesiones-a8e105` (rama `claude/caza-sesiones-a8e105`, puerto 8794).
Sube a `main` desde su carpeta (`git push origin HEAD:main` tras juntar `origin/main`), así que la
carpeta principal puede ir por detrás de `origin/main`: `git pull` antes de trabajar en ella.

- **22 oct.: v0.174.3, tres casos del calendario que se mantiene solo** (auditoría externa del 22
  oct., rama `claude/happy-allen-d915c3`), con su prueba, que falla contra v0.174.2: «Desconectar»
  corta la escritura en marcha y en Android deja de leer las reuniones. Lo que dice la hoja: Ez
  eligió la A, «cuatro casos» (al día, poniendo al día, no se pudo con «Reintentar» y la hora del
  próximo intento, y falta permiso), sobre `docs/traspaso/archivos/calendario-estado-22oct/tabla.md`;
  montada en la misma versión. En cola, aparte: el puente del calendario de Android se traga los
  errores.
- **22 oct.: v0.174.4, «Tus rutinas», el cierre de Mueve/Estira y Estadísticas** (rama
  `claude/beautiful-perlman-2b642c`, sin juntar), once casos de la auditoría externa, cada uno con su
  prueba en rojo contra v0.174.2 (`tests/tus-rutinas-auditoria.spec.js`, `tests/stats-auditoria.spec.js`).
  Ez eligió las cinco recomendadas de `docs/proposals/rutinas-y-cifras-auditoria.html`
  (https://claude.ai/artifact/XdRVMjxUYbQR4iNoLH84DW), todas montadas; la 2A sube `session.completed`
  a `v:2` con los minutos que cuentan.
- **22 oct.: v0.174.2, seis casos de la auditoría externa del 21 oct.** (rama
  `claude/happy-allen-d915c3`), cada uno con su prueba, que falla contra v0.174.0: las reuniones
  en los bordes del día, la jornada en plena comida (Ez eligió la B, «lo que queda de comida»,
  sobre `docs/traspaso/archivos/plena-comida-21oct/tabla.md`), la pausa que seguía como Foco al
  cambiar de modo y «por libre» en plena pausa del día.
- **22 oct.: los trece casos de datos de la auditoría externa, en `main` con v0.174.1** (rama
  `claude/elastic-hofstadter-20ccb0`, juntada con el sí de Ez). Cada arreglo tiene su prueba, que
  cae contra v0.174.0; sin cambios a la vista salvo tres avisos nuevos (copia a medias, «no se pudo
  borrar» y «Copia cancelada»). El caso 8, dos pestañas que apuntan algo a la vez (se reproduce a
  0-10 ms y nunca a 100 ms), Ez lo acepta como riesgo (A, 22 oct.).
- **20 oct.: los días diseñados, montados en v0.174.0** (rama `claude/nostalgic-dirac-127713`, sesión
  `dias-cuerpo-entero`). Ez contestó a la segunda página: solo las rutinas que ya hay («Hombros
  fuertes» fuera: medido sin ella no faltaba nada), «equilibrada y diferente», y lo de después de
  comer, fuera. La pared cuenta como la mesa y «Caderas de pie» también como piernas. La semana
  resultante, para que Ez la apruebe antes de juntar: https://claude.ai/artifact/HjcDYcPgAm4fG13uMvKaVm
  (`docs/traspaso/archivos/dias-disenados/semana-final.html`). Lo que no sale mejor que hoy: con
  PACE completo y el aro a 25 o a 10, el día queda algo menos equilibrado (2,8 frente a 2,0).
- **20 oct.: v0.173.2 en `main` y los días diseñados, redefinidos.** Esta cuenta, repuesta (la semana
  vuelve a las 13:00 UTC de los lunes), coordinó desde la carpeta principal, en `main`. Ez dijo
  «estoy bastante perdido»: se le hizo la hoja de ruta
  (`docs/traspaso/hoja-de-ruta-20oct.html`, https://claude.ai/artifact/EcLj6io4wM9pGjtQ5wd1CT), con
  tres cosas para el día y su lista por orden. **Cómo guiarle:** a «¿qué toca?», una sola cosa; sin
  jerga («no sé qué carajo es tarde de pie»); las preguntas, con AskUserQuestion, y repetirle lo
  entendido antes de montar.
  - Con su «júntalo», `claude/intelligent-cannon-40e082` entró en `main` sin choques (ce0e295):
    «libre» y publicar solo la app. Ez cambió Cloudflare el mismo día, con los pasos explicados uno
    a uno (Workers & Pages › paceweb › Settings › Build › Build configuration › Edit).
  - Días diseñados: Ez rechazó la intención por día y el paseo. Lo que eligió está en
    `DECISIONES_PRODUCTO.md`, arriba del todo. La sesión antigua ya no estaba viva; quedó una tarjeta
    para una sesión nueva (`dias-cuerpo-entero`) que retoma el wip 3ae2dc5 y le enseña una página
    sin jerga antes de montar. La carpeta `.claude/worktrees/sad-ishizaka-293093` se borra cuando
    esa sesión haya traído el wip.
  - Play Console, con Ez clic a clic (su página de pasos lo lleva): app creada como «PACE: Pomodoro,
    Break Reminder», en inglés como idioma principal y Gratis, tras mirar la competencia
    (`docs/launch/google-play/nombre-en-play.html`). Al rellenar «¿Alguna parte está restringida?»
    salió que «Tus rutinas» no se podía abrir en Android: v0.173.3 lo abre hasta v1 (Ez). Siguen
    los cuestionarios (`contenido-de-la-app.md`), la ficha y las pruebas interna y cerrada.
- **18 oct.: auditoría completa y lo que decidió Ez** (`docs/audits/auditoria-v0.173.0.md`, página
  https://claude.ai/artifact/7YxZbjgoK33rtT5C84wnGs; el calendario, en
  https://claude.ai/artifact/CBVzMw539HF895eM2HJmbw). Sin tocar código: esta cuenta se quedó al 92 %
  de la semana (se repone el lunes 20 a las 15:00). **Sigue la otra cuenta** con estos encargos, uno
  por sesión:
  1. **«Libre» en el calendario: hecho el 20 oct.** (v0.173.1, rama `claude/intelligent-cannon-40e082`,
     se junta con el sí de Ez). Libre al crear y al cambiar en los cuatro destinos (`modifyEvent`
     también acepta `availability`), y la privacidad lo cuenta. Lo que se pidió: `calendarioWebCuerpo` en
     `app/ritmo/ritmo.calendario.web.js` lleva `transparency: 'transparent'` (Google) y
     `showAs: 'free'` (Outlook) para crear Y cambiar (hoy `opaque`/`busy` solo al crear, líneas
     337 y 342); `app/ui/android.js:255` `availability: 1` (el enum del complemento: 0 ocupado, 1
     libre), y mirar si `modifyEvent` lo acepta; `app/ritmo/ritmo.calendario.js:125`
     `TRANSP:TRANSPARENT`; las pruebas de `tests/ritmo-calendario.spec.js:277, 391, 395`, rojas
     antes. PACE encuentra sus eventos por su marca, no por lo ocupado, así que no se pierden.
  2. **Publicar solo la app: hecho el 20 oct.** (v0.173.2, misma rama, se junta con el sí de Ez).
     `dist/` lleva 249 archivos (12,7 MB) y se probó en local con el service worker (236 entradas),
     /premium y `calendario.html`. Falta que Ez, **después de juntarlo a `main`**, cambie en
     Cloudflare el comando y la salida, y comprobar que `/STATE.md` deja de servirse: el 20 oct.
     daba 4.931 bytes de markdown; luego tiene que dar el index (1.853.986 bytes) o un 404. Antes de
     juntar, el comando nuevo no existe y el build de Cloudflare fallaría (lo publicado se queda
     como está). Lo que se pidió: un `scripts/web-dist.js` (como `android-www.js`) que haga `dist/` con
     lo de `www/` más `sw.js`, `_headers`, `calendario.html` y `premium/`; `dist/` en `.gitignore`;
     `verify` comprueba que todo lo que precarga `sw.js` está en `dist/`. Ez cambia en Cloudflare
     Pages › Settings › Build el comando (`node scripts/web-dist.js`) y la salida (`dist`);
     `functions/` se lee de la raíz. Comprobar luego que pacegrass.app/STATE.md ya no se sirve
     (compara el tamaño: una ruta que no existe devuelve el index con 200).
  3. **El llavero**, cuando Ez haga las altas: el cliente de Google pasa a «aplicación web» con
     secreto (en los secretos de Cloudflare); guardar en D1, no en KV (KV gratis: 1.000 escrituras
     al día, y Microsoft cambia el permiso en cada uso); en «Pruebas», Google borra el permiso a los
     7 días; `docs/CALENDARIO_ALTAS.md` y `privacy.html` al día.
  Hechos con el sí de Ez: la pasada de texto y el e2e en dos trozos (a52fdab); 38 ramas locales y
  18 remotas ya juntadas, borradas (las 21 que no lo estaban por número, copiadas en
  `PACE-ramas-borradas-18oct.bundle`, junto a la carpeta del proyecto); 25 sesiones terminadas,
  archivadas. Se guardan `calendario-reescrita` (la B del calendario), `origin/claude/play-rutina-subidas`
  (un commit de permisos que no está en `main`) y la sesión «PACE: series y pausa corta», porque al
  archivarla se archivaría con ella «Los días diseñados», que espera las cuatro respuestas de Ez
  (rama `claude/sad-ishizaka-293093`, wip 3ae2dc5).
- **17 oct.: v0.173.0, el motor de la semana** (`claude/quizzical-chatelet-7a011f`, con el sí de Ez; la
  carta B y lo aprendido en «Tu semana» B). Ez: los ejercicios nuevos llegan con los días diseñados y
  todo se hace en una habitación o el escritorio, sin salir de casa. Lo siguiente: **los días
  diseñados** (encargo en `archivos/encargos-17oct/DIAS_DISENADOS.md`), luego el calendario total.
- **16 oct., noche: v0.171.4 y v0.172.0.** v0.171.4: los enlaces del pie de Ajustes (en toques.css) y
  la fecha corta en América. v0.172.0 junta, con el sí de Ez, la venta sin Stripe
  (`claude/interesting-meninsky-062638`) y la revisión de los ejercicios (`claude/wonderful-pare-55e168`).
  Lo siguiente: **el motor de la semana** (`archivos/encargos-16oct/MOTOR_SEMANA.md`; la revisión dejó
  la zona, la postura y el momento de cada rutina en `archivos/revision-ejercicios/`), luego los días
  diseñados y el calendario total. Ez tiene que conectar el KV de «Avísame» y decir el nombre de la
  privacidad (`docs/launch/avisame.md`).
- **16 oct., 17:00 (relevo por uso, 91 %): v0.171.3 en `main`:** «Dos horas» con el aro a 25
  (`claude/priceless-yonath-e0c735`, sí de Ez), con la suite entera en verde (698). Sesiones, las dos
  paradas por el uso con su wip y su RELEVO.md:
  - `venta-sin-stripe` (`local_93e3b5bd-…`), rama `claude/interesting-meninsky-062638`, wip ac50717:
    Ez eligió las cuatro recomendadas («Avísame» en su Cloudflare, `/premium` B, bienvenida A, la
    página ya y la lista después). Falta probar y cerrar.
  - `revision-ejercicios` (`local_b87e4b5e-…`), rama `claude/wonderful-pare-55e168`, wip 20dd4f5: hecho
    el inventario de Mueve y Estira; dijo que sigue sola al reponerse la ventana (17:30 UTC).
  - «Rana»: Ez generará `rana.png`; la tarjeta espera sin sustituto (Ez, 16 oct.).
- **16 oct., tarde: la dirección de Ez para antes de cobrar** (`DECISIONES_PRODUCTO.md`, «Lo que hace
  bueno a PACE antes de cobrar»): los testers son amigos, así que se puede cambiar lo que haga falta.
  La venta y el producto van a la vez, sin pasar de dos sesiones. Cola de sesiones:
  - abierta: `venta-sin-stripe` (`local_93e3b5bd-…`, puerto 8796). `dos-horas-aro-25` está en
    v0.171.3 (con el sí de Ez);
  - la siguiente: **la revisión de todos los ejercicios** con la evidencia de hoy
    (Mueve, Estira y Respira; Ez, 16 oct.; encargo en `archivos/encargos-16oct/REVISION_EJERCICIOS.md`);
  - luego **el motor de la semana** (encargo en `archivos/encargos-16oct/MOTOR_SEMANA.md`);
  - después: **los días diseñados** (cada día con su intención y rutinas medidas, y las de pie para la
    tarde; tocan lo mismo que el motor, no a la vez). Ahí entran los ejercicios nuevos (Ez, 17 oct.), todos
    para una habitación o el escritorio, sin salir de casa: el «Paseo corto» de la revisión, en el sitio;
  - **el calendario total en la web** con una función de Cloudflare, cuando Ez haga sus altas en
    Google Cloud y Microsoft Entra.
  Una sesión que acaba no puede abrir otra desde un aviso: la coordinadora deja la tarjeta y Ez la pulsa.
- **16 oct., tarde: v0.171.1 y v0.171.2 en `main`; la auditoría, hecha.** La coordinadora la hizo en
  esta sesión (desde Remote Control la app no deja abrir sesiones): `scripts/audit/recorrido-app.js`
  (unas 250 pantallas) y `scripts/audit/censo-promesas.js` (33 rutinas). Página para Ez:
  https://claude.ai/artifact/DJ6B89dpS6NwTor2uoqc17. Ez decidió: las rondas «más lentas» bajan en 3 s
  y Piernas de pie en 2 s (v0.171.1); el gris de los rótulos a un punto intermedio, las cabeceras de
  seguridad y «Tus rutinas» (v0.171.2); borrar las 14 carpetas terminadas (hecho); la tercera
  pausa corta en «Dos horas» con el aro a 25, y seguir con la Fase 6 por lo que no espera a Stripe.
  Esas dos últimas quedaron como tarjetas de sesión (`dos-horas-aro-25`, `venta-sin-stripe`).
- **16 oct., mediodía: v0.171.0 en `main`**: las series con la pausa corta cada 30 min
  (`claude/series-montaje-7bf9e0`, 5caa51a) y el «Ahora no» del cierre (`claude/ahora-no-tapado-d2eacd`,
  fc50c4d, opción B de Ez, con su sí para juntarla). Ez vio las fotos de las dos. Las dos sesiones
  dieron LISTO y sus carpetas no guardan nada pendiente. CI en verde (CI, Android e iOS).
  **La auditoría completa que pidió Ez** va en `docs/audits/auditoria-v0.171.0.md`: 8 de 10 partes
  en primera pasada, sin fallos graves. Quedan la parte 3 (una sesión que recorra la app real, solo
  mirando) y la 4 (la sesión de Gemelos, que mira todas las rutinas); luego, una página para Ez.
  Excepción de Ez solo para el 16 oct.: se pudo llegar al 100 % del límite de 5 horas.
- **16 oct., mañana: relevo de cuenta.** La coordinadora sigue en la misma carpeta y la misma rama;
  `main` en v0.170.1 con la CI en verde. Esta cuenta empezó con el 5 h al 1 % y la semana al 40 %.
  Dos sesiones abiertas (el máximo):
  - `series-montaje` (`local_77ee5150-…`), retomada en su misma carpeta `series-montaje-7bf9e0`,
    rama `claude/series-montaje-7bf9e0`, puerto 8795: primero las fotos de la pausa corta para Ez,
    luego las series.
  - `ahora-no-tapado` (`local_e9dddf4a-…`), carpeta nueva desde `main`, puerto 8797 (o 8793): el
    «Ahora no» tapado en el cierre del escritorio (hallazgo 1). Fotos y opciones antes de montar.
  - Ez eligió (16 oct.): **Gemelos** (hallazgo 2) después de las series, en una sesión que revise
    todas las rutinas, porque toca sus mismos archivos. **El suspiro** (hallazgo 4): el encargo de
    audio está en `archivos/encargos-16oct/PROMPTS_AUDIO_SUSPIRO.md`; «un poco más» no cabe en la
    fase de 1 s, así que la voz dice «Más» / «More». Se monta cuando Ez traiga las grabaciones.
  - Sin sesión: «Dos horas» con el aro a 25 acaba en un bloque de 55 min (ya pasaba en `main`; lo
    encontró `series-montaje`).
- **15 oct., tarde: v0.169.0 cerrada, con la CI en verde** tras arreglar `ritmo-pausa.spec.js:161` (la
  prueba veía la pausa un minuto tarde en una máquina lenta; 21bb146). **El cobro de PACE completo está en
  `main`** (rama `claude/practical-antonelli-3f03e9`, solo documentos, con el sí de Ez; detalle abajo).
  - **Hallazgos de Ez (15 oct., tarde), para tener en cuenta** (sin sesión todavía):
    1. **El cierre de las sesiones en el escritorio:** en «Escritorio express» (1920×1080 al 125 %), el
       «Ahora no» de «¿Te ayudó esta pausa?» (`session.feedback.later`) queda tapado por «Volver al
       inicio»: solo asoman sus primeras letras. Seguramente viene de v0.167.0, el dibujo del cierre
       que crece con la pantalla. Cambia lo que se ve: fotos y opciones para Ez.
    2. **«Gemelos subrepticios» (`extra.calves`, en `app/move/move.data.js`):** la 2.ª ronda dice «Más
       lentas ahora», pero lleva el mismo ritmo (1 s arriba, 1 s abajo) y 20 repeticiones frente a 25,
       así que dura 40 s frente a 50. Mirar si otras rutinas prometen en el texto lo que el ritmo no da.
    3. **La pausa corta con bloques cortos:** con el aro a 10 min, Ez quiere la pausa corta como mucho
       cada 30 min de foco (tres bloques de 10), no tras cada bloque. Toca `pausaDe` en
       `app/ritmo/ritmo.regla.js`, como las series: que lo monte la misma sesión.
    4. **El suspiro fisiológico** (doble inhalación) necesita una segunda voz para el segundo tramo de
       inhalar («un poco más» o parecido), en castellano y en inglés y con las dos voces: encargo de audio
       para Ez, como los de `archivos/encargos-14oct/`.
  - **v0.170.0: Estadísticas abre en «Hoy»** (Fase 4, 1A 2A 3A 4A de Ez), desde
    `claude/elastic-gould-a3278d` (98beeda, LISTO con 677 en verde). Su carpeta ya no guarda nada.
  - **Starter Story, terminada y en `main`** (rama `claude/zealous-engelbart-dad1fc`, solo documentos,
    con el sí de Ez): lo que eligió Ez, abajo en «Cómo se vende PACE completo». No queda ninguna sesión
    abierta. Lo siguiente, con la semana al 83 % de uso (se repone el lunes), una sola sesión: las
    series y la pausa corta cada 30 min de foco, que tocan los dos `ritmo.regla.js`.
  - **Series y pausa corta, a medias (15 oct., noche):** rama `claude/series-montaje-7bf9e0` (e07809a, wip y
    subida; su RELEVO.md). La pausa corta con el aro corto está montada (Ez: «nunca más de 30» y que el
    aro espere) y la suite pasa (679); faltan las fotos a 360 y 1280 para Ez. Las series, sin empezar:
    las re-medidas no cambian lo elegido. Se paró con la semana al 91 %: seguir el lunes.
- **15 oct., mediodía: relevo de cuenta.** La coordinadora sigue en la misma carpeta y la misma rama.
  **v0.168.0 en `main`, con la CI en verde:** la home corrida y la página de las series. Las 14 caídas
  de su suite (645 en verde, con otras dos suites a la vez) pasan todas solas: las que corren un bloque
  entero caen por tiempo con cuatro navegadores y Brave ocupando 5 GB, y con uno pasan (37 de 37).
  Para repetir caídas en este PC: `--workers=1`.
  **v0.169.0 en `main`:** `ritmo-deudas` y `calendario-solo` juntas (una suite para las dos: 669 en
  verde y una caída de la prueba, no de la app: `sello-espera.spec.js:28` dependía de la hora y, si el
  bloque acababa entre las 14:00 y las 14:59, ganaba también «Pausa de mediodía»; ahora corre a las 10).
  Sus carpetas y ramas ya no guardan nada pendiente.
  - Lo siguiente: **montar las series** que eligió Ez (la forma 2, la frase B, Piernas de pie, Espalda
    de pie y la mesa en el catálogo, sin el paseo, y la capa 1 de «PACE que aprende» gratis;
    `docs/traspaso/archivos/series-15oct/`). Ya puede, porque `ritmo.regla.js` está en `main`; los
    números de la página se vuelven a medir sobre la regla nueva.
  - Propuestas a Ez como sesión aparte (una sola, por la regla de dos): el cobro de PACE completo en la
    web (opciones, sin tocar la app; recomendada) o las Estadísticas «Hoy» y «Semana» (Fase 4).
  - Falta que Ez lea `privacy.html` (cuenta «Mantenerlo al día solo») y pruebe el calendario solo en su
    Android.
  - Ez eligió seguir con dos sesiones a la vez, no cuatro: al reanudarse, cuatro gastaron un 28 % en 3 min.
- **Cómo se cobra PACE completo, decidido por Ez (15 oct., tarde; sesión `practical-antonelli`, solo
  documentos, sin tocar la app).** Página: `docs/proposals/cobrar-pace-completo.html`
  (https://claude.ai/artifact/FKQomZTtG6eqNGHRhLUTuJ). Detalle en `DECISIONES_PRODUCTO.md`.
  - Cobra **Stripe en modo «vende por ti»** (Managed Payments): unos 15,27 € de cada 19,99 €. Plan B,
    Paddle.
  - **El código se firma solo**: una función de Cloudflare Pages comprueba el pago y firma con **k2**,
    una llave nueva solo para ventas; k1 no sale del PC de Ez.
  - **Dos planes: 2,99 € al mes con 7 días gratis, y 19,99 € de por vida.** Cambia «un solo plan» de
    s134 (`MONETIZATION.md` ya lo dice). En la web, el mensual se renueva con la función: la única
    conexión de la app, solo para quien paga al mes.
  - **Landing en `pacegrass.app/premium`.** La bienvenida enseña PACE completo una vez, al final, con
    «Ahora no».
  - Starter Story, revisado el canal principal (30 vídeos): el caso más cercano, Cat on Chair (un
    Pomodoro hecho a mano), vende sobre todo de por vida a 29,99 $ y creció sin anuncios. El canal
    hermano y las reseñas de la competencia, en el punto siguiente.
  - **Lo que espera a Ez:** un gestor (cómo darse de alta para cobrar), la cuenta de Stripe a su nombre
    con verificación en dos pasos y la petición de Managed Payments, dos pasos en Cloudflare y los
    datos del aviso legal (nombre, NIF, contacto). **Lo que lo construye (otra sesión, Fase 6):** k2,
    el número de pedido en los códigos y los anulados por pedido, la función, gracias y `/recuperar`,
    la renovación del mensual, la prueba en Play, la bienvenida, `/premium` y `privacy.html`.
- **Cómo se vende PACE completo, decidido por Ez (15 oct., noche; sesión `zealous-engelbart`, solo
  documentos).** Página: `docs/proposals/vender-pace-ideas.html`
  (https://claude.ai/artifact/BmiBesD83nMCPt4zT7iobJ): el canal hermano de Starter Story (65 vídeos)
  y 17.532 reseñas de 23 competidores. Cierra la revisión que pedía la memoria de Starter Story.
  - Ez eligió: el día de v1, la semana de prueba **y las rutinas premium ya hechas abiertas para
    siempre**; en la landing, las tres promesas (lo gratis sigue gratis, lo comprado no se quita, tu
    precio no sube), el aviso dos días antes del fin de la prueba con cancelar en dos toques y «si no
    puedes pagarlo, escríbeme»; la valoración de Play una sola vez, tras la quinta pausa entera; la
    bienvenida con los dos precios. No quiso el párrafo de «quién lo hace».
  - `docs/launch/google-play/ficha.md` ya cuenta los dos planes y no dice «dibujados a mano» (los
    dibujos salen de GPT Image). Detalle en `DECISIONES_PRODUCTO.md`; lo construye la Fase 6.
- **Cómo se lanza y se da a conocer PACE, decidido por Ez (15 oct., noche; sesión
  `stack-promo-lanzamiento`, solo documentos, rama `claude/stack-promo-lanzamiento`).** Página:
  `docs/proposals/lanzar-pace-ideas.html` (https://claude.ai/artifact/29sEts3yfHnJsKEYyfeN5M): 29
  entrevistas escritas de starterstory.com y 14 vídeos del canal principal sobre herramientas, precio,
  promoción y lanzamiento. El precio no se toca.
  - Ez eligió: **primero la web y luego Android**; una **lista «Avísame»** en pacegrass.app (y el
    registro previo de Play si la cuenta lo permite); la **ficha de Play también en español de
    Latinoamérica**; **Product Hunt, Hacker News y Reddit en inglés** el día de la web; **prensa, blogs y
    creadores en castellano con un código** de k1; en la landing, **la devolución en 14 días** y **las
    visitas contadas sin cookies** (solo `/premium` y la landing, nunca la app). Sin vídeos cortos.
  - El correo sigue siendo `hola.ezradesign@gmail.com` «por el momento»: no se crea `hola@pacegrass.app`.
  - Lo construye la Fase 6, con `privacy.html` al día (la lista y las visitas). `reddit-drafts.md` está
    caducado y se rehace. Detalle en `DECISIONES_PRODUCTO.md`.
- **Regla de Ez (14 oct., noche): desde el 85 % de uso se guardan todos los hilos** (commit «wip», push
  y este relevo) y nada pasa del 95 %. Con cuatro sesiones a la vez, la cuenta pasó del 15 al 87 % en una
  hora y las cuatro se cortaron por el límite (se repuso a las 23:40). Para retomar una sesión cortada:
  `node scripts/relevo-hilo.js <carpeta>` (WORKFLOW §10); carpetas y ramas, con `git worktree list`.
- **v0.167.0 (14 oct., noche), en `main` con la CI en verde:** la voz de Respira por Web Audio con un fundido de 5 ms (Ez dijo «súbela y
  luego la pruebo en la página»: falta que la oiga en pacegrass.app) y el dibujo del cierre de Mueve y
  Estira que crece con la pantalla (opción B de Ez, https://claude.ai/artifact/GoDfzkXwq8wPufh1MwS92t).
- **Cuatro sesiones en paralelo, abiertas por la coordinadora el 14 oct. por la noche** (Ez pidió las
  cuatro). Cada una da su LISTO y la coordinadora la junta:
  - `series-aprende` (puerto 8795): investiga series de pausas con lógica (Ez: «casi todas las pausas eran
    Escritorio express») y el primer paso de «PACE que aprende». Solo propone, con una página.
  - `ritmo-deudas` (8798): «Dos horas» dura dos horas de reloj aunque el aro esté corto (Ez lo eligió;
    con el aro a 5 min el día de 17:51 acababa a las 22:01 con 18 pausas), el miércoles con tres
    largas y el panel en modo oscuro. Es la única que toca `ritmo.regla.js` y `ritmo.semana.js`.
  - `home-corrida` (8796): la home que se queda 117 px corrida al cerrar la pausa
    (`pausa-sin-repetir.spec.js:78`).
  - `calendario-solo` (8799): el calendario que se mantiene solo; investiga y propone antes de montar.
  Sus carpetas las crea la app en `.claude/worktrees/` con ramas `claude/<nombre>…`: mira
  `git worktree list`.
- **v0.165.0 y v0.166.0 en `main` (14 oct., noche, en la cuenta que tomó el relevo a las 18:40).**
  La caída de `eventos-origen.spec.js:120` no era de la hora ni de v0.165.0: sobre `origin/main` y
  sobre la rama tarda lo mismo (unos 25 s sola) y el grupo de cinco archivos pasa entero en las dos.
  Recorre dos sesiones enteras segundo a segundo y con otra suite corriendo pasaba de los 60 s: lleva
  120 s de margen. v0.166.0 junta `pausa-cuello` (la pausa larga se hace entera, A · 2A · 3A de Ez):
  no llegó a dar el LISTO, pero su suite acabó con 640 en verde y una caída por tiempo que pasa sola;
  junta en la rama, la suite entera dio 650 en verde.
- **v0.165.0:** sesiones-7, 8 y 9 con lo que eligió Ez; las voces de Respira en inglés (Ez las oyó en el
  portátil y en el móvil; el volumen se queda como está); `PACE_VOZ_FASE_MIN` (sin voz en fases de 1 s);
  cinco dibujos nuevos (tres logros y dos ejercicios, estos con el rayado igualado a los demás).
- **Para probar una rama en el móvil de Ez:** `http://192.168.1.129:<puerto>/index.html` con el mismo wifi
  (el servidor de cada carpeta escucha en todas las interfaces).
- **sesiones-10 sigue abierta:** la voz grave entrecortada en el navegador de su Android. En una página de
  prueba se oye limpia, así que el corte viene de lo que suena a la vez. Falta que Ez la pruebe en la app con
  música y con «Suena detrás: Nada» (`CAZA_SESIONES_14OCT.md`).
  **Pista nueva de Ez (14 oct., tarde), en el PC:** en «Exhalación 4·6» con la voz grave en castellano oye
  clics entre el «inhala» y el «exhala». Las medidas lo explican: «inhala» y «mantén» de bradford empiezan
  en el primer milisegundo (ini 0,001) y su «exhala» suena hasta el último (fin = duración, 3,68 s), así
  que arrancan y se cortan de golpe. Arreglo propuesto: la voz por Web Audio (el mismo camino que la
  música, como la variante 4 de la página de prueba) con un fundido de unos 5 ms al entrar y al salir de
  cada palabra. Quita el clic sea cual sea el archivo y puede ser también lo entrecortado del móvil.
  **Montado en v0.167.0** con el sí de Ez; lo oye en pacegrass.app en el PC y en el móvil.
- **`pausa-cuello`** (`.claude/worktrees/pausa-cuello-b4792a`) está en `main` desde v0.166.0: su carpeta
  y su rama ya no hacen falta.
- **Intermitente visto en la suite entera** (pasa solo): `sw-aviso.safari.spec.js:47` en chromium (el
  service worker no llega a controlar a tiempo con la suite cargada). El de `pausa-sin-repetir.spec.js:78`,
  la home corrida 117 px, está arreglado en v0.168.0.
- El mortero y la corona de roble que dibujó Ez están en `.old/Glifos_logros`, sin logro (Ez).
- El hilo del calendario sigue sin abrir.
- **Hallazgo de Ez (14 oct., tarde):** en el cierre de Mueve y Estira («Estiramiento completado») el
  dibujo de la rutina sale muy pequeño: unos 90 px de alto en 1920×1080 con la escala de Windows al
  125 % (Brave, zoom 100 %), con mucho aire alrededor. Cambia lo que se ve: opciones pintadas sobre la
  app real y Ez elige.
- **Los 7 dibujos de ejercicio que faltan** (Ez los hace en Genspark con referencias de
  `archivos/glifos/referencias/`; barbilla-atras entró en v0.170.1): hueco-en-silla, 90-90, palmas-al-suelo,
  apretar-gluteos, sentadilla-de-cuadriceps, rana y pica-en-escritorio. Al ingestarlos, si traen más
  rayado que el resto, `ACLARADO` en `scripts/ingest-glifos-ejercicio.js` (Ez quiere la intensidad de
  los demás).
- **Hilo nuevo pedido por Ez (14 oct., tarde): «PACE que aprende», el mejor ejercicio para cada momento.**
  Es la Fase 3 ya aceptada (carta del lunes, dos cambios por semana) más una capa que sirve desde el
  primer día. Lo que se le propuso y le pareció bien:
  - **Capa 1, la elección del momento (sin historial):** la pausa puntúa las opciones con lo que sabe ya:
    cuánto llevas sentado, qué has hecho hoy (equilibrio Respira, Mueve, Estira y agua), qué zonas no has
    movido, cuánto falta para el siguiente bloque o reunión y la hora (activar por la mañana, moverse en
    el bajón de después de comer, calmar al final). Propone la mejor con una frase de motivo.
  - **Capa 2, aprender (PACE completo):** la puntuación se ajusta con «¿te ayudó?» (pesa más), lo
    saltado (con cuidado: saltar por una reunión no es que no guste), «Otra» y las horas reales de
    pausa. Los cambios, explicados en la carta del lunes y reversibles.
  - **Condiciones:** todo en el dispositivo (promesa pública; `verify` vigila que `app/events/` no tenga
    red), reglas con puntuación y no un modelo opaco, cada propuesta con su porqué, una de cada cinco
    es algo que no sueles hacer, ningún consejo de salud sin aviso, nada de gamificación agresiva.
  - **Primer paso:** inventario de lo que ya se guarda (`pace.events.v1`, `ritmo.day.closed`, «¿te
    ayudó?», `origin`) y de cuántos datos tienen los testers; la puntuación escrita como tabla de casos;
    y la propuesta de la pausa con su motivo pintada con opciones para que Ez elija viéndola. Antes,
    leer la propuesta de la pausa (s187), «A tu ritmo» (s192) y `docs/traspaso/archivos/motor-semana/`.

## 14 oct. 2026, mañana: relevo hecho, la coordinadora sigue en la otra cuenta

**Si esta cuenta se agotó con v0.164.0 (iOS) commiteada en `main` en local y sin subir:** si
`git status` dice que va por delante de `origin/main`, la suite de v0.164.0 estaba corriendo
(`%TEMP%\suite-164.log`): si acabó en verde, push y CI. Si no, `PACE_E2E_PORT=8775 npm run test:e2e`. La
sesión de iOS pasó la suite entera (635) sobre el mismo código. Lo siguiente:
- juntar `caza-sesiones` cuando dé el LISTO;
- montar las voces en inglés, si no lo hizo ella;
- abrir el hilo del calendario.

La cuenta anterior se quedó sin uso a las 11:35 y se repone a las 15:30;
esta, la que tomó el relevo a las 11:45, se repone a las 16:30. Con tres sesiones a la vez, esta cuenta
gastó el 58 % de sus 5 horas en 50 minutos: Ez decidió seguir con las dos en paralelo, y cada una hace su
«wip» y su push sola al llegar al 92 % (el tope es el 95 %, WORKFLOW §10).

- **Hallazgo nuevo de Ez (14 oct.), en manos de `caza-sesiones` como sesiones-10:** en el navegador de su
  móvil (Doogee Blade 20 Max, Android), la voz masculina de Respira (bradford) se oye entrecortada y la
  femenina no. Los MP3 de bradford son MPEG-1 a 44,1 kHz y empiezan a sonar en el primer milisegundo; los de
  sulafat, MPEG-2 a 24 kHz y con 0,39 s de silencio delante.
- **Para Ez, de la coordinadora:** los prompts de todo lo que falta por dibujar y grabar están en
  `archivos/encargos-14oct/` (imagen y audio por separado). Pendiente de su decisión: renombrar
  «Palmas al suelo» a «Palmas en la mesa».

- **v0.163.0 en `main`:** los seis arreglos de la caza de las sesiones guiadas
  (`CAZA_SESIONES_14OCT.md`, sesiones-1 a sesiones-6), que no cambian lo que se ve. Quedan para Ez, con
  fotos, otros tres:
  - **sesiones-7:** «Terminar» a los 0 s cuenta una sesión entera.
  - **sesiones-8:** el «Tiempo» del cierre de Mueve y Estira lleva las pausas dentro.
  - **sesiones-9:** recargar a mitad de Mueve o Estira la pierde.
- **Sesiones en paralelo**, abiertas otra vez en sus carpetas tras el relevo, una sesión nueva cada una:
  - `caza-sesiones`: `.claude/worktrees/caza-sesiones-a8e105`, rama `claude/caza-sesiones-a8e105`, puerto 8794.
    sesiones-7, 8 y 9 hechas en su rama (`d9cd64a`). Ez eligió A en las tres:
    - medio minuto no cuenta, y el cierre dice «Sesión sin contar»;
    - el «Tiempo» de Mueve y Estira va sin las pausas;
    - Mueve y Estira a medias ofrecen «Continúa · Paso n de m».
    Al relevo, su suite corría en el 8794; después da el LISTO.
    Se paró al 87 % con un «wip» (`8e80fc5`). Le falta que la suite entera pase: caen ingles-15 y respira-5,
    seguramente porque practican menos de medio minuto y ahora ven «Sesión sin contar». Lo que queda, en
    `.claude/relevo/RELEVO.md` de su carpeta.
    También tiene las voces de Respira en inglés que grabó Ez (`Audio - Respira\voces-en\`, fuera del repo).
    - Medidas dos veces a −50 dBFS: bradford cabe entera (0,74 · 0,58 · 0,93 s), y sulafat «hold», también
      (0,99 s).
    - sulafat «inhale» mide 1,97 s y «exhale» 1,82 s, pero la palabra que se oye (RMS por encima de −40 dB)
      dura 1,50 y 0,94 s. Lo que sobra es una cola baja: en «inhale», de 1,78 a 2,26 s; en «exhale», de
      1,88 a 2,65 s.
    - Lo siguiente: recortar esas colas con un fundido corto, sin regrabar; volver a medir; montarlas
      (nombres con guion: `sulafat-inhale.mp3`…), y que Ez las oiga antes de subir.
  - `ios-preparar` terminó: **el iPhone está preparado en v0.164.0** (proyecto `ios/`, `nativo.js` e
    `ios.js`, workflow `iOS` y la guía `docs/launch/app-store/guia.html`). Para TestFlight espera la
    cuenta de Apple Developer de Ez y su llave de la API (`PACE-llave-apple`). Su hueco es para el
    calendario (abajo), cuando haya uso para abrir una sesión.
- **iPhone, decisiones de Ez (14 oct.):**
  - la cuenta de Apple Developer, a su nombre (todavía no está creada);
  - sin Mac: todo por GitHub y TestFlight;
  - en la tienda se llama «PACE: pausas activas y foco»;
  - solo iPhone;
  - con el interruptor de silencio puesto, PACE no suena, como en Safari.
- **Siguiente hilo, cuando se libere una de las dos sesiones: el calendario se mantiene solo** (Ez, 14 oct.).
  Lo pide para quien teletrabaja y quiere el calendario sincronizado:
  - Una vez conectado, el día se escribe y se corrige solo cada vez que cambia en PACE (cambiar el día, una
    reunión nueva que lo recoloca), sin volver a pulsar «Al calendario».
  - Las pausas llevan aviso, así que Outlook o Google avisan aunque PACE esté cerrado.
  - Llevar el día y esquivar reuniones siguen gratis; lo que se mantiene solo es de PACE completo.
  - Por ahora no eligió el Foco como «Ocupado», las pausas entre reuniones ni la semana entera.
  - En la web depende de los dos ids de `docs/CALENDARIO_ALTAS.md`; en Android usa el calendario del móvil.
  - La sesión investiga lo técnico (en la web, sin servidor, el token de Google dura una hora) y trae la propuesta
    pintada antes de montar nada.
- **Una sesión que se para sin commit no se pierde.** Su conversación queda en este PC
  (`~/.claude/projects/`, que comparten las dos cuentas). `node scripts/relevo-hilo.js <carpeta>` saca a
  `<carpeta>/.claude/relevo/HILO.md` el encargo, lo que la sesión iba diciendo y las respuestas de Ez, y la
  sesión nueva empieza leyéndolo (`docs/WORKFLOW.md` §10). Ez lo prefirió a reanudar el hilo viejo, que
  arrastra unos 400 000 tokens en cada turno.

## 12 oct. 2026, noche: la coordinadora sigue en la cuenta nueva

Manda sobre el relevo de abajo.

- **PACE completo está en `main` como v0.157.0.** Ez dio el sí al verlo en fotos de la app real
  (`archivos/premium-12oct/fotos-premium.html`, nueve pantallas a 360 y 1280 px) y pidió que
  «Tus rutinas» dijera «Es parte de PACE completo», como la invitación. Los 15 enlaces de tester ya
  funcionan en la web: falta que Ez los mande.
- **La caza en Foco y lo guardado está en `main` como v0.159.0** (13 oct.), con el sí de Ez mirando
  la app de hoy (`archivos/caza-foco-10oct/fotos-app-13oct.html`). Los once hallazgos, tachados con
  su arreglo y su prueba, en `CAZA_FOCO_ESTADO_10OCT.md`. Lo de las dos pestañas lo contestó Ez:
  la pausa sale en la que miras. La rama `claude/caza-foco-estado-d6bd17` ya no guarda nada pendiente.
- **«Tus rutinas» en el móvil, v0.158.0** (13 oct.): el nombre ya no pisa los botones, la rutina
  nueva se ve al guardar y «Crear rutina» es un botón (`tests/tus-rutinas.spec.js`).
- **Estadísticas, v0.160.0** (13 oct.): Ez eligió las cuatro A mirando `docs/proposals/stats-alturas-r2-ligera.html`
  y dio el sí a lo montado y pulido en `stats-montado-ligera.html`: sin scroll en el escritorio con la
  nota, la misma altura en las tres pestañas del móvil con los totales arriba, el año en dos filas en
  el móvil y barras que crecen con su cifra. En un móvil de 360 × 640 las tres piden algo de scroll.
- **Repaso del modo oscuro, 14 oct.** (v0.162.1): recorrida toda la app en oscuro, en el móvil y en el escritorio, sin
  errores ni manchas claras; solo se aclaró el «AHORA» de la línea del día. La bienvenida sigue en crema por decisión de
  Ez (sus láminas están dibujadas sobre papel).
- **Dos sesiones en paralelo (abiertas el 14 oct. desde la cuenta que se queda sin uso; pueden pararse a medias):**
  - `caza-sesiones`: carpeta `.claude/worktrees/caza-sesiones-a8e105`, rama `claude/caza-sesiones-a8e105`, puerto 8794.
    Caza de fallos en Respira, Mueve y Estira; sus hallazgos, en `docs/traspaso/CAZA_SESIONES_14OCT.md`.
  - `ios-preparar`: carpeta `.claude/worktrees/ios-preparar-03219e`, rama `claude/ios-preparar-03219e`, puerto 8796.
    Proyecto de iOS con Capacitor, compilación en un runner macOS y guía `docs/launch/app-store/guia.html`.
  Si se pararon, la coordinadora de la otra cuenta las vuelve a abrir en esas carpetas. Las dos avisan con «LISTO
  PARA MAIN» y solo la coordinadora junta y sube. Como mucho dos en paralelo: el siguiente hilo recomendado es
  preparar el cobro de PACE completo en la web (opciones para Ez, nada sin su sí).
- **Historial reescrito el 13 oct. (con el sí de Ez):** todos los commits de main los firma Ez y sin
  «Co-Authored-By», para que en GitHub solo salga él. Los identificadores de los commits cambiaron:
  **cualquier copia o sesión anterior se vuelve a clonar y no se sube**. La copia previa completa está en
  `PACE-historial-antes-13oct.bundle`, junto a la carpeta del proyecto. `verify` lo vigila. Se borraron
  las 27 ramas ya juntadas; quedan `claude/calendario-sincronizacion` (reescrita), `claude/play-rutina-subidas`
  y `main-sig4tn` (copia vieja de main del 8 oct., pendiente de que Ez diga si se borra).
- **Recorrido por la app, 13 oct.** (v0.161.0): «Mis rutinas» saltaba el candado de PACE completo, «Sentadilla en pared»
  declaraba 2 min y duraba 3, y una treintena de botones del móvil eran pequeños para el dedo. Arreglado con sus pruebas.
  **Ronda 2, en v0.162.0:** el reloj del bloque siguiente en un plan y, en inglés, las voces atenuadas y
  «In the background». Los nombres se quedan como estaban: «Mis rutinas» con el sello «Premium» en la barra y
  «Tus rutinas» en la biblioteca (Ez, 14 oct.: «Mis rutinas Premium me gusta más»).

## Relevo del 12 oct. 2026 (la cuenta se queda sin uso; Ez sigue desde otra)

`main` va por **v0.156.0**, con la suite entera en verde en el PC de Ez (555 de 555); su CI estaba
corriendo al cerrar (mírala con `gh run list --branch main`; v0.155.0 salió entera en verde). El CI tiene
tres jobs: verify, e2e (chromium) y e2e-safari (webkit, aparte porque sus librerías salen de `apt`).
La coordinadora es la única que sube a `main` (`docs/WORKFLOW.md` §9) y usa `PACE_E2E_PORT=8775`.

- **`claude/premium-codigos-tester` (PACE completo):** ya juntada con v0.156.0, choques resueltos y
  `verify` en verde (5a9a905). Falta: la suite entera; fotos para Ez del candado, la invitación y
  «Tengo un código» en la app de hoy; su sí; subirla como v0.157.0. Ez ya dijo «sí, y enséñamelo».
  Los 15 enlaces de tester están en `~/PACE-llave-licencias/codigos-tester.csv` y solo funcionan
  cuando esto esté publicado.
- **`claude/caza-foco-estado-d6bd17` (caza en Foco y lo guardado):** once hallazgos reproducidos en
  `docs/traspaso/CAZA_FOCO_ESTADO_10OCT.md`; el arreglo de las dos pestañas (pierde datos) estaba en
  marcha. Su sesión también se para: retomar desde el TRASPASO de su último commit. Usa los puertos
  8792 y 8793; dejó un servidor colgado en el 8765.
- **`claude/calendario-sincronizacion`:** espera los dos ids de Ez; va muy por detrás de `main`.
- **En pausa por Ez:** el miércoles de «A tu ritmo» (tres pausas largas frente a una; hay que
  explicárselo mejor, con fotos) y la parada de cierre, que no se ve al terminar el último bloque.
- **Espera a Ez:** los ids del calendario, los textos de los logros, crear la app en Play Console y
  subir a la prueba interna, volver a exportar el logo («FVFN») y pasar la lista de Safari a su
  tester con iPhone.
- **Limpieza:** las carpetas de `.claude/worktrees/` de ramas ya en `main` (safari, una-linea,
  respira-es, upbeat-yonath-9cf99e, respira-bugs-graves-31faf7, agua-medianoche-fd7d5d,
  nice-benz-7fa598, caza-propuestas) se pueden borrar; no guardan nada pendiente.

## 9 oct. 2026: lo nuevo desde el relevo

- La coordinadora sigue en la cuenta nueva, con cuatro sesiones en paralelo (caza, pausa, barra
  lateral y drones), cada una en su carpeta de `.claude/worktrees/` y con su puerto. Cuando el
  límite de uso se acabó a la vez en todas, se reanudan de dos en dos (decisión de Ez).
- **La caza de bugs está en `main` como v0.151.0**, con el sí de Ez a todo; solo queda grabar la
  voz de Respira en inglés.
- **12 oct., v0.156.0:** Respira entra en la cuenta atrás y sale despacio (Ez lo escuchó), el cierre con el dibujo de la rutina y la salida tonal, y el sello del aro solo con texto. En pausa, a petición de Ez: el miércoles de «A tu ritmo» (tres pausas largas frente a una; hay que explicárselo mejor) y la parada de cierre, que no se ve al terminar el último bloque (la tarjeta pasa a «Jornada cerrada»). Sigue en marcha la caza en Foco y lo guardado (dos pestañas).
- **10 oct., v0.155.0:** la pausa por libre sin la puerta repetida (B), el cierre de las sesiones en itálica (A) y la línea del Pomodoro fundida con el horizonte (B), las tres elegidas por Ez con fotos; y la home ya no se queda corrida de lado al cerrar una pausa. En marcha: la caza en Foco y en lo guardado, y el arreglo de los sellos cortados dentro del aro.
- **La música de Respira está en `main` como v0.154.0**: tres drones en Sol que respiran y una receta «marcada» por técnica, con el sí de Ez («suenan bien, súbelas»).
- **La barra lateral (el cuaderno) está en `main` como v0.153.0**, con el sí de Ez a la app montada.
- **La pausa más elegante está en `main` como v0.152.0**: opción A de Ez, «Ir a comer» suma el vaso
  y los sellos esperan a que no haya nada abierto (en la home, dentro del aro). Página con la que
  Ez dio el sí: `archivos/pausa-9oct/pausa-9oct.html`.
- **iPhone (Ez, 9 oct.): PACE en Safari ahora y la app de la App Store después de v1.** La
  revisión en el motor de Safari encontró el aviso falso de «versión nueva» en la primera visita
  (arreglado en v0.151.0) y nada más en la home. Falta que un tester con iPhone mire el sonido.
- La llave de los códigos de tester existe desde el 9 oct. (`PACE-llave-licencias`, en el PC de
  Ez; la pública, `k1`, en `claude/premium-codigos-tester`). Ez tiene ya los ids del calendario,
  la lista de testers y los textos de logros, y los está pasando.
- El logo (`app/ui/pace-logo.png`) dice «FVFN» en vez de «EVEN» en la propia imagen: Ez lo
  vuelve a exportar.

## Al cerrar la nube (8 oct. 2026, tarde): lo que queda abierto

Se trabajó con varias sesiones en paralelo y un coordinador (`docs/WORKFLOW.md` §9). Al acabarse el
crédito de la nube quedó así. Cada rama lleva en el mensaje de su último commit un bloque
`TRASPASO:` (o `CHANGELOG:`/`STATE:`/`DECISIONES:`) con lo que falta.

- **`main-sig4tn`**: v0.148.0 a v0.148.3 (Fase 3 gratis: la semana tipo y el día ya contestado; el
  aro vacío al colocarse; seis fallos de la caza; la bola del aro). **En `main` desde la noche del
  8 oct.**, con la suite entera en verde (468) en el PC de Ez. Esa primera suite probó otra carpeta
  sin decirlo (un servidor colgado de otra sesión en el 8765); desde entonces la suite se para si
  el servidor no es el de su carpeta.
- **Ramas aparcadas, a la espera de Ez** (mira su último commit):
- **Ramas aparcadas** (mira su último commit). El 8 oct. por la noche Ez aceptó todas las
  recomendaciones pendientes:
  - `claude/respira-bugs-graves-31faf7`: **en `main` como v0.148.4** (Bhastrika con su aviso;
    «Terminar» cuenta lo hecho, variante A sin ceros). El texto del aviso por técnica lo resuelve
    respira-14 de la rama de propuestas.
  - `claude/caza-bugs-propuestas`: los cambios visibles de la caza del 7 oct. **Ez contestó las
    nueve preguntas el 8 oct. por la noche**: sí a todo lo montado; en inglés, el tono en vez de la
    voz castellana hasta grabar la voz en inglés (pendiente, «tenlo en cuenta»); cambiar de modo
    con un Foco en marcha pregunta antes; pestaña en el idioma y la PWA «PACE»; «stamp» para el
    sello; Pulso y Ondas, un poco más pequeños; rondas de 5, 9 y 17 min; «Un vaso más» en su azul
    más oscuro. En la pausa solo se enseñan Intro y Esc (lo pinta la sesión de la pausa). La
    sesión que lo monta trabaja en `claude/caza-bugs-final` y avisa con «LISTO PARA MAIN».
  - `claude/calendario-sincronizacion`: Google y Microsoft; faltan los ids que crea Ez.
  - `claude/respira-drones-por-tecnica` (contiene `claude/respira-musica-drones`): **un drone por
    técnica de Respira, montado en la app**. Las primeras variaciones sonaban casi iguales («¿no te
    da la sensación que todos suenan igual?») y el 9 oct. Ez eligió las **marcadas**
    (`archivos/musica-respira/por-tecnica/marcadas.html`), las oyó en la app y dijo «suenan bien,
    súbelas». Recetas en `PACE_MUSICA_TECNICA` (`app/ui/Sound.musica.parts.jsx`); cambiar una es tocar
    la `m` de `tecnicas.js`, medir con `construir.js` hasta «Sin avisos» y copiar receta y ajuste.
  - `claude/premium-codigos-tester`: qué se cierra y códigos de por vida para testers (en Android,
    los códigos promocionales de Play Console). Espera la llave y la lista de testers de Ez.
  - `claude/runner-circulo-letra`: **en `main` como v0.150.0** (serif itálica y tope de 95 letras
    por frase; el dibujo de Mueve iguala al de Estira). «Cuídate» sigue en sans: no se preguntó.
  - Mensaje de novedades para el grupo de testers, con tres capturas: `archivos/testers-8oct/`.
  - La pausa más elegante (pedida por Ez): sesión en paralelo en `claude/pausa-elegante`, solo una
    página para elegir.
  - `claude/glifos-revision-8oct`: **en `main`**; la piedra de amolar ya está en su logro
    (v0.148.5). Faltan los anillos de «Rondas maestra» y la vela de «Larga sesión».
  - La propuesta de nombres y descripciones de los 96 logros (tanda 1) se envió a Ez desde la nube
    y **no está en el repo ni en ninguna rama**: si Ez no la conserva, hay que rehacerla. La
    tanda 2, las explicaciones de ejercicios, respeta el tope de 95 letras.
  - Barra lateral más útil y bonita (pedida por Ez): sesión en paralelo en `claude/sidebar-propuesta`,
    solo una página para elegir.
- **El motor de la semana** (lo de pago de «A tu ritmo»): Ez aceptó la página
  (`archivos/motor-semana/motor-semana.html`, https://claude.ai/artifact/EGfS13xFn6oU4BpoRihdBL):
  aprende cuatro cosas, como mucho dos cambios y 10 paradas por semana, la carta en una ventana
  (también en semanas sin cambios) y nada sin PACE completo. **Desde v0.149.0 se guarda el resumen
  de cada día** (`ritmo.day.closed`). El motor y la carta, cuando haya semanas de datos.
- En la nube, Playwright 1.62.1 pedía Chromium 1234 y solo había el 1194: se apañó con
  `PLAYWRIGHT_BROWSERS_PATH` y enlaces. En el PC de Ez no hace falta.

## Cómo seguir desde otra cuenta

1. Ez crea un proyecto nuevo en la otra cuenta con el repo `ezradesign/Pace_app` y pega la frase de
   arranque que está al final de este archivo.
2. El Claude nuevo lee, por este orden: `CLAUDE.md`, `STATE.md`, este archivo y la fila del
   subsistema que vaya a tocar en `docs/product/DECISIONES_TECNICAS_VIGENTES.md`.
3. Lo que estaba solo en la carpeta del proyecto anterior ya está en el repo: `docs/traspaso/archivos/`
   (glifos, música, maquetas en imagen) y `docs/launch/google-play/` (ficha de Play).
4. Las maquetas publicadas como artifacts (enlaces abajo) pertenecen a la cuenta anterior y puede que
   no se abran desde otra. Lo decidido en ellas está escrito aquí, así que no hace falta abrirlas.

## Dónde lo dejamos (8 oct)

Esto es lo último y manda sobre la tabla de «Líneas abiertas» donde no coincidan. Ez alterna dos
cuentas de Claude según el uso que le queda a cada una, y las dos suben a `main`: haz `git pull`
antes de trabajar y mira en `git log` qué subió la otra.

- **Runner de Mueve y Estira: hecho en v0.144.0.** Ez pidió «más dinámico, con menos botones,
  alertas sonoras zen» y eligió la opción A, «Mando de tres»: anterior, pausa y siguiente en una
  sola fila; toda colocación cuenta sola (ya no hay «Estoy listo»); «+15 s» junto a la cuenta; un
  aro de tiempo alrededor del dibujo; cuencos al empezar cada ejercicio, al cambiar de lado y al
  terminar, y maderas en los 3 últimos segundos de cada cuenta. Nada se mueve entre pantallas (su
  queja a 1530×702, que es su 1080p al 125 %). Las rutinas propias van por el mismo runner. Reglas en
  `DECISIONES_TECNICAS_VIGENTES.md` (las cuatro filas de v0.144.0). Falta que Ez oiga los cuencos en
  su portátil y en el móvil.
- **Escala con el zoom: hecha en v0.145.0.** Ez vio el prototipo medido y dijo «súbelo así»,
  también en monitores grandes: si la ventana pasa de 1536 × 704, PACE crece en proporción y se ve
  como en su portátil al 100 % (`app/main/_lienzo.js`). La regla que no se puede romper está en
  `DECISIONES_TECNICAS_VIGENTES.md` (fila de v0.145.0) y la vigila `verify`: ninguna medida de la
  ventana a la manera de siempre (`paceCaja`, `paceLienzoAlto`, `var(--pace-vh, 1vh)`). Sin probar
  en Safari de Mac.
- **La bola del aro al empezar: hecha (v0.148.3).** Ez vio que al pulsar «Empezar» la bola y su halo
  nacían «como por debajo»: la niebla del horizonte los cortaba por la mitad. Eligió la opción A
  viendo fotos de la app real: el mismo recorrido, la bola entera en su propia capa y un fundido (el
  punto aparece y el halo se abre después), solo al empezar el bloque. Descartadas: sin fundido (B) y
  empezar a las doce como un reloj (C), que escondía la bola tras la tarjeta a mitad de bloque.
- **Aro de Mueve y Estira vacío al colocarse: hecho (v0.148.1).** Ez escribió «el aro de tiempo
  que se rellene para empezar queda raro, mejor es vacío ya que no ha empezado el ejercicio». Vio
  tres opciones en fotos y eligió la A (vacío del todo, solo el trazo de fondo), también en la pausa
  de «Cambia de lado». El aro solo cuenta el ejercicio y el descanso; lo vigila
  `tests/runner-aro-colocate.spec.js`.
- **Home del móvil sin scroll: hecha en v0.146.0.** Ez vio la maquetación B (la pregunta con el
  horario como una línea, de la rama `claude/project-thread-ft7sc2`) en fotos de la app real y dijo
  «súbela», con una condición: «no quiero scroll de ninguna forma», tampoco en inglés. Desde
  360×640, ningún momento de la home lo pide: la tarjeta corta va sin «A TU RITMO» («no aporta
  nada»); la pregunta en inglés es «How many hours today?»; el día servido del móvil va sin la frase
  del aro, con las filas sin el nombre del módulo y sin pie (opción B: «Hoy voy por libre» como
  enlace bajo «Cambiar», «Ver todo» al final de la línea y «Al calendario» en esa hoja, que sí se
  desplaza porque es una lista). A 320×568 se acepta scroll. Descartado mirándolo: esconder los
  minutos en el día servido y quitar «Trabajo en profundidad» del aro. Las pausas de Respira con
  motivo «respira» enseñaban una clave en bruto: ahora dicen «Bajar revoluciones» · «Slow down».
  Las páginas con las que decidió están en `archivos/home-movil/` (`home-*.html`).
- **Bugs: dos sesiones en paralelo (8 oct).** Una arregla respira-1 y respira-2 (Bhastrika sin su
  aviso de seguridad y el cierre de «Terminar» en las rondas) y otra respira-3 (el agua de ayer
  pasada la medianoche). Lo visual se le enseña antes a Ez en HTML. En v0.147.0 se cerraron
  oscuro-1 y oscuro-4: Ez eligió que la lista de horas de «A tu ritmo» la dibuje PACE en las dos
  paletas (la opción C de `archivos/oscuro/horas-oscuro.html`) y arreglar la casilla de apnea. El resto de
  `CAZA_BUGS_7OCT.md` sigue sin verificar; Foco y el estado guardado no se han revisado. Mira
  `git log` y ese archivo antes de tocar ninguno.
- **Música de Respira: aprobada por Ez el 8 oct.** Ez la escuchó grabada de la app real y dijo «así está
  bien». Va a `main` desde `claude/respira-musica-drones`; `claude/project-thread-9eceyu` no hay que retomarla.
- **Ramas abiertas de otros hilos:** `claude/project-thread-jid37a` («¿Cómo es tu semana?» en la
  bienvenida, a medias; ya puede montarse encima de `main`, que trae la B).
- **Glifos revisados:** de los 62 dibujos de ejercicio, seis no casan con su ejercicio (por ejemplo,
  «Barbilla atrás» con la flecha al revés y «Elevación de puntas» que dibuja talones). Están en
  `archivos/glifos/revision-glifos.html`, con un prompt para cada uno. El descanso entre series ya
  lleva la figura que respira (alias de «Reset respiración»), así que de ese no hace falta dibujo.
- **Hechos además en v0.144.0:** el Foco personalizado dura al menos 5 minutos; dentro del aro del
  Pomodoro ya no va «A tu ritmo», solo «Hasta las…» (Ez quiere la hora); «Hombros reseteados» se
  corrigió, y dos logros con título repetido son ahora «La rueda del año» y «Bisagra suelta».

- **Música de Respira:** hay tres drones en Sol hechos con las tomas de ElevenLabs de Ez: Sol claro
  para Energía, Balance y Pranayama; Sol cálido para Equilibrio; Sol menor para Relajación. La app les
  aplica una envolvente que respira en vivo (se abre al inhalar, se queda en el sostén, se cierra al
  exhalar). Aprobada por Ez el 8 oct. Los tres drones están en `archivos/musica-respira/bases/`, con la
  página de escucha (`escucha-respira.html`), los scripts de procesado y su `README.md`.
- **Glifos:** cuatro prompts de ejercicio con figuras sin ropa, de la familia de los 59. El prompt A es
  solo para GPT Image 2; el B es el preámbulo original más dos dibujos de referencia, por si A se
  bloquea. Falta comprobar qué modelo de Genspark acepta la figura. Empezar por «descanso». Prompts en
  `archivos/glifos/prompts-glifos.md` y referencias en `archivos/glifos/referencias/`.
- **Dominio:** hecho en v0.143.0. PACE vive en https://pacegrass.app (el mismo proyecto de Cloudflare
  Pages, con la app en la raíz) y `paceweb.pages.dev` sigue sirviendo lo mismo sin redirigir, porque
  los datos de la web son de cada dominio. Enlaces legales de Android, calendario y privacidad usan
  el dominio nuevo, y el calendario aún reconoce sus eventos con la marca vieja. La privacidad lleva
  el correo de contacto `hola.ezradesign@gmail.com`, que desde v0.143.1 se lee también sin
  JavaScript (Cloudflare lo escondía).
- **«A tu ritmo» semanal (lo de pago): elegido el 7 de octubre.** Ez aceptó la segunda ronda y
  eligió que el día ya contestado sea **para todos**: «¿Cómo es tu semana?» en la bienvenida
  (gratis), cada mañana la tarjeta del día llega ya contestada, con «Hoy es distinto» (gratis), y el
  lunes una carta corta con lo que ayudó, la semana en cinco barras y uno o dos cambios aplicados con
  «Vale» (premium). Nada de tira semanal en la home. La maqueta está en `archivos/semana/`. **La
  parte gratis está en v0.148.0** (Ez la vio en fotos de la app el 8 oct. y eligió, en el móvil,
  «· como cada jueves» junto al título). Ez quiere que lo de pago sea que la app **te vaya
  conociendo y cada semana adapte los ejercicios a lo que prefieres**, también con el calendario
  conectado a veces: lo siguiente es el motor que aprende («¿te ayudó?», lo hecho y lo saltado,
  «Otra», las horas a las que paras), con la carta del lunes como su cara, enseñado antes en una
  página.
- **Android:** la llave de subida a Play existe desde el 7 de octubre. El original y su contraseña
  están en la carpeta `PACE-llave-play` del usuario de Ez en su PC, y GitHub tiene una copia en los
  secretos del repo, con la que el workflow `Android` firma el AAB en cada push a `main` y lo guarda
  en el borrador de release `vX.Y.Z` (`PACE-X.Y.Z.aab`). El APK de prueba es otra app, «PACE prueba»
  (`com.ezradesign.pace.prueba`).
- **Caza de bugs:** v0.143.2, v0.143.3 y v0.143.4 traen arreglos del móvil (detalle en la tabla de
  abajo). De la lista de Ez no queda nada. Cada arreglo toma el siguiente número de versión libre.
- **Google Play:** identidad y móvil de Ez verificados el 8 de octubre. La guía para Ez es
  `docs/launch/google-play/guia.html`, con la rutina que eligió: el viernes Ez dice «toca Play»,
  Claude elige la versión y escribe sus notas en `SUBIDAS.md`, Ez la sube a la prueba interna y el
  lunes la promociona a la cerrada. Se publica en todo el mundo, con la ficha también en inglés
  (`ficha.md`). Faltan testers: tiene 5 o 6 de unos 15 (mensajes de WhatsApp y LinkedIn en
  `testers.md`).

## Qué es PACE

App de pausas activas para quien trabaja sentado: Foco (Pomodoro), Respira, Mueve, Estira, Hidrátate,
logros y «A tu ritmo», una guía del día que reparte bloques de foco y pausas. Web/PWA en
https://pacegrass.app (Cloudflare Pages publica cada push a `main`, y `paceweb.pages.dev` sirve lo
mismo) y Android con Capacitor 8 (el workflow `Android` compila un APK de prueba, artefacto
`pace-android-debug`). React 18 sin bundler. El objetivo de Ez es **vender pronto**: v1.0 es la
primera versión de pago, en web y Android.

## Cómo trabaja Ez

- Se le habla en español, con frases completas y sin jerga. No se maneja con cuentas ni ajustes: si
  hace falta que configure algo, pasos numerados y concretos, o evitarlo.
- Delega con facilidad («abre los que tú recomiendes»): se elige, se dice cuál y se sigue.
- Antes de un cambio visual quiere una maqueta con opciones y una recomendación, y elige él.
- Commits directos a `main`, sin PR y **sin línea `Co-Authored-By`**. Varios hilos pueden subir a la
  vez: `git pull` justo antes del push, ediciones pequeñas en `STATE.md`, y quien sube segundo toma
  el siguiente número de versión. Los cambios solo de documentación no suben versión.
- Diseña recursos (música, glifos) en herramientas externas de IA y agradece un brief listo para
  pegar en un `.md`.
- Las auditorías son de solo lectura hasta que Ez decide.
- Móvil de pruebas: Doogee Blade 20 Max (360×718). El APK ya corre ahí.

## Decisiones de Ez que siguen en pie

- **v1 = web + Android, dos planes** (Ez, 15 oct.): 2,99 € al mes con 7 días gratis, o 19,99 € de
  por vida. Gratis: Pomodoro, «A tu ritmo» del día, 34 rutinas, Hidrátate, logros y las estadísticas
  de Hoy y de la Semana. De pago (PACE completo): «A tu ritmo» semanal, 19 rutinas premium, el
  constructor de rutinas y las estadísticas de mes y año.
- **Cómo se cobra** (Ez, 15 oct.; `DECISIONES_PRODUCTO.md`): en la web, Stripe en modo «vende por ti»
  y el código lo firma una función de Cloudflare con la llave k2; en Android, Play Billing. Todo abre
  un único interruptor, `app/state-entitlement.jsx`. Ez descartó la prueba de pago de 3 días a 3,99 €.
- **Hasta v1 las rutinas premium están abiertas para todos** (`PREMIUM_ABIERTO_HASTA_V1`), con su
  «Premium». El constructor sigue cerrado salvo con código.
- **PACE completo y el código de por vida de los testers** (8 oct. 2026). Ez eligió la
  tarjeta cerrada con candado de línea fina y la invitación al tocarla; se tomó la opción B
  (semana de estadísticas gratis; mes, año y «qué te ayuda» de pago), propuesta en
  `docs/proposals/premium-pace-completo.html`. En la web el código es un enlace firmado que la app
  comprueba sin servidor; la llave privada la crea Ez en su PC con `npm run licencia:llaves`
  (carpeta `~/PACE-llave-licencias`, fuera del repo) y cada enlace sale con
  `npm run licencia:codigo -- N`. En Android, Google Play no deja códigos propios: los testers
  recibirán un código promocional de Play del producto «PACE completo» (hasta 500 por trimestre)
  cuando la app lleve Play Billing (Fase 6).
- Travesías y Caminos fuera de v1 (Caminos ocultos con `SHOW_CAMINOS` en `app/flags.js`).
- Icono de la app: Crema. Estilo del aro: «Aro grande». Id de la app: `com.ezradesign.pace`.
- Home del móvil: por libre, el móvil lleva la tarjeta corta de «A tu ritmo» (v0.141.0, sin «A TU
  RITMO» desde v0.146.0): «¿Cuánto trabajas hoy?», la línea del día sin horas, «Tú eliges las horas»
  y la píldora «Comienza →» en estilo «papel tonal». El escritorio no cambia.
- La home del móvil no pide scroll en ningún momento desde 360×640, en los dos idiomas (v0.146.0,
  «no quiero scroll de ninguna forma»); a 320×568 se acepta. Una lista (la hoja de «Ver todo») sí
  se desplaza.
- Motivo de las pausas de Respira: «Bajar revoluciones» · «Slow down».
- Mueve y Estira se pausan al salir de su pantalla (lo vigila un test).
- «Al calendario» en «A tu ritmo» (v0.140.0): calendario del móvil en Android (reuniones leídas en el
  dispositivo como «Ocupado», sin nombre), Google Calendar y Outlook en la web y un `.ics` en los dos.
- Música de Respira: seis pistas, una por familia (energía, equilibrio, balance-10, balance-12,
  relajación, pranayama), con una firma sonora común, en Sol. Sin percusión, banda 200 Hz–2 kHz,
  volumen plano, en bucle. Solo valen las generadas con ElevenLabs pidiendo la tonalidad de Sol. Las
  mareas de Balance de 10 y 12 s las sintetiza Claude exactas sobre un drone de Sol. Coherente 432
  nunca lleva música. El código que la carga es `app/ui/Sound.musica.jsx`.
- Glifos nuevos: misma familia y estilo que los 59 dibujos existentes. Ez rechazó figuras vestidas.
- Runner de Mueve y Estira: opción A, «Mando de tres» (7 oct.). Nada espera a un toque y la rutina se
  sigue por el oído. La eligió frente a las manos libres (B) y a dejarlo como estaba, ordenado (C).
- Escala con el zoom del navegador: opción 2, «Lienzo que crece» (7 oct.), hecha en v0.145.0 y también
  en monitores grandes al 100 % (Ez, 8 oct., viendo el prototipo).
- El Foco personalizado no baja de 5 minutos. Del rótulo del aro solo queda la hora («Hasta las…»).
- Logros: ningún título se repite («La rueda del año», «Bisagra suelta»).

## Líneas abiertas y su siguiente paso

| Línea | Dónde está | Siguiente paso |
|---|---|---|
| Home del móvil | Hecha en v0.146.0: la pregunta con el horario como una línea (la B), y ningún momento de la home pide scroll desde 360×640 en los dos idiomas (lo vigila `tests/home-sin-scroll.spec.js`). | Nada. Si algo añade alto a la home del móvil, se mide con esa prueba antes de subirlo. |
| Android, Fase 2 | v0.142.0: el aviso de Foco llega a su hora sin abrir ajustes, lleva la vaca, icono de avisos (la C), `privacy.html` cubre la app y el workflow firma el AAB con la llave de subida, que está en los secretos desde el 7 oct. | Crear la app en Play Console, subir `PACE-X.Y.Z.aab` (borrador de release de su versión) a la prueba interna, probarla en el móvil de Ez y abrir la prueba cerrada. Antes, Ez exporta «Tus datos» del APK de prueba viejo y lo desinstala (choca con la de Play). |
| Ficha de Google Play | Lista en `docs/launch/google-play/`: textos, respuestas de contenido (no recoge datos, 18+), icono, gráfico, capturas y el kit de testers. | Subirla ya (identidad aprobada el 8 oct.), en español y en inglés y para todos los países. Las URLs ya usan `pacegrass.app` y el correo de contacto es `hola.ezradesign@gmail.com`. |
| Dominio propio | Hecho en v0.143.0: `pacegrass.app`, comprado por Ez en Cloudflare, sirve la app en la raíz y `paceweb.pages.dev` sigue abierto sin redirigir (los datos son de cada dominio). | Nada. `www.pacegrass.app` no tiene DNS: si Ez la quiere, se añade en Cloudflare. |
| Landing | No hace falta ya. Hará falta antes de la verificación de Google y antes de vender. | Entonces: landing en la raíz y la app en `/app` del mismo dominio, con maqueta antes. |
| Calendario con Google y Microsoft | Hecho en código; sin ids la web solo ofrece el `.ics`. | Ez da de alta PACE en Google Cloud y Microsoft Entra (`docs/CALENDARIO_ALTAS.md`) y pasa los dos ids, que van en `CALENDARIO_IDS` de `app/ritmo/ritmo.calendario.web.js`. Con Google, verificación antes de pasar de 100 usuarios. |
| Música de Respira | Aprobada por Ez el 8 oct.: tres drones en Sol (claro, cálido y menor) que respiran con la fase, quietos con ciclos de menos de 5 s y sin sonar en Coherente 432. El mismo día eligió un drone por técnica, hecho en directo con esos tres (`PACE_MUSICA_TECNICA`), y el 9 oct. las «marcadas», que se distinguen de verdad; las oyó en la app y dijo que suenan bien. | Si una deja de convencer: se toca su `m` en `archivos/musica-respira/por-tecnica/tecnicas.js`, se mide con `construir.js` hasta «Sin avisos» (también que no quede a menos de 6 de su vecina) y se copian receta y `ajusteDb`. Si una no se arregla así, se graba con `brief-B-por-tecnica.md`. |
| Glifos | Faltan 2 de ejercicio (rana y pica en escritorio; el descanso ya usa la figura que respira), 6 que rehacer porque no casan con su ejercicio (`archivos/glifos/revision-glifos.html`) y 19 de los 96 de logro. GPT Image bloquea las figuras desnudas y Ez no las quiere vestidas. | Rehacer los prompts desde el preámbulo con el que se hicieron los 59, sin ropa y sin que salte el filtro. Prompts y nombres de archivo en `archivos/glifos/prompts-glifos.md`. |
| «A tu ritmo» semanal | Es lo que se paga en v1 (Fase 3). La parte gratis (la semana en la bienvenida y en Ajustes, y el día ya contestado) está en v0.148.0. | El motor que aprende de cada persona y adapta la semana, con la carta del lunes (premium): primero una página para Ez con qué aprende, con qué datos y cómo lo cuenta. |
| Caza de bugs | v0.143.2: «Primera calistenia» y «Primer estirón» iban cruzados entre Mueve y Estira y los logros decían «Extra»; arreglado, y a quien ya los tenía se le corrigen solos. v0.143.3: la cuenta atrás de las sesiones pisaba su frase en el móvil. v0.143.4: la preparación de Mueve y Estira decía «De pie» en las 8 rutinas de silla y las 2 de suelo; en Android la bienvenida decía «en tu navegador»; a 360 px los botones de Hidrátate partían su texto; cuando la pausa proponía agua, su botón decía «Empezar» y no sumaba nada (ahora «Un vaso más», que lo suma; decisión de Ez, que dejó «Muévete» como está y eligió «En la silla»). Revisadas a 360 y 1280 la home, logros, estadísticas, ajustes, las tres bibliotecas y la entrada a las sesiones; a 360, en español e inglés, Foco en marcha, el menú de pausa, Hidrátate, la bienvenida y una sesión entera de Respira, Mueve y Estira. | La lista de Ez ya no tiene nada pendiente (Ez, 7 oct.). Después, una búsqueda en paralelo dejó 37 hallazgos SIN VERIFICAR en `CAZA_BUGS_7OCT.md` (modo oscuro, inglés, Respira e Hidrátate): reproducirlos uno a uno y arreglar los que se confirmen. El 8 de octubre, v0.148.2 arregla seis que no cambian lo que se ve (respira-4, 7, 8 y 11, ingles-9 y el `lang` de ingles-6); los que cambian algo visible, con antes y después, esperan la elección de Ez. Sin revisar: Foco, el estado guardado y la pantalla de «A tu ritmo» por dentro (la está tocando el hilo de la semana). |
| PACE completo y códigos de tester | En `main` desde v0.157.0 (12 oct.): candado, invitación, «Para ahora» sin cerradas, la licencia firmada (`app/state-licencia.js`), su fila de Ajustes y los scripts. La llave existe desde el 9 oct. (la pública, `k1`, en `app/licencia.llaves.js`; la privada, en `PACE-llave-licencias` del PC de Ez) y los 15 enlaces de tester, desde el 12 oct., en `codigos-tester.csv` de esa carpeta. | Ez manda a cada tester su enlace y apunta a quién da cuál. En la Fase 6, Play Billing con el producto «PACE completo» y sus códigos promocionales para los testers de Android. Las estadísticas de mes y año se cierran con la Fase 4. Cómo se cobra en la web (Stripe, firma automática con k2, 2,99 € al mes con 7 días gratis y 19,99 € de por vida, landing en `/premium`), decidido por Ez el 15 oct.: `DECISIONES_PRODUCTO.md`. |
| Escala con el zoom | Hecha en v0.145.0 (`app/main/_lienzo.js`), medida del 90 al 33 % y en monitores de 1080p y 1440p. | Mirarla en Safari de Mac si alguien lo usa. Nada más. |

## Lo que espera a Ez

1. Copiar la carpeta `PACE-llave-play` de su PC (la llave de subida a Play) en su disco duro, con
   la contraseña aparte.
2. Dar de alta PACE en Google Cloud y Microsoft Entra y pasar los ids.
3. Crear la app en Play Console y reunir unos 15 testers con Android (Google pide 12 durante 14
   días; tiene 5 o 6).
4. Nuevas tomas de música con ElevenLabs (2 o 3 de pranayama con tanpura) y los glifos que falten.
5. En su PC, una vez: `npm run licencia:llaves` (o pedírselo a Claude allí) y una copia de la carpeta
   `PACE-llave-licencias` fuera del ordenador, como la de Play. Luego, la lista de testers (número y
   si usan web, Android o los dos) y `npm run licencia:codigo -- 1-15` para sus enlaces.

## Maquetas publicadas (cuenta anterior)

- Tarjeta por libre en el móvil (elegida la R3-tono): https://claude.ai/artifact/2jmBfnmmpq1K66372JwQTa
- PACE al calendario: https://claude.ai/artifact/MAK3Wc3LuK5RqnxLo2Crri
- Icono de avisos (elegida la C): https://claude.ai/artifact/AeRGsq65WfvGm8DXe8aEZu
- Imágenes guardadas en el repo: `archivos/tarjeta-hoy/` y `archivos/home-movil/`.

## Lo que no está en el repo, a propósito

Claves, contraseñas, tokens y correos personales no se suben nunca. La llave de Play va en los
secretos de GitHub, y su original, con la contraseña, en la carpeta `PACE-llave-play` del PC de Ez.
La llave privada de los códigos de PACE completo vive en `~/PACE-llave-licencias` del PC de Ez, con
la lista de enlaces dados (`codigos-tester.csv`); `verify` falla si una llave privada entra aquí.
El correo de contacto de PACE, `hola.ezradesign@gmail.com`, sí está: es público a propósito
(privacidad y ficha de Play). El historial de las conversaciones no se migra: lo que importa está
aquí y en `git log`.

## Relevo de la noche del 8 oct. (la cuenta coordinadora se quedó sin sesión)

`main` va por **v0.150.1**, con la suite entera en verde en el PC de Ez y la CI en verde hasta v0.150.0
(la de v0.150.1, si no consta, se mira con `gh run list --branch main`). Había cuatro sesiones en
paralelo en la cuenta que se acabó; cada una sube solo a su rama y deja un bloque `TRASPASO:` en su
último commit (`git log -1 origin/<rama>`):

- `claude/caza-bugs-final`: monta las nueve respuestas de Ez de la caza (resumen arriba, en la línea
  de `claude/caza-bugs-propuestas`), una prueba por arreglo y fotos de lo nuevo para Ez. Si quedó a
  medias, se retoma desde su TRASPASO.
- `claude/pausa-elegante`: página de la pausa más elegante (fotos, opciones, recomendación).
  En la pausa solo se enseñan Intro y Esc.
- `claude/sidebar-propuesta`: segunda vuelta en `main` (merge d0da2c5), publicada en
  https://claude.ai/artifact/CQwq5epfkXUN8m8m25cM2S. Ez elige: Cuaderno con la pausa o la B,
  el dibujo de la semana (recomendado «Brotes»), las frases y qué número de vasos manda. Ya dijo:
  barras de minutos «mucho más elegantes», el pie en texto y la racha de vuelta.
- `claude/respira-drones-por-tecnica`: terminada, encima de `claude/respira-musica-drones`. Ez
  eligió las marcadas el 9 oct. y, oídas en la app, dijo «suenan bien, súbelas»: las dos ramas de
  música suben juntas.

La sesión nueva es la **coordinadora** (docs/WORKFLOW.md §9): la única que sube a `main`. Junta cada
rama cuando diga «LISTO PARA MAIN», pone la versión, construye, pasa la suite entera con un
`PACE_E2E_PORT` propio y vigila la CI. A Ez no se le repiten preguntas que ya contesta en una sesión
en paralelo; se le guía en lo que no tiene sesión. Espera a Ez, sin sesión: los ids del calendario,
la llave y la lista de testers para los códigos, y la propuesta de textos de logros si la conserva.

## Frase de arranque para la otra cuenta

> Eres la coordinadora de PACE. Lee CLAUDE.md, STATE.md y el primer bloque de
> docs/traspaso/relevo-coordinadora-22oct.md, y sigue desde ahí: lo que falta para vender y los avisos del iPhone
> están en sus ramas. Nunca juntes nada en main sin mi sí. Republica mi hoja de pasos de esta
> cuenta desde docs/traspaso/hoja-de-ruta-20oct.html y dime en pocas líneas dónde estamos y qué espera mi respuesta.
