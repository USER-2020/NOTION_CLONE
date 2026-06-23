import { Fragment, useEffect, useRef, useState } from 'react';
import AppDatePicker from '@/Components/AppDatePicker';
import AppSelect from '@/Components/AppSelect';
import Modal from '@/Components/Modal';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FiCheck, FiPaperclip, FiPlus, FiSave, FiTrash2, FiUploadCloud, FiUsers, FiX } from 'react-icons/fi';

const columns = [
    { key: 'backlog', label: 'Pendientes', accent: 'text-stone-300' },
    { key: 'todo', label: 'Por hacer', accent: 'text-sky-300' },
    { key: 'in_progress', label: 'En progreso', accent: 'text-amber-300' },
    { key: 'review', label: 'En revisión', accent: 'text-violet-300' },
    { key: 'done', label: 'Hechas', accent: 'text-emerald-300' },
    { key: 'blocked', label: 'Bloqueadas', accent: 'text-rose-300' },
];

const priorities = ['low', 'medium', 'high', 'urgent'];

const priorityLabels = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    urgent: 'Urgente',
};

const statusLabels = {
    todo: 'Por hacer',
    in_progress: 'En progreso',
    done: 'Hecha',
    blocked: 'Bloqueada',
    review: 'En revisión',
    backlog: 'Pendiente',
};

function sortTasks(tasks) {
    return [...tasks].sort((left, right) => {
        if (left.position !== right.position) {
            return left.position - right.position;
        }

        return left.id - right.id;
    });
}

function tasksForStatus(tasks, status) {
    return sortTasks(tasks.filter((task) => task.status === status));
}

function filterTasksByPriority(tasks, priority) {
    if (priority === 'all') {
        return tasks;
    }

    return tasks.filter((task) => task.priority === priority);
}

function moveTaskInBoard(tasks, taskId, targetStatus, targetIndex) {
    const task = tasks.find((item) => item.id === taskId);

    if (!task) {
        return tasks;
    }

    const buckets = Object.fromEntries(
        columns.map((column) => [
            column.key,
            tasksForStatus(tasks, column.key).filter((item) => item.id !== taskId),
        ])
    );

    const safeIndex = Math.max(0, Math.min(targetIndex, buckets[targetStatus].length));
    buckets[targetStatus].splice(safeIndex, 0, { ...task, status: targetStatus });

    return columns.flatMap((column) =>
        buckets[column.key].map((item, index) => ({
            ...item,
            status: column.key,
            position: index,
            completed_at: column.key === 'done' ? item.completed_at ?? new Date().toISOString() : null,
        }))
    );
}

function formatDate(date) {
    if (!date) {
        return 'Sin fecha límite';
    }

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(`${date}T00:00:00`));
}

function formatSize(size) {
    if (!size) {
        return '0 KB';
    }

    if (size >= 1024 * 1024) {
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${Math.max(1, Math.round(size / 1024))} KB`;
}

function formatFriendlyDateTime(value) {
    if (!value) {
        return 'Sin fecha';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Sin fecha';
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

function isImageAttachment(attachment) {
    return attachment.mime_type?.startsWith('image/');
}

function formatAssigneeNames(assignees) {
    if (!assignees?.length) {
        return 'Sin asignar';
    }

    return assignees.map((assignee) => assignee.name).join(', ');
}

function MemberPicker({ label, hint, members, selectedIds, onChange }) {
    const selectedSet = new Set((selectedIds ?? []).map(Number));

    function toggleMember(memberId) {
        if (selectedSet.has(memberId)) {
            onChange([...selectedSet].filter((id) => id !== memberId));
            return;
        }

        onChange([...selectedSet, memberId]);
    }

    return (
        <div>
            <div className="flex items-center justify-between gap-3">
                <label className="text-xs uppercase tracking-[0.2em] text-stone-500">{label}</label>
                <span className="text-xs text-stone-500">
                    {selectedSet.size ? `${selectedSet.size} seleccionados` : 'Sin selección'}
                </span>
            </div>

            {hint && <p className="mt-2 text-xs leading-5 text-stone-500">{hint}</p>}

            <div className="theme-surface-strong theme-border mt-3 rounded-3xl border p-3">
                <div className="grid gap-2">
                    {members.map((member) => {
                        const active = selectedSet.has(member.id);

                        return (
                            <button
                                key={member.id}
                                type="button"
                                onClick={() => toggleMember(member.id)}
                                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                                    active
                                        ? 'border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--text-primary)] shadow-[0_16px_30px_-24px_rgba(217,119,6,0.35)]'
                                        : 'theme-surface theme-border theme-text-secondary hover:border-[color:var(--accent)]'
                                }`}
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">{member.name}</p>
                                </div>

                                <span
                                    className={`ml-3 flex h-5 w-5 items-center justify-center rounded-md border transition ${
                                        active
                                            ? 'border-[color:var(--accent)] bg-[color:var(--accent)] text-white'
                                            : 'theme-border bg-transparent text-transparent'
                                    }`}
                                >
                                    <FiCheck className="h-3.5 w-3.5" />
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {selectedSet.size > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {members
                        .filter((member) => selectedSet.has(member.id))
                        .map((member) => (
                            <span
                                key={member.id}
                                className="inline-flex rounded-full border border-[color:var(--accent)]/40 bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-medium text-[color:var(--accent)]"
                            >
                                {member.name}
                            </span>
                        ))}
                </div>
            )}
        </div>
    );
}

