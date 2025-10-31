"use strict";

/**
 * Portfolio by Kees Leemeijer
 * script.js (optimized)
 * - No frameworks. ES Modules-compatible. Modern browsers.
 * - Accessible, performant, and resilient.
 */

/* =========================
   Configuration
   ========================= */

const CONFIG = Object.freeze({
  ANIMATION: Object.freeze({
    HUE_SHIFT_AMOUNT: 60,
    THROTTLE_MS: 50,
    RESIZE_DEBOUNCE_MS: 250,
    TYPING_SPEED_MS: 80,
    ROLE_PAUSE_MS: 1500,
    LERP_FACTOR: 0.1,
    SNAP_TIMEOUT_MS: 150,
    UPDATE_EPSILON: 0.5,
    ZOOM_TRANSITION_MS: 600, // matches CSS var: --transition-duration-zoom
    FADE_BG_TRANSITION_MS: 600, // matches CSS var: --transition-duration-fade-bg
    SLIDER_SCROLL_THROTTLE_MS: 50,
    SLIDE_UPDATE_DELAY_MS: 100,
  }),
  DEFAULTS: Object.freeze({
    FILTER: "All",
    ROLES: [
      "parametric designer",
      "researcher",
      "photographer",
      "robotic fabrication engineer",
    ],
    ALT_TEXT_PREFIX: "Portfolio image",
    PROJECTS_DATA_PATH: "projects.json",
  }),
  BACKGROUND: Object.freeze({
    MOBILE_BALLS: 3,
    DESKTOP_BALLS: 3,
    BASE_RADIUS_FACTOR: 0.7,
    RADIUS_VAR_FACTOR: 0.4,
    MIN_SPEED: 0.9,
    MAX_SPEED: 0.99,
    DAMPING: 1,
    BLUR_AMOUNT: "0px",
    GLOBAL_ALPHA: 0.2,
  }),
  SELECTORS: Object.freeze({
    CACHEABLE_ELEMENTS: Object.freeze({
      root: ":root",
      html: "html",
      body: "body",
      mainContainer: ".main-container",
      mainContent: ".content",
      scrollModeGallery: "#scroll-mode-gallery",
      thumbnailColumn: "#thumbnail-column",
      mainImageColumn: "#main-image-column",
      thumbnailScroller: "#thumbnail-scroller",
      mainImageScroller: "#main-image-scroller",
      activeCursor: "#active-thumbnail-cursor",
      scrollGalleryStatus: "#scroll-gallery-status",
      fullscreenContainer: "#fullscreen-container",
      fullscreenSliderWrapper: "#fullscreen-slider-wrapper",
      fullscreenCloseButton: "#close-fullscreen",
      fullscreenStatusLabel: "#fullscreen-status",
      filterList: ".project-filter-list",
      projectGallerySection: "#project-gallery",
      hueShiftButton: "#hue-shift-button",
      darkModeButton: ".dark-light-mode",
      darkModeIcon: ".dark-light-mode span",
      roleElement: "#role",
      backgroundCanvas: "#gradient-background",
      navLinksQuery: '.menu nav a[href^="#"]',
    }),
    CLASS_NAMES: Object.freeze({
      active: "active",
      darkMode: "dark-mode",
      isZooming: "is-zooming",
      fullscreenActive: "fullscreen-active",
      fullscreenEffectActive: "fullscreen-effect-active",
      isDragging: "is-dragging",
      scrolledToTop: "scrolled-to-top",
      reducedMotion: "reduced-motion",
      visuallyHidden: "visually-hidden",
      scrollGalleryThumbItem: "scroll-gallery__thumb-item",
      scrollGalleryMainItem: "scroll-gallery__main-item",
      scrollGalleryThumbItemError: "scroll-gallery__thumb-item--error",
      scrollGalleryMainItemError: "scroll-gallery__main-item--error",
      sourceElementZooming: "source-element-zooming",
      galleryEmptyMessage: "gallery-empty-message",
      fullscreenSlide: "fullscreen-slide",
      isActiveSlide: "is-active-slide",
      slideLoaded: "slide-loaded",
      slideLoadError: "slide-load-error",
      slideLoadingPlaceholder: "is-loading-placeholder",
      willChangeOpacityFilter: "will-change-opacity-filter",
      willChangeTransform: "will-change-transform",
      willChangeOpacity: "will-change-opacity",
      willChangeTransformOpacity: "will-change-transform-opacity",
    }),
    DYNAMIC_SELECTORS: Object.freeze({
      filterButton: ".filter-button",
    }),
  }),
  SCROLL_MODE: Object.freeze({
    WHEEL_MULTIPLIER: 0.8,
    DRAG_MULTIPLIER: 1.5,
    DESKTOP_MEDIA_QUERY: "(min-width: 62rem)",
  }),
  GALLERY: Object.freeze({
    IMAGE_WIDTHS_FOR_SRCSET: [240, 320, 480, 768, 1024, 1440, 1920],
  }),
});

/**
 * @typedef {{src:string, title?:string, category?:string, originalIndex:number, computedSrcset?:string}} Project
 * @typedef {{x:number, y:number, radius:number, vx:number, vy:number, color1:string, color2:string}} Blob
 */

let PROJECTS_DATA = /** @type {Project[]} */ ([]);

/* =========================
   Utilities
   ========================= */

const Utils = {
  _prefersReducedMotion: /** @type {boolean|undefined} */ (undefined),
  _cachedScrollbarWidth: /** @type {number|undefined} */ (undefined),
  _reducedMotionMql: /** @type {MediaQueryList|null} */ (null),
  _reducedMotionSubscribers: /** @type {Set<(val:boolean)=>void>} */ (new Set()),

  debounce(fn, delay) {
    let timeoutId;
    const debounced = function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        timeoutId = null;
        fn.apply(this, args);
      }, delay);
    };
    debounced.cancel = () => {
      clearTimeout(timeoutId);
      timeoutId = null;
    };
    return debounced;
  },

  throttle(fn, limit) {
    let inThrottle = false,
      lastResult,
      timeoutId = null,
      trailingCallScheduled = false,
      lastArgs = null,
      lastThis = null;
    const throttled = function (...args) {
      lastArgs = args;
      lastThis = this;
      if (!inThrottle) {
        inThrottle = true;
        lastResult = fn.apply(lastThis, lastArgs);
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
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      inThrottle = false;
      trailingCallScheduled = false;
      lastArgs = null;
      lastThis = null;
    };
    return throttled;
  },

  getScrollbarWidth(forceRecalculate = false) {
    if (!forceRecalculate && this._cachedScrollbarWidth !== undefined)
      return this._cachedScrollbarWidth;
    this._cachedScrollbarWidth = Math.max(
      0,
      window.innerWidth - document.documentElement.clientWidth
    );
    return this._cachedScrollbarWidth;
  },

  /**
   * Initializes prefers-reduced-motion handling and wires up live updates.
   * Call once on app bootstrap.
   */
  initMotionPreference() {
    if (this._reducedMotionMql) return;
    if (!("matchMedia" in window)) {
      this._prefersReducedMotion = false;
      return;
    }
    this._reducedMotionMql = window.matchMedia("(prefers-reduced-motion: reduce)");
    this._prefersReducedMotion = this._reducedMotionMql.matches;

    document.documentElement.classList.toggle(
      CONFIG.SELECTORS.CLASS_NAMES.reducedMotion,
      this._prefersReducedMotion
    );

    const onChange = (e) => {
      this._prefersReducedMotion = e.matches;
      document.documentElement.classList.toggle(
        CONFIG.SELECTORS.CLASS_NAMES.reducedMotion,
        this._prefersReducedMotion
      );
      this._reducedMotionSubscribers.forEach((cb) => {
        try {
          cb(this._prefersReducedMotion);
        } catch {}
      });
    };
    this._reducedMotionMql.addEventListener("change", onChange);
  },

  onReducedMotionChange(cb) {
    this._reducedMotionSubscribers.add(cb);
    return () => this._reducedMotionSubscribers.delete(cb);
  },

  prefersReducedMotion() {
    if (this._prefersReducedMotion === undefined) {
      this.initMotionPreference();
    }
    return this._prefersReducedMotion;
  },

  /**
   * Resolve after scrolling has "settled" or timeout, to hand off focus reliably post-smooth scroll.
   * @param {number} settleDelayMs
   * @param {number} maxWaitMs
   * @returns {Promise<void>}
   */
  waitForScrollSettled(settleDelayMs = 140, maxWaitMs = 1000) {
    return new Promise((resolve) => {
      let t;
      const done = () => {
        window.removeEventListener("scroll", onScroll, { passive: true });
        resolve();
      };
      const onScroll = () => {
        clearTimeout(t);
        t = setTimeout(done, settleDelayMs);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      t = setTimeout(done, settleDelayMs);
      setTimeout(done, maxWaitMs);
    });
  },

  generateSrcset(baseSrc, widths) {
    const filenameWithExt = baseSrc.substring(baseSrc.lastIndexOf("/") + 1);
    const baseFilenamePart = filenameWithExt.replace(/\.webp$/i, "");
    const cleanBaseFilename = baseFilenamePart.replace(/-(\d+)w$/i, "");
    const directoryPath = baseSrc.substring(0, baseSrc.lastIndexOf("/") + 1);
    return widths
      .map((w) => `${directoryPath}${cleanBaseFilename}-${w}w.webp ${w}w`)
      .join(", ");
  },

  getSafeAltText: (
    title,
    index,
    defaultPrefix = CONFIG.DEFAULTS.ALT_TEXT_PREFIX
  ) => (title && String(title).trim()) || `${defaultPrefix} ${index + 1}`,

  addWillChange(element, willChangeClass) {
    if (!this.prefersReducedMotion()) element?.classList?.add(willChangeClass);
  },
  removeWillChange(element, willChangeClass) {
    if (!this.prefersReducedMotion()) element?.classList?.remove(willChangeClass);
  },

  /**
   * Waits for a transition on element. Resolves on transitionend/transitioncancel or on fallback timer.
   * @param {HTMLElement} element
   * @param {string[]=} expectedProperties
   * @param {number=} fallbackMs
   */
  createTransitionPromise(element, expectedProperties, fallbackMs = 700) {
    return new Promise((resolve) => {
      let finished = false;
      const done = () => {
        if (finished) return;
        finished = true;
        element.removeEventListener("transitionend", onEnd);
        element.removeEventListener("transitioncancel", onEnd);
        resolve();
      };
      const onEnd = (event) => {
        if (event.target !== element) return;
        if (
          expectedProperties &&
          expectedProperties.length &&
          !expectedProperties.includes(event.propertyName)
        ) {
          return;
        }
        done();
      };
      element.addEventListener("transitionend", onEnd);
      element.addEventListener("transitioncancel", onEnd);
      // Fallback in case transitionend doesn't fire (e.g., display:none or 0-duration)
      setTimeout(done, fallbackMs);
    });
  },

  /**
   * Creates a standard error content node for image load errors
   * @param {string} message
   */
  createErrorContent(message = "Image failed to load.") {
    const wrapper = document.createElement("div");
    wrapper.className = "item-error-content";
    wrapper.setAttribute("role", "alert");
    const title = document.createElement("div");
    title.className = "slide-error-title";
    title.textContent = message;
    wrapper.appendChild(title);
    return wrapper;
  },
};

/* =========================
   Data
   ========================= */

/**
 * Fetch projects.json with safety and preprocessing.
 * @returns {Promise<Project[]>}
 */
async function fetchProjectsData() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const response = await fetch(CONFIG.DEFAULTS.PROJECTS_DATA_PATH, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const rawData = await response.json();
    const processed = Array.isArray(rawData) ? rawData : [];
    PROJECTS_DATA = processed.map((p, idx) =>
      Object.freeze({
        src: String(p.src || ""),
        title: typeof p.title === "string" ? p.title : "",
        category: typeof p.category === "string" ? p.category : "",
        originalIndex:
          typeof p.originalIndex === "number" ? p.originalIndex : idx,
        computedSrcset: Utils.generateSrcset(
          p.src,
          CONFIG.GALLERY.IMAGE_WIDTHS_FOR_SRCSET
        ),
      })
    );
    return PROJECTS_DATA;
  } catch (err) {
    console.error("[fetchProjectsData] Failed to load projects.json:", err);
    PROJECTS_DATA = /** @type {Project[]} */ ([]);
    return PROJECTS_DATA;
  } finally {
    clearTimeout(timeoutId);
  }
}

