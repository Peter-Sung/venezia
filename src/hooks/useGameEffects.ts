import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGameStore, formatTime } from '../store/gameStore';
import { fetchWordsForStage, fetchStageSettings, updateHighScore } from '../lib/queries';

const GAME_LOOP_INTERVAL = 50; // ms

/**
 * 게임의 모든 부수 효과(side effects)를 관리하는 훅입니다.
 * (데이터 페칭, 타이머, 게임 루프 등)
 * 이 훅은 상태를 직접 변경하지 않고, Zustand 스토어의 액션을 호출합니다.
 */
export const useGameEffects = (
  gameAreaRef: React.RefObject<HTMLDivElement>,
  profile: { nickname: string },
  onGoToMain: () => void,
) => {
  const queryClient = useQueryClient();
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
    queryFn: () => fetchWordsForStage(store.stage),
    staleTime: Infinity,
    enabled: store.gameStatus !== 'gameOver',
  });

  // useQuery에서 데이터를 성공적으로 가져오면 스토어에 반영합니다.
  useEffect(() => {
    if (wordListData) {
      store.setWordList(wordListData);
    }
  }, [wordListData, store.setWordList]);

  const { mutate: submitScore, isSuccess: isScoreSubmitSuccess } = useMutation({
    mutationFn: updateHighScore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rankings'] });
    },
  });

  // --- Keyboard Listeners for Pause Modal ---
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
    if (stageSettings?.clear_duration_seconds && store.stageTime >= stageSettings.clear_duration_seconds * 1000) {
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
  }, [store.gameStatus, store.isQuitModalVisible, store.stageTime, stageSettings, store.setGameStatus, store.nextStage]);

  // --- Game Over Handler ---
  useEffect(() => {
    if (store.gameStatus === 'gameOver') {
      submitScore({
        nickname: profile.nickname,
        play_at: formatTime(store.totalPlayTime),
        score: store.score,
      });
    }
  }, [store.gameStatus, profile.nickname, store.totalPlayTime, store.score, submitScore]);


  return {
    isLoading: isLoadingSettings || isLoadingWords,
    isScoreSubmitSuccess,
  };
};
