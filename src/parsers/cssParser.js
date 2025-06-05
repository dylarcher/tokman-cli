// src/parsers/cssParser.js

const fs = require('fs').promises;
const csstree = require('css-tree');

/**
 * Reads a CSS file and parses its content.
 * @param {string} filePath - Absolute or relative path to the CSS file.
 * @returns {Promise<string>} Resolves with the file content as a string.
 * @throws {Error} If reading the file fails.
 */
async function readCssFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error(`Error reading CSS file at ${filePath}:`, error);
    throw error;
  }
}

/**
 * Extracts CSS Custom Properties from a CSS string.
 * @param {string} cssContent - The CSS content as a string.
 * @param {string} sourcePath - The path of the source file (for context in messages).
 * @returns {Array<object>} An array of extracted custom properties, each with { name, value, source }.
 */
function extractCssCustomProperties(cssContent, sourcePath = 'unknown.css') {
  if (!cssContent) {
    return [];
  }

  const ast = csstree.parse(cssContent, {
    parseValue: true, // Ensure values are parsed
    onParseError: (error) => {
      // console.warn(`CSS parsing error in ${sourcePath}: ${error.message} at line ${error.line}, column ${error.column}`);
      // Depending on strictness, you might choose to throw here or collect errors.
    }
  });

  const customProperties = [];

  csstree.walk(ast, {
    visit: 'Declaration',
    enter: function(node) {
      if (node.property && node.property.startsWith('--')) {
        let value = '';
        if (node.value && node.value.type === 'Raw') {
            // If CSSTree couldn't parse the value (e.g. complex calc() or var() unsupported by simple parse)
            // or if parseValue was false for this part.
            value = node.value.value.trim();
        } else if (node.value && node.value.children && !node.value.children.isEmpty()) {
            // If value is parsed, generate it back to string.
            // This provides a more normalized representation if csstree parsed it.
            value = csstree.generate(node.value).trim();
        } else if (node.value && node.value.type && node.value.name) {
             // Handle cases where the value is a single identifier or similar simple type directly
             value = node.value.name;
        }


        // Basic value cleaning: remove extra spaces, newlines.
        // More sophisticated cleaning might be needed (e.g., for multi-line values).
        value = value.replace(/\s*\n\s*/g, ' ').trim();

        customProperties.push({
          name: node.property, // e.g., "--color-brand-primary"
          value: value,        // e.g., "#E8DEF8" or "var(--some-other-var)"
          source: sourcePath,
        });
      }
    }
  });

  return customProperties;
}


/**
 * Processes a single CSS file: reads, parses, and extracts custom properties.
 * @param {string} filePath - Path to the CSS file.
 * @returns {Promise<Array<object>>} Array of extracted custom properties.
 */
async function processCssFile(filePath) {
  // console.log(`Processing CSS file: ${filePath}`);
  const cssContent = await readCssFile(filePath);
  const properties = extractCssCustomProperties(cssContent, filePath);
  // console.log(`Found ${properties.length} custom properties in ${filePath}.`);
  return properties;
}

module.exports = {
  readCssFile,
  extractCssCustomProperties,
  processCssFile,
};
