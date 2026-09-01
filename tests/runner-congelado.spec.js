/* PACE · tests/runner-congelado.spec.js (sesión 177)
   ==================================================
   LA PANTALLA DEL RUNNER NO SE MUEVE. Lo reportó el usuario mirando la app, en
   dos partes: «la barra de progreso de este ejercicio se superpone con las
   letras» y «entre paso y paso de ejercicio no debe haber ningún salto visual
   de elemento, barra de progreso o posición del texto».

   MEDIDO ANTES DE TOCAR NADA, a 1536x714 (su pantalla), censando las 28 rutinas
   de Mueve y Estira paso a paso:
     · el «Cuídate» se metía 15,0 px DENTRO de la barra, en 11 de 47 pasos y en
       7 de las 16 rutinas libres
     · entre «colócate» y «ejercicio» se movían el nombre y la descripción
       26,4 px (el rótulo de fase vacío, que a esa altura no se reservaba), el
       número 51,2 y su etiqueta 4,6 -- y el número cambiaba de 56 a 104 px

   POR QUÉ MERECE DOS ASERTOS. El primero, porque el solape lo causó un arreglo:
   s176 ancló la barra dándole al bloque `flex: 1 1 auto; min-height: 0`, y eso
   le permite ENCOGER por debajo de su contenido -- el bloque encoge, el texto
   no, y el texto pinta encima. Nada en el CSS dice que eso esté pasando.
   El segundo, porque el congelado se sostiene sobre SIETE reservas que se
   pisan entre sí con `!important` a igual especificidad: reservar 41 px de más
   en la cola convirtió el solape de 15,0 en 27,0 durante la propia sesión, y
   sólo lo dijo el censo.

   s179 · YA SI CUBRE MOVIL Y ALTURAS BAJAS, y hasta hoy esta cabecera decia lo
   contrario con razon. El bloque de abajo corre el mismo aserto a 360x640, a
   375x667 (el iPhone SE/8) y a 360x600. Medido antes de arreglar, a 360x640 el
   texto se metia dentro de la barra en 16 de las 19 rutinas recorribles y en 60
   de sus 79 pasos, con 70,0 px en el peor caso.

   NO CUBRE: por debajo de ~575 px de alto en movil SIGUE SOLAPANDO, y esta
   declarado y no olvidado -- lo unico que queda por encoger ahi es el glifo (123
   px a esa altura) y la fuente unica de s177 PROHIBE encogerlo por CSS solo en el
   runner: el circulo de la sesion dejaria de relevar al de la preparacion, que es
   arreglar un salto creando otro. Tampoco cubre el -support-strong de las
   pantallas de cambio de lado, que sigue moviendose 99,7 px entre pasos.
*/
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

/* Las siete piezas, con el nombre con el que se reportan al fallar. El número
   se busca por `-num` y NO por `-timer`: la pantalla de colocarse pinta su
   cuenta atrás con OTRO elemento, y mirando sólo el timer el aserto daría
   verde sin haber comparado la pieza que más se movía. */
const PIEZAS = [
  ['el glifo', '[data-pace-v1-glyph]'],
  ['el nombre', '[data-pace-v1-name]'],
  ['la descripción', '[data-pace-v1-cue]'],
  ['el número', '[data-pace-v1-num]'],
  ['la etiqueta del número', '[data-pace-v1-numlabel]'],
  ['la barra', '[data-pace-v1-progress]'],
];

/* EL PULSO SE CONGELA PARA MEDIR. En las reps guiadas el número lleva
   `pace-rep-pulse`, que anima `scale` (s113), y `getBoundingClientRect()`
   devuelve la caja YA TRANSFORMADA: midiendo en vivo, la misma cifra de 76 px
   daba 72,2 en una pantalla y 65,0 en la otra, y eso se lee como un salto de
   layout que no existe. Lo que este test defiende es la COLOCACIÓN; que el
   número lata es otra cosa y es deliberada. */
async function congelarPulso(page) {
  await page.addStyleTag({ content: '[data-pace-v1-timer]{animation:none !important}' });
}

