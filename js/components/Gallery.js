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

        this._init();
    }

    _init() {
        if (!this.el) return;

        this.subscribe('state:projects', this.render);
        this.subscribe('state:activeFilter', this.render);
        this.addEvent(this.el, 'click', (e) => this._handleClick(e));
        
        this.observer = new IntersectionObserver(this._onIntersect.bind(this), {
            root: this.dom.scrollContainer,
            rootMargin: '-10% 0px -10% 0px',
            threshold: 0.5
        });
    }

    destroy() {
        if (this.observer) this.observer.disconnect();
        super.destroy(); 
    }

    render() {
        const projects = appStore.getFilteredProjects();
        this.items = [];
        this.observer.disconnect();

        this._clearGallery();

        if (projects.length === 0) {
            this._displayEmptyMessage();
            return;
        }
        
        const thumbFrag = document.createDocumentFragment();
        const mainFrag = document.createDocumentFragment();

        projects.forEach((p, index) => {
            const { thumb, main } = this._createGalleryItem(p, index);
            this.items.push({ thumb, main });
            thumbFrag.appendChild(thumb);
            mainFrag.appendChild(main);
            this.observer.observe(main);
        });

        this._batchUpdateDOM(thumbFrag, mainFrag);
        this._resetView();
    }

    _createGalleryItem(project, index) {
        // Thumb
        const thumb = document.createElement('button');
        thumb.className = CONFIG.CLASSES.thumbItem;
        thumb.dataset.index = index;
        thumb.setAttribute('aria-label', `View ${project.title}`);
        thumb.innerHTML = `<img 
            src="${project.src}" 
            srcset="${generateSrcset(project.src)}"
            sizes="150px"
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
        
        const img = this._createMainImage(project, index);
        
        main.appendChild(img);

        return { thumb, main };
    }

    _createMainImage(project, index) {
        const img = document.createElement('img');
        img.src = project.src;
        img.alt = project.title || 'Project';
        img.width = 1200; // Intrinsic width for aspect ratio
        img.height = 800; // Intrinsic height for aspect ratio
        img.srcset = generateSrcset(project.src);
        img.sizes = galleryImageSizes;
        img.decoding = "async";

        if (index === 0) {
            img.fetchPriority = "high";
            img.loading = "eager";
        } else if (index === 1) {
            img.loading = "eager";
            img.fetchPriority = "auto";
        } else {
            img.loading = "lazy";
        }
        return img;
    }

    _clearGallery() {
        this.dom.mainCol.innerHTML = '';
        this.dom.thumbCol.innerHTML = '';
    }

    _displayEmptyMessage() {
        this.dom.mainCol.innerHTML = `<div class="gallery-empty-message">No projects found.</div>`;
        this.dom.cursor.style.opacity = '0';
    }

    _batchUpdateDOM(thumbFrag, mainFrag) {
        this.dom.thumbCol.replaceChildren(thumbFrag);
        this.dom.mainCol.replaceChildren(mainFrag);
    }
    
    _resetView() {
        this.dom.scrollContainer.scrollTop = 0;
        this._updateActive(0);
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

    _onIntersect(entries) {
        const visible = entries.find(e => e.isIntersecting);
        if (visible) {
            this._updateActive(parseInt(visible.target.dataset.index, 10));
        }
    }

    _updateActive(index) {
        if (!this.items[index]) return;

        this.items.forEach((item, i) => {
            const isActive = i === index;
            item.thumb.classList.toggle(CONFIG.CLASSES.active, isActive);
            item.thumb.setAttribute("aria-current", String(isActive));
        });

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