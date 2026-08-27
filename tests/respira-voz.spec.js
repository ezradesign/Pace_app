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
const { sembrar, irAlArtefacto } = require('./helpers');

const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const sandbox = require(path.join(ROOT, 'scripts', 'verify.sandbox.js'));

/* El catálogo y su motor de fases, leídos de las FUENTES: `BREATHE_ROUTINES` es
   `const` y no cruza la IIFE del artefacto (trampa de s148), y además cruzar la
   pantalla contra un dato de esa misma pantalla no probaría nada. */
let _seq = null;
function fasesPorRutina() {
  if (_seq) return _seq;
  const ctx = { ROOT, babel: require(path.join(ROOT, 'node_modules', '@babel', 'core')) };
  const sb = sandbox.nuevoSandbox();
  const errs = [
    sandbox.cargar(ctx, sb, 'app/breathe/BreatheLibrary.jsx', { __B: 'BREATHE_ROUTINES' }),
    sandbox.cargar(ctx, sb, 'app/breathe/BreatheVisual.jsx', { __G: 'getSequence' }),
  ].filter(Boolean);
  if (errs.length) throw new Error('no se pudo leer Respira: ' + errs.join(' · '));
  const out = [];
  Object.keys(sb.__B || {}).forEach(k => (sb.__B[k].items || []).forEach(r => {
    const seq = sb.__G(r) || [];
    if (!seq.length) return;
    out.push({ id: r.id, min: Math.min.apply(null, seq.map(p => p.duration)) });
  }));
  if (out.length < 20) throw new Error('catálogo de Respira incompleto: ' + out.length);
  _seq = out;
  return out;
}

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
        archivo: window.PACE_VOZ_CLIPS[k].dur,
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
     siguiente, y son 90 ciclos en 3 minutos. */
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
