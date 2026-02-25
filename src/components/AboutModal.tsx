interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-bg-secondary rounded-lg p-6 w-96 border border-border-default shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text-primary">About Open Note</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-bg-tertiary rounded transition-colors"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Logo and name */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent-primary rounded-lg flex items-center justify-center">
              <svg
                className="w-7 h-7 text-white"
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
            </div>
            <div>
              <h3 className="text-lg font-medium text-text-primary">Open Note</h3>
              <p className="text-sm text-text-muted">Version 0.1.0</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-text-secondary">
            A local-first, privacy-focused note-taking application with
            wiki-style bidirectional links. Inspired by Obsidian.
          </p>

          {/* Tech stack */}
          <div className="pt-2 border-t border-border-default">
            <p className="text-xs text-text-muted uppercase tracking-wide mb-2">
              Built With
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-bg-tertiary rounded text-xs text-text-secondary">
                Tauri
              </span>
              <span className="px-2 py-1 bg-bg-tertiary rounded text-xs text-text-secondary">
                React
              </span>
              <span className="px-2 py-1 bg-bg-tertiary rounded text-xs text-text-secondary">
                TypeScript
              </span>
              <span className="px-2 py-1 bg-bg-tertiary rounded text-xs text-text-secondary">
                Tailwind CSS
              </span>
            </div>
          </div>

          {/* Features */}
          <div className="pt-2 border-t border-border-default">
            <p className="text-xs text-text-muted uppercase tracking-wide mb-2">
              Features
            </p>
            <ul className="text-sm text-text-secondary space-y-1">
              <li className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-accent-success"
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
                Markdown editing with live preview
              </li>
              <li className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-accent-success"
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
                Wiki-style [[links]]
              </li>
              <li className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-accent-success"
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
                Multi-vault support
              </li>
              <li className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-accent-success"
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
                Folder organization
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-border-default flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
