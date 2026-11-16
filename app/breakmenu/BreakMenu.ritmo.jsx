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
     · «Ya la hice por mi cuenta» → la da por hecha a tu manera y cierra (state-ritmo.pausa.jsx).

   El vestido es la opción A que eligió Ez («Como su tarjeta», BreakMenu.css.jsx). No
   hay línea de atajos: Intro hace la pausa propuesta y Esc la salta, y no se enseñan.

   Solo se pinta cuando la propuesta viene del menú (`porque` = `ritmo.*`) y hay
   plan con pausa abierta; si no, BreakMenu es el de siempre.

   Encima del nombre va la frase de las series si la parada la tiene («Caderas: sin
   mover hoy», Ez, 15 oct. 2026; `ritmoFrase`), y si no, la de siempre. */

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
    <div className={'pace-break-plato' + (glifo ? '' : ' pace-break-sin-glifo')} style={{ '--c': color, '--cd': letraDe(color) }} {...datos}>
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

/* «LA DE ANTES» (Ez, 5A del 15 nov. 2026): una fila más, con el estilo de la de Hidrátate, con
   el dibujo de su módulo, su nombre y «la de antes». La elige `breakLaDeAntes`
   (BreakMenu.support.jsx); aquí solo se pinta. La usan las dos ventanas: por libre va debajo de
   las otras puertas y con «A tu ritmo», debajo de Hidrátate. */
const BREAK_GLIFO_MODULO = { breathe: 'ABBreathe', extra: 'ABStretch', move: 'ABMove' };
function BreakAntes({ lda, onChoose, estilo }) {
  const { t, tn, lang } = useT();
  if (!lda || !lda.rutina) return null;
  const r = lda.rutina;
  const v = lang === 'en' ? t(r.id + '.name') : null;
  const nombre = v && v !== r.id + '.name' ? v : r.name;
  const Glifo = window[BREAK_GLIFO_MODULO[lda.modulo]];
  return (
    <button type="button" data-pace-break-antes={r.id} className="pace-break-agua" style={estilo} onClick={() => onChoose(lda.modulo, r)}>
      <span className="pace-break-glifo" style={{ '--c': BREAK_COLOR[lda.modulo] }}>{Glifo ? <Glifo /> : null}</span>
      <b>{nombre}</b>
      <span className="pace-break-mas">· {tn('break.antes', { n: routineCifraMin(r, getState().restBetweenSets) })}</span>
      <i aria-hidden="true">›</i>
    </button>
  );
}

function BreakMenuRitmo({ open, onClose, onChoose, onSeguir, onPropuesta, prop, plan, opciones, nombre }) {
  const { t, tn, lang } = useT();
  if (!open || !prop || !plan) return null;
  const agua = (opciones || []).find((o) => o.key === 'water');
  const rutina = prop.rutina;
  const pausa = plan.pausa;
  const comida = prop.porque === 'ritmo.comida';
  /* LA PAUSA LARGA TRAE DOS (Ez, 14 oct. 2026): el plato los nombra a los dos, con los
     minutos de la parada y sus dos módulos. «Hacer la pausa» entra en el que toca y su
     cierre lleva al otro (state-ritmo.pausa.jsx). */
  const dos = !comida && pausa && pausa.platos && pausa.platos.length > 1;
  /* «Ya la hice por mi cuenta», a la izquierda de «Ahora no», con su mismo estilo (Ez, 4A del 8 nov.
     2026): solo en las pausas entre bloques, no en la comida ni en la de cierre. */
  const aTuManera = !comida && !!pausa && pausa.tipo === 'pausa' && typeof ritmoPausaPorTuCuenta === 'function';
  /* La de antes no repite la propuesta ni ninguno de los platos de esta pausa. */
  const excluir = [rutina && rutina.id].concat(((pausa && pausa.platos) || []).map((pl) => pl.id)).filter(Boolean);
  const laDeAntes = typeof breakLaDeAntesAhora === 'function' ? breakLaDeAntesAhora(getState(), excluir) : null;
  const plato = comida
    ? { color: 'var(--ink-2)', boton: 'var(--focus-cta)', glifo: { nodo: <ABMeal />, modulo: true }, nombre: t('break.ritmo.comida'),
        ctx: <><b>{pausa ? pausa.dur : ''}</b><u>{t('lib.min')}</u>{pausa && pausa.agua && <em>{t('break.ritmo.conAgua')}</em>}</> }
    : { color: BREAK_COLOR[prop.modulo], boton: BREAK_COLOR[prop.modulo], glifo: breakGlifo(prop.modulo, rutina),
        nombre: dos ? ritmoPlatos(pausa, t, lang) : nombre,
        ctx: rutina ? <><b>{dos ? pausa.dur : routineCifraMin(rutina, getState().restBetweenSets)}</b><u>{t('lib.min')}</u>
          <em>{dos ? tn('ritmo.y', { a: ritmoModulo(pausa.platos[0].modulo, t), b: ritmoModulo(pausa.platos[1].modulo, t) })
            : t('break.' + (prop.modulo === 'extra' ? 'stretch' : prop.modulo) + '.label')}</em>
          {pausa && pausa.agua && <em>{t('break.ritmo.agua')}</em>}</> : null };
  return (
    <Modal open={open} onClose={onClose} tagLabel={tn('break.ritmo.tag', { n: plan.hechos, m: plan.total })}
      title={t('break.ritmo.title')} subtitle={tn('break.ritmo.sub', { h: pausa ? ritmoHora(pausa.desde) : '' })} maxWidth={720}>
      <BreakPlato color={plato.color} glifo={plato.glifo} motivo={(!comida && pausa && typeof ritmoFrase === 'function' && ritmoFrase(pausa, t, tn)) || t('break.prop.' + prop.porque)} nombre={plato.nombre} ctx={plato.ctx}
        datos={{ 'data-pace-break-prop': '', 'data-pace-break-ritmo': '' }} />
      <div data-pace-break-acciones className="pace-break-acciones" style={{ marginTop: 16 }}>
        <button type="button" className="pace-break-pildora pace-break-llena" style={{ '--cd': letraDe(plato.boton) }} onClick={onPropuesta}>
          {t(comida ? 'break.ritmo.comer' : 'break.ritmo.hacer')}
        </button>
        {/* Tras el último bloque no hay otro con el que seguir: solo queda la pausa de cierre. */}
        {plan.hechos < plan.total && (
          <button type="button" className="pace-break-pildora pace-break-tonal" onClick={onSeguir}>{tn('break.ritmo.seguir', { n: plan.hechos + 1 })}</button>
        )}
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
      {/* La de antes, debajo de Hidrátate; tampoco a la hora de comer. */}
      {!comida && <BreakAntes lda={laDeAntes} onChoose={onChoose} estilo={agua ? undefined : { marginTop: 16 }} />}
      {/* `data-pace-break-shortcut` ya no lleva atajos: es el pie, y las pruebas lo usan
          para saber que la pausa está abierta. */}
      <div data-pace-break-shortcut className="pace-break-pie" style={{ marginTop: 6, justifyContent: aTuManera ? 'space-between' : undefined }}>
        {aTuManera && (
          <button type="button" className="pace-break-saltar" data-pace-break-cuenta onClick={() => { ritmoPausaPorTuCuenta(); onClose(); }}>{t('break.ritmo.cuenta')}</button>
        )}
        <button type="button" className="pace-break-saltar" onClick={onClose}>{t('break.skip')}</button>
      </div>
    </Modal>
  );
}

Object.assign(window, { BreakMenuRitmo, BreakPlato, BreakAntes, breakGlifo, BREAK_COLOR });
