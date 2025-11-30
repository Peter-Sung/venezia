import React, { useState, useEffect } from 'react';
import RankingBoard from './RankingBoard';
import GuestSignupModal from './GuestSignupModal';
import { GameSession } from '../domains/game/session';
import { fetchScoreRank } from '../lib/queries';

interface GameOverModalProps {
  nickname: string;
  score: number;
  playerId?: number;
  onRestart: () => void;
  onGoToMain: () => void;
  isScoreSubmitSuccess: boolean;
  isNewRecord?: boolean;
  isGuest?: boolean;
  playTime?: string;
  onSessionUpdate?: (newSession: GameSession) => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({
  nickname,
  score,
  playerId,
  onRestart,
  onGoToMain,
  isScoreSubmitSuccess,
  isNewRecord,
  isGuest,
  playTime,
  onSessionUpdate
}) => {
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [virtualRank, setVirtualRank] = useState<number | null>(null);

  useEffect(() => {
    if (isGuest && score > 0) {
      fetchScoreRank('all_time', score).then(rank => {
        setVirtualRank(rank);
      });
    }
  }, [isGuest, score]);

  const handleSignupSuccess = (newSession: GameSession) => {
    setShowSignupModal(false);
    if (onSessionUpdate) {
      onSessionUpdate(newSession);
    }
    // Session updated, now we are a user. The modal will re-render as user (isGuest=false).
  };

  return (
    <div className="retro-overlay">
      <div className="retro-modal" style={{ width: '600px', minWidth: '600px' }}>
        <div className="retro-window">
          <div className="retro-titlebar" style={{ justifyContent: 'center' }}><span style={{ fontSize: '28px' }}>GAME OVER</span></div>
          <div className="retro-window__body" style={{ padding: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              {isNewRecord && (
                <span style={{
                  backgroundColor: 'red',
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '5px',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  marginBottom: '5px',
                  display: 'inline-block',
                  animation: 'blink 1s infinite'
                }}>
                  NEW RECORD!
                </span>
              )}
            </div>

            <div style={{ textAlign: 'center', marginBottom: '20px', fontSize: '18px' }}>
              {isGuest ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                  <div>
                    수고하셨습니다, <span style={{ color: 'blue', fontWeight: 'normal' }}>{nickname}</span>님!<br />
                    당신의 점수는 <span style={{ color: 'red', fontWeight: 'normal' }}>{score.toLocaleString()}점</span> 입니다.
                  </div>
                  <div style={{
                    backgroundColor: '#eee',
                    padding: '15px 20px',
                    borderRadius: '8px',
                    marginTop: '10px',
                    fontSize: '16px',
                    lineHeight: '1.5'
                  }}>
                    지금 가입하면 전체 랭킹 <span style={{ color: 'red', fontWeight: 'normal' }}>{virtualRank ? `${virtualRank}위` : '...'}</span>에<br />
                    등록될 수 있습니다!
                  </div>
                </div>
              ) : (
                <RankingBoard
                  myPlayerId={playerId}
                  currentScore={score}
                  myNickname={nickname}
                />
              )}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
              {isGuest ? (
                <>
                  <button className="retro-button bevel-outset" onClick={() => setShowSignupModal(true)} style={{ fontSize: '18px', flex: 2 }}>
                    회원가입하고 점수 저장
                  </button>
                  <button className="retro-button bevel-outset" onClick={onGoToMain} style={{ fontSize: '18px', flex: 1 }}>
                    나가기
                  </button>
                </>
              ) : (
                <>
                  <button className="retro-button bevel-outset" onClick={onRestart} style={{ fontSize: '18px' }}>다시하기</button>
                  <button className="retro-button bevel-outset" onClick={onGoToMain} style={{ fontSize: '18px' }}>홈으로가기</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {showSignupModal && (
        <GuestSignupModal
          score={score}
          virtualRank={virtualRank}
          onClose={() => setShowSignupModal(false)}
          onSuccess={handleSignupSuccess}
        />
      )}
    </div>
  );
};

export default GameOverModal;