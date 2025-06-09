// tests/transformers/baseTransformer.test.js
const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  transformFigmaNameToTokenName,
  mapFigmaTypeToDTCGType,
  transformFigmaVariablesToInternalTokens,
} = require('../../src/transformers/baseTransformer');
const InternalToken = require('../../src/core/InternalToken');

describe('baseTransformer', () => {
  describe('transformFigmaNameToTokenName', () => {
    it('should transform names correctly', () => {
      assert.strictEqual(transformFigmaNameToTokenName('colors/brand/primary'), 'colors-brand-primary');
      assert.strictEqual(transformFigmaNameToTokenName('Spacing/Small'), 'spacing-small');
      assert.strictEqual(transformFigmaNameToTokenName('text case'), 'text-case');
      assert.strictEqual(transformFigmaNameToTokenName(''), '');
    });
  });

  describe('mapFigmaTypeToDTCGType', () => {
    it('should map types correctly', () => {
      assert.strictEqual(mapFigmaTypeToDTCGType('COLOR'), 'color');
      assert.strictEqual(mapFigmaTypeToDTCGType('FLOAT'), 'number');
      assert.strictEqual(mapFigmaTypeToDTCGType('STRING'), 'string');
      assert.strictEqual(mapFigmaTypeToDTCGType('BOOLEAN'), 'boolean');
      assert.strictEqual(mapFigmaTypeToDTCGType('UNKNOWN_TYPE'), 'string'); // Default fallback
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
      assert.strictEqual(internalTokens.length, 3);

      const token1 = internalTokens.find(t => t.metadata.figma.id === 'var1');
      assert.ok(token1 instanceof InternalToken);
      assert.strictEqual(token1.name, 'colors-primary');
      assert.deepStrictEqual(token1.path, ['colors', 'primary']);
      assert.deepStrictEqual(token1.$value, { r: 255, g: 0, b: 0, a: 1 });
      assert.strictEqual(token1.$type, 'color');
      assert.strictEqual(token1.$description, 'Primary color');
      assert.strictEqual(token1.metadata.source, 'figma');
      assert.strictEqual(token1.metadata.originalName, 'colors/primary');
      assert.deepStrictEqual(token1.valuesByMode['Light'], { r: 255, g: 0, b: 0, a: 1 });

      const token2 = internalTokens.find(t => t.metadata.figma.id === 'var2');
      assert.strictEqual(token2.name, 'spacing-small');
      assert.strictEqual(token2.$type, 'number');
      assert.strictEqual(token2.$value, 10);

      const token3 = internalTokens.find(t => t.metadata.figma.id === 'var3');
      assert.strictEqual(token3.name, 'options-is-active');
      assert.strictEqual(token3.$type, 'boolean');
      assert.strictEqual(token3.$value, false);
    });

    it('should handle empty input', () => {
      assert.deepStrictEqual(transformFigmaVariablesToInternalTokens([]), []);
      assert.deepStrictEqual(transformFigmaVariablesToInternalTokens(null), []);
    });
  });
});
