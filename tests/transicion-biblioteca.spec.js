/* PACE · tests/transicion-biblioteca.spec.js (s174, REESCRITO en s175)
   =====================================================================
   ESTE ARCHIVO DEFENDÍA LA TRANSICIÓN Y AHORA DEFIENDE SU AUSENCIA, y conviene
   saber por qué antes de leerlo:

   s174 hizo volar la capitular de la tarjeta hasta un círculo con el arte de la
   rutina en la pantalla de preparación. s175 quita ese arte por decisión del
   usuario —«el prepárate no debería tener ningún glifo, sólo el contador
   regresivo», mirándolo en Mueve y Estira—, y con él desaparece el único
   destino que el vuelo podía tener: `paceVueloDestino()` busca
   `[data-pace-session-prep-art]`, no lo encuentra y se retira sin ruido.

   LO QUE SE BORRÓ DE AQUÍ, para que no parezca un descuido: los tres tests del
   vuelo (clon a medio camino, destino oculto, limpieza al terminar) y el que
   comparaba el círculo de la preparación con el del paso. No fallaban por un
   defecto: fallaban porque afirmaban de un producto que ya no existe.

   LO QUE SÍ SIGUE IMPORTANDO, y es lo que hay debajo: que al tocar una tarjeta
   se ENTRE en la sesión, que la preparación sea sólo el contador en las tres
   bibliotecas, y que no quede ni un clon suelto por el camino. Nada de esto se
   ve leyendo el código: `library-transition.js` sigue cargado y es inerte, así
   que si algún día volviera a encontrar destino, el último test lo diría.
*/
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, overlaySuperior } = require('./helpers');

/* Abre la biblioteca y lanza la PRIMERA tarjeta que se ve. «La que se ve» y no
   «la primera»: cada pieza de la biblioteca existe DOS veces en el DOM —lateral
   de escritorio y bloque de móvil— y la hoja apaga la que sobra, así que un
   `querySelector` a secas devuelve la copia apagada, de ancho 0. */
async function lanzarPrimera(page, boton) {
  await page.getByRole('button', { name: boton }).first().click();
  await page.locator('.pace-lib').waitFor({ state: 'visible' });
  const id = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('.pace-lib .pace-lib-hit'))
      .find(e => e.getBoundingClientRect().width > 0);
    if (!b) return null;
    b.click();
    return b.closest('[data-pace-lib-card]').getAttribute('data-pace-lib-card');
  });
  expect(id).toBeTruthy();
  await overlaySuperior(page).getByRole('button', { name: 'Empezar', exact: true }).click();
  return id;
}

/* Lo que la preparación enseña, sea de la biblioteca que sea. */
function radiografiaPrep(page) {
  return page.evaluate(() => {
    const num = document.querySelector('[data-pace-session-prep-num]');
    if (!num) return null;
    return {
      arte: document.querySelectorAll('[data-pace-session-prep-art]').length,
      enArte: num.getAttribute('data-pace-prep-en-arte'),
      numero: (num.textContent || '').trim(),
      fontSize: getComputedStyle(num).fontSize,
      /* cualquier círculo grande que quedara suelto en la pantalla */
      circulos: Array.from(document.querySelectorAll('[data-pace-session-prep] div'))
        .filter(d => getComputedStyle(d).borderRadius === '50%'
                     && d.getBoundingClientRect().width > 80).length,
    };
  });
}

test.beforeEach(async ({ context }) => { await sembrar(context); });

for (const [cual, boton] of [['Estira', /^Estira/], ['Mueve', /^Mueve/]]) {
  test('la preparación de ' + cual + ' es SÓLO el contador, sin glifo', async ({ page }) => {
    await irAlArtefacto(page);
    await lanzarPrimera(page, boton);
    const sesion = page.locator('[data-pace-session-root]');
    await expect(sesion.getByText('PREPÁRATE')).toBeVisible();
    const r = await radiografiaPrep(page);
    expect(r).not.toBeNull();
    /* GUARD DE CERO: sin esto, una pantalla que no montara NADA pasaría los
       tres asertos de abajo por vacía. */
    expect(r.numero.length).toBeGreaterThan(0);
    expect(r.arte).toBe(0);
    expect(r.enArte).toBeNull();
    expect(r.circulos).toBe(0);
  });
}

test('las tres bibliotecas comparten la MISMA preparación', async ({ page }) => {
  /* RELACIONAL a propósito: no se escribe aquí ningún tamaño de numeral. Lo que
     se exige es que el cuerpo y la respiración enseñen la misma pantalla, que es
     la decisión de s175 -- y eso sobrevive a que mañana se cambie el 200 px. */
  await irAlArtefacto(page);
  await lanzarPrimera(page, /^Estira/);
  await expect(page.locator('[data-pace-session-root]').getByText('PREPÁRATE')).toBeVisible();
  const cuerpo = await radiografiaPrep(page);

  await page.reload();
  await page.getByRole('button', { name: /^Respira/ }).first().click();
  await page.locator('.pace-lib').waitFor({ state: 'visible' });
  /* una SIN modal de seguridad (las 6 con `safety` abren guía antes) */
  await page.getByRole('heading', { name: 'Diafragmática', exact: true }).click();
  await expect(page.locator('[data-pace-session-root]').getByText('PREPÁRATE')).toBeVisible();
  const respira = await radiografiaPrep(page);

  expect(cuerpo).not.toBeNull();
  expect(respira).not.toBeNull();
  expect(cuerpo.fontSize).toBe(respira.fontSize);
  expect(cuerpo.arte).toBe(respira.arte);
  expect(cuerpo.circulos).toBe(respira.circulos);
  /* control positivo: que el numeral EXISTA de verdad en las dos, o «iguales»
     sería cierto comparando dos pantallas vacías */
  expect(parseFloat(cuerpo.fontSize)).toBeGreaterThan(40);
});

test('no queda ningún clon del vuelo: la transición ya no tiene dónde aterrizar', async ({ page }) => {
  /* `library-transition.js` sigue cargado y sin destino. Está escrito para
     retirarse en silencio, y esto lo comprueba en vez de confiar: si algún día
     volviera a encontrar dónde aterrizar, o si dejara un clon huérfano pegado al
     `<body>`, aquí saltaría. */
  await irAlArtefacto(page);
  await lanzarPrimera(page, /^Estira/);
  await expect(page.locator('[data-pace-session-root]').getByText('PREPÁRATE')).toBeVisible();
  await page.waitForTimeout(1200);   /* más que PACE_VUELO_MS + su red de 400 */
  expect(await page.locator('[data-pace-vuelo]').count()).toBe(0);
  /* y la sesión ha entrado igual, que es lo único que la transición no podía
     poner en riesgo */
  await expect(page.locator('[data-pace-session-root]')).toBeVisible();
});

test('con reduced-motion la sesión entra igual', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await irAlArtefacto(page);
  await lanzarPrimera(page, /^Estira/);
  await expect(page.locator('[data-pace-session-root]').getByText('PREPÁRATE')).toBeVisible();
  expect(await page.locator('[data-pace-vuelo]').count()).toBe(0);
  const r = await radiografiaPrep(page);
  expect(r).not.toBeNull();
  expect(r.arte).toBe(0);
});
