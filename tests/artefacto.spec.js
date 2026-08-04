/* PACE · el artefacto arranca y es el COMPILADO (s154)
 * ====================================================
 * Nada de esto lo puede ver `npm run verify`: son propiedades del documento ya
 * cargado en un navegador de verdad.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto } = require('./helpers');

const RAIZ = path.join(__dirname, '..');

test.beforeEach(async ({ context }) => { await sembrar(context); });

test('index.html es el artefacto compilado, no el entry de desarrollo', async ({ page }) => {
  await irAlArtefacto(page);

  const perfil = await page.evaluate(() => ({
    babel: typeof window.Babel,
    scriptsBabel: document.querySelectorAll('script[type="text/babel"]').length,
    manifest: !!document.querySelector('link[rel="manifest"]'),
    version: window.PACE_VERSION,
  }));

  /* El crash de s144 vivia justo aqui: en desarrollo Babel resuelve por el
     ambito global y en el artefacto cada modulo va dentro de su IIFE. Si Babel
     sigue presente, no estamos probando lo que se publica. */
  expect(perfil.babel).toBe('undefined');
  expect(perfil.scriptsBabel).toBe(0);
  /* El `<link rel=manifest>` es lo unico que distingue index.html del
     standalone; sin el, instalar la PWA da el bug de icono de s128. */
  expect(perfil.manifest).toBe(true);
  /* RELACIONAL: la version tiene forma de version. El numero concreto ya lo
     aserta el verify en sus tres sitios; repetirlo aqui seria un censo mas que
     mantener a mano. */
  expect(perfil.version).toMatch(/^v\d+\.\d+\.\d+$/);
});

test('la app monta la home sin un solo error de consola', async ({ page }) => {
  const errores = capturarErrores(page);
  await irAlArtefacto(page);

  /* Que la home este montada DE VERDAD, no que exista el contenedor. */
  await expect(page.locator('[data-pace-dial-number]')).toHaveText('25:00');
  await expect(page.locator('[data-pace-dial-label]')).toHaveText('Foco manual');
  await expect(page.getByRole('button', { name: 'Empezar foco' })).toBeVisible();
  await expect(page.locator('[data-pace-sidebar]')).toBeVisible();

  expect(errores).toEqual([]);
});

test('el service worker precachea EXACTAMENTE lo que declara sw.js', async ({ page }) => {
  await irAlArtefacto(page);

  /* Las rutas DECLARADAS, leidas del fuente. Se quitan los comentarios antes de
     buscar cadenas: s146 dejo escrito que en este archivo no puede haber rutas
     literales ni en los comentarios, precisamente porque hay scripts que lo
     leen. Si el array deja de reconocerse, esto FALLA — «cero elementos
     reconocidos es fallo explicito, nunca un verde silencioso» (s152). */
  const fuente = fs.readFileSync(path.join(RAIZ, 'sw.js'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
  const bloque = fuente.match(/const PRECACHE\s*=\s*\[([\s\S]*?)\];/);
  expect(bloque, 'no se reconocio el array PRECACHE de sw.js').not.toBeNull();
  const declaradas = (bloque[1].match(/'[^']*'|"[^"]*"/g) || []).map(s => s.slice(1, -1));
  expect(declaradas.length).toBeGreaterThan(0);

  /* Y las que el navegador tiene DE VERDAD. El verify mira el disco y lo dice
     en su bloque NO_CUBRE; esto es la otra mitad. */
  const real = await page.evaluate(async () => {
    /* La instalacion del SW es asincrona: esperar a que exista su cache. */
    for (let i = 0; i < 60; i++) {
      const nombres = await caches.keys();
      const mio = nombres.filter(n => n.indexOf('pace-') === 0);
      if (mio.length) {
        const claves = await (await caches.open(mio[0])).keys();
        if (claves.length) {
          return {
            nombre: mio[0],
            rutas: claves.map(r => new URL(r.url).pathname),
            version: window.PACE_VERSION,
          };
        }
      }
      await new Promise(r => setTimeout(r, 250));
    }
    return null;
  });

  expect(real, 'el service worker no llego a poblar su cache').not.toBeNull();

  /* RELACIONAL: el nombre de la cache sigue a la version publicada. Asi el
     `activate` borra la anterior y nadie se queda con un artefacto viejo. */
  expect(real.nombre).toBe('pace-' + real.version);

  /* RELACIONAL en las dos direcciones: `addAll` es atomico, asi que la cache
     real y lo declarado tienen que ser el MISMO conjunto. Sin numero: crecer el
     precache a proposito no pone esto rojo. */
  const enCache = [...real.rutas].sort();
  const enFuente = [...new Set(declaradas)].sort();
  expect(enCache).toEqual(enFuente);
});
