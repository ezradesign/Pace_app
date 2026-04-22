/* PACE · Logros (Sellos tipo libreta de campo) */

const ACHIEVEMENT_CATALOG = [
  // Primeros pasos (1-10)
  { id: 'first.step', cat: 'primeros', title: 'Primer paso', desc: 'Completa tu primer Pomodoro', glyph: '✦' },
  { id: 'first.breath', cat: 'primeros', title: 'Primer aliento', desc: 'Tu primera sesión de respiración', glyph: '𓇼' },
  { id: 'first.stretch', cat: 'primeros', title: 'Primer estirón', desc: 'Tu primera movilidad', glyph: '𓂃' },
  { id: 'first.sip', cat: 'primeros', title: 'Primer sorbo', desc: 'Tu primer vaso de agua', glyph: '◌' },
  { id: 'first.extra', cat: 'primeros', title: 'Primera calistenia', desc: 'Tu primer ejercicio Extra', glyph: '✕' },
  { id: 'first.cycle', cat: 'primeros', title: 'Ciclo completo', desc: 'Un Pomodoro + pausa activa', glyph: '◯' },
  { id: 'first.ritual', cat: 'primeros', title: 'Primer ritual', desc: 'Usa los 4 módulos en un día', glyph: '✧' },
  { id: 'first.day', cat: 'primeros', title: 'Primer día', desc: '1 día de uso', glyph: '☾' },
  { id: 'first.plan', cat: 'primeros', title: 'Con un plan', desc: 'Completa el plan del día', glyph: '✓' },
  { id: 'first.return', cat: 'primeros', title: 'Regresas', desc: 'Abre la app al día siguiente', glyph: '↻' },

  // Constancia (11-25)
  { id: 'streak.3', cat: 'constancia', title: 'Tres como una', desc: '3 días seguidos', glyph: 'III' },
  { id: 'streak.7', cat: 'constancia', title: 'Semana vaca', desc: '7 días seguidos', glyph: 'VII' },
  { id: 'streak.14', cat: 'constancia', title: 'Quince días', desc: '14 días seguidos', glyph: 'XIV' },
  { id: 'streak.30', cat: 'constancia', title: 'Luna llena', desc: '30 días seguidos', glyph: '●' },
  { id: 'streak.60', cat: 'constancia', title: 'Estación', desc: '60 días seguidos', glyph: '⟢' },
  { id: 'streak.100', cat: 'constancia', title: 'Centenaria', desc: '100 días seguidos', glyph: 'C' },
  { id: 'streak.365', cat: 'constancia', title: 'Vuelta al sol', desc: '365 días seguidos', glyph: '☉' },
  { id: 'focus.hours.10', cat: 'constancia', title: '10 horas de foco', desc: 'Tiempo acumulado', glyph: 'X' },
  { id: 'focus.hours.50', cat: 'constancia', title: '50 horas de foco', desc: 'Tiempo acumulado', glyph: 'L' },
  { id: 'focus.hours.100', cat: 'constancia', title: '100 horas de foco', desc: 'Tiempo acumulado', glyph: 'C' },
  { id: 'breathe.sessions.10', cat: 'constancia', title: '10 respiraciones', desc: 'Sesiones acumuladas', glyph: '~' },
  { id: 'breathe.sessions.50', cat: 'constancia', title: '50 respiraciones', desc: 'Sesiones acumuladas', glyph: '≋' },
  { id: 'move.sessions.25', cat: 'constancia', title: '25 movilidades', desc: 'Sesiones acumuladas', glyph: '∷' },
  { id: 'hydrate.week.perfect', cat: 'constancia', title: 'Semana hidratada', desc: '8 vasos / 7 días', glyph: '◌' },
  { id: 'morning.5', cat: 'constancia', title: 'Madrugadora', desc: '5 sesiones antes de las 9am', glyph: '☀' },

  // Exploración (26-45)
  { id: 'explore.box', cat: 'exploracion', title: 'Box descubierta', desc: 'Box 4·4·4·4', glyph: '▢' },
  { id: 'explore.478', cat: 'exploracion', title: '4·7·8', desc: 'Respiración relajante', glyph: '4·7·8' },
  { id: 'explore.coherent', cat: 'exploracion', title: 'Coherente', desc: 'HRV sincronizado', glyph: '♥' },
  { id: 'explore.rounds', cat: 'exploracion', title: 'Rondas', desc: 'Respiración en rondas', glyph: '◴' },
  { id: 'explore.bhastrika', cat: 'exploracion', title: 'Bhastrika', desc: 'Pranayama energizante', glyph: '※' },
  { id: 'explore.nadi', cat: 'exploracion', title: 'Nadi Shodhana', desc: 'Respiración alternada', glyph: '∞' },
  { id: 'explore.ujjayi', cat: 'exploracion', title: 'Ujjayi', desc: 'Oceánica', glyph: '≈' },
  { id: 'explore.kapalabhati', cat: 'exploracion', title: 'Kapalabhati', desc: 'Kriya del cráneo', glyph: '✦' },
  { id: 'explore.physiological', cat: 'exploracion', title: 'Suspiro fisiológico', desc: 'Reset rápido', glyph: '⟿' },
  { id: 'explore.hips', cat: 'exploracion', title: 'Caderas libres', desc: '5 pasos caderas', glyph: '◇' },
  { id: 'explore.shoulders', cat: 'exploracion', title: 'Hombros resetados', desc: '5 pasos hombros', glyph: '⌢' },
  { id: 'explore.atg', cat: 'exploracion', title: 'ATG descubierto', desc: 'Rodillas indestructibles', glyph: '△' },
  { id: 'explore.ancestral', cat: 'exploracion', title: 'Ancestral', desc: 'Crawl, hang, squat', glyph: '☖' },
  { id: 'explore.neck', cat: 'exploracion', title: 'Cuello atendido', desc: '3 min cuello', glyph: '~' },
  { id: 'explore.desk', cat: 'exploracion', title: 'Escritorio express', desc: 'Sin levantarse', glyph: '⊡' },
  { id: 'explore.all.breathe', cat: 'exploracion', title: 'Pulmones de campo', desc: 'Todas las respiraciones', glyph: '❦' },
  { id: 'explore.all.move', cat: 'exploracion', title: 'Cuerpo de campo', desc: 'Todas las movilidades', glyph: '✤' },
  { id: 'explore.all.extra', cat: 'exploracion', title: 'Fuerte en la oficina', desc: 'Todos los Extra', glyph: '⚔' },
  { id: 'explore.chrome', cat: 'exploracion', title: 'Pestaña abierta', desc: 'Extensión Chrome instalada', glyph: '◩' },
  { id: 'explore.tweaks', cat: 'exploracion', title: 'Curiosidad', desc: 'Abre los Tweaks', glyph: '⚙' },

  // Maestría (46-70) - placeholders
  { id: 'master.pomodoro.8', cat: 'maestria', title: 'Jornada de ocho', desc: '8 Pomodoros en un día', glyph: 'VIII' },
  { id: 'master.pomodoro.12', cat: 'maestria', title: 'Doce profundos', desc: '12 Pomodoros', glyph: 'XII' },
  { id: 'master.long.focus', cat: 'maestria', title: 'Larga sesión', desc: '45 min sin pausa', glyph: '═' },
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
  { id: 'master.dawn', cat: 'maestria', title: 'Amanecer', desc: 'Sesión antes de las 7am', glyph: '↑' },
  { id: 'master.dusk', cat: 'maestria', title: 'Ocaso', desc: 'Sesión después de las 21h', glyph: '↓' },
  { id: 'master.midnight.never', cat: 'maestria', title: 'Nunca a medianoche', desc: '30 días sin uso tras 23h', glyph: '○' },
  { id: 'master.focus.day', cat: 'maestria', title: 'Día de foco', desc: '4h de foco en un día', glyph: 'IV' },
  { id: 'master.retreat', cat: 'maestria', title: 'Retiro personal', desc: '2h respira + mueve en día', glyph: '❖' },
  { id: 'master.marathon', cat: 'maestria', title: 'Maratoniana', desc: '2000 min totales', glyph: 'ℳ' },
  { id: 'master.centurion', cat: 'maestria', title: 'Centurión', desc: '100 sesiones respiración', glyph: 'C' },
  { id: 'master.gardener', cat: 'maestria', title: 'Jardinera', desc: '200 vasos acumulados', glyph: '❀' },
  { id: 'master.antidote', cat: 'maestria', title: 'Antídoto completo', desc: '50 sesiones SIT', glyph: '✚' },
  { id: 'master.collector.half', cat: 'maestria', title: 'Media colección', desc: '50 logros', glyph: 'L' },
  { id: 'master.collector.full', cat: 'maestria', title: 'Colección completa', desc: '100 logros', glyph: 'C' },

  // Secretos (71-90)
  { id: 'secret.cow.click', cat: 'secretos', title: 'Vaca feliz', desc: '¿Le hiciste cosquillas?', glyph: '?', secret: true },
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
  primeros: { label: 'Primeros pasos', color: 'var(--ink-3)' },
  constancia: { label: 'Constancia', color: 'var(--focus)' },
  exploracion: { label: 'Exploración', color: 'var(--breathe)' },
  maestria: { label: 'Maestría', color: 'var(--achievement)' },
  secretos: { label: 'Secretos', color: 'var(--ink-2)' },
  estacionales: { label: 'Estacionales', color: 'var(--move)' },
};

