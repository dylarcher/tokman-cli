// tests/parsers/cssParser.test.js
const { readCssFile, extractCssCustomProperties, processCssFile } = require('../../src/parsers/cssParser');
const fs = require('fs').promises;

jest.mock('fs', () => ({
    promises: {
        readFile: jest.fn(),
        // Mock other fs.promises functions if needed by other modules under test indirectly
    }
}));

describe('cssParser', () => {
    describe('readCssFile', () => {
        it('should read and return file content', async () => {
            fs.readFile.mockResolvedValue('file content');
            const content = await readCssFile('dummy.css');
            expect(content).toBe('file content');
            expect(fs.readFile).toHaveBeenCalledWith('dummy.css', 'utf8');
        });

        it('should throw if reading fails', async () => {
            fs.readFile.mockRejectedValue(new Error('Read error'));
            await expect(readCssFile('dummy.css')).rejects.toThrow('Read error');
        });
    });

    describe('extractCssCustomProperties', () => {
        it('should extract simple custom properties', () => {
            const css = ":root { --color-primary: blue; --size-padding: 10px; }";
            const props = extractCssCustomProperties(css, 'test.css');
            expect(props).toEqual([
                { name: '--color-primary', value: 'blue', source: 'test.css' },
                { name: '--size-padding', value: '10px', source: 'test.css' },
            ]);
        });

        it('should handle properties with comments', () => {
            const css = "/* comment */ :root { /* another comment */ --color-accent: green; /* end comment */ }";
            const props = extractCssCustomProperties(css, 'test.css');
            expect(props).toEqual([{ name: '--color-accent', value: 'green', source: 'test.css' }]);
        });

        it('should extract values with var() and calc() as strings', () => {
            const css = ":root { --complex-value: calc(var(--base-size) * 2); }";
            const props = extractCssCustomProperties(css, 'test.css');
            expect(props).toEqual([{ name: '--complex-value', value: 'calc(var(--base-size) * 2)', source: 'test.css' }]);
        });

        it('should return empty array for CSS without custom properties', () => {
            const css = ".class { color: red; }";
            expect(extractCssCustomProperties(css, 'test.css')).toEqual([]);
        });
         it('should handle multi-line values correctly', () => {
            const css = ":root { --multi-line: 10px 20px 30px; }";
            const props = extractCssCustomProperties(css, 'test.css');
            expect(props[0].value).toBe('10px 20px 30px');
        });
    });

    // processCssFile would be an integration of the two, testing them together.
});
