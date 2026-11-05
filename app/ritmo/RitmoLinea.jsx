/* PACE · A tu ritmo · la LÍNEA DEL DÍA (s192)
   ===========================================
   Escritorio: la jornada proporcional al tiempo, con cada parada dibujada como su
   glifo en un aro fino (la pausa larga lleva los dos, la comida sus cubiertos) y
   su etiqueta de carta debajo: hora · plato · «3 MIN · ESTIRA» con su vaso.
   TOCAR UNA PARADA QUE AÚN NO TOCA ES MIRARLA (Ez, 5 nov. 2026: 1A de la maqueta; Q2
   de ChatGPT, 28 oct.): abre su ficha (RitmoFicha), y cambiarla es «Otra», dentro de
   ella, como en la jornada entera del móvil. Antes la cambiaba sin preguntar, y a veces
   cambiaba también otra de más tarde: las series no repiten rutina y reparten el cuerpo
   en el día (ritmo.series.js). La ficha dice qué otra parada se ha movido.

   LA LÍNEA SIGUE AL ARO (s193, ronda 1 aprobada mirándola): el tramo de ahora se
   rellena con el bloque (`--pace-bloque`, que publica useLuzHome), lo hecho queda
   en verde entero —lo atenuado leía como «no hecho», dijo el usuario— y, al acabar
   un bloque, «Ahora» es la PARADA (plan.pausa) hasta que empiece el siguiente:
   tocarla la EMPIEZA, por la misma puerta que la barra lateral. Lo pasado conserva
   su fuerza y solo deja de poder tocarse.

   Móvil: la misma línea sin etiquetas, con puntos — a 8 px un dibujo no se lee.

   LO OCUPADO (las reuniones leídas del calendario) es un tramo rayado y sin
   nombre: PACE solo sabe a qué horas estás ocupado (decisión de Ez).

   s195: el resumen del día («50 min de foco · 1 pausa · 2 vasos» y «Cambiar») YA NO
   va aquí. Era un absoluto a 21 px sobre la línea, o sea en la misma banda donde
   «AHORA» se ancla al bloque de ahora, y se pisaban cada tarde. Ahora es RitmoSobre,
   en la cabecera del panel, bajo los chips.

   LAS ETIQUETAS SE COLOCAN MIDIENDO (rondas 1 a 4 de la maqueta): si se pisan, se
   reparten en hasta TRES niveles de forma VORAZ —cada una va al primero donde no
   choca— y cada nivel empieza bajo la más alta del anterior. El reparto alterno
   (par arriba, impar abajo) no miraba la última, que va alineada a la derecha, y
   con dos paradas a 30 min chocaba. La zona reservada se mide SIEMPRE. */

const { useRef: useRefRL, useLayoutEffect: useLayoutEffectRL, useState: useStateRL, useEffect: useEffectRL, useCallback: useCallbackRL } = React;

function RitmoEtiqueta({ it, final, t, tn, lang, estado }) {
  let nombre, meta;
  if (it.tipo === 'comida') {
    nombre = t('ritmo.comida');
    meta = t('ritmo.comida.lejos');
  } else if (estado) {
    /* s195: lo pasado dice si se hizo: «hecha · 3 min» o «saltada» */
    nombre = it.larga ? it.platos.map((p, i) => (
      <React.Fragment key={p.id}>{i ? <br /> : null}{i ? '+ ' : ''}{ritmoNombre(p.rutina, t, lang)}</React.Fragment>
    )) : ritmoPlatos(it, t, lang);
    meta = estado === 'hecha' ? t('ritmo.hecha') + ' · ' + it.dur + ' min' : t('ritmo.saltada');
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
      <span className="pace-rt-m">{meta}{it.agua && estado !== 'saltada' ? <RitmoGlifo modulo="agua" className="pace-rt-gota" /> : null}</span>
    </span>
  );
}

