/* PACE · Apoya el proyecto (Buy Me a Coffee)
   ============================================================
   FILOSOFÍA (no negociable) — sesión 16 · v0.11.11

   PACE se vende por valores, no por escasez:
     - Todo local (localStorage, sin backend).
     - Sin tracking, sin analytics, sin cookies.
     - Gratis y lo seguirá siendo.

   Por tanto:
   - NO es freemium. Donar no desbloquea nada funcional.
   - La donación es voluntaria y se comunica desde valores, no
     desde urgencia ("apóyame que si no cierro"), no desde fomo.
   - Presencia calmada: pill discreto en el footer del sidebar.
     Nada parpadea, nada es amarillo fosforito.
   - Auto-trigger único: tras 7 días de racha. Se muestra una
     sola vez (flag `supportSeenAt`), nunca bloquea flujos.
   - Hay un logro secreto `secret.supporter` activable sólo por
     honor — un botón "Ya doné" dentro del modal. No hay
     verificación (no hay backend); confiar en el usuario es el
     punto. Alinea con el resto del tono del producto.

   USERNAME BMC: ezradesign → https://buymeacoffee.com/ezradesign

   API expuesta a `window`:
     - openSupportModal()  → función imperativa para abrir
     - SupportButton       → pill para usar en el sidebar
     - SupportModal        → host del modal (montar 1 vez en main.jsx)
     - supportCopy(v)      → devuelve { label, title } según variante
*/

const { useEffect: useEffectSUP, useState: useStateSUP } = React;

const BMC_USERNAME = 'ezradesign';
const BMC_URL = `https://buymeacoffee.com/${BMC_USERNAME}`;

/* 3 variantes de copy — expuestas como Tweak. Default = 'cafe' (clásico).
   'pasto' y 'vaca' juegan con la metáfora de la vaca paciendo (logo) */
const SUPPORT_COPY = {
  cafe: {
    label: 'Invita a un café',
    short: 'Invita a un café',
    title: '¿Te invito a uno?',
    subtitle: 'Un café, un gesto. Nada más.',
  },
  pasto: {
    label: 'Riega el pasto',
    short: 'Riega el pasto',
    title: 'Riega el pasto',
    subtitle: 'Para que el proyecto siga creciendo a su ritmo.',
  },
  vaca: {
    label: 'Da de comer a la vaca',
    short: 'Da de comer',
    title: 'Da de comer a la vaca',
    subtitle: 'Un gesto para que siga paciendo a su ritmo.',
  },
};

function supportCopy(variant) {
  return SUPPORT_COPY[variant] || SUPPORT_COPY.cafe;
}

/* ============================================================
   SupportButton — pill del sidebar
   ------------------------------------------------------------
   Diseño: pill paper-2 con borde fino, texto pequeño + icono
   de taza (stroke currentColor). Hover suave a paper-3.
   Sin animación permanente. Sin gradiente. Sin color llamativo.
   ============================================================ */
function SupportButton({ onOpen }) {
  const [state] = usePace();
  const copy = supportCopy(state.supportCopyVariant);
  const [hover, setHover] = useStateSUP(false);

  return (
    <button
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title="Apoya el proyecto"
      aria-label={copy.label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
        padding: '9px 14px',
        fontSize: 12,
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        color: hover ? 'var(--ink)' : 'var(--ink-2)',
        background: hover ? 'var(--paper-3)' : 'var(--paper)',
        border: `1px solid ${hover ? 'var(--line-2)' : 'var(--line)'}`,
        borderRadius: 'var(--r-pill)',
        letterSpacing: 0.15,
        transition: 'all 220ms var(--ease)',
        cursor: 'pointer',
      }}
    >
      <CupIcon />
      <span>{copy.short}</span>
    </button>
  );
}

/* Taza de café — stroke fino, currentColor. Sin relleno para que
   no rompa la jerarquía visual del sidebar. */
function CupIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none"
         stroke="currentColor" strokeWidth="1.2"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* Cuerpo de la taza */}
      <path d="M3 7h8v4.5a2.5 2.5 0 0 1-2.5 2.5h-3A2.5 2.5 0 0 1 3 11.5V7z" />
      {/* Asa */}
      <path d="M11 8.2c1.4 0 2 .7 2 1.8s-.7 1.8-2 1.8" />
      {/* Vaho — 2 líneas finas */}
      <path d="M5 3.2c.3.6.3 1.2 0 1.8" opacity="0.6" />
      <path d="M8 2.4c.3.8.3 1.5 0 2.3" opacity="0.6" />
    </svg>
  );
}

/* ============================================================
   SupportModal — explica la filosofía + ofrece donar
   ------------------------------------------------------------
   Estructura:
     1. Tagline: "PACE es gratis. Y lo seguirá siendo."
     2. 3 valores con línea fina (todo local · sin tracking · open)
     3. Botón primario → abre BMC en nueva pestaña
     4. Botón secundario → "Ya doné" (activa secret.supporter)
     5. Micro-link → copiar URL (por si el usuario prefiere compartir)

   Al abrirlo se marca `supportSeenAt` (timestamp) para que el
   auto-trigger no vuelva a dispararse. El usuario puede re-abrirlo
   manualmente las veces que quiera desde el botón del sidebar.
   ============================================================ */
