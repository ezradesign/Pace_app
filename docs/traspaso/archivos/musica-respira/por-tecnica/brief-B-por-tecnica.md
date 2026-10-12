# Música de Respira · brief B: un drone grabado por técnica

Generado por `construir.js` desde `tecnicas.js` (no se edita a mano). Solo hace falta para las técnicas que Ez marque como «Grabada (B)» en `escucha-por-tecnica.html`; el resto suena con su variación en directo (camino A).

## Cómo pedirlo

1. Usa **ElevenLabs Music** con el interruptor de instrumental encendido: de las 20 pistas del encargo anterior, solo pasaron las suyas (las otras 16 eran canciones).
2. Para cada técnica, pega su bloque tal cual: lleva su carácter y detrás la firma de PACE, que es lo que hace que suenen a un mismo disco.
3. Si hay un campo de exclusiones (negative prompt), pega ahí la lista de abajo.
4. Genera **3 tomas** de cada una y escúchalas por el altavoz del portátil o del móvil, mejor con la voz de PACE encima. Descarta la toma si tiene una nota suelta, una melodía, un golpe, un cambio de volumen o si todo es un retumbe grave.
5. Todas se piden en Sol, aunque en A alguna cambie de nota: la nota se ajusta después, igual que la afinación a 432.
6. Descarga cada toma elegida en WAV si se puede (si no, el MP3 de más calidad), con el nombre de la técnica y la toma (`box-4-toma2`), y apunta el modelo y el día, con captura de los términos de uso.

Yo las afino a 432, les cierro el bucle con `../scripts/procesar.py`, las paso a mono de 64 kbps, compruebo con `../scripts/medir.py` que no son canciones y las igualo a -20 dBFS de RMS. La app les sigue poniendo la respiración en directo.

## Exclusiones

```text
drums, percussion, beat, tempo, bass line, vocals, singing, spoken word, melody, chord progression, key change, crescendo, build-up, drop, risers, swells, bells, chimes, gongs, handpan, piano, arpeggios, plucked ostinato, sound effects, rain, ocean waves, water, birdsong, nature sounds
```

## La firma de PACE

Ya va incluida al final de cada bloque de abajo. Por si la necesitas suelta:

```text
Part of one album for a calm, handcrafted breathing app: earthy, warm and intimate, like a wooden room at dusk. This is not a song: one sustained drone from the first second to the last. Tonal center low G. Instrumental only. No percussion, no beat, no melody, no chord changes, no vocals. Constant, flat volume: no build-up, no swells, no fade in or out. Harmonically rich mid-range timbres (bowed strings, reed harmonium, a soft sawtooth pad through a gentle low-pass) so it is clearly audible on a phone or laptop speaker, with very little brightness above 2 kHz so a quiet spoken voice stays clear on top. Designed to loop seamlessly. 4 minutes.
```

## Las 19 técnicas

Coherente 432 no está: suena con su propio drone y no lleva música.

### `rondas-express` · Rondas express (Energía)

Por qué: Cuatro minutos para despertar. La música no sigue el fuelle de 2 segundos, que cansaría: se queda abierta y clara, con la quinta encima y una luz que crece y mengua cada medio minuto.

```text
First light. A clear reed harmonium on G and D with a soft bowed string holding the fifth above, open and luminous, completely static. Bright but gentle, like the first light through a window; it wakes the body without pushing it. Part of one album for a calm, handcrafted breathing app: earthy, warm and intimate, like a wooden room at dusk. This is not a song: one sustained drone from the first second to the last. Tonal center low G. Instrumental only. No percussion, no beat, no melody, no chord changes, no vocals. Constant, flat volume: no build-up, no swells, no fade in or out. Harmonically rich mid-range timbres (bowed strings, reed harmonium, a soft sawtooth pad through a gentle low-pass) so it is clearly audible on a phone or laptop speaker, with very little brightness above 2 kHz so a quiet spoken voice stays clear on top. Designed to loop seamlessly. 4 minutes.
```

### `rondas` · Respiración en rondas (Energía)

Por qué: Doce minutos y tres rondas con retención. Una octava aguda muy suave entra y sale una vez por minuto, para que el sonido siga vivo sin marcar ningún ritmo.

