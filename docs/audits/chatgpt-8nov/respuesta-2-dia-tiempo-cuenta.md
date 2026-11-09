# ChatGPT, 9 nov. 2026 · segunda respuesta a la revisión de la jornada: el día, el tiempo y lo que se cuenta

Ez la trajo el 9 nov., ~10:40 («comprobemos si nos aporta algo»), con la consigna del 8 nov.: comprobar y no montar nada hasta que
Ez lo vea y lo acepte. ChatGPT leyó `main` en ea41c91a (la 0.194.0). Abajo, lo comprobado; la respuesta entera, al final.

**En corto: aporta, y mucho.** Los siete están en el código tal como los cuenta. Ninguno lo arreglan ya las letras de la 0.195.0
(su rama toca los mismos archivos, pero no estas funciones), así que se montan DESPUÉS de juntarla, en una sesión: 1, 2, 3 y 5 no
cambian cómo se ve nada; 4, 6 y 7 sí, y se pintan para Ez.

## Lo comprobado (coordinadora, 5iWBf)

### 1 · Un Foco pausado cuenta su pausa como foco · ACIERTA

`ritmoBloqueTerminado` (`app/state-ritmo.recolocar.jsx`), si el bloque acaba a otra hora que la del plan, congela lo hecho y pone
al último bloque `dur = fin - ultimo.desde`: el rato de reloj, con la pausa dentro (45 de cuenta atrás + 20 de pausa = 65). Es a
propósito para la línea («la línea dice la verdad», s195), pero ese `dur` se usa como foco hecho:
- `ritmoFocoHecho` lo suma, y eso es lo que se LEE al cerrar el día: «… de foco» en el aro (`aroCerrado`,
  `FocusTimer.jornada.jsx`) y en el panel (`ritmo.hecho.sub`, `RitmoPanel.jsx`). Estadísticas dice 45; el cierre, 65.
- `ritmoPrevios` lo suma a `foco`, `focoLarga` y `seguidos`, que gobiernan la pausa larga (`pausaDe` en `ritmo.regla.js`: 75
  min de foco) y, con el aro corto, cuándo se junta el bloque siguiente. La larga puede llegar antes de tiempo.
Arreglo: el tramo ocupa de 9:00 a 10:05 en la línea, pero lleva aparte sus minutos de foco (los del aro), y las cuentas usan esos.

### 2 · Recargar tras reanudar cambia la hora de empezar · ACIERTA

`persistFocusTimer` (`FocusTimer.support.jsx`) guarda `inicio` solo en pausa; en marcha guarda `endsAt`, minutos e id. Al recargar,
`FocusTimer.jsx` lo deriva (`endsAt - duración`), y su comentario ya dice que ignora las pausas previas. Lo mismo hacen
`ritmoFocoEmpezo` (`state-ritmo.recolocar.jsx`) y la otra pestaña al recibir `corre` (`FocusTimer.pestanas.jsx`). Ese inicio va a
`elapsedSeconds` del evento (`focoElapsedSec`), y `ritmoMotorEntrada` (`state-ritmo.motor.jsx`) saca de ahí la hora de empezar
que aprende el motor: 9:20 en vez de 9:00. Los minutos acreditados no cambian. Pequeño, pero ensucia lo que PACE aprende.

### 3 · Cambiar la cadencia rehace lo ya hecho · ACIERTA EN EL MECANISMO

`bloquesElegir` (`state-ritmo.bloques.jsx`) solo cambia `ejercicioBloques` y sincroniza; el día se compone con `cadaBloque` leído
en vivo (`ritmoMenu`) y los hechos son `cycle - cicloBase`; las marcas de pausa van por ordinal (`ritmoOrdinal`). Si el día no se
recolocó antes (no hay `dia.pasado`), lo de la mañana se recompone con la cadencia nueva: aparecen pausas entre bloques que se
hicieron seguidos y la «hecha» se mueve a otra parada. `ritmoHorario` y `calendarioGuardarOcupado` tampoco congelan antes de
guardar. El efecto exacto en pantalla, por probar; que no congela, comprobado.