/* Hasta tres niveles, voraz. Devuelve nada: escribe `top` y el hilo. */
function ritmoColocarEtiquetas(lin, zona) {
  if (!lin || !zona || !lin.offsetParent) return;   /* oculta (piel móvil) */
  const l = Array.prototype.slice.call(lin.querySelectorAll('[data-pace-ritmo-etiq]'));
  l.forEach((e) => { e.style.top = ''; e.style.marginLeft = ''; e.style.removeProperty('--rt-hilo'); e.classList.remove('pace-rt-alta'); });
  if (!l.length) return;
  /* s195: NINGUNA ETIQUETA SE SALE DEL MARCO. Van centradas bajo su parada, y la
     primera parada de un día empezado tarde cae junto al borde: «Cadena posterior
     de pie» asomaba 37 px fuera del panel (captura del usuario). Se mide cuánto
     sobresale de la línea —con 16 px de aire, dentro del padding del panel— y se
     empuja con margin-left; el hilo (--rt-hilo) se desplaza lo contrario para
     seguir apuntando a su parada. Antes de repartir niveles, para que el
     reparto vea las cajas ya empujadas. */
  const marco = paceCaja(lin);
  l.forEach((e) => {
    const b = paceCaja(e);
    const dx = b.left < marco.left - 16 ? marco.left - 16 - b.left : b.right > marco.right + 16 ? marco.right + 16 - b.right : 0;
    if (dx) { e.style.marginLeft = Math.round(dx) + 'px'; e.style.setProperty('--rt-hilo', Math.round(-dx) + 'px'); }
  });
  const r = l.map((e) => paceCaja(e));
  const niveles = [[], [], []];
  l.forEach((e, i) => {
    const cabe = (n) => niveles[n].every((j) => r[j].right + 6 <= r[i].left || r[i].right + 6 <= r[j].left);
    niveles[cabe(0) ? 0 : cabe(1) ? 1 : 2].push(i);
  });
  const arriba = paceCaja(lin).top;
  let y = 30;
  niveles.forEach((idx, n) => {
    if (!idx.length) return;
    idx.forEach((i) => {
      const padre = l[i].offsetParent ? paceCaja(l[i].offsetParent).top - arriba : 0;
      l[i].style.top = (y - padre) + 'px';
      if (n) { l[i].classList.add('pace-rt-alta'); l[i].style.setProperty('--rt-sube', (y - 26) + 'px'); }
    });
    y += Math.max.apply(null, idx.map((i) => l[i].offsetHeight)) + 6;
  });
  const fondo = Math.max.apply(null, l.map((e) => paceCaja(e).bottom));
  zona.style.height = Math.ceil(fondo - paceCaja(zona).top + 2) + 'px';
}

/* El índice de AHORA: la pausa abierta si la hay, si no el bloque que toca. */
function ritmoIndiceAhora(plan) {
  const m = plan.m;
  if (plan.pausa) return m.items.indexOf(plan.pausa);
  return plan.actual ? m.items.indexOf(plan.actual) : m.items.length;
}

/* Empezar el plato de la parada abierta: la misma puerta que la barra lateral
   (usePaceEventos, `suggest`), así una rutina con aviso pasa por su modal.
   `parada: true` es para el ORIGEN del evento (s194): la sesión sale con
   `origin: 'parada'`, no 'sidebar'. La pausa larga trae dos platos: abre el
   primero sin hacer (state-ritmo.pausa.jsx), no siempre el primero. */
function ritmoEmpezarParada(it) {
  const plato = (typeof ritmoPlatoQueToca === 'function' && ritmoPlatoQueToca()) || (it.platos && it.platos[0]);
  if (!plato) return;
  window.dispatchEvent(new CustomEvent('pace:sidebar-action', { detail: { kind: 'suggest', targetId: plato.id, parada: true } }));
}

/* Las rutinas de cada parada, por su índice en la línea: para ver qué movió «Otra». */
function ritmoNombresParadas(m, t, lang) {
  const o = {};
  m.items.forEach((x, k) => { if (x.tipo !== 'comida' && x.platos && x.platos.length) o[k] = ritmoPlatos(x, t, lang); });
  return o;
}

/* LA FICHA DE UNA PARADA: lo que es (hora, minutos, módulo, nombre y su frase) y «Otra».
   Va bajo la línea, sobre las etiquetas, y sube encima si abajo no cabe en la ventana.
   Escape, «Cerrar» o tocar fuera la cierran; el foco vuelve a la parada. */
