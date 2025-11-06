/**
 * Main preprocessing script for plant data
 * Reads all plant JSON files, cleans names, queries WFO API, and outputs preprocessed data
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { cleanLatinName, getAcceptedName, delay, fetchINaturalistPhotos, type WFOData, type INaturalistPhotos } from './preprocess-utils.js';

interface PlantInput {
    swedishName: string;
    latinName: string;
}

interface PlantOutput extends PlantInput {
    searchName: string;
    wfoData?: WFOData;
    taxonPhotos?: string[];
    observationPhotos?: string[];
}

/**
 * Process a single plant entry
 */
async function processPlant(plant: PlantInput, enableWFO: boolean = true, enableImages: boolean = true): Promise<PlantOutput> {
    // Step 1: Clean the latin name
    const cleanedName = cleanLatinName(plant.latinName);

    // Step 2: Query WFO API if enabled
    let wfoData: WFOData | undefined;
    if (enableWFO) {
        wfoData = await getAcceptedName(cleanedName);
        // Add delay to respect API rate limits
        await delay(500);
    }

    // Step 3: Determine search name
    // Use WFO's accepted name ONLY if this is a true synonym (not just rank changes)
    // For rank changes (subsp. vs var.), use the cleaned name which works better with iNaturalist
    let searchName = cleanedName;

    if (wfoData?.isSynonym && wfoData.acceptedName) {
        // This is a real synonym - use the accepted name for better iNaturalist results
        searchName = wfoData.acceptedName;
    }

    // Step 4: Fetch iNaturalist photos if enabled
    let iNatPhotos: INaturalistPhotos | undefined;
    if (enableImages) {
        iNatPhotos = await fetchINaturalistPhotos(searchName);
        // Add delay to respect API rate limits
        await delay(500);
    }

    return {
        swedishName: plant.swedishName,
        latinName: plant.latinName,
        searchName,
        ...(enableWFO && { wfoData }),
        ...(enableImages && {
            taxonPhotos: iNatPhotos?.taxonPhotos || [],
            observationPhotos: iNatPhotos?.observationPhotos || [],
        }),
    };
}

/**
 * Process a plant JSON file
 */
async function processFile(inputPath: string, outputPath: string, enableWFO: boolean = true, enableImages: boolean = true): Promise<void> {
    console.log(`\nProcessing: ${inputPath}`);

    // Read input file
    const inputData: PlantInput[] = JSON.parse(readFileSync(inputPath, 'utf-8'));
    console.log(`  Found ${inputData.length} plants`);

    // Process each plant
    const outputData: PlantOutput[] = [];
    for (let i = 0; i < inputData.length; i++) {
        const plant = inputData[i];
        console.log(`  [${i + 1}/${inputData.length}] Processing: ${plant.latinName}`);

        const processed = await processPlant(plant, enableWFO, enableImages);
        outputData.push(processed);

        // Log if name changed
        if (processed.searchName !== plant.latinName) {
            console.log(`    → Search name: ${processed.searchName}`);
        }
        if (processed.wfoData && !processed.wfoData.hasMatch) {
            console.log(`    ⚠ No WFO match found`);
        }
        if (enableImages) {
            const taxonCount = processed.taxonPhotos?.length || 0;
            const obsCount = processed.observationPhotos?.length || 0;
            console.log(`    → Photos: ${taxonCount} taxon, ${obsCount} observation`);
            if (taxonCount === 0 && obsCount === 0) {
                console.log(`    ⚠ No photos found`);
            }
        }
    }

    // Write output file
    writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');
    console.log(`  ✓ Wrote ${outputData.length} plants to ${outputPath}`);
}

/**
 * Main function
 */
async function main() {
    const args = process.argv.slice(2);
    const enableWFO = !args.includes('--skip-wfo');
    const enableImages = !args.includes('--skip-images');

    console.log('='.repeat(60));
    console.log('Plant Data Preprocessing Script');
    console.log('='.repeat(60));
    console.log(`WFO API lookup: ${enableWFO ? 'ENABLED' : 'DISABLED'}`);
    console.log(`iNaturalist image fetching: ${enableImages ? 'ENABLED' : 'DISABLED'}`);

    // Paths
    const staticDir = join(process.cwd(), 'static');
    const outputDir = join(staticDir, 'preprocessed');

    // Create output directory if it doesn't exist
    if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
        console.log(`\nCreated output directory: ${outputDir}`);
    }

    // Find all plant JSON files in static directory
    const plantFiles = readdirSync(staticDir)
        .filter(file => file.startsWith('plants') && file.endsWith('.json'))
        .sort();

    if (plantFiles.length === 0) {
        console.error('\nError: No plant files found in static directory');
        process.exit(1);
    }

    console.log(`\nFound ${plantFiles.length} plant files to process:`);
    plantFiles.forEach(file => console.log(`  - ${file}`));

    // Process each file
    const startTime = Date.now();
    for (const file of plantFiles) {
        const inputPath = join(staticDir, file);
        const outputPath = join(outputDir, file);
        await processFile(inputPath, outputPath, enableWFO, enableImages);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n' + '='.repeat(60));
    console.log(`✓ Preprocessing complete! (${duration}s)`);
    console.log('='.repeat(60));
    console.log(`\nProcessed files are in: ${outputDir}`);
}

// Run main function
main().catch(error => {
    console.error('\nError during preprocessing:', error);
    process.exit(1);
});
