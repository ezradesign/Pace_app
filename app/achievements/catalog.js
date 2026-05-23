/* PACE · Catálogo de logros · sesión 83 / v0.33.3
   Extraído literalmente de app/achievements/Achievements.jsx (v0.32.0, s78).

   Contiene tres exports a window:
   - ACHIEVEMENT_CATALOG  — array con las entradas del catálogo (id, cat,
     title, desc, glyph, glyphSvg, secret). Consumido por Achievements.jsx
     (render), CompletionScreen.jsx (logros desbloqueados en el Camino),
     y Toast.jsx (titulo/glifo del logro recién desbloqueado).
   - CAT_META             — map de 7 categorías → { labelKey, color } para
     iterar el catálogo agrupado por categoría con sus colores semánticos.
   - IMPLEMENTED_ACHIEVEMENTS — Set de ids con detector activo. Los
     logros NO incluidos aquí se pintan como "Pronto" (estado coming-soon).
     Los secretos NO necesitan estar aquí: su mecánica es intriga, se
     pintan siempre como secretos hasta desbloquearse.

   Los glifos SVG viven en app/glyphs/achievement-glyphs.jsx (s83) y se
   leen desde window.ACHIEVEMENT_GLYPHS. Este archivo debe cargarse
   DESPUÉS de achievement-glyphs.jsx y ANTES de Achievements.jsx. */
const GLYPH_SVG = window.ACHIEVEMENT_GLYPHS || {};

