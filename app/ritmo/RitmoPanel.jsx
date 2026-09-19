/* PACE · A tu ritmo · el PANEL (s192)
   ===================================
   Ocupa el sitio de Actividades y del Camino sugerido (variante A, «el menú
   manda», elegida por el usuario en la ronda 1). Tres estados:

     · LA PREGUNTA — «¿Cuánto trabajas hoy?», la frase del horario con sus cuatro
       horas editables y las cuatro opciones, cada una con su hora de fin.
     · EL MENÚ SERVIDO — escritorio: título + frase + contexto, y la línea del
       día. Móvil: «Ahora» y «Luego» con sus glifos, la línea con puntos y la
       jornada entera en una hoja. s193: con la PAUSA ABIERTA (plan.pausa),
       «Ahora» es la parada y «Luego» el bloque que viene; y hasta que acabe
       el primer bloque del día, una frase dice cómo va la cosa (RitmoComo).
     · LA JORNADA CERRADA — cuando ya no queda bloque.

   Cada estado existe dos veces (escritorio y móvil) y la hoja de estilos elige.
   «Hoy voy por libre» es la única salida: era lo mismo que «Ver la carta» y lo
   explica mejor (ronda 3). */

var RITMO_OPCIONES_UI = ['1h', '2h', 'media', 'jornada'];

function RitmoContexto() {
  const { t } = useT();
  return (
    <div className="pace-rt-ctx">
      <span>{t('ritmo.ctx.mesa')}</span>
      <span>{t('ritmo.ctx.material')}</span>
    </div>
  );
}

/* «Hoy voy por libre» es la ÚNICA salida del menú, y el usuario pidió que destacara más
   (s194). Variante E, elegida mirándola entre cinco: una píldora en verde —el lenguaje de
   los chips de contexto— que en escritorio vive en la CABECERA junto al contexto, no en la
   fila de la línea (allí una píldora pisaba la línea), y en móvil en el pie. */
function RitmoLibre() {
  const { t } = useT();
  return <button className="pace-rt-porlibre" data-pace-ritmo-libre onClick={ritmoPorLibre}>{t('ritmo.libre')}</button>;
}

/* El resumen del día («6 h 10 min de foco · 7 pausas · 8 vasos») con «Cambiar». s195: vive
   en la CABECERA —en la fila del título si el panel es ancho, bajo los chips si no (la
   hoja decide con una container query)— y no sobre la línea: allí compartía banda con la
   etiqueta «AHORA» y se pisaban al final del día (medido en nueve viewports de escritorio). */
function RitmoSobre({ m }) {
  const { t, tn } = useT();
  return (
    <div className="pace-rt-sobre" data-pace-ritmo-resumen>
      <span className="pace-rt-meta">{ritmoResumen(m, tn)}</span>
      <button className="pace-rt-enlace" onClick={ritmoPreguntar}>{t('ritmo.cambiar')}</button>
    </div>
  );
}

function RitmoChips({ state }) {
  const { t, tn } = useT();
  return (
    <div className="pace-rt-chips">
      {RITMO_OPCIONES_UI.map((op) => {
        const m = ritmoMenu(state, op, null, null);
        const vacia = !m || !m.focos.length;
        return (
          <button key={op} type="button" className="pace-rt-chip" data-pace-ritmo-opcion={op}
            disabled={vacia} onClick={() => ritmoElegir(op)}>
            <b>{t('ritmo.opcion.' + op)}</b>
            <span>{vacia ? t('ritmo.fuera') : tn('ritmo.hasta', { h: ritmoHora(m.hasta) })}</span>
          </button>
        );
      })}
    </div>
  );
}

function RitmoPregunta({ state }) {
  const { t } = useT();
  const R = ritmoDe(state);
  const frase = <RitmoFrase plantilla={t(R.horario.sinComida ? 'ritmo.frase.sin' : 'ritmo.frase')} huecos={ritmoHuecos(R.horario)} />;
  return (
    <React.Fragment>
      <div className="pace-rt-panel pace-rt-esc" data-pace-ritmo-estado="pregunta">
        <div className="pace-rt-cab">
          <div>
            <div className="pace-rt-titulo">{t('ritmo.pregunta')}</div>
            <div className="pace-rt-sub">{t('ritmo.sub')}</div>
            <div className="pace-rt-sub pace-rt-frase">{frase}</div>
          </div>
          <div className="pace-rt-der"><RitmoLibre /></div>
        </div>
        <RitmoChips state={state} />
      </div>
      <div className="pace-rt-panel pace-rt-mov" data-pace-ritmo-estado="pregunta">
        <div className="pace-rt-titulo">{t('ritmo.pregunta')}</div>
        <div className="pace-rt-sub pace-rt-frase">{frase}</div>
        <RitmoChips state={state} />
        <div className="pace-rt-pie"><span /><RitmoLibre /></div>
      </div>
    </React.Fragment>
  );
}