/* Logros con trigger implementado en state.jsx / main.jsx / BreatheModule.jsx.
   El resto se pinta en la colección como "Pronto" — visible para incentivar
   curiosidad, pero sin prometer lo que el código todavía no puede detectar.
   Decisión sesión 15. Cuando un logro gane su trigger, mover su id aquí.

   Los secretos NO se revelan: aunque estén sin implementar, se pintan como
   secretos normales (glifo "?" + título oculto). Por eso esta lista solo
   mira logros NO-secretos. */
const IMPLEMENTED_ACHIEVEMENTS = new Set([
  // Primeros pasos (5/10)
  'first.step', 'first.breath', 'first.stretch', 'first.sip', 'first.extra',
  // Constancia (7/15)
  'streak.3', 'streak.7', 'streak.30', 'streak.100',
  'focus.hours.10', 'focus.hours.50', 'focus.hours.100',
  // Exploración breathe (9/20)
  'explore.box', 'explore.478', 'explore.coherent', 'explore.rounds',
  'explore.bhastrika', 'explore.nadi', 'explore.ujjayi',
  'explore.kapalabhati', 'explore.physiological',
  // Exploración move (6/20) — reconectados en sesión 15
  'explore.hips', 'explore.shoulders', 'explore.atg',
  'explore.ancestral', 'explore.neck', 'explore.desk',
  // Maestría (1/25)
  'master.pomodoro.8',
  // Secretos (4/20) — los secretos con trigger se siguen pintando como secretos
  'secret.cow.click', 'secret.breath.hold.60',
  'secret.breath.hold.90', 'secret.breath.hold.120',
]);

