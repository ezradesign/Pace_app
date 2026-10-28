# PACE · Estado

**Versión:** v0.185.0 · 28 de octubre de 2026. Qué trajo cada versión: `CHANGELOG.md`. Las reglas que
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

El orden hasta v1, en `ROADMAP.md` («Camino a v1.0»). **La fecha de v1 no depende del código**: la fijan los 12 testers
de Android con sus 14 días seguidos, que aún no han empezado, y el alta para cobrar que piden Play, Apple y Stripe.

1. **Stripe en el modo de prueba**, con Ez y su hoja: el aviso de pago, los enlaces de prueba y una compra de mentira.
   **Antes de cobrar de verdad**, los arreglos del cobro que encontró ChatGPT el 28 oct. (avisos repetidos o
   desordenados, la fecha de la prueba, «terminada» sin baja, la renovación que pisa la de por vida, la importación y
   el producto), comprobados en el código: la lista, en el relevo.
2. **Mueve, Estira y «Tus rutinas»** (otras tres revisiones de ChatGPT del mismo día, comprobadas: B1-B4, C1-C6 y U1-U5
   en el relevo): el tiempo que corre esperando a «›», «Auto» que avanza en pausa, las repeticiones con banda que no
   cuentan, las seis colocaciones que no se ven, el constructor tapado desde Estira, el borrador que se pierde, el
   material que no se dice y la tarjeta que no se empieza con el teclado. Antes de la versión de prueba definitiva, en
   una sola sesión. Lo de producto (la carta del lunes que se pueda dejar para luego, que la prueba de 7 días llegue a
   enseñarla, la frase del móvil y /premium con la variedad y el calendario) y lo de quien empieza (P1-P8: mirar un
   ejercicio antes de empezar, la flecha que dice qué hace, la pausa que se ve, «con una serie basta»), en una maqueta
   para Ez; recomendado en una actualización durante los 14 días de los testers.
3. **La versión de prueba definitiva, a Play y a TestFlight a la vez** (Ez, 28 oct.): esperan los 16 dibujos de
   ejercicios y el logo. El AAB lo baja la coordinadora con el sí de Ez y lo sube Ez; TestFlight, a mano y con su sí
   (`docs/launch/google-play/guia.html`).
4. Después, Play Billing y la compra de Apple (esperan las altas de Ez) y lo legal de /premium. El día de v1, «Da de
   pastar a la vaca» sale de la web (Ez, 18 oct.).

## Espera a Ez

La lista, por orden y sin jerga, en su hoja de pasos (`docs/traspaso/hoja-de-ruta-20oct.html`), una por cuenta:
https://claude.ai/artifact/5iWBfHE7kD3dUVocdskmb6 y https://claude.ai/artifact/EcLj6io4wM9pGjtQ5wd1CT. Ez se pierde
con mucho abierto: a «¿qué toca?», una sola cosa.

- **Ahora: Stripe** (`docs/launch/cobro-web.md`): el aviso en el modo de prueba (`STRIPE_AVISO_SECRETO`), la llave que
  solo lee (`STRIPE_LECTURA`), los enlaces de prueba y la compra de mentira con 4242, mirando qué número trae el recibo.
  Hecho: la cuenta (autónomo), «vende por ti» con Stripe Tax, los productos y sus enlaces en real y APAGADOS, el portal,
  k2 y Cloudflare (`PACE_K2_PRIVADA` y el KV `VENTAS`). Quiere vender en la web antes de v1 (propuesto: solo el de por
  vida, en /premium); antes, lo legal de /premium.
- **Su sí a la sesión de Mueve, Estira y «Tus rutinas»** (punto 2; la del cobro la arrancó el 28 oct. a las ~20:50), y
  elegir sobre maquetas lo que cambie en pantalla y lo de producto.
- **Lo que fija la fecha de v1**: unos 15 testers de Android (tiene 5 o 6; `/beta` y el grupo, listos: `testers.md`), el
  gestor y el alta para cobrar, y los datos del aviso legal.
- **La versión de prueba definitiva**: los 16 dibujos (https://claude.ai/artifact/3hWPWhj3QmE5S5dWWjcdHT, a
  `Pace_app\dibujos-22oct`; la cuenta de todo, en `docs/product/GLIFOS_A_DIBUJAR.md`) y el logo en PNG transparente
  (`app/ui/pace-logo.png`: «EVEN» se lee «FVFN», también en /premium). El AAB de la 0.184.0, en `subidas-play\`.
- **iPhone**: el correo de Apple que aprueba la prueba beta (enviada el 23 oct.), e invitar a sus testers con el
  enlace público del grupo «Testers iPhone», que va también a /beta. Para vender: el acuerdo de apps de pago con banco
  y W-8BEN, el programa para pequeñas empresas y una dirección visible en la UE.
- Las altas de Google Cloud y Microsoft Entra (`docs/CALENDARIO_ALTAS.md`): sin ellas el calendario automático de la
  web no funciona para nadie, y abrirlo a todos pide que Google verifique la app, que tarda semanas.
- La verificación en dos pasos en GitHub, Cloudflare, Stripe, Google y Apple; copiar `PACE-llave-play` y
  `PACE-llave-licencias` a un disco; mandar a cada tester su enlace de `codigos-tester.csv`.
- «Avísame»: el nombre que firma su privacidad, el KV `pace-avisame` como `AVISAME` y el token de Web Analytics solo
  para /premium (con él, `verify` pide que `privacy.html` lo diga); mirar el registro previo de Play.
- S3, el código portable (un código que se puede pasar a otra persona): es decisión de Ez, sin tomar.
- Cuando pueda: probar en su Android lo privado del calendario del móvil, leer `privacy.html`, oír la voz de Respira y
  los cuencos, grabar «Más» y «More» (`encargos-16oct/PROMPTS_AUDIO_SUSPIRO.md`), apagar las propuestas de Dependabot
  y, con su sí, limpiar las ramas y los worktrees ya juntados (con copia en un bundle).

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
