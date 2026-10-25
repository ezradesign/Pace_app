/* PACE · A tu ritmo · el bloque de la HOME (s192)
   ===============================================
   Va donde iban Actividades y el Camino sugerido (main.jsx), y decide:

     · por libre, o SIN CONTESTAR (Ez, 1A del 22 oct. 2026)
                  → Actividades y la tarjeta corta (RitmoTarjeta), cuyo «Comienza»
                    abre la pregunta. Hasta entonces, sin contestar, la home enseñaba
                    la pregunta entera en lugar de Respira, Estira, Mueve e Hidrátate,
                    y para solo respirar había que declararse por libre. Sin contestar
                    no es por libre: no toca el calendario (state-ritmo.support.jsx);
                  → con la pregunta pedida («Comienza», «Cambiar») o un día elegido,
                    el panel de A tu ritmo.

   EL PANEL HEREDA EL PAPEL DE HORIZONTE DE ACTIVIDADES: lleva
   `data-pace-activitybar`, así que el solapamiento con el aro, el recorte del arco
   y los observadores de `home-geometry.js` le aplican sin tocar su geometría (s156,
   s166, s184). Su rótulo imita el de Actividades y, con menú, lleva DEBAJO «Hasta
   las …» y sube lo que mide esa línea (ronda 4): el panel no se mueve y el nombre
   ocupa el hueco de la fila de ciclo, que el aro oculta sin soltar su sitio.

   LAS KEYS importan: el observador de la geometría vigila los hijos DIRECTOS del
   stack, y por libre devuelve un fragmento cuyos hijos son exactamente los dos
   bloques de siempre, con sus keys de siempre. */

const { useState: useStateRH, useEffect: useEffectRH } = React;

function RitmoVuelta() {
  const { t } = useT();
  return (
    /* EL ENVOLTORIO VA EN inline-flex, y eso es lo que importa: en línea, su caja
       quedaba 1-2 px más baja que «Ver caminos», con el que comparte fila, y el foco
       «subía» al tabular de uno al otro (home-a11y.spec.js lo cazó, WCAG 2.4.3).
       Aislado con mutantes: sin inline-flex es rojo con o sin el estilo del botón.
       El estilo (11 px, tracking 0,1 em) es solo coherencia visual con su vecino. */
    <span data-pace-ritmo style={{ display: 'inline-flex' }}>
      <button className="pace-rt-enlace pace-rt-fuerte" data-pace-ritmo-volver onClick={ritmoVolver}
        style={{ fontSize: 11, padding: '2px 0', letterSpacing: '0.1em', lineHeight: 'normal' }}>
        <span className="pace-rt-solo-esc">{t('ritmo.pregunta') + ' '}</span>{t('ritmo.volver')}
      </button>
    </span>
  );
}

function RitmoHome({ onOpenLibrary, onOpenHydrate }) {
  const [state] = usePace();
  const { tn } = useT();
  const [hoja, setHoja] = useStateRH(false);
  const R = ritmoDe(state);
  const plan = R.libre ? null : ritmoPlan(state);
  const carta = R.libre || (!plan && !R.distinto && !R.pregunta);

  /* El aro mide lo que mide el bloque que toca: al elegir, al cambiar una hora y
     cada vez que un bloque termina (sube `cycle`). Con un bloque en marcha no se
     toca nada (ritmoSincronizar lo comprueba). */
  const firma = plan && plan.actual ? plan.hechos + ':' + plan.actual.dur : '';
  useEffectRH(() => { ritmoSincronizar(); }, [firma, state.focusMode]);
  useEffectRH(() => { if (!plan) setHoja(false); }, [!!plan]);

  if (carta) {
    /* s195b: por libre (y desde la 1A, sin contestar), la tarjeta es la del ritmo
       (RitmoTarjeta), en el sitio y con la cáscara de la del Camino sugerido. */
    return (
      <React.Fragment>
        <ActivityBar key="act" onOpenLibrary={onOpenLibrary} onOpenHydrate={onOpenHydrate} />
        <RitmoTarjeta key="spc" />
      </React.Fragment>
    );
  }

  return (
    <div key="ritmo" data-pace-activitybar data-pace-ritmo style={{ padding: '6px 40px 20px', flexShrink: 0 }}>
      {/* La hora de salida va dentro del aro, bajo «Bloque 1 de 9» (Ez, 3C del 25 oct.), y el
          hueco que tenía aquí se devuelve a la home: es lo que deja bajar el aro sin scroll. */}
      <div data-pace-ritmo-panel>
        {!plan ? <RitmoPregunta state={state} />
          : plan.terminado ? <RitmoHecho plan={plan} />
          : (
            <React.Fragment>
              <RitmoEscritorio state={state} plan={plan} />
              <RitmoMovil state={state} plan={plan} onVer={() => setHoja(true)} />
            </React.Fragment>
          )}
      </div>
      {/* POR PORTAL: este bloque es horizonte (position:relative + z-index:1) y un
          Modal dentro quedaría atrapado en su contexto de apilado. */}
      {hoja && plan ? ReactDOM.createPortal(
        <RitmoHoja open onClose={() => setHoja(false)} plan={plan} state={state} />, document.body) : null}
      <RitmoCalendarioRaiz plan={plan} />
    </div>
  );
}

Object.assign(window, { RitmoHome, RitmoVuelta });
