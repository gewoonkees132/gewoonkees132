/**
 * @file script.js
 * @description Main JavaScript file for Kees Leemeijer's portfolio website.
 * Handles theme switching, background animation, project filtering,
 * scroll-driven gallery interaction, and fullscreen image viewing.
 * @version 1.6.2 - Corrected async handling, rAF usage, and robustness.
 */

"use strict";

// ==========================================================================
// Configuration & Constants
// ==========================================================================
const CONFIG = Object.freeze({
    ANIMATION: Object.freeze({
        HUE_SHIFT_AMOUNT: 60, THROTTLE_MS: 50, RESIZE_DEBOUNCE_MS: 250, TYPING_SPEED_MS: 80, ROLE_PAUSE_MS: 1500, LERP_FACTOR: 0.1, SNAP_TIMEOUT_MS: 150, UPDATE_EPSILON: 0.05, ZOOM_TRANSITION_MS: 600, FADE_BG_TRANSITION_MS: 600, SLIDER_SCROLL_THROTTLE_MS: 10, SLIDE_UPDATE_DELAY_MS: 100,
    }),
    DEFAULTS: Object.freeze({
        FILTER: 'All', ROLES: ['parametric designer', 'researcher', 'photographer', 'robotic fabrication engineer']
    }),
    BACKGROUND: Object.freeze({
        MOBILE_BALLS: 2, DESKTOP_BALLS: 1, BASE_RADIUS: 850, RADIUS_VAR: 100, REPULSION: 700, DAMPING: 0.85, DRIFT_BASE: 0.00095, DRIFT_VAR: 0.0005, THRESHOLD_SQ: 10000, BOUNCE_DAMP: -0.8 // next iteration we should have radius based on screen width.
    }),
    SELECTORS: Object.freeze({
        CACHEABLE_ELEMENTS: Object.freeze({ // Selectors for caching DOM elements
            root: ':root', html: 'html', body: 'body', mainContainer: '.main-container', mainContent: '.content', scrollModeGallery: '#scroll-mode-gallery', thumbnailColumn: '#thumbnail-column', mainImageColumn: '#main-image-column', thumbnailScroller: '#thumbnail-scroller', mainImageScroller: '#main-image-scroller', activeCursor: '#active-thumbnail-cursor', scrollGalleryStatus: '#scroll-gallery-status', fullscreenContainer: '#fullscreen-container', fullscreenSliderWrapper: '#fullscreen-slider-wrapper', fullscreenCloseButton: '#close-fullscreen', fullscreenStatusLabel: '#fullscreen-status', filterList: '.project-filter-list', projectGallerySection: '#project-gallery', hueShiftButton: '#hue-shift-button', darkModeButton: '.dark-light-mode', darkModeIcon: '.dark-light-mode span', roleElement: '#role', backgroundCanvas: '#gradient-background', navLinksQuery: '.menu nav a[href^="#"]',
        }),
        CLASSES_AND_SELECTORS: Object.freeze({ // CSS Class names and generic selectors used dynamically
            // Core States & Modifiers
            active: 'active', // General active state (filter buttons, etc.)
            darkMode: 'dark-mode', // Applied to <html> for dark theme
            isZooming: 'is-zooming', // Applied to fullscreen container during zoom
            fullscreenActive: 'fullscreen-active', // Applied to <html> when fullscreen is open
            fullscreenEffectActive: 'fullscreen-effect-active', // Applied to main container for blur effect
            isDragging: 'is-dragging', // Applied to scroll gallery during touch drag
            scrolledToTop: 'scrolled-to-top', // Applied to body when scrolled to top
            reducedMotion: 'reduced-motion', // Applied to <html> if prefers-reduced-motion
            visuallyHidden: 'visually-hidden', // Standard accessibility class

            // Filter Component
            filterButton: '.filter-button', // Selector for filter buttons

            // Scroll Gallery Component (BEM-style names for clarity and maintainability)
            scrollGalleryThumbItem: 'scroll-gallery__thumb-item', // Class for individual thumbnail items
            scrollGalleryMainItem: 'scroll-gallery__main-item', // Class for individual main image items
            scrollGalleryThumbItemError: 'scroll-gallery__thumb-item--error', // Error state class for thumbnails
            scrollGalleryMainItemError: 'scroll-gallery__main-item--error', // Error state class for main images
            sourceElementZooming: 'source-element-zooming', // Applied to source item during zoom out animation
            galleryEmptyMessage: 'gallery-empty-message', // Class for empty gallery message
            activeCursor: 'active-cursor', // Class for the active thumbnail indicator in scroll gallery

            // Fullscreen Slider Component
            fullscreenSlide: 'fullscreen-slide', // Class for individual slides in fullscreen gallery
            fullscreenSlideImage: '.fullscreen-slide img', // Selector for image within a slide (now child of picture)
            isActiveSlide: 'is-active-slide', // Applied to the currently centered slide
            slideLoaded: 'slide-loaded', // Applied when slide image loads successfully
            slideLoadError: 'slide-load-error', // Applied to slide on image load error
            imageLoadError: 'image-load-error', // Applied to img element on load error OR picture element
            itemErrorContent: 'item-error-content', // Inner div for error message text/icon
            slideErrorTitle: 'slide-error-title', // Span for image title within error message
        })
    }),
    SCROLL_MODE: Object.freeze({
        WHEEL_MULTIPLIER: 0.8, DRAG_MULTIPLIER: 1.5, MAX_METRIC_RETRIES: 3, METRIC_RETRY_DELAY: 100,
        DESKTOP_MEDIA_QUERY: '(min-width: 62rem)', // CSS breakpoint: 992px
    }),
    GALLERY: Object.freeze({
        TOUCH_SWIPE_THRESHOLD: 50, // Min pixels for a swipe (Currently unused by Fullscreen Gallery as native scroll is used)
        IMAGE_WIDTHS_FOR_SRCSET: [240, 320, 480, 768, 1024, 1440, 1920], // Standard widths for generating srcset
    })
});


// ==========================================================================
// Project Data
// ==========================================================================
const PROJECTS_DATA = Object.freeze([
    { src: "./images/Urban/Kees-Leemeijer_New-York-Brooklyn-bridge.webp", category: "Urban", title: "New York Brooklyn bridge", originalIndex: 0 },
    { src: "./images/Urban/Kees-Leemeijer_New-York-sunset-skyline.webp", category: "Urban", title: "New York Sunset", originalIndex: 1 },
    { src: "./images/Urban/Kees-Leemeijer_New-York-skyline-by-night.webp", category: "Urban", title: "New York Skyline", originalIndex: 2 },
    { src: "./images/Urban/Kees-Leemeijer_New-York-cityscape.webp", category: "Urban", title: "New York Cityscape", originalIndex: 3 },
    { src: "./images/Urban/Kees-Leemeijer_Rotterdam-Erasmus-bridge-newyears.webp", category: "Urban", title: "Rotterdam Erasmus bridge", originalIndex: 4 },
    { src: "./images/Urban/Kees-Leemeijer_Rotterdam-skateboarding.webp", category: "Urban", title: "Rotterdam Skateboarding", originalIndex: 5 },
    { src: "./images/Urban/Kees-Leemeijer_Lisbon-lighttower.webp", category: "Urban", title: "Lisbon Light-tower", originalIndex: 6 },
    { src: "./images/Urban/Kees-Leemeijer_Netherlands-Tullipfields.webp", category: "Urban", title: "Netherlands Tullipfields", originalIndex: 7 },
    { src: "./images/Urban/Kees-Leemeijer_Luca-Guinigi-Tower.webp", category: "Urban", title: "Luca Guinigi Tower", originalIndex: 8 },
    { src: "./images/Urban/Kees-Leemeijer_Lisbon-Skateboarding.webp", category: "Urban", title: "Lisbon Skateboarding", originalIndex: 9 },
    { src: "./images/Urban/Kees-Leemeijer_Lisbon-Skateboarding-Nose-slide.webp", category: "Urban", title: "Lisbon Nose slide", originalIndex: 10 },
    { src: "./images/Urban/Kees-Leemeijer_Lisbon-Street-Artist.webp", category: "Urban", title: "Lisbon Street artist", originalIndex: 11 },
    { src: "./images/Plants/Kees-Leemeijer_Wild-Garlic.webp", category: "Plants", title: "Wild garlic", originalIndex: 12 },
    { src: "./images/Plants/Kees-Leemeijer_Vineyard-snail.webp", category: "Plants", title: "Vineyard snail", originalIndex: 13 },
    { src: "./images/Plants/Kees-Leemeijer_Common-daisy.webp", category: "Plants", title: "Common daisy", originalIndex: 14 },
    { src: "./images/Plants/Kees-Leemeijer_Fern-spores.webp", category: "Plants", title: "Fern spores", originalIndex: 15 },
    { src: "./images/Plants/Kees-leemeijer_Daffodil.webp", category: "Plants", title: "Daffodil", originalIndex: 16 },
    { src: "./images/Portraits/Kees-Leemeijer_Portrait1.webp", category: "Portraits", title: "Portrait 1", originalIndex: 17 },
    { src: "./images/Portraits/Kees-Leemeijer_Portrait-Laura-Sander.webp", category: "Portraits", title: "Portrait Laura Sander", originalIndex: 18 },
    { src: "./images/Portraits/Kees-Leemeijer_Portrait-Nayanthara-Herath.webp", category: "Portraits", title: "Portrait Nayanthara Herath", originalIndex: 19 },
    { src: "./images/Portraits/Kees-Leemeijer_Portrait-Jaap-Leemeijer.webp", category: "Portraits", title: "Portrait Jaap Leemeijer", originalIndex: 20 },
    { src: "./images/Portraits/Kees-Leemeijer_Portrait2.webp", category: "Portraits", title: "Portrait 2", originalIndex: 21 },
    { src: "./images/Portraits/Kees-Leemeijer_Portrait3.webp", category: "Portraits", title: "Portrait 3", originalIndex: 22 },
    { src: "./images/Portraits/Kees-Leemeijer_Portrait-Monique-van-Pinxten.webp", category: "Portraits", title: "Portrait Monique van Pinxten", originalIndex: 23 },
    { src: "./images/Animals/Kees-Leemeijer_Juvenile-Robin.webp", category: "Animals", title: "Juvenile Robin", originalIndex: 24 },
    { src: "./images/Animals/Kees-Leemeijer_Robin-and-Girl.webp", category: "Animals", title: "Robin and girl", originalIndex: 25 },
    { src: "./images/Animals/Kees-Leemeijer_Swan.webp", category: "Animals", title: "Swan", originalIndex: 26 },
    { src: "./images/Animals/Kees-Leemeijer_King-weaver.webp", category: "Animals", title: "King weaver", originalIndex: 27 },
    { src: "./images/Animals/Kees-Leemeijer_Squirrel.webp", category: "Animals", title: "Squirrel", originalIndex: 28 },
    { src: "./images/Animals/Kees-Leemeijer_Dalmatian-Pelican.webp", category: "Animals", title: "Dalmatian Pelican", originalIndex: 29 },
    { src: "./images/Animals/Kees-Leemeijer_Duck.webp", category: "Animals", title: "Duck", originalIndex: 30 },
    { src: "./images/Animals/Kees-Leemeijer_Ragdoll-cat.webp", category: "Animals", title: "Ragdoll Cat", originalIndex: 31 },
    { src: "./images/Animals/Kees-Leemeijer_Bonobo.webp", category: "Animals", title: "Bonobo", originalIndex: 32 },
    { src: "./images/Animals/Kees-Leemeijer_Secretary-bird.webp", category: "Animals", title: "Secretary bird", originalIndex: 33 },
    { src: "./images/Animals/Kees-Leemeijer_Hamadryas-baboon.webp", category: "Animals", title: "Hamadryas baboon", originalIndex: 34 },
    { src: "./images/Animals/Kees-Leemeijer_Territorial-coot.webp", category: "Animals", title: "Territorial coot", originalIndex: 35 },
    { src: "./images/Animals/Kees-Leemeijer_Peafowl.webp", category: "Animals", title: "Peafowl", originalIndex: 36 },
    { src: "./images/3DCP/Kees-Leemeijer-3D-concrete-printing-Artpiece.webp", category: "3DCP", title: "3DCP artpiece", originalIndex: 37 },
    { src: "./images/3DCP/Kees-Leemeijer_3D-concrete-printing-photoshoot.webp", category: "3DCP", title: "3DCP photoshoot", originalIndex: 38 },
    { src: "./images/3DCP/Kees-Leemeijer_Vertico-printhead.webp", category: "3DCP", title: "Vertico printhead", originalIndex: 39 },
    { src: "./images/3DCP/Kees-Leemeijer_3D-concrete-printing-behind-the-scenes.webp", category: "3DCP", title: "Vertico behind the scenes", originalIndex: 40 },
    { src: "./images/3DCP/Kees-Leemeijer_3D-concrete-printing-vase.webp", category: "3DCP", title: "3DCP vase", originalIndex: 41 },
    { src: "./images/3DCP/Kees-Leemeijer_3D-concrete-printing-lost-formwork.webp", category: "3DCP", title: "3DCP lost-formwork", originalIndex: 42 },
    { src: "./images/3DCP/Kees-Leemeijer_3D-concrete-printing-flowerpot.webp", category: "3DCP", title: "3DCP Flowerpot", originalIndex: 43 },
    { src: "./images/3DCP/Kees-Leemeijer_3D-concrete-printing-lounge-chair.webp", category: "3DCP", title: "3DCP Loungechair", originalIndex: 44 },
    { src: "./images/Products/Kees-Leemeijer_Croissant.webp", category: "Products", title: "Croissant", originalIndex: 45 },
    { src: "./images/Products/Kees-Leemeijer_flat-white.webp", category: "Products", title: "Flat White", originalIndex: 46 },
    { src: "./images/Products/Kees-Leemeijer_Bakery-breakfast.webp", category: "Products", title: "Bakery Breakfast", originalIndex: 47 },
    { src: "./images/Products/Kees-Leemeijer_Cupcakes.webp", category: "Products", title: "Cupcakes", originalIndex: 48 },
    { src: "./images/Products/Kees-Leemeijer_3D-printed-concrete-furniture.webp", category: "Products", title: "3D printed bench", originalIndex: 49 },
    { src: "./images/Industry/Kees-Leemeijer_Rotterdam-Harbor-Oil-Rig.webp", category: "Industry", title: "Oil rig", originalIndex: 50 },
    { src: "./images/Industry/Kees-Leemeijer_Rotterdam-Harbor-Feeder-crane-RWG-Terminal.webp", category: "Industry", title: "Feeder cranes RWG terminal", originalIndex: 51 },
    { src: "./images/Industry/Kees-Leemeijer_Rotterdam-Harbor-by-Night.webp", category: "Industry", title: "Rotterdam Harbor by night", originalIndex: 52 },
    { src: "./images/Industry/Kees-Leemeijer_Rotterdam-Harbor-Container-transhipment1.webp", category: "Industry", title: "Container transhipment 1", originalIndex: 53 },
    { src: "./images/Industry/Kees-Leemeijer_Rotterdam-Harbor-Container-transhipment.webp", category: "Industry", title: "Container transhipment 2", originalIndex: 54 },
    { src: "./images/Industry/Kees-Leemeijer_Rotterdam-Harbor-crane.webp", category: "Industry", title: "Harbor crane", originalIndex: 55 },
    { src: "./images/Industry/Kees-Leemeijer_Rotterdam-Harbor-Cosco-shipping-virgo.webp", category: "Industry", title: "Cosco Shipping Virgo", originalIndex: 56 },
    { src: "./images/Architecture/Kees-Leemeijer_Sagrada-Familia.webp", category: "Architecture", title: "Sagrada Familia Interior", originalIndex: 57 },
    { src: "./images/Architecture/Kees-Leemeijer_Sagrada-Familia-1.webp", category: "Architecture", title: "Sagrada Familia Ceiling", originalIndex: 58 },
    { src: "./images/Architecture/Kees-Leemeijer_Sagrada-Familia-2.webp", category: "Architecture", title: "Sagrada Familia Columns", originalIndex: 59 },
    { src: "./images/Architecture/Kees-Leemeijer_Penn-Station-guastavino-tile-vault.webp", category: "Architecture", title: "Penn Station Guastavino Vault", originalIndex: 60 },
    { src: "./images/Architecture/Kees-Leemeijer_Copenhagen-Grundsvig-church.webp", category: "Architecture", title: "Grundtvig's Church Exterior", originalIndex: 61 },
    { src: "./images/Architecture/Kees-Leemeijer_Copenhagen-Grundsvig-church-1.webp", category: "Architecture", title: "Grundtvig's Church Interior Nave", originalIndex: 62 },
    { src: "./images/Architecture/Kees-Leemeijer_Copenhagen-Grundsvig-church-2.webp", category: "Architecture", title: "Grundtvig's Church Organ", originalIndex: 63 },
    { src: "./images/Architecture/Kees-Leemeijer_Copenhagen-Grundsvig-church-3.webp", category: "Architecture", title: "Grundtvig's Church Detail", originalIndex: 64 },
    { src: "./images/Architecture/Kees-Leemeijer_Copenhagen-Grundsvig-church-4.webp", category: "Architecture", title: "Grundtvig's Church Side Aisle", originalIndex: 65 },
    { src: "./images/Architecture/Kees-Leemeijer_Felix-Candela-Our-Lady-of-the-Miraculous-Medal-Church.webp", category: "Architecture", title: "Felix Candela ILMM Church", originalIndex: 66 },
    { src: "./images/Architecture/Kees-Leemeijer_Santuario-de-la-Virgen-de-las-Lágrimas.webp", category: "Architecture", title: "Madonna delle Lacrime Exterior", originalIndex: 67 },
    { src: "./images/Architecture/Kees-Leemeijer_Santuario-de-la-Virgen-de-las-Lágrimas-1.webp", category: "Architecture", title: "Madonna delle Lacrime Interior", originalIndex: 68 },
].map(p => Object.freeze(p))); // Freeze each project object and the array itself for immutability.

