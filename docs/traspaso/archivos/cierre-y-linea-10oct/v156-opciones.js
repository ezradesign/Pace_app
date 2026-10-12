'use strict';
// «Sesión completada» (v0.155.0): opciones para el círculo con la «V» y para «Volver al inicio», sobre la app real tras 4·7·8.
const R = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app';
const { chromium } = require(R + '/node_modules/@playwright/test');
const { spawn } = require('child_process');
const PORT = 8796, BASE = 'http://localhost:' + PORT, OUT = __dirname;

/* EL DIBUJO DE ARRIBA. Se monta sobre [data-pace-session-done-hero] (el círculo de hoy). */
function heroe(v) {
  const h = document.querySelector('[data-pace-session-done-hero]');
  if (!h) throw new Error('sin héroe');
  if (!h.dataset.original) h.dataset.original = h.outerHTML;
  const nuevo = document.createElement('div'); nuevo.outerHTML; // eslint
  const tmp = document.createElement('div'); tmp.innerHTML = h.dataset.original; const base = tmp.firstElementChild;
  base.dataset.original = h.dataset.original;
  const acento = getComputedStyle(h).borderTopColor || 'var(--breathe)';
  if (v === 'hoy') { h.replaceWith(base); return; }
  const caja = document.createElement('div');
  caja.setAttribute('data-pace-session-done-hero', ''); caja.setAttribute('data-foto', ''); caja.dataset.original = h.dataset.original;
  caja.style.cssText = 'width: auto !important; height: auto !important; background: none !important; border: 0 !important; margin: 0 auto 22px; display: grid; place-items: center; color: ' + acento + ';';
  if (v === 'dibujo') {
    /* El dibujo de la rutina, como en su tarjeta y en la pausa: aquí, los pulmones de Respira (el de la barra de Actividades). */
    const fuente = Array.from(document.querySelectorAll('svg')).find((s) => s.closest('button') && /Respira/.test(s.closest('button').textContent) && !s.closest('[data-pace-session-root]'));
    const g = fuente ? fuente.cloneNode(true) : document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    g.setAttribute('width', '64'); g.setAttribute('height', '64'); g.style.cssText = 'width:64px !important;height:64px !important;color:' + acento;
    caja.style.width = '96px'; caja.style.height = '96px';
    caja.appendChild(g);
  } else if (v === 'aro') {
    /* El aro del Pomodoro, cerrado: un trazo fino entero y la bola arriba, con su halo. */
    caja.innerHTML = '<svg width="96" height="96" style="width:96px !important;height:96px !important" viewBox="0 0 100 100" fill="none">'
      + '<circle cx="50" cy="50" r="42" stroke="currentColor" stroke-width="1.1" opacity="0.85"/>'
      + '<circle cx="50" cy="8" r="6" fill="currentColor" opacity="0.18"/>'
      + '<circle cx="50" cy="8" r="2.6" fill="currentColor"/></svg>';
  } else if (v === 'nada') {
    caja.style.height = '8px';
  }
  h.replaceWith(caja);
}

/* EL BOTÓN DE SALIDA. */
const BOTON = {
  llena: '',
  tonal: `[data-pace-session-footer] button { background: var(--paper-2) !important; color: var(--ink) !important;
      border: 1px solid var(--line-2) !important; }`,
  enlace: `[data-pace-session-footer] button { background: none !important; border: 0 !important; color: var(--ink-2) !important;
      text-decoration: underline; text-underline-offset: 5px; padding: 0 8px !important; }`,
};

const segundos = async (page, n) => { for (let i = 0; i < n; i++) { await page.clock.fastForward(1000); await page.waitForTimeout(10); } };

(async () => {
  const srv = spawn(process.execPath, ['.claude/static-server.js'], { cwd: R, env: Object.assign({}, process.env, { PORT: String(PORT) }), stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 1200));
  const browser = await chromium.launch();
  try {
    for (const vp of [{ n: '360', w: 360, h: 718 }, { n: '1280', w: 1280, h: 800 }]) {
      const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 2, isMobile: vp.w < 700, hasTouch: vp.w < 700, locale: 'es-ES', timezoneId: 'Europe/Madrid' });
      await ctx.addInitScript(() => { if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify({ firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', ritmo: { libre: true } })); });
      const page = await ctx.newPage();
      await page.clock.install();
      await page.goto(BASE + '/index.html'); await page.locator('[data-pace-dial-number]').waitFor();
      await page.getByRole('button', { name: /^Respira/ }).first().click();
      await page.locator('[data-pace-modal-backdrop]').last().getByRole('heading', { name: '4·7·8', exact: true }).click();
      const empezar = page.locator('[data-pace-modal-backdrop]').last().getByRole('button', { name: 'Empezar', exact: true });
      if (await empezar.count()) await empezar.click();
      const sesion = page.locator('[data-pace-session-root]');
      await sesion.getByRole('button', { name: 'Empezar ahora' }).click();
      const done = sesion.locator('[data-pace-session-done]');
      for (let s = 0; s < 400 && !(await done.count()); s++) await segundos(page, 1);
      await page.waitForTimeout(900);
      const combos = vp.n === '360'
        ? [['hoy', 'llena'], ['dibujo', 'llena'], ['aro', 'llena'], ['nada', 'llena'], ['dibujo', 'tonal'], ['dibujo', 'enlace']]
        : [['hoy', 'llena'], ['dibujo', 'tonal'], ['aro', 'tonal']];
      for (const [h, b] of combos) {
        await page.evaluate(heroe, h);
        await page.evaluate(([css]) => { let st = document.getElementById('foto-boton'); if (!st) { st = document.createElement('style'); st.id = 'foto-boton'; document.head.appendChild(st); } st.textContent = css; }, [BOTON[b]]);
        await page.waitForTimeout(250);
        await page.screenshot({ path: OUT + '/cierre-' + vp.n + '-' + h + '-' + b + '.png' });
      }
      await ctx.close();
    }
  } finally { await browser.close(); srv.kill(); }
  console.log('hecho');
})().catch(e => { console.error(e); process.exit(1); });