### 4 · «Cambiar» con un Foco en marcha · ACIERTA

`ritmoPreguntar` quita el día sin mirar el Foco; `ritmoElegir` toma `cicloBase` = el `cycle` de ese momento; al acabar el Foco
viejo, `completePomodoro` sube `cycle` y el día nuevo da su primer bloque por hecho, con `ritmoBloqueTerminado` recolocando con
una hora que no es la suya. Los tres «Cambiar» (`RitmoPanel.jsx` dos veces, `RitmoHoja.jsx`) no miran si hay Foco. Arreglarlo
pide una decisión de Ez (seguir con el Foco y aplicar el cambio después, o preguntar): **se pinta**.

### 5 · El doble cómputo entre pestañas · EL MECANISMO, SÍ; EL FALLO, SIN REPRODUCIR

`paceFocoContar` (`FocusTimer.pestanas.jsx`) mira `state.focoContado === id` y un candado de Web Locks de diez minutos;
`completePomodoro` (`state-timer.jsx`) guarda solo el último id. Una pestaña dormida con el bloque X que despierte después de que
otra contara X y luego Y, pasados los diez minutos, no tiene nada que la pare… salvo que antes le llegue el aviso de que empezó Y
y reinicie su reloj. Eso depende del orden en que el navegador entregue lo pendiente al despertar: **hay que probarlo**
(Playwright con dos páginas y una congelada por CDP, `Page.setWebLifecycleState`). Si se reproduce, el arreglo es guardar una
lista corta de ids ya contados.

### 6 · Con jornada, Estadísticas › Hoy esconde lo hecho por libre · ACIERTA

`StatsHoy` (`app/stats/StatsHoy.jsx`): con plan, solo las tarjetas del menú; `statsHoySesiones` solo se usa sin plan. Una Respira
antes de elegir el día, o una rutina fuera de una pausa, suma arriba y no sale abajo. Arreglo visible: **se pinta** («Además, por
tu cuenta» u otra forma), casando sesión y parada por identidad para no duplicar.

### 7 · «Hecha · 5 min» con una rutina de 2 · ACIERTA

`statsHoyMeta` pone `it.dur`, el hueco de la pausa en el plan, no lo hecho; y `statsHoyParadas` pone «ahora» por delante de
«hecha» mientras la pausa sigue siendo la actual. La línea usa el mismo criterio. Es texto en pantalla: **se pinta**.

### La mejora del final

Ver el detalle de una parada pasada sin poder editarla: buena idea, para después de v1.

## Orden que propongo

1. **Probar el 5** (si se reproduce, es el más grave: sumaría minutos y ciclos dos veces).
2. **1, 3 y 2**: arreglos de lógica, con prueba y mutante; no cambian cómo se ve nada salvo que el cierre dirá los minutos de
   foco de verdad.
3. **4, 6 y 7**: pintados para Ez, con recomendación.
Todo después de juntar la 0.195.0 y en UNA sesión: tocan `state-ritmo*`, `FocusTimer*` y `StatsHoy.jsx`, los mismos archivos que
las letras de la jornada.

## La respuesta de ChatGPT, entera