/* =========================
   DOM Cache
   ========================= */

function cacheDomElements() {
  const d = document;
  const cacheableSelectors = CONFIG.SELECTORS.CACHEABLE_ELEMENTS;
  const elements = /** @type {Record<string, any>} */ ({});
  for (const key in cacheableSelectors) {
    const selector = cacheableSelectors[key];
    elements[key] =
      key === "navLinksQuery"
        ? Array.from(d.querySelectorAll(selector))
        : d.querySelector(selector);
  }
  return elements;
}

let domElements = null;
let isScrolledTop = true;

/* =========================
   Background Animation
   ========================= */

class BackgroundAnimation {
  constructor() {
    this.canvasElement = domElements.backgroundCanvas;
    this.isInitialized = !!this.canvasElement;
    if (!this.isInitialized) return;

    this.config = CONFIG.BACKGROUND;
    this.ctx = this.canvasElement.getContext("2d");
    this.cssWidth = 0;
    this.cssHeight = 0;
    this.blobs = /** @type {Blob[]} */ ([]);

    this.debouncedHandleResize = Utils.debounce(
      () => this.init(),
      CONFIG.ANIMATION.RESIZE_DEBOUNCE_MS
    );

    this.init();
  }

  shouldAnimate() {
    return !Utils.prefersReducedMotion() && !document.hidden;
  }

  init() {
    if (!this.isInitialized) return;
    this.stop();

    // Refresh DPR on each init for crisp rendering after zoom/DPR changes
    this.devicePixelRatio = window.devicePixelRatio || 1;

    this.cssWidth = window.innerWidth;
    this.cssHeight = window.innerHeight;

    // Intrinsic and CSS size (keep CSS pixels in API)
    this.canvasElement.width = Math.max(
      1,
      Math.floor(this.cssWidth * this.devicePixelRatio)
    );
    this.canvasElement.height = Math.max(
      1,
      Math.floor(this.cssHeight * this.devicePixelRatio)
    );
    this.canvasElement.style.width = `${this.cssWidth}px`;
    this.canvasElement.style.height = `${this.cssHeight}px`;

    // Draw in CSS pixel coordinates
    this.ctx.setTransform(
      this.devicePixelRatio,
      0,
      0,
      this.devicePixelRatio,
      0,
      0
    );

    this.updateColors();
    this._createBlobs();
    this.start();
  }

  updateColors() {
    const computedStyle = getComputedStyle(domElements.root);
    this.colors = [
      "--ball-color-light",
      "--ball-color-medium",
      "--ball-color-dark",
    ]
      .map((prop) => computedStyle.getPropertyValue(prop).trim())
      .filter(Boolean);

    if (this.colors.length === 0) {
      this.colors = [
        "hsla(200, 80%, 70%, 0.7)",
        "hsla(300, 70%, 60%, 0.7)",
        "hsla(50, 80%, 65%, 0.7)",
      ];
    }

    // Update blob colors when theme changes without reiniting geometry
    if (this.blobs && this.blobs.length > 0 && this.colors.length > 0) {
      const len = this.colors.length;
      this.blobs.forEach((b, i) => {
        b.color1 = this.colors[i % len];
        b.color2 = this.colors[(i + 1 + Math.floor(len / 2)) % len];
      });
    }
  }

