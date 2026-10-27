# PACE · Estado

**Versión:** v0.181.1 · 27 de octubre de 2026. Qué trajo cada versión: `CHANGELOG.md`. Las reglas que
no se pueden romper: `docs/product/DECISIONES_TECNICAS_VIGENTES.md`.

## Dónde estamos

- **Web** en https://pacegrass.app (y `paceweb.pages.dev`, sin redirigir), con `/premium` y su lista
  «Avísame», que se enciende al conectar el KV (`docs/launch/avisame.md`), y desde v0.174.7 `/beta`
  para que los testers de Android se apunten solos (sus dos enlaces, el grupo `pace-tests` y la prueba
  de Play, encendidos el 23 oct.); las dos con la letra y los botones de la app. Desde el 23 oct. por la noche,
  /premium enseña lo de pago en un mosaico de capturas de la app real (Ez eligió la B; las rehace
  `scripts/play/capturas-premium.js`).
- **Android** (Fase 2 de `ROADMAP.md`) hecho en código y sin probar en un móvil: cada push a `main`
  compila el APK de prueba y el AAB firmado para Play. **iPhone** preparado (v0.164.0) y, desde el 22
  oct., **dentro de v1** (Ez): TestFlight en cuanto haya cuenta de Apple, y la App Store el mismo día que
  Android (`DECISIONES_PRODUCTO.md`, «El iPhone entra en v1»).
