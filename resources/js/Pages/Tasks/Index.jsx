import { useEffect, useRef, useState } from 'react';
import AppDatePicker from '@/Components/AppDatePicker';
import RichTextEditor from '@/Components/RichTextEditor';
import AppSelect from '@/Components/AppSelect';
import Modal from '@/Components/Modal';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    closestCorners,
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    useDroppable,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiCalendar, FiCheck, FiChevronDown, FiClock, FiFileText, FiFlag, FiLink, FiMaximize2, FiMessageCircle, FiPaperclip, FiPlus, FiSave, FiTag, FiTarget, FiTrash2, FiUploadCloud, FiUsers, FiX } from 'react-icons/fi';

const columns = [
    { key: 'backlog', label: 'Pendientes', accent: 'text-stone-300' },
    { key: 'todo', label: 'Por hacer', accent: 'text-sky-300' },
    { key: 'in_progress', label: 'En progreso', accent: 'text-amber-300' },
    { key: 'review', label: 'En revisión', accent: 'text-violet-300' },
    { key: 'done', label: 'Hechas', accent: 'text-emerald-300' },
    { key: 'blocked', label: 'Bloqueadas', accent: 'text-rose-300' },
];

const taskDndId = (taskId) => `task-${taskId}`;
const columnDndId = (columnKey) => `column-${columnKey}`;
const taskIdFromDndId = (id) => Number(String(id).replace('task-', ''));
const columnKeyFromDndId = (id) => String(id).replace('column-', '');

const priorities = ['low', 'medium', 'high', 'urgent'];

const taskViewOptions = [
    { key: 'scrum', label: 'Scrum', icon: FiFlag },
    { key: 'timeline', label: 'Timeline', icon: FiClock },
    { key: 'calendar', label: 'Calendario', icon: FiCalendar },
];

const taskDetailTabs = [
    { key: 'description', label: 'Descripción', icon: FiFileText },
    { key: 'subtasks', label: 'Subtareas', icon: FiCheck },
    { key: 'comments', label: 'Comentarios', icon: FiMessageCircle },
    { key: 'files', label: 'Archivos', icon: FiPaperclip },
];

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

