# Sidebar Typewriter Introduction — Design

**Date:** 2026-06-12
**Status:** Approved
**Pages:** `cv/index.html`, `cv/portfolio.html`

## Problem

On landing, the desktop sidebar shows "Kees Leemeijer / Computational Design & Fabrication Engineer" while the page header directly beside it shows the same name and title. The duplication is static and adds nothing. The sidebar identity should instead greet the visitor — a living message that demonstrates front-end skill — before settling into the identity block.

Three directions were prototyped in the visual companion (typewriter introduction, time-aware greeting, scroll-morphing identity). The **typewriter introduction** was selected.

## Behavior

On desktop, on the **first page load of a browser session**, the `.sidebar-identity` block plays a typewriter sequence:

1. `Hallo.`
2. `Welcome.`
3. `I'm Kees.`
4. `I teach robots to build.`
5. Settles: **Kees Leemeijer** (name line) + *Computational Design & Fabrication Engineer* (title line) — identical to the current static block.

Timing:

- Type: 55–100 ms per character (random jitter for a natural feel)
- Hold each phrase: ~950 ms
- Erase: ~25 ms per character
- Caret: 2 px accent-colored bar, blinking (~1 s steps), fades out after the final settle

Session behavior: a `sessionStorage` flag (`kees-intro-played`) is set when the sequence starts. Any later page load in the same session — including navigating between CV and Portfolio — renders the static block instantly. A new browser session plays the sequence again, on whichever of the two pages the visitor lands first.

Scope: both pages, desktop only. On mobile the sidebar is `display: none`; the script must no-op there (match the same `min-width` media query the CSS uses to show the sidebar). The mobile header is unchanged.

## Robustness requirements

- **Progressive enhancement:** the static name + title stay in the HTML exactly as today. The script replaces the content only when it runs. With JS disabled, the page behaves as it does now.
- **Reduced motion:** if `prefers-reduced-motion: reduce` matches, skip the animation entirely and show the static block.
- **Screen readers:** the animated container is `aria-hidden="true"`; a visually-hidden static name + title remains in the DOM at all times so assistive tech announces the real identity once, never letter-by-letter output.
- **No layout shift:** `.sidebar-identity` gets a `min-height` reserving the two-line settled size, so the nav below never moves during the animation.
- **Print:** no changes — the sidebar is not part of the print layout.

## Implementation

- **New file `cv/identity-intro.js`** (~80 lines): IIFE with `'use strict'`, matching the structure and comment style of `resume.js` / `portfolio.js`. Self-contained state machine: type → hold → erase → next phrase → settle. No dependencies on, or changes to, the scroll-spy code.
- **Script tags:** `<script src="identity-intro.js" defer></script>` added to both `index.html` and `portfolio.html`.
- **Markup:** current `.sidebar-identity` children become the visually-hidden accessible copy; an `aria-hidden` sibling hosts the animated text and caret. (Exact structure decided at implementation; the constraint is the two robustness bullets above.)
- **CSS (`style.css`):** caret element + blink keyframes; `min-height` on `.sidebar-identity`. Use existing custom properties (`--color-accent`, font sizes) — no new tokens.

## Verification

Manual pass via Chrome DevTools on both pages:

1. Fresh session (incognito or cleared sessionStorage): sequence plays, settles into name + title, caret fades.
2. Reload / cross-navigate: static block renders instantly.
3. `prefers-reduced-motion: reduce` emulation: no animation.
4. Mobile viewport: no-op, no errors.
5. No console errors; no layout shift of the nav during the sequence (verify visually or with Layout Shift regions).

## Out of scope

- Mobile-header animation
- Time-of-day or locale-aware greeting content (variant B) — phrases are fixed
- Scroll-linked morphing (variant C)
- Any changes to `resume.js`, `portfolio.js`, or print styles
