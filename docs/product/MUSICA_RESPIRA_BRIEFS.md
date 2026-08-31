# Música de fondo para Respira · briefs y prompts por familia

> **Estado:** encargo, no implementación. Escrito en s176 a petición del usuario
> («me das descripciones de músicas de fondo… así las genero en genspark») y
> **corregido en s177**, cuando se volvió a medir el catálogo y `Sound.jsx`:
> cuatro cifras estaban mal y dos de ellas cambian lo que hay que pedir.
> El control ya existe en Ajustes: *Qué suena detrás* → `Nada · Ambiente`, y la
> **tercera opción «Música» se pinta el día que haya archivos** — un control que
> no hace nada es peor que un hueco.
>
> Gobierna la **FASE 5** del `ROADMAP.md`: pista de fondo **como archivo**, en
> web y Capacitor; el standalone conserva el motor sintetizado. **Se cachea al
> usarla, no en el precache.** Y si el material se genera con IA, hay que
> **verificar y guardar constancia de los términos de uso comercial** — eso lo
> pide la fase por escrito y no es opcional.

---

## Lo que manda sobre todo lo demás: no puede tapar la señal

La música es **fondo**, y en Respira compite con lo único que lleva
información: la señal de fase, que es un tono sintetizado o una locución según
lo que elijas en Ajustes.

De ahí salen cuatro restricciones que valen para todas las piezas:

| | por qué |
|---|---|
| **Sin percusión con ataque** | un golpe seco se confunde con la señal de cambio de fase. Nada de kick, claps, rimshots ni pizzicatos marcados |
| **Rango medio despejado** (≈ 200 Hz – 3 kHz sin nada denso) | ahí viven las locuciones: `sulafat` ~193 Hz de fundamental y `bradford` ~121, con sus armónicos hasta bien arriba. Medido abriendo los archivos en s176 |
| **Dinámica plana** | sin crescendos ni caídas. Un swell hace que la persona levante la cabeza justo cuando debería estar contando su exhalación |
| **Bucle sin costura** | la duración la pone la rutina, no la pieza: entre 2 y 20 minutos según cuál. El corte tiene que ser inaudible |

### La afinación: Sol, A = 432 Hz — y por qué, exactamente

**El drone de ambiente está en G2 = 96,22 Hz**, no en los 96,7 que decía el
comentario de `Sound.jsx` hasta s177 (y que la primera versión de este
documento copió). Sale de `note('G2')` con `BASE_A = 432`
([`Sound.jsx:31`](../../app/ui/Sound.jsx) y `:315`); el LFO modula **ganancia**,
no frecuencia, así que no hay nada que justifique otra cifra. Reproducible:

    node -e "const B=432;console.log(B*Math.pow(2,((2-4)*12+(7-9))/12))"

**Y el choque ocurre en UNA rutina, no en todas.** Por la decisión de s176,
*Qué suena detrás* es **una** elección —`Nada`, `Ambiente` y, cuando exista,
`Música`— y **nunca suenan dos a la vez**: con música puesta, el drone está
apagado. La excepción es **`Coherente 432`**, que lo **fuerza** aunque el ajuste
esté en otra cosa (`BreatheSession.jsx` → `drone.start(routine.drone === true)`,
que salta `ambientOn` en `Sound.jsx:302`). Ahí conviven, y ahí la desafinación se
oye: un Sol a 440 son **98,00 Hz** contra 96,22, o sea un **batido de 1,78
pulsaciones por segundo**.

Se hacen todas en Sol a 432 de todos modos —por coherencia con el tono de señal,
que es un C5+G5 a la misma referencia— pero conviene saber que **el motivo duro
es una sola rutina**.

### Formato: 4:00 a 64 kbps mono

La primera versión de este documento pedía **96 kbps** y **≤ 2 MB** en un bucle
de **4 minutos**, y las tres cosas no caben: 240 s × 96 kbps = **2,75 MB**.
Las dos salidas que sí cumplen:

| | peso |
|---|---|
| **4:00 a 64 kbps mono** ← recomendado | **1,83 MB** |
| 2:00 a 96 kbps mono | 1,37 MB |

Para un drone sin transitorios, 64 kbps mono es transparente, y un bucle de 4
minutos se delata menos que uno de 2. **Mono siempre**: el estéreo no aporta a un
fondo y dobla el peso.

---

## Las cinco familias, con sus números

Las cadencias salen del catálogo real (`BreatheLibrary.jsx`) cruzado con
`getSequence()`, no de memoria. `node scripts/audit/censo-respira-fases.js`
reproduce las fases.

