import { writable } from 'svelte/store';

export interface Plant {
    swedishName: string;
    latinName: string;
}

export interface QuizState {
    questions: Plant[];
    current: number;
    score: number;
    answers: string[];
    finished: boolean;
    images?: string[][]; // Array of image URLs per question (optional)
    mode?: 'latin' | 'image-to-swedish';
}

function createQuizStore() {
    const { subscribe, set, update } = writable<QuizState>({
        questions: [],
        current: 0,
        score: 0,
        answers: [],
        finished: false
    });

    return {
        subscribe,
        start: (questions: Plant[], images?: string[][], mode?: 'latin' | 'image-to-swedish') => set({
            questions,
            current: 0,
            score: 0,
            answers: [],
            finished: false,
            images: images || [],
            mode
        }),
        answer: (answer: string) => update(state => {
            // Determine mode from URL
            let mode: 'latin' | 'image-to-swedish' = 'latin';
            try {
                if (typeof window !== 'undefined') {
                    const urlMode = new URL(window.location.href).searchParams.get('mode');
                    if (urlMode === 'image-to-swedish') mode = 'image-to-swedish';
                }
            } catch { }
            let correct = false;
            if (mode === 'image-to-swedish') {
                correct = state.questions[state.current].swedishName === answer;
            } else {
                correct = state.questions[state.current].latinName === answer;
            }
            const score = state.score + (correct ? 1 : 0);
            const answers = [...state.answers, answer];
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
            images: [],
            mode: undefined
        })
    };
}

export const quiz = createQuizStore();
