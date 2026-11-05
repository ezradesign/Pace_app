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

/* Una hora editable DENTRO de la frase: un botón con aspecto de texto que abre su paso a
   paso (RitmoHoraPaso), en la paleta de PACE y diciendo qué hora es.
   RANGOS (s194): el inicio llegaba solo hasta las 13:00 y quien trabaja por la
   tarde no podía decir su hora (lo encontró el usuario a las 17:20). Ahora:
   inicio 5:00–21:00 · comida 11:00–17:00 · salida 12:00–23:30, de media en media
   hora. La regla ya sabe qué hacer con un inicio tras la salida (una hora es una
   hora) y con una comida que no cae en la jornada (no la sirve). */
var RITMO_RANGOS = { inicio: [300, 1260], comida: [660, 1020], salida: [720, 1410],
  /* s197: la media jornada es de mañana O DE TARDE, así que su inicio llega hasta las
     21:00 como el de la entera y su fin hasta la medianoche y media. */
  'media.inicio': [300, 1260], 'media.salida': [360, 1410] };
const { useState: useStateRPz, useEffect: useEffectRPz, useRef: useRefRPz } = React;

/* «media.inicio» / «media.salida» leen dentro de `horario.media` (s197). */
function ritmoHoraDe(horario, campo) {
  return campo.indexOf('media.') === 0 ? ritmoMedia(horario)[campo.slice(6)] : horario[campo];
}
function ritmoHoraTexto(campo, v) {
  return campo === 'comidaDur' ? (v < 60 ? v + ' min' : ritmoDuracion(v, true)) : ritmoHora(v);
}
/* Los pasos, con la hora de ahora aunque no caiga en la media hora. */
function ritmoHoraValores(campo, actual) {
  let valores = [];
  if (campo === 'comidaDur') valores = [30, 45, 60, 90, 120];
  else for (let v = RITMO_RANGOS[campo][0]; v <= RITMO_RANGOS[campo][1]; v += 30) valores.push(v);
  if (valores.indexOf(actual) === -1) valores = valores.concat([actual]).sort((a, b) => a - b);
  return valores;
}

/* `onCambio` (opcional): un borrador que guarda otro, como la semana tipo de la bienvenida,
   que no escribe nada hasta «Comenzar». Sin él, la hora se guarda al momento. */
function RitmoSelector({ campo, horario, onCambio }) {
  const { t } = useT();
  const [abierta, setAbierta] = useStateRPz(false);
  const texto = ritmoHoraTexto(campo, ritmoHoraDe(horario, campo));
  return (
    <React.Fragment>
      <button type="button" className="pace-rt-sel" data-pace-ritmo-horario={campo} aria-haspopup="dialog"
        aria-label={t('ritmo.aria.' + campo) + ', ' + texto} onClick={() => setAbierta(true)}>{texto}</button>
      {abierta ? <RitmoHoraPaso campo={campo} horario={horario} onCambio={onCambio} onClose={() => setAbierta(false)} /> : null}
    </React.Fragment>
  );
}

/* MANTENER PULSADO AVANZA SEGUIDO: de 9:00 a 15:00 no pueden ser doce toques (Ez, 5 nov.
   2026). El primer paso sale al apretar y el resto tras una espera, para que un toque
   normal sea un paso. El `click` solo cuenta si no vino del puntero: es lo que llega del
   teclado y del lector de pantalla, que no aprietan nada. */
