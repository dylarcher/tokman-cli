#!/usr/bin/env node

// src/cli.js

const { Command } = require('commander');
const { config, loadConfig, CONFIG_FILE_NAME } = require('./config/configManager'); // Using named import for loadConfig
const { getVariables, fetchFigmaStyles, fetchFigmaNodes } = require('../adapters/figmaAdapter');
const { parseFigmaVariablesResponse } = require('./parsers/figmaVariablesParser');
const { parseFigmaStylesResponse } = require('../parsers/figmaStylesParser'); // Import new parser
const { transformFigmaVariablesToInternalTokens, transformCssPropertiesToInternalTokens } = require('./transformers/baseTransformer');
const { writeJsonOutput } = require('./formatters/jsonFormatter');
const { writeScssOutput } = require('./formatters/scssFormatter');
const { writeCssOutput } = require('./formatters/cssFormatter');
const { resolveTokenConflicts } = require('../core/tokenConflictResolver'); // Import the new resolver
const path = require('path');
const { processCssFile } = require('./parsers/cssParser');


const program = new Command();

program
  .name('cssman-cli')
  .description('CLI tool for generating and managing design tokens.')
  .version(require('../package.json').version); // Assumes package.json is one level up

program
  .command('build')
  .description('Fetch, parse, transform, and build design tokens.')
  .option('-c, --config <path>', `Path to configuration file (default: ./${CONFIG_FILE_NAME})`)
  .action(async (options) => {
    try {
      console.log('Starting token build process...');

      if (options.config) {
        console.log(`Custom config path specified (not yet implemented for loading): ${options.config}`);
        // TODO: Implement dynamic config loading based on options.config
      } else {
        console.log(`Using default configuration source (currently dummy in configManager).`);
      }

      let allSourceData = []; // To hold data from all sources

      // Process Figma sources
      if (config.sources?.some(s => s.type === 'figma')) {
        console.log('Fetching data from Figma sources...');
        if (!config.figma?.apiKey && !process.env.FIGMA_API_KEY) {
            console.warn('Figma API key is not set. Skipping Figma source.');
        } else if (!config.figma?.fileKey && !config.sources.find(s => s.type === 'figma')?.fileId) {
            console.warn('Figma file key is not set. Skipping Figma source.');
        } else {
            const figmaData = await getVariables();
            if (figmaData) {
              allSourceData.push({ type: 'figma', data: figmaData });
            } else {
              console.warn('Failed to fetch Figma data or no Figma sources configured properly.');
            }
        }
      }

      // Process CSS sources
      const cssSources = config.sources?.filter(s => s.type === 'css');
      if (cssSources && cssSources.length > 0) {
        console.log('Processing CSS sources...');
        for (const source of cssSources) {
          if (source.paths && Array.isArray(source.paths)) {
            for (const cssPath of source.paths) {
              try {
                const cssProperties = await processCssFile(cssPath);
                if (cssProperties.length > 0) {
                  allSourceData.push({ type: 'css', sourcePath: cssPath, data: cssProperties });
                  console.log(`Extracted ${cssProperties.length} custom properties from ${cssPath}`);
                } else {
                  console.log(`No custom properties found in ${cssPath}`);
                }
              } catch (err) {
                console.warn(`Could not process CSS file ${cssPath}: ${err.message}`);
              }
            }
          } else if (source.path && typeof source.path === 'string') {
             try {
                const cssProperties = await processCssFile(source.path);
                if (cssProperties.length > 0) {
                  allSourceData.push({ type: 'css', sourcePath: source.path, data: cssProperties });
                  console.log(`Extracted ${cssProperties.length} custom properties from ${source.path}`);
                } else {
                  console.log(`No custom properties found in ${source.path}`);
                }
              } catch (err) {
                console.warn(`Could not process CSS file ${source.path}: ${err.message}`);
              }
          }
        }
      }

      if (allSourceData.length === 0) {
        // If only CSS processing failed but Figma variables might exist, this check might be too early.
        // However, if all sources including variables yield no data, it's correct.
        // console.error('No data extracted from primary sources. Halting build.');
        // process.exit(1);
        // For now, we will allow proceeding if only style processing might add data later.
      }

      // --- Temporary block for Figma Styles processing ---
      const figmaSourcesInConfig = config.sources?.filter(s => s.type === 'figma');
      if (figmaSourcesInConfig && figmaSourcesInConfig.length > 0) {
          for (const figmaCfg of figmaSourcesInConfig) {
              // Assume a new config flag: processStyles: true
              if (figmaCfg.processStyles) {
                  console.log(`Processing Figma Styles for file: ${figmaCfg.fileId || config.figma?.fileKey}...`);
                  const fileKey = figmaCfg.fileId || config.figma?.fileKey;
                  const apiKey = config.figma?.apiKey || process.env.FIGMA_API_KEY;

                  if (fileKey && apiKey) {
                      try {
                          const stylesArray = await fetchFigmaStyles(fileKey, apiKey);
                          if (stylesArray && stylesArray.length > 0) {
                              const nodeIdsToFetch = [...new Set(stylesArray.map(s => s.node_id).filter(id => id))] ;
                              // console.log(`Found ${nodeIdsToFetch.length} unique node_ids from styles to fetch details for.`);

                              let nodesData = {};
                              if (nodeIdsToFetch.length > 0) {
                                  nodesData = await fetchFigmaNodes(fileKey, apiKey, nodeIdsToFetch);
                              }

                              const parsedStyles = parseFigmaStylesResponse(stylesArray, nodesData);
                              console.log(`Parsed ${parsedStyles.length} potential token objects from styles (some may still need node data or further deconstruction).`);

                              const resolvedStyles = parsedStyles.filter(p => !p.needsNodeData);
                              if (resolvedStyles.length > 0) {
                                  console.log(`Successfully resolved ${resolvedStyles.length} token-like objects from styles:`);
                                  resolvedStyles.forEach(rs => {
                                      console.log(`  - Name: ${rs.name}, Type: ${rs.type}, Value: ${typeof rs.value === 'object' ? JSON.stringify(rs.value) : rs.value}`);
                                  });
                              }
                              // TODO NEXT: These parsedStyles need to be transformed into InternalTokens
                              // and added to `allSourceData` or `unprocessedTokens`.
                              // For now, just logging.

                          } else {
                              console.log('No published styles found for this Figma file.');
                          }
                      } catch (styleError) {
                          console.warn(`Error processing Figma styles for file ${fileKey}: ${styleError.message}`);
                      }
                  } else {
                      console.warn(`Skipping Figma Styles processing for source due to missing fileKey or apiKey.`);
                  }
              }
          }
      }
      // --- End of Temporary block ---

      if (allSourceData.length === 0) {
        console.error('No data extracted from any source after all processing attempts. Halting build.');
        process.exit(1);
      }

      console.log('Transforming all source data into internal tokens...');
      let unprocessedTokens = [];

      allSourceData.forEach(sourceOutput => {
        if (sourceOutput.type === 'figma') {
          const parsedFigmaVariables = parseFigmaVariablesResponse(sourceOutput.data);
          const figmaTokens = transformFigmaVariablesToInternalTokens(parsedFigmaVariables);
          unprocessedTokens.push(...figmaTokens);
          console.log(`Transformed ${figmaTokens.length} tokens from Figma source.`);
        } else if (sourceOutput.type === 'css') {
          const cssTokens = transformCssPropertiesToInternalTokens(sourceOutput.data);
          unprocessedTokens.push(...cssTokens);
          console.log(`Transformed ${cssTokens.length} tokens from CSS source: ${sourceOutput.sourcePath}`);
        }
      });

      if (unprocessedTokens.length === 0) {
        console.warn('No tokens were generated after transformation from any source.');
        return;
      }

      const conflictStrategy = config.conflictResolution || 'figmaWins';
      const internalTokens = resolveTokenConflicts(unprocessedTokens, conflictStrategy);

      if (!internalTokens || internalTokens.length === 0) {
        console.warn('No tokens remaining after conflict resolution. Nothing to output.');
        return;
      }

      console.log('Formatting and writing output files...');
      for (const outputConfig of config.output) {
        const outputDir = outputConfig.path || './dist';
        const outputFileName = outputConfig.fileName;
        const formatterOptions = outputConfig.options || {};

        if (!outputFileName) {
          console.warn(`Skipping output for formatter '${outputConfig.formatter}' due to missing fileName.`);
          continue;
        }

        if (outputConfig.formatter === 'json') {
          console.log(`Formatting tokens to JSON and writing to ${path.join(outputDir, outputFileName)}...`);
          await writeJsonOutput(outputDir, outputFileName, internalTokens);
        } else if (outputConfig.formatter === 'scss') {
          console.log(`Formatting tokens to SCSS and writing to ${path.join(outputDir, outputFileName)}...`);
          await writeScssOutput(outputDir, outputFileName, internalTokens, formatterOptions);
        } else if (outputConfig.formatter === 'css') {
          console.log(`Formatting tokens to CSS Custom Properties and writing to ${path.join(outputDir, outputFileName)}...`);
          await writeCssOutput(outputDir, outputFileName, internalTokens, formatterOptions);
        } else {
          console.warn(`Unknown formatter type: ${outputConfig.formatter}`);
        }
      }

      console.log('Token build process completed successfully!');

    } catch (error) {
      console.error('Error during token build process:', error.message);
      if (error.stack && process.env.DEBUG_TOKMAN) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

program
    .command('init')
    .description(`Create a sample configuration file (${CONFIG_FILE_NAME}).`)
    .action(() => {
        console.log('`init` command is not yet implemented.');
        console.log(`Manually create a '${CONFIG_FILE_NAME}' or use environment variables for Figma API key and file key.`);
    });


program.parse(process.argv);
