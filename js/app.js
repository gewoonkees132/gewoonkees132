import { CONFIG } from './config.js';
import { appStore } from './store.js';
import { FullscreenGallery } from './fullscreen.js';
import { ScrollGallery } from './gallery.js';
import { AppControls } from './controls.js';

// PERF: Start fetching immediately, parallel to component initialization.
// This utilizes the <link rel="preload"> from HTML.
const projectDataPromise = fetch("/projects.json")
    .then(res => {
        if (!res.ok) throw new Error("API Error");
        return res.json();
    })
    .catch(err => {
        console.error("Data Load Failure:", err);
        return [];
    });

export const initApp = async () => {
    // 1. Instantiate Components (Main Thread - Synchronous)
    new FullscreenGallery();
    new ScrollGallery(document.querySelector(CONFIG.SELECTORS.scrollModeGallery));
    new AppControls();

    try {
        // 2. Await Data (Network Thread - Async)
        // Since we started the fetch outside initApp, this likely resolves instantly.
        const rawData = await projectDataPromise;
        
        // Sanitize
        const projects = (Array.isArray(rawData) ? rawData : []).map(p => ({
            ...p,
            src: p.src || 'images/placeholder.webp',
            category: p.category || 'Uncategorized'
        }));

        // 3. Populate Store (Triggers Render in Gallery)
        appStore.setState({ projects });

    } catch (err) {
        console.error("Boot failure:", err);
    }
};

if (document.readyState !== 'test') {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initApp);
    } else {
        initApp();
    }
}