# Auditoría Fase 2 · Mueve y Estira — matriz §19.2

> **Fecha:** 2026-07-30 · **Base auditada:** v0.73.1 · **Sesión:** 141
> **Encargo:** ROADMAP «Camino a v1.0» → FASE 2, que arranca por auditoría **sin tocar código**.
> **Entregable:** la matriz §19.2 de `AUDITORIA_SISTEMA_PACE.md` (Ejercicio · Existe · Aprobado ·
> Revisar · Placeholder · Alias · Una pose · Dos poses · Flecha · Apoyo · Zona corporal · Revisión
> técnica) más las dos columnas que pide el ROADMAP: **idioma del nombre** y **nivel/intensidad
> declarados**.
> **No re-audita** el ejercicio a ejercicio de s109 ([`audit-b2-ejercicios-v0.53.0.md`](./audit-b2-ejercicios-v0.53.0.md)),
> que sigue vigente para dosis, duración y estructura. Esto mira **identidad visual, nombre y
> metadatos**, que es lo que el feedback beta puso por delante.

---

## 0 · Método

Nada de contar a ojo. Los datos salen de cargar los archivos del árbol con el **mismo Babel del
build** sobre un `window` falso, y de parsear los glifos como texto:

| Fuente | Qué aporta |
|---|---|
| `app/move/move.data.js` (`MOVE_ROUTINES`) | 14 rutinas de Mueve |
| `app/extra/ExtraModule.jsx` (`EXTRA_ROUTINES`) | 14 rutinas de Estira — es `const`, no sale a `window`: hay que pedirlo por expresión |
| `app/glyphs/exercise-glyphs.jsx` | las 47 claves de glifo + el comentario que describe cada dibujo |
| `app/custom/exercise-aliases.js` (`VISUAL_ALIAS`) | 4 alias de identidad visual |
| `app/custom/exercise-registry.js` | 65 ejercicios del registro del constructor |

**Reproducible**: los tres scripts viven en **`scripts/audit/`** (`inventario.js` → `glifos.js` →
`matriz.js`, encadenados por sus `.json`). Las olas B y C van a re-medir varias veces; que la
matriz se regenere con un comando evita que vuelva a haber cifras contadas a ojo.

**Dos correcciones al propio método**, anotadas porque cambiaron cifras: el nombre
`"World's greatest stretch"` usa comillas **dobles** por el apóstrofo y una regex de solo-simples
lo daba por inexistente (se detectó al cruzar 47 claves reales contra 46 parseadas); y las columnas
**poses / flecha / apoyo** salen de los comentarios del propio archivo de glifos y del recuento de
«cabezas» (círculos de radio ≈2), o sea **heurística declarada**: prellenan la matriz para que el
usuario corrija, no deciden por él.

---

## 1 · Las cuatro premisas del plan, contrastadas

El orden de fases se fijó en s132 sobre cuatro mediciones. **Tres no reproducen contra el árbol de
hoy**, y una de ellas apunta a un problema **mayor**, no menor:

| Premisa (s132 · ROADMAP) | Medido en v0.73.1 | Veredicto |
|---|---|---|
| «**92 nombres** de paso distintos» | **65** nombres únicos (117 pasos con nombre, 133 contando descansos). Ni sumando módulos por separado y duplicando los 9 compartidos (74) sale 92 | **no reproduce** |
| «34 de 93 (**37 %**) llevan término inglés» | **36 de 65 = 55 %** | **peor de lo que decía** |
| «46 glifos para 92 nombres ⇒ **la mitad** cae en `DefaultGlyph`» | 47 glifos, **45 nombres cubiertos**, **20 sin glifo = 31 %** | **mejor de lo que decía** |
| «`level`/`intensity` declarados **44 veces** sin consumidor» | Están en la **RUTINA**, nunca en el paso: **22 de 28 rutinas**; **0 de 65 pasos**. Sin consumidor UI: **confirmado** | matiz importante |

