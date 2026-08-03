# Sesión 149 — La auditoría acierta, y lo que descubre es que el repo se contradice a sí mismo

**Fecha:** 2026-08-03 · **Versión:** v0.81.0 → **v0.82.0** · **Frente:** triaje de la auditoría
integral externa (un solo frente, sin mezclar)

---

## 0. De qué iba la sesión

Triar `docs/audits/audit-integral-v0.80.0.md` —1569 líneas aportadas por el usuario al cerrar
s148, copiadas sin triar— contrastándolo **contra el código real, no contra la documentación**, y
entregar un **documento de decisión**, no un resumen. Más un único cambio de código autorizado: el
precache del service worker.

La apuesta del usuario al abrir la sesión era que **una parte grande saldría HECHO**. Se cumple,
pero con un matiz que importa: casi todo lo HECHO es *descripción correcta del estado actual*, no
trabajo ya realizado en respuesta a la auditoría. Lo que de verdad aporta el documento no son sus
propuestas, sino **cuatro contradicciones que el repo tenía en silencio**, y tres de ellas son
contradicciones **entre documentos propios del repo**.

---

## 1. El formato estaba peor de lo anotado: no era una valla, eran todos los marcadores

STATE.md avisaba de «una llave de código sin cerrar hacia la línea 233 que se traga la estructura
de títulos de §4.6 en adelante». La valla existe —`  ```text ` abierta en la 233 y nunca cerrada—
pero **no es el problema**: al medir, desde esa línea el pegado había perdido **todos** los
marcadores markdown.

- **Títulos**: `## 4.6 Despliegue` (línea 229) conserva sus `##`; `4.7 Service worker` (247) ya no.
  De ahí al final, los 113 encabezados restantes van en texto plano.
- **Viñetas**: las listas anteriores a la 233 llevan `-`; las posteriores no.
- **Vallas**: ninguna de las ~35 posteriores sobrevivió.
- **Tablas**: las dos (§15.3 y §18.6) quedaron separadas por tabuladores, que markdown no renderiza.
- **Y un artefacto de origen**: el texto del **botón «Copy»** de la interfaz de la que se copió
  quedó pegado al primer token de cada bloque de código (`CopyPurchaseAdapter`, `Copysource`,
  `Copy/PACE_standalone.html`…). 33 casos glued más 2 sueltos.

### Cómo se reparó sin tocar una palabra

Reconstruir a mano el 85 % de un documento es exactamente donde se pierde contenido sin darse
cuenta, así que la reparación se hizo con **una verificación que lo hace imposible de ocultar**: se
comparó el **flujo de palabras** del archivo reparado contra el de HEAD, normalizando solo (a) los
artefactos «Copy» y (b) los numerales de lista que la reparación restituye.

```
tokens HEAD    : 4533
tokens reparado: 4533
divergencia    : NINGUNA
```

Después: **133 encabezados parsean** fuera de valla (antes 19), las vallas quedan balanceadas, y
las únicas 5 apariciones de «Copy» que quedan son las tres de la nota de reparación y las dos
legítimas del texto («Fase B — Copy y coherencia documental», «Copy de soporte»).

**Lección de método.** La primera pasada de verificación dio tres falsas divergencias seguidas, y
las tres eran del **comprobador**, no del archivo: `Copy` pegado a minúscula (`Copysource`) no
casaba con `/^Copy[^a-z]/`; los backticks que se añaden alrededor de un identificador separan el
punto final en un token propio; y los numerales `1.` restituidos contaban como palabras. Mismo
patrón que en s143 («no fallaba el código, fallaba la comprobación»).

---

## 2. Lo único que se tocó: el standalone sale del precache

### Por qué era grave

`sw.js:5` precacheaba el export offline. La decisión s134 lo congeló **a propósito** en v0.71.0 y
nadie revisó esa fila: con la app en v0.81.0, el SW metía en la caché de cada usuario un artefacto
**diez versiones viejo**, y la rama de no-navegación de `fetch` lo servía **cache-first para
siempre**, sin revalidar. Y no lo enlaza nadie: la búsqueda en todo el árbol (fuera de `docs/` y
`backups/`) confirma que esa fila era **la única referencia en runtime**.

### Verificación, cargando `index.html` y con el servidor de preview PARADO

El caso interesante no es el usuario nuevo sino **el que ya lo tenía cacheado**, así que se sembró:
caché `pace-v0.81.0` con `/PACE_standalone.html` dentro. Tras el bump y la activación del SW nuevo:

| Comprobación | Resultado |
|---|---|
| Cachés tras activar | **solo `pace-v0.82.0`** — el cleanup del `activate` (`sw.js:129-139`) borró la anterior entera |
| Contenido de la caché nueva | **86 entradas, standalone ausente** |
| Filas de `PRECACHE` en `sw.js` | **86** — coinciden ⇒ `addAll` no falló ninguna ruta (es atómico) |
| `manifest.webmanifest` sin servidor | `200 application/manifest+json` desde caché ⇒ la PWA sigue instalable offline |
| Home sin servidor | monta: `#root` con hijos, `[data-pace-home-body]`, `[data-pace-dial-fit]`, `[data-pace-activitybar]`, CTA «Empezar foco» |
| Hidrátate offline | +2/−1 → 1→3→2, y **persiste a 2 tras recargar** |
| Respira / Mueve offline | ambas bibliotecas abren con sus grupos |
| Logros offline | **54 sellos** pintando su máscara `.webp` desde caché |
| Paleta offline | crema → oscuro: `--paper` `rgb(242,237,224)` → `rgb(29,26,20)` |
| Pomodoro offline | arranca, `[data-pace-dial-running]`, 24:59 → 24:57, CTA pasa a «Pausar» |
| Consola | **cero errores** |

Sobre la consola: aparecían dos avisos de «in-browser Babel transformer», que son **STALE** (la
trampa de entorno ya documentada desde s112). Comprobado en el documento vivo: `typeof Babel ===
'undefined'`, **0** scripts `text/babel`, **0** `src` externos — el documento cargado es el
compilado.

### Dos trampas propias en un cambio de seis líneas

1. **El comentario nuevo escribía la ruta literal y entrecomillada**, y un comprobador que lee
   `sw.js` por líneas la contaba como fila de precache — daba «standalone en el precache: true»
   después de haberlo quitado. Es la regla de s146 (*las rutas van enteras y literales, ni en
   comentarios*) aplicada a otro archivo. Reescrito sin la forma literal.
2. **`reescribirPrecache()` de la ingesta de glifos localiza su ancla por línea**, así que un
   comentario nuevo por encima podía descolocarla. Simulado sin escribir: encuentra la cabecera de
   s146 en la línea 34, cierra en la 42, insertaría desde la 43, y sigue contando las 58 filas.

---

## 3. El triaje: qué dice la auditoría y qué dice el código

El documento completo es
[`triaje-audit-integral-s149.md`](../audits/triaje-audit-integral-s149.md). Aquí, lo que cambia
algo.

### De lo verificable, cero afirmaciones falsas

Sus §1 (once afirmaciones sobre el repo), §6.1-6.3 (monetización) y §12.2 (inventario de Mueve y
Estira) son **exactos punto por punto**. `package.json:5-7` expone solo `build`; no existe
`.github/`; el build genera ambos artefactos; el standalone está congelado. Su §4.1 —«hubo una
regresión real que rompió `index.html` durante varias versiones»— es el crash de s144, que estuvo
**dos versiones publicado**.

Solo una **no reproduce**: su §7.2 dice que «standalone» se usa como propuesta principal de
bienvenida. **No hay una sola aparición en `app/i18n/`**; está en `README.md:60` y en documentación.
Y otra ya estaba corregida: su §7.3 pide corregir «v1 definida como web pulida», cuando
`ROADMAP.md:73` ya dice literalmente lo contrario.

### Las cuatro contradicciones — y tres son del repo consigo mismo

| # | Qué | Evidencia | Contra qué |
|---|---|---|---|
| C1 | El onboarding promete «Siempre gratis / sin paywall», ES y EN | `app/i18n/strings/ui.js:27-28`, `:219-220` | v1.0 = versión **pagada** (s132/s134) |
| C2 | La sidebar es un panel de racha **y récord** | `app/shell/Sidebar.jsx:97,100,103` («Mejor: {n} días») | §37-bis: ritmo semanal, **sin récord** (s133) |
| C3 | Desktop reordena secciones con `order` | `app/main/_responsive.js:254-263`, bajo `@media (min-width:769px)` | s123: «prohibido `order` bajo ningún breakpoint» (`DESIGN_SYSTEM.md:361-362`) |
| C4 | El SW precacheaba el standalone congelado | `sw.js:5` | s134 — **RESUELTA en esta sesión** |

**C3 es la más instructiva.** s126 introdujo el `order` a propósito, el usuario validó el resultado
mirando, y **nadie enmendó la decisión escrita**. Es la misma clase de fallo que la tabla de deuda
de s148: un documento que dice una cosa y un código que hace otra, conviviendo sin que nadie los
cruce. La recomendación es **acotar la letra de s123 a ≤768px**, que es donde de verdad rige
—incluso su propia cabecera de ámbito lo dice—, no revertir el código.

**Y dos claims más que dejarán de ser ciertos** en cuanto exista el Worker de licencia de su §5:
`ui.js:38` «No hay servidor» y `ui.js:40` «localStorage únicamente».

### La acusación de §6.4 se confirma, y es exactamente donde decía

