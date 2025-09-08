// --- UI Logic for showing/hiding screens and handling start ---
document.addEventListener('DOMContentLoaded', () => {
    // Since screens are loaded dynamically, we need to delegate event handling
    const app = document.getElementById('app')!;

    function loadScreen(screenFile: string) {
        return fetch(screenFile).then(res => res.text()).then(html => {
            app.innerHTML = html;
        });
    }

    // Bind start form event after loading start.html
    function bindStartForm() {
        const modeForm = document.getElementById('mode-form') as HTMLFormElement | null;
        if (modeForm) {
            modeForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                // Get selected mode from radio buttons
                const modeInput = modeForm.querySelector('input[name="game-mode"]:checked') as HTMLInputElement | null;
                let mode: PlantGameMode = PlantGameMode.SwedishToLatin;
                if (modeInput) {
                    if (modeInput.value === 'ImageToSwedishLatin') {
                        mode = PlantGameMode.ImageToSwedishLatin;
                    } else {
                        mode = PlantGameMode.SwedishToLatin;
                    }
                }
                await loadScreen('quiz.html');
                // Start game session and render first question
                const session = await startGame(mode);
                (window as any).currentSession = session;
                renderQuestion();
                bindAnswerForm();
            });
        }

        // Render the current question for the session
        function renderQuestion() {
            const session: GameSession = (window as any).currentSession;
            const questionNumberElem = document.getElementById('question-number');
            const questionContentElem = document.getElementById('question-content');
            const answerLabel = document.getElementById('answer-label');
            const answerInput = document.getElementById('answer-input') as HTMLInputElement | null;
            if (!session || !questionNumberElem || !questionContentElem || !answerLabel || !answerInput) return;

            questionNumberElem.textContent = (session.currentQuestion + 1).toString();
            const plant = session.questions[session.currentQuestion];

            // Always reset answer form to default (single input)
            const answerForm = document.getElementById('answer-form');
            if (answerForm) {
                answerForm.innerHTML = `
                    <label for="answer-input" id="answer-label">Your Answer:</label>
                    <input type="text" id="answer-input" name="answer" autocomplete="off" required>
                    <button type="submit" id="next-btn">Next</button>
                `;
            }

            if (session.mode === PlantGameMode.SwedishToLatin) {
                questionContentElem.innerHTML = `<strong>Swedish name:</strong> ${plant.swedishName}<br><div id="plant-image-container" style="margin:1em 0;"></div>`;
                const answerLabel = document.getElementById('answer-label');
                const answerInput = document.getElementById('answer-input') as HTMLInputElement | null;
                if (answerLabel) answerLabel.textContent = 'Latin name:';
                if (answerInput) {
                    answerInput.value = '';
                    answerInput.placeholder = 'Enter Latin name';
                    answerInput.focus();
                }
                // Fetch image from iNaturalist API using Latin name
                const latinName = plant.latinName;
                const imageContainer = document.getElementById('plant-image-container');
                if (imageContainer && latinName) {
                    imageContainer.innerHTML = '<span style="color:#888">Loading image...</span>';
                    fetch(`https://api.inaturalist.org/v1/search?q=${encodeURIComponent(latinName)}&sources=taxa`)
                        .then(res => res.json())
                        .then(data => {
                            let photoUrl = '';
                            if (data.results && data.results.length > 0 && data.results[0].record && data.results[0].record.default_photo) {
                                photoUrl = data.results[0].record.default_photo.medium_url || data.results[0].record.default_photo.url;
                            }
                            if (photoUrl) {
                                imageContainer.innerHTML = `<img src="${photoUrl}" alt="${latinName}" style="max-width:320px;max-height:200px;display:block;margin:auto;border-radius:8px;box-shadow:0 2px 8px #0001;">`;
                            } else {
                                imageContainer.innerHTML = '<span style="color:#888">No image found on iNaturalist.</span>';
                            }
                        })
                        .catch(() => {
                            imageContainer.innerHTML = '<span style="color:#888">Image failed to load.</span>';
                        });
                }
            } else {
                questionContentElem.innerHTML = 'Not implemented yet.';
            }
            // Always re-bind answer form after rendering question
            bindAnswerForm();
        }

        // Handle answer form submission and move to next question or finish
        function bindAnswerForm() {
            const answerForm = document.getElementById('answer-form') as HTMLFormElement | null;
            if (!answerForm) return;
            // Remove any previous event listeners by resetting the form's onsubmit
            answerForm.onsubmit = null;
            answerForm.onsubmit = async (e) => {
                e.preventDefault();
                const session: GameSession = (window as any).currentSession;
                if (!session) return;
                let answer: any = '';
                if (session.mode === PlantGameMode.ImageToSwedishLatin) {
                    const swedishInput = document.getElementById('swedish-input') as HTMLInputElement | null;
                    const latinInput = document.getElementById('latin-input') as HTMLInputElement | null;
                    if (!swedishInput || !latinInput) return;
                    answer = {
                        swedish: swedishInput.value,
                        latin: latinInput.value
                    };
                } else {
                    const answerInput = document.getElementById('answer-input') as HTMLInputElement | null;
                    if (!answerInput) return;
                    answer = answerInput.value;
                }
                session.userAnswers[session.currentQuestion] = answer;
                session.currentQuestion++;
                if (session.currentQuestion < session.questions.length) {
                    renderQuestion();
                } else {
                    session.score = calculateScore(session, session.userAnswers);
                    await loadScreen('result.html');
                    renderResultScreen(session);
                }
            };
        }

        // Render the result screen with wrong answers listed
        function renderResultScreen(session: GameSession) {
            const resultContainer = document.getElementById('result-container');
            if (!resultContainer) return;
            // Score summary
            let html = `<p>Score: <strong>${session.score} / ${session.questions.length}</strong></p>`;
            // Find wrong answers
            const wrong: { index: number, plant: Plant, userAnswer: string }[] = [];
            for (let i = 0; i < session.questions.length; i++) {
                if (!checkAnswer(session.mode, session.questions[i], session.userAnswers[i])) {
                    wrong.push({ index: i, plant: session.questions[i], userAnswer: session.userAnswers[i] });
                }
            }
            if (wrong.length === 0) {
                html += `<p>Congratulations! All answers are correct.</p>`;
            } else {
                html += `<h3>Incorrect Answers</h3><ol>`;
                for (const w of wrong) {
                    let questionText = '';
                    let correctAnswer = '';
                    let userAnswer = w.userAnswer;
                    switch (session.mode) {
                        case PlantGameMode.SwedishToLatin:
                            questionText = `Swedish name: <strong>${w.plant.swedishName}</strong>`;
                            correctAnswer = w.plant.latinName;
                            break;
                        case PlantGameMode.LatinToSwedish:
                            questionText = `Latin name: <strong>${w.plant.latinName}</strong>`;
                            correctAnswer = w.plant.swedishName;
                            break;
                    }
                    html += `<li>${questionText}<br>Correct answer: <strong>${correctAnswer}</strong><br>Your answer: <span style="color:red">${userAnswer || '<em>No answer</em>'}</span></li>`;
                }
                html += `</ol>`;
            }
            resultContainer.innerHTML = html;
            const restartBtn = document.getElementById('restart-btn');
            if (restartBtn) {
                restartBtn.addEventListener('click', async () => {
                    // Immediately start a new Swedish to Latin game
                    await loadScreen('quiz.html');
                    const session = await startGame(PlantGameMode.SwedishToLatin);
                    (window as any).currentSession = session;
                    renderQuestion();
                    bindAnswerForm();
                });
            }
        }
    }

    // Initial load: start screen
    loadScreen('start.html').then(bindStartForm);
});
// main.ts - Plant Quiz Game entry point
// All game logic will be implemented here.