// ==========================================================================
// Utility Functions
// ==========================================================================

/** Debounces a function, delaying its execution until after a specified wait time has elapsed
 *  since the last time it was invoked. Useful for rate-limiting events like resize or input.
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The debounce delay in milliseconds.
 * @returns {Function & { cancel?: () => void }} The debounced function, with an optional `cancel` method.
 */
function debounce(func, delay) { let timeoutId; const debounced = function(...args) { clearTimeout(timeoutId); timeoutId = setTimeout(() => { timeoutId = null; try { func.apply(this, args); } catch (e) { console.error(`Error in debounced function execution (${func.name || 'anonymous'}):`, e); } }, delay); }; debounced.cancel = () => { clearTimeout(timeoutId); timeoutId = null; }; return debounced; }

/** Throttles a function, ensuring it's called at most once per specified limit period.
 *  Useful for frequent events like scroll or mousemove to improve performance.
 * @param {Function} func - The function to throttle.
 * @param {number} limit - The throttle limit in milliseconds.
 * @returns {Function & { cancel?: () => void }} The throttled function, with an optional `cancel` method.
 */
function throttle(func, limit) { let inThrottle = false; let lastResult; let timeoutId = null; let trailingCallScheduled = false; let lastArgs = null; let lastThis = null; const throttled = function(...args) { lastArgs = args; lastThis = this; if (!inThrottle) { inThrottle = true; try { lastResult = func.apply(lastThis, lastArgs); } catch (e) { console.error(`Error in throttled function execution (${func.name || 'anonymous'}):`, e); } timeoutId = setTimeout(() => { inThrottle = false; timeoutId = null; if (trailingCallScheduled) { trailingCallScheduled = false; throttled.apply(lastThis, lastArgs); } }, limit); } else { trailingCallScheduled = true; } return lastResult; }; throttled.cancel = () => { clearTimeout(timeoutId); timeoutId = null; inThrottle = false; trailingCallScheduled = false; lastArgs = null; lastThis = null; }; return throttled; }

/** @type {number | undefined} Cached scrollbar width. */
let _cachedScrollbarWidth = undefined;

/** Calculates the width of the browser's scrollbar. Caches the result for efficiency.
 * This is used to compensate for layout shifts when scrollbars appear/disappear.
 * @param {boolean} [forceRecalculate=false] - If true, bypasses cache and recalculates.
 * @returns {number} The scrollbar width in pixels. Returns 0 if calculation fails or not in a browser env.
 */
function getScrollbarWidth(forceRecalculate = false) {
    if (!forceRecalculate && _cachedScrollbarWidth !== undefined) {
        return _cachedScrollbarWidth;
    }

    if (typeof window === 'undefined' || typeof document === 'undefined' || !document.documentElement) {
        console.warn("Scrollbar width check skipped: Not in a browser environment.");
        _cachedScrollbarWidth = 0;
        return 0;
    }

    try {
        // Primary method: difference between window inner width and client width of html element
        const visualViewportWidth = window.visualViewport ? window.visualViewport.width : window.innerWidth;
        const scrollbarWidth = visualViewportWidth - document.documentElement.clientWidth;
        _cachedScrollbarWidth = Math.max(0, scrollbarWidth);
        return _cachedScrollbarWidth;
    } catch (e) {
        console.warn("Could not calculate scrollbar width using standard properties. Falling back to div method.", e);
        // Fallback method: creating a temporary div
        try {
            if (!document.body) { // Ensure body exists before appending
                console.warn("Scrollbar width fallback failed: document.body not available yet for measurement.");
                _cachedScrollbarWidth = 0;
                return 0;
            }
            const outer = document.createElement('div');
            outer.style.visibility = 'hidden';
            outer.style.position = 'absolute'; 
            outer.style.top = '-9999px'; 
            outer.style.left = '-9999px';
            outer.style.width = '100px';
            outer.style.height = '100px'; 
            outer.style.overflow = 'scroll'; 
            outer.style.msOverflowStyle = 'scrollbar'; 

            document.body.appendChild(outer);

            const widthWithScroll = outer.offsetWidth;
            const inner = document.createElement('div');
            inner.style.width = '100%';
            outer.appendChild(inner);
            const widthWithoutScroll = inner.offsetWidth;

            outer.parentNode?.removeChild(outer);

            _cachedScrollbarWidth = Math.max(0, widthWithScroll - widthWithoutScroll);
            return _cachedScrollbarWidth;
        } catch (fallbackError) {
            console.error("Scrollbar width calculation failed using both methods.", fallbackError);
            _cachedScrollbarWidth = 0;
            return 0;
        }
    }
}


/** Checks if the user has a preference for reduced motion.
 *  Essential for accessibility, allowing disabling or altering animations.
 * @returns {boolean} True if reduced motion is preferred, false otherwise.
 */
function prefersReducedMotion() { if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') { return false; } try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { console.warn("Could not determine reduced motion preference via matchMedia.", e); return false; } }

/**
 * Generates the srcset attribute string for responsive images.
 * Assumes images follow the pattern: Filename-XXXw.webp or Filename.webp (for base).
 * It removes an existing "-<numbers>w" suffix from the base filename before appending new width descriptors.
 * This allows more flexibility in the `baseSrc` provided (e.g., it can already be a sized variant).
 * @param {string} baseSrc - The src path of an image (can be a non-width-suffixed name or one with it, e.g., image.webp or image-1024w.webp).
 * @param {number[]} widths - An array of available widths for the image (e.g., [240, 320, 480]).
 * @returns {string} The generated srcset string (e.g., "path/image-240w.webp 240w, path/image-320w.webp 320w").
 *                   Returns `baseSrc` as fallback if inputs are invalid or an error occurs.
 */
function generateSrcset(baseSrc, widths) {
    if (!baseSrc || !Array.isArray(widths) || widths.length === 0) {
        console.warn("generateSrcset: Invalid input, returning baseSrc.", { baseSrc, widths });
        return baseSrc;
    }
    try {
        const filenameWithExt = baseSrc.substring(baseSrc.lastIndexOf('/') + 1);
        const baseFilenamePart = filenameWithExt.replace(/\.webp$/, '');
        const cleanBaseFilename = baseFilenamePart.replace(/-(\d+)w$/, '');
        const directoryPath = baseSrc.substring(0, baseSrc.lastIndexOf('/') + 1);

        const srcsetEntries = widths.map(w => {
            return `${directoryPath}${cleanBaseFilename}-${w}w.webp ${w}w`;
        });
        return srcsetEntries.join(', ');
    } catch (e) {
        console.error("Error generating srcset for:", baseSrc, e);
        return baseSrc;
    }
}

/**
 * Creates a standardized error message element for image loading failures.
 * @param {string} title - The title or alt text of the image that failed to load.
 * @param {boolean} isFullscreenSlide - True if the error is for a fullscreen slide, for specific styling.
 * @returns {HTMLDivElement} The error message element.
 */
function createErrorNode(title, isFullscreenSlide = false) {
    const C = CONFIG.SELECTORS.CLASSES_AND_SELECTORS;
    const errorWrapper = document.createElement('div');
    errorWrapper.className = C.itemErrorContent;

    const visuallyHiddenErrorText = document.createElement('span');
    visuallyHiddenErrorText.className = C.visuallyHidden;
    visuallyHiddenErrorText.textContent = 'Error:';
    errorWrapper.appendChild(visuallyHiddenErrorText);

    const mainErrorText = document.createTextNode(' Image failed to load'); // Text node
    errorWrapper.appendChild(mainErrorText);

    if (title) {
        const errorTitleSpan = document.createElement('span');
        errorTitleSpan.className = C.slideErrorTitle;
        errorTitleSpan.textContent = ` (${title})`;
        errorWrapper.appendChild(errorTitleSpan);
    }
    return errorWrapper;
}

// ==========================================================================
// DOM Caching
// ==========================================================================

/** Caches frequently accessed DOM elements for performance and convenience.
 * Logs errors or warnings if essential elements are not found.
 * @returns {object | null} An object mapping keys to DOM elements, or null if critical elements are missing.
 */
function cacheDomElements() {
    const d = document;
    const cacheableSelectors = CONFIG.SELECTORS.CACHEABLE_ELEMENTS;
    const elements = {};
    let allEssentialFound = true;

    const essentialKeys = Object.freeze(['root', 'html', 'body', 'mainContainer', 'mainContent']);
    const galleryEssentialKeys = Object.freeze([
        'scrollModeGallery', 'thumbnailColumn', 'mainImageColumn', 'thumbnailScroller', 'mainImageScroller', 'activeCursor', 'scrollGalleryStatus',
        'fullscreenContainer', 'fullscreenSliderWrapper', 'fullscreenCloseButton', 'fullscreenStatusLabel'
    ]);
    const uiEssentialKeys = Object.freeze(['filterList', 'roleElement']);
    const optionalKeys = Object.freeze([
        'projectGallerySection', 'hueShiftButton', 'darkModeButton', 'darkModeIcon', 'backgroundCanvas', 'navLinksQuery'
    ]);

    console.log("⚙️ Caching DOM elements...");
    try {
        for (const key in cacheableSelectors) {
            if (!Object.prototype.hasOwnProperty.call(cacheableSelectors, key)) continue;

            const selector = cacheableSelectors[key];
            if (key === 'navLinksQuery') {
                // Ensure selector is a non-empty string before querying
                if (typeof selector === 'string' && selector.trim() !== '') {
                    try {
                        elements.navLinks = Array.from(d.querySelectorAll(selector));
                    } catch (e) {
                        console.error(`❌ Error querying nav links with selector "${selector}":`, e);
                        elements.navLinks = [];
                    }
                } else {
                    elements.navLinks = [];
                    if (!selector) console.warn(`⚠️ Nav links query selector not defined in config.`);
                    else console.warn(`⚠️ Nav links query selector is empty. Navigation links might not work.`);
                }
                continue;
            }

            elements[key] = d.querySelector(selector);

            if (!elements[key]) {
                if (essentialKeys.includes(key)) {
                    console.error(`‼️ Fatal Error: Essential DOM element "${key}" (selector: "${selector}") not found.`);
                    allEssentialFound = false;
                } else if (galleryEssentialKeys.includes(key)) {
                    console.error(`‼️ Gallery Error: Essential gallery DOM element "${key}" (selector: "${selector}") not found. Gallery functionality will be severely impacted or disabled.`);
                } else if (uiEssentialKeys.includes(key)) {
                    console.warn(`⚠️ UI Feature Warning: Core UI element "${key}" (selector "${selector}") not found. Related UI functionality (e.g., filtering, role typing) will be disabled.`);
                } else if (optionalKeys.includes(key)) {
                    console.warn(`⚠️ Optional element "${key}" (selector "${selector}") not found. Dependent functionality might be disabled or limited.`);
                } else {
                    console.warn(`❓ Uncategorized element "${key}" (selector "${selector}") not found.`);
                }
            }
        }

        if (!allEssentialFound) {
            console.error("❌ App initialization aborted due to missing essential DOM elements.");
            return null;
        }
        console.log("✅ DOM elements cached successfully.");
        return elements;
    } catch (error) {
        console.error("❌ Unexpected error during DOM element caching:", error);
        return null;
    }
}
/** @type {ReturnType<typeof cacheDomElements> | null} Stores cached DOM elements. */
let domElements = null;
/** @type {boolean} Tracks if the page is scrolled to the very top. */
let isScrolledTop = true;

// ==========================================================================
// BackgroundAnimation Class - Manages the JS-driven canvas background effect.
// ==========================================================================
class BackgroundAnimation {
    canvasElement = null;
    ctx = null;
    config;
    balls = [];
    colors = [];
    frameId = null;
    isInitialized = false;
    mouseX = 0;
    mouseY = 0;
    debouncedHandleResize;

    constructor() {
        this.canvasElement = domElements?.backgroundCanvas ?? null;
        this.config = CONFIG.BACKGROUND;
        
        this._animate = this._animate.bind(this);
        this.debouncedHandleResize = debounce(this._handleResizeInternal.bind(this), CONFIG.ANIMATION.RESIZE_DEBOUNCE_MS);
        this.updateMousePosition = this.updateMousePosition.bind(this);

        if (!this.canvasElement) {
            console.warn("⚠️ Background canvas element not found. Animation disabled.");
            this.isInitialized = false;
            return;
        }
        
        try {
            this.ctx = this.canvasElement.getContext('2d');
            if (!this.ctx) {
                console.error("❌ Failed to get 2D rendering context for background canvas. Animation disabled.");
                this.canvasElement = null;
                this.isInitialized = false;
                return;
            }
        } catch (e) {
            console.error("❌ Error getting 2D context:", e);
            this.canvasElement = null;
            this.ctx = null;
            this.isInitialized = false;
            return;
        }

        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
        this.isInitialized = this._initializeState();
    }

    _initializeState() {
        if (!this.canvasElement || !this.ctx || !domElements?.root) {
            console.warn("⚠️ Background animation initialization failed: Missing canvas, context, or root element.");
            this.stop();
            return false;
        }
        this.stop(); 

        this.canvasElement.width = window.innerWidth * (window.devicePixelRatio || 1);
        this.canvasElement.height = window.innerHeight * (window.devicePixelRatio || 1);

        if (!this.updateColors()) {
            console.warn("⚠️ Background animation initialization failed: Could not update colors from CSS variables.");
            return false;
        }
        try {
            this._createBalls();
            return true;
        } catch (error) {
            console.error("❌ Error during background animation ball creation:", error);
            return false;
        }
    }
    
    updateColors() { if (!domElements?.root) return false; try { const computedStyle = getComputedStyle(domElements.root); const fallbackColor = 'transparent'; const fetchedColors = [ computedStyle.getPropertyValue('--ball-color-light').trim() || '', computedStyle.getPropertyValue('--ball-color-medium').trim() || '', computedStyle.getPropertyValue('--ball-color-dark').trim() || '', ]; this.colors = fetchedColors.filter(color => color && color !== fallbackColor && CSS.supports('color', color) ); if (this.colors.length === 0) { console.warn("⚠️ Background animation colors not found or invalid in CSS variables (--ball-color-*). Using fallback or disabling balls."); return false; } return true; } catch (e) { console.error("❌ Error reading background color CSS variables:", e); this.colors = []; return false; } }
    
    start() { 
        if (!this.isInitialized) {
            this.isInitialized = this._initializeState();
            if (!this.isInitialized) {
                console.warn("⚠️ Cannot start background animation: Initialization failed.");
                return;
            }
        }
        if (this.canvasElement && this.ctx && this.balls.length > 0 && !this.frameId) {
            this.frameId = requestAnimationFrame(this._animate);
        }
    }

    stop() { if (this.frameId) { cancelAnimationFrame(this.frameId); this.frameId = null; } }
    
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
            console.warn("⚠️ Background animation failed to re-initialize on resize.");
            this.stop(); 
        }
    }

    updateMousePosition(x, y) { this.mouseX = x * (window.devicePixelRatio || 1); this.mouseY = y * (window.devicePixelRatio || 1); }
    
    _createBalls() { 
        const { BASE_RADIUS, RADIUS_VAR, MOBILE_BALLS, DESKTOP_BALLS, DRIFT_BASE, DRIFT_VAR } = this.config; 
        const { colors } = this; 
        this.balls = []; 
        if (!colors || colors.length === 0) { 
            console.warn("⚠️ Cannot create background balls: Invalid or missing colors."); 
            return; 
        } 
        const w = this.canvasElement?.width; 
        const h = this.canvasElement?.height; 

        if (typeof w !== 'number' || typeof h !== 'number' || w <= 0 || h <= 0) { 
            throw new Error("Could not get valid canvas dimensions to create balls."); 
        } 
        const numBalls = window.innerWidth < 768 ? MOBILE_BALLS : DESKTOP_BALLS; 
        if (numBalls <= 0) { 
            return; 
        } 
        for (let i = 0; i < numBalls; i++) { 
            const ball = { 
                x: Math.random() * w, 
                y: Math.random() * h, 
                radius: (BASE_RADIUS + Math.random() * RADIUS_VAR) * (window.devicePixelRatio || 1),
                vx: (Math.random() - 0.5) * 0.25, 
                vy: (Math.random() - 0.5) * 0.25, 
                targetX: Math.random() * w, 
                targetY: Math.random() * h, 
                drift: DRIFT_BASE + Math.random() * DRIFT_VAR, 
                colors: [i % colors.length, (i + 1) % colors.length, (i + 2) % colors.length] 
            }; 
            this.balls.push(ball); 
        } 
    }

    _updateBalls() { 
        if (!this.balls || this.balls.length === 0 || !this.canvasElement) return; 
        const { REPULSION, DAMPING, THRESHOLD_SQ, BOUNCE_DAMP } = this.config; 
        const { mouseX, mouseY } = this; 
        const w = this.canvasElement.width; 
        const h = this.canvasElement.height; 
        const scaledRepulsion = REPULSION * (window.devicePixelRatio || 1);

        try { 
             this.balls.forEach(b => { 
                const dxm = b.x - mouseX; 
                const dym = b.y - mouseY; 
                const distSq = dxm * dxm + dym * dym; 
                const repelRadius = b.radius + scaledRepulsion; 
                const repelSq = repelRadius * repelRadius; 
                if (distSq < repelSq && distSq > 1e-6) { 
                    const dist = Math.sqrt(distSq); 
                    const angle = Math.atan2(dym, dxm); 
                    const force = Math.min(1, (repelRadius - dist) / scaledRepulsion) * 3; 
                    b.vx += Math.cos(angle) * force; 
                    b.vy += Math.sin(angle) * force; 
                } 
                const dxt = b.targetX - b.x; 
                const dyt = b.targetY - b.y; 
                b.vx += dxt * b.drift; 
                b.vy += dyt * b.drift; 
                b.vx *= DAMPING; 
                b.vy *= DAMPING; 
                b.x += b.vx; 
                b.y += b.vy; 
                if (dxt * dxt + dyt * dyt < THRESHOLD_SQ) { 
                    b.targetX = Math.random() * w; 
                    b.targetY = Math.random() * h; 
                } 
                const R = b.radius; 
                if (b.x + R > w) { b.x = w - R; b.vx *= BOUNCE_DAMP; } 
                if (b.x - R < 0) { b.x = R; b.vx *= BOUNCE_DAMP; } 
                if (b.y + R > h) { b.y = h - R; b.vy *= BOUNCE_DAMP; } 
                if (b.y - R < 0) { b.y = R; b.vy *= BOUNCE_DAMP; } 
            }); 
        } catch (e) { 
            console.error("❌ Error updating background ball physics:", e); 
            this.stop(); 
        } 
    }
    _drawBalls() {
        if (!this.ctx || !this.canvasElement || !this.balls?.length || !this.colors?.length) {
            return;
        }
        try {
            this.balls.forEach(b => {
                if (!b || typeof b.x !== 'number' || typeof b.y !== 'number' || typeof b.radius !== 'number' || !Array.isArray(b.colors) || b.colors.length < 3) {
                    console.warn("⚠️ Invalid ball data encountered during draw:", b);
                    return;
                }
                const [c1i, c2i, c3i] = b.colors;
                if (c1i >= this.colors.length || c2i >= this.colors.length || c3i >= this.colors.length) {
                    console.warn(`⚠️ Invalid color index for ball: Indices [${c1i}, ${c2i}, ${c3i}], Available colors: ${this.colors.length}. Skipping.`);
                    return;
                }
                const c1 = this.colors[c1i], c2 = this.colors[c2i], c3 = this.colors[c3i];
                const r = Math.max(1, b.radius); 
                const gradientRadius = Math.max(1, r * 1.8);

                const grad = this.ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, gradientRadius);
                grad.addColorStop(0, c1);
                grad.addColorStop(0.5, c2);
                grad.addColorStop(1, c3);
                
                this.ctx.beginPath();
                this.ctx.arc(b.x, b.y, gradientRadius, 0, Math.PI * 2);
                this.ctx.fillStyle = grad;
                this.ctx.fill();
            });
        } catch (e) {
            console.error("❌ Error drawing background balls with Canvas API:", e);
            this.stop();
        }
    }

    _animate() { 
        if (!this.isInitialized || !this.canvasElement || !this.ctx) { 
            this.stop(); 
            return; 
        } 
        
        this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

        if (this.balls.length > 0) { 
            try { 
                this._updateBalls(); 
                this._drawBalls(); 
            } catch (e) { 
                console.error("❌ Error in animation frame:", e); 
                this.stop(); 
                return; 
            } 
        } 
        if (this.frameId) { 
            this.frameId = requestAnimationFrame(this._animate);
        }
    }
    destroy() {
        this.stop(); 
        this.debouncedHandleResize?.cancel?.(); 
        this.balls = []; 
        this.colors = []; 
        this.isInitialized = false; 
        this.canvasElement = null; 
        this.ctx = null; 
    }
}

