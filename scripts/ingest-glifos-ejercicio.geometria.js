/* PACE · scripts/ingest-glifos-ejercicio.geometria.js (sesión 170)
   EL ENCUADRE de una pieza de arte de ejercicio, sacado de la ingesta al rebasar
   ésta las 500 líneas (regla §1 de CLAUDE.md).

   Aquí vive una sola decisión, y es la que más veces se corrigió en s170: DÓNDE
   se centra el dibujo y CUÁNTO se recorta. Pasó por tres criterios —caja, masa y
   circunferencia mínima— y cada cambio salió de MIRARLO con el usuario, no de
   razonar sobre el papel:

     · por CAJA: el flexor se salía del disco (radio 107 px sobre un tope de 94,5).
     · por MASA: dejaba el hueco debajo —12 px de aire arriba contra 62— y el
       usuario lo vio como «está alto».
     · por CIRCUNFERENCIA MÍNIMA (lo actual): el usuario reportó SEIS piezas con
       la misma frase, «le sobra más aire por la derecha que por la izquierda».
       No eran seis retoques: era el criterio. Con la normalización circular ya
       puesta, el tamaño de cada pieza lo fija su radio máximo desde el centro
       elegido, así que MINIMIZAR ese radio es exactamente lo mismo que MAXIMIZAR
       el dibujo dentro del disco — y el centro que lo minimiza reparte el aire
       por definición, porque si sobrara por un lado el círculo podría encoger.
       Un solo criterio resolvió las dos quejas: «está descentrado» y «es
       pequeño». Medido: +17,7 % de área de media en las 47 piezas.

   Es PURO: recibe píxeles y devuelve una caja. No lee disco ni escribe nada.
*/
'use strict';

const lum = (d, i) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];

/* Centro de la circunferencia MÍNIMA que envuelve la tinta, por aproximación
   iterativa: se camina hacia el punto más lejano con paso decreciente.
   Los candidatos son los extremos POR FILA y POR COLUMNA — un superconjunto de
   la envolvente convexa, que es quien determina el círculo — así que son ~4·lado
   puntos en vez de los millones de píxeles de tinta. */
function centroCircunferencia(data, W, C, caja, umbral) {
  const { x0, y0, x1, y1 } = caja;
  const cand = [];
  for (let y = y0; y <= y1; y++) {
    let a = -1, b = -1;
    for (let x = x0; x <= x1; x++) if (lum(data, (y * W + x) * C) < umbral) { if (a < 0) a = x; b = x; }
    if (a >= 0) { cand.push([a, y]); cand.push([b, y]); }
  }
  for (let x = x0; x <= x1; x++) {
    let a = -1, b = -1;
    for (let y = y0; y <= y1; y++) if (lum(data, (y * W + x) * C) < umbral) { if (a < 0) a = y; b = y; }
    if (a >= 0) { cand.push([x, a]); cand.push([x, b]); }
  }
  let cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  for (let k = 0; k < 400; k++) {
    let mx = cx, my = cy, md = -1;
    for (const [px, py] of cand) {
      const d = (px - cx) * (px - cx) + (py - cy) * (py - cy);
      if (d > md) { md = d; mx = px; my = py; }
    }
    const paso = 1 / (k + 2);
    cx += (mx - cx) * paso; cy += (my - cy) * paso;
  }
  return { cx, cy };
}

/**
 * Caja de recorte de una pieza.
 *   data,W,H,C   imagen RGB en crudo (ya aplanada sobre blanco) y sus canales
 *   RECORTE      umbral de luminancia por debajo del cual algo es TINTA
 *   RADIO        1.0 = la tinta toca el círculo inscrito del lienzo
 *   CENTRO_X/Y   'circulo' | 'masa' | 'bbox'
 * Devuelve { left, top, width, height, pad } para extract + extend. `pad` se
 * rellena de blanco cuando el recorte centrado se sale del lienzo: recortarlo
 * contra el borde volvería a descentrar, que es justo lo que esto arregla.
 */
function calcularCaja(o) {
  const { data, W, H, C, RECORTE, RADIO, CENTRO_X, CENTRO_Y } = o;

  let x0 = W, y0 = H, x1 = -1, y1 = -1, peso = 0, sx = 0, sy = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const l = lum(data, (y * W + x) * C);
    if (l < RECORTE) {
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      const t = RECORTE - l; peso += t; sx += x * t; sy += y * t;
    }
  }
  if (x1 < 0) return { left: 0, top: 0, width: W, height: H, pad: null };

  const cc = centroCircunferencia(data, W, C, { x0, y0, x1, y1 }, RECORTE);
  const elegir = (modo, deCaja, deMasa, deCirculo) =>
    modo === 'bbox' ? deCaja : modo === 'masa' ? (peso ? deMasa : deCaja) : deCirculo;
  const cx = elegir(CENTRO_X, (x0 + x1) / 2, sx / peso, cc.cx);
  const cy = elegir(CENTRO_Y, (y0 + y1) / 2, sy / peso, cc.cy);

  /* El recorte es CUADRADO y su medio lado sale del RADIO de la tinta, no de su
     caja: así el píxel más lejano cae justo en el círculo inscrito del lienzo. */
  let rmax = 0;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (lum(data, (y * W + x) * C) < RECORTE) {
      const d = Math.hypot(x - cx, y - cy);
      if (d > rmax) rmax = d;
    }
  }
  const half = rmax / Math.max(0.05, RADIO);
  const L0 = Math.round(cx - half), T0 = Math.round(cy - half);
  const lado = Math.round(2 * half);

  const px = Math.max(0, -L0), py = Math.max(0, -T0);
  const pr = Math.max(0, L0 + lado - W), pb = Math.max(0, T0 + lado - H);
  return {
    left: Math.max(0, L0), top: Math.max(0, T0),
    width: Math.min(W - Math.max(0, L0), lado - px - pr),
    height: Math.min(H - Math.max(0, T0), lado - py - pb),
    pad: { top: py, bottom: pb, left: px, right: pr },
  };
}

module.exports = { calcularCaja };
