# Revisión de ChatGPT del 5 nov. 2026: cuando una sesión coincide con otra cosa (44977148)

Ez: «revisa si hay algo de interés». Comprobado leyendo el código, sin reproducirlo. Se monta solo con el sí de Ez.

| # | Punto | Veredicto |
|---|---|---|
| 1 | El fin del Foco abre la pausa sobre una sesión | **Cierto que se abre:** `usePausaALaVista` solo mira que la pestaña esté visible y `main.jsx` abre `BreakMenu` sin pausar nada. Falta ver si tapa la sesión: el modal usa `capa`, no el 100 fijo que dice ChatGPT. Se reproduce antes de arreglar |
| 2 | Un Escape o Atrás cierra el aviso y la sesión | **Cierto.** `MoveSessionV1.parts.jsx:124` y `BreatheSession.jsx:169` salen sin mirar `__paceDialogoAtendido`, y el Atrás de Android es un Escape (`android.js:96`). Lo que más puede notar un tester |
| 3 | Mantener Espacio alterna la pausa | **Cierto.** Ninguno de los dos mira `e.repeat` |
| 4 | Dos pestañas pisan `pace.cuerpo.v1` | **Cierto** (`olvidarCuerpoGuardada` borra sin mirar de quién es), pero entra en el riesgo que Ez aceptó el 22 oct. con dos pestañas. Sin prisa |

## La revisión, entera

He seguido por **qué ocurre cuando una sesión coincide con otra cosa de la app**: termina el Foco, aparece un aviso, pulsas Atrás o tienes dos pestañas abiertas.

**Hay cuatro puntos que llevaría a pruebas antes de añadir más funciones.** Revisión solo de código, fijada al commit `44977148` de `main`; no he ejecutado estos casos en Android ni en el navegador. [Fuente](https://api.github.com/repos/ezradesign/Pace_app/commits/main)

## 1. El fin del Foco puede tapar una sesión que sigue corriendo

**Prioridad: alta · Comportamiento deducido del código; falta comprobarlo visualmente.**

**Dónde:**  
- `app/focus/FocusTimer.pestanas.jsx` → `usePausaALaVista`.
- `app/main.jsx` → apertura de `BreakMenu`.
- `app/ui/Primitives.jsx` → capas del modal.

### Caso concreto

1. Dejo un Foco en marcha.
2. Antes de que termine, abro una sesión de Respira o Mueve.
3. El Foco llega a cero mientras estoy haciendo el ejercicio.

La apertura de la pausa comprueba que la pestaña esté visible, **pero no que haya una sesión en curso**. `main.jsx` abre el menú sin pausar la sesión. Además, el modal tiene `zIndex: 100` y las sesiones usan `90`: el menú puede quedar por encima de la práctica. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/449771481975b4c1aedc782bd41eaa94caf1ffc0/app/focus/FocusTimer.pestanas.jsx) [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/449771481975b4c1aedc782bd41eaa94caf1ffc0/app/main.jsx) [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/449771481975b4c1aedc782bd41eaa94caf1ffc0/app/ui/Primitives.jsx)

**Qué ve la persona:** estaba siguiendo un ejercicio y aparece «elige una pausa» encima. Mientras decide, la práctica puede continuar detrás: deja de ver la postura o la cuenta, pero el ejercicio no se detiene.

### Qué haría

**No interrumpir una pausa activa para proponer otra.** Conservar el aviso pendiente y resolverlo cuando termine o salga de la sesión. Al volver, ofrecer una acción coherente con lo que acaba de hacer, no necesariamente el menú original.

### Prueba

Arrancar un Foco y entrar en una rutina cuando falten diez segundos. Al llegar a cero:

- La sesión no debe quedar tapada.
- No debe avanzar un ejercicio oculto por un modal.
- El aviso pendiente no debe perderse ni aparecer dos veces.

---

## 2. Un solo Escape o Atrás puede cerrar el aviso y también la sesión de debajo

**Prioridad: alta · Fallo de coordinación de eventos deducido del código.**

**Dónde:**  
- `app/ui/Dialogo.jsx` → `usePaceDialogo`.
- `app/move/MoveSessionV1.parts.jsx` → `useV1Teclas`.
- `app/breathe/BreatheSession.jsx` → listener de teclado.

### Caso concreto

Con una sesión abierta y un modal encima —por ejemplo, el menú del caso anterior—, pulso Escape para quitar únicamente el aviso.

El gestor de diálogos marca el evento como atendido con `__paceDialogoAtendido`. Sin embargo, los listeners de las sesiones **no comprueban esa marca ni si son la capa superior**: al recibir Escape llaman a `onExit('exit')`. Por tanto, la protección entre modales no cubre a los runners de sesión. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/449771481975b4c1aedc782bd41eaa94caf1ffc0/app/ui/Dialogo.jsx) [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/449771481975b4c1aedc782bd41eaa94caf1ffc0/app/move/MoveSessionV1.parts.jsx) [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/449771481975b4c1aedc782bd41eaa94caf1ffc0/app/breathe/BreatheSession.jsx)

