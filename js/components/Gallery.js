import { Component } from '/js/core/component.js';
import { appStore } from '/js/core/store.js';
import { EventBus } from '/js/utils/utils.js';
import { CONFIG } from '/js/config.js';
import { generateSrcset, galleryImageSizes } from '/js/utils/image.js';

export class ScrollGallery extends Component {
    constructor(el) {
        super(el);
        
        this.dom = {
            thumbCol: this.find(CONFIG.SELECTORS.thumbnailScroller),
            mainCol: this.find(CONFIG.SELECTORS.mainImageScroller),
            cursor: this.find(CONFIG.SELECTORS.activeCursor),
            scrollContainer: this.find(CONFIG.SELECTORS.mainImageColumn)
        };

        this.items = []; 
        this.observer = null;
        this.renderTask = null; // Track the current render task

        this._init();
    }

    _init() {
        if (!this.el) return;

        // PERF: Debounce rapid filter changes to prevent layout thrashing
        this.subscribe('state:projects', this.render);
        this.subscribe('state:activeFilter', this.render);
        
        // Event delegation is efficient, keep it.
        this.addEvent(this.el, 'click', (e) => this._handleClick(e));
        
        this.observer = new IntersectionObserver(this._onIntersect.bind(this), {
            root: this.dom.scrollContainer,
            rootMargin: '-10% 0px -10% 0px',
            threshold: 0.1 // PERF: Lower threshold triggers faster
        });
    }

    destroy() {
        if (this.observer) this.observer.disconnect();
        if (this.renderTask) cancelAnimationFrame(this.renderTask);
        super.destroy(); 
    }

