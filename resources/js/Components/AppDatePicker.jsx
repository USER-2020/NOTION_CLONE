import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { FiCalendar, FiChevronDown, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

function clsx(...values) {
    return values.filter(Boolean).join(' ');
}

function pad(value) {
    return String(value).padStart(2, '0');
}

function formatValue(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseValue(value) {
    if (!value) {
        return null;
    }

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (!match) {
        return null;
    }

    const [, year, month, day] = match;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));

    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    return parsed;
}

function isSameDay(left, right) {
    return left.getFullYear() === right.getFullYear()
        && left.getMonth() === right.getMonth()
        && left.getDate() === right.getDate();
}

function isWithinRange(value, min, max) {
    if (!value) {
        return true;
    }

    if (min && value < min) {
        return false;
    }

    if (max && value > max) {
        return false;
    }

    return true;
}

function buildCalendarMonth(viewDate) {
    const start = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const end = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
    const firstWeekday = (start.getDay() + 6) % 7;
    const days = [];

    for (let offset = firstWeekday; offset > 0; offset -= 1) {
        days.push({
            date: new Date(start.getFullYear(), start.getMonth(), 1 - offset),
            inCurrentMonth: false,
        });
    }

    for (let day = 1; day <= end.getDate(); day += 1) {
        days.push({
            date: new Date(start.getFullYear(), start.getMonth(), day),
            inCurrentMonth: true,
        });
    }

    while (days.length < 42) {
        const nextDay = days.length - (firstWeekday + end.getDate()) + 1;
        days.push({
            date: new Date(end.getFullYear(), end.getMonth() + 1, nextDay),
            inCurrentMonth: false,
        });
    }

    return days;
}

export default function AppDatePicker({
    className = '',
    wrapperClassName = '',
    popoverClassName = '',
    value,
    onChange,
    placeholder = 'Selecciona una fecha',
    disabled = false,
    name,
    id,
    min,
    max,
    align = 'start',
}) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const rootRef = useRef(null);
    const selectedDate = useMemo(() => parseValue(value), [value]);
    const minValue = useMemo(() => min ?? null, [min]);
    const maxValue = useMemo(() => max ?? null, [max]);
    const [open, setOpen] = useState(false);
    const [viewDate, setViewDate] = useState(selectedDate ?? new Date());

    useEffect(() => {
        if (selectedDate) {
            setViewDate(selectedDate);
        }
    }, [selectedDate]);

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

    const days = useMemo(() => buildCalendarMonth(viewDate), [viewDate]);
    const today = new Date();
    const formattedLabel = selectedDate
        ? new Intl.DateTimeFormat('es-CO', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
          }).format(selectedDate)
        : placeholder;

    function emitValue(nextValue) {
        if (!onChange) {
            return;
        }

        onChange({
            target: {
                value: nextValue,
                name,
                id: inputId,
            },
        });
    }

    function handleSelect(date) {
        const nextValue = formatValue(date);

        if (!isWithinRange(nextValue, minValue, maxValue)) {
            return;
        }

        emitValue(nextValue);
        setOpen(false);
    }

    function handleClear() {
        emitValue('');
        setOpen(false);
    }

    function handleToday() {
        handleSelect(today);
    }

    const popoverAlignment = align === 'end'
        ? 'right-0 left-auto'
        : 'left-0 right-auto';

    return (
        <div ref={rootRef} className={clsx('relative', wrapperClassName)}>
            {name ? <input type="hidden" name={name} value={value ?? ''} /> : null}

            <button
                id={inputId}
                type="button"
                disabled={disabled}
                aria-haspopup="dialog"
                aria-expanded={open}
                onClick={() => !disabled && setOpen((current) => !current)}
                className={clsx(
                    'theme-date-trigger theme-input flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition',
                    disabled && 'cursor-not-allowed opacity-70',
                    className
                )}
            >
                <span className="theme-date-leading flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border">
                    <FiCalendar className="h-4 w-4" />
                </span>

                <span className={clsx('min-w-0 flex-1 truncate', selectedDate ? 'theme-text-primary' : 'theme-text-muted')}>
                    {formattedLabel}
                </span>

                <span className={clsx('theme-select-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition', open && 'theme-select-icon-open')}>
                    <FiChevronDown className={clsx('h-4 w-4 transition duration-200', open && 'rotate-180')} />
                </span>
            </button>

            {open ? (
                <div
                    className={clsx(
                        'theme-date-popover absolute top-[calc(100%+0.6rem)] z-50 w-[min(100vw-2rem,20rem)] overflow-hidden rounded-[1.35rem] border shadow-[0_30px_60px_-30px_rgba(15,23,42,0.55)]',
                        popoverAlignment,
                        popoverClassName
                    )}
                >
                    <div className="p-3">
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <button
                                type="button"
                                onClick={() => setViewDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
                                className="theme-date-nav inline-flex h-9 w-9 items-center justify-center rounded-xl border transition"
                                aria-label="Mes anterior"
                            >
                                <FiChevronLeft className="h-4 w-4" />
                            </button>

                            <div className="text-center">
                                <p className="theme-text-primary text-sm font-semibold capitalize">
                                    {new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(viewDate)}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
                                className="theme-date-nav inline-flex h-9 w-9 items-center justify-center rounded-xl border transition"
                                aria-label="Mes siguiente"
                            >
                                <FiChevronRight className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="mb-2 grid grid-cols-7 gap-1 px-1">
                            {['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'].map((day) => (
                                <span key={day} className="theme-text-muted flex h-8 items-center justify-center text-[11px] font-semibold tracking-[0.18em]">
                                    {day}
                                </span>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {days.map(({ date, inCurrentMonth }) => {
                                const nextValue = formatValue(date);
                                const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
                                const isToday = isSameDay(date, today);
                                const isDisabled = !isWithinRange(nextValue, minValue, maxValue);

                                return (
                                    <button
                                        key={nextValue}
                                        type="button"
                                        disabled={isDisabled}
                                        onClick={() => handleSelect(date)}
                                        className={clsx(
                                            'theme-date-day flex h-10 items-center justify-center rounded-xl text-sm font-medium transition',
                                            !inCurrentMonth && 'theme-date-day-muted',
                                            isToday && 'theme-date-day-today',
                                            isSelected && 'theme-date-day-selected',
                                            isDisabled && 'cursor-not-allowed opacity-35'
                                        )}
                                    >
                                        {date.getDate()}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-2 border-t border-[color:var(--border)] pt-3">
                            <button
                                type="button"
                                onClick={handleClear}
                                className="theme-text-secondary rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-[color:var(--accent-soft)] hover:text-[color:var(--accent)]"
                            >
                                Borrar
                            </button>

                            <button
                                type="button"
                                onClick={handleToday}
                                className="theme-text-secondary rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-[color:var(--accent-soft)] hover:text-[color:var(--accent)]"
                            >
                                Hoy
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
