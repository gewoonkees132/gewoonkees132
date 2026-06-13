# Sidebar Typewriter Introduction — Design

**Date:** 2026-06-12
**Status:** Approved
**Pages:** `cv/index.html`, `cv/portfolio.html`

## Problem

On landing, the desktop sidebar shows "Kees Leemeijer / Computational Design & Fabrication Engineer" while the page header directly beside it shows the same name and title. The duplication is static and adds nothing. The sidebar identity should instead greet the visitor — a living message that demonstrates front-end skill — before settling into the identity block.

Three directions were prototyped in the visual companion (typewriter introduction, time-aware greeting, scroll-morphing identity). The **typewriter introduction** was selected.

## Behavior

On desktop, on the **first page load of a browser session**, the `.sidebar-identity` block plays a three-phase intro:

1. **Greeting** — `Welcome.` then `I'm Kees.` each type on a single line, hold, and erase.
2. **Manifesto** — three statements type and **stack**, each on its own line below the previous one (they accumulate; the caret drops to the start of each new line):
   - `I rationalize geometry.`
   - `I optimize structures.`
   - `I teach robots to build.`
3. **Settle** — the stack holds briefly, then clears (erases bottom-up) and the real identity **types in**: **Kees Leemeijer** (name line) + *Computational Design & Fabrication Engineer* (title line). The caret fades, and the typed replica is swapped for the static markup — seamless because the typography matches.

The manifesto framing is a short capability statement tailored toward engineering / computational-design / fabrication employers.

Timing:

- Type: ~45–80 ms per character (random jitter for a natural feel)
- Erase: ~18 ms per character; a greeting holds ~700 ms before erasing
- Pause between stacked lines: ~220 ms; the full stack holds ~1000 ms before clearing
- Caret: 2 px accent-colored bar, blinking (~1 s steps), fades out after the name + title finish typing
- Full sequence is roughly 14–16 s (one-time per session); all durations are constants at the top of `identity-intro.js`

Session behavior: a `sessionStorage` flag (`kees-intro-played`) is set when the sequence starts. Any later page load in the same session — including navigating between CV and Portfolio — renders the static block instantly. A new browser session plays the sequence again, on whichever of the two pages the visitor lands first.

Scope: both pages, desktop only. On mobile the sidebar is `display: none`; the script must no-op there (match the same `min-width` media query the CSS uses to show the sidebar). The mobile header is unchanged.

## Robustness requirements

- **Progressive enhancement:** the static name + title stay in the HTML exactly as today. The script replaces the content only when it runs. With JS disabled, the page behaves as it does now.
- **Reduced motion:** if `prefers-reduced-motion: reduce` matches, skip the animation entirely and show the static block.
- **Screen readers:** the animated container is `aria-hidden="true"`; the real name + title stay in normal flow (rendered at `opacity: 0`) so assistive tech announces the real identity once, never the letter-by-letter output.
- **No layout shift:** the typed stack is an absolutely-positioned overlay, and `.sidebar-identity` gets a `min-height` reserving the taller of (stacked, settled) size, so the nav below never jolts line-by-line during typing. (It sits a few px lower for the duration of the intro, then returns to baseline on settle.)
- **Print:** no changes — the sidebar is not part of the print layout.

## Implementation

- **New file `cv/identity-intro.js`**: IIFE with `'use strict'`, matching the structure and comment style of `resume.js` / `portfolio.js`. Self-contained state machine across three phases: greeting (type → hold → erase, per phrase) → stack (type → pause, per line) → settle (clear → type name → type title → cleanup). No dependencies on, or changes to, the scroll-spy code. The text lives in `GREETINGS` and `LINES` array constants at the top of the file (swap them to retarget the message).
- **Script tags:** `<script src="identity-intro.js" defer></script>` added to both `index.html` and `portfolio.html`.
- **Markup:** the existing `.sidebar-identity` children stay in place as the accessible copy (`opacity: 0` while the intro plays); an `aria-hidden` `<p class="identity-intro">` overlay (absolutely positioned) hosts the active line(s) — `.identity-intro-line` spans during greeting/stack/name, a `.identity-intro-title-part` span for the typed title — plus the caret. On settle the overlay is removed and the static children are revealed.
- **CSS (`style.css`):** absolutely-positioned overlay, per-line block, title-part styling (mirrors `.sidebar-identity-title`), caret element + blink keyframes, and an `is-introducing` state class on `.sidebar-identity` (relative positioning + hides the static text). Uses existing custom properties (`--color-accent`, font sizes) — no new tokens.

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
