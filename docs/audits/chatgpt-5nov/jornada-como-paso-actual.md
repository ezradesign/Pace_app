# La jornada como paso actual: propuesta de ChatGPT del 5 nov. 2026

Ez: «una observación del pomodoro que debemos valorar [...] quiero verla en un html antes de implementar nada». Es una propuesta sin
comprobar: la maqueta (`maqueta-jornada`) mira primero en el código lo que afirma. Nada se monta sin la letra de Ez.

**Sí: lo que estás detectando es una brecha de concepto, no solo de botones.** PACE debería sentirse como **una jornada que te acompaña**, y el temporizador debería ser la herramienta que ejecuta el paso actual. No como un Pomodoro al que, además, le has añadido un plan debajo.

He revisado los componentes actuales de la home, el temporizador y «A tu ritmo». Esto es una propuesta de interacción basada en el código; **no una prueba visual de la app ejecutándose**.

## 1. Por qué ahora puede resultar confuso

Hay tres decisiones que se presentan casi como si fueran independientes:

- Arriba, elegir **Foco / Pausa / Larga**.
- En el aro, elegir minutos y arrancar el temporizador.
- Debajo, preparar la jornada con «A tu ritmo».

La home monta primero `FocusTimer` y después `RitmoHome`: el temporizador tiene protagonismo antes de que la persona haya decidido si quiere una jornada guiada. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/main.jsx)

Además, **«Comienza» en la tarjeta móvil abre la configuración; no arranca el primer foco**. En escritorio, las losetas eligen una jornada. Son acciones relacionadas, pero no equivalentes, bajo una presentación distinta según el dispositivo. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/ritmo/RitmoTarjeta.jsx)

La conexión técnica sí existe: el plan ajusta la duración del aro, el aro puede mostrar el bloque correspondiente y su botón inicia ese bloque. **Pero el usuario tiene que deducir esa relación.** [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/ritmo/RitmoHome.jsx) [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/focus/FocusTimer.jsx)

Mi lectura como usuario sería:

> «¿Primero pulso Comienza abajo y después Empezar arriba? ¿Estoy preparando el día o ya lo he empezado? ¿El aro es parte de la jornada o funciona por separado?».

**No lo intentaría resolver con más explicaciones de bienvenida. Cambiaría la jerarquía de la pantalla.**

## 2. La regla central: plan, paso actual y un único botón principal

Mi propuesta:

> **El plan dice qué viene. El aro muestra lo que estás haciendo ahora. El botón inicia o controla ese paso.**

No habría un botón para «activar la jornada» y otro para arrancar el primer bloque. **Empezar la jornada significa empezar su primer foco.**

Sí separaría estas dos acciones, porque hacen cosas diferentes:

- **Preparar mi jornada:** elegir horario y ver la propuesta. No inicia ninguna cuenta.
- **Empezar jornada:** aceptar esa propuesta y arrancar el primer foco en el mismo gesto.

Después de ese primer arranque, el botón deja de hablar de «jornada» y pasa a hablar del paso actual.

## 3. Cómo lo haría, pantalla a pantalla

### A. Antes de preparar la jornada

Conservaría el aro, pero no dejaría que compitiesen dos invitaciones genéricas a empezar.

La entrada principal sería:

**Organiza tus pausas de hoy**  
*Dinos hasta cuándo trabajas. PACE alternará foco y pausas.*

**[Preparar mi jornada]**

Y una salida secundaria, clara:

**Usar solo el temporizador**

Si la persona ya tiene una semana habitual:

**Tu jornada de hoy**  
9:00–17:00 · Comida a las 14:00

**[Preparar mi jornada]** · Cambiar horario

Importante: mientras no haya comenzado, mostrar **«Jornada preparada»**, no «Jornada en marcha».

### B. Jornada preparada: el aro ya pertenece al plan

Tras elegir el horario, volvería a una única composición:

```text
TU JORNADA · HASTA LAS 17:00                 Cambiar

                 FOCO 1 DE 8

                    25:00

               [Empezar jornada]

          Después: Estira · 5 min

     Foco ─ Estira ─ Foco ─ Mueve ─ …
                         Ver jornada
```

Debajo del botón, durante los primeros usos:

> Empiezas con 25 minutos de foco. Al terminar, te propondremos una pausa.

**No pondría otro botón «Empezar» en la tarjeta inferior.** Esa tarjeta pasa a ser el mapa, no otro puesto de mando.

Si el horario empieza más tarde, distinguiría **«Empezar ahora»** de la hora prevista y mostraría cómo cambia la propuesta antes de iniciarla. No arrancaría silenciosamente a la hora programada.

### C. Foco en marcha

```text
                 FOCO 1 DE 8

                    18:42

                [Pausar foco]

          Después: Estira · 5 min
```

El mismo sitio, la misma relación y un cambio visible de estado:

- La jornada dice «En marcha».
- El primer tramo de la línea se marca como actual.
- El aro representa **solo el avance de ese foco**, no el avance del día.

**El aro mide el paso; la línea mide la jornada.** Evitaría mezclar ambas magnitudes.

### D. Al terminar el foco: el botón principal debe ofrecer la pausa

Este es uno de los cambios más importantes.

