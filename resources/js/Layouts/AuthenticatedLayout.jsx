import AppToaster from '@/Components/AppToaster';
import AppSelect from '@/Components/AppSelect';
import BrandLogo from '@/Components/BrandLogo';
import axios from 'axios';
import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { FiBookOpen, FiBriefcase, FiGrid, FiLayers, FiLogOut, FiMenu, FiMoon, FiSettings, FiSun, FiUser, FiUsers, FiX } from 'react-icons/fi';

const baseNavItems = [
    { label: 'Panel', href: 'dashboard', match: 'dashboard', icon: FiGrid },
    { label: 'Proyectos', href: 'projects.index', match: 'projects.', icon: FiBriefcase },
    { label: 'Tareas', href: 'tasks.index', match: 'tasks.', icon: FiLayers },
    { label: 'Documentacion', href: 'documentation.index', match: 'documentation', icon: FiBookOpen },
];

const themes = [
    { value: 'light', label: 'Claro', icon: FiSun, description: 'Modo claro' },
    { value: 'dark', label: 'Oscuro', icon: FiMoon, description: 'Modo oscuro' },
    { value: 'system', label: 'Sistema', icon: FiSettings, description: 'Seguir sistema' },
];

function clsx(...values) {
    return values.filter(Boolean).join(' ');
}

function buildNavItems(permissions = []) {
    const items = [...baseNavItems];

    if (permissions.includes('workspaces.view')) {
        items.push({ label: 'Espacios', href: 'workspaces.index', match: 'workspaces.', icon: FiBriefcase });
    }

    if (permissions.includes('users.manage')) {
        items.push({ label: 'Miembros', href: 'users.index', match: 'users.', icon: FiUsers });
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

function SidebarContent({
    user,
    themePreference,
    updateTheme,
    url,
    navItems,
    currentWorkspace,
    availableWorkspaces,
    closeMobileMenu = null,
}) {
    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="flex items-center justify-between px-6 py-6">
                <div className="min-w-0">
                    <p className="theme-accent text-xs uppercase tracking-[0.35em]">Espacio de trabajo</p>
                    <Link href="/" className="mt-3 inline-flex max-w-full">
                        <BrandLogo compact imageClassName="max-h-10 max-w-[180px]" />
                    </Link>
                    <h1 className="theme-text-primary mt-3 truncate text-xl font-semibold">
                        {currentWorkspace?.name ?? 'SmartSend Workspace'}
                    </h1>
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
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4">
                <nav className="space-y-2">
                    {navItems.map((item) => {
                        const active = url.startsWith(`/${item.match.split('.')[0]}`) || route().current(item.match + '*');
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

            <div className="shrink-0 border-t theme-border">
                <SidebarFooter user={user} />
            </div>
        </div>
    );
}

export default function AuthenticatedLayout({ user, header, children }) {
    const { url, props } = usePage();
    const [themePreference, setThemePreference] = useState('system');
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

    return (
        <div className="theme-shell min-h-screen">
            <AppToaster />
            <div className="theme-backdrop fixed inset-0" />

            <div className="relative min-h-screen overflow-x-clip lg:pl-[280px]">
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

                <aside className="theme-surface theme-border fixed inset-y-0 left-0 z-30 hidden w-[280px] overflow-hidden border-r backdrop-blur lg:block">
                    <SidebarContent
                        user={user}
                        themePreference={themePreference}
                        updateTheme={updateTheme}
                        url={url}
                        navItems={navItems}
                        currentWorkspace={currentWorkspace}
                        availableWorkspaces={availableWorkspaces}
                    />
                </aside>

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
