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
      $value: token.$value, // This should be the value from the default mode
      $type: token.$type,
    };
    if (token.$description) {
      tokenProperties.$description = token.$description;
    }

    // Handle modes for extensions
    // Add modes to extensions if there are multiple modes defined,
    // or if there's one mode whose value is different from the main $value (though this shouldn't happen if $value is set correctly).
    // Essentially, if valuesByMode provides more info than the default $value alone.
    const modeKeys = Object.keys(token.valuesByMode || {});
    const modesForExtension = {};
    let addModesExtension = false;

    if (modeKeys.length > 0) {
        modeKeys.forEach(modeName => {
            // Only add to extensions if it's not the default value already represented by $value,
            // OR if we want to explicitly list all modes including the one that matches default.
            // For now, let's list all modes defined if there's more than one,
            // or if the single mode is somehow different (which implies $value wasn't set from it).
            // A simpler rule: if there are any modes in valuesByMode, represent them.
            modesForExtension[modeName] = token.valuesByMode[modeName];
        });

        // Only add the extension if there's something to add.
        // For example, if valuesByMode contains only the default mode's value,
        // it might be redundant. But for clarity, showing all available modes can be useful.
        // Let's refine: only add if more than one mode, or if the single mode is different from $value
        // (which would be unusual given current transformer logic but defensive).
        // Or, more simply, always add if `valuesByMode` is not empty.
        if (Object.keys(modesForExtension).length > 0) {
             addModesExtension = true;
        }
    }


    if (addModesExtension) {
      if (!tokenProperties.extensions) {
        tokenProperties.extensions = {};
      }
      // Using a potentially more specific namespace for Tokman
      tokenProperties.extensions['com.tokman.modes'] = modesForExtension;
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
