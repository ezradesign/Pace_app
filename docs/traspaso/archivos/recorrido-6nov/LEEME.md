# Recorrido del 6 nov. 2026 · scripts

El informe: `docs/audits/recorrido-6nov.md`. La página para Ez: https://claude.ai/artifact/3deGGg5MHvUmihZHqwEj99
(`pagina-ez.html`, con las fotos de `fotos/`; la de antes, Pd8CZq71NjTMimaydP3caM, es de la otra cuenta).

Se corren desde la raíz del repo contra `index.html` servido en el 8876 (`lib.js` lo arranca si no
lo está), con `RECORRIDO_FOTOS=<carpeta>` para las capturas:

- `01-primera-vez.js [movil|escritorio|ez]`: bienvenida, semana, PACE completo y visita, en es/en y claro/oscuro.
- `02-jornada.js <tam> <es|en> [osc]`: la jornada de alguien con seis semanas de datos (`siembra.js`).
- `03-modulos.js <tam> <es|en> [osc] [parte]`: Respira, Mueve, Estira, Hidrátate, Logros, Estadísticas, «Tus rutinas» y Ajustes.
- `04-final-del-dia.js <tam> <es|en>`: la jornada bloque a bloque hasta la salida y la mañana siguiente.
- `05-web.js`: /premium, /beta, /gracias, /recuperar, /desistir y la app sin red.
- `resumen.js salida.json` resume lo que salta; `hoja.js` hace hojas de contactos.
- Los `_*.js` reproducen cada fallo apuntado (`_silla`, `_sello`, `_tarde`, `_tarde2`, `_tras-la-jornada`, `_noche`)
  o lo que se descartó (`_tab-constructor`, `_agua`, `_404`).

**7 nov., tarde: la rama lista para juntar.** Montado 1A 2A 3A 5A (4C sin tocar), cada uno con su
prueba y su mutante en rojo. Las 12 pruebas vecinas que salieron rojas sobre d7995d2e, pasadas otra vez
con `--workers=1`:
- `ritmo-pausa:106`, `ritmo-aviso:95` y `ritmo-bloque-siguiente:26` pasan: era carga.
- La 1A, a propósito (8): `ritmo-linea` (7) y el móvil de `ritmo-panel` describían «Una hora» empezada
  a las 17:20 y retomada a las 19:30, con su hora (18:20) y la salida (19:00) ya pasadas: ese día ahora
  está cerrado. `ritmo-linea` usa «Dos horas» retomada a las 19:15 (antes de su fin, 19:20; hueco de
  419 px y «AHORA» al 74 %) y `ritmo-panel` recoloca el bloque 2 a las 18:10.
- Fallo (1): `hora-y-medianoche:111` (H2, marzo). «Una hora» desde la 1:20 de la noche del cambio de
  hora se cerraba a las 3:10, a los 50 minutos, porque la hora que no existe contaba. El motor da
  `m.finDesde` y `ritmoTrasElFin` mira el instante en el reloj de cuando empezó; mutante en rojo.
- Decidido sin preguntar, y dicho en la página de Ez por si no le convence: «Una hora» y «Dos horas»
  también se cierran a su hora, contada desde que empezaste, aunque la salida sea más tarde.

Fotos del después hechas con `_despues.js` (`PACE_E2E_PORT=8882`) a 360 y a 1280 px y pasadas a webp
en `fotos/despues-*.webp`.

**7 nov., dónde me quedo (uso al 90 % de las 5 h):** `verify` en verde y la zona con un worker en
verde salvo `ritmo-pausa:106`, que es carga: con el PC tranquilo pasa 3 de 3 (19-25 s); bajo carga
tarda hasta 2 min. Medido con CDP, un minuto de sesión cuesta lo mismo con el `index.html` de `main`
que con el de la rama. Página de Ez publicada en esta cuenta. Falta: los cinco mutantes de 1A 2A 3A
5A sobre este último build (el del cambio de hora ya salió rojo) y la suite entera con `--workers=1`.
El script de los mutantes estaba en el scratchpad: cada uno quita un arreglo de `index.html`
(`ritmoPasadaLaSalida(p)) {` → `false) {`; `if (!p || !p.cerrado || s === _ritmoCierrePintado` →
`if (true || s === _ritmoCierrePintado`; `if (p.deMas || typeof inicioMs` → `if (false || typeof
inicioMs`; `if (!diaRef.current || !hoy || diaRef.current === hoy) return;` → `return;`; el
`"aria-label": tn('hydrate.glass'` → `"data-x": ...`), corre su prueba y vuelve a compilar.

**7 nov., ~18:40: cerrado, espera el «júntalo» de Ez.** La suite entera con un worker, en verde (1323 pasan
y 2 se saltan, 59,7 min, sobre 42ae69c7). Los cinco mutantes, en rojo: el de `deMas` vivía porque la ventana
ya la guarda `ritmoPropuesta`, y lo que esa línea evita es otra cosa: que acabar un Foco por libre tras el
último bloque recoloque el día (congela el bloque en `pasado`, mueve `desde` de 720 a 778 y reabre la pausa).
La prueba de `ritmo-pausa.spec.js` («tras el último bloque, un Foco por libre…») lo mira ahora: el día,
igual antes y después de acabar ese Foco. `ritmo-pausa.spec.js` entera, 7 de 7, y `verify` en verde.
