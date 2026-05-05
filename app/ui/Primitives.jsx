/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   Primitivos UI compartidos: Modal, Card, Tag, Button, Divider, Meta.
*/

const { useEffect } = React;

/* ============================================================
   displayItalic — helper para el par inline más repetido del repo.

   Audit v0.12.7 §3.3 detectó ~50 ocurrencias inline de
     fontFamily: 'var(--font-display)', fontStyle: 'italic'
   En sesión 26 (v0.12.8) se extrajo a este helper para que cada
   cambio futuro al token viva en un único sitio. El patrón de uso
   es spread dentro de un style inline, NO className, porque casi
   todos los callsites ya co-locan otros estilos inline (fontSize,
   color, margin, etc.) y romper eso forzaría refactor masivo.

     <h2 style={{ ...displayItalic, fontSize: 22, margin: 0 }}>…</h2>

   La clase CSS equivalente `.pace-display-italic` sigue declarada
   en tokens.css por si un futuro consumidor prefiere la ruta
   className; ambas rutas coexisten sin conflicto.
   ============================================================ */
const displayItalic = {
  fontFamily: 'var(--font-display)',
  fontStyle: 'italic',
};

function Modal({ open, onClose, children, maxWidth = 680, tagLabel, title, subtitle }) {
  const { t } = useT();
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      data-pace-modal-backdrop
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(31, 28, 23, 0.28)',
        backdropFilter: 'blur(3px)',
        zIndex: 100,
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        animation: 'pace-fade-in 200ms ease',
      }}
    >
      <div
        data-pace-modal-card
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--paper)',
          borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--sh-modal)',
          padding: 'var(--s-6)',
          maxWidth, width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          position: 'relative',
          border: '1px solid var(--line)',
          animation: 'pace-slide-up 280ms var(--ease)',
        }}
      >
        {onClose && (
          <button
            data-pace-modal-close
            onClick={onClose}
            aria-label={t('common.close')}
            style={{
              position: 'absolute', top: 18, right: 20,
              fontSize: 20, color: 'var(--ink-3)',
              width: 28, height: 28,
              display: 'grid', placeItems: 'center',
              borderRadius: 'var(--r-sm)',
              transition: 'color 160ms',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ink)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ink-3)'}
          >×</button>
        )}
        {(tagLabel || title) && (
          <div data-pace-modal-head style={{ marginBottom: 'var(--s-5)' }}>
            {tagLabel && <div className="pace-meta" style={{ marginBottom: 6 }}>{tagLabel}</div>}
            {title && <h2 data-pace-modal-title style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 32, fontWeight: 500, margin: 0, lineHeight: 1.1
            }}>{title}</h2>}
            {subtitle && <p data-pace-modal-subtitle style={{
              color: 'var(--ink-3)', fontSize: 14, margin: '6px 0 0', maxWidth: '90%'
            }}>{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

function Card({ children, onClick, accent, padded = true, style = {} }) {
  const base = {
    background: 'var(--paper)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--r-md)',
    padding: padded ? 'var(--s-5)' : 0,
    transition: 'all 220ms var(--ease)',
    cursor: onClick ? 'pointer' : 'default',
    position: 'relative',
    ...style,
  };
  return (
    <div
      onClick={onClick}
      style={base}
      onMouseEnter={onClick ? (e) => {
        e.currentTarget.style.borderColor = accent || 'var(--ink-2)';
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = 'var(--sh-soft)';
      } : undefined}
      onMouseLeave={onClick ? (e) => {
        e.currentTarget.style.borderColor = 'var(--line)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      } : undefined}
    >{children}</div>
  );
}

function Tag({ children, color = 'var(--ink-2)', muted = false }) {
  return (
    <span style={{
      display: 'inline-flex',
      padding: '3px 10px',
      fontSize: 10,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      borderRadius: 'var(--r-pill)',
      border: `1px solid ${muted ? 'var(--line)' : color}`,
      color: muted ? 'var(--ink-3)' : color,
      fontWeight: 500,
      background: 'transparent',
    }}>{children}</span>
  );
}

function Button({ children, onClick, variant = 'primary', size = 'md', icon, disabled, style = {}, type = 'button' }) {
  const sizes = {
    sm: { padding: '6px 14px', fontSize: 13, height: 32 },
    md: { padding: '10px 22px', fontSize: 14, height: 42 },
    lg: { padding: '14px 28px', fontSize: 15, height: 52 },
  };
  const variants = {
    primary: {
      background: 'var(--focus)',
      color: 'var(--paper)',
      border: '1px solid var(--focus)',
    },
    secondary: {
      background: 'transparent',
      color: 'var(--ink)',
      border: '1px solid var(--line-2)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--ink-2)',
      border: '1px solid transparent',
    },
    terracota: {
      background: 'var(--breathe)',
      color: 'var(--paper)',
      border: '1px solid var(--breathe)',
    },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...sizes[size],
        ...variants[variant],
        borderRadius: 'var(--r-md)',
        fontWeight: 500,
        letterSpacing: 0.2,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        transition: 'all 180ms var(--ease)',
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (variant === 'primary') e.currentTarget.style.background = 'var(--focus-2)';
        if (variant === 'secondary') e.currentTarget.style.background = 'var(--paper-2)';
        if (variant === 'ghost') e.currentTarget.style.background = 'var(--paper-2)';
        if (variant === 'terracota') e.currentTarget.style.background = 'var(--breathe-2)';
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        if (variant === 'primary') e.currentTarget.style.background = 'var(--focus)';
        if (variant === 'secondary') e.currentTarget.style.background = 'transparent';
        if (variant === 'ghost') e.currentTarget.style.background = 'transparent';
        if (variant === 'terracota') e.currentTarget.style.background = 'var(--breathe)';
      }}
    >
      {icon && <span style={{ fontSize: 12 }}>{icon}</span>}
      {children}
    </button>
  );
}

function Divider({ label, style = {} }) {
  if (label) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--ink-3)', ...style }}>
        <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
        <span className="pace-meta" style={{ fontSize: 10 }}>{label}</span>
        <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
      </div>
    );
  }
  return <div style={{ height: 1, background: 'var(--line)', ...style }} />;
}

