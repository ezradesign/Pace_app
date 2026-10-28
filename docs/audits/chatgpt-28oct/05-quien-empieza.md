# Revisión 5 de ChatGPT (28 oct. 2026): Cómo lo vive alguien que empieza

> Texto tal cual lo pegó Ez. ChatGPT leyó `main` en `95bfcd6`, sin ejecutar la app. Lo que comprobó la
> coordinadora contra el código de la 0.185.0, con sus códigos (P1-P8), está en `LEEME.md` de esta
> carpeta y en el relevo (`docs/traspaso/relevo-coordinadora-22oct.md`, bloque «28 oct., ~20:10»).

---

**Sí: en el recorrido normal sabría empezar, pero no siempre sabría adaptar lo que PACE me pide.** Y ahí veo la mayor oportunidad: una persona real no necesita únicamente instrucciones claras; necesita poder decir «esto no me encaja ahora» sin tener que aprender cómo funciona la app.

He reconstruido otro recorrido con el código y los textos actuales. **Es una simulación razonada, no una prueba con el móvil en la mano ni una experiencia física real.** `main` sigue en `95bfcd64`. No repito los fallos de la ronda anterior. [Fuente](https://api.github.com/repos/ezradesign/Pace_app/commits/main)

Voy a usar este caso: **trabajo sentado, no entreno habitualmente, tengo reuniones y quiero moverme sin convertirlo en otra tarea.**

## 1. Acabo de llegar: «Antes de organizar mi semana, déjame entender si esto me sirve»

La bienvenida lleva a configurar la semana antes de llegar a la home. Se puede continuar sin fijarla mediante «Cada semana es distinta», pero esa es la frase utilizada para saltarse la configuración, no un «Ahora no». Los días se cambian tocándolos y recorriendo los tipos jornada, media y libre. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/onboarding/Onboarding.jsx) [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/ritmo/RitmoSemanaTipo.jsx)

### Lo que pensaría

> «Todavía no he hecho una pausa. No sé cuánto me va a interrumpir esto y ya tengo que decidir mi semana.»

Entendería el editor después de tocar un par de días y mirar la leyenda. **No me parece inusable**, pero sí pide compromiso antes de demostrar utilidad.

Además, podría tener una semana perfectamente regular y querer probar primero. «Cada semana es distinta» no describe mi situación, aunque sea la salida que necesito.

### Qué mejoraría

Sin rehacer la bienvenida:

- Mantener «Guardar mi semana».
- Cambiar la salida por **«Ahora no, quiero probar primero»**.
- Explicar: «Puedes preparar tu semana después, en Ajustes».

No obligaría a hacer una pausa de demostración. Solo facilitaría llegar a ella.

**Prioridad: media. Mejora de comprensión y primera experiencia, no bug.**

---

## 2. Son las 9:10: «¿La hora que elijo incluye las pausas o es una hora trabajando?»

La pregunta es «¿Cuánto trabajas hoy?», con opciones «Una hora», «Dos horas», «Media jornada» y «Jornada entera». Las dos primeras muestran una hora final; las otras, un horario. El plan combina Foco y pausas. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/i18n/strings/ritmo.js)

### Lo que pensaría

> «Tengo una hora hasta la reunión. ¿Elijo Una hora o eso acabará siendo una hora de trabajo más las pausas?»

La hora final ayuda mucho: **esto ya está bien resuelto en parte**. Pero «cuánto trabajas» y «cuánto dura el rato completo» no son exactamente la misma pregunta.

También necesito entender una sola vez si el horario es una previsión adaptable o una agenda que tengo que cumplir.

### Qué mejoraría

Una frase breve junto a la elección:

> **«El tiempo incluye las pausas. Si te retrasas, el plan se ajusta al continuar.»**

La segunda parte debe describir exactamente el comportamiento que se decida mantener. No prometería una adaptación más amplia que la real.

**No añadiría otro tutorial.** Pondría la respuesta donde nace la duda.

**Prioridad: media. Hipótesis de confusión que conviene comprobar con personas nuevas.**

---

## 3. Llega la primera pausa: «Sin material… pero esa mesa no me sirve»

El plan presenta como contexto «Junto a la mesa» y «Sin material». Sin embargo, su selección permite rutinas que requieren mesa estable o pared: el código las considera compatibles con ese contexto. Por ejemplo, «Empuje sencillo» utiliza mesa fija o pared, y «Piernas sin pasos» necesita pared. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/state-ritmo.jsx)

