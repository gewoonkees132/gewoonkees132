/**
 * @file config.js
 * Single source of truth for selectors, classes, and app constants.
 */
export const CONFIG = Object.freeze({
    SELECTORS: {
        root: ":root",
        mainContent: "#main-content",
        scrollModeGallery: "#scroll-mode-gallery",
        thumbnailScroller: "#thumbnail-scroller",
        mainImageScroller: "#main-image-scroller",
        mainImageColumn: "#main-image-column",
        activeCursor: "#active-thumbnail-cursor",
        fullscreenContainer: "#fullscreen-container",
        fullscreenSliderWrapper: "#fullscreen-slider-wrapper",
        fullscreenCloseButton: "#close-fullscreen",
        filterList: ".project-filter-list",
        hueShiftButton: "#hue-shift-button",
        darkModeButton: ".dark-light-mode",
        roleElement: "#role",
        backgroundCanvas: "#gradient-background",
    },
    CLASSES: {
        active: "active",
        darkMode: "dark-mode",
        fullscreenActive: "fullscreen-active",
        thumbItem: "scroll-gallery__thumb-item",
        mainItem: "scroll-gallery__main-item",
        mainItemZoomed: "scroll-gallery__main-item--zoomed", // Added for zoom functionality
        activeSlide: "is-active-slide",
    },
    EVENTS: {
        APP_READY: 'app:ready',
        THEME_TOGGLED: 'ui:theme-toggled',
        HUE_SHIFTED: 'ui:hue-shifted',
        FILTER_REQUESTED: 'ui:filter-requested',
        PROJECT_SELECTED: 'ui:project-selected',
        DATA_LOADED: 'data:loaded',
        DATA_ERROR: 'data:error'
    },
    ANIMATION: {
        HUE_SHIFT_AMOUNT: 60,
        RESIZE_DEBOUNCE_MS: 150,
        TYPING_SPEED_MS: 80,
        ROLE_PAUSE_MS: 1500,
        ROLES: ["Parametric Designer", "Researcher", "Photographer", "Robotic Fabrication Engineer"]
    },
    LAYOUT: {
        SIDEBAR_ACTIVE_OFFSET: 20,
    }
});