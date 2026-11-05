/* Las propuestas, como copias de los archivos de la rama con un cambio cada una. Cada opción se
   enciende con `window.__MAQ` (el guion de fotos lo pone antes de cargar): sin él, la app es la de hoy.
   Nada de esto entra en la rama: es solo para fotografiar la app real con la propuesta dentro.
   Parchea el código de la 0.189.0 (7b9649a8). */
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

/* ── Q2 · la línea del día: A = tocar es mirar (ficha con «Otra»); B = cambia y avisa con «Deshacer» ── */
const FICHA = `
function MaqFicha({ m, t, tn, lang }) {
  const MQ = ${M};
  const f = MQ.ficha;
  if (!f || !m.items[f.i]) return null;
  const it = m.items[f.i];
  const otras = [];
  if (f.antes) m.items.forEach((x, k) => {
    if (k === f.i || !x.platos || !x.platos.length || f.antes[k] == null) return;
    const n = ritmoPlatos(x, t, lang);
    if (n !== f.antes[k].n) otras.push(f.antes[k].h);
  });
  const en = lang === 'en';
  const izq = Math.max(0, Math.min(f.x - 150, f.ancho - 300));
  const cerrar = () => { MQ.ficha = null; setState({}); };
  const otra = () => {
    const o = {};
    m.items.forEach((x, k) => { if (x.platos && x.platos.length) o[k] = { h: ritmoHora(x.desde), n: ritmoPlatos(x, t, lang) }; });
    MQ.ficha = Object.assign({}, f, { antes: o });
    ritmoOtra(it.platos.map((p) => p.clave));
  };
  return (
    <div data-maq-ficha style={{ position: 'absolute', left: izq, top: 34, width: 300, zIndex: 6, background: 'var(--paper)',
      border: '1px solid var(--line-2)', borderRadius: 'var(--r-md)', boxShadow: 'var(--sh-soft)', padding: '12px 14px 10px', textAlign: 'left' }}>
      <div className="pace-rt-meta" style={{ fontSize: 9, letterSpacing: '0.14em' }}>{ritmoHora(it.desde)} · {it.larga ? tn('ritmo.larga', { n: it.dur }) : it.platos[0].min + ' min · ' + ritmoModulo(it.platos[0].modulo, t)}</div>
      {it.platos.map((p) => (
        <div key={p.id} style={{ marginTop: 6 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 17, lineHeight: 1.15, color: 'var(--ink)' }}>{ritmoNombre(p.rutina, t, lang)}</div>
          <div style={{ fontSize: 12.5, lineHeight: 1.35, color: 'var(--ink-2)', marginTop: 2 }}>{(en ? t(p.rutina.id + '.desc') : null) && t(p.rutina.id + '.desc') !== p.rutina.id + '.desc' ? t(p.rutina.id + '.desc') : p.rutina.desc}</div>
        </div>
      ))}
      {otras.length ? (
        <div className="pace-rt-sub" style={{ marginTop: 8 }}>{en
          ? 'The ' + otras.join(' and ') + ' break changes too, so no area repeats.'
          : (otras.length > 1 ? 'También cambian las de las ' : 'También cambia la de las ') + otras.join(' y ') + ', para no repetir zona.'}</div>
      ) : null}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, gap: 12 }}>
        <button type="button" className="pace-rt-enlace pace-rt-fuerte" data-maq-otra onClick={otra} style={{ fontSize: 14 }}>{en ? 'Another one' : 'Otra'}</button>
        <button type="button" className="pace-rt-enlace" data-maq-cerrar onClick={cerrar} style={{ fontSize: 13, textDecoration: 'none' }}>{en ? 'Close' : 'Cerrar'} ×</button>
      </div>
    </div>
  );
}

function MaqAviso({ m, t, lang }) {
  const MQ = ${M};
  const a = MQ.aviso;
  if (!a || !m.items[a.i]) return null;
  const en = lang === 'en';
  const ahora = ritmoPlatos(m.items[a.i], t, lang);
  const otras = [];
  m.items.forEach((x, k) => {
    if (k === a.i || !x.platos || !x.platos.length || a.antes[k] == null) return;
    if (ritmoPlatos(x, t, lang) !== a.antes[k].n) otras.push(a.antes[k].h);
  });
  const deshacer = () => {
    setState((prev) => {
      const r = prev.ritmo || {}; const c = Object.assign({}, (r.dia && r.dia.cambios) || {});
      a.claves.forEach((k) => { c[k] = Math.max(0, (c[k] || 0) - 1); });
      return Object.assign({}, prev, { ritmo: Object.assign({}, r, { dia: Object.assign({}, r.dia, { cambios: c }) }) });
    });
    MQ.aviso = null;
  };
  return (
    <div data-maq-aviso style={{ position: 'fixed', left: '50%', bottom: 24, transform: 'translateX(-50%)', zIndex: 60, maxWidth: 560,
      background: 'var(--paper)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-pill)', boxShadow: 'var(--sh-soft)',
      padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 16, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--ink-2)' }}>
      <span>{en ? 'Swapped for ' : 'Cambiada por '}<b style={{ color: 'var(--ink)', fontWeight: 500 }}>{ahora}</b>{otras.length ? (en ? ' · the ' + otras.join(' and ') + ' too' : ' · también la de las ' + otras.join(' y ')) : ''}</span>
      <button type="button" className="pace-rt-enlace pace-rt-fuerte" data-maq-deshacer onClick={deshacer} style={{ fontSize: 14 }}>{en ? 'Undo' : 'Deshacer'}</button>
    </div>
  );
}
`;

