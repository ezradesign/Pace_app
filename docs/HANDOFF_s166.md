# HANDOFF · s166 → siguiente sesión

> **AGOTADO EN s167 (v0.97.0).** Sus cuatro decisiones se resolvieron: la
> retencion se queda **«esta semana»**, el instrumento E2E queda en `workers: 2`
> con su porque medido, y los glifos de logro ya entraron. Siguen vivos **solo**
> la pill de movil (§2.3) y «muy similar a web» (§2.4), que se recogen en
> [`STATE.md`](../STATE.md). **No ejecutes nada de aqui.**

**v0.96.0** · 2026-08-18 · sustituye a `HANDOFF_s164.md`, que queda **agotado**
(su §3 lo cumplió s165 y su §4 lo cumple parcialmente s166: el mecanismo de los
glifos ya está montado, solo falta el arte).

---

## 1 · Lo único ROJO que se deja

**El instrumento E2E.** No es el producto: es la suite midiéndose a sí misma.

Diagnóstico cerrado y medido en s166:

| Condición | Resultado | Reloj |
|---|---|---|
| 8 workers (el `undefined` de la config en local, máquina de 16 hilos) | 68/72 y 70/72 | 2,2 / 2,0 min |
| **2 workers (lo que usa el CI)** | **72/72** | **1,0 min** |

Los cuatro tests de bucle de `respira-progreso.spec.js` corren a **58,0–59,6 s
contra un `timeout: 60_000`**. No hay margen. La variable está en
`playwright.config.js:47`.

**Tres salidas, todas sobre la suite y ninguna sobre el YAML** (el CI no
comprueba nada que no corra en local):

- **(i)** `workers: process.env.CI ? 2 : 4` — una línea. Deja verde y rápido.
  Contra: calibra a *esta* máquina.
- **(ii)** subir el plazo de esa spec — **s165 lo rechazó por escrito**: «se
  abarata la medida en vez de subir el plazo». Se notifica como restricción
  previa, no como recomendación.
- **(iii)** abaratar los cuatro tests: el de `respira-progreso.spec.js:93` hace
  ~345 viajes al navegador para recorrer una ronda de 115 s. Es el arreglo de
  fondo y el más caro.

**Mientras no se decida: correr con `--workers=2`.** El CI seguirá verde de todos
modos, y esa es exactamente la asimetría del problema.

---

## 2 · Cuatro decisiones que espera el usuario

Ninguna se resuelve leyendo código.

1. **La variante de la retención.** Se implantó **«RETENCIÓN ESTA SEMANA»**
   (línea al pie del panel Ritmo) como **suposición declarada**: su nota de s165
   decía «a escala de semanas», y V3/V4 son las dos que respetan s139 §A4. Se le
   entregaron capturas de las **seis** variantes y **no eligió**. Pasar a
   «acumulada de siempre» es cambiar la etiqueta y el cálculo en
   `StatsPanel.jsx` — una línea, porque el almacenamiento semanal soporta las
   dos.
2. **El instrumento E2E** (§1).
3. **La pill de Foco/Pausa/Larga en móvil de pantallas largas.** La pidió al ver
   que sobra espacio arriba y abajo. Hoy está oculta **por decisión de s46**,
   porque allí la selección post-Pomodoro la hace el **BreakMenu**. Dos preguntas
   sin responder: **¿conviven, o la pill sustituye al BreakMenu en esos altos?** y
   **¿el umbral de «pantalla larga» se fija o se mide antes?** La regla vive en
   `app/main/_responsive.pieles.js`:
   `[data-pace-topbar] [data-pace-tabs] { display: none !important; }`.
4. **«Muy similar a web» en móvil.** s166 hizo **solo el intercambio de orden**.
   Los chips **ya llevan subtítulo** a 360/375/390 (medido; solo a 320 no), así
   que lo único que sigue distinto es la rejilla 2×2 contra la fila de cuatro.

---

## 3 · Los glifos: el mecanismo está montado, falta el arte

**No hay nada que decidir aquí, solo que lleguen los PNG.**

- `app/glyphs/exercise-masks.js` nace con el **mapa VACÍO** y `ExerciseGlyph` le
  da **precedencia** sobre su SVG. Con el mapa vacío **la app pinta exactamente
  lo de ayer**; cada dibujo que entre sustituye al suyo sin tocar a los demás.
  **Los 62 no tienen que llegar de golpe.**
- Lo defiende `tests/glifos-mascara-ejercicio.spec.js` (2 asertos, rojo
  verificado quitando la rama de máscara).

