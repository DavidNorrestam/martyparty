import type { GameMode, BaseQuestion } from './types';

interface ImageToNameQuestion extends BaseQuestion {
    images: string[];
    swedishName: string;
    latinName: string;
}

export const imageToNameFreetext: GameMode<ImageToNameQuestion> = {
    id: 'imageToNameFreetext',
    label: 'Image to name (freetext)',
    generateQuestions: (plants: any[]) => {
        // Shuffle and use all plants for questions
        const shuffled = [...plants].sort(() => Math.random() - 0.5);
        return shuffled.map((plant: any) => ({
            images: plant.images || [],
            swedishName: plant.swedishName || plant.swedish || '',
            latinName: plant.latinName || plant.latin || '',
            answer: '',
        }));
    },
    checkAnswer: (question, userAnswer: string) => {
        // userAnswer is expected to be a JSON string: { swedish: string, latin: string }
        let parsed: { swedish?: string; latin?: string } = {};
        try {
            parsed = JSON.parse(userAnswer);
        } catch {
            return false;
        }

        // Helper to normalize strings:
        // - Remove diacritics (accents)
        // - Remove punctuation/special characters (but keep spaces)
        // - Collapse multiple spaces, trim, and lowercase
        const normalize = (str: string) =>
            str
                .normalize('NFD') // split accents from letters
                .replace(/[\u0300-\u036f]/g, '') // remove diacritics
                .replace(/[^a-z0-9 ]/gi, '') // remove all non-alphanumeric except space
                .replace(/\s+/g, ' ') // collapse multiple spaces
                .trim()
                .toLowerCase();

        const swedishQ = question.swedishName || '';
        const latinQ = question.latinName || '';
        const swedishA = parsed.swedish || '';
        const latinA = parsed.latin || '';
        const swedishCorrect = normalize(swedishA) === normalize(swedishQ);
        const latinCorrect = normalize(latinA) === normalize(latinQ);
        return swedishCorrect && latinCorrect;
    },
    getOptions: () => [], // No options for freetext mode
};
