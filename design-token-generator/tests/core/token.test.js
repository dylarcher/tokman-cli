// tests/core/token.test.js
const { describe, it } = require('node:test');
const assert = require('node:assert');
const { DesignToken, createToken } = require('../../src/core/token');

describe('Core Token Representation', () => {
  describe('DesignToken Class', () => {
    it('should create a token with required properties', () => {
      const tokenData = {
        name: 'color-brand-primary',
        path: ['color', 'brand', 'primary'],
        value: '#FFFFFF',
        type: 'color',
        description: 'Primary brand color'
      };
      const token = new DesignToken(tokenData);
      assert.strictEqual(token.name, tokenData.name);
      assert.deepStrictEqual(token.path, tokenData.path);
      assert.strictEqual(token.$value, tokenData.value);
      assert.strictEqual(token.$type, tokenData.type);
      assert.strictEqual(token.$description, tokenData.description);
    });

    it('should create a token with all optional properties', () => {
      const tokenData = {
        name: 'size-font-large',
        path: ['size', 'font', 'large'],
        value: '2rem',
        type: 'dimension',
        description: 'Large font size',
        originalValue: '32px',
        source: 'figma:file123/var456',
        extensions: { category: 'font' },
        aliasOf: 'size.font.base'
      };
      const token = new DesignToken(tokenData);
      assert.strictEqual(token.originalValue, tokenData.originalValue);
      assert.strictEqual(token.source, tokenData.source);
      assert.deepStrictEqual(token.extensions, tokenData.extensions);
      assert.strictEqual(token.aliasOf, tokenData.aliasOf);
    });
  });

  describe('createToken Factory', () => {
    it('should create a token successfully with valid data', () => {
      const tokenData = {
        name: 'color-brand-secondary',
        path: ['color', 'brand', 'secondary'],
        value: '#000000',
        type: 'color',
        description: 'Secondary brand color'
      };
      const token = createToken(tokenData);
      assert.ok(token instanceof DesignToken);
      assert.strictEqual(token.name, tokenData.name);
    });

    it('should throw an error if required fields are missing', () => {
      assert.throws(() => createToken({ name: 'test', path: ['test'] }), /Token name, path, value, and type are required./);
      assert.throws(() => createToken({ name: 'test', path: ['test'], value: 'val' }), /Token name, path, value, and type are required./);
    });
  });
});
