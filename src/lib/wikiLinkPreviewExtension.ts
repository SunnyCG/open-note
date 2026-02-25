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

// Module-level callback storage for preview mode
let onWikiLinkPreviewClickCallback: ((target: string, heading?: string) => void) | null = null;

/**
 * Widget for rendering wiki links as clickable elements in preview mode
 * This version ALWAYS hides the [[ ]] syntax (no cursor-based toggling)
 */
class PreviewWikiLinkWidget extends WidgetType {
  constructor(
    readonly target: string,
    readonly heading?: string,
    readonly displayText?: string
  ) {
    super();
  }

  toDOM() {
    const span = document.createElement("span");
    span.className = "cm-wiki-link-preview";
    span.textContent = this.displayText || this.target;
    span.setAttribute("data-target", this.target);
    if (this.heading) {
      span.setAttribute("data-heading", this.heading);
      span.title = `${this.target}#${this.heading}`;
    } else {
      span.title = this.target;
    }

    // Add click handler directly to the element
    span.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (onWikiLinkPreviewClickCallback) {
        onWikiLinkPreviewClickCallback(this.target, this.heading);
      }
    });

    return span;
  }

  eq(other: PreviewWikiLinkWidget) {
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
 * View plugin that decorates wiki links in PREVIEW mode
 * ALWAYS replaces [[link]] with widget, regardless of cursor position
 */
const wikiLinkPreviewDecorations = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = this.buildDecorations(update.view);
      }
    }

    buildDecorations(view: EditorView): DecorationSet {
      const builder = new RangeSetBuilder<Decoration>();
      const doc = view.state.doc.toString();
      const links = findWikiLinks(doc);

      for (const link of links) {
        // ALWAYS replace the entire [[link]] with a widget in preview mode
        builder.add(
          link.from,
          link.to,
          Decoration.replace({
            widget: new PreviewWikiLinkWidget(link.target, link.heading, link.displayText),
          })
        );
      }

      return builder.finish();
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

/**
 * Theme for wiki link styling in preview mode
 */
const wikiLinkPreviewTheme = EditorView.baseTheme({
  ".cm-wiki-link-preview": {
    color: "#7dd3fc",
    backgroundColor: "rgba(125, 211, 252, 0.1)",
    padding: "0 2px",
    borderRadius: "3px",
    cursor: "pointer",
    textDecoration: "underline",
    textDecorationStyle: "dotted",
    textUnderlineOffset: "2px",
    transition: "background-color 0.15s ease-in-out",
  },
  ".cm-wiki-link-preview:hover": {
    backgroundColor: "rgba(125, 211, 252, 0.2)",
    color: "#a5f3fc",
  },
});

/**
 * Create the wiki link extension for PREVIEW mode
 * In preview mode, links are ALWAYS rendered as widgets (no syntax character display)
 */
export function createWikiLinkPreviewExtension(
  onLinkClick: (target: string, heading?: string) => void
): Extension {
  // Store callback at module level for Widgets to access
  onWikiLinkPreviewClickCallback = onLinkClick;

  return [
    wikiLinkPreviewDecorations,
    wikiLinkPreviewTheme,
  ];
}

export { findWikiLinks };
