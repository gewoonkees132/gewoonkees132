/**
 * @file script.js
 * @description Main JavaScript file for Kees Leemeijer's portfolio website.
 * Handles theme switching, background animation, project filtering,
 * scroll-driven gallery interaction, and fullscreen image viewing.
 * @version 1.8.2 - Addressed cursor overshoot due to margin collapse.
 */

"use strict";

// ==========================================================================
// Configuration & Constants
// ==========================================================================

const AppConfig = {
    IS_DEVELOPMENT_MODE: false, // Or use environment variable
    LOG_LEVEL: 'none', // 'debug', 'info', 'warn', 'error', 'none'
};

const Logger = {
    _log(level, ...args) {
        if (AppConfig.IS_DEVELOPMENT_MODE) {
            const levels = ['debug', 'info', 'warn', 'error', 'none'];
            if (levels.indexOf(level) >= levels.indexOf(AppConfig.LOG_LEVEL)) {
                console[level === 'debug' ? 'log' : level](...args);
            }
        } else if (level === 'error' && AppConfig.LOG_LEVEL !== 'none') { // Always log errors in prod unless explicitly none
            console.error(...args);
        }
    },
    debug(...args) { this._log('debug', ...args); },
    info(...args) { this._log('info', ...args); },
    warn(...args) { this._log('warn', ...args); },
    error(...args) { this._log('error', ...args); },
};


const CONFIG = Object.freeze({
    ANIMATION: Object.freeze({
        HUE_SHIFT_AMOUNT: 60, THROTTLE_MS: 50, RESIZE_DEBOUNCE_MS: 250, TYPING_SPEED_MS: 80, ROLE_PAUSE_MS: 1500, LERP_FACTOR: 0.1, SNAP_TIMEOUT_MS: 150, UPDATE_EPSILON: 0.5,
        ZOOM_TRANSITION_MS: 600, FADE_BG_TRANSITION_MS: 600, SLIDER_SCROLL_THROTTLE_MS: 50,
        SLIDE_UPDATE_DELAY_MS: 100,
        TRANSITION_END_FALLBACK_BUFFER_MS: 50,
    }),
    DEFAULTS: Object.freeze({
        FILTER: 'All', ROLES: ['parametric designer', 'researcher', 'photographer', 'robotic fabrication engineer'],
        ALT_TEXT_PREFIX: 'Portfolio image',
        PROJECTS_DATA_PATH: 'projects.json',
    }),
    BACKGROUND: Object.freeze({
        MOBILE_BALLS: 3,         // Number of "blobs" for mobile
        DESKTOP_BALLS: 3,        // Number of "blobs" for desktop
        BASE_RADIUS_FACTOR: 0.7, // Base radius: e.g., 60% of min(canvasWidth, canvasHeight)
        RADIUS_VAR_FACTOR: 0.4,  // Radius variance: e.g., 40% of (BASE_RADIUS_FACTOR * minDim)
        MIN_SPEED: 0.9,         // Minimum speed of blobs (pixels per frame, scaled by DPR)
        MAX_SPEED: 0.99,          // Maximum speed of blobs
        DAMPING: 1,          // Slows down blobs very gradually (closer to 1 = less damping)
        BLUR_AMOUNT: '0px',    // CSS-like blur value for the canvas filter
        GLOBAL_ALPHA: 0.2,      // Global alpha for drawing blobs, affects blend intensity
    }),
    SELECTORS: Object.freeze({
        CACHEABLE_ELEMENTS: Object.freeze({
            root: ':root', html: 'html', body: 'body', mainContainer: '.main-container', mainContent: '.content', scrollModeGallery: '#scroll-mode-gallery', thumbnailColumn: '#thumbnail-column', mainImageColumn: '#main-image-column', thumbnailScroller: '#thumbnail-scroller', mainImageScroller: '#main-image-scroller', activeCursor: '#active-thumbnail-cursor', scrollGalleryStatus: '#scroll-gallery-status', fullscreenContainer: '#fullscreen-container', fullscreenSliderWrapper: '#fullscreen-slider-wrapper', fullscreenCloseButton: '#close-fullscreen', fullscreenStatusLabel: '#fullscreen-status', filterList: '.project-filter-list', projectGallerySection: '#project-gallery', hueShiftButton: '#hue-shift-button', darkModeButton: '.dark-light-mode', darkModeIcon: '.dark-light-mode span', roleElement: '#role', backgroundCanvas: '#gradient-background', navLinksQuery: '.menu nav a[href^="#"]',
        }),
        CLASS_NAMES: Object.freeze({
            active: 'active',
            darkMode: 'dark-mode',
            isZooming: 'is-zooming',
            fullscreenActive: 'fullscreen-active',
            fullscreenEffectActive: 'fullscreen-effect-active',
            isDragging: 'is-dragging',
            scrolledToTop: 'scrolled-to-top',
            reducedMotion: 'reduced-motion',
            visuallyHidden: 'visually-hidden',
            scrollGalleryThumbItem: 'scroll-gallery__thumb-item',
            scrollGalleryMainItem: 'scroll-gallery__main-item',
            scrollGalleryThumbItemError: 'scroll-gallery__thumb-item--error',
            scrollGalleryMainItemError: 'scroll-gallery__main-item--error',
            sourceElementZooming: 'source-element-zooming',
            galleryEmptyMessage: 'gallery-empty-message',
            fullscreenSlide: 'fullscreen-slide',
            fullscreenSlideImageClass: 'fullscreen-slide__image',
            isActiveSlide: 'is-active-slide',
            slideLoaded: 'slide-loaded',
            slideLoadError: 'slide-load-error',
            imageLoadError: 'image-load-error',
            itemErrorContent: 'item-error-content',
            slideErrorTitle: 'slide-error-title',
            slideLoadingPlaceholder: 'is-loading-placeholder',
            willChangeOpacityFilter: 'will-change-opacity-filter',
            willChangeTransform: 'will-change-transform',
            willChangeOpacity: 'will-change-opacity',
            willChangeTransformOpacity: 'will-change-transform-opacity',
        }),
        DYNAMIC_SELECTORS: Object.freeze({
             filterButton: '.filter-button',
             fullscreenSlideImageQuery: '.fullscreen-slide img',
        })
    }),
    SCROLL_MODE: Object.freeze({
        WHEEL_MULTIPLIER: 0.8, DRAG_MULTIPLIER: 1.5, MAX_METRIC_RETRIES: 3,
        METRIC_RETRY_DELAY_MS: 100,
        DESKTOP_MEDIA_QUERY: '(min-width: 62rem)',
        SUSPICIOUSLY_SMALL_OFFSET_HEIGHT_THRESHOLD: 10, // px
    }),
    GALLERY: Object.freeze({
        TOUCH_SWIPE_THRESHOLD: 50,
        IMAGE_WIDTHS_FOR_SRCSET: [240, 320, 480, 768, 1024, 1440, 1920],
    })
});


// ==========================================================================
// Project Data (Fetched Asynchronously)
// ==========================================================================
let PROJECTS_DATA = [];

