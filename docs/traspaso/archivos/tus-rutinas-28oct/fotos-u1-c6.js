// Fotos para la maqueta de U1 y C6 («Tus rutinas»: el borrador que se pierde y guardar sin respuesta).
// Son del index.html de la rama claude/tus-rutinas-c0cf03 tal cual; las opciones se pintan ENCIMA con
// los componentes de la propia app (Modal, Button y sus colores), sin tocar su código. Uso, desde la raíz
// del worktree y tras `node build-standalone.js`: node docs/traspaso/archivos/tus-rutinas-28oct/fotos-u1-c6.js
// <carpeta-de-fotos>. Levanta su servidor en el 8809 y lo apaga al acabar. Cada escena, a 1280 y a 360 px.
'use strict';
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const RAIZ = path.resolve(__dirname, '../../../..');
const { chromium } = require(path.join(RAIZ, 'node_modules/playwright'));
const OUT = path.resolve(process.argv[2] || path.join(__dirname, 'fotos'));
fs.mkdirSync(OUT, { recursive: true });
const PUERTO = 8809;
const BASE = 'http://localhost:' + PUERTO;

const propia = (n, nombre, pasos) => ({ id: 'custom.17600000000' + n, name: nombre,
  steps: pasos.map(([name, dur]) => ({ name, dur })), min: 3, createdAt: 1760000000000 + n, updatedAt: 1760000000000 + n });
const NUEVE = [
  ['Cuello de tarde', [['Barbilla atrás', 30], ['Cuello y trapecios', 40]]],
  ['Piernas al café', [['Sentadilla a silla', 40], ['Elevación de talones', 30]]],
  ['Espalda alta', [['Juntar omóplatos', 30], ['Extensión torácica', 40]]],
  ['Muñecas', [['Círculos de muñeca', 20], ['Palmas en la mesa', 40]]],
  ['Caderas', [['Flexor de cadera', 45], ['90/90', 60]]],
  ['Core rápido', [['Plancha', 40], ['Hueco abdominal', 30]]],
  ['Antes de comer', [['Rodar hacia abajo', 45], ['Pliegue adelante', 50]]],
  ['Brazos', [['Fondos en silla', 40], ['Flexiones inclinadas', 40]]],
  ['Cerrar el día', [['Respiraciones profundas', 20], ['Gato-camello', 45]]],
];
const SEMILLA = {
  firstSeen: 1, langAuto: false, paletteAuto: false, ritmo: { libre: true }, lang: 'es', palette: 'crema',
  _historyMigrated: true, _weeklyStatsReindexed_v0_28_8: true, _historyRecalculated_v0_28_8: true,
  profile: { need: 'focus', time: 'pause', environment: 'home', completedAt: 1 },
};

async function abrir(browser, w, rutinas) {
  const movil = w < 700;
  const ctx = await browser.newContext({ viewport: { width: w, height: movil ? 740 : 720 }, deviceScaleFactor: movil ? 2 : 1,
    isMobile: movil, hasTouch: movil, locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light', serviceWorkers: 'block' });
  await ctx.addInitScript((s) => { localStorage.setItem('pace.state.v2', JSON.stringify(s)); },
    Object.assign({}, SEMILLA, { sidebarCollapsed: movil, customRoutines: rutinas }));
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date('2026-10-29T10:42:00+01:00') });
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.mouse.move(1, 1);
  return { ctx, page, movil };
}
async function tusRutinas(page) {
  await page.getByRole('button', { name: /^Mueve/ }).filter({ visible: true }).first().click();
  const b = page.locator('.pace-lib').filter({ visible: true }).first();
  await b.getByText(/^Tus rutinas/).filter({ visible: true }).first().click();
  return b;
}
async function borrador(page, b, nombre) {
  await b.getByRole('button', { name: /Crear rutina/ }).click();
  for (const ej of ['Barbilla atrás', 'Juntar omóplatos', 'Rotación torácica']) {
    await page.getByRole('button', { name: /Añadir ejercicio/ }).filter({ visible: true }).first().click();
    await page.locator('[data-pace-modal-backdrop]').last().getByRole('button').filter({ hasText: ej }).first().click();
    await page.getByRole('button', { name: /Volver/ }).filter({ visible: true }).first().click();
  }
  await page.getByPlaceholder('Mi rutina').fill(nombre);
}

/* Una ventana de la app encima de lo que hay, con su Modal y sus Button. */
async function pregunta(page, titulo, texto, botones) {
  await page.evaluate(([titulo, texto, botones]) => {
    const h = React.createElement;
    const el = document.createElement('div'); document.body.appendChild(el);
    ReactDOM.createRoot(el).render(h(window.Modal, { open: true, onClose: () => {}, maxWidth: 440, title: titulo },
      h('p', { style: { margin: '0 0 22px', color: 'var(--ink-2)', fontSize: 15, lineHeight: 1.55 } }, texto),
      h('div', { style: { display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' } },
        botones.map(([v, txt]) => h(window.Button, { key: txt, variant: v, onClick: () => {} }, txt)))));
  }, [titulo, texto, botones]);
  await page.waitForTimeout(400);
}
/* Una línea dentro del constructor: arriba (antes del nombre) o encima de los botones de abajo. */
async function linea(page, donde, html) {
  await page.evaluate(([donde, html]) => {
    const modal = [...document.querySelectorAll('[data-pace-modal-backdrop]')].pop();
    const input = modal.querySelector('input[type="text"]');
    const p = document.createElement('div'); p.innerHTML = html;
    if (donde === 'arriba') input.parentElement.parentElement.insertBefore(p, input.parentElement);
    else {
      const pie = [...modal.querySelectorAll('div')].find(d => d.style.borderTop && d.style.borderTop.indexOf('solid') >= 0 && d.style.paddingTop === '16px');
      pie.parentElement.insertBefore(p, pie);
    }
  }, [donde, html]);
  await page.waitForTimeout(200);
}
const LINEA = (txt, boton, tono) => '<p style="display:flex;flex-wrap:wrap;gap:6px 12px;align-items:baseline;margin:0 0 14px;padding:10px 12px;border-radius:var(--r-sm);'
  + 'background:var(--paper-2);border-left:3px solid ' + (tono || 'var(--move)') + ';font-size:13.5px;line-height:1.5;color:var(--ink-2)">'
  + '<span>' + txt + '</span>' + (boton ? '<button type="button" style="padding:0;border:0;background:none;font:inherit;font-size:13.5px;color:var(--ink);text-decoration:underline;text-underline-offset:3px;cursor:pointer">' + boton + '</button>' : '') + '</p>';

async function foto(page, nombre) {
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(OUT, nombre + '.jpg'), type: 'jpeg', quality: 72 });
  console.log('  ' + nombre);
}

