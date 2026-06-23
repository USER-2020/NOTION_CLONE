import { Head } from '@inertiajs/react';
import { FiAlertTriangle, FiLock, FiUser } from 'react-icons/fi';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

function SectionCard({ icon: Icon, eyebrow, title, description, children }) {
    return (
        <section className="rounded-[2rem] border border-stone-800 bg-stone-900/70 p-5 shadow-[0_18px_45px_-30px_rgba(101,72,22,0.22)] sm:p-6">
            <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-300/10 text-amber-300">
                    <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.28em] text-stone-500">{eyebrow}</p>
                    <h3 className="mt-2 text-xl font-semibold text-stone-50">{title}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-400">{description}</p>
                </div>
            </div>

            <div className="mt-6">{children}</div>
        </section>
    );
}

export default function Edit({ auth, mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="theme-text-primary text-3xl font-semibold">Perfil</h2>}
        >
            <Head title="Perfil" />

            <div className="mx-auto max-w-5xl space-y-6">
                <SectionCard
                    icon={FiUser}
                    eyebrow="Cuenta"
                    title="Información personal"
                    description="Actualiza tu nombre, correo y los datos básicos con los que te identificas dentro del espacio de trabajo."
                >
                    <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
                </SectionCard>

                <SectionCard
                    icon={FiLock}
                    eyebrow="Seguridad"
                    title="Contraseña y acceso"
                    description="Usa una contraseña robusta y mantenla al día para proteger tu cuenta y el acceso a tus proyectos."
                >
                    <UpdatePasswordForm />
                </SectionCard>

                <SectionCard
                    icon={FiAlertTriangle}
                    eyebrow="Zona sensible"
                    title="Eliminar cuenta"
                    description="Esta acción es permanente. Si la ejecutas, se eliminarán tu acceso y los datos asociados a tu cuenta."
                >
                    <DeleteUserForm />
                </SectionCard>
            </div>
        </AuthenticatedLayout>
    );
}
