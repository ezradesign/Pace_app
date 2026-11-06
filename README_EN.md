# PACE · Foco · Cuerpo

> Productivity and wellness app for people who spend long hours sitting, on the web, Android and iPhone.
> Thoughtful micro-interventions throughout the day, not lengthy workouts.

**Status:** v0.191.1 · Pre-launch
**Web:** [pacegrass.app](https://pacegrass.app) · [PACE Complete](https://pacegrass.app/premium) · [Try it on Android or iPhone](https://pacegrass.app/beta)
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
| **Respira** (Breathe) | 20 breathwork techniques (coherence, box, 4-7-8, Wim Hof-like, pranayama), 13 free |
| **Mueve** (Move) | 14 discreet office strength routines (start here, stealth, with equipment and go further), 7 free |
| **Estira** (Stretch) | 19 mobility routines (start here, office, shoulders and spine, hips and legs, go further), 15 free |
| **Hidrátate** (Hydrate) | Water glass tracker |
| **Caminos** (Paths) | 7 guided journeys over an illustrated plate, hidden until after v1 (nothing has been deleted) |
| **Logros** (Achievements) | Collectible field-notebook stamps; the panel shows the ones you can already earn, and the rest appear the day they get their detector |
| **Estadísticas** (Stats) | Today · week · month · year (heatmap) |

Plus: a **welcome** that asks what your week looks like, a **custom routine builder**,
and an installable **PWA** that works offline.

---

## 📊 Current state (v0.191.1)

| Area | State |
|---|---|
| At your pace | The home asks "how long are you working today?" and serves the whole day: focus blocks and named breaks, around your schedule, and when a block ends the system notification tells you which break is next. The full menu is one tap away |
| Core modules | Focus · Breathe · Move · Stretch · Hydrate — stable |
| Paths | Complete system (library, step runner, completion screen, stats and yearly heatmap), hidden until after v1 with `SHOW_CAMINOS` in `app/flags.js` |
| Body content | Step contract v1 (mode, sidedness, dosage, requirements) + "before you start" preview, and a drawing of its own for every exercise in the routines |
| Achievements | 96 in catalog · 88 with an active detector · the panel only shows and counts the ones you can earn today · the artwork still missing is counted in `docs/product/GLIFOS_A_DIBUJAR.md` |
| i18n | Full ES/EN, catalogs split by domain |
| PWA | `manifest.webmanifest` + service worker with precache; self-hosted fonts, zero external requests |
| Android and iPhone | The same app through Capacitor (`android/`, `ios/`): every push to `main` builds the Android APK and signed AAB and the iPhone app. Android is in Google Play's closed test and iPhone in TestFlight; both stores launch the same day, with v1 |
| PACE Complete | Everything paid goes through a single point (`app/state-entitlement.jsx`); the signed license exists since v0.157.0 and today it ships in the testers' codes. On the web, `/premium` (with the lifetime plan; the monthly arrives with v1), checkout with Stripe (checked in test mode and not switched on yet), `/gracias`, `/recuperar` and `/desistir` (closed until email is connected); the terms, in draft. There is no purchase in the apps until v1. Until v1, PACE Complete is open to everyone |
| Robustness | A broken saved field repairs itself (anything unreadable is kept in a rescue copy) · dialogs and sessions manage focus and keyboard · the screen stays on during a guided session · if one part fails, only that part closes (with a recovery screen as a last resort) |
| Code | Over 200 code files under `app/` (.js, .jsx, .css), none above 500 lines |
| Safety net | `npm run verify` — syntax, build, scope analysis of the artifact, version coherence and what the website promises · `npm run test:e2e` — over 1,100 tests in a real browser, in Chromium and in Safari's engine, run by CI on every push |

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
- **No bundler.** npm only provides the build toolchain
- **Capacitor** for the Android and iPhone apps, built on GitHub Actions (the iPhone one too, without a Mac)
- **`localStorage` and IndexedDB persistence** — no data server, no tracking. The Cloudflare functions
  (`functions/api/`) only handle web checkout, the PACE Complete code, withdrawal and the "Notify me"
  list: none of them receives what you do in PACE
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
├── premium/ · beta/ · gracias/ · recuperar/ · desistir/   ← the website pages
├── privacy.html · safety.html · legal/   ← privacy, safety and the legal drafts
├── functions/api/           ← Cloudflare functions: checkout, code, withdrawal, "Notify me"
├── android/ · ios/          ← the native apps (Capacitor)
│
├── docs/
│   ├── BUILD.md             ← how the build works
│   ├── WORKFLOW.md          ← Git session-closing protocol
│   ├── product/             ← standing product and technical decisions
│   ├── launch/              ← Google Play, App Store, payments and legal
│   ├── traspaso/            ← to pick the project up from scratch
│   ├── audits/              ← audits with evidence
│   └── sessions/            ← session diaries up to October 2026 (history)
│
├── tests/                   ← the e2e tests (Playwright)
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
    ├── paths/       (Paths, hidden until after v1: registry, runner, plates, steps)
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

The **core of PACE is free** and will stay that way: the whole Focus, «A tu ritmo» (At
your pace) every day, 35 routines, Hydrate, achievements and the stats for today and
the week.

**PACE Complete** adds the 18 deeper routines, your own routines, a week that learns
from you and your month and year. There will be two plans, **€19.99 for life or €2.99
a month with a 7-day free trial**, with no account to create. Until **v1.0**, PACE
Complete is open to everyone and the web will sell only the lifetime plan; there is no
purchase in the apps. With v1.0 it stops being open, the monthly plan arrives and you
will be able to buy in Android and iPhone too. The license already exists (v0.157.0): a
signed code the app checks on its own, which the testers carry today.

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
the caveat that its historical part is marked as such: there are **two plans**
(€19.99 for life and, with v1, €2.99 a month), not four routes.

### Other uses

For alternative commercial licenses (e.g., internal use by an organization that doesn't fit ELv2 terms) open an [issue on GitHub](https://github.com/ezradesign/Pace_app/issues) describing the case and we'll evaluate it.

---

## 🤝 Continuity

The project is iterated across successive sessions with design assistant support. To resume work:

1. [`STATE.md`](./STATE.md) — current state, backlog and next steps (from scratch or from another account,
   also [`docs/traspaso/LEEME.md`](./docs/traspaso/LEEME.md))
2. [`CLAUDE.md`](./CLAUDE.md) — work protocol and architecture
3. [`ROADMAP.md`](./ROADMAP.md) — the road to v1.0
4. `git log` — what changed in each version and why (earlier diaries remain in [`docs/sessions/`](./docs/sessions/))
