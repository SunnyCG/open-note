import type { SaveStatus } from "../hooks/useAutoSave";

interface SaveStatusIndicatorProps {
  saveStatus: SaveStatus;
  hasUnsavedChanges: boolean;
}

export function SaveStatusIndicator({
  saveStatus,
  hasUnsavedChanges,
}: SaveStatusIndicatorProps) {
  const { status, lastSaved, error } = saveStatus;

  // Saving state
  if (status === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-accent-primary">
        <svg
          className="w-3.5 h-3.5 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        Saving...
      </span>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <span className="flex items-center gap-1.5 text-accent-danger" title={error || undefined}>
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
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        {error || "Save failed"}
      </span>
    );
  }

  // Saved state with unsaved changes (user is editing again)
  if (status === "saved" && hasUnsavedChanges) {
    return (
      <span className="flex items-center gap-1.5 text-accent-warning">
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
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        Unsaved changes
      </span>
    );
  }

  // Saved state (no new changes)
  if (status === "saved" && !hasUnsavedChanges && lastSaved) {
    const timeStr = lastSaved.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
    return (
      <span className="flex items-center gap-1.5 text-accent-success">
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
            d="M5 13l4 4L19 7"
          />
        </svg>
        Saved {timeStr}
      </span>
    );
  }

  // Idle with unsaved changes
  if (status === "idle" && hasUnsavedChanges) {
    return (
      <span className="flex items-center gap-1.5 text-accent-warning">
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
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        Unsaved changes
      </span>
    );
  }

  // Default: nothing to show
  return null;
}
