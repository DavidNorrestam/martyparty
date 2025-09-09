
import { imageToSwedish } from './imageToSwedish';
import { swedishToLatin } from './swedishToLatin';
import { imageToNameFreetext } from './imageToNameFreetext';

export const gameModes = [
    imageToSwedish,
    swedishToLatin,
    imageToNameFreetext
];
export type { GameMode, BaseQuestion } from './types';