// ==========================================================================
// Gallery Class - Manages the fullscreen image slider functionality.
// ==========================================================================
class Gallery {
    dom = null;
    visibleImageData = [];
    animationConfig;
    galleryConfig;
    prefersReducedMotion = false;
    state = { currentIndex: 0, totalVisibleImages: 0, isAnimatingZoom: false, isSliderOpen: false, lastFocusedElement: null, clickedImageElement: null, boundHandlers: {}, scrollTimeoutId: null, transitionFallbackTimer: null, isZoomInTransitionAttached: false, isZoomOutTransitionAttached: false, };
    isInitialized = false;

    constructor() {
        this.isInitialized = false;
        const requiredKeys = ['fullscreenContainer', 'fullscreenSliderWrapper', 'fullscreenCloseButton', 'fullscreenStatusLabel', 'mainContent', 'mainContainer', 'body', 'html'];
        const allEssentialFound = requiredKeys.every(key => domElements?.[key]);

        if (!allEssentialFound || !domElements) {
            console.error(`‼️ Gallery (Slider) init failed: Missing essential DOM element(s). Gallery disabled.`);
            return;
        }

        try {
            this.dom = {
                container: domElements.fullscreenContainer,
                sliderWrapper: domElements.fullscreenSliderWrapper,
                closeButton: domElements.fullscreenCloseButton,
                statusLabel: domElements.fullscreenStatusLabel,
                mainContainer: domElements.mainContainer,
                mainContent: domElements.mainContent,
                body: domElements.body,
                html: domElements.html,
                projectGallerySection: domElements.projectGallerySection,
            };

            this.animationConfig = CONFIG.ANIMATION;
            this.galleryConfig = CONFIG.GALLERY;
            this.prefersReducedMotion = prefersReducedMotion();

            this.state.boundHandlers = {
                keydown: this._handleKeydown.bind(this),
                scroll: throttle(this._handleScroll.bind(this), this.animationConfig.SLIDER_SCROLL_THROTTLE_MS),
                slideClick: this._handleSlideClick.bind(this),
                handleZoomInEnd: this._onZoomInComplete.bind(this),
                handleZoomOutEnd: this._onZoomOutComplete.bind(this),
                closeClick: this._requestClose.bind(this),
            };

            this.isInitialized = true;
        } catch (error) {
            console.error("❌ Critical error during Gallery construction:", error);
            this.isInitialized = false;
            this.dom = null;
        }
    }

    setupEventListeners() { if (!this.isInitialized || !this.dom) { console.warn("⚠️ Cannot setup Gallery listeners: Not initialized."); return; } this.dom.closeButton.addEventListener('click', this.state.boundHandlers.closeClick); this.dom.container.addEventListener('keydown', this.state.boundHandlers.keydown); this.dom.sliderWrapper.addEventListener('scroll', this.state.boundHandlers.scroll, { passive: true }); this.dom.sliderWrapper.addEventListener('click', this.state.boundHandlers.slideClick);
    }
    open(imageData, startIndex, clickedImageElement, focusReturnElement = null) { if (!this.isInitialized || this.state.isAnimatingZoom || this.state.isSliderOpen) { console.warn("⚠️ Gallery open request ignored: Already open or animating."); return; } if (!Array.isArray(imageData) || imageData.length === 0) { console.error("❌ Gallery open error: No valid image data provided."); return; } if (!(clickedImageElement instanceof HTMLImageElement)) { console.error("❌ Gallery open error: Invalid clicked image element provided for FLIP animation."); return; } if (!this.dom) { console.error("❌ Gallery open error: DOM elements not available."); return; } const clampedStartIndex = Math.max(0, Math.min(startIndex, imageData.length - 1)); this.visibleImageData = imageData; this.state.totalVisibleImages = imageData.length; this.state.currentIndex = clampedStartIndex; this.state.clickedImageElement = clickedImageElement;
        this.state.lastFocusedElement = focusReturnElement || clickedImageElement.closest(`.${CONFIG.SELECTORS.CLASSES_AND_SELECTORS.scrollGalleryMainItem}`) || document.activeElement || this.dom.body; this.state.isAnimatingZoom = true; try { this._prepareUIForOpen(); if (this.prefersReducedMotion) { this._openInstantly(); } else { this._animateZoomIn(); } } catch (error) { console.error("❌ Error during gallery open sequence:", error); this._closeInstantly(); } }
    _requestClose() { if (!this.isInitialized || this.state.isAnimatingZoom || !this.state.isSliderOpen) return; this.state.isAnimatingZoom = true; this.state.isSliderOpen = false; try { if (this.prefersReducedMotion) { this._closeInstantly(); } else { this._animateZoomOut(); } } catch (error) { console.error("❌ Error initiating gallery close animation:", error); this._closeInstantly(); } }
    
    _prepareUIForOpen() {
        if (!this.dom) throw new Error("Cannot prepare UI for open: DOM elements missing.");
        const { container, mainContainer, mainContent, html } = this.dom;
        const { scrollGalleryMainItem, sourceElementZooming, fullscreenEffectActive, isZooming, fullscreenActive, active } = CONFIG.SELECTORS.CLASSES_AND_SELECTORS;
        const sourceImgContainer = this.state.clickedImageElement?.closest(`.${scrollGalleryMainItem}`);
        
        this._populateSlider();

        if (sourceImgContainer) {
            sourceImgContainer.classList.add(sourceElementZooming);
            if (!this.prefersReducedMotion) { 
                sourceImgContainer.style.opacity = '0';
                sourceImgContainer.style.visibility = 'hidden';
                sourceImgContainer.style.pointerEvents = 'none';
                sourceImgContainer.style.transition = 'none'; 
            }
        }

        mainContainer.classList.add(fullscreenEffectActive);
        html.classList.add(fullscreenActive);
        container.style.display = 'flex';
        container.removeAttribute('hidden');
        container.setAttribute('aria-hidden', 'false');
        container.classList.remove(active); 
        container.classList.add(isZooming);
        mainContent.setAttribute('aria-hidden', 'true');
    }

    _openInstantly() { if (!this.dom) return; const { container, sliderWrapper } = this.dom; const { active, isZooming } = CONFIG.SELECTORS.CLASSES_AND_SELECTORS; const targetIndex = this.state.currentIndex; this.state.isAnimatingZoom = false; try { container.classList.add(active); container.classList.remove(isZooming); const targetSlide = sliderWrapper.children?.[targetIndex]; if (targetSlide instanceof HTMLElement) { const scrollLeftTarget = targetSlide.offsetLeft - (sliderWrapper.offsetWidth - targetSlide.offsetWidth) / 2; sliderWrapper.scrollTo({ left: scrollLeftTarget, behavior: 'instant' }); } else { console.error(`❌ Open Instantly Error: Target slide element at index ${targetIndex} not found.`); sliderWrapper.scrollTo({ left: 0, behavior: 'instant' }); } this.state.isSliderOpen = true; this._updateAccessibilityState(); this._focusCloseButton(); } catch(error) { console.error("❌ Error opening gallery instantly:", error); this._closeInstantly(); } }
    _animateZoomIn() { if (!this.dom) return; const { container, sliderWrapper } = this.dom; const { active } = CONFIG.SELECTORS.CLASSES_AND_SELECTORS; const sourceImg = this.state.clickedImageElement; const targetIndex = this.state.currentIndex; if (!sourceImg || !sliderWrapper) { console.error("❌ Zoom-in Error: Source image or slider wrapper missing. Opening instantly."); this._openInstantly(); return; } let firstRect; try { firstRect = sourceImg.getBoundingClientRect(); } catch (e) { console.error("❌ Zoom-in Error: Failed to get source bounds.", e); this._openInstantly(); return; } requestAnimationFrame(() => { if (!this.state.isAnimatingZoom || !this.dom) return; try { const targetSlide = sliderWrapper.children[targetIndex]; const targetSlideImage = targetSlide?.querySelector('img'); if (!(targetSlide instanceof HTMLElement) || !(targetSlideImage instanceof HTMLImageElement)) { console.error(`❌ Zoom-in Error: Target slide/image at index ${targetIndex} not found. Opening instantly.`); this._openInstantly(); return; } const scrollLeftTarget = targetSlide.offsetLeft - (sliderWrapper.offsetWidth - targetSlide.offsetWidth) / 2; sliderWrapper.scrollTo({ left: scrollLeftTarget, behavior: 'instant' }); const lastRect = targetSlideImage.getBoundingClientRect(); const deltaX = firstRect.left - lastRect.left; const deltaY = firstRect.top - lastRect.top; const scaleX = lastRect.width > 0 ? firstRect.width / lastRect.width : 1; const scaleY = lastRect.height > 0 ? firstRect.height / lastRect.height : 1; targetSlideImage.style.transformOrigin = '0 0'; targetSlideImage.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`; targetSlideImage.style.opacity = '0'; requestAnimationFrame(() => { if (!this.state.isAnimatingZoom || !this.dom) return; targetSlideImage.classList.add('fullscreen-image-transition'); targetSlideImage.style.transform = ''; targetSlideImage.style.opacity = '1'; container.classList.add(active); if (this.state.isAnimatingZoom && !this.state.isZoomInTransitionAttached) { this._setupTransitionEndHandler(targetSlideImage, this.state.boundHandlers.handleZoomInEnd, 'zoomIn'); this.state.isZoomInTransitionAttached = true; } }); } catch (e) { console.error("❌ Error during zoom-in animation sequence:", e); this._openInstantly(); } }); }
    _animateZoomOut() { 
        if (!this.dom) return; 
        const { container, sliderWrapper, mainContainer, html } = this.dom; 
        const currentIndex = this.state.currentIndex;
        const { scrollGalleryMainItem, sourceElementZooming, active, fullscreenEffectActive, isZooming, fullscreenActive } = CONFIG.SELECTORS.CLASSES_AND_SELECTORS; 
        if (!container || !sliderWrapper || !mainContainer || !html || !this.visibleImageData[currentIndex]) { 
            console.error("❌ Zoom-out Error: Essential elements/data missing. Closing instantly."); 
            this._closeInstantly(); 
            return; 
        } 
        const currentSlideElement = sliderWrapper.children[currentIndex]; 
        const currentSlideImage = currentSlideElement?.querySelector('img'); 
        
        let targetElementContainer = null;
        const currentSlideData = this.visibleImageData[currentIndex];
        if (currentSlideData && typeof currentSlideData.originalIndex === 'number') {
            targetElementContainer = document.querySelector(`.${scrollGalleryMainItem}[data-original-index="${currentSlideData.originalIndex}"]`);
        }
        if (!targetElementContainer) {
             targetElementContainer = this.state.lastFocusedElement?.closest(`.${scrollGalleryMainItem}`) || 
                                  this.state.clickedImageElement?.closest(`.${scrollGalleryMainItem}`);
        }
        
        const targetImage = targetElementContainer?.querySelector('img'); 
        
        if (!currentSlideImage || !targetElementContainer || !targetImage) { 
            console.warn("⚠️ Zoom-out Warning: Cannot find source or target for FLIP. Closing instantly."); 
            this._closeInstantly(); 
            return; 
        } 
        
        let firstRect; 
        try { 
            firstRect = currentSlideImage.getBoundingClientRect(); 
        } catch(e) { 
            console.error("❌ Zoom-out Error: Cannot get fullscreen image bounds.", e); 
            this._closeInstantly(); 
            return; 
        }
        
        if (targetElementContainer) {
            targetElementContainer.style.opacity = '';
            targetElementContainer.style.visibility = '';
            targetElementContainer.style.pointerEvents = '';
            targetElementContainer.style.transition = '';
        }
        targetElementContainer.classList.remove(sourceElementZooming);

        container.classList.remove(active); mainContainer.classList.remove(fullscreenEffectActive); html.classList.remove(fullscreenActive); container.classList.add(isZooming); requestAnimationFrame(() => { if (!this.state.isAnimatingZoom || !this.dom) return; try { const lastRect = targetImage.getBoundingClientRect(); const deltaX = lastRect.left - firstRect.left; const deltaY = lastRect.top - firstRect.top; const scaleX = firstRect.width > 0 ? lastRect.width / firstRect.width : 1; const scaleY = firstRect.height > 0 ? lastRect.height / firstRect.height : 1; currentSlideImage.style.transformOrigin = '0 0'; currentSlideImage.classList.add('fullscreen-image-transition'); currentSlideImage.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`; currentSlideImage.style.opacity = '0'; if (this.state.isAnimatingZoom && !this.state.isZoomOutTransitionAttached) { this._setupTransitionEndHandler(currentSlideImage, this.state.boundHandlers.handleZoomOutEnd, 'zoomOut'); this.state.isZoomOutTransitionAttached = true; } } catch (e) { console.error("❌ Error during zoom-out animation sequence:", e); this._closeInstantly(); } }); }
    
