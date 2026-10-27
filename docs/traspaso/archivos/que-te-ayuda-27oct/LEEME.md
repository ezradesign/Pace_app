# «Qué te ayuda»: la maqueta del 27 oct.

Página para Ez: https://claude.ai/artifact/6e5BmLDHsLmYPqmVtX26eD (`docs/proposals/que-te-ayuda-27oct.html`; recomendado 1A 2A 3A). Lo último de pago de
Estadísticas (punto 9 del orden hasta v1). Nada de `app/` ha cambiado: la propuesta entra en el `index.html`
de v0.181.1 con `page.route`, antes de montar la app, y los datos son de ejemplo.

- **1 Qué dice.** A: tres ideas (lo que te sienta bien, tu hora de Foco, después del Foco); B: cinco (más las
  pausas de tu día, solo con «A tu ritmo», y lo que no te convenció); C: solo lo que contestas a «¿Te ayudó?».
  Cada idea, su dato, si existe hoy y su umbral, en la tabla de la página. Los Focos a medias no se apuntan
  (salir antes no emite `session.completed`), así que «con qué duración te cunde» no se puede decir sin inventar.
- **2 Qué dice antes.** A: callado («Todavía es pronto», sin contadores); B: las ideas en tenue con «Aún no»;
  C: lo que llevas contado.
- **3 Dónde va.** A: una pestaña más, con candado como Mes y Año sin PACE completo; B: una línea al pie de la
  Semana y del Mes.

Guiones: `propuesta.js` (se evalúa dentro de la página y sustituye `window.StatsPanel` por una copia con la
propuesta: el panel se pide por su nombre global al pintarse), `fotos.js` (11 escenas × 360/1280 × claro/oscuro
× es/en, con lo que mide cada vista en `medidas.json`) y `pagina.js` (la página, con las fotos en webp).

```
PORT=8806 node .claude/static-server.js
node docs/traspaso/archivos/que-te-ayuda-27oct/fotos.js <carpeta-de-fotos>
node docs/traspaso/archivos/que-te-ayuda-27oct/pagina.js <carpeta-de-fotos> docs/proposals/que-te-ayuda-27oct.html
```

Las fotos no se suben. Si el `index.html` cambia, la propuesta sigue entrando mientras exista el ancla del
montaje (`fotos.js` falla si no la encuentra) y los nombres que usa sigan en `window`.

## El montaje (v0.183.0)

Ez eligió **1A 2A 3A** («A tres ideas + 2A + 3a»). Montado en esta rama: el cálculo en `app/stats/stats-ayuda.js`,
la vista en `app/stats/StatsAyuda.jsx`, la pestaña en `StatsPanel.jsx` y sus estilos en `StatsPanel.css.jsx`; lo
vigila `tests/stats-ayuda.spec.js`. Fotos para el sí de Ez con `fotos-montaje.js` (la app tal cual, con seis
semanas de ejemplo sembradas por el registro) y `pagina-montaje.js`, que deja
`docs/proposals/que-te-ayuda-montaje-27oct.html`.

**Antes de archivar la sesión**: en este worktree, `node_modules` es un ENLACE (junction) a los `node_modules` del
repo principal, para que `verify` y la suite encuentren lo suyo. Se quita como enlace, sin tocar lo de dentro, que
es lo del repo principal: `cmd /c rmdir node_modules` desde la raíz del worktree (nunca `rm -rf` ni borrar su
contenido).
