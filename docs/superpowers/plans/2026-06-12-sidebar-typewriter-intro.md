# Sidebar Typewriter Introduction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On the first desktop page load of a browser session, the sidebar identity types a four-phrase welcome sequence and settles into the existing static name + title block.

**Architecture:** Pure progressive enhancement. The existing `.sidebar-identity` markup in `index.html` and `portfolio.html` is untouched; a new standalone script (`identity-intro.js`) visually hides the static name/title (via the existing `.sr-only` utility, keeping them available to screen readers), runs the typewriter in an `aria-hidden` overlay layer, then removes the layer and unhides the originals. With JS disabled, on mobile, with `prefers-reduced-motion`, or on any repeat load in the session, the page behaves exactly as today.

**Tech Stack:** Vanilla ES5-style JS (IIFE + `'use strict'`, matching `resume.js`), plain CSS in `style.css`. No build step, no dependencies.

**Spec:** `docs/superpowers/specs/2026-06-12-sidebar-typewriter-intro-design.md`

**Testing note:** This is a static site with no test harness; adding one for an ~100-line enhancement script violates YAGNI. Each task ends with a concrete browser verification step (exact DevTools actions + expected result) instead of an automated test. Task 4 is a full verification pass against the spec.

**Key existing facts (verified):**
- Sidebar becomes visible at `@media (min-width: 62em)` (`cv/style.css:1413`).
- `.sr-only` utility exists at `cv/style.css:193` (position:absolute clip pattern — removes element from flow but keeps it for assistive tech).
- Identity markup (identical on both pages):
  ```html
  <div class="sidebar-identity">
      <p class="sidebar-identity-name">Kees Leemeijer</p>
      <p class="sidebar-identity-title">Computational Design &amp; Fabrication Engineer</p>
  </div>
  ```
  (`cv/index.html:52-55`, `cv/portfolio.html:64-67`)
- Script includes: `cv/index.html:258` has `<script src="resume.js" defer></script>`; `cv/portfolio.html:230` has `<script type="module" src="portfolio.js"></script>`.
- A global `prefers-reduced-motion` kill-switch exists at `cv/style.css:1532` (animations forced to 0.01ms) — the JS must *additionally* skip the sequence, since the typewriter is `setTimeout`-driven, not CSS-driven.

---

### Task 1: CSS for the intro layer and caret

**Files:**
- Modify: `cv/style.css` (insert directly after the `.sidebar-identity-title` rule, which ends at line 495)

- [ ] **Step 1: Add the intro styles**

Insert after the closing brace of `.sidebar-identity-title` (line 495):

```css
/* Typewriter intro (identity-intro.js) — animated, aria-hidden layer that
   temporarily replaces the static name/title on first load of a session. */
.identity-intro {
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
  overflow-wrap: break-word;
}

.identity-intro .identity-intro-title-part {
  display: block;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-normal);
  color: var(--color-text-secondary);
}

.identity-intro-caret {
  display: inline-block;
  width: 2px;
  height: 1em;
  margin-inline-start: 1px;
  vertical-align: -0.1em;
  background: var(--color-accent);
  animation: identity-caret-blink 1.06s steps(1) infinite;
  transition: opacity 600ms ease;
}

.identity-intro-caret.is-done {
  opacity: 0;
}

@keyframes identity-caret-blink {
  50% { opacity: 0; }
}
```

Notes for the implementer:
- `.identity-intro` mirrors `.sidebar-identity-name` typography; `.identity-intro-title-part` mirrors `.sidebar-identity-title`, so the typed settle is pixel-identical to the static block that replaces it.
- The global reduced-motion block at line 1532 already neutralizes the caret blink; no extra reduced-motion CSS is needed here (the JS skips entirely — Task 2).

- [ ] **Step 2: Verify no visual regression**

Open `cv/index.html` in a browser (e.g. `start cv\index.html` from the repo root, or any local server). The classes are not referenced by any markup yet.
Expected: page looks exactly as before; sidebar shows static name + title.

- [ ] **Step 3: Commit**

```bash
git add cv/style.css
git commit -m "Add styles for sidebar typewriter intro layer and caret"
```

---

### Task 2: Create `identity-intro.js`

**Files:**
- Create: `cv/identity-intro.js`

- [ ] **Step 1: Write the complete script**

