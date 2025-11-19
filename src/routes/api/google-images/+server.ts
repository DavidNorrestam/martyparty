/**
 * API endpoint for fetching Google Images search results
 * This is a server-side endpoint to avoid CORS issues
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export interface GoogleImageResult {
    url: string;
    thumbnail: string;
    title: string;
    source: string;
    width?: number;
    height?: number;
}

/**
 * Parse Google Images HTML to extract image data
 * Note: This is a simple scraper and may break if Google changes their HTML structure
 */
function parseGoogleImages(html: string): GoogleImageResult[] {
    const results: GoogleImageResult[] = [];

    // Google Images uses JSON data in script tags
    // Look for patterns like: ["https://...",width,height]
    const scriptMatches = html.matchAll(/<script[^>]*>(.*?)<\/script>/gs);

    for (const match of scriptMatches) {
        const scriptContent = match[1];

        // Look for image URLs in the format: ["url",width,height]
        // This is a simplified parser - Google's actual format is more complex
        const imagePattern = /\["(https?:\/\/[^"]+\.(?:jpg|jpeg|png|gif|webp)[^"]*)",(\d+),(\d+)\]/gi;
        const imageMatches = scriptContent.matchAll(imagePattern);

        for (const imgMatch of imageMatches) {
            const url = imgMatch[1];
            const width = parseInt(imgMatch[2]);
            const height = parseInt(imgMatch[3]);

            // Skip very small images (likely icons)
            if (width < 100 || height < 100) continue;

            // Try to extract the source domain
            let source = '';
            try {
                const urlObj = new URL(url);
                source = urlObj.hostname;
            } catch (e) {
                source = 'Unknown';
            }

            results.push({
                url,
                thumbnail: url, // Use same URL for now
                title: '',
                source,
                width,
                height
            });
        }
    }

    // Remove duplicates
    const uniqueResults = Array.from(
        new Map(results.map(item => [item.url, item])).values()
    );

    return uniqueResults;
}

export const GET: RequestHandler = async ({ url }) => {
    const query = url.searchParams.get('q');

    if (!query) {
        return json({ error: 'Missing query parameter' }, { status: 400 });
    }

    try {
        // Fetch Google Images search results
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch&safe=active`;
        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            }
        });

        if (!response.ok) {
            throw new Error(`Google search failed: ${response.status}`);
        }

        const html = await response.text();
        const images = parseGoogleImages(html);

        return json({
            query,
            results: images.slice(0, 50) // Limit to 50 results
        });
    } catch (error) {
        console.error('Error fetching Google Images:', error);
        return json({
            error: 'Failed to fetch images',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
};
