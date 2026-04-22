/* PACE · Módulo Respira
   Librería + Sesión guiada con círculo animado + Modal de seguridad
*/

const { useState: useStateBR, useEffect: useEffectBR, useRef: useRefBR } = React;

/* Catálogo */
const BREATHE_ROUTINES = {
  energia: {
    label: 'Energía',
    items: [
      { id: 'breathe.rounds.full', tag: 'ENE', code: 'Energía', name: 'Respiración en rondas', desc: '30 respiraciones profundas → retención en vacío. 3 rondas.', min: 12, pattern: 'rounds', rounds: 3, breaths: 30, safety: true },
      { id: 'breathe.rounds.express', tag: 'ENE', code: 'Energía', name: 'Rondas express', desc: 'Versión corta: 2 rondas de 25 respiraciones. Para sesiones breves.', min: 4, pattern: 'rounds', rounds: 2, breaths: 25, safety: true },
      { id: 'breathe.bellows', tag: 'PRA', code: 'Pranayama', name: 'Bhastrika · Fuelle', desc: 'Pranayama energizante rápido', min: 3, pattern: 'bhastrika' },
    ]
  },
  equilibrio: {
    label: 'Equilibrio',
    aside: 'Regula el sistema nervioso',
    items: [
      { id: 'breathe.box.4', tag: 'EQU', code: 'Equilibrio', name: 'Box 4·4·4·4', desc: 'Cuadrado perfecto. Calma mental y foco sostenido.', min: 5, pattern: 'box', cycle: [4,4,4,4] },
      { id: 'breathe.box.6', tag: 'EQU', code: 'Equilibrio', name: 'Box 6·6·6·6', desc: 'Versión profunda', min: 7, pattern: 'box', cycle: [6,6,6,6] },
    ]
  },
  balance: {
    label: 'Balance',
    aside: 'Armoniza HRV',
    items: [
      { id: 'breathe.coherent.55', tag: 'BAL', code: 'Balance', name: 'Coherente 5·5', desc: 'Respiración cardíaca. Sincroniza corazón y mente.', min: 5, pattern: 'coherent', cycle: [5,0,5,0] },
      { id: 'breathe.coherent.66', tag: 'BAL', code: 'Balance', name: 'Coherente 6·6', desc: 'Versión más profunda. 5 ciclos por minuto.', min: 10, pattern: 'coherent', cycle: [6,0,6,0] },
    ]
  },
  relajacion: {
    label: 'Relajación',
    aside: 'Baja el ruido mental',
    items: [
      { id: 'breathe.478', tag: 'REL', code: 'Relajación', name: '4·7·8', desc: 'Exhalación larga. Baja ansiedad, prepara sueño.', min: 3, pattern: 'pattern', cycle: [4,7,8,0] },
      { id: 'breathe.physiological', tag: 'REL', code: 'Relajación', name: 'Suspiro fisiológico', desc: 'Doble inhalación + exhalación larga. Reset rápido.', min: 2, pattern: 'physiological' },
    ]
  },
  pranayama: {
    label: 'Pranayama',
    aside: 'Raíces yóguicas',
    items: [
      { id: 'breathe.nadi.shodhana', tag: 'PRA', code: 'Pranayama', name: 'Nadi Shodhana', desc: 'Respiración alternada. Equilibra hemisferios.', min: 8, pattern: 'nadi' },
      { id: 'breathe.ujjayi', tag: 'PRA', code: 'Pranayama', name: 'Ujjayi', desc: 'Respiración oceánica. Meditativa.', min: 6, pattern: 'ujjayi', cycle: [5,0,5,0] },
      { id: 'breathe.kapalabhati', tag: 'KRI', code: 'Kriya', name: 'Kapalabhati · Kriya', desc: 'Limpieza del cráneo. Enérgico.', min: 3, pattern: 'kapalabhati', safety: true },
    ]
  }
};

/* =========================
   LIBRARY MODAL
   ========================= */
