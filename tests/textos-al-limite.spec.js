/* PACE · E2E · LOS TEXTOS QUE SE ACORTARON NO VUELVEN AL LÍMITE (Ez, 7A del 20 nov. 2026)
 * ======================================================================================
 * La 0.212.0 salió roja en el CI de Linux, que pinta la letra como Android: tres textos que en el PC
 * cabían por 1 o 2 px pasaban de línea allí. El barrido (docs/proposals/textos-al-limite-20nov/)
 * encontró 33 sitios con menos de 3 px en Windows o en Linux, y la letra baila hasta 7 px entre los
 * dos, en los dos sentidos. Si uno pasa de línea, el dibujo del runner encoge 14-26 px en toda la
 * rutina, Ajustes pide scroll o la tarjeta de la home esconde «Luego». Ez eligió acortarlos.
 *
 * QUÉ DEFIENDE: que cada texto acortado, en su pantalla, idioma y con la letra normal y al 115 %,
 * aguante al menos 3 px más de ancho sin mover nada (tests/textos-al-limite.sonda.js: una línea más
 * que agranda su caja, un texto que se sale o una fila que salta). Corre en Windows y en el CI de
 * Linux, así que vale para los dos. Al montarlo quedaban 7 px o más en los dos, salvo «Legs: idle today»
 * (4,1 px en Windows y 5,5 en Linux, a 360 × 718 al 115 %). Fuera: las filas «Siguiente: … · Auto», cuyo texto
 * cambia en cada paso, y «Mueve» al 115 %, que se sale 1,3 px en Windows («Muévete», hasta la F3A de Ez del
 * 24 nov., unos 10 en Linux).
 * Mutante: con «Talón apoyado. Baja solo hasta donde controles.», la de Caderas de pie cae (1,9 px
 * en Windows); con «Lo que suena al respirar», la de Ajustes cae en Linux (3,0 px).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sondaTextos } = require('./textos-al-limite.sonda');
const H = require('./textos-al-limite.helpers');

const TOPE = 3;
const LETRAS = [1, 1.15];

/* Runner: la rutina, el idioma y los trozos de cada texto acortado (o del nombre que comparte fila). */
const RUNNER = [
  ['extra.desk.pushups', 'en', ['A steady desk']],
  ['extra.desk.pushups', 'es', ['Mesa fija, sin ruedas']],
  ['extra.banda.espalda', 'en', ['No band? Skip it.', 'squeeze hard. Keep breathing.']],
  ['extra.grip.squeeze', 'en', ['push them back with the other hand', 'Ten seconds palm down', 'not a strength exercise']],
  ['move.wrists', 'en', ['Ten seconds palm down', 'not a strength exercise']],
  ['move.hips.5', 'en', ['Lean on something']],
  ['move.hips.5', 'es', ['Talón apoyado']],
  ['move.hips.ground', 'en', ['come out slowly']],
  ['move.hips.ground', 'es', ['Talón apoyado']],
  ['move.hips.standing', 'en', ['Hold the desk if needed']],
  ['move.hips.standing', 'es', ['Talón apoyado']],
  ['extra.back.desk', 'en', ['If arms on the wall']],
  ['extra.wall.sit', 'es', ['Una altura que te deje']],
  ['move.hamstrings', 'es', ['Rodilla de apoyo']],
  ['extra.legs.single', 'es', ['Una mano en la mesa']],
  ['move.chair.antidote', 'en', ['Turn from the trunk']],
  ['move.chair.antidote', 'es', ['Avanza un poco la pelvis']],
  ['move.spine.waves', 'en', ['Turn from the trunk']],
  ['move.morning.flow', 'es', ['Avanza un poco la pelvis']],
  ['move.couch.stretch', 'es', ['Avanza un poco la pelvis', '=Estiramiento del sofá']],
  ['extra.hang.bar', 'en', ['elbows straight']],
  ['extra.pausa.suelo', 'es', ['pies al ancho de las caderas']],
  ['extra.legs.standing', 'en', ['Back and glutes on the wall']],
  ['extra.glutes.stealth', 'en', ['=Seated Glute Squeezes']],
  ['extra.calves', 'en', ['=Under-Desk Calf Raises']],
  ['extra.calves', 'es', ['=Gemelos bajo la mesa']],
];

