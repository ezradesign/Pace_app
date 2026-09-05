/* PACE · E2E · EL RECORRIDO DEL ARO (s184)
 * ========================================
 * Defiende lo que el usuario pidio con estas palabras: que el Pomodoro de la
 * home «empiece en el extremo izquierdo visible y acabe en el derecho visible,
 * unos 270 grados», en vez de rellenar el circulo entero pasando por debajo del
 * horizonte.
 *
 * QUE HACE FALTA VIGILAR, Y POR QUE.
 *
 * 1. Que el barrido se MIDA. El ratio horizonte/D no es constante: el motor lo
 *    publica como el 16 % de D con un techo por el CICLO, asi que el angulo
 *    visible va de ~266° a ~276° segun el breakpoint. Un 270 escrito a mano
 *    pasaria una revision a ojo y dejaria los cabos ~1,9 px fuera del corte —
 *    poco para verlo en una captura, suficiente para que un extremo quede medio
 *    tapado. Por eso el aserto NO compara contra 270: deriva el angulo esperado
 *    de la MASCARA del horizonte, que es un camino independiente del que usa el
 *    componente (el componente lee la custom property; esto lee la parada
 *    central del degradado ya computado).
 *
 * 2. Que se mida POR LOS DOS LADOS. La leccion de s179. Un aserto sobre el cabo
 *    izquierdo pasa igual con el arco entero y con el arco recortado, porque el
 *    cabo izquierdo esta donde esta en los dos casos; lo que distingue una cosa
 *    de la otra es el DERECHO. Van los dos, y ademas su simetria.
 *
 * 3. Que a mitad de bloque la punta este ARRIBA. Es la consecuencia bonita del
 *    encargo —el recorrido queda centrado en las 12— y a la vez el aserto que
 *    caza el mutante mas probable: quitar el giro del grupo. Sin giro el arco
 *    vuelve a nacer en las 12 y a mitad de bloque la punta cae abajo a la
 *    derecha, a 136° de donde deberia.
 *
 * 4. Que el PUNTO GUIA viaje el mismo recorrido. Recorria 360 hasta s184 y
 *    quedarse con esa linea es el otro mutante evidente: el punto se separaria
 *    de la punta del arco justo a mitad de sesion.
 *
 * LO QUE ESTE SPEC NO CUBRE: Caminos. Su aro va por la rama `ticks`, que no
 * dibuja ni arco ni pista —son 60 marcas— y no tiene horizonte del que
 * recortar. Sigue siendo la vuelta entera a proposito.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto } = require('./helpers');
const { asentarGeometria } = require('./home.helpers');

const VUELTA = 360;
/* Radio del anillo en fraccion del marco: r=47.5 sobre un viewBox de 100 que
   cubre un marco cuadrado. Es el UNICO numero de geometria que este spec
   comparte con el componente, y es el que define el anillo desde s76. */
const RADIO_FRAC = 0.475;

/* Sonda del recorrido. Devuelve lo medido en pagina y NADA interpretado:
   el angulo esperado se deriva aqui de la mascara, el real de los atributos
   que el componente ha escrito, y los cabos de los puntos realmente trazados. */