const ACHIEVEMENT_CATALOG = [
  // Primeros pasos (1-10)
  { id: 'first.step', cat: 'primeros', title: 'Primer paso', desc: 'Completa tu primer Pomodoro', glyph: '✦', glyphSvg: GLYPH_SVG['first.step'] },
  { id: 'first.breath', cat: 'primeros', title: 'Primer aliento', desc: 'Tu primera sesión de respiración', glyph: '𓇼', glyphSvg: GLYPH_SVG['first.breath'] },
  { id: 'first.stretch', cat: 'primeros', title: 'Primer estirón', desc: 'Tu primera movilidad', glyph: '𓂃', glyphSvg: GLYPH_SVG['first.stretch'] },
  { id: 'first.sip', cat: 'primeros', title: 'Primer sorbo', desc: 'Tu primer vaso de agua', glyph: '◌', glyphSvg: GLYPH_SVG['first.sip'] },
  { id: 'first.extra', cat: 'primeros', title: 'Primera calistenia', desc: 'Tu primer ejercicio Extra', glyph: '✕', glyphSvg: GLYPH_SVG['first.extra'] },
  { id: 'first.cycle', cat: 'primeros', title: 'Ciclo completo', desc: 'Un Pomodoro + pausa activa', glyph: '◯', glyphSvg: GLYPH_SVG['first.cycle'] },
  { id: 'first.ritual', cat: 'primeros', title: 'Primer ritual', desc: 'Usa los 4 módulos en un día', glyph: '✧', glyphSvg: GLYPH_SVG['first.ritual'] },
  { id: 'first.day', cat: 'primeros', title: 'Primer día', desc: '1 día de uso', glyph: '☾', glyphSvg: GLYPH_SVG['first.day'] },
  { id: 'first.plan', cat: 'primeros', title: 'Con un plan', desc: 'Completa el plan del día', glyph: '✓', glyphSvg: GLYPH_SVG['first.plan'] },
  { id: 'first.return', cat: 'primeros', title: 'Regresas', desc: 'Abre la app al día siguiente', glyph: '↻' },

  // Constancia (11-25)
  { id: 'streak.3', cat: 'constancia', title: 'Tres como una', desc: '3 días seguidos', glyph: 'III', glyphSvg: GLYPH_SVG['streak.3'] },
  { id: 'streak.7', cat: 'constancia', title: 'Semana vaca', desc: '7 días seguidos', glyph: 'VII', glyphSvg: GLYPH_SVG['streak.7'] },
  { id: 'streak.14', cat: 'constancia', title: 'Quince días', desc: '14 días seguidos', glyph: 'XIV' },
  { id: 'streak.30', cat: 'constancia', title: 'Luna llena', desc: '30 días seguidos', glyph: '●', glyphSvg: GLYPH_SVG['streak.30'] },
  { id: 'streak.60', cat: 'constancia', title: 'Estación', desc: '60 días seguidos', glyph: '⟢' },
  { id: 'streak.100', cat: 'constancia', title: 'Centenaria', desc: '100 días seguidos', glyph: 'C' },
  { id: 'streak.365', cat: 'constancia', title: 'Vuelta al sol', desc: '365 días seguidos', glyph: '☉', glyphSvg: GLYPH_SVG['streak.365'] },
  { id: 'focus.hours.10', cat: 'constancia', title: '10 horas de foco', desc: 'Tiempo acumulado', glyph: 'X' },
  { id: 'focus.hours.50', cat: 'constancia', title: '50 horas de foco', desc: 'Tiempo acumulado', glyph: 'L' },
  { id: 'focus.hours.100', cat: 'constancia', title: '100 horas de foco', desc: 'Tiempo acumulado', glyph: 'C', glyphSvg: GLYPH_SVG['focus.hours.100'] },
  { id: 'breathe.sessions.10', cat: 'constancia', title: '10 respiraciones', desc: 'Sesiones acumuladas', glyph: '~', glyphSvg: GLYPH_SVG['breathe.sessions.10'] },
  { id: 'breathe.sessions.50', cat: 'constancia', title: '50 respiraciones', desc: 'Sesiones acumuladas', glyph: '≋', glyphSvg: GLYPH_SVG['breathe.sessions.50'] },
  { id: 'move.sessions.25', cat: 'constancia', title: '25 movilidades', desc: 'Sesiones acumuladas', glyph: '∷', glyphSvg: GLYPH_SVG['move.sessions.25'] },
  { id: 'hydrate.week.perfect', cat: 'constancia', title: 'Semana hidratada', desc: '8 vasos / 7 días', glyph: '◌' },
  { id: 'morning.5', cat: 'constancia', title: 'Madrugadora', desc: '5 sesiones antes de las 9am', glyph: '☀' },

  // Exploración (26-45)
  { id: 'explore.box', cat: 'exploracion', title: 'Box descubierta', desc: 'Box 4·4·4·4', glyph: '▢', glyphSvg: GLYPH_SVG['explore.box'] },
  { id: 'explore.478', cat: 'exploracion', title: '4·7·8', desc: 'Respiración relajante', glyph: '4·7·8' },
  { id: 'explore.coherent', cat: 'exploracion', title: 'Coherente', desc: 'HRV sincronizado', glyph: '♥', glyphSvg: GLYPH_SVG['explore.coherent'] },
  { id: 'explore.rounds', cat: 'exploracion', title: 'Rondas', desc: 'Respiración en rondas', glyph: '◴', glyphSvg: GLYPH_SVG['explore.rounds'] },
  { id: 'explore.bhastrika', cat: 'exploracion', title: 'Bhastrika', desc: 'Pranayama energizante', glyph: '※' },
  { id: 'explore.nadi', cat: 'exploracion', title: 'Nadi Shodhana', desc: 'Respiración alternada', glyph: '∞', glyphSvg: GLYPH_SVG['explore.nadi'] },
  { id: 'explore.ujjayi', cat: 'exploracion', title: 'Ujjayi', desc: 'Oceánica', glyph: '≈' },
  { id: 'explore.kapalabhati', cat: 'exploracion', title: 'Kapalabhati', desc: 'Kriya del cráneo', glyph: '✦' },
  { id: 'explore.physiological', cat: 'exploracion', title: 'Suspiro fisiológico', desc: 'Reset rápido', glyph: '⟿', glyphSvg: GLYPH_SVG['explore.physiological'] },
  { id: 'explore.hips', cat: 'exploracion', title: 'Caderas libres', desc: '5 pasos caderas', glyph: '◇', glyphSvg: GLYPH_SVG['explore.hips'] },
  { id: 'explore.shoulders', cat: 'exploracion', title: 'Hombros resetados', desc: '5 pasos hombros', glyph: '⌢' },
  { id: 'explore.atg', cat: 'exploracion', title: 'ATG descubierto', desc: 'Rodillas indestructibles', glyph: '△', glyphSvg: GLYPH_SVG['explore.atg'] },
  { id: 'explore.ancestral', cat: 'exploracion', title: 'Ancestral', desc: 'Crawl, hang, squat', glyph: '☖', glyphSvg: GLYPH_SVG['explore.ancestral'] },
  { id: 'explore.neck', cat: 'exploracion', title: 'Cuello atendido', desc: '3 min cuello', glyph: '~' },
  { id: 'explore.desk', cat: 'exploracion', title: 'Escritorio express', desc: 'Sin levantarse', glyph: '⊡' },
  { id: 'explore.all.breathe', cat: 'exploracion', title: 'Pulmones de campo', desc: 'Todas las respiraciones', glyph: '❦' },
  { id: 'explore.all.move', cat: 'exploracion', title: 'Cuerpo de campo', desc: 'Todas las movilidades', glyph: '✤' },
  { id: 'explore.all.extra', cat: 'exploracion', title: 'Fuerte en la oficina', desc: 'Todos los Extra', glyph: '⚔' },
  { id: 'explore.chrome', cat: 'exploracion', title: 'Pestaña abierta', desc: 'Extensión Chrome instalada', glyph: '◩' },
  { id: 'explore.tweaks', cat: 'exploracion', title: 'Curiosidad', desc: 'Abre los Tweaks', glyph: '⚙' },

  // Maestría (46-70) - placeholders
  { id: 'master.pomodoro.8', cat: 'maestria', title: 'Jornada de ocho', desc: '8 Pomodoros en un día', glyph: 'VIII', glyphSvg: GLYPH_SVG['master.pomodoro.8'] },
  { id: 'master.pomodoro.12', cat: 'maestria', title: 'Doce profundos', desc: '12 Pomodoros', glyph: 'XII' },
  { id: 'master.long.focus', cat: 'maestria', title: 'Larga sesión', desc: '45 min sin pausa', glyph: '═', glyphSvg: GLYPH_SVG['master.long.focus'] },
  { id: 'master.box.10', cat: 'maestria', title: 'Caja maestra', desc: '10 sesiones Box', glyph: '▣' },
  { id: 'master.coherent.10', cat: 'maestria', title: 'Corazón sincronizado', desc: '10 sesiones coherente', glyph: '♥' },
  { id: 'master.rounds.10', cat: 'maestria', title: 'Rondas maestra', desc: '10 sesiones', glyph: '◶' },
  { id: 'master.atg.20', cat: 'maestria', title: 'Rodillas de acero', desc: '20 sesiones ATG', glyph: '△' },
  { id: 'master.hips.20', cat: 'maestria', title: 'Caderas libres', desc: '20 sesiones caderas', glyph: '◇' },
  { id: 'master.shoulders.20', cat: 'maestria', title: 'Hombros libres', desc: '20 sesiones hombros', glyph: '⌢' },
  { id: 'master.ancestral.10', cat: 'maestria', title: 'Primitiva', desc: '10 sesiones ancestrales', glyph: '☖' },
  { id: 'master.hydrate.30', cat: 'maestria', title: 'Río constante', desc: '30 días 8 vasos', glyph: '≈' },
  { id: 'master.hydrate.90', cat: 'maestria', title: 'Manantial', desc: '90 días 8 vasos', glyph: '∿' },
  { id: 'master.extra.all.week', cat: 'maestria', title: 'Semana fuerte', desc: 'Todos los Extra en 1 semana', glyph: '✧' },
  { id: 'master.silent.day', cat: 'maestria', title: 'Día silencioso', desc: '1 día modo silencio', glyph: '𝇇' },
  { id: 'master.dawn', cat: 'maestria', title: 'Amanecer', desc: 'Sesión antes de las 7am', glyph: '↑', glyphSvg: GLYPH_SVG['master.dawn'] },
  { id: 'master.dusk', cat: 'maestria', title: 'Ocaso', desc: 'Sesión después de las 21h', glyph: '↓', glyphSvg: GLYPH_SVG['master.dusk'] },
  { id: 'master.midnight.never', cat: 'maestria', title: 'Nunca a medianoche', desc: '30 días sin uso tras 23h', glyph: '○' },
  { id: 'master.focus.day', cat: 'maestria', title: 'Día de foco', desc: '4h de foco en un día', glyph: 'IV', glyphSvg: GLYPH_SVG['master.focus.day'] },
  { id: 'master.retreat', cat: 'maestria', title: 'Retiro personal', desc: '2h respira + mueve en día', glyph: '❖', glyphSvg: GLYPH_SVG['master.retreat'] },
  { id: 'master.marathon', cat: 'maestria', title: 'Maratoniana', desc: '2000 min totales', glyph: 'ℳ', glyphSvg: GLYPH_SVG['master.marathon'] },
  { id: 'master.centurion', cat: 'maestria', title: 'Centurión', desc: '100 sesiones respiración', glyph: 'C', glyphSvg: GLYPH_SVG['master.centurion'] },
  { id: 'master.gardener', cat: 'maestria', title: 'Jardinera', desc: '200 vasos acumulados', glyph: '❀' },
  { id: 'master.antidote', cat: 'maestria', title: 'Antídoto completo', desc: '50 sesiones SIT', glyph: '✚' },
  { id: 'master.collector.half', cat: 'maestria', title: 'Media colección', desc: '50 logros', glyph: 'L' },
  { id: 'master.collector.full', cat: 'maestria', title: 'Colección completa', desc: '100 logros', glyph: 'C' },
  { id: 'master.path.all7', cat: 'maestria', title: 'Cartógrafa', desc: 'Recorre los siete caminos al menos una vez', glyph: '✦', glyphSvg: GLYPH_SVG['master.path.all7'] },

  // Secretos (71-90)
  { id: 'secret.cow.click', cat: 'secretos', title: 'Vaca feliz', desc: '¿Le hiciste cosquillas?', glyph: '?', glyphSvg: GLYPH_SVG['secret.cow.click'], secret: true },
  { id: 'secret.konami', cat: 'secretos', title: 'Código oculto', desc: '↑↑↓↓←→←→BA', glyph: '?', secret: true },
  { id: 'secret.night.owl', cat: 'secretos', title: 'Búho', desc: 'Usa la app entre 2 y 4am', glyph: '?', secret: true },
  { id: 'secret.lunch', cat: 'secretos', title: 'Pausa de mediodía', desc: 'Sesión a las 14:00', glyph: '?', secret: true },
  { id: 'secret.rain', cat: 'secretos', title: 'Lluvia mental', desc: '3 respiraciones seguidas', glyph: '?', secret: true },
  { id: 'secret.pause.long', cat: 'secretos', title: 'Pausa larga perfecta', desc: '3 Pomodoros + pausa larga', glyph: '?', secret: true },
  { id: 'secret.skip.none', cat: 'secretos', title: 'Sin saltarse', desc: 'Semana sin saltar pausas', glyph: '?', secret: true },
  { id: 'secret.first.monday', cat: 'secretos', title: 'Primer lunes', desc: 'Primer lunes del mes', glyph: '?', secret: true },
  { id: 'secret.new.year', cat: 'secretos', title: 'Año nuevo', desc: '1 de enero', glyph: '?', secret: true },
  { id: 'secret.birthday', cat: 'secretos', title: 'Regalo', desc: 'Tu cumpleaños', glyph: '?', secret: true },
  { id: 'secret.tweak.all', cat: 'secretos', title: 'Explorador de estilo', desc: 'Prueba cada tweak', glyph: '?', secret: true },
  { id: 'secret.dark.mode', cat: 'secretos', title: 'Modo oscuro', desc: '7 días en oscuro', glyph: '?', secret: true },
  { id: 'secret.aged', cat: 'secretos', title: 'Papel envejecido', desc: 'Paleta envejecida', glyph: '?', secret: true },
  { id: 'secret.mono', cat: 'secretos', title: 'Editorial mono', desc: 'Tipografía mono', glyph: '?', secret: true },
  { id: 'secret.seal', cat: 'secretos', title: 'Sello clásico', desc: 'Logo sello', glyph: '?', secret: true },
  { id: 'secret.illustrated', cat: 'secretos', title: 'Campo y pradera', desc: 'Logo ilustrado', glyph: '?', secret: true },
  { id: 'secret.breath.hold.60', cat: 'secretos', title: 'Apnea 60s', desc: '60 segundos de retención', glyph: '?', secret: true },
  { id: 'secret.breath.hold.90', cat: 'secretos', title: 'Apnea 90s', desc: '90 segundos de retención', glyph: '?', secret: true },
  { id: 'secret.breath.hold.120', cat: 'secretos', title: 'Apnea 2 min', desc: '120 segundos de retención', glyph: '?', secret: true },
  { id: 'secret.zen', cat: 'secretos', title: 'Zen accidental', desc: '30 min respira en un día', glyph: '?', secret: true },
  /* Añadido en sesión 16 (v0.11.11) — activable por honor (botón "Ya doné"
     en el modal de apoyo). Sin verificación: no hay backend, confiar es
     parte del tono. Glifo '✦' para que al desbloquearse muestre una chispa
     más cálida (el resto de secretos son '?'). */
  { id: 'secret.supporter', cat: 'secretos', title: 'Sostienes el pasto', desc: 'Apoyaste el proyecto', glyph: '✦', secret: true },

  // Estadísticas (101-104) — glifo provisional, será reemplazado en bloque D
  { id: 'stats.month.first', cat: 'estadisticas', title: 'Mes habitado', desc: 'Veinte días con pace en un mismo mes', glyph: '✦' },
  { id: 'stats.month.focus', cat: 'estadisticas', title: 'Mes profundo', desc: 'Diez horas de foco en un mes', glyph: '✦' },
  { id: 'stats.year.first', cat: 'estadisticas', title: 'Año entero', desc: 'Doce meses con pace, sin saltarte ninguno', glyph: '✦' },
  { id: 'stats.streak.30', cat: 'estadisticas', title: 'Treinta amaneceres', desc: 'Un mes seguido sin perder el ritmo', glyph: '✦' },

  // Estacionales (91-100)
  { id: 'season.spring', cat: 'estacionales', title: 'Primavera', desc: '1 sesión/día en primavera', glyph: '❀' },
  { id: 'season.summer', cat: 'estacionales', title: 'Verano', desc: '1 sesión/día en verano', glyph: '☀' },
  { id: 'season.autumn', cat: 'estacionales', title: 'Otoño', desc: '1 sesión/día en otoño', glyph: '❦' },
  { id: 'season.winter', cat: 'estacionales', title: 'Invierno', desc: '1 sesión/día en invierno', glyph: '❄' },
  { id: 'season.solstice.summer', cat: 'estacionales', title: 'Solsticio verano', desc: '21 junio', glyph: '☀' },
  { id: 'season.solstice.winter', cat: 'estacionales', title: 'Solsticio invierno', desc: '21 diciembre', glyph: '❄' },
  { id: 'season.equinox.spring', cat: 'estacionales', title: 'Equinoccio primavera', desc: '20 marzo', glyph: '⚖' },
  { id: 'season.equinox.autumn', cat: 'estacionales', title: 'Equinoccio otoño', desc: '22 septiembre', glyph: '⚖' },
  { id: 'season.four', cat: 'estacionales', title: 'Cuatro estaciones', desc: 'Las 4 en un año', glyph: '❀☀❦❄' },
  { id: 'season.cycle', cat: 'estacionales', title: 'Ciclo completo', desc: '1 año + solsticios', glyph: '◉' },
];

