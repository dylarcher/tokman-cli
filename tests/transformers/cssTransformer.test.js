// tests/transformers/cssTransformer.test.js
const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
    transformCssPropNameToTokenName,
    inferDtcgTypeFromCssValue,
    transformCssPropertiesToInternalTokens
} = require('../../src/transformers/cssTransformer'); // Corrected path
const InternalToken = require('../../src/core/InternalToken');

describe('CSS Transformation Logic', () => {
    describe('transformCssPropNameToTokenName', () => {
        it('should remove -- and lowercase', () => {
            assert.strictEqual(transformCssPropNameToTokenName('--Color-Primary-Accent'), 'color-primary-accent');
            assert.strictEqual(transformCssPropNameToTokenName('SIZE-spacing-SM'), 'size-spacing-sm');
        });
    });

    describe('inferDtcgTypeFromCssValue', () => {
        it('should infer color for hex and functions', () => {
            assert.strictEqual(inferDtcgTypeFromCssValue('#fff'), 'color');
            assert.strictEqual(inferDtcgTypeFromCssValue('#AABBCCDD'), 'color');
            assert.strictEqual(inferDtcgTypeFromCssValue('rgb(0,0,0)'), 'color');
            assert.strictEqual(inferDtcgTypeFromCssValue('hsl(0,0%,0%)'), 'color');
        });
        it('should infer dimension for values with units', () => {
            assert.strictEqual(inferDtcgTypeFromCssValue('16px'), 'dimension');
            assert.strictEqual(inferDtcgTypeFromCssValue('2.5em'), 'dimension');
            assert.strictEqual(inferDtcgTypeFromCssValue('10%'), 'dimension'); // % is a unit
        });
        it('should infer number for unitless numbers', () => {
            assert.strictEqual(inferDtcgTypeFromCssValue('1.5'), 'number');
            assert.strictEqual(inferDtcgTypeFromCssValue('400'), 'number');
        });
        it('should default to string for others', () => {
            assert.strictEqual(inferDtcgTypeFromCssValue('Open Sans'), 'string');
            assert.strictEqual(inferDtcgTypeFromCssValue('var(--my-var)'), 'string'); // var() is a string for now
            assert.strictEqual(inferDtcgTypeFromCssValue('calc(10px + 5px)'), 'string'); // calc() is a string
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
            assert.ok(tokens[0] instanceof InternalToken);
            assert.strictEqual(tokens.length, 4);
        });
        it('should transform names correctly', () => {
            assert.strictEqual(tokens[0].name, 'color-text');
            assert.strictEqual(tokens[1].name, 'spacing-md');
        });
        it('should infer types and assign values', () => {
            assert.strictEqual(tokens.find(t => t.name === 'color-text').$type, 'color');
            assert.strictEqual(tokens.find(t => t.name === 'color-text').$value, '#333');
            assert.strictEqual(tokens.find(t => t.name === 'spacing-md').$type, 'dimension');
            assert.strictEqual(tokens.find(t => t.name === 'spacing-md').$value, '16px');
            assert.strictEqual(tokens.find(t => t.name === 'font-line-height').$type, 'number');
            assert.strictEqual(tokens.find(t => t.name === 'font-line-height').$value, 1.5); // Parsed to number
            assert.strictEqual(tokens.find(t => t.name === 'font-family-body').$type, 'string');
            assert.strictEqual(tokens.find(t => t.name === 'font-family-body').$value, '"Open Sans", sans-serif');
        });
        it('should set metadata correctly', () => {
            assert.strictEqual(tokens[0].metadata.source, 'css');
            assert.strictEqual(tokens[0].metadata.originalName, '--color-text');
            assert.strictEqual(tokens[0].metadata.css.sourceFile, 'a.css');
        });
    });
});
