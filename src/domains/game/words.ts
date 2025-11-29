import { Word, Landmine } from '../types';

interface MoveWordsResult {
    survivingWords: Word[];
    fallenCount: number;
    collidedWordIds: Set<number>;
    collidedLandmineIds: Set<number>;
}

export const moveWords = (
    words: Word[],
    landmines: Landmine[],
    pixelIncrement: number,
    gameAreaHeight: number
): MoveWordsResult => {
    const WORD_HEIGHT = 30;
    const LANDMINE_HEIGHT = 20;

    let fallenCount = 0;
    const collidedWordIds = new Set<number>();
    const collidedLandmineIds = new Set<number>();

    const nextWords = words.map(word => {
        const newWord = { ...word, y: word.y + pixelIncrement };

        // Check collision with landmines
        for (const landmine of landmines) {
            if (newWord.x === landmine.x) {
                const wordBottom = newWord.y + WORD_HEIGHT;
                const landmineTop = landmine.y;
                const landmineBottom = landmine.y + LANDMINE_HEIGHT;
                if (wordBottom >= landmineTop && newWord.y <= landmineBottom) {
                    collidedWordIds.add(newWord.id);
                    collidedLandmineIds.add(landmine.id);
                }
            }
        }
        return newWord;
    });

    const survivingWords = nextWords.filter(word => {
        if (collidedWordIds.has(word.id)) return false;
        if (word.y > gameAreaHeight) {
            if (!word.isSpecial) fallenCount++;
            return false;
        }
        return true;
    });

    return {
        survivingWords,
        fallenCount,
        collidedWordIds,
        collidedLandmineIds,
    };
};

export const spawnWords = (
    words: Word[],
    wordList: string[],
    wordIdCounter: number,
    count: number,
    hasSpecialWord: boolean,
    isTimedVirusActive: boolean
): { newWords: Word[]; nextId: number } => {
    if (!wordList || wordList.length === 0) return { newWords: [], nextId: wordIdCounter };

    const newWords: Word[] = [];
    const wordsNearTop = words.filter(w => w.y < 100);
    const occupiedColumns = new Set(wordsNearTop.map(w => w.x));
    const availableColumns = Array.from({ length: 12 }, (_, i) => i).filter(
        col => !occupiedColumns.has(col)
    );

    // Shuffle available columns
    for (let i = availableColumns.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableColumns[i], availableColumns[j]] = [availableColumns[j], availableColumns[i]];
    }

    const spawnCount = Math.min(count, availableColumns.length);
    let currentWordId = wordIdCounter;

    for (let i = 0; i < spawnCount; i++) {
        const randomText = wordList[Math.floor(Math.random() * wordList.length)];
        const isSpecial = !hasSpecialWord && !isTimedVirusActive && Math.random() < 0.15;
        newWords.push({
            id: currentWordId++,
            text: randomText,
            x: availableColumns[i],
            y: 0,
            isSpecial: isSpecial,
        });
    }

    return { newWords, nextId: currentWordId };
};
