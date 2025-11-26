/**
 * Simple State Management (Observer Pattern).
 * Holds the single source of truth for the application.
 */
import { EventBus } from '/js/utils/utils.js'; 

class Store {
    constructor() {
        this.state = {
            projects: [],
            activeFilter: 'All',
            theme: 'light',
            hue: 0,
            isFullscreen: false
        };
    }

    /**
     * Update state and notify listeners.
     * @param {Object} newState - Partial state object to update.
     */
    setState(newState) {
        const prevState = { ...this.state };
        this.state = { ...this.state, ...newState };

        Object.keys(newState).forEach(key => {
            if (prevState[key] !== this.state[key]) {
                EventBus.emit(`state:${key}`, this.state[key]);
            }
        });
    }

    get() {
        return this.state;
    }

    getFilteredProjects() {
        const { projects, activeFilter } = this.state;
        if (activeFilter === 'All') return projects;
        return projects.filter(p => p.category === activeFilter);
    }
}

export const appStore = new Store();