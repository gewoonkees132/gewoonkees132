/**
 * KEES PORTFOLIO - GOLD STANDARD EDITION (v9.0 - AUDITED)
 * ============================================================================
 * PRINCIPLES:
 * 1. Strict DOM Creation: No `innerHTML` for structural elements (Security).
 * 2. Event Delegation: Single listeners on containers (Memory).
 * 3. Layout Thrashing Defense: Batched reads/writes (Performance).
 * 4. Accessibility: Rigorous focus management and ARIA states.
 * 5. Lifecycle Management: AbortController for deterministic cleanup.
 * ============================================================================
 * AUDIT FIXES APPLIED:
 * - Eliminated forced synchronous reflow in filter() loop
 * - Added defensive observer cleanup to prevent memory leaks
 * - Replaced legacy APIs (pageYOffset, innerHTML='') with modern equivalents
 * - Implemented AbortController for modal event lifecycle
 * - Added graceful degradation for initialization failures
 * ============================================================================
 */

(function () {
  'use strict';

  // --- CONFIGURATION ---
  const CONFIG = {
    SCROLL_DEBOUNCE: 15,
    FILTER_TRANSITION: 300,
    EAGER_LOAD_LIMIT: 4
  };

  // --- UTILS: STRICT DOM CREATION ---
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

  /**
   * Safe Element Creator.
   * Avoids innerHTML parsing overhead and XSS vectors.
   * @param {string} tag - HTML tag name
   * @param {string} className - CSS class(es)
   * @param {Object} attributes - Element attributes including textContent and dataset
   * @param {Array} children - Child nodes (strings become text nodes)
   * @returns {HTMLElement}
   */
  const createElement = (tag, className = '', attributes = {}, children = []) => {
    const el = document.createElement(tag);
    if (className) el.className = className;

    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'textContent') {
        el.textContent = value;
      } else if (key === 'dataset') {
        Object.entries(value).forEach(([dKey, dVal]) => {
          el.dataset[dKey] = dVal;
        });
      } else {
        el.setAttribute(key, value);
      }
    });

    children.forEach(child => {
      if (typeof child === 'string') {
        el.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        el.appendChild(child);
      }
    });

    return el;
  };

  // --- MODULE: SCROLL PROGRESS ---
  class ScrollProgress {
    constructor() {
      this.progressBar = $('.scroll-progress-bar');
      this.currentTitle = $('#sidebar-current-title');
      this.progressContainer = $('.scroll-progress-container');

      if (!this.progressBar) return;

      this.sections = $$('main section[id]');
      this.ticking = false;
      this.init();
    }

    init() {
      // Throttled Scroll Listener using rAF
      window.addEventListener('scroll', () => {
        if (!this.ticking) {
          window.requestAnimationFrame(() => {
            this.updateProgress();
            this.ticking = false;
          });
          this.ticking = true;
        }
      }, { passive: true });

      // Intersection Observer for Section Titles
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const heading = $('h2', entry.target);
            if (heading && this.currentTitle) {
              this.currentTitle.textContent = heading.textContent.trim();
            }
          }
        });
      }, { rootMargin: '-20% 0px -60% 0px' });

      this.sections.forEach(section => observer.observe(section));
    }

    updateProgress() {
      const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
      // AUDIT FIX: Replaced legacy pageYOffset with standard scrollY
      const progress = scrollTotal > 0 ? window.scrollY / scrollTotal : 0;
      this.progressBar.style.transform = `scaleY(${progress})`;
      this.progressContainer.setAttribute('aria-valuenow', Math.round(progress * 100));
    }
  }

  // --- MODULE: PROJECT MODAL ---
  class ProjectModal {
    constructor(projectData) {
      this.data = projectData;
      this.el = $('#project-modal');
      this.body = $('.modal-body');
      this.template = $('#project-modal-template');
      this.closeBtn = $('.modal-close');
      this.overlay = $('.modal-overlay');
      this.viewControlsContainer = $('.modal-view-controls');
      this.viewControls = $$('.view-btn', this.el);

      this.activeProjectId = null;
      this.lastFocusedElement = null;
      this.galleryObserver = null;
      
      // AUDIT FIX: AbortController for deterministic event cleanup
      this.sessionAbortController = null;

      if (!this.el || !this.template) return;
      this.init();
    }

    init() {
      // Delegated Close Events (persistent, not session-based)
      this.el.addEventListener('click', (e) => {
        if (e.target === this.overlay || e.target.closest('.modal-close')) {
          this.close();
        }
      });

      // View Switcher Logic (Delegation - persistent)
      this.viewControlsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.view-btn');
        if (!btn) return;
        this.switchView(btn);
      });
    }

    open(projectId) {
      const project = this.data[projectId];
      if (!project) return;

      this.activeProjectId = projectId;
      this.lastFocusedElement = document.activeElement;

      // AUDIT FIX: Create new AbortController for this modal session
      this.sessionAbortController = new AbortController();
      const { signal } = this.sessionAbortController;

      // 1. Render Content (Strict DOM cloning)
      const content = this.template.content.cloneNode(true);
      this.hydrateContent(content, project, signal);

      // 2. Clear & Append
      // AUDIT FIX: Replaced innerHTML='' with replaceChildren()
      this.body.replaceChildren();
      this.body.appendChild(content);

      // 3. Show Modal
      document.body.style.overflow = 'hidden';
      this.el.classList.add('active');
      this.el.setAttribute('aria-hidden', 'false');

      // 4. Session-scoped keyboard handler
      this.el.addEventListener('keydown', (e) => this.handleKeydown(e), { signal });

      // 5. Focus Management
      requestAnimationFrame(() => {
        this.closeBtn.focus();
        this.initGalleryObserver();
      });
    }

    close() {
      if (!this.el.classList.contains('active')) return;

      // AUDIT FIX: Abort all session-scoped event listeners
      if (this.sessionAbortController) {
        this.sessionAbortController.abort();
        this.sessionAbortController = null;
      }

      this.el.classList.remove('active');
      this.el.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';

      if (this.lastFocusedElement) {
        this.lastFocusedElement.focus();
      }

      // Cleanup gallery observer
      if (this.galleryObserver) {
        this.galleryObserver.disconnect();
        this.galleryObserver = null;
      }

      // Reset Views to default state
      this.viewControls.forEach((btn, i) => {
        const isActive = i === 0;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive);
      });
    }

    hydrateContent(fragment, data, signal) {
      // Helper for setting text content safely
      const setText = (selector, text) => {
        const el = fragment.querySelector(selector);
        if (el) el.textContent = text;
      };

      // Hero Image
      const img = fragment.querySelector('[data-modal-image]');
      if (img) {
        img.src = data.image;
        img.alt = data.alt;
      }

      // Text Content
      setText('[data-modal-title]', data.title);
      setText('[data-modal-subtitle]', data.subtitle);
      setText('[data-modal-metric-primary]', data.metrics.primary);
      setText('[data-modal-metric-secondary]', data.metrics.secondary);
      setText('[data-modal-year]', data.year);
      setText('[data-modal-description]', data.description);

      // Impact List
      const impactList = fragment.querySelector('[data-modal-impact]');
      if (impactList) {
        data.impact.forEach(text => {
          impactList.appendChild(createElement('li', '', { textContent: text }));
        });
      }

      // Technologies
      const techContainer = fragment.querySelector('[data-modal-technologies]');
      if (techContainer) {
        data.technologies.forEach(tech => {
          techContainer.appendChild(createElement('span', 'tech-tag', { textContent: tech }));
        });
      }

      // Gallery (Narrative View)
      this.hydrateGallery(fragment, data, signal);
    }

    hydrateGallery(fragment, data, signal) {
      const track = fragment.querySelector('[data-gallery-track]');
      const counterTotal = fragment.querySelector('[data-total]');

      if (!track) return;

      const items = data.gallery || [{
        src: data.image,
        caption: data.description,
        alt: data.alt
      }];

      if (counterTotal) {
        counterTotal.textContent = items.length;
      }

      items.forEach((item, idx) => {
        const slide = createElement('div', 'gallery-item', { dataset: { index: idx + 1 } }, [
          createElement('div', 'gallery-img-wrapper', {}, [
            createElement('img', '', {
              src: item.src,
              alt: item.caption || '',
              loading: 'lazy',
              decoding: 'async'
            })
          ]),
          createElement('p', 'gallery-caption', { textContent: item.caption })
        ]);
        track.appendChild(slide);
      });

      // Gallery Navigation with AbortController signal
      const prev = fragment.querySelector('.gallery-nav.prev');
      const next = fragment.querySelector('.gallery-nav.next');

      if (prev && next) {
        prev.addEventListener('click', () => {
          track.scrollBy({ left: -track.offsetWidth, behavior: 'smooth' });
        }, { signal });

        next.addEventListener('click', () => {
          track.scrollBy({ left: track.offsetWidth, behavior: 'smooth' });
        }, { signal });
      }
    }

    initGalleryObserver() {
      const track = this.body.querySelector('[data-gallery-track]');
      const counter = this.body.querySelector('[data-current]');

      if (!track || !counter) return;

      // AUDIT FIX: Defensive cleanup - disconnect existing observer first
      if (this.galleryObserver) {
        this.galleryObserver.disconnect();
      }

      this.galleryObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            counter.textContent = entry.target.dataset.index;
          }
        });
      }, { root: track, threshold: 0.5 });

      track.querySelectorAll('.gallery-item').forEach(el => {
        this.galleryObserver.observe(el);
      });
    }

    switchView(targetBtn) {
      // 1. Update Button States
      this.viewControls.forEach(btn => {
        const isActive = btn === targetBtn;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive);
      });

      // 2. Toggle Panels
      const targetId = targetBtn.getAttribute('aria-controls');
      const panels = $$('.modal-view', this.body);

      panels.forEach(panel => {
        const isTarget = panel.id === targetId;
        if (isTarget) {
          panel.classList.remove('hidden');
          panel.removeAttribute('hidden');
        } else {
          panel.classList.add('hidden');
          panel.setAttribute('hidden', '');
        }
      });
    }

    handleKeydown(e) {
      if (e.key === 'Escape') {
        this.close();
        return;
      }

      if (e.key === 'Tab') {
        // Robust Focus Trap
        const focusables = this.el.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }
  }

  // --- MODULE: PROJECT GRID ---
  class ProjectGrid {
    constructor(data, modal) {
      this.data = data;
      this.container = $('.projects-grid');
      this.modal = modal;
      this.filterBtns = $$('.filter-pill');
      this.isFiltering = false;

      if (!this.container) return;

      this.render();
      this.initEvents();
    }

    /**
     * Render using Fragment + Strict DOM Creation.
     * No innerHTML means no parsing overhead for list items.
     */
    render() {
      const fragment = document.createDocumentFragment();
      const entries = Object.entries(this.data);

      entries.forEach(([id, proj], index) => {
        const loading = index < CONFIG.EAGER_LOAD_LIMIT ? 'eager' : 'lazy';

        const card = createElement('article', 'project-card', {
          dataset: { category: proj.categories.join(' '), project: id }
        }, [
          createElement('button', 'project-card-button', {
            type: 'button',
            'aria-label': `View ${proj.title}`
          }, [
            createElement('div', 'project-image-container', {}, [
              createElement('span', 'project-year', { textContent: proj.year }),
              createElement('img', 'project-image', {
                src: proj.image,
                alt: proj.alt,
                width: '800',
                height: '500',
                loading: loading,
                decoding: 'async'
              })
            ]),
            createElement('div', 'project-content', {}, [
              createElement('h3', 'project-title', { textContent: proj.title }),
              createElement('p', 'project-meta', { textContent: proj.subtitle }),
              createElement('p', 'project-description', { textContent: proj.description }),
              createElement('div', 'project-tech', {},
                proj.technologies.map(t => createElement('span', 'tech-tag', { textContent: t }))
              )
            ])
          ])
        ]);

        fragment.appendChild(card);
      });

      this.container.appendChild(fragment);
    }

    initEvents() {
      // EVENT DELEGATION: One listener for the entire grid
      this.container.addEventListener('click', (e) => {
        const btn = e.target.closest('.project-card-button');
        if (btn) {
          const card = btn.closest('.project-card');
          if (card && card.dataset.project) {
            this.modal.open(card.dataset.project);
          }
        }
      });

      // Filter Logic with delegation
      const filterContainer = $('.filter-container');
      if (filterContainer) {
        filterContainer.addEventListener('click', (e) => {
          const btn = e.target.closest('.filter-pill');
          if (btn && !this.isFiltering) {
            this.filter(btn);
          }
        });
      }
    }

    /**
     * AUDIT FIX: Refactored filter method to eliminate forced synchronous reflow.
     * Uses batched read/write phases and CSS transitions instead of forcing reflow in loop.
     * @param {HTMLElement} activeBtn - The clicked filter button
     */
    filter(activeBtn) {
      const filter = activeBtn.dataset.filter;

      // Update button states
      this.filterBtns.forEach(btn => {
        const isActive = btn === activeBtn;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive);
      });

      const cards = $$('.project-card', this.container);

      // PHASE 1: READ - Categorize all cards without touching DOM layout
      const toHide = [];
      const toShow = [];

      cards.forEach(card => {
        const categories = card.dataset.category.split(' ');
        const isMatch = filter === 'all' || categories.includes(filter);

        if (isMatch) {
          toShow.push(card);
        } else {
          toHide.push(card);
        }
      });

      // PHASE 2: WRITE - Batch all DOM mutations
      this.isFiltering = true;

      // Start exit animation for cards to hide
      toHide.forEach(card => {
        card.classList.add('filtering-out');
      });

      // Ensure cards to show are visible and reset
      toShow.forEach(card => {
        card.classList.remove('hidden', 'filtering-out');
      });

      // Wait for exit transitions to complete, then hide
      if (toHide.length > 0) {
        // Use transitionend on the first card, or fallback timeout
        const firstHiding = toHide[0];
        
        const completeFilter = () => {
          toHide.forEach(card => {
            card.classList.add('hidden');
            card.classList.remove('filtering-out');
          });
          this.isFiltering = false;
        };

        // Listen for transition end on first element
        const handleTransitionEnd = (e) => {
          if (e.target === firstHiding && e.propertyName === 'opacity') {
            firstHiding.removeEventListener('transitionend', handleTransitionEnd);
            completeFilter();
          }
        };

        firstHiding.addEventListener('transitionend', handleTransitionEnd);

        // Fallback timeout in case transition doesn't fire
        setTimeout(() => {
          firstHiding.removeEventListener('transitionend', handleTransitionEnd);
          if (this.isFiltering) {
            completeFilter();
          }
        }, CONFIG.FILTER_TRANSITION + 50);

      } else {
        this.isFiltering = false;
      }
    }
  }

  // --- BOOTSTRAP ---
  async function init() {
    const grid = $('.projects-grid');

    try {
      const { projectData } = await import('./project-data.js');

      const modal = new ProjectModal(projectData);
      new ProjectGrid(projectData, modal);
      new ScrollProgress();

      console.log('⚡ Portfolio Initialized: Audited Gold Standard v9.0');

    } catch (err) {
      console.error('Initialization failed:', err);

      // AUDIT FIX: Graceful degradation with user-facing error
      if (grid) {
        const errorMessage = createElement('div', 'load-error', {
          role: 'alert',
          'aria-live': 'polite'
        }, [
          createElement('p', '', {
            textContent: 'Unable to load projects. Please refresh the page or try again later.'
          })
        ]);
        grid.replaceChildren(errorMessage);
      }
    }
  }

  // Start application
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();