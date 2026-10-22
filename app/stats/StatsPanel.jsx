/* PACE · Panel de estadísticas — sesión 43/44
   Pestañas Hoy | Semana | Mes | Año. Hoy está en StatsHoy.jsx, la semana en StatsSemana.jsx y
   el año en YearView.jsx; aquí quedan el mes y el panel.
*/

const { useState, useRef, useEffect } = React;

/* La semana y las cuatro tarjetas de totales viven en StatsSemana.jsx. */

/* =====================================================================
   MONTH HEATMAP — sesión 43 (sin cambios funcionales; +initialYear/Month s44)
   ===================================================================== */

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

function intensityOpacity(totalMin) {
  if (totalMin <= 0)  return 0;
  if (totalMin < 20)  return 0.18;
  if (totalMin < 45)  return 0.38;
  if (totalMin < 90)  return 0.58;
  if (totalMin < 150) return 0.78;
  return 1.0;
}

function monthLabel(year, month, lang) {
  /* Mayúscula solo en la primera letra: `capitalize` ponía «Octubre De 2026». */
  const s = new Date(year, month, 1).toLocaleDateString(
    lang === 'en' ? 'en-GB' : 'es-ES', { month: 'long', year: 'numeric' }
  );
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function dayLabel(year, month, day, lang) {
  return paceFechaCorta(new Date(year, month, day), lang, { weekday: 'short', day: 'numeric', month: 'short' });
}

function daysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function dowMonday(year, month, day) { return (new Date(year, month, day).getDay() + 6) % 7; }

function MonthHeatmap({ history, lang, initialYear, initialMonth }) {
  const { t } = useT();
  const now = new Date();
  const [viewYear, setViewYear]   = useState(initialYear  != null ? initialYear  : now.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialMonth != null ? initialMonth : now.getMonth());
  const [tooltip, setTooltip]     = useState(null);
  const tooltipRef                = useRef(null);

  const dayHeaders = t('stats.month.days.short').split(',');

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewYear === now.getFullYear() && viewMonth === now.getMonth()) return;
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();
  const days      = daysInMonth(viewYear, viewMonth);
  const startDow  = dowMonday(viewYear, viewMonth, 1);
  const monthKey  = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
  const monthData = history.months && history.months[monthKey] ? history.months[monthKey] : null;

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push({ type: 'empty', key: `pre-${i}` });
  for (let d = 1; d <= days; d++) {
    const isoKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const entry  = history.days && history.days[isoKey] ? history.days[isoKey] : null;
    const isToday = isCurrentMonth && d === now.getDate();
    const isFuture = isCurrentMonth && d > now.getDate();
    cells.push({ type: 'day', key: isoKey, d, entry, isToday, isFuture });
  }

  function handleCellEnter(e, cell) {
    if (!cell.entry) return;
    const { focusMinutes, breathMinutes, moveMinutes, waterGlasses } = cell.entry;
    const label = dayLabel(viewYear, viewMonth, cell.d, lang);
    const parts = [];
    if (focusMinutes > 0)  parts.push(`${statsNumero(focusMinutes, lang)} ${t('stats.month.tooltip.focus')}`);
    if (breathMinutes > 0) parts.push(`${statsNumero(breathMinutes, lang)} ${t('stats.month.tooltip.breathe')}`);
    if (moveMinutes > 0)   parts.push(`${statsNumero(moveMinutes, lang)} ${t('stats.month.tooltip.move')}`);
    if (waterGlasses > 0)  parts.push(`${waterGlasses} ${waterGlasses === 1 ? t('stats.unit.glasses.1') : t('stats.month.tooltip.water')}`);
    const rect = paceCaja(e.currentTarget);
    setTooltip({ text: `${label} · ${parts.join(', ')}`, x: rect.left + rect.width / 2, y: rect.top });
  }
  function handleCellLeave() { setTooltip(null); }

  function handleCellTap(e, cell) {
    if (!cell.entry) return;
    if (tooltip && tooltip.key === cell.key) { setTooltip(null); return; }
    const { focusMinutes, breathMinutes, moveMinutes, waterGlasses } = cell.entry;
    const label = dayLabel(viewYear, viewMonth, cell.d, lang);
    const parts = [];
    if (focusMinutes > 0)  parts.push(`${statsNumero(focusMinutes, lang)} ${t('stats.month.tooltip.focus')}`);
    if (breathMinutes > 0) parts.push(`${statsNumero(breathMinutes, lang)} ${t('stats.month.tooltip.breathe')}`);
    if (moveMinutes > 0)   parts.push(`${statsNumero(moveMinutes, lang)} ${t('stats.month.tooltip.move')}`);
    if (waterGlasses > 0)  parts.push(`${waterGlasses} ${waterGlasses === 1 ? t('stats.unit.glasses.1') : t('stats.month.tooltip.water')}`);
    setTooltip({ text: `${label} · ${parts.join(', ')}`, key: cell.key, mobile: true });
  }

  useEffect(() => {
    if (!tooltip || !tooltip.mobile) return;
    function onOutside(e) {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) setTooltip(null);
    }
    document.addEventListener('touchstart', onOutside);
    return () => document.removeEventListener('touchstart', onOutside);
  }, [tooltip]);

  /* Sesion 62 (v0.28.3): segundo intento del calendario.
     S61 paso a `grid 1fr + aspect-ratio:1` -> celdas de ~104px que
     desbordaban en alto y obligaban a scroll. Vuelve a celdas fijas
     pero mas grandes que las 36px originales (56px) y se centra el
     grid en el modal (justify-content:center). Asi:
       - desktop: 7x56 + 6x6 gap = 428 px, centrado en ~756 utiles
       - 6 filas x 56 + 5x6 = 366 px de alto -> cabe sin scroll
     s176: 48 -> 42 px. Aquel «cabe sin scroll» dejo de ser cierto en algun
     momento -- medido a 1536x714, la pestana del mes desbordaba 37 px-, y 6
     filas de 42 con 5 huecos de 6 dan 282 px, exactamente los 36 que sobraban.
     El ancho baja de 372 a 330 px sobre ~756 utiles: sobra sitio de sobra.
       - movil: override a 32px sin gap.
     v0.160.0: en el escritorio 38 px, para que un mes de seis semanas quepa sin scroll
     con una ventana de 640 px; en el móvil 36 px, que llenan el ancho debajo de los totales.

     LOS TOTALES DEL MES: en el móvil son las mismas cuatro tarjetas que la semana, arriba
     (así las tres pestañas tienen la misma forma y la misma altura); en el escritorio,
     la línea de abajo, que cabe sin scroll al lado de un calendario ancho. */
  return (
    <div data-pace-month-view>
      <StatsTotales items={statsTotalesDe(monthData, t)} />

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <button onClick={prevMonth} aria-label={t('stats.month.prev')} style={{
          background:'none',border:'none',cursor:'pointer',color:'var(--ink-2)',fontSize:18,padding:'4px 10px',borderRadius:'var(--r-sm)',
        }}>&#8249;</button>
        <span style={{ fontFamily:'var(--font-display)',fontStyle:'italic',fontSize:17,color:'var(--ink)' }}>
          {monthLabel(viewYear, viewMonth, lang)}
        </span>
        <button onClick={nextMonth} disabled={isCurrentMonth} aria-label={t('stats.month.next')} style={{
          background:'none',border:'none',cursor:isCurrentMonth?'default':'pointer',
          color:isCurrentMonth?'var(--ink-3)':'var(--ink-2)',fontSize:18,padding:'4px 10px',borderRadius:'var(--r-sm)',
        }}>&#8250;</button>
      </div>

      <div className="pace-heatmap-grid" style={{ marginBottom:4 }}>
        {dayHeaders.map((h, i) => (
          <div key={i} className="pace-heatmap-header-day">{h}</div>
        ))}
      </div>

      <div className="pace-heatmap-grid">
        {cells.map(cell => {
          if (cell.type === 'empty') return <div key={cell.key} className="pace-heatmap-empty" />;
          /* UN DÍA SOLO CON AGUA TAMBIÉN TIENE ALGO (auditoría del 21 oct.): con 0 minutos su
             relleno valía 0 y, por tener entrada, perdía también el borde de los vacíos, así que
             no se veía nada. Ahora lleva el color del agua en el tono más suave. Lo que cuenta es
             que haya algo, no que haya entrada: una entrada a ceros es un día vacío. */
          const e = cell.entry || {};
          const totalMin = (e.focusMinutes||0)+(e.breathMinutes||0)+(e.moveMinutes||0);
          const hasData  = totalMin > 0 || (e.waterGlasses||0) > 0;
          const opacity  = hasData ? intensityOpacity(Math.max(1, totalMin)) : 0;
          const domColor = hasData ? dominantModule(e).color : 'var(--paper-3)';
          /* Un día sin nada es un hilo fino con su número, no una losa: con 31 losas beige
             el mes se leía como un muro y los días con ritmo no destacaban. Los que aún no
             han llegado, más tenues. Sobre un color intenso el número va en claro. */
          const vacio = cell.isFuture ? 'none' : 'inset 0 0 0 1px var(--line)';
          return (
            <div key={cell.key}
              className={`pace-heatmap-cell${hasData?' has-data':''}`}
              style={{ background:'transparent', boxShadow:hasData?'none':vacio, outline:cell.isToday?'1.5px solid var(--ink-2)':'none', outlineOffset:2, position:'relative', opacity:cell.isFuture?0.5:1 }}
              onMouseEnter={hasData?(e)=>handleCellEnter(e,cell):undefined}
              onMouseLeave={hasData?handleCellLeave:undefined}
              onTouchEnd={hasData?(e)=>{e.preventDefault();handleCellTap(e,cell);}:undefined}
              aria-label={hasData?dayLabel(viewYear,viewMonth,cell.d,lang):undefined}
            >
              {hasData && <div style={{ position:'absolute',inset:0,borderRadius:'inherit',background:domColor,opacity }} />}
              <span className="pace-heatmap-day-num" style={{
                color:hasData?(opacity>=0.58?'var(--paper)':'var(--ink)'):'var(--ink-3)',
                fontWeight:cell.isToday?700:400,
              }}>{cell.d}</span>
            </div>
          );
        })}
      </div>

      <StatsLineaTotales entry={monthData} />

      {tooltip && !tooltip.mobile && (
        <div style={{
          position:'fixed',left:tooltip.x,top:tooltip.y-8,transform:'translate(-50%,-100%)',
          background:'var(--ink)',color:'var(--paper)',padding:'6px 10px',borderRadius:'var(--r-sm)',
          fontSize:11,pointerEvents:'none',whiteSpace:'nowrap',zIndex:9999,boxShadow:'0 2px 8px rgba(0,0,0,0.18)',
        }}>{tooltip.text}</div>
      )}
      {tooltip && tooltip.mobile && (
        <div ref={tooltipRef} style={{
          position:'fixed',bottom:88,left:'50%',transform:'translateX(-50%)',
          background:'var(--ink)',color:'var(--paper)',padding:'10px 16px',borderRadius:'var(--r-md)',
          fontSize:12,zIndex:9999,boxShadow:'0 4px 16px rgba(0,0,0,0.22)',maxWidth:'90vw',textAlign:'center',lineHeight:1.5,
        }}>{tooltip.text}</div>
      )}
    </div>
  );
}

