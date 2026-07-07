/* PACE · Respiración — Biblioteca + modal de seguridad
   Extraído de BreatheModule.jsx en sesión 34 (v0.16.0).
*/

const { useState } = React;

/* F4 (s90): 12 → 20 técnicas. Orden dentro de cada grupo: free primero,
   premium al final (el usuario free ve antes lo que puede usar). */
const BREATHE_ROUTINES = {
  energia: {
    label: 'Energía',
    aside: 'Despierta el sistema',
    items: [
      { id: 'breathe.bellows', tag: 'PRA', code: 'Pranayama', name: 'Bhastrika · Fuelle', desc: 'Pranayama energizante rápido', min: 3, pattern: 'bhastrika' },
      { id: 'breathe.rounds.express', tag: 'ENE', code: 'Energía', name: 'Rondas express', desc: 'Versión corta: 2 rondas de 25 respiraciones. Para sesiones breves.', min: 4, pattern: 'rounds', rounds: 2, breaths: 25, safety: true, access: 'premium' },
      { id: 'breathe.rounds.full', tag: 'ENE', code: 'Energía', name: 'Respiración en rondas', desc: '30 respiraciones profundas → retención en vacío. 3 rondas.', min: 12, pattern: 'rounds', rounds: 3, breaths: 30, safety: true, access: 'premium' },
      { id: 'breathe.rounds.long', tag: 'ENE', code: 'Energía', name: 'Rondas profundas', desc: '5 rondas de 35 respiraciones. Antesala del trance consciente.', min: 20, pattern: 'rounds', rounds: 5, breaths: 35, safety: true, access: 'premium' },
    ]
  },
  equilibrio: {
    label: 'Equilibrio',
    aside: 'Regula el sistema nervioso',
    items: [
      { id: 'breathe.box.4', tag: 'EQU', code: 'Equilibrio', name: 'Box 4·4·4·4', desc: 'Cuadrado perfecto. Calma mental y foco sostenido.', min: 5, pattern: 'box', cycle: [4,4,4,4] },
      { id: 'breathe.box.6', tag: 'EQU', code: 'Equilibrio', name: 'Box 6·6·6·6', desc: 'Versión profunda', min: 7, pattern: 'box', cycle: [6,6,6,6] },
      { id: 'breathe.diaphragm', tag: 'EQU', code: 'Equilibrio', name: 'Diafragmática', desc: 'Respira hacia el vientre. La base de todo lo demás.', min: 5, pattern: 'diaphragm' },
      { id: 'breathe.co2', tag: 'EQU', code: 'Equilibrio', name: 'Tolerancia CO₂', desc: 'Exhala y sostén en vacío. Entrena la calma con menos aire.', min: 6, pattern: 'co2', safety: true, access: 'premium' },
    ]
  },
  balance: {
    label: 'Balance',
    aside: 'Armoniza HRV',
    items: [
      { id: 'breathe.coherent.55', tag: 'BAL', code: 'Balance', name: 'Coherente 5·5', desc: 'Respiración cardíaca. Sincroniza corazón y mente.', min: 5, pattern: 'coherent', cycle: [5,0,5,0] },
      { id: 'breathe.coherent.66', tag: 'BAL', code: 'Balance', name: 'Coherente 6·6', desc: 'Versión más profunda. 5 ciclos por minuto.', min: 10, pattern: 'coherent', cycle: [6,0,6,0] },
      { id: 'breathe.coherent.432', tag: 'BAL', code: 'Balance', name: 'Coherente 432', desc: 'Coherencia 6·6 sobre un drone de fondo. Inmersiva.', min: 10, pattern: 'coherent', cycle: [6,0,6,0], drone: true, access: 'premium' },
    ]
  },
  relajacion: {
    label: 'Relajación',
    aside: 'Baja el ruido mental',
    items: [
      { id: 'breathe.478', tag: 'REL', code: 'Relajación', name: '4·7·8', desc: 'Exhalación larga. Baja ansiedad, prepara sueño.', min: 3, pattern: 'pattern', cycle: [4,7,8,0] },
      { id: 'breathe.physiological', tag: 'REL', code: 'Relajación', name: 'Suspiro fisiológico', desc: 'Doble inhalación + exhalación larga. Reset rápido.', min: 2, pattern: 'physiological' },
      { id: 'breathe.exhale.46', tag: 'REL', code: 'Relajación', name: 'Exhalación 4·6', desc: 'Exhala más largo de lo que inhalas. Freno suave.', min: 6, pattern: 'coherent', cycle: [4,0,6,0] },
      { id: 'breathe.yin', tag: 'REL', code: 'Relajación', name: 'Rítmica yin', desc: 'Ritmo suave con reposo tras exhalar. Quietud que se asienta.', min: 8, pattern: 'yin' },
    ]
  },
  pranayama: {
    label: 'Pranayama',
    aside: 'Raíces yóguicas',
    items: [
      { id: 'breathe.ujjayi', tag: 'PRA', code: 'Pranayama', name: 'Ujjayi', desc: 'Respiración oceánica. Meditativa.', min: 6, pattern: 'ujjayi', cycle: [5,0,5,0] },
      { id: 'breathe.bhramari', tag: 'PRA', code: 'Pranayama', name: 'Bhramari · Abeja', desc: 'Exhala con un zumbido grave. La mente se aquieta.', min: 5, pattern: 'bhramari' },
      { id: 'breathe.nadi.shodhana', tag: 'PRA', code: 'Pranayama', name: 'Nadi Shodhana', desc: 'Respiración alternada. Equilibra hemisferios.', min: 8, pattern: 'nadi', access: 'premium' },
      { id: 'breathe.kapalabhati', tag: 'KRI', code: 'Kriya', name: 'Kapalabhati · Kriya', desc: 'Limpieza del cráneo. Enérgico.', min: 3, pattern: 'kapalabhati', safety: true, access: 'premium' },
      { id: 'breathe.kumbhaka', tag: 'PRA', code: 'Pranayama', name: 'Kumbhaka 1:4:2', desc: 'Inhala 4, sostén 16, exhala 8. Solo con experiencia.', min: 6, pattern: 'pattern', cycle: [4,16,8,0], safety: true, access: 'premium' },
    ]
  }
};

