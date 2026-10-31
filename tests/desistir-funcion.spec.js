/* PACE · E2E · /api/desistir: LA FUNCIÓN DE DESISTIMIENTO EN LÍNEA (punto 16 del ROADMAP)
 * ====================================================================================
 * Ez, 1A del 30 oct. 2026: quien compró en la web desiste con un formulario corto y recibe un acuse
 * con lo que dijo, la fecha y la hora (art. 11 bis de la Directiva 2011/83). La función manda dos
 * correos con Resend: a Ez, para que devuelva, y al comprador, el acuse. Sin cuenta de Resend: su API
 * es falsa y apunta lo que se le manda. En Node, como tests/cobro-recuperar.spec.js.
 *
 * QUE DEFIENDE:
 *  · Apagada sin la llave de Resend; solo desde la propia web; formatos y tamaños.
 *  · El correo a Ez sale PRIMERO: si no sale, 502 y no hay acuse, porque el desistimiento no ha
 *    llegado a nadie. Si solo falla el acuse, el desistimiento ya está y la respuesta lo dice.
 *  · El acuse lleva lo que dijo, la fecha y la hora de Madrid y una referencia, en su idioma; el aviso
 *    a Ez, en castellano y con el correo del comprador para contestar.
 *  · El nombre no mete saltos de línea en el asunto; la trampa para robots no manda nada.
 *  · Cinco intentos por hora desde una conexión; el sexto, 429, sin guardar la IP. No guarda nada.
 * Contra 5cd9ae62 caen todas: no hay /api/desistir.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { importar } = require('./cobro.helpers');

const CLAVE = 're_prueba_' + Date.now();
const env = (extra) => Object.assign({ RESEND_CLAVE: CLAVE }, extra || {});
const BIEN = { nombre: 'Lucía Pérez', correo: 'lucia@correo.es', recibo: '1653-2453', plan: 'vida', idioma: 'es', web: '' };

const pedir = (cuerpo, cabeceras) => new Request('https://pacegrass.app/api/desistir', { method: 'POST',
  body: typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo), headers: Object.assign({ 'Content-Type': 'application/json' }, cabeceras || {}) });

/* Un Resend falso en `fetch`. `fallan` dice qué envíos fallan, por orden (0, el primero). */
function conResend(fallan, revienta) {
  const mandados = [];
  globalThis.fetch = async (url, opciones) => {
    const i = mandados.length;
    mandados.push(Object.assign({ url: String(url), auth: opciones.headers.Authorization }, JSON.parse(opciones.body)));
    if (revienta && revienta.includes(i)) throw new Error('sin red');
    if (fallan && fallan.includes(i)) return new Response('{"message":"no"}', { status: 422 });
    return new Response('{"id":"re_' + i + '"}', { status: 200 });
  };
  return mandados;
}

