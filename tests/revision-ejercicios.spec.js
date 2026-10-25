/* PACE · lo que eligió Ez en la revisión de los ejercicios (16 oct. 2026)
 * ======================================================================
 * Ez pidió repasar las 53 rutinas con la evidencia de hoy y eligió, mirando la página
 * de `docs/traspaso/archivos/revision-ejercicios/`: el formato de hoy para todo Mueve
 * y Estira, Espalda de oficina de pie y sin suelo, 4·7·8 en cuatro ciclos, Bhastrika y
 * Kapalabhati por rondas, la hernia en el aviso y fuera los textos que prometían de
 * más. Las dos primeras pruebas no abren el navegador: leen los datos y el inglés.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const RAIZ = path.join(__dirname, '..');

function catalogo() {
  const ctx = { window: {}, console };
  vm.createContext(ctx);
  for (const f of ['app/move/move.data.js', 'app/extra/extra.data.js', 'app/extra/extra.data.piernas.js']) {
    vm.runInContext(fs.readFileSync(path.join(RAIZ, f), 'utf8'), ctx, { filename: f });
  }
  const en = {};
  for (const f of fs.readdirSync(path.join(RAIZ, 'app/i18n/content'))) {
    const src = fs.readFileSync(path.join(RAIZ, 'app/i18n/content', f), 'utf8');
    for (const m of src.matchAll(/^\s*'([^']+)':\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/gm)) en[m[1]] = m[2] !== undefined ? m[2] : m[3];
  }
  const rutinas = [];
  for (const cat of [ctx.window.MOVE_ROUTINES, ctx.window.EXTRA_ROUTINES]) {
    for (const g of Object.values(cat || {})) for (const r of g.items) rutinas.push(r);
  }
  return { rutinas, en };
}

test('ningún paso de Mueve ni de Estira se queda solo con su «cue», en ninguno de los dos idiomas', () => {
  const { rutinas, en } = catalogo();
  /* GUARD DE CERO: sin catálogo, el aserto de abajo pasaría vacío. */
  expect(rutinas.length, 'no encuentro las rutinas de Mueve y Estira').toBeGreaterThan(30);
  const faltan = [];
  for (const r of rutinas) {
    r.steps.forEach((st, i) => {
      const k = r.id + '.s' + i;
      if (!(st.instruction && st.instruction.action)) faltan.push(k + ' (es)');
      if (!en[k + '.instruction.action']) faltan.push(k + ' (en)');
      if (st.cue || en[k + '.cue']) faltan.push(k + ' lleva cue');
    });
  }
  expect(faltan).toEqual([]);
});

test('una rutina que no pide suelo no pide tumbarse, y ningún nombre ni descripción promete de más', () => {
  const { rutinas, en } = catalogo();
  const tumbarse = /t[úu]mbate|tumbad|boca (abajo|arriba)|foam roller|a cuatro patas|si[ée]ntate en el suelo/i;
  const promete = /exacto|a prueba|\bcura|elimina|corrige|previene|bulletproof|cures?\b|prevents?/i;
  const malas = [];
  for (const r of rutinas) {
    if (!r.requiresFloor) {
      r.steps.forEach((st, i) => {
        const ins = st.instruction || {};
        const texto = [ins.setup, ins.action, ins.care].filter(Boolean).join(' ');
        if (tumbarse.test(texto)) malas.push(r.id + '.s' + i + ' pide el suelo: ' + texto);
      });
    }
    for (const t of [r.name, r.desc, en[r.id + '.name'], en[r.id + '.desc']]) {
      if (t && promete.test(t)) malas.push(r.id + ' promete: ' + t);
    }
  }
  expect(malas).toEqual([]);
  const espalda = rutinas.find((r) => r.id === 'extra.back.desk');
  expect(espalda.requiresFloor).toBe(false);
  expect(espalda.steps.map((s) => s.name)).not.toContain('Superman');
});

test('Espalda de oficina entra de pie en «A tu ritmo»; 4·7·8 son cuatro ciclos; Bhastrika y Kapalabhati van por rondas', async ({ page, context }) => {
  await sembrar(context, { ritmo: { libre: true } });
  await irAlArtefacto(page);
  const r = await page.evaluate(() => {
    const antes = window.canAccessRoutine;
    /* Desde v0.176.0 es de Estira (es estirar, Ez, 2A) y está fuera de «Para empezar»: entra con
       PACE completo, gratis como rutina. */
    window.canAccessRoutine = (id) => { const b = window.resolveBodyRoutine && window.resolveBodyRoutine(id); return ((b && b.routine) || {}).access !== 'premium'; };
    let estira;
    try { estira = ritmoPozos(getState(), '2026-10-14').estira.map((x) => x.id); } finally { window.canAccessRoutine = antes; }
    const total = (seq) => seq.reduce((a, f) => a + f.duration, 0);
    const r478 = getBreatheRoutine('breathe.478');
    const bombeo = ['breathe.bellows', 'breathe.kapalabhati'].map((id) => {
      const rt = getBreatheRoutine(id);
      const seq = getSequence(rt);
      const suaves = seq.filter((f) => f.label === 'Respira suave');
      return {
        id,
        rondas: (rt.min * 60) / total(seq),
        porRonda: seq.filter((f) => f.label === 'Inhala').length,
        suaves: suaves.length,
        descanso: suaves.length ? suaves[0].duration : 0,
        ciclo: seq.ciclo,
        es: PACE_STRINGS.es[PHASE_KEYS['Respira suave']],
        en: PACE_STRINGS.en[PHASE_KEYS['Respira suave']],
      };
    });
    return {
      estira,
      pie: RITMO_SERIES_META['extra.back.desk'],
      ciclos478: Math.ceil((r478.min * 60) / total(getSequence(r478))),
      bombeo,
      hernia: [PACE_STRINGS.es['breathe.safety.body.rule3'], PACE_STRINGS.en['breathe.safety.body.rule3']],
    };
  });
  expect(r.estira, 'Espalda de oficina en el pozo de Estira').toContain('extra.back.desk');
  expect(r.pie).toEqual({ z: ['espalda', 'hombros'], pie: true });
  /* Weil: cuatro seguidos el primer mes. */
  expect(r.ciclos478).toBe(4);
  for (const b of r.bombeo) {
    expect(b, b.id).toEqual({ id: b.id, rondas: 3, porRonda: 20, suaves: 1, descanso: 20, ciclo: 2, es: 'Respira suave', en: 'Breathe easy' });
  }
  expect(r.hernia[0]).toMatch(/hernia/);
  expect(r.hernia[1]).toMatch(/hernia/);
});
