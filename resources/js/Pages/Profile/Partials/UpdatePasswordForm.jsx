import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';
import InputError from '@/Components/InputError';
import { FiKey, FiLock, FiShield } from 'react-icons/fi';

function PasswordField({ id, label, icon: Icon, value, onChange, autoComplete, inputRef, error }) {
    return (
        <div>
            <label htmlFor={id} className="text-xs uppercase tracking-[0.2em] text-stone-500">
                {label}
            </label>
            <div className="relative mt-2">
                <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                <input
                    id={id}
                    ref={inputRef}
                    value={value}
                    onChange={onChange}
                    type="password"
                    className="w-full rounded-2xl border border-stone-700 bg-stone-950 px-11 py-3 text-stone-100 outline-none transition focus:border-amber-300"
                    autoComplete={autoComplete}
                />
            </div>
            <InputError message={error} className="mt-2 !text-rose-300" />
        </div>
    );
}

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (formErrors) => {
                if (formErrors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (formErrors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <form onSubmit={updatePassword} className="space-y-5">
                <div className="grid gap-5">
                    <PasswordField
                        id="current_password"
                        label="Contraseña actual"
                        icon={FiKey}
                        inputRef={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        autoComplete="current-password"
                        error={errors.current_password}
                    />

                    <PasswordField
                        id="password"
                        label="Nueva contraseña"
                        icon={FiLock}
                        inputRef={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoComplete="new-password"
                        error={errors.password}
                    />

                    <PasswordField
                        id="password_confirmation"
                        label="Confirmar nueva contraseña"
                        icon={FiShield}
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        autoComplete="new-password"
                        error={errors.password_confirmation}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center rounded-2xl bg-amber-300 px-5 py-3 text-sm font-medium text-stone-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Actualizar contraseña
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-emerald-300">Contraseña actualizada.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