/* =====================================================================
   STATS PANEL — contenedor principal con tabs
   ===================================================================== */

const statsPanelTabStyles = {
  /* Va en la cabecera del modal: en el móvil, a todo el ancho debajo del subtítulo; en el
     escritorio, al lado del título (la hoja la estrecha a 360 px). Así la semana, con su
     nota, cabe sin scroll en una ventana de 680 px. */
  container: {
    display: 'flex', gap: 2, flex: '1 1 100%', marginTop: 'var(--s-5)',
    background: 'var(--paper-2)', borderRadius: 'var(--r-sm)', padding: 3,
  },
  tab: (active) => ({
    flex: 1, padding: '7px 0', border: 'none', borderRadius: 'var(--r-sm)',
    cursor: 'pointer', fontSize: 12, fontWeight: active ? 600 : 400, letterSpacing: 0.5,
    background: active ? 'var(--paper)' : 'transparent',
    color: active ? 'var(--ink)' : 'var(--ink-3)',
    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
    /* s139 — mismo bug que las pastillas de Ajustes: `all` animaba el
       `fontWeight` (400↔600). Aquí no se notaba el tirón de ancho porque los
       tabs son `flex:1`, pero el trazo saltaba igual a mitad de la transición.
       Se listan las propiedades; el peso cambia instantáneo, que es lo correcto
       para una señal de estado. Ver la nota larga en TweaksPanel.jsx. */
    transition: 'background-color 160ms var(--ease), color 160ms var(--ease), box-shadow 160ms var(--ease)',
  }),
};

