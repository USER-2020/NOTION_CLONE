import { useEffect, useRef } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { usePage } from '@inertiajs/react';

export default function AppToaster() {
    const { props, url, component } = usePage();
    const lastToastKey = useRef('');

    const flashSuccess = props.flash?.success;
    const flashError = props.flash?.error;
    const status = props.status;
    const errors = props.errors ?? {};
    const firstError = Object.values(errors)[0];

    useEffect(() => {
        const notifications = [
            flashSuccess ? { type: 'success', message: flashSuccess } : null,
            flashError ? { type: 'error', message: flashError } : null,
            status ? { type: 'success', message: status } : null,
            !flashError && !status && firstError ? { type: 'error', message: firstError } : null,
        ].filter(Boolean);

        notifications.forEach((notification, index) => {
            const key = `${component}:${url}:${notification.type}:${notification.message}:${index}`;

            if (lastToastKey.current === key) {
                return;
            }

            lastToastKey.current = key;

            if (notification.type === 'success') {
                toast.success(notification.message);
                return;
            }

            toast.error(notification.message);
        });
    }, [component, url, flashSuccess, flashError, status, firstError]);

    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    borderRadius: '18px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-surface-strong)',
                    color: 'var(--text-primary)',
                    boxShadow: '0 18px 45px -30px rgba(0, 0, 0, 0.28)',
                },
                success: {
                    iconTheme: {
                        primary: 'var(--accent)',
                        secondary: 'var(--accent-contrast)',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#e11d48',
                        secondary: '#fff7f9',
                    },
                },
            }}
        />
    );
}
