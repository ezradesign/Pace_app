/* PACE · Respiración — Biblioteca + modal de seguridad
   Extraído de BreatheModule.jsx en sesión 34 (v0.16.0).
*/

const { useState } = React;

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

function BreatheLibrary({ open, onClose, onStart }) {
  const { t } = useT();
  return (
    <Modal open={open} onClose={onClose} tagLabel={t('lib.tag')} title={t('lib.breathe.title')} subtitle={t('lib.breathe.subtitle')}
      maxWidth={860}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 8 }}>
        {Object.entries(BREATHE_ROUTINES).map(([key, group]) => (
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
  const { t } = useT();
  return (
    <Card accent={color} onClick={onClick} padded={false} style={{ padding: '16px 18px', position: 'relative' }}>
      {routine.safety && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          width: 18, height: 18, borderRadius: '50%',
          background: 'var(--breathe-soft)', color: 'var(--breathe)',
          display: 'grid', placeItems: 'center',
          fontSize: 11, fontWeight: 600,
        }} title={t('breathe.safety.required')}>⚠</div>
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

function BreatheSafety({ routine, onAccept, onCancel }) {
  const { t } = useT();
  const [checked, setChecked] = useState(false);
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
          <div className="pace-meta" style={{ marginBottom: 4 }}>{t('breathe.safety.before')}</div>
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
        <span>{t('breathe.safety.check')}</span>
      </label>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Button variant="ghost" onClick={onCancel}>{t('breathe.safety.cancel')}</Button>
        <Button variant="terracota" disabled={!checked} onClick={() => onAccept(routine)}>{t('breathe.safety.start')}</Button>
      </div>
    </Modal>
  );
}

Object.assign(window, { BreatheLibrary, BreatheSafety });
