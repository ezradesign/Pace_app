Entendido. Lo que necesitas no es otra auditoría ni una lista resumida, sino una **memoria completa de producto**, redactada para que Claude Code conozca todas las ideas surgidas, entienda su razonamiento y pueda contrastarlas con la aplicación antes de decidir qué integrar.

Puedes guardar el siguiente documento como:

```text
docs/product/PACE_EVOLUTION_CONTEXT.md
```

o añadirlo como memoria de proyecto para Claude.

---

# PACE · Memoria integral de evolución de producto

> Documento de contexto, hipótesis y propuestas para debate con Claude Code.  
> **No es una especificación cerrada ni una orden de implementación.**

---

## 0. Instrucciones para Claude Code

Este documento recopila ideas de evolución de PACE surgidas tras revisar el producto, el repositorio, sus módulos, Caminos, estadísticas, Home, sidebar, sistema visual, propuesta Premium, posible aplicación móvil, landing y estrategia de lanzamiento.

Contiene:

- observaciones sobre el producto actual;
- problemas detectados;
- hipótesis que deben verificarse;
- propuestas de solución;
- alternativas con diferente alcance;
- recomendaciones preliminares;
- ideas todavía no validadas.

## Regla principal

**No implementar automáticamente las propuestas de este documento.**

Antes de programar cualquier cambio:

1. Revisar el estado actual del repositorio.
2. Confirmar si la observación sigue siendo válida.
3. Identificar archivos y dependencias.
4. Evaluar impacto sobre:
   - navegación;
   - Home;
   - sidebar;
   - responsive;
   - datos;
   - historial;
   - traducciones;
   - Caminos;
   - logros;
   - Free/Premium;
   - PWA;
   - futura aplicación móvil.
5. Proponer alternativas si existe una solución más sencilla.
6. Clasificar cada propuesta como:
   - implementar;
   - pilotar;
   - debatir;
   - posponer;
   - descartar.
7. No romper compatibilidad con datos existentes.
8. No renombrar IDs históricos sin una migración explícita.
9. No aumentar el alcance antes de validar los pilotos.
10. Esperar aprobación antes de realizar cambios de producto amplios.

## Etiquetas de interpretación

Claude debe utilizar estas etiquetas al responder:

- **CONFIRMADO**: existe actualmente y se ha verificado en código.
- **PARCIAL**: existe, pero no exactamente como se describe.
- **HIPÓTESIS**: parece probable, pero necesita comprobación.
- **PROPUESTA**: idea de evolución, no implementada.
- **DECISIÓN NECESARIA**: requiere aprobación de producto.
- **RIESGO**: puede afectar a compatibilidad, seguridad o complejidad.
- **POSPONER**: no debería entrar en la siguiente fase.

---

# 1. Contexto general de PACE

Repositorio:

- https://github.com/ezradesign/Pace_app

Web:

- https://paceweb.pages.dev/

PACE es una aplicación de enfoque, pausas y cuidado corporal. Integra:

- temporizador de foco;
- descansos;
- respiración;
- movimiento;
- estiramientos;
- hidratación;
- Caminos;
- logros;
- estadísticas;
- contenido Free/Premium;
- funcionamiento local-first/PWA.

La aplicación tiene una identidad visual editorial y calmada. No pretende ser:

- una aplicación deportiva convencional;
- una red social;
- un gestor de tareas completo;
- una aplicación médica;
- un tracker de productividad agresivo;
- un chatbot;
- una plataforma de contenido masiva.

---

# 2. Visión de producto propuesta

La propuesta central debería poder expresarse así:

> **PACE te ayuda a trabajar a un ritmo más humano: enfócate, haz una pausa, respira o mueve el cuerpo y vuelve mejor.**

Otra versión:

> **PACE conecta atención, pausa y cuerpo para que trabajar no signifique olvidarte de ti.**

## Ciclo central

```text
Llegar
  ↓
Reconocer el estado
  ↓
Enfocarse
  ↓
Parar
  ↓
Respirar, mover, estirar o hidratarse
  ↓
Observar si ayudó
  ↓
Volver
```

Actualmente PACE puede percibirse como una colección de módulos:

```text
Temporizador
Respira
Mueve
Estira
Hidrátate
Caminos
Estadísticas
Logros
```

La evolución propuesta consiste en hacer que esas piezas formen un ciclo reconocible.

## Diferenciación

PACE debería diferenciarse por:

- relación entre foco y recuperación;
- pausas breves contextualizadas;
- cuidado corporal accesible;
- privacidad;
- funcionamiento local;
- estética editorial;
- Caminos como experiencias;
- recomendaciones sin vigilancia;
- autoconocimiento sin presión.

---

# 3. Principios de producto

## 3.1 Una prioridad cada vez

PACE no debería presentar varias recomendaciones simultáneas.

Jerarquía orientativa:

1. sesión activa;
2. pausa posterior al foco;
3. seguridad o recuperación;
4. continuación de un Camino;
5. necesidad corporal detectada;
6. práctica habitual;
7. recomendación general;
8. exploración libre.

## 3.2 Home minimalista

La Home no debe convertirse en:

- dashboard;
- feed;
- biblioteca;
- resumen estadístico completo;
- chat;
- página de Caminos;
- panel de productividad.

El temporizador debe continuar siendo el elemento principal.

## 3.3 Cuidado, no presión

Evitar:

- rankings;
- comparaciones sociales;
- culpa por perder una racha;
- metas arbitrarias;
- “día perfecto”;
- puntuaciones de productividad;
- “al fallo”;
- “al límite”;
- “más bajo si puedes”;
- récords de retención respiratoria;
- lenguaje de invulnerabilidad corporal;
- claims médicos o causales.

Favorecer:

