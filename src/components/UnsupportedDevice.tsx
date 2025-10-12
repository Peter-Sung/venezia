import React from 'react';

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  color: 'white',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  zIndex: 10000, // 최상단에 위치
  padding: '20px',
  boxSizing: 'border-box',
};

const messageStyle: React.CSSProperties = {
  fontFamily: 'var(--font-family-pixel)',
  fontSize: '20px',
  lineHeight: '1.6',
};

const UnsupportedDevice: React.FC = () => {
  return (
    <div style={overlayStyle}>
      <p style={messageStyle}>
        Peter의 Venezia 게임은<br />
        가로 기준으로 1024px 이상에서<br />
        이용 가능합니다.
      </p>
    </div>
  );
};

export default UnsupportedDevice;
