/* PACE - strings i18n - paths (sesion 81 / v0.33.1)
   Extraido de strings.js en split por dominio.
   Patches window.PACE_STRINGS.{es,en} con keys de:
     - path.runner.*       (PathRunner overlay + transiciones, s50/s77)
     - path.hydrate.*      (PathHydrateStep, s78)
     - path.error.*        (StepError fallback)
     - path.card.*         (SuggestedPathCard, s53)
     - paths.path.*        (nombres + taglines sensoriales, s75)
     - paths.kind.*        (nombres de bloque en SenderoBar, s75)
     - paths.library.*     (PathsLibrary overlay, s53)
     - paths.suggested.*   (SuggestedPathCard CTA y favorito, s53)
     - paths.runner.repeat (CompletionScreen repeat, s53)
   Carga DESPUES de _bootstrap.js y ANTES de useT.jsx.
*/

Object.assign(window.PACE_STRINGS.es, {
    // Caminos - PathRunner (sesion 50)
    'paths.runner.exit':              'Salir del camino',
    'paths.runner.exitConfirmTitle':  'Salir del camino?',
    'paths.runner.exitConfirmBody':   'Perderas el progreso de este camino.',
    'paths.runner.exitConfirmYes':    'Si, salir',
    'paths.runner.exitConfirmNo':     'Seguir',
    'paths.runner.skip':              'Saltar',
    'paths.runner.next':              'Siguiente',
    'paths.runner.done':              'Hecho',
    'paths.runner.complete.title':    'Camino completado',
    'paths.runner.complete.body':     'Has terminado {name}.',
    'paths.runner.complete.back':     'Volver',
    'paths.runner.complete.recorrido':'Recorrido',
    // s100: meta editorial + kicker de logros de CompletionScreen
    'paths.runner.complete.steps':    '{n} pasos',
    'paths.runner.complete.achievements': 'Desbloqueado',
    'paths.runner.transition.continue':'toca para continuar',
    'paths.hydrate.copy':             'Si te apetece, suma un vaso.',
    'paths.hydrate.drank':            'Beber',
    'paths.hydrate.glasses.today':    'Vasos hoy',
    'paths.error.routineNotFound':    'Rutina no encontrada: {id}',
    // Caminos - nombres y taglines (sesion 75 - renombrado sensorial)
    'paths.path.dawn.name':           'Morning Glory',
    'paths.path.dawn.tagline':        'Una flor que abre con la primera luz.',
    'paths.path.midday.name':         'Hierbabuena',
    'paths.path.midday.tagline':      'Para cuando el cuerpo pide moverse antes que la cabeza.',
    'paths.path.afternoon.name':      'Chispa de Cerilla',
    'paths.path.afternoon.tagline':   'Un golpe seco y vuelve la chispa.',
    'paths.path.dusk.name':           'Lámpara de Mesa',
    'paths.path.dusk.tagline':        'Un círculo de luz, todo lo demás en penumbra.',
    'paths.path.weekend.name':        'Ventana Abierta',
    'paths.path.weekend.tagline':     'Dejar entrar lo que el día traiga, sin moverse.',
    'paths.path.tea.name':            'Infusión',
    'paths.path.tea.tagline':         'Un vapor breve, y la tarde recobra forma.',
    'paths.path.breath.name':         'Hálito',
    'paths.path.breath.tagline':      'Dos vientos cortos para volver.',
    // Caminos - nombres de bloque por kind (sesion 75 - SenderoBar)
    'paths.kind.breathe.name':        'Respira',
    'paths.kind.focus.name':          'Foco',
    'paths.kind.body.name':           'Cuerpo',
    'paths.kind.hydrate.name':        'Agua',
    // Paths - biblioteca y favoritos (sesion 53)
    'paths.library.title':            'Todos los caminos',
    'paths.library.count.one':        '1 camino',
    'paths.library.count.many':       '{n} caminos',
    'paths.library.start':            'Comenzar',
    'paths.library.doneToday':        'Hecho hoy',
    'paths.library.favorite':         'Favorito',
    'paths.library.unfavorite':       'Quitar favorito',
    'paths.library.viewAll':          'Ver caminos',
    'paths.suggested.label':          'Camino sugerido',
    'paths.suggested.favorite':       'Camino favorito',
    'paths.suggested.approxMin':      '~{n} min',
    'paths.suggested.guidedSteps':    'Rutina guiada · {n} pasos',
    'paths.runner.repeat':            'Repetir camino',
    'paths.card.start':                'Iniciar camino',
});

