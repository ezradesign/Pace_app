# PACE — Contexto para el afinado del runner de Mueve/Estira y Welcome

> **Entregado por el responsable del producto** (2026-07-17, tras el cierre de
> s111/v0.55.0). Gobierna la sesión **B2.2a.5** (auditoría y afinado UX del
> runner) y **pausa temporalmente B2.2b**. Nota de repo: «Welcome» refiere hoy
> al onboarding de s106 (`app/onboarding/`); el WelcomeModule original fue
> retirado en s106.

### 1. Propósito del documento

Este documento aporta el contexto de producto necesario para evaluar el runner nuevo de Mueve y Estira y la nueva pantalla Welcome.

No constituye una orden de implementación. Todas las propuestas deben:

1. Contrastarse con el código y el runtime actuales.
2. Evaluarse desde producto, UX, accesibilidad y arquitectura.
3. Clasificarse como:
   - mantener;
   - mejorar;
   - pilotar;
   - migrar;
   - debatir;
   - posponer;
   - descartar.
4. Presentarse al responsable del producto antes de modificar código.
5. Implementarse mediante cortes pequeños, reversibles y verificables.

La prioridad no es continuar acumulando campos y funcionalidades. La prioridad es demostrar que una práctica de Mueve y una de Estira resultan:

- claras;
- sencillas;
- útiles;
- cuidadas;
- visualmente comprensibles;
- fáciles de completar;
- coherentes con el tono humano de PACE.

---

## 2. Estado conocido

La sesión anterior, `s111 / v0.55.0`, cerró una parte del método del runner v1:

- El placement gate pasó a una cuenta atrás que fluye automáticamente.
- Su aparición depende del `mode`.
- Se eliminó el tap y la posible doble cuenta atrás.
- Los pasos por repeticiones utilizan “objetivo suave + Terminé siempre”.
- `step.setup` quedó disponible, todavía sin utilizar, para colocaciones largas.
- Se modificaron principalmente:
  - `MoveSessionV1.jsx`;
  - `strings/sessions.js`.
- El commit puede estar pendiente: debe verificarse Git antes de cualquier trabajo.

Esta evolución es técnicamente positiva:

- diferencia repeticiones y tiempo;
- reduce la presión;
- mantiene una salida manual;
- intenta evitar interacciones redundantes;
- conserva fallback para contenido legacy.

Sin embargo, todavía no está demostrado que el runner sea una experiencia valiosa y comprensible para el usuario.

---

## 3. Diagnóstico de producto

El runner antiguo podía resumirse como:

```text
Glifo
+ instrucción
+ cuenta atrás
```

El runner nuevo parece aproximarse a:

```text
Colocación automática
+ modo del paso
+ instrucción
+ tiempo o repeticiones
+ Terminé
```

Esto mejora la mecánica, pero puede seguir estando organizado alrededor del contrato técnico y no alrededor de las necesidades del usuario.

El usuario necesita entender:

```text
Qué voy a hacer
→ Cómo me coloco
→ Qué movimiento hago
→ Cuánto hago
→ Qué debo controlar
→ Qué debería sentir
→ Cómo puedo adaptarlo
→ Qué sucede después
```

No hay que mostrar toda esta información simultáneamente. El runner debe aplicar una jerarquía clara y presentar únicamente lo necesario en cada estado.

---

## 4. Principio rector

PACE no debe tratar una actividad corporal como una secuencia genérica de textos y temporizadores.

La regla objetivo es:

> Una actividad PACE acompaña al usuario desde la preparación hasta el regreso, adaptando la ejecución y comunicando claramente postura, movimiento, cantidad, sensación y seguridad.

El runner debe sentirse como una guía serena, no como:

- una ficha técnica;
- un reproductor de diapositivas;
- un cronómetro de gimnasio;
- una lista de instrucciones;
- una competición;
- un formulario.

---

## 5. Qué debe resolver el runner en tres segundos

En cada paso, el usuario debería identificar rápidamente:

1. Qué movimiento está haciendo.
2. Cuál es la acción principal.
3. Cuántas repeticiones o segundos corresponden.
4. Qué control es el más importante.
5. Qué acción puede realizar en la interfaz.

