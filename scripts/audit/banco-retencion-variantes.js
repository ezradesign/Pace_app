/* BANCO s166 · DONDE PONER EL TIEMPO DE RETENCION, SOBRE LA APP REAL
 * ==================================================================
 * La decision viene aprobada de s165 con TRES condiciones que no son un
 * detalle: (1) total acumulado, NUNCA un maximo — B1/s89 no retiro la cifra por
 * ser un dato, la retiro por ser un RECORD; (2) invisible durante la practica,
 * ni en `hold` ni en el `done`; (3) sin logro asociado. Lo que s165 NO fijo es
 * a que ESCALA se guarda, y eso cambia el trabajo: un contador de por vida es
 * un campo, y una serie semanal toca `weeklyStats`, `zeroEntry`,
 * `archiveDayToHistory` y los dos recompute. Por eso las variantes de aqui
 * incluyen las dos familias — al elegir mirando, la escala queda contestada.
 *
 * COMO: se abre el panel Ritmo DE VERDAD, con estado sembrado, y se inyecta
 * cada variante sobre el DOM real. Ninguna maqueta: el metodo de s165, y por su
 * misma razon — una hoja con los valores copiados a mano es exactamente la
 * evidencia que en s149 no reprodujo. Entre dos fotos solo cambia la variante.
 *
 * NINGUNA VARIANTE SE QUEDA EN PRODUCCION: esto no toca una linea de app/.
 *
 * TRAMPAS:
 *  · El panel es un modal: hay que esperar a que monte antes de inyectar.
 *  · `stats.tab.week` es la pestaña por defecto, pero se pulsa igualmente para
 *    no depender de ello.
 *  · Se siembra `weeklyStats` con una semana CREIBLE — con todo a cero las
 *    barras salen planas y las variantes no se pueden comparar.
 *  · Los textos van en español porque el locale del banco es es-ES; el ingles
 *    queda declarado como no mirado, igual que en s165.
 *
 * Uso:  node banco-retencion-variantes.js <repo> <salida>
 */
'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const REPO = process.argv[2] || process.cwd();
const SALIDA = process.argv[3] || path.join(REPO, '_revision-retencion');
const { chromium } = require(require.resolve('@playwright/test', { paths: [REPO] }));

const PORT = 8803;
const BASE = 'http://localhost:' + PORT;

/* Una semana con practica de verdad: lunes a domingo, con dos dias flojos.
   `holdSeconds` es lo que la funcion nueva acumularia; aqui es semilla del
   banco y NO existe todavia en el estado. */
const SEMANA = {
  focusMinutes:  [50, 75, 25, 100, 50, 0, 25],
  breathMinutes: [12, 8, 20, 4, 16, 0, 12],
  moveMinutes:   [10, 0, 15, 10, 0, 20, 5],
  waterGlasses:  [6, 8, 5, 8, 7, 3, 6],
  holdSeconds:   [38, 26, 71, 12, 55, 0, 44],   // 246 s = 4 min 06 s
};
const SEMANA_SEG = SEMANA.holdSeconds.reduce((a, b) => a + b, 0);
const VIDA_SEG = 3971;   // 1 h 06 min 11 s -- «llevas meses practicando»

const fmt = seg => {
  const m = Math.floor(seg / 60), s = seg % 60;
  if (m < 60) return m + ' min ' + String(s).padStart(2, '0') + ' s';
  return Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0') + ' min';
};

/* ---------------- las variantes, inyectadas sobre el DOM real ---------------- */
/* Cada una recibe el documento ya montado y devuelve nada: pinta y ya. Van como
   CADENAS de funcion porque cruzan al navegador. */

