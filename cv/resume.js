/**
 * KEES RESUME - AWWARDS-STANDARD INTERACTIVE SYSTEM v1.0
 * ============================================================================
 * This script provides the interactive functionality for the resume page (index.html).
 * It is built with the same high standards of performance and maintainability
 * as the portfolio script.
 * 
 * CORE FEATURES:
 * - **Performant Scroll-Spy:** Uses the IntersectionObserver API to efficiently
 *   detect the current section in the viewport without expensive scroll event calculations.
 * - **Dynamic Active State:** Updates the sidebar navigation to highlight the
 *   currently active section.
 * - **Scroll Progress Bar:** Visually indicates the user's scroll depth on the page.
 * ============================================================================
 */

(function() {
  'use strict';

  // ========================================================================
  // 1. UTILITY FUNCTIONS
  // ========================================================================

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

  // ========================================================================
  // 2. SCROLLSPY & PROGRESS MODULE
  // ========================================================================

  class ResumeScrollSpy {
    constructor() {
      this.elements = {
        progressBar: $('.scroll-progress-bar'),
        progressContainer: $('.scroll-progress-container'),
        nav: $('.main-nav'),
        navLinks: $$('.main-nav a')
      };

      if (!this.elements.progressBar) {
        console.warn('Scroll spy functionality requires a .scroll-progress-bar element.');
        return;
      }

      this.sections = $$('main > section[id]');
      this.currentSectionId = null;

      this.init();
    }

    init() {
      // Debounced scroll handler for the progress bar
      this.handleScroll = this.debounce(() => this.updateProgress(), 10);
      window.addEventListener('scroll', this.handleScroll, { passive: true });

      // IntersectionObserver for section highlighting
      this.setupIntersectionObserver();

      // Travelling active-chapter indicator in the sidebar nav
      this.setupNavIndicator();

      // Initial call to set the state
      this.updateProgress();
    }

    /**
     * Debounce function to limit how often a function is called.
     * @param {Function} func The function to debounce.
     * @param {number} wait The delay in milliseconds.
     * @returns {Function} The debounced function.
     */
    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }

    /**
     * Sets up the IntersectionObserver to watch for sections entering the viewport.
     * This is far more performant than calculating positions on every scroll event.
     */
    setupIntersectionObserver() {
      const options = {
        rootMargin: '-40% 0px -60% 0px', // Trigger when a section is in the middle 40% of the viewport
        threshold: 0
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            if (sectionId !== this.currentSectionId) {
              this.currentSectionId = sectionId;
              this.updateActiveNav(sectionId);
            }
          }
        });
      }, options);

      this.sections.forEach(section => {
        if (section) observer.observe(section);
      });
    }

    /**
     * Creates the travelling active-chapter indicator and anchors it to the
     * current active link. Replaces the per-link CSS pill (kept as no-JS fallback).
     */
    setupNavIndicator() {
      const nav = this.elements.nav;
      if (!nav) return;

      const indicator = document.createElement('span');
      indicator.className = 'nav-indicator';
      indicator.setAttribute('aria-hidden', 'true');
      nav.classList.add('has-indicator');
      nav.appendChild(indicator);
      this.elements.indicator = indicator;

      this.positionIndicator(nav.querySelector('a.active'), { immediate: true });

      // Re-anchor on layout changes (resize, font load)
      new ResizeObserver(() => {
        this.positionIndicator(nav.querySelector('a.active'), { immediate: true });
      }).observe(nav);
    }

    /**
     * Moves the indicator to the given nav link. The glide itself is pure CSS;
     * this only sets the two edge positions and the travel direction, so rapid
     * scroll-spy updates retarget smoothly mid-flight.
     * @param {HTMLAnchorElement|null} link The active nav link.
     * @param {{immediate?: boolean}} [options] Set immediate to jump without transition.
     */
    positionIndicator(link, { immediate = false } = {}) {
      const { indicator, nav } = this.elements;
      if (!indicator || !link) return;

      const pillHeight = link.offsetHeight * 0.6;
      const top = link.offsetTop + (link.offsetHeight - pillHeight) / 2;
      const bottom = nav.clientHeight - top - pillHeight;
      const movingDown = top > (parseFloat(indicator.style.top) || 0);

      indicator.classList.toggle('is-moving-down', movingDown);
      if (immediate) indicator.classList.add('is-static');
      indicator.style.top = `${top}px`;
      indicator.style.bottom = `${bottom}px`;
      if (immediate) {
        void indicator.offsetHeight; // flush styles so the jump isn't transitioned
        indicator.classList.remove('is-static');
      }
    }

    /**
     * Updates the scroll progress bar based on the page scroll position.
     */
    updateProgress() {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPosition = window.pageYOffset;
      const progress = scrollHeight > 0 ? (scrollPosition / scrollHeight) * 100 : 0;

      if (this.elements.progressBar) {
        this.elements.progressBar.style.transform = `scaleY(${progress / 100})`;
      }
      if (this.elements.progressContainer) {
        this.elements.progressContainer.setAttribute('aria-valuenow', Math.round(progress));
      }
    }

    /**
     * Updates the active state in the sidebar navigation.
     * @param {string} sectionId The ID of the currently active section.
     */
    updateActiveNav(sectionId) {
      this.elements.navLinks.forEach(link => {
        const isActive = link.getAttribute('href') === `#${sectionId}`;
        link.classList.toggle('active', isActive);
        link.setAttribute('aria-current', isActive ? 'page' : 'false');
      });

      const activeLink = this.elements.navLinks.find(link => link.classList.contains('active'));
      this.positionIndicator(activeLink);
    }
  }

  // ========================================================================
  // 3. APPLICATION INITIALIZATION
  // ========================================================================

  class ResumeApp {
    constructor() {
      this.init();
    }

    init() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.bootstrap());
      } else {
        this.bootstrap();
      }
    }

    bootstrap() {
      try {
        new ResumeScrollSpy();
        console.log('✅ Resume page interactive features initialized.');
      } catch (error) {
        console.error('❌ Failed to initialize resume page modules:', error);
      }
    }
  }

  // Kick off the application
  new ResumeApp();

})();
