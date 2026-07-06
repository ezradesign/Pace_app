# PACE · Bundle para design-sync

Librería de **previews autocontenidas** del design system de PACE, lista para
sincronizar con un proyecto **Design System de claude.ai/design** vía
`/design-sync` (herramienta `DesignSync`).

Cada `.html` es un *preview card* independiente: lleva sus tokens inline (de
`app/tokens.css`) y los mismos tipos (EB Garamond italic display + Inter Tight
UI), así que renderiza idéntico a la app sin dependencias.

## Cómo sincronizar (en tu máquina local, no en sesión hospedada)

```
$ cd "<...>/Pace_app"
$ claude
› /login          # OAuth con tu cuenta claude.ai (con Claude Design)
› /design-sync    # lista proyectos → plan → sube/registra estos previews
```

`localDir` para el sync = `design-system/`.

## Contenido (18 previews)

| Path | Grupo | Asset sugerido | Fidelidad |
|---|---|---|---|
| `foundations/colors.html` | Colors | Paleta tierra (crema + oscuro) + acentos + `--premium` | 1:1 tokens |
| `foundations/typography.html` | Type | Escala display (serif italic) + UI | 1:1 |
| `components/buttons.html` | Components | Button — 4 variantes × 3 tamaños | 1:1 |
| `components/primitives.html` | Components | Card · Tag · PremiumSeal · Meta · Divider | 1:1 |
| `components/routine-card.html` | Components | RoutineCard — libre / premium / con seguridad | 1:1 |
| `components/activity-bar.html` | Navigation | ActivityBar — 4 chips editoriales (1 activo) | 1:1 |
| `components/timer-dial.html` | Components | TimerDial — aro de progreso + cifra (Foco) | 1:1 |
| `components/breathe-visual.html` | Components | BreatheVisual — flor / pulso / ondas | 1:1 |
| `components/session-screens.html` | Screens | SessionShell — pantallas prep / done | 1:1 |
| `components/modal.html` | Components | Modal — backdrop + card + seguridad | 1:1 |
| `components/hydrate.html` | Screens | Hidrátate — tracker de vasos + barra | 1:1 |
| `components/break-menu.html` | Screens | BreakMenu — 3 micro-pausas (Para ti) | 1:1 |
| `components/welcome.html` | Screens | WelcomeModal — bienvenida de primera vez | 1:1 |
| `components/toast.html` | Components | Toast — logro desbloqueado | 1:1 |
| `components/achievement-seal.html` | Components | Seal — desbloqueado / por cazar / pronto / secreto | 1:1 (glifos placeholder) |
| `components/suggested-path.html` | Navigation | SuggestedPathCard — favorito + sugerido | 1:1 |
| `components/sidebar.html` | Navigation | Sidebar — Ritmo / Sendero / Logros | aprox. |
| `components/stats.html` | Screens | Ritmo — barras Semana + heatmap Año | aprox. |

**Fidelidad:** *1:1* = estilos/tokens copiados del componente real. *aprox.* =
reconstrucción fiel al lenguaje visual (sidebar y stats tienen lógica/SVG
generativo; los previews capturan el aspecto, no cada píxel). Los **glifos de
logro** son placeholders simples — los reales viven en
`app/glyphs/achievement-glyphs.jsx` (SVG por logro).

> Fuente canónica de los tokens: [`app/tokens.css`](../app/tokens.css) ·
> documentación: [`DESIGN_SYSTEM.md`](../DESIGN_SYSTEM.md). Si cambian los
> tokens, regenerar estos previews para mantener el sync fiel.

## Registro de assets (referencia para `register_assets`)

```
Colors          foundations/colors.html         720×560  group="Colors"
Type            foundations/typography.html     720×620  group="Type"
Buttons         components/buttons.html         720×420  group="Components"
Primitives      components/primitives.html      720×440  group="Components"
RoutineCard     components/routine-card.html    940×460  group="Components"
ActivityBar     components/activity-bar.html    940×220  group="Navigation"
TimerDial       components/timer-dial.html      460×460  group="Components"
BreatheVisual   components/breathe-visual.html  820×320  group="Components"
SessionScreens  components/session-screens.html 940×460  group="Screens"
Modal           components/modal.html           640×480  group="Components"
Hydrate         components/hydrate.html         580×520  group="Screens"
BreakMenu       components/break-menu.html      760×420  group="Screens"
Welcome         components/welcome.html         600×520  group="Screens"
Toast           components/toast.html           420×200  group="Components"
AchievementSeal components/achievement-seal.html 640×260 group="Components"
SuggestedPath   components/suggested-path.html  860×220  group="Navigation"
Sidebar         components/sidebar.html         360×560  group="Navigation"
Stats           components/stats.html           860×260  group="Screens"
```
</content>
