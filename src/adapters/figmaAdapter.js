// src/adapters/figmaAdapter.js

const axios = require('axios');
const { config } = require('../config/configManager');

const FIGMA_API_BASE_URL = 'https://api.figma.com/v1';

/**
 * Fetches variables from the Figma API for a given file.
 *
 * @param {string} fileKey The key of the Figma file.
 * @param {string} apiKey The Figma API key (Personal Access Token).
 * @returns {Promise<object>} A promise that resolves to the Figma variables data.
 * @throws {Error} If the API request fails or if API key/file key is missing.
 */
async function fetchFigmaVariables(fileKey, apiKey) {
  if (!fileKey) {
    throw new Error('Figma file key is required to fetch variables.');
  }
  if (!apiKey) {
    throw new Error('Figma API key is required to fetch variables.');
  }

  const url = `${FIGMA_API_BASE_URL}/files/${fileKey}/variables`;
  console.log(`Fetching Figma variables from: ${url}`);

  try {
    const response = await axios.get(url, {
      headers: {
        'X-FIGMA-TOKEN': apiKey,
      },
    });

    if (response.status === 200) {
      console.log('Successfully fetched Figma variables.');
      return response.data;
    } else {
      // This case might not be hit if axios throws for non-2xx status codes by default
      throw new Error(`Figma API request failed with status ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Figma API Error Response:', error.response.data);
      throw new Error(`Figma API request failed with status ${error.response.status}: ${error.response.data.err || error.response.data.message || error.response.statusText}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Figma API No Response:', error.request);
      throw new Error('No response received from Figma API. Check network connectivity.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Figma API Request Setup Error:', error.message);
      throw new Error(`Failed to make Figma API request: ${error.message}`);
    }
  }
}

/**
 * Main function to get variables, potentially using configuration.
 * This will be the primary export used by other parts of the library.
 *
 * For now, it directly calls fetchFigmaVariables. In the future, it might
 * iterate over multiple Figma files defined in the config.
 */
async function getVariables() {
  // Assuming a single Figma file source for now, defined in config.
  // This logic will need to be more robust to handle multiple sources of type 'figma'.
  const figmaConfigSource = config.sources?.find(s => s.type === 'figma');
  const effectiveFileKey = figmaConfigSource?.fileId || config.figma?.fileKey;
  const effectiveApiKey = config.figma?.apiKey || process.env.FIGMA_API_KEY;

  if (!effectiveFileKey) {
    console.warn('No Figma file key found in configuration for the figmaAdapter.');
    return null; // Or throw error, depending on desired strictness
  }
  if (!effectiveApiKey) {
    console.warn('No Figma API key found in configuration or environment for the figmaAdapter.');
    return null; // Or throw error
  }

  return fetchFigmaVariables(effectiveFileKey, effectiveApiKey);
}

module.exports = {
  fetchFigmaVariables,
  getVariables,
  FIGMA_API_BASE_URL,
};
