import axios from 'axios';
import { useEffect, useId, useRef } from 'react';
import { FiBold, FiImage, FiItalic, FiLink, FiList, FiMinusCircle, FiType } from 'react-icons/fi';

function clsx(...values) {
    return values.filter(Boolean).join(' ');
}

function insertHtmlAtCursor(html) {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
        return;
    }

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const template = document.createElement('template');
    template.innerHTML = html.trim();
    const fragment = template.content;
    const lastNode = fragment.lastChild;

    range.insertNode(fragment);

    if (lastNode) {
        range.setStartAfter(lastNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

export default function RichTextEditor({
    label,
    hint,
    value,
    onChange,
    placeholder = 'Escribe aqui...',
    className = '',
    editorClassName = '',
    error = '',
    imageUploadUrl = null,
    onSubmitShortcut = null,
}) {
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);
    const inputId = useId();

    useEffect(() => {
        if (!editorRef.current) {
            return;
        }

        if (editorRef.current.innerHTML !== (value ?? '')) {
            editorRef.current.innerHTML = value ?? '';
        }
    }, [value]);

    function emitChange() {
        onChange?.(editorRef.current?.innerHTML ?? '');
    }

    function runCommand(command, commandValue = null) {
        editorRef.current?.focus();
        document.execCommand(command, false, commandValue);
        emitChange();
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey && onSubmitShortcut) {
            event.preventDefault();
            onSubmitShortcut(event);
        }
    }

    async function handleImageSelection(event) {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (!file || !imageUploadUrl) {
            return;
        }

        const formData = new FormData();
        formData.append('files[0]', file);

        const response = await axios.post(imageUploadUrl, formData, {
            headers: {
                Accept: 'application/json',
            },
        });

        const uploadedImage = response.data?.attachments?.[0];

        if (!uploadedImage?.url) {
            return;
        }

        editorRef.current?.focus();
        insertHtmlAtCursor(`<p><img src="${uploadedImage.url}" alt="${uploadedImage.name ?? file.name}" class="rounded-2xl max-w-full" /></p>`);
        emitChange();
    }

    return (
        <div className={clsx('space-y-3', className)}>
            {label ? (
                <div>
                    <label htmlFor={inputId} className="text-xs uppercase tracking-[0.2em] text-stone-500">{label}</label>
                    {hint ? <p className="mt-2 text-sm leading-6 text-stone-400">{hint}</p> : null}
                </div>
            ) : null}

            <div className="rounded-[1.75rem] border border-stone-800 bg-stone-950/80">
                <div className="flex flex-wrap gap-2 border-b border-stone-800 p-3">
                    <button type="button" onClick={() => runCommand('bold')} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-stone-700 text-stone-200 transition hover:border-amber-300 hover:text-amber-200">
                        <FiBold className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => runCommand('italic')} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-stone-700 text-stone-200 transition hover:border-amber-300 hover:text-amber-200">
                        <FiItalic className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => runCommand('insertUnorderedList')} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-stone-700 text-stone-200 transition hover:border-amber-300 hover:text-amber-200">
                        <FiList className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            const url = window.prompt('Pega la URL del enlace');
                            if (url) {
                                runCommand('createLink', url);
                            }
                        }}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-stone-700 text-stone-200 transition hover:border-amber-300 hover:text-amber-200"
                    >
                        <FiLink className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!imageUploadUrl}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-stone-700 text-stone-200 transition hover:border-amber-300 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-40"
                        title={imageUploadUrl ? 'Subir imagen' : 'Guarda la tarea primero para subir imagenes'}
                    >
                        <FiImage className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => runCommand('removeFormat')} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-stone-700 text-stone-200 transition hover:border-amber-300 hover:text-amber-200">
                        <FiMinusCircle className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => runCommand('formatBlock', 'p')} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-stone-700 text-stone-200 transition hover:border-amber-300 hover:text-amber-200">
                        <FiType className="h-4 w-4" />
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                        className="hidden"
                        onChange={handleImageSelection}
                    />
                </div>

                <div
                    id={inputId}
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={emitChange}
                    onKeyDown={handleKeyDown}
                    data-placeholder={placeholder}
                    className={clsx(
                        'min-h-[220px] w-full px-4 py-4 text-sm leading-7 text-stone-100 outline-none [&_a]:text-amber-300 [&_a]:underline [&_img]:my-3 [&_img]:max-w-full [&_ul]:ml-5 [&_ul]:list-disc [&:empty:before]:text-stone-500 [&:empty:before]:content-[attr(data-placeholder)]',
                        editorClassName
                    )}
                />
            </div>

            {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        </div>
    );
}
