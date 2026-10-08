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
       el primer bloque del día, una frase dice cómo va la cosa (RitmoComo),
       solo en escritorio: en el móvil eran 39 px que la home no tenía.
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
   fila de la línea (allí una píldora pisaba la línea). En el móvil va como `enlace`: en la
   pregunta, en la fila del título (ver RitmoPregunta), y en el día servido, bajo «Cambiar»
   (RitmoMovil), porque el pie se quitó para que la home no pidiera scroll. */
function RitmoLibre({ enlace }) {
  const { t } = useT();
  return <button className={enlace ? 'pace-rt-enlace pace-rt-fuerte' : 'pace-rt-porlibre'} data-pace-ritmo-libre onClick={ritmoPorLibre}>{t('ritmo.libre')}</button>;
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
      <RitmoAlCalendario />
    </div>
  );
}

/* `editarMedia` (la pregunta del móvil): allí no está la frase de la media jornada, porque
   sus horas se ponen al elegirla; pero pasada su hora el chip se apaga y no se podría
   elegir para moverla a la tarde. Entonces el chip deja de ser botón y enseña sus dos horas
   para cambiarlas en el sitio; en cuanto el tramo vuelve a caber en el día, es un chip más. */
/* `tuyo` (el día ya contestado, RitmoManana.jsx): la opción de tu semana va marcada; se
   sigue eligiendo como las otras. Sin etiqueta «Tu martes»: a 1280 partía el nombre de la
   opción en dos líneas, y el título ya dice «Hoy, como cada martes». */
function RitmoChips({ state, editarMedia, tuyo }) {
  const { t, tn } = useT();
  const horas = editarMedia ? ritmoHuecos(ritmoDe(state).horario) : null;
  return (
    <div className="pace-rt-chips">
      {RITMO_OPCIONES_UI.map((op) => {
        const m = ritmoMenu(state, op, null, null);
        const vacia = !m || !m.focos.length;
        if (horas && op === 'media' && vacia) {
          return (
            <div key={op} className="pace-rt-chip pace-rt-chip-horas" data-pace-ritmo-opcion={op} data-pace-ritmo-media-horas>
              <b>{t('ritmo.opcion.media')}</b>
              <span><RitmoFrase plantilla={t('ritmo.tramo')} huecos={{ a: horas.mediaInicio, b: horas.mediaSalida }} /></span>
            </div>
          );
        }
        return (
          <button key={op} type="button" className={'pace-rt-chip' + (op === tuyo ? ' pace-rt-chip-tuyo' : '')} data-pace-ritmo-opcion={op}
            disabled={vacia} onClick={() => ritmoElegir(op)}>
            <b>{t('ritmo.opcion.' + op)}</b>
            <span>{ritmoSub(op, m, vacia, t, tn)}</span>
          </button>
        );
      })}
    </div>
  );
}

/* EL SUBTÍTULO de un chip o una loseta (s197). Las dos jornadas son HORARIOS —tuyos,
   editables— y lo dicen: «De 9:00 a 13:00». «Una hora» y «Dos horas» siguen con «Hasta
   las…» porque son un rato desde que pulsas, no un tramo. Decisión del usuario: «tienen
   que poder personalizarse, tanto la media jornada como la completa», así que el chip
   enseña TUS horas, no una duración. */
function ritmoSub(op, m, vacia, t, tn) {
  if (vacia) return t('ritmo.fuera');
  if (op === 'media' || op === 'jornada') return tn('ritmo.tramo', { a: ritmoHora(m.desde), b: ritmoHora(m.hasta) });
  return tn('ritmo.hasta', { h: ritmoHora(m.hasta) });
}

