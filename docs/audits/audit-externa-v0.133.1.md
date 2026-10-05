# Auditoría de PACE · v0.133.1 (5 de octubre de 2026)

Auditoría de solo lectura sobre `ezradesign/Pace_app`, rama `main`, commit `695e673` (s198). No se ha
cambiado nada en el repositorio. Las auditorías anteriores (s178, s183) miraron sobre todo si los
documentos decían la verdad sobre el código; esta mira **el código desde fuera** y **cómo se está
desarrollando el proyecto**, que es lo que pediste analizar.

---

## 1 · Resumen en cinco líneas

1. **La app está sana**: el `verify` pasa y 322 de 323 tests pasan. La red de seguridad es seria y funciona.
2. **Hay un bug real**: con dos pestañas abiertas se pierden eventos. El test que lo vigila falla 7 de cada 20 veces con la máquina cargada.
3. **El 36 % de `index.html` son comentarios** (730 KB que descarga cada usuario). Se arregla con una línea del build.
4. **El proyecto produce más documentación que código**, y ese peso ya condiciona cada sesión.
5. **v1.0 sigue lejos y lo caro no ha empezado**: seis fases abiertas a la vez, el argumento de compra sin validar, y Android, licencias y cobro sin tocar.

---

## 2 · Línea base, medida hoy

| | |
|---|---|
| Versión | v0.133.1 · 198 sesiones · 291 commits entre el 22 abr y el 5 oct de 2026 |
| `npm run verify` | **PASA**, 0 problemas, 1 aviso, 15,4 s |
| `npm run test:e2e` | **322 / 323** en 8,1 min (falla `eventos-barrera.spec.js:23`, ver T1) |
| Código de la app (`app/`) | 156 archivos JS/JSX/CSS · 34.928 líneas · 1,78 MB |
| Tests | 57 specs · 290 tests declarados · 12.245 líneas |
| Scripts | 23.694 líneas, de ellas **20.192 en 111 scripts de `scripts/audit/`** |
| Markdown | **61.118 líneas · 3,6 MB** |
| Artefactos | `index.html` 2,0 MB · `PACE_standalone.html` 3,3 MB (congelado en v0.71.0) · `backups/` **62 MB** |

---

## 3 · Hallazgos técnicos

### T1 · Se pierden eventos con dos pestañas abiertas — ALTA

- **Qué pasa**: `tests/eventos-barrera.spec.js:23` emite 10 eventos desde cada una de dos pestañas a la vez. Las dos responden «committed» las 10 veces, pero en el almacén quedan menos de 20.
- **Medido**: falló en la pasada completa (19 de 20). Repetido 20 veces con 2 workers: **7 fallos**, con 19, 19, 19, 19, 19, 16 y 14 eventos guardados.
- **Causa probable (inferida, no demostrada)**: el diseño serializa con `navigator.locks` y hace leer-modificar-escribir sobre `localStorage` (`app/events/events-adapter-web.js:213-251`). El lock es correcto, pero Chromium propaga `localStorage` entre pestañas de forma **asíncrona**, así que la segunda pestaña puede releer dentro del lock una copia que aún no tiene lo que la primera acaba de escribir, y lo pisa. Los ids son UUID (`events-model.js:62`), así que no es una colisión.
- **Por qué importa**: los eventos son la base de «A tu ritmo», del origen de cada sesión y de las futuras estadísticas. En la vida real hacen falta dos pestañas emitiendo casi a la vez, así que es raro, pero el propio proyecto tiene la regla de que un test intermitente es un bug, no ruido. En CI pasa porque la máquina va más holgada.
- **Arreglo propuesto**: guardar los eventos en IndexedDB (sus transacciones sí son coherentes entre pestañas) o, más barato, que cada pestaña escriba en su propia clave y la lectura las funda. Encaja con la Fase 9, que ya prevé un adaptador nativo (SQLite) detrás de la misma interfaz.

### T2 · 730 KB de comentarios en el artefacto que se publica — MEDIA, arreglo trivial

- `build-standalone.js:52-66` compila con `comments: true` y `compact: false`. Resultado: de los 1,86 MB de JavaScript de `index.html`, **732 KB son comentarios (39 %)**. Cada usuario los descarga y el navegador los parsea al arrancar, en móvil también.
- **Arreglo**: `comments: false` (o minificar). `retainLines` se puede mantener para que las trazas sigan apuntando a la línea real. El CI de reproducibilidad no se ve afectado.

### T3 · 44 % del código fuente son comentarios, con 1.655 referencias a sesiones — MEDIA