- continuidad flexible;
- repetición;
- adaptación;
- rango cómodo;
- observación;
- progreso personal;
- lenguaje no competitivo.

## 3.4 Local-first

Siempre que sea posible:

- datos locales;
- recomendaciones locales;
- exportación;
- eliminación;
- funcionamiento offline;
- sin cuenta obligatoria;
- sin dependencia central de IA;
- sin backend hasta que aporte un valor claro.

## 3.5 Seguridad y claridad no son Premium

Premium puede ofrecer:

- más contenido;
- audio;
- Caminos;
- rituales;
- constructor;
- estadísticas;
- personalización;
- patrones;
- ambientes.

No puede bloquear:

- ejecución correcta;
- precauciones;
- alternativas;
- requisitos;
- demostraciones básicas;
- salida de una sesión;
- información sobre dificultad.

---

# 4. Problema transversal detectado

Respira, Mueve, Estira y Caminos parecen compartir un mismo problema:

> **Existe bastante contenido, pero todavía no siempre existe suficiente acompañamiento.**

El patrón actual se aproxima a:

```text
Nombre
Descripción
Duración
Empezar
Visual
Cue breve
Temporizador
Completar
```

El patrón premium deseado sería:

```text
Necesidad
Promesa
Preparación
Explicación
Demostración
Ejecución
Adaptación
Transición
Cierre
Feedback
Memoria
```

La prioridad no debería ser añadir más actividades, sino elevar la calidad de las existentes.

---

# 5. Home

## 5.1 Objetivo

Mantener el temporizador como centro y añadir únicamente contexto cuando sea útil.

## 5.2 Estado antes de empezar

Podría aparecer una pregunta opcional:

> ¿Cómo llegas?

Opciones:

- disperso;
- tenso;
- cansado;
- tranquilo;
- prefiero empezar.

No debe:

- ser obligatoria;
- parecer clínica;
- aparecer constantemente;
- bloquear el temporizador;
- exigir escribir;
- almacenar información si no se utilizará.

Puede ayudar a:

- elegir duración;
- recomendar una pausa;
- ajustar el postfoco;
- enriquecer estadísticas futuras.

## 5.3 Durante el foco

No añadir:

- recomendaciones;
- estadísticas;
- Camino;
- frases cambiantes;
- animaciones;
- feedback.

Durante el foco, PACE debe desaparecer.

## 5.4 Después del foco

Tras finalizar un bloque, mostrar una sola propuesta:

> **Llevas un bloque sin moverte**  
> Cuello y hombros · 2 min  
> Sentado · Sin material  
> `Empezar` · `Otra opción` · `Ahora no`

Al terminar:

> ¿Te ayudó?  
> `Mejor` · `Igual` · `No`

Después, volver al temporizador.

## 5.5 Opciones a valorar

### Opción A · Conservadora

Mantener `BreakMenu` y mejorar orden, copy e información.

### Opción B · Equilibrada

`BreakMenu` recomienda una rutina concreta, con “otra opción”.

### Opción C · Contextual completa

La propia Home cambia antes y después de cada sesión.

## Recomendación preliminar

Pilotar la opción B.

No rediseñar toda la Home antes de validar que la recomendación postfoco aporta valor.

---

# 6. Pausa PACE

## 6.1 Concepto

“Pausa PACE” sería la recomendación breve que conecta foco y recuperación.

No es un nuevo módulo. Es una capa que selecciona contenido ya existente.

## 6.2 Entradas posibles

- duración del foco;
- hora;
- último movimiento;
- última respiración;
- prácticas realizadas hoy;
- favoritos;
- prácticas rechazadas;
- feedback;
- preferencia sentado;
- evitar suelo;
- Camino activo;
- estado inicial;
- disponibilidad de tiempo;
- dificultad.

## 6.3 Scoring local orientativo

```text
+4 bloque superior a 50 min
+3 no realizó actividad corporal hoy
+3 indicó tensión
+3 una práctica similar ayudó anteriormente
+2 marcada como favorita
+2 pertenece al Camino activo
-5 realizada recientemente
-4 requiere suelo y el usuario prefiere escritorio
-4 duración superior al tiempo disponible
-10 práctica avanzada sin selección explícita
```

No implementar esta fórmula literalmente sin analizar los datos actuales.

## 6.4 Requisitos

- local;
- determinista;
- explicable;
- depurable;
- sin IA;
- respetuoso;
- permite “otra opción”;
- no recomienda técnicas avanzadas automáticamente;
- no repite siempre lo mismo;
- funciona sin historial.

## 6.5 Explicabilidad

La recomendación puede incluir una razón:

> Te la proponemos porque llevas dos bloques sin moverte.

> Hoy todavía no has hecho una pausa corporal.

> Esta práctica te ayudó anteriormente.

No mostrar puntuaciones internas.

---

# 7. Sidebar

## 7.1 Objetivo

Transformar la sidebar en un compañero diario sin competir con la Home.

## 7.2 Estructura propuesta

### AHORA

Una sola acción:

- pausa recomendada;
- siguiente etapa;
- retomar sesión;
- “¿qué necesitas?”.

Ejemplo:

> Postura reset · 2 min  
> `Empezar`

### HOY

Resumen breve:

- foco: 75 min;
- respiración: 5 min;
- cuerpo: 4 min;
- agua: 5/8.

Puede incluir una frase:

> Hoy has alternado mejor foco y movimiento.

No debe convertirse en estadísticas avanzadas.

### REPETIR

Última práctica útil:

> Cuello ligero · 3 min  
> `Repetir`

### MIS PAUSAS

Máximo tres:

- Escritorio suave;
- Reset de tarde;
- Cuello y muñecas.

### CAMINO ACTIVO

- nombre;
- próxima etapa;
- progreso;
- acción continuar.

### COLECCIÓN

Presencia secundaria:

> 69 sellos descubiertos.

## 7.3 Opciones

### A · Informativa

Hoy + Camino + colección.

### B · Accionable

Ahora + Hoy + Repetir + Camino.

### C · Centro personal

Añade favoritos, rituales, notas y estadísticas.

## Recomendación

Pilotar B.

## 7.4 Móvil

En móvil, la sidebar pasa a drawer:

1. Ahora;
2. Hoy;
3. Repetir;
4. Camino;
5. Mis pausas;
6. Colección;
7. ajustes/soporte.

---

# 8. Memoria personal

PACE puede sentirse memorable si recuerda preferencias útiles.

## Datos potenciales

- práctica más repetida;
- duración preferida;
- modalidad favorita;
- ejercicios excluidos;
- prácticas que ayudan;
- preferencia sentado;
- evitar suelo;
- franja habitual;
- Camino activo;
- feedback;
- prácticas abandonadas;
- rituales;
- respuesta a tensión o cansancio.

## Principio

Debe sentirse:

> PACE recuerda qué me ayuda.

No:

> PACE me está vigilando.

## Controles

El usuario debe poder:

- desactivar recomendaciones;
- borrar memoria;
- eliminar historial;
- excluir ejercicios;
- exportar datos;
- ver qué se guarda;
- reiniciar preferencias.

---

# 9. Rediseño general de actividades

## 9.1 Problemas actuales a comprobar

- duración nominal diferente de la real;
- pasos definidos por repeticiones pero ejecutados por tiempo;
- falta de cambio de lado;
- preparación genérica;
- transiciones ausentes;
- material no anunciado;
- suelo no anunciado;
- dificultad poco visible;
- cues demasiado breves;
- pocas alternativas;
- visuales poco instructivos;
- final genérico;
- rutinas accesibles y avanzadas presentadas igual.

## 9.2 Tarjeta premium

Una tarjeta debe responder:

1. ¿Qué me aporta?
2. ¿Puedo hacerla aquí?
3. ¿Cuánto dura?
4. ¿Qué necesito?
5. ¿Qué dificultad tiene?

Ejemplo:

> **Cuello ligero**  
> Afloja cuello y hombros sin levantarte de la silla.  
> `3 min` · `Sentado` · `Suave` · `Sin material`  
> **Empezar**

Otro:

> **Espalda de oficina**  
> Activa espalda y abre el pecho después de estar sentado.  
> `6 min` · `De pie` · `Sin suelo` · `Media`  
> **Ver ejercicios**

## 9.3 Evitar códigos opacos

Reducir o contextualizar:

- SIT;
- SHLD;
- ANC;
- ATG;
- PULL;
- PUSH.

Preferir:

- SENTADO;
- CUELLO;
- CADERAS;
- FUERZA;
- SUELO;
- PARED;
- SUAVE;
- ACTIVO;
- AVANZADO.

---

# 10. Modelo de datos de actividad

El esquema actual `name + dur + cue` es probablemente insuficiente.

Evaluar un modelo como:

```text
Routine
- id
- nameKey
- descriptionKey
- goal
- context
- level
- intensity
- positions
- equipment
- requiresFloor
- estimatedDuration
- steps
- intro
- outro
- cautions
- access
```

```text
ExerciseStep
- id
- visualId
- nameKey
- mode
- duration
- repetitions
- tempo
- sides
- setupTime
- transitionTime
- targetAreas
- position
- equipment
- setup
- action
- sensation
- avoid
- easier
- harder
- alternativeId
- safetyNotes
- audioScript
```

## Tipos de paso

### `timed`

Estiramientos e isométricos.

### `repetitions`

Fuerza por repeticiones.

### `perSide`

Duración o repeticiones por lado.

### `guidedTempo`

Movimiento sincronizado.

### `manual`

El usuario avanza cuando termina.

### `rest`

Descanso real.

### `transition`

Cambio de posición/material.

### `breathing`

Patrón respiratorio.

## Compatibilidad

No reemplazar directamente el formato actual.

Proponer:

- adaptador;
- normalización;
- migración gradual;
- soporte temporal para contenido antiguo;
- validación de esquema.

---

# 11. Duración

## 11.1 Problema

`routine.min` parece ser manual y no siempre coincide con:

- pasos;
- lados;
- descansos;
- preparación;
- transición;
- cierre.

## 11.2 Duración real

```text
preparación
+ pasos
+ lados
+ descansos
+ transiciones
+ cierre
```

## 11.3 Presentación

Mostrar:

- `2 min`;
- `4–5 min`;
- `aprox. 6 min`;
- `8 repeticiones`;
- `a tu ritmo`.

No prometer cuatro minutos si el contenido suma dos, ni al contrario.

## 11.4 Variantes curadas

### Express

Núcleo de la práctica.

### Completa

Preparación, práctica y cierre.

### Profunda

Más tiempo o progresión.

No crear un slider que elimine pasos arbitrariamente.

---

# 12. Anatomía de una sesión premium

## 12.1 Antes de empezar

> **Antídoto de silla · 5 min**  
> Secuencia suave para pecho, caderas y cuello.
>
> Necesitarás una silla estable.  
> Incluye un ejercicio de pie.  
> No requiere suelo.

Mostrar:

- duración;
- intensidad;
- posición;
- material;
- suelo;
- número de ejercicios;
- lados;
- dificultad;
- miniaturas.

## 12.2 Preparación

No utilizar únicamente `3-2-1`.

Ejemplo:

> Siéntate con ambos pies en el suelo. Deja caer los hombros y mira al frente.

Botón:

> Estoy listo

El reloj no empieza mientras se busca material.

## 12.3 Durante el paso

### Colócate

> Apoya las manos en una mesa estable.

### Muévete

> Dobla los codos y acerca el pecho.

### Nota