Si para comprenderlo debe leer varios párrafos, chips o paneles, la jerarquía no está resuelta.

---

## 6. Estados del runner

El runner no debe tratar todos los momentos como si fueran el mismo tipo de pantalla.

Debe distinguir conceptualmente:

```text
Preview
Setup
Execution
Side change
Transition
Rest
Completion
Feedback
```

No todos los pasos necesitan todos los estados.

### Preview

Antes de la rutina:

- beneficio;
- duración real o rango;
- posición;
- material;
- intensidad;
- número de movimientos;
- necesidad de suelo;
- alternativa relevante.

Ejemplo:

```text
Flexiones sobre escritorio
Activa pecho y brazos con una superficie elevada.
2–3 min · De pie · Activo
Necesitas una mesa estable
[Empezar]
```

### Setup

Debe ayudar a colocarse, no medir el ejercicio.

### Execution

Debe priorizar:

- visual;
- acción;
- cantidad;
- corrección principal;
- control primario.

### Side change

Debe ser explícito. No puede esconderse dentro de una cuenta atrás genérica.

### Transition

Debe dar tiempo real para cambiar de postura, levantarse o ir al suelo.

### Rest

Debe diferenciarse de una transición.

### Completion

Debe cerrar la práctica, no terminar abruptamente al llegar a cero.

### Feedback

Debe ser breve, opcional y no bloquear la salida.

---

## 7. Revisión del placement gate automático

La cuenta atrás automática puede ser correcta para colocaciones sencillas:

- permanecer de pie;
- soltar los brazos;
- apoyar las manos;
- colocar los pies;
- sentarse correctamente.

Puede resultar incorrecta para:

- ir al suelo;
- buscar una pared;
- colocar una esterilla;
- ajustar una silla;
- adoptar media rodilla;
- cambiar equipamiento;
- comprender una postura nueva.

El problema no se resuelve necesariamente aumentando los segundos de `step.setup`. Una cuenta atrás más larga sigue avanzando sin saber si el usuario está preparado.

### Modelo recomendado para evaluar

```js
setup: {
  mode: "none" | "auto" | "ready",
  estimatedSeconds
}
```

#### `none`

No necesita preparación separada.

#### `auto`

Preparación sencilla que puede avanzar automáticamente.

#### `ready`

Preparación compleja. El usuario pulsa:

```text
[Estoy listo]
```

La actividad no empieza hasta entonces.

Esto no debe producir una segunda cuenta atrás redundante. El botón confirma la colocación y pasa directamente a la ejecución.

---

## 8. Ejercicios por repeticiones

La decisión “objetivo suave + Terminé siempre” debe conservarse salvo que el runtime demuestre un problema importante.

Ejemplo:

```text
Flexiones sobre escritorio
6–8 repeticiones
Baja con control y vuelve sin impulso.
[Terminé]
```

Principios:

- No existe cuenta atrás competitiva.
- El botón “Terminé” está siempre disponible.
- El objetivo es orientativo.
- El usuario puede hacer menos.
- No es obligatorio contar cada repetición en la interfaz.
- No se debe acelerar para vencer un temporizador.
- El tempo puede comunicarse mediante texto o movimiento visual suave.

Copy posible:

```text
Objetivo suave: 6–8
Haz menos si hoy lo necesitas.
```

No usar:

- “Completa 8”.
- “No te rindas”.
- “Al fallo”.
- “Haz todas las que puedas”.
- “Quedan X repeticiones”, salvo que exista un contador voluntario y probado.

---

## 9. Tipos de ejecución

El modelo debe distinguir el significado físico de la actividad.

Taxonomía inicial:

```text
dynamicStrength
dynamicMobility
staticStretch
isometricHold
posturalControl
balance
flow
```

Modos de ejecución razonables:

```text
repetitions
timedHold
guidedTempo
cycles
manual
```

Estados auxiliares:

```text
setup
transition
rest
sideChange
```

No crear un modo distinto para cada caso específico. Tampoco reducirlo todo a `timed/reps` si eso impide representar retenciones, lados y ciclos correctamente.

