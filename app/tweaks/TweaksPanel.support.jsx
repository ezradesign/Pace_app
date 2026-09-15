/* PACE - Foco - Cuerpo
   Copyright (c) 2026 ezradesign
   Licensed under the Elastic License 2.0 - see LICENSE

   TweaksPanel.support.jsx - ESTILO SIN UI del panel de Ajustes.
   Extraido de TweaksPanel.jsx en s163 al rebasar este las 500 lineas de la regla
   nº 1 de CLAUDE.md. Mismo patron que `Sidebar.support.jsx` (s148),
   `MoveSessionV1.support.jsx` y `BreatheVisual.support.jsx`: lo que sale es lo
   que no dibuja nada -- la tabla de estilos, las hojas inyectadas y la
   constante de transicion de las pastillas.

   s188: AQUI VIVE LA HOJA DEL PANEL REDISENADO (`pace-aj-*`). El panel dejo de
   ser cinco filas de pastillas escritas a mano y paso a una anatomia de FILAS
   (nombre a la izquierda, control a la derecha) con cuatro piezas -- pildoras,
   interruptor, escalon y accion-- que pintan `TweaksPanel.parts.jsx`. La forma
   se eligio MIRANDOLA en cinco rondas de maqueta (docs/proposals/ajustes-
   rediseno*.html, variante P1+). Lo que la hoja decide y por que:

   · LA PISTA DE PILDORAS NO LLEVA BORDE: solo papel-2. El borde era lo que hacia
     «caja» (ronda 4). Es la misma pieza que FOCO · PAUSA · LARGA de la home.
   · EL COLOR DICE DE QUE MODULO ES EL AJUSTE, y solo aparece donde hay modulo:
     la fila lleva `data-pace-aj-modulo` y sus dos tokens (`--pace-aj-m`, el
     color; `--pace-aj-ms`, el lavado). La pildora elegida de esas filas es un
     LAVADO del color con el texto en TINTA, nunca el color con texto claro:
     terracota, tabaco y azul con texto claro dan 2,8-3,3:1 (medido en la
     maqueta; s186 ya lo midio para la tarjeta de Viajes). Con el lavado, el
     peor elegido da 9,3:1 en oscuro. Lo global (idioma, sonido) sigue en tinta.
   · `color-mix` con `--pace-aj-ms` de respaldo: el lavado al 22 % sobre papel
     se ve mejor que el -soft (12 %), y donde no haya color-mix se pinta el -soft.
   · CON EL SONIDO APAGADO LAS FILAS QUE CUELGAN DE EL SE ATENUAN, no se esconden
     (`data-atenuada`): asi el panel no salta 84 px y se ve que volvera.
   · LA LETRA ES LA DE LAS TARJETAS DE ACTIVIDAD: nombre en cursiva 16/500 y el
     modulo en cursiva 12 apagada; las secciones en versalita porque son SISTEMA
     (regla de `library.css.jsx`); los controles en Inter.
   · TRANSICIONES EXPLICITAS, nunca `all` (s139): el peso cambia con el estado.

   LOS NOMBRES VIAJAN POR `window`, y no es un descuido: en el artefacto cada
   modulo va dentro de su IIFE, asi que un `const` de este archivo NO cruza a
   TweaksPanel.jsx. Se publican y alli se referencian PELADOS -- la misma
   solucion que `sidebarStyles` en s148, con la misma razon.

   ORDEN DE CARGA: ANTES de `TweaksPanel.parts.jsx` y de `TweaksPanel.jsx`.

   OJO CON LOS ACENTOS GRAVES: la hoja va dentro de un template literal. Un
   acento grave en un comentario de dentro aborta el build (paso tres veces con
   `library.css.jsx`). Por eso los comentarios de la hoja no llevan ninguno. */

/* s139 · BUG DEL BOTÓN FANTASMA — transición EXPLÍCITA, nunca `all`.
   Las filas de pastillas de este panel cambian `fontWeight` 400↔500 al
   activarse, y con `transition:'all'` la transición ANIMABA EL PESO. Medido: el
   peso recorría 41 valores fraccionarios mientras el ancho solo tomaba DOS ⇒ con
   las caras ESTÁTICAS de Inter Tight (s105) el trazo saltaba a mitad de vuelo y
   la pastilla daba un tirón de ~2 px que desplazaba a su vecina.
   REGLA: si el estado cambia el `fontWeight`, se listan las propiedades. El peso
   es señal de estado, no movimiento. Mismo fix en `statsPanelTabStyles.tab`.
   Detalle medido en docs/sessions/session-139. */
