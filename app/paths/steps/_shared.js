/* PACE · Caminos · Estilos compartidos entre Steps · sesion 80 (split de PathRunner.jsx)
   Solo estilos: btnTypography (tipografia + radius comunes a los botones de
   los Steps) y btnOutline (defaults del boton outline -- background, border,
   color, transition). Padding lo decide cada Step segun densidad de su layout.
   Cero comportamiento. Debe cargarse ANTES de PathFocusStep.jsx y
   PathHydrateStep.jsx (sus unicos consumidores hoy). */

window.pathStepStyles = {
  btnTypography: {
    cursor: 'pointer',
    fontSize: 13,
    letterSpacing: '0.08em',
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    borderRadius: 'var(--r-sm)',
  },
  btnOutline: {
    background: 'transparent',
    border: '1px solid var(--line-2)',
    color: 'var(--ink-2)',
    transition: 'all 180ms var(--ease)',
  },
};