**Consecuencia para el trabajo**: el bloque de glifos es **un tercio más pequeño** de lo previsto
(20 dibujos, no ~46) y el de nombres es **la mitad más grande** (36, no 34 sobre una base mayor). El
orden de la Fase 2 no cambia —sigue siendo el frente correcto—, pero el reparto de esfuerzo sí.

---

## 2 · Glifos: son DOS problemas, no uno

El plan los trataba como una sola bolsa («la cola D-4, 35 glifos pendientes»). Son dos, y se
resuelven distinto:

| | Cuántos | Qué falta | Efecto hoy |
|---|---|---|---|
| **No existen** | **20** | dibujarlos | caen a `DefaultGlyph`: el paso se ve genérico |
| **Existen sin aprobar** | **15** | que el usuario cierre la iteración (regla s84: se portan literales) | se ven, pero son los que él llama «flojos» |

Suman los 35 de la deuda D-4 y **encajan exactamente** con su desglose: los 20 que no existen son
los 11 de s91/F5 más los 9 de s92/F6; los 15 restantes son los de s84, que sí están dibujados.

**Un glifo huérfano de verdad**: `Nordics` está definido y **ningún paso lo usa** — o falta el
ejercicio, o sobra el dibujo (decisión de catálogo). `Reset respiración` también aparece sin uso
directo, pero **no lo es**: es el destino del alias `Deep breaths` en `VISUAL_ALIAS`, o sea la
identidad visual de esos pasos. Los alias hay que resolverlos antes de declarar nada huérfano.

**`window.APPROVED` no existe en el árbol.** Es un concepto de las decisiones de s84 que nunca llegó
a código, así que hoy la única frontera real es *tener entrada en `EXERCISE_GLYPHS`*. Las columnas
«Aprobado / Revisar / Placeholder» de la §19.2 **no se pueden derivar del código**: la matriz trae
la versión anotada en el comentario (`v3`, `ALT`, `s60`…) como mejor aproximación — 28 de 47 la
llevan, y `s60` marca los que siguen en estado canónico antiguo.

---

## 3 · Los glifos no pueden explicar la técnica (evidencia para §19.3)

La §19.3 propone separar **glifo identificativo** (44×44) de **diagrama de ejecución** (grande, en
el runner). Los números del set actual dicen que hoy se le está pidiendo al pequeño lo que no puede
dar:

| Recurso del dibujo | Cuántos de 47 |
|---|---|
| **Dos poses** (dos figuras: origen y destino del movimiento) | **6** |
| **Flecha** de dirección | **5** |
| **Apoyo** visible (pared, mesa, silla, suelo) | **9** |

O sea: **41 de 47 glifos enseñan una sola postura estática, sin dirección**. Para «Círculos de
tobillo» basta; para «World's greatest stretch» o «Ground sitting transitions», no. Esto es la
respuesta directa al «no está claro cómo hacer exactamente el ejercicio» del feedback beta, y
sostiene que el trabajo **no es redibujar 47 glifos**, sino añadir el segundo nivel visual.

---

## 4 · Nombres: 36 de 65 llevan inglés (55 %)

Cuatro son **mixtos**, que es lo que peor lee: `Hang pasivo` · `Hang activo` · `Squat profundo` ·
`Rib pull + respiración`.

**El riesgo de renombrar está medido y es real**: `step.name` en español ES la clave del glifo
(`EXERCISE_GLYPHS`) y la de la i18n del constructor (`custom.ex.<name>.*`). Renombrar sin tocar
las tres cosas en el mismo cambio hace que el glifo caiga a `DefaultGlyph` **en silencio** —
decisión s108, y por eso la §19.2 exige tener el mapa completo antes de la primera ola.

De los 20 sin glifo, **4 llevan inglés** (`Couch stretch` · `Hang activo` · `Hollow hold` ·
`Superman`): renombrarlos no cuesta glifo, porque no hay clave que romper ⇒ **primera ola natural**.
Los **32 restantes** sí tienen glifo y exigen el cambio coordinado.

