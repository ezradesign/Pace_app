/* PACE · la visita guiada por la home (Ez, 1C del 27 oct. 2026)
 * ==========================================
 * Al cerrar la bienvenida, tres paradas sobre la home de verdad (Ez, 26 nov. 2026): tu día, el
 * aro y Actividades, que nombra también lo de arriba, con «Siguiente» y «Saltar la visita» (app/onboarding/OnboardingVisita.jsx).
 * De la B (la pista de la home) entra lo que la C no contaba: que al acabar el Foco PACE
 * propone una pausa. Se repite desde Ajustes («Visita guiada ›»).
 *
 * Lo que se vigila: que cada parada enseñe lo que dice (el hueco rodea su sitio), que la
 * tarjeta quepa en la ventana sin tapar lo que enseña, que sea un diálogo de verdad (foco
 * dentro, Tab que da la vuelta, Escape, sin atajos detrás) y que una parada cuyo sitio no se
 * ve se salte y la cuenta lo diga. PACE completo, tras la primera pausa, en
 * compra-tienda.spec.js; el Atrás de Android, en android-nativo.spec.js.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { capturarErrores, sembrar, irAlArtefacto, RUTA_ARTEFACTO } = require('./helpers');

const VISITA = '[role=dialog][data-pace-visita]';
/* Lo que enseña cada parada; con dos piezas, el hueco las rodea a las dos. */
const SITIO = {
  aro: ['[data-pace-dial-ring]'],
  act: ['[data-pace-activitybar-grid]'],
  dia: ['[data-pace-ritmo-tarjeta], [data-pace-ritmo-panel]'],
  arriba: ['[data-pace-topbar-stats]', '[data-pace-topbar-logros]'],
  cajon: ['[data-pace-sidebar-open]'],
  columna: ['[data-pace-sidebar]'],
  ajustes: ['[data-pace-topbar-ajustes]'],
};
/* El menú es el botón de las tres rayas en el móvil y la columna de la izquierda en el ordenador. */
/* Tres paradas (Ez, 26 nov. 2026: «el usuario tiene que comprender cómo usar la app»): tu día, el
   aro y Actividades, que también nombra lo de arriba (estadísticas, logros y Ajustes). Las de antes
   (arriba, el menú, Ajustes) siguen en PACE_VISITA_PARADAS_ANTES, sin enseñarse. */
const ORDEN_MOVIL = ['dia', 'aro', 'act'];
const ORDEN_PC = ['dia', 'aro', 'act'];

/* Un sábado: la semana de la bienvenida (lunes a viernes) no propone jornada y el aro dice
   «Empezar foco». Un jueves a las 10:05, el aro ya es la jornada: «Empezar jornada». */
const SABADO = new Date('2026-11-28T10:05:00+01:00');
const JUEVES = new Date('2026-11-26T10:05:00+01:00');

async function hastaLaVisita(page, cuando = SABADO) {
  await page.clock.install({ time: cuando });
  await page.goto(RUTA_ARTEFACTO);   // sin sembrar: primera vez de la vida
  await page.locator('[role=dialog] [data-pace-cta]').click();
  /* Sin la pantalla de PACE completo (Ez, 26 nov.: los precios, tras la primera pausa): la semana
     es la última y lleva derecho a la visita. */
  await expect(page.locator('[data-pace-semana-guardar]')).toHaveText(/^(Comenzar|Start)$/);
  await page.locator('[data-pace-semana-guardar]').click();
  await page.locator(VISITA).waitFor({ state: 'visible' });
}

/* La tarjeta y el hueco se deslizan a cada parada: se mide cuando han llegado. */
async function esperarQuieta(page) {
  await page.waitForFunction(() => ['[data-pace-visita-tarjeta]', '[data-pace-visita-hueco]'].every((s) => {
    const el = document.querySelector(s);
    return !el || el.getAnimations().every((a) => a.playState === 'finished');
  }), null, { polling: 60 });
}

/* Lo que se ve en una parada: cuál es, su cuenta, si el hueco rodea su sitio y si la tarjeta
   cabe en la ventana sin pisar el hueco. */
