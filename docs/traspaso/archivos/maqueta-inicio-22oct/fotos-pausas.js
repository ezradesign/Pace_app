// Fotos de la app REAL (index.html, servido en 8803) para la pregunta 4 de la página: las pausas
// con bloques cortos. Lo que todavía no existe se pinta encima del DOM real, nunca se redibuja.
// «Después de cada bloque» se fotografía con el motor del día de verdad, cambiando solo su tope de
// 30 min seguidos por 0 (una pausa tras cada bloque).
// Uso: node fotos-pausas.js <worktree> <carpeta-de-salida> [solo-medir]
'use strict';
const path = require('path');
const fs = require('fs');
const WT = process.argv[2];
const OUT = process.argv[3];
const SOLO_MEDIR = process.argv[4] === 'solo-medir';
const { chromium } = require(path.join(WT, 'node_modules', 'playwright'));
const sharp = require(path.join(WT, 'node_modules', 'sharp'));
const { asentarGeometria } = require(path.join(WT, 'tests', 'home.helpers.js'));
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:8803/index.html';
const H = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
const MOVIL = { width: 360, height: 730 }, ESC = { width: 1280, height: 879 };

const TX = {
  es: { inv: 'Dos minutos para moverte', hacerla: 'Hacerla', seguir: 'Seguir', seguirBloque: 'Seguir con el bloque 3',
    dosMin: 'Dos minutos', frase: 'De pie, sube y baja los talones', sinRutina: '2 min · sin rutina',
    ej: 'Ejercicio', ritmo: 'A mi ritmo', cada: 'Después de cada bloque', ahoraSi: 'Ahora, si quieres',
    pregunta: '¿Ejercicio después de cada bloque?', ejercicio: 'ejercicio' },
  en: { inv: 'Two minutes to move', hacerla: 'Do it', seguir: 'Keep going', seguirBloque: 'Keep going with block 3',
    dosMin: 'Two minutes', frase: 'Stand up, rise onto your toes', sinRutina: '2 min · no routine',
    ej: 'Exercise', ritmo: 'At my pace', cada: 'After every block', ahoraSi: 'Now, if you like',
    pregunta: 'Exercise after every block?', ejercicio: 'exercise' },
};

/* La 4a nueva (Ez, 22 oct.): «Hacerla» sirve UN ejercicio de Mueve o Estira que se hace junto a la
   mesa, con su título, su instrucción de siempre, su duración y el dibujo GENÉRICO del módulo. */
const EJ = {
  mueve: { es: { modulo: 'mueve', mod: 'Mueve', titulo: 'Elevación de talones', veces: '25 veces', resta: '00:22',
    accion: 'Sube los talones lo más alto que puedas. Baja con control.' },
    en: { modulo: 'mueve', mod: 'Move', titulo: 'Calf raises', veces: '25 times', resta: '00:22',
    accion: 'Raise your heels as high as you can. Lower with control.' } },
  estira: { es: { modulo: 'estira', mod: 'Estira', titulo: 'Barbilla atrás', veces: '5 veces', resta: '00:31',
    accion: 'Desliza la barbilla recta hacia atrás. La nuca se alarga. Mantén y suelta.' },
    en: { modulo: 'estira', mod: 'Stretch', titulo: 'Chin tucks', veces: '5 times', resta: '00:31',
    accion: 'Glide your chin straight back. The back of your neck lengthens. Hold and release.' } },
};
const INV = {
  A: { es: 'Un momento para moverte', en: 'A moment to move' },
  B: { es: 'Un ejercicio antes de seguir', en: 'One exercise before you go on' },
  C: { es: 'Elevación de talones · 30 s', en: 'Calf raises · 30 s' },
  /* el nombre más largo del reparto, para ver si la C cabe */
  D: { es: 'Rotación torácica de pie · 20 s por lado', en: 'Standing thoracic rotation · 20 s per side' },
};