const VARIANTES = [
  {
    id: 'V0-hoy',
    titulo: 'Hoy — sin retencion en ninguna parte',
    fn: () => {},
  },
  {
    id: 'V1-quinta-tarjeta',
    titulo: 'Una QUINTA tarjeta, junto a las otras cuatro (semanal)',
    fn: ([texto]) => {
      const grid = document.querySelector('[data-pace-week-cards]');
      grid.style.gridTemplateColumns = 'repeat(5, 1fr)';
      const c = grid.firstElementChild.cloneNode(true);
      c.style.borderTop = '3px solid var(--breathe)';
      c.children[0].textContent = 'Retención';
      c.children[1].textContent = texto.split(' ')[0] + ':' + texto.split(' ')[2];
      c.children[2].textContent = 'min';
      grid.appendChild(c);
    },
  },
  {
    id: 'V2-sublinea-respira',
    titulo: 'Una SUBLINEA dentro de la tarjeta de Respira (semanal)',
    fn: ([texto]) => {
      const grid = document.querySelector('[data-pace-week-cards]');
      const tarjeta = grid.children[1];               // Respira
      const sub = document.createElement('div');
      sub.style.cssText = 'font-size:9px;color:var(--ink-3);margin-top:3px;letter-spacing:.02em;';
      sub.textContent = texto + ' en retención';
      tarjeta.appendChild(sub);
    },
  },
  {
    id: 'V3-linea-al-pie-semana',
    titulo: 'Una LINEA al pie, sobre la nota (semanal)',
    fn: ([texto]) => {
      const nota = document.querySelector('[data-pace-week-note]');
      const l = document.createElement('div');
      l.style.cssText = 'margin-top:10px;display:flex;justify-content:space-between;align-items:baseline;'
        + 'padding:0 2px;font-size:11px;color:var(--ink-3);';
      l.innerHTML = '<span style="letter-spacing:.14em;text-transform:uppercase;font-size:9px">Retención esta semana</span>'
        + '<span style="font-family:var(--font-display);font-style:italic;font-size:15px;color:var(--ink-2)">' + texto + '</span>';
      nota.parentNode.insertBefore(l, nota);
    },
  },
  {
    id: 'V4-linea-al-pie-vida',
    titulo: 'La misma LINEA, pero TOTAL ACUMULADO de siempre (de por vida)',
    fn: ([texto]) => {
      const nota = document.querySelector('[data-pace-week-note]');
      const l = document.createElement('div');
      l.style.cssText = 'margin-top:10px;display:flex;justify-content:space-between;align-items:baseline;'
        + 'padding:0 2px;font-size:11px;color:var(--ink-3);';
      l.innerHTML = '<span style="letter-spacing:.14em;text-transform:uppercase;font-size:9px">Retención acumulada</span>'
        + '<span style="font-family:var(--font-display);font-style:italic;font-size:15px;color:var(--ink-2)">' + texto + '</span>';
      nota.parentNode.insertBefore(l, nota);
    },
  },
  {
    id: 'V5-quinta-fila-barras',
    titulo: 'Una QUINTA fila de barras, una por dia (semanal)',
    fn: ([, dias]) => {
      const filas = document.querySelectorAll('[data-pace-week-bar-row]');
      const ultima = filas[filas.length - 1];
      const f = ultima.cloneNode(true);
      f.querySelector('span').textContent = 'Retención';
      f.querySelectorAll('span')[1].textContent = 'seg';
      const max = Math.max(1, ...dias);
      const cols = f.querySelectorAll('[data-pace-bar-chart] > div');
      cols.forEach((col, i) => {
        const barra = col.querySelector('div > div');
        const v = dias[i];
        barra.style.height = (v / max * 100) + '%';
        barra.style.background = v > 0 ? 'var(--breathe)' : 'var(--line)';
        barra.style.minHeight = v > 0 ? '4px' : '2px';
        const num = barra.querySelector('span');
        if (num) num.textContent = String(v);
        else if (v > 0) {
          const s = document.createElement('span');
          s.style.cssText = 'position:absolute;bottom:100%;left:50%;transform:translateX(-50%);'
            + 'font-size:10px;color:var(--ink-3);margin-bottom:4px;font-variant-numeric:tabular-nums;';
          s.textContent = String(v);
          barra.appendChild(s);
        }
      });
      ultima.parentNode.insertBefore(f, ultima.nextSibling);
    },
  },
];

