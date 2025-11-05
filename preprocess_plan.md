# Plant Data Preprocessing Implementation Plan

## Overview
Implement preprocessing and testing infrastructure to handle inconsistent taxonomic naming and validate iNaturalist API results.

## Step-by-Step Implementation

### Phase 1: Name Preprocessing Utilities

**Step 1.1: Create preprocessing utility module**
- Create `scripts/preprocess-utils.ts`
- Implement `cleanLatinName(name: string): string` function
  - Remove cultivar names in quotes (`'...'` or `"..."`)
  - Remove variety notation (`var.` + following word)
  - Remove form notation (`f.` + following word)
  - Remove cultivar notation (`cv.` + following word)
  - Remove `subsp.` text but keep the subspecies name
  - Remove trailing `sp.` or `sp`
  - Trim and normalize whitespace

**Step 1.2: Add WFO Plant List API integration**
- In `scripts/preprocess-utils.ts`, implement `getAcceptedName(name: string): Promise<{accepted: string, issynonym: boolean, wfoId?: string}>`
- Query WFO Plant List API: `https://list.worldfloraonline.org/matching_rest.php?input_string={name}`
- Parse response to extract:
  - Accepted scientific name
  - Whether input was a synonym
  - WFO identifier (optional, for reference)
- Handle API failures gracefully (return original name if lookup fails)
- Add rate limiting/delay between requests to respect API limits

### Phase 2: Preprocessing Script

**Step 2.1: Create main preprocessing script**
- Create `scripts/preprocess-plants.ts`
- Read all plant JSON files from `static/` directory
  - `plants.json`
  - `plants_week1.json` through `plants_week5.json`
- For each plant entry:
  - Keep original `swedishName` and `latinName`
  - Generate `cleanedName` using `cleanLatinName()`
  - Query WFO API for accepted name
  - Add `searchName` field (the name to use for iNaturalist queries)
  - Add `wfoData` field with synonym info (optional, for debugging)

**Step 2.2: Generate preprocessed data files**
- Output to `static/preprocessed/` directory
- Maintain same file structure:
  - `preprocessed/plants.json`
  - `preprocessed/plants_week1.json`, etc.
- Each entry should have structure:
  ```typescript
  {
    swedishName: string,
    latinName: string,        // original, for display/answer checking
    searchName: string,        // processed, for API queries
    wfoData?: {
      isAccepted: boolean,
      isSynonym: boolean,
      acceptedName?: string,
      wfoId?: string
    }
  }
  ```

**Step 2.3: Add npm script**
- Add to `package.json` scripts: `"preprocess": "tsx scripts/preprocess-plants.ts"`
- Document in README that this should be run when plant data is updated

### Phase 3: Testing/Validation Script

**Step 3.1: Create iNaturalist test utility**
- Create `scripts/test-inaturalist.ts`
- Implement functions to query iNaturalist API:
  - `getTaxonInfo(searchName: string)` - get taxon details
  - `getObservationCount(searchName: string)` - count observations with filters
  - Use exact same query parameters as production code:
    - For observations: `photos=true&popular=true&per_page=30&order_by=date_added&order=desc`

**Step 3.2: Create validation report generator**
- In `scripts/test-inaturalist.ts`, implement `generateReport(plantFiles: string[])`
- For each plant in each file:
  - Query iNaturalist using `searchName`
  - Collect data:
    - Original Latin name
    - Search name (after preprocessing)
    - Matched taxon name from iNaturalist
    - Taxon ID
    - Taxon rank (species, subspecies, variety, etc.)
    - Number of taxon photos available
    - Number of observations matching query filters
    - Any warnings (no match found, low photo count, etc.)

**Step 3.3: Output test report**
- Generate report in markdown format: `test-results/inaturalist-report.md`
- Include summary statistics:
  - Total plants tested
  - Plants with good matches (>= 4 photos)
  - Plants with few photos (1-3 photos)
  - Plants with no results
  - Plants where search name differs from original name
- Include detailed table with all plant data

**Step 3.4: Add npm scripts**
- Add to `package.json` scripts:
  - `"test:inaturalist": "tsx scripts/test-inaturalist.ts"`
  - `"test:inaturalist:preprocessed": "tsx scripts/test-inaturalist.ts --preprocessed"`
- Add rate limiting to avoid hitting iNaturalist API limits (500ms delay between requests)

### Phase 4: Update Quiz Code

**Step 4.1: Update quiz page to use preprocessed data**
- Modify `src/routes/quiz/+page.svelte`
- Change fetch to load from `preprocessed/plants.json` instead of `plants.json`
- Update `fetchImagesForPlant()` function:
  - Remove inline preprocessing logic (lines 35-41)
  - Use `plant.searchName` instead of processing `plant.latinName`
- Keep `latinName` for display and answer checking

**Step 4.2: Update game mode type definitions**
- Modify `src/lib/gameModes/types.ts`
- Update `BaseQuestion` interface to include:
  ```typescript
  searchName?: string;  // optional for backwards compatibility
  ```

**Step 4.3: Test with preprocessed data**
- Run preprocessing script
- Test all game modes with new data structure
- Verify answer checking still works correctly (uses original `latinName`)
- Verify images load correctly (uses `searchName`)

### Phase 5: Documentation and Cleanup

**Step 5.1: Update documentation**
- Update README.md with:
  - How to run preprocessing script
  - How to run iNaturalist validation tests
  - When to run these scripts (after updating plant data)
- Document the data structure in a separate file

**Step 5.2: Add error handling**
- Add try-catch blocks in preprocessing script
- Log warnings for plants that couldn't be processed
- Generate error report alongside preprocessed data

**Step 5.3: Create .gitignore entries**
- Add `static/preprocessed/` to git (should be committed)
- Add `test-results/` to .gitignore (local testing only)

## Dependencies Required

- `tsx` - for running TypeScript scripts directly
- No additional runtime dependencies (use native fetch API)

## Success Criteria

- [ ] Preprocessing script successfully processes all plant files
- [ ] WFO API integration works and handles synonyms
- [ ] Test script generates detailed reports on iNaturalist data availability
- [ ] Quiz runs without inline preprocessing logic
- [ ] All game modes work with preprocessed data
- [ ] Answer checking still works correctly with original Latin names
- [ ] Images load using search names

## Future Enhancements (Optional)

1. Cache iNaturalist metadata in preprocessed files to reduce runtime API calls
2. Add validation that warns about plants with <2 photos available
3. Create a web UI for the validation report
4. Add automated testing in CI/CD to validate plant data
5. Support for custom name mappings (manual overrides for problematic taxa)
