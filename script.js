"use strict";

const CONFIG = {
    ANIMATION: {
        HUE_SHIFT_AMOUNT: 60,
        THROTTLE_MS: 50,
        RESIZE_DEBOUNCE_MS: 250,
        TYPING_SPEED_MS: 80,
        ROLE_PAUSE_MS: 1500,
        FADE_MS: 300,
        GALLERY_ITEM_DELAY_MS: 50,
        PARALLAX_STRENGTH: 15,
        FILTER_TRANSITION_MS: 300,
        CONTAINER_HEIGHT_TRANSITION_MS: 500
    },
    DEFAULTS: {
        FILTER: 'All',
        ROLES: [
            'parametric designer',
            'researcher',
            'photographer',
            'robotic fabrication engineer'
        ]
    },
    BACKGROUND: {
        MOBILE_BALLS: 2,
        DESKTOP_BALLS: 5,
        BASE_RADIUS: 80,
        RADIUS_VAR: 60,
        REPULSION: 450,
        DAMPING: 0.85,
        DRIFT_BASE: 0.00095,
        DRIFT_VAR: 0.0005,
        THRESHOLD_SQ: 10000,
        BOUNCE_DAMP: -0.8
    }
};

const PROJECTS_DATA = [
    { src: "./images/urban/Kees-Leemeijer_New-York-Brooklyn-bridge.webp", category: "Urban", title: "New York Brooklyn bridge" },
    { src: "./images/urban/Kees-Leemeijer_New-York-sunset-skyline.webp", category: "Urban", title: "New York Sunset" },
    { src: "./images/urban/Kees-Leemeijer_New-York-skyline-by-night.webp", category: "Urban", title: "New York Skyline" },
    { src: "./images/urban/Kees-Leemeijer_New-York-cityscape.webp", category: "Urban", title: "New York Cityscape" },
    { src: "./images/urban/Kees-Leemeijer_Rotterdam-Erasmus-bridge-newyears.webp", category: "Urban", title: "Rotterdam Erasmus bridge" },
    { src: "./images/urban/Kees-Leemeijer_Rotterdam-skateboarding.webp", category: "Urban", title: "Rotterdam Skateboarding" },
    { src: "./images/urban/Kees-Leemeijer_Lisbon-lighttower.webp", category: "Urban", title: "Lisbon Light-tower" },
    { src: "./images/urban/Kees-Leemeijer_Netherlands-Tullipfields.webp", category: "Urban", title: "Netherlands Tullipfields" },
    { src: "./images/urban/Kees-Leemeijer_Luca-Guinigi-Tower.webp", category: "Urban", title: "Luca Guinigi Tower" },
    { src: "./images/urban/Kees-Leemeijer_Lisbon-Skateboarding.webp", category: "Urban", title: "Lisbon Skateboarding" },
    { src: "./images/urban/Kees-Leemeijer_Lisbon-Skateboarding-Nose-slide.webp", category: "Urban", title: "Lisbon Nose slide" },
    { src: "./images/urban/Kees-Leemeijer_Lisbon-Street-Artist.webp", category: "Urban", title: "Lisbon Street artist" },
    { src: "./images/plants/Kees-Leemeijer_Wild-Garlic.webp", category: "Plants", title: "Wild garlic" },
    { src: "./images/plants/Kees-Leemeijer_Vineyard-snail.webp", category: "Plants", title: "Vineyard snail" },
    { src: "./images/plants/Kees-Leemeijer_Common-daisy.webp", category: "Plants", title: "Common daisy" },
    { src: "./images/plants/Kees-Leemeijer_Fern-spores.webp", category: "Plants", title: "Fern spores" },
    { src: "./images/plants/Kees-leemeijer_Daffodil.webp", category: "Plants", title: "Daffodil" },
    { src: "./images/portraits/Kees-Leemeijer_Portrait1.webp", category: "Portraits", title: "Bird" },
    { src: "./images/portraits/Kees-Leemeijer_Portrait-Laura-Sander.webp", category: "Portraits", title: "Swan" },
    { src: "./images/portraits/Kees-Leemeijer_Portrait-Nayanthara-Herath.webp", category: "Portraits", title: "Yellow Bird" },
    { src: "./images/portraits/Kees-Leemeijer_Portrait-Jaap-Leemeijer.webp", category: "Portraits", title: "Squirrel" },
    { src: "./images/portraits/Kees-Leemeijer_Portrait2.webp", category: "Portraits", title: "Big bird" },
    { src: "./images/portraits/Kees-Leemeijer_Portrait3.webp", category: "Portraits", title: "Duck" },
    { src: "./images/portraits/Kees-Leemeijer_Portrait-Monique-van-Pinxten.webp", category: "Portraits", title: "Green cat" },
    { src: "./images/animals/Kees-Leemeijer_Juvenile-Robin.webp", category: "Animals", title: "Juvenile Robin" },
    { src: "./images/animals/Kees-Leemeijer_Robin-and-Girl.webp", category: "Animals", title: "Robin and girl" },
    { src: "./images/animals/Kees-Leemeijer_Swan.webp", category: "Animals", title: "Swan" },
    { src: "./images/animals/Kees-Leemeijer_King-weaver.webp", category: "Animals", title: "King weaver" },
    { src: "./images/animals/Kees-Leemeijer_Squirrel.webp", category: "Animals", title: "Squirrel" },
    { src: "./images/animals/Kees-Leemeijer_Dalmatian-Pelican.webp", category: "Animals", title: "Dalmatian Pelican" },
    { src: "./images/animals/Kees-Leemeijer_Duck.webp", category: "Animals", title: "Duck" },
    { src: "./images/animals/Kees-Leemeijer_Ragdoll-cat.webp", category: "Animals", title: "Ragdoll Cat" },
    { src: "./images/animals/Kees-Leemeijer_Bonobo.webp", category: "Animals", title: "Bonobo" },
    { src: "./images/animals/Kees-Leemeijer_Secretary-bird.webp", category: "Animals", title: "Secretary bird" },
    { src: "./images/animals/Kees-Leemeijer_Hamadryas-baboon.webp", category: "Animals", title: "Hamadryas baboon" },
    { src: "./images/animals/Kees-Leemeijer_Territorial-coot.webp", category: "Animals", title: "Territorial coot" },
    { src: "./images/animals/Kees-Leemeijer_Peafowl.webp", category: "Animals", title: "Peafowl" },
    { src: "./images/3dcp/Kees-Leemeijer-3D-concrete-printing-Artpiece.webp", category: "3DCP", title: "3DCP artpiece" },
    { src: "./images/3dcp/Kees-Leemeijer_3D-concrete-printing-photoshoot.webp", category: "3DCP", title: "3DCP photoshoot" },
    { src: "./images/3dcp/Kees-Leemeijer_Vertico-printhead.webp", category: "3DCP", title: "Vertico printhead" },
    { src: "./images/3dcp/Kees-Leemeijer_3D-concrete-printing-behind-the-scenes.webp", category: "3DCP", title: "Vertico behind the scenes" },
    { src: "./images/3dcp/Kees-Leemeijer_3D-concrete-printing-vase.webp", category: "3DCP", title: "3DCP vase" },
    { src: "./images/3dcp/Kees-Leemeijer_3D-concrete-printing-lost-formwork.webp", category: "3DCP", title: "3DCP lost-formwork" },
    { src: "./images/3dcp/Kees-Leemeijer_3D-concrete-printing-flowerpot.webp", category: "3DCP", title: "3DCP Flowerpot" },
    { src: "./images/3dcp/Kees-Leemeijer_3D-concrete-printing-lounge-chair.webp", category: "3DCP", title: "3DCP Loungechair" },
    { src: "./images/products/Kees-Leemeijer_Croissant.webp", category: "Products", title: "Croissant" },
    { src: "./images/products/Kees-Leemeijer_flat-white.webp", category: "Products", title: "Flat White" },
    { src: "./images/products/Kees-Leemeijer_Bakery-breakfast.webp", category: "Products", title: "Bakery Breakfast" },
    { src: "./images/products/Kees-Leemeijer_Cupcakes.webp", category: "Products", title: "Cupcakes" },
    { src: "./images/products/Kees-Leemeijer_3D-printed-concrete-furniture.webp", category: "Products", title: "3D printed bench" },
    { src: "./images/industry/Kees-Leemeijer_Rotterdam-Harbor-Oil-Rig.webp", category: "Industry", title: "Oil rig" },
    { src: "./images/industry/Kees-Leemeijer_Rotterdam-Harbor-Feeder-crane-RWG-Terminal.webp", category: "Industry", title: "Feeder cranes RWG terminal" },
    { src: "./images/industry/Kees-Leemeijer_Rotterdam-Harbor-by-Night.webp", category: "Industry", title: "Rotterdam Harbor by night" },
    { src: "./images/industry/Kees-Leemeijer_Rotterdam-Harbor-Container-transhipment1.webp", category: "Industry", title: "Container transhipment" },
    { src: "./images/industry/Kees-Leemeijer_Rotterdam-Harbor-Container-transhipment.webp", category: "Industry", title: "Container transhipment" },
    { src: "./images/industry/Kees-Leemeijer_Rotterdam-Harbor-crane.webp", category: "Industry", title: "Harbor crane" },
    { src: "./images/industry/Kees-Leemeijer_Rotterdam-Harbor-Cosco-shipping-virgo.webp", category: "Industry", title: "Cosco Shipping Virgo" },
    { src: "./images/architecture/Kees-Leemeijer_Sagrada-Familia.webp", category: "Architecture", title: "Sagrada Familia" },
    { src: "./images/architecture/Kees-Leemeijer_Sagrada-Familia-1.webp", category: "Architecture", title: "Sagrada Familia" },
    { src: "./images/architecture/Kees-Leemeijer_Sagrada-Familia-2.webp", category: "Architecture", title: "Sagrada Familia" },
    { src: "./images/architecture/Kees-Leemeijer_Penn-Station-guastavino-tile-vault.webp", category: "Architecture", title: "Penn station New York" },
    { src: "./images/architecture/Kees-Leemeijer_Copenhagen-Grundsvig-church.webp", category: "Architecture", title: "Grundtvig's Church" },
    { src: "./images/architecture/Kees-Leemeijer_Copenhagen-Grundsvig-church-1.webp", category: "Architecture", title: "Grundtvig's Church" },
    { src: "./images/architecture/Kees-Leemeijer_Copenhagen-Grundsvig-church-2.webp", category: "Architecture", title: "Grundtvig's Church" },
    { src: "./images/architecture/Kees-Leemeijer_Copenhagen-Grundsvig-church-3.webp", category: "Architecture", title: "Grundtvig's Church" },
    { src: "./images/architecture/Kees-Leemeijer_Copenhagen-Grundsvig-church-4.webp", category: "Architecture", title: "Grundtvig's Church" },
    { src: "./images/architecture/Kees-Leemeijer_Felix-Candela-Our-Lady-of-the-Miraculous-Medal-Church.webp", category: "Architecture", title: "Felix Candela ILMM Church" },
    { src: "./images/architecture/Kees-Leemeijer_Santuario-de-la-Virgen-de-las-Lágrimas.webp", category: "Architecture", title: "Madonna delle Lacrime" },
    { src: "./images/architecture/Kees-Leemeijer_Santuario-de-la-Virgen-de-las-Lágrimas-1.webp", category: "Architecture", title: "Madonna delle Lacrime" },
  ];

