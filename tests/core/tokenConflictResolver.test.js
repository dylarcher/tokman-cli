// tests/core/tokenConflictResolver.test.js
const { resolveTokenConflicts } = require('../../src/core/tokenConflictResolver');
const InternalToken = require('../../src/core/InternalToken');

describe('tokenConflictResolver', () => {
    const token1Figma = new InternalToken('color-primary', ['color', 'primary'], '#FF0000', 'color', 'Figma Red', { source: 'figma', originalName: 'figma/red' });
    const token1Css = new InternalToken('color-primary', ['color', 'primary'], '#0000FF', 'color', 'CSS Blue', { source: 'css', originalName: '--css-blue' });
    const token2Figma = new InternalToken('size-small', ['size', 'small'], '10px', 'dimension', 'Figma Small', { source: 'figma', originalName: 'figma/small' });
    const token3Css = new InternalToken('font-body', ['font', 'body'], 'Arial', 'string', 'CSS Arial', { source: 'css', originalName: '--css-arial' });

    it('should allow figma to win with "figmaWins" strategy', () => {
        const tokens = [token1Figma, token1Css, token2Figma]; // Figma first for this name
        const resolved = resolveTokenConflicts(tokens, 'figmaWins');
        expect(resolved).toHaveLength(2);
        expect(resolved.find(t => t.name === 'color-primary').$value).toBe('#FF0000');
        expect(resolved.find(t => t.name === 'color-primary').metadata.source).toBe('figma');

        const tokensCssFirst = [token1Css, token1Figma, token2Figma]; // CSS first for this name
        const resolvedCssFirst = resolveTokenConflicts(tokensCssFirst, 'figmaWins');
        expect(resolvedCssFirst.find(t => t.name === 'color-primary').$value).toBe('#FF0000');
    });

    it('should allow css to win with "cssWins" strategy', () => {
        const tokens = [token1Figma, token1Css, token2Figma]; // Figma first
        const resolved = resolveTokenConflicts(tokens, 'cssWins');
        expect(resolved.find(t => t.name === 'color-primary').$value).toBe('#0000FF');
        expect(resolved.find(t => t.name === 'color-primary').metadata.source).toBe('css');

        const tokensCssFirst = [token1Css, token1Figma, token2Figma]; // CSS first
        const resolvedCssFirst = resolveTokenConflicts(tokensCssFirst, 'cssWins');
        expect(resolvedCssFirst.find(t => t.name === 'color-primary').$value).toBe('#0000FF');
    });

    it('should use last token with "sourceOrderWins" strategy', () => {
        const tokens = [token1Figma, token1Css, token2Figma]; // CSS is last for 'color-primary'
        let resolved = resolveTokenConflicts(tokens, 'sourceOrderWins');
        expect(resolved.find(t => t.name === 'color-primary').$value).toBe('#0000FF');

        const tokensCssFirst = [token1Css, token1Figma, token2Figma]; // Figma is last for 'color-primary'
        resolved = resolveTokenConflicts(tokensCssFirst, 'sourceOrderWins');
        expect(resolved.find(t => t.name === 'color-primary').$value).toBe('#FF0000');
    });

    it('should throw error with "throwError" strategy on conflict', () => {
        const tokens = [token1Figma, token1Css];
        expect(() => resolveTokenConflicts(tokens, 'throwError')).toThrow('Token name conflict for "color-primary"');
    });

    it('should not throw error with "throwError" strategy if no conflicts', () => {
        const tokens = [token1Figma, token2Figma, token3Css];
        expect(() => resolveTokenConflicts(tokens, 'throwError')).not.toThrow();
        expect(resolveTokenConflicts(tokens, 'throwError')).toHaveLength(3);
    });

    it('should keep all unique tokens', () => {
        const tokens = [token1Figma, token2Figma, token3Css];
        const resolved = resolveTokenConflicts(tokens, 'figmaWins');
        expect(resolved).toHaveLength(3);
    });
});
