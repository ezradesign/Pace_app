/* PACE · tests/sidebar-redesign.spec.js
   ==================================================
   LA BARRA LATERAL: su estructura y sus decisiones. Desde el 9 oct. 2026 es un
   cuaderno (elegido por Ez en cuatro vueltas de fotos): la semana en cápsulas,
   Hoy con palabras, la siguiente pausa con su rótulo, las tres bibliotecas y el
   último logro. Lo que dice cada pieza lo vigila `sidebar-cuaderno.spec.js`;
   aquí, lo que no se ve leyendo el JSX:

   · QUE «HOY» SALGA DEL ESTADO, con el índice LUNES-PRIMERO de s69, y que el
     agua sola NO encienda el día (criterio compartido con `YearView` y la racha).
   · QUE LO QUE LA BARRA PROPONE SE PUEDA HACER: la sugerencia sale de la regla de
     la biblioteca con el pozo filtrado por `safety` y `canAccessRoutine`.
   · QUE EL ORDEN SEA EL MISMO EN LAS DOS PIELES, lo traiga el DOM (s160) y no
     haya dos reglas seguidas.
   · QUE EL CAJÓN SE CIERRE AL ELEGIR: en móvil quedarse abierto tapa justo lo
     que acabas de pedir.

   NO CUBRE: ni un píxel. Cómo se ve lo decidió Ez con las fotos de
   `docs/traspaso/archivos/sidebar-8oct/` (montada.js las repite).
*/
const { test, expect } = require('@playwright/test');
const { sembrar, sembrarPisando, irAlArtefacto, capturarErrores } = require('./helpers');

/* `lastActiveDay` y las guardas de migración NO SON OPCIONALES cuando se siembra
   `weeklyStats` o `water`: sin ellos `loadState` archiva la semana o la recalcula
   a ceros y el aserto falla como si el producto no leyera el estado (tres rojos
   seguidos en s180). El formato es el que la app escribe (`toDateString`). */
const ABIERTA = {
  sidebarCollapsed: false,
  lastActiveDay: new Date().toDateString(),
  _historyMigrated: true,
  _weeklyStatsReindexed_v0_28_8: true,
  _historyRecalculated_v0_28_8: true,
};

function sb(page) {
  return page.locator('[data-pace-sidebar]');
}

/* Las secciones en el orden del DOM. Cuelgan de `[data-pace-sidebar-escala]`, la
   envoltura que se escala para caber, y no del `<aside>`. */
function estructura(page) {
  return page.evaluate(() => {
    const el = document.querySelector('[data-pace-sidebar-escala]');
    if (!el) return null;
    return [...el.children].map(e => (
      e.matches('[data-pace-sidebar-accion]') ? 'ACCION'
      : e.getAttribute('data-pace-sidebar-logobar') !== null ? 'logo'
      : e.getAttribute('data-pace-sidebar-spacer') !== null ? 'spacer'
      : e.getAttribute('data-pace-sidebar-pie') !== null ? 'pie'
      : e.getBoundingClientRect().height <= 2 ? 'regla'
      : e.querySelector('[data-pace-hoy]') ? 'HOY'
      : e.querySelector('[data-pace-semana]') ? 'SEMANA'
      : e.querySelector('[data-pace-bibliotecas]') ? 'BIBLIOTECAS'
      : e.querySelector('[data-pace-sidebar-ultimo]') ? 'LOGRO'
      : '?'
    ));
  });
}

/* Un `session.completed` REAL, con la fábrica de la app: el almacén valida y un
   evento hecho a mano se descarta en silencio. La escritura no es síncrona. */
async function sembrarSesion(page, routineId, modulo) {
  await page.evaluate(([rid, mod]) => {
    window.paceEventsAppend(window.makeEvent({
      type: 'session.completed', context: 'standalone', runId: window.newEventId(),
      payload: { module: mod, routineId: rid, completionReason: 'natural', elapsedSeconds: 300, activeSeconds: 300,
                 plannedSeconds: 300, plannedSecondsSource: 'declared', variant: null },
    }));
  }, [routineId, modulo]);
  await page.waitForFunction(
    async () => (JSON.parse((await window.eventsWebReadRaw()) || '{}').events || []).length > 0,
    null, { timeout: 5000 });
}

