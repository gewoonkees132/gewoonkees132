import { Component } from './component.js';
import { appStore } from './store.js';
import { CONFIG } from './config.js';
import { Utils, EventBus } from './utils.js';

export class AppControls extends Component {
    constructor() {
        super(document.body); 
        this.typewriterTimeoutId = null;

        this._initFilters();
        this._initTheme();
        this._initTypewriter();
    }

    destroy() {
        if (this.typewriterTimeoutId) clearTimeout(this.typewriterTimeoutId);
        super.destroy();
    }

    _initFilters() {
        const list = this.find(CONFIG.SELECTORS.filterList);
        if (!list) return;

        this.addEvent(list, 'click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            list.querySelectorAll('button').forEach(b => {
                const isActive = b === btn;
                if (b.classList.contains(CONFIG.CLASSES.active) !== isActive) {
                    b.classList.toggle(CONFIG.CLASSES.active, isActive);
                    b.setAttribute('aria-current', String(isActive));
                }
            });

            appStore.setState({ activeFilter: btn.dataset.filter });
        });
    }

    _initTheme() {
        const darkBtn = this.find(CONFIG.SELECTORS.darkModeButton);
        const hueBtn = this.find(CONFIG.SELECTORS.hueShiftButton);

        this.addEvent(darkBtn, 'click', () => {
            const isDark = document.documentElement.classList.toggle(CONFIG.CLASSES.darkMode);
            appStore.setState({ theme: isDark ? 'dark' : 'light' });
            darkBtn.setAttribute("aria-pressed", String(isDark));
            darkBtn.querySelector("span").textContent = isDark ? "dark_mode" : "light_mode";
            EventBus.emit(CONFIG.EVENTS.THEME_TOGGLED, { isDark });
        });

        this.addEvent(hueBtn, 'click', () => {
            const newHue = (appStore.get().hue + CONFIG.ANIMATION.HUE_SHIFT_AMOUNT) % 360;
            appStore.setState({ hue: newHue });
            document.documentElement.style.setProperty("--hue-shift", String(newHue));
            EventBus.emit(CONFIG.EVENTS.HUE_SHIFTED, { hue: newHue });
        });
    }

    _initTypewriter() {
        const el = this.find(CONFIG.SELECTORS.roleElement);
        if (!el || Utils.prefersReducedMotion()) {
            if (el) el.textContent = CONFIG.ANIMATION.ROLES[0];
            return;
        }

        let roleIndex = 0, charIndex = 0, isDeleting = false;
        
        const loop = () => {
            const currentRole = CONFIG.ANIMATION.ROLES[roleIndex];
            el.textContent = currentRole.substring(0, isDeleting ? charIndex - 1 : charIndex + 1);
            charIndex = isDeleting ? charIndex - 1 : charIndex + 1;

            let speed = CONFIG.ANIMATION.TYPING_SPEED_MS;
            if (!isDeleting && charIndex === currentRole.length) {
                speed = CONFIG.ANIMATION.ROLE_PAUSE_MS;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % CONFIG.ANIMATION.ROLES.length;
                speed = 500;
            }
            this.typewriterTimeoutId = setTimeout(loop, speed);
        };
        
        requestAnimationFrame(() => loop());
    }
}