  start() {
    if (!this.isInitialized) return;
    if (!this.shouldAnimate()) {
      // Clear canvas if reduced motion or hidden
      this.ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);
      this.stop();
      return;
    }
    if (this.blobs.length > 0 && !this.frameId) {
      this._animate();
    }
  }

  stop() {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  handleResize() {
    if (this.isInitialized) this.debouncedHandleResize();
  }

  _createBlobs() {
    const {
      MOBILE_BALLS,
      DESKTOP_BALLS,
      BASE_RADIUS_FACTOR,
      RADIUS_VAR_FACTOR,
      MIN_SPEED,
      MAX_SPEED,
    } = this.config;
    this.blobs = [];
    if (this.colors.length === 0) return;
    const w = this.cssWidth;
    const h = this.cssHeight;
    const numBlobs = window.innerWidth < 768 ? MOBILE_BALLS : DESKTOP_BALLS;
    if (numBlobs <= 0) return;
    const minCanvasDim = Math.min(w, h);
    for (let i = 0; i < numBlobs; i++) {
      const baseR = minCanvasDim * BASE_RADIUS_FACTOR;
      const varR = baseR * RADIUS_VAR_FACTOR;
      const speed = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);
      const angle = Math.random() * Math.PI * 2;
      this.blobs.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: baseR + (Math.random() * varR * 2 - varR),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color1: this.colors[i % this.colors.length],
        color2:
          this.colors[
            (i + 1 + Math.floor(this.colors.length / 2)) % this.colors.length
          ],
      });
    }
  }

  _updateBlobs() {
    const { DAMPING } = this.config;
    const w = this.cssWidth;
    const h = this.cssHeight;
    this.blobs.forEach((b) => {
      b.x += b.vx;
      b.y += b.vy;
      b.vx *= DAMPING;
      b.vy *= DAMPING;
      // wrap-around
      if (b.x - b.radius > w) b.x = -b.radius + (b.x - b.radius - w);
      else if (b.x + b.radius < 0) b.x = w + b.radius + (b.x + b.radius);
      if (b.y - b.radius > h) b.y = -b.radius + (b.y - b.radius - h);
      else if (b.y + b.radius < 0) b.y = h + b.radius + (b.y + b.radius);
    });
  }

  _drawBlobs() {
    this.ctx.save();
    this.ctx.globalCompositeOperation = "lighter";
    this.ctx.filter = `blur(${this.config.BLUR_AMOUNT})`;
    this.ctx.globalAlpha = this.config.GLOBAL_ALPHA;

    this.blobs.forEach((b) => {
      const r = Math.max(1, b.radius);
      const grad = this.ctx.createRadialGradient(
        b.x,
        b.y,
        r * 0.05,
        b.x,
        b.y,
        r
      );

      grad.addColorStop(0, b.color1);

      // Transparent variant of color2
      const c2 = b.color2.trim();
      let transparentColor2 = c2;
      if (/^hsl(a)?\(/i.test(c2) || /^rgb(a)?\(/i.test(c2)) {
        if (/\/\s*[\d.]+\s*\)$/i.test(c2)) {
          transparentColor2 = c2.replace(/\/\s*[\d.]+\s*\)$/i, "/ 0)");
        } else if (/^hsla\(/i.test(c2) || /^rgba\(/i.test(c2)) {
          transparentColor2 = c2.replace(/,\s*[\d.]+\)$/i, ", 0)");
        } else if (/^hsl\(/i.test(c2)) {
          transparentColor2 = c2.replace(/^hsl\(/i, "hsla(").replace(/\)$/, ", 0)");
        } else if (/^rgb\(/i.test(c2)) {
          transparentColor2 = c2.replace(/^rgb\(/i, "rgba(").replace(/\)$/, ", 0)");
        }
      }
      grad.addColorStop(1, transparentColor2);

      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
      this.ctx.fillStyle = grad;
      this.ctx.fill();
    });

    this.ctx.restore();
  }

  _animate = () => {
    if (!this.isInitialized || !this.shouldAnimate()) {
      this.stop();
      return;
    }
    // Clear in CSS pixels (transform already scales by DPR)
    this.ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);
    if (this.blobs.length > 0) {
      this._updateBlobs();
      this._drawBlobs();
    }
    this.frameId = requestAnimationFrame(this._animate);
  };

  destroy() {
    this.stop();
    this.debouncedHandleResize?.cancel?.();
    this.isInitialized = false;
  }
}

/* =========================
   Fullscreen Gallery (Modal)
   ========================= */

class Gallery {
  constructor() {
    this.dom = {
      container: domElements.fullscreenContainer,
      sliderWrapper: domElements.fullscreenSliderWrapper,
      closeButton: domElements.fullscreenCloseButton,
      statusLabel: domElements.fullscreenStatusLabel,
      mainContainer: domElements.mainContainer,
      mainContent: domElements.mainContent,
      body: domElements.body,
      html: domElements.html,
    };
    this.animationConfig = CONFIG.ANIMATION;
    this.galleryConfig = CONFIG.GALLERY;
    this.prefersReducedMotion = Utils.prefersReducedMotion();
    this.state = {
      currentIndex: 0,
      totalVisibleImages: 0,
      isAnimatingZoom: false,
      isSliderOpen: false,
      lastFocusedElement: null,
      clickedImageElement: null,
      boundHandlers: {},
      scrollTimeoutId: null,
      focusableElementsCache: [],
    };
    this.state.boundHandlers = {
      keydown: this._handleKeydown.bind(this),
      scroll: Utils.throttle(
        this._handleScroll.bind(this),
        this.animationConfig.SLIDER_SCROLL_THROTTLE_MS
      ),
      slideClick: this._handleSlideClick.bind(this),
      closeClick: this._requestClose.bind(this),
    };
    this.isInitialized = true;
  }

  setPrefersReducedMotion(value) {
    this.prefersReducedMotion = !!value;
  }

  setupEventListeners() {
    if (!this.isInitialized) return;
    this.dom.closeButton.addEventListener(
      "click",
      this.state.boundHandlers.closeClick
    );
    this.dom.container.addEventListener(
      "keydown",
      this.state.boundHandlers.keydown
    );
    this.dom.sliderWrapper.addEventListener(
      "scroll",
      this.state.boundHandlers.scroll,
      {
        passive: true,
      }
    );
    this.dom.sliderWrapper.addEventListener(
      "click",
      this.state.boundHandlers.slideClick
    );
  }

  open(imageData, startIndex, clickedImageElement, focusReturnElement = null) {
    if (this.state.isAnimatingZoom || this.state.isSliderOpen) return;
    this.visibleImageData = Array.isArray(imageData) ? imageData : [];
    this.state.totalVisibleImages = this.visibleImageData.length;
    this.state.currentIndex = Math.max(
      0,
      Math.min(startIndex, this.visibleImageData.length - 1)
    );
    this.state.clickedImageElement = clickedImageElement || null;
    this.state.lastFocusedElement =
      focusReturnElement ||
      clickedImageElement?.closest(
        `.${CONFIG.SELECTORS.CLASS_NAMES.scrollGalleryMainItem}`
      ) ||
      document.activeElement;

    this.state.isAnimatingZoom = true;
    this._prepareUIForOpen();
    this.prefersReducedMotion ? this._openInstantly() : this._animateZoomIn();
  }

  _requestClose() {
    if (this.state.isAnimatingZoom || !this.state.isSliderOpen) return;
    this.state.isAnimatingZoom = true;
    this.state.isSliderOpen = false;
    this.prefersReducedMotion ? this._closeInstantly() : this._animateZoomOut();
  }

  _prepareUIForOpen() {
    const { container, mainContainer, mainContent, html } = this.dom;
    const CN = CONFIG.SELECTORS.CLASS_NAMES;

    // Ensure modal semantics and background interactivity off
    container.setAttribute("role", "dialog");
    container.setAttribute("aria-modal", "true");
    if (mainContainer) mainContainer.setAttribute("inert", "");
    if (mainContent) mainContent.setAttribute("aria-hidden", "true");

    const sourceImgContainer =
      this.state.clickedImageElement?.closest(`.${CN.scrollGalleryMainItem}`);
    this._populateSlider();
    this._cacheFocusableElements();
    if (sourceImgContainer) {
      sourceImgContainer.classList.add(CN.sourceElementZooming);
      if (!this.prefersReducedMotion) {
        Utils.addWillChange(sourceImgContainer, CN.willChangeOpacity);
        Object.assign(sourceImgContainer.style, {
          opacity: "0",
          visibility: "hidden",
          pointerEvents: "none",
          transition: "none",
        });
      }
    }
    Utils.addWillChange(mainContent, CN.willChangeOpacityFilter);
    mainContainer.classList.add(CN.fullscreenEffectActive);
    html.classList.add(CN.fullscreenActive);
    Utils.addWillChange(container, CN.willChangeOpacity);
    Object.assign(container.style, { display: "flex" });
    container.removeAttribute("hidden");
    container.setAttribute("aria-hidden", "false");
    container.classList.remove(CN.active);
    container.classList.add(CN.isZooming);
  }

  _openInstantly() {
    const { container, sliderWrapper } = this.dom;
    const CN = CONFIG.SELECTORS.CLASS_NAMES;
    const targetIndex = this.state.currentIndex;

    this.state.isAnimatingZoom = false;
    container.classList.add(CN.active);
    container.classList.remove(CN.isZooming);
    Utils.removeWillChange(container, CN.willChangeOpacity);

    const targetSlide = sliderWrapper.children[targetIndex];
    if (targetSlide) {
      const scrollLeftTarget =
        targetSlide.offsetLeft -
        (sliderWrapper.offsetWidth - targetSlide.offsetWidth) / 2;
      sliderWrapper.scrollLeft = scrollLeftTarget;
    }

    this.state.isSliderOpen = true;
    this._updateAccessibilityState();
    this._focusCloseButton();
  }

  async _animateZoomIn() {
    const { container, sliderWrapper } = this.dom;
    const sourceImg = this.state.clickedImageElement;
    const targetIndex = this.state.currentIndex;
    const CN = CONFIG.SELECTORS.CLASS_NAMES;

    const firstRect = sourceImg?.getBoundingClientRect();
    const targetSlide = sliderWrapper.children[targetIndex];
    const targetSlideImage = targetSlide?.querySelector("img");

    const scrollLeftTarget =
      targetSlide.offsetLeft -
      (sliderWrapper.offsetWidth - targetSlide.offsetWidth) / 2;
    sliderWrapper.scrollLeft = scrollLeftTarget;

    // Force reflow
    targetSlideImage?.getBoundingClientRect();

    if (!firstRect || !targetSlideImage) {
      // Fallback to instant open
      this._openInstantly();
      return;
    }

    const lastRect = targetSlideImage.getBoundingClientRect();
    const deltaX = firstRect.left - lastRect.left;
    const deltaY = firstRect.top - lastRect.top;
    const scaleX = firstRect.width / lastRect.width;
    const scaleY = firstRect.height / lastRect.height;

    Utils.addWillChange(targetSlideImage, CN.willChangeTransformOpacity);
    Object.assign(targetSlideImage.style, {
      transformOrigin: "0 0",
      transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`,
      opacity: "0",
    });

    await new Promise((resolve) => requestAnimationFrame(resolve));
    if (!this.state.isAnimatingZoom) {
      Utils.removeWillChange(targetSlideImage, CN.willChangeTransformOpacity);
      return;
    }

    targetSlideImage.classList.add("fullscreen-image-transition");
    Object.assign(targetSlideImage.style, { transform: "", opacity: "1" });
    container.classList.add(CN.active);
    await Utils.createTransitionPromise(targetSlideImage, [
      "transform",
      "opacity",
    ]);
    this._onZoomInComplete(targetSlideImage);
  }

  async _animateZoomOut() {
    const { container, sliderWrapper, mainContainer, html, mainContent } =
      this.dom;
    const currentIndex = this.state.currentIndex;
    const CN = CONFIG.SELECTORS.CLASS_NAMES;

    const currentSlideElement = sliderWrapper.children[currentIndex];
    const currentSlideImage = currentSlideElement?.querySelector("img");
    const currentSlideData = this.visibleImageData[currentIndex];

    const targetElementContainer = document.querySelector(
      `.${CN.scrollGalleryMainItem}[data-original-index="${currentSlideData?.originalIndex}"]`
    );
    const targetImage = targetElementContainer?.querySelector("img");
    if (!currentSlideImage || !targetElementContainer || !targetImage) {
      this._closeInstantly();
      return;
    }

    const firstRect = currentSlideImage.getBoundingClientRect();

    Object.assign(targetElementContainer.style, {
      opacity: "",
      visibility: "",
      pointerEvents: "",
      transition: "",
    });
    Utils.removeWillChange(targetElementContainer, CN.willChangeOpacity);
    targetElementContainer.classList.remove(CN.sourceElementZooming);

    Utils.removeWillChange(mainContent, CN.willChangeOpacityFilter);
    container.classList.remove(CN.active);
    mainContainer.classList.remove(CN.fullscreenEffectActive);
    html.classList.remove(CN.fullscreenActive);
    container.classList.add(CN.isZooming);

    await new Promise((resolve) => requestAnimationFrame(resolve));
    if (!this.state.isAnimatingZoom) return;

    const lastRect = targetImage.getBoundingClientRect();
    const deltaX = lastRect.left - firstRect.left;
    const deltaY = lastRect.top - firstRect.top;
    const scaleX = lastRect.width / firstRect.width;
    const scaleY = lastRect.height / firstRect.height;

    Utils.addWillChange(currentSlideImage, CN.willChangeTransformOpacity);
    Object.assign(currentSlideImage.style, {
      transformOrigin: "0 0",
      transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`,
      opacity: "0",
    });
    currentSlideImage.classList.add("fullscreen-image-transition");
    await Utils.createTransitionPromise(currentSlideImage, [
      "transform",
      "opacity",
    ]);
    this._onZoomOutComplete(currentSlideImage);
  }

  _onZoomInComplete(transitionedImage) {
    if (!this.state.isAnimatingZoom) return;
    this._resetZoomStyles(transitionedImage);
    this.dom.container.classList.remove(CONFIG.SELECTORS.CLASS_NAMES.isZooming);
    Utils.removeWillChange(
      this.dom.container,
      CONFIG.SELECTORS.CLASS_NAMES.willChangeOpacity
    );
    const sourceContainer = this.state.clickedImageElement?.closest(
      `.${CONFIG.SELECTORS.CLASS_NAMES.scrollGalleryMainItem}`
    );
    if (sourceContainer && !this.prefersReducedMotion) {
      Object.assign(sourceContainer.style, {
        opacity: "",
        visibility: "",
        pointerEvents: "",
        transition: "",
      });
      Utils.removeWillChange(
        sourceContainer,
        CONFIG.SELECTORS.CLASS_NAMES.willChangeOpacity
      );
    }
    this.state.isAnimatingZoom = false;
    this.state.isSliderOpen = true;
    this._updateAccessibilityState();
    this._focusCloseButton();
  }

  _onZoomOutComplete(transitionedImage) {
    if (!this.state.isAnimatingZoom && !this.prefersReducedMotion) return;
    this._resetZoomStyles(transitionedImage);
    this._cleanupUIOnClose();
    this.state.isAnimatingZoom = false;
    this._restoreFocus();
    this.state.clickedImageElement = null;
  }

  _resetZoomStyles(imageElement) {
    imageElement.classList.remove("fullscreen-image-transition");
    Object.assign(imageElement.style, {
      transform: "",
      transformOrigin: "",
      opacity: "",
    });
    Utils.removeWillChange(
      imageElement,
      CONFIG.SELECTORS.CLASS_NAMES.willChangeTransformOpacity
    );
  }

  _cleanupUIOnClose() {
    const {
      container,
      sliderWrapper,
      mainContainer,
      mainContent,
      html,
      statusLabel,
    } = this.dom;
    const CN = CONFIG.SELECTORS.CLASS_NAMES;

    Object.assign(container.style, { display: "none" });
    container.setAttribute("hidden", "true");
    container.setAttribute("aria-hidden", "true");
    container.classList.remove(CN.active, CN.isZooming);
    Utils.removeWillChange(container, CN.willChangeOpacity);

    // Restore interactivity on background content
    mainContainer?.removeAttribute("inert");
    if (mainContent) {
      mainContent.setAttribute("aria-hidden", "false");
      Utils.removeWillChange(mainContent, CN.willChangeOpacityFilter);
    }
    html.classList.remove(CN.fullscreenActive);
    mainContainer.classList.remove(CN.fullscreenEffectActive);

    const sourceContainerSelector = `.${CN.scrollGalleryMainItem}`;
    const currentSlideData = this.visibleImageData?.[this.state.currentIndex];
    let sourceElement =
      currentSlideData && typeof currentSlideData.originalIndex === "number"
        ? document.querySelector(
            `${sourceContainerSelector}[data-original-index="${currentSlideData.originalIndex}"]`
          )
        : this.state.clickedImageElement?.closest(sourceContainerSelector) ||
          this.state.lastFocusedElement?.closest(sourceContainerSelector);
    if (sourceElement) {
      sourceElement.classList.remove(CN.sourceElementZooming);
      Object.assign(sourceElement.style, {
        opacity: "",
        visibility: "",
        pointerEvents: "",
        transition: "",
      });
      Utils.removeWillChange(sourceElement, CN.willChangeOpacity);
    }

    sliderWrapper.replaceChildren();
    statusLabel.textContent = "";
    this.visibleImageData = [];
    this.state.focusableElementsCache = [];

    Object.assign(this.state, {
      totalVisibleImages: 0,
      currentIndex: 0,
      scrollTimeoutId: null,
    });
    clearTimeout(this.state.scrollTimeoutId);
  }

  _closeInstantly() {
    const animatingImage = this.dom.sliderWrapper.querySelector(
      ".fullscreen-image-transition"
    );
    if (animatingImage) this._resetZoomStyles(animatingImage);
    this.state.isAnimatingZoom = false;
    this._cleanupUIOnClose();
    this.state.isSliderOpen = false;
    this._restoreFocus();
    this.state.clickedImageElement = null;
  }

  _focusCloseButton() {
    this.dom.closeButton?.focus?.({ preventScroll: true });
  }

  _restoreFocus() {
    (this.state.lastFocusedElement?.focus && this.state.lastFocusedElement)
      ? this.state.lastFocusedElement.focus({ preventScroll: true })
      : this.dom.body.focus?.({ preventScroll: true });
    this.state.lastFocusedElement = null;
  }

  navigate(direction) {
    if (
      this.state.isAnimatingZoom ||
      !this.state.isSliderOpen ||
      this.state.totalVisibleImages <= 1
    )
      return;
    const { sliderWrapper } = this.dom;
    const { currentIndex, totalVisibleImages } = this.state;
    const newIndex = currentIndex + direction;
    if (newIndex < 0 || newIndex >= totalVisibleImages) return;

    const targetSlide = sliderWrapper.children[newIndex];
    if (!targetSlide) return;
    const scrollLeftTarget =
      targetSlide.offsetLeft -
      (sliderWrapper.offsetWidth - targetSlide.offsetWidth) / 2;

    if (this.prefersReducedMotion) {
      sliderWrapper.scrollLeft = scrollLeftTarget;
      this._updateCurrentIndex(newIndex);
    } else {
      sliderWrapper.scrollTo({ left: scrollLeftTarget, behavior: "smooth" });
    }
  }

  _handleSlideClick(event) {
    if (this.state.isAnimatingZoom || !this.state.isSliderOpen) return;
    const clickedSlide = event.target?.closest(
      `.${CONFIG.SELECTORS.CLASS_NAMES.fullscreenSlide}`
    );
    if (
      !clickedSlide ||
      clickedSlide.classList.contains(
        CONFIG.SELECTORS.CLASS_NAMES.isActiveSlide
      )
    )
      return;
    const clickedIndex = parseInt(
      clickedSlide.dataset.slideIndex ?? "-1",
      10
    );
    if (clickedIndex >= 0 && clickedIndex < this.state.totalVisibleImages) {
      const targetSlide = this.dom.sliderWrapper.children[clickedIndex];
      const scrollLeftTarget =
        targetSlide.offsetLeft -
        (this.dom.sliderWrapper.offsetWidth - targetSlide.offsetWidth) / 2;

      if (this.prefersReducedMotion) {
        this.dom.sliderWrapper.scrollLeft = scrollLeftTarget;
        this._updateCurrentIndex(clickedIndex);
      } else {
        this.dom.sliderWrapper.scrollTo({
          left: scrollLeftTarget,
          behavior: "smooth",
        });
      }
    }
  }

  _updateAccessibilityState() {
    const { sliderWrapper, statusLabel } = this.dom;
    const { currentIndex, totalVisibleImages } = this.state;
    const { isActiveSlide } = CONFIG.SELECTORS.CLASS_NAMES;

    if (totalVisibleImages === 0) {
      statusLabel.textContent = "No images to display.";
      Array.from(sliderWrapper.children).forEach((slide) =>
        slide.classList.remove(isActiveSlide)
      );
      return;
    }

    const currentSlideData = this.visibleImageData[currentIndex];
    statusLabel.textContent = currentSlideData?.title
      ? `${currentSlideData.title}, slide ${currentIndex + 1} of ${totalVisibleImages}`
      : `Slide ${currentIndex + 1} of ${totalVisibleImages}`;

    Array.from(sliderWrapper.children).forEach((slide, index) => {
      const isActive = index === currentIndex;
      slide.classList.toggle(isActiveSlide, isActive);
      if (!this.prefersReducedMotion) {
        isActive || Math.abs(index - currentIndex) === 1
          ? Utils.addWillChange(
              slide,
              CONFIG.SELECTORS.CLASS_NAMES.willChangeOpacityFilter
            )
          : Utils.removeWillChange(
              slide,
              CONFIG.SELECTORS.CLASS_NAMES.willChangeOpacityFilter
            );
      }
      const imgData = this.visibleImageData[index];
      slide.setAttribute(
        "aria-label",
        `${Utils.getSafeAltText(
          imgData?.title,
          index
        )} (Slide ${index + 1} of ${totalVisibleImages})`
      );
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-roledescription", "slide");
    });

    // Preload neighbors for smoother navigation
    const preload = (i) => {
      if (i < 0 || i >= totalVisibleImages) return;
      const slide = sliderWrapper.children[i];
      if (!slide) return;
      const img = slide.querySelector("img");
      if (img?.decode) img.decode().catch(() => {});
    };
    preload(currentIndex - 1);
    preload(currentIndex);
    preload(currentIndex + 1);
  }

  _handleScroll() {
    if (this.state.isAnimatingZoom || !this.state.isSliderOpen) return;
    const wrapper = this.dom.sliderWrapper;
    clearTimeout(this.state.scrollTimeoutId);
    this.state.scrollTimeoutId = setTimeout(() => {
      if (this.state.isAnimatingZoom || !this.state.isSliderOpen) return;
      const scrollLeft = wrapper.scrollLeft;
      const wrapperWidth = wrapper.offsetWidth;
      let newIndex = -1;
      let minDistance = Infinity;
      Array.from(wrapper.children).forEach((slide, index) => {
        if (slide.offsetWidth > 0) {
          const distance = Math.abs(
            slide.offsetLeft +
              slide.offsetWidth / 2 -
              (scrollLeft + wrapperWidth / 2)
          );
          if (distance < minDistance) {
            minDistance = distance;
            newIndex = index;
          }
        }
      });
      if (newIndex !== -1 && newIndex !== this.state.currentIndex)
        this._updateCurrentIndex(newIndex);
    }, this.animationConfig.SLIDE_UPDATE_DELAY_MS);
  }

  _updateCurrentIndex(newIndex) {
    if (
      newIndex >= 0 &&
      newIndex < this.state.totalVisibleImages &&
      newIndex !== this.state.currentIndex
    ) {
      this.state.currentIndex = newIndex;
      this._updateAccessibilityState();
    }
  }

  _handleKeydown(event) {
    if (!this.state.isSliderOpen || this.state.isAnimatingZoom) return;
    let handled = true;
    switch (event.key) {
      case "Escape":
        this._requestClose();
        break;
      case "ArrowLeft":
      case "Left":
        this.navigate(-1);
        break;
      case "ArrowRight":
      case "Right":
        this.navigate(1);
        break;
      case "Tab":
        this._trapFocus(event);
        handled = false;
        break;
      case "Home":
        if (this.state.currentIndex > 0) this.navigate(-this.state.currentIndex);
        break;
      case "End":
        if (this.state.currentIndex < this.state.totalVisibleImages - 1)
          this.navigate(
            this.state.totalVisibleImages - 1 - this.state.currentIndex
          );
        break;
      default:
        handled = false;
    }
    if (handled) event.preventDefault();
  }

  _cacheFocusableElements() {
    this.state.focusableElementsCache = Array.from(
      this.dom.container.querySelectorAll(
        'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(
      (el) =>
        el.offsetParent !== null &&
        !el.closest('[aria-hidden="true"]') &&
        !el.hasAttribute("inert")
    );
  }

  _trapFocus(event) {
    const focusableElements = this.state.focusableElementsCache;
    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const currentActive = document.activeElement;
    if (event.shiftKey) {
      if (
        currentActive === firstElement ||
        !this.dom.container.contains(currentActive)
      ) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (
        currentActive === lastElement ||
        !this.dom.container.contains(currentActive)
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  _populateSlider() {
    const wrapper = this.dom.sliderWrapper;
    wrapper.replaceChildren();
    const fragment = document.createDocumentFragment();
    const CN = CONFIG.SELECTORS.CLASS_NAMES;

    if (!Array.isArray(this.visibleImageData) || this.visibleImageData.length === 0) {
      const emptyMsg = document.createElement("div");
      emptyMsg.textContent = "No images to display.";
      emptyMsg.className = CN.galleryEmptyMessage;
      emptyMsg.setAttribute("role", "status");
      fragment.appendChild(emptyMsg);
    } else {
      this.visibleImageData.forEach((imageData, index) => {
        const slide = document.createElement("div");
        slide.className = CN.fullscreenSlide;
        slide.dataset.slideIndex = String(index);
        slide.setAttribute("role", "group");
        slide.setAttribute("aria-roledescription", "slide");
        slide.setAttribute("aria-label", `Loading slide ${index + 1}`);

        const picture = document.createElement("picture");
        picture.classList.add(CN.slideLoadingPlaceholder);

        const sourceWebp = document.createElement("source");
        sourceWebp.type = "image/webp";
        sourceWebp.srcset =
          imageData.computedSrcset ||
          Utils.generateSrcset(
            imageData.src,
            this.galleryConfig.IMAGE_WIDTHS_FOR_SRCSET
          );
        sourceWebp.sizes = `(max-width: 61.9375rem) 85vw, 80vw`;

        const img = document.createElement("img");
        img.alt = Utils.getSafeAltText(imageData.title, index);
        img.loading = "lazy";
        img.decoding = "async";
        img.src = imageData.src;

        img.onerror = () => {
          slide.classList.add(CN.slideLoadError);
          picture.classList.remove(CN.slideLoadingPlaceholder);
          slide.appendChild(Utils.createErrorContent("Could not load image."));
        };
        img.onload = () => {
          slide.classList.add(CN.slideLoaded);
          picture.classList.remove(CN.slideLoadingPlaceholder);
        };

        picture.append(sourceWebp, img);
        slide.append(picture);
        fragment.append(slide);
      });
    }
    wrapper.appendChild(fragment);
    this._updateAccessibilityState();
  }

  handleResize() {
    if (!this.state.isSliderOpen) return;
    if (this.state.isAnimatingZoom) {
      this._closeInstantly();
      return;
    }
    const wrapper = this.dom.sliderWrapper;
    const currentIndex = this.state.currentIndex;
    const currentSlide = wrapper.children[currentIndex];
    if (currentSlide) {
      const newLeft =
        currentSlide.offsetLeft -
        (wrapper.offsetWidth - currentSlide.offsetWidth) / 2;
      wrapper.scrollLeft = newLeft;
      this._updateAccessibilityState();
      this._cacheFocusableElements();
    }
  }

  destroy() {
    if (!this.isInitialized) return;
    if (this.state.isSliderOpen || this.state.isAnimatingZoom)
      this._closeInstantly();
    this.dom.closeButton.removeEventListener(
      "click",
      this.state.boundHandlers.closeClick
    );
    this.dom.container.removeEventListener(
      "keydown",
      this.state.boundHandlers.keydown
    );
    this.dom.sliderWrapper.removeEventListener(
      "scroll",
      this.state.boundHandlers.scroll
    );
    this.dom.sliderWrapper.removeEventListener(
      "click",
      this.state.boundHandlers.slideClick
    );
    this.state.boundHandlers.scroll?.cancel?.();
    clearTimeout(this.state.scrollTimeoutId);
    this.isInitialized = false;
  }
}

/* =========================
   Scroll Mode Gallery
   ========================= */

class ScrollModeGallery {
  /**
   * @param {Gallery} galleryInstance
   * @param {Project[]} initialProjectsData
   */
  constructor(galleryInstance, initialProjectsData) {
    this.dom = {
      container: domElements.scrollModeGallery,
      thumbCol: domElements.thumbnailColumn,
      mainCol: domElements.mainImageColumn,
      thumbScroller: domElements.thumbnailScroller,
      mainScroller: domElements.mainImageScroller,
      cursor: domElements.activeCursor,
      status: domElements.scrollGalleryStatus,
    };
    this.galleryInstance = galleryInstance;
    this.projectsData = Array.isArray(initialProjectsData)
      ? initialProjectsData
      : [];
    this.config = CONFIG.SCROLL_MODE;
    this.animationConfig = CONFIG.ANIMATION;
    this.prefersReducedMotion = Utils.prefersReducedMotion();
    this.state = {
      y: { curr: 0, targ: 0, start: 0, lastTouchY: 0 },
      activeIndex: 0,
      items: [],
      filteredItems: [],
      fullscreenImageDataCache: [],
      maxScroll: 0,
      parallaxRatio: 0,
      containerHeight: 0,
      thumbContainerHeight: 0,
      isDragging: false,
      snapTimeout: null,
      rafId: null,
      activeFilter: CONFIG.DEFAULTS.FILTER,
      isInteracting: false,
      interactionTimeout: null,
      isTouchActive: false,
      metricsReady: false,
    };
    this.desktopMediaQuery = window.matchMedia(this.config.DESKTOP_MEDIA_QUERY);
    this.isDesktop = this.desktopMediaQuery.matches;
    this.boundHandlers = {
      update: this._update.bind(this),
      onWheel: this._onWheel.bind(this),
      onTouchStart: this._onTouchStart.bind(this),
      onTouchMove: this._onTouchMove.bind(this),
      onTouchEnd: this._onTouchEnd.bind(this),
      onKeyDown: this._onKeyDown.bind(this),
      debouncedOnResize: Utils.debounce(
        this._onResizeInternal.bind(this),
        CONFIG.ANIMATION.RESIZE_DEBOUNCE_MS
      ),
      onThumbnailClick: this._onThumbnailClick.bind(this),
      onMainImageClick: this._onMainImageClick.bind(this),
      onMediaQueryChange: this._onMediaQueryChange.bind(this),
    };
    this.resizeObserver = /** @type {ResizeObserver|null} */ (null);
    this.isInitialized = true;
  }

  setPrefersReducedMotion(value) {
    this.prefersReducedMotion = !!value;
    if (this.prefersReducedMotion) {
      this._stopAnimationLoop();
    } else if (this.state.metricsReady && this.isDesktop && this.state.maxScroll > 0) {
      this._startAnimationLoop();
    }
  }

  init() {
    if (!this.isInitialized) return;
    this.dom.container.tabIndex = 0;
    this.desktopMediaQuery.addEventListener(
      "change",
      this.boundHandlers.onMediaQueryChange
    );
    // Observe container columns for dynamic layout changes
    if ("ResizeObserver" in window) {
      this.resizeObserver = new ResizeObserver(() => this.handleResize());
      if (this.dom.mainCol) this.resizeObserver.observe(this.dom.mainCol);
      if (this.isDesktop && this.dom.thumbCol)
        this.resizeObserver.observe(this.dom.thumbCol);
    }
    this.applyFilter(this.state.activeFilter, true);
    this._bindContainerEvents();
  }

  applyFilter(filterCategory, isInitialLoad = false) {
    if (!isInitialLoad && filterCategory === this.state.activeFilter) return;
    this._stopAnimationLoop();
    this._clearSnapTimeout();
    Object.assign(this.state, {
      isDragging: false,
      isInteracting: false,
      isTouchActive: false,
      activeFilter: filterCategory,
      y: { ...this.state.y, curr: 0, targ: 0 },
      activeIndex: 0,
      metricsReady: false,
    });
    clearTimeout(this.state.interactionTimeout);
    this.state.interactionTimeout = null;
    this.dom.container.classList.remove(
      CONFIG.SELECTORS.CLASS_NAMES.isDragging
    );
    this._removeWindowTouchListeners();
    this._applyTransformsDOM(0);
    if (this.dom.cursor) this.dom.cursor.style.opacity = "0";

    const items = this.projectsData.filter(
      (p) =>
        filterCategory === CONFIG.DEFAULTS.FILTER || p.category === filterCategory
    );
    this.state.filteredItems = items;
    this._renderItems();
    if (!isInitialLoad)
      requestAnimationFrame(() =>
        this.dom.container.focus({ preventScroll: true })
      );
  }

  _renderItems() {
    this._unbindItemListeners();
    this.dom.thumbScroller.replaceChildren();
    this.dom.mainScroller.replaceChildren();
    this.state.metricsReady = false;

    if (this.state.filteredItems.length === 0) {
      const emptyMsgPara = document.createElement("p");
      emptyMsgPara.className =
        CONFIG.SELECTORS.CLASS_NAMES.galleryEmptyMessage;
      emptyMsgPara.setAttribute("role", "status");
      emptyMsgPara.textContent = `No projects found for '${this.state.activeFilter}'.`;
      this.dom.mainScroller.appendChild(emptyMsgPara);
      this.state.items = [];
      this.state.fullscreenImageDataCache = [];
      this._refreshAndUpdateLayout(0, true);
      return;
    }

    const { thumbFragment, mainFragment } = this._buildGalleryDOMFragments();
    this.dom.thumbScroller.appendChild(thumbFragment);
    this.dom.mainScroller.appendChild(mainFragment);
    this._bindItemListeners();
    this._refreshAndUpdateLayout(this.state.activeIndex, true);
  }

  _buildGalleryDOMFragments() {
    const thumbFragment = document.createDocumentFragment();
    const mainFragment = document.createDocumentFragment();
    this.state.items = [];
    this.state.fullscreenImageDataCache = [];

    this.state.filteredItems.forEach((project, index) => {
      const thumbDiv = this._createItemElement("thumb", project, index);
      const mainDiv = this._createItemElement("main", project, index);
      thumbFragment.appendChild(thumbDiv);
      mainFragment.appendChild(mainDiv);
      this.state.items.push({
        thumb: thumbDiv,
        main: mainDiv,
        data: project,
        index,
        mainY: 0,
        thumbY: 0,
        thumbBorderY: 0,
        mainActualHeight: 0,
        mainFullHeight: 0,
        mainMarginTop: 0,
        mainMarginBottom: 0,
        thumbActualHeight: 0,
        thumbFullHeight: 0,
        thumbMarginTop: 0,
        thumbMarginBottom: 0,
      });
      this.state.fullscreenImageDataCache.push({
        src: project.src,
        title: project.title || "",
        originalIndex: project.originalIndex,
        computedSrcset: project.computedSrcset,
      });
    });

    return { thumbFragment, mainFragment };
  }

  _createItemElement(type, project, index) {
    const div = document.createElement("div");
    const isThumb = type === "thumb";
    const CN = CONFIG.SELECTORS.CLASS_NAMES;

    div.className = isThumb ? CN.scrollGalleryThumbItem : CN.scrollGalleryMainItem;
    div.dataset.index = String(index);
    if (typeof project.originalIndex === "number")
      div.dataset.originalIndex = String(project.originalIndex);

    const altText = Utils.getSafeAltText(project.title, index);
    div.setAttribute("aria-label", isThumb ? `Thumbnail: ${altText}` : `View ${altText}`);
    div.tabIndex = -1;

    const picture = document.createElement("picture");
    const sourceWebp = document.createElement("source");
    sourceWebp.type = "image/webp";
    sourceWebp.srcset =
      project.computedSrcset ||
      Utils.generateSrcset(project.src, CONFIG.GALLERY.IMAGE_WIDTHS_FOR_SRCSET);
    sourceWebp.sizes = isThumb
      ? "(max-width: 61.9375rem) 90px, 130px"
      : `(max-width: 61.9375rem) calc(100vw - 3.125rem), (min-width: 62rem) and (max-width: 75rem) calc(100vw - 25.9375rem), (min-width: 75.0625rem) calc(100vw - 30.9375rem)`;

    const img = document.createElement("img");
    img.alt = altText;
    img.loading = "lazy";
    img.decoding = "async";
    img.src = project.src;
    img.onerror = () => {
      div.classList.add(isThumb ? CN.scrollGalleryThumbItemError : CN.scrollGalleryMainItemError);
      div.appendChild(Utils.createErrorContent("Could not load image."));
    };

    picture.append(sourceWebp, img);
    div.append(picture);
    return div;
  }

  async _calculateMetrics() {
    this.state.metricsReady = false;
    this._fetchContainerDimensions();
    if (this.state.items.length === 0) {
      this._resetMetrics();
      this.state.metricsReady = true;
      return;
    }

    const imageLoadPromises = this.state.items
      .flatMap((item) =>
        [item.main, this.isDesktop && item.thumb]
          .map((el) => el?.querySelector("img"))
          .filter(Boolean)
      )
      .filter((img) => img && !img.complete)
      .map(
        (img) =>
          new Promise((resolve) => {
            img.onload = img.onerror = resolve;
          })
      );

    if (imageLoadPromises.length > 0) await Promise.all(imageLoadPromises);

    for (const item of this.state.items) {
      const mainDims = await this._fetchValidatedItemDimensions(() => item.main);
      item.mainActualHeight = mainDims.offsetHeight;
      item.mainMarginTop = mainDims.marginTop;
      item.mainMarginBottom = mainDims.marginBottom;
      item.mainFullHeight = mainDims.fullHeight;
      if (this.isDesktop && item.thumb) {
        const thumbDims = await this._fetchValidatedItemDimensions(() => item.thumb);
        item.thumbActualHeight = thumbDims.offsetHeight;
        item.thumbMarginTop = thumbDims.marginTop;
        item.thumbMarginBottom = thumbDims.marginBottom;
        item.thumbFullHeight = thumbDims.fullHeight;
      } else {
        Object.assign(item, {
          thumbActualHeight: 0,
          thumbFullHeight: 0,
          thumbMarginTop: 0,
          thumbMarginBottom: 0,
        });
      }
    }
    this._updateItemPositionsAndCalculateScrollParameters();
    this.state.metricsReady = true;
  }

  async _fetchValidatedItemDimensions(itemElementFn) {
    const element = itemElementFn();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const style = getComputedStyle(element);
    const marginTop = parseFloat(style.marginTop) || 0;
    const marginBottom = parseFloat(style.marginBottom) || 0;
    const offsetHeight = element.offsetHeight || 0;
    return {
      offsetHeight,
      fullHeight: offsetHeight + marginTop + marginBottom,
      marginTop,
      marginBottom,
    };
  }

  _fetchContainerDimensions() {
    this.state.containerHeight = this.dom.mainCol.offsetHeight;
    this.state.thumbContainerHeight = this.isDesktop ? this.dom.thumbCol.offsetHeight : 0;
  }

  _updateItemPositionsAndCalculateScrollParameters() {
    let currentMainY = 0;
    let thumbContentHeight = 0;
    this.state.items.forEach((item, index) => {
      item.mainY = currentMainY;
      currentMainY += item.mainFullHeight;

      if (this.isDesktop && item.thumbActualHeight > 0) {
        if (index === 0) item.thumbBorderY = item.thumbMarginTop;
        else {
          const prevItem = this.state.items[index - 1];
          item.thumbBorderY =
            prevItem.thumbBorderY +
            prevItem.thumbActualHeight +
            Math.max(prevItem.thumbMarginBottom, item.thumbMarginTop);
        }
        item.thumbY = item.thumbBorderY - item.thumbMarginTop;
      } else {
        item.thumbBorderY = 0;
        item.thumbY = 0;
      }
    });

    if (this.isDesktop && this.state.items.length > 0) {
      const lastThumbItem = this.state.items[this.state.items.length - 1];
      if (lastThumbItem.thumbActualHeight > 0) {
        thumbContentHeight =
          lastThumbItem.thumbBorderY +
          lastThumbItem.thumbActualHeight +
          lastThumbItem.thumbMarginBottom;
      }
    }

    this.state.maxScroll = Math.max(0, currentMainY - this.state.containerHeight);
    this.state.parallaxRatio = 0;

    if (this.isDesktop && this.state.thumbContainerHeight > 0 && thumbContentHeight > 0) {
      const totalThumbScrollableHeight = Math.max(
        0,
        thumbContentHeight - this.state.thumbContainerHeight
      );
      if (totalThumbScrollableHeight > 0 && this.state.maxScroll > 0)
        this.state.parallaxRatio = totalThumbScrollableHeight / this.state.maxScroll;
    }
  }

  _resetMetrics() {
    Object.assign(this.state, {
      maxScroll: 0,
      parallaxRatio: 0,
      containerHeight: this.dom.mainCol.offsetHeight,
      thumbContainerHeight: this.isDesktop ? this.dom.thumbCol.offsetHeight : 0,
      metricsReady: false,
    });
    this.state.items.forEach((item) => {
      Object.assign(item, {
        mainY: 0,
        thumbY: 0,
        thumbBorderY: 0,
        mainActualHeight: 0,
        mainFullHeight: 0,
        mainMarginTop: 0,
        mainMarginBottom: 0,
        thumbActualHeight: 0,
        thumbFullHeight: 0,
        thumbMarginTop: 0,
        thumbMarginBottom: 0,
      });
    });
    if (this.dom.cursor)
      Object.assign(this.dom.cursor.style, {
        height: "0px",
        opacity: "0",
        transform: "translateY(0px)",
      });
  }

  _bindContainerEvents() {
    this.dom.container.addEventListener("wheel", this.boundHandlers.onWheel, {
      passive: false,
    });
    this.dom.container.addEventListener(
      "touchstart",
      this.boundHandlers.onTouchStart,
      {
        passive: false,
      }
    );
    this.dom.container.addEventListener("keydown", this.boundHandlers.onKeyDown);
  }
  _unbindContainerEvents() {
    this.dom.container.removeEventListener("wheel", this.boundHandlers.onWheel);
    this.dom.container.removeEventListener(
      "touchstart",
      this.boundHandlers.onTouchStart
    );
    this.dom.container.removeEventListener("keydown", this.boundHandlers.onKeyDown);
    this._removeWindowTouchListeners();
  }
  _addWindowTouchListeners() {
    window.addEventListener("touchmove", this.boundHandlers.onTouchMove, {
      passive: false,
    });
    window.addEventListener("touchend", this.boundHandlers.onTouchEnd, {
      passive: true,
    });
    window.addEventListener("touchcancel", this.boundHandlers.onTouchEnd, {
      passive: true,
    });
  }
  _removeWindowTouchListeners() {
    window.removeEventListener("touchmove", this.boundHandlers.onTouchMove);
    window.removeEventListener("touchend", this.boundHandlers.onTouchEnd);
    window.removeEventListener("touchcancel", this.boundHandlers.onTouchEnd);
  }
  _bindItemListeners() {
    this.state.items.forEach((item) => {
      item.thumb?.addEventListener("click", this.boundHandlers.onThumbnailClick);
      item.main?.addEventListener("click", this.boundHandlers.onMainImageClick);
    });
  }
  _unbindItemListeners() {
    this.state.items.forEach((item) => {
      item.thumb?.removeEventListener("click", this.boundHandlers.onThumbnailClick);
      item.main?.removeEventListener("click", this.boundHandlers.onMainImageClick);
    });
  }
  _unbindAllEvents() {
    this._unbindContainerEvents();
    this._unbindItemListeners();
    this.desktopMediaQuery.removeEventListener(
      "change",
      this.boundHandlers.onMediaQueryChange
    );
  }

  _update() {
    if (!this.state.metricsReady) {
      this._stopAnimationLoop();
      return;
    }
    Utils.addWillChange(
      this.dom.mainScroller,
      CONFIG.SELECTORS.CLASS_NAMES.willChangeTransform
    );
    if (this.isDesktop) {
      Utils.addWillChange(
        this.dom.thumbScroller,
        CONFIG.SELECTORS.CLASS_NAMES.willChangeTransform
      );
      Utils.addWillChange(
        this.dom.cursor,
        CONFIG.SELECTORS.CLASS_NAMES.willChangeTransformOpacity
      );
    }

    const delta = this.state.y.targ - this.state.y.curr;
    if (
      Math.abs(delta) > this.animationConfig.UPDATE_EPSILON ||
      this.state.isInteracting
    ) {
      this.state.y.curr =
        this.isDesktop && !this.prefersReducedMotion
          ? this.state.y.curr + delta * this.animationConfig.LERP_FACTOR
          : this.state.y.targ;
      this.state.y.curr = Math.max(
        0,
        Math.min(this.state.y.curr, this.state.maxScroll)
      );
      this._updateActiveIndexBasedOnScroll(this.state.y.curr);
      this._applyTransformsDOM(this.state.y.curr);
      this._updateCursorPositionDOM();
    }

    if (
      Math.abs(this.state.y.targ - this.state.y.curr) >
        this.animationConfig.UPDATE_EPSILON ||
      this.state.isInteracting
    ) {
      this.state.rafId = requestAnimationFrame(this.boundHandlers.update);
    } else {
      if (this.state.y.curr !== this.state.y.targ) {
        this.state.y.curr = this.state.y.targ;
        this._applyTransformsDOM(this.state.y.curr);
        this._updateCursorPositionDOM();
      }
      this._stopAnimationLoop();
    }
  }

  _startAnimationLoop() {
    if (
      this.isInitialized &&
      !this.state.rafId &&
      this.state.metricsReady &&
      ((this.isDesktop &&
        !this.prefersReducedMotion &&
        this.state.maxScroll > 0) ||
        this.state.isInteracting)
    ) {
      this.state.rafId = requestAnimationFrame(this.boundHandlers.update);
    }
  }
  _stopAnimationLoop() {
    if (this.state.rafId) {
      cancelAnimationFrame(this.state.rafId);
      this.state.rafId = null;
    }
    Utils.removeWillChange(
      this.dom.mainScroller,
      CONFIG.SELECTORS.CLASS_NAMES.willChangeTransform
    );
    if (this.isDesktop) {
      Utils.removeWillChange(
        this.dom.thumbScroller,
        CONFIG.SELECTORS.CLASS_NAMES.willChangeTransform
      );
      Utils.removeWillChange(
        this.dom.cursor,
        CONFIG.SELECTORS.CLASS_NAMES.willChangeTransformOpacity
      );
    }
  }
  _applyTransformsDOM(currentY) {
    this.dom.mainScroller.style.transform = `translateY(-${currentY.toFixed(2)}px)`;
    if (this.isDesktop)
      this.dom.thumbScroller.style.transform = `translateY(-${(
        this.state.parallaxRatio > 0 ? currentY * this.state.parallaxRatio : 0
      ).toFixed(2)}px)`;
  }

  _updateActiveIndexBasedOnScroll(currentY) {
    const numItems = this.state.items.length;
    if (numItems === 0 || this.state.containerHeight <= 0) {
      if (this.state.activeIndex !== 0) {
        const oldActiveThumb =
          this.isDesktop &&
          this.dom.thumbScroller.querySelector(`.${CONFIG.SELECTORS.CLASS_NAMES.active}`);
        if (oldActiveThumb) this._updateThumbItemVisualState(oldActiveThumb, false);
        this.state.activeIndex = 0;
        this._updateGalleryStatusText(null, 0);
      }
      if (this.isDesktop) this.dom.cursor.style.opacity = "0";
      return;
    }

    let closestIndex = 0;
    const firstItem = this.state.items[0];
    const lastItem = this.state.items[numItems - 1];

    if (firstItem.mainActualHeight > 0 && currentY <= firstItem.mainActualHeight / 2) {
      closestIndex = 0;
    } else if (
      lastItem.mainActualHeight > 0 &&
      currentY >= this.state.maxScroll - lastItem.mainActualHeight / 2
    ) {
      closestIndex = numItems - 1;
    } else {
      let minDiff = Infinity;
      for (let i = 0; i < numItems; i++) {
        const item = this.state.items[i];
        const itemCenter = item.mainY + item.mainActualHeight / 2;
        const diff = Math.abs(itemCenter - (currentY + this.state.containerHeight / 2));
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = i;
        } else if (diff > minDiff && i > closestIndex) break;
      }
    }

    if (closestIndex !== this.state.activeIndex)
      this._setActiveItem(Math.max(0, Math.min(closestIndex, numItems - 1)));
  }

  _setActiveItem(index, immediate = false) {
    if (this.state.items.length === 0) {
      if (this.state.activeIndex !== 0) {
        const oldActiveThumb =
          this.isDesktop &&
          this.dom.thumbScroller.querySelector(`.${CONFIG.SELECTORS.CLASS_NAMES.active}`);
        if (oldActiveThumb) this._updateThumbItemVisualState(oldActiveThumb, false);
        this.state.activeIndex = 0;
        this._updateGalleryStatusText(null, 0);
      }
      if (this.isDesktop) this.dom.cursor.style.opacity = "0";
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
    this._updateGalleryStatusText(newItemData.data, index);

    if (immediate && this.state.metricsReady) this._updateCursorPositionDOM();
  }

  _updateThumbItemVisualState(itemElement, isActive) {
    if (!this.isDesktop || !itemElement) return;
    itemElement.classList.toggle(CONFIG.SELECTORS.CLASS_NAMES.active, isActive);
    itemElement.setAttribute("aria-current", isActive ? "true" : "false");
  }

  _updateGalleryStatusText(itemData, index) {
    if (!this.dom.status) return;
    this.dom.status.textContent = itemData
      ? `${itemData.title || `Item ${index + 1}`}, item ${index + 1} of ${this.state.items.length}`
      : this.state.items.length === 0
      ? "No items to display."
      : "Error selecting item.";
  }

  _updateCursorPositionDOM() {
    if (
      !this.dom.cursor ||
      !this.isDesktop ||
      !this.state.metricsReady ||
      this.state.items.length === 0 ||
      this.state.activeIndex < 0 ||
      this.state.activeIndex >= this.state.items.length
    ) {
      if (this.dom.cursor && this.dom.cursor.style.opacity !== "0") {
        Object.assign(this.dom.cursor.style, {
          opacity: "0",
          transform: "translateY(0px)",
          height: "0px",
        });
      }
      return;
    }

    const activeItem = this.state.items[this.state.activeIndex];
    if (
      !activeItem ||
      typeof activeItem.thumbBorderY !== "number" ||
      !activeItem.thumb ||
      typeof activeItem.thumbMarginTop !== "number"
    ) {
      if (this.dom.cursor.style.opacity !== "0") {
        this.dom.cursor.style.opacity = "0";
        this.dom.cursor.style.height = "0px";
      }
      return;
    }

    let finalCursorHeight = activeItem.thumbActualHeight;
    let verticalCenteringOffset = 0;
    const imgElement = activeItem.thumb.querySelector("img");

    if (
      imgElement &&
      activeItem.thumbActualHeight > 0 &&
      imgElement.complete &&
      imgElement.naturalHeight > 0
    ) {
      const thumbItemContentWidth = activeItem.thumb.clientWidth;
      if (thumbItemContentWidth > 0 && imgElement.naturalWidth > 0) {
        const imageRenderedHeight =
          (imgElement.naturalHeight / imgElement.naturalWidth) * thumbItemContentWidth;
        if (imageRenderedHeight > 0 && imageRenderedHeight < activeItem.thumbActualHeight) {
          verticalCenteringOffset = (activeItem.thumbActualHeight - imageRenderedHeight) / 2;
          finalCursorHeight = imageRenderedHeight;
        }
      }
    }

    finalCursorHeight = Math.max(0, finalCursorHeight);
    const cursorTargetY =
      activeItem.thumbBorderY +
      verticalCenteringOffset -
      this.state.y.curr * (this.state.parallaxRatio > 0 ? this.state.parallaxRatio : 0);

    this.dom.cursor.style.height = `${finalCursorHeight.toFixed(2)}px`;
    this.dom.cursor.style.transform = `translateY(${cursorTargetY.toFixed(2)}px)`;
    this.dom.cursor.style.opacity = finalCursorHeight > 0 ? "1" : "0";
  }

  _onWheel(event) {
    if (!this.state.metricsReady || this.state.maxScroll <= 0) return;
    event.preventDefault();
    this._clearSnapTimeout();
    this.state.isInteracting = true;
    clearTimeout(this.state.interactionTimeout);
    this.state.interactionTimeout = setTimeout(() => {
      this.state.isInteracting = false;
      if (!this.state.isDragging && this.state.metricsReady) this._snapToIndex(this.state.activeIndex);
    }, 150);
    this._updateTargetScroll(event.deltaY * this.config.WHEEL_MULTIPLIER);
    this._startAnimationLoop();
  }

  _onTouchStart(event) {
    if (
      !this.state.metricsReady ||
      this.state.maxScroll <= 0 ||
      !this.dom.container.contains(event.target) ||
      event.touches.length !== 1
    ) {
      if (this.state.isTouchActive) this._onTouchEnd(event);
      return;
    }
    event.preventDefault();
    this._clearSnapTimeout();
    Object.assign(this.state, {
      isDragging: true,
      isInteracting: true,
      isTouchActive: true,
      y: { ...this.state.y, start: event.touches[0].clientY, lastTouchY: event.touches[0].clientY },
    });
    this.dom.container.classList.add(CONFIG.SELECTORS.CLASS_NAMES.isDragging);
    this._addWindowTouchListeners();
    this._startAnimationLoop();
  }
  _onTouchMove(event) {
    if (!this.state.isTouchActive || event.touches.length !== 1) return;
    event.preventDefault();
    const currentY = event.touches[0].clientY;
    this._updateTargetScroll((this.state.y.lastTouchY - currentY) * this.config.DRAG_MULTIPLIER);
    this.state.y.lastTouchY = currentY;
  }
  _onTouchEnd(event) {
    if (!this.state.isTouchActive || event.touches.length !== 0) return;
    Object.assign(this.state, { isDragging: false, isInteracting: false, isTouchActive: false });
    clearTimeout(this.state.interactionTimeout);
    this.dom.container.classList.remove(CONFIG.SELECTORS.CLASS_NAMES.isDragging);
    this._removeWindowTouchListeners();
    this._triggerSnap();
  }

  _onKeyDown(event) {
    if (!this.state.metricsReady || this.state.items.length === 0) return;
    let handled = true;
    let newActiveIndex = this.state.activeIndex;
    switch (event.key) {
      case "ArrowDown":
      case "Down":
        newActiveIndex = Math.min(this.state.activeIndex + 1, this.state.items.length - 1);
        break;
      case "ArrowUp":
      case "Up":
        newActiveIndex = Math.max(this.state.activeIndex - 1, 0);
        break;
      case "PageDown":
        newActiveIndex = this._getIndexForYPosition(
          Math.min(this.state.y.curr + this.state.containerHeight, this.state.maxScroll) +
            this.state.containerHeight / 2
        );
        break;
      case "PageUp":
        newActiveIndex = this._getIndexForYPosition(
          Math.max(this.state.y.curr - this.state.containerHeight, 0) +
            this.state.containerHeight / 2
        );
        break;
      case "Home":
        newActiveIndex = 0;
        break;
      case "End":
        newActiveIndex = this.state.items.length - 1;
        break;
      case "Enter":
      case " ":
        this._onMainImageClick({ currentTarget: this.state.items[this.state.activeIndex].main });
        break;
      default:
        handled = false;
    }
    if (newActiveIndex !== this.state.activeIndex) {
      this._clearSnapTimeout();
      this._setActiveItem(newActiveIndex);
      this._snapToIndex(newActiveIndex);
      this._startAnimationLoop();
    }
    if (handled) event.preventDefault();
  }

  _getIndexForYPosition(targetYViewCenter) {
    if (this.state.items.length === 0 || this.state.containerHeight <= 0) return 0;
    let closestIndex = 0;
    let minDiff = Infinity;
    for (let i = 0; i < this.state.items.length; i++) {
      const item = this.state.items[i];
      const diff = Math.abs(item.mainY + item.mainActualHeight / 2 - targetYViewCenter);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      } else if (diff > minDiff && i > closestIndex) break;
    }
    return Math.max(0, Math.min(closestIndex, this.state.items.length - 1));
  }

  async _refreshAndUpdateLayout(activeIndexHint = -1, forceSnapAndAnimate = false) {
    this._stopAnimationLoop();
    this.state.metricsReady = false;
    const oldActiveIndex = activeIndexHint !== -1 ? activeIndexHint : this.state.activeIndex;
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await this._calculateMetrics();

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
      this._applyTransformsDOM(this.state.y.curr);
      this._updateCursorPositionDOM();
      if (
        forceSnapAndAnimate ||
        (this.isDesktop &&
          !this.prefersReducedMotion &&
          this.state.items.length > 0 &&
          this.state.maxScroll > 0)
      )
        this._startAnimationLoop();
    });
  }

  async _onMediaQueryChange(event) {
    const oldIsDesktop = this.isDesktop;
    this.isDesktop = event.matches;
    if (oldIsDesktop !== this.isDesktop)
      await this._refreshAndUpdateLayout(this.state.activeIndex, true);
  }

  handleResize() {
    this.boundHandlers.debouncedOnResize();
  }

  async _onResizeInternal() {
    await this._refreshAndUpdateLayout(this.state.activeIndex, false);
  }

  _updateTargetScroll(delta) {
    this.state.y.targ = Math.max(
      0,
      Math.min(this.state.y.targ + delta, this.state.maxScroll)
    );
  }

  _onThumbnailClick(event) {
    if (!this.isDesktop || !this.state.metricsReady) return;
    const index = parseInt(event.currentTarget.dataset.index ?? "-1", 10);
    if (index !== this.state.activeIndex) {
      this._clearSnapTimeout();
      this._setActiveItem(index);
      this._snapToIndex(index);
      this._startAnimationLoop();
    }
  }

  _onMainImageClick(event) {
    if (!this.state.metricsReady) return;
    const index = parseInt(event.currentTarget.dataset.index ?? "-1", 10);
    if (index === this.state.activeIndex) {
      if (this.galleryInstance?.isInitialized)
        this.galleryInstance.open(
          this.state.fullscreenImageDataCache,
          index,
          event.currentTarget.querySelector("img"),
          this.state.items[index].main
        );
    } else {
      this._clearSnapTimeout();
      this._setActiveItem(index);
      this._snapToIndex(index);
      this._startAnimationLoop();
    }
  }

  _triggerSnap() {
    if (this.state.isDragging || this.state.items.length === 0 || !this.state.metricsReady || this.state.maxScroll <= 0)
      return;
    this._clearSnapTimeout();
    this.state.snapTimeout = setTimeout(() => {
      if (!this.state.isDragging && this.state.metricsReady) {
        this._snapToIndex(this.state.activeIndex);
        this._startAnimationLoop();
      }
    }, this.animationConfig.SNAP_TIMEOUT_MS);
  }

  _snapToIndex(index) {
    if (!this.state.metricsReady || index < 0 || index >= this.state.items.length) {
      this.state.y.targ = Math.max(0, Math.min(this.state.y.targ ?? 0, this.state.maxScroll ?? 0));
      return;
    }
    const itemData = this.state.items[index];
    if (itemData.mainActualHeight <= 0 || this.state.containerHeight <= 0) {
      this.state.y.targ =
        index === 0
          ? 0
          : Math.max(0, Math.min(itemData.mainY, this.state.maxScroll ?? 0));
      return;
    }
    this.state.y.targ = Math.max(
      0,
      Math.min(
        itemData.mainY + itemData.mainActualHeight / 2 - this.state.containerHeight / 2,
        this.state.maxScroll ?? 0
      )
    );
  }

  _clearSnapTimeout() {
    if (this.state.snapTimeout) {
      clearTimeout(this.state.snapTimeout);
      this.state.snapTimeout = null;
    }
  }

  destroy() {
    if (!this.isInitialized) return;
    this._stopAnimationLoop();
    this._clearSnapTimeout();
    clearTimeout(this.state.interactionTimeout);
    this._unbindAllEvents();
    this.boundHandlers.debouncedOnResize?.cancel?.();
    this.resizeObserver?.disconnect?.();
    this.dom.thumbScroller.replaceChildren();
    this.dom.mainScroller.replaceChildren();
    this.dom.container.tabIndex = -1;
    if (this.dom.cursor)
      Object.assign(this.dom.cursor.style, { opacity: "0", transform: "translateY(0px)" });
    if (this.dom.status) this.dom.status.textContent = "";
    this.isInitialized = false;
  }
}

/* =========================
   UI Controls and Navigation
   ========================= */

class UI {
  /**
   * @param {BackgroundAnimation} bgAnimInstance
   * @param {ScrollModeGallery} scrollGalleryInstance
   */
  constructor(bgAnimInstance, scrollGalleryInstance) {
    this.dom = {
      root: domElements.root,
      html: domElements.html,
      body: domElements.body,
      darkModeButton: domElements.darkModeButton,
      darkModeIcon: domElements.darkModeIcon,
      hueShiftButton: domElements.hueShiftButton,
      roleElement: domElements.roleElement,
      filterList: domElements.filterList,
      navLinks: domElements.navLinksQuery || [],
      filterButtons: [],
    };
    this.config = CONFIG;
    this.backgroundAnimation = bgAnimInstance;
    this.scrollGallery = scrollGalleryInstance;
    this.prefersReducedMotion = Utils.prefersReducedMotion();
    this.state = {
      theme: { hue: 0, isDark: this._getInitialDarkModePreference() },
      roleTyping: {
        currentIndex: -1,
        charIndex: 0,
        animationFrameId: null,
        roles: [...this.config.DEFAULTS.ROLES],
        lastTimestamp: 0,
        currentRoleText: "",
        isErasing: false,
        isPaused: false,
        pauseEndTime: 0,
      },
      activeFilter: this.config.DEFAULTS.FILTER,
      currentFocusedFilterButton: null,
    };
    this.boundHandlers = {
      navClick: this._handleNavClick.bind(this),
      filterClick: this._handleFilterClick.bind(this),
      filterKeydown: this._handleFilterKeydown.bind(this),
      toggleDark: this.toggleDarkMode.bind(this),
      shiftHue: this.shiftThemeHue.bind(this),
      roleTypeLoop: this._roleTypeLoop.bind(this),
    };
    this.isInitialized = true;
  }

  init() {
    this.applyTheme();
    if (this.dom.roleElement) {
      if (!this.prefersReducedMotion) this.startRoleTypingAnimation();
      else {
        this.dom.roleElement.textContent = this.state.roleTyping.roles[0] || "";
        this.dom.roleElement.style.borderRightColor = "transparent";
      }
    }
    this._populateFilterButtonsCacheAndSetupRovingTabindex();
    this._bindEvents();
    this._updateFilterButtonsState();
  }

  _populateFilterButtonsCacheAndSetupRovingTabindex() {
    if (!this.dom.filterList) return;
    this.dom.filterButtons = Array.from(
      this.dom.filterList.querySelectorAll(
        CONFIG.SELECTORS.DYNAMIC_SELECTORS.filterButton
      )
    );
    if (this.dom.filterButtons.length === 0) return;
    let initialFocusSet = false;
    this.dom.filterButtons.forEach((button) => {
      if (button.classList.contains(CONFIG.SELECTORS.CLASS_NAMES.active)) {
        button.setAttribute("tabindex", "0");
        this.state.currentFocusedFilterButton = button;
        initialFocusSet = true;
      } else {
        button.setAttribute("tabindex", "-1");
      }
    });
    if (!initialFocusSet) {
      this.dom.filterButtons[0].setAttribute("tabindex", "0");
      this.state.currentFocusedFilterButton = this.dom.filterButtons[0];
    }
  }

  _bindEvents() {
    this.dom.darkModeButton?.addEventListener(
      "click",
      this.boundHandlers.toggleDark
    );
    this.dom.hueShiftButton?.addEventListener(
      "click",
      this.boundHandlers.shiftHue
    );
    this.dom.navLinks.forEach((link) =>
      link.addEventListener("click", this.boundHandlers.navClick)
    );
    if (this.dom.filterList) {
      this.dom.filterList.addEventListener("click", this.boundHandlers.filterClick);
      this.dom.filterList.addEventListener("keydown", this.boundHandlers.filterKeydown);
    }
  }

  _unbindEvents() {
    this.dom.darkModeButton?.removeEventListener(
      "click",
      this.boundHandlers.toggleDark
    );
    this.dom.hueShiftButton?.removeEventListener(
      "click",
      this.boundHandlers.shiftHue
    );
    this.dom.navLinks.forEach((link) =>
      link.removeEventListener("click", this.boundHandlers.navClick)
    );
    this.dom.filterList?.removeEventListener("click", this.boundHandlers.filterClick);
    this.dom.filterList?.removeEventListener("keydown", this.boundHandlers.filterKeydown);
  }

  _getInitialDarkModePreference() {
    try {
      const storedValue = localStorage.getItem("darkMode");
      if (storedValue !== null) return storedValue === "true";
    } catch (e) {}
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches || false;
  }

  toggleDarkMode() {
    this.state.theme.isDark = !this.state.theme.isDark;
    try {
      localStorage.setItem("darkMode", String(this.state.theme.isDark));
    } catch (e) {}
    this.applyTheme();
  }

  applyTheme() {
    this.dom.html.classList.toggle(
      CONFIG.SELECTORS.CLASS_NAMES.darkMode,
      this.state.theme.isDark
    );
    if (this.dom.darkModeIcon)
      this.dom.darkModeIcon.textContent = this.state.theme.isDark
        ? "dark_mode"
        : "light_mode";
    this.dom.darkModeButton?.setAttribute(
      "aria-pressed",
      String(this.state.theme.isDark)
    );
    this.dom.root.style.setProperty("--hue-shift", String(this.state.theme.hue));
    this.backgroundAnimation?.updateColors(); // sync canvas colors with theme
    this.backgroundAnimation?.start(); // restart if stopped due to visibility/motion
  }

  shiftThemeHue() {
    this.state.theme.hue =
      (this.state.theme.hue + this.config.ANIMATION.HUE_SHIFT_AMOUNT) % 360;
    this.applyTheme();
  }

  startRoleTypingAnimation() {
    const { roleTyping } = this.state;
    if (!this.dom.roleElement || this.prefersReducedMotion || roleTyping.roles.length === 0) {
      if (this.dom.roleElement) {
        this.dom.roleElement.textContent = roleTyping.roles[0] || "";
        this.dom.roleElement.style.borderRightColor = "transparent";
      }
      if (roleTyping.animationFrameId) {
        cancelAnimationFrame(roleTyping.animationFrameId);
        roleTyping.animationFrameId = null;
      }
      return;
    }
    roleTyping.currentIndex = (roleTyping.currentIndex + 1) % roleTyping.roles.length;
    roleTyping.currentRoleText = roleTyping.roles[roleTyping.currentIndex];
    roleTyping.charIndex = 0;
    roleTyping.isErasing = false;
    this.dom.roleElement.textContent = "";
    Object.assign(this.dom.roleElement.style, { opacity: "1", borderRightColor: "" });
    this._setRoleTypingPause(performance.now(), this.config.ANIMATION.ROLE_PAUSE_MS);
    if (roleTyping.animationFrameId) cancelAnimationFrame(roleTyping.animationFrameId);
    roleTyping.animationFrameId = requestAnimationFrame(this.boundHandlers.roleTypeLoop);
  }

  _roleTypeLoop(timestamp) {
    const { roleTyping } = this.state;
    const { TYPING_SPEED_MS, ROLE_PAUSE_MS } = this.config.ANIMATION;
    if (!this.dom.roleElement) {
      if (roleTyping.animationFrameId) cancelAnimationFrame(roleTyping.animationFrameId);
      roleTyping.animationFrameId = null;
      return;
    }
    const elapsedSinceLastAction = timestamp - roleTyping.lastTimestamp;
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
          this.dom.roleElement.textContent += roleTyping.currentRoleText[roleTyping.charIndex++];
          roleTyping.lastTimestamp = timestamp;
        }
      } else {
        roleTyping.isErasing = true;
        this._setRoleTypingPause(timestamp, ROLE_PAUSE_MS * 1.5);
      }
    }
    roleTyping.animationFrameId = requestAnimationFrame(this.boundHandlers.roleTypeLoop);
  }

  _setRoleTypingPause(timestamp, duration) {
    const { roleTyping } = this.state;
    roleTyping.isPaused = true;
    roleTyping.pauseEndTime = timestamp + duration;
    roleTyping.lastTimestamp = timestamp;
  }

  _handleNavClick(event) {
    const link = event.currentTarget;
    const targetId = link.getAttribute("href");
    if (!targetId || !targetId.startsWith("#") || targetId.length === 1) return;
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      event.preventDefault();
      targetElement.scrollIntoView({
        behavior: this.prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
      const attemptFocus = () => {
        if (
          targetElement.hasAttribute("tabindex") ||
          ["INPUT", "BUTTON", "SELECT", "TEXTAREA", "A"].includes(targetElement.tagName)
        )
          targetElement.focus({ preventScroll: true });
      };
      if (this.prefersReducedMotion) {
        attemptFocus();
      } else {
        Utils.waitForScrollSettled(140, 800).then(() => attemptFocus());
      }
    }
  }

  _handleFilterClick(event) {
    const button = event.target.closest(CONFIG.SELECTORS.DYNAMIC_SELECTORS.filterButton);
    if (!button || button.classList.contains(CONFIG.SELECTORS.CLASS_NAMES.active)) return;
    const newFilter = button.dataset.filter;
    if (newFilter) {
      this.setActiveFilter(newFilter);
      this._focusFilterButton(this.dom.filterButtons.findIndex((b) => b === button));
    }
  }

  _handleFilterKeydown(event) {
    const button = event.target;
    if (!button.matches(CONFIG.SELECTORS.DYNAMIC_SELECTORS.filterButton) || !this.dom.filterList.contains(button))
      return;
    const buttons = this.dom.filterButtons;
    if (buttons.length === 0) return;

    let currentIndex = buttons.findIndex((btn) => btn === this.state.currentFocusedFilterButton);
    if (currentIndex === -1) currentIndex = buttons.findIndex((btn) => btn === button) || 0;

    let nextIndex = currentIndex;
    let handled = true;
    switch (event.key) {
      case "Enter":
      case " ":
        {
          const newFilter = button.dataset.filter;
          if (newFilter) this.setActiveFilter(newFilter);
        }
        break;
      case "ArrowRight":
      case "Right":
        nextIndex = (currentIndex + 1) % buttons.length;
        this._focusFilterButton(nextIndex);
        break;
      case "ArrowLeft":
      case "Left":
        nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
        this._focusFilterButton(nextIndex);
        break;
      case "Home":
        this._focusFilterButton(0);
        break;
      case "End":
        this._focusFilterButton(buttons.length - 1);
        break;
      default:
        handled = false;
    }
    if (handled) event.preventDefault();
  }

  _focusFilterButton(index) {
    if (index < 0 || index >= this.dom.filterButtons.length) return;
    if (this.state.currentFocusedFilterButton)
      this.state.currentFocusedFilterButton.setAttribute("tabindex", "-1");
    const newFocusedButton = this.dom.filterButtons[index];
    newFocusedButton.setAttribute("tabindex", "0");
    newFocusedButton.focus({ preventScroll: true });
    this.state.currentFocusedFilterButton = newFocusedButton;
  }

  setActiveFilter(filterCategory) {
    if (filterCategory === this.state.activeFilter) return;
    this.state.activeFilter = filterCategory;
    this._updateFilterButtonsState();
    this.scrollGallery?.applyFilter(filterCategory);
  }

  _updateFilterButtonsState() {
    if (!this.dom.filterList || this.dom.filterButtons.length === 0) return;
    const { active } = CONFIG.SELECTORS.CLASS_NAMES;
    const currentFilter = this.state.activeFilter;
    let newlyActiveButton = null;

    this.dom.filterButtons.forEach((button) => {
      const isActive = button.dataset.filter === currentFilter;
      button.classList.toggle(active, isActive);
      button.setAttribute("aria-current", String(isActive));
      if (isActive) {
        newlyActiveButton = button;
        button.setAttribute("tabindex", "0");
      } else {
        button.setAttribute("tabindex", "-1");
      }
    });

    if (
      newlyActiveButton &&
      this.state.currentFocusedFilterButton !== newlyActiveButton &&
      (!document.activeElement ||
        !this.dom.filterList.contains(document.activeElement) ||
        (document.activeElement !== newlyActiveButton &&
          document.activeElement.dataset.filter !== currentFilter))
    ) {
      this.state.currentFocusedFilterButton = newlyActiveButton;
    } else if (!newlyActiveButton && this.dom.filterButtons.length > 0) {
      this.dom.filterButtons[0].setAttribute("tabindex", "0");
      this.state.currentFocusedFilterButton = this.dom.filterButtons[0];
    }
  }

  /**
   * Live update when OS motion preferences change.
   * Stops or restarts the typing animation accordingly.
   */
  onReducedMotionChange(prefersReduced) {
    this.prefersReducedMotion = prefersReduced;
    if (!this.dom.roleElement) return;
    if (prefersReduced) {
      if (this.state.roleTyping.animationFrameId) {
        cancelAnimationFrame(this.state.roleTyping.animationFrameId);
        this.state.roleTyping.animationFrameId = null;
      }
      this.dom.roleElement.textContent = this.state.roleTyping.roles[0] || "";
      this.dom.roleElement.style.borderRightColor = "transparent";
    } else {
      if (this.state.roleTyping.animationFrameId) {
        cancelAnimationFrame(this.state.roleTyping.animationFrameId);
      }
      this.startRoleTypingAnimation();
    }
  }

  destroy() {
    this._unbindEvents();
    if (this.state.roleTyping.animationFrameId)
      cancelAnimationFrame(this.state.roleTyping.animationFrameId);
    if (this.dom.roleElement) this.dom.roleElement.textContent = "";
    this.isInitialized = false;
  }
}

