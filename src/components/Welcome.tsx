
import React, { useState, useEffect } from 'react';
import '../tokens.css'; // 스타일시트 임포트

interface WelcomeProps {
  onGameStart: (nickname: string, stage: number) => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onGameStart }) => {
  const [nickname, setNickname] = useState('');
  const [savePreference, setSavePreference] = useState(false);
  const [selectedStage, setSelectedStage] = useState(1);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const savedNickname = localStorage.getItem('nickname');
    const savedPreference = localStorage.getItem('savePreference') === 'true';

    if (savedPreference && savedNickname) {
      setNickname(savedNickname);
      setSavePreference(true);
    }
  }, []);

  const handleGameStart = () => {
    if (!nickname.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }
    if (savePreference) {
      localStorage.setItem('nickname', nickname);
      localStorage.setItem('savePreference', 'true');
    } else {
      localStorage.removeItem('nickname');
      localStorage.removeItem('savePreference');
    }
    onGameStart(nickname, selectedStage);
  };

  const handleShowRanking = () => {
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  };

  return (
    <div className="welcome-container">
      {showPopup && (
        <div style={{ position: 'fixed', top: '20px', background: 'var(--color-secondary-yellow)', color: 'black', padding: '10px 20px', zIndex: 100, border: '2px solid black', fontSize: '18px' }}>
          열심히 개발하고 있어요.
        </div>
      )}
      <div> {/* New wrapper for content */}
        <div className="retro-window" style={{ width: '480px', margin: '0 auto' }}>
          <div className="retro-titlebar" style={{ justifyContent: 'center' }}>★☆★    베네치아    ★☆★</div>
          <div className="retro-window__body p-lg" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)', fontSize: '18px' }}>
            
            <fieldset className="bevel-inset" style={{ padding: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <legend>게임 설정</legend>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <label htmlFor="nickname-input" style={{ minWidth: '80px' }}>닉네임:</label>
                <input
                  id="nickname-input"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="retro-input bevel-inset"
                  style={{ flex: 1 }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <label htmlFor="stage-select" style={{ minWidth: '80px' }}>단계선택:</label>
                <select 
                  id="stage-select"
                  value={selectedStage} 
                  onChange={(e) => setSelectedStage(Number(e.target.value))}
                  className="retro-input bevel-inset"
                  style={{ flex: 1 }}
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(level => (
                    <option key={level} value={level}>{level}단계</option>
                  ))}
                </select>
              </div>
            </fieldset>

            <div style={{ alignSelf: 'center' }}>
              <input
                type="checkbox"
                id="save_nickname"
                checked={savePreference}
                onChange={(e) => setSavePreference(e.target.checked)}
              />
              <label htmlFor="save_nickname" style={{ marginLeft: 'var(--spacing-xs)' }}>닉네임 저장</label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-md)', paddingTop: 'var(--spacing-sm)', borderTop: '1px solid var(--color-border-dark)', marginTop: 'var(--spacing-sm)' }}>
              <button onClick={handleGameStart} className="retro-button bevel-outset" style={{ minWidth: '120px' }}>
                [게임하기]
              </button>
                          <button onClick={handleShowRanking} className="retro-button bevel-outset" style={{ minWidth: '120px' }}>
                            [랭킹조회]
                          </button>
                          <a href="https://csezzang.notion.site/Peter-Labs-2886569af4b5801d8e0ae7265189d0ed" style={{ textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">
                            <button className="retro-button bevel-outset" style={{ minWidth: '120px', color: 'red' }}>
                              [하는방법]
                            </button>
                          </a>
                        </div>
          </div>
        </div>
        <div className="welcome-footer">
          © 2025 Venezia: Finger Stretching (by Peter Labs). All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Welcome;