- Medido por bytes en `app/`: **44 %** comentario. Casos extremos: `app/main/_responsive.js` 86 %, `_responsive.atmosfera.js` 79 %, `MoveSessionV1.css.jsx` 77 %, `state-core.jsx` 67 %.
- Hay **1.655** menciones del tipo `s148`, `s178` dentro de `app/`. Muchos comentarios cuentan la historia de cómo se llegó al código («ESTE COMENTARIO AFIRMABA ALGO FALSO…»), que es justo lo que el propio `CLAUDE.md` dice que va en los diarios.
- **Efecto colateral**: la regla de 500 líneas cuenta líneas de comentario. El archivo más grande, `_responsive.atmosfera.js`, está en 500 justas con un 79 % de comentario. Parte de los troceos de archivos los provoca la prosa, no el código.

### T4 · Toda la lógica se prueba a través del navegador — MEDIA

- Los 57 specs son de Playwright. La lógica pura (fechas y rachas, el saneador `state-core.sanea.js`, la regla de propuestas de `BreakMenu.support.jsx`, el plegado de eventos) no tiene tests unitarios en Node. Con eso, la suite tarda 6–8 minutos y cada error de cálculo se depura montando la app entera.
- Unos cuantos tests unitarios de esas funciones correrían en segundos y podrían ir dentro del `verify`.

### T5 · Peso muerto versionado en git — BAJA, arreglo fácil

- `backups/` guarda **20 copias de 3 MB del standalone** (62 MB, de v0.51 a v0.57) y ha tenido 160 cambios en la historia. `PACE_standalone.html` sigue en la raíz congelado en v0.71.0, 62 versiones atrás. `docs/proposals/` pesa 23 MB.
- Recomendación: sacar los backups a Releases de GitHub y dejar de versionar el standalone mientras sea «export bajo demanda».

### T6 · Lo ya conocido, que sigue en pie

- **Arquitectura de globales en `window`** sin módulos. El build y el `verify` hacen un trabajo notable para compensarlo (el análisis de ámbito existe por el crash de s144), pero el propio `verify` declara que **el orden de carga no se comprueba**. Es aceptable para v1; pasarlo a ESM o Vite está fuera de v1 por decisión vuestra, y conviene revisar esa decisión antes de Capacitor.
- **Timer de Mueve por ticks** (`MoveSessionV1.jsx:147,160,201`, `setInterval` restando 1 por segundo): se retrasa con la pestaña en segundo plano. Ya está en la Fase 8.5.
- **El premium es un booleano en `localStorage`** (`state-entitlement.jsx:46`), con el código fuente público bajo Elastic License 2.0. Una licencia firmada offline no cambia eso: cualquiera con conocimientos puede desbloquearlo. Es un modelo de confianza razonable para 19,99 €, pero conviene que sea una decisión consciente y no una sorpresa.

---

## 4 · Análisis del desarrollo

### D1 · El ritmo es altísimo

198 sesiones en cinco meses y medio, entre 30 y 40 commits de versión al mes en julio y agosto. En ese tiempo se han construido Pomodoro, tres bibliotecas, Caminos, 96 logros, eventos locales, «A tu ritmo», voz y música en Respira, i18n ES/EN, PWA y una red de calidad con CI. Es mucho producto.

### D2 · La documentación ya pesa más que el código

- **3,6 MB de Markdown frente a 1,8 MB de código**, y ese código es casi la mitad comentario.
- En toda la historia del repo, los cambios en `.md` suman **133.360 líneas**; los de `app/`, **72.137**.
- **El arranque obligatorio** (`CLAUDE.md` + `STATE.md` + `DESIGN_SYSTEM.md`) son **225 KB, unos 55.000–60.000 tokens** antes de tocar nada en cada sesión.
- **El cierre obligatorio tiene 11 pasos**: diario, CHANGELOG, reescribir STATE, decisiones, roadmap, mensaje de commit… En s198 una sola sesión dejó dos diarios, un handoff y cuatro versiones documentadas.
- Las reglas de tamaño no se cumplen: `STATE.md` dice «este archivo no debe crecer» y tiene **138 KB y 706 líneas**. `CLAUDE.md` dice que `CHANGELOG.md` lleva «tabla + 2 últimas» y pesa **177 KB**. Además hay 21 `HANDOFF_*` y 3 `PROMPT_*` sueltos en `docs/` (174 KB).

### D3 · La documentación miente una y otra vez, y la respuesta ha sido escribir más

