# PACE · Estado

**Versión:** v0.189.1 · 4 de noviembre de 2026. Qué trajo cada versión: `CHANGELOG.md`. Las reglas que
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
   esperar»): sube en cuanto esté Palmas en la mesa (Rana vale, 5 nov.), con el logo como está (Ez, 4 nov.; B4 y C3, la colocación y el material, ya
   están en la 0.187.0); el grupo 2 llega como actualizaciones durante los 14 días. El AAB lo baja la coordinadora con el sí de Ez y lo
   sube Ez; TestFlight, a mano y con su sí (`docs/launch/google-play/guia.html`).
4. Después, Play Billing y la compra de Apple (esperan las altas de Ez) y lo legal de /premium. El día de v1, «Da de
   pastar a la vaca» sale de la web (Ez, 18 oct.).

## Espera a Ez

La lista, por orden y sin jerga, en su hoja de pasos (`docs/traspaso/hoja-de-ruta-20oct.html`), una por cuenta:
https://claude.ai/artifact/5iWBfHE7kD3dUVocdskmb6 y https://claude.ai/artifact/EcLj6io4wM9pGjtQ5wd1CT. Ez se pierde
con mucho abierto: a «¿qué toca?», una sola cosa.

- **Ahora: decidir «Palmas en la mesa»**: el último dibujo vale si el texto pasa a «dedos hacia delante». Es lo que deja subir la versión de prueba definitiva (abajo). Rana vale y ya está en `dibujos-22oct/para-revisar/`. El logo se queda como
  está por ahora (Ez, 4 nov.). Con ella va la 0.189.1: la media jornada que un tester no podía pulsar un sábado a las
  15:00, arreglada con la C de Ez («Hora de inicio» con la paleta de PACE).
- **Lo legal para vender en la web**, en `main` con la 0.189.0 y las letras de Ez (1A 2A 3A 4A 5A): los borradores, sin
  publicar hasta sus datos (nombre, NIF y un contacto) y la revisión de un profesional (las preguntas para el gestor y el
  jurista, en `docs/launch/legal-web-para-ez.html`); y `/desistir`, cerrada hasta que Ez dé de alta Resend y ponga
  `RESEND_CLAVE` en Cloudflare, mejor al encender la venta (`docs/launch/desistir.md`).
- **Volver a pegar en Play Console** el párrafo «A tu ritmo» de `docs/launch/google-play/ficha.md`, en es y en (cambió
  con la 0.188.0); el de PACE completo, con la v1.
- **Stripe** (`docs/launch/cobro-web.md`): el modo de prueba, entero y comprobado el 5 nov.: el aviso, la llave de lectura
  (`STRIPE_LECTURA`, del modo de prueba de la cuenta y no del sandbox), dos compras con 4242 y /recuperar con el recibo de Link;
  y los cuatro `plink_` en `PACE_ENLACES_STRIPE`. **Modo real (5 nov.)**: cuenta activada tras el alta con el gestor, y el
  aviso (`whsec_` real) y la llave de lectura (`rk_live_`) ya en Cloudflare. Faltan lo legal, Resend y encender los enlaces. **Ez (5 nov.): solo el de por vida, solo en la web, hasta v1. Sus datos, al registrar la primera venta real, y la revisión profesional, en un mes, hablado con el gestor**: sabe que `docs/launch/legal-web.md` los pide antes de cobrar. Para encender: la rama `premium-solo-vida`, Resend y la dirección del enlace real.
  Hecho: la cuenta (autónomo), «vende por ti» con Stripe Tax, los productos y sus enlaces en real y APAGADOS, el portal,
  k2 y Cloudflare (`PACE_K2_PRIVADA` y el KV `VENTAS`). En la web, antes de v1, solo el de por vida (Ez, 5 nov.).
- **Lo que fija la fecha de v1**: unos 15 testers de Android (tiene 5 o 6; `/beta` y el grupo, listos: `testers.md`), el
  gestor y el alta para cobrar, y los datos del aviso legal.
- **La versión de prueba definitiva** (notas de Play y TestFlight y capturas nuevas, preparadas en `SUBIDAS.md` con la
  0.189.0): los 16 dibujos (catorce en `main` con la 0.187.0; Rana vale y falta
  Palmas en la mesa: `docs/traspaso/dibujos-ejercicios.html`, y la cuenta de todo, en
  `docs/product/GLIFOS_A_DIBUJAR.md`). El logo se queda como está por ahora (Ez, 4 nov.), aunque «EVEN» se lea «FVFN»
  (`app/ui/pace-logo.png`, también en /premium). El AAB de la 0.184.0, en `subidas-play\`.
- **iPhone**: el correo de Apple que aprueba la prueba beta (enviada el 23 oct.), e invitar a sus testers con el
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
