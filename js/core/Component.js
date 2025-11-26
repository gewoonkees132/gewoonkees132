import { EventBus } from '../utils/utils.js';

/**
 * Base Component Class.
 * Standardizes selector caching, DOM event cleanup, and EventBus subscription management.
 */
export class Component {
    constructor(selector) {
        this.el = typeof selector === 'string' ? document.querySelector(selector) : selector;
        this.events = []; // Track DOM events for cleanup
        this.subscriptions = []; // Track EventBus subscriptions for cleanup

        if (this.el && !this.el.parentElement) {
            document.body.appendChild(this.el);
        }
    }

    /**
     * Safe addEventListener that tracks for cleanup.
     */
    addEvent(target, type, handler, options = false) {
        if (!target) return;
        target.addEventListener(type, handler, options);
        this.events.push({ target, type, handler });
    }

    /**
     * Subscribe to the EventBus and track for cleanup.
     */
    subscribe(event, handler) {
        const boundHandler = handler.bind(this);
        EventBus.on(event, boundHandler);
        this.subscriptions.push({ event, handler: boundHandler });
    }

    destroy() {
        // Cleanup DOM events
        this.events.forEach(({ target, type, handler }) => {
            target.removeEventListener(type, handler);
        });
        this.events = [];

        // Cleanup EventBus subscriptions
        this.subscriptions.forEach(({ event, handler }) => {
            EventBus.off(event, handler);
        });
        this.subscriptions = [];
    }

    // Helper to find child elements
    find(selector) {
        return this.el?.querySelector(selector);
    }
}