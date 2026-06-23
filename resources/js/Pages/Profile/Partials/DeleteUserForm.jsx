import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { FiAlertTriangle, FiTrash2, FiX } from 'react-icons/fi';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm({
        password: '',
    });

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-4">
                <p className="text-sm leading-6 text-stone-200">
                    Si eliminas tu cuenta, también perderás acceso a tus proyectos, tareas y configuraciones personales.
                </p>
            </div>

            <button
                type="button"
                onClick={() => setConfirmingUserDeletion(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-rose-500/40 px-5 py-3 text-sm font-medium text-rose-200 transition hover:bg-rose-500/10"
            >
                <FiTrash2 className="h-4 w-4" />
                Eliminar cuenta
            </button>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6 sm:p-7">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-300">
                            <FiAlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-stone-50">
                                ¿Seguro que deseas eliminar tu cuenta?
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-stone-400">
                                Esta acción es irreversible. Escribe tu contraseña para confirmar que deseas eliminar permanentemente tu cuenta.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <label htmlFor="password" className="text-xs uppercase tracking-[0.2em] text-stone-500">
                            Confirma con tu contraseña
                        </label>

                        <input
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="mt-2 block w-full rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none transition focus:border-rose-400"
                            autoFocus
                            placeholder="Tu contraseña"
                        />

                        <InputError message={errors.password} className="mt-2 !text-rose-300" />
                    </div>

                    <div className="mt-6 flex flex-wrap justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="inline-flex items-center gap-2 rounded-2xl border border-stone-700 px-4 py-3 text-sm font-medium text-stone-300 transition hover:border-stone-500 hover:text-stone-100"
                        >
                            <FiX className="h-4 w-4" />
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <FiTrash2 className="h-4 w-4" />
                            Eliminar definitivamente
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
