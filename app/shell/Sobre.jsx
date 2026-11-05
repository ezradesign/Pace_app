/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   EL SOBRE de la barra de arriba (Ez, 30 oct. 2026: 1A)
   =====================================================
   Un icono junto a Estadísticas para lo que PACE te deja escrito: CERRADO, con su lacre, mientras
   hay algo sin leer, y ABIERTO cuando ya lo leíste. Sin nada, no se pinta. Tocarlo lo abre.

   Lleva la carta del lunes (ritmo/RitmoCarta.jsx) y las novedades de cada versión
   (Sobre.novedades.js). Cada cosa se apunta como una FUENTE, con su clave y una función que dice si hay
   algo que enseñar:

     paceSobreApuntar({ clave, de: (state, t, tn, lang) => null | {
       sinLeer, titulo, fecha, tipo, cuando, tituloHoja, resumen | lineas, abrir + enlace | leer } })

   Con una sola cosa y larga (la carta), tocar el icono la abre, como siempre. Con más, o con una que se
   lee en la hoja, el icono abre UNA HOJA con todo, lo más nuevo arriba (Ez, 5 nov. 2026: 1C): lo corto se
   lee ahí mismo y lo largo, con su enlace, abre su ventana. Abrir la hoja da por leído lo que se lee en
   ella (`leer`); la carta, cuando se abre la carta. Sin contador: un punto de lacre por cosa sin leer, y
   el icono cerrado mientras quede alguna. Entrar no obliga a nada. Este archivo carga antes que los
   módulos, que se apuntan al evaluarse. */

const { useState: useStateSB, useEffect: useEffectSB } = React;

const paceSobreFuentes = [];

function paceSobreApuntar(fuente) {
  if (!fuente || !fuente.clave || typeof fuente.de !== 'function') return;
  const i = paceSobreFuentes.findIndex((f) => f.clave === fuente.clave);
  if (i >= 0) paceSobreFuentes[i] = fuente; else paceSobreFuentes.push(fuente);
}

/* Todo lo que lleva el sobre, lo más nuevo arriba. Una fuente que falla no tumba la barra. */
function paceSobreLista(state, t, tn, lang) {
  const hay = [];
  paceSobreFuentes.forEach((f, i) => {
    let x = null;
    try { x = f.de(state, t, tn, lang); } catch (e) { x = null; }
    if (x) hay.push({ x: Object.assign({ clave: f.clave }, x), i: i });
  });
  hay.sort((a, b) => String(b.x.fecha || '').localeCompare(String(a.x.fecha || '')) || a.i - b.i);
  return hay.map((h) => h.x);
}

/* Lo que manda en el icono: la primera sin leer y, sin ninguna, la primera que haya. */
function paceSobreHoy(state, t, tn, lang) {
  const lista = paceSobreLista(state, t, tn, lang);
  return lista.find((x) => x.sinLeer) || lista[0] || null;
}

/* Cerrado: el sobre con su lacre. Abierto: la solapa arriba. El trazo, el de los iconos de al lado. */
function PaceSobreIcono({ abierto }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {abierto ? (
        <React.Fragment>
          <path d="M3.5 10.5v8A1.5 1.5 0 0 0 5 20h14a1.5 1.5 0 0 0 1.5-1.5v-8" />
          <path d="M3.5 10.5L12 4l8.5 6.5" /><path d="M3.5 10.5L12 16l8.5-5.5" />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <rect x="3" y="5.5" width="18" height="13" rx="1.5" /><path d="M3.5 6.5L12 13l8.5-6.5" />
          <circle cx="12" cy="13" r="2.4" fill="var(--breathe)" stroke="none" />
        </React.Fragment>
      )}
    </svg>
  );
}

const paceSobreStyles = {
  cab: { paddingRight: 34 },
  meta: { fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)' },
  parte: { borderTop: '1px solid var(--line)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 6 },
  tipo: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)' },
  titulo: { fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500, fontSize: 17, lineHeight: 1.12, color: 'var(--ink)' },
  texto: { fontSize: 13, lineHeight: 1.4, color: 'var(--ink-2)' },
  linea: { display: 'grid', gridTemplateColumns: '10px minmax(0,1fr)', gap: 9, alignItems: 'baseline', fontSize: 13, lineHeight: 1.4, color: 'var(--ink-2)' },
  punto: { width: 8, height: 8, borderRadius: '50%', borderWidth: 1.5, borderStyle: 'solid', borderColor: 'var(--ink-3)', display: 'block', transform: 'translateY(-1px)' },
  enlace: { alignSelf: 'flex-start' },
};

