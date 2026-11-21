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
    id: 'aviso-pc-y-cambios',
    desde: '2026-11-20',
    es: [
      'Si el Foco acaba con PACE detrás, en el ordenador la pestaña dice «Foco terminado» hasta que vuelves.',
      'En Mueve y Estira, cuando toca cambiar de lado o de sentido a mitad de un ejercicio, PACE te lo dice: «Otro lado», «Atrás».',
    ],
    en: [
      'If Focus ends with PACE in the background, on your computer the tab says “Focus done” until you come back.',
      'In Move and Stretch, when it is time to switch sides or direction mid-exercise, PACE tells you: “Other side”, “Back”.',
    ],
  },
  {
    id: 'pausa-a-tu-manera',
    desde: '2026-11-09',
    es: [
      'Si haces la pausa a tu manera, dilo: «Ya la hice por mi cuenta», junto a «Ahora no».',
    ],
    en: [
      'Took your break your own way? Say so: “I did it my own way”, next to “Not now”.',
    ],
  },
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