**Cuando lleguen los PNG:**

```bash
node scripts/ingest-glifos-ejercicio.js --origen <carpeta> --seco
```

`--seco` **no escribe nada** y dice qué empareja y qué no. Después, sin `--seco`,
reescribe el mapa y el precache; luego `node build-standalone.js`, `npm run
verify` y `npm run test:e2e`.

Detalles que importan:

- Empareja por **slug contra la identidad visual** (`resolveVisualId`), **nunca
  por posición** — la lección de s146, donde 0 de 50 posiciones seguían
  coincidiendo al añadir 8 dibujos.
- La lista objetivo es de **61** y sale del árbol: registro + los pasos de las
  rutinas leídos **del fuente** (`EXTRA_ROUTINES` no se publica en `window`).
- **No pide los 6 dibujos huérfanos**, que el encargo dice expresamente que no
  hay que rehacer.
- **Probada sobre PNG sintéticos, nunca sobre arte real.** El emparejamiento de
  los 61 nombres solo se sabrá con los del usuario; para eso está `--seco`.
- El encargo y el formato: `docs/product/GLIFOS_EJERCICIOS_REDISENO.md`.

Los **38 logros sin arte** siguen igual, con `scripts/ingest-glifos-logro.js` ya
escrito. Prioridad dentro de esa tanda: `hydrate.week.perfect` primero (es el
único que **perdió** su dibujo a propósito en s147 y necesita uno de AGUA),
después `streak.7`, `streak.14` y los 10 de `explore.*`.

---

## 4 · Lo que s166 deja MEDIDO y no hay que volver a mirar

- **La barra de Respira cabe en móvil.** Caso peor (5 rondas a 320 px):
  segmentos de **48,8 px**, 100 px de holgura. 16 escenas, con control positivo.
- **El orden único de home NO mueve el solapamiento** en ninguna vista:
  47/47 · 54/54 · 57/57 · 1/1 · 80/80, y publicado == real con diferencia 0.
- **El CTA del Pomodoro** está bien en los **12 casos** de modo × idioma × paleta.
- **La retención** dice lo mismo en los **4 cuadrantes** de idioma × paleta.

---

## 5 · Dos trampas nuevas, y las dos costaron caro

### No reimplementar la sonda de la home

**Antes de escribir un banco sobre la home, consumir `tests/home.helpers.js`**
(`sonda`, `asentarGeometria`, `px`). s166 la reimplementó y pagó **cuatro
lecturas falsas**, dos de las cuales llegaron al usuario como afirmaciones que
hubo que retirar:

| Mentira | Causa | Bien medido |
|---|---|---|
| «el solapamiento pasa de 64 a 54» | esperar 500 ms fijos en vez de a que el motor CALLE — publica más de una vez | idéntico en las 5 vistas |
| «arregla un retroceso de foco a 320» | a 320 la home desborda 8 px y tabular arrastra el viewport | la lectura no vale |
| «`--pace-dial-d` es NaN» | leerlo de `:root`, donde no está | son `--pace-timer-d` y `--pace-activities-overlap` |
| «1 retroceso en toda vista móvil» | contar el ciclo del foco dando la vuelta | 0 |

**Las cuatro estaban ya resueltas allí, con su porqué al lado.**

### Los guards al sembrar `weeklyStats`

Sin `_weeklyStatsReindexed_v0_28_8`, `loadState` cree que el estado es anterior a
v0.28.8 y aplica `reindexWeeklyStatsMondayFirst`, que es literalmente
`[arr[1]…arr[6], arr[0]]`: **la semana sale rotada un día**. En s166 casi cuesta
acusar al producto de un defecto que no tenía. Siembra mínima correcta:

```js
_weeklyStatsReindexed_v0_28_8: true,
_historyRecalculated_v0_28_8: true,
_historyMigrated: true,
lastActiveDay: new Date().toDateString(),
```

Y un cero **no pinta `<span>`** en las barras de la semana (`{v > 0 && …}`): eso
es correcto, no un fallo.

---

## 6 · Estado verificado al cerrar

- **v0.96.0**, coherente en los 7 sitios.
- `npm run verify` **PASA**, 0 problemas. CENSO de i18n **511 → 515**.
- `npm run test:e2e` **78/78** con `--workers=2`.
- `index.html` regenerado desde las fuentes.
- **`PACE_standalone.html` intacto en v0.71.0**, restaurado tras cada uno de los
  ~15 builds de la sesión.
- **`BreatheSession.jsx` queda en 493 de 500**: lo siguiente que entre ahí va a
  su `.support`.
