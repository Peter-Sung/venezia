import { fetchWordsForStage } from '../../lib/queries';

/**
 * Retrieves the list of words for a specific stage.
 * This service layer abstracts the data source, allowing for future extensions
 * such as fetching user-specific words or mixing different word sources.
 * 
 * @param stage The stage level to fetch words for.
 * @param userId Optional user ID to fetch user-specific words in the future.
 * @returns A promise that resolves to an array of word strings.
 */
export const getWordsForStage = async (stage: number, userId?: string): Promise<string[]> => {
    // Future implementation:
    // if (userId) {
    //   const userWords = await fetchUserWords(userId);
    //   const commonWords = await fetchWordsForStage(stage);
    //   return [...commonWords, ...userWords];
    // }

    return fetchWordsForStage(stage);
};
