/* PACE · Modal de seguridad para técnicas de respiración */
const { useState: useStateBS } = React;

function BreatheSafety({ routine, onAccept, onCancel }) {
  const [checked, setChecked] = useStateBS(false);
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
          <h3 style={{ ...displayItalic, fontSize: 22, margin: 0, fontWeight: 500 }}>{routine.name}</h3>
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

Object.assign(window, { BreatheSafety });
