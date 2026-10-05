# s198 · HANDOFF · lo hecho, lo decidido y por dónde seguir

**Fecha:** 2026-10-04 · **Versión publicada:** v0.133.0 (`43ef95b`) + v0.133.1 (ver §1) · **Suite:** 323 · **Árbol:** limpio tras el push

> Documento de arranque para la sesión siguiente. **Léelo entero antes de tocar nada**; el arranque de
> `CLAUDE.md` sigue valiendo (STATE → DESIGN_SYSTEM → `app/` → artefactos → confirmar estado). Aquí está lo que
> no se deduce del código: cómo se decidió cada cosa, qué quedó aparcado a propósito y qué trampas costaron
> tiempo.

---

## 0 · Dónde está el repo

- `main` = `origin/main` en `43ef95b` **feat(ritmo): la pausa te llama por su nombre (v0.133.0)**, tras
  `d5d9d55` (v0.132.0) y `53277a3` (v0.131.0). Los tres sin coautoría (preferencia del usuario).
- **CI**: `d5d9d55` en verde en GitHub (8 min 48 s). `43ef95b` estaba en cola al cerrar: **comprobarlo al
  arrancar** (`gh run list --limit 3`).
- Medido al cerrar: `npm run verify` 0 problemas · E2E **320/320 en 5,3 min** · versión v0.133.0 coherente en los
  7 sitios · i18n 691 claves por idioma.

## 1 · Lo que hizo s198 (tres versiones)

| Versión | Qué | Diario |
|---|---|---|
| **v0.131.0** | Auditoría con una sonda sobre el artefacto publicado y **siete defectos** arreglados sin cambiar un píxel: un dato guardado roto borraba la historia (ahora `state-core.sanea.js` + rescate) · el import sin sanear (A-7) · «Borrar todo» no borraba todo · Espacio no pausaba tras «Continúa» · Escape cerraba el diálogo de abajo · los diálogos sin foco (`ui/Dialogo.jsx`, también onboarding y sesiones) · atajos con Ctrl y en sesión · la pantalla se apagaba en una sesión guiada (`ui/pantalla.js`) | [session-198](./session-198-saneamiento.md) |
| **v0.132.0** | **Si una parte falla, se cierra solo esa parte** (`ui/RedDeError.jsx`: red por diálogo y por sesión + la global «Algo se ha torcido») · la fila de la copia de rescate en «Tus datos» | [session-198](./session-198-saneamiento.md) §6 |
| **v0.133.1** | **El cambio de hora no se comía un día** (la racha y las etiquetas de mes de los mapas anuales restaban 24 h) · **`npm run bump -- X.Y.Z`** para la versión | [session-198b](./session-198b-la-pausa-con-su-nombre.md) §6-7 |
| **v0.133.0** | **La pausa te llama por su nombre**: con «A tu ritmo», el aviso del sistema al acabar un bloque dice qué pausa toca y cuándo vuelves (`ritmo/ritmo.aviso.js`); el aviso pasa a calcularse DESPUÉS de cerrar el bloque | [session-198b](./session-198b-la-pausa-con-su-nombre.md) |

## 2 · Lo decidido por el usuario, y cómo

| Decisión | Cómo se tomó |
|---|---|
| **A2** · si una parte falla, se cierra solo esa parte (con la global de último recurso) | Página `saneamiento-s198.html` + «hazme preguntas» → AskUserQuestion con las opciones de la página y una vista previa de cada forma: contestó las cuatro de golpe |
| **B2** · la copia de rescate, en una fila de «Tus datos» solo si existe | Ídem |
| **C1** · la pantalla encendida en las sesiones, **sin interruptor** | Ídem |
| **D1** → implementar A y B en la misma sesión | Ídem |
| **D2** · la pausa con su nombre, **texto V1, sin `.ics`** | Página `por-donde-seguir-s198.html` → «no sé por dónde seguir» → se le recomendó D2 con tres razones y una tabla «si lo que quieres es… → entonces» → «vale, empieza con D2» |

**El `.ics` (D2b) está APARCADO A PROPÓSITO**: se decide después de usar el aviso unos días. No implementarlo sin
preguntar.

## 3 · Las páginas de esta sesión (en `docs/proposals/`, generadas por `scripts/audit/`)

| Página | Generador | Qué enseña | Estado |
|---|---|---|---|
| `saneamiento-s198.html` | `saneamiento-s198.js` | Los siete arreglos medidos · A (pantalla de error, con «hoy» = un fallo de render provocado de verdad) · B · C · D | **Decidida** (A2 B2 C1 D1) |
| `stats-hoy-s198.html` | `stats-hoy-s198.js` | **D3, ronda 1**: dónde vive hoy cada cosa (la línea de la home, Estadísticas, la hoja del móvil) y tres respuestas con lo que aporta y lo que repite cada una: **H1** la hoja en Estadísticas · **H2** el día a escala con «lo más largo sin levantarte» (recomendada) · **H3** sin pestaña. Respeta los 820 px de cada vista (regla de s177) | **ENVIADA, SIN DECIDIR** |
| `por-donde-seguir-s198.html` | `por-donde-seguir-s198.js` | D2 (la pausa que salta al acabar un bloque real + el aviso dibujado con el texto que da el motor) · D3 (Estadísticas junto a la hoja del día) · D4 (la piel de móvil en un teléfono) · D5 (pulido medido: 72 px a 375×667, el panel en oscuro) | **D2 hecho**; D3, D4, D5 y D2b siguen abiertos |

