import { describe, it, expect } from 'vitest';
import { selectImagesForPlant } from './game-logic';
import type { Plant } from '../types';

describe('selectImagesForPlant', () => {
    it('should prioritize manual photos when available', () => {
        const plant: Plant = {
            swedishName: 'Test Plant',
            latinName: 'Testus plantus',
            manualPhotos: ['manual1.jpg', 'manual2.jpg', 'manual3.jpg', 'manual4.jpg', 'manual5.jpg'],
            taxonPhotos: ['taxon1.jpg', 'taxon2.jpg'],
            observationPhotos: ['obs1.jpg', 'obs2.jpg']
        };

        const result = selectImagesForPlant(plant);

        expect(result.length).toBeLessThanOrEqual(4);
        expect(result.every((img) => plant.manualPhotos?.includes(img))).toBe(true);
    });

    it('should mix taxon and observation photos when no manual photos', () => {
        const plant: Plant = {
            swedishName: 'Test Plant',
            latinName: 'Testus plantus',
            taxonPhotos: ['taxon1.jpg', 'taxon2.jpg', 'taxon3.jpg'],
            observationPhotos: ['obs1.jpg', 'obs2.jpg', 'obs3.jpg']
        };

        const result = selectImagesForPlant(plant);

        expect(result.length).toBeLessThanOrEqual(4);
        expect(result.length).toBeGreaterThan(0);
    });

    it('should handle plants with limited photos', () => {
        const plant: Plant = {
            swedishName: 'Test Plant',
            latinName: 'Testus plantus',
            taxonPhotos: ['taxon1.jpg'],
            observationPhotos: []
        };

        const result = selectImagesForPlant(plant);

        expect(result.length).toBe(1);
        expect(result[0]).toBe('taxon1.jpg');
    });

    it('should return empty array when no photos available', () => {
        const plant: Plant = {
            swedishName: 'Test Plant',
            latinName: 'Testus plantus',
            taxonPhotos: [],
            observationPhotos: []
        };

        const result = selectImagesForPlant(plant);

        expect(result.length).toBe(0);
    });
});