function debounce(func, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

function throttle(func, limit) {
    let inThrottle = false;
    let lastResult;
    return (...args) => {
        if (!inThrottle) {
            inThrottle = true;
            requestAnimationFrame(() => {
                lastResult = func.apply(this, args);
                setTimeout(() => {
                    inThrottle = false;
                }, limit);
            });
        }
        return lastResult;
    };
}

function cacheDomElements() {
    const d = document;
    const root = d.documentElement;
    const body = d.body;

    if (!root || !body) {
        console.error("Fatal Error: Document root or body element not found.");
        return null;
    }

    return {
        root: root,
        body: body,
        hueShiftButton: d.getElementById('hue-shift-button'),
        darkModeButton: d.querySelector('.dark-light-mode'),
        darkModeIcon: d.querySelector('.dark-light-mode span'),
        roleElement: d.getElementById('role'),
        filterList: d.querySelector('.project-filter-list'),
        projectContainer: d.querySelector('.project-container'),
        fullscreenContainer: d.getElementById('fullscreen-container'),
        fullscreenImage: d.getElementById('fullscreen-image'),
        fullscreenCloseButton: d.getElementById('close-fullscreen'),
        fullscreenPrevButton: d.getElementById('prev-image'),
        fullscreenNextButton: d.getElementById('next-image'),
        mainContainer: d.querySelector('.main-container'),
        projectGallerySection: d.getElementById('project-gallery'),
        navLinks: Array.from(d.querySelectorAll('.menu nav a[href^="#"]')),
        backgroundCanvas: d.getElementById('gradient-background')
    };
}

let domElements = null;
let isScrolledTop = true;

class BackgroundAnimation {
    constructor() {
        this.canvasElement = domElements?.backgroundCanvas;
        if (!this.canvasElement) {
            console.warn("Background canvas element not found. Animation disabled.");
            return;
        }
        this.config = CONFIG.BACKGROUND;
        this.balls = [];
        this.colors = [];
        this.frameId = null;
        this._animate = this._animate.bind(this);
        this.isInitialized = false;
    }

    init() {
        if (!this.canvasElement || !domElements?.root) {
            this.stop();
            return;
        }
        this.stop();

        const computedStyle = getComputedStyle(domElements.root);
        const fallbackColor = 'transparent';

        this.colors = [
            computedStyle.getPropertyValue('--ball-color-light').trim() || fallbackColor,
            computedStyle.getPropertyValue('--ball-color-medium').trim() || fallbackColor,
            computedStyle.getPropertyValue('--ball-color-dark').trim() || fallbackColor
        ];

        if (this.colors.every(c => !c || c === fallbackColor)) {
            console.warn("Background animation colors not found or invalid. Animation disabled.");
            this.isInitialized = false;
            return;
        }

        this.config.numBalls = window.innerWidth < 768 ? this.config.MOBILE_BALLS : this.config.DESKTOP_BALLS;
        this._createBalls();
        this.isInitialized = true;
        console.log("Background animation initialized.");
    }

    start() {
        if (!this.isInitialized) {
            this.init();
            if (!this.isInitialized) return;
        }

        if (this.canvasElement && this.balls.length > 0 && !this.frameId) {
            this._animate();
        } else if (this.canvasElement && !this.isInitialized) {
            console.log("Background animation start deferred (waiting for initialization).");
            setTimeout(() => this.start(), 150);
        }
    }

    stop() {
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
    }

    handleResize() {
        console.log("Handling resize for background animation.");
        this.isInitialized = false;
        this.start();
    }

    _createBalls() {
        const { config: cfg, colors } = this;
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.balls = [];

        if (!colors || colors.length === 0 || colors.every(c => !c || c === 'transparent')) {
            console.warn("Cannot create balls: Invalid colors.");
            return;
        }

        for (let i = 0; i < cfg.numBalls; i++) {
            this.balls.push({
                x: Math.random() * w,
                y: Math.random() * h,
                radius: cfg.BASE_RADIUS + Math.random() * cfg.RADIUS_VAR,
                vx: (Math.random() - 0.5) * 0.25,
                vy: (Math.random() - 0.5) * 0.25,
                targetX: Math.random() * w,
                targetY: Math.random() * h,
                drift: cfg.DRIFT_BASE + Math.random() * cfg.DRIFT_VAR,
                colors: colors.length > 0 ? [
                    i % colors.length,
                    (i + 1) % colors.length,
                    (i + 2) % colors.length
                ] : []
            });
        }
    }

    _updateBalls(mouseX, mouseY) {
        const { config: cfg, balls } = this;
        const w = window.innerWidth;
        const h = window.innerHeight;

        balls.forEach(b => {
            const dxm = b.x - mouseX;
            const dym = b.y - mouseY;
            const distSq = dxm * dxm + dym * dym;
            const repelRadius = b.radius + cfg.REPULSION;
            const repelSq = repelRadius * repelRadius;

            if (distSq < repelSq && distSq > 1e-6) {
                const dist = Math.sqrt(distSq);
                const angle = Math.atan2(dym, dxm);
                const force = Math.min(1, (repelRadius - dist) / cfg.REPULSION) * 3;
                b.vx += Math.cos(angle) * force;
                b.vy += Math.sin(angle) * force;
            }

            const dxt = b.targetX - b.x;
            const dyt = b.targetY - b.y;
            b.vx += dxt * b.drift;
            b.vy += dyt * b.drift;

            b.vx *= cfg.DAMPING;
            b.vy *= cfg.DAMPING;

            b.x += b.vx;
            b.y += b.vy;

            if (dxt * dxt + dyt * dyt < cfg.THRESHOLD_SQ) {
                b.targetX = Math.random() * w;
                b.targetY = Math.random() * h;
            }

            const R = b.radius;
            if (b.x + R > w) { b.x = w - R; b.vx *= cfg.BOUNCE_DAMP; }
            if (b.x - R < 0) { b.x = R; b.vx *= cfg.BOUNCE_DAMP; }
            if (b.y + R > h) { b.y = h - R; b.vy *= cfg.BOUNCE_DAMP; }
            if (b.y - R < 0) { b.y = R; b.vy *= cfg.BOUNCE_DAMP; }
        });
    }

    _drawBalls() {
        if (!this.canvasElement || !this.balls?.length || !this.colors?.length || this.colors.every(c => !c || c === 'transparent')) {
            return;
        }

        try {
            const gradients = this.balls.map(b => {
                if (!b.colors || b.colors.length < 3) return '';
                const [c1i, c2i, c3i] = b.colors;
                if (c1i >= this.colors.length || c2i >= this.colors.length || c3i >= this.colors.length) return '';

                const c1 = this.colors[c1i];
                const c2 = this.colors[c2i];
                const c3 = this.colors[c3i];

                if (!c1 || !c2 || !c3) return '';

                const r = Math.max(1, b.radius);
                return `radial-gradient(circle at ${b.x.toFixed(1)}px ${b.y.toFixed(1)}px, ${c1} 0%, ${c2} 50%, ${c3} 100%, transparent ${Math.max(1, r * 1.8).toFixed(1)}px)`;
            }).filter(s => s);

            this.canvasElement.style.background = gradients.length > 0 ? gradients.join(',') : 'transparent';

        } catch (e) {
            console.error("Error drawing background balls:", e);
            this.stop();
        }
    }

    _animate() {
        if (!domElements?.body) {
            this.stop();
            return;
        }

        const mouseX = parseFloat(domElements.body.style.getPropertyValue('--mouse-x')) || window.innerWidth / 2;
        const mouseY = parseFloat(domElements.body.style.getPropertyValue('--mouse-y')) || window.innerHeight / 2;

        this._updateBalls(mouseX, mouseY);
        this._drawBalls();

        this.frameId = requestAnimationFrame(this._animate);
    }
}

class Gallery {
    constructor() {
        if (!domElements?.projectContainer || !domElements?.filterList || !domElements?.fullscreenContainer || !domElements?.projectGallerySection || !domElements?.body) {
            console.error("Essential gallery DOM elements missing. Gallery functionality disabled.");
            this.state = { isInitialized: true };
            return;
        }

        this.dom = {
            projectContainer: domElements.projectContainer,
            filterList: domElements.filterList,
            fullscreenContainer: domElements.fullscreenContainer,
            fullscreenImage: domElements.fullscreenImage,
            fullscreenCloseButton: domElements.fullscreenCloseButton,
            fullscreenPrevButton: domElements.fullscreenPrevButton,
            fullscreenNextButton: domElements.fullscreenNextButton,
            body: domElements.body,
            projectGallerySection: domElements.projectGallerySection
        };

        this.projectsData = PROJECTS_DATA;
        this.animationConfig = CONFIG.ANIMATION;

        this.state = {
            visibleImages: [],
            currentIndex: 0,
            activeFilter: CONFIG.DEFAULTS.FILTER,
            isInitialized: false,
            lastFocusedElement: null,
            observer: null,
            visibleItemsInView: new Set(),
            filterTimeouts: new Map(),
            isFiltering: false
        };

        this.handleMouseMoveThrottled = throttle(this._handleProjectBoxMouseMove.bind(this), this.animationConfig.THROTTLE_MS);
    }

    init() {
        if (this.state.isInitialized || !this.dom.projectContainer) return;

        console.log("Initializing Gallery...");
        this._renderProjectGallery();
        this._bindFilterEvents();
        this._setupFullscreenViewerControls();
        this._setupIntersectionObserver();
        this._bindHoverParallaxEvents();
        this.applyFilter(this.state.activeFilter, true);
        this.state.isInitialized = true;
        console.log("Gallery Initialized.");
    }

    _renderProjectGallery() {
        if (!this.dom.projectContainer) return;

        const fragment = document.createDocumentFragment();

        this.projectsData.forEach((project, index) => {
            const box = document.createElement('div');
            const shimmer = document.createElement('div');
            const img = document.createElement('img');
            const title = document.createElement('div');

            box.className = 'project-box';
            box.dataset.category = project.category;
            box.dataset.index = index;
            box.tabIndex = 0;
            box.setAttribute('role', 'button');
            box.setAttribute('aria-label', `View project: ${project.title}`);
            box.dataset.visible = 'false';

            shimmer.className = 'project-box-shimmer';
            shimmer.setAttribute('aria-hidden', 'true');

            img.src = project.src;
            img.alt = project.title;
            img.loading = 'lazy';
            img.decoding = 'async';
            img.onload = () => {
                box.classList.add('loaded');
            };
            img.onerror = () => {
                console.warn(`Failed to load image: ${project.src}`);
                box.classList.add('load-error');
                box.style.display = 'none';
                if (this.state.observer) {
                    this.state.observer.unobserve(box);
                }
            };

            title.className = 'title-box';
            title.textContent = project.title;
            title.setAttribute('aria-hidden', 'true');

            box.append(shimmer, img, title);
            box.addEventListener('click', () => this._handleProjectBoxClick(box));
            box.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this._handleProjectBoxClick(box);
                }
            });

            fragment.append(box);
        });

        this.dom.projectContainer.innerHTML = '';
        this.dom.projectContainer.append(fragment);
    }

    _bindFilterEvents() {
        if (!this.dom.filterList) return;
        this.dom.filterList.addEventListener('click', event => this._handleFilterClick(event));
        this.dom.filterList.addEventListener('keydown', event => this._handleFilterKeydown(event));
    }

    _setupIntersectionObserver() {
        if (!this.dom.projectContainer || typeof IntersectionObserver === 'undefined') {
            console.warn("IntersectionObserver not supported or project container missing. Gallery item animation on scroll disabled.");
            return;
        }

        const options = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.01
        };

        this.state.observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                const target = entry.target;
                if (entry.isIntersecting && !target.classList.contains('filtering-out') && target.dataset.visible === 'false') {
                    const delay = this.state.visibleItemsInView.size * this.animationConfig.GALLERY_ITEM_DELAY_MS;
                    target.style.transitionDelay = `${delay}ms`;
                    target.dataset.visible = 'true';
                    this.state.visibleItemsInView.add(target);
                    observer.unobserve(target);
                }
            });
        }, options);
         console.log("IntersectionObserver setup complete.");
    }

    _bindHoverParallaxEvents() {
        if (!this.dom.projectContainer) return;
        this.dom.projectContainer.addEventListener('mousemove', this.handleMouseMoveThrottled);
        this.dom.projectContainer.addEventListener('mouseleave', this._handleProjectBoxMouseLeave.bind(this));
        this.dom.projectContainer.addEventListener('focusin', this._handleProjectBoxMouseMove.bind(this));
        this.dom.projectContainer.addEventListener('focusout', this._handleProjectBoxMouseLeave.bind(this));
    }

    _handleProjectBoxMouseMove(event) {
        const box = event.target.closest('.project-box');
        if (!box || !box.classList.contains('loaded') || box.classList.contains('filtering-out')) {
            return;
        }

        const rect = box.getBoundingClientRect();
        const boxCenterX = rect.left + rect.width / 2;
        const boxCenterY = rect.top + rect.height / 2;

        const eventX = event.clientX ?? boxCenterX;
        const eventY = event.clientY ?? boxCenterY;

        const deltaX = (eventX - boxCenterX) / (rect.width / 2);
        const deltaY = (eventY - boxCenterY) / (rect.height / 2);

        const parallaxX = -deltaX * this.animationConfig.PARALLAX_STRENGTH;
        const parallaxY = -deltaY * this.animationConfig.PARALLAX_STRENGTH;

        requestAnimationFrame(() => {
            box.style.setProperty('--parallax-x', `${parallaxX.toFixed(2)}px`);
            box.style.setProperty('--parallax-y', `${parallaxY.toFixed(2)}px`);
        });
    }

    _handleProjectBoxMouseLeave(event) {
        const box = event.target.closest('.project-box');
        if (!box) return;

        const relatedTarget = event.relatedTarget;
        const isStillInsideContainer = relatedTarget && this.dom.projectContainer?.contains(relatedTarget);
        const isStillInsideBox = relatedTarget && box.contains(relatedTarget);

        if (!isStillInsideContainer || !isStillInsideBox) {
            requestAnimationFrame(() => {
                box.style.removeProperty('--parallax-x');
                box.style.removeProperty('--parallax-y');
            });
        }
    }

    applyFilter(filterCategory, isInitialLoad = false) {
        if (!this.dom.projectContainer || this.state.isFiltering) {
            return;
        }
        this.state.isFiltering = true;
        console.log(`Applying filter: ${filterCategory}`);

        this.state.activeFilter = filterCategory;
        this.state.visibleImages = [];
        this.state.observer?.disconnect();
        this.state.visibleItemsInView.clear();

        this.state.filterTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        this.state.filterTimeouts.clear();

        const container = this.dom.projectContainer;
        if (!container) {
             console.error("Cannot apply filter: Project container not found.");
             this.state.isFiltering = false;
             return;
        }
        const allBoxes = Array.from(container.querySelectorAll('.project-box'));
        const itemsToObserve = [];
        const itemsToHideStart = [];
        const itemsToShow = [];

        const initialHeight = container.getBoundingClientRect().height;
        let targetHeight = 0;

        container.style.height = '';
        container.style.overflow = 'visible';

        allBoxes.forEach(box => {
            const itemCategory = box.dataset.category;
            const shouldBeVisible = (filterCategory === 'All' || itemCategory === filterCategory);

            if (shouldBeVisible) {
                box.classList.remove('hidden-by-filter');
            } else {
                box.classList.add('hidden-by-filter');
            }
            box.classList.remove('filtering-out');
            box.style.transitionDelay = '0ms';
        });

        targetHeight = container.scrollHeight;

        allBoxes.forEach(box => {
             box.classList.remove('hidden-by-filter');
        });

        container.style.height = `${initialHeight}px`;
        container.style.overflow = 'hidden';

        allBoxes.forEach(box => {
            const itemCategory = box.dataset.category;
            const shouldBeVisible = (filterCategory === 'All' || itemCategory === filterCategory);
            const isCurrentlyVisible = !box.classList.contains('filtering-out') && box.offsetParent !== null;

            if (shouldBeVisible) {
                itemsToShow.push(box);
                const img = box.querySelector('img');
                if (img?.src && img.alt) {
                    this.state.visibleImages.push({ src: img.src, title: img.alt });
                }
                box.setAttribute('aria-hidden', 'false');
                box.dataset.visible = 'false';
                if (!isCurrentlyVisible) {
                    box.style.opacity = '';
                    box.style.transform = '';
                }
            } else {
                itemsToHideStart.push(box);
                box.setAttribute('aria-hidden', 'true');
                box.dataset.visible = 'false';
            }
        });

        this._updateFilterButtonsState();

        requestAnimationFrame(() => {
            container.style.transition = `height ${this.animationConfig.CONTAINER_HEIGHT_TRANSITION_MS}ms ease`;
            container.style.height = `${targetHeight}px`;

            itemsToHideStart.forEach(box => {
                if (!box.classList.contains('filtering-out')) {
                    box.classList.add('filtering-out');

                    const timeoutId = setTimeout(() => {
                        box.classList.add('hidden-by-filter');
                        this.state.filterTimeouts.delete(box);
                    }, this.animationConfig.FILTER_TRANSITION_MS);
                    this.state.filterTimeouts.set(box, timeoutId);
                }
            });

            itemsToShow.forEach(box => {
                box.classList.remove('filtering-out');
                box.classList.remove('hidden-by-filter');

                if (this.state.observer) {
                     itemsToObserve.push(box);
                } else {
                     box.style.transitionDelay = `${this.state.visibleItemsInView.size * this.animationConfig.GALLERY_ITEM_DELAY_MS}ms`;
                     box.dataset.visible = 'true';
                     this.state.visibleItemsInView.add(box);
                }
            });

             if (this.state.observer) {
                 itemsToObserve.forEach(item => this.state.observer.observe(item));
             }

            setTimeout(() => {
                if (container) {
                    container.style.overflow = '';
                    const currentHeight = container.getBoundingClientRect().height;
                    if (Math.abs(currentHeight - targetHeight) < 5) {
                         container.style.height = '';
                         container.style.transition = '';
                    } else {
                        console.warn("Height animation might have been interrupted. Height style not reset.");
                    }
                }
                this.state.isFiltering = false;
                console.log("Filter complete.");
            }, this.animationConfig.CONTAINER_HEIGHT_TRANSITION_MS);
        });

        if (isInitialLoad && itemsToShow.length > 0 && typeof IntersectionObserver === 'undefined') {
             console.log("Initial load fallback: Animating items directly.");
             itemsToShow.forEach((item, i) => {
                item.style.transitionDelay = `${i * this.animationConfig.GALLERY_ITEM_DELAY_MS}ms`;
                item.dataset.visible = 'true';
                this.state.visibleItemsInView.add(item);
            });
        }
    }

    _updateFilterButtonsState() {
        if (!this.dom.filterList) return;
        this.dom.filterList.querySelectorAll('button.filter-button').forEach(button => {
            const isActive = button.dataset.filter === this.state.activeFilter;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', isActive);
        });
    }

    _scrollToGallery() {
        if (this.dom.projectGallerySection) {
            this.dom.projectGallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    _handleFilterClick(event) {
        const button = event.target.closest('button.filter-button');
        if (!button || this.state.isFiltering) return;

        const newFilter = button.dataset.filter;
        if (newFilter && newFilter !== this.state.activeFilter) {
            this.applyFilter(newFilter);
            this._scrollToGallery();
        }
    }

    _handleFilterKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            const button = event.target.closest('button.filter-button');
            if (!button || this.state.isFiltering) return;

            event.preventDefault();
            const newFilter = button.dataset.filter;
            if (newFilter && newFilter !== this.state.activeFilter) {
                this.applyFilter(newFilter);
                this._scrollToGallery();
            }
        }
    }

    _handleProjectBoxClick(box) {
        if (box.classList.contains('filtering-out') || box.classList.contains('hidden-by-filter')) {
            return;
        }

        this.state.lastFocusedElement = box;
        const img = box.querySelector('img');
        const imgSrc = img?.src;
        if (!imgSrc) {
            console.warn("Could not find image source for clicked project box.");
            this.state.lastFocusedElement = null;
            return;
        }

        const visibleIndex = this.state.visibleImages.findIndex(data => data.src === imgSrc);

        if (visibleIndex !== -1) {
            this.openFullscreen(visibleIndex);
        } else {
            console.warn("Clicked image not found in the list of visible images.");
            this.state.lastFocusedElement = null;
        }
    }

    _setupFullscreenViewerControls() {
        const { fullscreenContainer, fullscreenCloseButton, fullscreenPrevButton, fullscreenNextButton } = this.dom;
        if (!fullscreenContainer || !fullscreenCloseButton || !fullscreenPrevButton || !fullscreenNextButton) {
            console.warn("Fullscreen viewer controls missing. Viewer functionality limited.");
            return;
        }

        fullscreenCloseButton.addEventListener('click', () => this.closeFullscreen());
        fullscreenPrevButton.addEventListener('click', () => this.navigateFullscreen(-1));
        fullscreenNextButton.addEventListener('click', () => this.navigateFullscreen(1));

        fullscreenContainer.addEventListener('keydown', event => {
            if (!fullscreenContainer.classList.contains('active')) return;

            switch (event.key) {
                case 'Escape':
                    this.closeFullscreen();
                    break;
                case 'ArrowLeft':
                    this.navigateFullscreen(-1);
                    break;
                case 'ArrowRight':
                    this.navigateFullscreen(1);
                    break;
                case 'Tab':
                    this._trapFocusInModal(event);
                    break;
            }
        });
    }

    _trapFocusInModal(event) {
        const { fullscreenCloseButton, fullscreenPrevButton, fullscreenNextButton } = this.dom;
        const focusableElements = [fullscreenPrevButton, fullscreenNextButton, fullscreenCloseButton].filter(el => el);

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                event.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                event.preventDefault();
            }
        }
    }

    openFullscreen(visibleIndex) {
        const { fullscreenContainer, fullscreenImage, fullscreenCloseButton, body } = this.dom;
        const images = this.state.visibleImages;

        if (!fullscreenContainer || !fullscreenImage || !fullscreenCloseButton || !body || !images?.length || visibleIndex < 0 || visibleIndex >= images.length) {
            console.error("Cannot open fullscreen: Missing elements, no images, or invalid index.", { visibleIndex, imagesLength: images?.length });
            return;
        }

        console.log(`Opening fullscreen at index: ${visibleIndex}`);
        document.body.classList.add('fullscreen-active');
        this.state.currentIndex = visibleIndex;
        const { src, title } = images[visibleIndex];

        fullscreenImage.src = src;
        fullscreenImage.alt = title;

        fullscreenContainer.removeAttribute('hidden');
        body.style.overflow = 'hidden';

        void fullscreenContainer.offsetWidth;
        fullscreenContainer.classList.add('active');

        setTimeout(() => {
            if (fullscreenContainer.classList.contains('active')) {
                fullscreenCloseButton.focus();
            }
        }, this.animationConfig.FADE_MS);

        fullscreenImage.onerror = () => {
            console.error("Error loading fullscreen image:", src);
            alert("Error loading image. Closing viewer.");
            this.closeFullscreen();
        };
    }

    closeFullscreen() {
        const { fullscreenContainer, body } = this.dom;
        if (!fullscreenContainer || !body || !fullscreenContainer.classList.contains('active')) {
            return;
        }

        console.log("Closing fullscreen.");
        document.body.classList.remove('fullscreen-active');
        fullscreenContainer.classList.remove('active');
        body.style.overflow = '';

        setTimeout(() => {
            if (!fullscreenContainer.classList.contains('active')) {
                fullscreenContainer.setAttribute('hidden', '');
            }
        }, this.animationConfig.FADE_MS);

        const elementToRestoreFocus = this.state.lastFocusedElement;
        if (elementToRestoreFocus && typeof elementToRestoreFocus.focus === 'function' && document.body.contains(elementToRestoreFocus) && elementToRestoreFocus.offsetParent !== null) {
            try {
                elementToRestoreFocus.focus({ preventScroll: true });
            } catch (e) {
                console.warn("Could not restore focus to original element:", e);
            }
        }
        this.state.lastFocusedElement = null;
    }

    navigateFullscreen(direction) {
        const { fullscreenImage } = this.dom;
        const images = this.state.visibleImages;
        const numImages = images.length;

        if (!fullscreenImage || numImages <= 1 || fullscreenImage.classList.contains('navigating')) {
            return;
        }

        const newIndex = (this.state.currentIndex + direction + numImages) % numImages;
        const { src, title } = images[newIndex];

        fullscreenImage.classList.add('navigating');
        const outClass = direction === 1 ? 'navigating-next-out' : 'navigating-prev-out';
        const inClass = direction === 1 ? 'navigating-next-in' : 'navigating-prev-in';

        fullscreenImage.classList.add(outClass);

        setTimeout(() => {
            fullscreenImage.src = src;
            fullscreenImage.alt = title;
            fullscreenImage.onerror = () => {
                console.error("Error loading navigated fullscreen image:", src);
                alert("Error loading next image. Closing viewer.");
                this.closeFullscreen();
            };

            void fullscreenImage.offsetWidth;

            fullscreenImage.classList.remove(outClass);
            fullscreenImage.classList.add(inClass);

            setTimeout(() => {
                fullscreenImage.classList.remove(inClass, 'navigating');
            }, 300);

        }, 50);

        this.state.currentIndex = newIndex;
    }
}

