
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const prerender = true;

/**
 * GET: List all available plant quiz files
 */
export const GET: RequestHandler = async () => {
    try {
        const fs = await import('fs');
        const path = await import('path');

        const staticDir = path.join(process.cwd(), 'static');

        // Find all plant JSON files
        // We look for files starting with 'plants' and ending with '.json'
        // This includes 'plants.json', 'plants_week1.json', etc.
        const files = fs.readdirSync(staticDir)
            .filter((file: string) => file.startsWith('plants') && file.endsWith('.json'))
            .sort();

        // sort so plants.json is first (if it exists), then others naturally or by whatever logic
        // Actually, 'plants.json' is shorter than 'plants_week1.json', so simple sort might put it first or last depending on string comparison
        // 'plants.json' < 'plants_week1.json' is true.

        return json({ files });
    } catch (error) {
        console.error('Error listing quiz files:', error);
        return json({
            error: 'Failed to list quiz files',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
};
