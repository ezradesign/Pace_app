# Sesión 153 — EL CI NO COMPRUEBA NADA QUE NO CORRA EN LOCAL

**Fecha:** 2026-08-04
**Versión:** v0.85.0 → **v0.86.0**
**Frente:** CI — lo único que quedaba detrás de la red de seguridad
**Artefacto verificado:** `index.html` v0.86.0 (`8F65BD6C57592B00`, regenerado tras el fix del §8) · `PACE_standalone.html` intacto (`998E3E358D689036`)

---

## 0. Qué entraba y qué no

El frente CI son cuatro piezas de tamaños muy distintos —Actions/YAML, proteger `main`,
Playwright y Wrangler— y el alcance se cerró con el usuario **antes de tocar nada**:

- **ENTRA**: el workflow de GitHub Actions (`npm ci` + `npm run verify`) y la comprobación
  de que el `index.html` committeado esté al día.
- **ENTRA**: la protección de `main`, pero **solo como instrucciones**, porque no la puedo
  ejecutar yo (ver §5).
- **FUERA**: Playwright y Wrangler, anotados como siguiente paso.

La razón por la que este frente estaba aparcado —«el YAML tiene que invocar algo que ya
funcione en local»— dejó de aplicar en s152: ese algo son las 4 tandas y 32 comprobaciones
de `npm run verify`.

**La tesis del workflow es esa y conviene no perderla**: el CI **no comprueba nada que no
corra en local**. Invoca el `verify`, no lo reinterpreta. Así, lo que sale rojo en GitHub se
reproduce con un solo comando, que es la única forma de que un CI no se convierta en un
oráculo que nadie sabe interrogar. Vigilancia nueva ⇒ se añade al `verify`, no al YAML.

---

## 1. Antes de escribir una línea de YAML: cinco cosas que podían hundirlo

El runner es **Linux** y el desarrollo es **Windows**. Todo lo que sigue se midió, y
cualquiera de las cinco habría dejado el CI rojo desde el primer run.

| Riesgo | Medido | Resultado |
|---|---|---|
| ¿El build es determinista? | Dos pasadas seguidas sobre el árbol committeado | **Sí** — `index.html` repite `91875C7A…`, el hash de HEAD |
| ¿Y entre plataformas? | El único recorrido de directorio que podría depender del orden del sistema de archivos es `validateAppFiles` | Va con **`.sort()`** y además **solo valida sintaxis: no emite nada al artefacto** |
| Finales de línea | `.gitattributes` + `git ls-files --eol` sobre todo el repo | **Ningún archivo del repo se desvía de LF**, y ya cubre `*.yml` |
| Mayúsculas (Linux distingue, Windows no) | Script propio: las **190** rutas declaradas en `PACE.html` (104) y en el `PRECACHE` de `sw.js` (86) contra `git ls-files` | **190 de 190 exactas**, 0 discrepancias |
| ¿`npm ci` arrancará? | lockfile v3, `npm ci --dry-run` | **Sincronizado en 1 s**, y el lock **trae `sharp-linux-x64`** |

Dos notas que valen para el futuro:

- **`sharp` no la usan ni el build ni el verify** (solo la ingesta de arte y los scripts de
  audit), pero está en `devDependencies`, así que `npm ci` la instala igual. No es un
  problema porque el lock trae su binario de linux; si algún día lo perdiera, el fallo
  sería de instalación y no de la app.
- Los scripts son **portables**: `process.execPath` y `path.join`, cero `process.platform`
  y cero rutas de Windows cableadas.

---

## 2. La comprobación que el `verify` no puede hacer, y por qué va aparte

El `verify` **avisa** de que `index.html` difiere de las fuentes, pero lo hace como `[INFO]`
y **a propósito**: corre justo ANTES de regenerarlo en el cierre, o sea en el único momento
en que el artefacto TIENE que estar desactualizado. Ponerlo rojo lo haría fallar siempre en
el único punto donde se le llama. Esperar que el `verify` cace esto **no funciona**: hay que
comprobarlo aparte, y ese es el último paso del workflow.

