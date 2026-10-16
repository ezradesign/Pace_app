# PACE · Estado

**Versión:** v0.171.0 · 16 de octubre de 2026.

## Dónde estamos

La web vive en https://pacegrass.app, el dominio propio, y sigue abierta en `paceweb.pages.dev` sin
redirigir: los datos de la web son de cada dominio y los testers no perderían de vista los suyos.
Los enlaces legales de Android, la marca del calendario y la privacidad, que ya lleva un correo de
contacto, usan el dominio nuevo.

La Fase 1 de «Camino a v1.0» (`ROADMAP.md`) está terminada y la Fase 2 ha empezado: la app se
empaqueta para Android con Capacitor 8 (`android/`, `capacitor.config.json`) y GitHub compila un APK
de prueba en cada push a `main` (workflow `Android`, artefacto `pace-android-debug`), así que nadie
necesita Android Studio. Dentro del APK no hay service worker y los eventos van al IndexedDB del
WebView (las reglas, en `DECISIONES_TECNICAS_VIGENTES.md`).

Lo que el WebView no trae lo dan complementos de Capacitor, y solo `app/ui/android.js` les habla: el
botón atrás cierra lo que esté encima (como Escape) o manda la app al fondo, el aviso de fin de Foco
lo programa Android mientras la app está en el fondo, las sesiones guiadas mantienen la pantalla
encendida y la copia de «Tus datos» sale por el menú de compartir. Los APK de prueba se firman con
una clave fija del repo, así que uno nuevo se instala encima del anterior sin perder los datos.

El icono, la pantalla de arranque y las barras del sistema son de PACE: la vaca de `icons/` sobre el
crema, y en modo oscuro el arranque y las barras pasan a la paleta oscura (`verify` vigila que las
copias de Android sigan siendo las de la web). En Android no hay «Da de pastar a la vaca»: Google
Play no deja llevar a pagar fuera de su sistema, y su logro secreto sale del catálogo.

«Al calendario», junto a «Cambiar», lleva el día de «A tu ritmo» al calendario: el del móvil en
Android, Google Calendar u Outlook en la web y un .ics en los dos. Con «Tener en cuenta mis
reuniones», PACE lee a qué horas estás ocupado hoy y el día las esquiva como esquiva la comida.
Con «Mantenerlo al día solo» (v0.169.0; PACE completo, abierto hasta v1), el día se corrige solo
en el calendario mientras PACE está abierto: la pausa abre cada evento y avisa, y con el Foco en
marcha avisa solo PACE. En Android, siempre; en la web, Outlook un día por conexión y Google una
hora, y luego «Poner al día».

Mueve y Estira se siguen sin tocar la pantalla (v0.144.0, opción A elegida por Ez): un mando de tres
botones (anterior, pausa, siguiente), toda colocación cuenta sola, «+15 s» junto a la cuenta, un aro
de tiempo alrededor del dibujo y avisos de cuenco y madera. El aro solo cuenta el ejercicio: al colocarse y al cambiar de lado se queda vacío (v0.148.1, opción A
de Ez). La explicación de cada paso va en la serif itálica y no pasa de 95 letras (v0.150.0, opción A
de Ez), así que cabe en dos líneas, y «Cuídate» también va en serif (v0.150.1). Cada texto tiene su hueco fijo y el
dibujo se lleva el espacio que sobra: medido en 12 pantallas, de 360×600 a 1920×960, nada se mueve
ni se pisa. Las rutinas propias también van por ahí.

Con el zoom del navegador alejado o en un monitor grande, la app crece en proporción y se ve como en
el portátil de Ez al 100 % (v0.145.0, el «lienzo que crece» de `app/main/_lienzo.js`). Toda medida
nueva de la ventana pasa por él: `paceCaja`, `paceLienzoAlto` y `var(--pace-vh, 1vh)` (lo vigila
`verify`).