async function medir(page, piezas) {
  return page.evaluate((ps) => {
    const vis = (s) => [...document.querySelectorAll(s)]
      .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; })[0] || null;
    const out = { piezas: {}, solape: 0, quien: '' };
    for (const [nom, sel] of ps) {
      const e = vis(sel);
      if (!e) continue;
      const r = e.getBoundingClientRect();
      out.piezas[nom] = {
        top: Math.round(r.top * 10) / 10,
        alto: Math.round(r.height * 10) / 10,
        px: Math.round(parseFloat(getComputedStyle(e).fontSize) * 10) / 10,
      };
    }
    /* EL SOLAPE SE MIDE CONTRA LOS HIJOS, no contra la caja del bloque: con
       `min-height: 0` el bloque informa de su alto YA ENCOGIDO, así que dice
       que todo cabe mientras el texto se sale por abajo. */
    const barra = vis('[data-pace-v1-progress]');
    const cuerpo = vis('[data-pace-v1-body]');
    if (barra && cuerpo) {
      const rb = barra.getBoundingClientRect();
      for (const e of cuerpo.querySelectorAll('*')) {
        const r = e.getBoundingClientRect();
        if (!(r.width > 0 && r.height > 0)) continue;
        if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
        if (r.bottom - rb.top > out.solape) {
          out.solape = Math.round((r.bottom - rb.top) * 10) / 10;
          out.quien = (e.textContent || '').trim().slice(0, 40);
        }
      }
    }
    return out;
  }, piezas);
}

async function abrirRutina(page, biblioteca, patron) {
  await page.getByRole('button', { name: biblioteca }).first().click();
  await page.locator('.pace-lib').waitFor({ state: 'visible' });
  await page.waitForTimeout(500);
  await page.evaluate((p) => {
    const t = [...document.querySelectorAll('[data-pace-lib-card] .pace-lib-hit')]
      .filter(e => e.getBoundingClientRect().width > 0)
      .find(e => new RegExp(p, 'i').test(e.textContent || ''));
    if (!t) throw new Error('no encuentro la rutina ' + p);
    t.click();
  }, patron);
  await page.waitForTimeout(900);
  /* Acotado al ÚLTIMO modal: «Empezar» a secas encuentra el «Empezar foco» de
     la home y arranca el Pomodoro, y el preview se abre ENCIMA de la
     biblioteca con los dos en el DOM (s176). */
  await page.evaluate(() => {
    const ms = [...document.querySelectorAll('[data-pace-modal-card]')]
      .filter(e => e.getBoundingClientRect().width > 0);
    const raiz = ms.length ? ms[ms.length - 1] : document;
    const b = [...raiz.querySelectorAll('button')]
      .filter(x => x.getBoundingClientRect().width > 0)
      .find(x => /Empezar/i.test(x.textContent || ''));
    if (!b) throw new Error('no encuentro el «Empezar» del preview');
    b.click();
  });
  await page.locator('[data-pace-v1-body]').first().waitFor({ state: 'visible', timeout: 25000 });
  await page.waitForTimeout(400);
}

const hayContador = (page) => page.evaluate(() =>
  [...document.querySelectorAll('[data-pace-v1-timer]')].some(e => e.getBoundingClientRect().width > 0));

