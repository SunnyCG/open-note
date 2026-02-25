# Contributing to Open Note

Thank you for your interest in contributing to Open Note! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Please be considerate of others and follow standard open-source community guidelines.

## How to Contribute

### Reporting Bugs

If you find a bug, please [open an issue](https://github.com/openagentapp/open-note/issues/new?template=bug_report.md) with:

1. A clear, descriptive title
2. Steps to reproduce the bug
3. Expected behavior
4. Actual behavior
5. Your environment (OS, app version)
6. Screenshots if applicable

### Suggesting Features

We welcome feature suggestions! Please [open an issue](https://github.com/openagentapp/open-note/issues/new?template=feature_request.md) with:

1. A clear description of the feature
2. Why this feature would be useful
3. Any implementation ideas you have

### Contributing Code

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting
5. Commit your changes
6. Push to your fork
7. Open a Pull Request

## Development Setup

### Prerequisites

1. **Rust** - Install from https://rustup.rs
2. **Node.js** (v18+) - Install from https://nodejs.org

### Linux Dependencies

```bash
sudo apt update
sudo apt-get install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

### Getting Started

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/open-note.git
cd open-note

# Install dependencies
npm install

# Start development server
npm run tauri dev
```

### Build Commands

```bash
npm run dev          # Frontend only (browser at localhost:1420)
npm run tauri dev    # Full app with hot reload
npm run build        # Build frontend
npm run tauri build  # Build production release
cargo test           # Run Rust tests
```

## Project Structure

```
open-note/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── contexts/           # React contexts (Theme, etc.)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and API wrappers
│   ├── themes/             # Theme definitions
│   └── types/              # TypeScript type definitions
├── src-tauri/              # Rust backend (Tauri)
│   ├── src/
│   │   ├── main.rs         # Entry point
│   │   └── lib.rs          # Core logic and Tauri commands
│   └── Cargo.toml
├── doc/                    # Documentation
└── CLAUDE.md               # Architecture and development guide
```

See [CLAUDE.md](CLAUDE.md) for detailed architecture documentation.

## Coding Standards

### TypeScript/React

- Use TypeScript strict mode
- Use functional components with hooks
- Follow existing naming conventions
- Use theme-aware CSS classes (see `src/styles.css`)

### Rust

- Follow standard Rust formatting (`cargo fmt`)
- Use `FsResult<T>` for all Tauri command return types
- Run `cargo clippy` before committing

### General

- Write clear, self-documenting code
- Add comments for complex logic
- Keep functions small and focused
- Remove debug code before committing

## Commit Guidelines

- Use clear, descriptive commit messages
- Reference issues when applicable (`Fixes #123`)
- Keep commits atomic (one logical change per commit)

Example:
```
feat: add tag sidebar view

- Parse #tag syntax in markdown
- Display tags in sidebar
- Filter notes by selected tag

Closes #45
```

## Pull Request Process

1. **Create a feature branch** from `main`
2. **Make your changes** following coding standards
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Submit PR** with a clear description

### PR Checklist

- [ ] Code compiles without errors
- [ ] Tests pass (`cargo test`)
- [ ] Code follows project style guidelines
- [ ] Documentation updated if needed
- [ ] Commit messages are clear

### Review Process

1. Maintainers will review your PR
2. Address any feedback or requested changes
3. Once approved, your PR will be merged

## Questions?

Feel free to open an issue for questions or reach out to the maintainers.

Thank you for contributing to Open Note!