const ESCENAS = {
  /* Hoy: el selector, donde Escape y la × lo cierran todo. */
  async hoy(page) {
    const b = await tusRutinas(page);
    await borrador(page, b, 'Media mañana');
    await page.getByRole('button', { name: /Añadir ejercicio/ }).filter({ visible: true }).first().click();
    return 'hoy-selector';
  },
  /* U1 · A: al cerrar con cambios, pregunta. */
  async u1a(page) {
    const b = await tusRutinas(page);
    await borrador(page, b, 'Media mañana');
    await pregunta(page, '¿Guardar «Media mañana»?', 'Has cambiado la rutina y aún no está guardada. Si la descartas, se pierden los cambios.',
      [['ghost', 'Seguir editando'], ['secondary', 'Descartar'], ['primary', 'Guardar']]);
    return 'u1-a-pregunta';
  },
  /* U1 · B: se cierra sin preguntar y el borrador espera en «Tus rutinas». */
  async u1bLista(page, movil) {
    await tusRutinas(page);
    await page.evaluate(() => {
      document.querySelectorAll('[data-pace-custom-crear]').forEach((crear) => { crear.querySelector('span').innerHTML = '<span style="display:block;font-size:24px;line-height:1;margin-bottom:6px;color:var(--move)">+</span>'
        + '<span style="display:block;font-family:var(--font-display);font-style:italic;font-size:17px;font-weight:500">Seguir con tu borrador</span>'
        + '<span style="display:block;font-size:12px;color:var(--ink-3);margin:8px 0 0;line-height:1.5">Media mañana · 3 ejercicios · de hoy, 10:42</span>'; });
    });
    await page.locator('[data-pace-custom-crear]').filter({ visible: true }).first().scrollIntoViewIfNeeded();
    return 'u1-b-lista';
  },
  async u1bEditor(page) {
    const b = await tusRutinas(page);
    await borrador(page, b, 'Media mañana');
    await linea(page, 'arriba', LINEA('Sigues con tu borrador de hoy, 10:42.', 'Empezar de cero'));
    return 'u1-b-editor';
  },
  /* C6 · A: una línea encima de Guardar, y el borrador sigue ahí. */
  async c6aTope(page, movil) {
    const b = await tusRutinas(page);
    await borrador(page, b, 'Media mañana');
    await linea(page, 'abajo', LINEA('Ya tienes 10 rutinas, el máximo. Borra una para guardar esta; tu borrador sigue aquí.', null, 'var(--breathe)'));
    if (movil) await page.getByRole('button', { name: 'Guardar', exact: true }).scrollIntoViewIfNeeded();
    return 'c6-a-tope';
  },
  async c6aBorrada(page, movil) {
    const b = await tusRutinas(page);
    await b.locator('h4:visible', { hasText: 'Cuello de tarde' }).first().locator('xpath=..').getByRole('button', { name: 'Editar' }).click();
    await page.waitForTimeout(300);
    await linea(page, 'abajo', LINEA('Esta rutina se ha borrado en otra pestaña.', 'Guardarla como nueva', 'var(--breathe)'));
    if (movil) await page.getByRole('button', { name: 'Guardar', exact: true }).scrollIntoViewIfNeeded();
    return 'c6-a-borrada';
  },
  /* C6 · B: lo mismo, en una ventana. */
  async c6b(page) {
    const b = await tusRutinas(page);
    await borrador(page, b, 'Media mañana');
    await pregunta(page, 'No se ha podido guardar', 'Ya tienes 10 rutinas, el máximo. Borra una para guardar esta; tu borrador sigue aquí.',
      [['primary', 'Entendido']]);
    return 'c6-b-ventana';
  },
};

(async () => {
  const server = spawn(process.execPath, [path.join(RAIZ, '.claude/static-server.js')], { cwd: RAIZ, env: Object.assign({}, process.env, { PORT: String(PUERTO) }) });
  await new Promise(r => setTimeout(r, 800));
  const browser = await chromium.launch();
  try {
    for (const [clave, escena] of Object.entries(ESCENAS)) {
      for (const w of [1280, 360]) {
        const rutinas = NUEVE.map(([n, p], i) => propia(i, n, p)).slice(0, clave === 'c6aTope' || clave === 'c6b' ? 9 : 4);
        const { ctx, page, movil } = await abrir(browser, w, rutinas);
        try { await foto(page, (await escena(page, movil)) + '-' + w); }
        catch (e) { console.log('  FALLA ' + clave + ' ' + w + ': ' + e.message.split('\n')[0]); }
        await ctx.close();
      }
    }
  } finally { await browser.close(); server.kill(); }
})();
