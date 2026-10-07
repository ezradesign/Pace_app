# PACE · Estado

**Versión:** v0.143.3 · 7 de octubre de 2026.

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

3. **La home del móvil antes de contestar el día:** Ez eligió «la 2, pero mejor maquetada»
   (detalle en `docs/traspaso/LEEME.md`). Hoy pide 28 px de scroll a 375×667 y 46 a 360×640. Hay
   trabajo a medias en la rama `claude/project-thread-ft7sc2`.

## Espera a Ez

- Guardar una copia de la carpeta `PACE-llave-play` de su PC (la llave de subida a Play y su
  contraseña) fuera del ordenador.
- Dar de alta PACE en Google Cloud y en Microsoft Entra y pasar sus dos ids
  (`docs/CALENDARIO_ALTAS.md`): hasta entonces la web solo ofrece el archivo. Con Google, pedir la
  verificación antes de abrirlo a más de 100 personas.
- Play Console: la cuenta está creada y Google revisa la identidad de Ez. Después, reunir 12 testers
  con Android.
- Los dibujos de «Rana» (Caderas · suelo) y «Pica en escritorio» (Empuje · progresión).

## Deuda conocida, sin fecha

- Las cinco escenas con scroll anteriores a v0.130.0. Desde v0.141.0, por libre, el móvil lleva una
  tarjeta corta y la home cabe a 360×718 y 375×667; aún pide 18 px a 360×640 y 74 a 320×568.
- En «A tu ritmo»: el miércoles sale con tres largas (2.ª, 5.ª y 8.ª), el modo oscuro del panel, el
  cierre que nunca es «Ahora» y la lectura C, que espera a que `origin` tenga semanas de datos.
- Tests del estado más allá del saneador · i18n con plurales y pseudolocalización · las deudas de
  claves D-1, D-2 y D-3.
- Los 22 dibujos pendientes (3 de ejercicio y 19 de logro) entran si llegan.

El `STATE.md` anterior, con el mapa de archivos, el índice de decisiones y el backlog antiguo, está en
`docs/archive/STATE_HASTA_S200.md`.
