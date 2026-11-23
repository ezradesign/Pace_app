/* 3B y 3C · quitan el bloque entero (con su regla de arriba): 3B solo si no hay logro; 3C siempre. */
(() => {
  const siempre = window.__maquetaLogroFuera === true;
  const f = document.querySelector('[data-pace-sidebar-ultimo]');
  if (!f || (!siempre && f.getAttribute('data-pace-sidebar-ultimo') !== '')) return;
  const sec = f.parentElement;
  const regla = sec.previousElementSibling;
  sec.style.display = 'none';
  if (regla) regla.style.display = 'none';
})();
