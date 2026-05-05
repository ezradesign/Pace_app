# PACE · Foco · Cuerpo

> Productivity and wellness web app for people who spend long hours sitting.
> Thoughtful micro-interventions throughout the day, not lengthy workouts.

**Status:** v0.18.0 · Pre-launch · Design iteration
**Build delivered:** `PACE_standalone.html` (~413 KB, self-contained)
**Author:** [@ezradesign](https://github.com/ezradesign)
**Code license:** [Elastic License 2.0](./LICENSE) — see [§ License](#-license)

---

## 🎯 What it is

PACE is an all-in-one wellness app for office and remote work. It combines:

| Module | What it does |
|---|---|
| **Foco (Focus)** | Configurable Pomodoro timer (15 / 25 / 35 / 45 min) |
| **Respira (Breathe)** | 12 breathwork techniques (coherence, box, 4-7-8, Wim Hof-like, pranayama) |
| **Mueve (Move)** | 7 mobility routines (hips, shoulders, ATG, ancestral, neck, desk) |
| **Estira (Stretch)** | 7 discreet office calisthenics exercises |
| **Hidrátate (Hydrate)** | Water glass tracker |
| **Logros (Achievements)** | 100 collectible field-notebook stamps |

---

## 🎨 Philosophy

- **Calm, artisanal, carefully crafted.** No aggressive gamification.
- **No emojis** in the UI. No overused fonts. No flashy gradients.
- Earth-tone palette: cream, olive green, terracotta, ochre.
- Serif italic typography (EB Garamond / Cormorant) for headings.
- Short, warm, literary copy in Spanish.
- *Antídoto a la silla* (antidote to the chair) as the mental frame.

---

## 🚀 How to open the project

### Development (modular, recommended)
Open `PACE.html` in any modern browser. Each JSX loads separately from `app/`.

### Offline (single file)
Open `PACE_standalone.html`. Everything is inlined and works without a server.

### Requirements
Chrome/Edge 90+, Firefox 90+, Safari 14+. No build step, no npm.

---

## 🏗️ Tech stack

- **React 18.3.1** (UMD pinned with SRI hashes)
- **Babel standalone 7.29.0** (transpiles JSX in-browser)
- **No bundler, no backend, no npm dependencies**
- **100% localStorage persistence** — zero tracking

---

## 📁 Structure

```
/
├── PACE.html                ← development entry point
├── PACE_standalone.html     ← offline bundle (~413 KB)
├── LICENSE                  ← Elastic License 2.0
├── CLAUDE.md                ← protocol and architecture
├── STATE.md                 ← current state and next steps
├── CHANGELOG.md             ← version history
├── DESIGN_SYSTEM.md         ← tokens, palette, typography
├── CONTENT.md               ← routine catalog + 100 achievements
├── ROADMAP.md               ← medium/long-term vision
├── HANDOFF.md               ← historical snapshot v0.9 (reference)
│
├── docs/
│   ├── porting.md           ← how to port to Next.js / Chrome / Android
│   └── sessions/            ← detailed session diary
│
└── app/
    ├── tokens.css · state.jsx · main.jsx
    ├── ui/          (Primitives, CowLogo, Toast)
    ├── shell/       (Sidebar)
    ├── focus/       (FocusTimer)
    ├── breathe/     (BreatheModule)
    ├── move/        (MoveModule)
    ├── extra/       (ExtraModule)
    ├── hydrate/     (HydrateModule)
    ├── breakmenu/   (BreakMenu)
    ├── achievements/(Achievements)
    ├── stats/       (WeeklyStats)
    └── tweaks/      (TweaksPanel)
```

---

## 🎛️ 5 customization axes (Tweaks)

| Axis | Options |
|---|---|
| Palette | crema · oscuro · envejecido |
| Typography | garamond · cormorant · mono |
| Layout | sidebar · minimal · editorial |
| Timer | ring (default) · circle · bar · number · analog |
| Breathing circle | flower (default) · pulse · petal · waves · organic |

> Logo and support button copy were configurable tweaks until v0.12.1.
> From v0.12.2 they are fixed to the official variant to reinforce product identity.

---

## 🧭 References and inspiration

- **Breathing:** [Breathe With Sandy](https://www.youtube.com/@BreatheWithSandy)
- **Mobility / ATG:** [Strengthside](https://www.youtube.com/@Strengthside)
- **Office calisthenics:** [Jess Martin](https://www.youtube.com/@jessmartinm)

---

## 📜 License

The PACE **source code** is published under the [Elastic License 2.0](./LICENSE) — a *source-available* license. In plain terms, for what you usually need to know:

**You can:**
- Read, clone, study and modify the code.
- Fork the repository for personal, educational or experimental use.
- Propose changes via pull request.

**You cannot:**
- Offer PACE (or a modified version) **as a hosted or managed service** to third parties.
- **Bypass, disable or skip** the Lifetime / Pase license validation system.
- **Remove** license, copyright or trademark notices.

### Lifetime, Pase, and Seasons ≠ code license

Elastic License 2.0 covers the repository **source code**. **Lifetime**, **Pase (monthly pass)** and **Seasons** are **separate** commercial licenses applied to the compiled product (`PACE_standalone.html`) to unlock premium content and features. See [`MONETIZATION.md`](./MONETIZATION.md) for the full monetization model detail.

### Other uses

For alternative commercial licenses (e.g., internal use by an organization that doesn't fit ELv2 terms) open an [issue on GitHub](https://github.com/ezradesign/Pace_app/issues) describing the case and we'll evaluate it.

---

## 🤝 Continuity

The project is designed to be iterated across multiple sessions with design assistant support. To resume work:

1. [`STATE.md`](./STATE.md) — current state and next steps
2. [`CLAUDE.md`](./CLAUDE.md) — work protocol and architecture
3. [`docs/sessions/`](./docs/sessions/) — detailed diary of each session
4. [`HANDOFF.md`](./HANDOFF.md) — historical snapshot v0.9 (core philosophy)