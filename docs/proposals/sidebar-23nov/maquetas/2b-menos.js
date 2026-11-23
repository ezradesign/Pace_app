/* 2B · Con algún vaso, un «−» fijo a la izquierda de «+ vaso». */
(() => {
  const b = document.querySelector('[data-pace-hoy-celda][data-modulo="water"]');
  if (!b || b.querySelector('[data-maqueta-menos]')) return;
  const v = b.querySelector('[data-pace-hoy-vaso]');
  const m = v.cloneNode(false);
  m.setAttribute('data-maqueta-menos', '');
  m.textContent = '−';
  m.style.marginLeft = 'auto'; m.style.marginRight = '6px'; m.style.padding = '3px 8px';
  v.style.marginLeft = '0';
  b.insertBefore(m, v);
})();
