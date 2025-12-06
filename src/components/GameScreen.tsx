import React, { useEffect, useRef } from 'react';
import { useGameStore, useFormattedTime } from '../store/gameStore';
import { useGameEffects } from '../hooks/useGameEffects';
import { VirusType } from '../domains/types';
import GameOverModal from './GameOverModal';
import StageClearModal from './StageClearModal';
import PauseGameModal from './PauseGameModal';
import { GameSession } from '../domains/game/session';

interface GameScreenProps {
  session: GameSession;
  onGoToMain: () => void;
  onRestart: () => void;
  onSessionUpdate?: (newSession: GameSession) => void;
}

// 바이러스 영문 타입 -> 한글 이름 변환 맵
const VIRUS_KOREAN_NAMES: Record<VirusType, string> = {
  annihilator: '싹쓸이 바이러스',
  stun: '마취 바이러스',
  reconstruction: '재건 바이러스',
  swift: '날쌘 바이러스',
  sloth: '굼벵이 바이러스',
  'hide-and-seek': '숨바꼭질 바이러스',
  gang: '패거리 바이러스',
  landmine: '지뢰 바이러스',
  math: '정승제 바이러스',
  bomb: '시한폭탄 바이러스',
  'landmine-field': '지뢰밭 바이러스',
};

// 5초 지속시간을 갖는 바이러스 목록
const TIMED_VIRUSES: VirusType[] = ['stun', 'swift', 'sloth', 'hide-and-seek'];

