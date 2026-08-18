# PACE · Foco · Cuerpo

> Productivity and wellness web app for people who spend long hours sitting.
> Thoughtful micro-interventions throughout the day, not lengthy workouts.

**Status:** v0.95.0 · Pre-launch
**Build delivered:** `index.html` — web/PWA artifact, installable and offline
**Author:** [@ezradesign](https://github.com/ezradesign)
**Code license:** [Elastic License 2.0](./LICENSE) — see [§ License](#-license)
**Español:** [`README.md`](./README.md)

---

## 🎯 What it is

PACE is an all-in-one wellness app for office and remote work: focus cycles and
micro-breaks for breathing, mobility and hydration, chained into guided routines.

| Module | What it does |
|---|---|
| **Foco** (Focus) | Configurable Pomodoro (15 / 25 / 35 / 45 min) with cycles and breaks |
| **Respira** (Breathe) | 20 breathwork techniques (coherence, box, 4-7-8, Wim Hof-like, pranayama) |
| **Mueve** (Move) | 14 mobility routines (hips, shoulders, ATG, ancestral, neck, desk) |
| **Estira** (Stretch) | 14 discreet office calisthenics routines |
| **Hidrátate** (Hydrate) | Water glass tracker |
| **Caminos** (Paths) | 7 guided journeys chaining focus, breathing, body and hydration steps over an illustrated plate |
| **Logros** (Achievements) | 96 collectible field-notebook stamps |
| **Ritmo** (Stats) | Week · month · year (heatmap) · Paths |

Plus: a first-run **onboarding** that suggests your first Path, a **custom routine
builder**, and an installable **PWA** that works offline.

---

## 📊 Current state (v0.95.0)

| Area | State |
|---|---|
| Core modules | Focus · Breathe · Move · Stretch · Hydrate — stable |
| Paths | Complete system: library, step runner, completion screen, stats and yearly heatmap |
| Body content | Step contract v1 (mode, sidedness, dosage, requirements) + "before you start" preview |
| Achievements | 96 in catalog · 88 with an active detector · 58 with dedicated artwork |
| i18n | Full ES/EN, catalogs split by domain |
| PWA | `manifest.webmanifest` + service worker with precache; self-hosted fonts, zero external requests |
| Premium | Central entitlement guard in place; the real license does not exist yet |
| Code | 97 files under `app/`, none above 500 lines |
| Safety net | `npm run verify` — syntax, build, scope analysis of the artifact, version coherence |

---

## 🎨 Philosophy

- **Calm, artisanal, carefully crafted.** No aggressive gamification.
- **No emojis** in the UI. No overused fonts. No flashy gradients.
- Earth-tone palette: cream, olive green, terracotta, ochre.
- Serif italic typography (Cormorant Garamond) for headings.
- Short, warm, literary copy.
- Your data lives on your device. No accounts, no analytics, no cookies.
- *Antídoto a la silla* (antidote to the chair) as the mental frame.

---

## 🚀 How to open the project

### Development (modular)
Open `PACE.html` through a static server. Each JSX loads separately from `app/` and
is transpiled in-browser by Babel standalone.

### Web / PWA (what ships)
`index.html` is the canonical artifact: everything compiled and inlined, no Babel at
runtime. Serve it over HTTP so the service worker and installation work — opening it
via `file://` disables both.

### Build
```bash
npm install && npm run build
```

### Before publishing
```bash
npm run verify
```

### Requirements
Chrome/Edge 90+, Firefox 90+, Safari 14+. Node 18+ for building only.

---

## 🏗️ Tech stack

- **React 18.3.1** (production UMD, self-hosted in `vendor/`)
- **Babel standalone 7.29.0** — **development only**; the build compiles JSX to plain
  JS ahead of time and strips Babel from the artifact
- **No bundler, no backend.** npm only provides the build toolchain
- **`localStorage` persistence** — no data server, no tracking
- **Self-hosted fonts** (Cormorant Garamond, EB Garamond, Inter Tight)

---

## 📁 Structure

```
/
├── PACE.html                ← development entry point
├── index.html               ← canonical WEB/PWA artifact
├── PACE_standalone.html     ← single-file offline export, on demand
├── build-standalone.js      ← generates both artifacts
├── manifest.webmanifest · sw.js
├── LICENSE                  ← Elastic License 2.0
├── CLAUDE.md · STATE.md · CHANGELOG.md
├── DESIGN_SYSTEM.md · CONTENT.md · ROADMAP.md · MONETIZATION.md
│
├── docs/
│   ├── BUILD.md             ← how the build works
│   ├── WORKFLOW.md          ← Git session-closing protocol
│   ├── product/             ← standing product and technical decisions
│   ├── audits/              ← audits with evidence
│   └── sessions/            ← work diary, one entry per session
│
├── scripts/                 ← verify, art ingestion, utilities
├── vendor/                  ← self-hosted React UMD
├── fonts/                   ← self-hosted latin subsets
│
└── app/
    ├── tokens.css · state*.jsx · main.jsx · flags.js
    ├── ui/          (Primitives, SessionShell, CowLogo, Toast, TimerDial…)
    ├── shell/       (Sidebar)
    ├── focus/       (Pomodoro)
    ├── breathe/     (visual, library, guided session)
    ├── move/ · extra/   (Move and Stretch + step runner v1)
    ├── hydrate/ · breakmenu/ · achievements/ · stats/
    ├── paths/       (Paths: registry, runner, plates, steps)
    ├── custom/      (custom routine builder)
    ├── onboarding/ · support/ · tweaks/
    ├── glyphs/      (exercise and achievement artwork)
    └── i18n/        (ES/EN catalogs by domain)
```

---

## 🎛️ Customization

| Axis | Options |
|---|---|
| Palette | cream (day) · dark (night) · aged paper |
| Language | Spanish · English |

The dark palette is auto-detected from the OS on first launch; a manual choice
persists and always wins afterwards.

> **Dormant axes.** Timer styles (bar, analog) and the "organic" breathing circle
> still exist in the code but are **turned off by flag** in
> [`app/flags.js`](./app/flags.js): they were retired on visual grounds, not because
> they were in the way, and the flag brings them back in one line. The typography and
> layout axes have no control in Settings either. Do not delete those branches
> without reading the file header.

---

## 💛 Free and Premium

The **core of PACE is free** and will stay that way: all five modules, focus cycles,
achievements and stats.

**Premium** will extend routines, techniques and Paths through a **one-time
purchase** — no subscription, no mandatory account. **v1.0 will be the first paid
version**; until then the license system does not exist and everything built is
accessible.

---

## 🧭 References and inspiration

- **Breathing:** [Breathe With Sandy](https://www.youtube.com/@BreatheWithSandy)
- **Mobility / ATG:** [Strengthside](https://www.youtube.com/@Strengthside)
- **Office calisthenics:** [Jess Martin](https://www.youtube.com/@jessmartinm)

Move and Stretch content draws on public material from the NHS, ACSM and WHO.
**This is not medical advice.** Techniques involving breath retention always show a
safety notice before starting.

---

## 📜 License

The PACE **source code** is published under the [Elastic License 2.0](./LICENSE) — a *source-available* license. In plain terms, for what you usually need to know:

**You can:**
- Read, clone, study and modify the code.
- Fork the repository for personal, educational or experimental use.
- Propose changes via pull request.

**You cannot:**
- Offer PACE (or a modified version) **as a hosted or managed service** to third parties.
- **Bypass, disable or skip** the license validation system.
- **Remove** license, copyright or trademark notices.

### The commercial license ≠ the code license

Elastic License 2.0 covers the repository **source code**. The **Premium** license is
a **separate** commercial license applied to the compiled product to unlock premium
content and features. See [`MONETIZATION.md`](./MONETIZATION.md) for the model — with
the caveat that its historical part is marked as such: at launch there is **a single
plan**, not four routes.

### Other uses

For alternative commercial licenses (e.g., internal use by an organization that doesn't fit ELv2 terms) open an [issue on GitHub](https://github.com/ezradesign/Pace_app/issues) describing the case and we'll evaluate it.

---

## 🤝 Continuity

The project is iterated across successive sessions with design assistant support. To resume work:

1. [`STATE.md`](./STATE.md) — current state, backlog and next steps
2. [`CLAUDE.md`](./CLAUDE.md) — work protocol and architecture
3. [`ROADMAP.md`](./ROADMAP.md) — the road to v1.0
4. [`docs/sessions/`](./docs/sessions/) — detailed diary of each session