async function abrir(b, { vp, lang, movil, dia, cada }) {
  const ctx = await b.newContext({ viewport: vp, isMobile: !!movil, hasTouch: !!movil, deviceScaleFactor: movil ? 2 : 1,
    locale: 'es-ES', timezoneId: 'Europe/Madrid' });
  await ctx.addInitScript(([st]) => {
    try { Object.defineProperty(Notification, 'permission', { get: () => 'default' }); } catch (e) {}
    if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(st));
  }, [{ firstSeen: 1, lang, langAuto: false, palette: 'crema', sidebarCollapsed: !!movil, focusMinutes: 10,
    ritmo: dia ? { horario: H } : { libre: true } }]);
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date('2026-10-22T09:00:00+02:00') });
  await page.goto(BASE);
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
  await page.mouse.move(1, 1);
  if (cada) {
    await page.evaluate(() => {
      const src = ritmoComponer.toString();
      if (!/JUNTOS = 30/.test(src)) throw new Error('el motor ya no tiene JUNTOS = 30');
      window.ritmoComponer = (0, eval)('(' + src.replace('JUNTOS = 30', 'JUNTOS = 0') + ')');
    });
  }
  if (dia) {
    await page.evaluate(() => ritmoElegir('jornada'));
    await page.waitForTimeout(200);
  }
  /* el aro a 10 con «Otro», como lo haría la persona (el día lo pone a 45; sin día ya está a 10) */
  if (await page.evaluate(() => getState().focusMinutes) !== 10) {
    await page.getByRole('button', { name: lang === 'es' ? /^otro$/i : /^other$/i }).filter({ visible: true }).first().click();
    await page.locator('input[type=number]').filter({ visible: true }).first().fill('10');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
  }
  return { ctx, page };
}

/* Dos bloques de 10 seguidos: el segundo acaba con 20 min de foco desde el inicio y el aro
   espera el bloque 3 (con el aro corto los bloques se juntan hasta 30 min). */
async function dosBloques(page) {
  for (let i = 0; i < 2; i++) {
    await page.locator('[data-pace-cta]').filter({ visible: true }).first().click();
    await page.clock.fastForward(10 * 60 * 1000 + 2000);
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
  }
}

const SCROLL = () => {
  const body = Array.from(document.querySelectorAll('[data-pace-home-body]')).find((e) => e.getBoundingClientRect().width > 0);
  return body ? body.scrollHeight - body.clientHeight : null;
};

