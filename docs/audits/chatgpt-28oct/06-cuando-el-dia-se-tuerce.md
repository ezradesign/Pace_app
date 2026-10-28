# Revisión 6 de ChatGPT (28 oct. 2026): Cuando el día no sale como estaba previsto

> Texto tal cual lo pegó Ez. ChatGPT leyó `main` en `95bfcd6`, sin ejecutar la app. Lo que comprobó la
> coordinadora contra el código de la 0.185.0, con sus códigos (Q1-Q7), está en `LEEME.md` de esta
> carpeta y en el relevo (`docs/traspaso/relevo-coordinadora-22oct.md`, bloque «28 oct., ~20:10»).

---

He seguido con una pregunta distinta: **¿PACE sigue siendo una ayuda cuando mi día no sale como estaba previsto?**

El recorrido ideal ya lo hemos revisado. Ahora he reconstruido situaciones más habituales: estoy terminando algo, cambio de opinión, hago una pausa fuera de la app o uso dos dispositivos.

**Sigue siendo una revisión de código y textos, no una prueba interactiva.** `main` permanece en `95bfcd64`. Separo comportamientos comprobables de hipótesis de usabilidad que habría que observar con testers. [Fuente](https://api.github.com/repos/ezradesign/Pace_app/commits/main)

## 1. «No quiero saltarme la pausa: quiero terminar este correo»

**Prioridad alta · Falta de encaje con una interrupción cotidiana.**

### La situación

Termina el Foco. Me quedan dos frases para acabar un correo. Quiero hacer la pausa, pero dentro de unos minutos.

El menú de «A tu ritmo» ofrece hacer la pausa, seguir con el siguiente bloque, hidratarme o «Saltar esta pausa». Esta última acción cierra la ventana, pero la pausa sigue abierta hasta empezar el siguiente bloque. **No equivale todavía a marcarla como saltada.** [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/breakmenu/BreakMenu.ritmo.jsx)

### Lo que pensaría

> «Si pulso Saltar, ¿ya la he perdido? Si sigo con el bloque, ¿empiezo otros 25 minutos? Solo quiero quitar esto de en medio un momento.»

Aquí el comportamiento es más flexible que el texto: **PACE permite dejar la pausa pendiente, pero lo llama saltarla.**

### Qué cambiaría

Primero, sin añadir ninguna función:

- Cambiar «Saltar esta pausa» por **«Ahora no»**.
- Al cerrar, mantener una indicación clara: **«Tu pausa sigue disponible»**.
- Reservar «Saltar» para la acción que realmente la deja atrás.

Después probaría si hace falta «Recordármelo en 5 minutos». No lo añadiría automáticamente: implica otro aviso y podría terminar molestando.

**Prueba:** pedir a alguien «termina tu tarea y haz la pausa después». Ver si encuentra el camino sin creer que está rechazándola.

---

## 2. «Toco una pausa futura para verla… y me la cambias»

**Prioridad alta · Consecuencia inesperada de una acción.**

### La situación

Estoy mirando el plan de esta tarde. Veo una rutina cuyo nombre me interesa y la toco para averiguar qué contiene.

En la línea del día de escritorio, tocar una pausa futura **cambia su rutina mediante `ritmoOtra`**. Tocar la pausa actual, en cambio, la inicia. Las explicaciones de esas acciones están en el `title`; el nombre accesible del botón no incorpora explícitamente «cambiar». [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/ritmo/RitmoLinea.jsx)

### Lo que pensaría

> «¿Dónde ha ido la rutina que estaba mirando? Yo no quería sustituirla.»

No es un fallo del motor: es una diferencia entre **mi intención de consultar** y **la acción que la interfaz interpreta**.

### Qué cambiaría

Separaría dos acciones:

- Tocar la rutina: **ver qué incluye**.
- Acción explícita «Otra»: sustituirla.

Si se mantiene el cambio directo, al menos mostraría:

> «Rutina cambiada · Deshacer».

**Prueba:** pedir «averigua qué harás en la pausa de las 12». Si la persona cambia la propuesta sin querer, el problema queda demostrado.

---

## 3. «He trabajado de pie y he bebido agua. ¿Por qué PACE dice lo contrario?»

**Prioridad alta · Confianza en las recomendaciones.**

### La situación

Hago un Foco de 45 minutos de pie. También he bebido, pero no lo he registrado.

Fuera del plan de «A tu ritmo», el recomendador utiliza la duración configurada del Foco para justificar «Llevas 45 minutos sentado»; si el contador de agua está a cero y es mediodía o más tarde, puede mostrar «Aún no has bebido hoy». **Los datos consultados son duración y registros, no observaciones de postura o de consumo.** [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/breakmenu/BreakMenu.support.jsx) [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/i18n/strings/breakmenu.js)

### Lo que pensaría

> «La app está afirmando cosas de mí que no sabe.»

Este detalle puede debilitar incluso una recomendación razonable.

### Qué cambiaría

Distinguir lo conocido de lo supuesto:

| Ahora | Propuesta |
|---|---|
| «Llevas 45 minutos sentado» | **«Has terminado un Foco de 45 minutos»** |
| «Aún no has bebido hoy» | **«Hoy no has registrado agua»** |
| «Hoy aún no has movido el cuerpo» | **«¿Te apetece una pausa de movimiento?»** |

La recomendación puede seguir siendo la misma. **No necesita fingir que ha observado mi día para resultar útil.**

**Prueba:** usar la app sin registrar toda la actividad externa y comprobar que ningún mensaje contradice hechos que PACE desconoce.

---

## 4. «Dije que hoy no me ayudó, no que no quisiera verla más»

**Prioridad media-alta · La pregunta y su efecto no significan exactamente lo mismo.**

### La situación

Termino una rutina. Hoy estoy distraído y respondo «No» a «¿Te ayudó esta pausa?».

El recomendador de pausas por libre aparta las rutinas con algún «No» y ningún «Sí» o «Un poco». Ese veto no tiene caducidad en esta regla; si dejara vacío el conjunto disponible, se ignora. La rutina continúa en el catálogo. El feedback, al contestar, muestra únicamente «Gracias». [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/ui/SessionFeedback.jsx)

La lógica de veto está en `breakVetadas` y la excepción en `breakElige`, dentro del recomendador citado en el punto anterior.

### Lo que pensaría

> «Estaba valorando esta pausa de hoy. No sabía que estaba modificando futuras recomendaciones.»

También puede ocurrir lo contrario: que crea que «No» significa «no me la vuelvas a proponer» y luego reaparezca por la excepción.

### Qué cambiaría

No convertiría una respuesta puntual en una preferencia duradera sin explicarlo.

Separaría:

- **¿Te ayudó hoy?** → valoración de esa sesión.
- **No sugerir esta rutina** → preferencia explícita y reversible.

Si se quiere conservar el veto actual, comunicaría su efecto y ofrecería cómo revertirlo.

**Prueba:** antes de pulsar «No», preguntar al tester qué espera que pase mañana. Comparar esa expectativa con el comportamiento real.

---

## 5. «No he hecho la rutina, pero sí he hecho una pausa»

**Prioridad media-alta · El producto no debería confundir usar PACE con cuidarse.**

### La situación

Termina el Foco. En lugar de seguir una rutina, camino por casa, voy a por agua y vuelvo.

En el flujo revisado, la pausa del plan se marca hecha al terminar una sesión. La vista Hoy por libre recoge sesiones registradas de Respira, Mueve y Estira. **Esos registros no representan todas las pausas que puedo haber hecho fuera de PACE.** [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/state-ritmo.pausa.jsx) [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/stats/StatsHoy.jsx)

### Lo que pensaría

> «He hecho justo lo que necesitaba: alejarme de la pantalla. Pero para la app parece que no he hecho nada.»

No hace falta registrar cada paseo. Sí evitar que la interfaz me empuje a completar una rutina solo para que el día figure correctamente.

### Qué cambiaría

Probaría una acción discreta:

> **«Ya he hecho una pausa por mi cuenta».**

Con dos límites:

- No inventar minutos ni ejercicios.
- No mezclar ese registro con sesiones guiadas completadas.

Una solución aún más pequeña sería etiquetar claramente las estadísticas como **actividad registrada en PACE**.

**Prueba:** dar la tarea «haz una pausa sin seguir una rutina». Al volver, preguntar si la persona siente que puede continuar o que debe “cumplir” algo pendiente.

---

## 6. «No me digas cómo me siento al terminar»

**Prioridad media · Mejora editorial pequeña, pero importante para el tono.**

Los textos de cierre incluyen «Tu cuerpo ha encontrado su ritmo» y «El cuerpo vuelve a sentirse tuyo». Son afirmaciones predeterminadas, independientes de cómo haya vivido la persona la sesión. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/i18n/strings/sessions.js)

