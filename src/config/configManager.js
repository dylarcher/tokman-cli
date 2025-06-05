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
      apiKey: process.env.FIGMA_API_KEY || null, // Example: load from env var
      fileKey: null, // Example: to be set by user
    },
    // Add other configuration sections as needed (e.g., input sources, output formatters)
    sources: [
      // Example: { type: 'figma', fileId: 'your_figma_file_id' },
      // Example: { type: 'css', path: './styles/tokens.css' }
    ],
    output: [
      // Example: { formatter: 'json', path: './tokens/tokens.json' }
    ],
    namingConvention: {
      // Rules for token naming, e.g., separator: '-', casing: 'kebab'
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
  if (config.sources && config.sources.some(s => s.type === 'figma' && !s.fileId && !config.figma.fileKey)) {
    // console.warn('Warning: Figma source specified but no fileKey/fileId provided.');
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