- **«A tu ritmo»** sirve el día según tu semana, elige cada pausa con lógica, lleva el día al
  calendario y, desde v0.173.0, aprende de tu semana (`app/ritmo/ritmo.motor.js`, la carta del lunes).
  Desde v0.174.0 cada día mueve el cuerpo entero y equilibrado (gratis) y, con PACE completo, las
  rutinas cambian de un día a otro (`puedeVariar`). v0.174.2 arregla seis casos de la auditoría del 21 oct.
  (reuniones, la jornada en plena comida como eligió Ez, y el aro con las pausas). v0.174.4, once de
  «Tus rutinas», el cierre de Mueve/Estira y Estadísticas (Ez eligió las cinco recomendadas sobre la
  maqueta `docs/proposals/rutinas-y-cifras-auditoria.html`, https://claude.ai/artifact/XdRVMjxUYbQR4iNoLH84DW).
  v0.174.5, cinco del móvil de Ez y de la auditoría del 22 oct. (M1, M3, M5, A8, A9): entre ellos, los
  logros solo con la sesión entera, como decidió Ez. v0.174.6, las 1A 2A 3A de Ez: la app abre siempre con
  los módulos y «Comienza» abre la pregunta del día, los Ajustes del móvil sin scroll y la voz grave con su
  «exhala» en Rondas. v0.175.0, las pausas con bloques cortos (Ez: 4a A · 4b A · 4c A · 5a A · 5b B): con el
  aro a 5, 10 o 15, «Un momento para moverte» con «Ver ejercicio», que abre una hoja con uno de los 31
  ejercicios revisados y lleva a la pantalla de ejercicio (solo suma minutos).
- **PACE completo**, abierto hasta v1 (`PREMIUM_ABIERTO_HASTA_V1`): toda compra pasa por
  `app/state-entitlement.jsx`, con tiendas aún vacías (`app/state-compra.js`); en la web, un código de
  por vida firmado lo abre todo. Desde v0.180.0 la bienvenida acaba en PACE completo, abierto, y en una visita
  guiada por la home (Ez, 1C 2A 3A del 27 oct.). «Qué te ayuda» (Estadísticas) sigue sin hacer y ya puede leer
  `ritmo.aprendido`. Los Caminos, ocultos hasta después de v1 (`SHOW_CAMINOS`).

## Lo siguiente

0. **Play Console, con Ez paso a paso** (20 oct.; la página de pasos de Ez, abajo): app creada como
   «PACE: Pomodoro, Break Reminder», en inglés como idioma principal y Gratis (`nombre-en-play.html`).
   **21 oct.: cuestionarios y ficha hechos (capturas nuevas, logo de Ez de gráfico, IA sin etiquetar) y
   la prueba cerrada APROBADA** (21 oct., 23:40) con 0.174.0 y todos los países. El 22 oct. Ez puso de
   testers el grupo `pace-tests@googlegroups.com` (sustituye a la lista) y lo envió a revisión: cuando
   el Resumen de la publicación no tenga nada en revisión, LinkedIn y avisar a sus dos testers
   (`testers.md`). «Tus rutinas» se abrió
   hasta v1 (v0.173.3) para que el acceso restringido sea «No» de verdad: se sube 0.174.0 o posterior.
   Gráfico destacado nuevo, el logo de Ez (`grafico/logo-ez.jpg`); las capturas se rehacen con 0.174.0.
1. **Fase 2**: probar el APK en un móvil (icono, arranque de día y de noche, importar una copia, que lo
   guardado sobreviva a una actualización, el aviso de Foco). Subidas: `docs/launch/google-play/guia.html`.
2. **Antes de cobrar** (Ez, 16 oct.), cada uno en su sesión: **los días diseñados**, en `main` con
   v0.174.0 (Ez los aprobó mirando la semana, https://claude.ai/artifact/HjcDYcPgAm4fG13uMvKaVm, el
   20 oct.). Y, del calendario total en la web, **el llavero** (Ez, 18 oct.; espera sus
   altas). La revisión de los ejercicios y el motor de la semana, hechos; lo total con PACE
   cerrado, después de v1.
3. **Fase 6, tras /premium**: **cobrar en la web sin Stripe, en `main` con v0.178.0**
   (26 oct.): la firma con k2 en una función, la página de gracias (1A de Ez), el aviso dos días antes del
   fin de la prueba (2A), «Gestionar» en Ajustes (3A), la renovación de la mensual y «sin red» frente a «terminada».
   Apagado hasta que Ez tenga Stripe y siga `docs/launch/cobro-web.md` (k2, Cloudflare y los enlaces). Falta la
   invitación con los botones de compra y lo legal de /premium.
   El día de v1, «Da de pastar a la vaca» sale de la web (Ez, 18 oct.).
4. **Auditoría externa del 21 oct.**: los trece casos de datos (v0.174.1) y los seis de «A tu
   ritmo», el calendario y el aro (v0.174.2), en `main` el 22 oct. con el sí de Ez. De la del 22 oct.,
   tres del calendario que se mantiene solo, en `main` con v0.174.3 (22 oct., con el
   sí de Ez): «Desconectar» corta lo pedido y en Android deja de leer, y la hoja dice los
   cuatro casos que eligió Ez (A, `docs/traspaso/archivos/calendario-estado-22oct/tabla.md`). El 8, dos pestañas que apuntan algo a la vez (se pierde una escritura a 0-10 ms;
   a 100 ms, nunca), Ez lo acepta como riesgo (A, 22 oct.): lo mide `tests/pestanas-estado.spec.js`,
   estado-4. Un solo escritor en IndexedDB, si alguna vez hace falta, después de v1.
5. **Auditoría del 18 oct.** (`docs/audits/auditoria-v0.173.0.md`, página para Ez en
   https://claude.ai/artifact/7YxZbjgoK33rtT5C84wnGs): la pasada de texto y el e2e en dos trozos,
   hechos. Ez decidió (`DECISIONES_PRODUCTO.md`, «Tras la auditoría del 18 oct.»): pacegrass.app
   publica solo la app, lo de PACE va al calendario como **libre** y el llavero entra en v1. «Libre»
   en el calendario (v0.173.1) y publicar solo la app (v0.173.2, `dist/` con `scripts/web-dist.js`),
   en `main` desde el 20 oct. con el sí de Ez, que ese día puso en Cloudflare Pages el comando
   `node scripts/web-dist.js` y la salida `dist`. Las ramas ya juntadas, borradas (copia en
   `PACE-ramas-borradas-18oct.bundle`, junto a la carpeta del proyecto), y las sesiones terminadas,
   archivadas.

## Espera a Ez

La lista, por orden y sin jerga, en la hoja de ruta del 20 oct.
(`docs/traspaso/hoja-de-ruta-20oct.html`, una por cuenta, porque cada una solo puede poner al día la suya: https://claude.ai/artifact/EcLj6io4wM9pGjtQ5wd1CT
y, desde el 22 oct. por la tarde, https://claude.ai/artifact/5iWBfHE7kD3dUVocdskmb6). Ez se
pierde con mucho abierto: a «¿qué toca?», una sola cosa.

- **Mueve y Estira: Ez eligió 1A 2A 3A 4A** (23 oct., sobre
  https://claude.ai/artifact/9L6RZTPCYpZH57iywsNnHE; `DECISIONES_PRODUCTO.md`). **En `main`**: los textos como v0.175.2
  (24 oct.) y las tres capas, los seis ejercicios nuevos y lo gratis como v0.176.0 (25 oct.), los dos con el sí de Ez
  sobre sus fotos; los logros de ATG y Ancestral, con su A. **La revisión de ChatGPT de los textos nuevos**, en `main`
  con v0.181.1 (27 oct., con el sí de Ez sobre https://claude.ai/artifact/9Y61HfjdAKzQGKJFGNKUPq). Quedan seis fichas
  con la colocación escrita que no se ve nunca (un ejercicio tras un descanso no la enseña; fila de
  `DECISIONES_TECNICAS_VIGENTES.md`): otra tanda, si Ez quiere. Faltan los dibujos de Ez. Detalle en el relevo, «23 oct., noche».
- **Lo que fija la fecha de v1**: crear la app en Play Console, subir el AAB y reunir unos 15 testers
  (tiene 5 o 6; el grupo y `/beta` ya están, falta difundirlos: `testers.md`); el
  gestor, la cuenta de Stripe con Managed Payments y los datos del aviso legal; volver a exportar
  el logo (`app/ui/pace-logo.png`: «EVEN» se lee «FVFN», también en /premium).
- Copiar `PACE-llave-play` y `PACE-llave-licencias` a su disco duro y mandar a cada tester su enlace
  de `codigos-tester.csv` (funcionan en la web).
- «Avísame»: el nombre que firma su privacidad, el KV `pace-avisame` conectado como `AVISAME` y el
  token de Web Analytics solo para /premium (con él, `verify` pide que `privacy.html` lo diga); mirar el
  registro previo de Play.
- Las altas de PACE en Google Cloud y Microsoft Entra, con sus dos ids (`docs/CALENDARIO_ALTAS.md`; para el
  llavero, el cliente de Google como «aplicación web» con su secreto).
- Leer `privacy.html` (es pública) y probar en su Android el calendario que se mantiene solo.
- Oír la voz de Respira en pacegrass.app (desde v0.167.0 con fundido, `PACE_VOZ_FUNDIDO`) y los
  cuencos de Mueve y Estira; grabar «Más» y «More» del suspiro (`encargos-16oct/PROMPTS_AUDIO_SUSPIRO.md`).
- Los dibujos que faltan: la cuenta, en `docs/product/GLIFOS_A_DIBUJAR.md` (38); los 16 de ejercicios, por orden y con
  «Copiar», en https://claude.ai/artifact/6RsAsyovu4emmzHhWjhMLT, a `Pace_app\dibujos-22oct` (vacía el 27 oct.).
- iPhone, que ahora fija la fecha de v1 junto a Play: la cuenta de Apple Developer, validada el 23 oct.;
  falta su llave (`docs/launch/app-store/guia.html`, punto 4), y pasar a sus testers qué mirar, sobre todo el sonido.
- Apagar las propuestas automáticas de Dependabot, dejando las alertas.

## Deuda conocida, sin fecha

- A 320×568 la home del móvil pide scroll (Ez lo acepta) · las escenas con scroll anteriores a
  v0.130.0.
- En «A tu ritmo»: el cierre que nunca es «Ahora», la lectura C (espera a que `origin` tenga semanas
  de datos) y la tarde sin rutinas de pie con el aro a 10 o 15 (falta contenido de pie). La barra de
  arriba pregunta antes de dejar un Foco empezado, pero no una pausa empezada (pide un texto nuevo).
- **De la auditoría externa del 21-22 oct. (ChatGPT), en cola por sesiones** (máximo dos a la vez; la
  coordinadora junta): «Tus rutinas» y Estadísticas, en `main` con v0.174.4 (22 oct., con el sí de Ez y la
  frase que eligió para la pared opcional) · **bienvenida y Ajustes, en `main` con v0.180.0** (27 oct., con la 1C 2A 3A
  que eligió Ez y su sí sobre las fotos) (A1 el idioma elegido en la bienvenida no quita
  «Auto», A2 el Atrás de Android no hace nada en la bienvenida, A3 volver atrás borra el borrador de
  «Tu semana», A4 ajustes de audio atenuados que se cambian con teclado, A5 el foco se pierde al
  cambiar de paso, A7 interruptores de 18 px; A6, la copia de Android, ya en v0.174.1; A8 y A9, en
  v0.174.5) ·
  **avisos de Android** tras la prueba en el móvil de Ez (A1 campana
  doble al volver, A2 cancelar el aviso antes de que llegue, A3 «programado» antes de saber si se
  programó, A4 permiso de notificaciones sin refrescar) · **seguridad antes de cobrar** (S1
  `premiumUnlocked` abre sin compra, S2 licencia aceptada antes de verificarla, S4 «Avísame» sin
  límites, S5 CSP, S6 en Android los eventos de PACE se reconocen por texto), **en `main` con v0.177.0**
  (con el sí de Ez); S3, código portable, es la decisión de Ez · **la hora y la medianoche** (H1-H3 la hora repetida del 25 oct.,
  H4 licencia con fecha caduca 1 h antes, H5 bloque de antes de medianoche según si la página vivió),
  **en `main` con v0.181.0** y la voz de Respira (27 oct., con el sí de Ez; `tests/hora-y-medianoche.spec.js`) ·
  **el puente del calendario de Android** (de C2, 22 oct.): `paceAndroidLlamar` se traga los
  errores, así que una lista que falla se lee como un calendario vacío, PACE puede volver a crear lo
  que ya estaba y en Android nunca sale «No se pudo».
- **Al volver los Caminos** (después de v1; hoy `SHOW_CAMINOS = false`), tres casos de la auditoría
  externa del 21 oct.: terminar un paso de cuerpo dentro de un Camino borra `pace.cuerpo.v1` de otra
  rutina a medias (`olvidarCuerpoGuardada` con `inPath`); «¿Salir del Camino?» no suspende la sesión
  de debajo (Respira sigue y acredita); y esa confirmación no encierra el Tab ni usa `usePaceDialogo`.
- **Del móvil de Ez** (22 oct., la prueba interna en su Android; M1, M3 y M5 en v0.174.5; M4, M6 y M7, sus
  1A 2A 3A, en v0.174.6; M2, las pausas con bloques cortos, en v0.175.0, juntada el 23 oct. con el sí de Ez):
  queda el aviso a mitad de un bloque largo (la segunda parte de ChatGPT), después de verlo.
- **Del móvil de Ez, 23 oct.** (0.174.0): **Mueve y Estira de fondo**, lo primero tras v0.175.0 (dibujos que no
  casan, estiramientos dentro de Mueve, banda y barra aparte y saltables, rutinas casi iguales, más fuerza en
  Mueve), en v0.176.0; N2 (las franjas del móvil con la paleta) en v0.176.1; N5-N8 (1A 2A 3C 4B de Ez sobre la
  maqueta https://claude.ai/artifact/MLCNMXzaDjwLiZ2K1Rmero) en v0.176.2. Quedan N4 (aviso con el móvil bloqueado)
  y N9 (la barra lateral durante un Foco: no se reproduce; falta el vídeo de Ez). Detalle en la cola de
  `docs/traspaso/relevo-coordinadora-22oct.md`, punto 1c.
- **Lo que prometemos sobre los datos** (P1-P5, ChatGPT, 22 oct.): **en `main` con v0.179.0** (26 oct.)
  con el 1A 2A 3A de Ez sobre
  https://claude.ai/artifact/QMy8fBJtxgf4SR8weSi7wY. Queda la 1A en el calendario del móvil: marcar privado lo
  que PACE escribe ahí pide una pieza nativa propia (el complemento no tiene `ACCESS_LEVEL`) que Ez prueba en su
  Android; hasta entonces `privacy.html` dice que ahí cada pausa va con su nombre. Play y App Store no cambian
  ninguna respuesta hasta la compra dentro de las apps.
- Tests del estado más allá del saneador · i18n con plurales y pseudolocalización · las deudas de
  claves D-1, D-2 y D-3.

El `STATE.md` anterior, con el mapa de archivos, el índice de decisiones y el backlog antiguo, está en
`docs/archive/STATE_HASTA_S200.md`.
