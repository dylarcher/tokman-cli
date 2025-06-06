// tests/output-formatters/json.test.js
const { formatTokensToJson } = require('../../src/output-formatters/json');
const { createToken } = require('../../src/core/token');

describe('JSON Output Formatter', () => {
  it('should format an array of DesignTokens to a nested JSON object', () => {
    const tokens = [
      createToken({ name: 'color-brand-primary', path: ['color', 'brand', 'primary'], value: '#FF0000', type: 'color', description: 'Primary red' }),
      createToken({ name: 'color-brand-secondary', path: ['color', 'brand', 'secondary'], value: '#00FF00', type: 'color' }),
      createToken({ name: 'size-font-small', path: ['size', 'font', 'small'], value: '12px', type: 'dimension', description: 'Small font size' })
    ];
    const jsonOutput = formatTokensToJson(tokens);
    expect(jsonOutput).toEqual({
      color: {
        brand: {
          primary: { $value: '#FF0000', $type: 'color', $description: 'Primary red' },
          secondary: { $value: '#00FF00', $type: 'color' }
        }
      },
      size: {
        font: {
          small: { $value: '12px', $type: 'dimension', $description: 'Small font size' }
        }
      }
    });
  });

  it('should handle tokens with extensions', () => {
    const tokens = [
      createToken({ name: 'color-brand-primary', path: ['color', 'brand', 'primary'], value: '#FF0000', type: 'color', extensions: { category: 'brand' } })
    ];
    const jsonOutput = formatTokensToJson(tokens);
    expect(jsonOutput.color.brand.primary.extensions).toEqual({ category: 'brand' });
  });

  it('should return an empty object for an empty token array', () => {
    expect(formatTokensToJson([])).toEqual({});
  });

  it('should throw error for invalid input', () => {
    expect(() => formatTokensToJson({})).toThrow('Input must be an array of DesignToken objects.');
  });

  it('should skip invalid token objects in array', () => {
    const tokens = [
      null,
      createToken({ name: 'color-brand-primary', path: ['color', 'brand', 'primary'], value: '#FF0000', type: 'color' }),
      {path: ['invalid']} // missing other fields
    ];
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const jsonOutput = formatTokensToJson(tokens);

    expect(jsonOutput).toEqual({
        color: {
            brand: {
                primary: { $value: '#FF0000', $type: 'color' }
            }
        }
    });
    expect(consoleWarnSpy).toHaveBeenCalledTimes(2); // For null and invalid object
    consoleWarnSpy.mockRestore();
  });
});
