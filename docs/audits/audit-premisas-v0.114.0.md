# Auditoría de premisas · s183 (sobre v0.114.0)

> **Encargo del usuario, textual**: «mejor audita todo el proyecto para detectar premisas
> obsoletas, saber qué tareas vamos a hacer y avanzar de manera ordenada, tómate tu tiempo».
>
> Cada hallazgo lleva evidencia medida en esta sesión. **Lo que no se pudo comprobar se
> declara**, igual que hace el `verify`. Lo que *no* está obsoleto aunque lo parezca va en su
> propia sección, para que nadie lo reabra.

---

## 0 · Línea base, medida y no citada

| | |
|---|---|
| Versión | **v0.114.0**, `main` en `32d1ccc` |
| CI del último push | **verde** — `completed success`, 4 m 42 s (`gh run list`) |
| `npm run verify` | **PASA** — 0 problemas, 1 aviso. **11,4 y 18,9 s en dos pasadas del mismo día**: oscila con la carga de la máquina, así que se cita como rango |
| `npm run test:e2e` | **187/187** |
| Árbol | 3 archivos modificados sin commitear: el arreglo del logro en inglés de esta sesión |
| Catálogo | Respira **20** · Mueve **14** · Estira **17** · Caminos **7** |
| Logros | **96** en catálogo · **88** con detector · **88** el denominador de la UI (§15.4) · **77** con arte · **19** sin |
| Arte de ejercicio | **62** identidades · **59** con arte · **3** pendientes · 47 glifos heráldicos · 118 `.webp` |
| i18n | 585 claves ES = 585 EN en `strings/*`, biyectiva · 1.015 claves de contenido sólo EN |

### Cómo se hizo

Se **reutilizan los dos checkers que s178 dejó escritos** en vez de inventar otros:

- `scripts/audit/auditoria-s178.decisiones.js` — 210 filas de decisión, 793 spans
  comprobables, 21 sin referente vivo y 16 filas sospechosas, casi todas de las clases que s178
  ya declaró como falsos positivos (prosa punteada, identificadores externos, transliteración).
- `scripts/audit/auditoria-s178.huerfanos.js` — cero símbolos inertes.

Lo que sigue es, sobre todo, **la clase que s178 declaró que sus instrumentos NO pueden ver**:
«una decisión cuyo símbolo sigue vivo pero que ya describe mal lo que ese código hace hoy». Un
grep no distingue «existe» de «hace lo que dice». Todo lo de abajo salió midiendo.

---

## 1 · Premisas obsoletas, con su evidencia

### A · `CLAUDE.md` — el archivo que se lee primero, con cuatro datos falsos

Es el de mayor impacto: lo lee **cada** sesión antes de tocar nada.

| # | Lo que dice | Lo medido |
|---|---|---|
| **A1** | El árbol de `app/` lista 14 carpetas | Hay **19**. Faltan `custom/`, `events/`, `glyphs/`, `main/` y `paths/` — entre ellas el subsistema entero de eventos y los Caminos |
| **A2** | `app/stats/WeeklyStats.jsx` | **No existe.** Los cinco reales: `StatsPanel.jsx`, `YearView.jsx`, `PathStats.jsx`, `PathYearView.jsx`, `StatsPanel.css.jsx` |
| **A3** | Las rutinas de **Estira** viven en `app/extra/ExtraModule.jsx` (`EXTRA_ROUTINES`) | Desde s178 viven en **`app/extra/extra.data.js`** (8) **+ `app/extra/extra.data.piernas.js`** (9). `ExtraModule.jsx` sólo las **lee** por `window.EXTRA_ROUTINES` (`ExtraModule.jsx:38`) |
| **A4** | «65 tests de Playwright, ~25 s» y «el verify debe seguir costando ~5 s» | **187 tests, 3,1 min** y **11,4-18,9 s** |

**A3 merece un párrafo aparte.** Ese mismo bloque de `CLAUDE.md` lleva una nota que dice, de sí
mismo, que «ya ha mentido dos veces» y que en s178 mandó una sesión al archivo equivocado. La
corrección de s176 arregló los ids y **cruzó las rutas**; s178 arregló las rutas… y el troceo de
s178 volvió a dejarlas obsoletas el mismo día. Hoy la tabla vuelve a apuntar a un archivo que ya
no tiene el dato. **La regla que sobrevive es la que el propio bloque escribió: si dudas, no
leas — mira `catPrefix` y `lib.*.title`.**

