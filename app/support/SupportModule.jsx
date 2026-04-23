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

/* Copy único — decidido en sesión de diseño post-v0.12.1: se descartan
   las 4 variantes ('cafe', 'pasto', 'vaca', 'come') y se consolida en
   una sola que abraza la metáfora central del proyecto (la vaca que
   pace = PACE). El icono siempre es la vaca.

   Sesión 26 (v0.12.8, audit §2.1): se eliminan los callsites que
   pasaban `state.supportCopyVariant` como argumento y los helpers
   `CupIcon`/`BigCup` muertos. El campo del state se conserva por
   compat localStorage (ver state.jsx: DEPRECADO) pero este módulo
   ya no lo consume en absoluto.

   La función `supportCopy()` y el helper `SupportIcon()` se conservan
   exportados a window sin parámetros — futuros callers que quieran
   re-bifurcar tendrán una API neutra a la que volver. */
const SUPPORT_COPY_DEFAULT = {
  icon: 'cow',
  label: 'Da de pastar a la vaca',
  short: 'Da de pastar a la vaca',
  title: 'Da de pastar a la vaca',
  subtitle: 'Un gesto para que siga paciendo a su ritmo.',
};

function supportCopy() {
  return SUPPORT_COPY_DEFAULT;
}

function SupportIcon({ size = 13 }) {
  return <CowIcon size={size} />;
}

/* ============================================================
   SupportButton — pill del sidebar
   ------------------------------------------------------------
   Diseño: pill paper-2 con borde fino, texto pequeño + icono
   de taza (stroke currentColor). Hover suave a paper-3.
   Sin animación permanente. Sin gradiente. Sin color llamativo.
   ============================================================ */
function SupportButton({ onOpen }) {
  const copy = supportCopy();
  const [hover, setHover] = useStateSUP(false);

  return (
    <button
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title="Apoya el proyecto"
      aria-label={copy.label}
      style={{
        ...displayItalic,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
        padding: '9px 14px',
        fontSize: 12,
        color: hover ? 'var(--ink)' : 'var(--ink-2)',
        background: hover ? 'var(--paper-3)' : 'var(--paper)',
        border: `1px solid ${hover ? 'var(--line-2)' : 'var(--line)'}`,
        borderRadius: 'var(--r-pill)',
        letterSpacing: 0.15,
        transition: 'all 220ms var(--ease)',
        cursor: 'pointer',
      }}
    >
      <span>{copy.short}</span>
      <SupportIcon />
    </button>
  );
}

/* CupIcon eliminado en sesión 26 (audit §2.1 — dead code alta confianza):
   tras la consolidación a una sola variante de copy en v0.12.2, SupportIcon
   siempre devuelve <CowIcon/>, y CupIcon quedó definido sin callsites. */

/* Cabeza de vaca — silueta inspirada en el lockup del logo (cara
   alargada, cuernos cortos hacia arriba, mancha frontal asimétrica).
   Trazo fino en currentColor, 16×16. La pieza crítica que la
   diferencia de un cerdo: los CUERNOS (no las orejas hacia los lados)
   y la CARA ALARGADA hacia abajo (no redonda). */
function CowIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
         stroke="currentColor" strokeWidth="1.2"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* Cuernos cortos hacia arriba — clave para distinguir de cerdo */}
      <path d="M5.5 3.5c-.3-.6-.6-1.1-.2-1.6" />
      <path d="M10.5 3.5c.3-.6.6-1.1.2-1.6" />
      {/* Orejas laterales (salen entre cuerno y cara) */}
      <path d="M4 5c-.8.1-1.6.5-2 1.2" />
      <path d="M12 5c.8.1 1.6.5 2 1.2" />
      {/* Cara alargada: frente ancha, morro más estrecho hacia abajo */}
      <path d="M4.5 5c-.3 2 .1 4.5 1 6 .7 1 1.7 1.5 2.5 1.5s1.8-.5 2.5-1.5c.9-1.5 1.3-4 1-6" />
      {/* Morro — pequeño óvalo en la base */}
      <ellipse cx="8" cy="11.8" rx="1.6" ry="1.1" opacity="0.7" />
      {/* Fosas nasales */}
      <circle cx="7.2" cy="11.8" r="0.25" fill="currentColor" stroke="none" />
      <circle cx="8.8" cy="11.8" r="0.25" fill="currentColor" stroke="none" />
      {/* Ojitos */}
      <circle cx="6.3" cy="8" r="0.35" fill="currentColor" stroke="none" />
      <circle cx="9.7" cy="8" r="0.35" fill="currentColor" stroke="none" />
      {/* Mancha frontal asimétrica — guiño al logo */}
      <path d="M6.2 5.5c-.5.5-.7 1.2-.5 1.8" opacity="0.5" />
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
        {/* Ícono grande de vaca — no emoji, trazo a mano */}
        <div style={supportStyles.heroIcon}>
          <SupportHero />
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
            <span style={{ marginRight: 2 }}>{supportCopy().label}</span>
            <SupportIcon />
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
        ...displayItalic,
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

