/* Las propuestas, como copias de los archivos de la rama con un cambio cada una. Cada opción se
   enciende con `window.__MAQ` (el guion de fotos lo pone antes de cargar): sin él, la app es la de hoy.
   Nada de esto entra en la rama: es solo para fotografiar la app real con la propuesta dentro. */
'use strict';
const fs = require('fs');
const path = require('path');
const { RAIZ } = require('./comun');

function cambiar(ruta, pares) {
  let s = fs.readFileSync(path.join(RAIZ, ruta), 'utf8').replace(/\r\n/g, '\n');
  for (const [a, b] of pares) {
    if (s.indexOf(a) < 0) throw new Error('No casa en ' + ruta + ': ' + a.slice(0, 80));
    s = s.replace(a, () => b);
  }
  return s;
}

const M = 'window.__MAQ';

const carta = cambiar('app/ritmo/RitmoCarta.jsx', [
  /* 1 · la × de todas las ventanas («Ahora no»), y sitio para ella en la cabecera. */
  ['<Modal open maxWidth={420} relleno="20px 18px 14px" ariaLabel={t(\'ritmo.carta.aria\')}>',
   '<Modal open onClose={' + M + '.cartaX ? () => { ' + M + '.cerrada = true; setState({}); } : undefined} maxWidth={420} relleno="20px 18px 14px" ariaLabel={t(\'ritmo.carta.aria\')}>'],
  ['<div style={S.cab}>', '<div style={' + M + '.cartaX ? { ...S.cab, paddingRight: 34 } : S.cab}>'],
  /* 3B · la primera carta, a los tres días. */
  ["<span style={S.meta}>{tn('ritmo.carta.titulo', { dia: dia.charAt(0).toUpperCase() + dia.slice(1) })}</span>",
   "<span style={S.meta}>{" + M + ".primera ? (lang === 'en' ? dia.charAt(0).toUpperCase() + dia.slice(1) + ' · your first days' : dia.charAt(0).toUpperCase() + dia.slice(1) + ' · tus primeros días') : tn('ritmo.carta.titulo', { dia: dia.charAt(0).toUpperCase() + dia.slice(1) })}</span>"],
  ['const barras = res.barras.filter((b, i) => i < 5 || b.total > 0);',
   'const barras = res.barras.filter((b, i) => (' + M + '.primera ? b.total > 0 : (i < 5 || b.total > 0)));'],
  ['<span style={S.fechas}>{ritmoCartaFechas(res, tn, lang)}</span>',
   "<span style={S.fechas}>{" + M + ".primera ? tn('ritmo.carta.fechas', { a: ritmoCartaFecha(res.semana.desde, lang), b: ritmoCartaFecha(res.semana.hasta, lang) }) : ritmoCartaFechas(res, tn, lang)}</span>"],
  /* 1C · no se abre sola; 1A y 1C · cerrada, no vuelve hasta tocar el sobre. */
  ['if (!carta || !libre) return null;', 'if (!carta || !libre || ' + M + '.cerrada || (' + M + '.noSola && !' + M + '.abierta)) return null;'],
]);

/* El sobre arriba, junto a Estadísticas, con un punto de lacre. */
const SOBRE = `
      {${M}.sobre && (
        <button data-pace-topbar-icon data-maq-sobre onClick={() => { ${M}.cerrada = false; ${M}.abierta = true; set({}); }} style={topBarStyles.iconBtn}
          title={lang === 'en' ? 'Your week’s letter' : 'La carta de tu semana'} aria-label={lang === 'en' ? 'Your week’s letter' : 'La carta de tu semana'}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5.5" width="18" height="13" rx="1.5" /><path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
            <circle cx="12" cy="13" r="2.4" fill="var(--breathe)" stroke="none" />
          </svg>
        </button>
      )}
      {/* Iconos top-right */}`;
const topbar = cambiar('app/main/TopBar.jsx', [
  ['const { t } = useT();', 'const { t, lang } = useT();'],
  ['      {/* Iconos top-right */}', SOBRE],
]);

/* 2 · la frase del móvil, hasta que acabe (A: empiece) el primer bloque. */
const panel = cambiar('app/ritmo/RitmoPanel.jsx', [
  ["meta={b.dur + ' min · ' + descriptor} />",
   "meta={" + M + ".u5 === 'A' && plan.hechos === 0 && !(typeof paceFocoEmpezado === 'function' && paceFocoEmpezado()) ? b.dur + ' min · ' + (lang === 'en' ? 'start it on the ring above' : 'empieza en el aro, arriba') : b.dur + ' min · ' + descriptor} />"],
  ["function RitmoMovil({ state, plan, onVer }) {\n  const { t, tn } = useT();", "function RitmoMovil({ state, plan, onVer }) {\n  const { t, tn, lang } = useT();"],
  ['<div className="pace-rt-sub pace-rt-frase"><RitmoFraseMenu plan={plan} horario={R.horario} plantilla="ritmo.frase.movil" /></div>',
   '<div className="pace-rt-sub pace-rt-frase">{' + M + ".u5 === 'B' && plan.hechos === 0 ? t('ritmo.como') : <RitmoFraseMenu plan={plan} horario={R.horario} plantilla=\"ritmo.frase.movil\" />}</div>"],
]);
const foco = cambiar('app/focus/FocusTimer.jsx', [
  ["    ? (isCompleted ? t('focus.cycleComplete') : t(getFocusDescriptorKey(state.focusMinutes)))",
   "    ? (isCompleted ? t('focus.cycleComplete') : " + M + ".u5 === 'C' && aro && typeof ritmoPlan === 'function' && ritmoPlan(state) && ritmoPlan(state).hechos === 0 ? (state.lang === 'en' ? 'When it ends, your break comes' : 'Al acabar, te sirvo la pausa') : t(getFocusDescriptorKey(state.focusMinutes)))"],
]);