test.describe('/api/desistir', () => {
  let desistir, fetchDeVerdad;
  test.beforeAll(async () => { desistir = await importar('functions/api/desistir.js'); fetchDeVerdad = globalThis.fetch; });
  test.afterEach(() => { globalThis.fetch = fetchDeVerdad; delete globalThis.caches; });

  test('sin la llave de Resend está apagada y no manda nada', async () => {
    const mandados = conResend();
    const cerrada = await desistir.onRequestGet({ env: {} });
    expect(cerrada.status).toBe(503);
    expect(await cerrada.json()).toEqual({ abierta: false });
    expect((await desistir.onRequestPost({ request: pedir(BIEN), env: {} })).status).toBe(503);
    const abierta = await desistir.onRequestGet({ env: env() });
    expect(abierta.status).toBe(200);
    expect(await abierta.json()).toEqual({ abierta: true });
    expect(mandados).toHaveLength(0);
  });

  test('solo desde la propia web, con un cuerpo pequeño y en JSON', async () => {
    const mandados = conResend();
    expect((await desistir.onRequestPost({ request: pedir(BIEN, { Origin: 'https://otra.web' }), env: env() })).status).toBe(403);
    expect((await desistir.onRequestPost({ request: pedir(BIEN, { 'Content-Length': '5000' }), env: env() })).status).toBe(413);
    expect((await desistir.onRequestPost({ request: pedir(Object.assign({}, BIEN, { relleno: 'x'.repeat(3000) })), env: env() })).status).toBe(413);
    expect((await desistir.onRequestPost({ request: pedir('esto no es JSON'), env: env() })).status).toBe(400);
    expect((await desistir.onRequestPost({ request: pedir(BIEN, { Origin: 'https://pacegrass.app' }), env: env() })).status).toBe(200);
    expect(mandados).toHaveLength(2);
  });

  test('sin nombre, con un correo que no lo es o un número raro, no manda nada', async () => {
    const mandados = conResend();
    for (const malo of [{ nombre: '' }, { nombre: '   ' }, { nombre: 'x'.repeat(121) }, { correo: 'lucia' }, { correo: 'lucia@correo' },
      { recibo: '<script>' }]) {
      const r = await desistir.onRequestPost({ request: pedir(Object.assign({}, BIEN, malo)), env: env() });
      expect(r.status).toBe(400);
      expect((await r.json()).motivo).toBe('formato');
    }
    expect(mandados).toHaveLength(0);
    /* El número del recibo puede faltar: sin él, Ez busca la compra por el correo. */
    expect((await desistir.onRequestPost({ request: pedir(Object.assign({}, BIEN, { recibo: '' })), env: env() })).status).toBe(200);
  });

  test('manda primero a Ez y luego el acuse, con lo dicho, la fecha y la hora', async () => {
    const mandados = conResend();
    const antes = Date.now();
    const r = await desistir.onRequestPost({ request: pedir(BIEN), env: env() });
    expect(r.status).toBe(200);
    const d = await r.json();
    expect(d.ok).toBe(true);
    expect(d.acuse).toBe(true);
    expect(d.referencia).toMatch(/^D-[0-9A-F]{8}$/);
    expect(Date.parse(d.fecha)).toBeGreaterThanOrEqual(antes - 1000);
    expect(d.fechaTexto).toMatch(/^\d{1,2} de \p{L}+ de 20\d\d,? (a las )?\d{1,2}:\d\d \(hora de Madrid\)$/u);

    expect(mandados).toHaveLength(2);
    const [aEz, alComprador] = mandados;
    for (const m of mandados) {
      expect(m.url).toBe('https://api.resend.com/emails');
      expect(m.auth).toBe('Bearer ' + CLAVE);
      expect(m.from).toBe('PACE <desistir@pacegrass.app>');
    }
    expect(aEz.to).toEqual(['hola.ezradesign@gmail.com']);
    expect(aEz.reply_to).toBe('lucia@correo.es');
    expect(aEz.subject).toBe('Desistimiento ' + d.referencia + ': Lucía Pérez');
    expect(aEz.text).toContain('· Número del recibo: 1653-2453');
    expect(aEz.text).toContain('· Plan: De por vida');
    expect(aEz.text).toContain('Devuelve el pago entero');

    expect(alComprador.to).toEqual(['lucia@correo.es']);
    expect(alComprador.reply_to).toBe('hola.ezradesign@gmail.com');
    expect(alComprador.subject).toBe('Hemos recibido tu desistimiento · PACE');
    expect(alComprador.text).toContain('Este correo es el acuse de recibo.');
    expect(alComprador.text).toContain('· Nombre: Lucía Pérez');
    expect(alComprador.text).toContain('· Correo de la compra: lucia@correo.es');
    expect(alComprador.text).toContain('· Fecha y hora: ' + d.fechaTexto);
    expect(alComprador.text).toContain('· Referencia: ' + d.referencia);
    expect(alComprador.text).toContain('como mucho en 14 días');
  });

  test('en inglés, el acuse en inglés; el aviso a Ez, en castellano', async () => {
    const mandados = conResend();
    const d = await (await desistir.onRequestPost({ request: pedir(Object.assign({}, BIEN, { idioma: 'en', recibo: '', plan: 'mes' })), env: env() })).json();
    expect(d.fechaTexto).toMatch(/\(Madrid time\)$/);
    expect(mandados[0].text).toContain('· Idioma: inglés');
    expect(mandados[0].text).toContain('· Plan: Al mes');
    expect(mandados[0].text).toContain('(hora de Madrid)');
    expect(mandados[1].subject).toBe('We have received your withdrawal · PACE');
    expect(mandados[1].text).toContain('· Receipt number: not given');
    expect(mandados[1].text).toContain('· Plan: Monthly');
    expect(mandados[1].text).toContain('within 14 days at the latest');
  });

  test('si el correo a Ez no sale, el desistimiento no ha llegado: 502 y sin acuse', async () => {
    for (const fallo of [[[0]], [null, [0]]]) {
      const mandados = conResend(...fallo);
      const r = await desistir.onRequestPost({ request: pedir(BIEN), env: env() });
      expect(r.status).toBe(502);
      expect((await r.json()).motivo).toBe('envio');
      expect(mandados).toHaveLength(1);
    }
  });

  test('si solo falla el acuse, el desistimiento ya está y la respuesta lo dice', async () => {
    for (const fallo of [[[1]], [null, [1]]]) {
      const mandados = conResend(...fallo);
      const r = await desistir.onRequestPost({ request: pedir(BIEN), env: env() });
      expect(r.status).toBe(200);
      const d = await r.json();
      expect(d.ok).toBe(true);
      expect(d.acuse).toBe(false);
      expect(mandados).toHaveLength(2);
    }
  });

  test('el nombre no mete saltos de línea en el asunto, y la trampa para robots no manda nada', async () => {
    let mandados = conResend();
    await desistir.onRequestPost({ request: pedir(Object.assign({}, BIEN, { nombre: 'Ana\r\nBcc: otro@correo.es' })), env: env() });
    expect(mandados[0].subject).not.toMatch(/[\r\n]/);
    expect(mandados[0].subject).toContain('Ana Bcc: otro@correo.es');
    mandados = conResend();
    const r = await desistir.onRequestPost({ request: pedir(Object.assign({}, BIEN, { web: 'https://robot.example' })), env: env() });
    expect(r.status).toBe(200);
    expect(mandados).toHaveLength(0);
  });

  test('cinco intentos por hora desde una conexión; el sexto espera, y no se guarda nada', async () => {
    conResend();
    const cache = new Map();
    globalThis.caches = { default: {
      match: async (req) => (cache.has(req.url) ? new Response(cache.get(req.url)) : undefined),
      put: async (req, res) => { cache.set(req.url, await res.text()); },
    } };
    const ip = { 'CF-Connecting-IP': '203.0.113.9' };
    for (let i = 0; i < 5; i++) expect((await desistir.onRequestPost({ request: pedir(BIEN, ip), env: env() })).status).toBe(200);
    const sexto = await desistir.onRequestPost({ request: pedir(BIEN, ip), env: env() });
    expect(sexto.status).toBe(429);
    expect(sexto.headers.get('Retry-After')).toBe('3600');
    expect([...cache.keys()].join(' ')).not.toContain('203.0.113.9');
    /* Ni almacén ni KV: lo que llega va a Resend y al buzón de Ez. */
    const fuente = fs.readFileSync(path.join(__dirname, '..', 'functions', 'api', 'desistir.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(fuente).not.toMatch(/\.put\(\s*[^c]/);
    expect(fuente).not.toMatch(/env\.(VENTAS|AVISAME)/);
  });
});
