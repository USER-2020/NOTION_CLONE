import AppDatePicker from '@/Components/AppDatePicker';
import AppSelect from '@/Components/AppSelect';
import MemberMultiSelect from '@/Components/MemberMultiSelect';
import Modal from '@/Components/Modal';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    FiArrowRight,
    FiBookOpen,
    FiCalendar,
    FiCheckCircle,
    FiClock,
    FiEdit3,
    FiFileText,
    FiFolder,
    FiPlusCircle,
    FiSave,
    FiStar,
    FiUsers,
    FiX,
} from 'react-icons/fi';

const priorityLabels = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    urgent: 'Urgente',
};

const statusLabels = {
    planning: 'Planificación',
    active: 'Activo',
    paused: 'En pausa',
    completed: 'Completado',
};

const projectStatusStyles = {
    planning: 'theme-accent-soft',
    active: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
    paused: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
    completed: 'border-sky-400/30 bg-sky-400/10 text-sky-200',
};

function formatFriendlyDateTime(value) {
    if (!value) {
        return 'Sin actualización reciente';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Sin actualización reciente';
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffInDays = Math.round((startOfToday - startOfTarget) / 86400000);
    const timeLabel = new Intl.DateTimeFormat('es-CO', {
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);

    if (diffInDays === 0) {
        return `Hoy a las ${timeLabel}`;
    }

    if (diffInDays === 1) {
        return `Ayer a las ${timeLabel}`;
    }

    return new Intl.DateTimeFormat('es-CO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

function PeopleChips({ people, emptyLabel }) {
    if (!people?.length) {
        return <p className="theme-text-muted text-sm">{emptyLabel}</p>;
    }

    return (
        <div className="mt-3 flex flex-wrap gap-2.5">
            {people.map((person) => (
                <span key={person.id} className="theme-surface-strong theme-text-secondary rounded-full border px-4 py-2 text-sm">
                    {person.name}
                </span>
            ))}
        </div>
    );
}

function SectionCard({ children, className = '' }) {
    return (
        <section className={`theme-surface rounded-[2rem] border p-5 shadow-[0_18px_45px_-30px_rgba(30,11,84,0.24)] sm:p-6 ${className}`}>
            {children}
        </section>
    );
}

export default function ProjectShow({ project, workspaces, managerOptions, memberOptions }) {
    const { auth } = usePage().props;
    const canUpdateProject = auth.permissions?.includes('projects.update');
    const canEditPages = auth.permissions?.includes('pages.edit');
    const [showEditProjectModal, setShowEditProjectModal] = useState(false);
    const [showCreatePageModal, setShowCreatePageModal] = useState(false);

    const form = useForm({
        workspace_id: project.workspace_id,
        name: project.name,
        description: project.description ?? '',
        status: project.status,
        priority: project.priority,
        start_date: project.start_date ?? '',
        due_date: project.due_date ?? '',
        icon: project.icon ?? 'folder',
        color: project.color ?? '#1f7a8c',
        manager_ids: project.manager_ids ?? [],
        member_ids: project.member_ids ?? [],
    });

    const pageForm = useForm({
        workspace_id: project.workspace_id,
        project_id: project.id,
        parent_id: '',
        title: '',
        excerpt: '',
        body: '',
        is_favorite: false,
    });

    function closeEditProjectModal() {
        setShowEditProjectModal(false);
        form.clearErrors();
    }

    function closeCreatePageModal() {
        setShowCreatePageModal(false);
        pageForm.reset();
        pageForm.clearErrors();
    }

    function submit(event) {
        event.preventDefault();
        form.patch(route('projects.update', project.id), {
            onSuccess: () => closeEditProjectModal(),
        });
    }

    function submitPage(event) {
        event.preventDefault();
        pageForm.post(route('pages.store'), {
            onSuccess: () => closeCreatePageModal(),
        });
    }

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="theme-text-primary text-3xl font-semibold">{project.name}</h2>}>
            <Head title={project.name} />

            <div className="grid gap-6 xl:grid-cols-12">
                <div className="space-y-6 xl:col-span-8">
                    <SectionCard>
                        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-start gap-4">
                                    <span className="theme-accent-soft rounded-2xl p-3">
                                        <FiFolder className="h-5 w-5" />
                                    </span>

                                    <div className="min-w-0 flex-1">
                                        <p className="theme-text-muted text-xs uppercase tracking-[0.28em]">Proyecto</p>
                                        <h3 className="theme-text-primary mt-1 break-words text-2xl font-semibold sm:text-3xl">{project.name}</h3>
                                        <p className="theme-text-secondary mt-3 max-w-3xl text-sm leading-6 sm:text-base">
                                            {project.description || 'Este proyecto todavía no tiene una descripción detallada.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-start gap-3 xl:items-end">
                                <div className="flex flex-wrap gap-2 xl:max-w-[240px] xl:justify-end">
                                    <span className="theme-muted theme-text-secondary rounded-full border px-4 py-2 text-xs uppercase tracking-[0.22em]">
                                        {priorityLabels[project.priority] ?? project.priority}
                                    </span>
                                    <span className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.22em] ${projectStatusStyles[project.status] ?? 'theme-accent-soft'}`}>
                                        {statusLabels[project.status] ?? project.status}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    {canUpdateProject ? (
                                        <button
                                            type="button"
                                            onClick={() => setShowEditProjectModal(true)}
                                            className="theme-button-muted inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium"
                                        >
                                            <FiEdit3 className="h-4 w-4" />
                                            Editar proyecto
                                        </button>
                                    ) : null}

                                    {canEditPages ? (
                                        <button
                                            type="button"
                                            onClick={() => setShowCreatePageModal(true)}
                                            className="theme-button-accent inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium"
                                        >
                                            <FiPlusCircle className="h-4 w-4" />
                                            Crear página
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-3">
                            <div className="theme-muted rounded-[1.5rem] p-4">
                                <div className="theme-text-muted flex items-center gap-2 text-[11px] uppercase tracking-[0.28em]">
                                    <FiCheckCircle className="h-4 w-4" />
                                    Tareas
                                </div>
                                <p className="theme-text-primary mt-3 text-2xl font-semibold">{project.tasks.length}</p>
                            </div>

                            <div className="theme-muted rounded-[1.5rem] p-4">
                                <div className="theme-text-muted flex items-center gap-2 text-[11px] uppercase tracking-[0.28em]">
                                    <FiBookOpen className="h-4 w-4" />
                                    Páginas
                                </div>
                                <p className="theme-text-primary mt-3 text-2xl font-semibold">{project.pages.length}</p>
                            </div>

                            <div className="theme-muted rounded-[1.5rem] p-4">
                                <div className="theme-text-muted flex items-center gap-2 text-[11px] uppercase tracking-[0.28em]">
                                    <FiCalendar className="h-4 w-4" />
                                    Fechas
                                </div>
                                <p className="theme-text-primary mt-3 text-sm font-semibold leading-6">
                                    {project.start_date || 'Sin inicio'}
                                    <br />
                                    {project.due_date || 'Sin cierre'}
                                </p>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="theme-text-primary text-xl font-semibold">Tareas del proyecto</h3>
                                <p className="theme-text-secondary mt-1 text-sm leading-6">
                                    Aquí ves las tareas asociadas a este proyecto.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            {project.tasks.length ? (
                                project.tasks.map((task) => (
                                    <Link
                                        key={task.id}
                                        href={route('tasks.index', { project_id: project.id, task_id: task.id })}
                                        className="theme-surface-strong group block rounded-[1.5rem] border p-4 transition hover:-translate-y-0.5 hover:border-[color:var(--accent)] hover:shadow-[0_18px_40px_-30px_rgba(127,35,206,0.35)]"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="theme-text-primary break-words font-medium">{task.title}</p>
                                            <span className="theme-text-muted shrink-0 text-[11px] uppercase tracking-[0.22em] transition group-hover:text-[color:var(--accent)]">
                                                {task.status}
                                            </span>
                                        </div>

                                        <p className="theme-text-secondary mt-3 text-sm leading-6">
                                            {task.assignees?.length ? task.assignees.map((assignee) => assignee.name).join(', ') : 'Sin asignar'}
                                        </p>

                                        <div className="theme-text-muted mt-4 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em]">
                                            <span>Ver en tareas</span>
                                            <FiArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:text-[color:var(--accent)]" />
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="theme-text-muted theme-border rounded-[1.5rem] border border-dashed px-4 py-5 text-sm md:col-span-2">
                                    Este proyecto aún no tiene tareas asociadas.
                                </div>
                            )}
                        </div>
                    </SectionCard>
                </div>

                <div className="space-y-6 xl:col-span-4">
                    <SectionCard className="lg:sticky lg:top-24">
                        <h3 className="theme-text-primary text-xl font-semibold">Equipo del proyecto</h3>

                        <div className="mt-5 space-y-5">
                            <div>
                                <p className="theme-text-muted text-xs uppercase tracking-[0.2em]">Creado por</p>
                                <p className="theme-text-secondary mt-2 text-sm">{project.owner?.name ?? 'Sin registro'}</p>
                            </div>

                            <div>
                                <p className="theme-text-muted text-xs uppercase tracking-[0.2em]">Gestores del proyecto</p>
                                <PeopleChips people={project.managers} emptyLabel="Sin gestores asignados." />
                            </div>

                            <div>
                                <p className="theme-text-muted text-xs uppercase tracking-[0.2em]">Miembros del proyecto</p>
                                <PeopleChips people={project.members} emptyLabel="Sin miembros asignados." />
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="theme-text-primary text-xl font-semibold">Páginas del proyecto</h3>
                                <p className="theme-text-secondary mt-1 text-sm leading-6">
                                    Documentación, notas y contenido relacionado con este proyecto.
                                </p>
                            </div>

                            <Link href={route('projects.index')} className="theme-accent shrink-0 text-sm transition hover:opacity-80">
                                Volver
                            </Link>
                        </div>

                        <div className="mt-5 space-y-3">
                            {project.pages.length ? (
                                project.pages.map((page) => (
                                    <Link
                                        key={page.id}
                                        href={route('pages.show', page.slug)}
                                        className={`theme-surface-strong group block rounded-[1.5rem] border p-4 transition hover:border-[color:var(--accent)] ${
                                            page.is_favorite ? 'border-[color:var(--accent)] shadow-[0_14px_30px_-24px_rgba(127,35,206,0.35)]' : ''
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <FiFileText className="theme-accent h-4 w-4 shrink-0" />
                                                    <p className="theme-text-primary break-words font-medium">{page.title}</p>
                                                    {page.is_favorite ? (
                                                        <span className="theme-accent-soft inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]">
                                                            <FiStar className="h-3 w-3" />
                                                            Favorita
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <p className="theme-text-secondary mt-2 line-clamp-2 text-sm leading-6">
                                                    {page.excerpt || 'Sin resumen todavía.'}
                                                </p>
                                            </div>

                                            <FiArrowRight className="theme-text-muted mt-1 h-4 w-4 shrink-0 transition group-hover:text-[color:var(--accent)]" />
                                        </div>

                                        <div className="theme-text-muted mt-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
                                            <FiClock className="h-3.5 w-3.5" />
                                            Actualizada: {formatFriendlyDateTime(page.updated_at)}
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="theme-text-muted theme-border rounded-[1.5rem] border border-dashed px-4 py-5 text-sm">
                                    Este proyecto todavía no tiene páginas asociadas.
                                </div>
                            )}
                        </div>
                    </SectionCard>
                </div>
            </div>

            <Modal show={showEditProjectModal} onClose={closeEditProjectModal} maxWidth="2xl">
                <div className="p-6 sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <span className="theme-accent-soft rounded-2xl p-3">
                                <FiEdit3 className="h-5 w-5" />
                            </span>
                            <div>
                                <h3 className="theme-text-primary text-2xl font-semibold">Editar proyecto</h3>
                                <p className="theme-text-secondary mt-2 text-sm leading-6">
                                    Ajusta el contenido, el estado, las fechas y las personas asociadas al proyecto.
                                </p>
                            </div>
                        </div>

                        <button type="button" onClick={closeEditProjectModal} className="theme-button-muted inline-flex h-11 w-11 items-center justify-center rounded-2xl border" aria-label="Cerrar modal">
                            <FiX className="h-4 w-4" />
                        </button>
                    </div>

                    <form onSubmit={submit} className="mt-6 space-y-5">
                        <div className="grid gap-4 xl:grid-cols-2">
                            <AppSelect value={form.data.workspace_id} onChange={(event) => form.setData('workspace_id', event.target.value)}>
                                {workspaces.map((workspace) => (
                                    <option key={workspace.id} value={workspace.id}>
                                        {workspace.name}
                                    </option>
                                ))}
                            </AppSelect>

                            <input className="theme-input w-full rounded-2xl border px-4 py-3" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} placeholder="Nombre del proyecto" />
                        </div>

                        <textarea className="theme-input h-32 w-full rounded-2xl border px-4 py-3" value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} placeholder="Descripción" />

                        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
                            <AppSelect value={form.data.priority} onChange={(event) => form.setData('priority', event.target.value)}>
                                {Object.entries(priorityLabels).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </AppSelect>

                            <AppSelect value={form.data.status} onChange={(event) => form.setData('status', event.target.value)}>
                                {Object.entries(statusLabels).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </AppSelect>

                            <AppDatePicker value={form.data.start_date} onChange={(event) => form.setData('start_date', event.target.value)} placeholder="Fecha de inicio" />
                            <AppDatePicker value={form.data.due_date} onChange={(event) => form.setData('due_date', event.target.value)} placeholder="Fecha de cierre" />
                        </div>

                        <div className="grid gap-5 xl:grid-cols-2">
                            <MemberMultiSelect
                                label="Gestores del proyecto"
                                hint="Puedes seleccionar varios usuarios con rol gestor de proyectos."
                                members={managerOptions}
                                selectedIds={form.data.manager_ids}
                                onChange={(selectedIds) => form.setData('manager_ids', selectedIds)}
                            />

                            <MemberMultiSelect
                                label="Miembros del proyecto"
                                hint="Selecciona las personas con rol miembro que participarán en el proyecto."
                                members={memberOptions}
                                selectedIds={form.data.member_ids}
                                onChange={(selectedIds) => form.setData('member_ids', selectedIds)}
                            />
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button type="button" onClick={closeEditProjectModal} className="theme-button-muted inline-flex items-center justify-center rounded-2xl border px-5 py-3 text-sm font-medium">
                                Cancelar
                            </button>
                            <button type="submit" disabled={form.processing} className="theme-button-accent inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium">
                                <FiSave className="h-4 w-4" />
                                Guardar cambios
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            <Modal show={showCreatePageModal} onClose={closeCreatePageModal} maxWidth="2xl">
                <div className="p-6 sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <span className="theme-accent-soft rounded-2xl p-3">
                                <FiPlusCircle className="h-5 w-5" />
                            </span>
                            <div>
                                <h3 className="theme-text-primary text-2xl font-semibold">Crear página en este proyecto</h3>
                                <p className="theme-text-secondary mt-2 text-sm leading-6">
                                    Crea una página nueva y ábrela enseguida para seguir editando su contenido.
                                </p>
                            </div>
                        </div>

                        <button type="button" onClick={closeCreatePageModal} className="theme-button-muted inline-flex h-11 w-11 items-center justify-center rounded-2xl border" aria-label="Cerrar modal">
                            <FiX className="h-4 w-4" />
                        </button>
                    </div>

                    <form onSubmit={submitPage} className="mt-6 grid gap-4 xl:grid-cols-2">
                        <input className="theme-input w-full rounded-2xl border px-4 py-3 xl:col-span-2" value={pageForm.data.title} onChange={(event) => pageForm.setData('title', event.target.value)} placeholder="Título de la página" />

                        <textarea className="theme-input h-28 w-full rounded-2xl border px-4 py-3" value={pageForm.data.excerpt} onChange={(event) => pageForm.setData('excerpt', event.target.value)} placeholder="Resumen corto de la página" />

                        <textarea className="theme-input h-28 w-full rounded-2xl border px-4 py-3" value={pageForm.data.body} onChange={(event) => pageForm.setData('body', event.target.value)} placeholder="Contenido inicial de la página" />

                        <div className="flex flex-col gap-3 xl:col-span-2 xl:flex-row xl:flex-wrap xl:items-center xl:justify-between">
                            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                                <label className="theme-text-secondary flex items-center gap-3 text-sm">
                                    <input type="checkbox" checked={pageForm.data.is_favorite} onChange={(event) => pageForm.setData('is_favorite', event.target.checked)} className="theme-input rounded border" />
                                    Marcar como favorita
                                </label>

                                {pageForm.data.is_favorite ? (
                                    <span className="theme-accent-soft inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
                                        <FiStar className="h-3.5 w-3.5" />
                                        Se mostrará primero en este proyecto
                                    </span>
                                ) : null}
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                <button type="button" onClick={closeCreatePageModal} className="theme-button-muted inline-flex items-center justify-center rounded-2xl border px-5 py-3 text-sm font-medium">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={pageForm.processing} className="theme-button-accent inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium">
                                    <FiBookOpen className="h-4 w-4" />
                                    Crear página
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