### B · `CONTENT.md` — 77 versiones de deriva, sospechada en s130 y nunca verificada

- Su cabecera declara reflejar el catálogo «a fecha de **v0.37.0**». Hoy es **v0.114.0**.
- Dice **«Estira: 14 rutinas»** (`CONTENT.md:10` y `:301`). Medido: **17** — las tres de oficina
  de s178 entraron después. **Precisión, porque la primera versión de esta auditoría lo citó
  mal**: `CONTENT.md:158` también dice «14 rutinas» pero habla de **Mueve**, donde 14 es
  correcto. Con los ids cruzados, una cita mal atribuida es exactamente el error que este
  proyecto ya ha cometido tres veces.
- Al comprobarlo salió otra deriva de la misma familia: `CONTENT.md:157` daba
  `app/move/MoveModule.jsx` como casa de `MOVE_ROUTINES`; vive en `app/move/move.data.js`.
- `AUDITORIA_DOCUMENTAL.md` §3 marcó este drift como «a verificar contra código, NO corregido
  aquí» en **s130**. Han pasado **53 sesiones** sin verificarlo. **Queda verificado: el drift es
  real.**

> **Trampa medida al comprobarlo, y vale para la próxima vez:** contar las rutinas con `grep`
> sobre las fuentes da **14** para Estira, no 17 — porque el dato está en dos archivos y uno de
> ellos ni siquiera es el que el nombre sugiere. El número bueno sale de **evaluar el objeto**,
> que es lo que hace `verify.integridad.js:427-439`. Es la regla de s182 otra vez: *un censo del
> catálogo se lee del objeto evaluado, nunca del fuente*.

### C · `EVENTOS_SCHEMA.md` dice que no hay nada cableado, y hay un subsistema entero

Su cabecera, literal: **«Ninguna parte de este documento se ha cableado.»**

Medido: **5 archivos en `app/events/` (1.453 líneas)**, los **cuatro emisores** en
`app/state-events.jsx`, adaptador web con Web Locks, export/import por la barrera, retención por
calendario que se dispara sola en el arranque (`events-store.js:370`) y **cinco specs** que lo
vigilan.

Lo que sí sigue pendiente es la **Fase 3 del esquema**: los reducers de `aggregates`. Comprobado
— la palabra `aggregates` **no aparece ni una vez en `app/`**, sólo en el documento.

### D · `ROADMAP.md` Fase 8.5 — el troceo de >500 líneas ya está hecho

| Lo que dice el ROADMAP | Medido hoy |
|---|---|
| `tokens.css` **613** — «el peor y el que nadie miraba» | **322** |
| `exercise-glyphs.jsx` ~**513** | **261** |
| `Sidebar.jsx` ~**510** | **318** |

El `verify` mide **239 archivos** de `app/`, `tests/` y `scripts/` y **ninguno pasa de 500**; el
mayor es `app/focus/FocusTimer.jsx` con 500 clavados. Lo único por encima sigue siendo
`build-standalone.js` (**567**) y `PACE.html` (**547**), los dos **fuera del censo a propósito**.

### E · La música: el backlog pide añadir un requisito que el documento ya contradice

Esta es la más peligrosa de todas, porque alimenta a un generador.

- **STATE.md y el handoff** dicen: «los seis briefs necesitan el requisito que faltaba — **el
  grueso de la energía entre 200 Hz y 2 kHz**».
- **`MUSICA_RESPIRA_BRIEFS.md` sigue pidiendo lo contrario**: «**Rango medio despejado** (≈ 200 Hz
  – 3 kHz sin nada denso)» como una de sus cuatro restricciones duras (`:30`), repetida dentro de
  **cinco de los seis prompts** (`:133`, `:152`, `:170`, `:193`, `:211`).
- Y la decisión de s177 que GOBIERNA ya midió que esa restricción **es la causa** de que la pieza
  no sonara: 82,6 % de la energía bajo 200 Hz, 0 % por encima de 2 kHz.

