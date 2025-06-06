// src/index.js
const fs = require('fs');
const path = require('path');
const { fetchFigmaVariables } = require('./input-adapters'); // Assumes index.js in input-adapters
const { formatTokensToJson } = require('./output-formatters'); // Assumes index.js in output-formatters

async function generateTokensFromFigma(figmaFileKey, figmaApiToken, outputFilePath) {
  if (!figmaFileKey || !figmaApiToken || !outputFilePath) {
    console.error('Error: Figma file key, API token, and output file path are required.');
    // For a CLI, you might exit here: process.exit(1);
    // For a library function, throwing an error is better.
    throw new Error('Figma file key, API token, and output file path are required.');
  }

  console.log(`Fetching variables from Figma file: ${figmaFileKey}...`);
  try {
    const tokens = await fetchFigmaVariables(figmaFileKey, figmaApiToken);

    if (tokens.length === 0) {
      console.log('No tokens were extracted from Figma. Output file will not be generated.');
      return;
    }

    console.log(`Successfully fetched ${tokens.length} token(s).`);
    console.log('Formatting tokens to JSON...');
    const jsonOutput = formatTokensToJson(tokens);

    // Ensure the output directory exists
    const outputDir = path.dirname(outputFilePath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`Created output directory: ${outputDir}`);
    }

    console.log(`Writing JSON output to: ${outputFilePath}`);
    fs.writeFileSync(outputFilePath, JSON.stringify(jsonOutput, null, 2));

    console.log('Token generation complete!');
    return outputFilePath; // Return path for programmatic use

  } catch (error) {
    console.error('Error during token generation process:', error.message);
    // Re-throw for programmatic use or process.exit for CLI
    throw error;
  }
}

// Basic CLI argument parsing (very rudimentary for Phase 1)
// Example usage: node src/index.js <FIGMA_FILE_KEY> <FIGMA_API_TOKEN> <OUTPUT_FILE_PATH>
// In a real CLI, use libraries like yargs or commander.js
if (require.main === module) { // Check if the script is run directly
  const args = process.argv.slice(2);
  const FIGMA_FILE_KEY = args[0] || process.env.FIGMA_FILE_KEY;
  const FIGMA_API_TOKEN = args[1] || process.env.FIGMA_API_TOKEN;
  const OUTPUT_FILE_PATH = args[2] || process.env.OUTPUT_FILE_PATH || 'tokens.json';

  if (!FIGMA_FILE_KEY || !FIGMA_API_TOKEN) {
    console.log('Usage: node src/index.js <FIGMA_FILE_KEY> <FIGMA_API_TOKEN> [OUTPUT_FILE_PATH]');
    console.log('Alternatively, set FIGMA_FILE_KEY, FIGMA_API_TOKEN, and optionally OUTPUT_FILE_PATH environment variables.');
    process.exit(1);
  }

  generateTokensFromFigma(FIGMA_FILE_KEY, FIGMA_API_TOKEN, OUTPUT_FILE_PATH)
    .then(outputPath => {
      if (outputPath) {
        console.log(`Successfully generated tokens at ${outputPath}`);
      }
    })
    .catch(error => {
      // Error already logged by generateTokensFromFigma
      console.error("CLI execution failed.");
      process.exit(1);
    });
}

// Export for programmatic use
module.exports = { generateTokensFromFigma };
