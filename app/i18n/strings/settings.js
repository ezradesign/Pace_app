/* PACE · strings i18n — EL PANEL DE AJUSTES (s188)
   Extraido de `strings/ui.js`, que estaba en 457 lineas y con el copy del panel
   redisenado habria pasado de 500 (regla §1 de CLAUDE.md). Es el mismo
   movimiento que hizo s81 con el split por dominio, s148 con el cuerpo y s187
   con el menu de pausa: cuando un dominio crece, sale ENTERO en vez de
   repartirse. Se lleva todo lo del panel -- lo que antes era `tweaks.*`,
   `settings.*` y `premium.tweaks.*`-- bajo un solo prefijo, `settings.*`.

   EL COPY ES EL DE LA MAQUETA APROBADA (docs/proposals/ajustes-rediseno-r5.html,
   variante P1+, elegida mirandola en cinco rondas): cuatro temas (Ver · Oir ·
   Sesiones · Tus datos), cada ajuste con su nombre en frase, sin «(default)»,
   sin explicaciones salvo la promesa de privacidad del pie.

   LOS NOMBRES DE IDIOMA NO SE TRADUCEN: «Español» y «English» se escriben en
   su propia lengua en los dos bloques, que es como los busca quien no lee el
   idioma que tiene puesto.

   Las claves de los ejes retirados tras bandera (`settings.timer.*`,
   `settings.layout.*`, `settings.circle.organico`) SE CONSERVAN: si
   `app/flags.js` devuelve una bandera a true, el selector vuelve con sus
   textos y sin arqueologia.

   Carga DESPUES de _bootstrap.js y ANTES de useT.jsx, como sus hermanos. */

Object.assign(window.PACE_STRINGS.es, {
    'settings.title':                'Ajustes',
    'settings.sec.ver':              'Ver',
    'settings.sec.oir':              'Oír',
    'settings.sec.sesiones':         'Sesiones',
    'settings.sec.datos':            'Tus datos',

    // Ver
    'settings.lang':                 'Idioma',
    'settings.lang.auto':            'Auto',
    'settings.lang.es':              'Español',
    'settings.lang.en':              'English',
    'settings.palette':              'Paleta',
    'settings.palette.auto':         'Auto',
    'settings.palette.crema':        'Crema',
    'settings.palette.oscuro':       'Oscuro',
    'settings.timer':                'Estilo del timer',
    'settings.timer.aro':            'Aro',
    'settings.timer.barra':          'Barra',
    'settings.timer.analogico':      'Analógico',
    'settings.layout':               'Disposición',
    'settings.layout.sidebar':       'Con barra lateral',
    'settings.layout.minimal':       'Sin barra',

    // Oír (s176: dos decisiones, qué marca la fase y qué suena detrás; s188: la
    // voz entra en la misma fila que el tono -- sigue siendo UNA decision)
    'settings.sound':                'Sonido',
    'settings.signal':               'Marca la fase',
    'settings.signal.tone':          'Tono',
    'settings.signal.clear':         'Voz clara',
    'settings.signal.deep':          'Voz grave',
    'settings.bg':                   'Suena detrás',
    'settings.bg.none':              'Nada',
    'settings.bg.ambient':           'Ambiente',
    'settings.bg.music':             'Música',

    // Sesiones: cada fila dice de que modulo es
    'settings.notify':               'Aviso al terminar',
    'settings.notify.sub':           'Foco · si la pestaña está detrás',
    'settings.notify.blocked':       'El navegador tiene las notificaciones bloqueadas para este sitio.',
    'settings.circle':               'Círculo',
    'settings.circle.sub':           'Respira · {name}',
    'settings.circle.flor':          'Loto',
    'settings.circle.pulso':         'Pulso',
    'settings.circle.petalo':        'Pétalo',
    'settings.circle.ondas':         'Ondas',
    'settings.circle.organico':      'Orgánico',
    'settings.rest':                 'Descanso entre series',
    'settings.rest.sub':             'Mueve',
    'settings.rest.20':              '20 s',
    'settings.rest.30':              '30 s',
    'settings.rest.45':              '45 s',
    'settings.water':                'Vasos al día',
    'settings.water.sub':            'Hidrátate',

    // Tus datos
    'settings.data.export':          'Exportar una copia',
    'settings.data.export.title':    'Descarga un JSON con tu estado actual',
    'settings.data.import':          'Importar una copia',
    'settings.data.import.title':    'Sobreescribe tus datos con un backup',
    'settings.data.reset':           'Borrar todos mis datos',
    'settings.license':              'Licencia',
    'settings.license.soon':         'pronto',
    'settings.foot':                 'Todo vive en tu navegador.',
    'settings.legal.safety':         'Seguridad',
    'settings.legal.privacy':        'Privacidad',
    'settings.msg.exported':         'Backup descargado.',
    'settings.msg.export.err':       'No se pudo exportar.',
    'settings.msg.imported':         'Importado — recargando…',
    'settings.msg.import.invalid':   'Archivo no reconocido.',
    'settings.msg.import.json.err':  'JSON inválido.',
    'settings.msg.import.storage.err': 'No se pudo guardar. Tus datos siguen intactos.',
    'settings.confirm.reset':        '¿Borrar todos tus datos de PACE? Esta acción no se puede deshacer.',
    'settings.confirm.import':       '¿Sobreescribir tus datos con los del archivo?\n\nArchivo contiene: {logros} logros, {foco} min de foco.\nEsta acción no se puede deshacer.',
});

