import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Welcome from './components/Welcome';
import GameScreen from './components/GameScreen';
import AdminLayout from './admin/AdminLayout';
import { useScreenSize } from './hooks/useScreenSize'; // 화면 크기 훅 임포트
import UnsupportedDevice from './components/UnsupportedDevice'; // 안내 컴포넌트 임포트
import { useGameStore } from './store/gameStore';

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

// Define Profile type at a higher level
interface Profile {
  id: string;
  nickname: string;
}

// ... (imports, but remove User from supabase-js if not used elsewhere)

// ... (QueryClientProvider, MainContent)

// 게임 관련 라우팅을 처리하는 내부 컴포넌트
const Game: React.FC = () => {
  const [gameKey, setGameKey] = React.useState(0);
  // profile은 게임 세션 전체에서 사용되지만, 순수 게임 상태는 아니므로 여기서 관리
  const [profile, setProfile] = React.useState<Profile | null>(null);
  
  // Zustand 스토어에서 게임 상태와 액션을 가져옵니다.
  const { gameStatus, startGame, setGameStatus, wordList } = useGameStore();

  const handleStartGame = (profile: Profile, stage: number) => {
    setProfile(profile);
    // TODO: wordList를 여기서 fetch하고 startGame에 넘겨줘야 함.
    // 우선 빈 배열로 시작합니다. useGameEffects에서 로드할 것입니다.
    startGame(stage, []); 
    setGameKey(prev => prev + 1); // 새 게임 시작 시 키 변경
  };

  const goToMain = () => {
    setGameStatus('welcome');
    setProfile(null);
  };

  const restartGame = () => {
    if (profile) {
      // 1단계부터 다시 시작
      startGame(1, []);
      setGameKey(prev => prev + 1);
    }
  };

  if (gameStatus === 'welcome') {
    return <Welcome onGameStart={handleStartGame} />;
  }

  if (!profile) {
    // playing 상태인데 프로필이 없으면 다시 welcome으로 보냅니다.
    setGameStatus('welcome');
    return <Welcome onGameStart={handleStartGame} />;
  }

  // GameScreen은 게임 상태가 'playing', 'stageClear', 'gameOver'일 때 렌더링됩니다.
  // startStage prop은 이제 store에서 관리되므로 필요 없습니다.
  return <GameScreen key={gameKey} profile={profile} onGoToMain={goToMain} onRestart={restartGame} />;
};

export default App;
