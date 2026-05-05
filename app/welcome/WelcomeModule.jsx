/* PACE · Welcome de primera vez
   ============================================================
   FILOSOFÍA — sesión 17 · v0.12.0

   La primera vez que alguien abre PACE, merece una bienvenida
   editorial corta — no un onboarding de 5 pantallas con tooltips.

   Estructura (1 sola pantalla):
     1. Logo + wordmark Pace.
     2. Manifesto breve: "Antídoto a la silla. A tu ritmo."
     3. 3 valores en positivo: todo local · sin cuentas · siempre gratis.
     4. Campo opcional de intención — "¿Qué quieres cultivar hoy?"
        Si el usuario escribe algo, se guarda en `state.intention`.
        Si lo deja vacío, no pasa nada (no es obligatorio).
     5. Botón primario "Empezar" — cierra el modal y marca
        `state.firstSeen = timestamp`.

   MECÁNICA:
     - Se dispara una sola vez por instalación, cuando
       `state.firstSeen == null`.
     - Al cerrar (o terminar) se fija `firstSeen` a timestamp
       para no volver a mostrarse nunca.
     - Hook `useFirstTimeWelcome` replica el patrón de
       `useSupportAutoTrigger`: mismo contrato, mismo tiempo de
       espera (1.2s tras mount) para no competir con otros
       modales de auto-trigger.
     - Re-abrir manualmente es posible via evento
       `pace:open-welcome` (para Tweaks dev o pruebas).

   i18n sesión 35: strings migrados a useT(). Toggle pill ES·EN
   en esquina superior derecha para cambiar idioma antes de empezar.
============================================================ */

const { useEffect: useEffectWEL, useState: useStateWEL, useRef: useRefWEL } = React;

/* ============================================================
   WelcomeModal — la pantalla de bienvenida
   ============================================================ */
function WelcomeModal({ open, onClose }) {
  const [state, set] = usePace();
  const { t } = useT();
  const [draft, setDraft] = useStateWEL('');
  const inputRef = useRefWEL(null);

  // Al abrir: precargar la intención actual si existía.
  // Y enfocar el input después de la animación de entrada del modal
  // (280ms según Primitives.jsx → pace-slide-up).
  useEffectWEL(() => {
    if (!open) return;
    setDraft(state.intention || '');
    const t = setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 320);
    return () => clearTimeout(t);
  }, [open]);

  if (!open) return null;

  const finish = () => {
    // Guardamos la intención si el usuario escribió algo; sino no tocamos.
    // `firstSeen` se fija SIEMPRE al cerrar (por botón o por X) para que
    // no vuelva a aparecer nunca — es una bienvenida, no un trámite.
    const patch = { firstSeen: Date.now() };
    const trimmed = draft.trim();
    if (trimmed) patch.intention = trimmed.slice(0, 120); // cap defensivo
    set(patch);
    onClose && onClose();
  };

  const skip = () => {
    // "No gracias" también marca firstSeen. Sin intención.
    set({ firstSeen: Date.now() });
    onClose && onClose();
  };

  const toggleLang = () => set({ lang: state.lang === 'es' ? 'en' : 'es' });

  return (
    <Modal open={open} onClose={skip} maxWidth={520}>
      <div style={{ ...welcomeStyles.inner, position: 'relative' }}>
        {/* Toggle pill ES · EN — esquina superior derecha */}
        <button
          onClick={toggleLang}
          title={state.lang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
          style={welcomeStyles.langToggle}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--ink)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink-3)'; }}
        >
          <span style={{ fontWeight: state.lang === 'es' ? 600 : 400 }}>ES</span>
          <span style={{ color: 'var(--line-2)' }}> · </span>
          <span style={{ fontWeight: state.lang === 'en' ? 600 : 400 }}>EN</span>
        </button>

        {/* LAYOUT DE 2 COLUMNAS (v0.12.1) — header compacto a la izquierda
            (logo + meta + título) y lede a la derecha. Ahorra ~120px
            verticales respecto al layout apilado anterior y encaja sin
            scroll en pantallas 720p. */}
        <div style={welcomeStyles.header}>
          <div style={welcomeStyles.headerLeft}>
            <div style={welcomeStyles.logoMini}>
              <PaceWordmark variant={state.logoVariant || 'pace'} />
            </div>
            <Meta style={{ marginTop: 10 }}>{t('welcome.greeting')}</Meta>
          </div>
          <div style={welcomeStyles.headerRight}>
            <h2 style={welcomeStyles.title}>
              {t('welcome.tagline')}{' '}
              <span style={{ color: 'var(--ink-3)', fontStyle: 'italic' }}>{t('welcome.tagline.sub')}</span>
            </h2>
            <p style={welcomeStyles.lede}>
              {t('welcome.lede')}
            </p>
          </div>
        </div>

        {/* 3 valores en línea — ya más compactos */}
        <div style={welcomeStyles.values}>
          <WValue label={t('welcome.value.local.label')} sub={t('welcome.value.local.sub')} />
          <span style={welcomeStyles.sep} />
          <WValue label={t('welcome.value.accounts.label')} sub={t('welcome.value.accounts.sub')} />
          <span style={welcomeStyles.sep} />
          <WValue label={t('welcome.value.free.label')} sub={t('welcome.value.free.sub')} />
        </div>

        {/* Campo de intención — opcional, fila horizontal label+input */}
        <div style={welcomeStyles.intentionBlock}>
          <label htmlFor="pace-intention" style={welcomeStyles.intentionLabel}>
            {t('welcome.intention.label')}
            <span style={welcomeStyles.optional}>{t('welcome.intention.optional')}</span>
          </label>
          <input
            id="pace-intention"
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') finish(); }}
            placeholder={t('welcome.intention.placeholder')}
            maxLength={120}
            style={welcomeStyles.intentionInput}
          />
        </div>

        {/* Acciones — botón + skip en línea para no añadir altura */}
        <div style={welcomeStyles.actions}>
          <button onClick={skip} style={welcomeStyles.skip}>
            {t('welcome.skip')}
          </button>
          <Button variant="primary" size="md" onClick={finish}>
            {t('welcome.cta')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* Valor individual — compacto: label + sub en una sola columna.
   v0.12.1: tamaños reducidos ligeramente para que la fila de valores
   quepa en ~48px de alto total. */
function WValue({ label, sub }) {
  return (
    <div style={{ flex: 1, textAlign: 'center', padding: '0 4px' }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontSize: 13,
        color: 'var(--ink)',
        lineHeight: 1.1,
      }}>{label}</div>
      <div style={{
        fontSize: 10,
        color: 'var(--ink-3)',
        marginTop: 2,
        letterSpacing: 0.1,
      }}>{sub}</div>
    </div>
  );
}

