/* PACE · PremiumInvitacion.jsx — LA INVITACIÓN A PACE COMPLETO
   ============================================================
   Elegida por Ez mirando la maqueta (8 oct. 2026): al tocar algo cerrado se abre
   una hoja que dice qué es, qué trae PACE completo y cómo se abre, con una salida
   igual de visible. Nada salta solo: solo se abre con un gesto. Sin cuenta atrás
   ni «oferta» (MONETIZATION.md, «Qué NO hacemos»).

   SE ABRE con `paceAbrirPremium({ nombre, modo })`, que lanza `pace:open-premium`:
   `nombre` es lo que se tocó (una rutina, «Tus rutinas») y `modo: 'codigo'` la
   abre ya con el campo del código (lo usa la fila de Ajustes).

   HOY NO HAY COMPRA: la hoja dice «Llega con la versión 1». Cuando llegue Play
   Billing o la tienda de la web, el botón de compra va aquí, con el precio que
   dé la tienda (nunca escrito en las traducciones).

   EN ANDROID NO HAY «Tengo un código»: Google Play no deja desbloquear con
   códigos propios (state-licencia.js). Allí la hoja solo informa.

   El candado de las tarjetas (`PaceCandado`) vive aquí porque es la misma
   promesa: lo que lo lleva, al tocarlo, abre esta hoja. */

const { useState: useStatePI, useEffect: useEffectPI, useRef: useRefPI } = React;