He seguido sobre **`main`, commit `ea41c91`**, que es el que devuelve ahora el repositorio. La revisión es **solo de código: no he ejecutado PACE ni sus pruebas**. Dejo fuera los arreglos que has enumerado y el `null` intencional del día sin forma elegida. [Fuente](https://api.github.com/repos/ezradesign/Pace_app/commits/main)

Esta pasada encuentra **cuatro problemas de coherencia del día y sus tiempos, dos de Estadísticas y un riesgo de doble cómputo que necesita una prueba de ejecución**.

## 1. Un Foco pausado puede convertirse en más minutos de Foco dentro de la jornada

**Clasificación: molesta, con efecto en los cálculos posteriores. Antes de v1.**

**Localizador:** `ritmoBloqueTerminado()` y `ritmoFocoHecho()`, en `app/state-ritmo.recolocar.jsx`; `ritmoPrevios()`, en `app/state-ritmo.jsx`.

### Caso paso a paso
1. Empiezas un bloque de **45 minutos a las 9:00**.
2. A las 9:10 pulsas **Pausar foco**.
3. Reanudas a las 9:30.
4. Terminas a las **10:05**: has completado 45 minutos de cuenta atrás, con 20 minutos de interrupción.

### Comprobado en el código
Al recolocar, `ritmoBloqueTerminado()` cambia la duración del tramo terminado a:

```js
fin - ultimo.desde
```

En este caso son **65 minutos**. Después, `ritmoFocoHecho()` suma esas duraciones como minutos de Foco, y `ritmoPrevios()` también las incorpora a `foco`, `focoLarga` y `seguidos`. No son únicamente el ancho visual del tramo: vuelven a entrar en las cuentas del plan. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/state-ritmo.recolocar.jsx)

En cambio, la acreditación del temporizador usa los **45 minutos del bloque**, y distingue explícitamente el tiempo activo del tiempo transcurrido con interrupciones. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/focus/FocusTimer.jsx)

### Qué ve y qué pierde quien lo usa
Puede tener **45 minutos en Estadísticas y 65 minutos de Foco dentro de las cuentas de la jornada**. Además, el resto del plan se compone utilizando esos 20 minutos de interrupción como Foco realizado.

**Deducción:** la pausa larga o la cantidad de Foco pendiente pueden verse afectadas. El resultado concreto depende de la opción y del momento del día.

### Arreglo
Separar:
- **el intervalo que ocupó el bloque**, incluidas sus interrupciones;
- **los minutos de Foco completados**.

La línea puede ocupar de 9:00 a 10:05 sin afirmar que fueron 65 minutos de Foco.

### Prueba
Bloque de 45 minutos con una interrupción de 20:
- una sola acreditación de 45;
- tiempo transcurrido de 65;
- los acumulados de Foco del plan usan 45;
- al cerrar la jornada, no aparecen 65 como Foco hecho.

---

## 2. Recargar después de reanudar un Foco cambia su hora de inicio registrada

**Clasificación: molesta; afecta al dato que alimenta el aprendizaje. Antes de v1.**

**Localizador:** `persistFocusTimer()`, `loadPersistedFocusTimer()` y el efecto de restauración de `FocusTimer()`.

### Caso paso a paso
1. Repites el bloque anterior: empiezas a las 9:00, paras 20 minutos y terminas a las 10:05.
2. Después de reanudar, mientras sigue corriendo, **recargas PACE**.
3. Dejas que termine.

### Comprobado en el código
Cuando el Foco está corriendo, `persistFocusTimer()` guarda el final, los minutos y el identificador, **pero no el inicio original**, aunque recibe ese argumento.

Al restaurarlo, `FocusTimer()` reconstruye el inicio restando la duración completa al final. El propio comentario reconoce que esa estimación ignora las pausas anteriores. En el ejemplo reconstruye **9:20**, no 9:00. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/focus/FocusTimer.support.jsx)