**Dos cosas que no se pueden «simplificar» ahí**, las dos medidas:

1. **El diff va ACOTADO a `index.html`.** Un `git diff --exit-code` a secas se pondría rojo
   **siempre** por `PACE_standalone.html`, congelado en v0.71.0 desde s134 y que el build
   acaba de reescribir. Medido en la primera pasada de la sesión: tras el build, el
   standalone pasa de `998E3E35…` a `5C310793…`.
2. **Se compara con `git diff`, nunca con un hash SHA-256.** Este fue el hallazgo fino.
   `.gitattributes` normaliza a LF **en el repo**, pero en el worktree de Windows hay 5
   fuentes en CRLF y el build los inlinea tal cual (`readFileClean` quita el BOM, **no**
   normaliza saltos) ⇒ el `index.html` de Windows sale con finales **mixtos** y su SHA-256
   **no puede** coincidir con el de Linux. `git diff` aplica la normalización en los dos
   lados; un hash de archivo no. El propio git lo dijo durante la prueba: *«in the working
   copy of 'index.html', CRLF will be replaced by LF the next time Git touches it»*.

### Una afirmación mía, falsa, corregida antes de quedar escrita

El comentario del YAML atribuía esos finales mixtos al **CSS inlineado**. Al medirlo:
**500 bytes CR en `index.html` contra 386 en `app/tokens.css`** — no cuadra, hay 114 de otra
procedencia (el JS pasa por Babel, que reescribe la salida, pero el **contenido de los
literales** conserva sus CRLF). La conclusión de diseño no cambiaba, pero la causa escrita
era falsa. Corregido a lo medido antes de commitearlo.

---

## 3. Las pruebas: verde, rojo, y restaurado byte a byte

El listón de s150/s152 se aplica igual aquí aunque la comprobación viva en el CI y no en el
`verify`. **El script probado se extrajo del YAML parseado**, no se reescribió a mano — así
se prueba el texto real y no una copia que puede divergir.

| | Escenario | Resultado |
|---|---|---|
| **YAML** | parseado de verdad con `js-yaml`, no revisado a ojo | **válido** · 1 job, 5 pasos, Node 24, 3 triggers |
| **Verde** | árbol al día | `index.html coincide byte a byte…` · **EXIT=0** |
| **Rojo** | una fuente cambia y **nadie regenera el artefacto** (el paso 3 del cierre olvidado) | `::error file=index.html::…` + `index.html \| 1 +` · **EXIT=1** |

El rojo se provocó con el escenario **real**, no con uno cómodo: tocar `index.html`
directamente no sirve de nada, porque el paso **regenera el artefacto antes de comparar**.
Hay que tocar una **fuente** y dejar el artefacto viejo, que es exactamente el descuido que
esto tiene que cazar.

Restaurado y **comprobado, no supuesto**: `app/state-settings.jsx` a `56857B32…`,
`index.html` a `91875C7A…`, `PACE_standalone.html` a `998E3E35…`.

---

## 4. El instrumento mintió tres veces. Ninguna era el código

Van cuatro sesiones seguidas con lo mismo (s151, s152 y ahora), así que ya no es anécdota:

1. **Reporté que el onboarding no aparecía con estado limpio**, lo que habría contradicho lo
   que s152 dio por verificado. Antes de llamarlo regresión: descarté que la app viva
   repersistiera el estado (no lo hace), confirmé documento nuevo por edad real
   (`Date.now() − performance.timeOrigin`) y estado ausente (`firstSeen: null`)… y el
   onboarding **sí estaba montado**. Yo había leído `document.body.innerText` **recortado a
   120 caracteres**, y el onboarding se monta **al final del DOM**, detrás de la home
   (`main.jsx:318`). Medí un recorte y concluí sobre lo que no medí. Lo zanjó buscar la
   placa de valores de s151 en el HTML: `Núcleo gratuito` y `Todo local`, presentes.
