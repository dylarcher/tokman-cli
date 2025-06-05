// tests/transformers/cssTransformer.test.js (or merge into baseTransformer.test.js)
const {
    transformCssPropNameToTokenName,
    inferDtcgTypeFromCssValue,
    transformCssPropertiesToInternalTokens
} = require('../../src/transformers/baseTransformer'); // Assuming functions are in baseTransformer
const InternalToken = require('../../src/core/InternalToken');

describe('CSS Transformation Logic', () => {
    describe('transformCssPropNameToTokenName', () => {
        it('should remove -- and lowercase', () => {
            expect(transformCssPropNameToTokenName('--Color-Primary-Accent')).toBe('color-primary-accent');
            expect(transformCssPropNameToTokenName('SIZE-spacing-SM')).toBe('size-spacing-sm');
        });
    });

    describe('inferDtcgTypeFromCssValue', () => {
        it('should infer color for hex and functions', () => {
            expect(inferDtcgTypeFromCssValue('#fff')).toBe('color');
            expect(inferDtcgTypeFromCssValue('#AABBCCDD')).toBe('color');
            expect(inferDtcgTypeFromCssValue('rgb(0,0,0)')).toBe('color');
            expect(inferDtcgTypeFromCssValue('hsl(0,0%,0%)')).toBe('color');
        });
        it('should infer dimension for values with units', () => {
            expect(inferDtcgTypeFromCssValue('16px')).toBe('dimension');
            expect(inferDtcgTypeFromCssValue('2.5em')).toBe('dimension');
            expect(inferDtcgTypeFromCssValue('10%')).toBe('dimension'); // % is a unit
        });
        it('should infer number for unitless numbers', () => {
            expect(inferDtcgTypeFromCssValue('1.5')).toBe('number');
            expect(inferDtcgTypeFromCssValue('400')).toBe('number');
        });
        it('should default to string for others', () => {
            expect(inferDtcgTypeFromCssValue('Open Sans')).toBe('string');
            expect(inferDtcgTypeFromCssValue('var(--my-var)')).toBe('string'); // var() is a string for now
            expect(inferDtcgTypeFromCssValue('calc(10px + 5px)')).toBe('string'); // calc() is a string
        });
    });

    describe('transformCssPropertiesToInternalTokens', () => {
        const cssProps = [
            { name: '--color-text', value: '#333', source: 'a.css' },
            { name: '--spacing-md', value: '16px', source: 'b.css' },
            { name: '--font-line-height', value: '1.5', source: 'a.css' },
            { name: '--font-family-body', value: '"Open Sans", sans-serif', source: 'b.css' },
        ];
        const tokens = transformCssPropertiesToInternalTokens(cssProps);

        it('should convert to InternalToken instances', () => {
            expect(tokens[0]).toBeInstanceOf(InternalToken);
            expect(tokens.length).toBe(4);
        });
        it('should transform names correctly', () => {
            expect(tokens[0].name).toBe('color-text');
            expect(tokens[1].name).toBe('spacing-md');
        });
        it('should infer types and assign values', () => {
            expect(tokens.find(t => t.name === 'color-text').$type).toBe('color');
            expect(tokens.find(t => t.name === 'color-text').$value).toBe('#333');
            expect(tokens.find(t => t.name === 'spacing-md').$type).toBe('dimension');
            expect(tokens.find(t => t.name === 'spacing-md').$value).toBe('16px');
            expect(tokens.find(t => t.name === 'font-line-height').$type).toBe('number');
            expect(tokens.find(t => t.name === 'font-line-height').$value).toBe(1.5); // Parsed to number
            expect(tokens.find(t => t.name === 'font-family-body').$type).toBe('string');
            expect(tokens.find(t => t.name === 'font-family-body').$value).toBe('"Open Sans", sans-serif');
        });
        it('should set metadata correctly', () => {
            expect(tokens[0].metadata.source).toBe('css');
            expect(tokens[0].metadata.originalName).toBe('--color-text');
            expect(tokens[0].metadata.css.sourceFile).toBe('a.css');
        });
    });
});
