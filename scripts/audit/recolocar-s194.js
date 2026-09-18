/* PACE · MAQUETA «recolocar a mitad de día» (s194, ronda 1)
 * =========================================================
 * Hoy las horas de la línea son las del plan: si el bloque 2 empezaba a las 9:50 y lo
 * empiezas a las 10:10, la línea sigue diciendo 9:50 y todo lo de detrás va veinte
 * minutos «mal». La propuesta: al cerrar la pausa (empezar el bloque N), si vas por
 * detrás o por delante, la línea se recompone DESDE AHORA con la política de siempre
 * («salgo a mi hora»), y lo hecho queda como historia.
 *
 * Regla de s173/s174: se PINTA antes de decidir, sobre la app real. Este script
 * fotografía el mismo guion dos veces —con `--hoy` sobre el artefacto de antes de la
 * regla y sin él sobre el de después— y con `--pagina` compone
 * `docs/proposals/recolocar-r1.html` con los dos juegos (fluida, recortes con sharp).
 *
 * El guion: jornada entera a las 9:00 · bloque 1 (45 min) · al acabar, la pausa; se
 * deja pasar hasta las 10:10 (20 min tarde) · «Empezar bloque 2» · foto de la línea ·
 * y otra vez: bloque 2 acaba, 10 min más de retraso, «Empezar bloque 3». Y aparte,
 * llegar ANTES: a las 8:40 con el plan a las 9:00, «Empezar jornada».
 *
 * Uso: node .claude/static-server.js   (aparte, puerto 8765)
 *      node scripts/audit/recolocar-s194.js --hoy      # sobre el artefacto viejo
 *      node scripts/audit/recolocar-s194.js            # sobre el nuevo
 *      node scripts/audit/recolocar-s194.js --pagina   # compone la página
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const { chromium } = require(path.join(ROOT, 'node_modules', '@playwright', 'test'));
const sharp = require(path.join(ROOT, 'node_modules', 'sharp'));

const BASE = process.env.PACE_BASE || 'http://localhost:8765';
const SALIDA = path.join(ROOT, 'docs', 'proposals', 'recolocar-r1.html');
/* Las tandas intermedias van FUERA del repo (temp del sistema): solo la página se commitea. */
const FOTOS = process.env.PACE_FOTOS || path.join(require('os').tmpdir(), 'pace-recolocar-s194');
const HOY = process.argv.includes('--hoy');
const NUEVE = new Date('2026-09-17T09:00:00+02:00');
const OCHO40 = new Date('2026-09-17T08:40:00+02:00');
const VIEWPORTS = [
  { id: 'e1280', w: 1280, h: 879, recortes: { panel: { left: 300, top: 540, width: 980, height: 290 }, lateral: { left: 8, top: 430, width: 270, height: 140 } } },
  { id: 'm412', w: 412, h: 844, recortes: { panel: { left: 0, top: 540, width: 412, height: 304 } } },
];
const semilla = (movil, extra) => Object.assign({
  firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', sidebarCollapsed: movil,
  profile: { need: 'body', time: 'block', environment: 'home', completedAt: 1 },
  ritmo: { dia: { fecha: '2026-09-17', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } },
}, extra || {});

const uri = (buf) => 'data:image/png;base64,' + buf.toString('base64');

async function foto(page, vp, tanda, id) {
  await page.waitForTimeout(200);
  const png = await page.screenshot({ type: 'png' });
  const f = { entera: uri(png), rec: {} };
  for (const k of Object.keys(vp.recortes)) f.rec[k] = { w: vp.recortes[k].width, uri: uri(await sharp(png).extract(vp.recortes[k]).png().toBuffer()) };
  f.plan = await page.evaluate(() => {
    const p = ritmoPlan(getState());
    if (!p) return null;
    return { hasta: ritmoHora(p.m.hasta), bloques: p.total, hechos: p.hechos, actual: p.actual ? ritmoHora(p.actual.desde) + ' · ' + p.actual.dur + ' min' : null,
      paradas: p.m.items.filter((it) => it.tipo === 'pausa' || it.tipo === 'comida').map((it) => ritmoHora(it.desde)).join(' · ') };
  });
  tanda[id] = f;
  console.log('  ' + vp.id + ' ' + id.padEnd(10) + JSON.stringify(f.plan));
}

async function nueva(b, vp, hora, extra) {
  const movil = vp.w <= 640;
  const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1, isMobile: movil, hasTouch: movil });
  await ctx.addInitScript((s) => localStorage.setItem('pace.state.v2', JSON.stringify(s)), semilla(movil, extra));
  const page = await ctx.newPage();
  await page.clock.install({ time: hora });
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(1500);
  return { ctx, page };
}
const cta = (page) => page.locator('[data-pace-cta]').filter({ visible: true }).first();
async function terminarBloque(page) {
  for (let i = 0; i < 60; i++) {
    await page.clock.fastForward(60 * 1000);
    await page.waitForTimeout(60);
    if (await page.locator('[data-pace-break-shortcut]').count()) { await page.waitForTimeout(300); await page.keyboard.press('Escape'); await page.waitForTimeout(300); return; }
  }
  throw new Error('el bloque no terminó');
}

