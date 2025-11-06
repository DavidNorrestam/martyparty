# Image Preprocessing Migration

## Overview

The quiz application has been optimized to improve loading performance by moving iNaturalist API calls from runtime to the preprocessing stage.

## Changes Made

### 1. Preprocessing Script (`scripts/preprocess-plants.ts`)

**What changed:**
- Added `fetchINaturalistPhotos()` function call during preprocessing
- Stores `taxonPhotos` and `observationPhotos` arrays in preprocessed JSON files
- Added `--skip-images` flag to optionally disable image fetching during preprocessing

**Benefits:**
- All API calls happen once during preprocessing, not every time a user loads the quiz
- Preprocessed files include ready-to-use image URLs
- Faster quiz loading times

### 2. Preprocessing Utilities (`scripts/preprocess-utils.ts`)

**What changed:**
- Added `fetchINaturalistPhotos()` function that fetches both taxon and observation photos
- Stores photos in separate arrays (`taxonPhotos` and `observationPhotos`)
- Uses the same API query logic as the original quiz page

**Implementation details:**
- Fetches up to 10 taxon photos per plant
- Fetches up to 30 observation photos per plant (with popular filter fallback)
- Removes duplicate photos (observations that match taxon photos)
- Respects API rate limits with 500ms delays

### 3. Quiz Page (`src/routes/quiz/+page.svelte`)

**What changed:**
- Removed `fetchImagesForPlant()` async function (no more API calls at runtime)
- Added `selectImagesForPlant()` synchronous function that works with preprocessed data
- Selection logic remains identical: 2 taxon + 2 observation photos, fill to 4 total
- Final random shuffle still applied

**Benefits:**
- Quiz loads instantly without waiting for API calls
- Same visual experience and randomization behavior
- No network dependencies during quiz gameplay

## Data Structure

### Before (runtime):
```json
{
  "swedishName": "Bok",
  "latinName": "Fagus sylvatica",
  "searchName": "Fagus sylvatica"
}
```

### After (preprocessed):
```json
{
  "swedishName": "Bok",
  "latinName": "Fagus sylvatica",
  "searchName": "Fagus sylvatica",
  "taxonPhotos": [
    "https://inaturalist-open-data.s3.amazonaws.com/photos/235495904/medium.jpeg",
    "https://inaturalist-open-data.s3.amazonaws.com/photos/70160788/medium.jpeg",
    ...
  ],
  "observationPhotos": [
    "https://static.inaturalist.org/photos/582856107/medium.jpg",
    "https://inaturalist-open-data.s3.amazonaws.com/photos/578548516/medium.jpg",
    ...
  ]
}
```

## Image Selection Behavior

The selection algorithm remains **identical** to the original:

1. Shuffle both taxon and observation photo arrays
2. Select up to 2 taxon photos
3. Select up to 2 observation photos
4. If fewer than 4 total, fill from remaining photos
5. Final shuffle of selected photos

This ensures:
- Same distribution of taxon vs observation photos
- Same randomization on each quiz attempt
- Same number of photos per question (up to 4)

## Usage

### Preprocessing with Images (recommended):
```sh
npm run preprocess
```

### Preprocessing without Images:
```sh
npm run preprocess -- --skip-images
```

### Testing Image Selection:
```sh
npx tsx scripts/test-image-selection.ts
```

## Performance Impact

- **Before**: Quiz loading with 10 plants = ~10-20 seconds (100+ API calls)
- **After**: Quiz loading with 10 plants = <1 second (read from preprocessed JSON)

## Migration Checklist

- [x] Add `fetchINaturalistPhotos()` to preprocessing utilities
- [x] Update preprocessing script to fetch and store image URLs
- [x] Update TypeScript interfaces for new data structure
- [x] Replace async API calls with synchronous selection in quiz page
- [x] Verify image selection logic matches original behavior
- [x] Update README documentation
- [x] Test with sample data

## Backwards Compatibility

The quiz page will still work with non-preprocessed data (without image URLs), but will not display images. To get the full experience, preprocessed data with images must be generated using the updated preprocessing script.

## Next Steps

After merging these changes:
1. Run `npm run preprocess` to regenerate all preprocessed files with images
2. Commit the updated preprocessed files to the repository
3. Deploy the new version

The preprocessing may take 5-10 minutes depending on the number of plants, as it respects iNaturalist API rate limits (500ms delay between requests).