const TWEAKS_PILL_TRANSITION = 'background-color 180ms, border-color 180ms, color 180ms';

/* Estilos (nombres únicos). Lo que queda aqui es lo que aun se escribe en linea. */
const tweaksStyles = {
  legalLink: {
    color: 'var(--ink-3)',
    textDecoration: 'none',
    borderBottom: '1px solid var(--line)',
    paddingBottom: 1,
  },
};

/* ============================================================
   La hoja del panel (s188). Clases `pace-aj-*`.
   ============================================================ */
const _paceAjustesCss = document.getElementById('pace-ajustes-css');
if (!_paceAjustesCss) {
  const s = document.createElement('style');
  s.id = 'pace-ajustes-css';
  s.textContent = `
    .pace-aj-cab { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .pace-aj-titulo { font-family: var(--font-display); font-style: italic; font-size: 24px; font-weight: 500; line-height: 1.1; color: var(--ink); }
    .pace-aj-cerrar { font-size: 18px; color: var(--ink-3); width: 26px; height: 26px; display: grid; place-items: center; }
    .pace-aj-sec-titulo { font-size: var(--size-meta); letter-spacing: var(--track-meta); text-transform: uppercase; color: var(--ink-3); font-weight: 500; margin: 2px 0 6px; }
    .pace-aj-div { height: 1px; background: var(--line); margin: 10px 0; }

    /* la fila: nombre a la izquierda, control a la derecha. ENVUELVE si no cabe:
       cuando el panel scrollea (pantallas de menos de ~790 px de alto) la barra
       de scroll se come 17 px y a 263 px de ancho «Marca la fase» ya no cabe
       junto a sus tres pildoras; entonces el control baja a su propia linea,
       a la derecha, en vez de partir el nombre en dos (visto en la app real). */
    .pace-aj-fila { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px 10px; min-height: 38px; padding: 3px 0; transition: opacity 180ms; }
    .pace-aj-fila > :last-child { margin-left: auto; }
    .pace-aj-fila[data-atenuada] { opacity: .38; pointer-events: none; }
    .pace-aj-nombre { font-family: var(--font-display); font-style: italic; font-size: 16px; font-weight: 500; color: var(--ink); flex: 1 1 auto; line-height: 1.1; }
    .pace-aj-sub { display: flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 400; color: var(--ink-3); margin-top: 3px; letter-spacing: .1px; }
    .pace-aj-punto { width: 6px; height: 6px; border-radius: 50%; background: var(--pace-aj-m, var(--ink-3)); display: inline-block; flex: 0 0 auto; }
    .pace-aj-nota { font-size: 10.5px; color: var(--ink-3); letter-spacing: .1px; line-height: 1.45; margin: -2px 0 6px; }

    /* pildoras: pista de papel-2 sin borde, la elegida en tinta */
    .pace-aj-pista { display: inline-flex; gap: 2px; padding: 2px; border-radius: 999px; background: var(--paper-2); flex: 0 0 auto; }
    .pace-aj-pild { padding: 4px 9px; min-height: 24px; font-family: var(--font-ui); font-size: 11px; color: var(--ink-2); border-radius: 999px; letter-spacing: .2px; display: inline-flex; align-items: center; gap: 6px; transition: ${TWEAKS_PILL_TRANSITION}; }
    .pace-aj-pild[aria-pressed="true"] { background: var(--ink); color: var(--paper); font-weight: 500; }
    [data-pace-aj-modulo] .pace-aj-pild[aria-pressed="true"] { background: var(--pace-aj-ms); background: color-mix(in srgb, var(--pace-aj-m) 22%, var(--paper)); color: var(--ink); }
    .pace-aj-pild svg { width: 15px; height: 15px; flex: 0 0 auto; fill: none; stroke: currentColor; stroke-width: 1.1; stroke-linecap: round; stroke-linejoin: round; }
    .pace-aj-pild[data-picto] { padding: 4px 9px; }
    [data-pace-aj-modulo] .pace-aj-pild[aria-pressed="true"] svg { stroke: var(--pace-aj-m); fill: var(--pace-aj-ms); }

    /* muestras de paleta: literales a proposito, son la identidad de cada paleta
       y no deben cambiar con la paleta activa */
    .pace-aj-muestra { width: 10px; height: 10px; border-radius: 50%; border: 1px solid var(--line-2); flex: 0 0 auto; display: inline-block; }
    .pace-aj-muestra-crema { background: #F2EDE0; }
    .pace-aj-muestra-oscuro { background: #1d1a14; }
    .pace-aj-muestra-auto { background: linear-gradient(90deg, #F2EDE0 50%, #1d1a14 50%); }
    [data-palette="oscuro"] .pace-aj-muestra-oscuro { border-color: var(--ink-3); }

    /* interruptor */
    .pace-aj-sw { width: 32px; height: 18px; border-radius: 999px; background: var(--line-2); position: relative; flex: 0 0 auto; transition: background-color 180ms; }
    .pace-aj-sw::after { content: ''; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 50%; background: var(--paper); transition: left 180ms; }
    .pace-aj-sw[aria-checked="true"] { background: var(--ink); }
    .pace-aj-sw[aria-checked="true"]::after { left: 16px; }
    [data-pace-aj-modulo] .pace-aj-sw[aria-checked="true"] { background: var(--pace-aj-m); }

    /* escalon (menos · cifra · mas); la cifra en EB Garamond, como las de identidad */
    .pace-aj-paso { display: inline-flex; align-items: center; gap: 8px; font-family: 'EB Garamond', Georgia, serif; font-size: 16px; color: var(--ink); }
    .pace-aj-paso button { width: 26px; height: 26px; display: grid; place-items: center; font-family: var(--font-ui); font-size: 14px; color: var(--ink-2); background: var(--paper-2); border: 1px solid var(--line); border-radius: 50%; }

    /* acciones de Tus datos: una fila cada una, con su icono a la derecha */
    .pace-aj-accion { display: flex; justify-content: space-between; align-items: center; width: 100%; min-height: 34px; text-align: left; font-family: var(--font-display); font-style: italic; font-size: 15px; color: var(--ink); border-top: 1px solid var(--line); }
    .pace-aj-accion:first-of-type { border-top: 0; }
    .pace-aj-accion[data-suave] { color: var(--ink-3); font-size: 14px; }
    .pace-aj-accion > span:last-child { color: var(--ink-3); display: inline-flex; align-items: center; }
    .pace-aj-msg { font-size: 10.5px; font-family: var(--font-display); font-style: italic; text-align: center; margin: 6px 0; letter-spacing: .1px; }
    .pace-aj-pie { display: flex; justify-content: space-between; gap: 10px; font-size: 10.5px; color: var(--ink-3); letter-spacing: .2px; margin-top: 12px; }
    .pace-aj-pie a { color: var(--ink-3); text-decoration: none; border-bottom: 1px solid var(--line); padding-bottom: 1px; }
  `;
  document.head.appendChild(s);
}

