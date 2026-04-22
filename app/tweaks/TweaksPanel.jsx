/* PACE · Panel de Tweaks
   6 ejes de customización: paleta, tipografía, layout, timer, breath, logo
*/

const { useState: useStateTW, useEffect: useEffectTW } = React;

function TweaksPanel({ open, onClose }) {
  const [state, set] = usePace();

  if (!open) return null;

  const ejes = [
    { key: 'palette', label: 'Paleta', options: [
      { v: 'crema', name: 'Crema día' },
      { v: 'oscuro', name: 'Oscuro noche' },
      { v: 'envejecido', name: 'Papel envejecido' },
    ]},
    { key: 'font', label: 'Tipografía display', options: [
      { v: 'cormorant', name: 'Cormorant (default)' },
      { v: 'garamond', name: 'EB Garamond' },
      { v: 'mono', name: 'JetBrains Mono' },
    ]},
    { key: 'layout', label: 'Layout', options: [
      { v: 'sidebar', name: 'Sidebar (default)' },
      { v: 'minimal', name: 'Minimal' },
      { v: 'editorial', name: 'Editorial' },
    ]},
    { key: 'timerStyle', label: 'Estilo del timer', options: [
      { v: 'aro', name: 'Aro (default)' },
      { v: 'circulo', name: 'Círculo' },
      { v: 'barra', name: 'Barra' },
      { v: 'numero', name: 'Número gigante' },
      { v: 'analogico', name: 'Analógico' },
    ]},
    { key: 'breathStyle', label: 'Círculo de respiración', options: [
      { v: 'flor', name: 'Flor (default)' },
      { v: 'pulso', name: 'Pulso' },
      { v: 'petalo', name: 'Pétalo' },
      { v: 'ondas', name: 'Ondas' },
      { v: 'organico', name: 'Orgánico' },
    ]},
    { key: 'logoVariant', label: 'Logo de la vaca', options: [
      { v: 'pace', name: 'Pace. oficial (default)' },
      { v: 'lockup', name: 'Lockup SVG' },
      { v: 'lineal', name: 'Lineal minimalista' },
      { v: 'sello', name: 'Sello tipo café' },
      { v: 'ilustrado', name: 'Ilustrado' },
    ]},
    /* Apoya el proyecto — texto del pill del sidebar.
       3 variantes registradas en SupportModule.jsx (SUPPORT_COPY).
       Añadido sesión 16 / v0.11.11. */
    { key: 'supportCopyVariant', label: 'Copy del botón de apoyo', options: [
      { v: 'cafe', name: 'Invita a un café (default)' },
      { v: 'pasto', name: 'Riega el pasto' },
      { v: 'vaca', name: 'Da de comer a la vaca' },
    ]},
  ];

  return (
    <div style={{
      position: 'fixed',
      right: 24, bottom: 24,
      width: 320,
      maxHeight: 'calc(100vh - 48px)',
      overflowY: 'auto',
      background: 'var(--paper)',
      border: '1px solid var(--line-2)',
      borderRadius: 'var(--r-md)',
      boxShadow: 'var(--sh-modal)',
      padding: 20,
      zIndex: 80,
      animation: 'pace-slide-up 280ms var(--ease)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Meta>Panel</Meta>
          <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, fontWeight: 500 }}>Tweaks</div>
        </div>
        <button onClick={onClose} style={{ fontSize: 18, color: 'var(--ink-3)', width: 26, height: 26, display: 'grid', placeItems: 'center' }}>×</button>
      </div>

      {ejes.map(eje => (
        <div key={eje.key} style={{ marginBottom: 16 }}>
          <Meta style={{ marginBottom: 6 }}>{eje.label}</Meta>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {eje.options.map(opt => {
              const active = state[eje.key] === opt.v;
              return (
                <button key={opt.v} onClick={() => set({ [eje.key]: opt.v })}
                  style={{
                    padding: '6px 10px',
                    fontSize: 11,
                    fontWeight: active ? 500 : 400,
                    background: active ? 'var(--ink)' : 'var(--paper-2)',
                    color: active ? 'var(--paper)' : 'var(--ink-2)',
                    border: `1px solid ${active ? 'var(--ink)' : 'var(--line)'}`,
                    borderRadius: 'var(--r-sm)',
                    transition: 'all 180ms',
                    letterSpacing: 0.2,
                  }}>{opt.name}</button>
              );
            })}
          </div>
        </div>
      ))}

      <Divider style={{ margin: '14px 0' }} />

      {/* Sound */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Meta>Sonidos</Meta>
        <button onClick={() => set({ soundOn: !state.soundOn })}
          style={{
            padding: '4px 10px',
            background: state.soundOn ? 'var(--focus)' : 'var(--paper-2)',
            color: state.soundOn ? 'var(--paper)' : 'var(--ink-2)',
            border: `1px solid ${state.soundOn ? 'var(--focus)' : 'var(--line)'}`,
            borderRadius: 'var(--r-pill)',
            fontSize: 11, letterSpacing: 0.2,
          }}>{state.soundOn ? 'Activo' : 'Silencio'}</button>
      </div>

      {/* Reset */}
      <button
        onClick={() => { if (confirm('¿Resetear todos los datos de PACE?')) { localStorage.removeItem('pace.state.v1'); location.reload(); } }}
        style={{
          width: '100%',
          padding: '8px',
          fontSize: 11,
          color: 'var(--ink-3)',
          border: '1px dashed var(--line)',
          borderRadius: 'var(--r-sm)',
          marginTop: 10,
          letterSpacing: 0.2,
        }}
      >Resetear todo</button>
    </div>
  );
}

Object.assign(window, { TweaksPanel });
