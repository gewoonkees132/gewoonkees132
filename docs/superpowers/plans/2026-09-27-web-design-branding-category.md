# Web Design & Branding Category Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Web Design & Branding" filter to the portfolio with two new projects (B&L Sprinkler Inspecties, L2. Photography), tag VaseCreator into it, and give projects an optional live-site link in the modal.

**Architecture:** The portfolio (`cv/portfolio.html`) renders cards and a modal from the `projectData` object in `cv/project-data.js`; filtering matches each project's `categories` array against the pill's `data-filter`. We add one pill, one optional `url` field (rendered by `hydrateContent` in `cv/portfolio.js` into a new template slot), two data entries, and screenshots captured from the live sites.

**Tech Stack:** Static HTML/CSS/vanilla JS (ES module data file), Chrome DevTools MCP for screenshots, Node 22 for a data check script, Python `http.server` for local serving.

**Spec:** `docs/superpowers/specs/2026-09-27-web-design-branding-category-design.md`

## Global Constraints

- Category key: `web`. Pill label: `Web Design & Branding`, placed after the Digital Fabrication pill.
- Project order in `project-data.js`: `vasecreator-web-platform`, then `bl-sprinkler-inspecties`, then `l2-photography`, consecutively, under a `// CATEGORY: WEB DESIGN & BRANDING` header comment before `bl-sprinkler-inspecties`.
- URLs, exactly: VaseCreator `https://vasecreator.com/`, B&L `https://sprinklertankinspectie.com/`, L2 `https://l2fotografie.nl/`. No other project gets a `url`.
- Every entry: 3 `impact` bullets, 5 `technologies`, gallery captions in the form `Label: sentence.`
- The link lives only in the modal (the card is a `<button>`; no nested interactive content).
- Screenshots: WebP, quality 82, in `cv/images/`, desktop viewport 1440×900×1, mobile 390×844×2.
- Repo commit style: plain imperative subject (e.g. "Add …"), no `feat:` prefix. Every commit message ends with a blank line then `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`.
- All commands run from the repo root `C:\Users\kees\gewoonkees132` (Git Bash: `cd /c/Users/kees/gewoonkees132`). Work on branch `web-design-branding`.

## File Map

| File | Change |
|---|---|
| `cv/portfolio.html` | New filter pill; live-link slot in `#project-modal-template` |
| `cv/portfolio.js` | `hydrateContent`: show/remove the live link from `data.url` |
| `cv/style.css` | `.modal-live-link` styles after the `.modal-section li::before` rule |
| `cv/project-data.js` | VaseCreator edit; new `bl-sprinkler-inspecties` and `l2-photography` entries |
| `cv/images/bl-sprinkler_*.webp`, `bl-sprinkler_logo.jpg` | New screenshots + logo |
| `cv/images/l2-photography_*.webp` | New screenshots |

`cv/portfolio-print.css` needs no change: it already hides `.project-modal` entirely (lines 147 and 583), so the link never prints.

---

### Task 1: Filter pill, live-site link, and VaseCreator

**Files:**
- Modify: `cv/portfolio.html:112` (pill) and `cv/portfolio.html:173-176` (Overview section of the template)
- Modify: `cv/portfolio.js:229` (inside `hydrateContent`, after the description `setText`)
- Modify: `cv/style.css:1248` (after the `.modal-section li::before` block)
- Modify: `cv/project-data.js` (`vasecreator-web-platform` entry)
- Test: check script written to the system temp dir (not committed)

**Interfaces:**
- Produces: the optional project field `url: string` (absolute URL). Any project with `url` shows a "Visit live site ↗" link in its modal. Tasks 2 and 3 rely on this field existing.
- Produces: the category key `'web'`, matched by `data-filter="web"`.
- Produces: the check script `"$(cygpath -m /tmp)/check-web-category.mjs"`, run as `node --no-warnings <script> <stage>` with stage `link`, `bl`, or `l2` (cumulative).

- [ ] **Step 1: Write the check script**