    _setupTransitionEndHandler(element, callback, transitionType) {
        const animationDuration = this.animationConfig.ZOOM_TRANSITION_MS;
        clearTimeout(this.state.transitionFallbackTimer);
        this.state.transitionFallbackTimer = null;
        let ended = false;

        const onEnd = (event) => {
            if (event?.target !== element || ended) return; 
            ended = true;
            clearTimeout(this.state.transitionFallbackTimer);
            this.state.transitionFallbackTimer = null;
            element.removeEventListener('transitionend', onEnd); 

            if (transitionType === 'zoomIn') this.state.isZoomInTransitionAttached = false;
            if (transitionType === 'zoomOut') this.state.isZoomOutTransitionAttached = false;

            if (callback) {
                try {
                    callback(element);
                } catch (e) {
                    console.error(`❌ Error executing transitionend callback (${callback.name || 'anonymous'} for ${transitionType}):`, e);
                    if (transitionType === 'zoomOut') this._closeInstantly();
                }
            }
        };

        element.addEventListener('transitionend', onEnd);

        this.state.transitionFallbackTimer = setTimeout(() => {
            if (ended) return;
            ended = true;
            console.warn(`⚠️ TransitionEnd fallback triggered for ${transitionType} on element:`, element.alt || element.tagName);
            element.removeEventListener('transitionend', onEnd); 

            if (transitionType === 'zoomIn') this.state.isZoomInTransitionAttached = false;
            if (transitionType === 'zoomOut') this.state.isZoomOutTransitionAttached = false;
            this.state.transitionFallbackTimer = null;

            if (callback) {
                try {
                    callback(element);
                } catch (e) {
                    console.error(`❌ Error executing fallback callback (${callback.name || 'anonymous'} for ${transitionType}):`, e);
                    if (transitionType === 'zoomOut') this._closeInstantly();
                }
            }
        }, animationDuration + 150);
    }
    
    _onZoomInComplete(transitionedImage) {
        if (!this.state.isAnimatingZoom || !this.dom) return;
        try {
            this._resetZoomStyles(transitionedImage); 
            this.dom.container.classList.remove(CONFIG.SELECTORS.CLASSES_AND_SELECTORS.isZooming);
            
            const sourceContainer = this.state.clickedImageElement?.closest(`.${CONFIG.SELECTORS.CLASSES_AND_SELECTORS.scrollGalleryMainItem}`);
            if (sourceContainer) {
                sourceContainer.classList.remove(CONFIG.SELECTORS.CLASSES_AND_SELECTORS.sourceElementZooming);
                if (!this.prefersReducedMotion) {
                    sourceContainer.style.opacity = '';
                    sourceContainer.style.visibility = '';
                    sourceContainer.style.pointerEvents = '';
                    sourceContainer.style.transition = '';
                }
            }
            
            this.state.isAnimatingZoom = false;
            this.state.isSliderOpen = true;
            this._updateAccessibilityState();
            this._focusCloseButton();
        } catch(error) {
            console.error("❌ Error in _onZoomInComplete:", error);
            this._closeInstantly();
        }
    }

    _onZoomOutComplete(transitionedImage) { 
        if (!this.state.isAnimatingZoom) return; 
        try { 
            this._resetZoomStyles(transitionedImage); 
            this._cleanupUIOnClose(); 
            this.state.isAnimatingZoom = false; 
            this._restoreFocus(); 
            this.state.clickedImageElement = null; 
        } catch(error) { 
            console.error("❌ Error in _onZoomOutComplete:", error); 
            this._cleanupUIOnClose(); 
            this.state.isAnimatingZoom = false; 
            this._restoreFocus(); 
            this.state.clickedImageElement = null; 
        } 
    }

    _resetZoomStyles(imageElement) { 
        if (imageElement instanceof HTMLImageElement) {
            imageElement.classList.remove('fullscreen-image-transition');
            imageElement.style.transform = '';
            imageElement.style.transformOrigin = '';
            imageElement.style.opacity = '';
        } else if (imageElement) {
            console.warn("⚠️ _resetZoomStyles: Received non-image element:", imageElement);
        }
    }
    
    _cleanupUIOnClose() {
        if (!this.dom) return;
        const { container, sliderWrapper, mainContainer, mainContent, html, statusLabel } = this.dom;
        const { active, isZooming, fullscreenActive, fullscreenEffectActive, sourceElementZooming, scrollGalleryMainItem } = CONFIG.SELECTORS.CLASSES_AND_SELECTORS;

        if (container) {
            container.style.display = 'none';
            container.setAttribute('hidden', 'true');
            container.setAttribute('aria-hidden', 'true');
            container.classList.remove(active, isZooming);
        }
        mainContent?.setAttribute('aria-hidden', 'false');
        html?.classList.remove(fullscreenActive);
        mainContainer?.classList.remove(fullscreenEffectActive);

        try {
            const sourceContainerSelector = `.${scrollGalleryMainItem}`;
            let sourceElement = null;
            const currentSlideData = this.visibleImageData?.[this.state.currentIndex];

            if (currentSlideData && typeof currentSlideData.originalIndex === 'number') {
                 sourceElement = document.querySelector(`${sourceContainerSelector}[data-original-index="${currentSlideData.originalIndex}"]`);
            }
            if (!sourceElement) {
                sourceElement = this.state.lastFocusedElement?.closest(sourceContainerSelector);
            }
            if (!sourceElement && this.state.clickedImageElement) {
                sourceElement = this.state.clickedImageElement?.closest(sourceContainerSelector);
            }
            
            if (sourceElement) {
                sourceElement.classList.remove(sourceElementZooming);
                sourceElement.style.opacity = '';
                sourceElement.style.visibility = '';
                sourceElement.style.pointerEvents = '';
                sourceElement.style.transition = '';
            }
        } catch (e) {
            console.warn("⚠️ Minor error removing sourceElementZooming class or styles during cleanup:", e);
        }

        if (sliderWrapper) sliderWrapper.innerHTML = '';
        if (statusLabel) statusLabel.textContent = '';
        this.visibleImageData = [];
        this.state.totalVisibleImages = 0;
        this.state.currentIndex = 0;
        clearTimeout(this.state.scrollTimeoutId);
        clearTimeout(this.state.transitionFallbackTimer);
        this.state.scrollTimeoutId = null;
        this.state.transitionFallbackTimer = null;
    }

    _closeInstantly() { if (!this.isInitialized) return; console.warn("⚠️ Closing gallery instantly."); clearTimeout(this.state.transitionFallbackTimer); this.state.transitionFallbackTimer = null; const animatingImage = this.dom?.sliderWrapper?.querySelector('.fullscreen-image-transition'); if (animatingImage instanceof HTMLImageElement) this._resetZoomStyles(animatingImage); this.state.isAnimatingZoom = false; this._cleanupUIOnClose(); this.state.isSliderOpen = false; this._restoreFocus(); this.state.clickedImageElement = null; }
    _focusCloseButton() { if (!this.dom) return; try { const closeButton = this.dom.closeButton; if (closeButton && closeButton.offsetParent !== null) { closeButton.focus({ preventScroll: true }); } else if (this.dom.container && this.dom.container.offsetParent !== null) { console.warn("⚠️ Close button not focusable. Focusing gallery container."); this.dom.container.focus({ preventScroll: true }); } else { console.warn("⚠️ Could not focus close button or gallery container (they might be hidden or not in layout)."); } } catch (e) { console.error("❌ Error setting focus on close button/container:", e); try { this.dom.body?.focus({ preventScroll: true }); } catch (be) { /* Ignore final fallback error */ } } }
    _restoreFocus() { if (!this.dom) return; const elementToRestore = this.state.lastFocusedElement; try { if (elementToRestore instanceof HTMLElement && typeof elementToRestore.focus === 'function' && document.body.contains(elementToRestore) && elementToRestore.offsetParent !== null) { elementToRestore.focus({ preventScroll: true }); } else { console.warn("⚠️ Original element to restore focus to is invalid, missing, or hidden. Focusing body."); this.dom.body.focus({ preventScroll: true }); } } catch (e) { console.error("❌ Error attempting to restore focus:", e); try { this.dom.body.focus({ preventScroll: true }); } catch (fe) { /* Ignore final fallback error */ } } finally { this.state.lastFocusedElement = null; } }
    navigate(direction) { if (!this.isInitialized || !this.dom || !this.state.isSliderOpen || this.state.isAnimatingZoom || this.state.totalVisibleImages <= 1) return; const { sliderWrapper } = this.dom; const { currentIndex, totalVisibleImages } = this.state; const newIndex = currentIndex + direction; if (newIndex < 0 || newIndex >= totalVisibleImages) return; try { const targetSlide = sliderWrapper.children[newIndex]; if (!(targetSlide instanceof HTMLElement)) { console.error(`❌ Navigate Error: Slide element at index ${newIndex} not found.`); return; } const scrollBehavior = this.prefersReducedMotion ? 'instant' : 'smooth'; const scrollLeftTarget = targetSlide.offsetLeft - (sliderWrapper.offsetWidth - targetSlide.offsetWidth) / 2; sliderWrapper.scrollTo({ left: scrollLeftTarget, behavior: scrollBehavior }); if (scrollBehavior === 'instant') { this._updateCurrentIndex(newIndex); } } catch (error) { console.error(`❌ Error during gallery navigation (direction: ${direction}):`, error); } }
    _handleSlideClick(event) { if (!this.isInitialized || !this.dom || this.state.isAnimatingZoom || !this.state.isSliderOpen) return;
        const clickedSlide = event.target?.closest(`.${CONFIG.SELECTORS.CLASSES_AND_SELECTORS.fullscreenSlide}`); if (!clickedSlide || clickedSlide.classList.contains(CONFIG.SELECTORS.CLASSES_AND_SELECTORS.isActiveSlide)) return; try { const clickedIndex = parseInt(clickedSlide.dataset.slideIndex ?? '-1', 10); if (!isNaN(clickedIndex) && clickedIndex >= 0 && clickedIndex < this.state.totalVisibleImages) { const targetSlide = this.dom.sliderWrapper.children[clickedIndex]; if (targetSlide instanceof HTMLElement) { const scrollBehavior = this.prefersReducedMotion ? 'instant' : 'smooth'; const scrollLeftTarget = targetSlide.offsetLeft - (this.dom.sliderWrapper.offsetWidth - targetSlide.offsetWidth) / 2; this.dom.sliderWrapper.scrollTo({ left: scrollLeftTarget, behavior: scrollBehavior }); if (scrollBehavior === 'instant') this._updateCurrentIndex(clickedIndex); } else console.error(`_handleSlideClick: Target slide at index ${clickedIndex} not found.`); } else if (isNaN(clickedIndex)) { console.warn("⚠️ Clicked slide missing valid data-slide-index attribute."); } } catch (e) { console.error("❌ Error handling slide click navigation:", e); } }
    _updateAccessibilityState() { if (!this.isInitialized || !this.dom) return; const { sliderWrapper, statusLabel } = this.dom; const { currentIndex, totalVisibleImages } = this.state; const imageData = this.visibleImageData;
        const { isActiveSlide } = CONFIG.SELECTORS.CLASSES_AND_SELECTORS; if (!sliderWrapper || !statusLabel) { console.warn("⚠️ Cannot update accessibility state: slider wrapper or status label missing."); return; } if (totalVisibleImages === 0 || !imageData || imageData.length === 0) { statusLabel.textContent = "No images to display."; Array.from(sliderWrapper.children).forEach(slide => slide.classList.remove(isActiveSlide)); return; } const safeCurrentIndex = Math.max(0, Math.min(currentIndex, imageData.length - 1)); const currentSlideData = imageData[safeCurrentIndex]; statusLabel.textContent = currentSlideData?.title ? `${currentSlideData.title}, slide ${safeCurrentIndex + 1} of ${totalVisibleImages}` : `Slide ${safeCurrentIndex + 1} of ${totalVisibleImages}`; Array.from(sliderWrapper.children).forEach((slide, index) => { if (!(slide instanceof HTMLElement)) return; const isActive = index === safeCurrentIndex; slide.classList.toggle(isActiveSlide, isActive); const imgData = (index < imageData.length) ? imageData[index] : null; const ariaLabel = imgData?.title ? `${imgData.title} (Slide ${index + 1} of ${totalVisibleImages})` : `Slide ${index + 1} of ${totalVisibleImages}`; slide.setAttribute('aria-label', ariaLabel); if (!slide.getAttribute('role')) slide.setAttribute('role', 'group'); if (!slide.getAttribute('aria-roledescription')) slide.setAttribute('aria-roledescription', 'slide'); }); }
    _handleScroll() { if (!this.isInitialized || !this.dom || !this.state.isSliderOpen || this.state.isAnimatingZoom) return; const wrapper = this.dom.sliderWrapper; if (!wrapper) return; clearTimeout(this.state.scrollTimeoutId); this.state.scrollTimeoutId = setTimeout(() => { if (!this.isInitialized || !this.state.isSliderOpen || this.state.isAnimatingZoom || !this.dom) return; try { const scrollLeft = wrapper.scrollLeft; const wrapperWidth = wrapper.offsetWidth; let newIndex = -1; let minDistance = Infinity; Array.from(wrapper.children).forEach((slide, index) => { if (slide instanceof HTMLElement && slide.offsetWidth > 0) { const slideCenter = slide.offsetLeft + slide.offsetWidth / 2; const wrapperCenter = scrollLeft + wrapperWidth / 2; const distance = Math.abs(slideCenter - wrapperCenter); if (distance < minDistance) { minDistance = distance; newIndex = index; } } }); if (newIndex !== -1 && newIndex !== this.state.currentIndex) { this._updateCurrentIndex(newIndex); } } catch (e) { console.error("❌ Error calculating centered slide index:", e); } }, this.animationConfig.SLIDE_UPDATE_DELAY_MS); }
    _updateCurrentIndex(newIndex) { if (newIndex >= 0 && newIndex < this.state.totalVisibleImages && newIndex !== this.state.currentIndex) { this.state.currentIndex = newIndex; this._updateAccessibilityState(); } }
    _handleKeydown(event) { if (!this.isInitialized || !this.state.isSliderOpen || this.state.isAnimatingZoom) return; let handled = false; switch (event.key) { case 'Escape': this._requestClose(); handled = true; break; case 'ArrowLeft': case 'Left': this.navigate(-1); handled = true; break; case 'ArrowRight': case 'Right': this.navigate(1); handled = true; break; case 'Tab': this._trapFocus(event); break; case 'Home': if (this.state.currentIndex > 0) { this.navigate(-this.state.currentIndex); handled = true; } break; case 'End': if (this.state.currentIndex < this.state.totalVisibleImages - 1) { this.navigate(this.state.totalVisibleImages - 1 - this.state.currentIndex); handled = true; } break; } if (handled) { event.preventDefault(); } }
    _trapFocus(event) { if (!this.dom) return; const { container } = this.dom; if (!container) return; try { const focusableElements = Array.from( container.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])') ).filter(el => el instanceof HTMLElement && el.offsetParent !== null && !el.closest('[aria-hidden="true"]')); if (focusableElements.length === 0) { event.preventDefault(); console.warn("⚠️ No focusable elements found inside modal."); return; } const firstElement = focusableElements[0]; const lastElement = focusableElements[focusableElements.length - 1]; const currentActive = document.activeElement; if (event.shiftKey) { if (currentActive === firstElement || !container.contains(currentActive)) { event.preventDefault(); lastElement.focus(); } } else { if (currentActive === lastElement || !container.contains(currentActive)) { event.preventDefault(); firstElement.focus(); } } } catch (error) { console.error("❌ Error trapping focus in gallery:", error); event.preventDefault(); } }

    _populateSlider() {
        if (!this.isInitialized || !this.dom) { console.error("❌ Cannot populate slider: Not initialized or DOM missing."); return; }
        const wrapper = this.dom.sliderWrapper;
        if (!wrapper) { console.error("❌ Cannot populate slider: Wrapper element missing."); return; }
        wrapper.innerHTML = '';
        const fragment = document.createDocumentFragment();
        const C = CONFIG.SELECTORS.CLASSES_AND_SELECTORS;
        const IMG_WIDTHS = this.galleryConfig.IMAGE_WIDTHS_FOR_SRCSET;

        if (this.visibleImageData.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.textContent = "No images to display.";
            emptyMsg.className = C.galleryEmptyMessage;
            emptyMsg.setAttribute('role', 'status');
            fragment.appendChild(emptyMsg);
        } else {
            this.visibleImageData.forEach((imageData, index) => {
                const slide = document.createElement('div');
                slide.className = C.fullscreenSlide;
                slide.setAttribute('role', 'group');
                slide.setAttribute('aria-roledescription', 'slide');
                slide.dataset.slideIndex = String(index);
                slide.setAttribute('aria-label', `Loading slide ${index + 1}`);

                const picture = document.createElement('picture');
                const sourceWebp = document.createElement('source');
                sourceWebp.type = 'image/webp';
                sourceWebp.srcset = generateSrcset(imageData.src, IMG_WIDTHS);
                sourceWebp.sizes = `calc(var(--slide-width-percent) - 40px)`;

                const img = document.createElement('img');
                const imgTitle = imageData.title || `Image ${index + 1}`;
                img.alt = imgTitle;
                img.loading = 'lazy';
                img.decoding = 'async';
                img.src = imageData.src;

                img.onerror = () => {
                    console.error(`❌ Failed to load fullscreen image: ${imageData.src}`);
                    slide.classList.add(C.slideLoadError);
                    picture.classList.add(C.imageLoadError);
                    while (slide.firstChild) { slide.removeChild(slide.firstChild); }
                    slide.appendChild(createErrorNode(imgTitle, true));
                    slide.setAttribute('aria-label', `Error loading slide ${index + 1}: ${imgTitle}`);
                };
                img.onload = () => {
                    slide.classList.add(C.slideLoaded);
                };

                picture.appendChild(sourceWebp);
                picture.appendChild(img);
                slide.appendChild(picture);
                fragment.appendChild(slide);
            });
        }
        wrapper.appendChild(fragment);
        this._updateAccessibilityState();
    }

    handleResize() { if (!this.isInitialized || !this.state.isSliderOpen || !this.dom) return; if (this.state.isAnimatingZoom) { console.warn("⚠️ Resize detected during zoom animation. Force closing fullscreen gallery."); this._closeInstantly(); return; } const wrapper = this.dom.sliderWrapper; const currentIndex = this.state.currentIndex; if (wrapper && currentIndex >= 0 && currentIndex < wrapper.children.length) { const currentSlide = wrapper.children[currentIndex]; if (currentSlide instanceof HTMLElement) { try { const scrollLeftTarget = currentSlide.offsetLeft - (wrapper.offsetWidth - currentSlide.offsetWidth) / 2; wrapper.scrollTo({ left: scrollLeftTarget, behavior: 'instant' }); this._updateAccessibilityState(); } catch (error) { console.error("❌ Error recentering slider on resize:", error); this._closeInstantly(); } } else { console.warn("⚠️ Could not find current slide element during resize recentering."); } } else { console.warn("⚠️ Could not recenter slider on resize: Invalid state or elements."); } }
    destroy() { if (!this.isInitialized || !this.dom) { return; } if (this.state.isSliderOpen || this.state.isAnimatingZoom) { this._closeInstantly(); } try { this.dom.closeButton?.removeEventListener('click', this.state.boundHandlers.closeClick); this.dom.container?.removeEventListener('keydown', this.state.boundHandlers.keydown); if (this.state.boundHandlers.scroll) { this.dom.sliderWrapper?.removeEventListener('scroll', this.state.boundHandlers.scroll); } if (this.state.boundHandlers.slideClick) { this.dom.sliderWrapper?.removeEventListener('click', this.state.boundHandlers.slideClick); }
    } catch (e) { console.error("Error removing gallery event listeners during destroy:", e); } this.state.boundHandlers.scroll?.cancel?.(); clearTimeout(this.state.scrollTimeoutId); clearTimeout(this.state.transitionFallbackTimer); this.visibleImageData = []; this.state.currentIndex = 0; this.state.totalVisibleImages = 0; this.state.isAnimatingZoom = false; this.state.isSliderOpen = false; this.state.lastFocusedElement = null; this.state.clickedImageElement = null; this.state.scrollTimeoutId = null; this.state.transitionFallbackTimer = null; this.state.isZoomInTransitionAttached = false; this.state.isZoomOutTransitionAttached = false;
    this.dom = null; this.isInitialized = false; }
}


// ==========================================================================
// ScrollModeGallery Class - Manages the two-column scrollable project gallery.
// ==========================================================================
class ScrollModeGallery {
    dom = null;
    galleryInstance = null;
    projectsData = [];
    config;
    animationConfig;
    prefersReducedMotion = false;
    desktopMediaQuery = null;
    isDesktop = false;
    state = { y: { curr: 0, targ: 0, start: 0, lastTouchY: 0 }, activeIndex: 0, items: [], filteredItems: [], maxScroll: 0, parallaxRatio: 0, mainHeight: 0, containerHeight: 0, thumbContainerHeight: 0, isDragging: false, snapTimeout: null, rafId: null, activeFilter: CONFIG.DEFAULTS.FILTER, isInteracting: false, interactionTimeout: null, isTouchActive: false, };
    boundHandlers = {};
    isInitialized = false;

