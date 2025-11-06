/**
 * Utility functions for preprocessing plant data
 */

/**
 * Clean a Latin name for use in iNaturalist API queries
 * Removes variety, cultivar, and subspecies notation while keeping the actual names
 * 
 * @param name - The original Latin name
 * @returns Cleaned Latin name suitable for API queries
 */
export function cleanLatinName(name: string): string {
    let cleaned = name;

    // Remove anything in quotes (cultivars like 'Sibirica' or "Winter Beauty")
    cleaned = cleaned.replace(/"[^"]*"|'[^']*'/g, '');

    // Remove variety notation (var. or v.) and the following word
    cleaned = cleaned.replace(/\s+(var|v)\.\s+\S+/gi, '');

    // Remove form notation (f.) and the following word
    cleaned = cleaned.replace(/\s+f\.\s+\S+/gi, '');

    // Remove cultivar notation (cv.) and the following word
    cleaned = cleaned.replace(/\s+cv\.\s+\S+/gi, '');

    // Remove "subsp." text but keep the subspecies name
    cleaned = cleaned.replace(/\s+subsp\.\s+/gi, ' ');

    // Remove trailing "sp." or "sp" (uncertain species)
    cleaned = cleaned.replace(/\s+sp\.?$/i, '');

    // Collapse multiple spaces and trim
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
}

/**
 * Test the cleanLatinName function with examples
 */
export function testCleanLatinName() {
    const testCases = [
        { input: 'Acer palmatum', expected: 'Acer palmatum' },
        { input: "Cornus alba 'Sibirica'", expected: 'Cornus alba' },
        { input: 'Dahlia sp.', expected: 'Dahlia' },
        { input: 'Heuchera sp.', expected: 'Heuchera' },
        { input: 'Acer tataricum subsp. ginnala', expected: 'Acer tataricum ginnala' },
        { input: 'Malus toringo var. sargentii', expected: 'Malus toringo' },
        { input: "Neillia incisa 'Crispa'", expected: 'Neillia incisa' },
        { input: 'Rosa rugosa f. alba', expected: 'Rosa rugosa' },
        { input: 'Prunus cv. Kanzan', expected: 'Prunus' },
    ];

    console.log('Testing cleanLatinName function:\n');
    let allPassed = true;

    for (const testCase of testCases) {
        const result = cleanLatinName(testCase.input);
        const passed = result === testCase.expected;
        allPassed = allPassed && passed;

        const status = passed ? '✓' : '✗';
        console.log(`${status} Input: "${testCase.input}"`);
        console.log(`  Expected: "${testCase.expected}"`);
        console.log(`  Got:      "${result}"`);
        if (!passed) {
            console.log('  FAILED!');
        }
        console.log();
    }

    console.log(allPassed ? 'All tests passed!' : 'Some tests failed!');
    return allPassed;
}

/**
 * WFO API response types
 */
interface WFOCandidate {
    wfo_id: string;
    full_name_plain: string;
    placement?: string;
}

interface WFOMatchingResponse {
    match?: WFOCandidate;
    candidates?: WFOCandidate[];
    error: boolean;
    errorMessage?: string;
}

interface WFOGraphQLResponse {
    data?: {
        taxonNameById?: {
            fullNameStringPlain: string;
            currentPreferredUsage?: {
                hasName?: {
                    fullNameStringPlain: string;
                };
            };
        };
    };
    errors?: Array<{
        message: string;
    }>;
}

export interface WFOData {
    isAccepted: boolean;
    isSynonym: boolean;
    acceptedName: string;
    wfoId?: string;
    hasMatch: boolean;
}

/**
 * Extract just the canonical name parts from a full botanical name
 * Removes author citations and keeps only genus, species, and infraspecific epithets
 * 
 * @param fullName - Full botanical name with authors (e.g., "Euonymus sachalinensis (F.Schmidt) Maxim.")
 * @returns Canonical name without authors (e.g., "Euonymus sachalinensis")
 */
function extractCanonicalName(fullName: string): string {
    // Match: Genus species [infraspecific-rank] [infraspecific-epithet]
    // Examples:
    // "Euonymus sachalinensis (F.Schmidt) Maxim." -> "Euonymus sachalinensis"
    // "Symphoricarpos albus var. laevigatus (Fernald) S.F.Blake" -> "Symphoricarpos albus laevigatus"
    // "Acer palmatum Thunb." -> "Acer palmatum"

    // Remove everything in parentheses (basionym authors)
    let cleaned = fullName.replace(/\([^)]*\)/g, '');

    // Match the pattern: Genus species [rank marker] [infraspecific] [authors]
    // Rank markers: var., subsp., f., forma, etc.
    const match = cleaned.match(/^([A-Z][a-z]+)\s+([a-z]+)(?:\s+(?:var\.|subsp\.|f\.|forma|subspecies|variety)\s+([a-z]+))?/);

    if (match) {
        const genus = match[1];
        const species = match[2];
        const infraspecific = match[3];

        if (infraspecific) {
            return `${genus} ${species} ${infraspecific}`;
        }
        return `${genus} ${species}`;
    }

    // Fallback: just try to grab genus and species
    const simpleMatch = fullName.match(/^([A-Z][a-z]+)\s+([a-z]+)/);
    return simpleMatch ? `${simpleMatch[1]} ${simpleMatch[2]}` : fullName;
}

