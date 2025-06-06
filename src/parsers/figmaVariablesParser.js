// src/parsers/figmaVariablesParser.js

/**
 * Converts a Figma RGBA color object (components 0-1) to an RGBA object (RGB 0-255, A 0-1).
 * @param {object} figmaColor - Figma color object (e.g., { r: 0, g: 0.5, b: 1, a: 1 }).
 * @returns {object} Parsed color object (e.g., { r: 0, g: 128, b: 255, a: 1 }).
 */
function parseFigmaColor(figmaColor) {
  if (!figmaColor || typeof figmaColor.r !== 'number' || typeof figmaColor.g !== 'number' || typeof figmaColor.b !== 'number' || typeof figmaColor.a !== 'number') {
    return null; // Or throw an error, or return a default color
  }
  return {
    r: Math.round(figmaColor.r * 255),
    g: Math.round(figmaColor.g * 255),
    b: Math.round(figmaColor.b * 255),
    a: figmaColor.a,
  };
}

/**
 * Parses the JSON response from the Figma Variables API into a more structured format.
 *
 * @param {object} figmaVariablesData - The raw JSON data from Figma's /variables endpoint.
 * @returns {Array<object>} An array of parsed variable objects. Each object contains:
 *                            - id: Variable ID
 *                            - name: Variable name (e.g., "colors/brand/primary")
 *                            - variableCollection: { id, name, modes }
 *                            - resolvedType: (e.g., "COLOR", "FLOAT", "STRING", "BOOLEAN")
 *                            - valuesByMode: An object mapping mode names to parsed values.
 *                                            (e.g., { "Light Mode": { r:255, g:0, b:0, a:1 }, "Dark Mode": ... })
 *                            - description: Variable description
 *                            - scopes: Array of scopes
 *                            - rawFigmaData: The original variable data from Figma (for reference)
 * @throws {Error} if the input data is not in the expected format.
 */
function parseFigmaVariablesResponse(figmaVariablesData) {
  if (!figmaVariablesData || !figmaVariablesData.meta || !figmaVariablesData.meta.variables || !figmaVariablesData.meta.variableCollections) {
    throw new Error('Invalid Figma variables data structure received.');
  }

  const { variables: figmaVars, variableCollections } = figmaVariablesData.meta;
  const parsedVariables = [];

  for (const varId in figmaVars) {
    const figmaVar = figmaVars[varId];
    const collection = variableCollections[figmaVar.variableCollectionId];

    if (!collection) {
      continue;
    }

    // Create a mapping from modeId to modeName for easier use
    const modeIdToName = {};
    if (collection.modes) {
        collection.modes.forEach(mode => {
            modeIdToName[mode.modeId] = mode.name;
        });
    }


    const parsedValuesByMode = {};
    for (const modeId in figmaVar.valuesByMode) {
      const modeName = modeIdToName[modeId] || modeId; // Fallback to modeId if name not found
      let value = figmaVar.valuesByMode[modeId];

      if (figmaVar.resolvedType === 'COLOR') {
        value = parseFigmaColor(value);
        if (value === null) {
            continue;
        }
      }
      // For FLOAT, STRING, BOOLEAN, the value is used as is.
      // Future: Could add more specific parsing or validation for these types if needed.

      parsedValuesByMode[modeName] = value;
    }

    parsedVariables.push({
      id: figmaVar.id,
      name: figmaVar.name, // e.g., "colors/brand/primary", "spacing/sm"
      variableCollection: {
        id: collection.variableCollectionId, // Note: figmaVar.variableCollectionId is the ID
        name: collection.name,
        modes: collection.modes ? collection.modes.map(m => ({ id: m.modeId, name: m.name })) : [], // Store mode names and IDs
      },
      resolvedType: figmaVar.resolvedType, // "COLOR", "FLOAT", "STRING", "BOOLEAN"
      valuesByMode: parsedValuesByMode, // Values are now parsed (e.g., colors) and keyed by mode name
      description: figmaVar.description || '',
      scopes: figmaVar.scopes || [],
      codeSyntax: figmaVar.codeSyntax || {}, // Added codeSyntax
      rawFigmaData: { ...figmaVar } // Store a copy of the original for reference/debugging
    });
  }

  return parsedVariables;
}

export {
  parseFigmaVariablesResponse,
  parseFigmaColor, // Exporting for potential utility use elsewhere or testing
};
