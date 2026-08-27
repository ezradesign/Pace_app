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

    /* ── BIBLIOTECA REDISENADA (s174) ───────────────────────────────────────
       LA FORMA CORTA, NO LA DE `preview.eq.*`. Aquellas son requisitos en
       lista y van en mayuscula y con frase entera («Una silla estable, sin
       ruedas»); estas van EN MEDIO de una linea que se lee en voz alta -- «5
       min · sentado · con silla · por lado»-- y por eso son minusculas y
       preposicionales. No es un duplicado: es otro registro, y meter la frase
       larga aqui dejaria la linea de contexto ilegible. */
    'lib.min':                         'min',
    'lib.now':                         'Para ahora',
    'lib.back':                        'Volver',
    'lib.premium':                     'Premium',
    'lib.perSide':                     'por lado',
    'lib.series':                      '{s} series · {r} reps',
    'lib.filter.title':                'Filtrar',
    'lib.filter.aqui':                 'Aquí mismo',
    'lib.filter.sinmat':               'Sin material',
    // s176 · filtro propio de Respira: sus rutinas no declaran ni postura ni
    // material, así que sus ejes son duración y retención.
    'lib.filter.sinreten':             'Sin retención',
    /* El umbral viaja en la cadena porque es RELATIVO a cada biblioteca: ≤ 2
       min en Mueve y ≤ 4 en Estira (medido en s174). El chip ensena el suyo, y
       asi no miente al cambiar de biblioteca. */
    'lib.filter.short':                '≤ {n} min',
    'lib.where.floor':                 'en el suelo',
    'lib.where.seated':                'sentado',
    'lib.where.standing':              'de pie',
    'lib.gear.stableDesk':             'con mesa',
    'lib.gear.stableChair':            'con silla',
    'lib.gear.bar':                    'con barra',
    'lib.gear.wall':                   'contra la pared',
    'lib.gear.cushionOptional':        'cojín opcional',
    'lib.gear.deskOptional':           'mesa opcional',
    'lib.gear.barOptional':            'barra opcional',
    /* El grupo que se queda a cero al filtrar. Dos formas porque `tn` sustituye
       variables y NO conjuga: con «Las {n}» un grupo de una rutina diria «Las 1
       de flujos piden suelo». Hoy el grupo mas pequeno tiene 2, asi que la
       forma de singular no se ve nunca -- y existe justo para que anadir una
       rutina al catalogo no rompa una frase. */
    'lib.empty.floor.n':               'Las {n} de {g} piden suelo.',
    'lib.empty.floor.1':               'La de {g} pide suelo.',
    'lib.empty.any.n':                 'Las {n} de {g} se quedan fuera de este filtro.',
    'lib.empty.any.1':                 'La de {g} se queda fuera de este filtro.',
    'lib.empty.clear':                 'quitar el filtro',
    /* El RITMO de Respira, que es su informacion mas util y hoy no se lee en
       ninguna pantalla. Los patrones con ciclo se dicen con cifras (4·7·8); los
       que no lo tienen, con su palabra. Cuando lleguen los glifos de ritmo,
       esto es lo que sustituyen. */
    'lib.rhythm.rounds':               '{r} rondas de {b}',
    'lib.rhythm.diaphragm':            'hacia el vientre',
    'lib.rhythm.physiological':        'doble inhalación',
    'lib.rhythm.yin':                  'con reposo al final',
    'lib.rhythm.bhramari':             'con zumbido',
    'lib.rhythm.bhastrika':            'fuelle rápido',
    'lib.rhythm.nadi':                 'alterna',
    'lib.rhythm.kapalabhati':          'exhalaciones cortas',
    'lib.rhythm.co2':                  'sostén en vacío',

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

    /* Biblioteca redisenada (s174) — ver la nota del bloque espanol: forma
       CORTA, no la de `preview.eq.*`. */
    'lib.min':                         'min',
    'lib.now':                         'For now',
    'lib.back':                        'Back',
    'lib.premium':                     'Premium',
    'lib.perSide':                     'per side',
    'lib.series':                      '{s} sets · {r} reps',
    'lib.filter.title':                'Filter',
    'lib.filter.aqui':                 'Right here',
    'lib.filter.sinmat':               'No gear',
    'lib.filter.sinreten':             'No breath holds',
    'lib.filter.short':                '≤ {n} min',
    'lib.where.floor':                 'on the floor',
    'lib.where.seated':                'seated',
    'lib.where.standing':              'standing',
    'lib.gear.stableDesk':             'with a desk',
    'lib.gear.stableChair':            'with a chair',
    'lib.gear.bar':                    'with a bar',
    'lib.gear.wall':                   'against a wall',
    'lib.gear.cushionOptional':        'cushion optional',
    'lib.gear.deskOptional':           'desk optional',
    'lib.gear.barOptional':            'bar optional',
    'lib.empty.floor.n':               'All {n} in {g} need the floor.',
    'lib.empty.floor.1':               'The one in {g} needs the floor.',
    'lib.empty.any.n':                 'All {n} in {g} fall outside this filter.',
    'lib.empty.any.1':                 'The one in {g} falls outside this filter.',
    'lib.empty.clear':                 'clear the filter',
    'lib.rhythm.rounds':               '{r} rounds of {b}',
    'lib.rhythm.diaphragm':            'into the belly',
    'lib.rhythm.physiological':        'double inhale',
    'lib.rhythm.yin':                  'with a rest at the end',
    'lib.rhythm.bhramari':             'with a hum',
    'lib.rhythm.bhastrika':            'fast bellows',
    'lib.rhythm.nadi':                 'alternate nostril',
    'lib.rhythm.kapalabhati':          'short exhales',
    'lib.rhythm.co2':                  'hold on empty',

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

