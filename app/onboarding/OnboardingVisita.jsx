/* PACE · OnboardingVisita.jsx — LA VISITA GUIADA POR LA HOME
   ============================================================
   Ez eligió la 1C el 27 oct. 2026 (https://claude.ai/artifact/6p1BHbVqSrgtwnJgrXWLka):
   al cerrar la bienvenida, cuatro paradas sobre la home de verdad, con «Siguiente» y
   «Saltar la visita». La bienvenida no contaba que el aro se toca para empezar, que al
   acabar PACE propone una pausa, ni qué hace «A tu ritmo» con la semana.

     1. El aro         y, de la B (la pista de la home), que al acabar llega una pausa.
     2. Actividades    Respira, Estira, Mueve e Hidrátate.
     3. Tu día         la tarjeta o el panel de «A tu ritmo».
     4. Ajustes        y que desde allí se repite la visita («Visita guiada ›»).

   Una parada cuyo sitio no se ve al empezar (con un día elegido, Actividades no está
   en la home) se salta, y la cuenta «1 de N» sale de las que quedan.

   MECÁNICA: se abre con `pace:open-visita` (la bienvenida al cerrarse, y Ajustes). No
   guarda nada: quien la salta o cierra la app a medias la tiene en Ajustes. Es un
   diálogo de verdad (`usePaceDialogo`): el foco entra, Tab da la vuelta, y Escape o el
   Atrás de Android la cierran, como «Saltar la visita». Un velo tapa la home y deja ver
   lo que enseña por un hueco con su borde, que en oscuro es lo que lo hace destacar: en
   la maqueta el velo no se pintó y en oscuro no se distinguía nada. Mientras dura, la
   home no recibe toques (el velo los coge) ni atajos (main.jsx los calla con un
   `aria-modal` delante). */

const { useState: useStateVIS, useEffect: useEffectVIS, useLayoutEffect: useLayoutEffectVIS, useRef: useRefVIS } = React;

const PACE_VISITA_PARADAS = [
  { id: 'aro', sel: '[data-pace-dial-ring]', redonda: true },
  { id: 'act', sel: '[data-pace-activitybar-grid]' },
  { id: 'dia', sel: '[data-pace-ritmo-tarjeta], [data-pace-ritmo-panel]' },
  { id: 'ajustes', sel: '[data-pace-topbar-ajustes]', redonda: true },
];

/* El primero que se ve de los que casan: en la home hay piezas montadas y escondidas por piel.
   Las medidas van en px del lienzo (`paceCaja`, main/_lienzo.js): con la app crecida en una
   pantalla grande, las de la ventana no casan con las de los estilos. */
function paceVisitaElemento(sel) {
  const candidatos = document.querySelectorAll(sel);
  for (let ic = 0; ic < candidatos.length; ic++) {
    const r = paceCaja(candidatos[ic]);
    if (r.width > 0 && r.height > 0) return candidatos[ic];
  }
  return null;
}

/* El hueco: un círculo para el aro y el botón de Ajustes, un rectángulo con aire para el resto. */
function paceVisitaHueco(parada) {
  const el = parada && paceVisitaElemento(parada.sel);
  if (!el) return null;
  const r = paceCaja(el);
  if (parada.redonda) {
    const d = Math.max(r.width, r.height) + 12;
    return { left: r.left + r.width / 2 - d / 2, top: r.top + r.height / 2 - d / 2, width: d, height: d, radio: d / 2 };
  }
  return { left: r.left - 6, top: r.top - 6, width: r.width + 12, height: r.height + 12, radio: 16 };
}

/* Dónde va la tarjeta: debajo del hueco si cabe, si no encima, si no al lado (en el
   ordenador), y si nada cabe, contra el borde de abajo. Siempre a 16 px de los bordes. */
function paceVisitaSitio(h, ancho, alto, vw, vh) {
  const M = 16, G = 14;
  const encaja = (top) => Math.max(M, Math.min(vh - M - alto, top));
  const centroX = h ? h.left + h.width / 2 : vw / 2;
  const left = Math.max(M, Math.min(vw - M - ancho, centroX - ancho / 2));
  if (!h) return { left, top: encaja((vh - alto) / 2) };
  if (h.top + h.height + G + alto <= vh - M) return { left, top: h.top + h.height + G };
  if (h.top - G - alto >= M) return { left, top: h.top - G - alto };
  const medio = h.top + h.height / 2 - alto / 2;
  if (h.left + h.width + G + ancho <= vw - M) return { left: h.left + h.width + G, top: encaja(medio) };
  if (h.left - G - ancho >= M) return { left: h.left - G - ancho, top: encaja(medio) };
  return { left, top: vh - M - alto };
}

