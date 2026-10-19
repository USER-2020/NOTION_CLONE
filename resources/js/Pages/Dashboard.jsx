import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    FiAlertCircle,
    FiArrowRight,
    FiBriefcase,
    FiCalendar,
    FiCheckCircle,
    FiClock,
    FiFileText,
    FiTrendingUp,
} from 'react-icons/fi';

const statusLabels = {
    backlog: 'Pendiente',
    todo: 'Por hacer',
    in_progress: 'En progreso',
    review: 'En revisión',
    done: 'Hecha',
    blocked: 'Bloqueada',
};

const statusClasses = {
    backlog: 'dashboard-status-neutral',
    todo: 'dashboard-status-info',
    in_progress: 'dashboard-status-warning',
    review: 'dashboard-status-violet',
    done: 'dashboard-status-success',
    blocked: 'dashboard-status-danger',
};

const projectStatusLabels = {
    planning: 'Planificación',
    active: 'Activo',
    paused: 'En pausa',
    completed: 'Completado',
};

const priorityLabels = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    urgent: 'Urgente',
};

const chartColors = {
    backlog: '#94a3b8',
    todo: '#38bdf8',
    in_progress: '#f59e0b',
    review: '#a855f7',
    done: '#22c55e',
    blocked: '#f43f5e',
};

const priorityColors = {
    low: '#38bdf8',
    medium: '#f59e0b',
    high: '#f97316',
    urgent: '#f43f5e',
};