`ritmoMotorEntrada()` obtiene posteriormente el comienzo de un Foco a partir de su final y de `elapsedSeconds`. Por tanto, esa pérdida puede llegar a las horas que interpreta el motor. [Fuente](httpshttps://github.com/ezradesign/Pace_app/raw/refs/heads/main/app/state-ritmo.motor.jsx)

### Qué ve y qué pierde quien lo usa
**No pierde los 45 minutos acreditados.** Lo que pierde es la fidelidad del inicio: hacer exactamente lo mismo, pero recargar, produce un registro temporal distinto.

**Deducción:** si esto se repite, puede alterar las evidencias para proponer una hora de entrada. No afirmo que una única recarga genere una propuesta.

### Arreglo
Persistir el inicio original también en estado `running` y restaurarlo si existe. Mantener la estimación solo para registros antiguos.

Revisaría asimismo la recepción de `corre` entre pestañas: también reconstruye el inicio restando los minutos al final.

### Prueba
Comparar una sesión:
- sin recarga;
- recargada mientras corre después de reanudar;
- retomada desde su estado pausado.

Las tres deben conservar el mismo inicio, final, tiempo activo y tiempo transcurrido.

---

## 3. Cambiar la cadencia de pausas puede reescribir lo ya realizado

**Clasificación: grave para la integridad del plan, aunque no implica perder todos los datos. Antes de v1.**

**Localizador:** `bloquesElegir()`, `ritmoMenu()`, `ritmoPlanBase()` y `ritmoOrdinal()`.

### Caso paso a paso
1. Configuras bloques de **5 minutos**, con pausas **a tu ritmo**.
2. Completas seis bloques seguidos: de 9:00 a 9:30.
3. Haces la primera pausa.
4. Con el aro parado, cambias a **después de cada bloque**.

### Comprobado en el código
`bloquesElegir()` cambia `ejercicioBloques` y sincroniza el aro, pero **no congela primero los tramos ya realizados**. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/state-ritmo.bloques.jsx)

El plan se recompone con la nueva cadencia. Su progreso sigue siendo `cycle - cicloBase`, y las marcas de pausa siguen vinculadas a un **ordinal**, no a una identidad estable de la parada. Solo lo que ya está en `dia.pasado` queda protegido frente a esa recomposición. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/state-ritmo.jsx)

### Qué ve y qué pierde quien lo usa
La nueva composición puede insertar pausas **entre los seis bloques que ya hizo sin ellas**. La marca de la primera pausa puede quedar asociada a una parada con otra hora.

No está demostrado aquí que se dupliquen los minutos globales de Estadísticas. El problema comprobable es **reescribir la representación del pasado y desplazar la correspondencia de sus marcas**.

### Arreglo
Antes de aplicar una cadencia nueva:
- congelar lo realizado;
- conservar la pausa abierta y lo hecho de ella;
- aplicar la preferencia **solo a lo que queda**.

La misma protección merece revisión en los cambios de horario y las nuevas reuniones: `ritmoHorario()` y `calendarioGuardarOcupado()` actualizan sus entradas sin hacer por sí mismas esa congelación.

### Prueba
Guardar antes y después del cambio:
- horas de los seis bloques completados;
- identidad y estado de la pausa hecha;
- minutos acreditados.

Todo lo anterior debe permanecer igual; solo cambia el futuro.

---

## 4. «Cambiar» durante un Foco deja un bloque antiguo vivo dentro de una jornada nueva

**Clasificación: molesta, con riesgo de atribución incorrecta. Antes de v1.**

**Localizador:** `ritmoPreguntar()`, `ritmoElegir()`, `ritmoSincronizar()` y `RitmoSobre()`.

### Caso paso a paso
1. Empiezas una jornada con un Foco de **45 minutos a las 9:00**.
2. A las 9:10 pulsas **Cambiar**.
3. Eliges **Una hora**.
4. El Foco original continúa y termina a las 9:45.

### Comprobado en el código
- `ritmoPreguntar()` retira `dia`, pero no detiene ese Foco.
- `ritmoElegir()` crea otro día con un `cicloBase` nuevo.
- `ritmoSincronizar()` evita cambiar los minutos cuando hay un Foco vivo.
- El progreso del día elegido sigue saliendo de la diferencia de ciclos.

El botón «Cambiar» de la cabecera no incorpora una decisión específica sobre ese bloque en marcha. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/ritmo/RitmoPanel.jsx)

### Qué ve y qué pierde quien lo usa
Puede elegir un plan nuevo mientras termina una sesión que empezó bajo el anterior. Al completar, el incremento de ciclo pasa a ser progreso del **nuevo día**.

