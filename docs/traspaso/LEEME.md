# Traspaso de PACE: léelo primero

Este archivo es para un Claude que empieza de cero, en esta cuenta o en otra, y tiene que retomar
PACE sin preguntarle a Ez lo que ya se decidió. Junto con `CLAUDE.md` y `STATE.md`, basta para seguir.
Se actualiza en cada hito (regla en `CLAUDE.md`). Última actualización: 8 de octubre de 2026, v0.148.3.

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
  - `claude/respira-bugs-graves-31faf7`: Bhastrika con su aviso y «Terminar» que cuenta lo hecho.
    Tres preguntas en `archivos/respira-7oct/LEEME.md`; el texto del aviso por técnica lo resuelve
    respira-14 de la rama de propuestas.
  - `claude/caza-bugs-propuestas`: los cambios visibles de la caza del 7 oct.; nueve preguntas.
    Faltan sus pruebas.
  - `claude/calendario-sincronizacion`: Google y Microsoft; faltan los ids que crea Ez.
  - `claude/respira-musica-drones`: el drone de Respira; Ez tiene que escucharlo.
  - `claude/premium-codigos-tester`: qué se cierra y códigos de por vida para testers (en Android,
    los códigos promocionales de Play Console).
  - `claude/runner-circulo-letra`: recomendación A, serif itálica y tope de 95 letras por frase,
    para que el dibujo de Mueve iguale al de Estira.
  - `claude/glifos-revision-8oct`: solo documentos; qué dibujos no casan, cuáles faltan, prompts,
    y cuatro dibujos de logro cambiados de sitio que solo hay que reasignar.
  - La propuesta de nombres y descripciones de los 96 logros (tanda 1) se envió a Ez desde la nube
    y **no está en el repo ni en ninguna rama**: si Ez no la conserva, hay que rehacerla. La
    tanda 2, las explicaciones de ejercicios, respeta el tope de 95 letras.
