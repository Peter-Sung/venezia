import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchRankings } from '../lib/queries';

interface GameOverModalProps {
  nickname: string;
  score: number;
  onRestart: () => void;
  onGoToMain: () => void;
  isScoreSubmitSuccess: boolean;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ nickname, score, onRestart, onGoToMain, isScoreSubmitSuccess }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['rankings', nickname],
    queryFn: () => fetchRankings(nickname),
    enabled: isScoreSubmitSuccess, // 점수 제출이 성공했을 때만 쿼리 실행
  });

  // 이번 점수가 Top 10에 포함되었는지 확인
  const isNewTop10Score = data?.top10.some(rank => rank.nickname === nickname && rank.score === score) ?? false;

  const renderRankings = () => {
    if (isLoading) return <p style={{ textAlign: 'center' }}>순위를 불러오는 중...</p>;
    if (error) return <p style={{ textAlign: 'center' }}>순위를 불러오는 데 실패했습니다.</p>;
    if (!data || !data.top10) return null;

    const { top10 } = data;

    const headerStyle: React.CSSProperties = {
      display: 'flex',
      justifyContent: 'space-between',
      paddingBottom: '5px',
      borderBottom: '1px solid #848484',
    };

    const rowStyle: React.CSSProperties = {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '4px 0',
    };

    return (
      <div style={{ marginTop: '20px', fontSize: '18px' }}>
        <h4 style={{ textAlign: 'center', margin: '0 0 10px 0' }}>- 게임 순위 (Top 10) -</h4>
        <div style={headerStyle}>
          <span style={{ width: '15%', textAlign: 'center' }}>순위</span>
          <span style={{ width: '35%', textAlign: 'center' }}>닉네임</span>
          <span style={{ width: '25%', textAlign: 'right' }}>점수</span>
          <span style={{ width: '25%', textAlign: 'right' }}>게임시간</span>
        </div>
        <div>
          {top10.map((rank, index) => {
            const isMyRecordInTop10 = rank.nickname === nickname && rank.score === score;
            const myRecordStyle = isMyRecordInTop10 ? { color: 'red', fontWeight: 'bold' } : {};
            return (
              <div key={rank.nickname} style={{ ...rowStyle, ...myRecordStyle }}>
                <span style={{ width: '15%', textAlign: 'center' }}>{index + 1}</span>
                <span style={{ width: '35%', textAlign: 'center' }}>{rank.nickname}</span>
                <span style={{ width: '25%', textAlign: 'right' }}>{rank.score.toLocaleString('en-US')}</span>
                <span style={{ width: '25%', textAlign: 'right' }}>{rank.play_at}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="retro-overlay">
      <div className="retro-modal" style={{ minWidth: '450px' }}>
        <div className="retro-window">
          <div className="retro-titlebar" style={{ justifyContent: 'center' }}><span style={{ fontSize: '28px' }}>GAME OVER</span></div>
          <div className="retro-window__body" style={{ padding: '20px' }}>
            <p style={{
              textAlign: 'center',
              fontSize: '24px', // 글씨 크기 증가
              color: isNewTop10Score ? 'red' : 'black',
            }}>
              게임 점수: {score.toLocaleString('en-US')}
            </p>
            {renderRankings()}
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