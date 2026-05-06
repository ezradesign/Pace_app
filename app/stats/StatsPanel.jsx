/* PACE · Panel de estadísticas — sesión 43
   Renombrado de WeeklyStats → StatsPanel.
   Añade tabs Semana | Mes | Año y el MonthHeatmap.
   WeekView = vista semanal original (sin tocar).
*/

const { useState, useRef, useEffect } = React;

/* =====================================================================
   WEEK VIEW — vista semanal original (copiada tal cual de WeeklyStats)
   ===================================================================== */

function WeekView({ state }) {
  const { t } = useT();
  const w = state.weeklyStats;

  const totals = {
    focus:  w.focusMinutes.reduce((a,b)=>a+b, 0),
    breath: w.breathMinutes.reduce((a,b)=>a+b, 0),
    move:   w.moveMinutes.reduce((a,b)=>a+b, 0),
    water:  w.waterGlasses.reduce((a,b)=>a+b, 0),
  };

  const bars = [
    { key: 'focus',  label: t('topbar.mode.focus'),       color: 'var(--focus)',   data: w.focusMinutes,  unit: t('stats.unit.min') },
    { key: 'breath', label: t('activity.breathe.label'),  color: 'var(--breathe)', data: w.breathMinutes, unit: t('stats.unit.min') },
    { key: 'move',   label: t('activity.move.label'),     color: 'var(--move)',    data: w.moveMinutes,   unit: t('stats.unit.min') },
    { key: 'water',  label: t('activity.hydrate.label'),  color: 'var(--hydrate)', data: w.waterGlasses,  unit: t('stats.unit.glasses') },
  ];

  return (
    <div>
      {/* Totales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, margin: '8px 0 24px' }}>
        {bars.map(b => (
          <div key={b.key} style={{
            padding: '16px 14px',
            background: 'var(--paper-2)',
            borderRadius: 'var(--r-md)',
            border: '1px solid var(--line)',
            borderTop: `3px solid ${b.color}`,
          }}>
            <Meta style={{ fontSize: 10, marginBottom: 6 }}>{b.label}</Meta>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic', fontSize: 28, fontWeight: 500, lineHeight: 1,
            }}>{totals[b.key]}</div>
            <div style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 4 }}>{b.unit}</div>
          </div>
        ))}
      </div>

      {/* Gráfico por días */}
      {bars.map(b => (
        <WeekBarRow key={b.key} label={b.label} data={b.data} color={b.color} unit={b.unit} />
      ))}

      <div style={{
        marginTop: 24, padding: 14,
        background: 'var(--paper-2)',
        borderRadius: 'var(--r-sm)',
        fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--ink)', fontStyle: 'italic', fontFamily: 'var(--font-display)' }}>{t('stats.note.label')}{' '}</strong>
        {t('stats.note')}
      </div>
    </div>
  );
}

function WeekBarRow({ label, data, color, unit }) {
  const { t } = useT();
  const days = t('stats.days').split(',');
  const today = (new Date().getDay() + 6) % 7;
  const max = Math.max(1, ...data);
  const reordered = [data[1], data[2], data[3], data[4], data[5], data[6], data[0]];

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ ...displayItalic, fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>{label}</span>
        <Meta>{unit}</Meta>
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 64 }}>
        {reordered.map((v, i) => {
          const h = (v / max) * 100;
          const isToday = i === today;
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
                <div style={{
                  width: '100%',
                  height: `${h}%`,
                  minHeight: v > 0 ? 4 : 2,
                  background: v > 0 ? color : 'var(--line)',
                  opacity: isToday ? 1 : (v > 0 ? 0.8 : 0.4),
                  borderRadius: '3px 3px 0 0',
                  transition: 'height 320ms var(--ease)',
                  position: 'relative',
                }}>
                  {v > 0 && (
                    <span style={{
                      position: 'absolute', bottom: '100%', left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: 10, color: 'var(--ink-3)',
                      marginBottom: 4,
                      fontVariantNumeric: 'tabular-nums',
                    }}>{v}</span>
                  )}
                </div>
              </div>
              <span style={{
                fontSize: 10,
                color: isToday ? 'var(--ink)' : 'var(--ink-3)',
                fontWeight: isToday ? 600 : 400,
                letterSpacing: 0.3,
              }}>{days[i]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =====================================================================
   MONTH HEATMAP — sesión 43
   ===================================================================== */

/* Módulo dominante del día: el que tiene más minutos (water se escala
   a minutos equivalentes para poder comparar: 1 vaso ≈ 5 min). */
function dominantModule(entry) {
  const { focusMinutes, breathMinutes, moveMinutes, waterGlasses } = entry;
  const waterEq = (waterGlasses || 0) * 5;
  const scores = [
    { key: 'focus',   val: focusMinutes  || 0, color: 'var(--focus)'   },
    { key: 'breathe', val: breathMinutes || 0, color: 'var(--breathe)' },
    { key: 'move',    val: moveMinutes   || 0, color: 'var(--move)'    },
    { key: 'water',   val: waterEq,            color: 'var(--hydrate)' },
  ];
  return scores.reduce((a, b) => b.val > a.val ? b : a, scores[0]);
}

/* Intensidad de opacidad según total de minutos del día (5 niveles). */
function intensityOpacity(totalMin) {
  if (totalMin <= 0)   return 0;
  if (totalMin < 20)   return 0.18;
  if (totalMin < 45)   return 0.38;
  if (totalMin < 90)   return 0.58;
  if (totalMin < 150)  return 0.78;
  return 1.0;
}

/* Convierte minutos a "Xh" o "Xmin" para los totales del mes. */
function fmtTime(min, hourUnit) {
  if (min <= 0) return '0';
  if (min < 60) return `${min}min`;
  const h = Math.round(min / 60 * 10) / 10;
  return `${h}${hourUnit}`;
}

/* Nombre del mes localizado sin deps externas. */
function monthLabel(year, month, lang) {
  const d = new Date(year, month, 1);
  return d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'es-ES', { month: 'long', year: 'numeric' });
}

/* Nombre corto del día de la semana. */
function dayLabel(year, month, day, lang) {
  const d = new Date(year, month, day);
  return d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
}

/* Días en un mes. */
function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/* dayOfWeek L=0 … D=6 (semana comienza en lunes). */
function dowMonday(year, month, day) {
  return (new Date(year, month, day).getDay() + 6) % 7;
}

function MonthHeatmap({ history, lang }) {
  const { t } = useT();
  const now = new Date();
  const [viewYear, setViewYear]   = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth()); // 0-based
  const [tooltip, setTooltip]     = useState(null); // { text, x, y } | null
  const tooltipRef                = useRef(null);

  const hourUnit = t('stats.month.hours.unit');
  const dayHeaders = t('stats.month.days.short').split(',');

  /* Navegar al mes anterior */
  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }

  /* Navegar al mes siguiente (no más allá del mes actual) */
  function nextMonth() {
    const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();
    if (isCurrentMonth) return;
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();
  const days = daysInMonth(viewYear, viewMonth);
  const startDow = dowMonday(viewYear, viewMonth, 1); // columna 0=L del primer día

  /* Datos del mes desde history.days */
  const monthKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
  const monthData = history.months && history.months[monthKey]
    ? history.months[monthKey]
    : null;

  /* Totales del mes para el pie */
  const totalFocus  = monthData ? (monthData.focusMinutes  || 0) : 0;
  const totalBreathe= monthData ? (monthData.breathMinutes || 0) : 0;
  const totalMove   = monthData ? (monthData.moveMinutes   || 0) : 0;
  const totalWater  = monthData ? (monthData.waterGlasses  || 0) : 0;

  /* Celdas del grid: primero las vacías del offset, luego los días */
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push({ type: 'empty', key: `pre-${i}` });
  for (let d = 1; d <= days; d++) {
    const isoKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const entry  = history.days && history.days[isoKey] ? history.days[isoKey] : null;
    const isToday = isCurrentMonth && d === now.getDate();
    cells.push({ type: 'day', key: isoKey, d, entry, isToday });
  }

  function handleCellEnter(e, cell) {
    if (!cell.entry) return;
    const { focusMinutes, breathMinutes, moveMinutes, waterGlasses } = cell.entry;
    const label = dayLabel(viewYear, viewMonth, cell.d, lang);
    const parts = [];
    if (focusMinutes > 0)  parts.push(`${focusMinutes} ${t('stats.month.tooltip.focus')}`);
    if (breathMinutes > 0) parts.push(`${breathMinutes} ${t('stats.month.tooltip.breathe')}`);
    if (moveMinutes > 0)   parts.push(`${moveMinutes} ${t('stats.month.tooltip.move')}`);
    if (waterGlasses > 0)  parts.push(`${waterGlasses} ${t('stats.month.tooltip.water')}`);
    const text = `${label} · ${parts.join(', ')}`;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ text, x: rect.left + rect.width / 2, y: rect.top });
  }

  function handleCellLeave() {
    setTooltip(null);
  }

  function handleCellTap(e, cell) {
    if (!cell.entry) return;
    // Móvil: toggle tooltip con tap
    if (tooltip && tooltip.key === cell.key) {
      setTooltip(null);
      return;
    }
    const { focusMinutes, breathMinutes, moveMinutes, waterGlasses } = cell.entry;
    const label = dayLabel(viewYear, viewMonth, cell.d, lang);
    const parts = [];
    if (focusMinutes > 0)  parts.push(`${focusMinutes} ${t('stats.month.tooltip.focus')}`);
    if (breathMinutes > 0) parts.push(`${breathMinutes} ${t('stats.month.tooltip.breathe')}`);
    if (moveMinutes > 0)   parts.push(`${moveMinutes} ${t('stats.month.tooltip.move')}`);
    if (waterGlasses > 0)  parts.push(`${waterGlasses} ${t('stats.month.tooltip.water')}`);
    const text = `${label} · ${parts.join(', ')}`;
    setTooltip({ text, key: cell.key, mobile: true });
  }

  /* Cerrar tooltip móvil al tocar fuera */
  useEffect(() => {
    if (!tooltip || !tooltip.mobile) return;
    function onOutside(e) {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
        setTooltip(null);
      }
    }
    document.addEventListener('touchstart', onOutside);
    return () => document.removeEventListener('touchstart', onOutside);
  }, [tooltip]);

  const labelText = monthLabel(viewYear, viewMonth, lang);

  return (
    <div>
      <style>{`
        .pace-heatmap-cell {
          width: 36px; height: 36px;
          border-radius: 4px;
          cursor: default;
          transition: opacity 120ms;
          position: relative;
        }
        .pace-heatmap-cell.has-data { cursor: pointer; }
        .pace-heatmap-cell.has-data:hover { opacity: 0.85; }
        @media (max-width: 640px) {
          .pace-heatmap-cell { width: 28px !important; height: 28px !important; }
          .pace-heatmap-header-day { font-size: 9px !important; }
          .pace-heatmap-totals { flex-wrap: wrap; gap: 8px !important; }
        }
      `}</style>

      {/* Navegación de mes */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button
          onClick={prevMonth}
          aria-label="Mes anterior"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--ink-2)', fontSize: 18, padding: '4px 10px',
            borderRadius: 'var(--r-sm)',
          }}
        >&#8249;</button>
        <span style={{
          fontFamily: 'var(--font-display)', fontStyle: 'italic',
          fontSize: 17, color: 'var(--ink)', textTransform: 'capitalize',
        }}>{labelText}</span>
        <button
          onClick={nextMonth}
          disabled={isCurrentMonth}
          aria-label="Mes siguiente"
          style={{
            background: 'none', border: 'none',
            cursor: isCurrentMonth ? 'default' : 'pointer',
            color: isCurrentMonth ? 'var(--ink-3)' : 'var(--ink-2)',
            fontSize: 18, padding: '4px 10px',
            borderRadius: 'var(--r-sm)',
          }}
        >&#8250;</button>
      </div>

      {/* Cabeceras de días de la semana */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 36px)', gap: 4, marginBottom: 4 }}>
        {dayHeaders.map((h, i) => (
          <div key={i} className="pace-heatmap-header-day" style={{
            width: 36, textAlign: 'center',
            fontSize: 10, color: 'var(--ink-3)',
            letterSpacing: 0.5, fontWeight: 600,
          }}>{h}</div>
        ))}
      </div>

      {/* Grid de celdas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 36px)', gap: 4 }}>
        {cells.map(cell => {
          if (cell.type === 'empty') {
            return <div key={cell.key} style={{ width: 36, height: 36 }} />;
          }
          const entry  = cell.entry;
          const hasData = !!entry;
          const totalMin = hasData
            ? (entry.focusMinutes || 0) + (entry.breathMinutes || 0) + (entry.moveMinutes || 0)
            : 0;
          const opacity  = hasData ? intensityOpacity(totalMin) : 0;
          const domColor = hasData ? dominantModule(entry).color : 'var(--paper-3)';

          return (
            <div
              key={cell.key}
              className={`pace-heatmap-cell${hasData ? ' has-data' : ''}`}
              style={{
                // Celda vacía = paper-3. Con datos: fondo neutro + div interno con opacidad.
                background: hasData ? 'transparent' : 'var(--paper-3)',
                outline: cell.isToday ? '2px solid var(--ink-2)' : 'none',
                outlineOffset: 1,
                position: 'relative',
              }}
              onMouseEnter={hasData ? (e) => handleCellEnter(e, cell) : undefined}
              onMouseLeave={hasData ? handleCellLeave : undefined}
              onTouchEnd={hasData ? (e) => { e.preventDefault(); handleCellTap(e, cell); } : undefined}
              aria-label={hasData ? dayLabel(viewYear, viewMonth, cell.d, lang) : undefined}
            >
              {/* Color con opacidad real via div interno */}
              {hasData && (
                <div style={{
                  position: 'absolute', inset: 0,
                  borderRadius: 'inherit',
                  background: domColor,
                  opacity,
                }} />
              )}
              {/* Número del día */}
              <span style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, color: hasData ? 'var(--ink)' : 'var(--ink-3)',
                fontVariantNumeric: 'tabular-nums',
                fontWeight: cell.isToday ? 700 : 400,
                zIndex: 1,
              }}>{cell.d}</span>
            </div>
          );
        })}
      </div>

      {/* Totales del mes */}
      <div className="pace-heatmap-totals" style={{
        display: 'flex', gap: 16, marginTop: 20, flexWrap: 'wrap',
        padding: '12px 14px',
        background: 'var(--paper-2)',
        borderRadius: 'var(--r-sm)',
        fontSize: 12, color: 'var(--ink-2)',
      }}>
        <span><strong style={{ color: 'var(--focus)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>{t('stats.month.total.focus')}</strong>{' '}{fmtTime(totalFocus, hourUnit)}</span>
        <span style={{ color: 'var(--ink-3)' }}>·</span>
        <span><strong style={{ color: 'var(--breathe)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>{t('stats.month.total.breathe')}</strong>{' '}{fmtTime(totalBreathe, hourUnit)}</span>
        <span style={{ color: 'var(--ink-3)' }}>·</span>
        <span><strong style={{ color: 'var(--move)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>{t('stats.month.total.move')}</strong>{' '}{fmtTime(totalMove, hourUnit)}</span>
        <span style={{ color: 'var(--ink-3)' }}>·</span>
        <span><strong style={{ color: 'var(--hydrate)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>{totalWater}</strong>{' '}{t('stats.month.total.water')}</span>
      </div>

      {/* Tooltip desktop */}
      {tooltip && !tooltip.mobile && (
        <div style={{
          position: 'fixed',
          left: tooltip.x,
          top: tooltip.y - 8,
          transform: 'translate(-50%, -100%)',
          background: 'var(--ink)',
          color: 'var(--paper)',
          padding: '6px 10px',
          borderRadius: 'var(--r-sm)',
          fontSize: 11,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 9999,
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        }}>{tooltip.text}</div>
      )}

      {/* Tooltip móvil — card flotante centrada */}
      {tooltip && tooltip.mobile && (
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            bottom: 88,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--ink)',
            color: 'var(--paper)',
            padding: '10px 16px',
            borderRadius: 'var(--r-md)',
            fontSize: 12,
            zIndex: 9999,
            boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
            maxWidth: '90vw',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >{tooltip.text}</div>
      )}
    </div>
  );
}

/* =====================================================================
   YEAR VIEW — placeholder (sesión 44)
   ===================================================================== */

function YearView() {
  const { t } = useT();
  return (
    <div style={{
      textAlign: 'center', padding: '48px 0',
      color: 'var(--ink-3)', fontFamily: 'var(--font-display)',
      fontStyle: 'italic', fontSize: 18,
    }}>
      {t('stats.month.coming')}
    </div>
  );
}

/* =====================================================================
   STATS PANEL — contenedor principal con tabs
   ===================================================================== */

const statsPanelTabStyles = {
  container: {
    display: 'flex',
    gap: 2,
    marginBottom: 24,
    background: 'var(--paper-2)',
    borderRadius: 'var(--r-sm)',
    padding: 3,
  },
  tab: (active) => ({
    flex: 1,
    padding: '7px 0',
    border: 'none',
    borderRadius: 'var(--r-sm)',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: active ? 600 : 400,
    letterSpacing: 0.5,
    background: active ? 'var(--paper)' : 'transparent',
    color: active ? 'var(--ink)' : 'var(--ink-3)',
    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
    transition: 'all 160ms var(--ease)',
  }),
};

function StatsPanel({ open, onClose }) {
  const [state] = usePace();
  const { t } = useT();
  const [tab, setTab] = useState('week');

  const history = state.history || { days: {}, months: {}, years: {} };
  const lang = state.lang || 'es';

  return (
    <Modal
      open={open}
      onClose={onClose}
      tagLabel={t('stats.tag')}
      title={t('stats.title')}
      subtitle={t('stats.subtitle')}
      maxWidth={780}
    >
      {/* Tabs */}
      <div style={statsPanelTabStyles.container}>
        {[
          { key: 'week',  label: t('stats.tab.week')  },
          { key: 'month', label: t('stats.tab.month') },
          { key: 'year',  label: t('stats.tab.year')  },
        ].map(({ key, label }) => (
          <button
            key={key}
            style={statsPanelTabStyles.tab(tab === key)}
            onClick={() => setTab(key)}
          >{label}</button>
        ))}
      </div>

      {/* Contenido por tab */}
      {tab === 'week'  && <WeekView state={state} />}
      {tab === 'month' && <MonthHeatmap history={history} lang={lang} />}
      {tab === 'year'  && <YearView />}
    </Modal>
  );
}

Object.assign(window, { StatsPanel });
