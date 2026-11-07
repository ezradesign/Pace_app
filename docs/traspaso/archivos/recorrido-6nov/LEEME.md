# Recorrido del 6 nov. 2026 · scripts

El informe: `docs/audits/recorrido-6nov.md`. La página para Ez: https://claude.ai/artifact/Pd8CZq71NjTMimaydP3caM
(`pagina-ez.html`, con las fotos de `fotos/`).

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

**7 nov., dónde me quedé (uso al 83 %):** montado 1A 2A 3A 5A (4C sin tocar), con sus pruebas, cinco
mutantes en rojo y `verify` en verde; commit «WIP:». Falta: el resultado de las pruebas vecinas
(aro-jornada, ritmo-*, hora-y-medianoche, bloques-cortos, cambio-de-dia, pausa-*), rehacer las fotos
del después con `_despues.js` (las del scratchpad son de antes del último ajuste del aro) y
publicarlas en la página de Ez (`pagina-ez.html`, misma URL).

**Pruebas vecinas sobre d7995d2e: 251 en verde y 12 en rojo (21,5 min).** Sin mirar aún, por el uso.
Lo más probable es que el cierre por la hora (1A) choque con pruebas que siembran un día y ponen el
reloj cerca o pasada la salida: `ritmo-linea` (7: «al final del día nada se pisa», el resumen que cambia
de fila, el hueco del retraso; todos `locator.click` que ya no encuentran la línea), `ritmo-panel`
(móvil, la frase compacta), `ritmo-pausa:106` («Hacer la pausa» entra en el plato), `ritmo-aviso:95`
(el último bloque cierra el día) y `hora-y-medianoche:111` (CONTROL marzo, 3:10). `ritmo-bloque-siguiente:26`
cayó con «browser has been closed» (puede ser carga). Hay que decidir caso a caso si la prueba
describe algo que la 1A cambia a propósito o si el cierre es demasiado pronto (p. ej., `m.fin` de
«Una hora» o de un día recolocado).