```bash
cd /c/Users/kees/gewoonkees132
cat > "$(cygpath -m /tmp)/check-web-category.mjs" <<'EOF'
// Run from the repo root: node --no-warnings <this file> <link|bl|l2>
// Stages are cumulative: "bl" also runs the "link" checks, "l2" runs all.
import { readFileSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const STAGES = ['link', 'bl', 'l2'];
const stage = STAGES.indexOf(process.argv[2] ?? 'l2');
if (stage < 0) throw new Error(`stage must be one of ${STAGES.join(', ')}`);

const { projectData } = await import(pathToFileURL(resolve('cv/project-data.js')));
const html = readFileSync('cv/portfolio.html', 'utf8');
const js = readFileSync('cv/portfolio.js', 'utf8');
const css = readFileSync('cv/style.css', 'utf8');
const errors = [];
const check = (ok, msg) => { if (!ok) errors.push(msg); };
const keys = Object.keys(projectData);

// --- stage "link": pill, link slot, hydration, style, VaseCreator
check(html.includes('<button class="filter-pill" data-filter="web" aria-pressed="false" type="button">Web Design & Branding</button>'), 'portfolio.html: missing Web Design & Branding pill');
check(html.includes('data-modal-link'), 'portfolio.html: missing data-modal-link slot in the modal template');
check(js.includes("'[data-modal-link]'") && js.includes('data.url'), 'portfolio.js: hydrateContent does not handle data.url');
check(css.includes('.modal-live-link {') && css.includes('.modal-live-link[hidden]'), 'style.css: missing .modal-live-link styles');
const vase = projectData['vasecreator-web-platform'];
check(JSON.stringify(vase.categories) === '["software","web"]', 'vasecreator categories should be ["software","web"]');

const expectedUrls = { 'vasecreator-web-platform': 'https://vasecreator.com/' };
if (stage >= 1) expectedUrls['bl-sprinkler-inspecties'] = 'https://sprinklertankinspectie.com/';
if (stage >= 2) expectedUrls['l2-photography'] = 'https://l2fotografie.nl/';
for (const [id, url] of Object.entries(expectedUrls)) check(projectData[id]?.url === url, `${id}.url should be ${url}`);
for (const id of keys) if (projectData[id].url && !(id in expectedUrls)) errors.push(`${id} has an unexpected url`);

// --- entry shape (stages "bl" and "l2")
const checkEntry = (id, galleryCount) => {
  const p = projectData[id];
  if (!p) { errors.push(`missing entry ${id}`); return; }
  for (const f of ['title', 'subtitle', 'year', 'image', 'alt', 'description']) check(typeof p[f] === 'string' && p[f].length > 0, `${id}.${f} missing`);
  check(p.impact?.length === 3, `${id}.impact should have 3 items`);
  check(p.technologies?.length === 5, `${id}.technologies should have 5 items`);
  check(JSON.stringify(p.categories) === '["web"]', `${id}.categories should be ["web"]`);
  check(p.metrics?.primary && p.metrics?.secondary, `${id}.metrics missing`);
  check(p.gallery?.length === galleryCount, `${id}.gallery should have ${galleryCount} items`);
  for (const src of [p.image, ...(p.gallery ?? []).map(g => g.src)]) check(existsSync(resolve('cv', src)), `${id}: file cv/${src} not found`);
  for (const g of p.gallery ?? []) check(/^[^:]+: \S/.test(g.caption ?? ''), `${id}: caption "${g.caption}" should read "Label: sentence."`);
};
const after = (a, b) => check(keys[keys.indexOf(a) + 1] === b, `${b} should come directly after ${a}`);

if (stage >= 1) { checkEntry('bl-sprinkler-inspecties', 5); after('vasecreator-web-platform', 'bl-sprinkler-inspecties'); }
if (stage >= 2) { checkEntry('l2-photography', 5); after('bl-sprinkler-inspecties', 'l2-photography'); }

const web = keys.filter(id => projectData[id].categories.includes('web'));
console.log(`web category: ${web.join(', ')}`);
if (errors.length) { console.error(`FAIL (${errors.length})\n- ` + errors.join('\n- ')); process.exit(1); }
console.log(`PASS (stage: ${STAGES[stage]})`);
EOF
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --no-warnings "$(cygpath -m /tmp)/check-web-category.mjs" link`
Expected: `FAIL (6)` listing the missing pill, link slot, hydration, styles, VaseCreator categories, and VaseCreator url.

- [ ] **Step 3: Add the filter pill**

In `cv/portfolio.html`, after the Digital Fabrication pill (line 112):

```html
                    <button class="filter-pill" data-filter="fabrication" aria-pressed="false" type="button">Digital Fabrication</button>
                    <button class="filter-pill" data-filter="web" aria-pressed="false" type="button">Web Design & Branding</button>
```

- [ ] **Step 4: Add the link slot to the modal template**

