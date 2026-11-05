/* PACE · A tu ritmo · piezas compartidas (s192)
   =============================================
   Lo que usan a la vez el panel, la línea y la lista: el glifo de cada módulo,
   el nombre de una rutina en su idioma, la frase con las horas editables y los
   textos de resumen. */

/* LOS GLIFOS SON LOS DE ACTIVIDADES (AB*, main/ActivityBar.jsx): el menú es su
   cuarto consumidor, tras la home, la pausa y la barra lateral. La comida lleva
   el suyo (ABMeal), dibujado con las mismas reglas, y va en tinta. */
var RITMO_COLOR = {
  estira: 'var(--extra)', mueve: 'var(--move)', respira: 'var(--breathe)', cierre: 'var(--breathe)',
  foco: 'var(--focus)', agua: 'var(--hydrate)', comida: 'var(--ink-2)',
};

function RitmoGlifo({ modulo, className }) {
  const Dibujo = {
    estira: window.ABStretch, mueve: window.ABMove, respira: window.ABBreathe, cierre: window.ABBreathe,
    foco: window.ABFocus, agua: window.ABDrop, comida: window.ABMeal,
  }[modulo];
  return (
    <span className={'pace-rt-g' + (className ? ' ' + className : '')} style={{ '--c': RITMO_COLOR[modulo] }} aria-hidden="true">
      {Dibujo ? <Dibujo /> : null}
    </span>
  );
}

/* Mismo contrato que RoutineCard: en español manda el `name` del dato; en inglés
   se busca la clave y se cae al dato si no existe. */
function ritmoNombre(r, t, lang) {
  if (!r) return '';
  if (lang === 'en') {
    const v = t(r.id + '.name');
    if (v !== r.id + '.name') return v;
  }
  return r.name || r.id;
}

function ritmoPlatos(it, t, lang, sep) {
  return (it.platos || []).map((p) => ritmoNombre(p.rutina, t, lang)).join(sep || ' + ');
}

function ritmoModulo(modulo, t) {
  return t({ estira: 'activity.stretch.label', mueve: 'activity.move.label',
             respira: 'activity.breathe.label', cierre: 'activity.breathe.label' }[modulo] || 'activity.stretch.label');
}

/* La meta de vasos de Ajustes, la misma con la que el plan reparte el agua. */
function ritmoMetaVasos(s) {
  return ((s || {}).water && s.water.goal) || 8;
}

/* El resumen del día: «6 h 10 min de foco · 7 pausas · 6 de 8 vasos». Los vasos son las
   paradas de agua que el plan reparte (nunca más que la meta: el cupo de `ritmo.regla.js`),
   dichas frente a tu meta de Ajustes (Ez, 9 oct. 2026: que la home cambie cuando cambias
   la meta). «6 de TUS 8 vasos» partía el título del día en dos líneas de 1536 px de ancho
   para arriba (medido en nueve pantallas); «6 de 8» deja la cabecera como estaba. */
function ritmoResumen(m, tn, meta) {
  const vasos = tn('ritmo.vasos', { v: m.vasos, m: meta || m.vasos });
  return tn(m.pausas === 1 ? 'ritmo.resumen.una' : 'ritmo.resumen', { f: ritmoDuracion(m.focoMin), p: m.pausas, v: vasos });
}

/* «3 min · Estira · Antídoto a la silla», o la de la pausa larga. `sinModulo` (las
   filas del móvil): el glifo de la fila ya dice si es Estira, Mueve o Respira, y sin
   la palabra el motivo cabe en una línea también en inglés («Antidote to the chair»).
   El motivo es la frase de las series si la parada la tiene («Caderas: sin mover hoy»,
   Ez, 15 oct. 2026; state-ritmo.series.jsx). */
