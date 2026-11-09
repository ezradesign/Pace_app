/* Caza de lo nuevo (8 nov. 2026): alguien llega a PACE de cero el lunes 9 de noviembre y lo usa su
   primera semana, con clics de verdad sobre el `index.html` compilado y el reloj de la página
   (`page.clock`) para pasar los días. Lo que no es «A tu ritmo» ni la jornada: la bienvenida y los
   Ajustes, Respira (con la apnea y su aviso), Mueve, Estira, Hidrátate, «Tus rutinas» y el runner,
   logros, Estadísticas y «Qué te ayuda», copiar e importar los datos, el sonido y la voz, el modo
   oscuro y el cambio de idioma. Cada paso mide la pantalla (scroll, cortes, solapes y, en inglés,
   lo que quedó en español) y apunta los errores de la consola.
   Uso, desde la raíz y con el servidor ya arrancado:
     PACE_E2E_PORT=8891 RECORRIDO_FOTOS=<carpeta> node docs/traspaso/archivos/caza-nuevo-8nov/semana.js movil es
   Partes sueltas: un tercer argumento con los días a correr («1,2,5»). */
'use strict';
const fs = require('fs');
const path = require('path');
const L = require('../recorrido-6nov/lib');

const [tam = 'movil', lang = 'es', soloDias] = process.argv.slice(2);
const EN = lang === 'en';
const T = (es, en) => (EN ? en : es);
const D = (d, h, mi) => new Date(2026, 10, d, h, mi || 0);
const ARRIBA = '[data-pace-session-root], [data-pace-modal-backdrop], [role=dialog], [data-pace-tweaks-panel]';
const tagBase = 'nuevo-' + tam + '-' + lang;

const informe = { quien: tagBase, pasos: [] };
let page, ctx, errores;
let errVistos = 0;
const nota = (k, v) => { informe.pasos.push({ nota: k, v }); console.log('  ·', k, typeof v === 'string' ? v : JSON.stringify(v)); };

async function capas() { return page.evaluate((s) => [...document.querySelectorAll(s)].filter((e) => e.getBoundingClientRect().width > 0).length, ARRIBA); }
async function arriba() {
  return page.evaluate((s) => {
    const cs = [...document.querySelectorAll(s)].filter((e) => e.getBoundingClientRect().width > 0);
    const r = cs.length ? cs[cs.length - 1] : document.body;
    const bot = [...r.querySelectorAll('button, a, [role=button], [role=tab], [role=switch], input[type=checkbox], label')]
      .filter((x) => x.getBoundingClientRect().width > 0)
      .map((x) => ((x.getAttribute('aria-label') || '') + ' ' + x.textContent.trim().replace(/\s+/g, ' ')).trim().slice(0, 40));
    return { texto: r.innerText.replace(/\s+/g, ' ').trim().slice(0, 260), botones: [...new Set(bot)].slice(0, 30) };
  }, ARRIBA);
}

/* El botón visible de la capa de arriba (o de `dentro`) cuyo nombre casa con `rx`. */
async function pulsar(rx, dentro, espera) {
  const ok = await page.evaluate(([src, fl, sel]) => {
    const r = new RegExp(src, fl);
    const capas = [...document.querySelectorAll(sel)].filter((e) => e.getBoundingClientRect().width > 0);
    const raiz = capas.length ? capas[capas.length - 1] : document;
    const b = [...raiz.querySelectorAll('button, a, [role=button], [role=tab], [role=switch], [role=radio], label')].filter((x) => x.getBoundingClientRect().width > 0)
      .find((x) => r.test(((x.getAttribute('aria-label') || '') + ' ' + x.textContent.trim()).trim()));
    if (!b) return false;
    b.click();
    return true;
  }, [rx.source, rx.flags, dentro || ARRIBA]);
  if (!ok) { const a = await arriba(); throw new Error('no encuentro ' + rx + ' · hay: ' + a.botones.join(' | ')); }
  await page.waitForTimeout(espera || 700);
}

/* Un clic con el ratón de verdad (Playwright), para lo que reacciona a pointer y no a click(). */
async function tocar(loc) { await loc.first().click(); await page.waitForTimeout(600); }

