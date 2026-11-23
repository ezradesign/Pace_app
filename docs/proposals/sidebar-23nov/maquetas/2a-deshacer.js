/* 2A · Tras sumar un vaso, la frase del agua dice «Un vaso más. Deshacer» unos segundos, en su mismo
   sitio y sin empujar nada; luego vuelve a «Cinco vasos de ocho». Aquí, quieta para la foto. */
(() => {
  const b = document.querySelector('[data-pace-hoy-celda][data-modulo="water"]');
  if (!b || b.querySelector('[data-maqueta-deshacer]')) return;
  const en = /glass/.test(b.textContent);
  const frase = b.querySelector('[data-pace-hoy-ic]').nextElementSibling;
  frase.setAttribute('data-maqueta-deshacer', '');
  frase.innerHTML = '<b style="color:var(--ink);font-weight:600">' + (en ? 'One more.' : 'Un vaso más.') + '</b> '
    + '<span style="text-decoration:underline;text-underline-offset:3px;color:var(--ink-2)">' + (en ? 'Undo' : 'Deshacer') + '</span>';
})();
