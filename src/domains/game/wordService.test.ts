import { describe, it, expect, vi } from 'vitest';
import { getWordsForStage } from './wordService';
import * as queries from '../../lib/queries';

// Mock the queries module
vi.mock('../../lib/queries', () => ({
    fetchWordsForStage: vi.fn(),
}));

describe('wordService', () => {
    describe('getWordsForStage', () => {
        it('should delegate to fetchWordsForStage query', async () => {
            const mockWords = ['apple', 'banana'];
            vi.mocked(queries.fetchWordsForStage).mockResolvedValue(mockWords);

            const words = await getWordsForStage(1);

            expect(words).toEqual(mockWords);
            expect(queries.fetchWordsForStage).toHaveBeenCalledWith(1);
        });

        it('should handle errors from query', async () => {
            const error = new Error('Network error');
            vi.mocked(queries.fetchWordsForStage).mockRejectedValue(error);

            await expect(getWordsForStage(1)).rejects.toThrow('Network error');
        });
    });
});
