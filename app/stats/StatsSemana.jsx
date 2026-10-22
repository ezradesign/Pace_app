/* PACE · Estadísticas · la semana y los cuatro totales

   SALE DE `StatsPanel.jsx` porque aquel archivo rozaba las 500 líneas y la semana es la
   pieza que más cambia. Aquí viven:
   · `StatsTotales`, las cuatro tarjetas (Foco, Respira, Cuerpo, Hidrátate). La usan la
     semana y, en el móvil, también el mes y el año: así las tres pestañas tienen la misma
     forma (los totales arriba y su dibujo debajo) y la misma altura sin dejar huecos.
   · `WeekView` y `WeekBarRow`, las cuatro filas de barras de la semana.

   LAS BARRAS CRECEN CON SU CIFRA. Hasta v0.159.0 medían todas 4 px: el `height` en % de
   cada barra se resolvía contra una caja sin alto definido y caía al mínimo, así que un
   día de 150 minutos y uno de 60 se veían iguales. Ahora la columna tiene alto fijo y la
   barra es un porcentaje de lo que queda bajo la cifra. Los días se escriben una sola
   vez, al pie, y en el escritorio las cuatro filas van en dos columnas: así cabe la nota
   sin scroll en una ventana de 680 px (Ez, 13 oct.).

   LA CIFRA NO PISA EL NOMBRE DE LA FILA: los 16 px de arriba de cada columna son suyos.
   Antes la cifra flotaba por encima de la gráfica y en el móvil se montaba 9 px sobre
   «Foco». */

/* Alto de cada columna de la gráfica: 16 px para la cifra y el resto para la barra.
   En el móvil la barra tiene 20 px (la regla va en la hoja de `StatsPanel.css.jsx`). */
const SEMANA_HUECO_CIFRA = 16;
const SEMANA_ALTO_BARRA = 24;

const statsTotalesStyles = {
  rejilla: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, margin: '4px 0 14px' },
  /* Sin borde: el fondo basta para separar la tarjeta, y la franja de color va DENTRO y
     recortada por la esquina. El `borderTop` de 3 px de antes se doblaba al llegar a la
     esquina redondeada y dejaba una pestaña curvada encima de cada tarjeta. */
  tarjeta: {
    position: 'relative', overflow: 'hidden',
    padding: '10px 12px',
    background: 'var(--paper-2)',
    borderRadius: 'var(--r-md)',
  },
  franja: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  cifra: { fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, fontWeight: 500, lineHeight: 1 },
  unidad: { fontSize: 10, color: 'var(--ink-3)', marginTop: 2 },
};

/* LAS CIFRAS DE ESTADÍSTICAS, CON LA PUNTUACIÓN DE CADA IDIOMA: coma decimal en castellano y
   punto en inglés, y los miles como los escribe cada uno. Una sola función para las tarjetas, las
   barras, el mes y el año (auditoría del 21 oct.: «1.4h» y «intensidad 3.5» en castellano).
   `dec` es el máximo de decimales, sin ceros de relleno. */
function statsNumero(n, lang, dec) {
  const v = Number(n) || 0;
  try { return v.toLocaleString(lang === 'en' ? 'en-GB' : 'es-ES', { maximumFractionDigits: dec || 0 }); }
  catch (e) { return String(v); }
}

/* items: [{ key, label, color, valor, unidad }]. `semana` mantiene `data-pace-week-cards`,
   que miran las pruebas de la semana. */
function StatsTotales({ items, semana }) {
  const { lang } = useT();
  const fmt = (n) => statsNumero(n, lang);
  const extra = semana ? { 'data-pace-week-cards': '' } : {};
  return (
    <div data-pace-stats-totales {...extra} style={statsTotalesStyles.rejilla}>
      {items.map(it => (
        <div key={it.key} data-pace-stats-tarjeta={it.key} style={statsTotalesStyles.tarjeta}>
          <span aria-hidden="true" style={{ ...statsTotalesStyles.franja, background: it.color }} />
          <Meta style={{ fontSize: 10, marginBottom: 4 }}>{it.label}</Meta>
          <div style={statsTotalesStyles.cifra}>{fmt(it.valor)}</div>
          <div style={statsTotalesStyles.unidad}>{it.unidad}</div>
        </div>
      ))}
    </div>
  );
}

/* Las cuatro series con su nombre, color y unidad: las comparten la semana, el mes y el año. */
function statsSeries(t) {
  return [
    { key: 'focus',  label: t('topbar.mode.focus'),      color: 'var(--focus)',   unit: t('stats.unit.min') },
    { key: 'breath', label: t('activity.breathe.label'), color: 'var(--breathe)', unit: t('stats.unit.min') },
    /* «Cuerpo»: moveMinutes acumula Mueve Y Estira (los dos escriben al mismo cubo). */
    { key: 'move',   label: t('stats.label.body'),       color: 'var(--move)',    unit: t('stats.unit.min') },
    { key: 'water',  label: t('activity.hydrate.label'), color: 'var(--hydrate)', unit: t('stats.unit.glasses'), unit1: t('stats.unit.glasses.1') },
  ];
}

/* Los totales de un agregado de history (mes o año) como items de `StatsTotales`. */
function statsTotalesDe(entry, t) {
  const v = {
    focus: (entry && entry.focusMinutes) || 0, breath: (entry && entry.breathMinutes) || 0,
    move: (entry && entry.moveMinutes) || 0, water: (entry && entry.waterGlasses) || 0,
  };
  return statsSeries(t).map(s => ({ key: s.key, label: s.label, color: s.color, valor: v[s.key], unidad: v[s.key] === 1 && s.unit1 ? s.unit1 : s.unit }));
}

