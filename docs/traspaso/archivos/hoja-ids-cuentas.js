// Pone la hoja de Ez al día para la cuenta 5iWBf: ids de esta cuenta, lo hecho plegado y el montaje de la 0.195.0.
const fs = require('fs');
const ruta = process.argv[2];
let h = fs.readFileSync(ruta, 'utf8');
const crlf = h.includes('\r\n');
h = h.replace(/\r\n/g, '\n');

const falla = (m) => { console.error('NO CASA: ' + m); process.exit(1); };
const cambia = (de, a, m) => { if (!h.includes(de)) falla(m); h = h.replace(de, a); };

// 1 · Ids EcLj6 → 5iWBf (la tabla del commit 3e48c7bc, al revés).
const ids = {
  G4kprWWqpUfjEbGnvhVh1c: '5P7oysx4zRBMe7qvhRjFgZ', JwFknwwkJhmypQwiZ7npnB: 'E3tcsR3FnywQNmnCpymxrp',
  VDdAWeb8msGvckeGXxFjWV: '9MnNL8b5BYWcX9Fsa7vnAa', Mk11GDb9JBDGXyTrynbaYY: '56cDi1KJYKS4gKqnFKouJP',
  '7Hj5sHmFuuzVP5QFntqdN7': '9BKgTENwuTjts4Wa1N7ZYd', MVctqCpaCguGyZjmQgErx1: 'Mtv9tKsUy9qWgJgKwfD788',
  U1mVU44sM6ggqnW3bwfhv3: 'LD2aRGw2gsrK2XM2DrovkB', R4hc4PDHjn4o94Zirz6scg: 'REAWxKaAqcVxU72mSeLZsp',
  '5Pbk8cpueqEVwu3Nn6VyJJ': 'EEBgoRtHUytnXGzeTXXftD', Uv6u27mKhGnhZyQUXuk9MV: 'LsDSi3X7Gbd4kBWdpPcpPj',
  Mwq1wanupBNsxj1DZzJdjF: '2Fv1mCERFo1zLQ8XJyDvoV', '1AzBCEn8XpnhWVKbMJRSdg': '6stHAifXWoCnzX58mhL8Pz',
  RaUErpS4TGbnmUcdgwv9Bp: 'QNng9nK83cABewcErossmJ',
};
let n = 0;
for (const [de, a] of Object.entries(ids)) {
  const re = new RegExp('artifact/' + de, 'g');
  n += (h.match(re) || []).length;
  h = h.replace(re, 'artifact/' + a);
}
console.log('ids cambiados: ' + n);

// 2 · Cabecera y «Cómo vamos».
cambia('PACE · versión 0.193.0 · actualizada el 8 de noviembre a las 18:50 · esta cuenta, cerca de su tope de hoy',
  'PACE · versión 0.194.0 · actualizada el 8 de noviembre a las 19:55 · en esta cuenta, con dos sesiones montando tus letras', 'cabecera');
cambia(`La web va por la 0.193.0, con todo lo del 5 al 7 de noviembre
        dentro. Las últimas pruebas enteras, las del recorrido el 7 de noviembre: 1323 en verde, y GitHub en verde entero, también Safari, Android y el iPhone.`,
  `La web va por la 0.194.0, con todo lo del 5 al 8 de noviembre
        dentro. Las últimas pruebas enteras, las de la 0.194.0 el 8 de noviembre: 1390 en verde, y GitHub en verde entero, también Safari, Android y el iPhone.`, 'como vamos');

// 3 · La 0.194.0, con GitHub ya en verde.
cambia('Hecho · 8 de noviembre, 18:50 · en la web, 0.194.0 · GitHub la está comprobando',
  'Hecho · 8 de noviembre, 18:50 · en la web, 0.194.0 · GitHub, en verde entero', 'estado 0.194.0');
cambia('Subida: GitHub compila ahora la de Android y la del iPhone.',
  'Subida, y GitHub en verde entero: la web, Safari, Android y el iPhone.', 'texto 0.194.0');

// 4 · Las letras: sus páginas están en la otra cuenta.
cambia('<span class="quien">Tú.</span> Usabilidad 1A a 6A, lo nuevo 1A y 2A, y la semana S3, S7, S6 y S11, todas A. Se montan juntas, con sus pruebas, para la versión siguiente de tus testers.',
  '<span class="quien">Tú.</span> Usabilidad 1A a 6A, lo nuevo N2 y N3, y la semana S3, S7, S6 y S11, todas A. Se montan juntas, con sus pruebas, para la versión siguiente de tus testers. Las tres páginas están en tu otra cuenta.', 'letras');

