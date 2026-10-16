/* PACE · OnboardingCompleto.jsx — EL ÚLTIMO PASO DE LA BIENVENIDA: PACE COMPLETO
   ============================================================
   La bienvenida enseña PACE completo una vez, al final, con los dos precios y
   «Ahora no» igual de grande que «Probar 7 días gratis» (Ez, 15 oct. 2026). Fuera
   de aquí, solo al tocar algo cerrado (PremiumInvitacion.jsx).

   SOLO SALE CON LA TIENDA ABIERTA (`paceTiendaAbierta`, state-entitlement.jsx):
   mientras no se pueda comprar en este canal, la bienvenida acaba en «¿Cómo es tu
   semana?» como siempre. Los precios son los de la tienda, nunca de las
   traducciones.

   `onFin(plan)`: null es «Ahora no»; 'mes' o 'vida', la compra. La bienvenida se
   cierra antes de comprar, porque la compra de la web sigue en la página de
   Stripe y al volver no debe salir otra vez. */

function OnbCompletoPaso({ onFin }) {
  const { t, tn, lang } = useT();
  const planes = paceTiendaPlanes(lang);
  const mes = planes.find((p) => p.plan === 'mes') || null;
  const vida = planes.find((p) => p.plan === 'vida') || null;
  const dias = (mes && mes.pruebaDias) || 7;
  const variante = window.PACE_MAQUETA_COMPLETO === 'B' ? 'B' : 'A';

  if (variante === 'B') {
    return (
      <React.Fragment>
        <h2 style={onboardingStyles.title}>{t('premium.onb.titulo')}</h2>
        <p style={onboardingStyles.lede}>{t('premium.onb.lede.largo')}</p>
        <div style={onbCompletoStyles.platos}>
          {[mes, vida].filter(Boolean).map((p) => (
            <button key={p.plan} data-pace-toque data-pace-onb-plan={p.plan} onClick={() => onFin(p.plan)} style={onbCompletoStyles.plato}>
              <span className="pace-meta">{t('premium.plan.' + p.plan)}</span>
              <span style={onbCompletoStyles.importe}>{p.precio}</span>
              <span style={onbCompletoStyles.platoSub}>{tn('premium.plan.' + p.plan + '.d', { dias })}</span>
              <span style={{ ...onbCompletoStyles.platoCta, ...(p.plan === 'mes' ? null : onbCompletoStyles.platoCtaSuave) }}>
                {tn(p.plan === 'mes' ? 'premium.onb.probar.corto' : 'premium.onb.comprar', { dias })}
              </span>
            </button>
          ))}
        </div>
        <button data-pace-onb-ahora onClick={() => onFin(null)} style={{ ...onbCompletoStyles.gemelo, width: '100%' }}>{t('premium.later')}</button>
        <p style={onbCompletoStyles.aviso}>{t('premium.onb.aviso')}</p>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <h2 style={onboardingStyles.title}>{t('premium.onb.titulo')}</h2>
      <p style={onboardingStyles.lede}>{t('premium.onb.lede')}</p>
      <ul style={onbCompletoStyles.lista}>
        {PREMIUM_INCLUYE.map((k, ik) => (
          <li key={k} style={{ ...onbCompletoStyles.item, ...(ik === PREMIUM_INCLUYE.length - 1 ? { borderBottom: 0 } : null) }}>
            <span>{t('premium.inc.' + k)}</span>
            <span style={onbCompletoStyles.detalle}>{t('premium.inc.' + k + '.d')}</span>
          </li>
        ))}
      </ul>
      {mes && vida && (
        <p data-pace-onb-precios style={onbCompletoStyles.precios}>
          {tn('premium.onb.precios', { vida: vida.precio, mes: mes.precio, dias })}
        </p>
      )}
      <div style={onbCompletoStyles.par}>
        <button data-pace-cta data-pace-onb-probar onClick={() => onFin('mes')} style={{ ...onboardingStyles.cta, ...onbCompletoStyles.mitad }}>
          {tn('premium.onb.probar', { dias })}
        </button>
        <button data-pace-onb-ahora onClick={() => onFin(null)} style={{ ...onbCompletoStyles.gemelo, ...onbCompletoStyles.mitad }}>
          {t('premium.later')}
        </button>
      </div>
      <div style={onbCompletoStyles.pie}>
        <p style={onbCompletoStyles.aviso}>{t('premium.onb.aviso')}</p>
        {vida && (
          <button data-pace-onb-vida onClick={() => onFin('vida')} style={onboardingStyles.ghostBtn}>
            {tn('premium.onb.vida', { vida: vida.precio })}
          </button>
        )}
      </div>
    </React.Fragment>
  );
}

const onbCompletoStyles = {
  lista: {
    listStyle: 'none', margin: 0, width: '100%', boxSizing: 'border-box',
    padding: '4px 16px',
    background: 'rgba(242,237,224,0.82)',
    border: '1px solid rgba(184,173,142,0.5)',
    borderRadius: 'var(--r-md)',
    backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
    textAlign: 'left',
  },
  item: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12,
    padding: '8px 0', borderBottom: '1px dashed var(--line)',
    fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--ink)',
  },
  detalle: { fontFamily: 'var(--font-ui)', fontStyle: 'normal', fontSize: 11.5, color: 'var(--ink-3)', textAlign: 'right' },
  precios: {
    fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 17, lineHeight: 1.35,
    color: 'var(--ink)', margin: 0, maxWidth: 400,
    textShadow: '0 0 16px var(--paper), 0 0 8px var(--paper)',
  },
  /* Los dos botones iguales: lado a lado si caben, uno sobre otro si no. */
  par: { display: 'flex', flexWrap: 'wrap', gap: 10, width: '100%', justifyContent: 'center' },
  mitad: { flex: '1 1 190px', marginTop: 0, padding: '13px 16px', boxSizing: 'border-box' },
  gemelo: {
    padding: '13px 16px', borderRadius: 'var(--r-pill)', boxSizing: 'border-box',
    background: 'rgba(242,237,224,0.82)', border: '1px solid var(--focus-cta)',
    color: 'var(--focus-cta)', cursor: 'pointer',
    fontSize: 13, letterSpacing: '0.12em', fontFamily: 'var(--font-ui)',
  },
  pie: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  aviso: {
    fontSize: 11.5, color: 'var(--ink-3)', margin: 0, lineHeight: 1.45,
    textShadow: '0 0 14px var(--paper), 0 0 6px var(--paper)',
  },
  platos: { display: 'flex', gap: 10, width: '100%' },
  plato: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    padding: '14px 10px 12px', cursor: 'pointer', color: 'var(--ink)',
    background: 'rgba(242,237,224,0.82)',
    border: '1px solid rgba(184,173,142,0.6)',
    borderRadius: 'var(--r-md)',
    backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
  },
  importe: { fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 30, fontWeight: 500, lineHeight: 1.1 },
  platoSub: { fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink-2)' },
  platoCta: {
    marginTop: 8, padding: '8px 14px', borderRadius: 'var(--r-pill)', width: '100%', boxSizing: 'border-box',
    background: 'var(--focus-cta)', color: 'var(--paper)', fontSize: 12, letterSpacing: '0.1em', fontFamily: 'var(--font-ui)',
  },
  platoCtaSuave: { background: 'transparent', color: 'var(--focus-cta)', border: '1px solid var(--focus-cta)', padding: '7px 14px' },
};

Object.assign(window, { OnbCompletoPaso });
