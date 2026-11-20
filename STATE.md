# PACE · Estado

**Versión:** v0.212.0 · 19 de noviembre de 2026 (la versión de prueba de Play y TestFlight es la 0.191.1). Qué trajo cada versión: `CHANGELOG.md`. Las reglas que
no se pueden romper: `docs/product/DECISIONES_TECNICAS_VIGENTES.md`.

## Dónde estamos

- **Web** en https://pacegrass.app (y `paceweb.pages.dev`, sin redirigir), publicada desde `dist/`
  (`node scripts/web-dist.js`): `/premium` con «Avísame» (se enciende al conectar el KV: `docs/launch/avisame.md`),
  `/beta` para que los testers de Android se apunten solos, y `/gracias` y `/recuperar` para quien compre. **La raíz tiene
  dos caras** (`landing/cara.js`): quien ya usa PACE ve la app; quien llega nuevo, una landing larga. La landing, /premium y
  /beta llevan la estética B, «Una jornada» (Ez, 10 nov.), con las capturas también en oscuro.
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

- **La 0.212.0, en `main` con el «Júntalo todo» de Ez (19 nov.)**: las siete ramas del día (menores, recorrido con la 11 y la tarjeta limpia, voz 1A, visita A, caza, aviso del Foco en el PC con la miniventana, y la comida con «Seguir por libre» A). En inglés, Ajustes con los avisos bloqueados cabe a 1280 × 720 con tres textos más cortos (C de Ez, 20 nov.). Falta probar en un Chrome de verdad el aviso y la miniventana, y un hueco sin probar: tras «Seguir por libre», un Foco después de la salida podría seguir contando para Ocaso.

La lista, por orden y sin jerga, en su hoja de pasos (`docs/traspaso/hoja-de-ruta-20oct.html`), una por cuenta:
https://claude.ai/artifact/5iWBfHE7kD3dUVocdskmb6 y https://claude.ai/artifact/EcLj6io4wM9pGjtQ5wd1CT. La lista corta de solo
lo pendiente, «Lo que queda hasta v1» (`docs/traspaso/pendiente/pendiente.html`): UkETeVK2Ee97N8kSvupwC8 y LtUEUn4yjYXjyq4AqJEtqV. Ez se pierde
con mucho abierto: a «¿qué toca?», una sola cosa.

- **La versión de prueba es la 0.205.0** (subida el 15 nov.): en revisión en la prueba cerrada de Play y en TestFlight (205000; falta darla al grupo «Testers iPhone» con el «Qué probar» de `docs/launch/google-play/SUBIDAS.md`). La 0.206.0 entra como actualización cuando Google apruebe la 0.205.0. Antes del mensaje de WhatsApp (`docs/launch/google-play/mensaje-testers-whatsapp.md`), Ez la prueba en su Android y su iPhone. Las seis capturas de Play, rehechas el 15 nov. El logo se queda como está por ahora (Ez, 4 nov.), aunque «EVEN» se lea «FVFN» (`app/ui/pace-logo.png`).
- **La 0.194.0, juntada con los «Júntalo» de Ez (8 nov.)**: el contraste (1B 2B 3B), volver tras horas fuera (E1 A, V1 A,
  V2 A), el día de v1 (1B 2A 3B 4A, con «Borrar todo» que dice que el código se queda) y siete arreglos de la caza de la semana.
  Si Play se sube el lunes con la 0.191.1, esta llega como actualización. Detalle, en el relevo de `docs/traspaso/LEEME.md`.
- **La 0.195.0, en `main` con el «Júntalo con la A2» de Ez (9 nov.)**: 1432 pruebas en verde y tres puestas al día (las novedades del sobre y «Escuchar ›» en los toques).
  `claude/caza-anchos-9nov-6a280f` ya lleva juntas las letras de la jornada (usabilidad 1A-5A, S3 S6 S7 S11 y los dos arreglos
  de la primera parte de ChatGPT) y de lo nuevo (N1, N2, N3), más dos arreglos de la caza en seis anchos; se le suma
  `claude/caza-nuevo-8nov-6a-a2` («Escuchar ›» junto a «Oír» y «La música, solo en Respira»), que pide su prueba al juntar.
