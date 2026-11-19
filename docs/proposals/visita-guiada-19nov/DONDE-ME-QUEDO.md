# La visita guiada, más completa: dónde me quedo (19 nov.)

Ez eligió (literal): «la A pero me parece que lo de construir tu día debería ser importante».
**Está montada en esta rama** (`claude/visita-guiada-19nov`), sin bump y sin juntar con `main`.

## Lo montado

La visita tiene seis paradas y **tu día es la primera**:

1. **Empieza por tu día** (`dia`): «Elige cuánto trabajas hoy y PACE reparte tus pausas…», que cada mañana
   te lo propone según tu semana y qué hace «Al calendario».
2. **El aro**: y que la primera vez pide permiso para avisar.
3. **Actividades**: como antes.
4. **Estadísticas y logros** (`arriba`, nueva): el hueco abarca los dos iconos (`y` en la parada;
   `data-pace-topbar-stats` y `data-pace-topbar-logros` en `TopBar.jsx`).
5. **El menú** (`cajon`, móvil, el botón de las tres rayas) o **A la izquierda** (`columna`, ordenador):
   solo se pinta uno de los dos; comparten `visita.menu.texto`.
6. **Ajustes**: que PACE lo guarda todo en el aparato y que en «Tus datos» se hace una copia.

Commits: tu día primero, Estadísticas y logros, el menú, los tres textos; cada uno con su prueba vista caer
antes. `tests/bienvenida-visita.spec.js` mira 360 × 640, 360 × 740 y 1280 × 800, y una vuelta entera en
inglés a 360 × 640. `verify.integridad`: 1290 claves (+5). `npm run verify` en verde. **La suite entera
no la he pasado**: la pasa la coordinadora antes de juntar.

Un texto más largo del aro («La primera vez que empiezas, te pide permiso…») no cabía a 360 × 640 y tapaba
el aro: se quedó la frase de la maqueta.

## La otra manera (sin montar)

Tu día la última, con «Y ahora, tu día» y el botón «Preparar jornada» en vez de «Entendido», que abriría la
pregunta del día. Pintada al vuelo en `monta.js` (fotos `U-*`). Si Ez dice «la otra»: mover la fila `dia` al
final de `PACE_VISITA_PARADAS`, cambiar el título y que el botón de esa última parada llame a
`ritmoAbrirPregunta` (el que usa «Preparar jornada» en `RitmoTarjeta.jsx`) al cerrar, con su prueba.

## La página

- **Cuenta EcLj6 (nueva, con lo montado)**: https://claude.ai/artifact/BfPMCqdYBefjo5ZF6dJCB4
  (versión 1, id 1795097463-3f59). Privada: Ez la abre con su cuenta.
- **Cuenta 5iWBf: queda por republicar** https://claude.ai/artifact/XjFDL77p2tykyvVtZU5FJU, que sigue
  enseñando las tres opciones A, B y C. Para ponerla al día desde esa cuenta: Artifact con `url` = esa,
  `file_path` = `docs/proposals/visita-guiada-19nov/index.html`, `root` = `docs/proposals/visita-guiada-19nov`
  y en `files` las 36 fotos que usa: `M-360` y `M-1280` (1 a 6), `U-360` y `U-1280`, y `hoy-360` (1 a 4),
  todas en es y en.
- La página pregunta: «así» (como está) o «la otra».

## Rehacer las fotos

Con el `index.html` de esta rama servido en un puerto (aquí, 8955, que sirve los archivos del worktree):
`PUERTO=8955 node docs/proposals/visita-guiada-19nov/monta.js` → `fotos/M-*`, `fotos/U-*` y
`medidas-montada.json` (todas `ok`). `pinta.js` y `recorre.js` son de la maqueta de las tres opciones.

## Lo que sigue

Ez contesta «así» o «la otra». Luego la coordinadora pasa la suite entera, hace el bump y la junta en `main`.
