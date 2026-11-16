/* Configuración solo para el generador de las siembras viejas (captura.gen.js): la de la suite,
   con esta carpeta y este archivo. Así la suite no lo corre ni lo cuenta. */
'use strict';

const path = require('path');
const base = require('../../../playwright.config.js');

module.exports = Object.assign({}, base, {
  testDir: __dirname,
  testMatch: /captura\.gen\.js$/,
  projects: [base.projects[0]],
  workers: 1,
  webServer: Object.assign({}, base.webServer, { cwd: path.join(__dirname, '..', '..', '..') }),
});