function WeekView({ state }) {
  const { t, tn } = useT();
  const w = state.weeklyStats;
  /* RETENCION (s166). Lectura DEFENSIVA y no `w.holdSeconds` a secas: el merge de
     loadState es superficial, asi que una instalacion anterior a s166 trae un
     weeklyStats de cuatro claves y esta no viene. */
  const holdSeg = ((w && w.holdSeconds) || []).reduce((a, b) => a + (b || 0), 0);
  const datos = { focus: w.focusMinutes, breath: w.breathMinutes, move: w.moveMinutes, water: w.waterGlasses };
  const series = statsSeries(t).map(s => ({ ...s, data: datos[s.key], total: datos[s.key].reduce((a, b) => a + b, 0) }));
  const days = t('stats.days').split(',');
  /* weeklyStats indexa lunes-primero (data[0] = lunes). */
  const today = (new Date().getDay() + 6) % 7;
  const eje = (n) => (
    <div data-pace-week-eje={n} aria-hidden="true" style={{ display: 'flex', gap: 6, marginTop: 4 }}>
      {days.map((d, i) => (
        <span key={i} style={{
          flex: 1, textAlign: 'center', fontSize: 10, letterSpacing: 0.3,
          color: i === today ? 'var(--ink)' : 'var(--ink-3)', fontWeight: i === today ? 600 : 400,
        }}>{d}</span>
      ))}
    </div>
  );

  return (
    <div data-pace-week-view>
      <StatsTotales semana items={series.map(s => ({
        key: s.key, label: s.label, color: s.color, valor: s.total,
        unidad: s.total === 1 && s.unit1 ? s.unit1 : s.unit,
      }))} />

      {/* Una columna en el móvil y dos en el escritorio (Foco · Respira / Cuerpo · Hidrátate);
          el eje de los días, una vez por columna. */}
      <div data-pace-week-filas>
        {series.map(s => (
          <WeekBarRow key={s.key} label={s.label} data={s.data} color={s.color} unit={s.unit} today={today} />
        ))}
        {eje(1)}
        {eje(2)}
      </div>

      {/* LA RETENCION VA AQUI Y NO ARRIBA: las tarjetas y las filas son el plano donde se
          compara un dia con otro, y la retencion no se compara (B1/s89 le quito la cifra por
          ser un RECORD). NO APARECE SI VALE CERO: un «0 s» permanente es el recordatorio de
          una metrica sin cumplir, y solo 3 de las 20 rutinas de Respira tienen retencion. */}
      {holdSeg > 0 && (
        <div data-pace-week-hold={String(holdSeg)} style={{
          marginTop: 10, display: 'flex', justifyContent: 'space-between',
          alignItems: 'baseline', padding: '0 2px',
        }}>
          <Meta style={{ fontSize: 9 }}>{t('stats.hold.label')}</Meta>
          <span style={{
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
            fontSize: 15, color: 'var(--ink-2)', fontVariantNumeric: 'tabular-nums',
          }}>{holdSeg < 60
            ? tn('stats.hold.sec', { s: holdSeg })
            : tn('stats.hold.min', { m: Math.floor(holdSeg / 60), s: String(holdSeg % 60).padStart(2, '0') })}</span>
        </div>
      )}

      <div data-pace-week-note style={{
        marginTop: 10, padding: 8,
        background: 'var(--paper-2)',
        borderRadius: 'var(--r-sm)',
        fontSize: 11, color: 'var(--ink-2)', lineHeight: 1.5,
      }}>
        <strong style={{ color: 'var(--ink)', fontStyle: 'italic', fontFamily: 'var(--font-display)' }}>{t('stats.note.label')}{' '}</strong>
        {t('stats.note')}
      </div>
    </div>
  );
}

function WeekBarRow({ label, data, color, unit, today }) {
  const { lang } = useT();
  const max = Math.max(1, ...data);
  return (
    <div data-pace-week-bar-row>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ ...displayItalic, fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>{label}</span>
        <Meta>{unit}</Meta>
      </div>
      <div data-pace-bar-chart style={{ display: 'flex', gap: 6 }}>
        {data.map((v, i) => {
          const isToday = i === today;
          return (
            <div key={i} data-pace-bar-col style={{
              flex: 1, boxSizing: 'border-box', height: SEMANA_HUECO_CIFRA + SEMANA_ALTO_BARRA, paddingTop: SEMANA_HUECO_CIFRA,
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            }}>
              <div data-pace-bar={v} style={{
                position: 'relative',
                width: '62%', maxWidth: 34,
                height: `${(v / max) * 100}%`,
                minHeight: v > 0 ? 3 : 2,
                background: v > 0 ? color : 'var(--line)',
                opacity: isToday ? 1 : (v > 0 ? 0.8 : 0.4),
                borderRadius: '3px 3px 1px 1px',
                transition: 'height 320ms var(--ease)',
              }}>
                {v > 0 && (
                  <span style={{
                    position: 'absolute', bottom: '100%', left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 10, color: isToday ? 'var(--ink-2)' : 'var(--ink-3)',
                    marginBottom: 3, lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums',
                  }}>{statsNumero(v, lang)}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { statsNumero, StatsTotales, statsSeries, statsTotalesDe, WeekView, WeekBarRow });