Actualmente, durante la pausa de «A tu ritmo», el botón principal del temporizador permite **empezar ya el siguiente bloque de foco**. La pausa guiada se ofrece por otra superficie. Eso puede hacer que saltarse la pausa sea la acción más evidente al volver a la home. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/focus/FocusTimer.jsx)

Yo mostraría:

```text
                 TOCA UNA PAUSA

                   Estira
                    5 min

               [Empezar pausa]

        Otra pausa · Ahora no
```

**«Ahora no» debe seguir siendo fácil**, pero no competir visualmente con la recomendación principal.

Y distinguiría dos cosas:

- **Tiempo disponible para descansar.**
- **Rutina que realmente has iniciado.**

Que transcurran cinco minutos no debería hacer parecer que has realizado cinco minutos de Estira. Durante una rutina, su pantalla y su temporizador mandan; no pondría otro reloj compitiendo por tu atención.

### E. Después de la pausa

```text
                 PAUSA TERMINADA

                 FOCO 2 DE 8
                    25:00

             [Empezar siguiente foco]

                   Terminar por hoy
```

**No arrancaría automáticamente el siguiente foco por defecto.** La persona puede necesitar volver al documento, atender una llamada o simplemente no estar preparada.

La continuidad viene de que el siguiente paso esté listo, no de quitarle el control.

## 4. Qué simplificaría de los controles actuales

| Elemento | En jornada guiada | En temporizador libre |
|---|---|---|
| **Foco / Pausa / Larga** | Sustituir por el estado actual; los cambios excepcionales van en «Cambiar este paso». | Mantener como controles manuales. |
| **Selector de minutos** | Mostrar «Focos de 25 min · Cambiar», como acción secundaria. | Mantenerlo visible y directo. |
| **Botón del aro** | Controla el paso actual de la jornada. | Controla el temporizador elegido. |
| **Panel inferior** | Mapa del día, siguiente pausa y ajustes. Sin otro arranque principal. | Invitación secundaria a preparar una jornada. |
| **Reiniciar bloque** | Explicar que descarta el progreso de ese foco; no confundirlo con reiniciar el día. | Igual. |

Los controles superiores actuales cambian directamente `focusMode`; no son navegación entre secciones. **Dentro de una jornada guiada, presentarlos como pestañas puede invitar a intervenir manualmente en algo que supuestamente te está guiando.** [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/main/TopBar.jsx)

No quitaría posibilidades: **las haría secundarias cuando el usuario ha pedido que PACE le guíe**.

## 5. Los textos que usaría

Evitaría «Comienza», «Continuar» o «Seguir» sin objeto cuando exista una alternativa más concreta.

| Situación | Botón principal |
|---|---|
| Todavía no hay propuesta | **Preparar mi jornada** |
| Propuesta lista, nada iniciado | **Empezar jornada** |
| Foco corriendo | **Pausar foco** |
| Foco detenido por el usuario | **Reanudar foco** |
| Toca una rutina | **Empezar pausa** |
| Rutina terminada | **Empezar siguiente foco** |
| Jornada terminada | Sin botón que parezca iniciar otro bloque del plan |

También reservaría **«pausa» para el descanso** y **«foco pausado» para un temporizador detenido**. Son situaciones distintas y conviene expresarlas como tales.

## 6. Cómo encaja el calendario

**El calendario organiza la propuesta; no demuestra que hayas empezado a trabajar.**

Por eso:

- Conectar el calendario no inicia la jornada.
- Publicar eventos no inicia el temporizador.
- Llegar a la hora de un evento no acredita un foco.
- **«Empezar jornada» sigue siendo el gesto explícito de inicio.**

En pantalla:

> **Tu jornada tiene en cuenta tus reuniones.**  
> Después de este foco tendrás 5 minutos para Estira.

Y si entra una reunión nueva:

> Tu próxima pausa coincide con una reunión. Hemos ajustado la propuesta.

Esto último solo debe afirmarse cuando el ajuste se haya completado realmente. La conexión del calendario puede dar valor Premium, pero **la comprensión de qué está ocurriendo ahora tiene que ser igual de buena sin calendario**.

## 7. Qué pediría a Claude primero

**No rehacería toda la home todavía. Haría una maqueta de estos cinco estados con la misma estructura:**

1. Sin jornada preparada.
2. Jornada preparada, antes de empezar.
3. Primer foco en marcha.
4. Foco terminado, pausa pendiente.
5. Pausa terminada, siguiente foco preparado.

Después, una prueba sin explicar nada:

> «Trabajas hasta las 13:00 y quieres que PACE te organice las pausas. Hazlo y empieza a trabajar».

Comprobaría si la persona puede responder:

- ¿Ya está corriendo algo?
- ¿Qué representa el aro?
- ¿Qué sucederá cuando llegue a cero?
- ¿Qué botón tienes que pulsar después?
- ¿Elegir el horario ha iniciado la jornada?

Si necesita una explicación verbal para contestar, la pantalla aún no está resuelta.

**Mi recomendación final: conservar el aro y el motor que ya tienes, pero convertirlos explícitamente en el “paso actual” de «A tu ritmo». Una jornada, un mando principal y un siguiente paso visible.** Esa integración aportaría más claridad que añadir otro tutorial o cambiar únicamente el nombre de un botón.
