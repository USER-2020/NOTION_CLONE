import InputError from '@/Components/InputError';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { FiAtSign, FiCheckCircle, FiRefreshCw, FiUser } from 'react-icons/fi';

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <form onSubmit={submit} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label htmlFor="name" className="text-xs uppercase tracking-[0.2em] text-stone-500">
                            Nombre
                        </label>
                        <div className="relative mt-2">
                            <FiUser className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                            <input
                                id="name"
                                className="w-full rounded-2xl border border-stone-700 bg-stone-950 px-11 py-3 text-stone-100 outline-none transition focus:border-amber-300"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                            />
                        </div>
                        <InputError className="mt-2 !text-rose-300" message={errors.name} />
                    </div>

                    <div>
                        <label htmlFor="email" className="text-xs uppercase tracking-[0.2em] text-stone-500">
                            Correo electrónico
                        </label>
                        <div className="relative mt-2">
                            <FiAtSign className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                            <input
                                id="email"
                                type="email"
                                className="w-full rounded-2xl border border-stone-700 bg-stone-950 px-11 py-3 text-stone-100 outline-none transition focus:border-amber-300"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                            />
                        </div>
                        <InputError className="mt-2 !text-rose-300" message={errors.email} />
                    </div>
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-3xl border border-amber-300/25 bg-amber-300/10 p-4">
                        <p className="text-sm leading-6 text-stone-200">
                            Tu correo electrónico aún no ha sido verificado.
                        </p>

                        <Link
                            href={route('verification.send')}
                            method="post"
                            as="button"
                            className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-300/40 px-4 py-2 text-sm font-medium text-amber-300 transition hover:bg-amber-300/10"
                        >
                            <FiRefreshCw className="h-4 w-4" />
                            Reenviar correo de verificación
                        </Link>

                        {status === 'verification-link-sent' && (
                            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
                                <FiCheckCircle className="h-4 w-4" />
                                Te enviamos un nuevo enlace de verificación.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center rounded-2xl bg-amber-300 px-5 py-3 text-sm font-medium text-stone-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Guardar cambios
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-emerald-300">Cambios guardados.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
