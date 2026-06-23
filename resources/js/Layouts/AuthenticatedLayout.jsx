import AppToaster from '@/Components/AppToaster';
import AppSelect from '@/Components/AppSelect';
import BrandLogo from '@/Components/BrandLogo';
import axios from 'axios';
import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import {
    FiBookOpen,
    FiBriefcase,
    FiChevronLeft,
    FiChevronRight,
    FiGrid,
    FiLayers,
    FiLogOut,
    FiMenu,
    FiMoon,
    FiSettings,
    FiSun,
    FiUser,
    FiUsers,
    FiX,
} from 'react-icons/fi';

const baseNavItems = [
    { label: 'Panel', href: 'dashboard', match: 'dashboard', icon: FiGrid, description: 'Resumen general, actividad reciente y accesos rapidos del workspace.' },
    { label: 'Proyectos', href: 'projects.index', match: 'projects.', icon: FiBriefcase, description: 'Organiza proyectos, logos, fechas, miembros y avances del equipo.' },
    { label: 'Tareas', href: 'tasks.index', match: 'tasks.', icon: FiLayers, description: 'Gestiona tareas, subtareas, responsables, fechas y estados.' },
    { label: 'Documentacion', href: 'documentation.index', match: 'documentation', icon: FiBookOpen, description: 'Consulta o crea paginas internas, procesos y notas compartidas.' },
];

const themes = [
    { value: 'light', label: 'Claro', icon: FiSun, description: 'Modo claro' },
    { value: 'dark', label: 'Oscuro', icon: FiMoon, description: 'Modo oscuro' },
    { value: 'system', label: 'Sistema', icon: FiSettings, description: 'Seguir sistema' },
];

function clsx(...values) {
    return values.filter(Boolean).join(' ');
}

function isNavItemActive(url, item) {
    return url.startsWith(`/${item.match.split('.')[0]}`) || route().current(item.match + '*');
}

function buildNavItems(permissions = []) {
    const items = [...baseNavItems];

    if (permissions.includes('workspaces.view')) {
        items.push({
            label: 'Espacios',
            href: 'workspaces.index',
            match: 'workspaces.',
            icon: FiBriefcase,
            description: 'Administra workspaces visibles, cambia el espacio activo y revisa sus logos.',
        });
    }

    if (permissions.includes('users.manage')) {
        items.push({
            label: 'Miembros',
            href: 'users.index',
            match: 'users.',
            icon: FiUsers,
            description: 'Invita personas, ajusta permisos y controla el acceso al equipo.',
        });
    }

    return items;
}

