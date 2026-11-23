/* El banco de fotos de la barra, con la configuración de la suite y su propia carpeta. */
'use strict';
const path = require('path');
const base = require('../../../../playwright.config.js');
module.exports = Object.assign({}, base, {
  testDir: __dirname,
  testMatch: /(fotos|medir)\.spec\.js$/,
  globalSetup: undefined,
  projects: [base.projects[0]],
  webServer: Object.assign({}, base.webServer, { cwd: path.resolve(__dirname, '../../../..') }),
});
