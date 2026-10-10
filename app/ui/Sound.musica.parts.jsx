/* PACE · app/ui/Sound.musica.parts.jsx
   =====================================
   UNA RECETA POR TÉCNICA DE RESPIRA. Decisión de Ez (8 oct. 2026), tras
   escucharlas en `docs/traspaso/archivos/musica-respira/por-tecnica/`: cada
   técnica suena con su propia variación de los tres drones en Sol, hecha en
   directo y sin archivos nuevos. `Sound.musica.jsx` la monta; aquí solo están
   los datos, que es lo que se cambia cuando una no convence.

   SON LAS MARCADAS. Las primeras variaciones cambiaban tan poco (segunda voz
   de -10 a -17 dB, movimientos de 20 a 90 s, casi todas en Sol) que Ez las
   oyó iguales, y medido lo eran: nueve técnicas tenían una casi gemela. Cada
   una se separa ahora por la nota, por un acorde que se oye, por un color
   como de vocal o por un movimiento que se nota en medio minuto, y
   `construir.js` comprueba que ninguna quede a menos de 6 puntos de color de
   su vecina (entre el drone claro y el cálido hay 8,3).

   DE DÓNDE SALE CADA NÚMERO. Las recetas son las `m` de `tecnicas.js` y los
   `ajusteDb` los de `medidas.js` (dentro de `m`), en esa carpeta. `construir.js` los mide en
   Chromium con el mismo motor: el ajuste deja el volumen medio de cada técnica
   igual que con el drone de su familia, ningunos agudos por encima del drone
   más claro (para que la voz se siga oyendo) y no pierde más de 3 dB en la
   banda de un altavoz de móvil. Si se cambia una receta, se cambia allí, se
   vuelve a medir y se copian aquí la receta y su ajuste: un `ajusteDb` tocado a
   mano es un volumen que nadie ha medido.

   LOS CAMPOS:
     base      'claro', 'calido' o 'menor' (`PACE_MUSICA_BASES`).
     ratio     transposición en proporción justa, para que no bata con sus
               armónicos: 1/2 = una octava abajo, 2/3 = Do abajo, 3/4 = Re
               abajo, 5/6 = Mi abajo, 9/8 = La, 4/3 = Do arriba, 3/2 = Re arriba.
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
  'breathe.rounds.express': { base: 'claro', voz2: { base: 'claro', ratio: 3 / 2, db: -6, lp: 2600, of: 37 }, tinte: [{ t: 'highshelf', hz: 2500, db: -8 }], mov: { tipo: 'brillo', periodo: 10, de: 1800, a: 4200 }, ajusteDb: -1.06 },
  'breathe.rounds.full': { base: 'claro', ratio: 3 / 4, voz2: { base: 'claro', ratio: 1, db: -5, lp: 2400, of: 53 }, tinte: [{ t: 'peaking', hz: 1400, q: 1.2, db: 5 }, { t: 'highshelf', hz: 2500, db: -6 }], mov: { tipo: 'voz', periodo: 14 }, ajusteDb: -1.46 },
  'breathe.rounds.long': { base: 'claro', ratio: 2 / 3, voz2: { base: 'calido', ratio: 2 / 3, db: -1, of: 11 }, tinte: [{ t: 'lowpass', hz: 1800, q: 0.6 }], mov: { tipo: 'cruce', periodo: 18 }, ajusteDb: -0.44 },
  /* Equilibrio */
  'breathe.box.4': { base: 'calido', voz2: { base: 'calido', ratio: 3 / 2, db: -5, lp: 3000, of: 29 }, filtro: { c: 500, a: 6000, q: 0.5 }, ajusteDb: -0.98 },
  'breathe.box.6': { base: 'calido', ratio: 2 / 3, voz2: { base: 'calido', ratio: 1 / 3, db: -4, lp: 600, of: 41 }, tinte: [{ t: 'peaking', hz: 450, q: 1.4, db: 5 }], filtro: { c: 320, a: 4500, q: 0.5 }, prof: 4, ajusteDb: -2.6 },
  'breathe.diaphragm': { base: 'calido', tinte: [{ t: 'peaking', hz: 320, q: 1.2, db: 6 }, { t: 'lowshelf', hz: 160, db: 3 }], filtro: { c: 360, a: 3800, q: 0.5 }, prof: 4, ajusteDb: -2.84 },
  'breathe.co2': { base: 'calido', ratio: 3 / 4, voz2: { base: 'calido', ratio: 3 / 8, db: -3, lp: 400, of: 19 }, tinte: [{ t: 'lowshelf', hz: 200, db: 1.5 }, { t: 'lowpass', hz: 2500, q: 0.6 }], filtro: { c: 300, a: 4000, q: 0.5 }, prof: 2.5, ajusteDb: -2.29 },
  /* Balance (Coherente 432 lleva su drone) */
  'breathe.coherent.55': { base: 'claro', ratio: 4 / 3, voz2: { base: 'claro', ratio: 1, db: -6, lp: 2200, of: 23 }, tinte: [{ t: 'highshelf', hz: 2000, db: -9 }], mov: { tipo: 'voz', periodo: 20 }, ajusteDb: -0.1 },
  'breathe.coherent.66': { base: 'claro', ratio: 1 / 2, voz2: { base: 'claro', ratio: 1, db: -6, lp: 1800, of: 37 }, filtro: { c: 300, a: 5000, q: 0.5 }, prof: 4.5, ajusteDb: -0.45 },
  /* Relajación: el drone oscuro casi no tiene nada por encima de 500 Hz, así
     que el filtro cierra mucho más abajo; con el de 650 Hz no se oía respirar. */
  'breathe.478': { base: 'menor', ratio: 5 / 6, voz2: { base: 'menor', ratio: 5 / 12, db: -8, lp: 320, of: 31 }, filtro: { c: 220, a: 1800, q: 0.5 }, prof: 4, ajusteDb: -0.76 },
  'breathe.physiological': { base: 'menor', ratio: 4 / 3, voz2: { base: 'menor', ratio: 2, db: -8, lp: 1500, of: 17 }, filtro: { c: 260, a: 3200, q: 0.5 }, prof: 5, primeraInhalacion: 0.8, ajusteDb: 0.05 },
  'breathe.exhale.46': { base: 'menor', voz2: { base: 'menor', ratio: 1 / 2, db: -3, lp: 400, of: 43, prof: 10 }, filtro: { c: 220, a: 2000, q: 0.5 }, ajusteDb: -1.17 },
  'breathe.yin': { base: 'menor', voz2: { base: 'menor', ratio: 1.0012, db: -2, of: 61 }, mov: { tipo: 'deriva', periodo: 40, cents: 7 }, filtro: { c: 300, a: 2200, q: 0.5 }, prof: 2, ajusteDb: -2.58 },
  /* Pranayama y Kriya. Bhastrika y Kapalabhati, de ciclo de 2 s, suenan quietas.
     Nadi Shodhana: el paneo centrado resta 3 dB por canal, y su ajuste lo devuelve. */
  'breathe.ujjayi': { base: 'claro', voz2: { base: 'calido', ratio: 1 / 2, db: -8, lp: 400, of: 47 }, filtro: { c: 300, a: 1600, q: 5 }, ajusteDb: -1.85 },
  'breathe.bhramari': { base: 'claro', ratio: 1 / 2, tinte: [{ t: 'peaking', hz: 300, q: 2, db: 6 }, { t: 'lowpass', hz: 1100, q: 0.7 }], filtro: { c: 240, a: 1100, q: 0.5 }, ajusteDb: -1.56 },
  'breathe.bellows': { base: 'calido', ratio: 4 / 3, voz2: { base: 'claro', ratio: 1, db: -6, lp: 2400, of: 13 }, tinte: [{ t: 'highshelf', hz: 2500, db: -4 }], mov: { tipo: 'brillo', periodo: 8, de: 1500, a: 3800 }, ajusteDb: -1.36 },
  'breathe.nadi.shodhana': { base: 'claro', ratio: 9 / 8, voz2: { base: 'calido', ratio: 3 / 4, db: -4, lp: 2000, of: 27 }, tinte: [{ t: 'highshelf', hz: 2200, db: -4 }], filtro: { c: 500, a: 6000, q: 0.5 }, pan: 0.85, ajusteDb: 2.94 },
  'breathe.kapalabhati': { base: 'claro', ratio: 3 / 2, tinte: [{ t: 'highshelf', hz: 1800, db: -10 }, { t: 'lowpass', hz: 2600, q: 0.7 }], filtro: { c: 650, a: 2000, q: 0.5 }, ajusteDb: 0.18 },
  'breathe.kumbhaka': { base: 'calido', ratio: 1 / 2, voz2: { base: 'calido', ratio: 3 / 4, db: -4, lp: 1500, of: 39 }, tinte: [{ t: 'peaking', hz: 400, q: 1.5, db: 5 }], filtro: { c: 380, a: 4000, q: 0.5 }, prof: 4, ajusteDb: -3.64 },
};

Object.assign(window, { PACE_MUSICA_TECNICA });
