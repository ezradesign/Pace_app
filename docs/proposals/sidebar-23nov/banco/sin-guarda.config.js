/* La suite sin la guarda del build: para ver caer una prueba nueva sobre el index.html de main. */
'use strict';
const path = require('path');
const base = require('../../../../playwright.config.js');
module.exports = Object.assign({}, base, {
  testDir: path.resolve(__dirname, '../../../../tests'),
  globalSetup: undefined,
  projects: [base.projects[0]],
  webServer: Object.assign({}, base.webServer, { cwd: path.resolve(__dirname, '../../../..') }),
});
