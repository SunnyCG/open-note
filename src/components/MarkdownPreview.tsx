import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import {
  EditorView,
  drawSelection,
} from "@codemirror/view";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { oneDark } from "@codemirror/theme-one-dark";
import { createWikiLinkPreviewExtension } from "../lib/wikiLinkPreviewExtension";
import { createPreviewStylingExtension } from "../lib/previewStylingExtension";

interface MarkdownPreviewProps {
  content: string;
  onWikiLinkClick: (target: string, heading?: string) => void;
  className?: string;
}

/**
 * Read-only CodeMirror-based Markdown preview
 */
export function MarkdownPreview({
  content,
  onWikiLinkClick,
  className = "",
}: MarkdownPreviewProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onWikiLinkClickRef = useRef(onWikiLinkClick);

  // Keep the ref updated with the latest callback
  useEffect(() => {
    onWikiLinkClickRef.current = onWikiLinkClick;
  }, [onWikiLinkClick]);

  // Initialize preview
  useEffect(() => {
    if (!editorRef.current || viewRef.current) return;

    const state = EditorState.create({
      doc: content,
      extensions: [
        // Read-only mode
        EditorState.readOnly.of(true),
        EditorView.editable.of(false),

        // Basic editor setup (minimal)
        drawSelection(),

        // Markdown support with code block syntax highlighting
        markdown({
          base: markdownLanguage,
          codeLanguages: languages,
        }),

        // Dark theme
        oneDark,

        // Wiki link support for preview mode (always show clickable links, never syntax)
        createWikiLinkPreviewExtension((target, heading) => {
          // Use the ref to get the latest callback
          onWikiLinkClickRef.current(target, heading);
        }),

        // Preview styling - hide ALL syntax characters
        createPreviewStylingExtension(),

        // Custom preview styles
        EditorView.theme({
          "&": {
            fontSize: "15px",
            lineHeight: "1.7",
            backgroundColor: "#1f2937", // gray-800
            color: "#e5e7eb", // gray-200
          },
          ".cm-scroller": {
            overflow: "auto",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            backgroundColor: "#1f2937", // gray-800
          },
          ".cm-content": {
            padding: "20px 24px",
            cursor: "default",
            backgroundColor: "#1f2937", // gray-800
            minHeight: "100%",
          },
          ".cm-line": {
            padding: "0",
          },
          // Hide line numbers and gutters in preview mode
          ".cm-gutters": {
            display: "none",
          },
          // Code block styles
          ".cm-line.cm-activeLine": {
            backgroundColor: "transparent",
          },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  // Update preview content when content prop changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentContent = view.state.doc.toString();
    if (content !== currentContent) {
      view.dispatch({
        changes: {
          from: 0,
          to: currentContent.length,
          insert: content,
        },
      });
    }
  }, [content]);

  return (
    <div
      ref={editorRef}
      className={`markdown-preview h-full w-full overflow-hidden rounded-lg bg-bg-secondary ${className}`}
    />
  );
}
