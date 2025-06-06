// src/output-formatters/json.js

/**
 * Converts an array of DesignToken objects into a nested JSON structure
 * reflecting the token hierarchy.
 * Adheres to DTCG structure where possible by outputting an object for each token
 * containing $value, $type, and $description.
 *
 * @param {DesignToken[]} tokens - An array of DesignToken objects.
 * @returns {object} - A nested object representing the design tokens.
 */
function formatTokensToJson(tokens) {
  const output = {};

  if (!Array.isArray(tokens)) {
    throw new Error('Input must be an array of DesignToken objects.');
  }

  for (const token of tokens) {
    if (!token || typeof token !== 'object' || !token.path || !Array.isArray(token.path)) {
      console.warn('Skipping invalid token object:', token);
      continue;
    }

    let currentLevel = output;
    token.path.forEach((segment, index) => {
      if (index === token.path.length - 1) {
        // Last segment, place the token object here
        currentLevel[segment] = {
          $value: token.$value,
          $type: token.$type,
        };
        if (token.$description) {
          currentLevel[segment].$description = token.$description;
        }
        // Add other optional DTCG properties if they exist on the token
        if (token.extensions) {
            currentLevel[segment].extensions = token.extensions;
        }
        // Note: 'name', 'originalValue', 'source', 'aliasOf' from our internal token
        // are not standard DTCG top-level properties for the token value node itself,
        // but could be part of 'extensions' if needed.
      } else {
        // Create nested object if it doesn't exist
        if (!currentLevel[segment]) {
          currentLevel[segment] = {};
        }
        currentLevel = currentLevel[segment];
      }
    });
  }
  return output;
}

module.exports = { formatTokensToJson };
