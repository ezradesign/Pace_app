// Fotos de la app REAL (index.html, servido en 8803) para «5b B, así»: la invitación en el aro,
// la hoja de «Hacerla» y la pantalla de ejercicio de siempre con UN ejercicio, y la vuelta al aro.
// La invitación aún no existe y se pinta encima; la hoja se monta con las piezas de «Tu pausa»
// (Modal y BreakPlato, con sus clases); la pantalla de ejercicio es la de verdad, con una rutina
// de un solo paso (el primero de la rutina de donde sale el ejercicio).
// Uso: node fotos-hacerla.js <worktree> <carpeta-de-salida>
'use strict';
const path = require('path');
const fs = require('fs');
const WT = process.argv[2];
const OUT = process.argv[3];
const { chromium } = require(path.join(WT, 'node_modules', 'playwright'));
const sharp = require(path.join(WT, 'node_modules', 'sharp'));
const { asentarGeometria } = require(path.join(WT, 'tests', 'home.helpers.js'));
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:8803/index.html';
const H = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
const MOVIL = { width: 360, height: 730 }, PEQ = { width: 360, height: 640 }, ESC = { width: 1280, height: 879 };

const TX = {
  es: { inv: 'Un momento para moverte', hacerla: 'Hacerla', seguir: 'Seguir', sub: 'Un ejercicio junto a la mesa.', s: 's' },
  en: { inv: 'A moment to move', hacerla: 'Do it', seguir: 'Keep going', sub: 'One exercise, right by your desk.', s: 's' },
};
/* Los dos ejemplos, del reparto (docs/proposals/hacerla-reparto.md): la primera serie de su rutina. */
const EJ = {
  mueve: { rutina: 'extra.calves', modulo: 'move', dura: 50 },   // Elevación de talones, 25 veces
  estira: { rutina: 'move.neck.3', modulo: 'extra', dura: 40 },  // Barbilla atrás, 5 veces
};

async function abrir(b, { vp, lang, movil }) {
  const ctx = await b.newContext({ viewport: vp, isMobile: !!movil, hasTouch: !!movil, deviceScaleFactor: movil ? 2 : 1,
    locale: 'es-ES', timezoneId: 'Europe/Madrid' });
  await ctx.addInitScript(([st]) => {
    try { Object.defineProperty(Notification, 'permission', { get: () => 'default' }); } catch (e) {}
    if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(st));
  }, [{ firstSeen: 1, lang, langAuto: false, palette: 'crema', sidebarCollapsed: !!movil, focusMinutes: 10,
    ritmo: { horario: H } }]);
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date('2026-10-22T09:00:00+02:00') });
  await page.goto(BASE);
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
  await page.mouse.move(1, 1);
  await page.evaluate(() => ritmoElegir('jornada'));
  await page.waitForTimeout(200);
  if (await page.evaluate(() => getState().focusMinutes) !== 10) {
    await page.getByRole('button', { name: lang === 'es' ? /^otro$/i : /^other$/i }).filter({ visible: true }).first().click();
    await page.locator('input[type=number]').filter({ visible: true }).first().fill('10');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
  }
  /* dos bloques de 10 seguidos: el aro espera el bloque 3 con 20 min de foco */
  for (let i = 0; i < 2; i++) {
    await page.locator('[data-pace-cta]').filter({ visible: true }).first().click();
    await page.clock.fastForward(10 * 60 * 1000 + 2000);
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
  }
  return { ctx, page };
}

const SCROLL = () => {
  const body = Array.from(document.querySelectorAll('[data-pace-home-body]')).find((e) => e.getBoundingClientRect().width > 0);
  return body ? body.scrollHeight - body.clientHeight : null;
};