class UI {
    constructor(bgAnimInstance) {
        if (!domElements?.root || !domElements?.body) {
            console.error("Essential UI DOM elements (root, body) missing. UI functionality disabled.");
            this.state = { theme: {} };
            return;
        }

        this.dom = {
            root: domElements.root,
            body: domElements.body,
            darkModeButton: domElements.darkModeButton,
            darkModeIcon: domElements.darkModeIcon,
            hueShiftButton: domElements.hueShiftButton,
            roleElement: domElements.roleElement,
            navLinks: domElements.navLinks
        };
        this.config = CONFIG;
        this.backgroundAnimation = bgAnimInstance;

        this.state = {
            theme: {
                hue: 0,
                isDark: this._getInitialDarkModePreference()
            },
            roleTyping: {
                currentIndex: 0,
                currentChar: 0,
                timeoutId: null,
                roles: this.config.DEFAULTS.ROLES
            }
        };
    }

    init() {
        if (!this.dom.root) return;

        console.log("Initializing UI...");
        this.applyTheme();
        this.startRoleTypingAnimation();
        this._bindEvents();
        console.log("UI Initialized.");
    }

    _bindEvents() {
        this.dom.darkModeButton?.addEventListener('click', () => this.toggleDarkMode());
        this.dom.hueShiftButton?.addEventListener('click', () => this.shiftThemeHue());
        this.dom.navLinks?.forEach(link => {
            link.addEventListener('click', event => this._handleNavClick(event, link));
        });
    }