/* El punto de lacre de lo que está sin leer; leído, un círculo vacío. */
function PaceSobreLacre({ sinLeer }) {
  return <i aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', flex: 'none', display: 'block',
    background: sinLeer ? 'var(--breathe)' : 'transparent', border: sinLeer ? '0' : '1.5px solid var(--line-2)' }} />;
}

/* La hoja con todo. Más de tres cosas: las más viejas se pliegan bajo «Antes». */
function PaceSobreHoja({ lista, onCerrar }) {
  const { t } = useT();
  const S = paceSobreStyles;
  /* Lo que estaba sin leer al abrir se queda marcado mientras la hoja está abierta. */
  const [sinLeer] = useStateSB(() => lista.filter((x) => x.sinLeer).map((x) => x.clave));
  const [todas, setTodas] = useStateSB(false);
  useEffectSB(() => { lista.forEach((x) => { if (x.sinLeer && typeof x.leer === 'function') x.leer(); }); }, []);
  const vistas = todas ? lista : lista.slice(0, 3);
  return (
    <Modal open onClose={onCerrar} maxWidth={420} relleno="20px 18px 16px" ariaLabel={t('sobre.titulo')}>
      <div data-pace-sobre-hoja style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={S.cab}><span style={S.meta}>{t('sobre.titulo')}</span></div>
        {vistas.map((x) => {
          const sin = sinLeer.indexOf(x.clave) >= 0;
          return (
            <div key={x.clave} data-pace-sobre-item={x.clave} data-pace-sobre-item-estado={sin ? 'sin-leer' : 'leido'} style={S.parte}>
              <div style={S.tipo}><PaceSobreLacre sinLeer={sin} /><span>{x.tipo} · {x.cuando}</span></div>
              <div style={S.titulo}>{x.tituloHoja}</div>
              {x.lineas && x.lineas.map((l, k) => (
                <div key={k} style={S.linea}><i style={S.punto} /><span>{l}</span></div>
              ))}
              {x.resumen && <div style={S.texto}>{x.resumen}</div>}
              {x.abrir && x.enlace && (
                <button type="button" className="pace-rt-enlace" style={S.enlace} data-pace-sobre-abrir={x.clave}
                  onClick={() => { onCerrar(); x.abrir(); }}>{x.enlace} ›</button>
              )}
            </div>
          );
        })}
        {!todas && lista.length > 3 && (
          <button type="button" className="pace-rt-enlace" style={S.enlace} onClick={() => setTodas(true)}>{t('sobre.antes')} ›</button>
        )}
      </div>
    </Modal>
  );
}

/* `estilo`: el de los iconos de la barra (topBarStyles, TopBar.jsx). */
function PaceSobre({ estilo }) {
  const [state] = usePace();
  const { t, tn, lang } = useT();
  const [hoja, setHoja] = useStateSB(false);
  const lista = paceSobreLista(state, t, tn, lang);
  if (!lista.length) return null;
  const sin = lista.filter((x) => x.sinLeer);
  const manda = sin[0] || lista[0];
  /* Una sola cosa y larga (la carta): el icono la abre, como siempre. */
  const directo = lista.length === 1 && typeof manda.abrir === 'function' && !manda.lineas;
  const titulo = lista.length === 1 ? manda.titulo : t(sin.length ? 'sobre.nuevas' : 'sobre.titulo');
  return (
    <React.Fragment>
      <button type="button" data-pace-topbar-icon data-pace-sobre={sin.length ? 'cerrado' : 'abierto'} data-pace-sobre-de={manda.clave}
        onClick={directo ? manda.abrir : () => setHoja(true)} style={estilo} title={titulo} aria-label={titulo}>
        <PaceSobreIcono abierto={!sin.length} />
      </button>
      {hoja && <PaceSobreHoja lista={lista} onCerrar={() => setHoja(false)} />}
    </React.Fragment>
  );
}

Object.assign(window, { paceSobreApuntar, paceSobreLista, paceSobreHoy, PaceSobreIcono, PaceSobreHoja, PaceSobre });