/* 4a A con el texto de 5a A: la frase bajo la hora, «Hacerla» y «Seguir» en la fila del botón. */
function invitacion(x) {
  const v = (s) => Array.from(document.querySelectorAll(s)).find((e) => e.getBoundingClientRect().width > 0);
  const sub = v('[data-pace-dial-subtitle]');
  sub.dataset.antes = sub.textContent;
  sub.textContent = x.inv;
  const cta = v('[data-pace-cta]');
  cta.dataset.antes = cta.textContent;
  cta.textContent = x.hacerla;
  const l = document.createElement('button');
  l.setAttribute('data-pinta-seguir', '');
  l.textContent = x.seguir;
  l.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 10px;white-space:nowrap;background:transparent;border:none;color:var(--ink-3);font-family:var(--font-display);font-style:italic;font-size:13px;letter-spacing:0.02em;text-decoration:underline;text-underline-offset:4px';
  cta.after(l);
}

/* La hoja de «Hacerla», con las piezas de «Tu pausa»: el plato con el dibujo del MÓDULO, el
   título del ejercicio y lo que dura; «Empezar» lleva a la pantalla de ejercicio. */
function hoja([x, e, lang]) {
  const h = React.createElement;
  const S = window.PACE_STRINGS[lang];
  const fmt = (k, o) => String(S[k]).replace(/\{(\w+)\}/g, (_, n) => o[n]);
  const body = resolveBodyRoutine(e.rutina);
  const paso = body.routine.steps[0];
  const nombre = lang === 'en' ? (S[e.rutina + '.s0.name'] || paso.name) : paso.name;
  const color = BREAK_COLOR[e.modulo];
  const plan = ritmoPlan(getState());
  const Glifo = e.modulo === 'extra' ? ABStretch : ABMove;
  const capa = document.createElement('div');
  capa.setAttribute('data-pinta-hoja', '');
  document.body.appendChild(capa);
  ReactDOM.flushSync(() => ReactDOM.createRoot(capa).render(
    h(Modal, { open: true, onClose() {}, maxWidth: 720, tagLabel: fmt('break.ritmo.tag', { n: plan.hechos, m: plan.total }), title: x.inv, subtitle: x.sub },
      h(BreakPlato, { color, glifo: { nodo: h(Glifo), modulo: true }, motivo: fmt('break.prop.sitting', { n: 20 }), nombre,
        ctx: h(React.Fragment, null, h('b', null, e.dura), h('u', null, x.s), h('em', null, S[e.modulo === 'extra' ? 'break.stretch.label' : 'break.move.label'])) }),
      h('div', { className: 'pace-break-acciones', style: { marginTop: 16 } },
        h('button', { type: 'button', className: 'pace-break-pildora pace-break-llena', style: { '--c': color } }, S['break.prop.start']),
        h('button', { type: 'button', className: 'pace-break-pildora pace-break-tonal' }, fmt('break.ritmo.seguir', { n: 3 }))))));
}

/* «Empezar»: la pantalla de ejercicio de siempre con una rutina de UN paso. Para la foto se entra
   por la puerta de la barra lateral (que pasa por la ficha de antes de empezar) y se pulsa su
   botón; al montarlo, «Empezar» entra directo, sin esa ficha. */
async function alRunner(page, e) {
  await page.evaluate((e) => {
    const body = resolveBodyRoutine(e.rutina);
    const uno = Object.assign({}, body.routine, { steps: [body.routine.steps[0]], name: body.routine.steps[0].name, min: 1, access: 'free' });
    /* Lo que se recomienda al montarlo: sus minutos suman a la semana y nada más (ni logros,
       ni rutina hecha: la pausa que viene no cambia). Hoy la pantalla lo cuenta como rutina. */
    const soloMinutos = (id, min) => {
      const st = getState(); const sem = st.weeklyStats.moveMinutes.slice();
      sem[getDayIndexMondayFirst(new Date())] += min;
      setState({ weeklyStats: Object.assign({}, st.weeklyStats, { moveMinutes: sem }) });
    };
    window.completeMoveSession = soloMinutos; window.completeExtraSession = soloMinutos;
    const antes = window.resolveBodyRoutine;
    window.resolveBodyRoutine = (id) => (id === 'hacerla.foto' ? { routine: uno, source: body.source } : antes(id));
    document.querySelectorAll('[data-pinta-hoja], [data-pinta-seguir]').forEach((n) => n.remove());
    /* al volver, el aro está como lo deja «Hacerla»: sin la invitación y con el bloque 3 */
    document.querySelectorAll('[data-antes]').forEach((n) => { n.textContent = n.dataset.antes; });
    window.dispatchEvent(new CustomEvent('pace:sidebar-action', { detail: { kind: 'repeat', targetId: 'hacerla.foto' } }));
  }, e);
  await page.waitForTimeout(400);
  await page.locator('[data-pace-cta]').filter({ visible: true }).last().click();
  await page.waitForTimeout(300);
}

