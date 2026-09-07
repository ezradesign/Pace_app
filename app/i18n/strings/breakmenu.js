/* PACE · strings i18n — EL MENU DE PAUSA (s187)
   Extraido de `strings/ui.js`, que llego a 503 lineas al entrar la PROPUESTA
   del menu (regla §1 de CLAUDE.md). Es el mismo movimiento que hizo s81 con el
   split por dominio y que repitio s148 con el cuerpo: cuando un dominio crece,
   sale entero en vez de repartirse.

   Se lleva TODO `break.*` -- las cuatro tarjetas y la propuesta-, no solo lo
   nuevo: partir un prefijo entre dos archivos habria sido peor que el problema
   que resuelve.

   Carga DESPUES de _bootstrap.js y ANTES de useT.jsx, como sus hermanos. */

Object.assign(window.PACE_STRINGS.es, {
    'break.tag':                     'Ciclo completado',
    'break.title':                   'Pausa bien hecha',
    'break.subtitle':                'Has cerrado un ciclo de foco. Elige tu micro-pausa.',
    'break.breathe.label':           'Respira',
    'break.breathe.desc':            '2 min para volver al centro',
    'break.stretch.label':           'Estira',
    'break.stretch.desc':            'Afloja la tensión',
    'break.move.label':              'Muévete',
    'break.move.desc':               'Antídoto rápido a la silla',
    'break.water.label':             'Hidrátate',
    'break.water.desc':              'Un vaso ahora',
    'break.done':                    'Ya hecho hoy · otra ronda si quieres',
    'break.prop.sitting':            'Llevas {n} minutos sentado',
    'break.prop.water':              'Aún no has bebido hoy',
    'break.prop.third':              'Tercer bloque de hoy',
    'break.prop.pending.extra':      'Hoy aún no has estirado',
    'break.prop.pending.move':       'Hoy aún no has movido el cuerpo',
    'break.prop.pending.breathe':    'Hoy aún no has respirado',
    'break.prop.meta':               '{n} min · {m}',
    'break.prop.start':              'Empezar',
    'break.recommended':             'Para ti',
    'break.shortcut':                'Atajo: B · E · M · H · Esc',
    'break.skip':                    'Saltar esta pausa',
});

Object.assign(window.PACE_STRINGS.en, {
    'break.tag':                     'Cycle complete',
    'break.title':                   'Well-earned break',
    'break.subtitle':                "You've closed a focus cycle. Choose your micro-break.",
    'break.breathe.label':           'Breathe',
    'break.breathe.desc':            '2 min to return to center',
    'break.stretch.label':           'Stretch',
    'break.stretch.desc':            'Loosen the tension',
    'break.move.label':              'Move',
    'break.move.desc':               'Quick antidote to the chair',
    'break.water.label':             'Hydrate',
    'break.water.desc':              'A glass right now',
    'break.done':                    'Done today · another round if you like',
    'break.prop.sitting':            'You have been sitting for {n} minutes',
    'break.prop.water':              'You have not had any water today',
    'break.prop.third':              'Third block today',
    'break.prop.pending.extra':      'You have not stretched today',
    'break.prop.pending.move':       'You have not moved your body today',
    'break.prop.pending.breathe':    'You have not breathed today',
    'break.prop.meta':               '{n} min · {m}',
    'break.prop.start':              'Start',
    'break.recommended':             'For you',
    'break.shortcut':                'Shortcut: B · E · M · H · Esc',
    'break.skip':                    'Skip this break',
});