const linea = cambiar('app/ritmo/RitmoLinea.jsx', [
  ['function RitmoLinea({ plan }) {', FICHA + '\nfunction RitmoLinea({ plan }) {'],
  ['  const ultimo = m.items.length - 1;\n',
   `  const ultimo = m.items.length - 1;
  const MQ = ${M} || {};
  const tocar = (it, i, ev) => {
    const claves = it.platos.map((p) => p.clave);
    if (MQ.q2 === 'A') {
      const b = paceCaja(ev.currentTarget), l = paceCaja(lin.current);
      MQ.ficha = { i, x: b.left - l.left + b.width / 2, ancho: l.width, antes: null };
      setState({});
      return;
    }
    if (MQ.q2 === 'B') {
      const o = {};
      m.items.forEach((x, k) => { if (x.platos && x.platos.length) o[k] = { h: ritmoHora(x.desde), n: ritmoPlatos(x, t, lang) }; });
      MQ.aviso = { i, claves, antes: o };
    }
    ritmoOtra(claves);
  };
`],
  ["title={pasado ? nombres + (estado ? ' · ' + t('ritmo.' + estado) : '') : nombres + ' · ' + t(abierta ? 'ritmo.empieza' : 'ritmo.toca')}",
   "title={pasado ? nombres + (estado ? ' · ' + t('ritmo.' + estado) : '') : nombres + ' · ' + (abierta ? t('ritmo.empieza') : MQ.q2 === 'A' ? (lang === 'en' ? 'tap to see it' : 'toca para ver qué es') : t('ritmo.toca'))}"],
  ['onClick={() => abierta ? ritmoEmpezarParada(it) : ritmoOtra(it.platos.map((p) => p.clave))}>',
   'onClick={(ev) => abierta ? ritmoEmpezarParada(it) : tocar(it, i, ev)}>'],
  ['      </div>\n      <div className="pace-rt-zona" ref={zona} />',
   '        <MaqFicha m={m} t={t} tn={tn} lang={lang} />\n      </div>\n      <MaqAviso m={m} t={t} lang={lang} />\n      <div className="pace-rt-zona" ref={zona} />'],
]);

/* ── Q4 · «¿Te ayudó esta pausa?»: A = el «No» la aparta dos semanas y lo dice; B = el «No» solo valora,
   y apartarla es otro botón ── */
const feedback = cambiar('app/ui/SessionFeedback.jsx', [
  ['  const [decided, setDecided] = useStateSF(false);',
   `  const [decided, setDecided] = useStateSF(false);
  const [maqResp, setMaqResp] = useStateSF(null);
  const [maqAparta, setMaqAparta] = useStateSF(false);
  const { lang: maqLang } = useT();
  const MQ = ${M} || {};`],
  ["    try { recordRoutineFeedback(routineId, response); } catch (e) {}\n    setDecided(true);",
   "    try { recordRoutineFeedback(routineId, response); } catch (e) {}\n    setMaqResp(response);\n    setDecided(true);"],
  [`        <div data-pace-fb-thanks style={sessionFeedbackStyles.thanks}>
          {t('session.feedback.thanks')}
        </div>`,
   `        <div data-pace-fb-thanks style={sessionFeedbackStyles.thanks}>
          {MQ.q4 === 'A' && maqResp === 'no' ? (
            <React.Fragment>
              {maqLang === 'en' ? 'Thanks. I won’t suggest it in your breaks for two weeks.' : 'Gracias. Durante dos semanas no te la propondré en las pausas.'}
              {' '}<button type="button" data-maq-deshacer onClick={() => { lockRef.current = false; setMaqResp(null); setDecided(false); }} style={{ ...sessionFeedbackStyles.ghost, fontSize: 15 }}>{maqLang === 'en' ? 'Undo' : 'Deshacer'}</button>
            </React.Fragment>
          ) : MQ.q4 === 'B' && maqResp === 'no' ? (
            <React.Fragment>
              {maqAparta
                ? <React.Fragment>{maqLang === 'en' ? 'Done: I won’t suggest it for two weeks.' : 'Hecho: no te la propondré en dos semanas.'}{' '}<button type="button" data-maq-deshacer onClick={() => setMaqAparta(false)} style={{ ...sessionFeedbackStyles.ghost, fontSize: 15 }}>{maqLang === 'en' ? 'Undo' : 'Deshacer'}</button></React.Fragment>
                : <React.Fragment>{t('session.feedback.thanks')}{' · '}<button type="button" data-maq-aparta onClick={() => setMaqAparta(true)} style={{ ...sessionFeedbackStyles.ghost, fontSize: 15 }}>{maqLang === 'en' ? 'Don’t suggest it' : 'No me la propongas'}</button></React.Fragment>}
            </React.Fragment>
          ) : t('session.feedback.thanks')}
        </div>`],
]);

