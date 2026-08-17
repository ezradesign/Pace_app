/* PACE · E2E · LA FORMA DE LA LUZ EN EL TIEMPO (s159)
 * ===================================================
 * El otro spec de la luz defiende su CONTRATO (cuándo existe, de dónde saca el
 * color, que no toca la geometría). Este defiende su RECORRIDO:
 *
 *     frío sereno → calentamiento → máximo cálido EN LA MITAD → enfriamiento
 *     continuo → frío residual, sin escalones y sin rebote final.
 *
 * POR QUÉ EXISTE. En s158 el máximo perceptual compuesto caía en p=0,375 y en
 * la mitad del bloque ya había bajado un 20 % — medido en píxeles, con la home
 * capturada con luz y sin luz en el mismo instante. Además la curva NO decaía:
 * tras el pico tenía cinco rebotes, porque en oscuro los tokens de noche pesan
 * más que los del atardecer y la contribución de color sube x1,41 en el último
 * tercio mientras la envolvente solo baja x0,74.
 *
 * SE CONDUCE EL POMODORO DE VERDAD, con reloj virtual: nada de forzar variables.
 * Lo que se aserta es lo que el producto PUBLICA en cada instante del bloque.
 *
 * NI UN COLOR ESCRITO A MANO. La presencia se mide como alfa · intensidad ·
 * separación OKLab respecto al papel, y el calor por el eje azul→ámbar del color
 * resuelto; los dos salen de --pace-luz, o sea de los tokens vigentes. Si mañana
 * se recalibra una hora del día, estos asertos siguen valiendo.
 *
 * LO QUE ESTE SPEC NO CUBRE, DECLARADO:
 *  · corre en la paleta CLARA (playwright.config.js fija colorScheme: light) y
 *    en un solo viewport. La paleta oscura se mide en el banco, no aquí.
 *  · la monotonía de la PRESENCIA COMPUESTA en el tramo 50-77 % NO se aserta, y
 *    no es un olvido: medida en píxeles, en la paleta CLARA sigue subiendo hasta
 *    p≈0,77, porque sobre papel crema el atardecer contrasta más que el mediodía
 *    —tokens.css ya lo dice: «sobre papel claro la luz no es más brillo, es más
 *    calor»— y ahí el máximo de CALOR sí cae centrado (medido: p=0,495).
 *    Corregirlo exigiría tocar la calibración del día, que está aprobada y que
 *    el encargo prohíbe compensar sin comparación previa. Queda medido y
 *    presentado, no consagrado.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const BLOQUE_S = 25 * 60;

/* Recorre el bloque de verdad y devuelve lo publicado en cada parada.
   `fastForward` y no `runFor`: el segundo dispara los ~1500 ticks uno a uno y
   esta sola prueba costaría medio minuto. El salto seco vale porque el contador
   es TIMESTAMP-BASED desde s96 — `remaining` se deriva del reloj real. */
async function recorrer(page, paradas) {
  const filas = [];
  let hechos = 0;
  for (const p of paradas) {
    const objetivo = Math.round(p * BLOQUE_S);
    if (objetivo > hechos) { await page.clock.fastForward((objetivo - hechos) * 1000); hechos = objetivo; }
    const m = await page.evaluate(() => {
      const b = document.querySelector('[data-pace-home-body]');
      const cs = getComputedStyle(b);
      return {
        k: parseFloat(cs.getPropertyValue('--pace-k')),
        i: parseFloat(cs.getPropertyValue('--pace-i')),
        on: parseFloat(cs.getPropertyValue('--pace-on')),
        luz: cs.getPropertyValue('--pace-luz').trim(),
        numero: (document.querySelector('[data-pace-dial-number]') || {}).textContent,
      };
    });
    filas.push(Object.assign({ p: +p.toFixed(3) }, m));
  }
  return filas;
}

async function abrirBloque(page, context) {
  await sembrar(context);
  await page.clock.install();
  await irAlArtefacto(page);
  await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
  await expect(page.locator('[data-pace-dial-fit]')).toHaveAttribute('data-pace-dial-running', '');
  /* Y SE ESPERA A QUE LA LUZ ENCIENDA, no solo a que el bloque arranque (s162).
     Es el mismo defecto que s161 arreglo en `home-luz.spec.js`; aqui quedo
     pendiente porque entonces no fallaba, y fallo en el CI de Linux con el
     producto sano: «GUARD: la luz se apago a mitad del recorrido».

     `--pace-on` NO ES UN BOOLEANO: es el interruptor de la luz y se funde en
     1,6 s (s159), asi que en el instante en que aparece `data-pace-dial-running`
     vale CERO EXACTO. El guard de estas pruebas exige `on > 0` en las 21 paradas,
     y la primera se lee justo aqui ⇒ el resultado dependia de si el viaje de ida
     y vuelta de Playwright dejaba pasar un frame. Medido en banco, 10 arranques:
     **3 lecturas de 0,0000 y 7 de 0,0002**, o sea que la prueba vivia sobre el
     filo y en el runner cayo del lado malo.

     Se ESPERA, no se baja el liston: el contrato asertado sigue siendo «arrancar
     un bloque enciende la luz», y las 21 paradas siguen exigiendo luz viva. */
  await expect.poll(() => page.evaluate(() => parseFloat(getComputedStyle(
    document.querySelector('[data-pace-home-body]')).getPropertyValue('--pace-on'))), {
    message: 'la luz no ha encendido tras arrancar el bloque',
  }).toBeGreaterThan(0);
}

