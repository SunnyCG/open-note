import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { open, confirm } from "@tauri-apps/plugin-dialog";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useNotes } from "./hooks/useNotes";
import { useWikiLinks } from "./hooks/useWikiLinks";
import { useAutoSave } from "./hooks/useAutoSave";
import { useTheme } from "./contexts/ThemeContext";
import { MarkdownEditor } from "./components/MarkdownEditor";
import { MarkdownPreview } from "./components/MarkdownPreview";
import { BacklinksPanel } from "./components/BacklinksPanel";
import { OutgoingLinksPanel } from "./components/OutgoingLinksPanel";
import { SaveStatusIndicator } from "./components/SaveStatusIndicator";
import { VaultSidebar } from "./components/VaultSidebar";
import { OutlinePanel } from "./components/OutlinePanel";
import { RenameNoteModal } from "./components/RenameNoteModal";
import { NoteTree } from "./components/NoteTree";
import { TitleBar, RightSidebarContent } from "./components/TitleBar";
import { AboutModal } from "./components/AboutModal";
import * as notesApi from "./lib/notes";
import type { WikiLink, OpenNoteTab } from "./types/note";

function App() {
  const {
    currentVault,
    openVaults,
    recentVaults,
    openVault,
    switchToVault,
    closeVault,
    createNewVault,
    removeVaultFromRecent,
    fileTree,
    currentNote,
    openNotes,
    activeNotePath,
    isLoading,
    error,
    openNoteInTab,
    closeTab,
    switchTab,
    saveNote,
    createNote,
    createFolder,
    deleteNote,
    renameNote,
    setError,
  } = useNotes();

  // Theme
  const { currentThemeId, setTheme } = useTheme();

  // Track unsaved edits locally - simple per-note tracking
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newNoteName, setNewNoteName] = useState("");
  const [newNoteFolder, setNewNoteFolder] = useState<string | undefined>(undefined);
  const [newFolderParent, setNewFolderParent] = useState<string | undefined>(undefined);
  const [newFolderName, setNewFolderName] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const editorRef = useRef<{ scrollToLine: (line: number) => void } | null>(null);

  // Sidebar collapse state
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(true);
  const [rightSidebarContent, setRightSidebarContent] = useState<RightSidebarContent>("outline"); // default to outline
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // Toggle right sidebar - when expanded, show outline by default
  const handleToggleRightSidebar = useCallback(() => {
    setIsRightSidebarCollapsed(prev => {
      if (prev) {
        // Expanding: show outline by default
        setRightSidebarContent("outline");
      }
      return !prev;
    });
  }, []);

  // Right sidebar content handlers - placeholder for future features
  const handleShowOutline = useCallback(() => {
    // TODO: implement outline view switching
  }, []);

  const handleShowTags = useCallback(() => {
    // TODO: implement tags view
  }, []);

  // Track the original content when note is loaded (for detecting changes)
  const [originalContent, setOriginalContent] = useState("");
  const [originalTitle, setOriginalTitle] = useState("");

  // Compute hasUnsavedChanges for current note - simple comparison
  const hasUnsavedChanges = useMemo(() => {
    if (!currentNote) return false;
    return editContent !== originalContent || editTitle !== originalTitle;
  }, [currentNote, editContent, editTitle, originalContent, originalTitle]);

  // Track unsaved notes set for tabs (simplified - just track current note)
  const unsavedNotePaths = useMemo(() => {
    const paths = new Set<string>();
    if (currentNote && hasUnsavedChanges) {
      paths.add(currentNote.path);
    }
    return paths;
  }, [currentNote, hasUnsavedChanges]);

  // Derived tabs for TitleBar
  const openNoteTabs = useMemo((): OpenNoteTab[] => {
    return openNotes.map((note) => ({
      path: note.path,
      name: note.name,
      hasUnsavedChanges: unsavedNotePaths.has(note.path),
    }));
  }, [openNotes, unsavedNotePaths]);

  // Wiki links hook
  const {
    outgoingLinks,
    referencedNotes,
    backlinks,
    isLoading: isLoadingLinks,
    navigateToLink,
  } = useWikiLinks(
    currentVault?.path || null,
    currentNote?.name || null,
    editContent,
    {
      onOpenNote: (notePath: string) => {
        openNoteInTab(notePath);
      },
      onCreateNote: (noteName: string) => {
        createNote(noteName);
      },
    }
  );

  // Auto-save hook
  const { saveStatus, saveNow, cancelPendingSave } = useAutoSave(
    editTitle,
    editContent,
    hasUnsavedChanges,
    {
      onSave: async (name, content) => {
        const success = await saveNote(name, content);
        if (success) {
          // After save, update original content to match current
          setOriginalContent(content);
          setOriginalTitle(name);
        }
        return success;
      },
      debounceMs: 1000,
      enabled: !!currentNote,
    }
  );

  // Handle wiki link click - auto-save before navigating
  const handleWikiLinkClick = useCallback(
    async (link: WikiLink) => {
      if (hasUnsavedChanges) {
        await saveNow();
      }
      navigateToLink(link);
    },
    [hasUnsavedChanges, saveNow, navigateToLink]
  );

  // Sync editor state with current note - simplified, no more unsavedEdits map
  useEffect(() => {
    if (currentNote) {
      setEditContent(currentNote.content);
      setEditTitle(currentNote.name);
      // Set original content for change detection
      setOriginalContent(currentNote.content);
      setOriginalTitle(currentNote.name);
    } else {
      setEditContent("");
      setEditTitle("");
      setOriginalContent("");
      setOriginalTitle("");
    }
    // Cancel any pending auto-save when switching notes
    cancelPendingSave();
  }, [currentNote?.path, cancelPendingSave]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl+S for save
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (hasUnsavedChanges) {
          saveNow();
        }
      }
      // F2 for rename
      if (e.key === "F2" && currentNote) {
        e.preventDefault();
        setIsRenameModalOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasUnsavedChanges, saveNow, currentNote]);

  // Track if we're handling close to prevent double handling
  const isClosingRef = useRef(false);

  // Handle app close - save before closing
  useEffect(() => {
    const mainWindow = getCurrentWindow();
    let unlisten: (() => void) | null = null;

    const setupCloseHandler = async () => {
      unlisten = await mainWindow.onCloseRequested(async (event) => {
        // Prevent double handling
        if (isClosingRef.current) {
          return;
        }

        // If there are unsaved changes, save them before closing
        if (hasUnsavedChanges && !isClosingRef.current) {
          // Prevent the window from closing immediately
          event.preventDefault();
          isClosingRef.current = true;

          try {
            // Save the current note
            await saveNow();
          } catch (error) {
            console.error("Failed to save before close:", error);
          }

          // Now destroy the window
          try {
            await mainWindow.destroy();
          } catch (error) {
            console.error("Failed to destroy window:", error);
          }
        }
        // If no unsaved changes, let the window close normally
      });
    };

    setupCloseHandler();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [hasUnsavedChanges, saveNow]);


  const handleCreateNote = async () => {
    if (!newNoteName.trim()) return;
    const success = await createNote(newNoteName.trim(), newNoteFolder);
    if (success) {
      setIsNewNoteModalOpen(false);
      setNewNoteName("");
      setNewNoteFolder(undefined);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    // Build full folder path (parent + folder name)
    const fullPath = newFolderParent
      ? `${newFolderParent}/${newFolderName.trim()}`
      : newFolderName.trim();
    const success = await createFolder(fullPath);
    if (success) {
      setIsNewFolderModalOpen(false);
      setNewFolderName("");
      setNewFolderParent(undefined);
    }
  };

  const handleDeleteNote = async (notePath: string, noteName: string) => {
    const shouldDelete = await confirm(`Delete "${noteName}"? This cannot be undone.`, {
      title: "Delete Note",
      okLabel: "Delete",
      cancelLabel: "Cancel",
      kind: "warning",
    });
    if (shouldDelete) {
      await deleteNote(notePath);
    }
  };

  const handleSelectNote = async (notePath: string) => {
    if (hasUnsavedChanges && currentNote) {
      await saveNow();
    }
    await openNoteInTab(notePath);
  };

  const handleRename = async (newName: string) => {
    if (currentNote) {
      await renameNote(currentNote.path, newName);
    }
  };

  const handleOpenVault = async () => {
    // Get last opened directory
    const lastDirResult = await notesApi.getLastOpenDirectory();
    const defaultPath = lastDirResult.success && lastDirResult.data ? lastDirResult.data : undefined;

    const selected = await open({
      directory: true,
      multiple: false,
      title: "Open Vault",
      defaultPath: defaultPath,
    });

    if (selected) {
      const path = selected as string;
      // Save the parent directory as last opened directory
      // For Unix-like systems and Windows, we need to handle path separators differently
      const lastSlash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
      const parentDir = path.substring(0, lastSlash);
      if (parentDir) {
        await notesApi.setLastOpenDirectory(parentDir);
      }

      await openVault(path);
      setIsVaultModalOpen(false);
    }
  };

  const handleCreateVault = async () => {
    // Get last opened directory
    const lastDirResult = await notesApi.getLastOpenDirectory();
    const defaultPath = lastDirResult.success && lastDirResult.data ? lastDirResult.data : undefined;

    const selected = await open({
      directory: true,
      multiple: false,
      title: "Create New Vault",
      defaultPath: defaultPath,
    });

    if (selected) {
      const vaultName = prompt("Enter vault name:");
      if (vaultName) {
        const path = selected as string;
        const vaultPath = `${path}/${vaultName}`;
        const success = await createNewVault(vaultPath);
        if (success) {
          // Save the selected directory as last opened directory
          await notesApi.setLastOpenDirectory(path);
          setIsVaultModalOpen(false);
        }
      }
    }
  };

  const handleSelectRecentVault = async (path: string) => {
    if (hasUnsavedChanges && currentNote) {
      await saveNow();
    }
    await openVault(path);
    setIsVaultModalOpen(false);
  };

  const handleRemoveRecentVault = async (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const shouldRemove = await confirm("Remove this vault from recent list?", {
      title: "Remove Vault",
      okLabel: "Remove",
      cancelLabel: "Cancel",
    });
    if (shouldRemove) {
      await removeVaultFromRecent(path);
    }
  };

  // Handle heading click for outline panel
  const handleHeadingClick = useCallback((line: number) => {
    if (editorRef.current?.scrollToLine) {
      editorRef.current.scrollToLine(line);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-bg-primary text-text-primary">
      {/* Custom Title Bar */}
      <TitleBar
        isLeftCollapsed={isLeftSidebarCollapsed}
        onToggleLeft={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        openNotes={openNoteTabs}
        activeNotePath={activeNotePath}
        onTabClick={switchTab}
        onTabClose={closeTab}
        isRightCollapsed={isRightSidebarCollapsed}
        onToggleRight={handleToggleRightSidebar}
        rightSidebarContent={rightSidebarContent}
        onShowOutline={handleShowOutline}
        onShowTags={handleShowTags}
        currentThemeId={currentThemeId}
        onThemeChange={setTheme}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebars (Vault + Notes) */}
        {!isLeftSidebarCollapsed && (
          <>
            {/* Vault Sidebar */}
            <VaultSidebar
              openVaults={openVaults}
              recentVaults={recentVaults}
              currentVault={currentVault}
              onVaultClick={async (path: string) => {
                if (hasUnsavedChanges && currentNote) {
                  await saveNow();
                }
                await switchToVault(path);
              }}
              onVaultClose={closeVault}
            />

            {/* Notes List Sidebar */}
            <aside className="w-64 bg-bg-secondary border-r border-border-default flex flex-col">
              {/* Vault Header */}
              <div className="p-4 border-b border-border-default">
                <button
                  onClick={() => setIsVaultModalOpen(true)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-bg-tertiary transition-colors"
                >
                  <div className="flex items-center gap-2">
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
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                      />
                    </svg>
                    <div className="text-left">
                      <div className="text-sm font-medium text-text-primary truncate max-w-[140px]">
                        {currentVault?.name || "No Vault"}
                      </div>
                      <div className="text-xs text-text-muted">
                        {currentVault?.note_count || 0} notes
                      </div>
                    </div>
                  </div>
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>

              {/* Notes List */}
              <nav className="flex-1 p-2 overflow-y-auto">
                <div className="flex items-center justify-between px-2 py-1">
                  <div className="text-xs text-text-muted uppercase tracking-wide">
                    Notes ({fileTree?.total_notes || 0})
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setNewNoteFolder(undefined);
                        setIsNewNoteModalOpen(true);
                      }}
                      className="p-1 hover:bg-bg-tertiary rounded transition-colors"
                      title="New Note"
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setNewFolderParent(undefined);
                        setIsNewFolderModalOpen(true);
                      }}
                      className="p-1 hover:bg-bg-tertiary rounded transition-colors"
                      title="New Folder"
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
                          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <NoteTree
                  tree={fileTree}
                  activeNotePath={activeNotePath}
                  onSelectNote={handleSelectNote}
                  onDeleteNote={handleDeleteNote}
                  onCreateNote={(folderPath) => {
                    setNewNoteFolder(folderPath);
                    setIsNewNoteModalOpen(true);
                  }}
                  onCreateFolder={(parentPath) => {
                    setNewFolderParent(parentPath);
                    setIsNewFolderModalOpen(true);
                  }}
                  isLoading={isLoading}
                />
              </nav>

              {/* Outgoing Links Panel */}
              {currentNote && (
                <OutgoingLinksPanel
                  links={outgoingLinks}
                  referencedNotes={referencedNotes}
                  onLinkClick={handleWikiLinkClick}
                />
              )}
            </aside>
          </>
        )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Error Display */}
        {error && (
          <div className="bg-red-600 text-white px-4 py-2 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="hover:bg-red-700 px-2 py-1 rounded"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Editor Area */}
        {currentNote ? (
          <div className="flex-1 flex min-h-0">
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
              {/* Toolbar - Simplified */}
              <div className="flex items-center gap-2 mb-4">
                {/* Preview Toggle */}
                <button
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className={`p-2 rounded-lg transition-colors ${
                    isPreviewMode
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-bg-tertiary hover:bg-bg-primary text-text-secondary"
                  }`}
                  title={isPreviewMode ? "Switch to Edit" : "Switch to Preview"}
                >
                  {isPreviewMode ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>

                {/* Status indicators */}
                <div className="flex-1" />
                <span className="text-xs text-text-muted">
                  {editContent.length} chars | {editContent.split(/\s+/).filter(Boolean).length} words
                </span>
                <SaveStatusIndicator
                  saveStatus={saveStatus}
                  hasUnsavedChanges={hasUnsavedChanges}
                />
              </div>

              {/* Editor/Preview */}
              <div className="flex-1 min-h-0">
                {isPreviewMode ? (
                  <MarkdownPreview
                    content={editContent}
                    onWikiLinkClick={(target, heading) => {
                      // Create a WikiLink object and navigate
                      const link: WikiLink = {
                        target,
                        heading: heading || null,
                        display_text: null,
                        start: 0,
                        end: 0,
                        raw: `[[${target}${heading ? `#${heading}` : ""}]]`,
                      };
                      handleWikiLinkClick(link);
                    }}
                  />
                ) : (
                  <MarkdownEditor
                    ref={editorRef}
                    content={editContent}
                    onChange={setEditContent}
                    onWikiLinkClick={(target, heading) => {
                      // Create a WikiLink object and navigate
                      const link: WikiLink = {
                        target,
                        heading: heading || null,
                        display_text: null,
                        start: 0,
                        end: 0,
                        raw: `[[${target}${heading ? `#${heading}` : ""}]]`,
                      };
                      handleWikiLinkClick(link);
                    }}
                    onSave={saveNow}
                    placeholder="Start writing... Use [[note-name]] to link to other notes."
                  />
                )}
              </div>

              {/* Backlinks Panel */}
              <BacklinksPanel
                backlinks={backlinks}
                isLoading={isLoadingLinks}
                onNoteClick={handleSelectNote}
              />
            </div>

            {/* Outline Panel - show when right sidebar is expanded */}
            {!isRightSidebarCollapsed && (
              <OutlinePanel
                content={editContent}
                onHeadingClick={handleHeadingClick}
              />
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-muted">
            <div className="text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-lg">Select a note or create a new one</p>
              <button
                onClick={() => setIsNewNoteModalOpen(true)}
                className="mt-4 px-4 py-2 bg-accent-primary hover:bg-accent-primary-hover rounded-lg transition-colors text-white"
              >
                Create Note
              </button>
            </div>
          </div>
        )}
      </main>
      </div>

      {/* New Note Modal */}
      {isNewNoteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-secondary rounded-lg p-6 w-96 border border-border-default">
            <h2 className="text-lg font-semibold mb-4 text-text-primary">Create New Note</h2>
            <input
              type="text"
              value={newNoteName}
              onChange={(e) => setNewNoteName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateNote()}
              className="w-full bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 outline-none focus:border-border-focus text-text-primary mb-4"
              placeholder="Note name..."
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsNewNoteModalOpen(false);
                  setNewNoteName("");
                }}
                className="px-4 py-2 hover:bg-bg-tertiary rounded-lg transition-colors text-text-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNote}
                disabled={!newNoteName.trim()}
                className="px-4 py-2 bg-accent-primary hover:bg-accent-primary-hover disabled:bg-bg-tertiary disabled:text-text-muted rounded-lg transition-colors text-white"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vault Modal */}
      {isVaultModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-secondary rounded-lg p-6 w-[480px] border border-border-default">
            <h2 className="text-lg font-semibold mb-4 text-text-primary">Vault Management</h2>

            {/* Action Buttons */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={handleOpenVault}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-bg-tertiary hover:bg-bg-primary rounded-lg transition-colors text-text-secondary"
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
                    d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2"
                  />
                </svg>
                Open Folder
              </button>
              <button
                onClick={handleCreateVault}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-accent-primary hover:bg-accent-primary-hover rounded-lg transition-colors text-white"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Vault
              </button>
            </div>

            {/* Recent Vaults */}
            <div>
              <div className="text-sm text-text-muted mb-2">Recent Vaults</div>
              {recentVaults.length === 0 ? (
                <div className="text-text-muted text-sm p-3 bg-bg-tertiary/50 rounded-lg">
                  No recent vaults
                </div>
              ) : (
                <ul className="space-y-1 max-h-64 overflow-y-auto">
                  {recentVaults.map((vault) => (
                    <li key={vault.path}>
                      <div
                        className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                          currentVault?.path === vault.path
                            ? "bg-accent-primary text-white"
                            : "bg-bg-tertiary hover:bg-bg-primary"
                        }`}
                        onClick={() => handleSelectRecentVault(vault.path)}
                      >
                        <div className="flex items-center gap-3">
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
                              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                            />
                          </svg>
                          <div>
                            <div className="font-medium">{vault.name}</div>
                            <div
                              className={`text-xs ${
                                currentVault?.path === vault.path
                                  ? "text-blue-200"
                                  : "text-text-muted"
                              }`}
                            >
                              {vault.note_count} notes
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleRemoveRecentVault(vault.path, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent-danger rounded transition-all"
                          title="Remove from list"
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Close Button */}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsVaultModalOpen(false)}
                className="px-4 py-2 hover:bg-bg-tertiary rounded-lg transition-colors text-text-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      <RenameNoteModal
        isOpen={isRenameModalOpen}
        currentName={currentNote?.name || ""}
        onRename={handleRename}
        onClose={() => setIsRenameModalOpen(false)}
      />

      {/* New Folder Modal */}
      {isNewFolderModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-secondary rounded-lg p-6 w-96 border border-border-default">
            <h2 className="text-lg font-semibold mb-4 text-text-primary">
              {newFolderParent ? `New Folder in ${newFolderParent}` : "New Folder"}
            </h2>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
              className="w-full bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 outline-none focus:border-border-focus text-text-primary mb-4"
              placeholder="Folder name..."
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsNewFolderModalOpen(false);
                  setNewFolderName("");
                  setNewFolderParent(undefined);
                }}
                className="px-4 py-2 hover:bg-bg-tertiary rounded-lg transition-colors text-text-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="px-4 py-2 bg-accent-primary hover:bg-accent-primary-hover disabled:bg-bg-tertiary disabled:text-text-muted rounded-lg transition-colors text-white"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />
    </div>
  );
}

export default App;
