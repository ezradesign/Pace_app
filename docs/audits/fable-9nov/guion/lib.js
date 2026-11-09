// Arnés de la auditoría: abre la web del worktree (8920) y deja fotos y un registro corto.
const path = require('path');
const fs = require('fs');
const WT = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/.claude/worktrees/auditoria-fable-9nov-8401fc';
const { chromium } = require(path.join(WT, 'node_modules', 'playwright'));
const FOTOS = path.join(__dirname, 'fotos');
fs.mkdirSync(FOTOS, { recursive: true });
const URL = 'http://localhost:8920/index.html';

async function abrir({ ancho = 360, alto = 740, movil = true, hora = '2026-11-10T09:00:00', estado = null, oscuro = false, lang = 'es-ES' } = {}) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: ancho, height: alto }, isMobile: movil, hasTouch: movil, deviceScaleFactor: movil ? 2 : 1,
    locale: lang, colorScheme: oscuro ? 'dark' : 'light', serviceWorkers: 'block',
  });
  if (estado) {
    await context.addInitScript((e) => {
      if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(e));
    }, estado);
  }
  const page = await context.newPage();
  const errores = [];
  page.on('pageerror', (e) => errores.push(String(e).slice(0, 200)));
  await page.clock.install({ time: new Date(hora) });
  await page.goto(URL);
  await page.waitForTimeout(600);
  await page.clock.runFor(1500);
  return { browser, context, page, errores };
}

let n = 0;
async function foto(page, nombre, prefijo) {
  n += 1;
  const f = path.join(FOTOS, (prefijo || 'p') + '-' + String(n).padStart(2, '0') + '-' + nombre + '.png');
  await page.clock.runFor(700).catch(() => {});
  await page.waitForTimeout(250);
  await page.screenshot({ path: f });
  return f;
}

// Los botones visibles de la capa de arriba, en una línea.
async function botones(page, max = 28) {
  const r = await page.evaluate((max) => {
    const vis = (e) => { const b = e.getBoundingClientRect(); const s = getComputedStyle(e); return b.width > 4 && b.height > 4 && s.visibility !== 'hidden' && s.display !== 'none' && b.bottom > 0 && b.top < innerHeight; };
    const out = [];
    document.querySelectorAll('button,a[href],[role=button],input,select').forEach((e) => {
      if (!vis(e)) return;
      const t = (e.getAttribute('aria-label') || e.innerText || e.value || '').replace(/\s+/g, ' ').trim().slice(0, 50);
      if (t) out.push(t);
    });
    return out.slice(0, max);
  }, max);
  return r.join(' | ');
}

async function texto(page, sel, max = 500) {
  return page.evaluate(([sel, max]) => {
    const e = sel ? document.querySelector(sel) : document.body;
    return e ? e.innerText.replace(/\s+/g, ' ').trim().slice(0, max) : '(no está: ' + sel + ')';
  }, [sel, max]);
}

async function tocar(page, que, opts = {}) {
  const loc = typeof que === 'string' && que.startsWith('[') ? page.locator(que) : page.getByRole('button', { name: que, exact: opts.exact });
  const l = loc.filter({ visible: true }).first();
  try { await l.click({ timeout: 2500 }); await page.clock.runFor(600); return true; } catch (e) { console.log('  (no pude tocar: ' + que + ')'); return false; }
}

async function adelantar(page, ms) { await page.clock.fastForward(ms); await page.waitForTimeout(200); await page.clock.runFor(1200); }

async function finBloque(page) {
  const fin = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('pace.timer.v1')).endsAt || null; } catch (e) { return null; } });
  if (!fin) { console.log('  (no hay bloque en marcha)'); return false; }
  const ahora = await page.evaluate(() => Date.now());
  await adelantar(page, Math.max(0, fin - ahora) + 1000);
  return true;
}

const estadoDe = (page) => page.evaluate(() => { try { return JSON.parse(localStorage.getItem('pace.state.v2')); } catch (e) { return null; } });

module.exports = { abrir, foto, botones, texto, tocar, adelantar, finBloque, estadoDe, FOTOS };
