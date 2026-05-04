/**
 * build-standalone.js — PACE
 * Genera PACE_standalone.html inlineando todos los assets locales en PACE.html.
 * Reemplaza la herramienta super_inline_html del entorno anterior.
 * Uso: node build-standalone.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const INPUT  = path.join(ROOT, 'PACE.html');
const OUTPUT = path.join(ROOT, 'PACE_standalone.html');

let html = fs.readFileSync(INPUT, 'utf8');

// 1. Inline tokens.css
const tokensCss = fs.readFileSync(path.join(ROOT, 'app/tokens.css'), 'utf8');
html = html.replace(
  /\s*<link rel="stylesheet" href="app\/tokens\.css" \/>/,
  `\n  <style>\n${tokensCss}\n  </style>`
);

// 2. Inline cada <script type="text/babel" src="..."></script>
html = html.replace(
  /<script type="text\/babel" src="([^"]+)"><\/script>/g,
  (_, src) => {
    const full = path.join(ROOT, src);
    const content = fs.readFileSync(full, 'utf8');
    return `<script type="text/babel">\n${content}\n</script>`;
  }
);

// 3. Logo PNG → data URI (para que funcione offline)
const logoPng = fs.readFileSync(path.join(ROOT, 'app/ui/pace-logo.png'));
const logoB64 = logoPng.toString('base64');
html = html.replace(
  /src="app\/ui\/pace-logo\.png"/,
  `src="data:image/png;base64,${logoB64}"`
);

fs.writeFileSync(OUTPUT, html, 'utf8');
const kb = (fs.statSync(OUTPUT).size / 1024).toFixed(0);
console.log(`PACE_standalone.html generado — ${kb} KB`);