    constructor(galleryInstance) {
        this.isInitialized = false;
        const requiredKeys = ['scrollModeGallery', 'thumbnailColumn', 'mainImageColumn', 'thumbnailScroller', 'mainImageScroller', 'activeCursor', 'scrollGalleryStatus'];
        const allEssentialFound = requiredKeys.every(key => domElements?.[key]);

        if (!allEssentialFound || !domElements) {
            console.error(`‼️ ScrollModeGallery init failed: Missing essential DOM element(s). Scroll gallery disabled.`);
            return;
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
                console.warn("⚠️ ScrollModeGallery initialized without valid fullscreen Gallery instance. Opening images will be disabled.");
            }

            this.projectsData = PROJECTS_DATA;
            this.config = CONFIG.SCROLL_MODE;
            this.animationConfig = CONFIG.ANIMATION;
            this.prefersReducedMotion = prefersReducedMotion();
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
                debouncedOnResize: debounce(this._onResizeInternal.bind(this), CONFIG.ANIMATION.RESIZE_DEBOUNCE_MS),
                onThumbnailClick: this._onThumbnailClick.bind(this),
                onMainImageClick: this._onMainImageClick.bind(this),
                onMediaQueryChange: this._onMediaQueryChange.bind(this),
            };

            this.isInitialized = true;
        } catch (error) {
            console.error("❌ Critical error during ScrollModeGallery construction:", error);
            this.isInitialized = false;
            this.dom = null;
        }
    }

    init() { if (!this.isInitialized || !this.dom) { console.warn("⚠️ ScrollModeGallery init skipped: Not initialized."); return; } try { this.dom.container.tabIndex = 0; this.desktopMediaQuery?.addEventListener('change', this.boundHandlers.onMediaQueryChange); this.applyFilter(this.state.activeFilter, true); this._bindContainerEvents(); } catch (e) { console.error("❌ Error during ScrollModeGallery initialization:", e); this.isInitialized = false; this._unbindAllEvents(); if (this.dom?.container) this.dom.container.tabIndex = -1; } }
    applyFilter(filterCategory, isInitialLoad = false) { if (!this.isInitialized || (!isInitialLoad && filterCategory === this.state.activeFilter)) return; try { this._stopAnimationLoop(); this._clearSnapTimeout(); this.state.isDragging = false; this.state.isInteracting = false; this.state.isTouchActive = false; clearTimeout(this.state.interactionTimeout); this.state.interactionTimeout = null; this.dom?.container?.classList.remove(CONFIG.SELECTORS.CLASSES_AND_SELECTORS.isDragging); this._removeWindowTouchListeners(); this.state.activeFilter = filterCategory; this.state.y.curr = 0; this.state.y.targ = 0; this.state.activeIndex = 0; this._applyTransformsDOM(0); if (this.dom?.cursor) this.dom.cursor.style.opacity = '0'; this.state.filteredItems = this.projectsData.filter(p => filterCategory === CONFIG.DEFAULTS.FILTER || p.category === filterCategory ); this._renderItems(); if (!isInitialLoad && this.dom?.container) { requestAnimationFrame(() => { if (this.isInitialized && this.dom?.container) { this.dom.container.focus({ preventScroll: true }); } }); } } catch (e) { console.error(`❌ Error applying filter '${filterCategory}':`, e); this.state.filteredItems = []; this._renderItems(); } }
    
    async _renderItems() { // Made async
        if (!this.dom) return;
        this._unbindItemListeners();
        if (this.dom.thumbScroller) this.dom.thumbScroller.innerHTML = '';
        if (this.dom.mainScroller) this.dom.mainScroller.innerHTML = '';
        this.state.items = [];

        if (this.state.filteredItems.length === 0) {
            if (this.dom.mainScroller) {
                const emptyMsgPara = document.createElement('p');
                emptyMsgPara.className = CONFIG.SELECTORS.CLASSES_AND_SELECTORS.galleryEmptyMessage;
                emptyMsgPara.setAttribute('role', 'status');
                emptyMsgPara.textContent = `No projects found for '${this.state.activeFilter}'.`;
                this.dom.mainScroller.appendChild(emptyMsgPara);
            }
            // Use requestAnimationFrame for DOM updates after clearing
            requestAnimationFrame(async () => { // Made async
                if (!this.isInitialized) return;
                try {
                    await this._calculateMetrics(); // Await metrics calculation
                    this._setActiveItem(0, true);
                    this._updateCursorPositionDOM();
                } catch (e) {
                     console.error("❌ Error during empty gallery render setup:", e);
                     this._resetMetrics(); // Ensure reset on error
                }
            });
            return;
        }

        const thumbFragment = document.createDocumentFragment();
        const mainFragment = document.createDocumentFragment();
        this.state.filteredItems.forEach((project, index) => {
            try {
                const thumbDiv = this._createItemElement('thumb', project, index);
                thumbFragment.appendChild(thumbDiv);
                const mainDiv = this._createItemElement('main', project, index);
                mainFragment.appendChild(mainDiv);
                this.state.items.push({ thumb: thumbDiv, main: mainDiv, data: project, index: index, thumbY: 0, mainY: 0 });
            } catch (e) {
                console.error(`❌ Error creating item elements for index ${index}:`, project, e);
            }
        });

        if (this.dom.thumbScroller) this.dom.thumbScroller.appendChild(thumbFragment);
        if (this.dom.mainScroller) this.dom.mainScroller.appendChild(mainFragment);
        this._bindItemListeners();

        // Use requestAnimationFrame for DOM updates after adding items
        requestAnimationFrame(async () => { // Made async
            if (!this.isInitialized) return;
            try {
                await this._calculateMetrics(); // Await metrics calculation
                if (this.state.items.length === 0) {
                    console.warn("⚠️ No valid items after metric calculation (check CSS or element visibility).");
                    this._resetMetrics();
                    this._setActiveItem(0, true);
                    this._updateCursorPositionDOM();
                    return;
                }
                this.state.activeIndex = Math.max(0, Math.min(this.state.activeIndex, this.state.items.length - 1));
                this._setActiveItem(this.state.activeIndex, true);
                this._snapToIndex(this.state.activeIndex);
                const initialY = this.state.y.targ;
                this.state.y.curr = initialY;
                this._applyTransformsDOM(initialY);
                this._updateCursorPositionDOM();
            } catch (e) {
                console.error("❌ Error during post-render setup (metrics/positioning):", e);
                // this.state.items = []; // Avoid clearing items if metrics failed but items were rendered
                if (this.dom?.thumbScroller) this.dom.thumbScroller.innerHTML = ''; // Clear if render failed badly
                if (this.dom?.mainScroller) this.dom.mainScroller.innerHTML = '';
                this._resetMetrics();
                this._setActiveItem(0, true);
                this._updateCursorPositionDOM();
            }
        });
    }


    _createItemElement(type, project, index) {
        if (!project || typeof project.src !== 'string') {
            throw new Error(`Invalid project data for ${type} at index ${index}`);
        }
        const div = document.createElement('div');
        const isThumb = type === 'thumb';
        const C = CONFIG.SELECTORS.CLASSES_AND_SELECTORS;
        const IMG_WIDTHS = CONFIG.GALLERY.IMAGE_WIDTHS_FOR_SRCSET;

        div.className = isThumb ? C.scrollGalleryThumbItem : C.scrollGalleryMainItem;
        div.dataset.index = String(index);
        if (typeof project.originalIndex === 'number') {
            div.dataset.originalIndex = String(project.originalIndex);
        }
        const title = project.title || 'Untitled Project';
        div.setAttribute('aria-label', isThumb ? `Thumbnail: ${title}` : `View ${title}`);
        div.tabIndex = -1;

        const picture = document.createElement('picture');
        const sourceWebp = document.createElement('source');
        sourceWebp.type = 'image/webp';
        sourceWebp.srcset = generateSrcset(project.src, IMG_WIDTHS);

        if (isThumb) {
            sourceWebp.sizes = "(max-width: 61.9375rem) 90px, 130px";
        } else {
            sourceWebp.sizes = `(max-width: 61.9375rem) calc(100vw - 3.125rem), ` +
                               `(min-width: 62rem) and (max-width: 75rem) calc(100vw - 25.9375rem), ` +
                               `(min-width: 75.0625rem) calc(100vw - 30.9375rem)`;
        }

        const img = document.createElement('img');
        img.alt = isThumb ? `Thumbnail for ${title}` : title;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.src = project.src;

        img.onerror = () => {
            console.error(`❌ Failed to load ${type} image: ${project.src}`);
            div.classList.add(isThumb ? C.scrollGalleryThumbItemError : C.scrollGalleryMainItemError);
            picture.classList.add(C.imageLoadError);
            while (div.firstChild) { div.removeChild(div.firstChild); }
            div.appendChild(createErrorNode(title)); 
            div.setAttribute('aria-label', `Error loading ${type}: ${title}`);
        };
        
        picture.appendChild(sourceWebp);
        picture.appendChild(img);
        div.appendChild(picture);
        return div;
    }

    // --- Metrics Calculation Helpers ---
    _getMainItemDimensions(firstMain, retryCount = 0) {
        return new Promise(resolve => {
            if (!firstMain) {
                console.error("❌ Cannot find first main item element for metrics calculation.");
                resolve({ height: 0, margin: 0, marginTop: 0 });
                return;
            }
            let mainStyle;
            try { mainStyle = getComputedStyle(firstMain); }
            catch (styleError) { 
                console.error("❌ Error getting computed styles for main item metrics:", styleError);
                resolve({ height: 0, margin: 0, marginTop: 0 });
                return;
            }

            const mainH = firstMain.offsetHeight;
            const MAX_RETRIES = this.config.MAX_METRIC_RETRIES;
            const RETRY_DELAY = this.config.METRIC_RETRY_DELAY;

            if (mainH <= 0 && retryCount < MAX_RETRIES) {
                console.warn(`⚠️ Main item height zero during metric calculation. Retrying (#${retryCount + 1})... MainH: ${mainH}`);
                setTimeout(() => {
                    // Recursively call and resolve with its result
                    this._getMainItemDimensions(firstMain, retryCount + 1).then(resolve);
                }, RETRY_DELAY);
                return;
            } else if (mainH <= 0) {
                console.error(`❌ Main item height still zero after ${MAX_RETRIES} retries (MainH: ${mainH}). Using 0. Check element visibility and CSS.`);
                resolve({ height: 0, margin: 0, marginTop: 0 });
                return;
            }
            
            const vMarginMain = parseFloat(mainStyle.marginTop || '0') + parseFloat(mainStyle.marginBottom || '0');
            const marginTopMain = parseFloat(mainStyle.marginTop || '0');
            resolve({ height: Math.max(1, mainH + vMarginMain), margin: vMarginMain, marginTop: marginTopMain });
        });
    }

    _getThumbItemDimensions(firstThumb, retryCount = 0) {
        return new Promise(resolve => {
            if (!this.isDesktop || !firstThumb) {
                resolve({ height: 0, margin: 0, marginTop: 0 });
                return;
            }
            let thumbStyle;
            try { thumbStyle = getComputedStyle(firstThumb); }
            catch (styleError) { 
                console.warn("Could not get style for thumb, may be hidden", styleError);
                resolve({ height: 0, margin: 0, marginTop: 0 });
                return;
            }

            const thumbH = firstThumb.offsetHeight;
            const MAX_RETRIES = this.config.MAX_METRIC_RETRIES;
            const RETRY_DELAY = this.config.METRIC_RETRY_DELAY;

            if (thumbH <= 0 && retryCount < MAX_RETRIES) {
                console.warn(`⚠️ Desktop Thumbnail height zero during metric calculation. Retrying (#${retryCount + 1})... ThumbH: ${thumbH}`);
                setTimeout(() => {
                     this._getThumbItemDimensions(firstThumb, retryCount + 1).then(resolve);
                }, RETRY_DELAY);
                return;
            } else if (thumbH <= 0) {
                console.warn(`⚠️ Desktop Thumbnail height still zero after ${MAX_RETRIES} retries (ThumbH: ${thumbH}).`);
                resolve({ height: 0, margin: 0, marginTop: 0 });
                return;
            }

            const vMarginThumb = parseFloat(thumbStyle.marginTop || '0') + parseFloat(thumbStyle.marginBottom || '0');
            const marginTopThumb = parseFloat(thumbStyle.marginTop || '0');
            resolve({ height: Math.max(0, thumbH + vMarginThumb), margin: vMarginThumb, marginTop: marginTopThumb });
        });
    }

    async _calculateMetrics() { // Made async
        if (!this.dom) { this._resetMetrics(); return; }
        try {
            this.state.containerHeight = this.dom.mainCol?.offsetHeight || 0;
            this.state.thumbContainerHeight = this.isDesktop ? (this.dom.thumbCol?.offsetHeight || 0) : 0;

            if (this.state.items.length === 0) {
                this._resetMetrics(); return;
            }
            
            // Await the promises from dimension helpers
            const mainItemDims = await this._getMainItemDimensions(this.state.items[0]?.main);
            if (mainItemDims.height <= 0) { 
                 console.error("❌ Main item dimensions could not be resolved. Resetting metrics.");
                this._resetMetrics(); return;
            }
            this.state.mainHeight = mainItemDims.height; 

            const thumbItemDims = await this._getThumbItemDimensions(this.state.items[0]?.thumb);
            
            let currentThumbY = 0;
            let currentMainY = 0;

            this.state.items.forEach(item => {
                item.mainY = currentMainY + mainItemDims.marginTop;
                currentMainY += mainItemDims.height; 
                if (this.isDesktop && thumbItemDims.height > 0) {
                    item.thumbY = currentThumbY + thumbItemDims.marginTop;
                    currentThumbY += thumbItemDims.height; 
                } else {
                    item.thumbY = 0;
                }
            });

            const mainContentHeight = this.state.items.length * mainItemDims.height - (this.state.items.length > 0 ? mainItemDims.margin : 0);
            this.state.maxScroll = Math.max(0, mainContentHeight - this.state.containerHeight);

            this.state.parallaxRatio = 0;
            if (this.isDesktop && this.state.maxScroll > 0 && thumbItemDims.height > 0 && this.state.thumbContainerHeight > 0) {
                const thumbContentHeight = this.state.items.length * thumbItemDims.height - (this.state.items.length > 0 ? thumbItemDims.margin : 0);
                const totalThumbScrollableHeight = thumbContentHeight - this.state.thumbContainerHeight;
                if (totalThumbScrollableHeight > 0) {
                    this.state.parallaxRatio = totalThumbScrollableHeight / this.state.maxScroll;
                }
            }

            if (isNaN(this.state.parallaxRatio) || !isFinite(this.state.parallaxRatio)) {
                console.warn(`⚠️ Invalid parallax ratio calculated (${this.state.parallaxRatio}), defaulting to 0.`);
                this.state.parallaxRatio = 0;
            }

        } catch (e) {
            console.error("❌ Error calculating scroll gallery metrics:", e);
            this._resetMetrics();
            // Re-throw or handle more gracefully if this error should stop further processing
            // For now, _resetMetrics is the main recovery.
        }
    }


    _resetMetrics() { this.state.maxScroll = 0; this.state.parallaxRatio = 0; this.state.mainHeight = 0; this.state.containerHeight = this.dom?.mainCol?.offsetHeight || 0; this.state.thumbContainerHeight = this.isDesktop ? (this.dom?.thumbCol?.offsetHeight || 0) : 0; this.state.items.forEach(item => { item.thumbY = 0; item.mainY = 0; }); if (this.dom?.cursor) { this.dom.cursor.style.height = '0px'; this.dom.cursor.style.opacity = '0'; this.dom.cursor.style.transform = 'translateY(0px)'; } }
    _bindContainerEvents() { this._unbindContainerEvents(); if (!this.dom) return; this.dom.container.addEventListener('wheel', this.boundHandlers.onWheel, { passive: false }); this.dom.container.addEventListener('touchstart', this.boundHandlers.onTouchStart, { passive: false }); this.dom.container.addEventListener('keydown', this.boundHandlers.onKeyDown); }
    _unbindContainerEvents() { if (!this.dom) return; this.dom.container.removeEventListener('wheel', this.boundHandlers.onWheel); this.dom.container.removeEventListener('touchstart', this.boundHandlers.onTouchStart); this.dom.container.removeEventListener('keydown', this.boundHandlers.onKeyDown); this._removeWindowTouchListeners(); }
    _addWindowTouchListeners() { window.addEventListener('touchmove', this.boundHandlers.onTouchMove, { passive: false }); window.addEventListener('touchend', this.boundHandlers.onTouchEnd, { passive: true }); window.addEventListener('touchcancel', this.boundHandlers.onTouchEnd, { passive: true }); }
    _removeWindowTouchListeners() { window.removeEventListener('touchmove', this.boundHandlers.onTouchMove); window.removeEventListener('touchend', this.boundHandlers.onTouchEnd); window.removeEventListener('touchcancel', this.boundHandlers.onTouchEnd); }
    _bindItemListeners() { this.state.items.forEach(item => { item.thumb?.addEventListener('click', this.boundHandlers.onThumbnailClick); item.main?.addEventListener('click', this.boundHandlers.onMainImageClick); }); }
    _unbindItemListeners() { this.state.items.forEach(item => { item.thumb?.removeEventListener('click', this.boundHandlers.onThumbnailClick); item.main?.removeEventListener('click', this.boundHandlers.onMainImageClick); }); }
    _unbindAllEvents() { this._unbindContainerEvents(); this._unbindItemListeners(); this.desktopMediaQuery?.removeEventListener('change', this.boundHandlers.onMediaQueryChange); }
    
    _update() {
        if (!this.isInitialized || !this.dom) {
            this._stopAnimationLoop();
            return;
        }

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

                this.state.rafId = requestAnimationFrame(() => {
                    if (!this.isInitialized || !this.dom) return; 

                    this._applyTransformsDOM(this.state.y.curr); // Use the calculated currentY
                    this._updateCursorPositionDOM();

                    if (this.isInitialized) { 
                        const currentDeltaLoop = this.state.y.targ - this.state.y.curr; // Recheck delta
                        if (Math.abs(currentDeltaLoop) > this.animationConfig.UPDATE_EPSILON || this.state.isInteracting) {
                             this.state.rafId = requestAnimationFrame(this.boundHandlers.update);
                        } else {
                            if (this.state.y.curr !== this.state.y.targ) {
                                this._applyTransformsDOM(this.state.y.targ);
                                this._updateCursorPositionDOM();
                            }
                            this._stopAnimationLoop();
                        }
                    }
                });
            } else {
                if (this.state.y.curr !== this.state.y.targ) {
                    this.state.y.curr = this.state.y.targ; 
                    requestAnimationFrame(() => {
                        if (!this.isInitialized || !this.dom) return;
                        this._applyTransformsDOM(this.state.y.targ);
                        this._updateCursorPositionDOM();
                    });
                }
                this._stopAnimationLoop();
            }
        } catch (e) {
            console.error("❌ Error in scroll gallery update loop:", e);
            this._stopAnimationLoop();
        }
    }


    _startAnimationLoop() { if (this.isInitialized && !this.state.rafId) { if ((this.isDesktop && !this.prefersReducedMotion && this.state.maxScroll > 0) || this.state.isInteracting) { this.state.rafId = requestAnimationFrame(this.boundHandlers.update); } } }
    _stopAnimationLoop() { if (this.state.rafId) { cancelAnimationFrame(this.state.rafId); this.state.rafId = null; } }
    
    _applyTransformsDOM(currentY) {
        if (!this.dom || !this.isInitialized) return;
        const thumbY = (this.isDesktop && this.dom.thumbScroller && this.state.parallaxRatio > 0) ? currentY * this.state.parallaxRatio : 0;
        
        if (this.dom.mainScroller) {
            this.dom.mainScroller.style.transform = `translateY(-${currentY.toFixed(2)}px)`;
        }
        if (this.dom.thumbScroller) {
            const finalThumbTransformY = (this.isDesktop && this.state.parallaxRatio > 0) ? thumbY : 0;
            this.dom.thumbScroller.style.transform = `translateY(-${finalThumbTransformY.toFixed(2)}px)`;
        }
    }

    _updateActiveIndexBasedOnScroll(currentY) { if (!this.isInitialized) return; if (this.state.items.length === 0 || this.state.mainHeight <= 0) { if (this.state.activeIndex !== 0) this._setActiveItem(0); return; } let closestIndex = 0; let minDiff = Infinity; const viewportCenter = currentY + this.state.containerHeight / 2; for (let i = 0; i < this.state.items.length; i++) { const item = this.state.items[i]; if (item && typeof item.mainY === 'number') { const itemCenter = item.mainY + this.state.mainHeight / 2; const diff = Math.abs(itemCenter - viewportCenter); if (diff < minDiff) { minDiff = diff; closestIndex = i; } } } const newActiveIndex = Math.max(0, Math.min(closestIndex, this.state.items.length - 1)); if (newActiveIndex !== this.state.activeIndex) { this._setActiveItem(newActiveIndex); } }
    
    _setActiveItem(index, immediate = false) {
        if (!this.isInitialized || !this.dom?.thumbScroller) return;
        const { active } = CONFIG.SELECTORS.CLASSES_AND_SELECTORS;
    
        if (this.state.items.length === 0) {
            const currentActiveThumb = this.isDesktop ? this.dom.thumbScroller.querySelector(`.${active}`) : null;
            if (this.state.activeIndex !== 0 || currentActiveThumb) {
                if (currentActiveThumb) {
                    currentActiveThumb.classList.remove(active);
                    currentActiveThumb.removeAttribute('aria-current');
                }
                this.state.activeIndex = 0;
                if (this.isDesktop && this.dom.cursor) this.dom.cursor.style.opacity = '0';
                if (this.dom.status) this.dom.status.textContent = "No items to display.";
            }
            return;
        }
    
        index = Math.max(0, Math.min(index, this.state.items.length - 1));
        if (index === this.state.activeIndex && !immediate) return;
    
        const oldIndex = this.state.activeIndex;
        const newItem = this.state.items[index];
        const oldItem = this.state.items[oldIndex];
    
        if (this.isDesktop) {
            oldItem?.thumb?.classList.remove(active);
            oldItem?.thumb?.removeAttribute('aria-current');
        }
    
        if (newItem) {
            if (this.isDesktop && newItem.thumb) {
                newItem.thumb.classList.add(active);
                newItem.thumb.setAttribute('aria-current', 'true');
            }
            this.state.activeIndex = index;
            if (this.dom.status) {
                const title = newItem.data?.title || `Item ${index + 1}`;
                this.dom.status.textContent = `${title}, item ${index + 1} of ${this.state.items.length}`;
            }
        } else {
            console.warn(`⚠️ _setActiveItem: Could not find item at index ${index}.`);
            if (this.isDesktop && oldItem?.thumb) {
                oldItem.thumb.classList.add(active);
                oldItem.thumb.setAttribute('aria-current', 'true');
                this.state.activeIndex = oldIndex; 
                 if (this.dom.status && oldItem.data) {
                    const oldTitle = oldItem.data.title || `Item ${oldIndex + 1}`;
                    this.dom.status.textContent = `${oldTitle}, item ${oldIndex + 1} of ${this.state.items.length}`;
                }
            } else {
                this.state.activeIndex = -1; 
                if (this.dom.status) this.dom.status.textContent = "Error selecting item.";
            }
        }
    
        if (immediate) { 
            this._updateCursorPositionDOM();
        }
    }

    _updateCursorPositionDOM() { // Removed nested rAF
        if (!this.dom?.cursor || !this.isInitialized || !this.isDesktop) {
            if (this.dom?.cursor && this.dom.cursor.style.opacity !== '0') {
                this.dom.cursor.style.opacity = '0';
                this.dom.cursor.style.transform = 'translateY(0px)';
                this.dom.cursor.style.height = '0px';
            }
            return;
        }
    
        if (this.state.items.length === 0 || this.state.activeIndex < 0 || this.state.activeIndex >= this.state.items.length) {
            if (this.dom.cursor.style.opacity !== '0') {
                this.dom.cursor.style.opacity = '0';
                this.dom.cursor.style.transform = 'translateY(0px)';
                this.dom.cursor.style.height = '0px';
            }
            return;
        }
    
        const activeItem = this.state.items[this.state.activeIndex];
        if (!activeItem || typeof activeItem.thumbY !== 'number') { 
             if (this.dom.cursor.style.opacity !== '0') {
                this.dom.cursor.style.opacity = '0';
             }
             return;
        }

        const effectiveParallaxRatio = this.state.parallaxRatio > 0 ? this.state.parallaxRatio : 0;
        const cursorTargetY = activeItem.thumbY - (this.state.y.curr * effectiveParallaxRatio);
        let currentThumbHeight = 0;
        const activeThumbElement = activeItem.thumb;
    
        if (activeThumbElement instanceof HTMLElement) {
            currentThumbHeight = activeThumbElement.offsetHeight;
        }
    
        const finalCursorHeight = Math.max(0, currentThumbHeight);
    
        this.dom.cursor.style.transform = `translateY(${cursorTargetY.toFixed(2)}px)`;
        this.dom.cursor.style.height = `${finalCursorHeight}px`;
    
        if (finalCursorHeight > 0 && this.dom.cursor.style.opacity !== '1') {
            this.dom.cursor.style.opacity = '1';
        } else if (finalCursorHeight === 0 && this.dom.cursor.style.opacity !== '0') {
            this.dom.cursor.style.opacity = '0';
        }
    }

    _onWheel(event) { if (!this.isInitialized || this.state.maxScroll <= 0) return; event.preventDefault(); this._clearSnapTimeout(); this.state.isInteracting = true; clearTimeout(this.state.interactionTimeout); this.state.interactionTimeout = setTimeout(() => { this.state.isInteracting = false; if (!this.state.isDragging) this._triggerSnap(); }, 150); this._updateTargetScroll(event.deltaY * this.config.WHEEL_MULTIPLIER); this._startAnimationLoop(); }
    _onTouchStart(event) { if (!this.isInitialized || !this.dom || this.state.maxScroll <= 0 || !(event.target instanceof Node) || !this.dom.container?.contains(event.target)) return; if (event.touches.length !== 1) { if (this.state.isTouchActive) this._onTouchEnd(event); return; } event.preventDefault(); this._clearSnapTimeout(); this.state.isDragging = true; this.state.isInteracting = true; this.state.isTouchActive = true; this.state.y.start = event.touches[0].clientY; this.state.y.lastTouchY = this.state.y.start; this.dom.container.classList.add(CONFIG.SELECTORS.CLASSES_AND_SELECTORS.isDragging); this._addWindowTouchListeners(); this._startAnimationLoop(); }
    _onTouchMove(event) { if (!this.state.isTouchActive || event.touches.length !== 1) return; event.preventDefault(); const currentY = event.touches[0].clientY; const delta = (this.state.y.lastTouchY - currentY) * this.config.DRAG_MULTIPLIER; this._updateTargetScroll(delta); this.state.y.lastTouchY = currentY; }
    _onTouchEnd(event) { if (!this.state.isTouchActive) return; if (event.touches.length === 0) { this.state.isDragging = false; this.state.isInteracting = false; this.state.isTouchActive = false; clearTimeout(this.state.interactionTimeout); this.dom?.container?.classList.remove(CONFIG.SELECTORS.CLASSES_AND_SELECTORS.isDragging); this._removeWindowTouchListeners(); this._triggerSnap(); } }
    _onKeyDown(event) { if (!this.isInitialized || !this.dom || this.state.items.length === 0) return; let targetIndex = this.state.activeIndex; let shouldSnap = false; let handled = false; const itemsPerPage = (this.state.mainHeight > 0) ? Math.max(1, Math.floor(this.state.containerHeight / this.state.mainHeight)) : 1; switch (event.key) { case 'ArrowDown': case 'Down': targetIndex = Math.min(targetIndex + 1, this.state.items.length - 1); shouldSnap = true; handled = true; break; case 'ArrowUp': case 'Up': targetIndex = Math.max(targetIndex - 1, 0); shouldSnap = true; handled = true; break; case 'PageDown': targetIndex = Math.min(targetIndex + itemsPerPage, this.state.items.length - 1); shouldSnap = true; handled = true; break; case 'PageUp': targetIndex = Math.max(targetIndex - itemsPerPage, 0); shouldSnap = true; handled = true; break; case 'Home': targetIndex = 0; shouldSnap = true; handled = true; break; case 'End': targetIndex = this.state.items.length - 1; shouldSnap = true; handled = true; break; case 'Enter': case ' ': const activeItemMain = this.state.items[this.state.activeIndex]?.main; if (activeItemMain) { this._onMainImageClick({ currentTarget: activeItemMain }); handled = true; } break; default: return; } if (shouldSnap && targetIndex !== this.state.activeIndex) { this._clearSnapTimeout(); this._setActiveItem(targetIndex); this._snapToIndex(targetIndex); this._startAnimationLoop(); } if (handled) { event.preventDefault(); } }
    
    async _onMediaQueryChange(event) { // Made async
        if (!this.isInitialized) return;
        const oldIsDesktop = this.isDesktop;
        this.isDesktop = event.matches;
        if (oldIsDesktop === this.isDesktop) return;
        console.log(`%cScrollModeGallery: MediaQuery changed. Is Desktop: ${this.isDesktop}`, "color: blue; font-weight: bold;");
        this._stopAnimationLoop();
        try {
            await this._calculateMetrics(); // Await metrics
            if (!this.isInitialized) return; // Check again after await
            this.state.activeIndex = Math.max(0, Math.min(this.state.activeIndex, this.state.items.length - 1));
            this._snapToIndex(this.state.activeIndex);
            this.state.y.curr = this.state.y.targ;
            this._setActiveItem(this.state.activeIndex, true); 
            this._applyTransformsDOM(this.state.y.curr); 
            this._updateCursorPositionDOM(); 
            if (this.isDesktop && !this.prefersReducedMotion && this.state.items.length > 0 && this.state.maxScroll > 0) {
                this._startAnimationLoop();
            }
        } catch (e) {
            console.error("❌ Error handling media query change after metrics calculation:", e);
            this._resetMetrics(); // Fallback
        }
    }

    handleResize() { if (this.isInitialized) { this.boundHandlers.debouncedOnResize(); } }
    
    async _onResizeInternal() { // Made async
        if (!this.isInitialized) return;
        console.log("%cScrollModeGallery: Resize detected.", "color: blue;");
        this._stopAnimationLoop();
        const oldActiveIndex = this.state.activeIndex;
    
        try {
            await this._calculateMetrics(); // Await metrics
            if (!this.isInitialized) return; // Check again after await
    
            if (this.state.items.length === 0) {
                this.state.y.curr = 0;
                this.state.y.targ = 0;
                this.state.activeIndex = 0;
                this._setActiveItem(0, true);
                this._applyTransformsDOM(0);
                this._updateCursorPositionDOM();
                return;
            }
    
            const newActiveIndex = Math.max(0, Math.min(oldActiveIndex, this.state.items.length - 1));
            this.state.activeIndex = newActiveIndex; 
            this._snapToIndex(newActiveIndex);
            this.state.y.curr = this.state.y.targ; 
            
            this._setActiveItem(newActiveIndex, true); 
            this._applyTransformsDOM(this.state.y.curr); 
            this._updateCursorPositionDOM(); 

            if (this.isDesktop && !this.prefersReducedMotion && this.state.items.length > 0 && this.state.maxScroll > 0) {
                this._startAnimationLoop();
            }
        } catch (e) {
            console.error("❌ Error handling resize after metrics calculation:", e);
            this._resetMetrics(); // Fallback
        }
    }

    _updateTargetScroll(delta) { this.state.y.targ += delta; this.state.y.targ = Math.max(0, Math.min(this.state.y.targ, this.state.maxScroll)); }
    _onThumbnailClick(event) { if (!this.isInitialized || !(event.currentTarget instanceof HTMLElement) || !this.isDesktop) return; try { const index = parseInt(event.currentTarget.dataset.index ?? '-1', 10); if (isNaN(index) || index < 0 || index >= this.state.items.length) { console.warn(`⚠️ Invalid index on thumbnail click: ${event.currentTarget.dataset.index}`); return; } if (index !== this.state.activeIndex) { this._clearSnapTimeout(); this._setActiveItem(index); this._snapToIndex(index); this._startAnimationLoop(); } } catch (e) { console.error("❌ Error handling thumbnail click:", e); } }
    _onMainImageClick(event) { if (!this.isInitialized || !(event.currentTarget instanceof HTMLElement)) return; const clickedElement = event.currentTarget; try { const index = parseInt(clickedElement.dataset.index ?? '-1', 10); if (isNaN(index) || index < 0 || index >= this.state.items.length) { console.warn(`⚠️ Invalid index on main image click: ${clickedElement.dataset.index}`); return; } const item = this.state.items[index]; if (!item || !item.data || !item.main) { console.error(`❌ Item data or main element for index ${index} not found.`); return; } if (index === this.state.activeIndex) { if (this.galleryInstance?.isInitialized) { const imageElement = item.main.querySelector('img'); if (!imageElement) { console.error(`❌ Image element within main item ${index} not found.`); return; } const fullscreenImageData = this.state.items.map(i => ({ src: i.data.src, title: i.data.title || 'Untitled', originalIndex: i.data.originalIndex })); this.galleryInstance.open(fullscreenImageData, index, imageElement, item.main); } else { console.warn("⚠️ Fullscreen gallery instance not available or initialized. Cannot open image."); } } else { this._clearSnapTimeout(); this._setActiveItem(index); this._snapToIndex(index); this._startAnimationLoop(); } } catch (e) { console.error("❌ Error handling main image click:", e); } }
    _triggerSnap() { if (this.state.isDragging || this.state.items.length === 0 || this.state.maxScroll <= 0 || !this.isInitialized) return; this._clearSnapTimeout(); this.state.snapTimeout = setTimeout(() => { if (this.state.isDragging || !this.isInitialized) return; if (this.state.activeIndex >= 0 && this.state.activeIndex < this.state.items.length) { this._snapToIndex(this.state.activeIndex); this._startAnimationLoop(); } else { console.warn(`⚠️ Snap aborted: Invalid activeIndex (${this.state.activeIndex})`); } }, this.animationConfig.SNAP_TIMEOUT_MS); }
    _snapToIndex(index) { if (!this.isInitialized || index < 0 || index >= this.state.items.length || this.state.mainHeight <= 0) { const currentTarget = this.state.y.targ ?? 0; this.state.y.targ = Math.max(0, Math.min(currentTarget, this.state.maxScroll)); console.warn(`⚠️ Snap failed: Invalid state or index ${index}. Clamping target Y. MainHeight: ${this.state.mainHeight}`); return; } const itemData = this.state.items[index]; if (!itemData || typeof itemData.mainY !== 'number') { console.warn(`⚠️ Cannot snap: Item data or position missing for index ${index}.`); const currentTarget = this.state.y.targ ?? 0; this.state.y.targ = Math.max(0, Math.min(currentTarget, this.state.maxScroll)); return; } const itemCenterY = itemData.mainY + this.state.mainHeight / 2; const targetY = itemCenterY - this.state.containerHeight / 2; this.state.y.targ = Math.max(0, Math.min(targetY, this.state.maxScroll)); }
    _clearSnapTimeout() { if (this.state.snapTimeout) { clearTimeout(this.state.snapTimeout); this.state.snapTimeout = null; } }
    destroy() { if (!this.isInitialized) return; this._stopAnimationLoop(); this._clearSnapTimeout(); clearTimeout(this.state.interactionTimeout); this._unbindAllEvents(); this.boundHandlers.debouncedOnResize?.cancel?.(); if (this.dom?.thumbScroller) this.dom.thumbScroller.innerHTML = ''; if (this.dom?.mainScroller) this.dom.mainScroller.innerHTML = ''; if (this.dom?.container) this.dom.container.tabIndex = -1; if (this.dom?.cursor) { this.dom.cursor.style.opacity = '0'; this.dom.cursor.style.transform = 'translateY(0px)'; } if (this.dom?.status) this.dom.status.textContent = ''; Object.assign(this.state, { items: [], filteredItems: [], y: { curr: 0, targ: 0, start: 0, lastTouchY: 0 }, activeIndex: 0, maxScroll: 0, parallaxRatio: 0, mainHeight: 0, containerHeight: 0, thumbContainerHeight: 0, isDragging: false, snapTimeout: null, rafId: null, activeFilter: CONFIG.DEFAULTS.FILTER, isInteracting: false, interactionTimeout: null, isTouchActive: false, }); this.desktopMediaQuery = null; this.isDesktop = false; this.dom = null; this.galleryInstance = null; this.isInitialized = false; }
}