En Android, Atrás se convierte precisamente en un evento Escape que se propaga: también hay que probar ese recorrido. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/449771481975b4c1aedc782bd41eaa94caf1ffc0/app/ui/android.js)

**Qué siente la persona:** «Solo quería quitar el aviso. ¿Por qué me has sacado del ejercicio?».

### Qué haría

Una única regla para todas las superficies:

> **Solo la capa superior puede responder a Escape o Atrás.**

No basta con añadir `preventDefault` en un componente si otro listener lo ignora.

### Prueba

Sesión abierta → modal encima → un Escape:

1. Se cierra solo el modal.
2. La sesión permanece.
3. Un segundo Escape aplica la salida prevista de la sesión.

Repetir con el botón Atrás de Android.

---

## 3. Mantener pulsado Espacio puede pausar y reanudar repetidamente

**Prioridad: media · Se deduce del manejo de teclado.**

**Dónde:** `useV1Teclas` en Mueve/Estira y listener de teclado de `BreatheSession`.

### Caso concreto

Estoy usando el teclado y mantengo la barra espaciadora pulsada un momento, en vez de darle un toque breve.

Los dos manejadores responden a cada `keydown` sin descartar `e.repeat`. En Respira alternan `paused`; en Mueve/Estira pueden alternar entre iniciar y cancelar la cuenta de reanudación.

**Qué ve la persona:** el estado final depende de cuántas repeticiones del teclado hayan llegado. En Mueve puede empezar el «3, 2, 1» y cancelarse mientras sigue manteniendo la misma tecla.

Esto es independiente de la mejora de «Auto» de la tanda anterior: afecta a la acción básica de pausar.

### Qué haría

Para una acción de alternancia, **una pulsación física debe producir un solo cambio**. Ignorar eventos repetidos y aplicar los mismos guardas de modificadores y composición que ya utilizan otros atajos de la app.

### Prueba

Mantener Espacio durante dos segundos, con el foco en el contenedor de sesión:

- En marcha: queda pausada una vez.
- En pausa: inicia una sola reanudación.
- No alterna varias veces ni depende de la velocidad de repetición del sistema.

---

## 4. Dos sesiones de cuerpo en distintas pestañas pueden sobrescribir lo pendiente de la otra

**Prioridad: alta para la web · Fallo de propiedad del guardado deducido del código.**

**Dónde:**  
- `app/move/MoveSessionV1.reanudar.jsx` → `useCuerpoPersistencia`, `olvidarCuerpoGuardada`.
- `app/ui/SessionClock.jsx` → `tomarSesionViva`, `useSesionViva`.

### Caso concreto

1. Abro Mueve en la pestaña A.
2. En otra pestaña inicio una rutina distinta de Estira.
3. Pauso la de Estira para dejarla pendiente.
4. Termino la de Mueve en A.

Las sesiones comparten `pace.cuerpo.v1`. La persistencia escribe sin comprobar quién es la dueña del registro y, al terminar una rutina, lo borra sin verificar que corresponda a esa sesión. El latido evita apropiarse del latido de otra pestaña, **pero no impide que el segundo runner siga ni que escriba en la misma clave**. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/449771481975b4c1aedc782bd41eaa94caf1ffc0/app/move/MoveSessionV1.reanudar.jsx) [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/449771481975b4c1aedc782bd41eaa94caf1ffc0/app/ui/SessionClock.jsx)

**Qué puede observar la persona:** termina una rutina en una pestaña y desaparece el registro pendiente de otra. La pestaña que conserva la sesión aún puede volver a escribirlo, pero mientras tanto el guardado deja de representar de forma fiable lo que estaba haciendo.

### Qué haría

Elegir explícitamente una política:

- **Una sesión de cuerpo a la vez:** la segunda pestaña informa y no arranca otro runner.
- **Varias sesiones independientes:** registros separados por identificador.

En ambos casos, **terminar una sesión solo puede borrar su propio registro**.

### Prueba

Dos pestañas, dos rutinas distintas. Guardar la B, terminar la A y comprobar inmediatamente el almacenamiento: B debe seguir recuperable, o su inicio debe haberse bloqueado con una explicación clara.

---

## Mi prioridad para esta tanda

| Orden | Qué arreglar | Por qué |
|---|---|---|
| 1 | Avisos que se superponen a una sesión | Interrumpen la guía mientras el ejercicio puede seguir. |
| 2 | Escape/Atrás que alcanza varias capas | Una acción de cerrar hace más de lo esperado. |
| 3 | Propiedad del guardado entre pestañas | Puede desaparecer una práctica pendiente ajena. |
| 4 | Repetición de Espacio | Hace impredecible una acción tan básica como pausar. |

**La regla de producto que aplicaría aquí es sencilla: mientras estoy haciendo una pausa, esa práctica tiene prioridad.** Los avisos esperan, las teclas actúan sobre lo que veo y ninguna otra ventana modifica silenciosamente lo que podré continuar después.