function subtaskProgress(task) {
    const total = task.children?.length ?? 0;
    const completed = task.children?.filter((child) => child.status === 'done').length ?? 0;

    return { total, completed, percent: total ? Math.round((completed / total) * 100) : 0 };
}

function TaskCard({ task, onOpen, onDragStart, onDragEnd, draggable = true }) {
    return (
        <div
            draggable={draggable}
            onDragStart={() => draggable && onDragStart(task.id)}
            onDragEnd={() => draggable && onDragEnd()}
            className="rounded-3xl border border-stone-800 bg-stone-950/85 p-4 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.9)]"
        >
            <button type="button" onClick={() => onOpen(task.id)} className="block w-full text-left">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="font-medium text-stone-100">{task.title}</p>
                        <p className="mt-2 text-sm text-stone-400">{task.project?.name}</p>
                    </div>
                    <span className="rounded-full border border-stone-700 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-stone-300">
                        {priorityLabels[task.priority] ?? task.priority}
                    </span>
                </div>

                <p className="mt-4 line-clamp-3 text-sm leading-6 text-stone-400">
                    {task.description || 'Abre la tarea para agregar contexto, fechas, archivos y responsables.'}
                </p>

                <div className="mt-4 flex items-center justify-between gap-3 text-xs text-stone-500">
                    <span>{formatAssigneeNames(task.assignees)}</span>
                    <span>{formatDate(task.due_date)}</span>
                </div>
            </button>
        </div>
    );
}