    render = () => {
        // Cancel any pending render loops from previous filters
        if (this.renderTask) cancelAnimationFrame(this.renderTask);

        const projects = appStore.getFilteredProjects();
        this.items = [];
        this.observer.disconnect();
        
        // PERF: Use replaceChildren for efficient DOM clearing
        this._clearGallery();

        if (projects.length === 0) {
            this._displayEmptyMessage();
            return;
        }

        // PERF: Time-Sliced Rendering Strategy
        // 1. Render the first batch immediately (viewport visible)
        // 2. Schedule the rest in micro-tasks to keep main thread responsive
        const INITIAL_BATCH_SIZE = 6; 
        const CHUNK_SIZE = 10;
        
        let currentIndex = 0;

        const processChunk = () => {
            const fragmentThumb = document.createDocumentFragment();
            const fragmentMain = document.createDocumentFragment();
            
            const limit = Math.min(currentIndex + CHUNK_SIZE, projects.length);
            
            for (let i = currentIndex; i < limit; i++) {
                const p = projects[i];
                const { thumb, main } = this._createGalleryItem(p, i);
                
                this.items.push({ thumb, main });
                fragmentThumb.appendChild(thumb);
                fragmentMain.appendChild(main);
                this.observer.observe(main);
            }

            // Append chunk to DOM
            this.dom.thumbCol.appendChild(fragmentThumb);
            this.dom.mainCol.appendChild(fragmentMain);

            currentIndex = limit;

            if (currentIndex < projects.length) {
                // Schedule next chunk. 
                // Using requestAnimationFrame ensures we paint between chunks.
                this.renderTask = requestAnimationFrame(processChunk);
            }
        };

        // Render initial batch synchronously for LCP/FCP
        currentIndex = 0;
        const initialLimit = Math.min(INITIAL_BATCH_SIZE, projects.length);
        
        const initialFragThumb = document.createDocumentFragment();
        const initialFragMain = document.createDocumentFragment();

        for (let i = 0; i < initialLimit; i++) {
            const p = projects[i];
            const { thumb, main } = this._createGalleryItem(p, i);
            this.items.push({ thumb, main });
            initialFragThumb.appendChild(thumb);
            initialFragMain.appendChild(main);
            this.observer.observe(main);
        }
        
        this.dom.thumbCol.appendChild(initialFragThumb);
        this.dom.mainCol.appendChild(initialFragMain);
        
        currentIndex = initialLimit;

        // Reset view position
        this._resetView();

        // Kick off the rest if needed
        if (currentIndex < projects.length) {
            // PERF: Use idle callback if available, else RAF. 
            // This prioritizes user input over rendering off-screen items.
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => {
                    this.renderTask = requestAnimationFrame(processChunk);
                });
            } else {
                this.renderTask = requestAnimationFrame(processChunk);
            }
        }
    }

    _createGalleryItem(project, index) {
        // Thumb - simplified structure
        const thumb = document.createElement('button');
        thumb.className = CONFIG.CLASSES.thumbItem;
        thumb.dataset.index = index;
        thumb.setAttribute('aria-label', `View ${project.title}`);
        
        // PERF: Explicit width/height to prevent reflows
        thumb.innerHTML = `<img 
            src="${project.src}" 
            alt="" 
            loading="lazy" 
            decoding="async"
            width="150"
            height="100">`;

        // Main Image
        const main = document.createElement('div');
        main.className = CONFIG.CLASSES.mainItem;
        main.dataset.index = index;
        main.tabIndex = 0;
        
        // PERF: Do NOT create the <img> tag yet if it's far down the list.
        // However, since we are using content-visibility: auto in CSS, 
        // we can safely create the node, and the browser will defer the painting.
        const img = this._createMainImage(project, index);
        main.appendChild(img);

        return { thumb, main };
    }

    _createMainImage(project, index) {
        const img = document.createElement('img');
        
        // PERF: Use low-res placeholder or just src. 
        // Assuming src is efficient enough with srcset.
        img.src = project.src;
        img.alt = project.title || 'Project';
        img.width = 1200; 
        img.height = 800; 
        img.srcset = generateSrcset(project.src);
        img.sizes = galleryImageSizes;
        img.decoding = "async"; // Critical for main thread unblocking

        // PERF: Strict loading strategy
        if (index === 0) {
            img.fetchPriority = "high";
            img.loading = "eager";
        } else {
            img.loading = "lazy";
            img.fetchPriority = "low";
        }
        return img;
    }

    _clearGallery() {
        // PERF: replaceChildren is faster than innerHTML = ''
        this.dom.mainCol.replaceChildren();
        this.dom.thumbCol.replaceChildren();
    }

    _displayEmptyMessage() {
        this.dom.mainCol.innerHTML = `<div class="gallery-empty-message">No projects found.</div>`;
        this.dom.cursor.style.opacity = '0';
    }

    _resetView() {
        this.dom.scrollContainer.scrollTop = 0;
        this._updateActive(0);
    }

    _handleClick(e) {
        // Event delegation logic remains same
        const thumb = e.target.closest(`.${CONFIG.CLASSES.thumbItem}`);
        const main = e.target.closest(`.${CONFIG.CLASSES.mainItem}`);

        if (thumb) {
            const index = parseInt(thumb.dataset.index, 10);
            this.items[index]?.main.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (main) {
            const index = parseInt(main.dataset.index, 10);
            const projects = appStore.getFilteredProjects();
            EventBus.emit(CONFIG.EVENTS.PROJECT_SELECTED, { index, projects });
        }
    }

    _onIntersect(entries) {
        // PERF: Find the one with max intersection ratio for accuracy
        let maxRatio = 0;
        let activeIndex = -1;

        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
                maxRatio = entry.intersectionRatio;
                activeIndex = parseInt(entry.target.dataset.index, 10);
            }
        });

        if (activeIndex !== -1) {
            this._updateActive(activeIndex);
        }
    }

    _updateActive(index) {
        if (!this.items[index]) return;

        // PERF: Batch DOM updates via simple class toggles
        // Note: In a virtualized list, we would only update visible, 
        // but here we update all for simplicity as 'active' class is lightweight.
        const prevActive = this.dom.thumbCol.querySelector(`.${CONFIG.CLASSES.active}`);
        if (prevActive) {
            prevActive.classList.remove(CONFIG.CLASSES.active);
            prevActive.setAttribute("aria-current", "false");
        }

        const nextActive = this.items[index].thumb;
        nextActive.classList.add(CONFIG.CLASSES.active);
        nextActive.setAttribute("aria-current", "true");

        this._moveCursor(index);
    }

    _moveCursor(index) {
        const target = this.items[index]?.thumb;
        if (!target || !this.dom.cursor) return;

        // PERF: Use transform for cursor movement (Compositor only)
        requestAnimationFrame(() => {
            this.dom.cursor.style.transform = `translateY(${target.offsetTop}px)`;
            this.dom.cursor.style.height = `${target.offsetHeight}px`;
            this.dom.cursor.style.opacity = '1';
        });
    }
}