    _getInitialDarkModePreference() {
        try {
            if (typeof localStorage !== 'undefined') {
                const storedValue = localStorage.getItem('darkMode');
                if (storedValue !== null) {
                    return storedValue === 'true';
                }
            }
            if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
                return true;
            }
        } catch (e) {
            console.error("Error accessing localStorage or matchMedia:", e);
        }
        return false;
    }

    toggleDarkMode() {
        this.state.theme.isDark = !this.state.theme.isDark;
        console.log(`Toggling dark mode: ${this.state.theme.isDark ? 'On' : 'Off'}`);
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('darkMode', this.state.theme.isDark);
            }
        } catch (e) {
            console.error("Error saving dark mode preference to localStorage:", e);
        }
        this.applyTheme();
    }

    applyTheme() {
        if (!this.dom.root) return;

        this.dom.root.classList.toggle('dark-mode', this.state.theme.isDark);

        if (this.dom.darkModeIcon) {
            this.dom.darkModeIcon.textContent = this.state.theme.isDark ? 'dark_mode' : 'light_mode';
        }
        this.dom.darkModeButton?.setAttribute('aria-pressed', this.state.theme.isDark);

        this.dom.root.style.setProperty('--hue-shift', this.state.theme.hue);

        if (this.backgroundAnimation) {
            setTimeout(() => {
                if (this.backgroundAnimation) {
                    this.backgroundAnimation.isInitialized = false;
                    this.backgroundAnimation.start();
                }
            }, 50);
        }
    }

    shiftThemeHue() {
        this.state.theme.hue = (this.state.theme.hue + this.config.ANIMATION.HUE_SHIFT_AMOUNT) % 360;
        console.log(`Shifting hue to: ${this.state.theme.hue}`);
        if (!this.dom.root) return;

        this.dom.root.style.setProperty('--hue-shift', this.state.theme.hue);

        if (this.backgroundAnimation) {
            setTimeout(() => {
                 if (this.backgroundAnimation) {
                    this.backgroundAnimation.isInitialized = false;
                    this.backgroundAnimation.start();
                 }
            }, 50);
        }
    }

    startRoleTypingAnimation() {
        if (!this.dom.roleElement) {
            return;
        }
        const { roleTyping } = this.state;

        clearTimeout(roleTyping.timeoutId);

        this.dom.roleElement.style.opacity = '0';

        roleTyping.timeoutId = setTimeout(() => {
            if (!this.dom.roleElement) return;

            roleTyping.currentIndex = (roleTyping.currentIndex + 1) % roleTyping.roles.length;
            roleTyping.currentChar = 0;
            this.dom.roleElement.textContent = '';
            this.dom.roleElement.style.opacity = '1';
            this._typeNextCharacter();

        }, this.config.ANIMATION.FADE_MS);
    }

    _typeNextCharacter() {
        const { roleTyping } = this.state;
        const currentRole = roleTyping.roles[roleTyping.currentIndex];

        if (!this.dom.roleElement || !currentRole) return;

        if (roleTyping.currentChar < currentRole.length) {
            this.dom.roleElement.textContent += currentRole[roleTyping.currentChar++];
            roleTyping.timeoutId = setTimeout(() => this._typeNextCharacter(), this.config.ANIMATION.TYPING_SPEED_MS);
        } else {
            roleTyping.timeoutId = setTimeout(() => this.startRoleTypingAnimation(), this.config.ANIMATION.ROLE_PAUSE_MS);
        }
    }

    _handleNavClick(event, link) {
        const targetId = link.getAttribute('href');
        if (!targetId || !targetId.startsWith('#') || targetId.length === 1) {
            return;
        }

        try {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                event.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

                if (history.pushState) {
                    try {
                        history.pushState(null, '', targetId);
                    } catch (e) {
                        console.warn("Could not update history state:", e);
                    }
                }
            }
        } catch (e) {
            console.error(`Error handling nav click for ${targetId}:`, e);
        }
    }
}

