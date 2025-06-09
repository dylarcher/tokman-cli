// tests/input-adapters/figma.test.js
const { describe, it, mock, afterEach } = require('node:test');
const assert = require('node:assert');
const { fetchFigmaVariables, figmaColorToHex, transformFigmaVarName } = require('../../src/input-adapters/figma');
const { DesignToken } = require('../../src/core/token');

describe('Figma Input Adapter', () => {
  describe('figmaColorToHex', () => {
    it('should convert Figma RGBA (0-1) to 8-digit hex', () => {
      assert.strictEqual(figmaColorToHex({ r: 1, g: 0, b: 0, a: 1 }), '#ff0000ff'); // Red
      assert.strictEqual(figmaColorToHex({ r: 0, g: 1, b: 0, a: 0.5 }), '#00ff0080'); // Green with 50% alpha
      assert.strictEqual(figmaColorToHex({ r: 0.2, g: 0.4, b: 0.6, a: 1 }), '#336699ff');
    });
  });

  describe('transformFigmaVarName', () => {
    it('should transform figma variable name to token name and path', () => {
      const { name, path } = transformFigmaVarName('colors/brand/primary');
      assert.strictEqual(name, 'colors-brand-primary');
      assert.deepStrictEqual(path, ['colors', 'brand', 'primary']);
    });
     it('should handle single segment names', () => {
      const { name, path } = transformFigmaVarName('opacity/50');
      assert.strictEqual(name, 'opacity-50');
      assert.deepStrictEqual(path, ['opacity', '50']);
    });
  });

  describe('fetchFigmaVariables', () => {
    const mockFileKey = 'testFileKey';
    const mockApiToken = 'testApiToken';
    const originalFetch = global.fetch;

    afterEach(() => {
      global.fetch = originalFetch;
      mock.restoreAll();
    });

    it('should fetch and transform Figma variables correctly', async () => {
      const mockFigmaApiResponse = {
        meta: {
          variables: {
            'VariableID:123': {
              id: 'VariableID:123',
              name: 'colors/brand/primary',
              variableCollectionId: 'CollectionID:1',
              resolvedType: 'COLOR',
              valuesByMode: { 'ModeID:1': { r: 1, g: 0, b: 0, a: 1 } },
              description: 'Primary brand color'
            },
            'VariableID:456': {
              id: 'VariableID:456',
              name: 'sizes/font/large',
              variableCollectionId: 'CollectionID:2',
              resolvedType: 'FLOAT',
              valuesByMode: { 'ModeID:A': 20 },
              description: 'Large font size'
            }
          },
          variableCollections: {
            'CollectionID:1': { name: 'Colors', modes: [{ modeId: 'ModeID:1', name: 'Default' }], defaultModeId: 'ModeID:1' },
            'CollectionID:2': { name: 'Sizes', modes: [{ modeId: 'ModeID:A', name: 'Desktop' }], defaultModeId: 'ModeID:A' }
          }
        }
      };

      global.fetch = mock.fn(async (url) => {
        assert.ok(url.startsWith(`https://api.figma.com/v1/files/${mockFileKey}/variables`));
        return {
          ok: true,
          json: async () => mockFigmaApiResponse
        };
      });

      const tokens = await fetchFigmaVariables(mockFileKey, mockApiToken);

      assert.strictEqual(global.fetch.mock.calls.length, 1);
      assert.strictEqual(tokens.length, 2);

      const firstToken = tokens.find(t => t.name === 'colors-brand-primary');
      assert.ok(firstToken instanceof DesignToken);
      assert.strictEqual(firstToken.$value, '#ff0000ff');
      assert.strictEqual(firstToken.$type, 'color');
      assert.strictEqual(firstToken.$description, 'Primary brand color');

      const secondToken = tokens.find(t => t.name === 'sizes-font-large');
      assert.ok(secondToken instanceof DesignToken);
      assert.strictEqual(secondToken.$value, 20);
      assert.strictEqual(secondToken.$type, 'number');
    });

    it('should throw an error if API request fails (response not ok)', async () => {
      global.fetch = mock.fn(async () => ({
        ok: false,
        status: 403,
        json: async () => ({ err: 'Forbidden' })
      }));

      await assert.rejects(
        fetchFigmaVariables(mockFileKey, mockApiToken),
        /Figma API request failed with status 403/
      );
      assert.strictEqual(global.fetch.mock.calls.length, 1);
    });

    it('should throw an error if API request fails (network error)', async () => {
      global.fetch = mock.fn(async () => {
        throw new Error('Network connection error');
      });

      await assert.rejects(
        fetchFigmaVariables(mockFileKey, mockApiToken),
        /Error processing Figma API request: Network connection error/
      );
      assert.strictEqual(global.fetch.mock.calls.length, 1);
    });

    it('should return empty array if no variables found in API response', async () => {
      global.fetch = mock.fn(async () => ({
        ok: true,
        json: async () => ({ meta: { variables: {} } })
      }));
      const tokens = await fetchFigmaVariables(mockFileKey, mockApiToken);
      assert.deepStrictEqual(tokens, []);
      assert.strictEqual(global.fetch.mock.calls.length, 1);
    });

    it('should return empty array if meta or meta.variables is missing', async () => {
      global.fetch = mock.fn(async () => ({
        ok: true,
        json: async () => ({ meta: {} }) // variables missing
      }));
      let tokens = await fetchFigmaVariables(mockFileKey, mockApiToken);
      assert.deepStrictEqual(tokens, []);

      global.fetch = mock.fn(async () => ({
        ok: true,
        json: async () => ({}) // meta missing
      }));
      tokens = await fetchFigmaVariables(mockFileKey, mockApiToken);
      assert.deepStrictEqual(tokens, []);
    });

    it('should throw error if fileKey or apiToken is missing', async () => {
      await assert.rejects(fetchFigmaVariables(null, mockApiToken), /Figma file key and API token are required/);
      await assert.rejects(fetchFigmaVariables(mockFileKey, null), /Figma file key and API token are required/);
    });
  });
});
