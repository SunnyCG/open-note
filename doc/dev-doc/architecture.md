# Architecture Overview

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Rust (Tauri v2) |
| Frontend | React 19 + TypeScript |
| Build | Vite 7 |
| Styling | Tailwind CSS v4 |
| Dialogs | tauri-plugin-dialog |

## Directory Structure

```
open-note/
├── src-tauri/           # Rust backend
│   ├── src/
│   │   ├── main.rs      # Entry point
│   │   └── lib.rs       # Tauri commands + AppState
│   └── Cargo.toml
├── src/                 # React frontend
│   ├── components/      # UI components
│   ├── hooks/
│   │   └── useNotes.ts  # Main state management hook
│   ├── lib/
│   │   └── notes.ts     # Tauri API wrapper
│   ├── types/
│   │   └── note.ts      # TypeScript interfaces
│   ├── App.tsx          # Main component
│   └── main.tsx         # Entry point
└── doc/                 # Documentation
```

## Data Flow

```
Frontend                          Backend
────────                          ───────
useNotes() hook ──invoke()──> Tauri Command
     │                               │
     │                          FsResult<T>
     │                               │
     └── response ──────────────────┘
```

## Key Types

### Rust (src-tauri/src/lib.rs)
- `Note` - Full note with content
- `NoteMeta` - Note metadata without content
- `Vault` - Vault information
- `FsResult<T>` - Generic result wrapper
- `AppState` - App-wide state (current vault, recent vaults)

### TypeScript (src/types/note.ts)
- `Note`, `NoteMeta`, `Vault`, `FsResult<T>`

## Tauri Commands

### Vault Management
- `validate_vault`, `create_vault`, `get_vault_info`
- `set_current_vault`, `get_current_vault`
- `list_recent_vaults`, `remove_recent_vault`

### Note Operations
- `list_notes`, `read_note`, `write_note`
- `delete_note`, `rename_note`

## State Management

The `useNotes` hook manages all application state:
- Current vault and recent vaults
- Notes list and current note
- Loading/error states
- All CRUD operations

## File Storage

- Notes stored as `.md` files in vault folders
- Vault = any folder on filesystem
- Default vault: `{app_data_dir}/vault/`
- No database - plain files only
