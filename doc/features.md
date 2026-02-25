# Implemented Features

## 2026-02-25 (Theme System Release)

### Theme System ⭐

A complete theme system with built-in dark/light themes and custom theme support.

**Built-in Themes:**
- **Dark** - Default dark theme matching previous appearance
- **Light** - Light theme for daytime use
- Switch themes via menu (☰) in title bar

**Custom Theme Support:**
- Import JSON theme files via file picker
- Themes stored in platform-specific config directory
- Export current theme to JSON file
- Delete custom themes

**Theme Coverage:**
- Background colors (primary, secondary, tertiary)
- Text colors (primary, secondary, muted)
- Border colors (default, focus)
- Accent colors (primary, danger, success, warning)
- Editor colors (background, gutter, cursor, selection, placeholder)
- Syntax highlighting (headings, links, code, quotes, horizontal rules)

**Technical Implementation:**

| Component | File | Changes |
|-----------|------|---------|
| CSS Variables | `src/styles.css` | All theme colors as CSS variables |
| Theme Context | `src/contexts/ThemeContext.tsx` | State management, persistence, apply theme |
| Theme Types | `src/types/theme.ts` | TypeScript interfaces |
| Theme Presets | `src/themes/presets.ts` | Built-in dark/light definitions |
| Editor Theme | `src/lib/editorTheme.ts` | Dynamic CodeMirror themes using CSS variables |
| Rust Backend | `src-tauri/src/lib.rs` | Theme file commands |

**New Tauri Commands:**
- `list_custom_themes` - List themes from config directory
- `import_theme` - Import and validate theme JSON
- `export_theme` - Export theme to JSON file
- `delete_custom_theme` - Delete custom theme file

**UI Component Updates:**
All components migrated to use theme-aware CSS classes:
- `NoteTree.tsx`, `VaultSidebar.tsx`, `OutlinePanel.tsx`
- `BacklinksPanel.tsx`, `OutgoingLinksPanel.tsx`
- `AboutModal.tsx`, `RenameNoteModal.tsx`, `SaveStatusIndicator.tsx`
- All modals in `App.tsx`

**Theme Class Mapping:**
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

**Documentation:**
- `doc/theme-manual.md` - User manual (Chinese)
- `doc/theme-system-plan.md` - Implementation plan and notes

---

## 2026-02-25 (Session Isolation)

### Vault Sidebar Session Isolation
- **Open vaults are session-scoped** - Only the last used vault appears in "Open" section on startup
- Other vaults automatically reset to "History" section after app restart
- Clean separation between current work (Open) and historical vaults (History)
- User-friendly behavior: each session starts fresh, with only the active vault pre-opened

**Backend Changes:**
- Removed `open_vaults` from `AppConfig` (no longer persisted)
- Modified `run()` setup to clear open vaults and only restore current vault

---

## 2026-02-25 (Data Persistence)

### Data Persistence
- **Current vault state restoration** - App opens the last used vault on startup
- Vault history persistent storage (up to 10 recent vaults)
- Last opened note per vault restoration on app startup
- **Invalid path handling** - If saved vault path doesn't exist, automatically clears and falls back
- File dialog default path memory (remembers last opened folder)

**Configuration Storage:**
- Linux: `~/.config/open-note/config.json`
- Windows: `%APPDATA%\com.sunny.open-note\config.json`
- macOS: `~/Library/Application Support/com.sunny.open-note/config.json`

**Custom Themes Storage:**
- Linux: `~/.config/open-note/themes/`
- Windows: `%APPDATA%\com.sunny.open-note\themes/`
- macOS: `~/Library/Application Support/com.sunny.open-note/themes/`

**New Tauri Commands:**
- `get_last_open_directory` - Retrieve last opened folder path
- `set_last_open_directory` - Save last opened folder path

---

## 2026-02-14 (CodeMirror Editor)

### CodeMirror 6 Markdown Editor
- Replaced plain textarea with CodeMirror 6 editor
- Markdown syntax highlighting with code block language support
- Line numbers, fold gutters, bracket matching
- Wiki link rendering as clickable widgets:
  - `[[note-name]]` - basic link
  - `[[note-name#heading]]` - heading link
  - `[[note-name|display text]]` - aliased link
- Wiki links styled with link color and hover effects
- Cmd/Ctrl+S save shortcut preserved

**New Components:**
- `MarkdownEditor` - CodeMirror 6 React wrapper
- `MarkdownPreview` - Preview mode with full styling
- `wikiLinkExtension` - Custom CodeMirror extension for wiki links

### Auto-Save Feature
- Debounced auto-save (1000ms after stopping typing)
- Auto-save before switching notes
- Auto-save before switching vaults
- Auto-save before following wiki links
- Auto-save on app close
- Keyboard shortcut Cmd/Ctrl+S for manual save
- Visual save status indicator (saving/saved/error states)

**New Components:**
- `SaveStatusIndicator` - Visual feedback for save states

**New Hooks:**
- `useAutoSave` - Auto-save logic with debounce and status tracking

---

## 2026-02-13 (Project Initialization)

### Project Initialization
- Tauri + React + TypeScript project scaffold
- Tailwind CSS v4 integration
- Basic project structure (components, hooks, lib, types)

### File System Operations
- `read_note` - Read note content from file
- `write_note` - Create or update note
- `delete_note` - Delete note file
- `rename_note` - Rename note file
- `list_notes` - List all notes in vault (sorted by modification time)
- `list_file_tree` - List notes and folders as tree structure
- `create_folder` - Create new folder

### Vault Management
- `validate_vault` - Validate vault directory
- `create_vault` - Create new vault folder
- `get_vault_info` - Get vault metadata
- `set_current_vault` - Switch active vault
- `get_current_vault` - Get current vault
- `list_recent_vaults` - List recently opened vaults
- `remove_recent_vault` - Remove vault from recent list
- Native folder picker dialog via `tauri-plugin-dialog`

### Wiki Links
- `parse_links` - Parse wiki links from markdown content
- `get_backlinks` - Find notes that link to a specific note
- `resolve_wiki_link` - Resolve link target to file path

### UI Components
- Dark theme sidebar with note list
- Note editor with title and content
- Create note modal
- Vault management modal
- Unsaved changes indicator
- Character/word count status bar
