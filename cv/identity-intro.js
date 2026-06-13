/**
 * KEES SIDEBAR IDENTITY INTRO v2.0
 * ============================================================================
 * Progressive enhancement for the desktop sidebar identity block.
 * On the first page load of a browser session it types a three-line statement
 * that stacks line by line, then crossfades into the static name + title.
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
  var LINES = ['I rationalize geometry.', 'I optimize structures.', 'I teach robots to build.'];

  var TYPE_MIN_MS = 55;     // per-character lower bound
  var TYPE_JITTER_MS = 45;  // random extra per character, for a human feel
  var LINE_PAUSE_MS = 260;  // rest before the next line starts typing
  var HOLD_MS = 1200;       // the full stack rests before the crossfade
  var FADE_MS = 650;        // crossfade duration (covers the CSS opacity transitions)

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

    // Settled (two-line) height, measured before anything is hidden.
    var settledHeight = identity.offsetHeight;

    // Relative positioning hosts the absolute overlay; the static name/title
    // stay in flow (announced by screen readers) but rendered invisible.
    identity.classList.add('is-introducing');

    var layer = document.createElement('p');
    layer.className = 'identity-intro';
    layer.setAttribute('aria-hidden', 'true');

    var caret = document.createElement('span');
    caret.className = 'identity-intro-caret';

    var lineEls = LINES.map(function (text) {
      var line = document.createElement('span');
      line.className = 'identity-intro-line';
      line.appendChild(document.createTextNode(text)); // final text, for measuring
      return line;
    });
    lineEls.forEach(function (line) { layer.appendChild(line); });
    identity.appendChild(layer);

    // Measure the tallest state (all three lines) and reserve it so the nav
    // below never shifts, then clear the text — all synchronously, so the
    // fully-typed stack is never painted.
    var stackHeight = layer.offsetHeight;
    identity.style.minHeight = Math.max(settledHeight, stackHeight) + 'px';
    lineEls.forEach(function (line) { line.firstChild.data = ''; });

    // --- typing primitive --------------------------------------------------
    // Each line keeps its text in firstChild (a text node); the caret is moved
    // to the end of whichever line is currently being typed into.

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

    // --- sequence ----------------------------------------------------------

    var lineIndex = 0;

    function nextLine() {
      if (lineIndex >= LINES.length) {
        window.setTimeout(settle, HOLD_MS);
        return;
      }
      var el = lineEls[lineIndex];
      el.appendChild(caret); // caret drops to the start of the new line
      typeInto(el, LINES[lineIndex], function () {
        lineIndex++;
        window.setTimeout(nextLine, LINE_PAUSE_MS);
      });
    }

    function settle() {
      caret.classList.add('is-done');         // caret fades out
      layer.classList.add('is-fading');        // typed stack fades out
      identity.classList.add('is-revealing');  // static name + title fade in
      window.setTimeout(finish, FADE_MS);
    }

    function finish() {
      // Crossfade complete: drop the overlay and restore the natural layout.
      if (layer.parentNode) layer.parentNode.removeChild(layer);
      identity.classList.remove('is-introducing', 'is-revealing');
      identity.style.minHeight = '';
    }

    nextLine();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