function sondaRecorrido(page) {
  return page.evaluate(({ VUELTA, RADIO_FRAC }) => {
    const marco = document.querySelector('[data-pace-dial-fit]');
    const capa = marco && marco.querySelector('[data-pace-dial-ring]');
    if (!marco || !capa) return { hayAro: false };
    /* DOS CAPAS desde s184: la pista vive en su propio <svg> dentro de
       [data-pace-dial-pista] y el arco en el suyo, hermano. Se buscan por
       separado a proposito -- un querySelector('svg > g') a secas devuelve la
       PRIMERA, que es la pista, y el arco se leeria como undefined. */
    const grupoPista = capa.querySelector('[data-pace-dial-pista] svg > g');
    const grupo = capa.querySelector(':scope > svg > g');
    if (!grupo || !grupoPista) return { hayAro: true, hayGrupo: false };
    const pista = grupoPista.querySelector(':scope > circle');
    const arco = grupo.querySelector(':scope > circle');
    if (!pista || !arco) return { hayAro: true, hayGrupo: false };
    const rect = marco.getBoundingClientRect();
    const D = rect.height;

    /* EL HORIZONTE, leido de la MASCARA y no de la custom property. Se lee asi
       a proposito: es un camino distinto del que recorre el componente —que lee
       --pace-horizon—, y por eso el aserto compara dos medidas independientes
       en vez de a un modulo consigo mismo.
       La regla es la misma que en `home.helpers.sonda` y no depende de como
       este escrito el degradado: el horizonte es la parada donde la mascara
       llega a CERO, porque por debajo de esa linea el anillo no existe. */
    const paradas = [...(getComputedStyle(capa).maskImage || '')
      .matchAll(/(rgba?\([^)]*\))\s+calc\(100% - ([\d.]+)px\)/g)].map(m => {
        const c = m[1].match(/rgba\(\s*[\d.]+,\s*[\d.]+,\s*[\d.]+,\s*([\d.]+)\)/);
        return { alfa: c ? parseFloat(c[1]) : 1, pos: parseFloat(m[2]) };
      });
    const ceros = paradas.filter(p => p.alfa === 0);
    const lecturaFiable = ceros.length === 1;
    const H = lecturaFiable ? ceros[0].pos : null;

    let barridoEsperado = null;
    if (H != null && D > 0) {
      const sen = (D / 2 - H) / (RADIO_FRAC * D);
      if (sen > -1 && sen < 1) barridoEsperado = 2 * (90 + Math.asin(sen) * 180 / Math.PI);
    }

    const primerGuion = (el) => {
      const da = (el.getAttribute('stroke-dasharray') || '').trim().split(/[\s,]+/)[0];
      return da ? parseFloat(da) : null;
    };
    /* Un punto del trazado, en coordenadas de PAGINA. `pathLength` normaliza a
       360, asi que un angulo se convierte a longitud con la regla de tres sobre
       la longitud real del trazado. */
    const ctm = pista.getScreenCTM();
    const enPagina = (el, grados) => {
      const p = el.getPointAtLength(el.getTotalLength() * (grados / VUELTA));
      return { x: p.x * ctm.a + p.y * ctm.c + ctm.e, y: p.x * ctm.b + p.y * ctm.d + ctm.f };
    };

    const barrido = primerGuion(pista);
    const desfase = parseFloat(arco.getAttribute('stroke-dashoffset'));
    const avance = (barrido != null && isFinite(desfase)) ? barrido - desfase : null;
    const punto = grupo.querySelector(':scope > g');   /* el punto guia, si existe */

    return {
      hayAro: true, hayGrupo: true, D: +D.toFixed(2), H, lecturaFiable,
      barrido, barridoEsperado, barridoArco: primerGuion(arco),
      pathLengthPista: pista.getAttribute('pathLength'),
      pathLengthArco: arco.getAttribute('pathLength'),
      giro: parseFloat((grupo.getAttribute('transform') || '').replace(/[^-\d.]+/, '')),
      /* La linea del horizonte en coordenadas de pagina. */
      yHorizonte: H == null ? null : rect.top + D - H,
      centroX: rect.left + D / 2,
      yArriba: rect.top + (0.5 - RADIO_FRAC) * D,
      cabos: barrido == null ? null : { izq: enPagina(pista, 0), der: enPagina(pista, barrido) },
      avance,
      punta: avance == null ? null : enPagina(arco, avance),
      /* EL ANGULO DECLARADO DEL PUNTO GUIA, no su caja pintada.
         Su grupo lleva `transition: transform 1s linear`, y `page.clock` mueve
         el reloj de JS pero NO el de las transiciones CSS: leer su rectangulo
         tras un `fastForward` lo fotografia a medio viaje y da 139 px de
         diferencia con una app intacta (medido al escribir este spec). El
         atributo dice a donde va, que es lo que aqui se quiere aserta. */
      anguloPunto: punto ? parseFloat((punto.getAttribute('transform') || '').replace(/[^-\d.]+/, '')) : null,
    };
  }, { VUELTA, RADIO_FRAC });
}

