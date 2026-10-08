/* PACE · A tu ritmo · LA TARJETA POR LIBRE (s195b)
   ==============================================
   Por libre, la home enseñaba los cuatro chips y la tarjeta del Camino sugerido
   con «¿Cuánto trabajas hoy? Ponle ritmo al día» como un enlace pequeño. El
   usuario: «sustituyendo a la de Caminos, que sea muy visual» — y eligió la
   variante 5A de la ronda 2 (docs/proposals/ideas-s195-r2.html), «pero más
   bonita». Un toque en una loseta sirve el día; «Ajustar el horario» abre la
   pregunta entera; «Ver caminos» abre la biblioteca de Caminos, y solo se pinta
   con `SHOW_CAMINOS` encendida (app/flags.js): hoy los Caminos están ocultos.

   EN EL MÓVIL ES OTRA TARJETA, más corta: con las cuatro losetas en dos filas,
   por libre la home pedía scroll (63 px a 360×730). Ez eligió mirándola en la
   maqueta: la pregunta, el ESQUEMA de la línea del día sin ninguna
   hora (las horas se eligen después), «Tú eliges las horas» y una píldora de
   papel «Comienza» que abre la pregunta entera. «Comienza» y no «Empieza»: arriba
   ya está «Empezar foco». Las dos versiones van en el DOM y la media query del
   corte de móvil elige (la misma que cambia la piel), como el panel. Sin la ceja
   «A TU RITMO» encima (Ez: «no aporta nada»): eran 15 px que la home no tenía a
   360×640. Solo queda esa fila si hay Caminos, para su enlace.

   MISMA CÁSCARA que la tarjeta del Camino, y eso no es pereza: `[data-pace-spc]`
   lo observa el motor de geometría (home-geometry.js) y lo mueve la piel
   (`_responsive.pieles.js`), y `[data-pace-spc-card]` lleva el reflejo de la luz
   (s159: «la luz reaparece por debajo de la tarjeta»). Cambia el contenido, no el
   sitio. Con un Camino en curso no se pinta (PathRunner manda), como antes. */

/* El esquema: una jornada tipo (las paradas de «Jornada entera» con la comida en
   medio), sin horas ni etiquetas. Es un dibujo, no un plan: no lee el estado. Un
   par es una pausa larga y se pinta ancha con el color de su primer plato. */
var RITMO_ESQUEMA = ['estira', 'mueve', ['respira', 'estira'], 'comida', 'estira', 'mueve', ['respira', 'estira'], 'estira', 'respira'];

function RitmoEsquema() {
  return (
    <div className="pace-rt-esquema" aria-hidden="true" data-pace-ritmo-esquema>
      {RITMO_ESQUEMA.map((paso, k) => {
        if (paso === 'comida') return <span key={k} className="pace-rt-esq-comida" />;
        const larga = Array.isArray(paso);
        return (
          <React.Fragment key={k}>
            <span className="pace-rt-esq-seg" />
            <span className={'pace-rt-esq-punto' + (larga ? ' pace-rt-larga' : '')} style={{ '--c': RITMO_COLOR[larga ? paso[0] : paso] }} />
          </React.Fragment>
        );
      })}
    </div>
  );
}

function RitmoTarjeta() {
  const [state] = usePace();
  const { t, tn } = useT();
  if (state.paths && state.paths.current) return null;
  const abrirCaminos = () => window.dispatchEvent(new CustomEvent('pace:open-paths-library'));
  const conCaminos = window.SHOW_CAMINOS !== false;
  return (
    <div data-pace-spc style={{ padding: '0 40px 12px', flexShrink: 0 }}>
      <div data-pace-spc-card data-pace-ritmo-tarjeta className="pace-rt-tarjeta">
        <div className="pace-rt-tj-esc">
          {/* Una sola fila de cabecera: la pregunta a la izquierda, los dos enlaces a la
              derecha. Un pie aparte costaba 34 px de aro a 1536×704 (medido). */}
          <div className="pace-rt-tarjeta-cab">
            <div>
              <div className="pace-rt-tarjeta-t">{t('ritmo.pregunta')}</div>
              <div className="pace-rt-tarjeta-s">{t('ritmo.sub')}</div>
            </div>
            <div className="pace-rt-tarjeta-enlaces">
              <button className="pace-rt-enlace" data-pace-ritmo-ajustar onClick={ritmoVolver}>{t('ritmo.tarjeta.ajustar')}</button>
              {conCaminos && (
                <button className="pace-rt-enlace" data-pace-ritmo-caminos onClick={abrirCaminos}>{t('paths.library.viewAll')}</button>
              )}
            </div>
          </div>
          <div className="pace-rt-losetas">
            {RITMO_OPCIONES_UI.map((op) => {
              const m = ritmoMenu(state, op, null, null);
              const vacia = !m || !m.focos.length;
              return (
                <button key={op} type="button" className="pace-rt-loseta" data-pace-ritmo-loseta={op}
                  disabled={vacia} onClick={() => ritmoElegir(op)}>
                  <b>{t('ritmo.opcion.' + op)}</b>
                  <span>{ritmoSub(op, m, vacia, t, tn)}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="pace-rt-tj-mov" data-pace-ritmo-tarjeta-movil>
          {conCaminos && (
            <div className="pace-rt-tm-cab">
              <button className="pace-rt-enlace" data-pace-ritmo-caminos onClick={abrirCaminos}>{t('paths.library.viewAll')}</button>
            </div>
          )}
          <div className="pace-rt-tm-t">{t('ritmo.pregunta')}</div>
          <RitmoEsquema />
          <div className="pace-rt-tm-pie">
            <span className="pace-rt-tm-nota">{t('ritmo.tarjeta.horas')}</span>
            {/* El botón mide 44 de alto para el dedo; la píldora que se ve, 34. */}
            <button type="button" className="pace-rt-tm-comienza" data-pace-ritmo-comienza onClick={ritmoVolver}>
              <span className="pace-rt-tm-pildora">
                {t('ritmo.tarjeta.comienza')}
                <svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1 5h13" /><path d="M10.5 1.5L14 5l-3.5 3.5" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { RitmoTarjeta, RitmoEsquema, RITMO_ESQUEMA });
