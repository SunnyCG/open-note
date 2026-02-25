# Open Note Roadmap

This document outlines the development roadmap for Open Note, a cross-platform desktop note-taking application.

## Current Version: 0.1.0

### Completed Features

- [x] Markdown editing with CodeMirror 6
- [x] Wiki-style bidirectional links (`[[note-name]]`)
- [x] File-based vault storage
- [x] Multi-vault support with sidebar
- [x] Theme system (dark/light + custom themes)
- [x] Auto-save with visual feedback
- [x] Folder organization
- [x] Document outline navigation
- [x] Backlinks and outgoing links panels

---

## Phase 1: Core Features

### Comprehensive Markdown Support
- [ ] Full GFM (GitHub Flavored Markdown) support
- [ ] Tables with editing assistance
- [ ] Task lists with checkbox toggle
- [ ] Footnotes and citations
- [ ] Mathematical equations (LaTeX/KaTeX)
- [ ] Mermaid diagrams

### Tag System
- [ ] Parse `#tag` syntax in notes
- [ ] Tag autocomplete while typing
- [ ] Tag Sidebar view
- [ ] Filter notes by tags
- [ ] Tag management (rename, merge, delete)
- [ ] Nested tags support

### Core Feature Completion
- [ ] Full-text search across vault
- [ ] Graph view for note connections
- [ ] Note templates
- [ ] Image/file attachments
- [ ] Export options (PDF, HTML, Markdown bundle)

---

## Phase 2: Extension System

### Plugin Architecture
- [ ] Plugin API design
- [ ] Plugin loading system
- [ ] Plugin marketplace/gallery
- [ ] Plugin settings management

### Developer SDK
- [ ] TypeScript plugin SDK
- [ ] Plugin documentation
- [ ] Example plugins

### MCP Integration
- [ ] Model Context Protocol support
- [ ] AI assistant integration as plugin
- [ ] Smart note suggestions
- [ ] Automated note organization

---

## Phase 3: UX Enhancement

### Theme Improvements
- [ ] Redesigned default themes
- [ ] Theme editor UI
- [ ] Community theme sharing
- [ ] Syntax highlighting themes

### Documentation
- [ ] Comprehensive user manual
- [ ] Video tutorials
- [ ] Developer documentation
- [ ] API reference

### Interface Polish
- [ ] Keyboard shortcuts customization
- [ ] Multiple panes/tabs
- [ ] Vim mode support
- [ ] Accessibility improvements

---

## Phase 4: Mobile Platforms

### Android
- [ ] Android app development
- [ ] Sync solution for mobile
- [ ] Touch-optimized interface

### iOS
- [ ] iOS app development
- [ ] iCloud integration option
- [ ] iOS-specific optimizations

### HarmonyOS
- [ ] HarmonyOS adaptation
- [ ] Huawei ecosystem integration

---

## Future Considerations

### Collaboration
- [ ] Real-time collaboration
- [ ] Shared vaults
- [ ] Comments and annotations

### Cloud Sync
- [ ] Optional cloud sync service
- [ ] End-to-end encryption
- [ ] Version history

### AI Features
- [ ] Smart note linking suggestions
- [ ] Content summarization
- [ ] Natural language search

---

## Contributing

Want to help shape the future of Open Note? Check out our [Contributing Guide](CONTRIBUTING.md) and [open issues](https://github.com/openagentapp/open-note/issues).

### Priority Areas for Contributions

1. **Markdown features** - Help implement full GFM support
2. **Tag system** - Core functionality in high demand
3. **Documentation** - User guides and tutorials
4. **Testing** - Unit tests and integration tests

---

## Release Schedule

| Version | Target | Focus |
|---------|--------|-------|
| 0.2.0 | Q2 2026 | Tag System + Markdown |
| 0.3.0 | Q3 2026 | Plugin System |
| 1.0.0 | Q4 2026 | Stable Release |
| 1.1.0 | 2027 | Mobile Platforms |

*Dates are tentative and subject to change based on community feedback and development progress.*

---

Last updated: February 2026
