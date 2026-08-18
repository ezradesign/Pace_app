/* PACE · E2E · LA PILL DE FOCO/PAUSA/LARGA EN MOVIL (s169)
 * ========================================================
 * s46 (v0.25.0) oculto la pill en movil porque COLISIONA con los tres iconos
 * top-right. s128 diagnostico por que —es `position:absolute` centrada, o sea
 * FUERA DE FLUJO: no empuja, no encoge y no puede cambiar el alto de la fila,
 * asi que solo puede solaparse— y s168 lo midio: a 320 pisa tres iconos, a 375
 * dos, a 414 dos, IDENTICO de 568 a 932 px de alto. La altura no intervenia.
 *
 * s169 le da su propia linea. Lo que ESTE archivo defiende, y por que:
 *
 *  1. EL SOLAPE DESAPARECE. El banco de s168 NO probo esto: simulo la fila
 *     propia creciendo el `min-height` de la topbar 42 px y midio que le
 *     costaba al aro. Eso mide el COSTE, no el ARREGLO. Aqui se cruzan los
 *     rectangulos de verdad, que es lo unico que demuestra que ya no se pisan.
 *     Y se cruzan contra TODOS los controles del documento: la primera version
 *     de esta sonda miraba solo `[data-pace-topbar-icon]` y daba verde a 320 px
 *     mientras la pill pisaba el boton de menu 15x34 px, porque ese boton no es
 *     hijo de la topbar. El banco de s168 tenia el mismo punto ciego.
 *
 *  2. EL GATE TIENE DOS SUELOS Y CADA UNO SALE DE UNA MEDIDA DISTINTA.
 *
 *     ALTO >= 760, por el ARO. Los 42 px de la fila propia salen de el. Barrido
 *     de 9 anchos (320 a 768) x 8 alturas: a 736 el aro paga 4 px a 412, 20 a
 *     428 y 30 a 440; a 760 ya es gratis en todos. El «>= 844» que se manejaba
 *     antes no era el umbral, era la siguiente altura que s168 habia medido; y
 *     «squeeze == 0» no sirve de gate —una media query no lee una custom
 *     property— y ademas vale 0 desde 736, justo por debajo del umbral real.
 *
 *     ANCHO >= 390, por el BOTON DE MENU, que vive FUERA de la topbar. La pill
 *     mide 244 px fijos y va centrada, asi que el hueco es ancho/2 - 175,5: a
 *     320 lo PISA 15 px, a 360 deja 5, a 375 deja 12 y a 390 deja 20. El
 *     usuario descarto los 12 px de 375 por justos.
 *
 *  3. EL ARO NO ENCOGE. Se mide A/B DENTRO del mismo viewport —con la pill y
 *     con la pill forzada a `display:none`—, no contra un numero escrito aqui:
 *     un aserto contra una constante caducaria en cuanto cambie la geometria, y
 *     ademas un control medido en otras condiciones no seria un control.
 *
 *  4. EL ORDEN DE FOCO DE LA TOPBAR. `home-a11y.spec.js` defiende WCAG 2.4.3
 *     pero SOLO dentro de `[data-pace-home-stack]`: filtra la topbar a
 *     proposito. O sea que al bajar la pill a una segunda fila el foco podria
 *     recorrerla de abajo arriba —el defecto exacto que s160 arreglo en la
 *     home— y NINGUNA prueba se enteraria. Se aserta aqui, con el mismo
 *     contrato relacional: el foco no retrocede en pantalla.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto } = require('./helpers');
const { sonda, asentarGeometria } = require('./home.helpers');

/* LAS COMBINACIONES, con lo que el gate TIENE que hacer en cada una y por que.
   Los dos suelos se prueban por separado y cada uno con su pareja al otro lado:
   390x760 se ve y 390x736 no (suelo de ALTO, mismo ancho); 390x844 se ve y
   375x844 no (suelo de ANCHO, misma altura). */
