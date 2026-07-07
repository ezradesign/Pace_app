/* PACE - strings i18n - sessions (sesion 81 / v0.33.1)
   Extraido de strings.js en split por dominio.
   Patches window.PACE_STRINGS.{es,en} con keys de las actividades vivas:
     - session.*               (shell + prep + done compartidos)
     - common.*                (close/time/rounds/breaths/of compartidos)
     - lib.*                   (etiquetas comunes de biblioteca)
     - focus.*                 (FocusTimer)
     - breathe.phase.*         (etiquetas de fase de respiracion)
     - breathe.prepCopy/doneCopy (sesion guiada)
     - breathe.safety.*        (modal de seguridad de Rondas/Wim Hof)
     - lib.breathe.*           (BreatheLibrary)
     - move.*                  (Estira sesion + Move pasos)
     - lib.move.*              (MoveLibrary - Mueve)
     - lib.extra.*             (ExtraLibrary - Estira)
     - hydrate.*               (HydrateModule)
   Carga DESPUES de _bootstrap.js y ANTES de useT.jsx.
*/

Object.assign(window.PACE_STRINGS.es, {
    // Session (compartido: shell + prep + done)
    'session.exit':                    '× Salir',
    'session.prep':                    'Prepárate',
    'session.startNow':                'Empezar ahora',
    'session.backToHome':              'Volver al inicio',
    'session.doneMeta':                'Sesión completada',
    'session.antidoteDone':            'Antídoto completado',
    'session.hold':                    'Retén sin aire',
    'session.breatheAgain':            'Respirar de nuevo',
    'session.holdCue':                 'Pulsa cuando sientas la necesidad de respirar.',
    'session.minutes':                 'minutos',
    'session.seconds':                 'segundos',
    'session.hint':                    'Espacio pausar · Esc salir',
    'session.resume':                  '▶ Reanudar',
    'session.pause':                   '❚❚ Pausar',
    'session.finish':                  '▶| Terminar',
    'session.round':                   'Ronda',

    // Move / Extra (pasos)
    'move.stepCount':                  'Paso {current} de {total}',
    'move.nextStep':                   'Siguiente',
    'move.lastStep':                   'Último paso',
    'move.prev':                       '← Anterior',
    'move.next':                       'Siguiente →',
    'move.doneMeta':                   'Antídoto completado',
    'move.doneCopy':                   'El cuerpo vuelve a sentirse tuyo.',

    // Focus
    'focus.minutes.custom.title':      'Minutos personalizados (1–180)',
    'focus.cycle':                     'Ciclo',
    'focus.min':                       'Min',
    'focus.other':                     'Otro',
    'focus.restart':                   'Reiniciar',
    'focus.start':                     'Comenzar',
    'focus.pause':                     'Pausar',
    'focus.continue':                  'Continuar',
    'focus.mode.focus':                'Foco',
    'focus.mode.pause':                'Pausa corta',
    'focus.mode.long':                 'Pausa larga',
    'focus.subtitle.focus':            'Concentración profunda',
    'focus.subtitle.pause':            'Desconecta 5 min',
    'focus.subtitle.long':             'Pausa larga · estira y respira',

    // Common (compartido entre sesiones)
    'common.close':                    'Cerrar',
    'common.time':                     'Tiempo',
    'common.rounds':                   'Rondas',
    'common.breaths':                  'Respiraciones',
    'common.breath':                   'Respiración',
    'common.of':                       'de',

    // Breathe (fases de sesión activa)
    'breathe.phase.inhala':            'Inhala',
    'breathe.phase.exhala':            'Exhala',
    'breathe.phase.sosten':            'Sostén',
    'breathe.phase.inhala.mas':        'Inhala más',
    'breathe.phase.inhala.oceanica':   'Inhala oceánica',
    'breathe.phase.exhala.oceanica':   'Exhala oceánica',
    'breathe.phase.inhala.izq':        'Inhala izq.',
    'breathe.phase.inhala.dcha':       'Inhala dcha.',
    'breathe.phase.exhala.dcha':       'Exhala dcha.',
    'breathe.phase.exhala.izq':        'Exhala izq.',
    'breathe.phase.respira':           'Respira',
    'breathe.phase.inhala.vientre':    'Inhala al vientre',
    'breathe.phase.exhala.zumbando':   'Exhala zumbando',
    'breathe.phase.sosten.vacio':      'Sostén en vacío',

    // Breathe (sesión)
    'breathe.prepCopy':                'Siéntate cómodo. Respira natural.',
    'breathe.doneCopy':                'Tu cuerpo ha encontrado su ritmo.',

    // Libraries (compartido)
    'lib.tag':                         'Biblioteca',
    'lib.routines':                    'Rutinas',

    // Breathe Library
    'lib.breathe.title':               'Respiración',
    'lib.breathe.subtitle':            'Breathwork guiado: pranayamas, coherencia, rondas.',

    // Move Library
    'lib.move.title':                  'Mueve',
    'lib.move.subtitle':               'Calistenia y fuerza. Corto, discreto, sin equipo.',
    'lib.move.meta':                   'Cuerpo activo',

    // Extra Library
    'lib.extra.title':                 'Estira',
    'lib.extra.subtitle':              'Movilidad y estiramientos. Antídoto a la silla.',
    'lib.extra.meta':                  'Afloja tensión',

    // Move Session (additional)
    'move.steps':                      'Pasos',
    'move.prepCopy':                   'De pie. Sin prisa. {n} pasos.',
    'move.next.prefix':                'Siguiente:',
    'move.finish':                     'Terminar',
    'move.hint':                       '← → navegar · Espacio pausar · Esc salir',

    // Hydrate
    'hydrate.tag':                     'Hidratación',
    'hydrate.title':                   'Hidrátate',
    'hydrate.subtitle':                'Un sorbo ahora, un regalo a tu yo de las 5.',
    'hydrate.glasses.today':           'Vasos hoy',
    'hydrate.less':                    'Un vaso menos',
    'hydrate.more':                    'Un vaso más',
    'hydrate.tip.label':               'Tip:',
    'hydrate.tip':                     'Llena una botella de 500 ml por la mañana y otra después de comer. Dos botellas = 4 vasos. Hecho.',

    // BreatheLibrary safety modal
    'breathe.safety.before':           'Antes de empezar',
    'breathe.safety.check':            'Lo he leído y asumo mi responsabilidad',
    'breathe.safety.cancel':           'Cancelar',
    'breathe.safety.start':            'Empezar sesión',
    'breathe.safety.required':         'Requiere lectura de seguridad',
    'breathe.safety.body.intro.pre':   'Esta técnica implica ',
    'breathe.safety.body.intro.bold':  'hiperventilación controlada y apnea',
    'breathe.safety.body.intro.post':  '. Puede causar mareo, cosquilleo o desmayo.',
    'breathe.safety.body.rule1.pre':   'Practícala ',
    'breathe.safety.body.rule1.bold':  'sentado o tumbado',
    'breathe.safety.body.rule1.post':  ', nunca de pie',
    'breathe.safety.body.rule2':       'Nunca en el agua, conduciendo ni en altura',
    'breathe.safety.body.rule3':       'No la hagas si tienes epilepsia, hipertensión o cardiopatía, ni embarazada',
    'breathe.safety.body.rule4':       'Detente si te mareas o sientes molestias',
});

