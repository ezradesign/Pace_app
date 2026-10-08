/* PACE · app/ui/Sound.musica.parts.jsx
   =====================================
   UNA RECETA POR TÉCNICA DE RESPIRA. Decisión de Ez (8 oct. 2026), tras
   escucharlas en `docs/traspaso/archivos/musica-respira/por-tecnica/`: cada
   técnica suena con su propia variación de los tres drones en Sol, hecha en
   directo y sin archivos nuevos. `Sound.musica.jsx` la monta; aquí solo están
   los datos, que es lo que se cambia cuando una no convence.

   DE DÓNDE SALE CADA NÚMERO. Las recetas son las de `tecnicas.js` y los
   `ajusteDb` los de `medidas.js`, en esa carpeta. `construir.js` los mide en
   Chromium con el mismo motor: el ajuste deja el volumen medio de cada técnica
   igual que con el drone de su familia, ningunos agudos por encima del drone
   más claro (para que la voz se siga oyendo) y no pierde más de 3 dB en la
   banda de un altavoz de móvil. Si se cambia una receta, se cambia allí, se
   vuelve a medir y se copian aquí la receta y su ajuste: un `ajusteDb` tocado a
   mano es un volumen que nadie ha medido.

   LOS CAMPOS:
     base      'claro', 'calido' o 'menor' (`PACE_MUSICA_BASES`).
     ratio     transposición en proporción justa, dentro de la escala de Sol:
               2/3 = Do una quinta abajo, 3/4 = Re una cuarta abajo, 4/3 = Do
               una cuarta arriba, 5/6 = Mi una tercera menor abajo.
     voz2      segunda voz: base, ratio, db, lp (su paso-bajo), of (segundo en
               que arranca, para no ir en fase con la principal) y prof (si
               respira más que la principal).
     filtro    paso-bajo de la respiración: c cerrado, a abierto, q.
     tinte     filtros fijos de color.
     mov       movimiento lento: 'brillo', 'voz', 'cruce' o 'deriva'.
     pan       cuánto se inclina hacia el lado por el que se respira.
     prof      dB que baja el volumen con el pulmón vacío (por defecto 3).
     primeraInhalacion  hasta dónde abre la primera de dos inhalaciones
               seguidas (Suspiro: dos peldaños que se oyen).
   Una técnica sin receta suena con el drone de su familia (`PACE_MUSICA`), que
   es como sonaba todo antes. Coherente 432 no tiene: lleva su propio drone. */