var RITMO_PASO_ESPERA = 400, RITMO_PASO_CADENCIA = 110;
function useRitmoSostener(paso) {
  const reloj = useRefRPz(null);
  const apretado = useRefRPz(false);
  const parar = () => clearTimeout(reloj.current);
  useEffectRPz(() => parar, []);
  const soltar = () => { parar(); apretado.current = false; };
  return (d) => ({
    onPointerDown: (e) => {
      if (e.button !== 0) return;
      apretado.current = true;
      paso(d);
      const seguir = () => { paso(d); reloj.current = setTimeout(seguir, RITMO_PASO_CADENCIA); };
      parar();
      reloj.current = setTimeout(seguir, RITMO_PASO_ESPERA);
    },
    onPointerUp: parar, onPointerLeave: soltar, onPointerCancel: soltar,
    onClick: () => { if (!apretado.current) paso(d); apretado.current = false; },
    onContextMenu: (e) => e.preventDefault(),
  });
}

var RITMO_HORA_GRUPO = { inicio: 'ritmo.opcion.jornada', salida: 'ritmo.opcion.jornada', comida: 'ritmo.comida', comidaDur: 'ritmo.comida',
  'media.inicio': 'ritmo.opcion.media', 'media.salida': 'ritmo.opcion.media' };
const RITMO_HORA_CHECK = <svg width="11" height="8" viewBox="0 0 11 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 4.2 3.9 7 10 1" /></svg>;
const ritmoHoraSigno = (mas) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="M3 9h12" />{mas ? <path d="M9 3v12" /> : null}</svg>;

/* Pasada la media jornada, su inicio ofrece «ahora»: el atajo de quien la quiere para ya.
   Solo pone la hora; el día empieza al tocar «Media jornada» (Ez, 4 nov. 2026). No sale en
   un borrador (`onCambio`): «Tu semana» habla de cada semana, no de hoy. Con el fin ya
   pasado, el inicio lo cruza y el fin va detrás (ritmoTramoCon). */
function ritmoHoraYa(campo, horario, onCambio) {
  if (campo !== 'media.inicio' || onCambio) return null;
  const ahora = ritmoAhora();
  return ahora >= ritmoMedia(horario).salida && ahora <= RITMO_RANGOS[campo][1] ? ahora : null;
}

/* TODAS LAS HORAS SE ELIGEN IGUAL (la D de Ez, 5 nov. 2026): «− 9:00 +», una sola hora grande
   en vez de la lista del sistema o una rejilla de 33 botones, con el título de qué hora es,
   cómo está ahora y una salida que no cambia nada. El número es un `spinbutton`: las flechas
   mueven media hora, Av Pág y Re Pág una hora, Inicio y Fin van al tope e Intro guarda.
   Lleva el foco al abrir, pero tras el efecto del `Modal`, que apunta a quién devolvérselo.
   `aria-disabled` y no `disabled` en los extremos: un botón apagado perdería el foco. El
   Modal va en un portal porque `.pace-rt-panel` encierra lo fijo, y en la capa 130 porque
   la bienvenida, donde también se eligen horas, va en la 120. */