test.describe('el recorrido del aro · nace y muere en el horizonte', () => {
  for (const [nombre, vista] of [
    ['escritorio', { width: 1280, height: 800 }],
    ['movil', { width: 390, height: 844 }],
  ]) {
    test('los DOS cabos caen en el corte · ' + nombre, async ({ page, context }) => {
      const errores = capturarErrores(page);
      await page.setViewportSize(vista);
      await sembrar(context);
      await irAlArtefacto(page);
      await asentarGeometria(page);

      const m = await sondaRecorrido(page);
      expect(m.hayAro, 'GUARD: no hay aro en la home').toBe(true);
      expect(m.hayGrupo, 'GUARD: el anillo no lleva el grupo del recorrido').toBe(true);
      expect(m.lecturaFiable, 'la mascara del anillo no llega a cero una sola vez: la lectura del horizonte no vale').toBe(true);
      expect(m.barridoEsperado, 'no se pudo derivar el barrido de la mascara').not.toBeNull();

      /* EL BARRIDO SE MIDE. Comparado contra lo derivado de la mascara, no
         contra un 270 escrito: un valor fijo falla aqui en cuanto el ratio
         horizonte/D se mueva, que es lo que hace entre breakpoints. */
      expect(m.pathLengthPista, 'la pista no normaliza a 360: el guion no esta en grados').toBe(String(VUELTA));
      expect(m.pathLengthArco, 'el arco no normaliza a 360: el guion no esta en grados').toBe(String(VUELTA));
      expect(Math.abs(m.barrido - m.barridoEsperado),
        `el barrido dibujado (${m.barrido}) no es el que da el horizonte (${m.barridoEsperado})`).toBeLessThanOrEqual(0.2);
      expect(m.barridoArco, 'la pista y el arco no recorren el mismo tramo').toBe(m.barrido);
      expect(m.barrido, 'el aro no esta recortado: sigue dando la vuelta entera').toBeLessThan(VUELTA - 1);

      /* Y SE MIDE POR LOS DOS LADOS (s179). El cabo izquierdo esta donde esta
         tambien con el arco entero; el que distingue las dos cosas es el
         derecho, y la simetria entre ambos. */
      expect(Math.abs(m.cabos.izq.y - m.yHorizonte),
        'el cabo IZQUIERDO no cae en el horizonte').toBeLessThanOrEqual(1);
      expect(Math.abs(m.cabos.der.y - m.yHorizonte),
        'el cabo DERECHO no cae en el horizonte').toBeLessThanOrEqual(1);
      expect(Math.abs((m.cabos.izq.x + m.cabos.der.x) / 2 - m.centroX),
        'los dos cabos no son simetricos respecto del centro del aro').toBeLessThanOrEqual(1);
      expect(m.cabos.izq.x, 'el cabo izquierdo no esta a la izquierda del centro').toBeLessThan(m.centroX);
      expect(m.cabos.der.x, 'el cabo derecho no esta a la derecha del centro').toBeGreaterThan(m.centroX);
      expect(errores).toEqual([]);
    });
  }
});

test.describe('el recorrido del aro · con la sesion viva', () => {
  test('a mitad de bloque la punta esta ARRIBA, y el punto guia con ella', async ({ page, context }) => {
    const errores = capturarErrores(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    await sembrar(context);
    await irAlArtefacto(page);
    await asentarGeometria(page);

    /* El reloj virtual va DESPUES de asentar la geometria: `asentarGeometria`
       cuenta frames y con el reloj instalado esos frames solo corren cuando el
       reloj avanza (nota de home.helpers). */
    await page.clock.install();
    await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
    await page.clock.fastForward(12 * 60 * 1000 + 30 * 1000);   /* la mitad de 25 min */
    await expect(page.locator('[data-pace-dial-number]')).toHaveText('12:30');

    const m = await sondaRecorrido(page);
    expect(m.avance, 'el arco no ha avanzado nada a mitad de bloque').toBeGreaterThan(0);
    /* La mitad del barrido, medio grado arriba o abajo (el contador esta en
       12:30 clavado, asi que el progreso es 0,5 exacto). */
    expect(Math.abs(m.avance - m.barrido / 2),
      'a mitad de bloque el arco no ha recorrido medio barrido').toBeLessThanOrEqual(0.5);

    /* Y ESO, EN PANTALLA, ES LAS 12. El mutante que esto caza es quitar el giro
       del grupo: sin el, la punta cae a 136° de aqui. */
    expect(Math.abs(m.punta.x - m.centroX),
      'a mitad de bloque la punta del arco no esta en la vertical del centro').toBeLessThanOrEqual(1.5);
    expect(Math.abs(m.punta.y - m.yArriba),
      'a mitad de bloque la punta del arco no esta en lo alto del anillo').toBeLessThanOrEqual(1.5);

    /* El punto guia viaja el MISMO recorrido, no los 360 de antes: su angulo es
       el avance del arco. Con `progress * 360` valdria 180 donde este pide
       ~135,8, asi que el mutante muerde por 44 grados. */
    expect(m.anguloPunto, 'no hay punto guia con la sesion viva').not.toBeNull();
    expect(Math.abs(m.anguloPunto - m.avance),
      'el punto guia no apunta a la punta del arco (recorre otro barrido)').toBeLessThanOrEqual(0.5);
    expect(errores).toEqual([]);
  });
});
