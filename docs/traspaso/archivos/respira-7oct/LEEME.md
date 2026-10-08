# respira-1 y respira-2 (caza del 7 de octubre): arreglados en esta rama, sin subir a main

Rama `claude/respira-bugs-graves-31faf7`. Los dos se reprodujeron en el `index.html` de v0.145.0
antes de tocar nada (`repro.js`).

- **respira-1** · «Bhastrika · Fuelle» (1 s y 1 s, 30 por minuto, como Kapalabhati) empezaba sin
  el modal de seguridad. Lleva `safety: true` (`app/breathe/BreatheLibrary.jsx`) y su fila de
  `CONTENT.md` lleva ⚠.
- **respira-2** · «Terminar» a mitad de una técnica de rondas decía el plan entero («2 RONDAS · 50
  RESPIRACIONES» tras seis respiraciones). Ahora cuenta lo hecho: una ronda vale cuando se suelta
  su retención y una respiración cuando acaba su exhalación. Lo que vale cero no se pinta, y con 1
  va en singular. Vale también para una sesión reanudada (`respiraHecho` y `respiraCifrasCierre`,
  en `BreatheSession.support.jsx`).

Las pruebas son `tests/respira-biblioteca.spec.js` (las dos últimas) y `tests/respira-cierre.spec.js`.
Las cuatro nuevas salieron en rojo contra el código anterior y la de control («acabada entera»), en
verde. Con el arreglo pasan `verify`, 73 pruebas de Respira, biblioteca, pausa y barra lateral, y
las 74 de `tests/ritmo*`.

Qué cambia alrededor, medido con `pozos.js` sobre 60 días:

- **«A tu ritmo» no cambia**: sus pozos solo leen Equilibrio, Balance y Relajación, y Bhastrika
  está en Pranayama. La sospecha de la lista sobre `state-ritmo.jsx` no se cumplía.
- **Bhastrika deja de salir** en el «Para ahora» de Respira y en el menú de pausa. Antes salía 4
  días de cada 60.
- **La rotación diaria se corre**: hay una técnica menos en el pozo y 47 de los 60 días proponen
  otra técnica tranquila.
- **«Sin retención» pasa de 11 a 10**: sin `cycle`, el filtro mira `safety`, igual que ya hacía con
  Kapalabhati.

## Lo que falta

1. **La página para Ez** con las fotos de `fotos/` (antes, después y variante B; las de `*-chip`
   enseñan el 11 → 10). La variante B pinta los ceros («0 RONDAS · 6 RESPIRACIONES»); la
   recomendada es la A, la del código. **Dato para Ez**: el modal dice «hiperventilación controlada
   y apnea», y Bhastrika (como Kapalabhati) no tiene apnea. Es copy y lo decide él.
2. **Tras su sí**, el cierre de `CLAUDE.md`: `git pull`, `npm run bump` (la siguiente versión libre:
   otra sesión cerraba v0.146.0), build, `test:e2e`, `STATE.md`, `CHANGELOG.md`, tachar respira-1 y
   respira-2 en `CAZA_BUGS_7OCT.md`, commit a `main` y CI. Esta carpeta se puede borrar entonces.

`fotos.js` regenera las fotos sirviendo la raíz en el puerto 8791 con `_antes.html` (el
`index.html` de `main`) y `_variante-b.html` (build con los dos `if (… > 0)` de
`respiraCifrasCierre` cambiados por `if (true)`). Las rutas de Windows del principio de cada
script hay que cambiarlas en otra máquina.
