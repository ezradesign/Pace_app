/* PACE · app/ui/LibraryShell.jsx (sesión 174)
   =============================================
   LA PANTALLA DE LAS BIBLIOTECAS DE CUERPO (Mueve y Estira), que son gemelas:
   mismo catálogo de metadatos, mismo eje y misma tarjeta. Respira NO usa esto
   -- se ordena por TIEMPO y no por contexto, así que comparte la tarjeta y no
   la pantalla (decisión s174).

   EL DIAGNÓSTICO NO ERA «SOBRA CONTENIDO», ERA «FALTA FORMA DE DESCARTAR».
   Cada rutina declara `position`, `equipment`, `requiresFloor`, `intensity` y
   `level` desde s115, se pintaban en la tarjeta y no filtraban nada; no había
   filtro ni buscador en toda la app. Medido en s173: Estira ocupaba 4,50
   pantallas de scroll a 360x730. Con la tarjeta NUEVA -- que es más grande--
   baja a 3,50, y con un filtro a 1,59. La tesis es que si la tarjeta tiene que
   crecer para informar, lo paga el FILTRO y no la compresión.

   DÓNDE VIVE EL ESTADO DE FILTRO, que no existía en ninguna biblioteca: aquí,
   en el componente, y NO en `pace.state.v2`. Un filtro es una intención de
   este momento, no una preferencia: persistirlo haría que abrieras la
   biblioteca un martes y te faltaran nueve rutinas por algo que tocaste el
   viernes. Y como el modal NO se desmonta al cerrarse (`Modal` devuelve null
   pero el componente sigue montado), hace falta limpiarlo a mano al cerrar --
   si no, el estado sobrevive a la sesión igual que si estuviera persistido.

   Las reglas puras (umbral, orden, «Para ahora», motivo del grupo vacío) viven
   en `library-rules.js` para poder asertarse sin navegador. */

const { useState: useStateLib, useEffect: useEffectLib, useMemo: useMemoLib } = React;

