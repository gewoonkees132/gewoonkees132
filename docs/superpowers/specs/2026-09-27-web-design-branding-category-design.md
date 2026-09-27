# Web Design & Branding Portfolio Category — Design

**Date:** 2026-09-27
**Status:** Approved
**Pages:** `cv/portfolio.html`

## Problem

The portfolio filters projects into Engineering, Software & Tool development, and Digital Fabrication. Brand and website work — client sites and personal brands — has no home. Web design is judged by visiting the live site, but the project modal has no way to link out.

## Scope

1. A fourth filter pill, **Web Design & Branding**.
2. Two new projects in it: **B&L Sprinkler Inspecties** and **L2. Photography**.
3. The existing **VaseCreator Web App** also joins the category.
4. An optional `url` field on projects, rendered as a "Visit live site ↗" link in the modal.
5. Screenshots of both new sites for the cards and galleries.

Out of scope: embedding live sites (iframes), linking from the card itself, printing URLs.

## 1. Category and filter

In `cv/portfolio.html`, add after the Digital Fabrication pill:

```html
<button class="filter-pill" data-filter="web" aria-pressed="false" type="button">Web Design & Branding</button>
```

Category key: `web`. Filtering already matches on each project's `categories`, so `portfolio.js` needs no filter changes.

| Project | `categories` |
|---|---|
| L2. Photography | `['web']` |
| B&L Sprinkler Inspecties | `['web']` |
| VaseCreator Web App | `['software', 'web']` (was `['software']`) |

## 2. Project entries (`cv/project-data.js`)

Both entries go directly after `vasecreator-web-platform`, under a new header comment `// CATEGORY: WEB DESIGN & BRANDING`, in this order: B&L, then L2. The three web projects then sit together in the "All Projects" grid.

Copy follows the existing pattern: the description runs problem → work → result, three impact bullets, five technologies. Every factual claim is checked against the live site before committing.

### 2a. `bl-sprinkler-inspecties`

Client: B&L Duikbedrijf Zuid, a diving company in Sint-Michielsgestel (founded 1989). Kees designed the brand and logo, built the original Wix site, and later rebuilt it as a hand-written static site that keeps the brand colours.

- **title:** `B&L Sprinkler Inspecties`
- **subtitle:** `B&L Duikbedrijf Zuid — Brand & Website`
- **year:** `2018–2026`
- **url:** `https://sprinklertankinspectie.com/`
- **image / alt:** `images/bl-sprinkler_desktop.webp` — "The B&L Sprinkler Inspecties homepage: navy hero with the B&L logo, tagline, and a free-quote button."
- **metrics:** `{ primary: '50%+', secondary: 'Revenue from Inspections' }`
- **description:** "A diving company earned its living from project-based underwater work, while sprinkler tanks must be inspected under TB67B every five years. Created the B&L Sprinkler Inspecties brand, logo, and first Wix site to win that recurring work, then rebuilt it as a hand-written static site with 20 search-focused pages. Over five years, inspections grew to more than half of the company's revenue."
- **impact:**
  - "Shifted 50%+ of company revenue to sprinkler tank inspections over five years"
  - "Won recurring work: each inspected tank returns on a five-year cycle"
  - "Designed the brand and logo, launched on Wix, then rebuilt as a 20-page hand-coded site"
- **technologies:** `['Brand Identity', 'Logo Design', 'Wix', 'HTML/CSS/JS', 'Local SEO']`
- **categories:** `['web']`

### 2b. `l2-photography`

- **title:** `L2. Photography`
- **subtitle:** `Independent Project — Brand & Website`
- **year:** `2026`
- **url:** `https://l2fotografie.nl/`
- **image / alt:** `images/l2-photography_desktop.webp` — "The L2. Photography website: photographs arranged on a pannable plane, with the L2. wordmark and collection navigation."
- **metrics:** `{ primary: '121', secondary: 'Photographs Arranged' }`
- **description:** "A photography portfolio is usually a grid you scroll past; this brand asks the viewer to slow down. Built L2. Photography around one line, 'Look twice.': name, logo, and a blue-on-field palette in the spirit of Munich '72, then a vanilla-JavaScript site where 121 photographs sit on a hand-arranged plane you pan through, each coming into focus as you reach it."
- **impact:**
  - "Designed the identity end to end: name, 'Look twice.' line, logo, and palette"
  - "121 photographs in six collections, laid out on an 88 px module grid"
  - "No framework: hand-written HTML, CSS, and JavaScript, served as WebP via GitHub Pages and Cloudflare"
- **technologies:** `['Brand Identity', 'Art Direction', 'JavaScript', 'HTML/CSS', 'Cloudflare']`
- **categories:** `['web']`

### 2c. `vasecreator-web-platform` (edit)

- `categories: ['software', 'web']`
- add `url: 'https://vasecreator.com/'`

## 3. Live-site link

**Template** (`cv/portfolio.html`, `#project-modal-template`): at the end of the Overview section, after `<p data-modal-description>`:

```html
<a class="modal-live-link" data-modal-link href="" target="_blank" rel="noopener" hidden>Visit live site <span aria-hidden="true">↗</span></a>
```

**Hydration** (`cv/portfolio.js`, `hydrateContent`): if `data.url` is set, assign it to `href` and remove `hidden`; otherwise remove the element from the fragment. Projects without `url` render exactly as today.

**Style** (`cv/style.css`): `.modal-live-link` is an inline-flex pill that follows the `.filter-pill` look (border, radius, hover, focus-visible ring) with a small top margin. `cv/portfolio-print.css` hides it.

The link lives only in the modal: the card is a `<button>`, and interactive content cannot be nested inside a button.

## 4. Screenshots

Captured from the live sites with headless Chrome (DevTools MCP), saved as WebP in `cv/images/`. Desktop captures use a 1440×900 viewport, which matches the card's 16:10 image frame.

**L2. Photography**

| File | Content |
|---|---|
| `l2-photography_desktop.webp` | Opening plane (card + modal hero) |
| `l2-photography_focus.webp` | One photograph in focus with its caption/species plate |
| `l2-photography_rates.webp` | Rates panel open |
| `l2-photography_collection.webp` | A second collection, e.g. Architecture |
| `l2-photography_mobile.webp` | Mobile layout, 390×844 |

**B&L Sprinkler Inspecties**

| File | Content |
|---|---|
| `bl-sprinkler_desktop.webp` | Homepage hero (card + modal hero) |
| `bl-sprinkler_services.webp` | Numbered services section |
| `bl-sprinkler_knowledge.webp` | A TB67B / knowledge article page |
| `bl-sprinkler_mobile.webp` | Mobile layout with the call / WhatsApp buttons, 390×844 |
| `bl-sprinkler_logo.jpg` | The site's `og-image.jpg` (logo card), downloaded as-is |

Each goes into the project's `gallery` with a caption in the existing style ("Label: sentence."). If a planned screen does not read well as a still, it is swapped for a better view and noted in the handoff.

## 5. Verification

No test suite (static site). Serve the repo locally and check in the browser:

- The Web Design & Branding pill shows exactly L2, B&L, and VaseCreator. Software still includes VaseCreator; the other pills are unchanged.
- The L2, B&L, and VaseCreator modals show the link, opening the right URL in a new tab; a project without `url` (e.g. Highrise Timber Diagrid) shows no link.
- All gallery images load in both new modals.
- No console errors.
- The link and cards look right at mobile width.
