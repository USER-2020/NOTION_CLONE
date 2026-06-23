import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Recuperar contraseña" />

            <div className="mb-4">
                <p className="text-xs uppercase tracking-[0.35em] text-amber-500">Recuperación</p>
                <h1 className="theme-text-primary mt-3 text-3xl font-semibold">Restablece tu acceso</h1>
                <p className="theme-text-secondary mt-3 text-sm leading-6">
                    Indícanos tu correo y te enviaremos un enlace para restablecer la contraseña y elegir una nueva.
                </p>
            </div>

            <form onSubmit={submit} className="theme-surface rounded-[2rem] border p-6">
                <TextInput
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    className="theme-input mt-1 block w-full rounded-2xl border px-4 py-3"
                    isFocused={true}
                    onChange={(e) => setData('email', e.target.value)}
                />

                <InputError message={errors.email} className="mt-2" />

                <div className="mt-4 flex items-center justify-end">
                    <PrimaryButton className="theme-button-accent ms-4 rounded-2xl px-4 py-3" disabled={processing}>
                        Enviar enlace de recuperación
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
