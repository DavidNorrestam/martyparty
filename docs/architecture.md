# Architecture Overview

Martyparty is a SvelteKit app for learning Swedish plant names. This document outlines the high-level structure and main responsibilities of each part of the codebase to aid AI agents and future maintainers.

## Main Concepts

- **Quiz Modes:**
  - Implemented in `src/lib/gameModes/`
  - Each mode (e.g., Swedish to Latin, Image to Swedish) is a TypeScript module exporting quiz logic and types.
- **State Management:**
  - Centralized in `src/lib/stores/quiz.ts` using Svelte stores.
  - Tracks current question, progress, and results.
- **UI Components:**
  - `src/lib/QuizQuestion.svelte`: Renders the current quiz question.
  - `src/lib/QuizProgress.svelte`: Shows progress bar or stats.
  - `src/lib/QuizResult.svelte`: Displays final results and feedback.
- **Routes:**
  - Main quiz flow in `src/routes/quiz/+page.svelte`.
  - Results in `src/routes/result/+page.svelte`.
- **Data:**
  - Plant data in `static/plants.json`.

## Data Flow

1. User selects a quiz mode.
2. Store initializes quiz state and loads questions.
3. User answers questions; store updates progress.
4. On completion, results are shown and stored.

## Design Principles
- Modular, reusable Svelte components
- TypeScript for type safety
- Minimal dependencies
- Accessibility and responsiveness

## Edge Cases
- Handle empty or malformed plant data
- Validate user input for each question type
- Graceful error handling for missing assets

---
_This file is intended for AI agents and maintainers to quickly understand the project structure and logic._