function parseTaskDate(date) {
    if (!date) {
        return null;
    }

    const parsed = new Date(`${date}T00:00:00`);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function dateKey(date) {
    if (!date) {
        return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function addDays(date, amount) {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + amount);

    return nextDate;
}

function taskStartDate(task) {
    return parseTaskDate(task.start_date) ?? parseTaskDate(task.due_date);
}

function taskDueDate(task) {
    return parseTaskDate(task.due_date) ?? parseTaskDate(task.start_date);
}

function taskDurationDays(task) {
    const startDate = taskStartDate(task);
    const dueDate = taskDueDate(task);

    if (!startDate || !dueDate) {
        return 1;
    }

    return Math.max(1, Math.round((dueDate - startDate) / 86400000) + 1);
}

function buildCalendarDays(tasks) {
    const datedTasks = tasks.filter((task) => taskStartDate(task) || taskDueDate(task));
    const today = new Date();
    const anchorDate = datedTasks[0] ? (taskStartDate(datedTasks[0]) ?? taskDueDate(datedTasks[0])) : today;
    const firstOfMonth = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
    const firstWeekday = (firstOfMonth.getDay() + 6) % 7;
    const startDate = addDays(firstOfMonth, -firstWeekday);

    return Array.from({ length: 42 }, (_, index) => addDays(startDate, index));
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

function stripHtml(html) {
    if (!html) {
        return '';
    }

    return html
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function getInitials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('') || '?';
}

function avatarTone(name = '') {
    const palette = [
        'from-fuchsia-500 to-violet-500',
        'from-cyan-500 to-sky-500',
        'from-emerald-500 to-teal-500',
        'from-amber-400 to-orange-500',
        'from-rose-500 to-pink-500',
        'from-indigo-500 to-blue-500',
    ];

    const total = [...name].reduce((sum, character) => sum + character.charCodeAt(0), 0);
    return palette[total % palette.length];
}

function TaskPropertyRow({ icon: Icon, label, children }) {
    return (
        <div className="task-property-row">
            <div className="task-property-label">
                <Icon className="h-4 w-4" />
                <span>{label}</span>
            </div>
            <div className="min-w-0">{children}</div>
        </div>
    );
}

function TaskDetailBadge({ children }) {
    return (
        <span className="task-detail-badge">
            {children}
        </span>
    );
}

function useDropdownClose(open, setOpen) {
    const rootRef = useRef(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        function handlePointerDown(event) {
            if (!rootRef.current?.contains(event.target)) {
                setOpen(false);
            }
        }

        function handleEscape(event) {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        }

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [open, setOpen]);

    return rootRef;
}

function StatusBadge({ status }) {
    return (
        <span className={`task-status-badge task-status-badge-${status}`}>
            {statusLabels[status] ?? status}
        </span>
    );
}

function PriorityBadge({ priority }) {
    return (
        <span className={`task-priority-badge-detail task-priority-badge-detail-${priority}`}>
            {priorityLabels[priority] ?? priority}
        </span>
    );
}

function PropertyBadgeDropdown({ items, value, onChange, renderBadge, label }) {
    const [open, setOpen] = useState(false);
    const rootRef = useDropdownClose(open, setOpen);

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((currentValue) => !currentValue)}
                className="task-property-badge-trigger"
                aria-label={label}
            >
                {renderBadge(value)}
                <FiChevronDown className={`h-3.5 w-3.5 transition ${open ? 'rotate-180' : ''}`} />
            </button>

            {open ? (
                <div className="theme-select-popover absolute left-0 top-[calc(100%+0.55rem)] z-40 min-w-[13rem] overflow-hidden rounded-[1.25rem] border shadow-[0_30px_60px_-30px_rgba(15,23,42,0.55)]">
                    <div className="space-y-1 p-2">
                        {items.map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() => {
                                    onChange(item.key);
                                    setOpen(false);
                                }}
                                className={`task-property-badge-option ${String(value) === String(item.key) ? 'task-property-badge-option-active' : ''}`}
                            >
                                {renderBadge(item.key)}
                                {String(value) === String(item.key) ? <FiCheck className="h-4 w-4" /> : null}
                            </button>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function AssigneeAvatars({ assignees = [], limit = 4, size = 'md' }) {
    if (!assignees.length) {
        return (
            <span className="inline-flex items-center rounded-full border border-dashed border-stone-700 px-2.5 py-1 text-[11px] text-stone-500">
                Sin asignar
            </span>
        );
    }

    const visibleAssignees = assignees.slice(0, limit);
    const hiddenCount = assignees.length - visibleAssignees.length;
    const sizeClassName = size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-8 w-8 text-[11px]';

    return (
        <div className="relative flex items-center">
            {visibleAssignees.map((assignee, index) => (
                <div
                    key={assignee.id}
                    className={`${index === 0 ? '' : '-ml-2'} group/avatar relative`}
                    aria-label={assignee.name}
                >
                    <div
                        className={`relative inline-flex ${sizeClassName} items-center justify-center rounded-full border border-stone-950 bg-gradient-to-br ${avatarTone(
                            assignee.name
                        )} font-semibold text-white shadow-[0_8px_18px_-10px_rgba(0,0,0,0.9)]`}
                    >
                        {getInitials(assignee.name)}
                    </div>

                    <div className="theme-tooltip pointer-events-none absolute bottom-[calc(100%+0.55rem)] left-1/2 z-[999] -translate-x-1/2 whitespace-nowrap rounded-xl border px-3 py-2 text-[11px] font-medium opacity-0 shadow-lg transition duration-200 group-hover/avatar:opacity-100">
                        {assignee.name}
                    </div>
                </div>
            ))}

            {hiddenCount > 0 ? (
                <div
                    className="-ml-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-stone-950 bg-stone-800 text-[10px] font-semibold text-stone-200"
                    aria-label={`${hiddenCount} responsables adicionales`}
                >
                    +{hiddenCount}
                </div>
            ) : null}
        </div>
    );
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
                                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${active
                                        ? 'border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--text-primary)] shadow-[0_16px_30px_-24px_rgba(217,119,6,0.35)]'
                                        : 'theme-surface theme-border theme-text-secondary hover:border-[color:var(--accent)]'
                                    }`}
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarTone(member.name)} text-[11px] font-semibold text-white`}>
                                        {getInitials(member.name)}
                                    </span>
                                    <p className="truncate text-sm font-medium">{member.name}</p>
                                </div>

                                <span
                                    className={`ml-3 flex h-5 w-5 items-center justify-center rounded-md border transition ${active
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

function SubtaskAssigneeDropdown({ members, selectedIds, onChange }) {
    const [open, setOpen] = useState(false);
    const rootRef = useDropdownClose(open, setOpen);
    const selectedMembers = members.filter((member) => (selectedIds ?? []).includes(member.id));

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((currentValue) => !currentValue)}
                className="task-drawer-button inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-medium transition"
            >
                <FiUsers className="h-3.5 w-3.5" />
                {selectedMembers.length ? `${selectedMembers.length} responsable${selectedMembers.length > 1 ? 's' : ''}` : 'Asignar responsables'}
                <FiChevronDown className={`h-3.5 w-3.5 transition ${open ? 'rotate-180' : ''}`} />
            </button>

            {selectedMembers.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                    {selectedMembers.map((member) => (
                        <span
                            key={member.id}
                            className="inline-flex rounded-full border border-[color:var(--accent)]/40 bg-[color:var(--accent-soft)] px-3 py-1 text-[11px] font-medium text-[color:var(--accent)]"
                        >
                            {member.name}
                        </span>
                    ))}
                </div>
            ) : null}

            {open ? (
                <div className="absolute left-0 top-[calc(100%+0.75rem)] z-20 w-full min-w-[280px] rounded-[1.5rem] border border-stone-700 bg-stone-950 p-3 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.85)]">
                    <MemberPicker
                        label="Responsables de la subtarea"
                        hint="Marca una o varias personas para este paso."
                        members={members}
                        selectedIds={selectedIds}
                        onChange={onChange}
                    />
                </div>
            ) : null}
        </div>
    );
}

function TaskAssigneeDropdown({ members, selectedIds, onChange }) {
    const [open, setOpen] = useState(false);
    const rootRef = useDropdownClose(open, setOpen);
    const selectedMembers = members.filter((member) => (selectedIds ?? []).includes(member.id));

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((currentValue) => !currentValue)}
                className="task-property-trigger inline-flex items-center gap-2"
            >
                <AssigneeAvatars assignees={selectedMembers} size="sm" />
                <span>{selectedMembers.length ? `${selectedMembers.length} responsable${selectedMembers.length > 1 ? 's' : ''}` : 'Asignar responsables'}</span>
                <FiChevronDown className={`h-3.5 w-3.5 transition ${open ? 'rotate-180' : ''}`} />
            </button>

            {open ? (
                <div className="theme-surface-strong theme-border absolute left-0 top-[calc(100%+0.65rem)] z-30 w-full min-w-[300px] rounded-[1.5rem] border p-3 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)]">
                    <MemberPicker
                        label="Responsables"
                        hint="Marca uno o varios miembros para compartir la ejecución de esta tarea."
                        members={members}
                        selectedIds={selectedIds}
                        onChange={onChange}
                    />
                </div>
            ) : null}
        </div>
    );
}

function subtaskProgress(task) {
    const total = task.children?.length ?? 0;
    const completed = task.children?.filter((child) => child.status === 'done').length ?? 0;

    return { total, completed, percent: total ? Math.round((completed / total) * 100) : 0 };
}

function TaskCard({ task, onOpen }) {
    const dueDateLabel = task.due_date ? formatDate(task.due_date) : 'Sin fecha limite';
    const childCount = task.children?.length ?? 0;

    return (
        <div
            className="group/card rounded-[1.4rem] border border-stone-800 bg-[#18131f] p-3 shadow-[0_24px_60px_-36px_rgba(0,0,0,0.95)] transition duration-300 hover:border-stone-700 hover:bg-[#1d1726]"
        >
            <button
                type="button"
                onClick={() => onOpen(task.id)}
                className="block w-full text-left"
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-stone-700 bg-stone-900 px-2.5 py-1 text-[10px] uppercase tracking-[0.24em] text-stone-400">
                                {task.project?.name ?? 'Proyecto'}
                            </span>

                            {childCount > 0 ? (
                                <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-[10px] font-medium text-violet-200">
                                    {childCount} subtareas
                                </span>
                            ) : null}
                        </div>

                        <p className="mt-3 line-clamp-2 min-w-0 text-[15px] font-semibold leading-6 text-stone-50">
                            {task.title}
                        </p>
                    </div>

                    <span className="shrink-0 rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-amber-100">
                        {priorityLabels[task.priority] ?? task.priority}
                    </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-stone-400">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-700 px-2.5 py-1">
                        <FiFlag className="h-3 w-3 text-amber-300" />
                        {statusLabels[task.status] ?? task.status}
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-700 px-2.5 py-1">
                        <FiCalendar className="h-3 w-3 text-sky-300" />
                        {dueDateLabel}
                    </span>
                </div>
            </button>

            <div className="mt-4 flex items-center justify-between gap-3">
                <AssigneeAvatars assignees={task.assignees} size="sm" />
            </div>
        </div>
    );
}

function SortableTaskCard({ task, onOpen, disabled = false }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: taskDndId(task.id),
        data: {
            type: 'task',
            task,
            status: task.status,
        },
        disabled,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`task-sortable-card ${isDragging ? 'task-sortable-card-dragging' : ''}`}
            {...attributes}
            {...listeners}
        >
            <TaskCard task={task} onOpen={onOpen} />
        </div>
    );
}

function DroppableTaskColumn({ column, children, disabled = false }) {
    const { setNodeRef, isOver } = useDroppable({
        id: columnDndId(column.key),
        data: {
            type: 'column',
            status: column.key,
        },
        disabled,
    });

    return (
        <div
            ref={setNodeRef}
            className={`mt-5 task-droppable-column ${isOver ? 'task-droppable-column-over' : ''}`}
        >
            {children}
        </div>
    );
}

function TaskViewMiniCard({ task, onOpen }) {
    return (
        <button
            type="button"
            onClick={() => onOpen(task.id)}
            className="task-view-mini-card"
        >
            <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{task.title}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
                    </div>
                </div>
                <AssigneeAvatars assignees={task.assignees} size="sm" limit={2} />
            </div>
        </button>
    );
}

function TimelineView({ tasks, onOpen }) {
    const sortedTasks = [...tasks].sort((left, right) => {
        const leftDate = taskStartDate(left) ?? new Date(8640000000000000);
        const rightDate = taskStartDate(right) ?? new Date(8640000000000000);

        return leftDate - rightDate;
    });

    return (
        <section className="task-view-panel">
            <div className="task-view-panel-header">
                <div>
                    <p className="task-view-eyebrow">Timeline</p>
                    <h3 className="task-view-title">Secuencia por fechas</h3>
                </div>
                <span className="task-view-count">{sortedTasks.length} tareas</span>
            </div>

            <div className="task-timeline-list">
                {sortedTasks.map((task) => {
                    const startDate = taskStartDate(task);
                    const dueDate = taskDueDate(task);

                    return (
                        <button
                            key={task.id}
                            type="button"
                            onClick={() => onOpen(task.id)}
                            className="task-timeline-row"
                        >
                            <div className="task-timeline-date">
                                <span>{startDate ? new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short' }).format(startDate) : 'Sin fecha'}</span>
                                <small>{dueDate ? formatDate(dateKey(dueDate)) : 'Sin límite'}</small>
                            </div>

                            <div className="task-timeline-track">
                                <div className="task-timeline-dot" />
                                <div className="task-timeline-bar" style={{ width: `${Math.min(100, 22 + taskDurationDays(task) * 12)}%` }} />
                            </div>

                            <div className="task-timeline-content">
                                <div className="flex min-w-0 items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold">{task.title}</p>
                                        <p className="mt-1 truncate text-xs text-stone-500">{task.project?.name ?? 'Sin proyecto'}</p>
                                    </div>
                                    <AssigneeAvatars assignees={task.assignees} size="sm" limit={3} />
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <StatusBadge status={task.status} />
                                    <PriorityBadge priority={task.priority} />
                                </div>
                            </div>
                        </button>
                    );
                })}

                {!sortedTasks.length ? (
                    <div className="task-empty-view">No hay tareas para mostrar en timeline.</div>
                ) : null}
            </div>
        </section>
    );
}

function CalendarView({ tasks, onOpen }) {
    const days = buildCalendarDays(tasks);
    const monthLabel = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(days[14] ?? new Date());
    const tasksByDay = tasks.reduce((groups, task) => {
        const relevantDate = taskDueDate(task) ?? taskStartDate(task);

        if (!relevantDate) {
            return groups;
        }

        const key = dateKey(relevantDate);
        groups[key] = [...(groups[key] ?? []), task];

        return groups;
    }, {});

    return (
        <section className="task-view-panel">
            <div className="task-view-panel-header">
                <div>
                    <p className="task-view-eyebrow">Calendario</p>
                    <h3 className="task-view-title capitalize">{monthLabel}</h3>
                </div>
                <span className="task-view-count">{tasks.length} tareas</span>
            </div>

            <div className="task-calendar-weekdays">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                    <span key={day}>{day}</span>
                ))}
            </div>

            <div className="task-calendar-grid">
                {days.map((day) => {
                    const key = dateKey(day);
                    const dayTasks = tasksByDay[key] ?? [];

                    return (
                        <div key={key} className="task-calendar-day">
                            <div className="task-calendar-day-number">{day.getDate()}</div>
                            <div className="mt-2 space-y-2">
                                {dayTasks.slice(0, 3).map((task) => (
                                    <TaskViewMiniCard key={task.id} task={task} onOpen={onOpen} />
                                ))}
                                {dayTasks.length > 3 ? (
                                    <span className="task-calendar-more">+{dayTasks.length - 3} más</span>
                                ) : null}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default function TasksIndex({ tasks, projects, filters = {}, activeProject = null }) {
    const { auth } = usePage().props;
    const isMember = auth.roles?.includes('member');
    const canCreateTasks = !isMember && auth.permissions?.includes('tasks.manage');
    const canFullyManageTasks = !isMember && auth.permissions?.includes('tasks.manage');
    const canScheduleTasks = canFullyManageTasks || isMember;
    const canCommentOnTasks = auth.permissions?.includes('comments.create');
    const filteredProjectId = filters.project_id ? Number(filters.project_id) : null;
    const requestedTaskId = filters.task_id ? Number(filters.task_id) : null;
    const hasAppliedRequestedTaskSelection = useRef(false);
    const dragStartTasks = useRef(tasks);
    const [boardTasks, setBoardTasks] = useState(tasks);
    const [selectedTaskId, setSelectedTaskId] = useState(requestedTaskId ?? null);
    const [activeTaskId, setActiveTaskId] = useState(null);
    const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
    const [isAttachmentDragging, setIsAttachmentDragging] = useState(false);
    const [isTaskDetailExpanded, setIsTaskDetailExpanded] = useState(false);
    const [taskDetailTab, setTaskDetailTab] = useState('description');
    const [replyingToCommentId, setReplyingToCommentId] = useState(null);
    const commentForm = useForm({
        body: '',
        parent_id: null,
        files: [],
    });
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [taskView, setTaskView] = useState('scrum');
    const dndSensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const createForm = useForm({
        project_id: filteredProjectId ?? projects[0]?.id ?? '',
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assignee_ids: [],
        start_date: '',
        due_date: '',
        position: 0,
    });

    const subtaskForm = useForm({
        title: '',
        status: 'todo',
    });

    const taskForm = useForm({
        project_id: '',
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assignee_ids: [],
        start_date: '',
        due_date: '',
        position: 0,
        subtasks: [],
    });
    const [subtaskScheduleDrafts, setSubtaskScheduleDrafts] = useState({});

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

        setTaskDetailTab('description');
        setIsTaskDetailExpanded(false);
        taskForm.setData({
            project_id: selectedTask.project_id ?? '',
            title: selectedTask.title ?? '',
            description: selectedTask.description ?? '',
            status: selectedTask.status ?? 'todo',
            priority: selectedTask.priority ?? 'medium',
            assignee_ids: selectedTask.assignee_ids ?? [],
            start_date: selectedTask.start_date ?? '',
            due_date: selectedTask.due_date ?? '',
            position: selectedTask.position ?? 0,
            subtasks: (selectedTask.children ?? []).map((child) => ({
                id: child.id,
                client_key: `existing-${child.id}`,
                title: child.title ?? '',
                status: child.status ?? 'todo',
                assignee_ids: child.assignee_ids ?? [],
                start_date: child.start_date ?? '',
                due_date: child.due_date ?? '',
            })),
        });
        setSubtaskScheduleDrafts(
            Object.fromEntries(
                (selectedTask.children ?? []).map((child) => [
                    child.id,
                    {
                        start_date: child.start_date ?? '',
                        due_date: child.due_date ?? '',
                    },
                ])
            )
        );
    }, [selectedTask]);

    function membersForProject(projectId) {
        return projects.find((project) => project.id === projectId)?.members ?? [];
    }

    function handleCreateTask(event) {
        event.preventDefault();

        createForm.post(route('tasks.store'), {
            preserveScroll: true,
            onSuccess: () => {
                createForm.reset('title', 'description', 'assignee_ids', 'start_date', 'due_date');
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

    function getDndDestination(overId, activeId, sourceTasks = boardTasks) {
        if (!overId) {
            return null;
        }

        const overIdString = String(overId);

        if (overIdString.startsWith('column-')) {
            const status = columnKeyFromDndId(overIdString);
            return {
                status,
                position: tasksForStatus(sourceTasks, status).filter((task) => task.id !== activeId).length,
            };
        }

        if (overIdString.startsWith('task-')) {
            const overTaskId = taskIdFromDndId(overIdString);
            const overTask = sourceTasks.find((task) => task.id === overTaskId);

            if (!overTask || overTask.id === activeId) {
                return null;
            }

            const destinationTasks = tasksForStatus(sourceTasks, overTask.status).filter((task) => task.id !== activeId);
            const overIndex = destinationTasks.findIndex((task) => task.id === overTask.id);

            return {
                status: overTask.status,
                position: Math.max(0, overIndex),
            };
        }

        return null;
    }

    function handleTaskDragStart(event) {
        const taskId = taskIdFromDndId(event.active.id);
        dragStartTasks.current = boardTasks;
        setActiveTaskId(taskId);
    }

    function handleTaskDragOver(event) {
        if (filteringByPriority || !event.over) {
            return;
        }

        const taskId = taskIdFromDndId(event.active.id);
        const destination = getDndDestination(event.over.id, taskId);

        if (!destination) {
            return;
        }

        const currentTask = boardTasks.find((task) => task.id === taskId);

        if (currentTask?.status === destination.status && currentTask?.position === destination.position) {
            return;
        }

        setBoardTasks(moveTaskInBoard(boardTasks, taskId, destination.status, destination.position));
    }

    function handleTaskDragEnd(event) {
        const taskId = taskIdFromDndId(event.active.id);
        setActiveTaskId(null);

        if (!event.over) {
            setBoardTasks(dragStartTasks.current);
            return;
        }

        let finalTasks = boardTasks;
        let movedTask = finalTasks.find((task) => task.id === taskId);
        const originalTask = dragStartTasks.current.find((task) => task.id === taskId);

        if (!movedTask || !originalTask) {
            return;
        }

        if (movedTask.status === originalTask.status && movedTask.position === originalTask.position) {
            const destination = getDndDestination(event.over.id, taskId, dragStartTasks.current);

            if (destination) {
                finalTasks = moveTaskInBoard(dragStartTasks.current, taskId, destination.status, destination.position);
                movedTask = finalTasks.find((task) => task.id === taskId);
                setBoardTasks(finalTasks);
            }
        }

        if (!movedTask) {
            return;
        }

        if (movedTask.status === originalTask.status && movedTask.position === originalTask.position) {
            return;
        }

        router.patch(
            route('tasks.move', taskId),
            { status: movedTask.status, position: movedTask.position },
            {
                preserveScroll: true,
                onError: () => setBoardTasks(dragStartTasks.current),
            }
        );
    }

    function handleTaskDragCancel() {
        setActiveTaskId(null);
        setBoardTasks(dragStartTasks.current);
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
        commentForm.reset('body', 'parent_id', 'files');
        commentForm.setData('parent_id', null);
    }

    function updateSubtaskScheduleDraft(subtaskId, field, value) {
        setSubtaskScheduleDrafts((current) => ({
            ...current,
            [subtaskId]: {
                ...(current[subtaskId] ?? {}),
                [field]: value,
            },
        }));
    }

    function addDraftSubtask(event) {
        event.preventDefault();

        if (!subtaskForm.data.title.trim()) {
            subtaskForm.setError('title', 'Escribe un titulo para la subtarea.');
            return;
        }

        taskForm.setData('subtasks', [
            ...(taskForm.data.subtasks ?? []),
            {
                client_key: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                title: subtaskForm.data.title.trim(),
                status: subtaskForm.data.status ?? 'todo',
                assignee_ids: taskForm.data.assignee_ids ?? [],
                start_date: '',
                due_date: '',
            },
        ]);

        subtaskForm.reset();
        subtaskForm.setData('status', 'todo');
        subtaskForm.clearErrors();
    }

    function updateDraftSubtask(clientKey, changes) {
        taskForm.setData(
            'subtasks',
            (taskForm.data.subtasks ?? []).map((subtask) =>
                subtask.client_key === clientKey
                    ? { ...subtask, ...changes }
                    : subtask
            )
        );
    }

    function removeDraftSubtask(clientKey) {
        taskForm.setData(
            'subtasks',
            (taskForm.data.subtasks ?? []).filter((subtask) => subtask.client_key !== clientKey)
        );
    }

    const visibleSubtasks = canFullyManageTasks
        ? (taskForm.data.subtasks ?? [])
        : (selectedTask?.children ?? []);

    const taskProgress = selectedTask
        ? subtaskProgress({ children: visibleSubtasks })
        : { total: 0, completed: 0, percent: 0 };
    const filteredBoardTasks = filterTasksByPriority(boardTasks, priorityFilter);
    const filteringByPriority = priorityFilter !== 'all';
    const completedTasksCount = boardTasks.filter((task) => task.status === 'done').length;
    const sprintVelocity = boardTasks.length ? Math.round((completedTasksCount / boardTasks.length) * 100) : 0;
    const inFlightTasksCount = boardTasks.filter((task) => ['todo', 'in_progress', 'review'].includes(task.status)).length;
    const activeDragTask = activeTaskId ? boardTasks.find((task) => task.id === activeTaskId) : null;

    return (
        <AuthenticatedLayout user={auth.user} header={<div className="flex items-center gap-3"><FiUsers className="h-7 w-7 text-amber-300" /><h2 className="text-3xl font-semibold text-stone-50">Tareas</h2></div>}>
            <Head title="Tareas" />

            <div className="space-y-6">
	                <section className="task-board-overview overflow-hidden rounded-[2.2rem] border border-stone-800 bg-[#130f19] shadow-[0_30px_90px_-50px_rgba(0,0,0,0.95)]">
	                    <div className="task-board-topbar">
	                        <div className="min-w-0">
	                            <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-stone-500">
	                                <span className="task-board-kicker">Board</span>
	                                <span className="truncate">{activeProject ? activeProject.name : 'Workspace sprint'}</span>
	                            </div>
	                            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-stone-50">Panel de tareas</h3>
	                            <p className="mt-1 max-w-2xl text-sm text-stone-400">Prioridad, avance y vista del trabajo en un solo lugar.</p>
	                        </div>

                        {canCreateTasks ? (
                            <button
                                type="button"
                                onClick={() => setShowCreateTaskModal(true)}
                                className="task-create-button inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition"
                            >
                                <FiPlus className="h-4 w-4" />
                                Crear tarea
                            </button>
                        ) : null}
                    </div>

	                    <div className="task-board-stats">
	                        <div className="task-board-stat-card">
	                            <span className="task-board-stat-icon"><FiFileText className="h-4 w-4" /></span>
	                            <div>
	                                <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Historias</p>
	                                <p className="mt-1 text-3xl font-semibold text-stone-50">{boardTasks.length}</p>
	                            </div>
	                        </div>
	                        <div className="task-board-stat-card">
	                            <span className="task-board-stat-icon"><FiClock className="h-4 w-4" /></span>
	                            <div>
	                                <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">En curso</p>
	                                <p className="mt-1 text-3xl font-semibold text-stone-50">{inFlightTasksCount}</p>
	                            </div>
	                        </div>
	                        <div className="task-board-stat-card">
	                            <span className="task-board-stat-icon"><FiTarget className="h-4 w-4" /></span>
	                            <div>
	                                <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Velocidad</p>
	                                <p className="mt-1 text-3xl font-semibold text-stone-50">{sprintVelocity}%</p>
	                            </div>
	                        </div>
	                    </div>

	                    <div className="task-board-controls">
		                    <div className="task-priority-filter flex flex-col gap-3 rounded-3xl border p-4">
                        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Filtro de prioridad scrum</p>
                                <p className="mt-1 text-sm text-stone-400">
                                    Filtra el tablero por nivel de prioridad para enfocarte en lo más importante.
                                </p>
                            </div>

                            {filteringByPriority && (
                                <button
                                    type="button"
                                    onClick={() => setPriorityFilter('all')}
                                    className="task-priority-chip inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition"
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
                                className={`rounded-full px-4 py-2 text-sm font-medium transition ${priorityFilter === 'all'
                                        ? 'task-priority-chip-active'
                                        : 'task-priority-chip'
                                    }`}
                            >
                                Todas
                            </button>

                            {priorities.map((priority) => (
                                <button
                                    key={priority}
                                    type="button"
                                    onClick={() => setPriorityFilter(priority)}
                                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${priorityFilter === priority
                                            ? 'task-priority-chip-active'
                                            : 'task-priority-chip'
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

		                    <div className="task-view-switcher rounded-3xl border p-2">
	                        {taskViewOptions.map((option) => {
	                            const Icon = option.icon;

	                            return (
	                                <button
	                                    key={option.key}
	                                    type="button"
	                                    onClick={() => setTaskView(option.key)}
	                                    className={`task-view-option ${taskView === option.key ? 'task-view-option-active' : ''}`}
	                                >
	                                    <Icon className="h-4 w-4" />
	                                    <span>{option.label}</span>
	                                </button>
	                            );
		                        })}
		                    </div>
	                    </div>
		                </section>

		                {taskView === 'scrum' && (
		                    <DndContext
		                        sensors={dndSensors}
		                        collisionDetection={closestCorners}
		                        onDragStart={handleTaskDragStart}
		                        onDragOver={handleTaskDragOver}
		                        onDragEnd={handleTaskDragEnd}
		                        onDragCancel={handleTaskDragCancel}
		                    >
		                        <section className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-6">
		                            {columns.map((column) => {
		                                const columnTasks = tasksForStatus(filteredBoardTasks, column.key);
		                                const sortableItems = columnTasks.map((task) => taskDndId(task.id));

		                                return (
		                                    <div key={column.key} className="rounded-[2rem] border border-stone-800 bg-[#15111a] p-4 shadow-[0_24px_70px_-45px_rgba(0,0,0,0.95)]">
		                                        <div className="flex items-start justify-between gap-3">
		                                            <div className="min-w-0">
		                                                <p className={`text-xs uppercase tracking-[0.25em] ${column.accent}`}>{column.label}</p>
		                                                <div className="mt-3 flex items-center gap-2">
		                                                    <p className="text-lg font-semibold text-stone-50">{columnTasks.length}</p>
		                                                    <span className="rounded-full border border-stone-700 bg-stone-900 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-stone-400">
		                                                        cards
		                                                    </span>
		                                                </div>
		                                                <p className="mt-2 text-xs text-stone-500">
		                                                    {column.key === 'backlog' ? 'Pendiente de tomar en el sprint.' : column.key === 'done' ? 'Listo para review o entrega.' : 'Trabajo activo del equipo.'}
		                                                </p>
		                                            </div>
		                                            <div className={`mt-1 h-2.5 w-2.5 rounded-full ${column.accent.replace('text-', 'bg-')} opacity-80`} />
		                                        </div>

		                                        <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
		                                            <DroppableTaskColumn column={column} disabled={filteringByPriority}>
		                                                {columnTasks.length === 0 ? (
		                                                    <div className="task-empty-dropzone">
		                                                        <FiPlus className="h-5 w-5" />
		                                                        {filteringByPriority ? 'Sin tareas para este filtro' : 'Suelta una tarea aquí'}
		                                                    </div>
		                                                ) : null}

		                                                <div className="space-y-3">
		                                                    {columnTasks.map((task) => (
		                                                        <SortableTaskCard
		                                                            key={task.id}
		                                                            task={task}
		                                                            onOpen={setSelectedTaskId}
		                                                            disabled={filteringByPriority}
		                                                        />
		                                                    ))}
		                                                </div>
		                                            </DroppableTaskColumn>
		                                        </SortableContext>
		                                    </div>
		                                );
		                            })}
		                        </section>

		                        <DragOverlay dropAnimation={{ duration: 220, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }}>
		                            {activeDragTask ? (
		                                <div className="task-drag-overlay">
		                                    <TaskCard task={activeDragTask} onOpen={() => {}} />
		                                </div>
		                            ) : null}
		                        </DragOverlay>
		                    </DndContext>
		                )}

	                {taskView === 'timeline' && (
	                    <TimelineView tasks={filteredBoardTasks} onOpen={setSelectedTaskId} />
	                )}

	                {taskView === 'calendar' && (
	                    <CalendarView tasks={filteredBoardTasks} onOpen={setSelectedTaskId} />
	                )}
	            </div>

            {selectedTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-end p-3 sm:p-5">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSelectedTaskId(null)}
                    />

                    <aside className={`task-detail-panel relative z-10 flex h-[calc(100vh-1.5rem)] w-full ${isTaskDetailExpanded ? 'max-w-5xl' : 'max-w-3xl'} flex-col overflow-hidden rounded-[2rem] border shadow-[0_30px_90px_-45px_rgba(0,0,0,0.55)] transition-all duration-300 sm:h-[calc(100vh-2.5rem)]`}>
                        <div className="task-detail-header flex items-center justify-between gap-4 border-b px-5 py-4 sm:px-6">
                            <div className="min-w-0">
                                <div className="flex min-w-0 items-center gap-2 text-xs">
                                    <span className="truncate">{activeProject?.name ?? selectedTask.project?.name ?? 'Workspace'}</span>
                                    <span>/</span>
                                    <span>Tareas</span>
                                    <span>/</span>
                                    <span className="font-medium">Editar tarea</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsTaskDetailExpanded((currentValue) => !currentValue)}
                                    className="task-icon-button"
                                    aria-label={isTaskDetailExpanded ? 'Reducir detalle' : 'Expandir detalle'}
                                >
                                    <FiMaximize2 className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedTaskId(null)}
                                    className="task-icon-button"
                                    aria-label="Cerrar detalle"
                                >
                                    <FiX className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="task-detail-body flex-1 overflow-y-auto px-5 py-5 sm:px-7">
                            <div className="space-y-5">
                                {canFullyManageTasks ? (
                                    <form
                                        id="task-edit-form"
                                        onSubmit={(event) => {
                                            event.preventDefault();

                                            taskForm.patch(route('tasks.update', selectedTask.id), {
                                                preserveScroll: true,
                                                onSuccess: () => setSelectedTaskId(null),
                                            });
                                        }}
                                    >
                                        <input
                                            className="task-title-input"
                                            value={taskForm.data.title}
                                            onChange={(event) => taskForm.setData('title', event.target.value)}
                                            aria-label="Título de la tarea"
                                        />
                                    </form>
                                ) : (
                                    <h3 className="task-detail-title">{selectedTask.title}</h3>
                                )}

                                <div className="task-property-list">
                                    <TaskPropertyRow icon={FiFlag} label="Estado">
                                        {canFullyManageTasks ? (
                                            <PropertyBadgeDropdown
                                                label="Cambiar estado"
                                                items={columns}
                                                value={taskForm.data.status}
                                                onChange={(status) => taskForm.setData('status', status)}
                                                renderBadge={(status) => <StatusBadge status={status} />}
                                            />
                                        ) : canScheduleTasks ? (
                                            <div className="flex flex-wrap gap-2">
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
                                                        className={`task-property-chip ${selectedTask.status === column.key ? 'task-property-chip-active' : ''}`}
                                                    >
                                                        <StatusBadge status={column.key} />
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <StatusBadge status={selectedTask.status} />
                                        )}
                                    </TaskPropertyRow>
                                    <TaskPropertyRow icon={FiUsers} label="Responsable">
                                        {canFullyManageTasks ? (
                                            <TaskAssigneeDropdown
                                                members={membersForProject(selectedTask.project_id)}
                                                selectedIds={taskForm.data.assignee_ids}
                                                onChange={(ids) => taskForm.setData('assignee_ids', ids)}
                                            />
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <AssigneeAvatars assignees={selectedTask.assignees} size="sm" />
                                                {!selectedTask.assignees?.length ? <span className="task-property-value">Sin responsables</span> : null}
                                            </div>
                                        )}
                                    </TaskPropertyRow>
                                    <TaskPropertyRow icon={FiClock} label="Inicio">
                                        {canFullyManageTasks || canScheduleTasks ? (
                                            <AppDatePicker
                                                className="task-property-date"
                                                value={taskForm.data.start_date}
                                                onChange={(event) => taskForm.setData('start_date', event.target.value)}
                                                placeholder="Fecha de inicio"
                                            />
                                        ) : (
                                            <span className="task-property-value">{selectedTask.start_date ? formatDate(selectedTask.start_date) : 'Sin fecha'}</span>
                                        )}
                                    </TaskPropertyRow>
                                    <TaskPropertyRow icon={FiCalendar} label="Límite">
                                        {canFullyManageTasks || canScheduleTasks ? (
                                            <AppDatePicker
                                                className="task-property-date"
                                                value={taskForm.data.due_date}
                                                onChange={(event) => taskForm.setData('due_date', event.target.value)}
                                                placeholder="Fecha límite"
                                            />
                                        ) : (
                                            <span className="task-property-value">{selectedTask.due_date ? formatDate(selectedTask.due_date) : 'Sin fecha'}</span>
                                        )}
                                    </TaskPropertyRow>
                                    <TaskPropertyRow icon={FiTag} label="Prioridad">
                                        {canFullyManageTasks ? (
                                            <PropertyBadgeDropdown
                                                label="Cambiar prioridad"
                                                items={priorities.map((priority) => ({ key: priority }))}
                                                value={taskForm.data.priority}
                                                onChange={(priority) => taskForm.setData('priority', priority)}
                                                renderBadge={(priority) => <PriorityBadge priority={priority} />}
                                            />
                                        ) : (
                                            <PriorityBadge priority={selectedTask.priority} />
                                        )}
                                    </TaskPropertyRow>
                                    <TaskPropertyRow icon={FiLink} label="Proyecto">
                                        <span className="task-property-value">{selectedTask.project?.name ?? 'Sin proyecto'}</span>
                                    </TaskPropertyRow>
                                </div>

                                {!canFullyManageTasks && canScheduleTasks ? (
                                    <div className="mt-3 flex justify-end">
                                        <button
                                            type="button"
                                            disabled={taskForm.processing}
                                            onClick={() => {
                                                taskForm.patch(route('tasks.schedule', selectedTask.id), {
                                                    preserveScroll: true,
                                                });
                                            }}
                                            className="task-drawer-button task-drawer-button-primary inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <FiSave className="h-4 w-4" />
                                            Guardar fechas
                                        </button>
                                    </div>
                                ) : null}

                                {(taskForm.errors.title
                                    || taskForm.errors.status
                                    || taskForm.errors.priority
                                    || taskForm.errors.assignee_ids
                                    || taskForm.errors.start_date
                                    || taskForm.errors.due_date
                                    || taskForm.errors.project_id) && (
                                    <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                                        {taskForm.errors.title
                                            || taskForm.errors.status
                                            || taskForm.errors.priority
                                            || taskForm.errors.assignee_ids
                                            || taskForm.errors.start_date
                                            || taskForm.errors.due_date
                                            || taskForm.errors.project_id}
                                    </div>
                                )}

                                <div className="task-detail-tabs">
                                    {taskDetailTabs
                                        .filter((tab) => {
                                            if (tab.key === 'comments') {
                                                return canCommentOnTasks;
                                            }

                                            if (tab.key === 'files') {
                                                return canFullyManageTasks;
                                            }

                                            return true;
                                        })
                                        .map((tab) => {
                                            const Icon = tab.icon;

                                            return (
                                                <button
                                                    key={tab.key}
                                                    type="button"
                                                    onClick={() => setTaskDetailTab(tab.key)}
                                                    className={`task-detail-tab ${taskDetailTab === tab.key ? 'task-detail-tab-active' : ''}`}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    {tab.label}
                                                    {tab.key === 'comments' && selectedTask.comments?.length ? (
                                                        <span className="task-tab-count">{selectedTask.comments.length}</span>
                                                    ) : null}
                                                </button>
                                            );
                                        })}
                                </div>

                                {taskDetailTab === 'description' && (
                                    <section className="task-detail-section">
                                        {canFullyManageTasks ? (
                                            <RichTextEditor
                                                value={taskForm.data.description}
                                                onChange={(nextValue) => taskForm.setData('description', nextValue)}
                                                placeholder="Agrega pasos, contexto, criterios de aceptación o notas para el equipo."
                                                imageUploadUrl={selectedTask ? route('tasks.attachments.store', selectedTask.id) : null}
                                            />
                                        ) : (
                                            <p className="task-description-text">
                                                {stripHtml(selectedTask.description) || 'Sin descripción registrada.'}
                                            </p>
                                        )}
                                    </section>
                                )}
                            </div>

                            {taskDetailTab === 'subtasks' && (canFullyManageTasks || canScheduleTasks) && <section className="task-detail-section">
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

                                {canFullyManageTasks && <form
                                    onSubmit={addDraftSubtask}
                                    className="mt-5 space-y-4"
                                >
                                    <RichTextEditor
                                        editorClassName="min-h-[88px] px-4 py-3 text-sm leading-6"
                                        value={subtaskForm.data.title}
                                        onChange={(nextValue) => subtaskForm.setData('title', nextValue)}
                                        onSubmitShortcut={addDraftSubtask}
                                        placeholder="Agregar un paso más pequeño dentro de esta tarea. Enter crea la subtarea y Shift + Enter agrega salto de linea."
                                    />
                                    {/* <button
                                        type="submit"
                                        className="inline-flex items-center gap-2 rounded-2xl bg-amber-300 px-4 py-3 text-sm font-medium text-stone-950 transition hover:bg-amber-200"
                                    >
                                        <FiPlus className="h-4 w-4" />
                                        Agregar subtarea al borrador
                                    </button> */}
                                </form>}

                                {canFullyManageTasks && subtaskForm.errors.title && (
                                    <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                                        {subtaskForm.errors.title}
                                    </div>
                                )}

                                <div className="mt-5 grid gap-3">
                                    {visibleSubtasks.length ? (
                                        visibleSubtasks.map((child) => (
                                            <div key={child.client_key ?? child.id} className="rounded-3xl border border-stone-800 bg-stone-950/80 p-4">
                                                <div className="flex items-start gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => canFullyManageTasks
                                                            ? updateDraftSubtask(child.client_key, { status: child.status === 'done' ? 'todo' : 'done' })
                                                            : router.patch(
                                                                route('tasks.subtasks.update', [selectedTask.id, child.id]),
                                                                {
                                                                    status: child.status === 'done' ? 'todo' : 'done',
                                                                    assignee_ids: child.assignee_ids ?? [],
                                                                    title: child.title,
                                                                },
                                                                { preserveScroll: true }
                                                            )}
                                                        className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border transition ${child.status === 'done'
                                                                ? 'border-emerald-400 bg-emerald-400 text-stone-950'
                                                                : 'border-stone-600 bg-stone-950 text-transparent hover:border-amber-300'
                                                            }`}
                                                    >
                                                        •
                                                    </button>

                                                    <div className="min-w-0 flex-1">
                                                        {canFullyManageTasks ? (
                                                            <input
                                                                className={`w-full rounded-2xl border border-stone-700 bg-stone-950 px-3 py-2 text-sm ${child.status === 'done' ? 'text-stone-500 line-through' : 'text-stone-100'}`}
                                                                value={child.title}
                                                                onChange={(event) => updateDraftSubtask(child.client_key, { title: event.target.value })}
                                                            />
                                                        ) : (
                                                            <p className={`font-medium ${child.status === 'done' ? 'text-stone-500 line-through' : 'text-stone-100'}`}>
                                                                {child.title}
                                                            </p>
                                                        )}
                                                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-stone-500">
                                                            <span>{formatAssigneeNames(canFullyManageTasks ? membersForProject(selectedTask.project_id).filter((member) => (child.assignee_ids ?? []).includes(member.id)) : child.assignees)}</span>
                                                            <span>{statusLabels[child.status] ?? child.status.replace('_', ' ')}</span>
                                                        </div>
                                                        {canFullyManageTasks ? (
                                                            <div className="mt-4 space-y-4">
                                                                <SubtaskAssigneeDropdown
                                                                    members={membersForProject(selectedTask.project_id)}
                                                                    selectedIds={child.assignee_ids ?? []}
                                                                    onChange={(ids) =>
                                                                        updateDraftSubtask(child.client_key, { assignee_ids: ids })
                                                                    }
                                                                />
                                                                <div className="grid gap-3 md:grid-cols-2">
                                                                    <AppDatePicker
                                                                        className="border-stone-700 bg-stone-950 text-stone-100"
                                                                        value={child.start_date ?? ''}
                                                                        onChange={(event) => updateDraftSubtask(child.client_key, { start_date: event.target.value })}
                                                                        placeholder="Fecha de inicio"
                                                                    />
                                                                    <AppDatePicker
                                                                        className="border-stone-700 bg-stone-950 text-stone-100"
                                                                        value={child.due_date ?? ''}
                                                                        onChange={(event) => updateDraftSubtask(child.client_key, { due_date: event.target.value })}
                                                                        placeholder="Fecha limite"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : canScheduleTasks && (
                                                            <form
                                                                onSubmit={(event) => {
                                                                    event.preventDefault();

                                                                    router.patch(
                                                                        route('tasks.subtasks.schedule', [selectedTask.id, child.id]),
                                                                        subtaskScheduleDrafts[child.id] ?? {
                                                                            start_date: child.start_date ?? '',
                                                                            due_date: child.due_date ?? '',
                                                                        },
                                                                        { preserveScroll: true }
                                                                    );
                                                                }}
                                                                className="mt-4 grid gap-3 md:grid-cols-2"
                                                            >
                                                                <AppDatePicker
                                                                    className="border-stone-700 bg-stone-950 text-stone-100"
                                                                    value={subtaskScheduleDrafts[child.id]?.start_date ?? ''}
                                                                    onChange={(event) => updateSubtaskScheduleDraft(child.id, 'start_date', event.target.value)}
                                                                    placeholder="Fecha de inicio"
                                                                />
                                                                <AppDatePicker
                                                                    className="border-stone-700 bg-stone-950 text-stone-100"
                                                                    value={subtaskScheduleDrafts[child.id]?.due_date ?? ''}
                                                                    onChange={(event) => updateSubtaskScheduleDraft(child.id, 'due_date', event.target.value)}
                                                                    placeholder="Fecha limite"
                                                                />
                                                                <div className="md:col-span-2 flex justify-end">
                                                                    <button
                                                                        type="submit"
                                                                        className="task-drawer-button task-drawer-button-primary inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs transition"
                                                                    >
                                                                        <FiSave className="h-3.5 w-3.5" />
                                                                        Guardar fechas
                                                                    </button>
                                                                </div>
                                                            </form>
                                                        )}
                                                    </div>

                                                    {canFullyManageTasks && <button
                                                        type="button"
                                                        onClick={() => removeDraftSubtask(child.client_key)}
                                                        className="task-drawer-button task-drawer-button-danger inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs transition"
                                                    >
                                                        <FiTrash2 className="h-3.5 w-3.5" />
                                                        Quitar del borrador
                                                    </button>}
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

                            {taskDetailTab === 'comments' && canCommentOnTasks && <section className="task-detail-section">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Comentarios</p>
                                    <h4 className="mt-2 text-xl font-semibold text-stone-50">Conversación de la tarea</h4>
                                </div>

                                <form
                                    onSubmit={(event) => {
                                        event.preventDefault();

                                        commentForm.post(route('tasks.comments.store', selectedTask.id), {
                                            forceFormData: true,
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
                                                className="task-drawer-button-ghost inline-flex items-center gap-2 transition"
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

                                    <label className="task-drawer-button inline-flex cursor-pointer items-center gap-2 rounded-2xl border px-4 py-3 text-sm transition">
                                        <FiPaperclip className="h-4 w-4" />
                                        Adjuntar archivos
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*,.pdf,.txt,.doc,.docx"
                                            className="hidden"
                                            onChange={(event) => commentForm.setData('files', Array.from(event.target.files ?? []))}
                                        />
                                    </label>

                                    {commentForm.data.files?.length ? (
                                        <div className="rounded-2xl border border-stone-800 bg-stone-950/70 px-4 py-3 text-sm text-stone-300">
                                            {commentForm.data.files.map((file) => file.name).join(', ')}
                                        </div>
                                    ) : null}

                                    <button
                                        type="submit"
                                        disabled={commentForm.processing}
                                        className="task-drawer-button task-drawer-button-primary inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60"
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
                                                {comment.attachments?.length ? (
                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        {comment.attachments.map((attachment) => (
                                                            <a
                                                                key={attachment.id}
                                                                href={attachment.url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="task-drawer-button inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition"
                                                            >
                                                                <FiPaperclip className="h-3.5 w-3.5" />
                                                                {attachment.name}
                                                            </a>
                                                        ))}
                                                    </div>
                                                ) : null}
                                                <div className="mt-4 flex items-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => openReplyForm(comment.id)}
                                                        className="task-drawer-button-ghost text-xs font-medium transition"
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
                                                                {reply.attachments?.length ? (
                                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                                        {reply.attachments.map((attachment) => (
                                                                            <a
                                                                                key={attachment.id}
                                                                                href={attachment.url}
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                                className="task-drawer-button inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition"
                                                                            >
                                                                                <FiPaperclip className="h-3.5 w-3.5" />
                                                                                {attachment.name}
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                ) : null}
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

                            {taskDetailTab === 'files' && canFullyManageTasks && <section className="task-detail-section">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Adjuntos</p>
                                        <h4 className="mt-2 text-xl font-semibold text-stone-50">Agrega capturas, mockups o documentos</h4>
                                    </div>
                                    <label className="task-drawer-button task-drawer-button-primary inline-flex cursor-pointer items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition">
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
                                    className={`mt-5 rounded-[2rem] border border-dashed px-5 py-8 text-center transition ${isAttachmentDragging
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
                                                        className="task-drawer-button task-drawer-button-danger inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm transition"
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
                                <section className="task-detail-footer">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                                        <button
                                            type="submit"
                                            form="task-edit-form"
                                            disabled={taskForm.processing}
                                            className="task-drawer-button task-drawer-button-primary inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 font-medium transition disabled:cursor-not-allowed disabled:opacity-60"
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
                                            className="task-drawer-button task-drawer-button-danger inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 transition"
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

                            <div className="mt-4">
                                <RichTextEditor
                                    label="Descripción"
                                    hint="Puedes usar formato enriquecido. Las imágenes se habilitan cuando la tarea ya existe."
                                    value={createForm.data.description}
                                    onChange={(nextValue) => createForm.setData('description', nextValue)}
                                    placeholder="Descripción"
                                />
                            </div>
                        </div>

                        <div className="rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--bg-surface)]/80 p-4 sm:p-5">
                            <div className="grid gap-4 lg:grid-cols-4">
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
                                    value={createForm.data.start_date}
                                    onChange={(event) => createForm.setData('start_date', event.target.value)}
                                    placeholder="Fecha de inicio"
                                />

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