/* Lo que se pinta encima. Todas reciben los textos del idioma. */
const PINTA = {
  /* 4a · A: la invitación en el aro: la frase, «Hacerla» y «Seguir» en fila (como «Continuar ·
     Reiniciar bloque» cuando el bloque está en pausa: misma fila, mismo alto). */
  invitacionAro(x) {
    const v = (s) => Array.from(document.querySelectorAll(s)).find((e) => e.getBoundingClientRect().width > 0);
    v('[data-pace-dial-subtitle]').textContent = x.inv;
    const cta = v('[data-pace-cta]');
    cta.textContent = x.hacerla;
    const l = document.createElement('button');
    l.textContent = x.seguir;
    l.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 10px;white-space:nowrap;background:transparent;border:none;color:var(--ink-3);font-family:var(--font-display);font-style:italic;font-size:13px;letter-spacing:0.02em;text-decoration:underline;text-underline-offset:4px';
    cta.after(l);
  },
  /* 4a · lo que ve quien pulsa «Hacerla»: el aro cuenta dos minutos con una frase (de ejemplo). */
  hacerla(x) {
    const v = (s) => Array.from(document.querySelectorAll(s)).find((e) => e.getBoundingClientRect().width > 0);
    v('[data-pace-dial-label]').textContent = x.dosMin;
    v('[data-pace-dial-number]').textContent = '01:42';
    v('[data-pace-dial-subtitle]').textContent = x.frase;
    const cta = v('[data-pace-cta]');
    cta.textContent = x.seguirBloque;
    cta.style.cssText += ';background:var(--paper);color:var(--ink);border:1px solid var(--line-2)';
  },
  /* 4a · B: la invitación en la lista del día (móvil: la fila «Ahora» de la tarjeta; ordenador: la
     barra lateral, donde dice la siguiente pausa) y el aro dice «Seguir con el bloque 3». */
  invitacionLista(x) {
    const v = (s) => Array.from(document.querySelectorAll(s)).find((e) => e.getBoundingClientRect().width > 0);
    const cta = v('[data-pace-cta]');
    cta.textContent = x.seguirBloque;
    const filas = Array.from(document.querySelectorAll('.pace-rt-fila')).filter((e) => e.getBoundingClientRect().width > 0);
    if (filas.length >= 2) {
      const [a, l] = filas;
      /* el dibujo de Mueve de la pausa de luego, antes de que esa fila pase a ser el bloque 3 */
      const g = l.querySelector('.pace-rt-n .pace-rt-g');
      const glifo = g ? g.cloneNode(true) : null;
      /* Luego: el bloque 3, con lo que decía la fila de ahora */
      const meta = l.querySelector('.pace-rt-meta');
      l.querySelector('.pace-rt-que').innerHTML = a.querySelector('.pace-rt-que').innerHTML;
      const otraL = l.querySelector('.pace-rt-otra'); if (otraL) otraL.replaceWith(document.createElement('span'));
      meta.innerHTML = meta.innerHTML.replace('9:30', '9:22');
      /* Ahora: la invitación, con «Hacerla» en el hueco de «Otra» */
      const n = a.querySelector('.pace-rt-n');
      n.textContent = x.inv; if (glifo) n.prepend(glifo);
      a.querySelector('.pace-rt-m').textContent = x.sinRutina;
      const b = document.createElement('button'); b.className = 'pace-rt-otra'; b.textContent = x.hacerla;
      a.lastElementChild.replaceWith(b);
    }
    const sig = Array.from(document.querySelectorAll('.pace-meta')).find((e) => /siguiente pausa|next break/i.test(e.textContent) && e.getBoundingClientRect().width > 0);
    if (sig) {
      sig.textContent = x.ahoraSi;
      const fila = sig.parentElement.nextElementSibling;
      if (fila) {
        const nueva = document.createElement('div');
        nueva.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:10px;width:100%';
        nueva.innerHTML = '<div style="display:grid;gap:3px;min-width:0"><div style="font-family:var(--font-display);font-style:italic;font-size:17px;color:var(--ink)">' + x.inv + '</div><div style="font-size:12px;color:var(--ink-3)">' + x.sinRutina + '</div></div><span style="font-family:var(--font-display);font-style:italic;font-size:14px;color:var(--ink);text-decoration:underline;text-underline-offset:4px;white-space:nowrap">' + x.hacerla + ' →</span>';
        fila.replaceWith(nueva);
      }
    }
  },
  /* 4a nueva · A: al pulsar «Hacerla», el aro cuenta lo que dura el ejercicio. Arriba el módulo y
     las veces; bajo la cifra, el dibujo del módulo y el título; donde va la raya, la instrucción. */
  hacerEnAro(x) {
    const e = x.ej;
    const v = (s) => Array.from(document.querySelectorAll(s)).find((el) => el.getBoundingClientRect().width > 0);
    v('[data-pace-dial-label]').textContent = e.mod + ' · ' + e.veces;
    v('[data-pace-dial-number]').textContent = e.resta;
    const sub = v('[data-pace-dial-subtitle]');
    sub.textContent = '';
    sub.style.cssText += ';color:var(--ink);font-size:17px;display:inline-flex;align-items:center;gap:7px;justify-content:center;margin-top:12px';
    const g = document.createElement('span'); g.style.cssText = 'width:20px;height:20px;display:inline-grid';
    ReactDOM.flushSync(() => ReactDOM.createRoot(g).render(React.createElement(window.RitmoGlifo, { modulo: e.modulo })));
    sub.appendChild(g); sub.appendChild(document.createTextNode(e.titulo));
    /* la raya de debajo deja sitio a la instrucción */
    const raya = sub.nextElementSibling;
    const ins = document.createElement('div');
    ins.textContent = e.accion;
    ins.style.cssText = 'font-size:12.5px;line-height:1.35;color:var(--ink-2);max-width:230px;margin:6px auto 0;text-align:center;text-wrap:balance';
    if (raya && raya.getBoundingClientRect().height <= 3) raya.replaceWith(ins); else sub.after(ins);
    const cta = v('[data-pace-cta]');
    cta.textContent = x.seguirBloque;
    cta.style.cssText += ';background:var(--paper);color:var(--ink);border:1px solid var(--line-2)';
  },
  /* 4a nueva · B: al pulsar «Hacerla», una hoja abajo, como la de la pausa, con la instrucción. */
  hacerEnHoja(x) {
    const e = x.ej;
    const capa = document.createElement('div');
    capa.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(40,34,24,0.28);backdrop-filter:blur(3px);display:flex;align-items:flex-end;justify-content:center;padding:12px';
    capa.innerHTML = '<div style="width:100%;max-width:440px;background:var(--paper);border:1px solid var(--line);border-radius:24px;padding:22px 22px 20px;display:grid;gap:14px;box-shadow:0 18px 40px rgba(40,34,24,0.18)">'
      + '<div style="display:flex;justify-content:space-between;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:var(--ink-3);font-weight:500"><span>' + x.inv + '</span><span>×</span></div>'
      + '<div style="display:flex;align-items:center;gap:12px;padding:16px 18px;border-radius:18px;background:var(--paper-2)"><span data-gl style="width:30px;height:30px;display:inline-grid;flex:0 0 auto"></span>'
      + '<div style="display:grid;gap:2px;min-width:0"><span style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:var(--ink-3)">' + e.mod + ' · ' + e.veces + '</span>'
      + '<span style="font-family:var(--font-display);font-style:italic;font-size:23px;color:var(--ink)">' + e.titulo + '</span></div>'
      + '<span style="margin-left:auto;font-family:var(--font-display);font-style:italic;font-size:26px;color:var(--ink)">' + e.resta + '</span></div>'
      + '<div style="font-size:14px;line-height:1.5;color:var(--ink-2)">' + e.accion + '</div>'
      + '<div style="text-align:center;font-family:var(--font-display);font-style:italic;font-size:17px;padding:12px;border-radius:999px;border:1px solid var(--line-2);color:var(--ink)">' + x.seguirBloque + '</div></div>';
    document.body.appendChild(capa);
    ReactDOM.flushSync(() => ReactDOM.createRoot(capa.querySelector('[data-gl]')).render(React.createElement(window.RitmoGlifo, { modulo: e.modulo })));
  },
  /* 4b · A: en el aro, en la línea pequeña bajo la hora (la que dice «Foco breve»), con el aro
     parado y a 5, 10 o 15: «Ejercicio a mi ritmo ▾», el mismo desplegable que las horas del día.
     No añade alto. */
  enElAro(x) {
    const v = (s) => Array.from(document.querySelectorAll(s)).find((e) => e.getBoundingClientRect().width > 0);
    const sub = v('[data-pace-dial-subtitle]');
    sub.textContent = x.ej + ' ';
    const s = document.createElement('select'); s.className = 'pace-rt-sel';
    s.innerHTML = '<option>' + x.ritmo.toLowerCase() + '</option><option>' + x.cada.toLowerCase() + '</option>';
    sub.appendChild(s);
  },
  /* 4b · B: bajo los minutos, solo con el aro a 5, 10 o 15: «Ejercicio · A mi ritmo · Después
     de cada bloque», con las mismas píldoras que los minutos. */
  lineaMinutos(x) {
    const sp = Array.from(document.querySelectorAll('span')).find((e) => /^(min)$/i.test(e.textContent.trim()) && e.getBoundingClientRect().width > 0);
    const fila = sp.parentElement;
    const l = document.createElement('div');
    l.setAttribute('data-pinta-linea', '');
    l.style.cssText = 'display:flex;gap:4px;align-items:center;justify-content:center;margin-top:-6px';
    const pill = 'padding:4px 10px;height:24px;font-size:12.5px;border-radius:var(--r-pill);display:inline-flex;align-items:center;white-space:nowrap;';
    l.innerHTML = '<span style="font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--ink-3);margin-right:8px;font-weight:500">' + x.ej + '</span>'
      + '<span style="' + pill + 'font-weight:600;color:var(--ink);background:var(--paper-3)">' + x.ritmo + '</span>'
      + '<span style="' + pill + 'color:var(--ink-3)">' + x.cada + '</span>';
    fila.after(l);
  },
  /* 4b · C: una pregunta la primera vez que eliges un bloque corto (hoja de abajo, como la de la pausa). */
  hojaPregunta(x) {
    const capa = document.createElement('div');
    capa.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(40,34,24,0.28);backdrop-filter:blur(3px);display:flex;align-items:flex-end;justify-content:center;padding:12px';
    const es = x.ritmo === 'A mi ritmo';
    const op = (t, d, rec) => '<button style="display:grid;gap:3px;text-align:left;width:100%;padding:14px 18px;border-radius:18px;border:1px solid ' + (rec ? 'var(--focus)' : 'var(--line-2)') + ';background:' + (rec ? 'var(--paper-2)' : 'transparent') + ';color:var(--ink)"><span style="font-family:var(--font-display);font-style:italic;font-size:20px">' + t + '</span><span style="font-size:13px;color:var(--ink-3);line-height:1.4">' + d + '</span></button>';
    capa.innerHTML = '<div style="width:100%;max-width:440px;background:var(--paper);border:1px solid var(--line);border-radius:24px;padding:24px 22px 22px;display:grid;gap:14px;box-shadow:0 18px 40px rgba(40,34,24,0.18)">'
      + '<div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:var(--ink-3);font-weight:500">' + (es ? 'Bloques de 10 min' : '10-min blocks') + '</div>'
      + '<div style="font-family:var(--font-display);font-style:italic;font-size:26px;line-height:1.15;color:var(--ink)">' + x.pregunta + '</div>'
      + op(x.ritmo, es ? 'Una pausa cada media hora y, entre medias, dos minutos para moverte si quieres.' : 'A break every half hour and, in between, two minutes to move if you like.', true)
      + op(x.cada, es ? 'Una pausa con rutina al acabar cada bloque.' : 'A break with a routine after each block.', false)
      + '<div style="font-size:12.5px;color:var(--ink-3);text-align:center">' + (es ? 'Lo cambias cuando quieras en Ajustes › Sesiones.' : 'Change it any time in Settings › Sessions.') + '</div></div>';
    document.body.appendChild(capa);
  },
};

