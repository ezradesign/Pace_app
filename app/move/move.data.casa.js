/* PACE · app/move/move.data.casa.js — LAS RUTINAS DE **MUEVE** DE LOS DÍAS DISEÑADOS
   ==================================================================================
   Dos rutinas de pie para la tarde, todo dentro de casa: en una habitación o junto a la
   mesa, sin escaleras ni salir (Ez, 17 oct. 2026). Las propuso la revisión de los
   ejercicios (docs/traspaso/archivos/revision-ejercicios/REVISION.md §5) y Ez las dejó
   para los días diseñados. Van aparte porque `move.data.js` está cerca de las 500 líneas
   (regla §1); los ids son `extra.*`, como todo Mueve (la tabla de ids cruzados de
   CLAUDE.md).

   · Paseo corto: caminar suave rompe el rato sentado mejor que ponerse de pie, y tras
     comer baja la glucosa (Buffey et al. 2022, Sports Med; Duran et al. 2023, MSSE). La
     OMS (2020) cuenta cualquier actividad. «A tu ritmo» lo sirve después de comer
     (`comida` en RITMO_SERIES_META).
   · Hombros fuertes: fuerza corta de hombro con una botella de agua o sin nada. La
     elevación lateral, 2 min al día, bajó el dolor de cuello y hombro en oficinistas
     (Andersen et al. 2011, SJWEH); la fuerza, dos días por semana (OMS, CDC).

   Sin dibujo propio todavía: «Caminar», «Paso vivo», «Caminar suave», «Elevación lateral»
   y «Remo con apoyo» salen con el genérico (docs/product/GLIFOS_A_DIBUJAR.md).

   GUARD DE ORDEN: añade a los grupos de `move.data.js`; si se evalúa antes, aborta en
   vez de dejar la biblioteca sin las dos rutinas sin que nadie lo vea. */
if (!window.MOVE_ROUTINES || !window.MOVE_ROUTINES.piernas || !window.MOVE_ROUTINES.empuje) {
  throw new Error('move.data.casa.js se ha evaluado ANTES que move.data.js: revisa el orden en PACE.html');
}

window.MOVE_ROUTINES.piernas.items.push(
  { id: 'extra.walk.short', tag: 'LEG', code: 'Paseo', name: 'Paseo corto', desc: 'Tres minutos andando por la habitación, o en el sitio. Sienta bien después de comer.', min: 3,
    position: ['standing'], equipment: [], requiresFloor: false, intensity: 'gentle', level: 'accessible',
    steps: [
      { name: 'Caminar', mode: 'timed', dur: 60,
        instruction: {
          setup: 'Levántate. Camina por la habitación o marcha en el sitio, junto a la mesa.',
          action: 'Paso cómodo y brazos sueltos. Respira tranquilo.',
          care: 'Si hay poco sitio, marcha en el sitio: vale igual.' } },
      { name: 'Paso vivo', mode: 'timed', dur: 60,
        instruction: {
          action: 'Aviva el paso: rodillas algo más altas y brazos que acompañan.',
          care: 'Que puedas hablar sin ahogarte. Sin llegar a sudar.' } },
      { name: 'Caminar suave', mode: 'timed', dur: 45,
        instruction: {
          action: 'Baja el ritmo poco a poco, hasta un paso tranquilo.',
          care: 'Hombros sueltos. Deja que la respiración se calme.' } },
      { name: 'Respiraciones profundas', mode: 'rest', dur: 20,
        instruction: { action: '3 inhalaciones completas para cerrar.' } },
    ]}
);

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
