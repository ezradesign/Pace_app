/* PACE · OnboardingCompleto.jsx — EL ÚLTIMO PASO DE LA BIENVENIDA: PACE COMPLETO
   ============================================================
   La bienvenida enseña PACE completo una vez, al final, con los dos precios y
   «Ahora no» igual de grande que «Probar 7 días gratis» (Ez, 15 oct. 2026). Fuera
   de aquí, solo al tocar algo cerrado (PremiumInvitacion.jsx).

   DOS MANERAS, según `paceBienvenidaCompleto()` (state-entitlement.jsx):
   · 'compra', CON LA TIENDA ABIERTA: la opción A que eligió Ez el 16 oct.
     (https://claude.ai/artifact/AvME9EqcMHXhywx43vEdKG): la lista de la invitación, los
     dos precios en una frase, los dos botones iguales y «Prefiero pagarlo una vez» debajo.
   · 'abierto', MIENTRAS TODO ESTÁ ABIERTO HASTA v1 (Ez, 2A del 27 oct.): la misma lista
     con lo que es verdad hoy, lo que costará después y un solo botón, porque no hay nada
     que comprar. Quien llega ahora sabe desde el principio qué es gratis y qué costará, y
     el día de v1 no se lleva un susto. El día que se pueda comprar en ese canal, la
     bienvenida pasa sola a la de comprar.
   Los precios son los de la tienda, nunca de las traducciones; donde la tienda aún no los
   tiene (Android antes de Play Billing, el iPhone), la frase del precio no sale.
   Sin escena: como «¿Cómo es tu semana?».

   `onFin(plan)`: null es «Ahora no» o «Comenzar»; 'mes' o 'vida', la compra. La
   bienvenida se cierra antes de comprar, porque la compra de la web sigue en la página
   de Stripe y al volver no debe salir otra vez. */

function OnbCompletoPaso({ modo, onFin }) {
  const { t, tn, lang } = useT();
  const abierto = modo === 'abierto';
  const planes = abierto ? paceTiendaPrecios(lang) : paceTiendaPlanes(lang);
  const mes = planes.find((p) => p.plan === 'mes') || null;
  const vida = planes.find((p) => p.plan === 'vida') || null;
  const dias = (mes && mes.pruebaDias) || 7;

  return (
    <React.Fragment>
      <h2 style={onboardingStyles.title}>{t('premium.onb.titulo')}</h2>
      <p style={onboardingStyles.lede}>{t(abierto ? 'premium.onb.abierto.lede' : 'premium.onb.lede')}</p>
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
          {tn(abierto ? 'premium.onb.abierto.precios' : 'premium.onb.precios', { vida: vida.precio, mes: mes.precio, dias })}
        </p>
      )}
      {abierto ? (
        <React.Fragment>
          <button data-pace-cta data-pace-onb-comenzar onClick={() => onFin(null)} style={onboardingStyles.cta}>
            {t('onboarding.welcome.cta')}
          </button>
          <p data-pace-onb-v1 style={{ ...onbCompletoStyles.aviso, maxWidth: 340 }}>{t('premium.onb.abierto.aviso')}</p>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div style={onbCompletoStyles.par}>
            {mes && (
              <button data-pace-cta data-pace-onb-probar onClick={() => onFin('mes')} style={{ ...onboardingStyles.cta, ...onbCompletoStyles.mitad }}>
                {tn('premium.onb.probar', { dias })}
              </button>
            )}
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
      )}
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
};

Object.assign(window, { OnbCompletoPaso });