/* NO HAY QUE CONVERTIR NADA, y darse cuenta ahorró una métrica inventada: como
   --pace-luz está registrado con @property como <color>, el valor COMPUTADO
   llega ya en `oklab(L a b / alfa)`. Medido: a k=0 vale b=-0,062 (frío) y en el
   mediodía b=+0,096 (ámbar). El primer parser de esta prueba lo leyó como si
   fuera RGB y situó el máximo de calor en p=0 — un instrumento que miente en la
   dirección contraria. */
function oklabDe(css) {
  const n = (String(css).match(/-?[\d.]+(?:e-?\d+)?/g) || []).map(Number);
  if (!/^oklab\(/.test(String(css).trim()) || n.length < 3) return null;
  return { L: n[0], a: n[1], b: n[2], alfa: n.length >= 4 ? n[3] : 1 };
}
/* EL CALOR es el eje `b` de OKLab: azul(−) → amarillo(+). No es luminancia, y la
   distinción no es teórica — sobre papel claro la luz casi no sube luminancia
   porque el papel YA es claro, y lo que se lee como luz es la temperatura. */
function calor(css) {
  const c = oklabDe(css);
  return c ? +(c.b * 1000).toFixed(1) : null;
}
/* LA PRESENCIA percibida son tres factores: cuánta luz hay (alfa, que viaja con
   la hora en los tokens), cuánta se deja pasar (la envolvente) y cuánto SEPARA
   esa luz del papel sobre el que cae. Sin el tercero la magnitud no distingue
   una luz que ilumina de una que se funde con el fondo.

   LA SEPARACIÓN ES UNA DISTANCIA, no una resta de luminosidad, y esto costó un
   aserto que pasaba por vacío: la primera versión usaba max(0, L − L del papel),
   que es un modelo de PAPEL OSCURO. La suite corre en claro, donde la luz tiene
   MENOS luminosidad que el papel (medido: papel L=0,946 contra 0,76-0,49 de la
   luz), así que la magnitud valía 0 en las diez paradas y el bucle de monotonía
   comparaba ceros. Es exactamente lo que dice tokens.css —«sobre papel claro la
   luz no es más brillo, es más calor»— y por eso lo que cuenta es la distancia
   OKLab completa, que vale en las dos paletas.

   Calibrado contra el banco de píxeles de s159: la razón entre esta magnitud y
   la desviación medida en pantalla se mantiene dentro del 4 % en las cuatro
   horas del día, y su máximo cae en la misma parada. */
function presencia(fila, papel) {
  const c = oklabDe(fila.luz);
  if (!c || !papel) return null;
  const d = Math.sqrt(Math.pow(c.L - papel.L, 2) + Math.pow(c.a - papel.a, 2) + Math.pow(c.b - papel.b, 2));
  return +(c.alfa * fila.i * d).toFixed(5);
}
/* El papel, medido POR EL MISMO CAMINO que la luz: se le pide al navegador que
   resuelva --paper a través de la propiedad registrada. Así no hay una segunda
   conversión de color en el banco que pueda divergir de la del producto. */
async function papelEnOklab(page) {
  const css = await page.evaluate(() => {
    const raiz = document.querySelector('[data-pace-app-root]') || document.body;
    const d = document.createElement('div');
    /* Se pasa por un color-mix EN OKLAB a propósito: un color plano computaría
       como `rgb(...)` y habría que convertirlo aquí, que es justo la segunda
       conversión que este helper existe para evitar. Mezclar el papel consigo
       mismo no lo cambia y obliga al navegador a serializarlo en el mismo
       espacio en que llega la luz. */
    d.style.setProperty('--pace-luz', 'color-mix(in oklab, var(--paper) 50%, var(--paper))');
    raiz.appendChild(d);
    const v = getComputedStyle(d).getPropertyValue('--pace-luz').trim();
    d.remove();
    return v;
  });
  return oklabDe(css);
}

test.describe('la luz del Pomodoro · la forma del recorrido', () => {
  test('el máximo cae en la mitad del bloque, con meseta de 45 a 55 %', async ({ page, context }) => {
    await abrirBloque(page, context);
    const paradas = [];
    for (let n = 0; n <= 20; n++) paradas.push(n / 20);
    const filas = await recorrer(page, paradas);

    // GUARD: si el bloque no hubiera avanzado, todas las paradas darían lo mismo.
    expect(filas[filas.length - 1].numero, 'GUARD: el contador no ha avanzado').not.toBe(filas[0].numero);
    expect(filas.every(f => f.on > 0), 'GUARD: la luz se apagó a mitad del recorrido').toBe(true);

    const cima = filas.reduce((a, f) => f.i > a.i ? f : a);
    expect(cima.p, 'el máximo de intensidad no cae en la mitad del bloque (está en ' + cima.p + ')')
      .toBeGreaterThanOrEqual(0.45);
    expect(cima.p, 'el máximo de intensidad no cae en la mitad del bloque (está en ' + cima.p + ')')
      .toBeLessThanOrEqual(0.55);

    /* LA MESETA es el tramo 45-55 %: sus bordes tienen que estar pegados al pico
       —cúspide sutil, no tramo plano—. */
    const en = (p) => filas.find(f => Math.abs(f.p - p) < 1e-6);
    const cae = (p) => 1 - en(p).i / cima.i;
    expect(cae(0.45), 'a 45 % la luz ya ha caído demasiado: no hay meseta').toBeLessThanOrEqual(0.04);
    expect(cae(0.55), 'a 55 % la luz ya ha caído demasiado: no hay meseta').toBeLessThanOrEqual(0.04);

    /* Y FUERA DE ELLA HAY RECORRIDO. Los límites se toman DONDE EL ENCARGO los
       enuncia —«en 75 % debe percibirse claramente que se está enfriando»— y no
       en un 60 % que fue una elección mía anterior a la curva: la caída es
       asimétrica a propósito (suave al salir de la meseta, decidida al final,
       que es lo que mata el rebote de p=1), así que a 60 % la luz todavía está
       al 95 % y eso es correcto por diseño, no un descuido.
       Este par no discrimina la curva de s158 —aquélla también caía aquí— y no
       pretende hacerlo: es el guard contra APLANAR de más en el futuro. */
    expect(cae(0.35), 'a 35 % la luz sigue en el pico: la meseta se come la subida').toBeGreaterThan(0.06);
    expect(cae(0.65), 'a 65 % la luz sigue en el pico: la meseta se come la bajada').toBeGreaterThan(0.06);
    expect(cae(0.75), 'a 75 % no se percibe que el sistema esté enfriando').toBeGreaterThan(0.15);
  });

  /* EL ENFRIAMIENTO ES CONTINUO. Este es el defecto de s158 convertido en red:
     tras el pico la presencia REBOTABA cinco veces (medido en píxeles a
     1280x720 y cuatro veces a 390x844), porque en oscuro los tokens de noche
     pesan más que los del atardecer —la contribución de color sube x1,41 en el
     último tercio— y la envolvente no bajaba lo suficiente para compensarlo.
     El rebote gordo era el último: con la intensidad ya cuantizada y quieta, el
     color seguía subiendo y la home se ILUMINABA al llegar a 00:00. */
  test('desde la meseta la envolvente solo baja, y el final no repunta', async ({ page, context }) => {
    await abrirBloque(page, context);
    const papel = await papelEnOklab(page);
    expect(papel, 'GUARD: no se puede resolver el papel a OKLab').not.toBeNull();
    /* GUARD del propio proxy: si la separación luz-papel valiera cero, el bucle
       de abajo compararía ceros y pasaría con cualquier curva. Pasó: la primera
       versión de `presencia` usaba max(0, L − L del papel) y en la paleta clara
       daba 0 en las diez paradas. */
    expect(presencia({ luz: 'oklab(0.83 0.02 0.10 / 0.26)', i: 1 }, papel),
      'GUARD: la separación luz-papel vale cero; el aserto no probaría nada').toBeGreaterThan(0.01);
    const paradas = [];
    for (let n = 11; n <= 20; n++) paradas.push(n / 20 * 0.99);
    const filas = await recorrer(page, paradas);
    expect(filas.every(f => f.on > 0), 'GUARD: la luz se apagó a mitad del recorrido').toBe(true);
    expect(filas.every(f => presencia(f, papel) !== null), 'GUARD: --pace-luz no resuelve a oklab()').toBe(true);

    /* LA ENVOLVENTE, que es lo que este módulo gobierna, baja sin excepción. */
    for (let n = 1; n < filas.length; n++) {
      expect(filas[n].i, 'la envolvente repunta entre p=' + filas[n - 1].p + ' y p=' + filas[n].p)
        .toBeLessThanOrEqual(filas[n - 1].i);
    }

    /* EL TRAMO FINAL, que es donde el encargo es explícito: «no recupera
       luminosidad al llegar a p=1». Aquí sí se mide la PRESENCIA compuesta, con
       el color dentro: el rebote de s158 nacía justo de eso — con la intensidad
       cuantizada y quieta, el alfa de la noche seguía subiendo y la home se
       iluminaba al llegar a 00:00 (medido en píxeles: 1,356 -> 1,472). */
    const finales = filas.filter(f => f.p >= 0.84);
    expect(finales.length, 'GUARD: no hay tramo final que medir').toBeGreaterThan(2);
    for (let n = 1; n < finales.length; n++) {
      const antes = presencia(finales[n - 1], papel), ahora = presencia(finales[n], papel);
      expect(ahora, 'la luz REPUNTA al final, entre p=' + finales[n - 1].p + ' y p=' + finales[n].p
        + ' (' + antes + ' -> ' + ahora + ')').toBeLessThanOrEqual(antes);
    }

    /* Y el final es de verdad un residuo: la cola nocturna aprobada es ~0,42 y
       la luz tiene que seguir ahí —perceptible, no apagada de golpe. */
    const fin = filas[filas.length - 1];
    expect(fin.i, 'la cola nocturna no baja a su valor aprobado').toBeLessThanOrEqual(0.44);
    expect(fin.i, 'la luz se apaga de golpe al final en vez de dejar residuo').toBeGreaterThanOrEqual(0.38);
  });

  /* EL CALOR, medido por el eje azul→ámbar del color resuelto y no por
     luminancia. El encargo es que la cúspide térmica esté CENTRADA: a igual
     presencia, el 55 % no puede sentirse más cálido que el 50 %. */
  test('el máximo de calor está centrado y luego enfría sin volver atrás', async ({ page, context }) => {
    await abrirBloque(page, context);
    const paradas = [];
    for (let n = 0; n <= 20; n++) paradas.push(n / 20 * 0.99);
    const filas = await recorrer(page, paradas).then(f => f.map(x => Object.assign({ calor: calor(x.luz) }, x)));
    expect(filas.every(f => f.calor !== null), 'GUARD: no se puede leer el color de la luz').toBe(true);

    const cima = filas.reduce((a, f) => f.calor > a.calor ? f : a);
    expect(cima.p, 'el máximo de calor no está centrado (está en ' + cima.p + ')').toBeGreaterThanOrEqual(0.44);
    expect(cima.p, 'el máximo de calor no está centrado (está en ' + cima.p + ')').toBeLessThanOrEqual(0.56);

    // Los dos extremos son FRÍOS, y no el mismo frío: el del final es más profundo.
    expect(filas[0].calor, 'el bloque no empieza en frío').toBeLessThan(cima.calor);
    expect(filas[filas.length - 1].calor, 'el bloque no termina en frío').toBeLessThan(cima.calor);
    // Y desde la cima el enfriamiento no da marcha atrás.
    const tras = filas.filter(f => f.p > cima.p);
    for (let n = 1; n < tras.length; n++) {
      expect(tras[n].calor, 'el calor vuelve a subir entre p=' + tras[n - 1].p + ' y p=' + tras[n].p)
        .toBeLessThanOrEqual(tras[n - 1].calor + 0.5);
    }
  });

  test('la hora recorre el día con el mediodía en la mitad', async ({ page, context }) => {
    await abrirBloque(page, context);
    const filas = await recorrer(page, [0, 0.25, 0.5, 0.75, 0.95]);
    const en = (p) => filas.find(f => Math.abs(f.p - p) < 1e-6).k;

    /* Las cuatro paradas viven en tokens.css (amanecer 0 · mediodía 0,38 ·
       atardecer 0,72 · noche 1) y el aserto no las reescribe: comprueba DÓNDE
       las pisa el bloque. El mediodía en la mitad es el encargo entero. */
    expect(en(0), 'el bloque no empieza en el amanecer').toBeLessThan(0.03);
    expect(Math.abs(en(0.5) - 0.38), 'el mediodía no cae en la mitad del bloque (k=' + en(0.5) + ')')
      .toBeLessThanOrEqual(0.03);
    expect(en(0.25), 'a un cuarto de bloque la hora ya ha pasado del mediodía').toBeLessThan(0.38);
    expect(en(0.75), 'a tres cuartos la hora no ha llegado al atardecer').toBeGreaterThan(0.6);
    expect(en(0.95), 'el bloque no termina llegando a la noche').toBeGreaterThan(0.9);
    // Y monótona: la hora nunca retrocede.
    for (let n = 1; n < filas.length; n++) {
      expect(filas[n].k, 'la hora retrocede entre ' + filas[n - 1].p + ' y ' + filas[n].p)
        .toBeGreaterThanOrEqual(filas[n - 1].k);
    }
  });
});
