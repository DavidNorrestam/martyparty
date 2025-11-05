/**
 * iNaturalist API testing and validation script
 * Tests plant names against iNaturalist API to validate data availability
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { delay } from './preprocess-utils.js';

interface PlantData {
    swedishName: string;
    latinName: string;
    searchName: string;
}

interface TaxonInfo {
    id: number;
    name: string;
    rank: string;
    taxonPhotosCount: number;
}

interface ObservationInfo {
    count: number;
}

interface TestResult {
    swedishName: string;
    latinName: string;
    searchName: string;
    taxonMatch?: TaxonInfo;
    observationCount: number;
    warning?: string;
}

/**
 * Query iNaturalist taxa endpoint
 */
async function getTaxonInfo(searchName: string): Promise<TaxonInfo | null> {
    try {
        const url = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(searchName)}`;
        const response = await fetch(url);

        if (!response.ok) {
            console.warn(`iNaturalist taxa API failed for "${searchName}": ${response.status}`);
            return null;
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            return null;
        }

        const taxon = data.results[0];

        // Get detailed taxon info including photo count
        const taxonId = taxon.id;
        const detailUrl = `https://api.inaturalist.org/v1/taxa/${taxonId}`;
        const detailResponse = await fetch(detailUrl);

        if (!detailResponse.ok) {
            return {
                id: taxon.id,
                name: taxon.name,
                rank: taxon.rank || 'unknown',
                taxonPhotosCount: 0,
            };
        }

        const detailData = await detailResponse.json();
        const taxonPhotosCount = detailData.results?.[0]?.taxon_photos?.length || 0;

        return {
            id: taxon.id,
            name: taxon.name,
            rank: taxon.rank || 'unknown',
            taxonPhotosCount,
        };
    } catch (error) {
        console.error(`Error querying iNaturalist taxa for "${searchName}":`, error);
        return null;
    }
}

/**
 * Query iNaturalist observations endpoint with the same filters as production
 * Matches the behavior in quiz/+page.svelte: tries popular first, falls back to all if needed
 */
async function getObservationCount(searchName: string): Promise<number> {
    try {
        // First try with popular=true filter for better quality photos
        let url = `https://api.inaturalist.org/v1/observations?taxon_name=${encodeURIComponent(searchName)}&photos=true&popular=true&per_page=30&order_by=date_added&order=desc`;
        let response = await fetch(url);

        if (!response.ok) {
            console.warn(`iNaturalist observations API failed for "${searchName}": ${response.status}`);
            return 0;
        }

        let data = await response.json();
        let count = data.results?.length || 0;

        // If we don't have enough results with popular filter, try again without it
        if (count < 10) {
            url = `https://api.inaturalist.org/v1/observations?taxon_name=${encodeURIComponent(searchName)}&photos=true&per_page=30&order_by=date_added&order=desc`;
            response = await fetch(url);

            if (response.ok) {
                data = await response.json();
                count = data.results?.length || 0;
            }
        }

        return count;
    } catch (error) {
        console.error(`Error querying iNaturalist observations for "${searchName}":`, error);
        return 0;
    }
}

/**
 * Test a single plant
 */
async function testPlant(plant: PlantData): Promise<TestResult> {
    const taxonMatch = await getTaxonInfo(plant.searchName);
    await delay(500); // Rate limiting

    const observationCount = await getObservationCount(plant.searchName);
    await delay(500); // Rate limiting

    // Determine warnings
    let warning: string | undefined;
    if (!taxonMatch) {
        warning = 'No taxon match found';
    } else if (taxonMatch.taxonPhotosCount === 0 && observationCount === 0) {
        warning = 'No photos available';
    } else if (taxonMatch.taxonPhotosCount < 2 && observationCount < 2) {
        warning = 'Very few photos available';
    }

    return {
        swedishName: plant.swedishName,
        latinName: plant.latinName,
        searchName: plant.searchName,
        taxonMatch: taxonMatch || undefined,
        observationCount,
        warning,
    };
}

/**
 * Test all plants in a file
 */
