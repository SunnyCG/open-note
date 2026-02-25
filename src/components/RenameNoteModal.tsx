import { useState, useEffect, useRef } from "react";

interface RenameNoteModalProps {
  isOpen: boolean;
  currentName: string;
  onRename: (newName: string) => Promise<void>;
  onClose: () => void;
}

export function RenameNoteModal({
  isOpen,
  currentName,
  onRename,
  onClose,
}: RenameNoteModalProps) {
  const [newName, setNewName] = useState(currentName);
  const [isRenaming, setIsRenaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update name when currentName changes
  useEffect(() => {
    setNewName(currentName);
  }, [currentName]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setError("Name cannot be empty");
      return;
    }
    if (newName === currentName) {
      onClose();
      return;
    }

    setIsRenaming(true);
    setError(null);
    try {
      await onRename(newName.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rename");
    } finally {
      setIsRenaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-bg-secondary rounded-lg p-6 w-96 border border-border-default">
        <h2 className="text-lg font-semibold mb-4 text-text-primary">Rename Note</h2>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 outline-none focus:border-border-focus text-text-primary mb-2"
            placeholder="Note name..."
            disabled={isRenaming}
          />
          {error && <p className="text-accent-danger text-sm mb-4">{error}</p>}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 hover:bg-bg-tertiary rounded-lg transition-colors text-text-secondary"
              disabled={isRenaming}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newName.trim() || isRenaming}
              className="px-4 py-2 bg-accent-primary hover:bg-accent-primary-hover disabled:bg-bg-tertiary disabled:text-text-muted rounded-lg transition-colors text-white"
            >
              {isRenaming ? "Renaming..." : "Rename"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