### Lo que pensaría

> «Tengo una mesa, sí. Pero es regulable, tiene cosas encima y no quiero apoyarme para hacer flexiones. Y la pared está detrás de otro compañero.»

**No es lo mismo no necesitar accesorios que poder hacerlo donde estoy.**

El problema no es conservar esas rutinas: tienen sentido. Es asumir que una pared utilizable o una superficie donde cargar peso están siempre disponibles.

### Qué mejoraría

Antes de preparar propuestas, una elección contextual sencilla:

- **Solo mi espacio, sin apoyos.**
- Puedo usar pared o mesa estable.

No necesariamente en la bienvenida. Puede aparecer al cambiar la primera propuesta y recordarse.

Como mínimo, cambiaría el mensaje genérico por uno más preciso:

> «Sin accesorios; algunas pausas usan pared o mesa estable».

**Prioridad: alta para la utilidad en oficinas. Es una limitación de contexto, no un fallo del temporizador.**

---

## 4. Abro una rutina: «Puedo leer qué voy a hacer, pero no aprenderlo antes de que empiece»

La vista previa es un buen avance: enseña requisitos, posición y lista de ejercicios. **Eso sí me ayudaría a decidir.** Pero los ejercicios de esa lista no son controles para abrir sus instrucciones: muestran dibujo, nombre y, cuando corresponde, series u opcionalidad. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/ui/RoutinePreview.jsx)

### Lo que pensaría

> «Sé qué es una sentadilla, pero no sé qué quieren decir con “bisagra de cadera”. Quiero mirar cómo se hace antes de darle a Empezar.»

Actualmente tendría que entrar en la sesión para ver la explicación correspondiente. Eso convierte una duda de aprendizaje en una situación con reloj.

### Qué mejoraría

Tocar un ejercicio en la vista previa debería desplegar:

1. Cómo colocarte.
2. Qué movimiento hacer.
3. Su cuidado principal.

**Sin cuenta atrás y sin iniciar nada.**

No hace falta producir vídeos de todo el catálogo para resolver esta necesidad. Primero aprovecharía las instrucciones y dibujos que ya existen.

**Prioridad: alta para principiantes.**

---

## 5. Estoy haciendo la pausa: «¿La flecha significa que lo he hecho o que me lo salto?»

El mando mantiene tres botones: anterior, pausa y siguiente. La flecha derecha cambia de función según el momento: empezar ya, terminar antes, pasar, terminar o saltar. Su nombre accesible y su `title` cambian, pero el texto de la acción está oculto visualmente. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/move/MoveSessionV1.mando.jsx)

### Lo que pensaría

> «No llego a todas las repeticiones. Si pulso la flecha, ¿digo que las he hecho, acabo esta serie o salgo de la rutina?»

**Este es uno de los puntos más importantes de toda esta revisión.**

Una flecha es suficiente para navegar por páginas. Es menos clara cuando puede confirmar trabajo o recortarlo. En móvil no puedo contar con descubrir un `title` pasando el ratón.

### Qué mejoraría

Conservaría el mando y añadiría bajo la flecha una etiqueta corta que cambie:

- «Empezar».
- «Terminar serie».
- «Siguiente lado».
- «Saltar descanso».
- «Terminar rutina».

No hace falta mostrar toda la explicación todo el tiempo. **Sí hace falta que la consecuencia de pulsar sea visible.**

**Prioridad: alta. Problema de comprensión deducible de la interfaz definida en código; gravedad por validar con uso real.**

---

## 6. Soy principiante: «Me dices que una serie basta, pero la app me pone la segunda»

En «Levántate y sube», el cuidado de la primera serie dice: **«La primera vez, una serie basta»**. La rutina, sin embargo, contiene dos series de sentarse y levantarse y dos de talones. La sesión sigue el recorrido programado; no interpreta esa recomendación como una dosis alternativa. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/move/move.data.js)

### Lo que pensaría

> «Vale, he hecho una. Ahora viene otra. ¿Tengo que saltarla? ¿Estaré dejando la rutina a medias?»

El texto intenta tranquilizar, pero **la interfaz no materializa el permiso que acaba de darme**.

No recomendaría resolverlo únicamente explicando mejor cómo saltar. La adaptación debería ser una acción normal, no una maniobra.

### Qué mejoraría

En las rutinas de entrada:

> **«Para empezar: una serie de cada ejercicio»**  
> «Hoy quiero hacer las dos».

O una acción al acabar la primera:

> «Con una basta» / «Hacer otra».

