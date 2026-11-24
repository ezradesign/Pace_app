> Séptima pasada externa (Fable, en la app de fuera), traída por Ez el 11 nov. 2026 a las 12:30. Texto tal cual, sin comprobar.
> Audita las cuatro ramas contra `main` ANTES de juntarlas. Ese mismo día se juntaron como 0.198.0, por el orden 1, 2, 3 y 4
> (ella recomendaba 1, 4, 3 y 2). Sus ramas: 1 = `caza-ci-landing-noche`, 2 = `montar-auditoria-10nov`, 3 = `chatgpt-jornada-9nov`, 4 = `caza-aro-fijo-10nov`.

# Auditoría de las cuatro ramas contra main
Qué he leído y qué no. Las comparaciones de las ramas 2, 3 y 4 llegan cortadas por tamaño. De ellas leí enteros `state-achievements.ocaso.js`, `state-achievements.jsx`, `state-feedback.jsx`, `state-paso-v1.js`, `SessionDone.sigue.jsx`, `PremiumSection.jsx`, `ritmo.lunes.jsx`, `state-ritmo.recolocar.jsx`, `StatsHoy.jsx`, `home-geometry.horario.js`, `logros-ocaso-buho.spec.js` y los trozos de diff que cito. La rama 1 la leí entera.
No he leído las demás pruebas nuevas, `state-entitlement.jsx`, el sobre ni `SessionShell.jsx`. No he ejecutado nada. Los números de línea llevan «≈» porque están contados a mano.
No encontré ningún fallo grave (pérdida o corrupción de datos) en lo leído.
(a) Datos
1 · Leve · `app/stats/StatsHoy.jsx` ≈62-67 (`statsHoySueltas`) · rama 3 · comprobado

* Qué pasa: el día que llega la actualización, las pausas hechas antes no traen `dia.sesiones`. En Estadísticas › Hoy salen dos veces (en su parada y bajo «Además, por tu cuenta»), y en la línea pasan de «hecha · 5 min» a «hecha».
* Reproducir: sembrar un día con `estados: {1:'hecha'}`, sin `sesiones` y con su `session.completed` de hoy en el registro; abrir Estadísticas › Hoy. Pasa igual al importar una copia de hoy hecha con la versión anterior.
* Arreglo: si el día tiene alguna pausa «hecha» y no tiene `sesiones`, no pintar el bloque de sueltas.

2 · Medio · `app/state-ritmo.pausa.jsx` ≈105-133 (`ritmoSesionesHoy`, `ritmoMinutosHechos`) · rama 3 · supuesto en parte

* Qué pasa: los minutos de una pausa salen solo del registro de eventos. La cabecera de `state-paso-v1.js` dice «En el iPhone el registro no escribe». Si es así, en el iPhone toda pausa hecha dirá «hecha» sin minutos (hoy dice «hecha · 5 min») y nunca saldrá «Además, por tu cuenta».
* Comprobado: el código lee solo `paceEventsSnapshot()`. Supuesto: que en el iPhone esté vacío (no leí el almacén).
* Reproducir: en el iPhone, hacer una rutina en una pausa y mirar la línea y Estadísticas › Hoy.
* Arreglo: guardar los minutos junto al `runId` en `dia.sesiones` (`{id, min}`) al apuntar la sesión, y leerlos de ahí.

3 · Leve · `app/state-ritmo.pausa.jsx` ≈135 (`ritmoMetaHecha`) · rama 3 · comprobado

* Qué pasa: puede salir «hecha · 0 min». `completeExtraSession` manda 0 minutos cuando la duración no es positiva, y `ritmoMetaHecha` solo mira `min != null`.
* Reproducir: en una pausa, abrir una rutina de Estira y pulsar «Terminar antes» al momento.
* Arreglo: `min > 0` en vez de `min != null`.

4 · Leve · `app/state-ritmo.recolocar.jsx` ≈222-232 (`ritmoFocoDelDiaNuevo`) · rama 3 · comprobado

* Qué pasa: «Cambiar» con un Foco empezado antes de medianoche no entra en la regla nueva (`toDateString` distinto). La pausa vuelve a caer en mitad del bloque, como en main.
* Reproducir: reloj a las 23:50, empezar un Foco de 25, «Cambiar» a las 00:05.
* Arreglo: si empezó ayer y sigue en marcha, usar `desde: 0` y como `primerBloque` lo que queda.

