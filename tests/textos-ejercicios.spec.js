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

/* LOS AVISOS DE LAS 63 FICHAS (Ez, 23 oct. 2026: 1A, v0.175.2). Lo que la revisión marcó como
   contrario a la base (NHS/ACSM/OMS: sin forzar, sin rebotes, sin «al máximo») no vuelve, ni en
   castellano ni en inglés. Contra v0.175.1 caen todas. */
const NO_VUELVEN = [
  [/mira al techo/i, /look at the ceiling/i],                         // Apertura de pecho: no tirar de la cabeza
  [/vértebra a vértebra/i, /vertebra by vertebra|one vertebra at a time/i], // Gato-camello y Rodar hacia abajo
  [/lo más alto que puedas/i, /as high as you can/i],                 // Elevación de talones: hasta donde controles
  [/algo bajo los talones|Pon algo bajo/i, /under your heels/i],      // Sentadilla profunda: baja menos
  [/sin manos si puedes/i, /no hands if you can/i],                   // Sentarse y levantarse del suelo
  [/rodillas queden a 90°|rodillas a 90°/i, /knees are at 90°|knees at 90°/i], // Silla en la pared: empieza alto
  [/llegar a 12/i, /reach 12/i],                                      // Flexiones inclinadas
  [/en un libro/i, /on a book/i],                                     // Zancada con apertura: mesa estable
  [/apóyate en los puños/i, /rest on your fists/i],                   // Gateo
  [/con fuerza/i, /fist hard|glutes hard/i],                          // Abrir y cerrar el puño, Apretar glúteos
];
const INGLES = ['app/i18n/content/move.js', 'app/i18n/content/extra.js'];
const valoresEn = (f) => [...leer(f).matchAll(/^\s*'[^']+':\s*(['"])((?:\.|(?!\1).)*)\1/gm)].map((m) => m[2]);

test('los avisos de la revisión de las 63 fichas no vuelven, ni en castellano ni en inglés', () => {
  for (const [es, en] of NO_VUELVEN) {
    for (const f of DATOS) expect(textos(f).filter((t) => es.test(t)), f + ' · ' + es).toEqual([]);
    for (const f of INGLES) expect(valoresEn(f).filter((t) => en.test(t)), f + ' · ' + en).toEqual([]);
  }
});

test('Rana, Rotación lenta, Círculos de muñeca y Círculos de brazos van por veces, no por reloj', () => {
  const todo = DATOS.map(leer).join('\n');
  const pasos = (nombre) => [...todo.matchAll(new RegExp("\\{ name: '" + nombre + "', mode: '(\\w+)', reps: (\\d+)", 'g'))].map((m) => [m[1], +m[2]]);
  const cuenta = (nombre) => (todo.match(new RegExp("\\{ name: '" + nombre + "'", 'g')) || []).length;
  for (const [nombre, veces] of [['Rana', 8], ['Rotación lenta', 6], ['Círculos de muñeca', 8], ['Círculos de brazos', 8]]) {
    expect(cuenta(nombre), nombre + ' no está').toBeGreaterThan(0);
    expect(pasos(nombre), nombre).toEqual(Array(cuenta(nombre)).fill(['reps', veces]));
  }
});
