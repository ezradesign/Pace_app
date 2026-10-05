# HANDOFF s192 → s193 · «A tu ritmo» está dentro; ahora toca ajustarlo con uso real

> **v0.122.0 está PUBLICADA y el árbol queda LIMPIO.** `npm run verify` sin problemas,
> **250/250** en local y **el CI en verde** — pero no a la primera: el de `c016e66` salió ROJO con
> la suite local entera verde, por el huso del reloj (§4). El usuario lo dijo así: «implementemos
> esto primero y luego vamos ajustando». Esto es la cola de ajustes.

---

## 0 · Estado exacto

| | |
|---|---|
| Última versión | **v0.122.0** (commit `c016e66`) |
| Commit previo | `2cc47f0` — las maquetas de Stats de s191, **aparcadas** |
| Después | `30863b6` — el reloj de las pruebas con offset (solo `tests/`, el artefacto no cambia) |
| Suite | **250/250** (eran 236) en 5,9 min · `npm run verify` verde |
| CI | **verde** en `30863b6` (`verify` + `e2e`). El de `c016e66` fue rojo: 3 de `ritmo.spec.js` |
| `index.html` | al día con las fuentes |
| `PACE_standalone.html` | intacto (congelado desde s134; el build lo reescribe y se restaura) |
| Mutantes | `scripts/audit/banco-ritmo-s192.js`: **11 de 11 muerden**, con pasada de control |
| Límite §1 | **`app/main.jsx` y `app/focus/FocusTimer.jsx` están en 500 líneas** |

Diario: [session-192](./sessions/session-192-a-tu-ritmo.md) · Decisiones: las cuatro filas
s192 de [`DECISIONES_TECNICAS_VIGENTES.md`](./product/DECISIONES_TECNICAS_VIGENTES.md) ·
Plan: **FASE 3.6** del [`ROADMAP`](../ROADMAP.md).

---

## 1 · Lo que s192 deja DECIDIDO (no reabrir sin el usuario)

- **Variante A, «el menú manda»**: el panel ocupa el sitio de Actividades y del Camino
  sugerido. «Hoy voy por libre» es la única salida (era lo mismo que «Ver la carta»).
- **Nombre «A tu ritmo»**; bajo el aro, el nombre y **debajo** «Hasta las 17:00».
- **Glifos de Actividades solo en las paradas**, sustituyendo al punto, **y la etiqueta sigue
  diciendo el módulo** («3 MIN · ESTIRA»): el usuario lo pidió de vuelta cuando se quitó.
- **Tenedor y cuchillo** (`ABMeal`) para la comida, en tinta.
- **Horario editable dentro de la frase**: inicio, comida, cuánto dura y salida.
- **Llegar tarde = salgo a mi hora** (la recomendada; las otras dos quedaron pintadas).
- **La barra lateral dice «Siguiente pausa»**, no el nombre: «Ritmo» ya titula Stats.
- **Datos anónimos CON PERMISO** (apagados por defecto, totales semanales, con el servidor de
  licencias) y **Stats aparcado** hasta que «Hoy» pueda enseñar el menú.

---

## 2 · Por dónde seguir, en orden

1. **Que el usuario lo use un día entero y cuente qué chirría.** Es el «luego vamos
   ajustando». Nadie lo ha usado todavía en una jornada real ni en un móvil de verdad: las
   fotos son de Playwright con el reloj fijado. Preguntarle también **los detalles de las
   entrevistas** (cuántas personas, perfil, frases literales) para dejarlas como evidencia.
2. **Recolocar a mitad de día.** Es el hueco que más se va a notar: si arrancas el bloque 2
   veinte minutos tarde, la línea sigue enseñando las horas del plan. Propuesta: al terminar
   cada bloque, si vas por detrás, recomponer desde ahora (misma política «salgo a mi hora»),
   sin repetir lo ya hecho y conservando el contador de pausas. **Pintarlo antes** (regla de
   s173/s174): la línea antes y después de un retraso.
3. **El origen de cada sesión en `pace.events.v1`** (menú · propuesta · biblioteca · Camino).
   Sin eso no se puede medir si el menú funciona, que era la primera idea del experto. Toca el
   esquema (`EVENTOS_SCHEMA.md`) y la lista permitida de `events-payloads.js`: leer su fila de
   decisiones antes, y ojo a `module: 'extra'`, que no valida (s190).