```text
Open morning. A bright, airy drone on G and D, steady and spacious, with a very faint high string harmonic an octave above that slowly appears and fades, never more than once a minute. Part of one album for a calm, handcrafted breathing app: earthy, warm and intimate, like a wooden room at dusk. This is not a song: one sustained drone from the first second to the last. Tonal center low G. Instrumental only. No percussion, no beat, no melody, no chord changes, no vocals. Constant, flat volume: no build-up, no swells, no fade in or out. Harmonically rich mid-range timbres (bowed strings, reed harmonium, a soft sawtooth pad through a gentle low-pass) so it is clearly audible on a phone or laptop speaker, with very little brightness above 2 kHz so a quiet spoken voice stays clear on top. Designed to loop seamlessly. 4 minutes.
```

### `rondas-profundas` · Rondas profundas (Energía)

Por qué: La práctica más larga e intensa. Veinte minutos de brillo cansan el oído, así que lleva menos agudos y el drone claro se cruza despacio con el cálido, cada minuto y medio.

```text
Midday warmth for a long practice. A warm, rounded drone on G with bowed cello and harmonium, softer in the treble than a morning drone, so it can play for twenty minutes without tiring the ear. Part of one album for a calm, handcrafted breathing app: earthy, warm and intimate, like a wooden room at dusk. This is not a song: one sustained drone from the first second to the last. Tonal center low G. Instrumental only. No percussion, no beat, no melody, no chord changes, no vocals. Constant, flat volume: no build-up, no swells, no fade in or out. Harmonically rich mid-range timbres (bowed strings, reed harmonium, a soft sawtooth pad through a gentle low-pass) so it is clearly audible on a phone or laptop speaker, with very little brightness above 2 kHz so a quiet spoken voice stays clear on top. Designed to loop seamlessly. 4 minutes.
```

### `box-4` · Box 4·4·4·4 (Equilibrio)

Por qué: Cuatro lados iguales. La quinta justa es el intervalo más estable que hay: el sonido se abre al inhalar, se queda quieto en cada sostén y no se mueve por su cuenta.

```text
Square and steady. Bowed viola and cello on G with a perfect fifth (D) above, even and balanced like a stone floor. The sound has no motion of its own. Part of one album for a calm, handcrafted breathing app: earthy, warm and intimate, like a wooden room at dusk. This is not a song: one sustained drone from the first second to the last. Tonal center low G. Instrumental only. No percussion, no beat, no melody, no chord changes, no vocals. Constant, flat volume: no build-up, no swells, no fade in or out. Harmonically rich mid-range timbres (bowed strings, reed harmonium, a soft sawtooth pad through a gentle low-pass) so it is clearly audible on a phone or laptop speaker, with very little brightness above 2 kHz so a quiet spoken voice stays clear on top. Designed to loop seamlessly. 4 minutes.
```

### `box-6` · Box 6·6·6·6 (Equilibrio)

Por qué: La versión profunda, con ciclos de 24 segundos. Baja a Do y respira con más recorrido, para que los sostenes largos tengan peso.

```text
Deeper square. Low bowed strings and a pedal harmonium on G, heavier and calmer than a mid-range drone, with plenty of room for long held breaths. Part of one album for a calm, handcrafted breathing app: earthy, warm and intimate, like a wooden room at dusk. This is not a song: one sustained drone from the first second to the last. Tonal center low G. Instrumental only. No percussion, no beat, no melody, no chord changes, no vocals. Constant, flat volume: no build-up, no swells, no fade in or out. Harmonically rich mid-range timbres (bowed strings, reed harmonium, a soft sawtooth pad through a gentle low-pass) so it is clearly audible on a phone or laptop speaker, with very little brightness above 2 kHz so a quiet spoken voice stays clear on top. Designed to loop seamlessly. 4 minutes.
```

### `diafragmatica` · Diafragmática (Equilibrio)

Por qué: La base de todo lo demás, sin adornos: una sola voz con más peso en los graves, que al inhalar se llena desde abajo, como el vientre.

```text
Belly. The simplest drone of the set: a single warm cello-like tone on G, rich in the low mids, with nothing on top. Plain, grounded and patient. Part of one album for a calm, handcrafted breathing app: earthy, warm and intimate, like a wooden room at dusk. This is not a song: one sustained drone from the first second to the last. Tonal center low G. Instrumental only. No percussion, no beat, no melody, no chord changes, no vocals. Constant, flat volume: no build-up, no swells, no fade in or out. Harmonically rich mid-range timbres (bowed strings, reed harmonium, a soft sawtooth pad through a gentle low-pass) so it is clearly audible on a phone or laptop speaker, with very little brightness above 2 kHz so a quiet spoken voice stays clear on top. Designed to loop seamlessly. 4 minutes.
```

