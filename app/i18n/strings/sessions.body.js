/* PACE · strings i18n — CUERPO (Mueve / Estira) · s148
   Extraído de `strings/sessions.js`, que llegó a 502 líneas. Es el dominio más
   grande del split de s81 y el único que había vuelto a pasarse del límite de
   CLAUDE.md sin que la tabla de deuda lo registrara.

   Qué se lleva: todo lo del runner de cuerpo, que era un bloque contiguo en los
   dos idiomas y con la misma frontera en ambos.
     - lib.move.* / lib.extra.*  (bibliotecas de Mueve y Estira)
     - move.* de sesión           (pasos extra, contrato v1, método, cadencia)
     - runner guiado              (reps con tempo, transición de lado)
     - capa editorial s114        (rótulo «Cuídate» + labels de pantalla final)
     - el descanso que guía s114  (qué serie viene + aviso al acabar)

   Qué NO se lleva y sigue en `sessions.js`: session.* · common.* · focus.* ·
   breathe.* · lib.breathe.* · hydrate.* · el modal de seguridad · el
   constructor de rutinas · el feedback del cierre.

   ES Y EN VAN JUNTOS, en este mismo archivo. Es la decisión s81 y no es
   estética: separar por idioma obliga a tocar dos archivos por cada clave y es
   así como aparecen las claves huérfanas que I18N-2 quiere cazar.

   ORDEN DE CARGA: después de `_bootstrap.js` (que crea PACE_STRINGS vacío) y
   antes de `useT.jsx`. Va justo detrás de `sessions.js`, aunque entre dominios
   el orden da igual: no hay claves compartidas. Lo que SÍ tiene que seguir
   cargando al final es `content/*`, que patchea inglés y depende de ir último
   para conservar el override de `breathe.phase.*` (deuda D-1).
*/

Object.assign(window.PACE_STRINGS.es, {
    // Move Library
    'lib.move.title':                  'Mueve',
    'lib.move.subtitle':               'Calistenia y fuerza. Corto, discreto, sin equipo.',
    'lib.move.meta':                   'Cuerpo activo',

    // Extra Library
    'lib.extra.title':                 'Estira',
    'lib.extra.subtitle':              'Movilidad y estiramientos. Antídoto a la silla.',
    'lib.extra.meta':                  'Afloja tensión',

    /* Intensidad y nivel tecnico (§29.2 del audit). Son DOS ejes distintos y
       no se mezclan: un ejercicio puede ser tecnicamente sencillo pero intenso,
       o tecnicamente complejo y fisicamente suave. La intensidad la dicen
       TODAS las rutinas; el nivel solo se ensena cuando NO es basico, para no
       llenar de pastillas las 16 tarjetas accesibles. */
    'lib.intensity.gentle':            'Suave',
    'lib.intensity.moderate':          'Medio',
    'lib.intensity.strong':            'Intenso',
    'lib.level.intermediate':          'Intermedio',
    'lib.level.advanced':              'Avanzado',

    /* Preview antes de empezar (§18.3). Los requisitos vivian metidos a mano
       dentro de la descripcion de 16 de las 28 rutinas —«Silla estable y sin
       ruedas», «Necesitas pared; barra opcional»— porque no tenian sitio. Este
       es el sitio. */
    'preview.tag':                     'Antes de empezar',
    'preview.need':                    'Qué necesitas',
    'preview.need.none':               'Nada. Solo tú y donde estás.',
    'preview.position':                'Posición',
    'preview.steps':                   'Los pasos',
    'preview.start':                   'Empezar',
    'preview.eq.stableDesk':           'Una mesa estable',
    'preview.eq.stableChair':          'Una silla estable, sin ruedas',
    'preview.eq.bar':                  'Una barra firme',
    'preview.eq.wall':                 'Una pared libre',
    'preview.eq.cushionOptional':      'Un cojín, si lo necesitas',
    'preview.eq.deskOptional':         'Una mesa, si la necesitas',
    'preview.eq.barOptional':          'Una barra, si la tienes',
    'preview.eq.floor':                'Sitio para tumbarte en el suelo',
    'preview.pos.standing':            'De pie',
    'preview.pos.seated':              'Sentado',
    'preview.pos.floor':               'En el suelo',
    'preview.pos.halfKneeling':        'Media rodilla',
    'preview.pos.supine':              'Boca arriba',

    // Move Session (additional)
    'move.steps':                      'Pasos',
    'move.prepCopy':                   'De pie. Sin prisa. {n} pasos.',
    'move.next.prefix':                'Siguiente:',
    'move.finish':                     'Terminar',
    'move.hint':                       '← → navegar · Espacio pausar · Esc salir',

    // Contrato de pasos v1 (s110 · B2.2 · método s111 · guiado s113)
    'session.place':                   'Colócate',
    'session.beginStep':               'Empezar',
    'session.beginNow':                'Empezar ya',
    'session.moreTime':                'Más tiempo',
    'session.placeCountdown':          'para empezar',
    'session.sideLeft':                'Izquierda',
    'session.sideRight':               'Derecha',
    'session.sideChange':              'Cambia de lado',
    'session.sideNext':                'Ahora: {side}',
    'session.skip':                    'Saltar',
    'session.restLabel':               'Descanso',
    'move.reps':                       'reps',
    'move.placeHint':                  'Colócate sin prisa · arranca solo · «Empezar ya» para saltar',
    'session.imReady':                 'Estoy listo',
    'session.sideFirst':               'Empiezas por: {side}',
    'move.placeReadyHint':             'Sin prisa · el ejercicio espera a que estés en posición',
    // Runner guiado (s113): reps con cadencia + transición auto de lado
    'move.repsOf':                     'de {n} reps',
    'move.finishEarly':                'Terminar antes',
    'move.sideAutoHint':               'El lado siguiente empieza solo',
    // Capa editorial (s114): rótulo «Cuídate» + labels de la pantalla final
    'move.careLabel':                  'Cuídate',
    'move.series':                     'Series',
    'move.repsCount':                  'Reps',
    // El descanso guía (s114): qué serie viene + aviso al final del descanso
    'move.restNext':                   'Luego: {name}',
    'move.restReady':                  'Prepárate para seguir',
});

