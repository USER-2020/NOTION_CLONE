import AppSelect from '@/Components/AppSelect';
import LogoUploadField from '@/Components/LogoUploadField';
import Modal from '@/Components/Modal';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { FiArrowRight, FiBriefcase, FiCheckCircle, FiClock, FiFolder, FiPauseCircle, FiPlayCircle, FiPlusCircle, FiX } from 'react-icons/fi';

const statusLabels = {
    planning: 'Planificación',
    active: 'Activa',
    paused: 'En pausa',
    completed: 'Completada',
    backlog: 'Pendiente',
    todo: 'Por hacer',
    in_progress: 'En progreso',
    review: 'En revisión',
    done: 'Hecha',
    blocked: 'Bloqueada',
};

const priorityLabels = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    urgent: 'Urgente',
};

const projectStatusIndicator = {
    planning: '#7f23ce',
    active: '#10b981',
    paused: '#f59e0b',
    completed: '#2563eb',
};

const statusStyles = {
    planning: 'border-[color:var(--border-strong)] bg-[color:var(--accent-soft)] theme-text-secondary',
    active: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
    paused: 'border-[color:var(--border-strong)] bg-[color:var(--accent-soft)] theme-text-secondary',
    completed: 'border-violet-400/30 bg-violet-400/10 text-violet-200',
    backlog: 'theme-border bg-[color:var(--bg-muted)] theme-text-secondary',
    todo: 'border-[color:var(--border-strong)] bg-[color:var(--accent-soft)] theme-text-secondary',
    in_progress: 'border-[color:var(--border-strong)] bg-[color:var(--accent-soft)] theme-text-secondary',
    review: 'border-violet-400/30 bg-violet-400/10 text-violet-200',
    done: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
    blocked: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
};

function TaskStatusIcon({ status }) {
    if (status === 'done' || status === 'completed') {
        return <FiCheckCircle className="h-3.5 w-3.5 shrink-0" />;
    }

    if (status === 'in_progress' || status === 'active') {
        return <FiPlayCircle className="h-3.5 w-3.5 shrink-0" />;
    }

    if (status === 'paused' || status === 'blocked') {
        return <FiPauseCircle className="h-3.5 w-3.5 shrink-0" />;
    }

    return <FiClock className="h-3.5 w-3.5 shrink-0" />;
}

