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
   En móvil abre el selector del sistema. */
var RITMO_RANGOS = { inicio: [360, 780], comida: [660, 960], salida: [720, 1320] };
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

function ritmoHuecos(horario) {
  return {
    inicio: <RitmoSelector campo="inicio" horario={horario} />,
    comida: <RitmoSelector campo="comida" horario={horario} />,
    dur: <RitmoSelector campo="comidaDur" horario={horario} />,
    salida: <RitmoSelector campo="salida" horario={horario} />,
  };
}

Object.assign(window, {
  RITMO_COLOR, RitmoGlifo, ritmoNombre, ritmoPlatos, ritmoModulo, ritmoResumen, ritmoMetaPlato,
  RitmoFrase, RitmoSelector, ritmoHuecos,
});
