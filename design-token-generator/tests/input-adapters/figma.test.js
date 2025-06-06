// tests/input-adapters/figma.test.js
const axios = require('axios');
const { fetchFigmaVariables, figmaColorToHex, transformFigmaVarName } = require('../../src/input-adapters/figma');
const { DesignToken } = require('../../src/core/token');

jest.mock('axios'); // Mock axios for all tests in this file

describe('Figma Input Adapter', () => {
  describe('figmaColorToHex', () => {
    it('should convert Figma RGBA (0-1) to 8-digit hex', () => {
      expect(figmaColorToHex({ r: 1, g: 0, b: 0, a: 1 })).toBe('#ff0000ff'); // Red
      expect(figmaColorToHex({ r: 0, g: 1, b: 0, a: 0.5 })).toBe('#00ff0080'); // Green with 50% alpha
      expect(figmaColorToHex({ r: 0.2, g: 0.4, b: 0.6, a: 1 })).toBe('#336699ff');
    });
  });

  describe('transformFigmaVarName', () => {
    it('should transform figma variable name to token name and path', () => {
      const { name, path } = transformFigmaVarName('colors/brand/primary');
      expect(name).toBe('colors-brand-primary');
      expect(path).toEqual(['colors', 'brand', 'primary']);
    });
     it('should handle single segment names', () => {
      const { name, path } = transformFigmaVarName('opacity/50');
      expect(name).toBe('opacity-50');
      expect(path).toEqual(['opacity', '50']);
    });
  });

  describe('fetchFigmaVariables', () => {
    const mockFileKey = 'testFileKey';
    const mockApiToken = 'testApiToken';

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should fetch and transform Figma variables correctly', async () => {
      const mockFigmaApiResponse = {
        data: {
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
        }
      };
      axios.get.mockResolvedValue(mockFigmaApiResponse);

      const tokens = await fetchFigmaVariables(mockFileKey, mockApiToken);

      expect(axios.get).toHaveBeenCalledWith(
        `https://api.figma.com/v1/files/${mockFileKey}/variables`,
        { headers: { 'X-Figma-Token': mockApiToken } }
      );
      expect(tokens).toHaveLength(2);

      expect(tokens[0]).toBeInstanceOf(DesignToken);
      expect(tokens[0].name).toBe('colors-brand-primary');
      expect(tokens[0].$value).toBe('#ff0000ff');
      expect(tokens[0].$type).toBe('color');
      expect(tokens[0].$description).toBe('Primary brand color');

      expect(tokens[1]).toBeInstanceOf(DesignToken);
      expect(tokens[1].name).toBe('sizes-font-large');
      expect(tokens[1].$value).toBe(20);
      expect(tokens[1].$type).toBe('number');
    });

    it('should throw an error if API request fails', async () => {
      axios.get.mockRejectedValue(new Error('Network Error'));
      await expect(fetchFigmaVariables(mockFileKey, mockApiToken)).rejects.toThrow('Network Error');
    });

    it('should return empty array if no variables found', async () => {
      const mockFigmaApiResponse = { data: { meta: { variables: {} } } };
      axios.get.mockResolvedValue(mockFigmaApiResponse);
      const tokens = await fetchFigmaVariables(mockFileKey, mockApiToken);
      expect(tokens).toEqual([]);
    });
  });
});
