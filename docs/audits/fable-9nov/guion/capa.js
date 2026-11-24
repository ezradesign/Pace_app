// Texto y botones solo de la capa de arriba (lo que la persona tiene delante).
module.exports.capa = (page, max = 600) => page.evaluate((max) => {
  let e = document.elementFromPoint(innerWidth / 2, innerHeight / 2), top = null;
  for (let x = e; x && x !== document.body; x = x.parentElement) {
    const s = getComputedStyle(x);
    if (s.position === 'fixed' || x.getAttribute('role') === 'dialog' || x.hasAttribute('data-pace-session-root')) top = x;
  }
  const raiz = top || document.body;
  const vis = (el) => { const b = el.getBoundingClientRect(); const s = getComputedStyle(el); return b.width > 4 && b.height > 4 && s.visibility !== 'hidden' && b.bottom > 0 && b.top < innerHeight; };
  const bs = [];
  raiz.querySelectorAll('button,a[href],[role=button]').forEach((b) => { if (vis(b)) { const t = (b.getAttribute('aria-label') || b.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 44); if (t) bs.push(t); } });
  return (top ? '[capa] ' : '[home] ') + raiz.innerText.replace(/\s+/g, ' ').trim().slice(0, max) + '\n   >> ' + bs.slice(0, 26).join(' | ');
}, max);
