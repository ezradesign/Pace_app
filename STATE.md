# PACE · Estado

**Versión:** v0.174.6 · 22 de octubre de 2026. Qué trajo cada versión: `CHANGELOG.md`. Las reglas que
no se pueden romper: `docs/product/DECISIONES_TECNICAS_VIGENTES.md`.

## Dónde estamos

- **Web** en https://pacegrass.app (y `paceweb.pages.dev`, sin redirigir), con `/premium` y su lista
  «Avísame», que se enciende al conectar el KV (`docs/launch/avisame.md`).
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
  «exhala» en Rondas.
- **PACE completo**, abierto hasta v1 (`PREMIUM_ABIERTO_HASTA_V1`): toda compra pasa por
  `app/state-entitlement.jsx`, con tiendas aún vacías (`app/state-compra.js`); en la web, un código de
  por vida firmado lo abre todo. «Qué te ayuda» (Estadísticas) sigue sin hacer y ya puede leer
  `ritmo.aprendido`. Los Caminos, ocultos hasta después de v1 (`SHOW_CAMINOS`).

## Lo siguiente

0. **Play Console, con Ez paso a paso** (20 oct.; la página de pasos de Ez, abajo): app creada como
   «PACE: Pomodoro, Break Reminder», en inglés como idioma principal y Gratis (`nombre-en-play.html`).
   **21 oct.: cuestionarios y ficha hechos (capturas nuevas, logo de Ez de gráfico, IA sin etiquetar) y
   la prueba cerrada ENVIADA a revisión de Google** con 0.174.0, todos los países y Ez más dos testers.
   Siguen la prueba interna en el móvil de Ez, los correos del resto de testers y, al aprobarla, el
   enlace para invitarlos (`testers.md`). «Tus rutinas» se abrió
   hasta v1 (v0.173.3) para que el acceso restringido sea «No» de verdad: se sube 0.174.0 o posterior.
   Gráfico destacado nuevo, el logo de Ez (`grafico/logo-ez.jpg`); las capturas se rehacen con 0.174.0.
1. **Fase 2**: probar el APK en un móvil (icono, arranque de día y de noche, importar una copia, que lo
   guardado sobreviva a una actualización, el aviso de Foco). Subidas: `docs/launch/google-play/guia.html`.
2. **Antes de cobrar** (Ez, 16 oct.), cada uno en su sesión: **los días diseñados**, en `main` con
   v0.174.0 (Ez los aprobó mirando la semana, https://claude.ai/artifact/HjcDYcPgAm4fG13uMvKaVm, el
   20 oct.). Y, del calendario total en la web, **el llavero** (Ez, 18 oct.; espera sus
   altas). La revisión de los ejercicios y el motor de la semana, hechos; lo total con PACE
   cerrado, después de v1.
3. **Fase 6, tras /premium**: la página de gracias y la firma con k2, el aviso dos días antes del fin
   de la prueba, «Gestionar» en Ajustes, la invitación con los botones de compra y lo legal de /premium.
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

- **Lo que fija la fecha de v1**: crear la app en Play Console, subir el AAB y reunir unos 15 testers
  (tiene 5 o 6); el gestor, la cuenta de Stripe con Managed Payments y los datos del aviso legal;
  volver a exportar el logo (`app/ui/pace-logo.png`: «EVEN» se lee «FVFN», también en /premium).
- Copiar `PACE-llave-play` y `PACE-llave-licencias` a su disco duro y mandar a cada tester su enlace
  de `codigos-tester.csv` (funcionan en la web).
- «Avísame»: el nombre que firma su privacidad, el KV `pace-avisame` conectado como `AVISAME` y el
  token de Web Analytics solo para /premium; mirar el registro previo de Play.
- Las altas de PACE en Google Cloud y Microsoft Entra, con sus dos ids (`docs/CALENDARIO_ALTAS.md`; para el
  llavero, el cliente de Google como «aplicación web» con su secreto).
- Leer `privacy.html` (es pública) y probar en su Android el calendario que se mantiene solo.
- Oír la voz de Respira en pacegrass.app (desde v0.167.0 con fundido, `PACE_VOZ_FUNDIDO`) y los
  cuencos de Mueve y Estira; grabar «Más» y «More» del suspiro (`encargos-16oct/PROMPTS_AUDIO_SUSPIRO.md`).
- Los dibujos que faltan: la cuenta y los prompts, en `docs/product/GLIFOS_A_DIBUJAR.md`.
- iPhone, que ahora fija la fecha de v1 junto a Play: la cuenta de Apple Developer y su llave
  (`docs/launch/app-store/guia.html`, puntos 3 y 4), y pasar a sus testers qué mirar, sobre todo el sonido.
- Apagar las propuestas automáticas de Dependabot, dejando las alertas.

## Deuda conocida, sin fecha

- **Desde el 27 oct.**, comprobar por tamaño que pacegrass.app ya no sirve /STATE.md, /CLAUDE.md,
  /docs/traspaso/LEEME.md, /docs/product/DECISIONES_PRODUCTO.md ni /package.json. Tras pasar a
  `dist/` (20 oct.), Pages siguió dando la copia vieja de lo ya pedido (`s-maxage=604800`, una
  semana): no la quitan ni un despliegue nuevo ni Purge Everything de la zona, que Ez hizo. Lo
  demás ya da la app.