/**
 * Query the WFO GraphQL API to get the accepted name for a WFO ID
 * 
 * @param wfoId - The WFO identifier (e.g., "wfo-0000682004")
 * @returns The accepted name, or null if query fails
 */
async function getAcceptedNameFromWFOId(wfoId: string): Promise<string | null> {
    try {
        const query = {
            query: `query { taxonNameById(nameId: "${wfoId}") { fullNameStringPlain currentPreferredUsage { hasName { fullNameStringPlain } } } }`
        };

        const response = await fetch('https://list.worldfloraonline.org/gql.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(query),
        });

        if (!response.ok) {
            console.warn(`WFO GraphQL request failed for "${wfoId}": ${response.status}`);
            return null;
        }

        const data: WFOGraphQLResponse = await response.json();

        if (data.errors) {
            console.warn(`WFO GraphQL errors for "${wfoId}":`, data.errors);
            return null;
        }

        const taxonData = data.data?.taxonNameById;
        if (!taxonData) {
            return null;
        }

        // Get the accepted name from currentPreferredUsage
        const acceptedFullName = taxonData.currentPreferredUsage?.hasName?.fullNameStringPlain;

        if (acceptedFullName) {
            return extractCanonicalName(acceptedFullName);
        }

        return null;
    } catch (error) {
        console.error(`Error querying WFO GraphQL API for "${wfoId}":`, error);
        return null;
    }
}

/**
 * Query the World Flora Online (WFO) Plant List API to get the accepted name
 * Uses a two-step process:
 * 1. Match the name using the REST matching API to get a WFO ID
 * 2. Query the GraphQL API with the WFO ID to get the authoritative accepted name
 * 
 * This approach is more reliable than parsing the placement field, as it uses
 * the structured data from WFO's taxonomic database.
 * 
 * @param name - The Latin name to look up
 * @returns Object with accepted name and synonym status
 */
export async function getAcceptedName(name: string): Promise<WFOData> {
    try {
        // Step 1: Match the name to get a WFO ID
        const url = `https://list.worldfloraonline.org/matching_rest.php?input_string=${encodeURIComponent(name)}`;
        const response = await fetch(url);

        if (!response.ok) {
            console.warn(`WFO API request failed for "${name}": ${response.status}`);
            return {
                isAccepted: true,
                isSynonym: false,
                acceptedName: name,
                hasMatch: false,
            };
        }

        const data: WFOMatchingResponse = await response.json();

        if (data.error) {
            console.warn(`WFO API error for "${name}": ${data.errorMessage}`);
            return {
                isAccepted: true,
                isSynonym: false,
                acceptedName: name,
                hasMatch: false,
            };
        }

        // Get the WFO ID from either a direct match or the first candidate
        let wfoId: string | undefined;

        if (data.match) {
            wfoId = data.match.wfo_id;
        } else if (data.candidates && data.candidates.length > 0) {
            // When there are multiple candidates but no direct match,
            // prefer the one that most closely matches the input
            wfoId = data.candidates[0].wfo_id;
        }

        if (!wfoId) {
            console.warn(`No WFO match found for "${name}"`);
            return {
                isAccepted: true,
                isSynonym: false,
                acceptedName: name,
                hasMatch: false,
            };
        }

        // Step 2: Query GraphQL API to get the accepted name
        const acceptedName = await getAcceptedNameFromWFOId(wfoId);

        if (!acceptedName) {
            // Fallback: extract canonical name from the matched result
            const matchedName = data.match?.full_name_plain || data.candidates?.[0]?.full_name_plain;
            if (matchedName) {
                const canonical = extractCanonicalName(matchedName);
                return {
                    isAccepted: true,
                    isSynonym: false,
                    acceptedName: canonical,
                    wfoId,
                    hasMatch: true,
                };
            }

            return {
                isAccepted: true,
                isSynonym: false,
                acceptedName: name,
                wfoId,
                hasMatch: true,
            };
        }

        // Check if the name was changed (i.e., it was a synonym)
        // Note: We compare canonical forms (without authors and rank markers)
        // so "Symphoricarpos albus laevigatus" matches "Symphoricarpos albus var. laevigatus"
        const originalCanonical = extractCanonicalName(name);
        const isSynonym = acceptedName.toLowerCase() !== originalCanonical.toLowerCase();

        return {
            isAccepted: !isSynonym,
            isSynonym,
            acceptedName,
            wfoId,
            hasMatch: true,
        };
    } catch (error) {
        console.error(`Error querying WFO API for "${name}":`, error);
        return {
            isAccepted: true,
            isSynonym: false,
            acceptedName: name,
            hasMatch: false,
        };
    }
}

