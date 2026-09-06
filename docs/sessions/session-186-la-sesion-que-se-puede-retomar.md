# s186 · La sesión que se puede retomar, y el sitio donde vivirá CTB

**Fecha:** 2026-09-06 · **Versiones publicadas:** v0.116.0 y **v0.117.0** · **Suite:** 195 → **206**

> Tres encargos encadenados: la revisión de móvil que s185 dejó declarada sin
> hacer, la **reanudación de una sesión de Respira** —la primera prioridad del
> brief de s180, pendiente por escrito desde entonces— y el **prototipo de CTB**,
> que trajo consigo la pregunta de dónde vive.

---

## 0 · La revisión de móvil: no había regresión, y salió mejor de lo que entró

s185 declaró por escrito que nadie había mirado sus cambios en un teléfono. Se
miró, con el mismo instrumento de s184 (dos capturas del mismo fotograma con el
reloj congelado, apagando solo `[data-pace-sun]`):

| | 1280×800 (patrón) | 390×844 | 360×640 |
|---|---|---|---|
| Luz en la fila de minutos | 0/255 | **2,7** | 0 |
| Halo pegado al aro | 31,7 · medio 25 | 31,7 · 25 | 30,7 · 25 |
| Luz en ACTIVIDADES (media) | 1,1 | 0,9 | 0,9 |
| Tinta: número ↔ rótulos | 43 / 32 | 29 / 24,5 | 29 / 25,5 |
| Scroll vertical | 0 | 0 | 0 |

**Y el número salió mejor por accidente, cosa que conviene decir tal cual.** El
margen negativo del número es global (va en línea en `TimerDial.jsx`) pero la
compensación del subtítulo es solo de escritorio, así que en el teléfono el
número subió 8,6 px sin que el subtítulo bajara. Como el móvil partía
desequilibrado hacia abajo (~38/16), acabó en **29/24,5**. No fue una decisión.

**Trampa del instrumento, otra vez:** mi primera medida de tinta usó el promedio
de una ventana ancha y dio números que no reproducían. Se calibró **contra el
valor conocido de escritorio** (43/36 en s185) antes de creerse nada del móvil:
el instrumento corregido devuelve 43/32 ahí, y por eso sus números de móvil valen.

---

## 1 · Reanudar una sesión de Respira

La primera prioridad del brief de s180, que llevaba desde entonces **escrita como
deuda** en `Sidebar.selectors.js`: *«el runner todavía no persiste ronda ni fase.
Fingirlas sería prometer una reanudación que no existe»*.

Ahora la persiste, en **`pace.breathe.v1`** — clave aparte y fuera de
`pace.state.v2`, el mismo patrón que el Pomodoro desde s102.

**La decisión de producto está en lo que NO se guarda.** No se guarda la fase ni
el segundo dentro del ciclo: **nadie se reengancha a mitad de una inhalación que
no estaba haciendo**. Devolver a alguien al segundo 3 de una exhalación sería
fingir una continuidad que su cuerpo no tuvo. Lo que significa algo es la RONDA
—y en las rutinas sin rondas, el tiempo practicado—, y por eso al volver se entra
otra vez por la cuenta atrás de preparación.

- **No se acredita nada que no se haya presenciado** (línea s101/s102): el reloj
  de tiempo activo solo corre en 'active'/'hold' sin pausar, así que el rato fuera
  no suma; al volver **continúa** en vez de reiniciarse.
- **Caduca a las dos horas y dentro del mismo día.** Es un juicio declarado, no
  una medida: una sesión de respiración es un estado en el que estabas, no una
  tarea pendiente.
- **Se conserva al SALIR** —ahí está la diferencia con el Pomodoro—: salir es
  justo la interrupción que se quiere recuperar. Solo se borra al terminar.
- **Reanudar entra por la misma puerta que empezar** (`handleStartBreathe`), así
  que una rutina con apnea vuelve a pedir su modal de seguridad. Hay un mutante
  que lo defiende.

**El registro tiene una sola dueña**: el efecto de `useRespiraPersistencia`
escribe mientras la sesión vive y borra al llegar a 'done'. Ponerlo también en
`finish()` serían dos sitios haciendo lo mismo — que es el defecto que el banco de
mutaciones de s166 destapó con el reloj de retención: con las dos puestas, romper
cualquiera de ellas deja los asertos en verde.

