import { EventBus } from './utils.js'; 

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