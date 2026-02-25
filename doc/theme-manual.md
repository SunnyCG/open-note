# Open Note Theme Manual

This document explains how to customize the appearance of Open Note using themes.

## Table of Contents

- [Built-in Themes](#built-in-themes)
- [Switching Themes](#switching-themes)
- [Custom Themes](#custom-themes)
- [Theme File Format](#theme-file-format)
- [Color Properties Reference](#color-properties-reference)
- [Example Themes](#example-themes)
- [Import/Export Themes](#importexport-themes)

---

## Built-in Themes

Open Note provides two built-in themes:

| Theme | Description |
|-------|-------------|
| **Dark** | Dark theme, ideal for night use, reduces eye strain |
| **Light** | Light theme, ideal for daytime use, improves readability |

## Switching Themes

1. Click the menu icon (☰) on the left side of the title bar
2. Select "Dark" or "Light" from the dropdown menu
3. The theme will switch immediately and be saved automatically

---

## Custom Themes

### Theme File Location

Custom theme files are stored in the application config directory:

- **Linux**: `~/.config/open-note/themes/`
- **macOS**: `~/Library/Application Support/open-note/themes/`
- **Windows**: `%APPDATA%/open-note/themes/`

### Creating a Custom Theme

1. Create a new JSON file, e.g., `my-theme.json`
2. Define theme colors using the format below
3. Place the file in the themes directory
4. Restart the app, and the theme will appear in the menu

---

## Theme File Format

```json
{
  "name": "Theme Name",
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

---

## Color Properties Reference

### Background Colors (`background`)

| Property | Description |
|----------|-------------|
| `primary` | Primary background - Main interface background |
| `secondary` | Secondary background - Sidebars, panels, modals |
| `tertiary` | Tertiary background - Hover states, input fields |

### Text Colors (`text`)

| Property | Description |
|----------|-------------|
| `primary` | Primary text - Main content text |
| `secondary` | Secondary text - Secondary content text |
| `muted` | Muted text - Labels, metadata, disabled text |

### Border Colors (`border`)

| Property | Description |
|----------|-------------|
| `default` | Default border - Most borders |
| `focus` | Focus border - Input field focus state |

### Accent Colors (`accent`)

| Property | Description |
|----------|-------------|
| `primary` | Primary accent - Buttons, active states, links |
| `primaryHover` | Primary accent hover - Button hover state |
| `danger` | Danger color - Delete buttons, error messages |
| `dangerHover` | Danger hover - Delete button hover state |
| `success` | Success color - Save success indicators |
| `warning` | Warning color - Unsaved changes indicators |

### Editor Colors (`editor`)

| Property | Description |
|----------|-------------|
| `background` | Editor background color |
| `gutter` | Line number gutter background |
| `cursor` | Cursor color |
| `selection` | Selection highlight color (supports rgba) |
| `placeholder` | Placeholder text color |

### Syntax Highlighting Colors (`syntax`)

| Property | Description |
|----------|-------------|
| `heading1` | Level 1 heading color |
| `heading2` | Level 2 heading color |
| `heading3` | Level 3 heading color |
| `heading4` | Level 4+ heading color |
| `link` | Link color (Wiki links `[[note]]`) |
| `code` | Inline code color |
| `codeBg` | Inline code background (supports rgba) |
| `quote` | Blockquote border color |
| `quoteBg` | Blockquote background (supports rgba) |
| `hr` | Horizontal rule color |

### Other

| Property | Description |
|----------|-------------|
| `unsavedDot` | Unsaved indicator dot color |

---

## Example Themes

### High Contrast Theme

```json
{
  "name": "High Contrast",
  "version": "1.0",
  "author": "Open Note",
  "colors": {
    "background": {
      "primary": "#000000",
      "secondary": "#0a0a0a",
      "tertiary": "#1a1a1a"
    },
    "text": {
      "primary": "#ffffff",
      "secondary": "#f0f0f0",
      "muted": "#d0d0d0"
    },
    "border": {
      "default": "#404040",
      "focus": "#00ff00"
    },
    "accent": {
      "primary": "#00ff00",
      "primaryHover": "#00cc00",
      "danger": "#ff0000",
      "dangerHover": "#cc0000",
      "success": "#00ff00",
      "warning": "#ffff00"
    },
    "editor": {
      "background": "#000000",
      "gutter": "#0a0a0a",
      "cursor": "#00ff00",
      "selection": "rgba(0, 255, 0, 0.3)",
      "placeholder": "#666666"
    },
    "syntax": {
      "heading1": "#ffffff",
      "heading2": "#f0f0f0",
      "heading3": "#e0e0e0",
      "heading4": "#d0d0d0",
      "link": "#00ffff",
      "code": "#ffff00",
      "codeBg": "rgba(255, 255, 0, 0.1)",
      "quote": "#ff00ff",
      "quoteBg": "rgba(255, 0, 255, 0.05)",
      "hr": "#404040"
    },
    "unsavedDot": "#ffff00"
  }
}
```

### Eye Care Green Theme

```json
{
  "name": "Eye Care Green",
  "version": "1.0",
  "author": "Open Note",
  "colors": {
    "background": {
      "primary": "#c8e6c9",
      "secondary": "#a5d6a7",
      "tertiary": "#81c784"
    },
    "text": {
      "primary": "#1b5e20",
      "secondary": "#2e7d32",
      "muted": "#388e3c"
    },
    "border": {
      "default": "#66bb6a",
      "focus": "#1b5e20"
    },
    "accent": {
      "primary": "#1b5e20",
      "primaryHover": "#0d3d12",
      "danger": "#b71c1c",
      "dangerHover": "#7f0000",
      "success": "#1b5e20",
      "warning": "#e65100"
    },
    "editor": {
      "background": "#c8e6c9",
      "gutter": "#a5d6a7",
      "cursor": "#1b5e20",
      "selection": "rgba(27, 94, 32, 0.3)",
      "placeholder": "#4caf50"
    },
    "syntax": {
      "heading1": "#0d3d12",
      "heading2": "#1b5e20",
      "heading3": "#2e7d32",
      "heading4": "#388e3c",
      "link": "#0d47a1",
      "code": "#7b1fa2",
      "codeBg": "rgba(123, 31, 162, 0.1)",
      "quote": "#5d4037",
      "quoteBg": "rgba(93, 64, 55, 0.05)",
      "hr": "#66bb6a"
    },
    "unsavedDot": "#1b5e20"
  }
}
```

### Warm Night Theme

```json
{
  "name": "Warm Night",
  "version": "1.0",
  "author": "Open Note",
  "colors": {
    "background": {
      "primary": "#1a1a2e",
      "secondary": "#16213e",
      "tertiary": "#0f3460"
    },
    "text": {
      "primary": "#e8e8e8",
      "secondary": "#c4c4c4",
      "muted": "#9a9a9a"
    },
    "border": {
      "default": "#0f3460",
      "focus": "#e94560"
    },
    "accent": {
      "primary": "#e94560",
      "primaryHover": "#d63354",
      "danger": "#ff6b6b",
      "dangerHover": "#ee5a5a",
      "success": "#4ecca3",
      "warning": "#ffc857"
    },
    "editor": {
      "background": "#16213e",
      "gutter": "#1a1a2e",
      "cursor": "#e94560",
      "selection": "rgba(233, 69, 96, 0.3)",
      "placeholder": "#6b7280"
    },
    "syntax": {
      "heading1": "#ffffff",
      "heading2": "#e8e8e8",
      "heading3": "#c4c4c4",
      "heading4": "#9a9a9a",
      "link": "#4ecca3",
      "code": "#ffc857",
      "codeBg": "rgba(255, 200, 87, 0.15)",
      "quote": "#e94560",
      "quoteBg": "rgba(233, 69, 96, 0.05)",
      "hr": "#0f3460"
    },
    "unsavedDot": "#e94560"
  }
}
```

---

## Import/Export Themes

### Importing a Theme

1. Click Menu → Themes → Import Theme
2. Select a `.json` theme file
3. The theme will be automatically loaded and applied

### Exporting a Theme

1. Select the theme you want to export
2. Click Menu → Themes → Export Current Theme
3. Choose the save location and filename
4. The theme file will be saved in JSON format

### Sharing Themes

Exported theme files can be shared with other users. Simply copy the `.json` file to their themes directory.

---

## Technical Notes

### CSS Variables

Open Note uses CSS variables to implement the theme system. Each theme color is applied to its corresponding CSS variable:

```css
:root {
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --text-primary: #f3f4f6;
  /* ... */
}
```

When switching themes, these variables are dynamically updated, and all components using them will automatically update.

### Tailwind CSS

Theme colors are integrated via Tailwind CSS v4's `@theme` directive and can be used in components:

```html
<div class="bg-bg-primary text-text-primary">
  <!-- content -->
</div>
```

---

## FAQ

### Q: Where do I put theme files?

A: See [Theme File Location](#theme-file-location)

### Q: How do I restore the default theme?

A: Simply select the built-in "Dark" or "Light" theme.

### Q: My custom theme doesn't appear?

A: Please check:
1. Is the JSON file format correct?
2. Is the file in the correct directory?
3. Did you restart the app?

### Q: What color formats are supported?

A: The following formats are supported:
- Hexadecimal: `#ff0000`
- RGB: `rgb(255, 0, 0)`
- RGBA: `rgba(255, 0, 0, 0.5)`
- HSL: `hsl(0, 100%, 50%)`

---

## Version History

- **v1.0** - Initial release with custom theme support