La home del móvil no pide scroll en ningún momento desde 360×640, en castellano y en inglés
(v0.146.0, regla de Ez: «no quiero scroll de ninguna forma»). La pregunta del día dibuja el horario
como una línea (la maquetación B), la tarjeta corta va sin «A TU RITMO» y el día servido va sin pie:
«Hoy voy por libre» bajo «Cambiar», «Ver todo» al final de la línea y «Al calendario» en esa hoja.
Lo vigila `tests/home-sin-scroll.spec.js`, que mide cada momento también con la letra 0,3 px más
ancha, porque cada navegador la dibuja a su ancho; a 320×568 se acepta scroll.

Con «Suena detrás: Música» (v0.154.0), cada técnica de Respira suena con su propio drone, hecho en directo a
partir de tres drones en Sol, sin archivos nuevos (Ez lo eligió el 8 de octubre). Las primeras
variaciones se parecían demasiado y el 9 de octubre Ez eligió las «marcadas»: cada técnica cambia de
nota, de acorde, de color o de movimiento, y ninguna queda a menos de 6 puntos de color de su vecina
(`docs/traspaso/archivos/musica-respira/por-tecnica/marcadas.html`). En los ejercicios pausados la
música se abre al inhalar y se cierra al exhalar (en Nadi Shodhana, además, se va hacia el lado por
el que respiras); con ciclos de menos de 5 s se queda quieta, y Coherente 432 sigue con su drone. Las
recetas son `PACE_MUSICA_TECNICA` (`app/ui/Sound.musica.parts.jsx`), copiadas de `tecnicas.js` con el
volumen que mide `construir.js`.

En v0.156.0, Respira entra en la cuenta atrás (la voz ya precargada y la música subiendo) y sale
despacio, en 6 s; el cierre de las sesiones lleva el dibujo de la rutina y una salida tonal; y el sello
del aro va solo con texto, entero y uno detrás de otro. Desde v0.171.0, «Ahora no» va en la fila de
las respuestas del cierre y, si no cabe todo, el dibujo encoge (hasta 48 px; por debajo de 490 px de
alto en escritorio se quita; opción B de Ez). Lo vigila `tests/cierre-sin-pisar.spec.js`.

Desde v0.155.0 la pausa por libre no repite lo que propone (las otras tres puertas van en una
línea), el cierre de las sesiones va en la serif itálica con píldoras y la línea del Pomodoro se funde
con el horizonte como el aro gris (decisiones de Ez del 9 y el 10 oct., con fotos de la app real).

La pausa al terminar un bloque sigue la opción A de Ez (v0.152.0, `BreakMenu.css.jsx`): el plato como
la tarjeta de la biblioteca, píldoras en serif itálica del color del módulo y sin atajos a la vista
(Intro y Esc siguen). El aviso de un sello espera a que no haya nada abierto y en la home sale
dentro del aro, en el sitio de su línea en cursiva (`tests/sello-espera.spec.js`).

La barra lateral es un cuaderno (v0.153.0, elegida por Ez en cuatro vueltas de fotos,
`docs/traspaso/archivos/sidebar-8oct/`): la semana en cápsulas con la racha debajo, Hoy con frases
(«Dos horas y media de foco», «Cuatro vasos de ocho», con la meta de Ajustes y su «+ vaso»), la
siguiente pausa con su rótulo, las tres bibliotecas y el último logro; el mismo orden en el cajón del
móvil, que cabe entero desde 360×640. La home dice «6 de 8 vasos».

Al empezar el Foco, la bola del aro y su halo salen enteros y por encima de la niebla del horizonte,
con un fundido que solo se ve al empezar el bloque (v0.148.3, opción A elegida por Ez). Lo vigila
`tests/aro-bola-entrada.spec.js`.