- **ChatGPT, segunda parte** (`docs/audits/chatgpt-8nov/respuesta-2-dia-tiempo-cuenta.md`): siete puntos ciertos; Ez dijo
  «Sí, así»: después de la 0.195.0, probar el doble cómputo, arreglar la cuenta (1, 3, 2) y pintar 4, 6 y 7. La del cobro y lo
  legal sigue en su hoja.
- **La 0.197.0, en `main` con el «Júntalo» de Ez (10 nov.)**: la raíz con dos caras y la estética B en la landing, /premium y /beta
  (página 6DsS35xJXsmcZrdtZiXhoL, `docs/proposals/web-estetica-9nov/`). Suite entera en verde: 1467 pasadas, 2 saltadas (el audio del iPhone, saltadas a propósito) y ninguna roja, en 43,2 min.
- **La 0.196.0, en `main` con el «Me valen todos los audios» de Ez (9 nov.), CI en verde entero (42693245511)**: «Más» y «More» en el segundo tramo del Suspiro con
  las cuatro tomas de Ez (el «More» de sulafat, cortado en 1,08 s, ya cabe) y la 1A de la caza en seis anchos. 1449 pruebas en verde; la única roja (eventos-origen, «el navegador se cerró» con la máquina cargada) pasa sola, 4 de 4.
