# Contributing to MCP Manager

Thank you for considering contributing to the MCP Manager project! This document outlines the process for contributing to this repository.

## Branch Protection

This repository has branch protection enabled for the main branch. This means:

- Direct pushes to the main branch are not allowed
- All changes must go through pull requests
- Pull requests require at least one review before merging
- Stale reviews are dismissed when new commits are pushed

## Contribution Workflow

1. Fork the repository
2. Create a feature branch in your fork
3. Make your changes
4. Submit a pull request to the main branch
5. Request a review from a team member
6. Address any feedback
7. Once approved, your changes will be merged

## Code Standards

- Follow the existing code style
- Write tests for new features
- Update documentation for API changes
- Keep pull requests focused on a single change

## Commit Messages

Use clear, descriptive commit messages following the conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

Example: `feat(dashboard): add MCP server health monitoring widget`

## Testing

All new features should include appropriate tests. Run the existing test suite before submitting a pull request:

```bash
npm test
```

## Documentation

Update the README.md and other relevant documentation when making changes. Documentation should be clear and accessible.

## Questions?

If you have questions about contributing, please open an issue or reach out to the maintainers.

Thank you for your contributions!