function BreatheLibrary({ open, onClose, onStart }) {
  const { t, lang } = useT();
  const tR = (key, fb) => { if (lang !== 'en') return fb; const v = t(key); return v === key ? fb : v; };
  return (
    <Modal open={open} onClose={onClose} tagLabel={t('lib.tag')} title={t('lib.breathe.title')} subtitle={t('lib.breathe.subtitle')}
      maxWidth={860}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 8 }}>
        {Object.entries(BREATHE_ROUTINES).map(([key, group]) => (
          <div key={key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <h3 style={{ ...displayItalic, fontSize: 20, margin: 0, fontWeight: 500 }}>{tR(`breathe.cat.${key}.label`, group.label)}</h3>
              {group.aside && <Meta>{tR(`breathe.cat.${key}.aside`, group.aside)}</Meta>}
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

/* RoutineCard — tarjeta compartida por las 3 bibliotecas (Respira/Mueve/Estira),
   expuesta a window y consumida también por MoveModule y ExtraModule.

   Gating de contenido (s87 · bloque Contenido+Premium F3a):
   convención del campo `access` en los datos de rutina —
     ausente | 'free'  → libre (comportamiento normal, clicable)
     'premium'         → de pago. El sello PREMIUM se muestra siempre como
                         marca de contenido de pago. El bloqueo real (sello +
                         'Pronto' + clic desactivado) depende de
                         `premiumUnlocked` del state: mientras es false (su
                         valor por defecto, sin ruta de compra hasta v1.0) toda
                         premium está bloqueada. El cableado queda listo para
                         que un flag futuro (compra / locked.initial /
                         locked.achievement) ponga `premiumUnlocked` a true y
                         las premium pasen a clicables sin tocar este componente.
     Designación del set premium inicial: s88 (F3b). */
function RoutineCard({ routine, color, onClick }) {
  const { t, lang } = useT();
  const [pace] = usePace();
  const tR = (key, fb) => { if (lang !== 'en') return fb; const v = t(key); return v === key ? fb : v; };
  const isPremium = routine.access === 'premium';
  const isLocked = isPremium && !pace.premiumUnlocked;
  return (
    <Card accent={isLocked ? undefined : color} onClick={isLocked ? undefined : onClick} padded={false} style={{ padding: '16px 18px', position: 'relative' }}>
      {routine.safety && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          width: 18, height: 18, borderRadius: '50%',
          background: 'var(--breathe-soft)', color: 'var(--breathe)',
          display: 'grid', placeItems: 'center',
          fontSize: 11, fontWeight: 600,
        }} title={t('breathe.safety.required')}>⚠</div>
      )}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
        <Tag color={color}>{routine.tag}</Tag>
        {isPremium && <PremiumSeal />}
      </div>
      <h4 style={{ ...displayItalic, fontSize: 19, margin: '0 0 6px', fontWeight: 500, lineHeight: 1.15 }}>{tR(`${routine.id}.name`, routine.name)}</h4>
      <p style={{ fontSize: 12.5, color: 'var(--ink-2)', margin: '0 0 12px', lineHeight: 1.5 }}>{tR(`${routine.id}.desc`, routine.desc)}</p>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: '1px dashed var(--line)', paddingTop: 8,
      }}>
        <span style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
          {tR(`${routine.id}.code`, routine.code)}
        </span>
        {isLocked ? (
          <span style={{ ...displayItalic, fontSize: 16, color: 'var(--premium)', fontWeight: 500 }}>{t('premium.soon')}</span>
        ) : (
          <span style={{ ...displayItalic, fontSize: 16, color: color, fontWeight: 500 }}>{routine.min} min</span>
        )}
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
        {t('breathe.safety.body.intro.pre')}<strong style={{ color: 'var(--ink)' }}>{t('breathe.safety.body.intro.bold')}</strong>{t('breathe.safety.body.intro.post')}
      </p>
      <ul style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--ink-2)', paddingLeft: 18, margin: '0 0 20px' }}>
        <li>{t('breathe.safety.body.rule1.pre')}<strong style={{color:'var(--ink)'}}>{t('breathe.safety.body.rule1.bold')}</strong>{t('breathe.safety.body.rule1.post')}</li>
        <li>{t('breathe.safety.body.rule2')}</li>
        <li>{t('breathe.safety.body.rule3')}</li>
        <li>{t('breathe.safety.body.rule4')}</li>
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


/* Sesion 49 - helper de lookup para Caminos */
function getBreatheRoutine(id) {
  for (const group of Object.values(BREATHE_ROUTINES)) {
    const found = group.items.find(r => r.id === id);
    if (found) return found;
  }
  return null;
}
window.getBreatheRoutine = getBreatheRoutine;

Object.assign(window, { BreatheLibrary, BreatheSafety });