function RitmoPregunta({ state }) {
  const { t, tn } = useT();
  const R = ritmoDe(state);
  /* El día ya contestado (RitmoManana.jsx): con tu semana guardada, la pregunta llega con
     la respuesta de siempre para hoy. */
  const H = ritmoHabitual(state);
  const dia = H ? ritmoNombreDia(H.diaSemana, t) : '';
  const huecos = ritmoHuecos(R.horario);
  /* s197 (A1, elegida mirándola): DOS frases. La de arriba es la jornada entera; debajo,
     una segunda corta con las dos horas de la media jornada. Cuesta 22 px de panel en
     escritorio y 21 en móvil —medido— y a cambio se lee de un vistazo cuál es cuál;
     meterlas en una sola dejaba seis selectores y un interruptor en la misma línea. */
  const frase = (
    <React.Fragment>
      <RitmoFrase plantilla={t(R.horario.sinComida ? 'ritmo.frase.sin' : 'ritmo.frase')} huecos={huecos} />
    </React.Fragment>
  );
  const fraseMedia = <RitmoFrase plantilla={t('ritmo.frase.media')} huecos={huecos} />;
  return (
    <React.Fragment>
      <div className="pace-rt-panel pace-rt-esc" data-pace-ritmo-estado="pregunta">
        <div className="pace-rt-cab">
          <div>
            <div className="pace-rt-titulo">{H ? tn('ritmo.manana.titulo', { dia }) : t('ritmo.pregunta')}</div>
            {H ? null : <div className="pace-rt-sub">{t('ritmo.sub')}</div>}
            <div className="pace-rt-sub pace-rt-frase">{frase}</div>
            <div className="pace-rt-sub pace-rt-frase" data-pace-ritmo-frase-media>{fraseMedia}</div>
          </div>
          <div className="pace-rt-der"><RitmoLibre /></div>
        </div>
        {H ? (
          <div className="pace-rt-habitual-fila" data-pace-ritmo-estado="habitual" data-pace-ritmo-habitual={H.opcion}>
            <RitmoChips state={state} tuyo={H.opcion} />
            <RitmoComienzaHabitual />
          </div>
        ) : <RitmoChips state={state} />}
      </div>
      {/* EN EL MÓVIL, SIN PIE Y CON EL HORARIO DIBUJADO (Ez eligió la opción 2 y, de sus tres
          maquetaciones, la B): con el pie y las dos frases la home pedía 28 px de scroll a
          375×667 y 46 a 360×640. «Hoy voy por libre» sube a la fila del título como enlace,
          el horario es una línea del día (RitmoDiaLinea) y las horas de la media jornada se
          ponen al elegirla (RitmoFraseMenu las edita). En escritorio no cambia nada. */}
      {H ? <RitmoMananaMovil h={H} /> : (
        <div className="pace-rt-panel pace-rt-mov pace-rt-preg" data-pace-ritmo-estado="pregunta">
          <div className="pace-rt-mov-cab">
            <div className="pace-rt-titulo">{t('ritmo.pregunta')}</div>
            <RitmoLibre enlace />
          </div>
          <RitmoDiaLinea horario={R.horario} />
          <RitmoChips state={state} editarMedia />
        </div>
      )}
    </React.Fragment>
  );
}

/* EL HORARIO COMO UNA LÍNEA DEL DÍA, en la pregunta del móvil: rima con el esquema de la
   tarjeta por libre. Arriba las horas (los mismos selectores de la frase), en medio la
   línea con sus dos extremos y la comida a trazos, y debajo los rótulos. Las pausas de la
   línea son de muestra: el día de verdad se dibuja al elegir. Nueve celdas en una rejilla
   de tres columnas, fila a fila. Sin comida, el tramo del centro es línea lisa. */
