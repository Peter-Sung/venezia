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
  activeVirus: { type: VirusType | null; duration: number };
  totalPlayTime: number; // ms
  stageTime: number; // ms
  inputValue: string;
  wordList: string[]; // 현재 스테이지의 단어 목록
  wordIdCounter: number;
  landmineIdCounter: number;
  isQuitModalVisible: boolean;
  clearedWordsCount: number; // Added: Track number of cleared words
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
  activeVirus: { type: null, duration: 0 },
  totalPlayTime: 0,
  stageTime: 0,
  inputValue: '',
  wordIdCounter: 0,
  landmineIdCounter: 0,
  isQuitModalVisible: false,
  clearedWordsCount: 0,
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
      landmines: [],
      inputValue: '',
      activeVirus: { type: null, duration: 0 },
      stageTime: 0,
      clearedWordsCount: 0,
    }));
    // Note: The wordList for the new stage is fetched by useGameEffects
  },

  tick: (intervalMs) => {
    if (get().gameStatus !== 'playing') return;
    set(state => ({
      totalPlayTime: state.totalPlayTime + intervalMs,
      stageTime: state.stageTime + intervalMs,
    }));
  },

  moveWords: (pixelIncrement, gameAreaHeight) => {
    const { words, landmines, stage } = get();

    const result = moveWords(words, landmines, pixelIncrement, gameAreaHeight);

    if (result.collidedWordIds.size > 0) {
      let scoreToAdd = 0;
      // We need to find the words that collided to calculate score.
      // Since moveWords returns survivingWords, the collided ones are filtered out.
      // We iterate over the *original* words to find the collided ones.
      words.forEach(w => {
        if (result.collidedWordIds.has(w.id)) {
          scoreToAdd += calculateScore(w.text, stage);
        }
      });

      if (scoreToAdd > 0) get().addScore(scoreToAdd);
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

    const { newWords, nextId } = spawnWords(
      words,
      wordList,
      wordIdCounter,
      count,
      hasSpecialWord,
      isTimedVirusActive
    );

    if (newWords.length > 0) {
      set({ words: [...words, ...newWords], wordIdCounter: nextId });
    }
  },

  toggleWordsVisibility: (shouldHide) => {
    set(state => ({
      words: state.words.map(word => ({ ...word, isHidden: shouldHide }))
    }));
  },

  activateVirus: (virus, specialWord) => {
    const duration = getVirusDuration(virus);

    set({ activeVirus: { type: virus, duration } });

    if (virus === 'reconstruction') get().resetRemainingBlocks();
    if (virus === 'annihilator') get().clearWords();
    if (virus === 'gang') get().spawnWords(5);
    if (virus === 'hide-and-seek') get().toggleWordsVisibility(true);

    if (virus === 'landmine' && specialWord) {
      get().addLandmine(specialWord.x, specialWord.y);
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
      set({ activeVirus: { type: null, duration: 0 } });
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
      if (word.text === trimmedInput) {
        removed.push(word);
        return false;
      }
      return true;
    });

    if (removed.length > 0) {
      set({ words: remaining });

      const scoreToAdd = removed.reduce((acc, word) => acc + calculateScore(word.text, stage), 0);
      get().addScore(scoreToAdd);

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
        set({ activeVirus: { type: null, duration: 0 } });
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
