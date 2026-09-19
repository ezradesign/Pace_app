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

function ritmoResumen(m, tn) {
  return tn(m.pausas === 1 ? 'ritmo.resumen.una' : 'ritmo.resumen',
    { f: ritmoDuracion(m.focoMin), p: m.pausas, v: m.vasos });
}

/* «3 min · Estira · Antídoto a la silla», o la de la pausa larga. */
function ritmoMetaPlato(it, t, tn) {
  if (it.larga) return tn('ritmo.larga.lista', { n: it.dur });
  const p = it.platos[0];
  return p.min + ' min · ' + ritmoModulo(p.modulo, t) + ' · ' + t('ritmo.motivo.' + it.motivo);
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
var RITMO_RANGOS = { inicio: [300, 1260], comida: [660, 1020], salida: [720, 1410] };
function RitmoSelector({ campo, horario }) {
  const { t } = useT();
  let valores = [];
  if (campo === 'comidaDur') valores = [30, 45, 60, 90, 120];
  else for (let v = RITMO_RANGOS[campo][0]; v <= RITMO_RANGOS[campo][1]; v += 30) valores.push(v);
  const actual = horario[campo];
  if (valores.indexOf(actual) === -1) valores = valores.concat([actual]).sort((a, b) => a - b);
  const fmt = (v) => (campo === 'comidaDur' ? (v < 60 ? v + ' min' : ritmoDuracion(v, true)) : ritmoHora(v));
  return (
    <select className="pace-rt-sel" data-pace-ritmo-horario={campo} aria-label={t('ritmo.aria.' + campo)}
      value={actual} onChange={(e) => ritmoHorario(campo, e.target.value)}>
      {valores.map((v) => <option key={v} value={v}>{fmt(v)}</option>)}
    </select>
  );
}

/* COMER O NO (s195b, variante 6C elegida mirándola): la palabra «comes» lleva
   pegado un mini interruptor de 22×12 en tinta. Apagado, la frase pierde el tramo
   de la comida (plantilla «.sin») y la regla no la sirve (`horario.sinComida`). */
function RitmoInterruptorComida({ horario }) {
  const { t } = useT();
  const on = !horario.sinComida;
  return (
    <span className="pace-rt-comes">
      {t(on ? 'ritmo.comes' : 'ritmo.nocomes')}
      <button type="button" role="switch" aria-checked={on} aria-label={t('ritmo.aria.comes')}
        className={'pace-rt-mini-int' + (on ? ' pace-rt-on' : '')} data-pace-ritmo-comes
        onClick={() => ritmoHorario('sinComida', on ? 1 : 0)} />
    </span>
  );
}

function ritmoHuecos(horario) {
  return {
    inicio: <RitmoSelector campo="inicio" horario={horario} />,
    comida: <RitmoSelector campo="comida" horario={horario} />,
    dur: <RitmoSelector campo="comidaDur" horario={horario} />,
    salida: <RitmoSelector campo="salida" horario={horario} />,
    comes: <RitmoInterruptorComida horario={horario} />,
  };
}

Object.assign(window, {
  RITMO_COLOR, RitmoGlifo, RitmoMetaGota, RitmoInterruptorComida, ritmoNombre, ritmoPlatos, ritmoModulo, ritmoResumen, ritmoMetaPlato,
  RitmoFrase, RitmoSelector, ritmoHuecos,
});