async function fetchProjectsData() {
    try {
        const response = await fetch(CONFIG.DEFAULTS.PROJECTS_DATA_PATH);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} while fetching projects.json`);
        }
        const rawData = await response.json();
        PROJECTS_DATA = rawData.map(p => Object.freeze({
            ...p,
            computedSrcset: Utils.generateSrcset(p.src, CONFIG.GALLERY.IMAGE_WIDTHS_FOR_SRCSET)
        }));
        Logger.debug("✅ Projects data fetched and processed successfully.");
        return PROJECTS_DATA;
    } catch (error) {
        Logger.error("❌ Error fetching or parsing projects data:", error);
        PROJECTS_DATA = [];
        const gallerySection = domElements?.projectGallerySection || document.getElementById('project-gallery');
        if (gallerySection) {
            const errorMsg = document.createElement('p');
            errorMsg.className = CONFIG.SELECTORS.CLASS_NAMES.galleryEmptyMessage;
            errorMsg.textContent = "Error loading project data. Please try refreshing the page.";
            errorMsg.style.color = 'red';
            gallerySection.innerHTML = '';
            gallerySection.appendChild(errorMsg);
        }
        return [];
    }
}

// ==========================================================================
// Utility Functions (Encapsulated)
// ==========================================================================
const Utils = {
    _prefersReducedMotion: undefined,
    _cachedScrollbarWidth: undefined,

    debounce(func, delay) {
        let timeoutId;
        const debounced = function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                timeoutId = null;
                try {
                    func.apply(this, args);
                } catch (e) {
                    Logger.error(`Error in debounced function execution (${func.name || 'anonymous'}):`, e);
                }
            }, delay);
        };
        debounced.cancel = () => {
            clearTimeout(timeoutId);
            timeoutId = null;
        };
        return debounced;
    },

    throttle(func, limit) {
        let inThrottle = false;
        let lastResult;
        let timeoutId = null;
        let trailingCallScheduled = false;
        let lastArgs = null;
        let lastThis = null;

        const throttled = function(...args) {
            lastArgs = args;
            lastThis = this;
            if (!inThrottle) {
                inThrottle = true;
                try {
                    lastResult = func.apply(lastThis, lastArgs);
                } catch (e) {
                    Logger.error(`Error in throttled function execution (${func.name || 'anonymous'}):`, e);
                }
                timeoutId = setTimeout(() => {
                    inThrottle = false;
                    timeoutId = null;
                    if (trailingCallScheduled) {
                        trailingCallScheduled = false;
                        throttled.apply(lastThis, lastArgs);
                    }
                }, limit);
            } else {
                trailingCallScheduled = true;
            }
            return lastResult;
        };
        throttled.cancel = () => {
            clearTimeout(timeoutId);
            inThrottle = false;
            trailingCallScheduled = false;
            lastArgs = null;
            lastThis = null;
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
        };
        return throttled;
    },

    getScrollbarWidth(forceRecalculate = false) {
        if (!forceRecalculate && this._cachedScrollbarWidth !== undefined) {
            return this._cachedScrollbarWidth;
        }
        if (typeof window === 'undefined' || typeof document === 'undefined' || !document.documentElement) {
            Logger.warn("Scrollbar width check skipped: Not in a browser environment.");
            this._cachedScrollbarWidth = 0;
            return 0;
        }
        try {
            const visualViewportWidth = window.visualViewport ? window.visualViewport.width : window.innerWidth;
            const scrollbarWidth = visualViewportWidth - document.documentElement.clientWidth;
            this._cachedScrollbarWidth = Math.max(0, scrollbarWidth);
            return this._cachedScrollbarWidth;
        } catch (e) {
            Logger.warn("Could not calculate scrollbar width using standard properties. Falling back to div method.", e);
            try {
                if (!document.body) {
                    Logger.warn("Scrollbar width fallback failed: document.body not available yet for measurement.");
                    this._cachedScrollbarWidth = 0;
                    return 0;
                }
                const outer = document.createElement('div');
                Object.assign(outer.style, { visibility: 'hidden', position: 'absolute', top: '-9999px', left: '-9999px', width: '100px', height: '100px', overflow: 'scroll' });
                document.body.appendChild(outer);
                const widthWithScroll = outer.offsetWidth;
                const inner = document.createElement('div');
                inner.style.width = '100%';
                outer.appendChild(inner);
                const widthWithoutScroll = inner.offsetWidth;
                outer.parentNode?.removeChild(outer);
                this._cachedScrollbarWidth = Math.max(0, widthWithScroll - widthWithoutScroll);
                return this._cachedScrollbarWidth;
            } catch (fallbackError) {
                Logger.error("Scrollbar width calculation failed using both methods.", fallbackError);
                this._cachedScrollbarWidth = 0;
                return 0;
            }
        }
    },

    prefersReducedMotion() {
        if (this._prefersReducedMotion !== undefined) {
            return this._prefersReducedMotion;
        }
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            this._prefersReducedMotion = false;
            return false;
        }
        try {
            this._prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            return this._prefersReducedMotion;
        } catch (e) {
            Logger.warn("Could not determine reduced motion preference via matchMedia.", e);
            this._prefersReducedMotion = false;
            return false;
        }
    },

    generateSrcset(baseSrc, widths) {
        if (!baseSrc || !Array.isArray(widths) || widths.length === 0) {
            Logger.warn("generateSrcset: Invalid input, returning baseSrc.", { baseSrc, widths });
            return baseSrc;
        }
        try {
            const filenameWithExt = baseSrc.substring(baseSrc.lastIndexOf('/') + 1);
            const baseFilenamePart = filenameWithExt.replace(/\.webp$/, '');
            const cleanBaseFilename = baseFilenamePart.replace(/-(\d+)w$/, '');
            const directoryPath = baseSrc.substring(0, baseSrc.lastIndexOf('/') + 1);
            const srcsetEntries = widths.map(w => `${directoryPath}${cleanBaseFilename}-${w}w.webp ${w}w`);
            return srcsetEntries.join(', ');
        } catch (e) {
            Logger.error("Error generating srcset for:", baseSrc, e);
            return baseSrc;
        }
    },

    createErrorNode(title, isFullscreenSlide = false) {
        const CN = CONFIG.SELECTORS.CLASS_NAMES;
        const errorWrapper = document.createElement('div');
        errorWrapper.className = CN.itemErrorContent;

        const visuallyHiddenErrorText = document.createElement('span');
        visuallyHiddenErrorText.className = CN.visuallyHidden;
        visuallyHiddenErrorText.textContent = 'Error:';
        errorWrapper.appendChild(visuallyHiddenErrorText);

        const mainErrorText = document.createTextNode(' Image failed to load');
        errorWrapper.appendChild(mainErrorText);

        if (title && title.trim() !== '') {
            const errorTitleSpan = document.createElement('span');
            errorTitleSpan.className = CN.slideErrorTitle;
            errorTitleSpan.textContent = ` (${title})`;
            errorWrapper.appendChild(errorTitleSpan);
        }
        return errorWrapper;
    },

    getSafeAltText(title, index, defaultPrefix = CONFIG.DEFAULTS.ALT_TEXT_PREFIX) {
        const trimmedTitle = typeof title === 'string' ? title.trim() : '';
        if (trimmedTitle) {
            return trimmedTitle;
        }
        return `${defaultPrefix} ${index + 1}`;
    },

    addWillChange(element, willChangeClass) {
        if (element && willChangeClass && !this.prefersReducedMotion()) {
            element.classList.add(willChangeClass);
        }
    },

    removeWillChange(element, willChangeClass) {
        if (element && willChangeClass && !this.prefersReducedMotion()) {
            element.classList.remove(willChangeClass);
        }
    },

    createTransitionPromise(element, expectedProperties) {
        return new Promise((resolve) => {
            const animationDuration = CONFIG.ANIMATION.ZOOM_TRANSITION_MS;
            const fallbackBuffer = CONFIG.ANIMATION.TRANSITION_END_FALLBACK_BUFFER_MS;
            let fallbackTimer = null;

            const onEnd = (event) => {
                if (event && event.target !== element) return;
                if (event && expectedProperties && !expectedProperties.includes(event.propertyName)) return;

                cleanup();
                resolve({ timedOut: false });
            };

            const cleanup = () => {
                clearTimeout(fallbackTimer);
                element.removeEventListener('transitionend', onEnd);
            };

            element.addEventListener('transitionend', onEnd);
            fallbackTimer = setTimeout(() => {
                Logger.warn(`TransitionEnd fallback triggered for element:`, element.alt || element.tagName);
                cleanup();
                resolve({ timedOut: true });
            }, animationDuration + fallbackBuffer);
        });
    }
};

// ==========================================================================
// DOM Caching
// ==========================================================================

function cacheDomElements() {
    const d = document;
    const cacheableSelectors = CONFIG.SELECTORS.CACHEABLE_ELEMENTS;
    const elements = {};
    let allEssentialFound = true;

    const essentialKeys = Object.freeze(['root', 'html', 'body', 'mainContainer', 'mainContent']);
    const galleryEssentialKeys = Object.freeze(['scrollModeGallery', 'thumbnailColumn', 'mainImageColumn', 'thumbnailScroller', 'mainImageScroller', 'activeCursor', 'scrollGalleryStatus', 'fullscreenContainer', 'fullscreenSliderWrapper', 'fullscreenCloseButton', 'fullscreenStatusLabel']);
    const uiEssentialKeys = Object.freeze(['filterList', 'roleElement']);
    const optionalKeys = Object.freeze(['projectGallerySection', 'hueShiftButton', 'darkModeButton', 'darkModeIcon', 'backgroundCanvas', 'navLinksQuery']);

    Logger.debug("⚙️ Caching DOM elements...");
    try {
        for (const key in cacheableSelectors) {
            if (!Object.prototype.hasOwnProperty.call(cacheableSelectors, key)) continue;
            const selector = cacheableSelectors[key];
            if (key === 'navLinksQuery') {
                if (typeof selector === 'string' && selector.trim() !== '') { try { elements.navLinks = Array.from(d.querySelectorAll(selector)); } catch (e) { Logger.error(`❌ Error querying nav links with selector "${selector}":`, e); elements.navLinks = []; } } else { elements.navLinks = []; AppConfig.IS_DEVELOPMENT_MODE && (selector ? Logger.warn(`⚠️ Nav links query selector is empty.`) : Logger.warn(`⚠️ Nav links query selector not defined.`)); }
                continue;
            }
            elements[key] = d.querySelector(selector);
            if (!elements[key]) {
                if (essentialKeys.includes(key)) { Logger.error(`‼️ Fatal Error: Essential DOM element "${key}" (selector: "${selector}") not found.`); allEssentialFound = false; }
                else if (galleryEssentialKeys.includes(key)) { Logger.error(`‼️ Gallery Error: Essential gallery DOM element "${key}" (selector: "${selector}") not found.`); }
                else if (uiEssentialKeys.includes(key)) { Logger.warn(`⚠️ UI Feature Warning: Core UI element "${key}" (selector "${selector}") not found.`); }
                else if (optionalKeys.includes(key)) { Logger.info(`ℹ️ Optional element "${key}" (selector "${selector}") not found. Dependent functionality might be limited.`); }
                else { Logger.warn(`❓ Uncategorized element "${key}" (selector "${selector}") not found.`); }
            }
        }
        if (!allEssentialFound) { Logger.error("❌ App initialization aborted due to missing essential DOM elements."); return null; }
        Logger.debug("✅ DOM elements cached successfully.");
        return elements;
    } catch (error) { Logger.error("❌ Unexpected error during DOM element caching:", error); return null; }
}
let domElements = null;
let isScrolledTop = true;

// ==========================================================================
// BackgroundAnimation Class (Liquid Fluidity Style)
// ==========================================================================
class BackgroundAnimation {
    canvasElement = null;
    ctx = null;
    config;
    blobs = [];
    colors = [];
    frameId = null;
    isInitialized = false;
    debouncedHandleResize;
    devicePixelRatio = 1;

    constructor() {
        this.canvasElement = domElements?.backgroundCanvas ?? null;
        this.config = CONFIG.BACKGROUND;
        this._animate = this._animate.bind(this);
        this.debouncedHandleResize = Utils.debounce(this._handleResizeInternal.bind(this), CONFIG.ANIMATION.RESIZE_DEBOUNCE_MS);

        if (!this.canvasElement) {
            Logger.warn("⚠️ Background canvas element not found. Animation disabled.");
            this.isInitialized = false;
            return;
        }
        try {
            this.ctx = this.canvasElement.getContext('2d');
            if (!this.ctx) {
                Logger.error("❌ Failed to get 2D rendering context for background canvas. Animation disabled.");
                this.canvasElement = null;
                this.isInitialized = false;
                return;
            }
        } catch (e) {
            Logger.error("❌ Error getting 2D context:", e);
            this.canvasElement = null;
            this.ctx = null;
            this.isInitialized = false;
            return;
        }
        this.devicePixelRatio = window.devicePixelRatio || 1;
        this.isInitialized = this._initializeState();
    }

    _initializeState() {
        if (!this.canvasElement || !this.ctx || !domElements?.root) {
            Logger.warn("⚠️ Background animation initialization failed: Missing canvas, context, or root element.");
            this.stop();
            return false;
        }
        this.stop();
        this.devicePixelRatio = window.devicePixelRatio || 1;
        this.canvasElement.width = window.innerWidth * this.devicePixelRatio;
        this.canvasElement.height = window.innerHeight * this.devicePixelRatio;

        if (!this.updateColors()) { // Fetches initial colors
            Logger.warn("⚠️ Background animation initialization failed: Could not update colors from CSS variables. Blobs will not be created.");
            this.blobs = [];
            return false;
        }
        try {
            if (this.colors && this.colors.length > 0) {
                this._createBlobs(); // Create blobs with these initial colors
            } else {
                Logger.warn("⚠️ Background animation: No valid colors available, skipping blob creation.");
                this.blobs = [];
            }
            return true;
        } catch (error) {
            Logger.error("❌ Error during background animation blob creation:", error);
            this.blobs = [];
            return false;
        }
    }

    updateColors() {
        if (!domElements?.root) return false;
        try {
            const computedStyle = getComputedStyle(domElements.root);
            const fallbackColor = 'transparent';
            const fetchedColors = [
                computedStyle.getPropertyValue('--ball-color-light').trim() || '',
                computedStyle.getPropertyValue('--ball-color-medium').trim() || '',
                computedStyle.getPropertyValue('--ball-color-dark').trim() || '',
            ];
            this.colors = fetchedColors.filter(color => color && color !== fallbackColor && CSS.supports('color', color));

            if (this.colors.length === 0) {
                Logger.warn("⚠️ Background animation colors not found or invalid in CSS variables (--ball-color-*). Using fallbacks.");
                this.colors = ['hsla(200, 80%, 70%, 0.7)', 'hsla(300, 70%, 60%, 0.7)', 'hsla(50, 80%, 65%, 0.7)'];
            }
            return true;
        } catch (e) {
            Logger.error("❌ Error reading background color CSS variables:", e);
            this.colors = ['hsla(200, 80%, 70%, 0.7)', 'hsla(300, 70%, 60%, 0.7)', 'hsla(50, 80%, 65%, 0.7)'];
            return false;
        }
    }

    refreshVisualsWithNewColors() {
        if (!this.isInitialized) {
            Logger.warn("Cannot refresh visuals: animation not initialized. Attempting full init.");
            this.isInitialized = this._initializeState();
            if (this.isInitialized) {
                this.start();
            }
            return;
        }

        const colorsSuccessfullyFetched = this.updateColors();

        if (colorsSuccessfullyFetched) {
            const wasRunning = !!this.frameId;
            this.stop();
            try {
                if (this.colors && this.colors.length > 0) {
                    this._createBlobs();
                } else {
                    this.blobs = [];
                    Logger.warn("No blobs created as no valid colors after update.");
                }
            } catch (error) {
                Logger.error("❌ Error re-creating blobs during visual refresh:", error);
                this.blobs = [];
            }
            if (wasRunning || (this.blobs.length > 0 && !wasRunning)) {
                this.start();
            } else if (this.blobs.length === 0 && wasRunning) {
                Logger.info("Animation stopped as no blobs to animate after color refresh.");
            }
        } else {
            Logger.warn("Failed to fetch new colors, visuals not refreshed.");
        }
    }


    start() {
        if (!this.isInitialized) {
            this.isInitialized = this._initializeState();
            if (!this.isInitialized) {
                Logger.warn("⚠️ Cannot start background animation: Initialization failed.");
                return;
            }
        }
        if (this.canvasElement && this.ctx && this.blobs.length > 0 && !this.frameId) {
            this.frameId = requestAnimationFrame(this._animate);
        } else if (this.blobs.length === 0) {
            Logger.info("ℹ️ Background animation not starting as there are no blobs to animate (likely due to color issues).");
        }
    }

    stop() {
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
    }

    handleResize() {
        if (this.canvasElement) {
            this.debouncedHandleResize();
        }
    }

    _handleResizeInternal() {
        if (!this.canvasElement || !this.ctx) return;
        const reinitialized = this._initializeState();
        if (reinitialized) {
            this.start();
        } else {
            Logger.warn("⚠️ Background animation failed to re-initialize on resize.");
            this.stop();
        }
    }

    _createBlobs() {
        const { MOBILE_BALLS, DESKTOP_BALLS, BASE_RADIUS_FACTOR, RADIUS_VAR_FACTOR, MIN_SPEED, MAX_SPEED } = this.config;
        this.blobs = [];

        if (!this.colors || this.colors.length === 0) {
            Logger.warn("⚠️ Cannot create background blobs: Invalid or missing colors.");
            return;
        }

        const w = this.canvasElement.width;
        const h = this.canvasElement.height;
        const numBlobs = window.innerWidth < 768 ? MOBILE_BALLS : DESKTOP_BALLS;
        if (numBlobs <= 0) return;

        const minCanvasDim = Math.min(w, h);

        for (let i = 0; i < numBlobs; i++) {
            const baseR = minCanvasDim * BASE_RADIUS_FACTOR;
            const varR = baseR * RADIUS_VAR_FACTOR;
            const speed = (MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED)) * this.devicePixelRatio;
            const angle = Math.random() * Math.PI * 2;

            const blob = {
                x: Math.random() * w,
                y: Math.random() * h,
                radius: baseR + (Math.random() * varR * 2 - varR),
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color1: this.colors[i % this.colors.length],
                color2: this.colors[(i + 1 + Math.floor(this.colors.length / 2)) % this.colors.length]
            };
            this.blobs.push(blob);
        }
    }

    _updateBlobs() {
        if (!this.blobs || this.blobs.length === 0 || !this.canvasElement) return;
        const { DAMPING } = this.config;
        const w = this.canvasElement.width;
        const h = this.canvasElement.height;

        try {
            this.blobs.forEach(b => {
                b.x += b.vx;
                b.y += b.vy;
                b.vx *= DAMPING;
                b.vy *= DAMPING;

                if (b.x - b.radius > w) b.x = -b.radius + (b.x - b.radius - w);
                else if (b.x + b.radius < 0) b.x = w + b.radius + (b.x + b.radius);

                if (b.y - b.radius > h) b.y = -b.radius + (b.y - b.radius - h);
                else if (b.y + b.radius < 0) b.y = h + b.radius + (b.y + b.radius);
            });
        } catch (e) {
            Logger.error("❌ Error updating background blob physics:", e);
            this.stop();
        }
    }

    _drawBlobs() {
        if (!this.ctx || !this.canvasElement || !this.blobs?.length || !this.colors?.length) return;
        try {
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'lighter';
            this.ctx.filter = `blur(${this.config.BLUR_AMOUNT})`;
            this.ctx.globalAlpha = this.config.GLOBAL_ALPHA;

            this.blobs.forEach(b => {
                if (!b || typeof b.x !== 'number' || typeof b.y !== 'number' || typeof b.radius !== 'number' || !b.color1 || !b.color2) {
                    Logger.warn("⚠️ Invalid blob data encountered during draw:", b);
                    return;
                }
                const r = Math.max(1, b.radius);
                const grad = this.ctx.createRadialGradient(b.x, b.y, r * 0.05, b.x, b.y, r);

                grad.addColorStop(0, b.color1);
                let transparentColor2 = 'hsla(0, 0%, 0%, 0)';
                try {
                    if (b.color2.match(/hsla?\(.*,\s*([\d\.]+)\)$/) || b.color2.match(/rgba?\(.*,\s*([\d\.]+)\)$/)) {
                         transparentColor2 = b.color2.replace(/,\s*[\d\.]+\)$/, ', 0)');
                    } else if (b.color2.startsWith('hsl(')) {
                        transparentColor2 = b.color2.replace('hsl(', 'hsla(').replace(')', ', 0)');
                    } else if (b.color2.startsWith('rgb(')) {
                        transparentColor2 = b.color2.replace('rgb(', 'rgba(').replace(')', ', 0)');
                    } else {
                        Logger.warn(`Could not make color2 transparent: ${b.color2}. Using default transparent.`);
                    }
                } catch (e) {
                    Logger.warn(`Error processing color2 for transparency: ${b.color2}`, e);
                }
                grad.addColorStop(1, transparentColor2);


                this.ctx.beginPath();
                this.ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
                this.ctx.fillStyle = grad;
                this.ctx.fill();
            });
            this.ctx.restore();
        } catch (e) {
            Logger.error("❌ Error drawing background blobs:", e);
            if (this.ctx) this.ctx.restore();
            this.stop();
        }
    }

    _animate() {
        if (!this.isInitialized || !this.canvasElement || !this.ctx) {
            this.stop(); return;
        }
        this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        if (this.blobs.length > 0) {
            try {
                this._updateBlobs();
                this._drawBlobs();
            } catch (e) {
                Logger.error("❌ Error in animation frame:", e);
                this.stop(); return;
            }
        }
        if (this.frameId) {
            this.frameId = requestAnimationFrame(this._animate);
        }
    }

    destroy() {
        this.stop();
        this.debouncedHandleResize?.cancel?.();
        this.blobs = [];
        this.colors = [];
        this.isInitialized = false;
        this.canvasElement = null;
        this.ctx = null;
    }
}


// ==========================================================================
// Gallery Class
// ==========================================================================
class Gallery {
    dom = null; visibleImageData = []; animationConfig; galleryConfig; prefersReducedMotion = false; state = { currentIndex: 0, totalVisibleImages: 0, isAnimatingZoom: false, isSliderOpen: false, lastFocusedElement: null, clickedImageElement: null, boundHandlers: {}, scrollTimeoutId: null, focusableElementsCache: [] }; isInitialized = false;
    constructor() { this.isInitialized = false; const requiredKeys = ['fullscreenContainer', 'fullscreenSliderWrapper', 'fullscreenCloseButton', 'fullscreenStatusLabel', 'mainContent', 'mainContainer', 'body', 'html']; const allEssentialFound = requiredKeys.every(key => domElements?.[key]); if (!allEssentialFound || !domElements) { Logger.error(`‼️ Gallery (Slider) init failed: Missing essential DOM element(s). Gallery disabled.`); return; } try { this.dom = { container: domElements.fullscreenContainer, sliderWrapper: domElements.fullscreenSliderWrapper, closeButton: domElements.fullscreenCloseButton, statusLabel: domElements.fullscreenStatusLabel, mainContainer: domElements.mainContainer, mainContent: domElements.mainContent, body: domElements.body, html: domElements.html, projectGallerySection: domElements.projectGallerySection, }; this.animationConfig = CONFIG.ANIMATION; this.galleryConfig = CONFIG.GALLERY; this.prefersReducedMotion = Utils.prefersReducedMotion(); this.state.boundHandlers = { keydown: this._handleKeydown.bind(this), scroll: Utils.throttle(this._handleScroll.bind(this), this.animationConfig.SLIDER_SCROLL_THROTTLE_MS), slideClick: this._handleSlideClick.bind(this), closeClick: this._requestClose.bind(this), }; this.isInitialized = true; } catch (error) { Logger.error("❌ Critical error during Gallery construction:", error); this.isInitialized = false; this.dom = null; } }

    setupEventListeners() { if (!this.isInitialized || !this.dom) { Logger.warn("⚠️ Cannot setup Gallery listeners: Not initialized."); return; } this.dom.closeButton.addEventListener('click', this.state.boundHandlers.closeClick); this.dom.container.addEventListener('keydown', this.state.boundHandlers.keydown); this.dom.sliderWrapper.addEventListener('scroll', this.state.boundHandlers.scroll, { passive: true }); this.dom.sliderWrapper.addEventListener('click', this.state.boundHandlers.slideClick); }

    open(imageData, startIndex, clickedImageElement, focusReturnElement = null) { if (!this.isInitialized || this.state.isAnimatingZoom || this.state.isSliderOpen) { Logger.warn("⚠️ Gallery open request ignored: Already open or animating."); return; } if (!Array.isArray(imageData) || imageData.length === 0) { Logger.error("❌ Gallery open error: No valid image data provided."); return; } if (!(clickedImageElement instanceof HTMLImageElement)) { Logger.error("❌ Gallery open error: Invalid clicked image element provided for FLIP animation."); return; } if (!this.dom) { Logger.error("❌ Gallery open error: DOM elements not available."); return; } const clampedStartIndex = Math.max(0, Math.min(startIndex, imageData.length - 1)); this.visibleImageData = imageData; this.state.totalVisibleImages = imageData.length; this.state.currentIndex = clampedStartIndex; this.state.clickedImageElement = clickedImageElement; this.state.lastFocusedElement = focusReturnElement || clickedImageElement.closest(`.${CONFIG.SELECTORS.CLASS_NAMES.scrollGalleryMainItem}`) || document.activeElement || this.dom.body; this.state.isAnimatingZoom = true; try { this._prepareUIForOpen(); if (this.prefersReducedMotion) { this._openInstantly(); } else { this._animateZoomIn(); } } catch (error) { Logger.error("❌ Error during gallery open sequence:", error); this._closeInstantly(); } }
    _requestClose() { if (!this.isInitialized || this.state.isAnimatingZoom || !this.state.isSliderOpen) return; this.state.isAnimatingZoom = true; this.state.isSliderOpen = false; try { if (this.prefersReducedMotion) { this._closeInstantly(); } else { this._animateZoomOut(); } } catch (error) { Logger.error("❌ Error initiating gallery close animation:", error); this._closeInstantly(); } }
    _prepareUIForOpen() { if (!this.dom) throw new Error("Cannot prepare UI for open: DOM elements missing."); const { container, mainContainer, mainContent, html } = this.dom; const CN = CONFIG.SELECTORS.CLASS_NAMES; const sourceImgContainer = this.state.clickedImageElement?.closest(`.${CN.scrollGalleryMainItem}`); this._populateSlider(); this._cacheFocusableElements();
        if (sourceImgContainer) {
            sourceImgContainer.classList.add(CN.sourceElementZooming);
            if (!this.prefersReducedMotion) {
                Utils.addWillChange(sourceImgContainer, CN.willChangeOpacity);
                Object.assign(sourceImgContainer.style, { opacity: '0', visibility: 'hidden', pointerEvents: 'none', transition: 'none' });
            }
        }
        Utils.addWillChange(mainContent, CN.willChangeOpacityFilter);
        mainContainer.classList.add(CN.fullscreenEffectActive); html.classList.add(CN.fullscreenActive);
        Utils.addWillChange(container, CN.willChangeOpacity);
        container.style.display = 'flex'; container.removeAttribute('hidden'); container.setAttribute('aria-hidden', 'false'); container.classList.remove(CN.active); container.classList.add(CN.isZooming); mainContent.setAttribute('aria-hidden', 'true');
    }
    _openInstantly() { if (!this.dom) return; const { container, sliderWrapper } = this.dom; const CN = CONFIG.SELECTORS.CLASS_NAMES; const targetIndex = this.state.currentIndex; this.state.isAnimatingZoom = false; try { container.classList.add(CN.active); container.classList.remove(CN.isZooming); Utils.removeWillChange(container, CN.willChangeOpacity); const targetSlide = sliderWrapper.children?.[targetIndex]; if (targetSlide instanceof HTMLElement) { const scrollLeftTarget = targetSlide.offsetLeft - (sliderWrapper.offsetWidth - targetSlide.offsetWidth) / 2; sliderWrapper.scrollTo({ left: scrollLeftTarget, behavior: 'instant' }); } else { Logger.error(`❌ Open Instantly Error: Target slide element at index ${targetIndex} not found.`); sliderWrapper.scrollTo({ left: 0, behavior: 'instant' }); } this.state.isSliderOpen = true; this._updateAccessibilityState(); this._focusCloseButton(); } catch(error) { Logger.error("❌ Error opening gallery instantly:", error); this._closeInstantly(); } }

    async _animateZoomIn() {
        if (!this.dom) { this._openInstantly(); return; }
        const { container, sliderWrapper } = this.dom;
        const sourceImg = this.state.clickedImageElement;
        const targetIndex = this.state.currentIndex;
        const CN = CONFIG.SELECTORS.CLASS_NAMES;

        if (!sourceImg || !sliderWrapper) {
            Logger.error("❌ Zoom-in Error: Source image or slider wrapper missing. Opening instantly.");
            this._openInstantly();
            return;
        }

        let firstRect;
        try {
            firstRect = sourceImg.getBoundingClientRect();
        } catch (e) {
            Logger.error("❌ Zoom-in Error: Failed to get source bounds.", e);
            this._openInstantly();
            return;
        }

        const targetSlide = sliderWrapper.children[targetIndex];
        const targetSlideImage = targetSlide?.querySelector('img');

        if (!(targetSlide instanceof HTMLElement) || !(targetSlideImage instanceof HTMLImageElement)) {
            Logger.error(`❌ Zoom-in Error: Target slide/image at index ${targetIndex} not found.`);
            this._openInstantly();
            return;
        }

        const scrollLeftTarget = targetSlide.offsetLeft - (sliderWrapper.offsetWidth - targetSlide.offsetWidth) / 2;
        sliderWrapper.scrollTo({ left: scrollLeftTarget, behavior: 'instant' });

        targetSlideImage.getBoundingClientRect(); // Force reflow to get final position

        const lastRect = targetSlideImage.getBoundingClientRect();
        const deltaX = firstRect.left - lastRect.left;
        const deltaY = firstRect.top - lastRect.top;
        const scaleX = lastRect.width > 0 ? firstRect.width / lastRect.width : 1;
        const scaleY = lastRect.height > 0 ? firstRect.height / lastRect.height : 1;

        Utils.addWillChange(targetSlideImage, CN.willChangeTransformOpacity);
        targetSlideImage.style.transformOrigin = '0 0';
        targetSlideImage.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`;
        targetSlideImage.style.opacity = '0';

        await new Promise(resolve => requestAnimationFrame(resolve)); // Wait for styles to apply

        if (!this.state.isAnimatingZoom || !this.dom) { Utils.removeWillChange(targetSlideImage, CN.willChangeTransformOpacity); return; } // Check if aborted

        targetSlideImage.classList.add('fullscreen-image-transition');
        targetSlideImage.style.transform = '';
        targetSlideImage.style.opacity = '1';
        this.dom.container.classList.add(CN.active);

        await Utils.createTransitionPromise(targetSlideImage, ['transform', 'opacity']);
        this._onZoomInComplete(targetSlideImage);
    }

    async _animateZoomOut() {
        if (!this.dom) { this._closeInstantly(); return; }
        const { container, sliderWrapper, mainContainer, html, mainContent } = this.dom;
        const currentIndex = this.state.currentIndex;
        const CN = CONFIG.SELECTORS.CLASS_NAMES;
        const currentSlideData = this.visibleImageData?.[currentIndex];

        if (!container || !sliderWrapper || !mainContainer || !html || !currentSlideData) {
            Logger.error("❌ Zoom-out Error: Essential elements/data missing. Closing instantly.");
            this._closeInstantly(); return;
        }

        const currentSlideElement = sliderWrapper.children[currentIndex];
        const currentSlideImage = currentSlideElement?.querySelector('img');
        let targetElementContainer = null;

        // Try to find the original source element in the scroll gallery
        if (typeof currentSlideData.originalIndex === 'number') {
            targetElementContainer = document.querySelector(`.${CN.scrollGalleryMainItem}[data-original-index="${currentSlideData.originalIndex}"]`);
        }
        if (!targetElementContainer) { // Fallback if originalIndex method fails
            targetElementContainer = this.state.lastFocusedElement?.closest(`.${CN.scrollGalleryMainItem}`) || this.state.clickedImageElement?.closest(`.${CN.scrollGalleryMainItem}`);
            Logger.warn("⚠️ Zoom-out using fallback to find targetElementContainer as originalIndex lookup failed or data missing.");
        }
        const targetImage = targetElementContainer?.querySelector('img');

        if (!currentSlideImage || !targetElementContainer || !targetImage) {
            Logger.warn("⚠️ Zoom-out Warning: Cannot find source or target for FLIP. Closing instantly.");
            this._closeInstantly(); return;
        }

        let firstRect;
        try { firstRect = currentSlideImage.getBoundingClientRect(); }
        catch(e) { Logger.error("❌ Zoom-out Error: Cannot get fullscreen image bounds.", e); this._closeInstantly(); return; }

        // Make target element visible again for FLIP
        Object.assign(targetElementContainer.style, { opacity: '', visibility: '', pointerEvents: '', transition: '' });
        Utils.removeWillChange(targetElementContainer, CN.willChangeOpacity);
        targetElementContainer.classList.remove(CN.sourceElementZooming);

        // Start fading out fullscreen and main content effects
        Utils.removeWillChange(mainContent, CN.willChangeOpacityFilter);
        container.classList.remove(CN.active); mainContainer.classList.remove(CN.fullscreenEffectActive); html.classList.remove(CN.fullscreenActive); container.classList.add(CN.isZooming);
        
        await new Promise(resolve => requestAnimationFrame(resolve)); // Wait for UI changes to apply
        if (!this.state.isAnimatingZoom || !this.dom) return; // Check if aborted

        const lastRect = targetImage.getBoundingClientRect(); // Get target's final position
        const deltaX = lastRect.left - firstRect.left;
        const deltaY = lastRect.top - firstRect.top;
        const scaleX = firstRect.width > 0 ? lastRect.width / firstRect.width : 1;
        const scaleY = firstRect.height > 0 ? lastRect.height / firstRect.height : 1;

        Utils.addWillChange(currentSlideImage, CN.willChangeTransformOpacity);
        currentSlideImage.style.transformOrigin = '0 0';
        currentSlideImage.classList.add('fullscreen-image-transition');
        currentSlideImage.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`;
        currentSlideImage.style.opacity = '0';

        await Utils.createTransitionPromise(currentSlideImage, ['transform', 'opacity']);
        this._onZoomOutComplete(currentSlideImage);
    }

    _onZoomInComplete(transitionedImage) {
        if (!this.state.isAnimatingZoom || !this.dom) return;
        try {
            this._resetZoomStyles(transitionedImage);
            this.dom.container.classList.remove(CONFIG.SELECTORS.CLASS_NAMES.isZooming);
            Utils.removeWillChange(this.dom.container, CONFIG.SELECTORS.CLASS_NAMES.willChangeOpacity);

            const sourceContainer = this.state.clickedImageElement?.closest(`.${CONFIG.SELECTORS.CLASS_NAMES.scrollGalleryMainItem}`);
            if (sourceContainer) {
                if (!this.prefersReducedMotion) { // No need to revert styles if they weren't changed for reduced motion
                    Object.assign(sourceContainer.style, { opacity: '', visibility: '', pointerEvents: '', transition: '' });
                    Utils.removeWillChange(sourceContainer, CONFIG.SELECTORS.CLASS_NAMES.willChangeOpacity);
                }
                // sourceContainer.classList.remove(CONFIG.SELECTORS.CLASS_NAMES.sourceElementZooming); // Keep this until close
            }
            this.state.isAnimatingZoom = false;
            this.state.isSliderOpen = true;
            this._updateAccessibilityState();
            this._focusCloseButton();
        } catch(error) {
            Logger.error("❌ Error in _onZoomInComplete:", error);
            this._closeInstantly(); // Fallback to ensure clean state
        }
    }
    _onZoomOutComplete(transitionedImage) {
        if (!this.state.isAnimatingZoom && !this.prefersReducedMotion) return; // Ensure still animating or if it was instant close
        try {
            this._resetZoomStyles(transitionedImage);
            this._cleanupUIOnClose();
            this.state.isAnimatingZoom = false;
            this._restoreFocus();
            this.state.clickedImageElement = null; // Clear after use
        } catch(error) {
            Logger.error("❌ Error in _onZoomOutComplete:", error);
            // Ensure cleanup even if there's an error during the completion logic
            this._cleanupUIOnClose();
            this.state.isAnimatingZoom = false;
            this._restoreFocus();
            this.state.clickedImageElement = null;
        }
    }
    _resetZoomStyles(imageElement) { if (imageElement instanceof HTMLImageElement) { imageElement.classList.remove('fullscreen-image-transition'); Object.assign(imageElement.style, { transform: '', transformOrigin: '', opacity: '' }); Utils.removeWillChange(imageElement, CONFIG.SELECTORS.CLASS_NAMES.willChangeTransformOpacity); } else if (imageElement) { Logger.warn("⚠️ _resetZoomStyles: Received non-image element:", imageElement); } }
    _cleanupUIOnClose() {
        if (!this.dom) return;
        const { container, sliderWrapper, mainContainer, mainContent, html, statusLabel } = this.dom;
        const CN = CONFIG.SELECTORS.CLASS_NAMES;

        if (container) { Object.assign(container.style, { display: 'none' }); container.setAttribute('hidden', 'true'); container.setAttribute('aria-hidden', 'true'); container.classList.remove(CN.active, CN.isZooming); Utils.removeWillChange(container, CN.willChangeOpacity); }
        if (mainContent) { mainContent.setAttribute('aria-hidden', 'false'); Utils.removeWillChange(mainContent, CN.willChangeOpacityFilter); }
        html?.classList.remove(CN.fullscreenActive); mainContainer?.classList.remove(CN.fullscreenEffectActive);

        // Clean up the source element that was hidden/styled for FLIP
        try {
            const sourceContainerSelector = `.${CN.scrollGalleryMainItem}`;
            let sourceElement = null;
            const currentSlideData = this.visibleImageData?.[this.state.currentIndex]; // Use current index at time of closing

            if (currentSlideData && typeof currentSlideData.originalIndex === 'number') {
                 sourceElement = document.querySelector(`${sourceContainerSelector}[data-original-index="${currentSlideData.originalIndex}"]`);
            }
            // Fallback to clicked element's parent if current slide data is somehow lost or originalIndex isn't there
            if (!sourceElement && this.state.clickedImageElement) {
                sourceElement = this.state.clickedImageElement.closest(sourceContainerSelector);
            }
            // Final fallback to last focused element's parent if applicable
            if (!sourceElement && this.state.lastFocusedElement) {
                sourceElement = this.state.lastFocusedElement.closest(sourceContainerSelector);
            }

            if (sourceElement) {
                sourceElement.classList.remove(CN.sourceElementZooming);
                Object.assign(sourceElement.style, { opacity: '', visibility: '', pointerEvents: '', transition: '' }); // Reset styles
                Utils.removeWillChange(sourceElement, CN.willChangeOpacity);
            }
        } catch (e) { Logger.warn("⚠️ Minor error removing sourceElementZooming class or styles during cleanup:", e); }

        if (sliderWrapper) sliderWrapper.replaceChildren(); // Clear slider content
        if (statusLabel) statusLabel.textContent = '';
        this.visibleImageData = [];
        this.state.focusableElementsCache = [];
        Object.assign(this.state, { totalVisibleImages: 0, currentIndex: 0, scrollTimeoutId: null }); // Reset relevant state
        clearTimeout(this.state.scrollTimeoutId);
    }
    _closeInstantly() { if (!this.isInitialized) return; Logger.warn("⚠️ Closing gallery instantly.");  const animatingImage = this.dom?.sliderWrapper?.querySelector('.fullscreen-image-transition'); if (animatingImage instanceof HTMLImageElement) this._resetZoomStyles(animatingImage); this.state.isAnimatingZoom = false; this._cleanupUIOnClose(); this.state.isSliderOpen = false; this._restoreFocus(); this.state.clickedImageElement = null; }
    _focusCloseButton() { if (!this.dom) return; try { const closeButton = this.dom.closeButton; if (closeButton && closeButton.offsetParent !== null) { closeButton.focus({ preventScroll: true }); } else if (this.dom.container && this.dom.container.offsetParent !== null) { Logger.warn("⚠️ Close button not focusable. Focusing gallery container."); this.dom.container.focus({ preventScroll: true }); } else { Logger.warn("⚠️ Could not focus close button or gallery container."); } } catch (e) { Logger.error("❌ Error setting focus on close button/container:", e); try { this.dom.body?.focus({ preventScroll: true }); } catch (be) { /* Ignore */ } } }
    _restoreFocus() { if (!this.dom) return; const elementToRestore = this.state.lastFocusedElement; try { if (elementToRestore instanceof HTMLElement && typeof elementToRestore.focus === 'function' && document.body.contains(elementToRestore) && elementToRestore.offsetParent !== null) { elementToRestore.focus({ preventScroll: true }); } else { Logger.warn("⚠️ Original element to restore focus to is invalid, missing, or hidden. Focusing body."); this.dom.body.focus({ preventScroll: true }); } } catch (e) { Logger.error("❌ Error attempting to restore focus:", e); try { this.dom.body.focus({ preventScroll: true }); } catch (fe) { /* Ignore */ } } finally { this.state.lastFocusedElement = null; } }
    navigate(direction) { if (!this.isInitialized || !this.dom || !this.state.isSliderOpen || this.state.isAnimatingZoom || this.state.totalVisibleImages <= 1) return; const { sliderWrapper } = this.dom; const { currentIndex, totalVisibleImages } = this.state; const newIndex = currentIndex + direction; if (newIndex < 0 || newIndex >= totalVisibleImages) return; try { const targetSlide = sliderWrapper.children[newIndex]; if (!(targetSlide instanceof HTMLElement)) { Logger.error(`❌ Navigate Error: Slide element at index ${newIndex} not found.`); return; } const scrollBehavior = this.prefersReducedMotion ? 'instant' : 'smooth'; const scrollLeftTarget = targetSlide.offsetLeft - (sliderWrapper.offsetWidth - targetSlide.offsetWidth) / 2; sliderWrapper.scrollTo({ left: scrollLeftTarget, behavior: scrollBehavior }); if (scrollBehavior === 'instant') { this._updateCurrentIndex(newIndex); } } catch (error) { Logger.error(`❌ Error during gallery navigation (direction: ${direction}):`, error); } }
    _handleSlideClick(event) { if (!this.isInitialized || !this.dom || this.state.isAnimatingZoom || !this.state.isSliderOpen) return; const clickedSlide = event.target?.closest(`.${CONFIG.SELECTORS.CLASS_NAMES.fullscreenSlide}`); if (!clickedSlide || clickedSlide.classList.contains(CONFIG.SELECTORS.CLASS_NAMES.isActiveSlide)) return; try { const clickedIndex = parseInt(clickedSlide.dataset.slideIndex ?? '-1', 10); if (!isNaN(clickedIndex) && clickedIndex >= 0 && clickedIndex < this.state.totalVisibleImages) { const targetSlide = this.dom.sliderWrapper.children[clickedIndex]; if (targetSlide instanceof HTMLElement) { const scrollBehavior = this.prefersReducedMotion ? 'instant' : 'smooth'; const scrollLeftTarget = targetSlide.offsetLeft - (this.dom.sliderWrapper.offsetWidth - targetSlide.offsetWidth) / 2; this.dom.sliderWrapper.scrollTo({ left: scrollLeftTarget, behavior: scrollBehavior }); if (scrollBehavior === 'instant') this._updateCurrentIndex(clickedIndex); } else Logger.error(`_handleSlideClick: Target slide at index ${clickedIndex} not found.`); } else if (isNaN(clickedIndex)) { Logger.warn("⚠️ Clicked slide missing valid data-slide-index attribute."); } } catch (e) { Logger.error("❌ Error handling slide click navigation:", e); } }
    _updateAccessibilityState() { if (!this.isInitialized || !this.dom) return; const { sliderWrapper, statusLabel } = this.dom; const { currentIndex, totalVisibleImages } = this.state; const imageData = this.visibleImageData; const { isActiveSlide } = CONFIG.SELECTORS.CLASS_NAMES; if (!sliderWrapper || !statusLabel) { Logger.warn("⚠️ Cannot update accessibility state: slider wrapper or status label missing."); return; } if (totalVisibleImages === 0 || !imageData || imageData.length === 0) { statusLabel.textContent = "No images to display."; Array.from(sliderWrapper.children).forEach(slide => slide.classList.remove(isActiveSlide)); return; } const safeCurrentIndex = Math.max(0, Math.min(currentIndex, imageData.length - 1)); const currentSlideData = imageData[safeCurrentIndex]; statusLabel.textContent = currentSlideData?.title ? `${currentSlideData.title}, slide ${safeCurrentIndex + 1} of ${totalVisibleImages}` : `Slide ${safeCurrentIndex + 1} of ${totalVisibleImages}`; Array.from(sliderWrapper.children).forEach((slide, index) => { if (!(slide instanceof HTMLElement)) return; const isActive = index === safeCurrentIndex; slide.classList.toggle(isActiveSlide, isActive);
            if (!this.prefersReducedMotion) {
                if (isActive || Math.abs(index - safeCurrentIndex) === 1) { // Active and immediate neighbors
                    Utils.addWillChange(slide, CONFIG.SELECTORS.CLASS_NAMES.willChangeOpacityFilter);
                } else {
                    Utils.removeWillChange(slide, CONFIG.SELECTORS.CLASS_NAMES.willChangeOpacityFilter);
                }
            }
            const imgData = (index < imageData.length) ? imageData[index] : null; const ariaLabel = Utils.getSafeAltText(imgData?.title, index) + ` (Slide ${index + 1} of ${totalVisibleImages})`; slide.setAttribute('aria-label', ariaLabel); if (!slide.getAttribute('role')) slide.setAttribute('role', 'group'); if (!slide.getAttribute('aria-roledescription')) slide.setAttribute('aria-roledescription', 'slide'); }); }
    _handleScroll() { if (!this.isInitialized || !this.dom || !this.state.isSliderOpen || this.state.isAnimatingZoom) return; const wrapper = this.dom.sliderWrapper; if (!wrapper) return; clearTimeout(this.state.scrollTimeoutId); this.state.scrollTimeoutId = setTimeout(() => { if (!this.isInitialized || !this.state.isSliderOpen || this.state.isAnimatingZoom || !this.dom) return; try { const scrollLeft = wrapper.scrollLeft; const wrapperWidth = wrapper.offsetWidth; let newIndex = -1; let minDistance = Infinity; Array.from(wrapper.children).forEach((slide, index) => { if (slide instanceof HTMLElement && slide.offsetWidth > 0) { const slideCenter = slide.offsetLeft + slide.offsetWidth / 2; const wrapperCenter = scrollLeft + wrapperWidth / 2; const distance = Math.abs(slideCenter - wrapperCenter); if (distance < minDistance) { minDistance = distance; newIndex = index; } } }); if (newIndex !== -1 && newIndex !== this.state.currentIndex) { this._updateCurrentIndex(newIndex); } } catch (e) { Logger.error("❌ Error calculating centered slide index:", e); } }, this.animationConfig.SLIDE_UPDATE_DELAY_MS); }
    _updateCurrentIndex(newIndex) { if (newIndex >= 0 && newIndex < this.state.totalVisibleImages && newIndex !== this.state.currentIndex) { this.state.currentIndex = newIndex; this._updateAccessibilityState(); } }

    _handleKeydown(event) {
        if (!this.isInitialized || !this.state.isSliderOpen || this.state.isAnimatingZoom) return;
        let handled = false;
        switch (event.key) {
            case 'Escape': this._requestClose(); handled = true; break;
            case 'ArrowLeft': case 'Left': this.navigate(-1); handled = true; break;
            case 'ArrowRight': case 'Right': this.navigate(1); handled = true; break;
            case 'Tab': this._trapFocus(event); break; // trapFocus will call preventDefault if needed
            case 'Home': if (this.state.currentIndex > 0) { this.navigate(-this.state.currentIndex); handled = true; } break;
            case 'End': if (this.state.currentIndex < this.state.totalVisibleImages - 1) { this.navigate(this.state.totalVisibleImages - 1 - this.state.currentIndex); handled = true; } break;
        }
        if (handled) event.preventDefault();
    }

    _cacheFocusableElements() {
        if (!this.dom?.container) {
            this.state.focusableElementsCache = []; return;
        }
        try {
            this.state.focusableElementsCache = Array.from(
                this.dom.container.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')
            ).filter(el => el instanceof HTMLElement && el.offsetParent !== null && !el.closest('[aria-hidden="true"]'));
        } catch (error) {
            Logger.error("❌ Error caching focusable elements in gallery:", error);
            this.state.focusableElementsCache = [];
        }
    }

    _trapFocus(event) {
        const focusableElements = this.state.focusableElementsCache;
        if (focusableElements.length === 0) {
            event.preventDefault(); Logger.warn("⚠️ No focusable elements found in modal cache."); return;
        }
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const currentActive = document.activeElement;

        if (event.shiftKey) { // Tabbing backwards
            if (currentActive === firstElement || !this.dom.container?.contains(currentActive)) {
                event.preventDefault();
                lastElement.focus();
            }
        } else { // Tabbing forwards
            if (currentActive === lastElement || !this.dom.container?.contains(currentActive)) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }

    _populateSlider() {
        if (!this.isInitialized || !this.dom) { Logger.error("❌ Cannot populate slider: Not initialized or DOM missing."); return; }
        const wrapper = this.dom.sliderWrapper;
        if (!wrapper) { Logger.error("❌ Cannot populate slider: Wrapper element missing."); return; }
        wrapper.replaceChildren(); // Clear previous slides
        const fragment = document.createDocumentFragment();
        const CN = CONFIG.SELECTORS.CLASS_NAMES;

        if (this.visibleImageData.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.textContent = "No images to display.";
            emptyMsg.className = CN.galleryEmptyMessage; // Use consistent class
            emptyMsg.setAttribute('role', 'status');
            fragment.appendChild(emptyMsg);
        } else {
            this.visibleImageData.forEach((imageData, index) => {
                const slide = document.createElement('div');
                slide.className = CN.fullscreenSlide;
                slide.setAttribute('role', 'group'); // Role for slide container
                slide.setAttribute('aria-roledescription', 'slide');
                slide.dataset.slideIndex = String(index);
                slide.setAttribute('aria-label', `Loading slide ${index + 1}`); // Initial ARIA label

                const picture = document.createElement('picture');
                picture.classList.add(CN.slideLoadingPlaceholder); // For loading state styling

                const sourceWebp = document.createElement('source');
                sourceWebp.type = 'image/webp';
                // Use pre-computed srcset if available, otherwise generate
                sourceWebp.srcset = imageData.computedSrcset || Utils.generateSrcset(imageData.src, this.galleryConfig.IMAGE_WIDTHS_FOR_SRCSET);
                // Responsive sizes attribute
                sourceWebp.sizes = `(max-width: 61.9375rem) 85vw, 80vw`;

                const img = document.createElement('img');
                const imgAltText = Utils.getSafeAltText(imageData.title, index);
                img.alt = imgAltText;
                img.loading = 'lazy';
                img.decoding = 'async';

                img.onerror = () => {
                    Logger.error(`❌ Failed to load fullscreen image: ${imageData.src}`);
                    slide.classList.add(CN.slideLoadError);
                    picture.classList.remove(CN.slideLoadingPlaceholder);
                    slide.replaceChildren(Utils.createErrorNode(imgAltText, true)); // Add error content
                    slide.setAttribute('aria-label', `Error loading slide ${index + 1}: ${imgAltText}`); // Update ARIA label for error
                };
                img.onload = () => {
                    slide.classList.add(CN.slideLoaded);
                    picture.classList.remove(CN.slideLoadingPlaceholder);
                    // ARIA label will be updated by _updateAccessibilityState once the slide is active
                };
                img.src = imageData.src; // Fallback src

                picture.appendChild(sourceWebp);
                picture.appendChild(img);
                slide.appendChild(picture);
                fragment.appendChild(slide);
            });
        }
        wrapper.appendChild(fragment);
        this._updateAccessibilityState(); // Initial accessibility update
    }
    handleResize() { if (!this.isInitialized || !this.state.isSliderOpen || !this.dom) return; if (this.state.isAnimatingZoom) { Logger.warn("⚠️ Resize detected during zoom animation. Force closing fullscreen gallery."); this._closeInstantly(); return; } const wrapper = this.dom.sliderWrapper; const currentIndex = this.state.currentIndex; if (wrapper && currentIndex >= 0 && currentIndex < wrapper.children.length) { const currentSlide = wrapper.children[currentIndex]; if (currentSlide instanceof HTMLElement) { try { const scrollLeftTarget = currentSlide.offsetLeft - (wrapper.offsetWidth - currentSlide.offsetWidth) / 2; wrapper.scrollTo({ left: scrollLeftTarget, behavior: 'instant' }); this._updateAccessibilityState(); this._cacheFocusableElements(); } catch (error) { Logger.error("❌ Error recentering slider on resize:", error); this._closeInstantly(); } } else { Logger.warn("⚠️ Could not find current slide element during resize recentering."); } } else { Logger.warn("⚠️ Could not recenter slider on resize: Invalid state or elements."); } }
    destroy() { if (!this.isInitialized || !this.dom) { return; } if (this.state.isSliderOpen || this.state.isAnimatingZoom) { this._closeInstantly(); } try { this.dom.closeButton?.removeEventListener('click', this.state.boundHandlers.closeClick); this.dom.container?.removeEventListener('keydown', this.state.boundHandlers.keydown); if (this.state.boundHandlers.scroll) { this.dom.sliderWrapper?.removeEventListener('scroll', this.state.boundHandlers.scroll); } if (this.state.boundHandlers.slideClick) { this.dom.sliderWrapper?.removeEventListener('click', this.state.boundHandlers.slideClick); } } catch (e) { Logger.error("Error removing gallery event listeners during destroy:", e); } this.state.boundHandlers.scroll?.cancel?.(); clearTimeout(this.state.scrollTimeoutId);  this.visibleImageData = []; this.state.focusableElementsCache = []; Object.assign(this.state, { currentIndex: 0, totalVisibleImages: 0, isAnimatingZoom: false, isSliderOpen: false, lastFocusedElement: null, clickedImageElement: null, scrollTimeoutId: null }); this.dom = null; this.isInitialized = false; }
}

// ==========================================================================
// ScrollModeGallery Class
// ==========================================================================
class ScrollModeGallery {
    dom = null; galleryInstance = null; projectsData = []; config; animationConfig; prefersReducedMotion = false; desktopMediaQuery = null; isDesktop = false;
    state = {
        y: { curr: 0, targ: 0, start: 0, lastTouchY: 0 },
        activeIndex: 0, items: [], filteredItems: [],
        fullscreenImageDataCache: [],
        maxScroll: 0, parallaxRatio: 0,
        containerHeight: 0, thumbContainerHeight: 0,
        isDragging: false, snapTimeout: null, rafId: null, activeFilter: CONFIG.DEFAULTS.FILTER,
        isInteracting: false, interactionTimeout: null, isTouchActive: false,
        metricsReady: false,
    };
    boundHandlers = {}; isInitialized = false;
    constructor(galleryInstance, initialProjectsData) {
        this.isInitialized = false;
        const requiredKeys = ['scrollModeGallery', 'thumbnailColumn', 'mainImageColumn', 'thumbnailScroller', 'mainImageScroller', 'activeCursor', 'scrollGalleryStatus'];
        const allEssentialFound = requiredKeys.every(key => domElements?.[key]);
        if (!allEssentialFound || !domElements) {
            Logger.error(`‼️ ScrollModeGallery init failed: Missing essential DOM element(s). Scroll gallery disabled.`); return;
        }
        try {
            this.dom = {
                container: domElements.scrollModeGallery,
                thumbCol: domElements.thumbnailColumn,
                mainCol: domElements.mainImageColumn,
                thumbScroller: domElements.thumbnailScroller,
                mainScroller: domElements.mainImageScroller,
                cursor: domElements.activeCursor,
                status: domElements.scrollGalleryStatus,
            };
            this.galleryInstance = (galleryInstance instanceof Gallery && galleryInstance.isInitialized) ? galleryInstance : null;
            if (!this.galleryInstance) {
                Logger.warn("⚠️ ScrollModeGallery initialized without valid fullscreen Gallery instance. Opening images will be disabled.");
            }
            this.projectsData = initialProjectsData;
            this.config = CONFIG.SCROLL_MODE;
            this.animationConfig = CONFIG.ANIMATION;
            this.prefersReducedMotion = Utils.prefersReducedMotion();
            this.state.activeFilter = CONFIG.DEFAULTS.FILTER;
            this.desktopMediaQuery = window.matchMedia(this.config.DESKTOP_MEDIA_QUERY);
            this.isDesktop = this.desktopMediaQuery.matches;
            this.boundHandlers = {
                update: this._update.bind(this),
                onWheel: this._onWheel.bind(this),
                onTouchStart: this._onTouchStart.bind(this),
                onTouchMove: this._onTouchMove.bind(this),
                onTouchEnd: this._onTouchEnd.bind(this),
                onKeyDown: this._onKeyDown.bind(this),
                debouncedOnResize: Utils.debounce(this._onResizeInternal.bind(this), CONFIG.ANIMATION.RESIZE_DEBOUNCE_MS),
                onThumbnailClick: this._onThumbnailClick.bind(this),
                onMainImageClick: this._onMainImageClick.bind(this),
                onMediaQueryChange: this._onMediaQueryChange.bind(this),
            };
            this.isInitialized = true;
        } catch (error) {
            Logger.error("❌ Critical error during ScrollModeGallery construction:", error);
            this.isInitialized = false; this.dom = null;
        }
    }
    init() {
        if (!this.isInitialized || !this.dom) {
            Logger.warn("⚠️ ScrollModeGallery init skipped: Not initialized."); return;
        }
        if (this.projectsData.length === 0) {
            Logger.warn("⚠️ ScrollModeGallery initializing with empty projectsData. Gallery may not function as expected until data is repopulated.");
        }
        try {
            this.dom.container.tabIndex = 0;
            this.desktopMediaQuery?.addEventListener('change', this.boundHandlers.onMediaQueryChange);
            this.applyFilter(this.state.activeFilter, true);
            this._bindContainerEvents();
        } catch (e) {
            Logger.error("❌ Error during ScrollModeGallery initialization:", e);
            this.isInitialized = false;
            this._unbindAllEvents();
            if (this.dom?.container) this.dom.container.tabIndex = -1;
        }
    }

    applyFilter(filterCategory, isInitialLoad = false) {
        if (!this.isInitialized || (!isInitialLoad && filterCategory === this.state.activeFilter)) return;
        try {
            this._stopAnimationLoop();
            this._clearSnapTimeout();
            Object.assign(this.state, { isDragging: false, isInteracting: false, isTouchActive: false, activeFilter: filterCategory, y: { ...this.state.y, curr: 0, targ: 0 }, activeIndex: 0, metricsReady: false });
            clearTimeout(this.state.interactionTimeout);
            this.state.interactionTimeout = null;
            this.dom?.container?.classList.remove(CONFIG.SELECTORS.CLASS_NAMES.isDragging);
            this._removeWindowTouchListeners();
            
            this._applyTransformsDOM(0); 
            
            if (this.dom?.cursor) this.dom.cursor.style.opacity = '0';
            this.state.filteredItems = this.projectsData.filter(p => filterCategory === CONFIG.DEFAULTS.FILTER || p.category === filterCategory );
            this._renderItems(); 
            if (!isInitialLoad && this.dom?.container) {
                requestAnimationFrame(() => {
                    if (this.isInitialized && this.dom?.container) {
                        this.dom.container.focus({ preventScroll: true });
                    }
                });
            }
        } catch (e) {
            Logger.error(`❌ Error applying filter '${filterCategory}':`, e);
            this.state.filteredItems = [];
            this._renderItems(); 
        }
    }

    _buildGalleryDOMFragments() {
        const thumbFragment = document.createDocumentFragment();
        const mainFragment = document.createDocumentFragment();
        this.state.items = [];
        this.state.fullscreenImageDataCache = [];

        this.state.filteredItems.forEach((project, index) => {
            try {
                const thumbDiv = this._createItemElement('thumb', project, index);
                thumbFragment.appendChild(thumbDiv);
                const mainDiv = this._createItemElement('main', project, index);
                mainFragment.appendChild(mainDiv);
                this.state.items.push({ 
                    thumb: thumbDiv, main: mainDiv, data: project, index: index, 
                    mainY: 0, thumbY: 0, thumbBorderY: 0, // Add thumbBorderY
                    mainActualHeight: 0, mainFullHeight: 0, mainMarginTop: 0, mainMarginBottom: 0,
                    thumbActualHeight: 0, thumbFullHeight: 0, thumbMarginTop: 0, thumbMarginBottom: 0,
                });
                this.state.fullscreenImageDataCache.push({
                    src: project.src,
                    title: project.title || '',
                    originalIndex: project.originalIndex,
                    computedSrcset: project.computedSrcset
                });
            } catch (e) {
                Logger.error(`❌ Error creating item elements for index ${index}:`, project, e);
            }
        });
        return { thumbFragment, mainFragment };
    }

    async _renderItems() {
        if (!this.dom) return;
        this._unbindItemListeners();

        this.dom.thumbScroller?.replaceChildren();
        this.dom.mainScroller?.replaceChildren();
        this.state.metricsReady = false; 

        if (this.state.filteredItems.length === 0) {
            if (this.dom.mainScroller) {
                const emptyMsgPara = document.createElement('p');
                emptyMsgPara.className = CONFIG.SELECTORS.CLASS_NAMES.galleryEmptyMessage;
                emptyMsgPara.setAttribute('role', 'status');
                emptyMsgPara.textContent = `No projects found for '${this.state.activeFilter}'.`;
                this.dom.mainScroller.appendChild(emptyMsgPara);
            }
            this.state.items = [];
            this.state.fullscreenImageDataCache = [];
            await this._refreshAndUpdateLayout(0, true);
            return;
        }

        const { thumbFragment, mainFragment } = this._buildGalleryDOMFragments();

        if (this.dom.thumbScroller) this.dom.thumbScroller.appendChild(thumbFragment);
        if (this.dom.mainScroller) this.dom.mainScroller.appendChild(mainFragment);

        this._bindItemListeners();
        await this._refreshAndUpdateLayout(this.state.activeIndex, true);
    }

    _createItemElement(type, project, index) { if (!project || typeof project.src !== 'string') { throw new Error(`Invalid project data for ${type} at index ${index}`); } const div = document.createElement('div'); const isThumb = type === 'thumb'; const CN = CONFIG.SELECTORS.CLASS_NAMES; div.className = isThumb ? CN.scrollGalleryThumbItem : CN.scrollGalleryMainItem; div.dataset.index = String(index); if (typeof project.originalIndex === 'number') { div.dataset.originalIndex = String(project.originalIndex); } const altText = Utils.getSafeAltText(project.title, index); div.setAttribute('aria-label', isThumb ? `Thumbnail: ${altText}` : `View ${altText}`); div.tabIndex = -1; const picture = document.createElement('picture'); const sourceWebp = document.createElement('source'); sourceWebp.type = 'image/webp';
        sourceWebp.srcset = project.computedSrcset || Utils.generateSrcset(project.src, CONFIG.GALLERY.IMAGE_WIDTHS_FOR_SRCSET);
        if (isThumb) {
            sourceWebp.sizes = "(max-width: 61.9375rem) 90px, 130px";
        } else {
            sourceWebp.sizes = `(max-width: 61.9375rem) calc(100vw - 3.125rem), (min-width: 62rem) and (max-width: 75rem) calc(100vw - 25.9375rem), (min-width: 75.0625rem) calc(100vw - 30.9375rem)`;
        }
        const img = document.createElement('img'); img.alt = altText; img.loading = 'lazy'; img.decoding = 'async'; img.src = project.src; 
        img.onerror = () => { Logger.error(`❌ Failed to load ${type} image: ${project.src}`); div.classList.add(isThumb ? CN.scrollGalleryThumbItemError : CN.scrollGalleryMainItemError); div.replaceChildren(Utils.createErrorNode(altText)); div.setAttribute('aria-label', `Error loading ${type}: ${altText}`); }; picture.appendChild(sourceWebp); picture.appendChild(img); div.appendChild(picture); return div;
    }

    async _fetchDimensionWithRetry(getElementFn, dimensionProp, elementName = 'element') {
        const MAX_RETRIES = this.config.MAX_METRIC_RETRIES;
        const RETRY_DELAY_MS = this.config.METRIC_RETRY_DELAY_MS;
        let dimension = 0;

        for (let i = 0; i <= MAX_RETRIES; i++) {
            await new Promise(resolve => requestAnimationFrame(resolve));
            const element = getElementFn();
            if (!element) {
                if (i === MAX_RETRIES) {
                    Logger.warn(`_fetchDimensionWithRetry: ${elementName} not found after ${MAX_RETRIES} retries.`);
                    return { value: 0, success: false, error: `${elementName} not found` };
                }
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
                continue;
            }
            try {
                dimension = element[dimensionProp];
                if (dimension > 0) return { value: dimension, success: true };
                const img = element.querySelector('img');
                Logger.warn(`⚠️ ${elementName}'s ${dimensionProp} is ${dimension} on attempt ${i + 1}. Image complete: ${img?.complete}. Retrying... Element:`, element);
            } catch (e) {
                Logger.error(`❌ Error accessing ${dimensionProp} for ${elementName}:`, element, e);
                if (i === MAX_RETRIES) return { value: 0, success: false, error: e.message };
            }
            if (i < MAX_RETRIES) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
            }
        }
        Logger.error(`❌ ${elementName}'s ${dimensionProp} still ${dimension} after ${MAX_RETRIES + 1} attempts.`);
        return { value: dimension, success: false, error: `${elementName}'s ${dimensionProp} resolved to ${dimension} or invalid.` };
    }

    async _fetchValidatedItemDimensions(itemElementFn, elementName) {
        const element = itemElementFn();
        if (!element) {
            Logger.warn(`⚠️ ${elementName} element not found for dimension calculation.`);
            return { offsetHeight: 0, fullHeight: 0, marginTop: 0, marginBottom: 0, success: false, error: `${elementName} not found` };
        }
        
        const img = element.querySelector('img');
        if (img && !img.complete) { 
            Logger.debug(`Image for ${elementName} not complete when _fetchValidatedItemDimensions called. Relying on image load promises or retries.`);
        }

        let heightResult = await this._fetchDimensionWithRetry(itemElementFn, 'offsetHeight', elementName);
        
        if ((!heightResult.success || heightResult.value <= this.config.SUSPICIOUSLY_SMALL_OFFSET_HEIGHT_THRESHOLD) &&
            img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0 && element.clientWidth > 0) {
            
            const aspectRatioHeight = (img.naturalHeight / img.naturalWidth) * element.clientWidth;
            if (aspectRatioHeight > this.config.SUSPICIOUSLY_SMALL_OFFSET_HEIGHT_THRESHOLD) {
                Logger.debug(`${elementName}: Using aspect ratio height (${aspectRatioHeight.toFixed(2)}px) as offsetHeight was ${heightResult.value}px (Success: ${heightResult.success}).`);
                heightResult = { value: aspectRatioHeight, success: true };
            } else {
                 Logger.warn(`${elementName}: Aspect ratio height (${aspectRatioHeight.toFixed(2)}px) also suspicious or clientWidth is 0. Sticking with offsetHeight ${heightResult.value}px.`);
            }
        }
        
        if (!heightResult.success ) { 
            Logger.warn(`⚠️ ${elementName} offsetHeight is problematic after retries and aspect ratio check. Success: ${heightResult.success}, Value: ${heightResult.value}, Error: ${heightResult.error}`);
            if (img && img.complete && img.naturalHeight > 0 && heightResult.value === 0) {
                Logger.error(`Layout issue: ${elementName} offsetHeight is 0, but its image ${img.src} is loaded with naturalHeight ${img.naturalHeight}. ComputedStyle:`, getComputedStyle(element));
            }
            return { offsetHeight: heightResult.value, fullHeight: heightResult.value, marginTop: 0, marginBottom: 0, success: false, error: heightResult.error || "offsetHeight is 0 or invalid after all checks" };
        }
        
        const style = getComputedStyle(element);
        const marginTop = parseFloat(style.marginTop || '0');
        const marginBottom = parseFloat(style.marginBottom || '0');
        
        return {
            offsetHeight: heightResult.value,
            fullHeight: heightResult.value + marginTop + marginBottom,
            marginTop: marginTop,
            marginBottom: marginBottom,
            success: true 
        };
    }

    _fetchContainerDimensions() {
        this.state.containerHeight = this.dom.mainCol?.offsetHeight || 0;
        this.state.thumbContainerHeight = this.isDesktop ? (this.dom.thumbCol?.offsetHeight || 0) : 0;
        if (this.state.containerHeight <= 0) {
            Logger.error("❌ Main column container height is zero or invalid. Gallery functionality will be impaired.");
            return false;
        }
        if (this.isDesktop && this.state.thumbContainerHeight <= 0) {
            Logger.warn("⚠️ Thumbnail column container height is zero or invalid for desktop. Parallax might not work.");
        }
        return true;
    }

    _updateItemPositionsAndCalculateScrollParameters() {
        let currentMainY = 0;
        // For revised thumb position calculation considering margin collapse
        let currentThumbBorderY = 0; // Y of the border-top of the current thumb item

        if (AppConfig.LOG_LEVEL === 'debug') {
            console.groupCollapsed("ScrollModeGallery: _updateItemPositionsAndCalculateScrollParameters (Revised for Margin Collapse)");
        }

        this.state.items.forEach((item, index) => {
            item.mainY = currentMainY;
            currentMainY += item.mainFullHeight;

            if (this.isDesktop && item.thumbActualHeight > 0) { // Use thumbActualHeight as thumbFullHeight might be 0 if margins are 0
                if (index === 0) {
                    // Item 0's border is its margin top from scroller origin (0)
                    item.thumbBorderY = item.thumbMarginTop;
                } else {
                    const prevItem = this.state.items[index - 1];
                    // Margin between border of prevItem and border of current item
                    const marginBetween = Math.max(prevItem.thumbMarginBottom, item.thumbMarginTop);
                    item.thumbBorderY = prevItem.thumbBorderY + prevItem.thumbActualHeight + marginBetween;
                }
                // For logging or if needed elsewhere, true thumbY (margin box start)
                item.thumbY = item.thumbBorderY - item.thumbMarginTop;

                if (AppConfig.LOG_LEVEL === 'debug') {
                    Logger.debug(`Item ${index}: Set item.thumbBorderY = ${item.thumbBorderY.toFixed(2)}. item.thumbY (margin-box top) = ${item.thumbY.toFixed(2)}`);
                    Logger.debug(`  AH:${item.thumbActualHeight.toFixed(2)}, MT:${item.thumbMarginTop.toFixed(2)}, MB:${item.thumbMarginBottom.toFixed(2)}`);
                }

            } else { // Mobile or no thumb / zero height thumb
                item.thumbBorderY = 0;
                item.thumbY = 0;
            }
            if (AppConfig.LOG_LEVEL === 'debug') {
                 Logger.debug(`  Item ${index}: mainY = ${item.mainY.toFixed(2)}, mainFullHeight = ${item.mainFullHeight.toFixed(2)}`);
            }
        });

        // Calculate total thumb content height for parallax based on border positions
        let thumbContentHeight = 0;
        if (this.isDesktop && this.state.items.length > 0) {
            const lastThumbItem = this.state.items[this.state.items.length - 1];
            if (lastThumbItem.thumbActualHeight > 0) { // Ensure last item has height
                 // Height from scroller top to bottom of last item's border box + its margin bottom
                thumbContentHeight = lastThumbItem.thumbBorderY + lastThumbItem.thumbActualHeight + lastThumbItem.thumbMarginBottom;
            }
        }
        
        const mainContentHeight = currentMainY;
        this.state.maxScroll = Math.max(0, mainContentHeight - this.state.containerHeight);
        if (AppConfig.LOG_LEVEL === 'debug') {
            Logger.debug(`Calculated: mainContentHeight = ${mainContentHeight.toFixed(2)}, containerHeight = ${this.state.containerHeight.toFixed(2)}, maxScroll = ${this.state.maxScroll.toFixed(2)}`);
        }


        this.state.parallaxRatio = 0;
        if (this.isDesktop && this.state.thumbContainerHeight > 0 && thumbContentHeight > 0) {
            const totalThumbScrollableHeight = Math.max(0, thumbContentHeight - this.state.thumbContainerHeight);
            if (totalThumbScrollableHeight > 0 && this.state.maxScroll > 0) {
                this.state.parallaxRatio = totalThumbScrollableHeight / this.state.maxScroll;
            }
            if (AppConfig.LOG_LEVEL === 'debug') {
                Logger.debug(`(Revised) thumbContentHeight = ${thumbContentHeight.toFixed(2)}, thumbContainerHeight = ${this.state.thumbContainerHeight.toFixed(2)}, totalThumbScrollableHeight = ${totalThumbScrollableHeight.toFixed(2)}, parallaxRatio = ${this.state.parallaxRatio.toFixed(4)}`);
            }
        }

        if (isNaN(this.state.parallaxRatio) || !isFinite(this.state.parallaxRatio)) {
            Logger.warn(`⚠️ Invalid parallax ratio calculated (${this.state.parallaxRatio}), defaulting to 0.`);
            this.state.parallaxRatio = 0;
        }
        if (AppConfig.LOG_LEVEL === 'debug') {
            console.groupEnd();
        }
    }


    async _calculateMetrics() {
        this.state.metricsReady = false;
        if (!this.dom) { this._resetMetrics(); return false; }
    
        if (AppConfig.LOG_LEVEL === 'debug') {
             console.groupCollapsed(`GALLERY METRICS CALCULATION (Filter: ${this.state.activeFilter})`);
        }

        if (!this._fetchContainerDimensions()) {
            this._resetMetrics(); 
            if (AppConfig.LOG_LEVEL === 'debug') console.groupEnd();
            return false;
        }
    
        if (this.state.items.length === 0) {
            this._resetMetrics(); 
            this.state.metricsReady = true;
            if (AppConfig.LOG_LEVEL === 'debug') {
                 Logger.debug("No items to calculate metrics for.");
                 console.groupEnd();
            }
            return true;
        }
    
        const imageLoadPromises = [];
        this.state.items.forEach(item => {
            const mainImg = item.main?.querySelector('img');
            if (mainImg && !mainImg.complete) {
                imageLoadPromises.push(new Promise(resolve => {
                    mainImg.onload = () => { resolve({ itemIndex: item.index, type: 'main', success: true, src: mainImg.src }); };
                    mainImg.onerror = () => { Logger.warn(`Main image failed to load for metrics: ${mainImg.src} in item ${item.index}`); resolve({ itemIndex: item.index, type: 'main', success: false, src: mainImg.src }); };
                }));
            }
    
            if (this.isDesktop && item.thumb) {
                const thumbImg = item.thumb.querySelector('img');
                if (thumbImg && !thumbImg.complete) {
                    imageLoadPromises.push(new Promise(resolve => {
                        thumbImg.onload = () => { resolve({ itemIndex: item.index, type: 'thumb', success: true, src: thumbImg.src }); };
                        thumbImg.onerror = () => { Logger.warn(`Thumb image failed to load for metrics: ${thumbImg.src} in item ${item.index}`); resolve({ itemIndex: item.index, type: 'thumb', success: false, src: thumbImg.src }); };
                    }));
                }
            }
        });
    
        if (imageLoadPromises.length > 0) {
            Logger.debug(`_calculateMetrics: Waiting for ${imageLoadPromises.length} images to load...`);
            const loadResults = await Promise.all(imageLoadPromises);
            loadResults.forEach(result => {
                if(!result.success) Logger.warn(`Image loading failed for metrics: type ${result.type}, item ${result.itemIndex}, src ${result.src}`);
            });
            Logger.debug("_calculateMetrics: All pending images processed (loaded or errored).");
        }
    
        try {
            for (const item of this.state.items) {
                const mainItemElementFn = () => item.main;
                const mainDims = await this._fetchValidatedItemDimensions(mainItemElementFn, `Main item ${item.index}`);

                item.mainActualHeight = Math.max(0, mainDims.offsetHeight);
                if (isNaN(item.mainActualHeight)) { Logger.error(`Main item ${item.index} mainActualHeight became NaN. Defaulting to 0.`); item.mainActualHeight = 0; }
                item.mainMarginTop = mainDims.marginTop;
                item.mainMarginBottom = mainDims.marginBottom;
                item.mainFullHeight = item.mainActualHeight + item.mainMarginTop + item.mainMarginBottom;

                if (this.isDesktop && item.thumb) {
                    const thumbItemElementFn = () => item.thumb;
                    const thumbDims = await this._fetchValidatedItemDimensions(thumbItemElementFn, `Thumb item ${item.index}`);
                    
                    item.thumbActualHeight = Math.max(0, thumbDims.offsetHeight);
                    if (isNaN(item.thumbActualHeight)) { Logger.error(`Thumb item ${item.index} thumbActualHeight became NaN. Defaulting to 0.`); item.thumbActualHeight = 0; }
                    item.thumbMarginTop = thumbDims.marginTop;
                    item.thumbMarginBottom = thumbDims.marginBottom;
                    item.thumbFullHeight = item.thumbActualHeight + item.thumbMarginTop + item.thumbMarginBottom; // This is used for initial sum, but not directly for positioning in new logic
                } else {
                    item.thumbActualHeight = 0; item.thumbFullHeight = 0; item.thumbMarginTop = 0; item.thumbMarginBottom = 0;
                }
                if (AppConfig.LOG_LEVEL === 'debug') {
                    Logger.debug(`Item ${item.index} Metrics:
  Main -> ActualH: ${item.mainActualHeight.toFixed(2)}, MarginT: ${item.mainMarginTop.toFixed(2)}, MarginB: ${item.mainMarginBottom.toFixed(2)}, FullH: ${item.mainFullHeight.toFixed(2)}
  Thumb -> ActualH: ${item.thumbActualHeight.toFixed(2)}, MarginT: ${item.thumbMarginTop.toFixed(2)}, MarginB: ${item.thumbMarginBottom.toFixed(2)}, FullH: ${item.thumbFullHeight.toFixed(2)} (Note: FullH includes non-collapsed margins)`);
                }
            }
            
            this._updateItemPositionsAndCalculateScrollParameters();
            this.state.metricsReady = true;
            if (AppConfig.LOG_LEVEL === 'debug') console.groupEnd();
            return true;
        } catch (error) {
            Logger.error("❌ Error during metric assignment in _calculateMetrics:", error);
            this._resetMetrics();
            if (AppConfig.LOG_LEVEL === 'debug') console.groupEnd();
            return false;
        }
    }


    _resetMetrics() {
        Object.assign(this.state, {
            maxScroll: 0,
            parallaxRatio: 0,
            containerHeight: this.dom?.mainCol?.offsetHeight || 0,
            thumbContainerHeight: this.isDesktop ? (this.dom?.thumbCol?.offsetHeight || 0) : 0,
            metricsReady: false, 
        });
        this.state.items.forEach(item => { 
            item.mainY = 0; item.thumbY = 0; item.thumbBorderY = 0;
            item.mainActualHeight = 0; item.mainFullHeight = 0; item.mainMarginTop = 0; item.mainMarginBottom = 0;
            item.thumbActualHeight = 0; item.thumbFullHeight = 0; item.thumbMarginTop = 0; item.thumbMarginBottom = 0;
        });
        if (this.dom?.cursor) { Object.assign(this.dom.cursor.style, { height: '0px', opacity: '0', transform: 'translateY(0px)' }); }
    }
    _bindContainerEvents() { this._unbindContainerEvents(); if (!this.dom) return; this.dom.container.addEventListener('wheel', this.boundHandlers.onWheel, { passive: false }); this.dom.container.addEventListener('touchstart', this.boundHandlers.onTouchStart, { passive: false }); this.dom.container.addEventListener('keydown', this.boundHandlers.onKeyDown); }
    _unbindContainerEvents() { if (!this.dom) return; this.dom.container.removeEventListener('wheel', this.boundHandlers.onWheel); this.dom.container.removeEventListener('touchstart', this.boundHandlers.onTouchStart); this.dom.container.removeEventListener('keydown', this.boundHandlers.onKeyDown); this._removeWindowTouchListeners(); }
    _addWindowTouchListeners() { window.addEventListener('touchmove', this.boundHandlers.onTouchMove, { passive: false }); window.addEventListener('touchend', this.boundHandlers.onTouchEnd, { passive: true }); window.addEventListener('touchcancel', this.boundHandlers.onTouchEnd, { passive: true }); }
    _removeWindowTouchListeners() { window.removeEventListener('touchmove', this.boundHandlers.onTouchMove); window.removeEventListener('touchend', this.boundHandlers.onTouchEnd); window.removeEventListener('touchcancel', this.boundHandlers.onTouchEnd); }
    _bindItemListeners() { this.state.items.forEach(item => { item.thumb?.addEventListener('click', this.boundHandlers.onThumbnailClick); item.main?.addEventListener('click', this.boundHandlers.onMainImageClick); }); }
    _unbindItemListeners() { this.state.items.forEach(item => { item.thumb?.removeEventListener('click', this.boundHandlers.onThumbnailClick); item.main?.removeEventListener('click', this.boundHandlers.onMainImageClick); }); }
    _unbindAllEvents() { this._unbindContainerEvents(); this._unbindItemListeners(); this.desktopMediaQuery?.removeEventListener('change', this.boundHandlers.onMediaQueryChange); }

    _update() {
        if (!this.isInitialized || !this.dom || !this.state.metricsReady) {
            this._stopAnimationLoop();
            return;
        }

        Utils.addWillChange(this.dom.mainScroller, CONFIG.SELECTORS.CLASS_NAMES.willChangeTransform);
        if (this.isDesktop && this.dom.thumbScroller) Utils.addWillChange(this.dom.thumbScroller, CONFIG.SELECTORS.CLASS_NAMES.willChangeTransform);
        if (this.isDesktop && this.dom.cursor) Utils.addWillChange(this.dom.cursor, CONFIG.SELECTORS.CLASS_NAMES.willChangeTransformOpacity);

        try {
            const delta = this.state.y.targ - this.state.y.curr;
            const needsUpdate = Math.abs(delta) > this.animationConfig.UPDATE_EPSILON || this.state.isInteracting;

            if (needsUpdate) {
                if (this.isDesktop && !this.prefersReducedMotion) {
                    this.state.y.curr += delta * this.animationConfig.LERP_FACTOR;
                } else {
                    this.state.y.curr = this.state.y.targ;
                }
                this.state.y.curr = Math.max(0, Math.min(this.state.y.curr, this.state.maxScroll));
                this._updateActiveIndexBasedOnScroll(this.state.y.curr);
                this._applyTransformsDOM(this.state.y.curr);
                this._updateCursorPositionDOM();
            }

            const stillNeedsUpdate = Math.abs(this.state.y.targ - this.state.y.curr) > this.animationConfig.UPDATE_EPSILON || this.state.isInteracting;
            if (stillNeedsUpdate) {
                this.state.rafId = requestAnimationFrame(this.boundHandlers.update);
            } else {
                if (this.state.y.curr !== this.state.y.targ) {
                    this.state.y.curr = this.state.y.targ;
                    this._applyTransformsDOM(this.state.y.curr);
                    this._updateCursorPositionDOM();
                }
                this._stopAnimationLoop();
            }
        } catch (e) {
            Logger.error("❌ Error in scroll gallery update loop:", e);
            this._stopAnimationLoop();
        }
    }

    _startAnimationLoop() {
        if (this.isInitialized && !this.state.rafId && this.state.metricsReady) {
            if ((this.isDesktop && !this.prefersReducedMotion && this.state.maxScroll > 0) || this.state.isInteracting) {
                this.state.rafId = requestAnimationFrame(this.boundHandlers.update);
            }
        }
    }
    _stopAnimationLoop() {
        if (this.state.rafId) { cancelAnimationFrame(this.state.rafId); this.state.rafId = null; }
        if (this.dom) {
            Utils.removeWillChange(this.dom.mainScroller, CONFIG.SELECTORS.CLASS_NAMES.willChangeTransform);
            if (this.isDesktop && this.dom.thumbScroller) Utils.removeWillChange(this.dom.thumbScroller, CONFIG.SELECTORS.CLASS_NAMES.willChangeTransform);
            if (this.isDesktop && this.dom.cursor) Utils.removeWillChange(this.dom.cursor, CONFIG.SELECTORS.CLASS_NAMES.willChangeTransformOpacity);
        }
    }
    _applyTransformsDOM(currentY) {
        if (!this.dom || !this.isInitialized) return;
    
        if (this.dom.mainScroller) {
            this.dom.mainScroller.style.transform = `translateY(-${currentY.toFixed(2)}px)`;
        }
    
        if (this.isDesktop && this.dom.thumbScroller) {
            const thumbY = (this.state.parallaxRatio > 0) ? currentY * this.state.parallaxRatio : 0;
            this.dom.thumbScroller.style.transform = `translateY(-${thumbY.toFixed(2)}px)`;
        }
    }

    _updateActiveIndexBasedOnScroll(currentY) {
        if (!this.isInitialized || !this.state.metricsReady) return;
        const numItems = this.state.items.length;

        if (numItems === 0 || this.state.containerHeight <= 0) {
            if (this.state.activeIndex !== 0) this._setActiveItem(0);
            return;
        }

        let newActiveIndex = this.state.activeIndex;
        const viewportCenterScroll = currentY + this.state.containerHeight / 2;
        let closestIndex = 0;

        const firstItem = this.state.items[0];
        const lastItem = this.state.items[numItems - 1];
        
        if (firstItem && firstItem.mainActualHeight > 0 && currentY <= firstItem.mainActualHeight / 2) {
            closestIndex = 0;
        } else if (lastItem && lastItem.mainActualHeight > 0 && currentY >= this.state.maxScroll - lastItem.mainActualHeight / 2) {
            closestIndex = numItems - 1;
        } else {
            let minDiff = Infinity;
            for (let i = 0; i < numItems; i++) {
                const item = this.state.items[i];
                if (item && typeof item.mainY === 'number' && item.mainActualHeight > 0) {
                    const itemCenter = item.mainY + item.mainActualHeight / 2;
                    const diff = Math.abs(itemCenter - viewportCenterScroll);
                    if (diff < minDiff) {
                        minDiff = diff;
                        closestIndex = i;
                    } else if (diff > minDiff && i > closestIndex) {
                         break;
                    }
                }
            }
        }
        newActiveIndex = Math.max(0, Math.min(closestIndex, numItems - 1));
        if (newActiveIndex !== this.state.activeIndex) {
            this._setActiveItem(newActiveIndex);
        }
    }


    _updateThumbItemVisualState(itemElement, isActive) {
        if (!this.isInitialized || !this.isDesktop || !itemElement) return;
        const { active } = CONFIG.SELECTORS.CLASS_NAMES;
        itemElement.classList.toggle(active, isActive);
        itemElement.setAttribute('aria-current', isActive ? 'true' : 'false');
    }

    _updateGalleryStatusText(itemData, index) {
        if (!this.isInitialized || !this.dom?.status) return;
        if (!itemData) {
            this.dom.status.textContent = (this.state.items.length === 0) ? "No items to display." : "Error selecting item.";
            return;
        }
        const title = itemData.title || `Item ${index + 1}`;
        this.dom.status.textContent = `${title}, item ${index + 1} of ${this.state.items.length}`;
    }

    _setActiveItem(index, immediate = false) {
        if (!this.isInitialized) return;

        if (this.state.items.length === 0) {
            if (this.state.activeIndex !== 0) {
                const oldActiveThumb = this.isDesktop && this.dom?.thumbScroller?.querySelector(`.${CONFIG.SELECTORS.CLASS_NAMES.active}`);
                if (oldActiveThumb) this._updateThumbItemVisualState(oldActiveThumb, false);

                this.state.activeIndex = 0;
                this._updateGalleryStatusText(null, 0);
            }
            if (this.isDesktop && this.dom?.cursor) this.dom.cursor.style.opacity = '0';
            return;
        }

        index = Math.max(0, Math.min(index, this.state.items.length - 1));
        if (index === this.state.activeIndex && !immediate) return;

        const oldIndex = this.state.activeIndex;
        const newItemData = this.state.items[index];
        const oldItemData = this.state.items[oldIndex];

        if (this.isDesktop) { 
            if (oldItemData?.thumb) this._updateThumbItemVisualState(oldItemData.thumb, false);
            if (newItemData?.thumb) this._updateThumbItemVisualState(newItemData.thumb, true);
        }

        this.state.activeIndex = index;
        if (newItemData?.data) {
            this._updateGalleryStatusText(newItemData.data, index);
        } else {
            Logger.warn(`⚠️ _setActiveItem: Could not find item data at index ${index}.`);
            if (oldItemData?.thumb && this.isDesktop) this._updateThumbItemVisualState(oldItemData.thumb, true); 
            this.state.activeIndex = oldIndex; 
            this._updateGalleryStatusText(oldItemData?.data, oldIndex); 
        }

        if (immediate && this.state.metricsReady) { 
            this._updateCursorPositionDOM(); 
        }
    }

    _updateCursorPositionDOM() {
        if (!this.dom?.cursor || !this.isInitialized || !this.isDesktop || !this.state.metricsReady) {
            if (this.dom?.cursor && this.dom.cursor.style.opacity !== '0') {
                Object.assign(this.dom.cursor.style, { opacity: '0', transform: 'translateY(0px)', height: '0px' });
            }
            return;
        }
        if (this.state.items.length === 0 || this.state.activeIndex < 0 || this.state.activeIndex >= this.state.items.length) {
            if (this.dom.cursor.style.opacity !== '0') {
                Object.assign(this.dom.cursor.style, { opacity: '0', transform: 'translateY(0px)', height: '0px' });
            }
            return;
        }
        
        const activeItem = this.state.items[this.state.activeIndex];
        // Check for thumbBorderY instead of thumbY for the new logic
        if (!activeItem || typeof activeItem.thumbBorderY !== 'number' || !activeItem.thumb || typeof activeItem.thumbMarginTop !== 'number') {
            if (this.dom.cursor.style.opacity !== '0') { this.dom.cursor.style.opacity = '0'; this.dom.cursor.style.height = '0px'; }
            Logger.warn(`Cursor update: Active item ${this.state.activeIndex} missing thumb, thumbBorderY, or thumbMarginTop.`, activeItem);
            return;
        }
    
        if (AppConfig.LOG_LEVEL === 'debug') {
            console.groupCollapsed(`CURSOR UPDATE: Active Index ${this.state.activeIndex}, MainScrollY: ${this.state.y.curr.toFixed(2)}`);
    
            Logger.debug('Active Item Data (activeItem):', activeItem);
            Logger.debug(`  Thumb Div Element:`, activeItem.thumb);
            Logger.debug(`  item.thumbBorderY (abs top of border box in scroller): ${activeItem.thumbBorderY.toFixed(2)}`); // Using thumbBorderY
            Logger.debug(`  item.thumbY (abs top of margin box in scroller): ${activeItem.thumbY.toFixed(2)}`);
            Logger.debug(`  item.thumbMarginTop: ${activeItem.thumbMarginTop.toFixed(2)}`);
            Logger.debug(`  item.thumbMarginBottom: ${activeItem.thumbMarginBottom.toFixed(2)}`);
            Logger.debug(`  item.thumbActualHeight (offsetHeight): ${activeItem.thumbActualHeight.toFixed(2)}`);
    
            const imgElementForLog = activeItem.thumb.querySelector('img');
            let imageRenderedHeightForLog = 'N/A';
            let verticalCenteringOffsetForLog = 0;
    
            if (imgElementForLog && activeItem.thumbActualHeight > 0 && imgElementForLog.complete && imgElementForLog.naturalHeight > 0) {
                const thumbItemContentWidth = activeItem.thumb.clientWidth;
                if (thumbItemContentWidth > 0 && imgElementForLog.naturalWidth > 0) {
                    const calculatedImgRenderedHeight = (imgElementForLog.naturalHeight / imgElementForLog.naturalWidth) * thumbItemContentWidth;
                    imageRenderedHeightForLog = calculatedImgRenderedHeight.toFixed(2);
                    if (calculatedImgRenderedHeight > 0 && calculatedImgRenderedHeight < activeItem.thumbActualHeight) {
                        verticalCenteringOffsetForLog = ((activeItem.thumbActualHeight - calculatedImgRenderedHeight) / 2);
                    }
                }
            }
            Logger.debug(`  Calculated Image Rendered Height (for log): ${imageRenderedHeightForLog}px`);
            Logger.debug(`  Calculated Vertical Centering Offset (for log): ${verticalCenteringOffsetForLog.toFixed(2)}px`);
        }
    
        let finalCursorHeight = activeItem.thumbActualHeight;
        let verticalCenteringOffset = 0;
        const imgElement = activeItem.thumb.querySelector('img');
    
        if (imgElement && activeItem.thumbActualHeight > 0 && imgElement.complete && imgElement.naturalHeight > 0) {
            const thumbItemContentWidth = activeItem.thumb.clientWidth;
            if (thumbItemContentWidth > 0 && imgElement.naturalWidth > 0) {
                const imageRenderedHeight = (imgElement.naturalHeight / imgElement.naturalWidth) * thumbItemContentWidth;
                if (imageRenderedHeight > 0 && imageRenderedHeight < activeItem.thumbActualHeight) {
                    verticalCenteringOffset = (activeItem.thumbActualHeight - imageRenderedHeight) / 2;
                    finalCursorHeight = imageRenderedHeight;
                }
            }
        }
        finalCursorHeight = Math.max(0, finalCursorHeight);
    
        const effectiveParallaxRatio = this.state.parallaxRatio > 0 ? this.state.parallaxRatio : 0;
        const mainScroll_Y_Curr = this.state.y.curr;
        const parallaxScrollEffect = mainScroll_Y_Curr * effectiveParallaxRatio;
    
        // Use activeItem.thumbBorderY for cursor positioning
        const cursorTargetY = activeItem.thumbBorderY + verticalCenteringOffset - parallaxScrollEffect;
    
        if (AppConfig.LOG_LEVEL === 'debug') {
            console.log(`--- Values for cursorTargetY = A_new + C - D ---`);
            console.log(`  A_new (activeItem.thumbBorderY): ${activeItem.thumbBorderY.toFixed(2)}`);
            console.log(`  C (verticalCenteringOffset): ${verticalCenteringOffset.toFixed(2)}`);
            console.log(`  D (parallaxScrollEffect = mainScroll_Y_Curr * effectiveParallaxRatio): ${parallaxScrollEffect.toFixed(2)}`);
            console.log(`    (mainScroll_Y_Curr: ${mainScroll_Y_Curr.toFixed(2)}, effectiveParallaxRatio: ${effectiveParallaxRatio.toFixed(4)})`);
            console.log(`  RESULT cursorTargetY: ${cursorTargetY.toFixed(2)}`);
            console.log(`  RESULT finalCursorHeight: ${finalCursorHeight.toFixed(2)}`);
    
            console.log(`About to apply: cursor.style.height = ${finalCursorHeight.toFixed(2)}px`);
            console.log(`About to apply: cursor.style.transform = translateY(${cursorTargetY.toFixed(2)}px)`);
    
            const thumbnailScrollerTransform = this.dom.thumbScroller ? getComputedStyle(this.dom.thumbScroller).transform : 'N/A';
            console.log(`Thumbnail Scroller Computed Transform: ${thumbnailScrollerTransform} (should be approx -${parallaxScrollEffect.toFixed(2)}px in Y)`);
            
            const cursorRect = this.dom.cursor.getBoundingClientRect();
            const thumbColRect = this.dom.thumbCol.getBoundingClientRect();
            const activeThumbDivRect = activeItem.thumb.getBoundingClientRect();
            console.log(`  Cursor BRect Top (rel to viewport): ${cursorRect.top.toFixed(2)}, Left: ${cursorRect.left.toFixed(2)}, Height: ${cursorRect.height.toFixed(2)}`);
            console.log(`  ThumbCol BRect Top (rel to viewport): ${thumbColRect.top.toFixed(2)}`);
            console.log(`  ActiveThumbDiv BRect Top (rel to viewport): ${activeThumbDivRect.top.toFixed(2)}, Height: ${activeThumbDivRect.height.toFixed(2)}`);
            // Desired position of cursor's top relative to ThumbCol's PADDING edge (where cursor's transform starts)
            console.log(`  Desired cursor top rel to ThumbCol PADDING edge: ${(cursorTargetY).toFixed(2)} (from calculation)`);
            // Actual position of cursor's top relative to ThumbCol's PADDING edge
            const P_col_top = parseFloat(getComputedStyle(this.dom.thumbCol).paddingTop) || 0;
            console.log(`  Actual cursor top rel to ThumbCol PADDING edge: ${(cursorRect.top - (thumbColRect.top + P_col_top)).toFixed(2)} (from BRects)`);
    
            console.groupEnd();
        }
    
        this.dom.cursor.style.height = `${finalCursorHeight.toFixed(2)}px`;
        this.dom.cursor.style.transform = `translateY(${cursorTargetY.toFixed(2)}px)`;
        
        if (finalCursorHeight > 0 && this.dom.cursor.style.opacity !== '1') {
            this.dom.cursor.style.opacity = '1';
        } else if (finalCursorHeight === 0 && this.dom.cursor.style.opacity !== '0') {
            this.dom.cursor.style.opacity = '0';
        }
    }

    _onWheel(event) {
        if (!this.isInitialized || !this.state.metricsReady || this.state.maxScroll <= 0) return;
        event.preventDefault();
        this._clearSnapTimeout();
        this.state.isInteracting = true;
        clearTimeout(this.state.interactionTimeout);
        
        this.state.interactionTimeout = setTimeout(() => {
            this.state.isInteracting = false;
            if (!this.state.isDragging && this.isInitialized && this.state.metricsReady) {
                if (this.state.activeIndex >= 0 && this.state.activeIndex < this.state.items.length) {
                    this._snapToIndex(this.state.activeIndex);
                } else {
                    Logger.warn(`⚠️ Snap aborted after wheel: Invalid activeIndex (${this.state.activeIndex})`);
                }
            }
        }, 150);

        this._updateTargetScroll(event.deltaY * this.config.WHEEL_MULTIPLIER);
        this._startAnimationLoop();
    }
    _onTouchStart(event) { if (!this.isInitialized || !this.dom || !this.state.metricsReady || this.state.maxScroll <= 0 || !(event.target instanceof Node) || !this.dom.container?.contains(event.target)) return; if (event.touches.length !== 1) { if (this.state.isTouchActive) this._onTouchEnd(event); return; } event.preventDefault(); this._clearSnapTimeout(); Object.assign(this.state, { isDragging: true, isInteracting: true, isTouchActive: true, y: { ...this.state.y, start: event.touches[0].clientY, lastTouchY: event.touches[0].clientY } }); this.dom.container.classList.add(CONFIG.SELECTORS.CLASS_NAMES.isDragging); this._addWindowTouchListeners(); this._startAnimationLoop(); }
    _onTouchMove(event) { if (!this.state.isTouchActive || event.touches.length !== 1) return; event.preventDefault(); const currentY = event.touches[0].clientY; const delta = (this.state.y.lastTouchY - currentY) * this.config.DRAG_MULTIPLIER; this._updateTargetScroll(delta); this.state.y.lastTouchY = currentY; }
    _onTouchEnd(event) { if (!this.state.isTouchActive) return; if (event.touches.length === 0) { Object.assign(this.state, { isDragging: false, isInteracting: false, isTouchActive: false }); clearTimeout(this.state.interactionTimeout); this.dom?.container?.classList.remove(CONFIG.SELECTORS.CLASS_NAMES.isDragging); this._removeWindowTouchListeners(); this._triggerSnap(); } }
    
    _getIndexForYPosition(targetYViewCenter) {
        if (this.state.items.length === 0 || this.state.containerHeight <= 0) return 0;

        let closestIndex = 0;
        let minDiff = Infinity;

        for (let i = 0; i < this.state.items.length; i++) {
            const item = this.state.items[i];
            if (item && typeof item.mainY === 'number' && item.mainActualHeight > 0) {
                const itemCenterInScroller = item.mainY + item.mainActualHeight / 2;
                const diff = Math.abs(itemCenterInScroller - targetYViewCenter);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestIndex = i;
                } else if (diff > minDiff && i > closestIndex) {
                    break; 
                }
            }
        }
        return Math.max(0, Math.min(closestIndex, this.state.items.length - 1));
    }

    _onKeyDown(event) {
        if (!this.isInitialized || !this.dom || !this.state.metricsReady || this.state.items.length === 0) return;
        
        let handled = false;
        let targetScrollY = this.state.y.targ;
        let newActiveIndex = this.state.activeIndex;
        const epsilon = 1;

        switch (event.key) {
            case 'ArrowDown': case 'Down':
                newActiveIndex = Math.min(this.state.activeIndex + 1, this.state.items.length - 1);
                if (newActiveIndex !== this.state.activeIndex) {
                    this._clearSnapTimeout();
                    this._setActiveItem(newActiveIndex);
                    this._snapToIndex(newActiveIndex); 
                    this._startAnimationLoop();
                }
                handled = true;
                break;
            case 'ArrowUp': case 'Up':
                newActiveIndex = Math.max(this.state.activeIndex - 1, 0);
                if (newActiveIndex !== this.state.activeIndex) {
                    this._clearSnapTimeout();
                    this._setActiveItem(newActiveIndex);
                    this._snapToIndex(newActiveIndex); 
                    this._startAnimationLoop();
                }
                handled = true;
                break;
            
            case 'PageDown':
                targetScrollY = Math.min(this.state.y.curr + this.state.containerHeight, this.state.maxScroll);
                newActiveIndex = this._getIndexForYPosition(targetScrollY + this.state.containerHeight / 2);
                
                if (Math.abs(this.state.y.targ - targetScrollY) > epsilon || newActiveIndex !== this.state.activeIndex) {
                    this._clearSnapTimeout();
                    this._setActiveItem(newActiveIndex);
                    this.state.y.targ = targetScrollY;
                    this._snapToIndex(newActiveIndex);
                    this._startAnimationLoop();
                }
                handled = true;
                break;

            case 'PageUp':
                targetScrollY = Math.max(this.state.y.curr - this.state.containerHeight, 0);
                newActiveIndex = this._getIndexForYPosition(targetScrollY + this.state.containerHeight / 2);

                if (Math.abs(this.state.y.targ - targetScrollY) > epsilon || newActiveIndex !== this.state.activeIndex) {
                    this._clearSnapTimeout();
                    this._setActiveItem(newActiveIndex);
                    this.state.y.targ = targetScrollY;
                    this._snapToIndex(newActiveIndex);
                    this._startAnimationLoop();
                }
                handled = true;
                break;

            case 'Home':
                this._clearSnapTimeout();
                this._setActiveItem(0);
                this.state.y.targ = 0; // Snap will refine this
                this._snapToIndex(0);
                this._startAnimationLoop();
                handled = true;
                break;
            case 'End':
                this._clearSnapTimeout();
                newActiveIndex = this.state.items.length - 1;
                this._setActiveItem(newActiveIndex);
                this.state.y.targ = this.state.maxScroll; // Snap will refine this
                this._snapToIndex(newActiveIndex);
                this._startAnimationLoop();
                handled = true;
                break;
            case 'Enter': case ' ': 
                const activeItemMain = this.state.items[this.state.activeIndex]?.main; 
                if (activeItemMain) { this._onMainImageClick({ currentTarget: activeItemMain }); handled = true; } 
                break;
            default: return;
        }
        
        if (handled) {
            event.preventDefault();
        }
    }
    async _refreshAndUpdateLayout(activeIndexHint = -1, forceSnapAndAnimate = false) {
        if (!this.isInitialized) return;
        this._stopAnimationLoop();
        this.state.metricsReady = false;

        const oldActiveIndex = (activeIndexHint !== -1) ? activeIndexHint : this.state.activeIndex;

        await new Promise(resolve => requestAnimationFrame(resolve));

        try {
            const metricsSuccess = await this._calculateMetrics(); 
            if (!this.isInitialized) return;

            if (!metricsSuccess) {
                Logger.error("❌ Layout refresh failed: Metrics calculation unsuccessful. Gallery may be in an unstable state.");
                this._resetMetrics();
                this._setActiveItem(0, true);
                this._applyTransformsDOM(0);
                this._updateCursorPositionDOM();
                return;
            }

            if (this.state.items.length === 0) {
                Object.assign(this.state.y, { curr: 0, targ: 0 });
                this.state.activeIndex = 0;
                this._setActiveItem(0, true);
                this._applyTransformsDOM(0);
                this._updateCursorPositionDOM();
                return;
            }

            const newActiveIndex = Math.max(0, Math.min(oldActiveIndex, this.state.items.length - 1));
            this._setActiveItem(newActiveIndex, true); 
            this._snapToIndex(this.state.activeIndex); 

            this.state.y.curr = this.state.y.targ; 

            requestAnimationFrame(() => {
                if (!this.isInitialized) return;
                this._applyTransformsDOM(this.state.y.curr);
                this._updateCursorPositionDOM();
                if (forceSnapAndAnimate || (this.isDesktop && !this.prefersReducedMotion && this.state.items.length > 0 && this.state.maxScroll > 0)) {
                    this._startAnimationLoop();
                }
            });
        } catch (e) {
            Logger.error("❌ Error during layout refresh:", e);
            this._resetMetrics();
        }
    }
    async _onMediaQueryChange(event) { if (!this.isInitialized) return; const oldIsDesktop = this.isDesktop; this.isDesktop = event.matches; if (oldIsDesktop === this.isDesktop) return; Logger.debug(`%cScrollModeGallery: MediaQuery changed. Is Desktop: ${this.isDesktop}`, "color: blue; font-weight: bold;"); await this._refreshAndUpdateLayout(this.state.activeIndex, true); }
    handleResize() { if (this.isInitialized) { this.boundHandlers.debouncedOnResize(); } }
    async _onResizeInternal() { if (!this.isInitialized) return; Logger.debug("%cScrollModeGallery: Resize detected.", "color: blue;"); await this._refreshAndUpdateLayout(this.state.activeIndex, false); }
    _updateTargetScroll(delta) { this.state.y.targ += delta; this.state.y.targ = Math.max(0, Math.min(this.state.y.targ, this.state.maxScroll)); }
    _onThumbnailClick(event) {
        if (!this.isInitialized || !(event.currentTarget instanceof HTMLElement) || !this.isDesktop || !this.state.metricsReady) return;
        try {
            const index = parseInt(event.currentTarget.dataset.index ?? '-1', 10);
            if (isNaN(index) || index < 0 || index >= this.state.items.length) { Logger.warn(`⚠️ Invalid index on thumbnail click: ${event.currentTarget.dataset.index}`); return; }
            if (index !== this.state.activeIndex) {
                this._clearSnapTimeout();
                this._setActiveItem(index);
                this._snapToIndex(index);
                this._startAnimationLoop();
            }
        } catch (e) { Logger.error("❌ Error handling thumbnail click:", e); }
    }
    _onMainImageClick(event) {
        if (!this.isInitialized || !(event.currentTarget instanceof HTMLElement) || !this.state.metricsReady) return;
        const clickedElement = event.currentTarget;
        try {
            const index = parseInt(clickedElement.dataset.index ?? '-1', 10);
            if (isNaN(index) || index < 0 || index >= this.state.items.length) {
                Logger.warn(`⚠️ Invalid index on main image click: ${clickedElement.dataset.index}`);
                return;
            }
            const item = this.state.items[index];
            if (!item || !item.data || !item.main) {
                Logger.error(`❌ Item data or main element for index ${index} not found.`);
                return;
            }
            const imageElement = item.main.querySelector('img');
            if (!imageElement) {
                Logger.error(`❌ Image element within main item ${index} not found.`);
                return;
            }
            if (index === this.state.activeIndex) {
                if (this.galleryInstance?.isInitialized) {
                    this.galleryInstance.open(this.state.fullscreenImageDataCache, index, imageElement, item.main);
                } else {
                    Logger.warn("⚠️ Fullscreen gallery instance not available or initialized. Cannot open image.");
                }
            } else {
                this._clearSnapTimeout();
                this._setActiveItem(index);
                this._snapToIndex(index);
                this._startAnimationLoop();
            }
        } catch (e) {
            Logger.error("❌ Error handling main image click:", e);
        }
    }
    _triggerSnap() { if (this.state.isDragging || this.state.items.length === 0 || !this.state.metricsReady || this.state.maxScroll <= 0 || !this.isInitialized) return; this._clearSnapTimeout(); this.state.snapTimeout = setTimeout(() => { if (this.state.isDragging || !this.isInitialized || !this.state.metricsReady) return; if (this.state.activeIndex >= 0 && this.state.activeIndex < this.state.items.length) { this._snapToIndex(this.state.activeIndex); this._startAnimationLoop(); } else { Logger.warn(`⚠️ Snap aborted: Invalid activeIndex (${this.state.activeIndex})`); } }, this.animationConfig.SNAP_TIMEOUT_MS); }

    _snapToIndex(index) {
        if (!this.isInitialized || !this.state.metricsReady) { 
            this.state.y.targ = Math.max(0, Math.min(this.state.y.targ ?? 0, this.state.maxScroll ?? 0));
            return;
        }

        if (index < 0 || index >= this.state.items.length) {
            Logger.warn(`⚠️ Snap failed: Invalid index ${index}. Clamping target Y.`);
            this.state.y.targ = Math.max(0, Math.min(this.state.y.targ ?? 0, this.state.maxScroll ?? 0));
            return;
        }

        const itemData = this.state.items[index];
        if (!itemData || typeof itemData.mainY !== 'number') {
            Logger.warn(`⚠️ Cannot snap: Item data or mainY position missing/invalid for index ${index}.`);
            this.state.y.targ = Math.max(0, Math.min(this.state.y.targ ?? 0, this.state.maxScroll ?? 0));
            return;
        }
        
        if (itemData.mainActualHeight <= 0 || this.state.containerHeight <= 0) {
            Logger.warn(`⚠️ Snap failed for index ${index}: mainActualHeight (${itemData.mainActualHeight}) or containerHeight (${this.state.containerHeight}) is invalid. Setting target Y to item's mainY or clamping.`);
            this.state.y.targ = (index === 0) ? 0 : Math.max(0, Math.min(itemData.mainY, this.state.maxScroll ?? 0));
            return;
        }

        const itemCenterY = itemData.mainY + itemData.mainActualHeight / 2;
        const targetY = itemCenterY - this.state.containerHeight / 2;
        this.state.y.targ = Math.max(0, Math.min(targetY, this.state.maxScroll ?? 0));
    }

    _clearSnapTimeout() { if (this.state.snapTimeout) { clearTimeout(this.state.snapTimeout); this.state.snapTimeout = null; } }
    destroy() {
        if (!this.isInitialized) return;
        this._stopAnimationLoop();
        this._clearSnapTimeout();
        clearTimeout(this.state.interactionTimeout);
        this._unbindAllEvents();
        this.boundHandlers.debouncedOnResize?.cancel?.();
        if (this.dom?.thumbScroller) this.dom.thumbScroller.replaceChildren();
        if (this.dom?.mainScroller) this.dom.mainScroller.replaceChildren();
        if (this.dom?.container) this.dom.container.tabIndex = -1;
        if (this.dom?.cursor) { Object.assign(this.dom.cursor.style, { opacity: '0', transform: 'translateY(0px)' }); }
        if (this.dom?.status) this.dom.status.textContent = '';
        Object.assign(this.state, {
            items: [], filteredItems: [], fullscreenImageDataCache: [],
            y: { curr: 0, targ: 0, start: 0, lastTouchY: 0 },
            activeIndex: 0, maxScroll: 0, parallaxRatio: 0,
            containerHeight: 0, thumbContainerHeight: 0,
            isDragging: false, snapTimeout: null, rafId: null,
            activeFilter: CONFIG.DEFAULTS.FILTER,
            isInteracting: false, interactionTimeout: null, isTouchActive: false,
            metricsReady: false
        });
        this.projectsData = [];
        this.desktopMediaQuery = null;
        this.dom = null;
        this.galleryInstance = null;
        this.isInitialized = false;
    }
}

