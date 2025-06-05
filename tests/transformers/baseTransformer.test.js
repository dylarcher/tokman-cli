// tests/transformers/baseTransformer.test.js

const {
  transformFigmaNameToTokenName,
  mapFigmaTypeToDTCGType,
  transformFigmaVariablesToInternalTokens,
} = require('../../src/transformers/baseTransformer');
const InternalToken = require('../../src/core/InternalToken');

describe('baseTransformer', () => {
  describe('transformFigmaNameToTokenName', () => {
    it('should transform names correctly', () => {
      expect(transformFigmaNameToTokenName('colors/brand/primary')).toBe('colors-brand-primary');
      expect(transformFigmaNameToTokenName('Spacing/Small')).toBe('spacing-small');
      expect(transformFigmaNameToTokenName('text case')).toBe('text-case');
      expect(transformFigmaNameToTokenName('')).toBe('');
    });
  });

  describe('mapFigmaTypeToDTCGType', () => {
    it('should map types correctly', () => {
      expect(mapFigmaTypeToDTCGType('COLOR')).toBe('color');
      expect(mapFigmaTypeToDTCGType('FLOAT')).toBe('number');
      expect(mapFigmaTypeToDTCGType('STRING')).toBe('string');
      expect(mapFigmaTypeToDTCGType('BOOLEAN')).toBe('boolean');
      expect(mapFigmaTypeToDTCGType('UNKNOWN_TYPE')).toBe('string'); // Default fallback
    });
  });

  describe('transformFigmaVariablesToInternalTokens', () => {
    const mockParsedFigmaVariables = [
      {
        id: 'var1',
        name: 'colors/primary',
        variableCollection: { id: 'col1', name: 'Brand Colors', modes: [{id: 'modeA', name: 'Light'}], defaultModeId: 'modeA' },
        resolvedType: 'COLOR',
        valuesByMode: { 'Light': { r: 255, g: 0, b: 0, a: 1 } }, // Already "parsed" color
        description: 'Primary color',
        scopes: ['ALL_SCOPES'],
        codeSyntax: {},
        rawFigmaData: {}
      },
      {
        id: 'var2',
        name: 'spacing/Small',
        variableCollection: { id: 'col1', name: 'Brand Colors', modes: [{id: 'modeA', name: 'Light'}], defaultModeId: 'modeA' },
        resolvedType: 'FLOAT',
        valuesByMode: { 'Light': 10 },
        description: 'Small spacing',
        scopes: [],
        codeSyntax: {},
        rawFigmaData: {}
      },
      {
        id: 'var3',
        name: 'options/is-active',
        variableCollection: { id: 'col1', name: 'Brand Colors', modes: [{id: 'modeA', name: 'Light'}], defaultModeId: 'modeA' },
        resolvedType: 'BOOLEAN',
        valuesByMode: { 'Light': false },
        description: 'Is active flag',
        scopes: [],
        codeSyntax: {},
        rawFigmaData: {}
      }
    ];

    it('should transform parsed Figma variables to InternalToken objects', () => {
      const internalTokens = transformFigmaVariablesToInternalTokens(mockParsedFigmaVariables);
      expect(internalTokens).toHaveLength(3);

      const token1 = internalTokens.find(t => t.metadata.figma.id === 'var1');
      expect(token1).toBeInstanceOf(InternalToken);
      expect(token1.name).toBe('colors-primary');
      expect(token1.path).toEqual(['colors', 'primary']);
      expect(token1.$value).toEqual({ r: 255, g: 0, b: 0, a: 1 });
      expect(token1.$type).toBe('color');
      expect(token1.$description).toBe('Primary color');
      expect(token1.metadata.source).toBe('figma');
      expect(token1.metadata.originalName).toBe('colors/primary');
      expect(token1.valuesByMode['Light']).toEqual({ r: 255, g: 0, b: 0, a: 1 });

      const token2 = internalTokens.find(t => t.metadata.figma.id === 'var2');
      expect(token2.name).toBe('spacing-small');
      expect(token2.$type).toBe('number');
      expect(token2.$value).toBe(10);

      const token3 = internalTokens.find(t => t.metadata.figma.id === 'var3');
      expect(token3.name).toBe('options-is-active');
      expect(token3.$type).toBe('boolean');
      expect(token3.$value).toBe(false);
    });

    it('should handle empty input', () => {
      expect(transformFigmaVariablesToInternalTokens([])).toEqual([]);
      expect(transformFigmaVariablesToInternalTokens(null)).toEqual([]);
    });
  });
});
