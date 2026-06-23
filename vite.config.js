import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            outDir: 'public',
            buildBase: '/',
            manifest: {
                name: 'Notion Clone',
                short_name: 'NotionClone',
                description: 'Administra tus espacios de trabajo, proyectos y miembros de forma eficiente y colaborativa.',
                theme_color: '#faf7d8',
                background_color: '#faf7d8',
                display: 'standalone',
                scope: '/',
                start_url: '/',
                icons: [
                    {
                        src: '/favicon.ico',
                        sizes: '64x64 32x32 24x24 16x16',
                        type: 'image/x-icon'
                    },
                    {
                        src: '/assets/logo-192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: '/assets/logo-512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            },
            workbox: {
                globDirectory: 'public',
                globPatterns: ['build/assets/**/*.{js,css,html,ico,png,svg,woff2}'],
                navigateFallback: null,
            }
        })
    ],
});
