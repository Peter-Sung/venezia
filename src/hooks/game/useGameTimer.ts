import { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';

export const useGameTimer = (stageSettings: any) => {
    const store = useGameStore();

    // --- Virus Duration Timer ---
    useEffect(() => {
        if (store.isQuitModalVisible) return;
        if (store.activeVirus.type && store.activeVirus.duration > 0) {
            const timer = setTimeout(() => {
                store.decrementVirusDuration();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [store.activeVirus, store.decrementVirusDuration, store.isQuitModalVisible]);

    // --- Stage & Game Status Management ---
    useEffect(() => {
        if (store.isQuitModalVisible) return;
        // Check if clearedWordsCount meets the target
        const targetCount = stageSettings?.clear_word_count ?? 20; // Default to 20 if missing

        if (store.clearedWordsCount >= targetCount) {
            if (store.gameStatus === 'playing') {
                store.setGameStatus('stageClear');
            }
        }

        if (store.gameStatus === 'stageClear') {
            const timer = setTimeout(() => {
                store.nextStage();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [store.gameStatus, store.isQuitModalVisible, store.clearedWordsCount, stageSettings, store.setGameStatus, store.nextStage]);
};
