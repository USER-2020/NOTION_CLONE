import AppSelect from '@/Components/AppSelect';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { FiCheck, FiCheckCircle, FiEdit3, FiEye, FiEyeOff, FiLock, FiMail, FiPlusCircle, FiShield, FiSlash, FiUsers, FiUser, FiX } from 'react-icons/fi';

function roleLabel(role) {
    const labels = {
        super_admin: 'Super Admin',
        admin: 'Administrador',
        project_manager: 'Gestor de proyectos',
        member: 'Miembro',
        viewer: 'Visualizador',
    };

    return labels[role] ?? role;
}

function statusLabel(status) {
    return status === 'active' ? 'Activo' : 'Inactivo';
}

function WorkspacePicker({ workspaces, selectedIds, onChange }) {
    const selectedSet = new Set((selectedIds ?? []).map(Number));

    function toggleWorkspace(workspaceId) {
        if (selectedSet.has(workspaceId)) {
            onChange([...selectedSet].filter((id) => id !== workspaceId));
            return;
        }

        onChange([...selectedSet, workspaceId]);
    }

    return (
        <div>
            <div className="flex items-center justify-between gap-3">
                <label className="theme-text-muted text-xs uppercase tracking-[0.3em]">Espacios de trabajo</label>
                <span className="theme-text-muted text-xs">
                    {selectedSet.size ? `${selectedSet.size} seleccionados` : 'Sin seleccion'}
                </span>
            </div>

            <p className="theme-text-secondary mt-2 text-sm leading-6">
                Elige uno o varios espacios para darle acceso sin duplicar la cuenta.
            </p>

            <div className="theme-surface-strong theme-border mt-3 rounded-3xl border p-3">
                <div className="grid gap-2">
                    {workspaces.map((workspace) => {
                        const active = selectedSet.has(workspace.id);

                        return (
                            <button
                                key={workspace.id}
                                type="button"
                                onClick={() => toggleWorkspace(workspace.id)}
                                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                                    active
                                        ? 'border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--text-primary)] shadow-[0_16px_30px_-24px_rgba(217,119,6,0.35)]'
                                        : 'theme-surface theme-border theme-text-secondary hover:border-[color:var(--accent)]'
                                }`}
                            >
                                <span className="min-w-0 truncate text-sm font-medium">{workspace.name}</span>
                                <span
                                    className={`ml-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
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

            {selectedSet.size > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                    {workspaces
                        .filter((workspace) => selectedSet.has(workspace.id))
                        .map((workspace) => (
                            <span
                                key={workspace.id}
                                className="inline-flex rounded-full border border-[color:var(--accent)]/40 bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-medium text-[color:var(--accent)]"
                            >
                                {workspace.name}
                            </span>
                        ))}
                </div>
            ) : null}
        </div>
    );
}

export default function UsersIndex({ users, workspaces, roleOptions, statusOptions }) {
    const { auth } = usePage().props;
    const [editingMemberId, setEditingMemberId] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const form = useForm({
        workspace_ids: workspaces[0]?.id ? [workspaces[0].id] : [],
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'member',
        status: 'active',
    });

    const editingMember = users.find((member) => member.id === editingMemberId) ?? null;
    const isEditing = editingMember !== null;

    function resetFormToCreateMode() {
        setEditingMemberId(null);
        setShowPassword(false);
        setShowPasswordConfirmation(false);
        form.clearErrors();
        form.setData({
            workspace_ids: workspaces[0]?.id ? [workspaces[0].id] : [],
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            role: 'member',
            status: 'active',
        });
    }

    function startEditing(member) {
        setEditingMemberId(member.id);
        setShowPassword(false);
        setShowPasswordConfirmation(false);
        form.clearErrors();
        form.setData({
            workspace_ids: member.workspace_ids?.length ? member.workspace_ids : (workspaces[0]?.id ? [workspaces[0].id] : []),
            name: member.name ?? '',
            email: member.email ?? '',
            password: '',
            password_confirmation: '',
            role: member.primary_role ?? member.roles[0] ?? 'member',
            status: member.status ?? 'active',
        });
    }

    function submit(event) {
        event.preventDefault();

        const onSuccess = () => resetFormToCreateMode();

        if (isEditing) {
            form.patch(route('users.update', editingMember.id), {
                preserveScroll: true,
                onSuccess,
            });

            return;
        }

        form.post(route('users.store'), {
            preserveScroll: true,
            onSuccess,
        });
    }

    function deactivateMember() {
        if (!editingMember) {
            return;
        }

        router.patch(route('users.deactivate', editingMember.id), {}, {
            preserveScroll: true,
            onSuccess: () => resetFormToCreateMode(),
        });
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-3">
                    <FiUsers className="h-7 w-7 text-amber-400" />
                    <h2 className="theme-text-primary text-3xl font-semibold">Miembros</h2>
                </div>
            }
        >
            <Head title="Miembros" />

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <section className="space-y-4">
                    <div className="theme-surface rounded-[2rem] border p-5 shadow-[0_18px_45px_-30px_rgba(101,72,22,0.22)]">
                        <p className="theme-text-muted text-xs uppercase tracking-[0.32em]">Acceso al espacio</p>
                        <h3 className="theme-text-primary mt-3 text-2xl font-semibold">Personas con acceso</h3>
                        <p className="theme-text-secondary mt-2 max-w-2xl text-sm leading-6">
                            Crea cuentas, actualiza permisos y organiza accesos por varios espacios desde un mismo flujo.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {users.map((member) => (
                            <article
                                key={member.id}
                                className="theme-surface min-w-0 rounded-[2rem] border p-4 shadow-[0_18px_45px_-30px_rgba(101,72,22,0.18)] sm:p-5"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex min-w-0 items-start gap-3">
                                        <div className="theme-muted theme-text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
                                            <FiUser className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="theme-text-primary break-words text-lg font-semibold leading-6">
                                                {member.name}
                                            </h3>
                                            <p className="theme-text-secondary break-all text-sm">{member.email}</p>
                                        </div>
                                    </div>

                                    <span
                                        className={`inline-flex w-fit shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${
                                            member.status === 'active' ? 'theme-success' : 'theme-danger'
                                        }`}
                                    >
                                        {statusLabel(member.status)}
                                    </span>
                                </div>

                                <div className="mt-5 space-y-3 text-sm">
                                    <div className="theme-muted min-w-0 rounded-[1.4rem] p-4">
                                        <p className="theme-text-muted text-[11px] uppercase tracking-[0.28em]">Rol del sistema</p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {member.roles.map((role) => (
                                                <span
                                                    key={`${member.id}-${role}`}
                                                    className="theme-surface inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium"
                                                >
                                                    <FiShield className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                                                    <span className="break-words">{roleLabel(role)}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="theme-muted min-w-0 rounded-[1.4rem] p-4">
                                        <p className="theme-text-muted text-[11px] uppercase tracking-[0.28em]">Espacios asignados</p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {member.workspaces.length > 0 ? (
                                                member.workspaces.map((workspace) => (
                                                    <span
                                                        key={`${member.id}-workspace-${workspace.id}`}
                                                        className="theme-surface inline-flex max-w-full rounded-full border px-3 py-1.5 text-xs font-medium"
                                                    >
                                                        <span className="break-words">{workspace.name}</span>
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="theme-text-secondary text-sm">Sin espacio asignado.</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {member.can_edit ? (
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => startEditing(member)}
                                            className="theme-surface theme-text-secondary inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                                        >
                                            <FiEdit3 className="h-4 w-4" />
                                            Editar miembro
                                        </button>
                                    </div>
                                ) : null}
                            </article>
                        ))}
                    </div>
                </section>

                <section className="theme-surface rounded-[2rem] border p-6 shadow-[0_18px_45px_-30px_rgba(101,72,22,0.22)]">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="theme-muted flex h-12 w-12 items-center justify-center rounded-2xl">
                                {isEditing ? <FiEdit3 className="h-5 w-5 text-amber-500" /> : <FiPlusCircle className="h-5 w-5 text-amber-500" />}
                            </div>
                            <div>
                                <p className="theme-text-muted text-xs uppercase tracking-[0.32em]">
                                    {isEditing ? 'Editar acceso' : 'Nuevo acceso'}
                                </p>
                                <h3 className="theme-text-primary mt-1 text-2xl font-semibold">
                                    {isEditing ? 'Editar miembro' : 'Crear miembro'}
                                </h3>
                            </div>
                        </div>

                        {isEditing ? (
                            <button
                                type="button"
                                onClick={resetFormToCreateMode}
                                className="theme-surface theme-text-secondary inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                                aria-label="Cancelar edicion"
                            >
                                <FiX className="h-4 w-4" />
                            </button>
                        ) : null}
                    </div>

                    <p className="theme-text-secondary mt-4 text-sm leading-6">
                        {isEditing
                            ? 'Actualiza sus datos, permisos y espacios asignados sin salir del modulo de miembros.'
                            : 'Define sus espacios, rol y contrasena inicial para que pueda entrar de inmediato.'}
                    </p>

                    <form onSubmit={submit} className="mt-6 space-y-4">
                        <WorkspacePicker
                            workspaces={workspaces}
                            selectedIds={form.data.workspace_ids}
                            onChange={(selectedIds) => form.setData('workspace_ids', selectedIds)}
                        />
                        {form.errors.workspace_ids ? <p className="text-sm text-rose-500">{form.errors.workspace_ids}</p> : null}

                        <div>
                            <label className="theme-text-muted text-xs uppercase tracking-[0.3em]">Nombre</label>
                            <div className="relative mt-2">
                                <FiUser className="theme-text-muted pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={form.data.name}
                                    onChange={(event) => form.setData('name', event.target.value)}
                                    className="theme-input block w-full rounded-2xl border py-3 pl-11 pr-4"
                                    placeholder="Nombre completo"
                                />
                            </div>
                            {form.errors.name ? <p className="mt-2 text-sm text-rose-500">{form.errors.name}</p> : null}
                        </div>

                        <div>
                            <label className="theme-text-muted text-xs uppercase tracking-[0.3em]">Correo electronico</label>
                            <div className="relative mt-2">
                                <FiMail className="theme-text-muted pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" />
                                <input
                                    type="email"
                                    value={form.data.email}
                                    onChange={(event) => form.setData('email', event.target.value)}
                                    className="theme-input block w-full rounded-2xl border py-3 pl-11 pr-4"
                                    placeholder="persona@empresa.com"
                                />
                            </div>
                            {form.errors.email ? <p className="mt-2 text-sm text-rose-500">{form.errors.email}</p> : null}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="theme-text-muted text-xs uppercase tracking-[0.3em]">Rol</label>
                                <AppSelect
                                    value={form.data.role}
                                    onChange={(event) => form.setData('role', event.target.value)}
                                    wrapperClassName="mt-2"
                                >
                                    {roleOptions.map((role) => (
                                        <option key={role.value} value={role.value}>
                                            {role.label}
                                        </option>
                                    ))}
                                </AppSelect>
                                {form.errors.role ? <p className="mt-2 text-sm text-rose-500">{form.errors.role}</p> : null}
                            </div>

                            <div>
                                <label className="theme-text-muted text-xs uppercase tracking-[0.3em]">Estado</label>
                                <AppSelect
                                    value={form.data.status}
                                    onChange={(event) => form.setData('status', event.target.value)}
                                    wrapperClassName="mt-2"
                                >
                                    {statusOptions.map((status) => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </AppSelect>
                                {form.errors.status ? <p className="mt-2 text-sm text-rose-500">{form.errors.status}</p> : null}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="theme-text-muted text-xs uppercase tracking-[0.3em]">
                                    {isEditing ? 'Nueva contrasena' : 'Contrasena'}
                                </label>
                                <div className="relative mt-2">
                                    <FiLock className="theme-text-muted pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={form.data.password}
                                        onChange={(event) => form.setData('password', event.target.value)}
                                        className="theme-input block w-full rounded-2xl border py-3 pl-11 pr-12"
                                        placeholder={isEditing ? 'Dejala vacia para conservar la actual' : 'Minimo 8 caracteres'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((current) => !current)}
                                        className="theme-text-muted absolute right-4 top-1/2 -translate-y-1/2 transition hover:text-[color:var(--accent)]"
                                        aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                                    >
                                        {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {form.errors.password ? <p className="mt-2 text-sm text-rose-500">{form.errors.password}</p> : null}
                            </div>

                            <div>
                                <label className="theme-text-muted text-xs uppercase tracking-[0.3em]">Confirmar contrasena</label>
                                <div className="relative mt-2">
                                    <FiCheckCircle className="theme-text-muted pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" />
                                    <input
                                        type={showPasswordConfirmation ? 'text' : 'password'}
                                        value={form.data.password_confirmation}
                                        onChange={(event) => form.setData('password_confirmation', event.target.value)}
                                        className="theme-input block w-full rounded-2xl border py-3 pl-11 pr-12"
                                        placeholder={isEditing ? 'Repite la nueva contrasena' : 'Repite la contrasena'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordConfirmation((current) => !current)}
                                        className="theme-text-muted absolute right-4 top-1/2 -translate-y-1/2 transition hover:text-[color:var(--accent)]"
                                        aria-label={showPasswordConfirmation ? 'Ocultar confirmacion de contrasena' : 'Mostrar confirmacion de contrasena'}
                                    >
                                        {showPasswordConfirmation ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="theme-button-accent inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 font-medium transition disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isEditing ? <FiEdit3 className="h-4 w-4" /> : <FiPlusCircle className="h-4 w-4" />}
                                {isEditing ? 'Guardar cambios' : 'Crear miembro'}
                            </button>

                            {isEditing && editingMember?.can_deactivate ? (
                                <button
                                    type="button"
                                    onClick={deactivateMember}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-500/35 px-4 py-3 font-medium text-rose-600 transition hover:bg-rose-500/10"
                                >
                                    <FiSlash className="h-4 w-4" />
                                    Desactivar miembro
                                </button>
                            ) : null}
                        </div>

                        {isEditing && !editingMember?.can_deactivate ? (
                            <div className="rounded-2xl border border-amber-300/40 bg-amber-300/10 px-4 py-3 text-sm text-amber-700">
                                Este miembro no se puede desactivar desde aqui porque ya esta inactivo o tiene un nivel de acceso protegido.
                            </div>
                        ) : null}
                    </form>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
