import AppSelect from '@/Components/AppSelect';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FiArrowLeft, FiBookOpen, FiClock, FiFileText, FiFolder, FiLayers, FiSave, FiStar } from 'react-icons/fi';

function formatBlockLabel(type) {
    return String(type ?? '')
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function PageShow({ page, relatedPages, projects, workspaces }) {
    const { auth } = usePage().props;
    const canEditPages = auth.permissions?.includes('pages.edit');

    const form = useForm({
        workspace_id: page.workspace_id,
        project_id: page.project_id ?? '',
        parent_id: page.parent_id ?? '',
        title: page.title,
        excerpt: page.excerpt ?? '',
        body: page.body ?? '',
        is_favorite: page.is_favorite,
    });

    const siblingOptions = relatedPages.filter((item) => item.id !== page.id);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="theme-text-primary text-3xl font-semibold">{page.title}</h2>}
        >
            <Head title={page.title} />

            <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
                <aside className="theme-surface rounded-[2rem] border p-4 shadow-[0_18px_45px_-30px_rgba(30,11,84,0.24)]">
                    <div className="px-2">
                        <p className="theme-text-muted text-xs uppercase tracking-[0.25em]">
                            {page.project ? 'Páginas del proyecto' : 'Páginas del espacio'}
                        </p>
                        <p className="theme-text-secondary mt-2 text-sm leading-6">
                            {page.project
                                ? `Todas las páginas conectadas a ${page.project.name}.`
                                : 'Páginas disponibles en este espacio de trabajo.'}
                        </p>
                    </div>

                    <div className="mt-4 space-y-2">
                        {relatedPages.map((item) => (
                            <Link
                                key={item.id}
                                href={route('pages.show', item.slug)}
                                className={`block rounded-2xl px-3 py-3 text-sm transition ${
                                    item.id === page.id
                                        ? 'theme-accent-soft border'
                                        : item.is_favorite
                                          ? 'theme-surface-strong theme-text-secondary border border-[color:var(--accent)] hover:border-[color:var(--accent)]'
                                          : 'theme-surface-strong theme-text-secondary border hover:border-[color:var(--accent)]'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <FiFileText className="h-4 w-4" />
                                    <span className="truncate">{item.title}</span>
                                    {item.is_favorite ? <FiStar className="theme-accent h-3.5 w-3.5 shrink-0" /> : null}
                                </div>
                            </Link>
                        ))}
                    </div>
                </aside>

                <div className="space-y-6">
                    <section className="theme-surface rounded-[2rem] border p-6 shadow-[0_18px_45px_-30px_rgba(30,11,84,0.24)]">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3">
                                    <span className="theme-accent-soft rounded-2xl p-3">
                                        <FiBookOpen className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <p className="theme-text-muted text-xs uppercase tracking-[0.25em]">Página</p>
                                        <div className="mt-1 flex flex-wrap items-center gap-2">
                                            <h3 className="theme-text-primary text-2xl font-semibold">{page.title}</h3>
                                            {page.is_favorite ? (
                                                <span className="theme-accent-soft inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]">
                                                    <FiStar className="h-3 w-3" />
                                                    Favorita
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>

                                <p className="theme-text-secondary mt-4 max-w-3xl text-sm leading-6">
                                    {page.excerpt || 'Esta página todavía no tiene resumen.'}
                                </p>
                            </div>

                            {page.project ? (
                                <Link
                                    href={route('projects.show', page.project.id ?? page.project.slug)}
                                    className="theme-button-muted inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium"
                                >
                                    <FiArrowLeft className="h-4 w-4" />
                                    Volver al proyecto
                                </Link>
                            ) : null}
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                            <div className="theme-muted rounded-[1.5rem] p-4">
                                <div className="theme-text-muted flex items-center gap-2 text-[11px] uppercase tracking-[0.28em]">
                                    <FiFolder className="h-4 w-4" />
                                    Espacio
                                </div>
                                <p className="theme-text-primary mt-3 text-sm font-semibold">{page.workspace?.name}</p>
                            </div>

                            <div className="theme-muted rounded-[1.5rem] p-4">
                                <div className="theme-text-muted flex items-center gap-2 text-[11px] uppercase tracking-[0.28em]">
                                    <FiLayers className="h-4 w-4" />
                                    Proyecto
                                </div>
                                <p className="theme-text-primary mt-3 text-sm font-semibold">{page.project?.name ?? 'Sin proyecto'}</p>
                            </div>

                            <div className="theme-muted rounded-[1.5rem] p-4">
                                <div className="theme-text-muted flex items-center gap-2 text-[11px] uppercase tracking-[0.28em]">
                                    <FiClock className="h-4 w-4" />
                                    Hijas
                                </div>
                                <p className="theme-text-primary mt-3 text-sm font-semibold">{page.children?.length ?? 0} páginas</p>
                            </div>
                        </div>
                    </section>

                    {canEditPages ? (
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                form.patch(route('pages.update', page.slug));
                            }}
                            className="theme-surface rounded-[2rem] border p-6 shadow-[0_18px_45px_-30px_rgba(30,11,84,0.24)]"
                        >
                            <div>
                                <h3 className="theme-text-primary text-xl font-semibold">Editar página</h3>
                                <p className="theme-text-secondary mt-1 text-sm">
                                    Actualiza el contexto, el resumen y el contenido principal de esta página.
                                </p>
                            </div>

                            <div className="mt-5 space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <AppSelect value={form.data.workspace_id} onChange={(event) => form.setData('workspace_id', event.target.value)}>
                                        {workspaces.map((workspace) => (
                                            <option key={workspace.id} value={workspace.id}>
                                                {workspace.name}
                                            </option>
                                        ))}
                                    </AppSelect>

                                    <AppSelect value={form.data.project_id} onChange={(event) => form.setData('project_id', event.target.value)}>
                                        <option value="">Sin proyecto</option>
                                        {projects.map((project) => (
                                            <option key={project.id} value={project.id}>
                                                {project.name}
                                            </option>
                                        ))}
                                    </AppSelect>
                                </div>

                                <AppSelect value={form.data.parent_id} onChange={(event) => form.setData('parent_id', event.target.value)}>
                                    <option value="">Sin página padre</option>
                                    {siblingOptions.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.title}
                                        </option>
                                    ))}
                                </AppSelect>

                                <input
                                    className="theme-input w-full rounded-2xl border px-4 py-3"
                                    value={form.data.title}
                                    onChange={(event) => form.setData('title', event.target.value)}
                                    placeholder="Título de la página"
                                />

                                <textarea
                                    className="theme-input h-24 w-full rounded-2xl border px-4 py-3"
                                    value={form.data.excerpt}
                                    onChange={(event) => form.setData('excerpt', event.target.value)}
                                    placeholder="Resumen corto de la página"
                                />

                                <textarea
                                    className="theme-input h-56 w-full rounded-2xl border px-4 py-3"
                                    value={form.data.body}
                                    onChange={(event) => form.setData('body', event.target.value)}
                                    placeholder="Escribe el contenido principal de la página"
                                />

                                <label className="theme-text-secondary flex items-center gap-3 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={form.data.is_favorite}
                                        onChange={(event) => form.setData('is_favorite', event.target.checked)}
                                        className="theme-input rounded border"
                                    />
                                    Marcar como favorita
                                </label>
                                {form.data.is_favorite ? (
                                    <div className="theme-accent-soft rounded-2xl border px-4 py-3 text-sm">
                                        Esta página aparecerá destacada y se ordenará primero en las listas del proyecto o del espacio.
                                    </div>
                                ) : null}

                                <button className="theme-button-accent inline-flex items-center gap-2 rounded-2xl px-4 py-3 font-medium">
                                    <FiSave className="h-4 w-4" />
                                    Guardar página
                                </button>
                            </div>
                        </form>
                    ) : (
                        <section className="theme-surface rounded-[2rem] border p-6 shadow-[0_18px_45px_-30px_rgba(30,11,84,0.24)]">
                            <p className="theme-text-muted text-xs uppercase tracking-[0.25em]">Página</p>
                            <h3 className="theme-text-primary mt-2 text-2xl font-semibold">{page.title}</h3>
                            <p className="theme-text-secondary mt-4 text-sm leading-6">
                                {page.excerpt || 'Esta página todavía no tiene resumen.'}
                            </p>
                            <div className="theme-accent-soft mt-5 rounded-3xl border p-4 text-sm">
                                Como miembro puedes consultar páginas, pero no crear, editar ni eliminar contenido.
                            </div>
                        </section>
                    )}

                    <section className="theme-surface rounded-[2rem] border p-6 shadow-[0_18px_45px_-30px_rgba(30,11,84,0.24)]">
                        <p className="theme-text-muted text-xs uppercase tracking-[0.25em]">Contenido principal</p>
                        <div className="theme-surface-strong mt-4 rounded-[1.5rem] border p-5">
                            <p className="theme-text-secondary whitespace-pre-line text-sm leading-7">
                                {page.body || 'Esta página todavía no tiene contenido principal.'}
                            </p>
                        </div>
                    </section>

                    <section className="theme-surface rounded-[2rem] border p-6 shadow-[0_18px_45px_-30px_rgba(30,11,84,0.24)]">
                        <p className="theme-text-muted text-xs uppercase tracking-[0.25em]">Bloques de la página</p>
                        <div className="mt-4 space-y-4">
                            {page.blocks.length ? (
                                page.blocks.map((block) => (
                                    <div key={block.id} className="theme-surface-strong rounded-2xl border p-4">
                                        <p className="theme-text-muted text-xs uppercase tracking-[0.25em]">
                                            {formatBlockLabel(block.type)}
                                        </p>
                                        <p className="theme-text-secondary mt-2 whitespace-pre-line text-sm leading-6">
                                            {block.content}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="theme-text-muted theme-border rounded-2xl border border-dashed px-4 py-5 text-sm">
                                    Esta página todavía no tiene bloques guardados.
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
