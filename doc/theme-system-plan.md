# Theme System Implementation Plan

> **Status**: ✅ COMPLETED (2026-02-25)
>
> All phases have been successfully implemented.

---

## Context

Implement a theme system for Open Note to allow users to customize the app's appearance with:
1. Built-in Dark/Light themes
2. User-defined custom themes (stored in config directory or imported)
3. Full theming coverage (backgrounds, text, borders, accents, editor, preview, syntax highlighting)
4. User manual documentation

---

## Design Decisions (Confirmed)

| Decision | Choice |
|----------|--------|
| **Priority** | Built-in themes first, then custom themes |
| **Storage** | App config directory auto-load + manual import |
| **Scope** | Full theme (all UI elements + editor/preview + syntax) |
| **Editor/Preview** | Share same color scheme |
| **File Format** | JSON |
| **Implementation** | CSS Variables + Tailwind v4 |

---

## Theme File Format

```json
{
  "name": "My Custom Theme",
  "version": "1.0",
  "author": "Username",
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
      "danger": "#ef4444",
      "success": "#22c55e",
      "warning": "#eab308"
    },
    "editor": {
      "background": "#1f2937",
      "gutter": "#1e293b",
      "cursor": "#f3f4f6",
      "selection": "rgba(59, 130, 246, 0.3)"
    },
    "syntax": {
      "heading": "#e2e8f0",
      "link": "#7dd3fc",
      "code": "#fbbf24",
      "quote": "#6366f1"
    }
  }
}
```

---

## Implementation Plan

### Phase 1: CSS Variables Foundation ✅

**1.1 Define CSS Variables** (`src/styles.css`)
```css
@import "tailwindcss";

:root {
  /* Backgrounds */
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --bg-tertiary: #374151;

  /* Text */
  --text-primary: #f3f4f6;
  --text-secondary: #d1d5db;
  --text-muted: #9ca3af;

  /* Borders */
  --border-default: #374151;
  --border-focus: #3b82f6;

  /* Accents */
  --accent-primary: #3b82f6;
  --accent-danger: #ef4444;
  --accent-success: #22c55e;
  --accent-warning: #eab308;

  /* Editor */
  --editor-bg: #1f2937;
  --editor-gutter: #1e293b;
  --editor-cursor: #f3f4f6;
  --editor-selection: rgba(59, 130, 246, 0.3);

  /* Syntax */
  --syntax-heading1: #e2e8f0;
  --syntax-link: #7dd3fc;
  --syntax-code: #fbbf24;
  --syntax-quote: #6366f1;
}
```

**1.2 Configure Tailwind to use CSS variables**

In Tailwind v4, use `@theme` directive:
```css
@theme {
  --color-bg-primary: var(--bg-primary);
  --color-bg-secondary: var(--bg-secondary);
  /* ... */
}
```

**1.3 Create Theme Context** (`src/contexts/ThemeContext.tsx`)
- Theme state management
- Load/save theme preference
- Apply theme to CSS variables

---

### Phase 2: Built-in Themes ✅

**2.1 Create Theme Definitions** (`src/themes/presets.ts`)
```typescript
export const darkTheme: Theme = { /* current dark colors */ };
export const lightTheme: Theme = { /* light mode colors */ };
```

**2.2 Create Theme Selector UI** (`src/components/ThemeSelector.tsx`)
- Add to main menu dropdown (next to "About")
- Simple dropdown: "Dark" | "Light"
- No modal needed for initial implementation

**2.3 Persist Theme Preference**
- Store selected theme in Tauri app config
- Load on app startup

---

### Phase 3: Custom Theme Support ✅

**3.1 Theme Storage**
- Built-in themes: Code
- Custom themes: `~/.config/open-note/themes/*.json` (platform-specific)
- Current theme: App config

**3.2 Theme File Operations** (Rust backend)
```rust
#[tauri::command]
fn list_custom_themes() -> FsResult<Vec<Theme>>;

#[tauri::command]
fn import_theme(file_path: String) -> FsResult<Theme>;

#[tauri::command]
fn export_theme(theme: Theme, file_path: String) -> FsResult<()>;

#[tauri::command]
fn delete_custom_theme(theme_name: String) -> FsResult<()>;
```

**3.3 Extended Theme Selector UI**
- Built-in section: Dark, Light
- Custom section: List from config directory
- Import button: File picker
- Export button: Save current theme

---

### Phase 4: Component Migration ✅

Update all components to use theme classes:

| Component | Changes |
|-----------|---------|
| `App.tsx` | `bg-gray-900` → `bg-bg-primary` |
| `TitleBar.tsx` | `bg-gray-800` → `bg-bg-secondary` |
| `VaultSidebar.tsx` | Multiple color updates |
| `NoteTree.tsx` | Hover/active states |
| `MarkdownEditor.tsx` | Dynamic CodeMirror theme |
| `MarkdownPreview.tsx` | Dynamic preview colors |
| `OutlinePanel.tsx` | Background, text, border |
| `BacklinksPanel.tsx` | Background, text, border |
| `Modals` | Background, border, button colors |