const PACE_MUSICA_TECNICA = {
  /* Energía: ciclos de 4 s, así que suenan quietas. */
  'breathe.rounds.express': { base: 'claro', voz2: { base: 'claro', ratio: 3 / 2, db: -15, lp: 2000, of: 37 }, tinte: [{ t: 'highshelf', hz: 2500, db: -4.5 }], mov: { tipo: 'brillo', periodo: 30, de: 2200, a: 4800 }, ajusteDb: -0.22 },
  'breathe.rounds.full': { base: 'claro', voz2: { base: 'claro', ratio: 2, db: -17, lp: 2200, of: 53 }, tinte: [{ t: 'highshelf', hz: 2500, db: -2 }], mov: { tipo: 'voz', periodo: 60 }, ajusteDb: 0.02 },
  'breathe.rounds.long': { base: 'claro', voz2: { base: 'calido', ratio: 1, db: -3, of: 11 }, tinte: [{ t: 'highshelf', hz: 2500, db: -4 }], mov: { tipo: 'cruce', periodo: 90 }, ajusteDb: 0.49 },
  /* Equilibrio */
  'breathe.box.4': { base: 'calido', voz2: { base: 'claro', ratio: 3 / 2, db: -13, lp: 3000, of: 29 }, ajusteDb: -0.2 },
  'breathe.box.6': { base: 'calido', ratio: 2 / 3, filtro: { c: 420, a: 6500, q: 0.5 }, prof: 4, ajusteDb: 0.52 },
  'breathe.diaphragm': { base: 'calido', tinte: [{ t: 'lowshelf', hz: 220, db: 3 }], filtro: { c: 380, a: 6000, q: 0.5 }, ajusteDb: -1.29 },
  'breathe.co2': { base: 'calido', voz2: { base: 'menor', ratio: 1, db: -7, of: 19 }, filtro: { c: 480, a: 5500, q: 0.5 }, prof: 2.5, ajusteDb: -0.94 },
  /* Balance (Coherente 432 lleva su drone) */
  'breathe.coherent.55': { base: 'claro', voz2: { base: 'calido', ratio: 3 / 2, db: -13, lp: 2800, of: 23 }, mov: { tipo: 'voz', periodo: 60 }, ajusteDb: -0.11 },
  'breathe.coherent.66': { base: 'claro', ratio: 2 / 3, filtro: { c: 500, a: 7000, q: 0.5 }, prof: 4, ajusteDb: 0.36 },
  /* Relajación: el drone oscuro casi no tiene nada por encima de 500 Hz, así
     que el filtro cierra mucho más abajo; con el de 650 Hz no se oía respirar. */
  'breathe.478': { base: 'menor', ratio: 5 / 6, voz2: { base: 'menor', ratio: 5 / 12, db: -11, lp: 320, of: 31 }, filtro: { c: 220, a: 1800, q: 0.5 }, ajusteDb: -0.65 },
  'breathe.physiological': { base: 'menor', voz2: { base: 'calido', ratio: 1, db: -6, of: 17 }, filtro: { c: 260, a: 2600, q: 0.5 }, prof: 4, primeraInhalacion: 0.8, ajusteDb: -0.63 },
  'breathe.exhale.46': { base: 'menor', voz2: { base: 'menor', ratio: 1 / 2, db: -8, lp: 400, of: 43, prof: 9 }, filtro: { c: 240, a: 2000, q: 0.5 }, ajusteDb: -0.59 },
  'breathe.yin': { base: 'menor', voz2: { base: 'menor', ratio: 1.0012, db: -6, of: 61 }, mov: { tipo: 'deriva', periodo: 80, cents: 2.5 }, filtro: { c: 300, a: 2200, q: 0.5 }, prof: 2, ajusteDb: -1.62 },
  /* Pranayama y Kriya. Bhastrika y Kapalabhati, de ciclo de 2 s, suenan quietas.
     Nadi Shodhana: el paneo centrado resta 3 dB por canal, y su ajuste lo devuelve. */
  'breathe.ujjayi': { base: 'claro', voz2: { base: 'claro', ratio: 1 / 2, db: -12, lp: 500, of: 47 }, filtro: { c: 380, a: 2600, q: 1.3 }, ajusteDb: -0.36 },
  'breathe.bhramari': { base: 'claro', filtro: { c: 260, a: 1400, q: 0.5 }, ajusteDb: 0.28 },
  'breathe.bellows': { base: 'calido', voz2: { base: 'claro', ratio: 3 / 2, db: -11, lp: 2600, of: 13 }, mov: { tipo: 'brillo', periodo: 20, de: 2000, a: 4500 }, ajusteDb: -1.22 },
  'breathe.nadi.shodhana': { base: 'claro', voz2: { base: 'calido', ratio: 1, db: -10, of: 27 }, pan: 0.5, ajusteDb: 3.12 },
  'breathe.kapalabhati': { base: 'claro', ratio: 4 / 3, tinte: [{ t: 'highshelf', hz: 2000, db: -4 }], filtro: { c: 650, a: 1800, q: 0.5 }, ajusteDb: 0.05 },
  'breathe.kumbhaka': { base: 'calido', ratio: 3 / 4, voz2: { base: 'calido', ratio: 3 / 8, db: -11, lp: 450, of: 39 }, filtro: { c: 450, a: 4500, q: 0.5 }, prof: 4, ajusteDb: -0.76 },
};

Object.assign(window, { PACE_MUSICA_TECNICA });
