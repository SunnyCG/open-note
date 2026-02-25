import type { BacklinkInfo } from "../types/note";

interface BacklinksPanelProps {
  backlinks: BacklinkInfo[];
  isLoading: boolean;
  onNoteClick: (notePath: string) => void;
}

export function BacklinksPanel({
  backlinks,
  isLoading,
  onNoteClick,
}: BacklinksPanelProps) {
  if (isLoading) {
    return (
      <div className="p-3 text-text-muted text-sm">
        Loading backlinks...
      </div>
    );
  }

  if (backlinks.length === 0) {
    return (
      <div className="p-3 text-text-muted text-sm">
        No backlinks - no notes link to this note
      </div>
    );
  }

  const totalLinks = backlinks.reduce((sum, b) => sum + b.links.length, 0);

  return (
    <div className="border-t border-border-default">
      <div className="p-3 border-b border-border-default/50">
        <h3 className="text-sm font-medium text-text-secondary">
          Backlinks ({totalLinks} from {backlinks.length} note
          {backlinks.length !== 1 ? "s" : ""})
        </h3>
      </div>
      <ul className="max-h-48 overflow-y-auto">
        {backlinks.map((backlink) => (
          <li key={backlink.source_path}>
            <button
              onClick={() => onNoteClick(backlink.source_path)}
              className="w-full text-left px-3 py-2 hover:bg-bg-tertiary/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-text-muted flex-shrink-0"
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
                <span className="text-sm text-text-primary truncate">
                  {backlink.source_name}
                </span>
                <span className="text-xs text-text-muted ml-auto">
                  {backlink.links.length} link
                  {backlink.links.length !== 1 ? "s" : ""}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
