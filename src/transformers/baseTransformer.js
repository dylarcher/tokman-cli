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

/**
 * Transforms a CSS custom property name (e.g., "--color-brand-primary") into a token name.
 * Basic implementation: removes leading '--' and converts to lowercase.
 * @param {string} cssPropName - The CSS custom property name.
 * @returns {string} The transformed token name.
 */
function transformCssPropNameToTokenName(cssPropName) {
  if (!cssPropName) return '';
  return cssPropName.startsWith('--') ? cssPropName.substring(2).toLowerCase() : cssPropName.toLowerCase();
}

/**
 * Infers the DTCG token type from a CSS value string.
 * Basic implementation. More sophisticated type checking can be added.
 * @param {string} cssValue - The CSS property value.
 * @returns {string} DTCG type - e.g., "color", "string", "number", "dimension".
 */
function inferDtcgTypeFromCssValue(cssValue) {
  if (!cssValue) return 'string'; // Default or throw error

  // Simple checks, can be expanded (e.g., using regex or more parsing)
  if (/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(cssValue) ||
      /^(rgb|rgba|hsl|hsla)\(/.test(cssValue)) {
    return 'color';
  }
  // Check for numbers or dimensions (e.g., 16px, 2em, 1.5)
  if (/^[+-]?(\d*\.)?\d+(px|em|rem|%|vw|vh|s|ms)?$/.test(cssValue) && !isNaN(parseFloat(cssValue))) {
     if (/(px|em|rem|%|vw|vh|s|ms)$/.test(cssValue)) {
        return 'dimension';
     }
     return 'number';
  }
  // TODO: Add checks for boolean, other specific types if conventions exist in CSS values.
  return 'string'; // Default fallback
}

/**
 * Transforms extracted CSS custom properties into an array of InternalToken objects.
 * @param {Array<object>} cssProperties - Array of objects like { name, value, source }.
 * @returns {Array<InternalToken>} Array of InternalToken objects.
 */
function transformCssPropertiesToInternalTokens(cssProperties) {
  if (!cssProperties) return [];
  const internalTokens = [];

  cssProperties.forEach(prop => {
    const tokenName = transformCssPropNameToTokenName(prop.name);
    if (!tokenName) return; // Skip if name is invalid

    const tokenPath = tokenName.split('-'); // Simple path generation based on '-'
    const cssValue = prop.value.trim();
    const dtcgType = inferDtcgTypeFromCssValue(cssValue);

    // Basic value normalization for now - primarily trimming.
    // Color values from CSS are typically strings already (e.g. #FFF, rgb(0,0,0))
    // Unlike Figma, they don't need conversion from {r,g,b,a} objects at this stage.
    // The formatter will handle specific string formats for colors if needed.
    let tokenValue = cssValue;

    // If type is color, we might want to parse it to a consistent object like Figma's output later
    // For now, keep as string.
    // If type is number/dimension, parse it.
    if (dtcgType === 'number') {
        tokenValue = parseFloat(cssValue);
    } else if (dtcgType === 'dimension') {
        // Keep as string for now, formatters can handle units.
        // Or, parse into value/unit object: e.g. { value: parseFloat(cssValue), unit: cssValue.match(...)[1] }
    }


    const metadata = {
      source: 'css',
      originalName: prop.name,
      originalValue: prop.value,
      css: {
        sourceFile: prop.source
      }
    };

    // CSS custom properties don't have inherent modes in the same way Figma vars do.
    // Description also not directly available from CSS property itself.
    const token = new InternalToken(
      tokenName,
      tokenPath,
      tokenValue,
      dtcgType,
      '', // No description from CSS directly
      metadata,
      {} // No modes from CSS directly
    );
    internalTokens.push(token);
  });

  return internalTokens;
}

module.exports = {
  transformFigmaNameToTokenName,
  mapFigmaTypeToDTCGType,
  transformFigmaVariablesToInternalTokens,
  transformCssPropNameToTokenName,
  inferDtcgTypeFromCssValue,
  transformCssPropertiesToInternalTokens,
};
