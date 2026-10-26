# Lo que prometemos sobre los datos (P1-P5), 26 oct.

Rama `claude/privacidad-p1-p5-a973d0` (worktree `beautiful-perlman-2b642c`, puerto 8806). v0.179.0 provisional.

## Lo que eligió Ez

«Me vale la privacidad» (26 oct.) sobre https://claude.ai/artifact/QMy8fBJtxgf4SR8weSi7wY: la recomendada, 1A 2A 3A.
- 1A: las pausas, libres y privadas en Google, Outlook y el archivo; en el calendario del móvil, cuando Ez pruebe la
  pieza nativa (aún no hecha).
- 2A: la compra en la web, contada ya en `privacy.html` (#compra), empezando por «Aún no se puede comprar en la web».
- 3A: un año para los correos de «Avísame».

## Hecho

- `24f3c8e` · P2 y P5 por dentro: Google con `fields`; el puente de Android sin título ni texto de lo ajeno; «Avísame»
  con `expirationTtl` de un año.
- `923cf42` · 1A en la web y el archivo (`visibility`, `sensitivity`, `CLASS:PRIVATE`); las frases de `privacy.html`
  (ES y EN), `cal.reuniones.sub` y `contenido-de-la-app.md`; `scripts/verify.privacidad.js` (cae con sus dos mutantes).
- Después: 0.179.0, CHANGELOG, STATE, DECISIONES (fila de arriba) y el LEEME del traspaso.
- `tests/privacidad-datos.spec.js`: P2 Google, Outlook y Android, P3 y P5.

## Lo que queda

- **La pieza nativa de Android para «privado»**: `@ebarooni/capacitor-calendar` 8.8.0 no escribe `ACCESS_LEVEL`. Un
  complemento propio, como `PaceBarras`, que tras crear o cambiar un evento ponga `Events.ACCESS_LEVEL =
  ACCESS_PRIVATE`; se prueba en el Android de Ez y entonces se quita de `privacy.html` «En el calendario del móvil, por
  ahora, cada pausa va con su nombre».
- El día que se encienda Stripe, quitar «Aún no se puede comprar en la web» de #compra y #compra-en.
- El día del token de analítica en /premium, `verify` obliga a cambiar la frase de #avisame en los dos idiomas.
- Play (Seguridad de los datos) y App Store Connect (Privacidad): ninguna respuesta cambia; se rehacen con la compra
  dentro de las apps (v1).