async function medirParada(page) {
  await esperarQuieta(page);
  return page.evaluate((sitios) => {
    const raiz = document.querySelector('[data-pace-visita]');
    const id = raiz.getAttribute('data-pace-visita');
    const t = document.querySelector('[data-pace-visita-tarjeta]').getBoundingClientRect();
    const h = document.querySelector('[data-pace-visita-hueco]').getBoundingClientRect();
    const cajas = sitios[id].map((sel) => [...document.querySelectorAll(sel)].find((e) => e.getBoundingClientRect().width > 0).getBoundingClientRect());
    const r = cajas[0];
    const rodea = id === 'aro' || id === 'ajustes' || id === 'cajon'
      ? Math.hypot(h.x + h.width / 2 - (r.x + r.width / 2), h.y + h.height / 2 - (r.y + r.height / 2)) < 2 && h.width >= Math.max(r.width, r.height)
      : cajas.every((c) => h.left <= c.left && h.top <= c.top && h.right >= c.right && h.bottom >= c.bottom);
    return {
      id, rodea,
      meta: raiz.querySelector('.pace-meta').textContent,
      titulo: document.getElementById(raiz.getAttribute('aria-labelledby')).textContent,
      texto: document.getElementById(raiz.getAttribute('aria-describedby')).textContent,
      dentro: t.left >= 0 && t.top >= 0 && t.right <= innerWidth && t.bottom <= innerHeight,
      pisa: !(t.bottom <= h.top || t.top >= h.bottom || t.right <= h.left || t.left >= h.right),
    };
  }, SITIO);
}

/* 360 × 640: el móvil bajo, donde la tarjeta de tu día y la de la visita compiten por el alto. */
for (const v of [{ width: 360, height: 640 }, { width: 360, height: 740 }, { width: 1280, height: 800 }]) {
  test.describe('a ' + v.width + ' × ' + v.height, () => {
    test.use({ viewport: v });
    const ORDEN = v.width < 700 ? ORDEN_MOVIL : ORDEN_PC;

    test('al cerrar la bienvenida, la visita empieza por tu día y sigue por el aro, Actividades, Estadísticas y logros, el menú y Ajustes, y «Entendido» devuelve la home', async ({ page }) => {
      const errores = capturarErrores(page);
      await hastaLaVisita(page);
      const vistas = [];
      for (let i = 0; i < ORDEN.length; i++) {
        const m = await medirParada(page);
        vistas.push(m.id);
        expect(m.meta).toBe((i + 1) + ' de ' + ORDEN.length);
        expect(m.rodea, 'el hueco de «' + m.titulo + '» no rodea lo que enseña').toBe(true);
        expect(m.dentro, 'la tarjeta de «' + m.titulo + '» se sale de la ventana').toBe(true);
        expect(m.pisa, 'la tarjeta de «' + m.titulo + '» tapa lo que enseña').toBe(false);
        if (m.id === 'dia') {
          /* Ez: «lo de construir tu día debería ser importante». Va la primera y dice cómo se prepara. */
          expect(m.titulo).toBe('Empieza por tu día');
          expect(m.texto).toContain('Elige cuánto trabajas hoy');
          expect(m.texto).toContain('«Al calendario» lo lleva a tu calendario');
        }
        if (m.id === 'aro') {
          /* De la B: lo que pasa al acabar el Foco, con el nombre del botón de verdad. */
          expect(m.texto).toContain('toca «Empezar foco»');
          /* El permiso del navegador o del móvil salía de golpe al empezar el primer Foco, sin decir para qué. */
          expect(m.texto).toContain('Al acabar te propone una pausa corta y, la primera vez, te pide permiso para avisarte aunque estés en otra app.');
        }
        if (m.id === 'act') {
          /* La última dice también lo de arriba: los iconos no tienen nombre a la vista, y sin copia
             de «Tus datos» un móvil nuevo lo pierde todo. */
          expect(m.titulo).toBe('Actividades');
          expect(m.texto).toContain('Respira, Estira y Mueve, con rutinas cortas');
          expect(m.texto).toContain('Arriba, tus estadísticas, tus logros y los Ajustes, donde haces la copia de tus datos y repites esta visita.');
        }
        await expect(page.locator('[data-pace-visita-siguiente]')).toHaveText(i === ORDEN.length - 1 ? 'Entendido' : 'Siguiente');
        await page.locator('[data-pace-visita-siguiente]').click();
      }
      expect(vistas).toEqual(ORDEN);
      await expect(page.locator(VISITA)).toHaveCount(0);

      /* La home vuelve a ser de la persona: lo que hay en el centro de «Empezar foco» es el botón. */
      const empezar = page.getByRole('button', { name: 'Empezar foco' });
      const b = await empezar.boundingBox();
      expect(await page.evaluate(([x, y]) => !!document.elementFromPoint(x, y).closest('button'), [b.x + b.width / 2, b.y + b.height / 2])).toBe(true);
      expect(errores).toEqual([]);
    });
  });
}

