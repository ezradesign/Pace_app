# Diagnóstico · el progreso de una sesión de Respira

**v0.94.0 · s164 · 2026-08-17 · NADA IMPLEMENTADO**

> Encargo: leer el código real, identificar qué representa cada indicador del
> progreso, documentar las redundancias y traer un menú de decisiones.
> **Este documento no cambia una línea de producto.** Las decisiones son del
> usuario.

Todo lo que sigue está **medido** conduciendo sesiones reales con reloj virtual y
leyendo los indicadores a la vez, un muestreo por segundo. No es lectura de código.

---

## 1 · Qué hay en pantalla, y qué dice cada cosa

El catálogo son **20 rutinas**, y se parten en dos familias que se comportan de
forma distinta:

- **`rounds` — 3 rutinas**: Rondas express (2×25), Respiración en rondas (3×30),
  Rondas profundas (5×35). Llevan retención y modal de seguridad.
- **por tiempo — 17 rutinas**: Box, Coherente, 4·7·8, Ujjayi, Kapalabhati…

### Familia `rounds` (fase activa)

| # | Indicador | Qué representa | De dónde sale |
|---|---|---|---|
| 1 | El visual (loto) | dónde estás **dentro de la respiración** | `progress = phaseTime / duration` |
| 2 | «Exhala» (44 px) | el nombre de la fase | `sequence[phase].label` |
| 3 | Hueco de 28 px | **nada: está vacío siempre** | `showCountdown = duration >= 4`, y las fases son de 2 s |
| 4 | «RESPIRACIÓN 1 DE 25» | respiración actual de la ronda | `breathCount / routine.breaths` |
| 5 | «RONDA 1 / 2» (arriba dcha.) | ronda actual | `round / routine.rounds` |
| 6 | La barra segmentada | progreso de la sesión | `segTotal = rounds`; activo = `breathCount / breaths` |

### Familia por tiempo (fase activa)

| # | Indicador | Qué representa |
|---|---|---|
| 1 | El visual | dónde estás dentro de la fase |
| 2 | El nombre de la fase | — |
| 3 | La cuenta atrás | segundos que quedan de la fase (**visible**: las fases son de ≥ 4 s) |
| 4-5 | — | **no existen** |
| 6 | La barra segmentada | `segTotal = round(min·60 / ciclo)` con **tope 24**; relleno = `tiempo activo / objetivo` |

### Retención (solo `rounds`)

«RETÉN SIN AIRE» + círculo que late + el cue + «Respirar de nuevo». Arriba sigue
«RONDA 1 / 2». **No hay barra**: el render de `hold` no la monta.

---

## 2 · La redundancia, medida

**En `rounds`, los indicadores 4, 5 y 6 son los MISMOS DOS NÚMEROS dicho tres
veces.** No es una impresión: la barra tiene exactamente `rounds` segmentos y el
segmento activo se rellena con `breathCount / breaths`, o sea que es el dibujo de
las dos líneas de texto que ya están en pantalla.

Traza real de Rondas express (2 rondas × 25 respiraciones), una línea por cambio:

```
 s   cabecera            centro                              segs  progreso  segmentos
  0  RONDA 1 / 2         Inhala · Respiración 1 de 25           2   0.040   [4 0]
  4  RONDA 1 / 2         Inhala · Respiración 2 de 25           2   0.080   [8 0]
  8  RONDA 1 / 2         Inhala · Respiración 3 de 25           2   0.120   [12 0]
 ...
 92  RONDA 1 / 2         Inhala · Respiración 24 de 25          2   0.960   [96 0]
 96  RONDA 1 / 2         Inhala · Respiración 25 de 25          2   1.000   [100 0]
100  RONDA 1 / 2         Retén sin aire                         —      —    (no hay barra)
```

**En la familia por tiempo no hay redundancia**: la barra es el único indicador de
sesión, y el visual y la cuenta atrás hablan solo de la fase. Traza de Box 4·4·4·4:

```
  0  Inhala · 4    19 segs   0.000  [0 …]
  1  Inhala · 3    19 segs   0.077  [7.7 …]
  4  Sostén · 4    19 segs   0.267  [26.7 …]
  8  Exhala · 4    19 segs   0.521  [52.1 …]
```

---

## 3 · Seis cosas concretas que salieron al medir

**D1 · La barra va UNA RESPIRACIÓN por delante.** Medido: en «Respiración 25 de
25» el segmento de la ronda ya está al **100 %**, con dos fases (4 s) todavía por
delante. Y al empezar, en «Respiración 1 de 25», ya marca **4 %** sin haber
respirado. Causa: `breathCount` es 1-based y el relleno es `breathCount / breaths`.
Lo mismo pasa a nivel de ronda: la última ronda llena la barra entera antes de su
retención, que es parte de la práctica.

**D2 · En las 3 rutinas `rounds` hay 28 px + 4 px de margen reservados para un
número que NUNCA aparece.** El hueco existe por una razón buena (s138: montarlo y
desmontarlo movía todo el texto 21 px entre fases del Suspiro fisiológico), pero
la reserva es *por fase*, y en `rounds` **ninguna** fase llega a 4 s. Se ve en la
captura: entre «Exhala» y «RESPIRACIÓN 1 DE 25» hay un vacío que no es aire de
diseño, es un hueco.

**D3 · Durante la retención desaparece el progreso de sesión.** Y la retención es
el tramo más largo e indeterminado de la práctica: no tiene cronómetro por decisión
(B1, apnea), así que es justo cuando el practicante no tiene ninguna referencia de
cuánto queda. Lo único que sobrevive es «RONDA 1 / 2».

