# Propuesta de revisión de la home de PACE

> ## Historia de este documento (leer antes que nada)
>
> | Etapa | Qué fue | Estado |
> |---|---|---|
> | **Propuesta inicial (s117)** | Documento capturado para no perder la dirección: solapamiento editorial intencional (opción A), jerarquía y una única fuente de geometría responsive | **HISTÓRICA** — dirección conceptual aprobada; el texto de abajo se conserva como razonamiento fundacional |
> | **Implementación s122 (v0.65.0)** | Claridad UX: sistema verbal, «FOCO MANUAL» dentro del círculo, tarjeta que se explica sola, jerarquía §1, solapamiento por `transform` con gate ≥760px | **VIGENTE** en lo editorial; el gate binario de solapamiento fue sustituido en s123 |
> | **Implementación s123 (v0.66.0)** | Modelo «atardecer»: aro por altura útil `min(86vw,520px,max(300px,58dvh))`, solapamiento por `margin-top` negativo adaptativo hasta el 19 % de D, jerarquía = orden del DOM, barra de scroll oculta | **VIGENTE SOLO EN MÓVIL/TABLET (≤768px)**; superada en Desktop por s126 |
> | **Revisión actual s126 (v0.69.0)** | Home **Desktop**: composición proporcional (D por ALTURA), solapamiento nominal **16 %** de D y **recorte real del aro** en la línea del horizonte (`clip-path` sobre el marco) | **VIGENTE** en Desktop (≥769px) |
>
> **Regla anterior SUPERADA (no borrada).** El §0 de abajo describe el solapamiento como
> «margen negativo responsive con `clamp()`» y s123 lo implementó con un limitador que
> reducía progresivamente el solapamiento hasta ~7–12 % en pantallas bajas. **En Desktop esa
> regla ejecutable ya no rige**: el solapamiento es 16 % nominal de D (tolerancia 0.14–0.17)
> con el CICLO como techo de seguridad, y el aro se **recorta** en el horizonte en lugar de
> quedar dibujado entero por detrás. La invariante conceptual —la tarjeta/las Actividades
> entran sobre la zona decorativa inferior del círculo y **nunca** tapan timer, controles ni
> indicador de ciclo— **sigue intacta**: es justo lo que garantiza el techo de seguridad.
>
> **Regla anterior SUPERADA (scroll).** s123 fijó «se prefiere scroll vertical antes que
> encoger el aro». En Desktop con altura útil ≳672px el criterio vigente es **sin scroll**
> (`overflowV ≤ 2px`), logrado dimensionando D por la altura disponible y **sin** tocar el
> suelo de 44px del CTA. Por debajo de ~672px se degrada el solapamiento (nunca el CICLO) y
> se conserva el scroll de seguridad.
>
> Contrato ejecutable vigente: `DECISIONES_PRODUCTO.md` → «Home Desktop · composición
> proporcional y horizonte (s126)» y `AUDITORIA_SISTEMA_PACE.md` §32.6.
> Implementación: [`session-126`](../sessions/session-126-home-desktop-horizonte.md).
>
> Lo que sigue por debajo es el documento original de s117, **conservado como historia**.

---

## 0. Invariante visual (el núcleo)

La clave no es mantener los mismos píxeles en todas las pantallas, sino conservar
esta invariante:

> **La tarjeta de Camino entra ligeramente sobre la zona decorativa inferior del
> círculo del timer, pero NUNCA tapa el timer, sus controles ni el indicador de
> ciclo.**

Hoy funciona por coincidencia de viewport. Al implementarlo debe convertirse en una
**relación estructural entre componentes**, no en coordenadas para una resolución
concreta.

### Cómo debe comportarse

1. **No posicionar con coordenadas absolutas.** Nada de `position:absolute; top:620px`
   ni desplazamientos calculados para una resolución. La tarjeta permanece en el
   flujo normal, inmediatamente después del bloque del timer, y se solapa mediante un
   **margen negativo responsive**.
   ```
   TimerSection
   ├── Presets
   └── TimerCircle
   SuggestedPathCard      ← sigue en el flujo; solo su margin-top la sube
   ActivitiesSection
   ```
2. **Solapamiento fluido y limitado** con `clamp()`:
   ```css
   --path-overlap: clamp(12px, 3vw, 28px);
   margin-top: calc(-1 * var(--path-overlap));
   ```
   - móvil pequeño: ~12–16px · móvil grande/tablet: ~16–22px · escritorio: máx ~24–28px.
   - No debe escalar indefinidamente con la pantalla.
3. **Círculo responsive, no escalado artificial.** `aspect-ratio: 1`; diámetro =
   mínimo entre (ancho disponible, altura útil disponible, tamaño máximo de diseño).
   No usar `transform: scale()` (cambia el tamaño sin reservar espacio en el layout).
   En móvil usar `svh`/`dvh` con fallback (`100vh` salta cuando aparecen/desaparecen
   las barras del navegador).
4. **Zona de seguridad** entre el indicador `CICLO` y el borde superior de la tarjeta
   (~32–48px según viewport). Si una pantalla es demasiado baja, **primero se reduce
   el círculo**, no se aumenta el solapamiento.
   > La tarjeta NUNCA tapa: el tiempo · el subtítulo · el botón Comenzar · reset ·
   > puntos/indicador de ciclo.
