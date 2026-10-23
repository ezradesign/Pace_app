/* PACE · E2E · LOS TEXTOS DE LOS EJERCICIOS NO DICEN LO CONTRARIO DE LO QUE PASA (23 oct. 2026)
 * ==========================================================================================
 * La revisión de las 63 fichas de Mueve y Estira (docs/proposals/mueve-estira-comprobacion-23oct.md)
 * encontró que «Hueco abdominal» y «Hueco en silla» decían «Baja los pies para que sea más suave»:
 * con las piernas en el aire, bajarlas sin apoyar alarga la palanca y lo hace MÁS difícil. Lo suave
 * es doblar las rodillas o levantar un pie cada vez. Y una frase en castellano llevaba «wall
 * slides» en inglés. Contra v0.175.0 caen las dos.
 *
 * Lee los archivos de datos, sin navegador: es un censo de lo que pone, no de cómo se pinta.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

const RAIZ = path.join(__dirname, '..');
const leer = (f) => fs.readFileSync(path.join(RAIZ, f), 'utf8');
const DATOS = ['app/move/move.data.js', 'app/extra/extra.data.js', 'app/extra/extra.data.piernas.js'];
/* Solo lo que lee la persona: los valores de los campos de texto, no los comentarios. */
const textos = (f) => [...leer(f).matchAll(/\b(?:name|desc|setup|action|care|cue):\s*'([^']*)'/g)].map((m) => m[1]);

test('ningún ejercicio pide bajar los pies para hacerlo más suave, ni en castellano ni en inglés', () => {
  for (const f of DATOS) expect(textos(f).filter((t) => /baja los pies para que sea más suave/i.test(t)), f).toEqual([]);
  expect(leer('app/i18n/content/move.js')).not.toMatch(/Lower your feet to make it gentler/);
});

test('los textos en castellano de Mueve y Estira no llevan «wall slides»', () => {
  for (const f of DATOS) expect(textos(f).filter((t) => /wall slides/i.test(t)), f).toEqual([]);
});
