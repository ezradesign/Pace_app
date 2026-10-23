/* PACE · LA HOJA DE «VER EJERCICIO» (Ez, 22 oct. 2026: 5b B, con su cambio)
   =======================================================================
   Lo que abre «Ver ejercicio» en la invitación del aro: una hoja abajo, hecha con las piezas
   de «Tu pausa» (Modal y BreakPlato, BreakMenu.ritmo.jsx), con el ejercicio que toca
   (state-ritmo.hacerla.jsx). Lleva el dibujo genérico de su MÓDULO y no el del ejercicio
   (Ez), su nombre, lo que dura y el módulo, como en las fotos que aprobó.

   La hoja no cuenta: «Empezar» lleva a la pantalla de ejercicio de siempre y «Seguir con el
   bloque N» la salta y empieza el bloque. La × la cierra y el aro sigue invitando. */

function RitmoHacerla({ ejercicio, onClose, onEmpezar, onSeguir }) {
  const { t, tn, lang } = useT();
  const e = ejercicio;
  if (!e) return null;
  const plan = typeof ritmoPlan === 'function' ? ritmoPlan(getState()) : null;
  const color = BREAK_COLOR[e.modulo];
  const clave = e.rutina + '.s' + e.paso + '.name';
  const nombre = lang === 'en' && t(clave) !== clave ? t(clave) : e.step.name;
  const seg = hacerlaSegundos(e);
  const sentado = typeof bloquesSeguidos === 'function' ? bloquesSeguidos() : 0;
  return (
    <Modal open onClose={onClose} maxWidth={720} title={t('bloques.invita')} subtitle={t('bloques.hoja.sub')}
      tagLabel={plan && plan.hechos ? tn('break.ritmo.tag', { n: plan.hechos, m: plan.total }) : null}>
      <BreakPlato color={color} glifo={{ nodo: e.modulo === 'extra' ? <ABStretch /> : <ABMove />, modulo: true }}
        motivo={sentado > 0 ? tn('break.prop.sitting', { n: sentado }) : null} nombre={nombre}
        ctx={<>{seg ? <><b>{seg}</b><u>{t('bloques.hoja.s')}</u></> : null}
          <em>{t(e.modulo === 'extra' ? 'break.stretch.label' : 'break.move.label')}</em></>}
        datos={{ 'data-pace-hacerla': '' }} />
      <div className="pace-break-acciones" style={{ marginTop: 16 }}>
        <button type="button" data-pace-hacerla-empezar className="pace-break-pildora pace-break-llena" style={{ '--c': color }}
          onClick={onEmpezar}>{t('break.prop.start')}</button>
        <button type="button" data-pace-hacerla-seguir className="pace-break-pildora pace-break-tonal" onClick={onSeguir}>
          {plan ? tn('break.ritmo.seguir', { n: plan.hechos + 1 }) : t('bloques.seguir')}
        </button>
      </div>
    </Modal>
  );
}

Object.assign(window, { RitmoHacerla });