function SupportModal({ open, onClose }) {
  const [state, set] = usePace();
  const [copied, setCopied] = useStateSUP(false);
  const [thanked, setThanked] = useStateSUP(false);

  // Al abrir por primera vez, marcar supportSeenAt (inhibe auto-trigger futuros).
  useEffectSUP(() => {
    if (open && !state.supportSeenAt) {
      set({ supportSeenAt: Date.now() });
    }
  }, [open]);

  if (!open) return null;

  const goToBMC = () => {
    window.open(BMC_URL, '_blank', 'noopener,noreferrer');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(BMC_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (e) {
      // Fallback silencioso: algunos entornos (iframe restringido) bloquean
      // clipboard. Abrimos BMC como plan B.
      goToBMC();
    }
  };

  const markAsDonated = () => {
    // Logro de honor — no hay verificación, es una promesa al usuario
    // ("eres de los que lo quisieron hacer bien"). Encaja con el tono.
    const wasNew = unlockAchievement('secret.supporter');
    setThanked(true);
    // Si ya estaba desbloqueado, el toast no aparece — mostramos feedback inline.
    if (!wasNew) {
      setTimeout(() => setThanked(false), 2400);
    }
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth={540}>
      <div style={supportStyles.inner}>
        {/* Ícono grande de taza con humo — no emoji, trazo a mano */}
        <div style={supportStyles.heroIcon}>
          <BigCup />
        </div>

        <Meta style={{ textAlign: 'center', marginBottom: 10 }}>Apoya el proyecto</Meta>

        <h2 style={supportStyles.title}>
          PACE es gratis.<br/>
          <span style={{ color: 'var(--ink-3)', fontStyle: 'italic' }}>Y lo seguirá siendo.</span>
        </h2>

        <p style={supportStyles.lede}>
          No hay cuentas. No hay servidor. No te sigue nadie. Todo
          vive en tu navegador — y así queremos que siga.
        </p>

        {/* 3 valores en línea fina */}
        <div style={supportStyles.values}>
          <Value label="Todo local" sub="localStorage únicamente" />
          <Divider style={{ width: 1, height: 28, background: 'var(--line)' }} />
          <Value label="Sin tracking" sub="sin analytics, sin cookies" />
          <Divider style={{ width: 1, height: 28, background: 'var(--line)' }} />
          <Value label="Para siempre" sub="sin paywall, sin pro" />
        </div>

        <p style={supportStyles.cta}>
          Si te cuida, ayúdanos a cuidarlo.<br/>
          <span style={{ color: 'var(--ink-3)' }}>
            No desbloquea nada. Solo nos da café.
          </span>
        </p>

        {/* Botones de acción */}
        <div style={supportStyles.actions}>
          <Button variant="terracota" size="lg" onClick={goToBMC}>
            <CupIcon /> <span style={{ marginLeft: 2 }}>Invita a un café</span>
          </Button>
          <Button variant="secondary" size="md" onClick={copyLink}>
            {copied ? '✓ copiado' : 'Copiar enlace'}
          </Button>
        </div>

        {/* Enlace en texto + "ya doné" */}
        <div style={supportStyles.footer}>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-ui)' }}>
            buymeacoffee.com/{BMC_USERNAME}
          </div>

          <button
            onClick={markAsDonated}
            style={supportStyles.alreadyLink}
            title="Marca un sello privado — confía en ti"
          >
            {thanked ? (
              state.achievements['secret.supporter']
                ? '✦ gracias · sello guardado'
                : '✦ gracias'
            ) : 'Ya doné →'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Value({ label, sub }) {
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

/* Taza grande para el hero del modal — misma silueta que el botón
   pero con más detalle: un par de líneas de vaho más orgánicas y
   un platillo debajo. Todo currentColor = --breathe (terracota). */
function BigCup() {
  return (
    <svg width="58" height="58" viewBox="0 0 48 48" fill="none"
         stroke="var(--breathe)" strokeWidth="1.4"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* Vaho — 3 líneas orgánicas */}
      <path d="M16 9c1 2 1 3.5 0 5.5" opacity="0.5" />
      <path d="M23 6.5c1.2 2.5 1.2 4.3 0 6.8" opacity="0.7" />
      <path d="M30 9c1 2 1 3.5 0 5.5" opacity="0.5" />
      {/* Taza */}
      <path d="M10 19h22v13a7 7 0 0 1-7 7h-8a7 7 0 0 1-7-7V19z" />
      {/* Asa */}
      <path d="M32 22c4 0 6 2 6 5s-2 5-6 5" />
      {/* Platillo */}
      <path d="M7 41h28" opacity="0.5" />
    </svg>
  );
}

/* ============================================================
   Helper — auto-trigger a los 7 días de racha (una sola vez)
   ------------------------------------------------------------
   Se llama desde main.jsx con setOpen. Revisa en cada mount y
   cuando cambia el streak. La condición "primera vez" se apoya
   en el flag `supportSeenAt` (null al principio, timestamp tras
   ver el modal).
   ============================================================ */
function useSupportAutoTrigger(setOpen) {
  const [state] = usePace();
  useEffectSUP(() => {
    // Condición: racha >= 7 + no visto nunca.
    if (state.streak?.current >= 7 && !state.supportSeenAt) {
      // Pequeña demora tras el mount para no competir con toasts de logros.
      const t = setTimeout(() => setOpen(true), 1200);
      return () => clearTimeout(t);
    }
  }, [state.streak?.current, state.supportSeenAt]);
}

/* ============================================================
   Estilos del módulo (nombre único — regla CLAUDE.md)
   ============================================================ */
const supportStyles = {
  inner: {
    display: 'flex', flexDirection: 'column', alignItems: 'stretch',
  },
  heroIcon: {
    display: 'grid', placeItems: 'center',
    width: 72, height: 72,
    margin: '0 auto 14px',
    borderRadius: '50%',
    background: 'var(--breathe-soft)',
    border: '1px solid var(--breathe)',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    fontSize: 32,
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
    maxWidth: 400,
    textAlign: 'center',
  },
  values: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '14px 8px',
    margin: '0 0 20px',
    background: 'var(--paper-2)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--r-md)',
  },
  cta: {
    fontSize: 13,
    lineHeight: 1.55,
    textAlign: 'center',
    margin: '0 0 20px',
    color: 'var(--ink)',
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
  },
  actions: {
    display: 'flex',
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTop: '1px solid var(--line)',
    marginTop: 6,
  },
  alreadyLink: {
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    fontSize: 12,
    color: 'var(--ink-3)',
    background: 'transparent',
    border: 'none',
    padding: '4px 0',
    cursor: 'pointer',
    transition: 'color 180ms',
  },
};

Object.assign(window, {
  SupportButton, SupportModal, useSupportAutoTrigger,
  supportCopy, BMC_URL, BMC_USERNAME,
});
