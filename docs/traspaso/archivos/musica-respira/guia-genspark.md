# Música de Respira en Genspark · guía paso a paso

Seis piezas, una por familia de ejercicios. Cada una se pide con **dos bloques pegados uno detrás de otro**:
la **firma de PACE** (igual para las seis, es lo que hace que suenen a un mismo disco) y el **carácter de la
familia**. Los prompts van en inglés porque los generadores responden mejor así.

## 1 · Antes de empezar

1. En Genspark abre la herramienta de **música** (generar audio/canción). Si te deja elegir modelo, usa **el mismo
   para las seis**: si cambias de modelo a mitad, dejarán de sonar a un mismo disco.
2. Si hay un interruptor **Instrumental**, enciéndelo. Si pide letra, déjala vacía.
3. Duración: **4 minutos** si te deja. Si el máximo es menor, pide el máximo (2 minutos también vale).
4. **Haz captura** ese día de los términos de Genspark y de la página de tu plan (ver el apartado 5).

## 2 · La firma de PACE (pégala al final de cada prompt)

```
Part of one album for a calm, handcrafted breathing app: earthy, warm and intimate, like a wooden room at dusk. Tonal center low G. Instrumental only. No percussion, no beat, no melody, no vocals. Constant, flat volume from the first second to the last: no build-up, no swells, no fade in or out. Use harmonically rich mid-range timbres (bowed strings, reed harmonium, a soft sawtooth pad through a gentle low-pass) so it is clearly audible on a phone or laptop speaker, with very little brightness above 2 kHz so a quiet spoken voice stays clear on top. Designed to loop seamlessly. 4 minutes.
```

Si Genspark tiene un campo de **exclusiones** (negative prompt), pega esto ahí:

```
drums, percussion, beat, tempo, bass line, vocals, singing, spoken word, melody, chord progression, key change, crescendo, build-up, drop, risers, swells, bells, chimes, gongs, handpan, piano, arpeggios, plucked ostinato, sound effects, rain, ocean waves, birdsong, nature sounds
```

## 3 · El carácter de cada familia (va delante de la firma)

### `energia` · Rondas express, Respiración en rondas, Rondas profundas
Ciclo de 4 s, hasta 20 minutos: la música sostiene, no empuja.
```
Gentle morning drone that wakes the body without rushing it. A reed harmonium holding G and D, a soft bowed cello on G an octave below, and a faint high string harmonic shimmering steadily on top. Open fifths only, never a third. Bright but soft, like first light through a window. Completely static: no events, no struck notes.
```

### `equilibrio` · Box 4·4·4·4, Box 6·6·6·6, Diafragmática, Tolerancia CO₂
Ciclos de 8 a 24 s: ningún pulso sirve a todos, así que ninguno.
```
Slow bowed cello and viola on a sustained low G, with a second voice a fifth above on D. Very long bows that melt into each other with no audible bow change. A quiet harmonium underneath holds the same G. No pulse of any kind, no chord changes. Even, patient, a long breath in no hurry.
```

### `balance-12` · Coherente 6·6
```
A warm harmonium and string drone on G and D with one slow tidal motion: the sound gently opens and closes, a little brighter and then softer, once every 12 seconds exactly, smooth as a breath, never a beat and never an attack. The cycle is perfectly regular and identical every time.
```

### `balance-10` · Coherente 5·5
El mismo prompt de `balance-12` cambiando `every 12 seconds` por `every 10 seconds`.

*(Coherente 432 no lleva música: suena su propio drone.)*

### `relajacion` · 4·7·8, Suspiro fisiológico, Exhalación 4·6, Rítmica yin
Exhalaciones de hasta 8 s: cualquier nota suelta las corta.
```
Dark, warm, nocturnal ambient. A low cello and a very distant wordless choir-like pad on G with a minor third, soft and enveloping, the warmth sitting in the low-mids and almost no treble. Absolutely no events: no entrances, no single notes, no texture changes, nothing that makes a listener look up. The room after the light goes off.
```

### `pranayama` · Ujjayi, Bhramari, Bhastrika, Nadi Shodhana, Kumbhaka, Kapalabhati
De 2 s a 28 s de ciclo: el pulso lo pone la respiración, la música solo sostiene.
```
Tanpura drone tuned to Sa and Pa (G and D), plucked softly and continuously so the strings blend into one shimmering hum with no audible attacks, over a shruti box holding G. No tabla, no flute, no raga melody, no melodic instrument at all. The texture is identical from beginning to end.
```

## 4 · Cómo elegir entre las tomas

Genera **3 o 4 tomas de cada pieza** y escúchalas **por el altavoz del portátil o del móvil**, sin cascos. Mejor
aún: ponla de fondo mientras haces el ejercicio con la voz de PACE. Descarta la toma si:

1. No se oye bien por el altavoz (todo es un retumbe grave).
2. Hay un golpe, una nota suelta o una melodía que te hace levantar la cabeza.
3. El volumen sube o baja.
4. No suena de la misma familia que las piezas que ya has elegido.

No te preocupes por la afinación a 432, por el bucle ni por el formato: eso lo hago yo.

## 5 · Términos de uso (antes de publicar)

Los términos de Genspark (leídos el 6 oct 2026) permiten el uso comercial, pero avisan de que «podrá limitarse a
los planes de pago en el futuro», y el modelo de música que hay por debajo puede tener sus propias condiciones. Por
eso: captura de los términos y de tu plan el día que generes, y apunta qué modelo usaste.

## 6 · Entrega

Descarga cada toma elegida en la **mejor calidad** que ofrezca (WAV si hay) y súbelas a este hilo con su nombre:
`energia`, `equilibrio`, `balance-10`, `balance-12`, `relajacion`, `pranayama`. Yo las bajo a 432, les hago el
bucle sin costura, las paso a mono 64 kbps, mido si cumplen y ajusto su volumen por debajo de la voz. En
`balance-10` y `balance-12` mido si la marea cae exacta en 10 y 12 s; si no, se quedan con la de `equilibrio`.
