/* PACE · Helpers de secuencia para respiración */
function getBreatheSequence(routine) {
  // Devuelve [{label, duration, scale}, …]
  if (routine.pattern === 'rounds') {
    return [
      { label: 'Inhala', duration: 2, scale: 1.3 },
      { label: 'Exhala', duration: 2, scale: 0.9 },
    ];
  }
  if (routine.pattern === 'box') {
    const [i, h1, e, h2] = routine.cycle;
    return [
      { label: 'Inhala', duration: i, scale: 1.3 },
      { label: 'Sostén', duration: h1, scale: 1.3 },
      { label: 'Exhala', duration: e, scale: 0.9 },
      { label: 'Sostén', duration: h2, scale: 0.9 },
    ];
  }
  if (routine.pattern === 'coherent') {
    const [i, , e] = routine.cycle;
    return [
      { label: 'Inhala', duration: i, scale: 1.3 },
      { label: 'Exhala', duration: e, scale: 0.9 },
    ];
  }
  if (routine.pattern === 'pattern') {
    // 4-7-8
    const [i, h, e] = routine.cycle;
    return [
      { label: 'Inhala', duration: i, scale: 1.3 },
      { label: 'Sostén', duration: h, scale: 1.3 },
      { label: 'Exhala', duration: e, scale: 0.9 },
    ];
  }
  if (routine.pattern === 'physiological') {
    return [
      { label: 'Inhala', duration: 2, scale: 1.25 },
      { label: 'Inhala más', duration: 1, scale: 1.35 },
      { label: 'Exhala', duration: 5, scale: 0.9 },
    ];
  }
  if (routine.pattern === 'ujjayi') {
    return [
      { label: 'Inhala oceánica', duration: 5, scale: 1.3 },
      { label: 'Exhala oceánica', duration: 5, scale: 0.9 },
    ];
  }
  if (routine.pattern === 'bhastrika' || routine.pattern === 'kapalabhati') {
    return [
      { label: 'Inhala', duration: 1, scale: 1.2 },
      { label: 'Exhala', duration: 1, scale: 0.95 },
    ];
  }
  if (routine.pattern === 'nadi') {
    return [
      { label: 'Inhala izq.', duration: 4, scale: 1.3 },
      { label: 'Sostén', duration: 2, scale: 1.3 },
      { label: 'Exhala dcha.', duration: 4, scale: 0.9 },
      { label: 'Inhala dcha.', duration: 4, scale: 1.3 },
      { label: 'Sostén', duration: 2, scale: 1.3 },
      { label: 'Exhala izq.', duration: 4, scale: 0.9 },
    ];
  }
  return [{ label: 'Respira', duration: 4, scale: 1.2 }];
}

Object.assign(window, { getBreatheSequence });
