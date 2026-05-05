/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   SessionShell — cáscara compartida de sesiones activas
   =====================================================
   Extraído en sesión 26 (v0.12.8) desde la duplicación detectada entre
   Breathe y Move en el informe `docs/audits/audit-v0.12.7.md`:
     - sessionStyles / moveSessionStyles (idénticos salvo gap)
     - SessionHeader / MoveHeader (idéntico JSX)
     - Stat / MoveStat (byte-por-byte iguales)
     - Pantalla 'prep' (countdown 3-2-1, 200px italic)
     - Pantalla 'done' (círculo check 120px + stats + copy italic)

   Regla no negociable: ningún cambio de comportamiento observable.
   Los módulos pasan `accent` (color CSS var), copy específico y
   el subconjunto de stats que quieran mostrar.

   API expuesta a `window`:
     - SessionShell   → root + header con salida
     - SessionPrep    → cuenta atrás de preparación
     - SessionDone    → pantalla de completado
     - SessionStat    → cifra grande + label pequeño
     - sessionShellStyles → objeto de estilos por si un módulo necesita
                            componer layouts custom (ej: dots / ruler)

   Los colores se pasan como strings de var CSS:
     accent:      'var(--breathe)' | 'var(--move)' | 'var(--extra)'
     accentSoft:  'var(--breathe-soft)' | 'var(--move-soft)' | ...
   ============================================================ */

/* Estilos base — fusión de sessionStyles + moveSessionStyles.
   Los dos originales eran idénticos salvo `center.gap` (32 en breathe,
   ausente en move). Lo absorbemos aceptando `gap` como prop opcional
   en SessionShell — por defecto sin gap (ningún módulo necesitaba
   exactamente 32; Breathe usaba ese gap entre visual+texto pero
   dentro de `center` ya hay flexbox column ahí que lo controla). */
const sessionShellStyles = {
  root: {
    position: 'fixed', inset: 0,
    background: 'var(--paper)',
    zIndex: 90,
    display: 'flex',
    flexDirection: 'column',
    padding: '28px 48px 40px',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  exitBtn: {
    fontSize: 13, color: 'var(--ink-2)',
    padding: '6px 10px',
  },
  center: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
  },
  centerGap: {
    gap: 32,
  },
  footer: {
    display: 'flex', justifyContent: 'center',
  },
  ctrlBtn: {
    padding: '10px 22px',
    fontSize: 13,
    border: '1px solid var(--line-2)',
    borderRadius: 'var(--r-md)',
    background: 'var(--paper-2)',
    color: 'var(--ink)',
  },
};

/* ============================================================
   SessionShell — root + header + slot de children + footer
   Props:
     - routine        → { code, name } para el header
     - onExit(reason) → cerrar sesión ('exit' | 'done')
     - headerExtra    → nodo entre el título y el botón "× Salir"
     - footerGap      → gap entre botones del footer (default 12)
     - centerGap      → true para añadir gap:32 al contenedor central
                        (el patrón de Breathe con visual+texto)
     - children       → contenido del área central (lo que va dentro de .center)
     - footer         → nodo del footer (botones de control)
     - hint           → texto de ayuda en la base ("Espacio pausar · …")
   ============================================================ */
function SessionShell({ routine, onExit, headerExtra, children, footer, hint, footerGap = 12, centerGap = false }) {
  return (
    <div data-pace-session-root style={sessionShellStyles.root}>
      <SessionHeader routine={routine} onExit={onExit} extra={headerExtra} />
      <div data-pace-session-center style={centerGap
        ? { ...sessionShellStyles.center, ...sessionShellStyles.centerGap }
        : sessionShellStyles.center
      }>
        {children}
      </div>
      {footer && (
        <div data-pace-session-footer style={{ ...sessionShellStyles.footer, gap: footerGap }}>
          {footer}
        </div>
      )}
      {hint && (
        <div data-pace-session-hint style={{
          position: 'absolute', bottom: 14, left: 0, right: 0,
          textAlign: 'center', fontSize: 10,
          letterSpacing: '0.16em', textTransform: 'uppercase',
          color: 'var(--ink-3)', opacity: 0.6,
        }}>{hint}</div>
      )}
    </div>
  );
}

