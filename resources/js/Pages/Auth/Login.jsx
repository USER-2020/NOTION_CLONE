import Checkbox from '@/Components/Checkbox';
import BrandLogo from '@/Components/BrandLogo';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Iniciar sesión" />

            <div className="mx-auto w-full max-w-xl">
                <div className="mb-8 text-center xl:text-left">
                    <div className="flex justify-center xl:hidden">
                        <BrandLogo imageClassName="max-h-12 max-w-[220px]" />
                    </div>

                    <p className="theme-accent mt-4 text-xs uppercase tracking-[0.35em]">Ingreso seguro</p>
                    <h1 className="theme-text-primary mt-3 text-3xl font-semibold sm:text-4xl">Entra a tu espacio de trabajo</h1>
                    <p className="theme-text-secondary mt-3 text-sm leading-6 sm:text-base">
                        Accede a proyectos, tareas, miembros y documentación interna desde una experiencia más clara, más rápida y alineada con la identidad de la marca.
                    </p>
                </div>

                {status && (
                    <div className="theme-success mb-5 rounded-3xl border px-4 py-3 text-sm">
                        {status}
                    </div>
                )}

                <div className="theme-surface mb-6 rounded-[2rem] border p-5 shadow-[0_18px_45px_-30px_rgba(30,11,84,0.18)]">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="theme-text-muted text-xs uppercase tracking-[0.28em]">Acceso de prueba</p>
                            <p className="theme-text-secondary mt-2 text-sm leading-6">
                                Puedes usar el usuario sembrado para entrar rápidamente y validar el flujo.
                            </p>
                        </div>

                        <div className="theme-accent-soft rounded-2xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
                            Demo
                        </div>
                    </div>

                    <div className="theme-muted mt-4 grid gap-3 rounded-3xl p-4 sm:grid-cols-2">
                        <div>
                            <p className="theme-text-muted text-[11px] uppercase tracking-[0.22em]">Correo</p>
                            <p className="theme-text-primary mt-1 text-sm font-medium">admin@notion-clone.test</p>
                        </div>
                        <div>
                            <p className="theme-text-muted text-[11px] uppercase tracking-[0.22em]">Contraseña</p>
                            <p className="theme-text-primary mt-1 text-sm font-medium">password</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="theme-surface space-y-5 rounded-[2rem] border p-6 shadow-[0_18px_45px_-30px_rgba(30,11,84,0.22)]">
                    <div>
                        <InputLabel htmlFor="email" value="Correo electrónico" className="theme-text-secondary text-sm uppercase tracking-[0.18em]" />

                        <div className="relative mt-2">
                            <FiMail className="theme-text-muted pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="block w-full rounded-2xl border py-3 pl-11 pr-4"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="tu@equipo.com"
                            />
                        </div>

                        <InputError message={errors.email} className="mt-2 text-rose-500" />
                    </div>

                    <div>
                        <InputLabel htmlFor="password" value="Contraseña" className="theme-text-secondary text-sm uppercase tracking-[0.18em]" />

                        <div className="relative mt-2">
                            <FiLock className="theme-text-muted pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" />
                            <TextInput
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={data.password}
                                className="block w-full rounded-2xl border py-3 pl-11 pr-12"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Escribe tu contraseña"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword((value) => !value)}
                                className="theme-text-secondary absolute inset-y-0 right-0 inline-flex items-center justify-center px-4 transition hover:opacity-80"
                                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                            </button>
                        </div>

                        <InputError message={errors.password} className="mt-2 text-rose-500" />
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <label className="theme-text-secondary flex items-center gap-3 text-sm">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded border"
                            />
                            <span>Recordarme</span>
                        </label>

                        {canResetPassword && (
                            <Link href={route('password.request')} className="theme-accent text-sm transition hover:opacity-80">
                                ¿Olvidaste tu contraseña?
                            </Link>
                        )}
                    </div>

                    <PrimaryButton className="w-full justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.24em]" disabled={processing}>
                        Entrar
                        <FiArrowRight className="h-4 w-4" />
                    </PrimaryButton>
                </form>
            </div>
        </GuestLayout>
    );
}
