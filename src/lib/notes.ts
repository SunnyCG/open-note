import { invoke } from "@tauri-apps/api/core";
import type { Note, NoteMeta, Vault, FsResult, ParsedLinks, BacklinkInfo, FileTree } from "../types/note";
import type { Theme } from "../types/theme";

// Vault Management
export async function validateVault(path: string): Promise<FsResult<boolean>> {
  return invoke<FsResult<boolean>>("validate_vault", { path });
}

export async function createVault(path: string): Promise<FsResult<Vault>> {
  return invoke<FsResult<Vault>>("create_vault", { path });
}

export async function getVaultInfo(path: string): Promise<FsResult<Vault>> {
  return invoke<FsResult<Vault>>("get_vault_info", { path });
}

export async function setCurrentVault(path: string): Promise<FsResult<Vault>> {
  return invoke<FsResult<Vault>>("set_current_vault", { path });
}

export async function getCurrentVault(): Promise<FsResult<Vault | null>> {
  return invoke<FsResult<Vault | null>>("get_current_vault");
}

export async function listRecentVaults(): Promise<FsResult<Vault[]>> {
  return invoke<FsResult<Vault[]>>("list_recent_vaults");
}

export async function removeRecentVault(path: string): Promise<FsResult<void>> {
  return invoke<FsResult<void>>("remove_recent_vault", { path });
}

// Multi-vault support
export async function getOpenVaults(): Promise<FsResult<Vault[]>> {
  return invoke<FsResult<Vault[]>>("get_open_vaults");
}

export async function addOpenVault(path: string): Promise<FsResult<void>> {
  return invoke<FsResult<void>>("add_open_vault", { path });
}

export async function removeOpenVault(path: string): Promise<FsResult<void>> {
  return invoke<FsResult<void>>("remove_open_vault", { path });
}

export async function getLastNote(vaultPath: string): Promise<FsResult<string | null>> {
  return invoke<FsResult<string | null>>("get_last_note", { vaultPath });
}

export async function setLastNote(vaultPath: string, notePath: string): Promise<FsResult<void>> {
  return invoke<FsResult<void>>("set_last_note", { vaultPath, notePath });
}

// Multi-note support
export async function getOpenNotes(vaultPath: string): Promise<FsResult<string[]>> {
  return invoke<FsResult<string[]>>("get_open_notes", { vaultPath });
}

export async function setOpenNotes(vaultPath: string, notePaths: string[]): Promise<FsResult<void>> {
  return invoke<FsResult<void>>("set_open_notes", { vaultPath, notePaths });
}

export async function addOpenNote(vaultPath: string, notePath: string): Promise<FsResult<void>> {
  return invoke<FsResult<void>>("add_open_note", { vaultPath, notePath });
}

export async function removeOpenNote(vaultPath: string, notePath: string): Promise<FsResult<void>> {
  return invoke<FsResult<void>>("remove_open_note", { vaultPath, notePath });
}

export async function getActiveNote(vaultPath: string): Promise<FsResult<string | null>> {
  return invoke<FsResult<string | null>>("get_active_note", { vaultPath });
}

export async function setActiveNote(vaultPath: string, notePath: string): Promise<FsResult<void>> {
  return invoke<FsResult<void>>("set_active_note", { vaultPath, notePath });
}

// Directory persistence
export async function getLastOpenDirectory(): Promise<FsResult<string | null>> {
  return invoke<FsResult<string | null>>("get_last_open_directory");
}

export async function setLastOpenDirectory(path: string): Promise<FsResult<void>> {
  return invoke<FsResult<void>>("set_last_open_directory", { path });
}

// Legacy/Compat
export async function getVaultPath(): Promise<FsResult<string>> {
  return invoke<FsResult<string>>("get_vault_path");
}

export async function initVault(): Promise<FsResult<string>> {
  return invoke<FsResult<string>>("init_vault");
}

// Note Operations
export async function listNotes(vaultPath: string): Promise<FsResult<NoteMeta[]>> {
  return invoke<FsResult<NoteMeta[]>>("list_notes", { vaultPath });
}

// File Tree (folder support)
export async function listFileTree(vaultPath: string): Promise<FsResult<FileTree>> {
  return invoke<FsResult<FileTree>>("list_file_tree", { vaultPath });
}

export async function createFolder(
  vaultPath: string,
  folderPath: string
): Promise<FsResult<string>> {
  return invoke<FsResult<string>>("create_folder", { vaultPath, folderPath });
}

export async function readNote(path: string): Promise<FsResult<Note>> {
  return invoke<FsResult<Note>>("read_note", { path });
}

export async function writeNote(
  vaultPath: string,
  name: string,
  content: string,
  folder?: string
): Promise<FsResult<Note>> {
  return invoke<FsResult<Note>>("write_note", { vaultPath, name, content, folder });
}

export async function deleteNote(path: string): Promise<FsResult<void>> {
  return invoke<FsResult<void>>("delete_note", { path });
}

export async function renameNote(
  path: string,
  newName: string
): Promise<FsResult<Note>> {
  return invoke<FsResult<Note>>("rename_note", { path, newName });
}

// Wiki Links
export async function parseLinks(content: string): Promise<ParsedLinks> {
  return invoke<ParsedLinks>("parse_links", { content });
}

export async function getBacklinks(
  vaultPath: string,
  noteName: string
): Promise<FsResult<BacklinkInfo[]>> {
  return invoke<FsResult<BacklinkInfo[]>>("get_backlinks", { vaultPath, noteName });
}

export async function resolveWikiLink(
  vaultPath: string,
  target: string
): Promise<FsResult<string | null>> {
  return invoke<FsResult<string | null>>("resolve_wiki_link", { vaultPath, target });
}

// Theme Management
export async function listCustomThemes(): Promise<FsResult<Theme[]>> {
  return invoke<FsResult<Theme[]>>("list_custom_themes");
}

export async function importTheme(filePath: string): Promise<FsResult<Theme>> {
  return invoke<FsResult<Theme>>("import_theme", { filePath });
}

export async function exportTheme(theme: Theme, filePath: string): Promise<FsResult<void>> {
  return invoke<FsResult<void>>("export_theme", { theme, filePath });
}

export async function deleteCustomTheme(themeName: string): Promise<FsResult<void>> {
  return invoke<FsResult<void>>("delete_custom_theme", { themeName });
}
