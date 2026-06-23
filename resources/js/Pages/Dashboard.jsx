import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { FiAlertCircle, FiArrowRight, FiBriefcase, FiCheckCircle, FiClock, FiTrendingUp } from 'react-icons/fi';

function StatCard({ icon: Icon, label, value, helper }) {
    return (
        <div className="rounded-3xl border border-stone-800 bg-stone-900/70 p-5">
            <div className="flex items-center gap-2 text-stone-500">
                <Icon className="h-4 w-4" />
                <p className="text-xs uppercase tracking-[0.28em]">{label}</p>
            </div>
            <p className="mt-4 text-4xl font-semibold text-stone-50">{value}</p>
            <p className="mt-2 text-sm text-stone-400">{helper}</p>
        </div>
    );
}

const statusLabels = {
    backlog: 'Pendiente',
    todo: 'Por hacer',
    in_progress: 'En progreso',
    review: 'En revisión',
    done: 'Hecha',
    blocked: 'Bloqueada',
};

export default function Dashboard({ stats, tasksToday, favoriteProjects, projectProgress }) {
    const { auth } = usePage().props;

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="theme-text-primary text-3xl font-semibold">Panel</h2>}>
            <Head title="Panel" />

            <div className="space-y-8">
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard icon={FiBriefcase} label="Proyectos asignados" value={stats.projectsAssigned} helper="Proyectos a los que este usuario realmente puede entrar." />
                    <StatCard icon={FiClock} label="Tareas pendientes" value={stats.tasksPending} helper="Tareas visibles que siguen en movimiento." />
                    <StatCard icon={FiAlertCircle} label="Tareas vencidas" value={stats.tasksOverdue} helper="Elementos que necesitan un plan de recuperación." />
                    <StatCard icon={FiCheckCircle} label="Hechas esta semana" value={stats.tasksCompletedThisWeek} helper="Avance entregado durante la semana actual." />
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-[2rem] border border-stone-800 bg-stone-900/70 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Hoy</p>
                                <h3 className="mt-2 text-2xl font-semibold text-stone-50">Tareas con vencimiento cercano</h3>
                            </div>
                            <Link href={route('tasks.index')} className="inline-flex items-center gap-2 text-sm text-amber-500 transition hover:text-amber-600">
                                Abrir tablero
                                <FiArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="mt-6 space-y-3">
                            {tasksToday.length ? (
                                tasksToday.map((task) => (
                                    <div key={task.id} className="rounded-2xl border border-stone-800 bg-stone-950/70 p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="font-medium text-stone-100">{task.title}</p>
                                                <p className="mt-1 text-sm text-stone-400">{task.project?.name}</p>
                                            </div>
                                            <span className="rounded-full border border-stone-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-stone-300">
                                                {statusLabels[task.status] ?? task.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-stone-700 p-6 text-sm text-stone-400">
                                    No hay tareas con vencimiento para esta cuenta hoy.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-stone-800 bg-stone-900/70 p-6">
                        <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Acciones rápidas</p>
                        <div className="mt-5 grid gap-3">
                            <Link href={route('projects.index')} className="inline-flex items-center justify-between rounded-2xl bg-amber-300 px-4 py-3 text-sm font-medium text-stone-950">
                                Revisar proyectos
                                <FiArrowRight className="h-4 w-4" />
                            </Link>
                            <Link href={route('tasks.index')} className="inline-flex items-center justify-between rounded-2xl border border-stone-700 px-4 py-3 text-sm text-stone-200">
                                Crear o actualizar tareas
                                <FiArrowRight className="h-4 w-4" />
                            </Link>
                            <Link href={route('profile.edit')} className="inline-flex items-center justify-between rounded-2xl border border-stone-700 px-4 py-3 text-sm text-stone-200">
                                Actualizar perfil
                                <FiArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-2">
                    <div className="rounded-[2rem] border border-stone-800 bg-stone-900/70 p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-stone-50">Proyectos favoritos</h3>
                            <Link href={route('projects.index')} className="text-sm text-stone-400 hover:text-stone-200">
                                Todos los proyectos
                            </Link>
                        </div>
                        <div className="mt-5 grid gap-4">
                            {favoriteProjects.map((project) => (
                                <Link
                                    key={project.id}
                                    href={route('projects.show', project.id)}
                                    className="rounded-3xl border border-stone-800 bg-stone-950/70 p-5 transition hover:border-stone-700"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
                                        <p className="text-lg font-medium text-stone-100">{project.name}</p>
                                    </div>
                                    <p className="mt-3 text-sm text-stone-400">{project.description}</p>
                                    <p className="mt-4 text-xs uppercase tracking-[0.2em] text-stone-500">
                                        {project.tasks_count} tareas • {project.pages_count} páginas
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-stone-800 bg-stone-900/70 p-6">
                        <div className="flex items-center gap-2">
                            <FiTrendingUp className="h-5 w-5 text-amber-300" />
                            <h3 className="text-xl font-semibold text-stone-50">Progreso de proyectos</h3>
                        </div>
                        <div className="mt-5 space-y-4">
                            {projectProgress.map((project) => (
                                <div key={project.id}>
                                    <div className="mb-2 flex items-center justify-between text-sm">
                                        <span className="text-stone-200">{project.name}</span>
                                        <span className="text-stone-400">{project.progress}%</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-stone-800">
                                        <div className="h-full rounded-full" style={{ width: `${project.progress}%`, backgroundColor: project.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
