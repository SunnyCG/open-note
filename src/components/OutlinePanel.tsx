import { useState, useMemo, useCallback, useEffect } from "react";
import type { HeadingInfo } from "../types/note";

interface OutlinePanelProps {
  content: string;
  onHeadingClick: (line: number) => void;
}

// Parse markdown headings from content
function parseHeadings(content: string): HeadingInfo[] {
  const headings: HeadingInfo[] = [];
  const lines = content.split("\n");
  let charOffset = 0;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].trim(),
        line: i,
        charOffset: charOffset,
      });
    }
    charOffset += lines[i].length + 1;
  }
  return headings;
}

export function OutlinePanel({ content, onHeadingClick }: OutlinePanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Parse headings from content
  const headings = useMemo(() => parseHeadings(content), [content]);

  // Load collapsed state from session storage
  useEffect(() => {
    const stored = sessionStorage.getItem("outline-collapsed");
    if (stored !== null) {
      setIsCollapsed(stored === "true");
    }
  }, []);

  // Save collapsed state to session storage
  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const newValue = !prev;
      sessionStorage.setItem("outline-collapsed", String(newValue));
      return newValue;
    });
  }, []);

  // Handle heading click
  const handleHeadingClick = useCallback(
    (heading: HeadingInfo) => {
      onHeadingClick(heading.line);
    },
    [onHeadingClick]
  );

  if (isCollapsed) {
    return (
      <div className="w-10 bg-bg-secondary border-l border-border-default flex flex-col items-center py-2">
        <button
          onClick={toggleCollapse}
          className="p-1 hover:bg-bg-tertiary rounded text-text-muted hover:text-text-secondary"
          title="Expand outline"
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
              d="M4 6h16M4 12h16M4 18h7"
            />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="w-56 bg-bg-secondary border-l border-border-default flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border-default">
        <span className="text-xs text-text-muted uppercase tracking-wide font-medium">
          Outline
        </span>
        <button
          onClick={toggleCollapse}
          className="p-1 hover:bg-bg-tertiary rounded text-text-muted hover:text-text-secondary"
          title="Collapse outline"
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Headings list */}
      <div className="flex-1 overflow-y-auto py-2">
        {headings.length === 0 ? (
          <div className="px-3 py-2 text-sm text-text-muted">No headings</div>
        ) : (
          <ul className="space-y-0.5">
            {headings.map((heading, index) => (
              <li key={index}>
                <button
                  onClick={() => handleHeadingClick(heading)}
                  className={`w-full text-left px-3 py-1 text-sm hover:bg-bg-tertiary rounded transition-colors ${
                    heading.level === 1
                      ? "text-text-primary font-semibold"
                      : heading.level === 2
                      ? "text-text-secondary pl-5"
                      : heading.level === 3
                      ? "text-text-muted pl-7"
                      : "text-text-muted pl-9"
                  }`}
                  title={heading.text}
                >
                  <span className="truncate block">{heading.text}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