function BreatheLibrary({ open, onClose, onStart }) {
  return (
    <Modal open={open} onClose={onClose} tagLabel="Biblioteca" title="Respiración" subtitle="Breathwork guiado: pranayamas, coherencia, rondas."
      maxWidth={860}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 8 }}>
        {Object.entries(BREATHE_ROUTINES).map(([key, group]) => (
          <div key={key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, margin: 0, fontWeight: 500 }}>{group.label}</h3>
              {group.aside && <Meta>{group.aside}</Meta>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
              {group.items.map(r => (
                <RoutineCard key={r.id} routine={r} color="var(--breathe)" onClick={() => onStart(r)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function RoutineCard({ routine, color, onClick }) {
  return (
    <Card accent={color} onClick={onClick} padded={false} style={{ padding: '16px 18px', position: 'relative' }}>
      {routine.safety && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          width: 18, height: 18, borderRadius: '50%',
          background: 'var(--breathe-soft)', color: 'var(--breathe)',
          display: 'grid', placeItems: 'center',
          fontSize: 11, fontWeight: 600,
        }} title="Requiere lectura de seguridad">⚠</div>
      )}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
        <Tag color={color}>{routine.tag}</Tag>
      </div>
      <h4 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 19, margin: '0 0 6px', fontWeight: 500, lineHeight: 1.15 }}>{routine.name}</h4>
      <p style={{ fontSize: 12.5, color: 'var(--ink-2)', margin: '0 0 12px', lineHeight: 1.5 }}>{routine.desc}</p>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: '1px dashed var(--line)', paddingTop: 8,
      }}>
        <span style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
          {routine.code}
        </span>
        <span style={{
          fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16,
          color: color, fontWeight: 500,
        }}>{routine.min} min</span>
      </div>
    </Card>
  );
}

/* =========================
   SAFETY MODAL
   ========================= */
function BreatheSafety({ routine, onAccept, onCancel }) {
  const [checked, setChecked] = useStateBR(false);
  if (!routine) return null;
  return (
    <Modal open={true} onClose={onCancel} maxWidth={520}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 18 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 'var(--r-md)',
          background: 'var(--breathe-soft)',
          display: 'grid', placeItems: 'center',
          color: 'var(--breathe)', fontSize: 20, flexShrink: 0,
        }}>⚠</div>
        <div>
          <div className="pace-meta" style={{ marginBottom: 4 }}>Antes de empezar</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, margin: 0, fontWeight: 500 }}>{routine.name}</h3>
        </div>
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)', margin: '0 0 14px' }}>
        Esta técnica implica <strong style={{ color: 'var(--ink)' }}>hiperventilación controlada y apnea</strong>. Puede causar mareo, cosquilleo o desmayo.
      </p>
      <ul style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--ink-2)', paddingLeft: 18, margin: '0 0 20px' }}>
        <li>Practícala <strong style={{color:'var(--ink)'}}>sentado o tumbado</strong>, nunca de pie</li>
        <li>Nunca en el agua, conduciendo ni en altura</li>
        <li>No la hagas si tienes epilepsia, hipertensión o cardiopatía, ni embarazada</li>
        <li>Detente si te mareas o sientes molestias</li>
      </ul>
      <label style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: 12,
        background: 'var(--paper-2)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-sm)',
        fontSize: 13,
        cursor: 'pointer',
        marginBottom: 20,
      }}>
        <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
        <span>Lo he leído y asumo mi responsabilidad</span>
      </label>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button variant="terracota" disabled={!checked} onClick={() => onAccept(routine)}>Empezar sesión</Button>
      </div>
    </Modal>
  );
}

/* =========================
   BREATHING SESSION
   NOTA: incluye fase de preparación (3s), retención explícita en rondas,
   countdown visible en fases largas, pantalla de completado, atajos de teclado.
   ========================= */
