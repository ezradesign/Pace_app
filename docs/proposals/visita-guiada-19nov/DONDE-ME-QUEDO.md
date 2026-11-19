# La visita guiada, más completa: dónde me quedo (19 nov.)

Ez preguntó: «¿podríamos hacer la visita guiada más completa?». Hay una maqueta con tres opciones,
pintadas sobre la 0.211.0 y **sin montar nada en `app/`**.

## La página

- **Cuenta 5iWBf**: https://claude.ai/artifact/XjFDL77p2tykyvVtZU5FJU (versión 1, id 1795090864-6e3b).
  Es privada: Ez la abre con su cuenta.
- **Cuenta EcLj6: falta su par.** Para publicarlo desde esa cuenta: Artifact con
  `file_path` = `docs/proposals/visita-guiada-19nov/index.html`, `root` = `docs/proposals/visita-guiada-19nov`
  y en `files` las 64 fotos que usa (hoy-360, A-360/1280, B-360/1280, C-360/1280 y Cdia-360/1280, en es y en).
  Las hoy-1280 no las usa la página.

## Lo que enseña

- **Hoy**: las cuatro paradas de la visita (el aro, actividades, tu día, Ajustes) y cinco cosas que se salta
  (los dos iconos de arriba, el menú, el calendario, los avisos y la copia).
- **A · seis paradas (recomendada)**: la misma visita con «Estadísticas y logros», «El menú» (en el
  ordenador, «A la izquierda») y tres textos más claros (avisos, calendario, copia).
- **B · una línea la primera vez**: la visita se queda igual; en Estadísticas, Logros, Ajustes y al preparar la
  jornada, la primera vez sale una línea bajo el título con «Entendido».
- **C · visitas por temas**: en Ajustes › Visita guiada, una lista con cuatro visitas cortas.
- Arriba y abajo: «Contesta con una letra: A, B o C. Se pueden juntar».

## Medidas

`medidas.json`: todas las paradas de A y C caben y no tapan lo que enseñan, a 360 × 640 y 1280 × 800, en es y
en. El «no cabe» de la B en inglés en Estadísticas era del guion (buscaba «Gentle» y la frase es «A gentle
look at your activity…»): arreglado en `pinta.js`, las cuatro líneas de la B caben en los dos idiomas.
Sin medir: la letra grande del móvil (se mide al montar).

## Rehacer las fotos

Con el `index.html` de la 0.211.0 servido en un puerto (aquí, 8955):
`PUERTO=8955 SOLO=hoy,A,B,C IDIOMAS=es,en node docs/proposals/visita-guiada-19nov/pinta.js`
(`SOLO` e `IDIOMAS` limitan lo que se repite). `recorre.js` saca las capturas de `hoy/`.

## Lo que sigue

Ez elige letra. Montarla es otra rama y le toca a la coordinadora juntarla en `main`.