function StatsPanel({ open, onClose }) {
  const [state] = usePace();
  const { t } = useT();
  /* Se abre en «Hoy» (§37.4; Ez, 15 oct. 2026): lo primero es tu día. */
  const [tab, setTab]           = useState('today');
  /* MES Y AÑO SON DE PACE COMPLETO (Ez, 8 oct.); hasta v1, abiertos para todos
     (PREMIUM_ABIERTO_HASTA_V1). Cerrados llevan el candado de línea fina en su pestaña y, al
     tocarla, se abre la invitación de siempre sin cambiar de pestaña (Ez, 15 oct., opción A):
     tus datos no se tapan, y la copia de «Tus datos» los sigue llevando todos. */
  const cerrada = (key) => (key === 'month' || key === 'year')
    && !(window.PREMIUM_ABIERTO_HASTA_V1 || (window.hasPremiumEntitlement && window.hasPremiumEntitlement()));
  const [jumpYear, setJumpYear] = useState(null);
  const [jumpMonth, setJumpMonth] = useState(null);

  /* Stats vivos (s101): history + el dia actual fusionado desde weeklyStats
     (selector memoizado en state-history.jsx). Mes/Año dejan de ir un dia
     por detras; el estado persistido no cambia. */
  const history = typeof getHistoryWithToday === 'function'
    ? getHistoryWithToday(state)
    : (state.history || { days:{}, months:{}, years:{} });
  const lang    = state.lang || 'es';

  function handleNavigateToMonth(yr, mo) {
    setJumpYear(yr);
    setJumpMonth(mo);
    setTab('month');
  }

  const pestanas = (
    <div data-pace-stats-tabs style={statsPanelTabStyles.container}>
      {[
        { key:'today', label:t('stats.tab.today') },
        { key:'week',  label:t('stats.tab.week')  },
        { key:'month', label:t('stats.tab.month') },
        { key:'year',  label:t('stats.tab.year')  },
        { key:'paths', label:t('stats.tab.paths') },
      /* Sin Caminos (SHOW_CAMINOS, app/flags.js) su pestaña no se ofrece. */
      ].filter(({ key }) => key !== 'paths' || window.SHOW_CAMINOS !== false).map(({ key, label }) => (
        <button key={key} style={statsPanelTabStyles.tab(tab===key)} data-pace-stats-tab={key}
          data-pace-stats-cerrada={cerrada(key) ? '' : undefined}
          aria-label={cerrada(key) ? label + ' · ' + t('stats.cerrado') : undefined}
          onClick={()=>{ if (cerrada(key)) { paceAbrirPremium({ nombre: label }); return; } setTab(key); }}>
          {cerrada(key) ? <PaceCandado size={10} /> : null}{label}
        </button>
      ))}
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} cabecera={pestanas}
            tagLabel={t('stats.tag')} title={t('stats.title')} subtitle={t('stats.subtitle')} maxWidth={1240}
    >

      {/* s176 · LAS CUATRO PESTANAS COMPARTEN CAJA EN ESCRITORIO. Medido a
          1536x714 antes de tocar nada: el modal saltaba de 443,7 px en «Ano» a
          606,9 en «Semana» y «Mes» -- 163,2 px de diferencia al cambiar de
          pestana-, y dos de las cuatro ademas tenian scroll (13 px en Semana,
          37 en Mes). Reportado por el usuario mirando la app: «cambiar entre
          pestanas y que varie el tamano se queda un poco raro».
          EL SUELO ES LO QUE CABE, no lo que mide la mas alta: a 714 px de alto
          el modal da 605 utiles y el cromo (cabecera + pestanas + paddings) se
          come 220,1, asi que la vista puede medir 384,9. Por eso se compacta el
          calendario en vez de estirar la caja: estirarla habria fijado el
          tamano DEJANDO el scroll, que es la mitad de lo que se pidio.
          EN EL MOVIL TAMBIEN (v0.160.0): con los cuatro totales arriba en las tres
          pestanas, el suelo es la mas alta de las tres, que ya cabe en el telefono
          de Ez sin scroll; las otras dos dejan de saltar y no quedan medio vacias. */}
      <div data-pace-stats-vistas>
        {tab==='today' && <StatsHoy state={state} />}
        {tab==='week'  && <WeekView state={state} />}
        {tab==='month' && <MonthHeatmap history={history} lang={lang} initialYear={jumpYear} initialMonth={jumpMonth} />}
        {tab==='year'  && <YearView history={history} lang={lang} firstSeen={state.firstSeen} onNavigateToMonth={handleNavigateToMonth} />}
        {tab==='paths' && <PathStats />}
      </div>

    </Modal>
  );
}

Object.assign(window, { StatsPanel });
