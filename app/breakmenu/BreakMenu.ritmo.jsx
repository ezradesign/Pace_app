/* PACE · La pausa CON MENÚ (s195)
   ==============================
   Al acabar un bloque de «A tu ritmo», el modal de pausa dejaba el plato del menú
   arriba y, debajo, los cuatro módulos de siempre —«que son por libre», dijo el
   usuario—. Con un menú servido la pregunta es una sola: ¿haces la pausa, o sigues?

   Calco aprobado por el usuario mirándolo (docs/proposals/ideas-s195.html, idea 1),
   con un añadido suyo: el GLIFO del ejercicio principal, el mismo que llevan las
   tarjetas de cada rutina (`libraryGlifos` + `ExerciseGlyph`); Respira no tiene
   arte de ejercicio y lleva el glifo de su módulo.

     · «Hacer la pausa»  → la rutina, por la puerta de siempre (onChoose con el plato).
     · «Seguir con el bloque N+1» → cierra y arranca el aro (`pace:ritmo-seguir`, que
       FocusTimer escucha): la pausa queda SALTADA al empezar el bloque (state-ritmo).
     · «Hidrátate» → la única sugerencia aparte del plato (el usuario, tras verlo:
       «quita las cuatro opciones de abajo y deja solo Hidrátate»). Abre el agua.
     · «Saltar esta pausa» → cierra sin más, como siempre (la pausa sigue abierta
       hasta que empiece el bloque).

   Solo se pinta cuando la propuesta viene del menú (`porque` = `ritmo.*`) y hay
   plan con pausa abierta; si no, BreakMenu es el de siempre. */

function BreakMenuRitmo({ open, onClose, onChoose, onSeguir, prop, plan, opciones, nombre }) {
  const { t, tn } = useT();
  if (!open || !prop || !plan) return null;
  const agua = (opciones || []).find((o) => o.key === 'water');
  const rutina = prop.rutina;
  const pausa = plan.pausa;
  const esRespira = prop.modulo === 'breathe';
  const glifos = (!esRespira && rutina && window.libraryGlifos) ? window.libraryGlifos(rutina) : [];
  const meta = rutina
    ? tn('break.prop.meta', { n: rutina.min, m: t('break.' + (prop.modulo === 'extra' ? 'stretch' : prop.modulo) + '.label') })
      + (pausa && pausa.agua ? ' · ' + t('break.ritmo.agua') : '')
    : '';
  return (
    <Modal open={open} onClose={onClose} tagLabel={tn('break.ritmo.tag', { n: plan.hechos, m: plan.total })}
      title={t('break.ritmo.title')} subtitle={tn('break.ritmo.sub', { h: pausa ? ritmoHora(pausa.desde) : '' })} maxWidth={720}>
      <div data-pace-break-prop data-pace-break-ritmo style={{
        margin: '18px 0 12px', padding: '14px 16px',
        border: '1.5px solid var(--breathe)', background: 'var(--breathe-soft)',
        borderRadius: 'var(--r-md)', display: 'grid', gridTemplateColumns: glifos.length || esRespira ? '62px minmax(0, 1fr)' : 'minmax(0, 1fr)', gap: '4px 16px', alignItems: 'center',
      }}>
        {glifos.length > 0 ? (
          <div style={{ color: 'var(--breathe-2)', gridRow: 'span 3' }} data-pace-break-glifo><ExerciseGlyph id={glifos[0]} size={62} /></div>
        ) : esRespira ? (
          <div style={{ color: 'var(--breathe)', fontSize: 44, lineHeight: 1, gridRow: 'span 3', display: 'grid', placeItems: 'center' }} data-pace-break-glifo><ABBreathe /></div>
        ) : null}
        <div style={{ fontSize: 11.5, letterSpacing: '0.03em', color: 'var(--breathe-2)', fontWeight: 500 }}>{t('break.prop.' + prop.porque)}</div>
        <div style={{ ...displayItalic, fontSize: 24 }}>{nombre}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>{meta}</div>
      </div>
      {/* `Button` no reenvía data-*: las pruebas los buscan por su nombre */}
      <div data-pace-break-acciones style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button variant="terracota" onClick={() => onChoose(prop.modulo, rutina)}>{t('break.ritmo.hacer')}</Button>
        <Button variant="secondary" onClick={onSeguir}>{tn('break.ritmo.seguir', { n: plan.hechos + 1 })}</Button>
      </div>
      {agua && (
        <button data-pace-break-agua onClick={() => onChoose('water')} style={{
          marginTop: 14, width: '100%', padding: '12px 14px', background: agua.bg, border: '1.5px solid ' + agua.color, borderRadius: 'var(--r-md)',
          textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', color: 'var(--ink)',
        }}>
          <span style={{ color: agua.color, fontSize: 24, lineHeight: 1 }}>{agua.icon}</span>
          <span style={{ ...displayItalic, fontSize: 20, fontWeight: 500 }}>{agua.label}</span>
          <span style={{ fontSize: 12, color: 'var(--ink-2)', marginLeft: 'auto' }}>{agua.desc}</span>
        </button>
      )}
      <div data-pace-break-shortcut style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
        <Meta>{t('break.ritmo.shortcut')}</Meta>
        <Button variant="ghost" onClick={onClose}>{t('break.skip')}</Button>
      </div>
    </Modal>
  );
}

Object.assign(window, { BreakMenuRitmo });
