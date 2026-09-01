/* PACE · tests/sidebar-redesign.spec.js (sesión 180)
   ==================================================
   LA SIDEBAR REESCRITA. Lo que defiende, y por qué cada cosa merece un aserto:

   · QUE «HOY» SALGA DEL ESTADO Y NO DE UN CÁLCULO PROPIO. El resumen tiene que
     coincidir con lo que ya guarda `weeklyStats`, con el índice del día
     LUNES-PRIMERO de s69. Si alguien vuelve a leerlo con `getDay()` a secas, la
     semana rota y esto se pone rojo.
   · QUE EL AGUA SOLA NO ENCIENDA EL DÍA. Es el criterio de s69, compartido con
     `YearView` y con la racha. Es la regla más fácil de romper por descuido
     porque el agua SÍ aparece en «Hoy».
   · QUE LA TARJETA NO SE PINTE SI NO HAY NADA. Decisión del usuario en s180: la
     tarjeta solo puede decir CONTINUAR o REPETIR, nunca «prueba esto». Sin nada
     que continuar, no hay tarjeta -- ni bloque vacío ni texto de relleno.
   · QUE EL ORDEN CAMBIE CON LA PIEL. En móvil lo accionable va primero (el
     pulgar llega antes a lo que se pulsa); en escritorio va después de Hoy. Y
     que ese orden lo traiga el DOM, no `order` de CSS (s160).
   · QUE EL CAJÓN SE CIERRE AL ELEGIR. En móvil quedarse abierto tapa justo lo
     que acabas de pedir.
   · QUE NO HAYA DOS REGLAS SEGUIDAS. Salió de verdad al mover la acción de
     sitio, y es invisible leyendo el JSX.

   NO CUBRE: ni un píxel. Que el logo recortado se vea bien, que los glifos se
   lean a 24 px o que la rejilla respire es la revisión a tamaño real. Aquí se
   comprueba estructura y decisión.
*/
const { test, expect } = require('@playwright/test');
const { sembrar, sembrarPisando, irAlArtefacto, capturarErrores } = require('./helpers');

/* La sidebar arranca colapsada en móvil (state-core.jsx:261) y expandida en
   escritorio. Se fija explícitamente para no depender de eso.

   Y `lastActiveDay` NO ES OPCIONAL cuando se siembra `weeklyStats` o `water`:
   sin él, `loadState` ve un día nuevo, corre el rollover y ARCHIVA la semana,
   así que la sidebar sale a ceros y el aserto falla como si el producto no
   leyera el estado. Costó dos rojos. El formato es el que la app escribe
   (`new Date().toDateString()`, state-core.jsx:230); nada de ISO, que la regla
   §10 prohíbe justamente por esto. */
const ABIERTA = {
  sidebarCollapsed: false,
  lastActiveDay: new Date().toDateString(),
  /* Y LAS GUARDAS DE MIGRACION TAMBIEN. Sin ellas `loadState` corre las
     migraciones de s43/s69: `_historyRecalculated_v0_28_8` RECALCULA
     `weeklyStats` desde el historico, y con un historico vacio la deja a
     CEROS -- la semana sembrada desaparece y el aserto falla como si el
     selector no leyera el estado. Fue el tercer rojo del mismo sintoma. */
  _historyMigrated: true,
  _weeklyStatsReindexed_v0_28_8: true,
  _historyRecalculated_v0_28_8: true,
};

function sb(page) {
  return page.locator('[data-pace-sidebar]');
}

/* Clasifica los hijos DIRECTOS de la sidebar. `matches` y no `querySelector`
   para la tarjeta: el atributo está en ELLA MISMA, y buscar un descendiente la
   clasificaba como «pie» -- me dio un orden falso una vez. */
