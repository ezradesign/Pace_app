# La octava: dónde me quedo

## Tercera parte (12 nov. 2026, rama `claude/quirky-torvalds-6a57ae`, sale de `main` 0.201.0)

Montado entero lo que quedaba de la octava. Sin bump ni CHANGELOG: lo junta la coordinadora.

| Etapa | Commit | Qué |
|---|---|---|
| 1 · la B de Ez | 221c3021 | Con la letra al 115 %, si la home no cabe, las cuatro actividades en una fila, solo el dibujo (`home-geometry.medidas.js`, modo 1 de `ajustar`); nombre en `aria-label` y `title`; `home-fila-recogida.spec.js`; fuera los `pendiente115` de la tarjeta corta, el día contestado y el bloque terminado |
| 2 · pruebas 2, 4, 6, 7, 8, 9 y 10 | cc5a298c | Almacenamiento lleno en todo, copia de ida y vuelta, humo contra `dist/`, landing con tamaño e idioma, la home en v1 un lunes con barras, husos de noche, compra vigente y mensual sin portal. Dos fallos de la app arreglados (abajo) |
| 3 · ciertos sin arreglar | 40c13fa3 | nº 2, 6, 9, 11, 16, 17, 20, 21, 23, 24, 25 y 26 (9, 11, 17 y 23 los cierran las pruebas 10, 7 y 6). El nº 2 era precaución: a las 23:57 respira-5 y 6 también pasaban |
| — | 771017c4 | Página «Montado» (`docs/proposals/montado-octava-3-12nov/`, sin publicar) y este relevo |
| 3 (resto del nº 17) | (el siguiente) | `scripts/verify.escrituras.js`: cada `setItem` de `app/` dentro de un `try` y en un censo exacto (19 en 14 archivos); hecho con el margen que dio Ez a las 14:40 |

**Dos fallos de la app que destaparon las pruebas, arreglados (pequeños y claros):**
- La tienda de la web vendía el mensual con su enlace aunque no hubiera portal para cancelarlo
  (`app/state-compra.js`): ahora el mensual solo se vende con `gestionar`. Hoy no cambia nada (los dos
  enlaces están en `null`). Las pruebas que abren la tienda con el mensual le ponen portal.
- Un estado guardado sin `weeklyStats` arrancaba sin marcar la migración de la v0.28.8: la copia iba sin
  marca y al traerla la semana se corría un día (`app/state-core.jsx`, `loadState`). Ahora, sin semana
  que re-indexar, se marca igual. En una instalación real es raro; en las semillas de las pruebas, no.

**Probado:** `verify` en verde; las vecinas de la etapa 1 (166, Chromium y WebKit), las de la etapa 2
(363) y las de la etapa 3 (34, con `home-sin-scroll` en los dos motores), con `--workers=1` en el puerto
8795. La suite entera no se ha pasado aquí: la pasa el CI al juntar.

**Lo que se cambió en pruebas viejas por la B:** `home-aro-interior` medía el suelo del aro a 360×600
y 375×600, que con la fila ya caben: baja a 360×560 y 375×560.

### Espera a Ez (en la página)
- La fila sale también **con la letra normal** en pantallas más bajas que 360×640 si así cabe (360×600,
  360×580, o 320×568 en castellano), igual que «Luego». Recomendado dejarlo.
- La barra de «no deja guardar» sale al acabar el Foco, no al empezarlo: empezar solo escribe el reloj
  del Foco (`persistFocusTimer`, que traga el error), y si se cierra PACE a mitad ese bloque se pierde
  sin aviso. A: dejarlo; B: que la barra salga con la primera escritura que falle, sea la que sea.
  Recomendada la B. (La prueba 2 lo deja dicho: la barra se mira al acabar.)
- Mirar en un Android de verdad con la letra grande (aquí se emula ×1,15).

### Lo que no se hizo
- nº 4 entero (reloj fijo en TODAS las pruebas que apagan la bandera): hecho en `caza-v1-compra`; las
  demás siguen en `RELOJ_SIN_HORA_ANTIGUOS` o con su hora propia. La pasada en lunes la da la prueba 8.

## Segunda parte (12 nov. 2026, rama `claude/octava-2-12nov-9ca0e7`, sale de `main` 0.200.1)

Paré con la cuenta cerca del 80 % de la ventana de 5 h para dejar la página y este relevo.

| Etapa | Commit | Qué |
|---|---|---|
| 1 · 2 B | b40e65ee | Pasada de noche de las 21:30 UTC; `horasDeNoche` en `verify.ci.js` mira invierno y verano |
| 2 · 1 A2 | 19536851 | Letra grande: «Luego» se recoge si la home no cabe (`home-geometry.medidas.js`); 3.ª medida al 115 % y `home-luego-recogido.spec.js` |
| 4 (parte) | 3623ac1e | nº 12 (saltos y `MINIMO_PRUEBAS` = 1526), nº 27 (llaves binarias), nº 10 (`lunes`, martes) |
| — | (este) | Página «Montado» y este relevo |

Página para Ez: https://claude.ai/artifact/8Pgz18Qv7qMcwXCGQcJVgw (fuente en `docs/proposals/montado-octava-2-12nov/`).

### Espera a Ez
- **A o B** para la tarjeta corta y el día contestado con la letra al 115 % (A: sin la línea de puntos;
  B: actividades en una fila, solo el dibujo). Recomendada la B: es la única que cabe en todo
  (inglés a 360×640: A deja 31 px). Hoy van con `pendiente115` (tope en px) en `home-sin-scroll`.
- La pregunta del día en inglés a 360×640 pide 17 px al 115 %; ni A ni B la tocan.
- Mirar en un Android de verdad con la letra grande (aquí se emula con ×1,15 a la letra calculada).

### Lo que queda (sin empezar)
- **Etapa 3, pruebas de la octava:** 2 (almacenamiento lleno en todas las claves), 4 (exportar,
  borrar e importar una cuenta rica), 6 (humo contra `dist/`), 7 (landing: tamaño e idioma), 8 (home
  sin scroll en v1, en lunes, con barras y midiendo el documento), 9 (husos de América y Asia de
  noche), 10 de la lista (sin botones de compra con compra vigente; mensual sin portal). La 3 no se
  monta: el nº 15 es falso.
- **Etapa 4, ciertos sin arreglar:** nº 2, 6, 9, 11, 16, 17, 20, 21, 23, 24, 25 y 26 (los sitios, en
  `externa-octava-11nov-comprobado.md`).

## Primera parte (11 nov. 2026, rama `claude/octava-11nov-418170`), ya en `main` (0.200.1)

CI en cinco trozos, la regla de relojes, O1, O3, O4 y O5, y las pruebas 1 y 5. Página:
https://claude.ai/artifact/RuCb7GAYhuR5mpPZXjWZ3F (fuente en `docs/proposals/montado-octava-11nov/`).