// ==========================================================================
// UI Class
// ==========================================================================
class UI {
    dom = null; config; backgroundAnimation = null; scrollGallery = null; prefersReducedMotion = false;
    state = {
        theme: { hue: 0, isDark: false },
        roleTyping: {
            currentIndex: -1, charIndex: 0, animationFrameId: null,
            roles: [], lastTimestamp: 0, currentRoleText: '',
            isErasing: false, isPaused: false, pauseEndTime: 0,
        },
        activeFilter: CONFIG.DEFAULTS.FILTER,
        currentFocusedFilterButton: null,
    };
    boundHandlers = {}; isInitialized = false;
    constructor(bgAnimInstance, scrollGalleryInstance) { this.isInitialized = false; const essentialKeys = ['root', 'body', 'html']; const optionalKeys = ['darkModeButton', 'darkModeIcon', 'hueShiftButton', 'roleElement', 'filterList', 'navLinks']; const essentialFound = essentialKeys.every(key => domElements?.[key]); if (!essentialFound || !domElements) { Logger.error(`‼️ UI init failed: Missing essential DOM element(s). UI disabled.`); return; } try { this.dom = { root: domElements.root, html: domElements.html, body: domElements.body, darkModeButton: domElements.darkModeButton, darkModeIcon: domElements.darkModeIcon, hueShiftButton: domElements.hueShiftButton, roleElement: domElements.roleElement, filterList: domElements.filterList, navLinks: domElements.navLinks || [], filterButtons: [], }; optionalKeys.forEach(key => { if (!this.dom[key] && key !== 'navLinks') Logger.info(`ℹ️ UI Feature: Optional element "${key}" not found.`); }); if (!this.dom.filterList) Logger.info(`ℹ️ UI Feature: Filter list element not found. Filtering UI disabled.`); if (this.dom.navLinks.length === 0 && domElements?.navLinksQuery) Logger.info(`ℹ️ UI Feature: No navigation links found with selector "${domElements.navLinksQuery}".`); this.config = CONFIG; this.backgroundAnimation = (bgAnimInstance instanceof BackgroundAnimation && bgAnimInstance.isInitialized) ? bgAnimInstance : null; this.scrollGallery = (scrollGalleryInstance instanceof ScrollModeGallery && scrollGalleryInstance.isInitialized) ? scrollGalleryInstance : null; this.prefersReducedMotion = Utils.prefersReducedMotion(); this.state.theme.isDark = this._getInitialDarkModePreference(); this.state.roleTyping.roles = [...this.config.DEFAULTS.ROLES]; this.state.activeFilter = this.config.DEFAULTS.FILTER; this.boundHandlers = { navClick: this._handleNavClick.bind(this), filterClick: this._handleFilterClick.bind(this), filterKeydown: this._handleFilterKeydown.bind(this), toggleDark: this.toggleDarkMode.bind(this), shiftHue: this.shiftThemeHue.bind(this), roleTypeLoop: this._roleTypeLoop.bind(this) }; this.isInitialized = true; } catch(error) { Logger.error("❌ Critical error during UI construction:", error); this.isInitialized = false; this.dom = null; } }