function OnbVisita() {
  const { t, tn } = useT();
  const [abierta, setAbierta] = useStateVIS(false);
  const [paradas, setParadas] = useStateVIS([]);
  const [paso, setPaso] = useStateVIS(0);
  const [hueco, setHueco] = useStateVIS(null);
  const [sitio, setSitio] = useStateVIS(null);
  const raizRef = useRefVIS(null);
  const tarjetaRef = useRefVIS(null);

  useEffectVIS(() => {
    let espera = null;
    const abrir = () => {
      clearTimeout(espera);
      /* Un respiro para que la home termine de pintarse detrás de la bienvenida o de Ajustes. */
      espera = setTimeout(() => {
        const visibles = PACE_VISITA_PARADAS.filter((p) => paceVisitaElemento(p.sel));
        if (!visibles.length) return;
        setParadas(visibles);
        setPaso(0);
        setSitio(null);
        setAbierta(true);
      }, 350);
    };
    window.addEventListener('pace:open-visita', abrir);
    return () => { clearTimeout(espera); window.removeEventListener('pace:open-visita', abrir); };
  }, []);

  const cerrar = () => setAbierta(false);
  usePaceDialogo(raizRef, abierta, { onEscape: cerrar });

  const parada = abierta ? paradas[paso] : null;
  const medir = () => {
    const h = paceVisitaHueco(parada);
    setHueco(h);
    const tj = tarjetaRef.current;
    if (tj) setSitio(paceVisitaSitio(h, tj.offsetWidth, tj.offsetHeight, paceLienzoAncho(), paceLienzoAlto()));
  };
  /* Antes de pintar: el hueco y la tarjeta llegan juntos a cada parada, sin un fotograma a medias. */
  useLayoutEffectVIS(() => { if (abierta) medir(); }, [abierta, paso]);
  useEffectVIS(() => {
    if (!abierta) return undefined;
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, [abierta, paso]);

  if (!abierta || !parada) return null;

  const ultima = paso === paradas.length - 1;
  const seguir = () => (ultima ? cerrar() : setPaso((p) => p + 1));
  const ancho = Math.min(320, paceLienzoAncho() - 32);

  return (
    <div ref={raizRef} data-pace-visita={parada.id} role="dialog" aria-modal="true"
      aria-labelledby="pace-visita-titulo" aria-describedby="pace-visita-texto" tabIndex={-1}
      style={{ ...onbVisitaStyles.raiz, background: hueco ? 'transparent' : 'var(--pace-visita-velo)' }}>
      {hueco && (
        <div className="pace-visita-hueco" data-pace-visita-hueco aria-hidden="true" style={{
          left: hueco.left, top: hueco.top, width: hueco.width, height: hueco.height, borderRadius: hueco.radio,
        }} />
      )}
      <div ref={tarjetaRef} data-pace-visita-tarjeta style={{
        ...onbVisitaStyles.tarjeta, width: ancho,
        left: sitio ? sitio.left : 16, top: sitio ? sitio.top : 16, visibility: sitio ? 'visible' : 'hidden',
      }}>
        <div aria-live="polite">
          <div className="pace-meta">{tn('visita.paso', { n: paso + 1, total: paradas.length })}</div>
          <h2 id="pace-visita-titulo" style={onbVisitaStyles.titulo}>{t('visita.' + parada.id + '.titulo')}</h2>
          <p id="pace-visita-texto" style={onbVisitaStyles.texto}>
            {parada.id === 'aro' ? tn('visita.aro.texto', { boton: t('focus.start') }) : t('visita.' + parada.id + '.texto')}
            {/* De la B (la pista de la home): lo que pasa al acabar el Foco, que la C no contaba. */}
            {parada.id === 'aro' ? ' ' + t('visita.aro.pausa') : null}
          </p>
        </div>
        <div style={onbVisitaStyles.botones}>
          <button type="button" data-pace-visita-saltar onClick={cerrar} style={onbVisitaStyles.saltar}>
            {t('visita.saltar')}
          </button>
          <button type="button" data-pace-visita-siguiente onClick={seguir} style={onbVisitaStyles.siguiente}>
            {t(ultima ? 'visita.fin' : 'visita.siguiente')}
          </button>
        </div>
      </div>
    </div>
  );
}

const onbVisitaStyles = {
  /* Sobre la home y Ajustes (80), bajo los modales (100): si algo se abre solo encima, manda. */
  raiz: { position: 'fixed', inset: 0, zIndex: 96, outline: 'none', animation: 'pace-fade-in 240ms ease' },
  tarjeta: {
    position: 'fixed', boxSizing: 'border-box', padding: '14px 16px 8px',
    background: 'var(--paper)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-md)',
    boxShadow: 'var(--sh-modal)', textAlign: 'left',
    transition: 'left 320ms var(--ease), top 320ms var(--ease)',
  },
  titulo: {
    fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 21, fontWeight: 500,
    lineHeight: 1.15, color: 'var(--ink)', margin: '4px 0 0',
  },
  texto: { fontSize: 13, lineHeight: 1.45, color: 'var(--ink-2)', margin: '4px 0 0' },
  botones: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 8 },
  /* Los dos con 40 px de alto: se tocan con el dedo (tests/toques-movil.spec.js). */
  saltar: {
    fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink-3)',
    background: 'none', border: 0, padding: '0', minHeight: 40, cursor: 'pointer',
  },
  siguiente: {
    fontFamily: 'var(--font-ui)', fontSize: 12, letterSpacing: '0.12em', color: 'var(--paper)',
    background: 'var(--focus-cta)', border: 0, borderRadius: 'var(--r-pill)', padding: '0 20px',
    minHeight: 40, cursor: 'pointer',
  },
};

/* El velo es la sombra del hueco, así que el hueco es lo único que queda sin tapar. Más
   denso en oscuro: sobre papel oscuro, el de crema apenas se nota. El borde del hueco va en
   tinta apagada, que en oscuro es clara. */
if (!document.getElementById('pace-visita-css')) {
  const s = document.createElement('style');
  s.id = 'pace-visita-css';
  s.textContent = `
    :root { --pace-visita-velo: rgba(31, 28, 23, 0.52); }
    :root[data-palette="oscuro"] { --pace-visita-velo: rgba(0, 0, 0, 0.66); }
    .pace-visita-hueco { position: fixed; pointer-events: none;
      box-shadow: 0 0 0 200vmax var(--pace-visita-velo), inset 0 0 0 1.5px var(--ink-3);
      transition: left 320ms var(--ease), top 320ms var(--ease), width 320ms var(--ease), height 320ms var(--ease), border-radius 320ms var(--ease); }
  `;
  document.head.appendChild(s);
}

Object.assign(window, { OnbVisita, paceVisitaSitio });
