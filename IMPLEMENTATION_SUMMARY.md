# Interactive Preprocessing Implementation Summary

## Overview

Created a comprehensive interactive preprocessing tool for plant data that allows manual image curation for cultivars and other varieties that can't be reliably identified through the iNaturalist API.

## What Was Built

### 1. Backend API Endpoints

#### `/api/google-images` (GET)
- Fetches Google Images search results for plant names
- Returns image URLs, thumbnails, titles, and source domains
- Handles CORS by running server-side
- Filters out small images (< 100x100px)
- Limits results to 50 images

#### `/api/preprocess` (GET & POST)
- **GET**: Lists all `plants*.json` files with preprocessing status
- **POST**: Processes a plant file with auto/manual selections
- Coordinates WFO API lookups and iNaturalist image fetching
- Saves results to `static/preprocessed/`

### 2. Interactive UI (`/preprocess` route)

#### Step 1: File Selection
- Shows all `plants*.json` files from the static folder
- Displays preprocessing status with checkmarks
- Shows plant count for each file

#### Step 2: Plant Selection
- Displays all plants in the selected file
- Checkboxes for each plant (all pre-selected by default)
- "Select All" / "Deselect All" buttons
- Shows count of auto vs manual plants

#### Step 3: Image Selection (for manual plants)
- Google Images-style grid layout
- Click images to select/deselect
- Checkmarks on selected images
- Source links open in new tabs
- Progress indicator (minimum 10 images required)
- Processes one plant at a time

#### Step 4: Processing
- Shows loading spinner and progress
- Runs auto-processing in background
- Combines auto and manual results

#### Step 5: Complete
- Success message with summary
- Option to process another file

### 3. Data Structure Updates

#### Auto-Processed Plants (existing)
```json
{
  "swedishName": "Järnek",
  "latinName": "Ilex aquifolium",
  "searchName": "Ilex aquifolium",
  "wfoData": { ... },
  "taxonPhotos": ["url1", "url2", ...],
  "observationPhotos": ["url3", "url4", ...]
}
```

#### Manually Curated Plants (new)
```json
{
  "swedishName": "Ormhassel",
  "latinName": "Corylus avellana 'Contorta'",
  "searchName": "Corylus avellana 'Contorta'",
  "manualPhotos": ["url1", "url2", ..., "url10+"]
}
```

### 4. Quiz Integration

Updated the quiz page to handle `manualPhotos`:
- Checks for `manualPhotos` field first
- Falls back to `taxonPhotos` and `observationPhotos` if not present
- Shuffles and selects 4 images as usual

### 5. Supporting Files

- **`/root/martyparty/src/lib/preprocess-utils.ts`**: Copied from scripts for shared usage
- **`/root/martyparty/docs/interactive-preprocessing.md`**: Complete documentation
- **`/root/martyparty/README.md`**: Updated with preprocessing instructions
- **Navigation**: Added "Förbehandla växtdata" link on home page

## Key Features

1. **Flexible Processing**: Choose which plants need manual curation
2. **Visual Selection**: Google Images-style grid for easy image selection
3. **Quality Control**: Minimum 10 images required per plant
4. **Source Verification**: Click through to source pages to verify images
5. **Progress Tracking**: Clear indication of completion status
6. **Multi-file Support**: Process any `plants*.json` file
7. **Status Indicators**: See which files have been preprocessed
8. **Responsive Design**: Works on desktop and mobile
9. **Accessibility**: Proper ARIA labels and keyboard navigation

## Technical Highlights

- Built with Svelte 5 using modern runes syntax (`$state`, `$derived`)
- Uses shadcn/ui components for consistent styling
- Server-side Google Images scraping to avoid CORS
- Maintains existing preprocessing logic for auto-processing
- Backwards compatible with existing preprocessed data
- Type-safe with TypeScript throughout

## Usage Flow

1. Navigate to `/preprocess`
2. Select a `plants*.json` file
3. Deselect plants that need manual curation (cultivars, etc.)
4. For each manual plant:
   - View Google Images results
   - Select at least 10 representative images
   - Verify sources by clicking through
5. Wait for processing to complete
6. Results saved to `static/preprocessed/[filename]`

## Benefits

- **Cultivar Support**: Can now properly handle plant cultivars
- **Better Images**: Manual curation ensures high-quality, relevant images
- **Flexibility**: Mix auto and manual processing in the same file
- **User-Friendly**: Visual interface is much easier than command-line
- **Quality Control**: Requires minimum 10 images per plant
- **Verification**: Can check image sources before committing

## Files Created/Modified

### Created
- `/root/martyparty/src/routes/preprocess/+page.svelte`
- `/root/martyparty/src/routes/api/preprocess/+server.ts`
- `/root/martyparty/src/routes/api/google-images/+server.ts`
- `/root/martyparty/src/lib/preprocess-utils.ts`
- `/root/martyparty/docs/interactive-preprocessing.md`

### Modified
- `/root/martyparty/src/routes/+page.svelte` (added navigation link)
- `/root/martyparty/src/routes/quiz/+page.svelte` (handle manual photos)
- `/root/martyparty/README.md` (added preprocessing documentation)

## Next Steps

To use the interactive preprocessing tool:

1. Start the dev server: `npm run dev`
2. Navigate to `http://localhost:5173/preprocess`
3. Select a file and start preprocessing!

The tool is fully functional and ready to use for preprocessing plant data with cultivars.
