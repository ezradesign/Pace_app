# PACE · Estado

**Versión:** v0.139.1 · 6 de octubre de 2026.

## Dónde estamos

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

Los Caminos están ocultos hasta después de v1 (`SHOW_CAMINOS` en `app/flags.js`): sin «Ver caminos»,
sin su pestaña de Estadísticas, sin «Cartógrafa» y sin las tres preguntas de la bienvenida. No se ha
borrado nada, y un Camino que ya estuviera empezado se puede terminar.

## Lo siguiente

1. **Fase 2:** probar el APK en un móvil: lo de arriba, el icono y el arranque de día y en modo
   oscuro, importar una copia y que lo guardado sobreviva a una actualización. Faltan que
   `privacy.html` hable también de la app y el AAB firmado. En Android 14 o más el aviso puede llegar
   con retraso: Android no deja alarmas exactas sin un permiso que da el usuario.
2. **Fase 3**, mientras corre la prueba cerrada: «A tu ritmo» a lo largo de la semana, que es lo que
   se paga.

## Espera a Ez

- Darse de alta en Play Console (cuenta personal) y reunir 12 testers con Android.
- Confirmar el identificador de la app, `com.ezradesign.pace`, antes de la primera subida a Play:
  después ya no se puede cambiar.
- Mueve y Estira al salir de la pantalla: hoy la sesión se pausa (`SESION_AL_OCULTAR = 'pausa'`, en
  `app/move/MoveSessionV1.support.jsx`). La alternativa es que siga contando, como el Pomodoro.
- «Pronto» en las rutinas premium del catálogo: abrirlas hasta v1.0 o dejarlas cerradas.
- Los dibujos de «Rana» (Caderas · suelo) y «Pica en escritorio» (Empuje · progresión).

## Deuda conocida, sin fecha

- Las cinco escenas con scroll anteriores a v0.130.0. Desde v0.139.0 el aro no encoge por debajo de
  lo que lleva dentro, y por libre la home arrastra 104 px a 375×667 y 63 a 360×730 (antes, 72 y 32).
- En «A tu ritmo»: el miércoles sale con tres largas (2.ª, 5.ª y 8.ª), el modo oscuro del panel, el
  cierre que nunca es «Ahora» y la lectura C, que espera a que `origin` tenga semanas de datos.
- Tests del estado más allá del saneador · i18n con plurales y pseudolocalización · las deudas de
  claves D-1, D-2 y D-3.
- Los 22 dibujos pendientes (3 de ejercicio y 19 de logro) entran si llegan.

El `STATE.md` anterior, con el mapa de archivos, el índice de decisiones y el backlog antiguo, está en
`docs/archive/STATE_HASTA_S200.md`.
