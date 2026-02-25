import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { Extension, RangeSetBuilder } from "@codemirror/state";

/**
 * Wiki link regex patterns
 * Matches: [[note-name]], [[note-name#heading]], [[note-name|display text]]
 */
const WIKI_LINK_REGEX = /\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g;

interface WikiLinkMatch {
  from: number;
  to: number;
  target: string;
  heading?: string;
  displayText?: string;
}

// Module-level callback storage (works around Widget limitations)
let onWikiLinkClickCallback: ((target: string, heading?: string) => void) | null = null;

/**
 * Widget for rendering wiki links as clickable elements
 */
class WikiLinkWidget extends WidgetType {
  constructor(
    readonly target: string,
    readonly heading?: string,
    readonly displayText?: string
  ) {
    super();
  }

  toDOM() {
    const span = document.createElement("span");
    span.className = "cm-wiki-link";
    span.textContent = this.displayText || this.target;
    span.setAttribute("data-target", this.target);
    if (this.heading) {
      span.setAttribute("data-heading", this.heading);
    }
    // Mark as non-editable by default
    span.setAttribute("contenteditable", "false");

    // Handle mouse down in capture phase to prevent CodeMirror cursor movement
    span.addEventListener('mousedown', (e: MouseEvent) => {
      // Check if Ctrl (Windows/Linux) or Cmd (macOS) is pressed
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (onWikiLinkClickCallback) {
          onWikiLinkClickCallback(this.target, this.heading);
        }
      }
      // If no modifier key, let default behavior happen (cursor enters link)
    }, { capture: true }); // Use capture phase

    // Also handle click in capture phase as backup
    span.addEventListener('click', (e: MouseEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        // Callback already called in mousedown
      }
    }, { capture: true });

    // Add visual hint via title attribute
    span.title = "Ctrl+Click (or Cmd+Click on Mac) to open";

    return span;
  }

  eq(other: WikiLinkWidget) {
    return (
      this.target === other.target &&
      this.heading === other.heading &&
      this.displayText === other.displayText
    );
  }

  ignoreEvent() {
    return false;
  }
}

/**
 * Check if cursor is within a range (not adjacent, strictly inside)
 */
function isCursorNearby(cursorPos: number, from: number, to: number): boolean {
  return cursorPos >= from && cursorPos <= to;
}

/**
 * Find all wiki links in the document
 */
function findWikiLinks(doc: string): WikiLinkMatch[] {
  const links: WikiLinkMatch[] = [];
  let match;

  while ((match = WIKI_LINK_REGEX.exec(doc)) !== null) {
    links.push({
      from: match.index,
      to: match.index + match[0].length,
      target: match[1].trim(),
      heading: match[2]?.trim(),
      displayText: match[3]?.trim(),
    });
  }

  // Reset regex lastIndex for reuse
  WIKI_LINK_REGEX.lastIndex = 0;
  return links;
}

/**
 * View plugin that decorates wiki links in the editor
 */
const wikiLinkDecorations = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged || update.selectionSet) {
        this.decorations = this.buildDecorations(update.view);
      }
    }

    buildDecorations(view: EditorView): DecorationSet {
      const builder = new RangeSetBuilder<Decoration>();
      const doc = view.state.doc.toString();
      const links = findWikiLinks(doc);
      const cursorPos = view.state.selection.main.from;

      for (const link of links) {
        // Only replace with widget when cursor is not nearby
        // This allows users to see and edit the raw [[link]] syntax when cursor is in the link
        if (!isCursorNearby(cursorPos, link.from, link.to)) {
          builder.add(
            link.from,
            link.to,
            Decoration.replace({
              widget: new WikiLinkWidget(link.target, link.heading, link.displayText),
            })
          );
        }
      }

      return builder.finish();
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

/**
 * Theme for wiki link styling using CSS variables
 */
const wikiLinkTheme = EditorView.baseTheme({
  ".cm-wiki-link": {
    color: "var(--syntax-link)",
    backgroundColor: "var(--syntax-code-bg)",
    padding: "0 2px",
    borderRadius: "3px",
    cursor: "pointer",
    textDecoration: "underline",
    textDecorationStyle: "dotted",
    textUnderlineOffset: "2px",
    transition: "background-color 0.15s ease-in-out, color 0.15s ease-in-out",
    // Prevent text selection when Ctrl+clicking
    userSelect: "none",
    WebkitUserSelect: "none",
  },
  ".cm-wiki-link:hover": {
    backgroundColor: "rgba(125, 211, 252, 0.25)",
  },
});

/**
 * Create the wiki link extension
 */
export function createWikiLinkExtension(
  onLinkClick: (target: string, heading?: string) => void
): Extension {
  // Store callback at module level for Widgets to access
  onWikiLinkClickCallback = onLinkClick;

  return [
    wikiLinkDecorations,
    wikiLinkTheme,
  ];
}

export { findWikiLinks };
