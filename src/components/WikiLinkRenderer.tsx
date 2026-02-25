import React from "react";
import type { WikiLink } from "../types/note";

interface WikiLinkRendererProps {
  content: string;
  links: WikiLink[];
  onLinkClick: (link: WikiLink) => void;
}

export function WikiLinkRenderer({
  content,
  links,
  onLinkClick,
}: WikiLinkRendererProps) {
  if (links.length === 0) {
    // No links, just render the content as plain text with line breaks
    return (
      <div className="whitespace-pre-wrap font-mono text-sm">
        {content || <span className="text-gray-500">No content</span>}
      </div>
    );
  }

  // Sort links by start position
  const sortedLinks = [...links].sort((a, b) => a.start - b.start);

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  sortedLinks.forEach((link, index) => {
    // Add text before the link
    if (link.start > lastIndex) {
      elements.push(
        <span key={`text-${index}`}>
          {content.slice(lastIndex, link.start)}
        </span>
      );
    }

    // Add the link
    const displayText = link.display_text || link.target;
    elements.push(
      <button
        key={`link-${index}`}
        onClick={() => onLinkClick(link)}
        className="text-blue-400 hover:text-blue-300 hover:underline bg-blue-400/10 px-0.5 rounded"
        title={link.heading ? `${link.target}#${link.heading}` : link.target}
      >
        {link.heading ? `${displayText}#${link.heading}` : displayText}
      </button>
    );

    lastIndex = link.end;
  });

  // Add remaining text after the last link
  if (lastIndex < content.length) {
    elements.push(<span key="text-end">{content.slice(lastIndex)}</span>);
  }

  return (
    <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
      {elements.length > 0 ? elements : content}
    </div>
  );
}
