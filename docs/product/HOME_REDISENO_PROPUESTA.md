# Propuesta de revisión de la home de PACE

> **Estado: PENDIENTE DE VALORAR — NO implementar como parte de la sesión actual.**
> Capturada en s117 para no perderla. Dirección conceptual **aprobada** (solapamiento
> editorial intencional, opción A); la implementación se tratará como una **fase
> propia de responsive + jerarquía del home**, no como un ajuste rápido de CSS.
> Antes de tocar código: inspeccionar la estructura real del timer y del Camino,
> fijar la invariante de solapamiento y resolver una **única fuente de geometría
> responsive** (para no arreglar la captura actual y que vuelva a romperse en Safari
> móvil o a otra altura).

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
