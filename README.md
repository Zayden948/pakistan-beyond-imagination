# PAKISTAN — Beyond Imagination

A premium editorial one-page experience celebrating Pakistan — its cities, landmarks, natural
wonders, history, culture and cuisine. Built to feel like a cinematic magazine, not a template.

**🌐 Live site:** https://zayden948.github.io/pakistan-beyond-imagination/

## Highlights

- **Three languages in one page** — English, French and Urdu with a full right-to-left layout
  and Noto Nastaliq Urdu typography for the Urdu edition. No i18n framework — a custom
  dictionary/attribute system in ~30 kB of vanilla JS.
- **Zero runtime dependencies** — Vite 6 dev tooling, vanilla ES modules, hand-written
  CSS design system (design tokens, per-chapter palettes, custom easing).
- **Cinematic motion** — text reveal, hero character stagger, parallax, spotlight/tilt cards,
  marquee — all built from scratch with IntersectionObserver and CSS.
- **Accessible by design** — semantic tabs with keyboard navigation, ARIA live regions,
  `data-i18n-aria` translated labels, `prefers-reduced-motion` fallbacks, skip link.

## Stack

| Layer     | Choice                                   |
| --------- | ---------------------------------------- |
| Tooling   | Vite 6                                   |
| Runtime   | Vanilla ES modules, no framework         |
| Styling   | Custom CSS (tokens → sections → motion)  |
| Type      | Cormorant Garamond, Montserrat, Noto Nastaliq Urdu |
| Images    | Wikimedia Commons (credited per licence) |

## Getting started

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
npm run preview  # serve the production build
```

Deployed to GitHub Pages via the workflow in `.github/workflows/deploy.yml` on every push to `main`.

## Project structure

```
index.html               All content (single page, 10 sections)
src/scripts/             nav, reveal, counters, parallax, timeline, regions…
src/scripts/lang.js      i18n core: EN native in DOM, FR/UR dictionaries
src/scripts/i18n/        Translation data (ui1–6, timeline eras, regions)
src/styles/              tokens.css, base.css, sections.css, animations.css, lang.css
```

---

© 2026 — A cultural storytelling project. Photography courtesy of Wikimedia Commons contributors.