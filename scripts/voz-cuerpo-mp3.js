/* PACE · scripts/voz-cuerpo-mp3.js — QUITA EL SILENCIO DE UNA TOMA MP3 SIN RECODIFICARLA
   ======================================================================================
   Genspark deja entre línea y línea lo que quiere: con sulafat, de 2 a 3 s de silencio, y la toma pesa el
   triple de lo que dice. Para que las dos voces quepan en lo que se guarda al instalar (sw.js), el guion
   deja entre palabra y palabra unos 0,4 s, como bradford (decisión técnica del 15 nov. 2026).

   SIN RECODIFICAR: un MP3 es una fila de cuadros (de 1152 muestras, o 576 en MPEG-2) que se pueden quitar
   enteros sin tocar el sonido de los demás. No hace falta codificador y la voz no pierde nada.

   LA TRAMPA, LA RESERVA DE BITS: un cuadro puede guardar el principio de sus datos en los cuadros de antes
   (`main_data_begin` dice cuántos bytes atrás empiezan). Tras un corte, el primer cuadro que se queda (o
   los dos primeros) buscaría datos en un cuadro quitado, y cada navegador hace con eso lo que quiere. A
   esos cuadros se les vacía la información lateral, y suenan silencio puro, que es lo que ya eran: caen en
   el margen de silencio que se deja antes de cada palabra. Sus bytes se quedan como estaban, porque el
   cuadro siguiente puede leer de ahí. La etiqueta Xing/Info del principio (que dice cuántos cuadros hay)
   se quita: después del corte mentiría. */
'use strict';

/* kbps de Layer III por versión (MPEG-1; MPEG-2 y 2.5) y frecuencias por versión (3 = MPEG-1, 2 = MPEG-2,
   0 = MPEG-2.5). */
const KBPS = { 1: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320], 2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160] };
const HZ = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };

/* Lo que se deja de silencio: delante de la primera palabra, entre dos (a cada lado, así que el hueco
   queda en el doble) y detrás de la última. Una toma que ya deja menos, se queda como está. */
const RECORTE = { delante: 0.1, lado: 0.2, detras: 0.25 };

function cabecera(b, i) {
  if (i + 4 > b.length || b[i] !== 0xFF || (b[i + 1] & 0xE0) !== 0xE0) return null;
  const ver = (b[i + 1] >> 3) & 3, capa = (b[i + 1] >> 1) & 3, sinCrc = b[i + 1] & 1;
  const bri = (b[i + 2] >> 4) & 15, hzi = (b[i + 2] >> 2) & 3, relleno = (b[i + 2] >> 1) & 1, modo = (b[i + 3] >> 6) & 3;
  if (ver === 1 || capa !== 1 || bri === 0 || bri === 15 || hzi === 3) return null;   // solo Layer III
  const v1 = ver === 3;
  const hz = HZ[ver][hzi];
  return {
    ver, v1, hz, modo, crc: !sinCrc,
    muestras: v1 ? 1152 : 576,
    largo: Math.floor((v1 ? 144000 : 72000) * KBPS[v1 ? 1 : 2][bri] / hz) + relleno,
    lateral: v1 ? (modo === 3 ? 17 : 32) : (modo === 3 ? 9 : 17),
  };
}

/* Los cuadros de sonido de un MP3, en orden: [{ ini, largo, … }]. Sin ID3 ni la etiqueta Xing/Info.
   Todos con la versión, la frecuencia y los canales del primero; si no, no es una toma que se pueda
   cortar así y devuelve []. */
