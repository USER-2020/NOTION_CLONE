function clsx(...values) {
    return values.filter(Boolean).join(' ');
}

export default function BrandLogo({ className = '', imageClassName = '', alt = 'SmartSend', compact = false }) {
    return (
        <span className={clsx('theme-brand-logo inline-flex items-center', className)}>
            <img
                src="/assets/SMART-14.png"
                alt={alt}
                className={clsx(
                    'theme-brand-light block h-auto w-auto object-contain',
                    compact ? 'max-h-9 max-w-[160px]' : 'max-h-12 max-w-[220px]',
                    imageClassName
                )}
            />
            <img
                src="/assets/SMART-13.png"
                alt={alt}
                className={clsx(
                    'theme-brand-dark h-auto w-auto object-contain',
                    compact ? 'max-h-9 max-w-[160px]' : 'max-h-12 max-w-[220px]',
                    imageClassName
                )}
            />
        </span>
    );
}
