# Design Token Generator

A Node.js library to generate design tokens from diverse styling sources. This library helps you ingest styling information from sources like CSS files, Figma, or Miro, and produce a cohesive design token system.

**Note: This library is currently in early development (Phase 1).**
Current functionality focuses on extracting variables from Figma files and outputting them as a structured JSON file.

## Installation (Local Development)

1.  Clone the repository:
    ```bash
    git clone <repository_url>
    cd design-token-generator
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

## Usage (Phase 1 - Figma to JSON)

The library can be run as a Node.js script. You'll need a Figma File Key and a Figma Personal Access Token.

### Via Command Line Arguments:

```bash
node src/index.js <YOUR_FIGMA_FILE_KEY> <YOUR_FIGMA_API_TOKEN> [OUTPUT_FILE_PATH]
```
-   `<YOUR_FIGMA_FILE_KEY>`: The key of the Figma file you want to process.
-   `<YOUR_FIGMA_API_TOKEN>`: Your Figma Personal Access Token.
-   `[OUTPUT_FILE_PATH]`: (Optional) The path where the JSON output file will be saved. Defaults to `tokens.json` in the current directory.

**Example:**
```bash
node src/index.js figmaFileKey123 abc123xyzToken my-tokens/theme.json
```

### Via Environment Variables:

You can also set the following environment variables:
-   `FIGMA_FILE_KEY`
-   `FIGMA_API_TOKEN`
-   `OUTPUT_FILE_PATH` (optional, defaults to `tokens.json`)

Then run the script:
```bash
node src/index.js
```

### Programmatic Usage

The core functionality can also be imported and used in your own Node.js scripts:

```javascript
const { generateTokensFromFigma } = require('./src/index'); // Adjust path as needed

const FIGMA_FILE_KEY = 'your_figma_file_key';
const FIGMA_API_TOKEN = 'your_figma_api_token';
const OUTPUT_FILE_PATH = 'output/my_design_tokens.json';

async function main() {
  try {
    const outputPath = await generateTokensFromFigma(FIGMA_FILE_KEY, FIGMA_API_TOKEN, OUTPUT_FILE_PATH);
    if (outputPath) {
      console.log(`Design tokens generated successfully at: ${outputPath}`);
    }
  } catch (error) {
    console.error('Failed to generate design tokens:', error);
  }
}

main();
```

## Running Tests

To run the unit tests:
```bash
npm test
```

## License

This project is licensed under the MIT License.