function isImplemented(a) {
  // Los secretos siempre se pintan como secretos (revelen o no).
  // El estado "Pronto" es para logros visibles no-secretos sin trigger.
  return a.secret || IMPLEMENTED_ACHIEVEMENTS.has(a.id);
}

function Achievements({ open, onClose }) {
  const [state] = usePace();
  const unlocked = state.achievements || {};
  const unlockedCount = Object.keys(unlocked).length;
  // Clasificación sesión 15: disponibles = con trigger hoy; próximamente = sin trigger.
  // Los secretos se cuentan como disponibles (su mecánica es "intriga", no "pronto").
  const availableCount = ACHIEVEMENT_CATALOG.filter(isImplemented).length;
  const comingSoonCount = ACHIEVEMENT_CATALOG.length - availableCount;

  return (
    <Modal open={open} onClose={onClose} tagLabel="Colección" title="Logros" subtitle="Sellos de libreta de campo. 100 coherentes. Explora, no compitas." maxWidth={920}>
      {/* Counter */}
      <div style={{ display: 'flex', gap: 20, margin: '8px 0 24px', padding: '16px 20px', background: 'var(--paper-2)', borderRadius: 'var(--r-md)', border: '1px solid var(--line)' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 36, fontWeight: 500, lineHeight: 1 }}>
            {unlockedCount}<span style={{ color: 'var(--ink-3)', fontSize: 20 }}> / {availableCount}</span>
          </div>
          <Meta style={{ marginTop: 4 }}>Disponibles</Meta>
        </div>
        <Divider style={{ width: 1, height: 'auto', background: 'var(--line)' }} />
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 36, fontWeight: 500, lineHeight: 1 }}>
            {comingSoonCount}
          </div>
          <Meta style={{ marginTop: 4 }}>Próximamente</Meta>
        </div>
      </div>

      {Object.entries(CAT_META).map(([cat, meta]) => {
        const items = ACHIEVEMENT_CATALOG.filter(a => a.cat === cat);
        const gotThisCat = items.filter(a => unlocked[a.id]).length;
        return (
          <div key={cat} style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, margin: 0, fontWeight: 500, color: meta.color }}>{meta.label}</h3>
              <Meta>{gotThisCat} / {items.length}</Meta>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(128px, 1fr))', gap: 12 }}>
              {items.map(a => (
                <Seal
                  key={a.id}
                  achievement={a}
                  unlocked={!!unlocked[a.id]}
                  implemented={isImplemented(a)}
                  color={meta.color}
                />
              ))}
            </div>
          </div>
        );
      })}
    </Modal>
  );
}