In `cv/portfolio.html`, replace the Overview section of `#project-modal-template`:

```html
                    <div class="modal-section">
                        <h3>Overview</h3>
                        <p data-modal-description></p>
                    </div>
```

with:

```html
                    <div class="modal-section">
                        <h3>Overview</h3>
                        <p data-modal-description></p>
                        <a class="modal-live-link" data-modal-link href="" target="_blank" rel="noopener" hidden>Visit live site <span aria-hidden="true">↗</span><span class="sr-only"> (opens in a new tab)</span></a>
                    </div>
```

- [ ] **Step 5: Hydrate the link from `data.url`**

In `cv/portfolio.js`, `hydrateContent`, directly after `setText('[data-modal-description]', data.description);`:

```js
      // Live Site Link (optional per project)
      const liveLink = fragment.querySelector('[data-modal-link]');
      if (liveLink) {
        if (data.url) {
          liveLink.href = data.url;
          liveLink.hidden = false;
        } else {
          liveLink.remove();
        }
      }
```

- [ ] **Step 6: Style the link**

In `cv/style.css`, after the `.modal-section li::before { … }` block (ends line 1248):

```css

/* Live site link (projects with a url) */
.modal-live-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  margin-block-start: var(--space-md);
  padding: var(--space-xs) var(--space-md);
  border: var(--border-width) solid var(--color-accent-medium);
  border-radius: var(--border-radius-md);
  background: var(--color-accent-light);
  color: var(--color-accent-contrast);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  transition: var(--transition-all-fast);
}

.modal-live-link:hover {
  background: var(--color-accent-medium);
  color: var(--color-accent-contrast);
}

.modal-live-link[hidden] {
  display: none;
}
```

(`display: inline-flex` would otherwise override the `hidden` attribute.)

- [ ] **Step 7: Tag VaseCreator and give it a url**

In `cv/project-data.js`, `vasecreator-web-platform`: add `url` after `year`, and change `categories`:

```js
    year: '2025',
    url: 'https://vasecreator.com/',
```

```js
    categories: ['software', 'web'],
```

- [ ] **Step 8: Run the check to verify it passes**

Run: `node --no-warnings "$(cygpath -m /tmp)/check-web-category.mjs" link`
Expected: `web category: vasecreator-web-platform` then `PASS (stage: link)`.

- [ ] **Step 9: Verify in the browser**

Start a server in the background: `python -m http.server 8765` (repo root). With Chrome DevTools MCP, open `http://localhost:8765/cv/portfolio.html` and check:
- Clicking **Web Design & Branding** leaves only the VaseCreator card visible; its `aria-pressed` is `"true"`.
- Opening VaseCreator shows "Visit live site ↗" under the Overview text, `href="https://vasecreator.com/"`, `target="_blank"`.
- Opening Highrise Timber Diagrid shows no link (`document.querySelector('[data-modal-link]')` is `null` while that modal is open).
- `list_console_messages` shows no errors.

- [ ] **Step 10: Commit**

```bash
git add cv/portfolio.html cv/portfolio.js cv/style.css cv/project-data.js
git commit -m "Add Web Design & Branding filter and optional live-site link

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: B&L Sprinkler Inspecties entry

**Files:**
- Create: `cv/images/bl-sprinkler_desktop.webp`, `bl-sprinkler_services.webp`, `bl-sprinkler_knowledge.webp`, `bl-sprinkler_mobile.webp`, `bl-sprinkler_logo.jpg`
- Modify: `cv/project-data.js` (new entry after `vasecreator-web-platform`)

**Interfaces:**
- Consumes: the `url` field and `'web'` category from Task 1; the check script (stage `bl`).
- Produces: project key `bl-sprinkler-inspecties`; Task 3 inserts `l2-photography` directly after it.

- [ ] **Step 1: Run the check to verify it fails**

Run: `node --no-warnings "$(cygpath -m /tmp)/check-web-category.mjs" bl`
Expected: FAIL with `missing entry bl-sprinkler-inspecties`, `bl-sprinkler-inspecties.url should be https://sprinklertankinspectie.com/`, and the order check.

- [ ] **Step 2: Capture the desktop and services screenshots**

