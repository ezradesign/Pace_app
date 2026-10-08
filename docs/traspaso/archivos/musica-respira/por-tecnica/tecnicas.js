/* Las 20 técnicas de Respira, cada una con su variación en directo (camino A) y su brief para
   generarla fuera (camino B). Lo leen la página de escucha, el medidor y el generador del brief:
   así el texto que Ez escucha, el que se mide y el que se pega en la herramienta salen del mismo
   sitio.

   Las fases se copian de getSequence() (app/breathe/BreatheVisual.jsx): t = 'i' abre, 'i2' abre
   hasta 0,8 (la primera inhalación del suspiro), 'e' cierra y 's' se queda donde está.
   `hoy` es el drone que suena hoy en esa familia (PACE_MUSICA en app/ui/Sound.musica.jsx).

   La receta `a`:
     base     drone principal: 'claro', 'calido' o 'menor' (los de ../bases/).
     ratio    cuánto se transpone, en proporción justa para que no bata con sus armónicos:
              2/3 = Do una quinta por debajo, 3/4 = Re una cuarta por debajo, 4/3 = Do una cuarta por
              encima, 5/6 = Mi una tercera menor por debajo. Todas caen en la escala de Sol.
     voz2     segunda voz: { base, ratio, db (nivel), lp (paso-bajo propio), of (segundo de arranque,
              para que no vaya en fase con la principal), prof (si respira más que la principal) }.
     filtro   paso-bajo de la respiración: c (cerrado), a (abierto) y q. Hoy: 650 / 9000 / 0,5.
     tinte    filtros fijos de color.
     mov      movimiento lento: 'brillo' (otro paso-bajo que va de `de` a `a`), 'voz' (la segunda
              voz entra y sale), 'cruce' (las dos voces se cruzan), 'deriva' (la segunda voz se
              desafina unos cents y vuelve). `periodo` en segundos.
     pan      cuánto se inclina hacia el lado por el que se respira (solo Nadi Shodhana).
     prof     cuántos dB baja el volumen con el pulmón vacío. Hoy: 3. */
