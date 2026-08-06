/* PACE · E2E · UTILIDADES COMPARTIDAS DE LA HOME (s159)
 * ======================================================
 * Extraidas de `home-geometria.spec.js` cuando ese archivo llego a 631 lineas
 * y paso el limite de 500 de CLAUDE.md §1. **Ni una linea de cuerpo cambia**:
 * los tres specs de la home consumen exactamente la misma sonda que antes.
 *
 * Aqui vive lo que los tres necesitan a la vez: la semilla del Camino en curso,
 * la sonda unica de geometria, el parser de px y la espera a que la home se
 * asiente. Lo que solo usa un spec se queda en su spec.
 */
'use strict';

/* Camino en curso, con la forma EXACTA que escribe `startPath()`
   (state-paths.jsx:16-22). No se borra ningun nodo del DOM: el estado es real
   y la tarjeta desaparece porque `SuggestedPathCard` retorna null (:218). */
const CAMINO_ACTIVO = {
  paths: {
    current: { id: 'path.breath', stepIndex: 0, startedAt: 1, skippedSteps: [], doneCount: 0 },
    lastViewed: 'path.breath',
    completed: {},
    favorite: null,
  },
};

/* Sonda unica. Devuelve lo medido en la pagina, sin interpretar nada aqui.
   GUARD DE CERO: si no hay ni un aro, `dial` viene a null y todo aserto que
   lo use falla con mensaje propio en vez de pasar por vacio. */
function sonda(page) {
  return page.evaluate(() => {
    const q = s => document.querySelector(s);
    const caja = el => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { w: +b.width.toFixed(1), h: +b.height.toFixed(1), top: +b.top.toFixed(1), bottom: +b.bottom.toFixed(1) };
    };
    const dial = q('[data-pace-dial-fit]');
    const spc = q('[data-pace-spc]');
    const act = q('[data-pace-activitybar]');
    const body = q('[data-pace-home-body]');
    const raiz = getComputedStyle(document.documentElement);

    /* EL HORIZONTE REAL, en px, leido de lo que el navegador ha computado.

       Hasta s158 esto era el inset inferior de un `clip-path`. Ahora el aro no
       se corta: se DESVANECE, con una mascara sobre [data-pace-dial-ring] cuyas
       tres paradas caen en 100% - (horizonte + rampa), 100% - horizonte y
       100% - (horizonte - rampa). La rampa es simetrica POR CONSTRUCCION, asi
       que el horizonte es la parada del medio — y de paso la simetria se
       comprueba, porque si dejara de cumplirse esta lectura estaria eligiendo
       un numero cualquiera de tres. */
    let recorte = null;
    let rampaSimetrica = null;
    const capaAnillo = dial ? dial.querySelector('[data-pace-dial-ring]') : null;
    if (capaAnillo) {
      const mascara = getComputedStyle(capaAnillo).maskImage || '';
      /* Con el GRUPO de captura, no limpiando la cadena: quitarle a
         «calc(100% - 65px)» todo lo que no sea digito deja «10065», y el aserto
         de abajo recibio exactamente ese 10000 de diferencia. */
      const paradas = [...mascara.matchAll(/calc\(100% - ([\d.]+)px\)/g)]
        .map(m2 => parseFloat(m2[1]))
        .sort((a, b) => a - b);
      if (paradas.length === 3) {
        recorte = paradas[1];
        rampaSimetrica = Math.abs((paradas[2] - paradas[1]) - (paradas[1] - paradas[0])) < 0.6;
      }
    }
    /* El bloque que hace de HORIZONTE se elige por POSICION, no por selector:
       es el primero que aparece debajo del aro. En movil es la tarjeta; en
       Desktop el `order` de _responsive.js pone Actividades ahi y manda la
       tarjeta al fondo. Elegir `spc || act` a secas mide contra el bloque
       equivocado en Desktop — comprobado. */
    const horizonte = [spc, act]
      .filter(Boolean)
      .map(el => [el, el.getBoundingClientRect().top])
      .filter(([, t]) => dial && t > dial.getBoundingClientRect().top)
      .sort((a, b) => a[1] - b[1])
      .map(([el]) => el)[0] || null;

    return {
      hayDial: !!dial,
      haySpc: !!spc,
      hayAct: !!act,
      D: raiz.getPropertyValue('--pace-timer-d').trim(),
      solape: raiz.getPropertyValue('--pace-activities-overlap').trim(),
      recorte,
      rampaSimetrica,
      // Solape REAL: cuanto del aro queda por debajo del borde superior del horizonte.
      solapeReal: (dial && horizonte) ? +(caja(dial).bottom - caja(horizonte).top).toFixed(1) : null,
      dial: caja(dial), spc: caja(spc), act: caja(act),
      desbordeV: body ? body.scrollHeight - body.clientHeight : null,
      desbordeH: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ordenVisual: [
        dial ? ['dial', caja(dial).top] : null,
        spc ? ['spc', caja(spc).top] : null,
        act ? ['act', caja(act).top] : null,
      ].filter(Boolean).sort((a, b) => a[1] - b[1]).map(x => x[0]).join(' > '),
    };
  });
}

const px = v => (v === '' || v == null) ? null : parseFloat(v);

/* TRAMPA MEDIDA (s156). `[data-pace-main-content]` entra con la animacion
   `pace-module-in`, que lo desplaza 10 px durante 640 ms (tokens.css). Medir
   rectangulos antes de que termine da diferencias de hasta 10 px EXACTOS entre
   el aro y el bloque de abajo, y lleva a reportar una desincronizacion que no
   existe. Se espera a que las animaciones acaben —no un timeout al azar— y a
   dos frames, que es lo que tarda el motor en reaccionar a cualquier cambio. */
async function asentar(page) {
  await page.evaluate(async () => {
    const mc = document.querySelector('[data-pace-main-content]');
    if (mc && mc.getAnimations) {
      await Promise.all(mc.getAnimations().map(a => a.finished.catch(() => {})));
    }
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
}

module.exports = { CAMINO_ACTIVO, sonda, px, asentar };
