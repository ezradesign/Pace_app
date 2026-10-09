/* PACE · La pausa CON MENÚ (s195)
   ==============================
   Al acabar un bloque de «A tu ritmo», el modal de pausa dejaba el plato del menú
   arriba y, debajo, los cuatro módulos de siempre —«que son por libre», dijo el
   usuario—. Con un menú servido la pregunta es una sola: ¿haces la pausa, o sigues?

   Calco aprobado por el usuario mirándolo (docs/proposals/ideas-s195.html, idea 1),
   con un añadido suyo: el GLIFO del ejercicio principal, el mismo que llevan las
   tarjetas de cada rutina (`libraryGlifos` + `ExerciseGlyph`); Respira no tiene
   arte de ejercicio y lleva el glifo de su módulo.

     · «Hacer la pausa»  → la rutina, por la puerta de siempre (la propuesta de BreakMenu).
     · «Ir a comer» (la comida) → suma el vaso que la comida lleva y cierra: no hay
       rutina que abrir, y antes abría Hidrátate, lo mismo que la fila de debajo (Ez).
     · «Seguir con el bloque N+1» → cierra y arranca el aro (`pace:ritmo-seguir`, que
       FocusTimer escucha): la pausa queda SALTADA al empezar el bloque (state-ritmo).
     · «Hidrátate» → la única sugerencia aparte del plato (el usuario, tras verlo:
       «quita las cuatro opciones de abajo y deja solo Hidrátate»). Abre el agua.
     · «Saltar esta pausa» → cierra sin más, como siempre (la pausa sigue abierta
       hasta que empiece el bloque).

   El vestido es la opción A que eligió Ez («Como su tarjeta», BreakMenu.css.jsx). No
   hay línea de atajos: Intro hace la pausa propuesta y Esc la salta, y no se enseñan.

   Solo se pinta cuando la propuesta viene del menú (`porque` = `ritmo.*`) y hay
   plan con pausa abierta; si no, BreakMenu es el de siempre. */

/* El color del plato y de su botón es el del MÓDULO de la rutina. */
const BREAK_COLOR = { extra: 'var(--extra)', move: 'var(--move)', breathe: 'var(--breathe)', water: 'var(--hydrate)' };

/* El glifo del plato: el del ejercicio principal, como en su tarjeta; si la rutina no
   tiene arte de ejercicio (Respira), el del módulo. A 640 px o menos la caja es de 52. */
function breakGlifo(modulo, rutina) {
  const glifos = (modulo !== 'breathe' && modulo !== 'water' && rutina && window.libraryGlifos) ? window.libraryGlifos(rutina) : [];
  if (glifos.length) {
    const movil = window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
    return { nodo: <ExerciseGlyph id={glifos[0]} size={movil ? 52 : 60} />, modulo: false };
  }
  if (modulo === 'breathe') return { nodo: <ABBreathe />, modulo: true };
  if (modulo === 'water') return { nodo: <ABDrop />, modulo: true };
  return null;
}

/* El plato, vestido como la tarjeta de su rutina. Lo usan las dos pausas: con menú y
   sin él (BreakMenu.jsx, que pone dentro su botón). */
function BreakPlato({ color, glifo, motivo, nombre, ctx, children, datos }) {
  return (
    <div className={'pace-break-plato' + (glifo ? '' : ' pace-break-sin-glifo')} style={{ '--c': color }} {...datos}>
      {glifo && (
        <div className={'pace-break-glifo' + (glifo.modulo ? ' pace-break-glifo-mod' : '')} style={{ gridRow: 'span 3' }} data-pace-break-glifo>
          {glifo.nodo}
        </div>
      )}
      <div style={{ minWidth: 0 }}>
        {motivo && <div className="pace-break-motivo">{motivo}</div>}
        {nombre && <div className="pace-break-nombre">{nombre}</div>}
        {ctx && <div className="pace-lib-ctx">{ctx}</div>}
        {children}
      </div>
    </div>
  );
}

function BreakMenuRitmo({ open, onClose, onChoose, onSeguir, onPropuesta, prop, plan, opciones, nombre }) {
  const { t, tn } = useT();
  if (!open || !prop || !plan) return null;
  const agua = (opciones || []).find((o) => o.key === 'water');
  const rutina = prop.rutina;
  const pausa = plan.pausa;
  const comida = prop.porque === 'ritmo.comida';
  const plato = comida
    ? { color: 'var(--ink-2)', boton: 'var(--focus-cta)', glifo: { nodo: <ABMeal />, modulo: true }, nombre: t('break.ritmo.comida'),
        ctx: <><b>{pausa ? pausa.dur : ''}</b><u>{t('lib.min')}</u>{pausa && pausa.agua && <em>{t('break.ritmo.conAgua')}</em>}</> }
    : { color: BREAK_COLOR[prop.modulo], boton: BREAK_COLOR[prop.modulo], glifo: breakGlifo(prop.modulo, rutina), nombre,
        ctx: rutina ? <><b>{rutina.min}</b><u>{t('lib.min')}</u><em>{t('break.' + (prop.modulo === 'extra' ? 'stretch' : prop.modulo) + '.label')}</em>
          {pausa && pausa.agua && <em>{t('break.ritmo.agua')}</em>}</> : null };
  return (
    <Modal open={open} onClose={onClose} tagLabel={tn('break.ritmo.tag', { n: plan.hechos, m: plan.total })}
      title={t('break.ritmo.title')} subtitle={tn('break.ritmo.sub', { h: pausa ? ritmoHora(pausa.desde) : '' })} maxWidth={720}>
      <BreakPlato color={plato.color} glifo={plato.glifo} motivo={t('break.prop.' + prop.porque)} nombre={plato.nombre} ctx={plato.ctx}
        datos={{ 'data-pace-break-prop': '', 'data-pace-break-ritmo': '' }} />
      <div data-pace-break-acciones className="pace-break-acciones" style={{ marginTop: 16 }}>
        <button type="button" className="pace-break-pildora pace-break-llena" style={{ '--c': plato.boton }} onClick={onPropuesta}>
          {t(comida ? 'break.ritmo.comer' : 'break.ritmo.hacer')}
        </button>
        <button type="button" className="pace-break-pildora pace-break-tonal" onClick={onSeguir}>{tn('break.ritmo.seguir', { n: plan.hechos + 1 })}</button>
      </div>
      {/* A la hora de comer no: la comida ya lleva su vaso. */}
      {agua && !comida && (
        <button type="button" data-pace-break-agua className="pace-break-agua" style={{ marginTop: 16 }} onClick={() => onChoose('water')}>
          <span className="pace-break-glifo">{agua.icon}</span>
          <b>{agua.label}</b>
          <span className="pace-break-mas">· {t('break.ritmo.vaso')}</span>
          <i aria-hidden="true">›</i>
        </button>
      )}
      {/* `data-pace-break-shortcut` ya no lleva atajos: es el pie, y las pruebas lo usan
          para saber que la pausa está abierta. */}
      <div data-pace-break-shortcut className="pace-break-pie" style={{ marginTop: 6 }}>
        <button type="button" className="pace-break-saltar" onClick={onClose}>{t('break.skip')}</button>
      </div>
    </Modal>
  );
}

Object.assign(window, { BreakMenuRitmo, BreakPlato, breakGlifo, BREAK_COLOR });