/* ============================================================
   CSS responsive del TweaksPanel (sesión 27 · v0.12.10).

   El TweaksPanel es el único "modal" que no usa <Modal> — es un
   panel flotante 320×auto anclado bottom-right. En móvil eso
   rompe: 320 de 375 tapa casi toda la pantalla con los bordes
   pegados a la derecha, queda un rail de 31px inútil a la izq,
   y la animación `slide-up` empuja contra el borde sin margen.

   Patrón resuelto: bottom sheet. Pegado a bottom:0 left:0 right:0,
   esquinas superiores redondeadas, sin border laterales (el border
   superior actúa como handle visual), maxHeight 72vh para que el
   backdrop oscuro de fondo (que no hay — TweaksPanel no tiene
   overlay) deje ver que la home sigue viva detrás.

   Nota: TweaksPanel no tiene backdrop, pero eso también es
   coherente con que se use como "afinador" mientras la app sigue
   funcionando. Se conserva la filosofía.
   ============================================================ */
const _paceTweaksResponsive = document.getElementById('pace-tweaks-responsive-css');
if (!_paceTweaksResponsive) {
  const s = document.createElement('style');
  s.id = 'pace-tweaks-responsive-css';
  s.textContent = `
    @media (max-width: 640px) {
      [data-pace-tweaks-panel] {
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: auto !important;
        max-height: 72vh !important;
        max-height: 72dvh !important;
        border-radius: var(--r-lg) var(--r-lg) 0 0 !important;
        border-left: 0 !important;
        border-right: 0 !important;
        border-bottom: 0 !important;
        padding: 16px 18px 24px !important;
        box-shadow: 0 -8px 32px rgba(31, 28, 23, 0.18) !important;
      }
    }
  `;
  document.head.appendChild(s);
}

Object.assign(window, { tweaksStyles, TWEAKS_PILL_TRANSITION });
