/* PACE · los dibujos de los módulos (los de la app, ActivityBar.jsx) como máscaras CSS: --g-foco, --g-respira… */
'use strict';
const GLIFOS = {
  foco: '<circle cx="14" cy="14" r="9.5" opacity="0.3"/><path d="M14 4.5a9.5 9.5 0 0 1 8.23 4.75"/><circle cx="22.23" cy="9.25" r="1.5" fill="black" stroke="none"/>',
  respira: '<path d="M14 4.5v9"/><path d="M14 10.5c-1.2 0-2.2-.4-3-1.2 M14 10.5c1.2 0 2.2-.4 3-1.2"/><path d="M11 10.2c-2.2.3-4.2 1.4-5.3 3.3-1.3 2.2-1.4 5-.6 7.6.5 1.6 1.6 2.7 3.1 2.8 1.4.1 2.4-.8 2.8-2.2.6-2.1.8-4.6.8-7.1 0-1.7-.1-3.2-.8-4.4z"/><path d="M17 10.2c2.2.3 4.2 1.4 5.3 3.3 1.3 2.2 1.4 5 .6 7.6-.5 1.6-1.6 2.7-3.1 2.8-1.4.1-2.4-.8-2.8-2.2-.6-2.1-.8-4.6-.8-7.1 0-1.7.1-3.2.8-4.4z"/>',
  mueve: '<rect x="3" y="10" width="2.2" height="8" rx="0.6"/><rect x="5.6" y="8" width="2.4" height="12" rx="0.6"/><path d="M8 14h12"/><rect x="20" y="8" width="2.4" height="12" rx="0.6"/><rect x="22.8" y="10" width="2.2" height="8" rx="0.6"/>',
  estira: '<path d="M4 21c3-8 7-12 10-12s7 4 10 12"/><circle cx="14" cy="7.5" r="1.6"/><path d="M4 22h20" opacity="0.35" stroke-dasharray="1.5 2.5"/>',
  agua: '<path d="M14 3.5c-3.6 5.2-7 8.6-7 12.6a7 7 0 0 0 14 0c0-4-3.4-7.4-7-12.6z"/><path d="M10.5 15.5c0 2 1.3 3.6 3 3.9" opacity="0.55"/>',
};
function cssGlifos() {
  return ':root, #pace-landing {' + Object.entries(GLIFOS).map(([k, v]) => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" fill="none" stroke="black" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">' + v + '</svg>';
    return '--g-' + k + ': url("data:image/svg+xml,' + encodeURIComponent(svg) + '");';
  }).join(' ') + '}\n';
}
module.exports = cssGlifos;