export default function ProjectsIndex({ projects, workspaces }) {
    const { auth } = usePage().props;
    const canCreateProject = auth.permissions?.includes('projects.create');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const form = useForm({
        workspace_id: workspaces[0]?.id ?? '',
        name: '',
        description: '',
        logo: null,
        remove_logo: false,
    });

    const closeModal = () => {
        setShowCreateModal(false);
        form.reset();
        form.clearErrors();
    };

    const submit = (event) => {
        event.preventDefault();
        form.post(route('projects.store'), {
            forceFormData: true,
            onSuccess: () => closeModal(),
        });
    };

    function tooltipPlacement(index) {
        const isRightColumnOnXl = index % 2 === 1;
        const isRightColumnOn2xl = index % 3 === 2;

        return [
            'left-full ml-4',
            isRightColumnOnXl ? 'xl:right-full xl:left-auto xl:mr-4 xl:ml-0' : '',
            isRightColumnOn2xl ? '2xl:right-full 2xl:left-auto 2xl:mr-4 2xl:ml-0' : '2xl:left-full 2xl:right-auto 2xl:ml-4 2xl:mr-0',
        ]
            .filter(Boolean)
            .join(' ');
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-3">
                    <FiBriefcase className="theme-accent h-7 w-7" />
                    <h2 className="theme-text-primary text-3xl font-semibold">Proyectos</h2>
                </div>
            }
        >
            <Head title="Proyectos" />

            <div className="min-w-0 space-y-6">
                <section className="theme-surface rounded-[2rem] border p-5 shadow-[0_18px_45px_-30px_rgba(30,11,84,0.24)] sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="theme-text-muted text-xs uppercase tracking-[0.28em]">Colección de proyectos</p>
                            <h3 className="theme-text-primary mt-2 text-2xl font-semibold">Espacio de creación y seguimiento</h3>
                            <p className="theme-text-secondary mt-2 max-w-3xl text-sm leading-6">
                                Revisa tus proyectos, consulta sus tareas principales y crea nuevos proyectos desde un flujo más limpio.
                            </p>
                        </div>

                        {canCreateProject ? (
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(true)}
                                className="theme-button-accent inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold sm:w-auto"
                            >
                                <FiPlusCircle className="h-4 w-4" />
                                Crear proyecto
                            </button>
                        ) : null}
                    </div>
                </section>

                <div className="grid min-w-0 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                    {projects.map((project, index) => (
                        <Link
                            key={project.id}
                            href={route('projects.show', project.id)}
                            className="theme-surface group relative z-0 flex min-h-[290px] min-w-0 flex-col overflow-visible rounded-[2rem] border p-4 shadow-[0_18px_45px_-30px_rgba(30,11,84,0.24)] transition hover:z-40 hover:-translate-y-0.5 hover:border-[color:var(--accent)] sm:p-5"
                        >
                            <div
                                className={`theme-tooltip pointer-events-none absolute top-5 z-30 hidden w-80 rounded-[1.5rem] border px-4 py-4 text-left opacity-0 shadow-[0_24px_55px_-30px_rgba(30,11,84,0.42)] transition duration-200 group-hover:translate-x-1 group-hover:opacity-100 xl:block ${tooltipPlacement(index)}`}
                            >
                                <p className="text-sm font-semibold">{project.name}</p>
                                <p className="mt-1 text-xs leading-5">
                                    {project.description || 'Este proyecto todavía no tiene descripción.'}
                                </p>

                                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <p className="theme-text-muted uppercase tracking-[0.18em]">Estado</p>
                                        <p className="mt-1 font-medium">{statusLabels[project.status] ?? project.status}</p>
                                    </div>
                                    <div>
                                        <p className="theme-text-muted uppercase tracking-[0.18em]">Prioridad</p>
                                        <p className="mt-1 font-medium">{priorityLabels[project.priority] ?? 'Media'}</p>
                                    </div>
                                    <div>
                                        <p className="theme-text-muted uppercase tracking-[0.18em]">Gestores</p>
                                        <p className="mt-1 font-medium">{project.manager_count ?? 0}</p>
                                    </div>
                                    <div>
                                        <p className="theme-text-muted uppercase tracking-[0.18em]">Miembros</p>
                                        <p className="mt-1 font-medium">{project.member_count ?? 0}</p>
                                    </div>
                                    <div>
                                        <p className="theme-text-muted uppercase tracking-[0.18em]">Tareas</p>
                                        <p className="mt-1 font-medium">{project.tasks_count}</p>
                                    </div>
                                    <div>
                                        <p className="theme-text-muted uppercase tracking-[0.18em]">Páginas</p>
                                        <p className="mt-1 font-medium">{project.pages_count}</p>
                                    </div>
                                </div>

                                <div className="mt-4 border-t pt-3">
                                    <p className="theme-text-muted text-[11px] uppercase tracking-[0.2em]">Creado por</p>
                                    <p className="mt-1 text-sm font-medium">{project.owner?.name ?? 'Sin registro'}</p>
                                </div>

                                <div className="mt-4 border-t pt-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="theme-text-muted text-[11px] uppercase tracking-[0.2em]">Tareas principales</p>
                                        <span className="theme-text-muted text-[11px]">{project.top_tasks?.length ?? 0}</span>
                                    </div>

                                    <div className="mt-2 space-y-2">
                                        {project.top_tasks?.length ? (
                                            project.top_tasks.map((task) => (
                                                <div key={task.id} className="flex items-center justify-between gap-3 text-xs">
                                                    <div className="flex min-w-0 items-center gap-2">
                                                        <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                                                            <TaskStatusIcon status={task.status} />
                                                        </span>
                                                        <span className="truncate">{task.title}</span>
                                                    </div>
                                                    <span className="theme-text-muted shrink-0 uppercase tracking-[0.15em]">
                                                        {statusLabels[task.status] ?? task.status}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="theme-text-muted text-xs">Sin tareas asociadas.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex min-w-0 items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-3">
                                        {project.logo_url ? (
                                            <img
                                                src={project.logo_url}
                                                alt={`Logo de ${project.name}`}
                                                className="h-10 w-10 rounded-2xl object-cover"
                                            />
                                        ) : (
                                            <div className="theme-muted flex h-10 w-10 items-center justify-center rounded-2xl">
                                                <FiFolder className="theme-text-muted h-4 w-4" />
                                            </div>
                                        )}
                                        <span
                                            className="h-3 w-3 rounded-full shadow-sm ring-2 ring-white/40"
                                            style={{ backgroundColor: projectStatusIndicator[project.status] ?? project.color ?? '#7f23ce' }}
                                            title={statusLabels[project.status] ?? 'Estado del proyecto'}
                                        />
                                    </div>

                                    <h3 className="theme-text-primary mt-3 break-words text-lg font-semibold leading-7">
                                        {project.name}
                                    </h3>

                                    <p className="theme-text-muted mt-2 text-[11px] uppercase tracking-[0.24em]">
                                        {project.workspace?.name}
                                    </p>
                                </div>

                                <span className="theme-muted theme-text-secondary inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] max-[360px]:px-2">
                                    {project.tasks_count} tareas
                                </span>
                            </div>

                            <p className="theme-text-secondary mt-4 line-clamp-2 text-sm leading-6">
                                {project.description || 'Este proyecto aún no tiene descripción.'}
                            </p>

                            <div className="theme-surface-strong mt-5 min-w-0 rounded-[1.5rem] border p-3 sm:p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="theme-text-muted text-xs uppercase tracking-[0.24em]">Tareas principales</p>

                                    <span className="theme-text-muted text-xs">
                                        {project.top_tasks?.length ? `${project.top_tasks.length} de ${project.tasks_count}` : 'Sin tareas'}
                                    </span>
                                </div>

                                <div className="mt-3 space-y-2">
                                    {project.top_tasks?.length ? (
                                        project.top_tasks.map((task) => (
                                            <div key={task.id} className="theme-shell theme-border flex items-center justify-between gap-3 rounded-2xl border px-3 py-3">
                                                <div className="theme-text-secondary flex min-w-0 items-center gap-2 text-sm">
                                                    <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                                                        <TaskStatusIcon status={task.status} />
                                                    </span>
                                                    <span className="truncate">{task.title}</span>
                                                </div>

                                                <span
                                                    className={`project-task-status-badge project-task-status-badge-${task.status} inline-flex shrink-0 rounded-full border px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] sm:px-2.5 sm:tracking-[0.18em] ${
                                                        statusStyles[task.status] ?? 'theme-border bg-[color:var(--bg-muted)] theme-text-secondary'
                                                    }`}
                                                >
                                                    {statusLabels[task.status] ?? task.status}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="theme-text-muted theme-border rounded-2xl border border-dashed px-3 py-4 text-sm">
                                            Este proyecto todavía no tiene tareas asociadas.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="theme-text-muted mt-auto flex flex-wrap items-center justify-between gap-3 pt-5 text-xs uppercase tracking-[0.2em]">
                                <span>{project.pages_count} páginas</span>

                                <span className="inline-flex items-center gap-2 transition group-hover:text-[color:var(--accent)]">
                                    Ver proyecto
                                    <FiArrowRight className="h-3.5 w-3.5" />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <Modal show={showCreateModal} onClose={closeModal} maxWidth="2xl">
                <div className="p-6 sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <span className="theme-accent-soft rounded-2xl p-3">
                                <FiPlusCircle className="h-5 w-5" />
                            </span>

                            <div>
                                <h3 className="theme-text-primary text-2xl font-semibold">Crear proyecto</h3>
                                <p className="theme-text-secondary mt-2 text-sm leading-6">
                                    Completa los datos básicos del proyecto y lo dejaremos listo dentro del espacio de trabajo seleccionado.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={closeModal}
                            className="theme-button-muted inline-flex h-11 w-11 items-center justify-center rounded-2xl border"
                            aria-label="Cerrar modal"
                        >
                            <FiX className="h-4 w-4" />
                        </button>
                    </div>

                    <form onSubmit={submit} className="mt-6 space-y-4">
                        <AppSelect className="w-full" value={form.data.workspace_id} onChange={(event) => form.setData('workspace_id', event.target.value)}>
                            {workspaces.map((workspace) => (
                                <option key={workspace.id} value={workspace.id}>
                                    {workspace.name}
                                </option>
                            ))}
                        </AppSelect>

                        <input
                            className="theme-input w-full rounded-2xl border px-4 py-3"
                            placeholder="Nombre del proyecto"
                            value={form.data.name}
                            onChange={(event) => form.setData('name', event.target.value)}
                        />

                        <textarea
                            className="theme-input h-32 w-full rounded-2xl border px-4 py-3"
                            placeholder="Descripción"
                            value={form.data.description}
                            onChange={(event) => form.setData('description', event.target.value)}
                        />

                        <LogoUploadField
                            label="Logo del proyecto"
                            hint="Opcional. Puedes asociar un logo visual para diferenciar este proyecto."
                            file={form.data.logo}
                            currentUrl={null}
                            removeRequested={form.data.remove_logo}
                            onFileChange={(file) => form.setData('logo', file)}
                            onRemoveChange={(value) => form.setData('remove_logo', value)}
                            error={form.errors.logo}
                        />

                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="theme-button-muted inline-flex items-center justify-center rounded-2xl border px-5 py-3 text-sm font-medium"
                            >
                                Cancelar
                            </button>

                            <button
                                className="theme-button-accent inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition hover:opacity-95"
                                disabled={form.processing}
                            >
                                <FiPlusCircle className="h-4 w-4" />
                                Guardar proyecto
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
