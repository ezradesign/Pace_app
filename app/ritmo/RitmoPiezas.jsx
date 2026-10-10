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
   la palabra el motivo cabe en una línea también en inglés («Antidote to the chair»). */
function ritmoMetaPlato(it, t, tn, sinModulo) {
  if (it.larga) return tn('ritmo.larga.lista', { n: it.dur });
  const p = it.platos[0];
  return p.min + ' min · ' + (sinModulo ? '' : ritmoModulo(p.modulo, t) + ' · ') + t('ritmo.motivo.' + it.motivo);
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
/* `onCambio` (opcional): un borrador que guarda otro, como la semana tipo de la bienvenida,
   que no escribe nada hasta «Comenzar». Sin él, la hora se guarda al momento. */
function RitmoSelector({ campo, horario, onCambio }) {
  const { t } = useT();
  let valores = [];
  if (campo === 'comidaDur') valores = [30, 45, 60, 90, 120];
  else for (let v = RITMO_RANGOS[campo][0]; v <= RITMO_RANGOS[campo][1]; v += 30) valores.push(v);
  /* «media.inicio» / «media.salida» leen dentro de `horario.media` (s197). */
  const actual = campo.indexOf('media.') === 0 ? ritmoMedia(horario)[campo.slice(6)] : horario[campo];
  if (valores.indexOf(actual) === -1) valores = valores.concat([actual]).sort((a, b) => a - b);
  const fmt = (v) => (campo === 'comidaDur' ? (v < 60 ? v + ' min' : ritmoDuracion(v, true)) : ritmoHora(v));
  return (
    <select className="pace-rt-sel" data-pace-ritmo-horario={campo} aria-label={t('ritmo.aria.' + campo)}
      value={actual} onChange={(e) => (onCambio ? onCambio(campo, Number(e.target.value)) : ritmoHorario(campo, e.target.value))}>
      {valores.map((v) => <option key={v} value={v}>{fmt(v)}</option>)}
    </select>
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
  RitmoFrase, RitmoSelector, ritmoHuecos,
});