function formatDate(value) {
    if (!value) {
        return 'Sin fecha';
    }

    const date = new Date(String(value).includes('T') ? value : `${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return 'Sin fecha';
    }

    return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' }).format(date);
}

function StatCard({ icon: Icon, label, value, helper, tone = 'violet' }) {
    return (
        <article className="dashboard-stat-card">
            <div className={`dashboard-stat-icon dashboard-stat-icon-${tone}`}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
                <p className="dashboard-eyebrow">{label}</p>
                <p className="dashboard-stat-value">{value}</p>
                <p className="dashboard-stat-helper">{helper}</p>
            </div>
        </article>
    );
}

function EmptyState({ children }) {
    return <div className="dashboard-empty-state">{children}</div>;
}

function DonutChart({ segments, total }) {
    const radius = 48;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    return (
        <div className="dashboard-donut-wrap">
            <svg className="dashboard-donut" viewBox="0 0 120 120" role="img" aria-label={`Distribución de ${total} tareas por estado`}>
                <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--border)" strokeWidth="14" />
                {total > 0 && segments.map((segment) => {
                    const length = (segment.count / total) * circumference;
                    const circle = (
                        <circle
                            key={segment.key}
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="none"
                            stroke={chartColors[segment.key] ?? 'var(--accent)'}
                            strokeWidth="14"
                            strokeDasharray={`${length} ${circumference - length}`}
                            strokeDashoffset={-offset}
                            strokeLinecap="butt"
                            transform="rotate(-90 60 60)"
                        />
                    );
                    offset += length;
                    return circle;
                })}
            </svg>
            <div className="dashboard-donut-center" aria-hidden="true">
                <strong>{total}</strong>
                <span>tareas</span>
            </div>
        </div>
    );
}

function CompletionBars({ data }) {
    const max = Math.max(...data.map((item) => item.count), 0);

    if (!data.length || max === 0) {
        return <EmptyState>No hay tareas completadas en los últimos 7 días.</EmptyState>;
    }

    return (
        <div className="dashboard-bars" role="img" aria-label="Tareas completadas durante los últimos 7 días">
            {data.map((item) => {
                const date = new Date(`${item.date}T00:00:00`);
                const label = Number.isNaN(date.getTime())
                    ? item.date
                    : new Intl.DateTimeFormat('es-CO', { weekday: 'short' }).format(date).replace('.', '');

                return (
                    <div key={item.date} className="dashboard-bar-item">
                        <span className="dashboard-bar-value">{item.count}</span>
                        <div className="dashboard-bar-track" aria-hidden="true">
                            <span className="dashboard-bar-fill" style={{ height: `${Math.max((item.count / max) * 100, item.count > 0 ? 8 : 2)}%` }} />
                        </div>
                        <span className="dashboard-bar-label">{label}</span>
                    </div>
                );
            })}
        </div>
    );
}

export default function Dashboard({
    stats,
    tasksToday,
    favoriteProjects,
    projectProgress,
    recentActivity = [],
    taskStatusDistribution = [],
    taskPriorityDistribution = [],
    weeklyCompletion = [],
}) {
    const { auth, workspace } = usePage().props;
    const progressByProject = Object.fromEntries((projectProgress ?? []).map((project) => [project.id, project]));
    const statusTotal = taskStatusDistribution.reduce((total, segment) => total + Number(segment.count ?? 0), 0);
    const priorityTotal = taskPriorityDistribution.reduce((total, segment) => total + Number(segment.count ?? 0), 0);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={(
                <div>
                    <p className="dashboard-eyebrow">{workspace?.current?.name ?? 'Workspace'}</p>
                    <h2 className="theme-text-primary text-2xl font-semibold tracking-tight sm:text-3xl">Resumen de proyectos</h2>
                </div>
            )}
        >
            <Head title="Panel" />

            <div className="dashboard-page space-y-6 sm:space-y-8">
                <section className="dashboard-hero">
                    <div className="min-w-0">
                        <p className="dashboard-eyebrow">Vista general</p>
                        <h1 className="dashboard-hero-title">Una visión clara del avance y las prioridades del equipo.</h1>
                        <p className="dashboard-hero-copy">
                            Revisa el trabajo visible para tu cuenta, identifica bloqueos y entra directamente al siguiente flujo.
                        </p>
                    </div>
                    <div className="dashboard-hero-actions">
                        <Link href={route('projects.index')} className="theme-button-accent inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium">
                            <FiBriefcase className="h-4 w-4" />
                            Ver proyectos
                        </Link>
                        <Link href={route('tasks.index')} className="theme-button-muted inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium">
                            Abrir tareas
                            <FiArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </section>

                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores del workspace">
                    <StatCard icon={FiBriefcase} label="Proyectos visibles" value={stats.projectsAssigned} helper="Con acceso para esta cuenta." tone="violet" />
                    <StatCard icon={FiCheckCircle} label="Tareas completadas" value={stats.tasksCompletedThisWeek} helper="Completadas esta semana." tone="success" />
                    <StatCard icon={FiClock} label="Tareas pendientes" value={stats.tasksPending} helper="Tareas que siguen abiertas." tone="info" />
                    <StatCard icon={FiAlertCircle} label="Tareas vencidas" value={stats.tasksOverdue} helper="Requieren seguimiento." tone="danger" />
                </section>

                <section className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(19rem,0.85fr)]" aria-label="Gráficos estadísticos">
                    <article className="dashboard-panel">
                        <div className="dashboard-panel-heading">
                            <div>
                                <p className="dashboard-eyebrow">Distribución</p>
                                <h3 className="dashboard-panel-title">Estado de las tareas</h3>
                            </div>
                            <FiTrendingUp className="dashboard-heading-icon h-5 w-5" />
                        </div>

                        <div className="dashboard-chart-split mt-5">
                            {statusTotal > 0 ? <DonutChart segments={taskStatusDistribution} total={statusTotal} /> : <EmptyState>No hay tareas para analizar todavía.</EmptyState>}
                            <div className="dashboard-chart-legend">
                                {taskStatusDistribution.map((segment) => (
                                    <div key={segment.key} className="dashboard-legend-item">
                                        <span className="dashboard-legend-dot" style={{ backgroundColor: chartColors[segment.key] ?? 'var(--accent)' }} />
                                        <span className="min-w-0 flex-1 truncate">{statusLabels[segment.key] ?? segment.key}</span>
                                        <strong>{segment.count}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="dashboard-priority-summary mt-6">
                            <div className="dashboard-chart-subheading">
                                <span>Prioridad</span>
                                <span>{priorityTotal} tareas</span>
                            </div>
                            {taskPriorityDistribution.map((segment) => (
                                <div key={segment.key} className="dashboard-mini-bar-row">
                                    <span>{priorityLabels[segment.key] ?? segment.key}</span>
                                    <div className="dashboard-mini-bar-track"><span style={{ width: `${priorityTotal ? (segment.count / priorityTotal) * 100 : 0}%`, backgroundColor: priorityColors[segment.key] ?? 'var(--accent)' }} /></div>
                                    <strong>{segment.count}</strong>
                                </div>
                            ))}
                        </div>
                    </article>

                    <article className="dashboard-panel">
                        <div className="dashboard-panel-heading">
                            <div>
                                <p className="dashboard-eyebrow">Tendencia</p>
                                <h3 className="dashboard-panel-title">Completadas esta semana</h3>
                            </div>
                            <FiCheckCircle className="dashboard-heading-icon h-5 w-5" />
                        </div>
                        <div className="mt-5">
                            <CompletionBars data={weeklyCompletion} />
                        </div>
                        <p className="dashboard-chart-caption mt-4">Actividad real registrada por fecha de completado.</p>
                    </article>
                </section>

                <section className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(19rem,0.75fr)]">
                    <article className="dashboard-panel">
                        <div className="dashboard-panel-heading">
                            <div>
                                <p className="dashboard-eyebrow">Proyectos</p>
                                <h3 className="dashboard-panel-title">Tus proyectos</h3>
                            </div>
                            <Link href={route('projects.index')} className="dashboard-link">
                                Ver todos <FiArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="mt-5 overflow-x-auto">
                            {favoriteProjects?.length ? (
                                <div className="min-w-[42rem]">
                                    <div className="dashboard-table-header">
                                        <span>Proyecto</span>
                                        <span>Estado</span>
                                        <span>Avance</span>
                                        <span>Entrega</span>
                                    </div>
                                    <div className="space-y-2">
                                        {favoriteProjects.map((project) => {
                                            const progress = progressByProject[project.id]?.progress ?? 0;

                                            return (
                                                <Link key={project.id} href={route('projects.show', project.id)} className="dashboard-project-row">
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        <span className="dashboard-project-icon" style={{ '--project-color': project.color ?? 'var(--accent)' }}>
                                                            <FiBriefcase className="h-4 w-4" />
                                                        </span>
                                                        <div className="min-w-0">
                                                            <p className="truncate font-medium">{project.name}</p>
                                                            <p className="dashboard-row-muted truncate">{project.tasks_count} tareas · {project.pages_count} páginas</p>
                                                        </div>
                                                    </div>
                                                    <span className="dashboard-status-neutral">{projectStatusLabels[project.status] ?? project.status ?? 'Activo'}</span>
                                                    <div className="min-w-[7rem]">
                                                        <div className="flex items-center justify-between gap-2 text-xs">
                                                            <span className="dashboard-row-muted">{progress}%</span>
                                                        </div>
                                                        <div className="dashboard-progress-track"><span style={{ width: `${progress}%`, backgroundColor: project.color ?? 'var(--accent)' }} /></div>
                                                    </div>
                                                    <span className="dashboard-row-muted inline-flex items-center gap-1.5"><FiCalendar className="h-3.5 w-3.5" />{formatDate(project.due_date)}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <EmptyState>No hay proyectos favoritos para mostrar en este workspace.</EmptyState>
                            )}
                        </div>
                    </article>

                    <article className="dashboard-panel">
                        <div className="dashboard-panel-heading">
                            <div>
                                <p className="dashboard-eyebrow">Seguimiento</p>
                                <h3 className="dashboard-panel-title">Prioridades de hoy</h3>
                            </div>
                            <FiClock className="dashboard-heading-icon h-5 w-5" />
                        </div>

                        <div className="mt-5 space-y-2.5">
                            {tasksToday?.length ? tasksToday.map((task) => (
                                <Link key={task.id} href={route('tasks.index', { task_id: task.id })} className="dashboard-priority-row">
                                    <span className="dashboard-priority-dot" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{task.title}</p>
                                        <p className="dashboard-row-muted mt-1 truncate">{task.project?.name ?? 'Sin proyecto'}</p>
                                    </div>
                                    <span className={statusClasses[task.status] ?? 'dashboard-status-neutral'}>{statusLabels[task.status] ?? task.status}</span>
                                </Link>
                            )) : <EmptyState>No hay tareas con vencimiento para esta cuenta hoy.</EmptyState>}
                        </div>
                        <Link href={route('tasks.index')} className="dashboard-secondary-action mt-4">Ver mis tareas <FiArrowRight className="h-4 w-4" /></Link>
                    </article>
                </section>

                <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(19rem,0.72fr)]">
                    <article className="dashboard-panel">
                        <div className="dashboard-panel-heading">
                            <div>
                                <p className="dashboard-eyebrow">Actividad</p>
                                <h3 className="dashboard-panel-title">Actividad reciente</h3>
                            </div>
                            <FiFileText className="dashboard-heading-icon h-5 w-5" />
                        </div>
                        <div className="mt-5 divide-y divide-[color:var(--border)]">
                            {recentActivity?.length ? recentActivity.slice(0, 6).map((activity) => (
                                <div key={activity.id} className="dashboard-activity-row">
                                    <span className="dashboard-activity-avatar">{auth.user?.name?.slice(0, 1) ?? 'U'}</span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm">{activity.action}</p>
                                        <p className="dashboard-row-muted mt-1">{formatDate(activity.created_at)}</p>
                                    </div>
                                </div>
                            )) : <EmptyState>Aún no hay actividad registrada.</EmptyState>}
                        </div>
                    </article>

                    <article className="dashboard-panel">
                        <div className="dashboard-panel-heading">
                            <div>
                                <p className="dashboard-eyebrow">Rendimiento</p>
                                <h3 className="dashboard-panel-title">Progreso de proyectos</h3>
                            </div>
                            <FiTrendingUp className="dashboard-heading-icon h-5 w-5" />
                        </div>
                        <div className="mt-5 space-y-4">
                            {projectProgress?.length ? projectProgress.slice(0, 6).map((project) => (
                                <div key={project.id}>
                                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                                        <span className="truncate">{project.name}</span>
                                        <span className="dashboard-row-muted">{project.progress}%</span>
                                    </div>
                                    <div className="dashboard-progress-track dashboard-progress-track-large"><span style={{ width: `${project.progress}%`, backgroundColor: project.color ?? 'var(--accent)' }} /></div>
                                </div>
                            )) : <EmptyState>No hay avances calculables todavía.</EmptyState>}
                        </div>
                    </article>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
