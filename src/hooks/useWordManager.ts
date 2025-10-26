import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWordsForStage, fetchStageSettings } from '../lib/queries';
import { Word, VirusType, Landmine } from './useGameLogic';
import { StageSettings } from '../lib/queries'; // StageSettings 타입을 가져옵니다.

let wordId = 0;
let landmineId = 0;

export const useWordManager = (
  gameStatus: 'playing' | 'stageClear' | 'gameOver',
  stage: number,
  gameAreaRef: React.RefObject<HTMLDivElement>,
  onWordFall: (count: number) => void,
  onWordDestroyed: (word: Word) => void,
  activeVirus: { type: VirusType | null; duration: number },
  stage1Settings: StageSettings | undefined
) => {
  const [words, setWords] = useState<Word[]>([]);
  const [landmines, setLandmines] = useState<Landmine[]>([]);
  const didGenerateInitialWord = useRef(false);

  // Stale Closure 문제를 해결하기 위해 activeVirus 상태를 ref로 관리
  const activeVirusRef = useRef(activeVirus);
  useEffect(() => {
    activeVirusRef.current = activeVirus;
  }, [activeVirus]);

  const { data: wordList, isLoading: isLoadingWords } = useQuery({
    queryKey: ['words', stage],
    queryFn: () => fetchWordsForStage(stage),
    staleTime: Infinity,
    enabled: gameStatus !== 'gameOver',
  });

  const { data: stageSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['stageSettings', stage],
    queryFn: () => fetchStageSettings(stage),
    staleTime: Infinity,
    enabled: gameStatus !== 'gameOver',
  });

  // --- Game Loop (Word Movement & Landmine Collision) ---
  useEffect(() => {
    if (gameStatus !== 'playing' || !stageSettings) return;

    const gameAreaHeight = gameAreaRef.current?.offsetHeight;
    if (!gameAreaHeight) return;

    // --- 바이러스 효과에 따른 속도 계산 ---
    const isStunned = activeVirus.type === 'stun' && activeVirus.duration > 0;
    const isSwift = activeVirus.type === 'swift' && activeVirus.duration > 0;
    const isSloth = activeVirus.type === 'sloth' && activeVirus.duration > 0;

    const GAME_LOOP_INTERVAL = 50; // ms
    const ticksPerSecond = 1000 / GAME_LOOP_INTERVAL;
    const totalTicksToFall = stageSettings.fall_duration_seconds * ticksPerSecond;

    let effectiveTotalTicksToFall = totalTicksToFall;
    if (isSwift) {
      effectiveTotalTicksToFall = totalTicksToFall / 1.5;
    } else if (isSloth && stage1Settings) {
      effectiveTotalTicksToFall = stage1Settings.fall_duration_seconds * ticksPerSecond;
    }
    const pixelIncrement = isStunned ? 0 : gameAreaHeight / effectiveTotalTicksToFall;

    // --- 게임 루프 ---
    const gameLoop = setInterval(() => {
      const WORD_HEIGHT = 30; // 단어 높이 추정치
      const LANDMINE_HEIGHT = 20; // 지뢰 높이 추정치

      let fallenCount = 0;
      const collidedWordIds = new Set<number>();
      const collidedLandmineIds = new Set<number>();

      // 단어 이동 및 지뢰 충돌 감지
      const nextWords = words.map(word => {
        const newWord = { ...word, y: word.y + pixelIncrement };

        for (const landmine of landmines) {
          if (newWord.x === landmine.x) {
            const wordBottom = newWord.y + WORD_HEIGHT;
            const landmineTop = landmine.y;
            const landmineBottom = landmine.y + LANDMINE_HEIGHT;

            if (wordBottom >= landmineTop && newWord.y <= landmineBottom) {
              collidedWordIds.add(newWord.id);
              collidedLandmineIds.add(landmine.id);
              onWordDestroyed(newWord);
            }
          }
        }
        return newWord;
      });
      
      // 바닥에 닿거나 충돌한 단어 처리
      const survivingWords = nextWords.filter(word => {
        if (collidedWordIds.has(word.id)) return false; // 지뢰와 충돌한 단어 제거
        if (word.y > gameAreaHeight) {
          if (!word.isSpecial) {
            fallenCount++;
          }
          return false; // 화면 밖으로 나간 단어 제거
        }
        return true;
      });

      if (fallenCount > 0) {
        onWordFall(fallenCount);
      }

      // 충돌한 지뢰 제거
      const remainingLandmines = landmines.filter(l => !collidedLandmineIds.has(l.id));
      
      setWords(survivingWords);
      setLandmines(remainingLandmines);

    }, GAME_LOOP_INTERVAL);

    return () => clearInterval(gameLoop);
  }, [gameStatus, stageSettings, words, landmines, gameAreaRef, onWordFall, onWordDestroyed, activeVirus, stage1Settings]);

  // --- Word Generation ---
  useEffect(() => {
    if (gameStatus !== 'playing' || isLoadingWords || isLoadingSettings || !stageSettings) {
      didGenerateInitialWord.current = false;
      return;
    }

    const generateWord = () => {
      if (!wordList || wordList.length === 0) return;

      // 마취 바이러스가 활성화된 동안에는 새로운 단어를 생성하지 않음 (ref를 사용하여 최신 상태 참조)
      if (activeVirusRef.current.type === 'stun' && activeVirusRef.current.duration > 0) {
        return;
      }

      setWords(prevWords => {
        // 겹치지 않도록 비어있는 컬럼 확인 (Y < 100px)
        const wordsNearTop = prevWords.filter(w => w.y < 100);
        const occupiedColumns = new Set(wordsNearTop.map(w => w.x));
        const availableColumns = Array.from({ length: 12 }, (_, i) => i).filter(
          col => !occupiedColumns.has(col)
        );

        // 빈 컬럼이 없으면 단어 생성 안함
        if (availableColumns.length === 0) {
          return prevWords;
        }

        const hasSpecialWord = prevWords.some(word => word.isSpecial);
        const TIMED_VIRUSES: VirusType[] = ['stun', 'swift', 'sloth', 'hide-and-seek'];
        const isTimedVirusActive = TIMED_VIRUSES.includes(activeVirus.type as VirusType);

        const isSpecial = !hasSpecialWord && !isTimedVirusActive && Math.random() < 0.15;
        const randomText = wordList[Math.floor(Math.random() * wordList.length)];
        const randomX = availableColumns[Math.floor(Math.random() * availableColumns.length)];

        const newWord: Word = {
          id: wordId++,
          text: randomText,
          x: randomX, // 비어있는 컬럼 중 랜덤 위치
          y: 0,
          isSpecial: isSpecial,
          isHidden: false, // 새로 생성되는 단어는 항상 보이도록 설정
        };
        return [...prevWords, newWord];
      });
    };

    if (!didGenerateInitialWord.current) {
      generateWord();
      didGenerateInitialWord.current = true;
    }

    const spawnIntervalMs = stageSettings.spawn_interval_seconds * 1000;
    const wordGenerator = setInterval(generateWord, spawnIntervalMs);

    return () => clearInterval(wordGenerator);
  }, [gameStatus, isLoadingWords, isLoadingSettings, stageSettings, wordList]);

  // --- Word Management Functions ---
  const removeWordsByText = useCallback((text: string, onWordsRemoved: (removedWords: Word[]) => void): void => {
    setWords(prevWords => {
      const removed = prevWords.filter(word => word.text === text);
      if (removed.length > 0) {
        onWordsRemoved(removed);
      }
      return prevWords.filter(word => word.text !== text);
    });
  }, []);

  const clearWords = useCallback(() => {
    setWords([]);
  }, []);

  const toggleWordsVisibility = useCallback((shouldHide: boolean) => {
    setWords(prevWords => 
      prevWords.map(word => ({ ...word, isHidden: shouldHide }))
    );
  }, []);

  const spawnWords = useCallback((count: number) => {
    if (!wordList || wordList.length === 0) return;

    setWords(prevWords => {
      const newWords: Word[] = [];
      // Y < 100px 인 단어만 컬럼 체크
      const wordsNearTop = prevWords.filter(w => w.y < 100);
      const occupiedColumns = new Set(wordsNearTop.map(w => w.x));
      const availableColumns = Array.from({ length: 12 }, (_, i) => i).filter(
        col => !occupiedColumns.has(col)
      );

      // 셔플하여 랜덤한 위치에 단어 생성
      for (let i = availableColumns.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableColumns[i], availableColumns[j]] = [availableColumns[j], availableColumns[i]];
      }
      
      const spawnCount = Math.min(count, availableColumns.length);

      for (let i = 0; i < spawnCount; i++) {
        const randomText = wordList[Math.floor(Math.random() * wordList.length)];
        newWords.push({
          id: wordId++,
          text: randomText,
          x: availableColumns[i],
          y: 0,
          isSpecial: false, // 바이러스로 생성된 단어는 일반 단어
        });
      }
      return [...prevWords, ...newWords];
    });
  }, [wordList]);

  const addLandmine = useCallback((x: number, y: number) => {
    const newLandmine: Landmine = {
      id: landmineId++,
      x,
      y,
    };
    setLandmines(prev => [...prev, newLandmine]);
  }, []);

  return { words, landmines, removeWordsByText, clearWords, spawnWords, toggleWordsVisibility, addLandmine };
};