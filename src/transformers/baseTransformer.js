// src/transformers/baseTransformer.js

const InternalToken = require('../core/InternalToken');

/**
 * Transforms a Figma variable name (e.g., "colors/brand/primary") into a token name.
 * Basic implementation: replaces '/' with '-' and converts to lowercase.
 * @param {string} figmaVarName - The variable name from Figma.
 * @returns {string} The transformed token name.
 */
function transformFigmaNameToTokenName(figmaVarName) {
  if (!figmaVarName) return '';
  return figmaVarName.toLowerCase().replace(/\//g, '-').replace(/\s+/g, '-');
}

/**
 * Maps Figma's resolvedType to DTCG token types.
 * @param {string} figmaResolvedType - e.g., "COLOR", "FLOAT", "STRING", "BOOLEAN".
 * @returns {string} DTCG type - e.g., "color", "number", "string", "boolean".
 *                    "FLOAT" is mapped to "number". Could be "dimension" if unit context is available.
 */
function mapFigmaTypeToDTCGType(figmaResolvedType) {
  switch (figmaResolvedType) {
    case 'COLOR':
      return 'color';
    case 'FLOAT':
      return 'number'; // Could also be 'dimension' if it has units, but Figma FLOATs are unitless.
                           // For things like spacing, they might be used with implicit px units.
                           // The formatter might need to handle this.
    case 'STRING':
      return 'string';
    case 'BOOLEAN':
      return 'boolean';
    default:
      // console.warn(`Unknown Figma resolvedType: ${figmaResolvedType}. Defaulting to 'string'.`);
      return 'string'; // Or throw an error
  }
}

/**
 * Transforms parsed Figma variables into an array of InternalToken objects.
 * @param {Array<object>} parsedFigmaVariables - Array of parsed variable objects from figmaVariablesParser.js.
 * @returns {Array<InternalToken>} Array of InternalToken objects.
 */
function transformFigmaVariablesToInternalTokens(parsedFigmaVariables) {
  if (!parsedFigmaVariables) return [];
  const internalTokens = [];

  parsedFigmaVariables.forEach(parsedVar => {
    const tokenName = transformFigmaNameToTokenName(parsedVar.name);
    const tokenPath = tokenName.split('-'); // Simple path generation
    const dtcgType = mapFigmaTypeToDTCGType(parsedVar.resolvedType);

    // Determine the default/primary value and other mode values
    let defaultValue = null;
    const tokenValuesByMode = {};

    if (parsedVar.valuesByMode && Object.keys(parsedVar.valuesByMode).length > 0) {
        // Find the default mode's value if a default mode is specified in the collection
        const defaultModeName = parsedVar.variableCollection.modes?.find(
            m => m.id === parsedVar.variableCollection.defaultModeId
        )?.name;

        if (defaultModeName && parsedVar.valuesByMode[defaultModeName] !== undefined) {
            defaultValue = parsedVar.valuesByMode[defaultModeName];
        } else {
            // Fallback: use the first mode's value as default if no explicit default or default not found
            // This choice might need to be configurable or more sophisticated.
            const firstModeName = Object.keys(parsedVar.valuesByMode)[0];
            defaultValue = parsedVar.valuesByMode[firstModeName];
        }

        // Populate tokenValuesByMode with all mode values
        for (const modeName in parsedVar.valuesByMode) {
            tokenValuesByMode[modeName] = parsedVar.valuesByMode[modeName];
        }
    } else {
        // Should not happen if variables are correctly defined, but handle defensively
        // console.warn(`Variable "${parsedVar.name}" has no valuesByMode. Skipping.`);
        return; // Skip this variable
    }

    if (defaultValue === null && Object.keys(tokenValuesByMode).length > 0) {
        // If somehow defaultValue is still null but there are modes, pick the first one.
        // This is a defensive fallback.
        const firstModeName = Object.keys(tokenValuesByMode)[0];
        defaultValue = tokenValuesByMode[firstModeName];
    } else if (defaultValue === null) {
        // console.warn(`Variable "${parsedVar.name}" resolved to no usable default value. Skipping.`);
        return; // Skip if no value could be determined
    }


    const metadata = {
      source: 'figma',
      originalName: parsedVar.name,
      originalValue: defaultValue, // This is a bit tricky with modes. Storing the determined default.
      figma: {
        id: parsedVar.id,
        scopes: parsedVar.scopes,
        description: parsedVar.description, // Storing Figma's description here
        collection: parsedVar.variableCollection, // Store collection info
        codeSyntax: parsedVar.codeSyntax,
      },
    };

    const token = new InternalToken(
      tokenName,
      tokenPath,
      defaultValue,
      dtcgType,
      parsedVar.description || '', // Use Figma's description for DTCG $description
      metadata,
      tokenValuesByMode
    );
    internalTokens.push(token);
  });

  return internalTokens;
}

module.exports = {
  transformFigmaNameToTokenName,
  mapFigmaTypeToDTCGType,
  transformFigmaVariablesToInternalTokens,
};