    init() { if (!this.isInitialized || !this.dom) { Logger.warn("⚠️ UI init skipped: Not initialized."); return; } try { this.applyTheme(); if (this.dom.roleElement && !this.prefersReducedMotion) { this.startRoleTypingAnimation(); } else if (this.dom.roleElement && this.prefersReducedMotion) { this.dom.roleElement.textContent = this.state.roleTyping.roles[0] || ''; this.dom.roleElement.style.borderRightColor = 'transparent'; } else if (!this.dom.roleElement) { Logger.info("ℹ️ Role element (#role) not found, typing animation disabled."); } this._populateFilterButtonsCacheAndSetupRovingTabindex(); this._bindEvents(); this._updateFilterButtonsState(); } catch(e) { Logger.error("❌ Error during UI initialization:", e); this.isInitialized = false; this._unbindEvents(); } }

    _populateFilterButtonsCacheAndSetupRovingTabindex() {
        if (this.dom?.filterList) {
            this.dom.filterButtons = Array.from(
                this.dom.filterList.querySelectorAll(CONFIG.SELECTORS.DYNAMIC_SELECTORS.filterButton)
            );
            if (this.dom.filterButtons.length === 0) {
                Logger.warn("⚠️ No filter buttons found during initial cache population.");
                return;
            }

            let initialFocusSet = false;
            this.dom.filterButtons.forEach((button) => {
                if (button.classList.contains(CONFIG.SELECTORS.CLASS_NAMES.active)) {
                    button.setAttribute('tabindex', '0');
                    this.state.currentFocusedFilterButton = button;
                    initialFocusSet = true;
                } else {
                    button.setAttribute('tabindex', '-1');
                }
            });

            if (!initialFocusSet && this.dom.filterButtons.length > 0) {
                this.dom.filterButtons[0].setAttribute('tabindex', '0');
                this.state.currentFocusedFilterButton = this.dom.filterButtons[0];
            }
        }
    }

