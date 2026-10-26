# Lo que prometemos sobre los datos (P1-P5), 26 oct.

Rama `claude/privacidad-p1-p5-a973d0` (worktree `beautiful-perlman-2b642c`). Sin versión todavía.

## Hecho

- `24f3c8e` · **P2 y P5, lo que no se ve**, con `tests/privacidad-datos.spec.js` (contra v0.178.0 caen
  Google, Android y «Avísame»; Outlook ya pasaba y queda de guarda):
  - Google: la lista de reuniones lleva `fields` (`CALENDARIO_GOOGLE_REUNIONES`, en
    `ritmo.calendario.web.js`): horas, estado, libre, la marca de PACE y, de cada invitado, solo
    `self` y `responseStatus`. Sin probar contra Google de verdad (falta el alta de Ez).
  - Android: `paceAndroidCalendarioEventos(desde, hasta, propio)` solo da título, texto y aviso de lo
    que `propio` reconoce (lo de PACE en ese móvil); `calendarioListarDePace` le pasa
    `calendarioAndroidEsDePace`. El complemento sigue leyendo el evento entero dentro del móvil.
  - «Avísame»: `expirationTtl` de un año en el KV.
- verify en verde; las cuatro specs del calendario y `premium-pagina`, en verde en el 8806.

## Ahora

Página de antes y después publicada y enviada a la coordinadora, **esperando la respuesta de Ez**:
https://claude.ai/artifact/QMy8fBJtxgf4SR8weSi7wY (fuente: `docs/proposals/privacidad-antes-despues-26oct.html`).
Tres preguntas, recomendada 1A 2A 3A: 1 las pausas privadas en el calendario (A privadas y libres en Google,
Outlook y el archivo; en Android, con una pieza nativa aparte que Ez prueba antes · B como hoy, y decirlo);
2 contar la compra en la web ya, con «Aún no se puede comprar» (A) o al encender Stripe (B); 3 «Avísame», un año
(A, ya en el código) o seis meses (B). Las frases exactas, en la página.

Al montar: privacy.html con las frases de la página, `cal.reuniones.sub` en los dos idiomas, la frase de
`contenido-de-la-app.md`, y un aviso en `verify` que falle si `premium/index.html` lleva la analítica y
privacy.html dice que no la hay (o al revés). Luego verify, la suite en el 8806, 0.179.0 provisional.

## Lo que se sabe para montar

- P3 en Android: el complemento (`@ebarooni/capacitor-calendar` 8.8.0) no deja marcar un evento como
  privado (no tiene `ACCESS_LEVEL`): haría falta una pieza nativa propia, como `PaceBarras`.
- P4: `premium/index.html` no lleva el fragmento de analítica (línea «WEB ANALYTICS»).
- Las apps (Android e iPhone) no hablan con ningún servidor: `/api/renovar` solo en la web
  (`paceLicenciaPermitida`), el calendario web solo fuera de las apps.