**Aviso que sale al mirarlos uno a uno**: dos de esos cuatro tienen **pareja con glifo** en el
catálogo — `Hang activo` ↔ `Hang pasivo` y `Hollow hold` ↔ `Seated hollow`. Renombrar solo la mitad
sin glifo dejaría «Suspensión activa» al lado de «Hang pasivo» en la misma biblioteca, que es peor
que no tocarlo. Las parejas se renombran **juntas**, aunque eso meta 2 claves de glifo en la ola A.

---

## 5 · Metadatos y contrato

- **`level` / `intensity`**: 22 de 28 rutinas los declaran (`accessible`/`intermediate` ·
  `gentle`/`moderate`/`strong`), **ningún paso**. Ningún consumidor en la UI: confirmado. Las 6
  rutinas sin metadatos son exactamente las 6 legacy bloqueadas.
- **Contrato v1**: de los 65 nombres, **15 aparecen solo en pasos legacy** y **10 en ambos**
  (mismo ejercicio migrado en una rutina y no en otra). Coherente con las 6 rutinas legacy que
  s121 dejó bloqueadas por trabajo editorial, no mecánico.

---

## 6 · Hallazgos sueltos que conviene decidir

1. **`Descanso` es un nombre de ejercicio con glifo propio** en una rutina de Mueve, en vez de un
   paso `mode:'rest'`. Descuadra cualquier recuento de ejercicios y se cuela en el registro visual.
2. **`90/90`** es un nombre de ejercicio que es un par de números; aparece en 3 rutinas. Funciona
   como clave, pero no dice nada a quien no conoce la postura.
3. **9 ejercicios viven en los dos módulos** (`Hang pasivo`, `Finger extension`, `Wrist stretch`,
   `ATG split squat`, `Sissy squat`, `Chin tucks`, `Thoracic extension`, `Band pull-apart`,
   `Apertura de pecho`). No es un error —Mueve y Estira comparten cubo de stats desde s101— pero
   explica por qué contar «nombres por módulo» daba 74 en vez de 65.

---

## 7 · Olas propuestas (a decidir por el usuario)

Salen de la matriz, no al revés. Orden pensado para que **ninguna rompa una clave**:

| Ola | Qué | Tamaño | Por qué primero |
|---|---|---|---|
| **A** | Renombrar los **4 sin glifo y con inglés** + sus **2 parejas** | 6 nombres | solo 2 tocan clave de glifo: coste mínimo, resultado visible |
| **B** | Los **20 dibujos que faltan** | 20 glifos | quita el `DefaultGlyph` de la vista; el usuario los itera y se portan literales (s84) |
| **C** | Renombrar los **restantes con inglés** | ~30 nombres × 3 sitios | exige el cambio coordinado `name` + glifo + i18n (s108), con verificación en runtime |
| **D** | **Segundo nivel visual** (§19.3) | diagrama de ejecución | es lo que responde al «no sé cómo hacerlo»; se apoya en B |
| **E** | **Consumir `level`/`intensity`** + separar intensidad de nivel técnico | UI | los datos ya existen en 22 rutinas |

Las 6 rutinas legacy y su ola editorial siguen donde s121 las dejó: bloqueadas por reescritura, no
por mecánica.

---

## 8 · Matriz §19.2 completa

Leyenda — **Glifo**: `sí` existe entrada en `EXERCISE_GLYPHS`, `NO` cae a `DefaultGlyph` ·
**Poses/Flecha/Apoyo**: heurística sobre el dibujo y su comentario (§0) · **Iter**: versión anotada
en el comentario; `s60` = canónico antiguo sin aprobar · **Contrato**: `v1`, `legacy` o `mixto`
(aparece de las dos formas según la rutina). Ordenada con los **sin glifo primero**.

