/* PACE - strings i18n - onboarding (sesion 106 / v0.51.0)
   Patches window.PACE_STRINGS.{es,en} con las keys del flujo de primera
   vez (app/onboarding/). La pantalla de bienvenida REUTILIZA las keys
   welcome.* de ui.js (tagline, lede, values, lang toggle); aqui viven
   solo las nuevas: navegacion + 3 preguntas de perfil + primer Camino.
   Carga DESPUES de _bootstrap.js y ANTES de useT.jsx.
*/

Object.assign(window.PACE_STRINGS.es, {
    // Navegación del flujo
    'onboarding.back':                 'Atrás',
    'onboarding.next':                 'Continuar',
    'onboarding.skip':                 'prefiero saltarlo',
    'onboarding.skip.question':        'saltar esta pregunta',

    // Pantalla 0 — bienvenida (complementa welcome.* de ui.js)
    'onboarding.welcome.cta':          'Comenzar',
    'onboarding.semana.rotulo':        'Tu semana',        /* V10A de Ez (24 nov.): encima de «¿Cómo es tu semana?» decía «A tu ritmo», antes de saber qué es */
    'onboarding.completo.cta':         'Entrar en PACE',   /* V10A: el último botón dice a dónde vas; el de la bienvenida sigue «Comenzar» */
    'onboarding.welcome.hint':         'Tres preguntas breves. Medio minuto.',
    /* Traer una copia sin pasar la bienvenida (Ez, N3 A, 8 nov.): abre el aviso de importar de Ajustes. */
    'onboarding.copia':                '¿Tienes una copia?',
    'onboarding.copia.traer':          'Tráela',

    // Pantalla 1 — necesidad
    'onboarding.need.kicker':          'Conocerte · 1 de 3',
    'onboarding.need.title':           '¿Qué quieres cultivar?',
    'onboarding.need.calm':            'Calma',
    'onboarding.need.calm.sub':        'bajar el ritmo, soltar tensión',
    'onboarding.need.focus':           'Foco',
    'onboarding.need.focus.sub':       'concentrarme de verdad',
    'onboarding.need.body':            'Cuerpo',
    'onboarding.need.body.sub':        'moverme, deshacer la silla',
    'onboarding.need.energy':          'Energía',
    'onboarding.need.energy.sub':      'activarme, despejar la mente',
    'onboarding.need.free.label':      'O dilo a tu manera',
    'onboarding.need.free.optional':   'opcional',
    'onboarding.need.free.placeholder': 'concentración, calma, movimiento…',

    // Pantalla 2 — tiempo disponible
    'onboarding.time.kicker':          'Conocerte · 2 de 3',
    'onboarding.time.title':           '¿Cuánto tiempo sueles tener?',
    'onboarding.time.short':           'Un respiro',
    'onboarding.time.short.sub':       'unos 5 minutos',
    'onboarding.time.pause':           'Una pausa',
    'onboarding.time.pause.sub':       'unos 15 minutos',
    'onboarding.time.block':           'Un bloque',
    'onboarding.time.block.sub':       '25 minutos o más',

    // Pantalla 3 — entorno
    'onboarding.env.kicker':           'Conocerte · 3 de 3',
    'onboarding.env.title':            '¿Dónde trabajas?',
    'onboarding.env.office':           'En la oficina',
    'onboarding.env.office.sub':       'con gente cerca',
    'onboarding.env.home':             'En casa',
    'onboarding.env.home.sub':         'a mi aire',
    'onboarding.env.mixed':            'Va cambiando',
    'onboarding.env.mixed.sub':        'un poco de ambos',

    // Pantalla 4 — tu primer Camino
    'onboarding.first.kicker':         'Tu primer Camino',
    'onboarding.first.lede':           'Pequeñas rutas guiadas que combinan foco, respiración y movimiento. Esta encaja contigo:',
    'onboarding.first.cta':            'Ver mi Camino',
    'onboarding.first.explore':        'prefiero explorar por mi cuenta',

    // La visita guiada por la home (OnboardingVisita.jsx)
    'visita.paso':                     '{n} de {total}',
    'visita.saltar':                   'Saltar la visita',
    'visita.siguiente':                'Siguiente',
    'visita.fin':                      'Entendido',
    'visita.aro.titulo':               'El aro',
    'visita.aro.texto':                'Elige los minutos arriba y toca «{boton}»: el aro se llena mientras trabajas.',
    'visita.aro.pausa':                'Al acabar te propone una pausa y, la primera vez, te pide permiso para avisarte.',   /* V7B de Ez (24 nov.): seis paradas, cada una en una o dos líneas */
    'visita.act.titulo':               'Actividades',
    'visita.act.texto':                'Respira, Estira y Mueve, con rutinas cortas, e Hidrátate, para el agua. Cuando quieras.',
    'visita.dia.titulo':               'Empieza por tu día',
    'visita.dia.texto':                'Elige cuánto trabajas hoy y PACE reparte tus pausas por la jornada.',
    'visita.arriba.titulo':            'Estadísticas y logros',
    'visita.arriba.texto':             'Lo que has hecho, sin compararte con nadie, y los sellos que llegan solos.',
    'visita.cajon.titulo':             'El menú',
    'visita.columna.titulo':           'A la izquierda',
    'visita.menu.texto':               'Tu semana, el agua de hoy, las bibliotecas y tus rutinas.',
    'visita.ajustes.titulo':           'Ajustes',
    'visita.ajustes.texto':            'Idioma, sonido, avisos y tu semana. En «Tus datos», tu copia; aquí repites la visita.',
});

