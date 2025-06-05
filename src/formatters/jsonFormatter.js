// src/formatters/jsonFormatter.js

const fs = require('fs').promises; // Using promises version of fs
const path = require('path');

/**
 * Builds a nested object structure from a token's path and its properties.
 * @param {object} obj - The object to build upon.
 * @param {Array<string>} pathSegments - The token's path (e.g., ['color', 'brand', 'primary']).
 * @param {object} tokenProperties - The properties to assign to the leaf node (e.g., { $value, $type, $description }).
 */
function buildNestedObject(obj, pathSegments, tokenProperties) {
  let current = obj;
  pathSegments.forEach((segment, index) => {
    if (index === pathSegments.length - 1) {
      // Last segment, assign the token properties
      if (current[segment] && typeof current[segment] === 'object' && !current[segment].$value) {
        // If a group with this name already exists, merge properties (should ideally not happen with unique names)
        Object.assign(current[segment], tokenProperties);
      } else if (current[segment]) {
        // A direct value or token already exists, this indicates a potential naming conflict or path issue
        // console.warn(`Conflict: Path segment "${segment}" for token "${pathSegments.join('.')}" would overwrite existing group or token.`);
        // For now, we'll overwrite, but this might need a more robust conflict resolution strategy.
        current[segment] = tokenProperties;
      } else {
        current[segment] = tokenProperties;
      }
    } else {
      // Not the last segment, ensure a nested object exists
      if (!current[segment] || typeof current[segment] !== 'object' || current[segment].$value) {
        // If it doesn't exist, or it's a token itself (not a group), create a new group.
        // Overwriting a token with a group or vice-versa should be handled carefully.
        if (current[segment] && current[segment].$value) {
          // console.warn(`Conflict: Path segment "${segment}" for token "${pathSegments.join('.')}" creates a group that overwrites an existing token.`);
        }
        current[segment] = {};
      }
      current = current[segment];
    }
  });
}

/**
 * Formats an array of InternalToken objects into a DTCG compliant JSON structure.
 * @param {Array<InternalToken>} internalTokens - Array of InternalToken objects.
 * @returns {object} The formatted JSON object.
 */
function formatTokensToJson(internalTokens) {
  const root = {};

  internalTokens.forEach(token => {
    const tokenProperties = {
      $value: token.$value,
      $type: token.$type,
    };
    if (token.$description) {
      tokenProperties.$description = token.$description;
    }

    // Add mode values under an extension property if they exist and differ from default
    // This is one way to include mode information; DTCG is flexible here.
    // For now, we'll keep it simple and primarily focus on the default $value.
    // A more complex setup might involve creating separate token files per mode or a richer structure.
    // Let's add a custom extension property for modes if valuesByMode has more than one mode or
    // if the single mode value is different from the main $value (though they should be same if only one mode).
    if (token.valuesByMode && Object.keys(token.valuesByMode).length > 0) {
      // A simple way to show modes, could be more structured
      // This is not standard DTCG but an extension.
      // tokenProperties['extension.modes'] = token.valuesByMode;
    }

    buildNestedObject(root, token.path, tokenProperties);
  });

  return root;
}

/**
 * Writes the formatted JSON tokens to a specified file.
 * @param {string} outputDir - The directory to write the file to.
 * @param {string} fileName - The name of the file (e.g., "tokens.json").
 * @param {Array<InternalToken>} internalTokens - Array of InternalToken objects.
 * @returns {Promise<void>}
 * @throws {Error} If writing the file fails.
 */
async function writeJsonOutput(outputDir, fileName, internalTokens) {
  if (!internalTokens) {
    throw new Error('No internal tokens provided to writeJsonOutput.');
  }

  const jsonObject = formatTokensToJson(internalTokens);
  const jsonString = JSON.stringify(jsonObject, null, 2); // Pretty print with 2 spaces

  const fullPath = path.join(outputDir, fileName);

  try {
    await fs.mkdir(outputDir, { recursive: true }); // Ensure directory exists
    await fs.writeFile(fullPath, jsonString, 'utf8');
    console.log(`Successfully wrote JSON tokens to: ${fullPath}`);
  } catch (error) {
    console.error(`Error writing JSON output to ${fullPath}:`, error);
    throw error;
  }
}

module.exports = {
  formatTokensToJson,
  writeJsonOutput,
};
