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
      /* B1.2 (s108): Bhastrika (PRA) se mudó al grupo Pranayama — era el único
         pranayama colado en Energía. rounds.express pasó a FREE para que el
         grupo tenga entrada usable sin premium. */
      { id: 'breathe.rounds.express', tag: 'ENE', code: 'Energía', name: 'Rondas express', desc: 'Versión corta: 2 rondas de 25 respiraciones. Para sesiones breves.', min: 4, pattern: 'rounds', rounds: 2, breaths: 25, safety: true },
      { id: 'breathe.rounds.full', tag: 'ENE', code: 'Energía', name: 'Respiración en rondas', desc: '30 respiraciones profundas → retención en vacío. 3 rondas.', min: 12, pattern: 'rounds', rounds: 3, breaths: 30, safety: true, access: 'premium' },
      { id: 'breathe.rounds.long', tag: 'ENE', code: 'Energía', name: 'Rondas profundas', desc: '5 rondas de 35 respiraciones. La práctica más larga e intensa.', min: 20, pattern: 'rounds', rounds: 5, breaths: 35, safety: true, access: 'premium' },
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
    aside: 'Ritmo suave y constante',
    items: [
      { id: 'breathe.coherent.55', tag: 'BAL', code: 'Balance', name: 'Coherente 5·5', desc: 'Ritmo constante de cinco y cinco. Pensada para encontrar un compás estable.', min: 5, pattern: 'coherent', cycle: [5,0,5,0] },
      { id: 'breathe.coherent.66', tag: 'BAL', code: 'Balance', name: 'Coherente 6·6', desc: 'Versión más profunda. 5 ciclos por minuto.', min: 10, pattern: 'coherent', cycle: [6,0,6,0] },
      { id: 'breathe.coherent.432', tag: 'BAL', code: 'Balance', name: 'Coherente 432', desc: 'Coherencia 6·6 sobre un drone de fondo. Inmersiva.', min: 10, pattern: 'coherent', cycle: [6,0,6,0], drone: true, access: 'premium' },
    ]
  },
  relajacion: {
    label: 'Relajación',
    aside: 'Baja el ruido mental',
    items: [
      { id: 'breathe.478', tag: 'REL', code: 'Relajación', name: '4·7·8', desc: 'Exhalación larga. Pensada para soltar el día y preparar el descanso.', min: 3, pattern: 'pattern', cycle: [4,7,8,0] },
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
      { id: 'breathe.bellows', tag: 'PRA', code: 'Pranayama', name: 'Bhastrika · Fuelle', desc: 'Pranayama energizante rápido', min: 3, pattern: 'bhastrika' },
      { id: 'breathe.nadi.shodhana', tag: 'PRA', code: 'Pranayama', name: 'Nadi Shodhana', desc: 'Respiración alternada, de la tradición del yoga. Pensada para asentar la atención.', min: 8, pattern: 'nadi', access: 'premium' },
      { id: 'breathe.kapalabhati', tag: 'KRI', code: 'Kriya', name: 'Kapalabhati · Kriya', desc: 'Limpieza del cráneo. Enérgico.', min: 3, pattern: 'kapalabhati', safety: true, access: 'premium' },
      { id: 'breathe.kumbhaka', tag: 'PRA', code: 'Pranayama', name: 'Kumbhaka 1:4:2', desc: 'Inhala 4, sostén 16, exhala 8. Solo con experiencia.', min: 6, pattern: 'pattern', cycle: [4,16,8,0], safety: true, access: 'premium' },
    ]
  }
};

/* s174 · RESPIRA RECIBE LA TARJETA, NO LA PANTALLA.
   La biblioteca conserva su estructura —sus cinco grupos, en su orden y sin
   filtros— y estrena la tarjeta compartida y su tipografía. Lo que NO entra, y
   por qué: Mueve y Estira se ordenan por CONTEXTO (11 de sus 28 exigen suelo)
   y Respira por TIEMPO (de 2 a 20 min, factor 10), así que su pantalla propia
   es otro diseño. Y su información más útil —el RITMO— pide dibujarlo: son 13
   motores de ritmo y 19 ritmos distintos, un encargo de arte que aún no tiene
   tamaño decidido. Mientras tanto el ritmo se DICE, en la línea de contexto,
   donde hoy no se leía en ninguna pantalla.
   Le entra la tarjeta y no espera a su sesión para que la app no tenga DOS
   idiomas de tarjeta en tres botones contiguos de la misma home. */
function BreatheLibrary({ open, onClose, onStart }) {
  const { t, lang } = useT();
  const tR = (key, fb) => { if (lang !== 'en') return fb; const v = t(key); return v === key ? fb : v; };
  return (
    <Modal open={open} onClose={onClose} maxWidth={860}>
      <div className="pace-lib" style={{ '--tone': 'var(--breathe)' }}>
        <div className="pace-lib-hd">
          <div className="pace-lib-k">{t('lib.tag')}</div>
          <div className="pace-lib-hd-fila"><h2>{t('lib.breathe.title')}</h2></div>
          <p className="pace-lib-sub">{t('lib.breathe.subtitle')}</p>
        </div>
        {Object.entries(BREATHE_ROUTINES).map(([key, group]) => (
          <div key={key}>
            {/* Se cae el `aside` de grupo, igual que en Mueve y Estira: la
                tarjeta nueva ya dice de qué va cada rutina. */}
            <h3 className="pace-lib-grp">{tR(`breathe.cat.${key}.label`, group.label)}</h3>
            {libraryOrdenar(group.items).map(r => (
              <RoutineCard key={r.id} routine={r} color="var(--breathe)" variant="breathe" onClick={() => onStart(r)} />
            ))}
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* s174 · `RoutineCard` YA NO VIVE AQUÍ. Se fue a `app/ui/RoutineCard.jsx`.
   Vivía en este archivo desde s34 por accidente histórico: la consumían también
   MoveModule y ExtraModule a través del global, así que tocar la tarjeta de
   Mueve obligaba a abrir el módulo de Respira. El gating de contenido (`access`
   + `canAccessRoutine`) se fue con ella, intacto. */

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
        {/* secret.safety.read (B1, sustituto de apnea): marcar "lo he leído"
            es la señal de lectura real de la guía de seguridad. */}
        <input type="checkbox" checked={checked} onChange={(e) => { setChecked(e.target.checked); if (e.target.checked) unlockAchievement('secret.safety.read'); }} />
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
