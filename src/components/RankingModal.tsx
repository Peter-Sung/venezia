import React from 'react';
import RankingBoard from './RankingBoard';

interface RankingModalProps {
    onClose: () => void;
}

const RankingModal: React.FC<RankingModalProps> = ({ onClose }) => {
    return (
        <div className="retro-overlay">
            <div className="retro-modal" style={{ width: '500px' }}>
                <div className="retro-window">
                    <div className="retro-titlebar" style={{ justifyContent: 'space-between', paddingRight: '4px' }}>
                        <span>랭킹 조회</span>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'var(--color-surface-light)',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                padding: '0 4px'
                            }}
                        >
                            X
                        </button>
                    </div>
                    <div className="retro-window__body" style={{ padding: '16px' }}>
                        <RankingBoard />

                        <div style={{ marginTop: '16px', textAlign: 'center' }}>
                            <button className="retro-button bevel-outset" onClick={onClose} style={{ minWidth: '100px' }}>
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RankingModal;
