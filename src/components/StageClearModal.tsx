import React, { useState, useEffect } from 'react';

interface StageClearModalProps {
  stage: number;
}

const StageClearModal: React.FC<StageClearModalProps> = ({ stage }) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  return (
    <div className="retro-overlay">
      <div className="retro-modal" style={{ minWidth: '400px' }}>
        <div className="retro-window">
          <div className="retro-titlebar">
            <span style={{ fontSize: '24px' }}>단계 클리어!</span>
          </div>
          <div className="retro-window__body" style={{ textAlign: 'center', padding: '32px' }}>
            <p style={{ margin: 0, fontSize: '24px' }}>{stage + 1} 단계로 넘어갑니다.</p>
            <p style={{ margin: '16px 0 0', fontSize: '32px' }}>
              {countdown}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StageClearModal;
