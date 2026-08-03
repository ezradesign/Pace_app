# Sesión 151 — LA PROMESA ESTABA EN TRES SITIOS, Y EL TERCERO NO LO MIRÓ NADIE

**Fecha:** 2026-08-03
**Versión:** v0.83.0 → **v0.84.0**
**Frente:** B de la auditoría integral (D1 de s149) — copy y presencia pública
**Artefacto verificado:** `index.html` v0.84.0 · `PACE_standalone.html` intacto (`998E3E358D689036`)

---

## 0. Qué entraba y qué no

Frente B, un solo frente con dos piezas y en este orden: **D2** (el onboarding promete
«Siempre gratis / sin paywall» contra v1.0 = versión pagada) y **el README entero**
(decía v0.27.6 con la app en v0.83.0).

Fuera, por decisión previa: CI/YAML/Wrangler/Playwright (van detrás de la segunda
tanda del verify), D3, D6, D7, `first.return`, el ayudante de geometría de la home y
las 53 vs 58 máscaras del modal de Logros.

---

## 1. D2 — la contradicción más cara, y dos datos que cambiaron el encargo

Las cuatro líneas que señalaba la auditoría existen y **las dos superficies están
vivas**, no son copy muerto:

| Clave | Dónde se pinta |
|---|---|
| `ui.js:27-28` «Siempre gratis / sin paywall» | `Onboarding.jsx:150`, tercera columna de una placa de **tres** |
| `ui.js:219-220` «Always free / no paywall» | la misma, en inglés |
| `ui.js:38` «No hay servidor» | `SupportModule.jsx:217` |
| `ui.js:40` «localStorage únicamente» | `SupportModule.jsx:222` |

**Dos hallazgos que corrigieron el plan antes de escribir una línea:**

1. **La trampa de s144 NO aplica aquí.** Las claves EN de `ui.js` son **literales**
   dentro de un `Object.assign`, no posicionales sobre un array. El riesgo de
   desplazar traducciones no existía en este archivo. (Se comprobó igualmente al
   cerrar: ver §4.)
2. **La auditoría proponía reescribir los tres slots**, y los otros dos («Todo local /
   en tu navegador», «Sin cuentas / sin registro») **siguen siendo ciertos y son más
   cortos** que sus sustitutos. Se tocó solo el tercero.

### La referencia de tono, delante — y la que ya estaba escrita

El listón lo puso el propio repo: `support.title` ya dice **«El núcleo de PACE es
gratis. Y lo seguirá siendo.»**, y `premium.tweaks.body` ya dice «compra única, sin
cuentas ni suscripción obligatoria». Lo que no sobrevive a v1.0 pagada no es la
gratuidad del núcleo: es el **absoluto** — «siempre» + «sin paywall».

Se presentaron tres opciones con sus contras. El usuario eligió **«Núcleo gratuito»**
(la de la §7.1 de la auditoría) asumiendo que es más abstracta, y luego recortó el sub
a **«disponible»** a secas.

| | Antes | Ahora |
|---|---|---|
| ES | Siempre gratis / sin paywall | **Núcleo gratuito / disponible** |
| EN | Always free / no paywall | **Free core / available** |

### Los claims de servidor: opción (ii), reformular ya

`«No hay servidor»` y `«localStorage únicamente»` **hoy son ciertos** — el Worker de
licencia no existe. El usuario eligió reformularlos **ahora**, a algo que siga siendo
verdad después, y no volver a tocarlos:

| | Antes | Ahora |
|---|---|---|
| `support.lede` ES | No hay cuentas. **No hay servidor**. No te sigue nadie. | No hay cuentas. **Tus datos no salen de aquí**. No te sigue nadie. |
| `support.lede` EN | No accounts. **No server**. No tracking. | No accounts. **Your data stays with you**. No tracking. |
| `support.value.local.sub` | localStorage únicamente / localStorage only | **en tu dispositivo** / **on your device** |

**Uno se dejó a propósito.** `tweaks.data.note` («El backup es un archivo JSON local —
sin servidor, sin cuenta») **no se toca**: su «sin servidor» modifica al *backup*, no a
la app, y seguirá siendo cierto con la licencia puesta. No es un claim absoluto.

---