Object.assign(window.PACE_STRINGS.en, {
    // Move Library
    'lib.move.title':                  'Move',
    'lib.move.subtitle':               'Calisthenics and strength. Short, discreet, no equipment.',
    'lib.move.meta':                   'Active body',

    // Extra Library
    'lib.extra.title':                 'Stretch',
    'lib.extra.subtitle':              'Mobility and stretching. Antidote to the chair.',
    'lib.extra.meta':                  'Release tension',

    'lib.intensity.gentle':            'Gentle',
    'lib.intensity.moderate':          'Moderate',
    'lib.intensity.strong':            'Strong',
    'lib.level.intermediate':          'Intermediate',
    'lib.level.advanced':              'Advanced',

    'preview.tag':                     'Before you start',
    'preview.need':                    'What you need',
    'preview.need.none':               'Nothing. Just you and wherever you are.',
    'preview.position':                'Position',
    'preview.steps':                   'The steps',
    'preview.start':                   'Start',
    'preview.eq.stableDesk':           'A stable desk',
    'preview.eq.stableChair':          'A stable chair, no wheels',
    'preview.eq.bar':                  'A sturdy bar',
    'preview.eq.wall':                 'A clear wall',
    'preview.eq.cushionOptional':      'A cushion, if you need one',
    'preview.eq.deskOptional':         'A desk, if you need one',
    'preview.eq.barOptional':          'A bar, if you have one',
    'preview.eq.floor':                'Room to lie on the floor',
    'preview.pos.standing':            'Standing',
    'preview.pos.seated':              'Seated',
    'preview.pos.floor':               'On the floor',
    'preview.pos.halfKneeling':        'Half kneeling',
    'preview.pos.supine':              'Lying face up',

    // Move Session (additional)
    'move.steps':                      'Steps',
    'move.prepCopy':                   'Stand up. No rush. {n} steps.',
    'move.next.prefix':                'Next:',
    'move.finish':                     'Finish',
    'move.hint':                       '← → navigate · Space pause · Esc exit',

    // Step contract v1 (s110 · B2.2 · method s111 · guided s113)
    'session.place':                   'Get set',
    'session.beginStep':               'Begin',
    'session.beginNow':                'Begin now',
    'session.moreTime':                'More time',
    'session.placeCountdown':          'to begin',
    'session.sideLeft':                'Left',
    'session.sideRight':               'Right',
    'session.sideChange':              'Switch sides',
    'session.sideNext':                'Now: {side}',
    'session.skip':                    'Skip',
    'session.restLabel':               'Rest',
    'move.reps':                       'reps',
    'move.placeHint':                  'Get set, no rush · starts on its own · "Begin now" to skip',
    'session.imReady':                 'I\'m ready',
    'session.sideFirst':               'Start with: {side}',
    'move.placeReadyHint':             'No rush · the exercise waits until you\'re in position',
    // Guided runner (s113): cadenced reps + auto side transition
    'move.repsOf':                     'of {n} reps',
    'move.finishEarly':                'Finish early',
    'move.sideAutoHint':               'The next side starts on its own',
    // Editorial layer (s114): «Take care» label + final-screen stat labels
    'move.careLabel':                  'Take care',
    'move.series':                     'Sets',
    'move.repsCount':                  'Reps',
    // The rest guides (s114): which set is next + heads-up as rest ends
    'move.restNext':                   'Next: {name}',
    'move.restReady':                  'Get ready to continue',
});