const CAT_META = {
  primeros: { labelKey: 'ach.cat.primeros', color: 'var(--ink-3)' },
  constancia: { labelKey: 'ach.cat.constancia', color: 'var(--focus)' },
  exploracion: { labelKey: 'ach.cat.exploracion', color: 'var(--breathe)' },
  maestria: { labelKey: 'ach.cat.maestria', color: 'var(--achievement)' },
  secretos: { labelKey: 'ach.cat.secretos', color: 'var(--ink-2)' },
  estacionales: { labelKey: 'ach.cat.estacionales', color: 'var(--move)' },
  estadisticas: { labelKey: 'ach.cat.stats', color: 'var(--hydrate)' },
};

/* Logros con trigger implementado en state.jsx / main.jsx / BreatheModule.jsx.
   El resto se pinta en la colección como "Pronto" — visible para incentivar
   curiosidad, pero sin prometer lo que el código todavía no puede detectar.
   Decisión sesión 15. Cuando un logro gane su trigger, mover su id aquí.

   Los secretos NO se revelan: aunque estén sin implementar, se pintan como
   secretos normales (glifo "?" + título oculto). Por eso esta lista solo
   mira logros NO-secretos. */
const IMPLEMENTED_ACHIEVEMENTS = new Set([
  // Primeros pasos (10/10) — sesión 28 cierra esta categoría:
  // +first.cycle (BreakMenu → pausa activa), +first.ritual (4 módulos
  // del día), +first.day (updateStreak con current >= 1),
  // +first.plan (mismo trigger que ritual), +first.return (rollover
  // con día previo distinto al actual).
  'first.step', 'first.breath', 'first.stretch', 'first.sip', 'first.extra',
  'first.cycle', 'first.ritual', 'first.day', 'first.plan', 'first.return',
  // Constancia (15/15) — sesión 41: +hydrate.week.perfect.
  'streak.3', 'streak.7', 'streak.14', 'streak.30', 'streak.60',
  'streak.100', 'streak.365',
  'focus.hours.10', 'focus.hours.50', 'focus.hours.100',
  'breathe.sessions.10', 'breathe.sessions.50', 'move.sessions.25',
  'morning.5', 'hydrate.week.perfect',
  // Exploración breathe (9/20)
  'explore.box', 'explore.478', 'explore.coherent', 'explore.rounds',
  'explore.bhastrika', 'explore.nadi', 'explore.ujjayi',
  'explore.kapalabhati', 'explore.physiological',
  // Exploración move (6/20) — reconectados en sesión 15
  'explore.hips', 'explore.shoulders', 'explore.atg',
  'explore.ancestral', 'explore.neck', 'explore.desk',
  // Maestría (13/25) — sesión 29: +master.long.focus, +master.dawn, +master.dusk.
  // Sesión 34: +master.collector.half/full, +master.silent.day, +master.retreat.
  // Sesión 41: +master.box.10, +master.coherent.10, +master.rounds.10, +master.atg.20.
  'master.pomodoro.8', 'master.focus.day',
  'master.long.focus', 'master.dawn', 'master.dusk',
  'master.collector.half', 'master.collector.full',
  'master.silent.day', 'master.retreat',
  'master.box.10', 'master.coherent.10', 'master.rounds.10', 'master.atg.20',
  // Caminos (1/1) — sesión 78
  'master.path.all7',
  // Estadísticas (4/4) — sesión 46
  'stats.month.first', 'stats.month.focus', 'stats.year.first', 'stats.streak.30',
  // Exploración extra (1/20) — tweak-secrets desbloqueados por abrir el panel
  'explore.tweaks',
  // Secretos (10/21) — los secretos con trigger se siguen pintando como secretos.
  // Sesión 17: +5 tweak-secrets (aged, dark.mode, mono, seal, illustrated).
  'secret.cow.click', 'secret.breath.hold.60',
  'secret.breath.hold.90', 'secret.breath.hold.120',
  'secret.supporter',
  'secret.aged', 'secret.dark.mode', 'secret.mono',
  'secret.seal', 'secret.illustrated',
]);

Object.assign(window, { ACHIEVEMENT_CATALOG, CAT_META, IMPLEMENTED_ACHIEVEMENTS });
