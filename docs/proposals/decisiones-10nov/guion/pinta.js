// Pinta D-2, D-3, D-6 y D-7 SOBRE la app (nada se monta): llega a la pantalla de verdad y cambia el DOM
// solo en la página. Uso: PUERTO=8940 node pinta.js [tarea,tarea…]   (sin nada, todas).
// Cada tarea corre en móvil (360×740) y en ordenador (1536×710). Las medidas salen por consola.
const L = require('./lib');
const solo = process.argv[2] || '';

const LUNES = '2026-11-23T09:05:00';
// Desde v1, con la semana de prueba ya acabada: quien NO tiene PACE completo.
const SIN = Object.assign({}, L.SEMILLA, { pasoV1: { at: new Date('2026-11-09T09:00:00').getTime(), previo: true, hasta: new Date('2026-11-16T09:00:00').getTime(), rutinas: [], avisado: true } });
const suf = (movil) => (movil ? '360' : '1536');

// Una línea como las de la app: serif itálica, tinta suave, con su flecha. Se toca y abriría la invitación.
const LINEA = 'display:block;width:100%;background:none;border:none;outline:0;appearance:none;-webkit-appearance:none;margin:0;padding:10px 0 0;text-align:left;font-family:var(--font-display);font-style:italic;font-size:15px;line-height:1.35;color:var(--ink-2);cursor:pointer;';

async function prepararJornada(page) {
  if (await page.getByRole('button', { name: 'Preparar jornada', exact: true }).filter({ visible: true }).count()) await L.toca(page, 'Preparar jornada');
  await L.toca(page, /^Jornada entera/);
}