- A 320×568 la home del móvil pide scroll (Ez lo acepta) · las escenas con scroll anteriores a
  v0.130.0.
- En «A tu ritmo»: el cierre que nunca es «Ahora», la lectura C (espera a que `origin` tenga semanas
  de datos) y la tarde sin rutinas de pie con el aro a 10 o 15 (falta contenido de pie). La barra de
  arriba pregunta antes de dejar un Foco empezado, pero no una pausa empezada (pide un texto nuevo).
- **De la auditoría externa del 21-22 oct. (ChatGPT), en cola por sesiones** (máximo dos a la vez; la
  coordinadora junta): «Tus rutinas» y Estadísticas, en `main` con v0.174.4 (22 oct., con el sí de Ez y la
  frase que eligió para la pared opcional) · **bienvenida y Ajustes** (A1 el idioma elegido en la bienvenida no quita
  «Auto», A2 el Atrás de Android no hace nada en la bienvenida, A3 volver atrás borra el borrador de
  «Tu semana», A4 ajustes de audio atenuados que se cambian con teclado, A5 el foco se pierde al
  cambiar de paso, A7 interruptores de 18 px; A6, la copia de Android, ya en v0.174.1; A8 y A9, en
  v0.174.5) ·
  **avisos de Android** tras la prueba en el móvil de Ez (A1 campana
  doble al volver, A2 cancelar el aviso antes de que llegue, A3 «programado» antes de saber si se
  programó, A4 permiso de notificaciones sin refrescar) · **seguridad antes de cobrar** (S1
  `premiumUnlocked` abre sin compra, S2 licencia aceptada antes de verificarla, S4 «Avísame» sin
  límites, S5 CSP, S6 en Android los eventos de PACE se reconocen por texto; S3, código portable, es
  la decisión de Ez) · **la hora y la medianoche** antes de marzo (H1-H3 la hora repetida del 25 oct.,
  H4 licencia con fecha caduca 1 h antes, H5 bloque de antes de medianoche según si la página vivió) ·
  **el puente del calendario de Android** (de C2, 22 oct.): `paceAndroidLlamar` se traga los
  errores, así que una lista que falla se lee como un calendario vacío, PACE puede volver a crear lo
  que ya estaba y en Android nunca sale «No se pudo».
- **Al volver los Caminos** (después de v1; hoy `SHOW_CAMINOS = false`), tres casos de la auditoría
  externa del 21 oct.: terminar un paso de cuerpo dentro de un Camino borra `pace.cuerpo.v1` de otra
  rutina a medias (`olvidarCuerpoGuardada` con `inPath`); «¿Salir del Camino?» no suspende la sesión
  de debajo (Respira sigue y acredita); y esa confirmación no encierra el Tab ni usa `usePaceDialogo`.
- **Del móvil de Ez** (22 oct., la prueba interna en su Android; M1, M3 y M5 en v0.174.5; M4, M6 y M7, sus
  1A 2A 3A, en v0.174.6): queda M2 con el aro corto, las guiadas como hoy y entre ellas una invitación: Ez eligió
  4a A · 4b A (solo con el día empezado) · 4c A (`DECISIONES_PRODUCTO.md`), y al pulsar «Hacerla», un
  ejercicio de Mueve o Estira con el glifo del módulo. Falta la pregunta 5, el nombre de la invitación y dónde
  se ve el ejercicio (https://claude.ai/artifact/H7mBXKbcv1mR8pVSg61N5d); la monta la sesión «Maqueta» como
  v0.175.0. El aviso a mitad de un bloque largo (la segunda parte de ChatGPT), después de verlo.
- **Lo que prometemos sobre los datos** (ChatGPT, 22 oct., comprobado en el código; nada se envía a
  escondidas, pero hay frases que prometen de más). La respuesta «No» de Play se mantiene: escribir en el
  calendario del móvil es pasarlo a otra app, que Play llama compartir y exime cuando lo pide la persona;
  `/premium` y «Avísame» no van en el APK. P1 `contenido-de-la-app.md` y `privacy.html` dicen que el
  calendario «no sale del móvil», y si esa cuenta sincroniza, sube a su nube · P2 «nunca el título ni
  quién va» (`cal.reuniones.sub`) no es cierto: Google web pide el evento entero (mira los asistentes) y el
  puente de Android devuelve título y texto (S6); prometer «solo guarda las horas» y pedir menos campos ·
  P3 los eventos van como libres, no como privados, con el nombre de la pausa: decide Ez · P4
  `privacy.html` dice que /premium cuenta visitas y el script aún no está (espera el token de Ez) · P5
  «Avísame» guarda el correo sin caducidad (`functions/api/avisame.js`), antes de conectar la lista.
  Después de juntar el calendario, que también toca `calendario.js`.
- La voz de Respira por `<audio>` (sin Web Audio): `paceVozIntenta` da por buena la señal antes de
  que `play()` arranque, y si falla no suena ni el tono de respaldo (auditoría externa, 21 oct.; el
  comentario de `Sound.voz.jsx` ya lo avisa).
- Tests del estado más allá del saneador · i18n con plurales y pseudolocalización · las deudas de
  claves D-1, D-2 y D-3.

El `STATE.md` anterior, con el mapa de archivos, el índice de decisiones y el backlog antiguo, está en
`docs/archive/STATE_HASTA_S200.md`.