- **La 0.198.0, en `main` con el «Sí, todo junto» de Ez (11 nov.)**: el arreglo del CI de noche (con la landing delante no se guarda nada), lo montado de la auditoría (1A, 2A, 4A, la línea de los lunes en el sobre y en el cajón, D-6 D, D-5 B y D-4 C), las letras 4 B, 6 A y 7 A con la cuenta de la jornada (ChatGPT 1, 2, 3 y 5, que venían en la misma rama) y la A del aro con el horario abierto. **Su CI salió en rojo y lo arregla la 0.198.1** (la campana del iPhone sonaba otra vez al reabrir PACE; detalle en el relevo). Suite entera sobre el `index.html` que se sube: 1515 en verde, 2 saltadas a propósito y 5 rojas, las cinco resueltas: tres pruebas puestas al día (dos de la pausa esperaban «Volver al inicio», que la 2A cambia con la pausa corriendo, y la de «Borrar todo» no conocía la clave del aro) y dos que caen con la máquina cargada y pasan solas (`foco-inicio-recarga` y `ios-avisos`). Sus páginas, una por cuenta (EcLj6 / 5iWBf): el aro, BN1QuXDBSAnqjqAvvSMSny / NgV2uX97ZxRZTXEePWvcGG; «Montado» de la auditoría, 1WwJbuD5qTtXJWNzVg7B7Q / CpnFEkENADXDVU7K7u8k5M; «Montado» de 4, 6 y 7, LaTcRknTpPcJAa6joPncjX / RifLYxtf23zjW51atRD4U3.
- **Cola, sesiones en Opus de una en una** (Ez, 11 nov.: «Sí, primero la séptima»): hechos y en la 0.199.0, el aro de rendimiento con V1 y V2 y la séptima; antes, comprobar y arreglar la séptima pasada de Fable (lo juntado en la 0.198.0); D-8 A y D-10 B, hechos y en la 0.200.0; y la octava (las pruebas, `verify` y el CI): la primera parte en la 0.200.1, la segunda en la 0.201.0 y la tercera en la 0.202.0: la octava, entera. Detalle, en el relevo de `docs/traspaso/LEEME.md`.
- **La 0.199.0, en `main` (11 nov.)** con el «Júntalo» de Ez para la rama de rendimiento (aro B, V1 B, V2 B y su R2 A, las barras y las fuentes) y su «Sí, júntala» para la séptima pasada de Fable comprobada (Ocaso con el inicio real y solo jornada y media jornada, los minutos de la pausa guardados con su sesión, «Cambiar» de madrugada). Suite entera sobre el `index.html` que se sube: 1549 en verde y 2 saltadas a propósito. Ez dio la A en todas las preguntas de las dos pasadas (R1, R2, S1, S2 y O1 a O5; literal y qué pide cada una, en el relevo).
- **La 0.202.0, en `main` (12 nov.)** con el «1 A, 2 B y júntalo» de Ez: la tercera parte de la octava, que la cierra. La B (con la letra grande, las actividades en una fila si así cabe; 1 A, también con la letra normal en móviles bajos), la 2 B (la barra de «no deja guardar» con la primera escritura que falle), las siete pruebas que faltaban, los doce ciertos y dos fallos que destaparon (el mensual sin portal no se vende; una copia sin semana ya no la corre un día). Suite entera sobre el `index.html` que se sube: 1584 en verde y 2 saltadas a propósito (40 min). GitHub, en verde entero (CI 43257573747, iOS y Android). Página «Montado», una por cuenta (EcLj6 / 5iWBf): PJye6h3hhiqgjUMRmbUe1h / AT8X9QryL4KtDetYTivxzA. **La 0.203.0, con el «Júntalo» de Ez (12 nov.):** los dos arreglos pensando en los testers; suite entera, 1601 en verde y 2 saltadas a propósito (39 min) (la valoración no se pide antes de v1; el fin de la pausa avisa en el móvil con su sonido), con P1 A, P2 A y P5 A tal como venían montadas. Página HeMyYYPyDuopL7oYYu5kpS / R1mmsxTzYjmFQGynxJYXxP (EcLj6 / 5iWBf). Sin probar en un móvil (pasos en la página). **La 0.204.0, con el «Júntalo» de Ez (13 nov.):** P3 A (en Android, el fin del Foco con la campana de PACE por sus canales, mudo con el sonido apagado) y P4 A con la forma A («Avisos a su hora ›» una vez, bajo «Pausar», en el sitio de «Ciclo 1 / 4»). Sin probar en un Android de verdad (pasos en la misma página). **La 0.205.0, con el «Sí, los cuatro» y el «Júntalo» de Ez (13-14 nov.):** S3 y S4 de la auditoría (importar con el día y la versión de la copia, el selector sin filtro, el lector de pantalla en las filas de Ajustes y «Audio» en inglés). Página Lweow3RtPa9wCsenLZNJ51 (solo en 5iWBf). **La 0.206.0, con el «Júntalo» de Ez (15 nov.):** las tres mejoras de uso diario (1A 2A 3A 4A 5A: «la de antes» en la pausa, el aviso a la hora de entrada en el móvil, «¿Te ayudó?» menos veces y el «No» con su porqué). Página U8L5AgXmWcbBrT8Tp7Zrx2. **La 0.207.0, con el «Júntalas» de Ez (16 nov.):** lo pequeño de antes de v1 (buscadores y pestaña, avisos que no se pisan, wifi mala y Safari, descansos, textos, la copia recordada A+B, el 404 y /beta legible; página UrY4Xbmo7JWyi7bvuSGZWn) y la segunda tanda (plurales, la actualización desde la 0.191.1 y la 0.174.0 probada, claves D-1 a D-3; página KuuFs54YjfaMVaMpd7kQEz). **La 0.208.0, con el «Junta lo de la voz» de Ez (16 nov.):** la voz y la vibración de Mueve y Estira (JvtkcA2htQF8ByWtMGu9oU). **La 0.211.0 (18 nov., «Móntalo»):** la compra en Play y en el iPhone, código propio y apagada hasta las altas (Ah7mrUGkhUksH1ZVNTSVbg; lo que Ez crea en Play Console y App Store Connect, en esa página). **La 0.210.0 (17 nov.):** el calendario a la vista y en el iPhone (Cp7RUbjtX21ZDzZeHYQ7JT) y la voz arreglada («Descansa» y los números). **Fuera (Ez, 19 nov.: «había cosas que no me convencían»):** los textos largos (`claude/textos-largos-17nov-5fb6a3`, QWaU4nFeXFHAo1Qufx9eqd); la rama no se junta. **Ez dio su sí (19 nov.)** al texto de tres pasos de la 1A de los arreglos menores (`claude/menores-valorar-16nov-87ef7b`): la rama se pone lista para juntar. **La 0.209.0, con el «Júntalas» de Ez (17 nov.):** los nueve arreglos de los avisos de la novena de Fable (F1thKAvbpuoeykFZao125K) y las maquetas 1A, 2 A+B+C y 3B (VaVZj6cpDbHPiC25ALZHqQ; la 4, como está, por decisión de Ez). **En sus ramas:** los arreglos menores con 1A (sin mover líneas), 2.1 A y 2.3 A (`claude/menores-valorar-16nov-87ef7b`) y el calendario a la vista y en el iPhone, con todo A de Ez, montándose (`claude/calendario-vista-16nov-ee4f9e`). **En su rama, sin juntar:** la voz y la vibración de Mueve y Estira (1A-7A), con las tomas de castellano de Ez cortadas; faltan las de inglés y oírla en un móvil (página JvtkcA2htQF8ByWtMGu9oU). La 0.205.0 está en revisión en la prueba cerrada de Play y en TestFlight.
- **La 0.201.0, en `main` (12 nov.)** con el «Júntalo» de Ez: la segunda parte de la octava. Con la letra grande del móvil, si el día servido no cabe, la tarjeta enseña solo «Ahora» (1 A2); una pasada de noche más del CI para el verano (2 B); y `verify` prohíbe saltar pruebas, exige un mínimo de 1526 y caza las llaves de firma. Suite entera sobre el `index.html` que se sube: 1567 en verde y 2 saltadas a propósito (31 min). GitHub, en verde entero (CI 43213919419, iOS y Android). La 0.200.1 trajo la primera parte (el CI en cinco trozos, O1, O3, O4, O5). **Ez eligió la B (12 nov.)** para la tarjeta corta y el día contestado con la letra grande: las cuatro actividades en una fila, solo con su dibujo. Montada en la 0.202.0. Páginas de la octava, una por cuenta (EcLj6 / 5iWBf): segunda parte, 8Pgz18Qv7qMcwXCGQcJVgw / 7mLHvjUkuyUzthehEtgLNg; dos preguntas, 2mhP4SyDi9sWQ2E3CEEopt / ERZwRa32ZCMByZu7JBdwbf.
- **La 0.200.0, en `main` (11 nov.)** con el «Júntalo» de Ez: D-8 A (un Android restaurado o reinstalado olvida la lista de eventos que PACE puso en el calendario) y D-10 B (en el iPhone el aviso de fin de Foco suena con la campana de PACE). Suite entera sobre el `index.html` que se sube: 1559 en verde y 2 saltadas a propósito. Sin probar en un móvil de verdad: el sonido del aviso y un Android restaurado (pasos en la página MphAzMn67nqhWBs99wkNEp / SzQQE6yercRZJasfz5pWP2).
- **Esperan a Ez**: nada de las dos pasadas de Fable (contestadas; guardadas en `claude/auditoria-fable-9nov-8401fc`, `docs/audits/fable-9nov/externa-septima-11nov.md` y `externa-octava-11nov.md`), que se le pasan con recomendación tras comprobarlas; y la revisión de ChatGPT del cobro y lo legal.
- **Lo legal para vender en la web**, en `main` con la 0.189.0 y las letras de Ez (1A 2A 3A 4A 5A): los borradores, sin
  publicar hasta sus datos (nombre, NIF y un contacto) y la revisión de un profesional (las preguntas para el gestor y el
  jurista, en `docs/launch/legal-web-para-ez.html`); y `/desistir`, cerrada hasta que Ez dé de alta Resend y ponga
  `RESEND_CLAVE` en Cloudflare, mejor al encender la venta (`docs/launch/desistir.md`).
