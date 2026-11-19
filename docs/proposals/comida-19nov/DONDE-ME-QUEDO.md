# Caza de la comida (19 nov. 2026) · dónde me quedo

Rama `claude/comida-19nov`, cortada de `main` 0.211.0. Sin bump, sin juntar y sin subir a main.

**Página para Ez:** https://claude.ai/artifact/VV5XLipvC497TC1ceFMG73 (id `VV5XLipvC497TC1ceFMG73`; publicada
desde esta sesión, que debería ser la cuenta EcLj6; si no se abre desde ella, republicar `index.html` con las
fotos que enlaza). Fuente: `docs/proposals/comida-19nov/index.html`.

## Arreglado (un commit por fallo, cada prueba vista caer antes)

1. `36ee0296` · Con la comida como parada abierta, cambiar su hora, su duración o la semana la congelaba como
   hecha (`ritmoFijarLoHecho`). Prueba: `tests/comida-abierta-cambiar.spec.js`.
2. `b25ea307` · Empezar el bloque en plena comida guardaba la comida entera con el bloque encima; ahora se
   corta a esa hora (0 min si es a su hora en punto). Prueba: `tests/comida-saltada.spec.js`.
3. `b0df6b6a` · Con el primer bloque en marcha y nada hecho, cambiar horas lo recortaba en la línea; ahora se
   guarda a su hora con los minutos del aro. Prueba: `tests/comida-primer-bloque.spec.js`.
4. `b2898ba7` · La pausa de antes de comer saltada en el mismo minuto salía de la línea y su «saltada» caía en
   una de la tarde. Prueba: `tests/comida-pausa-saltada.spec.js`.

Comprobado: las cuatro specs nuevas, `ritmo-fijar-lo-hecho`, `ritmo-cambiar-en-marcha` y `ritmo-comida-bloque`
con `--workers=1`, y `npm run verify` en verde. **La suite entera no se ha corrido** (la pasa la coordinadora).

## Preguntas para Ez (en la página, con letras)

P1 «Cambiar» a media mañana borra lo hecho · P2 cómo se ve la comida saltada · P3 si la saltada vuelve ·
P4 «Ir a comer» antes de su hora · P5 la comida ya pasada sin volver. Recomendada: A en todas.

## Sin fallo

Recargar en plena comida, la media jornada (no sirve comida), adelantar la comida con el día sin empezar, y la
medianoche (la comida va de 11:00 a 17:00).

## Fotos

`fotos/*-antes.png` y `*-despues.png` (1280 es y 360 en); las saca `guiones/comida-fotos.spec.js` (copiarla a
`tests/` y `FASE=antes|despues`). El caso 4 a 360 px no tiene foto: el botón de Estadísticas del móvil no se
encontró y no lo perseguí.

Faltan: `CHANGELOG.md` y `STATE.md` (van con el bump de la coordinadora) y una fila en
`DECISIONES_TECNICAS_VIGENTES.md` si Ez da por buenas las reglas de los arreglos 1 y 2.