**No es «falta añadir un requisito»: hay dos requisitos incompatibles vivos a la vez**, uno en
`DECISIONES_TECNICAS_VIGENTES.md` y otro en el documento que se le pasa al generador. Quien
genere música hoy con estos briefs **reproduce el defecto de s177**.

### F · `STATS_DESTINO_PROPUESTA.md` — dos premisas caídas, una de ellas hoy

- **Su Fase 2 («implementar `pace.events.v1`») está hecha** desde s155/s172. El documento la da
  por pendiente y por eso declara «no derivable» el conteo de pausas por día, la hora y duración
  por sesión y el feedback fechado. **Los tres son derivables hoy** — para lo emitido de v0.88.0
  en adelante, no hacia atrás.
- **Su §4.1 y §37.4 ponen «Hoy» como la vista de entrada de Stats. ANULADO hoy** por decisión del
  usuario: «Hoy» no entra, ya vive en la sidebar. Es coherente con la propia D3 del documento
  (una sola definición de «cómo va mi día»).
- **Lo que sí aguanta**: su §7 daba 221 px de cromo sobre v0.71.0 y hoy mide **221,9**.

### G · El aserto de Stats está ciego por su propia semilla

`tests/stats-pestanas.spec.js` siembra el estado **vacío**, así que su verde no dice nada del
panel con datos. Medido a 1536×714 con un año de uso sembrado: «Semana» **se corta 33 px** (lo
causa la línea de retención de s166) y «Caminos», de **60 a 146** según cuántos Caminos haya. A
1920×1080 no se corta pero las cuatro pestañas dejan de medir lo mismo: **59,5 px de salto**, que
es justo lo que s176 quitó a petición del usuario.

### H · Cifras repetidas que ya no son

- **«106 logros»** (`ROADMAP.md:246`, `AUDITORIA_SISTEMA_PACE.md:106` y `:1300`) → **96** en
  catálogo, **88** con detector, **88** el denominador de la UI.
- **16 MB de maquetas sueltas en la raíz**: 14 archivos `_*.html`, el mayor de 5,1 MB. Sin
  trackear —no ensucian el repo— pero sí el árbol y cualquier censo que mire la raíz.

---

## 2 · Lo que NO está obsoleto, aunque lo parezca

Para que nadie gaste una sesión reabriéndolo:

- **Fase 3.5 · «hoy el BreakMenu sólo ordena»** — exacto. `computeScore` (`BreakMenu.jsx:11-22`)
  mira **sólo** `plan` y `water`: ni duración del Foco, ni hora, ni zona corporal, ni feedback.
  Matiz que el ROADMAP no dice: ya pinta un tag **«Para ti»** en la primera opción.
- **`routineFeedback` sigue sin consumidor de recomendación.** Lo único que lo lee es
  `shouldPromptRoutineFeedback` (¿preguntar hoy?) y el puente que lo captura como baseline del
  contenedor de eventos. Los conteos sí/algo/no no alimentan nada.
- **El onboarding sigue sin focus trap.** No hay una sola línea de trap en `Onboarding.jsx`.
- **La lista de ARCHIVAR de s130 se ejecutó**: los cuatro documentos están en `docs/archive/`.
- **Los ids de Mueve y Estira siguen cruzados**, y `CLAUDE.md` acierta en los ids. Lo que falla
  es la ruta (A3).
- **La voz de Respira está entregada**: `Sound.voz.jsx`, `Sound.musica.jsx`, `TweaksAudio.jsx` y
  **6 archivos de voz** en disco (`sulafat` y `bradford` × inhala/exhala/mantén). De música hay
  **una sola pieza** (`energia.mp3`) de las seis previstas, y el código dice que es provisional.

---

## 3 · La cola, ordenada

El criterio del orden: **primero lo que hace que la próxima sesión no se equivoque**, luego lo
que desbloquea a otros, luego lo grande.

### Tanda 0 · Que los documentos dejen de mentir — **EJECUTADA EN ESTA MISMA SESIÓN**

Se hizo aquí porque es barata y porque cada una de estas líneas es una trampa armada para la
próxima sesión.