async function guion(b, vp) {
  const tanda = {};
  /* A · llegar tarde a mitad de día */
  let { ctx, page } = await nueva(b, vp, NUEVE);
  await foto(page, vp, tanda, 'plan');
  await cta(page).click(); await page.waitForTimeout(250);
  await terminarBloque(page);                              /* 9:45, la pausa abierta */
  await page.clock.fastForward(25 * 60 * 1000);            /* son las 10:10 */
  await page.waitForTimeout(300);
  await foto(page, vp, tanda, 'pausa-10-10');
  await cta(page).click(); await page.waitForTimeout(400); /* «Empezar bloque 2» a las 10:10 */
  await page.clock.fastForward(60 * 1000); await page.waitForTimeout(1200);
  await foto(page, vp, tanda, 'bloque2');
  await terminarBloque(page);                              /* ~10:55, la pausa 2 */
  await page.clock.fastForward(15 * 60 * 1000);            /* 10 min más de retraso */
  await page.waitForTimeout(300);
  await cta(page).click(); await page.waitForTimeout(400);
  await page.clock.fastForward(60 * 1000); await page.waitForTimeout(1200);
  await foto(page, vp, tanda, 'bloque3');
  await ctx.close();
  /* B · llegar antes */
  ({ ctx, page } = await nueva(b, vp, OCHO40));
  await foto(page, vp, tanda, 'antes-plan');
  await cta(page).click(); await page.waitForTimeout(400);
  await page.clock.fastForward(60 * 1000); await page.waitForTimeout(1200);
  await foto(page, vp, tanda, 'antes-bloque1');
  await ctx.close();
  return tanda;
}

