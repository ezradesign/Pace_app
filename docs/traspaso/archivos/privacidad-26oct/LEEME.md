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

La página de antes y después para Ez (privacy.html, la app y `contenido-de-la-app.md`), con las
opciones de P3. Nada público cambia hasta su respuesta.

## Lo que se sabe para montar

- P3 en Android: el complemento (`@ebarooni/capacitor-calendar` 8.8.0) no deja marcar un evento como
  privado (no tiene `ACCESS_LEVEL`): haría falta una pieza nativa propia, como `PaceBarras`.
- P4: `premium/index.html` no lleva el fragmento de analítica (línea «WEB ANALYTICS»).
- Las apps (Android e iPhone) no hablan con ningún servidor: `/api/renovar` solo en la web
  (`paceLicenciaPermitida`), el calendario web solo fuera de las apps.