function RitmoFicha({ m, ficha, lin, boton, onCerrar, onOtra }) {
  const { t, tn, lang } = useT();
  const caja = useRefRL(null);
  const otraRef = useRefRL(null);
  const [sitio, setSitio] = useStateRL(null);
  const it = m.items[ficha.i];
  /* Se mide en cada render: tras «Otra» la ficha puede crecer una línea. Abajo, a 34 px de
     la línea; si así se saliera de la ventana, encima. */
  useLayoutEffectRL(() => {
    if (!caja.current || !lin.current || !boton) return;
    const l = paceCaja(lin.current), b = paceCaja(boton), w = caja.current.offsetWidth;
    const izq = Math.round(Math.max(-8, Math.min(b.left - l.left + b.width / 2 - w / 2, l.width - w + 8)));
    const arriba = l.top + 34 + paceCaja(caja.current).height > paceLienzoAlto() - 8;
    if (!sitio || sitio.izq !== izq || sitio.arriba !== arriba) setSitio({ izq, arriba });
  });
  useEffectRL(() => { if (otraRef.current) otraRef.current.focus(); }, [ficha.i]);
  useEffectRL(() => {
    const tecla = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onCerrar(true); } };
    const fuera = (e) => { if (caja.current && !caja.current.contains(e.target) && !(boton && boton.contains(e.target))) onCerrar(false); };
    document.addEventListener('keydown', tecla, true);
    document.addEventListener('pointerdown', fuera, true);
    return () => { document.removeEventListener('keydown', tecla, true); document.removeEventListener('pointerdown', fuera, true); };
  }, [boton, onCerrar]);

  const tR = (k, fb) => { if (lang !== 'en') return fb; const v = t(k); return v === k ? fb : v; };
  const ahora = ritmoNombresParadas(m, t, lang);
  const horas = ficha.antes ? Object.keys(ahora).filter((k) => Number(k) !== ficha.i && ficha.antes[k] != null && ficha.antes[k] !== ahora[k])
    .map((k) => ritmoHora(m.items[k].desde)) : [];
  const lista = horas.length > 1 ? horas.slice(0, -1).join(', ') + t('ritmo.ficha.y') + horas[horas.length - 1] : horas[0];
  const estilo = { left: sitio ? sitio.izq : 0, visibility: sitio ? 'visible' : 'hidden' };
  if (sitio && sitio.arriba) { estilo.top = 'auto'; estilo.bottom = 34; }
  return (
    <div ref={caja} className="pace-rt-ficha" data-pace-ritmo-ficha role="group" style={estilo}
      aria-label={ritmoHora(it.desde) + ' · ' + ritmoPlatos(it, t, lang)}>
      <div className="pace-rt-meta">{ritmoHora(it.desde)} · {it.larga ? tn('ritmo.larga', { n: it.dur }) : it.platos[0].min + ' min · ' + ritmoModulo(it.platos[0].modulo, t)}</div>
      {it.platos.map((p) => (
        <div key={p.id} className="pace-rt-ficha-plato">
          <div className="pace-rt-ficha-n">{ritmoNombre(p.rutina, t, lang)}</div>
          <div className="pace-rt-ficha-d">{p.rutina ? tR(p.rutina.id + '.desc', p.rutina.desc) : ''}</div>
        </div>
      ))}
      {horas.length ? <div className="pace-rt-sub" data-pace-ficha-tambien>{tn(horas.length > 1 ? 'ritmo.ficha.tambien.n' : 'ritmo.ficha.tambien.1', { h: lista })}</div> : null}
      <div className="pace-rt-ficha-pie">
        <button ref={otraRef} type="button" className="pace-rt-enlace pace-rt-fuerte" data-pace-ficha-otra onClick={onOtra}>{t('ritmo.otra')}</button>
        <button type="button" className="pace-rt-enlace pace-rt-ficha-x" data-pace-ficha-cerrar onClick={() => onCerrar(true)}>{t('ritmo.ficha.cerrar')} ×</button>
      </div>
    </div>
  );
}