const tareas = {
  // D-2 · La bienvenida. A: hoy (bienvenida, semana, PACE completo). B: bienvenida y semana; PACE completo tras la primera pausa.
  async d2(movil) {
    const s = suf(movil);
    {
      const { browser, page } = await L.abrir({ movil, estado: null, hora: '2026-11-10T09:00:00' });
      await L.foto(page, 'd2-hoy-1-bienvenida-' + s);
      await L.toca(page, 'Comenzar');
      await L.foto(page, 'd2-hoy-2-semana-' + s);
      await L.toca(page, 'Continuar');
      await L.foto(page, 'd2-hoy-3-completo-' + s);
      // B, la misma pantalla al acabar la primera pausa: una frase arriba y lo demás igual.
      const m = await page.evaluate(() => {
        const h = [...document.querySelectorAll('[role=dialog] h2')].pop();
        const p = document.createElement('p');
        p.textContent = 'Tu primera pausa, hecha.';
        p.style.cssText = 'margin:0 0 6px;font-family:var(--font-display);font-style:italic;font-size:17px;color:var(--ink-2);';
        h.parentElement.insertBefore(p, h);
        const b = [...document.querySelectorAll('[role=dialog] button')].filter((x) => x.getBoundingClientRect().height > 0).pop();
        const r = b.getBoundingClientRect();
        const col = h.closest('[data-pace-reveal]') || h.parentElement;
        return { ultimoBoton: Math.round(r.bottom), alto: innerHeight, scroll: col.scrollHeight > col.clientHeight + 1 };
      });
      console.log('d2 B completo ' + s + ' ' + JSON.stringify(m));
      await L.foto(page, 'd2-B-3-completo-tras-pausa-' + s);
      await browser.close();
    }
    {
      const { browser, page } = await L.abrir({ movil, estado: null, hora: '2026-11-10T09:00:00' });
      await page.evaluate(() => { window.paceBienvenidaCompleto = () => null; });
      await L.toca(page, 'Comenzar');
      await L.foto(page, 'd2-B-1-semana-' + s);
      console.log('d2 B semana ' + s + ': ' + await L.botones(page, 60));
      await browser.close();
    }
  },

  // D-3 · La línea de los lunes, en el móvil dentro de «Ver todo» (en la home no cabe), y C para quien lo tiene.
  async d3(movil) {
    const s = suf(movil);
    for (const variante of ['B', 'C']) {
      const tiene = variante === 'C';
      const { browser, page } = await L.abrir({ movil, v1: !tiene, hora: LUNES, estado: tiene ? L.SEMILLA : SIN });
      await prepararJornada(page);
      if (variante === 'B') await L.foto(page, 'd3-hoy-home-' + s);
      if (movil) await L.toca(page, 'Ver todo');
      if (movil && variante === 'B') await L.foto(page, 'd3-hoy-vertodo-' + s);
      const m = await page.evaluate(([texto, estilo, movil]) => {
        const hojas = [...document.querySelectorAll('*')].filter((e) => e.children.length === 0 && e.getBoundingClientRect().width > 0 && /de foco · \d+ pausas/.test(e.textContent));
        const ref = movil ? hojas.find((e) => e.closest('[data-pace-modal-backdrop]')) : hojas[0];
        if (!ref) return 'sin la línea del resumen';
        const debajo = (n) => { let x = n; while (x && x.nextElementSibling == null) x = x.parentElement; return x && x.nextElementSibling; };
        const sig = debajo(ref);
        const antes = sig ? Math.round(sig.getBoundingClientRect().top) : null;
        const l = document.createElement('button'); l.type = 'button'; l.textContent = texto; l.style.cssText = estilo;
        ref.insertAdjacentElement('afterend', l);
        const lb = l.getBoundingClientRect();
        return { linea: [Math.round(lb.top), Math.round(lb.bottom)], loDeDebajoBaja: sig ? Math.round(sig.getBoundingClientRect().top) - antes : null, alto: innerHeight,
          scrollPagina: document.scrollingElement.scrollHeight - innerHeight };
      }, [tiene ? 'Esta semana, más caderas: el martes te tocaron poco.' : 'Los lunes, PACE completo te escribe tu semana ›', LINEA, movil]);
      console.log('d3 ' + variante + ' ' + s + ' ' + JSON.stringify(m));
      await L.foto(page, 'd3-' + variante + '-' + (movil ? 'vertodo-' : 'home-') + s);
      await browser.close();
    }
  },

  // D-6 · Los logros de trasnochar. Hoy (marcados con un trazo para encontrarlos), B sin ellos, C con uno de cerrar a su hora.
  async d6(movil) {
    const s = suf(movil);
    for (const variante of ['hoy', 'B', 'C']) {
      const { browser, page } = await L.abrir({ movil, hora: '2026-11-10T09:00:00' });
      await L.toca(page, 'Ver logros');
      const m = await page.evaluate(([variante, movil]) => {
        const ocaso = document.querySelector('[data-pace-ach="master.dusk"]');
        const buho = document.querySelector('[data-pace-ach="secret.night.owl"]');
        const cuenta = (tile, menos) => { const c = tile.closest('[data-pace-ach-cat]').querySelector('.pace-meta'); const [a, b] = c.textContent.split('/').map((x) => parseInt(x, 10)); c.textContent = a + ' / ' + (b - menos); };
        if (variante === 'hoy') { for (const t of [ocaso, buho]) { t.style.outline = '2px solid var(--terra, #a85f3f)'; t.style.outlineOffset = '4px'; t.style.borderRadius = '10px'; } }
        if (variante === 'B') { cuenta(ocaso, 1); cuenta(buho, 1); ocaso.remove(); buho.remove(); }
        if (variante === 'C') {
          cuenta(buho, 1); buho.remove();
          const hojas = [...ocaso.querySelectorAll('div')].filter((e) => e.children.length === 0 && e.textContent.trim());
          hojas[0].textContent = 'A su hora'; hojas[1].textContent = 'Cinco jornadas cerradas a su hora';
          ocaso.title = 'Cinco jornadas cerradas a su hora';
          ocaso.style.outline = '2px solid var(--focus, #4f5e49)'; ocaso.style.outlineOffset = '4px'; ocaso.style.borderRadius = '10px';
        }
        const ancla = document.querySelector('[data-pace-ach-cat="jornada"] h3');
        ancla.scrollIntoView({ block: 'start' });
        const caja = ancla.closest('[data-pace-ach-cat]').parentElement;
        let sc = ancla.parentElement; while (sc && sc.scrollHeight <= sc.clientHeight + 1) sc = sc.parentElement;
        if (sc) sc.scrollTop -= movil ? 24 : 60;
        const r = (e) => e && e.isConnected ? Math.round(e.getBoundingClientRect().top) + '-' + Math.round(e.getBoundingClientRect().bottom) : 'fuera';
        return { ocaso: r(ocaso), buho: r(buho), alto: innerHeight };
      }, [variante, movil]);
      console.log('d6 ' + variante + ' ' + s + ' ' + JSON.stringify(m));
      await L.foto(page, 'd6-' + variante + '-' + s);
      await browser.close();
    }
  },

  // D-7 · Ofrecer PACE completo. Desde v1, sin tenerlo. B: una línea tras un «Sí» a «¿Te ayudó?».
  // C: una línea en la tarjeta de la jornada cerrada. A (hoy) es lo mismo sin la línea.
  async d7(movil) {
    const s = suf(movil);
    {
      const { browser, page } = await L.abrir({ movil, v1: true, hora: LUNES, estado: SIN });
      await prepararJornada(page);
      await L.toca(page, 'Empezar jornada');
      await L.finBloque(page);
      await L.toca(page, 'Hacer la pausa', '[data-pace-modal-backdrop]');
      await L.toca(page, 'Empezar', '[data-pace-modal-backdrop]');
      const ok = await L.hastaElCierre(page);
      if (!ok) console.log('  (no llegó al cierre) ' + await L.botones(page));
      await L.toca(page, 'Sí', '[data-pace-session-feedback]');
      await L.foto(page, 'd7-hoy-si-' + s);
      const m = await page.evaluate((estilo) => {
        const fb = document.querySelector('[data-pace-session-feedback]');
        const raiz = document.querySelector('[data-pace-session-root]') || document.body;
        const bajo = [...raiz.querySelectorAll('button')].filter((b) => b.getBoundingClientRect().top > fb.getBoundingClientRect().bottom - 1 && b.getBoundingClientRect().height > 0);
        const antes = bajo.map((b) => Math.round(b.getBoundingClientRect().bottom));
        const l = document.createElement('button'); l.type = 'button';
        l.textContent = 'Lo que te ayuda guía tu semana con PACE completo ›';
        l.style.cssText = estilo + 'text-align:center;font-size:14px;padding:6px 0 0;';
        fb.appendChild(l);
        const lb = l.getBoundingClientRect();
        const despues = bajo.map((b) => Math.round(b.getBoundingClientRect().bottom));
        return { linea: [Math.round(lb.top), Math.round(lb.bottom)], botonesDeDebajo: { antes, despues }, alto: innerHeight };
      }, LINEA);
      console.log('d7 B ' + s + ' ' + JSON.stringify(m));
      await L.foto(page, 'd7-B-si-' + s);
      await browser.close();
    }
    {
      const { browser, page } = await L.abrir({ movil, v1: true, hora: LUNES, estado: SIN });
      await prepararJornada(page);
      await L.toca(page, 'Empezar jornada');
      await L.hastaLas(page, '2026-11-23T17:40:00');
      for (const b of ['Ahora no', 'Cerrar']) { try { await L.toca(page, b, '[data-pace-modal-backdrop]'); } catch (e) {} }
      await L.foto(page, 'd7-hoy-cierre-' + s);
      const m = await page.evaluate((estilo) => {
        const tarjeta = [...document.querySelectorAll('[data-pace-ritmo-estado="hecho"]')].find((e) => e.getBoundingClientRect().height > 0);
        if (!tarjeta) return 'sin tarjeta de jornada cerrada';
        const sub = tarjeta.querySelector('.pace-rt-sub') || tarjeta;
        const caja = tarjeta.getBoundingClientRect();
        const l = document.createElement('button'); l.type = 'button';
        l.textContent = 'La semana que viene, a tu medida con PACE completo ›';
        // Al pie de la tarjeta y a todo lo ancho: en el móvil, junto al título, partía la línea en tres.
        l.style.cssText = estilo + 'font-size:14px;margin-top:10px;padding:8px 0 0;border-top:1px solid var(--line);';
        if (innerWidth < 700) tarjeta.appendChild(l); else sub.insertAdjacentElement('afterend', l);
        const lb = l.getBoundingClientRect(); const c2 = tarjeta.getBoundingClientRect();
        return { linea: [Math.round(lb.top), Math.round(lb.bottom)], tarjeta: { antes: Math.round(caja.bottom), despues: Math.round(c2.bottom) }, alto: innerHeight,
          scrollPagina: document.scrollingElement.scrollHeight - innerHeight };
      }, LINEA);
      console.log('d7 C ' + s + ' ' + JSON.stringify(m));
      await L.foto(page, 'd7-C-cierre-' + s);
      await browser.close();
    }
  },
};

(async () => {
  const lista = solo ? solo.split(',') : Object.keys(tareas);
  for (const t of lista) {
    for (const movil of [true, false]) {
      try { console.log('--- ' + t + ' ' + suf(movil)); await tareas[t](movil); }
      catch (e) { console.log('FALLO ' + t + ' ' + suf(movil) + ': ' + String(e).split('\n')[0].slice(0, 220)); }
    }
  }
  process.exit(0);
})();