/* Tres estados del sello:
   1. unlocked         → borde color sólido, opacidad 1, descripción visible.
   2. locked           → borde dashed gris, opacidad 0.55, descripción visible
                         (guía al usuario: "esto se puede cazar").
   3. comingSoon       → borde dotted gris, opacidad 0.38, glifo opaco 0.25,
                         descripción sustituida por "Pronto" (crea curiosidad
                         sin ser opaco). Badge "Pronto" en esquina.
   Los secretos no-desbloqueados saltan siempre a modo secreto (glifo ?,
   título "Secreto") — su mecánica es intriga, no señalización. */
function Seal({ achievement, unlocked, implemented, color }) {
  const a = achievement;
  const isSecret = a.secret && !unlocked;
  const isComingSoon = !unlocked && !implemented && !a.secret;

  const borderStyle = unlocked ? 'solid' : (isComingSoon ? 'dotted' : 'dashed');
  const borderColor = unlocked ? color : 'var(--line)';
  const opacity = unlocked ? 1 : (isComingSoon ? 0.38 : 0.55);

  return (
    <div
      style={{
        aspectRatio: '1/1.15',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '14px 8px',
        border: `1px ${borderStyle} ${borderColor}`,
        borderRadius: 'var(--r-md)',
        background: unlocked ? 'var(--paper)' : 'transparent',
        opacity,
        position: 'relative',
        transition: 'all 220ms',
        cursor: 'default',
        textAlign: 'center',
      }}
      title={isComingSoon ? 'Próximamente' : a.desc}
    >
      {/* Badge "Pronto" — solo en estado coming-soon */}
      {isComingSoon && (
        <div style={{
          position: 'absolute',
          top: 6, right: 6,
          fontFamily: 'var(--font-ui)',
          fontSize: 7.5,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--ink-3)',
          border: '0.5px solid var(--line-2)',
          borderRadius: 999,
          padding: '2px 6px',
          lineHeight: 1,
        }}>Pronto</div>
      )}

      {/* Sello circular */}
      <div style={{
        width: 56, height: 56,
        borderRadius: '50%',
        border: `1.2px solid ${unlocked ? color : 'var(--line-2)'}`,
        display: 'grid', placeItems: 'center',
        marginBottom: 10,
        color: unlocked ? color : 'var(--ink-3)',
        fontFamily: 'var(--font-display)',
        fontSize: 22,
        position: 'relative',
      }}>
        <span style={{
          fontStyle: 'italic',
          // En "pronto" el glifo queda casi fantasma — se intuye pero no se
          // afirma. En locked normal se mantiene legible para guiar al usuario.
          opacity: isComingSoon ? 0.25 : 1,
        }}>{isSecret ? '?' : a.glyph}</span>
        {/* Anillo externo sutil */}
        <div style={{
          position: 'absolute', inset: -4,
          borderRadius: '50%',
          border: `0.5px solid ${unlocked ? color : 'var(--line)'}`,
          opacity: 0.4,
        }} />
      </div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontSize: 13,
        fontWeight: 500,
        lineHeight: 1.15,
        marginBottom: 4,
        color: unlocked ? 'var(--ink)' : 'var(--ink-3)',
      }}>{isSecret ? 'Secreto' : a.title}</div>
      <div style={{ fontSize: 9.5, letterSpacing: '0.05em', color: 'var(--ink-3)', lineHeight: 1.3 }}>
        {isSecret ? '?????' : (isComingSoon ? 'Pronto' : a.desc)}
      </div>
    </div>
  );
}

Object.assign(window, { Achievements, ACHIEVEMENT_CATALOG });
