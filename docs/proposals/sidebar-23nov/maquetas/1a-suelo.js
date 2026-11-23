/* 1A · En el ordenador, la barra no baja de 0,8 (como el cajón del móvil) y lo que no cabe se desplaza sin barra. */
(() => {
  const c = document.querySelector('[data-pace-sidebar-escala]');
  const s = parseFloat(c.style.getPropertyValue('--sb-escala')) || 1;
  if (s >= 0.8 || window.innerWidth <= 640) return;
  c.style.setProperty('--sb-escala', '0.8');
  const l = c.parentElement;
  l.style.overflowY = 'auto'; l.style.scrollbarWidth = 'none';
})();
