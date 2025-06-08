# Cssman CLI 🪙

**Cssman CLI is a powerful CLI tool for generating and managing design tokens from your style source.** It helps streamline your design system workflow by automating the creation of design tokens, ensuring consistency across platforms and projects.

## Table of Contents

- [Core Purpose & Goals](#core-purpose--goals)
- [Key Features](#key-features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Quick Start](#quick-start)
- [Usage](#usage)
  - [Commands](#commands)
  - [Configuration](#configuration)
- [How to Contribute](#how-to-contribute)
- [Code of Conduct](#code-of-conduct)
- [License](#license)

## Core Purpose & Goals

*   **What problem does your project solve?** Cssman CLI solves the problem of managing and synchronizing design tokens across different platforms and projects by automating their generation from a single source of truth.
*   **What are the main goals or vision for this project?** To provide a flexible, easy-to-use, and extensible tool for design system token management, improving developer workflow and ensuring design consistency.
*   **Who is the intended audience or user base?** Developers and designers working with design systems who need a reliable way to manage and transform design tokens.

## Key Features ✨

*   **Automated Token Generation:** Generate design tokens for various platforms from a single style source.
*   **Multi-Platform Support:** Easy integration with popular styling formats (e.g., JSON, CSS Variables, SCSS, JS objects - *Specify/verify actual supported formats*).
*   **Extensible Architecture:** Allows for custom transformations and outputs to fit specific project needs.
*   **Configuration Driven:** Manage token generation through a simple configuration file.
*   **CLI Interface:** Provides commands for initializing, building, and cleaning token artifacts.

## Getting Started

### Prerequisites

*   Node.js (Specify version, e.g., v14 or higher)
*   npm (Specify version, e.g., v6 or higher) or yarn

### Installation 🚀

```bash
# Using npm (Node.js package manager)
npm install -g cssman-cli

# Using yarn
yarn global add cssman-cli

# For local project usage
npm install --save-dev cssman-cli
# or
yarn add --dev cssman-cli
```
*(Adjust installation instructions based on the actual package manager and distribution method if different, e.g., direct download, other package managers.)*

### Quick Start 🏁

1.  **Initialize Configuration:**
    ```bash
    cssman init
    ```
    This will create a `cssman.config.js` (or similar, e.g. `cssman.json`) file in your project root.

2.  **Define your style source(s)** in the configuration file.
    Example `cssman.config.js`:
    ```javascript
    // cssman.config.js (example)
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
    *(This is a common structure for token tools like Style Dictionary; adjust if Cssman's config is different).*

3.  **Build your tokens:**
    ```bash
    cssman build
    ```
    Your generated tokens will be in the `dist/` directory (or as configured).

## Usage 🛠️

### Commands

*   `cssman init`: Initialize a new configuration file.
*   `cssman build`: Build/generate tokens based on the configuration.
*   `cssman clean`: Remove previously built artifacts.
*   `cssman --help`: Display help information for all commands.
*   `cssman <command> --help`: Display help for a specific command.

*(Add or modify commands as per actual CLI functionality)*

### Configuration

Cssman CLI is configured via a `cssman.config.js` (or `.json`, `.yaml`) file in your project root.

Key configuration options:
*   `source`: An array of glob patterns for your token source files.
*   `platforms`: An object defining output platforms (e.g., CSS, JS, SCSS, Android, iOS). Each platform specifies transformations, build path, and output files.

Refer to the [Full Configuration Documentation](docs/CONFIGURATION.md) for more details. *(Consider creating a more detailed configuration doc if needed. Ensure this link is valid or removed if no such doc exists yet).*

## How to Contribute 🤝

We welcome contributions from the community! Whether it's reporting a bug, suggesting a feature, or submitting a pull request, your help is appreciated.

Please read our [Contributing Guidelines](.github/CONTRIBUTING.md) to get started. *(Ensure this path is correct, the template linked to .github/CONTRIBUTING.md)*

## Code of Conduct 📜

To ensure a welcoming and inclusive environment, we expect all contributors and participants to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). *(Ensure this file exists or is created)*

## License 📄

This project is licensed under the [MIT License](LICENSE).

---

*Remember to update placeholders (like feature descriptions, version numbers, supported formats, configuration details, command list, and linked document paths) with actual information specific to `cssman-cli`.*