**Deducción:** el nuevo plan puede dar por terminado su primer bloque con una sesión cuyo inicio y duración no corresponden a ese bloque. Hay que ejecutarlo para fijar el resultado exacto del aro y la pausa.

### Arreglo
No hace falta impedir el cambio. Hay que definir una transición:
- «Este Foco continúa; el cambio se aplica después», o
- una confirmación para descartarlo, sin acreditarlo.

Lo importante es que el bloque tenga una pertenencia estable, no que cambie de jornada implícitamente.

### Prueba
Cambiar jornada con el Foco:
- corriendo;
- pausado;
- terminado, pendiente de contabilizar.

En cada caso, comprobar a qué plan pertenece y que avance **una sola vez el bloque correcto**.

---

## 5. La protección contra duplicados solo recuerda el último Foco contado

**Clasificación: riesgo grave, pendiente de reproducción entre pestañas. Validaría esto antes de v1.**

**Localizador:** `paceFocoContar()` y `completePomodoro()`.

### Caso que hay que probar
1. Las pestañas A y B comparten el bloque **X**.
2. A queda suspendida conservando ese temporizador.
3. B termina X y después completa otro bloque **Y**.
4. Han pasado más de los diez minutos del candado de X.
5. A vuelve y trata de resolver su X antiguo.

### Comprobado en el código
`paceFocoContar()` comprueba si:

```js
state.focoContado === id
```

El candado dura diez minutos. `completePomodoro()` sustituye `focoContado` por el identificador del último bloque. Después de Y, **el estado ya no recuerda X mediante esa protección**. [Fuente](https://github.com/ezradesign/Pace_app/raw/refs/heads/main/app/focus/FocusTimer.pestanas.jsx)

La acreditación incrementa ciclo y minutos; no mantiene allí un conjunto de identificadores ya acreditados. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/state-timer.jsx)

### Qué podría ver y perder quien lo usa
Si la pestaña antigua llega a ejecutar esa finalización, puede sumar otra vez X: minutos, ciclo y progreso del plan.

**Lo que no doy por demostrado:** que el navegador entregue los callbacks y mensajes pendientes en el orden necesario para reproducirlo. Los mensajes de sincronización pueden evitarlo en determinadas ejecuciones.

### Arreglo
Hacer la acreditación idempotente por identificador de bloque, de forma persistente. Un historial acotado de identificadores recientes puede bastar; **el candado y «el último que conté» no representan la misma garantía**.

### Prueba
Además de probar dos finales simultáneos, suspender una pestaña durante **dos bloques completos**, con el mismo preset, y devolverla después de caducar el primer candado. El total debe permanecer en dos sesiones.

---

## 6. Con jornada elegida, Estadísticas oculta sesiones reales hechas por libre

**Clasificación: molesta. Antes de v1.**

**Localizador:** `StatsHoy()` y `statsHoySesiones()`, en `app/stats/StatsHoy.jsx`.

### Caso paso a paso
1. A las 8:50 haces **2 minutos de Respira** desde el catálogo.
2. A las 9:00 eliges tu jornada.
3. Abres Estadísticas → Hoy.

También ocurre si haces una rutina adicional mientras tienes jornada, fuera de una pausa abierta.

### Comprobado en el código
Con plan, `StatsHoy()` devuelve las tarjetas del menú. `statsHoySesiones()` solo se utiliza en la otra rama: **cuando no hay plan**. No hay una sección adicional que incorpore las sesiones reales ajenas al menú. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/stats/StatsHoy.jsx)

### Qué ve y qué pierde quien lo usa
El total superior puede incluir esos dos minutos, pero **no encuentra debajo la sesión que los explica**. Elegir una jornada cambia qué actividad puede consultar, aunque no haya borrado nada.

**Deducción de experiencia:** «¿Me lo ha contado?», «¿Dónde está lo que hice antes?» o «¿Por qué el total no corresponde a las tarjetas?».

### Arreglo
Conservar el menú y añadir, solo cuando corresponda, **«Además, por tu cuenta»**.