| familia | rutinas | duración | ciclo respiratorio | respiraciones/min |
|---|---|---|---|---|
| **Energía** | 3 | 4–20 min | 4 s | 15 |
| **Equilibrio** | 4 | 5–7 min | 8–24 s | 2,5–7,5 |
| **Balance** | 3 | 5–10 min | 10–12 s | 5–6 |
| **Relajación** | 4 | 2–8 min | 8–19 s | 3,2–7,5 |
| **Pranayama** | 6 | 3–8 min | **2–28 s** | **2,1–30** |

### Tres cosas que estos números deciden por ti

**1 · Son SEIS archivos, no cuatro.** La primera versión proponía fusionar
Equilibrio y Balance porque sus cadencias se solapan. La fusión sale cara: para
servir a las dos, la pieza no puede tener ciclo, y **el ciclo es lo único que
esas piezas se ganan**. Como **se descargan al usarlas y no van al precache**,
un archivo de más no le cuesta un byte a quien no lo toque. Cinco familias, y
Balance en sus dos ciclos.

**2 · El ciclo de Balance es de 12 s, no de 10** —y por eso van los dos. Balance
tiene **tres** rutinas y **dos respiran a 12 s** (`Coherente 6·6` y `Coherente
432`); sólo `Coherente 5·5` va a 10. La primera versión pedía 10 s, que sirve a
**1 de 3**. Con dos variantes, cada rutina recibe la suya.

**3 · Pranayama no cabe en una sola pieza con pulso.** Va de `Bhastrika` (ciclo
de 2 s, 30 respiraciones por minuto) a `Kumbhaka 1:4:2` (28 s, 2,1 por minuto):
un factor **14**. Cualquier pulso que acompañe a una desmiente a la otra. Va
**sin pulso ninguno**: en pranayama el pulso lo pone la respiración y la música
sólo tiene que sostener.

---

## Los prompts

Escritos **en inglés a propósito**: los generadores responden bastante peor en
español. Cada bloque se pega tal cual; debajo va la línea de etiquetas por si el
campo disponible es corto.

### Exclusiones — las mismas para las seis piezas

    drums, percussion, beat, tempo, rhythm, bass line, vocals, singing,
    spoken word, melody, chord progression, key change, crescendo, build-up,
    drop, risers, swells, bells, chimes, gongs, arpeggios, plucked ostinato,
    sound effects, rain, ocean waves, field recording, birdsong, sidechain,
    tremolo

### 1 · Energía — «Despierta el sistema»

    Instrumental ambient drone, no percussion. Warm analog synthesizer pad
    sustained on a low G, absolutely steady, no vibrato and no filter sweeps.
    Above it, a handpan struck once every 6 to 8 seconds: single isolated notes
    from the G pentatonic, each one allowed to decay completely into silence
    before the next arrives. Open fifths only, no third, so the harmony never
    resolves anywhere. Airy high harmonics, soft-edged, never bright or
    metallic. Flat dynamics from start to finish, no build, no arrangement
    changes. Keep the 200 Hz to 3 kHz range sparse and uncluttered. Mood: first
    light, something beginning, unhurried. 4 minutes, seamless loop.

Etiquetas: `ambient drone, handpan, warm analog pad, open fifths, no percussion,
no melody, meditative, static, instrumental`

*Por qué así: las tres rutinas de esta familia son de rondas —4 s de ciclo, 15
respiraciones por minuto, hasta 20 minutos— y llevan retención en vacío. La
música tiene que sostener sin acelerar: el ritmo ya lo pone el cuerpo, y de
sobra.*

### 2 · Equilibrio — «Regula el sistema nervioso»

    Instrumental ambient for slow bowed strings, no percussion and no pulse.
    Cello and viola played with very long, slow bows on a sustained low G, with
    a second voice a fifth above on D. The two voices fade into each other
    almost imperceptibly and never resolve: no third, no chord changes, no
    melodic line. A quiet synthesizer drone underneath holds the same G.
    Completely flat dynamics, no crescendos, no swells, nothing that draws
    attention. No tempo of any kind should be perceptible. Leave the 200 Hz to
    3 kHz range open for a spoken voice. Mood: a long, even breath that is in no
    hurry. 4 minutes, seamless loop.

Etiquetas: `ambient, sustained cello and viola, slow bowing, drone, no pulse,
no percussion, static harmony, instrumental`

*Por qué sin pulso: sus cuatro rutinas van de 8 a 24 s de ciclo (2,5 a 7,5 rpm).
Ningún pulso sirve a las dos puntas.*