function estructura(page) {
  return page.evaluate(() => {
    const el = document.querySelector('[data-pace-sidebar]');
    if (!el) return null;
    return [...el.children].map(e => (
      e.matches('[data-pace-sidebar-accion]') ? 'ACCION'
      : e.getAttribute('data-pace-sidebar-toggle') !== null ? 'chevron'
      : e.getAttribute('data-pace-sidebar-logobar') !== null ? 'logo'
      : e.getAttribute('data-pace-sidebar-spacer') !== null ? 'spacer'
      : e.getBoundingClientRect().height <= 2 ? 'regla'
      : e.querySelector('[data-pace-hoy]') ? 'HOY'
      : e.querySelector('[data-pace-semana]') ? 'SEMANA'
      : e.tagName === 'P' ? 'vacio'
      : 'pie'
    )).filter(x => x !== 'chevron');
  });
}

function celda(page, modulo) {
  return page.evaluate(m => {
    const c = document.querySelector('[data-pace-hoy-celda][data-modulo="' + m + '"]');
    if (!c) return null;
    return { texto: c.innerText.replace(/\s+/g, ' ').trim(), cero: c.getAttribute('data-cero'), tag: c.tagName };
  }, modulo);
}

/* Siembra un `session.completed` REAL usando la fábrica de la app, no un objeto
   a mano: el almacén valida y un evento inventado se descarta en silencio --
   probado, y el primer intento midió una sidebar sin tarjeta creyendo que la
   tarjeta no funcionaba. */
async function sembrarSesion(page, routineId, modulo) {
  await page.evaluate(([rid, mod]) => {
    const ev = window.makeEvent({
      type: 'session.completed', context: 'standalone', runId: window.newEventId(),
      payload: {
        module: mod, routineId: rid, completionReason: 'natural',
        elapsedSeconds: 300, activeSeconds: 300, plannedSeconds: 300,
        plannedSecondsSource: 'declared', variant: null,
      },
    });
    window.paceEventsAppend(ev);
  }, [routineId, modulo]);
  /* LA ESCRITURA NO ES SINCRONA: `paceEventsAppend` pasa por la barrera del
     almacen y `localStorage` todavia esta a 0 en el mismo tick. Leerlo de
     inmediato devolvia 0 y me hizo creer que el evento se rechazaba. */
  await page.waitForFunction(
    () => (JSON.parse(localStorage.getItem('pace.events.v1') || '{}').events || []).length > 0,
    null, { timeout: 5000 });
  return page.evaluate(
    () => (JSON.parse(localStorage.getItem('pace.events.v1') || '{}').events || []).length);
}

/* ==========================================================================
   HOY
   ========================================================================== */

test('Hoy sale del estado: los cuatro valores y la meta de agua', async ({ page, context }) => {
  const errores = capturarErrores(page);
  /* Miércoles del array lunes-primero (índice 2). Se siembra la semana entera
     para que el índice importe: si alguien lo lee con `getDay()`, coge otro. */
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

  /* Y lo que se PINTA lleva la meta: «3 de 8», no «3». */
  const agua = await celda(page, 'water');
  expect(agua.texto).toContain('8');
  expect(agua.cero).toBe('0');

  expect(errores).toEqual([]);
});

test('el glifo se apaga cuando el valor es cero, y solo entonces', async ({ page, context }) => {
  await sembrar(context, Object.assign({}, ABIERTA, {
    weeklyStats: {
      focusMinutes:  [25, 25, 25, 25, 25, 25, 25],
      breathMinutes: [0, 0, 0, 0, 0, 0, 0],
      moveMinutes:   [0, 0, 0, 0, 0, 0, 0],
      waterGlasses:  [0, 0, 0, 0, 0, 0, 0],
    },
    water: { goal: 8, today: 0, lastReset: null },
  }));
  await irAlArtefacto(page);
  expect((await celda(page, 'focus')).cero).toBe('0');
  expect((await celda(page, 'breathe')).cero).toBe('1');
  expect((await celda(page, 'water')).cero).toBe('1');
});

test('Foco NO es un botón y los otros tres SÍ (no hay nada que abrir en Foco)', async ({ page, context }) => {
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);
  expect((await celda(page, 'focus')).tag).toBe('DIV');
  expect((await celda(page, 'breathe')).tag).toBe('BUTTON');
  expect((await celda(page, 'body')).tag).toBe('BUTTON');
  expect((await celda(page, 'water')).tag).toBe('BUTTON');
});

