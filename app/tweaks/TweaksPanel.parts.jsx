/* PACE - Foco - Cuerpo
   Copyright (c) 2026 ezradesign
   Licensed under the Elastic License 2.0 - see LICENSE

   TweaksPanel.parts.jsx - LAS PIEZAS DEL PANEL DE AJUSTES (s188).
   ============================================================
   Hasta s187 el panel escribia la misma pastilla a mano en cinco sitios (la
   propia `TweaksAudio.jsx` lo dejaba anotado: «unificarla es otra sesion y otro
   diff»). Esta es esa sesion. Cuatro piezas y una fila, sin estado propio:

     AjustesSeccion   titulo en versalita + contenido + divisor
     AjustesFila      nombre (cursiva) + linea del modulo + el control a la derecha
     AjustesPildoras  UNA decision entre varias: pista redonda, la elegida en tinta
                      (o en el lavado de su modulo). `aria-pressed` es el estado.
     AjustesInterruptor  un si/no: `role=switch`
     AjustesPaso      menos · cifra · mas
     AjustesAccion    una fila que hace algo (exportar, importar, borrar)

   EL COLOR DE MODULO ENTRA POR LA FILA, no por el control: `AjustesFila` recibe
   `modulo` ('focus' | 'breathe' | 'move' | 'hydrate'), pone `data-pace-aj-modulo`
   y publica los dos tokens como custom properties; la hoja de
   `TweaksPanel.support.jsx` hace el resto. Asi un control no sabe de que color
   es -- lo sabe la fila, que es quien sabe de que modulo es el ajuste.

   LOS PICTOGRAMAS DEL CIRCULO estan calcados de `BreatheVisual.jsx`: la flor de
   linea (loto), el circulo con la bola en la orbita (pulso), las seis elipses
   giradas (petalo) y los anillos que se apagan (ondas). Son 16x16 y van en
   `currentColor`, para heredar la tinta de la pildora o el color del modulo.

   Sin hooks: son funciones de render puras. Se publican en `window` porque un
   `const` no cruza la IIFE del artefacto (trampa de s148). */

const AJUSTES_MODULO = {
  focus:   { m: 'var(--focus)',   ms: 'var(--focus-soft)' },
  breathe: { m: 'var(--breathe)', ms: 'var(--breathe-soft)' },
  move:    { m: 'var(--move)',    ms: 'var(--move-soft)' },
  hydrate: { m: 'var(--hydrate)', ms: 'var(--hydrate-soft)' },
};

function AjustesSeccion({ titulo, ultima, children }) {
  return (
    <React.Fragment>
      <div className="pace-aj-sec" data-pace-aj-seccion={titulo}>
        <div className="pace-aj-sec-titulo">{titulo}</div>
        {children}
      </div>
      {!ultima && <div className="pace-aj-div" />}
    </React.Fragment>
  );
}

/* La fila. `sub` es la linea pequena de debajo del nombre (el modulo, y en el
   circulo tambien el estilo elegido). `atenuada` la deja visible pero inerte:
   es lo que hace el bloque de sonido con el maestro apagado. */
function AjustesFila({ id, nombre, sub, modulo, atenuada, children }) {
  const tono = modulo ? AJUSTES_MODULO[modulo] : null;
  const style = tono ? { '--pace-aj-m': tono.m, '--pace-aj-ms': tono.ms } : undefined;
  return (
    <div className="pace-aj-fila" data-pace-aj-fila={id}
         data-pace-aj-modulo={tono ? modulo : undefined}
         data-atenuada={atenuada ? '' : undefined}
         aria-disabled={atenuada ? 'true' : undefined}
         style={style}>
      <div className="pace-aj-nombre">
        {nombre}
        {sub && <div className="pace-aj-sub">{tono && <i className="pace-aj-punto" aria-hidden="true" />}{sub}</div>}
      </div>
      {children}
    </div>
  );
}

/* opciones: [{ v, name, picto, aria }]. Con `picto` y sin `name` la pildora es
   solo dibujo y el nombre va en `aria` (y en el title, para el raton). */
