# Tokman CLI 🪙

**A powerful CLI tool for generating and managing design tokens from your style source.**

Tokman CLI helps streamline your design system workflow by automating the creation of design tokens, ensuring consistency across platforms and projects.

## Features ✨

*   **Feature 1:** Brief description of what it does.
*   **Feature 2:** Brief description of what it does.
*   **Feature 3:** Brief description of what it does.
    *   Sub-feature A
    *   Sub-feature B
*   Easy integration with popular styling formats (e.g., JSON, YAML, CSS Variables, etc. - *Specify actual formats*).
*   Extensible architecture for custom transformations and outputs.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
  - [Commands](#commands)
  - [Configuration](#configuration)
- [Contributing](#contributing)
- [Code of Conduct](#code-of-conduct)
- [License](#license)

## Installation 🚀

```bash
# Using npm (Node.js package manager)
npm install -g tokman-cli

# Using yarn
yarn global add tokman-cli

# For local project usage
npm install --save-dev tokman-cli
# or
yarn add --dev tokman-cli
```
*(Adjust installation instructions based on the actual package manager and distribution method if different, e.g., direct download, other package managers.)*

## Quick Start 🏁

1.  **Initialize Configuration:**
    ```bash
    tokman init
    ```
    This will create a `tokman.config.js` (or similar) file in your project root.

2.  **Define your style source(s)** in the configuration file.
    Example `tokman.config.js`:
    ```javascript
    // tokman.config.js (example)
    module.exports = {
      source: ['./styles/tokens.json'], // Path to your token definitions
      platforms: {
        css: {
          transformGroup: 'css',
          buildPath: 'dist/css/',
          files: [{
            destination: 'variables.css',
            format: 'css/variables'
          }]
        },
        // Add other platforms like scss, js, android, ios etc.
      }
    };
    ```
    *(This is a common structure for token tools like Style Dictionary; adjust if Tokman's config is different).*

3.  **Build your tokens:**
    ```bash
    tokman build
    ```
    Your generated tokens will be in the `dist/` directory (or as configured).

## Usage 🛠️

### Commands

*   `tokman init`: Initialize a new configuration file.
*   `tokman build`: Build/generate tokens based on the configuration.
*   `tokman clean`: Remove previously built artifacts.
*   `tokman --help`: Display help information for all commands.
*   `tokman <command> --help`: Display help for a specific command.

*(Add or modify commands as per actual CLI functionality)*

### Configuration

Tokman CLI is configured via a `tokman.config.js` (or `.json`, `.yaml`) file in your project root.

Key configuration options:
*   `source`: An array of glob patterns for your token source files.
*   `platforms`: An object defining output platforms (e.g., CSS, JS, SCSS, Android, iOS). Each platform specifies transformations, build path, and output files.

Refer to the [Full Configuration Documentation](docs/CONFIGURATION.md) for more details. *(Consider creating a more detailed configuration doc if needed)*

## Contributing 🤝

We welcome contributions from the community! Whether it's reporting a bug, suggesting a feature, or submitting a pull request, your help is appreciated.

Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started.

## Code of Conduct 📜

To ensure a welcoming and inclusive environment, we expect all contributors and participants to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).

## License 📄

This project is licensed under the [MIT License](LICENSE).

---

*Remember to update placeholders (like feature descriptions, installation steps if not an npm package, configuration details, command list) with actual information specific to `tokman-cli`.*