Para no duplicar tarjetas, la relación entre sesión y parada debería hacerse por identidad, no únicamente por nombre de rutina.

### Prueba
Sesión antes de elegir jornada y otra adicional durante ella:
- ambas siguen consultables;
- cada una aparece una vez;
- los minutos acreditados explican los totales.

---

## 7. Las tarjetas confunden la duración prevista de la pausa con la actividad realizada

**Clasificación: molesta; principalmente de presentación. Antes de v1.**

**Localizador:** `statsHoyMeta()`, `statsHoyParadas()` y `RitmoEtiqueta()`.

### Caso paso a paso
1. Hay una pausa de **5 minutos** con una rutina de **2 minutos**.
2. Completas la rutina.
3. Empiezas el siguiente Foco.
4. Consultas la parada pasada en Estadísticas o en la línea.

### Comprobado en el código
La etiqueta de una pausa hecha utiliza `it.dur`: **la duración del hueco del plan**. Puede decir «Hecha · 5 min», aunque la sesión realizada y acreditada durara dos.

La línea emplea el mismo criterio. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/ritmo/RitmoLinea.jsx)

Además, mientras la parada es la actual, `statsHoyParadas()` prioriza `ahora` sobre la marca `hecha`: **haberla realizado y que siga siendo el intervalo actual no se muestran como dos cosas compatibles**.

### Qué ve y qué pierde quien lo usa
- Una tarjeta que parece acreditar cinco minutos de práctica.
- Durante el intervalo abierto, una actividad terminada que aún aparece como «Ahora», sin el reconocimiento de hecha.

**No afirmo que se guarden cinco minutos de ejercicio:** el problema es lo que comunica la tarjeta.

### Arreglo
Distinguir tres datos:
- **estado:** hecha;
- **tiempo de actividad:** el acreditado;
- **intervalo previsto:** cinco minutos, si interesa enseñarlo.

No hace falta añadirlos todos a la vez. «Hecha» puede ser suficiente si no se dispone de una duración real vinculada.

### Prueba
Rutina de dos minutos en pausa de cinco:
- al acabar ya se reconoce como hecha;
- esperar al siguiente bloque no cambia los minutos comunicados;
- nunca se presentan los cinco minutos previstos como actividad realizada.

---

## Qué priorizaría antes de v1

| Orden | Trabajo | Motivo |
|---|---|---|
| **1** | Probar el retorno de una pestaña tras dos bloques | Puede revelar doble acreditación. |
| **2** | Congelar el pasado antes de cambiar cadencia, horario o reuniones | Evita que el día cambie retrospectivamente. |
| **3** | Separar tiempo ocupado y Foco activo | Evita dos cuentas incompatibles del mismo bloque. |
| **4** | Definir qué hace «Cambiar» con un Foco vivo | Evita atribuciones implícitas al nuevo plan. |
| **5** | Conservar el inicio al restaurar | Mantiene coherentes los datos temporales. |
| **6** | Enseñar las sesiones adicionales y aclarar las tarjetas | Permite entender qué se contó y por qué. |

**Como mejora posterior**, permitiría consultar el detalle de una parada pasada —sin volverla editable—: qué hiciste y qué se contó. Ahora las paradas pasadas de la línea quedan deshabilitadas. Eso dificulta investigar una discrepancia desde la propia app.

No propondría añadir otro botón de «Terminar por hoy»: la decisión vigente lo descartó y mantiene «Hoy voy por libre» como salida. Aquí el trabajo es **que cambiar de modo conserve bien lo anterior**, no abrir otra vía paralela. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/docs/product/DECISIONES_PRODUCTO.md)

### Límite de esta pasada

No doy por validados todos los casos de medianoche, cambio de hora, bloqueo nativo o sesiones de cuerpo interrumpidas por haber leído sus mecanismos. **Los resultados nuevos de esta revisión están en los siete puntos anteriores**; el caso de doble cómputo queda expresamente como riesgo que hay que reproducir, no como fallo observado.
