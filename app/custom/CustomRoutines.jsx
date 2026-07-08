/* PACE · Tus rutinas — sección del constructor en la biblioteca Mueve
   (F7 · s93 · v0.38.0)

   Superficie premium ENTERA: con premiumUnlocked=false muestra sello +
   copy + "Pronto" sin nada clicable (sin muro a mitad de flujo, mismo
   lenguaje que RoutineCard bloqueada — el mecanismo de gating no se
   toca). Si existieran rutinas creadas con el flag apagado, se listan
   bloqueadas sin borrar datos.

   Crear/editar abre CustomBuilder vía CustomEvent
   `pace:open-custom-builder` (patrón overlay s50+); el estado del
   builder vive en main.jsx. Lanzar una rutina reutiliza el onStart de
   MoveLibrary (handleStartMove → MoveSession kind='move' →
   completeMoveSession). */

function CustomRoutinesSection({ onStart }) {
  const { t, tn } = useT();
  const [pace] = usePace();
  const unlocked = !!pace.premiumUnlocked;
  const routines = Array.isArray(pace.customRoutines) ? pace.customRoutines : [];
  const limits = window.CUSTOM_LIMITS || { maxRoutines: 10 };
  const atLimit = routines.length >= limits.maxRoutines;

  const openBuilder = (id) => {
    window.dispatchEvent(new CustomEvent('pace:open-custom-builder', { detail: { id: id || null } }));
  };
  // El runner y las pantallas prep/done leen tag/code; se decoran aquí
  // (localizados al vuelo) en lugar de persistirlos en el state.
  const startRoutine = (r) => {
    onStart({ ...r, tag: t('custom.tag'), code: t('custom.code') });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h3 style={{ ...displayItalic, fontSize: 20, margin: 0, fontWeight: 500 }}>{t('custom.section.title')}</h3>
          <PremiumSeal />
        </div>
        <Meta>{t('custom.section.aside')}</Meta>
      </div>

      {!unlocked ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
          <Card padded={false} style={{ padding: '16px 18px' }}>
            <p style={{ fontSize: 12.5, color: 'var(--ink-2)', margin: '0 0 12px', lineHeight: 1.5 }}>
              {t('custom.locked.copy')}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px dashed var(--line)', paddingTop: 8 }}>
              <span style={{ ...displayItalic, fontSize: 16, color: 'var(--premium)', fontWeight: 500 }}>{t('premium.soon')}</span>
            </div>
          </Card>
          {routines.map(r => (
            <CustomRoutineCard key={r.id} routine={r} locked />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
          {routines.map(r => (
            <CustomRoutineCard
              key={r.id}
              routine={r}
              onClick={() => startRoutine(r)}
              onEdit={() => openBuilder(r.id)}
            />
          ))}
          {!atLimit ? (
            <div
              onClick={() => openBuilder(null)}
              style={customRoutinesStyles.createCard}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--move)'; e.currentTarget.style.color = 'var(--ink)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line-2)'; e.currentTarget.style.color = 'var(--ink-2)'; }}
            >
              <div style={{ textAlign: 'center', padding: '8px 14px' }}>
                <div style={{ fontSize: 24, lineHeight: 1, marginBottom: 6, color: 'var(--move)' }}>+</div>
                <div style={{ ...displayItalic, fontSize: 17, fontWeight: 500 }}>{t('custom.create')}</div>
                {routines.length === 0 && (
                  <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: '8px 0 0', lineHeight: 1.5 }}>
                    {t('custom.empty.copy')}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div style={{ ...customRoutinesStyles.createCard, cursor: 'default' }}>
              <Meta style={{ textAlign: 'center' }}>{tn('custom.limit', { n: limits.maxRoutines })}</Meta>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* Card de rutina propia — gemela visual de RoutineCard (que no se toca:
   es parte del mecanismo de gating) con lápiz de edición añadido. */
function CustomRoutineCard({ routine, locked, onClick, onEdit }) {
  const { t, tn } = useT();
  const stepsLabel = routine.steps.length === 1
    ? t('custom.steps.one')
    : tn('custom.steps.many', { n: routine.steps.length });
  return (
    <Card accent={locked ? undefined : 'var(--move)'} onClick={locked ? undefined : onClick} padded={false} style={{ padding: '16px 18px', position: 'relative' }}>
      {!locked && (
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          title={t('custom.card.edit')}
          aria-label={t('custom.card.edit')}
          style={customRoutinesStyles.editBtn}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--ink)'; e.currentTarget.style.background = 'var(--paper-2)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink-3)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          </svg>
        </button>
      )}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
        <Tag color="var(--move)">{t('custom.tag')}</Tag>
      </div>
      <h4 style={{ ...displayItalic, fontSize: 19, margin: '0 0 6px', fontWeight: 500, lineHeight: 1.15 }}>{routine.name}</h4>
      <p style={{ fontSize: 12.5, color: 'var(--ink-2)', margin: '0 0 12px', lineHeight: 1.5 }}>{stepsLabel}</p>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: '1px dashed var(--line)', paddingTop: 8,
      }}>
        <span style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
          {t('custom.code')}
        </span>
        {locked ? (
          <span style={{ ...displayItalic, fontSize: 16, color: 'var(--premium)', fontWeight: 500 }}>{t('premium.soon')}</span>
        ) : (
          <span style={{ ...displayItalic, fontSize: 16, color: 'var(--move)', fontWeight: 500 }}>{routine.min} min</span>
        )}
      </div>
    </Card>
  );
}

const customRoutinesStyles = {
  createCard: {
    border: '1px dashed var(--line-2)',
    borderRadius: 'var(--r-md)',
    padding: '16px 18px',
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
    color: 'var(--ink-2)',
    minHeight: 130,
    transition: 'all 220ms var(--ease)',
  },
  editBtn: {
    position: 'absolute', top: 10, right: 10,
    width: 26, height: 26,
    display: 'grid', placeItems: 'center',
    borderRadius: 'var(--r-sm)',
    color: 'var(--ink-3)',
    background: 'transparent',
    border: '1px solid transparent',
    transition: 'all 160ms',
  },
};

Object.assign(window, { CustomRoutinesSection, CustomRoutineCard });
