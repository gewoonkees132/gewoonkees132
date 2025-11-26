import { EventBus } from './utils.js';

/**
 * Base Component Class.
 * Standardizes selector caching, DOM event cleanup, and EventBus subscription management.
 */
export class Component {
    constructor(selector) {
        this.el = typeof selector === 'string' ? document.querySelector(selector) : selector;
        this.events = []; 
        this.subscriptions = []; 

        if (this.el && !this.el.parentElement) {
            document.body.appendChild(this.el);
        }
    }

    addEvent(target, type, handler, options = false) {
        if (!target) return;
        target.addEventListener(type, handler, options);
        this.events.push({ target, type, handler });
    }

    subscribe(event, handler) {
        const boundHandler = handler.bind(this);
        EventBus.on(event, boundHandler);
        this.subscriptions.push({ event, handler: boundHandler });
    }

    destroy() {
        this.events.forEach(({ target, type, handler }) => {
            target.removeEventListener(type, handler);
        });
        this.events = [];

        this.subscriptions.forEach(({ event, handler }) => {
            EventBus.off(event, handler);
        });
        this.subscriptions = [];
    }

    find(selector) {
        return this.el?.querySelector(selector);
    }
}