// ==========================================================================
// UI Class - Manages general UI interactions like theme switching,
// role typing animation, navigation clicks, and filter interactions.
// ==========================================================================
class UI {
    dom = null;
    config;
    backgroundAnimation = null;
    scrollGallery = null;
    prefersReducedMotion = false;
    state = { theme: { hue: 0, isDark: false }, roleTyping: { currentIndex: -1, currentChar: 0, timeoutId: null, roles: [] }, activeFilter: CONFIG.DEFAULTS.FILTER, themeUpdateTimeout: null, currentFocusedFilterIndex: -1, };
    boundHandlers = {};
    isInitialized = false;

    constructor(bgAnimInstance, scrollGalleryInstance) {
        this.isInitialized = false;
        const essentialKeys = ['root', 'body', 'html'];
        const optionalKeys = ['darkModeButton', 'darkModeIcon', 'hueShiftButton', 'roleElement', 'filterList', 'navLinks'];
        const essentialFound = essentialKeys.every(key => domElements?.[key]);
        if (!essentialFound || !domElements) {
            console.error(`‼️ UI init failed: Missing essential DOM element(s). UI disabled.`);
            return;
        }

        try {
            this.dom = {
                root: domElements.root,
                html: domElements.html,
                body: domElements.body,
                darkModeButton: domElements.darkModeButton,
                darkModeIcon: domElements.darkModeIcon,
                hueShiftButton: domElements.hueShiftButton,
                roleElement: domElements.roleElement,
                filterList: domElements.filterList,
                navLinks: domElements.navLinks || [],
                filterButtons: [], 
            };
            optionalKeys.forEach(key => { if (!this.dom[key] && key !== 'navLinks') console.warn(`⚠️ UI Feature Warning: Optional element "${key}" not found.`); });
            if (!this.dom.filterList) console.warn(`⚠️ UI Feature Warning: Filter list element not found. Filtering UI disabled.`);
            if (this.dom.navLinks.length === 0 && domElements?.navLinksQuery) console.warn(`⚠️ UI Feature Warning: No navigation links found with selector "${domElements.navLinksQuery}". Smooth scrolling for nav might not work.`);


            this.config = CONFIG;
            this.backgroundAnimation = (bgAnimInstance instanceof BackgroundAnimation && bgAnimInstance.isInitialized) ? bgAnimInstance : null;
            this.scrollGallery = (scrollGalleryInstance instanceof ScrollModeGallery && scrollGalleryInstance.isInitialized) ? scrollGalleryInstance : null;

            this.prefersReducedMotion = prefersReducedMotion();
            this.state.theme.isDark = this._getInitialDarkModePreference();
            this.state.roleTyping.roles = [...this.config.DEFAULTS.ROLES];
            this.state.activeFilter = this.config.DEFAULTS.FILTER;

            this.boundHandlers = {
                navClick: this._handleNavClick.bind(this),
                filterClick: this._handleFilterClick.bind(this),
                filterKeydown: this._handleFilterKeydown.bind(this),
                toggleDark: this.toggleDarkMode.bind(this),
                shiftHue: this.shiftThemeHue.bind(this)
            };

            this.isInitialized = true;
        } catch(error) {
            console.error("❌ Critical error during UI construction:", error);
            this.isInitialized = false;
            this.dom = null;
        }
    }

