/* PACE · la configuración de las medidas que no son pruebas (20 nov. 2026)
 * =======================================================================
 * Hereda la de la suite (playwright.config.js) y solo recoge `tests/*.mide.js`, que miden y
 * apuntan sin fallar por lo que miden. La suite no las ve: su `testMatch` es `*.spec.js`.
 *
 *     npx playwright test -c playwright.mide.config.js
 */
'use strict';

const { defineConfig } = require('@playwright/test');
const base = require('./playwright.config.js');

module.exports = defineConfig(Object.assign({}, base, {
  testMatch: /\.mide\.js$/,
  projects: [base.projects.find((p) => p.name === 'chromium')],
}));
