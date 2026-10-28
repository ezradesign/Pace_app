/* PACE · las cabeceras de seguridad de la web (16 oct. 2026)
 * ==========================================================
 * La auditoría del 16 oct. vio que pacegrass.app solo mandaba Referrer-Policy.
 * Ez eligió ponerlas ya: `_headers` en la raíz, que `scripts/web-dist.js` copia a
 * `dist/` y Cloudflare Pages lee al publicar (que llegue a `dist/` lo mira
 * `verify`). El servidor local no lo aplica, así que esta prueba lee el archivo:
 * que exista, que cubra todas las rutas y que no apague nada que la app usa.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

const ARCHIVO = path.join(__dirname, '..', '_headers');

function reglas() {
  const lineas = fs.readFileSync(ARCHIVO, 'utf8').split(/\r?\n/).filter(l => l.trim() && !l.trim().startsWith('#'));
  const out = {};
  let ruta = null;
  for (const l of lineas) {
    if (!/^\s/.test(l)) { ruta = l.trim(); out[ruta] = {}; continue; }
    const i = l.indexOf(':');
    out[ruta][l.slice(0, i).trim().toLowerCase()] = l.slice(i + 1).trim();
  }
  return out;
}

test('la web manda las cabeceras de seguridad en todas sus rutas', () => {
  expect(fs.existsSync(ARCHIVO), '_headers en la raíz del repo').toBe(true);
  const todas = reglas()['/*'];
  expect(todas, 'una regla para /*').toBeTruthy();
  expect(todas['x-content-type-options']).toBe('nosniff');
  expect(todas['x-frame-options']).toBe('DENY');
  expect(todas['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(todas['referrer-policy']).toBe('strict-origin-when-cross-origin');
  /* HSTS (auditoría de seguridad del 28 oct.): un año, sin subdominios ni `preload`, que no se deshacen fácil. */
  expect(todas['strict-transport-security']).toBe('max-age=31536000');
});

test('las cabeceras no apagan lo que la app usa (la pantalla encendida de las sesiones)', () => {
  const pp = reglas()['/*']['permissions-policy'] || '';
  expect(pp).not.toMatch(/screen-wake-lock=\(\)/);
  expect(pp).not.toMatch(/notifications|autoplay=\(\)/);
});

/* S5 (auditoría del 22 oct.): la CSP solo pedía que nadie metiera PACE en un marco.
   Ahora dice de dónde sale cada cosa. Contra v0.176.0 caen las tres. */
function csp() {
  const texto = reglas()['/*']['content-security-policy'] || '';
  const out = {};
  for (const d of texto.split(';')) {
    const [nombre, ...fuentes] = d.trim().split(/\s+/);
    if (nombre) out[nombre] = fuentes;
  }
  return out;
}
const CALENDARIO = ['https://www.googleapis.com', 'https://graph.microsoft.com', 'https://login.microsoftonline.com'];

test('S5 · la CSP dice de dónde sale cada cosa, y solo deja salir al calendario', () => {
  const p = csp();
  expect(p['default-src'], 'sin default-src todo lo demás va suelto').toEqual(["'self'"]);
  for (const d of ['object-src', 'frame-src']) expect(p[d], d).toEqual(["'none'"]);
  expect(p['frame-ancestors']).toEqual(["'none'"]);
  expect(p['base-uri']).toEqual(["'self'"]);
  expect(p['form-action']).toEqual(["'self'"]);
  /* Ningún comodín: ni `*`, ni `https:`, ni `http:`, ni otra web para scripts y estilos. */
  for (const [d, fuentes] of Object.entries(p)) {
    for (const f of fuentes) expect(['*', 'https:', 'http:', "'unsafe-eval'"], d + ' ' + f).not.toContain(f);
  }
  expect(p['script-src'].filter(f => /^https?:/.test(f)), 'scripts de otra web').toEqual([]);
  expect(p['style-src'].filter(f => /^https?:/.test(f)), 'estilos de otra web').toEqual([]);
  expect(p['connect-src'].filter(f => f !== "'self'").sort()).toEqual(CALENDARIO.slice().sort());
});

test('S5 · si /premium enciende la analítica de Cloudflare, la CSP la deja pasar', () => {
  const premium = fs.readFileSync(path.join(__dirname, '..', 'premium', 'index.html'), 'utf8');
  const p = csp();
  if (/<script[^>]+cloudflareinsights/.test(premium)) {
    expect(p['script-src'], 'el script de la analítica').toContain('https://static.cloudflareinsights.com');
    expect(p['connect-src'], 'adonde manda las visitas').toContain('https://cloudflareinsights.com');
  } else {
    expect(p['script-src']).not.toContain('https://static.cloudflareinsights.com');
  }
});

/* El servidor local no manda cabeceras: aquí se le ponen a cada página la CSP de `_headers` y se
   cuenta lo que el navegador bloquea al usarla. */
test.describe('S5 · con la CSP puesta', () => {
  test.use({ serviceWorkers: 'block' });
  const { sembrar, irAlArtefacto } = require('./helpers');

  async function conCsp(context) {
    const politica = reglas()['/*']['content-security-policy'];
    await context.route('**/*', async (route) => {
      const url = route.request().url();
      if (CALENDARIO.some(h => url.startsWith(h)) || url.startsWith('https://example.com')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      }
      if (route.request().resourceType() !== 'document') return route.continue();
      const r = await route.fetch();
      await route.fulfill({ response: r, headers: Object.assign({}, r.headers(), { 'content-security-policy': politica }) });
    });
    await context.addInitScript(() => {
      window.__csp = [];
      document.addEventListener('securitypolicyviolation', (e) => { window.__csp.push(e.violatedDirective + ' ' + e.blockedURI); });
    });
  }
  const bloqueado = (page) => page.evaluate(() => window.__csp);

  test('la app funciona sin que la CSP bloquee nada, y bloquea lo de fuera', async ({ page, context }) => {
    await conCsp(context);
    await sembrar(context);
    await irAlArtefacto(page);
    await page.getByRole('button', { name: /^Mueve/ }).first().click();
    await expect(page.locator('[data-pace-lib-card]').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Abrir ajustes' }).click();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Ver estadísticas' }).click();
    await page.keyboard.press('Escape');
    /* El calendario de la web habla con Google y con Microsoft. */
    for (const h of CALENDARIO) await page.evaluate((u) => fetch(u + '/x').then(() => 'ok', () => 'no'), h);
    /* Lo que suena se pide a la propia web. */
    expect(await page.evaluate(() => fetch(PACE_MUSICA_BASES.claro).then(r => r.status))).toBe(200);
    await page.waitForTimeout(300);
    expect(await bloqueado(page), 'la CSP rompe algo de la app').toEqual([]);

    /* Y no es una CSP de adorno: lo de otra web se para. */
    await page.evaluate(() => {
      const s = document.createElement('script'); s.src = 'https://example.com/x.js'; document.head.appendChild(s);
      return fetch('https://example.com/datos').catch(() => null);
    });
    await expect.poll(() => bloqueado(page).then(b => b.length)).toBe(2);
  });

  for (const pagina of ['/premium/index.html', '/beta/index.html', '/gracias/index.html', '/recuperar/index.html', '/calendario.html', '/privacy.html', '/safety.html']) {
    test('la página ' + pagina + ' se ve sin que la CSP bloquee nada', async ({ page, context }) => {
      await conCsp(context);
      await page.goto(pagina);
      await page.waitForLoadState('load');
      await page.waitForTimeout(300);
      expect(await bloqueado(page)).toEqual([]);
    });
  }
});
