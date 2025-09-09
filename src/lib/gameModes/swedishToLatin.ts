import type { GameMode } from './types';

export const swedishToLatin: GameMode = {
    id: 'swedish-to-latin',
    label: 'Swedish name → Latin name',
    generateQuestions(plants) {
        // Shuffle and use all plants for questions
        const shuffled = [...plants].sort(() => Math.random() - 0.5);
        return shuffled.map(plant => ({
            ...plant,
            question: plant.swedishName,
            answer: plant.latinName
        }));
    },
    checkAnswer(question, userAnswer) {
        // Case-insensitive comparison, trim whitespace
        return userAnswer.trim().toLowerCase() === question.latinName.trim().toLowerCase();
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
