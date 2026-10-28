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
- **Android** (Fase 2 de `ROADMAP.md`): cada push a `main` compila el APK de prueba y el AAB firmado para
  Play. La prueba cerrada, aprobada el 21 oct. con la 0.174.0; Ez la probó en su móvil el 22 (sus apuntes, ya
  arreglados). **iPhone**, dentro de v1 desde el 22 oct. (Ez): la 0.175.0 en TestFlight, firmada y subida desde
  GitHub sin Mac, y la App Store el mismo día que Android (`DECISIONES_PRODUCTO.md`, «El iPhone entra en v1»).
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

El orden hasta v1, con el estado de cada pieza, está en `ROADMAP.md` («Camino a v1.0», la tabla de 17 puntos), y el
porqué, en la auditoría del 28 oct. (`docs/audits/auditoria-v0.181.1.md`). **La fecha de v1 ya no depende del
código**: la fijan los 12 testers de Android con sus 14 días seguidos, que aún no han empezado, y el alta para cobrar,
que piden Play, Apple y Stripe. Lo inmediato:

1. **Juntar, cada una con el «júntalo» de Ez**: «Qué te ayuda» 0.183.0 (`claude/que-te-ayuda-maqueta-6c3534`, sobre
   sus fotos), Android a fondo 0.182.0 (`claude/android-a-fondo-6edf2e`, después de que Ez la pruebe en su Android) y
   el arreglo de las pruebas que caían de noche (`claude/pruebas-medianoche`, sin versión). El orden y lo que choca,
   en el relevo (`docs/traspaso/relevo-coordinadora-22oct.md`, el bloque del 28 oct.).
2. **Subir la versión juntada a la prueba cerrada de Play y a TestFlight**, que hoy tienen la 0.174.0 y la 0.175.0,
   antes de invitar a nadie. Subidas: `docs/launch/google-play/guia.html`.
3. **El código que falta para vender** (punto 12 del ROADMAP): la valoración de Play tras la quinta pausa entera, el
   paso a v1 sin quitar nada, `/recuperar` y la invitación con los botones de compra. Después, Play Billing y la
   compra de Apple, que esperan las altas de Ez. Stripe se enchufa con su cuenta (`docs/launch/cobro-web.md`). El día
   de v1, «Da de pastar a la vaca» sale de la web (Ez, 18 oct.).
4. **Lo que dejó para después Android a fondo**: los mismos cuatro fallos de los avisos en el iPhone
   (`app/ui/ios.js`), el aviso de fin que no nombra la pausa de «A tu ritmo», los botones de verdad del aviso (la C de
   N4) y `scripts/glifos/generar-pendientes.js`, que cae al arrancar.
5. **STATE.md ya no cabe en una pantalla**: se rehace corto al juntar las dos ramas, con el detalle en el relevo, en
   `CHANGELOG.md` y en DECISIONES.

Riesgo aceptado: dos pestañas que apuntan algo a la vez (el caso 8 de datos, la A de Ez del 22 oct.); lo mide
`tests/pestanas-estado.spec.js`, y un solo escritor en IndexedDB, si alguna vez hace falta, después de v1. Lo de antes
(Play Console paso a paso, las auditorías del 18 y del 21-22 oct., cobrar en la web) está hecho y contado en el
relevo, en `CHANGELOG.md` y en `DECISIONES_PRODUCTO.md`. Cloudflare Pages publica `dist/` con
`node scripts/web-dist.js`.

## Espera a Ez

La lista, por orden y sin jerga, en su hoja de pasos (`docs/traspaso/hoja-de-ruta-20oct.html`). Hay una por cuenta,
porque cada una solo puede poner al día la suya: https://claude.ai/artifact/EcLj6io4wM9pGjtQ5wd1CT y
https://claude.ai/artifact/5iWBfHE7kD3dUVocdskmb6. Ez se pierde con mucho abierto: a «¿qué toca?», una sola cosa.

- **Ahora, tres «júntalo» y un sí**: mirar las fotos de «Qué te ayuda» (https://claude.ai/artifact/1p6iNP6KVETGEBuZKxRPY5,
  de la cuenta de EcLj6…); probar Android a fondo en su Android con el APK «PACE prueba» y sus seis puntos (en
  https://github.com/ezradesign/Pace_app/actions/runs/40580116946, `pace-android-debug`); decir si se junta el arreglo
  de las pruebas de medianoche; y dar el sí para bajar a `subidas-play\` el AAB de la versión juntada.
- **Lo que fija la fecha de v1**: con esa versión en la prueba cerrada, reunir unos 15 testers (tiene 5 o 6; `/beta`
  y el grupo están listos, falta difundirlos: `testers.md`); el gestor y el alta para cobrar; la cuenta de Stripe con
  Managed Payments (confirmar que la ofrecen en España; si no, Paddle) y los datos del aviso legal; volver a exportar el
  logo (`app/ui/pace-logo.png`: «EVEN» se lee «FVFN», también en /premium).
- **iPhone**: mirar si llegó el correo de Apple que aprueba la prueba beta (enviada el 23 oct.); con él, invitar a sus
  testers con el enlace público del grupo «Testers iPhone», que va también a /beta, y pasarles qué mirar, sobre todo el
  sonido. Para vender: el acuerdo de apps de pago con banco y W-8BEN, el programa para pequeñas empresas y una
  dirección visible en la UE.
- Las altas de PACE en Google Cloud y Microsoft Entra, con sus dos ids (`docs/CALENDARIO_ALTAS.md`; para el llavero, el
  cliente de Google como «aplicación web» con su secreto). Sin ellas, el calendario automático de la web no funciona
  para nadie, y abrirlo a todo el mundo pide que Google verifique la app, que tarda semanas: si se quiere en v1, son
  lo más urgente tras los testers.
- Copiar `PACE-llave-play` y `PACE-llave-licencias` a su disco duro, y mandar a cada tester su enlace de
  `codigos-tester.csv` (funcionan en la web).
- «Avísame»: el nombre que firma su privacidad, el KV `pace-avisame` conectado como `AVISAME` y el token de Web
  Analytics solo para /premium (con él, `verify` pide que `privacy.html` lo diga); mirar el registro previo de Play.
- **Mueve y Estira** (1A 2A 3A 4A de Ez, en `main` desde la 0.176.0 y con la revisión de ChatGPT en la 0.181.1): quedan
  seis fichas con la colocación escrita que no se ve nunca, para otra tanda si Ez quiere (fila de
  `DECISIONES_TECNICAS_VIGENTES.md`), y los dibujos de Ez.
- Los dibujos que faltan: la cuenta, en `docs/product/GLIFOS_A_DIBUJAR.md` (38); los 16 de ejercicios, por orden y con
  «Copiar», en https://claude.ai/artifact/6RsAsyovu4emmzHhWjhMLT (de la cuenta de EcLj6…), a `Pace_app\dibujos-22oct`.
- Leer `privacy.html` (es pública) y probar en su Android el calendario que se mantiene solo.
- Oír la voz de Respira en pacegrass.app (con fundido desde la 0.167.0, `PACE_VOZ_FUNDIDO`) y los cuencos de Mueve y
  Estira; grabar «Más» y «More» del suspiro (`encargos-16oct/PROMPTS_AUDIO_SUSPIRO.md`).
- Apagar las propuestas automáticas de Dependabot, dejando las alertas.
- Con su sí, limpiar lo ya juntado: 16 ramas locales, 16 en GitHub y 7 worktrees, con copia en un bundle.

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
