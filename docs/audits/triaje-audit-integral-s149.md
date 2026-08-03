# Triaje de la auditoría integral — s149

> **Qué es esto.** El triaje punto por punto de
> [`audit-integral-v0.80.0.md`](./audit-integral-v0.80.0.md), contrastado contra el **código
> real** (no contra la documentación), con evidencia `file:line` en todo lo que se clasifica
> como HECHO. Cumple su propia instrucción nº 10: **no se ha tocado ningún documento canónico**
> — ni `ROADMAP.md`, ni `MONETIZATION.md`, ni `DECISIONES_PRODUCTO.md`, ni
> `DECISIONES_TECNICAS_VIGENTES.md`.
>
> **Lo ejecutado en s149**, todo con autorización expresa: su **§4.7** (el precache del service
> worker, ya verificado en s148) y, tras presentar este documento, **D8** (el guard de entitlement)
> y **D9** (marcar como histórico el modelo de cuatro vías). Nada más.
>
> **Orden.** Este documento NO sigue el orden del original. Empieza por lo que desbloquea
> decisiones y termina por lo que solo describe.

---

## 0. Veredicto en cinco líneas

La auditoría **acierta en casi todo lo comprobable**. De las afirmaciones verificables contra
código, **cero son falsas**; una (§7.2) simplemente **no aplica** al copy de la app. Lo que
propone, en cambio, es en su mayoría **producto nuevo** (Travesías con mapa, Atlas,
ContinuityCard, amanecer) que **no está decidido** y que **reordena el plan vigente**.

Su aportación más valiosa no son las propuestas: son **cuatro contradicciones que el repo tenía
en silencio** (§7.1, §8.1, §10.2, §11.1) y que nadie había cruzado. Tres de ellas son
contradicciones **entre documentos propios del repo**, no entre la auditoría y el repo.

---

## 1. LO QUE TE DESBLOQUEA — nueve decisiones que te pido

Ordenadas por cuánto bloquean al resto. **Ninguna se puede resolver sin ti.**

> ### ESTADO AL CERRAR s149 — CINCO resueltas, CUATRO abiertas
>
> | | Decisión | Estado |
> |---|---|---|
> | **D1** | Orden A–K | ✅ **FUSIONAR, no sustituir.** Se adoptan su **A** (red de seguridad) como frente inmediato y su **B** (copy) detrás. **C** e **I** condicionadas a D7 y D6 |
> | **D2** | Copy del onboarding | ⬜ abierta — **va en el frente B** |
> | **D3** | Sidebar vs §37-bis | ⬜ abierta |
> | **D4** | Letra de s123 | ✅ **ACOTADA a ≤768px** en `DESIGN_SYSTEM.md`; el código no se toca. Y corregida la cabecera de `home-geometry.js` |
> | **D5** | Alcance del `verify` | ✅ **build + artefacto + `node --check`.** Integridad de catálogos en 2.ª tanda |
> | **D6** | Travesías con mapa | ⬜ abierta |
> | **D7** | Spike de Capacitor | ⬜ abierta |
> | **D8** | Entitlement | ✅ **HECHO en s149** — `hasPremiumEntitlement()` |
> | **D9** | Histórico comercial | ✅ **HECHO en s149** — marcado, no borrado |
>
> **Frente s150 acordado: la red de seguridad, `npm run verify` LOCAL.**

### D1 · ¿El orden A–K sustituye, se fusiona o se descarta? (BLOQUEA TODO LO DEMÁS)

Su §21 propone **once fases A–K**. Tu plan vigente son **15 fases** (`ROADMAP.md`, «Camino a
v1.0», cerrado en s137 tras cruzar los 10 bloques del audit anterior). **No son compatibles
tal cual**: A–K adelanta Capacitor a la fase C (hoy es la 9/10) y mete Travesías completas
antes de Premium real.

Coinciden más de lo que parece: su A ≈ tu 8.5 + red nueva · su D ≈ tu Fase 2 · su F ≈ tu 3.5 ·
su J ≈ tu Premium. Difieren en **B (copy), C (Capacitor temprano) e I (Travesías con mapa)**.

