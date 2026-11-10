# Montar la auditoría · terminado (10 nov. 2026, noche)

Todo montado en la rama `claude/montar-auditoria-10nov-3ef28c`; espera el «júntalo» de Ez. Página para Ez:
https://claude.ai/artifact/CpnFEkENADXDVU7K7u8k5M (copia: `montado.html`, con las fotos de `fotos/`).

| Pieza | Commit | Pruebas |
|---|---|---|
| D-5 B · el día de v1 se quedan solo las acabadas | 6d265a88 | `tests/paso-v1.spec.js` (10, una nueva); el mutante que vuelve a `sessionsByRoutine` la pone en rojo |
| D-4 C · el repo no dice dónde viven las llaves ni el detalle del fallo de cobro abierto | 7b4a964e | `verify`; lo ya subido sigue en el historial de git, y la rama `guardar-atomico` es pública |
| Fotos de después de Ajustes, bienvenida e invitación, y la página | el de este archivo | 16 medidas: nada pisa, nada fuera, sin scroll |

No se monta 3A (la línea de los lunes): espera su maqueta de móvil.

---

Lo que sigue es el plan de la sesión anterior, ya cumplido.

# Montar la auditoría · dónde me quedo (10 nov. 2026, ~22:20, cuenta EcLj6)

Parada por uso: 5 h al 82 % (regla del encargo: parar al 85 %). Rama `claude/montar-auditoria-10nov-3ef28c`,
cortada de `main` 600fc0b5, con push.

## Hecho (un commit por pieza, `verify` en verde en cada una)

| Pieza | Commit | Pruebas |
|---|---|---|
| 1A · fila para comprar en Ajustes | c70dd11d | `tests/ajustes-comprar.spec.js` (9) + ajustes, ajustes-movil: 28 en verde |
| 2A · el cierre dice lo que sigue | 6093709b | `tests/cierre-sigue.spec.js` (6) + cierre-sin-pisar, cierre-italica, eventos-origen, feedback-una-semana, aro-jornada, caza-sesiones, caza-respira, pausa-propone, logros-sesion-entera: 70 en verde |
| 4A · sin «v1» en bienvenida e invitación | 5c340017 | dia-v1-letras, compra-tienda, compra-solo-vida, android-nativo, premium-compra: 65 en verde |

Diferencias con la foto que eligió Ez:
- 1A: en el ordenador, «Tus datos» va abierta desde 860 px de alto; con la fila, se pliega 34 px antes
  (`premiumPlanEnAjustes`, TweaksPanel.jsx), si no el panel pedía scroll de 860 a 893. **Ya pedía hasta 15 px
  de 860 a ~875 sin la fila, y 11 px a 1920×1080 (lienzo de 864): defecto viejo, sin tocar. Seguimiento.**
- 2A: Enter en el cierre sigue volviendo a la home (no arranca el ciclo). Con jornada, si la pausa acaba con
  el cierre delante, vuelve a «Volver al inicio». Con «A tu ritmo» elegido pero sin pausa contando, como antes.
- 4A: inglés «And while it’s in testing…», «When it goes on sale…», «Coming when it goes on sale.».
  /premium (la web) sigue con «Llega con la versión 1»: no era de esta letra.

## Falta

1. **D-5 B** (`app/state-paso-v1.js`). Hoy `pacePasoV1Sesiones` usa `paceEventsAggregates().sessionsByRoutine`,
   que cuenta todo `session.completed`, también `completionReason: 'early'` (terminar antes, ≥ 30 s; por debajo
   de `PACE_MINIMO_CUENTA_S` no hay evento). Plan: contar de `paceEventsSnapshot()` solo los eventos crudos tras
   el `pruneCursor` con `completionReason === 'natural'`, y sumar `baseline.sessionsByRoutine` tal cual (lo podado
   no guarda el motivo: se conserva, nadie que la acabó la pierde; hoy no se ha podado nada, la poda empieza ~120
   días tras la primera sesión). `routineCounts['rutina.<id>']` ya solo cuenta enteras y `routineFeedback` se queda.
   Pruebas: en `tests/paso-v1.spec.js` las líneas 89, 174 y 274 siembran `breathe.rounds.full` como temprana
   (`true`) y esperan que se quede: pasarlas a `false` y añadir una prueba «la empezada y no acabada no se
   queda; la acabada sí». Mutante: volver a `sessionsByRoutine` y ver la prueba nueva en rojo. Fila arriba en
   `DECISIONES_TECNICAS_VIGENTES.md` y actualizar la fila del 28 oct. (línea ~85: «eventos, `routineCounts` y
   «¿Te ayudó?»»).
2. **D-4 C**: grep de dónde viven las llaves y de los fallos de cobro abiertos en `STATE.md` y `docs/` (sin
   `docs/sessions/` ni `docs/archive/`); lo quitado, entero, a un archivo del scratchpad para Ez; decir qué
   queda en commits viejos. No reescribir historia.
3. **Fotos de después** que faltan: `node docs/proposals/montado-auditoria-10nov/guion/fotos.js despues ajustes,bienvenida,invitacion`
   con el servidor en el 8950 (`PORT=8950 node .claude/static-server.js`). Las de antes están todas; las del
   cierre de después, también. Las medidas van en `fotos/<fase>/medidas.json`.
4. **Página para Ez** «Montado: 1A, 2A, 4A, D-5 B y D-4 C» (skill `artifact-design`, fotos como archivos),
   copia y generador aquí.
5. Al acabar: `npm run verify`, `node build-standalone.js`, `git checkout -- PACE_standalone.html`, pruebas de
   las zonas tocadas con `PACE_E2E_PORT` en 8950-8959. Sin bump, sin STATE.md ni CHANGELOG.md.

`node_modules` es una unión a la de la copia principal: antes de quitar el worktree, `rmdir node_modules`.
