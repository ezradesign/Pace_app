module.exports = () => {
  const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const mix = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 });
  const fondo = el => { const capas = []; for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); const c = parse(cs.backgroundColor); if (cs.backgroundImage !== 'none' && !/gradient/.test(cs.backgroundImage)) return null; if (c && c.a > 0) { capas.push(c); if (c.a >= 1) break; } } let b = { r: 255, g: 255, b: 255, a: 1 }; for (let i = capas.length - 1; i >= 0; i--) b = mix(capas[i], b); return b; };
  const out = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const vistos = new Set();
  while (walker.nextNode()) {
    const n = walker.currentNode; const t = n.textContent.trim(); if (!t) continue;
    const el = n.parentElement; if (vistos.has(el)) continue; vistos.add(el);
    const r = el.getBoundingClientRect(); if (!r.width || r.bottom < 0 || r.top > innerHeight) continue;
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || +cs.opacity === 0) continue;
    let op = 1; for (let e = el; e; e = e.parentElement) op *= +getComputedStyle(e).opacity;
    if (op < 0.2) continue;
    const fg = parse(cs.color); const bg = fondo(el); if (!fg || !bg) continue;
    const f = mix({ ...fg, a: fg.a * op }, bg);
    const L1 = lum(f), L2 = lum(bg); const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const fs = parseFloat(cs.fontSize); const grande = fs >= 24 || (fs >= 18.66 && +cs.fontWeight >= 700);
    if (ratio < (grande ? 3 : 4.5)) out.push(ratio.toFixed(2) + ' ' + fs + 'px «' + t.slice(0, 40) + '»');
  }
  return out;
};
