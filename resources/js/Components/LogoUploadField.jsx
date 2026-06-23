import { useEffect, useMemo, useState } from 'react';
import { FiImage, FiUploadCloud, FiX } from 'react-icons/fi';

function clsx(...values) {
    return values.filter(Boolean).join(' ');
}

export default function LogoUploadField({
    label = 'Logo',
    hint = 'Opcional',
    file = null,
    currentUrl = null,
    removeRequested = false,
    onFileChange,
    onRemoveChange,
    error = '',
}) {
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    const visibleUrl = useMemo(() => {
        if (previewUrl) {
            return previewUrl;
        }

        if (removeRequested) {
            return null;
        }

        return currentUrl;
    }, [currentUrl, previewUrl, removeRequested]);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="theme-text-muted text-xs uppercase tracking-[0.3em]">{label}</p>
                    <p className="theme-text-secondary mt-2 text-sm leading-6">{hint}</p>
                </div>
            </div>

            <div className="theme-surface-strong rounded-[1.5rem] border p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="theme-muted flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[1.25rem] border border-dashed border-[color:var(--border)]">
                        {visibleUrl ? (
                            <img src={visibleUrl} alt="Preview del logo" className="h-full w-full object-cover" />
                        ) : (
                            <FiImage className="theme-text-muted h-7 w-7" />
                        )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-3">
                        <label className="theme-button-muted inline-flex cursor-pointer items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium">
                            <FiUploadCloud className="h-4 w-4" />
                            Subir logo
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                className="hidden"
                                onChange={(event) => {
                                    const nextFile = event.target.files?.[0] ?? null;
                                    onFileChange?.(nextFile);
                                    if (nextFile) {
                                        onRemoveChange?.(false);
                                    }
                                }}
                            />
                        </label>

                        <div className="flex flex-wrap gap-2">
                            {file ? (
                                <button
                                    type="button"
                                    onClick={() => onFileChange?.(null)}
                                    className="theme-text-secondary inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] px-3 py-2 text-xs font-medium transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                                >
                                    <FiX className="h-3.5 w-3.5" />
                                    Limpiar archivo
                                </button>
                            ) : null}

                            {currentUrl && !file ? (
                                <button
                                    type="button"
                                    onClick={() => onRemoveChange?.(!removeRequested)}
                                    className={clsx(
                                        'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition',
                                        removeRequested
                                            ? 'theme-button-accent'
                                            : 'theme-text-secondary border-[color:var(--border)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]'
                                    )}
                                >
                                    <FiX className="h-3.5 w-3.5" />
                                    {removeRequested ? 'Mantener logo actual' : 'Quitar logo actual'}
                                </button>
                            ) : null}
                        </div>

                        <p className="theme-text-muted text-xs leading-5">
                            Formatos permitidos: PNG, JPG, WEBP o SVG. Tamano maximo: 4 MB.
                        </p>
                    </div>
                </div>
            </div>

            {error ? <p className="text-sm text-rose-500">{error}</p> : null}
        </div>
    );
}
