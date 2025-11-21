export interface Plant {
    swedishName: string;
    latinName: string;
    images?: string[];
    taxonPhotos?: string[];
    observationPhotos?: string[];
    manualPhotos?: string[];
    [key: string]: unknown;
}

export interface QuizAnswer<Q extends BaseQuestion = BaseQuestion> {
    answer: string;
    correct: boolean;
    question: Q;
}

export interface QuizState<Q extends BaseQuestion = BaseQuestion> {
    questions: Q[];
    current: number;
    score: number;
    answers: QuizAnswer<Q>[];
    finished: boolean;
    mode?: GameMode<Q>;
}

export interface BaseQuestion {
    swedishName: string;
    latinName: string;
    images?: string[];
    answer: string;
}

export interface GameMode<Q extends BaseQuestion = BaseQuestion> {
    id: string;
    label: string;
    generateQuestions: (plants: Plant[]) => Q[];
    checkAnswer: (question: Q, answer: string) => boolean;
    getOptions: (questions: Q[], current: number) => string[];
}
