import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useGameStore } from '../../store/gameStore';
import { fetchStageSettings } from '../../lib/queries';
import { getWordsForStage } from '../../domains/game/wordService';

export const useGameData = () => {
    const store = useGameStore();

    // 굼벵이 바이러스를 위해 1단계 설정값을 미리 가져와 캐시해 둡니다.
    const { data: stage1Settings } = useQuery({
        queryKey: ['stageSettings', 1],
        queryFn: () => fetchStageSettings(1),
        staleTime: Infinity,
        enabled: true,
    });

    // 스테이지 설정 데이터 페칭
    const { data: stageSettings, isLoading: isLoadingSettings } = useQuery({
        queryKey: ['stageSettings', store.stage],
        queryFn: () => fetchStageSettings(store.stage),
        staleTime: Infinity,
        enabled: store.gameStatus !== 'gameOver',
    });

    // 스테이지 단어 목록 페칭
    const { data: wordListData, isLoading: isLoadingWords } = useQuery({
        queryKey: ['words', store.stage],
        queryFn: () => getWordsForStage(store.stage),
        staleTime: Infinity,
        enabled: store.gameStatus !== 'gameOver',
    });

    // useQuery에서 데이터를 성공적으로 가져오면 스토어에 반영합니다.
    useEffect(() => {
        if (wordListData) {
            store.setWordList(wordListData);
        }
    }, [wordListData, store.setWordList]);

    return {
        stageSettings,
        stage1Settings,
        isLoading: isLoadingSettings || isLoadingWords,
    };
};
