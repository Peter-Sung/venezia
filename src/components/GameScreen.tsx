import React, { useEffect, useRef } from 'react';
import { useGameLogic, VirusType } from '../hooks/useGameLogic';
import GameOverModal from './GameOverModal';
import StageClearModal from './StageClearModal';

interface Profile {
  id: string;
  nickname: string;
}

interface GameScreenProps {
  profile: Profile;
  startStage: number;
  onGoToMain: () => void;
  onRestart: () => void;
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
};

// 5초 지속시간을 갖는 바이러스 목록
const TIMED_VIRUSES: VirusType[] = ['stun', 'swift', 'sloth', 'hide-and-seek'];

const GameScreen: React.FC<GameScreenProps> = ({ profile, startStage, onGoToMain, onRestart }) => {
  const {
    words,
    inputValue,
    score,
    remainingBlocks,
    gameStatus,
    totalPlayTime,
    stage,
    activeVirus,
    landmines,
    gameAreaRef,
    setInputValue,
    handleSubmit,
    isScoreSubmitSuccess,
  } = useGameLogic(profile, startStage);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (gameStatus === 'playing') {
      inputRef.current?.focus();
    }
  }, [gameStatus]);

  if (gameStatus === 'gameOver') {
    return <GameOverModal nickname={profile.nickname} score={score} onRestart={onRestart} onGoToMain={onGoToMain} isScoreSubmitSuccess={isScoreSubmitSuccess} />;
  }

  // 12개의 기회 블록 렌더링
  const renderBlocks = (start: number, end: number) => {
    return Array.from({ length: 12 }).slice(start, end).map((_, i) => (
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
        <div style={{ flex: 1, textAlign: 'left' }}>
          <span style={{ fontSize: '26px' }}>베네치아</span>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{ fontSize: '26px' }}>
            (Typer :{' '}
            <span style={{ color: 'var(--color-secondary-yellow)' }}>{profile.nickname}</span>
            {' '}님)
          </span>
        </div>
        <div style={{ flex: 1, textAlign: 'right' }}>
          {renderVirusIndicator()}
        </div>
      </div>
      <div className="retro-window__body" style={{ display: 'flex', flexDirection: 'column', padding: 0, flex: 1 }}>
        {gameStatus === 'stageClear' && <StageClearModal stage={stage} />}
        
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
            <div className="hud-item-right">시간: {totalPlayTime}</div>
          </div>

          {/* 떨어지는 단어들 */}
          {words.map(word => {
              const isSpecial = word.isSpecial;
              return (
                  <div 
                    key={word.id} 
                    className={`word ${isSpecial ? 'special-word' : ''}`}
                    style={{ left: `${word.x * (100/12)}%`, top: word.y }}
                  >
                      {word.isHidden ? '????' : word.text}
                  </div>
              )
          })}

          {/* 지뢰들 */}
          {landmines.map(landmine => (
            <div
              key={`landmine-${landmine.id}`}
              className="landmine"
              style={{ left: `${landmine.x * (100/12)}%`, top: landmine.y }}
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
                disabled={gameStatus !== 'playing'}
                autoComplete="off"
              />
            </form>
            <div className="blocks-container blocks-container--right">
              {renderBlocks(6, 12)}
            </div>
          </div>
          <div className="wave-container"></div>
        </footer>
      </div>
    </div>
  );
};

export default GameScreen;