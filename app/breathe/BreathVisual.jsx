/* PACE · Visualización animada de respiración */
const { displayItalic } = window.Primitives || {};

function BreathVisual({ style, phase, progress, scale = 1.2 }) {
  const transitionDur = '1800ms';
  /* Estilo "Flor" — híbrido entre pulso y pétalo.
     Anillos concéntricos que pulsan + pétalos suaves rotando lentamente + núcleo luminoso. */
  if (style === 'flor') {
    return (
      <div style={breathVisualStyles.wrap}>
        {/* Anillos externos pulsando */}
        <div style={{
          position: 'absolute', inset: -40,
          border: '1px solid var(--breathe)',
          borderRadius: '50%',
          opacity: 0.25,
          transform: `scale(${scale * 0.95})`,
          transition: `transform ${transitionDur} var(--ease)`,
        }} />
        <div style={{
          position: 'absolute', inset: -20,
          border: '1px solid var(--breathe)',
          borderRadius: '50%',
          opacity: 0.4,
          transform: `scale(${scale})`,
          transition: `transform ${transitionDur} var(--ease)`,
        }} />
        {/* Pétalos suaves girando muy lento */}
        <svg viewBox="-100 -100 200 200" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          transform: `scale(${scale * 0.85}) rotate(${progress * 40}deg)`,
          transition: `transform ${transitionDur} var(--ease)`,
        }}>
          {[0,1,2,3,4,5].map(i => (
            <ellipse key={i} cx="0" cy="-32" rx="14" ry="34"
              fill="var(--breathe-soft)" stroke="var(--breathe)" strokeWidth="0.6"
              transform={`rotate(${i * 60})`} opacity="0.5" />
          ))}
        </svg>
        {/* Núcleo luminoso */}
        <div style={{
          width: 80, height: 80,
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--breathe-soft) 0%, transparent 80%)',
          border: '1.5px solid var(--breathe)',
          transform: `scale(${scale * 0.7})`,
          transition: `transform ${transitionDur} var(--ease)`,
          position: 'relative',
        }} />
      </div>
    );
  }
  if (style === 'ondas') {
    return (
      <div style={breathVisualStyles.wrap}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            position: 'absolute', inset: 0,
            border: '1px solid var(--breathe)',
            borderRadius: '50%',
            opacity: 0.15 + i * 0.1,
            transform: `scale(${scale - i * 0.15})`,
            transition: `transform ${transitionDur} var(--ease)`,
          }} />
        ))}
        <div style={{ ...breathVisualStyles.core, background: 'var(--breathe-soft)' }} />
      </div>
    );
  }
  if (style === 'petalo') {
    return (
      <div style={breathVisualStyles.wrap}>
        <svg viewBox="-100 -100 200 200" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transition: `transform ${transitionDur} var(--ease)`, transform: `scale(${scale})` }}>
          {[0,1,2,3,4,5].map(i => (
            <ellipse key={i} cx="0" cy="-40" rx="20" ry="45"
              fill="var(--breathe-soft)" stroke="var(--breathe)" strokeWidth="0.8"
              transform={`rotate(${i * 60})`} opacity="0.55" />
          ))}
          <circle cx="0" cy="0" r="12" fill="var(--breathe)" opacity="0.25" />
        </svg>
      </div>
    );
  }
  if (style === 'organico') {
    return (
      <div style={breathVisualStyles.wrap}>
        <div style={{
          ...breathVisualStyles.core,
          background: 'radial-gradient(circle, var(--breathe-soft) 0%, transparent 70%)',
          transform: `scale(${scale})`,
          transition: `transform ${transitionDur} var(--ease)`,
          borderRadius: `${42 + Math.sin(progress * Math.PI * 4) * 6}% ${58 - Math.sin(progress * Math.PI * 4) * 6}% ${46 + Math.cos(progress * Math.PI * 3) * 8}% ${54 - Math.cos(progress * Math.PI * 3) * 8}%`,
          border: '1px solid var(--breathe)',
        }} />
      </div>
    );
  }
  // Default: pulso
  return (
    <div style={breathVisualStyles.wrap}>
      {/* Anillos externos */}
      <div style={{ position: 'absolute', inset: -30, border: '1px solid var(--line)', borderRadius: '50%', opacity: 0.4 }} />
      <div style={{ position: 'absolute', inset: -60, border: '1px solid var(--line)', borderRadius: '50%', opacity: 0.2 }} />
      <div style={{
        ...breathVisualStyles.core,
        background: 'var(--breathe-soft)',
        border: '1.5px solid var(--breathe)',
        transform: `scale(${scale})`,
        transition: `transform ${transitionDur} var(--ease)`,
      }} />
      {/* Puntito indicador rotando */}
      <div style={{
        position: 'absolute',
        width: 8, height: 8, borderRadius: '50%',
        background: 'var(--breathe-2)',
        top: '50%', left: '50%',
        transform: `translate(-50%, -50%) rotate(${progress * 360}deg) translateY(-110px)`,
        transition: 'transform 1s linear',
      }} />
    </div>
  );
}

const breathVisualStyles = {
  wrap: {
    position: 'relative',
    width: 260, height: 260,
    display: 'grid', placeItems: 'center',
  },
  core: {
    width: 160, height: 160,
    borderRadius: '50%',
    position: 'relative',
  },
};

Object.assign(window, { BreathVisual });
