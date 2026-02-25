# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Open Note is a cross-platform desktop note-taking application (Ubuntu, macOS, Windows) inspired by Obsidian. The app uses a local folder-based storage model where each note is a Markdown file.

**Core Features:**
- Markdown editing with live preview
- `[[wiki-style]]` bidirectional links between notes
- File-based storage (vaults are regular folders)
- Multi-vault support with vault sidebar
- Theme system with dark/light modes and custom themes

## Tech Stack

- **Backend:** Rust (Tauri)
- **Frontend:** React + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4 with CSS Variables

## Common Commands

```bash
# Development
npm run tauri dev          # Start dev server with hot reload

# Build
npm run tauri build        # Build production release for current platform
npm run build              # Frontend only build (for checking TypeScript)

# Testing
cargo test                 # Run Rust unit tests

# Linting
cargo clippy               # Rust linter
cargo fmt                  # Format Rust code
```

## Architecture

```
open-note/
├── src-tauri/           # Rust backend (Tauri)
│   ├── src/
│   │   ├── main.rs      # Entry point, app setup
│   │   └── lib.rs       # Core logic, Tauri commands, AppState
│   └── Cargo.toml
├── src/                 # React frontend
│   ├── components/      # UI components
│   │   ├── MarkdownEditor.tsx
│   │   ├── MarkdownPreview.tsx
│   │   ├── BacklinksPanel.tsx
│   │   ├── OutgoingLinksPanel.tsx
│   │   ├── OutlinePanel.tsx
│   │   ├── NoteTree.tsx
│   │   ├── VaultSidebar.tsx
│   │   └── ...
│   ├── contexts/        # React contexts
│   │   └── ThemeContext.tsx    # Theme state management
│   ├── hooks/           # Custom React hooks
│   │   ├── useNotes.ts
│   │   ├── useWikiLinks.ts
│   │   └── useAutoSave.ts
│   ├── lib/             # Frontend utilities
│   │   ├── notes.ts     # API wrappers for Tauri commands
│   │   ├── editorTheme.ts      # Dynamic CodeMirror theme
│   │   ├── wikiLinkExtension.ts
│   │   ├── markdownStylingExtension.ts
│   │   └── previewStylingExtension.ts
│   ├── themes/          # Theme definitions
│   │   └── presets.ts   # Built-in dark/light themes
│   ├── types/
│   │   ├── note.ts      # Note type definitions
│   │   └── theme.ts     # Theme type definitions
│   ├── styles.css       # CSS variables + Tailwind config
│   └── App.tsx
├── doc/                 # Documentation
│   ├── theme-manual.md  # Theme user manual (Chinese)
│   └── theme-system-plan.md  # Theme implementation plan
└── package.json
```

### Tauri Commands (Rust → Frontend)

Backend operations exposed to the frontend via `#[tauri::command]`:

**Vault Management:**
- `validate_vault`, `create_vault`, `get_vault_info`
- `set_current_vault`, `get_current_vault`
- `list_recent_vaults`, `remove_recent_vault`
- `get_open_vaults`, `add_open_vault`, `remove_open_vault`
- `get_last_note`, `set_last_note`
- `get_vault_path`, `init_vault` (legacy)

**Note Operations:**
- `list_notes`, `read_note`, `write_note`, `delete_note`, `rename_note`
- `list_file_tree`, `create_folder`

**Wiki Links:**
- `parse_links`, `get_backlinks`, `resolve_wiki_link`

**Theme Management:**
- `list_custom_themes`, `import_theme`, `export_theme`, `delete_custom_theme`

### IPC Pattern

The frontend calls Rust commands via `invoke()`:
```typescript
import { invoke } from '@tauri-apps/api/core';
const content = await invoke('read_note', { path: '/path/to/note.md' });
```

All API wrappers are in `src/lib/notes.ts`.

### AppState (Rust)

Global state managed in `lib.rs`:
```rust
pub struct AppState {
    pub current_vault: Mutex<Option<String>>,
    pub open_vaults: Mutex<Vec<String>>,
    pub recent_vaults: Mutex<Vec<String>>,
    pub open_notes_per_vault: Mutex<HashMap<String, Vec<String>>>,
    pub active_note_per_vault: Mutex<HashMap<String, String>>,
    pub last_note_per_vault: Mutex<HashMap<String, String>>,
    pub last_open_directory: Mutex<Option<String>>,
}
```

## Key Implementation Notes

### Theme System

The app uses a CSS Variables-based theme system:

**CSS Variables** (`src/styles.css`):
- All colors defined as CSS variables in `:root`
- Light theme override via `[data-theme="light"]` selector
- Tailwind v4 `@theme` directive maps variables to utility classes

**Theme Context** (`src/contexts/ThemeContext.tsx`):
- Manages current theme state
- Loads/saves theme preference to localStorage
- Applies theme by setting CSS variables on `document.documentElement`

**Theme Classes** (use these instead of hardcoded colors):
| Old Class | New Theme Class |
|-----------|-----------------|
| `bg-gray-900` | `bg-bg-primary` |
| `bg-gray-800` | `bg-bg-secondary` |
| `bg-gray-700` | `bg-bg-tertiary` |
| `text-gray-100` | `text-text-primary` |
| `text-gray-300` | `text-text-secondary` |
| `text-gray-500` | `text-text-muted` |
| `border-gray-700` | `border-border-default` |
| `bg-blue-600` | `bg-accent-primary` |
| `text-blue-400` | `text-accent-primary` |

**CodeMirror Integration**:
- `src/lib/editorTheme.ts` - Creates dynamic editor themes
- Uses CSS variables for syntax highlighting
- No hardcoded `oneDark` theme - respects current theme

### Multi-Vault Support
- Left sidebar (VaultSidebar) shows vault initials
- Open vaults at top, history vaults below, separated by blue line
- Click to switch vaults, restores last opened note
- Hover shows all vault names in tooltip

### Wiki Links
- Parse `[[note-name]]` syntax in Markdown
- Support `[[note-name#heading]]` and `[[note-name|display text]]` variants
- Case-insensitive link resolution
- Backlinks computed by scanning all notes in vault

### Auto-Save
- Debounced auto-save (1 second) when editing
- Save on Cmd/Ctrl+S shortcut
- Save before closing app or navigating away

### File Structure
- Each vault is a regular directory
- Notes are `.md` files
- Custom themes stored in `~/.config/open-note/themes/` (platform-specific)
- App config stored in platform-appropriate config directory

### Cross-Platform Considerations
- Use `tauri::api::path` for platform-specific paths
- Test file operations on all platforms (path separators, permissions)
- Handle different filesystem case sensitivity (macOS vs Linux)

---

## Session Memory

@memory/MEMORY.md
