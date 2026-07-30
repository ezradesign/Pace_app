# Sesión 140 — El banding de la atmósfera, medido donde ocurre

**Fecha:** 2026-07-30 · **Versión:** v0.73.0 → **v0.73.1** · Sesión de **CÓDIGO**.

Un solo frente: el banding de la atmósfera de sesión, lo único que s139 dejó
abierto. Se cierra, y de paso quedan **desmentidas las dos hipótesis** con las
que s100, s138 y s139 estuvieron trabajando.

---

## 0 · Por qué tres sesiones no lo resolvieron

Las tres midieron el **tile de ruido** rasterizándolo en un `canvas`. Es una
medida real, pero de la pieza equivocada: no dice nada de lo que el compositor
hace con esa pieza al pintarla sobre un degradado ya rasterizado. El encargo del
usuario para esta sesión fue explícito —**medir los píxeles reales de la
página**— y ahí es donde aparecen las dos causas.

### Banco de medición

Sin dependencias nuevas: Node 24 trae `WebSocket` global, así que se habla
**CDP** directamente contra un Chromium headless (Edge; no hay Chrome
instalado), y `sharp` —ya en el toolchain— lee los PNG.

| Pieza | Qué hace |
|---|---|
| `shot.js` / `shots.js` | lanza el navegador con **perfil nuevo**, conduce la app hasta una sesión de Respira real y captura PNG **sin pérdida**; admite varias variantes por arranque |
| `analyze3.js` | mide el banding sobre los píxeles capturados |
| `stretch.js` | recorta la franja y **estira el contraste** para verlo con los ojos |

Tres trampas del propio banco, todas encontradas y corregidas antes de sacar
conclusiones —importan porque cualquiera de ellas daba una conclusión falsa:

1. **Promediar por columnas rectas.** Las bandas son **arcos de la elipse** del
   `radial-gradient`, no líneas horizontales. Promediar en horizontal mezcla
   valores distintos del degradado: daba σ 8,3 que no era grano sino la
   variación lateral. Se corrigió proyectando cada píxel sobre la coordenada
   `t` del propio degradado y promediando por bins de `t` — es decir, a lo
   largo de la banda, que es como la integra el ojo.
2. **La meseta de 158 bins.** Caía en el tramo **0–12 %**, que es plano por
   diseño (dos paradas del mismo color), no en un escalón.
3. **Código stale.** Dos tandas dieron cifras **idénticas hasta el último
   decimal**: una instancia de Edge de la tanda anterior seguía viva en el mismo
   puerto y su Service Worker servía lo precacheado. Arreglado con puerto nuevo
   por tanda, `Network.setBypassServiceWorker` y un **centinela** que devuelve
   la huella del código vivo y aborta si no es el esperado.

---

## 1 · Las dos causas

### 1.1 · El grano no dithera: solo tapa

| Variante | Escalera (RMS) |
|---|---|
| Con grano | **0,314** |
| Sin grano | **0,318** |

Idénticas. El grano **no toca** la escalera. Un dither tiene que entrar *antes*
de la cuantización; este se compone encima cuando el degradado **ya** está
redondeado a 8 bits, así que como mucho enmascara el contorno. Todo lo que s100
y s138 ajustaron ahí —número de paradas, `baseFrequency`— actuaba sobre una
variable que no gobierna el fenómeno.

Y como enmascarador tampoco llegaba: σ **0,678** contra un escalón de **1,41**
niveles ⇒ ratio 0,48. Ruido que no alcanza a la mitad de lo que debe esconder.

### 1.2 · Apilar el mismo degradado dos veces duplica el escalón

`sessionAtmosphere` pintaba `grano, g, g, var(--paper)` — el **mismo** `g` dos
veces, para que el tinte se notara sin subir el alpha del token (s99). Los dos
redondeos caen en los **mismos radios** y se suman.

Medido sin depender de la geometría, contando qué niveles enteros existen de
verdad en el recorrido:

| | Niveles usados | Escalón |
|---|---|---|
| Dos capas (antes) | **17 de 24** | 1,41 |
| Una capa compuesta | **22 de 23** | **1,05** |

Siete niveles del recorrido **no llegaban a existir**. Ahí está por qué la
atmósfera era la peor de las tres superficies, y no era lo que s139 supuso
(repartir la rampa entre más píxeles): **su escalón valía el doble**.

---

## 2 · El arreglo

Dos mitades, y el orden importa: primero partir el escalón (estructural), luego
enmascarar lo que queda (perceptual). Enmascarar sin lo primero era pelear
contra un escalón doble.

### 2.1 · Alpha compuesto en UNA capa

Componer un color consigo mismo con alpha `a` da exactamente `1−(1−a)² =
a·(2−a)`. Se pide con **sintaxis de color relativo** sobre el propio token:

```js
'rgb(from ' + c + ' r g b / calc(alpha * (2 - alpha)))'
```

Clave para no romper nada: **el token sigue mandando**, así que cada módulo y
cada paleta conservan su alpha (Foco 0,10 · Respira 0,12 · oscuro 0,14). **No
se sube ningún alpha de tinte** — la regla de s100 queda intacta; lo que se
deja de hacer es redondear dos veces. Con `CSS.supports` se comprueba una vez si
el motor lo entiende (Chromium 119, Safari 16.4, Firefox 128) y si no, se cae a
las dos capas de siempre.

