# Interactive Plant Preprocessing

This interactive preprocessing tool allows you to manually curate images for plant cultivars and other varieties that can't be reliably identified through the iNaturalist API.

## Features

1. **File Selection**: Choose which `plants*.json` file to preprocess
2. **Plant Selection**: Select which plants should be automatically processed vs manually curated
3. **Image Selection**: For manual plants, select at least 10 images from Google Images search
4. **Automatic Processing**: Selected plants are processed using WFO and iNaturalist APIs
5. **Results Storage**: Preprocessed data is saved to `static/preprocessed/`

## How to Use

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Navigate to the Preprocessing Page

Open your browser and go to: `http://localhost:5173/preprocess` (or whatever port the dev server is using)

### 3. Select a File

- Click on any `plants*.json` file from the list
- Files that have already been preprocessed will show a green checkmark

### 4. Select Plants for Auto-Processing

- By default, all plants are selected for automatic processing
- Deselect plants that need manual curation (e.g., cultivars with quotes in their names)
- The UI shows how many plants will be auto-processed vs manually curated

### 5. Manually Curate Images (if needed)

If you deselected any plants:

- For each manual plant, you'll see a Google Images-style grid
- Click on images to select them (selected images show a checkmark)
- Click on the source link under each image to verify it's correct
- Select at least 10 images before proceeding
- Images are shown in an aspect-square grid for easy comparison

### 6. Processing

- The tool will automatically process selected plants using the existing WFO/iNaturalist pipeline
- Manual images are saved alongside automatic ones
- Progress is shown during processing

### 7. Complete

- When done, the preprocessed file is saved to `static/preprocessed/[filename]`
- You can process another file or return to the file selection

## Data Structure

### Auto-Processed Plants

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

### Manually Curated Plants

```json
{
  "swedishName": "Ormhassel",
  "latinName": "Corylus avellana 'Contorta'",
  "searchName": "Corylus avellana 'Contorta'",
  "manualPhotos": ["url1", "url2", ..., "url10+"]
}
```

## API Endpoints

### GET /api/preprocess

Lists all `plants*.json` files with their preprocessing status.

**Response:**
```json
{
  "files": [
    {
      "filename": "plants.json",
      "path": "/path/to/plants.json",
      "isPreprocessed": true,
      "plantCount": 10
    }
  ]
}
```

### GET /api/google-images?q=<search term>

Fetches Google Images search results for a plant name.

**Response:**
```json
{
  "query": "Corylus avellana Contorta",
  "results": [
    {
      "url": "https://...",
      "thumbnail": "https://...",
      "title": "...",
      "source": "example.com"
    }
  ]
}
```

### POST /api/preprocess

Processes a plant file with the given selections.

**Request Body:**
```json
{
  "filename": "plants_week6.json",
  "autoProcessIndices": [0, 1, 2, 5, 6, 7, 8, 9],
  "manualPlants": [
    {
      "latinName": "Corylus avellana 'Contorta'",
      "swedishName": "Ormhassel",
      "photos": ["url1", "url2", ...]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "processed": 10,
  "outputPath": "/path/to/preprocessed/plants.json"
}
```

## Notes

- The Google Images scraping is a simple implementation and may need updates if Google changes their HTML structure
- Consider rate limiting and API usage when processing large files
- The tool respects existing API rate limits (500ms delays between calls)
- Manual photos are saved with the `manualPhotos` field to distinguish them from auto-processed photos