**Y la regla §1 mordió por el camino:** `BreatheSession.jsx` llegó a **500 líneas
exactas**. El mapa de fases —que es dato, no lógica— se fue al `.support`, que es
literalmente para lo que ese archivo nació en s166. Queda en 483.

---

## 2 · El prototipo de CTB, y dónde vive

`docs/proposals/ctb-marea-baja.html` es el **entregable mínimo que el ROADMAP pide
antes de escribir código**: el guion de una sesión de 25 minutos y la pantalla que
la sostiene. La tercera pata —la pista musical— sigue sin existir.

**Tres pantallas pintadas a 390×844, el usuario eligió la B** («los cinco
tramos»): la forma que respira, el cue, y una columna con los cinco tramos del
guion con el actual encendido. Ninguna enseña el tiempo que queda —el ROADMAP pide
«timer silencioso»— y ninguna pone números en la retención.

**Dónde vive, respondido mirando el código:**

| Sitio | Veredicto |
|---|---|
| Una técnica más en la biblioteca | **Imposible**: una rutina tiene UN patrón (`rounds`, `coherent`, `co2`…) y Marea baja tiene cinco tramos |
| Un Camino de respiración | **Funciona hoy** — `PathBreatheStep` ya encadena rutinas—, pero la pantalla es la de pasos y rompe la inmersión. Queda como atajo para probar el guion |
| **Un estante propio: «Viajes»** | **Recomendado.** Ya está escrito en la Fase 5 (*«separar Técnicas de Viajes»*), así que la separación entra en v1 mientras el contenido CTB se queda fuera |

---

## 3 · El censo de adaptación, y por qué dos ideas no eran lo que parecían

El usuario pasó siete referencias y de ellas salieron tres candidatas a
implementar. Medirlas cambió dos:

**`scripts/audit/censo-adaptacion-s186.js`** carga los catálogos de verdad y
cuenta. Lo que dice:

- **31 rutinas · 100 % declaran los cinco metadatos** (posición, equipo, suelo,
  intensidad, nivel). **0 de 129 ejercicios los declaran.**
- **19 pasos de descanso · solo 6 son `restKind: 'betweenSets'`**; los otros 13 son
  cierres respiratorios que s114 dice no tocar.

De ahí: **«cambiar un ejercicio a mitad»** no se puede decidir con datos —la
posición y la intensidad las declara la RUTINA, no el ejercicio—, así que ofrecer
un sustituto con criterio exige anotar 129 ejercicios: **contenido, no código**.
Y **«alargar el descanso»** se aplicaría hoy a seis sitios, no a todo el catálogo.
Saltar ya se puede en los dos casos.

**El censo se equivocó primero, y por la razón de siempre:** buscó los metadatos
en el PASO y devolvió «0 de 87», que parecía un catálogo vacío. Están en la
RUTINA. Es la misma clase de error que dejó ciego a Estira en s178 — medir el
objeto equivocado y creerse el número.

**Y el recordatorio de agua tiene el dato pero no la entrega**: `water.goal`,
`water.today` y `waterGoalDates` ya existen, pero **una PWA no puede disparar un
aviso con la app cerrada sin un servidor de push**, y este producto es
offline-first con licencia offline. En web solo cabe un aviso in-app; el de verdad
llega con Capacitor (Fase 9). De regalo, un cadáver: **`state.reminders: []` sigue
en el estado desde v0.11.6**, cuando se retiró su sección del sidebar.

---

## 4 · El estante de Viajes, construido (v0.117.0)

Lo que la Fase 5 pide con esas palabras — «separar Tecnicas de Viajes» — puesto.

**La decision es donde vive el dato, no como se pinta.** Los viajes llegan a
`LibraryShell` por **su propia prop**, desde `window.BREATHE_VIAJES`, y **nunca
entran en `todas`**. De ahi salen gratis las tres reglas que un viaje necesita:

| Regla | De donde sale |
|---|---|
| El filtro «≤ 5 min» no los cuenta | No estan en el catalogo que cuenta |
| «Para ahora» no los propone | Se calcula sobre ese mismo catalogo |
| No compiten en el orden de los grupos | No son un grupo |

Escritas como excepciones habrian sido **tres sitios que recordar** cada vez que
alguien toca las reglas de la biblioteca. Asi no hay nada que recordar.