With Chrome DevTools MCP:
1. `new_page` → `https://sprinklertankinspectie.com/`
2. `emulate` → `viewport: "1440x900x1"`; wait for the hero to render (`wait_for` the text `Uw partner in al uw sprinkleronderhoud`).
3. `take_screenshot` → `filePath: "C:/Users/kees/gewoonkees132/cv/images/bl-sprinkler_desktop.webp"`, `format: "webp"`, `quality: 82`.
4. `evaluate_script` → scroll the services heading ("Wat kunnen wij met sprinklers?") to the top: `() => { const h = [...document.querySelectorAll('h2')].find(e => e.textContent.includes('Wat kunnen wij')); h.closest('section').scrollIntoView(); }`. Wait ~500 ms for any reveal animation.
5. `take_screenshot` → `bl-sprinkler_services.webp` (same folder, webp, 82).

- [ ] **Step 3: Capture the knowledge page and mobile screenshots**

1. `navigate_page` → `https://sprinklertankinspectie.com/tb67b/`; `take_screenshot` → `bl-sprinkler_knowledge.webp`. If the top of that page is only a hero with no explanatory content, scroll to the first body section before capturing.
2. `navigate_page` → `https://sprinklertankinspectie.com/`; `emulate` → `viewport: "390x844x2,mobile,touch"`; reload; `take_screenshot` → `bl-sprinkler_mobile.webp`.
3. Check whether the WhatsApp / "Bel ons" buttons stay fixed while scrolling (scroll 800 px with `evaluate_script` and take a snapshot). Record the answer; the mobile caption in Step 5 depends on it.
4. `emulate` → `viewport: "1440x900x1"` to reset.

- [ ] **Step 4: Download the logo image and look at every capture**

```bash
curl -sL https://sprinklertankinspectie.com/images/og-image.jpg -o cv/images/bl-sprinkler_logo.jpg
ls -la cv/images/bl-sprinkler_*
```

Expected: five files, each non-empty. Open each with the Read tool and confirm it shows what its name says (no cookie banner, no half-loaded images, logo image actually shows the B&L logo). Re-capture any that fail.

- [ ] **Step 5: Add the entry**

In `cv/project-data.js`, directly after the closing `},` of `vasecreator-web-platform` (before the blank line and `'earthy-vault'`):

```js
  // -------------------------------------------------------------------------
  // CATEGORY: WEB DESIGN & BRANDING
  // -------------------------------------------------------------------------
  'bl-sprinkler-inspecties': {
    title: 'B&L Sprinkler Inspecties',
    subtitle: 'B&L Duikbedrijf Zuid — Brand & Website',
    year: '2018–2026',
    url: 'https://sprinklertankinspectie.com/',
    image: 'images/bl-sprinkler_desktop.webp',
    alt: 'The B&L Sprinkler Inspecties homepage: navy hero with the B&L logo, tagline, and a free-quote button.',
    description: "A diving company earned its living from project-based underwater work, while sprinkler tanks must be inspected under TB67B every five years. Created the B&L Sprinkler Inspecties brand, logo, and first Wix site to win that recurring work, then rebuilt it as a hand-written static site with 20 search-focused pages. Over five years, inspections grew to more than half of the company's revenue.",
    impact: [
      'Shifted 50%+ of company revenue to sprinkler tank inspections over five years',
      'Won recurring work: each inspected tank returns on a five-year cycle',
      'Designed the brand and logo, launched on Wix, then rebuilt as a 20-page hand-coded site'
    ],
    technologies: ['Brand Identity', 'Logo Design', 'Wix', 'HTML/CSS/JS', 'Local SEO'],
    categories: ['web'],
    metrics: { primary: '50%+', secondary: 'Revenue from Inspections' },
    gallery: [
      {
        src: 'images/bl-sprinkler_desktop.webp',
        caption: 'Homepage: the B&L brand in navy and blue, leading straight to a free quote or the services.'
      },
      {
        src: 'images/bl-sprinkler_logo.jpg',
        caption: 'Brand: the B&L Sprinkler Inspecties logo, designed with the first Wix site.'
      },
      {
        src: 'images/bl-sprinkler_services.webp',
        caption: 'Services: five numbered services, each with its own page written around what clients search for.'
      },
      {
        src: 'images/bl-sprinkler_knowledge.webp',
        caption: 'TB67B page: the inspection regime explained in plain Dutch, one of the knowledge pages that bring in search traffic.'
      },
      {
        src: 'images/bl-sprinkler_mobile.webp',
        caption: 'Mobile: call and WhatsApp buttons stay within reach on every page.'
      }
    ]
  },
```

