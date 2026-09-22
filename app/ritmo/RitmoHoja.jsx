/* PACE · A tu ritmo · la JORNADA ENTERA (s192)
   ============================================
   La lista del día, de arriba abajo: cada bloque de foco como una línea fina y
   cada parada con su glifo en el eje, su hora, su plato y «Otra». Va en el Modal
   de la app —el mismo marco que las bibliotecas y la pausa— y la abre «Ver la
   jornada entera» desde el panel móvil. Lo ya pasado se atenúa y no se cambia.
   s193: AHORA es la pausa abierta si la hay (ritmoIndiceAhora, RitmoLinea.jsx). */

function RitmoLista({ plan }) {
  const { t, tn, lang } = useT();
  const m = plan.m;
  const iActual = ritmoIndiceAhora(plan);
  return (
    <div className="pace-rt-lista" data-pace-ritmo-lista>
      {m.items.map((it, i) => {
        const pasado = i < iActual;
        const h = <div className="pace-rt-h">{ritmoHora(it.desde)}</div>;
        if (it.tipo === 'foco' || it.tipo === 'libre') {
          return (
            <div key={i} className={'pace-rt-li pace-rt-tramo' + (it.tipo === 'libre' ? ' pace-rt-hueco' : '') + (pasado ? ' pace-rt-pasado' : '')}>
              {h}<div className="pace-rt-eje" />
              <div className="pace-rt-txt">
                {it.tipo === 'libre' ? tn('ritmo.hueco', { n: it.dur }) : tn('ritmo.foco', { n: it.dur })}
                {i === iActual ? <React.Fragment>{' · '}<b style={{ color: 'var(--focus)', fontWeight: 500 }}>{t('ritmo.ahora.min')}</b></React.Fragment> : null}
              </div>
              <span />
            </div>
          );
        }
        const comida = it.tipo === 'comida';
        if (!comida && !(it.platos && it.platos.length)) return null;
        const modulo = comida ? 'comida' : it.platos[0].modulo;
        /* s197: la hoja RECUERDA, como la línea. Hasta ahora atenuaba TODO lo pasado al
           50 %, hiciera la pausa o la saltara, y «lo atenuado lee como no hecho» (s193):
           cuatro pausas hechas y una saltada se veían igual. Ahora cada parada pasada
           lleva su estado (`dia.estados` por ordinal, el mismo que la línea): la hecha
           recupera la tinta y su glifo se rellena; la saltada baja al 40 % y puntea. */
        const estado = !comida && pasado ? (plan.estados || {})[ritmoOrdinal(m, it)] || null : null;
        const meta = comida ? tn('ritmo.comida.lista', { d: ritmoDuracion(it.dur) })
          : estado ? (estado === 'hecha' ? t('ritmo.hecha') + ' · ' + it.dur + ' min' : t('ritmo.saltada'))
          : ritmoMetaPlato(it, t, tn);
        return (
          <div key={i} className={'pace-rt-li pace-rt-plato' + (pasado && estado !== 'hecha' ? ' pace-rt-pasado' : '') + (estado ? ' pace-rt-' + estado : '')}
            data-pace-ritmo-fila={it.tipo} data-pace-ritmo-estado-fila={estado || undefined}>
            {h}
            <div className="pace-rt-eje">
              <i className={it.larga ? 'pace-rt-larga' : ''} style={{ '--c': RITMO_COLOR[modulo] }}>
                {comida ? <RitmoGlifo modulo="comida" /> : it.platos.map((p) => <RitmoGlifo key={p.id} modulo={p.modulo} />)}
              </i>
            </div>
            <div>
              <div className="pace-rt-plato-n">
                {comida ? t('ritmo.comida') : it.platos.map((p, k) => (
                  <React.Fragment key={p.id}>{k ? <br /> : null}{k ? '+ ' : ''}{ritmoNombre(p.rutina, t, lang)}</React.Fragment>
                ))}
              </div>
              <div className="pace-rt-plato-m">
                <RitmoMetaGota texto={meta} agua={it.agua && estado !== 'saltada'} />
                {i === iActual ? <React.Fragment>{' · '}<b style={{ color: 'var(--focus)', fontWeight: 500 }}>{t('ritmo.ahora.min')}</b></React.Fragment> : null}
              </div>
            </div>
            {comida || pasado ? <span /> : (
              <button type="button" className="pace-rt-otra" data-pace-ritmo-otra
                onClick={() => ritmoOtra(it.platos.map((p) => p.clave))}>{t('ritmo.otra')}</button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function RitmoHoja({ open, onClose, plan, state }) {
  const { t, tn } = useT();
  if (!open || !plan) return null;
  const R = ritmoDe(state);
  return (
    <Modal open={open} onClose={onClose} tagLabel={t('ritmo.nombre')} title={t('ritmo.opcion.' + plan.m.opcion)} maxWidth={600}>
      <div data-pace-ritmo style={{ textAlign: 'left' }}>
        <div className="pace-rt-sub pace-rt-frase">
          <RitmoFraseMenu plan={plan} horario={R.horario} plantilla="ritmo.frase.menu" capital />
        </div>
        <div className="pace-rt-sub">{ritmoResumen(plan.m, tn)}</div>
        <div style={{ marginTop: 12 }}><RitmoContexto /></div>
        <RitmoLista plan={plan} />
        <div className="pace-rt-pie" style={{ borderTop: '1px solid var(--paper-3)', paddingTop: 14 }}>
          <button className="pace-rt-enlace" onClick={() => { onClose(); ritmoPreguntar(); }}>{t('ritmo.cambiar')}</button>
          <Button variant="primary" onClick={onClose}>{t('ritmo.listo')}</Button>
        </div>
      </div>
    </Modal>
  );
}

Object.assign(window, { RitmoLista, RitmoHoja });
