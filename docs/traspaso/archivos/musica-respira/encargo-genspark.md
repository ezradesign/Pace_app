# Brief: background music for the PACE breathing exercises

You are generating the background music for **Respira**, the breathing module of **PACE**, a calm, handcrafted
active-break app for people who work sitting down. The music plays under a quiet spoken voice that says
"inhale", "hold", "exhale". The music is background only: it must never compete with that voice.

Please generate **six instrumental tracks**, one per family of exercises, using **the same music model for all
six** so they sound like one album. For each track, generate **3 takes** so I can choose.

## Rules for every track

1. **Instrumental only.** No vocals, no lyrics, no spoken word.
2. **No percussion and no attacks.** No drums, beats, claps, bells, chimes, gongs, handpan, piano or plucked
   ostinatos. A sharp attack gets confused with the cue that changes the breathing phase.
3. **No melody and no chord progression.** Sustained drones only.
4. **Flat, constant volume** from the first to the last second. No build-ups, swells, drops, fade-ins or fade-outs.
5. **Audible on a phone or laptop speaker.** Most of the energy between 200 Hz and 2 kHz. The root can be a low G,
   but the timbre must be harmonically rich (bowed strings, reed harmonium, soft filtered sawtooth pad), never a
   near-sine pad that only lives in the sub-bass.
6. **Very little above 2 kHz**, so the consonants of the spoken voice stay clear on top.
7. **Tonal centre: G.** All six in G.
8. **Length: 4 minutes** (or the longest the model allows). The track will be looped, so it must not have an
   intro or an ending.

## The shared sound of PACE

Add this to every prompt so the six tracks feel like one album:

> Part of one album for a calm, handcrafted breathing app: earthy, warm and intimate, like a wooden room at dusk.
> Tonal center low G. Instrumental only. No percussion, no beat, no melody, no vocals. Constant, flat volume from
> the first second to the last: no build-up, no swells, no fade in or out. Use harmonically rich mid-range
> timbres (bowed strings, reed harmonium, a soft sawtooth pad through a gentle low-pass) so it is clearly audible
> on a phone or laptop speaker, with very little brightness above 2 kHz so a quiet spoken voice stays clear on
> top. Designed to loop seamlessly. 4 minutes.

If the model has a negative prompt / exclusions field, use:

> drums, percussion, beat, tempo, bass line, vocals, singing, spoken word, melody, chord progression, key change,
> crescendo, build-up, drop, risers, swells, bells, chimes, gongs, handpan, piano, arpeggios, plucked ostinato,
> sound effects, rain, ocean waves, birdsong, nature sounds

## The six tracks

Put the character prompt **before** the shared sound.

### 1. `energia` (Energy)
Fast breathing rounds, a 4-second breath cycle, up to 20 minutes. The music supports, it never pushes.

> Gentle morning drone that wakes the body without rushing it. A reed harmonium holding G and D, a soft bowed
> cello on G an octave below, and a faint high string harmonic shimmering steadily on top. Open fifths only,
> never a third. Bright but soft, like first light through a window. Completely static: no events, no struck notes.

### 2. `equilibrio` (Balance of the nervous system)
Box breathing and diaphragmatic breathing, cycles from 8 to 24 seconds. No pulse at all.

> Slow bowed cello and viola on a sustained low G, with a second voice a fifth above on D. Very long bows that
> melt into each other with no audible bow change. A quiet harmonium underneath holds the same G. No pulse of any
> kind, no chord changes. Even, patient, a long breath in no hurry.

### 3. `balance-12` (Coherent breathing, 12-second cycle)
The only tracks with a slow motion, matched to the breath.

> A warm harmonium and string drone on G and D with one slow tidal motion: the sound gently opens and closes, a
> little brighter and then softer, once every 12 seconds exactly, smooth as a breath, never a beat and never an
> attack. The cycle is perfectly regular and identical every time.

### 4. `balance-10` (Coherent breathing, 10-second cycle)
Same prompt as `balance-12`, replacing "every 12 seconds" with **"every 10 seconds"**.

### 5. `relajacion` (Relaxation)
Long exhalations of up to 8 seconds. Any isolated note would cut an exhalation.

> Dark, warm, nocturnal ambient. A low cello and a very distant wordless choir-like pad on G with a minor third,
> soft and enveloping, the warmth sitting in the low-mids and almost no treble. Absolutely no events: no
> entrances, no single notes, no texture changes, nothing that makes a listener look up. The room after the light
> goes off.

### 6. `pranayama` (Yogic breathing)
Cycles from 2 to 28 seconds. The breath sets the pace; the music only sustains.

> Tanpura drone tuned to Sa and Pa (G and D), plucked softly and continuously so the strings blend into one
> shimmering hum with no audible attacks, over a shruti box holding G. No tabla, no flute, no raga melody, no
> melodic instrument at all. The texture is identical from beginning to end.

## Before you deliver, check each take

Discard any take that has: a hit or an isolated note, a melody, a change in volume, a fade at the start or end,
vocals, or a sound that is mostly sub-bass rumble. Do not pitch-shift to 432 Hz and do not edit the loop: that
post-production is done afterwards.

## Delivery

- Files named `energia`, `equilibrio`, `balance-12`, `balance-10`, `relajacion`, `pranayama`, with the take number
  (e.g. `energia-take2`).
- **WAV** if available, otherwise the highest-quality MP3.
- Tell me **which music model** you used for each track, so the commercial-use terms can be checked.
