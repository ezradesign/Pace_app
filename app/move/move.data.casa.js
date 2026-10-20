/* PACE · app/move/move.data.casa.js — LAS RUTINAS DE **MUEVE** DE LOS DÍAS DISEÑADOS
   ==================================================================================
   Hombros fuertes, de pie y dentro de casa: en una habitación o junto a la mesa (Ez,
   17 oct. 2026). La propuso la revisión de los ejercicios
   (docs/traspaso/archivos/revision-ejercicios/REVISION.md §5) y Ez la dejó para los días
   diseñados. Va aparte porque `move.data.js` está cerca de las 500 líneas (regla §1); el
   id es `extra.*`, como todo Mueve (la tabla de ids cruzados de CLAUDE.md). El Paseo
   corto, que iba con ella, salió el 20 oct.: «OLVIDA lo del paseo ya».

   · Hombros fuertes: fuerza corta de hombro con una botella de agua o sin nada. La
     elevación lateral, 2 min al día, bajó el dolor de cuello y hombro en oficinistas
     (Andersen et al. 2011, SJWEH); la fuerza, dos días por semana (OMS, CDC).

   Sin dibujo propio todavía: «Elevación lateral» y «Remo con apoyo» salen con el genérico
   (docs/product/GLIFOS_A_DIBUJAR.md).

   GUARD DE ORDEN: añade a los grupos de `move.data.js`; si se evalúa antes, aborta en
   vez de dejar la biblioteca sin la rutina sin que nadie lo vea. */
if (!window.MOVE_ROUTINES || !window.MOVE_ROUTINES.empuje) {
  throw new Error('move.data.casa.js se ha evaluado ANTES que move.data.js: revisa el orden en PACE.html');
}

window.MOVE_ROUTINES.empuje.items.push(
  { id: 'extra.shoulders.strong', tag: 'PUSH', code: 'Fuerza', name: 'Hombros fuertes', desc: 'Elevación lateral y remo con una botella de agua, o sin nada. De pie, junto a la mesa.', min: 3,
    position: ['standing'], equipment: ['bottleOptional'], requiresFloor: false, intensity: 'gentle', level: 'accessible',
    steps: [
      /* Un brazo y luego el otro: con una sola botella. El runner no tiene repeticiones
         por lado, así que «unas 8» van como guía dentro del reloj de cada lado. */
      { name: 'Elevación lateral', mode: 'perSide', dur: 30, transition: { seconds: 5 },
        instruction: {
          setup: 'De pie, la botella en una mano, o nada. El brazo junto al cuerpo.',
          action: 'Sube el brazo de lado hasta la altura del hombro y bájalo con control. Unas 8.',
          care: 'Codo apenas doblado. El hombro no sube hacia la oreja.' } },
      { name: 'Remo con apoyo', mode: 'perSide', dur: 30, transition: { seconds: 5 },
        instruction: {
          setup: 'Una mano en la mesa y la botella en la otra. Espalda larga, rodillas sueltas.',
          action: 'Lleva el codo atrás, pegado al cuerpo, y bájalo con control. Unas 8.',
          care: 'La espalda se queda quieta: solo se mueve el brazo.' } },
      { name: 'Encogimiento de hombros', mode: 'reps', reps: 8, dur: 32,
        tempo: { up: 1, hold: 2, down: 1 }, completion: { mode: 'guided' },
        instruction: {
          action: 'Sube los hombros hacia las orejas, mantén 2 s y bájalos del todo.',
          care: 'Cuello largo. Respira sin aguantar el aire.' } },
      { name: 'Respiraciones profundas', mode: 'rest', dur: 20,
        instruction: { action: '3 inhalaciones completas para cerrar.' } },
    ]}
);