> Mantén cabeza, espalda y caderas alineadas.

### Ajusta

> Acércate a la mesa para reducir intensidad.

### Evita

> No utilices una superficie que pueda desplazarse.

No todos los pasos necesitan todas las capas visibles a la vez. Puede utilizarse revelación progresiva.

## 12.4 Transición

> Cambia de lado.

> Ponte de pie con calma.

> Necesitarás una pared.

La transición no resta tiempo de práctica.

## 12.5 Cierre

> Suelta brazos y hombros. Respira con normalidad y observa cómo se siente la zona.

Feedback:

- mejor;
- igual;
- incómodo;
- no terminé.

---

# 13. Sistema visual de ejercicios

## 13.1 Problema

Los glifos actuales son coherentes como lenguaje editorial, pero no todos explican biomecánica.

Algunos funcionan como recordatorio, no como demostración.

## 13.2 Tres niveles

### Nivel 1 · Icono

- navegación;
- categoría;
- tag;
- actividad.

Puede ser abstracto.

### Nivel 2 · Portada

- diferenciar rutinas;
- generar interés;
- representar zona y energía;
- composición mayor.

### Nivel 3 · Diagrama

- postura inicial;
- postura final;
- dirección;
- apoyo;
- zona objetivo;
- lado.

## 13.3 Gramática visual

| Elemento | Representación |
|---|---|
| Postura actual | Color sólido |
| Postura siguiente | 20–30 % opacidad |
| Dirección | Flecha |
| Apoyo | Línea firme |
| Zona objetivo | Mancha suave |
| Lado | IZQ./DCHA. |
| Respiración | Arco expansivo |
| Precaución | Ámbar discreto |
| Suelo/pared/silla | Elemento reconocible |

## 13.4 Opciones

### A · Mejorar glifos actuales

- coste bajo;
- mantiene sistema;
- claridad limitada.

### B · Dos poses estáticas

- recomendada;
- clara;
- offline;
- mantiene estilo.

### C · SVG animado

- pilotar;
- útil para dirección y ritmo;
- no hacerlo global inicialmente.

### D · Vídeo

- buena demostración;
- alto coste;
- peor offline;
- menor coherencia editorial.

## 13.5 Animación

Si se utiliza:

- 2–3 segundos;
- pausa en extremos;
- solo paso activo;
- se puede detener;
- versión estática;
- `prefers-reduced-motion`.

---

# 14. IDs de ejercicios y traducciones

## Hipótesis que debe comprobar Claude

`ExerciseGlyph` parece resolver visuales mediante nombres canónicos españoles.

Si el nombre se traduce antes de resolverlo, puede producir fallback.

## Propuesta

Separar:

```text
id: extra.desk.pushups.s0
visualId: inclinePushup
nameKey: extra.desk.pushups.s0.name
```

Resolver:

```text
inclinePushup → InclinePushupVisual
```

Nunca:

```text
"Flexiones inclinadas" → visual
```

## Beneficios

- traducciones;
- renombrado;
- aliases;
- variantes;
- tests;
- reutilización;
- migración futura.

---

# 15. Respira

## 15.1 Diagnóstico

Es el módulo visualmente más desarrollado, pero las técnicas se diferencian principalmente por patrón y duración. Falta enseñanza específica.

## 15.2 Organización por necesidad

Primera capa:

- Calmarme;
- Recuperar foco;
- Activarme;
- Prepararme para dormir;
- Explorar;
- Práctica profunda.

Segunda capa:

- accesible;
- intermedia;
- avanzada.

Tercera capa:

- nombre técnico.

## 15.3 Animación

Comprobar si `BreatheVisual` utiliza una transición fija.

La animación debe durar lo mismo que la fase:

```text
Inhala 4 → expansión 4 s
Sostén 7 → estable 7 s
Exhala 8 → contracción 8 s
```

Para respiraciones rápidas, valorar:

- pulso;
- onda;
- sonido;
- haptic;
- contador;

en lugar de una interpolación lenta.

## 15.4 Preparación específica

### Diafragmática

- postura cómoda;
- respiración sin forzar;
- vientre;
- hombros relajados;
- alternativa natural.

### Ujjayi

- ligera constricción;
- sonido suave;
- no raspar;
- boca cerrada si resulta cómodo;
- alternativa normal.

### Bhramari

- inhalación nasal;
- zumbido suave;
- mandíbula relajada;
- volumen cómodo;
- opción sin tapar oídos.

### Nadi Shodhana

- posición de mano;
- fosa que se cierra;
- orden;
- variante sin retención;
- alternativa imaginada.

### Bhastrika/Kapalabhati

- técnica activa;
- ritmo;
- postura;
- nivel;
- recuperación;
- salida;
- seguridad.

## 15.5 Claims

Revisar frases como:

- “Baja ansiedad”.
- “Equilibra hemisferios”.
- “Armoniza HRV”.
- “Sincroniza corazón y mente”.
- “Antesala del trance consciente”.

Alternativas:

> Patrón de exhalación larga orientado a bajar el ritmo.

> Respiración alterna tradicional para centrar la atención.

> Ritmo regular para respirar con calma.

> Práctica intensa con respiración rápida y retenciones.

No garantizar resultados.

## 15.6 Técnicas avanzadas

Revisar:

- Bhastrika;
- Kapalabhati;
- box largo;
- 4·7·8;
- Kumbhaka 1:4:2;
- tolerancia CO₂;
- rondas;
- retenciones abiertas.

## 15.7 Retenciones y logros

Comprobar si existen logros por:

- 60 segundos;
- 90 segundos;
- 120 segundos.

Recomendación:

- eliminar o rediseñar;
- no premiar apnea;
- no mostrar récord;
- no convertirla en competición;
- limitar protocolos;
- permitir respirar cuando se necesite;
- recuperación entre rondas;
- salida inmediata.