    init() { 
        if (!this.isInitialized || !this.dom) { 
            console.warn("⚠️ UI init skipped: Not initialized."); 
            return; 
        } 
        try { 
            this.applyTheme(); 
            if (this.dom.roleElement && !this.prefersReducedMotion) { 
                this.startRoleTypingAnimation(); 
            } else if (this.dom.roleElement && this.prefersReducedMotion) { 
                this.dom.roleElement.textContent = this.state.roleTyping.roles[0] || ''; 
                this.dom.roleElement.style.borderRightColor = 'transparent'; 
            } else if (!this.dom.roleElement) { 
                console.warn("⚠️ Role element (#role) not found, typing animation disabled."); 
            }
            this._populateFilterButtonsCache(); 
            this._bindEvents(); 
            this._updateFilterButtonsState(); 
        } catch(e) { 
            console.error("❌ Error during UI initialization:", e); 
            this.isInitialized = false; 
            this._unbindEvents(); 
        } 
    }

    _populateFilterButtonsCache() {
        if (this.dom?.filterList && this.dom.filterButtons.length === 0) {
            this.dom.filterButtons = Array.from(
                this.dom.filterList.querySelectorAll(CONFIG.SELECTORS.CLASSES_AND_SELECTORS.filterButton)
            );
            if (this.dom.filterButtons.length === 0) {
                console.warn("⚠️ No filter buttons found during initial cache population.");
            }
        }
    }