function BreatheSession({ routine, onExit }) {
  const [state] = usePace();
  const [stage, setStage] = useStateBR('prep'); // 'prep' | 'active' | 'hold' | 'done'
  const [prepCount, setPrepCount] = useStateBR(3);
  const [phase, setPhase] = useStateBR(0);
  const [phaseTime, setPhaseTime] = useStateBR(0);
  const [round, setRound] = useStateBR(1);
  const [breathCount, setBreathCount] = useStateBR(1);
  const [holdSeconds, setHoldSeconds] = useStateBR(0);
  const [paused, setPaused] = useStateBR(false);
  const startTime = useRefBR(Date.now());
  const sessionStart = useRefBR(Date.now());

  const sequence = getSequence(routine);
  const isRounds = routine.pattern === 'rounds';

  // Preparación: cuenta atrás 3 segundos
  useEffectBR(() => {
    if (stage !== 'prep' || paused) return;
    if (prepCount <= 0) {
      setStage('active');
      startTime.current = Date.now();
      return;
    }
    const t = setTimeout(() => setPrepCount(c => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(t);
  }, [stage, prepCount, paused]);

  // Ticker principal (active)
  useEffectBR(() => {
    if (paused || stage !== 'active') return;
    const intv = setInterval(() => {
      setPhaseTime(t => {
        const cur = sequence[phase];
        if (t + 1 >= cur.duration) {
          const nextPhase = phase + 1;
          if (nextPhase >= sequence.length) {
            handleCycleComplete();
            return 0;
          }
          setPhase(nextPhase);
          return 0;
        }
        return t + 1;
      });
    }, 1000);
    return () => clearInterval(intv);
  }, [phase, paused, routine, stage]);

  // Ticker de retención (hold en rondas)
  useEffectBR(() => {
    if (stage !== 'hold' || paused) return;
    const intv = setInterval(() => {
      setHoldSeconds(s => {
        const next = s + 1;
        // Desbloqueo de logros por apnea
        if (next === 60) unlockAchievement('secret.breath.hold.60');
        if (next === 90) unlockAchievement('secret.breath.hold.90');
        if (next === 120) unlockAchievement('secret.breath.hold.120');
        return next;
      });
    }, 1000);
    return () => clearInterval(intv);
  }, [stage, paused]);

  // Atajos de teclado
  useEffectBR(() => {
    const onKey = (e) => {
      if (e.key === ' ') { e.preventDefault(); setPaused(p => !p); }
      if (e.key === 'Escape') onExit('exit');
      if (e.key === 'Enter' && stage === 'hold') releaseHold();
      if (e.key === 'Enter' && stage === 'done') onExit('done');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stage]);

  const handleCycleComplete = () => {
    if (isRounds) {
      if (breathCount < routine.breaths) {
        setBreathCount(b => b + 1);
        setPhase(0);
      } else {
        // Se completaron las N respiraciones → retención
        setStage('hold');
        setHoldSeconds(0);
      }
    } else {
      const elapsed = (Date.now() - startTime.current) / 1000;
      if (elapsed >= routine.min * 60) {
        finish();
      } else {
        setPhase(0);
      }
    }
  };

  const releaseHold = () => {
    // Tras liberar el aire, siguiente ronda o fin
    if (round < routine.rounds) {
      setRound(r => r + 1);
      setBreathCount(1);
      setPhase(0);
      setStage('active');
    } else {
      finish();
    }
  };

  const finish = () => {
    completeBreathSession(routine.id, routine.min);
    setStage('done');
  };

  // ====== RENDER STAGES ======

  // PREPARACIÓN
  if (stage === 'prep') {
    return (
      <div style={sessionStyles.root}>
        <SessionHeader routine={routine} onExit={onExit} extra={null} />
        <div style={sessionStyles.center}>
          <div style={{ textAlign: 'center', maxWidth: 460 }}>
            <div style={{ fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 18 }}>Prepárate</div>
            <div style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: 200, fontWeight: 400, lineHeight: 0.9,
              color: 'var(--breathe)',
              fontVariantNumeric: 'tabular-nums',
            }}>{prepCount > 0 ? prepCount : '·'}</div>
            <div style={{ fontStyle: 'italic', fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink-2)', marginTop: 20 }}>
              Siéntate cómodo. Respira natural.
            </div>
          </div>
        </div>
        <div style={sessionStyles.footer}>
          <button onClick={() => { setPrepCount(0); setStage('active'); startTime.current = Date.now(); }} style={sessionStyles.ctrlBtn}>
            Empezar ahora
          </button>
        </div>
      </div>
    );
  }

  // COMPLETADO
  if (stage === 'done') {
    const totalSec = Math.round((Date.now() - sessionStart.current) / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return (
      <div style={sessionStyles.root}>
        <SessionHeader routine={routine} onExit={onExit} extra={null} />
        <div style={sessionStyles.center}>
          <div style={{ textAlign: 'center', maxWidth: 520 }}>
            <div style={{
              width: 120, height: 120, margin: '0 auto 24px',
              borderRadius: '50%',
              background: 'var(--breathe-soft)',
              border: '1.5px solid var(--breathe)',
              display: 'grid', placeItems: 'center',
              animation: 'pace-fade-in 600ms ease',
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--breathe)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <div style={{ fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 12 }}>
              Sesión completada
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: 56, fontWeight: 500, margin: '0 0 24px', lineHeight: 1.05,
            }}>{routine.name}</h1>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 36 }}>
              <Stat label="Tiempo" value={`${mins}:${String(secs).padStart(2,'0')}`} />
              {isRounds && <Stat label="Rondas" value={String(routine.rounds)} />}
              {isRounds && <Stat label="Respiraciones" value={String(routine.breaths * routine.rounds)} />}
            </div>
            <p style={{ fontStyle: 'italic', fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink-2)', maxWidth: 380, margin: '0 auto 36px', lineHeight: 1.5 }}>
              Bien hecho. Observa cómo te sientes antes de volver.
            </p>
          </div>
        </div>
        <div style={sessionStyles.footer}>
          <Button variant="terracota" onClick={() => onExit('done')}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  // HOLD (retención en rondas)
  if (stage === 'hold') {
    const holdMins = Math.floor(holdSeconds / 60);
    const holdSecs = holdSeconds % 60;
    return (
      <div style={sessionStyles.root}>
        <SessionHeader routine={routine} onExit={onExit}
          extra={<div style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--breathe)' }}>Ronda {round} / {routine.rounds}</div>} />
        <div style={sessionStyles.center}>
          <div style={{ textAlign: 'center', maxWidth: 520 }}>
            <div style={{ fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--breathe)', marginBottom: 16, fontWeight: 500 }}>
              Retén sin aire
            </div>
            <div style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: 160, fontWeight: 400, lineHeight: 0.9,
              color: 'var(--ink)',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.03em',
            }}>
              {holdMins > 0 ? `${holdMins}:${String(holdSecs).padStart(2,'0')}` : holdSecs}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 8, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {holdMins > 0 ? 'minutos' : 'segundos'}
            </div>
            <p style={{ fontStyle: 'italic', fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink-2)', maxWidth: 360, margin: '30px auto 0', lineHeight: 1.5 }}>
              Pulsa cuando sientas la necesidad de respirar.
            </p>
          </div>
        </div>
        <div style={sessionStyles.footer}>
          <Button variant="terracota" onClick={releaseHold}>Respirar de nuevo</Button>
        </div>
      </div>
    );
  }

  // ACTIVE (ciclo de respiración normal)
  const current = sequence[phase] || sequence[0];
  const progress = current.duration > 0 ? phaseTime / current.duration : 0;
  const remaining = Math.max(0, current.duration - phaseTime);
  const showCountdown = current.duration >= 4;
  const totalDots = isRounds ? routine.breaths : 20;
  const activeDot = isRounds ? breathCount : Math.floor(phaseTime % totalDots);

  return (
    <div style={sessionStyles.root}>
      <SessionHeader routine={routine} onExit={onExit}
        extra={isRounds ? (
          <div style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
            Ronda {round} / {routine.rounds}
          </div>
        ) : null} />

      <div style={sessionStyles.center}>
        <BreathVisual
          style={state.breathStyle}
          phase={current.label}
          progress={progress}
          scale={current.scale}
        />
        <div style={sessionStyles.text}>
          <div style={{
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
            fontSize: 44, fontWeight: 500, color: 'var(--ink)',
            marginBottom: 8, lineHeight: 1,
          }}>{current.label}</div>
          {showCountdown && (
            <div style={{
              fontSize: 28, fontFamily: 'var(--font-display)', fontStyle: 'italic',
              color: 'var(--breathe)', fontVariantNumeric: 'tabular-nums', marginTop: 4,
            }}>{remaining}</div>
          )}
          <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 10 }}>
            {isRounds ? `Respiración ${breathCount} de ${routine.breaths}` : `${phaseTime}s / ${current.duration}s`}
          </div>
        </div>
      </div>

      <div style={sessionStyles.dots}>
        {Array.from({ length: Math.min(totalDots, 30) }).map((_, i) => (
          <span key={i} style={{
            width: 4, height: 4, borderRadius: '50%',
            background: i < activeDot ? 'var(--breathe)' : 'var(--line)',
            transition: 'background 200ms',
          }} />
        ))}
      </div>

      <div style={sessionStyles.footer}>
        <button onClick={() => setPaused(p => !p)} style={sessionStyles.ctrlBtn} title="Espacio">
          {paused ? '▶ Reanudar' : '❚❚ Pausar'}
        </button>
        <button onClick={finish} style={{ ...sessionStyles.ctrlBtn, borderColor: 'transparent' }} title="Esc">
          ▶| Terminar
        </button>
      </div>
      <div style={{ position: 'absolute', bottom: 14, left: 0, right: 0, textAlign: 'center', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', opacity: 0.6 }}>
        Espacio pausar · Esc salir
      </div>
    </div>
  );
}

/* Header reutilizable de sesión */
function SessionHeader({ routine, onExit, extra }) {
  return (
    <div style={sessionStyles.header}>
      <div>
        <Meta style={{ fontSize: 10 }}>{routine.code}</Meta>
        <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, margin: '2px 0 0', fontWeight: 500 }}>{routine.name}</h2>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {extra}
        <button onClick={() => onExit('exit')} style={sessionStyles.exitBtn}>× Salir</button>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontFamily: 'var(--font-display)', fontStyle: 'italic',
        fontSize: 40, fontWeight: 500, lineHeight: 1,
        color: 'var(--ink)',
      }}>{value}</div>
      <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 8 }}>
        {label}
      </div>
    </div>
  );
}

