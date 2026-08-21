# Prompt de arranque · s173

> Pégalo tal cual en la sesión nueva. Está escrito para una cuenta **sin memoria de
> este proyecto**: todo lo que hace falta saber está en el repo, y esto sólo dice
> qué leer, en qué orden y qué NO volver a medir.

---

```
Arrancamos s173 de PACE. Sigue el protocolo de arranque de `CLAUDE.md` y confírmame
el estado antes de tocar nada.

El plan está en `docs/HANDOFF_s173.md`. Léelo entero: trae medido lo que no hay que
volver a medir y siete trampas que ya costaron tiempo.

Contexto: s172 cerró en v0.102.2, commiteado y pusheado, con el CI en verde en sus
dos jobs. `npm run verify` PASA y `npm run test:e2e` da 115/115. Quedaron cerrados:
la Fase 2 del esquema de eventos (los cuatro emisores), los 15 glifos por lados —que
entran por ESPEJO, sin dibujar nada—, el círculo del paso de descanso, que no se
pintaba, y la deriva del círculo del runner, que era un acantilado bajo los suelos de
s171 y ahora mide 0 px en 8 viewports. Y las dos decisiones que el emisor había
dejado abiertas están decididas y escritas en el esquema (rev. 6).

Orden de trabajo que propongo, dime si lo cambias:

1. La RETENCIÓN por calendario de `pace.events.v1` (120 d, §12 del esquema). Es lo
   único que quedó con la premisa caducada: hasta s172 la nota decía «sin emisores
   no hay nada que podar», y ya hay emisores. Las tres piezas están implementadas
   (`selectEventsToPrune` + `foldEventsIntoBaseline` + `nextPruneCursor`) y el punto
   de extensión está declarado por escrito en `app/events/events-adapter-web.js`.
   Léete §12 ANTES de razonar nada: en s170 y s172 varias respuestas deducidas
   sobre este esquema salieron mal, y el documento las contestaba.
2. El arte que falta, si te paso dibujos: 4 identidades, 2 muebles y `Descanso`,
   cuyo prompt ya está escrito en `GLIFOS_ENCARGO_TANDA.md` §4. `Descanso` es el
   paso más repetido de la app y hoy enseña dos barras de reproductor.
3. `Puente torácico` a tamaño real, que lleva dos sesiones pedido, y los 3
   ejercicios que no pueden recibir lado (`90/90`, `Elevación de talones`,
   `Sentadilla búlgara`): su lado vive sólo en el texto y convertirlos es tocar
   dosis del catálogo, no arte.

Antes de tocar el subsistema de eventos, lee su fila en
`docs/product/DECISIONES_TECNICAS_VIGENTES.md`: hay seis decisiones nuevas de s172
y dos de ellas son justo las que un cambio descuidado rompe (dónde vive el emisor,
y que el módulo de un paso se pregunta al catálogo y no al prefijo del id).

Verificación medida en cada bloque: `npm run verify` + `npm run test:e2e`, y cada
aserto nuevo se pone ROJO a propósito antes de darlo por bueno.
```

---

## Si la cuenta nueva pregunta «¿por dónde empiezo a leer?»

El protocolo de `CLAUDE.md` ya lo dice, pero en corto y por orden de rentabilidad:

1. `CLAUDE.md` — las reglas que no se negocian (archivos < 500 líneas, nada de
   emojis en UI, `Object.assign(window, …)` al final de cada JSX, el checklist de
   cierre).
2. `STATE.md` — versión, «Última sesión», «Próxima sesión», deuda y el índice de
   decisiones. **Se reescribe cada sesión; es el presente.**
3. `docs/HANDOFF_s173.md` — el plan de esta sesión.
4. `docs/product/DECISIONES_TECNICAS_VIGENTES.md` — **la fila del subsistema que se
   vaya a tocar, ANTES de tocarlo.** Es lo que evita repetir regresiones.
5. `DESIGN_SYSTEM.md` sólo si se toca algo visual.

## Las cuatro cosas que más caro salen en este repo

- **El artefacto se regenera y se verifica**: `node build-standalone.js` reescribe
  `index.html` (el canónico) y también `PACE_standalone.html`, que es **export bajo
  demanda** y se restaura con `git checkout -- PACE_standalone.html`.
- **La suite corre sobre `index.html`, no sobre `PACE.html`.** Si se toca fuente y
  no se rebuildea, los tests miden el artefacto viejo — y eso ya se pagó tres veces.
- **Cada aserto nuevo se calibra en rojo.** Un test que nunca ha fallado no ha
  demostrado que mida algo; en s172, dos de ellos midieron el instrumento y no el
  producto hasta que se comprobó.
- **Ni un backtick dentro del template literal del CSS del runner**
  (`app/move/MoveSessionV1.css.jsx`). El build ABORTA, y con la salida silenciada las
  medidas siguientes corren contra el artefacto viejo y salen idénticas: en s172
  mordió tres veces seguidas. Si una medida no cambia cuando debería, lo primero es
  mirar si el build pasó.