**La lista esta vacia a proposito** y sin viajes no se pinta ni la cabecera, que
es la misma regla que ya gobierna los grupos vacios. Entra el sitio; el contenido
CTB sigue fuera de la v1.

### El agujero de premium que aun no existia

`canAccessRoutine` resuelve el id con `getBreatheRoutine` y es **fail-open** con
los que no conoce — por diseno, y con razon: «no es trabajo del guard bloquear
ids que no existen». Pero un viaje `access: 'premium'` **no habria estado en
ningun catalogo**, asi que el guard habria dicho «adelante» y el viaje se habria
abierto gratis. Se ve en la primera captura: la tarjeta decia «Premium» y no
«Pronto», al reves que las tecnicas de pago. `getBreatheRoutine` busca ahora
tambien en los viajes, con su mutante en rojo.

### Un mutante que NO muerde, y su razon

Meter los viajes en `todas` **no cambia nada en pantalla**: ese `useMemo` depende
de `[groups]` y se calcula al arrancar la app, cuando `window.BREATHE_VIAJES`
todavia esta vacia, y nunca se recalcula. Asi que los asertos «los chips no los
cuentan» y «Para ahora no los propone» son **guardias de un refactor futuro, no
pruebas** — y no cazarian a alguien que escribiera un viaje directamente en
`BREATHE_ROUTINES`, porque ese catalogo es un `const` que no se alcanza desde la
pagina. **Lo que sostiene la regla es la estructura**, y eso esta escrito en la
cabecera del spec para que nadie lea mas de lo que hay.

### La tarjeta, elegida mirandola (v0.117.1)

Nacio en negro y el usuario pidio otra cosa. Se pintaron **19 variantes sobre la
app de verdad** —terracotas, tres olivas, tabaco, pizarra calida, el azul de
Hidratate, lavados, y el dibujo del modulo en seis tamanos y posiciones— **con el
contraste medido en cada una**, porque el cuerpo de la tarjeta es de 13 px y por
debajo de 4,5:1 una opcion bonita deja de ser una opcion. El terracota puro sobre
crema se queda en **2,80:1**: el naranja «tal cual» nunca fue viable.

Gano el lavado con **los pulmones del modulo sangrando por el borde derecho**. Lo
que lo decidio no fue el color: el negro distinguia pero **no decia de quien era
el viaje**, y el dibujo dice las dos cosas a la vez. Y hay un argumento de sistema
que descarto los verdes por bonitos que fueran: en PACE **cada modulo tiene su
color**, asi que un fondo verde dentro de la biblioteca de Respira dice «esto es
de Foco» a quien ya aprendio el codigo.

**Dos detalles que no son esteticos.** El lavado se compone con TOKENS
—`--breathe-soft` sobre `--paper-2`— y no con un hex: con un color a fuego, en la
paleta oscura habria quedado un bloque claro deslumbrando. Y el contraste ahora
**se mide en la pagina**, un test por paleta, con los colores computados: su
mutante —subir el lavado al `--breathe` entero— pone rojas las dos.

**Y la trampa del backtick se cobro otra pasada**: un comentario nuevo dentro del
template literal de `library.css.jsx` aborto el build. Ese archivo lleva el aviso
en su propia ficha y van tres veces.

---

## La red

| Añadido | Qué defiende |
|---|---|
| **5 tests** en `tests/respira-reanudar.spec.js` | Que el registro exista con la ronda y el tiempo, que desaparezca al terminar, que la sidebar lo ofrezca, que reanudar pase por el modal de seguridad y entre en SU ronda, y que caduque |
| Aserto del **conjunto exacto de claves** del registro | Que nadie meta la fase ahí dentro: `expect(Object.keys(g).sort())` |
| `scripts/audit/censo-adaptacion-s186.js` | Que «cambiar un ejercicio» no se prometa antes de que el dato exista |

**Mutantes calibrados en rojo (6):** no escribir nunca · no borrar al terminar ·
sin rama en la sidebar · ignorar el registro al arrancar · sin ventana de
caducidad · reanudar saltándose el modal. Los seis muerden, y la restauración fue
por `cp` — nunca `git checkout`, que es lo que ayer borró nueve horas de trabajo.

## Lo que NO cubre

- **Móvil en la reanudación**: los cinco tests corren a tamaño de escritorio.
- **El estante «Viajes» no existe todavía**: está pintado y decidido, no construido.
- La reanudación **no cubre Mueve ni Estira**, que tienen su propio runner.