test.describe('el runner no se mueve entre pantallas', () => {
  test.use({ viewport: { width: 1536, height: 714 } });

  test('ni una letra se mete dentro de la barra de progreso', async ({ page, context }) => {
    await sembrar(context);
    await irAlArtefacto(page);
    /* «Hombros · círculos» Y NO «Flexiones de escritorio», que es la que
       fotografió el usuario: en las rutinas de REPS la pantalla de trabajo no
       tiene botón «Siguiente» -- son «Anterior · Pausar · Terminar antes»-- así
       que el bucle avanzaba un paso y el test habría salido verde habiendo
       comprobado una sola pantalla. Lo dijo el guard de cero de abajo, no una
       lectura. Ésta se recorre entera y tenía 2 pasos con solape de los 9. */
    await abrirRutina(page, 'Estira', 'rculos');
    await congelarPulso(page);

    /* Se recorre la rutina entera: el defecto no estaba en todos los pasos --
       eran 11 de 47-- así que mirar sólo el primero puede salir verde con el
       defecto vivo dos pasos más allá. */
    let pasos = 0;
    for (let i = 0; i < 12; i++) {
      const m = await medir(page, PIEZAS);
      pasos++;
      expect(m.solape, 'en el paso ' + pasos + ' el texto «' + m.quien + '» se mete dentro de la barra')
        .toBeLessThanOrEqual(0);
      const sigue = await page.evaluate(() => {
        const pie = document.querySelector('[data-pace-session-footer]');
        const b = [...(pie || document).querySelectorAll('button')]
          .filter(x => x.getBoundingClientRect().width > 0)
          .find(x => /Siguiente|Empezar|Terminar/i.test(x.textContent || ''));
        if (!b || /Terminar/i.test(b.textContent || '')) return false;
        b.click(); return true;
      });
      if (!sigue) break;
      await page.waitForTimeout(350);
    }
    /* GUARD DE CERO: si la rutina no avanzó, el bucle habría comprobado una
       pantalla y salido verde. El fallo por omisión no se ve leyendo (s169). */
    expect(pasos, 'la rutina no avanzó: el test no ha comprobado casi nada').toBeGreaterThanOrEqual(3);
  });

  test('las seis piezas quedan en el mismo sitio y al mismo tamaño al cambiar de pantalla', async ({ page, context }) => {
    await sembrar(context);
    await irAlArtefacto(page);
    /* «FLEXIONES DE ESCRITORIO» A PROPÓSITO, y esto lo decidió un mutante que
       NO mordió. Con «Hombros · círculos» las tres primeras versiones de este
       test salían verdes incluso quitando la reserva de la descripción: en esa
       rutina el texto ocupa las mismas líneas en las dos pantallas, así que no
       había nada que la reserva pudiera estar sujetando. Aquí son 3 líneas al
       colocarse y 2 al trabajar -- 24,8 px-- que es el caso que el arreglo
       tiene que aguantar. Un aserto que sólo pasa por rutinas fáciles no
       prueba el mecanismo, prueba la rutina. */
    await abrirRutina(page, 'Mueve', 'Flexiones de escritorio');
    await congelarPulso(page);

    /* Esta rutina empieza por la pantalla de COLOCARSE, así que el orden de la
       comparación es el inverso. Lo que importa es que las dos existan. */
    expect(await hayContador(page), 'la primera pantalla no es la de colocarse').toBe(false);
    const colocate = await medir(page, PIEZAS);

    await page.evaluate(() => {
      const pie = document.querySelector('[data-pace-session-footer]');
      const b = [...(pie || document).querySelectorAll('button')]
        .filter(x => x.getBoundingClientRect().width > 0)
        .find(x => /Siguiente|Empezar ya/i.test(x.textContent || ''));
      if (b) b.click();
    });
    await page.waitForTimeout(900);
    /* GUARD: si el paso siguiente no pintara contador, el test compararía dos
       pantallas iguales y saldría verde por vacuidad. */
    expect(await hayContador(page), 'el paso siguiente no es una pantalla de trabajo: no se compara nada')
      .toBe(true);
    await congelarPulso(page);
    const trabajo = await medir(page, PIEZAS);

    for (const [nom] of PIEZAS) {
      const a = trabajo.piezas[nom], b = colocate.piezas[nom];
      /* GUARD: la pieza tiene que existir en las DOS. Si falta en una, saltarla
         en silencio es exactamente el fallo que dejó pasar el salto de 51,2 px
         del número: el banco medía cuatro piezas y decía «salto 0». */
      expect(a, 'no encuentro ' + nom + ' en la pantalla de ejercicio').toBeTruthy();
      expect(b, 'no encuentro ' + nom + ' en la pantalla de colocarse').toBeTruthy();
      /* 1,5 px de tolerancia: el reparto de `margin: auto` deja un píxel impar
         suelto. El defecto medía de 4,6 a 51,2 px, así que no se cuela. */
      expect(Math.abs(a.top - b.top), nom + ' se desplaza al cambiar de pantalla')
        .toBeLessThanOrEqual(1.5);
      expect(Math.abs(a.px - b.px), nom + ' cambia de tamaño al cambiar de pantalla')
        .toBeLessThanOrEqual(0.5);
    }
  });

  test('el número queda a la misma distancia de la descripción que de la barra', async ({ page, context }) => {
    await sembrar(context);
    await irAlArtefacto(page);
    await abrirRutina(page, 'Mueve', 'Flexiones de escritorio');
    await congelarPulso(page);

    const huecos = await page.evaluate(() => {
      const vis = (s) => [...document.querySelectorAll(s)]
        .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; })[0] || null;
      const cue = vis('[data-pace-v1-cue]'), num = vis('[data-pace-v1-num]');
      const barra = vis('[data-pace-v1-progress]'), cuerpo = vis('[data-pace-v1-body]');
      if (!cue || !num || !barra || !cuerpo) return null;
      const cola = cuerpo.lastElementChild;
      return {
        arriba: Math.round((num.getBoundingClientRect().top - cue.getBoundingClientRect().bottom) * 10) / 10,
        abajo: Math.round((barra.getBoundingClientRect().top - cola.getBoundingClientRect().bottom) * 10) / 10,
      };
    });
    expect(huecos, 'no encuentro las piezas para medir los huecos').not.toBeNull();
    /* Los dos huecos son los dos `margin: auto`, así que la igualdad es por
       construcción y no un ajuste: 2 px de tolerancia por el píxel impar.
       Antes del arreglo eran 10,0 arriba y -15,0 abajo. */
    expect(Math.abs(huecos.arriba - huecos.abajo),
      'el número no está equidistante: ' + huecos.arriba + ' arriba contra ' + huecos.abajo + ' abajo')
      .toBeLessThanOrEqual(2);
    /* Y que los huecos EXISTAN: dos ceros también serían «iguales». */
    expect(huecos.arriba, 'no hay aire entre la descripción y el número').toBeGreaterThan(2);
  });
});

