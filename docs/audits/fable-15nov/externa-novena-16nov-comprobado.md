# Novena pasada externa (Fable): los avisos del móvil, comprobada

Ez la trajo el 16 nov. 2026 sobre la 0.207.0 (encargo en `encargo-avisos.md`). La propia Fable dice que es parcial:
solo leyó entero `app/ui/nativo.entrada.js`, el manifiesto de Android y `package.json`. Su texto entero, tal cual,
está en la conversación de la coordinadora de ese día; aquí va cada punto contra el código y el AAB de verdad.

| Nº | Lo que dice | Comprobado | Qué se hace |
|---|---|---|---|
| 1 | Grave: faltan `SCHEDULE_EXACT_ALARM` y `POST_NOTIFICATIONS` en el manifiesto | **Falso**: los declara el complemento (`node_modules/@capacitor/local-notifications/android/src/main/AndroidManifest.xml`) y el AAB de la 0.205.0 los lleva fusionados (leído en `base/manifest/AndroidManifest.xml`: también `RECEIVE_BOOT_COMPLETED` y `WAKE_LOCK`) | Una guarda en `verify.android.js` que los exija en el manifiesto del complemento, para que un cambio de versión no los pierda en silencio |
| 2 | Grave si se cumple: recortar recursos quitaría los sonidos del AAB | **Falso**: `minifyEnabled false` y sin `shrinkResources`; el AAB de la 0.205.0 lleva `campana_aviso.wav` y `pausa_aviso.wav` | Nada |
| 3 | Medio: al irse al fondo, el aviso de entrada quita los siete y tarda tres pasos en reponerlos; si el sistema congela PACE en medio, quedan quitados | **Cierto** en el código (`paceEntradaPonerYa`); el efecto, por probar, y el iPhone es el más expuesto | Programar primero (el mismo id sustituye) y quitar solo los ids que sobran; y no tocar nada si lo deseado no cambió |
| 4 | Medio: con el estado sin `avisoEntrada` (Borrar todo, importar una copia sin el campo) los avisos puestos siguen una semana | **Cierto** | Quitar los del 10 al 16 al borrar y al importar, con su prueba |
| 5 | Medio: el de la mañana va sin alarma exacta tras una noche quieto; puede llegar muy tarde | **Cierto** el código; el retraso, por medir | Exacta cuando «Alarmas y recordatorios» esté concedido, como el del Foco |
| 6 | Medio: en el iPhone el aviso de entrada sale sin sonido | **Cierto** | Pide letra de Ez: con qué suena el aviso de la mañana |
| 7 | Medio: el canal `pace_entrada` suena con el tono del móvil aunque el sonido de PACE esté apagado; no tiene canal mudo | **Cierto** | Su canal mudo, como el Foco y la pausa (la regla vigente); qué sonido lleva el sonoro, con la letra del 6 |
| 8 | Medio: si se niega el permiso, el interruptor queda encendido y nunca avisa, sin decirlo | **Cierto**: `RitmoSemanaTipo.jsx` llama a `paceEntradaEncender()` y no mira el resultado | La nota de «sin permiso de avisos», con el mismo patrón que la fila de avisos de Ajustes |
| 9 | Medio: al actualizar la app o forzar su cierre, Android quitaría las alarmas, y el complemento solo las repone al reiniciar | **Cierto a medias**: el receptor del complemento solo escucha el arranque (`BOOT_COMPLETED`, `LOCKED_BOOT_COMPLETED`, `QUICKBOOT_POWERON`), no `MY_PACKAGE_REPLACED`; que Android las quite al actualizar, por probar | Añadir `MY_PACKAGE_REPLACED` a ese receptor desde el manifiesto de PACE, y probarlo en un móvil con una actualización de Play |
| 10 | Leve: abrir PACE a las 00:10 quita el aviso de esa misma mañana | **Cierto**: «desde mañana» cuenta el día natural | Contar también hoy si la hora de entrada aún no ha llegado y PACE se abrió antes de las 4:00 |
| 11 | Leve: tras cambiar de huso sin abrir PACE, avisa a la hora del huso anterior | Cierto | Se acepta: se corrige al abrir PACE |
| 12 | Leve: si `cancel` falla, un id viejo puede avisar un día libre | Cierto | Lo cierra el arreglo del 3 |
| 13 | Leve: `puesto` en `localStorage` podría no quedar escrito si Android mata el proceso justo después | Plausible | Se acepta; se mira en el móvil |
| 14 | Leve: un canal silenciado a mano deja a PACE creyendo que el sistema avisó | Plausible | Después de v1, con `listChannels` |

Los pasos de «Solo se sabe en un móvil» de la respuesta (Android 14 del 1 al 9 e iPhone del 1 al 5) son buenos y van a
la lista de pruebas en un móvil de Ez.
