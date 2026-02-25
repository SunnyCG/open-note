import type { WikiLink } from "../types/note";

interface OutgoingLinksPanelProps {
  links: WikiLink[];
  referencedNotes: string[];
  onLinkClick: (link: WikiLink) => void;
}

export function OutgoingLinksPanel({
  links,
  referencedNotes,
  onLinkClick,
}: OutgoingLinksPanelProps) {
  if (links.length === 0) {
    return (
      <div className="p-3 text-text-muted text-sm">
        No outgoing links - use [[note-name]] to link to other notes
      </div>
    );
  }

  return (
    <div className="border-t border-border-default">
      <div className="p-3 border-b border-border-default/50">
        <h3 className="text-sm font-medium text-text-secondary">
          Links ({links.length} to {referencedNotes.length} note
          {referencedNotes.length !== 1 ? "s" : ""})
        </h3>
      </div>
      <ul className="max-h-48 overflow-y-auto">
        {referencedNotes.map((noteName) => {
          // Get all links to this note
          const noteLinks = links.filter((l) => l.target === noteName);
          const firstLink = noteLinks[0];

          return (
            <li key={noteName}>
              <button
                onClick={() => onLinkClick(firstLink)}
                className="w-full text-left px-3 py-2 hover:bg-bg-tertiary/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-accent-primary flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  <span className="text-sm text-accent-primary truncate">
                    {noteName}
                  </span>
                  {noteLinks.length > 1 && (
                    <span className="text-xs text-text-muted ml-auto">
                      x{noteLinks.length}
                    </span>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
