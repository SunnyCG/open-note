import { useState, useCallback, useEffect } from "react";
import type { FileTreeNode, FileTree } from "../types/note";

interface NoteTreeProps {
  tree: FileTree | null;
  activeNotePath: string | null;
  onSelectNote: (path: string) => void;
  onDeleteNote: (path: string, name: string) => void;
  onCreateNote: (folderPath?: string) => void;
  onCreateFolder: (parentPath?: string) => void;
  isLoading: boolean;
}

// Storage key for expanded folders
const EXPANDED_FOLDERS_KEY = "open-note-expanded-folders";

function getStoredExpandedFolders(vaultPath: string): Set<string> {
  try {
    const stored = localStorage.getItem(`${EXPANDED_FOLDERS_KEY}-${vaultPath}`);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

function saveExpandedFolders(vaultPath: string, folders: Set<string>) {
  localStorage.setItem(
    `${EXPANDED_FOLDERS_KEY}-${vaultPath}`,
    JSON.stringify([...folders])
  );
}

export function NoteTree({
  tree,
  activeNotePath,
  onSelectNote,
  onDeleteNote,
  onCreateNote,
  onCreateFolder,
  isLoading,
}: NoteTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Load expanded folders from localStorage when tree changes
  useEffect(() => {
    if (tree?.vault_path) {
      setExpandedFolders(getStoredExpandedFolders(tree.vault_path));
    }
  }, [tree?.vault_path]);

  const toggleFolder = useCallback(
    (folderPath: string) => {
      setExpandedFolders((prev) => {
        const next = new Set(prev);
        if (next.has(folderPath)) {
          next.delete(folderPath);
        } else {
          next.add(folderPath);
        }
        if (tree?.vault_path) {
          saveExpandedFolders(tree.vault_path, next);
        }
        return next;
      });
    },
    [tree?.vault_path]
  );

  const renderNode = (node: FileTreeNode, depth: number = 0): React.ReactNode => {
    const paddingLeft = 12 + depth * 16;

    if (node.type === "folder") {
      const isExpanded = expandedFolders.has(node.path);

      return (
        <li key={node.path}>
          <div
            className="group flex items-center gap-1 px-2 py-1.5 rounded cursor-pointer hover:bg-bg-tertiary transition-colors"
            style={{ paddingLeft }}
            onClick={() => toggleFolder(node.path)}
          >
            {/* Expand/Collapse Chevron */}
            <svg
              className={`w-4 h-4 text-text-muted transition-transform flex-shrink-0 ${
                isExpanded ? "rotate-90" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>

            {/* Folder Icon */}
            <svg
              className={`w-4 h-4 flex-shrink-0 ${
                isExpanded ? "text-accent-primary" : "text-text-muted"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isExpanded
                    ? "M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2"
                    : "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                }
              />
            </svg>

            <span className="flex-1 truncate text-sm">{node.name}</span>

            {/* Add note to folder button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreateNote(node.path);
              }}
              className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-bg-primary rounded transition-all"
              title="Add note to folder"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>

            {/* Add subfolder button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreateFolder(node.path);
              }}
              className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-bg-primary rounded transition-all"
              title="Create subfolder"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
              </svg>
            </button>
          </div>

          {/* Children (notes and subfolders) */}
          {isExpanded && node.children.length > 0 && (
            <ul className="space-y-0.5">
              {node.children.map((child) => renderNode(child, depth + 1))}
            </ul>
          )}
        </li>
      );
    } else {
      // Note node
      const isActive = activeNotePath === node.path;

      return (
        <li key={node.path}>
          <div
            className={`group flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition-colors ${
              isActive ? "bg-accent-primary text-white" : "hover:bg-bg-tertiary"
            }`}
            style={{ paddingLeft: paddingLeft + 20 }} // Extra indent for notes
            onClick={() => onSelectNote(node.path)}
          >
            {/* Note Icon */}
            <svg
              className={`w-4 h-4 mr-2 flex-shrink-0 ${
                isActive ? "text-blue-200" : "text-text-muted"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>

            <div className="flex-1 min-w-0">
              <div className="truncate text-sm">{node.name}</div>
            </div>

            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteNote(node.path, node.name);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent-danger rounded transition-all ml-2"
              title="Delete"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </li>
      );
    }
  };

  if (isLoading && !tree) {
    return <div className="text-text-muted text-sm p-3">Loading...</div>;
  }

  if (!tree || tree.root.length === 0) {
    return (
      <div className="text-text-muted text-sm p-3">No notes yet. Create one!</div>
    );
  }

  return (
    <ul className="space-y-0.5">
      {/* Root-level notes first (not in folders) */}
      {tree.root
        .filter((node) => node.type === "note")
        .map((node) => renderNode(node))}

      {/* Then folders */}
      {tree.root
        .filter((node) => node.type === "folder")
        .map((node) => renderNode(node))}
    </ul>
  );
}
