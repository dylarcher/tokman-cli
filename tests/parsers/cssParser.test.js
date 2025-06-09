// tests/parsers/cssParser.test.js
const { describe, it } = require('node:test');
const assert = require('node:assert');
const { extractCssCustomProperties } = require('../../src/parsers/cssParser');

describe('cssParser', () => {
    describe('extractCssCustomProperties', () => {
        it('should extract simple custom properties', () => {
            const css = ":root { --color-primary: blue; --size-padding: 10px; }";
            const props = extractCssCustomProperties(css, 'test.css');
            assert.deepStrictEqual(props, [
                { name: '--color-primary', value: 'blue', source: 'test.css' },
                { name: '--size-padding', value: '10px', source: 'test.css' },
            ]);
        });

        it('should handle properties with comments', () => {
            const css = "/* comment */ :root { /* another comment */ --color-accent: green; /* end comment */ }";
            const props = extractCssCustomProperties(css, 'test.css');
            assert.deepStrictEqual(props, [{ name: '--color-accent', value: 'green', source: 'test.css' }]);
        });

        it('should extract values with var() and calc() as strings', () => {
            const css = ":root { --complex-value: calc(var(--base-size) * 2); }";
            const props = extractCssCustomProperties(css, 'test.css');
            assert.deepStrictEqual(props, [{ name: '--complex-value', value: 'calc(var(--base-size) * 2)', source: 'test.css' }]);
        });

        it('should return empty array for CSS without custom properties', () => {
            const css = ".class { color: red; }";
            assert.deepStrictEqual(extractCssCustomProperties(css, 'test.css'), []);
        });
         it('should handle multi-line values correctly', () => {
            const css = ":root { --multi-line: 10px 20px 30px; }";
            const props = extractCssCustomProperties(css, 'test.css');
            assert.strictEqual(props[0].value, '10px 20px 30px');
        });
    });

    // processCssFile would be an integration of the two, testing them together.
    // Since readCssFile is a simple wrapper, we focus on extractCssCustomProperties.
    // processCssFile can be tested at a higher level if needed.
});