Mi recomendación: **fusionar, no sustituir**. Conservar la numeración de las 15 fases y meter
A como frente inmediato, B como frente corto justo después, y dejar C/I para decisión aparte.

### D2 · El onboarding promete «Siempre gratis / sin paywall» y vas a cobrar

Es la contradicción **más cara** de la lista, porque es una promesa hecha al usuario dentro de
la app, en los dos idiomas:

- `app/i18n/strings/ui.js:27` → `'welcome.value.free.label': 'Siempre gratis'`
- `app/i18n/strings/ui.js:28` → `'welcome.value.free.sub': 'sin paywall'`
- `app/i18n/strings/ui.js:219-220` → `'Always free'` / `'no paywall'`

Y en la superficie de apoyo, dos claims que dejan de ser ciertos en cuanto exista el Worker de
licencia de su §5:

- `app/i18n/strings/ui.js:38` → «No hay cuentas. **No hay servidor**. No te sigue nadie.»
- `app/i18n/strings/ui.js:40` → «**localStorage únicamente**»

**Decisión que te pido:** ¿lo corrijo ya (es un cambio de copy pequeño y acotado) o entra en el
frente de coherencia documental? Su propuesta de sustitución (§7.1) me parece buena y encaja
con el tono, salvo que la escribiría yo con tu referencia de tono delante.

### D3 · La sidebar sigue siendo un panel de rachas, y tú decidiste lo contrario en s133

§37-bis (s133) sustituyó racha por **ritmo semanal**. El código no se enteró:

- `app/shell/Sidebar.jsx:100` → pinta `state.streak.current` a 44 px, protagonista
- `app/shell/Sidebar.jsx:97` → pinta `state.streak.longest` como aside de sección
- `app/shell/Sidebar.jsx:103` → `'sidebar.streak.best'` = **«Mejor: {n} días»** (récord)

Y choca además con el principio «sin rachas culpabilizadoras» que la propia auditoría lista en
§3 y que ya es doctrina tuya.

**Decisión:** ¿§37-bis sigue viva? Si sí, esto es deuda de implementación, no una propuesta
nueva de la auditoría — y debería anotarse como tal en `STATE.md`.

### D4 · Tu decisión s123 dice «prohibido `order` en TODO viewport». Desktop usa `order`

La auditoría (§8.1) observa que «el DOM y el orden visual no coinciden porque el CSS reordena
elementos en escritorio». **Es cierto**:

- `app/main/_responsive.js:254-263`, dentro de `@media (min-width: 769px)` (línea 199):
  `[data-pace-activitybar] { order: 1 }` · `[data-pace-spc] { order: 2 }`

Y `DESIGN_SYSTEM.md:361-362` (decisión s123) dice literalmente: «Jerarquía invariante: Timer →
Camino → Actividades = orden del DOM en TODO viewport. **Prohibido `order`** para intercambiar
secciones bajo ningún breakpoint.»

s126 lo hizo a propósito y el resultado te gustó; el problema es que **la decisión escrita no se
enmendó**. Es exactamente la clase de trampa que ya te mordió con la tabla de deuda en s148: un
documento que dice una cosa y un código que hace otra.

**Decisión:** ¿acoto la letra de s123 a ≤768px (que es donde de verdad rige, como ya dice su
propia cabecera de ámbito) o considero el Desktop una violación a revertir? **Recomiendo
acotar**: el código es el que validaste mirando.

### D5 · Red de seguridad: confirmas alcance de `npm run verify`

Ya me dijiste que empiece por un `verify` **local**, no por el YAML. Estoy de acuerdo y la
sesión s148 lo respalda: lo que cazó bugs fueron scripts locales.

Hay **media docena de piezas ya escritas** en `scripts/audit/` (`inventario.js`, `logros.js`,
`matriz.js`, `glifos*.js`) pero **ninguna es un checker en serie con código de salida**: son
bancos de medición que imprimen. **Decisión:** ¿el `verify` v1 cubre solo (a) build + artefacto
+ `node --check`, o también (b) integridad de catálogos/i18n/precache/glifos?

