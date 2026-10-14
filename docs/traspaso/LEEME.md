# Traspaso de PACE: léelo primero

Este archivo es para un Claude que empieza de cero, en esta cuenta o en otra, y tiene que retomar
PACE sin preguntarle a Ez lo que ya se decidió. Junto con `CLAUDE.md` y `STATE.md`, basta para seguir.
Se actualiza en cada hito (regla en `CLAUDE.md`). Última actualización: 14 de octubre de 2026, v0.165.0.

## 14 oct. 2026, tarde: la coordinadora es la sesión de `caza-sesiones`, en esta cuenta

Manda sobre todo lo de abajo. Ez lo decidió: mientras se siga en esta cuenta, coordina la sesión que
trabaja en `.claude/worktrees/caza-sesiones-a8e105` (rama `claude/caza-sesiones-a8e105`, puerto 8794).
Sube a `main` desde su carpeta (`git push origin HEAD:main` tras juntar `origin/main`), así que la
carpeta principal puede ir por detrás de `origin/main`: `git pull` antes de trabajar en ella.

- **AL 91 % (14 oct., 18:35 en Madrid; esta cuenta se repone a las 20:30): v0.165.0 está commiteada en la
  rama y subida a la rama, PERO NO EN `main`.** Lo primero en la cuenta nueva, desde la carpeta de
  `caza-sesiones`:
  1. La suite entera de v0.165.0 dio 638 de 646, con 8 caídas en 5 archivos (`eventos-origen`,
     `pausa-propone`, `pestanas-foco`, `pestanas-pausa` y `home-sin-scroll`), con la suite de
     `pausa-cuello` corriendo a la vez en el 8797. Repetirlas solas:
     `PACE_E2E_PORT=8794 npx playwright test tests/eventos-origen.spec.js tests/pausa-propone.spec.js tests/pestanas-foco.spec.js tests/pestanas-pausa.spec.js tests/home-sin-scroll.spec.js --workers=2`.
     En la vuelta anterior (sin los glifos ni el bump) estos archivos pasaron enteros.
  2. Si salen en verde: `git fetch` y, si `origin/main` no se ha movido, `git push origin HEAD:main` y
     `gh run watch` hasta que `verify` y `e2e` salgan en verde. Si alguna cae sola, mirar si la causa son
     los glifos nuevos o el bump antes de subir.
  3. Después, juntar `pausa-cuello` cuando dé el LISTO.
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
  cada palabra. Quita el clic sea cual sea el archivo y puede ser también lo entrecortado del móvil. Cambia
  cómo suena: Ez lo oye en el portátil y en el móvil antes de subir.
- **`pausa-cuello`** (`.claude/worktrees/pausa-cuello-b4792a`, puerto 8797), abierta a petición de Ez: la
  pausa «Exhalación 4·6 + Cuello» hizo Respira y los 15 minutos, pero no el cuello. Juntarla cuando dé el LISTO.
- **Intermitentes vistos en la suite entera** (pasan solos): `pausa-sin-repetir.spec.js:78` (la home, corrida
  117 px de lado al cerrar la pausa: fallo de verdad que vuelve 1 de cada muchas) y `sw-aviso.safari.spec.js:47`
  en chromium (el service worker no llega a controlar a tiempo con la suite cargada).
- El mortero y la corona de roble que dibujó Ez están en `.old/Glifos_logros`, sin logro (Ez).
- El hilo del calendario sigue sin abrir.
- **Hallazgo de Ez (14 oct., tarde):** en el cierre de Mueve y Estira («Estiramiento completado») el
  dibujo de la rutina sale muy pequeño: unos 90 px de alto en 1920×1080 con la escala de Windows al
  125 % (Brave, zoom 100 %), con mucho aire alrededor. Cambia lo que se ve: opciones pintadas sobre la
  app real y Ez elige.
- **Los 8 dibujos de ejercicio que faltan** (Ez los hace en Genspark con referencias de
  `archivos/glifos/referencias/`): barbilla-atras, hueco-en-silla, 90-90, palmas-al-suelo,
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

- **v1 = web + Android, pago único 19,99 €.** Gratis: Pomodoro, «A tu ritmo» del día, 32 rutinas,
  Hidrátate, logros, estadísticas de Hoy. De pago: «A tu ritmo» semanal, 19 rutinas premium, el
  constructor de rutinas y las estadísticas de semana y año.
- **Los pagos esperan a cerrar Android** (Fase 6 del `ROADMAP.md`). Ruta prevista: Google Play Billing
  en Android y, en la web, Lemon Squeezy o Paddle con una clave firmada que se pega en Ajustes. Todo
  abre un único interruptor, `app/state-entitlement.jsx`. Ez descartó la prueba de pago de 3 días a
  3,99 €; cuando lleguen los pagos sopesará una prueba gratis de 7 días o una suscripción mensual.
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
| PACE completo y códigos de tester | En `main` desde v0.157.0 (12 oct.): candado, invitación, «Para ahora» sin cerradas, la licencia firmada (`app/state-licencia.js`), su fila de Ajustes y los scripts. La llave existe desde el 9 oct. (la pública, `k1`, en `app/licencia.llaves.js`; la privada, en `PACE-llave-licencias` del PC de Ez) y los 15 enlaces de tester, desde el 12 oct., en `codigos-tester.csv` de esa carpeta. | Ez manda a cada tester su enlace y apunta a quién da cuál. En la Fase 6, Play Billing con el producto «PACE completo» y sus códigos promocionales para los testers de Android. Las estadísticas de mes y año se cierran con la Fase 4. |
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

> Retoma el proyecto PACE (repo ezradesign/Pace_app, en esta carpeta) como sesión COORDINADORA. Háblame
> en español, en frases completas y sin jerga. Lee CLAUDE.md, STATE.md y docs/traspaso/LEEME.md, sobre
> todo «12 oct. 2026, noche», que manda sobre lo anterior; solo tú subes a main (docs/WORKFLOW.md §9) y
> usas PACE_E2E_PORT=8775. Comprueba que la CI de v0.157.0 salió en verde (gh run list --branch main) y,
> si no, arréglala antes que nada. Luego retoma la caza en Foco desde el TRASPASO de
> origin/claude/caza-foco-estado-d6bd17 (una sesión en paralelo como mucho), pregúntame lo de las dos
> pestañas con AskUserQuestion y dime en pocas líneas dónde estamos, qué espera mi respuesta y qué harías ahora.