Object.assign(window.PACE_STRINGS.en, {
    'settings.title':                'Settings',
    'settings.sec.ver':              'Look',
    'settings.sec.oir':              'Listen',
    'settings.sec.sesiones':         'Sessions',
    'settings.sec.datos':            'Your data',

    // Look
    'settings.lang':                 'Language',
    'settings.lang.auto':            'Auto',
    'settings.lang.es':              'Español',
    'settings.lang.en':              'English',
    'settings.palette':              'Palette',
    'settings.palette.auto':         'Auto',
    'settings.palette.crema':        'Cream',
    'settings.palette.oscuro':       'Dark',
    'settings.timer':                'Timer style',
    'settings.timer.aro':            'Ring',
    'settings.timer.barra':          'Bar',
    'settings.timer.analogico':      'Analog',
    'settings.layout':               'Layout',
    'settings.layout.sidebar':       'With sidebar',
    'settings.layout.minimal':       'No sidebar',

    // Listen
    'settings.sound':                'Sound',
    'settings.signal':               'Marks the phase',
    'settings.signal.tone':          'Tone',
    'settings.signal.clear':         'Clear voice',
    'settings.signal.deep':          'Deep voice',
    'settings.bg':                   'Plays behind',
    'settings.bg.none':              'Nothing',
    'settings.bg.ambient':           'Ambient',
    'settings.bg.music':             'Music',

    // Sessions
    'settings.notify':               'Alert at the end',
    'settings.notify.sub':           'Focus · if the tab is in the background',
    'settings.notify.blocked':       'Notifications are blocked for this site in your browser.',
    'settings.circle':               'Circle',
    'settings.circle.sub':           'Breathe · {name}',
    'settings.circle.flor':          'Lotus',
    'settings.circle.pulso':         'Pulse',
    'settings.circle.petalo':        'Petal',
    'settings.circle.ondas':         'Waves',
    'settings.circle.organico':      'Organic',
    'settings.rest':                 'Rest between sets',
    'settings.rest.sub':             'Move',
    'settings.rest.20':              '20 s',
    'settings.rest.30':              '30 s',
    'settings.rest.45':              '45 s',
    'settings.water':                'Glasses a day',
    'settings.water.sub':            'Hydrate',

    // Your data
    'settings.data.export':          'Export a copy',
    'settings.data.export.title':    'Download a JSON with your current state',
    'settings.data.import':          'Import a copy',
    'settings.data.import.title':    'Overwrite your data with a backup',
    'settings.data.reset':           'Delete all my data',
    'settings.license':              'License',
    'settings.license.soon':         'soon',
    'settings.foot':                 'Everything lives in your browser.',
    'settings.legal.safety':         'Safety',
    'settings.legal.privacy':        'Privacy',
    'settings.msg.exported':         'Backup downloaded.',
    'settings.msg.export.err':       'Could not export.',
    'settings.msg.imported':         'Imported — reloading…',
    'settings.msg.import.invalid':   'File not recognized.',
    'settings.msg.import.json.err':  'Invalid JSON.',
    'settings.msg.import.storage.err': 'Could not save. Your data is untouched.',
    'settings.confirm.reset':        'Delete all your PACE data? This action cannot be undone.',
    'settings.confirm.import':       'Overwrite your data with the file?\n\nFile contains: {logros} achievements, {foco} focus min.\nThis action cannot be undone.',
});