// Data model for a plant
export interface Plant {
    swedishName: string;
    latinName: string;
}

// Enum for game modes
export enum PlantGameMode {
    ImageToSwedish = 'ImageToSwedish',
    ImageToSwedishLatin = 'ImageToSwedishLatin',
    ImageToLatin = 'ImageToLatin',
    SwedishToLatin = 'SwedishToLatin',
    LatinToSwedish = 'LatinToSwedish',
}


// Utility to fetch plant data from JSON
export async function loadPlants(): Promise<Plant[]> {
    const response = await fetch('plants/plants.json');
    if (!response.ok) throw new Error('Failed to load plant data');
    return response.json();
}

// Randomly select n unique plants from the collection
export function getRandomPlants(plants: Plant[], n: number): Plant[] {
    const shuffled = plants.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, n);
}

// Game session state
export interface GameSession {
    mode: PlantGameMode;
    questions: Plant[];
    currentQuestion: number;
    score: number;
    userAnswers: string[];
}

// Initialize a new game session
export async function startGame(mode: PlantGameMode): Promise<GameSession> {
    const plants = await loadPlants();
    const questions = getRandomPlants(plants, 5);
    return {
        mode,
        questions,
        currentQuestion: 0,
        score: 0,
        userAnswers: [],
    };
}

// Check answer for a given mode and plant
export function checkAnswer(mode: PlantGameMode, plant: Plant, answer: string | { swedish?: string, latin?: string }): boolean {
    switch (mode) {
        case PlantGameMode.ImageToSwedish:
            return (typeof answer === 'string') && answer.trim().toLowerCase() === plant.swedishName.toLowerCase();
        case PlantGameMode.ImageToLatin:
            return (typeof answer === 'string') && answer.trim().toLowerCase() === plant.latinName.toLowerCase();
        case PlantGameMode.ImageToSwedishLatin:
            if (typeof answer === 'object' && answer.swedish && answer.latin) {
                return answer.swedish.trim().toLowerCase() === plant.swedishName.toLowerCase() &&
                    answer.latin.trim().toLowerCase() === plant.latinName.toLowerCase();
            }
            return false;
        case PlantGameMode.SwedishToLatin:
            return (typeof answer === 'string') && answer.trim().toLowerCase() === plant.latinName.toLowerCase();
        case PlantGameMode.LatinToSwedish:
            return (typeof answer === 'string') && answer.trim().toLowerCase() === plant.swedishName.toLowerCase();
        default:
            return false;
    }
}

// Score calculation (1 point per correct answer)
export function calculateScore(session: GameSession, userAnswers: (string | { swedish?: string, latin?: string })[]): number {
    let score = 0;
    for (let i = 0; i < session.questions.length; i++) {
        if (checkAnswer(session.mode, session.questions[i], userAnswers[i])) {
            score++;
        }
    }
    return score;
}