### `tolerancia-co2` · Tolerancia CO₂ (Equilibrio)

Por qué: Diez segundos con los pulmones vacíos. Cuando la música está cerrada tiene que sentirse como un abrigo y no como una amenaza, por eso lleva debajo el drone oscuro, muy suave.

```text
Shelter. A dark, warm drone on G with a soft minor third deep inside, enveloping like a blanket. Never ominous, never tense, even when it is very quiet. Part of one album for a calm, handcrafted breathing app: earthy, warm and intimate, like a wooden room at dusk. This is not a song: one sustained drone from the first second to the last. Tonal center low G. Instrumental only. No percussion, no beat, no melody, no chord changes, no vocals. Constant, flat volume: no build-up, no swells, no fade in or out. Harmonically rich mid-range timbres (bowed strings, reed harmonium, a soft sawtooth pad through a gentle low-pass) so it is clearly audible on a phone or laptop speaker, with very little brightness above 2 kHz so a quiet spoken voice stays clear on top. Designed to loop seamlessly. 4 minutes.
```

### `coherente-5-5` · Coherente 5·5 (Balance)

Por qué: Seis respiraciones por minuto. Una quinta cálida aparece y se va una vez por minuto, cada seis respiraciones: acompaña la cuenta sin ponerse encima.

```text
Steady pace. A warm harmonium drone on G and D, calm and even, with a gentle warm fifth that is always there but quiet. Part of one album for a calm, handcrafted breathing app: earthy, warm and intimate, like a wooden room at dusk. This is not a song: one sustained drone from the first second to the last. Tonal center low G. Instrumental only. No percussion, no beat, no melody, no chord changes, no vocals. Constant, flat volume: no build-up, no swells, no fade in or out. Harmonically rich mid-range timbres (bowed strings, reed harmonium, a soft sawtooth pad through a gentle low-pass) so it is clearly audible on a phone or laptop speaker, with very little brightness above 2 kHz so a quiet spoken voice stays clear on top. Designed to loop seamlessly. 4 minutes.
```

### `coherente-6-6` · Coherente 6·6 (Balance)

Por qué: Cinco respiraciones por minuto, la más lenta de Balance. Baja a Do y respira con más recorrido; así no se confunde con Coherente 432, que tiene el mismo ritmo.

```text
Slow tide. A deep, wide drone on G, low strings and harmonium, slower and more spacious than a mid-range drone, like a calm sea a long way off. Part of one album for a calm, handcrafted breathing app: earthy, warm and intimate, like a wooden room at dusk. This is not a song: one sustained drone from the first second to the last. Tonal center low G. Instrumental only. No percussion, no beat, no melody, no chord changes, no vocals. Constant, flat volume: no build-up, no swells, no fade in or out. Harmonically rich mid-range timbres (bowed strings, reed harmonium, a soft sawtooth pad through a gentle low-pass) so it is clearly audible on a phone or laptop speaker, with very little brightness above 2 kHz so a quiet spoken voice stays clear on top. Designed to loop seamlessly. 4 minutes.
```

### `4-7-8` · 4·7·8 (Relajación)

Por qué: Para soltar el día y preparar el descanso. Es la más grave y oscura: baja a Mi menor y el filtro cierra más, para que el sostén de 7 segundos quede en penumbra.

```text
Night. The darkest drone of the set: a low cello and a distant wordless choir-like pad on G with a minor third, almost no treble, like a room after the lights go out. Part of one album for a calm, handcrafted breathing app: earthy, warm and intimate, like a wooden room at dusk. This is not a song: one sustained drone from the first second to the last. Tonal center low G. Instrumental only. No percussion, no beat, no melody, no chord changes, no vocals. Constant, flat volume: no build-up, no swells, no fade in or out. Harmonically rich mid-range timbres (bowed strings, reed harmonium, a soft sawtooth pad through a gentle low-pass) so it is clearly audible on a phone or laptop speaker, with very little brightness above 2 kHz so a quiet spoken voice stays clear on top. Designed to loop seamlessly. 4 minutes.
```

### `suspiro` · Suspiro fisiológico (Relajación)

