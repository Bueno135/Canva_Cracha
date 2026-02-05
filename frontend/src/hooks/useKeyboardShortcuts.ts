import { useEffect } from 'react';
import { useBadgeStore } from '../store/badgeStore';

export const useKeyboardShortcuts = () => {
    const { copy, paste, deleteSelected } = useBadgeStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

            if (e.key === 'Delete') {
                deleteSelected();
            }
            if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
                e.preventDefault();
                copy();
            }
            if (e.ctrlKey && (e.key === 'v' || e.key === 'V')) {
                e.preventDefault();
                paste();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [copy, paste, deleteSelected]);
};
