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
        currentTitle: $('#sidebar-current-title'),
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

      // Update the sidebar title
      const activeLink = this.elements.navLinks.find(link => link.classList.contains('active'));
      if (activeLink && this.elements.currentTitle) {
        this.elements.currentTitle.textContent = activeLink.textContent.trim();
      }
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
