# Martyparty

>A modern, open-source SvelteKit app for learning Swedish plant names, with AI-driven development support.

---
## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)

- [Development](#development)
- [Building & Deployment](#building--deployment)
- [AI-Driven Development](#ai-driven-development)

- [Contributing](#contributing)
- [Code of Conduct](#code-of-conduct)
- [License](#license)

- [Contact](#contact)

---
## Overview

Martyparty is a SvelteKit-based quiz app to help users learn Swedish plant names. It features multiple game modes, progress tracking, and a clean, accessible UI. The project is designed for easy contribution and leverages AI tools for rapid, high-quality development.

## Features

- Quiz modes: Swedish to Latin, Image to Swedish, and more
- Progress tracking and results
- Responsive, accessible design

- Modular Svelte components
- TypeScript for type safety
- AI/LLM-driven development support

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) (or [pnpm](https://pnpm.io/) / [yarn](https://yarnpkg.com/))

### Installation
```sh
git clone https://github.com/DavidNorrestam/martyparty.git
cd martyparty
npm install
# or: pnpm install
```

## Development

Start the development server:
```sh
npm run dev
# or: pnpm dev
```
Visit [localhost:5173](http://localhost:5173) (or the port shown in your terminal).

## Building & Deployment

To build for production:
```sh
npm run build
```
Preview the production build:
```sh
npm run preview
```

### Deploying
- For static hosting, use an [adapter](https://kit.svelte.dev/docs/adapters)
- For GitHub Pages:
	1. `npm install --save-dev gh-pages`
	2. `npm run deploy`
	3. Set GitHub Pages to deploy from the `gh-pages` branch

## AI-Driven Development

This project encourages and supports AI-assisted workflows:
- Use [GitHub Copilot](https://github.com/features/copilot) or similar tools for code suggestions, refactoring, and documentation
- See [`docs/ai-development.md`](docs/ai-development.md) for tips on effective AI/LLM usage
- All code and docs are structured for easy AI understanding and automation



## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For questions, suggestions, or support, open an issue or contact [David Norrestam](https://github.com/DavidNorrestam).

---

_Happy learning and building!_

---

## Related Documentation

- [Architecture Overview](docs/architecture.md)
- [AI Task Guide](docs/ai-tasks.md)
- [AI-Driven Development Guide](docs/ai-development.md)
# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.


## Deploying to GitHub Pages

1. Install the `gh-pages` package if you haven't already:
	```sh
	npm install --save-dev gh-pages
	```
2. Build and deploy:
	```sh
	npm run deploy
	```
3. In your repository settings on GitHub, set Pages to deploy from the `gh-pages` branch.

The app will be available at `https://<your-username>.github.io/<REPO_NAME>/`.