Por qué: Dos minutos en mitad del día, no de noche. Lleva el drone cálido para que no suene a dormir, y la doble inhalación sube dos peldaños que se oyen.

```text
Daytime reset. A warm, soft drone on G that relaxes without sounding like sleep: gentle bowed strings with a light major third, in the mid range, kind and unhurried. Part of one album for a calm, handcrafted breathing app: earthy, warm and intimate, like a wooden room at dusk. This is not a song: one sustained drone from the first second to the last. Tonal center low G. Instrumental only. No percussion, no beat, no melody, no chord changes, no vocals. Constant, flat volume: no build-up, no swells, no fade in or out. Harmonically rich mid-range timbres (bowed strings, reed harmonium, a soft sawtooth pad through a gentle low-pass) so it is clearly audible on a phone or laptop speaker, with very little brightness above 2 kHz so a quiet spoken voice stays clear on top. Designed to loop seamlessly. 4 minutes.
```

### `exhalacion-4-6` · Exhalación 4·6 (Relajación)

Por qué: Exhalas más largo de lo que inhalas. Una voz grave se apaga en cada exhalación y vuelve al inhalar, así que el freno se oye.

```text
Gentle brake. A low, dark drone on G with a soft minor third and a deep lower octave, heavy and slow, like sinking into an armchair. Part of one album for a calm, handcrafted breathing app: earthy, warm and intimate, like a wooden room at dusk. This is not a song: one sustained drone from the first second to the last. Tonal center low G. Instrumental only. No percussion, no beat, no melody, no chord changes, no vocals. Constant, flat volume: no build-up, no swells, no fade in or out. Harmonically rich mid-range timbres (bowed strings, reed harmonium, a soft sawtooth pad through a gentle low-pass) so it is clearly audible on a phone or laptop speaker, with very little brightness above 2 kHz so a quiet spoken voice stays clear on top. Designed to loop seamlessly. 4 minutes.
```

### `yin` · Rítmica yin (Relajación)

Por qué: Quietud que se asienta. Es la que menos se mueve: respira poco, y su única vida es un brillo lento de dos voces casi iguales.

```text
Stillness that settles. A very soft, dark drone on G made of two almost identical sustained voices that shimmer very slowly against each other. Nothing else happens. Part of one album for a calm, handcrafted breathing app: earthy, warm and intimate, like a wooden room at dusk. This is not a song: one sustained drone from the first second to the last. Tonal center low G. Instrumental only. No percussion, no beat, no melody, no chord changes, no vocals. Constant, flat volume: no build-up, no swells, no fade in or out. Harmonically rich mid-range timbres (bowed strings, reed harmonium, a soft sawtooth pad through a gentle low-pass) so it is clearly audible on a phone or laptop speaker, with very little brightness above 2 kHz so a quiet spoken voice stays clear on top. Designed to loop seamlessly. 4 minutes.
```

### `ujjayi` · Ujjayi (Pranayama)

Por qué: La respiración oceánica. El filtro tiene un poco de resonancia, así que cada respiración suena como una ola que llega y se va, con un mar de fondo una octava por debajo.

```text
Ocean breath. A warm drone on G and D with a deep low octave underneath, smooth and rounded, like the sea heard from inside a house. No wave sounds and no water. Part of one album for a calm, handcrafted breathing app: earthy, warm and intimate, like a wooden room at dusk. This is not a song: one sustained drone from the first second to the last. Tonal center low G. Instrumental only. No percussion, no beat, no melody, no chord changes, no vocals. Constant, flat volume: no build-up, no swells, no fade in or out. Harmonically rich mid-range timbres (bowed strings, reed harmonium, a soft sawtooth pad through a gentle low-pass) so it is clearly audible on a phone or laptop speaker, with very little brightness above 2 kHz so a quiet spoken voice stays clear on top. Designed to loop seamlessly. 4 minutes.
```

### `bhramari` · Bhramari · Abeja (Pranayama)

Por qué: Exhalas zumbando. La música se reduce a su Sol grave para dejarle sitio a tu zumbido y darte una nota en la que apoyarlo.

