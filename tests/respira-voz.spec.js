/* PACE · tests/respira-voz.spec.js (sesión 175)
   ==============================================
   LA VOZ DE RESPIRA. Lo que defiende, y por qué cada cosa merece un aserto:

   · QUE LA DECISIÓN SEA **POR FASE**. Es lo único que impide que una locución se
     pise con la señal siguiente, y no se ve mirando: en una rutina de bombeo
     (fases de 1 s) la voz tiene que callarse y dejar sonar el sintetizador.
   · QUE SE MIDA LA **PALABRA** Y NO EL ARCHIVO. Los MP3 llevan silencio a los dos
     lados —el «exhala» ocupa 4,96 s y la palabra acaba a los 2,12— y medir el
     archivo me hizo publicar dos cifras falsas seguidas. Si alguien vuelve a
     comparar contra `audio.duration`, este archivo se pone rojo.
   · QUE LA SEÑAL NO LLEGUE TARDE. Hay hasta 0,65 s de silencio ANTES de la
     palabra; el clip entra por donde empieza la voz, no por el principio.

   NO CUBRE: si la voz SUENA. Playwright no escucha. Lo que se comprueba es la
   decisión y el punto de entrada, que es donde estaban los errores.
*/
const { test, expect } = require('@playwright/test');
const { sembrar, sembrarPisando, irAlArtefacto } = require('./helpers');

const { fasesPorRutina } = require('./respira-fases');

test.beforeEach(async ({ context }) => { await sembrar(context); });

test('los tres clips cargan, y lo que se mide es la PALABRA y no el archivo', async ({ page }) => {
  await irAlArtefacto(page);
  const r = await page.evaluate(async () => {
    if (typeof paceVozInit !== 'function') return { error: 'el módulo de voz no cargó' };
    const v = paceVozInit();
    /* los clips se marcan listos en `canplaythrough`; se espera a eso, no a un
       plazo inventado */
    const hasta = Date.now() + 6000;
    while (Date.now() < hasta && !Object.keys(v).every(k => v[k].listo)) {
      await new Promise(res => setTimeout(res, 100));
    }
    return {
      clips: Object.keys(v).map(k => ({
        senal: k, listo: v[k].listo, ini: v[k].ini, palabra: v[k].palabra,
        /* `PACE_VOZ_CLIPS` va por idioma y por voz: se pide la activa en el
           idioma activo, que es la que `paceVozInit` acaba de precargar. */
        archivo: window.PACE_VOZ_CLIPS[window.paceVozIdioma()][window.paceVozActiva()][k].dur,
      })),
      margen: window.PACE_VOZ_MARGEN,
    };
  });
  expect(r.error).toBeUndefined();
  /* GUARD DE CERO: sin clips, todo lo de abajo cruzaría conjuntos vacíos. */
  expect(r.clips.length).toBe(3);
  for (const c of r.clips) {
    expect(c.listo, c.senal + ' no llegó a listo').toBe(true);
    expect(c.palabra).toBeGreaterThan(0);
    /* LA PALABRA ES MÁS CORTA QUE EL ARCHIVO. Es el aserto que se pone rojo si
       alguien vuelve a medir el contenedor: hoy la diferencia va de 1,2 s en el
       «mantén» a 3,5 s en el «exhala». */
    expect(c.palabra, c.senal + ': la palabra no puede durar lo que el archivo')
      .toBeLessThan(c.archivo);
  }
  /* Y AL MENOS UNO ENTRA TARDE en el archivo: por eso se busca el inicio de la
     voz en vez de reproducir desde cero. */
  expect(Math.max.apply(null, r.clips.map(c => c.ini))).toBeGreaterThan(0.2);
});