2. **El `grep` me mostró `//` como `\`** en `main.jsx:89`, o sea un archivo con sintaxis
   imposible que el `verify` acababa de dar por bueno. Leído el archivo directamente: está
   intacto. Cuando dos instrumentos se contradicen, el que miente no es el que tiene asertos.
3. Y la de siempre: `performance.now()` **no basta** para saber que un documento es nuevo.

---

## 5. Proteger `main`: no lo puedo hacer yo, y la opción que propuse estaba mal planteada

**`gh` NO está instalado** (comprobado en Bash y en PowerShell), y el endpoint de branch
protection exige autenticación ⇒ la afirmación de la auditoría integral de que `main` está
sin proteger **sigue sin verificar**. Es acción del usuario en la web.

Al redactar las instrucciones apareció un problema con la opción que se había elegido, y el
error era mío al redactarla: **«exigir que el check de CI pase, sin requerir PR» es
contradictorio**. Un check solo puede pasar DESPUÉS de que el commit exista, así que
requerirlo **bloquea el push directo** — GitHub lo rechaza porque para ese commit todavía no
hay ningún run verde. Requerir checks y empujar directo a `main` son incompatibles: el gate
real solo existe con pull requests de por medio.

Lo entregado en `docs/WORKFLOW.md` §8 es el ruleset que **sí** preserva el flujo actual
(**Restrict deletions** + **Block force pushes**, sin PR y sin required checks), más la
alternativa documentada por si algún día se quiere el gate de verdad — que no es una casilla
sino cambiar el cierre entero a rama → PR → merge. Anotado además que el check `verify`
**solo aparece en el selector de GitHub tras el primer run** del workflow.

---

## 6. Un tercer sitio que decía lo contrario, otra vez

`docs/WORKFLOW.md` seguía exigiendo en su checklist **«`PACE_standalone.html` actualizado
(backup rotado)»** y en su tabla de alarmas **«fecha de modificación antigua ⇒ build no
regenerado»**. Las dos son **falsas desde s134**, que congeló el standalone como export bajo
demanda. Es el defecto de s151 repetido: la regla vivía en tres sitios y el tercero no lo
miró nadie —y aquí era más caro, porque el documento decía justo lo contrario que el YAML
que se estaba escribiendo—. Corregido, más el `verify` como paso del checklist y dos
señales de alarma nuevas.

---

## 7. Verificación

- **`npm run verify` PASA — 0 problemas en 4,7 s**, 4 tandas, versión **v0.86.0** coherente
  en los tres sitios.
- **`index.html` regenerado**: difiere de HEAD en **exactamente 2 líneas** — `<title>` y
  `PACE_VERSION`. Ningún archivo de `app/` cambió de contenido esta sesión salvo el bump.
- **`PACE_standalone.html` restaurado** a `998E3E358D689036` (hash comprobado, no supuesto).
- **Secuencia completa del CI ejecutada en local en el orden del workflow**: `verify` EXIT=0
  → frescura EXIT=0.
- **Sobre `index.html`, con SW y cachés purgados y estado limpiado desde la página viva**:
  `PACE_VERSION` v0.86.0 · `typeof Babel === 'undefined'` · **0** scripts `text/babel` ·
  `<link rel="manifest">` presente · la home monta (timer 25:00, «Empezar foco», CICLO 1/4,
  Camino sugerido) · **onboarding de primera vez presente** con `firstSeen: null` ·
  **consola sin errores** (los dos avisos de Babel son el buffer stale conocido).

---

## 8. EL PRIMER RUN SE PUSO ROJO, Y LA CAUSA NO ERA EL YAML

Tras el push se comprobó el run en GitHub en vez de darlo por bueno. **Falló.** `npm run verify`
**pasó en Linux** —la red de seguridad es portable, que era la duda razonable— y lo que rompió fue
**mi** paso de frescura, el único que el workflow añade por su cuenta.

Y falló pese a que la secuencia completa se había simulado en local y salía verde. Esa
contradicción es el hallazgo.

### Reproducido en local, no deducido

Se convirtieron a LF los 5 fuentes que en este worktree están en CRLF —que es exactamente lo que
ve un checkout de Linux, porque `.gitattributes` guarda todo en LF— y se rebuildeó. El diff contra
el artefacto committeado: **una sola línea**, y la diferencia es **un espacio**.

```
-       Ese archivo AÑADE sus entradas a ESTE MISMO objeto (`Object.assign` sobre
+      Ese archivo AÑADE sus entradas a ESTE MISMO objeto (`Object.assign` sobre
```

**Con CRLF, Babel emite otra indentación en los comentarios que conserva.** O sea: **el build no
producía el mismo artefacto desde fuentes CRLF que desde fuentes LF**, y por tanto el `index.html`
committeado **dependía del worktree de quien lo generó**. La afirmación del §1 («el build es
determinista») era cierta *dada la misma entrada* — y la entrada **no** es la misma entre Windows
y Linux. Eso es justo lo que no se había medido.

### Arreglado en el build, no en el YAML

Se podría haber normalizado los 5 archivos a mano, pero eso es un parche: **`git checkout` NO los
devuelve a LF** (comprobado — git no los ve modificados porque su filtro los normaliza al
comparar, así que los deja como estén), y cualquier edición futura con una herramienta que escriba
CRLF volvería a romper el CI con un diff de un espacio, que es de lo más difícil de diagnosticar.

El arreglo va en `readFileClean` de `build-standalone.js`: **normaliza a LF al leer**. Es
semánticamente neutro —ECMAScript ya normaliza CRLF a LF dentro de los template literals, y fuera
de ellos el salto de línea no cambia el programa— y **todo el texto que entra en el artefacto pasa
por esa función** (comprobado uno por uno: el HTML de entrada, el CSS, los módulos y el React
vendor; las lecturas crudas restantes son binarias a base64).

**Prueba de aceptación, y es la que importa**: con el arreglo, las mismas fuentes **en CRLF y en
LF producen el mismo `index.html` byte a byte** (`8F65BD6C57592B00…` en los dos casos), y el
artefacto ya no contiene **ni un solo CR**. El artefacto es reproducible en cualquier plataforma,
que es lo que un CI necesita para que su rojo signifique algo.

### Lo que esto enseña sobre el CI

Sirvió para exactamente aquello para lo que se puso: **cazó un defecto real de reproducibilidad
que llevaba tiempo en el repo y que ninguna red local podía ver**, porque en local las dos mitades
del descuadre se cancelan (`git diff` normaliza, y el artefacto y las fuentes comparten worktree).
Un CI que solo confirma lo que ya sabes no vale nada; este falló la primera vez y tenía razón.

**Y una lección de método**: la simulación local del CI daba verde y el runner rojo. **Simular no
es ejecutar.** Comprobar el run de verdad —vía la API pública, porque `gh` no está instalado— fue
lo que impidió cerrar la sesión afirmando algo falso.

---

## 9. Estado al cerrar

El frente CI queda **abierto y con su primera pieza dentro**. Existe `.github/`, que era
justo lo que no existía desde siempre.

**Lo que sigue, en este orden:**

1. **Playwright** — cubre el **primer hueco declarado del verify**, que el propio script
   imprime en cada pasada: *«comportamiento: no abre navegador, no monta la app, no pulsa
   nada»*. Hay material medido para asertar sin inventar (53 máscaras y 5 tras secreto,
   0/88, 25:00→24:58, Hidrátate persiste, `first.sip`, oscuro `rgb(29,26,20)`). Ojo con dos
   cosas al montarlo: cada test arranca con estado limpio y por tanto **en el onboarding**
   (hace falta sembrar `firstSeen`), y contar sellos exige acotar a
   `[data-pace-modal-backdrop]` (s152).
2. **Wrangler** — deploy a Cloudflare Pages. Exige secretos de la cuenta del usuario en
   GitHub; el YAML se puede dejar escrito, pero inerte.
3. **Proteger `main`** — instrucciones listas en `WORKFLOW.md` §8, acción del usuario.

De la lista de s149 siguen abiertas **D3** (sidebar racha+récord contra §37-bis), **D6**
(Travesías con mapa) y **D7** (spike de Capacitor).
