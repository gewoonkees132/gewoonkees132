/**
 * KEES SIDEBAR IDENTITY INTRO v3.0
 * ============================================================================
 * Progressive enhancement for the desktop sidebar identity block.
 * On the first page load of a browser session it plays a three-phase intro:
 *   1. Greeting   — "Welcome." then "I'm Kees." type and erase on one line.
 *   2. Manifesto  — three statements type and stack, line under line.
 *   3. Settle     — the stack clears and the real name + title type in,
 *                   then seamlessly swap to the static markup.
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
  var GREETINGS = ['Welcome.', "I'm Kees."];
  var LINES = ['I rationalize geometry.', 'I optimize structures.', 'I teach robots to build.'];

  var TYPE_MIN_MS = 45;       // per-character lower bound
  var TYPE_JITTER_MS = 35;    // random extra per character, for a human feel
  var ERASE_MS = 18;          // per character
  var GREETING_HOLD_MS = 700; // a greeting rests before it erases
  var LINE_PAUSE_MS = 220;    // rest before the next stacked line types
  var STACK_HOLD_MS = 1000;   // the full stack rests before it clears
  var SETTLE_HOLD_MS = 600;   // rest after the name + title finish typing
  var CARET_FADE_MS = 700;    // matches the CSS caret opacity transition

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

    // Settled (name + title) height, measured before anything is hidden.
    var settledHeight = identity.offsetHeight;

    // Relative positioning hosts the absolute overlay; the real name/title
    // stay in flow (announced by screen readers) but rendered invisible.
    identity.classList.add('is-introducing');

    var layer = document.createElement('p');
    layer.className = 'identity-intro';
    layer.setAttribute('aria-hidden', 'true');
    identity.appendChild(layer);

    var caret = document.createElement('span');
    caret.className = 'identity-intro-caret';

    // Hold the settled (name + title) height while the intro plays. The typed
    // overlay is absolutely positioned, so it never contributes to flow — the
    // real name/title (in flow, invisible) already keep the box at exactly this
    // height. Reserving the taller stack height instead would inflate the box,
    // and because .sidebar-header and .scroll-indicator-group center their
    // children, the logo / scroll-progress beside the text (and the nav below)
    // would visibly re-center when finish() releases the hold. Reserving the
    // settled height keeps the header at its resting size the whole time.
    identity.style.minHeight = settledHeight + 'px';

    // --- primitives --------------------------------------------------------
    // Each line keeps its text in firstChild (a text node); the caret is moved
    // to the end of whichever line is currently active.

    function makeLine(className, text) {
      var el = document.createElement('span');
      el.className = className;
      el.appendChild(document.createTextNode(text || ''));
      return el;
    }

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

    // --- phase 1: greeting -------------------------------------------------

    var greetIndex = 0;

    function greet() {
      if (greetIndex >= GREETINGS.length) {
        stack();
        return;
      }
      layer.innerHTML = '';
      var line = makeLine('identity-intro-line');
      line.appendChild(caret);
      layer.appendChild(line);
      typeInto(line, GREETINGS[greetIndex], function () {
        window.setTimeout(function () {
          eraseFrom(line, function () {
            greetIndex++;
            greet();
          });
        }, GREETING_HOLD_MS);
      });
    }

    // --- phase 2: manifesto stack ------------------------------------------

    function stack() {
      layer.innerHTML = '';
      var lineEls = LINES.map(function () { return makeLine('identity-intro-line'); });
      lineEls.forEach(function (el) { layer.appendChild(el); });

      var i = 0;
      (function nextLine() {
        if (i >= LINES.length) {
          window.setTimeout(function () { clearStack(lineEls); }, STACK_HOLD_MS);
          return;
        }
        lineEls[i].appendChild(caret); // caret drops to the new line
        typeInto(lineEls[i], LINES[i], function () {
          i++;
          window.setTimeout(nextLine, LINE_PAUSE_MS);
        });
      })();
    }

    // --- phase 3: clear the stack, then type the real identity -------------

    function clearStack(lineEls) {
      var j = lineEls.length - 1;
      (function eraseNext() {
        if (j < 0) {
          settle();
          return;
        }
        lineEls[j].appendChild(caret);
        eraseFrom(lineEls[j], function () {
          j--;
          eraseNext();
        });
      })();
    }

    function settle() {
      layer.innerHTML = '';
      var nameLine = makeLine('identity-intro-line');
      nameLine.appendChild(caret);
      layer.appendChild(nameLine);
      typeInto(nameLine, nameEl.textContent, function () {
        var titleLine = makeLine('identity-intro-title-part');
        titleLine.appendChild(caret); // caret jumps to the title line
        layer.appendChild(titleLine);
        typeInto(titleLine, titleEl.textContent, function () {
          window.setTimeout(finish, SETTLE_HOLD_MS);
        });
      });
    }

    function finish() {
      caret.classList.add('is-done');
      window.setTimeout(function () {
        // Swap the typed replica for the real static block. The typography
        // matches, so this is visually seamless.
        if (layer.parentNode) layer.parentNode.removeChild(layer);
        identity.classList.remove('is-introducing');
        identity.style.minHeight = '';
      }, CARET_FADE_MS);
    }

    greet();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
