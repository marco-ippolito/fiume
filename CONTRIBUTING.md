# Contributing to Fiume

Thank you for considering contributing to **Fiume**! We welcome contributions
from the community to improve and enhance this state machine library.
By contributing, you help make **Fiume** better for everyone.

## Getting Started

Before you start contributing, please follow these steps:

1. Fork the repository on GitHub.
2. Clone your forked repository to your local machine.

    ```bash
    git clone https://github.com/your-username/fiume.git
    ```

3. Create a new branch for your changes.

    ```bash
    git checkout -b feature-or-fix-branch
    ```

4. Install the project dependencies.

    ```bash
    pnpm install --frozen-lockfile
    ```

5. Make your changes and ensure that tests pass.

    ```bash
    pnpm test
    ```

6. Commit your changes and push them to your fork.

    ```bash
    git add .
    git commit -m "Your commit message"
    git push origin feature-or-fix-branch
    ```

7. Create a pull request on the main repository.

## Code Style

Please adhere to the existing code style in the project.
**Fiume** uses TypeScript, and we follow a consistent coding style.
Run the linter before committing your changes:

```bash
pnpm format
```

## Testing

Ensure that your changes include relevant tests.
Run the test suite to confirm that your changes do not break existing functionality:

```bash
pnpm test
```

## Documentation

If you make changes that impact user-facing features, update the documentation accordingly.
Documentation is located in the `README.md` file.

## Issues

If you encounter bugs or have suggestions for improvements,
please open an issue on the GitHub repository.
Provide detailed information about the problem or enhancement you are proposing.

## Pull Requests

When submitting a pull request, please include a clear description of the changes
you've made and the motivation for them.
Make sure your branch is up-to-date with the main repository before creating
a pull request.

Thank you for your contribution! 🚀
