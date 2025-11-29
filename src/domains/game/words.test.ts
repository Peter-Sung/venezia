import { describe, it, expect } from 'vitest';
import { moveWords, spawnWords } from './words';
import { Word, Landmine } from '../types';

describe('words', () => {
    describe('moveWords', () => {
        it('should move words by pixelIncrement', () => {
            const words: Word[] = [{ id: 1, text: 'test', x: 0, y: 10, isSpecial: false }];
            const landmines: Landmine[] = [];
            const result = moveWords(words, landmines, 5, 500);

            expect(result.survivingWords[0].y).toBe(15);
            expect(result.fallenCount).toBe(0);
        });

        it('should detect collision with landmines', () => {
            const words: Word[] = [{ id: 1, text: 'test', x: 0, y: 100, isSpecial: false }];
            // Landmine at same x, slightly below
            const landmines: Landmine[] = [{ id: 1, x: 0, y: 120 }];

            // Move word down by 10px -> y=110. Word height 30 -> bottom 140.
            // Landmine y=120. Overlap!
            const result = moveWords(words, landmines, 10, 500);

            expect(result.collidedWordIds.has(1)).toBe(true);
            expect(result.collidedLandmineIds.has(1)).toBe(true);
            expect(result.survivingWords.length).toBe(0); // Should be removed
        });

        it('should count fallen words', () => {
            const words: Word[] = [{ id: 1, text: 'test', x: 0, y: 490, isSpecial: false }];
            // Move past 500
            const result = moveWords(words, [], 20, 500);

            expect(result.fallenCount).toBe(1);
            expect(result.survivingWords.length).toBe(0);
        });
    });

    describe('spawnWords', () => {
        it('should spawn requested number of words if space available', () => {
            const words: Word[] = [];
            const wordList = ['apple', 'banana'];
            const result = spawnWords(words, wordList, 0, 2, false, false);

            expect(result.newWords.length).toBe(2);
            expect(result.nextId).toBe(2);
        });

        it('should not spawn on occupied columns', () => {
            // Occupy all columns except 1
            const words: Word[] = Array.from({ length: 11 }, (_, i) => ({
                id: i, text: 'test', x: i, y: 50, isSpecial: false
            }));

            const result = spawnWords(words, ['test'], 100, 5, false, false);

            // Only 1 column (index 11) is free
            expect(result.newWords.length).toBe(1);
            expect(result.newWords[0].x).toBe(11);
        });
    });
});