- **Volver a pegar en Play Console, juntos al subir la siguiente beta** (Ez, 5 nov.), el párrafo «A tu ritmo» de `docs/launch/google-play/ficha.md`, en es y en (cambió
  con la 0.188.0); el de PACE completo, con la v1.
- **Stripe** (`docs/launch/cobro-web.md`): el modo de prueba, entero y comprobado el 5 nov.: el aviso, la llave de lectura
  (`STRIPE_LECTURA`, del modo de prueba de la cuenta y no del sandbox), dos compras con 4242 y /recuperar con el recibo de Link;
  y los cuatro `plink_` en `PACE_ENLACES_STRIPE`. **Modo real (5 nov.)**: cuenta activada tras el alta con el gestor, y el
  aviso y la llave de lectura del modo real, ya puestos. Faltan lo legal, Resend y encender los enlaces. **Ez (5 nov.): solo el de por vida, solo en la web, hasta v1. Sus datos, al registrar la primera venta real, y la revisión profesional, en un mes, hablado con el gestor**: sabe que `docs/launch/legal-web.md` los pide antes de cobrar. Para encender: Resend y la dirección del enlace real (`PACE_TIENDA_WEB.enlaces.vida`); la tienda de un plan ya está en `main`.
  Hecho: la cuenta (autónomo), «vende por ti» con Stripe Tax, los productos y sus enlaces en real y APAGADOS, el portal,
  k2 y lo que necesita el servidor. En la web, antes de v1, solo el de por vida (Ez, 5 nov.).
