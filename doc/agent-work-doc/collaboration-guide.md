# Collaboration Guide

Working effectively with Claude Code on this project.

## Communication Tips

### 1. Be Specific About Requirements
- Bad: "add some features"
- Good: "implement wiki-link parsing with [[note-name]] syntax"

### 2. Provide Context When Asking for Changes
- Reference specific files or functions
- Explain the desired behavior
- Mention any constraints or preferences

### 3. Review Before Accepting
- Always review generated code
- Ask for explanations if something is unclear
- Request modifications if the implementation doesn't match expectations

## Workflow Recommendations

### Incremental Development
- Implement one feature at a time
- Test each feature before moving to the next
- Document completed work

### Code Quality
- Ask Claude to explain complex logic
- Request unit tests for critical functions
- Review error handling

### Documentation
- Update `doc/features.md` after completing features
- Update `doc/features-to-implement.md` when planning new work
- Store architecture decisions in `doc/dev-doc/`

## Project-Specific Notes

### Tauri Commands
- Always add new commands to `invoke_handler![]` macro
- Use `FsResult<T>` for consistent error handling
- Commands need `#[tauri::command]` attribute

### Frontend Integration
- Use the `useNotes` hook for note/vault operations
- Follow existing patterns in `src/lib/notes.ts` for new API calls
- Add TypeScript types to `src/types/note.ts`

### Testing Commands
- `cargo check` - Verify Rust compiles
- `npm run build` - Verify frontend builds
- `npm run tauri dev` - Run dev server (requires system dependencies)
