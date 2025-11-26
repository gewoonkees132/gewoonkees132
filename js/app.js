import { CONFIG } from '/js/config.js';
import { appStore } from '/js/core/Store.js';
import { FullscreenGallery } from '/js/components/fullscreen.js';
import { ScrollGallery } from '/js/components/gallery.js';
import { AppControls } from '/js/components/Controls.js';

export const initApp = async () => {
    // 1. Instantiate Components
    new FullscreenGallery();
    new ScrollGallery(document.querySelector(CONFIG.SELECTORS.scrollModeGallery));
    new AppControls();

    // 2. Fetch Data
    try {
        // This fetch matches the <link rel="preload"> in HTML, so it should resolve instantly from cache
        const res = await fetch("projects.json");
        if (!res.ok) throw new Error("API Error");
        
        const rawData = await res.json();
        
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