Dice: «auditar excepciones actuales, por ejemplo superficies del constructor que leen el booleano
directamente». Y ahí está: `app/custom/CustomRoutines.jsx:28` → `const unlocked =
!!pace.premiumUnlocked;`, sin pasar por el guard central de s95 y sin fallback.

La otra lectura directa, `app/breathe/BreatheLibrary.jsx:118`, **no es una excepción**: es el
fallback defensivo de un ternario que consulta `window.canAccessRoutine` primero (línea 116).
Distinguirlas importa — tratarlas igual habría dado un hallazgo inflado.

### §10.2 acierta en algo pequeño y muy concreto

Dice que «el helper se describe como desktop y posteriormente también se usa en móvil». Literal:

- `app/main/home-geometry.js:26` → «ENCAPSULADO EN DESKTOP. Solo actúa con `min-width: 769px`. En
  mobile/tablet **BORRA** las dos variables y sale».
- `app/main/home-geometry.js:58` → «s128: el motor corre **también** en móvil/tablet (≤768)».

La cabecera del archivo miente sobre su propio archivo desde s128.

### Lo que redescubre sin saberlo

Su §17.1 pide que el BreakMenu «evolucione de ordenar módulos a recomendar una acción concreta».
Ya reordena por score y marca «Para ti» (`BreakMenu.jsx:66`, `:113`) — lo que no hace es recomendar
una **rutina** con duración, posición y material. Eso es exactamente la **Pausa PACE de la Fase
3.5** del plan vigente. Igual su §13: su diagnóstico de las bibliotecas móviles es el mismo
feedback que dio el usuario al cerrar s103.

### Y un dato que la auditoría no tiene

Su §12.2 lista bien lo pendiente de Mueve/Estira (20 sin glifo, 15 sin aprobar) pero **no ve los
5 dibujos que no se pintan nunca** por estar tapados por su propio alias (s142) — decisión de
catálogo abierta.

---

## 4. Las nueve decisiones — cuatro cerradas en el mismo cierre

Se presentaron antes de tocar nada canónico, y el usuario resolvió cuatro sobre la marcha.

### D1 · Fusionar, no sustituir

A–K **no reemplaza** las 15 fases: `ROADMAP.md` conserva su numeración. Se adopta su **A** (red de
seguridad) como frente inmediato y su **B** (copy y coherencia) detrás; **C** (Capacitor temprano)
e **I** (Travesías con mapa) quedan condicionadas a D7 y D6.

### D5 · El `verify` v1 cubre build + artefacto + `node --check`

Nada más. Es exactamente lo que habría cazado el crash de s144. El punto de partida real es que
`scripts/audit/` tiene 13 piezas y **ninguna devuelve código de salida**: imprimen.

### D8 · El guard gana una tercera función

Aquí hubo que pensar un poco más de lo que parecía. `canAccessRoutine` y `canAccessPath` piden un
`routineId` o un `pathId` — y **el constructor no es contenido: es una superficie entera de pago**
(s93). No había guard al que preguntar, y por eso `CustomRoutines.jsx:28` leía el booleano directo.
Meterlo a la fuerza en `canAccessRoutine` habría sido inventar un id falso.

Entra **`hasPremiumEntitlement()`** en `state-entitlement.jsx`, y la sección la consume con el mismo
patrón que ya usaba `RoutineCard`: preguntar al guard, **caer al booleano solo si no está cargado**,
y conservar `usePace()` para la suscripción reactiva. Con eso, la promesa que la cabecera de s95
lleva escrita desde entonces —«al llegar la licencia real **solo cambia este archivo**»— vuelve a
ser cierta.

**Verificado en las dos direcciones**, sobre `index.html`, prediciendo antes de mirar:

| `premiumUnlocked` | `hasPremiumEntitlement()` | Lo que pinta la sección |
|---|---|---|
| `false` | `false` | «PREMIUM · EN MUEVE Y EN ESTIRA · … · **Pronto**», sin CTA |
| `true` | `true` | «**+ Crear rutina**», y «Pronto» desaparece |

`canAccessRoutine('atg.knees')` acompaña al mismo valor, que es la prueba de que las tres funciones
leen la misma fuente. Consola sin errores.

### D9 · Marcado, no borrado

- `MONETIZATION.md`: banner **⚠️ HISTÓRICO — NO GOBIERNA** antes del modelo de s21/s26, más marcas
  en la vía 2 (**descartada en s134**), la vía 3 (**fuera de v1**) y la tabla de convivencia, que
  era lo peor: listaba «Pase mensual activo → sí, durante 30 días» como si se pudiera comprar.
- `ROADMAP.md`: «Lanzamiento pagado v1.0» pasa a histórico (lo gobierna «Camino a v1.0») y «App
  Android (v2.0)» queda marcado — **Android entra DENTRO de v1** desde s137.