/* La pantalla de ejercicio encadena sus cuentas render a render: se avanza segundo a segundo. */
async function avanza(page, segundos) {
  for (let i = 0; i < segundos; i++) { await page.clock.fastForward(1000); await page.waitForTimeout(40); }
}

async function foto(page, nombre) {
  const png = await page.screenshot();
  await sharp(png).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(OUT, nombre + '.jpg'));
}

(async () => {
  const b = await chromium.launch();
  const medidas = [];
  try {
    for (const [lang, vp] of [['es', MOVIL], ['es', ESC], ['en', MOVIL], ['es', PEQ]]) {
      const movil = vp.width < 700;
      const pre = (movil ? 'm-' : 'e-') + (lang === 'en' ? 'en-' : '') + (vp.height === 640 ? '640-' : '');
      const x = TX[lang];
      for (const clave of ['mueve', 'estira']) {
        const e = EJ[clave];
        const { ctx, page } = await abrir(b, { vp, lang, movil });
        await page.evaluate(invitacion, x);
        await asentarGeometria(page);
        const m = { caso: clave, lang, vp: vp.width + '×' + vp.height, scroll: await page.evaluate(SCROLL) };
        if (clave === 'mueve') await foto(page, pre + 'h-inv');
        await page.evaluate(hoja, [x, e, lang]);
        await page.waitForTimeout(250);
        /* la hoja cabe sin scroll propio */
        m.hoja = await page.evaluate(() => {
          const c = document.querySelector('[data-pinta-hoja] [role=dialog], [data-pinta-hoja] [data-pace-modal-backdrop] > div');
          return c ? Math.round(c.getBoundingClientRect().height) + ' px, scroll ' + (c.scrollHeight - c.clientHeight) : null;
        });
        await foto(page, pre + 'h-hoja-' + clave);
        await alRunner(page, e);
        await avanza(page, 14);   // «prepárate», la colocación y unos segundos de trabajo
        await page.waitForTimeout(200);
        await foto(page, pre + 'h-runner-' + clave);
        await avanza(page, e.dura + 6);
        await page.waitForTimeout(400);
        /* el cierre de siempre, sin «¿Te ayudó esta pausa?» (lo que se recomienda) */
        await page.evaluate(() => document.querySelectorAll('[data-pace-session-feedback]').forEach((n) => n.remove()));
        if (clave === 'mueve') await foto(page, pre + 'h-cierre');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);
        await asentarGeometria(page);
        m.vuelta = await page.evaluate(() => {
          const v = (s) => Array.from(document.querySelectorAll(s)).find((el) => el.getBoundingClientRect().width > 0);
          const cta = v('[data-pace-cta]'), lab = v('[data-pace-dial-label]');
          return (lab ? lab.textContent : '') + ' | ' + (cta ? cta.textContent : '');
        });
        m.minutos = await page.evaluate(() => getState().weeklyStats.moveMinutes.join(','));
        m.luego = await page.evaluate(() => { const f = Array.from(document.querySelectorAll('.pace-rt-fila')).filter((e) => e.getBoundingClientRect().width > 0)[1]; return f ? f.textContent.replace(/\s+/g, ' ').trim() : null; });
        if (clave === 'mueve') await foto(page, pre + 'h-vuelta');
        medidas.push(m);
        console.log(JSON.stringify(m));
        await ctx.close();
      }
    }
  } finally {
    fs.writeFileSync(path.join(OUT, 'medidas-hacerla.json'), JSON.stringify(medidas, null, 1));
    await b.close();
  }
})();