/* La frase del menú servido: de [inicio] a [salida] · comida a las [hora] durante
   [dur]. Solo la jornada entera edita la salida; las otras opciones dicen a qué
   hora acaban. Llegando tarde añade «hoy de 10:30 a 17:00» (nunca «tarde»).
   s195: LA COMIDA SOLO SI EL DÍA LA SIRVE. «Una hora» a las 14:30 decía «comida a
   las 16:00 durante 30 min» con sus dos selectores, y el usuario preguntó por qué
   («imagino que lo de comida debería ser en sesiones largas»). La regla ya lo sabe
   (`m.comida` es null cuando ninguna comida cae en el día): la frase lo escucha y
   usa la plantilla «.sin». La comida se sigue editando en «Cambiar». */
function RitmoFraseMenu({ plan, horario, plantilla, capital }) {
  const { t, tn } = useT();
  const m = plan.m;
  const huecos = ritmoHuecos(horario);
  /* s195: UNA HORA, DOS HORAS Y MEDIA JORNADA EMPIEZAN CUANDO EMPIEZAS, así que su
     frase lleva las horas de HOY en texto (desde · hasta) y no el selector del
     horario habitual: con el inicio habitual a las 14:30 y el día empezado a las
     10:23 decía «de 14:30 a 12:50» (captura del usuario). El horario se sigue
     editando en «Cambiar»; la jornada entera conserva sus selectores y su «hoy de». */
  const jornada = m.opcion === 'jornada';
  if (!jornada) { huecos.inicio = ritmoHora(m.desde); huecos.salida = ritmoHora(m.hasta); }
  if (m.comida == null) plantilla = plantilla + '.sin';
  /* `capital`: cuando la frase abre línea (la hoja) y no va tras «Jornada entera ·». */
  let texto = t(plantilla);
  if (capital) texto = texto.charAt(0).toUpperCase() + texto.slice(1);
  return (
    <React.Fragment>
      <RitmoFrase plantilla={texto} huecos={huecos} />
      {jornada && m.tarde ? ' · ' + tn('ritmo.hoy', { desde: ritmoHora(m.desde), hasta: ritmoHora(m.hasta) }) : null}
    </React.Fragment>
  );
}

/* «Cada bloque es un pomodoro en el aro; al acabar, te sirvo la pausa que toca.»
   Solo hasta que acabe el primer bloque del día: después ya lo has visto pasar.
   El usuario la dio por necesaria en s193 (ronda 1). */
function RitmoComo({ plan }) {
  const { t } = useT();
  if (plan.hechos > 0) return null;
  return <div className="pace-rt-sub pace-rt-como" data-pace-ritmo-como>{t('ritmo.como')}</div>;
}

function RitmoEscritorio({ state, plan }) {
  const { t } = useT();
  const R = ritmoDe(state);
  return (
    <div className="pace-rt-panel pace-rt-esc" data-pace-ritmo-estado="menu">
      <div className="pace-rt-cab" style={{ alignItems: 'center' }}>
        <div className="pace-rt-titulo">
          {t('ritmo.opcion.' + plan.m.opcion)}{' '}
          <span className="pace-rt-sub" style={{ display: 'inline' }}>
            {'· '}<RitmoFraseMenu plan={plan} horario={R.horario} plantilla="ritmo.frase.menu" />
          </span>
        </div>
        <div className="pace-rt-der-col">
          <RitmoSobre m={plan.m} />
          <div className="pace-rt-der"><RitmoContexto /><RitmoLibre /></div>
        </div>
      </div>
      <RitmoComo plan={plan} />
      <RitmoLinea plan={plan} />
    </div>
  );
}

