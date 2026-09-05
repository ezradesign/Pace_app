/* PACE · E2E · LOS BORDES DE LA LUZ Y DEL ANILLO (s184)
 * =====================================================
 * Sale de `home-luz.spec.js` cuando ese archivo llego a 581 lineas y paso el
 * limite de 500 de CLAUDE.md §1 — el mismo motivo por el que s159 partio
 * `home-geometria.spec.js`. El corte es por DOMINIO, no por tamano: aqui vive
 * una sola pregunta, «donde ACABAN la luz y el anillo», y con ella se lleva
 * `perfilDeLuz`, que es su instrumento y no lo usa nadie mas.
 *
 * Son los tres bordes que el usuario pidio suavizar en s184, y son el mismo
 * problema —un borde que se lee como un CORTE— en tres sitios:
 *   · ARRIBA  la luz no debe llegar a la fila de minutos (medido: llegaba).
 *   · CABOS   los dos extremos del anillo se disuelven en niebla, no en filo.
 *   · ABAJO   la cola pasa del horizonte y se apaga antes de la tarjeta.
 *
 * En `home-luz.spec.js` se queda el CONTRATO de la atmosfera: cuando existe, de
 * donde saca el color, que no toca la geometria y que se apaga sola.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const sharp = require('sharp');
const { sembrar, irAlArtefacto } = require('./helpers');
const { asentar } = require('./home.helpers');

/* EL PERFIL DE LA LUZ, fila a fila y EN PIXELES. Es el unico aserto de este
   spec que mira la pantalla, y hace falta: el alcance de la cola no se puede
   deducir de ninguna variable — es el resultado de un degradado, dos mascaras y
   lo que quede tapado por los chips.
   Se toman dos capturas del MISMO layout, una con luz y otra sin ella, y la
   diferencia es la atmosfera y solo la atmosfera. La referencia NO puede ser
   --pace-on:0: ese mando ademas cierra el horizonte del aro, asi que la toma de
   control tendria el arco cortado y la diferencia incluiria el arco (medido: el
   pico saltaba de 41 a 121 por eso). Se apagan solo las capas de luz. */
const SIN_LUZ = '[data-pace-sun]::before,[data-pace-sun]::after{opacity:0 !important}'
  + '[data-pace-home-body] [data-pace-activitybar-chip]{filter:none !important}'
  + '[data-pace-home-body] [data-pace-activitybar-chip]::after,'
  + '[data-pace-home-body] [data-pace-spc-card]::after{opacity:0 !important}';

async function perfilDeLuz(page) {
  await page.addStyleTag({ content: '#pace-sin-luz-e2e{}' });
  await page.evaluate((css) => {
    const s = document.createElement('style');
    s.id = 'pace-sin-luz-e2e';
    s.media = 'not all';
    s.textContent = css;
    document.head.appendChild(s);
  }, SIN_LUZ);
  const conLuz = await page.screenshot();
  await page.evaluate(() => { document.getElementById('pace-sin-luz-e2e').media = 'all'; });
  const sinLuz = await page.screenshot();
  await page.evaluate(() => { document.getElementById('pace-sin-luz-e2e').media = 'not all'; });

  const A = await sharp(conLuz).raw().toBuffer({ resolveWithObject: true });
  const B = await sharp(sinLuz).raw().toBuffer();
  const { width, height, channels } = A.info;
  const geo = await page.evaluate(() => {
    const c = (s) => { const e = document.querySelector(s); return e ? e.getBoundingClientRect() : null; };
    /* La fila de minutos se localiza por el TEXTO de una pastilla, sin hook
       nuevo: es la superficie que la luz no debe pisar (s184). */
    const p45 = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === '45');
    return { dpr: devicePixelRatio, dial: c('[data-pace-dial-fit]'), act: c('[data-pace-activitybar]'),
             spc: c('[data-pace-spc-card]'), home: c('[data-pace-home-body]'),
             filaMin: p45 ? p45.getBoundingClientRect() : null };
  });
  const x0 = Math.round(geo.home.left * geo.dpr);
  const media = [], pico = [];
  for (let y = 0; y < height; y++) {
    let s = 0, n = 0, mx = 0;
    for (let x = x0; x < width; x++) {
      const o = (y * width + x) * channels;
      const d = Math.abs(0.2126 * (A.data[o] - B[o]) + 0.7152 * (A.data[o + 1] - B[o + 1]) + 0.0722 * (A.data[o + 2] - B[o + 2]));
      s += d; n++; if (d > mx) mx = d;
    }
    media.push(s / n); pico.push(mx);
  }
  /* DOS LECTURAS POR BANDA, y hacen falta las dos.
     La MEDIA dice cuánta luz hay repartida en esa altura; el PICO, cuánta hay
     concentrada. Comparar halos con colas por la media no funciona: el halo es
     un aro compacto y la cola un lavado ancho, así que una cola tenue extendida
     de lado a lado gana en media a un aro brillante y estrecho. Medido: por
     medias, la banda de Actividades (5,08) salía por encima de la del borde
     superior del aro (1,94) — y no porque compita, sino porque la luz es MÁS
     FUERTE ABAJO A PROPÓSITO (--sun-top atenúa el techo y el bloom es
     direccional hacia abajo). El pico sí distingue las dos cosas. */
  const banda = (desde, hasta, cual) => {
    const arr = cual === 'pico' ? pico : media;
    const a = Math.max(0, Math.round(desde * geo.dpr)), b = Math.min(height, Math.round(hasta * geo.dpr));
    if (b <= a) return 0;
    let s = 0, mx = 0;
    for (let y = a; y < b; y++) { s += arr[y]; if (arr[y] > mx) mx = arr[y]; }
    return +(cual === 'pico' ? mx : s / (b - a)).toFixed(3);
  };
  return { geo, banda };
}

