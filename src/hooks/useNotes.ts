import { useState, useEffect, useCallback, useMemo } from "react";
import type { Note, NoteMeta, Vault, FileTree } from "../types/note";
import * as notesApi from "../lib/notes";

export function useNotes() {
  const [currentVault, setCurrentVault] = useState<Vault | null>(null);
  const [openVaults, setOpenVaults] = useState<Vault[]>([]);
  const [recentVaults, setRecentVaults] = useState<Vault[]>([]);
  const [notes, setNotes] = useState<NoteMeta[]>([]);
  const [fileTree, setFileTree] = useState<FileTree | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Multi-note state: array of open notes in current vault
  const [openNotes, setOpenNotes] = useState<Note[]>([]);
  // Path of the currently active note
  const [activeNotePath, setActiveNotePath] = useState<string | null>(null);

  // Derive active note from openNotes + activeNotePath
  const currentNote = useMemo(() => {
    return openNotes.find(n => n.path === activeNotePath) || null;
  }, [openNotes, activeNotePath]);

  const refreshNotes = useCallback(async (vaultPath: string) => {
    // Load both flat list and file tree
    const [notesResult, treeResult] = await Promise.all([
      notesApi.listNotes(vaultPath),
      notesApi.listFileTree(vaultPath),
    ]);

    if (notesResult.success && notesResult.data) {
      setNotes(notesResult.data);
    } else if (notesResult.error) {
      setError(notesResult.error);
    }

    if (treeResult.success && treeResult.data) {
      setFileTree(treeResult.data);
    } else if (treeResult.error) {
      setError(treeResult.error);
    }
  }, []);

  // Load open vaults and recent vaults on mount
  useEffect(() => {
    async function loadVaults() {
      const openResult = await notesApi.getOpenVaults();
      if (openResult.success && openResult.data) {
        setOpenVaults(openResult.data);
      }
      const recentResult = await notesApi.listRecentVaults();
      if (recentResult.success && recentResult.data) {
        setRecentVaults(recentResult.data);
      }
    }
    loadVaults();
  }, []);

  // Initialize with default vault if no current vault
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      setError(null);

      // Try to get current vault
      const currentResult = await notesApi.getCurrentVault();
      if (currentResult.success && currentResult.data) {
        setCurrentVault(currentResult.data);
        await refreshNotes(currentResult.data.path);

        // Restore open notes for this vault
        const openNotesResult = await notesApi.getOpenNotes(currentResult.data.path);
        if (openNotesResult.success && openNotesResult.data && openNotesResult.data.length > 0) {
          // Load all open notes
          const loadedNotes: Note[] = [];
          for (const notePath of openNotesResult.data) {
            const noteResult = await notesApi.readNote(notePath);
            if (noteResult.success && noteResult.data) {
              loadedNotes.push(noteResult.data);
            }
          }
          setOpenNotes(loadedNotes);

          // Set active note
          const activeResult = await notesApi.getActiveNote(currentResult.data.path);
          if (activeResult.success && activeResult.data) {
            setActiveNotePath(activeResult.data);
          } else if (loadedNotes.length > 0) {
            setActiveNotePath(loadedNotes[0].path);
          }
        } else {
          // Try legacy last_note_per_vault for migration
          const lastNoteResult = await notesApi.getLastNote(currentResult.data.path);
          if (lastNoteResult.success && lastNoteResult.data) {
            const noteResult = await notesApi.readNote(lastNoteResult.data);
            if (noteResult.success && noteResult.data) {
              setOpenNotes([noteResult.data]);
              setActiveNotePath(noteResult.data.path);
              // Migrate to new system
              await notesApi.addOpenNote(currentResult.data.path, noteResult.data.path);
              await notesApi.setActiveNote(currentResult.data.path, noteResult.data.path);
            }
          }
        }

        setIsLoading(false);
        return;
      }

      // Fall back to default vault
      const vaultResult = await notesApi.initVault();
      if (!vaultResult.success || !vaultResult.data) {
        setError(vaultResult.error || "Failed to initialize vault");
        setIsLoading(false);
        return;
      }

      // Set as current vault
      const setResult = await notesApi.setCurrentVault(vaultResult.data);
      if (setResult.success && setResult.data) {
        setCurrentVault(setResult.data);
        await refreshNotes(setResult.data.path);
      }

      setIsLoading(false);
    }

    init();
  }, [refreshNotes]);

  // Open a note in a tab (add to tabs if not already open)
  const openNoteInTab = useCallback(async (notePath: string) => {
    setIsLoading(true);
    setError(null);

    // Check if already open
    const existingNote = openNotes.find(n => n.path === notePath);
    if (existingNote) {
      setActiveNotePath(notePath);
      if (currentVault) {
        await notesApi.setActiveNote(currentVault.path, notePath);
      }
      setIsLoading(false);
      return;
    }

    // Load the note
    const result = await notesApi.readNote(notePath);
    if (result.success && result.data) {
      setOpenNotes(prev => [...prev, result.data!]);
      setActiveNotePath(notePath);

      // Persist to backend
      if (currentVault) {
        await notesApi.addOpenNote(currentVault.path, notePath);
        await notesApi.setActiveNote(currentVault.path, notePath);
      }
    } else {
      setError(result.error || "Failed to read note");
    }

    setIsLoading(false);
  }, [openNotes, currentVault]);

  // Close a note tab
  const closeTab = useCallback(async (notePath: string) => {
    setOpenNotes(prev => {
      const newOpenNotes = prev.filter(n => n.path !== notePath);

      // If we're closing the active note, switch to another
      if (activeNotePath === notePath && newOpenNotes.length > 0) {
        // Switch to the last tab
        setActiveNotePath(newOpenNotes[newOpenNotes.length - 1].path);
        if (currentVault) {
          notesApi.setActiveNote(currentVault.path, newOpenNotes[newOpenNotes.length - 1].path);
        }
      } else if (newOpenNotes.length === 0) {
        setActiveNotePath(null);
      }

      return newOpenNotes;
    });

    // Persist to backend
    if (currentVault) {
      await notesApi.removeOpenNote(currentVault.path, notePath);
    }
  }, [activeNotePath, currentVault]);

  // Switch active tab
  const switchTab = useCallback(async (notePath: string) => {
    if (openNotes.some(n => n.path === notePath)) {
      setActiveNotePath(notePath);
      if (currentVault) {
        await notesApi.setActiveNote(currentVault.path, notePath);
      }
    }
  }, [openNotes, currentVault]);

  const openVault = useCallback(async (path: string) => {
    setIsLoading(true);
    setError(null);

    const result = await notesApi.setCurrentVault(path);
    if (result.success && result.data) {
      setCurrentVault(result.data);
      setOpenNotes([]);
      setActiveNotePath(null);
      await refreshNotes(result.data.path);

      // Update open vaults and recent vaults
      const [openResult, recentResult] = await Promise.all([
        notesApi.getOpenVaults(),
        notesApi.listRecentVaults(),
      ]);
      if (openResult.success && openResult.data) {
        setOpenVaults(openResult.data);
      }
      if (recentResult.success && recentResult.data) {
        setRecentVaults(recentResult.data);
      }
    } else {
      setError(result.error || "Failed to open vault");
    }

    setIsLoading(false);
    return result.success;
  }, [refreshNotes]);

  // Switch to a vault and restore all open notes
  const switchToVault = useCallback(async (path: string) => {
    setIsLoading(true);
    setError(null);

    const result = await notesApi.setCurrentVault(path);
    if (result.success && result.data) {
      setCurrentVault(result.data);
      await refreshNotes(result.data.path);

      // Restore open notes for this vault
      const openNotesResult = await notesApi.getOpenNotes(result.data.path);
      if (openNotesResult.success && openNotesResult.data && openNotesResult.data.length > 0) {
        const loadedNotes: Note[] = [];
        for (const notePath of openNotesResult.data) {
          const noteResult = await notesApi.readNote(notePath);
          if (noteResult.success && noteResult.data) {
            loadedNotes.push(noteResult.data);
          }
        }
        setOpenNotes(loadedNotes);

        // Set active note
        const activeResult = await notesApi.getActiveNote(result.data.path);
        if (activeResult.success && activeResult.data) {
          setActiveNotePath(activeResult.data);
        } else if (loadedNotes.length > 0) {
          setActiveNotePath(loadedNotes[0].path);
        }
      } else {
        // Try legacy last_note_per_vault for migration
        const lastNoteResult = await notesApi.getLastNote(result.data.path);
        if (lastNoteResult.success && lastNoteResult.data) {
          const noteResult = await notesApi.readNote(lastNoteResult.data);
          if (noteResult.success && noteResult.data) {
            setOpenNotes([noteResult.data]);
            setActiveNotePath(noteResult.data.path);
            // Migrate to new system
            await notesApi.addOpenNote(result.data.path, noteResult.data.path);
            await notesApi.setActiveNote(result.data.path, noteResult.data.path);
          }
        } else {
          setOpenNotes([]);
          setActiveNotePath(null);
        }
      }

      // Update open vaults and recent vaults
      const [openResult, recentResult] = await Promise.all([
        notesApi.getOpenVaults(),
        notesApi.listRecentVaults(),
      ]);
      if (openResult.success && openResult.data) {
        setOpenVaults(openResult.data);
      }
      if (recentResult.success && recentResult.data) {
        setRecentVaults(recentResult.data);
      }
    } else {
      setError(result.error || "Failed to switch vault");
    }

    setIsLoading(false);
    return result.success;
  }, [refreshNotes]);

  // Close a vault (remove from open list, keep in history)
  const closeVault = useCallback(async (path: string) => {
    await notesApi.removeOpenVault(path);
    const result = await notesApi.getOpenVaults();
    if (result.success && result.data) {
      setOpenVaults(result.data);
    }
  }, []);

  const createNewVault = useCallback(async (path: string) => {
    setError(null);
    const result = await notesApi.createVault(path);
    if (result.success && result.data) {
      return await openVault(result.data.path);
    } else {
      setError(result.error || "Failed to create vault");
      return false;
    }
  }, [openVault]);

  const removeVaultFromRecent = useCallback(async (path: string) => {
    await notesApi.removeRecentVault(path);
    const result = await notesApi.listRecentVaults();
    if (result.success && result.data) {
      setRecentVaults(result.data);
    }
  }, []);

  // Legacy openNote - now uses openNoteInTab
  const openNote = useCallback(async (notePath: string) => {
    await openNoteInTab(notePath);
  }, [openNoteInTab]);

  // Save a note (updates both the note in openNotes and persists to disk)
  const saveNote = useCallback(
    async (name: string, content: string) => {
      if (!currentVault) return false;

      setError(null);

      // Determine folder from current note path if available
      const activeNote = openNotes.find(n => n.path === activeNotePath);
      let folder: string | undefined = undefined;
      if (activeNote) {
        // Extract folder from the note's path relative to vault
        const vaultPathPrefix = currentVault.path + '/';
        if (activeNote.path.startsWith(vaultPathPrefix)) {
          const relativePath = activeNote.path.slice(vaultPathPrefix.length);
          const lastSlash = relativePath.lastIndexOf('/');
          if (lastSlash > 0) {
            folder = relativePath.slice(0, lastSlash);
          }
        }
      }

      const result = await notesApi.writeNote(currentVault.path, name, content, folder);
      if (result.success && result.data) {
        // Update the note in openNotes
        setOpenNotes(prev => prev.map(n =>
          n.path === activeNotePath ? result.data! : n
        ));
        await refreshNotes(currentVault.path);
        return true;
      } else {
        setError(result.error || "Failed to save note");
        return false;
      }
    },
    [currentVault, refreshNotes, openNotes, activeNotePath]
  );

  const createNote = useCallback(
    async (name: string, folder?: string) => {
      if (!currentVault) return false;

      setError(null);
      // If folder is specified, create note in that folder
      const folderPath = folder || undefined;
      const result = await notesApi.writeNote(currentVault.path, name, "", folderPath);
      if (result.success && result.data) {
        // Add to open notes and set as active
        setOpenNotes(prev => [...prev, result.data!]);
        setActiveNotePath(result.data!.path);
        await notesApi.addOpenNote(currentVault.path, result.data!.path);
        await notesApi.setActiveNote(currentVault.path, result.data!.path);
        await refreshNotes(currentVault.path);
        return true;
      } else {
        setError(result.error || "Failed to create note");
        return false;
      }
    },
    [currentVault, refreshNotes]
  );

  const createFolder = useCallback(
    async (folderPath: string) => {
      if (!currentVault) return false;

      setError(null);
      const result = await notesApi.createFolder(currentVault.path, folderPath);
      if (result.success) {
        await refreshNotes(currentVault.path);
        return true;
      } else {
        setError(result.error || "Failed to create folder");
        return false;
      }
    },
    [currentVault, refreshNotes]
  );

  const deleteNoteFn = useCallback(
    async (notePath: string) => {
      setError(null);
      const result = await notesApi.deleteNote(notePath);
      if (result.success) {
        // Remove from open notes
        setOpenNotes(prev => {
          const newOpenNotes = prev.filter(n => n.path !== notePath);
          // If we deleted the active note, switch to another
          if (activeNotePath === notePath && newOpenNotes.length > 0) {
            setActiveNotePath(newOpenNotes[newOpenNotes.length - 1].path);
          } else if (newOpenNotes.length === 0) {
            setActiveNotePath(null);
          }
          return newOpenNotes;
        });
        await refreshNotes(currentVault?.path || "");
        return true;
      } else {
        setError(result.error || "Failed to delete note");
        return false;
      }
    },
    [currentVault, activeNotePath, refreshNotes]
  );

  const renameNoteFn = useCallback(
    async (oldPath: string, newName: string) => {
      setError(null);
      const result = await notesApi.renameNote(oldPath, newName);
      if (result.success && result.data) {
        // Update the note in openNotes
        setOpenNotes(prev => prev.map(n =>
          n.path === oldPath ? result.data! : n
        ));
        // Update active note path if needed
        if (activeNotePath === oldPath) {
          setActiveNotePath(result.data!.path);
          if (currentVault) {
            await notesApi.setActiveNote(currentVault.path, result.data!.path);
          }
        }
        // Update open notes in backend
        if (currentVault) {
          await notesApi.removeOpenNote(currentVault.path, oldPath);
          await notesApi.addOpenNote(currentVault.path, result.data!.path);
        }
        await refreshNotes(currentVault?.path || "");
        return true;
      } else {
        setError(result.error || "Failed to rename note");
        return false;
      }
    },
    [currentVault, activeNotePath, refreshNotes]
  );

  return {
    // Vault state
    currentVault,
    openVaults,
    recentVaults,
    openVault,
    switchToVault,
    closeVault,
    createNewVault,
    removeVaultFromRecent,
    // Note state
    notes,
    fileTree,
    currentNote,
    openNotes,
    activeNotePath,
    isLoading,
    error,
    openNote,
    openNoteInTab,
    closeTab,
    switchTab,
    saveNote,
    createNote,
    createFolder,
    deleteNote: deleteNoteFn,
    renameNote: renameNoteFn,
    refreshNotes: () => currentVault && refreshNotes(currentVault.path),
    setError,
  };
}