| Ejercicio | Glifo | Vía | Poses | Flecha | Apoyo | Iter | Inglés | Zona corporal | Módulo | Rut. | Contrato |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Apretar glúteos | **NO** |  | — | — | — | — | · | Sigilo | Mueve | 1 | v1 |
| Círculos de hombro | **NO** |  | — | — | — | — | · | Hombros y columna | Estira | 1 | v1 |
| Couch stretch | **NO** |  | — | — | — | — | sí | Caderas y piernas | Estira | 1 | v1 |
| Gato-camello | **NO** |  | — | — | — | — | · | Hombros y columna / Flujos | Estira | 2 | v1 |
| Hang activo | **NO** |  | — | — | — | — | sí | Empuje y tracción | Mueve | 1 | v1 |
| Hollow hold | **NO** |  | — | — | — | — | sí | Espalda y core | Mueve | 1 | v1 |
| Isquio a una pierna | **NO** |  | — | — | — | — | · | Caderas y piernas | Estira | 1 | v1 |
| Onda espinal | **NO** |  | — | — | — | — | · | Hombros y columna | Estira | 1 | v1 |
| Palmas al suelo | **NO** |  | — | — | — | — | · | Oficina | Estira | 1 | v1 |
| Pica en escritorio | **NO** |  | — | — | — | — | · | Empuje y tracción | Mueve | 1 | legacy |
| Plancha | **NO** |  | — | — | — | — | · | Espalda y core | Mueve | 1 | v1 |
| Plancha lateral | **NO** |  | — | — | — | — | · | Espalda y core | Mueve | 1 | v1 |
| Pliegue adelante | **NO** |  | — | — | — | — | · | Caderas y piernas | Estira | 1 | v1 |
| Puente torácico | **NO** |  | — | — | — | — | · | Hombros y columna | Estira | 1 | v1 |
| Rana | **NO** |  | — | — | — | — | · | Caderas y piernas | Estira | 1 | legacy |
| Rezo invertido | **NO** |  | — | — | — | — | · | Oficina | Estira | 1 | v1 |
| Rodar hacia abajo | **NO** |  | — | — | — | — | · | Hombros y columna | Estira | 1 | v1 |
| Sentadilla a silla | **NO** |  | — | — | — | — | · | Piernas | Mueve | 1 | v1 |
| Sentadilla búlgara | **NO** |  | — | — | — | — | · | Piernas | Mueve | 1 | legacy |
| Superman | **NO** |  | — | — | — | — | sí | Espalda y core | Mueve | 1 | v1 |
| 90/90 | sí |  | 1 | · | · | ALT | · | Caderas y piernas | Estira | 3 | mixto |
| Ankle circles | sí |  | 1 | · | · | s60 | sí | Oficina | Estira | 1 | legacy |
| Apertura de pecho | sí |  | 1 | · | · | V8 | · | Espalda y core / Oficina / Hombros y columna / Flujos | Mueve+Estira | 4 | v1 |
| ATG split squat | sí |  | 1 | · | · | s60 | sí | Piernas / Caderas y piernas | Mueve+Estira | 2 | legacy |
| Band pull-apart | sí |  | 2 | · | · | NEW | sí | Espalda y core / Hombros y columna | Mueve+Estira | 3 | v1 |
| Calf raises | sí |  | 1 | sí | · | ALT | sí | Sigilo / Piernas | Mueve | 3 | mixto |
| Chest opener | sí |  | 1 | sí | · | NEW | sí | Espalda y core | Mueve | 1 | v1 |
| Chin tucks | sí |  | 1 | · | · | V8 | sí | Espalda y core / Oficina | Mueve+Estira | 3 | mixto |
| Cossack squat | sí |  | 1 | · | · | s60 | sí | Caderas y piernas | Estira | 2 | mixto |
| Crawling | sí |  | 1 | · | · | s60 | sí | Flujos | Estira | 1 | legacy |
| Cuello y trapecios | sí |  | 1 | · | · | V6 | · | Oficina / Flujos | Estira | 2 | v1 |
| Dead hang · opcional | sí |  | 2 | · | sí | NEW | sí | Hombros y columna | Estira | 1 | v1 |
| Deep breaths | sí |  | 1 | sí | · | NEW | sí | Oficina | Estira | 1 | legacy |
| Deep squat hold | sí |  | 1 | · | · | s60 | sí | Flujos | Estira | 1 | legacy |
| Descanso | sí |  | 1 | · | · | NEW | · | Empuje y tracción / Piernas | Mueve | 2 | legacy |
| Elephant walk | sí |  | 1 | · | sí | V7 | sí | Caderas y piernas | Estira | 2 | mixto |
| Escalenos | sí |  | 1 | · | · | s60 | · | Oficina | Estira | 1 | v1 |
| External rotation | sí |  | 1 | · | · | ALT | sí | Hombros y columna | Estira | 2 | v1 |
| Finger extension | sí |  | 1 | · | · | V9 | sí | Sigilo / Oficina | Mueve+Estira | 2 | v1 |
| Flexiones inclinadas | sí |  | 1 | · | sí | v0 | · | Empuje y tracción | Mueve | 2 | mixto |
| Flexor de cadera | sí |  | 1 | · | · | V8 | · | Oficina / Caderas y piernas | Estira | 2 | v1 |
| Fondos en silla | sí |  | 1 | · | sí | s60 | · | Empuje y tracción | Mueve | 1 | v1 |
| Ground sitting transitions | sí |  | 2 | · | · | s60 | sí | Caderas y piernas / Flujos | Estira | 2 | legacy |
| Hang pasivo | sí |  | 2 | · | sí | ALT | sí | Empuje y tracción / Flujos | Mueve+Estira | 2 | mixto |
| Inclinación lateral | sí |  | 1 | · | · | s60 | · | Oficina | Estira | 1 | v1 |
| Pigeon | sí |  | 1 | · | · | s60 | sí | Caderas y piernas | Estira | 2 | v1 |
| Puente con marcha | sí |  | 1 | · | · | NEW | · | Caderas y piernas | Estira | 3 | v1 |
| Puente isquio a una pierna | sí |  | 1 | · | · | s60 | · | Caderas y piernas | Estira | 1 | legacy |
| Rib pull + respiración | sí |  | 1 | · | · | s60 | sí | Flujos | Estira | 1 | legacy |
| Rotación lenta | sí |  | 1 | · | · | s60 | · | Oficina | Estira | 1 | v1 |
| Rotación torácica | sí |  | 1 | · | · | NEW | · | Oficina / Hombros y columna / Flujos | Estira | 3 | v1 |
| Scapular squeeze | sí |  | 1 | · | · | NEW | sí | Espalda y core | Mueve | 2 | v1 |
| Scapular wall slides | sí |  | 1 | · | sí | V8 | sí | Hombros y columna | Estira | 1 | v1 |
| Seated hollow | sí |  | 1 | · | · | V5 | sí | Sigilo | Mueve | 1 | v1 |
| Seated twist | sí |  | 1 | · | sí | s60 | sí | Oficina | Estira | 1 | legacy |
| Shrug + round | sí |  | 1 | sí | · | V12 | sí | Oficina / Hombros y columna | Estira | 2 | mixto |
| Sissy squat | sí |  | 2 | · | · | s60 | sí | Piernas / Caderas y piernas | Mueve+Estira | 2 | legacy |
| Squat profundo | sí |  | 1 | · | · | ALT | sí | Caderas y piernas / Flujos | Estira | 3 | mixto |
| Squeeze fist | sí |  | 1 | · | · | V9 | sí | Sigilo | Mueve | 1 | v1 |
| Thoracic extension | sí |  | 1 | · | · | NEW | sí | Espalda y core / Hombros y columna | Mueve+Estira | 2 | v1 |
| Tibialis raise | sí |  | 1 | · | sí | s60 | sí | Caderas y piernas | Estira | 1 | legacy |
| Wall sit | sí |  | 1 | · | sí | NEW | sí | Piernas | Mueve | 1 | v1 |
| World's greatest stretch | sí |  | 1 | · | · | s60 | sí | Oficina | Estira | 1 | v1 |
| Wrist circles | sí |  | 1 | · | · | s60 | sí | Oficina | Estira | 2 | mixto |
| Wrist stretch | sí |  | 1 | · | · | V5 | sí | Sigilo / Oficina | Mueve+Estira | 2 | v1 |

