// Pinta las propuestas SOBRE la app (nada se monta): abre la web, llega a la pantalla y cambia el DOM en la página.
const path = require('path');
const fs = require('fs');
const WT = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/.claude/worktrees/auditoria-fable-9nov-8401fc';
const { chromium } = require(path.join(WT, 'node_modules', 'playwright'));
const SALIDA = path.join(WT, 'docs', 'audits', 'fable-9nov', 'fotos');
fs.mkdirSync(SALIDA, { recursive: true });
const AQUI = __dirname;
const solo = process.argv[2] || '';

async function abrir({ movil = true, hora = '2026-11-10T09:05:00', almacen = 'p1-estado.json', v1 = false, tienda = false } = {}) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: movil ? { width: 360, height: 740 } : { width: 1280, height: 720 }, isMobile: movil, hasTouch: movil,
    deviceScaleFactor: movil ? 2 : 1, locale: 'es-ES', serviceWorkers: 'block', storageState: almacen ? path.join(AQUI, almacen) : undefined,
  });
  if (v1) await context.addInitScript(() => { Object.defineProperty(window, 'PREMIUM_ABIERTO_HASTA_V1', { configurable: true, get: () => false, set: () => {} }); });
  if (tienda) await context.addInitScript(() => { window.addEventListener('DOMContentLoaded', () => { try { window.PACE_TIENDA_WEB.enlaces.vida = 'https://example.invalid/vida'; } catch (e) {} }); });
  const page = await context.newPage();
  await page.clock.install({ time: new Date(hora) });
  await page.goto('http://localhost:8920/index.html');
  await page.waitForTimeout(500); await page.clock.runFor(1500);
  return { browser, page };
}
const foto = async (page, nombre) => { await page.clock.runFor(900); await page.waitForTimeout(300); await page.screenshot({ path: path.join(SALIDA, nombre + '.jpg'), type: 'jpeg', quality: 80 }); console.log('foto ' + nombre); };
const toca = async (page, nombre, dentro) => {
  const base = dentro ? page.locator(dentro).last() : page;
  await base.getByRole('button', { name: nombre, exact: typeof nombre === 'string' }).filter({ visible: true }).first().click({ timeout: 4000 });
  await page.clock.runFor(800);
};
const finBloque = async (page) => {
  const fin = await page.evaluate(() => JSON.parse(localStorage.getItem('pace.timer.v1')).endsAt);
  await page.clock.fastForward(fin - await page.evaluate(() => Date.now()) + 1000); await page.waitForTimeout(300); await page.clock.runFor(1500);
};
const hastaElCierre = async (page) => {
  for (let i = 0; i < 40; i++) {
    if (await page.locator('[data-pace-session-done]').count()) return true;
    await page.clock.runFor(10000);
  }
  return false;
};
// El cierre de una sesión que venía de la pausa: el botón dice lo que sigue en el Foco, y debajo queda la salida de siempre.
const pintaCierre = (page, cfg) => page.evaluate((cfg) => {
  const raiz = document.querySelector('[data-pace-session-root]');
  const b = [...raiz.querySelectorAll('button')].find((x) => /Volver al inicio/.test(x.innerText));
  const hoja = [...b.querySelectorAll('*')].find((e) => e.children.length === 0 && /Volver al inicio/.test(e.textContent)) || b;
  hoja.textContent = cfg.principal;
  const ref = [...raiz.querySelectorAll('button')].find((x) => x.innerText.trim() === 'Ahora no');
  const cs = getComputedStyle(ref || b);
  const l = document.createElement('span');
  l.textContent = cfg.segunda;
  l.style.cssText = 'display:block;margin:8px auto 0;background:none;border:none;outline:0;box-shadow:none;border-radius:0;appearance:none;-webkit-appearance:none;padding:6px 10px;font-family:' + cs.fontFamily + ';font-style:' + cs.fontStyle + ';font-size:' + cs.fontSize + ';color:' + cs.color + ';text-decoration:underline;text-underline-offset:3px;cursor:pointer;';
  const caja = document.createElement('div');
  caja.style.cssText = 'display:flex;flex-direction:column;align-items:center;';
  b.parentElement.insertBefore(caja, b); caja.appendChild(b); caja.appendChild(l);
  if (cfg.sube) caja.style.transform = 'translateY(-' + cfg.sube + 'px)';
  return { boton: Math.round(b.getBoundingClientRect().bottom), enlace: Math.round(l.getBoundingClientRect().bottom), alto: innerHeight };
}, cfg);

