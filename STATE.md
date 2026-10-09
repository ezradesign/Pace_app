# PACE · Estado

**Versión:** v0.152.0 · 9 de octubre de 2026.

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

La pausa al terminar un bloque sigue la opción A de Ez (v0.152.0, `BreakMenu.css.jsx`): el plato como
la tarjeta de la biblioteca, píldoras en serif itálica del color del módulo y sin atajos a la vista
(Intro y Esc siguen). El aviso de un sello espera a que no haya nada abierto y en la home sale
dentro del aro, en el sitio de su línea en cursiva (`tests/sello-espera.spec.js`).

Al empezar el Foco, la bola del aro y su halo salen enteros y por encima de la niebla del horizonte,
con un fundido que solo se ve al empezar el bloque (v0.148.3, opción A elegida por Ez). Lo vigila
`tests/aro-bola-entrada.spec.js`.

«A tu ritmo» conoce tu semana (v0.148.0, la parte gratis de la Fase 3): la bienvenida pregunta qué
días son jornada, media o libres, y desde entonces cada mañana el día llega ya contestado, con
«Comienza» y «Hoy es distinto»; «Tu semana» en Ajustes la cambia. El día se deriva de la semana al
pintar y no se escribe nada hasta que se pulsa.

Hasta v1 las rutinas premium están abiertas para todos (`PREMIUM_ABIERTO_HASTA_V1`, en
`app/state-entitlement.jsx`), para que los testers las prueben: llevan su «Premium» pero no «Pronto».
El constructor de rutinas propias sigue cerrado.

Los Caminos están ocultos hasta después de v1 (`SHOW_CAMINOS` en `app/flags.js`): sin «Ver caminos»,
sin su pestaña de Estadísticas, sin «Cartógrafa» y sin las tres preguntas de la bienvenida. No se ha
borrado nada, y un Camino que ya estuviera empezado se puede terminar.

iPhone: la app de la App Store llega después de v1; hasta entonces, PACE en Safari (Ez, 9 oct.). La
suite tiene un proyecto `webkit`, el motor de Safari, para los `*.safari.spec.js` y la home sin
scroll. El sonido no se puede probar ahí (ese WebKit no trae Web Audio): lo mira un tester con iPhone.

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

3. **La caza de bugs del 7 oct.** (`docs/traspaso/CAZA_BUGS_7OCT.md`) está cerrada en v0.151.0,
   (ingles-13, en v0.152.0, con la pausa). Queda grabar la voz de Respira en inglés: hasta
   entonces, en inglés suena el tono.
4. **La música de Respira**, un drone por técnica, está en `claude/respira-drones-por-tecnica`
   (con `claude/respira-musica-drones` dentro): falta que Ez la escuche en la app y traerla a `main`.

## Espera a Ez

- Copiar las carpetas `PACE-llave-play` y `PACE-llave-licencias` (la de los códigos de tester, creada
  el 9 oct.) de su PC en su disco duro, con la contraseña de Play aparte.
- Volver a exportar el logo (`app/ui/pace-logo.png`): en la imagen, «EVEN» se lee «FVFN».
- Pasar a su tester con iPhone la lista de qué mirar en Safari, sobre todo el sonido.
- Dar de alta PACE en Google Cloud y en Microsoft Entra y pasar sus dos ids
  (`docs/CALENDARIO_ALTAS.md`): hasta entonces la web solo ofrece el archivo. Con Google, pedir la
  verificación antes de abrirlo a más de 100 personas.
- Play Console: identidad y móvil verificados (8 oct.). Crear la app con la ficha en español y en
  inglés, para todos los países, y reunir unos 15 testers (tiene 5 o 6; mensajes en `testers.md`).
- Los dibujos de «Rana» (Caderas · suelo) y «Pica en escritorio» (Empuje · progresión), y rehacer
  los seis que no casan con su ejercicio (`docs/traspaso/archivos/glifos/revision-glifos.html`, con
  sus prompts). De logro, los anillos de «Rondas maestra» y la vela de «Larga sesión»
  (`archivos/glifos/revision-8oct/GLIFOS_8OCT.md`).
- Oír los cuencos nuevos de Mueve y Estira en el portátil y en el móvil y decir si el volumen va bien.

## Deuda conocida, sin fecha

- A 320×568 la home del móvil pide scroll (de 49 a 137 px según el momento): Ez lo acepta, porque
  caber exigiría encoger el aro y lo de dentro. Fuera de la home, las escenas con scroll anteriores
  a v0.130.0.
- En «A tu ritmo»: el miércoles sale con tres largas (2.ª, 5.ª y 8.ª), el modo oscuro del panel, el
  cierre que nunca es «Ahora» y la lectura C, que espera a que `origin` tenga semanas de datos.
- Tests del estado más allá del saneador · i18n con plurales y pseudolocalización · las deudas de
  claves D-1, D-2 y D-3.
- Los 22 dibujos pendientes (3 de ejercicio y 19 de logro) entran si llegan.

El `STATE.md` anterior, con el mapa de archivos, el índice de decisiones y el backlog antiguo, está en
`docs/archive/STATE_HASTA_S200.md`.
