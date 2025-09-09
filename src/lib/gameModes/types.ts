// Interface for a game mode module

export interface BaseQuestion {
    swedishName: string;
    latinName: string;
    images?: string[];
    answer: string;
    [key: string]: any;
}

export interface GameMode<Q extends BaseQuestion = BaseQuestion> {
    id: string; // Unique identifier for the mode
    label: string; // Human-readable label
    generateQuestions: (plants: any[]) => Q[]; // Function to generate questions for this mode
    checkAnswer: (question: Q, userAnswer: string) => boolean; // Function to check if an answer is correct
    getOptions: (questions: Q[], current: number) => string[]; // Function to generate options for the current question
    // Optionally, you can add a custom Svelte component for rendering questions/answers
    // component?: typeof SvelteComponent;
}
