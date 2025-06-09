// tests/parsers/figmaVariablesParser.test.js
const { describe, it } = require('node:test');
const assert = require('node:assert');
const { parseFigmaColor, parseFigmaVariablesResponse } = require('../../src/parsers/figmaVariablesParser');

describe('figmaVariablesParser', () => {
  describe('parseFigmaColor', () => {
    it('should correctly parse a valid Figma color object', () => {
      const figmaColor = { r: 0.2, g: 0.4, b: 0.6, a: 0.8 };
      assert.deepStrictEqual(parseFigmaColor(figmaColor), { r: 51, g: 102, b: 153, a: 0.8 });
    });

    it('should handle black color correctly', () => {
      const figmaColor = { r: 0, g: 0, b: 0, a: 1 };
      assert.deepStrictEqual(parseFigmaColor(figmaColor), { r: 0, g: 0, b: 0, a: 1 });
    });

    it('should handle white color correctly', () => {
      const figmaColor = { r: 1, g: 1, b: 1, a: 1 };
      assert.deepStrictEqual(parseFigmaColor(figmaColor), { r: 255, g: 255, b: 255, a: 1 });
    });

    it('should return null for invalid Figma color object', () => {
      assert.strictEqual(parseFigmaColor({ r: 0.2, g: 0.4, b: 0.6 }), null); // Missing alpha
      assert.strictEqual(parseFigmaColor(null), null);
      assert.strictEqual(parseFigmaColor({}), null);
    });
  });

  describe('parseFigmaVariablesResponse', () => {
    const mockFigmaApiResponse = {
      meta: {
        variableCollections: {
          'collection1': {
            id: 'collection1',
            name: 'Brand Colors',
            modes: [{ modeId: 'mode1', name: 'Light' }, { modeId: 'mode2', name: 'Dark' }],
            defaultModeId: 'mode1',
          },
        },
        variables: {
          'var1': {
            id: 'var1',
            name: 'colors/primary',
            variableCollectionId: 'collection1',
            resolvedType: 'COLOR',
            valuesByMode: {
              'mode1': { r: 1, g: 0, b: 0, a: 1 }, // Red
              'mode2': { r: 0, g: 0, b: 1, a: 1 }, // Blue
            },
            description: 'Primary brand color',
            scopes: ['ALL_SCOPES'],
            codeSyntax: {}
          },
          'var2': {
            id: 'var2',
            name: 'spacing/small',
            variableCollectionId: 'collection1', // Re-using collection for simplicity
            resolvedType: 'FLOAT',
            valuesByMode: {
              'mode1': 8, // Assume only one mode for this numeric token
            },
            description: 'Small spacing value',
            scopes: ['CORNER_RADIUS'],
            codeSyntax: {}
          },
          'var3': {
            id: 'var3',
            name: 'options/isEnabled',
            variableCollectionId: 'collection1',
            resolvedType: 'BOOLEAN',
            valuesByMode: { 'mode1': true },
            description: 'Enable feature flag',
            scopes: [],
            codeSyntax: {}
          },
        },
      },
      status: 200,
      error: false,
    };

    it('should parse a valid Figma API response correctly', () => {
      const parsed = parseFigmaVariablesResponse(mockFigmaApiResponse);
      assert.strictEqual(parsed.length, 3);

      const colorVar = parsed.find(v => v.id === 'var1');
      assert.strictEqual(colorVar.name, 'colors/primary');
      assert.strictEqual(colorVar.resolvedType, 'COLOR');
      assert.strictEqual(colorVar.description, 'Primary brand color');
      assert.deepStrictEqual(colorVar.valuesByMode['Light'], { r: 255, g: 0, b: 0, a: 1 });
      assert.deepStrictEqual(colorVar.valuesByMode['Dark'], { r: 0, g: 0, b: 255, a: 1 });
      assert.strictEqual(colorVar.variableCollection.name, 'Brand Colors');
      assert.deepStrictEqual(colorVar.variableCollection.modes, [{id: 'mode1', name: 'Light'}, {id: 'mode2', name: 'Dark'}]);


      const spacingVar = parsed.find(v => v.id === 'var2');
      assert.strictEqual(spacingVar.name, 'spacing/small');
      assert.strictEqual(spacingVar.resolvedType, 'FLOAT');
      assert.strictEqual(spacingVar.valuesByMode['Light'], 8); // Mode name from collection default
    });

    it('should throw an error for invalid data structure', () => {
      assert.throws(() => parseFigmaVariablesResponse({}), /Invalid Figma variables data structure received./);
      assert.throws(() => parseFigmaVariablesResponse({ meta: {} }), /Invalid Figma variables data structure received./);
    });
  });
});