function RitmoDiaLinea({ horario }) {
  const { t } = useT();
  const h = ritmoHuecos(horario);
  const come = !horario.sinComida;
  const pausa = (m) => <i className="pace-rt-dia-pa" style={{ '--c': RITMO_COLOR[m] }} />;
  const tramo = (a, b) => (
    <i className="pace-rt-dia-tramo">
      <i className="pace-rt-dia-seg" />{pausa(a)}<i className="pace-rt-dia-seg" />{pausa(b)}<i className="pace-rt-dia-seg" />
    </i>
  );
  return (
    <div className="pace-rt-dia" data-pace-ritmo-dia>
      <div className="pace-rt-dia-h">{h.inicio}</div>
      <div className="pace-rt-dia-h">{come ? <React.Fragment>{h.comida}<span className="pace-rt-dia-sep" aria-hidden="true">·</span>{h.dur}</React.Fragment> : null}</div>
      <div className="pace-rt-dia-h">{h.salida}</div>
      <div className="pace-rt-dia-via" aria-hidden="true"><i className="pace-rt-dia-pt" />{tramo('estira', 'mueve')}</div>
      <div className="pace-rt-dia-via" aria-hidden="true"><i className={come ? 'pace-rt-dia-comida' : 'pace-rt-dia-seg'} /></div>
      <div className="pace-rt-dia-via" aria-hidden="true">{tramo('estira', 'respira')}<i className="pace-rt-dia-pt" /></div>
      <div className="pace-rt-dia-r" aria-hidden="true">{t('ritmo.dia.empiezas')}</div>
      <div className="pace-rt-dia-r"><RitmoInterruptorComida horario={horario} rotulo /></div>
      <div className="pace-rt-dia-r" aria-hidden="true">{t('ritmo.dia.terminas')}</div>
    </div>
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
  /* s197: la MEDIA JORNADA también es un horario, así que también edita sus horas aquí
     (las suyas, `horario.media`); lo que no tiene nunca es comida. */
  const media = m.opcion === 'media';
  if (media) { huecos.inicio = huecos.mediaInicio; huecos.salida = huecos.mediaSalida; }
  else if (!jornada) { huecos.inicio = ritmoHora(m.desde); huecos.salida = ritmoHora(m.hasta); }
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

/* La fila de una parada (pausa o comida) con su rótulo («Ahora» o «Luego»). `corta`:
   en el móvil, la meta sin el nombre del módulo (ritmoMetaPlato). */
function RitmoFilaParada({ it, rotulo, corta }) {
  const { t, tn, lang } = useT();
  const cab = <React.Fragment>{t(rotulo)}<br />{ritmoHora(it.desde)}</React.Fragment>;
  if (it.tipo === 'comida') {
    return <RitmoFila rotulo={cab} modulo="comida" nombre={t('ritmo.comida')} meta={tn('ritmo.comida.lista', { d: ritmoDuracion(it.dur) })} />;
  }
  if (it.tipo === 'ocupado') {
    return <RitmoFila rotulo={cab} modulo="ocupado" nombre={t('ritmo.ocupado')} meta={ritmoDuracion(it.dur)} />;
  }
  if (!it.platos || !it.platos.length) return null;
  return <RitmoFila rotulo={cab} modulo={it.platos[0].modulo} nombre={ritmoPlatos(it, t, lang)}
    meta={<RitmoMetaGota texto={ritmoMetaPlato(it, t, tn, corta)} agua={it.agua} />}
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
    ? <React.Fragment><RitmoFilaParada it={plan.pausa} rotulo="ritmo.ahora" corta />{filaBloque('ritmo.luego')}</React.Fragment>
    : <React.Fragment>{filaBloque('ritmo.ahora')}{luego ? <RitmoFilaParada it={luego} rotulo="ritmo.luego" corta /> : null}</React.Fragment>;
  return (
    <div className="pace-rt-panel pace-rt-mov" data-pace-ritmo-estado="menu">
      <div className="pace-rt-cab">
        <div>
          <div className="pace-rt-titulo">{t('ritmo.opcion.' + plan.m.opcion)}</div>
          <div className="pace-rt-sub pace-rt-frase"><RitmoFraseMenu plan={plan} horario={R.horario} plantilla="ritmo.frase.movil" /></div>
        </div>
        {/* SIN PIE (Ez eligió la opción B de «la home sin scroll»): a 360×640 el día servido
            pedía hasta 24 px. «Hoy voy por libre» sube bajo «Cambiar» como enlace, «Ver todo»
            va al final de la línea y «Al calendario» vive en esa hoja (RitmoHoja). */}
        <div className="pace-rt-cab-der">
          <button className="pace-rt-enlace" onClick={ritmoPreguntar}>{t('ritmo.cambiar')}</button>
          <RitmoLibre enlace />
        </div>
      </div>
      {/* La línea es un dibujo (aria-hidden); el enlace va a su lado, fuera de ella. */}
      <div className="pace-rt-mini-fila">
        <RitmoMini plan={plan} />
        <button className="pace-rt-enlace pace-rt-fuerte" data-pace-ritmo-ver onClick={onVer}>{t('ritmo.ver')}</button>
      </div>
      {filas}
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
  RitmoContexto, RitmoLibre, RitmoSobre, RitmoChips, RitmoPregunta, RitmoDiaLinea, RitmoFraseMenu, RitmoEscritorio, ritmoSub,
  RitmoComo, RitmoFila, RitmoFilaParada, RitmoMovil, RitmoHecho,
});