test('la celda de Respira no se llama igual que el chip de la home', async ({ page, context }) => {
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);
  /* Con el nombre a secas había DOS botones «Respira» y `getByRole` dejaba de
     ser único: 15 tests en rojo, ninguno del producto. La etiqueta dice lo que
     el botón hace y conserva el nombre visible dentro (WCAG 2.5.3). */
  await expect(page.getByRole('button', { name: /^Respira/ })).toHaveCount(1);
  await expect(sb(page).getByRole('button', { name: 'Abrir Respira' })).toHaveCount(1);
});

test('el «+1» de agua suma un vaso sin salir de la sidebar', async ({ page, context }) => {
  await sembrar(context, Object.assign({}, ABIERTA, { water: { goal: 8, today: 2, lastReset: null } }));
  await irAlArtefacto(page);
  await sb(page).locator('[data-pace-hoy-mas]').click();
  await expect.poll(() => page.evaluate(() => getState().water.today)).toBe(3);
});

/* ==========================================================================
   LA SEMANA
   ========================================================================== */

test('el agua sola NO enciende el día; foco, respira o cuerpo sí', async ({ page, context }) => {
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);
  const dias = await page.evaluate(() => {
    const solo = a => ({ focusMinutes: a[0], breathMinutes: a[1], moveMinutes: a[2], waterGlasses: a[3] });
    const uno = a => window.selectSidebarWeek({
      weeklyStats: {
        focusMinutes:  [solo(a).focusMinutes, 0, 0, 0, 0, 0, 0],
        breathMinutes: [solo(a).breathMinutes, 0, 0, 0, 0, 0, 0],
        moveMinutes:   [solo(a).moveMinutes, 0, 0, 0, 0, 0, 0],
        waterGlasses:  [solo(a).waterGlasses, 0, 0, 0, 0, 0, 0],
      },
    }).days[0].active;
    return {
      soloAgua:   uno([0, 0, 0, 8]),
      soloFoco:   uno([25, 0, 0, 0]),
      soloRespira:uno([0, 5, 0, 0]),
      soloCuerpo: uno([0, 0, 4, 0]),
      nada:       uno([0, 0, 0, 0]),
    };
  });
  expect(dias).toEqual({ soloAgua: false, soloFoco: true, soloRespira: true, soloCuerpo: true, nada: false });
});

test('la semana entera es UN objetivo y abre Estadísticas', async ({ page, context }) => {
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);
  const boton = sb(page).locator('[data-pace-semana]');
  await expect(boton).toHaveCount(1);
  /* Siete objetivos de 44 px no caben (7x44 = 308 y el ancho útil son 243), así
     que el bloque entero es el objetivo. Se comprueba que sea GRANDE. */
  const caja = await boton.boundingBox();
  expect(caja.width).toBeGreaterThan(200);
  expect(caja.height).toBeGreaterThan(44);
  await boton.click();
  await expect(page.locator('[data-pace-modal-title]')).toHaveText(/Ritmo|Estad|Stats/i);
});

/* ==========================================================================
   LA ACCIÓN PRINCIPAL
   ========================================================================== */

test('sin nada que continuar NO hay tarjeta, y tampoco su separador', async ({ page, context }) => {
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);
  await expect(sb(page).locator('[data-pace-sidebar-accion]')).toHaveCount(0);
  const orden = await estructura(page);
  expect(orden).not.toContain('ACCION');
  /* Ni una regla huérfana: dos seguidas significa que un bloque desapareció y
     su separador se quedó. */
  expect(orden.filter((x, i) => x === 'regla' && orden[i + 1] === 'regla')).toEqual([]);
});

test('con una sesión terminada la tarjeta dice REPETIR y nombra la rutina', async ({ page, context }) => {
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);
  expect(await sembrarSesion(page, 'breathe.box.4', 'breathe')).toBe(1);
  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });

  const tarjeta = sb(page).locator('[data-pace-sidebar-accion]');
  await expect(tarjeta).toHaveCount(1);
  await expect(tarjeta).toHaveAttribute('data-kind', 'repeat');
  await expect(tarjeta).toContainText('Box 4·4·4·4');
});