function SessionHeader({ routine, onExit, extra }) {
  const { t } = useT();
  return (
    <div data-pace-session-header style={sessionShellStyles.header}>
      <div>
        <Meta style={{ fontSize: 10 }}>{routine.code}</Meta>
        <h2 data-pace-session-title style={{
          ...displayItalic,
          fontSize: 22, margin: '2px 0 0', fontWeight: 500,
        }}>{routine.name}</h2>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {extra}
        <button onClick={() => onExit('exit')} style={sessionShellStyles.exitBtn}>{t('session.exit')}</button>
      </div>
    </div>
  );
}

/* ============================================================
   SessionPrep — pantalla de cuenta atrás 3-2-1
   Props:
     - routine        → header passthrough
     - onExit         → header passthrough
     - accent         → color del número gigante (var CSS)
     - prepCount      → número a mostrar (3..0)
     - copy           → línea italic bajo el número
                        ("Siéntate cómodo. Respira natural." / "De pie. Sin prisa. 6 pasos.")
     - onSkip         → callback del botón "Empezar ahora"
   ============================================================ */
function SessionPrep({ routine, onExit, accent, prepCount, copy, onSkip }) {
  const { t } = useT();
  return (
    <SessionShell
      routine={routine}
      onExit={onExit}
      footer={<button onClick={onSkip} style={sessionShellStyles.ctrlBtn}>{t('session.startNow')}</button>}
    >
      <div data-pace-session-prep style={{ textAlign: 'center', maxWidth: 460 }}>
        <div style={{
          fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'var(--ink-3)', marginBottom: 18,
        }}>{t('session.prep')}</div>
        <div data-pace-session-prep-num style={{
          ...displayItalic,
          fontSize: 200, fontWeight: 400, lineHeight: 0.9,
          color: accent,
          fontVariantNumeric: 'tabular-nums',
        }}>{prepCount > 0 ? prepCount : '·'}</div>
        <div data-pace-session-prep-copy style={{
          ...displayItalic,
          fontSize: 20, color: 'var(--ink-2)', marginTop: 20,
        }}>{copy}</div>
      </div>
    </SessionShell>
  );
}

/* ============================================================
   SessionDone — pantalla de completado
   Props:
     - routine        → header passthrough
     - onExit         → header passthrough
     - accent         → color del círculo check + botón
     - accentSoft     → fondo soft del círculo
     - doneMeta       → "Sesión completada" / "Antídoto completado"
     - doneCopy       → párrafo italic bajo las stats
     - stats          → [{ label, value }] — se renderizan con <SessionStat>
     - buttonVariant  → 'terracota' (Breathe) o null (Move usa estilo custom)
     - buttonStyle    → override del style del botón "Volver al inicio"
   ============================================================ */
