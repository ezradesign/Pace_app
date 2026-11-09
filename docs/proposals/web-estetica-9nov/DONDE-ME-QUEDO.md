# Estética de la web (landing + /premium + /beta) · dónde me quedo

9 nov. 2026, noche. La sesión se paró por el tope de uso de la cuenta. **No hay maqueta ni página
publicada todavía.** Nada de `landing/`, `premium/` ni `beta/` está tocado: la landing B sigue en
39e7476e, lista para el «júntalo».

## Hecho

- Leídas las tres páginas, `scripts/web-dist.js`, la fila de la raíz con dos caras y la regla del
  contraste del 7 nov. (letra de color en el «hondo» del módulo, 4,5:1 o más).
- La web de la rama fotografiada entera: 3 páginas × 360 y 1280 px × es/en × claro/oscuro
  (`fotos-hoy.js`; las cifras, en `hoy-medidas.json`). Las fotos no se versionan: se rehacen con
  `node docs/proposals/web-estetica-9nov/fotos-hoy.js "<raíz del repo>" "<carpeta de salida>"`.
- Probado que la app de la rama se puede fotografiar por idioma y tema (`capturas-app.js`: ordenador
  1440 × 900 y móvil, es/en, crema/oscuro, 19-31 KB cada una). Las ocho salieron sin errores; falta
  mirarlas.

## Defectos de hoy, medidos (1280 px salvo que diga otra cosa)

1. **Cabecera distinta**: el logo mide 72 px en la landing y 132 en /premium y /beta (42 y 96 a
   360 px; a 42 el lema no se lee). Solo la landing lleva «¿Ya usas PACE? Ábrelo».
2. **Pie distinto**: la landing acaba en un botón lleno «Abrir PACE» y enlaza a PACE completo;
   /premium y /beta llevan la vaca con un enlace y no se enlazan entre sí (desde /premium no se
   llega a /beta, ni al revés).
3. **Capturas pequeñas**: 250 px de ancho en la landing dentro de bandas de 1068 (más de media banda
   vacía); 178 px en la portada de /beta; 213 px las pequeñas del mosaico de /premium. A 360 px:
   158 px en la landing y 104 px «tu mes» y «tu año» en /premium. Miden 540 de origen.
4. **Dos sistemas de títulos**: las capturas son las de la ficha de Google Play y traen su propio
   título dentro, en serif recta, junto a los títulos en itálica de la página.
5. **/premium en inglés enseña la app en castellano** en la portada (`app-escritorio.webp` y
   `app-movil.webp` no tienen versión en inglés).
6. **En oscuro las capturas son de la app en claro**: rectángulos crema sobre fondo oscuro.
7. **Líneas demasiado largas**: unas 124 letras por línea en la nota de «Avísame» y 91 en «Dónde
   funciona tu compra» (/premium); unas 150 en la nota de «Lo que te llevas» (/beta). Lo cómodo son 65.
8. **La lista «Cinco maneras de parar»** ocupa los 1068 px: el nombre a la izquierda y su
   descripción a 1000 px. Las preguntas, igual de anchas.
9. **Los módulos se dibujan de tres maneras**: punto de color (landing), glifos de 18 px (/premium)
   y píldoras con glifo (/beta).
10. **Ritmo**: todas las secciones son la misma banda alineada a la izquierda; ninguna destaca.
    Los `h2` miden 30 px en la landing y 31 en las otras dos a 360 px.
11. La landing arranca en inglés si el navegador no es español; /premium y /beta, en castellano
    si no es inglés (comportamiento, no estética: va aparte).

## Las tres direcciones pensadas (sin pintar)

- **A · Cuaderno de campo**: un solo papel sin bandas, filetes finos, el título de cada sección al
  margen y el contenido a su derecha, `h1` muy grande, la lista de módulos como índice con glifo y
  puntos de guía, las capturas como láminas; marco de doble filete para lo que importa (el plato
  «De por vida», «Lo que te llevas»).
- **B · Una jornada**: la portada es el aro de la app (el `h1` dentro y el botón abajo, como
  «Empezar foco»); de ahí baja la línea del día por el margen con una parada por sección; los cinco
  módulos son paradas en su color; las capturas, en tiras grandes; en /beta los pasos van unidos
  por la línea. Cambia el mosaico de /premium que Ez eligió el 23 oct.: hay que decírselo.
- **C · Pulido sobrio**: las bandas de hoy, arreglando solo lo medido (cabecera y pie iguales,
  capturas más grandes, líneas a 65 letras, lista y capturas lado a lado, preguntas en dos columnas).

Común a las tres: cabecera y pie iguales, glifos de módulo también en la landing, y el pie con
enlaces a las otras dos páginas usando textos que ya existen («PACE completo», «Android e iPhone»).
Eso último es una letra aparte para Ez.

## Lo que falta, en orden

1. `generar.js`: copias de las tres páginas con el CSS de cada dirección encima. La landing sale de
   `index.html` quitando los `<script>` (se quedan sus 64 KB de estilos) y cambiando lo que hay entre
   las marcas `pace-landing`; /premium y /beta, de sus `index.html` con las rutas reescritas. Idioma
   y tema por `window.name` o `#lang=en&tema=oscuro` (el tema, cambiando el `mediaText` de las reglas
   `prefers-color-scheme`).
2. Los tres CSS (A, B, C) y las fotos de las 72 combinaciones; medir contraste de cualquier color
   nuevo y el peso que añade cada una (y el primer pintado metiéndola en una copia de `index.html`).
3. La página para Ez (skill `artifact-design`): defectos con foto, visor por dirección (página,
   idioma, tema, móvil/ordenador) y las letras. Publicarla con Artifact y guardar la copia aquí.
4. Commit y push a `claude/landing-c-9nov`. Nunca a `main`.