async function conUnaSesion(page, context) {
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);
  await sembrarSesion(page, 'breathe.box.4', 'breathe');
  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  /* Tras recargar, los eventos llegan al espejo en memoria DESPUÉS del primer pintado
     (IndexedDB es asíncrono) y la barra se repinta con `pace:eventos`. Con el PC
     cargado eso pasó de 10 s una vez en la suite entera: se espera al espejo. */
  await page.waitForFunction(() => {
    const snap = window.paceEventsSnapshot && window.paceEventsSnapshot();
    return !!(snap && (snap.events || []).length);
  }, null, { timeout: 30000 });
}

/* ==========================================================================
   LO QUE LA BARRA LEE
   ========================================================================== */

test('Hoy sale del estado, con el índice lunes-primero', async ({ page, context }) => {
  const errores = capturarErrores(page);
  /* Miércoles (índice 2). Se siembra la semana entera para que el índice importe:
     si alguien lo lee con `getDay()`, coge otro. */
  await sembrar(context, Object.assign({}, ABIERTA, {
    weeklyStats: {
      focusMinutes:  [0, 0, 50, 0, 0, 0, 0],
      breathMinutes: [0, 0, 12, 0, 0, 0, 0],
      moveMinutes:   [0, 0, 7, 0, 0, 0, 0],
      waterGlasses:  [0, 0, 3, 0, 0, 0, 0],
    },
    water: { goal: 8, today: 3, lastReset: null },
  }));
  await irAlArtefacto(page);
  const hoy = await page.evaluate(() => window.selectSidebarToday(getState(), new Date(2026, 8, 2)));
  expect(hoy).toMatchObject({ focusMinutes: 50, breatheMinutes: 12, bodyMinutes: 7, dayIndex: 2 });
  expect(errores).toEqual([]);
});

test('el agua sola NO enciende el día; foco, respira o cuerpo sí', async ({ page, context }) => {
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);
  const dias = await page.evaluate(() => {
    const uno = a => window.selectSidebarWeek({
      weeklyStats: {
        focusMinutes:  [a[0], 0, 0, 0, 0, 0, 0],
        breathMinutes: [a[1], 0, 0, 0, 0, 0, 0],
        moveMinutes:   [a[2], 0, 0, 0, 0, 0, 0],
        waterGlasses:  [a[3], 0, 0, 0, 0, 0, 0],
      },
    }).days[0];
    return {
      soloAgua: uno([0, 0, 0, 8]).active, soloFoco: uno([25, 0, 0, 0]).active, soloRespira: uno([0, 5, 0, 0]).active,
      soloCuerpo: uno([0, 0, 4, 0]).active, nada: uno([0, 0, 0, 0]).active,
      /* Y tampoco llena su cápsula: los minutos son foco, respira y cuerpo. */
      minutosAgua: uno([0, 0, 0, 8]).minutes, minutosTodo: uno([25, 5, 4, 8]).minutes,
    };
  });
  expect(dias).toEqual({ soloAgua: false, soloFoco: true, soloRespira: true, soloCuerpo: true, nada: false,
    minutosAgua: 0, minutosTodo: 34 });
});

/* ==========================================================================
   LO QUE LA BARRA PROPONE
   ========================================================================== */

test('sin nada que continuar, la barra SUGIERE -- y la sugerencia es SEGURA', async ({ page, context }) => {
  /* Lo que se defiende es lo que NO se ve: que lo que ofrece se pueda hacer. Una
     sugerencia con `safety: true` metería a alguien en apnea sin pedirlo, y una
     premium bloqueada prometería algo que no abre. */
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);
  const accion = sb(page).locator('[data-pace-sidebar-accion]');
  await expect(accion).toHaveCount(1);
  await expect(accion).toHaveAttribute('data-kind', 'suggest');
  await expect(accion).toContainText('Para ahora');

  const seguro = await page.evaluate(() => {
    const t = document.querySelector('[data-pace-sidebar-accion-titulo]').textContent.trim();
    const todas = [];
    [window.MOVE_ROUTINES, window.EXTRA_ROUTINES].forEach(cat => {
      Object.keys(cat || {}).forEach(g => ((cat[g] || {}).items || []).forEach(r => todas.push(r)));
    });
    const r = todas.find(x => x.name === t);
    return r ? { hallada: true, safety: !!r.safety, accesible: !window.canAccessRoutine || window.canAccessRoutine(r.id) } : { hallada: false, titulo: t };
  });
  expect(seguro.hallada, 'la sugerencia no sale del catalogo de cuerpo: ' + seguro.titulo).toBe(true);
  expect(seguro.safety, 'la sugerencia lleva modal de seguridad').toBe(false);
  expect(seguro.accesible, 'la sugerencia esta bloqueada por premium').toBe(true);

  const orden = await estructura(page);
  expect(orden.filter((x, i) => x === 'regla' && orden[i + 1] === 'regla')).toEqual([]);
});