const GameScreen: React.FC<GameScreenProps> = ({ session, onGoToMain, onRestart, onSessionUpdate }) => {
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Zustand 스토어에서 상태와 액션을 가져옵니다.
  const {
    words,
    inputValue,
    score,

    remainingBlocks,
    gameStatus,
    stage,
    activeVirus,
    landmines,
    isQuitModalVisible,
    clearedWordsCount, // Added for Debug UI
    floatingScores,
    setInputValue,
    submitInputValue,
    hideQuitModal,
  } = useGameStore();

  const formattedTotalPlayTime = useFormattedTime();

  // 게임 효과 훅 사용 (소리, 진동 등)
  const { isNewRecord, stageSettings } = useGameEffects(gameAreaRef, session, onGoToMain);

  // 입력창 포커스 유지
  useEffect(() => {
    if (gameStatus === 'playing' && !isQuitModalVisible) {
      inputRef.current?.focus();
    }
  }, [gameStatus, isQuitModalVisible, words]); // words가 바뀔 때마다 포커스 확인 (단어 입력 후)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitInputValue();
  };

  const renderBlocks = (start: number, count: number) => {
    return Array.from({ length: count }, (_, i) => (
      <div
        key={i + start}
        className="life-block"
        style={{ opacity: (i + start) < remainingBlocks ? 1 : 0.2 }}
      />
    ));
  };

  const renderVirusIndicator = () => {
    if (!activeVirus.type) return null;

    const name = VIRUS_KOREAN_NAMES[activeVirus.type];
    const isTimed = TIMED_VIRUSES.includes(activeVirus.type);

    return (
      <div className="virus-indicator">
        {name} 실행{isTimed ? ` (${activeVirus.duration}초)` : ''}
      </div>
    );
  };

  return (
    <div className="retro-window" style={{ width: '98vw', height: '95vh', margin: 'auto', display: 'flex', flexDirection: 'column' }}>
      <div className="retro-titlebar">
        <div style={{ flex: 1, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '26px' }}>베네치아</span>
          <span style={{ fontSize: '20px', color: '#ddd' }}>[ESC:일시정지]</span>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{ fontSize: '26px' }}>
            (Typer :{' '}
            <span style={{ color: 'var(--color-secondary-yellow)' }}>{session.nickname}</span>
            {' '}님)
            {/* Debug UI: Word Count */}
            <span style={{ fontSize: '16px', color: '#fff', marginLeft: '10px' }}>
              [목표: {clearedWordsCount} / {stageSettings?.clear_word_count ?? 20}]
            </span>
          </span>
        </div>
        <div style={{ flex: 1, textAlign: 'right' }}>
          {renderVirusIndicator()}
        </div>
      </div>
      <div className="retro-window__body" style={{ display: 'flex', flexDirection: 'column', padding: 0, flex: 1 }}>
        {isQuitModalVisible && <PauseGameModal onConfirm={onGoToMain} onCancel={hideQuitModal} />}
        {gameStatus === 'stageClear' && <StageClearModal stage={stage} />}
        {gameStatus === 'gameOver' && (
          <GameOverModal
            nickname={session.nickname}
            score={score}
            playerId={session.playerId}
            onRestart={onRestart}
            onGoToMain={onGoToMain}
            isScoreSubmitSuccess={true} // TODO: 실제 상태 연동 필요
            isNewRecord={isNewRecord}
            isGuest={session.isGuest}
            onSessionUpdate={onSessionUpdate}
          />
        )}

        <style>
          {`
            @keyframes floatUp {
              0% { transform: translateY(0); opacity: 1; }
              100% { transform: translateY(-30px); opacity: 0; }
            }
          `}
        </style>
        <main
          ref={gameAreaRef}
          className="game-area"
          style={{
            backgroundColor: 'var(--color-primary-cyan)',
            color: 'var(--color-neutral-black)',
            position: 'relative'
          }}
        >
          {/* HUD */}
          <div className="hud-container">
            <div className="hud-item-left">단계: {stage}</div>
            <div className="hud-item-center">점수: {score.toLocaleString('en-US')}</div>
            <div className="hud-item-right">시간: {formattedTotalPlayTime}</div>
          </div>

          {/* 떨어지는 단어들 */}
          {words.map(word => {
            const isSpecial = word.isSpecial;
            return (
              <div
                key={word.id}
                className={`word ${isSpecial ? 'special-word' : ''}`}
                style={{ left: `${word.x * (100 / 12)}%`, top: word.y }}
              >
                {word.isHidden ? '????' : word.text}
                {word.timer !== undefined && (
                  <div style={{
                    position: 'absolute',
                    top: '-30px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    transform: 'translateX(-50%)',
                    fontSize: '24px',
                    color: 'var(--color-secondary-yellow)',
                    fontWeight: 'normal',
                    whiteSpace: 'nowrap',
                    whiteSpace: 'nowrap',
                    fontFamily: 'var(--font-family-pixel)'
                  }}>
                    {(word.timer / 1000).toFixed(1)}s
                  </div>
                )}
              </div>
            )
          })}

          {/* Floating Scores */}
          {floatingScores.map(fs => (
            <div
              key={fs.id}
              style={{
                position: 'absolute',
                left: `${fs.x * (100 / 12)}%`,
                top: fs.y,
                color: 'var(--color-secondary-yellow)',
                fontSize: '24px',
                fontWeight: 'bold',
                textShadow: '2px 2px 0 #000',
                zIndex: 20,
                animation: 'floatUp 3s ease-out forwards',
                pointerEvents: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              +{fs.score}점
            </div>
          ))}

          {/* 지뢰들 */}
          {landmines.map(landmine => (
            <div
              key={`landmine-${landmine.id}`}
              className="landmine"
              style={{ left: `${landmine.x * (100 / 12)}%`, top: landmine.y }}
            >
              지뢰
            </div>
          ))}
        </main>

        {/* 하단 영역 */}
        <footer className="game-footer">
          <div className="foundation">
            <div className="blocks-container blocks-container--left">
              {renderBlocks(0, 6)}
            </div>
            <form onSubmit={handleSubmit} className="input-form">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="game-input"
                disabled={gameStatus !== 'playing' || isQuitModalVisible}
                autoComplete="off"
              />
            </form>
            <div className="blocks-container blocks-container--right">
              {renderBlocks(6, 6)}
            </div>
          </div>
          <div className="wave-container"></div>
        </footer>
      </div>
    </div>
  );
};

export default GameScreen;