function handleScroll() {
    if (!domElements?.body) return;

    const currentlyScrolledTop = window.scrollY < 5;

    if (currentlyScrolledTop !== isScrolledTop) {
        isScrolledTop = currentlyScrolledTop;
        domElements.body.classList.toggle('scrolled-to-top', isScrolledTop);
    }
}

function initializeApp() {
    console.log("Initializing Portfolio App...");

    domElements = cacheDomElements();
    if (!domElements) {
        console.error("App initialization failed: Essential DOM elements missing.");
        return;
    }

    isScrolledTop = window.scrollY < 5;
    domElements.body.classList.toggle('scrolled-to-top', isScrolledTop);

    const backgroundAnimation = domElements.backgroundCanvas ? new BackgroundAnimation() : null;
    const galleryInstance = (domElements.projectContainer && domElements.filterList && domElements.fullscreenContainer && domElements.projectGallerySection) ? new Gallery() : null;
    const ui = new UI(backgroundAnimation);

    ui.init();
    galleryInstance?.init();
    backgroundAnimation?.start();

    document.addEventListener('mousemove', throttle(e => {
        domElements.body.style.setProperty('--mouse-x', `${e.clientX}px`);
        domElements.body.style.setProperty('--mouse-y', `${e.clientY}px`);
    }, CONFIG.ANIMATION.THROTTLE_MS));

    window.addEventListener('resize', debounce(() => {
        console.log("Resize event triggered.");
        backgroundAnimation?.handleResize();
        handleScroll();
    }, CONFIG.ANIMATION.RESIZE_DEBOUNCE_MS));

    const throttledScrollHandler = throttle(handleScroll, CONFIG.ANIMATION.THROTTLE_MS);
    window.addEventListener('scroll', throttledScrollHandler);

    console.log("Portfolio App Initialized Successfully.");
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}