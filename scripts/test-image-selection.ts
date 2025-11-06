/**
 * Test script to verify image selection logic matches the quiz page behavior
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface PlantData {
    swedishName: string;
    latinName: string;
    taxonPhotos?: string[];
    observationPhotos?: string[];
}

/**
 * Select images for a plant (same logic as quiz page)
 */
function selectImagesForPlant(plant: PlantData): string[] {
    const taxonPhotos = plant.taxonPhotos || [];
    const observationPhotos = plant.observationPhotos || [];

    // Shuffle taxon photos
    const shuffledTaxon = [...taxonPhotos];
    for (let i = shuffledTaxon.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledTaxon[i], shuffledTaxon[j]] = [shuffledTaxon[j], shuffledTaxon[i]];
    }

    // Shuffle observation photos
    const shuffledObs = [...observationPhotos];
    for (let i = shuffledObs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledObs[i], shuffledObs[j]] = [shuffledObs[j], shuffledObs[i]];
    }

    // Pick 2 taxon photos and 2 observation photos (or as many as available)
    let selected: string[] = [];
    let taxonCount = Math.min(2, shuffledTaxon.length);
    let obsCount = Math.min(2, shuffledObs.length);

    selected = [
        ...shuffledTaxon.slice(0, taxonCount),
        ...shuffledObs.slice(0, obsCount),
    ];

    // Fill up to 4 photos if we have fewer
    if (selected.length < 4) {
        let fillTaxon = shuffledTaxon.slice(taxonCount);
        let fillObs = shuffledObs.slice(obsCount);
        let fill = [...fillTaxon, ...fillObs];
        for (let i = 0; i < fill.length && selected.length < 4; i++) {
            if (!selected.includes(fill[i])) selected.push(fill[i]);
        }
    }

    // Final shuffle of selected photos
    for (let i = selected.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [selected[i], selected[j]] = [selected[j], selected[i]];
    }

    return selected;
}

/**
 * Test the image selection logic
 */
function testImageSelection() {
    console.log('Testing Image Selection Logic');
    console.log('='.repeat(60));

    // Load preprocessed test data
    const testDataPath = join(process.cwd(), 'static', 'preprocessed', 'plants_test.json');
    const plants: PlantData[] = JSON.parse(readFileSync(testDataPath, 'utf-8'));

    console.log(`\nLoaded ${plants.length} plants from test data\n`);

    // Test each plant multiple times to verify randomization
    for (const plant of plants) {
        console.log(`Plant: ${plant.swedishName} (${plant.latinName})`);
        console.log(`Available: ${plant.taxonPhotos?.length || 0} taxon, ${plant.observationPhotos?.length || 0} observation`);

        // Run selection 3 times to show randomization
        for (let i = 0; i < 3; i++) {
            const selected = selectImagesForPlant(plant);

            // Count how many are from taxon vs observation
            const taxonCount = selected.filter(url => plant.taxonPhotos?.includes(url)).length;
            const obsCount = selected.filter(url => plant.observationPhotos?.includes(url)).length;

            console.log(`  Selection ${i + 1}: ${selected.length} photos (${taxonCount} taxon, ${obsCount} observation)`);

            // Verify the selection rules
            if (selected.length > 4) {
                console.log(`    ⚠️ ERROR: Too many photos selected (${selected.length} > 4)`);
            }

            // Verify we're getting approximately 2 taxon + 2 observation when available
            const expectedTaxon = Math.min(2, plant.taxonPhotos?.length || 0);
            const expectedObs = Math.min(2, plant.observationPhotos?.length || 0);

            if (plant.taxonPhotos && plant.taxonPhotos.length >= 2 && plant.observationPhotos && plant.observationPhotos.length >= 2) {
                if (taxonCount < 2 || obsCount < 2) {
                    console.log(`    ⚠️ WARNING: Expected at least 2 of each type, got ${taxonCount} taxon, ${obsCount} obs`);
                }
            }
        }
        console.log();
    }

    console.log('='.repeat(60));
    console.log('✓ Image selection test complete\n');
}

// Run test
testImageSelection();