export default function TasksIndex({ tasks, projects, filters = {}, activeProject = null }) {
    const { auth } = usePage().props;
    const isMember = auth.roles?.includes('member');
    const canCreateTasks = !isMember && auth.permissions?.includes('tasks.manage');
    const canFullyManageTasks = !isMember && auth.permissions?.includes('tasks.manage');
    const canCommentOnTasks = auth.permissions?.includes('comments.create');
    const filteredProjectId = filters.project_id ? Number(filters.project_id) : null;
    const requestedTaskId = filters.task_id ? Number(filters.task_id) : null;
    const hasAppliedRequestedTaskSelection = useRef(false);
    const [boardTasks, setBoardTasks] = useState(tasks);
    const [selectedTaskId, setSelectedTaskId] = useState(requestedTaskId ?? null);
    const [draggedTaskId, setDraggedTaskId] = useState(null);
    const [dragTarget, setDragTarget] = useState(null);
    const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
    const [isAttachmentDragging, setIsAttachmentDragging] = useState(false);
    const [replyingToCommentId, setReplyingToCommentId] = useState(null);
    const commentForm = useForm({
        body: '',
        parent_id: null,
    });
    const [priorityFilter, setPriorityFilter] = useState('all');

    const createForm = useForm({
        project_id: filteredProjectId ?? projects[0]?.id ?? '',
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assignee_ids: [],
        due_date: '',
        position: 0,
    });

    const subtaskForm = useForm({
        title: '',
        assignee_ids: [],
    });

    const taskForm = useForm({
        project_id: '',
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assignee_ids: [],
        due_date: '',
        position: 0,
    });

    useEffect(() => {
        setBoardTasks(tasks);

        if (!tasks.length) {
            setSelectedTaskId(null);
            return;
        }

        if (!hasAppliedRequestedTaskSelection.current && requestedTaskId && tasks.some((task) => task.id === requestedTaskId)) {
            setSelectedTaskId(requestedTaskId);
            hasAppliedRequestedTaskSelection.current = true;
            return;
        }

        if (selectedTaskId !== null && !tasks.some((task) => task.id === selectedTaskId)) {
            setSelectedTaskId(null);
        }
    }, [requestedTaskId, selectedTaskId, tasks]);

    useEffect(() => {
        if (filteredProjectId && projects.some((project) => project.id === filteredProjectId)) {
            createForm.setData('project_id', filteredProjectId);
        }
    }, [filteredProjectId, projects]);

    const selectedTask = boardTasks.find((task) => task.id === selectedTaskId) ?? null;

    useEffect(() => {
        if (!selectedTask) {
            return;
        }

        taskForm.setData({
            project_id: selectedTask.project_id ?? '',
            title: selectedTask.title ?? '',
            description: selectedTask.description ?? '',
            status: selectedTask.status ?? 'todo',
            priority: selectedTask.priority ?? 'medium',
            assignee_ids: selectedTask.assignee_ids ?? [],
            due_date: selectedTask.due_date ?? '',
            position: selectedTask.position ?? 0,
        });
    }, [selectedTask]);

    function membersForProject(projectId) {
        return projects.find((project) => project.id === projectId)?.members ?? [];
    }

    function handleCreateTask(event) {
        event.preventDefault();

        createForm.post(route('tasks.store'), {
            preserveScroll: true,
            onSuccess: () => {
                createForm.reset('title', 'description', 'assignee_ids', 'due_date');
                createForm.setData('status', 'todo');
                createForm.setData('priority', 'medium');
                setShowCreateTaskModal(false);
            },
        });
    }

    function closeCreateTaskModal() {
        setShowCreateTaskModal(false);
        createForm.clearErrors();
    }

    function handleMoveTask(status, position) {
        if (!draggedTaskId) {
            return;
        }

        const previousTasks = boardTasks;
        const nextTasks = moveTaskInBoard(boardTasks, draggedTaskId, status, position);
        const movedTaskId = draggedTaskId;

        setBoardTasks(nextTasks);
        setDragTarget(null);
        setDraggedTaskId(null);

        router.patch(
            route('tasks.move', movedTaskId),
            { status, position },
            {
                preserveScroll: true,
                onError: () => setBoardTasks(previousTasks),
            }
        );
    }

    function moveTaskDirect(taskId, status) {
        const previousTasks = boardTasks;
        const nextPosition = tasksForStatus(boardTasks, status).filter((task) => task.id !== taskId).length;
        const nextTasks = moveTaskInBoard(boardTasks, taskId, status, nextPosition);

        setBoardTasks(nextTasks);

        router.patch(
            route('tasks.move', taskId),
            { status, position: nextPosition },
            {
                preserveScroll: true,
                onError: () => setBoardTasks(previousTasks),
            }
        );
    }

    function handleUploadAttachments(event) {
        const files = Array.from(event.target.files ?? []);

        if (!selectedTaskId || !files.length) {
            return;
        }

        router.post(
            route('tasks.attachments.store', selectedTaskId),
            { files },
            {
                forceFormData: true,
                preserveScroll: true,
                onFinish: () => {
                    event.target.value = '';
                },
            }
        );
    }

    function uploadTaskFiles(files) {
        if (!selectedTaskId || !files.length) {
            return;
        }

        router.post(
            route('tasks.attachments.store', selectedTaskId),
            { files },
            {
                forceFormData: true,
                preserveScroll: true,
                onFinish: () => setIsAttachmentDragging(false),
            }
        );
    }

    function openReplyForm(commentId) {
        setReplyingToCommentId(commentId);
        commentForm.setData('parent_id', commentId);
        commentForm.setData('body', '');
    }

    function resetCommentForm() {
        setReplyingToCommentId(null);
        commentForm.reset();
        commentForm.setData('parent_id', null);
    }

    const taskProgress = selectedTask ? subtaskProgress(selectedTask) : { total: 0, completed: 0, percent: 0 };
    const filteredBoardTasks = filterTasksByPriority(boardTasks, priorityFilter);
    const filteringByPriority = priorityFilter !== 'all';

    return (
        <AuthenticatedLayout user={auth.user} header={<div className="flex items-center gap-3"><FiUsers className="h-7 w-7 text-amber-300" /><h2 className="text-3xl font-semibold text-stone-50">Tareas</h2></div>}>
            <Head title="Tareas" />

            <div className="space-y-6">
                <section className="rounded-[2rem] border border-stone-800 bg-stone-900/70 p-6">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Tablero</p>
                            <h3 className="mt-2 text-2xl font-semibold text-stone-50">Mueve el trabajo como más te guste</h3>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-400">
                                Arrastra tareas entre columnas, abre cualquier tarjeta en su panel lateral, asigna compañeros y adjunta archivos o imágenes de referencia.
                            </p>
                        </div>

                        {canCreateTasks ? (
                            <button
                                type="button"
                                onClick={() => setShowCreateTaskModal(true)}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-300 px-5 py-3 font-medium text-stone-950 transition hover:bg-amber-200"
                            >
                                <FiPlus className="h-4 w-4" />
                                Crear tarea
                            </button>
                        ) : null}
                    </div>

                    {canCreateTasks ? (
                        <div className="mt-6 rounded-3xl border border-stone-800 bg-stone-950/40 p-4 text-sm text-stone-300">
                            Usa el botón <span className="font-medium text-stone-100">Crear tarea</span> para abrir el formulario completo en un modal.
                        </div>
                    ) : (
                        <div className="mt-6 rounded-3xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-stone-300">
                            Como miembro puedes mover tareas entre estados y agregar comentarios, pero no crear o editar tareas completas.
                        </div>
                    )}

                    <div className="mt-5 flex flex-col gap-3 rounded-3xl border border-stone-800 bg-stone-950/40 p-4">
                        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Filtro de urgencia</p>
                                <p className="mt-1 text-sm text-stone-400">
                                    Filtra el tablero por nivel de prioridad para enfocarte en lo más importante.
                                </p>
                            </div>

                            {filteringByPriority && (
                                <button
                                    type="button"
                                    onClick={() => setPriorityFilter('all')}
                                    className="inline-flex items-center gap-2 rounded-full border border-stone-700 px-3 py-2 text-xs font-medium text-stone-300 transition hover:border-stone-500 hover:text-stone-100"
                                >
                                    <FiX className="h-3.5 w-3.5" />
                                    Limpiar filtro
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setPriorityFilter('all')}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                                    priorityFilter === 'all'
                                        ? 'bg-amber-300 text-stone-950'
                                        : 'border border-stone-700 text-stone-300 hover:border-stone-500'
                                }`}
                            >
                                Todas
                            </button>

                            {priorities.map((priority) => (
                                <button
                                    key={priority}
                                    type="button"
                                    onClick={() => setPriorityFilter(priority)}
                                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                                        priorityFilter === priority
                                            ? 'bg-amber-300 text-stone-950'
                                            : 'border border-stone-700 text-stone-300 hover:border-stone-500'
                                    }`}
                                >
                                    {priorityLabels[priority]}
                                </button>
                            ))}
                        </div>

                        {filteringByPriority && (
                            <p className="text-xs text-stone-500">
                                El arrastre entre columnas se pausa mientras el filtro está activo para evitar reordenamientos incompletos.
                            </p>
                        )}
                    </div>
                </section>

                <section className="grid gap-4 2xl:grid-cols-6 xl:grid-cols-3">
                    {columns.map((column) => {
                        const columnTasks = tasksForStatus(filteredBoardTasks, column.key);

                        return (
                            <div key={column.key} className="rounded-[2rem] border border-stone-800 bg-stone-900/70 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className={`text-xs uppercase tracking-[0.25em] ${column.accent}`}>{column.label}</p>
                                        <p className="mt-2 text-sm text-stone-500">{columnTasks.length} tareas</p>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    {columnTasks.length === 0 && (
                                        <button
                                            type="button"
                                            onDragOver={(event) => {
                                                if (filteringByPriority) {
                                                    return;
                                                }
                                                event.preventDefault();
                                                setDragTarget({ status: column.key, position: 0 });
                                            }}
                                            onDrop={() => !filteringByPriority && handleMoveTask(column.key, 0)}
                                            className={`flex min-h-[120px] w-full flex-col items-center justify-center gap-2 rounded-3xl border border-dashed p-4 text-sm transition ${
                                                dragTarget?.status === column.key && dragTarget?.position === 0
                                                    ? 'border-amber-300 bg-amber-300/10 text-amber-200'
                                                    : 'border-stone-700 text-stone-500'
                                            }`}
                                        >
                                            <FiPlus className="h-5 w-5" />
                                            Suelta una tarea aquí
                                        </button>
                                    )}

                                    {columnTasks.map((task, index) => (
                                        <Fragment key={task.id}>
                                            <div
                                                onDragOver={(event) => {
                                                    if (filteringByPriority) {
                                                        return;
                                                    }
                                                    event.preventDefault();
                                                    setDragTarget({ status: column.key, position: index });
                                                }}
                                                onDrop={() => !filteringByPriority && handleMoveTask(column.key, index)}
                                                className={`mb-3 rounded-full transition ${
                                                    dragTarget?.status === column.key && dragTarget?.position === index
                                                        ? 'h-3 bg-amber-300/80'
                                                        : 'h-1 bg-transparent'
                                                }`}
                                            />

                                            <TaskCard
                                                task={task}
                                                onOpen={setSelectedTaskId}
                                                onDragStart={setDraggedTaskId}
                                                onDragEnd={() => {
                                                    setDraggedTaskId(null);
                                                    setDragTarget(null);
                                                }}
                                                draggable={!filteringByPriority}
                                            />
                                        </Fragment>
                                    ))}

                                    {columnTasks.length > 0 && (
                                        <div
                                            onDragOver={(event) => {
                                                if (filteringByPriority) {
                                                    return;
                                                }
                                                event.preventDefault();
                                                setDragTarget({ status: column.key, position: columnTasks.length });
                                            }}
                                            onDrop={() => !filteringByPriority && handleMoveTask(column.key, columnTasks.length)}
                                            className={`mt-3 rounded-full transition ${
                                                dragTarget?.status === column.key && dragTarget?.position === columnTasks.length
                                                    ? 'h-3 bg-amber-300/80'
                                                    : 'h-1 bg-transparent'
                                            }`}
                                        />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </section>
            </div>

            {selectedTask && (
                <div className="fixed inset-0 z-50">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSelectedTaskId(null)}
                    />

                    <aside className="absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto border-l border-stone-800 bg-stone-950 shadow-[0_30px_100px_-30px_rgba(0,0,0,0.95)]">
                        <div className="flex items-center justify-between border-b border-stone-800 px-6 py-5">
                            <div>
                                <p className="text-xs uppercase tracking-[0.28em] text-amber-300">Detalle de tarea</p>
                                <h3 className="mt-2 text-2xl font-semibold text-stone-50">{selectedTask.title}</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedTaskId(null)}
                                className="inline-flex items-center gap-2 rounded-full border border-stone-700 px-3 py-2 text-sm text-stone-300 transition hover:border-stone-500 hover:text-stone-100"
                            >
                                <FiX className="h-4 w-4" />
                                Cerrar
                            </button>
                        </div>

                        <div className="space-y-6 p-6">
                            <div className="grid gap-4 rounded-[2rem] border border-stone-800 bg-stone-900/70 p-5 md:grid-cols-3">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Proyecto</p>
                                    <p className="mt-2 text-sm text-stone-200">{selectedTask.project?.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Responsable</p>
                                    <p className="mt-2 text-sm text-stone-200">{formatAssigneeNames(selectedTask.assignees)}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Reportó</p>
                                    <p className="mt-2 text-sm text-stone-200">{selectedTask.reporter?.name ?? 'Sistema'}</p>
                                </div>
                            </div>

                            {canFullyManageTasks && <section className="rounded-[2rem] border border-stone-800 bg-stone-900/70 p-6">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Subtareas</p>
                                        <h4 className="mt-2 text-xl font-semibold text-stone-50">
                                            {taskProgress.completed}/{taskProgress.total} completadas
                                        </h4>
                                    </div>
                                    <span className="rounded-full border border-stone-700 px-3 py-2 text-xs uppercase tracking-[0.2em] text-stone-300">
                                        {taskProgress.percent}% listo
                                    </span>
                                </div>

                                <div className="mt-4 h-2 overflow-hidden rounded-full bg-stone-800">
                                    <div className="h-full rounded-full bg-amber-300 transition-all" style={{ width: `${taskProgress.percent}%` }} />
                                </div>

                                <form
                                    onSubmit={(event) => {
                                        event.preventDefault();

                                        subtaskForm.post(route('tasks.subtasks.store', selectedTask.id), {
                                            preserveScroll: true,
                                            onSuccess: () => subtaskForm.reset(),
                                        });
                                    }}
                                    className="mt-5 space-y-4"
                                >
                                    <input
                                        className="rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100"
                                        placeholder="Agregar un paso más pequeño dentro de esta tarea"
                                        value={subtaskForm.data.title}
                                        onChange={(event) => subtaskForm.setData('title', event.target.value)}
                                    />
                                    <MemberPicker
                                        label="Responsables"
                                        hint="Marca una o varias personas para esta subtarea."
                                        members={membersForProject(selectedTask.project_id)}
                                        selectedIds={subtaskForm.data.assignee_ids}
                                        onChange={(ids) => subtaskForm.setData('assignee_ids', ids)}
                                    />
                                    <button
                                        type="submit"
                                        disabled={subtaskForm.processing}
                                        className="inline-flex items-center gap-2 rounded-2xl bg-stone-100 px-4 py-3 text-sm font-medium text-stone-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <FiPlus className="h-4 w-4" />
                                        Crear subtarea
                                    </button>
                                </form>

                                {(subtaskForm.errors.title || subtaskForm.errors.assignee_ids) && (
                                    <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                                        {subtaskForm.errors.title || subtaskForm.errors.assignee_ids}
                                    </div>
                                )}

                                <div className="mt-5 grid gap-3">
                                    {selectedTask.children?.length ? (
                                        selectedTask.children.map((child) => (
                                            <div key={child.id} className="rounded-3xl border border-stone-800 bg-stone-950/80 p-4">
                                                <div className="flex items-start gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            router.patch(
                                                                route('tasks.subtasks.update', [selectedTask.id, child.id]),
                                                                {
                                                                    status: child.status === 'done' ? 'todo' : 'done',
                                                                    assignee_ids: child.assignee_ids ?? [],
                                                                    title: child.title,
                                                                },
                                                                { preserveScroll: true }
                                                            );
                                                        }}
                                                        className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border transition ${
                                                            child.status === 'done'
                                                                ? 'border-emerald-400 bg-emerald-400 text-stone-950'
                                                                : 'border-stone-600 bg-stone-950 text-transparent hover:border-amber-300'
                                                        }`}
                                                    >
                                                        •
                                                    </button>

                                                    <div className="min-w-0 flex-1">
                                                        <p className={`font-medium ${child.status === 'done' ? 'text-stone-500 line-through' : 'text-stone-100'}`}>
                                                            {child.title}
                                                        </p>
                                                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-stone-500">
                                                            <span>{formatAssigneeNames(child.assignees)}</span>
                                                            <span>{statusLabels[child.status] ?? child.status.replace('_', ' ')}</span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            router.delete(route('tasks.subtasks.destroy', [selectedTask.id, child.id]), {
                                                                preserveScroll: true,
                                                            });
                                                        }}
                                                        className="inline-flex items-center gap-2 rounded-2xl border border-stone-700 px-3 py-2 text-xs text-stone-300 transition hover:border-rose-500/40 hover:text-rose-200"
                                                    >
                                                        <FiTrash2 className="h-3.5 w-3.5" />
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="rounded-3xl border border-dashed border-stone-700 p-6 text-sm text-stone-500">
                                            Aún no hay subtareas. Divide esta tarea en pasos más pequeños y concretos.
                                        </div>
                                    )}
                                </div>
                            </section>}

                            {canFullyManageTasks ? <form
                                id="task-edit-form"
                                onSubmit={(event) => {
                                    event.preventDefault();

                                    taskForm.patch(route('tasks.update', selectedTask.id), {
                                        preserveScroll: true,
                                        onSuccess: () => setSelectedTaskId(null),
                                    });
                                }}
                                className="space-y-5 rounded-[2rem] border border-stone-800 bg-stone-900/70 p-6"
                            >
                                <div>
                                    <label className="text-xs uppercase tracking-[0.2em] text-stone-500">Título</label>
                                    <input
                                        className="mt-2 w-full rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100"
                                        value={taskForm.data.title}
                                        onChange={(event) => taskForm.setData('title', event.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs uppercase tracking-[0.2em] text-stone-500">Descripción</label>
                                    <textarea
                                        rows="6"
                                        className="mt-2 w-full rounded-3xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100"
                                        value={taskForm.data.description}
                                        onChange={(event) => taskForm.setData('description', event.target.value)}
                                        placeholder="Agrega pasos, contexto, criterios de aceptación o notas para el equipo."
                                    />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-xs uppercase tracking-[0.2em] text-stone-500">Estado</label>
                                        <AppSelect
                                            wrapperClassName="mt-2"
                                            value={taskForm.data.status}
                                            onChange={(event) => taskForm.setData('status', event.target.value)}
                                        >
                                            {columns.map((column) => (
                                                <option key={column.key} value={column.key}>
                                                    {column.label}
                                                </option>
                                            ))}
                                        </AppSelect>
                                    </div>

                                    <div>
                                        <label className="text-xs uppercase tracking-[0.2em] text-stone-500">Prioridad</label>
                                        <AppSelect
                                            wrapperClassName="mt-2"
                                            value={taskForm.data.priority}
                                            onChange={(event) => taskForm.setData('priority', event.target.value)}
                                        >
                                            {priorities.map((priority) => (
                                                <option key={priority} value={priority}>
                                                    {priorityLabels[priority] ?? priority}
                                                </option>
                                            ))}
                                        </AppSelect>
                                    </div>

                                    <div className="md:col-span-2">
                                        <MemberPicker
                                            label="Responsables"
                                            hint="Marca uno o varios miembros para compartir la ejecución de esta tarea."
                                            members={membersForProject(selectedTask.project_id)}
                                            selectedIds={taskForm.data.assignee_ids}
                                            onChange={(ids) => taskForm.setData('assignee_ids', ids)}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs uppercase tracking-[0.2em] text-stone-500">Fecha límite</label>
                                        <AppDatePicker
                                            className="mt-2 border-stone-700 bg-stone-950 text-stone-100"
                                            value={taskForm.data.due_date}
                                            onChange={(event) => taskForm.setData('due_date', event.target.value)}
                                            placeholder="Selecciona fecha limite"
                                        />
                                    </div>
                                </div>

                                {(taskForm.errors.title || taskForm.errors.assignee_ids || taskForm.errors.project_id) && (
                                    <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                                        {taskForm.errors.title || taskForm.errors.assignee_ids || taskForm.errors.project_id}
                                    </div>
                                )}

                            </form> : (
                                <section className="space-y-5 rounded-[2rem] border border-stone-800 bg-stone-900/70 p-6">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Estado actual</p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {columns.map((column) => (
                                                <button
                                                    key={column.key}
                                                    type="button"
                                                    onClick={() => {
                                                        if (selectedTask.status === column.key) {
                                                            return;
                                                        }

                                                        moveTaskDirect(selectedTask.id, column.key);
                                                    }}
                                                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                                                        selectedTask.status === column.key
                                                            ? 'bg-amber-300 text-stone-950'
                                                            : 'border border-stone-700 text-stone-300 hover:border-stone-500'
                                                    }`}
                                                >
                                                    {column.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="rounded-3xl border border-amber-300/25 bg-amber-300/10 p-4 text-sm text-stone-300">
                                        Como miembro solo puedes cambiar el estado de la tarea y participar en los comentarios.
                                    </div>
                                </section>
                            )}

                            {canCommentOnTasks && <section className="rounded-[2rem] border border-stone-800 bg-stone-900/70 p-6">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Comentarios</p>
                                    <h4 className="mt-2 text-xl font-semibold text-stone-50">Conversación de la tarea</h4>
                                </div>

                                <form
                                    onSubmit={(event) => {
                                        event.preventDefault();

                                        commentForm.post(route('tasks.comments.store', selectedTask.id), {
                                            preserveScroll: true,
                                            onSuccess: () => resetCommentForm(),
                                        });
                                    }}
                                    className="mt-5 space-y-4"
                                >
                                    <textarea
                                        rows="4"
                                        className="w-full rounded-3xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100"
                                        placeholder={replyingToCommentId ? 'Escribe una respuesta para este comentario.' : 'Escribe un comentario para dejar contexto o pedir una actualización.'}
                                        value={commentForm.data.body}
                                        onChange={(event) => commentForm.setData('body', event.target.value)}
                                    />

                                    {replyingToCommentId && (
                                        <div className="flex items-center justify-between gap-3 rounded-2xl border border-stone-700 px-4 py-3 text-xs text-stone-400">
                                            <span>Respondiendo a un comentario del hilo.</span>
                                            <button
                                                type="button"
                                                onClick={resetCommentForm}
                                                className="inline-flex items-center gap-2 text-stone-300 transition hover:text-stone-100"
                                            >
                                                <FiX className="h-3.5 w-3.5" />
                                                Cancelar respuesta
                                            </button>
                                        </div>
                                    )}

                                    {commentForm.errors.body && (
                                        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                                            {commentForm.errors.body}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={commentForm.processing}
                                        className="inline-flex items-center gap-2 rounded-2xl bg-amber-300 px-5 py-3 text-sm font-medium text-stone-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <FiPlus className="h-4 w-4" />
                                        Agregar comentario
                                    </button>
                                </form>

                                <div className="mt-5 grid gap-3">
                                    {selectedTask.comments?.length ? (
                                        selectedTask.comments.map((comment) => (
                                            <article key={comment.id} className="rounded-3xl border border-stone-800 bg-stone-950/80 p-4">
                                                <div className="flex items-center justify-between gap-3">
                                                    <p className="text-sm font-medium text-stone-100">{comment.user?.name ?? 'Usuario'}</p>
                                                    <p className="text-xs text-stone-500">{formatFriendlyDateTime(comment.created_at)}</p>
                                                </div>
                                                <p className="mt-3 text-sm leading-6 text-stone-300">{comment.body}</p>
                                                <div className="mt-4 flex items-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => openReplyForm(comment.id)}
                                                        className="text-xs font-medium text-amber-300 transition hover:text-amber-200"
                                                    >
                                                        Responder
                                                    </button>
                                                    {comment.replies?.length ? (
                                                        <span className="text-xs text-stone-500">
                                                            {comment.replies.length} respuesta{comment.replies.length === 1 ? '' : 's'}
                                                        </span>
                                                    ) : null}
                                                </div>

                                                {comment.replies?.length ? (
                                                    <div className="mt-4 space-y-3 border-l border-stone-700 pl-4">
                                                        {comment.replies.map((reply) => (
                                                            <div key={reply.id} className="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
                                                                <div className="flex items-center justify-between gap-3">
                                                                    <p className="text-sm font-medium text-stone-100">{reply.user?.name ?? 'Usuario'}</p>
                                                                    <p className="text-xs text-stone-500">{formatFriendlyDateTime(reply.created_at)}</p>
                                                                </div>
                                                                <p className="mt-3 text-sm leading-6 text-stone-300">{reply.body}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : null}
                                            </article>
                                        ))
                                    ) : (
                                        <div className="rounded-3xl border border-dashed border-stone-700 p-6 text-sm text-stone-500">
                                            Aún no hay comentarios en esta tarea.
                                        </div>
                                    )}
                                </div>
                            </section>}

                            {canFullyManageTasks && <section className="rounded-[2rem] border border-stone-800 bg-stone-900/70 p-6">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Adjuntos</p>
                                        <h4 className="mt-2 text-xl font-semibold text-stone-50">Agrega capturas, mockups o documentos</h4>
                                    </div>
                                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-stone-100 px-4 py-3 text-sm font-medium text-stone-950 transition hover:bg-amber-300">
                                        <FiUploadCloud className="h-4 w-4" />
                                        Subir archivos
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*,.pdf,.txt,.doc,.docx"
                                            className="hidden"
                                            onChange={handleUploadAttachments}
                                        />
                                    </label>
                                </div>

                                <div
                                    onDragOver={(event) => {
                                        event.preventDefault();
                                        setIsAttachmentDragging(true);
                                    }}
                                    onDragLeave={(event) => {
                                        event.preventDefault();
                                        if (event.currentTarget.contains(event.relatedTarget)) {
                                            return;
                                        }
                                        setIsAttachmentDragging(false);
                                    }}
                                    onDrop={(event) => {
                                        event.preventDefault();
                                        const files = Array.from(event.dataTransfer.files ?? []);
                                        uploadTaskFiles(files);
                                    }}
                                    className={`mt-5 rounded-[2rem] border border-dashed px-5 py-8 text-center transition ${
                                        isAttachmentDragging
                                            ? 'border-amber-300 bg-amber-300/10 text-amber-200'
                                            : 'border-stone-700 bg-stone-950/60 text-stone-500'
                                    }`}
                                >
                                    <div className="flex items-center justify-center gap-2 text-stone-200">
                                        <FiPaperclip className="h-4 w-4" />
                                        <p className="text-sm font-medium">Suelta archivos aquí para adjuntarlos a la tarea</p>
                                    </div>
                                    <p className="mt-2 text-xs">
                                        Imágenes, PDF, briefs y documentos de oficina de hasta 10 MB cada uno.
                                    </p>
                                </div>

                                <div className="mt-5 grid gap-4">
                                    {selectedTask.attachments.length ? (
                                        selectedTask.attachments.map((attachment) => (
                                            <div key={attachment.id} className="rounded-3xl border border-stone-800 bg-stone-950/80 p-4">
                                                {isImageAttachment(attachment) && (
                                                    <img
                                                        src={attachment.url}
                                                        alt={attachment.name}
                                                        className="mb-4 h-48 w-full rounded-2xl object-cover"
                                                    />
                                                )}

                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <div>
                                                        <a
                                                            href={attachment.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="font-medium text-stone-100 transition hover:text-amber-300"
                                                        >
                                                            {attachment.name}
                                                        </a>
                                                        <p className="mt-1 text-sm text-stone-400">
                                                            {formatSize(attachment.size)} - {attachment.uploaded_by_name ?? 'Usuario desconocido'}
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            router.delete(route('tasks.attachments.destroy', [selectedTask.id, attachment.id]), {
                                                                preserveScroll: true,
                                                            });
                                                        }}
                                                        className="inline-flex items-center gap-2 rounded-2xl border border-stone-700 px-4 py-2 text-sm text-stone-300 transition hover:border-rose-500/40 hover:text-rose-200"
                                                    >
                                                        <FiTrash2 className="h-4 w-4" />
                                                        Quitar
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="rounded-3xl border border-dashed border-stone-700 p-6 text-sm text-stone-500">
                                            Aún no hay adjuntos. Agrega imágenes, briefs o archivos de apoyo para hacer la tarea más clara.
                                        </div>
                                    )}
                                </div>
                            </section>}

                            {canFullyManageTasks && (
                                <section className="rounded-[2rem] border border-stone-800 bg-stone-900/70 p-6">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                                        <button
                                            type="submit"
                                            form="task-edit-form"
                                            disabled={taskForm.processing}
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-300 px-5 py-3 font-medium text-stone-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <FiSave className="h-4 w-4" />
                                            Guardar tarea
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                router.delete(route('tasks.destroy', selectedTask.id), {
                                                    preserveScroll: true,
                                                    onSuccess: () => setSelectedTaskId(null),
                                                });
                                            }}
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-500/40 px-5 py-3 text-rose-200 transition hover:bg-rose-500/10"
                                        >
                                            <FiTrash2 className="h-4 w-4" />
                                            Eliminar tarea
                                        </button>
                                    </div>
                                </section>
                            )}
                        </div>
                    </aside>
                </div>
            )}
            <Modal show={showCreateTaskModal} onClose={closeCreateTaskModal} maxWidth="2xl">
                <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-4 rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--bg-surface)]/80 p-4 sm:p-5">
                        <div className="min-w-0">
                            <p className="text-[11px] uppercase tracking-[0.32em] text-amber-300">Nueva tarea</p>
                            <h3 className="mt-2 text-2xl font-semibold text-stone-50 sm:text-[2rem]">Crear tarea</h3>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-400">
                                Completa los datos básicos de la tarea y asígnala al proyecto que corresponda.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={closeCreateTaskModal}
                            className="theme-surface inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[color:var(--accent)]/60 text-[color:var(--accent)] transition hover:bg-[color:var(--accent-soft)]"
                            aria-label="Cerrar modal"
                        >
                            <FiX className="h-4 w-4" />
                        </button>
                    </div>

                    <form onSubmit={handleCreateTask} className="mt-5 space-y-4 sm:mt-6">
                        <div className="rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--bg-surface)]/80 p-4 sm:p-5">
                            <div className="grid gap-4 xl:grid-cols-2">
                            <AppSelect value={createForm.data.project_id} onChange={(event) => createForm.setData('project_id', event.target.value)}>
                                {projects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </AppSelect>

                            <input
                                className="theme-input w-full rounded-2xl border px-4 py-3 text-base text-stone-100"
                                placeholder="Título de la tarea"
                                value={createForm.data.title}
                                onChange={(event) => createForm.setData('title', event.target.value)}
                            />
                            </div>

                            <textarea
                                className="theme-input mt-4 h-32 w-full rounded-2xl border px-4 py-3 text-base text-stone-100"
                            placeholder="Descripción"
                            value={createForm.data.description}
                            onChange={(event) => createForm.setData('description', event.target.value)}
                            />
                        </div>

                        <div className="rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--bg-surface)]/80 p-4 sm:p-5">
                            <div className="grid gap-4 lg:grid-cols-3">
                            <AppSelect value={createForm.data.status} onChange={(event) => createForm.setData('status', event.target.value)}>
                                {columns.map((column) => (
                                    <option key={column.key} value={column.key}>
                                        {column.label}
                                    </option>
                                ))}
                            </AppSelect>

                            <AppSelect value={createForm.data.priority} onChange={(event) => createForm.setData('priority', event.target.value)}>
                                {priorities.map((priority) => (
                                    <option key={priority} value={priority}>
                                        {priorityLabels[priority] ?? priority}
                                    </option>
                                ))}
                            </AppSelect>

                            <AppDatePicker
                                className="text-stone-100"
                                value={createForm.data.due_date}
                                onChange={(event) => createForm.setData('due_date', event.target.value)}
                                placeholder="Selecciona fecha limite"
                            />
                            </div>
                        </div>

                        <div className="rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--bg-surface)]/80 p-4 sm:p-5">
                            <MemberPicker
                                label="Responsables"
                                hint="Puedes seleccionar varios miembros del proyecto."
                                members={membersForProject(Number(createForm.data.project_id))}
                                selectedIds={createForm.data.assignee_ids}
                                onChange={(selectedIds) => createForm.setData('assignee_ids', selectedIds)}
                            />
                        </div>

                        {(createForm.errors.title || createForm.errors.project_id) && (
                            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                                {createForm.errors.title || createForm.errors.project_id}
                            </div>
                        )}

                        <div className="sticky bottom-0 -mx-4 border-t border-[color:var(--border)] bg-[color:var(--bg-surface-strong)]/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={closeCreateTaskModal}
                                    className="theme-surface theme-text-secondary inline-flex min-h-12 items-center justify-center rounded-2xl border border-[color:var(--border-strong)] px-5 py-3 text-sm font-medium transition hover:opacity-90"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-amber-300 px-5 py-3 font-medium text-stone-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <FiPlus className="h-4 w-4" />
                                    Crear tarea
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