/* BigCup eliminado en sesión 26 (audit §2.1). Tras la consolidación a
   una sola variante de copy, SupportHero siempre devuelve <BigCow/>. */

/* Cabeza de vaca grande para el hero del modal — mismo diseño que
   CowIcon pero a 48×48. Cuernos cortos arriba, cara alargada,
   morro diferenciado, mancha frontal y briznas de pasto debajo
   para reforzar la metáfora de "pacer" (pace). */
function BigCow() {
  return (
    <svg width="58" height="58" viewBox="0 0 48 48" fill="none"
         stroke="var(--breathe)" strokeWidth="1.4"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* Cuernos cortos — la pieza crítica para distinguir de cerdo */}
      <path d="M17 9c-.9-1.8-1.9-3.3-.6-4.8" />
      <path d="M31 9c.9-1.8 1.9-3.3.6-4.8" />
      {/* Orejas laterales (salen más abajo que los cuernos) */}
      <path d="M12 14c-2.3.3-4.6 1.4-5.8 3.4" />
      <path d="M36 14c2.3.3 4.6 1.4 5.8 3.4" />
      {/* Cara alargada: ancha arriba, estrecha hacia el morro */}
      <path d="M13.5 14c-1 6 .3 13.5 3 18 2 3 5 4.5 7.5 4.5s5.5-1.5 7.5-4.5c2.7-4.5 4-12 3-18" />
      {/* Morro — óvalo diferenciado en la base */}
      <ellipse cx="24" cy="34" rx="5" ry="3.5" opacity="0.7" />
      {/* Fosas nasales */}
      <ellipse cx="21.5" cy="34" rx="0.7" ry="0.9" fill="var(--breathe)" stroke="none" opacity="0.8" />
      <ellipse cx="26.5" cy="34" rx="0.7" ry="0.9" fill="var(--breathe)" stroke="none" opacity="0.8" />
      {/* Ojitos */}
      <circle cx="19" cy="22" r="1.2" fill="var(--breathe)" stroke="none" />
      <circle cx="29" cy="22" r="1.2" fill="var(--breathe)" stroke="none" />
      {/* Mancha frontal asimétrica — guiño al logo */}
      <path d="M18 16c-1.5 1.5-2 3.5-1.5 5.5" opacity="0.5" />
      <path d="M17 18.5c-.3 1-.2 2 .3 2.8" opacity="0.5" />
      {/* Briznas de pasto bajo la cabeza — refuerza la metáfora "pacer" */}
      <path d="M12 44c.6-1 1-2 1-3" opacity="0.45" />
      <path d="M18 44c.4-1.2.4-2.5 0-3.5" opacity="0.6" />
      <path d="M30 44c-.4-1.2-.4-2.5 0-3.5" opacity="0.6" />
      <path d="M36 44c-.6-1-1-2-1-3" opacity="0.45" />
    </svg>
  );
}

/* Hero del modal — siempre la vaca grande tras la consolidación de
   copy en v0.12.2. Firma saneada en sesión 26 (audit §2.1). */
function SupportHero() {
  return <BigCow />;
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
    ...displayItalic,
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
    ...displayItalic,
    fontSize: 13,
    lineHeight: 1.55,
    textAlign: 'center',
    margin: '0 0 20px',
    color: 'var(--ink)',
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
    ...displayItalic,
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
