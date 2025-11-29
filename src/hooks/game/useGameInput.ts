import { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';

export const useGameInput = (onGoToMain: () => void) => {
    const store = useGameStore();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (store.gameStatus !== 'playing') return;

            if (event.key === 'Escape') {
                if (store.isQuitModalVisible) {
                    store.hideQuitModal();
                } else {
                    store.showQuitModal();
                }
            } else if (event.key === 'Enter') {
                if (store.isQuitModalVisible) {
                    onGoToMain();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [store.gameStatus, store.isQuitModalVisible, store.showQuitModal, store.hideQuitModal, onGoToMain]);
};