### D6 · Travesías: ¿el mapa grande y el Atlas entran en v1?

s132 decidió «**Travesías sí, Viajes no**». Lo que la auditoría añade en §15 es mucho más que
eso: **mapa ilustrado propio, paisaje que se transforma al completar capítulos, y un «Atlas» de
mapas completados**. Eso es **arte nuevo, motor nuevo y contrato de datos nuevo** — y arte tuyo,
con la regla D-4.

**Decisión:** ¿v1 lleva Travesías **con mapa**, o v1 lleva Travesías en formato lista/sendero
(reutilizando el lenguaje de Caminos) y el mapa llega después? Esto cambia el tamaño de v1 en
varias sesiones.

### D7 · ¿Se adelanta el spike de Capacitor?

Su §18.1 pide abrir Android **pronto**, no al final. Su argumento técnico es sólido y verificado:
`webDir: "."` empaquetaría el repo entero, y **no existe `dist/`** — hoy `build-standalone.js`
escribe `index.html` en la raíz. Adelantarlo **cambia el orden del roadmap** (hoy Android va en
las fases finales, decisión s137).

### D8 · El entitlement sigue siendo un booleano, y hay una fuga real

Su §6.4 acusa: «auditar excepciones actuales, por ejemplo superficies del constructor que leen
el booleano directamente». **Confirmado, y es exactamente el constructor**:

- `app/custom/CustomRoutines.jsx:28` → `const unlocked = !!pace.premiumUnlocked;` — sin pasar
  por el guard, sin fallback.

El guard central existe y funciona (`app/state-entitlement.jsx:46,59`, decisión s95). La otra
lectura directa, `app/breathe/BreatheLibrary.jsx:118`, **no es una excepción**: es el fallback
defensivo de un ternario que consulta `window.canAccessRoutine` primero (línea 116).

**Decisión:** ¿el `PurchaseAdapter`/`LicenseStore`/`EntitlementResolver` de su §6.4 es v1 o
post-v1? Lo mínimo antes de cobrar es que `CustomRoutines` pase por el guard.

### D9 · Historia comercial: ¿marcar o dejar?

`MONETIZATION.md` abre bien (`:14` «Mensual DESCARTADO») pero **conserva el modelo de cuatro vías
como si estuviera vigente**, con tabla de acceso incluida (`:84` Pase mensual · `:106`
Temporadas · `:130-140` la tabla). `ROADMAP.md` igual: `:73` y `:114` dicen lo correcto, pero
`:450-451` sigue prometiendo «Lifetime ~20 € + Pase mensual 3,99 € + Temporadas ~5 €» y `:456`
titula «**App Android (v2.0)**» cuando s137 metió Android **dentro de v1**.

Su propuesta —marcar como histórico, no borrar— coincide con lo que ya hace
`docs/product/AUDITORIA_DOCUMENTAL.md`. **Decisión:** ¿lo aplico en el frente de copy?

---

## 2. Contradicciones — las cuatro que importan

| # | Qué contradice | Evidencia | Contra qué |
|---|---|---|---|
| C1 | El onboarding promete «Siempre gratis / sin paywall» | `app/i18n/strings/ui.js:27-28`, `:219-220` | v1.0 = versión **pagada** (s132/s134) |
| C2 | La sidebar es un panel de racha + récord | `app/shell/Sidebar.jsx:97,100,103` | §37-bis: **ritmo semanal**, sin récord (s133) |
| C3 | Desktop reordena con `order` | `app/main/_responsive.js:254-263` | s123: «prohibido `order` bajo ningún breakpoint» (`DESIGN_SYSTEM.md:361-362`) |
| C4 | El SW precacheaba el standalone congelado | `sw.js:5` (antes) | s134: export **bajo demanda**, congelado en v0.71.0 |

**C4 está RESUELTA en esta sesión** (ver §5 de este documento). C1–C3 esperan tu decisión.

**Una contradicción NO reproduce.** Su §7.2 dice que «standalone» se usa como propuesta
principal de bienvenida. **No es cierto en la app**: no hay una sola aparición de «standalone»
en `app/i18n/`. Solo aparece en `README.md:60` y en la documentación. Clasificado como
**CONTRADICCIÓN DOCUMENTAL del propio audit**, no del repo.

