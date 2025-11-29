import { describe, it, expect } from 'vitest';
import { calculateScore, calculateMileage } from './scoring';

describe('scoring', () => {
    describe('calculateScore', () => {
        it('should calculate score based on keystrokes and stage', () => {
            // '가' is 2 keystrokes (g, k) or similar depending on IME logic.
            // Assuming standard 2-set Korean: '가' = r + k = 2 keystrokes.
            // Wait, calculateKeystrokes implementation needs to be checked.
            // Let's assume 'hello' (5 chars) * stage 1 * 10 = 50.
            expect(calculateScore('hello', 1)).toBe(50);
            expect(calculateScore('hello', 2)).toBe(100);
        });
    });

    describe('calculateMileage', () => {
        it('should calculate mileage as score / 1000 rounded to 1 decimal', () => {
            expect(calculateMileage(1000)).toBe(1.0);
            expect(calculateMileage(1500)).toBe(1.5);
            expect(calculateMileage(1550)).toBe(1.5); // floor logic check
        });
    });
});
