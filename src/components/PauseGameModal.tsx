import React from 'react';

interface PauseGameModalProps {
  onConfirm: () => void; // 그만하기
  onCancel: () => void;  // 계속하기
}

const PauseGameModal: React.FC<PauseGameModalProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className="retro-overlay">
      <div className="retro-modal" style={{ minWidth: '450px' }}>
        <div className="retro-window">
          <div className="retro-titlebar" style={{ justifyContent: 'center' }}>
            <span style={{ fontSize: '24px' }}>일시정지</span>
          </div>
          <div className="retro-window__body" style={{ padding: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', margin: '0 0 20px 0' }}>
              게임이 일시정지 되었습니다.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button className="retro-button bevel-outset" onClick={onCancel} style={{ fontSize: '18px' }}>
                계속하기 (ESC)
              </button>
              <button className="retro-button bevel-outset" onClick={onConfirm} style={{ fontSize: '18px' }}>
                그만하기 (ENTER)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PauseGameModal;
