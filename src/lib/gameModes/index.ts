
import { imageToSwedish } from './imageToSwedish';
import { swedishToLatin } from './swedishToLatin';
export const gameModes = [
    imageToSwedish,
    swedishToLatin
];
export type { GameMode, BaseQuestion } from './types';