(function (g) {
  const I = (d, txt, lado) => ({ t: 'i', d, txt: txt || 'Inhala', voz: 'inhale', lado });
  const S = (d, txt) => ({ t: 's', d, txt: txt || 'Sostén', voz: 'hold' });
  const E = (d, txt, lado) => ({ t: 'e', d, txt: txt || 'Exhala', voz: 'exhale', lado });

  const FAMILIAS = [
    { nombre: 'Energía', aside: 'Despierta el sistema', hoy: 'claro', tecnicas: [
      { id: 'breathe.rounds.express', slug: 'rondas-express', n: 'Rondas express', min: 4, f: [I(2), E(2)], quieto: true,
        car: 'Primera luz',
        porque: 'Cuatro minutos para despertar. La música no sigue el fuelle de 2 segundos, que cansaría: se queda abierta y clara, con la quinta encima y una luz que crece y mengua cada medio minuto.',
        chips: { nota: 'Sol', voz2: 'La quinta (Re), muy suave', color: 'Como hoy', mov: 'La luz crece y mengua cada 30 s' },
        a: { base: 'claro', voz2: { base: 'claro', ratio: 3 / 2, db: -15, lp: 2000, of: 37 }, tinte: [{ t: 'highshelf', hz: 2500, db: -4.5 }], mov: { tipo: 'brillo', periodo: 30, de: 2200, a: 4800 } },
        b: 'First light. A clear reed harmonium on G and D with a soft bowed string holding the fifth above, open and luminous, completely static. Bright but gentle, like the first light through a window; it wakes the body without pushing it.' },
      { id: 'breathe.rounds.full', slug: 'rondas', n: 'Respiración en rondas', min: 12, f: [I(2), E(2)], quieto: true,
        car: 'Mañana abierta',
        porque: 'Doce minutos y tres rondas con retención. Una octava aguda muy suave entra y sale una vez por minuto, para que el sonido siga vivo sin marcar ningún ritmo.',
        chips: { nota: 'Sol', voz2: 'Una octava aguda, muy suave', color: 'Como hoy', mov: 'La octava entra y sale cada minuto' },
        a: { base: 'claro', voz2: { base: 'claro', ratio: 2, db: -17, lp: 2200, of: 53 }, tinte: [{ t: 'highshelf', hz: 2500, db: -2 }], mov: { tipo: 'voz', periodo: 60 } },
        b: 'Open morning. A bright, airy drone on G and D, steady and spacious, with a very faint high string harmonic an octave above that slowly appears and fades, never more than once a minute.' },
      { id: 'breathe.rounds.long', slug: 'rondas-profundas', n: 'Rondas profundas', min: 20, f: [I(2), E(2)], quieto: true,
        car: 'Mediodía',
        porque: 'La práctica más larga e intensa. Veinte minutos de brillo cansan el oído, así que lleva menos agudos y el drone claro se cruza despacio con el cálido, cada minuto y medio.',
        chips: { nota: 'Sol', voz2: 'El drone cálido, cruzándose con el claro', color: 'Menos agudos', mov: 'Los dos drones se cruzan cada 90 s' },
        a: { base: 'claro', voz2: { base: 'calido', ratio: 1, db: -3, of: 11 }, tinte: [{ t: 'highshelf', hz: 2500, db: -4 }], mov: { tipo: 'cruce', periodo: 90 } },
        b: 'Midday warmth for a long practice. A warm, rounded drone on G with bowed cello and harmonium, softer in the treble than a morning drone, so it can play for twenty minutes without tiring the ear.' },
    ] },
    { nombre: 'Equilibrio', aside: 'Regula el sistema nervioso', hoy: 'calido', tecnicas: [
      { id: 'breathe.box.4', slug: 'box-4', n: 'Box 4·4·4·4', min: 5, f: [I(4), S(4), E(4), S(4)],
        car: 'Cuadrado',
        porque: 'Cuatro lados iguales. La quinta justa es el intervalo más estable que hay: el sonido se abre al inhalar, se queda quieto en cada sostén y no se mueve por su cuenta.',
        chips: { nota: 'Sol', voz2: 'La quinta (Re) del drone claro', color: 'Como hoy', mov: 'Solo la respiración' },
        a: { base: 'calido', voz2: { base: 'claro', ratio: 3 / 2, db: -13, lp: 3000, of: 29 } },
        b: 'Square and steady. Bowed viola and cello on G with a perfect fifth (D) above, even and balanced like a stone floor. The sound has no motion of its own.' },
      { id: 'breathe.box.6', slug: 'box-6', n: 'Box 6·6·6·6', min: 7, f: [I(6), S(6), E(6), S(6)],
        car: 'Cuadrado hondo',
        porque: 'La versión profunda, con ciclos de 24 segundos. Baja a Do y respira con más recorrido, para que los sostenes largos tengan peso.',
        chips: { nota: 'Do, más grave', voz2: 'Ninguna', color: 'Más oscuro al cerrar', mov: 'Solo la respiración, más honda' },
        a: { base: 'calido', ratio: 2 / 3, filtro: { c: 420, a: 6500, q: 0.5 }, prof: 4 },
        b: 'Deeper square. Low bowed strings and a pedal harmonium on G, heavier and calmer than a mid-range drone, with plenty of room for long held breaths.' },
      { id: 'breathe.diaphragm', slug: 'diafragmatica', n: 'Diafragmática', min: 5, f: [I(4, 'Inhala al vientre'), E(4)],
        car: 'Vientre',
        porque: 'La base de todo lo demás, sin adornos: una sola voz con más peso en los graves, que al inhalar se llena desde abajo, como el vientre.',
        chips: { nota: 'Sol', voz2: 'Ninguna', color: 'Más peso en los graves', mov: 'Solo la respiración' },
        a: { base: 'calido', tinte: [{ t: 'lowshelf', hz: 220, db: 3 }], filtro: { c: 380, a: 6000, q: 0.5 } },
        b: 'Belly. The simplest drone of the set: a single warm cello-like tone on G, rich in the low mids, with nothing on top. Plain, grounded and patient.' },
      { id: 'breathe.co2', slug: 'tolerancia-co2', n: 'Tolerancia CO₂', min: 6, f: [I(4), E(6), S(10, 'Sostén en vacío')],
        car: 'Abrigo',
        porque: 'Diez segundos con los pulmones vacíos. Cuando la música está cerrada tiene que sentirse como un abrigo y no como una amenaza, por eso lleva debajo el drone oscuro, muy suave.',
        chips: { nota: 'Sol', voz2: 'El drone oscuro, suave', color: 'Más oscuro al cerrar', mov: 'Solo la respiración, más corta' },
        a: { base: 'calido', voz2: { base: 'menor', ratio: 1, db: -7, of: 19 }, filtro: { c: 480, a: 5500, q: 0.5 }, prof: 2.5 },
        b: 'Shelter. A dark, warm drone on G with a soft minor third deep inside, enveloping like a blanket. Never ominous, never tense, even when it is very quiet.' },
    ] },
    { nombre: 'Balance', aside: 'Ritmo suave y constante', hoy: 'claro', tecnicas: [
      { id: 'breathe.coherent.55', slug: 'coherente-5-5', n: 'Coherente 5·5', min: 5, f: [I(5), E(5)],
        car: 'Compás',
        porque: 'Seis respiraciones por minuto. Una quinta cálida aparece y se va una vez por minuto, cada seis respiraciones: acompaña la cuenta sin ponerse encima.',
        chips: { nota: 'Sol', voz2: 'La quinta (Re) del drone cálido', color: 'Como hoy', mov: 'La quinta entra y sale cada minuto' },
        a: { base: 'claro', voz2: { base: 'calido', ratio: 3 / 2, db: -13, lp: 2800, of: 23 }, mov: { tipo: 'voz', periodo: 60 } },
        b: 'Steady pace. A warm harmonium drone on G and D, calm and even, with a gentle warm fifth that is always there but quiet.' },
      { id: 'breathe.coherent.66', slug: 'coherente-6-6', n: 'Coherente 6·6', min: 10, f: [I(6), E(6)],
        car: 'Marea honda',
        porque: 'Cinco respiraciones por minuto, la más lenta de Balance. Baja a Do y respira con más recorrido; así no se confunde con Coherente 432, que tiene el mismo ritmo.',
        chips: { nota: 'Do, más grave', voz2: 'Ninguna', color: 'Más oscuro al cerrar', mov: 'Solo la respiración, más honda' },
        a: { base: 'claro', ratio: 2 / 3, filtro: { c: 500, a: 7000, q: 0.5 }, prof: 4 },
        b: 'Slow tide. A deep, wide drone on G, low strings and harmonium, slower and more spacious than a mid-range drone, like a calm sea a long way off.' },
      { id: 'breathe.coherent.432', slug: 'coherente-432', n: 'Coherente 432', min: 10, f: [I(6), E(6)], drone432: true,
        car: 'Su propio drone',
        porque: 'Se queda como está: un Sol grave afinado a 432, sin música encima. Está aquí para compararlo con Coherente 6·6, que tiene el mismo ritmo.',
        chips: { nota: 'Sol grave (96 Hz)', voz2: 'Ninguna', color: 'Un tono puro', mov: 'Un vaivén muy suave cada 10 s' } },
    ] },
    { nombre: 'Relajación', aside: 'Baja el ruido mental', hoy: 'menor', tecnicas: [
      { id: 'breathe.478', slug: '4-7-8', n: '4·7·8', min: 3, f: [I(4), S(7), E(8)],
        car: 'Noche',
        porque: 'Para soltar el día y preparar el descanso. Es la más grave y oscura: baja a Mi menor y el filtro cierra más, para que el sostén de 7 segundos quede en penumbra.',
        chips: { nota: 'Mi menor, más grave', voz2: 'Una octava grave', color: 'Mucho más oscuro al cerrar', mov: 'Solo la respiración' },
        a: { base: 'menor', ratio: 5 / 6, voz2: { base: 'menor', ratio: 5 / 12, db: -11, lp: 320, of: 31 }, filtro: { c: 220, a: 1800, q: 0.5 } },
        b: 'Night. The darkest drone of the set: a low cello and a distant wordless choir-like pad on G with a minor third, almost no treble, like a room after the lights go out.' },
      { id: 'breathe.physiological', slug: 'suspiro', n: 'Suspiro fisiológico', min: 2, f: [{ t: 'i2', d: 2, txt: 'Inhala', voz: 'inhale' }, I(1, 'Inhala más'), E(5)],
        car: 'Reset',
        porque: 'Dos minutos en mitad del día, no de noche. Lleva el drone cálido para que no suene a dormir, y la doble inhalación sube dos peldaños que se oyen.',
        chips: { nota: 'Sol', voz2: 'El drone cálido', color: 'Más oscuro al cerrar', mov: 'Solo la respiración, más honda' },
        a: { base: 'menor', voz2: { base: 'calido', ratio: 1, db: -6, of: 17 }, filtro: { c: 260, a: 2600, q: 0.5 }, prof: 4 },
        b: 'Daytime reset. A warm, soft drone on G that relaxes without sounding like sleep: gentle bowed strings with a light major third, in the mid range, kind and unhurried.' },
      { id: 'breathe.exhale.46', slug: 'exhalacion-4-6', n: 'Exhalación 4·6', min: 6, f: [I(4), E(6)],
        car: 'Freno',
        porque: 'Exhalas más largo de lo que inhalas. Una voz grave se apaga en cada exhalación y vuelve al inhalar, así que el freno se oye.',
        chips: { nota: 'Sol', voz2: 'Una octava grave que respira más', color: 'Más oscuro al cerrar', mov: 'La voz grave se apaga al exhalar' },
        a: { base: 'menor', voz2: { base: 'menor', ratio: 1 / 2, db: -8, lp: 400, of: 43, prof: 9 }, filtro: { c: 240, a: 2000, q: 0.5 } },
        b: 'Gentle brake. A low, dark drone on G with a soft minor third and a deep lower octave, heavy and slow, like sinking into an armchair.' },
      { id: 'breathe.yin', slug: 'yin', n: 'Rítmica yin', min: 8, f: [I(3), E(5), S(2)],
        car: 'Quietud',
        porque: 'Quietud que se asienta. Es la que menos se mueve: respira poco, y su única vida es un brillo lento de dos voces casi iguales.',
        chips: { nota: 'Sol', voz2: 'Una copia casi igual', color: 'Más oscuro al cerrar', mov: 'Un brillo lento cada 80 s' },
        a: { base: 'menor', voz2: { base: 'menor', ratio: 1.0012, db: -6, of: 61 }, mov: { tipo: 'deriva', periodo: 80, cents: 2.5 }, filtro: { c: 300, a: 2200, q: 0.5 }, prof: 2 },
        b: 'Stillness that settles. A very soft, dark drone on G made of two almost identical sustained voices that shimmer very slowly against each other. Nothing else happens.' },
    ] },
    { nombre: 'Pranayama', aside: 'Raíces yóguicas', hoy: 'claro', tecnicas: [
      { id: 'breathe.ujjayi', slug: 'ujjayi', n: 'Ujjayi', min: 6, f: [I(5, 'Inhala oceánica'), E(5, 'Exhala oceánica')],
        car: 'Ola',
        porque: 'La respiración oceánica. El filtro tiene un poco de resonancia, así que cada respiración suena como una ola que llega y se va, con un mar de fondo una octava por debajo.',
        chips: { nota: 'Sol', voz2: 'Una octava grave', color: 'Como una ola', mov: 'Solo la respiración' },
        a: { base: 'claro', voz2: { base: 'claro', ratio: 1 / 2, db: -12, lp: 500, of: 47 }, filtro: { c: 380, a: 2600, q: 1.3 } },
        b: 'Ocean breath. A warm drone on G and D with a deep low octave underneath, smooth and rounded, like the sea heard from inside a house. No wave sounds and no water.' },
      { id: 'breathe.bhramari', slug: 'bhramari', n: 'Bhramari · Abeja', min: 5, f: [I(4), E(8, 'Exhala zumbando')],
        car: 'Zumbido',
        porque: 'Exhalas zumbando. La música se reduce a su Sol grave para dejarle sitio a tu zumbido y darte una nota en la que apoyarlo.',
        chips: { nota: 'Sol', voz2: 'Ninguna', color: 'Solo el Sol grave', mov: 'Solo la respiración' },
        a: { base: 'claro', filtro: { c: 260, a: 1400, q: 0.5 } },
        b: 'Room for humming. A low, pure, steady drone on G, mostly the fundamental and its octave, with very little above 1 kHz, so a person humming on top can rest on the note.' },
      { id: 'breathe.bellows', slug: 'bhastrika', n: 'Bhastrika · Fuelle', min: 3, f: [I(1), E(1)], quieto: true,
        car: 'Brasa',
        porque: 'Tres minutos de respiración rápida que calienta. Un sonido cálido y quieto, que no sigue el fuelle, con un brillo lento que sube y baja cada 20 segundos.',
        chips: { nota: 'Sol', voz2: 'La quinta (Re) del drone claro', color: 'Cálido', mov: 'Un brillo que sube y baja cada 20 s' },
        a: { base: 'calido', voz2: { base: 'claro', ratio: 3 / 2, db: -11, lp: 2600, of: 13 }, mov: { tipo: 'brillo', periodo: 20, de: 2000, a: 4500 } },
        b: 'Bellows warmth. A warm, glowing harmonium and string drone on G and D, static and full, like embers. No pulse at all, even though the breathing above it is fast.' },
      { id: 'breathe.nadi.shodhana', slug: 'nadi-shodhana', n: 'Nadi Shodhana', min: 8,
        f: [I(4, 'Inhala izq.', 'izq'), S(2), E(4, 'Exhala dcha.', 'dcha'), I(4, 'Inhala dcha.', 'dcha'), S(2), E(4, 'Exhala izq.', 'izq')],
        car: 'Lado a lado',
        porque: 'Respiración alternada. Con cascos, la música se inclina hacia el lado por el que respiras; en el altavoz del móvil suena centrada y solo respira.',
        chips: { nota: 'Sol', voz2: 'El drone cálido, suave', color: 'Como hoy', mov: 'Se inclina al lado por el que respiras (con cascos)' },
        a: { base: 'claro', voz2: { base: 'calido', ratio: 1, db: -10, of: 27 }, pan: 0.5 },
        b: 'Balanced sides. A calm, symmetrical drone on G and D with warm strings, steady and centred, quiet and focused.' },
      { id: 'breathe.kapalabhati', slug: 'kapalabhati', n: 'Kapalabhati · Kriya', min: 3, f: [I(1), E(1)], quieto: true,
        car: 'Limpio',
        porque: 'Limpieza enérgica y breve, de otra tradición. Es la única más aguda que hoy, clara y quieta: nada se mueve, el bombeo lo pones tú.',
        chips: { nota: 'Do, más agudo', voz2: 'Ninguna', color: 'Claro y limpio', mov: 'Quieta' },
        a: { base: 'claro', ratio: 4 / 3, tinte: [{ t: 'highshelf', hz: 2000, db: -4 }], filtro: { c: 650, a: 1800, q: 0.5 } },
        b: 'Clean. A clear, light drone on G with a soft high fifth, transparent and static, like cold clear air. Bright but never sharp.' },
      { id: 'breathe.kumbhaka', slug: 'kumbhaka', n: 'Kumbhaka 1:4:2', min: 6, f: [I(4), S(16), E(8)],
        car: 'Sostén largo',
        porque: 'Dieciséis segundos con los pulmones llenos. Baja a Re con una voz grave debajo, para que el sostén se sienta amplio y estable; es la más solemne de Pranayama.',
        chips: { nota: 'Re, más grave', voz2: 'Una octava grave', color: 'Menos agudos', mov: 'Solo la respiración, más honda' },
        a: { base: 'calido', ratio: 3 / 4, voz2: { base: 'calido', ratio: 3 / 8, db: -11, lp: 450, of: 39 }, filtro: { c: 450, a: 4500, q: 0.5 }, prof: 4 },
        b: 'Long hold. A wide, solemn drone on G with deep low strings and harmonium, steady and spacious, made for holding the breath for sixteen seconds at a time.' },
    ] },
  ];

  /* El brief de B reutiliza la firma del encargo anterior (../encargo-genspark.md), con lo que
     enseñó la criba de las 20 pistas: 16 eran canciones y solo pasaron las de ElevenLabs. */
  const FIRMA_B = 'Part of one album for a calm, handcrafted breathing app: earthy, warm and intimate, like a wooden room at dusk. This is not a song: one sustained drone from the first second to the last. Tonal center low G. Instrumental only. No percussion, no beat, no melody, no chord changes, no vocals. Constant, flat volume: no build-up, no swells, no fade in or out. Harmonically rich mid-range timbres (bowed strings, reed harmonium, a soft sawtooth pad through a gentle low-pass) so it is clearly audible on a phone or laptop speaker, with very little brightness above 2 kHz so a quiet spoken voice stays clear on top. Designed to loop seamlessly. 4 minutes.';
  const EXCLUSIONES_B = 'drums, percussion, beat, tempo, bass line, vocals, singing, spoken word, melody, chord progression, key change, crescendo, build-up, drop, risers, swells, bells, chimes, gongs, handpan, piano, arpeggios, plucked ostinato, sound effects, rain, ocean waves, water, birdsong, nature sounds';

  g.PACE_POR_TECNICA = { FAMILIAS, FIRMA_B, EXCLUSIONES_B };
})(typeof window !== 'undefined' ? window : globalThis);