/**
 * Add a delay between API calls to respect rate limits
 * @param ms - Milliseconds to wait
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * iNaturalist photo data
 */
export interface INaturalistPhotos {
    taxonPhotos: string[];
    observationPhotos: string[];
}

/**
 * Fetch taxon photos and observation photos from iNaturalist API
 * This follows the same logic as the quiz page to ensure consistent behavior
 * 
 * @param searchName - The plant name to search for (should use searchName from preprocessed data)
 * @returns Object with arrays of taxon photo URLs and observation photo URLs
 */
export async function fetchINaturalistPhotos(searchName: string): Promise<INaturalistPhotos> {
    try {
        // Step 1: Get taxon ID
        const taxaResp = await fetch(
            `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(searchName)}`
        );
        const taxaData = await taxaResp.json();

        if (!taxaData.results || taxaData.results.length === 0) {
            return { taxonPhotos: [], observationPhotos: [] };
        }

        const taxonId = taxaData.results[0].id;

        // Step 2: Get taxon photos
        const taxonResp = await fetch(
            `https://api.inaturalist.org/v1/taxa/${taxonId}`
        );
        const taxonData = await taxonResp.json();

        let taxonPhotos: string[] = [];
        if (
            taxonData.results &&
            taxonData.results.length > 0 &&
            taxonData.results[0].taxon_photos
        ) {
            taxonPhotos = taxonData.results[0].taxon_photos
                .map((p: any) => p.photo?.medium_url)
                .filter(Boolean)
                .slice(0, 10); // Only use the first 10 taxon photos
        }

        // Step 3: Get observation photos
        let obsPhotos: string[] = [];
        try {
            // First try with popular=true filter for better quality photos
            let obsResp = await fetch(
                `https://api.inaturalist.org/v1/observations?taxon_name=${encodeURIComponent(searchName)}&photos=true&popular=true&per_page=30&order_by=date_added&order=desc`
            );
            let obsData = await obsResp.json();

            // If we don't have enough results with popular filter, try again without it
            if (!obsData.results || obsData.results.length < 10) {
                obsResp = await fetch(
                    `https://api.inaturalist.org/v1/observations?taxon_name=${encodeURIComponent(searchName)}&photos=true&per_page=30&order_by=date_added&order=desc`
                );
                obsData = await obsResp.json();
            }

            if (obsData.results && obsData.results.length > 0) {
                obsPhotos = obsData.results
                    .flatMap((r: any) =>
                        (r.photos || []).map((p: any) => {
                            if (p.url) {
                                // Replace 'square' (or any size) in the filename with 'medium'
                                return p.url.replace(
                                    /(square|small|thumb|original|large)(\.[a-zA-Z]+)$/i,
                                    'medium$2'
                                );
                            }
                            return null;
                        })
                    )
                    .filter(Boolean);
            }
        } catch (err) {
            console.warn(`Failed to fetch observation photos for "${searchName}":`, err);
        }

        // Remove any observation photos that are duplicates of taxon photos
        obsPhotos = obsPhotos.filter((url) => !taxonPhotos.includes(url));

        return {
            taxonPhotos,
            observationPhotos: obsPhotos,
        };
    } catch (error) {
        console.error(`Error fetching iNaturalist photos for "${searchName}":`, error);
        return { taxonPhotos: [], observationPhotos: [] };
    }
}

/**
 * Test the WFO API integration
 */
async function testWFOAPI() {
    console.log('\nTesting WFO API integration:\n');

    const testNames = [
        'Euonymus planipes',                        // Synonym -> should become "Euonymus sachalinensis"
        'Symphoricarpos albus laevigatus',          // Accepted (cleaned from subsp.) -> should stay similar
        'Acer palmatum',                            // Accepted
        'Fagus sylvatica',                          // Accepted
    ];

    for (const name of testNames) {
        console.log(`Looking up: "${name}"`);
        const result = await getAcceptedName(name);
        console.log(`  Has match: ${result.hasMatch}`);
        console.log(`  Is synonym: ${result.isSynonym}`);
        console.log(`  Accepted name: ${result.acceptedName}`);
        if (result.wfoId) {
            console.log(`  WFO ID: ${result.wfoId}`);
        }
        console.log();

        // Add delay to respect API rate limits
        await delay(500);
    }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    testCleanLatinName();
    testWFOAPI().catch(console.error);
}
