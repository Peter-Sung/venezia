
import { useState, useEffect } from 'react';

/**
 * 게임의 시간 관련 로직을 관리하는 커스텀 훅입니다.
 * @param gameStatus 현재 게임 상태 ('playing', 'stageClear', 'gameOver')
 * @param onStageClear 스테이지 클리어 조건 충족 시 호출될 콜백
 * @param clearDuration 현재 스테이지의 클리어 시간 (초)
 */
export const useGameTimers = (
  gameStatus: 'playing' | 'stageClear' | 'gameOver',
  onStageClear: () => void,
  clearDuration: number | undefined
) => {
  const [totalPlayTime, setTotalPlayTime] = useState(0); // 총 플레이 시간 (ms)
  const [stageTime, setStageTime] = useState(0); // 현재 스테이지 경과 시간 (ms)

  // 총 플레이 시간 및 스테이지 시간 측정 타이머
  useEffect(() => {
    if (gameStatus !== 'playing') {
      return;
    }

    const timer = setInterval(() => {
      setTotalPlayTime(prev => prev + 100);
      setStageTime(prev => prev + 100);
    }, 100);

    return () => clearInterval(timer);
  }, [gameStatus]);

  // 스테이지 클리어 조건 확인
  useEffect(() => {
    if (!clearDuration) return;
    const clearTimeMs = clearDuration * 1000;
    if (gameStatus === 'playing' && stageTime >= clearTimeMs) {
      onStageClear();
    }
  }, [stageTime, gameStatus, clearDuration, onStageClear]);

  /**
   * 스테이지 시간을 0으로 리셋합니다.
   */
  const resetStageTime = () => {
    setStageTime(0);
  };

  /**
 * 시간을 MM:SS.ms 형식의 문자열로 변환합니다.
 * @param timeInMs 변환할 시간 (밀리초)
 */
  const formatTime = (timeInMs: number) => {
    const totalSeconds = Math.floor(timeInMs / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    const milliseconds = Math.floor((timeInMs % 1000) / 100).toString().padStart(1, '0'); // 100ms 단위
    return `${minutes}:${seconds}.${milliseconds}`;
  };

  return { 
    totalPlayTime,
    stageTime,
    formattedTotalPlayTime: formatTime(totalPlayTime),
    resetStageTime,
    formatTime
  };
};