test('la tarjeta NUNCA sugiere: sin historial no ofrece nada', async ({ page, context }) => {
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);
  /* El selector es puro: se le puede preguntar directamente. Con estado vacío y
     sin eventos la respuesta es `null`, no una sugerencia. */
  const sinNada = await page.evaluate(() => window.selectSidebarPrimaryAction(getState(), { events: [] }));
  expect(sinNada).toBe(null);
});

/* ==========================================================================
   ORDEN, PIEL Y CAJÓN
   ========================================================================== */

test('escritorio: la acción va DESPUÉS de Hoy', async ({ page, context }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);
  await sembrarSesion(page, 'breathe.box.4', 'breathe');
  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });

  const orden = await estructura(page);
  expect(orden.indexOf('HOY')).toBeLessThan(orden.indexOf('ACCION'));
  expect(orden.filter((x, i) => x === 'regla' && orden[i + 1] === 'regla')).toEqual([]);
});

test('móvil: la acción va PRIMERA, y el cajón se cierra al elegir', async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);
  await sembrarSesion(page, 'breathe.box.4', 'breathe');
  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });

  const orden = await estructura(page);
  expect(orden.indexOf('ACCION')).toBeLessThan(orden.indexOf('HOY'));
  expect(orden.filter((x, i) => x === 'regla' && orden[i + 1] === 'regla')).toEqual([]);

  /* Y al elegir, el cajón se quita de en medio. */
  await sb(page).locator('[data-pace-hoy-celda][data-modulo="breathe"]').click();
  await expect(sb(page)).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => getState().sidebarCollapsed)).toBe(true);
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
   EL PIE Y EL ÚLTIMO LOGRO
   ========================================================================== */

test('sin logros el pie ofrece la colección; con uno, lo nombra', async ({ page, context }) => {
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);
  const vacio = sb(page).locator('[data-pace-sidebar-ultimo]');
  await expect(vacio).toHaveCount(1);
  await expect(vacio).toHaveAttribute('data-pace-sidebar-ultimo', '');
  await expect(vacio).toContainText('colección');

  await sembrarPisando(context, Object.assign({}, ABIERTA, {
    achievements: { 'first.sip': { unlockedAt: 1736120000000 } },
  }));
  await irAlArtefacto(page);
  const conUno = sb(page).locator('[data-pace-sidebar-ultimo]');
  await expect(conUno).toHaveAttribute('data-pace-sidebar-ultimo', 'first.sip');
  await expect(conUno).toContainText('Primer sorbo');
});

test('el último logro es el MÁS RECIENTE, no el primero del objeto', async ({ page, context }) => {
  await sembrarPisando(context, Object.assign({}, ABIERTA, {
    achievements: {
      'first.sip':    { unlockedAt: 1736120000000 },
      'first.return': { unlockedAt: 1736999999999 },
      'first.breath': { unlockedAt: 1736500000000 },
    },
  }));
  await irAlArtefacto(page);
  await expect(sb(page).locator('[data-pace-sidebar-ultimo]'))
    .toHaveAttribute('data-pace-sidebar-ultimo', 'first.return');
});

/* ==========================================================================
   INGLÉS
   ========================================================================== */

test('en inglés la sidebar dice lo suyo y no se queda con claves crudas', async ({ page, context }) => {
  await sembrarPisando(context, Object.assign({}, ABIERTA, { lang: 'en', langAuto: false }));
  await irAlArtefacto(page);
  const texto = await sb(page).innerText();
  expect(texto).toContain('TODAY');
  expect(texto).toContain('THIS WEEK');
  expect(texto).toMatch(/FOCUS|BREATHE|BODY|WATER/);
  /* Una clave sin traducir se pinta tal cual («sidebar.week.open»): si aparece
     un punto entre dos palabras minúsculas, algo se quedó sin resolver. */
  expect(texto).not.toMatch(/sidebar\.[a-z]/);
});