async function foto(page, nombre) {
  if (SOLO_MEDIR) return;
  const png = await page.screenshot();
  await sharp(png).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(OUT, nombre + '.jpg'));
}

/* Cada caso: cómo se abre, qué se pinta y si se fotografía. */
const CASOS = [
  { id: 'hoy', dia: true, bloques: true, pinta: [] },
  { id: 'A', dia: true, bloques: true, pinta: ['invitacionAro'] },
  { id: 'A-hacerla', dia: true, bloques: true, pinta: ['hacerla'] },
  { id: 'B', dia: true, bloques: true, pinta: ['invitacionLista'] },
  { id: 'linea', dia: true, bloques: true, pinta: ['lineaMinutos'] },
  { id: 'aro-eleccion', dia: true, bloques: false, pinta: ['enElAro'] },
  /* la 4a nueva: los tres textos de la invitación y lo que sale al pulsar «Hacerla» */
  { id: 'inv-A', dia: true, bloques: true, inv: 'A', pinta: ['invitacionAro'] },
  { id: 'inv-B', dia: true, bloques: true, inv: 'B', pinta: ['invitacionAro'] },
  { id: 'inv-C', dia: true, bloques: true, inv: 'C', pinta: ['invitacionAro'] },
  { id: 'inv-D', dia: true, bloques: true, inv: 'D', pinta: ['invitacionAro'] },
  { id: 'hacer-mueve', dia: true, bloques: true, ej: 'mueve', pinta: ['hacerEnAro'] },
  { id: 'hacer-estira', dia: true, bloques: true, ej: 'estira', pinta: ['hacerEnAro'] },
  { id: 'hacer-estira-libre', dia: false, bloques: true, ej: 'estira', pinta: ['hacerEnAro'] },
  { id: 'hoja-mueve', dia: true, bloques: true, ej: 'mueve', inv: 'A', pinta: ['hacerEnHoja'] },
  { id: 'aro-eleccion-libre', dia: false, bloques: false, pinta: ['enElAro'] },
  { id: 'linea-libre', dia: false, bloques: false, pinta: ['lineaMinutos'] },
  { id: 'hoja', dia: true, bloques: false, pinta: ['hojaPregunta'] },
  /* el día se recompone con el aro a 10 al empezar el bloque 1 */
  { id: 'dia-ritmo', dia: true, bloques: false, empieza: true, pinta: [] },
  { id: 'dia-cada', dia: true, cada: true, bloques: false, empieza: true, pinta: [] },
];