### Lo que pensaría

> «He terminado, pero sigo tenso. ¿Se supone que debería sentirme de otra manera?»

No eliminaría la calidez de PACE. Cambiaría **afirmaciones sobre mi estado** por **reconocimiento de lo que he hecho**:

- «Has dedicado un momento a respirar».
- «Pausa terminada. Continúa cuando quieras».
- «Un rato de movimiento entre tareas».

Después, que «¿Te ayudó?» me permita contar mi experiencia sin que la app la haya decidido antes.

**Prueba:** revisar todos los cierres preguntando: «¿Esta frase sigue siendo cierta aunque la persona no se encuentre mejor?».

---

## 7. «En el ordenador tengo una semana; en el móvil, otra»

**Prioridad alta para quien alterna dispositivos · Expectativas y continuidad.**

### La situación

Uso PACE en el portátil por la mañana y en Android por la tarde. Quiero ver el mismo historial.

Los textos de Ajustes explican que los datos viven en el navegador o en el móvil. Para trasladarlos ofrecen exportar e importar; la confirmación de importación advierte que **lo existente se sustituye por la copia**. No es una operación de combinar historiales. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/i18n/strings/settings.js)

### Lo que pensaría

> «No necesito necesariamente una cuenta, pero sí saber desde el principio que son dos historiales independientes.»