function SessionDone({
  routine, onExit, accent, accentSoft,
  doneMeta, doneCopy, stats = [],
  buttonVariant, buttonStyle,
}) {
  const { t } = useT();
  const btn = buttonVariant
    ? <Button variant={buttonVariant} onClick={() => onExit('done')}>{t('session.backToHome')}</Button>
    : <Button onClick={() => onExit('done')} style={buttonStyle}>{t('session.backToHome')}</Button>;

  return (
    <SessionShell routine={routine} onExit={onExit} footer={btn}>
      <div data-pace-session-done style={{ textAlign: 'center', maxWidth: 520 }}>
        <div data-pace-session-done-hero style={{
          width: 120, height: 120, margin: '0 auto 24px',
          borderRadius: '50%',
          background: accentSoft,
          border: `1.5px solid ${accent}`,
          display: 'grid', placeItems: 'center',
          animation: 'pace-fade-in 600ms ease',
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
               stroke={accent} strokeWidth="1.5"
               strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <div style={{
          fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'var(--ink-3)', marginBottom: 12,
        }}>{doneMeta}</div>
        <h1 data-pace-session-done-title style={{
          ...displayItalic,
          fontSize: 56, fontWeight: 500, margin: '0 0 24px', lineHeight: 1.05,
        }}>{routine.name}</h1>
        {stats.length > 0 && (
          <div data-pace-session-stats style={{ display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 36 }}>
            {stats.map((s, i) => <SessionStat key={i} label={s.label} value={s.value} />)}
          </div>
        )}
        <p data-pace-session-done-copy style={{
          ...displayItalic,
          fontSize: 18, color: 'var(--ink-2)',
          maxWidth: 400, margin: '0 auto 36px', lineHeight: 1.5,
        }}>{doneCopy}</p>
      </div>
    </SessionShell>
  );
}

/* ============================================================
   SessionStat — cifra grande italic + label pequeño
   Fusión de `Stat` (Breathe) y `MoveStat` (Move) — byte-por-byte iguales.
   ============================================================ */
function SessionStat({ label, value }) {
  return (
    <div data-pace-session-stat style={{ textAlign: 'center' }}>
      <div data-pace-session-stat-num style={{
        ...displayItalic,
        fontSize: 40, fontWeight: 500, lineHeight: 1,
        color: 'var(--ink)',
      }}>{value}</div>
      <div style={{
        fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
        color: 'var(--ink-3)', marginTop: 8,
      }}>{label}</div>
    </div>
  );
}

/* ============================================================
   CSS responsive de SessionShell (sesión 27 · v0.12.10).

   Patrón coherente con Primitives.Modal: selectores [data-*]
   con !important inyectados en <head>.

   Las pantallas de sesión son fullscreen (`inset: 0`), no cards
   centradas — su problema en móvil no es "el modal no cabe"
   sino "las tipografías monumentales rompen el layout":
     - prep muestra 3-2-1 a 200px (demasiado en 375px de ancho)
     - done muestra `routine.name` a 56px italic
     - stats en fila con gap 40 desbordan con 2 o 3 stats
     - padding root 28/48/40 se come 96px útiles de 375

   En móvil se ajusta:
   - Padding root: 28/48/40 → 16/20/24
   - Header título: 22 → 18
   - Prep núm 200 → 128, copy 20 → 15
   - Done círculo 120 → 80, h1 56 → 34, copy 18 → 14
   - Stats row: gap 40 → 20, padding lateral para que no rocen
     los bordes cuando son 3
   - Hint: bottom 14 → 6

   No se mueve la estructura; las tipografías sólo reescalan.
   ============================================================ */
const _paceSessionResponsive = document.getElementById('pace-session-responsive-css');
if (!_paceSessionResponsive) {
  const s = document.createElement('style');
  s.id = 'pace-session-responsive-css';
  s.textContent = `
    @media (max-width: 640px) {
      [data-pace-session-root] {
        padding: 16px 20px 24px !important;
      }
      [data-pace-session-title] {
        font-size: 18px !important;
      }
      [data-pace-session-prep-num] {
        font-size: 128px !important;
      }
      [data-pace-session-prep-copy] {
        font-size: 15px !important;
        margin-top: 14px !important;
      }
      [data-pace-session-done-hero] {
        width: 80px !important;
        height: 80px !important;
        margin-bottom: 18px !important;
      }
      [data-pace-session-done-hero] svg {
        width: 34px !important;
        height: 34px !important;
      }
      [data-pace-session-done-title] {
        font-size: 34px !important;
        margin-bottom: 18px !important;
      }
      [data-pace-session-stats] {
        gap: 20px !important;
        margin-bottom: 24px !important;
        flex-wrap: wrap !important;
      }
      [data-pace-session-stat-num] {
        font-size: 28px !important;
      }
      [data-pace-session-done-copy] {
        font-size: 14px !important;
        margin-bottom: 24px !important;
      }
      [data-pace-session-hint] {
        bottom: 6px !important;
        font-size: 9px !important;
      }
    }
  `;
  document.head.appendChild(s);
}

Object.assign(window, {
  SessionShell, SessionHeader, SessionPrep, SessionDone, SessionStat,
  sessionShellStyles,
});