- **Lo siguiente de producto**: el motor que aprende de cada persona y adapta la semana (lo de pago
  de «A tu ritmo»), con la carta del lunes. **La página está hecha** y espera seis respuestas de
  Ez: `archivos/motor-semana/motor-semana.html` (https://claude.ai/artifact/EGfS13xFn6oU4BpoRihdBL),
  con `fotos.js` para rehacer fotos y medidas. Recomendado: empezar por el resumen del día, que
  es invisible, y poner la carta en una ventana (la de la R2 no cabe a 360×640).
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
- **Ramas abiertas de otros hilos:** `claude/project-thread-9eceyu` (la música de Respira, hecha y
  sin subir: falta que Ez la escuche en la app) y `claude/project-thread-jid37a` («¿Cómo es tu
  semana?» en la bienvenida, a medias; ya puede montarse encima de `main`, que trae la B).
- **Glifos revisados:** de los 62 dibujos de ejercicio, seis no casan con su ejercicio (por ejemplo,
  «Barbilla atrás» con la flecha al revés y «Elevación de puntas» que dibuja talones). Están en
  `archivos/glifos/revision-glifos.html`, con un prompt para cada uno. El descanso entre series ya
  lleva la figura que respira (alias de «Reset respiración»), así que de ese no hace falta dibujo.
- **Hechos además en v0.144.0:** el Foco personalizado dura al menos 5 minutos; dentro del aro del
  Pomodoro ya no va «A tu ritmo», solo «Hasta las…» (Ez quiere la hora); «Hombros reseteados» se
  corrigió, y dos logros con título repetido son ahora «La rueda del año» y «Bisagra suelta».

- **Música de Respira:** hay tres drones en Sol hechos con las tomas de ElevenLabs de Ez: Sol claro
  para Energía, Balance y Pranayama; Sol cálido para Equilibrio; Sol menor para Relajación. La app les
  aplicaría una envolvente que respira en vivo (se abre al inhalar, se queda en el sostén, se cierra al
  exhalar). Ez estaba eligiendo en una página de escucha. Siguiente paso: el cambio de código,
  enseñado a Ez antes de subirlo. Los tres drones están en `archivos/musica-respira/bases/`, con la
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
  «Premium» y sin «Pronto». El constructor sigue cerrado.
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
| Música de Respira | De 20 tomas distintas de Ez solo 4 sirven, todas de ElevenLabs. Se estaba midiendo con un medidor propio. Pendiente que Ez decida si la música «respira» al ritmo del ejercicio (recomendado: mixto, sí en los de ritmo fijo y quieta en Rondas, Bhastrika y Kapalabhati). | Con las tomas nuevas: bajar a 432 (−31,77 cents), mono 64 kbps, bucle sin costura, medir banda y ciclo. Brief en `archivos/musica-respira/`. |
| Glifos | Faltan 2 de ejercicio (rana y pica en escritorio; el descanso ya usa la figura que respira), 6 que rehacer porque no casan con su ejercicio (`archivos/glifos/revision-glifos.html`) y 19 de los 96 de logro. GPT Image bloquea las figuras desnudas y Ez no las quiere vestidas. | Rehacer los prompts desde el preámbulo con el que se hicieron los 59, sin ropa y sin que salte el filtro. Prompts y nombres de archivo en `archivos/glifos/prompts-glifos.md`. |
| «A tu ritmo» semanal | Es lo que se paga en v1 (Fase 3). La parte gratis (la semana en la bienvenida y en Ajustes, y el día ya contestado) está en v0.148.0. | El motor que aprende de cada persona y adapta la semana, con la carta del lunes (premium): primero una página para Ez con qué aprende, con qué datos y cómo lo cuenta. |
| Caza de bugs | v0.143.2: «Primera calistenia» y «Primer estirón» iban cruzados entre Mueve y Estira y los logros decían «Extra»; arreglado, y a quien ya los tenía se le corrigen solos. v0.143.3: la cuenta atrás de las sesiones pisaba su frase en el móvil. v0.143.4: la preparación de Mueve y Estira decía «De pie» en las 8 rutinas de silla y las 2 de suelo; en Android la bienvenida decía «en tu navegador»; a 360 px los botones de Hidrátate partían su texto; cuando la pausa proponía agua, su botón decía «Empezar» y no sumaba nada (ahora «Un vaso más», que lo suma; decisión de Ez, que dejó «Muévete» como está y eligió «En la silla»). Revisadas a 360 y 1280 la home, logros, estadísticas, ajustes, las tres bibliotecas y la entrada a las sesiones; a 360, en español e inglés, Foco en marcha, el menú de pausa, Hidrátate, la bienvenida y una sesión entera de Respira, Mueve y Estira. | La lista de Ez ya no tiene nada pendiente (Ez, 7 oct.). Después, una búsqueda en paralelo dejó 37 hallazgos SIN VERIFICAR en `CAZA_BUGS_7OCT.md` (modo oscuro, inglés, Respira e Hidrátate): reproducirlos uno a uno y arreglar los que se confirmen. El 8 de octubre, v0.148.2 arregla seis que no cambian lo que se ve (respira-4, 7, 8 y 11, ingles-9 y el `lang` de ingles-6); los que cambian algo visible, con antes y después, esperan la elección de Ez. Sin revisar: Foco, el estado guardado y la pantalla de «A tu ritmo» por dentro (la está tocando el hilo de la semana). |
| Escala con el zoom | Hecha en v0.145.0 (`app/main/_lienzo.js`), medida del 90 al 33 % y en monitores de 1080p y 1440p. | Mirarla en Safari de Mac si alguien lo usa. Nada más. |

## Lo que espera a Ez

1. Copiar la carpeta `PACE-llave-play` de su PC (la llave de subida a Play) en su disco duro, con
   la contraseña aparte.
2. Dar de alta PACE en Google Cloud y Microsoft Entra y pasar los ids.
3. Crear la app en Play Console y reunir unos 15 testers con Android (Google pide 12 durante 14
   días; tiene 5 o 6).
4. Nuevas tomas de música con ElevenLabs (2 o 3 de pranayama con tanpura) y los glifos que falten.

## Maquetas publicadas (cuenta anterior)

- Tarjeta por libre en el móvil (elegida la R3-tono): https://claude.ai/artifact/2jmBfnmmpq1K66372JwQTa
- PACE al calendario: https://claude.ai/artifact/MAK3Wc3LuK5RqnxLo2Crri
- Icono de avisos (elegida la C): https://claude.ai/artifact/AeRGsq65WfvGm8DXe8aEZu
- Imágenes guardadas en el repo: `archivos/tarjeta-hoy/` y `archivos/home-movil/`.

## Lo que no está en el repo, a propósito

Claves, contraseñas, tokens y correos personales no se suben nunca. La llave de Play va en los
secretos de GitHub, y su original, con la contraseña, en la carpeta `PACE-llave-play` del PC de Ez.
El correo de contacto de PACE, `hola.ezradesign@gmail.com`, sí está: es público a propósito
(privacidad y ficha de Play). El historial de las conversaciones no se migra: lo que importa está
aquí y en `git log`.

## Frase de arranque para la otra cuenta

> Retoma el proyecto PACE desde el repo ezradesign/Pace_app. Antes de nada lee CLAUDE.md, STATE.md y
> docs/traspaso/LEEME.md, y dime en pocas líneas dónde estamos y qué harías ahora. Háblame en español.
