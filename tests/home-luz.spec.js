/* PACE · E2E · LA LUZ DEL POMODORO (s158, extraido en s159)
 * =========================================================
 * Defiende el CONTRATO de la atmosfera: cuando existe, de donde saca el color,
 * que no toca la geometria y que se apaga sola. La FORMA de la curva en el
 * tiempo —pico, meseta, monotonia y escalon— vive en `home-luz-curva.spec.js`,
 * que es otra pregunta y otro banco.
 *
 * NADA DE COLORES CONCRETOS. Ni un aserto mira un tono: todos son relacionales,
 * para que sigan valiendo cuando manana se recalibre una hora del dia.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const sharp = require('sharp');
const { sembrar, irAlArtefacto } = require('./helpers');
const { sonda, px, asentar } = require('./home.helpers');


test.describe('geometria de la home · la luz del Pomodoro', () => {
  /* Lee las DOS magnitudes de la luz alli donde se publican, mas los atributos
     estables del aro. No se aserta un solo color: el aserto tiene que seguir
     valiendo cuando manana se cambie el tono de una hora. */
  /* LOS TRES MANDOS SON COSAS DISTINTAS y los asertos no deben confundirlos:
       --pace-on     el INTERRUPTOR: 0 sin sesion, 1 con sesion (corriendo o
                     pausada). Lleva el fundido de 1,6 s.
       --pace-i      la FORMA de la intensidad DENTRO de la sesion. No lleva la
                     puerta de «hay sesion» a proposito: al terminar conserva su
                     ultimo valor para que la luz se apague sin dar antes un
                     salto. No se transiciona.
       --pace-pausa  la recogida al pausar (1 / 0,45), con fundido de 500 ms.
                     Salio de `i` en s159: multiplicado dentro de ella, pausar
                     bajaba la luz de 0,517 a 0,233 EN UN FRAME.
     Confundirlos costo tres rojos: se pedia a `i` que valiera 0 en reposo. */
  const leerLuz = (page) => page.evaluate(() => {
    const d = document.querySelector('[data-pace-dial-fit]');
    const w = document.querySelector('[data-pace-timer-wrap]');
    const sol = document.querySelector('[data-pace-sun]');
    const cw = getComputedStyle(w);
    return {
      running: d.hasAttribute('data-pace-dial-running'),
      paused: d.hasAttribute('data-pace-dial-paused'),
      on: cw.getPropertyValue('--pace-on').trim(),
      i: cw.getPropertyValue('--pace-i').trim(),
      k: cw.getPropertyValue('--pace-k').trim(),
      pausa: cw.getPropertyValue('--pace-pausa').trim(),
      haySol: !!sol,
    };
  });

  /* EL MODELO ENTERO, EN UN ASERTO: Pomodoro parado = CERO atmosfera. Antes de
     s158 la home tenia halo en reposo (la capa de suelo llevaba el tono escrito
     a fuego), y el usuario lo leyo como «ya se ve color con el Pomodoro
     parado». Aqui no se pide que sea tenue: se pide que sea NADA. */
  test('con el Pomodoro parado no hay ni una gota de luz', async ({ page, context }) => {
    await sembrar(context);
    await irAlArtefacto(page);
    const reposo = await leerLuz(page);
    expect(reposo.haySol, 'GUARD: no existe el nodo del sol; el resto no probaria nada').toBe(true);
    expect(reposo.running, 'en reposo no debe haber marca de «corriendo»').toBe(false);
    expect(reposo.paused, 'en reposo no debe haber marca de «pausado»').toBe(false);
    expect(Number(reposo.on), 'la home en reposo tiene luz: el modelo dice CERO').toBe(0);

    /* Y las CAPAS lo obedecen: sin esto, --pace-i podria valer 0 y el sol pintar
       igual por su cuenta. Se leen los dos pseudos, no el contenedor: el
       contenedor NO lleva opacity a proposito (una opacidad menor que 1 crearia
       un grupo de aislamiento). La opacidad en reposo no esta en transicion (no
       ha cambiado nada), asi que leerla aqui es fiable. */
    const capas = await page.evaluate(() => {
      const s = document.querySelector('[data-pace-sun]');
      return { limbo: getComputedStyle(s, '::before').opacity, bloom: getComputedStyle(s, '::after').opacity };
    });
    expect(Number(capas.limbo), 'el limbo no consume --pace-i').toBe(0);
    expect(Number(capas.bloom), 'el bloom no consume --pace-i').toBe(0);
  });

  test('reposo, activo y pausado se distinguen por atributo estable', async ({ page, context }) => {
    await sembrar(context);
    await irAlArtefacto(page);
    const dial = page.locator('[data-pace-dial-fit]');

    const reposo = await leerLuz(page);
    await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
    await expect(dial).toHaveAttribute('data-pace-dial-running', '');
    /* `--pace-on` NO ES UN BOOLEANO: es el interruptor de la luz y se FUNDE en
       1,6 s (s159). Leerlo justo despues del atributo es muestrear el fundido
       en su primer instante — medido en s161, ahi vale **0 exacto**, y solo
       sube a 0,0039 a los 50 ms, 0,028 a los 100 y 0,37 a los 300.

       Este test y el de abajo lo leian a pelo y exigian `> 0`, o sea que
       pasaban o no segun si el viaje de ida y vuelta de Playwright dejaba pasar
       un frame. En local casi siempre lo dejaba; **en el runner de Linux caia
       en el MISMO frame y daba 0**, y eso puso el CI en rojo durante DOS
       versiones (v0.90.0 y v0.91.0) mientras las dos sesiones cerraban
       declarando verde en local.

       Se espera a que encienda en vez de bajar el liston: el contrato que se
       aserta sigue siendo «arrancar un bloque enciende la luz», y si no
       encendiera nunca, esto seguiria fallando. Comprobado poniendolo rojo.

       Y de paso corrige una suposicion heredada: `page.clock` **no** congela
       este fundido — medida la curva con y sin reloj virtual, es identica. */
    await expect.poll(async () => Number((await leerLuz(page)).on),
      { timeout: 5000, message: 'corriendo no enciende la luz' }).toBeGreaterThan(0);
    const activo = await leerLuz(page);
    expect(activo.paused, 'corriendo no es pausado').toBe(false);

    await page.getByRole('button', { name: 'Pausar', exact: true }).click();
    await expect(dial).toHaveAttribute('data-pace-dial-paused', '');
    const pausado = await leerLuz(page);
    expect(pausado.running, 'pausado no es corriendo').toBe(false);

    /* Cada mando responde de lo suyo, sin fijar valores. El INTERRUPTOR separa
       reposo de los dos estados vivos —pausar no termina la sesion, asi que
       sigue encendido—, y la INTENSIDAD separa corriendo de pausado. */
    expect(Number(reposo.on), 'en reposo el interruptor no esta apagado').toBe(0);
    expect(Number(activo.on), 'corriendo no enciende la luz').toBeGreaterThan(0);
    expect(Number(pausado.on), 'pausar apaga la luz del todo, y pausar no es terminar').toBeGreaterThan(0);
    /* La distincion pausado/corriendo vive en --pace-pausa desde s159, no en
       `i`: si volviera a `i` regresaria el corte de un frame al pausar. */
    expect(Number(activo.pausa), 'corriendo la luz esta recogida').toBe(1);
    await expect.poll(async () => Number((await leerLuz(page)).pausa), { timeout: 4000 })
      .toBeLessThan(1);
  });

  /* LA ATMOSFERA NO SE QUEDA PEGADA. En s157 `progress` se quedaba en 1 al
     completar un bloque y nadie lo bajaba: la home se quedaba con la luz del
     final de sesion y el Pomodoro parado, y seguia asi tras elegir en el
     BreakMenu. Se prueba con el reloj VIRTUAL, llevando el bloque hasta el
     final de verdad en vez de simular el estado. */
  test('al terminar el bloque la luz se retira sola', async ({ page, context }) => {
    await sembrar(context);
    await page.clock.install();
    await irAlArtefacto(page);
    await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
    await expect(page.locator('[data-pace-dial-fit]')).toHaveAttribute('data-pace-dial-running', '');
    /* Se ESPERA a que encienda, por lo mismo que el test de arriba: `--pace-on`
       se funde en 1,6 s y justo tras el atributo vale 0 exacto. Este era el
       segundo de los dos rojos del CI. */
    await expect.poll(async () => Number((await leerLuz(page)).on),
      { timeout: 5000, message: 'no hay luz con el bloque corriendo' }).toBeGreaterThan(0);

    /* `fastForward` y no `runFor`: el segundo dispara los ~1500 ticks del
       bloque UNO A UNO, con su re-render cada vez, y esta sola prueba costaba
       27,7 s — la suite entera se iba a 1,1 min y el §4 fija el minuto como
       techo. El salto seco vale porque el contador es TIMESTAMP-BASED desde
       s96: `remaining` se deriva del reloj real, no de un contador que se
       decrementa, asi que un unico tick con el reloj ya avanzado da el mismo
       resultado que mil. */
    await page.clock.fastForward(25 * 60 * 1000 + 2000);
    /* El BreakMenu se abre encima; no decide nada sobre la luz, y por eso el
       aserto no lo toca. Lo que importa es que el bloque ya no esta vivo. */
    await expect(page.locator('[data-pace-dial-fit]')).not.toHaveAttribute('data-pace-dial-running', '');
    /* SE ESPERA AL FUNDIDO. --pace-on esta registrado con @property e interpola
       en 1,6 s, asi que leerlo justo tras el cierre devuelve un valor a MEDIO
       CAMINO — la primera version leyo 0,289 y parecia que la luz se quedaba
       pegada. Lo que se defiende no es la velocidad del fundido, es que TERMINE
       en cero. Y se mira el INTERRUPTOR, no la intensidad: `i` conserva a
       proposito su ultimo valor para que la luz se apague sin pegar antes un
       salto de forma. */
    await expect.poll(async () => Number((await leerLuz(page)).on), { timeout: 6000 })
      .toBe(0);
  });

  /* LA LUZ NO PUEDE HACER SCROLL A LA HOME.

     Las dos capas del sol son cajas ABSOLUTAS que desbordan a proposito, y
     [data-pace-home-body] es un contenedor de scroll: sin recortar, ese
     desborde se vuelve SCROLLABLE. Paso en s158 y la suite NO lo caza —el valor
     se medía en la sonda desde s156 y no lo asertaba nadie—; se descubrio
     sirviendo el artefacto de HEAD en paralelo: 0 px de scroll en v0.89.0 y
     125 px con la luz encendida.

     El aserto es RELACIONAL y por eso no caduca: la home puede scrollear por
     motivos legitimos (viewport bajo, y con reduced-motion son 11 px conocidos
     desde s156), pero encender la luz no puede cambiar ese numero. */
  test('encender la luz no le anade scroll a la home', async ({ page, context }) => {
    await sembrar(context);
    await irAlArtefacto(page);
    await asentar(page);

    const scroll = () => page.evaluate(() => {
      const b = document.querySelector('[data-pace-home-body]');
      return b.scrollHeight - b.clientHeight;
    });
    const apagada = await scroll();

    await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
    await expect(page.locator('[data-pace-dial-fit]')).toHaveAttribute('data-pace-dial-running', '');
    // El fundido tarda 1,6 s; el desborde es geometrico y no espera, pero se deja asentar.
    await asentar(page);
    const encendida = await scroll();

    // GUARD: si la luz no se hubiera encendido, comparar dos ceros no probaria nada.
    const hayLuz = await page.evaluate(() => Number(getComputedStyle(
      document.querySelector('[data-pace-home-body]')).getPropertyValue('--pace-on')) > 0);
    expect(hayLuz, 'GUARD: la luz no se encendio; la comparacion seria vacia').toBe(true);
    expect(encendida, 'la luz le anade scroll a la home (era ' + apagada + ' y pasa a ' + encendida + ')')
      .toBe(apagada);
  });

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


  /* UNA SOLA FUENTE DE COLOR PARA TODAS LAS CAPAS. Este es el defecto de s157
     convertido en red: alli la corona viajaba con la hora pero la luz de suelo
     —la capa de MAYOR superficie— llevaba su ambar escrito a fuego, y de ahi
     salio «el color siempre parece el mismo». El aserto no mira ningun tono:
     mueve la hora y exige que las DOS capas se enteren. */
  test('las dos capas beben de la misma fuente de color', async ({ page, context }) => {
    await sembrar(context);
    await irAlArtefacto(page);
    const r = await page.evaluate(() => {
      /* La hora se escribe en [data-pace-home-body], que es DONDE la publica
         FocusTimer y donde se declaran los colores. Escribirla en el contenedor
         del aro no movia nada: es un DESCENDIENTE de quien calcula --pace-luz,
         y un descendiente no puede cambiar el computado de su ancestro. */
      const w = document.querySelector('[data-pace-home-body]');
      const s = document.querySelector('[data-pace-sun]');
      if (!w || !s) return null;
      /* El grano es un data URI enorme e identico en las dos capas: fuera, o la
         comparacion se ahoga en el. */
      const sinGrano = t => t.replace(/url\("data:[^"]*"\)/g, 'GRANO');
      const lee = () => ({
        luz: getComputedStyle(s).getPropertyValue('--pace-luz').trim(),
        limbo: sinGrano(getComputedStyle(s, '::before').backgroundImage),
        bloom: sinGrano(getComputedStyle(s, '::after').backgroundImage),
      });
      w.style.setProperty('--pace-k', '0');
      const amanecer = lee();
      w.style.setProperty('--pace-k', '0.375');
      const mediodia = lee();
      w.style.removeProperty('--pace-k');
      return { amanecer, mediodia };
    });
    expect(r, 'GUARD: falta el sol o el contenedor que publica la hora').not.toBeNull();

    // GUARD: si la hora no mueve el color, las dos comprobaciones de abajo pasarian por vacio.
    expect(r.amanecer.luz, 'la hora no cambia --pace-luz: el aserto no probaria nada')
      .not.toBe(r.mediodia.luz);
    expect(r.mediodia.limbo, 'el limbo no sigue la hora: lleva un tono propio')
      .not.toBe(r.amanecer.limbo);
    expect(r.mediodia.bloom, 'el bloom no sigue la hora: lleva un tono propio')
      .not.toBe(r.amanecer.bloom);
    // Y la siguen consumiendo LA MISMA variable, no dos parecidas.
    expect(r.mediodia.limbo.indexOf(r.mediodia.luz) >= 0, 'el limbo no consume --pace-luz').toBe(true);
    expect(r.mediodia.bloom.indexOf(r.mediodia.luz) >= 0, 'el bloom no consume --pace-luz').toBe(true);
  });

  /* La luz vive FUERA del elemento recortado, y esa es toda la diferencia.
     Metida dentro (s156) el clip-path la cortaba con una arista de 54-68
     unidades en 1 px, que es lo que el usuario leyo como «limite tecnico». */
  test('el sol vive fuera del recorte y se dimensiona con el aro', async ({ page, context }) => {
    await sembrar(context);
    await irAlArtefacto(page);
    await asentar(page);
    const m = await sonda(page);
    expect(m.hayDial, 'GUARD: no hay ningun aro en la home').toBe(true);

    const sol = await page.evaluate(() => {
      const s = document.querySelector('[data-pace-sun]');
      if (!s) return null;
      const d = document.querySelector('[data-pace-dial-fit]');
      const cs = getComputedStyle(s);
      const limbo = getComputedStyle(s, '::before');
      return {
        ancho: Math.round(s.getBoundingClientRect().width),
        aro: Math.round(d.getBoundingClientRect().width),
        recorte: cs.clipPath,
        dentroDelMarco: d.contains(s),
        limboW: Math.round(parseFloat(limbo.width)),
        limboH: Math.round(parseFloat(limbo.height)),
      };
    });
    expect(sol, 'GUARD: no existe el nodo del sol').not.toBeNull();
    expect(sol.dentroDelMarco, 'el sol esta DENTRO del marco recortado: volveria la arista').toBe(false);
    expect(sol.recorte === 'none' || !sol.recorte, 'el sol ha heredado un recorte').toBe(true);
    /* El ancla mide EXACTAMENTE el aro. Midio 2 D y era ella la que desbordaba
       el contenedor de scroll por 12 px; sus dos capas se dimensionan solas. */
    expect(Math.abs(sol.ancho - sol.aro), 'el ancla del sol no se dimensiona con --pace-dial-d').toBeLessThanOrEqual(2);
    /* EL HALO ES CIRCULAR, y eso es un requisito de producto, no un detalle: la
       caja del limbo tiene que ser CUADRADA o el radial saldria elipse. */
    expect(Math.abs(sol.limboW - sol.limboH), 'la caja del limbo no es cuadrada: el halo dejaria de ser un circulo').toBeLessThanOrEqual(1);
    expect(sol.limboW, 'la caja del limbo no se deriva del aro').toBeGreaterThan(sol.aro);
  });

  test.describe('reduced-motion', () => {
    test('las transiciones decorativas quedan neutralizadas', async ({ page, context }) => {
      /* `test.use({ reducedMotion })` NO llego a aplicarse aqui (comprobado con
         el guard de abajo: el media query salia false), asi que se emula de
         forma explicita sobre la pagina. */
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await sembrar(context);
      await irAlArtefacto(page);
      const dur = await page.evaluate(() => ({
        mq: matchMedia('(prefers-reduced-motion: reduce)').matches,
        sol: getComputedStyle(document.querySelector('[data-pace-sun]')).transitionDuration,
      }));
      // GUARD: sin el media query activo esta prueba no demuestra nada.
      expect(dur.mq, 'el contexto no esta en prefers-reduced-motion: reduce').toBe(true);
      /* El fundido de 1,6 s es decorativo y no cuelga de data-pace-essential:
         el kill global de tokens.css lo deja en 0,01 ms, o sea en un corte, que
         es exactamente lo que esa preferencia pide. */
      expect(parseFloat(dur.sol), 'el fundido del sol sigue vivo con reduced-motion').toBeLessThan(0.05);
    });
  });
});