const tareas = {
  // 1 · El cierre, por libre, en el móvil.
  async cierre360() {
    const { browser, page } = await abrir({});
    await toca(page, 'Empezar foco'); await finBloque(page);
    await page.locator('[data-pace-break-prop] button').first().click(); await page.clock.runFor(800);
    await toca(page, 'Empezar'); await hastaElCierre(page);
    await foto(page, 'cierre-hoy-360');
    console.log(JSON.stringify(await pintaCierre(page, { principal: 'Empezar el ciclo 2', segunda: 'Volver al inicio', sube: 30 })));
    await foto(page, 'cierre-A-360');
    await browser.close();
  },
  // 1 · El cierre, con jornada, en el portátil.
  async cierre1280() {
    const { browser, page } = await abrir({ movil: false });
    await toca(page, /^Jornada entera/); await toca(page, 'Empezar jornada'); await finBloque(page);
    await toca(page, 'Hacer la pausa', '[role=dialog]'); await toca(page, 'Empezar', '[role=dialog]'); await hastaElCierre(page);
    await foto(page, 'cierre-hoy-1280');
    console.log(JSON.stringify(await pintaCierre(page, { principal: 'Volver · te quedan 3 min de pausa', segunda: 'Empezar ya el bloque 2', sube: 0 })));
    await foto(page, 'cierre-A-1280');
    await browser.close();
  },
  // 2 · Ajustes con la tienda abierta: una fila para comprar.
  async ajustes360() {
    const { browser, page } = await abrir({ tienda: true });
    await toca(page, 'Abrir ajustes'); await toca(page, /^Copias/);
    await foto(page, 'ajustes-hoy-360');
    console.log(await page.evaluate(() => {
      const fila = [...document.querySelectorAll('.pace-aj-accion')].find((b) => /Introducir código/.test(b.innerText));
      if (!fila) return 'sin fila';
      const n = fila.cloneNode(true);
      const hojas = [...n.querySelectorAll('*')].filter((e) => e.children.length === 0 && e.textContent.trim());
      hojas[0].textContent = 'Tenerlo para siempre';
      hojas[hojas.length - 1].textContent = '19,99 €';
      fila.parentElement.insertBefore(n, fila);
      const h2 = [...fila.querySelectorAll('*')].filter((e) => e.children.length === 0 && e.textContent.trim());
      h2[0].textContent = 'Tengo un código';
      return fila.outerHTML.replace(/style="[^"]*"/g, '').slice(0, 300);
    }));
    await foto(page, 'ajustes-A-360');
    await browser.close();
  },
  // 3 · La bienvenida sin «v1».
  async bienvenida360() {
    const { browser, page } = await abrir({ almacen: null, hora: '2026-11-10T09:00:00' });
    await toca(page, 'Comenzar'); await toca(page, 'Continuar');
    await page.clock.runFor(4000); await page.waitForTimeout(1500);
    await foto(page, 'bienvenida-hoy-360');
    await page.evaluate(() => {
      const cambia = { 'Y hasta v1, PACE completo también está abierto para todos:': 'Y mientras está en pruebas, PACE completo también está abierto para todos:',
        'Al llegar v1 tendrás tu semana de prueba, y las rutinas que ya hayas hecho se te quedan.': 'Cuando salga a la venta tendrás tu semana de prueba, y las rutinas que ya hayas hecho se te quedan.' };
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n = w.nextNode(); n; n = w.nextNode()) { const t = n.nodeValue.trim(); if (cambia[t]) n.nodeValue = cambia[t]; }
    });
    await foto(page, 'bienvenida-A-360');
    await browser.close();
  },
  // 4 · Desde v1, sin PACE completo: dónde se entera alguien de que su semana podría cambiar.
  async semana(movil) {
    const { browser, page } = await abrir({ movil, v1: true, almacen: 'v1-estado.json', hora: '2026-11-23T09:05:00' });
    if (movil) { await toca(page, 'Preparar jornada'); await toca(page, 'Preparar jornada'); }
    else { await toca(page, /^Jornada entera/); }
    const sufijo = movil ? '360' : '1280';
    await foto(page, 'semana-hoy-' + sufijo);
    console.log(await page.evaluate((movil) => {
      const hojas = [...document.querySelectorAll('*')].filter((e) => e.children.length === 0 && e.getBoundingClientRect().width > 0);
      const texto = 'Los lunes, PACE completo te escribe tu semana ›';
      const l = document.createElement('button'); l.type = 'button'; l.textContent = texto;
      if (movil) {
        const ver = hojas.filter((e) => /^Ver todo$/.test(e.textContent.trim())).pop();
        if (!ver) return 'sin Ver todo';
        let tarjeta = ver; while (tarjeta.parentElement && !/Jornada entera|Hoy, como/.test(tarjeta.innerText)) tarjeta = tarjeta.parentElement;
        l.style.cssText = 'display:block;width:100%;background:none;border:none;outline:0;appearance:none;-webkit-appearance:none;border-top:1px solid var(--line);margin:12px 0 0;padding:10px 0 0;text-align:left;font-family:var(--font-display);font-style:italic;font-size:15px;color:var(--ink-2);cursor:pointer;';
        tarjeta.appendChild(l);
        return 'móvil: línea al pie de la tarjeta · fondo ' + Math.round(tarjeta.getBoundingClientRect().bottom) + ' de ' + innerHeight;
      }
      const hoja = hojas.filter((e) => /Sin material|pared o mesa/.test(e.textContent || '')).pop();
      if (!hoja) return 'sin línea de material';
      const cs = getComputedStyle(hoja);
      l.style.cssText = 'display:block;background:none;border:none;outline:0;appearance:none;-webkit-appearance:none;padding:6px 0 0;margin:0;text-align:left;font-family:var(--font-display);font-style:italic;font-size:15px;color:var(--ink-2);cursor:pointer;';
      (hoja.parentElement).insertAdjacentElement('afterend', l);
      return 'portátil: línea tras «' + hoja.textContent.trim().slice(0, 40) + '»';
    }, movil));
    await foto(page, 'semana-A-' + sufijo);
    await browser.close();
  },
};
(async () => {
  const lista = solo ? solo.split(',') : ['cierre360', 'cierre1280', 'ajustes360', 'bienvenida360', 'semana360', 'semana1280'];
  for (const t of lista) {
    try {
      console.log('--- ' + t);
      if (t === 'semana360') await tareas.semana(true); else if (t === 'semana1280') await tareas.semana(false); else await tareas[t]();
    } catch (e) { console.log('FALLO ' + t + ': ' + String(e).split('\n')[0].slice(0, 200)); }
  }
  process.exit(0);
})();
