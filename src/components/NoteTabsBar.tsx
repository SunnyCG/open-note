import { useMemo } from "react";
import type { Note } from "../types/note";

interface NoteTabsBarProps {
  openNotes: Note[];
  activeNotePath: string | null;
  unsavedNotePaths: Set<string>;
  onTabClick: (path: string) => void;
  onTabClose: (path: string) => void;
}

export function NoteTabsBar({
  openNotes,
  activeNotePath,
  unsavedNotePaths,
  onTabClick,
  onTabClose,
}: NoteTabsBarProps) {
  // Get display name from note path
  const getTabName = useMemo(() => {
    return (note: Note) => note.name;
  }, []);

  if (openNotes.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center bg-gray-800 border-b border-gray-700 overflow-x-auto">
      {openNotes.map((note) => {
        const isActive = note.path === activeNotePath;
        const hasChanges = unsavedNotePaths.has(note.path);

        return (
          <div
            key={note.path}
            className={`group flex items-center gap-1 px-3 py-2 border-r border-gray-700 cursor-pointer min-w-0 max-w-[200px] ${
              isActive
                ? "bg-gray-900 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
            }`}
            onClick={() => onTabClick(note.path)}
          >
            {/* Modified indicator */}
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                hasChanges ? "bg-blue-400" : "bg-transparent"
              }`}
            />
            {/* Tab name */}
            <span className="truncate text-sm">{getTabName(note)}</span>
            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(note.path);
              }}
              className={`ml-1 p-0.5 rounded hover:bg-gray-600 flex-shrink-0 ${
                isActive
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
              title="Close tab"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
