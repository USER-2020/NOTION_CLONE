import AppToaster from '@/Components/AppToaster';
import BrandLogo from '@/Components/BrandLogo';
import { Link } from '@inertiajs/react';

export default function Guest({ children }) {
    return (
        <div className="theme-shell min-h-screen">
            <AppToaster />
            <div className="theme-backdrop fixed inset-0" />

            <div className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
                <div className="theme-surface grid w-full max-w-6xl overflow-hidden rounded-[2rem] border shadow-[0_30px_80px_-40px_rgba(30,11,84,0.28)] backdrop-blur xl:grid-cols-[1.08fr_0.92fr]">
                    <div className="theme-surface-strong hidden border-r p-10 xl:flex xl:flex-col xl:justify-between">
                        <div>
                            <p className="theme-accent text-xs uppercase tracking-[0.35em]">Marca y colaboración</p>

                            <Link href="/" className="mt-5 inline-flex">
                                <BrandLogo className="max-w-full" imageClassName="max-h-16 max-w-[280px]" />
                            </Link>

                            <p className="theme-text-secondary mt-8 max-w-md text-base leading-7">
                                Plataforma para coordinar proyectos, tareas, documentación interna y ritmo operativo del equipo con una identidad visual sólida en modo claro y oscuro.
                            </p>
                        </div>

                        <div className="grid gap-4">
                            <div className="theme-surface rounded-3xl border p-5">
                                <p className="theme-text-muted text-xs uppercase tracking-[0.28em]">Diseñado para enfocarse</p>
                                <p className="theme-text-primary mt-3 text-2xl font-semibold">Todo el trabajo importante, en un solo lugar.</p>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2">
                                <div className="theme-surface rounded-3xl border p-5">
                                    <p className="theme-text-muted text-xs uppercase tracking-[0.28em]">Organiza</p>
                                    <p className="theme-text-secondary mt-3 text-sm leading-6">
                                        Proyectos con responsables, miembros, páginas y tareas conectadas.
                                    </p>
                                </div>

                                <div className="theme-surface rounded-3xl border p-5">
                                    <p className="theme-text-muted text-xs uppercase tracking-[0.28em]">Ejecuta</p>
                                    <p className="theme-text-secondary mt-3 text-sm leading-6">
                                        Accede rápido al panel y entra al flujo del equipo sin perder contexto.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8 lg:p-10">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