## 15.8 Ambientes

“Coherente 432” podría ser:

> Coherente 6·6  
> Ambiente: silencio / lluvia / drone.

No inflar el catálogo contando el ambiente como técnica independiente.

## 15.9 Duraciones

### Reset

1–3 minutos.

### Práctica

5–8 minutos.

### Inmersiva

10–20 minutos.

## 15.10 Catálogo prioritario

### Esenciales

- natural;
- diafragmática;
- coherente 5·5;
- exhalación 4·6;
- box 4;
- suspiro fisiológico;
- Bhramari;
- Ujjayi.

### Intermedias

- coherente 6·6;
- 4·7·8 adaptada;
- yin;
- Nadi Shodhana sin retención.

### Avanzadas

- Bhastrika;
- Kapalabhati;
- Kumbhaka;
- CO₂;
- rondas intensas.

---

# 16. Mueve

## 16.1 Reorganización por intención

### Activarme

Pausas para energía.

### Despertar la espalda

Compensar postura.

### Moverme sin que se note

Oficina.

### Fuerza breve

Trabajo sencillo.

### Piernas

Base y circulación.

### Empuje y tracción

Fuerza superior.

### Core y postura

Estabilidad.

## 16.2 Diferenciar niveles

### Activación

- breve;
- oficina;
- intensidad baja;
- no equivale a entrenamiento.

### Fuerza breve

- series;
- repeticiones;
- descanso;
- intensidad media.

### Fuerza progresiva

- más duración;
- niveles;
- seguimiento;
- avanzada.

## 16.3 Flexiones de escritorio

Problemas potenciales:

- repeticiones comprimidas;
- tiempo incompatible;
- mesa no validada;
- sin regresión;
- sin alineación.

Propuesta:

### Preparación

> Usa una mesa estable. Coloca las manos algo más anchas que los hombros.

### Ejecución

> Haz entre 6 y 10 repeticiones. Baja durante 2–3 segundos y sube con control.

### Técnica

> Mantén cabeza, espalda y caderas alineadas.

### Ajuste

> Más fácil: acércate.  
> Más intenso: aléjate.

### Runner

- modo repeticiones;
- completar manualmente;
- descanso;
- 1/2/3 series.

## 16.4 Fondos en silla

Comprobar:

- tag incorrecto `PULL`;
- “al fallo”;
- estabilidad;
- nivel;
- alternativa.

Propuesta:

- reclasificar;
- silla estable, sin ruedas;
- rango reducido;
- alternativa de pared/escritorio;
- no presentarlo como básico;
- eliminar “al fallo”.

## 16.5 Colgarse

No recomendar:

> barra o marco.

Usar:

> barra estable diseñada e instalada para soportar peso.

Añadir:

- pies apoyados;
- agarre asistido;
- hang parcial;
- tiempos cortos;
- diferencia pasivo/activo;
- salida ante dolor, hormigueo o inestabilidad.

Revisar afirmaciones absolutas como:

> El hombro nace para colgar.

## 16.6 Piernas a una

La combinación de:

- Bulgarian;
- ATG split squat;
- sissy squat;
- gemelo unilateral;

es avanzada.

Propuesta:

### Progresión

1. sit-to-stand;
2. split squat asistido;
3. Bulgarian asistida;
4. split squat profundo;
5. sissy asistida.

Convertir en:

> Piernas unilaterales · avanzado  
> 10–12 min.

No tratar como pausa rápida.

## 16.7 Espalda de oficina

Comprobar si incluye Superman en suelo.

Opciones:

- versión sin suelo;
- bisagra de pie;
- extensión de cadera;
- anunciar suelo;
- renombrar.

No presentar brazos cruzados como equivalente exacto de band pull-apart.

## 16.8 Lenguaje

Eliminar:

- al fallo;
- al límite;
- indestructible;
- más bajo si puedes.

Usar:

- detente antes de perder el control;
- elige un rango cómodo;
- mantén una repetición limpia;
- reduce el recorrido si lo necesitas.

---

# 17. Estira

## 17.1 No todo es estiramiento

Separar:

### Soltar

Movimiento suave.

### Movilizar

Rango activo.

### Estirar

Postura mantenida.

### Fluir

Secuencia.

### Preparar

Movilidad antes de esfuerzo.

## 17.2 Entrada por necesidad

- cuello y hombros;
- abrir pecho;
- muñecas;
- espalda;
- caderas;
- piernas;
- cuerpo completo;
- final del día.

## 17.3 Antídoto silla

La rutina puede mezclar:

- sentado;
- arrodillado;
- suelo;
- zancada;
- cuello;
- respiración.

Dividir:

### Antídoto silla · sentado

- pecho;
- rotación;
- cuello;
- muñecas;
- respiración.

### Antídoto silla · cuerpo completo

- levantarse;
- flexor;
- zancada;
- posterior;
- cierre.

Anunciar suelo.

## 17.4 Cuello

### Chin tucks

En lugar de:

> Barbilla atrás, como papada.

Usar:

> Mira al frente y desliza la cabeza horizontalmente hacia atrás sin bajar la barbilla.

### Inclinación

> Acerca la oreja al hombro sin elevar el hombro.

### Rotación

> Gira hasta donde puedas mantener cabeza erguida y hombros relajados.

### Escalenos

Necesitan visual claro.

Implementar:

- lado derecho;
- centro;
- lado izquierdo;
- tiempo por lado.

## 17.5 Hombros

Si requiere:

- pared;
- banda;
- barra;
- roller;
- toalla;

no puede presentarse como una sola rutina genérica.

Dividir:

- Hombros de escritorio;
- Hombros con pared;
- Hombros con material.

## 17.6 Caderas

Separar niveles.

### Accesible