**De propina:** el doble redondeo sesgaba el wash hasta **1 nivel más oscuro**
que el color pedido. Ahora pinta el que es.

### 2.2 · Grano que sí enmascara

Tres cambios, ninguno sobre el alpha de un tinte:

- **`color-interpolation-filters='sRGB'`** — los filtros SVG van en linearRGB
  por defecto y se comían la mitad de la amplitud. El hallazgo es de s139;
  aquí se aplica.
- **Alpha constante** en vez de ruidosa: la de s138 gastaba media —oscurecía—
  sin aportar σ.
- **Curva estirada** alrededor del mismo centro: más contraste da más σ por
  cada décima de media desplazada.

---

## 3 · Resultado medido (sesión de Respira real, 1280×720, dpr 1,25)

| | Antes | Después |
|---|---|---|
| Escalón | 1,41 (17 de 24 niveles) | **1,05** (22 de 23) |
| Escalera RMS · pico | 0,314 · 1,51 | **0,225 · 0,82** |
| Grano (σ) | 0,678 | **1,22** |
| **σ ÷ escalón** | 0,48 | **1,16** |
| Papel | 240,21 · 235,52 · 223,07 | 240,51 · 235,51 · 222,51 |

El ratio σ/escalón es el número que decide: el ruido pasa de tapar la mitad del
escalón a superarlo. Y el papel deja de **desaturarse**: antes el desvío era
desigual por canal (−1,79 rojo contra −0,93 azul), ahora es parejo — oscurece un
pelo, sin virar.

### Paleta oscura

| oscuro | Antes | Después |
|---|---|---|
| Escalón | 1,15 (20 de 23) | **1,05** (21 de 22) |
| Escalera RMS · pico | 0,148 · 1,05 | **0,113 · 0,78** |
| Papel (token 29 · 26 · 20) | 33,2 · 30,2 · 24,5 (**+4,2**) | **30,5 · 27,5 · 21,5** (+1,5) |

Hallazgo lateral: el velo gris de s138 **aclaraba el papel oscuro un 14 %**. Con
alpha constante el desvío cae a +1,5.

### Verificación visual

Recorte de la franja con el contraste estirado ×10 y ×20: el «antes» enseña los
arcos concéntricos con borde duro; el «después», ninguno. **El usuario confirmó
en vivo que ya no lo percibe en su PC en modo claro.**

Validado además que la cadena resuelve en las **tres paletas** (claro ·
oscuro · envejecido) y con los **seis tokens** de módulo (`--breathe-soft`,
`--move-soft`, `--extra-soft`, `--hydrate-soft`, `--focus-soft`,
`--achievement-soft`), que es el alcance real del helper: Respira, Mueve,
Estira, y los pasos y transiciones de Camino.

---

## 4 · Lo que NO funciona (para no reintentarlo)

- **Añadir paradas a la rampa.** El número de escalones lo fija el color, no la
  forma de la rampa.
- **Tocar `baseFrequency`.** No cambia la amplitud (medido en s139).
- **Tile opaco con `mix-blend-mode`** dentro de un subárbol con `opacity`:
  rompió el loto en s139. La regla sigue viva.
- **`background-blend-mode` sobre papel claro.** Ahora se sabe por qué el
  intento de s139 no resolvió nada: sobre un fondo casi blanco, `overlay`
  amplifica lo oscuro (ganancia 2b ≈ 1,86) y aplasta lo claro (2(1−b) ≈ 0,14),
  así que un ruido simétrico se convierte en un velo oscuro asimétrico. En
  fondos claros, el ruido va **por composición normal**, no por blend.

---

## 5 · Cambios en el árbol

| Archivo | Cambio |
|---|---|
| `app/ui/SessionShell.jsx` | `sessionAtmosphere` a una capa con alpha compuesto + `PACE_CAN_RELATIVE` (con caída) · `paceGrainUrl` reescrito (sRGB, alpha constante, curva) · `PACE_GRAIN_OPACITY` como constante única, que `PaceDither` también consume · bloque de comentario reescrito con lo medido (457 → 451 ln) |
| `app/state-core.jsx` · `PACE.html` · `sw.js` | bump v0.73.1 |
| `index.html` | regenerado |

`PACE_standalone.html` **no se regenera** (s134): se restauró byte-idéntico tras
el build — hash `998e3e358d689036` antes y después.

**Alcance del grano:** `PACE_GRAIN_OPACITY` gobierna también `PaceDither`, así
que el halo del loto y el círculo de retención heredan el grano nuevo (σ 0,678 →
1,22 en las tres superficies) sin tocar sus rampas, que ya eran de una capa.

---

## 6 · Consola

Limpia salvo el warning **preexistente de s116** (`PaceLogoImage` /
`BreatheSession`, `setState` en render), que pertenece a la Fase 8.5 y no se
persiguió.

---

## 7 · Decisiones del usuario tomadas en esta sesión

- **El aro de Respira se queda.** Queda anulado el ítem que s139 dejó apuntado
  (quitar el aro y subir el loto de `inset` 25,5 % a 14 %, +46,9 % de diámetro).
  El invariante y las medidas siguen en session-139 por si algún día se retoma,
  pero **no es un pendiente**.
- **README y «Contributors»**: sin tocar. Reescribir el historial para quitar
  los 4 `Co-Authored-By` sigue siendo decisión del usuario.