/* `abierto`: el arco no baja a la derecha. Lo usa el aviso de un código que vale. */
function PaceCandado({ size = 11, abierto = false }) {
  return (
    <svg width={size} height={Math.round(size * 13 / 11)} viewBox="0 0 11 13" aria-hidden="true" focusable="false"
      data-pace-candado style={{ verticalAlign: '-1px', marginRight: 4, flex: 'none' }}>
      <rect x="1" y="5.5" width="9" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
      <path d={abierto ? 'M3 5.5V4a2.5 2.5 0 0 1 5 0' : 'M3 5.5V4a2.5 2.5 0 0 1 5 0v1.5'} fill="none" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

function paceAbrirPremium(detalle) {
  try { window.dispatchEvent(new CustomEvent('pace:open-premium', { detail: detalle || {} })); } catch (e) {}
}

const PREMIUM_INCLUYE = ['routines', 'custom', 'letter', 'stats'];

function PremiumInvitacion() {
  const { t } = useT();
  const [abierta, setAbierta] = useStatePI(null); // null | { nombre, modo }
  const [modo, setModo] = useStatePI('invita');   // invita · codigo · ok
  const [texto, setTexto] = useStatePI('');
  const [error, setError] = useStatePI(null);
  const [comprobando, setComprobando] = useStatePI(false);
  const [tester, setTester] = useStatePI(false);
  const campoRef = useRefPI(null);

  useEffectPI(() => {
    const abrir = (e) => {
      const d = (e && e.detail) || {};
      const conCodigo = d.modo === 'codigo' && window.paceLicenciaPermitida && window.paceLicenciaPermitida();
      setAbierta({ nombre: d.nombre || null });
      setModo(conCodigo ? 'codigo' : 'invita');
      setTexto(''); setError(null); setComprobando(false);
    };
    window.addEventListener('pace:open-premium', abrir);
    return () => window.removeEventListener('pace:open-premium', abrir);
  }, []);

  useEffectPI(() => {
    if (modo === 'codigo' && campoRef.current) campoRef.current.focus();
  }, [modo]);

  /* Lo que no está abierto no lee nada más (CLAUDE.md, trampas conocidas). */
  if (!abierta) return null;

  const cerrar = () => setAbierta(null);
  const permitida = !!(window.paceLicenciaPermitida && window.paceLicenciaPermitida());

  const canjear = () => {
    if (comprobando || !texto.trim() || !window.paceLicenciaCanjear) return;
    setComprobando(true); setError(null);
    window.paceLicenciaCanjear(texto).then((r) => {
      setComprobando(false);
      if (r.ok) { setTester(r.datos && r.datos.tester != null); setModo('ok'); }
      else setError(r.motivo || 'formato');
    });
  };

  const titulo = modo === 'ok' ? t('premium.ok.title') : (abierta.nombre || t('premium.name'));

  return (
    <Modal open onClose={cerrar} maxWidth={440} ariaLabel={titulo}>
      <div data-pace-premium-hoja={modo}>
        {modo !== 'ok' && <PremiumSeal />}
        <h2 style={{ ...displayItalic, fontSize: 28, fontWeight: 500, lineHeight: 1.15, margin: '12px 36px 2px 0' }}>{titulo}</h2>

        {modo === 'ok' ? (
          <React.Fragment>
            <p style={premiumInvitacionStyles.sub}>{t(tester ? 'premium.ok.tester' : 'premium.ok.other')}</p>
            <Button onClick={cerrar} style={premiumInvitacionStyles.ancho}>{t('premium.ok.continue')}</Button>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <p style={premiumInvitacionStyles.sub}>{t('premium.part')}</p>
            <ul style={premiumInvitacionStyles.lista}>
              {PREMIUM_INCLUYE.map((k) => (
                <li key={k} style={premiumInvitacionStyles.item}>
                  <span>{t('premium.inc.' + k)}</span>
                  <span style={premiumInvitacionStyles.detalle}>{t('premium.inc.' + k + '.d')}</span>
                </li>
              ))}
            </ul>

            {modo === 'codigo' ? (
              <form onSubmit={(e) => { e.preventDefault(); canjear(); }}>
                <label htmlFor="pace-premium-codigo" style={premiumInvitacionStyles.etiqueta}>{t('premium.code.label')}</label>
                <input
                  id="pace-premium-codigo" ref={campoRef} data-pace-premium-codigo
                  value={texto} onChange={(e) => { setTexto(e.target.value); setError(null); }}
                  placeholder={t('premium.code.placeholder')}
                  autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
                  style={premiumInvitacionStyles.campo}
                />
                {error && (
                  <p role="alert" data-pace-premium-error={error} style={premiumInvitacionStyles.error}>
                    {t('premium.err.' + error) === 'premium.err.' + error ? t('premium.err.title') : t('premium.err.' + error)}
                  </p>
                )}
                <Button type="submit" disabled={comprobando || !texto.trim()} style={premiumInvitacionStyles.ancho}>
                  {t(comprobando ? 'premium.code.checking' : 'premium.code.redeem')}
                </Button>
                <Button variant="secondary" onClick={cerrar} style={{ ...premiumInvitacionStyles.ancho, marginTop: 8 }}>{t('premium.later')}</Button>
              </form>
            ) : (
              <React.Fragment>
                <p style={premiumInvitacionStyles.v1}>{t('premium.v1')}</p>
                <Button variant="secondary" onClick={cerrar} style={premiumInvitacionStyles.ancho}>{t('premium.later')}</Button>
                {permitida && (
                  <button type="button" data-pace-premium-tengo onClick={() => setModo('codigo')} style={premiumInvitacionStyles.enlace}>
                    {t('premium.code.have')}
                  </button>
                )}
              </React.Fragment>
            )}
          </React.Fragment>
        )}
      </div>
    </Modal>
  );
}

const premiumInvitacionStyles = {
  sub: { ...displayItalic, fontSize: 17, color: 'var(--ink-2)', margin: '0 0 14px' },
  lista: { listStyle: 'none', padding: 0, margin: '0 0 16px', fontSize: 14, color: 'var(--ink-2)' },
  item: { display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: '1px dashed var(--line)' },
  detalle: { color: 'var(--ink-3)', fontSize: 13, textAlign: 'right' },
  v1: { ...displayItalic, fontSize: 18, color: 'var(--ink)', margin: '0 0 14px' },
  ancho: { width: '100%', justifyContent: 'center', borderRadius: 'var(--r-pill)' },
  enlace: { display: 'block', margin: '14px auto 0', background: 'none', border: 0, cursor: 'pointer',
    ...displayItalic, fontSize: 16, color: 'var(--premium)' },
  etiqueta: { display: 'block', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 6 },
  campo: { width: '100%', boxSizing: 'border-box', padding: '10px 12px', marginBottom: 10, fontSize: 14,
    fontFamily: 'var(--font-mono)', color: 'var(--ink)', background: 'var(--paper-2)',
    border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)' },
  error: { fontSize: 13, color: 'var(--breathe-2)', margin: '0 0 10px', lineHeight: 1.45 },
};

Object.assign(window, { PremiumInvitacion, PaceCandado, paceAbrirPremium });
