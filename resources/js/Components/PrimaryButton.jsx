export default function PrimaryButton({ className = '', disabled, children, ...props }) {
    return (
        <button
            {...props}
            className={
                `theme-button-accent inline-flex items-center rounded-2xl border border-transparent px-4 py-2 text-xs font-semibold uppercase tracking-widest transition ease-in-out duration-150 focus:ring-2 focus:ring-offset-2 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
