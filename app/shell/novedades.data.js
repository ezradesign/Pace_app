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
    id: 'junto-a-la-mesa',
    desde: '2026-11-24',
    es: [
      'Sin plan, la pausa te propone solo lo que cabe junto a la mesa: nada de suelo.',
      'En «Antes de empezar», el botón «Empezar» se ve siempre, también en las rutinas largas.',
    ],
    en: [
      'Without a plan, the break only suggests what fits at your desk: nothing on the floor.',
      'In «Before you start», the «Start» button is always in view, even in long routines.',
    ],
  },
  {
    id: 'ahora-no',
    desde: '2026-11-24',
    es: [
      '«¿Cuánto trabajas hoy?» tiene «Ahora no»: cierra la pregunta y vuelven Respira, Estira, Mueve e Hidrátate.',
      'Las cifras de Estadísticas y Logros se leen mejor, y una semana vacía lo dice.',
    ],
    en: [
      '“How long are you working today?” has “Not now”: it closes the question and brings back Breathe, Stretch, Move and Hydrate.',
      'Numbers in Stats and Achievements read better, and an empty week says so.',
    ],
  },
  {
    id: 'barra-deshacer-vaso',
    desde: '2026-11-23',
    es: [
      'Si sumas un vaso sin querer desde el panel, «Deshacer» lo quita durante unos segundos.',
      'El panel dice «2 días seguidos», el último logro ocupa una línea, y en el ordenador Ctrl + \\ lo pliega y lo despliega.',
    ],
    en: [
      'If you add a glass by mistake from the panel, “Undo” takes it back for a few seconds.',
      'The panel says “2 days in a row”, the latest achievement takes one line, and on a computer Ctrl + \\ folds and unfolds it.',
    ],
  },
  {
    id: 'minutos-se-quedan',
    desde: '2026-11-23',
    es: [
      'Con el día servido, los minutos que eliges encima del aro se quedan hasta que empiezas el bloque.',
    ],
    en: [
      'With your day served, the minutes you pick above the ring stay until you start the block.',
    ],
  },
  {
    id: 'comida-en-el-aro',
    desde: '2026-11-23',
    es: [
      'Si abres PACE en plena comida, el aro te dice cuánto te queda de comida en vez de invitarte a empezar un bloque.',
      'Al acabar un bloque, la pausa dice «Bloque terminado», y Estadísticas cuenta los minutos de cada rutina.',
    ],
    en: [
      'If you open PACE in the middle of lunch, the ring tells you how much lunch is left instead of inviting you to start a block.',
      'When a block ends, the break says “Block done”, and Stats counts each routine’s own minutes.',
    ],
  },
  {
    id: 'home-ampliada',
    desde: '2026-11-22',
    es: [
      'Si amplías el navegador, la home ya no se descuadra: el aro y lo de dentro se encogen juntos, y con el día servido la línea enseña solo las horas.',
    ],
    en: [
      'If you zoom in your browser, the home no longer falls apart: the ring and what is inside shrink together, and with your day served the line shows just the times.',
    ],
  },
  {
    id: 'miniventana-sola',
    desde: '2026-11-21',
    es: [
      'En el ordenador, la miniventana se abre sola al empezar un Foco; si la cierras, PACE deja de abrirla sola.',
      '«¿Te ayudó esta pausa?» sale menos: tres veces por rutina y después una vez por semana.',
    ],
    en: [
      'On your computer, the mini window opens by itself when you start Focus; close it and PACE stops opening it.',
      '“Did this break help?” shows up less: three times per routine, then once a week.',
    ],
  },
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