test('un día de trabajo, la parada del aro nombra «Empezar jornada», que es lo que dice el botón', async ({ page }) => {
  await hastaLaVisita(page, JUEVES);
  await page.locator('[data-pace-visita-siguiente]').click();
  const m = await medirParada(page);
  expect(m.id).toBe('aro');
  expect(m.texto).toContain('toca «Empezar jornada»');
  await page.locator('[data-pace-visita-saltar]').click();
  await expect(page.locator('[data-pace-home-body] [data-pace-cta]')).toHaveText('Empezar jornada');
});

test('la visita es un diálogo: el foco entra, Tab no sale, los atajos callan y Escape la cierra', async ({ page }) => {
  await hastaLaVisita(page);
  const raiz = page.locator(VISITA);
  await expect(raiz).toHaveAttribute('aria-modal', 'true');
  await expect(raiz).toHaveAccessibleName('Empieza por tu día');
  const dentro = () => page.evaluate(() => !!document.activeElement.closest('[data-pace-visita]'));
  expect(await dentro(), 'el foco no entró en la visita').toBe(true);
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab');
    expect(await dentro(), 'Tab número ' + (i + 1) + ' salió de la visita').toBe(true);
  }
  await page.keyboard.press('s');
  await expect(page.locator('[data-pace-modal-card]'), 'la S abrió Estadísticas detrás de la visita').toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(raiz).toHaveCount(0);
});

test('«Saltar la visita» la cierra en cualquier parada', async ({ page }) => {
  await hastaLaVisita(page);
  await page.locator('[data-pace-visita-siguiente]').click();
  await expect(page.locator(VISITA)).toHaveAttribute('data-pace-visita', 'aro');
  await page.locator('[data-pace-visita-saltar]').click();
  await expect(page.locator(VISITA)).toHaveCount(0);
});

test('desde Ajustes, «Visita guiada» la repite; una parada cuyo sitio no se ve se salta y la cuenta lo dice', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await sembrar(context);
  await irAlArtefacto(page);
  /* Como con un día elegido, en que Actividades no está en la home. */
  await page.addStyleTag({ content: '[data-pace-activitybar-grid] { display: none !important; }' });
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await page.locator('[data-pace-tweaks-panel]').getByRole('button', { name: /Visita guiada/ }).click();
  await expect(page.locator('[data-pace-tweaks-panel]'), 'Ajustes se quedó abierto debajo de la visita').toHaveCount(0);
  await page.locator(VISITA).waitFor({ state: 'visible' });

  const quedan = ORDEN_PC.filter((id) => id !== 'act');   // tu día y el aro
  const vistas = [];
  for (let i = 0; i < quedan.length; i++) {
    const m = await medirParada(page);
    vistas.push(m.id);
    expect(m.meta).toBe((i + 1) + ' de ' + quedan.length);
    await page.locator('[data-pace-visita-siguiente]').click();
  }
  expect(vistas).toEqual(quedan);
  await expect(page.locator(VISITA)).toHaveCount(0);
  expect(errores).toEqual([]);
});

test.describe('en inglés', () => {
  test.use({ locale: 'en-GB', viewport: { width: 360, height: 740 } });

  test('la visita habla inglés: empieza por tu día y nombra el botón del aro', async ({ page }) => {
    await hastaLaVisita(page);
    const d = await medirParada(page);
    expect(d.titulo).toBe('Start with your day');
    expect(d.meta).toBe('1 of ' + ORDEN_MOVIL.length);
    expect(d.texto).toContain('Choose how long you work today');
    await page.locator('[data-pace-visita-siguiente]').click();
    const m = await medirParada(page);
    expect(m.titulo).toBe('The ring');
    expect(m.texto).toContain('tap “Start Focus”');
    await expect(page.locator('[data-pace-visita-saltar]')).toHaveText('Skip the tour');
  });
});

/* El inglés es más largo: en el móvil bajo, ninguna tarjeta se sale ni tapa lo que enseña. */
test.describe('en inglés a 360 × 640', () => {
  test.use({ locale: 'en-GB', viewport: { width: 360, height: 640 } });

  test('las tres paradas caben sin tapar lo que enseñan', async ({ page }) => {
    await hastaLaVisita(page);
    for (let i = 0; i < ORDEN_MOVIL.length; i++) {
      const m = await medirParada(page);
      expect(m.id).toBe(ORDEN_MOVIL[i]);
      expect(m.rodea, 'el hueco de «' + m.titulo + '» no rodea lo que enseña').toBe(true);
      expect(m.dentro, 'la tarjeta de «' + m.titulo + '» se sale de la ventana').toBe(true);
      expect(m.pisa, 'la tarjeta de «' + m.titulo + '» tapa lo que enseña').toBe(false);
      await page.locator('[data-pace-visita-siguiente]').click();
    }
    await expect(page.locator(VISITA)).toHaveCount(0);
  });
});