Ejemplos:

| Ejercicio | Tipo | Ejecución |
|---|---|---|
| Flexión inclinada | Fuerza dinámica | Repeticiones |
| Sentadilla a silla | Fuerza dinámica | Repeticiones |
| Círculos de hombros | Movilidad | Ciclos |
| Chin tuck | Control postural | Repeticiones + retención |
| Flexor de cadera | Estiramiento estático | Tiempo por lado |
| Wall sit | Isometría | Tiempo |
| Flujo de cadera | Flujo | Ciclos o guía temporal |

---

## 10. Duración real

La duración no debe escribirse manualmente como etiqueta desconectada del contrato.

Debe derivarse de:

```text
preparación
+ ejecución
+ repeticiones × tempo
+ lados
+ series
+ cambios de lado
+ descansos
+ transiciones
+ salida
+ cierre
```

### Importante

Los metadatos:

```text
position
equipment
requiresFloor
intensity
level
```

no bastan para calcular la duración.

También se necesitan:

```text
setup
mode
duration
durationPerSide
repetitions
estimatedSecondsPerRep
sides
sets
sideTransition
restBetweenSets
transitionAfter
exitTime
```

### Durante la migración

En desarrollo se puede comparar:

```text
Duración declarada: 2 min
Duración calculada: 3–5 min
```

En producción debe mostrarse una única promesa:

```text
3–5 min · a tu ritmo
```

No mostrar dos duraciones al usuario.

Mientras una rutina no tenga contrato suficiente:

```text
derivedDuration → prioridad
min legacy → fallback
```

---

## 11. Evitar el booleano `discrete` sin definición

`discrete` puede resultar ambiguo:

- repeticiones;
- final manual;
- ejercicio independiente;
- ausencia de tiempo;
- cantidad contable.

Es preferible que el contrato lo exprese de forma semántica:

```js
execution: {
  mode: "repetitions",
  completion: "manual"
}
```

No añadir `discrete` hasta definir:

- qué significa;
- qué comportamiento produce;
- qué combinaciones permite;
- por qué no puede derivarse de `execution.mode`.

---

## 12. Pilotos

El esquema debe diseñarse pensando en el catálogo completo, pero implementarse y validarse primero en pilotos.

Pilotos actuales:

- `desk.pushups`;
- `chair.squats`;
- `neck.3`;
- `chair.antidote`.

Debe añadirse, si existe, un quinto piloto:

> Un estiramiento estático bilateral que requiera pared o suelo.

Esto es necesario para validar:

- `setup.mode = ready`;
- retención temporizada;
- duración por lado;
- cambio de lado;
- transición;
- salida;
- alternativa;
- duración total real.

No poblar todavía las 14+14 rutinas.

Primero se debe demostrar que el esquema funciona con:

- fuerza por repeticiones;
- movilidad;
- control postural;
- secuencia;
- estiramiento bilateral.

---

## 13. Jerarquía visual

La sesión no debe parecer una tarjeta de biblioteca ampliada.

Jerarquía recomendada durante la ejecución:

```text
Contexto secundario: 2 de 4
Visual instructivo grande
Acción principal
Repeticiones o tiempo
Una corrección esencial
Acción primaria
```

Ejemplo:

```text
Cuello ligero                               2 de 4
                 [VISUAL]
Lleva suavemente la barbilla hacia atrás
             5 repeticiones
Mantén la mirada al frente
                [Terminé]
```

### Evitar

- muchos chips;
- varias barras de progreso;
- textos extensos permanentes;
- tiempo y repeticiones compitiendo;
- más de una acción primaria;
- controles pequeños en esquinas;
- visuales demasiado pequeños;
- tarjetas dentro de tarjetas;
- exceso de bordes;
- sombras decorativas;
- mostrar todos los metadatos durante la ejecución.

Los metadatos pertenecen principalmente a la vista previa.

---

## 14. Sistema visual de ejercicios

Los glifos pequeños no deberían asumir toda la responsabilidad instructiva.

Distinguir:

