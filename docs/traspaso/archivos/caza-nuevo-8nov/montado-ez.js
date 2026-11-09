/* La página «Montado» de la caza de lo nuevo: el antes y el ahora de lo que eligió Ez el 8 nov.
   (N2 A y N3 A) y por qué 6A no entra, con las fotos dentro en webp para que sea un solo archivo.
   Cada versión de la app se sirve por `page.route` en lugar del index.html del disco, así que
   las tres se fotografían en el mismo servidor y a la vez. Uso, desde la raíz:
     ANTES=<index de antes> AHORA=<index de ahora> CON6A=<index con 6A> [PORT=8893] \
       node docs/traspaso/archivos/caza-nuevo-8nov/montado-ez.js
   Sale `docs/audits/caza-nuevo-8nov/montado-ez.html`. */
'use strict';
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const sharp = require('sharp');
const { chromium } = require('@playwright/test');

const RAIZ = path.resolve(__dirname, '../../../..');
const PUERTO = Number(process.env.PORT || 8893);
const BASE = 'http://localhost:' + PUERTO;
const SALE = path.join(RAIZ, 'docs/audits/caza-nuevo-8nov/montado-ez.html');
const INDEX = { antes: process.env.ANTES, ahora: process.env.AHORA, con6a: process.env.CON6A };
const SEMILLA = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', ritmo: { libre: true }, novedadesVistas: '*' };
const COPIA = { app: 'PACE', version: '0.194.0', state: Object.assign({}, SEMILLA, { totalFocusMin: 135,
  achievements: { 'first.focus': { unlockedAt: 1761900100000 }, 'secret.backup': { unlockedAt: 1761900200000 } } }) };

let nav;
async function abrir(version, w, h, estado) {
  const ctx = await nav.newContext({ viewport: { width: w, height: h }, locale: 'es-ES', timezoneId: 'Europe/Madrid',
    colorScheme: 'light', hasTouch: w < 768, serviceWorkers: 'block' });
  const html = fs.readFileSync(INDEX[version], 'utf8');
  await ctx.route('**/index.html', (r) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: html }));
  await ctx.addInitScript(([e]) => { if (e && !localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(e)); }, [estado]);
  const page = await ctx.newPage();
  await page.goto(BASE + '/index.html');
  await page.waitForTimeout(1200);
  return { ctx, page };
}

async function webp(page, ancho) {
  const png = await page.screenshot();
  const b = await sharp(png).resize({ width: ancho }).webp({ quality: 64 }).toBuffer();
  return 'data:image/webp;base64,' + b.toString('base64');
}

/* Panel › «Tus rutinas» › tres ejercicios › «Guardar», como en la caza (miércoles). */
async function crearRutina(page, movil) {
  if (movil) await page.getByRole('button', { name: /Abrir panel/ }).filter({ visible: true }).first().click();
  await page.locator('aside[data-pace-sidebar]').getByRole('button', { name: /^Tus rutinas/ }).filter({ visible: true }).first().click();
  for (let k = 0; k < 3; k++) {
    await page.getByRole('button', { name: /Añadir ejercicio/ }).filter({ visible: true }).first().click();
    await page.locator('[data-pace-modal-backdrop]').last().getByRole('button').filter({ hasText: /\d+\s*s$/ }).nth(k * 3).click();
    const volver = page.getByRole('button', { name: /Volver/ }).filter({ visible: true });
    if (await volver.count()) await volver.first().click();
  }
  await page.getByPlaceholder('Mi rutina').fill('Mi pausa de la tarde');
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await page.waitForTimeout(900);
}