- figura cuatro en silla;
- flexor de pie;
- 90/90 apoyado;
- puente;
- balanceo.

### Activa

- 90/90 dinámico;
- Cossack asistido;
- squat apoyado;
- puente con marcha.

### Profunda

- Pigeon;
- rana;
- Cossack profundo;
- transiciones.

## 17.7 Pigeon

Instrucción propuesta:

> Coloca una pierna flexionada delante y extiende la otra. Acerca el pie delantero a la cadera si necesitas menos intensidad.

> Inclínate solo mientras la rodilla se sienta cómoda.

Alternativa:

> 90/90 o figura cuatro en silla.

## 17.8 Flexor de cadera

> Coloca una rodilla en una superficie cómoda y adelanta el otro pie. Lleva suavemente la pelvis hacia delante con el torso alto.

> Deberías notarlo en la parte anterior de la cadera.

> Si notas presión lumbar, reduce el recorrido y activa suavemente el glúteo posterior.

## 17.9 Rutina ATG/rodillas

Cambiar:

> Rodillas indestructibles.

Por:

> Movilidad y fuerza controlada para tobillos y rodillas.

La combinación de:

- ATG split squat;
- tibialis raise;
- Nordics;
- sissy squat;
- elephant walk;

es avanzada y quizá debería:

- moverse a Mueve;
- convertirse en híbrida;
- ampliarse;
- tener calentamiento;
- incluir progresiones;
- no durar solo 4–6 minutos.

---

# 18. Audio

## 18.1 Por qué

YouTube se siente guiado porque la voz permite practicar sin mirar.

PACE puede ganar mucho valor mediante audio.

## 18.2 Modos

- guía completa;
- solo señales;
- silencio.

## 18.3 Audio modular

- prepárate;
- empezamos;
- cambia de lado;
- vuelve al centro;
- últimos cinco segundos;
- respira;
- siguiente movimiento de pie;
- usa una pared;
- detente si aparece dolor;
- cierre.

## 18.4 Premium

El audio completo y los ambientes pueden ser Premium.

Las instrucciones escritas y seguridad no.

---

# 19. Caminos

## 19.1 Cantidad

Siete son suficientes.

No añadir más hasta mejorar:

- diferenciación;
- progresión;
- narrativa;
- conclusión;
- integración;
- calidad de actividades.

## 19.2 Diferencia entre rutina y Camino

### Rutina

Resuelve el momento.

### Camino

Enseña una práctica y la integra en la vida.

## 19.3 Problema

Un Camino no puede ser:

```text
actividad
actividad
actividad
sello
```

Debe ser:

```text
promesa
llegada
aprendizaje
repetición
aplicación
elección
integración
ritual
```

## 19.4 Cada Camino necesita

- nombre;
- subtítulo comprensible;
- público;
- promesa;
- duración;
- material;
- dificultad;
- arco;
- capítulos;
- repetición;
- contexto;
- cierre;
- ritual;
- resumen.

---

# 20. Sendero, Camino y Travesía

## 20.1 Sendero

### Función

Resolver una necesidad concreta.

### Longitud

- 3 etapas;
- 1–3 días;
- 2–4 minutos por etapa.

### Arco

```text
Descubrir → Practicar → Integrar
```

### Ejemplos

- Cuello ligero;
- Volver a respirar;
- Pausa de tarde;
- Cerrar el trabajo.

### Resultado

Guardar una pausa.

## 20.2 Camino

### Función

Construir un hábito o aprendizaje.

### Longitud

- 5–7 etapas;
- 5–10 días flexibles;
- 3–8 minutos.

### Arco

```text
Llegar → Explorar → Aplicar → Elegir → Integrar
```

### Elementos

- capítulos;
- repetición;
- bifurcación;
- reflexión;
- ritual.

## 20.3 Travesía

### Función

Profundización.

### Longitud

- 12–21 etapas;
- varias semanas;
- capítulos;
- descansos;
- sesiones largas y cortas;
- autonomía.

### Arco

```text
Umbral
→ Fundamentos
→ Exploración
→ Profundización
→ Autonomía
→ Regreso
```

### Recomendación

No implementar Travesías todavía.

Diseñar su arquitectura, pero validar antes un Camino.

---

# 21. Tipos de etapa de Caminos

Evaluar:

```text
practice
focus
checkIn
choice
reflection
repeat
combine
rest
ritual
summary
```

## `practice`

Lanza actividad.

## `focus`

Completa bloque.

## `checkIn`

Pregunta breve.

## `choice`

Selecciona entre contenido validado.

## `reflection`

Idea o nota opcional.

## `repeat`

Repite observando algo.

## `combine`

Encadena dos prácticas.

## `rest`

Etapa de pausa o aprendizaje.

## `ritual`

Guarda combinación.

## `summary`

Devuelve resultados.

No construir grandes árboles narrativos.

---

# 22. Ejemplo de Sendero

## Cuello ligero

### Promesa

> Tres pausas para aprender a soltar cuello y hombros durante el trabajo.

### Etapa 1 · Reconocer

- check-in;
- chin tuck;
- inclinación;
- feedback.

### Etapa 2 · Abrir

- pecho;
- rotación;
- cuello;
- feedback.

### Etapa 3 · Integrar

- completar foco;
- recibir pausa;
- realizar;
- guardar.

### Resultado

> Tu pausa de cuello · 3 min.

---

# 23. Ejemplo de Camino

## Vuelve al cuerpo

### Promesa

> Siete etapas para compensar el tiempo sentado sin romper tu ritmo.

### Capítulo I · Escuchar

1. Observar tensión.
2. Pausa sentada.

### Capítulo II · Mover

3. Activar piernas.
4. Aplicar después del foco.
5. Elegir cuello, espalda o caderas.

### Capítulo III · Integrar

