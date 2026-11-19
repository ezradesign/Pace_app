/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   CUANDO ACABA LA SEMANA DE PRUEBA DE v1 (Ez, 2 A+B+C del 16 nov. 2026)
   =====================================================================
   Quien ya usaba PACE tuvo su semana de PACE completo el día de v1 (state-paso-v1.js). Al acabar,
   lo de pago lleva candado, y nadie debe encontrárselo sin aviso (auditoría fable-9nov, fila 18).
   La nota sale en tres sitios, y la marca común `pasoV1.finVisto` hace que no se repita:

     · B · la hoja, una vez, al abrir PACE (la abre PremiumInvitacion, como la del día de v1, y nunca
       con una sesión ni otro diálogo delante). Lo que se queda, lo gratis y «Entendido»; debajo,
       callado, «Tenerlo para siempre · 19,99 €» solo con la tienda abierta.
     · C · la línea bajo el subtítulo de la biblioteca, si la hoja no llegó a salir: la primera vez
       que se abre Respira, Estira o Mueve. Se queda mientras esa biblioteca sigue abierta.
     · A · el sobre de arriba (app/shell/Sobre.finPrueba.js): cerrado si nadie la vio; leída, una
       semana más.

   Este archivo pinta la hoja y la línea. `var`/`function` y `window.*`: un `const` no cruza la IIFE
   del artefacto. */

const { useState: useStateFIN, useEffect: useEffectFIN } = React;

/* Las de pago que se le quedan, en el orden de la hoja del día de v1 (Respira, Mueve, Estira). */
function premiumFinRutinas(datos) {
  const orden = ['breathe', 'move', 'extra'];
  const de = window.premiumPasoV1Rutina;
  return (Array.isArray(datos && datos.rutinas) ? datos.rutinas : []).map((id) => (de ? de(id) : null)).filter(Boolean)
    .sort((a, b) => orden.indexOf(a.mod) - orden.indexOf(b.mod));
}

function premiumFinNombre(r, t, lang) {
  if (lang !== 'en') return r.routine.name;
  const v = t(r.id + '.name');
  return v === r.id + '.name' ? r.routine.name : v;
}

/* «Respiración en rondas» y «Colgarse»; con más de tres, las dos primeras y «y n más». */
function premiumFinLista(nombres, t, tn, lang) {
  const c = lang === 'en' ? ['“', '”'] : ['«', '»'];
  const q = nombres.map((n) => c[0] + n + c[1]);
  if (q.length > 3) return tn('premium.fin.sobre.mas', { lista: q.slice(0, 2).join(', '), n: q.length - 2 });
  if (q.length === 1) return q[0];
  return q.slice(0, -1).join(', ') + ' ' + t('premium.fin.y') + ' ' + q[q.length - 1];
}

/* ¿Toca abrir la hoja? Sin sesión ni otro diálogo delante (si lo hay, PremiumInvitacion mira otra
   vez al minuto, y si entretanto la vio la biblioteca, ya no toca). */
function premiumFinPorAvisar() {
  const r = window.pacePasoV1FinPorVer ? window.pacePasoV1FinPorVer() : null;
  if (!r || document.querySelector('[data-pace-session-root], [role="dialog"]')) return null;
  return r;
}

/* B · la hoja. Hasta seis rutinas; con más, cinco y «Y n más», como la del día de v1. */
function PremiumFinPrueba({ datos, cerrar }) {
  const { t, tn, lang } = useT();
  const S = window.premiumInvitacionStyles;
  const todas = premiumFinRutinas(datos);
  const vistas = todas.length > 6 ? todas.slice(0, 5) : todas;
  const s = typeof getState === 'function' ? getState() : null;
  const propias = !!(s && Array.isArray(s.customRoutines) && s.customRoutines.length);
  const vida = typeof window.premiumPlanVida === 'function' ? window.premiumPlanVida(lang) : null;
  const titulo = t('premium.fin.titulo');
  return (
    <Modal open onClose={cerrar} maxWidth={440} ariaLabel={titulo}>
      <div data-pace-premium-hoja="fin">
        <PremiumSeal />
        <h2 style={S.titulo}>{titulo}</h2>
        <p style={S.sub}>{t('premium.fin.cuerpo')}</p>
        {vistas.length > 0 && (
          <React.Fragment>
            <p style={S.tuyas}>{t('premium.fin.tuyas')}</p>
            <ul data-pace-fin-tuyas style={S.lista}>
              {vistas.map((r) => (
                <li key={r.id} data-pace-fin-rutina={r.id} style={S.item}>
                  <span>{premiumFinNombre(r, t, lang)}</span>
                  <span style={S.detalle}>{t('premium.pasov1.mod.' + r.mod)}</span>
                </li>
              ))}
            </ul>
            {todas.length > vistas.length && <p style={S.mas}>{tn('premium.pasov1.mas', { n: todas.length - vistas.length })}</p>}
          </React.Fragment>
        )}
        {propias && <p data-pace-fin-propias style={S.tuyas}>{t('premium.fin.propias')}</p>}
        <p style={S.v1}>{t('premium.pasov1.gratis')}</p>
        <Button onClick={cerrar} style={S.ancho}>{t('premium.pasov1.vale')}</Button>
        {vida && (
          <button type="button" data-pace-fin-comprar onClick={() => { cerrar(); paceAbrirPremium({}); }} style={S.enlace}>
            {t('premium.settings.vida')} · {vida.precio} <span aria-hidden="true">›</span>
          </button>
        )}
      </div>
    </Modal>
  );
}

/* C · la línea de la biblioteca. Se decide al abrirla y se queda mientras sigue abierta: marcarla
   como vista al momento la borraría del render siguiente. */
function PaceFinPruebaLinea({ abierta }) {
  const { t, tn, lang } = useT();
  const [r, setR] = useStateFIN(null);
  useEffectFIN(() => {
    if (!abierta) { setR(null); return; }
    const x = window.pacePasoV1FinPorVer ? window.pacePasoV1FinPorVer() : null;
    if (x) { setR(x); window.pacePasoV1FinVisto(); }
  }, [abierta]);
  if (!r) return null;
  const fecha = new Date(r.hasta).toLocaleDateString(lang === 'en' ? 'en-GB' : 'es-ES', { day: 'numeric', month: 'long' });
  return (
    <p data-pace-fin-linea style={premiumFinStyles.linea}>
      {tn('premium.fin.linea', { fecha })}{' '}
      <button type="button" data-pace-fin-ver onClick={() => paceAbrirPremium({})} style={premiumFinStyles.ver}>
        {t('premium.fin.ver')} <span aria-hidden="true">›</span>
      </button>
    </p>
  );
}

const premiumFinStyles = {
  linea: { margin: '10px 0 0', fontFamily: 'var(--font-ui)', fontStyle: 'normal', fontSize: 13, lineHeight: 1.45, color: 'var(--ink-2)' },
  ver: { font: 'inherit', color: 'var(--ink)', background: 'none', border: 0, padding: '2px 0', cursor: 'pointer',
    textDecoration: 'underline', textUnderlineOffset: 3 },
};

Object.assign(window, { PremiumFinPrueba, PaceFinPruebaLinea, premiumFinPorAvisar, premiumFinRutinas, premiumFinNombre, premiumFinLista });
