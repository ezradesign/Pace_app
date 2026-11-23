/* Para la foto de lo montado (2A): suma un vaso desde la barra, una sola vez por página. */
(() => {
  if (window.__fotoVaso) return;
  window.__fotoVaso = true;
  document.querySelector('[data-pace-sidebar] [data-pace-hoy-celda][data-modulo="water"]').click();
})();
