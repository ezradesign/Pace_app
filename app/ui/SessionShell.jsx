/* PACE · SessionShell — cáscara compartida de sesiones activas
   ============================================================
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
    <div style={sessionShellStyles.root}>
      <SessionHeader routine={routine} onExit={onExit} extra={headerExtra} />
      <div style={centerGap
        ? { ...sessionShellStyles.center, ...sessionShellStyles.centerGap }
        : sessionShellStyles.center
      }>
        {children}
      </div>
      {footer && (
        <div style={{ ...sessionShellStyles.footer, gap: footerGap }}>
          {footer}
        </div>
      )}
      {hint && (
        <div style={{
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
  return (
    <div style={sessionShellStyles.header}>
      <div>
        <Meta style={{ fontSize: 10 }}>{routine.code}</Meta>
        <h2 style={{
          ...displayItalic,
          fontSize: 22, margin: '2px 0 0', fontWeight: 500,
        }}>{routine.name}</h2>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {extra}
        <button onClick={() => onExit('exit')} style={sessionShellStyles.exitBtn}>× Salir</button>
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
  return (
    <SessionShell
      routine={routine}
      onExit={onExit}
      footer={<button onClick={onSkip} style={sessionShellStyles.ctrlBtn}>Empezar ahora</button>}
    >
      <div style={{ textAlign: 'center', maxWidth: 460 }}>
        <div style={{
          fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'var(--ink-3)', marginBottom: 18,
        }}>Prepárate</div>
        <div style={{
          ...displayItalic,
          fontSize: 200, fontWeight: 400, lineHeight: 0.9,
          color: accent,
          fontVariantNumeric: 'tabular-nums',
        }}>{prepCount > 0 ? prepCount : '·'}</div>
        <div style={{
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
  const btn = buttonVariant
    ? <Button variant={buttonVariant} onClick={() => onExit('done')}>Volver al inicio</Button>
    : <Button onClick={() => onExit('done')} style={buttonStyle}>Volver al inicio</Button>;

  return (
    <SessionShell routine={routine} onExit={onExit} footer={btn}>
      <div style={{ textAlign: 'center', maxWidth: 520 }}>
        <div style={{
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
        <h1 style={{
          ...displayItalic,
          fontSize: 56, fontWeight: 500, margin: '0 0 24px', lineHeight: 1.05,
        }}>{routine.name}</h1>
        {stats.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 36 }}>
            {stats.map((s, i) => <SessionStat key={i} label={s.label} value={s.value} />)}
          </div>
        )}
        <p style={{
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
    <div style={{ textAlign: 'center' }}>
      <div style={{
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

Object.assign(window, {
  SessionShell, SessionHeader, SessionPrep, SessionDone, SessionStat,
  sessionShellStyles,
});
