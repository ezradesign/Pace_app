/* Fotos de la app real para la página de la pausa larga (14 oct. 2026).
   node fotos-cuello.js  (con el servidor del worktree en el 8797) */
'use strict';
const path = require('path');
const WT = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/.claude/worktrees/pausa-cuello-b4792a';
const { chromium } = require(path.join(WT, 'node_modules/@playwright/test'));
const OUT = path.join(__dirname, 'fotos');
require('fs').mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:8797/index.html';
const HOY = '2026-10-14';
const NUEVE = new Date(HOY + 'T09:00:00+02:00');
const ESTADO = {
  firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema',
  profile: { need: 'body', time: 'block', environment: 'home', completedAt: 1 },
  ritmo: { dia: { fecha: HOY, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } },
};
const VIEWS = [{ n: 'esc', w: 1280, h: 879 }, { n: 'mov', w: 360, h: 718 }];
const QUIERO = ['breathe.exhale.46', 'move.neck.3'];

async function foto(page, nombre) {
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, nombre + '.png') });
  console.log('foto', nombre);
}
async function minutos(page, n) {
  for (let i = 0; i < n; i++) { await page.clock.fastForward(60 * 1000); await page.waitForTimeout(40); }
}
async function segundosHasta(page, sel, max) {
  for (let s = 0; s < max && (await page.locator(sel).count()) === 0; s++) { await page.clock.fastForward(1000); await page.waitForTimeout(8); }
}
async function terminarBloque(page) {
  for (let i = 0; i < 120; i++) {
    await page.clock.fastForward(60 * 1000);
    await page.waitForTimeout(50);
    if (await page.locator('[data-pace-break-shortcut]').count()) return;
  }
  throw new Error('el bloque no terminó');
}