### Nivel 1 — Icono del módulo

Para navegación.

### Nivel 2 — Glifo o portada de rutina

Para reconocimiento en biblioteca.

### Nivel 3 — Visual instructivo

Para enseñar:

- postura;
- dirección;
- apoyo;
- lado;
- recorrido.

Para los pilotos, se recomienda un diagrama estático de dos poses:

- pose inicial con menor énfasis;
- pose final principal;
- una flecha;
- punto de apoyo;
- objeto necesario;
- zona objetivo solo si aporta claridad.

No animar todo el catálogo. La animación debe reservarse para movimientos cuya dirección no se entienda mediante dos poses.

---

## 15. Tamaño y responsive

El visual instructivo debe ser suficientemente grande:

- móvil: aproximadamente 180–260 px;
- escritorio: aproximadamente 220–340 px;
- ajustar según altura, no solo ancho.

Comprobar especialmente:

- `360 × 640`;
- `390 × 844`;
- `768 × 1024`;
- escritorio estándar;
- pantallas con poca altura.

Los controles deben respetar safe areas y permanecer accesibles sin ocultar la instrucción.

---

## 16. Controles

Cada estado debe tener una acción primaria.

### Setup complejo

```text
[Estoy listo]
```

### Repeticiones

```text
[Terminé]
```

### Tiempo

El contador puede avanzar automáticamente, con pausa accesible.

### Cambio de lado

Puede avanzar automáticamente tras una transición breve o requerir confirmación si la postura es compleja:

```text
[Cambiar de lado]
```

### Controles secundarios

- Pausar.
- Omitir.
- Salir.

No hacer que “Omitir” compita visualmente con “Terminé”.

No penalizar ni exigir confirmaciones culpabilizadoras:

```text
¿Seguro que quieres abandonar?
Perderás el progreso.
```

Preferir:

```text
Salir de la práctica
Tu progreso anterior se conserva.
```

---

## 17. Cierre y feedback

El final no debe ser únicamente:

```text
Completado
```

Debe ayudar a volver:

```text
Suelta los brazos y respira con normalidad.
Has terminado.
```

Feedback recomendado:

```text
¿Te ayudó esta pausa?
Sí · Un poco · No
Ahora no
```

Es mejor que:

```text
¿Te ayudó?
Mejor · Igual · No
```

porque pregunta y respuestas deben coincidir semánticamente.

El feedback:

- aparece en `SessionDone`;
- es opcional;
- no bloquea;
- no gamifica;
- no abre una pantalla extensa;
- no genera recomendaciones todavía.

Almacenamiento provisional:

```js
routineFeedback: {
  "desk.pushups": {
    completed: 8,
    positive: 5,
    partial: 2,
    negative: 1,
    skipped: 0
  }
}
```

No implementar esta parte antes de resolver la experiencia principal del runner.

---

## 18. Eventos

Es correcto diseñar el esquema antes de implementarlo.

Modelo conceptual:

```js
{
  schemaVersion: 1,
  id,
  occurredAt,
  localDateKey,
  type: "routine.completed",
  module: "move",
  source: "library",
  routineId: "desk.pushups",
  variantId: null,
  context: {
    pathId: null,
    pathStepId: null,
    focusBlockId: null
  },
  execution: {
    plannedDurationSeconds,
    actualDurationSeconds,
    completedSteps,
    totalSteps,
    completion: "completed"
  },
  result: {
    feedback: "positive"
  }
}
```

Fuentes posibles:

```text
library
breakMenu
paceRecommendation
path
favorite
repeat
```

En esta fase se debe documentar, no implementar.

---

## 19. Deuda técnica que no debe consolidarse

### `step.name = glyph key`

Es una asociación frágil.

Objetivo:

```text
step.id
step.nameKey
step.visualId
```

Cambiar un nombre visible no debería obligar a renombrar el glifo.

### Traducciones posicionales `sN`

Una identidad como:

```text
routine.s1
routine.s2
```

es frágil porque insertar un paso obliga a reindexar.

Objetivo:

```text
routine.setup
routine.lower
routine.press
routine.finish
```

