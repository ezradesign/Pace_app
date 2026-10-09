/* PACE · app/breakmenu/BreakMenu.css.jsx — LA PAUSA «COMO SU TARJETA»
   ===================================================================
   Ez pidió una pausa «más elegante y con mejor letra», porque desentonaba con el
   resto de la app, y eligió la opción A mirando las fotos de la app real
   (docs/traspaso/archivos/pausa-8oct/): el plato se viste como la tarjeta de su
   rutina en la biblioteca (papel tonal y filo de 3 px del color del módulo, el
   de `.pace-lib-card`), la línea de contexto es la misma `.pace-lib-ctx` de la
   biblioteca, los botones son píldoras en la serif itálica de «Empezar foco» y
   «Comienza», e Hidrátate es una fila sin caja bajo una línea fina, para que no
   compita con el plato. Las cuatro puertas del menú sin «A tu ritmo» siguen
   rellenas de color, como antes (Ez).

   El color va en `--c`, que pone cada elemento: el del MÓDULO de la rutina, no el
   terracota de Respira para todo, que era lo que desentonaba.

   Hoja inyectada una vez, patrón de `library.css.jsx`. Ni un backtick dentro del
   template literal: el build aborta. */
(function () {
  if (document.getElementById('pace-break-css')) return;
  var s = document.createElement('style');
  s.id = 'pace-break-css';
  s.textContent = `
.pace-break-plato {
  --c: var(--extra);
  background: var(--paper-2); border-radius: var(--r-md); border-left: 3px solid var(--c);
  padding: 14px 16px 14px 14px; display: grid; grid-template-columns: 60px minmax(0, 1fr);
  gap: 0 16px; align-items: center; color: var(--ink);
}
.pace-break-plato.pace-break-sin-glifo { grid-template-columns: minmax(0, 1fr); }
.pace-break-glifo { color: var(--c); width: 60px; height: 60px; display: grid; place-items: center; line-height: 1; }
/* Los glifos de módulo (pulmones, gota, cubiertos) son de 26 px: crecen a la caja. Los de
   ejercicio ya llegan a su tamaño. */
.pace-break-glifo-mod > svg { width: 74%; height: 74%; }
.pace-break-motivo {
  font-size: 10.5px; letter-spacing: .14em; text-transform: uppercase; font-weight: 500;
  color: var(--c); line-height: 1.35;
}
.pace-break-nombre {
  font-family: var(--font-display); font-style: italic; font-weight: 500; font-size: 26px;
  line-height: 1.12; margin: 2px 0 3px; color: var(--ink);
}
.pace-break-acciones { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.pace-break-pildora {
  display: inline-flex; align-items: center; justify-content: center; min-height: 44px;
  box-sizing: border-box; padding: 0 24px; border-radius: var(--r-pill); cursor: pointer;
  font-family: var(--font-display); font-style: italic; font-weight: 500; font-size: 17px;
  line-height: 1; white-space: nowrap;
  transition: background var(--dur-quick) var(--ease), border-color var(--dur-quick) var(--ease);
}
.pace-break-llena { --c: var(--extra); background: var(--c); color: var(--paper); border: 1px solid var(--c); }
.pace-break-llena:hover { background: color-mix(in srgb, var(--c) 86%, var(--ink)); }
.pace-break-tonal { background: var(--paper-2); color: var(--ink); border: 1px solid var(--line-2); }
.pace-break-tonal:hover { border-color: var(--ink-3); }
.pace-break-pildora:focus-visible, .pace-break-agua:focus-visible, .pace-break-saltar:focus-visible {
  outline: 2px solid var(--focus-cta); outline-offset: 2px;
}
.pace-break-agua {
  display: flex; align-items: center; gap: 12px; width: 100%; background: none; border: 0;
  border-top: 1px solid var(--line); padding: 12px 2px 4px; color: var(--ink); cursor: pointer;
  text-align: left; font: inherit;
}
.pace-break-agua .pace-break-glifo { --c: var(--hydrate); width: 22px; height: 22px; }
.pace-break-agua .pace-break-glifo > svg { width: 22px; height: 22px; }
.pace-break-agua b { font-family: var(--font-display); font-style: italic; font-weight: 500; font-size: 19px; }
.pace-break-agua .pace-break-mas { font-family: var(--font-display); font-style: italic; font-size: 15px; color: var(--ink-3); }
.pace-break-agua i { margin-left: auto; font-style: normal; color: var(--ink-3); font-size: 18px; }
.pace-break-agua:hover i { color: var(--ink); }
.pace-break-pie { display: flex; justify-content: flex-end; align-items: center; }
.pace-break-saltar {
  background: none; border: 0; padding: 10px 0; cursor: pointer; white-space: nowrap;
  font-family: var(--font-display); font-style: italic; font-size: 15px; color: var(--ink-3);
  text-decoration: underline; text-underline-offset: 3px;
}
.pace-break-saltar:hover { color: var(--ink); }

/* El móvil: las píldoras una debajo de otra y a lo ancho, como «Empezar» en la vista
   previa de una rutina; partidas en dos filas de anchos distintos quedaban torcidas. */
@media (max-width: 640px) {
  .pace-break-acciones { flex-direction: column; align-items: stretch; gap: 8px; }
  .pace-break-acciones .pace-break-pildora { width: 100%; }
  .pace-break-plato { grid-template-columns: 52px minmax(0, 1fr); gap: 0 14px; }
  .pace-break-plato .pace-break-glifo { width: 52px; height: 52px; }
}
`;
  document.head.appendChild(s);
})();