(async () => {
  const browser = await chromium.launch();
  for (const v of VIEWS) {
    const context = await browser.newContext({ viewport: { width: v.w, height: v.h }, locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light' });
    await context.addInitScript((e) => { if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(e)); }, ESTADO);
    const page = await context.newPage();
    await page.clock.install({ time: NUEVE });
    await page.goto(BASE);
    await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
    await page.waitForTimeout(500);
    /* el caso de Ez: la larga con Exhalación 4·6 + Cuello */
    const info = await page.evaluate((quiero) => {
      const s = getState();
      const larga = (p) => p.m.items.find((it) => it.larga);
      const base = larga(ritmoPlan(s));
      const ka = base.platos[0].clave, kb = base.platos[1].clave;
      for (let a = 0; a < 20; a++) for (let b = 0; b < 20; b++) {
        const cambios = {}; cambios[ka] = a; cambios[kb] = b;
        const s2 = Object.assign({}, s, { ritmo: Object.assign({}, s.ritmo, { dia: Object.assign({}, s.ritmo.dia, { cambios }) }) });
        const it = larga(ritmoPlan(s2));
        if (it.platos[0].id === quiero[0] && it.platos[1].id === quiero[1]) {
          setState(s2);
          const p = ritmoPlan(getState());
          return { cambios, focos: p.m.items.slice(0, p.m.items.indexOf(larga(p))).filter((x) => x.tipo === 'foco').length };
        }
      }
      return null;
    }, QUIERO);
    console.log(v.n, JSON.stringify(info));
    for (let b = 1; b <= info.focos; b++) {
      await page.getByRole('button', { name: b === 1 ? 'Empezar jornada' : 'Empezar bloque ' + b, exact: true }).filter({ visible: true }).first().click();
      await page.waitForTimeout(250);
      await terminarBloque(page);
      if (b < info.focos) {
        await page.locator('[data-pace-modal-backdrop]').last().getByRole('button', { name: 'Saltar esta pausa', exact: true }).click();
        await page.waitForTimeout(300);
      }
    }
    /* ANTES 1 · la ventana de la pausa */
    await foto(page, v.n + '-a1-ventana');
    /* PROPUESTA · la ventana nombra las dos */
    await page.evaluate(() => {
      const c = document.querySelector('[data-pace-break-ritmo]');
      c.querySelector('.pace-break-nombre').textContent = 'Exhalación 4·6 + Cuello';
      const ctx = c.querySelector('.pace-lib-ctx');
      ctx.querySelector('b').textContent = '15';
      ctx.querySelector('em').textContent = 'Respira y Estira';
    });
    await foto(page, v.n + '-p1-ventana');
    await page.evaluate(() => {
      const c = document.querySelector('[data-pace-break-ritmo]');
      c.querySelector('.pace-break-nombre').textContent = 'Exhalación 4·6';
    });
    /* «Hacer la pausa» → Respira */
    await page.getByRole('button', { name: 'Hacer la pausa', exact: true }).click();
    await page.waitForTimeout(800);
    await segundosHasta(page, '[data-pace-session-done]', 900);
    /* ANTES 2 · el cierre de Respira */
    await foto(page, v.n + '-a2-cierre');
    /* PROPUESTA · el cierre sigue con el cuello */
    await page.evaluate(() => {
      const d = document.querySelector('[data-pace-session-done]');
      const meta = [...d.querySelectorAll('div')].find((e) => e.textContent.trim() === 'Sesión completada');
      if (meta) meta.textContent = 'Pausa larga · 1 de 2';
      const b = [...document.querySelectorAll('[data-pace-session-root] button')].find((e) => e.textContent.trim() === 'Volver al inicio');
      if (b) b.textContent = 'Seguir con Estira';
    });
    await foto(page, v.n + '-p2-cierre');
    await page.evaluate(() => {
      const b = [...document.querySelectorAll('[data-pace-session-root] button')].find((e) => e.textContent.trim() === 'Seguir con Estira');
      if (b) b.textContent = 'Volver al inicio';
    });
    await page.locator('[data-pace-session-root]').getByRole('button', { name: 'Volver al inicio', exact: true }).click();
    await page.waitForTimeout(800);
    /* ANTES 3 · la home tras Respira */
    await foto(page, v.n + '-a3-home');
    if (v.n === 'mov') {
      /* el cajón: la tarjeta de la pausa sigue ofreciendo Respira */
      const menu = page.locator('[data-pace-topbar-menu], button[aria-label*="enú"]').first();
      if (await menu.count()) { await menu.click(); await page.waitForTimeout(700); await foto(page, v.n + '-a4-cajon'); await page.keyboard.press('Escape'); await page.waitForTimeout(500); }
    }
    /* PROPUESTA B · uno a uno: la barra ofrece ya el cuello */
    if (v.n === 'esc') {
      await page.evaluate(() => {
        const sb = document.querySelector('[data-pace-sidebar]');
        const w = document.createTreeWalker(sb, NodeFilter.SHOW_TEXT);
        let n; while ((n = w.nextNode())) if (n.nodeValue.indexOf('Exhalación 4·6') >= 0) n.nodeValue = n.nodeValue.replace('Exhalación 4·6', 'Cuello');
      });
      await foto(page, v.n + '-pb-home');
      await page.reload();
      await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
      await page.waitForTimeout(600);
    }
    /* PROPUESTA · la sesión de cuello, directa */
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:sidebar-action', { detail: { kind: 'suggest', targetId: 'move.neck.3', parada: true } })));
    await page.waitForTimeout(700);
    await page.locator('[data-pace-modal-backdrop]').last().getByRole('button', { name: 'Empezar', exact: true }).click();
    await page.waitForTimeout(1200);
    await foto(page, v.n + '-p3-cuello');
    await segundosHasta(page, '[data-pace-session-done]', 400);
    await foto(page, v.n + '-p3b-cuello-cierre');
    await page.locator('[data-pace-session-root]').getByRole('button', { name: 'Volver al inicio', exact: true }).click();
    await page.waitForTimeout(800);
    /* PROPUESTA · el aro cuenta la pausa (el modo «Larga» de verdad) */
    await page.evaluate(() => setState({ focusMode: 'larga' }));
    await page.waitForTimeout(500);
    await foto(page, v.n + '-p4-aro-larga-parado');
    const empezar = page.locator('[data-pace-dial-fit] button, [data-pace-focus-cta]').filter({ visible: true }).first();
    console.log('boton larga:', await empezar.textContent().catch(() => '?'));
    await empezar.click().catch((e) => console.log('sin botón', e.message));
    await minutos(page, 6);
    await foto(page, v.n + '-p4-aro-larga');
    /* PROPUESTA · el aro de la pausa con «A tu ritmo»: sin «Ciclo 3/4» (el día ya lo
       cuenta), con lo que viene después y con el bloque a mano */
    await page.evaluate(() => {
      const fit = document.querySelector('[data-pace-dial-fit]') || document;
      const w = document.createTreeWalker(fit, NodeFilter.SHOW_TEXT);
      let n; const quitar = [];
      while ((n = w.nextNode())) {
        if (n.nodeValue.trim() === 'Pausa larga · estira y respira') n.nodeValue = 'Luego, el bloque 3 de 9';
        if (n.nodeValue.trim() === 'Pausar') n.nodeValue = 'Empezar ya el bloque 3';
        if (/^Ciclo/i.test(n.nodeValue.trim())) quitar.push(n.parentElement.parentElement);
      }
      quitar.forEach((e) => { e.style.visibility = 'hidden'; });
    });
    await foto(page, v.n + '-p5-aro-ritmo');
    await context.close();
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
