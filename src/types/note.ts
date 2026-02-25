export interface Note {
  name: string;
  path: string;
  content: string;
  modified: number;
}

export interface NoteMeta {
  name: string;
  path: string;
  modified: number;
}

export interface Vault {
  name: string;
  path: string;
  note_count: number;
  last_opened: number;
}

export interface FsResult<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

// Wiki Link types
export interface WikiLink {
  target: string;
  heading: string | null;
  display_text: string | null;
  start: number;
  end: number;
  raw: string;
}

export interface ParsedLinks {
  links: WikiLink[];
  referenced_notes: string[];
}

export interface BacklinkInfo {
  source_path: string;
  source_name: string;
  links: WikiLink[];
}

// Outline panel types
export interface HeadingInfo {
  level: number;
  text: string;
  line: number;
  charOffset: number;
}

// Tab types
export interface OpenNoteTab {
  path: string;
  name: string;
  hasUnsavedChanges: boolean;
}

// File tree types for folder support
export type FileTreeNode =
  | { type: 'folder'; name: string; path: string; modified: number; children: FileTreeNode[] }
  | { type: 'note'; name: string; path: string; relative_path: string; modified: number };

export interface FileTree {
  vault_path: string;
  root: FileTreeNode[];
  total_notes: number;
  total_folders: number;
}