6. Repetir lo que ayudó.
7. Guardar ritual.

### Resultado

> Las pausas sentadas de tres minutos fueron las que más utilizaste.

---

# 24. Progresión visual de Caminos

## Inicial

- niebla;
- paisaje apagado;
- ruta incompleta;
- destino lejano.

## Progreso

- ruta iluminada;
- huellas;
- vegetación;
- refugios;
- luces;
- reducción de niebla.

## Final

- paisaje completo;
- destino;
- animación;
- ilustración;
- ritual;
- sello.

## Capas

```text
background
atmosphere
terrain
route
milestones
progress
completion
```

No generar una imagen completa por estado.

---

# 25. IA generativa e imágenes

## Utilizar GPT Image/Recraft para

- dirección artística;
- paisajes;
- fondos;
- hitos;
- marketing;
- variaciones;
- portadas.

## No utilizar para

- UX final;
- botones;
- textos;
- responsive;
- componentes;
- diagramas biomecánicos sin revisión;
- SVG funcional.

## Flujo

```text
Necesidad
→ flujo
→ wireframe
→ dirección visual
→ generación
→ limpieza
→ composición en Figma/Penpot
→ especificación
→ código
```

## Kit de Caminos

Generar:

- cielos;
- terrenos;
- rutas;
- puentes;
- refugios;
- árboles;
- rocas;
- niebla;
- destinos;
- estados.

---

# 26. Estadísticas

## Free

> Ayuda a vivir el día.

Mostrar:

- hoy;
- foco;
- respiración;
- Mueve;
- Estira;
- agua;
- Camino;
- siete días.

## Premium

> Ayuda a comprender tu ritmo.

Mostrar:

- semana;
- mes;
- año;
- equilibrio;
- patrones;
- horarios;
- prácticas útiles;
- feedback;
- notas;
- Caminos;
- rituales.

## Insights

> Las pausas de cuello son las que más veces marcas como útiles.

> Las prácticas de tres minutos tienen más continuidad.

> Por la tarde utilizas más movimiento que respiración.

No afirmar:

> El movimiento causa que seas productivo.

## Calendario

No utilizar únicamente intensidad.

Cada día puede mostrar pequeñas marcas:

- foco;
- respiración;
- movimiento;
- estiramiento;
- agua;
- nota.

## Evitar

- score global;
- comparación social;
- calorías;
- culpa;
- causalidad;
- obsesión con rachas.

---

# 27. Eventos

Evaluar un registro:

```text
id
timestamp
localDateKey
type
routineId
pathId
stepId
durationPlanned
durationCompleted
source
context
result
schemaVersion
```

## `type`

- focus;
- breathe;
- move;
- stretch;
- hydrate;
- path;
- note.

## `source`

- home;
- sidebar;
- recommendation;
- library;
- favorite;
- path;
- custom.

## `result`

- better;
- same;
- uncomfortable;
- notHelpful;
- skipped;
- completed;
- stopped.

## Decisiones

- retención;
- límite;
- agregados;
- eventos;
- migración;
- fechas locales;
- DST;
- exportación;
- borrado.

---

# 28. IA dentro del producto

## No implementar chat ahora

Razones:

- privacidad;
- coste;
- latencia;
- riesgo;
- estética genérica;
- recomendaciones inseguras;
- peor offline.

## Primera fase

Scoring local.

## Futuro

### Entrada natural

> Tengo cuello cargado y dos minutos.

Convierte en filtros.

### Ritual

> Quiero una pausa sentada para cuello y muñecas.

Combina ejercicios validados.

### Resumen

Narrativa sobre estadísticas calculadas.

## Límites

No:

- diagnosticar;
- prescribir;
- inventar ejercicios;
- cambiar retenciones;
- recomendar prácticas avanzadas;
- afirmar causalidad.

---

# 29. Navegación

## Opción A · Conservadora

Mantener:

- Home;
- barra;
- modales;
- Caminos;
- estadísticas;
- sidebar.

## Opción B · Equilibrada

- Home = presente;
- actividades desde barra;
- Caminos con espacio propio;
- Tu ritmo para estadísticas;
- sidebar accionable.

## Opción C · Completa

```text
Inicio
Explorar
Caminos
Tu ritmo
Perfil
```

## Recomendación

Opción B.

No adoptar navegación convencional sin comprobar que la estructura actual ha alcanzado su límite.

---

# 30. Free/Premium

## Free

- temporizador;
- pausas;
- hidratación;
- técnicas esenciales;
- actividades básicas;
- Senderos;
- uno o dos Caminos;
- resumen diario;
- siete días;
- seguridad.

## Premium

- catálogo;
- Caminos;
- futuras Travesías;
- constructor;
- rituales;
- audio;
- ambientes;
- estadísticas;
- patrones;
- notas;
- personalización;
- resúmenes.

## Mensaje

> Free te ayuda hoy.  
> Premium te ayuda a entender tu ritmo.

---

# 31. Sistema de diseño

Elegir Figma o Penpot como fuente única.

## Archivo

```text
PACE · Product Design
```

## Páginas

- Foundations;
- Components;
- Home;
- Sidebar;
- Sessions;
- Breathe;
- Move;
- Stretch;
- Paths;
- Stats;
- Mobile;
- Landing.

## Tokens

- colores;
- tipografía;
- espacio;
- radios;
- sombras;
- movimiento;
- actividad.

## Galería interna

```text
/dev/ui
/dev/glyphs
/dev/exercises
/dev/paths
/dev/states
```

Incluir:

- traducciones;
- responsive;
- Premium;
- vacíos;
- loading;
- error;
- offline;
- motion reduced.

---

# 32. Aplicaciones móviles

## Dirección

Evaluar Capacitor antes de reescribir.

## Preparar