Las auditorías de s148, s162, s178 y s183 encontraron, cada una, documentos que decían algo falso del código: la tabla de deuda «mentía en 10 de 14 filas», `CLAUDE.md` tenía cuatro datos falsos y el párrafo de Mueve y Estira «ya ha mentido tres veces». Cada vez la corrección ha añadido texto (la historia del error) o un checker nuevo. El único remedio que funcionó fue el de s178: **quitar el número del documento y dejar que lo mida el `verify`**. Ese es el patrón que habría que generalizar: menos texto que mantener a mano, no más.

### D4 · Seis fases abiertas a la vez, con la regla de «un solo frente»

Estado de «Camino a v1.0» (`ROADMAP.md:113-574`):

| Estado | Fases |
|---|---|
| Hechas | 1, 1.5, 1.6, 3 |
| En curso | **2** (pendiente de 3 dibujos), **2.5** (pendiente de 19 dibujos de logros), **3.5**, **3.6**, **5**, **8.5** (a medias) |
| Aparcada | 4 (Stats) |
| Sin empezar | **6** Caminos, **7** Travesías, **8** Descubrimiento, **9** Android, **10** Venta |

Desde que se escribió el plan (s132, 30 de julio) han pasado 66 sesiones. En ese tiempo se insertaron dos fases nuevas (3.5 y 3.6) y ninguna de las cinco del final ha empezado. Las reglas del plan dicen «un solo frente por sesión»; en la práctica hay seis frentes vivos y el siguiente paso se elige con una página de opciones al final de cada sesión (`por-donde-seguir-s194`, `s195`, `s196`, `s198`).

### D5 · El riesgo grande es de producto, no de código

- **v1.0 se definió como «la primera versión pagada»**, y su argumento de compra son las Travesías (Fase 7). El propio roadmap anota en s192 que **nadie ha comprobado todavía que alguien pagaría por ellas**.
- **Lo más caro y con más dependencias externas no ha empezado**: Play Billing (que obliga a un segundo camino de licencias), un proveedor de pago para la web, revisión legal de términos y privacidad, revisión profesional del contenido corporal y la ficha de Play. El propio roadmap estima solo Android en 4–6 sesiones más los ciclos de revisión de Google.
- **No hay datos de uso real.** La única evidencia de usuarios son los beta testers de s128 (finales de julio) y las entrevistas de s192. El siguiente paso que marca `STATE.md` es «que el usuario use la app una semana», y la semana de v0.128.0 todavía no tiene veredicto.
- Mientras tanto, las últimas 20 sesiones se han ido sobre todo a afinar «A tu ritmo», la semana, la barra lateral y la pausa: es pulido de la experiencia diaria, valioso pero sin validar con nadie de fuera.

### D6 · Lo que está bien y conviene no perder

- **La disciplina de medir antes de afirmar** («medido, no citado») es lo mejor del proyecto y se nota en la calidad.
- `verify` + CI con dos jobs + 323 tests de comportamiento es una red que muchos productos de pago no tienen.
- Local-first de verdad: el `verify` prohíbe canales de red en `app/events/`, y `privacy.html` es coherente con el código.
- La Fase 8.5 de s198 (focus trap, saneador del estado, red de error por superficie) cierra riesgos reales antes de vender.

---

## 5 · Qué propongo, en orden

1. **Una sesión de arreglos baratos y seguros**: T1 (eventos en dos pestañas), T2 (`comments: false`), T5 (sacar backups y standalone del repo). Riesgo bajo, todo con tests que ya existen.
2. **Adelgazar el método**, que es lo que más velocidad devuelve:
   - `CLAUDE.md` en una pantalla, sin historia; `STATE.md` en una pantalla (versión, qué sigue, bloqueos).
   - El detalle del `CHANGELOG` y los handoffs, al archivo.
   - Diario de sesión solo cuando haya una decisión que contar.
   - Comentarios en el código que expliquen el *porqué* actual, sin numeración de sesiones.
3. **Recortar v1.0 y validar antes de construir lo caro**:
   - Cerrar o congelar explícitamente las fases abiertas (2, 2.5, 3.5, 3.6, 5) con lo que tienen hoy.
   - Validar el pago antes de las Travesías: una landing con preventa o lista de espera a 19,99 € dice más que diez sesiones de pulido.
   - Decidir si v1 puede salir **solo en web** con la licencia offline y dejar Android con Play Billing para v1.1. Eso quitaría la parte más cara y lenta del camino.

Lo que no he podido comprobar: el estado del CI en GitHub (la API no está accesible desde esta sesión; en local reproduce lo mismo que el CI), cualquier cosa visual o de móvil, y si la causa de T1 es exactamente la propagación de `localStorage` (está inferida; el fallo sí está medido).
