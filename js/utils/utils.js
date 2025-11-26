export const EventBus = {
    events: {},
    on(event, callback) {
        if (!this.events[event]) this.events[event] = new Set();
        this.events[event].add(callback);
    },
    off(event, callback) {
        if (this.events[event]) this.events[event].delete(callback);
    },
    emit(event, data) {
        if (this.events[event]) this.events[event].forEach(cb => cb(data));
    }
};

export const Utils = {
    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    },
    prefersReducedMotion() {
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    },
    wait: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};