No migrar necesariamente en la sesión inmediata, pero registrar la deuda y no ampliar el patrón.

### JSX expuesto a `window`

Debe auditarse como requisito del standalone, no asumirse como arquitectura objetivo.

### Límite de 500 líneas

Puede servir de alerta, no como criterio absoluto. Dividir por responsabilidades:

- vista;
- estado;
- cálculos;
- datos;
- controles;
- feedback.

### Standalone

El standalone es un artefacto generado, no una fuente de verdad.

Durante iteraciones:

- trabajar en fuentes;
- probar en desarrollo;
- no leer ni regenerar continuamente el standalone.

Regenerarlo una vez cuando el bloque aprobado esté cerrado.

### Service worker

La necesidad repetida de purgar manualmente el service worker en desarrollo indica una fricción del entorno. Debe registrarse para corregirse posteriormente.

### Defaults y estado persistido

Conservar los datos existentes no implica negar defaults a usuarios antiguos. Usar normalización o migraciones versionadas y no destructivas.

---

## 20. Welcome

La pantalla Welcome debe conseguir:

```text
Entiendo qué es PACE
→ Siento que puede servirme
→ Puedo empezar sin esfuerzo
```

No debe explicar todo el producto.

### Objetivos en cinco segundos

El usuario debe entender:

1. Qué es PACE.
2. Qué beneficio propone.
3. Qué debe hacer ahora.

### Estructura recomendada

```text
PACE

Trabaja a tu ritmo,
no contra tu cuerpo.

Combina periodos de foco con pequeñas pausas
para respirar, moverte y volver con más claridad.

[Empezar]

Ver cómo funciona
```

### Después

Como máximo, una selección sencilla:

```text
¿Cuánto quieres enfocarte?
25 min · 40 min · 50 min
```

Y entrar en Home.

### Evitar

- explicar todos los módulos;
- carrusel largo;
- estadísticas;
- logros;
- Premium;
- permisos prematuros;
- demasiadas preferencias;
- cuenta obligatoria;
- más de una acción principal;
- convertir Welcome en una landing comercial interna.

### Criterios de revisión

- El titular expresa una promesa.
- El CTA es inequívoco.
- La pantalla principal cabe en móvil.
- Puede saltarse.
- No aparece a usuarios recurrentes.
- No pide permisos antes de demostrar valor.
- Tiene continuidad visual con Home.
- La ilustración refuerza la idea de ritmo, foco y pausa.
- No utiliza párrafos demasiado largos.
- No obliga a configurar toda la aplicación.

---

## 21. Orden recomendado

No continuar B2.2b completo todavía.

Orden:

### B2.2a.5 — Afinado UX

- Auditar runtime.
- Mapear estados.
- Revisar setup automático.
- Afinar jerarquía.
- Revisar controles.
- Validar visuales.
- Incorporar un estiramiento bilateral como piloto.

### B2.2b-1 — Contrato y duración

- Esquema mínimo.
- Cinco pilotos.
- Duración derivada.
- Validadores.
- Comparación con duración legacy.

### B2.2b-2 — Feedback

- Pregunta.
- Persistencia.
- Integración no bloqueante.

### B2.2b-3 — Eventos

- Documento de decisión.
- Sin implementación inicial.

### Expansión posterior

Solo después de validar los pilotos:

- migrar las 14+14 rutinas;
- crear más diagramas;
- mejorar biblioteca;
- relacionarlo con Caminos y Pausa PACE.

---

## 22. Criterio de éxito

El runner estará suficientemente afinado cuando:

- la acción se entiende en menos de tres segundos;
- la preparación no genera prisa;
- el ejercicio comienza cuando el usuario está preparado;
- las repeticiones no compiten contra tiempo;
- las retenciones empiezan después de la colocación;
- los lados son explícitos;
- solo existe una acción primaria;
- el visual enseña, no solo decora;
- se puede adaptar u omitir;
- la duración es honesta;
- el cierre no es abrupto;
- el usuario siente acompañamiento sin exceso de texto;
- funciona correctamente en móvil;
- el contenido legacy sigue funcionando.
