/* PACE · El cuerpo del runner de Mueve y Estira (opción A del runner guiado, elegida por Ez)
   =========================================================================================
   De arriba abajo: el dibujo con su aro de tiempo, el rótulo de la fase, el nombre, la
   instrucción, el número con su etiqueta (y «+15 s» al colocarse o cambiar de lado), la línea de
   abajo y la barra de pasos. El mando de tres botones va en el pie (MoveSessionV1.mando.jsx).

   CADA PIEZA TIENE SU SITIO FIJO EN TODA LA RUTINA. El nombre, la instrucción y la línea de abajo
   son «pilas»: en la misma celda de rejilla van, invisibles, todos los textos que ese hueco puede
   enseñar en la rutina, así que el hueco mide lo que el más largo y nada se mueve al pasar de
   colocarse a trabajar, cambiar de lado o descansar. Antes se reservaba a ojo por tramos de
   altura, y en el móvil de Ez el texto acababa encima de la barra de pasos.

   EL DIBUJO SE LLEVA EL ESPACIO QUE SOBRA. Medidas las pilas, `useV1Glifo` da al círculo el alto
   libre, entre un suelo y un techo por piel. Si ni con el suelo cabe, el cuerpo pasa a «justo»:
   menos aire entre piezas y el número más pequeño. Sin cortes por altura, que eran los que hacían
   que a 701 px se aplicara la maqueta de 714 y no cupiera. */

const { useState: useStateCV, useLayoutEffect: useLayoutEffectCV, useRef: useRefCV } = React;

/* Todos los textos que puede enseñar cada hueco a lo largo de la rutina, sin repetir. */
function v1Reservas(routine, t, tn, tStep, tInstr) {
  const nombres = [], cues = [], colas = [];
  const pon = (lista, v) => { const k = JSON.stringify(v); if (!lista.some(x => JSON.stringify(x) === k)) lista.push(v); };
  routine.steps.forEach((st, i) => {
    pon(nombres, tStep(i, 'name'));
    const setup = tInstr(i, 'setup');
    const action = tInstr(i, 'action');
    if (setup) pon(cues, { lead: null, text: setup });
    if (action) pon(cues, { lead: null, text: action });
    if (action && st.mode === 'perSide') {
      pon(cues, { lead: t('session.sideLeft'), text: action });
      pon(cues, { lead: t('session.sideRight'), text: action });
    }
    const care = st.mode !== 'rest' ? tInstr(i, 'care') : null;
    if (care) pon(colas, { care });
    if (st.mode === 'perSide') {
      pon(colas, { strong: tn('session.sideFirst', { side: t('session.sideLeft') }), support: t('move.placeHint') });
      pon(colas, { strong: tn('session.sideNext', { side: t('session.sideRight') }), support: t('move.sideAutoHint') });
    } else {
      pon(colas, { support: t('move.placeHint') });
    }
    if (st.mode === 'rest' && routine.steps[i + 1]) {
      const luego = tn('move.restNext', { name: tStep(i + 1, 'name') });
      pon(colas, { strong: luego });
      pon(colas, { strong: luego, support: t('move.restReady') });
    }
  });
  return { nombres, cues, colas };
}

function CueV1({ lead, text, accent, ...resto }) {
  return (
    <p {...resto}>
      {lead && <strong style={{ color: accent, fontWeight: 600 }}>{lead}. </strong>}
      {text}
    </p>
  );
}

function ColaV1({ strong, support, care, t, live }) {
  const marca = (attr) => (live ? { [attr]: '' } : {});
  return (
    <div>
      {strong && <div className="pace-v1-fuerte" {...marca('data-pace-v1-support-strong')}>{strong}</div>}
      {support && <div className="pace-v1-apoyo" {...marca('data-pace-v1-support')}>{support}</div>}
      {care !== undefined && (
        <div className="pace-v1-cuidate" {...marca('data-pace-v1-care')}>
          {care && <React.Fragment><span data-pace-v1-care-label>{t('move.careLabel')} · </span>{care}</React.Fragment>}
        </div>
      )}
    </div>
  );
}