function LibraryShell({ open, onClose, onStart, groups, tone, title, subtitle, catPrefix }) {
  const { t, tn, lang } = useT();
  const tR = (key, fb) => { if (lang !== 'en') return fb; const v = t(key); return v === key ? fb : v; };
  const [activos, setActivos] = useStateLib([]);
  const [vista, setVista] = useStateLib('catalogo');

  /* El modal se OCULTA, no se desmonta: sin esto el filtro y la vista
     sobreviven al cierre y la próxima apertura arranca a medio filtrar. */
  useEffectLib(() => {
    if (!open) { setActivos([]); setVista('catalogo'); }
  }, [open]);

  const todas = useMemoLib(() => {
    const out = [];
    Object.keys(groups || {}).forEach(k => (groups[k].items || []).forEach(r => out.push(r)));
    return out;
  }, [groups]);

  const umbral = useMemoLib(() => libraryUmbralCorto(todas), [todas]);
  const pasa = useMemoLib(() => {
    const preds = activos.map(k => libraryPredicado(k, umbral));
    return (r) => preds.every(p => p(r));
  }, [activos, umbral]);

  const visibles = todas.filter(pasa);
  /* «Para ahora» se calcula sobre lo VISIBLE y no sobre el catálogo entero: el
     filtro gobierna la pantalla completa, o el bloque de arriba contradiría al
     chip que acabas de tocar. */
  const ahora = libraryParaAhora(visibles, typeof todayISO === 'function' ? todayISO() : '');
  const enAhora = (r) => ahora.indexOf(r) !== -1;

  /* El contador del chip dice cuántas sobrevivirían SI LO AÑADES a lo que ya
     tienes puesto, no cuántas cumplen ese filtro por su cuenta: es la única
     cuenta que responde a la pregunta que te haces antes de tocarlo. */
  const cuenta = (k) => {
    const set = activos.indexOf(k) === -1 ? activos.concat([k]) : activos;
    return libraryFiltrar(todas, set, umbral).length;
  };
  const alterna = (k) => setActivos(a => a.indexOf(k) === -1 ? a.concat([k]) : a.filter(x => x !== k));
  const nombreChip = (k) => k === 'corto' ? tn('lib.filter.short', { n: umbral }) : t('lib.filter.' + k);

  const chips = (
    <div className="pace-lib-chips" role="group" aria-label={t('lib.filter.title')}>
      {LIB_FILTROS.map(k => (
        <button key={k} type="button" className="pace-lib-chip"
          aria-pressed={activos.indexOf(k) !== -1}
          onClick={() => alterna(k)}>
          {nombreChip(k)}<b>{cuenta(k)}</b>
        </button>
      ))}
    </div>
  );

  const tarjetas = (rs) => rs.map(r => (
    <RoutineCard key={r.id} routine={r} color={tone} onClick={() => onStart(r)} />
  ));

  const bloqueAhora = ahora.length > 0 && (
    <section data-pace-lib-now>
      {/* la cabecera SÓLO existe si hay algo debajo: una cabecera que se pinta
          con nada es el fallo que el verify vigila en las familias de logro */}
      <h3 className="pace-lib-now">{t('lib.now')}</h3>
      {tarjetas(ahora)}
    </section>
  );

  const listaGrupos = Object.keys(groups || {}).map(k => {
    const items = libraryOrdenar(groups[k].items || []);
    const vis = items.filter(r => pasa(r) && !enAhora(r));
    const ocultas = items.filter(r => !pasa(r));
    const promovidas = items.filter(r => pasa(r) && enAhora(r));
    /* UN GRUPO VACÍO PORQUE SUS RUTINAS SUBIERON A «PARA AHORA» NO ES UN GRUPO
       VACÍO, y la diferencia importa porque la línea de abajo AFIRMA algo. Si
       de un grupo de tres se esconde una por el filtro y las otras dos suben
       arriba, `ocultas` vale 1 y la línea diría «La de hombros pide suelo» --
       cierto de esa una, y mentira sobre el grupo, que está entero a dos dedos.
       Cuando hay promovidas, el grupo NO se pinta: su contenido se ve arriba.
       Lo destapó calibrar en rojo, no leerlo. */
    if (!vis.length && promovidas.length) return null;
    if (!vis.length && !ocultas.length) return null;
    const label = tR(catPrefix + '.cat.' + k + '.label', groups[k].label);
    return (
      <React.Fragment key={k}>
        <h3 className="pace-lib-grp">{label}</h3>
        {vis.length
          ? tarjetas(vis)
          : (
            <p className="pace-lib-vacio" data-pace-lib-empty={k}>
              {tn('lib.empty.' + libraryMotivoVacio(ocultas) + (ocultas.length === 1 ? '.1' : '.n'),
                 { n: ocultas.length, g: label.toLowerCase() })}{' '}
              <button type="button" className="pace-lib-quitar" onClick={() => setActivos([])}>
                {t('lib.empty.clear')}
              </button>
            </p>
          )}
      </React.Fragment>
    );
  });

  const enlaceTuyas = (
    <button type="button" className="pace-lib-link"
      onClick={() => setVista(v => v === 'tuyas' ? 'catalogo' : 'tuyas')}>
      {vista === 'tuyas' ? t('lib.back') : t('custom.section.title')}
    </button>
  );

  const cabecera = (
    <div className="pace-lib-hd">
      <div className="pace-lib-k">{t('lib.tag')}</div>
      <div className="pace-lib-hd-fila">
        <h2>{title}</h2>
        {enlaceTuyas}
      </div>
      <p className="pace-lib-sub">{subtitle}</p>
    </div>
  );

  const tuyas = typeof CustomRoutinesSection !== 'undefined'
    ? <CustomRoutinesSection onStart={onStart} accent={tone} />
    : null;

  return (
    <Modal open={open} onClose={onClose} maxWidth={1240}>
      <div className="pace-lib" style={{ '--tone': tone }}>
        <div className="pace-lib-cuerpo">
          {/* LATERAL: sólo escritorio (la hoja lo oculta por debajo de 769 px).
              Lleva los filtros en vertical, «Tus rutinas» y «Para ahora», y así
              la rejilla queda de catálogo puro. */}
          <aside className="pace-lib-lateral">
            <p className="pace-lib-lateral-tit">{t('lib.filter.title')}</p>
            {chips}
            {/* «Tus rutinas» NO lleva versalita encima: `CustomRoutinesSection`
                ya trae su propio título en cursiva con el sello Premium, y
                ponerle otro dejaría el nombre dos veces seguidas. */}
            {tuyas}
            {ahora.length > 0 && (
              <React.Fragment>
                <p className="pace-lib-lateral-tit">{t('lib.now')}</p>
                {/* MISMO MARCADOR que la copia de móvil. Las dos existen en el
                    DOM y la hoja apaga la que sobra (s166 quitó el lector de
                    piel en JS a propósito: costaba un re-render de la home en
                    cada cruce del breakpoint). Si sólo una llevara el atributo,
                    cualquier sonda daría CERO en la otra piel sin decir por
                    qué -- pasó cuatro veces midiendo esta sesión. */}
                <div data-pace-lib-now>{tarjetas(ahora)}</div>
              </React.Fragment>
            )}
          </aside>
          <div className="pace-lib-main">
            {cabecera}
            {/* en móvil los chips van bajo la cabecera; en escritorio ya están
                en el lateral y la hoja esconde ESTA copia */}
            <div className="pace-lib-solo-movil">{chips}</div>
            {vista === 'tuyas'
              ? <div className="pace-lib-solo-movil">{tuyas}</div>
              : (
                <React.Fragment>
                  {/* «Para ahora» de móvil va FUERA de la rejilla. Estuvo dentro
                      (como hijo a todo el ancho) y era una verruga: un subárbol
                      OCULTO metido en la rejilla hace que toda consulta a
                      `.pace-lib-rejilla ...` lo encuentre PRIMERO y mida cero.
                      Costó cinco medidas equivocadas en s174 antes de mover el
                      nodo en vez de seguir esquivándolo. Fuera de la rejilla no
                      necesita `grid-column` y no estorba a nadie. */}
                  <div className="pace-lib-solo-movil">{bloqueAhora}</div>
                  <div className="pace-lib-rejilla">{listaGrupos}</div>
                </React.Fragment>
              )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

Object.assign(window, { LibraryShell });