```text
Room for humming. A low, pure, steady drone on G, mostly the fundamental and its octave, with very little above 1 kHz, so a person humming on top can rest on the note. Part of one album for a calm, handcrafted breathing app: earthy, warm and intimate, like a wooden room at dusk. This is not a song: one sustained drone from the first second to the last. Tonal center low G. Instrumental only. No percussion, no beat, no melody, no chord changes, no vocals. Constant, flat volume: no build-up, no swells, no fade in or out. Harmonically rich mid-range timbres (bowed strings, reed harmonium, a soft sawtooth pad through a gentle low-pass) so it is clearly audible on a phone or laptop speaker, with very little brightness above 2 kHz so a quiet spoken voice stays clear on top. Designed to loop seamlessly. 4 minutes.
```

### `bhastrika` · Bhastrika · Fuelle (Pranayama)

Por qué: Tres minutos de respiración rápida que calienta. Un sonido cálido y quieto, que no sigue el fuelle, con un brillo lento que sube y baja cada 20 segundos.

```text
Bellows warmth. A warm, glowing harmonium and string drone on G and D, static and full, like embers. No pulse at all, even though the breathing above it is fast. Part of one album for a calm, handcrafted breathing app: earthy, warm and intimate, like a wooden room at dusk. This is not a song: one sustained drone from the first second to the last. Tonal center low G. Instrumental only. No percussion, no beat, no melody, no chord changes, no vocals. Constant, flat volume: no build-up, no swells, no fade in or out. Harmonically rich mid-range timbres (bowed strings, reed harmonium, a soft sawtooth pad through a gentle low-pass) so it is clearly audible on a phone or laptop speaker, with very little brightness above 2 kHz so a quiet spoken voice stays clear on top. Designed to loop seamlessly. 4 minutes.
```

### `nadi-shodhana` · Nadi Shodhana (Pranayama)

Por qué: Respiración alternada. Con cascos, la música se inclina hacia el lado por el que respiras; en el altavoz del móvil suena centrada y solo respira.

```text
Balanced sides. A calm, symmetrical drone on G and D with warm strings, steady and centred, quiet and focused. Part of one album for a calm, handcrafted breathing app: earthy, warm and intimate, like a wooden room at dusk. This is not a song: one sustained drone from the first second to the last. Tonal center low G. Instrumental only. No percussion, no beat, no melody, no chord changes, no vocals. Constant, flat volume: no build-up, no swells, no fade in or out. Harmonically rich mid-range timbres (bowed strings, reed harmonium, a soft sawtooth pad through a gentle low-pass) so it is clearly audible on a phone or laptop speaker, with very little brightness above 2 kHz so a quiet spoken voice stays clear on top. Designed to loop seamlessly. 4 minutes.
```

### `kapalabhati` · Kapalabhati · Kriya (Pranayama)

Por qué: Limpieza enérgica y breve, de otra tradición. Es la única más aguda que hoy, clara y quieta: nada se mueve, el bombeo lo pones tú.

```text
Clean. A clear, light drone on G with a soft high fifth, transparent and static, like cold clear air. Bright but never sharp. Part of one album for a calm, handcrafted breathing app: earthy, warm and intimate, like a wooden room at dusk. This is not a song: one sustained drone from the first second to the last. Tonal center low G. Instrumental only. No percussion, no beat, no melody, no chord changes, no vocals. Constant, flat volume: no build-up, no swells, no fade in or out. Harmonically rich mid-range timbres (bowed strings, reed harmonium, a soft sawtooth pad through a gentle low-pass) so it is clearly audible on a phone or laptop speaker, with very little brightness above 2 kHz so a quiet spoken voice stays clear on top. Designed to loop seamlessly. 4 minutes.
```

### `kumbhaka` · Kumbhaka 1:4:2 (Pranayama)

Por qué: Dieciséis segundos con los pulmones llenos. Baja a Re con una voz grave debajo, para que el sostén se sienta amplio y estable; es la más solemne de Pranayama.

```text
Long hold. A wide, solemn drone on G with deep low strings and harmonium, steady and spacious, made for holding the breath for sixteen seconds at a time. Part of one album for a calm, handcrafted breathing app: earthy, warm and intimate, like a wooden room at dusk. This is not a song: one sustained drone from the first second to the last. Tonal center low G. Instrumental only. No percussion, no beat, no melody, no chord changes, no vocals. Constant, flat volume: no build-up, no swells, no fade in or out. Harmonically rich mid-range timbres (bowed strings, reed harmonium, a soft sawtooth pad through a gentle low-pass) so it is clearly audible on a phone or laptop speaker, with very little brightness above 2 kHz so a quiet spoken voice stays clear on top. Designed to loop seamlessly. 4 minutes.
```
