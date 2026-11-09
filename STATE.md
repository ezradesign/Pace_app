# PACE · Estado

**Versión:** v0.194.0 · 8 de noviembre de 2026 (la versión de prueba de Play y TestFlight es la 0.191.1). Qué trajo cada versión: `CHANGELOG.md`. Las reglas que
no se pueden romper: `docs/product/DECISIONES_TECNICAS_VIGENTES.md`.

## Dónde estamos

- **Web** en https://pacegrass.app (y `paceweb.pages.dev`, sin redirigir), publicada desde `dist/`
  (`node scripts/web-dist.js`): `/premium` con «Avísame» (se enciende al conectar el KV: `docs/launch/avisame.md`),
  `/beta` para que los testers de Android se apunten solos, y `/gracias` y `/recuperar` para quien compre.
- **Android**: cada push a `main` compila el APK de prueba y el AAB firmado (`pace-play-vX.Y.Z`). La prueba cerrada,
  aprobada el 21 oct., tiene la 0.174.0. **iPhone**, dentro de v1 (Ez, 22 oct.): TestFlight tiene la 0.175.0, firmada y
  subida desde GitHub sin Mac, y la App Store sale el mismo día que Android.
- **La app**, entera: Foco, Respira, Mueve, Estira, Hidrátate, logros, Estadísticas con «Qué te ayuda» y «A tu ritmo»,
  que sirve el día según tu semana, lo lleva al calendario y aprende de ti (la carta del lunes).
- **PACE completo**, abierto para todos hasta v1 (`PREMIUM_ABIERTO_HASTA_V1`): toda compra pasa por
  `app/state-entitlement.jsx`, con las tiendas aún vacías (`app/state-compra.js`); en la web lo abre un código firmado
  (k1 los testers, k2 las ventas). Desde la 0.185.0 está montado lo de vender: la hoja del día de v1, `/recuperar`, los
  botones de compra en la invitación y la valoración tras la quinta pausa entera. Los Caminos, ocultos hasta después
  de v1 (`SHOW_CAMINOS`).

## Lo siguiente

El orden hasta v1, en `ROADMAP.md` («Camino a v1.0»), con los paquetes de las ocho revisiones de ChatGPT del 28 oct. (A, B,
T, M, L y V) debajo de su tabla. **La fecha de v1 no depende del código**: la fijan los 12 testers
de Android con sus 14 días seguidos, que aún no han empezado, y el alta para cobrar que piden Play, Apple y Stripe.

1. **Stripe en el modo de prueba, hecho y comprobado** con Ez (4-5 nov.): el aviso, los cuatro enlaces, la llave de lectura
   y dos compras de mentira con su código, que /recuperar devuelve; el modo real, con el gestor. **Los arreglos del cobro
   que encontró ChatGPT (A1-A7), en `main` con la 0.186.0** (29 oct., con el «júntalo» de Ez).
2. **Mueve, Estira y «Tus rutinas», en `main` con la 0.187.0** (29 oct., con el «júntalo» de Ez): B1-B4, C1-C6 y U1-U5
   de las revisiones de ChatGPT, el reparto del runner que dibujó Ez y los catorce dibujos nuevos, con Paloma, Flexor de
   cadera y Sentadilla a silla aclarados. **Y en `main` con la 0.188.0** (30 oct., con el «júntalo» de Ez): la carta del
   lunes para luego con su sobre, la frase del móvil y mirar un ejercicio antes de empezar (U3, U5 y P4; U4 después de v1),
   y los textos que no inventan (paquete T: P1-P3, Q1, Q3, Q6, Q7, CAL-2, CAL-4, CAL-6, /premium y la ficha). Con eso, los
   grupos 1 y 2 de la lista única están hechos salvo cobrar y lo legal; lo demás es del grupo 3, después de v1. **Las ocho
   revisiones, enteras y con lo comprobado de cada una (también R1-R6 y la del calendario), en `docs/audits/chatgpt-28oct/`**: se valoran
   con Ez antes de montar nada.
