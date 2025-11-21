
import { writable } from 'svelte/store';
import type { GameMode, BaseQuestion, Plant, QuizAnswer, QuizState } from '../types';


function createQuizStore() {
    const { subscribe, set, update } = writable<QuizState>({
        questions: [],
        current: 0,
        score: 0,
        answers: [],
        finished: false,
        mode: undefined
    });

    return {
        subscribe,
        /**
         * Start a new quiz with the selected game mode
         * @param plants Plant data
         * @param mode GameMode object
         */
        start: (plants: Plant[], mode: GameMode) => {
            const questions = mode.generateQuestions(plants);
            set({
                questions,
                current: 0,
                score: 0,
                answers: [],
                finished: false,
                mode
            });
        },
        /**
         * Submit an answer for the current question
         * @param answer User's answer
         */
        answer: (answer: string) => update(state => {
            if (!state.mode) return state;
            const currentQuestion = state.questions[state.current];
            const correct = state.mode.checkAnswer(currentQuestion, answer);
            const score = state.score + (correct ? 1 : 0);
            const answers = [
                ...state.answers,
                { answer, correct, question: currentQuestion }
            ];
            const finished = state.current + 1 >= state.questions.length;
            return {
                ...state,
                current: state.current + 1,
                score,
                answers,
                finished
            };
        }),
        reset: () => set({
            questions: [],
            current: 0,
            score: 0,
            answers: [],
            finished: false,
            mode: undefined
        })
    };
}

export const quiz = createQuizStore();
