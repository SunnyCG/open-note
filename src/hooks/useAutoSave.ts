import { useState, useEffect, useRef, useCallback } from "react";

export interface SaveStatus {
  status: "idle" | "saving" | "saved" | "error";
  lastSaved: Date | null;
  error: string | null;
}

interface UseAutoSaveOptions {
  debounceMs?: number;
  onSave: (title: string, content: string) => Promise<boolean>;
  enabled?: boolean;
}

export function useAutoSave(
  title: string,
  content: string,
  hasChanges: boolean,
  options: UseAutoSaveOptions
): {
  saveStatus: SaveStatus;
  saveNow: () => Promise<boolean>;
  cancelPendingSave: () => void;
} {
  const { debounceMs = 1000, onSave, enabled = true } = options;

  const [saveStatus, setSaveStatus] = useState<SaveStatus>({
    status: "idle",
    lastSaved: null,
    error: null,
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleRef = useRef(title);
  const contentRef = useRef(content);
  const hasChangesRef = useRef(hasChanges);
  const isSavingRef = useRef(false);

  // Keep refs updated
  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    hasChangesRef.current = hasChanges;
  }, [hasChanges]);

  // Cancel any pending save
  const cancelPendingSave = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  // Perform immediate save
  const saveNow = useCallback(async (): Promise<boolean> => {
    // Cancel any pending debounced save
    cancelPendingSave();

    // Don't save if no changes or already saving
    if (!hasChangesRef.current || isSavingRef.current) {
      return true;
    }

    // Don't save if title is empty
    if (!titleRef.current.trim()) {
      return false;
    }

    isSavingRef.current = true;
    setSaveStatus((prev) => ({ ...prev, status: "saving", error: null }));

    try {
      const success = await onSave(titleRef.current, contentRef.current);
      if (success) {
        setSaveStatus({
          status: "saved",
          lastSaved: new Date(),
          error: null,
        });
      } else {
        setSaveStatus((prev) => ({
          ...prev,
          status: "error",
          error: "Failed to save",
        }));
      }
      isSavingRef.current = false;
      return success;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save";
      setSaveStatus((prev) => ({
        ...prev,
        status: "error",
        error: errorMessage,
      }));
      isSavingRef.current = false;
      return false;
    }
  }, [onSave, cancelPendingSave]);

  // Debounced auto-save when changes occur
  useEffect(() => {
    if (!enabled || !hasChanges) {
      return;
    }

    // Clear any existing timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timer
    debounceRef.current = setTimeout(() => {
      saveNow();
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [hasChanges, enabled, debounceMs, saveNow]);

  // Clear error when changes occur (allows retry)
  useEffect(() => {
    if (hasChanges && saveStatus.status === "error") {
      setSaveStatus((prev) => ({ ...prev, status: "idle", error: null }));
    }
  }, [hasChanges, saveStatus.status]);

  return {
    saveStatus,
    saveNow,
    cancelPendingSave,
  };
}
