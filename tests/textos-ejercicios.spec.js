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

/* Los círculos de brazos van con un brazo, como en su dibujo, y son ocho con cada uno (16): con
   8 en total y sin cambiar de brazo, el segundo no se movía (revisión del 27 oct., v0.181.1). El
   gateo cuenta los cuatro pasos de ida y los cuatro de vuelta, en los mismos 24 s. */
test('Rana, Rotación lenta, Círculos de muñeca, Círculos de brazos y el gateo van por veces, no por reloj', () => {
  const todo = DATOS.map(leer).join('\n');
  const pasos = (nombre) => [...todo.matchAll(new RegExp("\\{ name: '" + nombre + "', mode: '(\\w+)', reps: (\\d+)", 'g'))].map((m) => [m[1], +m[2]]);
  const cuenta = (nombre) => (todo.match(new RegExp("\\{ name: '" + nombre + "'", 'g')) || []).length;
  for (const [nombre, veces] of [['Rana', 8], ['Rotación lenta', 6], ['Círculos de muñeca', 8], ['Círculos de brazos', 16], ['Gateo con rodillas', 8]]) {
    expect(cuenta(nombre), nombre + ' no está').toBeGreaterThan(0);
    expect(pasos(nombre), nombre).toEqual(Array(cuenta(nombre)).fill(['reps', veces]));
  }
});

/* LA REVISIÓN DE LOS TEXTOS NUEVOS (ChatGPT, 26 oct.; comprobada contra el código el 27 oct.,
   docs/proposals/mueve-estira-chatgpt-revision-respuesta-27oct.md). Las cinco fichas con un fallo
   de verdad y el inglés que se leía al revés no vuelven. Contra v0.181.0 caen todas. */
const NUNCA = /(?!)/;
const NO_VUELVEN_27 = [
  [/hasta estirar la pierna/i, /until the leg is straight/i],  // Desliza el talón: no hace falta estirarla
  [/cintura no se despega/i, /waist stays on the floor/i],     // Desliza el talón: sin aplastar la zona lumbar
  [/brazos en cruz/i, /Arms out, resting/i],                    // Deslizamientos en pared: en W, como el dibujo
  [/pero trabaja/i, /but it works/i],                           // Remo con tu mano
  [/palma abajo y luego palma arriba/i, /palm down, then palm up/i], // Estiramiento de muñeca: cuánto cada una
  [NUNCA, /at the back hip/i],                                  // Flexor de cadera: es delante de la cadera
  [NUNCA, /as big as you can/i],                                // Círculos de tobillo: cómodos, sin forzar
  [NUNCA, /hands on your waist/i],                              // Bisagra de cadera: on your hips
  [NUNCA, /hand-width/i],                                       // Elevación de puntas: un palmo son ~20 cm
];

test('los fallos de la revisión del 27 oct. no vuelven, ni en castellano ni en inglés', () => {
  for (const [es, en] of NO_VUELVEN_27) {
    for (const f of DATOS) expect(textos(f).filter((t) => es.test(t)), f + ' · ' + es).toEqual([]);
    for (const f of INGLES) expect(valoresEn(f).filter((t) => en.test(t)), f + ' · ' + en).toEqual([]);
  }
});

test('las cinco fichas corregidas dicen lo que faltaba', () => {
  const todo = DATOS.map(leer).join('\n');
  const paso = (nombre) => [...todo.matchAll(new RegExp("\\{ name: '" + nombre + "'[^]*?care: '([^']*)' \\} \\}", 'g'))].map((m) => m[0]);
  /* Estiramiento de muñeca: las dos posturas y cuánto cada una, en las dos rutinas que lo llevan. */
  const muneca = paso('Estiramiento de muñeca');
  expect(muneca.length).toBe(2);
  for (const p of muneca) expect(p).toMatch(/Diez segundos palma abajo y diez palma arriba/);
  /* Círculos de brazos: el otro brazo. */
  for (const p of paso('Círculos de brazos')) expect(p).toMatch(/Luego, el otro/);
  /* Remo con banda: banda larga, y cómo no hacerse daño con ella. */
  for (const p of paso('Remo con banda')) expect(p).toMatch(/banda larga[^]*no la sueltes tensa/);
  /* Gateo: los cuatro de vuelta. Desliza el talón: la pelvis quieta manda sobre el recorrido. */
  for (const p of paso('Gateo con rodillas')) expect(p).toMatch(/cuatro atrás/);
  for (const p of paso('Desliza el talón')) expect(p).toMatch(/sin mover la pelvis/);
  const en = leer('app/i18n/content/extra.js') + leer('app/i18n/content/move.js');
  expect(en.match(/Ten seconds palm down and ten palm up/g) || []).toHaveLength(2);
});