function ritmoMetaPlato(it, t, tn, sinModulo) {
  if (it.larga) return tn('ritmo.larga.lista', { n: it.dur });
  const p = it.platos[0];
  const frase = typeof ritmoFrase === 'function' ? ritmoFrase(it, t, tn) : null;
  return p.min + ' min · ' + (sinModulo ? '' : ritmoModulo(p.modulo, t) + ' · ') + (frase || t('ritmo.motivo.' + it.motivo));
}

/* Un texto con la GOTA del vaso pegada a su última palabra. Un inline-grid es un
   «átomo» para el partido de líneas: puede saltar solo aunque no haya espacio
   delante (a 360 px, «Para cerrar la jornada» cabía justo y la gota caía sola
   en la línea de abajo, medido en la auditoría de s195; el word joiner no lo
   evita en Chromium). La última palabra y la gota van en un nowrap. */
function RitmoMetaGota({ texto, agua }) {
  if (!agua) return <React.Fragment>{texto}</React.Fragment>;
  const s = String(texto);
  const corte = s.lastIndexOf(' ');
  const antes = corte < 0 ? '' : s.slice(0, corte + 1);
  const ultima = corte < 0 ? s : s.slice(corte + 1);
  return (
    <React.Fragment>
      {antes}<span style={{ whiteSpace: 'nowrap' }}>{ultima}<RitmoGlifo modulo="agua" className="pace-rt-gota" /></span>
    </React.Fragment>
  );
}

/* La frase con {marcadores}: cada marcador se cambia por su nodo. */
function RitmoFrase({ plantilla, huecos }) {
  const partes = String(plantilla).split(/\{(\w+)\}/);
  return (
    <React.Fragment>
      {partes.map((p, i) => (i % 2
        ? <React.Fragment key={i}>{huecos[p] != null ? huecos[p] : ''}</React.Fragment>
        : <React.Fragment key={i}>{p}</React.Fragment>))}
    </React.Fragment>
  );
}

/* Una hora editable DENTRO de la frase: un <select> nativo con aspecto de texto.
   En móvil abre el selector del sistema.
   RANGOS (s194): el inicio llegaba solo hasta las 13:00 y quien trabaja por la
   tarde no podía decir su hora (lo encontró el usuario a las 17:20). Ahora:
   inicio 5:00–21:00 · comida 11:00–17:00 · salida 12:00–23:30, de media en media
   hora. La regla ya sabe qué hacer con un inicio tras la salida (una hora es una
   hora) y con una comida que no cae en la jornada (no la sirve). */
var RITMO_RANGOS = { inicio: [300, 1260], comida: [660, 1020], salida: [720, 1410],
  /* s197: la media jornada es de mañana O DE TARDE, así que su inicio llega hasta las
     21:00 como el de la entera y su fin hasta la medianoche y media. */
  'media.inicio': [300, 1260], 'media.salida': [360, 1410] };
const { useState: useStateRPz } = React;

/* «media.inicio» / «media.salida» leen dentro de `horario.media` (s197). */
function ritmoHoraDe(horario, campo) {
  return campo.indexOf('media.') === 0 ? ritmoMedia(horario)[campo.slice(6)] : horario[campo];
}
function ritmoHoraTexto(campo, v) {
  return campo === 'comidaDur' ? (v < 60 ? v + ' min' : ritmoDuracion(v, true)) : ritmoHora(v);
}
/* Las horas que se eligen, con la de ahora aunque no caiga en la media hora. */
function ritmoHoraValores(campo, actual) {
  let valores = [];
  if (campo === 'comidaDur') valores = [30, 45, 60, 90, 120];
  else for (let v = RITMO_RANGOS[campo][0]; v <= RITMO_RANGOS[campo][1]; v += 30) valores.push(v);
  if (actual != null && valores.indexOf(actual) === -1) valores = valores.concat([actual]).sort((a, b) => a - b);
  return valores;
}

/* `onCambio` (opcional): un borrador que guarda otro, como la semana tipo de la bienvenida,
   que no escribe nada hasta «Comenzar». Sin él, la hora se guarda al momento. */
