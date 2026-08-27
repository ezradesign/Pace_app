/* PACE · scripts/audit/maqueta-s175.piezas.js (sesión 175)
   =========================================================
   LAS PIEZAS DE LA MAQUETA: el CSS de cada variante y los dos bocetos de vista
   de `Rana`. Vive aparte de `maqueta-s175.js` por la regla §1 y porque aquí no
   hay ni una medida: es material, no lógica.

   SOBRE LOS BOCETOS DE `Rana`: son SVG de trazo en el viewBox 44x44 y el grosor
   1.8 del wrapper `G` de `exercise-glyphs.jsx`, o sea la convención del glifo
   heredado, NO del arte anatómico. **No pretenden ser la pieza final**: lo que
   tienen que dejar decidir es la VISTA —qué silueta queda a 62 px—, que es la
   única pregunta abierta. Por eso la maqueta los pone al lado de los
   quadrúpedos que YA existen en el set, que es la referencia real. */
'use strict';

/* --- (a) frontal en cuadrupedia -------------------------------------------
   Mantiene la convención del set (perfil o frontal) y enseña las rodillas
   abiertas de par en par. Lo que NO puede enseñar: la cadera va hacia ATRÁS,
   y en vista frontal «atrás» es hacia dentro del papel. */
const RANA_FRONTAL = [
  '<svg viewBox="0 0 44 44" width="{S}" height="{S}" fill="none" stroke="currentColor"',
  '     stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">',
  '  <circle cx="22" cy="18.5" r="3.1"/>',
  '  <path d="M16.5 21.5 H27.5"/>',
  '  <path d="M16.5 21.5 L14.5 31.5"/>',
  '  <path d="M27.5 21.5 L29.5 31.5"/>',
  '  <path d="M12.6 32.4 H16.4"/>',
  '  <path d="M27.6 32.4 H31.4"/>',
  '  <path d="M17 20.6 Q22 13.4 27 20.6"/>',
  '  <path d="M18.6 16.6 L9.4 28.2"/>',
  '  <path d="M25.4 16.6 L34.6 28.2"/>',
  '  <path d="M9.4 28.2 L8.4 32.2"/>',
  '  <path d="M34.6 28.2 L35.6 32.2"/>',
  '  <path d="M6 33.4 H38"/>',
  '  <path d="M22 11.8 V7.4" stroke-dasharray="1.6 1.8"/>',
  '  <path d="M20.3 9.1 L22 7.2 L23.7 9.1"/>',
  '</svg>',
].join('\n');

/* --- (b) 3/4 desde atrás --------------------------------------------------
   Más fiel al gesto —la cadera empujando atrás se ve— pero sería la ÚNICA
   pieza del set en esa vista. */
const RANA_TRESCUARTOS = [
  '<svg viewBox="0 0 44 44" width="{S}" height="{S}" fill="none" stroke="currentColor"',
  '     stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">',
  '  <path d="M13.6 24.4 Q22 17.2 31.4 19.6"/>',
  '  <path d="M31.4 19.6 Q34.6 21.4 33.4 25"/>',
  '  <circle cx="11.6" cy="26.4" r="2.7"/>',
  '  <path d="M15.2 25.6 L11.4 31.4"/>',
  '  <path d="M19 23.6 L16 31.4"/>',
  '  <path d="M9.6 32.3 H13.4"/>',
  '  <path d="M14.2 32.3 H18"/>',
  '  <path d="M31 21.4 L37.6 27.6"/>',
  '  <path d="M37.6 27.6 L34.4 31.6"/>',
  '  <path d="M28.6 24.6 L25.4 31.6"/>',
  '  <path d="M32.6 32.4 H36.2"/>',
  '  <path d="M23.6 32.4 H27.2"/>',
  '  <path d="M6 33.4 H39"/>',
  '  <path d="M35.4 15.4 H39.6" stroke-dasharray="1.6 1.8"/>',
  '  <path d="M37.8 13.7 L39.8 15.4 L37.8 17.1"/>',
  '</svg>',
].join('\n');

const bocetoRana = (cual, s) =>
  (cual === 'a' ? RANA_FRONTAL : RANA_TRESCUARTOS).split('{S}').join(String(s));

/* --- CSS de las VARIANTES del rail ----------------------------------------
   Cada una se inyecta SOBRE la hoja real de la biblioteca, así que sólo
   contiene la diferencia. Nada de reescribir la hoja: si la de producción
   cambia, estas variantes cambian con ella. */
