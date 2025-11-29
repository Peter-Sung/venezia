import { calculateKeystrokes } from '../ime';

export const calculateScore = (word: string, stage: number): number => {
    return calculateKeystrokes(word) * stage * 10;
};

export const calculateMileage = (score: number): number => {
    return Math.floor((score / 1000) * 10) / 10;
};
