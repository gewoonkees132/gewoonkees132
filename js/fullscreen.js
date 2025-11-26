import { Component } from './component.js';
import { EventBus, Utils } from './utils.js';
import { CONFIG } from './config.js';
import { appStore } from './store.js';

export class FullscreenGallery extends Component {
    constructor() {
        super(CONFIG.SELECTORS.fullscreenContainer);
        
        this.dom = {
            wrapper: this.find(CONFIG.SELECTORS.fullscreenSliderWrapper),
            closeBtn: this.find(CONFIG.SELECTORS.fullscreenCloseButton),
            mainContent: document.querySelector(CONFIG.SELECTORS.mainContent)
        };
        
        this.state = { isOpen: false, currentIndex: 0, currentData: [] };

        if (this.el) this._bindInternalEvents();
    }

    _bindInternalEvents() {
        this.subscribe(CONFIG.EVENTS.PROJECT_SELECTED, (data) => this.open(data.index, data.projects));
        this.addEvent(this.dom.closeBtn, 'click', () => this.close());
        this.addEvent(document, 'keydown', (e) => this._handleKey(e));
    }

    destroy() {
        super.destroy();
    }

    open(index, projects) {
        if (this.state.isOpen) return;
        
        this.state = { isOpen: true, currentIndex: index, currentData: projects };
        appStore.setState({ isFullscreen: true });

        // PERF: Render slides. 
        this._renderSlides();
        
        this.el.hidden = false;
        this.el.setAttribute("aria-hidden", "false");
        document.documentElement.classList.add(CONFIG.CLASSES.fullscreenActive);
        
        if (this.dom.mainContent) this.dom.mainContent.inert = true;

        requestAnimationFrame(() => {
            this.el.classList.add(CONFIG.CLASSES.active);
            // Instant scroll to position, then smooth transition
            this._scrollToSlide(index, "auto");
            this._updateClasses(); 
            this.dom.closeBtn?.focus();
        });
    }

    close() {
        if (!this.state.isOpen) return;

        this.el.classList.remove(CONFIG.CLASSES.active);
        document.documentElement.classList.remove(CONFIG.CLASSES.fullscreenActive);
        
        if (this.dom.mainContent) this.dom.mainContent.inert = false;

        Utils.wait(400).then(() => {
            this.state.isOpen = false;
            this.el.hidden = true;
            this.el.setAttribute("aria-hidden", "true");
            // PERF: Free memory
            this.dom.wrapper.replaceChildren(); 
            appStore.setState({ isFullscreen: false });
        });
    }

    _renderSlides() {
        const frag = document.createDocumentFragment();
        
        // PERF Optimization:
        // Even with lazy-loading, creating 100+ slides is heavy.
        // However, assuming < 200 items, strict DOM creation is acceptable 
        // IF the content inside is lightweight.
        // We use decoding="async" and loading="lazy" strictly.
        
        this.state.currentData.forEach((p, i) => {
            const slide = document.createElement("div");
            slide.className = "fullscreen-slide";
            
            // PERF: Only load the target image eagerly. 
            // Neighbors get lazy loaded, others are far lazy loaded.
            const isNear = Math.abs(i - this.state.currentIndex) <= 1;
            
            const img = document.createElement("img");
            img.src = p.src;
            img.loading = isNear ? "eager" : "lazy";
            img.decoding = "async"; // Critical for smooth sliding
            
            slide.onclick = () => i !== this.state.currentIndex && this.navigate(i);
            
            slide.appendChild(img);
            frag.appendChild(slide);
        });
        this.dom.wrapper.replaceChildren(frag);
    }

    navigate(index) {
        if (index < 0 || index >= this.state.currentData.length) return;
        this.state.currentIndex = index;
        this._scrollToSlide(index);
        this._updateClasses();
    }

    _scrollToSlide(index, behavior = "smooth") {
        const target = this.dom.wrapper.children[index];
        if (!target) return;
        
        const offset = target.offsetLeft - (this.dom.wrapper.clientWidth / 2) + (target.clientWidth / 2);
        this.dom.wrapper.scrollTo({ left: offset, behavior });
    }

    _updateClasses() {
        // PERF: Batch DOM reads/writes
        // We only toggle classes. The CSS handles opacity transitions (Compositor).
        const children = this.dom.wrapper.children;
        const current = this.state.currentIndex;
        
        // Only update if changed to avoid recalc style
        for (let i = 0; i < children.length; i++) {
            const slide = children[i];
            const isActive = i === current;
            if (slide.classList.contains(CONFIG.CLASSES.activeSlide) !== isActive) {
                slide.classList.toggle(CONFIG.CLASSES.activeSlide, isActive);
            }
        }
    }

    _handleKey(e) {
        if (!this.state.isOpen) return;
        const map = {
            'Escape': () => this.close(),
            'ArrowLeft': () => this.navigate(this.state.currentIndex - 1),
            'ArrowRight': () => this.navigate(this.state.currentIndex + 1)
        };
        if (map[e.key]) {
            e.preventDefault();
            map[e.key]();
        }
    }
}