```javascript
/**
 * KEES SIDEBAR IDENTITY INTRO v1.0
 * ============================================================================
 * Progressive enhancement for the desktop sidebar identity block.
 * On the first page load of a browser session it types a short welcome
 * sequence, then settles into the static name + title.
 *
 * Skips entirely (leaving the static markup untouched) when:
 * - the sidebar is hidden (viewport below 62em),
 * - the visitor prefers reduced motion,
 * - the sequence already played this session (sessionStorage),
 * - the expected markup is missing.
 *
 * Spec: docs/superpowers/specs/2026-06-12-sidebar-typewriter-intro-design.md
 * ============================================================================
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'kees-intro-played';
  var PHRASES = ['Hallo.', 'Welcome.', "I'm Kees.", 'I teach robots to build.'];

  var TYPE_MIN_MS = 55;     // per-character lower bound
  var TYPE_JITTER_MS = 45;  // random extra per character, for a human feel
  var ERASE_MS = 25;        // per character
  var HOLD_MS = 950;        // finished phrase rests before erasing
  var SETTLE_HOLD_MS = 600; // rest before the caret fades out
  var CARET_FADE_MS = 700;  // matches the 600ms CSS opacity transition + margin

  function start() {
    var identity = document.querySelector('.sidebar-identity');
    if (!identity) return;

    var nameEl = identity.querySelector('.sidebar-identity-name');
    var titleEl = identity.querySelector('.sidebar-identity-title');
    if (!nameEl || !titleEl) return;

    var sidebarVisible = window.matchMedia('(min-width: 62em)').matches;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var played = false;
    try { played = sessionStorage.getItem(STORAGE_KEY) === '1'; } catch (e) { /* storage blocked: treat as unplayed */ }

    if (!sidebarVisible || reducedMotion || played) return;
    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (e) { /* storage blocked: may replay next load */ }

    // Reserve the settled height so the nav below never shifts while typing.
    identity.style.minHeight = identity.offsetHeight + 'px';

    // Screen readers keep the real identity (sr-only removes it from flow
    // but not from the accessibility tree); the animation is aria-hidden.
    nameEl.classList.add('sr-only');
    titleEl.classList.add('sr-only');

    var layer = document.createElement('p');
    layer.className = 'identity-intro';
    layer.setAttribute('aria-hidden', 'true');

    var caret = document.createElement('span');
    caret.className = 'identity-intro-caret';

    var nameSpan = document.createElement('span');
    nameSpan.appendChild(document.createTextNode(''));
    nameSpan.appendChild(caret);
    layer.appendChild(nameSpan);
    identity.appendChild(layer);

    // --- typing primitives -------------------------------------------------
    // Each target span keeps its text in firstChild (a text node); the caret
    // sits at the end of whichever span is currently being typed into.

    function typeInto(el, str, done) {
      var node = el.firstChild;
      var i = 0;
      (function step() {
        node.data = str.slice(0, i);
        if (i < str.length) {
          i++;
          window.setTimeout(step, TYPE_MIN_MS + Math.random() * TYPE_JITTER_MS);
        } else {
          done();
        }
      })();
    }

    function eraseFrom(el, done) {
      var node = el.firstChild;
      (function step() {
        if (node.data.length > 0) {
          node.data = node.data.slice(0, -1);
          window.setTimeout(step, ERASE_MS);
        } else {
          done();
        }
      })();
    }

    // --- sequence ----------------------------------------------------------

    var phraseIndex = 0;

    function nextPhrase() {
      if (phraseIndex < PHRASES.length) {
        typeInto(nameSpan, PHRASES[phraseIndex], function () {
          phraseIndex++;
          window.setTimeout(function () {
            eraseFrom(nameSpan, nextPhrase);
          }, HOLD_MS);
        });
      } else {
        settle();
      }
    }

    function settle() {
      typeInto(nameSpan, nameEl.textContent, function () {
        var titleSpan = document.createElement('span');
        titleSpan.className = 'identity-intro-title-part';
        titleSpan.appendChild(document.createTextNode(''));
        titleSpan.appendChild(caret); // caret jumps to the title line
        layer.appendChild(titleSpan);
        typeInto(titleSpan, titleEl.textContent, function () {
          window.setTimeout(finish, SETTLE_HOLD_MS);
        });
      });
    }

    function finish() {
      caret.classList.add('is-done');
      window.setTimeout(function () {
        // Swap the typed replica for the real static block. The typography
        // matches, so this is visually seamless.
        identity.removeChild(layer);
        nameEl.classList.remove('sr-only');
        titleEl.classList.remove('sr-only');
        identity.style.minHeight = '';
      }, CARET_FADE_MS);
    }

    nextPhrase();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
```

