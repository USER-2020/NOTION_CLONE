export default function MemberMultiSelect({ label, hint, members, selectedIds, onChange }) {
    const selectedSet = new Set((selectedIds ?? []).map(Number));

    function toggleMember(memberId) {
        if (selectedSet.has(memberId)) {
            onChange([...selectedSet].filter((id) => id !== memberId));
            return;
        }

        onChange([...selectedSet, memberId]);
    }

    return (
        <div>
            <div className="flex items-center justify-between gap-3">
                <label className="theme-text-muted text-xs uppercase tracking-[0.2em]">{label}</label>
                <span className="theme-text-muted text-xs">
                    {selectedSet.size ? `${selectedSet.size} seleccionados` : 'Sin selección'}
                </span>
            </div>

            {hint ? <p className="theme-text-secondary mt-2 text-xs leading-5">{hint}</p> : null}

            <div className="theme-surface-strong mt-3 rounded-3xl border p-3">
                <div className="grid gap-2">
                    {members.map((member) => {
                        const active = selectedSet.has(member.id);

                        return (
                            <button
                                key={member.id}
                                type="button"
                                onClick={() => toggleMember(member.id)}
                                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                                    active
                                        ? 'theme-accent-soft border-[color:var(--accent)] theme-text-primary shadow-[0_16px_30px_-24px_rgba(127,35,206,0.45)]'
                                        : 'theme-shell theme-border theme-text-secondary hover:border-[color:var(--accent)]'
                                }`}
                            >
                                <div className="min-w-0 pr-4">
                                    <p className="break-words text-sm font-medium leading-6">{member.name}</p>
                                </div>

                                <span
                                    className={`relative ml-3 inline-flex h-7 w-12 shrink-0 rounded-full border transition ${
                                        active
                                            ? 'border-[color:var(--accent)] bg-[color:var(--accent)]'
                                            : 'theme-border bg-[color:var(--bg-muted)]'
                                    }`}
                                    aria-hidden="true"
                                >
                                    <span
                                        className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full transition ${
                                            active
                                                ? 'left-[1.45rem] bg-[color:var(--accent-contrast)]'
                                                : 'left-1 bg-[color:var(--bg-surface-strong)]'
                                        }`}
                                    />
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {selectedSet.size > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                    {members
                        .filter((member) => selectedSet.has(member.id))
                        .map((member) => (
                            <span key={member.id} className="theme-accent-soft rounded-full border px-3 py-1 text-xs font-medium">
                                {member.name}
                            </span>
                        ))}
                </div>
            ) : null}
        </div>
    );
}
