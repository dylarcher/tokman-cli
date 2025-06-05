// src/core/InternalToken.js

/**
 * Represents a design token in its internal, processed format.
 * This structure aims to be compatible with the Design Token Community Group (DTCG)
 * format where applicable, while also holding necessary metadata for processing.
 */
class InternalToken {
  /**
   * @param {string} name - The full, transformed name of the token (e.g., "color-brand-primary").
   * @param {Array<string>} path - The path segments of the token name (e.g., ["color", "brand", "primary"]).
   * @param {*} value - The primary/default value of the token (after normalization).
   * @param {string} type - The DTCG type of the token (e.g., "color", "dimension", "string", "boolean", "number").
   * @param {string|null} description - An optional description for the token.
   * @param {object} metadata - Additional metadata.
   * @param {string} metadata.source - Information about the token's origin (e.g., "figma").
   * @param {string} metadata.originalName - The original name from the source (e.g., "color/brand/primary").
   * @param {*} metadata.originalValue - The original value from the source before transformation/normalization.
   * @param {object} metadata.figma - Figma-specific metadata (if applicable).
   * @param {string} metadata.figma.id - Figma variable ID.
   * @param {Array<string>} metadata.figma.scopes - Figma variable scopes.
   * @param {object} metadata.figma.codeSyntax - Figma code syntax.
   * @param {object} [valuesByMode={}] - An object holding values for different modes, where keys are mode names.
   *                                   Example: { "Light": "#FFFFFF", "Dark": "#000000" }
   *                                   The main `value` property holds the value for the default/primary mode.
   */
  constructor(name, path, value, type, description, metadata, valuesByMode = {}) {
    this.name = name;
    this.path = path;
    this.$value = value; // Using $value for DTCG compatibility
    this.$type = type;   // Using $type for DTCG compatibility
    if (description) {
      this.$description = description; // Using $description for DTCG compatibility
    }
    this.metadata = {
        source: metadata.source || 'unknown',
        originalName: metadata.originalName || name,
        originalValue: metadata.originalValue !== undefined ? metadata.originalValue : value,
        figma: metadata.figma || {}, // Ensure figma object exists
        // Add other source-specific metadata structures as needed
    };
    this.valuesByMode = valuesByMode; // Stores mode-specific values
  }
}

module.exports = InternalToken;