test('el selector es PURO: la sugerencia y la home entran por parámetro', async ({ page, context }) => {
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);
  const r = await page.evaluate(() => {
    const s = getState();
    const reanudable = { routineId: 'breathe.box.4', round: 2, rondas: 4 };
    const ritmo = { targetId: 'move.neck', hora: 600, min: 4, modulo: 'estira' };
    return {
      sinNada: window.selectSidebarPrimaryAction(s, { events: [] }),
      conSugerencia: window.selectSidebarPrimaryAction(s, { events: [], sugerencia: 'move.neck' }),
      /* Con «A tu ritmo» en la home y sin pausa que anunciar, nada: a las 9:10 la home
         pregunta cómo es tu día y un «Para ahora» al lado eran dos voces. */
      conRitmoEnLaHome: window.selectSidebarPrimaryAction(s, { events: [], sugerencia: 'move.neck', conRitmo: true }),
      /* Pero lo que está a medias es tuyo y se sigue ofreciendo, y la pausa también. */
      aMedias: window.selectSidebarPrimaryAction(s, { events: [], conRitmo: true, reanudable }),
      pausa: window.selectSidebarPrimaryAction(s, { events: [], conRitmo: true, ritmo }),
    };
  });
  expect(r.sinNada).toBe(null);
  expect(r.conSugerencia).toMatchObject({ kind: 'suggest', targetId: 'move.neck' });
  expect(r.conRitmoEnLaHome).toBe(null);
  expect(r.aMedias).toMatchObject({ kind: 'resume', targetId: 'breathe.box.4' });
  expect(r.pausa).toMatchObject({ kind: 'suggest', targetId: 'move.neck' });
});

test('«Repetir» salta el Foco: no es una rutina y dejaba la barra sin nada', async ({ page, context }) => {
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);
  const r = await page.evaluate(() => {
    const ev = (hora, module, routineId) => ({ type: 'session.completed', occurredAt: '2026-10-08T' + hora + ':00Z', payload: { module, routineId } });
    return {
      trasUnBloque: window.selectSidebarLastSession([ev('09:00', 'breathe', 'breathe.box.4'), ev('10:00', 'focus', 'focus')]),
      soloFoco: window.selectSidebarLastSession([ev('10:00', 'focus', 'focus')]),
    };
  });
  expect(r.trasUnBloque).toMatchObject({ routineId: 'breathe.box.4', module: 'breathe' });
  expect(r.soloFoco).toBe(null);
});

/* ==========================================================================
   ORDEN, PIEL Y CAJÓN
   ========================================================================== */

test('el orden es Semana · Hoy · Pausa · Bibliotecas · Último logro, en escritorio', async ({ page, context }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await conUnaSesion(page, context);
  const orden = await estructura(page);
  expect(orden.filter((x, i) => x === 'regla' && orden[i + 1] === 'regla')).toEqual([]);
  expect(orden.filter(x => x !== 'regla' && x !== 'spacer')).toEqual(['logo', 'SEMANA', 'HOY', 'ACCION', 'BIBLIOTECAS', 'LOGRO', 'pie']);
  await expect(sb(page).locator('[data-pace-sidebar-accion]')).toHaveAttribute('data-kind', 'repeat');
});