function getSequence(routine) {
  // Devuelve [{label, duration, scale}, …]
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
    // 4-7-8
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

/* =========================
   BREATH VISUAL
   ========================= */
function BreathVisual({ style, phase, progress, scale = 1.2 }) {
  const transitionDur = '1800ms';
  /* Estilo "Flor" — híbrido entre pulso y pétalo.
     Anillos concéntricos que pulsan + pétalos suaves rotando lentamente + núcleo luminoso. */
  if (style === 'flor') {
    return (
      <div style={visualStyles.wrap}>
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
      <div style={visualStyles.wrap}>
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
        <div style={{ ...visualStyles.core, background: 'var(--breathe-soft)' }} />
      </div>
    );
  }
  if (style === 'petalo') {
    return (
      <div style={visualStyles.wrap}>
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
      <div style={visualStyles.wrap}>
        <div style={{
          ...visualStyles.core,
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
    <div style={visualStyles.wrap}>
      {/* Anillos externos */}
      <div style={{ position: 'absolute', inset: -30, border: '1px solid var(--line)', borderRadius: '50%', opacity: 0.4 }} />
      <div style={{ position: 'absolute', inset: -60, border: '1px solid var(--line)', borderRadius: '50%', opacity: 0.2 }} />
      <div style={{
        ...visualStyles.core,
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

const visualStyles = {
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

const sessionStyles = {
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
    gap: 32,
  },
  text: {
    textAlign: 'center',
  },
  dots: {
    display: 'flex', gap: 5,
    justifyContent: 'center',
    marginBottom: 28,
    flexWrap: 'wrap',
    maxWidth: 400,
    margin: '0 auto 28px',
  },
  footer: {
    display: 'flex', gap: 16, justifyContent: 'center',
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

Object.assign(window, { BreatheLibrary, BreatheSafety, BreatheSession, BREATHE_ROUTINES, SessionHeader, Stat });
