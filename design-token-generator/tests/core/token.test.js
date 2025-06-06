// tests/core/token.test.js
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
      expect(token.name).toBe(tokenData.name);
      expect(token.path).toEqual(tokenData.path);
      expect(token.$value).toBe(tokenData.value);
      expect(token.$type).toBe(tokenData.type);
      expect(token.$description).toBe(tokenData.description);
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
      expect(token.originalValue).toBe(tokenData.originalValue);
      expect(token.source).toBe(tokenData.source);
      expect(token.extensions).toEqual(tokenData.extensions);
      expect(token.aliasOf).toBe(tokenData.aliasOf);
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
      expect(token).toBeInstanceOf(DesignToken);
      expect(token.name).toBe(tokenData.name);
    });

    it('should throw an error if required fields are missing', () => {
      expect(() => createToken({ name: 'test', path: ['test'] })).toThrow('Token name, path, value, and type are required.');
      expect(() => createToken({ name: 'test', path: ['test'], value: 'val' })).toThrow('Token name, path, value, and type are required.');
    });
  });
});