### 3 · Balance — «Ritmo suave y constante» · **ciclo de 12 s**

    Instrumental ambient drone with a slow breathing motion, no percussion. A
    warm pad on a low G with an open fifth, and one single very gentle cyclic
    movement: a low-pass filter and the volume open and close once every 12
    seconds exactly, in a smooth sine motion with no attack. It should be felt
    as a tide, never heard as a beat. The cycle is metronomically regular and
    identical every time. No arpeggios, no single notes, no melody, no chord
    changes. Keep the 200 Hz to 3 kHz range clear. Mood: even, patient, tidal.
    4 minutes, seamless loop.

### 3b · Balance · **ciclo de 10 s**

El mismo prompt, cambiando `every 12 seconds exactly` por
`every 10 seconds exactly`.

Etiquetas: `ambient drone, slow filter cycle, warm pad, tidal, no percussion,
no melody, instrumental`

*Por qué dos: 12 s sirve a `Coherente 6·6` y `Coherente 432`; 10 s a
`Coherente 5·5`. Se descargan al usarlas, así que tener las dos no le cuesta
nada a quien sólo toque una.*

### 4 · Relajación — «Baja el ruido mental»

    Dark warm instrumental ambient for the end of the day, no percussion and no
    pulse. A thick low pad, processed strings or a very distant wordless choir,
    on a low G with a minor third, in long reverb. Everything lives in the low
    and low-mid register; the treble is barely present. Absolutely no events: no
    bells, no single notes, no entrances, no texture changes, nothing that would
    make a listener look up. Completely flat dynamics from the first second to
    the last. Keep the 200 Hz to 3 kHz range uncluttered. Mood: the room after
    the light goes off. 4 minutes, seamless loop.

Etiquetas: `dark ambient, deep pad, distant wordless choir, long reverb,
low register, no percussion, no events, instrumental`

*Por qué tan quieta: aquí viven `4·7·8` y `Exhalación 4·6`, que alargan la
exhalación a propósito. Cualquier evento sonoro en mitad de una exhalación de
8 segundos la corta.*

### 5 · Pranayama — «Raíces yóguicas»

    Instrumental tanpura drone, meditative, no percussion and no rhythm at all.
    A tanpura plucked slowly and cyclically on Sa and Pa (tonic G and its fifth
    D), with all its natural sympathetic harmonics and the characteristic
    shimmering beating between the strings, over a shruti box holding the same
    tonic. No tabla, no bansuri, no flute, no melodic instrument, no raga
    melody: only the drone. The texture is identical from beginning to end. Keep
    the 200 Hz to 3 kHz range open. Mood: sustaining without marking time.
    4 minutes, seamless loop.

Etiquetas: `tanpura drone, shruti box, Indian classical drone, tonic and fifth,
no tabla, no melody, meditative, instrumental`

*Por qué sin pulso: esta familia va de Bhastrika (30 respiraciones por minuto) a
Kumbhaka (2,1). No hay un tempo que sirva a las dos. El tanpura es precisamente
el instrumento que resuelve esto en la tradición de la que salen estas técnicas:
sostiene sin marcar.*

---

## Lo que el generador NO va a dar, y hay que hacer después

| | qué hacer |
|---|---|
| **Afinación 432** | Ninguno la respeta si se pide en texto. Se genera normal y se **baja 31,77 cents** (`1200·log₂(432/440)`). Si el editor sólo remuestrea, el factor es **×0,981818** y la pieza se **alarga un 1,85 %** — inofensivo salvo en Balance, donde un ciclo de 12,000 s pasaría a 12,222 |
| **El bucle sin costura** | No lo hacen. Cortar en cruce por cero y solapar los extremos |
| **El ciclo exacto de Balance** | Tampoco. Hay que **medirlo en el archivo** y estirarlo hasta que caiga en 12,000 (o 10,000). Si no sale, la salida es la del brief: sin pulso |
| **Mono y peso** | 4:00 a **64 kbps mono = 1,83 MB**. A 96 kbps serían 2,75 y se pasa del tope |

---

## Cuando estén los archivos

1. Van a `app/breathe/musica/`, **no** bajo la carpeta de arte de Respira: el
   build inlinea `.webp` de ahí y **aborta** si queda cualquier otra cosa. Es la
   misma razón por la que las locuciones viven en `app/breathe/voz/`.
2. **No entran en el precache** (`sw.js`) — lo dice la FASE 5: se cachean al
   usarlas. Son megas, no kilobytes.
3. La tercera pill de *Qué suena detrás* se enciende en `TweaksAudio.jsx`.
   **Ojo: hoy `ambientOn` es un booleano** y las tres opciones piden un
   tri-estado; y hay que decidir qué hace `Coherente 432`, que fuerza el drone.
4. **Los términos de uso comercial, verificados y guardados** antes de publicar.
   Valen también para las **seis locuciones**, que siguen sin revisar.