## 4 · Lo que queda, en el orden que recomiendo

1. **Que el usuario use la app una semana** con el aviso nuevo (y la semana de v0.128.0, que sigue sin juicio de uso
   real). Es lo único que solo puede hacer él. Para ver el aviso: bloque corriendo, otra ventana delante,
   «Aviso al terminar» activado en Ajustes y permiso del navegador.
2. **D3 · Estadísticas «Hoy»** — la siguiente fase del plan (Fase 4, aparcada en s192 porque «Hoy» tenía que
   enseñar el menú; el menú ya existe). Empieza por PÁGINA: rondas de maqueta calcadas de la app real. Punto de
   partida: `docs/proposals/stats-hoy-r1.html` (s191) y `docs/product/STATS_DESTINO_PROPUESTA.md`. «Hoy» juntaría lo
   que hoy cuenta Estadísticas (minutos) con lo que hoy solo cuenta la hoja del día en el móvil (hecha / saltada).
3. **D2b · el `.ics`** — cuando el usuario haya usado el aviso.
4. **D5 · pulido** — la tarjeta por libre sobra 72 px a 375×667 (anterior a v0.130.0) · el panel de «A tu ritmo» en
   oscuro (fotografiado, nunca revisado a propósito) · el temporizador de Mueve/Estira cuenta ticks (con la pestaña
   oculta se retrasa; ¿debe seguir contando o pausarse? es una decisión de producto, no solo técnica).
5. **D4 · Android** — Fase 9; lo caro es la facturación de Play.
6. **Fase 8.5, lo que queda**: A-6 en sentido amplio · i18n I18N-2 y deudas D-1/D-2/D-3. (El bump de versión ya
   está: **`npm run bump -- X.Y.Z`**, hecho al final de s198.)

Declarado y sin fecha (viene de antes): el miércoles con tres largas · el cierre que nunca es «Ahora» · la lectura
C del norte (cuando `origin` tenga semanas de datos).

## 5 · Cómo trabaja el usuario (lo que funcionó en s198)

- **Decide con una página**, fotos de la app real con el DOM retocado; nada dibujado a mano salvo lo que no es de la
  app (el aviso del sistema). Se le ENVÍA con SendUserFile. A preguntas sueltas contesta «dame un html».
- **«Hazme preguntas»** = AskUserQuestion con las opciones de la página, la recomendada primero y una vista previa
  en texto de cada una.
- **«No sé por dónde seguir»** = no más opciones: decidir yo, con razones cortas y una tabla de casos, y pedir un «vale».
- **Commits sin coautoría**; push a `main` cuando lo pide. Si dos versiones comparten archivos y pide dos commits,
  reconstruir el árbol intermedio y **probar que es exacto** comparando el artefacto con el guardado de esa versión.
- Calibrar cada test nuevo **en rojo contra el artefacto anterior** (`git show HEAD:index.html > index.html`, correr,
  restaurar) y leer POR QUÉ cae; un banco de mutantes por pieza (`PACE_BANCO_SOLO=<regex>` para repetir uno).

## 6 · Trampas que costaron tiempo en s198

- **Los documentos están en CRLF en la copia de trabajo** (`core.autocrlf=true`): un reemplazo con `\n` no casa.
  Normalizar a LF, reemplazar y volver a CRLF.
- **Comillas invertidas dentro de `node -e "..."` las ejecuta bash.** Los scripts, a un archivo del scratchpad.
- **No hay Python** en la máquina: los recortes y reemplazos, con Node.
- **El banco recompila `app/` con cada mutante**: no tocar `app/` ni `PACE.html` mientras corre (su restauración
  pisaría tus cambios). Y si un mutante dice «NO APLICA», una refactorización cambió su línea: corregirlo, no ignorarlo.
- **Una sonda propia va en otro puerto** (8791+) para no pisar el servidor de la suite (8765).
- **Un fallo provocado para una foto hay que medirlo**: `achievements: null` no rompe nada; `weeklyStats: null` +
  abrir Estadísticas sí desmonta la app (antes de v0.132.0). `water: null` rompe `HydrateTracker` aunque esté cerrado.
- **Un componente que lee estado antes de mirar si está abierto falla aunque no se vea**: por eso la red de error
  calla con la superficie cerrada.
- **El trinquete de §1** paró `state-core.jsx` en 508: se trocea por un punto (toasts a `state-core.toast.jsx`), no se
  recortan comentarios.
- **El censo de i18n del `verify`** es un número a mano (`scripts/verify.integridad.js`): al añadir claves, subirlo
  con su porqué.

## 7 · Primer paso de la sesión siguiente

1. Arranque de `CLAUDE.md` + este documento. Comprobar el CI de `43ef95b`.
2. Preguntar al usuario si ha usado la app y qué ha chirriado (con capturas si las tiene). Si sí, eso va primero.
3. Si no hay novedades de uso: **la letra del usuario a `stats-hoy-s198.html`** (H1 · H2 · H3, y si Estadísticas abre en
   «Hoy»). La ronda 1 ya está hecha y enviada: no rehacerla, seguir desde su respuesta. Con H2, la ronda 2 decide la
   forma final del día a escala (y cómo se calcula «lo más largo sin levantarte» por libre, desde los eventos).
