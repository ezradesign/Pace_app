// Da la vuelta a los enlaces de la hoja de Ez entre sus dos cuentas de claude.ai: las páginas de una cuenta dan 404 en la
// otra, así que cada página publicada en las dos tiene un par de ids y la hoja se publica con los de la cuenta donde se abre.
// Uso: node docs/traspaso/archivos/hoja-ids-cuentas.js <hoja de entrada> <hoja de salida> --a=EcLj6|5iWBf
// La copia del repo (docs/traspaso/hoja-de-ruta-20oct.html) lleva los ids de la cuenta donde se escribió por última vez.
// Al final dice cuántos ids cambió y si queda alguno de la otra cuenta; si queda, falta su par en la tabla.
const fs = require('fs');
const [entrada, salida, opcion] = process.argv.slice(2);
const a = (opcion || '').replace('--a=', '');
if (!entrada || !salida || !['EcLj6', '5iWBf'].includes(a)) {
  console.error('Uso: node hoja-ids-cuentas.js <entrada> <salida> --a=EcLj6|5iWBf');
  process.exit(1);
}

// Pares [EcLj6, 5iWBf]. Uno por página que existe en las dos cuentas; la hoja misma es el primero.
const pares = [
  ['EcLj6io4wM9pGjtQ5wd1CT', '5iWBfHE7kD3dUVocdskmb6'], // la hoja, «PACE hasta v1»
  ['G4kprWWqpUfjEbGnvhVh1c', '5P7oysx4zRBMe7qvhRjFgZ'], ['JwFknwwkJhmypQwiZ7npnB', 'E3tcsR3FnywQNmnCpymxrp'],
  ['VDdAWeb8msGvckeGXxFjWV', '9MnNL8b5BYWcX9Fsa7vnAa'], ['Mk11GDb9JBDGXyTrynbaYY', '56cDi1KJYKS4gKqnFKouJP'],
  ['7Hj5sHmFuuzVP5QFntqdN7', '9BKgTENwuTjts4Wa1N7ZYd'], ['MVctqCpaCguGyZjmQgErx1', 'Mtv9tKsUy9qWgJgKwfD788'],
  ['U1mVU44sM6ggqnW3bwfhv3', 'LD2aRGw2gsrK2XM2DrovkB'], ['R4hc4PDHjn4o94Zirz6scg', 'REAWxKaAqcVxU72mSeLZsp'],
  ['5Pbk8cpueqEVwu3Nn6VyJJ', 'EEBgoRtHUytnXGzeTXXftD'], ['Uv6u27mKhGnhZyQUXuk9MV', 'LsDSi3X7Gbd4kBWdpPcpPj'],
  ['Mwq1wanupBNsxj1DZzJdjF', '2Fv1mCERFo1zLQ8XJyDvoV'], ['1AzBCEn8XpnhWVKbMJRSdg', '6stHAifXWoCnzX58mhL8Pz'],
  ['RaUErpS4TGbnmUcdgwv9Bp', 'QNng9nK83cABewcErossmJ'],
  ['TUES7Hw31NwYXYBypdmHwK', '3juJNAvBAFo8NKKKWLEc6J'], // la landing de la raíz
  ['4Fohyqi7Cth9iKGxE2FSSD', 'R3vZVCMdEvKxWhyLHRmwvE'], // la caza de rendimiento, «PACE en un móvil lento»
  ['LzG1sfc4e9ygARg9MpC7Tz', '6DsS35xJXsmcZrdtZiXhoL'], // la web más bonita (versión 5, «Montada: la B»)
  ['C2uFSMM8eWhcRxpXLGWkAx', '2QnMBypqSRVJCmPeNJazZA'], // las dos auditorías de Fable, en una cola
  ['RQxiSzrKLUSAUYkDxcBZhU', 'KZFDp3zNhk4JAFHr13ysxq'], // ChatGPT, letras 4, 6 y 7 de la jornada
  ['H5UgBuqz5VeGnETpixxi96', 'XbtnS5xak95y1iJ8iXhKdU'], // las decisiones del 10 nov., «Lo que espera tu letra»
  ['BN1QuXDBSAnqjqAvvSMSny', 'NgV2uX97ZxRZTXEePWvcGG'], // el aro con el horario abierto, con la A montada
  ['1WwJbuD5qTtXJWNzVg7B7Q', 'CpnFEkENADXDVU7K7u8k5M'], // «Montado» de la auditoría (1A, 2A, 4A, lunes, Ocaso y Búho)
  ['LaTcRknTpPcJAa6joPncjX', 'RifLYxtf23zjW51atRD4U3'], // «Montado» de 4 B, 6 A y 7 A
  ['2nykmo2ZLNTrDyud6Qs6dM', '89XwWvAiaLnEJFPDVZ9pCY'], // «Montado» de rendimiento (aro B, V1 B y V2 B)
];

const [de, hacia] = a === 'EcLj6' ? [1, 0] : [0, 1];
let h = fs.readFileSync(entrada, 'utf8');
let n = 0;
for (const par of pares) {
  const re = new RegExp('artifact/' + par[de], 'g');
  n += (h.match(re) || []).length;
  h = h.replace(re, 'artifact/' + par[hacia]);
}
fs.writeFileSync(salida, h);
const quedan = pares.filter((par) => h.includes(par[de])).map((par) => par[de]);
console.log('ids cambiados a ' + a + ': ' + n + (quedan.length ? ' · QUEDAN de la otra cuenta: ' + quedan.join(' ') : ' · no queda ninguno de la otra cuenta'));