---

## 9 · Ola A — EJECUTADA en esta misma sesión (v0.74.0)

Renombrados **5 nombres** (los 4 con inglés y sin glifo, menos `Superman`, más las 2 parejas):

| Antes | Ahora | ¿Tenía glifo? |
|---|---|---|
| `Hang pasivo` | **Suspensión pasiva** | sí (clave renombrada) |
| `Hang activo` | **Suspensión activa** | no |
| `Hollow hold` | **Hueco abdominal** | no |
| `Seated hollow` | **Hueco en silla** | sí (clave renombrada) |
| `Couch stretch` (paso) | **Cuádriceps en pared** | no |
| `Couch stretch` (rutina) | **Estiramiento del sofá** | — |

**`Superman` se queda**, y es una decisión, no un olvido: es un nombre propio que en español se entiende
igual, y el problema que reportaron los beta testers eran términos que **no se pueden leer** (`Chin
tucks`, `Dead hang`, `Scapular squeeze`). Cambiarlo por «Extensión boca abajo» chocaría además con
`Apertura de pecho`, que va en la misma rutina. Queda a criterio del usuario.

### Lo que apareció al ejecutarla, y que la §19.2 no preveía

**El renombrado tiene una tercera pata además de glifo e i18n: `localStorage`.** El constructor
**copia el nombre** del ejercicio dentro de la rutina propia que guarda (`state-custom.jsx`:
`steps: [{ name, dur, cue }]`), así que una rutina creada antes del cambio sigue pidiendo el nombre
viejo y se quedaría sin glifo **en silencio** — exactamente lo que s108 prohíbe, pero por una vía
que la decisión no contemplaba.

