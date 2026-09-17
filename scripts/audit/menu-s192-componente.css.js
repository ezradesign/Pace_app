/* PACE · estilos de «A tu ritmo» dentro del calco (s192 · rondas 1 a 3)
 * ===================================================================
 * Solo tokens de la app (`var(--…)`), y el lenguaje de lo que ya existe: la tarjeta
 * del Camino sugerido (papel, línea, radio md, sombra suave, cejilla de 9 px con
 * 0,16 em), los nombres en cursiva display y la versalita para lo que es sistema.
 * Colores por módulo como en las actividades: Estira = --extra, Mueve = --move,
 * Respira = --breathe, agua = --hydrate, foco = --focus, comida = --ink-2.
 */
'use strict';

const CSS_MENU = `
[data-pm] { font-family: var(--font-ui); color: var(--ink); box-sizing: border-box; }
[data-pm] * { box-sizing: border-box; }
/* :where() deja el reset en especificidad 0,0,1: con [data-pm] button (0,1,1) le
   ganaba a .pm-enlace y los enlaces salían en sans a 15 px (medido en la ronda 1). */
:where([data-pm]) button { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; }

.pm-wrap { flex-shrink: 0; padding: 0 40px 12px; position: relative; z-index: 1; }
.pm-panel { background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-md);
  box-shadow: var(--sh-soft); padding: 16px 22px 14px; }
.pm-eyebrow { font-size: 9px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-3); }
.pm-titulo { font-family: var(--font-display); font-style: italic; font-weight: 500; font-size: 19px; line-height: 1.15; color: var(--ink); }
.pm-sub { font-family: var(--font-display); font-style: italic; font-size: 13px; color: var(--ink-3); line-height: 1.25; margin-top: 2px; }
.pm-meta { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); }
.pm-enlace { font-family: var(--font-display); font-style: italic; font-size: 12px; letter-spacing: 0.04em; color: var(--ink-3);
  text-decoration: underline; text-underline-offset: 3px; white-space: nowrap; }
.pm-enlace:hover { color: var(--ink); }
.pm-enlace.pm-fuerte { color: var(--focus-cta); }
.pm-cab { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.pm-pie { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 12px; }
.pm-pie-der { display: flex; gap: 14px; align-items: center; }

/* PREGUNTA */
.pm-chips { display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap; }
.pm-chip { flex: 1 1 0; min-width: 0; border: 1px solid var(--line) !important; border-radius: var(--r-md) !important;
  padding: 10px 14px !important; text-align: left; background: var(--paper) !important;
  transition: background var(--dur-quick) var(--ease), border-color var(--dur-quick) var(--ease); }
.pm-chip:hover { background: var(--focus-soft) !important; border-color: var(--focus-cta) !important; }
.pm-chip b { display: block; font-family: var(--font-display); font-style: italic; font-weight: 500; font-size: 16px; color: var(--ink); line-height: 1.1; }
.pm-chip > span { display: block; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); margin-top: 4px; }

/* CONTEXTO */
.pm-ctx { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
.pm-ctx span { font-size: 10px; letter-spacing: 0.08em; color: var(--ink-2); border: 1px solid var(--line);
  border-radius: var(--r-pill); padding: 3px 9px; white-space: nowrap; }

/* LINEA DEL DIA (escritorio) — proporcional al tiempo */
.pm-linea { position: relative; display: flex; align-items: center; margin: 22px 4px 0; height: 14px; }
.pm-seg { height: 4px; border-radius: 2px; background: var(--paper-3); position: relative; }
.pm-seg.pm-ahora { background: var(--focus); }
.pm-seg.pm-comida { background: repeating-linear-gradient(90deg, var(--line) 0 4px, transparent 4px 8px); height: 2px; }
.pm-nodo { flex: 0 0 auto; width: 12px; height: 12px; border-radius: 50%; border: 2px solid var(--c, var(--ink-3));
  background: var(--paper); margin: 0 3px; position: relative; transition: transform var(--dur-quick) var(--ease); }
.pm-nodo.pm-larga { width: 22px; border-radius: 6px; }
.pm-nodo.pm-toca { cursor: pointer; }
.pm-nodo.pm-toca:hover { transform: scale(1.25); background: var(--c); }
.pm-ahora-tag { position: absolute; left: 0; bottom: 9px; font-size: 9px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--focus); white-space: nowrap; }
.pm-etiq { position: absolute; top: 18px; left: 50%; transform: translateX(-50%); width: max-content; max-width: 132px; text-align: center; line-height: 1.22; }
/* Los niveles los coloca el JS (hasta tres, de forma voraz): escribe el top de cada
   etiqueta y, en las que bajan, la altura del hilo que las une a su parada. */
.pm-etiq.pm-alta::before { content: ''; position: absolute; left: 50%; bottom: 100%; height: var(--pm-sube, 40px); border-left: 1px solid var(--line); }
.pm-etiq.pm-alta.pm-final::before { left: auto; right: 6px; }
.pm-etiq .pm-h { font-size: 10px; letter-spacing: 0.06em; color: var(--ink-3); font-variant-numeric: tabular-nums; }
.pm-etiq .pm-n { font-family: var(--font-display); font-style: italic; font-size: 13px; line-height: 1.12; color: var(--ink); }
.pm-etiq .pm-m { font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); margin-top: 1px; white-space: nowrap; }
.pm-etiq.pm-final { left: auto; right: -6px; transform: none; text-align: right; }
.pm-etiq.pm-inicial { left: -6px; transform: none; text-align: left; }
.pm-zona { height: 52px; }

/* COMPACTO (móvil) */
.pm-mini { display: flex; align-items: center; height: 12px; margin: 14px 0 10px; }
.pm-mini .pm-nodo { width: 8px; height: 8px; border-width: 2px; margin: 0 2px; }
.pm-mini .pm-nodo.pm-larga { width: 14px; border-radius: 4px; }
.pm-fila { display: grid; grid-template-columns: 52px 1fr auto; align-items: center; gap: 8px; padding: 7px 0; border-top: 1px solid var(--paper-3); }
.pm-fila .pm-meta { font-size: 9px; }
.pm-que { min-width: 0; }
.pm-que .pm-n { font-family: var(--font-display); font-style: italic; font-size: 16px; line-height: 1.15; color: var(--ink); }
.pm-que .pm-m { font-size: 11px; color: var(--ink-3); margin-top: 1px; }
.pm-otra { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3);
  border: 1px solid var(--line) !important; border-radius: var(--r-pill) !important; padding: 5px 10px !important; min-height: 28px; }
.pm-otra:hover { color: var(--ink); border-color: var(--line-2) !important; }

/* LISTA (hoja y modal) */
.pm-lista { margin-top: 14px; }
.pm-li { display: grid; grid-template-columns: 44px 18px 1fr auto; gap: 0 10px; align-items: start; }
.pm-li .pm-h { font-size: 11px; color: var(--ink-3); font-variant-numeric: tabular-nums; padding-top: 3px; text-align: right; }
.pm-eje { position: relative; align-self: stretch; }
.pm-eje::before { content: ''; position: absolute; left: 8px; top: 0; bottom: 0; border-left: 1px solid var(--line); }
.pm-eje i { position: absolute; left: 3px; top: 5px; width: 11px; height: 11px; border-radius: 50%; border: 2px solid var(--c); background: var(--paper); }
.pm-li.pm-foco { min-height: 26px; }
.pm-li.pm-foco .pm-txt { font-size: 11px; color: var(--ink-3); padding-top: 3px; }
.pm-li.pm-foco .pm-eje::before { border-left: 3px solid var(--paper-3); left: 7px; }
.pm-li.pm-libre .pm-eje::before { border-left: 1px dotted var(--line-2); left: 8px; }
.pm-li.pm-plato { padding-bottom: 10px; }
.pm-plato-n { font-family: var(--font-display); font-style: italic; font-size: 17px; line-height: 1.15; color: var(--ink); }
.pm-plato-m { font-size: 11px; color: var(--ink-3); margin-top: 2px; }

/* HOJA / MODAL */
.pm-velo { position: fixed; inset: 0; background: rgba(31, 28, 23, 0.32); z-index: 50; display: flex; }
.pm-velo.pm-modal { align-items: center; justify-content: center; }
.pm-velo.pm-hoja { align-items: flex-end; }
.pm-caja { background: var(--paper); box-shadow: var(--sh-modal); display: flex; flex-direction: column; }
.pm-modal .pm-caja { width: 600px; max-width: calc(100% - 48px); max-height: calc(100% - 64px); border-radius: var(--r-lg); padding: 26px 30px 20px; }
.pm-hoja .pm-caja { width: 100%; max-height: 82%; border-radius: var(--r-lg) var(--r-lg) 0 0; padding: 10px 20px 16px; }
.pm-asa { width: 36px; height: 4px; border-radius: 2px; background: var(--line); margin: 0 auto 12px; }
.pm-cuerpo { overflow-y: auto; min-height: 0; flex: 1; }
.pm-cerrar { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; color: var(--ink-3); flex-shrink: 0; }
.pm-cerrar:hover { background: var(--paper-2); color: var(--ink); }
.pm-cta { background: var(--focus-cta) !important; color: var(--paper) !important; border-radius: var(--r-pill) !important;
  padding: 11px 24px !important; font-family: var(--font-display) !important; font-style: italic; font-size: 16px; }
.pm-acciones { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding-top: 14px; border-top: 1px solid var(--paper-3); margin-top: 6px; }

/* GLIFOS (ronda 2, decididos: solo en las paradas) — los de la ActivityBar, a trazo fino
   y en el color de su módulo. Nunca se SUMAN a un punto: lo sustituyen. */
.pm-g { display: inline-grid; place-items: center; color: var(--c); line-height: 0; flex-shrink: 0; }
.pm-g svg { width: 100%; height: 100%; display: block; }
.pm-linea:has(.pm-gnodo) { height: 24px; }
.pm-nodo.pm-gnodo { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; gap: 1px;
  border-width: 1px; border-color: color-mix(in srgb, var(--c) 50%, transparent); margin: 0 2px; }
.pm-nodo.pm-gnodo .pm-g { width: 16px; height: 16px; }
.pm-nodo.pm-gnodo.pm-larga { width: 40px; border-radius: 12px; }
.pm-nodo.pm-gnodo.pm-toca:hover { transform: scale(1.12); background: color-mix(in srgb, var(--c) 12%, var(--paper)); }
.pm-gnodo .pm-etiq { top: 30px; }
.pm-linea:has(.pm-gnodo) .pm-ahora-tag { bottom: 16px; }
/* COMIDA (ronda 3): su glifo propio, en tinta, en un aro sobre el tramo punteado.
   No se toca para cambiar: comer no es un plato del menú. */
.pm-comida-nodo { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 24px; height: 24px;
  border-radius: 50%; border: 1px solid color-mix(in srgb, var(--c) 35%, transparent); background: var(--paper);
  display: grid; place-items: center; }
.pm-comida-nodo .pm-g { width: 17px; height: 17px; }
.pm-seg.pm-libre { background: repeating-linear-gradient(90deg, var(--line) 0 2px, transparent 2px 5px); height: 2px; }

/* HORARIO (ronda 3): la hora se edita dentro de la frase. Un <select> nativo con
   aspecto de texto subrayado; el padding vertical agranda la zona de toque sin
   mover la línea. */
.pm-frase { margin-top: 3px; }
.pm-sel { appearance: none; -webkit-appearance: none; font: inherit; color: var(--ink); cursor: pointer;
  background: transparent url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 7 5'%3E%3Cpath d='M.5.8 3.5 4 6.5.8' fill='none' stroke='%238A8372' stroke-width='1.1'/%3E%3C/svg%3E") no-repeat right 1px center / 7px 5px;
  border: 0; border-bottom: 1px dotted var(--line-2); border-radius: 0; padding: 6px 11px 1px 1px; margin: -6px 1px 0;
  field-sizing: content; }
.pm-sel:hover { border-bottom-color: var(--ink-3); }
.pm-sel:focus-visible { outline: 2px solid var(--focus-cta); outline-offset: 2px; }
.pm-g-gota { width: 11px; height: 11px; margin-left: 4px; vertical-align: -2px; opacity: 0.9; }
.pm-etiq .pm-g-gota { width: 10px; height: 10px; margin-left: 3px; }
.pm-g-fila { width: 18px; height: 18px; margin-right: 6px; vertical-align: -3px; }
.pm-eje i.pm-gi { left: -3px; top: 0; width: 24px; height: 24px; border-width: 1px; border-color: color-mix(in srgb, var(--c) 50%, transparent);
  display: grid; place-items: center; }
.pm-eje i.pm-gi.pm-larga { height: 42px; border-radius: 12px; grid-auto-flow: row; align-content: center; gap: 1px; }
.pm-eje i.pm-gi .pm-g { width: 15px; height: 15px; }

/* RONDA 4 — bajo el aro, la hora de fin debajo del nombre */
.pm-hasta { font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink-3); text-align: center; margin-top: 3px; }
/* El resumen y las dos acciones, a la derecha, en la franja de «Ahora» */
.pm-sobre { position: absolute; right: 0; top: -21px; display: flex; align-items: center; gap: 14px; }
.pm-sobre .pm-meta { font-size: 9px; letter-spacing: 0.14em; }
/* Llegar tarde con «que me pregunte»: las dos salidas en lugar de la línea */
.pm-aviso { margin-top: 14px; }
.pm-aviso-t { font-family: var(--font-display); font-style: italic; font-size: 15px; color: var(--ink-2); }
.pm-aviso-b { display: flex; gap: 10px; margin-top: 10px; }
.pm-aviso-b .pm-chip b { font-size: 15px; }
/* En móvil, las dos salidas lado a lado: apiladas pedían 10-28 px de scroll a 360. */
@media (max-width: 640px) {
  .pm-aviso { margin-top: 10px; }
  .pm-aviso-t { font-size: 14px; }
  .pm-aviso-b { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; }
  .pm-aviso-b .pm-chip { padding: 8px 10px !important; }
  .pm-aviso-b .pm-chip b { font-size: 14px; }
}

/* El enlace de vuelta desde «por libre», junto a «Ver caminos» */
.pm-b-fila { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-top: 6px; }
.pm-b-fila > div { margin-top: 0 !important; }

@media (max-width: 640px) {
  .pm-wrap { padding: 0 14px 10px; }
  .pm-panel { padding: 12px 14px 10px; }
  .pm-chips { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
  .pm-chip { padding: 9px 12px !important; }
  .pm-chip b { font-size: 15px; }
  .pm-pie { margin-top: 8px; }
  .pm-titulo { font-size: 17px; }
}
`;

module.exports = { CSS_MENU };
