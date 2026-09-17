/* PACE · el CATÁLOGO que ve el «menú del día», leído de la app real (s192)
 * =========================================================================
 * El menú no puede proponer rutinas inventadas: este script abre `index.html`,
 * evalúa los catálogos vivos y vuelca lo que el menú necesita para elegir —nombre,
 * minutos, acceso, suelo, material, aviso de seguridad— y cuántas quedan GRATIS en
 * cada módulo, que es el pozo real de quien no ha comprado.
 *
 * Uso: node .claude/static-server.js   (aparte, puerto 8765)
 *      node scripts/audit/menu-s192-catalogo.js [--json ruta]
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const { chromium } = require(path.join(ROOT, 'node_modules', '@playwright', 'test'));

const salidaJson = (() => { const i = process.argv.indexOf('--json'); return i > 0 ? process.argv[i + 1] : null; })();

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 879 } });
  await ctx.addInitScript(() => localStorage.setItem('pace.state.v2', JSON.stringify({ firstSeen: 1, lang: 'es', langAuto: false })));
  const page = await ctx.newPage();
  await page.goto('http://localhost:8765/index.html');
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });

  const datos = await page.evaluate(() => {
    const es = (k) => ((window.PACE_STRINGS || {}).es || {})[k] || k;
    /* El material «opcional» (un cojín si molesta) no cierra la puerta a nadie. */
    const exige = (eq) => (eq || []).filter((e) => !/Optional$/.test(e)).length;
    const fila = (r, grupo) => ({
      id: r.id, grupo, nombre: r.name, min: r.min, acceso: r.access || 'free',
      suelo: !!r.requiresFloor, material: exige(r.equipment),
      aviso: !!r.safety,
      reten: typeof libraryConRetencion === 'function' ? libraryConRetencion(r) : null,
      nivel: r.level || null, intensidad: r.intensity || null, desc: r.desc || '',
    });
    /* Los catálogos van AGRUPADOS: { grupo: { label, items: [...] } }. */
    const modulo = (cat) => Object.keys(cat || {}).flatMap((g) => (cat[g].items || []).map((r) => fila(r, cat[g].label)));
    const caminos = (window.PATH_CATALOG || []).map((p) => ({
      id: p.id, nombre: es(p.nameKey), lema: es(p.taglineKey), momento: p.timeOfDay,
      acceso: p.access || 'free', pasos: (p.steps || []).map((s) => s.kind + (s.routineId ? ':' + s.routineId : '') + (s.min ? ':' + s.min : '')),
    }));
    return {
      respira: modulo(window.BREATHE_ROUTINES),
      mueve: modulo(window.MOVE_ROUTINES),
      estira: modulo(window.EXTRA_ROUTINES),
      caminos,
      claves: Object.keys(((Object.values(window.EXTRA_ROUTINES || {})[0] || {}).items || [])[0] || {}),
    };
  });
  await b.close();

  for (const k of ['respira', 'mueve', 'estira']) {
    const l = datos[k];
    const libres = l.filter((r) => r.acceso !== 'premium');
    console.log('\n' + k.toUpperCase() + ' · ' + l.length + ' rutinas · ' + libres.length + ' gratis · '
      + libres.filter((r) => !r.suelo && !r.material && !r.aviso).length + ' gratis sin suelo, material ni aviso');
    l.forEach((r) => console.log('  ' + (r.acceso === 'premium' ? 'P' : ' ') + (r.suelo ? 'S' : ' ') + (r.material ? 'M' : ' ')
      + (r.aviso || r.reten ? '!' : ' ') + ' ' + String(r.min).padStart(3) + ' min  ' + r.nombre + '  · ' + r.grupo
      + ' · ' + (r.nivel || '-') + '/' + (r.intensidad || '-') + '  (' + r.id + ')'));
  }
  console.log('\nCAMINOS · ' + datos.caminos.length);
  datos.caminos.forEach((p) => console.log('  ' + (p.acceso === 'premium' ? 'P' : ' ') + ' ' + p.nombre + ' · ' + p.momento + '  [' + p.pasos.join(' → ') + ']'));
  console.log('\nclaves de una rutina de Estira: ' + datos.claves.join(', '));
  if (salidaJson) fs.writeFileSync(salidaJson, JSON.stringify(datos, null, 2));
})();
