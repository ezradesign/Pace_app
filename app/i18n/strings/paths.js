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
    'path.runner.exit':              'Salir del camino',
    'path.runner.exitConfirmTitle':  'Salir del camino?',
    'path.runner.exitConfirmBody':   'Perderas el progreso de este camino.',
    'path.runner.exitConfirmYes':    'Si, salir',
    'path.runner.exitConfirmNo':     'Seguir',
    'path.runner.skip':              'Saltar',
    'path.runner.next':              'Siguiente',
    'path.runner.done':              'Hecho',
    'path.runner.complete.title':    'Camino completado',
    'path.runner.complete.body':     'Has terminado {name}.',
    'path.runner.complete.back':     'Volver',
    'path.runner.complete.recorrido':'Recorrido',
    // s100: meta editorial + kicker de logros de CompletionScreen
    'path.runner.complete.steps':    '{n} pasos',
    'path.runner.complete.achievements': 'Desbloqueado',
    'path.runner.transition.continue':'toca para continuar',
    'path.hydrate.copy':             'Si te apetece, suma un vaso.',
    'path.hydrate.drank':            'Beber',
    'path.hydrate.skip':             'Saltar',
    'path.hydrate.glasses.today':    'Vasos hoy',
    'path.error.routineNotFound':    'Rutina no encontrada: {id}',
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
    'paths.library.viewAll':          'Ver todos',
    'paths.suggested.label':          'Sugerido ahora',
    'paths.suggested.favorite':       'Tu favorito',
    'paths.runner.repeat':            'Repetir camino',
    'path.card.done':                 'Hecho hoy',
    'path.card.start':                'Comenzar',
});

Object.assign(window.PACE_STRINGS.en, {
    // Paths - PathRunner (session 50)
    'path.runner.exit':              'Exit path',
    'path.runner.exitConfirmTitle':  'Exit path?',
    'path.runner.exitConfirmBody':   'You will lose progress on this path.',
    'path.runner.exitConfirmYes':    'Yes, exit',
    'path.runner.exitConfirmNo':     'Stay',
    'path.runner.skip':              'Skip',
    'path.runner.next':              'Next',
    'path.runner.done':              'Done',
    'path.runner.complete.title':    'Path completed',
    'path.runner.complete.body':     'You finished {name}.',
    'path.runner.complete.back':     'Back',
    'path.runner.complete.recorrido':'Journey',
    // s100: CompletionScreen editorial meta + achievements kicker
    'path.runner.complete.steps':    '{n} steps',
    'path.runner.complete.achievements': 'Unlocked',
    'path.runner.transition.continue':'tap to continue',
    'path.hydrate.copy':             'If you feel like it, add a glass.',
    'path.hydrate.drank':            'Drink',
    'path.hydrate.skip':             'Skip',
    'path.hydrate.glasses.today':    'Glasses today',
    'path.error.routineNotFound':    'Routine not found: {id}',
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
    'paths.library.viewAll':          'View all',
    'paths.suggested.label':          'Suggested now',
    'paths.suggested.favorite':       'Your favorite',
    'paths.runner.repeat':            'Repeat path',
    'path.card.done':                 'Done today',
    'path.card.start':                'Start',
});
