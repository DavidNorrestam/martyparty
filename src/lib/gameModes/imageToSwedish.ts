import type { GameMode } from './types';

// Example implementation for "Image → Swedish name" mode
export const imageToSwedish: GameMode = {
    id: 'image-to-swedish',
    label: 'Image → Swedish name',
    generateQuestions(plants) {
        // Shuffle and use all plants for questions
        const shuffled = [...plants].sort(() => Math.random() - 0.5);
        return shuffled.map(plant => ({
            ...plant,
            images: plant.images || [], // Ensure images array exists
            answer: plant.swedishName
        }));
    },
    checkAnswer(question, userAnswer) {
        // Case-insensitive comparison, trim whitespace
        return userAnswer.trim().toLowerCase() === question.swedishName.trim().toLowerCase();
    },
    getOptions(questions, current) {
        const correct = questions[current].answer;
        const all = questions.map(q => q.answer);
        const options = [correct];
        while (options.length < 4 && all.length > options.length) {
            const candidate = all[Math.floor(Math.random() * all.length)];
            if (!options.includes(candidate)) options.push(candidate);
        }
        return options.sort(() => Math.random() - 0.5);
    }
};
