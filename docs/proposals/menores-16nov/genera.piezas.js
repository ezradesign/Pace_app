/* PACE · las piezas de genera.js (16 nov. 2026): llegar a cada pantalla, pintarla y medirla.
   Lo pintado son textos en los huecos que la app ya tiene; nada de esto toca `app/`. */
'use strict';

const vis = (page, sel) => page.locator(sel).filter({ visible: true });

/* El reloj quieto y movido a mano: lo que se fotografía es un segundo exacto. */
async function quieto(page) {
  const ahora = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(ahora + 1000);
}
async function avanzar(page, segundos) {
  for (let i = 0; i < segundos; i++) {
    await page.clock.runFor(1000);
    await page.waitForTimeout(25);
  }
  await page.waitForTimeout(300);
}

/* La rutina entra por su evento, como el «Ver ejercicio» de la pausa. Con `porLados`, el primer paso
   pasa EN MEMORIA a «por lados» con esos segundos por lado (la C). */
async function lanzarRutina(page, id, opciones) {
  await page.evaluate(([i, o]) => {
    const r = window.resolveBodyRoutine(i);
    let routine = r.routine;
    if (o && o.porLados) {
      const p0 = Object.assign({}, routine.steps[0], { mode: 'perSide', dur: o.porLados, transition: { seconds: 10 } });
      delete p0.reps; delete p0.tempo; delete p0.completion;
      routine = Object.assign({}, routine, { steps: [p0].concat(routine.steps.slice(1)) });
    }
    window.dispatchEvent(new CustomEvent('pace:hacerla', { detail: { routine, kind: r.source } }));
  }, [id, opciones || null]);
  await page.locator('[data-pace-session-root]').waitFor({ state: 'visible' });
  await quieto(page);
}

async function hastaTrabajo(page) {
  for (let i = 0; i < 40; i++) {
    const fase = await page.evaluate(() => { const e = document.querySelector('[data-pace-v1-raiz]'); return e && e.getAttribute('data-pace-v1-fase'); });
    if (fase === 'work') return;
    await avanzar(page, 1);
  }
  throw new Error('GUARD: el paso no llegó a trabajar');
}

async function medirRunner(page) {
  return page.evaluate(() => {
    const q = (s) => [...document.querySelectorAll(s)].find((e) => e.getBoundingClientRect().width > 0);
    const alto = (s) => { const e = q(s); return e ? Math.round(e.getBoundingClientRect().height) : null; };
    const txt = (s) => { const e = q(s); return e ? e.textContent.trim() : null; };
    const raiz = q('[data-pace-session-root]');
    return {
      fase: (q('[data-pace-v1-raiz]') || {}).getAttribute && q('[data-pace-v1-raiz]').getAttribute('data-pace-v1-fase'),
      rotulo: txt('[data-pace-v1-kicker]'), nombre: txt('[data-pace-v1-name]'), texto: txt('[data-pace-v1-cue]'),
      numero: txt('[data-pace-v1-num]'), etiqueta: txt('[data-pace-v1-numlabel]'), fuerte: txt('[data-pace-v1-support-strong]'),
      altoTexto: alto('[data-pace-v1-pila="cue"]'), dibujo: alto('[data-pace-v1-glyph]'),
      scroll: raiz ? raiz.scrollHeight - raiz.clientHeight : null,
    };
  });
}

/* A: la palabra del tramo abre el texto, como «Izquierda.» en los pasos por lados. */
async function pintarPalabra(page, palabra, espejo) {
  await page.evaluate(([w, e]) => {
    const q = (s) => [...document.querySelectorAll(s)].find((e) => e.getBoundingClientRect().width > 0);
    const p = q('[data-pace-v1-cue]');
    const b = document.createElement('strong');
    b.setAttribute('data-maqueta', '');
    b.style.color = 'var(--extra-deep)'; b.style.fontWeight = '600';
    b.textContent = w + '. ';
    p.insertBefore(b, p.firstChild);
    /* En el cambio de brazo el dibujo se da la vuelta, como en los pasos por lados. */
    if (e) q('[data-pace-v1-glyph] > div:first-child').style.transform = 'scaleX(-1)';
  }, [palabra, !!espejo]);
  await page.waitForTimeout(200);
  return medirRunner(page);
}
async function quitarPalabra(page) {
  await page.evaluate(() => {
    document.querySelectorAll('[data-maqueta]').forEach((e) => e.remove());
    const g = document.querySelectorAll('[data-pace-v1-glyph] > div:first-child'); g.forEach((e) => { e.style.transform = ''; });
  });
}

