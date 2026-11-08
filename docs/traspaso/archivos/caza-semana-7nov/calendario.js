/* El calendario de la semana: el lunes el .ics («Otro calendario») y el martes las reuniones de
   Google, con el proveedor y la API falseados como en tests/ritmo-calendario.spec.js. */
'use strict';
const fs = require('fs');

const planHoy = (p) => p.evaluate(() => {
  const pl = ritmoPlan(getState());
  return pl ? pl.m.items.map((it) => it.tipo + '@' + ritmoHora(it.desde) + '+' + it.dur) : null;
});

async function abrirHoja(p, vis) {
  await vis(p, '[data-pace-ritmo-calendario]').first().click();
  await p.locator('[data-pace-cal]').first().waitFor({ state: 'visible', timeout: 8000 });
  await p.waitForTimeout(300);
  return p.locator('[data-pace-cal]').first();
}

async function ics(p, o) {
  const hoja = await abrirHoja(p, o.vis);
  await o.L.foto(p, o.tag('lun-hoja-calendario'));
  const espera = p.waitForEvent('download', { timeout: 8000 });
  await hoja.locator('[data-pace-cal-destino="archivo"] button').click();
  const des = await espera;
  const ruta = await des.path();
  const txt = fs.readFileSync(ruta, 'utf8');
  const ev = [];
  txt.split(/\r\n(?! )/).forEach((l) => {
    if (l.startsWith('DTSTART:')) ev.push({ ini: l.slice(8) });
    if (l.startsWith('DTEND:')) ev[ev.length - 1].fin = l.slice(6);
    if (l.startsWith('SUMMARY:')) ev[ev.length - 1].t = l.slice(8).replace(/\r\n /g, '');
  });
  const local = (s) => { const d = new Date(Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8), +s.slice(9, 11), +s.slice(11, 13))); return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'); };
  o.apunta('lun ics', { nombre: des.suggestedFilename(), eventos: ev.map((e) => local(e.ini) + '-' + local(e.fin) + ' ' + e.t) });
  o.apunta('lun plan', await planHoy(p));
  await o.L.foto(p, o.tag('lun-ics-hecho'));
  await p.keyboard.press('Escape');
  await p.waitForTimeout(400);
}

async function google(p, o) {
  const ctx = o.ctx;
  await ctx.route('https://accounts.google.com/**', (route) => {
    const url = new URL(route.request().url());
    const destino = url.searchParams.get('redirect_uri') + '#access_token=pase-g&expires_in=3600&token_type=Bearer&state=' + url.searchParams.get('state');
    return route.fulfill({ status: 302, headers: { location: destino } });
  });
  const vistas = [];
  const reuniones = [
    { id: 'r1', start: { dateTime: '2026-11-10T10:00:00+01:00' }, end: { dateTime: '2026-11-10T11:00:00+01:00' } },
    { id: 'r2', start: { dateTime: '2026-11-10T15:00:00+01:00' }, end: { dateTime: '2026-11-10T15:30:00+01:00' } },
  ];
  await ctx.route('https://www.googleapis.com/**', async (route) => {
    const req = route.request();
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' } });
    vistas.push(req.method() + ' ' + req.url().split('?')[0].slice(-40));
    let body = JSON.stringify({ items: [] });
    if (req.method() === 'POST') body = JSON.stringify({ id: 'nuevo' + vistas.length });
    else if (req.method() === 'DELETE') return route.fulfill({ status: 204, headers: { 'Access-Control-Allow-Origin': '*' }, body: '' });
    else if (!req.url().includes('privateExtendedProperty')) body = JSON.stringify({ items: reuniones });
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body });
  });
  await p.evaluate(() => { CALENDARIO_IDS.google = 'id-de-prueba'; });
  o.apunta('mar plan antes', await planHoy(p));
  const hoja = await abrirHoja(p, o.vis);
  const fila = hoja.locator('[data-pace-cal-destino="google"]');
  const mantener = hoja.locator('[data-pace-cal-mantener]');
  if (await mantener.count() && await mantener.isChecked()) await mantener.uncheck();
  await fila.locator('button').click();
  await hoja.locator('[data-pace-cal-aviso]').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(800);
  o.apunta('mar google', { aviso: (await hoja.locator('[data-pace-cal-aviso]').allTextContents()).join(' | '), llamadas: vistas.length, ocupado: await p.evaluate(() => (getState().ritmo.ocupado || {}).tramos) });
  await o.L.foto(p, o.tag('mar-google'));
  await p.keyboard.press('Escape');
  await p.waitForTimeout(400);
  o.apunta('mar plan con reuniones', await planHoy(p));
}

module.exports = { ics, google, planHoy };