Se resuelve con la pieza que ya existe: **`VISUAL_ALIAS`**, cuyo contrato es «el nombre viejo se
absorbe en la identidad nueva» (s110). Las 5 entradas nuevas hacen que las rutinas guardadas
resuelvan al ejercicio renombrado, y cuando la ola B dibuje los glifos que faltan, **las rutinas
antiguas los heredan solas**. En `content/custom.js` se conservan además las claves viejas, porque
la clave ES el nombre español y en inglés esas rutinas verían texto español.

**Verificado en runtime** tras purgar SW y cachés: los 5 nombres nuevos resuelven, los 2 que tenían
glifo lo conservan, los 5 nombres viejos llegan a la identidad nueva por alias, el inglés sigue
diciendo `Hollow hold` / `Passive hang` / `Couch stretch` (correcto: el inglés no se traduce al
español), y el recuento total no se mueve: **65 nombres antes y después, 20 sin glifo antes y
después** — ninguna clave caída.

**Efecto en la cifra que abrió la Fase 2**: nombres con término inglés **36 → 31** (de 55 % a 48 %).

---

## 10 · Matriz §19.2 — estado tras la ola A

Misma leyenda que arriba. Regenerable con `node scripts/audit/inventario.js > inventario.json`,
`node scripts/audit/glifos.js > glifos.json` y `node scripts/audit/matriz.js`.

