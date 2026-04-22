# Sesión 19 — Pill consolidada y standalone autocontenido

**Fecha:** 2026-04-22
**Versión resultante:** v0.12.2
**Build entregado:** `PACE_App_1_38.html` (también disponible como
`PACE_standalone.html` dentro de esta carpeta)

---

## Contexto

La sesión 18 dejó el proyecto funcionalmente sólido pero con dos puntos
que ensuciaban la experiencia del panel de Tweaks:

1. **El botón de apoyo tenía 4 variantes de copy** (`cafe`, `pasto`,
   `vaca`, `come`) que mezclaban metáforas — tazas, césped, vaca
   comiendo, vaca con ayuda — sin un criterio claro de cuándo mostrar
   cuál. El usuario tenía que decidir una metáfora que, en realidad,
   no debería elegir: el producto ya tiene una identidad.
2. **El tweak "Logo de la vaca" ofrecía 5 variantes** (`pace`,
   `lockup`, `lineal`, `sello`, `ilustrado`). Salvo `pace` (oficial),
   el resto eran experimentos pre-v0.11.3 que quedaron como tweaks por
   inercia. Ningún usuario necesita elegir entre 5 logos.

---

## Decisiones

### 1 · Copy único del botón de apoyo

Las 4 variantes se consolidan en una sola:

```js
const SUPPORT_COPY_DEFAULT = {
  icon: 'cow',
  label: 'Da de pastar a la vaca',
  short: 'Da de pastar a la vaca',
  title: 'Da de pastar a la vaca',
  subtitle: 'Un gesto para que siga paciendo a su ritmo.',
};
```

**Por qué "pastar":**
- Enlaza directamente con el nombre del producto (PACE = pacer /
  pastar).
- Refuerza la metáfora central de la UI — la vaca del logo está
  pastando en el campo.
- "Dar de comer" es genérico; "pastar" es específico y evoca ritmo
  calmado, que es justo la filosofía del producto.

**Icono a la derecha, no a la izquierda:**
- Los botones web suelen tener el icono a la izquierda. Invertir el
  orden es intencional: el texto lleva la acción, el icono es la
  firma visual.
- Con el icono a la derecha, el ojo lee primero la frase completa y
  luego reconoce la vaca — coherente con la idea de que el gesto
  importa más que el símbolo.

### 2 · Tweak de logo retirado

El logo queda fijo en la variante oficial (`'pace'`). El campo
`logoVariant` se mantiene en `state.jsx` por compatibilidad con
localStorage de usuarios existentes, pero ya no es editable desde la
UI. Los logros `secret.seal` y `secret.illustrated` quedan dormidos
pero vivos en el código por si se reintroducen como easter egg.

### 3 · Standalone autocontenido

El `PACE_standalone.html` anterior referenciaba el logo como ruta
relativa `app/ui/pace-logo.png`, así que al abrir el bundle offline el
logo caía y se usaba el fallback `PaceLockup` SVG. Funcional, pero no
fiel al diseño.

**Solución:** se añade un `<img id="pace-logo-src" src="...">` oculto
en `PACE.html`, y `CowLogo.jsx` lee el `src` resuelto de ese elemento.
Cuando `super_inline_html` genera el bundle, automáticamente convierte
el `<img src>` en data URI, así que la variable JS hereda la data URI
sin más cambios. Solución limpia sin scripts de post-proceso.

---

## Archivos tocados

| Archivo | Cambio |
|---|---|
| `app/support/SupportModule.jsx` | 4 variantes → 1 sola; icono a la derecha en pill y CTA |
| `app/tweaks/TweaksPanel.jsx` | Retirados `logoVariant` y `supportCopyVariant` |
| `app/state.jsx` | Comentarios actualizados, default de `supportCopyVariant` → `'pastar'` |
| `app/ui/CowLogo.jsx` | `PACE_LOGO_URL` se resuelve vía DOM, no hardcoded |
| `PACE.html` | Añadido `<img id="pace-logo-src">` oculto para el inline |
| `PACE_standalone.html` | Regenerado con logo en data URI (~326 KB) |

---

## Pendiente / próximos pasos

- Ninguno de estos cambios rompe compatibilidad. Los usuarios con
  `logoVariant` distinto de `'pace'` o `supportCopyVariant` distinto
  de `'pastar'` en su localStorage no verán diferencia: los campos
  existen pero no se renderizan.
- Si en el futuro se quiere reintroducir variantes de logo como
  easter egg, el código está preparado: reactivar solo el switch en
  `CowLogo.jsx` y añadir trigger no obvio (ej. combo de teclas).

---

## Filosofía reforzada

Menos opciones, más identidad. Un producto calmado no debería pedir al
usuario que elija entre 5 logos y 4 copys para una acción secundaria.
Decide bien una vez y vive con ello.
