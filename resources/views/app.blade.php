<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    @php
        $appName = 'CrewSync';
        $companyName = 'Prestige Studio';

        $siteUrl = url('/');
        $currentUrl = url()->current();

        $title = 'CrewSync — Plataforma PWA de planificación y colaboración';
        $description = 'CrewSync es una aplicación web progresiva para planificar tareas, organizar proyectos, gestionar equipos, centralizar documentos y coordinar flujos de trabajo desde una sola herramienta.';

        $keywords = 'CrewSync, PWA de planificación, gestión de tareas, gestión de proyectos, organización de equipos, productividad, colaboración, documentación, tableros Kanban, workspace digital, Prestige Studio';

        $locale = str_replace('_', '-', app()->getLocale());
        $imageUrl = url('/assets/og-image.jpg');
        $logo512 = url('/assets/logo-512.png');
        $logo192 = url('/assets/logo-192.png');
        $screenshotUrl = url('/assets/screenshots/crewsync-dashboard.png');
    @endphp

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    {{-- Basic SEO --}}
    <title inertia>{{ $title }}</title>
    <meta name="description" content="{{ $description }}">
    <meta name="keywords" content="{{ $keywords }}">
    <meta name="author" content="{{ $companyName }}">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <meta name="language" content="{{ $locale }}">
    <meta name="application-name" content="{{ $appName }}">
    <link rel="canonical" href="{{ $currentUrl }}">

    {{-- Theme / Browser UI --}}
    <meta name="theme-color" content="#faf7d8">
    <meta name="color-scheme" content="light dark">

    {{-- PWA --}}
    <link rel="manifest" href="{{ asset('build/manifest.webmanifest') }}">
    <link rel="apple-touch-icon" href="{{ $logo192 }}">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-title" content="{{ $appName }}">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">

    {{-- Favicons --}}
    <link rel="icon" type="image/png" sizes="192x192" href="{{ $logo192 }}">
    <link rel="icon" type="image/png" sizes="512x512" href="{{ $logo512 }}">

    {{-- Open Graph --}}
    <meta property="og:type" content="website">
    <meta property="og:locale" content="{{ str_replace('-', '_', $locale) }}">
    <meta property="og:site_name" content="{{ $appName }}">
    <meta property="og:title" content="{{ $title }}">
    <meta property="og:description" content="{{ $description }}">
    <meta property="og:url" content="{{ $currentUrl }}">
    <meta property="og:image" content="{{ $imageUrl }}">
    <meta property="og:image:secure_url" content="{{ $imageUrl }}">
    <meta property="og:image:alt" content="Vista previa del dashboard de CrewSync">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">

    {{-- Twitter / X --}}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $title }}">
    <meta name="twitter:description" content="{{ $description }}">
    <meta name="twitter:image" content="{{ $imageUrl }}">
    <meta name="twitter:image:alt" content="Vista previa del dashboard de CrewSync">

    {{-- Schema.org JSON-LD: Organization --}}
    <script type="application/ld+json">
        {!! json_encode([
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            '@id' => $siteUrl . '#organization',
            'name' => $companyName,
            'url' => $siteUrl,
            'logo' => [
                '@type' => 'ImageObject',
                'url' => $logo512,
                'width' => 512,
                'height' => 512,
            ],
            'brand' => [
                '@type' => 'Brand',
                'name' => $appName,
            ],
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) !!}
    </script>

    {{-- Schema.org JSON-LD: WebSite --}}
    <script type="application/ld+json">
        {!! json_encode([
            '@context' => 'https://schema.org',
            '@type' => 'WebSite',
            '@id' => $siteUrl . '#website',
            'name' => $appName,
            'alternateName' => 'CrewSync PWA',
            'url' => $siteUrl,
            'description' => $description,
            'inLanguage' => $locale,
            'publisher' => [
                '@id' => $siteUrl . '#organization',
            ],
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) !!}
    </script>

    {{-- Schema.org JSON-LD: SoftwareApplication --}}
    <script type="application/ld+json">
        {!! json_encode([
            '@context' => 'https://schema.org',
            '@type' => 'SoftwareApplication',
            '@id' => $siteUrl . '#software-application',
            'name' => $appName,
            'alternateName' => 'CrewSync PWA',
            'url' => $siteUrl,
            'mainEntityOfPage' => [
                '@id' => $siteUrl . '#website',
            ],
            'description' => $description,
            'applicationCategory' => 'BusinessApplication',
            'applicationSubCategory' => 'PlanningApplication',
            'operatingSystem' => 'Web, Windows, macOS, Linux, Android, iOS',
            'browserRequirements' => 'Requiere un navegador moderno compatible con JavaScript, Service Workers y funcionalidades PWA.',
            'softwareVersion' => '1.0.0',
            'inLanguage' => $locale,
            'isAccessibleForFree' => true,
            'installUrl' => $siteUrl,
            'downloadUrl' => $siteUrl,
            'image' => $imageUrl,
            'thumbnailUrl' => $logo512,
            'screenshot' => $screenshotUrl,
            'keywords' => [
                'CrewSync',
                'PWA de planificación',
                'gestión de tareas',
                'gestión de proyectos',
                'organización de equipos',
                'productividad',
                'colaboración',
                'documentación',
                'tableros Kanban',
                'workspace digital',
            ],
            'featureList' => [
                'Planificación de tareas y actividades',
                'Gestión de proyectos y espacios de trabajo',
                'Tableros visuales tipo Kanban',
                'Asignación de usuarios y responsables',
                'Organización de equipos y miembros',
                'Editor de documentos y notas internas',
                'Seguimiento de avances y estados',
                'Dashboard centralizado de planificación',
                'Herramientas colaborativas para equipos',
                'Aplicación instalable como PWA',
                'Interfaz responsive para escritorio, tablet y móvil',
                'Gestión de roles, permisos y accesos',
            ],
            'offers' => [
                '@type' => 'Offer',
                'url' => $siteUrl,
                'price' => '0',
                'priceCurrency' => 'USD',
                'availability' => 'https://schema.org/InStock',
            ],
            'publisher' => [
                '@id' => $siteUrl . '#organization',
            ],
            'creator' => [
                '@id' => $siteUrl . '#organization',
            ],
            'audience' => [
                '@type' => 'Audience',
                'audienceType' => 'Equipos de trabajo, empresas, freelancers, agencias, startups, gestores de proyectos y profesionales que necesitan planificar y organizar actividades.',
            ],
            'potentialAction' => [
                '@type' => 'UseAction',
                'name' => 'Usar CrewSync',
                'target' => [
                    '@type' => 'EntryPoint',
                    'urlTemplate' => $siteUrl,
                    'actionPlatform' => [
                        'https://schema.org/DesktopWebPlatform',
                        'https://schema.org/MobileWebPlatform',
                    ],
                ],
            ],
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) !!}
    </script>

    {{-- Service Worker --}}
    <script>
        if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
            window.addEventListener('load', () => {
                navigator.serviceWorker
                    .register('/sw.js')
                    .catch(() => {
                        // Evita mostrar errores técnicos al usuario final.
                    });
            });
        }
    </script>

    {{-- Laravel / Inertia / Vite --}}
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia
</body>
</html>