/* PACE · configuracion de Playwright (s154)
 * ==========================================
 * Cubre el PRIMER hueco que `npm run verify` declara e imprime en cada pasada:
 * «comportamiento: no abre navegador, no monta la app, no pulsa nada». Todo lo
 * demas de la red de seguridad sigue donde estaba — esto no reimplementa nada
 * del verify, lo COMPLEMENTA por el otro lado.
 *
 * QUE SE PRUEBA: `index.html`, el artefacto WEB/PWA canonico (s134), NUNCA
 * `PACE.html`. Es la regla de cierre de CLAUDE.md y no es cosmetica: el build
 * envuelve cada modulo en un IIFE y hay fallos que SOLO salen ahi (el `useState`
 * pelado de s144 estuvo dos versiones publicado). El servidor mapea `/` a
 * `PACE.html`, asi que la URL va SIEMPRE con `/index.html` explicito.
 *
 * SERVIDOR: se reutiliza `.claude/static-server.js`, que ya existia (s80), esta
 * committeado y no tiene dependencias. Sirve el cwd con `Cache-Control:
 * no-store`. Un origen `http://localhost` ademas es contexto seguro, que es lo
 * que permite medir el Service Worker de verdad — con `file://` no habria ni SW
 * ni cache real (y s134 ya documenta que `file://` no emite eventos por diseno).
 *
 * DETERMINISMO — las cuatro cosas que se fijan a proposito:
 *   · `locale: es-ES`  -> `detectInitialLang()` (useT.jsx) devuelve 'es'. Los
 *     textos que se asertan son los espanoles; en un runner con otro locale la
 *     app arrancaria en ingles y fallaria por una razon que no es la que parece.
 *   · `timezoneId`     -> las claves ISO y el rollover dependen del huso.
 *   · `colorScheme: light` -> `detectInitialPalette()` lee `prefers-color-scheme`
 *     en el primer arranque, y la prueba de Tweaks necesita salir de «crema».
 *   · `viewport 1280x720` -> Desktop, con sidebar visible (>768px).
 *
 * `retries: 0` A PROPOSITO: un test que solo pasa al segundo intento esta
 * diciendo algo, y reintentar lo esconde.
 */
'use strict';

const { defineConfig } = require('@playwright/test');

const PUERTO = Number(process.env.PACE_E2E_PORT || 8765);
const BASE = 'http://localhost:' + PUERTO;

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
  timeout: 60_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: BASE,
    locale: 'es-ES',
    timezoneId: 'Europe/Madrid',
    colorScheme: 'light',
    trace: 'retain-on-failure',
  },

  /* Sin `devices[...]`: el descriptor puede traer un `channel` que exigiria un
     Chrome del sistema. Aqui todo lo que importa va explicito. */
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium', viewport: { width: 1280, height: 720 } },
    },
  ],

  webServer: {
    command: 'node .claude/static-server.js',
    url: BASE + '/index.html',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    env: { PORT: String(PUERTO) },
  },
});
