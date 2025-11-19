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

### Plant Data Preprocessing

The app uses preprocessed plant data to improve performance and reliability. There are two ways to preprocess plant data:

#### 1. Interactive Preprocessing (Recommended for Cultivars)

For plants with cultivar names or varieties that need manual image curation:

```sh
npm run dev
# Then navigate to http://localhost:5173/preprocess
```

This provides a web-based UI where you can:
- Select which plants should be auto-processed vs manually curated
- Search and select images from Google Images for cultivars
- See a Google Images-style grid for easy image selection
- Require at least 10 images per manually curated plant

See [`docs/interactive-preprocessing.md`](docs/interactive-preprocessing.md) for detailed instructions.

#### 2. Command-Line Preprocessing (For Standard Plants)

For standard plants without cultivar names, use the automated script:

```sh
npm run preprocess
```

This script performs the following tasks:
- **Name Cleaning**: Removes variety/cultivar notation (like `subsp.`, `var.`, `f.`, cultivar names in quotes)
- **Synonym Resolution**: Queries WFO Plant List API to detect synonyms and replace them with accepted names
- **Image Fetching**: Fetches photo URLs from iNaturalist API (taxon photos and observation photos separately)
- Generates preprocessed files in `static/preprocessed/` with optimized data for the quiz

**How synonym resolution works:**
- **True synonyms** (outdated names) are replaced with current accepted names
  - Example: `Euonymus planipes` → `Euonymus sachalinensis`
  - Example: `Anemone hupehensis` → `Eriocapitella hupehensis`
- **Rank changes** (subsp. vs var.) use the cleaned name without rank notation
  - Example: `Symphoricarpos albus subsp. laevigatus` → `Symphoricarpos albus laevigatus`

**Performance Benefits:**
- Image URLs are fetched during preprocessing instead of at quiz load time
- Quiz loads instantly without waiting for API calls
- Images are pre-validated and ready to display

**Preprocessing Options:**
```sh
# Skip WFO lookup (faster, no synonym detection)
npm run preprocess -- --skip-wfo

# Skip iNaturalist image fetching (faster, but quiz won't have images)
npm run preprocess -- --skip-images

# Skip both (fastest, basic name cleaning only)
npm run preprocess -- --skip-wfo --skip-images
```

### Testing iNaturalist Data Availability

Before deploying, validate that plant names will return good results from iNaturalist:

```sh
# Test the default plants.json file (preprocessed version)
npm run test:inaturalist:preprocessed

# Test a specific file
npm run test:inaturalist:preprocessed plants_week1.json

# Test original (non-preprocessed) data
npm run test:inaturalist plants.json
```

This generates a detailed report at `test-results/<filename>-report.md` showing:
- How many photos are available for each plant
- Which taxon names match in iNaturalist
- Warnings for plants with insufficient data

**When to run these scripts:**
- Run `preprocess` whenever you add or update plant data files (this now includes image fetching)
- Run `test:inaturalist:preprocessed` to verify data quality if needed
- Preprocessed files with image URLs are committed to the repository for instant quiz loading

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