**Y otra se queda a medias.** Su §7.3 incluye «v1 definida como web pulida en lugar de primera
versión pagada». `ROADMAP.md:73` ya dice literalmente lo contrario: «**v1.0 = la primera versión
PAGADA.** No es "la web pulida"». Ese claim ya estaba corregido.

---

## 3. Clasificación punto por punto

Leyenda: **HECHO** (con evidencia) · **PARCIAL** · **PENDIENTE** · **PROPUESTA** ·
**CONTRADICCIÓN** · **BLOQUEADO/ARTE** · **BLOQUEADO/TÚ**.

### §1 Estado del repositorio — 11 de 11 correctas

| Afirmación | Estado | Evidencia |
|---|---|---|
| Rama `main`, arquitectura React 18 + build propio + PWA + Cloudflare | HECHO | `package.json`, `build-standalone.js`, `sw.js` |
| **No existe CI** | HECHO | no existe `.github/` en el árbol |
| **`package.json` solo expone `build`** | HECHO | `package.json:5-7` |
| El build genera ambos artefactos | HECHO | `build-standalone.js:511` + paso `[6/7]` |
| `index.html` canónico · standalone congelado bajo demanda | HECHO | s134; `STATE.md:41` |
| **El SW incluye el standalone en el precache** | CONTRADICCIÓN → **resuelta s149** | era `sw.js:5` |
| Versión/HEAD que cita (v0.80.0 / `5a25876`) | desactualizado, sin consecuencia | hoy v0.81.0 / `e755880` |
| `main` no está protegida | PENDIENTE de verificar | requiere `gh`; no comprobado |
| «No lista para cobrar de forma segura» | PROPUESTA (juicio) | — |

### §2–§3 Visión y principios — doctrina ya vigente

**HECHO documental** en su práctica totalidad: los 20 principios de §3 ya son doctrina
(`docs/product/DECISIONES_PRODUCTO.md`, `CLAUDE.md`). Dos matices:

- «Sin suscripción autorrenovable en el lanzamiento» = decisión s134. HECHO.
- «Sin rachas culpabilizadoras» choca con la sidebar real → **C2**.
- El marco de «cuatro niveles» (acción / recomendación / Caminos / Travesías) es **encuadre
  nuevo**, compatible con s132. PROPUESTA de vocabulario.

### §4 Red de seguridad

| Punto | Estado | Nota |
|---|---|---|
| 4.1 «hubo una regresión real que rompió `index.html` durante varias versiones» | HECHO | el `useState` pelado de s144 estuvo **dos versiones publicado** (`STATE.md:28`) |
| 4.2 siguiente frente técnico | PROPUESTA | `STATE.md:370` ya la llamaba «candidata natural» |
| 4.3 CI mínimo + 9 scripts npm | PROPUESTA | **tú ya decidiste**: `npm run verify` local primero, no el YAML |
| 4.4 Playwright | PROPUESTA | fuera de alcance por decisión tuya |
| 4.5 integridad de producto | **PARCIAL** | `scripts/audit/` tiene 13 piezas, pero **ninguna devuelve código de salida**: imprimen |
| 4.6 despliegue condicionado | PROPUESTA | — |
| 4.7 sacar el standalone del precache | **HECHO s149** | ver §5 |

### §5 Infraestructura Cloudflare — PROPUESTA íntegra

Nada de esto existe en el repo. §5.5 («qué permanece local») es **HECHO doctrinal**: coincide
con local-first tal y como está implementado (`pace.state.v2` en `localStorage`).

### §6 Monetización — ya decidido salvo la arquitectura

| Punto | Estado | Evidencia |
|---|---|---|
| 6.1 Lifetime único 19,99 € | HECHO | s134; `MONETIZATION.md:14`, `ROADMAP.md:114` |
| 6.2 mensual descartado (y por qué) | HECHO | s134; mismos |
| 6.3 anual 9,99 € futuro | HECHO | s134; `ROADMAP.md:114` |
| 6.4 adapters + resolver | PENDIENTE | pero **su acusación se confirma**: `CustomRoutines.jsx:28` |
| 6.5 compra web + Play Billing | HECHO doctrinal | s132/s137 (Play Billing = 2.º entitlement) |
| 6.6 no cortar en mitad de sesión | HECHO | s85: gating **a nivel sesión**, «gating ANTES del contenido» |