Object.assign(window.PACE_STRINGS.en, {
    // Session (shared: shell + prep + done)
    'session.exit':                    '× Exit',
    'session.prep':                    'Get ready',
    'session.startNow':                'Start now',
    'session.backToHome':              'Back to home',
    'session.doneMeta':                'Session completed',
    'session.antidoteDone':            'Antidote completed',
    'session.hold':                    'Hold your breath',
    'session.breatheAgain':            'Breathe again',
    'session.holdCue':                 'Press when you feel the need to breathe.',
    'session.minutes':                 'minutes',
    'session.seconds':                 'seconds',
    'session.hint':                    'Space pause · Esc exit',
    'session.resume':                  '▶ Resume',
    'session.pause':                   '❚❚ Pause',
    'session.finish':                  '▶| Finish',
    'session.round':                   'Round',

    // Move / Extra (steps)
    'move.stepCount':                  'Step {current} of {total}',
    'move.nextStep':                   'Next',
    'move.lastStep':                   'Last step',
    'move.prev':                       '← Previous',
    'move.next':                       'Next →',
    'move.doneMeta':                   'Antidote completed',
    'move.doneCopy':                   'Your body feels like yours again.',

    // Focus
    'focus.minutes.custom.title':      'Custom minutes (1–180)',
    'focus.cycle':                     'Cycle',
    'focus.min':                       'Min',
    'focus.other':                     'Other',
    'focus.restart':                   'Restart',
    'focus.start':                     'Start',
    'focus.pause':                     'Pause',
    'focus.continue':                  'Continue',
    'focus.mode.focus':                'Focus',
    'focus.mode.pause':                'Short break',
    'focus.mode.long':                 'Long break',
    'focus.subtitle.focus':            'Deep focus',
    'focus.subtitle.pause':            'Disconnect for 5 min',
    'focus.subtitle.long':             'Long break · stretch and breathe',

    // Common (shared across sessions)
    'common.close':                    'Close',
    'common.time':                     'Time',
    'common.rounds':                   'Rounds',
    'common.breaths':                  'Breaths',
    'common.breath':                   'Breath',
    'common.of':                       'of',

    // Breathe (active session phases)
    'breathe.phase.inhala':            'Inhale',
    'breathe.phase.exhala':            'Exhale',
    'breathe.phase.sosten':            'Hold',
    'breathe.phase.inhala.mas':        'Inhale more',
    'breathe.phase.inhala.oceanica':   'Ocean inhale',
    'breathe.phase.exhala.oceanica':   'Ocean exhale',
    'breathe.phase.inhala.izq':        'Inhale left',
    'breathe.phase.inhala.dcha':       'Inhale right',
    'breathe.phase.exhala.dcha':       'Exhale right',
    'breathe.phase.exhala.izq':        'Exhale left',
    'breathe.phase.respira':           'Breathe',
    'breathe.phase.inhala.vientre':    'Inhale into the belly',
    'breathe.phase.exhala.zumbando':   'Humming exhale',
    'breathe.phase.sosten.vacio':      'Hold empty',

    // Breathe (session)
    'breathe.prepCopy':                'Sit comfortably. Breathe naturally.',
    'breathe.doneCopy':                'Your body has found its rhythm.',

    // Libraries (shared)
    'lib.tag':                         'Library',
    'lib.routines':                    'Routines',

    // Breathe Library
    'lib.breathe.title':               'Breathing',
    'lib.breathe.subtitle':            'Guided breathwork: pranayamas, coherence, rounds.',

    // Move Library
    'lib.move.title':                  'Move',
    'lib.move.subtitle':               'Calisthenics and strength. Short, discreet, no equipment.',
    'lib.move.meta':                   'Active body',

    // Extra Library
    'lib.extra.title':                 'Stretch',
    'lib.extra.subtitle':              'Mobility and stretching. Antidote to the chair.',
    'lib.extra.meta':                  'Release tension',

    // Move Session (additional)
    'move.steps':                      'Steps',
    'move.prepCopy':                   'Stand up. No rush. {n} steps.',
    'move.next.prefix':                'Next:',
    'move.finish':                     'Finish',
    'move.hint':                       '← → navigate · Space pause · Esc exit',

    // Hydrate
    'hydrate.tag':                     'Hydration',
    'hydrate.title':                   'Hydrate',
    'hydrate.subtitle':                "A sip now, a gift to your 5 o'clock self.",
    'hydrate.glasses.today':           'Glasses today',
    'hydrate.less':                    'One less glass',
    'hydrate.more':                    'One more glass',
    'hydrate.tip.label':               'Tip:',
    'hydrate.tip':                     'Fill a 500 ml bottle in the morning and another after lunch. Two bottles = 4 glasses. Done.',

    // BreatheLibrary safety modal
    'breathe.safety.before':           'Before you start',
    'breathe.safety.check':            'I have read this and accept responsibility',
    'breathe.safety.cancel':           'Cancel',
    'breathe.safety.start':            'Start session',
    'breathe.safety.required':         'Safety briefing required',
    'breathe.safety.body.intro.pre':   'This technique involves ',
    'breathe.safety.body.intro.bold':  'controlled hyperventilation and breath holds',
    'breathe.safety.body.intro.post':  '. It can cause dizziness, tingling or fainting.',
    'breathe.safety.body.rule1.pre':   'Practice it ',
    'breathe.safety.body.rule1.bold':  'sitting or lying down',
    'breathe.safety.body.rule1.post':  ', never standing',
    'breathe.safety.body.rule2':       'Never in water, while driving or at height',
    'breathe.safety.body.rule3':       'Do not practice if you have epilepsy, hypertension or heart disease, or if pregnant',
    'breathe.safety.body.rule4':       'Stop if you feel dizzy or uncomfortable',
});
