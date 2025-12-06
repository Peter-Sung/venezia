import { Word, Landmine, VirusType } from '../types';

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
            // Penalty applies if it's NOT special AND has NO timer (Bomb words don't have drop penalty)
            if (!word.isSpecial && word.timer === undefined) fallenCount++;
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
    activeVirusType: VirusType | null
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

    // Check if timed virus is active (for special word logic)
    const TIMED_VIRUSES: VirusType[] = ['stun', 'swift', 'sloth', 'hide-and-seek'];
    const isTimedVirusActive = activeVirusType && TIMED_VIRUSES.includes(activeVirusType);

    for (let i = 0; i < spawnCount; i++) {
        let text = wordList[Math.floor(Math.random() * wordList.length)];
        let mathAnswer: number | undefined;
        let isSpecial = !hasSpecialWord && !isTimedVirusActive && Math.random() < 0.15;

        // Math Virus Logic
        if (activeVirusType === 'math') {
            // Generate Math Problem
            const isPlus = Math.random() < 0.5;
            let a, b, result;

            if (isPlus) {
                // A + B <= 50
                result = Math.floor(Math.random() * 49) + 2; // 2 to 50
                a = Math.floor(Math.random() * (result - 1)) + 1;
                b = result - a;
                text = `${a} + ${b}`;
            } else {
                // A - B > 0, A <= 50
                a = Math.floor(Math.random() * 49) + 2; // 2 to 50
                b = Math.floor(Math.random() * (a - 1)) + 1;
                result = a - b;
                text = `${a} - ${b}`;
            }
            mathAnswer = result;
            mathAnswer = result;
            isSpecial = false; // Math words are normal words (penalty applies), just with a math question
        } else if (activeVirusType === 'bomb') {
            // Bomb Virus Logic
            isSpecial = false; // Bomb words look normal and don't trigger chain viruses
            // Timer is set in the object below
        }

        newWords.push({
            id: currentWordId++,
            text: text,
            x: availableColumns[i],
            y: 0,
            isSpecial: isSpecial,
            mathAnswer: mathAnswer,
            timer: activeVirusType === 'bomb' ? 10000 : undefined,
            maxTimer: activeVirusType === 'bomb' ? 10000 : undefined,
        });
    }

    return { newWords, nextId: currentWordId };
};
