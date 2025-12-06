import { create } from 'zustand';
import { Word, Landmine, VirusType, VIRUS_TYPES } from '../domains/types';
import { calculateScore } from '../domains/game/scoring';
import { getVirusDuration } from '../domains/game/virus';
import { moveWords, spawnWords } from '../domains/game/words';

// 게임의 다양한 상태를 정의합니다.
type GameStatus = 'welcome' | 'playing' | 'stageClear' | 'gameOver';

// Zustand 스토어의 상태(State) 타입을 정의합니다.
interface GameState {
  gameStatus: GameStatus;
  stage: number;
  score: number;
  remainingBlocks: number;
  words: Word[];
  landmines: Landmine[];
  activeVirus: { type: VirusType | null; duration: number; hasSpawned: boolean };
  totalPlayTime: number; // ms
  stageTime: number; // ms
  inputValue: string;
  wordList: string[]; // 현재 스테이지의 단어 목록
  wordIdCounter: number;
  landmineIdCounter: number;
  isQuitModalVisible: boolean;
  clearedWordsCount: number; // Added: Track number of cleared words
  floatingScores: FloatingScore[];
}

interface FloatingScore {
  id: number;
  x: number;
  y: number;
  score: number;
  createdAt: number;
}

// Zustand 스토어의 액션(Actions) 타입을 정의합니다.
interface GameActions {
  // Game Status
  setGameStatus: (status: GameStatus) => void;
  startGame: (startStage: number, initialWordList: string[]) => void;
  nextStage: () => void;

  // Modals
  showQuitModal: () => void;
  hideQuitModal: () => void;

  // Input
  setInputValue: (value: string) => void;
  submitInputValue: () => void;

  // Score & Blocks
  addScore: (amount: number) => void;
  decreaseRemainingBlocks: (count: number) => void;

  // Timers
  tick: (intervalMs: number) => void;

  // Words
  setWordList: (list: string[]) => void;
  clearWords: () => void;
  spawnWords: (count: number) => void;
  moveWords: (pixelIncrement: number, gameAreaHeight: number) => void;
  toggleWordsVisibility: (shouldHide: boolean) => void;

  // Landmines
  addLandmine: (x: number, y: number) => void;

  // Virus
  activateVirus: (virus: VirusType, specialWord?: Word) => void;
  decrementVirusDuration: () => void;
  resetRemainingBlocks: () => void; // reconstruction 바이러스용
}

// 초기 상태를 정의합니다.
const initialState: Omit<GameState, 'wordList'> = {
  gameStatus: 'welcome',
  stage: 1,
  score: 0,
  remainingBlocks: 12,
  words: [],
  landmines: [],
  activeVirus: { type: null, duration: 0, hasSpawned: false },
  totalPlayTime: 0,
  stageTime: 0,
  inputValue: '',
  wordIdCounter: 0,
  landmineIdCounter: 0,
  isQuitModalVisible: false,
  clearedWordsCount: 0,
  floatingScores: [],
};

