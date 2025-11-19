/**
 * API endpoint for preprocessing operations
 * Handles listing files, checking status, and running preprocessing
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

interface PlantInput {
    swedishName: string;
    latinName: string;
}

interface PlantOutput extends PlantInput {
    searchName: string;
    wfoData?: any;
    taxonPhotos?: string[];
    observationPhotos?: string[];
    manualPhotos?: string[];
}

interface PlantFile {
    filename: string;
    path: string;
    isPreprocessed: boolean;
    plantCount: number;
}

/**
 * GET: List all plant files and their preprocessing status
 */
export const GET: RequestHandler = async () => {
    try {
        const fs = await import('fs');
        const path = await import('path');

        const staticDir = path.join(process.cwd(), 'static');
        const preprocessedDir = path.join(staticDir, 'preprocessed');

        // Find all plant JSON files
        const plantFiles = fs.readdirSync(staticDir)
            .filter((file: string) => file.startsWith('plants') && file.endsWith('.json'))
            .sort();

        const files: PlantFile[] = plantFiles.map((filename: string) => {
            const inputPath = path.join(staticDir, filename);
            const preprocessedPath = path.join(preprocessedDir, filename);

            const plants: PlantInput[] = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
            const isPreprocessed = fs.existsSync(preprocessedPath);

            return {
                filename,
                path: inputPath,
                isPreprocessed,
                plantCount: plants.length
            };
        });

        return json({ files });
    } catch (error) {
        console.error('Error listing plant files:', error);
        return json({
            error: 'Failed to list files',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
};

/**
 * POST: Run preprocessing on a file
 * Body: { filename, autoProcessIndices, manualPlants }
 */
export const POST: RequestHandler = async ({ request }) => {
    try {
        const fs = await import('fs');
        const path = await import('path');

        const body = await request.json();
        const { filename, autoProcessIndices, manualPlants } = body;

        if (!filename) {
            return json({ error: 'Missing filename' }, { status: 400 });
        }

        const staticDir = path.join(process.cwd(), 'static');
        const preprocessedDir = path.join(staticDir, 'preprocessed');
        const inputPath = path.join(staticDir, filename);
        const outputPath = path.join(preprocessedDir, filename);

        // Read input file
        const inputData: PlantInput[] = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

        // Import preprocessing utilities
        const { cleanLatinName, getAcceptedName, delay, fetchINaturalistPhotos } = await import('$lib/preprocess-utils');

        // Process plants
        const outputData: PlantOutput[] = [];

        for (let i = 0; i < inputData.length; i++) {
            const plant = inputData[i];

            // Check if this plant should be auto-processed
            if (autoProcessIndices?.includes(i)) {
                // Auto-process
                const cleanedName = cleanLatinName(plant.latinName);
                const wfoData = await getAcceptedName(cleanedName);
                await delay(500);

                let searchName = cleanedName;
                if (wfoData?.isSynonym && wfoData.acceptedName) {
                    searchName = wfoData.acceptedName;
                }

                const iNatPhotos = await fetchINaturalistPhotos(searchName);
                await delay(500);

                outputData.push({
                    swedishName: plant.swedishName,
                    latinName: plant.latinName,
                    searchName,
                    wfoData,
                    taxonPhotos: iNatPhotos.taxonPhotos || [],
                    observationPhotos: iNatPhotos.observationPhotos || [],
                });
            } else {
                // Manual processing - use provided photos
                const manualData = manualPlants?.find((m: any) =>
                    m.latinName === plant.latinName && m.swedishName === plant.swedishName
                );

                outputData.push({
                    swedishName: plant.swedishName,
                    latinName: plant.latinName,
                    searchName: plant.latinName,
                    manualPhotos: manualData?.photos || [],
                });
            }
        }

        // Write output file
        fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');

        return json({
            success: true,
            processed: outputData.length,
            outputPath
        });
    } catch (error) {
        console.error('Error preprocessing file:', error);
        return json({
            error: 'Preprocessing failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
};
