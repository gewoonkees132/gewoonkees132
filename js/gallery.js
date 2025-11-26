import { Component } from './component.js';
import { appStore } from './store.js';
import { EventBus } from './utils.js';
import { CONFIG } from './config.js';
import { generateSrcset, galleryImageSizes } from './image.js';

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
        this.renderTask = null;

        // PERF: IntersectionObserver for "Just-In-Time" image injection.
        // We observe the container <div>, not the image.
        this.imageInjector = new IntersectionObserver(this._onImageContainerIntersect.bind(this), {
            rootMargin: '50% 0px 50% 0px', // Load when within 50% of viewport height
            threshold: 0.01
        });

        // PERF: IntersectionObserver for Active State (separate from loading)
        this.activeObserver = new IntersectionObserver(this._onActiveIntersect.bind(this), {
            root: this.dom.scrollContainer,
            rootMargin: '-45% 0px -45% 0px', // Center of viewport
            threshold: 0
        });

        this._init();
    }

    _init() {
        if (!this.el) return;
        this.subscribe('state:projects', this.render);
        this.subscribe('state:activeFilter', this.render);
        this.addEvent(this.el, 'click', (e) => this._handleClick(e));
    }

    destroy() {
        if (this.imageInjector) this.imageInjector.disconnect();
        if (this.activeObserver) this.activeObserver.disconnect();
        if (this.renderTask) cancelIdleCallback(this.renderTask);
        super.destroy(); 
    }

    render = () => {
        if (this.renderTask) cancelIdleCallback(this.renderTask);

        const projects = appStore.getFilteredProjects();
        this.items = [];
        this.imageInjector.disconnect();
        this.activeObserver.disconnect();
        
        // PERF: Fast DOM clear
        this.dom.mainCol.replaceChildren();
        this.dom.thumbCol.replaceChildren();

        if (projects.length === 0) {
            this._displayEmptyMessage();
            return;
        }

        // PERF: Time-Sliced Rendering Strategy using requestIdleCallback
        // This prevents the "Block Main Thread" warning when rendering 100+ items.
        const CHUNK_SIZE = 20;
        let currentIndex = 0;

        const processChunk = (deadline) => {
            const fragmentThumb = document.createDocumentFragment();
            const fragmentMain = document.createDocumentFragment();
            
            // Render as many as possible while time remains, or until chunk limit
            while (currentIndex < projects.length && (deadline.timeRemaining() > 1 || deadline.didTimeout)) {
                const limit = Math.min(currentIndex + CHUNK_SIZE, projects.length);
                
                for (let i = currentIndex; i < limit; i++) {
                    const p = projects[i];
                    const { thumb, main } = this._createGalleryItem(p, i);
                    
                    this.items.push({ thumb, main });
                    fragmentThumb.appendChild(thumb);
                    fragmentMain.appendChild(main);
                    
                    // Observe the empty container for lazy injection
                    this.imageInjector.observe(main);
                    this.activeObserver.observe(main);
                }
                currentIndex = limit;
                
                // Flush to DOM immediately to keep visual progress
                this.dom.thumbCol.appendChild(fragmentThumb);
                this.dom.mainCol.appendChild(fragmentMain);
            }

            if (currentIndex < projects.length) {
                this.renderTask = requestIdleCallback(processChunk);
            }
        };

        // Start the rendering pipeline
        this.renderTask = requestIdleCallback(processChunk);
        this._resetView();
    }

    _createGalleryItem(project, index) {
        // Thumb
        const thumb = document.createElement('button');
        thumb.className = CONFIG.CLASSES.thumbItem;
        thumb.dataset.index = index;
        thumb.setAttribute('aria-label', `View ${project.title}`);
        // Thumbs are small, standard lazy load is fine
        thumb.innerHTML = `<img src="${project.src}" alt="" loading="lazy" decoding="async" width="150" height="100">`;

        // Main Image Container (Empty initially)
        const main = document.createElement('div');
        main.className = CONFIG.CLASSES.mainItem;
        main.dataset.index = index;
        main.dataset.src = project.src; // Store data for injection
        main.dataset.title = project.title;
        main.tabIndex = 0;
        
        // PERF: We do NOT create the <img> here. 
        // We rely on _onImageContainerIntersect to inject it.
        // CSS 'content-visibility: auto' + 'contain-intrinsic-size' handles the layout placeholder.

        return { thumb, main };
    }

    // PERF: This is the "Just-In-Time" injector
    _onImageContainerIntersect(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const container = entry.target;
                
                // Only inject if not already present
                if (!container.querySelector('img')) {
                    const img = document.createElement('img');
                    img.src = container.dataset.src;
                    img.alt = container.dataset.title || 'Project';
                    img.width = 1200; 
                    img.height = 800; 
                    img.srcset = generateSrcset(container.dataset.src);
                    img.sizes = galleryImageSizes;
                    img.decoding = "async"; 
                    
                    // Since it's intersecting, we want it now
                    img.loading = "eager"; 
                    
                    container.appendChild(img);
                }
                
                // Stop observing once injected (memory optimization)
                observer.unobserve(container);
            }
        });
    }

    _clearGallery() {
        this.dom.mainCol.replaceChildren();
        this.dom.thumbCol.replaceChildren();
    }

    _displayEmptyMessage() {
        this.dom.mainCol.innerHTML = `<div class="gallery-empty-message">No projects found.</div>`;
        this.dom.cursor.style.opacity = '0';
    }

    _resetView() {
        this.dom.scrollContainer.scrollTop = 0;
    }

    _handleClick(e) {
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

    _onActiveIntersect(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = parseInt(entry.target.dataset.index, 10);
                this._updateActive(index);
            }
        });
    }

    _updateActive(index) {
        if (!this.items[index]) return;

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

        requestAnimationFrame(() => {
            this.dom.cursor.style.transform = `translateY(${target.offsetTop}px)`;
            this.dom.cursor.style.height = `${target.offsetHeight}px`;
            this.dom.cursor.style.opacity = '1';
        });
    }
}