test('la voz se decide POR FASE: calla en 1 s y canta a partir de 2', async ({ page }) => {
  await irAlArtefacto(page);
  const r = await page.evaluate(async () => {
    const v = paceVozInit();
    const hasta = Date.now() + 6000;
    while (Date.now() < hasta && !Object.keys(v).every(k => v[k].listo)) {
      await new Promise(res => setTimeout(res, 100));
    }
    const senales = ['breathe.inhale', 'breathe.hold', 'breathe.exhale'];
    const en = seg => senales.map(s => paceVozCabe(s, seg));
    return { unSeg: en(1), dosSeg: en(2), seisSeg: en(6), sinFase: en(undefined) };
  });
  /* En bombeo (1 s) no canta NINGUNA: ahí la palabra se pisaría con la
     siguiente, y son 60 respiraciones en 3 minutos. */
  expect(r.unSeg).toEqual([false, false, false]);
  /* A partir de 2 s caben las tres: es lo que lleva la voz a 17 de las 20. */
  expect(r.dosSeg).toEqual([true, true, true]);
  expect(r.seisSeg).toEqual([true, true, true]);
  /* Y NO SABER LA FASE NO ES QUE SÍ: sin duración se cae al sintetizador. */
  expect(r.sinFase).toEqual([false, false, false]);
});

test('la palabra cabe en la fase más corta de 17 de las 20 rutinas', async ({ page }) => {
  const rutinas = fasesPorRutina();
  await irAlArtefacto(page);
  const veredicto = await page.evaluate(async (lista) => {
    const v = paceVozInit();
    const hasta = Date.now() + 6000;
    while (Date.now() < hasta && !Object.keys(v).every(k => v[k].listo)) {
      await new Promise(res => setTimeout(res, 100));
    }
    return lista.map(function (r) {
      return {
        id: r.id,
        cabe: ['breathe.inhale', 'breathe.hold', 'breathe.exhale']
          .every(function (s) { return paceVozCabe(s, r.min); }),
      };
    });
  }, rutinas);
  const caben = veredicto.filter(x => x.cabe);
  const fuera = veredicto.filter(x => !x.cabe).map(x => x.id).sort();
  /* RELACIONAL: la cuenta sale de cruzar el catálogo REAL con la decisión del
     producto. Si mañana se acorta el «exhala», este número sube y el test lo
     dice en vez de callar. */
  expect(veredicto.length).toBe(20);
  expect(caben.length).toBe(17);
  /* Y las tres que quedan fuera son EXACTAMENTE las de bombeo. Sin esta línea,
     «17 de 20» sería cierto aunque cayeran las tres equivocadas. */
  expect(fuera).toEqual(['breathe.bellows', 'breathe.kapalabhati', 'breathe.physiological']);
});

/* ── s176 · LA VOZ TIENE INTERRUPTOR Y SON DOS ───────────────────────────── */

/* Espera a que los clips de la voz ACTIVA estén listos. Se repite en los tres
   tests de abajo y en los de arriba: `canplaythrough` es lo único que dice que
   se puede contestar de forma síncrona, y esperar un plazo inventado deja el
   test verde por accidente en una máquina rápida. */
const ESPERA_CLIPS = `async () => {
  const v = paceVozInit(paceVozActiva());
  const hasta = Date.now() + 6000;
  while (Date.now() < hasta && !Object.keys(v).every(k => v[k].listo)) {
    await new Promise(res => setTimeout(res, 100));
  }
  return Object.keys(v).every(k => v[k].listo);
}`;