## 2. El copy aprobado destapó un defecto de layout — y no era del copy

Al medir la placa por DOM a 360 px (el suelo documentado en `DESIGN_SYSTEM.md`), la
primera opción elegida rompía la fila:

- La columna da **85 px** de texto útil.
- «Lo esencial, gratis» mide **87,9 px** y «The essentials, free» **91 px** ⇒ ambas
  envuelven a dos líneas.
- Y al envolver, su `sub` caía **8 px por debajo** del de sus hermanas.

**La causa no era el texto: era `valuesPlate` con `alignItems: 'center'`.** Cada
columna se centraba por su cuenta, así que la más alta arrastraba su sub. Es
exactamente el defecto que s147 corrigió en el sello de Logros («el sello flotaba con
el largo de la descripción»), en otra superficie.

**El arreglo, no el recorte:** la placa pasa a `alignItems: 'stretch'`, cada columna a
`flexDirection: 'column'` y el label a `flexGrow: 1`. El label absorbe el alto sobrante
⇒ los tres subs quedan a la misma altura **y no se añade ni un píxel de aire cuando
ninguno envuelve**. Regla de alturas reservadas de s119, aplicada donde faltaba.

Se conserva aunque el copy final ya no envuelva: la fragilidad era real y la muerde
cualquier label largo, en cualquiera de los dos idiomas.

**Y el copy final tampoco pasó sin medirse.** «siempre disponible» medía **84,1 px de
85** — 0,9 px de margen, que la ventana de `font-display:swap` (Georgia es más ancha)
se come. Recortarlo a «disponible» lo dejó en **45,7 px**. El recorte lo pidió el
usuario; la medición explica por qué era la decisión correcta.

---

## 3. El README — y el que no estaba en el encargo

### 3.1 Existe un `README_EN.md`, y estaba peor

No figuraba en el plan del frente. Estaba en **v0.18.0**, sin tocar desde `ed1e0a4`, y
—lo que importa— **s149 corrigió la sección de licencia solo en el README español**:
el inglés seguía vendiendo «**Lifetime, Pase (monthly pass) and Seasons**», el modelo
de cuatro vías **descartado en s134**. La contradicción comercial que s149 dio por
cerrada seguía publicada, en el idioma del mercado.

### 3.2 Dos enlaces rotos en los dos escaparates

Ambos README enlazaban a **`HANDOFF.md`** y **`docs/porting.md`**. Ninguno de los dos
existe en el repo.

### 3.3 La tabla de «5 ejes de personalización» era falsa en cuatro filas

Contrastada contra el código:

- **Timer** (aro·barra·analógico) → `SHOW_TIMER_STYLE = false` en `app/flags.js`.
- **Círculo de respiración** (…·orgánico) → `SHOW_BREATH_ORGANICO = false`.
- **Tipografía** y **Layout** → ejes dormidos **sin control en Ajustes desde s20**
  (`DESIGN_SYSTEM.md`).

De los cinco ejes anunciados, **solo la Paleta tiene control**. La tabla se sustituye
por lo verificable (paleta + idioma) y un bloque que explica las banderas y **remite a
la cabecera de `flags.js` antes de borrar nada**.

### 3.4 Otras afirmaciones que ya no eran ciertas

- «**Nada de build step, nada de npm**» → hay `npm run build` y `npm run verify`, con
  ocho devDependencies.
- «**Babel standalone transpila JSX en navegador**» → **solo en desarrollo**; el build
  compila por adelantado y retira Babel del artefacto.
- «Build entregado: `PACE_standalone.html`» → el canónico es **`index.html`** desde
  s134; el standalone es export bajo demanda.
- Conteos: Respira **12 → 20**, Mueve **7 → 14**, Estira **7 → 14**, Logros **100 →
  96** (88 con detector, 58 con arte). Sin Caminos, sin onboarding, sin PWA, sin
  premium, sin constructor de rutinas.

**Todos los números se midieron del árbol**, no se copiaron de `STATE.md`.

### 3.5 Lo que se escribió

Los dos README reescritos y en paridad, con: estado v0.84.0, tabla de módulos con
cifras reales, estado por área, cómo compilar y verificar, stack corregido, estructura
real, personalización verificable, bloque **Gratuito y Premium** coherente con el copy
de la app, disclaimer de que Mueve/Estira no son consejo médico, y la sección de
licencia sin las cuatro vías. Se retiró la nota autorreferencial de s149 («el resto de
este README sigue muy desactualizado; se corrige en el frente de presentación
pública») — ese frente es este.