- **Lo que fija la fecha de v1**: unos 15 testers de Android (tiene 5 o 6; `/beta` y el grupo, listos: `testers.md`), el
  gestor y el alta para cobrar, y los datos del aviso legal.
- **Espera su «júntalo» y la revisión de ChatGPT:** un arreglo del cobro mensual, en su rama (`claude/guardar-atomico-166e3f`,
  con sus pruebas en verde). Ez le pasa a ChatGPT el texto de la hoja, que también pide revisar ese arreglo. Y faltan
  dos dibujos de logros: Año
  nuevo, que se repite, y Vaca feliz.
- **iPhone**: qué estado ve Ez en TestFlight (la prueba beta se envió el 23 oct.) e invitar a sus testers con el
  enlace público del grupo «Testers iPhone», que va también a /beta. Para vender: el acuerdo de apps de pago con banco
  y W-8BEN, el programa para pequeñas empresas y una dirección visible en la UE.
- Las altas de Google Cloud y Microsoft Entra (`docs/CALENDARIO_ALTAS.md`): sin ellas el calendario automático de la
  web no funciona para nadie, y abrirlo a todos pide que Google verifique la app, que tarda semanas. **Ez (16 nov.): v1 sale con el calendario marcado «en pruebas»**, sin esperar a esa verificación.
- La verificación en dos pasos en GitHub, Cloudflare, Stripe, Google y Apple; mandar a cada tester su enlace de
  `codigos-tester.csv`. **Las llaves privadas** viven fuera del repo y
  fuera del ordenador de trabajo (Ez, 31 oct.); dónde, lo sabe Ez y no se escribe aquí. Falta una segunda copia fuera de casa.
- «Avísame»: el nombre que firma su privacidad, el KV `pace-avisame` como `AVISAME` y el token de Web Analytics solo
  para /premium (con él, `verify` pide que `privacy.html` lo diga); mirar el registro previo de Play.
- S3, el código portable (un código que se puede pasar a otra persona): es decisión de Ez, sin tomar.
- Cuando pueda: probar en su Android lo privado del calendario del móvil, leer `privacy.html`, oír la voz de Respira y
  los cuencos, grabar «Más» y «More» (`encargos-16oct/PROMPTS_AUDIO_SUSPIRO.md`) y apagar las propuestas de Dependabot.
  Los worktrees ya juntados se quitaron el 31 oct., con su sí (copia de todas las ramas en `backups/ramas-31oct-2026.bundle`).

## Deuda conocida, sin fecha

- A 320×568 la home del móvil pide scroll (Ez lo acepta) · las escenas con scroll anteriores a v0.130.0.
- El aviso a mitad de un bloque largo (la segunda parte de ChatGPT del 22 oct.) · N9, la barra lateral durante un Foco
  (falta el vídeo de Ez) · los botones de verdad del aviso fijo de Android (la C de N4).
- Riesgo aceptado (Ez, 22 oct.): dos pestañas que apuntan algo a la vez, lo mide `tests/pestanas-estado.spec.js`.
- Al volver los Caminos (después de v1), tres casos de la auditoría del 21 oct.: un paso de cuerpo dentro de un Camino
  borra la rutina a medias de otra (`olvidarCuerpoGuardada` con `inPath`), «¿Salir del Camino?» no suspende la sesión
  de debajo, y esa confirmación no encierra el Tab ni usa `usePaceDialogo`.
- Pseudolocalización. Los plurales, D-1 a D-3 y la actualización desde la 0.191.1 y la 0.174.0, con sus pruebas (tanda 2, 16 nov.).

El detalle de lo hecho está en `CHANGELOG.md`, en el relevo (`docs/traspaso/relevo-coordinadora-22oct.md`) y en
`git log -- STATE.md`. El `STATE.md` de antes de s200, con el mapa de archivos, en `docs/archive/STATE_HASTA_S200.md`.