Object.assign(window.PACE_STRINGS.en, {
    // Paths - PathRunner (session 50)
    'paths.runner.exit':              'Exit path',
    'paths.runner.exitConfirmTitle':  'Exit path?',
    'paths.runner.exitConfirmBody':   'You will lose progress on this path.',
    'paths.runner.exitConfirmYes':    'Yes, exit',
    'paths.runner.exitConfirmNo':     'Stay',
    'paths.runner.skip':              'Skip',
    'paths.runner.next':              'Next',
    'paths.runner.done':              'Done',
    'paths.runner.complete.title':    'Path completed',
    'paths.runner.complete.body':     'You finished {name}.',
    'paths.runner.complete.back':     'Back',
    'paths.runner.complete.recorrido':'Journey',
    // s100: CompletionScreen editorial meta + achievements kicker
    'paths.runner.complete.steps':    '{n} steps',
    'paths.runner.complete.achievements': 'Unlocked',
    'paths.runner.transition.continue':'tap to continue',
    'paths.hydrate.copy':             'If you feel like it, add a glass.',
    'paths.hydrate.drank':            'Drink',
    'paths.hydrate.glasses.today':    'Glasses today',
    'paths.error.routineNotFound':    'Routine not found: {id}',
    // Paths - names and taglines (session 75 - sensory renaming)
    'paths.path.dawn.name':           'Morning Glory',
    'paths.path.dawn.tagline':        'A flower that opens with the first light.',
    'paths.path.midday.name':         'Spearmint',
    'paths.path.midday.tagline':      'For when the body asks to move before the mind.',
    'paths.path.afternoon.name':      'Matchstrike',
    'paths.path.afternoon.tagline':   'A dry strike, and the spark returns.',
    'paths.path.dusk.name':           'Desk Lamp',
    'paths.path.dusk.tagline':        'A circle of light, everything else in shadow.',
    'paths.path.weekend.name':        'Open Window',
    'paths.path.weekend.tagline':     'Letting in whatever the day brings, without moving.',
    'paths.path.tea.name':            'Steeping',
    'paths.path.tea.tagline':         'A brief steam, and the afternoon takes shape again.',
    'paths.path.breath.name':         'Breath',
    'paths.path.breath.tagline':      'Two short winds to return.',
    // Paths - block names by kind (session 75 - SenderoBar)
    'paths.kind.breathe.name':        'Breathe',
    'paths.kind.focus.name':          'Focus',
    'paths.kind.body.name':           'Body',
    'paths.kind.hydrate.name':        'Water',
    // Paths - library and favorites (session 53)
    'paths.library.title':            'All paths',
    'paths.library.count.one':        '1 path',
    'paths.library.count.many':       '{n} paths',
    'paths.library.start':            'Start',
    'paths.library.doneToday':        'Done today',
    'paths.library.favorite':         'Favorite',
    'paths.library.unfavorite':       'Remove favorite',
    'paths.library.viewAll':          'Browse paths',
    'paths.suggested.label':          'Suggested path',
    'paths.suggested.favorite':       'Favorite path',
    'paths.suggested.approxMin':      '~{n} min',
    'paths.suggested.guidedSteps':    'Guided routine · {n} steps',
    'paths.runner.repeat':            'Repeat path',
    'paths.card.start':                'Start path',
});