Object.assign(window.PACE_STRINGS.en, {
    // Flow navigation
    'onboarding.back':                 'Back',
    'onboarding.next':                 'Continue',
    'onboarding.skip':                 'skip for now',
    'onboarding.skip.question':        'skip this question',

    // Screen 0 — welcome (complements welcome.* in ui.js)
    'onboarding.welcome.cta':          'Start',
    'onboarding.semana.rotulo':        'Your week',
    'onboarding.completo.cta':         'Open PACE',
    'onboarding.welcome.hint':         'Three short questions. Half a minute.',
    'onboarding.copia':                'Have a copy?',
    'onboarding.copia.traer':          'Bring it in',

    // Screen 1 — need
    'onboarding.need.kicker':          'About you · 1 of 3',
    'onboarding.need.title':           'What do you want to cultivate?',
    'onboarding.need.calm':            'Calm',
    'onboarding.need.calm.sub':        'slow down, release tension',
    'onboarding.need.focus':           'Focus',
    'onboarding.need.focus.sub':       'stay focused',
    'onboarding.need.body':            'Body',
    'onboarding.need.body.sub':        'move more, take a break from sitting',
    'onboarding.need.energy':          'Energy',
    'onboarding.need.energy.sub':      'wake up, clear my head',
    'onboarding.need.free.label':      'Or say it your way',
    'onboarding.need.free.optional':   'optional',
    'onboarding.need.free.placeholder': 'focus, calm, movement…',

    // Screen 2 — available time
    'onboarding.time.kicker':          'About you · 2 of 3',
    'onboarding.time.title':           'How much time do you usually have?',
    'onboarding.time.short':           'A breather',
    'onboarding.time.short.sub':       'about 5 minutes',
    'onboarding.time.pause':           'A break',
    'onboarding.time.pause.sub':       'about 15 minutes',
    'onboarding.time.block':           'A block',
    'onboarding.time.block.sub':       '25 minutes or more',

    // Screen 3 — environment
    'onboarding.env.kicker':           'About you · 3 of 3',
    'onboarding.env.title':            'Where do you work?',
    'onboarding.env.office':           'At the office',
    'onboarding.env.office.sub':       'people around',
    'onboarding.env.home':             'At home',
    'onboarding.env.home.sub':         'on my own terms',
    'onboarding.env.mixed':            'It varies',
    'onboarding.env.mixed.sub':        'a bit of both',

    // Screen 4 — your first Path
    'onboarding.first.kicker':         'Your first Path',
    'onboarding.first.lede':           'Short guided routes that blend focus, breathing and movement. This one fits you:',
    'onboarding.first.cta':            'See my Path',
    'onboarding.first.explore':        'I’d rather explore on my own',

    // The guided tour of the home (OnboardingVisita.jsx)
    'visita.paso':                     '{n} of {total}',
    'visita.saltar':                   'Skip the tour',
    'visita.siguiente':                'Next',
    'visita.fin':                      'Got it',
    'visita.aro.titulo':               'The ring',
    'visita.aro.texto':                'Choose the minutes above and tap “{boton}”: the ring fills as you work.',
    'visita.aro.pausa':                'When it ends it suggests a break and, the first time, asks to notify you.',
    'visita.act.titulo':               'Activities',
    'visita.act.texto':                'Breathe, Stretch and Move, with short routines, and Hydrate for your water. Whenever you like.',
    'visita.dia.titulo':               'Start with your day',
    'visita.dia.texto':                'Choose how long you work today and PACE spreads your breaks across it.',
    'visita.arriba.titulo':            'Stats and achievements',
    'visita.arriba.texto':             'What you’ve done, without comparing you to anyone, and the stamps that come on their own.',
    'visita.cajon.titulo':             'The menu',
    'visita.columna.titulo':           'On the left',
    'visita.menu.texto':               'Your week, today’s water, the libraries and your routines.',
    'visita.ajustes.titulo':           'Settings',
    'visita.ajustes.texto':            'Language, sound, reminders and your week. Your copy is in “Your data”; take the tour again here.',
});