---

### Phase 5: CodeMirror Integration ✅

**5.1 Create Dynamic Editor Theme** (`src/lib/editorTheme.ts`)
```typescript
export function createEditorTheme(colors: EditorColors) {
  return EditorView.theme({
    "&": { backgroundColor: colors.background },
    ".cm-gutters": { backgroundColor: colors.gutter },
    ".cm-cursor": { borderColor: colors.cursor },
    // ...
  });
}
```

**5.2 Create Dynamic Preview Styles** (`src/lib/previewTheme.ts`)
- Replace hardcoded colors with theme colors
- Update markdown styling extensions

---

### Phase 6: Documentation ✅

**Create `doc/theme-manual.md`**
- Theme file format specification
- Color property reference
- How to create a custom theme
- How to import/export themes
- Example themes

---

## Files Created

| File | Purpose | Status |
|------|---------|--------|
| `src/contexts/ThemeContext.tsx` | Theme state management | ✅ |
| `src/types/theme.ts` | Theme type definitions | ✅ |
| `src/themes/presets.ts` | Built-in theme definitions | ✅ |
| `src/lib/editorTheme.ts` | Dynamic CodeMirror theme | ✅ |
| `doc/theme-manual.md` | User documentation (Chinese) | ✅ |

## Files Modified

| File | Changes | Status |
|------|---------|--------|
| `src/styles.css` | Add CSS variables, Tailwind theme config | ✅ |
| `src/App.tsx` | Add ThemeProvider, use theme classes | ✅ |
| `src/components/TitleBar.tsx` | Theme menu item, theme classes | ✅ |
| `src/components/NoteTree.tsx` | Theme classes | ✅ |
| `src/components/OutlinePanel.tsx` | Theme classes | ✅ |
| `src/components/BacklinksPanel.tsx` | Theme classes | ✅ |
| `src/components/OutgoingLinksPanel.tsx` | Theme classes | ✅ |
| `src/components/AboutModal.tsx` | Theme classes | ✅ |
| `src/components/RenameNoteModal.tsx` | Theme classes | ✅ |
| `src/components/SaveStatusIndicator.tsx` | Theme classes | ✅ |
| `src/components/MarkdownEditor.tsx` | Dynamic editor theme | ✅ |
| `src/components/MarkdownPreview.tsx` | Dynamic preview theme | ✅ |
| `src/lib/markdownStylingExtension.ts` | Dynamic colors | ✅ |
| `src/lib/previewStylingExtension.ts` | Dynamic colors | ✅ |
| `src/lib/wikiLinkExtension.ts` | CSS variables | ✅ |
| `src/lib/wikiLinkPreviewExtension.ts` | CSS variables | ✅ |
| `src/lib/notes.ts` | Theme API wrappers | ✅ |
| `src-tauri/src/lib.rs` | Theme file commands | ✅ |

---

## Theme Class Mapping Reference

| Old Class | New Theme Class |
|-----------|-----------------|
| `bg-gray-900` | `bg-bg-primary` |
| `bg-gray-800` | `bg-bg-secondary` |
| `bg-gray-700` | `bg-bg-tertiary` |
| `text-gray-100` / `text-white` | `text-text-primary` |
| `text-gray-200` / `text-gray-300` | `text-text-secondary` |
| `text-gray-400` / `text-gray-500` | `text-text-muted` |
| `border-gray-700` | `border-border-default` |
| `bg-blue-600` | `bg-accent-primary` |
| `text-blue-400` | `text-accent-primary` |
| `hover:bg-red-500` | `hover:bg-accent-danger` |
| `text-red-400` | `text-accent-danger` |
| `text-green-500` | `text-accent-success` |
| `text-yellow-500` | `text-accent-warning` |

---

## Verification

| Test | Status |
|------|--------|
| Dark theme: Default, matches current appearance | ✅ |
| Light theme: Switch via menu, all UI updates | ✅ |
| Persistence: Restart app, theme persists | ✅ |
| Custom theme: Import JSON file, applies correctly | ✅ |
| Editor: CodeMirror gutter, cursor, selection match theme | ✅ |
| Preview: Markdown preview colors match theme | ✅ |
| Syntax: Headings, links, code blocks colored correctly | ✅ |
| Export: Export current theme to JSON file | ✅ |
| Documentation: Manual is clear and complete | ✅ |

---

## Summary

The theme system was implemented across 6 phases:

1. **CSS Variables Foundation** - Defined all theme colors as CSS variables
2. **Built-in Themes** - Created dark and light theme presets with context management
3. **Custom Theme Support** - Added Rust backend commands for theme file operations
4. **Component Migration** - Updated all UI components to use theme-aware classes
5. **CodeMirror Integration** - Created dynamic editor and preview themes
6. **Documentation** - Created comprehensive Chinese user manual

The system uses CSS variables for runtime theme switching without page reload, and supports both built-in themes (dark/light) and custom JSON theme files.