- `README.md`: corregida la sección de licencia, que vendía «Lifetime + Pase mensual + Temporadas».
  El resto sigue desactualizado **a propósito**: va entero en el frente B.

Se conserva todo el texto. El criterio es el de `AUDITORIA_DOCUMENTAL.md`: la historia no se borra,
se marca de forma que nadie pueda confundirla con lo vigente.

### Las cinco que siguen abiertas

**D2** copy del onboarding (va en el frente B) · **D3** sidebar contra §37-bis · **D4** la letra de
s123 · **D6** Travesías con mapa en v1 · **D7** spike de Capacitor.

Sobre **D4** el usuario pidió que se le explicara antes de decidir, y la respuesta es la que hace
que valga la pena: **es un cambio de texto, cero código y cero píxeles**. Lo mismo la cabecera de
`home-geometry.js:26`, que es un comentario. En los dos casos el riesgo real es el contrario —
dejar escrita una regla que el código no cumple es lo que puede llevar a alguien a «arreglar» algo
que no está roto.

Detalle completo, con evidencia y archivos a tocar, en el documento de triaje.

---

## 4 bis. Un hallazgo fuera de encargo: el ayudante de geometría no publica nada

Salió al verificar los dos arreglos de texto del cierre. La corrección de la cabecera de
`home-geometry.js` es un comentario, así que **no debería cambiar nada** — pero al medir para
confirmarlo, apareció que **el ayudante no publica ninguna de sus variables**.

Medido en el panel de vista previa, **1280×720**, con estado limpio y SW purgado:

| | Valor |
|---|---|
| `--pace-timer-d` · `--pace-activities-overlap` · `--pace-home-squeeze` | **vacías** |
| `--pace-home-timer-size` · `--pace-home-sunset-overlap` (modelo s123) | **vacías** |
| `document.documentElement` | **sin atributo `style`** — el ayudante no ha escrito nunca |
| Diámetro del aro | **360 px** = exactamente el *fallback* de `var(--pace-timer-d, 360px)` |
| Solapamiento Actividades↔aro | **10 px = 0,028·D** — el contrato de s126 pide 0,16 nominal, con banda de aceptación **0,14–0,17** |
| Scroll vertical de la home | **17 px** — el modelo de s126 encoge D hasta `overflowV ≤ 1` |

**Lo primero que había que descartar era yo.** Extraje `index.html` de HEAD (v0.81.0), lo serví
desde el mismo servidor y medí lo mismo: **idéntico**, variables vacías y aro de 360 px. El
hallazgo es **preexistente** y mi cambio es inerte, que era justo lo que se quería comprobar.

**No se toca en s149** — es otro frente. Dos cautelas antes de perseguirlo:

1. Está medido en el **panel de vista previa**, no en un navegador real. Antes de llamarlo bug de
   producción hay que reproducirlo fuera.
2. La home **se ve bien** y el usuario la validó así; lo que falla no es el resultado visible sino
   que el contrato medido de s126 no se está aplicando.

Y encaja exactamente con lo que pedía el §10.2 de la auditoría —«auditar el contrato geométrico»—,
que apuntaba en esa dirección **sin poder medirlo**. Con la cabecera arreglada, ahora el archivo al
menos describe lo que pretende hacer.

---

## 5. Lo que NO se hizo, y por qué

- **Ningún documento canónico se tocó antes de presentar el triaje.** Instrucción nº 10 del propio
  audit. `MONETIZATION.md`, `ROADMAP.md` y `README.md` se marcaron **después**, y solo porque el
  usuario cerró D9 explícitamente.
- **Ni CI, ni GitHub Actions, ni Playwright.** Frente siguiente, y empieza por `npm run verify`
  local.
- **`first.return` sin tocar.** Diagnosticado en s148; lo decide el usuario.
- **Ni las 28 descripciones, ni los 8 glifos flojos, ni el pincel de `stats.month.first`.**
- **`PACE_standalone.html` no se regenera.** El build lo reescribió; restaurado byte a byte —
  hash `998E3E358D689036`, idéntico al de HEAD (decisión s134).
- **`home-geometry.js:26`**, aunque es solo un comentario que miente y podría arreglarse sin
  decisión, se deja fuera para no mezclar frentes.

---

## 6. Qué queda vivo

- **Las cinco decisiones abiertas** de §4 (D2, D3, D4, D6, D7).
- **Frente s150 acordado**: la red de seguridad, `npm run verify` **local** con el alcance de D5.
- `main` no protegida: la auditoría lo afirma y **no se ha verificado** (requiere `gh`).
- `scripts/audit/` tiene 13 piezas y **ninguna devuelve código de salida**: imprimen. Es el punto de
  partida real del `verify`.
- `home-geometry.js:26` sigue contradiciendo a su propia línea 58, a la espera de la misma palabra
  que D4.
