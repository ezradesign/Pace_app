# Novena pasada externa (Fable): los avisos del móvil de la 0.205.0

Encargo para la app de fuera, pedido por Ez el 15 nov. 2026. Ez pega el bloque de abajo tal cual. La respuesta se guarda
tal cual en `externa-novena-15nov.md` de esta carpeta y la coordinadora la comprueba punto a punto antes de proponer nada.

```
Eres una auditora externa de código. Revisa los AVISOS DEL MÓVIL de PACE, una app de pausas activas (React 18 sin bundler, web/PWA y apps de Android y iPhone con Capacitor). El repositorio es público: https://github.com/ezradesign/Pace_app (rama main, versión 0.205.0). Lee los archivos con raw.githubusercontent.com o cdn.jsdelivr.net/gh/ezradesign/Pace_app@main/. No escribas código: busca fallos y di cómo se cerrarían.

POR QUÉ AHORA: la 0.205.0 acaba de ir a la prueba cerrada de Google Play y a TestFlight. Todo lo nativo de los avisos se ha probado solo con pruebas que imitan a Capacitor; nadie lo ha probado aún en un móvil de verdad. Quiero saber qué puede fallar en un Android o un iPhone reales antes de que lo usen los testers.

LO QUE DEBERÍA PASAR (compruébalo contra el código):
1. Con PACE en segundo plano, al acabar el Foco avisa el sistema; en Android, con la campana de PACE por su canal «Fin del Foco» (`pace_fin_foco`, con `res/raw/campana_aviso.wav`) o por «Fin del Foco, sin sonido» (`pace_fin_foco_mudo`) si el sonido de PACE está apagado. En el iPhone, con `campana-aviso.wav` solo si el sonido está encendido.
2. Al acabar una pausa (Pausa, Larga o la de «A tu ritmo»), otro aviso con su propio sonido, dos campanadas (`pausa_aviso.wav`), por los canales `pace_pausa` y `pace_pausa_mudo`. Con «A tu ritmo», el aviso de la pausa que vendrá se pone ya al empezar el bloque.
3. UNA SOLA CAMPANA: si el sistema ya avisó del fin, PACE no vuelve a sonar al abrirse. Al volver a PACE se quitan los avisos pendientes; pausar o reiniciar el bloque también los quita, incluido el que dejó un proceso anterior que Android cerró.
4. Alarma exacta (Android 12 o más): solo se pide `isExactNotification` si «Alarmas y recordatorios» está concedido. Si no, el primer Foco con el aviso encendido ofrece UNA vez la línea «Avisos a su hora ›», que abre ese ajuste solo con un toque.
5. El aviso fijo con el móvil bloqueado (lo que queda del bloque) no suena.

LEE PRIMERO (si el lector falla, prioriza en este orden):
- app/ui/android.avisos.js · app/ui/ios.js · app/ui/nativo.js
- app/focus/FocusTimer.avisos.jsx · app/focus/FocusTimer.jsx · app/focus/FocusTimer.support.jsx
- app/ritmo/ritmo.aviso.js · app/ui/Sound.jsx
- capacitor.config.json · package.json (versión de @capacitor/local-notifications)
- android/app/src/main/AndroidManifest.xml · android/app/src/main/java/com/ezradesign/pace/MainActivity.java y PaceAvisoFijo.java · android/app/src/main/res/raw/
- ios/App/App/AppDelegate.swift · ios/App/App/Info.plist · ios/App/App.xcodeproj/project.pbxproj (¿están campana-aviso.wav y pausa-aviso.wav en el paquete de la app?)
- Las pruebas: tests/android-nativo.spec.js · tests/android-avisos.spec.js · tests/pausa-aviso.spec.js · tests/ios-nativo.safari.spec.js
- scripts/verify.android.js · scripts/verify.ios.js
- Las reglas vigentes, con grep de «aviso», «canal» o «campana»: docs/product/DECISIONES_TECNICAS_VIGENTES.md

PREGUNTAS CONCRETAS:
a) Canales de Android: ¿se crean antes de cualquier aviso que los nombre, también en una instalación que ya tenía PACE? ¿El `sound` del canal está en el formato que pide la versión del complemento (nombre del recurso, con o sin extensión)? ¿Importancia, vibración y lo que pasa con el canal viejo «Default»?
b) Alarma exacta: ¿qué permiso declara el manifiesto (SCHEDULE_EXACT_ALARM o USE_EXACT_ALARM) y qué implica para Play? ¿`allowWhileIdle` basta con el móvil en reposo? ¿Se lee bien el estado al volver del ajuste?
c) Una sola campana: carreras entre `appStateChange` y `visibilitychange`; ids de los avisos (1, 3) y lo que pasa si el proceso muere y PACE se abre de nuevo; un aviso de la pausa que queda puesto tras cambiar de idea (pausar, reiniciar, cambiar minutos, saltar la pausa).
d) Reinicio del móvil, actualización de la app, ahorro de batería, «No molestar» y cambio de hora o de huso con avisos ya puestos.
e) iPhone: ¿el sonido llega al paquete? ¿Qué pasa con el interruptor de silencio y con el permiso negado? ¿Algún aviso puede sonar dos veces?
f) Las pruebas: ¿alguna puede pasar aunque lo de arriba esté roto en un móvil de verdad?

FORMATO DE LA RESPUESTA (en español):
- Primero, el alcance real: qué archivos leíste enteros y cuáles no pudiste leer.
- Después, una lista numerada de hallazgos, del más grave al más leve, hasta 25. En cada uno: gravedad (Grave, Medio o Leve), archivo y la cita exacta para buscarla (si no tienes números de línea), «Comprobado» si lo viste en el código o «Supongo» si es inferencia, el efecto para quien usa PACE en una frase, y «Cierre:» con cómo se arreglaría o qué prueba lo vigilaría.
- Luego, «Solo se sabe en un móvil»: los pasos concretos para probar en un Android 14 y en un iPhone lo que no se puede saber leyendo.
- Al final, tres o cuatro líneas de lo que está bien hecho.
Sin rodeos ni relleno. Si algo no lo sabes, dilo.
```
