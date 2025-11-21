import { describe, it, expect, beforeEach } from 'vitest';
import { quiz } from './quiz';
import type { Plant } from '../types';
import { get } from 'svelte/store';

// Mock game mode for testing
const mockMode = {
    id: 'test-mode',
    label: 'Test Mode',
    generateQuestions: (plants: Plant[]) => {
        return plants.map((plant) => ({
            swedishName: plant.swedishName,
            latinName: plant.latinName,
            answer: plant.latinName
        }));
    },
    checkAnswer: (question: { answer: string }, answer: string) => {
        return question.answer === answer;
    },
    getOptions: () => ['Option 1', 'Option 2', 'Option 3']
};

const mockPlants: Plant[] = [
    { swedishName: 'Alunrot', latinName: 'Heuchera sp.' },
    { swedishName: 'Bergenia', latinName: 'Bergenia sp.' },
    { swedishName: 'Funkia', latinName: 'Hosta sp.' }
];

describe('quiz store', () => {
    beforeEach(() => {
        quiz.reset();
    });

    it('should initialize with empty state', () => {
        const state = get(quiz);
        expect(state.questions).toEqual([]);
        expect(state.current).toBe(0);
        expect(state.score).toBe(0);
        expect(state.answers).toEqual([]);
        expect(state.finished).toBe(false);
    });

    it('should start a quiz with generated questions', () => {
        quiz.start(mockPlants, mockMode);
        const state = get(quiz);

        expect(state.questions.length).toBe(3);
        expect(state.current).toBe(0);
        expect(state.score).toBe(0);
        expect(state.mode).toBe(mockMode);
        expect(state.finished).toBe(false);
    });

    it('should handle correct answer', () => {
        quiz.start(mockPlants, mockMode);
        const initialState = get(quiz);
        const correctAnswer = initialState.questions[0].answer;

        quiz.answer(correctAnswer);
        const state = get(quiz);

        expect(state.score).toBe(1);
        expect(state.current).toBe(1);
        expect(state.answers.length).toBe(1);
        expect(state.answers[0].correct).toBe(true);
    });

    it('should handle incorrect answer', () => {
        quiz.start(mockPlants, mockMode);

        quiz.answer('Wrong Answer');
        const state = get(quiz);

        expect(state.score).toBe(0);
        expect(state.current).toBe(1);
        expect(state.answers.length).toBe(1);
        expect(state.answers[0].correct).toBe(false);
    });

    it('should finish quiz after all questions answered', () => {
        quiz.start(mockPlants, mockMode);

        // Answer all questions
        quiz.answer('Answer 1');
        quiz.answer('Answer 2');
        quiz.answer('Answer 3');

        const state = get(quiz);
        expect(state.finished).toBe(true);
        expect(state.current).toBe(3);
        expect(state.answers.length).toBe(3);
    });

    it('should reset quiz state', () => {
        quiz.start(mockPlants, mockMode);
        quiz.answer('Answer 1');

        quiz.reset();
        const state = get(quiz);

        expect(state.questions).toEqual([]);
        expect(state.current).toBe(0);
        expect(state.score).toBe(0);
        expect(state.answers).toEqual([]);
        expect(state.finished).toBe(false);
        expect(state.mode).toBeUndefined();
    });
});