test('móvil: el mismo orden, y el cajón se cierra al elegir', async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await conUnaSesion(page, context);
  const orden = await estructura(page);
  expect(orden.filter((x, i) => x === 'regla' && orden[i + 1] === 'regla')).toEqual([]);
  expect(orden.filter(x => x !== 'regla' && x !== 'spacer')).toEqual(['logo', 'SEMANA', 'HOY', 'ACCION', 'BIBLIOTECAS', 'LOGRO', 'pie']);

  /* Al elegir una biblioteca, el cajón se quita de en medio y la biblioteca se abre. */
  await sb(page).locator('[data-pace-biblioteca="stretch"]').click();
  await expect(sb(page)).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => getState().sidebarCollapsed)).toBe(true);
  await expect(page.locator('.pace-lib-hd h2').filter({ visible: true })).toHaveText('Estira');
});

test('ni en móvil ni en escritorio hay scroll horizontal', async ({ page, context }) => {
  await sembrar(context, ABIERTA);
  for (const v of [{ width: 1280, height: 720 }, { width: 390, height: 844 }, { width: 320, height: 568 }]) {
    await page.setViewportSize(v);
    await irAlArtefacto(page);
    const desborde = await page.evaluate(() => {
      const el = document.querySelector('[data-pace-sidebar]');
      return el ? el.scrollWidth - el.clientWidth : 0;
    });
    expect(desborde, 'scroll horizontal a ' + v.width + 'x' + v.height).toBe(0);
  }
});

/* ==========================================================================
   EL ÚLTIMO LOGRO Y EL PIE
   ========================================================================== */

test('el último logro tiene su rótulo, nombra el más reciente y dice qué lo ganó', async ({ page, context }) => {
  /* Sin el rótulo, un título suelto «se entiende raro» (lo dijo el usuario en s180). */
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);
  await expect(sb(page).getByText('Último logro', { exact: true })).toHaveCount(1);
  const vacio = sb(page).locator('[data-pace-sidebar-ultimo]');
  await expect(vacio).toHaveAttribute('data-pace-sidebar-ultimo', '');
  await expect(vacio).toContainText('Aún no hay ninguno');

  await sembrarPisando(context, Object.assign({}, ABIERTA, {
    achievements: {
      'first.sip':    { unlockedAt: 1736120000000 },
      'first.return': { unlockedAt: 1736999999999 },
      'first.breath': { unlockedAt: 1736500000000 },
    },
  }));
  await irAlArtefacto(page);
  const fila = sb(page).locator('[data-pace-sidebar-ultimo]');
  await expect(fila, 'el MÁS RECIENTE, no el primero del objeto').toHaveAttribute('data-pace-sidebar-ultimo', 'first.return');
  const desc = await page.evaluate(() => (window.ACHIEVEMENT_CATALOG.find(a => a.id === 'first.return') || {}).desc);
  await expect(fila).toContainText(desc);
  await fila.click();
  await expect(page.locator('[data-pace-modal-backdrop]')).toHaveCount(1);
});

test('el pie son dos filas de texto: «Mis rutinas» y «Da de pastar a la vaca»', async ({ page, context }) => {
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);
  const pie = sb(page).locator('[data-pace-sidebar-pie]');
  await expect(pie.getByRole('button', { name: /^Mis rutinas/ })).toHaveCount(1);
  const apoyo = pie.getByRole('button', { name: 'Da de pastar a la vaca' });
  await expect(apoyo).toHaveCount(1);
  await apoyo.click();
  await expect(page.locator('[data-pace-modal-backdrop]')).toHaveCount(1);
});

/* ==========================================================================
   INGLÉS
   ========================================================================== */

test('en inglés la barra dice lo suyo y no se queda con claves crudas', async ({ page, context }) => {
  await sembrarPisando(context, Object.assign({}, ABIERTA, { lang: 'en', langAuto: false }));
  await irAlArtefacto(page);
  const texto = await sb(page).innerText();
  expect(texto).toContain('TODAY');
  expect(texto).toContain('LIBRARIES');
  expect(texto).toContain('None of eight glasses');
  await expect(sb(page).getByRole('button', { name: /week|Stats/i })).toHaveCount(1);
  await expect(sb(page).getByRole('button', { name: 'Open Stretch' })).toHaveCount(1);
  /* Una clave sin traducir se pinta tal cual («sidebar.week.open»). */
  expect(texto).not.toMatch(/sidebar\.[a-z]/);
});
