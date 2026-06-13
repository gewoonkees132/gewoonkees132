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