**D4 · La misma barra habla tres idiomas visuales.** 2 segmentos en Rondas express
(dos trazos de ~128 px), **19** en Box 4·4·4·4 (trazos de ~11 px: se lee como una
línea de puntos) y **24** en Coherente 6·6 (donde el tope agrupa ~2 ciclos por
segmento). El componente es uno; lo que comunica cambia por completo según la
rutina.

**D5 · «Un segmento por ciclo» es aproximado, no exacto.** El comentario del código
dice que en las cortas es «1 segmento por ciclo exacto». Box 4·4·4·4: 300 s / 16 s
= 18,75 → **19** segmentos de 15,79 s contra ciclos de 16 s. Coinciden al principio
y se separan hasta ~4 s al final. No rompe nada; la frase promete más de lo que hay.

**D6 · La sesión de Respira no tiene un solo `data-pace-*`.** Cero en
`BreatheSession.jsx`. Ni la fase, ni la cuenta atrás, ni el contador de
respiraciones, ni la barra son direccionables: la suite solo puede llegar por
texto, y **nada aserta el progreso**. Para medir esto he tenido que localizar la
barra por su forma (el último hijo del centro, 5 px de alto).

**Nada de lo anterior es un bug de comportamiento**: la sesión cuenta bien, acredita
por tiempo activo real (s98) y las pausas no mueven la barra en ninguna de las dos
familias. Son decisiones de diseño con un coste visible.

---

## 4 · Menú de decisiones

Cada una es independiente y ninguna está tomada.

### Decisión 1 — la triple afirmación en `rounds`

| Opción | Qué implica |
|---|---|
| **1A** · retirar la BARRA en `rounds` | Los dos textos ya dicen las dos cifras; la barra de 2 segmentos es la que menos aporta. Menos ruido, cero pérdida de información. La barra sigue en las 17 por tiempo, donde es el único indicador. |
| **1B** · retirar «RESPIRACIÓN n DE N» | Deja la barra como progreso y el visual como fase. **Ojo**: el código dice que ese contador «ES el progreso de la ronda (útil, Wim Hof)», y en hiperventilación la gente cuenta respiraciones. |
| **1C** · que la barra diga OTRA cosa | Un segmento por ronda **sin** relleno interior: la barra cuenta rondas y el texto cuenta respiraciones. Cada indicador con un trabajo. |
| **1D** · dejarlo | La redundancia es refuerzo, no ruido. |

**Recomendación: 1A o 1C.** 1A si quieres menos elementos; 1C si quieres mantener
un ancla gráfica. 1B es la única que quita información que un practicante usa.

### Decisión 2 — la retención sin progreso (D3)

| Opción | Qué implica |
|---|---|
| **2A** · mantener la barra visible en la retención, congelada | Continuidad: la sesión no «pierde» su progreso al entrar en apnea. Sin cronómetro ni cifras: no rompe B1. |
| **2B** · dejarlo | La retención es una pantalla de quietud deliberada. |

**Recomendación: 2A**, y es la que menos código toca.

### Decisión 3 — el desfase de una respiración (D1)

| Opción | Qué implica |
|---|---|
| **3A** · rellenar por respiraciones COMPLETADAS | Empieza en 0 y llega al 100 % cuando la ronda de verdad acaba. Es lo que la barra parece prometer. |
| **3B** · dejarlo | «Estás EN la respiración 1 de 25», así que 1/25 ya está en marcha. Defendible. |

**Recomendación: 3A** — con 3B, en la última ronda la barra dice «terminado» antes
de la retención, que es la parte que más cuesta.

### Decisión 4 — la granularidad de la barra (D4/D5)

| Opción | Qué implica |
|---|---|
| **4A** · número FIJO de segmentos para todas | Un idioma visual constante. Deja de significar «un ciclo». |
| **4B** · barra continua por tiempo, segmentos solo en `rounds` | Los segmentos significan algo (rondas) donde hay bloques de verdad, y donde no, una barra normal. |
| **4C** · dejarlo | Cada rutina tiene su propio pulso, y la barra lo refleja. |

**Recomendación: 4B** si además eliges 1C; **4A** si eliges 1A. Lo que no
recomiendo es tocar solo el número (D5) sin decidir esto: es el mismo asunto.

### Decisión 5 — el hueco vacío de `rounds` (D2)

| Opción | Qué implica |
|---|---|
| **5A** · reservar el hueco solo si ALGUNA fase de la rutina llega a 4 s | Mantiene intacta la razón de s138 (no saltar entre fases) y quita 32 px muertos en las 3 rutinas de rondas. |
| **5B** · dejarlo | Coherencia vertical entre familias. |

**Recomendación: 5A.**

### Decisión 6 — hooks para la suite (D6) · técnica, no de producto

`data-pace-breathe-phase`, `-countdown`, `-breath`, `-round` y `-progress` harían
asertable el progreso de Respira. Hoy **nada** lo vigila. No cambia un píxel.

**Recomendación: hacerlo en la misma sesión en que se toque cualquiera de las
anteriores**, para que el cambio entre con su red.

---

## 5 · Lo que este diagnóstico NO mira

- **No entra en el VISUAL de Respira** (loto, flor, aro): el encargo era el
  progreso. El backlog tiene aparte «visual Respira más bonito/gráfico».
- **No entra en el sonido** ni en el drone.
- **No mide móvil**: todo a 1280×800. La barra tiene `maxWidth: 260`, así que en
  móvil los 19 segmentos de Box caen en menos ancho — sospecha razonable de que
  D4 se agrava, **sin medir**.
- **No mide inglés.** Los textos asertados son los españoles.
- **No propone copy**: si se retira un indicador, el copy de los que quedan puede
  querer revisión, y eso es otra conversación.