### §7 Contradicciones — ver §2 de este documento

3 confirmadas · 1 no reproduce (§7.2) · 1 ya corregida en su día («v1 = web pulida»).

### §8 Home y continuidad

| Punto | Estado | Evidencia |
|---|---|---|
| 8.1 descripción del estado actual | HECHO (describe bien) | `_responsive.js:254-263` → **C3** |
| 8.2 «no mover las piezas» | HECHO | es la composición actual |
| 8.3 `ContinuityCard` | **PROPUESTA NUEVA** | `SuggestedPathCard.jsx` hoy solo sugiere Camino |
| 8.4 ejemplos de copy | PROPUESTA | — |
| 8.5 `getHomeContinuation` | **PROPUESTA NUEVA** | resolver único; alimenta home + sidebar + notificación |

### §9 Pomodoro como amanecer — PARCIAL

Más construido de lo que la auditoría supone. Ya existen: atmósfera de sesión de una capa
(`SessionShell.jsx`, s138/s140), halo que respira (`pace-dial-glow`, `tokens.css`), horizonte
por `clip-path` (s126, `DESIGN_SYSTEM.md:291-296`) y **los estados de §9.3** (idle / running /
paused / completed, s124). Lo genuinamente nuevo es la **evolución cromática por tercios**
(§9.4). PROPUESTA acotada, no un rediseño desde cero.

### §10 Geometría móvil

| Punto | Estado | Evidencia |
|---|---|---|
| 10.2 «comentarios desactualizados: el helper se describe como desktop y también se usa en móvil» | **HECHO — confirmado** | `home-geometry.js:26` dice «Solo actúa con min-width 769px… en mobile BORRA las variables y sale»; `home-geometry.js:58` dice «s128: el motor corre **también** en móvil/tablet» |
| 10.4 no forzar cero scroll | HECHO doctrinal | s123: «se **prefiere scroll** antes que achicar el aro / la tipografía / el CTA» |
| 10.5 matriz de prueba | PARCIAL | s123 verificó 7 viewports; **faltan 320×568 y texto ampliado** |
| 10.1 / 10.3 bandas visuales | PROPUESTA | — |

### §11 Sidebar

11.1 **HECHO (confirmado) → C2**. 11.2 y 11.3 **PROPUESTA**, y dependen de D6 (sin Travesías no
hay «Continuar → Travesía»).

### §12 Mueve y Estira

Su inventario de «Existe» es **exacto**: intensidad y nivel (s143), requisitos y preview (s144,
`app/ui/RoutinePreview.jsx`), runner v1 (s110-s119), instrucciones y cambios de lado (s115),
feedback (s116), constructor (s93), catálogo amplio. **HECHO, punto por punto.**

Su inventario de «Sigue pendiente» también: **20 ejercicios sin glifo** (verificado s142) y **15
glifos sin aprobación** (deuda D-4, `STATE.md`). **Le falta un dato que tú ya tienes**: los
**5 dibujos que no se pintan nunca** por estar tapados por su propio alias (s142) — decisión de
catálogo abierta que la auditoría no ve.

12.3–12.6 son **PROPUESTA**, y 12.6 pasos 2-4 están **BLOQUEADOS POR ARTE**.

Detalle menor: dice «el glifo de 44 px identifica». 44 es el `DefaultGlyph`
(`exercise-glyphs.jsx:187`); el runner pinta a **72** (`MoveModule.jsx:311`).

### §13 Bibliotecas — PROPUESTA, y coincide con feedback tuyo

Su diagnóstico (demasiado scroll en móvil, hacen falta filtros) es **el mismo feedback que diste
al cerrar s103** («filtros en bibliotecas para móvil»), hoy en el backlog de `STATE.md`.

