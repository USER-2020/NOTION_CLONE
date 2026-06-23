import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { FiArrowUpRight, FiBookOpen, FiExternalLink, FiFileText } from 'react-icons/fi';

export default function DocumentationIndex({ auth, documentationUrl }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="theme-text-primary text-3xl font-semibold">Documentacion</h2>}
        >
            <Head title="Documentacion" />

            <div className="space-y-6">
                <section className="theme-surface overflow-hidden rounded-[2rem] border shadow-[0_18px_45px_-30px_rgba(30,11,84,0.24)]">
                    <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
                        <div className="min-w-0">
                            <div className="theme-accent-soft inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em]">
                                <FiBookOpen className="h-4 w-4" />
                                Base de conocimiento
                            </div>

                            <h1 className="theme-text-primary mt-5 text-3xl font-semibold leading-tight sm:text-4xl">
                                Documentacion central del proyecto
                            </h1>

                            <p className="theme-text-secondary mt-4 max-w-2xl text-sm leading-7 sm:text-base">
                                Aqui tienes acceso rapido a la documentacion viva del repositorio en DeepWiki. Puedes
                                consultarla dentro del dashboard o abrirla en una pestana nueva para navegarla completa.
                            </p>

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                <a
                                    href={documentationUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="theme-button-accent inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium"
                                >
                                    <FiExternalLink className="h-4 w-4" />
                                    Abrir documentacion
                                </a>

                                <a
                                    href={`${documentationUrl}#readme`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="theme-button-muted inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-medium"
                                >
                                    <FiFileText className="h-4 w-4" />
                                    Ir al README
                                </a>
                            </div>
                        </div>

                        <div className="theme-surface-strong rounded-[1.75rem] border p-5">
                            <p className="theme-text-muted text-xs uppercase tracking-[0.3em]">Enlace fuente</p>
                            <a
                                href={documentationUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="theme-text-primary mt-4 flex items-start gap-3 break-all text-sm font-medium leading-6 hover:opacity-80"
                            >
                                <FiArrowUpRight className="mt-1 h-4 w-4 shrink-0" />
                                <span>{documentationUrl}</span>
                            </a>

                            <div className="theme-muted mt-5 rounded-[1.5rem] p-4">
                                <p className="theme-text-primary text-sm font-medium">Que vas a encontrar</p>
                                <p className="theme-text-secondary mt-2 text-sm leading-6">
                                    Arquitectura general, contexto del repositorio, relaciones entre modulos y una vista
                                    mas clara para onboarding o mantenimiento.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* <section className="theme-surface rounded-[2rem] border p-3 shadow-[0_18px_45px_-30px_rgba(30,11,84,0.24)] sm:p-4">
                    <div className="theme-surface-strong overflow-hidden rounded-[1.6rem] border">
                        <iframe
                            title="Documentacion del proyecto"
                            src={documentationUrl}
                            className="h-[72vh] w-full min-h-[540px] bg-white"
                        />
                    </div>
                </section> */}
            </div>
        </AuthenticatedLayout>
    );
}