5. **Capas explícitas:** círculo = capa base; tarjeta = capa superior con fondo
   opaco, `z-index` explícito, borde definido, sombra muy sutil y contexto de
   apilamiento local (no depender del orden accidental de pintado).
6. **Tarjeta centrada** respecto al timer y a las actividades; ancho fluido
   (`width: calc(100% - márgenes)`, `max-width: ancho del contenido`). No calcular su
   posición con el centro/radio del círculo vía JavaScript: se resuelve con CSS.

### Comportamiento por formato
- **Escritorio:** círculo grande con máximo; solapamiento ~24px; Camino en una línea
  editorial; CTA a la derecha; actividades debajo con separación clara.
- **Móvil vertical:** círculo reducido fluidamente; solapamiento 12–16px; tarjeta
  algo más alta (título/desc/metadatos arriba, CTA debajo); actividades en `2×2`;
  scroll natural.
- **Móvil horizontal / portátil bajo (el caso difícil):** reducir el diámetro según
  la altura; solapamiento pequeño; NO ocultar controles; permitir que la tarjeta
  continúe fuera del primer viewport; no comprimir tipografías hasta ilegibles; no
  forzar toda la home en una pantalla.

### Zoom y tamaño de fuente
Debe sobrevivir a zoom 80/100/125/150/200%, tamaño de fuente aumentado, ES y EN,
títulos largos, barras móviles abiertas/cerradas. A partir de cierto zoom es correcto
que aparezca más scroll; lo importante es que **no haya colisiones ni elementos
tapados**.

### Criterios de aceptación del solapamiento
- [ ] La tarjeta se superpone intencionalmente al círculo en todos los viewports.
- [ ] El solapamiento cambia dentro de límites definidos (no desaparece ni crece sin control).
- [ ] La tarjeta permanece en el flujo normal.
- [ ] Sin coordenadas absolutas específicas de una resolución.
- [ ] Sin JavaScript para calcular la posición.
- [ ] No tapa controles del timer.
- [ ] El círculo conserva proporción `1:1`.
- [ ] No se usa `transform: scale()` para el responsive.
- [ ] Sin saltos cuando cambia la barra del navegador móvil.
- [ ] La tarjeta queda por encima mediante una capa explícita.
- [ ] Sin scroll horizontal.
- [ ] ES y EN sin truncamiento.
- [ ] Con zoom 200%, todo accesible aunque requiera scroll.

---

## 1. Jerarquía

Orden propuesto: **1) Foco / timer · 2) Camino sugerido · 3) Actividades manuales
(Respira, Mueve, Estira, Hidrátate).** Caminos se presenta como experiencia guiada y
recomendada; las actividades quedan como accesos manuales secundarios.

## 2. Solapamiento editorial
(Dirección aprobada — ver §0.)

## 3. Camino sugerido
La tarjeta debe explicar mejor qué representa:
- Añadir «Camino recomendado» o «Para ahora».
- Mostrar duración o nº de pasos.
- Diferenciar su CTA del CTA del timer: timer «Comenzar» · Camino «Iniciar camino».
- Aclarar «Ver todos» → preferiblemente «Ver caminos».
- Hacer comprensible la secuencia sin depender solo de iconos pequeños.

Ejemplo:
```
CAMINO RECOMENDADO · 12 MIN
Lámpara de Mesa
Un círculo de luz, todo lo demás en penumbra.
Respira · Foco · Estira
[Iniciar camino]
```

## 4. Timer
- Mantenerlo como elemento dominante; evaluar reducir ligeramente el diámetro máximo.
- Aumentar áreas táctiles de 15/25/35/45/Otro; diferenciar «MIN» de las opciones.
- Aclarar el icono de reset (tooltip + `aria-label`).
- Considerar «Ciclo 1 de 4» además de los puntos.
- Mantener zona segura inferior para el solapamiento.

## 5. Actividades
- Debajo de Caminos; no fijarlas al borde inferior; scroll natural.
- Revisar el orden de lectura Respira/Mueve/Estira/Hidrátate.
- Toda la tarjeta interactiva; áreas táctiles ~44px; estados hover/focus/pressed.

## 6. Accesibilidad
- Contraste de textos secundarios e iconos; evitar textos significativos muy pequeños.
- Aumentar áreas pulsables sin alterar necesariamente el tamaño visual.
- Navegación por teclado; labels accesibles en los iconos superiores.
- Zoom hasta 200%; tamaño de fuente aumentado; ES y EN.

## 7. Backlog visual relacionado
- Corregir las pills **Breve / Tranquilo / Amplio** de Tweaks.
- Evitar que la carcasa de **Estadísticas** cambie de tamaño al alternar Semana / Mes
  / Año. La carcasa puede variar entre viewports, pero debe permanecer estable entre
  pestañas del mismo viewport.

## 8. Viewports de aceptación
`360×640 · 390×844 · 412×915 · 844×390 · 1024×512 · 1280×600 · 1440×900`

Probar también: Chrome, Firefox, Edge, Safari · Chrome Android, Safari iOS · zoom
80/100/125/150/200% · barras móviles visibles/ocultas · ES y EN · contenido largo ·
sin scroll horizontal.
