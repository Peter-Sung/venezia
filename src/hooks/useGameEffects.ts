import { GameSession } from '../domains/game/session';
import { useGameData } from './game/useGameData';
import { useGameInput } from './game/useGameInput';
import { useGameLoop } from './game/useGameLoop';
import { useGameTimer } from './game/useGameTimer';
import { useGameScore } from './game/useGameScore';

/**
 * 게임의 모든 부수 효과(side effects)를 관리하는 훅입니다.
 * 이제는 개별 훅들을 조합(Composition)하는 역할만 수행합니다.
 */
export const useGameEffects = (
  gameAreaRef: React.RefObject<HTMLDivElement>,
  session: GameSession,
  onGoToMain: () => void,
) => {
  // 1. 데이터 페칭
  const { stageSettings, stage1Settings, isLoading } = useGameData();

  // 2. 키보드 입력 (일시정지 등)
  useGameInput(onGoToMain);

  // 3. 게임 루프 (단어 이동/생성)
  useGameLoop(gameAreaRef, stageSettings, stage1Settings);

  // 4. 타이머 (바이러스, 스테이지 클리어)
  useGameTimer(stageSettings);

  // 5. 점수 및 게임 종료 처리
  const { isScoreSubmitSuccess, isNewRecord } = useGameScore(session);

  return {
    isLoading,
    isScoreSubmitSuccess,
    isNewRecord,
    stageSettings,
  };
};


