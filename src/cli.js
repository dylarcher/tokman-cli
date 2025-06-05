#!/usr/bin/env node

// src/cli.js

const { Command } = require('commander');
const { config, loadConfig, CONFIG_FILE_NAME } = require('./config/configManager'); // Using named import for loadConfig
const { getVariables } = require('./adapters/figmaAdapter');
const { parseFigmaVariablesResponse } = require('./parsers/figmaVariablesParser');
const { transformFigmaVariablesToInternalTokens } = require('./transformers/baseTransformer');
const { writeJsonOutput } = require('./formatters/jsonFormatter');
const path = require('path');

const program = new Command();

program
  .name('tokman-cli')
  .description('CLI tool for generating and managing design tokens.')
  .version(require('../package.json').version); // Assumes package.json is one level up

program
  .command('build')
  .description('Fetch, parse, transform, and build design tokens.')
  .option('-c, --config <path>', `Path to configuration file (default: ./${CONFIG_FILE_NAME})`)
  .action(async (options) => {
    try {
      console.log('Starting token build process...');

      // Note: configManager.js currently loads a dummy config.
      // For a real CLI, we'd use options.config to load a specific file here if provided,
      // or let loadConfig() handle finding the default.
      // For now, we'll just log if a custom path was given but not yet used.
      if (options.config) {
        console.log(`Custom config path specified (not yet implemented for loading): ${options.config}`);
        // TODO: Implement dynamic config loading based on options.config
        // For now, relies on the config loaded by configManager.js at startup.
      } else {
        console.log(`Using default configuration source (currently dummy in configManager).`);
      }

      // 1. Fetch data (Figma variables for now)
      // The getVariables function in figmaAdapter uses the config loaded by configManager
      console.log('Fetching data from sources...');
      const figmaData = await getVariables(); // getVariables uses the global 'config'
      if (!figmaData) {
        console.error('Failed to fetch Figma data. Check configuration and API access.');
        process.exit(1);
      }

      // 2. Parse data
      console.log('Parsing Figma data...');
      const parsedFigmaVariables = parseFigmaVariablesResponse(figmaData);

      // 3. Transform data
      console.log('Transforming data into internal tokens...');
      const internalTokens = transformFigmaVariablesToInternalTokens(parsedFigmaVariables);
      if (!internalTokens || internalTokens.length === 0) {
        console.warn('No tokens were generated from the source data.');
        // process.exit(0); // Or 1 if this is considered an error
        return;
      }
      console.log(`Successfully transformed ${internalTokens.length} tokens.`);

      // 4. Format and write output (JSON for now)
      // Determine output path from config - using a placeholder for now
      const outputDir = config.output?.[0]?.path || './dist/tokens'; // Default output dir
      const outputFileName = config.output?.[0]?.fileName || 'tokens.json'; // Default file name

      console.log(`Formatting tokens to JSON and writing to ${path.join(outputDir, outputFileName)}...`);
      await writeJsonOutput(outputDir, outputFileName, internalTokens);

      console.log('Token build process completed successfully!');

    } catch (error) {
      console.error('Error during token build process:', error.message);
      if (error.stack) {
        // console.error(error.stack); // For more detailed debugging
      }
      process.exit(1);
    }
  });

// Future: Add 'init' command to create a sample tokman.config.js
program
    .command('init')
    .description(`Create a sample configuration file (${CONFIG_FILE_NAME}).`)
    .action(() => {
        // TODO: Implement logic to create a sample tokman.config.js
        console.log('`init` command is not yet implemented.');
        console.log(`Manually create a '${CONFIG_FILE_NAME}' or use environment variables for Figma API key.`);
    });


program.parse(process.argv);
