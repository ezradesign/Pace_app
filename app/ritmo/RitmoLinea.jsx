/* PACE · A tu ritmo · la LÍNEA DEL DÍA (s192)
   ===========================================
   Escritorio: la jornada proporcional al tiempo, con cada parada dibujada como su
   glifo en un aro fino (la pausa larga lleva los dos, la comida sus cubiertos) y
   su etiqueta de carta debajo: hora · plato · «3 MIN · ESTIRA» con su vaso.
   Tocar una parada que aún no ha pasado sirve OTRA rutina del mismo módulo.

   Móvil: la misma línea sin etiquetas, con puntos — a 8 px un dibujo no se lee.

   LAS ETIQUETAS SE COLOCAN MIDIENDO (rondas 1 a 4 de la maqueta): si se pisan, se
   reparten en hasta TRES niveles de forma VORAZ —cada una va al primero donde no
   choca— y cada nivel empieza bajo la más alta del anterior. El reparto alterno
   (par arriba, impar abajo) no miraba la última, que va alineada a la derecha, y
   con dos paradas a 30 min chocaba. La zona reservada se mide SIEMPRE. */

const { useRef: useRefRL, useLayoutEffect: useLayoutEffectRL } = React;

function RitmoEtiqueta({ it, final, t, tn, lang }) {
  let nombre, meta;
  if (it.tipo === 'comida') {
    nombre = t('ritmo.comida');
    meta = t('ritmo.comida.lejos');
  } else if (it.larga) {
    nombre = it.platos.map((p, i) => (
      <React.Fragment key={p.id}>{i ? <br /> : null}{i ? '+ ' : ''}{ritmoNombre(p.rutina, t, lang)}</React.Fragment>
    ));
    meta = tn('ritmo.larga', { n: it.dur });
  } else {
    nombre = ritmoPlatos(it, t, lang);
    meta = it.platos[0].min + ' min · ' + ritmoModulo(it.platos[0].modulo, t);
  }
  /* SPAN y no DIV: la etiqueta de una parada vive dentro de su <button>. */
  return (
    <span className={'pace-rt-etiq' + (final ? ' pace-rt-final' : '')} data-pace-ritmo-etiq>
      <span className="pace-rt-h">{ritmoHora(it.desde)}</span>
      <span className="pace-rt-n">{nombre}</span>
      <span className="pace-rt-m">{meta}{it.agua ? <RitmoGlifo modulo="agua" className="pace-rt-gota" /> : null}</span>
    </span>
  );
}

/* Hasta tres niveles, voraz. Devuelve nada: escribe `top` y el hilo. */
function ritmoColocarEtiquetas(lin, zona) {
  if (!lin || !zona || !lin.offsetParent) return;   /* oculta (piel móvil) */
  const l = Array.prototype.slice.call(lin.querySelectorAll('[data-pace-ritmo-etiq]'));
  l.forEach((e) => { e.style.top = ''; e.classList.remove('pace-rt-alta'); });
  if (!l.length) return;
  const r = l.map((e) => e.getBoundingClientRect());
  const niveles = [[], [], []];
  l.forEach((e, i) => {
    const cabe = (n) => niveles[n].every((j) => r[j].right + 6 <= r[i].left || r[i].right + 6 <= r[j].left);
    niveles[cabe(0) ? 0 : cabe(1) ? 1 : 2].push(i);
  });
  const arriba = lin.getBoundingClientRect().top;
  let y = 30;
  niveles.forEach((idx, n) => {
    if (!idx.length) return;
    idx.forEach((i) => {
      const padre = l[i].offsetParent ? l[i].offsetParent.getBoundingClientRect().top - arriba : 0;
      l[i].style.top = (y - padre) + 'px';
      if (n) { l[i].classList.add('pace-rt-alta'); l[i].style.setProperty('--rt-sube', (y - 26) + 'px'); }
    });
    y += Math.max.apply(null, idx.map((i) => l[i].offsetHeight)) + 6;
  });
  const fondo = Math.max.apply(null, l.map((e) => e.getBoundingClientRect().bottom));
  zona.style.height = Math.ceil(fondo - zona.getBoundingClientRect().top + 2) + 'px';
}

