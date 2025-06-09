// src/input-adapters/figma.js
const { createToken } = require('../core/token'); // Adjusted path

const FIGMA_API_BASE_URL = 'https://api.figma.com/v1';

/**
 * Converts Figma's 0-1 RGBA components to an 8-digit hex string (#RRGGBBAA).
 * @param {object} figmaColor - Figma color object {r, g, b, a}.
 * @returns {string} Hex color string.
 */
function figmaColorToHex({ r, g, b, a }) {
  const toHex = (c) => Math.round(c * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;
}

/**
 * Transforms a Figma variable name (e.g., 'colors/brand/primary') into a token name
 * (e.g., 'color-brand-primary') and a path array.
 * @param {string} figmaVarName - The variable name from Figma.
 * @returns {{ name: string, path: string[] }}
 */
function transformFigmaVarName(figmaVarName) {
  const parts = figmaVarName.split('/');
  // Assuming the first part might be the category, which could map to type
  // Or, it's just part of the name. For now, join with hyphens.
  // Example: 'colors/brand/primary' -> 'colors-brand-primary', path ['colors', 'brand', 'primary']
  // This might need more sophisticated mapping later based on naming convention rules.
  const name = parts.join('-');
  return { name, path: parts };
}

/**
 * Fetches variables from a Figma file and transforms them into DesignToken objects.
 * @param {string} fileKey - The Figma file key.
 * @param {string} apiToken - The Figma API token.
 * @returns {Promise<DesignToken[]>} - A promise that resolves to an array of DesignToken objects.
 */
async function fetchFigmaVariables(fileKey, apiToken) {
  if (!fileKey || !apiToken) {
    throw new Error('Figma file key and API token are required.');
  }

  try {
    const response = await fetch(`${FIGMA_API_BASE_URL}/files/${fileKey}/variables`, {
      headers: { 'X-Figma-Token': apiToken },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error(`Error fetching Figma variables: ${response.status} - ${JSON.stringify(errorData)}`);
      throw new Error(`Figma API request failed with status ${response.status}.`);
    }

    const responseData = await response.json();
    const figmaVariablesData = responseData.meta;

    if (!figmaVariablesData || !figmaVariablesData.variables) {
      console.warn('No variables found in the Figma file or unexpected API response structure.');
      return [];
    }

    const tokens = [];
    const { variables, variableCollections } = figmaVariablesData;

    for (const varId in variables) {
      const figmaVar = variables[varId];
      const collection = variableCollections[figmaVar.variableCollectionId];

      // Each mode in a variable will become a separate token for now,
      // or value could be an object with modes.
      // For Phase 1, let's create tokens for values in the default mode,
      // or the first mode if defaultModeId is not obvious.
      // A more robust mode handling will be needed later.

      // Find a modeId to use. Prioritize defaultModeId from the collection.
      // If not available, take the first modeId from the variable's valuesByMode.
      let modeIdToUse = collection.defaultModeId;
      if (!modeIdToUse && Object.keys(figmaVar.valuesByMode).length > 0) {
          modeIdToUse = Object.keys(figmaVar.valuesByMode)[0]; // Fallback to the first mode
      }

      if (!modeIdToUse) {
        console.warn(`Variable ${figmaVar.name} has no modes or default mode to extract value from. Skipping.`);
        continue;
      }

      const rawValue = figmaVar.valuesByMode[modeIdToUse];
      if (rawValue === undefined) {
        console.warn(`Variable ${figmaVar.name} (mode: ${modeIdToUse}) has no value. Skipping.`);
        continue;
      }

      let tokenValue;
      let tokenType = figmaVar.resolvedType.toLowerCase(); // 'COLOR', 'FLOAT', 'STRING', 'BOOLEAN'

      switch (figmaVar.resolvedType) {
        case 'COLOR':
          tokenValue = figmaColorToHex(rawValue);
          tokenType = 'color';
          break;
        case 'FLOAT':
          tokenValue = rawValue;
          tokenType = 'number'; // Or 'dimension' if it has a unit, but Figma floats are unitless
          break;
        case 'STRING':
          tokenValue = rawValue;
          tokenType = 'string'; // Or 'content'
          break;
        case 'BOOLEAN':
          tokenValue = rawValue;
          tokenType = 'boolean';
          break;
        default:
          console.warn(`Unsupported Figma variable type: ${figmaVar.resolvedType} for variable ${figmaVar.name}. Skipping.`);
          continue;
      }

      const { name, path } = transformFigmaVarName(figmaVar.name);

      // Note: Description and other fields might come from figmaVar.description
      tokens.push(createToken({
        name: name, // Full semantic name after transformation
        path: path, // Path array
        value: tokenValue,
        type: tokenType,
        description: figmaVar.description || `Figma variable: ${figmaVar.name}`,
        originalValue: rawValue,
        source: `figma:${fileKey}/${varId}`,
        extensions: { 
          figmaVariableId: varId, 
          figmaCollectionId: figmaVar.variableCollectionId, 
          figmaModeId: modeIdToUse 
        }
      }));
    }
    return tokens;
  } catch (error) {
    // Handle network errors or other issues not related to Figma API response status
    console.error('Error processing Figma API request:', error.message);
    throw new Error(`Error processing Figma API request: ${error.message}`);
  }
}

module.exports = { fetchFigmaVariables, figmaColorToHex, transformFigmaVarName };
