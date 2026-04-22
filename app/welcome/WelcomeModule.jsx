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

   POR QUÉ ESTE MÓDULO EXISTE:
     - Refuerza el argumento del modal de BMC (v0.11.11):
       cuando dice "Todo local", ahora es lo PRIMERO que el
       usuario lee al abrir la app.
     - Captura una intención opcional — el campo ya existía en
       state (`intention: ''`) pero nunca se exponía en UI.
     - No interrumpe. Es la primera puerta; si el usuario la
       cierra sin escribir, la app sigue funcionando igual.
============================================================ */

const { useEffect: useEffectWEL, useState: useStateWEL, useRef: useRefWEL } = React;

/* ============================================================
   WelcomeModal — la pantalla de bienvenida
   ============================================================ */
function WelcomeModal({ open, onClose }) {
  const [state, set] = usePace();
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

  return (
    <Modal open={open} onClose={skip} maxWidth={560}>
      <div style={welcomeStyles.inner}>
        {/* Logo oficial — usa PaceLogoImage (PNG con fallback SVG).
            Respeta el tweak `logoVariant` del usuario si ya cambió algo
            en una sesión previa. */}
        <div style={welcomeStyles.logoRow}>
          <div style={{ maxWidth: 320, width: '100%' }}>
            <PaceWordmark variant={state.logoVariant || 'pace'} />
          </div>
        </div>

        <Meta style={{ textAlign: 'center', marginBottom: 8 }}>Bienvenida</Meta>

        <h2 style={welcomeStyles.title}>
          Antídoto a la silla.<br/>
          <span style={{ color: 'var(--ink-3)', fontStyle: 'italic' }}>A tu ritmo.</span>
        </h2>

        <p style={welcomeStyles.lede}>
          Micro-pausas de foco, respiración, movilidad e hidratación
          a lo largo del día. Nada de gamificación agresiva, nada
          de notificaciones abrumadoras.
        </p>

        {/* 3 valores en línea */}
        <div style={welcomeStyles.values}>
          <WValue label="Todo local" sub="vive en tu navegador" />
          <span style={welcomeStyles.sep} />
          <WValue label="Sin cuentas" sub="sin registro, sin email" />
          <span style={welcomeStyles.sep} />
          <WValue label="Siempre gratis" sub="sin paywall, sin pro" />
        </div>

        {/* Campo de intención — opcional */}
        <div style={welcomeStyles.intentionBlock}>
          <label htmlFor="pace-intention" style={welcomeStyles.intentionLabel}>
            ¿Qué quieres cultivar hoy?
            <span style={welcomeStyles.optional}> opcional</span>
          </label>
          <input
            id="pace-intention"
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') finish(); }}
            placeholder="concentración, calma, movimiento…"
            maxLength={120}
            style={welcomeStyles.intentionInput}
          />
        </div>

        {/* Acciones */}
        <div style={welcomeStyles.actions}>
          <Button variant="primary" size="lg" onClick={finish}>
            Empezar
          </Button>
          <button onClick={skip} style={welcomeStyles.skip}>
            prefiero saltarlo
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* Valor individual — misma composición que en SupportModal
   pero con la tipografía ligeramente más compacta (el bloque
   es más ancho porque hay 3 valores + separadores). */
function WValue({ label, sub }) {
  return (
    <div style={{ flex: 1, textAlign: 'center', padding: '0 6px' }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontSize: 14,
        color: 'var(--ink)',
        lineHeight: 1.1,
      }}>{label}</div>
      <div style={{
        fontSize: 10,
        color: 'var(--ink-3)',
        marginTop: 3,
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
   ============================================================ */
const welcomeStyles = {
  inner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  logoRow: {
    display: 'grid',
    placeItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    fontSize: 30,
    fontWeight: 500,
    lineHeight: 1.05,
    margin: '0 0 14px',
    textAlign: 'center',
    color: 'var(--ink)',
  },
  lede: {
    fontSize: 14,
    lineHeight: 1.5,
    color: 'var(--ink-2)',
    margin: '0 auto 20px',
    maxWidth: 420,
    textAlign: 'center',
  },
  values: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '14px 8px',
    margin: '0 0 22px',
    background: 'var(--paper-2)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--r-md)',
  },
  sep: {
    width: 1,
    height: 28,
    background: 'var(--line)',
    flexShrink: 0,
  },
  intentionBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 22,
  },
  intentionLabel: {
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    fontSize: 14,
    color: 'var(--ink)',
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  optional: {
    fontSize: 10,
    color: 'var(--ink-3)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    fontStyle: 'normal',
  },
  intentionInput: {
    width: '100%',
    padding: '10px 14px',
    fontSize: 15,
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
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
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
