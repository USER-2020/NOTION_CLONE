export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'theme-input rounded border text-indigo-600 shadow-sm focus:ring-indigo-500 ' +
                className
            }
        />
    );
}