function RitmoLinea({ plan, onCambiar }) {
  const { t, tn, lang } = useT();
  const lin = useRefRL(null);
  const zona = useRefRL(null);
  const m = plan.m;
  const iActual = plan.actual ? m.items.indexOf(plan.actual) : m.items.length;
  const ultimo = m.items.length - 1;

  useLayoutEffectRL(() => {
    const colocar = () => ritmoColocarEtiquetas(lin.current, zona.current);
    colocar();
    if (!window.ResizeObserver || !lin.current) return undefined;
    const ro = new ResizeObserver(colocar);
    ro.observe(lin.current);
    return () => ro.disconnect();
  });

  return (
    <React.Fragment>
      <div className="pace-rt-linea" ref={lin} data-pace-ritmo-linea>
        <div className="pace-rt-sobre">
          <span className="pace-rt-meta">{ritmoResumen(m, tn)}</span>
          <button className="pace-rt-enlace" onClick={onCambiar}>{t('ritmo.cambiar')}</button>
          <RitmoLibre />
        </div>
        {m.items.map((it, i) => {
          if (it.tipo === 'foco' || it.tipo === 'comida' || it.tipo === 'libre') {
            const ahora = i === iActual;
            const titulo = it.tipo === 'foco' ? tn('ritmo.foco', { n: it.dur }) + ' · ' + ritmoHora(it.desde)
              : it.tipo === 'libre' ? tn('ritmo.hueco', { n: it.dur })
              : t('ritmo.comida') + ' · ' + ritmoDuracion(it.dur);
            const clase = 'pace-rt-seg pace-rt-' + it.tipo + (ahora ? ' pace-rt-ahora' : i < iActual && it.tipo === 'foco' ? ' pace-rt-hecho' : '');
            return (
              <div key={i} className={clase} style={{ flex: it.dur + ' 1 0' }} title={titulo} data-pace-ritmo-tramo={it.tipo}>
                {ahora ? <span className="pace-rt-ahora-tag">{t('ritmo.ahora')}</span> : null}
                {it.tipo === 'comida' ? (
                  <React.Fragment>
                    <span className="pace-rt-comida-nodo"><RitmoGlifo modulo="comida" /></span>
                    <RitmoEtiqueta it={it} t={t} tn={tn} lang={lang} />
                  </React.Fragment>
                ) : null}
              </div>
            );
          }
          if (!it.platos || !it.platos.length) return null;
          const pasado = i < iActual;
          const nombres = ritmoPlatos(it, t, lang);
          return (
            <button key={i} type="button" data-pace-ritmo-parada={it.platos.map((p) => p.clave).join(',')}
              className={'pace-rt-nodo' + (it.larga ? ' pace-rt-larga' : '') + (pasado ? ' pace-rt-pasado' : ' pace-rt-toca')}
              style={{ '--c': RITMO_COLOR[it.platos[0].modulo] }}
              title={pasado ? nombres : nombres + ' · ' + t('ritmo.toca')}
              aria-label={ritmoHora(it.desde) + ' · ' + nombres}
              disabled={pasado}
              onClick={() => ritmoOtra(it.platos.map((p) => p.clave))}>
              {it.platos.map((p) => <RitmoGlifo key={p.id} modulo={p.modulo} />)}
              <RitmoEtiqueta it={it} final={i === ultimo} t={t} tn={tn} lang={lang} />
            </button>
          );
        })}
      </div>
      <div className="pace-rt-zona" ref={zona} />
    </React.Fragment>
  );
}

/* Móvil: la misma línea, con puntos y sin etiquetas. */
function RitmoMini({ plan }) {
  const m = plan.m;
  return (
    <div className="pace-rt-mini" aria-hidden="true">
      {m.items.map((it, i) => {
        if (it.tipo === 'foco' || it.tipo === 'comida' || it.tipo === 'libre') {
          const ahora = it === plan.actual;
          return <div key={i} className={'pace-rt-seg pace-rt-' + it.tipo + (ahora ? ' pace-rt-ahora' : '')} style={{ flex: it.dur + ' 1 0' }} />;
        }
        if (!it.platos || !it.platos.length) return null;
        return <span key={i} className={'pace-rt-punto' + (it.larga ? ' pace-rt-larga' : '')} style={{ '--c': RITMO_COLOR[it.platos[0].modulo] }} />;
      })}
    </div>
  );
}

Object.assign(window, { RitmoLinea, RitmoMini, RitmoEtiqueta, ritmoColocarEtiquetas });