const VARIANTES_RAIL = {
  /* A0 DESHACE lo de s175 a mano, y esto NO es duplicar la hoja: la maqueta lee
     `library.css.jsx` de producción, y producción ya lleva el arreglo. Sin
     revertirlo aquí, el marco del «antes» enseñaría el «después» -- lo cazó el
     propio badge al dar A0 y A1 idénticos. */
  a0: { titulo: 'A0 · Como estaba (antes de s175)',
        nota: 'El rail era <code>position: static</code> y su caja se estiraba a la altura de la derecha. Entre «Tus rutinas» y «Para ahora» había <b>0 px</b>. Es lo que reportaste.',
        css: [
          '.pace-lib-lateral { position: static !important; align-self: stretch !important; }',
          '.pace-lib-lateral > :not(.pace-lib-lateral-tit) { margin-bottom: 0; }',
          /* la restauración necesita ATAR en especificidad con la línea de
             arriba (0,2,0) o no devuelve su aire a los chips: con
             ".pace-lib-lateral-tit + *" a secas (0,1,0) el marco del «antes»
             salía con DOS ceros donde la app tenía uno. */
          '.pace-lib-lateral > .pace-lib-lateral-tit + * { margin-bottom: 26px; }',
        ].join('\n') },
  a1: { titulo: 'A1 · Fijo + aire igual, DOS sugerencias',
        nota: 'El rail se queda quieto al bajar (<code>sticky</code>) y todos los bloques respiran los mismos <b>26 px</b>. Con dos sugerencias sigue sin caber.',
        css: [
          '.pace-lib-lateral { position: sticky; top: 0; align-self: flex-start; }',
          '.pace-lib-lateral > div { margin-bottom: 26px; }',
          '.pace-lib-lateral > div:last-child { margin-bottom: 0; }',
        ].join('\n') },
  a2: { titulo: 'A2 · IMPLEMENTADO (v0.105.0)',
        nota: 'Igual que A1, pero «Para ahora» propone <b>una</b> rutina en vez de dos. Es lo que hace que quepa entero sin recorte a tu altura, y es lo que está en la app desde s175.',
        css: [
          '.pace-lib-lateral { position: sticky; top: 0; align-self: flex-start; }',
          '.pace-lib-lateral > div { margin-bottom: 26px; }',
          '.pace-lib-lateral > div:last-child { margin-bottom: 0; }',
        ].join('\n') },
  a3: { titulo: 'A3 · Fijo + «Tus rutinas» arrimada a los chips',
        nota: 'Tu segunda propuesta: «Tus rutinas» sube y se pega al bloque de filtros (<b>14 px</b>), y el aire grande se guarda para separar de «Para ahora» (<b>30 px</b>).',
        css: [
          '.pace-lib-lateral { position: sticky; top: 0; align-self: flex-start; }',
          '.pace-lib-lateral .pace-lib-chips { margin-bottom: 14px !important; }',
          '.pace-lib-lateral > div { margin-bottom: 30px; }',
          '.pace-lib-lateral > div:last-child { margin-bottom: 0; }',
        ].join('\n') },
};

/* --- CSS de las VARIANTES de la preparación -------------------------------
   El reparto vertical de la pantalla de PREPÁRATE. `B0` es lo que hay hoy: el
   bloque anclado arriba y el CTA abajo, con el hueco EN MEDIO. */
const VARIANTES_PREP = {
  b0: { titulo: 'B0 · Como estaba (antes de s175)',
        nota: 'Bloque anclado arriba, CTA abajo del todo. El hueco caia <b>en medio</b>: a 1536x714 eran <b>280 px</b> medidos en la app. Es lo que llamaste «queda muy raro».',
        css: '.mq-prep .mq-cta { margin-top: auto; margin-bottom: 0; }' },
  b1: { titulo: 'B1 · Centrado',
        nota: 'El bloque vuelve al centro óptico. <b>Devuelve el brinco</b> que s174 midió al relevar el círculo: 171 px en escritorio, 221 en móvil.',
        css: '.mq-prep { justify-content: center; } .mq-prep .mq-cta { margin-top: 44px; }' },
  b2: { titulo: 'B2 · IMPLEMENTADO (v0.105.0)',
        nota: 'El círculo NO se mueve —el relevo sigue sin saltar— y el CTA sube justo debajo del texto. El hueco queda <b>abajo</b>, donde no separa nada.',
        css: '.mq-prep .mq-cta { margin-top: 40px; margin-bottom: auto; }' },
  b3: { titulo: 'B3 · Anclado + el hueco lo ocupa la rutina',
        nota: 'El círculo no se mueve y el hueco se llena con lo que la pantalla ya sabe y hoy no dice: <b>los pasos que vienen</b>. Sin CTA flotando en el vacío.',
        css: '.mq-prep .mq-cta { margin-top: 32px; margin-bottom: auto; } .mq-pasos { display: block !important; }' },
};

module.exports = { bocetoRana, VARIANTES_RAIL, VARIANTES_PREP };