/* Mide los trozos y apunta los que tienen menos de TOPE, o que no salen. */
async function vigila(abierto, solo, donde) {
  const { context, page, opts } = abierto;
  const r = await page.evaluate(sondaTextos, Object.assign({}, opts, { solo }));
  await context.close();
  if (r.error) return [donde + ': ' + r.error];
  const fallos = [];
  for (const s of solo) {
    const casan = r.textos.filter((t) => (s[0] === '=' ? t.texto === s.slice(1) : t.texto.includes(s)));
    if (!casan.length) fallos.push(donde + ': no sale «' + s + '»');
    for (const t of casan) {
      const px = H.sobra(t);
      if (px < TOPE) fallos.push(donde + ': «' + t.texto.slice(0, 60) + '» aguanta ' + px.toFixed(2) + ' px (' + (t.motivo || t.motivoLetra) + ')');
    }
  }
  return fallos;
}

test.describe.configure({ timeout: 120 * 1000 });

for (const [id, lang, solo] of RUNNER) for (const letra of LETRAS) {
  test('runner ' + id + ' (' + lang + ', letra ' + letra + '): los textos acortados aguantan ' + TOPE + ' px', async ({ browser }) => {
    const baseURL = test.info().project.use.baseURL;
    const abierto = await H.abreRunner(browser, baseURL, { lang, letra, id });
    expect(await vigila(abierto, solo, id + ' ' + lang + ' ' + letra)).toEqual([]);
  });
}

const DIA_SERVIDO = H.MOMENTOS.find((m) => m.nombre === 'el día servido llegando a las 10:00');
const PAUSA_ABIERTA = H.MOMENTOS.find((m) => m.nombre === 'la pausa abierta');
for (const h of [640, 718]) for (const letra of LETRAS) {
  test('home 360×' + h + ' letra ' + letra + ': la frase del día y la de la pausa abierta aguantan ' + TOPE + ' px', async ({ browser }) => {
    const baseURL = test.info().project.use.baseURL;
    const fallos = [];
    fallos.push(...await vigila(await H.abreHome(browser, baseURL, { lang: 'es', w: 360, h, letra, m: DIA_SERVIDO }), ['hoy 10:00–17:00'], 'es, el día servido'));
    /* «Legs: idle today» va en «Luego», que a 360 × 640 con la letra al 115 % la tarjeta ya esconde. */
    if (h === 718 || letra === 1) fallos.push(...await vigila(await H.abreHome(browser, baseURL, { lang: 'en', w: 360, h, letra, m: PAUSA_ABIERTA }), ['idle today'], 'en, la pausa abierta'));
    expect(fallos).toEqual([]);
  });
}

/* Ajustes a 1280 × 720, solo con la letra normal: un navegador de ordenador no agranda la letra en px como
   el WebView de Android, y su zoom es otra pantalla (más estrecha), no la letra al 115 %. */
for (const lang of ['es', 'en']) {
  const letra = 1;
  test('Ajustes 1280×720 (' + lang + '): la fila de «Suena detrás» aguanta ' + TOPE + ' px', async ({ browser }) => {
    const baseURL = test.info().project.use.baseURL;
    const solo = lang === 'es' ? ['=Suena detrás', '=Al respirar'] : ['=Background', '=When breathing'];
    const fallos = [];
    for (const caso of ['avisos sin decidir', 'avisos bloqueados']) {
      fallos.push(...await vigila(await H.abreAjustes(browser, baseURL, { lang, w: 1280, h: 720, letra, caso }), solo, caso));
    }
    expect(fallos).toEqual([]);
  });
}

for (const lang of ['es', 'en']) for (const letra of LETRAS) {
  test('la pausa (' + lang + ', letra ' + letra + '): su frase y la fila de las otras actividades aguantan ' + TOPE + ' px', async ({ browser }) => {
    const baseURL = test.info().project.use.baseURL;
    /* «Mueve» (Ez, F3A del 24 nov. 2026; antes «Muévete», que se salía unos 10 px en Linux) con la letra al
       115 % aún se sale 1,3 px en Windows: no cabe sin cambiar la fila, así que aquí solo con la letra normal. */
    const solo = lang === 'es' ? ['=Elige tu pausa.'].concat(letra === 1 ? ['=Mueve'] : []) : ['=Move'];
    expect(await vigila(await H.abrePausa(browser, baseURL, { lang, letra }), solo, 'la pausa')).toEqual([]);
  });
}
