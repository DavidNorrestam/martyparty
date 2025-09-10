import { imageToNameFreetext } from './imageToNameFreetext';

describe('imageToNameFreetext.checkAnswer', () => {
    const question = {
        swedishName: 'Alunrot',
        latinName: 'Heuchera sp.',
        images: [],
        answer: ''
    };
    const question2 = {
        swedishName: 'Korallkornell',
        latinName: "Cornus Alba 'Sibirica'",
        images: [],
        answer: ''
    };

    it('accepts "alunrot / heuchera sp"', () => {
        const userAnswer = JSON.stringify({ swedish: 'alunrot', latin: 'heuchera sp' });
        expect(imageToNameFreetext.checkAnswer(question, userAnswer)).toBe(true);
    });

    it('accepts "korallkornell / cornus alba sibirica"', () => {
        const userAnswer = JSON.stringify({ swedish: 'korallkornell', latin: 'cornus alba sibirica' });
        expect(imageToNameFreetext.checkAnswer(question2, userAnswer)).toBe(true);
    });

    it('rejects incorrect answers', () => {
        const userAnswer = JSON.stringify({ swedish: 'wrong', latin: 'heuchera sp' });
        expect(imageToNameFreetext.checkAnswer(question, userAnswer)).toBe(false);
    });
});