async function medir(nombre) {
  const m = await L.medir(page, tagBase + '-' + nombre, { lang });
  const mal = {};
  if (m.scroll.doc.v > 1 || m.scroll.doc.h > 1) mal.scrollDoc = m.scroll.doc;
  const cajas = m.scroll.cajas.filter((c) => c.h > 1);
  if (cajas.length) mal.scrollH = cajas;
  if (m.cortados.length) mal.cortados = m.cortados.slice(0, 6);
  if (m.solapes.length) mal.solapes = m.solapes.slice(0, 6);
  if (m.sinTraducir && m.sinTraducir.length) mal.sinTraducir = m.sinTraducir.slice(0, 12);
  const nuevos = errores.slice(errVistos); errVistos = errores.length;
  if (nuevos.length) mal.errores = nuevos.slice(0, 6);
  informe.pasos.push({ paso: nombre, mal });
  console.log((Object.keys(mal).length ? '! ' : '  ') + nombre, Object.keys(mal).length ? JSON.stringify(mal).slice(0, 900) : '');
  return m;
}

async function aHome() {
  for (let i = 0; i < 5 && (await capas()); i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(450); }
}
async function tramo(nombre, fn) {
  try { await fn(); } catch (e) {
    informe.pasos.push({ error: nombre, e: e.message.split('\n')[0].slice(0, 600) });
    console.log('X ' + nombre + ': ' + e.message.split('\n')[0].slice(0, 600));
    await L.foto(page, tagBase + '-ERROR-' + nombre);
  }
  await aHome();
}
async function segundos(n) { for (let i = 0; i < n; i++) { await page.clock.runFor(1000); await page.waitForTimeout(6); } }
async function irA(fecha) {
  const ahora = await page.evaluate(() => Date.now());
  if (fecha.getTime() > ahora) await page.clock.fastForward(fecha.getTime() - ahora);
  await page.waitForTimeout(400);
}
/* Cerrar y volver a abrir la página otro día: lo que hace quien deja PACE cerrado por la noche. */
async function abrirElDia(fecha) {
  await page.goto('about:blank');
  await irA(fecha);
  await page.goto(L.BASE + '/index.html');
  await page.waitForSelector('[data-pace-dial-number], [data-pace-app-root]', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1200);
}
const estado = () => page.evaluate(() => {
  const s = getState();
  const hoy = (new Date(Date.now()).getDay() + 6) % 7;
  const w = s.weeklyStats || {};
  return {
    logros: Object.keys(s.achievements || {}).filter((k) => s.achievements[k] && s.achievements[k].unlockedAt).sort(),
    foco: s.totalFocusMin, racha: s.streak, agua: s.hydrate && s.hydrate.today, lang: s.lang, pal: s.palette, sonido: s.soundOn,
    respHoy: (w.breathMinutes || [])[hoy], cuerpoHoy: (w.moveMinutes || [])[hoy], estHoy: (w.extraMinutes || [])[hoy],
    custom: (s.customRoutines || []).length,
  };
});
const sesion = () => page.locator('[data-pace-session-root]');
const cierre = () => sesion().locator('[data-pace-session-done]');
async function hastaQueAcabe(max) {
  for (let i = 0; i < max && !(await cierre().count()); i += 5) await segundos(5);
  return !!(await cierre().count());
}

async function abrirModulo(es, en) { await pulsar(new RegExp('^\\s*' + T(es, en)), 'body'); }
async function tarjeta(id) {
  const ok = await page.evaluate((i) => {
    const vis = (x) => x.getBoundingClientRect().width > 0;
    const e = [...document.querySelectorAll('[data-pace-lib-card="' + i + '"] .pace-lib-hit')].find(vis)
      || [...document.querySelectorAll('[data-pace-lib-card="' + i + '"] button')].find(vis)
      || [...document.querySelectorAll('[data-pace-lib-card="' + i + '"]')].find(vis);
    if (!e) return false;
    e.click();
    return true;
  }, id);
  if (!ok) throw new Error('sin tarjeta ' + id + ' · hay: ' + (await page.evaluate(() => [...document.querySelectorAll('[data-pace-lib-card]')].filter((x) => x.getBoundingClientRect().width > 0).map((x) => x.getAttribute('data-pace-lib-card')).join(' '))));
  await page.waitForTimeout(900);
}
async function ajustes() {
  await page.locator('[data-pace-topbar-ajustes]').filter({ visible: true }).first().click();
  await page.waitForTimeout(700);
}