Si he usado ambos dispositivos, trasladar una copia no resuelve por sí solo mi necesidad de reunir lo hecho en los dos.

### Qué cambiaría

**Antes que desarrollar sincronización**, explicaría la situación donde importa:

> «Tu historial se guarda solo aquí. Puedes trasladarlo con una copia; los dispositivos no se sincronizan».

Y distinguiría dos necesidades:

- **Cambiar de dispositivo:** trasladar una copia.
- **Usar varios a la vez:** limitación actual que debe quedar clara.

Si más adelante se plantea sincronización, la validaría con usuarios. No asumiría que todos quieren una cuenta o almacenamiento remoto.

**Prueba:** alguien con actividad en dos dispositivos debe poder explicar qué conservará y qué reemplazará antes de importar.

---

## Lo que me está diciendo esta ronda

**PACE necesita reconocer tres cosas distintas:**

1. **Lo que me propone.**
2. **Lo que he registrado.**
3. **Lo que realmente he hecho, que la app no siempre conoce.**

Cuando esas tres cosas se mezclan aparecen los roces: «saltada» cuando solo cierro la ventana, «no has bebido» cuando no lo he registrado, o una valoración puntual convertida en preferencia.

### Qué haría primero

| Orden | Cambio | Esfuerzo relativo |
|---|---|---|
| 1 | «Ahora no» para cerrar dejando la pausa disponible | Pequeño |
| 2 | Sustituir afirmaciones no observadas por mensajes precisos | Pequeño |
| 3 | No cambiar una rutina futura al intentar consultarla | Medio |
| 4 | Aclarar qué significa responder «No» | Pequeño o medio, según la solución |
| 5 | Explicar la independencia entre dispositivos | Pequeño |
| 6 | Reconocer pausas por libre sin inventar actividad | Medio |

**Mi criterio como usuario simulado:** no quiero que PACE mida más cosas de mi vida. Quiero que sea precisa con lo que sabe, flexible con lo que necesito y fácil de retomar cuando no sigo el plan. Esa combinación puede hacerla más útil sin llenarla de funciones.