(async () => {
  const b = await chromium.launch();
  const medidas = [];
  try {
    /* SOLO=B,hoja repite solo esos casos */
    const solo = process.env.SOLO ? process.env.SOLO.split(',') : null;
    for (const lang of ['es', 'en']) for (const vp of [MOVIL, { width: 360, height: 640 }, ESC]) for (const c of CASOS) {
      if (solo && !solo.includes(c.id)) continue;
      const movil = vp.width < 700;
      if (!movil && lang === 'en') continue;
      const { ctx, page } = await abrir(b, { vp, lang, movil, dia: c.dia, cada: c.cada });
      if (c.bloques) await dosBloques(page);
      if (c.empieza) {
        await page.locator('[data-pace-cta]').filter({ visible: true }).first().click();
        await page.clock.fastForward(1500);
        await page.waitForTimeout(300);
      }
      const datos = Object.assign({}, TX[lang], c.ej ? { ej: EJ[c.ej][lang] } : {}, c.inv ? { inv: INV[c.inv][lang] } : {});
      for (const p of c.pinta) await page.evaluate(PINTA[p], datos);
      await asentarGeometria(page);
      const m = { caso: c.id, lang, vp: vp.width + '×' + vp.height, scroll: await page.evaluate(SCROLL) };
      /* la fila del aro no se sale del aro: «Hacerla · Seguir» cabe a lo ancho */
      m.lineasSub = await page.evaluate(() => { const e = Array.from(document.querySelectorAll('[data-pace-dial-subtitle]')).find((x) => x.getBoundingClientRect().width > 0); return e ? Math.round(e.getBoundingClientRect().height) : null; });
      m.filaAro = await page.evaluate(() => {
        const cta = Array.from(document.querySelectorAll('[data-pace-cta]')).find((e) => e.getBoundingClientRect().width > 0);
        const r = cta.parentElement.getBoundingClientRect();
        return Math.round(r.width) + ' de ancho, ' + Math.round(r.left) + '→' + Math.round(r.right);
      });
      if (c.id === 'dia-ritmo' || c.id === 'dia-cada') m.pausas = await page.evaluate(() => { const p = ritmoPlan(getState()); return p ? p.m.pausas + ' pausas, ' + p.total + ' bloques' : null; });
      medidas.push(m);
      console.log(JSON.stringify(m));
      if ((lang === 'es' && vp !== ESC && vp.height === 730) || vp === ESC) await foto(page, (movil ? 'm-' : 'e-') + c.id);
      if (lang === 'en' && vp.height === 640 && ['A', 'aro-eleccion', 'linea', 'inv-A', 'hacer-mueve', 'hacer-estira'].includes(c.id)) await foto(page, 'm-' + c.id + '-640-en');
      await ctx.close();
    }
    /* La pausa guiada que sigue llegando a los 30 min (el bloque 3), como hoy. */
    if (!SOLO_MEDIR && !process.env.SOLO) {
      const { ctx, page } = await abrir(b, { vp: MOVIL, lang: 'es', movil: true, dia: true });
      await dosBloques(page);
      await page.locator('[data-pace-cta]').filter({ visible: true }).first().click();
      await page.clock.fastForward(10 * 60 * 1000 + 2000);
      await page.waitForTimeout(500);
      await foto(page, 'm-pausa-30');
      await ctx.close();
    }
  } finally {
    fs.writeFileSync(path.join(OUT, process.env.SOLO ? 'medidas-pausas-solo.json' : 'medidas-pausas.json'), JSON.stringify(medidas, null, 1));
    await b.close();
  }
})();
