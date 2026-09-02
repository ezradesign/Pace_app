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
   · QUE LA TARJETA SIEMPRE DIGA ALGO UTIL. La regla original de s180 --«solo
     CONTINUAR o REPETIR, nunca prueba esto»-- la ANULO el usuario en la misma
     s180 tras usarla: la tercera rama es PARA AHORA y reutiliza la regla de la
     biblioteca, con el pozo filtrado por `safety` y por `canAccessRoutine`.
     Lo que se vigila es ese FILTRO: la tarjeta no puede meter a nadie en apnea
     ni prometer una premium que no abre.
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

/* Clasifica las secciones de la sidebar en el orden en que estan en el DOM.
   `matches` y no `querySelector` para la tarjeta: el atributo está en ELLA
   MISMA, y buscar un descendiente la clasificaba como «pie» -- me dio un orden
   falso una vez.
   OJO AL NIVEL (s181): las secciones ya NO son hijas del `<aside>`. Cuelgan de
   `[data-pace-sidebar-escala]`, la envoltura que se escala para caber en
   cualquier alto, y esa a su vez de la lente que recorta su desborde. Leyendo
   los hijos del aside esto devolvia una lista de un solo elemento y CUATRO
   tests se ponian rojos sin que el producto tuviera nada. */
function estructura(page) {
  return page.evaluate(() => {
    const el = document.querySelector('[data-pace-sidebar-escala]');
    if (!el) return null;
    return [...el.children].map(e => (
      e.matches('[data-pace-sidebar-accion]') ? 'ACCION'
      : e.getAttribute('data-pace-sidebar-toggle') !== null ? 'chevron'
      : e.getAttribute('data-pace-sidebar-logobar') !== null ? 'logo'
      : e.getAttribute('data-pace-sidebar-spacer') !== null ? 'spacer'
      : e.getBoundingClientRect().height <= 2 ? 'regla'
      : e.querySelector('[data-pace-hoy]') ? 'HOY'
      : e.querySelector('[data-pace-semana]') ? 'SEMANA'
      : e.querySelector('[data-pace-sidebar-ultimo]') ? 'LOGRO'
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

test('la celda de Agua SUMA un vaso; las otras tres NAVEGAN', async ({ page, context }) => {
  /* Agua es la unica celda que ACTUA. El «+» que habia antes se retiro: era un
     segundo objetivo dentro de una celda de 117 px y ademas pisaba los ocho
     vasos 17,2 px. Se aserta tambien que ya NO existe, porque volver a meterlo
     seria repetir el defecto. */
  await sembrar(context, Object.assign({}, ABIERTA, { water: { goal: 8, today: 2, lastReset: null } }));
  await irAlArtefacto(page);
  await expect(sb(page).locator('[data-pace-hoy-mas]')).toHaveCount(0);

  await sb(page).locator('[data-pace-hoy-celda][data-modulo="water"]').click();
  await expect.poll(() => page.evaluate(() => getState().water.today)).toBe(3);
  /* Y no abre ningun modal: sumar no es navegar. */
  await expect(page.locator('[data-pace-modal-backdrop]')).toHaveCount(0);

  /* Su etiqueta dice lo que HACE, no «Abrir Agua». */
  await expect(sb(page).getByRole('button', { name: 'Añadir un vaso' })).toHaveCount(1);
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
     que el bloque entero es el objetivo. Se comprueba que sea GRANDE.
     Y SE MIDE A ESCALA 1 (s181). Desde que la sidebar encoge entera para caber,
     `boundingBox()` devuelve la caja YA ESCALADA: a 1280x720 este boton daba
     37,1 px y el aserto se ponia rojo sin que el diseno hubiera cambiado. Lo
     que este test defiende es el DISENO -- que el objetivo sea el bloque y no
     cada dia-- asi que se mide donde no hay escala. Que la escala no lo hunda
     por debajo del minimo de WCAG lo vigila `sidebar-altura.spec.js`. */
  await page.setViewportSize({ width: 1280, height: 1000 });
  const caja = await boton.boundingBox();
  expect(caja.width).toBeGreaterThan(200);
  expect(caja.height).toBeGreaterThan(44);
  await boton.click();
  await expect(page.locator('[data-pace-modal-title]')).toHaveText(/Ritmo|Estad|Stats/i);
});

/* ==========================================================================
   LA ACCIÓN PRINCIPAL
   ========================================================================== */

test('sin nada que continuar, la tarjeta SUGIERE -- y la sugerencia es SEGURA', async ({ page, context }) => {
  /* ESTO ANULA LA REGLA ORIGINAL DE s180 («si no hay nada, no hay tarjeta»).
     El usuario la reviso usandola y decidio lo contrario: «quiero que la
     tarjeta vaya cambiando para que tenga mas funcionalidades y asi no
     desaparezca si no se ha hecho nada».
     Lo que este aserto defiende AHORA no es que aparezca -- eso se ve-- sino
     lo que NO se ve: que lo que ofrece se pueda hacer. Una sugerencia con
     `safety: true` meteria a alguien en apnea sin haberlo pedido, y una
     premium bloqueada prometeria algo que no abre. */
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);

  const card = sb(page).locator('[data-pace-sidebar-accion]');
  await expect(card).toHaveCount(1);
  await expect(card).toHaveAttribute('data-kind', 'suggest');

  const seguro = await page.evaluate(() => {
    const t = document.querySelector('[data-pace-sidebar-accion] h4 button').textContent.trim();
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

  /* Y no deja reglas huerfanas al cambiar de rama. */
  const orden = await estructura(page);
  expect(orden.filter((x, i) => x === 'regla' && orden[i + 1] === 'regla')).toEqual([]);
});

test('la tarjeta ENTERA es clicable, no solo su titulo', async ({ page, context }) => {
  /* ESTUVO PUBLICADO ROTO y lo vio el usuario. El objetivo era el titulo --
     medido, **74 x 23 px** de una tarjeta de 243 x 98-- porque el patron de
     s174 necesita un `::after` absoluto y **React no crea pseudo-elementos
     desde un estilo en linea**: tiene que estar en la hoja. Se prueban las
     CUATRO esquinas y el centro, no un punto: con el `::after` mal medido
     (contra el <h4> en vez de contra la tarjeta) el centro pasaba y las
     esquinas de abajo no. */
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);
  await sembrarSesion(page, 'breathe.box.4', 'breathe');
  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });

  const r = await page.evaluate(() => {
    const c = document.querySelector('[data-pace-sidebar-accion]');
    const b = c.getBoundingClientRect();
    const puntos = [
      ['arriba-izq', b.left + 12, b.top + 8],
      ['arriba-dcha', b.right - 12, b.top + 8],
      ['centro', b.left + b.width / 2, b.top + b.height / 2],
      ['abajo-izq', b.left + 10, b.bottom - 8],
      ['abajo-dcha', b.right - 20, b.bottom - 10],
    ];
    return puntos.map(([n, x, y]) => {
      const el = document.elementFromPoint(x, y);
      return { punto: n, llega: !!(el && el.closest('button') && el.closest('[data-pace-sidebar-accion]')) };
    });
  });
  expect(r.filter(p => !p.llega), 'puntos de la tarjeta que NO llegan al boton').toEqual([]);

  /* Y el encabezado sigue siendo encabezado: el patron existe justamente para
     no perderlo (un `role="button"` en la tarjeta tumbo 9 tests en s174). */
  await expect(sb(page).locator('[data-pace-sidebar-accion] h4')).toHaveCount(1);
});

test('el selector es PURO: la sugerencia entra por parametro, no la elige el', async ({ page, context }) => {
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);
  /* El selector es puro: se le puede preguntar directamente. Con estado vacío y
     sin eventos la respuesta es `null`, no una sugerencia. */
  /* El selector sigue siendo puro: SIN sugerencia inyectada devuelve null. Es
     el orquestador quien la elige, porque hacerlo exige el catalogo y el guard
     de acceso. */
  const sinNada = await page.evaluate(() => window.selectSidebarPrimaryAction(getState(), { events: [] }));
  expect(sinNada).toBe(null);
  const conSugerencia = await page.evaluate(() =>
    window.selectSidebarPrimaryAction(getState(), { events: [], sugerencia: 'move.neck' }));
  expect(conSugerencia).toMatchObject({ kind: 'suggest', targetId: 'move.neck' });
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

test('el último logro tiene SECCIÓN con rótulo, y nombra el más reciente', async ({ page, context }) => {
  /* VIVIO BREVEMENTE EN EL PIE y el usuario lo reporto en produccion: ahi «se
     entiende raro», porque sin rotulo un titulo suelto al lado de «Apoyar
     PACE» no dice que es. El aserto del ROTULO es el que defiende ese arreglo:
     sin el, la seccion podria volver a degradarse a un enlace y nadie se
     enteraria. */
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);
  await expect(sb(page).getByText('Último logro', { exact: true })).toHaveCount(1);

  const vacio = sb(page).locator('[data-pace-sidebar-ultimo]');
  await expect(vacio).toHaveCount(1);
  await expect(vacio).toHaveAttribute('data-pace-sidebar-ultimo', '');
  await expect(vacio).toContainText('Aún no hay ninguno');

  await sembrarPisando(context, Object.assign({}, ABIERTA, {
    achievements: { 'first.sip': { unlockedAt: 1736120000000 } },
  }));
  await irAlArtefacto(page);
  const conUno = sb(page).locator('[data-pace-sidebar-ultimo]');
  await expect(conUno).toHaveAttribute('data-pace-sidebar-ultimo', 'first.sip');
  await expect(conUno).toContainText('Primer sorbo');
  /* Y la coleccion sigue accesible desde el pie, que es otra cosa. */
  await expect(sb(page).getByRole('button', { name: 'Ver la colección' })).toHaveCount(1);
});

test('el orden es Esta semana · Hoy · Continúa · Último logro', async ({ page, context }) => {
  /* Orden elegido por el usuario mirandolo: «Esta semana» ABRE la columna con
     sus dos reglas y el ultimo logro CIERRA. Se aserta la SECUENCIA entera y
     no solo un par: mover una seccion sin darse cuenta es exactamente el
     fallo que este aserto tiene que cazar -- ya lo cazo una vez. */
  await page.setViewportSize({ width: 1280, height: 900 });
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);
  await sembrarSesion(page, 'breathe.box.4', 'breathe');
  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });

  const orden = (await estructura(page)).filter(x => x !== 'regla' && x !== 'spacer');
  expect(orden).toEqual(['logo', 'SEMANA', 'HOY', 'ACCION', 'LOGRO', 'pie']);
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
  /* «THIS WEEK» ya no se pinta: el rotulo de la semana se retiro y quedan solo
     los puntos con la inicial de cada dia. El nombre sigue vivo donde importa
     para quien no ve la pantalla -- el `aria-label` del boton-- y eso es lo
     que se aserta ahora. */
  await expect(sb(page).getByRole('button', { name: /week|Stats/i })).toHaveCount(1);
  expect(texto).toMatch(/FOCUS|BREATHE|BODY|WATER/);
  /* Una clave sin traducir se pinta tal cual («sidebar.week.open»): si aparece
     un punto entre dos palabras minúsculas, algo se quedó sin resolver. */
  expect(texto).not.toMatch(/sidebar\.[a-z]/);
});
