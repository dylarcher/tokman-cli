// src/config/configManager.js

const path = require('path');
const fs = require('fs');

const CONFIG_FILE_NAME = 'tokman.config.js'; // Or .json, .yaml, etc.

/**
 * Loads the project configuration.
 * For now, this is a placeholder. In the future, it will load
 * from a configuration file (e.g., tokman.config.js).
 *
 * @returns {object} The loaded configuration object.
 * @throws {Error} If the configuration file is not found or is invalid.
 */
function loadConfig() {
  // const configPath = path.resolve(process.cwd(), CONFIG_FILE_NAME);

  // console.log(`Attempting to load configuration from: ${configPath}`);

  // // Placeholder: In a real scenario, you would read and parse the file.
  // // For example, if it's a JS file:
  // // if (!fs.existsSync(configPath)) {
  // //   throw new Error(`Configuration file not found: ${configPath}`);
  // // }
  // // const userConfig = require(configPath);

  // Dummy config for now, to be replaced by actual file loading logic
  const dummyConfig = {
    figma: {
      apiKey: process.env.FIGMA_API_KEY || null,
      fileKey: 'YOUR_FIGMA_FILE_KEY_HERE', // Provide a placeholder fileKey
    },
    sources: [
      { type: 'figma', fileId: 'YOUR_FIGMA_FILE_KEY_HERE', processStyles: true }, // Example Figma source
      { type: 'css', paths: ['./styles/tokens.css', './styles/more-tokens.css'] } // Example CSS sources
    ],
    output: [
      { formatter: 'json', path: './dist/tokens', fileName: 'tokens.json' },
      {
        formatter: 'scss',
        path: './dist/scss',
        fileName: '_tokens.scss',
        options: { generateMap: true, mapName: 'my-tokens' }
      },
      {
        formatter: 'css',
        path: './dist/css',
        fileName: 'custom-properties.css',
        options: { selector: ':root' } // Default selector
      }
    ],
    conflictResolution: 'figmaWins', // Example: 'figmaWins', 'cssWins', 'throwError'
    namingConvention: {
      separator: '-',
      case: 'kebab' // e.g., 'kebab', 'camel', 'pascal'
    }
  };

  // console.log('Loaded dummy configuration:', dummyConfig);
  // return { ...defaultConfig, ...userConfig }; // Merge with defaults if any
  return dummyConfig; // Returning dummy config for now
}

/**
 * Validates the loaded configuration.
 * (Placeholder for now)
 *
 * @param {object} config - The configuration object to validate.
 * @throws {Error} If the configuration is invalid.
 */
function validateConfig(config) {
  if (!config.figma || (!config.figma.apiKey && !process.env.FIGMA_API_KEY)) {
    // This check is a bit simplistic for now as apiKey could be set directly in a real config file
    // console.warn('Warning: Figma API key is not set. It should be provided via FIGMA_API_KEY environment variable or in the configuration file.');
  }
  if (config.sources && config.sources.some(s => s.type === 'figma' && !s.fileId && !config.figma.fileKey && !config.figma.apiKey)) {
    // console.warn('Warning: Figma source specified but no fileKey/fileId or apiKey provided.');
  }
  // Add more validation rules as the configuration structure solidifies
}

const config = loadConfig();
validateConfig(config);

module.exports = {
  config,
  loadConfig, // Exporting for potential re-load or direct use
  CONFIG_FILE_NAME
};