function SidebarThemeSelector({ themePreference, updateTheme }) {
    return (
        <div className="theme-surface-strong rounded-[2rem] border p-4">
            <p className="theme-text-muted text-xs uppercase tracking-[0.3em]">Tema</p>
            <p className="theme-text-secondary mt-2 text-sm leading-5">
                Cambia la apariencia del espacio de trabajo según tu preferencia.
            </p>

            <div className="theme-muted mt-4 rounded-[1.5rem] p-2">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                    {themes.map((theme) => {
                        const Icon = theme.icon;
                        const active = themePreference === theme.value;

                        return (
                            <div key={theme.value} className="group relative">
                                <button
                                    type="button"
                                    onClick={() => updateTheme(theme.value)}
                                    className={clsx(
                                        'flex w-full items-center gap-3 rounded-[1.2rem] px-3 py-3 text-left text-sm font-medium whitespace-nowrap transition',
                                        active
                                            ? 'theme-button-accent shadow-[0_14px_28px_-20px_rgba(127,35,206,0.52)]'
                                            : 'theme-surface theme-text-secondary hover:opacity-90'
                                    )}
                                >
                                    <span
                                        className={clsx(
                                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition',
                                            active
                                                ? 'border-white/30 bg-white/15 text-current'
                                                : 'theme-border bg-white/40 theme-accent'
                                        )}
                                    >
                                        <Icon className="h-4 w-4 shrink-0" />
                                    </span>

                                    <span className="min-w-0 flex-1 truncate text-sm">{theme.label}</span>
                                </button>

                                <div className="theme-tooltip pointer-events-none absolute -top-12 left-1/2 z-20 hidden -translate-x-1/2 rounded-xl border px-3 py-2 text-center text-[11px] font-medium opacity-0 shadow-lg transition duration-200 group-hover:opacity-100 lg:block">
                                    {theme.description}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function WorkspaceSwitcher({ currentWorkspace, availableWorkspaces }) {
    if (!availableWorkspaces?.length) {
        return null;
    }

    return (
        <div className="theme-surface-strong rounded-[2rem] border p-4">
            <p className="theme-text-muted text-xs uppercase tracking-[0.3em]">Espacio activo</p>
            <AppSelect
                wrapperClassName="mt-3"
                value={currentWorkspace?.id ?? availableWorkspaces[0]?.id ?? ''}
                onChange={(event) =>
                    router.patch(
                        route('workspaces.switch'),
                        { workspace_id: event.target.value },
                        { preserveScroll: true, preserveState: false }
                    )
                }
            >
                {availableWorkspaces.map((workspace) => (
                    <option key={workspace.id} value={workspace.id}>
                        {workspace.name}
                    </option>
                ))}
            </AppSelect>
        </div>
    );
}

function SidebarFooter({ user }) {
    return (
        <div className="theme-surface px-4 pb-6 pt-4">
            <div className="theme-surface-strong min-w-0 rounded-[2rem] border p-4">
                <p className="theme-text-muted text-xs uppercase tracking-[0.3em]">Sesión activa</p>
                <p className="theme-text-primary mt-3 truncate text-lg font-medium">{user.name}</p>
                <div className="group relative mt-1 min-w-0">
                    <p className="theme-text-secondary truncate text-sm">{user.email}</p>
                    <div className="theme-tooltip pointer-events-none absolute left-0 top-[calc(100%+0.45rem)] z-20 hidden max-w-[240px] rounded-xl border px-3 py-2 text-[11px] font-medium opacity-0 shadow-lg transition duration-200 group-hover:opacity-100 lg:block">
                        {user.email}
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                        href={route('profile.edit')}
                        className="theme-border-strong theme-text-secondary inline-flex min-w-0 items-center gap-2 rounded-full border px-3 py-2 text-xs transition hover:opacity-80"
                    >
                        <FiUser className="h-3.5 w-3.5" />
                        Perfil
                    </Link>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="theme-button-accent inline-flex min-w-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition"
                    >
                        <FiLogOut className="h-3.5 w-3.5" />
                        Salir
                    </Link>
                </div>
            </div>
        </div>
    );
}

function DesktopSidebarPanel({ item, currentWorkspace, updateTheme, themePreference, user }) {
    if (!item) {
        return null;
    }

    const panelClassName = 'w-[min(22rem,calc(100vw-8.5rem))] rounded-[1.9rem] border theme-border theme-surface-strong p-5 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)]';

    if (item.kind === 'workspace') {
        return (
            <div className={panelClassName}>
                <p className="theme-text-muted text-[11px] uppercase tracking-[0.32em]">Workspace</p>
                <div className="mt-3 flex items-center gap-3">
                    {currentWorkspace?.logo_url ? (
                        <img src={currentWorkspace.logo_url} alt={currentWorkspace.name} className="h-12 w-12 rounded-2xl object-cover" />
                    ) : (
                        <div className="theme-surface flex h-12 w-12 items-center justify-center rounded-2xl border text-sm font-semibold">
                            {(currentWorkspace?.name ?? 'WS').slice(0, 2)}
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="theme-text-primary truncate text-base font-semibold">{currentWorkspace?.name ?? 'Workspace activo'}</p>
                        <p className="theme-text-secondary mt-1 text-sm">Accesos rapidos del espacio de trabajo.</p>
                    </div>
                </div>
                <div className="mt-4 grid gap-2">
                    <Link href={route('dashboard')} className="theme-surface theme-text-secondary rounded-2xl border px-4 py-3 text-sm transition hover:opacity-90">
                        Ir al panel
                    </Link>
                    <Link href={route('workspaces.index')} className="theme-surface theme-text-secondary rounded-2xl border px-4 py-3 text-sm transition hover:opacity-90">
                        Ver espacios
                    </Link>
                </div>
            </div>
        );
    }

    if (item.kind === 'theme') {
        return (
            <div className={panelClassName}>
                <p className="theme-text-muted text-[11px] uppercase tracking-[0.32em]">Tema</p>
                <p className="theme-text-primary mt-3 text-base font-semibold">Ajusta la apariencia</p>
                <div className="mt-4 grid gap-2">
                    {themes.map((theme) => {
                        const Icon = theme.icon;
                        const active = themePreference === theme.value;

                        return (
                            <button
                                key={theme.value}
                                type="button"
                                onClick={() => updateTheme(theme.value)}
                                className={clsx(
                                    'flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition',
                                    active ? 'theme-button-accent' : 'theme-surface theme-text-secondary hover:opacity-90'
                                )}
                            >
                                <span className={clsx('flex h-10 w-10 items-center justify-center rounded-xl border', active ? 'border-white/30 bg-white/15' : 'theme-border')}>
                                    <Icon className="h-4 w-4" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block font-medium">{theme.label}</span>
                                    <span className={clsx('mt-1 block text-xs', active ? 'text-white/75' : 'theme-text-muted')}>{theme.description}</span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (item.kind === 'profile') {
        return (
            <div className={panelClassName}>
                <p className="theme-text-muted text-[11px] uppercase tracking-[0.32em]">Sesion</p>
                <p className="theme-text-primary mt-3 truncate text-lg font-semibold">{user.name}</p>
                <p className="theme-text-secondary mt-1 truncate text-sm">{user.email}</p>
                <div className="mt-4 grid gap-2">
                    <Link href={route('profile.edit')} className="theme-surface theme-text-secondary rounded-2xl border px-4 py-3 text-sm transition hover:opacity-90">
                        Abrir perfil
                    </Link>
                    <Link href={route('logout')} method="post" as="button" className="theme-button-accent rounded-2xl px-4 py-3 text-left text-sm font-medium transition">
                        Cerrar sesion
                    </Link>
                </div>
            </div>
        );
    }

    const Icon = item.icon;

    return (
        <div className={panelClassName}>
            <div className="flex items-start gap-3">
                <span className="theme-surface flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border">
                    <Icon className="theme-accent h-5 w-5" />
                </span>
                <div className="min-w-0">
                    <p className="theme-text-primary text-base font-semibold">{item.label}</p>
                    <p className="theme-text-secondary mt-2 text-sm leading-6">{item.description}</p>
                </div>
            </div>
            <div className="mt-4 grid gap-2">
                <Link href={route(item.href)} className="theme-button-accent rounded-2xl px-4 py-3 text-sm font-medium transition">
                    Abrir {item.label.toLowerCase()}
                </Link>
                {(item.relatedLinks ?? []).map((related) => (
                    <Link key={related.href} href={route(related.href)} className="theme-surface theme-text-secondary rounded-2xl border px-4 py-3 text-sm transition hover:opacity-90">
                        {related.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}

function SidebarContent({
    user,
    themePreference,
    updateTheme,
    url,
    navItems,
    currentWorkspace,
    availableWorkspaces,
    closeMobileMenu = null,
    showBrandHeader = true,
    showFooter = true,
}) {
    return (
        <div className="flex h-full min-h-0 flex-col">
            {showBrandHeader ? <div className="flex items-center justify-between px-6 py-6">
                <div className="min-w-0">
                    <p className="theme-accent text-xs uppercase tracking-[0.35em]">Espacio de trabajo</p>
                    <Link href="/" className="mt-3 inline-flex max-w-full">
                        <BrandLogo compact imageClassName="max-h-10 max-w-[180px]" />
                    </Link>
                    <div className="mt-3 flex items-center gap-3">
                        {currentWorkspace?.logo_url ? (
                            <img
                                src={currentWorkspace.logo_url}
                                alt={`Logo de ${currentWorkspace.name}`}
                                className="h-10 w-10 rounded-2xl object-cover"
                            />
                        ) : null}
                        <h1 className="theme-text-primary min-w-0 truncate text-xl font-semibold">
                            {currentWorkspace?.name ?? 'SmartSend Workspace'}
                        </h1>
                    </div>
                </div>

                {closeMobileMenu && (
                    <button
                        type="button"
                        onClick={closeMobileMenu}
                        className="theme-border theme-text-secondary inline-flex h-11 w-11 items-center justify-center rounded-2xl border lg:hidden"
                        aria-label="Cerrar menú"
                    >
                        <FiX className="h-5 w-5" />
                    </button>
                )}
            </div> : null}

            <div className="flex-1 overflow-y-auto px-4 pb-4">
                <nav className="space-y-2">
                    {navItems.map((item) => {
                        const active = isNavItemActive(url, item);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={route(item.href)}
                                className={clsx(
                                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition',
                                    active
                                        ? 'theme-button-accent shadow-[0_12px_30px_-18px_rgba(127,35,206,0.44)]'
                                        : 'theme-text-secondary hover:opacity-80'
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-8 space-y-4">
                    <WorkspaceSwitcher currentWorkspace={currentWorkspace} availableWorkspaces={availableWorkspaces} />
                    <SidebarThemeSelector themePreference={themePreference} updateTheme={updateTheme} />
                </div>
            </div>

            {showFooter ? (
                <div className="shrink-0 border-t theme-border">
                    <SidebarFooter user={user} />
                </div>
            ) : null}
        </div>
    );
}

function DesktopSidebar({
    user,
    themePreference,
    updateTheme,
    url,
    navItems,
    currentWorkspace,
    availableWorkspaces,
    collapsed,
    onToggleCollapse,
}) {
    const [hoveredItem, setHoveredItem] = useState(null);
    const [panelTop, setPanelTop] = useState(20);
    const sidebarRef = useRef(null);

    const workspaceItem = {
        kind: 'workspace',
        key: 'workspace',
        label: currentWorkspace?.name ?? 'Workspace',
    };
    const themeItem = { kind: 'theme', key: 'theme', label: 'Tema', icon: themePreference === 'dark' ? FiMoon : FiSun };
    const profileItem = { kind: 'profile', key: 'profile', label: 'Perfil' };

    const navItemsWithRelated = navItems.map((item) => ({
        ...item,
        relatedLinks: navItems
            .filter((candidate) => candidate.href !== item.href)
            .slice(0, 2)
            .map((candidate) => ({ label: candidate.label, href: candidate.href })),
    }));

    useEffect(() => {
        if (!collapsed) {
            setHoveredItem(null);
        }
    }, [collapsed]);

    function openHoverPanel(item, target) {
        if (!sidebarRef.current || !target) {
            setHoveredItem(item);
            return;
        }

        const sidebarRect = sidebarRef.current.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const estimatedPanelHeight = item?.kind === 'theme' ? 320 : 240;
        const maxTop = Math.max(20, window.innerHeight - sidebarRect.top - estimatedPanelHeight - 24);
        const nextTop = Math.min(maxTop, Math.max(20, targetRect.top - sidebarRect.top - 14));

        setPanelTop(nextTop);
        setHoveredItem(item);
    }

    return (
        <aside
            className={clsx(
                'theme-surface theme-border fixed inset-y-0 left-0 z-30 hidden border-r backdrop-blur lg:block',
                collapsed ? 'w-[104px]' : 'w-[300px]'
            )}
        >
            <div
                ref={sidebarRef}
                className="relative flex h-full min-h-0"
                onMouseLeave={() => setHoveredItem(null)}
            >
                {collapsed ? (
                    <div className="flex h-full w-full min-h-0 flex-col items-center px-4 py-5">
                        <button
                            type="button"
                            onClick={onToggleCollapse}
                            className="theme-surface theme-border mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border transition hover:opacity-90"
                            aria-label="Expandir sidebar"
                        >
                            <FiChevronRight className="h-5 w-5" />
                        </button>

                        <button
                            type="button"
                            onMouseEnter={(event) => openHoverPanel(workspaceItem, event.currentTarget)}
                            onFocus={(event) => openHoverPanel(workspaceItem, event.currentTarget)}
                            className="theme-surface theme-border inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-[1.4rem] border transition hover:opacity-90"
                            aria-label="Workspace"
                        >
                            {currentWorkspace?.logo_url ? (
                                <img src={currentWorkspace.logo_url} alt={currentWorkspace.name} className="h-full w-full object-cover" />
                            ) : (
                                <span className="theme-text-primary text-sm font-semibold">
                                    {(currentWorkspace?.name ?? 'WS').slice(0, 2)}
                                </span>
                            )}
                        </button>

                        <nav className="mt-6 flex flex-1 flex-col items-center gap-3">
                            {navItemsWithRelated.map((item) => {
                                const active = isNavItemActive(url, item);
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.href}
                                        href={route(item.href)}
                                        onMouseEnter={(event) => openHoverPanel(item, event.currentTarget)}
                                        onFocus={(event) => openHoverPanel(item, event.currentTarget)}
                                        className={clsx(
                                            'inline-flex h-14 w-14 items-center justify-center rounded-[1.4rem] border transition',
                                            active
                                                ? 'theme-button-accent border-transparent shadow-[0_18px_35px_-20px_rgba(127,35,206,0.55)]'
                                                : 'theme-surface theme-border theme-text-secondary hover:opacity-90'
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="mt-4 flex flex-col items-center gap-3">
                            <button
                                type="button"
                                onMouseEnter={(event) => openHoverPanel(themeItem, event.currentTarget)}
                                onFocus={(event) => openHoverPanel(themeItem, event.currentTarget)}
                                className="theme-surface theme-border inline-flex h-12 w-12 items-center justify-center rounded-2xl border transition hover:opacity-90"
                                aria-label="Tema"
                            >
                                {themePreference === 'dark' ? <FiMoon className="h-4 w-4" /> : <FiSun className="h-4 w-4" />}
                            </button>
                            <button
                                type="button"
                                onMouseEnter={(event) => openHoverPanel(profileItem, event.currentTarget)}
                                onFocus={(event) => openHoverPanel(profileItem, event.currentTarget)}
                                className="theme-surface theme-border inline-flex h-12 w-12 items-center justify-center rounded-2xl border text-sm font-semibold transition hover:opacity-90"
                                aria-label="Perfil"
                            >
                                {user.name?.slice(0, 1)}
                            </button>
                        </div>

                        {hoveredItem ? (
                            <div
                                className="absolute left-full z-40 pl-3"
                                style={{ top: `${panelTop}px` }}
                                onMouseEnter={() => setHoveredItem(hoveredItem)}
                            >
                                <div className="absolute inset-y-0 -left-3 w-3" />
                                <div className="relative">
                                    <DesktopSidebarPanel
                                        item={hoveredItem}
                                        currentWorkspace={currentWorkspace}
                                        updateTheme={updateTheme}
                                        themePreference={themePreference}
                                        user={user}
                                    />
                                </div>
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <div className="flex h-full w-full min-h-0 flex-col">
                        <div className="flex items-center justify-between px-6 py-5">
                            <div className="min-w-0">
                                <p className="theme-accent text-xs uppercase tracking-[0.35em]">Espacio de trabajo</p>
                                <Link href="/" className="mt-3 inline-flex max-w-full">
                                    <BrandLogo compact imageClassName="max-h-10 max-w-[180px]" />
                                </Link>
                                <div className="mt-3 flex items-center gap-3">
                                    {currentWorkspace?.logo_url ? (
                                        <img src={currentWorkspace.logo_url} alt={currentWorkspace.name} className="h-10 w-10 rounded-2xl object-cover" />
                                    ) : (
                                        <div className="theme-surface flex h-10 w-10 items-center justify-center rounded-2xl border text-xs font-semibold">
                                            {(currentWorkspace?.name ?? 'WS').slice(0, 2)}
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="theme-text-primary truncate text-base font-semibold">
                                            {currentWorkspace?.name ?? 'SmartSend Workspace'}
                                        </p>
                                        <p className="theme-text-muted truncate text-xs uppercase tracking-[0.24em]">Sidebar extendida</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onToggleCollapse}
                                className="theme-surface theme-border inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition hover:opacity-90"
                                aria-label="Colapsar sidebar"
                            >
                                <FiChevronLeft className="h-5 w-5" />
                            </button>
                        </div>

                        <SidebarContent
                            user={user}
                            themePreference={themePreference}
                            updateTheme={updateTheme}
                            url={url}
                            navItems={navItems}
                            currentWorkspace={currentWorkspace}
                            availableWorkspaces={availableWorkspaces}
                            showBrandHeader={false}
                        />
                    </div>
                )}
            </div>
        </aside>
    );
}

export default function AuthenticatedLayout({ user, header, children }) {
    const { url, props } = usePage();
    const [themePreference, setThemePreference] = useState('system');
    const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [mobileNavVisible, setMobileNavVisible] = useState(true);
    const lastScrollY = useRef(0);
    const navItems = buildNavItems(props.auth?.permissions ?? []);
    const currentWorkspace = props.workspace?.current ?? null;
    const availableWorkspaces = props.workspace?.available ?? [];

    useEffect(() => {
        const persistedPreference = props.auth?.user?.theme_preference;

        if (persistedPreference) {
            setThemePreference(persistedPreference);

            if (typeof window !== 'undefined' && window.__setPreferredTheme) {
                window.__setPreferredTheme(persistedPreference);
            }

            return;
        }

        if (typeof window !== 'undefined' && window.__getPreferredTheme) {
            setThemePreference(window.__getPreferredTheme());
        }
    }, [props.auth?.user?.theme_preference]);

    useEffect(() => {
        setMobileNavOpen(false);
    }, [url]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return undefined;
        }

        const persistedDesktopSidebarState = window.localStorage.getItem('desktop-sidebar-collapsed');
        if (persistedDesktopSidebarState !== null) {
            setDesktopSidebarCollapsed(persistedDesktopSidebarState === 'true');
        }

        lastScrollY.current = window.scrollY;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const delta = currentScrollY - lastScrollY.current;

            if (currentScrollY <= 24) {
                setMobileNavVisible(true);
                lastScrollY.current = currentScrollY;
                return;
            }

            if (Math.abs(delta) < 8) {
                return;
            }

            if (delta > 0) {
                setMobileNavVisible(false);
            } else {
                setMobileNavVisible(true);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        window.localStorage.setItem('desktop-sidebar-collapsed', desktopSidebarCollapsed ? 'true' : 'false');
    }, [desktopSidebarCollapsed]);

    function updateTheme(value) {
        if (value === themePreference) {
            return;
        }

        setThemePreference(value);

        if (typeof window !== 'undefined' && window.__setPreferredTheme) {
            window.__setPreferredTheme(value);
        }

        axios.patch(route('profile.theme'), {
            theme_preference: value,
        }).catch(() => {
            setThemePreference(props.auth?.user?.theme_preference ?? 'system');

            if (typeof window !== 'undefined' && window.__setPreferredTheme) {
                window.__setPreferredTheme(props.auth?.user?.theme_preference ?? 'system');
            }
        });
    }

    function toggleDesktopSidebar() {
        setDesktopSidebarCollapsed((currentValue) => !currentValue);
    }

    return (
        <div className="theme-shell min-h-screen">
            <AppToaster />
            <div className="theme-backdrop fixed inset-0" />

            <div className={clsx('relative min-h-screen overflow-x-clip transition-[padding] duration-300', desktopSidebarCollapsed ? 'lg:pl-[104px]' : 'lg:pl-[300px]')}>
                <div
                    className={clsx(
                        'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition lg:hidden',
                        mobileNavOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                    )}
                >
                    <button type="button" className="h-full w-full" aria-label="Cerrar menú" onClick={() => setMobileNavOpen(false)} />
                </div>

                <aside
                    className={clsx(
                        'theme-surface fixed inset-y-0 left-0 z-50 w-[86vw] max-w-[340px] overflow-hidden border-r backdrop-blur-xl transition duration-300 lg:hidden',
                        mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
                    )}
                >
                    <SidebarContent
                        user={user}
                        themePreference={themePreference}
                        updateTheme={updateTheme}
                        url={url}
                        navItems={navItems}
                        currentWorkspace={currentWorkspace}
                        availableWorkspaces={availableWorkspaces}
                        closeMobileMenu={() => setMobileNavOpen(false)}
                    />
                </aside>

                <DesktopSidebar
                    user={user}
                    themePreference={themePreference}
                    updateTheme={updateTheme}
                    url={url}
                    navItems={navItems}
                    currentWorkspace={currentWorkspace}
                    availableWorkspaces={availableWorkspaces}
                    collapsed={desktopSidebarCollapsed}
                    onToggleCollapse={toggleDesktopSidebar}
                />

                <div className="theme-phone-shell relative flex min-h-screen min-w-0 flex-col lg:w-full">
                    <header className="theme-surface sticky top-0 z-30 overflow-x-clip border-b px-4 py-4 backdrop-blur lg:hidden">
                        <div className="flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={() => setMobileNavOpen(true)}
                                className="theme-border theme-text-primary inline-flex h-12 w-12 items-center justify-center rounded-2xl border"
                                aria-label="Abrir menú"
                            >
                                <FiMenu className="h-5 w-5" />
                            </button>

                            <div className="min-w-0 flex-1 overflow-hidden text-center">
                                <div className="flex justify-center">
                                    <BrandLogo compact imageClassName="max-h-8 max-w-[140px]" />
                                </div>
                                <p className="theme-text-muted mt-1 truncate text-[11px] uppercase tracking-[0.24em]">
                                    {currentWorkspace?.name ?? 'SmartSend Workspace'}
                                </p>
                            </div>

                            <div className="theme-surface-strong theme-border flex h-12 w-12 items-center justify-center rounded-2xl border text-sm font-semibold">
                                {user.name?.slice(0, 1)}
                            </div>
                        </div>
                    </header>

                    <header className="theme-surface hidden shrink-0 border-b backdrop-blur lg:block">
                        <div className="flex flex-col gap-4 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                {header}
                                <p className="theme-text-secondary mt-2 max-w-2xl text-sm">
                                    Colaboración segura y con permisos para proyectos, tareas y documentación interna.
                                </p>
                            </div>
                        </div>
                    </header>

                    <main className="theme-content-panel flex-1 min-w-0 px-3 py-4 sm:px-5 sm:py-6 lg:px-6 lg:py-8">
                        <section className="theme-surface mb-5 rounded-[2rem] border p-5 shadow-[0_18px_45px_-30px_rgba(30,11,84,0.24)] lg:hidden">
                            {header}
                            <p className="theme-text-secondary mt-2 text-sm leading-6">
                                Colaboración segura y con permisos para proyectos, tareas y documentación interna.
                            </p>
                        </section>

                        {children}
                    </main>

                    <nav
                        className={clsx(
                            'theme-mobile-nav lg:hidden',
                            mobileNavVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-[130%] opacity-0'
                        )}
                    >
                        {navItems.map((item) => {
                            const active = url.startsWith(`/${item.match.split('.')[0]}`) || route().current(item.match + '*');
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={route(item.href)}
                                    className={clsx(
                                        'flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition',
                                        active ? 'theme-button-accent shadow-[0_12px_30px_-18px_rgba(127,35,206,0.44)]' : 'theme-text-secondary'
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </div>
    );
}