Una pausa de «A tu ritmo» se hace entera (v0.166.0, A · 2A · 3A de Ez): la larga encadena sus
dos platos («Seguir con Estira») y el aro cuenta la pausa corta y la larga desde que acaba el bloque,
nunca la comida (`app/state-ritmo.pausa.jsx`). «Una hora» y «Dos horas» duran su reloj, contado
desde que empieza el día y con las reuniones dentro: con bloques cortos hay menos foco, y la larga
llega tras 75 min de foco; el miércoles adelanta una sola (v0.169.0, Ez, 15 oct.).

«A tu ritmo» elige cada pausa con lógica (v0.171.0, las series de Ez del 15 oct.;
`app/ritmo/ritmo.series.js`): de pie al empezar, tras comer y en la larga, la zona que hoy no has
movido, nada de la misma parada de la última vez, y la frase de lo de hoy encima del nombre
(«Caderas: sin mover hoy»). Recuerda lo servido siete días y lo hecho hoy (`ritmo.servidos`,
`ritmo.hechas`). Rutinas nuevas: Piernas de pie y Espalda de pie, y la mesa entra en los pozos. Con
el aro a 10 o 15, la pausa corta llega como mucho cada 30 min de foco y el aro espera.

«A tu ritmo» conoce tu semana (v0.148.0, la parte gratis de la Fase 3): la bienvenida pregunta qué
días son jornada, media o libres, y desde entonces cada mañana el día llega ya contestado, con
«Comienza» y «Hoy es distinto»; «Tu semana» en Ajustes la cambia. El día se deriva de la semana al
pintar y no se escribe nada hasta que se pulsa.

Hasta v1 las rutinas premium están abiertas para todos (`PREMIUM_ABIERTO_HASTA_V1`, en
`app/state-entitlement.jsx`), para que los testers las prueben. Lo de pago se llama **PACE completo**
(v0.157.0; opción B de Ez, que la vio en la app real el 12 oct.): lo cerrado lleva un candado de línea fina y, al tocarlo, una
invitación que dice qué trae y que llega con la versión 1. En la web, un **código de por vida**
(enlace `#codigo=…` o «Tengo un código») lo abre todo, también «Tus rutinas», que sin código sigue
cerrado: es una licencia firmada que la app comprueba sin servidor (`app/state-licencia.js`). En
Android no hay códigos propios: llegarán los de Play cuando haya Play Billing.

Estadísticas abre en «Hoy» (v0.170.0, Fase 4; 1A 2A 3A 4A de Ez el 15 oct.): los cuatro totales de
hoy y una tarjeta por parada del menú de «A tu ritmo» con lo que pasó; por libre, las pausas de hoy
con su hora. «Semana» sigue gratis y como se eligió el 13 oct. Mes y Año son de PACE completo: sin
él llevan candado y abren la invitación, pero hasta v1 están abiertos. «Qué te ayuda» espera al
motor de la semana.

Los Caminos están ocultos hasta después de v1 (`SHOW_CAMINOS` en `app/flags.js`): sin «Ver caminos»,
sin su pestaña de Estadísticas, sin «Cartógrafa» y sin las tres preguntas de la bienvenida. No se ha
borrado nada, y un Camino que ya estuviera empezado se puede terminar.

iPhone: el proyecto de iOS está preparado desde v0.164.0 (`ios/`, Capacitor 8). `app/ui/ios.js`
habla con los complementos y `app/ui/nativo.js` es la capa común con Android. El workflow `iOS` lo
compila para el simulador en un Mac de GitHub en cada push a `main`, sin firmar. La App Store sigue
siendo para después de v1; TestFlight puede llegar antes, con la cuenta de Apple de Ez. Guía:
`docs/launch/app-store/guia.html`. Hasta entonces, PACE en Safari: la suite tiene un proyecto `webkit`
para los `*.safari.spec.js` y la home sin scroll, sin sonido (ese WebKit no trae Web Audio).

## Lo siguiente