/* B: el rótulo de encima del nombre (donde va «Colócate») dice el tramo. */
async function pintarRotulo(page, rotulo) {
  await page.evaluate((r) => {
    const q = (s) => [...document.querySelectorAll(s)].find((e) => e.getBoundingClientRect().width > 0);
    /* Vacío mide 0 de ancho: se busca por su padre, que sí se ve. */
    const k = [...document.querySelectorAll('[data-pace-v1-kicker]')].find((e) => e.parentElement.getBoundingClientRect().width > 0);
    k.textContent = r;
  }, rotulo);
  await page.waitForTimeout(200);
  return medirRunner(page);
}

/* ---------- La jornada hasta su cierre ---------- */

async function terminarBloque(page) {
  const fin = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('pace.timer.v1')).endsAt || null; } catch (e) { return null; } });
  if (!fin) throw new Error('GUARD: no hay un bloque en marcha');
  await page.clock.fastForward(Math.max(0, fin - await page.evaluate(() => Date.now())) + 1000);
  await page.locator('[data-pace-break-shortcut]').first().waitFor({ state: 'attached', timeout: 15000 });
  await page.waitForTimeout(600);
}
const ventana = (page) => page.locator('[data-pace-modal-card]').filter({ visible: true }).last();
const leer = (page) => page.evaluate(() => {
  const q = (s) => [...document.querySelectorAll(s)].find((e) => e.getBoundingClientRect().width > 0);
  const t = (s) => { const e = q(s); return e ? e.textContent.trim() : null; };
  const plan = typeof ritmoPlan === 'function' ? ritmoPlan(getState()) : null;
  const cierre = plan && plan.m.items.filter((it) => it.tipo === 'cierre').pop();
  return { aro: t('[data-pace-dial-label]'), cta: t('[data-pace-cta]'), seguir: t('[data-pace-aro-seguir]'),
    panel: t('[data-pace-ritmo-panel]'), terminado: plan ? plan.terminado : null, pausa: plan && plan.pausa ? plan.pausa.tipo : null,
    cierre: cierre ? { desde: cierre.desde, dur: cierre.dur, plato: cierre.platos[0].name } : null };
});

const hhmm = (min) => Math.floor(min / 60) + ':' + String(min % 60).padStart(2, '0');

/* A: al acabar el último bloque, la home trata el cierre como cualquier pausa abierta. */
async function pintarCierreA(page, c) {
  await page.evaluate(([hora, plato, dur]) => {
    const vivo = (s) => [...document.querySelectorAll(s)].filter((e) => e.getBoundingClientRect().width > 0);
    const cambia = (raiz, de, a) => { const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) if (n.nodeValue.indexOf(de) !== -1) n.nodeValue = n.nodeValue.replace(de, a); };
    vivo('[data-pace-dial-label]').forEach((e) => { e.textContent = 'Para cerrar'; });
    vivo('[data-pace-dial-subtitle]').forEach((e) => { e.textContent = ''; });
    vivo('[data-pace-aro-seguir]').forEach((e) => { e.textContent = 'Cerrar la jornada'; });
    const mov = vivo('.pace-rt-mov')[0];
    const filas = [...mov.querySelectorAll('.pace-rt-fila')];
    const f = filas[0];
    const glifo = [...document.querySelectorAll('.pace-rt-fila')].find((x) => x !== f && x.textContent.indexOf(plato) !== -1);
    const icA = f.querySelector('.pace-rt-n').firstElementChild, icB = glifo && glifo.querySelector('.pace-rt-n').firstElementChild;
    /* El dibujo de Respira no está en la fila del móvil: sin él, mejor que la pesa de Mueve. */
    if (icA && icB) icA.replaceWith(icB.cloneNode(true)); else if (icA) icA.style.display = 'none';
    const nombre = f.querySelector('.pace-rt-n'); const n0 = nombre.lastChild; n0.nodeValue = plato;
    f.querySelector('.pace-rt-m').textContent = dur + ' min · Para cerrar, despacio';
    cambia(f.querySelector('.pace-rt-meta'), f.querySelector('.pace-rt-meta').textContent.match(/\d+:\d+/)[0], hora);
    filas.slice(1).forEach((x) => { x.style.display = 'none'; });
  }, [hhmm(c.desde - 5), c.plato, c.dur]);
  await page.waitForTimeout(300);
}