3. **La versión de prueba, a Play y a TestFlight a la vez, SIN esperar al grupo 2** (Ez, 28 oct., noche: «Sí, sin
   esperar»): la 0.191.1 lleva dentro lo que Ez pidió; el grupo 2 llega como actualizaciones durante los 14 días. **Con su
   sí (6 nov.): el AAB, bajado a `subidas-play\`, y la del iPhone, en TestFlight (191001)**; falta que Ez la suba a Play
   y la dé a sus testers de iPhone (`docs/launch/google-play/SUBIDAS.md`).
4. Después, Play Billing y la compra de Apple (esperan las altas de Ez) y lo legal de /premium. El día de v1, «Da de
   pastar a la vaca» sale de la web (Ez, 18 oct.).

## Espera a Ez

La lista, por orden y sin jerga, en su hoja de pasos (`docs/traspaso/hoja-de-ruta-20oct.html`), una por cuenta:
https://claude.ai/artifact/5iWBfHE7kD3dUVocdskmb6 y https://claude.ai/artifact/EcLj6io4wM9pGjtQ5wd1CT. Ez se pierde
con mucho abierto: a «¿qué toca?», una sola cosa.

- **La versión de prueba, 0.191.1: subirla el lunes 9 nov.** (Ez, 8 nov.: «Mañana, lunes 9»; el sí, del 6). `subidas-play\PACE-0.191.1.aab`, a la prueba interna y
  de ahí a la cerrada, con las notas y el párrafo «A tu ritmo» de `ficha.md`, una pantalla por mensaje; en TestFlight, la 191001
  ya subida, al grupo «Testers iPhone» con su «Qué probar». Notas y capturas, en `docs/launch/google-play/SUBIDAS.md`: `6-logros` y `3-respira` están viejas y las seis se rehacen una sola
  vez, con la jornada dentro. El logo se queda como está por ahora (Ez, 4 nov.), aunque «EVEN» se lea «FVFN» (`app/ui/pace-logo.png`).
- **La 0.194.0, juntada con los «Júntalo» de Ez (8 nov.)**: el contraste (1B 2B 3B), volver tras horas fuera (E1 A, V1 A,
  V2 A), el día de v1 (1B 2A 3B 4A, con «Borrar todo» que dice que el código se queda) y siete arreglos de la caza de la semana.
  Si Play se sube el lunes con la 0.191.1, esta llega como actualización. Detalle, en el relevo de `docs/traspaso/LEEME.md`.
- **Letras de Ez (8 nov.), todas A, montándose (desde ~19:50, en 5iWBf)**: usabilidad 1-5 y la semana S3 S7 S6 S11 en
  `claude/usabilidad-8nov-587b48` (sesión `letras-jornada`, 8886-8887); N2, N3 y la usabilidad 6 en `claude/caza-nuevo-8nov-0c7d9b`
  (sesión `letras-nuevo`, 8891, con N1 arreglado). Cada una deja una página «Montado»; luego el «júntalo» de Ez y la 0.195.0.
  La jornada lleva además los dos arreglos de ChatGPT, hechos. La 6A no entra tal cual: pedía scroll a 360×640, y Ez rechazó el
  aviso que tapaba (9 nov.); se le pintan otras formas.
- **Caza en seis anchos** (9 nov., `claude/caza-anchos-9nov-6a280f`): todas las pantallas con las letras dentro; arregla con
  prueba lo que no cambia el aspecto y pinta para Ez lo demás.
- **ChatGPT**: las dos partes de la revisión de la jornada, comprobadas (`docs/audits/chatgpt-8nov/`). La segunda trae siete
  puntos ciertos (Foco pausado que cuenta su pausa, cadencia que rehace lo hecho, «Cambiar» con Foco en marcha, Estadísticas›Hoy
  sin lo hecho por libre…) que esperan el sí de Ez, para después de la 0.195.0. La del cobro y lo legal sigue en su hoja.
- **Landing C** (9 nov., `claude/landing-c-9nov`): la raíz con dos caras; se pinta para que Ez elija.
- **Después de la 0.195.0** (lo pidió Ez el 8 nov.): la caza de las pantallas en seis anchos (320, 360, 390, 768, 1280 y
  1536), es/en, claro y oscuro, buscando textos cortados y solapes antes de que las vean los testers.
- **Lo legal para vender en la web**, en `main` con la 0.189.0 y las letras de Ez (1A 2A 3A 4A 5A): los borradores, sin
  publicar hasta sus datos (nombre, NIF y un contacto) y la revisión de un profesional (las preguntas para el gestor y el
  jurista, en `docs/launch/legal-web-para-ez.html`); y `/desistir`, cerrada hasta que Ez dé de alta Resend y ponga
  `RESEND_CLAVE` en Cloudflare, mejor al encender la venta (`docs/launch/desistir.md`).
- **Volver a pegar en Play Console, juntos al subir la siguiente beta** (Ez, 5 nov.), el párrafo «A tu ritmo» de `docs/launch/google-play/ficha.md`, en es y en (cambió
  con la 0.188.0); el de PACE completo, con la v1.
- **Stripe** (`docs/launch/cobro-web.md`): el modo de prueba, entero y comprobado el 5 nov.: el aviso, la llave de lectura
  (`STRIPE_LECTURA`, del modo de prueba de la cuenta y no del sandbox), dos compras con 4242 y /recuperar con el recibo de Link;
  y los cuatro `plink_` en `PACE_ENLACES_STRIPE`. **Modo real (5 nov.)**: cuenta activada tras el alta con el gestor, y el
  aviso (`whsec_` real) y la llave de lectura (`rk_live_`) ya en Cloudflare. Faltan lo legal, Resend y encender los enlaces. **Ez (5 nov.): solo el de por vida, solo en la web, hasta v1. Sus datos, al registrar la primera venta real, y la revisión profesional, en un mes, hablado con el gestor**: sabe que `docs/launch/legal-web.md` los pide antes de cobrar. Para encender: Resend y la dirección del enlace real (`PACE_TIENDA_WEB.enlaces.vida`); la tienda de un plan ya está en `main`.
  Hecho: la cuenta (autónomo), «vende por ti» con Stripe Tax, los productos y sus enlaces en real y APAGADOS, el portal,
  k2 y Cloudflare (`PACE_K2_PRIVADA` y el KV `VENTAS`). En la web, antes de v1, solo el de por vida (Ez, 5 nov.).
- **Lo que fija la fecha de v1**: unos 15 testers de Android (tiene 5 o 6; `/beta` y el grupo, listos: `testers.md`), el
  gestor y el alta para cobrar, y los datos del aviso legal.
- **Espera su «júntalo» y la revisión de ChatGPT:** `guardar()` a prueba de dos renovaciones a la vez
  (`claude/guardar-atomico-166e3f`: un periodo por llave en `cobro/mensual.js`; 89 pruebas del cobro en verde). Ez le pasa a
  ChatGPT el texto de la hoja, que también pide revisar ese arreglo. La landing (`claude/landing-web-5ec1e5`) espera sus
  letras; y faltan dos dibujos de logros: Año
  nuevo, que se repite, y Vaca feliz.
- **iPhone**: qué estado ve Ez en TestFlight (la prueba beta se envió el 23 oct.) e invitar a sus testers con el
  enlace público del grupo «Testers iPhone», que va también a /beta. Para vender: el acuerdo de apps de pago con banco
  y W-8BEN, el programa para pequeñas empresas y una dirección visible en la UE.
- Las altas de Google Cloud y Microsoft Entra (`docs/CALENDARIO_ALTAS.md`): sin ellas el calendario automático de la
  web no funciona para nadie, y abrirlo a todos pide que Google verifique la app, que tarda semanas.
- La verificación en dos pasos en GitHub, Cloudflare, Stripe, Google y Apple; mandar a cada tester su enlace de
  `codigos-tester.csv`. **Las llaves ya no están en el PC** (Ez, 31 oct.): `PACE-llave-play`, `-licencias` y `-apple`
  viven solo en su disco, en `F:\Pace-llaves\` (comprobadas por md5 antes de borrarlas), y en los secretos de GitHub y
  Cloudflare. Para hacer códigos de tester o de venta a mano, se enchufa el disco. Falta una segunda copia fuera de casa.
- «Avísame»: el nombre que firma su privacidad, el KV `pace-avisame` como `AVISAME` y el token de Web Analytics solo
  para /premium (con él, `verify` pide que `privacy.html` lo diga); mirar el registro previo de Play.
- S3, el código portable (un código que se puede pasar a otra persona): es decisión de Ez, sin tomar.
- Cuando pueda: probar en su Android lo privado del calendario del móvil, leer `privacy.html`, oír la voz de Respira y
  los cuencos, grabar «Más» y «More» (`encargos-16oct/PROMPTS_AUDIO_SUSPIRO.md`) y apagar las propuestas de Dependabot.
  Los worktrees ya juntados se quitaron el 31 oct., con su sí (copia de todas las ramas en `backups/ramas-31oct-2026.bundle`).

## Deuda conocida, sin fecha

- A 320×568 la home del móvil pide scroll (Ez lo acepta) · las escenas con scroll anteriores a v0.130.0.
- En «A tu ritmo»: el cierre que nunca es «Ahora», la lectura C (espera semanas de datos en `origin`) y la tarde sin
  rutinas de pie con el aro a 10 o 15. La barra de arriba pregunta antes de dejar un Foco empezado, pero no una pausa.
- El aviso a mitad de un bloque largo (la segunda parte de ChatGPT del 22 oct.) · N9, la barra lateral durante un Foco
  (falta el vídeo de Ez) · los botones de verdad del aviso fijo de Android (la C de N4).
- Riesgo aceptado (Ez, 22 oct.): dos pestañas que apuntan algo a la vez, lo mide `tests/pestanas-estado.spec.js`.
- Al volver los Caminos (después de v1), tres casos de la auditoría del 21 oct.: un paso de cuerpo dentro de un Camino
  borra la rutina a medias de otra (`olvidarCuerpoGuardada` con `inPath`), «¿Salir del Camino?» no suspende la sesión
  de debajo, y esa confirmación no encierra el Tab ni usa `usePaceDialogo`.
- Tests del estado más allá del saneador · i18n con plurales y pseudolocalización · las deudas de claves D-1, D-2 y D-3.

El detalle de lo hecho está en `CHANGELOG.md`, en el relevo (`docs/traspaso/relevo-coordinadora-22oct.md`) y en
`git log -- STATE.md`. El `STATE.md` de antes de s200, con el mapa de archivos, en `docs/archive/STATE_HASTA_S200.md`.