Debe quedar claro qué registra cada opción. No se deberían presentar ejercicios no realizados como hechos.

**Prioridad: alta. Incoherencia entre la recomendación escrita y el recorrido.**

---

## 7. Intento seguir el ritmo: «La app cuenta repeticiones, pero no me enseña cuándo bajar y cuándo subir»

El motor suma las partes del tempo para obtener la duración de cada repetición. La presentación muestra el número y el progreso, pero no descompone visualmente el movimiento en «baja», «mantén» y «sube». Esto importa especialmente en tempos desiguales, como bajar en cinco segundos y subir en uno. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/move/MoveSessionV1.support.jsx) [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/move/MoveSessionV1.cuerpo.jsx)

### Lo que pensaría

> «La cuenta va cambiando, pero no sé si tengo que empezar a bajar cuando cambia el número o haber terminado ya.»

Para alguien con experiencia, el texto puede bastar. **Para alguien que está aprendiendo, contar no equivale a guiar el movimiento.**

### Qué mejoraría

Elegiría entre dos enfoques claros:

- **Guía real:** pequeñas indicaciones «Baja · Sube» sincronizadas con el tempo.
- **Ritmo orientativo:** explicar «La cuenta es una guía; muévete con control», evitando transmitir una precisión que la persona no puede seguir fácilmente.

No llenaría la pantalla de cifras adicionales.

**Prioridad: media-alta. Mejora de seguimiento; requiere una prueba haciendo los ejercicios.**

---

## 8. Me llaman: «He pausado, pero la pantalla sigue ordenándome mantener»

En Mueve y Estira, pausar detiene los relojes y transforma el botón central en reanudar. Sin embargo, el cuerpo de la sesión sigue mostrando la instrucción del ejercicio: no sustituye ese mensaje por un estado explícito de pausa. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/95bfcd6402ed73cacfb15d3bf6306915644f061d/app/move/MoveSessionV1.jsx)

### Lo que pensaría

> «He tocado pausa. ¿Puedo soltar la postura? ¿Al volver sigo desde aquí o empieza otra vez?»

No todo el mundo interpretará inmediatamente el pequeño cambio de icono, sobre todo si vuelve después de atender una llamada.

### Qué mejoraría

Un estado inequívoco:

> **«Sesión en pausa»**  
> «Descansa. Continuarás desde este punto».

Para un ejercicio físico, añadiría una forma segura de recolocarse al reanudar, en lugar de exigir continuar instantáneamente una postura que ya se ha deshecho. La duración y el comportamiento de esa recolocación necesitan una decisión de producto.

**Prioridad: alta para claridad durante interrupciones.**

---

# ¿Realmente me ayudaría PACE?

**Como propuesta, sí: veo utilidad en que una sola app me diga cuándo parar y me ponga una pausa concreta delante.** No puedo afirmar que una persona vaya a sentirse mejor sin probarlo con usuarios, pero sí valorar dónde se ahorra esfuerzo y dónde se añade.

| Momento | Mi valoración como usuario simulado |
|---|---|
| Quiero empezar a trabajar | Lo conseguiría; simplificaría las decisiones iniciales. |
| No quiero elegir entre muchas rutinas | El plan tiene un valor claro: decide por mí. |
| Quiero saber si puedo hacer una rutina aquí | Los requisitos ayudan, pero el contexto debe ajustarse mejor a mi espacio real. |
| No conozco un ejercicio | Necesitaría poder aprenderlo antes de que arranque el reloj. |
| El ejercicio me cuesta | Hoy tendría que deducir cómo adaptar la sesión. |
| Me interrumpen | Necesitaría una pausa más explícita y una vuelta bien guiada. |
| Ya conozco las rutinas | La automatización resulta más aprovechable; me exige menos lectura. |

## Mi diagnóstico más importante

**PACE parece más fácil de seguir para quien ya conoce PACE que para quien está aprendiendo a moverse con ella.**

No intentaría arreglarlo añadiendo más pantallas explicativas. Haría tres cosas:

1. **Dejar mirar antes de empezar.**
2. **Mostrar qué hace cada acción.**
3. **Convertir “hacer menos” o “hacer otra cosa” en opciones normales.**

Eso conserva la calma del producto sin dejar a la persona adivinando.

Para mí, superar esas cinco situaciones aportaría más ahora que ampliar el catálogo. **La experiencia pulida no es que todo avance solo: es que la persona entienda qué está pasando y pueda cambiarlo sin miedo.**
