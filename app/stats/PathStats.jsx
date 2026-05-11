/* PACE · PathStats -- seccion Caminos del panel Stats -- sesion 54 */
const { useMemo } = React;

/* ---- Subcomponente: tarjeta de metrica ---- */
function PathStatCard({ label, value }) {
  return (
    <div className="path-stat-card">
      <div className="path-stat-label">{label}</div>
      <div className="path-stat-value">{value}</div>
    </div>
  );
}

/* ---- Subcomponente: tabla por camino ---- */
function PathTable({ byPath, lang, t }) {
  const ids = Object.keys(byPath);
  if (ids.length === 0) {
    return <p className="path-stats-empty">{t('stats.paths.empty')}</p>;
  }
  // Ordenar por count desc
  ids.sort((a, b) => (byPath[b].count || 0) - (byPath[a].count || 0));

  function pathName(id) {
    const key = id.replace(/\./g, '.') + '.name';
    // Clave i18n: paths.path.dawn.name etc.
    // Construimos la clave esperada por strings.js
    const parts = id.split('.');  // ['path','dawn']
    const nameKey = 'paths.' + id + '.name';
    return t(nameKey) || id;
  }

  function fmtDate(iso) {
    if (!iso) return '-';
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return (
    <div className="path-stats-table">
      <table>
        <thead>
          <tr>
            <th>{t('stats.paths.tableName')}</th>
            <th style={{ textAlign:'right' }}>{t('stats.paths.tableCount')}</th>
            <th style={{ textAlign:'right' }}>{t('stats.paths.tableLast')}</th>
          </tr>
        </thead>
        <tbody>
          {ids.map(id => (
            <tr key={id}>
              <td>{pathName(id)}</td>
              <td style={{ textAlign:'right', fontVariantNumeric:'tabular-nums' }}>{byPath[id].count}</td>
              <td style={{ textAlign:'right', color:'var(--ink-3)', fontSize:'.88em' }}>{fmtDate(byPath[id].lastDoneAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---- Componente principal ---- */
function PathStats() {
  const [state] = usePace();
  const { t } = useT();
  const lang = state.lang || 'es';

  const stats = useMemo(() => {
    return typeof getPathStats === 'function' ? getPathStats() : { total: 0, byPath: {}, currentStreak: 0, bestStreak: 0 };
  }, [state.paths && state.paths.history, state.paths && state.paths.completed]);

  const history = (state.paths && state.paths.history) || [];

  function streakLabel(n) {
    if (n === 0) return '-';
    return `${n} d`;
  }

  return (
    <div className="path-stats">
      <section className="path-stats-summary">
        <PathStatCard label={t('stats.paths.total')}         value={stats.total} />
        <PathStatCard label={t('stats.paths.currentStreak')} value={streakLabel(stats.currentStreak)} />
        <PathStatCard label={t('stats.paths.bestStreak')}    value={streakLabel(stats.bestStreak)} />
      </section>

      <section>
        <PathTable byPath={stats.byPath} lang={lang} t={t} />
      </section>

      <section>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
          color: 'var(--ink-3)', textTransform: 'uppercase',
          marginBottom: 6,
        }}>
          {t('stats.paths.heatmap')}
        </div>
        <PathYearView history={history} lang={lang} />
      </section>
    </div>
  );
}

Object.assign(window, { PathStats });