1. **Fase 2:** el identificador de la app se queda en `com.ezradesign.pace` (Ez, 6 de octubre de
   2026); Play lo fija en la primera subida y luego no se cambia. Probar el APK en un móvil: lo de
   arriba, el icono y el arranque de día y en modo oscuro, importar una copia, que lo guardado
   sobreviva a una actualización, y el aviso de Foco con la vaca y «Que el aviso llegue a su hora»
   en Ajustes. `privacy.html` ya cubre la app. El workflow `Android` firma el AAB para Play con la
   llave de subida de los secretos y en `main` lo guarda en el borrador de release `vX.Y.Z`
   (`PACE-X.Y.Z.aab`); el APK de prueba es otra app, «PACE prueba». Las subidas siguen la rutina de
   `docs/launch/google-play/guia.html` (viernes a la prueba interna, lunes a la cerrada) y se apuntan
   en `SUBIDAS.md`.
2. **Fase 3**, mientras corre la prueba cerrada: lo de pago es que «A tu ritmo» te vaya conociendo y
   cada semana adapte los ejercicios a lo que prefieres (de «¿te ayudó?», lo hecho y lo saltado,
   «Otra» y las horas a las que paras), contado en la carta del lunes. Ez aceptó la página (`docs/traspaso/archivos/motor-semana/`):
   cuatro cosas, dos cambios por semana, la carta en una ventana, también sin cambios, nada sin
   PACE completo. Desde v0.149.0 se guarda el resumen de cada día (`ritmo.day.closed`); el motor y
   la carta llegan cuando haya semanas de datos.

3. **La caza del 10 oct. en el Foco y lo guardado** (`docs/traspaso/CAZA_FOCO_ESTADO_10OCT.md`) está cerrada en
   v0.159.0. **La caza de bugs del 7 oct.** (`docs/traspaso/CAZA_BUGS_7OCT.md`) está cerrada en v0.151.0,
   (ingles-13, en v0.152.0, con la pausa). Las voces de Respira hablan inglés desde v0.165.0.
4. **La caza del 14 oct. en las sesiones guiadas** (`docs/traspaso/CAZA_SESIONES_14OCT.md`): seis
   arreglos en v0.163.0 (lo que se cuenta con el equipo dormido, las pausas, la página oculta y dos
   pestañas); sesiones-7, 8 y 9, con lo que eligió Ez, en v0.165.0. sesiones-10 (la voz grave con
   clics en el PC y entrecortada en el Android de Ez): desde v0.167.0 la voz suena por Web Audio con
   un fundido de 5 ms (`PACE_VOZ_FUNDIDO`, `app/ui/Sound.voz.jsx`); falta que Ez lo oiga en la web.
5. **iPhone**: preparado en v0.164.0. Para TestFlight, cuando Ez tenga la cuenta y la llave: el
   certificado (con openssl, sin Mac), los secretos, la firma y la subida en el workflow `iOS`, el
   apartado del iPhone en `privacy.html` (es pública: Ez la ve antes) y una URL de soporte.
6. **Lo demás que vio Ez el 15 oct.**: el «Ahora no» tapado y las series están en v0.171.0. Falta
   la 2.ª ronda de «Gemelos subrepticios», que no va más lenta, en una sesión que mire todas las
   rutinas (Ez, 16 oct.), y la voz del suspiro fisiológico, que espera las grabaciones de Ez.

## Espera a Ez

- Copiar las carpetas `PACE-llave-play` y `PACE-llave-licencias` (la de los códigos de tester, creada
  el 9 oct., con los 15 enlaces del 12 oct. en `codigos-tester.csv`) de su PC en su disco duro, con la contraseña de Play aparte.
- Mandar a cada tester su enlace de `codigos-tester.csv` y apuntar a quién da cuál: funcionan desde
  v0.157.0, en la web (en Android no hay códigos propios).
- Para cobrar en la web (lo decidió el 15 oct., `DECISIONES_PRODUCTO.md`): preguntar a un gestor cómo
  darse de alta, crear la cuenta de Stripe con verificación en dos pasos y pedir Managed Payments,
  poner los dos pasos en Cloudflare y decidir el nombre, el NIF y el contacto del aviso legal.
