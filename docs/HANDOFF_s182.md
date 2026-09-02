# HANDOFF s182 → s183 · Lo que queda, sin nada que rescatar

> **v0.114.0 está PUBLICADA y el árbol queda LIMPIO tras el commit.**
> `npm run verify` en verde, **185/185** en local, `index.html` al día con las
> fuentes. Esto es una cola de trabajo, no un rescate.

---

## 0 · Estado exacto

| | |
|---|---|
| Última versión | **v0.114.0** |
| Suite | **185/185** (eran 173) · `npm run verify` verde |
| `index.html` | al día con las fuentes |
| `PACE_standalone.html` | intacto (congelado desde s134) |
| CI | **por comprobar tras el push** — los dos jobs (`verify` + `e2e`) |

Revisión del cajón de móvil, con el antes, las opciones y el resultado:
**https://claude.ai/code/artifact/b5fd147d-e245-4d0a-9027-0649a3e71852**

---

## 1 · Lo que s182 cierra, para que nadie lo vuelva a abrir

- **375×844 NO es un defecto de la app.** Verificado: `right = 375`,
  `scrollWidth − clientWidth = 0`, 0 px fuera de la primera pantalla. El corte
  era del carrusel horizontal de la página de revisión de s181. **No lo
  persigas.**
- **El cajón de móvil ya escala**, con suelo `SUELO_CAJON = 0,80`
  (`app/shell/Sidebar.escala.jsx`). Cabe entero de 667 para arriba; a 360×560 se
  desplaza **101 px** y a 360×640, **21** (que es sólo el padding), con la barra
  oculta. **Eso es la decisión del usuario, no un pendiente.**
- **El aire de la tarjeta «Para ahora»** está recortado a 8 px **sólo en el
  cajón**. En escritorio sigue en 16 y no se toca (s180 lo afinó mirándolo).
- **Los glifos: no falta nada nuevo.** 62 identidades · 59 con arte · 3 sin
  (`Nordics`, `Pica en escritorio`, `Rana`) · 0 de arte huérfana. Las tres
  rutinas de oficina de s178 reutilizan ejercicios que ya tenían arte, 15 de 15
  pasos. El censo que lo cuenta **estaba ciego a Estira desde s178** y ya está
  arreglado; el documento regenerado sale idéntico byte a byte.

---

## 2 · LO PRIMERO: el único defecto medido y sin arreglar

**Con la app en inglés, el título del último logro sale en español** («Regresas»
en vez de «You return»).

- **Dónde:** `achMini()` en `app/shell/Sidebar.parts.jsx` devuelve `a.title`
  sin pasar por i18n.
- **Cómo se hace bien, en el mismo repo:** `Achievements.jsx:232` usa
  `tR('ach.item.' + a.id + '.title', a.title)`.
- **La traducción ya existe:** `app/i18n/content/achievements.js:37`.

Es pequeño, está localizado y **está publicado**. Viene arrastrado de s181.
Cuidado al arreglarlo: la suite no cubre inglés (lo declara), así que **el aserto
hay que escribirlo**, y el sitio natural es `tests/logros-i18n.spec.js`.

---

## 3 · La cola, tal como quedó

### Sidebar, cosas que el usuario dejó «así de momento» (no son defectos)

1. **La pill naranja de «Mis rutinas»** es lo más llamativo de la columna (fondo
   tintado + borde a plena fuerza). Quitarle el fondo la calmaría sin dejar de
   ser naranja.
2. **Dos cosas de su maqueta que NO se copiaron**, porque avisó de que algún
   elemento podía no estar bien colocado: en su imagen **no aparece el lema** y
   **«Ver la colección» va a la derecha**.

### Contenido

3. **La cola de s178, intacta**: ejercicios de oficina que **hoy no existen** en
   el catálogo — **gemelo de pie** (no hay estiramiento de gemelo, sólo
   `Elevación de talones`, que es fuerza), **flexor de cadera contra la mesa** (el
   único que hay pide arrodillarse) y **aductores sentado**. Cada uno nace con su
   dibujo. Y **`move.chair.antidote` sigue pendiente de decisión**: de sus seis
   pasos sólo `Flexor de cadera` pide suelo, y por él la rutina que se llama
   «Antídoto silla» queda FUERA del chip «Aquí mismo».
4. **El tercer chip «Discreta»** (14 de 20), la última pregunta viva de s176.
   **Hay que pintarlo antes de preguntar.**

### Lo grande

5. **CTB**, fuera de v1, con permiso para un **prototipo técnico**. Nada tocado.
6. **FASE 4 · Stats de verdad.** s177 arregló el ancho; el destino de
   `STATS_DESTINO_PROPUESTA.md` sigue entero.
7. **La música.** Los seis briefs necesitan el requisito que faltaba —**el grueso
   de la energía entre 200 Hz y 2 kHz**— y los términos de uso comercial siguen
   sin verificar.
8. **El arte**: `Rana`, `Pica en escritorio` y los **19** glifos de logro.
   (`Nordics` sigue **fuera** de la cola por decisión de s173: sólo vive en el
   constructor y ya tiene SVG.)