function AjustesPildoras({ opciones, valor, onChange, aria }) {
  return (
    <div className="pace-aj-pista" role="group" aria-label={aria}>
      {opciones.map(o => (
        <button key={String(o.v)} type="button" className="pace-aj-pild"
                aria-pressed={o.v === valor}
                aria-label={o.name ? undefined : o.aria}
                title={o.name ? undefined : o.aria}
                data-picto={o.picto && !o.name ? '' : undefined}
                onClick={() => onChange(o.v)}>
          {o.picto}{o.name}
        </button>
      ))}
    </div>
  );
}

function AjustesInterruptor({ on, onChange, aria }) {
  return (
    <button type="button" role="switch" aria-checked={!!on} aria-label={aria}
            className="pace-aj-sw" onClick={() => onChange(!on)} />
  );
}

function AjustesPaso({ valor, onMenos, onMas, ariaMenos, ariaMas }) {
  return (
    <div className="pace-aj-paso">
      <button type="button" onClick={onMenos} aria-label={ariaMenos}>−</button>
      <span data-pace-aj-cifra>{valor}</span>
      <button type="button" onClick={onMas} aria-label={ariaMas}>+</button>
    </div>
  );
}

/* Una fila que hace algo. `derecha` es lo que va al final (icono o palabra). */
function AjustesAccion({ children, derecha, suave, onClick, title }) {
  if (!onClick) {
    return <div className="pace-aj-accion" data-suave={suave ? '' : undefined}><span>{children}</span><span>{derecha}</span></div>;
  }
  return (
    <button type="button" className="pace-aj-accion" data-suave={suave ? '' : undefined} onClick={onClick} title={title}>
      <span>{children}</span><span aria-hidden="true">{derecha}</span>
    </button>
  );
}

function MuestraPaleta({ cual }) {
  return <i className={'pace-aj-muestra pace-aj-muestra-' + cual} aria-hidden="true" />;
}

/* Los cuatro dibujos del circulo de respiracion (y el blob del organico, que
   solo se ve si `SHOW_BREATH_ORGANICO` vuelve a true). */
function PictoCirculo({ estilo }) {
  const p = { viewBox: '0 0 16 16', 'aria-hidden': 'true', focusable: 'false' };
  if (estilo === 'flor') return (
    <svg {...p}><path d="M8 3.2C6.6 5.8 6.6 9.2 8 12.3 9.4 9.2 9.4 5.8 8 3.2Z" /><path d="M8 12.3C5.2 11.6 3.3 9.4 3 6.4 5.4 6.9 7 8.9 8 12.3Z" /><path d="M8 12.3C10.8 11.6 12.7 9.4 13 6.4 10.6 6.9 9 8.9 8 12.3Z" /><path d="M4 13.2Q8 14.6 12 13.2" /></svg>
  );
  if (estilo === 'pulso') return (
    <svg {...p}><circle cx="8" cy="8" r="4.6" /><circle cx="8" cy="8" r="6.8" opacity=".35" /><circle cx="8" cy="3.4" r="1.3" fill="currentColor" stroke="none" /></svg>
  );
  if (estilo === 'petalo') return (
    <svg {...p}>{[0, 60, 120, 180, 240, 300].map(g => <ellipse key={g} cx="8" cy="4.6" rx="1.7" ry="3.4" transform={'rotate(' + g + ' 8 8)'} />)}</svg>
  );
  if (estilo === 'organico') return (
    <svg {...p}><path d="M8 2.6c2.6 0 5.2 2 5.2 4.9 0 3.1-2 6-5 6-3.2 0-5.4-2.4-5.4-5.4C2.8 5 5.2 2.6 8 2.6Z" /></svg>
  );
  /* ondas */
  return (
    <svg {...p}><circle cx="8" cy="8" r="2.3" /><circle cx="8" cy="8" r="4.6" opacity=".6" /><circle cx="8" cy="8" r="6.9" opacity=".3" /></svg>
  );
}

Object.assign(window, {
  AJUSTES_MODULO, AjustesSeccion, AjustesFila, AjustesPildoras, AjustesInterruptor,
  AjustesPaso, AjustesAccion, MuestraPaleta, PictoCirculo,
});