    _bindEvents() { if (!this.dom) return; this.dom.darkModeButton?.addEventListener('click', this.boundHandlers.toggleDark); this.dom.hueShiftButton?.addEventListener('click', this.boundHandlers.shiftHue); this.dom.navLinks.forEach(link => link.addEventListener('click', this.boundHandlers.navClick)); if (this.dom.filterList) { this.dom.filterList.addEventListener('click', this.boundHandlers.filterClick); this.dom.filterList.addEventListener('keydown', this.boundHandlers.filterKeydown); } }
     _unbindEvents() { if (!this.dom) return; this.dom.darkModeButton?.removeEventListener('click', this.boundHandlers.toggleDark); this.dom.hueShiftButton?.removeEventListener('click', this.boundHandlers.shiftHue); this.dom.navLinks.forEach(link => link.removeEventListener('click', this.boundHandlers.navClick)); this.dom.filterList?.removeEventListener('click', this.boundHandlers.filterClick); this.dom.filterList?.removeEventListener('keydown', this.boundHandlers.filterKeydown); }
    _getInitialDarkModePreference() { try { const storedValue = localStorage.getItem('darkMode'); if (storedValue !== null) { return storedValue === 'true'; } } catch (e) { Logger.warn("⚠️ Could not access localStorage to get dark mode preference:", e); } if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') { try { return window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) { Logger.warn("⚠️ Could not check prefers-color-scheme media query:", e); } } return false; }
    toggleDarkMode() { if (!this.isInitialized) return; this.state.theme.isDark = !this.state.theme.isDark; try { localStorage.setItem('darkMode', String(this.state.theme.isDark)); } catch (e) { Logger.error("❌ Error saving dark mode preference to localStorage:", e); } this.applyTheme(); }

    applyTheme() {
        if (!this.dom?.root || !this.dom.html) {
            Logger.error("❌ Cannot apply theme: Root/HTML element missing.");
            return;
        }
        const { darkMode } = CONFIG.SELECTORS.CLASS_NAMES;
        this.dom.html.classList.toggle(darkMode, this.state.theme.isDark);
        if (this.dom.darkModeIcon) {
            this.dom.darkModeIcon.textContent = this.state.theme.isDark ? 'dark_mode' : 'light_mode';
        }
        this.dom.darkModeButton?.setAttribute('aria-pressed', String(this.state.theme.isDark));
        this.dom.root.style.setProperty('--hue-shift', String(this.state.theme.hue));

        requestAnimationFrame(() => {
            try {
                if (this.backgroundAnimation?.isInitialized) {
                    this.backgroundAnimation.refreshVisualsWithNewColors();
                }
            } catch (error) {
                Logger.error("❌ Error refreshing background animation visuals after theme change:", error);
            }
        });
    }

    shiftThemeHue() { if (!this.isInitialized || !this.dom?.root) return; this.state.theme.hue = (this.state.theme.hue + this.config.ANIMATION.HUE_SHIFT_AMOUNT) % 360; this.applyTheme(); }

    _setRoleTypingPause(timestamp, duration) {
        const { roleTyping } = this.state;
        roleTyping.isPaused = true;
        roleTyping.pauseEndTime = timestamp + duration;
        roleTyping.lastTimestamp = timestamp; 
    }

    startRoleTypingAnimation() {
        const { roleTyping } = this.state;
        if (!this.dom?.roleElement || !this.isInitialized || this.prefersReducedMotion) {
            if (this.prefersReducedMotion && this.dom?.roleElement) {
                this.dom.roleElement.textContent = roleTyping.roles[0] || '';
                this.dom.roleElement.style.borderRightColor = 'transparent';
            }
            if (roleTyping.animationFrameId) {
                cancelAnimationFrame(roleTyping.animationFrameId);
                roleTyping.animationFrameId = null;
            }
            return;
        }

        if (!roleTyping.roles || roleTyping.roles.length === 0) {
            Logger.warn("⚠️ Role typing stopped: No roles defined.");
            if (roleTyping.animationFrameId) cancelAnimationFrame(roleTyping.animationFrameId);
            roleTyping.animationFrameId = null;
            return;
        }

        roleTyping.currentIndex = (roleTyping.currentIndex + 1) % roleTyping.roles.length;
        roleTyping.currentRoleText = roleTyping.roles[roleTyping.currentIndex];
        roleTyping.charIndex = 0;
        roleTyping.isErasing = false;
        this.dom.roleElement.textContent = '';
        this.dom.roleElement.style.opacity = '1';
        this.dom.roleElement.style.borderRightColor = '';

        this._setRoleTypingPause(performance.now(), this.config.ANIMATION.ROLE_PAUSE_MS);

        if (roleTyping.animationFrameId) cancelAnimationFrame(roleTyping.animationFrameId);
        roleTyping.animationFrameId = requestAnimationFrame(this.boundHandlers.roleTypeLoop);
    }

    _roleTypeLoop(timestamp) {
        const { roleTyping } = this.state;
        const { TYPING_SPEED_MS, ROLE_PAUSE_MS } = this.config.ANIMATION;

        if (!this.dom?.roleElement || !this.isInitialized) {
            if (roleTyping.animationFrameId) cancelAnimationFrame(roleTyping.animationFrameId);
            roleTyping.animationFrameId = null;
            return;
        }

        const elapsedSinceLastAction = timestamp - roleTyping.lastTimestamp;

        try {
            if (roleTyping.isPaused) {
                if (timestamp >= roleTyping.pauseEndTime) {
                    roleTyping.isPaused = false;
                    roleTyping.lastTimestamp = timestamp; 
                }
            } else if (roleTyping.isErasing) {
                if (elapsedSinceLastAction >= TYPING_SPEED_MS / 2) {
                    if (this.dom.roleElement.textContent.length > 0) {
                        this.dom.roleElement.textContent = this.dom.roleElement.textContent.slice(0, -1);
                        roleTyping.lastTimestamp = timestamp;
                    } else { 
                        roleTyping.isErasing = false;
                        roleTyping.currentIndex = (roleTyping.currentIndex + 1) % roleTyping.roles.length;
                        roleTyping.currentRoleText = roleTyping.roles[roleTyping.currentIndex];
                        roleTyping.charIndex = 0;
                        this._setRoleTypingPause(timestamp, ROLE_PAUSE_MS);
                    }
                }
            } else { 
                if (roleTyping.charIndex < roleTyping.currentRoleText.length) {
                    if (elapsedSinceLastAction >= TYPING_SPEED_MS) {
                        this.dom.roleElement.textContent += roleTyping.currentRoleText[roleTyping.charIndex];
                        roleTyping.charIndex++;
                        roleTyping.lastTimestamp = timestamp;
                    }
                } else { 
                    roleTyping.isErasing = true;
                    this._setRoleTypingPause(timestamp, ROLE_PAUSE_MS * 1.5);
                }
            }
        } catch (error) {
            Logger.error("❌ Error in role typing loop:", error);
            if (roleTyping.animationFrameId) cancelAnimationFrame(roleTyping.animationFrameId);
            roleTyping.animationFrameId = null;
            return;
        }
        roleTyping.animationFrameId = requestAnimationFrame(this.boundHandlers.roleTypeLoop);
    }

    _handleNavClick(event) { if (!this.isInitialized || !(event.currentTarget instanceof HTMLAnchorElement)) return; const link = event.currentTarget; const targetId = link.getAttribute('href'); if (!targetId || !targetId.startsWith('#') || targetId.length === 1) return; try { const targetElement = document.querySelector(targetId); if (targetElement) { event.preventDefault(); const scrollBehavior = this.prefersReducedMotion ? 'auto' : 'smooth'; targetElement.scrollIntoView({ behavior: scrollBehavior, block: 'start' }); const attemptFocus = () => { if (targetElement instanceof HTMLElement) { const isNativelyFocusable = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA', 'A'].includes(targetElement.tagName) && !targetElement.hasAttribute('disabled'); const hasTabindex = targetElement.hasAttribute('tabindex') && targetElement.getAttribute('tabindex') !== '-1'; if (isNativelyFocusable || hasTabindex) { targetElement.focus({ preventScroll: true }); } else { Logger.info(`Nav target ${targetId} is not inherently focusable. Focus not set.`); } } }; if (this.prefersReducedMotion || scrollBehavior === 'auto') { setTimeout(attemptFocus, 50); } else if ('onscrollend' in window) { let scrollEndTimeoutId; const scrollEndHandler = () => { clearTimeout(scrollEndTimeoutId); window.removeEventListener('scrollend', scrollEndHandler); attemptFocus(); }; window.addEventListener('scrollend', scrollEndHandler, { once: true }); scrollEndTimeoutId = setTimeout(() => { window.removeEventListener('scrollend', scrollEndHandler); attemptFocus(); Logger.warn("Scrollend timeout fallback for nav click focus."); }, 700); } else { setTimeout(attemptFocus, 350); } } else { Logger.warn(`⚠️ Navigation target element not found: ${targetId}`); } } catch (e) { Logger.error(`❌ Error handling navigation click for ${targetId}:`, e); } }
    _handleFilterClick(event) { if (!this.isInitialized || !this.dom?.filterList || !(event.target instanceof Node)) return; const button = event.target.closest(CONFIG.SELECTORS.DYNAMIC_SELECTORS.filterButton); if (!button || button.classList.contains(CONFIG.SELECTORS.CLASS_NAMES.active)) return; const newFilter = button.dataset.filter; if (typeof newFilter === 'string' && newFilter) { this.setActiveFilter(newFilter); this._focusFilterButton(this.dom.filterButtons.findIndex(b => b === button)); } else { Logger.warn("⚠️ Clicked filter button is missing 'data-filter' attribute."); } }

    _handleFilterKeydown(event) {
        if (!this.isInitialized || !this.dom?.filterList || !(event.target instanceof HTMLButtonElement)) return;
        const button = event.target;
        if (!button.matches(CONFIG.SELECTORS.DYNAMIC_SELECTORS.filterButton) || !this.dom.filterList.contains(button)) return;

        const buttons = this.dom.filterButtons;
        if (!buttons || buttons.length === 0) return;

        let currentIndex = buttons.findIndex(btn => btn === this.state.currentFocusedFilterButton);
        if (currentIndex === -1) currentIndex = buttons.findIndex(btn => btn === button);
        if (currentIndex === -1) currentIndex = 0;

        let nextIndex = currentIndex;

        switch (event.key) {
            case 'Enter':
            case ' ':
                event.preventDefault();
                const newFilter = button.dataset.filter;
                if (typeof newFilter === 'string' && newFilter) {
                    this.setActiveFilter(newFilter);
                } else {
                    Logger.warn("⚠️ Activated filter button missing 'data-filter'.");
                }
                break;
            case 'ArrowRight':
            case 'Right':
                event.preventDefault();
                nextIndex = (currentIndex + 1) % buttons.length;
                this._focusFilterButton(nextIndex);
                break;
            case 'ArrowLeft':
            case 'Left':
                event.preventDefault();
                nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
                this._focusFilterButton(nextIndex);
                break;
            case 'Home':
                event.preventDefault();
                this._focusFilterButton(0);
                break;
            case 'End':
                event.preventDefault();
                this._focusFilterButton(buttons.length - 1);
                break;
            default:
                return; 
        }
    }

    _focusFilterButton(index) {
        if (!this.dom?.filterButtons || index < 0 || index >= this.dom.filterButtons.length) {
            Logger.warn(`⚠️ Invalid filter button index provided for focus: ${index}`);
            return;
        }
        try {
            if (this.state.currentFocusedFilterButton) {
                this.state.currentFocusedFilterButton.setAttribute('tabindex', '-1');
            }
            const newFocusedButton = this.dom.filterButtons[index];
            newFocusedButton.setAttribute('tabindex', '0');
            newFocusedButton.focus({ preventScroll: true });
            this.state.currentFocusedFilterButton = newFocusedButton;
        } catch (e) {
            Logger.error(`❌ Error focusing filter button at index ${index}:`, e);
        }
    }

    setActiveFilter(filterCategory) { if (!this.isInitialized || filterCategory === this.state.activeFilter) return; this.state.activeFilter = filterCategory; this._updateFilterButtonsState(); if (this.scrollGallery?.isInitialized) { try { this.scrollGallery.applyFilter(filterCategory); } catch (error) { Logger.error(`❌ Error applying filter '${filterCategory}' in ScrollGallery module:`, error); } } else if (this.scrollGallery) { Logger.warn("⚠️ Scroll gallery instance exists but is not initialized. Cannot apply filter."); } }

    _updateFilterButtonsState() {
        if (!this.isInitialized || !this.dom?.filterList) return;
        if (this.dom.filterButtons.length === 0) {
            Logger.warn("⚠️ No filter buttons found to update state. Check DOM structure and selectors.");
            return;
        }
        const { active } = CONFIG.SELECTORS.CLASS_NAMES;
        const currentFilter = this.state.activeFilter;
        let newlyActiveButton = null;

        this.dom.filterButtons.forEach((button) => {
            if (button instanceof HTMLButtonElement) {
                const isActive = button.dataset.filter === currentFilter;
                button.classList.toggle(active, isActive);
                button.setAttribute('aria-current', isActive ? 'true' : 'false');
                if (isActive) {
                    newlyActiveButton = button;
                    button.setAttribute('tabindex', '0');
                } else {
                    button.setAttribute('tabindex', '-1');
                }
            }
        });

        if (newlyActiveButton && this.state.currentFocusedFilterButton !== newlyActiveButton) {
            // Only update currentFocusedFilterButton if focus isn't already within the filter list on a different button
            // This prevents stealing focus if user keyboard-navigated to a non-active button then clicked elsewhere to activate it
            if (!document.activeElement || !this.dom.filterList.contains(document.activeElement)) {
                 this.state.currentFocusedFilterButton = newlyActiveButton; // Focus might have been lost from list, set to new active
            } else if (document.activeElement !== newlyActiveButton && document.activeElement.dataset.filter !== currentFilter) {
                 // Focus is on a different, non-active button in the list; update logical focus to new active
                this.state.currentFocusedFilterButton = newlyActiveButton;
            }
            // If focus is already on the newlyActiveButton, currentFocusedFilterButton is already correct.
        } else if (!newlyActiveButton && this.dom.filterButtons.length > 0) {
            // No button is active (e.g. bad filter value), default focus to the first.
            this.dom.filterButtons[0].setAttribute('tabindex', '0');
            this.state.currentFocusedFilterButton = this.dom.filterButtons[0];
        }
    }

    destroy() { if (!this.isInitialized) return; this._unbindEvents();
        if (this.state.roleTyping.animationFrameId) {
            cancelAnimationFrame(this.state.roleTyping.animationFrameId);
            this.state.roleTyping.animationFrameId = null;
        }
        if (this.dom?.roleElement) { this.dom.roleElement.textContent = ''; this.dom.roleElement.style.opacity = '0'; } this.backgroundAnimation = null; this.scrollGallery = null; this.dom = null; this.isInitialized = false; }
}

// ==========================================================================
// Global Event Listeners & Initialization
// ==========================================================================
let backgroundAnimationInstance = null; let galleryInstance = null; let scrollGalleryInstance = null; let uiInstance = null; let throttledScrollHandler = null; let throttledMouseMoveHandler = null; let debouncedResizeHandler = null;

async function initializeApp() {
    Logger.info("🚀 Initializing Portfolio App...");
    try {
        domElements = cacheDomElements();
        if (!domElements) {
            Logger.error("❌ App Initialization Failed: DOM caching returned null."); return;
        }
        if (!domElements.body || !domElements.html) {
            Logger.error("❌ App Initialization Failed: Body or HTML element missing after caching."); return;
        }

        const fetchedProjects = await fetchProjectsData();

        isScrolledTop = window.scrollY < 5;
        domElements.body.classList.toggle(CONFIG.SELECTORS.CLASS_NAMES.scrolledToTop, isScrolledTop);
        const scrollbarWidth = Utils.getScrollbarWidth();
        domElements.html.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
        const motionPrefReduced = Utils.prefersReducedMotion();
        domElements.html.classList.toggle(CONFIG.SELECTORS.CLASS_NAMES.reducedMotion, motionPrefReduced);
        if (motionPrefReduced) Logger.info("♿ Reduced motion preference detected and applied.");

        try { backgroundAnimationInstance = new BackgroundAnimation(); } catch (e) { Logger.error("❌ Failed to instantiate BackgroundAnimation:", e); backgroundAnimationInstance = null; }
        try { galleryInstance = new Gallery(); } catch (e) { Logger.error("❌ Failed to instantiate Gallery:", e); galleryInstance = null; }
        try { scrollGalleryInstance = new ScrollModeGallery(galleryInstance, fetchedProjects); } catch (e) { Logger.error("❌ Failed to instantiate ScrollModeGallery:", e); scrollGalleryInstance = null; }
        try { uiInstance = new UI(backgroundAnimationInstance, scrollGalleryInstance); } catch (e) { Logger.error("❌ Failed to instantiate UI:", e); uiInstance = null; }

        if (uiInstance?.isInitialized) { uiInstance.init(); } else { Logger.warn("⚠️ UI module skipped initialization."); }
        if (scrollGalleryInstance?.isInitialized) { scrollGalleryInstance.init(); } else { Logger.warn("⚠️ ScrollGallery module skipped initialization."); }
        if (galleryInstance?.isInitialized) { galleryInstance.setupEventListeners(); } else { Logger.warn("⚠️ Gallery module skipped listener setup."); }
        if (backgroundAnimationInstance?.isInitialized) { backgroundAnimationInstance.start(); } else if (backgroundAnimationInstance) { Logger.warn("⚠️ BackgroundAnimation module instantiated but not initialized, attempting start..."); backgroundAnimationInstance.start(); } else { Logger.warn("⚠️ BackgroundAnimation module skipped start."); }

        throttledScrollHandler = Utils.throttle(handleGlobalScroll, CONFIG.ANIMATION.THROTTLE_MS);
        throttledMouseMoveHandler = Utils.throttle(handleGlobalMouseMove, CONFIG.ANIMATION.THROTTLE_MS); 
        debouncedResizeHandler = Utils.debounce(handleGlobalResize, CONFIG.ANIMATION.RESIZE_DEBOUNCE_MS);
        window.addEventListener('scroll', throttledScrollHandler, { passive: true });
        document.addEventListener('mousemove', throttledMouseMoveHandler, { passive: true });
        window.addEventListener('resize', debouncedResizeHandler);
        Logger.info("✅ Portfolio App Initialization Complete.");
    } catch (error) {
        Logger.error("❌❌❌ Unexpected critical error during app initialization sequence:", error);
        try {
            if (domElements?.body) {
                domElements.body.insertAdjacentHTML('afterbegin', '<p style="color: red; background: white; padding: 20px; font-size: 1.2em; text-align: center; border: 2px solid red; position: fixed; top: 10px; left: 10px; right: 10px; z-index: 9999;">Error loading portfolio content.<br>Please try refreshing the page.</p>');
            } else { Logger.error("Fallback error message could not be displayed: document.body not available."); }
        } catch (displayError) { Logger.error("Could not display fallback error message to user:", displayError); }
    }
}

function handleGlobalScroll() { if (!domElements?.body) return; try { const currentlyScrolledTop = window.scrollY < 5; if (currentlyScrolledTop !== isScrolledTop) { isScrolledTop = currentlyScrolledTop; domElements.body.classList.toggle(CONFIG.SELECTORS.CLASS_NAMES.scrolledToTop, isScrolledTop); } } catch (error) { Logger.error("❌ Error in handleGlobalScroll:", error); } }
function handleGlobalMouseMove(event) { /* Placeholder for any global mouse move effects if needed */ }
function handleGlobalResize() { if (!domElements?.html) { Logger.error("❌ Cannot handle resize: HTML element missing."); return; } try { const newScrollbarWidth = Utils.getScrollbarWidth(true); domElements.html.style.setProperty('--scrollbar-width', `${newScrollbarWidth}px`); backgroundAnimationInstance?.handleResize(); scrollGalleryInstance?.handleResize(); galleryInstance?.handleResize(); handleGlobalScroll(); } catch (error) { Logger.error("❌ Error during global resize handling:", error); } }

// ==========================================================================
// App Entry Point & Cleanup
// ==========================================================================
function cleanupApp() { Logger.info("🧹 Cleaning up Portfolio App resources..."); try { uiInstance?.destroy(); scrollGalleryInstance?.destroy(); galleryInstance?.destroy(); backgroundAnimationInstance?.destroy(); if (throttledScrollHandler) window.removeEventListener('scroll', throttledScrollHandler); if (throttledMouseMoveHandler) document.removeEventListener('mousemove', throttledMouseMoveHandler); if (debouncedResizeHandler) window.removeEventListener('resize', debouncedResizeHandler); throttledScrollHandler?.cancel?.(); throttledMouseMoveHandler?.cancel?.(); debouncedResizeHandler?.cancel?.(); domElements = null; backgroundAnimationInstance = null; galleryInstance = null; scrollGalleryInstance = null; uiInstance = null; throttledScrollHandler = null; throttledMouseMoveHandler = null; debouncedResizeHandler = null; Utils._cachedScrollbarWidth = undefined; Utils._prefersReducedMotion = undefined; PROJECTS_DATA = []; Logger.info("🧼 Portfolio App cleanup complete."); } catch (error) { Logger.error("❌ Error during application cleanup:", error); } }

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}