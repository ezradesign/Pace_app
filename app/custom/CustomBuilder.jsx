/* PACE · Constructor de rutinas premium (F7 · s93 · v0.38.0)

   Modal overlay singleton (montado en main.jsx, abierto vía CustomEvent
   `pace:open-custom-builder` con detail.id = rutina a editar o null).
   Mientras está abierto, main.jsx oculta MoveLibrary para que solo un
   Modal escuche Escape; al cerrar, la biblioteca reaparece.

   Dos vistas internas:
     - editor: nombre + lista de pasos (glifo, dur stepper, reordenar,
       quitar) + total en vivo + Guardar/Cancelar (+ Eliminar en edición,
       confirmación en dos toques).
     - picker: registro de ejercicios agrupado (EXERCISE_REGISTRY); un
       toque añade el paso con su dur por defecto.

   Solo se llega aquí con premiumUnlocked=true (la sección de la
   biblioteca no ofrece nada clicable en estado bloqueado). Los steppers
   usan la forma funcional de setState local (decisión s89). */

const { useState: useStateCB } = React;

function CustomBuilder({ editId, onClose }) {
  const { t, tn, lang } = useT();
  const tR = (key, fb) => { if (lang !== 'en') return fb; const v = t(key); return v === key ? fb : v; };
  const tEx = (name) => tR(`custom.ex.${name}.name`, name);

  const existing = editId ? getCustomRoutine(editId) : null;
  const [name, setName] = useStateCB(existing ? existing.name : '');
  const [steps, setSteps] = useStateCB(existing ? existing.steps.map(s => ({ ...s })) : []);
  const [view, setView] = useStateCB('editor'); // 'editor' | 'picker'
  const [confirmDelete, setConfirmDelete] = useStateCB(false);
  const limits = window.CUSTOM_LIMITS;

  const totalSec = steps.reduce((acc, s) => acc + s.dur, 0);
  const totalMin = Math.max(1, Math.ceil(totalSec / 60));
  const canSave = steps.length >= limits.minSteps && name.trim().length > 0;

  const addStep = (ex) => {
    setSteps(prev => prev.length >= limits.maxSteps
      ? prev
      : [...prev, { name: ex.name, dur: ex.dur, cue: ex.cue }]);
  };
  const removeStep = (idx) => setSteps(prev => prev.filter((_, i) => i !== idx));
  const moveStep = (idx, delta) => setSteps(prev => {
    const j = idx + delta;
    if (j < 0 || j >= prev.length) return prev;
    const next = [...prev];
    const [item] = next.splice(idx, 1);
    next.splice(j, 0, item);
    return next;
  });
  const nudgeDur = (idx, delta) => setSteps(prev => prev.map((s, i) => i === idx
    ? { ...s, dur: Math.min(limits.maxDur, Math.max(limits.minDur, s.dur + delta)) }
    : s));

  const save = () => {
    const draft = { name, steps };
    const ok = editId ? updateCustomRoutine(editId, draft) : addCustomRoutine(draft);
    if (ok) onClose();
  };
  const del = () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    deleteCustomRoutine(editId);
    onClose();
  };

  // ── Vista PICKER ──────────────────────────────────────────────────
  if (view === 'picker') {
    return (
      <Modal open={true} onClose={onClose} tagLabel={t('custom.builder.tag')} title={t('custom.picker.title')} maxWidth={720}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <button onClick={() => setView('editor')} style={customBuilderStyles.ghostBtn}>
            {t('custom.picker.back')}
          </button>
          <Meta>{steps.length === 1 ? t('custom.steps.one') : tn('custom.steps.many', { n: steps.length })}</Meta>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {Object.entries(EXERCISE_REGISTRY).map(([key, group]) => (
            <div key={key}>
              <h4 style={{ ...displayItalic, fontSize: 16, margin: '0 0 8px', fontWeight: 500 }}>
                {tR(`custom.cat.${key}.label`, group.label)}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 6 }}>
                {group.items.map(ex => (
                  <button
                    key={ex.name}
                    onClick={() => { addStep(ex); if (steps.length + 1 >= limits.maxSteps) setView('editor'); }}
                    disabled={steps.length >= limits.maxSteps}
                    style={customBuilderStyles.pickRow}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--move)'; e.currentTarget.style.background = 'var(--paper-2)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={customBuilderStyles.pickGlyph}>
                      <ExerciseGlyph id={ex.name} size={22} />
                    </span>
                    <span style={{ flex: 1, textAlign: 'left', fontSize: 13, lineHeight: 1.25 }}>{tEx(ex.name)}</span>
                    <span style={{ fontSize: 11, color: 'var(--ink-3)', fontVariantNumeric: 'tabular-nums' }}>{ex.dur} s</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    );
  }

  // ── Vista EDITOR ──────────────────────────────────────────────────
  return (
    <Modal
      open={true}
      onClose={onClose}
      tagLabel={t('custom.builder.tag')}
      title={editId ? t('custom.builder.title.edit') : t('custom.builder.title.new')}
      subtitle={t('custom.builder.subtitle')}
      maxWidth={720}
    >
      <div style={{ marginBottom: 18 }}>
        <Meta style={{ marginBottom: 6 }}>{t('custom.builder.name.label')}</Meta>
        <input
          type="text"
          value={name}
          maxLength={limits.maxNameLen}
          placeholder={t('custom.builder.name.placeholder')}
          onChange={(e) => setName(e.target.value)}
          style={customBuilderStyles.nameInput}
        />
      </div>

      <Meta style={{ marginBottom: 8 }}>{t('custom.builder.steps.label')}</Meta>
      {steps.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '0 0 14px', lineHeight: 1.5 }}>
          {t('custom.builder.empty')}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
          {steps.map((s, idx) => (
            <div key={`${s.name}-${idx}`} style={customBuilderStyles.stepRow}>
              <span style={customBuilderStyles.stepGlyph}>
                <ExerciseGlyph id={s.name} size={24} />
              </span>
              <span style={{ flex: 1, fontSize: 14, lineHeight: 1.3, minWidth: 0 }}>{tEx(s.name)}</span>
              <span style={customBuilderStyles.durGroup}>
                <button onClick={() => nudgeDur(idx, -limits.durStep)} disabled={s.dur <= limits.minDur} aria-label="−5 s" style={customBuilderStyles.iconBtn}>−</button>
                <span style={customBuilderStyles.durValue}>{s.dur} s</span>
                <button onClick={() => nudgeDur(idx, limits.durStep)} disabled={s.dur >= limits.maxDur} aria-label="+5 s" style={customBuilderStyles.iconBtn}>+</button>
              </span>
              <span style={{ display: 'inline-flex', gap: 2 }}>
                <button onClick={() => moveStep(idx, -1)} disabled={idx === 0} title={t('custom.step.up')} aria-label={t('custom.step.up')} style={customBuilderStyles.iconBtn}>↑</button>
                <button onClick={() => moveStep(idx, 1)} disabled={idx === steps.length - 1} title={t('custom.step.down')} aria-label={t('custom.step.down')} style={customBuilderStyles.iconBtn}>↓</button>
                <button onClick={() => removeStep(idx)} title={t('custom.step.remove')} aria-label={t('custom.step.remove')} style={customBuilderStyles.iconBtn}>×</button>
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <button
          onClick={() => setView('picker')}
          disabled={steps.length >= limits.maxSteps}
          style={{ ...customBuilderStyles.ghostBtn, opacity: steps.length >= limits.maxSteps ? 0.4 : 1 }}
        >
          + {t('custom.builder.add')}
        </button>
        {steps.length > 0 && (
          <Meta>{`${steps.length === 1 ? t('custom.steps.one') : tn('custom.steps.many', { n: steps.length })} · ${tn('custom.builder.approx', { min: totalMin })}`}</Meta>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--line)', paddingTop: 16 }}>
        <div>
          {editId && (
            <button
              onClick={del}
              style={{
                ...customBuilderStyles.ghostBtn,
                color: confirmDelete ? 'var(--paper)' : 'var(--breathe)',
                borderColor: 'var(--breathe)',
                background: confirmDelete ? 'var(--breathe)' : 'transparent',
              }}
            >
              {confirmDelete ? t('custom.builder.delete.confirm') : t('custom.builder.delete')}
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" onClick={onClose}>{t('custom.builder.cancel')}</Button>
          <Button
            onClick={save}
            disabled={!canSave}
            style={{ background: 'var(--move)', borderColor: 'var(--move)' }}
          >{t('custom.builder.save')}</Button>
        </div>
      </div>
    </Modal>
  );
}

const customBuilderStyles = {
  nameInput: {
    width: '100%', boxSizing: 'border-box',
    padding: '10px 12px', fontSize: 15,
    color: 'var(--ink)', background: 'var(--paper-2)',
    border: '1px solid var(--line)', borderRadius: 'var(--r-sm)',
    letterSpacing: 0.2,
  },
  stepRow: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 10px',
    border: '1px solid var(--line)', borderRadius: 'var(--r-sm)',
    background: 'var(--paper)',
  },
  stepGlyph: {
    width: 36, height: 36, flexShrink: 0,
    borderRadius: '50%',
    background: 'var(--move-soft)', color: 'var(--move)',
    display: 'grid', placeItems: 'center',
  },
  durGroup: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    flexShrink: 0,
  },
  durValue: {
    fontSize: 12, color: 'var(--ink-2)',
    minWidth: 38, textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  iconBtn: {
    width: 24, height: 24,
    display: 'grid', placeItems: 'center',
    fontSize: 13, lineHeight: 1,
    color: 'var(--ink-2)', background: 'transparent',
    border: '1px solid var(--line)', borderRadius: 'var(--r-sm)',
    cursor: 'pointer',
  },
  ghostBtn: {
    padding: '7px 14px', fontSize: 13,
    color: 'var(--ink-2)', background: 'transparent',
    border: '1px solid var(--line-2)', borderRadius: 'var(--r-md)',
    cursor: 'pointer',
    transition: 'all 160ms',
  },
  pickRow: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '6px 10px',
    border: '1px solid var(--line)', borderRadius: 'var(--r-sm)',
    background: 'transparent', color: 'var(--ink)',
    cursor: 'pointer', textAlign: 'left',
    transition: 'all 160ms',
  },
  pickGlyph: {
    width: 30, height: 30, flexShrink: 0,
    borderRadius: '50%',
    background: 'var(--move-soft)', color: 'var(--move)',
    display: 'grid', placeItems: 'center',
  },
};

Object.assign(window, { CustomBuilder });