    _bindEvents() { if (!this.dom) return; this.dom.darkModeButton?.addEventListener('click', this.boundHandlers.toggleDark); this.dom.hueShiftButton?.addEventListener('click', this.boundHandlers.shiftHue); this.dom.navLinks.forEach(link => link.addEventListener('click', this.boundHandlers.navClick)); if (this.dom.filterList) { 
        this.dom.filterList.addEventListener('click', this.boundHandlers.filterClick); this.dom.filterList.addEventListener('keydown', this.boundHandlers.filterKeydown); } }
     _unbindEvents() { if (!this.dom) return; this.dom.darkModeButton?.removeEventListener('click', this.boundHandlers.toggleDark); this.dom.hueShiftButton?.removeEventListener('click', this.boundHandlers.shiftHue); this.dom.navLinks.forEach(link => link.removeEventListener('click', this.boundHandlers.navClick)); this.dom.filterList?.removeEventListener('click', this.boundHandlers.filterClick); this.dom.filterList?.removeEventListener('keydown', this.boundHandlers.filterKeydown); }
    _getInitialDarkModePreference() { try { const storedValue = localStorage.getItem('darkMode'); if (storedValue !== null) { return storedValue === 'true'; } } catch (e) { console.warn("⚠️ Could not access localStorage to get dark mode preference:", e); } if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') { try { return window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) { console.warn("⚠️ Could not check prefers-color-scheme media query:", e); } } return false; }
    toggleDarkMode() { if (!this.isInitialized) return; this.state.theme.isDark = !this.state.theme.isDark; try { localStorage.setItem('darkMode', String(this.state.theme.isDark)); } catch (e) { console.error("❌ Error saving dark mode preference to localStorage:", e); } this.applyTheme(); }
    applyTheme() { if (!this.dom?.root || !this.dom.html) { console.error("❌ Cannot apply theme: Root/HTML element missing."); return; }
        const { darkMode } = CONFIG.SELECTORS.CLASSES_AND_SELECTORS; this.dom.html.classList.toggle(darkMode, this.state.theme.isDark); if (this.dom.darkModeIcon) { this.dom.darkModeIcon.textContent = this.state.theme.isDark ? 'dark_mode' : 'light_mode'; } this.dom.darkModeButton?.setAttribute('aria-pressed', String(this.state.theme.isDark)); this.dom.root.style.setProperty('--hue-shift', String(this.state.theme.hue)); clearTimeout(this.state.themeUpdateTimeout); this.state.themeUpdateTimeout = setTimeout(() => { try { if (this.backgroundAnimation?.isInitialized) { if (this.backgroundAnimation.updateColors()) { this.backgroundAnimation.start(); } } } catch (error) { console.error("❌ Error updating background animation colors after theme change:", error); } finally { this.state.themeUpdateTimeout = null; } }, 50); }
    shiftThemeHue() { if (!this.isInitialized || !this.dom?.root) return; this.state.theme.hue = (this.state.theme.hue + this.config.ANIMATION.HUE_SHIFT_AMOUNT) % 360; this.applyTheme(); }
    startRoleTypingAnimation() { if (!this.dom?.roleElement || !this.isInitialized || this.prefersReducedMotion) { if (this.prefersReducedMotion && this.dom?.roleElement) { this.dom.roleElement.textContent = this.state.roleTyping.roles[0] || ''; this.dom.roleElement.style.borderRightColor = 'transparent'; } clearTimeout(this.state.roleTyping.timeoutId); this.state.roleTyping.timeoutId = null; return; } const { roleTyping } = this.state; const { roles } = roleTyping; if (!roles || roles.length === 0) { console.warn("⚠️ Role typing stopped: No roles defined in config."); clearTimeout(roleTyping.timeoutId); roleTyping.timeoutId = null; return; } clearTimeout(roleTyping.timeoutId); roleTyping.timeoutId = setTimeout(() => { if (!this.dom?.roleElement || !this.isInitialized) return; try { roleTyping.currentIndex = (roleTyping.currentIndex + 1) % roles.length; roleTyping.currentChar = 0; this.dom.roleElement.textContent = ''; this.dom.roleElement.style.opacity = '1'; this.dom.roleElement.style.borderRightColor = '';
            this._typeNextCharacter(); } catch (error) { console.error("❌ Error starting next role typing animation:", error); clearTimeout(roleTyping.timeoutId); roleTyping.timeoutId = null; } }, this.config.ANIMATION.ROLE_PAUSE_MS); }
    _typeNextCharacter() { const { roleTyping } = this.state; const { roles, currentIndex } = roleTyping; if (!this.dom?.roleElement || !this.isInitialized || currentIndex < 0 || currentIndex >= roles.length) { clearTimeout(roleTyping.timeoutId); roleTyping.timeoutId = null; return; } const currentRole = roles[currentIndex]; try { if (roleTyping.currentChar < currentRole.length) { this.dom.roleElement.textContent += currentRole[roleTyping.currentChar]; roleTyping.currentChar++; roleTyping.timeoutId = setTimeout(() => this._typeNextCharacter(), this.config.ANIMATION.TYPING_SPEED_MS); } else { roleTyping.timeoutId = setTimeout(() => this.startRoleTypingAnimation(), 0); } } catch (e) { console.error("❌ Error during typing animation step:", e); clearTimeout(roleTyping.timeoutId); roleTyping.timeoutId = null; } }
    _handleNavClick(event) { if (!this.isInitialized || !(event.currentTarget instanceof HTMLAnchorElement)) return; const link = event.currentTarget; const targetId = link.getAttribute('href'); if (!targetId || !targetId.startsWith('#') || targetId.length === 1) return; try { const targetElement = document.querySelector(targetId); if (targetElement) { event.preventDefault(); targetElement.scrollIntoView({ behavior: this.prefersReducedMotion ? 'auto' : 'smooth', block: 'start' }); setTimeout(() => { if (targetElement instanceof HTMLElement && (targetElement.hasAttribute('tabindex') || ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA', 'A'].includes(targetElement.tagName))) { targetElement.focus({ preventScroll: true }); } }, this.prefersReducedMotion ? 50 : 550); } else { console.warn(`⚠️ Navigation target element not found: ${targetId}`); } } catch (e) { console.error(`❌ Error handling navigation click for ${targetId}:`, e); } }
    _handleFilterClick(event) { if (!this.isInitialized || !this.dom?.filterList || !(event.target instanceof Node)) return;
        const button = event.target.closest(CONFIG.SELECTORS.CLASSES_AND_SELECTORS.filterButton); if (!button || button.classList.contains(CONFIG.SELECTORS.CLASSES_AND_SELECTORS.active)) return; const newFilter = button.dataset.filter; if (typeof newFilter === 'string' && newFilter) { this.setActiveFilter(newFilter); } else { console.warn("⚠️ Clicked filter button is missing 'data-filter' attribute."); } }
    _handleFilterKeydown(event) { if (!this.isInitialized || !this.dom?.filterList || !(event.target instanceof HTMLButtonElement)) return; const button = event.target;
        if (!button.matches(CONFIG.SELECTORS.CLASSES_AND_SELECTORS.filterButton) || !this.dom.filterList.contains(button)) return; const buttons = this.dom.filterButtons; 
        if (!buttons || buttons.length === 0) return; let currentIndex = buttons.findIndex(btn => btn === button); let nextIndex = currentIndex; switch (event.key) { case 'Enter': case ' ':
                if (!button.classList.contains(CONFIG.SELECTORS.CLASSES_AND_SELECTORS.active)) { event.preventDefault(); const newFilter = button.dataset.filter; if (typeof newFilter === 'string' && newFilter) { this.setActiveFilter(newFilter); } else { console.warn("⚠️ Activated filter button missing 'data-filter'."); } } else { event.preventDefault(); } break; case 'ArrowRight': case 'Right': event.preventDefault(); nextIndex = (currentIndex + 1) % buttons.length; this._focusFilterButton(nextIndex); break; case 'ArrowLeft': case 'Left': event.preventDefault(); nextIndex = (currentIndex - 1 + buttons.length) % buttons.length; this._focusFilterButton(nextIndex); break; case 'Home': event.preventDefault(); this._focusFilterButton(0); break; case 'End': event.preventDefault(); this._focusFilterButton(buttons.length - 1); break; default: return; } }
    _focusFilterButton(index) { if (!this.dom?.filterButtons || index < 0 || index >= this.dom.filterButtons.length) { console.warn(`⚠️ Invalid filter button index provided for focus: ${index}`); return; } try { this.dom.filterButtons[index].focus({ preventScroll: true }); this.state.currentFocusedFilterIndex = index; } catch (e) { console.error(`❌ Error focusing filter button at index ${index}:`, e); } }
    setActiveFilter(filterCategory) { if (!this.isInitialized || filterCategory === this.state.activeFilter) return; this.state.activeFilter = filterCategory; this._updateFilterButtonsState(); if (this.scrollGallery?.isInitialized) { try { this.scrollGallery.applyFilter(filterCategory); } catch (error) { console.error(`❌ Error applying filter '${filterCategory}' in ScrollGallery module:`, error); } } else if (this.scrollGallery) { console.warn("⚠️ Scroll gallery instance exists but is not initialized. Cannot apply filter."); } }
    
    _updateFilterButtonsState() {
        if (!this.isInitialized || !this.dom?.filterList) return;
        // Assumes _populateFilterButtonsCache has been called by init()
        if (this.dom.filterButtons.length === 0) {
            // This warning will now only show if init couldn't find buttons either
            console.warn("⚠️ No filter buttons found to update state. Check DOM structure and selectors.");
            return;
        }
    
        const { active } = CONFIG.SELECTORS.CLASSES_AND_SELECTORS;
        const currentFilter = this.state.activeFilter;
        this.dom.filterButtons.forEach((button, index) => {
            if (button instanceof HTMLButtonElement) {
                const isActive = button.dataset.filter === currentFilter;
                button.classList.toggle(active, isActive);
                button.setAttribute('aria-current', isActive ? 'true' : 'false'); 
                if (isActive) {
                    this.state.currentFocusedFilterIndex = index;
                }
            }
        });
    }

    destroy() { if (!this.isInitialized) return; this._unbindEvents(); clearTimeout(this.state.roleTyping.timeoutId); this.state.roleTyping.timeoutId = null; clearTimeout(this.state.themeUpdateTimeout); this.state.themeUpdateTimeout = null; if (this.dom?.roleElement) { this.dom.roleElement.textContent = ''; this.dom.roleElement.style.opacity = '0'; } this.backgroundAnimation = null; this.scrollGallery = null; this.dom = null; this.isInitialized = false; }
}

// ==========================================================================
// Global Event Listeners & Initialization
// ==========================================================================
let backgroundAnimationInstance = null;
let galleryInstance = null;
let scrollGalleryInstance = null;
let uiInstance = null;
let throttledScrollHandler = null;
let throttledMouseMoveHandler = null;
let debouncedResizeHandler = null;

function handleGlobalScroll() { if (!domElements?.body) return; try { const currentlyScrolledTop = window.scrollY < 5; if (currentlyScrolledTop !== isScrolledTop) { isScrolledTop = currentlyScrolledTop;
             domElements.body.classList.toggle(CONFIG.SELECTORS.CLASSES_AND_SELECTORS.scrolledToTop, isScrolledTop); } } catch (error) { console.error("❌ Error in handleGlobalScroll:", error); } }
function handleGlobalMouseMove(event) { backgroundAnimationInstance?.updateMousePosition(event.clientX, event.clientY); }
function handleGlobalResize() {
    if (!domElements?.html) { console.error("❌ Cannot handle resize: HTML element missing."); return; }
    try {
        const newScrollbarWidth = getScrollbarWidth(true); 
        domElements.html.style.setProperty('--scrollbar-width', `${newScrollbarWidth}px`);
        
        backgroundAnimationInstance?.handleResize();
        scrollGalleryInstance?.handleResize();
        galleryInstance?.handleResize();
        handleGlobalScroll(); 
    } catch (error) {
        console.error("❌ Error during global resize handling:", error);
    }
}

function initializeApp() {
    console.log("🚀 Initializing Portfolio App...");
    try {
        domElements = cacheDomElements();
        if (!domElements) {
            console.error("❌ App Initialization Failed: DOM caching returned null.");
            return;
        }

        if (!domElements.body || !domElements.html) {
            console.error("❌ App Initialization Failed: Body or HTML element missing after caching.");
            return;
        }

        isScrolledTop = window.scrollY < 5;
        domElements.body.classList.toggle(CONFIG.SELECTORS.CLASSES_AND_SELECTORS.scrolledToTop, isScrolledTop);

        const scrollbarWidth = getScrollbarWidth(); 
        domElements.html.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);

        const motionPrefReduced = prefersReducedMotion();
        domElements.html.classList.toggle(CONFIG.SELECTORS.CLASSES_AND_SELECTORS.reducedMotion, motionPrefReduced);
        if (motionPrefReduced) console.log("♿ Reduced motion preference detected and applied.");

        try { backgroundAnimationInstance = new BackgroundAnimation(); }
        catch (e) { console.error("❌ Failed to instantiate BackgroundAnimation:", e); backgroundAnimationInstance = null; }

        try { galleryInstance = new Gallery(); }
        catch (e) { console.error("❌ Failed to instantiate Gallery:", e); galleryInstance = null; }

        try { scrollGalleryInstance = new ScrollModeGallery(galleryInstance); }
        catch (e) { console.error("❌ Failed to instantiate ScrollModeGallery:", e); scrollGalleryInstance = null; }

        try { uiInstance = new UI(backgroundAnimationInstance, scrollGalleryInstance); }
        catch (e) { console.error("❌ Failed to instantiate UI:", e); uiInstance = null; }

        if (uiInstance?.isInitialized) { uiInstance.init(); }
        else { console.warn("⚠️ UI module skipped initialization."); }

        if (scrollGalleryInstance?.isInitialized) { scrollGalleryInstance.init(); }
        else { console.warn("⚠️ ScrollGallery module skipped initialization."); }

        if (galleryInstance?.isInitialized) { galleryInstance.setupEventListeners(); }
        else { console.warn("⚠️ Gallery module skipped listener setup."); }

        if (backgroundAnimationInstance?.isInitialized) { 
            backgroundAnimationInstance.start(); 
        } else if (backgroundAnimationInstance) { 
            console.warn("⚠️ BackgroundAnimation module instantiated but not initialized, attempting start...");
            backgroundAnimationInstance.start(); 
        }
        else { console.warn("⚠️ BackgroundAnimation module skipped start (not instantiated or failed early)."); }


        throttledScrollHandler = throttle(handleGlobalScroll, CONFIG.ANIMATION.THROTTLE_MS);
        throttledMouseMoveHandler = throttle(handleGlobalMouseMove, CONFIG.ANIMATION.THROTTLE_MS);
        debouncedResizeHandler = debounce(handleGlobalResize, CONFIG.ANIMATION.RESIZE_DEBOUNCE_MS);

        window.addEventListener('scroll', throttledScrollHandler, { passive: true });
        document.addEventListener('mousemove', throttledMouseMoveHandler, { passive: true });
        window.addEventListener('resize', debouncedResizeHandler);

        console.log("✅ Portfolio App Initialization Complete.");

    } catch (error) {
        console.error("❌❌❌ Unexpected critical error during app initialization sequence:", error);
        try {
            if (domElements?.body) {
                domElements.body.insertAdjacentHTML('afterbegin', '<p style="color: red; background: white; padding: 20px; font-size: 1.2em; text-align: center; border: 2px solid red; position: fixed; top: 10px; left: 10px; right: 10px; z-index: 9999;">Error loading portfolio content.<br>Please try refreshing the page.</p>');
            } else {
                console.error("Fallback error message could not be displayed: document.body not available.");
            }
        } catch (displayError) {
            console.error("Could not display fallback error message to user:", displayError);
        }
    }
}

// ==========================================================================
// App Entry Point & Cleanup
// ==========================================================================

function cleanupApp() {
    console.log("🧹 Cleaning up Portfolio App resources...");
    try {
        uiInstance?.destroy();
        scrollGalleryInstance?.destroy();
        galleryInstance?.destroy();
        backgroundAnimationInstance?.destroy();

        if (throttledScrollHandler) window.removeEventListener('scroll', throttledScrollHandler);
        if (throttledMouseMoveHandler) document.removeEventListener('mousemove', throttledMouseMoveHandler);
        if (debouncedResizeHandler) window.removeEventListener('resize', debouncedResizeHandler);

        throttledScrollHandler?.cancel?.();
        throttledMouseMoveHandler?.cancel?.();
        debouncedResizeHandler?.cancel?.();

        domElements = null;
        backgroundAnimationInstance = null;
        galleryInstance = null;
        scrollGalleryInstance = null;
        uiInstance = null;
        throttledScrollHandler = null;
        throttledMouseMoveHandler = null;
        debouncedResizeHandler = null;
        _cachedScrollbarWidth = undefined; 
        console.log("🧼 Portfolio App cleanup complete.");
    } catch (error) {
        console.error("❌ Error during application cleanup:", error);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}