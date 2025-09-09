# AI Task Guide: Martyparty

This document lists typical tasks, workflows, and expected behaviors to help AI agents understand and automate work in this project.

## Typical User Flows

- Start a quiz in a selected mode
- Answer a series of questions (multiple choice, text input, or image-based)
- View progress and feedback after each question
- See final results and correct answers at the end

## Key Automation Tasks for AI

- Add new quiz modes by creating a new module in `src/lib/gameModes/`
- Update or extend plant data in `static/plants.json`
- Refactor or add Svelte components for new UI features
- Improve accessibility or responsiveness in UI
- Add logic to handle new types of questions or answer validation

## Example Prompts for AI

- "Add a new quiz mode for Latin to Swedish."
- "Refactor QuizResult.svelte to show a summary chart."
- "Update quiz store to support timed quizzes."
- "Add error handling for missing plant images."

## Business Rules

- Each quiz session should be self-contained and not leak state between users.
- All user input must be validated and sanitized.
- The app should be usable with keyboard and screen readers.

---
_This file is for AI agents to understand what the app should do and how to automate common tasks._
