/* PACE - strings i18n - stats (sesion 81 / v0.33.1)
   Extraido de strings.js en split por dominio.
   Patches window.PACE_STRINGS.{es,en} con keys de:
     - stats.*               (panel Ritmo / StatsPanel)
     - stats.tab.*           (semana/mes/año/caminos -- s43, s54)
     - stats.month.*         (heatmap mensual -- s43)
     - stats.year.*          (vista anual -- s44)
     - stats.paths.*         (PathStats subpanel -- s54)
   Carga DESPUES de _bootstrap.js y ANTES de useT.jsx.
*/

Object.assign(window.PACE_STRINGS.es, {
    // Stats
    'stats.tag':                       'Estadísticas',
    'stats.title':                     'Ritmo',
    'stats.subtitle':                  'Métricas suaves. Sin ansiedad, sin comparación.',
    'stats.unit.min':                  'min',
    'stats.unit.glasses':              'vasos',
    'stats.note.label':                'Nota:',
    'stats.note':                      'no medimos para juzgarte. Los números están aquí para que reconozcas tus ritmos, no para que los persigas.',
    'stats.days':                      'Lun,Mar,Mié,Jue,Vie,Sáb,Dom',
    // Tabs — sesión 43
    'stats.tab.week':                  'Semana',
    'stats.tab.month':                 'Mes',
    'stats.tab.year':                  'Año',
    // Heatmap mensual — sesión 43
    'stats.month.days.short':          'L,M,X,J,V,S,D',
    'stats.month.total.focus':         'Foco',
    'stats.month.total.breathe':       'Respira',
    'stats.month.total.move':          'Mueve',
    'stats.month.total.water':         'vasos',
    'stats.month.empty':               'Sin actividad',
    'stats.month.coming':              'Próximamente',
    'stats.month.tooltip.focus':       'min foco',
    'stats.month.tooltip.breathe':     'min respira',
    'stats.month.tooltip.move':        'min mueve',
    'stats.month.tooltip.water':       'vasos',
    'stats.month.hours.unit':          'h',
    // Vista anual — sesión 44
    'stats.year.empty':                'Aún no hay actividad en {year}',
    'stats.year.totalActions':         '{n} acciones',
    'stats.year.activeDays':           '{n} días activos',
    'stats.year.maxStreak':            'racha máx: {n} días',
    'stats.year.months.short':         'Ene,Feb,Mar,Abr,May,Jun,Jul,Ago,Sep,Oct,Nov,Dic',
    'stats.year.days.label':           'L,M,X,J,V,S,D',
    'stats.year.legend.less':          'menos',
    'stats.year.legend.more':          'más',
    'stats.year.tooltip.score':        '{n} acciones',

    // Caminos stats -- sesion 54
    'stats.tab.paths':                 'Caminos',
    'stats.paths.title':               'Caminos',
    'stats.paths.total':               'Total completados',
    'stats.paths.currentStreak':       'Racha actual',
    'stats.paths.bestStreak':          'Mejor racha',
    'stats.paths.tableName':           'Camino',
    'stats.paths.tableCount':          'Veces',
    'stats.paths.tableLast':           'Ultimo dia',
    'stats.paths.empty':               'Aun no has completado ningun camino',
    'stats.paths.heatmap':             'Actividad del año',
});

Object.assign(window.PACE_STRINGS.en, {
    // Stats
    'stats.tag':                       'Stats',
    'stats.title':                     'Rhythm',
    'stats.subtitle':                  'Soft metrics. No anxiety, no comparison.',
    'stats.unit.min':                  'min',
    'stats.unit.glasses':              'glasses',
    'stats.note.label':                'Note:',
    'stats.note':                      "we don't measure to judge you. The numbers are here so you can recognize your rhythms, not chase them.",
    'stats.days':                      'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
    // Tabs — session 43
    'stats.tab.week':                  'Week',
    'stats.tab.month':                 'Month',
    'stats.tab.year':                  'Year',
    // Monthly heatmap — session 43
    'stats.month.days.short':          'M,T,W,T,F,S,S',
    'stats.month.total.focus':         'Focus',
    'stats.month.total.breathe':       'Breathe',
    'stats.month.total.move':          'Move',
    'stats.month.total.water':         'glasses',
    'stats.month.empty':               'No activity',
    'stats.month.coming':              'Coming soon',
    'stats.month.tooltip.focus':       'min focus',
    'stats.month.tooltip.breathe':     'min breathe',
    'stats.month.tooltip.move':        'min move',
    'stats.month.tooltip.water':       'glasses',
    'stats.month.hours.unit':          'h',
    // Year view — session 44
    'stats.year.empty':                'No activity yet in {year}',
    'stats.year.totalActions':         '{n} actions',
    'stats.year.activeDays':           '{n} active days',
    'stats.year.maxStreak':            'max streak: {n} days',
    'stats.year.months.short':         'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec',
    'stats.year.days.label':           'M,T,W,T,F,S,S',
    'stats.year.legend.less':          'less',
    'stats.year.legend.more':          'more',
    'stats.year.tooltip.score':        '{n} actions',

    // Paths stats -- session 54
    'stats.tab.paths':                 'Paths',
    'stats.paths.title':               'Paths',
    'stats.paths.total':               'Total completed',
    'stats.paths.currentStreak':       'Current streak',
    'stats.paths.bestStreak':          'Best streak',
    'stats.paths.tableName':           'Path',
    'stats.paths.tableCount':          'Times',
    'stats.paths.tableLast':           'Last day',
    'stats.paths.empty':               'You have not completed any path yet',
    'stats.paths.heatmap':             'Year activity',
});