- [ ] **Step 2: Verify it parses and is inert without a script tag**

Open `cv/index.html` in the browser, then in the DevTools console run:

```js
var s = document.createElement('script'); s.src = 'identity-intro.js'; document.body.appendChild(s);
```

Expected: the sidebar identity erases and the typewriter sequence plays — `Hallo.` → `Welcome.` → `I'm Kees.` → `I teach robots to build.` → types `Kees Leemeijer` then the title on a second line → caret blinks throughout, then fades. Final state is identical to the original static block (inspect: `.identity-intro` is gone, the two `<p>`s have no `sr-only` class). No console errors.

(If the sequence does not play, check `sessionStorage.getItem('kees-intro-played')` — clear it with `sessionStorage.clear()` and retry.)

- [ ] **Step 3: Commit**

```bash
git add cv/identity-intro.js
git commit -m "Add sidebar typewriter introduction script"
```

---

### Task 3: Include the script on both pages

**Files:**
- Modify: `cv/index.html:258` (next to the existing `resume.js` include)
- Modify: `cv/portfolio.html:230` (next to the existing `portfolio.js` include)

- [ ] **Step 1: Add the script tag to `index.html`**

Directly after `<script src="resume.js" defer></script>` (line 258), add:

```html
    <script src="identity-intro.js" defer></script>
```

- [ ] **Step 2: Add the script tag to `portfolio.html`**

Directly after `<script type="module" src="portfolio.js"></script>` (line 230), add:

```html
    <script src="identity-intro.js" defer></script>
```

- [ ] **Step 3: Verify on a fresh session**

Open `cv/index.html` in a new incognito window (fresh `sessionStorage`).
Expected: sequence plays once in the sidebar. Click through to Portfolio: static block renders instantly (no animation). Reload either page: still static.

- [ ] **Step 4: Commit**

```bash
git add cv/index.html cv/portfolio.html
git commit -m "Load identity intro script on resume and portfolio pages"
```

---

### Task 4: Full verification pass (spec checklist)

**Files:** none (verification only)

Run all checks in Chrome DevTools against `cv/index.html` (serve the folder or open the file directly; behavior is identical for this feature).

- [ ] **Step 1: Fresh session plays the full sequence**

New incognito window → open the CV page.
Expected: typewriter plays all four phrases, settles into **Kees Leemeijer** + title; caret fades out; afterwards the DOM contains the original two `<p>`s without `sr-only` and no `.identity-intro` element.

- [ ] **Step 2: No layout shift**

During the sequence, watch the nav links below the identity block (or enable Rendering → Layout Shift Regions).
Expected: nav never moves; `.sidebar-identity` keeps its height (inline `min-height` present during the animation, removed after).

- [ ] **Step 3: Once per session**

Reload the page, and navigate CV ↔ Portfolio.
Expected: static block renders instantly everywhere; `sessionStorage.getItem('kees-intro-played') === '1'`.

- [ ] **Step 4: Reduced motion skips**

DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce`, then `sessionStorage.clear()` and reload.
Expected: no animation; static block immediately.

- [ ] **Step 5: Mobile no-ops**

Device toolbar at 375px width, `sessionStorage.clear()`, reload.
Expected: no errors in console; no sessionStorage flag is set (sidebar hidden → script returned before setting it), so a later desktop-width fresh load would still play.

- [ ] **Step 6: Screen-reader markup during animation**

`sessionStorage.clear()`, reload at desktop width, and while the animation runs inspect the identity block.
Expected: the two static `<p>`s are present with class `sr-only`; the `.identity-intro` layer has `aria-hidden="true"`.

- [ ] **Step 7: Console clean on both pages**

Expected: zero errors/warnings from `identity-intro.js` on CV and Portfolio, desktop and mobile widths.

No commit — if any step fails, fix, re-verify, and amend the relevant task's commit message convention (new commit, e.g. `fix: ...`).