function pagina(hoy, prop) {
  const rec = (f, k, pie) => f ? `<figure><figcaption>${pie}${f.plan ? ' <span class="dato">· hasta ' + f.plan.hasta + ' · ' + f.plan.bloques + ' bloques · paradas ' + f.plan.paradas + '</span>' : ''}</figcaption><img src="${f.rec[k].uri}" style="max-width:min(100%, ${f.rec[k].w}px)" alt=""></figure>` : '';
  const par = (id, titulo, texto, lateral) => `
    <h2>${titulo}</h2><p>${texto}</p>
    <div class="par">
      <div class="lado"><div class="ceja">Hoy</div>${rec(hoy.e1280[id], 'panel', 'Escritorio')}${lateral ? rec(hoy.e1280[id], 'lateral', 'Barra lateral') : ''}${rec(hoy.m412[id], 'panel', 'Móvil')}</div>
      <div class="lado prop"><div class="ceja">Propuesta</div>${rec(prop.e1280[id], 'panel', 'Escritorio')}${lateral ? rec(prop.e1280[id], 'lateral', 'Barra lateral') : ''}${rec(prop.m412[id], 'panel', 'Móvil')}</div>
    </div>`;
  const entera = (id, pie) => `<details><summary>${pie}</summary><figure class="entera"><div class="scroll"><img src="${prop.e1280[id].entera}" width="1280" alt=""></div><div class="scroll"><img src="${prop.m412[id].entera}" width="412" alt=""></div></figure></details>`;
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Recolocar a mitad de día · ronda 1</title>
<style>
  :root { --paper: #F2EDE0; --paper-2: #EAE4D4; --paper-3: #DFD8C4; --ink: #1F1C17; --ink-2: #4A453C; --ink-3: #8A8372; --line: #C9C0A8; --focus: #3E5A3A; --focus-cta: #50624D; --focus-soft: rgba(62,90,58,0.10); }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--paper); color: var(--ink); font-family: 'Inter Tight', system-ui, sans-serif; font-size: 15px; line-height: 1.5; }
  main { max-width: 1100px; margin: 0 auto; padding: 32px 20px 80px; }
  h1, h2 { font-family: 'EB Garamond', Georgia, serif; font-style: italic; font-weight: 500; }
  h1 { font-size: 40px; margin: 6px 0 12px; line-height: 1.05; } h2 { font-size: 28px; margin: 52px 0 6px; line-height: 1.1; }
  p, li { max-width: 78ch; color: var(--ink-2); }
  .ceja { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-3); margin-bottom: 8px; } .prop .ceja { color: var(--focus-cta); }
  figure { margin: 0 0 14px; min-width: 0; max-width: 100%; } figcaption { font-size: 12px; color: var(--ink-3); margin-bottom: 5px; } .dato { color: var(--focus-cta); }
  img { display: block; width: 100%; max-width: 100%; height: auto; border: 1px solid var(--line); border-radius: 8px; background: var(--paper-2); }
  .par { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 18px; margin-top: 10px; } @media (max-width: 860px) { .par { grid-template-columns: minmax(0,1fr); } }
  .lado { border: 1px solid var(--line); border-radius: 12px; padding: 12px 12px 4px; background: var(--paper); min-width: 0; } .lado.prop { border-color: var(--focus-cta); background: var(--focus-soft); }
  .scroll { overflow-x: auto; margin-bottom: 10px; } .scroll img { width: auto; max-width: none; }
  details { margin-top: 10px; } summary { cursor: pointer; font-size: 13px; color: var(--ink-3); }
  .decide { border-top: 1px solid var(--line); padding-top: 6px; margin-top: 30px; } .decide li { margin-bottom: 8px; } .pie { font-size: 12px; color: var(--ink-3); }
  kbd { font: inherit; font-size: 12px; border: 1px solid var(--line); border-radius: 6px; padding: 1px 7px; color: var(--ink-2); background: var(--paper); }
</style></head><body><main>
  <div class="ceja">PACE · maqueta · s194 · ronda 1</div>
  <h1>Recolocar a mitad de día</h1>
  <p>Hoy las horas de la línea son las del plan: si el bloque 2 empezaba a las 9:50 y lo empiezas a las 10:10, la línea sigue
  diciendo 9:50 y todo lo de detrás va veinte minutos «mal». La propuesta: <b>al empezar cada bloque, la línea se recompone
  desde ahora</b> con la política de siempre —salgo a mi hora—; lo hecho queda como historia y la comida sigue a su hora exacta.
  Mismo guion fotografiado sobre la app de antes («hoy») y sobre la de después («propuesta»), con el reloj fijado.</p>
  ${par('pausa-10-10', '1 · Son las 10:10 y la pausa de las 9:45 sigue abierta', 'Todavía no has pulsado nada. Aquí las dos versiones deberían coincidir: recolocar pasa al EMPEZAR el bloque, no mientras esperas.', true)}
  ${par('bloque2', '2 · «Empezar bloque 2» a las 10:10, veinte minutos tarde', 'Hoy el bloque 2 «empezó» a las 9:50 y las paradas siguen en 10:35, 11:25… En la propuesta empieza a las 10:10, las paradas se mueven, la comida sigue a las 14:00 y el día sigue acabando a las 17:00 — con lo que quepa.', true)}
  ${par('bloque3', '3 · Diez minutos más de retraso al empezar el bloque 3', 'Cada bloque recoloca lo que queda. Lo hecho no se mueve: es historia.', false)}
  ${par('antes-bloque1', '4 · Llegar ANTES: son las 8:40 y el plan empezaba a las 9:00', 'Hoy el plan espera a tu hora aunque ya estés. En la propuesta, empezar es empezar: el día arranca a las 8:40.', false)}
  <div class="decide">
    <h2>Lo que hay que decidir</h2>
    <ul>
      <li><b>Cuándo recolocar</b>: <kbd>A</kbd> al empezar cada bloque, siempre (propuesto: la línea dice la verdad) · <kbd>B</kbd> solo si el desfase pasa de 5 minutos.</li>
      <li><b>Si el día ya no cabe</b>: la regla de siempre funde la cola en uno o dos bloques iguales (lo que ves en las fotos); la alternativa sería acortar todos los bloques que quedan. <kbd>A</kbd> como está · <kbd>B</kbd> acortar todos.</li>
      <li><b>El bloque que empiezas tarde</b> dura lo que marca el aro al pulsar (propuesto); recomponer su duración a mitad de pomodoro no tiene sentido.</li>
    </ul>
    <p class="pie">Basta con una línea: «A · A».</p>
  </div>
  <h2>Las pantallas enteras (propuesta), a tamaño real</h2>
  ${entera('bloque2', '2 · bloque 2 a las 10:10')}${entera('bloque3', '3 · bloque 3')}${entera('antes-bloque1', '4 · llegar antes')}
</main></body></html>`;
}

(async () => {
  if (process.argv.includes('--pagina')) {
    const hoy = JSON.parse(fs.readFileSync(path.join(FOTOS, 'hoy.json'), 'utf8'));
    const prop = JSON.parse(fs.readFileSync(path.join(FOTOS, 'propuesta.json'), 'utf8'));
    fs.writeFileSync(SALIDA, pagina(hoy, prop));
    console.log('→ ' + path.relative(ROOT, SALIDA) + ' (' + Math.round(fs.statSync(SALIDA).size / 1024) + ' KB)');
    return;
  }
  const b = await chromium.launch();
  const out = {};
  for (const vp of VIEWPORTS) { console.log(vp.id); out[vp.id] = await guion(b, vp); }
  await b.close();
  fs.mkdirSync(FOTOS, { recursive: true });
  const f = path.join(FOTOS, HOY ? 'hoy.json' : 'propuesta.json');
  fs.writeFileSync(f, JSON.stringify(out));
  console.log('→ ' + path.relative(ROOT, f));
})().catch((e) => { console.error(e); process.exit(1); });
