/* PACE · cada archivo de fuente se baja una vez
 * =============================================
 * Los woff2 de /fonts/ son variables: un archivo lleva todos los pesos. Con una @font-face por peso,
 * el navegador bajaba aparte cada nombre aunque fuera el mismo archivo (Inter Tight 300, 400, 500
 * y 600 eran cuatro copias idénticas). Lo que defiende, sin abrir el navegador:
 *  1. En tokens.css, ninguna @font-face apunta a un archivo con los mismos bytes que otra.
 *  2. Una sola @font-face por familia y estilo.
 *  3. Las fuentes del precache (sw.js) son exactamente las de tokens.css: ni copias ni huecos offline.
 * Que se pintan igual se midió píxel a píxel (scripts/audit/rendimiento-9nov/LEEME.md).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { test, expect } = require('@playwright/test');

const RAIZ = path.join(__dirname, '..');
const caras = () => [...fs.readFileSync(path.join(RAIZ, 'app/tokens.css'), 'utf8').matchAll(/@font-face\s*\{([^}]*)\}/g)]
  .map((m) => ({
    familia: /font-family:\s*'([^']+)'/.exec(m[1])[1],
    estilo: /font-style:\s*(\w+)/.exec(m[1])[1],
    url: /url\('([^']+)'\)/.exec(m[1])[1],
  }));

test('tokens.css · ninguna @font-face apunta a una copia de otra, y una por familia y estilo', () => {
  const lista = caras();
  expect(lista.length, 'GUARD: no se leyó ninguna @font-face').toBeGreaterThan(0);
  const porHuella = new Map();
  for (const c of lista) {
    const h = crypto.createHash('md5').update(fs.readFileSync(path.join(RAIZ, c.url))).digest('hex');
    if (!porHuella.has(h)) porHuella.set(h, []);
    porHuella.get(h).push(c.url);
  }
  const copias = [...porHuella.values()].filter((us) => us.length > 1);
  expect(copias, 'archivos idénticos con nombres distintos: el navegador los baja dos veces').toEqual([]);
  const claves = lista.map((c) => c.familia + ' · ' + c.estilo);
  expect(claves.filter((k, i) => claves.indexOf(k) !== i), 'familia y estilo repetidos: junta los pesos en un rango').toEqual([]);
});

test('sw.js · las fuentes del precache son las de tokens.css', () => {
  const sw = fs.readFileSync(path.join(RAIZ, 'sw.js'), 'utf8');
  const enPrecache = [...sw.matchAll(/'(\/fonts\/[\w-]+\.woff2)'/g)].map((m) => m[1]).sort();
  expect(enPrecache).toEqual(caras().map((c) => c.url).sort());
});
