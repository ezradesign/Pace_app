/* glifos.js — lee `exercise-glyphs.jsx` como TEXTO y saca, por glifo:
   el comentario que lo describe (los del archivo dicen la vista, si lleva
   flecha y si hay apoyo), el recuento de primitivas y las "cabezas"
   (circle de radio ~2, que es como se dibuja una figura) => 1 o 2 poses.

   Es HEURISTICA declarada, no verdad revelada: sirve para prellenar la matriz
   §19.2 y que el usuario corrija, no para decidir por el. */
const fs = require('fs');
const ROOT = require('path').resolve(__dirname, '..', '..');
const src = fs.readFileSync(ROOT + '\\app\\glyphs\\exercise-glyphs.jsx', 'utf8');

/* cada entrada: [comentario previo opcional] 'Nombre': ({ size, className }) => ( ... ), */
/* la clave puede ir con comillas SIMPLES o DOBLES: `"World's greatest stretch"`
   usa dobles por el apostrofo, y una regex de solo-simples lo daba por
   inexistente (contradiccion detectada al cruzar dos recuentos: 47 claves
   reales contra 46 parseadas). */
const re = /(?:\/\*([\s\S]*?)\*\/\s*)?(?:'([^']+)'|"([^"]+)"):\s*\(\{[^}]*\}\)\s*=>\s*\(([\s\S]*?)\n  \),/g;
const out = [];
let m;
while ((m = re.exec(src))) {
  const [, comentario, simples, dobles, cuerpo] = m;
  const nombre = (simples || dobles).replace(/\\'/g, "'");
  const c = (comentario || '').replace(/\s+/g, ' ').trim();
  const cabezas = (cuerpo.match(/<circle[^>]*r="(2(\.\d+)?|1\.[89])"/g) || []).length;
  out.push({
    nombre,
    comentario: c,
    paths: (cuerpo.match(/<path/g) || []).length,
    circles: (cuerpo.match(/<circle/g) || []).length,
    cabezas,
    poses: cabezas >= 2 ? 2 : 1,
    flecha: /flecha|arrow/i.test(c) || /marker|polyline/i.test(cuerpo),
    apoyo: /pared|mesa|silla|suelo|banco|barra|escritorio|apoyo/i.test(c),
    version: (c.match(/\b(v\d+|ALT|new)\b/i) || [, ''])[1],
    opacidad: /opacity=/.test(cuerpo),
  });
}
console.log(JSON.stringify(out, null, 1));
console.error('glifos leidos: ' + out.length
  + ' | con comentario: ' + out.filter(g => g.comentario).length
  + ' | con version anotada: ' + out.filter(g => g.version).length
  + ' | 2 poses: ' + out.filter(g => g.poses === 2).length
  + ' | flecha: ' + out.filter(g => g.flecha).length
  + ' | apoyo: ' + out.filter(g => g.apoyo).length);
