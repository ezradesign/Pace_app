// Persona 1: alguien nuevo en el móvil (360 × 740), sin nada guardado.
const { abrir, foto, tocar, adelantar, finBloque, estadoDe } = require('./lib');
const { capa } = require('./capa');
const P = 'p1';
const paso = async (page, nombre, conFoto = true) => { console.log('\n== ' + nombre + ': ' + (await capa(page))); if (conFoto) await foto(page, nombre, P); };
(async () => {
  const { browser, page, errores } = await abrir({});
  await tocar(page, 'Comenzar', { exact: true });
  await paso(page, 'onb-semana');
  await tocar(page, 'Continuar', { exact: true });
  for (let i = 0; i < 4; i++) {
    await paso(page, 'onb-sig-' + i);
    if (await page.locator('[data-pace-onb-comenzar]').filter({ visible: true }).count()) { await tocar(page, '[data-pace-onb-comenzar]'); break; }
    if (!(await tocar(page, /^(Continuar|Siguiente|Comenzar|Empezar)$/))) break;
  }
  for (let i = 0; i < 8; i++) {
    if (!(await page.locator('[data-pace-visita]').count())) break;
    console.log('VISITA ' + i + ': ' + (await page.locator('[data-pace-visita-tarjeta]').innerText()).replace(/\s+/g, ' ').slice(0, 240));
    if (i === 0) await foto(page, 'visita-0', P);
    if (!(await tocar(page, '[data-pace-visita-siguiente]'))) { await tocar(page, '[data-pace-visita-saltar]'); break; }
  }
  await paso(page, 'home-primera-vez');
  console.log('errores: ' + JSON.stringify(errores));
  const s = await estadoDe(page);
  console.log('ritmo: ' + JSON.stringify(s && s.ritmo).slice(0, 500));
  await page.context().storageState({ path: __dirname + '/p1-estado.json' });
  await browser.close();
})().catch((e) => { console.error('FALLO', e); process.exit(1); });