5 · Leve · rama 3 · supuesto

* Qué pasa: con dos pestañas, `dia.sesiones` viaja por el estado pero el registro es de cada pestaña. La pestaña que no hizo la sesión puede decir «hecha» sin minutos.
* Arreglo: el mismo del n.º 2.

[Source](https://raw.githubusercontent.com/ezradesign/Pace_app/claude/chatgpt-jornada-9nov/app/stats/StatsHoy.jsx) · [Source](https://github.com/ezradesign/Pace_app/compare/main...claude/chatgpt-jornada-9nov.diff) · [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/claude/montar-auditoria-10nov-3ef28c/app/state-paso-v1.js)
(b) Guardar o no guardar
6 · Leve · `app/main/home-geometry.horario.js` ≈55-63 (`paceAroCartaRecordar`) · rama 4 · comprobado el código, supuesto el efecto

* Qué pasa: escribe `pace.aro.carta.v1` directamente, sin pasar por `persistState`, así que no respeta ni la guarda de la landing (rama 1) ni la de «copia importada, nada se guarda hasta recargar». Además, cualquier clave `pace.*` hace que `landing/cara.js` enseñe la app en la siguiente visita.
* Por qué creo que no salta hoy: solo escribe con las actividades pintadas, y con la landing delante la app no monta.
* Reproducir: juntar 1 y 4 y pasar `tests/landing-cara.spec.js`, que espera `localStorage` vacío.
* Arreglo: `if (window.PACE_CARA === 'landing') return;` al entrar en `paceAroCartaRecordar`.

En el paso de la landing a la app en la misma carga no encontré hallazgo: `paceAbrirApp` cambia `PACE_CARA` antes de montar, y lo relevado en memoria se guarda con el primer `setState`.
[Source](https://github.com/ezradesign/Pace_app/compare/main...claude/caza-aro-fijo-10nov.diff) · [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/landing/cara.js) · [Source](https://github.com/ezradesign/Pace_app/compare/main...claude/caza-ci-landing-noche-5ea50b.diff)
© Logros
7 · Medio · `app/state-achievements.ocaso.js` ≈28-35 (`paceOcasoFoco`) · rama 2 · comprobado

* El código: `var empezo = Date.now() - (Number(minutos) || 0) * 60000;`. Calcula el inicio como «ahora menos lo que dura el bloque».
* Qué pasa: falla en dos casos y apunta `ocasoTarde`, con lo que el día no cuenta para Ocaso aunque la jornada se cerrara bien.
   * Foco pausado: empezó antes de lo que sale la cuenta.
   * Foco que acabó con la app dormida o el móvil bloqueado: `Date.now()` es la hora de volver. En el móvil esto es lo normal.
* Reproducir: salida a las 17:00, último bloque de 25 a las 16:30, bloquear el móvil a las 16:40, abrir a las 18:00. `ocasoTarde` queda con la fecha de hoy.
* Arreglo: pasar el inicio real. `FocusTimer` ya lo tiene, y la rama 3 lo guarda también tras recargar. Sería `paceOcasoFoco(inicioMs)` desde `completeFocusSession`, con `opts.fin - minutos` como reserva.

8 · Medio · `app/state-achievements.ocaso.js` ≈46 (`paceOcasoMirar`) · rama 2 · comprobado el código, supuesto el alcance

* El código: `var cerrada = !!p && p.total > 0 && p.hechos >= p.total;`. No mira ninguna hora ni qué opción de día se eligió.
* Qué pasa: supongo que «Una hora» da un plan de uno o dos bloques. Si es así, cinco días de «Una hora» dan «Cinco jornadas cerradas a su hora».
* Dato de apoyo: la propia prueba da el día por cerrado a las 11:00 con `cycle: 20`.
* Arreglo: exigir `p.m.opcion` de jornada o media jornada (pregunta 1).

9 · Leve · `app/state-feedback.jsx` ≈100-105 (`recordRoutineFeedback`) · rama 2 · comprobado el orden, supuesto quién lo usa

* Qué pasa: `if (opciones && opciones.sinEvento) return;` va antes de `paceBuhoMirar()`. Si la respuesta 25 es un «No» (el que se puede deshacer), Búho no se mira ahí y llega en la siguiente sesión entera.
* Arreglo: dejarlo así y decirlo en el comentario, o mirarlo al salir de la pantalla.

10 · Leve · `paceOcasoFoco` · rama 2 · comprobado

* Qué pasa: un Foco empezado tras la salida que acaba pasada la medianoche no saca de la cuenta el día de ayer, porque compara con `todayISO()` del día nuevo.
* Arreglo: usar la fecha del inicio real (sale gratis con el n.º 7).

Ya decidido (Ez, D-6 D, en `CONTENT.md` de la rama): quien tenía Ocaso o Búho los conserva, el progreso de `duskDates` no se traslada, y quien ya llevaba 25 respuestas recibe Búho en su próxima sesión. No vi camino de doble aviso: `unlockAchievement` sale si ya existe.
[Source](https://raw.githubusercontent.com/ezradesign/Pace_app/claude/montar-auditoria-10nov-3ef28c/app/state-achievements.ocaso.js) · [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/claude/montar-auditoria-10nov-3ef28c/app/state-feedback.jsx) · [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/claude/montar-auditoria-10nov-3ef28c/app/state-timer.jsx)
(d) Cuentas que no cuadran
Son los n.º 1, 2, 3 y 5: la línea, la hoja y Estadísticas leen la misma función, así que fallan juntas y no entre sí. El desajuste es entre «hecha» sin cifra y el total de arriba, que sí suma esos minutos.
(e) Cruces al juntar
11 · Medio · `index.html`, `DECISIONES_TECNICAS_VIGENTES.md` · comprobado en 1, 2 y 3

* `index.html` lo regeneran las cuatro ramas: conflicto seguro. No se resuelve a mano; se junta el código y se hace un solo `node build-standalone.js` al final.
* Las ramas 2 y 3 añaden su fila «arriba del todo» en el documento de decisiones, en la misma línea.

12 · Medio · `app/state-timer.jsx` ≈35-52 (`completePomodoro`) · ramas 2 y 3 · comprobado

* La rama 3 cambia el `setState` (`focoContados`) y la rama 2 añade `paceOcasoFoco` unas líneas más abajo.
* Puede juntarse sin conflicto de texto y aun así quedar el n.º 7 sin usar el inicio que la 3 ya trae. Hay que juntarlo a mano.
* Posible segundo cruce, sin comprobar: `state-events.jsx`. La 3 lo toca, y la 2 cita ahí `paceUltimaPuertaLeer`.

13 · Leve · `app/ritmo/ritmo.css.jsx` (`.pace-rt-lunes`) y `home-geometry.horario.js` · ramas 2 y 4 · supuesto

* La línea de los lunes añade una línea bajo el resumen en el ordenador. La rama 4 recuerda el tamaño del aro por ventana e idioma, no por día.
* Efecto posible: el tamaño medido un martes se aplica el lunes, o al revés.
* Arreglo: medir la home en lunes a 1280×720 y 1536×710 con las dos ramas juntas.

14 · Leve · `docs/proposals/aro-fijo-10nov/aro-fijo.html` · rama 4 · comprobado en el diff de `app/`

* La página dice «Montada: la A» (aro fijo de 372 px), pero el código de la rama no fija el aro; solo trata el horario abierto.
* Arreglo: quitar la página de esta rama o corregir la frase.

Sobre los otros dos puntos:

* 500 líneas: no puedo contarlas. De lo visto, el único archivo de `app/` tocado por dos ramas es `state-timer.jsx`, que es corto. Juntar no debería pasar ningún archivo del límite si cada rama pasa `verify` sola.
* Inglés: todas las claves nuevas que leí (`premium.settings.vida`, `session.sigue.*`, `lunes.*`, `stats.hoy.suelta`, las dos descripciones de logros) tienen su texto. `/premium` sigue diciendo «versión 1»; ya está dicho en el commit de la rama 2.

[Source](https://github.com/ezradesign/Pace_app/compare/main...claude/montar-auditoria-10nov-3ef28c.diff) · [Source](https://github.com/ezradesign/Pace_app/compare/main...claude/chatgpt-jornada-9nov) · [Source](https://github.com/ezradesign/Pace_app/compare/main...claude/montar-auditoria-10nov-3ef28c)
(f) Pruebas
15 · Medio · `tests/logros-ocaso-buho.spec.js` ≈21-27 y ≈56-62 · rama 2 · comprobado en este archivo

* Qué pasa: el día se «cierra» escribiendo `cycle: 20` en el estado, y el Foco tardío se simula llamando a `window.paceOcasoFoco(25)`.
* Consecuencia: si se borra la llamada de `completePomodoro`, o si el inicio se calcula mal (n.º 7), este archivo sigue en verde.
* Arreglo: una prueba que acabe un bloque de verdad con `terminarBloque` tras una pausa, y mire `ocasoTarde`.

16 · Leve · mismo archivo, «trasnochar ya no lo da» · comprobado

* Qué pasa: corre por libre, donde `ritmoPlan` es nulo. Con la regla nueva no puede fallar a ninguna hora; solo cae con la regla vieja.
* Arreglo: añadir el caso «jornada cerrada y sesión a las 22 h».

Dependencia de la hora: en la rama 1 las dos pruebas fijan el reloj (mediodía, y 23:00 más dos horas) y no vi ninguna. La de logros usa una fecha fija, lunes 16 nov. 2026. Las demás pruebas nuevas no las he leído.
[Source](https://raw.githubusercontent.com/ezradesign/Pace_app/claude/montar-auditoria-10nov-3ef28c/tests/logros-ocaso-buho.spec.js)
Preguntas para Ez

1. ¿Ocaso vale con «Una hora» o con un día cambiado a media tarde? Recomiendo que cuente solo jornada y media jornada.
2. ¿Fila de compra en Ajustes durante la semana de prueba de v1? Hoy, mientras dura, la fila dice «Prueba hasta el…» y solo abre el campo del código (`PremiumSection.jsx` ≈96-105, comprobado). Recomiendo enseñar también «Tenerlo para siempre»: es la semana en que más sentido tiene.
3. En el iPhone, si no hay registro, ¿«hecha» sin minutos? Recomiendo guardar los minutos en `dia.sesiones`. Arregla de una vez los n.º 1, 2 y 5.
4. ¿Se junta la página «El aro fijo» con la rama 4? Recomiendo que no, hasta que diga lo que hace el código.
5. ¿En qué orden se juntan? Recomiendo 1, 4, 3 y 2 al final (para que Ocaso use el inicio real de la 3), con un solo build y un solo cambio de versión.

Pruebas a mano en un móvil

1. Ocaso con el móvil bloqueado. Poner la salida a 30 min vista, empezar el último bloque, bloquear y abrir media hora después de la salida. Exportar la copia: `ocasoDias` debe llevar hoy y `ocasoTarde` no. Repetir pausando el Foco 15 min.
2. Minutos de la pausa. En una pausa de 5 min, hacer una rutina de 2. La línea, la hoja y Estadísticas › Hoy deben decir «hecha · 2 min». Hacerlo en Android y en iPhone.
3. Sesión suelta. Con el día elegido y fuera de pausa, hacer una Respira. Debe salir una sola vez, bajo «Además, por tu cuenta», y el total de arriba debe cuadrar.
4. Cierre del ejercicio. Desde la pausa, acabar una rutina: «Empezar el ciclo 2» (por libre) debe arrancar el Foco. Con jornada, bloquear el móvil en el cierre, volver cuando la pausa ya acabó y ver qué dice el botón.
5. «Cambiar» con Foco en marcha y con Foco en pausa. El bloque debe quedar como bloque 1, a su hora, y contarse una sola vez al acabar.
6. Dos ventanas. Con la PWA instalada y una pestaña del navegador, acabar el mismo Foco en las dos: un solo bloque contado.
7. Landing. En un navegador limpio, «Abrir PACE», un vaso de agua y recargar: sigue la app y sigue el vaso. Dejar la landing abierta pasada la medianoche y recargar: sigue la landing.
8. Línea de los lunes. Solo sale desde v1; en la beta no se puede ver sin una compilación con el interruptor apagado. Ahí, mirar el sobre y el cajón a 360 px