### §14 Caminos · §15 Travesías — PROPUESTA MAYOR

Todo §14 (contrato conceptual, cinco tipos de paso nuevos) y todo §15 son **producto nuevo**.
s132 decidió «Travesías sí»; **mapa, paisaje transformable y Atlas son de esta auditoría**. → D6.

### §16 Retención — HECHO doctrinal

§16.5 («evitar») es literalmente doctrina tuya ya escrita. §16.1-16.4 describen el bucle que ya
persigues.

### §17 Pausa PACE y eventos

- **17.1 PARCIAL.** El BreakMenu **ya recomienda**: reordena por score y marca «Para ti»
  (`app/breakmenu/BreakMenu.jsx:66` y `:113`). Lo que **no** hace es recomendar una **rutina
  concreta** con duración, posición y material — que es exactamente la **Pausa PACE de tu Fase
  3.5**. La auditoría redescubre una fase que ya tienes planificada.
- **17.2 PENDIENTE, ya documentado.** `pace.events.v1` está **diseñado y aprobado, sin una línea
  implementada** (s117). Su argumento —«el histórico que no se emite no puede reconstruirse»— es
  el mejor motivo nuevo para adelantarlo que hay en todo el documento.

### §18 Capacitor — PENDIENTE, y el problema de build es real

No existe `dist/`: `build-standalone.js` escribe `index.html` **en la raíz**. Su aviso sobre
`webDir: "."` es correcto. → D7. **18.7** (que el runtime Capacitor no dependa del SW web) es un
apunte bueno y no está anotado en ningún sitio del repo.

### §19 Logos y arte — BLOQUEADO POR ARTE

Su taxonomía de 8 familias visuales es útil y **no existe escrita** en `DESIGN_SYSTEM.md`. El
orden que propone (taxonomía → módulos → glifos → diagramas → mapas → logos) es compatible con
la regla D-4.

### §20 Preparación para venta — PENDIENTE

Su lista de 25 ítems solapa casi entera con lo que ya tienes pendiente de la Fase 8.5 (a11y,
tests del state A-6, import sanitizado A-7, I18N-2) más lo comercial. **No aporta nada nuevo
salvo el encuadre de «antes del primer cobro»**, que sí es útil como criterio de corte.

### §21–§22 — ver D1

---

## 4. Qué archivos habría que tocar (si apruebas)

Ninguno de estos se ha tocado en s149.

| Archivo | Por qué | Depende de |
|---|---|---|
| `app/i18n/strings/ui.js` | claims `:27-28`, `:219-220`, `:38`, `:40` | **D2** |
| `app/shell/Sidebar.jsx` | racha/récord → ritmo semanal | **D3** |
| ~~`DESIGN_SYSTEM.md`~~ | ~~acotar la letra de s123 a ≤768px~~ | ✅ **HECHO s149** |
| `docs/product/DECISIONES_TECNICAS_VIGENTES.md` | fila nueva del SW (hecho en s149) + la que salga de D4 | — |
| ~~`MONETIZATION.md`~~ | ~~marcar las cuatro vías como histórico~~ | ✅ **HECHO s149** |
| ~~`ROADMAP.md`~~ | ~~`:450-451` pase/temporadas · `:456` «Android (v2.0)»~~ | ✅ **HECHO s149** (la fusión A–K no toca el orden: D1 lo conserva) |
| `README.md` | ~~`:152` licencias comerciales~~ ✅ hecho · **queda v0.27.6 → actual y el resto** | frente B |
| ~~`app/custom/CustomRoutines.jsx`~~ | ~~pasar por el guard~~ | ✅ **HECHO s149** (+ `state-entitlement.jsx`) |
| `package.json` | script `verify` | **D5 cerrado** → frente s150 |
| ~~`app/main/home-geometry.js`~~ | ~~cabecera `:26` contradice `:58`~~ | ✅ **HECHO s149** — y al verificar que era inerte salió un **hallazgo nuevo**: el ayudante **no publica ninguna variable** (ver diario §4 bis) |
| `STATE.md` | anotar C2 como deuda de implementación de §37-bis | **D3** |