/* =========================
   App Bootstrap
   ========================= */

let backgroundAnimationInstance = null,
  galleryInstance = null,
  scrollGalleryInstance = null,
  uiInstance = null,
  throttledScrollHandler = null,
  debouncedResizeHandler = null,
  visibilityHandler = null,
  motionPreferenceUnsubscribe = null;

async function initializeApp() {
  try {
    domElements = cacheDomElements();
    Utils.initMotionPreference();
    const fetchedProjects = await fetchProjectsData();

    isScrolledTop = window.scrollY < 5;
    domElements.body.classList.toggle(
      CONFIG.SELECTORS.CLASS_NAMES.scrolledToTop,
      isScrolledTop
    );
    domElements.html.style.setProperty(
      "--scrollbar-width",
      `${Utils.getScrollbarWidth()}px`
    );

    backgroundAnimationInstance = new BackgroundAnimation();
    galleryInstance = new Gallery();
    scrollGalleryInstance = new ScrollModeGallery(galleryInstance, fetchedProjects);
    uiInstance = new UI(backgroundAnimationInstance, scrollGalleryInstance);

    uiInstance.init();
    scrollGalleryInstance.init();
    galleryInstance.setupEventListeners();

    throttledScrollHandler = Utils.throttle(
      handleGlobalScroll,
      CONFIG.ANIMATION.THROTTLE_MS
    );
    debouncedResizeHandler = Utils.debounce(
      handleGlobalResize,
      CONFIG.ANIMATION.RESIZE_DEBOUNCE_MS
    );

    window.addEventListener("scroll", throttledScrollHandler, { passive: true });
    window.addEventListener("resize", debouncedResizeHandler);

    // Pause expensive animations when tab is hidden; resume when visible
    visibilityHandler = () => {
      backgroundAnimationInstance?.start();
    };
    document.addEventListener("visibilitychange", visibilityHandler);

    // Live OS motion preference updates across subsystems
    motionPreferenceUnsubscribe = Utils.onReducedMotionChange((pref) => {
      uiInstance?.onReducedMotionChange(pref);
      scrollGalleryInstance?.setPrefersReducedMotion(pref);
      galleryInstance?.setPrefersReducedMotion(pref);
      backgroundAnimationInstance?.start();
    });
  } catch (err) {
    console.error("[initializeApp] Unexpected error:", err);
  }
}

