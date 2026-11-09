/* Las opciones pintadas para Ez (caza de los seis anchos, 9 nov. 2026). Cada una: escena de
   pintar.js, idiomas y el CSS que se pone encima de la app. */
'use strict';
module.exports = [
  /* 1 · La frase del día en el móvil deja «1 h» sola en la segunda línea (360 px, castellano). */
  { id: '1-hoy', escena: 'dia360', langs: ['es', 'en'] },
  { id: '1A-equilibrada', escena: 'dia360', langs: ['es', 'en'], css: '.pace-rt-frase { text-wrap: balance; }' },
  { id: '1B-sin-huerfana', escena: 'dia360', langs: ['es', 'en'], css: '.pace-rt-frase { text-wrap: pretty; }' },
  { id: '1-hoy-320', escena: 'dia320', langs: ['es'] },
  { id: '1A-equilibrada-320', escena: 'dia320', langs: ['es'], css: '.pace-rt-frase { text-wrap: balance; }' },
];
