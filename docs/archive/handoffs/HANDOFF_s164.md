# Handoff · continuar desde s164

**Estado: v0.94.0 · árbol limpio tras el commit de este documento · CI verde.**
Escrito al final de s164 para que otra sesión (u otra cuenta) siga sin arqueología.

---

## 1 · Arranque

Lo de siempre, en este orden: `CLAUDE.md` → `STATE.md` → `DESIGN_SYSTEM.md` →
listar `app/`. Y **este documento antes de tocar Respira o los glifos**.

Red de seguridad, las dos mitades:

```bash
npm run verify
```

```bash
npm run test:e2e
```

`verify` son ~8 s y **restaura los artefactos tras compararlos**, así que si vas a
medir sobre `index.html` hay que **regenerarlo antes** (`node build-standalone.js`)
— esa trampa mordió en s163. La suite son **67 tests**, ~50 s.

**Recuerda para cualquier medición**: `npm run test:e2e | tail` **se come el código
de salida** (devuelve el de `tail`). Redirige a un archivo o usa `${PIPESTATUS[0]}`.

---

## 2 · Qué se hizo en s162 → s164 (contexto mínimo)

- **s162 (v0.93.0)** · auditoría que acabó en saneamiento. Se arregló una carrera
  real de reduced-motion (el margen del horizonte no estaba en la exención de
  s160), se descubrió que «Regresas» se perdía por otra carrera (el artefacto son
  **109 `<script>`**, así que un `setTimeout(0)` puede ganarle al módulo que define
  la función), y nació el **guard de la regla §1** en el `verify` con un trinquete.
- **s163 (v0.94.0)** · se trocearon **los cinco archivos** que rompían §1;
  `DEUDA_500` quedó **vacía**. Probado con **huella de reglas CSS idéntica** y
  **0 píxeles distintos** contra el artefacto de HEAD servido en paralelo.
- **s164 (esta)** · **solo diagnóstico y documentos: ni una línea de `app/`.**

---

## 3 · ~~Lo que s164 deja abierto · RESPIRA~~ · **CUMPLIDO EN s165**

> **Esta sección entera está resuelta** (v0.95.0). Lo que se hizo, lo que el censo
> corrigió de aquí y por qué 1C acabó en segmentos y no en puntos está en
> [`session-165`](sessions/session-165-respira-progreso.md). **Del handoff solo
> sigue vivo el §4, los glifos.** Se deja lo de abajo sin tocar como registro de
> lo que se creía al empezar.

### (registro histórico)

Diagnóstico completo, medido:
[`docs/audits/diagnostico-respira-progreso-v0.94.0.md`](audits/diagnostico-respira-progreso-v0.94.0.md).

### Decidido por el usuario

| # | Decisión | Estado |
|---|---|---|
| **4B** | **Barra continua** para las 17 rutinas por tiempo (hoy son 19 o 24 segmentos, y se leen como línea de puntos) | **elegida, sin implementar** |
| **3A** | Arreglar el desfase de una respiración: rellenar por respiraciones **completadas**. Medido: hoy en «Respiración 25 de 25» la barra ya marca 100 %, y en la 1 de 25 marca 4 % sin haber respirado | **entra** |
| **5A** | Quitar el hueco vacío de las rutinas de rondas: hay **32 px** reservados para una cuenta atrás que nunca aparece (sus fases son de 2 s y el umbral es 4). Reservar solo si **alguna** fase de la rutina llega a 4 s, manteniendo la razón de s138 (no saltar entre fases) | **entra** |
| **6** | Añadir hooks `data-pace-breathe-*` (fase, cuenta atrás, respiración, ronda, progreso). Hoy `BreatheSession.jsx` tiene **cero** y nada del progreso es asertable | **entra, en la misma sesión** |

### Abierto · decisión 1 (la triple afirmación)

En las 3 rutinas de rondas, **«RONDA n/N» + «RESPIRACIÓN n DE N» + la barra son
los mismos dos números tres veces** (medido: la barra tiene `rounds` segmentos y el
activo se rellena con `breathCount/breaths`).

El usuario preguntó, con razón: *si quito la barra en unas rutinas y la dejo en
otras, ¿no se rompe la homogeneidad?* La respuesta está montada con las dos
familias juntas y capturas reales:

**Artefacto publicado:** <https://claude.ai/code/artifact/a005a658-9ae5-4587-8913-769bbbb19d7a>

El argumento, en corto: **la barra no puede significar lo mismo en las dos
familias**, porque en rondas no existe el dato — la retención no tiene duración
fijada (decisión de seguridad B1: sin cronómetro ni récord). Así que hoy la
homogeneidad es solo de forma. Opciones: **1A** (fuera la barra en rondas: un solo
significado en toda la app) · **1C** (segmentada = bloques, continua = tiempo; una
regla que ordena también Mueve, cuya barra de pasos es segmentada) · **1D** dejarlo.
**DECIDIDO POR EL USUARIO al cerrar s164: 1C** — la barra deja de llevar el detalle
de respiraciones. Con una precisión que llegó despues de elegir y que hay que
respetar al implementar:

> **1C se expresa con PUNTOS, no con segmentos de barra.** Su unica debilidad
> medida era que dos segmentos vacios no comunican nada; **dos puntos vacios si**
> («tienes dos rondas por delante»). Y no es una forma nueva: **el Pomodoro ya
> pinta cuatro puntos de 4 px con su etiqueta al lado** para exactamente este
> trabajo (`FocusTimer.jsx:170-180`, `focusStyles.cycleDots`; Caminos los tuvo y
> los cambio por SenderoBar en s75). Vocabulario resultante: **puntos = bloques
> pocos y contables** (Pomodoro, rondas de Respira) · **barra segmentada = pasos,
> muchos** (Mueve) · **barra continua = tiempo** (las 17 rutinas por tiempo, 4B).
> Es una regla de ESCALA, no una excepcion: los puntos escalan donde viven las
> rondas (2 a 5) y no donde vive Mueve (10-20 pasos).

**Y abre la simplificacion que el menu no tocaba**: hoy «RONDA n/N» vive en la
CABECERA y «RESPIRACION n DE N» en el CENTRO. Si los puntos van en el centro junto
al texto —como el Pomodoro, puntos y etiqueta juntos—, los tres sitios se vuelven
UNO y la cabecera se queda solo con el nombre de la rutina.

**SUB-PREGUNTA ABIERTA, para decidir mirandola**: si la cabecera conserva
«RONDA n/N» o no. Recomendacion: quitarla (los puntos ya lo dicen y contar dos o
cinco es inmediato). **No la resuelvas sin preguntar.**

### Abierto · decisión 2, y trae una pregunta nueva del usuario

Hoy **durante la retención no hay barra** (el render de `hold` no la monta), y es
el tramo más largo e indeterminado. El usuario dice que la bola que late «está
chula» y pregunta:

> ¿sería interesante **medir el tiempo de retención y trackearlo en estadísticas**?

**Esto NO es un cambio pequeño y choca de frente con una decisión viva.** B1 (s89)
retiró la cifra-récord de 160 px de la retención **precisamente** porque invitaba a
competir contra el reloj, y `CLAUDE.md` prohíbe la gamificación agresiva y exige
disclaimer en apnea. Antes de implementar nada hay que separar dos cosas:

1. **Medir y guardar** el tiempo de retención (invisible durante la práctica, solo
   en Ritmo/Estadísticas después) — defendible, pero crea un número que la gente
   querrá batir.
2. **Mostrarlo durante la retención** — es exactamente lo que B1 quitó. **No.**

Si se hace (1), hay que decidir: ¿se muestra como récord o solo como total
acumulado? ¿entra en el export de «Tus datos»? ¿genera logro? (un logro por
aguantar es lo que B1 rechazó). **Es una decisión de producto con implicación de
seguridad: llévala al usuario explícitamente, no la resuelvas por defecto.**

---

## 4 · Lo que s164 deja abierto · GLIFOS

El usuario va a generar arte en **Genspark con GPT Image 2** y **entregará PNG**.
El flujo acordado: los ingesta la sesión siguiente con los scripts, **regla D-4**
(el arte se mide una vez; si llega arte nuevo se **re-corre** el script, nunca se
retoca un `.webp` a mano).

Dos encargos, dos documentos, y son la fuente de verdad:

- **[`GLIFOS_LOGROS_ENCARGO.md`](product/GLIFOS_LOGROS_ENCARGO.md)** — los **38**
  logros sin arte (de 96; hay 58 con máscara). Lleva la especificación para el
  generador, el id de cada uno, qué premia, con qué se pinta hoy y una sugerencia
  de motivo. Prioridad: `hydrate.week.perfect` (perdió su dibujo a propósito en
  s147). **Ingesta**: `node scripts/ingest-glifos-logro.js` + revisión con
  `node scripts/audit/revision-glifos.js`.
- **[`GLIFOS_EJERCICIOS_REDISENO.md`](product/GLIFOS_EJERCICIOS_REDISENO.md)** —
  **los 62 dibujos de ejercicio, rediseño desde cero** (61 distintos + `Descanso`;
  hoy 41 dibujados y 20 sin dibujo). El usuario eligió **rehacer el set entero**,
  no parchear los 20.

