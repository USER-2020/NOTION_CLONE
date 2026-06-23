import './bootstrap';
import '../css/app.css';

import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const themeStorageKey = 'notion-clone-theme';

function applyTheme(preference) {
    const root = document.documentElement;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolvedTheme = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;

    root.dataset.themePreference = preference;
    root.dataset.theme = resolvedTheme;
}

function ThemeBoot({ children, initialThemePreference = null }) {
    const [themePreference, setThemePreference] = useState(() => initialThemePreference || localStorage.getItem(themeStorageKey) || 'system');

    useEffect(() => {
        applyTheme(themePreference);
        localStorage.setItem(themeStorageKey, themePreference);

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (themePreference === 'system') {
                applyTheme('system');
            }
        };

        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [themePreference]);

    useEffect(() => {
        window.__setPreferredTheme = setThemePreference;
        window.__getPreferredTheme = () => themePreference;

        return () => {
            delete window.__setPreferredTheme;
            delete window.__getPreferredTheme;
        };
    }, [themePreference]);

    return children;
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        const initialThemePreference = props.initialPage.props?.auth?.user?.theme_preference ?? null;

        root.render(
            <ThemeBoot initialThemePreference={initialThemePreference}>
                <App {...props} />
            </ThemeBoot>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
