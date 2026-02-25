# Open Note

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![GitHub release](https://img.shields.io/github/v/release/openagentapp/open-note?include_prereleases)](https://github.com/openagentapp/open-note/releases)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)](https://github.com/openagentapp/open-note)

A cross-platform desktop note-taking application (Ubuntu, macOS, Windows) inspired by Obsidian. Features local folder-based storage with Markdown files and wiki-style bidirectional links.

![Screenshot placeholder](docs/screenshot-placeholder.png)

## Features

- **Markdown editing with live preview** - CodeMirror 6 editor with syntax highlighting
- **`[[wiki-style]]` bidirectional links** - Connect notes with wiki links, view backlinks
- **File-based storage** - Vaults are regular folders, notes are `.md` files
- **Multi-vault support** - Switch between multiple vaults with sidebar navigation
- **Theme system** - Built-in dark/light themes + custom JSON theme support
- **Auto-save** - Debounced auto-save with visual status indicator
- **Folder organization** - Create folders and organize notes hierarchically
- **Document outline** - Right sidebar showing headings for quick navigation

## Tech Stack

- **Backend:** Rust (Tauri)
- **Frontend:** React + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4 with CSS Variables

## Getting Started

### Prerequisites

1. Install Rust: https://rustup.rs
2. Install Node.js: https://nodejs.org

### Linux Dependencies

```bash
sudo apt update
sudo apt-get install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

### Installation

```bash
npm install
```

### Development

```bash
npm run tauri dev      # Start dev server with hot reload
npm run dev            # Frontend only (browser at localhost:1420)
```

### Build

```bash
npm run build          # Build frontend for production
npm run tauri build    # Build production release for current platform
```

### Testing

```bash
cargo test             # Run Rust unit tests
```

## Theme System

Open Note supports customizable themes:

### Built-in Themes
- **Dark** - Default dark theme
- **Light** - Light theme for daytime use

Switch themes via the menu (☰) in the title bar.

### Custom Themes

Create custom themes by placing JSON files in the themes directory:

- **Linux:** `~/.config/open-note/themes/`
- **macOS:** `~/Library/Application Support/open-note/themes/`
- **Windows:** `%APPDATA%/open-note/themes/`

See [doc/theme-manual.md](doc/theme-manual.md) for detailed documentation (Chinese).

### Theme File Format

```json
{
  "name": "My Theme",
  "version": "1.0",
  "author": "Author Name",
  "colors": {
    "background": {
      "primary": "#111827",
      "secondary": "#1f2937",
      "tertiary": "#374151"
    },
    "text": {
      "primary": "#f3f4f6",
      "secondary": "#d1d5db",
      "muted": "#9ca3af"
    },
    "border": {
      "default": "#374151",
      "focus": "#3b82f6"
    },
    "accent": {
      "primary": "#3b82f6",
      "primaryHover": "#2563eb",
      "danger": "#ef4444",
      "dangerHover": "#dc2626",
      "success": "#22c55e",
      "warning": "#eab308"
    },
    "editor": {
      "background": "#1f2937",
      "gutter": "#1e293b",
      "cursor": "#f3f4f6",
      "selection": "rgba(59, 130, 246, 0.3)",
      "placeholder": "#64748b"
    },
    "syntax": {
      "heading1": "#f1f5f9",
      "heading2": "#e2e8f0",
      "heading3": "#cbd5e1",
      "heading4": "#94a3b8",
      "link": "#7dd3fc",
      "code": "#fbbf24",
      "codeBg": "rgba(175, 184, 193, 0.15)",
      "quote": "#6366f1",
      "quoteBg": "rgba(99, 102, 241, 0.05)",
      "hr": "#374151"
    },
    "unsavedDot": "#3b82f6"
  }
}
```

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/)
- [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Documentation

- [CLAUDE.md](CLAUDE.md) - Development guidelines and architecture
- [doc/theme-manual.md](doc/theme-manual.md) - Theme system user manual (Chinese)
- [doc/theme-system-plan.md](doc/theme-system-plan.md) - Theme implementation plan
- [doc/features.md](doc/features.md) - Implemented features changelog

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

- 🐛 [Report a Bug](https://github.com/openagentapp/open-note/issues/new?template=bug_report.md)
- 💡 [Request a Feature](https://github.com/openagentapp/open-note/issues/new?template=feature_request.md)
- 🔀 [Submit a Pull Request](CONTRIBUTING.md#pull-requests)

## Roadmap

See [ROADMAP.md](ROADMAP.md) for the project development plan.

**Upcoming Features:**
- Comprehensive Markdown syntax support
- Tag system with Tag Sidebar view
- Plugin/Extension system
- Mobile platforms (Android, iOS, HarmonyOS)

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

Inspired by [Obsidian](https://obsidian.md/) - a powerful knowledge base that works on local Markdown files.

---

Made with ❤️ by [Sunny Wu](https://github.com/openagentapp)