/* B: «Jornada cerrada» se queda, con una línea para hacer el cierre mientras dura. */
async function pintarCierreB(page, c) {
  await page.evaluate(([hora, plato]) => {
    const vivo = (s) => [...document.querySelectorAll(s)].filter((e) => e.getBoundingClientRect().width > 0);
    const panel = vivo('[data-pace-ritmo-estado="hecho"]')[0];
    const sub = panel.querySelector('.pace-rt-sub');
    const l = document.createElement('button');
    l.className = 'pace-rt-enlace'; l.style.display = 'block'; l.style.marginTop = '12px'; l.style.textAlign = 'left';
    l.textContent = 'Para cerrar, hasta las ' + hora + ': ' + plato + ' ›';
    panel.appendChild(l);
  }, [hhmm(c.desde + c.dur), c.plato]);
  await page.waitForTimeout(300);
}

async function jornadaHastaElCierre(page, foto, pintarA) {
  const m = { pintarA: !!pintarA };
  await page.getByRole('button', { name: 'Empezar jornada', exact: true }).filter({ visible: true }).first().click();
  await page.waitForTimeout(400);
  m.empezada = await leer(page);
  for (let b = 0; b < 8; b++) {
    await terminarBloque(page);
    const v = await ventana(page).textContent();
    const ultimo = /Para cerrar/.test(v);
    if (ultimo) {
      m.ventana = v.replace(/\s+/g, ' ').trim();
      if (pintarA === 'montada') {
        /* La 2.1 A ya montada (la app compilada con ella): la home tras «Ahora no», de verdad. */
        await ventana(page).getByRole('button', { name: 'Ahora no', exact: true }).click();
        await page.clock.fastForward(12000); await page.waitForTimeout(800);
        m.montada = await leer(page);
        await foto('2-montada');
        return m;
      }
      await foto('2-ventana');
      await ventana(page).getByRole('button', { name: 'Ahora no', exact: true }).click();
      await page.waitForTimeout(600);
      m.hoy = await leer(page);
      await foto('2-hoy');
      await pintarCierreB(page, m.hoy.cierre);
      await foto('2-b');
      return m;
    }
    await ventana(page).getByRole('button', { name: 'Ahora no', exact: true }).click();
    await page.waitForTimeout(600);
    m['pausa' + (b + 1)] = await leer(page);
    if (b === 0 && pintarA === true) {
      /* La A: la pausa abierta de siempre, con lo que diría el cierre. Se pinta y se sale. */
      await page.clock.fastForward(12000); await page.waitForTimeout(500);
      await pintarCierreA(page, m.empezada.cierre);
      await foto('2-a');
      return m;
    }
    if (b === 0) await foto('2-pausa');
    await vis(page, '[data-pace-aro-seguir]').click();
    await page.waitForTimeout(400);
  }
  throw new Error('GUARD: la jornada no llegó a su cierre');
}

/* ---------- Las pausas de pie con el aro corto ---------- */