| Ejercicio | Glifo | Vía | Poses | Flecha | Apoyo | Iter | Inglés | Zona corporal | Módulo | Rut. | Contrato |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Apretar glúteos | **NO** |  | — | — | — | — | · | Sigilo | Mueve | 1 | v1 |
| Círculos de hombro | **NO** |  | — | — | — | — | · | Hombros y columna | Estira | 1 | v1 |
| Cuádriceps en pared | **NO** |  | — | — | — | — | · | Caderas y piernas | Estira | 1 | v1 |
| Gato-camello | **NO** |  | — | — | — | — | · | Hombros y columna / Flujos | Estira | 2 | v1 |
| Hueco abdominal | **NO** |  | — | — | — | — | · | Espalda y core | Mueve | 1 | v1 |
| Isquio a una pierna | **NO** |  | — | — | — | — | · | Caderas y piernas | Estira | 1 | v1 |
| Onda espinal | **NO** |  | — | — | — | — | · | Hombros y columna | Estira | 1 | v1 |
| Palmas al suelo | **NO** |  | — | — | — | — | · | Oficina | Estira | 1 | v1 |
| Pica en escritorio | **NO** |  | — | — | — | — | · | Empuje y tracción | Mueve | 1 | legacy |
| Plancha | **NO** |  | — | — | — | — | · | Espalda y core | Mueve | 1 | v1 |
| Plancha lateral | **NO** |  | — | — | — | — | · | Espalda y core | Mueve | 1 | v1 |
| Pliegue adelante | **NO** |  | — | — | — | — | · | Caderas y piernas | Estira | 1 | v1 |
| Puente torácico | **NO** |  | — | — | — | — | · | Hombros y columna | Estira | 1 | v1 |
| Rana | **NO** |  | — | — | — | — | · | Caderas y piernas | Estira | 1 | legacy |
| Rezo invertido | **NO** |  | — | — | — | — | · | Oficina | Estira | 1 | v1 |
| Rodar hacia abajo | **NO** |  | — | — | — | — | · | Hombros y columna | Estira | 1 | v1 |
| Sentadilla a silla | **NO** |  | — | — | — | — | · | Piernas | Mueve | 1 | v1 |
| Sentadilla búlgara | **NO** |  | — | — | — | — | · | Piernas | Mueve | 1 | legacy |
| Superman | **NO** |  | — | — | — | — | sí | Espalda y core | Mueve | 1 | v1 |
| Suspensión activa | **NO** |  | — | — | — | — | · | Empuje y tracción | Mueve | 1 | v1 |
| 90/90 | sí |  | 1 | · | · | ALT | · | Caderas y piernas | Estira | 3 | mixto |
| Ankle circles | sí |  | 1 | · | · | s60 | sí | Oficina | Estira | 1 | legacy |
| Apertura de pecho | sí |  | 1 | · | · | V8 | · | Espalda y core / Oficina / Hombros y columna / Flujos | Mueve+Estira | 4 | v1 |
| ATG split squat | sí |  | 1 | · | · | s60 | sí | Piernas / Caderas y piernas | Mueve+Estira | 2 | legacy |
| Band pull-apart | sí |  | 2 | · | · | NEW | sí | Espalda y core / Hombros y columna | Mueve+Estira | 3 | v1 |
| Calf raises | sí |  | 1 | sí | · | ALT | sí | Sigilo / Piernas | Mueve | 3 | mixto |
| Chest opener | sí |  | 1 | sí | · | NEW | sí | Espalda y core | Mueve | 1 | v1 |
| Chin tucks | sí |  | 1 | · | · | V8 | sí | Espalda y core / Oficina | Mueve+Estira | 3 | mixto |
| Cossack squat | sí |  | 1 | · | · | s60 | sí | Caderas y piernas | Estira | 2 | mixto |
| Crawling | sí |  | 1 | · | · | s60 | sí | Flujos | Estira | 1 | legacy |
| Cuello y trapecios | sí |  | 1 | · | · | V6 | · | Oficina / Flujos | Estira | 2 | v1 |
| Dead hang · opcional | sí |  | 2 | · | sí | NEW | sí | Hombros y columna | Estira | 1 | v1 |
| Deep breaths | sí |  | 1 | sí | · | NEW | sí | Oficina | Estira | 1 | legacy |
| Deep squat hold | sí |  | 1 | · | · | s60 | sí | Flujos | Estira | 1 | legacy |
| Descanso | sí |  | 1 | · | · | NEW | · | Empuje y tracción / Piernas | Mueve | 2 | legacy |
| Elephant walk | sí |  | 1 | · | sí | V7 | sí | Caderas y piernas | Estira | 2 | mixto |
| Escalenos | sí |  | 1 | · | · | s60 | · | Oficina | Estira | 1 | v1 |
| External rotation | sí |  | 1 | · | · | ALT | sí | Hombros y columna | Estira | 2 | v1 |
| Finger extension | sí |  | 1 | · | · | V9 | sí | Sigilo / Oficina | Mueve+Estira | 2 | v1 |
| Flexiones inclinadas | sí |  | 1 | · | sí | v0 | · | Empuje y tracción | Mueve | 2 | mixto |
| Flexor de cadera | sí |  | 1 | · | · | V8 | · | Oficina / Caderas y piernas | Estira | 2 | v1 |
| Fondos en silla | sí |  | 1 | · | sí | s60 | · | Empuje y tracción | Mueve | 1 | v1 |
| Ground sitting transitions | sí |  | 2 | · | · | s60 | sí | Caderas y piernas / Flujos | Estira | 2 | legacy |
| Hueco en silla | sí |  | 1 | · | · | V5 | · | Sigilo | Mueve | 1 | v1 |
| Inclinación lateral | sí |  | 1 | · | · | s60 | · | Oficina | Estira | 1 | v1 |
| Pigeon | sí |  | 1 | · | · | s60 | sí | Caderas y piernas | Estira | 2 | v1 |
| Puente con marcha | sí |  | 1 | · | · | NEW | · | Caderas y piernas | Estira | 3 | v1 |
| Puente isquio a una pierna | sí |  | 1 | · | · | s60 | · | Caderas y piernas | Estira | 1 | legacy |
| Rib pull + respiración | sí |  | 1 | · | · | s60 | sí | Flujos | Estira | 1 | legacy |
| Rotación lenta | sí |  | 1 | · | · | s60 | · | Oficina | Estira | 1 | v1 |
| Rotación torácica | sí |  | 1 | · | · | NEW | · | Oficina / Hombros y columna / Flujos | Estira | 3 | v1 |
| Scapular squeeze | sí |  | 1 | · | · | NEW | sí | Espalda y core | Mueve | 2 | v1 |
| Scapular wall slides | sí |  | 1 | · | sí | V8 | sí | Hombros y columna | Estira | 1 | v1 |
| Seated twist | sí |  | 1 | · | sí | s60 | sí | Oficina | Estira | 1 | legacy |
| Shrug + round | sí |  | 1 | sí | · | V12 | sí | Oficina / Hombros y columna | Estira | 2 | mixto |
| Sissy squat | sí |  | 2 | · | · | s60 | sí | Piernas / Caderas y piernas | Mueve+Estira | 2 | legacy |
| Squat profundo | sí |  | 1 | · | · | ALT | sí | Caderas y piernas / Flujos | Estira | 3 | mixto |
| Squeeze fist | sí |  | 1 | · | · | V9 | sí | Sigilo | Mueve | 1 | v1 |
| Suspensión pasiva | sí |  | 2 | · | sí | ALT | · | Empuje y tracción / Flujos | Mueve+Estira | 2 | mixto |
| Thoracic extension | sí |  | 1 | · | · | NEW | sí | Espalda y core / Hombros y columna | Mueve+Estira | 2 | v1 |
| Tibialis raise | sí |  | 1 | · | sí | s60 | sí | Caderas y piernas | Estira | 1 | legacy |
| Wall sit | sí |  | 1 | · | sí | NEW | sí | Piernas | Mueve | 1 | v1 |
| World's greatest stretch | sí |  | 1 | · | · | s60 | sí | Oficina | Estira | 1 | v1 |
| Wrist circles | sí |  | 1 | · | · | s60 | sí | Oficina | Estira | 2 | mixto |
| Wrist stretch | sí |  | 1 | · | · | V5 | sí | Sigilo / Oficina | Mueve+Estira | 2 | v1 |
