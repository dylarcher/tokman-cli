# 🤝 Contributing to cssman-cli

Contributions are welcome and greatly appreciated! Whether it's reporting a bug, discussing improvements, or submitting a pull request, every bit of help is valuable.

We expect all contributors to adhere to our [Code of Conduct](.github/CODE_OF_CONDUCT.md).

## How to Contribute

1.  **Prerequisites**:
    *   Ensure you have Node.js installed (version specified in `package.json` `engines` field is recommended).
    *   Familiarize yourself with the coding style outlined in `.editorconfig` and the project's linter configurations.

2.  **Fork the Repository:** Start by forking the `cssman-cli` repository (https://github.com/USERNAME/cssman-cli) to your own GitHub account.

3.  **Clone Your Fork:** Clone your forked repository to your local machine.
    ```bash
    git clone https://github.com/YOUR_USERNAME/cssman-cli.git
    cd cssman-cli
    ```

4.  **Create a Branch:** Create a new branch for your changes. Use a descriptive name.
    ```bash
    git checkout -b feature/your-awesome-feature
    # or for bug fixes:
    # git checkout -b bugfix/issue-description
    ```

5.  **Make Changes & Test:**
    *   Implement your feature or bug fix.
    *   Write or update tests for your changes. Run tests using:
        ```bash
        npm test
        ```
    *   Ensure your code adheres to linting standards by running:
        ```bash
        npm run lint
        ```
    *   Manually test your changes to ensure they work as expected and do not break existing functionality.

6.  **Commit Your Changes:** Write clear and concise commit messages.
    ```bash
    git commit -m "feat: Add new cool feature" -m "Detailed description of the feature and why it's useful."
    ```

7.  **Push to Your Fork:** Push your changes to your forked repository.
    ```bash
    git push origin feature/your-awesome-feature
    ```

8.  **Open a Pull Request:** Go to the original `cssman-cli` repository (https://github.com/USERNAME/cssman-cli) and open a pull request from your forked branch to the `main` branch of the original repository. Provide a clear description of your changes, why they are needed, and any steps to test them.

## Reporting Bugs

If you find a bug, please open an issue on the GitHub Issues page for `cssman-cli`. Include as much detail as possible:
*   Steps to reproduce.
*   What you expected to happen.
*   What actually happened.
*   Your environment (Node.js version, OS, etc.).

## Suggesting Enhancements

If you have an idea for an enhancement, feel free to open an issue to discuss it. Describe the enhancement, why it would be useful, and if possible, suggest how it might be implemented.

---

### 📝 References

This document provides a general guide. Refer to project-specific configurations like:
*   `package.json` for scripts and dependencies.
*   `.editorconfig` for base editor settings.
*   Linter configuration files (e.g., Biome config if used via `npm run lint`).
*   Node.js documentation for JavaScript runtime specifics.