async function medirDePie(page) {
  return page.evaluate(() => {
    const H = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
    const iso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const dias = []; for (const d = new Date(2026, 10, 16); dias.length < 20; d.setDate(d.getDate() + 1)) if (d.getDay() >= 1 && d.getDay() <= 5) dias.push(iso(d));
    const out = {};
    for (const pago of [true, false]) {
      const abierto = window.PREMIUM_ABIERTO_HASTA_V1, acceso = window.canAccessRoutine;
      if (!pago) {
        window.PREMIUM_ABIERTO_HASTA_V1 = false;
        window.canAccessRoutine = (id) => { const b = window.resolveBodyRoutine && window.resolveBodyRoutine(id); const br = window.getBreatheRoutine && window.getBreatheRoutine(id); return ((b && b.routine) || br || {}).access !== 'premium'; };
      }
      try {
        for (const aro of [10, 15, 25, 45]) {
          const serv = {}; let pausas = 0, sentadas = 0, maximo = 0, largaSentada = 0; const porDia = {}; let peor = null;
          for (const d of dias) {
            const mem = ritmoMemoria({ ritmo: { servidos: serv } }, d, null, null);
            const m = semanaComponer('jornada', Object.assign({}, H, { ahora: 540 }), ritmoPozos(getState(), d), {}, 8, semanaDe(d), ritmoPrevios([], null, false, aro), mem);
            serv[d] = ritmoSeriesClaves(m.items); const fs = Object.keys(serv).sort(); while (fs.length > 7) delete serv[fs.shift()];
            let seguidas = 0, max = 0; const linea = [];
            m.items.forEach((it) => {
              if (it.tipo === 'comida') { seguidas = 0; linea.push({ comida: ritmoHora(it.desde) }); }
              if (it.tipo !== 'pausa') return;
              const pie = (it.platos || []).some((p) => ritmoSeriesDePie(p.id));
              pausas++; if (pie) seguidas = 0; else { sentadas++; seguidas++; }
              if (it.larga && !(it.platos[1] && ritmoSeriesDePie(it.platos[1].id))) largaSentada++;
              max = Math.max(max, seguidas);
              linea.push({ hora: ritmoHora(it.desde), larga: !!it.larga, pie, platos: it.platos.map((p) => p.name) });
            });
            porDia[max] = (porDia[max] || 0) + 1;
            if (!peor || max > peor.max) peor = { dia: d, max, linea };
          }
          out[(pago ? 'completo' : 'gratis') + '-' + aro] = { pausasPorDia: +(pausas / dias.length).toFixed(1), sentadasPct: Math.round(100 * sentadas / pausas),
            maxSeguidas: maximo || peor.max, diasSegunMaxSeguidas: porDia, largasConEstiraSentada: largaSentada, peor };
        }
      } finally { window.PREMIUM_ABIERTO_HASTA_V1 = abierto; window.canAccessRoutine = acceso; }
    }
    return out;
  });
}

/* ---------- La carta del lunes, con «menos Mueve» (lo que la lectura C proponía) ---------- */

async function ponerCarta(page) {
  await page.evaluate(() => {
    const barras = [1, 2, 3, 4, 5, 6, 7].map((d) => ({ d, hechas: d < 6 ? 4 : 0, total: d < 6 ? 6 : 0 }));
    const res = { semana: { lunes: '2026-11-16', desde: '2026-11-09', hasta: '2026-11-15' }, dias: 5, carta: true,
      ayudo: ['move.neck.3'], hechas: 20, total: 30, barras,
      cambios: [{ tipo: 'menos', clase: 'rutinas', modulo: 'mueve', mas: 'estira', veces: 10, de: 15, paradas: 10 }] };
    setState((prev) => Object.assign({}, prev, { ritmo: Object.assign({}, prev.ritmo, {
      carta: { lunes: '2026-11-16', res, vista: null, respuesta: null, hora: null } }) }));
  });
  await page.locator('[data-pace-carta]').waitFor({ state: 'visible', timeout: 15000 });
  await page.waitForTimeout(600);
}

module.exports = { avanzar, lanzarRutina, hastaTrabajo, medirRunner, pintarPalabra, quitarPalabra, pintarRotulo, jornadaHastaElCierre, medirDePie, ponerCarta };