| | Qué | Estado |
|---|---|---|
| 0.1 | **A1–A4** en `CLAUDE.md`: el árbol de `app/` con sus 19 carpetas, `WeeklyStats.jsx` fuera, la ruta del dato de Estira, y los dos números de las redes | **hecho** |
| 0.2 | Cabecera de **`EVENTOS_SCHEMA.md`** (C): Fases 1 y 2 hechas, Fase 3 la que queda | **hecho** |
| 0.3 | Viñeta de troceo de la **Fase 8.5** (D), tachada con las tres medidas | **hecho** |
| 0.4 | Cabecera de **`STATS_DESTINO_PROPUESTA.md`** (F): «Hoy» anulado y Fase 2 hecha | **hecho** |
| 0.5 | Aviso de deriva en **`CONTENT.md`** (B) con la tabla de las cuatro cifras | **hecho** |

**Lo que 0.5 NO hace, y hay que decirlo:** no rehace `CONTENT.md` ficha a ficha. Sólo declara la
deriva, da las cuatro cifras vivas y dice cuál manda. Rehacerlo entero es una tarea propia y no
cabía aquí sin dejar de auditar.

### Tanda 1 · El conflicto de la música *(decisión, no código)*

**1.1** Resolver **E**: los briefs piden «200 Hz–3 kHz despejado» y la decisión de s177 pide «el
grueso de la energía entre 200 Hz y 2 kHz». Son incompatibles y hay que elegir —probablemente
subiendo el hueco de voz por encima de 2 kHz, pero eso se decide midiendo, no aquí. Hasta que se
resuelva, **generar música es tirar el trabajo**.

### Tanda 2 · Lo que ya estaba en la cola del usuario

**2.1** La **pill naranja** de «Mis rutinas» en la sidebar (cosmético, una imagen decide).
**2.2** Los **tres ejercicios de oficina** que no existen: gemelo de pie, flexor de cadera contra
la mesa y aductores sentado. Cada uno nace con su dibujo. Arrastra la decisión de
`move.chair.antidote`.
**2.3** El **tercer chip «Discreta»** (14 de 20), última pregunta viva de s176.
**2.4** El **arte**: 19 glifos de logro y 3 de ejercicio (`Rana`, `Pica en escritorio`). Depende
del usuario, no de mí.

### Tanda 3 · Lo grande

**3.1 · FASE 4 · Stats.** Queda **una sola vista** (la Semana), con la barra ya decidida —cinta
escalonada— y el arco de jornada por tipo. Sin Caminos y sin «Hoy». Pendiente: que el diseño
convenza. **Y de paso, G**: que `stats-pestanas.spec.js` siembre datos, o el corte volverá sin
que nadie lo vea.
**3.2 · FASE 3 del esquema de eventos**: reducers de `aggregates`. Es lo que le daría a Stats
algo que leer — hoy `pace.events.v1` tiene **un solo consumidor en toda la app**, la sidebar
(`Sidebar.jsx:74`).
**3.3 · FASE 3.5 · Pausa PACE**: la recomendación concreta. Necesita 3.2.

---

## 4 · Lo que esta auditoría NO cubre

- **Ni un píxel.** Nada visual, ni móvil, ni inglés, ni premium.
- **El criterio de contenido**: si una dosis, un cue o un umbral son *buenos* no se mira.
- **`AUDITORIA_SISTEMA_PACE.md` (67 KB) y `DECISIONES_PRODUCTO.md` (39 KB)** no se han leído
  enteros: se han cruzado por búsqueda dirigida. Puede quedar deriva dentro.
- **Las 16 filas sospechosas** del checker de decisiones no se han verificado una a una; s178 ya
  documentó que su mayoría son falsos positivos por prosa e identificadores externos, y esta
  sesión no ha vuelto a comprobarlo.
- **La cadena de autoridad tiene un hueco declarado**: 7 documentos de `docs/product/` no llevan
  etiqueta de estado en su cabecera (los seis de `GLIFOS_*`, `LIBRERIAS_REDISENO.md`,
  `MAPEO_GLIFOS_LOGRO.md`, `BASE_MUEVE_ESTIRA.md`), y la regla de s130 dice que sin etiqueta no
  gobiernan — pero `BASE_MUEVE_ESTIRA.md` sí gobierna Mueve/Estira según `CLAUDE.md` y según la
  propia auditoría documental. **Contradicción menor, no resuelta aquí.**