/* ══ s179 · LO MISMO, PERO EN MOVIL Y EN POCA ALTURA ═══════════════════════════

   POR QUE UN describe APARTE Y NO UN VIEWPORT MAS: la piel de movil es otra y el
   ancho tambien aprieta -- a 360 px el nombre envolvia a DOS lineas donde en
   escritorio cabe en una, y esa es media causa del defecto.

   LOS TRES VIEWPORTS NO SON DECORATIVOS. 360x640 es el Android pequenio clasico;
   375x667 es el iPhone SE/8, y entro en la lista porque el primer arreglo de esta
   sesion puso el umbral en 660 mirando SOLO 360x640 y dejo 667 fuera con 7,2 px
   de solape sin ningun tramo que lo cubriera; 360x600 es lo que le queda a un
   movil de 640 cuando el navegador se come su barra.

   SE RECORRE UNA RUTINA CON MUCHOS PASOS: el censo dijo que el texto que se
   metia era el de COLOCARSE en 4 de los 5 casos que quedaban, y esa pantalla
   solo aparece al entrar en cada ejercicio. */
test.describe('el runner tampoco solapa en movil corto', () => {
  for (const [w, h, quien] of [[360, 640, 'Android pequenio'],
                               [375, 667, 'iPhone SE/8'],
                               [360, 600, 'con la barra del navegador']]) {
    test.describe(w + 'x' + h + ' - ' + quien, () => {
      test.use({ viewport: { width: w, height: h } });
      test('ni una letra se mete dentro de la barra de progreso', async ({ page, context }) => {
        await sembrar(context);
        await irAlArtefacto(page);
        await abrirRutina(page, 'Estira', 'rculos');
        await congelarPulso(page);

        let pasos = 0;
        for (let i = 0; i < 12; i++) {
          const m = await medir(page, PIEZAS);
          pasos++;
          expect(m.solape, 'a ' + w + 'x' + h + ', en el paso ' + pasos + ' el texto "' +
            m.quien + '" se mete dentro de la barra').toBeLessThanOrEqual(0);
          const sigue = await page.evaluate(() => {
            const pie = document.querySelector('[data-pace-session-footer]');
            const b = [...(pie || document).querySelectorAll('button')]
              .filter(x => x.getBoundingClientRect().width > 0)
              .find(x => /Siguiente|Empezar|Terminar/i.test(x.textContent || ''));
            if (!b || /Terminar/i.test(b.textContent || '')) return false;
            b.click(); return true;
          });
          if (!sigue) break;
          await page.waitForTimeout(350);
        }
        /* GUARD DE CERO, y aqui es MAS necesario que arriba: si la rutina no
           arranca en un viewport corto, el bucle mide una pantalla y sale verde
           con el defecto vivo. Cero y no-he-medido se parecen demasiado (s169). */
        expect(pasos, 'la rutina no avanzo: el test no ha comprobado casi nada')
          .toBeGreaterThanOrEqual(3);
      });
    });
  }
});
