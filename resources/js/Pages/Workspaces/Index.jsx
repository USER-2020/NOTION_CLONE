import AppSelect from '@/Components/AppSelect';
import LogoUploadField from '@/Components/LogoUploadField';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { FiBriefcase, FiCheckCircle, FiEdit3, FiFolder, FiFileText, FiPlusCircle, FiUsers } from 'react-icons/fi';

function WorkspaceCard({ workspace, isCurrent, onEdit, onSelect }) {
    return (
        <article className="theme-surface rounded-[2rem] border p-5 shadow-[0_18px_45px_-30px_rgba(101,72,22,0.18)]">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    {workspace.logo_url ? (
                        <img
                            src={workspace.logo_url}
                            alt={`Logo de ${workspace.name}`}
                            className="h-12 w-12 rounded-2xl object-cover"
                        />
                    ) : (
                        <div className="theme-muted theme-text-primary flex h-12 w-12 items-center justify-center rounded-2xl">
                            <FiBriefcase className="h-5 w-5 text-amber-500" />
                        </div>
                    )}
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="theme-text-primary text-lg font-semibold">{workspace.name}</h3>
                            {isCurrent ? (
                                <span className="theme-success rounded-full border px-3 py-1 text-xs font-medium">
                                    Actual
                                </span>
                            ) : null}
                        </div>
                        <p className="theme-text-secondary mt-1 text-sm">
                            {workspace.description || 'Sin descripción todavía.'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="theme-muted rounded-[1.4rem] p-4">
                    <div className="theme-text-muted flex items-center gap-2 text-[11px] uppercase tracking-[0.28em]">
                        <FiFolder className="h-3.5 w-3.5" />
                        Proyectos
                    </div>
                    <p className="theme-text-primary mt-3 text-2xl font-semibold">{workspace.projects_count}</p>
                </div>

                <div className="theme-muted rounded-[1.4rem] p-4">
                    <div className="theme-text-muted flex items-center gap-2 text-[11px] uppercase tracking-[0.28em]">
                        <FiFileText className="h-3.5 w-3.5" />
                        Páginas
                    </div>
                    <p className="theme-text-primary mt-3 text-2xl font-semibold">{workspace.pages_count}</p>
                </div>

                <div className="theme-muted rounded-[1.4rem] p-4">
                    <div className="theme-text-muted flex items-center gap-2 text-[11px] uppercase tracking-[0.28em]">
                        <FiUsers className="h-3.5 w-3.5" />
                        Miembros
                    </div>
                    <p className="theme-text-primary mt-3 text-2xl font-semibold">{workspace.users_count}</p>
                </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={() => onSelect(workspace.id)}
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                        isCurrent ? 'theme-muted theme-text-secondary border' : 'theme-button-accent'
                    }`}
                >
                    <FiCheckCircle className="h-4 w-4" />
                    {isCurrent ? 'Seleccionado' : 'Usar este workspace'}
                </button>

                <button
                    type="button"
                    onClick={() => onEdit(workspace)}
                    className="theme-surface-strong theme-text-secondary inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition hover:opacity-90"
                >
                    <FiEdit3 className="h-4 w-4" />
                    Editar
                </button>
            </div>
        </article>
    );
}

export default function WorkspacesIndex({ workspaces, owners }) {
    const { auth, workspace: workspaceContext } = usePage().props;
    const currentWorkspaceId = workspaceContext?.current?.id ?? null;
    const [editingWorkspaceId, setEditingWorkspaceId] = useState(null);

    const form = useForm({
        name: '',
        description: '',
        owner_id: auth.user.id,
        logo: null,
        remove_logo: false,
    });

    useEffect(() => {
        if (!editingWorkspaceId) {
            form.reset();
            form.setData({
                name: '',
                description: '',
                owner_id: auth.user.id,
                logo: null,
                remove_logo: false,
            });
        }
    }, [editingWorkspaceId]);

    function submit(event) {
        event.preventDefault();

        if (editingWorkspaceId) {
            form.patch(route('workspaces.update', editingWorkspaceId), {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => setEditingWorkspaceId(null),
            });

            return;
        }

        form.post(route('workspaces.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    }

    function handleEdit(workspace) {
        setEditingWorkspaceId(workspace.id);
        form.setData({
            name: workspace.name,
            description: workspace.description ?? '',
            owner_id: workspace.owner_id,
            logo: null,
            remove_logo: false,
        });
    }

    function handleSelect(workspaceId) {
        router.patch(route('workspaces.switch'), { workspace_id: workspaceId }, { preserveScroll: true, preserveState: false });
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-3">
                    <FiBriefcase className="h-7 w-7 text-amber-400" />
                    <h2 className="theme-text-primary text-3xl font-semibold">Espacios</h2>
                </div>
            }
        >
            <Head title="Espacios" />

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <section className="space-y-4">
                    <div className="theme-surface rounded-[2rem] border p-5 shadow-[0_18px_45px_-30px_rgba(101,72,22,0.22)]">
                        <p className="theme-text-muted text-xs uppercase tracking-[0.32em]">Organización</p>
                        <h3 className="theme-text-primary mt-3 text-2xl font-semibold">Tus workspaces visibles</h3>
                        <p className="theme-text-secondary mt-2 max-w-2xl text-sm leading-6">
                            Crea varios espacios para separar clientes, equipos, productos o líneas de trabajo y cambia entre ellos desde el sidebar.
                        </p>
                    </div>

                    <div className="grid gap-4">
                        {workspaces.map((workspace) => (
                            <WorkspaceCard
                                key={workspace.id}
                                workspace={workspace}
                                isCurrent={currentWorkspaceId === workspace.id}
                                onEdit={handleEdit}
                                onSelect={handleSelect}
                            />
                        ))}
                    </div>
                </section>

                <section className="theme-surface rounded-[2rem] border p-6 shadow-[0_18px_45px_-30px_rgba(101,72,22,0.22)]">
                    <div className="flex items-center gap-3">
                        <div className="theme-muted flex h-12 w-12 items-center justify-center rounded-2xl">
                            <FiPlusCircle className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                            <p className="theme-text-muted text-xs uppercase tracking-[0.32em]">
                                {editingWorkspaceId ? 'Editar espacio' : 'Nuevo espacio'}
                            </p>
                            <h3 className="theme-text-primary mt-1 text-2xl font-semibold">
                                {editingWorkspaceId ? 'Actualizar workspace' : 'Crear workspace'}
                            </h3>
                        </div>
                    </div>

                    <form onSubmit={submit} className="mt-6 space-y-4">
                        <div>
                            <label className="theme-text-muted text-xs uppercase tracking-[0.3em]">Nombre</label>
                            <input
                                type="text"
                                value={form.data.name}
                                onChange={(event) => form.setData('name', event.target.value)}
                                className="theme-input mt-2 block w-full rounded-2xl border px-4 py-3"
                                placeholder="Prestige Studio"
                            />
                            {form.errors.name ? <p className="mt-2 text-sm text-rose-500">{form.errors.name}</p> : null}
                        </div>

                        <div>
                            <label className="theme-text-muted text-xs uppercase tracking-[0.3em]">Descripción</label>
                            <textarea
                                value={form.data.description}
                                onChange={(event) => form.setData('description', event.target.value)}
                                className="theme-input mt-2 block h-28 w-full rounded-2xl border px-4 py-3"
                                placeholder="Espacio para proyectos, tareas, documentos y miembros."
                            />
                            {form.errors.description ? <p className="mt-2 text-sm text-rose-500">{form.errors.description}</p> : null}
                        </div>

                        <div>
                            <label className="theme-text-muted text-xs uppercase tracking-[0.3em]">Propietario</label>
                            <AppSelect
                                wrapperClassName="mt-2"
                                value={form.data.owner_id}
                                onChange={(event) => form.setData('owner_id', event.target.value)}
                            >
                                {owners.map((owner) => (
                                    <option key={owner.id} value={owner.id}>
                                        {owner.name} · {owner.email}
                                    </option>
                                ))}
                            </AppSelect>
                            {form.errors.owner_id ? <p className="mt-2 text-sm text-rose-500">{form.errors.owner_id}</p> : null}
                        </div>

                        <LogoUploadField
                            label="Logo del espacio"
                            hint="Puedes asociar un logo opcional para identificar este workspace visualmente."
                            file={form.data.logo}
                            currentUrl={workspaces.find((workspace) => workspace.id === editingWorkspaceId)?.logo_url ?? null}
                            removeRequested={form.data.remove_logo}
                            onFileChange={(file) => form.setData('logo', file)}
                            onRemoveChange={(value) => form.setData('remove_logo', value)}
                            error={form.errors.logo}
                        />

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="theme-button-accent inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 font-medium transition disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                <FiPlusCircle className="h-4 w-4" />
                                {editingWorkspaceId ? 'Guardar cambios' : 'Crear workspace'}
                            </button>

                            {editingWorkspaceId ? (
                                <button
                                    type="button"
                                    onClick={() => setEditingWorkspaceId(null)}
                                    className="theme-surface-strong theme-text-secondary inline-flex items-center justify-center rounded-2xl border px-4 py-3 font-medium transition hover:opacity-90"
                                >
                                    Cancelar
                                </button>
                            ) : null}
                        </div>
                    </form>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