function RitmoSelector({ campo, horario, onCambio }) {
  const { t } = useT();
  const [abierta, setAbierta] = useStateRPz(false);
  const texto = ritmoHoraTexto(campo, ritmoHoraDe(horario, campo));
  const forma = window.__MAQ && window.__MAQ.forma;
  const Lista = forma === 'B' ? RitmoHorarioHoja : 'DEF'.indexOf(forma || 'x') >= 0 ? RitmoHoraMaq : RitmoHoraLista;
  return (
    <React.Fragment>
      <button type="button" className="pace-rt-sel" data-pace-ritmo-horario={campo} aria-haspopup="dialog"
        aria-label={t('ritmo.aria.' + campo) + ', ' + texto} onClick={() => setAbierta(true)}>{texto}</button>
      {abierta ? <Lista campo={campo} horario={horario} onCambio={onCambio} onClose={() => setAbierta(false)} /> : null}
    </React.Fragment>
  );
}

var RITMO_HORA_GRUPO = { inicio: 'ritmo.opcion.jornada', salida: 'ritmo.opcion.jornada', comida: 'ritmo.comida', comidaDur: 'ritmo.comida',
  'media.inicio': 'ritmo.opcion.media', 'media.salida': 'ritmo.opcion.media' };

function RitmoHoraLista({ campo, horario, onCambio, onClose }) {
  const { t, tn } = useT();
  const actual = ritmoHoraDe(horario, campo);
  const tramo = campo.indexOf('media.') === 0 ? ritmoMedia(horario) : horario;
  const titulo = t('ritmo.hora.titulo.' + campo.replace('media.', ''));
  const sub = campo === 'comida' || campo === 'comidaDur'
    ? tn('ritmo.hora.sub.comida', { h: ritmoHora(horario.comida), d: ritmoDuracion(horario.comidaDur) })
    : tn('ritmo.inicio.sub', { a: ritmoHora(tramo.inicio), b: ritmoHora(tramo.salida) });
  const elegir = (v) => {
    if (v !== actual) (onCambio ? onCambio(campo, v) : ritmoHorario(campo, v));
    onClose();
  };
  const pistas = window.__MAQ && window.__MAQ.forma === 'C';
  const texto = ritmoHoraTexto(campo, actual);
  return ReactDOM.createPortal(
    <Modal open onClose={onClose} maxWidth={360} relleno={pistas ? '22px 20px 12px' : '22px 20px 24px'} tagLabel={t(RITMO_HORA_GRUPO[campo])} title={titulo} subtitle={sub}>
      <div className="pace-rt-horas" role="radiogroup" aria-label={titulo} data-pace-ritmo-hora-lista={campo}>
        {ritmoHoraValores(campo, actual).map((v) => (
          <button key={v} type="button" role="radio" aria-checked={v === actual} className="pace-rt-hora"
            data-pace-ritmo-hora={v} onClick={() => elegir(v)}>
            {pistas && v === actual ? (
              <svg className="pace-rt-hora-check" width="11" height="8" viewBox="0 0 11 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 4.2 3.9 7 10 1" /></svg>
            ) : null}
            {ritmoHoraTexto(campo, v)}
          </button>
        ))}
      </div>
      {pistas ? (
        <div className="pace-rt-horas-pie">
          <button type="button" className="pace-rt-horas-dejar" onClick={onClose}>{(campo === 'comidaDur' ? 'Dejar ' : 'Dejar las ') + texto}</button>
        </div>
      ) : null}
    </Modal>,
    document.body
  );
}

