// tests/core/tokenConflictResolver.test.js
const { describe, it } = require('node:test');
const assert = require('node:assert');
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
        assert.strictEqual(resolved.length, 2);
        assert.strictEqual(resolved.find(t => t.name === 'color-primary').$value, '#FF0000');
        assert.strictEqual(resolved.find(t => t.name === 'color-primary').metadata.source, 'figma');

        const tokensCssFirst = [token1Css, token1Figma, token2Figma]; // CSS first for this name
        const resolvedCssFirst = resolveTokenConflicts(tokensCssFirst, 'figmaWins');
        assert.strictEqual(resolvedCssFirst.find(t => t.name === 'color-primary').$value, '#FF0000');
    });

    it('should allow css to win with "cssWins" strategy', () => {
        const tokens = [token1Figma, token1Css, token2Figma]; // Figma first
        const resolved = resolveTokenConflicts(tokens, 'cssWins');
        assert.strictEqual(resolved.find(t => t.name === 'color-primary').$value, '#0000FF');
        assert.strictEqual(resolved.find(t => t.name === 'color-primary').metadata.source, 'css');

        const tokensCssFirst = [token1Css, token1Figma, token2Figma]; // CSS first
        const resolvedCssFirst = resolveTokenConflicts(tokensCssFirst, 'cssWins');
        assert.strictEqual(resolvedCssFirst.find(t => t.name === 'color-primary').$value, '#0000FF');
    });

    it('should use last token with "sourceOrderWins" strategy', () => {
        const tokens = [token1Figma, token1Css, token2Figma]; // CSS is last for 'color-primary'
        let resolved = resolveTokenConflicts(tokens, 'sourceOrderWins');
        assert.strictEqual(resolved.find(t => t.name === 'color-primary').$value, '#0000FF');

        const tokensCssFirst = [token1Css, token1Figma, token2Figma]; // Figma is last for 'color-primary'
        resolved = resolveTokenConflicts(tokensCssFirst, 'sourceOrderWins');
        assert.strictEqual(resolved.find(t => t.name === 'color-primary').$value, '#FF0000');
    });

    it('should throw error with "throwError" strategy on conflict', () => {
        const tokens = [token1Figma, token1Css];
        assert.throws(() => resolveTokenConflicts(tokens, 'throwError'), /Token name conflict for "color-primary"/);
    });

    it('should not throw error with "throwError" strategy if no conflicts', () => {
        const tokens = [token1Figma, token2Figma, token3Css];
        assert.doesNotThrow(() => resolveTokenConflicts(tokens, 'throwError'));
        assert.strictEqual(resolveTokenConflicts(tokens, 'throwError').length, 3);
    });

    it('should keep all unique tokens', () => {
        const tokens = [token1Figma, token2Figma, token3Css];
        const resolved = resolveTokenConflicts(tokens, 'figmaWins');
        assert.strictEqual(resolved.length, 3);
    });
});
