# Avisos del móvil · solo se sabe en un móvil

Los pasos de «Solo se sabe en un móvil» de la novena pasada de Fable (16 nov. 2026, tal cual los trajo Ez),
puestos al día con lo montado en `claude/avisos-novena-16nov-cdf66e`: las dos campanadas del aviso de la
mañana y su canal mudo, la nota sin permiso en «Tu semana», `MY_PACKAGE_REPLACED`, «Borrar todo» y pasada la
medianoche. «Al día» marca un paso que cambió con lo montado; «Nuevo», uno que no estaba.

Hazlo con la versión instalada desde Play y TestFlight, no con el APK de prueba.

## Android 14

1. Instalación limpia. Foco de 2 minutos, sal de PACE y bloquea: debe sonar la campana de PACE, no el tono del móvil.
2. Pausa de 1 minuto en el fondo: dos campanadas.
3. Apaga el sonido en PACE y repite los pasos 1 y 2: los avisos salen sin sonido.
4. Ajustes de Android, «Alarmas y recordatorios»: debe aparecer PACE (el AAB declara `SCHEDULE_EXACT_ALARM`). Concédelo: lo usan el aviso del Foco y, desde ahora, el de la mañana. **Al día.**
5. Pon un Foco de 10 minutos, reinicia el móvil y no abras PACE: ¿avisa?
6. Enciende «Avísame a mi hora de entrada» en «Tu semana» con la entrada a 20 minutos del día siguiente (cambia la fecha del móvil si hace falta), déjalo quieto y sin cargar toda la noche, y mide el retraso: con «Alarmas y recordatorios» concedido debe llegar a su hora. Debe sonar con las dos campanadas, y sin sonido con el de PACE apagado. En los ajustes de notificaciones de PACE deben verse «Al empezar la jornada» y «Al empezar la jornada, sin sonido», y ningún otro con ese nombre. **Al día.**
7. Con avisos puestos, instala una actualización desde Play y no abras PACE: el de mañana debe salir (PACE repone sus avisos al actualizarse, con `MY_PACKAGE_REPLACED`). **Al día.**
8. Con ahorro de batería y con «No molestar»: repite el paso 1.
9. Borra todos tus datos con el aviso de entrada encendido: al día siguiente no debe salir. **Al día.**
10. Con el aviso de entrada encendido, abre PACE pasada la medianoche (a las 0:10, por ejemplo) y ciérrala: el aviso de esa misma mañana debe salir igual. **Nuevo.**
11. Con los avisos de PACE negados, enciende «Avísame a mi hora de entrada»: el interruptor se ve apagado y debajo dice «Los avisos de PACE están desactivados en los ajustes de Android.». Actívalos en los ajustes de Android, vuelve a PACE y mira si al día siguiente avisa sin tocar nada más. **Nuevo.**

## iPhone

1. Foco de 2 minutos, al fondo y bloqueado: ¿suena la campana de PACE o el tono de iOS? El tono de iOS significa que el archivo no está en el paquete.
2. Lo mismo con el interruptor lateral en silencio: solo debe vibrar.
3. Vuelve a PACE justo al acabar el bloque: ¿una campana o dos?
4. Aviso de entrada: enciéndelo, sal enseguida de PACE y mira al día siguiente si llega. Debe sonar con las dos campanadas, y sin sonido si el de PACE está apagado. **Al día.**
5. Niega el permiso al encenderlo: el interruptor de «Tu semana» se ve apagado y debajo dice «Los avisos de PACE están desactivados en los ajustes del iPhone.». **Al día.**
6. Borra todos tus datos con el aviso de entrada encendido: al día siguiente no debe salir. **Nuevo.**
