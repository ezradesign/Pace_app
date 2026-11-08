/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   LAS NOVEDADES DEL SOBRE: lo más destacado de cada versión, escrito a mano (Ez, 5 nov. 2026: 3A).
   ===========================================================================
   Una o dos cosas por versión que cambien algo que se nota, dichas como las entendería cualquiera: sin
   números de versión, sin nombres internos y sin copiar el CHANGELOG. Una versión que no cambia nada
   visible no escribe nada aquí. La más nueva va PRIMERA: es la única que enseña el sobre.

     id     — único y estable: es lo que guarda `novedadesVistas` al leerla.
     desde  — el día en que sale. Quien empezó con PACE ese día o después no la ve: no son novedades de
              algo que nunca vio (Sobre.novedades.js).
     es, en — las líneas, de una en una y cortas. */

const PACE_NOVEDADES = [
  {
    id: 'jornada-cerrada',
    desde: '2026-11-07',
    es: [
      'Tu jornada se cierra sola al pasar tu hora de salida, con lo que hiciste; si quieres, sigues por libre.',
      'Si dejas abierta la ventana de una pausa, a la mañana siguiente ya no te espera: PACE abre tu día nuevo.',
    ],
    en: [
      'Your workday now wraps up on its own once your finish time has passed, with what you did; you can keep going without a plan.',
      'If you leave a break window open, it no longer waits for you the next morning: PACE opens your new day.',
    ],
  },
  {
    id: 'jornada-y-logros',
    desde: '2026-11-05',
    es: [
      'Todas las horas de tu jornada se cambian ahora paso a paso, con − y +: el inicio, el final y la comida.',
      'En Logros ya no hay una parte «Próximamente»: ahora cuenta los sellos que has reunido.',
    ],
    en: [
      'Every hour of your day now changes step by step, with − and +: the start, the end and lunch.',
      'Achievements no longer has a “Coming soon” part: it now counts the stamps you have collected.',
    ],
  },
];

window.PACE_NOVEDADES = PACE_NOVEDADES;
