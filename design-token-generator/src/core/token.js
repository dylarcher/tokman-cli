// src/core/token.js
class DesignToken {
  constructor({ name, path, value, type, description, originalValue, source, extensions, aliasOf }) {
    this.name = name; // Full token name, e.g., color-brand-primary
    this.path = path; // Array of path segments, e.g., ['color', 'brand', 'primary']
    this.$value = value; // The actual, normalized value
    this.$type = type; // DTCG type (e.g., 'color', 'dimension', 'fontWeight')

    if (description) {
      this.$description = description;
    }
    // Optional fields
    if (originalValue !== undefined) {
      this.originalValue = originalValue;
    }
    if (source !== undefined) {
      this.source = source;
    }
    if (extensions !== undefined) {
      this.extensions = extensions;
    }
    if (aliasOf !== undefined) {
      this.aliasOf = aliasOf;
    }
  }
}

/**
 * Utility function to create a DesignToken instance.
 * @param {object} data - The data for the design token.
 * @returns {DesignToken}
 */
function createToken(data) {
  if (!data.name || !data.path || data.value === undefined || !data.type) {
    throw new Error('Token name, path, value, and type are required.');
  }
  return new DesignToken(data);
}

module.exports = { DesignToken, createToken };