If Step 3.3 found the buttons are **not** fixed, change the mobile caption to `'Mobile: the same navy brand, with call and WhatsApp buttons one tap away.'` If the alt text or any caption doesn't match what the capture shows, reword it to match the image.

- [ ] **Step 6: Run the check to verify it passes**

Run: `node --no-warnings "$(cygpath -m /tmp)/check-web-category.mjs" bl`
Expected: `web category: vasecreator-web-platform, bl-sprinkler-inspecties` then `PASS (stage: bl)`.

- [ ] **Step 7: Verify in the browser**

Reload `http://localhost:8765/cv/portfolio.html` (hard reload so `project-data.js` isn't cached). Check:
- The B&L card appears under **Web Design & Branding** and **All Projects**, not under the other three pills.
- Its modal shows metric `50%+ / Revenue from Inspections`, year `2018–2026`, and the link to `https://sprinklertankinspectie.com/`.
- The Gallery tab shows 5 / 5 images, all loaded (`evaluate_script`: every `.gallery-item img` has `complete && naturalWidth > 0`).
- No console errors.

- [ ] **Step 8: Commit**

```bash
git add cv/project-data.js cv/images/bl-sprinkler_*
git commit -m "Add B&L Sprinkler Inspecties portfolio item

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: L2. Photography entry

**Files:**
- Create: `cv/images/l2-photography_desktop.webp`, `l2-photography_focus.webp`, `l2-photography_collection.webp`, `l2-photography_rates.webp`, `l2-photography_mobile.webp`
- Modify: `cv/project-data.js` (new entry after `bl-sprinkler-inspecties`)

**Interfaces:**
- Consumes: `url` field and `'web'` category (Task 1); `bl-sprinkler-inspecties` entry position (Task 2); check script (stage `l2`).
- Produces: project key `l2-photography`.

- [ ] **Step 1: Run the check to verify it fails**

Run: `node --no-warnings "$(cygpath -m /tmp)/check-web-category.mjs" l2`
Expected: FAIL with `missing entry l2-photography`, its url check, and the order check.

- [ ] **Step 2: Capture desktop and focus screenshots**

With Chrome DevTools MCP:
1. `new_page` → `https://l2fotografie.nl/`; `emulate` → `viewport: "1440x900x1"`. Wait ~2 s for photos to decode and any intro to settle.
2. `take_screenshot` → `filePath: "C:/Users/kees/gewoonkees132/cv/images/l2-photography_desktop.webp"`, `format: "webp"`, `quality: 82`.
3. `take_snapshot` to learn the page's controls. Bring one photograph into focus so its species plate (vernacular + Latin name, bottom-left) blooms: pan the plane (`drag` from the viewport centre ~300 px) or click a photograph. Confirm in a snapshot that the plate is showing, then `take_screenshot` → `l2-photography_focus.webp`.
4. While doing this, confirm the copy claim that each photo "comes into focus as you reach it" (others dimmed/softened, the reached one sharp). If that isn't what happens, note it; Step 5's description must be adjusted.

- [ ] **Step 3: Capture collection, rates, and mobile screenshots**

1. From the snapshot, click the **Architecture** collection in the navigation; wait ~2 s; `take_screenshot` → `l2-photography_collection.webp`. Count the collections in the navigation (expected six: Birds, Events, Products, Portraits, Lifestyle, Architecture).
2. Click the rates pill to open the rates panel; `take_screenshot` → `l2-photography_rates.webp`. Close it.
3. `emulate` → `viewport: "390x844x2,mobile,touch"`; reload; wait ~2 s; `take_screenshot` → `l2-photography_mobile.webp`.
4. `emulate` → `viewport: "1440x900x1"` to reset.

- [ ] **Step 4: Look at every capture**

```bash
ls -la cv/images/l2-photography_*
```

Expected: five non-empty files. Open each with the Read tool; confirm it shows what its name says and that photographs are fully decoded (no blank tiles). Re-capture any that fail.

- [ ] **Step 5: Add the entry**

In `cv/project-data.js`, directly after the closing `},` of `bl-sprinkler-inspecties`:

```js
  'l2-photography': {
    title: 'L2. Photography',
    subtitle: 'Independent Project — Brand & Website',
    year: '2026',
    url: 'https://l2fotografie.nl/',
    image: 'images/l2-photography_desktop.webp',
    alt: 'The L2. Photography website: photographs arranged on a pannable plane, with the L2. wordmark and collection navigation.',
    description: "A photography portfolio is usually a grid you scroll past; this brand asks the viewer to slow down. Built L2. Photography around one line, 'Look twice.': name, logo, and a blue-on-field palette in the spirit of Munich '72, then a vanilla-JavaScript site where 121 photographs sit on a hand-arranged plane you pan through, each coming into focus as you reach it.",
    impact: [
      "Designed the identity end to end: name, 'Look twice.' line, logo, and palette",
      '121 photographs in six collections, laid out on an 88 px module grid',
      'No framework: hand-written HTML, CSS, and JavaScript, served as WebP via GitHub Pages and Cloudflare'
    ],
    technologies: ['Brand Identity', 'Art Direction', 'JavaScript', 'HTML/CSS', 'Cloudflare'],
    categories: ['web'],
    metrics: { primary: '121', secondary: 'Photographs Arranged' },
    gallery: [
      {
        src: 'images/l2-photography_desktop.webp',
        caption: 'Opening view: photographs hand-arranged on a pannable plane, with the L2. wordmark and collections.'
      },
      {
        src: 'images/l2-photography_focus.webp',
        caption: 'Focus: the photograph you reach sharpens and its plate opens with the common and Latin name.'
      },
      {
        src: 'images/l2-photography_collection.webp',
        caption: 'Architecture: one of six collections, each with its own hand-made arrangement.'
      },
      {
        src: 'images/l2-photography_rates.webp',
        caption: 'Rates: shoot and print pricing in a panel that opens from a single pill.'
      },
      {
        src: 'images/l2-photography_mobile.webp',
        caption: 'Mobile: the same plane, panned by touch.'
      }
    ]
  },
```

Adjust wording to what Steps 2–3 actually showed: if the collection count isn't six, fix the impact bullet and the Architecture caption; if the focus behaviour differs, fix the description's last clause and the focus caption.

- [ ] **Step 6: Run the check to verify it passes**

Run: `node --no-warnings "$(cygpath -m /tmp)/check-web-category.mjs" l2`
Expected: `web category: vasecreator-web-platform, bl-sprinkler-inspecties, l2-photography` then `PASS (stage: l2)`.

- [ ] **Step 7: Verify in the browser**

Hard-reload `http://localhost:8765/cv/portfolio.html`. Check:
- The L2 card appears under **Web Design & Branding** and **All Projects** only.
- Its modal shows metric `121 / Photographs Arranged`, year `2026`, and the link to `https://l2fotografie.nl/`.
- Gallery shows 5 / 5 images, all loaded.
- No console errors.

- [ ] **Step 8: Commit**

```bash
git add cv/project-data.js cv/images/l2-photography_*
git commit -m "Add L2. Photography portfolio item

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: End-to-end verification

**Files:** none modified (fixes, if any, go back into the file that owns the problem).

**Interfaces:**
- Consumes: everything from Tasks 1–3.

- [ ] **Step 1: Full check script**

Run: `node --no-warnings "$(cygpath -m /tmp)/check-web-category.mjs" l2`
Expected: `PASS (stage: l2)`.

- [ ] **Step 2: Filter counts in the browser (desktop 1440×900)**

Hard-reload `http://localhost:8765/cv/portfolio.html`. For each pill, click it, wait 400 ms (filter transition is 300 ms), then run `evaluate_script`: `() => [...document.querySelectorAll('.project-card:not(.hidden)')].map(c => c.dataset.project)`. Expected:
- **Web Design & Branding** → exactly `vasecreator-web-platform`, `bl-sprinkler-inspecties`, `l2-photography`.
- **Software & Tool development** → includes `vasecreator-web-platform`; excludes the two new projects.
- **All Projects** → 29 cards (27 existing + 2 new).

- [ ] **Step 3: Link presence across modals**

Open each of VaseCreator, B&L, L2 → link present with the right `href`. Open Highrise Timber Diagrid and Agentic Mesh Audit → `document.querySelector('[data-modal-link]')` is `null`. Tab to the link with the keyboard and confirm the focus ring shows (`take_screenshot`).

- [ ] **Step 4: Mobile pass**

`emulate` → `viewport: "390x844x2,mobile,touch"`. Reload. Confirm the new pill wraps cleanly in the filter row, the two new cards render, and in the B&L modal the link sits under the Overview text without overflowing. `take_screenshot` of the modal for the handoff.

- [ ] **Step 5: Console and cleanup**

`list_console_messages` → no errors. Stop the `http.server` background process. `git status` → clean (the check script lives in the temp dir, not the repo).