**Consecuencia técnica del rediseño completo, y hay que confirmarla al empezar:**
los glifos de ejercicio son hoy **SVG dibujado en código** (`exercise-glyphs.jsx` +
`.extra.jsx`, wrapper `G` con `viewBox 0 0 44 44` y `strokeWidth 1.8`). Si entran
como PNG, pasan a **máscaras CSS** como los logros y el loto — un solo mecanismo
para todo el arte, pero hay que escribir la ingesta (no existe para ejercicios) y
retirar las dos hojas de SVG. **No lo empieces sin decirlo en voz alta.**

**Cinco dibujos muertos** que desaparecen con el rediseño (hallazgo s142, cada uno
tapado por su propio alias): `Apertura de pecho sentado`, `Puente isquio a una
pierna`, `Suspensión pasiva · opcional`, `Sentadilla profunda sostenida`,
`Respiraciones profundas`.

**Nombre pendiente**: el usuario dice que «**Semana vaca**» (`streak.7`) es un
nombre pobre — y lo es: suena a *semana vacía*, lo contrario de lo que premia.
Cinco alternativas en el §8 del documento de logros; la recomendada es **«Siete
amaneceres»**, que hace familia con «Treinta amaneceres» (`stats.streak.30`).
**Ojo**: los títulos de logro **no pasan por i18n** (hallazgo s146, abierto), así
que el inglés los muestra en español.

---

## 5 · Herramientas nuevas que s164 deja en el repo

Todas en `scripts/audit/`, todas de un solo uso y sin tocar producción:

| Script | Para qué |
|---|---|
| `banco-pixeles.js` | Sirve el `index.html` **de HEAD y el del árbol en paralelo** y compara las capturas píxel a píxel con `sharp`. Es la red visual que la suite no da. Uso: `node scripts/audit/banco-pixeles.js . <copia-de-HEAD.html>` (la copia se hace con `git show HEAD:index.html > _revision-head.html`, que está gitignorado). |
| `huella-css-viva.js` | Lee el `textContent` de **todos los `<style>` del documento en orden**, quita comentarios, normaliza y hashea. Prueba que un troceo de CSS no cambió la cascada. |
| `banco-respira.js` | Conduce una sesión de Respira con reloj virtual y muestrea **todos los indicadores por segundo**. Con él se midió el diagnóstico. |
| `censo-glifos-logro.js` | Cruza catálogo × máscaras: qué logros están sin arte y con qué se pintan hoy. |
| `censo-glifos-ejercicio.js` | Censo de **dibujos distintos** que la app necesita (resuelve `VISUAL_ALIAS` y lee los 101 pasos de las rutinas). |

**Trampas medidas que estos scripts documentan en su cabecera** (leerlas ahorra
horas): un `fastForward` grande **no** avanza una sesión de Respira (el ticker se
resuscribe por fase y necesita un render entre ticks: hay que ir de 1 s en 1 s) ·
la barra tiene `transition: width 1s`, así que se lee el ancho **inline** y no el
computado · `EXTRA_ROUTINES` **no se publica en `window`** · el modal de apnea
nace con el botón **disabled** hasta marcar la casilla.

---

## 6 · Lo que sigue en la cola, por si se cierra Respira

1. **D3** · la sidebar muestra racha **y récord** (`Sidebar.jsx:97,103`) contra
   §37-bis de s133. El usuario eligió **decidirlo mirándolo**: hay que montarle las
   dos versiones a tamaño real.
2. **El tirón del arco** · sigue esperando que el usuario corra el banco de cuatro
   aros en su Doogee. **Sin ese dato no se toca el Pomodoro.**
3. **Fase 2 de eventos** (los primeros emisores). El gate del `verify` salta en
   cuanto aparezca el primer `paceEventsAppend(` fuera de `app/events/` y exigirá
   que el export de «Tus datos» lleve la sección de eventos.
4. **Ampliar `banco-pixeles.js`** a sesión viva, Respira, Mueve y Caminos: hoy solo
   fotografía la home con el Pomodoro parado. Barato, porque el arnés ya está.

---

## 7 · Reglas de esta casa que más caro salen si se olvidan

- **Ni un backtick dentro del template literal** de `_responsive.js` y
  `_responsive.pieles.js`: ha abortado el build en s139, s156, s157, s158 y s162.
- **El orden de las hojas es contrato**: `tokens.css` → `motion.css` →
  `paths/paths.css`, y `_responsive.atmosfera.js` → `_responsive.js` →
  `_responsive.pieles.js` (`--pace-skin` depende de ese orden).
- **Un `const` no cruza la IIFE del build**: lo que se comparta entre archivos va
  por `window`. El `verify` lo caza por análisis de ámbito.
- **Cada aserto nuevo se pone ROJO a propósito** antes de darlo por bueno.
- **Un control que corre en condiciones más tranquilas que el fallo no es un
  control** (en s162 me hizo revertir un arreglo correcto).
- **Los commits no llevan coautoría** (decisión s127).