**El de `home-geometry.js:26` es el único que puedo hacer sin decisión tuya** —es un comentario
que miente sobre su propio archivo—, pero lo dejo fuera de s149 para no mezclar frentes.

---

## 5. Lo único ejecutado: §4.7, el precache del service worker

**Cambio.** `sw.js` deja de precachear el export offline. Antes era la fila 5 del `PRECACHE`.

**Por qué era grave.** El standalone está congelado **a propósito** en v0.71.0 (decisión s134) y
la app iba por v0.81.0: el SW metía en la caché de cada usuario un artefacto **diez versiones
viejo**, y además lo servía **cache-first para siempre** (`sw.js` rama de `fetch` para no
navegaciones). **Nadie lo enlaza desde la app**: la única referencia en runtime era esa fila
(verificado por búsqueda en todo el árbol fuera de `docs/` y `backups/`).

**Verificación — cargando `index.html`, con el servidor de preview PARADO:**

| Comprobación | Resultado |
|---|---|
| Usuario que venía de v0.81.0 con el standalone cacheado | cachés antes: `pace-v0.81.0` (con `/PACE_standalone.html` dentro) |
| Tras activar el SW nuevo | cachés después: **solo `pace-v0.82.0`** — el cleanup del `activate` (`sw.js:129-139`) borró la anterior **entera** |
| Contenido de la caché nueva | **86 entradas, standalone ausente** |
| Filas de `PRECACHE` en `sw.js` | **86** — coinciden exactamente ⇒ `addAll` no falló ninguna ruta (es atómico) |
| Con el servidor caído: `manifest.webmanifest` | `200 application/manifest+json` desde caché ⇒ **la PWA sigue instalable offline** |
| Con el servidor caído: home | monta — `#root` con hijos, `[data-pace-home-body]`, `[data-pace-dial-fit]`, `[data-pace-activitybar]`, CTA «Empezar foco» |
| Offline: Hidrátate | +2/−1 → 1→3→2, y **persiste a 2 tras recargar** |
| Offline: Respira | biblioteca abre con sus 5 grupos |
| Offline: Mueve | biblioteca abre con sus grupos |
| Offline: Logros | modal abre con **54 sellos pintando su máscara `.webp`** desde caché |
| Offline: paleta | crema → oscuro: `--paper` `rgb(242,237,224)` → `rgb(29,26,20)` |
| Offline: Pomodoro | arranca, `[data-pace-dial-running]`, 24:59 → 24:57, CTA pasa a «Pausar» |
| Consola | **cero errores** (los avisos de Babel del buffer son STALE: en el documento vivo `typeof Babel === 'undefined'`, 0 scripts `text/babel`, 0 `src` externos) |

**Trampa anotada.** La primera redacción del comentario nuevo escribía la ruta del standalone
**literal y entrecomillada**, y un comprobador que lee `sw.js` por líneas la contaba como fila de
precache. Es la regla de s146 («las rutas van enteras y literales, ni en comentarios») aplicada a
otro archivo. Reescrito sin la forma literal.

**Verificado también** que la ingesta de glifos sigue encontrando su ancla: `reescribirPrecache()`
localiza la cabecera de s146 en la línea 34 y cerraría el comentario en la 42, insertando desde
la 43 — las 58 filas siguen contadas.

---

## 6. Lo que NO he hecho, y por qué

- **No toqué ningún documento canónico antes de presentar este triaje.** Instrucción nº 10 del
  propio audit. `MONETIZATION.md`, `ROADMAP.md` y `README.md` se marcaron **después**, y solo
  porque cerraste D9.
- **No he abierto CI, GitHub Actions ni Playwright.** Es el frente siguiente y lo empiezas por
  `npm run verify` local.
- **No he tocado `first.return`.** Diagnosticado en s148, decides tú cuándo.
- **No he reescrito las 28 descripciones** ni tocado los 8 glifos flojos ni el pincel temporal de
  `stats.month.first`.
- **No he regenerado `PACE_standalone.html`.** El build lo reescribió; restaurado byte a byte —
  hash `998E3E358D689036`, idéntico al de HEAD.