function Meta({ children, style = {} }) {
  return <div className="pace-meta" style={style}>{children}</div>;
}

/* Animaciones globales */
const _paceAnimStyle = document.getElementById('pace-anim');
if (!_paceAnimStyle) {
  const s = document.createElement('style');
  s.id = 'pace-anim';
  s.textContent = `
    @keyframes pace-fade-in { from { opacity: 0 } to { opacity: 1 } }
    @keyframes pace-slide-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pace-pulse { 0%, 100% { opacity: 0.4 } 50% { opacity: 1 } }
  `;
  document.head.appendChild(s);
}

/* ============================================================
   CSS responsive del Modal base (sesión 27 · v0.12.10).

   Patrón documentado en decisión activa sesión 22: selectores
   [data-pace-*] con !important, inyectados en <head>. NO se
   modifican los objetos de estilos inline (que siguen siendo
   la fuente de verdad en desktop).

   Breakpoint único: 640px (coherente con main.jsx y Sidebar.jsx).

   En móvil el modal:
   - Pasa de card centrada 85vh a sheet pegada a los bordes
     (backdrop padding 24→12).
   - Ancho ocupa 100% menos el padding del backdrop; el
     `maxWidth` por prop se ignora.
   - Alto máximo = 100dvh menos el padding del backdrop, para
     que el scroll interno siga cabiendo sin tapar la barra URL
     (sigue la decisión activa sesión 23 de usar dvh con fallback).
   - Padding interior un paso menos (var(--s-6) → var(--s-5))
     para ganar pixeles útiles.
   - Título del header 32→26 y subtitle ancho libre (quita el 90%).
   - Botón × más grande (28→36) para target táctil ≥44×44 tras
     sumar padding perimetral.
   ============================================================ */
const _paceModalResponsive = document.getElementById('pace-modal-responsive-css');
if (!_paceModalResponsive) {
  const s = document.createElement('style');
  s.id = 'pace-modal-responsive-css';
  s.textContent = `
    @media (max-width: 640px) {
      [data-pace-modal-backdrop] {
        padding: 12px !important;
        place-items: end center !important;
      }
      [data-pace-modal-card] {
        max-width: 100% !important;
        max-height: calc(100vh - 24px) !important;
        max-height: calc(100dvh - 24px) !important;
        padding: var(--s-5) !important;
        border-radius: var(--r-md) !important;
      }
      [data-pace-modal-close] {
        top: 10px !important;
        right: 10px !important;
        width: 36px !important;
        height: 36px !important;
        font-size: 22px !important;
      }
      [data-pace-modal-head] {
        margin-bottom: var(--s-4) !important;
        padding-right: 36px !important;
      }
      [data-pace-modal-title] {
        font-size: 26px !important;
        line-height: 1.15 !important;
      }
      [data-pace-modal-subtitle] {
        max-width: 100% !important;
        font-size: 13px !important;
      }
    }
  `;
  document.head.appendChild(s);
}

Object.assign(window, { Modal, Card, Tag, Button, Divider, Meta, displayItalic });
