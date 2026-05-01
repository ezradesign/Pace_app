/* PACE · Catálogo de rutinas de respiración */
const BREATHE_ROUTINES = {
  energia: {
    label: 'Energía',
    items: [
      { id: 'breathe.rounds.full', tag: 'ENE', code: 'Energía', name: 'Respiración en rondas', desc: '30 respiraciones profundas → retención en vacío. 3 rondas.', min: 12, pattern: 'rounds', rounds: 3, breaths: 30, safety: true },
      { id: 'breathe.rounds.express', tag: 'ENE', code: 'Energía', name: 'Rondas express', desc: 'Versión corta: 2 rondas de 25 respiraciones. Para sesiones breves.', min: 4, pattern: 'rounds', rounds: 2, breaths: 25, safety: true },
      { id: 'breathe.bellows', tag: 'PRA', code: 'Pranayama', name: 'Bhastrika · Fuelle', desc: 'Pranayama energizante rápido', min: 3, pattern: 'bhastrika' },
    ]
  },
  equilibrio: {
    label: 'Equilibrio',
    aside: 'Regula el sistema nervioso',
    items: [
      { id: 'breathe.box.4', tag: 'EQU', code: 'Equilibrio', name: 'Box 4·4·4·4', desc: 'Cuadrado perfecto. Calma mental y foco sostenido.', min: 5, pattern: 'box', cycle: [4,4,4,4] },
      { id: 'breathe.box.6', tag: 'EQU', code: 'Equilibrio', name: 'Box 6·6·6·6', desc: 'Versión profunda', min: 7, pattern: 'box', cycle: [6,6,6,6] },
    ]
  },
  balance: {
    label: 'Balance',
    aside: 'Armoniza HRV',
    items: [
      { id: 'breathe.coherent.55', tag: 'BAL', code: 'Balance', name: 'Coherente 5·5', desc: 'Respiración cardíaca. Sincroniza corazón y mente.', min: 5, pattern: 'coherent', cycle: [5,0,5,0] },
      { id: 'breathe.coherent.66', tag: 'BAL', code: 'Balance', name: 'Coherente 6·6', desc: 'Versión más profunda. 5 ciclos por minuto.', min: 10, pattern: 'coherent', cycle: [6,0,6,0] },
    ]
  },
  relajacion: {
    label: 'Relajación',
    aside: 'Baja el ruido mental',
    items: [
      { id: 'breathe.478', tag: 'REL', code: 'Relajación', name: '4·7·8', desc: 'Exhalación larga. Baja ansiedad, prepara sueño.', min: 3, pattern: 'pattern', cycle: [4,7,8,0] },
      { id: 'breathe.physiological', tag: 'REL', code: 'Relajación', name: 'Suspiro fisiológico', desc: 'Doble inhalación + exhalación larga. Reset rápido.', min: 2, pattern: 'physiological' },
    ]
  },
  pranayama: {
    label: 'Pranayama',
    aside: 'Raíces yóguicas',
    items: [
      { id: 'breathe.nadi.shodhana', tag: 'PRA', code: 'Pranayama', name: 'Nadi Shodhana', desc: 'Respiración alternada. Equilibra hemisferios.', min: 8, pattern: 'nadi' },
      { id: 'breathe.ujjayi', tag: 'PRA', code: 'Pranayama', name: 'Ujjayi', desc: 'Respiración oceánica. Meditativa.', min: 6, pattern: 'ujjayi', cycle: [5,0,5,0] },
      { id: 'breathe.kapalabhati', tag: 'KRI', code: 'Kriya', name: 'Kapalabhati · Kriya', desc: 'Limpieza del cráneo. Enérgico.', min: 3, pattern: 'kapalabhati', safety: true },
    ]
  }
};

Object.assign(window, { BREATHE_ROUTINES });
