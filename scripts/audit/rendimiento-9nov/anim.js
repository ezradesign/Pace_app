'use strict';
const WT = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/.claude/worktrees/caza-rendimiento-9nov';
const { chromium } = require(WT + '/node_modules/@playwright/test');
const { SEMILLA, CLAVE_ESTADO } = require(WT + '/tests/helpers.js');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'es-ES', timezoneId: 'Europe/Madrid', serviceWorkers: 'block' });
  await context.addInitScript(([k, s]) => { localStorage.setItem(k, JSON.stringify(s)); }, [CLAVE_ESTADO, SEMILLA]);
  const p = await context.newPage();
  await p.goto('http://localhost:' + (process.argv[2] || 8910) + '/');
  await p.locator('[data-pace-dial-number]').waitFor();
  await p.getByRole('button', { name: /^Respira/ }).first().click();
  await p.getByRole('heading', { name: process.argv[3] || 'Suspiro fisiológico', exact: true }).first().click();
  await p.waitForTimeout(6000);
  const r = await p.evaluate(() => document.getAnimations().map((a) => {
    const el = a.effect && a.effect.target; const cs = el ? getComputedStyle(el) : {};
    const kf = a.effect && a.effect.getKeyframes ? [...new Set(a.effect.getKeyframes().flatMap((k) => Object.keys(k).filter((x) => !['offset', 'easing', 'composite', 'computedOffset'].includes(x))))] : [];
    return { tipo: a.constructor.name, nombre: a.animationName || a.transitionProperty, props: kf.join(','), estado: a.playState, iter: a.effect.getTiming().iterations,
      el: el ? el.tagName + ' ' + [...el.attributes].map((x) => x.name).filter((n) => n.startsWith('data-')).join(' ') + ' ' + Math.round(el.getBoundingClientRect().width) + 'px' : '', mask: cs.maskImage && cs.maskImage !== 'none' ? 'mask' : '', filter: cs.filter !== 'none' ? cs.filter : '', willChange: cs.willChange };
  }));
  console.log(JSON.stringify(r, null, 0).replace(/},{/g, '},\n{'));
  await browser.close();
})();
