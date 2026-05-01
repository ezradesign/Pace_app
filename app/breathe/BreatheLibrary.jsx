/* PACE · Biblioteca de respiración */
const { displayItalic } = window.Primitives || {};

function BreatheLibrary({ open, onClose, onStart }) {
  return (
    <Modal open={open} onClose={onClose} tagLabel="Biblioteca" title="Respiración" subtitle="Breathwork guiado: pranayamas, coherencia, rondas."
      maxWidth={860}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 8 }}>
        {Object.entries(window.BREATHE_ROUTINES).map(([key, group]) => (
          <div key={key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <h3 style={{ ...displayItalic, fontSize: 20, margin: 0, fontWeight: 500 }}>{group.label}</h3>
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
      <h4 style={{ ...displayItalic, fontSize: 19, margin: '0 0 6px', fontWeight: 500, lineHeight: 1.15 }}>{routine.name}</h4>
      <p style={{ fontSize: 12.5, color: 'var(--ink-2)', margin: '0 0 12px', lineHeight: 1.5 }}>{routine.desc}</p>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: '1px dashed var(--line)', paddingTop: 8,
      }}>
        <span style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
          {routine.code}
        </span>
        <span style={{
          ...displayItalic, fontSize: 16,
          color: color, fontWeight: 500,
        }}>{routine.min} min</span>
      </div>
    </Card>
  );
}

Object.assign(window, { BreatheLibrary });
