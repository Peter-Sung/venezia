import { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';

const GAME_LOOP_INTERVAL = 50; // ms

export const useGameLoop = (
    gameAreaRef: React.RefObject<HTMLDivElement>,
    stageSettings: any, // TODO: Define proper type for stageSettings
    stage1Settings: any,
) => {
    const store = useGameStore();

    // --- Main Game Loop ---
    useEffect(() => {
        if (store.gameStatus !== 'playing' || store.isQuitModalVisible || !stageSettings) return;
        const gameAreaHeight = gameAreaRef.current?.offsetHeight;
        if (!gameAreaHeight) return;

        const { activeVirus, tick, moveWords } = store;
        const isStunned = activeVirus.type === 'stun' && activeVirus.duration > 0;
        const isSwift = activeVirus.type === 'swift' && activeVirus.duration > 0;
        const isSloth = activeVirus.type === 'sloth' && activeVirus.duration > 0;

        const ticksPerSecond = 1000 / GAME_LOOP_INTERVAL;
        const totalTicksToFall = stageSettings.fall_duration_seconds * ticksPerSecond;

        let effectiveTotalTicksToFall = totalTicksToFall;
        if (isSwift) {
            effectiveTotalTicksToFall = totalTicksToFall / 1.5;
        } else if (isSloth && stage1Settings) {
            effectiveTotalTicksToFall = stage1Settings.fall_duration_seconds * ticksPerSecond;
        }
        const pixelIncrement = isStunned ? 0 : gameAreaHeight / effectiveTotalTicksToFall;

        const gameLoop = setInterval(() => {
            tick(GAME_LOOP_INTERVAL);
            moveWords(pixelIncrement, gameAreaHeight);
        }, GAME_LOOP_INTERVAL);

        return () => clearInterval(gameLoop);
    }, [store.gameStatus, store.isQuitModalVisible, stageSettings, store.activeVirus, gameAreaRef, stage1Settings, store.tick, store.moveWords]);

    // --- Word Generation ---
    useEffect(() => {
        if (store.gameStatus !== 'playing' || store.isQuitModalVisible || !stageSettings || store.wordList.length === 0) return;

        const spawnIntervalMs = stageSettings.spawn_interval_seconds * 1000;
        const wordGenerator = setInterval(() => {
            if (store.activeVirus.type !== 'stun') {
                store.spawnWords(1);
            }
        }, spawnIntervalMs);

        return () => clearInterval(wordGenerator);
    }, [store.gameStatus, store.isQuitModalVisible, stageSettings, store.wordList, store.activeVirus.type, store.spawnWords]);
};
