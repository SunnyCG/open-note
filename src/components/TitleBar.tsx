import { useState, useRef, useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import type { OpenNoteTab } from "../types/note";
import type { BuiltInThemeId } from "../types/theme";

export type RightSidebarContent = "outline" | "tags" | null;

interface TitleBarProps {
  // Section 1 - Left
  isLeftCollapsed: boolean;
  onToggleLeft: () => void;
  onOpenAbout: () => void;

  // Section 2 - Note Tabs
  openNotes: OpenNoteTab[];
  activeNotePath: string | null;
  onTabClick: (path: string) => void;
  onTabClose: (path: string) => void;

  // Section 3 - Right
  isRightCollapsed: boolean;
  onToggleRight: () => void;
  rightSidebarContent: RightSidebarContent;
  onShowOutline: () => void;
  onShowTags: () => void;

  // Theme
  currentThemeId: string;
  onThemeChange: (themeId: BuiltInThemeId) => void;
}

export function TitleBar({
  isLeftCollapsed,
  onToggleLeft,
  onOpenAbout,
  openNotes,
  activeNotePath,
  onTabClick,
  onTabClose,
  isRightCollapsed,
  onToggleRight,
  rightSidebarContent,
  onShowOutline,
  onShowTags,
  currentThemeId,
  onThemeChange,
}: TitleBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Window controls
  const handleMinimize = async () => {
    try {
      await getCurrentWindow().minimize();
    } catch (err) {
      console.error("Failed to minimize:", err);
    }
  };

  const handleMaximize = async () => {
    try {
      const win = getCurrentWindow();
      if (await win.isMaximized()) {
        await win.unmaximize();
      } else {
        await win.maximize();
      }
    } catch (err) {
      console.error("Failed to maximize/unmaximize:", err);
    }
  };

  const handleClose = async () => {
    try {
      await getCurrentWindow().close();
    } catch (err) {
      console.error("Failed to close:", err);
    }
  };

  return (
    <div
      className="flex items-center h-10 bg-bg-secondary border-b border-border-default select-none"
      data-tauri-drag-region
    >
      {/* Section 1 - Left (312px when expanded, auto when collapsed) */}
      <div
        className={`flex items-center h-full border-r border-border-default ${
          isLeftCollapsed ? "w-auto" : "w-[312px]"
        }`}
      >
        {/* Main Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center justify-center w-10 h-10 hover:bg-bg-tertiary transition-colors"
            title="Main Menu"
          >
            <svg
              className="w-5 h-5 text-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-bg-secondary border border-border-default rounded-lg shadow-lg z-50 overflow-hidden">
              {/* About */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenAbout();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-bg-tertiary transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                About
              </button>

              {/* Divider */}
              <div className="border-t border-border-default my-1" />

              {/* Theme Section */}
              <div className="px-4 py-1 text-xs text-text-muted uppercase tracking-wide">
                Theme
              </div>
              <button
                onClick={() => {
                  onThemeChange("dark");
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                  currentThemeId === "dark"
                    ? "bg-accent-primary text-white"
                    : "text-text-secondary hover:bg-bg-tertiary"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
                Dark
                {currentThemeId === "dark" && (
                  <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => {
                  onThemeChange("light");
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                  currentThemeId === "light"
                    ? "bg-accent-primary text-white"
                    : "text-text-secondary hover:bg-bg-tertiary"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                Light
                {currentThemeId === "light" && (
                  <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Collapse Left Sidebar */}
        <button
          onClick={onToggleLeft}
          className="flex items-center justify-center w-10 h-10 hover:bg-bg-tertiary transition-colors"
          title={isLeftCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isLeftCollapsed ? (
            <svg
              className="w-4 h-4 text-text-muted"
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
          ) : (
            <svg
              className="w-4 h-4 text-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Section 2 - Note Tabs (flex-1) */}
      <div
        className="flex items-center flex-1 h-full overflow-hidden"
        data-tauri-drag-region
      >
        <div
          ref={tabsContainerRef}
          className="flex items-center flex-1 h-full overflow-x-auto scrollbar-thin scrollbar-thumb-bg-tertiary scrollbar-track-transparent"
        >
          {openNotes.map((note) => (
            <div
              key={note.path}
              className={`group relative flex items-center justify-center h-8 px-3 border-r border-border-default cursor-pointer transition-colors min-w-[100px] max-w-[200px] ${
                activeNotePath === note.path
                  ? "bg-bg-primary text-text-primary"
                  : "bg-bg-secondary text-text-muted hover:bg-bg-tertiary"
              }`}
              onClick={() => onTabClick(note.path)}
            >
              {/* Close button - top right corner */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(note.path);
                }}
                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 p-0.5 hover:bg-bg-tertiary rounded-bl transition-all"
                title="Close"
              >
                <svg
                  className="w-3 h-3"
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

              {/* Tab content - centered */}
              <div className="flex items-center gap-1">
                {/* Unsaved indicator */}
                {note.hasUnsavedChanges && (
                  <div className="w-2 h-2 rounded-full bg-unsaved-dot flex-shrink-0" />
                )}

                {/* Tab name */}
                <span className="truncate text-sm">{note.name}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Collapse Right Sidebar (toggles Section 3 icons visibility) */}
        <button
          onClick={onToggleRight}
          className="flex items-center justify-center w-10 h-10 hover:bg-bg-tertiary transition-colors border-l border-border-default"
          title={isRightCollapsed ? "Show right panel icons" : "Hide right panel icons"}
        >
          {!isRightCollapsed ? (
            <svg
              className="w-4 h-4 text-text-muted"
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
          ) : (
            <svg
              className="w-4 h-4 text-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Section 3 - Right icons & Window controls (hidden when isRightCollapsed) */}
      <div className="flex items-center h-full">
        {/* Outline and Tag icons - only visible when right is NOT collapsed */}
        {!isRightCollapsed && (
          <>
            {/* Outline toggle - switches content to outline */}
            <button
              onClick={onShowOutline}
              className={`flex items-center justify-center w-10 h-10 hover:bg-bg-tertiary transition-colors ${
                rightSidebarContent === "outline" ? "text-accent-primary" : "text-text-muted"
              }`}
              title="Show Outline"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </button>

            {/* Tag icon - switches content to tags (placeholder for future) */}
            <button
              onClick={onShowTags}
              className={`flex items-center justify-center w-10 h-10 hover:bg-bg-tertiary transition-colors ${
                rightSidebarContent === "tags" ? "text-accent-primary" : "text-text-muted"
              }`}
              title="Tags (coming soon)"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </button>
          </>
        )}

        {/* Window controls */}
        <div className="flex items-center h-full">
          <button
            onClick={handleMinimize}
            className="flex items-center justify-center w-12 h-10 hover:bg-bg-tertiary transition-colors"
            title="Minimize"
          >
            <svg
              className="w-4 h-4 text-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 12H4"
              />
            </svg>
          </button>

          <button
            onClick={handleMaximize}
            className="flex items-center justify-center w-12 h-10 hover:bg-bg-tertiary transition-colors"
            title="Maximize"
          >
            <svg
              className="w-4 h-4 text-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth={2} />
            </svg>
          </button>

          <button
            onClick={handleClose}
            className="flex items-center justify-center w-12 h-10 hover:bg-accent-danger transition-colors"
            title="Close"
          >
            <svg
              className="w-4 h-4 text-text-muted"
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
      </div>
    </div>
  );
}