/* El alto del círculo: el que queda libre en el cuerpo, entre un suelo y un techo. Se mide con
   las pilas ya puestas, así que una pasada basta; vuelve a medir al cambiar el tamaño de la
   ventana, al cargar las fuentes y al cambiar de rutina o de idioma.

   «quiere» es el círculo que llenaría el hueco, y no depende del círculo que haya pintado:
   por eso sirve para decidir. Al pasar a «justo» se guarda cuánto quería sin él, y la
   primera medida en «justo» dice cuánto gana; solo se sale cuando, quitándole esa ganancia,
   sigue cabiendo. Con un margen fijo (48 px) entraba y salía sin parar donde «justo» ganaba
   más que eso (a 1530x702 ganaba unos 90) y React cortaba la sesión por bucle. */
function useV1Glifo(cuerpoRef, firma) {
  const [glifo, setGlifo] = useStateCV(() => v1GlyphSizeAhora());
  const [justo, setJusto] = useStateCV(false);
  const estado = useRefCV({ glifo, justo, antes: null, gana: 0 });
  estado.current.glifo = glifo;
  estado.current.justo = justo;
  useLayoutEffectCV(() => {
    const cuerpo = cuerpoRef.current;
    if (!cuerpo) return undefined;
    const medir = () => {
      const escritorio = v1EsEscritorio();
      const alto = paceLienzoAlto() || 800;
      const suelo = escritorio ? 110 : 96;
      const techo = Math.min(escritorio ? 250 : 210, Math.round(alto * 0.3));
      const hijos = Array.from(cuerpo.children);
      const cs = getComputedStyle(cuerpo);
      const hueco = parseFloat(cs.rowGap) || 0;
      let ocupado = hueco * Math.max(0, hijos.length - 1) + (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
      hijos.forEach(h => { if (!h.classList.contains('pace-v1-aire')) ocupado += h.offsetHeight; });
      const libre = cuerpo.clientHeight - ocupado;
      const e = estado.current;
      const quiere = e.glifo + libre;
      const nuevo = Math.round(Math.max(suelo, Math.min(techo, quiere)));
      if (Math.abs(nuevo - e.glifo) >= 1) setGlifo(nuevo);
      if (!e.justo) {
        if (quiere < suelo) { e.antes = quiere; setJusto(true); }
      } else {
        if (e.antes !== null) { e.gana = Math.max(0, quiere - e.antes); e.antes = null; }
        if (quiere - e.gana > suelo + 16) setJusto(false);
      }
    };
    medir();
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(medir) : null;
    if (ro) ro.observe(cuerpo);
    window.addEventListener('resize', medir);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(medir).catch(() => {});
    return () => { if (ro) ro.disconnect(); window.removeEventListener('resize', medir); };
  }, [firma, justo]);
  return { glifo, justo };
}

/* El aro alrededor del dibujo: lo que va del ejercicio o del descanso. Empieza arriba y avanza
   en el sentido del reloj. Vacío, el arco no se pinta: con el remate redondo, un arco de
   largo 0 dejaba un punto arriba. */
function AroV1({ fraccion, accent, px }) {
  const f = Math.max(0, Math.min(1, fraccion || 0));
  /* El grosor va en unidades del dibujo (2,5 px a cualquier tamaño). Con un grosor fijo en
     píxeles (vector-effect) el navegador medía también los trazos en píxeles y el arco salía
     a rayas. */
  const grosor = (2.5 * 100 / Math.max(1, px)).toFixed(3);
  return (
    <svg className="pace-v1-aro" data-pace-v1-aro viewBox="0 0 100 100" aria-hidden="true">
      <circle className="pace-v1-aro-pista" cx="50" cy="50" r="48.5" pathLength="100" strokeWidth={grosor} />
      <circle className="pace-v1-aro-arco" cx="50" cy="50" r="48.5" pathLength="100" strokeWidth={grosor}
        style={{ stroke: accent, strokeDasharray: `${(f * 100).toFixed(2)} 100`, opacity: f > 0 ? 1 : 0 }} />
    </svg>
  );
}

function CuerpoV1(p) {
  const { routine, stepIdx, step, side, elapsed, accent, stepAccent, stepAccentSoft, t, tn, tStep, tInstr, lang } = p;
  const cuerpoRef = useRefCV(null);
  const reservas = React.useMemo(() => v1Reservas(routine, t, tn, tStep, tInstr), [routine.id, lang]);
  const { glifo, justo } = useV1Glifo(cuerpoRef, routine.id + ':' + lang);
  const aro = glifo + 14;
  const enTrabajo = p.phase === 'work' && step.mode !== 'rest';
  /* La raíz lleva las medidas (--v1-u y compañía) para el cuerpo Y para la barra de pasos:
     la barra va fuera del cuerpo, y una variable puesta solo en el cuerpo no le llegaba (sus
     márgenes salían a cero y la barra quedaba pegada al mando). */
  return (
    <div data-pace-v1-raiz data-pace-v1-fase={step.mode === 'rest' ? 'rest' : p.phase} className="pace-v1-raiz" style={{ '--v1-acento': stepAccent }}
      {...(justo ? { 'data-pace-v1-justo': '' } : {})}>
      <div ref={cuerpoRef} data-pace-v1-body className="pace-v1">
        <div data-pace-v1-glyph className="pace-v1-glifo" style={{ width: aro, height: aro }}>
          <StepGlyph stepName={step.name} accent={stepAccent} accentSoft={stepAccentSoft} size={glifo} side={v1LadoGlifo(step, p.phase, side)} />
          <AroV1 fraccion={p.fraccion} accent={stepAccent} px={aro} />
        </div>
        <div data-pace-v1-kicker style={{ color: stepAccent }}>{p.kicker || null}</div>
        <div className="pace-v1-pila pace-v1-nombres" data-pace-v1-pila="nombre">
          {reservas.nombres.map((n, i) => <h1 key={'r' + i} className="pace-v1-reserva" aria-hidden="true">{n}</h1>)}
          <h1 data-pace-v1-name>{tStep(stepIdx, 'name')}</h1>
        </div>
        <div className="pace-v1-pila pace-v1-cues" data-pace-v1-pila="cue">
          {reservas.cues.map((c, i) => <CueV1 key={'r' + i} className="pace-v1-reserva" aria-hidden="true" lead={c.lead} text={c.text} accent={stepAccent} />)}
          <CueV1 data-pace-v1-cue lead={p.sideLead} text={p.cueText} accent={stepAccent} />
        </div>
        <div className="pace-v1-aire" />
        <div className="pace-v1-numgrupo">
          {p.gateNumber
            ? <div data-pace-v1-num data-pace-v1-num-gate style={{ color: 'var(--ink-2)' }}>{p.bigNumber}</div>
            : <div data-pace-move-timer data-pace-v1-timer data-pace-v1-num style={{
                color: 'var(--ink)',
                ...(p.repPulseSec ? { animationName: 'pace-rep-pulse', animationDuration: `${p.repPulseSec}s`, animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite', animationPlayState: p.paused ? 'paused' : 'running' } : {}),
              }}>{p.bigNumber}</div>}
          <div className="pace-v1-numfila">
            <span data-pace-v1-numlabel>{p.bigLabel}</span>
            {p.onMas && (
              <button type="button" className="pace-v1-mas" data-pace-v1-mas onClick={(e) => { v1SoltarFoco(e); p.onMas(); }} title={t('session.moreTime')}>
                +{V1_MAS_TIEMPO} s<span className="pace-v1-oculto"> · {t('session.moreTime')}</span>
              </button>
            )}
          </div>
        </div>
        <div className="pace-v1-pila pace-v1-colas" data-pace-v1-pila="cola">
          {reservas.colas.map((c, i) => <div key={'r' + i} className="pace-v1-reserva" aria-hidden="true"><ColaV1 {...c} t={t} /></div>)}
          <div data-pace-v1-cola>
            <ColaV1 strong={p.supportStrong} support={p.support} care={enTrabajo ? (p.careText || '') : undefined} t={t} live />
          </div>
        </div>
        <div className="pace-v1-aire" />
      </div>

      <div data-pace-v1-progress className="pace-v1-pasos">
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', height: 10 }}>
          {routine.steps.map((s, i) => (
            <div key={i} style={{
              flex: v1StepWeight(s),
              height: i === stepIdx ? 6 : 2,
              background: i < stepIdx ? accent : i === stepIdx ? 'var(--line)' : 'var(--paper-3)',
              borderRadius: 2, position: 'relative', overflow: 'hidden', transition: 'height 220ms',
            }}>
              {i === stepIdx && (
                <div style={{ position: 'absolute', inset: 0, width: `${v1StepProgress(step, side, elapsed) * 100}%`, background: accent, transition: 'width 1s linear' }} />
              )}
            </div>
          ))}
        </div>
        <div className="pace-v1-siguiente">
          {routine.steps[stepIdx + 1] ? `${t('move.next.prefix')} ${tStep(stepIdx + 1, 'name')}` : t('move.lastStep')}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CuerpoV1, v1Reservas });