4. **Trocear `main.jsx` y `FocusTimer.jsx`** antes de cualquier otro cambio en ellos: están en
   500 y el trinquete de §1 no deja pasar ni una línea.
5. **Llegar antes de tu hora** (hoy el plan espera a tu inicio aunque ya estés).
6. **Stats «Hoy» con el menú del día** → retomar la Fase 4 desde las maquetas de s191
   (`docs/proposals/stats-*`).
7. **El contexto real** («Junto a la mesa · Sin material» es fijo) → onboarding contextual,
   Fase 8.
8. **Calendario**, de barato a caro: exportar `.ics` · Android leyendo el del teléfono (Fase 9)
   · Google con el permiso de solo libre/ocupado.
9. **Datos anónimos con permiso**: junto al servidor de licencias (Fase 10); exige tocar
   `privacy.html` y el gate del `verify` que prohíbe canales de salida en `app/events/`.
10. ~~Preguntar por la deuda documental del `CHANGELOG`~~ — **hecho**: el usuario mandó podar y
    se podó a las dos últimas (24 secciones → 2, 2084 → 507 líneas). Cada versión conserva su
    fila con su titular y el enlace a su diario; el texto vive en `git log -p CHANGELOG.md`.

---

## 3 · Lo que s192 declara SIN cubrir

- **Ni un píxel comparado**: la revisión visual se hizo mirando capturas a tamaño real
  (1280x879, 1536x714, 412x844, 360x730), no con asertos.
- **Las horas no se recolocan** (punto 2) y **llegar antes** no existe (punto 5).
- **El contexto es fijo** y los pozos son los gratuitos: 6 de Estira, 4 de Mueve, 5 de
  Respira para la pausa larga y 1 para el cierre. Con premium crecen.
- **La propuesta de la comida** abre Hidrátate (un vaso); no hay pantalla propia de comida.
- **El modo oscuro** del panel no se ha mirado: usa tokens, pero nadie lo ha comprobado.
- **Las rondas 1 a 3 de la maqueta no se regeneran**: el componente evolucionó. Solo la 4:
  `node scripts/audit/menu-s192.js --r4` (con el servidor en 8765).

---

## 4 · Trampas de esta sesión

- **Una hora de pared sembrada desde Node NO es la misma hora en las dos máquinas**: el valor
  de `clock.install` lo calcula el runner (Madrid aquí, UTC en GitHub) y lo lee un navegador
  fijado a `Europe/Madrid`. Así salieron rojas en el CI tres pruebas verdes en local. Se siembra
  con offset explícito, y el CI se reproduce con `TZ=UTC npx playwright test`.
- **El trinquete de §1 cuenta `split('\n')`**: un archivo sin salto final da una línea más que
  `wc -l`. `FocusTimer.jsx` parecía tener 500 y tenía 501.
- **Heredocs largos en Git Bash con comillas invertidas dentro de un template de Node** pueden
  no llegar a ejecutarse: escribir el script a un archivo y lanzarlo con `node`.
- **La semilla de la suite trae `ritmo.libre: true`** (la carta siempre, sin fecha): varias
  pruebas falsean el reloj y un «hoy» sembrado no casaría. Una prueba de A tu ritmo siembra
  su propio `ritmo`.
- **Cada pieza del panel existe dos veces en el DOM** (escritorio y móvil): tomar la visible.
- **Un mutante verde puede tener razón**: el del enlace de vuelta demostró que el comentario
  atribuía el arreglo al estilo del botón cuando lo que alinea es el `inline-flex`.
- **El panel del navegador a veces no dibuja capturas**: fotos con Playwright y reloj fijado.
- **`build-standalone.js` reescribe `PACE_standalone.html`**: `git checkout --` de ESE archivo
  (está commiteado y congelado); los archivos nuevos se restauran con copia, nunca con checkout.

---

## 5 · Para arrancar

```
node .claude/static-server.js            # o el preview «pace-preview»
npm run verify
npx playwright test tests/ritmo.spec.js
TZ=UTC npx playwright test tests/ritmo.spec.js   # lo que ve el CI (Node honra TZ aqui)
node scripts/audit/banco-ritmo-s192.js    # recompila, muta, restaura por bytes
node scripts/audit/menu-s192.js --r4      # la maqueta vigente, si hay que pintar algo
```