/* ── R1 · Respira: A = «Empieza aquí» en el sitio de «Para ahora» hasta la primera respiración, cada
   tarjeta dice si se aguanta el aire, Energía al final y «Balance» pasa a «Coherencia»;
   B = «Empieza aquí» siempre, encima de los grupos, con la frase en cada tarjeta y el orden de hoy;
   C = sin «Empieza aquí»: el orden, el nombre y la frase ── */
const tarjeta = cambiar('app/ui/RoutineCard.jsx', [
  ["    if (ritmo) trozos.push({ k: 'ritmo', txt: ritmo });\n",
   `    if (ritmo) trozos.push({ k: 'ritmo', txt: ritmo });
    if (${M} && ${M}.r1 && ['co2', 'bhastrika', 'kapalabhati'].indexOf(routine.pattern) === -1 && typeof libraryConRetencion === 'function') {
      const con = libraryConRetencion(routine);
      trozos.push({ k: 'aire', txt: lang === 'en' ? (con ? 'with breath holds' : 'no breath holds') : (con ? 'aguantando el aire' : 'sin aguantar el aire') });
    }
`],
]);

const shell = cambiar('app/ui/LibraryShell.jsx', [
  ['                       viajes, enPausa = false }) {',
   '                       viajes, enPausa = false, empieza }) {'],
  ['  const ahora = libraryParaAhora(abiertas, typeof todayISO === \'function\' ? todayISO() : \'\', 1, pozoAhora);',
   `  const MQ = ${M} || {};
  const maqEmpieza = empieza && (MQ.r1 === 'A' || MQ.r1 === 'B') ? empieza : null;
  const maqTitulo = lang === 'en' ? 'First time? Start here' : '¿Es tu primera vez? Empieza aquí';
  const ahoraHoy = libraryParaAhora(abiertas.filter((r) => r !== maqEmpieza), typeof todayISO === 'function' ? todayISO() : '', 1, pozoAhora);
  const ahora = maqEmpieza && MQ.r1 === 'A' ? [maqEmpieza] : ahoraHoy;
  const tituloAhora = maqEmpieza && MQ.r1 === 'A' ? maqTitulo : t('lib.now');`],
  ['  const enAhora = (r) => ahora.indexOf(r) !== -1;',
   '  const enAhora = (r) => ahora.indexOf(r) !== -1 || (MQ.r1 === \'B\' && r === maqEmpieza);'],
  ["      <h3 className=\"pace-lib-now\">{t('lib.now')}</h3>",
   '      <h3 className="pace-lib-now">{tituloAhora}</h3>'],
  ["                <p className=\"pace-lib-lateral-tit\">{t('lib.now')}</p>",
   '                <p className="pace-lib-lateral-tit">{tituloAhora}</p>'],
  ['                  {bloqueViajes}\n',
   `                  {bloqueViajes}
                  {maqEmpieza && MQ.r1 === 'B' && (
                    <section data-maq-empieza>
                      <h3 className="pace-lib-now">{maqTitulo}</h3>
                      <div className="pace-lib-rejilla">{tarjetas([maqEmpieza])}</div>
                    </section>
                  )}
`],
]);

const biblioteca = cambiar('app/breathe/BreatheLibrary.jsx', [
  ['function BreatheLibrary({ open, onClose, onStart }) {\n  const { t } = useT();',
   `function BreatheLibrary({ open, onClose, onStart }) {
  const { t, lang } = useT();
  const MQ = ${M} || {};
  const R = BREATHE_ROUTINES;
  const nuevo = MQ.r1 === 'A' || MQ.r1 === 'C';
  const grupos = nuevo ? {
    relajacion: R.relajacion,
    balance: Object.assign({}, R.balance, { label: lang === 'en' ? 'Coherence' : 'Coherencia' }),
    equilibrio: R.equilibrio, pranayama: R.pranayama, energia: R.energia,
  } : R;
  const empieza = (MQ.r1 === 'A' && !MQ.yaRespiro) || MQ.r1 === 'B' ? R.balance.items[0] : null;`],
  ['      groups={BREATHE_ROUTINES} tone="var(--breathe)" catPrefix="breathe"',
   '      groups={grupos} tone="var(--breathe)" catPrefix="breathe" empieza={empieza}'],
]);

module.exports = {
  'app/ritmo/RitmoLinea.jsx': linea,
  'app/ui/SessionFeedback.jsx': feedback,
  'app/ui/RoutineCard.jsx': tarjeta,
  'app/ui/LibraryShell.jsx': shell,
  'app/breathe/BreatheLibrary.jsx': biblioteca,
};