async function bienvenida(pre) {
  await page.locator('[role=dialog] [data-pace-cta]').waitFor({ timeout: 15000 });
  await page.locator('[role=dialog] [data-pace-cta]').click();
  await page.locator('[data-pace-semana-guardar]').waitFor();
  await page.locator('[data-pace-semana-guardar]').click();
  await page.locator('[data-pace-onb-comenzar]').waitFor();
  await page.locator('[data-pace-onb-comenzar]').click();
  await page.locator('[data-pace-visita]').waitFor({ timeout: 6000 }).catch(() => {});
  for (let i = 0; i < 8 && (await page.locator('[data-pace-visita]').count()); i++) {
    const sig = page.locator('[data-pace-visita-siguiente]');
    if (!(await sig.count())) break;
    await sig.click(); await page.waitForTimeout(500);
  }
  await page.waitForTimeout(600);
  await medir(pre + '-bienvenida-otra-vez');
}

const DIAS = {
  /* Lunes 9, 10:00: la primera vez, entera. */
  1: async () => {
    await tramo('bienvenida', async () => {
      await page.locator('[role=dialog] [data-pace-cta]').waitFor({ timeout: 15000 });
      await medir('1a-bienvenida');
      await page.locator('[role=dialog] [data-pace-cta]').click();
      await page.locator('[data-pace-semana-guardar]').waitFor();
      await page.waitForTimeout(400);
      await medir('1b-semana');
      await page.locator('[data-pace-semana-guardar]').click();
      await page.locator('[data-pace-onb-comenzar]').waitFor();
      await page.waitForTimeout(400);
      await medir('1c-completo');
      await page.locator('[data-pace-onb-comenzar]').click();
      await page.locator('[data-pace-visita]').waitFor({ timeout: 6000 });
      for (let i = 0; i < 8; i++) {
        await page.waitForTimeout(600);
        await medir('1d-visita' + i);
        const sig = page.locator('[data-pace-visita-siguiente]');
        if (!(await sig.count())) break;
        await sig.click();
        if (!(await page.locator('[data-pace-visita]').count())) break;
      }
      await page.waitForTimeout(800);
      await medir('1e-home');
      nota('estado tras la bienvenida', await estado());
    });
    await tramo('ajustes', async () => {
      await ajustes();
      await medir('1f-ajustes');
      nota('ajustes', await arriba());
      /* El oscuro, desde Ajustes. */
      await pulsar(new RegExp(T('Oscuro', 'Dark')), '[data-pace-tweaks-panel]');
      await medir('1g-ajustes-oscuro');
      await aHome();
      await medir('1h-home-oscuro');
      nota('paleta', await page.evaluate(() => [getState().palette, document.documentElement.getAttribute('data-theme'), getComputedStyle(document.body).backgroundColor]));
    });
    await tramo('respira-apnea', async () => {
      await abrirModulo('Respira', 'Breathe');
      await medir('1i-respira');
      await tarjeta('breathe.rounds.express');
      await medir('1j-apnea-aviso');
      nota('aviso apnea', await arriba());
      /* Sin marcar «Lo he leído», el botón no debería dejar empezar. */
      const empezar = page.locator('[role=dialog], [data-pace-modal-card]').filter({ visible: true }).last().getByRole('button', { name: new RegExp(T('Empezar sesión', 'Start session')) });
      nota('empezar sin leer: activo', await empezar.isEnabled().catch(() => 'sin botón'));
      await page.getByText(new RegExp(T('Lo he leído', 'I have read|I\'ve read'))).filter({ visible: true }).first().click();
      await page.waitForTimeout(300);
      nota('empezar tras leer: activo', await empezar.isEnabled().catch(() => 'sin botón'));
      await empezar.click();
      await page.waitForTimeout(700);
      await medir('1k-apnea-prep');
      await pulsar(new RegExp(T('Empezar ahora', 'Start now')), '[data-pace-session-root]');
      await segundos(15);
      await medir('1l-apnea-sesion');
      /* La retención espera a que pulses: a los 30 s de cada una, «Respirar de nuevo». */
      let ok = false;
      for (let i = 0; i < 160 && !ok; i++) {
        await segundos(5);
        ok = !!(await cierre().count());
        const suelta = sesion().getByRole('button', { name: new RegExp(T('Respirar de nuevo', 'Breathe again')) });
        if (!ok && (await suelta.count()) && (i % 6 === 5)) { await suelta.first().click(); nota('suelta la retención', i * 5 + 's'); }
      }
      nota('apnea entera', ok);
      await medir('1m-apnea-fin');
      nota('estado tras la apnea', await estado());
    });
    await tramo('respira-478-voz', async () => {
      await abrirModulo('Respira', 'Breathe');
      await tarjeta('breathe.478');
      await medir('1n-478-prep');
      nota('prep 478', await arriba());
      await pulsar(new RegExp(T('Empezar ahora', 'Start now')), '[data-pace-session-root]');
      await segundos(30);
      await medir('1o-478-sesion');
      const ok = await hastaQueAcabe(400);
      nota('478 entera', ok);
      await medir('1p-478-fin');
      nota('cierre 478', await arriba());
    });
    await tramo('agua', async () => {
      await abrirModulo('Hidrátate', 'Hydrate');
      await medir('1q-agua');
      for (let i = 0; i < 3; i++) await pulsar(new RegExp(T('Un vaso más|Añadir', 'One more glass|Add')), null, 400);
      await medir('1r-agua-3');
      nota('agua', await estado());
    });
    await tramo('logros-1', async () => {
      await pulsar(new RegExp(T('logros', 'achievements'), 'i'), 'body');
      await medir('1s-logros');
      nota('logros', (await arriba()).texto);
    });
  },

  /* Martes 10, 11:00: Mueve y Estira con el runner, y las estadísticas. */
  2: async () => {
    await abrirElDia(D(10, 11, 0));
    await medir('2a-home');
    nota('estado martes', await estado());
    for (const [nombre, es, en, id] of [['mueve', 'Mueve', 'Move', 'extra.chair.squats'], ['estira', 'Estira', 'Stretch', 'move.neck.3']]) {
      await tramo(nombre, async () => {
        await abrirModulo(es, en);
        await medir('2b-' + nombre + '-biblio');
        await tarjeta(id);
        await medir('2c-' + nombre + '-preview');
        await pulsar(new RegExp(T('^\\s*Empezar', '^\\s*Start')), '[data-pace-modal-card], [data-pace-session-root], [role=dialog]');
        await page.waitForTimeout(800);
        await medir('2d-' + nombre + '-prep');
        await segundos(20);
        await medir('2e-' + nombre + '-runner');
        const ok = await hastaQueAcabe(900);
        nota(nombre + ' entera', ok);
        await medir('2f-' + nombre + '-fin');
        nota(nombre + ' cierre', await arriba());
      });
    }
    await tramo('stats-2', async () => {
      await pulsar(new RegExp(T('estadísticas', 'statistics|stats'), 'i'), 'body');
      for (const t of ['today', 'week', 'month', 'year', 'ayuda']) {
        const b = page.locator('[data-pace-stats-tab="' + t + '"]').filter({ visible: true });
        if (await b.count()) { await b.first().click(); await page.waitForTimeout(700); await medir('2g-stats-' + t); if (t === 'ayuda' || t === 'today') nota('stats ' + t, (await arriba()).texto); }
      }
    });
    nota('estado tras el martes', await estado());
  },

  /* Miércoles 11, 12:00: «Tus rutinas», una nueva, y empezarla. */
  3: async () => {
    await abrirElDia(D(11, 12, 0));
    if (await page.locator('[role=dialog] [data-pace-cta]').filter({ visible: true }).count()) await bienvenida('3');
    await medir('3a-home');
    await tramo('rutinas', async () => {
      if (!(await page.getByRole('button', { name: new RegExp(T('Tus rutinas', 'Your routines')) }).filter({ visible: true }).count())) {
        await pulsar(new RegExp(T('Abrir panel', 'Open panel')), 'body');
        await medir('3a2-panel');
      }
      await pulsar(new RegExp(T('Tus rutinas', 'Your routines')), 'body');
      await medir('3b-rutinas');
      nota('rutinas', await arriba());
      /* Sin rutinas, «Tus rutinas» abre ya el constructor. */
      if (!(await page.getByRole('button', { name: new RegExp(T('Añadir ejercicio', 'Add exercise')) }).filter({ visible: true }).count())) await pulsar(new RegExp(T('Crear|Nueva', 'Create|New')));
      await medir('3c-crear');
      nota('constructor', await arriba());
      await page.locator('[role=dialog] input[type=text], [data-pace-modal-card] input').filter({ visible: true }).first().fill(T('Mi pausa de la tarde', 'My afternoon break'));
      await pulsar(new RegExp(T('Añadir ejercicio', 'Add exercise')));
      await medir('3d-elegir');
      for (let i = 0; i < 3; i++) {
        /* Tres ejercicios del selector, uno de cada cuatro (la fila dice sus segundos). */
        await page.getByRole('button', { name: /\d+\s*s\b/ }).filter({ visible: true }).nth(i * 4).click();
        await page.waitForTimeout(300);
      }
      await medir('3e-elegidos');
      await pulsar(new RegExp(T('Volver', 'Back')));
      await medir('3f-editor');
      nota('editor', await arriba());
      await pulsar(new RegExp(T('^\\s*Guardar', '^\\s*Save')));
      await medir('3g-guardada');
      nota('tras guardar', await arriba());
      /* Al guardar la primera, PACE vuelve al inicio: la rutina vive en la biblioteca de Mueve. */
      if (!(await page.locator('[data-pace-custom-empezar]').filter({ visible: true }).count())) {
        /* Lo que haría quien la busca: el mismo «Tus rutinas» del panel por el que entró. */
        await aHome();
        if (!(await page.getByRole('button', { name: new RegExp(T('Tus rutinas', 'Your routines')) }).filter({ visible: true }).count())) await pulsar(new RegExp(T('Abrir panel', 'Open panel')), 'body');
        await pulsar(new RegExp(T('Tus rutinas', 'Your routines')), 'body');
        await medir('3g2-tus-rutinas-otra-vez');
        nota('tras «Tus rutinas» con una: empezar visibles', await page.locator('[data-pace-custom-empezar]').filter({ visible: true }).count());
        if (!(await page.locator('[data-pace-custom-empezar]').filter({ visible: true }).count())) { await pulsar(new RegExp(T('Tus rutinas', 'Your routines'))); await medir('3g3-vista-rutinas'); }
      }
      const emp = page.locator('[data-pace-custom-empezar]').filter({ visible: true });
      nota('botones empezar', await emp.count());
      await emp.first().click();
      await page.waitForTimeout(900);
      await medir('3h-custom-prep');
      nota('custom prep', await arriba());
      if (!(await sesion().count())) await pulsar(new RegExp(T('^\\s*Empezar', '^\\s*Start')));
      await segundos(20);
      await medir('3i-custom-runner');
      const ok = await hastaQueAcabe(600);
      nota('custom entera', ok);
      await medir('3j-custom-fin');
      nota('custom cierre', await arriba());
    });
    nota('estado miércoles', await estado());
  },

  /* Jueves 12, 9:30: el otro idioma un rato, y de vuelta. */
  4: async () => {
    await abrirElDia(D(12, 9, 30));
    await tramo('idioma', async () => {
      await ajustes();
      await pulsar(new RegExp(EN ? 'Español|Spanish' : 'English|Inglés'), '[data-pace-tweaks-panel]');
      await page.waitForTimeout(600);
      await medir('4a-ajustes-otro-idioma');
      await aHome();
      await medir('4b-home-otro-idioma');
      nota('idioma', await page.evaluate(() => [getState().lang, document.documentElement.lang, document.title]));
      await ajustes();
      await pulsar(new RegExp(EN ? 'English|Inglés' : 'Español|Spanish'), '[data-pace-tweaks-panel]');
      await aHome();
      await medir('4c-home-vuelta');
      nota('idioma vuelta', await page.evaluate(() => [getState().lang, document.documentElement.lang, document.title]));
    });
  },

  /* Viernes 13, 18:00: copiar los datos, borrarlo todo y traer la copia. */
  5: async () => {
    await abrirElDia(D(13, 18, 0));
    const antes = await estado();
    nota('antes de copiar', antes);
    await tramo('datos', async () => {
      await ajustes();
      const plegada = page.locator('[data-pace-aj-plegada] .pace-aj-sec-accion');
      if (await plegada.isVisible().catch(() => false)) { await plegada.click(); await page.waitForTimeout(600); }
      await medir('5a-datos');
      nota('datos', await arriba());
      const [desc] = await Promise.all([
        page.waitForEvent('download', { timeout: 8000 }),
        pulsar(new RegExp(T('Copiar|Exportar|Descargar', 'Copy|Export|Download')), '[data-pace-tweaks-panel]'),
      ]);
      const f = path.join(L.FOTOS, tagBase + '-copia.json');
      await desc.saveAs(f);
      const j = JSON.parse(fs.readFileSync(f, 'utf8'));
      nota('copia', { nombre: desc.suggestedFilename(), logros: Object.keys(j.state.achievements || {}).length, eventos: (j.events && j.events.events || []).length, foco: j.state.totalFocusMin });
      await medir('5b-copiada');
      await pulsar(new RegExp(T('Borrar', 'Delete|Erase')), '[data-pace-tweaks-panel]');
      await medir('5c-borrar-aviso');
      nota('aviso borrar', await arriba());
      await pulsar(new RegExp(T('^\\s*Sí|Borrar', '^\\s*Yes|Delete|Erase')));
      await page.waitForTimeout(2500);
      await page.waitForSelector('[data-pace-dial-number], [role=dialog]', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(800);
      await medir('5d-tras-borrar');
      nota('tras borrar', await arriba());
      nota('estado tras borrar', await estado().catch((e) => e.message));
      /* Quien borra y quiere su copia vuelve a pasar la bienvenida. */
      await bienvenida('5d');
      await ajustes();
      if (await plegada.isVisible().catch(() => false)) { await plegada.click(); await page.waitForTimeout(600); }
      const input = page.locator('[data-pace-tweaks-panel] input[type=file]');
      await input.setInputFiles(f);
      await page.waitForTimeout(800);
      await medir('5e-importar-aviso');
      nota('aviso importar', await arriba());
      await pulsar(new RegExp(T('^\\s*Sí|Importar|Traer|Usar', '^\\s*Yes|Import|Use|Restore')));
      await page.waitForTimeout(2500);
      await page.waitForSelector('[data-pace-dial-number]', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(800);
      await medir('5f-tras-importar');
      const despues = await estado();
      nota('tras importar', despues);
      nota('importado igual', JSON.stringify(antes) === JSON.stringify(despues));
    });
  },

  /* Domingo 15, 20:00: mirar la semana. */
  6: async () => {
    await abrirElDia(D(15, 20, 0));
    await medir('6a-home');
    await tramo('logros-7', async () => {
      await pulsar(new RegExp(T('logros', 'achievements'), 'i'), 'body');
      await medir('6b-logros');
    });
    await tramo('stats-7', async () => {
      await pulsar(new RegExp(T('estadísticas', 'statistics|stats'), 'i'), 'body');
      for (const t of ['today', 'week', 'month', 'year', 'ayuda']) {
        const b = page.locator('[data-pace-stats-tab="' + t + '"]').filter({ visible: true });
        if (await b.count()) { await b.first().click(); await page.waitForTimeout(700); await medir('6c-stats-' + t); if (t !== 'year' && t !== 'month') nota('stats7 ' + t, (await arriba()).texto); }
      }
    });
    nota('estado domingo', await estado());
  },
};

(async () => {
  await L.lanzar();
  ({ ctx, page, errores } = await L.abrir({ tam, lang, estado: null, reloj: D(9, 10, 0), espera: 1500 }));
  const corre = soloDias ? soloDias.split(',').map(Number) : [1, 2, 3, 4, 5, 6];
  for (const d of corre) {
    console.log('— día ' + d);
    try { await DIAS[d](); } catch (e) { informe.pasos.push({ error: 'dia ' + d, e: e.message.split('\n')[0] }); console.log('X día ' + d + ': ' + e.message.split('\n')[0]); }
  }
  informe.errores = errores;
  fs.writeFileSync(path.join(L.FOTOS, tagBase + '.json'), JSON.stringify(informe, null, 1));
  console.log('errores de consola:', errores.length, JSON.stringify(errores.slice(0, 8)));
  await ctx.close();
  await L.cerrar();
})();
