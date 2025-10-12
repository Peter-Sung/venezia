import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Welcome from './components/Welcome';
import GameScreen from './components/GameScreen';
import AdminLayout from './admin/AdminLayout';
import { useScreenSize } from './hooks/useScreenSize'; // 화면 크기 훅 임포트
import UnsupportedDevice from './components/UnsupportedDevice'; // 안내 컴포넌트 임포트

const queryClient = new QueryClient();

const App: React.FC = () => {
  const { width } = useScreenSize(); // 화면 너비 가져오기

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <MainContent />
        {width < 1024 && <UnsupportedDevice />}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// 라우팅 및 게임 상태를 관리하는 메인 컨텐츠 컴포넌트
const MainContent: React.FC = () => (
  <Routes>
    <Route path="/*" element={<Game />} />
    <Route path="/admin/*" element={<AdminLayout />} />
  </Routes>
);

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