- Apagar las propuestas automáticas de Dependabot (GitHub › Settings › Code security), dejando las alertas: sus actualizaciones las aplica una sesión con su nombre.
- Volver a exportar el logo (`app/ui/pace-logo.png`): en la imagen, «EVEN» se lee «FVFN».
- Grabar la voz del segundo tramo del suspiro fisiológico: «Más» y «More» con las dos voces
  (`docs/traspaso/archivos/encargos-16oct/PROMPTS_AUDIO_SUSPIRO.md`; «un poco más» no cabe en 1 s).
- Pasar a su tester con iPhone la lista de qué mirar en Safari, sobre todo el sonido.
- Crear la cuenta de Apple Developer a su nombre y la llave de la API de App Store Connect, con
  acceso Administrador, en `PACE-llave-apple` (`docs/launch/app-store/guia.html`, puntos 3 y 4).
- Dar de alta PACE en Google Cloud y en Microsoft Entra y pasar sus dos ids
  (`docs/CALENDARIO_ALTAS.md`; Microsoft pide también `offline_access`): hasta entonces la web solo
  ofrece el archivo. Con Google, pedir la verificación antes de abrirlo a más de 100 personas.
- Leer `privacy.html` (es pública), que desde v0.169.0 cuenta «Mantenerlo al día solo», y probar
  el calendario que se mantiene solo en su Android.
- Play Console: identidad y móvil verificados (8 oct.). Crear la app con la ficha en español y en
  inglés, para todos los países, y reunir unos 15 testers (tiene 5 o 6; mensajes en `testers.md`).
- Los dibujos y las voces que faltan, con sus prompts listos para pegar (14 oct.):
  - imágenes, en `docs/traspaso/archivos/encargos-14oct/PROMPTS_IMAGENES.md`: 8 ejercicios con el
    dibujo equivocado, «Rana» y «Pica en escritorio», 7 logros con el dibujo equivocado o repetido
    y 18 sin dibujo propio;
  - entraron en v0.165.0 las voces en inglés y cinco dibujos: «Primer día», «Cuarto creciente»,
    «Solsticio invierno», «Hueco abdominal» y «Elevación de puntas»; en v0.170.1, «Barbilla atrás».
  - falta «Rotación torácica de pie»: Espalda de pie la usa con el dibujo genérico
    (`docs/product/GLIFOS_A_DIBUJAR.md`, n.º 3).
- Oír la voz grave de Respira en pacegrass.app, en el PC y en el móvil, con música y sin ella: desde
  v0.167.0 entra y sale con un fundido (sesiones-10).
- Oír los cuencos nuevos de Mueve y Estira en el portátil y en el móvil y decir si el volumen va bien.

## Deuda conocida, sin fecha

- A 320×568 la home del móvil pide scroll (de 49 a 137 px según el momento): Ez lo acepta, porque
  caber exigiría encoger el aro y lo de dentro. Fuera de la home, las escenas con scroll anteriores
  a v0.130.0.
- En «A tu ritmo»: el cierre que nunca es «Ahora» y la lectura C, que espera a que `origin` tenga
  semanas de datos.
- Tests del estado más allá del saneador · i18n con plurales y pseudolocalización · las deudas de
  claves D-1, D-2 y D-3.
- Los 21 dibujos pendientes (3 de ejercicio y 18 de logro) entran si llegan.
- Con el aro a 10 o 15, la jornada se queda sin rutinas de pie por la tarde (hasta cuatro sentadas
  seguidas): falta contenido de pie (el paseo corto quedó fuera por ahora). Y «Dos horas» con el
  aro a 25 acaba en un bloque de 55 min (la tercera pausa sería larga y no cabe).

El `STATE.md` anterior, con el mapa de archivos, el índice de decisiones y el backlog antiguo, está en
`docs/archive/STATE_HASTA_S200.md`.