const CASOS = [
  { ancho: 390, alto: 760, ve: true, por: 'los dos suelos, justos' },
  { ancho: 412, alto: 844, ve: true, por: 'Pixel' },
  { ancho: 428, alto: 800, ve: true, por: 'iPhone Pro Max' },
  { ancho: 440, alto: 956, ve: true, por: 'el movil mas ancho medido' },
  { ancho: 390, alto: 736, ve: false, por: 'suelo de ALTO: a 736 el aro pagaria en los anchos grandes' },
  { ancho: 390, alto: 667, ve: false, por: 'suelo de ALTO: a 667 el aro pierde 56 px' },
  { ancho: 375, alto: 844, ve: false, por: 'suelo de ANCHO: a 375 quedan 12 px del boton de menu' },
  { ancho: 360, alto: 844, ve: false, por: 'suelo de ANCHO: a 360 quedan 5 px' },
  { ancho: 320, alto: 736, ve: false, por: 'suelo de ANCHO: a 320 la pill PISA el boton de menu' },
];

/* HUECO MINIMO con el control mas cercano de su fila. Es un umbral de CRITERIO,
   no una medida: el usuario descarto por justos los 12 px que quedaban a 375, y
   el ancho mas estrecho que ahora pasa el gate (390) deja 20 px medidos. Se
   aserta 16 para que una regresion a 12 o a 5 se ponga roja sin que 20 flaquee. */
const HUECO_MINIMO = 16;

const CSS_SIN_PILL = '[data-pace-topbar] [data-pace-tabs] { display: none !important; }';

/**
 * Mide la topbar: si la pill se ve, y con que la cruza.
 *
 * El solape se calcula cruzando rectangulos y NO mirando el layout, porque una
 * caja fuera de flujo se pisa con sus hermanas sin que nada del layout lo diga
 * (s128). Se cruzan los DOS ejes: solo en X no es un solape.
 *
 * SE BUSCA CONTRA TODOS LOS CONTROLES DEL DOCUMENTO, no contra los hijos de la
 * topbar, y eso es una correccion de s169 que costo un defecto real. El banco de
 * s168 cruzaba `[data-pace-topbar] > *` y la primera version de esta sonda
 * miraba `[data-pace-topbar-icon]`: las dos daban CERO SOLAPES a 320 px mientras
 * la pill pisaba el boton de menu 15x34 px, porque ese boton NO es hijo de la
 * topbar. Un censo que mira el sitio equivocado dice «limpio» con la misma cara
 * que uno que mira el sitio bueno.
 */
function sondaTopbar(page) {
  return page.evaluate(() => {
    const top = document.querySelector('[data-pace-topbar]');
    const pill = document.querySelector('[data-pace-topbar] [data-pace-tabs]');
    const iconos = [...document.querySelectorAll('[data-pace-topbar] [data-pace-topbar-icon]')];
    if (!top || !pill) return { rota: 'no hay topbar o no hay pill en el DOM' };
    if (!iconos.length) return { rota: 'no hay iconos en la topbar' };
    const visible = getComputedStyle(pill).display !== 'none';
    const rp = pill.getBoundingClientRect();
    const rt = top.getBoundingClientRect();

    const nombre = el => (el.getAttribute('aria-label') || el.textContent || el.tagName)
      .trim().slice(0, 24);
    /* Todo control con caja, fuera de la pill y de sus propios botones. */
    const otros = !visible ? [] : [...document.querySelectorAll('button, a, [role="button"]')]
      .filter(el => el !== pill && !pill.contains(el))
      .map(el => ({ el, r: el.getBoundingClientRect() }))
      .filter(o => o.r.width > 0 && o.r.height > 0);

    const cruces = otros.map(({ el, r }) => {
      const x = Math.min(r.right, rp.right) - Math.max(r.left, rp.left);
      const y = Math.min(r.bottom, rp.bottom) - Math.max(r.top, rp.top);
      return (x > 0.5 && y > 0.5)
        ? (nombre(el) + ': ' + Math.round(x) + 'x' + Math.round(y) + ' px') : null;
    }).filter(Boolean);

    /* Hueco horizontal con el control mas cercano que COMPARTE su banda vertical
       — o sea el que esta en su misma fila y podria llegar a pisarla. */
    let hueco = null, vecino = null;
    for (const { el, r } of otros) {
      const y = Math.min(r.bottom, rp.bottom) - Math.max(r.top, rp.top);
      if (y <= 0.5) continue;
      const d = r.left >= rp.right ? r.left - rp.right
        : (r.right <= rp.left ? rp.left - r.right : 0);
      if (hueco === null || d < hueco) { hueco = Math.round(d); vecino = nombre(el); }
    }

    return {
      visible,
      cruces,
      hueco,
      vecino,
      topbarAlto: +rt.height.toFixed(1),
      /* Que la pill quepa DENTRO de la topbar: si sobresale por abajo se estaria
         metiendo en el contenido aunque no cruce ningun icono. */
      sobresale: visible ? +Math.max(0, rp.bottom - rt.bottom).toFixed(1) : 0,
      pillAncho: visible ? +rp.width.toFixed(1) : null,
      /* Comprimida: pide mas ancho del que le han dado. */
      comprimida: visible ? pill.scrollWidth > Math.ceil(rp.width) + 1 : false,
    };
  });
}