function RitmoLinea({ plan }) {
  const { t, tn, lang } = useT();
  const lin = useRefRL(null);
  const zona = useRefRL(null);
  const botones = useRefRL({});
  const [ficha, setFicha] = useStateRL(null);   /* { i, antes }: la parada que se mira */
  const m = plan.m;
  const iActual = ritmoIndiceAhora(plan);
  const ultimo = m.items.length - 1;
  /* La ficha solo vale para una parada que aún no toca: si el día avanza, se cierra. */
  const fichaVale = ficha && ficha.i > iActual && m.items[ficha.i] && m.items[ficha.i].platos && m.items[ficha.i].platos.length;
  const fichaRef = useRefRL(null);
  fichaRef.current = ficha;
  const cerrarFicha = useCallbackRL((volver) => {
    const f = fichaRef.current;
    setFicha(null);
    if (volver && f && botones.current[f.i]) botones.current[f.i].focus();
  }, []);
  const otra = () => {
    const it = m.items[ficha.i];
    setFicha({ i: ficha.i, antes: ritmoNombresParadas(m, t, lang) });
    ritmoOtra(it.platos.map((p) => p.clave));
  };

  useLayoutEffectRL(() => {
    const colocar = () => ritmoColocarEtiquetas(lin.current, zona.current);
    colocar();
    /* s195: las etiquetas se miden con la fuente que haya EN ESE MOMENTO. Si la de
       verdad llega después (Cormorant es más estrecha que la de reserva: la larga
       pasa de 132×68 a 121×53), la colocación hecha con la de reserva SE QUEDA,
       porque el observador mira la línea y su caja no cambia. Medido a 1536×704:
       tres niveles (zona 122) donde el estado asentado tiene dos (107), o sea 15 px
       de panel y 17 de aro de menos. Se recoloca al llegar las fuentes, como la
       barra lateral (s181). `vivo` evita colocar sobre un nodo ya desmontado. */
    let vivo = true;
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (vivo) colocar(); });
    if (!window.ResizeObserver || !lin.current) return () => { vivo = false; };
    const ro = new ResizeObserver(colocar);
    ro.observe(lin.current);
    return () => { vivo = false; ro.disconnect(); };
  });

  return (
    <React.Fragment>
      <div className="pace-rt-linea" ref={lin} data-pace-ritmo-linea>
        {m.items.map((it, i) => {
          if (it.tipo === 'foco' || it.tipo === 'comida' || it.tipo === 'libre' || it.tipo === 'ocupado') {
            const ahora = i === iActual;
            const titulo = it.tipo === 'foco' ? tn('ritmo.foco', { n: it.dur }) + ' · ' + ritmoHora(it.desde)
              : it.tipo === 'libre' ? tn('ritmo.hueco', { n: it.dur })
              : it.tipo === 'ocupado' ? t('ritmo.ocupado') + ' · ' + ritmoHora(it.desde) + ' · ' + ritmoDuracion(it.dur)
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
          const abierta = i === iActual;
          const nombres = ritmoPlatos(it, t, lang);
          /* s195: la parada pasada dice si se HIZO o se SALTÓ (dia.estados, por ordinal) */
          const estado = pasado ? (plan.estados || {})[ritmoOrdinal(m, it)] || null : null;
          return (
            <button key={i} ref={(el) => { botones.current[i] = el; }} type="button" data-pace-ritmo-parada={it.platos.map((p) => p.clave).join(',')}
              aria-expanded={!pasado && !abierta ? !!(fichaVale && ficha.i === i) : undefined}
              data-pace-ritmo-estado-parada={estado || undefined}
              className={'pace-rt-nodo' + (it.larga ? ' pace-rt-larga' : '') + (pasado ? ' pace-rt-pasado' : ' pace-rt-toca') + (abierta ? ' pace-rt-ahora' : '') + (estado ? ' pace-rt-' + estado : '')}
              style={{ '--c': RITMO_COLOR[it.platos[0].modulo] }}
              title={pasado ? nombres + (estado ? ' · ' + t('ritmo.' + estado) : '') : nombres + ' · ' + t(abierta ? 'ritmo.empieza' : 'ritmo.toca')}
              aria-label={ritmoHora(it.desde) + ' · ' + nombres + (abierta ? ' · ' + t('ritmo.ahora') : '') + (estado ? ' · ' + t('ritmo.' + estado) : '')}
              disabled={pasado}
              onClick={() => abierta ? ritmoEmpezarParada(it) : setFicha((f) => (f && f.i === i ? null : { i, antes: null }))}>
              {abierta ? <span className="pace-rt-ahora-tag">{t('ritmo.ahora')}</span> : null}
              {it.platos.map((p) => <RitmoGlifo key={p.id} modulo={p.modulo} />)}
              <RitmoEtiqueta it={it} final={i === ultimo} t={t} tn={tn} lang={lang} estado={estado} />
            </button>
          );
        })}
        {fichaVale ? <RitmoFicha m={m} ficha={ficha} lin={lin} boton={botones.current[ficha.i]} onCerrar={cerrarFicha} onOtra={otra} /> : null}
      </div>
      <div className="pace-rt-zona" ref={zona} />
    </React.Fragment>
  );
}

/* Móvil: la misma línea, con puntos y sin etiquetas. Mismo AHORA y mismo hecho. */
function RitmoMini({ plan }) {
  const m = plan.m;
  const iActual = ritmoIndiceAhora(plan);
  return (
    <div className="pace-rt-mini" aria-hidden="true">
      {m.items.map((it, i) => {
        if (it.tipo === 'foco' || it.tipo === 'comida' || it.tipo === 'libre' || it.tipo === 'ocupado') {
          const clase = i === iActual ? ' pace-rt-ahora' : i < iActual && it.tipo === 'foco' ? ' pace-rt-hecho' : '';
          return <div key={i} className={'pace-rt-seg pace-rt-' + it.tipo + clase} style={{ flex: it.dur + ' 1 0' }} />;
        }
        if (!it.platos || !it.platos.length) return null;
        const estado = i < iActual ? (plan.estados || {})[ritmoOrdinal(m, it)] || null : null;
        return <span key={i} className={'pace-rt-punto' + (it.larga ? ' pace-rt-larga' : '') + (i === iActual ? ' pace-rt-ahora' : '') + (estado ? ' pace-rt-' + estado : '')} style={{ '--c': RITMO_COLOR[it.platos[0].modulo] }} />;
      })}
    </div>
  );
}

Object.assign(window, { RitmoLinea, RitmoMini, RitmoEtiqueta, RitmoFicha, ritmoColocarEtiquetas, ritmoIndiceAhora, ritmoEmpezarParada, ritmoNombresParadas });
