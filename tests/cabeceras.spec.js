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
});

test('las cabeceras no apagan lo que la app usa (la pantalla encendida de las sesiones)', () => {
  const pp = reglas()['/*']['permissions-policy'] || '';
  expect(pp).not.toMatch(/screen-wake-lock=\(\)/);
  expect(pp).not.toMatch(/notifications|autoplay=\(\)/);
});