/* 4 · mirar un ejercicio antes de empezar. A: se despliega en la lista. B: la ventana pasa al ejercicio. */
const DETALLE = `
  const maqP4 = ${M}.p4;
  const [maqAbierto, setMaqAbierto] = React.useState(${M}.p4abierto == null ? null : ${M}.p4abierto);
  const maqTextos = (idx) => {
    const en = lang === 'en';
    const r = [['setup', en ? 'Get into place' : 'Colócate'], ['action', en ? 'What you do' : 'Qué haces'], ['care', en ? 'Careful' : 'Cuidado']];
    return r.map(([k, rot]) => [rot, typeof v1Instr === 'function' ? v1Instr(tR, guiada, idx, k) : null]).filter(([, v]) => v);
  };
  const maqBloque = (idx, grande) => (
    <div data-maq-detalle style={grande ? { display: 'flex', flexDirection: 'column', gap: 14 } : { display: 'grid', gridTemplateColumns: '64px minmax(0,1fr)', gap: 12, padding: '6px 0 12px 0', alignItems: 'start' }}>
      <span style={{ color: accent, display: 'grid', placeItems: 'center', width: grande ? '100%' : 64, height: grande ? 180 : 64, background: grande ? 'var(--paper-2)' : 'transparent', borderRadius: 'var(--r-md, 14px)' }}>
        {typeof ExerciseGlyph === 'function' ? <ExerciseGlyph id={guiada.steps[idx].name} size={grande ? 160 : 60} /> : null}
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: grande ? 12 : 8 }}>
        {maqTextos(idx).map(([rot, v]) => (
          <div key={rot}>
            <div className="pace-meta" style={{ marginBottom: 3 }}>{rot}</div>
            <div style={{ fontSize: grande ? 14.5 : 13.5, color: 'var(--ink-2)', lineHeight: 1.5 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
`;
const preview = cambiar('app/ui/RoutinePreview.jsx', [
  ["  const [pace] = usePace();\n  if (!routine) return null;", "  const [pace] = usePace();\n  const [maqVer, setMaqVer] = React.useState(" + M + ".p4ver == null ? null : " + M + ".p4ver);\n  if (!routine) return null;"],
  ["  const Seccion = ({ titulo, children }) => (", DETALLE + "\n  const Seccion = ({ titulo, children }) => ("],
  /* B: la ventana entera es el ejercicio, con «‹ Volver». */
  ["  return (\n    <Modal open={true} onClose={onClose} maxWidth={560}",
   "  if (maqP4 === 'B' && maqVer != null) {\n" +
   "    return (\n      <Modal open={true} onClose={onClose} maxWidth={560}\n" +
   "             tagLabel={<button type=\"button\" className=\"pace-meta\" onClick={() => setMaqVer(null)} style={{ color: 'var(--ink-2)', padding: 0 }}>{'‹ ' + (lang === 'en' ? 'The steps' : 'Los pasos')}</button>}\n" +
   "             title={tR(clavePaso(maqVer), guiada.steps[maqVer].name)}>\n" +
   "        {maqBloque(maqVer, true)}\n" +
   "      </Modal>\n    );\n  }\n\n" +
   "  return (\n    <Modal open={true} onClose={onClose} maxWidth={560}"],
  /* Cada paso, un botón con su «›». */
  ["                <div key={`${s.name}-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>",
   "                <React.Fragment key={`${s.name}-${idx}`}>\n" +
   "                <div data-maq-paso={idx} role={maqP4 ? 'button' : undefined} onClick={maqP4 === 'A' ? () => setMaqAbierto(maqAbierto === idx ? null : idx) : maqP4 === 'B' ? () => setMaqVer(idx) : undefined}\n" +
   "                     style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0', cursor: maqP4 ? 'pointer' : undefined }}>"],
  ["                  </span>\n                </div>\n              ))}",
   "                  </span>\n" +
   "                  {maqP4 && <span aria-hidden=\"true\" style={{ marginLeft: 'auto', color: 'var(--ink-3)', fontSize: 18, transform: maqP4 === 'A' && maqAbierto === idx ? 'rotate(90deg)' : 'none', transition: 'transform 160ms' }}>›</span>}\n" +
   "                </div>\n" +
   "                {maqP4 === 'A' && maqAbierto === idx && maqBloque(idx, false)}\n" +
   "                </React.Fragment>\n              ))}"],
]);

module.exports = {
  'app/ritmo/RitmoCarta.jsx': carta,
  'app/main/TopBar.jsx': topbar,
  'app/ritmo/RitmoPanel.jsx': panel,
  'app/focus/FocusTimer.jsx': foco,
  'app/ui/RoutinePreview.jsx': preview,
};
