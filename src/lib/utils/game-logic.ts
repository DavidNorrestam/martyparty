import { asset } from "$app/paths";
import type { Plant } from "../types";

/**
 * Selects a mix of taxon and observation photos for a plant.
 * Prioritizes manual photos if available.
 * Attempts to pick 2 taxon and 2 observation photos, shuffling them.
 */
export function selectImagesForPlant(plant: Plant): string[] {
    // If manual photos exist, use those instead
    if (plant.manualPhotos && plant.manualPhotos.length > 0) {
        const shuffled = [...plant.manualPhotos];
        shuffleArray(shuffled);
        return shuffled.slice(0, 4);
    }

    const taxonPhotos = plant.taxonPhotos || [];
    const observationPhotos = plant.observationPhotos || [];

    // Shuffle source arrays
    const shuffledTaxon = [...taxonPhotos];
    shuffleArray(shuffledTaxon);

    const shuffledObs = [...observationPhotos];
    shuffleArray(shuffledObs);

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
    shuffleArray(selected);

    return selected;
}

/**
 * Fisher-Yates shuffle helper
 */
function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Fetches plant data, preferring preprocessed data but falling back to original.
 * Optionally processes images for specific modes.
 */
export async function fetchPlantData(modeId?: string): Promise<Plant[]> {
    // Try to load preprocessed data first, fall back to original if not available
    let res = await fetch(asset("/preprocessed/plants.json"));
    if (!res.ok) {
        console.warn("Preprocessed data not found, falling back to original");
        res = await fetch(asset("/plants.json"));
    }
    let data = await res.json();

    // If mode requires images, select random images from preprocessed data
    if (
        modeId &&
        (modeId === "image-to-swedish" || modeId === "imageToNameFreetext")
    ) {
        data = data.map((plant: Plant) => {
            const images = selectImagesForPlant(plant);
            return { ...plant, images };
        });
    }

    return data;
}
