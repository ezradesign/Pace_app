# La octava: dónde me quedo (11 nov. 2026, rama `claude/octava-11nov-418170`)

Paré con la cuenta al 73 % de la ventana de 5 h, antes del tope del 85 %, para dejar la página y el informe.

## Hecho y subido

| Etapa | Commit | Qué |
|---|---|---|
| 1 | 11d79318 | `e2e` en cinco trozos; Safari en la imagen de Playwright; `scripts/verify.ci.js` lo vigila |
| 2 | e64e5100 | `externa-octava-11nov-comprobado.md`: 20 ciertos, 6 a medias, 2 falsos |
| 3 | f9d1e741 | O1 (tope de `pasoV1.hasta`, `tests/paso-v1-tope.spec.js`) y O4 (AAB tras CI verde) |
| 3 | 0e831240 | O5 y prueba 1: `tests/apnea-aviso.spec.js` |
| 3 | 69a61326 | O3: WebView 111 y Safari 16.4, `scripts/verify.versiones.js` |
| 3 | 71e4f8ba | Prueba 5: reloj a hora fija en `verify.pruebas.js` y el CI a horas fijas |

CI de la rama (run 43077304826, sobre 11d79318): verde entero; trozos de 6:53 a 10:31, Safari 2:22.
Lo de después de 11d79318 no ha pasado por el CI de GitHub: solo `verify` y las vecinas en local.

## Lo que queda

- **O2, medida y NO garantizada.** Con toda la letra de la home al 115 % (cada tamaño ×1,15, como el
  zoom de texto del WebView), la home pide scroll en 5 de 8 combinaciones (idioma × pantalla): de 9 a
  51 px a 360×640, 375×667 y 360×718. Cabe a 412×844. Arreglarlo es un cambio visual: maqueta y
  decisión de Ez (va en la página). El experimento, `zz-exp-115.spec.js` en el scratchpad de la sesión:
  `home-sin-scroll.spec.js` con una tercera medida tras el `letter-spacing`.
- **Pruebas de la octava sin montar:** 2 (almacenamiento lleno en todas las claves), 3 (copia antigua
  sin marcas; el nº 15 es falso, así que pierde sentido), 4 (exportar, borrar e importar una cuenta
  rica), 6 (humo contra `dist/`), 7 (landing: tamaño e idioma), 8 (home sin scroll en v1, en lunes,
  con barras y midiendo el documento), 9 (husos de América y Asia de noche), 10 (sin botones de compra
  con compra vigente; mensual sin portal).
- **Ciertos sin arreglar** (no piden letra): nº 2 (respira-5, 6 y 12 a `MEDIODIA`; ya están en la
  lista que encoge), 6, 9, 10, 11, 12 (prohibir `.skip`/`.fixme` y un mínimo de pruebas que solo sube:
  `verify.ci.js` ya cuenta con `--list`), 16, 17, 20, 21, 23, 24, 25, 26 y 27.

Página para Ez: https://claude.ai/artifact/RuCb7GAYhuR5mpPZXjWZ3F (fuente en `docs/proposals/montado-octava-11nov/`).