function RitmoFila({ rotulo, modulo, nombre, meta, claves }) {
  const { t } = useT();
  return (
    <div className="pace-rt-fila">
      <div className="pace-rt-meta">{rotulo}</div>
      <div className="pace-rt-que">
        <div className="pace-rt-n"><RitmoGlifo modulo={modulo} />{nombre}</div>
        <div className="pace-rt-m">{meta}</div>
      </div>
      {claves
        ? <button type="button" className="pace-rt-otra" data-pace-ritmo-otra onClick={() => ritmoOtra(claves)}>{t('ritmo.otra')}</button>
        : <span />}
    </div>
  );
}

/* La fila de una parada (pausa o comida) con su rótulo («Ahora» o «Luego»). */
function RitmoFilaParada({ it, rotulo }) {
  const { t, tn, lang } = useT();
  const cab = <React.Fragment>{t(rotulo)}<br />{ritmoHora(it.desde)}</React.Fragment>;
  if (it.tipo === 'comida') {
    return <RitmoFila rotulo={cab} modulo="comida" nombre={t('ritmo.comida')} meta={tn('ritmo.comida.lista', { d: ritmoDuracion(it.dur) })} />;
  }
  if (!it.platos || !it.platos.length) return null;
  return <RitmoFila rotulo={cab} modulo={it.platos[0].modulo} nombre={ritmoPlatos(it, t, lang)}
    meta={<RitmoMetaGota texto={ritmoMetaPlato(it, t, tn)} agua={it.agua} />}
    claves={it.platos.map((p) => p.clave)} />;
}

function RitmoMovil({ state, plan, onVer }) {
  const { t, tn } = useT();
  const R = ritmoDe(state);
  const b = plan.actual;
  const descriptor = typeof getFocusDescriptorKey === 'function' ? t(getFocusDescriptorKey(b.dur)) : '';
  /* Con la pausa abierta (s193), «Ahora» es la parada y «Luego» el bloque. */
  const filaBloque = (rotulo) => (
    <RitmoFila rotulo={<React.Fragment>{t(rotulo)}<br />{ritmoHora(b.desde)}</React.Fragment>}
      modulo="foco" nombre={tn('ritmo.fila.bloque', { n: plan.hechos + 1, m: plan.total })}
      meta={b.dur + ' min · ' + descriptor} />
  );
  const luego = ritmoDetras(plan.m, b);
  const filas = plan.pausa
    ? <React.Fragment><RitmoFilaParada it={plan.pausa} rotulo="ritmo.ahora" />{filaBloque('ritmo.luego')}</React.Fragment>
    : <React.Fragment>{filaBloque('ritmo.ahora')}{luego ? <RitmoFilaParada it={luego} rotulo="ritmo.luego" /> : null}</React.Fragment>;
  return (
    <div className="pace-rt-panel pace-rt-mov" data-pace-ritmo-estado="menu">
      <div className="pace-rt-cab">
        <div>
          <div className="pace-rt-titulo">{t('ritmo.opcion.' + plan.m.opcion)}</div>
          <div className="pace-rt-sub pace-rt-frase"><RitmoFraseMenu plan={plan} horario={R.horario} plantilla="ritmo.frase.movil" /></div>
        </div>
        <button className="pace-rt-enlace" onClick={ritmoPreguntar}>{t('ritmo.cambiar')}</button>
      </div>
      <RitmoComo plan={plan} />
      <RitmoMini plan={plan} />
      {filas}
      <div className="pace-rt-pie">
        <button className="pace-rt-enlace pace-rt-fuerte" data-pace-ritmo-ver onClick={onVer}>{t('ritmo.ver')}</button>
        <RitmoLibre />
      </div>
    </div>
  );
}

function RitmoHecho({ plan }) {
  const { t, tn } = useT();
  return (
    <div className="pace-rt-panel" data-pace-ritmo-estado="hecho">
      <div className="pace-rt-cab">
        <div>
          <div className="pace-rt-titulo">{t('ritmo.hecho')}</div>
          <div className="pace-rt-sub">{tn('ritmo.hecho.sub', { f: ritmoDuracion(plan.m.focoMin) })}</div>
        </div>
        <div className="pace-rt-der">
          <button className="pace-rt-enlace" onClick={ritmoPreguntar}>{t('ritmo.cambiar')}</button>
          <RitmoLibre />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  RitmoContexto, RitmoLibre, RitmoSobre, RitmoChips, RitmoPregunta, RitmoFraseMenu, RitmoEscritorio,
  RitmoComo, RitmoFila, RitmoFilaParada, RitmoMovil, RitmoHecho,
});