function cuadrosMp3(b) {
  let i = 0;
  if (b.length > 10 && b.toString('latin1', 0, 3) === 'ID3') {
    i = 10 + (((b[6] & 127) << 21) | ((b[7] & 127) << 14) | ((b[8] & 127) << 7) | (b[9] & 127)) + ((b[5] & 0x10) ? 10 : 0);
  }
  let fin = b.length;
  if (fin >= 128 && b.toString('latin1', fin - 128, fin - 125) === 'TAG') fin -= 128;
  const cuadros = [];
  while (i + 4 <= fin) {
    const h = cabecera(b, i);
    const casa = h && (!cuadros.length || (h.ver === cuadros[0].ver && h.hz === cuadros[0].hz && h.modo === cuadros[0].modo));
    if (!casa || i + h.largo > fin) {
      if (cuadros.length) return [];   // basura a media toma: mejor no tocarla
      i++; continue;
    }
    cuadros.push(Object.assign({ ini: i }, h));
    i += h.largo;
  }
  if (cuadros.length) {
    const c = cuadros[0];
    const o = c.ini + 4 + (c.crc ? 2 : 0) + c.lateral;
    const etiqueta = b.toString('latin1', o, o + 4);
    if (etiqueta === 'Xing' || etiqueta === 'Info' || b.toString('latin1', c.ini + 36, c.ini + 40) === 'VBRI') cuadros.shift();
  }
  return cuadros;
}

function inicioDatos(b, c) {
  const o = c.ini + 4 + (c.crc ? 2 : 0);
  return c.v1 ? ((b[o] << 1) | (b[o + 1] >> 7)) : b[o];
}
function bytesDeDatos(c) { return c.largo - 4 - (c.crc ? 2 : 0) - c.lateral; }

/* CRC-16 de MPEG (0x8005, empieza en 0xFFFF): cubre los dos últimos bytes de la cabecera y la lateral. */
function crc16(bytes) {
  let crc = 0xFFFF;
  for (const byte of bytes) {
    for (let k = 7; k >= 0; k--) {
      const bit = ((byte >> k) & 1) ^ ((crc >> 15) & 1);
      crc = (crc << 1) & 0xFFFF;
      if (bit) crc ^= 0x8005;
    }
  }
  return crc;
}

/* Un cuadro en silencio: lateral a cero (sin datos, nada que buscar atrás), con su CRC si lo lleva. */
function callar(cuadro, c) {
  const o = 4 + (c.crc ? 2 : 0);
  cuadro.fill(0, o, o + c.lateral);
  if (c.crc) {
    const v = crc16(Buffer.concat([cuadro.subarray(2, 4), cuadro.subarray(o, o + c.lateral)]));
    cuadro[4] = v >> 8; cuadro[5] = v & 255;
  }
}

/* Junta los cuadros que no están en `quitar` (índices). Al que le faltarían bytes de un cuadro quitado se
   le calla. Devuelve { bytes, callados }: `callados`, en qué puesto de la toma nueva quedó cada uno. */
function ensamblar(b, cuadros, quitar) {
  const fuera = quitar || new Set();
  const partes = []; const callados = [];
  let disponibles = 0;
  cuadros.forEach((c, k) => {
    if (fuera.has(k)) { disponibles = 0; return; }
    const cuadro = Buffer.from(b.subarray(c.ini, c.ini + c.largo));
    if (inicioDatos(b, c) > disponibles) { callar(cuadro, c); callados.push(partes.length); }
    partes.push(cuadro);
    disponibles += bytesDeDatos(c);
  });
  return { bytes: Buffer.concat(partes), callados };
}

/* Qué cuadros sobran: los que caen enteros en el silencio de más. `tramos` son las palabras de la toma
   ya limpia (sin etiqueta), en segundos, como salen de `segmentar`. */
function cuadrosDeMas(cuadros, tramos, recorte) {
  const r = Object.assign({}, RECORTE, recorte || {});
  if (!cuadros.length || !tramos.length) return new Set();
  const paso = cuadros[0].muestras / cuadros[0].hz;
  const zonas = [[-Infinity, tramos[0].ini - r.delante]];
  for (let i = 0; i < tramos.length - 1; i++) zonas.push([tramos[i].fin + r.lado, tramos[i + 1].ini - r.lado]);
  zonas.push([tramos[tramos.length - 1].fin + r.detras, Infinity]);
  const fuera = new Set();
  cuadros.forEach((c, k) => {
    const a = k * paso, z = (k + 1) * paso;
    if (zonas.some(([desde, hasta]) => a >= desde && z <= hasta)) fuera.add(k);
  });
  return fuera;
}

module.exports = { cuadrosMp3, ensamblar, cuadrosDeMas, RECORTE };
