# PACE · Estado

**Versión:** v0.147.0 · 8 de octubre de 2026.

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
de tiempo alrededor del dibujo y avisos de cuenco y madera. Cada texto tiene su hueco fijo y el
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

Al empezar el Foco, la bola del aro y su halo salen enteros y por encima de la niebla del horizonte,
con un fundido que solo se ve al empezar el bloque (v0.147.0, opción A elegida por Ez). Lo vigila
`tests/aro-bola-entrada.spec.js`.

Hasta v1 las rutinas premium están abiertas para todos (`PREMIUM_ABIERTO_HASTA_V1`, en
`app/state-entitlement.jsx`), para que los testers las prueben: llevan su «Premium» pero no «Pronto».
El constructor de rutinas propias sigue cerrado.

Los Caminos están ocultos hasta después de v1 (`SHOW_CAMINOS` en `app/flags.js`): sin «Ver caminos»,
sin su pestaña de Estadísticas, sin «Cartógrafa» y sin las tres preguntas de la bienvenida. No se ha
borrado nada, y un Camino que ya estuviera empezado se puede terminar.

## Lo siguiente

1. **Fase 2:** el identificador de la app se queda en `com.ezradesign.pace` (Ez, 6 de octubre de
   2026); Play lo fija en la primera subida y luego no se cambia. Probar el APK en un móvil: lo de
   arriba, el icono y el arranque de día y en modo oscuro, importar una copia, que lo guardado
   sobreviva a una actualización, y el aviso de Foco con la vaca y «Que el aviso llegue a su hora»
   en Ajustes. `privacy.html` ya cubre la app. El workflow `Android` firma el AAB para Play
   (artefacto `pace-android-play`) con la llave de subida de los secretos del repo; el original y su
   contraseña están en el PC de Ez, fuera del repo.
2. **Fase 3**, mientras corre la prueba cerrada: «A tu ritmo» a lo largo de la semana, que es lo que
   se paga.

3. **Los bugs de `docs/traspaso/CAZA_BUGS_7OCT.md`** (37: modo oscuro, inglés, Respira e
   Hidrátate). El agua de ayer pasada la medianoche se arregló en v0.146.1. Bhastrika sin su aviso
   y «Terminar» en las rondas están arreglados en `claude/respira-bugs-graves-31faf7`, a la espera
   de que Ez vea las fotos. Se arreglan los confirmados, con su prueba; los de texto o criterio los elige Ez, y
   todo lo que se vea se le enseña antes en HTML.
4. **La música de Respira** está hecha en la rama `claude/project-thread-9eceyu` desde el 7 de
   octubre: falta traerla a `main` y que Ez la escuche en la app.

## Espera a Ez

- Guardar una copia de la carpeta `PACE-llave-play` de su PC (la llave de subida a Play y su
  contraseña) fuera del ordenador.
- Dar de alta PACE en Google Cloud y en Microsoft Entra y pasar sus dos ids
  (`docs/CALENDARIO_ALTAS.md`): hasta entonces la web solo ofrece el archivo. Con Google, pedir la
  verificación antes de abrirlo a más de 100 personas.
- Play Console: la cuenta está creada y Google revisa la identidad de Ez. Después, reunir 12 testers
  con Android.
- Los dibujos de «Rana» (Caderas · suelo) y «Pica en escritorio» (Empuje · progresión), y rehacer
  los seis que no casan con su ejercicio (`docs/traspaso/archivos/glifos/revision-glifos.html`, con
  sus prompts).
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
