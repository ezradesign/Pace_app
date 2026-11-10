// Corredor de pasos: node run.js PREFIJO "t:Empezar foco" "fin" "f:nombre" ...
// Entorno: ANCHO ALTO MOVIL(0/1) HORA ALMACEN OSCURO(1) V1(1 = el interruptor apagado) TIENDA(1 = enlace de por vida puesto)
const path = require('path');
const fs = require('fs');
const WT = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/.claude/worktrees/auditoria-fable-9nov-8401fc';
const { chromium } = require(path.join(WT, 'node_modules', 'playwright'));
const { capa } = require('./capa');
const FOTOS = path.join(__dirname, 'fotos');
const E = process.env;
(async () => {
  const [prefijo, ...pasos] = process.argv.slice(2);
  const movil = E.MOVIL !== '0';
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: +(E.ANCHO || 360), height: +(E.ALTO || 740) }, isMobile: movil, hasTouch: movil, deviceScaleFactor: 1,
    locale: 'es-ES', colorScheme: E.OSCURO ? 'dark' : 'light', serviceWorkers: 'block',
    storageState: E.ALMACEN ? path.join(__dirname, E.ALMACEN) : undefined,
  });
  if (E.V1) await context.addInitScript(() => { Object.defineProperty(window, 'PREMIUM_ABIERTO_HASTA_V1', { configurable: true, get: () => false, set: () => {} }); });
  if (E.TIENDA) await context.addInitScript(() => { window.addEventListener('DOMContentLoaded', () => { try { window.PACE_TIENDA_WEB.enlaces.vida = 'https://example.invalid/vida'; } catch (e) {} }); });
  const page = await context.newPage();
  const errores = [];
  page.on('pageerror', (e) => errores.push(String(e).slice(0, 160)));
  await page.clock.install({ time: new Date(E.HORA || '2026-11-10T09:05:00') });
  await page.goto('http://localhost:8920/index.html');
  await page.waitForTimeout(500);
  await page.clock.runFor(1500);
  let n = 0;
  for (const p of pasos) {
    const i = p.indexOf(':'); const op = i < 0 ? p : p.slice(0, i); const arg = i < 0 ? '' : p.slice(i + 1);
    try {
      if (op === 't' || op === 'tx') {
        const loc = op === 'tx' ? page.getByRole('button', { name: new RegExp(arg) }) : (arg.startsWith('[') || arg.startsWith('.') ? page.locator(arg) : page.getByRole('button', { name: arg, exact: true }));
        const cand = loc.filter({ visible: true }); const l1 = (await cand.count()) > 1 ? cand.last() : cand.first(); await l1.click({ timeout: 3000 }); await page.clock.runFor(700);
      } else if (op === 'txt') { await page.getByText(arg, { exact: false }).filter({ visible: true }).first().click({ timeout: 3000 }); await page.clock.runFor(700);
      } else if (op === 'fin') {
        const fin = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('pace.timer.v1')).endsAt || null; } catch (e) { return null; } });
        if (!fin) console.log('  (no hay bloque en marcha)');
        else { await page.clock.fastForward(Math.max(0, fin - await page.evaluate(() => Date.now())) + 1000); await page.waitForTimeout(200); await page.clock.runFor(1500); }
      } else if (op === 'ad') { await page.clock.fastForward(+arg); await page.waitForTimeout(200); await page.clock.runFor(1500);
      } else if (op === 'corre') { await page.clock.runFor(+arg);
      } else if (op === 'f') {
        n += 1; await page.clock.runFor(900); await page.waitForTimeout(250);
        await page.screenshot({ path: path.join(FOTOS, prefijo + '-' + String(n).padStart(2, '0') + '-' + arg + '.png') });
        console.log('\n== ' + arg + ' [' + (await page.evaluate(() => new Date().toTimeString().slice(0, 5))) + ']: ' + (await capa(page, +(E.MAX || 520))));
      } else if (op === 'l') { console.log('\n-- ' + (await capa(page, +(E.MAX || 520))));
      } else if (op === 'e') { console.log('  e> ' + JSON.stringify(await page.evaluate(arg)).slice(0, 700));
      } else if (op === 'c') { const ok = await page.evaluate((t) => { const bs = [...document.querySelectorAll('button,[role=button],a')].filter((b) => { const r = b.getBoundingClientRect(); return r.width > 4 && (b.innerText || '').replace(/s+/g, ' ').trim().startsWith(t); }); const b = bs[bs.length - 1]; if (b) b.click(); return !!b; }, arg); if (!ok) console.log('  (no está: ' + arg + ')'); await page.clock.runFor(800);
      } else if (op === 'tecla') { await page.keyboard.press(arg); await page.clock.runFor(600);
      } else if (op === 'rec') { await page.reload(); await page.waitForTimeout(500); await page.clock.runFor(1500);
      } else if (op === 'guarda') { await context.storageState({ path: path.join(__dirname, arg) });
      } else if (op === 'scroll') { await page.mouse.wheel(0, +arg); await page.clock.runFor(400); }
    } catch (e) { console.log('  (falló ' + p + ': ' + String(e).split('\n')[0].slice(0, 110) + ')'); }
  }
  if (errores.length) console.log('ERRORES: ' + JSON.stringify(errores));
  await browser.close();
})().catch((e) => { console.error('FALLO', e); process.exit(1); });