async function testFile(filePath: string): Promise<TestResult[]> {
    const plants: PlantData[] = JSON.parse(readFileSync(filePath, 'utf-8'));
    const results: TestResult[] = [];

    for (let i = 0; i < plants.length; i++) {
        const plant = plants[i];
        console.log(`  [${i + 1}/${plants.length}] Testing: ${plant.latinName}`);
        const result = await testPlant(plant);
        results.push(result);

        if (result.warning) {
            console.log(`    ⚠ ${result.warning}`);
        } else {
            console.log(`    ✓ ${result.taxonMatch?.taxonPhotosCount || 0} taxon photos, ${result.observationCount} observations`);
        }
    }

    return results;
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(allResults: Map<string, TestResult[]>, outputPath: string): void {
    let markdown = '# iNaturalist Data Validation Report\n\n';
    markdown += `*Generated: ${new Date().toISOString()}*\n\n`;

    // Calculate summary statistics
    let totalPlants = 0;
    let goodMatches = 0;
    let fewPhotos = 0;
    let noResults = 0;
    let nameChanges = 0;

    for (const results of allResults.values()) {
        totalPlants += results.length;
        for (const result of results) {
            if (result.searchName !== result.latinName) {
                nameChanges++;
            }

            const totalPhotos = (result.taxonMatch?.taxonPhotosCount || 0) + result.observationCount;
            if (totalPhotos >= 4) {
                goodMatches++;
            } else if (totalPhotos > 0) {
                fewPhotos++;
            } else {
                noResults++;
            }
        }
    }

    // Summary section
    markdown += '## Summary\n\n';
    markdown += `- **Total plants tested**: ${totalPlants}\n`;
    markdown += `- **Plants with good matches** (≥4 photos): ${goodMatches}\n`;
    markdown += `- **Plants with few photos** (1-3 photos): ${fewPhotos}\n`;
    markdown += `- **Plants with no results**: ${noResults}\n`;
    markdown += `- **Plants with modified search names**: ${nameChanges}\n\n`;

    // Details by file
    markdown += '## Details by File\n\n';

    for (const [filename, results] of allResults) {
        markdown += `### ${filename}\n\n`;
        markdown += '| Swedish Name | Latin Name | Search Name | Taxon Match | Rank | Taxon Photos | Observations | Status |\n';
        markdown += '|--------------|------------|-------------|-------------|------|--------------|--------------|--------|\n';

        for (const result of results) {
            const swedish = result.swedishName;
            const latin = result.latinName;
            const search = result.searchName !== latin ? `**${result.searchName}**` : result.searchName;
            const match = result.taxonMatch ? result.taxonMatch.name : '—';
            const rank = result.taxonMatch?.rank || '—';
            const taxonPhotos = result.taxonMatch?.taxonPhotosCount || 0;
            const obsCount = result.observationCount;
            const totalPhotos = taxonPhotos + obsCount;

            let status = '✓';
            if (totalPhotos === 0) {
                status = '❌ No photos';
            } else if (totalPhotos < 4) {
                status = '⚠️ Few photos';
            }

            markdown += `| ${swedish} | ${latin} | ${search} | ${match} | ${rank} | ${taxonPhotos} | ${obsCount} | ${status} |\n`;
        }

        markdown += '\n';
    }

    // Warnings section
    const warnings = Array.from(allResults.values())
        .flat()
        .filter(r => r.warning);

    if (warnings.length > 0) {
        markdown += '## Warnings\n\n';
        for (const result of warnings) {
            markdown += `- **${result.swedishName}** (${result.latinName}): ${result.warning}\n`;
        }
        markdown += '\n';
    }

    writeFileSync(outputPath, markdown, 'utf-8');
}

/**
 * Main function
 */
async function main() {
    const args = process.argv.slice(2);
    const usePreprocessed = args.includes('--preprocessed');

    // Get filename from args (filter out flag arguments)
    const fileArg = args.find(arg => !arg.startsWith('--'));
    const targetFile = fileArg || 'plants.json';

    console.log('='.repeat(60));
    console.log('iNaturalist Data Validation Script');
    console.log('='.repeat(60));
    console.log(`Using ${usePreprocessed ? 'PREPROCESSED' : 'ORIGINAL'} plant files`);
    console.log(`Testing file: ${targetFile}\n`);

    // Paths
    const staticDir = join(process.cwd(), 'static');
    const sourceDir = usePreprocessed ? join(staticDir, 'preprocessed') : staticDir;
    const outputDir = join(process.cwd(), 'test-results');

    // Create output directory if it doesn't exist
    if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
        console.log(`Created output directory: ${outputDir}\n`);
    }

    // Check if the specified file exists
    const filePath = join(sourceDir, targetFile);
    if (!existsSync(filePath)) {
        console.error(`\nError: File not found: ${filePath}`);
        console.error(`\nAvailable files in ${sourceDir}:`);
        const availableFiles = readdirSync(sourceDir)
            .filter(file => file.startsWith('plants') && file.endsWith('.json'))
            .sort();
        availableFiles.forEach(file => console.error(`  - ${file}`));
        process.exit(1);
    }

    // Test the file
    const allResults = new Map<string, TestResult[]>();
    const startTime = Date.now();

    console.log(`\nTesting: ${targetFile}`);
    const results = await testFile(filePath);
    allResults.set(targetFile, results);

    // Generate report
    const reportBasename = targetFile.replace('.json', '-report.md');
    const reportPath = join(outputDir, reportBasename);
    generateMarkdownReport(allResults, reportPath);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n' + '='.repeat(60));
    console.log(`✓ Validation complete! (${duration}s)`);
    console.log('='.repeat(60));
    console.log(`\nReport saved to: ${reportPath}`);
}

// Run main function
main().catch(error => {
    console.error('\nError during validation:', error);
    process.exit(1);
});