// 5 · Lo hecho de la lista de arriba, al plegado (lo más nuevo primero).
const iniLista = h.indexOf('<ol class="pasos">');
const finLista = h.indexOf('    </ol>\n    <details class="plegado">');
if (iniLista < 0 || finLista < 0) falla('lista de arriba');
const cuerpo = h.slice(iniLista + '<ol class="pasos">'.length, finLista);
const items = cuerpo.split(/\n(?=      <li class="paso )/).map((s) => s.replace(/^\n/, '')).filter((s) => s.trim());
const hechos = items.filter((s) => s.startsWith('      <li class="paso hecho"'));
let pendientes = items.filter((s) => !s.startsWith('      <li class="paso hecho"'));
console.log('arriba: ' + items.length + ' pasos, ' + hechos.length + ' hechos al plegado');

// 6 · Lo nuevo: el montaje en marcha, tu «júntalo» y la caza de los seis anchos.
const marcha = `      <li class="paso marcha"><span class="estado">En marcha · yo · desde las 19:50 · dos sesiones a la vez</span>
        <span class="t">Montar tus letras de las tres páginas como 0.195.0</span>
        <span class="c"><span class="quien">Yo.</span> Una sesión monta lo de la jornada: el aro de cierre sin la fila de ciclos; que la
          barra de arriba pregunte antes de cortar una pausa; que un Foco por libre después de tu salida no mueva tu hora en la
          carta; «la hice a mi manera» en la pausa, sin que cuente como saltada; «Tu jornada, hasta las 17:00»; y de la semana,
          el Foco por libre con tus minutos, la comida, la carta que no cambia nada y el día que se lee desde ahora al volver.
          La otra monta lo nuevo: «Tus rutinas» abre tus rutinas también en el móvil, traer una copia desde la bienvenida y
          «Escuchar» la voz en Ajustes. Cada cambio, con su prueba. Al acabar te enseño cómo queda cada uno, antes y después.</span></li>`;
const juntalo = `      <li class="paso luego"><span class="estado">Lo siguiente tuyo · cuando acaben las dos sesiones</span>
        <span class="t">Decir «júntalo» a la 0.195.0</span>
        <span class="c"><span class="quien">Tú lo miras; yo lo junto.</span> Con tu «júntalo» entra también el arreglo de la copia de tus
          datos, que ahora lleva «Cuaderno a salvo». Después, todas las pruebas de la app de una vez, la subo a la web y es
          una actualización más para tus testers.</span></li>`;
const anchos = `      <li class="paso luego"><span class="estado">Después · yo · con la 0.195.0 dentro</span>
        <span class="t">Buscar textos cortados en seis anchos</span>
        <span class="c"><span class="quien">Yo.</span> Lo que pediste: seguir buscando fallos. Todas las pantallas a 320, 360, 390, 768,
          1280 y 1536 de ancho, en español y en inglés, en claro y en oscuro, buscando textos cortados o que se pisan, antes
          de que las vean tus testers.</span></li>`;
const iAhora = pendientes.findIndex((s) => s.startsWith('      <li class="paso ahora"'));
const iIphone = pendientes.findIndex((s) => s.includes('Dar la del iPhone a tus testers en TestFlight'));
if (iAhora < 0 || iIphone < 0) falla('ahora o iPhone');
const ahora = pendientes[iAhora];
pendientes = pendientes.filter((s, i) => i !== iAhora);
const j = pendientes.findIndex((s) => s.includes('Dar la del iPhone a tus testers en TestFlight'));
pendientes.splice(j + 1, 0, anchos);
pendientes = [ahora, marcha, juntalo, ...pendientes];
h = h.slice(0, iniLista) + '<ol class="pasos">\n' + pendientes.join('\n') + '\n' + h.slice(finLista);

// 7 · Al plegado, delante de lo que ya había, y su cuenta.
const marcaPleg = /<summary>Lo hecho hasta hoy · (\d+) pasos<\/summary>\n      <ol class="pasos">\n/;
const m = h.match(marcaPleg);
if (!m) falla('plegado');
const iniPleg = h.indexOf(m[0]) + m[0].length;
h = h.slice(0, iniPleg) + hechos.reverse().join('\n') + '\n' + h.slice(iniPleg);
const finPleg = h.indexOf('</details>', iniPleg);
const total = (h.slice(iniPleg, finPleg).match(/<li class="paso /g) || []).length;
h = h.replace(marcaPleg, m[0].replace(m[1], String(total)));
console.log('plegado: ' + m[1] + ' → ' + total);

if (crlf) h = h.replace(/\n/g, '\r\n');
fs.writeFileSync(ruta, h);
console.log('ok');