- build;
- almacenamiento;
- lifecycle;
- timers;
- notificaciones;
- safe areas;
- deep links;
- responsive;
- privacidad;
- compras.

## Almacenamiento

Evaluar:

- Preferences para ajustes;
- SQLite para eventos;
- migración desde `localStorage`;
- backup;
- rollback.

## No desarrollar todavía si

- runner cambia;
- datos cambian;
- no hay beta;
- Premium no está definido;
- responsive no está validado.

---

# 33. Landing

## Posicionamiento

> Trabaja a tu ritmo, no contra tu cuerpo.

## Estructura

1. Hero.
2. Problema.
3. Ciclo.
4. Demo.
5. Beneficios.
6. Caminos.
7. Privacidad.
8. Premium.
9. FAQ.
10. CTA.

## Público inicial

- diseñadores;
- desarrolladores;
- freelancers;
- remotos;
- creadores;
- personas frente al ordenador.

---

# 34. Marketing

## Pilares

### Problema

Productividad sin castigo.

### Demostración

Foco → pausa → regreso.

### Construcción pública

Decisiones, glifos, pruebas.

### Identidad

Caminos, vaca, paisajes, filosofía.

## No hacer

- anuncios antes de retención;
- cinco redes;
- marketing genérico;
- lista de funciones;
- lanzamiento masivo sin beta.

## Métricas

- acción útil en 60 segundos;
- segunda sesión;
- retorno;
- aceptación de pausa;
- rutina repetida;
- feedback;
- Camino continuado;
- ritual guardado;
- interés Premium.

---

# 35. Priorización propuesta

## Fase 0 · Verificación

- web/repositorio;
- arquitectura;
- contenido;
- IDs;
- datos;
- tests;
- accesibilidad;
- seguridad.

## Fase 1 · Fundamentos de actividad

- IDs;
- visualId;
- modos;
- duración;
- lados;
- metadatos;
- alternativas;
- seguridad.

## Fase 2 · Seis pilotos

### Respira

- diafragmática;
- coherente 5·5.

### Mueve

- flexiones de escritorio;
- sentadilla a silla.

### Estira

- cuello;
- Antídoto silla sin suelo.

## Fase 3 · Camino piloto

- promesa;
- capítulos;
- progresión;
- repetición;
- check-in;
- ritual;
- visual;
- resumen.

## Fase 4 · Ciclo diario

- Pausa PACE;
- BreakMenu;
- feedback;
- sidebar;
- favoritos.

## Fase 5 · Estadísticas

- eventos;
- Hoy;
- Tu ritmo;
- patrones;
- notas.

## Fase 6 · Beta y landing

- usuarios;
- pruebas;
- métricas;
- vídeo;
- mensajes.

## Fase 7 · Móvil

- Capacitor;
- Android;
- iOS.

## Fase 8 · Expansión

- Travesías;
- IA;
- más Caminos;
- personalización.

---

# 36. Qué no hacer ahora

- No añadir más ejercicios.
- No añadir más Caminos.
- No implementar Travesías completas.
- No rediseñar toda la navegación.
- No reescribir en React Native.
- No añadir chat.
- No construir backend.
- No crear sync.
- No animar todos los glifos.
- No rehacer 46 ejercicios de golpe.
- No introducir estadísticas sin eventos.
- No vender Premium solo por cantidad.
- No publicar en tiendas antes de beta.
- No implementar sin revisar seguridad.

---

# 37. Decisiones que Claude debe preparar

1. ¿Qué cambios caben sin modificar la Home?
2. ¿Cómo evoluciona `BreakMenu`?
3. ¿Qué contiene la sidebar?
4. ¿Bibliotecas modales o pantallas?
5. ¿Modelo de pasos?
6. ¿Migración de datos?
7. ¿VisualId?
8. ¿Duraciones?
9. ¿Lados?
10. ¿Repeticiones?
11. ¿Qué seis pilotos?
12. ¿Qué ejercicios se reclasifican?
13. ¿Qué técnicas respiratorias son avanzadas?
14. ¿Qué claims cambian?
15. ¿Qué Camino es piloto?
16. ¿Qué Caminos son Senderos?
17. ¿Qué se reserva como Travesía?
18. ¿Qué es Free?
19. ¿Qué es Premium?
20. ¿Qué eventos guardar?
21. ¿Cuándo introducir audio?
22. ¿Cuándo empezar móvil?
23. ¿Qué ideas deben descartarse?

---

# 38. Entregable solicitado a Claude

Claude debe devolver, sin modificar código:

## A. Verificación

| Propuesta/hallazgo | Estado | Evidencia | Archivo |
|---|---|---|---|

## B. Auditoría de actividades

Una tabla por rutina:

- duración;
- modo;
- claridad;
- dificultad;
- requisitos;
- seguridad;
- alternativa;
- propuesta.

## C. Auditoría de Caminos

Una tabla por Camino:

- promesa;
- etapas;
- progresión;
- solapamiento;
- formato;
- resultado;
- cambios.

## D. Impacto UX

Para cada idea:

- pantalla afectada;
- menú;
- móvil;
- datos;
- riesgo;
- complejidad.

## E. Opciones

- conservadora;
- equilibrada;
- ambiciosa.

## F. Recomendación

Claude debe poder discrepar.

## G. Plan

Solo después de aprobar decisiones.

---

# 39. Conclusión de producto

El objetivo no es hacer PACE más grande.

El objetivo es pasar de:

> una aplicación atractiva con temporizador, actividades, Caminos y estadísticas

a:

> una experiencia coherente que acompaña el ciclo de foco, pausa, cuerpo y regreso.

El salto premium no consiste en añadir más.

Consiste en:

- explicar mejor;
- guiar mejor;
- adaptar mejor;
- conectar mejor;
- recordar mejor;
- cerrar mejor.

---
