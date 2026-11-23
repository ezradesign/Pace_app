/* 3C · El último logro sale de la barra: la colección sigue en el sello de arriba. */
window.__maquetaLogroFuera = true;
(() => {
  const f = document.querySelector('[data-pace-sidebar-ultimo]');
  if (!f) return;
  const sec = f.parentElement;
  const regla = sec.previousElementSibling;
  sec.style.display = 'none';
  if (regla) regla.style.display = 'none';
})();
