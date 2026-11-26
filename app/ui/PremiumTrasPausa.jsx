/* PACE · PremiumTrasPausa.jsx — PACE COMPLETO, UNA VEZ, AL TERMINAR LA PRIMERA PAUSA
   ============================================================
   Ez, 26 nov. 2026 (auditoría de la primera impresión, «la que tú recomiendes»): la bienvenida
   acababa con los precios antes de que la persona hubiera hecho ni una pausa, y podía sonar a
   «esto se paga». Ahora la bienvenida no los enseña y esta tarjeta sale UNA SOLA VEZ, en la
   pantalla final de la primera pausa entera: quien acaba de terminarla ya sabe para qué sirve
   PACE, y «PACE completo» se entiende como «más de esto».

   NO SALTA SOLA (MONETIZATION.md): es una línea dentro de una pantalla que la persona ya tiene
   delante, debajo de «¿Te ayudó esta pausa?», sin velo ni hoja. «Ver qué incluye» abre la pantalla
   que antes cerraba la bienvenida (OnbCompletoPaso, OnboardingCompleto.jsx), tal cual: mientras todo
   está abierto hasta v1 dice que también es tuyo y lo que costará después; con la tienda abierta,
   sus precios y «Ahora no» igual de grande. La invitación de siempre no valía: hasta v1 dice
   «Llega cuando salga a la venta», y a quien ya lo tiene abierto le sonaría a que no. «Ahora no»
   quita la tarjeta. Sin precios aquí: los dice esa pantalla, de la tienda.

   A QUIÉN: a quien acaba la bienvenida desde esta versión (`premiumTrasPausa: 'pendiente'`, lo pone
   Onboarding.jsx), y solo si PACE completo no es suyo ya (`paceBienvenidaCompleto`). Quien ya usaba
   PACE vio los precios en su bienvenida y no la ve. Se apunta 'vista' al montarse: una pausa más y
   ya no sale, se haya tocado o no. */

const { useState: useStatePTP, useEffect: useEffectPTP } = React;

function premiumTrasPausaToca(s) {
  if (!s || s.premiumTrasPausa !== 'pendiente') return false;
  return typeof paceBienvenidaCompleto === 'function' && !!paceBienvenidaCompleto();
}

function PremiumTrasPausa() {
  const { t } = useT();
  /* Se decide al montarse, como «¿Te ayudó?»: apuntarla como vista no debe quitarla de delante. */
  const [toca] = useStatePTP(() => { try { return premiumTrasPausaToca(getState()); } catch (e) { return false; } });
  const [cerrada, setCerrada] = useStatePTP(false);
  useEffectPTP(() => {
    if (toca) { try { setState({ premiumTrasPausa: 'vista' }); } catch (e) {} }
  }, [toca]);
  if (!toca || cerrada) return null;
  return (
    <div data-pace-premium-tras-pausa style={premiumTrasPausaStyles.caja}>
      <div style={premiumTrasPausaStyles.titulo}>{t('premium.tras.titulo')}</div>
      <p style={premiumTrasPausaStyles.texto}>{t('premium.tras.texto')}</p>
      <div style={premiumTrasPausaStyles.fila}>
        <button type="button" data-pace-premium-tras-ahora-no onClick={() => setCerrada(true)} style={premiumTrasPausaStyles.ahoraNo}>
          {t('premium.tras.ahoraNo')}
        </button>
        <button type="button" data-pace-premium-tras-ver onClick={() => { setCerrada(true); paceAbrirCompleto(); }} style={premiumTrasPausaStyles.ver}>
          {t('premium.tras.ver')}
        </button>
      </div>
    </div>
  );
}

const premiumTrasPausaStyles = {
  caja: { margin: '20px auto 0', maxWidth: 400, padding: '12px 16px 6px', textAlign: 'left',
    background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)' },
  titulo: { fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, fontWeight: 500, color: 'var(--ink)' },
  texto: { fontSize: 13, lineHeight: 1.45, color: 'var(--ink-2)', margin: '4px 0 0' },
  fila: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 4 },
  /* Los dos con 44 px de alto: se tocan con el dedo. */
  ahoraNo: { fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--ink-3)',
    background: 'none', border: 0, padding: 0, minHeight: 44, cursor: 'pointer' },
  ver: { fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--focus)',
    background: 'none', border: 0, padding: 0, minHeight: 44, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 },
};

/* LA PANTALLA DE PACE COMPLETO, FUERA DE LA BIENVENIDA. Se gestiona sola (pace:open-completo), como
   la invitación; se monta en main.jsx a su lado. Con el papel de la bienvenida y su columna, sin
   escena. «Comenzar» del modo 'abierto' dice aquí «Entendido»: no empieza nada. Comprar la cierra
   antes, como hacía la bienvenida: la compra de la web sigue en la página de Stripe. */
function paceAbrirCompleto() {
  try { window.dispatchEvent(new CustomEvent('pace:open-completo')); } catch (e) {}
}

function PremiumCompletoHoja() {
  const { t } = useT();
  const [modo, setModo] = useStatePTP(null);
  useEffectPTP(() => {
    const abrir = () => { const m = typeof paceBienvenidaCompleto === 'function' ? paceBienvenidaCompleto() : null; if (m) setModo(m); };
    window.addEventListener('pace:open-completo', abrir);
    return () => window.removeEventListener('pace:open-completo', abrir);
  }, []);
  useEffectPTP(() => {
    if (!modo) return;
    const esc = (e) => { if (e.key === 'Escape') { e.stopPropagation(); setModo(null); } };
    window.addEventListener('keydown', esc, true);
    return () => window.removeEventListener('keydown', esc, true);
  }, [modo]);
  if (!modo) return null;
  const fin = (plan) => {
    setModo(null);
    if (plan && typeof paceComprar === 'function') Promise.resolve(paceComprar(plan)).then((r) => {
      if (r && !r.fuera && (r.ok || r.motivo === 'pendiente')) paceAbrirPremium({ resultado: r });
    }, () => {});
  };
  return (
    <div data-pace-completo-hoja role="dialog" aria-modal="true" aria-label={t('premium.name')} style={onboardingStyles.root}>
      <div style={onboardingStyles.header}>
        <span style={{ width: 86 }} />
        <span className="pace-meta">{t('premium.name')}</span>
        <span style={{ width: 86 }} />
      </div>
      <div style={onboardingStyles.scroll}>
        <div data-pace-reveal style={onboardingStyles.column}>
          <OnbCompletoPaso modo={modo} onFin={fin} fuera />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PremiumTrasPausa, premiumTrasPausaToca, PremiumCompletoHoja, paceAbrirCompleto });
