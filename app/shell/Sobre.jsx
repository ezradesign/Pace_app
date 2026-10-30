/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   EL SOBRE de la barra de arriba (Ez, 30 oct. 2026: 1A)
   =====================================================
   Un icono junto a Estadísticas para lo que PACE te deja escrito: CERRADO, con su lacre, mientras
   hay algo sin leer, y ABIERTO cuando ya lo leíste. Sin nada, no se pinta. Tocarlo lo abre.

   Hoy solo lleva la carta del lunes (ritmo/RitmoCarta.jsx). Ez quiere que más adelante pueda llevar
   las novedades de una versión o un aviso puntual, así que el sobre no sabe de cartas: cada cosa se
   apunta como una FUENTE, con su clave y una función que dice si hay algo que enseñar:

     paceSobreApuntar({ clave, de: (state, t) => null | { sinLeer, titulo, abrir } })

   Con varias, manda la primera sin leer y, sin ninguna sin leer, la primera que haya. Este archivo
   carga antes que los módulos, que se apuntan al evaluarse. */

const paceSobreFuentes = [];

function paceSobreApuntar(fuente) {
  if (!fuente || !fuente.clave || typeof fuente.de !== 'function') return;
  const i = paceSobreFuentes.findIndex((f) => f.clave === fuente.clave);
  if (i >= 0) paceSobreFuentes[i] = fuente; else paceSobreFuentes.push(fuente);
}

/* Lo que lleva el sobre ahora, o null. Una fuente que falla no tumba la barra. */
function paceSobreHoy(state, t) {
  const hay = [];
  paceSobreFuentes.forEach((f) => {
    let x = null;
    try { x = f.de(state, t); } catch (e) { x = null; }
    if (x) hay.push(Object.assign({ clave: f.clave }, x));
  });
  return hay.find((x) => x.sinLeer) || hay[0] || null;
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

/* `estilo`: el de los iconos de la barra (topBarStyles, TopBar.jsx). */
function PaceSobre({ estilo }) {
  const [state] = usePace();
  const { t } = useT();
  const hoy = paceSobreHoy(state, t);
  if (!hoy) return null;
  return (
    <button type="button" data-pace-topbar-icon data-pace-sobre={hoy.sinLeer ? 'cerrado' : 'abierto'} data-pace-sobre-de={hoy.clave}
      onClick={hoy.abrir} style={estilo} title={hoy.titulo} aria-label={hoy.titulo}>
      <PaceSobreIcono abierto={!hoy.sinLeer} />
    </button>
  );
}

Object.assign(window, { paceSobreApuntar, paceSobreHoy, PaceSobreIcono, PaceSobre });
