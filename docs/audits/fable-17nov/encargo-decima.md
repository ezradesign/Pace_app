# Décima pasada externa (Fable): lo que entró del 15 al 17 nov.

Encargo para la app de fuera, pedido por Ez el 17 nov. 2026 sobre la 0.209.0. Ez pega el bloque de abajo tal cual
cuando la 0.209.0 esté en GitHub. La respuesta se guarda tal cual en `externa-decima-17nov.md` de esta carpeta y la
coordinadora la comprueba punto a punto antes de proponer nada (en la novena, los dos «graves» resultaron falsos al
mirar el AAB: que diga «Comprobado» o «Supongo» importa).

```
Eres una auditora externa de código. Revisa lo que ha entrado en PACE, una app de pausas activas (React 18 sin bundler, web/PWA y apps de Android y iPhone con Capacitor), entre la 0.205.0 y la 0.209.0. El repositorio es público: https://github.com/ezradesign/Pace_app (rama main, versión 0.209.0). Lee los archivos con raw.githubusercontent.com o cdn.jsdelivr.net/gh/ezradesign/Pace_app@main/. No escribas código: busca fallos y di cómo se cerrarían. Si un archivo no se deja leer, dilo y sigue con otro: prefiero pocos archivos leídos enteros que muchos a medias.

POR QUÉ AHORA: los testers empiezan sus 14 días con esta versión. Nadie de fuera ha mirado lo nuevo, y nada de lo nativo se ha probado en un móvil de verdad.

LO NUEVO, POR ORDEN DE IMPORTANCIA:
1. LA VOZ Y LA VIBRACIÓN EN MUEVE Y ESTIRA (0.208.0). Donde sonaba un cuenco o una madera, la voz dice «Colócate», «Siguiente», «Ya», «Último paso», «Izquierda/Derecha», «Cambia de lado», «Descansa», cada repetición y el «tres, dos, uno», con audios cortados de tomas largas (un archivo por toma y la tabla de cortes). Se enciende con «Marca la fase» de Ajustes. «Vibrar» («No · Sin sonido · Siempre», de fábrica «Sin sonido») vibra donde suena algo y en cada repetición, con el complemento Haptics. Si falta un audio, suena el cuenco de siempre.
   Lee: app/ui/Sound.voz.cuerpo.js · app/ui/Sound.voz.cuerpo.datos.js · app/move/MoveSessionV1.voz.jsx · app/move/MoveSessionV1.jsx · app/ui/vibra.js · app/ui/Sound.jsx · app/tweaks/TweaksAudio.jsx · sw.js (¿están las tomas en lo que se guarda para usar sin conexión?) · scripts/voz-cuerpo-tomas.js · package.json (@capacitor/haptics) · tests/voz-cuerpo.spec.js
   Preguntas: ¿puede pisarse una palabra con la siguiente o con el cuenco? ¿Qué pasa al pausar, saltar un paso, volver atrás o salir a mitad de una palabra? ¿Y con «Auto» apagado? ¿Suena la voz con el sonido de PACE apagado? ¿Vibra en el iPhone por la web (no debería ofrecerse) y en las apps? ¿Algo de la carga de audio puede bloquear el runner o gastar datos sin necesidad?
2. LA NOTA DE QUE ACABÓ LA SEMANA DE PRUEBA DE v1 (0.209.0), en tres sitios: el sobre de arriba, una hoja al abrir PACE y la biblioteca, que deben saber unos de otros para no repetirla. Y «Tenerlo para siempre» en Ajustes durante esa semana.
   Lee: app/ui/PremiumFinPrueba.jsx · app/shell/Sobre.finPrueba.js · app/state-paso-v1.js · app/tweaks/PremiumSection.jsx · tests/fin-prueba.spec.js
   Preguntas: ¿puede salir antes de tiempo, dos veces o nunca? ¿Qué pasa con el reloj del móvil cambiado, con dos pestañas, al importar una copia o tras «Borrar todo»? ¿Tapa algo la hoja al abrir? ¿Dice algo falso mientras PACE está abierto para todos hasta v1 (`PREMIUM_ABIERTO_HASTA_V1`)?
3. EL AVISO A TU HORA DE ENTRADA, YA ARREGLADO (0.209.0, tras la novena pasada): programar primero y quitar solo lo que sobra, su canal mudo, las dos campanadas, la nota sin permiso, `MY_PACKAGE_REPLACED` en el manifiesto y pasada la medianoche.
   Lee: app/ui/nativo.entrada.js · android/app/src/main/AndroidManifest.xml · app/ritmo/RitmoSemanaTipo.jsx · tests/aviso-entrada.spec.js
   Pregunta: ¿quedó bien cerrado lo que encontró la novena, o abre algo nuevo?
4. SI TE DA TIEMPO: los botones de «Tus rutinas», más grandes (tests/constructor-dedo.spec.js), y la copia recordada en la web sin instalar (app/tweaks/TweaksData.copia.jsx).

FORMATO DE LA RESPUESTA (en español):
- Primero, el alcance real: qué archivos leíste enteros y cuáles no pudiste leer.
- Después, una lista numerada de hallazgos, del más grave al más leve, hasta 25. En cada uno: gravedad (Grave, Medio o Leve), archivo y la cita exacta para buscarla, «Comprobado» si lo viste en el código o «Supongo» si es inferencia (y en qué), el efecto para quien usa PACE en una frase, y «Cierre:» con cómo se arreglaría o qué prueba lo vigilaría.
- Luego, «Solo se sabe en un móvil»: pasos concretos para probar la voz y la vibración en un Android y un iPhone.
- Al final, tres o cuatro líneas de lo que está bien hecho.
Sin rodeos ni relleno. Si algo no lo sabes, dilo.
```
