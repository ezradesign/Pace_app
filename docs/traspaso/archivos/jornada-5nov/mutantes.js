/* Cada cambio, deshecho en el index compilado: aro-jornada.spec.js tiene que ponerse rojo. */
'use strict';
const fs = require('fs'), path = require('path');
const { spawnSync } = require('child_process');
const R = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/.claude/worktrees/maqueta-jornada-40d7ea';
const I = path.join(R, 'index.html');
const orig = fs.readFileSync(I, 'utf8');
const M = [
  ['pausa', 'if (enPausaRitmo) {\n    const plato', 'if (false) {\n    const plato'],
  ['plato-hecho', "return a.platos.find((p) => a.hechos.indexOf(p.id) === -1) || null;", 'return a.platos[0];'],
  ['pausar-foco', "cta: status === 'running' ? {", "cta: status === 'nunca' ? {"],
  ['reanudar', ": status === 'paused' ? {", ": status === 'nunca' ? {"],
  ['despues-movil', '.pace-aro-despues { display: none; }', '.pace-aro-nada { display: none; }'],
  ['terminada-corriendo', "if (typeof ritmoPausaCuenta !== 'function' || ritmoPausaCuenta(s)) return false;", ''],
  ['terminada-comida', "return !!a && a.it.tipo === 'pausa';", 'return !!a;'],
  ['losetas-altas', 'padding: 8px 14px 7px !important; text-align: left;', 'padding: 16px 14px 15px !important; text-align: left;'],
  ['preparar', "'ritmo.tarjeta.comienza': 'Preparar jornada'", "'ritmo.tarjeta.comienza': 'Comienza'"],
];
const bin = path.join(R, 'node_modules/@playwright/test/cli.js');
const res = {};
try {
  for (const [n, a, b] of M) {
    const norm = a.replace(/\n/g, '\n');
    let t = orig;
    if (!t.includes(norm)) {
      const re = new RegExp(norm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\?\s+/g, '\\s+'));
      if (!re.test(t)) { res[n] = 'NO CASA'; continue; }
      t = t.replace(re, () => b);
    } else t = t.replace(norm, () => b);
    fs.writeFileSync(I, t);
    const r = spawnSync(process.execPath, [bin, 'test', 'tests/aro-jornada.spec.js', '--project=chromium', '--workers=2', '--reporter=line'],
      { cwd: R, env: Object.assign({}, process.env, { PACE_E2E_PORT: '8852' }), encoding: 'utf8', timeout: 90000 });
    const out = (r.stdout || '') + (r.stderr || '');
    const f = /(\d+) failed/.exec(out), p = /(\d+) passed/.exec(out);
    res[n] = (f ? f[1] : '0') + ' rojas, ' + (p ? p[1] : '0') + ' verdes';
    console.log(n, res[n]);
  }
} finally { fs.writeFileSync(I, orig); }
console.log(JSON.stringify(res));