// Zustand 스토어를 생성합니다.
export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...initialState,
  wordList: [],

  setGameStatus: (status) => set({ gameStatus: status }),
  setInputValue: (value) => set({ inputValue: value }),
  setWordList: (list) => {
    set({ wordList: list });
  },
  showQuitModal: () => set({ isQuitModalVisible: true }),
  hideQuitModal: () => set({ isQuitModalVisible: false }),

  startGame: (startStage, initialWordList) => {
    set({
      ...initialState,
      gameStatus: 'playing',
      stage: startStage,
      wordList: initialWordList,
      clearedWordsCount: 0,
    });
  },

  addScore: (amount) => set((state) => ({ score: state.score + amount })),

  decreaseRemainingBlocks: (count) => {
    const newCount = get().remainingBlocks - count;
    if (newCount <= 0) {
      set({ remainingBlocks: 0, gameStatus: 'gameOver' });
    } else {
      set({ remainingBlocks: newCount });
    }
  },

  resetRemainingBlocks: () => set({ remainingBlocks: 12 }),
  clearWords: () => set({ words: [] }),

  nextStage: () => {
    set((state) => ({
      stage: state.stage + 1,
      gameStatus: 'playing',
      words: [],
      // landmines: [], // Keep landmines from previous stage
      inputValue: '',
      activeVirus: { type: null, duration: 0, hasSpawned: false },
      stageTime: 0,
      clearedWordsCount: 0,
      floatingScores: [],
    }));
    // Note: The wordList for the new stage is fetched by useGameEffects
  },

  tick: (intervalMs) => {
    if (get().gameStatus !== 'playing') return;

    // Bomb Virus Logic: Decrement timer
    const { words } = get();
    let bombExploded = false;

    const nextWords = words.filter(word => {
      if (word.timer !== undefined) {
        word.timer -= intervalMs;
        if (word.timer <= 0) {
          bombExploded = true;
          return false; // Remove exploded bomb
        }
      }
      return true;
    });

    if (bombExploded) {
      get().decreaseRemainingBlocks(1);
    }

    set(state => ({
      words: nextWords.map(w => w.timer !== undefined ? { ...w } : w),
      totalPlayTime: state.totalPlayTime + intervalMs,
      stageTime: state.stageTime + intervalMs,
      floatingScores: state.floatingScores.filter(s => Date.now() - s.createdAt < 1000),
    }));
  },

  moveWords: (pixelIncrement, gameAreaHeight) => {
    const { words, landmines, stage } = get();

    const result = moveWords(words, landmines, pixelIncrement, gameAreaHeight);

    if (result.collidedWordIds.size > 0) {
      let scoreToAdd = 0;
      const newFloatingScores: FloatingScore[] = [];
      const now = Date.now();

      // We need to find the words that collided to calculate score.
      // Since moveWords returns survivingWords, the collided ones are filtered out.
      // We iterate over the *original* words to find the collided ones.
      words.forEach(w => {
        if (result.collidedWordIds.has(w.id)) {
          const wordScore = calculateScore(w.text, stage);
          scoreToAdd += wordScore;

          newFloatingScores.push({
            id: Math.random(),
            x: w.x,
            y: w.y,
            score: wordScore,
            createdAt: now,
          });
        }
      });

      if (scoreToAdd > 0) get().addScore(scoreToAdd);

      if (newFloatingScores.length > 0) {
        set(state => ({ floatingScores: [...state.floatingScores, ...newFloatingScores] }));
      }
    }

    if (result.fallenCount > 0) get().decreaseRemainingBlocks(result.fallenCount);

    const remainingLandmines = landmines.filter(l => !result.collidedLandmineIds.has(l.id));
    set({ words: result.survivingWords, landmines: remainingLandmines });
  },

  addLandmine: (x, y) => {
    set(state => ({
      landmines: [...state.landmines, { id: state.landmineIdCounter, x, y }],
      landmineIdCounter: state.landmineIdCounter + 1,
    }));
  },

  spawnWords: (count) => {
    const { words, wordIdCounter, wordList, activeVirus } = get();
    const TIMED_VIRUSES: VirusType[] = ['stun', 'swift', 'sloth', 'hide-and-seek'];
    const isTimedVirusActive = TIMED_VIRUSES.includes(activeVirus.type as VirusType);
    const hasSpecialWord = words.some(word => word.isSpecial);

    // Limit spawn for Math and Bomb to 1 time
    let virusTypeForSpawn = activeVirus.type;
    if (['math', 'bomb'].includes(activeVirus.type as string) && activeVirus.hasSpawned) {
      virusTypeForSpawn = null;
    }

    const { newWords, nextId } = spawnWords(
      words,
      wordList,
      wordIdCounter,
      count,
      hasSpecialWord,
      virusTypeForSpawn
    );

    if (newWords.length > 0) {
      const newState: Partial<GameState> = { words: [...words, ...newWords], wordIdCounter: nextId };

      // Mark as spawned if we just generated words under math/bomb influence
      if (['math', 'bomb'].includes(activeVirus.type as string) && !activeVirus.hasSpawned) {
        newState.activeVirus = { ...activeVirus, hasSpawned: true };
      }

      set(newState);
    }
  },

  toggleWordsVisibility: (shouldHide) => {
    set(state => ({
      words: state.words.map(word => ({ ...word, isHidden: shouldHide }))
    }));
  },

  activateVirus: (virus, specialWord) => {
    const duration = getVirusDuration(virus);

    set({ activeVirus: { type: virus, duration, hasSpawned: false } });

    if (virus === 'reconstruction') get().resetRemainingBlocks();
    if (virus === 'reconstruction') get().resetRemainingBlocks();

    if (virus === 'annihilator') {
      const { words, stage } = get();
      if (words.length > 0) {
        let scoreToAdd = 0;
        const newFloatingScores: FloatingScore[] = [];
        const now = Date.now();

        words.forEach(w => {
          const wordScore = calculateScore(w.text, stage);
          scoreToAdd += wordScore;

          newFloatingScores.push({
            id: Math.random(),
            x: w.x,
            y: w.y,
            score: wordScore,
            createdAt: now,
          });
        });

        get().addScore(scoreToAdd);
        set(state => ({
          floatingScores: [...state.floatingScores, ...newFloatingScores],
          clearedWordsCount: state.clearedWordsCount + words.length // Should annihilator count as cleared? Assuming yes based on "score received" context
        }));
      }
      get().clearWords();
    }
    if (virus === 'gang') get().spawnWords(5);
    if (virus === 'hide-and-seek') get().toggleWordsVisibility(true);

    if (virus === 'landmine' && specialWord) {
      get().addLandmine(specialWord.x, specialWord.y);
    }

    if (virus === 'landmine-field') {
      const { words, landmineIdCounter, landmines } = get();
      let currentId = landmineIdCounter;

      const newLandmines: Landmine[] = [];

      // Convert all existing words to landmines
      words.forEach(w => {
        newLandmines.push({ id: currentId++, x: w.x, y: w.y });
      });

      // Also convert the triggered special word to landmine
      if (specialWord) {
        newLandmines.push({ id: currentId++, x: specialWord.x, y: specialWord.y });
      }

      set({
        words: [], // Clear all words
        landmines: [...landmines, ...newLandmines],
        landmineIdCounter: currentId
      });
    }
  },

  decrementVirusDuration: () => {
    const { activeVirus, toggleWordsVisibility } = get();
    if (!activeVirus.type || activeVirus.duration <= 0) return;

    const newDuration = activeVirus.duration - 1;
    if (newDuration <= 0) {
      if (activeVirus.type === 'hide-and-seek') {
        toggleWordsVisibility(false);
      }
      set({ activeVirus: { type: null, duration: 0, hasSpawned: false } });
    } else {
      set({ activeVirus: { ...activeVirus, duration: newDuration } });
    }
  },

  submitInputValue: () => {
    const { inputValue, words, stage, toggleWordsVisibility, activateVirus } = get();
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;

    const removed: Word[] = [];
    const remaining = words.filter(word => {
      if (word.mathAnswer !== undefined) {
        if (word.mathAnswer.toString() === trimmedInput) {
          removed.push(word);
          return false;
        }
      } else if (word.text === trimmedInput) {
        removed.push(word);
        return false;
      }
      return true;
    });

    if (removed.length > 0) {
      set({ words: remaining });

      let scoreToAdd = 0;
      const newFloatingScores: FloatingScore[] = [];
      const now = Date.now();

      removed.forEach(word => {
        let wordScore = calculateScore(word.text, stage);

        // Math Virus Score Logic: Answer * 100
        if (word.mathAnswer !== undefined) {
          wordScore = word.mathAnswer * 100;
        }

        // Add floating score for ALL words
        newFloatingScores.push({
          id: Math.random(), // Simple ID
          x: word.x,
          y: word.y,
          score: wordScore,
          createdAt: now,
        });

        scoreToAdd += wordScore;
      });

      get().addScore(scoreToAdd);

      if (newFloatingScores.length > 0) {
        set(state => ({ floatingScores: [...state.floatingScores, ...newFloatingScores] }));
      }

      const specialWord = removed.find(w => w.isSpecial);
      if (specialWord) {
        const virus = VIRUS_TYPES[Math.floor(Math.random() * VIRUS_TYPES.length)];
        activateVirus(virus, specialWord);
      } else {
        set(state => ({ clearedWordsCount: state.clearedWordsCount + 1 }));
      }

      const hiddenWord = removed.find(w => w.isHidden);
      if (hiddenWord) {
        toggleWordsVisibility(false);
        set({ activeVirus: { type: null, duration: 0, hasSpawned: false } });
      }
    }

    set({ inputValue: '' });
  },
}));

export const formatTime = (timeInMs: number) => {
  const totalSeconds = Math.floor(timeInMs / 1000);
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  const milliseconds = Math.floor((timeInMs % 1000) / 100).toString().padStart(1, '0');
  return `${minutes}:${seconds}.${milliseconds}`;
};

export const useFormattedTime = () => useGameStore(state => formatTime(state.totalPlayTime));
