import React from 'react';
import RankingBoard from './RankingBoard';

interface GameOverModalProps {
  nickname: string;
  score: number;
  onRestart: () => void;
  onGoToMain: () => void;
  isScoreSubmitSuccess: boolean;
  isNewRecord?: boolean;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ nickname, score, onRestart, onGoToMain, isScoreSubmitSuccess, isNewRecord }) => {
  return (
    <div className="retro-overlay">
      <div className="retro-modal" style={{ minWidth: '450px' }}>
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
            <p style={{
              textAlign: 'center',
              fontSize: '24px', // 글씨 크기 증가
              color: 'black',
              marginTop: 0,
            }}>
              게임 점수: {score.toLocaleString('en-US')}
            </p>

            <div className="bevel-inset" style={{ background: 'white', padding: '8px', minHeight: '200px', marginBottom: '20px' }}>
              <RankingBoard />
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button className="retro-button bevel-outset" onClick={onRestart} style={{ fontSize: '18px' }}>다시하기</button>
              <button className="retro-button bevel-outset" onClick={onGoToMain} style={{ fontSize: '18px' }}>홈으로가기</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;