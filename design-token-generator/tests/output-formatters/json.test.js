// tests/output-formatters/json.test.js
const { describe, it } = require('node:test');
const assert = require('node:assert');
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
    assert.deepStrictEqual(jsonOutput, {
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
    assert.deepStrictEqual(jsonOutput.color.brand.primary.extensions, { category: 'brand' });
  });

  it('should return an empty object for an empty token array', () => {
    assert.deepStrictEqual(formatTokensToJson([]), {});
  });

  it('should throw error for invalid input', () => {
    assert.throws(() => formatTokensToJson({}), /Input must be an array of DesignToken objects./);
  });

  it('should skip invalid token objects in array', () => {
    const tokens = [
      null,
      createToken({ name: 'color-brand-primary', path: ['color', 'brand', 'primary'], value: '#FF0000', type: 'color' }),
      {path: ['invalid']} // missing other fields
    ];

    let warnMessages = 0;
    const originalWarn = console.warn;
    console.warn = () => {
      warnMessages++;
    };

    const jsonOutput = formatTokensToJson(tokens);
    console.warn = originalWarn; // Restore original console.warn

    assert.deepStrictEqual(jsonOutput, {
        color: {
            brand: {
                primary: { $value: '#FF0000', $type: 'color' }
            }
        }
    });
    assert.strictEqual(warnMessages, 2); // For null and invalid object
  });
});
