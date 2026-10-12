# Runner: el círculo de Mueve y la letra de las explicaciones (8 oct. 2026)

- `circulo-explicaciones.html`: la página enviada a Ez, con medidas, fotos (dentro) y preguntas.
- `medidas/`: censo de las 31 rutinas en cinco pantallas (`antes.json`, `A.json`, `B.json`, `C.json`), líneas por frase (`L_*.json`), el CSS de cada opción (`opt*.css`) y los scripts que lo midieron (`censo.js`, `lineas.js`, `fotos.js`, `pagina.js` + `plantilla.html`). Se lanzan con el servidor en el puerto 8951 sobre `index.html`.

Hallazgo: el círculo lo encoge la explicación más larga de cada rutina, no el módulo (Flexiones de escritorio, 143 letras: 125 px frente a 170 a 360×640).
Recomendada: A (serif itálica 17 px móvil / 18 escritorio, `--ink-2`) + tope de 95 letras por frase.
Ojo: `v1Reservas` reserva también el `setup` de un paso con reloj en la posición 0, que no tiene fase de colocación (move.spine.chair y move.hamstrings.standing, paso 0): ocupan hueco sin verse nunca.