/* Inyecta (o retira) una hoja al final del head: gana al `!important` de la piel
   por orden de cascada, sin tocar el archivo de estilos. */
async function conHoja(page, css) {
  await page.evaluate((hoja) => {
    const previo = document.getElementById('spec-pill');
    if (previo) previo.remove();
    if (hoja) {
      const s = document.createElement('style');
      s.id = 'spec-pill';
      s.textContent = hoja;
      document.head.appendChild(s);
    }
  }, css || null);
}

test.describe('la pill de Foco/Pausa/Larga en movil', () => {
  for (const caso of CASOS) {
    const nombre = caso.ancho + 'x' + caso.alto + ': la pill '
      + (caso.ve ? 'SE VE y no pisa ningun icono' : 'sigue oculta') + ' (' + caso.por + ')';

    test(nombre, async ({ page, context }) => {
      const errores = capturarErrores(page);
      await sembrar(context);
      await page.setViewportSize({ width: caso.ancho, height: caso.alto });
      await irAlArtefacto(page);
      await asentarGeometria(page);

      /* GUARD DE PIEL: por encima de 768 se aplica la de escritorio y esta
         prueba mediria otra cosa pasando en verde. */
      const piel = await page.evaluate(() => getComputedStyle(document.documentElement)
        .getPropertyValue('--pace-skin').trim());
      expect(piel, 'GUARD: no se esta midiendo la piel de movil').toBe('movil');

      const m = await sondaTopbar(page);
      expect(m.rota, 'GUARD: la sonda no reconocio la topbar').toBeUndefined();

      expect(m.visible, 'la pill deberia ' + (caso.ve ? 'verse' : 'estar oculta')
        + ' a ' + caso.ancho + 'x' + caso.alto + ' (' + caso.por + ')').toBe(caso.ve);

      if (!caso.ve) {
        expect(errores).toEqual([]);
        return;
      }

      /* 1 · EL ARREGLO: cero cruces con NINGUN control de la pantalla. Es lo que
         el banco de s168 no llego a probar, y mirando ademas fuera de la topbar,
         que es donde estaba el defecto que se escapo. */
      expect(m.cruces, 'la pill pisa controles a ' + caso.ancho + 'x' + caso.alto)
        .toEqual([]);
      expect(m.hueco, 'la pill queda a ' + m.hueco + ' px de «' + m.vecino + '» a '
        + caso.ancho + 'x' + caso.alto + ', por debajo del minimo de ' + HUECO_MINIMO
        + ' px. El suelo de ancho del gate (390) existe justo por esto.')
        .toBeGreaterThanOrEqual(HUECO_MINIMO);
      expect(m.sobresale, 'la pill se sale de la topbar por abajo a '
        + caso.ancho + 'x' + caso.alto).toBe(0);
      expect(m.comprimida, 'la pill va comprimida a ' + caso.ancho + 'x' + caso.alto)
        .toBe(false);

      /* 2 · EL ARO NO ENCOGE. Control A/B en el MISMO viewport: se apaga la
         pill, se deja asentar y se vuelve a medir. */
      const conPill = await sonda(page);
      await conHoja(page, CSS_SIN_PILL);
      await asentarGeometria(page);
      const sinPill = await sonda(page);
      await conHoja(page, null);
      await asentarGeometria(page);

      expect(conPill.hayDial && sinPill.hayDial,
        'GUARD: no hay aro que medir a ' + caso.ancho + 'x' + caso.alto).toBe(true);
      expect(parseFloat(conPill.D),
        'mostrar la pill ENCOGE el aro a ' + caso.ancho + 'x' + caso.alto
        + ': ' + sinPill.D + ' -> ' + conPill.D + '. El gate de dos bandas existe '
        + 'justo para que esto no pase.').toBe(parseFloat(sinPill.D));

      expect(errores).toEqual([]);
    });
  }

  /* EL ORDEN DE FOCO DENTRO DE LA TOPBAR (WCAG 2.4.3), que `home-a11y.spec.js`
     excluye por diseno. Mismo contrato relacional: el foco no sube en pantalla.

     Se recorre con Tab de verdad y se filtra a la topbar; se corta al repetirse
     una firma porque el foco da la vuelta. */
  test('el foco recorre la topbar en el orden en que se ve', async ({ page, context }) => {
    const errores = capturarErrores(page);
    await sembrar(context);
    await page.setViewportSize({ width: 390, height: 844 });
    await irAlArtefacto(page);
    await asentarGeometria(page);

    const m = await sondaTopbar(page);
    expect(m.visible, 'GUARD: sin la pill visible esta prueba no mide el caso nuevo')
      .toBe(true);

    const visto = new Set();
    const paradas = [];
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      const p = await page.evaluate(() => {
        const a = document.activeElement;
        const top = document.querySelector('[data-pace-topbar]');
        if (!a || a === document.body || !top || !top.contains(a)) return null;
        const r = a.getBoundingClientRect();
        return {
          top: Math.round(r.top),
          izq: Math.round(r.left),
          texto: (a.getAttribute('aria-label') || a.textContent || a.tagName).trim().slice(0, 24),
        };
      });
      if (!p) continue;
      const firma = p.texto + '@' + p.top + ',' + p.izq;
      if (visto.has(firma)) break;
      visto.add(firma);
      paradas.push(p);
    }

    expect(paradas.length, 'GUARD: el recorrido no encontro controles en la topbar')
      .toBeGreaterThan(4);

    const retrocesos = [];
    for (let i = 1; i < paradas.length; i++) {
      if (paradas[i].top < paradas[i - 1].top - 1) {
        retrocesos.push('«' + paradas[i - 1].texto + '» (' + paradas[i - 1].top + ') -> «'
          + paradas[i].texto + '» (' + paradas[i].top + ')');
      }
    }
    expect(retrocesos, 'el foco SUBE dentro de la topbar: la pill esta en una fila '
      + 'y el DOM la lee en otra (WCAG 2.4.3). Recorrido: '
      + paradas.map(p => p.texto + '@' + p.top).join(' -> ')).toEqual([]);

    expect(errores).toEqual([]);
  });

  /* NO REGRESION EN ESCRITORIO: la pill siempre se vio ahi y sigue centrada. */
  test('escritorio: la pill sigue visible y centrada', async ({ page, context }) => {
    const errores = capturarErrores(page);
    await sembrar(context);
    await page.setViewportSize({ width: 1280, height: 800 });
    await irAlArtefacto(page);
    await asentarGeometria(page);

    const m = await sondaTopbar(page);
    expect(m.rota, 'GUARD: la sonda no reconocio la topbar').toBeUndefined();
    expect(m.visible, 'la pill ha desaparecido en escritorio').toBe(true);
    expect(m.cruces, 'la pill pisa iconos en escritorio').toEqual([]);

    const centrada = await page.evaluate(() => {
      const top = document.querySelector('[data-pace-topbar]');
      const pill = document.querySelector('[data-pace-topbar] [data-pace-tabs]');
      const rt = top.getBoundingClientRect(), rp = pill.getBoundingClientRect();
      return Math.abs(((rp.left + rp.right) / 2) - ((rt.left + rt.right) / 2));
    });
    expect(centrada, 'la pill ha dejado de estar centrada en escritorio')
      .toBeLessThan(2);

    expect(errores).toEqual([]);
  });
});
