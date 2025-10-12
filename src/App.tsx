import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Welcome from './components/Welcome';
import GameScreen from './components/GameScreen';
import AdminLayout from './admin/AdminLayout'; // 관리자 페이지 레이아웃

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<Game />} />
          <Route path="/admin/*" element={<AdminLayout />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// 게임 관련 라우팅을 처리하는 내부 컴포넌트
const Game: React.FC = () => {
  const [gameKey, setGameKey] = React.useState(0);
  const [appStatus, setAppStatus] = React.useState('welcome');
  const [nickname, setNickname] = React.useState('');
  const [startStage, setStartStage] = React.useState(1);

  const startGame = (name: string, stage: number) => {
    setNickname(name);
    setStartStage(stage);
    setAppStatus('playing');
    setGameKey(prev => prev + 1); // 새 게임 시작 시 키 변경
  };

  const goToMain = () => {
    setAppStatus('welcome');
  };

  const restartGame = () => {
    setStartStage(1); // 1단계부터 시작
    setGameKey(prev => prev + 1); // 키를 변경하여 GameScreen을 강제로 다시 마운트
  };

  if (appStatus === 'welcome') {
    return <Welcome onGameStart={startGame} />;
  }

  return <GameScreen key={gameKey} nickname={nickname} startStage={startStage} onGoToMain={goToMain} onRestart={restartGame} />;
};

export default App;
