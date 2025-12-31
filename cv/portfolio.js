/**
 * KEES PORTFOLIO - GOLD STANDARD EDITION (v8.0)
 * ============================================================================
 * PRINCIPLES:
 * 1. Strict DOM Creation: No `innerHTML` for structural elements (Security).
 * 2. Event Delegation: Single listeners on containers (Memory).
 * 3. Layout Thrashing Defense: Batched reads/writes (Performance).
 * 4. Accessibility: Rigorous focus management and ARIA states.
 * ============================================================================
 */

(function() {
  'use strict';

  // --- CONFIGURATION ---
  const CONFIG = {
    SCROLL_DEBOUNCE: 15,
    FILTER_TRANSITION: 300,
    EAGER_LOAD_LIMIT: 4 // Optimized for LCP
  };

  // --- UTILS: STRICT DOM CREATION ---
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

  /**
   * Safe Element Creator.
   * Avoids innerHTML parsing overhead and XSS vectors.
   */
  const createElement = (tag, className = '', attributes = {}, children = []) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'textContent') el.textContent = value;
      else if (key === 'dataset') Object.entries(value).forEach(([dKey, dVal]) => el.dataset[dKey] = dVal);
      else el.setAttribute(key, value);
    });

    children.forEach(child => {
      if (typeof child === 'string') el.appendChild(document.createTextNode(child));
      else if (child instanceof Node) el.appendChild(child);
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
      this.init();
    }

    init() {
      // Throttled Scroll Listener
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            this.updateProgress();
            ticking = false;
          });
          ticking = true;
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
      const progress = scrollTotal > 0 ? window.pageYOffset / scrollTotal : 0;
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
      this.viewControls = $$('.view-btn', this.el);
      
      this.activeProjectId = null;
      this.lastFocusedElement = null;
      this.galleryObserver = null;

      if (!this.el || !this.template) return;
      this.init();
    }

    init() {
      // Delegated Close Events
      this.el.addEventListener('click', (e) => {
        if (e.target === this.overlay || e.target.closest('.modal-close')) {
          this.close();
        }
      });

      // Keyboard Trap & Escape
      this.el.addEventListener('keydown', (e) => this.handleKeydown(e));

      // View Switcher Logic (Delegation)
      $('.modal-view-controls').addEventListener('click', (e) => {
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

      // 1. Render Content (Strict DOM cloning)
      const content = this.template.content.cloneNode(true);
      this.hydrateContent(content, project);

      // 2. Clear & Append
      this.body.innerHTML = '';
      this.body.appendChild(content);

      // 3. Show Modal
      document.body.style.overflow = 'hidden';
      this.el.classList.add('active');
      this.el.setAttribute('aria-hidden', 'false');

      // 4. Focus Management
      // Wait for layout paint to ensure focus works
      requestAnimationFrame(() => {
        this.closeBtn.focus();
        // Initialize Gallery Observer only when visible
        this.initGalleryObserver();
      });
    }

    close() {
      if (!this.el.classList.contains('active')) return;

      this.el.classList.remove('active');
      this.el.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';

      if (this.lastFocusedElement) this.lastFocusedElement.focus();

      // Cleanup
      if (this.galleryObserver) {
        this.galleryObserver.disconnect();
        this.galleryObserver = null;
      }
      
      // Reset Views
      this.viewControls.forEach((btn, i) => {
        const isActive = i === 0;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive);
      });
    }

    hydrateContent(fragment, data) {
      // Technical View
      const setText = (sel, txt) => { const el = fragment.querySelector(sel); if(el) el.textContent = txt; };
      
      const img = fragment.querySelector('[data-modal-image]');
      img.src = data.image; img.alt = data.alt;
      
      setText('[data-modal-title]', data.title);
      setText('[data-modal-subtitle]', data.subtitle);
      setText('[data-modal-metric-primary]', data.metrics.primary);
      setText('[data-modal-metric-secondary]', data.metrics.secondary);
      setText('[data-modal-year]', data.year);
      setText('[data-modal-description]', data.description);

      // Lists
      const impactList = fragment.querySelector('[data-modal-impact]');
      data.impact.forEach(txt => impactList.appendChild(createElement('li', '', { textContent: txt })));

      const techContainer = fragment.querySelector('[data-modal-technologies]');
      data.technologies.forEach(tech => {
        techContainer.appendChild(createElement('span', 'tech-tag', { textContent: tech }));
      });

      // Narrative View (Gallery)
      this.hydrateGallery(fragment, data);
    }

    hydrateGallery(fragment, data) {
      const track = fragment.querySelector('[data-gallery-track]');
      const counterTotal = fragment.querySelector('[data-total]');
      const items = data.gallery || [{ src: data.image, caption: data.description, alt: data.alt }];

      if (counterTotal) counterTotal.textContent = items.length;

      items.forEach((item, idx) => {
        const slide = createElement('div', 'gallery-item', { dataset: { index: idx + 1 } }, [
          createElement('div', 'gallery-img-wrapper', {}, [
            createElement('img', '', { src: item.src, alt: item.caption || '', loading: 'lazy' })
          ]),
          createElement('p', 'gallery-caption', { textContent: item.caption })
        ]);
        track.appendChild(slide);
      });

      // Gallery Navigation (Listeners attached to cloned nodes)
      const prev = fragment.querySelector('.gallery-nav.prev');
      const next = fragment.querySelector('.gallery-nav.next');
      
      if(prev && next) {
        prev.addEventListener('click', () => track.scrollBy({ left: -track.offsetWidth, behavior: 'smooth' }));
        next.addEventListener('click', () => track.scrollBy({ left: track.offsetWidth, behavior: 'smooth' }));
      }
    }

    initGalleryObserver() {
      const track = this.body.querySelector('[data-gallery-track]');
      const counter = this.body.querySelector('[data-current]');
      if (!track || !counter) return;

      this.galleryObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            counter.textContent = entry.target.dataset.index;
          }
        });
      }, { root: track, threshold: 0.5 });

      track.querySelectorAll('.gallery-item').forEach(el => this.galleryObserver.observe(el));
    }

    switchView(targetBtn) {
      // 1. Update Buttons
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
      if (e.key === 'Escape') this.close();
      if (e.key === 'Tab') {
        // Robust Focus Trap
        const focusables = this.el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
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
      
      this.render();
      this.initEvents();
    }

    /**
     * Render using Fragment + Strict DOM Creation.
     * No innerHTML means no parsing overhead for list items.
     */
    render() {
      if (!this.container) return;
      const fragment = document.createDocumentFragment();
      const entries = Object.entries(this.data);

      entries.forEach(([id, proj], index) => {
        const loading = index < CONFIG.EAGER_LOAD_LIMIT ? 'eager' : 'lazy';
        
        const card = createElement('article', 'project-card', { 
          'dataset': { category: proj.categories.join(' '), project: id }
        }, [
          createElement('button', 'project-card-button', { 'aria-label': `View ${proj.title}` }, [
            createElement('div', 'project-image-container', {}, [
              createElement('span', 'project-year', { textContent: proj.year }),
              createElement('img', 'project-image', { 
                src: proj.image, alt: proj.alt, width: '800', height: '500', loading: loading 
              })
            ]),
            createElement('div', 'project-content', {}, [
              createElement('h3', 'project-title', { textContent: proj.title }),
              createElement('p', 'project-meta', { textContent: proj.subtitle }),
              createElement('p', 'project-description', { textContent: proj.description }),
              createElement('div', 'project-tech', {}, proj.technologies.map(t => 
                createElement('span', 'tech-tag', { textContent: t })
              ))
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
          this.modal.open(card.dataset.project);
        }
      });

      // Filter Logic
      this.filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => this.filter(e.currentTarget));
      });
    }

    filter(activeBtn) {
      const filter = activeBtn.dataset.filter;
      
      // Update UI
      this.filterBtns.forEach(b => {
        const active = b === activeBtn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', active);
      });

      // FLIP-like Filter Animation
      const cards = $$('.project-card', this.container);
      
      // 1. Tag for exit animation
      cards.forEach(card => {
        const cats = card.dataset.category.split(' ');
        const match = filter === 'all' || cats.includes(filter);
        
        if (!match) card.classList.add('filtering');
        else card.classList.remove('hidden'); // Ensure visible for entry
      });

      // 2. Wait for CSS transition, then hide
      setTimeout(() => {
        cards.forEach(card => {
          if (card.classList.contains('filtering')) {
            card.classList.add('hidden');
          } else {
            // Force Reflow to restart entry animation if needed
            void card.offsetWidth; 
            card.classList.remove('filtering');
          }
        });
      }, CONFIG.FILTER_TRANSITION);
    }
  }

  // --- BOOTSTRAP ---
  async function init() {
    try {
      const { projectData } = await import('./project-data.js');
      
      const modal = new ProjectModal(projectData);
      new ProjectGrid(projectData, modal);
      new ScrollProgress();
      
      console.log('⚡ Application Initialized: Gold Standard Mode');
    } catch (err) {
      console.error('Initialization failed:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();