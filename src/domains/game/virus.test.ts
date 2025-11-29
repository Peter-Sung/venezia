import { describe, it, expect } from 'vitest';
import { getVirusDuration, isTimedVirus } from './virus';

describe('virus', () => {
    describe('getVirusDuration', () => {
        it('should return 3 seconds for instant/short viruses', () => {
            expect(getVirusDuration('annihilator')).toBe(3);
            expect(getVirusDuration('landmine')).toBe(3);
        });

        it('should return 5 seconds for timed viruses', () => {
            expect(getVirusDuration('stun')).toBe(5);
            expect(getVirusDuration('swift')).toBe(5);
        });
    });

    describe('isTimedVirus', () => {
        it('should identify timed viruses correctly', () => {
            expect(isTimedVirus('stun')).toBe(true);
            expect(isTimedVirus('annihilator')).toBe(false);
        });
    });
});