async function nuevaPagina(browser) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 }, locale: 'es-ES', colorScheme: 'light', deviceScaleFactor: 2,
  });
  await context.addInitScript(([c, e]) => {
    if (!localStorage.getItem(c)) localStorage.setItem(c, JSON.stringify(e));
  }, ['pace.state.v2', {
    firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', paletteAuto: false,
    weeklyStats: {
      focusMinutes: SEMANA.focusMinutes, breathMinutes: SEMANA.breathMinutes,
      moveMinutes: SEMANA.moveMinutes, waterGlasses: SEMANA.waterGlasses,
    },
    breatheSessionsTotal: 34,
    streak: { current: 5, longest: 9, lastActiveDate: null },
    /* LOS GUARDS NO SON OPCIONALES AL SEMBRAR weeklyStats, y esto costo una
       acusacion falsa al producto: sin `_weeklyStatsReindexed_v0_28_8`,
       `loadState` cree que el estado es anterior a v0.28.8 y le aplica
       `reindexWeeklyStatsMondayFirst`, que es literalmente
       [arr[1]..arr[6], arr[0]] -- la semana sale ROTADA UN DIA y las barras
       pintan lunes en martes. Se vio comparando columna a columna contra la
       semilla; de vista pasaba por buena. `lastActiveDay` en HOY por lo
       mismo: sin el, el rollover archiva y arranca una semana nueva. */
    _weeklyStatsReindexed_v0_28_8: true,
    _historyRecalculated_v0_28_8: true,
    _historyMigrated: true,
    lastActiveDay: new Date().toDateString(),
  }]);
  const page = await context.newPage();
  const errores = [];
  page.on('pageerror', e => errores.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errores.push('console: ' + m.text()); });
  return { context, page, errores };
}

async function abrirRitmo(page) {
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Ver estadísticas' }).click();
  await page.getByRole('button', { name: 'Semana', exact: true }).click();
  await page.locator('[data-pace-week-view]').waitFor({ state: 'visible' });
  await page.waitForTimeout(350);
}

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const srv = spawn(process.execPath, ['.claude/static-server.js'], {
    cwd: REPO, env: Object.assign({}, process.env, { PORT: String(PORT) }), stdio: 'ignore',
  });
  const errores = [];
  let hechas = 0;
  try {
    for (let i = 0; i < 60; i++) {
      try { const r = await fetch(BASE + '/index.html', { method: 'HEAD' }); if (r.ok) break; }
      catch (e) {}
      await new Promise(r => setTimeout(r, 200));
    }
    const browser = await chromium.launch();
    for (const v of VARIANTES) {
      const { context, page, errores: errs } = await nuevaPagina(browser);
      try {
        await abrirRitmo(page);
        const texto = v.id === 'V4-linea-al-pie-vida' ? fmt(VIDA_SEG) : fmt(SEMANA_SEG);
        await page.evaluate(v.fn, [texto, SEMANA.holdSeconds]);
        await page.waitForTimeout(150);
        const panel = page.locator('[data-pace-modal-backdrop]').last();
        await panel.screenshot({ path: path.join(SALIDA, v.id + '.png'), animations: 'disabled' });
        hechas++;
        console.log('  · ' + v.id.padEnd(26) + v.titulo);
      } catch (e) {
        errores.push(v.id + ': ' + e.message);
      }
      errores.push(...errs.map(e => v.id + ': ' + e));
      await context.close();
    }
    await browser.close();
  } finally { srv.kill(); }

  console.log('\n  retencion sembrada: semana ' + SEMANA_SEG + ' s (' + fmt(SEMANA_SEG)
    + ') · de por vida ' + VIDA_SEG + ' s (' + fmt(VIDA_SEG) + ')');
  console.log('  variantes: ' + hechas + ' de ' + VARIANTES.length);
  console.log('  consola: ' + (errores.length === 0 ? 'LIMPIA' : '\n    ' + errores.join('\n    ')));
  console.log('\n  capturas en ' + SALIDA);
  /* GUARD DE CERO: sin esto, «0 errores» sobre 0 capturas pasaria por bueno. */
  if (hechas !== VARIANTES.length) {
    console.error('\n  BANCO ROTO: faltan variantes por fotografiar');
    process.exit(1);
  }
  process.exit(errores.length ? 1 : 0);
})().catch(e => { console.error('BANCO ROTO:', e.message); process.exit(1); });
