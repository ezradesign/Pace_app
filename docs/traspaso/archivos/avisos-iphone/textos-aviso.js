// Saca los textos reales del aviso de fin en las apps, bloque a bloque, en es y en, con «A tu ritmo»
// (jornada entera y media jornada) y sin él. Uso: node textos-aviso.js <raiz-del-repo> <puerto>
const path = require('path');
const ROOT = process.argv[2];
const PUERTO = process.argv[3] || '8806';
const { chromium } = require(path.join(ROOT, 'node_modules', '@playwright/test'));
const { sembrar } = require(path.join(ROOT, 'tests', 'helpers.js'));

const DIAS = {
  jornada: { fecha: '2026-09-17', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} },
  media: { fecha: '2026-09-17', opcion: 'media', desde: 540, cicloBase: 0, cambios: {} },
};

(async () => {
  const navegador = await chromium.launch();
  const fuera = {};
  for (const lang of ['es', 'en']) {
    for (const [nombre, dia] of Object.entries(DIAS)) {
      const context = await navegador.newContext({ locale: 'es-ES', timezoneId: 'Europe/Madrid', viewport: { width: 1280, height: 720 } });
      await sembrar(context, { soundOn: false, lang, ritmo: { dia } });
      await context.clock.install({ time: new Date('2026-09-17T09:00:00+02:00') });
      const page = await context.newPage();
      await page.goto('http://localhost:' + PUERTO + '/index.html');
      await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'attached' });
      fuera[lang + '.' + nombre] = await page.evaluate(() => {
        const s = getState(), S = window.PACE_STRINGS, lang = s.lang;
        const t = (k) => (S[lang] && S[lang][k] !== undefined ? S[lang][k] : S.en[k] !== undefined ? S.en[k] : k);
        const tn = (k, v) => Object.keys(v || {}).reduce((x, c) => x.split('{' + c + '}').join(String(v[c])), t(k));
        const p = ritmoPlan(s);
        const filas = [];
        for (let k = 0; k < p.total; k++) {
          const s2 = Object.assign({}, s, { cycle: k });
          const p2 = ritmoPlan(s2);
          const fin = p2.actual ? p2.actual.desde + p2.actual.dur : null;
          filas.push({ bloque: k + 1, acaba: fin != null ? ritmoHora(fin) : null, aviso: ritmoAvisoFin(s2, t, tn, lang) });
        }
        return { total: p.total, filas, siempre: { title: t('notify.focus.title'), body: t('notify.focus.body') } };
      });
      await context.close();
    }
  }
  await navegador.close();
  console.log(JSON.stringify(fuera, null, 2));
})().catch((e) => { console.error(e); process.exit(1); });
