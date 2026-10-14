/* PACE · lo que el iPhone pinta fuera de la web
 * =============================================
 * El icono, la pantalla de arranque y el papel de las franjas de arriba y de
 * abajo de la app de iOS salen de la web, como en Android: la vaca es
 * `icons/icon-512.png` y los colores, los de `app/tokens.css`. Este script los
 * escribe en `ios/App/App/Assets.xcassets/` y apunta en `ios/recursos.json` de
 * que salio cada uno, para que `verify` (scripts/verify.ios.js) se de cuenta si
 * la web cambia y el iPhone no.
 *
 *   · PaceArranque (la vaca del arranque): de dia, copia exacta de icon-512.png;
 *     de noche, la misma silueta en la tinta de la paleta oscura, como el
 *     arranque de Android en modo oscuro.
 *   · AppIcon (1024 x 1024, sin transparencia, que la App Store no la admite): la
 *     vaca sobre el papel crema, con las proporciones del icono de Google Play
 *     (`docs/launch/google-play/icono-512.png`): ocupa el 57,6 % del ancho y va
 *     centrada. El iPhone le pone las esquinas.
 *   · PaceFondo: el papel de las dos paletas, para el arranque y las franjas.
 *
 * Uso: `npm run ios:recursos` cada vez que cambie el logo o el papel.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const ASSETS = 'ios/App/App/Assets.xcassets/';
const ORIGEN = 'icons/icon-512.png';
const ICONO = ASSETS + 'AppIcon.appiconset/pace-icono-1024.png';
const ARRANQUE = ASSETS + 'PaceArranque.imageset/pace-logo.png';
const ARRANQUE_NOCHE = ASSETS + 'PaceArranque.imageset/pace-logo-noche.png';
const REGISTRO = 'ios/recursos.json';

const LADO_ICONO = 1024;
const LADO_VACA = 764;   // icon-512 al 74,6 %: la vaca, que ocupa el 77 % del PNG, queda en el 57,6 % del icono

/* La crema es `:root`; la oscura, `[data-palette="oscuro"]`. Lo mismo que lee verify.android.js. */
function tokens(css, paleta) {
  const cabeza = paleta === 'crema' ? ':root {' : '[data-palette="oscuro"] {';
  const i = css.indexOf(cabeza);
  if (i < 0) throw new Error('no encuentro la paleta ' + paleta + ' en app/tokens.css');
  const fuera = {};
  css.slice(i, css.indexOf('}', i)).replace(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g, (_, nombre, valor) => {
    fuera[nombre] = valor.toUpperCase();
  });
  return fuera;
}

const rgb = (hex) => ({ r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) });
const huella = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const escribir = (rel, datos) => {
  fs.mkdirSync(path.dirname(path.join(ROOT, rel)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, rel), datos);
};
const json = (o) => JSON.stringify(o, null, 2) + '\n';

/* Un color de asset catalog con su variante para el modo oscuro. */
function colorset(dia, noche) {
  const comp = (hex) => {
    const c = rgb(hex);
    const h = (n) => '0x' + n.toString(16).toUpperCase().padStart(2, '0');
    return { 'color-space': 'srgb', components: { alpha: '1.000', blue: h(c.b), green: h(c.g), red: h(c.r) } };
  };
  return {
    colors: [
      { color: comp(dia), idiom: 'universal' },
      { appearances: [{ appearance: 'luminosity', value: 'dark' }], color: comp(noche), idiom: 'universal' },
    ],
    info: { author: 'xcode', version: 1 },
  };
}

async function main() {
  const css = fs.readFileSync(path.join(ROOT, 'app/tokens.css'), 'utf8');
  const crema = tokens(css, 'crema');
  const oscura = tokens(css, 'oscuro');
  const papel = crema.paper, papelNoche = oscura.paper, tintaNoche = oscura.ink;
  const origen = fs.readFileSync(path.join(ROOT, ORIGEN));

  /* El arranque de dia: la vaca tal cual. */
  escribir(ARRANQUE, origen);

  /* El de noche: la misma transparencia, toda en la tinta oscura. */
  const { data, info } = await sharp(origen).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const t = rgb(tintaNoche);
  for (let i = 0; i < data.length; i += 4) { data[i] = t.r; data[i + 1] = t.g; data[i + 2] = t.b; }
  const noche = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
  escribir(ARRANQUE_NOCHE, noche);

  /* El icono: la vaca sobre el papel, sin canal alfa. */
  const vaca = await sharp(origen).resize(LADO_VACA, LADO_VACA, { kernel: 'lanczos3' }).png().toBuffer();
  const margen = (LADO_ICONO - LADO_VACA) / 2;
  const icono = await sharp({ create: { width: LADO_ICONO, height: LADO_ICONO, channels: 3, background: rgb(papel) } })
    .composite([{ input: vaca, left: margen, top: margen }])
    .removeAlpha()
    .png()
    .toBuffer();
  escribir(ICONO, icono);

  escribir(ASSETS + 'AppIcon.appiconset/Contents.json', json({
    images: [{ filename: path.basename(ICONO), idiom: 'universal', platform: 'ios', size: '1024x1024' }],
    info: { author: 'xcode', version: 1 },
  }));
  escribir(ASSETS + 'PaceArranque.imageset/Contents.json', json({
    images: [
      { filename: path.basename(ARRANQUE), idiom: 'universal' },
      { appearances: [{ appearance: 'luminosity', value: 'dark' }], filename: path.basename(ARRANQUE_NOCHE), idiom: 'universal' },
    ],
    info: { author: 'xcode', version: 1 },
  }));
  escribir(ASSETS + 'PaceFondo.colorset/Contents.json', json(colorset(papel, papelNoche)));

  escribir(REGISTRO, json({
    _que: 'De que salio cada recurso de la app de iOS. Lo escribe `npm run ios:recursos` y lo compara scripts/verify.ios.js: no se edita a mano.',
    origen: { archivo: ORIGEN, sha256: huella(origen) },
    colores: { papel: papel, papelNoche: papelNoche, tintaNoche: tintaNoche },
    icono: { archivo: ICONO, sha256: huella(icono), ladoVaca: LADO_VACA },
    arranqueNoche: { archivo: ARRANQUE_NOCHE, sha256: huella(noche) },
  }));

  console.log('ios: icono, arranque y papel escritos desde ' + ORIGEN + ' y app/tokens.css');
}

main().catch((e) => { console.error(e); process.exit(1); });