test('el interruptor apaga la VOZ sin apagar el sonido', async ({ page, context }) => {
  await sembrarPisando(context, { voiceOn: false });
  await irAlArtefacto(page);
  const r = await page.evaluate(async (espera) => {
    const listo = await (new Function('return (' + espera + ')'))()();
    const senales = ['breathe.inhale', 'breathe.hold', 'breathe.exhale'];
    return {
      listo,
      /* seis segundos: una fase donde la voz cabría de sobra */
      cabe: senales.map(s => paceVozCabe(s, 6)),
      encendida: paceVozEncendida(),
      sonido: getState().soundOn,
    };
  }, ESPERA_CLIPS);
  /* GUARD: si los clips no cargaran, «no canta» sería cierto por la razón
     equivocada y el test pasaría sin probar el interruptor. */
  expect(r.listo, 'los clips no llegaron a listo: el test no prueba nada').toBe(true);
  expect(r.encendida).toBe(false);
  expect(r.cabe, 'con la voz apagada no puede cantar ninguna señal').toEqual([false, false, false]);
  /* Y LO QUE ARREGLA ESTE INTERRUPTOR: el sonido sigue encendido. Hasta s175 la
     única forma de quitarse la voz era silenciarlo todo. */
  expect(r.sonido, 'apagar la voz no puede apagar el sonido').toBe(true);
});

test('la voz elegida es la que se pide: el clip cambia de archivo', async ({ page, context }) => {
  await sembrarPisando(context, { voice: 'bradford' });
  await irAlArtefacto(page);
  const r = await page.evaluate(async (espera) => {
    const listo = await (new Function('return (' + espera + ')'))()();
    const v = paceVozInit(paceVozActiva());
    return {
      listo,
      activa: paceVozActiva(),
      fuentes: Object.keys(v).map(k => (v[k].audio && v[k].audio.src) || ''),
    };
  }, ESPERA_CLIPS);
  expect(r.listo).toBe(true);
  expect(r.activa).toBe('bradford');
  /* No basta con que el estado diga «bradford»: lo que importa es qué ARCHIVO
     se ha pedido. Sin esta línea, un `paceVozActiva` correcto con una precarga
     que ignora la voz pasaría el test. */
  expect(r.fuentes.length).toBe(3);
  for (const src of r.fuentes) {
    expect(src, 'se precargó un archivo que no es de la voz elegida').toContain('bradford-');
  }
});

test('bradford es otra grabación, más corta: cabe en las mismas 17 rutinas que sulafat', async ({ page, context }) => {
  const rutinas = fasesPorRutina();
  await sembrarPisando(context, { voice: 'bradford' });
  await irAlArtefacto(page);
  const veredicto = await page.evaluate(async ([lista, espera]) => {
    const listo = await (new Function('return (' + espera + ')'))()();
    return {
      listo,
      /* CADA SENAL CONTRA SU PROPIA FASE, que es lo que hace el producto. */
      filas: lista.map(r => ({
        id: r.id,
        cabe: Object.keys(r.porSenal).every(s => paceVozCabe(s, r.porSenal[s])),
        senales: Object.keys(r.porSenal).length,
      })),
    };
  }, [rutinas, ESPERA_CLIPS]);
  expect(veredicto.listo).toBe(true);
  const caben = veredicto.filas.filter(x => x.cabe).length;
  /* RELACIONAL contra el catálogo real, igual que el de sulafat. Medido
     abriendo los archivos: su palabra más larga es «mantén», 1,218 s; el
     «exhala» dura 1,201 (hasta el 22 oct. se contaba hasta un chasquido del
     final del archivo, 3,572 s, y se caía de las tres de rondas: 14 de 20). */
  expect(veredicto.filas.length).toBe(20);
  /* GUARD: si alguna rutina no aportara ninguna senal reconocida, «cabe» seria
     `true` por vacuidad (`every` sobre una lista vacia) y el recuento subiria
     sin que nadie cantara. */
  veredicto.filas.forEach(f => {
    expect(f.senales, f.id + ' no aporta ninguna senal reconocible').toBeGreaterThan(0);
  });
  /* Las tres de bombeo, con fases de 1 s, siguen con el tono (PACE_VOZ_FASE_MIN). */
  expect(caben, 'bradford debería caber en 17 de las 20').toBe(17);
  const fuera = veredicto.filas.filter(x => !x.cabe).map(x => x.id).sort();
  expect(fuera.some(id => /rounds/.test(id)), 'el «exhala» grave vuelve a no caber en rondas: ' + fuera.join(', ')).toBe(false);
});