/* ============================================================
   Hook — auto-trigger cuando firstSeen == null
   ------------------------------------------------------------
   Mismo patrón que useSupportAutoTrigger. La demora de 1.2s
   evita que el modal compita con el mount de la app (logo
   parpadeando, toasts de rollover, etc.).
   ============================================================ */
function useFirstTimeWelcome(setOpen) {
  const [state] = usePace();
  useEffectWEL(() => {
    if (state.firstSeen == null) {
      const t = setTimeout(() => setOpen(true), 1200);
      return () => clearTimeout(t);
    }
  }, [state.firstSeen]);
}

/* ============================================================
   Estilos — nombre único según regla CLAUDE.md
   v0.12.1: layout de 2 columnas + tamaños ajustados para que el
   modal completo quepa en ~440px de alto (sin scroll en 720p).
   ============================================================ */
const welcomeStyles = {
  inner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 16,
  },
  langToggle: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: '3px 8px',
    fontSize: 10,
    letterSpacing: '0.08em',
    color: 'var(--ink-3)',
    background: 'var(--paper-2)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--r-pill)',
    cursor: 'pointer',
    transition: 'color 180ms',
    fontFamily: 'var(--font-ui, sans-serif)',
    lineHeight: 1.6,
  },
  header: {
    display: 'grid',
    gridTemplateColumns: '140px 1fr',
    gap: 18,
    alignItems: 'center',
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  headerRight: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  logoMini: {
    width: '100%',
    maxWidth: 140,
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    fontSize: 24,
    fontWeight: 500,
    lineHeight: 1.1,
    margin: 0,
    color: 'var(--ink)',
  },
  lede: {
    fontSize: 13,
    lineHeight: 1.5,
    color: 'var(--ink-2)',
    margin: 0,
  },
  values: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 8px',
    background: 'var(--paper-2)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--r-md)',
  },
  sep: {
    width: 1,
    height: 24,
    background: 'var(--line)',
    flexShrink: 0,
  },
  intentionBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  intentionLabel: {
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    fontSize: 13,
    color: 'var(--ink)',
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  optional: {
    fontSize: 9,
    color: 'var(--ink-3)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    fontStyle: 'normal',
  },
  intentionInput: {
    width: '100%',
    padding: '9px 12px',
    fontSize: 14,
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    color: 'var(--ink)',
    background: 'var(--paper)',
    border: '1px solid var(--line-2)',
    borderRadius: 'var(--r-md)',
    outline: 'none',
    transition: 'border-color 180ms',
    boxSizing: 'border-box',
  },
  actions: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  skip: {
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    fontSize: 12,
    color: 'var(--ink-3)',
    background: 'transparent',
    border: 'none',
    padding: '4px 8px',
    cursor: 'pointer',
    transition: 'color 180ms',
  },
};

Object.assign(window, {
  WelcomeModal, useFirstTimeWelcome,
});