function handleGlobalScroll() {
  const currentlyScrolledTop = window.scrollY < 5;
  if (currentlyScrolledTop !== isScrolledTop) {
    isScrolledTop = currentlyScrolledTop;
    domElements.body.classList.toggle(
      CONFIG.SELECTORS.CLASS_NAMES.scrolledToTop,
      isScrolledTop
    );
  }
}

function handleGlobalResize() {
  domElements.html.style.setProperty(
    "--scrollbar-width",
    `${Utils.getScrollbarWidth(true)}px`
  );
  backgroundAnimationInstance?.handleResize();
  scrollGalleryInstance?.handleResize();
  galleryInstance?.handleResize();
  handleGlobalScroll();
}

function cleanupApp() {
  uiInstance?.destroy();
  scrollGalleryInstance?.destroy();
  galleryInstance?.destroy();
  backgroundAnimationInstance?.destroy();
  if (throttledScrollHandler)
    window.removeEventListener("scroll", throttledScrollHandler);
  if (debouncedResizeHandler)
    window.removeEventListener("resize", debouncedResizeHandler);
  if (visibilityHandler)
    document.removeEventListener("visibilitychange", visibilityHandler);
  if (motionPreferenceUnsubscribe) motionPreferenceUnsubscribe();
  motionPreferenceUnsubscribe = null;
  throttledScrollHandler?.cancel?.();
  debouncedResizeHandler?.cancel?.();
}

if (document.readyState === "loading")
  document.addEventListener("DOMContentLoaded", initializeApp);
else initializeApp();

// Optional: expose cleanup for dev/tests
// window.__CLEANUP_APP__ = cleanupApp;