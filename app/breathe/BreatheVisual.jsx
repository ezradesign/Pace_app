/* PACE · Respiración — Visual animado + getSequence
   Extraído de BreatheModule.jsx en sesión 34 (v0.16.0).
*/

function getSequence(routine) {
  if (routine.pattern === 'rounds') {
    return [
      { label: 'Inhala', duration: 2, scale: 1.3 },
      { label: 'Exhala', duration: 2, scale: 0.9 },
    ];
  }
  if (routine.pattern === 'box') {
    const [i, h1, e, h2] = routine.cycle;
    return [
      { label: 'Inhala', duration: i, scale: 1.3 },
      { label: 'Sostén', duration: h1, scale: 1.3 },
      { label: 'Exhala', duration: e, scale: 0.9 },
      { label: 'Sostén', duration: h2, scale: 0.9 },
    ];
  }
  if (routine.pattern === 'coherent') {
    const [i, , e] = routine.cycle;
    return [
      { label: 'Inhala', duration: i, scale: 1.3 },
      { label: 'Exhala', duration: e, scale: 0.9 },
    ];
  }
  if (routine.pattern === 'pattern') {
    const [i, h, e] = routine.cycle;
    return [
      { label: 'Inhala', duration: i, scale: 1.3 },
      { label: 'Sostén', duration: h, scale: 1.3 },
      { label: 'Exhala', duration: e, scale: 0.9 },
    ];
  }
  if (routine.pattern === 'physiological') {
    return [
      { label: 'Inhala', duration: 2, scale: 1.25 },
      { label: 'Inhala más', duration: 1, scale: 1.35 },
      { label: 'Exhala', duration: 5, scale: 0.9 },
    ];
  }
  if (routine.pattern === 'ujjayi') {
    return [
      { label: 'Inhala oceánica', duration: 5, scale: 1.3 },
      { label: 'Exhala oceánica', duration: 5, scale: 0.9 },
    ];
  }
  if (routine.pattern === 'bhastrika' || routine.pattern === 'kapalabhati') {
    return [
      { label: 'Inhala', duration: 1, scale: 1.2 },
      { label: 'Exhala', duration: 1, scale: 0.95 },
    ];
  }
  if (routine.pattern === 'nadi') {
    return [
      { label: 'Inhala izq.', duration: 4, scale: 1.3 },
      { label: 'Sostén', duration: 2, scale: 1.3 },
      { label: 'Exhala dcha.', duration: 4, scale: 0.9 },
      { label: 'Inhala dcha.', duration: 4, scale: 1.3 },
      { label: 'Sostén', duration: 2, scale: 1.3 },
      { label: 'Exhala izq.', duration: 4, scale: 0.9 },
    ];
  }
  return [{ label: 'Respira', duration: 4, scale: 1.2 }];
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

function BreathVisual({ style, phase, progress, scale = 1.2 }) {
  const transitionDur = '1800ms';

  if (style === 'flor') {
    return (
      <div style={breathVisualStyles.wrap}>
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
      <div style={{ position: 'absolute', inset: -30, border: '1px solid var(--line)', borderRadius: '50%', opacity: 0.4 }} />
      <div style={{ position: 'absolute', inset: -60, border: '1px solid var(--line)', borderRadius: '50%', opacity: 0.2 }} />
      <div style={{
        ...breathVisualStyles.core,
        background: 'var(--breathe-soft)',
        border: '1.5px solid var(--breathe)',
        transform: `scale(${scale})`,
        transition: `transform ${transitionDur} var(--ease)`,
      }} />
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

Object.assign(window, { BreathVisual, getSequence });