function RitmoHoraPaso({ campo, horario, onCambio, onClose }) {
  const { t, tn } = useT();
  const actual = ritmoHoraDe(horario, campo);
  const valores = ritmoHoraValores(campo, actual);
  const [sel, setSel] = useStateRPz(actual);
  /* Con los botones el foco no está en el número, y el lector no diría la hora nueva. */
  const [decirla, setDecirla] = useStateRPz(false);
  const numero = useRefRPz(null);
  useEffectRPz(() => { queueMicrotask(() => numero.current && numero.current.focus({ preventScroll: true })); }, []);
  const texto = (v) => ritmoHoraTexto(campo, v);
  const las = (v) => (campo === 'comidaDur' ? texto(v) : tn('ritmo.hora.las', { h: texto(v) }));
  const guardar = (v) => {
    if (v !== actual) (onCambio ? onCambio(campo, v) : ritmoHorario(campo, v));
    onClose();
  };
  const hasta = (a) => valores[Math.max(0, Math.min(valores.length - 1, a))];
  const paso = (d) => { setDecirla(true); setSel((s) => hasta(valores.indexOf(s) + d)); };
  const sostener = useRitmoSostener(paso);
  const i = valores.indexOf(sel);
  const onKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); guardar(sel); return; }
    const a = { ArrowUp: i + 1, ArrowRight: i + 1, ArrowDown: i - 1, ArrowLeft: i - 1, PageUp: i + 2, PageDown: i - 2, Home: 0, End: valores.length - 1 }[e.key];
    if (a == null) return;
    e.preventDefault();
    setDecirla(false);
    setSel(hasta(a));
  };
  const dura = campo === 'comidaDur';
  const titulo = t('ritmo.hora.titulo.' + campo.replace('media.', ''));
  const tramo = campo.indexOf('media.') === 0 ? ritmoMedia(horario) : horario;
  const sub = campo === 'comida' || dura
    ? tn('ritmo.hora.sub.comida', { h: ritmoHora(horario.comida), d: ritmoDuracion(horario.comidaDur) })
    : tn('ritmo.hora.sub.tramo', { a: ritmoHora(tramo.inicio), b: ritmoHora(tramo.salida) });
  const ya = ritmoHoraYa(campo, horario, onCambio);
  return ReactDOM.createPortal(
    <Modal open onClose={onClose} maxWidth={360} relleno="22px 20px 12px" capa={130} tagLabel={t(RITMO_HORA_GRUPO[campo])} title={titulo} subtitle={sub}>
      {ya != null ? (
        <button type="button" className="pace-rt-paso-ahora" data-pace-ritmo-ahora onClick={() => guardar(ya)}>
          <b>{t('ritmo.hora.ahora')}</b>
          <span>{tn('ritmo.tramo', { a: ritmoHora(ya), b: ritmoHora(ritmoTramoCon(horario, campo, ya)['media.salida']) })}</span>
        </button>
      ) : null}
      <div className="pace-rt-paso">
        <button type="button" className="pace-rt-paso-mas" aria-label={t(dura ? 'ritmo.hora.menos' : 'ritmo.hora.antes')}
          aria-disabled={i <= 0} data-pace-ritmo-menos {...sostener(-1)}>{ritmoHoraSigno(false)}</button>
        <div ref={numero} className={'pace-rt-paso-hora' + (dura ? ' pace-rt-paso-dura' : '')} role="spinbutton" tabIndex={0} aria-label={titulo}
          aria-valuemin={valores[0]} aria-valuemax={valores[valores.length - 1]} aria-valuenow={sel} aria-valuetext={texto(sel)}
          data-pace-ritmo-paso={campo} onKeyDown={onKey}>{texto(sel)}</div>
        <button type="button" className="pace-rt-paso-mas" aria-label={t(dura ? 'ritmo.hora.mas' : 'ritmo.hora.despues')}
          aria-disabled={i >= valores.length - 1} data-pace-ritmo-mas {...sostener(1)}>{ritmoHoraSigno(true)}</button>
      </div>
      <div className="pace-rt-paso-nota" data-pace-ritmo-nota>
        {sel === actual ? <React.Fragment>{RITMO_HORA_CHECK} {t('ritmo.hora.tuya')}</React.Fragment> : tn('ritmo.hora.tenias', { h: las(actual) })}
      </div>
      <span className="pace-rt-paso-oido" aria-live="polite">{decirla ? texto(sel) : ''}</span>
      <div className="pace-rt-paso-pie">
        <button type="button" className="pace-rt-paso-dejar" data-pace-ritmo-dejar onClick={onClose}>{tn('ritmo.hora.dejar', { h: las(actual) })}</button>
        <button type="button" className="pace-rt-tm-comienza" data-pace-ritmo-cambiar style={{ visibility: sel === actual ? 'hidden' : 'visible' }} onClick={() => guardar(sel)}>
          <span className="pace-rt-tm-pildora">{tn('ritmo.hora.cambiar', { h: las(sel) })}</span>
        </button>
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
  RitmoFrase, RitmoSelector, RitmoHoraPaso, ritmoHuecos,
});
