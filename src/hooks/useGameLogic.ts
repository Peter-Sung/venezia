import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWordsForStage, fetchStageSettings, updateHighScore } from '../lib/queries';
import { useGameTimers } from './useGameTimers';
import { useWordManager } from './useWordManager';
import { calculateKeystrokes } from '../domains/ime';

// 바이러스 타입 정의
export const VIRUS_TYPES = [
  'annihilator', 'stun', 'reconstruction', 'swift', 'sloth', 
  'hide-and-seek', 'gang', 'landmine'
] as const;
export type VirusType = typeof VIRUS_TYPES[number];


// 단어의 타입을 정의합니다.
export interface Word {
  id: number;
  text: string;
  x: number; // 0-11 사이의 컬럼 인덱스
  y: number; // 화면 상단으로부터의 Y 좌표 (px)
  isSpecial?: boolean; // 바이러스 발동을 위한 특별 단어 여부
  isHidden?: boolean; // 숨바꼭질 바이러스에 의해 숨김 처리되었는지 여부
}

// 지뢰의 타입을 정의합니다.
export interface Landmine {
  id: number;
  x: number; // 0-11 사이의 컬럼 인덱스
  y: number; // 화면 상단으로부터의 Y 좌표 (px)
}

let wordId = 0;

export const useGameLogic = (profile: Profile, startStage: number) => {

  const [inputValue, setInputValue] = useState('');
  const [score, setScore] = useState(0);
  const [remainingBlocks, setRemainingBlocks] = useState(12);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'stageClear', 'gameOver'

  const [stage, setStage] = useState(startStage); // 초기 스테이지를 prop으로 설정

  const [activeVirus, setActiveVirus] = useState<{ type: VirusType | null; duration: number }>({ type: null, duration: 0 });


  const gameAreaRef = useRef<HTMLDivElement>(null);
  const didGenerateInitialWord = useRef(false);
  const virusActivationTimer = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient(); // QueryClient 인스턴스 가져오기

  const { data: stageSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['stageSettings', stage],
    queryFn: () => fetchStageSettings(stage),
    staleTime: Infinity,
    enabled: gameStatus !== 'gameOver',
  });

  // 굼벵이 바이러스를 위해 1단계 설정값을 미리 가져와 캐시해 둡니다.
  const { data: stage1Settings } = useQuery({
    queryKey: ['stageSettings', 1],
    queryFn: () => fetchStageSettings(1),
    staleTime: Infinity, // 한 번 받은 데이터는 계속 유지
    enabled: true, // 항상 활성화
  });



  const { mutate: submitScore, isSuccess: isScoreSubmitSuccess } = useMutation({
    mutationFn: updateHighScore,
    onSuccess: () => {
      // 점수 제출 성공 시, 랭킹 쿼리를 무효화하여 다시 불러오게 함
      queryClient.invalidateQueries({ queryKey: ['rankings', profile.nickname] });
    },
  });

  // --- Timers and Stage Management ---
  const handleStageClear = () => {
    // 게임 오버와 스테이지 클리어가 동시에 발생할 경우, 게임 오버가 우선되도록 방지
    if (gameStatus === 'playing') {
      setGameStatus('stageClear');
    }
  };

  const { 
    totalPlayTime,
    formattedTotalPlayTime,
    resetStageTime,
    formatTime
  } = useGameTimers(
    gameStatus, 
    handleStageClear, 
    stageSettings?.clear_duration_seconds
  );

  const handleWordDestroyed = (word: Word) => {
    setScore(prev => prev + calculateKeystrokes(word.text) * stage * 10);
  };

  // --- Word Management ---
  const { words, landmines, removeWordsByText, clearWords, spawnWords, toggleWordsVisibility, addLandmine } = useWordManager(
    gameStatus,
    stage,
    gameAreaRef,
    (count) => setRemainingBlocks(prev => prev - count),
    handleWordDestroyed, // 지뢰에 의해 단어가 파괴되었을 때 호출될 콜백
    activeVirus,
    stage1Settings
  );

  // --- Timers and Stage/Game Status Management ---
  useEffect(() => {
    if (gameStatus === 'stageClear') {
      const countdownTimer = setTimeout(() => {
        setStage(prev => prev + 1);
        resetStageTime();
        clearWords();
        setInputValue('');
        setActiveVirus({ type: null, duration: 0 }); // 바이러스 상태 초기화
        setGameStatus('playing');
      }, 5000);
      return () => clearTimeout(countdownTimer);
    }
  }, [gameStatus, resetStageTime, clearWords]);

  // 바이러스 효과 지속시간 타이머
  useEffect(() => {
    if (activeVirus.type && activeVirus.duration > 0) {
      const timer = setTimeout(() => {
        setActiveVirus(prev => ({ ...prev, duration: prev.duration - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (activeVirus.type && activeVirus.duration <= 0) {
      // 시간이 다 되면 바이러스 비활성화
      if (activeVirus.type === 'hide-and-seek') {
        toggleWordsVisibility(false);
      }
      setActiveVirus({ type: null, duration: 0 });
    }
  }, [activeVirus, toggleWordsVisibility]);

  // 바이러스 발동 효과 처리
  useEffect(() => {
    // 바이러스가 활성화되는 순간에만 효과를 적용합니다.
    if (!activeVirus.type) return;

    switch (activeVirus.type) {
      case 'reconstruction':
        setRemainingBlocks(12);
        break;
      
      case 'annihilator':
        clearWords();
        break;

      case 'gang':
        spawnWords(5);
        break;

      case 'hide-and-seek':
        toggleWordsVisibility(true);
        break;
    }
  }, [activeVirus.type, clearWords, spawnWords, toggleWordsVisibility]); // 바이러스 '타입'이 바뀔 때만 실행

  // 게임오버 처리
  useEffect(() => {
    if (remainingBlocks <= 0 && gameStatus !== 'gameOver') {
      setGameStatus('gameOver');
      submitScore({ 
        nickname: profile.nickname,
        play_at: formatTime(totalPlayTime),
        score: score
      });
    }
  }, [remainingBlocks, gameStatus, profile, score, totalPlayTime, submitScore, formatTime]);


  // --- User Input Handling ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || gameStatus !== 'playing') return;

    const typedWord = words.find(w => w.text === trimmedInput);

    // 숨겨진 단어를 맞혔을 경우, 즉시 바이러스 해제
    if (typedWord?.isHidden) {
      toggleWordsVisibility(false);
      setActiveVirus({ type: null, duration: 0 });
    }

    // 점수 계산 로직을 콜백 함수 안으로 이동
    removeWordsByText(trimmedInput, (removedWords) => {
      if (removedWords.length === 0) return;

      setScore(prev => prev + (removedWords.length * calculateKeystrokes(trimmedInput) * stage * 10));
      
      // 지워진 단어 중에 특별 단어가 있었는지 확인
      const specialWord = removedWords.find(w => w.isSpecial);

      if (specialWord) {
        // 이전 바이러스 발동 예약을 취소
        if (virusActivationTimer.current) {
          clearTimeout(virusActivationTimer.current);
        }

        const testViruses: VirusType[] = ['reconstruction', 'annihilator', 'gang', 'stun', 'swift', 'sloth', 'hide-and-seek', 'landmine'];
        const virus = testViruses[Math.floor(Math.random() * testViruses.length)];
        // console.log('Virus chosen:', virus);

        // 짧은 시간(10ms) 후에 바이러스 발동을 예약
        virusActivationTimer.current = setTimeout(() => {
          let duration = 0;
          switch (virus) {
            case 'annihilator':
            case 'reconstruction':
            case 'gang':
              duration = 3;
              break;
            case 'landmine':
              // console.log('Landmine virus activated. Adding landmine.');
              addLandmine(specialWord.x, specialWord.y);
              duration = 3;
              break;
            case 'stun':
            case 'swift':
            case 'sloth':
            case 'hide-and-seek':
              duration = 5; // 5초간 지속
              break;
          }
          setActiveVirus({ type: virus, duration: duration });
        }, 10); // 10ms 디바운스
      }
    });

    setInputValue('');
  };

  return {
    words,
    inputValue,
    score,
    remainingBlocks,
    gameStatus,
    totalPlayTime: formattedTotalPlayTime,
    stage,
    activeVirus, // UI에서 바이러스 상태를 사용할 수 있도록 반환
    landmines, // 지뢰 상태를 렌더링을 위해 반환
    gameAreaRef,
    setInputValue,
    handleSubmit,
    isScoreSubmitSuccess, // 점수 제출 성공 여부 반환
  };
};