/* MAQUETA D, E y F: menos botones. */
function ritmoMaqCab(campo, horario, t, tn) {
  const tramo = campo.indexOf('media.') === 0 ? ritmoMedia(horario) : horario;
  return {
    tag: t(RITMO_HORA_GRUPO[campo]), titulo: t('ritmo.hora.titulo.' + campo.replace('media.', '')),
    sub: campo === 'comida' || campo === 'comidaDur'
      ? tn('ritmo.hora.sub.comida', { h: ritmoHora(horario.comida), d: ritmoDuracion(horario.comidaDur) })
      : tn('ritmo.inicio.sub', { a: ritmoHora(tramo.inicio), b: ritmoHora(tramo.salida) }),
  };
}
const RITMO_MAQ_CHECK = <svg className="pace-rt-hora-check" width="11" height="8" viewBox="0 0 11 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 4.2 3.9 7 10 1" /></svg>;

function RitmoRuedaMaq({ valores, actual, sel, setSel, texto, etiqueta }) {
  const ref = React.useRef(null);
  const ALTO = 40;
  React.useLayoutEffect(() => { ref.current.scrollTop = valores.indexOf(sel) * ALTO; }, []);
  const onScroll = () => {
    const i = Math.max(0, Math.min(valores.length - 1, Math.round(ref.current.scrollTop / ALTO)));
    if (valores[i] !== sel) setSel(valores[i]);
  };
  const ir = (i) => ref.current.scrollTo({ top: i * ALTO, behavior: 'smooth' });
  const onKey = (e) => {
    const i = valores.indexOf(sel);
    if (e.key === 'ArrowDown') { e.preventDefault(); ir(Math.min(valores.length - 1, i + 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); ir(Math.max(0, i - 1)); }
  };
  return (
    <div className="maq-rueda">
      <div className="maq-rueda-banda" aria-hidden="true" />
      <div ref={ref} className="maq-rueda-lista" role="listbox" tabIndex={0} aria-label={etiqueta} onScroll={onScroll} onKeyDown={onKey} data-maq-rueda>
        {valores.map((v, i) => (
          <div key={v} role="option" aria-selected={v === sel} className={'maq-rueda-item' + (v === sel ? ' maq-sel' : '')}
            data-pace-ritmo-hora={v} onClick={() => ir(i)}>{v === actual ? RITMO_MAQ_CHECK : null}{texto(v)}</div>
        ))}
      </div>
    </div>
  );
}

function RitmoHoraMaq({ campo, horario, onCambio, onClose }) {
  const { t, tn } = useT();
  const forma = window.__MAQ.forma;
  const cab = ritmoMaqCab(campo, horario, t, tn);
  const actual = ritmoHoraDe(horario, campo);
  const valores = ritmoHoraValores(campo, actual);
  const [sel, setSel] = useStateRPz(actual);
  const [toda, setToda] = useStateRPz(false);
  const texto = (v) => ritmoHoraTexto(campo, v);
  const las = (v) => (campo === 'comidaDur' ? '' : 'las ') + texto(v);
  const guardar = (v) => { if (v !== actual) (onCambio ? onCambio(campo, v) : ritmoHorario(campo, v)); onClose(); };
  const ahora = ritmoAhora();
  const desde = campo === 'media.inicio' && ahora > ritmoMedia(horario).salida && ahora <= RITMO_RANGOS['media.inicio'][1] ? ahora : null;
  const ya = desde != null ? (
    <button type="button" className="maq-ahora" onClick={() => guardar(desde)}>
      <b>Desde ahora</b><span>{ritmoHora(desde)} a {ritmoHora(desde + ritmoMedia(horario).salida - ritmoMedia(horario).inicio)}</span>
    </button>
  ) : null;
  const pie = (cambiar) => (
    <div className={'maq-pie' + (cambiar ? '' : ' maq-pie-solo')}>
      <button type="button" className="pace-rt-horas-dejar" onClick={onClose}>{'Dejar ' + las(actual)}</button>
      {cambiar ? (
        <button type="button" className="pace-rt-tm-comienza" style={{ visibility: sel === actual ? 'hidden' : 'visible' }} onClick={() => guardar(sel)}>
          <span className="pace-rt-tm-pildora">{'Cambiar a ' + las(sel)}</span>
        </button>
      ) : null}
    </div>
  );
  const boton = (v) => (
    <button key={v} type="button" role="radio" aria-checked={v === actual} className="pace-rt-hora" data-pace-ritmo-hora={v} onClick={() => guardar(v)}>
      {v === actual ? RITMO_MAQ_CHECK : null}{texto(v)}
    </button>
  );
  let cuerpo;
  if (forma === 'D') {
    const i = valores.indexOf(sel);
    const signo = (d) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="M3 9h12" />{d ? <path d="M9 3v12" /> : null}</svg>;
    cuerpo = (
      <React.Fragment>
        {ya}
        <div className="maq-paso">
          <button type="button" className="maq-mas" aria-label="Media hora antes" disabled={i <= 0} onClick={() => setSel(valores[i - 1])} data-maq-menos>{signo(false)}</button>
          <div className="maq-paso-hora" aria-live="polite">{texto(sel)}</div>
          <button type="button" className="maq-mas" aria-label="Media hora después" disabled={i >= valores.length - 1} onClick={() => setSel(valores[i + 1])} data-maq-mas>{signo(true)}</button>
        </div>
        <div className="maq-paso-nota">{sel === actual ? <React.Fragment>{RITMO_MAQ_CHECK} La que tienes</React.Fragment> : 'Tenías ' + las(actual)}</div>
        {pie(true)}
      </React.Fragment>
    );
  } else if (forma === 'E') {
    cuerpo = (
      <React.Fragment>
        {ya}
        <RitmoRuedaMaq valores={valores} actual={actual} sel={sel} setSel={setSel} texto={texto} etiqueta={cab.titulo} />
        {pie(true)}
      </React.Fragment>
    );
  } else {
    let a = Math.max(0, valores.indexOf(actual) - 2);
    const b = Math.min(valores.length, a + 5);
    a = Math.max(0, b - 5);
    const cerca = campo === 'comidaDur' ? valores : valores.slice(a, b);
    cuerpo = (
      <React.Fragment>
        {ya}
        <div className={'pace-rt-horas' + (toda ? '' : ' maq-cerca')} role="radiogroup" aria-label={cab.titulo}>{(toda ? valores : cerca).map(boton)}</div>
        {!toda && cerca.length < valores.length ? <button type="button" className="maq-otra" onClick={() => setToda(true)} data-maq-otra>Otra hora…</button> : null}
        {pie(false)}
      </React.Fragment>
    );
  }
  return ReactDOM.createPortal(
    <Modal open onClose={onClose} maxWidth={360} relleno="22px 20px 12px" tagLabel={cab.tag} title={cab.titulo} subtitle={cab.sub}>{cuerpo}</Modal>,
    document.body
  );
}

/* MAQUETA B: una sola hoja con todas las horas; elegir no cierra. */
var RITMO_HOJA_FILAS = [
  ['ritmo.opcion.jornada', [['inicio', 'Empieza'], ['salida', 'Termina']]],
  ['ritmo.comida', [['comida', 'A las'], ['comidaDur', 'Dura']]],
  ['ritmo.opcion.media', [['media.inicio', 'Empieza'], ['media.salida', 'Termina']]],
];
function RitmoHorarioHoja({ campo, horario, onCambio, onClose }) {
  const { t } = useT();
  const [elegido, setElegido] = useStateRPz(campo);
  const actual = ritmoHoraDe(horario, elegido);
  const elegir = (v) => { if (v !== actual) (onCambio ? onCambio(elegido, v) : ritmoHorario(elegido, v)); };
  return ReactDOM.createPortal(
    <Modal open onClose={onClose} maxWidth={400} relleno="22px 20px 20px" tagLabel={t('ritmo.nombre')} title="Tu horario"
      subtitle="Toca qué cambiar y elige su hora.">
      <div className="maq-hoja-filas">
        {RITMO_HOJA_FILAS.filter((f) => !(horario.sinComida && f[0] === 'ritmo.comida')).map(([grupo, campos]) => (
          <div key={grupo} className="maq-hoja-fila">
            <span className="maq-hoja-grupo">{t(grupo)}</span>
            {campos.map(([c, rotulo]) => (
              <button key={c} type="button" aria-pressed={c === elegido} className="maq-hoja-campo" data-maq-campo={c} onClick={() => setElegido(c)}>
                <span>{rotulo}</span><b>{ritmoHoraTexto(c, ritmoHoraDe(horario, c))}</b>
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="pace-rt-horas maq-hoja-horas" role="radiogroup">
        {ritmoHoraValores(elegido, actual).map((v) => (
          <button key={elegido + v} type="button" role="radio" aria-checked={v === actual} className="pace-rt-hora"
            data-pace-ritmo-hora={v} onClick={() => elegir(v)}>{ritmoHoraTexto(elegido, v)}</button>
        ))}
      </div>
      <div className="maq-hoja-pie">
        <button type="button" className="pace-rt-tm-comienza" onClick={onClose}><span className="pace-rt-tm-pildora">Hecho</span></button>
      </div>
    </Modal>,
    document.body
  );
}

/* COMER O NO (s195b, variante 6C elegida mirándola): la palabra «comes» lleva
   pegado un mini interruptor de 22×12 en tinta. Apagado, la frase pierde el tramo
   de la comida (plantilla «.sin») y la regla no la sirve (`horario.sinComida`). */
function RitmoInterruptorComida({ horario, rotulo }) {
  const { t } = useT();
  const on = !horario.sinComida;
  /* `rotulo`: en la línea del día del móvil (RitmoDiaLinea) la palabra va en versalita
     pequeña y el interruptor solo era poco blanco para el dedo, así que palabra e
     interruptor son UN botón. Sin aria-label: su nombre es la palabra que se ve, y quien
     maneja el móvil con la voz dice «toca comes» (WCAG 2.5.3). */
  if (rotulo) {
    return (
      <button type="button" role="switch" aria-checked={on}
        className="pace-rt-dia-comes" data-pace-ritmo-comes onClick={() => ritmoHorario('sinComida', on ? 1 : 0)}>
        {t(on ? 'ritmo.comes' : 'ritmo.nocomes')}
        <i className={'pace-rt-mini-int' + (on ? ' pace-rt-on' : '')} aria-hidden="true" />
      </button>
    );
  }
  return (
    <span className="pace-rt-comes">
      {t(on ? 'ritmo.comes' : 'ritmo.nocomes')}
      <button type="button" role="switch" aria-checked={on} aria-label={t('ritmo.aria.comes')}
        className={'pace-rt-mini-int' + (on ? ' pace-rt-on' : '')} data-pace-ritmo-comes
        onClick={() => ritmoHorario('sinComida', on ? 1 : 0)} />
    </span>
  );
}

function ritmoHuecos(horario, onCambio) {
  return {
    inicio: <RitmoSelector campo="inicio" horario={horario} onCambio={onCambio} />,
    comida: <RitmoSelector campo="comida" horario={horario} onCambio={onCambio} />,
    dur: <RitmoSelector campo="comidaDur" horario={horario} onCambio={onCambio} />,
    salida: <RitmoSelector campo="salida" horario={horario} onCambio={onCambio} />,
    comes: <RitmoInterruptorComida horario={horario} />,
    mediaInicio: <RitmoSelector campo="media.inicio" horario={horario} onCambio={onCambio} />,
    mediaSalida: <RitmoSelector campo="media.salida" horario={horario} onCambio={onCambio} />,
  };
}

Object.assign(window, {
  RITMO_COLOR, RitmoGlifo, RitmoMetaGota, RitmoInterruptorComida, ritmoNombre, ritmoPlatos, ritmoModulo, ritmoResumen, ritmoMetaVasos, ritmoMetaPlato,
  RitmoFrase, RitmoSelector, RitmoHoraLista, RitmoHorarioHoja, ritmoHuecos,
});
