/* Las tres personas de la semana. Empezaron con PACE el domingo 8 de noviembre: bienvenida hecha y
   «¿Cómo es tu semana?» contestada, sin nada más. Cada una tiene su plan de días (`dias`) y lo que
   hace el lunes siguiente y el martes (`final`). */
'use strict';

const DOMINGO = new Date(2026, 10, 8, 20, 0);
const base = (lang, ritmo, extra) => Object.assign({
  firstSeen: DOMINGO.getTime(), lang, langAuto: false, palette: 'crema', novedadesVistas: '*',
  lastActiveDay: DOMINGO.toDateString(), _historyMigrated: true, _weeklyStatsReindexed_v0_28_8: true,
  profile: { need: 'focus', time: 'pause', environment: 'office', completedAt: DOMINGO.getTime() },
  onboardingVisto: true, visitaVista: true,
  ritmo,
}, extra || {});

/* Pausas: impares hechas con un «Sí», pares «Ahora no» (y la siguiente a los 4 min). */
const alterna = (k) => (k % 2 ? 'hacer' : 'ahoraNo');

/* La carta: se apunta lo que propone y se contesta como diga `como` ('vale' | 'dejar'), y la
   pregunta de las horas con `hora` ('si' | 'no'). */
function contesta(como, hora) {
  return async (p, dia, apunta, L, tag) => {
    const carta = p.locator('[data-pace-carta]').filter({ visible: true }).first();
    const cambios = await carta.locator('[data-pace-carta-cambio]').evaluateAll((xs) => xs.map((x) => x.getAttribute('data-pace-carta-cambio') + ': ' + x.textContent.replace(/\s+/g, ' ').trim()));
    apunta(dia + ' carta cambios', cambios);
    const si = carta.locator('[data-pace-carta-si]').filter({ visible: true });
    const no = carta.locator('[data-pace-carta-no]').filter({ visible: true });
    apunta(dia + ' carta botones', { si: await si.allTextContents(), no: await no.allTextContents() });
    /* Primero los cambios, luego la pregunta (si la hay). */
    for (let paso = 0; paso < 3; paso++) {
      const preg = await carta.locator('[data-pace-carta-pregunta]').filter({ visible: true }).count();
      const pie = carta.locator('[data-pace-carta-pie]').filter({ visible: true }).last();
      if (!(await pie.count())) break;
      const datos = await pie.getAttribute('data-pace-carta-pie');
      const quiere = /hora|pregunta/.test(datos || '') ? hora : como;
      const boton = quiere === 'vale' || quiere === 'si' ? pie.locator('[data-pace-carta-si]') : pie.locator('[data-pace-carta-no]');
      apunta(dia + ' carta paso ' + paso, { pie: datos, preg, pulsa: quiere, texto: (await boton.textContent().catch(() => '')).trim() });
      if (!(await boton.count())) break;
      await boton.first().click();
      await p.waitForTimeout(600);
      await L.foto(p, tag(dia + '-carta-' + paso));
      if (!(await p.locator('[data-pace-carta]').filter({ visible: true }).count())) break;
    }
    const cierra = p.locator('[data-pace-modal-card] [aria-label]').filter({ visible: true }).filter({ hasText: /×|✕/ });
    if (await p.locator('[data-pace-carta]').filter({ visible: true }).count()) {
      if (await cierra.count()) await cierra.first().click(); else await p.keyboard.press('Escape');
      await p.waitForTimeout(400);
    }
  };
}

module.exports = {
  /* Jornada entera de oficina, de 9 a 17, comida a las 14:00. El martes con reuniones, el miércoles
     cierra el portátil a mediodía y deja PACE abierto toda la noche, el viernes se va antes. */
  oficina: {
    estado: (lang) => base(lang, {
      semanaTipo: ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'],
      horario: { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 },
    }),
    dias: [
      { d: 9, nombre: 'lun', llega: [8, 55], pausa: alterna, noche: 'cerrada', trasPreparar: require('./calendario').ics },
      { d: 10, nombre: 'mar', llega: [8, 52], pausa: alterna, noche: 'cerrada', trasPreparar: require('./calendario').google },
      { d: 11, nombre: 'mie', llega: [8, 58], pausa: alterna, portatil: [12, 50], noche: 'abierta' },
      { d: 12, nombre: 'jue', llega: [9, 0], desdeAbierta: true, pausa: () => 'hacer', noche: 'cerrada' },
      { d: 13, nombre: 'vie', llega: [9, 5], pausa: alterna, salirA: 15 * 60 + 30, noche: 'cerrada' },
    ],
    final: [require('./final').lunesYMartes('dejar', 'no')],
    carta: contesta('dejar', 'no'),
  },

  /* Media jornada de mañana (9-13) de lunes a viernes; el miércoles trabaja el día entero. */
  media: {
    estado: (lang) => base(lang, {
      semanaTipo: ['media', 'media', 'media', 'media', 'media', 'libre', 'libre'],
      horario: { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 },
    }),
    dias: [
      { d: 9, nombre: 'lun', llega: [8, 57], prepara: 'media', pausa: alterna, noche: 'cerrada' },
      { d: 10, nombre: 'mar', llega: [9, 3], prepara: 'media', pausa: () => 'hacer', noche: 'cerrada' },
      { d: 11, nombre: 'mie', llega: [8, 55], prepara: 'distinto:jornada', pausa: alterna, noche: 'abierta' },
      { d: 12, nombre: 'jue', llega: [9, 0], desdeAbierta: true, prepara: 'media', pausa: alterna, noche: 'cerrada' },
      { d: 13, nombre: 'vie', llega: [9, 10], prepara: 'media', pausa: () => 'hacer', noche: 'cerrada' },
    ],
    final: [require('./final').lunesYMartes('vale', 'si')],
    carta: contesta('vale', 'si'),
  },

  /* Jornada de 9 a 17 en el papel, pero llega a las 9:40; se salta casi todas las pausas, cambia la
     primera con «Otra» y el miércoles no abre PACE. */
  salta: {
    estado: (lang) => base(lang, {
      semanaTipo: ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'],
      horario: { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 },
    }),
    dias: [
      { d: 9, nombre: 'lun', llega: [9, 40], pausa: (k) => (k === 1 ? 'otra' : k === 4 ? 'hacer:some' : 'saltar'), vuelve: () => 1, noche: 'cerrada' },
      { d: 10, nombre: 'mar', llega: [9, 41], pausa: (k) => (k === 1 ? 'otra' : 'saltar'), vuelve: () => 1, noche: 'abierta' },
      { d: 11, nombre: 'mie', noAbre: true },
      { d: 12, nombre: 'jue', llega: [9, 39], desdeAbierta: true, pausa: (k) => (k === 1 ? 'otra' : 'saltar'), vuelve: () => 1, noche: 'cerrada' },
      { d: 13, nombre: 'vie', llega: [9, 42], pausa: (k) => (k === 3 ? 'hacer' : 'saltar'), vuelve: () => 1, noche: 'cerrada' },
    ],
    final: [require('./final').lunesYMartes('vale', 'no')],
    carta: contesta('vale', 'no'),
  },
};
