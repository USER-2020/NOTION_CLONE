import { Children, cloneElement, isValidElement, useEffect, useId, useMemo, useRef, useState } from 'react';
import { FiCheck, FiChevronDown } from 'react-icons/fi';

function clsx(...values) {
    return values.filter(Boolean).join(' ');
}

function flattenOptions(children, groupLabel = null) {
    return Children.toArray(children).flatMap((child, index) => {
        if (!isValidElement(child)) {
            return [];
        }

        if (child.type === 'optgroup') {
            return flattenOptions(child.props.children, child.props.label);
        }

        if (child.type !== 'option') {
            return [];
        }

        return [{
            key: child.key ?? `${groupLabel ?? 'option'}-${index}`,
            value: child.props.value,
            label: child.props.children,
            disabled: Boolean(child.props.disabled),
            groupLabel,
        }];
    });
}

export default function AppSelect({
    className = '',
    wrapperClassName = '',
    iconClassName = '',
    children,
    value,
    onChange,
    placeholder = 'Selecciona una opción',
    disabled = false,
    name,
    id,
    ...props
}) {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const rootRef = useRef(null);
    const [open, setOpen] = useState(false);
    const options = useMemo(() => flattenOptions(children), [children]);

    const selectedOption = options.find((option) => String(option.value) === String(value)) ?? null;

    useEffect(() => {
        function handlePointerDown(event) {
            if (!rootRef.current?.contains(event.target)) {
                setOpen(false);
            }
        }

        function handleEscape(event) {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    function handleSelect(nextValue) {
        if (disabled) {
            return;
        }

        setOpen(false);

        if (onChange) {
            onChange({
                target: {
                    value: nextValue,
                    name,
                    id: selectId,
                },
            });
        }
    }

    const groupedOptions = options.reduce((accumulator, option) => {
        const key = option.groupLabel ?? '__default__';

        if (!accumulator[key]) {
            accumulator[key] = [];
        }

        accumulator[key].push(option);
        return accumulator;
    }, {});

    return (
        <div ref={rootRef} className={clsx('theme-select-wrap relative', wrapperClassName)}>
            {name ? <input type="hidden" name={name} value={value ?? ''} /> : null}

            <button
                id={selectId}
                type="button"
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => !disabled && setOpen((current) => !current)}
                className={clsx(
                    'theme-select theme-input flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-medium',
                    disabled && 'opacity-70',
                    className
                )}
                {...props}
            >
                <span className={clsx('min-w-0 truncate pr-3', selectedOption ? 'theme-text-primary' : 'theme-text-muted')}>
                    {selectedOption?.label ?? placeholder}
                </span>

                <span
                    className={clsx(
                        'theme-select-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition',
                        open && 'theme-select-icon-open',
                        iconClassName
                    )}
                >
                    <FiChevronDown className={clsx('h-4 w-4 transition duration-200', open && 'rotate-180')} />
                </span>
            </button>

            {open ? (
                <div className="theme-select-popover absolute left-0 right-0 top-[calc(100%+0.6rem)] z-50 overflow-hidden rounded-[1.25rem] border shadow-[0_30px_60px_-30px_rgba(15,23,42,0.55)]">
                    <div className="max-h-72 overflow-y-auto p-2">
                        {Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
                            <div key={groupName} className="theme-select-group">
                                {groupName !== '__default__' ? (
                                    <p className="theme-text-muted px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.24em]">
                                        {groupName}
                                    </p>
                                ) : null}

                                <div className="space-y-1">
                                    {groupOptions.map((option) => {
                                        const selected = String(option.value) === String(value);

                                        return (
                                            <button
                                                key={option.key}
                                                type="button"
                                                role="option"
                                                aria-selected={selected}
                                                disabled={option.disabled}
                                                onClick={() => !option.disabled && handleSelect(option.value)}
                                                className={clsx(
                                                    'theme-select-option flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition',
                                                    selected && 'theme-select-option-active',
                                                    option.disabled && 'cursor-not-allowed opacity-50'
                                                )}
                                            >
                                                <span className="min-w-0 truncate">{option.label}</span>
                                                <span className={clsx('ml-3 shrink-0 opacity-0 transition', selected && 'opacity-100')}>
                                                    <FiCheck className="h-4 w-4" />
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