9. **FASE 8 · onboarding contextual.**

### Abierto y dicho, no escondido

- La rama **«CONTINÚA»** de la tarjeta es **inalcanzable** hasta que los Caminos
  se puedan pausar. Escrita y **sin probar**.
- Por debajo de **~575 px de alto en móvil el runner SIGUE SOLAPANDO** (s179): lo
  único que queda por encoger es el glifo, y la fuente única de s177 lo prohíbe.
  **Es decisión del usuario.**
- **D-1, D-2 y D-3** siguen vivas (no urgentes, decisión suya).
- Que el agua sola no enciende el día **ya no lo dice ninguna superficie**.

---

## 4 · Trampas vigentes (las de s182, además de las de `STATE.md`)

- **UN NÚMERO HEREDADO SE VUELVE A MEDIR, AUNQUE LO HAYA ESCRITO YO.** Van **dos
  sesiones seguidas** con un número falso en el handoff. El de s181 («0,85 cubre
  de 667 para arriba») estaba calculado sobre el **viewport** en vez de sobre el
  **hueco**: faltaban los 45 px del propio cajón.
- **UN BANCO NO PUEDE LIMPIAR LO QUE EL PRODUCTO ESCRIBE.** El de s182 borraba
  `--sb-escala` entre variantes y fotografiaba su propio borrado: dio «factor 1»
  sobre una app que en vivo estaba a 0,8083. Lo que lo arregla de verdad no es la
  recarga sino **cruzar dos instrumentos** y parar si no coinciden. Señal previa:
  **una tabla que se contradice a sí misma**.
- **NO CORRAS TRABAJO PESADO ENCIMA DE LA SUITE.** Con dos procesos node al lado,
  el run pasó de ~1,5 min a **31,3** y salieron **2 rojos por timeout que no eran
  del producto**. Corridos solos, esos dos tests pasan en 1,1 s y 1,6 s.
- **Backticks dentro del template literal del CSS** de `Sidebar.hoja.jsx`: van
  **cinco**. Los comentarios nuevos citan con «comillas latinas».
- **Las comillas dobles del shell ejecutan los backticks**, y aquí mordió al
  inyectar código con `node -e "…"`: se comió un template literal entero y dejó
  un `return ;`. **Y el heredoc `<<'EOF'` falló dos veces** con contenido largo
  («unexpected EOF»). **Escribe archivos con la herramienta de escritura**, no
  por shell.
- **`page.setViewportSize()` no emite `resize`** y el `ResizeObserver` no dispara
  en headless. En un spec nuevo, **un `describe` por viewport con `test.use`**
  evita el problema entero: la página nace en su tamaño.
- **Un mutante que no muerde puede ser el mutante equivocado.** Vaciar
  `EXTRA_ROUTINES` en `extra.data.js` no deja el catálogo a cero, porque
  `extra.data.piernas.js` añade sus grupos con `Object.assign`.
- **Un aserto que le pregunta el número a la app** (bien: no caduca) **no puede
  cazar un número malo**. Hace falta además un aserto con un límite externo — en
  este caso, WCAG 2.2 AA.
- **`node build-standalone.js` reescribe el standalone congelado**: copiarlo
  antes y restaurarlo después.

---

## 5 · Prompt para arrancar s183

```
Sesión s183 de PACE. Lee CLAUDE.md, STATE.md y DESIGN_SYSTEM.md como manda el
arranque, y después docs/HANDOFF_s182.md, que trae la cola.

Estado: v0.114.0 publicada, CI a comprobar tras el push, árbol limpio,
185/185. No hay nada que rescatar.

Lo que s182 ya cerró y NO hay que reabrir: 375x844 no es un defecto de la app
(verificado); el cajón de móvil ya escala con suelo 0,80 y el scroll que queda
a 560 y 640 es la decisión del usuario; el aire de la tarjeta está recortado
sólo en móvil; y de glifos no falta nada nuevo (62 / 59 / 3).

Empieza por la §2: el único defecto medido y sin arreglar. Con la app en
inglés, el título del último logro sale en español — `achMini()` en
Sidebar.parts.jsx devuelve `a.title` sin pasar por i18n, mientras
Achievements.jsx:232 lo hace bien y la traducción ya existe. La suite NO cubre
inglés y lo declara, así que el aserto hay que escribirlo.

Después, la cola de la §3 la elige el usuario: la pill naranja, las dos cosas
de su maqueta que no se copiaron, los tres ejercicios de oficina que no
existen, el tercer chip «Discreta», Stats, la música, el arte o CTB.

Reglas que no se negocian aquí: el diseño se aprueba MIRÁNDOLO en una maqueta
o en el producto, nunca leyendo una tabla; toda opción que propongas se PINTA
antes de preguntar; ningún número entra en un documento sin haberlo medido en
esta sesión; y un número heredado de un handoff —incluido uno mío— se vuelve a
medir antes de decidir con él, que ya ha salido falso dos sesiones seguidas.
```
