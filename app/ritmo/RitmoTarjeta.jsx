/* PACE · A tu ritmo · LA TARJETA POR LIBRE (s195b)
   ==============================================
   Por libre, la home enseñaba los cuatro chips y la tarjeta del Camino sugerido
   con «¿Cuánto trabajas hoy? Ponle ritmo al día» como un enlace pequeño. El
   usuario: «sustituyendo a la de Caminos, que sea muy visual» — y eligió la
   variante 5A de la ronda 2 (docs/proposals/ideas-s195-r2.html), «pero más
   bonita». Un toque en una loseta sirve el día; «Ajustar el horario» abre la
   pregunta entera; «Ver caminos» sigue abriendo la biblioteca de Caminos, que
   no sale del producto: sale de la home.

   MISMA CÁSCARA que la tarjeta del Camino, y eso no es pereza: `[data-pace-spc]`
   lo observa el motor de geometría (home-geometry.js) y lo mueve la piel
   (`_responsive.pieles.js`), y `[data-pace-spc-card]` lleva el reflejo de la luz
   (s159: «la luz reaparece por debajo de la tarjeta»). Cambia el contenido, no el
   sitio. Con un Camino en curso no se pinta (PathRunner manda), como antes. */

function RitmoTarjeta() {
  const [state] = usePace();
  const { t, tn } = useT();
  if (state.paths && state.paths.current) return null;
  const abrirCaminos = () => window.dispatchEvent(new CustomEvent('pace:open-paths-library'));
  return (
    <div data-pace-spc style={{ padding: '0 40px 12px', flexShrink: 0 }}>
      <div data-pace-spc-card data-pace-ritmo-tarjeta className="pace-rt-tarjeta">
        {/* Una sola fila de cabecera: la pregunta a la izquierda, los dos enlaces a la
            derecha. Un pie aparte costaba 34 px de aro a 1536×704 (medido). */}
        <div className="pace-rt-tarjeta-cab">
          <div>
            <div className="pace-rt-tarjeta-t">{t('ritmo.pregunta')}</div>
            <div className="pace-rt-tarjeta-s">{t('ritmo.sub')}</div>
          </div>
          <div className="pace-rt-tarjeta-enlaces">
            <button className="pace-rt-enlace" data-pace-ritmo-ajustar onClick={ritmoVolver}>{t('ritmo.tarjeta.ajustar')}</button>
            <button className="pace-rt-enlace" data-pace-ritmo-caminos onClick={abrirCaminos}>{t('paths.library.viewAll')}</button>
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
    </div>
  );
}

Object.assign(window, { RitmoTarjeta });