(async () => {
  const servidor = spawn(process.execPath, [path.join(RAIZ, '.claude/static-server.js')], { cwd: RAIZ, env: Object.assign({}, process.env, { PORT: String(PUERTO) }), stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 900));
  nav = await chromium.launch();
  const f = {};
  try {
    for (const v of ['antes', 'ahora']) {
      for (const [w, h, movil] of [[360, 800, true], [1280, 800, false]]) {
        const { ctx, page } = await abrir(v, w, h, SEMILLA);
        await crearRutina(page, movil);
        f['n2-' + v + '-' + w] = await webp(page, movil ? 300 : 640);
        await ctx.close();
        const b = await abrir(v, w, h, null);
        await b.page.locator('[data-pace-cta]').first().waitFor();
        await b.page.waitForTimeout(500);
        f['n3-' + v + '-' + w] = await webp(b.page, movil ? 300 : 640);
        if (v === 'ahora' && movil) {
          const [elige] = await Promise.all([b.page.waitForEvent('filechooser'), b.page.locator('[data-pace-onb-copia]').click()]);
          await elige.setFiles({ name: 'pace-copia.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(COPIA)) });
          await b.page.locator('[data-pace-aj-aviso]').waitFor();
          await b.page.waitForTimeout(500);
          f['n3-aviso'] = await webp(b.page, 300);
        }
        await b.ctx.close();
      }
    }
    for (const v of ['ahora', 'con6a']) {
      for (const h of [800, 640]) {
        const { ctx, page } = await abrir(v, 360, h, SEMILLA);
        await page.getByRole('button', { name: 'Abrir ajustes' }).filter({ visible: true }).first().click();
        await page.waitForTimeout(700);
        f['6a-' + v + '-' + h] = await webp(page, 300);
        f['6a-' + v + '-' + h + '-scroll'] = await page.evaluate(() => { const p = document.querySelector('[data-pace-tweaks-panel]'); return p.scrollHeight - p.clientHeight; });
        await ctx.close();
      }
    }
  } finally {
    await nav.close();
    servidor.kill();
  }
  const fig = (k, pie, ancho) => `<figure style="flex-basis:${ancho || 200}px"><img src="${f[k]}" alt="${pie.replace(/<[^>]+>/g, '')}" width="${ancho || 200}"><figcaption>${pie}</figcaption></figure>`;
  const html = fs.readFileSync(path.join(__dirname, 'montado-ez.plantilla.html'), 'utf8')
    .replace('{{N2_MOVIL}}', fig('n2-antes-360', '<b>Antes.</b> Al guardar vuelves al inicio; tu rutina no se ve.') + fig('n2-ahora-360', '<b>Ahora.</b> Al guardar se abre «Tus rutinas» con la nueva dentro.'))
    .replace('{{N2_ORDENADOR}}', fig('n2-antes-1280', '<b>Antes.</b> En el ordenador, lo mismo: al guardar, el inicio.', 320) + fig('n2-ahora-1280', '<b>Ahora.</b> Se abre Mueve con tus rutinas a la izquierda.', 320))
    .replace('{{N3_MOVIL}}', fig('n3-antes-360', '<b>Antes.</b> La primera pantalla, solo con «Comenzar».') + fig('n3-ahora-360', '<b>Ahora.</b> Debajo, «¿Tienes una copia? Tráela».') + fig('n3-aviso', '<b>Al elegir la copia,</b> el aviso de siempre, encima de la bienvenida.'))
    .replace('{{N3_ORDENADOR}}', fig('n3-antes-1280', '<b>Antes,</b> en el ordenador.', 320) + fig('n3-ahora-1280', '<b>Ahora,</b> con el enlace. Sin scroll en ningún tamaño de 640 px de alto o más.', 320))
    .replace('{{6A}}', fig('6a-ahora-800', '<b>Hoy,</b> a 360 × 800.') + fig('6a-con6a-800', '<b>Con «Escuchar» y la línea,</b> a 360 × 800: cabe.')
      + fig('6a-ahora-640', '<b>Hoy,</b> en un móvil de 640 px de alto: cabe justo.') + fig('6a-con6a-640', `<b>Con las dos líneas,</b> a 640: pide ${f['6a-con6a-640-scroll']} px de scroll (en Android, 23).`));
  fs.mkdirSync(path.dirname(SALE), { recursive: true });
  fs.writeFileSync(SALE, html);
  console.log(SALE, Math.round(html.length / 1024) + ' KB', 'scroll 640:', f['6a-ahora-640-scroll'], f['6a-con6a-640-scroll']);
})().catch((e) => { console.error(e); process.exit(1); });