**Comprobación:** los **18 enlaces relativos** de los dos archivos resuelven a un
fichero existente. **0 rotos.**

---

## 4. Verificación

**`npm run verify` PASA — 0 problemas en 4,2 s.** 45 `.js` + 72 `.jsx` sin errores de
sintaxis · build en 0 · `index.html` del disco = build de las fuentes
(`923DA70C0C358B6F`) · 98 módulos = 98 bloques · 97 archivos de `app/` declarados sin
huérfanos · ningún identificador sin ligar · **versión v0.84.0 coherente en los tres
sitios** · `PACE_standalone.html` restaurado byte a byte (`998E3E358D689036`).

**i18n — la comprobación que sí tocaba aquí.** El diff de `ui.js` se redujo a pares
clave a clave: **4 claves × 2 idiomas, cada una una vez como `-` y una vez como `+`**.
Cero claves añadidas, cero retiradas ⇒ paridad ES/EN intacta por construcción.

**Sobre `index.html`, con SW y cachés purgados y estado limpiado desde la página viva:**

- `typeof Babel === 'undefined'`, **0** scripts `text/babel`, `<title>` y
  `PACE_VERSION` en v0.84.0.
- **Onboarding de primera vez**, placa medida por DOM a **360 px**: las tres etiquetas
  en **una línea** y los tres subs en **el mismo `top` (447,9)**. En **EN** igual
  (`top` 469). Sin scroll horizontal.
- **Superficie de Soporte** abierta: pinta el lede y el valor nuevos en ES.
- Las **6 cadenas** resueltas desde `PACE_STRINGS` en los dos idiomas.
- **Pomodoro** 25:00 → **24:58** y pausa correctamente.
- **Hidrátate** +1 → **2/8**, **persiste tras recargar**, y **`first.sip` se
  desbloquea** (Logros 0/88 → **1/88**, que sobrevive a la recarga).
- **Logros** abre con **54 sellos pintando su máscara**.
- **Paleta** crema → oscuro: `data-palette="oscuro"`, fondo `rgb(29,26,20)`, tinta
  `rgb(237,229,211)` — los valores de `DESIGN_SYSTEM.md`.
- **Consola sin errores** (los avisos de Babel son el buffer stale conocido).

### Trampa propia, anotada para no repetirla

Estuve a punto de reportar **Hidrátate roto**. Dos falsos negativos seguidos:

1. Un `.click()` sintético sobre el botón no disparaba el handler.
2. El click por `ref` aterrizó en **x=724** cuando el botón ocupa **484–643**: falló el
   blanco.

Antes de escribir «regresión» comprobé el estado por debajo: **`addWaterGlass()`
llamado directo funcionaba** (0 → 1). Un click de ratón en las coordenadas reales
funcionó también. **No había bug.** La lección es la del repo: si el síntoma dice
«roto» y la causa no aparece, sospechar del instrumento antes que del código — y
además, `\d{2}:\d{2}` me hizo leer el **reloj del sidebar** («ahora · 22:10») como si
fuera el timer del Pomodoro.

---

## 5. Lo que NO se tocó

- `tweaks.data.note` (§1) — su claim está acotado al backup y sobrevive a la licencia.
- Los **4 commits con `Co-Authored-By`** que ponen a Claude en Contributors: sigue
  siendo decisión del usuario (a/b/c en el backlog), porque limpiarlo exige reescribir
  historial y force-push sobre un repo publicado.
- `MONETIZATION.md`: ya tiene su banner de histórico desde s149; los README ahora
  enlazan con la advertencia explícita en vez de callarla.

---

## 6. Estado al cerrar

Frente B **cerrado**. De la lista de s149 quedan abiertas **D3** (sidebar racha+récord
contra §37-bis), **D6** (Travesías con mapa) y **D7** (spike de Capacitor). El
siguiente frente natural es la **segunda tanda de la red de seguridad** —integridad de
catálogos, i18n, precache y glifos—, que es la que el YAML de CI tendría que invocar.