test.describe('la home · los bordes de la luz', () => {
  /* EL HORIZONTE ES NIEBLA, MUERE EN LA LINEA, Y NO DEPENDE DE LA SESION (s184).

     ESTE ASERTO DECIA LO CONTRARIO Y ERA CORRECTO CUANDO SE ESCRIBIO. De s158 a
     s183 el sol ABRIA el aro: el arco de recorrido daba los 360 grados y se
     hundia bajo el horizonte, asi que la mascara tenia que desvanecerse para
     dejarlo pasar por detras de los chips. En s184 el arco dejo de bajar —
     recorre solo el tramo visible (`aro-recorrido.spec.js`)— y la apertura se
     quedo sin nada que atenuar.

     LO QUE SE DEFIENDE AHORA SON TRES COSAS A LA VEZ, y hacen falta las tres:
       · que la mascara MUERA en el horizonte (por debajo no hay anillo);
       · que llegue a cero por una RAMPA con ancho, no por un filo — un cabo
         cortado en seco se lee amputado, y eso es lo que el usuario rechazo;
       · que las dos cosas sean iguales con sesion y sin ella, que es lo que
         sustituyo a --pace-abre.
     Un aserto de «muere en el horizonte» a solas pasaria con el filo; uno de
     «hay rampa» a solas pasaria con luz derramandose por debajo.

     Se lee de la mascara COMPUTADA y no de una variable, por la misma razon que
     antes: el aserto describe lo que se VE. */
  test('el horizonte es niebla, muere en la linea, y no depende de la sesion', async ({ page, context }) => {
    await sembrar(context);
    await irAlArtefacto(page);
    await asentar(page);

    const leerHorizonte = () => page.evaluate(() => {
      const r = document.querySelector('[data-pace-dial-fit] [data-pace-dial-ring]');
      if (!r) return null;
      /* Ancho de niebla de UNA capa, leido de su mascara computada. */
      const anchoDe = (el) => {
        const t = getComputedStyle(el).maskImage || '';
        const ps = [...t.matchAll(/(rgba?\([^)]*\))\s+calc\(100% - ([\d.]+)px\)/g)].map(x => {
          const c = x[1].match(/rgba\(\s*[\d.]+,\s*[\d.]+,\s*[\d.]+,\s*([\d.]+)\)/);
          return { alfa: c ? parseFloat(c[1]) : 1, pos: parseFloat(x[2]) };
        });
        const z = ps.filter(q => q.alfa === 0), o = ps.filter(q => q.alfa >= 1).map(q => q.pos);
        return (z.length === 1 && o.length) ? +(Math.min(...o) - z[0].pos).toFixed(1) : null;
      };
      const capaPista = document.querySelector('[data-pace-dial-fit] [data-pace-dial-pista]');
      const m = getComputedStyle(r).maskImage || '';
      const paradas = [...m.matchAll(/(rgba?\([^)]*\))\s+calc\(100% - ([\d.]+)px\)/g)].map(x => {
        const c = x[1].match(/rgba\(\s*[\d.]+,\s*[\d.]+,\s*[\d.]+,\s*([\d.]+)\)/);
        return { alfa: c ? parseFloat(c[1]) : 1, pos: parseFloat(x[2]) };
      });
      const ceros = paradas.filter(p => p.alfa === 0);
      const opacas = paradas.filter(p => p.alfa >= 1).map(p => p.pos);
      /* El CORTE, que desde s184 ya no es el horizonte: baja hasta el canto de
         las tarjetas. El horizonte sigue gobernando el layout. */
      const horizonte = parseFloat(getComputedStyle(r).getPropertyValue('--pace-corte'));
      return {
        ceros: ceros.length,
        /* La distancia del cero al borde inferior de la capa: si el degradado
           muere en el horizonte, esto vale --pace-horizon. */
        muereEn: ceros.length === 1 ? ceros[0].pos : null,
        horizonte,
        /* Ancho de la niebla: de la parada opaca mas baja hasta el cero. */
        anchoNiebla: (ceros.length === 1 && opacas.length)
          ? +(Math.min(...opacas) - ceros[0].pos).toFixed(1) : null,
        /* Cualquier parada POR DEBAJO del cero seria luz derramada. */
        porDebajo: ceros.length === 1 ? paradas.filter(p => p.pos < ceros[0].pos - 0.5).length : null,
        /* Las DOS nieblas, para poder comparar el reparto. */
        nieblaArco: anchoDe(r),
        nieblaPista: capaPista ? anchoDe(capaPista) : null,
      };
    });

    const comprobar = (m, cuando) => {
      expect(m, 'GUARD: no existe la capa del anillo').not.toBeNull();
      expect(m.ceros, 'la mascara no llega a cero exactamente una vez ' + cuando).toBe(1);
      expect(Math.abs(m.muereEn - m.horizonte),
        'la mascara no muere en el corte del aro ' + cuando).toBeLessThanOrEqual(1);
      expect(m.porDebajo, 'asoma anillo por debajo del corte ' + cuando).toBe(0);
      /* La niebla tiene que tener ANCHO: es lo que separa «se disuelve» de «esta
         cortado». El suelo es deliberadamente flojo —cualquier filo vale 0— para
         que este aserto defienda la CUALIDAD y no un numero de diseno, que se
         calibra en el banco y no aqui. */
      expect(m.anchoNiebla, 'el horizonte corta en filo, no en niebla ' + cuando).toBeGreaterThan(8);
    };

    const reposo = await leerHorizonte();
    comprobar(reposo, 'en reposo');

    /* EL REPARTO DE NIEBLAS, que es el arreglo de la enmienda de s184 y sin este
       aserto no lo vigila nadie (comprobado: igualar las dos no ponia rojo nada).
       La PISTA es la escala y puede disolverse; el ARCO es informacion y nace
       EN el horizonte, asi que con la niebla larga tardaba **~2,2 min** en llegar
       a plena opacidad en un bloque de 25 -- el usuario lo reporto como «tarda en
       aparecer el contador de la parte izquierda». La relacion, y no los valores:
       los dos numeros son decisiones vivas, lo que no puede cambiar es cual de
       las dos capas se disuelve mas. */
    expect(reposo.nieblaPista, 'la pista no tiene capa propia con su niebla').not.toBeNull();
    expect(reposo.nieblaPista, 'la pista no se disuelve mas que el recorrido: se pierde el reparto '
      + '(pista ' + reposo.nieblaPista + ' contra arco ' + reposo.nieblaArco + ')')
      .toBeGreaterThan(reposo.nieblaArco * 2);

    await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
    await expect(page.locator('[data-pace-dial-fit]')).toHaveAttribute('data-pace-dial-running', '');
    /* La luz tarda 1,6 s en subir. Se espera a que este ENCENDIDA antes de
       comprobar: sin este guard, el aserto de abajo pasaria igual leyendo la
       home todavia apagada, que es el estado que ya se midio arriba — o sea, no
       probaria nada sobre la sesion. */
    await expect.poll(async () => await page.evaluate(() => Number(getComputedStyle(
      document.querySelector('[data-pace-home-body]')).getPropertyValue('--pace-on'))),
      { timeout: 5000 }).toBeGreaterThan(0.5);

    const activo = await leerHorizonte();
    comprobar(activo, 'con la sesion viva');
    expect(activo.anchoNiebla, 'la niebla cambia de ancho al arrancar la sesion').toBe(reposo.anchoNiebla);
  });

  /* LA LUZ NO PISA LA FILA DE MINUTOS (s184), y esto es un encargo literal del
   * usuario: «hay que tener cuidado que el radio del halo no llegue a pintar la
   * seccion de min 15-25-35-45-otro».
   *
   * NO ERA UNA PRECAUCION: ESTABA PASANDO. El limbo muere a 0,628 D del centro
   * —64 px pasado el aro— y entre el borde del aro y la pastilla del 45 hay
   * 24,5 px medidos a 1280x800. La banda de la fila recibia 57 sobre 255. El
   * comentario que gobernaba esa rampa afirmaba «por encima del aro hay ~59 px
   * hasta la fila de minutos», y esa premisa habia dejado de ser cierta.
   *
   * EL ASERTO ES RELACIONAL, no un umbral suelto: la luz en la fila tiene que
   * ser una fraccion despreciable de la que hay pegada al aro. Asi sigue
   * valiendo si manana se recalibra la intensidad entera — que es justo lo que
   * un umbral absoluto no aguantaria.
   *
   * Y LLEVA GUARD POR ARRIBA: se exige que SI haya luz junto al aro. Sin el, un
   * halo apagado del todo pasaria este aserto con matricula. */
  test('la luz no llega a la fila de minutos', async ({ page, context }) => {
    await sembrar(context);
    await irAlArtefacto(page);
    await asentar(page);
    await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
    await expect.poll(async () => Number(await page.evaluate(() => getComputedStyle(
      document.querySelector('[data-pace-home-body]')).getPropertyValue('--pace-on'))), { timeout: 6000 })
      .toBe(1);
    await asentar(page);

    const { geo, banda } = await perfilDeLuz(page);
    expect(geo.filaMin, 'GUARD: no se encuentra la fila de minutos').not.toBeNull();

    const aroArriba = geo.dial.top + geo.dial.height * 0.025;   /* r=47.5 de 50 */
    const juntoAlAro = banda(aroArriba - 14, aroArriba - 2, 'pico');
    const enLaFila = banda(geo.filaMin.top - 8, geo.filaMin.bottom + 8, 'pico');

    expect(juntoAlAro, 'GUARD: no hay luz ni pegada al aro; la comparacion seria vacia')
      .toBeGreaterThan(3);
    /* DOS MITADES, y hacen falta las dos.
       La RELACIONAL sola no vale aqui, y se descubrio calibrando: la luz pegada
       al aro es legitimamente tenue (5,07 sobre 255 medido), asi que un
       porcentaje pequeno de ella cae en el ruido del propio instrumento -- con
       el 12 % el umbral salia 0,61 y la app sana daba 1. Un aserto que no
       distingue de su propio ruido no aserta.
       La ABSOLUTA sola tampoco: pasaria si manana se subiera la intensidad
       entera y la fila subiera con ella.
       El techo absoluto NO es un numero inventado: `tokens.css` tiene medido
       que una desviacion de **7 sobre 255 es invisible** sobre este papel. Se
       exige menos de la mitad de eso. El mutante que devuelve la rampa a
       «solo atenuar» da **15,9** y falla por los dos lados. */
    expect(enLaFila, 'el halo llega a la fila de minutos (' + enLaFila
      + ' sobre 255, y 7 ya seria invisible)').toBeLessThanOrEqual(3);
    expect(enLaFila, 'la fila de minutos recibe demasiado respecto del propio aro ('
      + enLaFila + ' contra ' + juntoAlAro + ')').toBeLessThan(juntoAlAro * 0.5);
  });

  /* REESCRITO EN s184, Y EL CONTRATO CAMBIA A PROPOSITO.
   *
   * Hasta aqui esto exigia que la cola LLEGASE a la tarjeta de Camino: era la
   * decision de s159, «recuperar INTEGRACION», tomada mirando tres variantes al
   * lado. El usuario la revoco en s184 al pedir que el halo dejara de dar la
   * vuelta entera y se ajustara al tramo visible del anillo — con el mismo
   * cuidado de siempre: «puede continuar el halo un poco mas para que el corte
   * no sea brusco». O sea, ni filo en el horizonte ni cola hasta la tarjeta.
   *
   * Eso son tres bandas y no una, y las tres hacen falta: la de justo debajo del
   * horizonte prueba que la luz PASA de el (si muriera ahi seria la arista recta
   * que s157 persiguio media sesion), la de mas abajo prueba que se APAGA, y la
   * de la tarjeta prueba que no llega. Cualquiera de las tres sola se puede
   * satisfacer con la version equivocada.
   *
   * SU VERSION ANTERIOR DECLARABA «ESTE ASERTO NO SE HA CONSEGUIDO PONER ROJO».
   * Esta si: quitando las dos colas del sol, la banda de la tarjeta pasa de 0 a
   * 2,896 y el aserto falla. La diferencia no es el ingenio, es que el contrato
   * cambio: «la cola LLEGA a Actividades» pedia distinguir dos intensidades en
   * una zona donde los chips opacos y el limbo se mezclan, y «la cola NO llega a
   * la tarjeta» pide distinguir algo de nada, que si se ve.
   *
   * Y UNA TRAMPA DEL CALIBRADO, porque costo dos pasadas en falso: la hoja
   * declara la mascara DOS veces, `-webkit-mask-image` y `mask-image`. Mutar
   * solo la primera no cambia un pixel en Chrome, que usa la segunda — y el
   * mutante salia «verde» pareciendo que el aserto no servia.
   *
   * SOLO ESCRITORIO, que es el viewport de la suite; el perfil de movil se mide
   * en el banco (alli la tarjeta de Camino se solapa con el aro). */
  test('la cola pasa del horizonte, se apaga, y no llega a la tarjeta', async ({ page, context }) => {
    await sembrar(context);
    await irAlArtefacto(page);
    await asentar(page);
    await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
    await expect(page.locator('[data-pace-dial-fit]')).toHaveAttribute('data-pace-dial-running', '');
    /* SIN RELOJ VIRTUAL, y no es un descuido. `page.clock` congela el fundido de
       1,6 s de --pace-on: con el reloj instalado y avanzado a la meseta, la luz
       se media con el interruptor a medio camino y el halo daba 0,067 —lo cazo
       el guard de abajo—. Aqui no hace falta llegar a la meseta: los tres
       asertos son RATIOS entre bandas, y la envolvente escala las tres por
       igual. Se espera al fundido REAL, que es lo unico que se necesita. */
    await expect.poll(async () => Number(await page.evaluate(() => getComputedStyle(
      document.querySelector('[data-pace-home-body]')).getPropertyValue('--pace-on'))), { timeout: 6000 })
      .toBe(1);
    await asentar(page);

    const { geo, banda } = await perfilDeLuz(page);
    const yHorizonte = await page.evaluate(() => {
      const d = document.querySelector('[data-pace-dial-fit]');
      const r = d.getBoundingClientRect();
      return r.bottom - parseFloat(getComputedStyle(d).getPropertyValue('--pace-horizon'));
    });

    const haloPico = banda(geo.dial.top, geo.dial.top + geo.dial.height * 0.75, 'pico');
    /* Justo por debajo de la linea: aqui la luz tiene que SEGUIR. */
    const pasaElHorizonte = banda(yHorizonte + 6, yHorizonte + 26);
    /* Un tramo mas abajo: aqui tiene que estar apagandose. */
    const seApaga = banda(yHorizonte + 66, yHorizonte + 86);
    /* Y en el canto de la tarjeta ya no debe quedar nada. */
    const enLaTarjeta = banda(geo.spc.top - 20, geo.spc.top - 1);

    expect(haloPico, 'GUARD: no se mide luz ni en el aro; la comparacion seria vacia').toBeGreaterThan(5);
    expect(pasaElHorizonte, 'la luz muere EN el horizonte: eso es la arista recta que se queria evitar')
      .toBeGreaterThan(0.3);
    expect(seApaga, 'la cola no se apaga: sigue igual de viva 80 px por debajo del horizonte')
      .toBeLessThan(pasaElHorizonte * 0.7);
    expect(enLaTarjeta, 'la cola llega a la tarjeta de Camino: el halo vuelve a dar la vuelta')
      .toBeLessThan(pasaElHorizonte * 0.2);
  });
});
