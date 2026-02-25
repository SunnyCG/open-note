import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { EditorState } from "@codemirror/state";
import {
  EditorView,
  lineNumbers,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightActiveLine,
  keymap,
} from "@codemirror/view";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import {
  indentOnInput,
  bracketMatching,
  foldGutter,
  foldKeymap,
} from "@codemirror/language";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { oneDark } from "@codemirror/theme-one-dark";
import { createWikiLinkExtension } from "../lib/wikiLinkExtension";
import { createMarkdownStylingExtension } from "../lib/markdownStylingExtension";

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  onWikiLinkClick: (target: string, heading?: string) => void;
  onSave?: () => void;
  placeholder?: string;
  className?: string;
}

export interface MarkdownEditorRef {
  scrollToLine: (line: number) => void;
}

/**
 * CodeMirror 6 based Markdown editor with wiki link support
 */
export const MarkdownEditor = forwardRef<MarkdownEditorRef, MarkdownEditorProps>(
  function MarkdownEditor(
    {
      content,
      onChange,
      onWikiLinkClick,
      onSave,
      placeholder = "Start writing... Use [[note-name]] to link to other notes.",
      className = "",
    },
    ref
  ) {
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const isExternalUpdate = useRef(false);
    const onWikiLinkClickRef = useRef(onWikiLinkClick);

    // Expose scrollToLine method via ref
    useImperativeHandle(ref, () => ({
      scrollToLine: (line: number) => {
        const view = viewRef.current;
        if (!view) return;

        // Get the line at the given line number (0-indexed in CodeMirror)
        const docLine = view.state.doc.line(line + 1); // Convert 0-indexed to 1-indexed

        // Scroll to the line and set cursor
        view.dispatch({
          selection: { anchor: docLine.from },
          effects: EditorView.scrollIntoView(docLine.from, {
            y: "center",
          }),
        });

        // Focus the editor
        view.focus();
      },
    }), []);

    // Keep the ref updated with the latest callback
    useEffect(() => {
      onWikiLinkClickRef.current = onWikiLinkClick;
    }, [onWikiLinkClick]);

    // Handle save keyboard shortcut
    const saveKeymap = keymap.of([
      {
        key: "Mod-s",
        run: () => {
          onSave?.();
          return true;
        },
      },
    ]);

    // Create editor update listener
    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged && !isExternalUpdate.current) {
        const newContent = update.state.doc.toString();
        onChange(newContent);
      }
    });

    // Initialize editor
    useEffect(() => {
      if (!editorRef.current || viewRef.current) return;

      const state = EditorState.create({
        doc: content,
        extensions: [
          // Basic editor setup
          lineNumbers(),
          highlightActiveLineGutter(),
          highlightSpecialChars(),
          history(),
          foldGutter(),
          drawSelection(),
          dropCursor(),
          EditorState.allowMultipleSelections.of(true),
          indentOnInput(),
          bracketMatching(),
          rectangularSelection(),
          crosshairCursor(),
          highlightActiveLine(),
          keymap.of([
            ...defaultKeymap,
            ...historyKeymap,
            ...foldKeymap,
            indentWithTab,
          ]),
          saveKeymap,

          // Line wrapping - long lines wrap visually but stay as one logical line
          EditorView.lineWrapping,

          // Markdown support with code block syntax highlighting
          markdown({
            base: markdownLanguage,
            codeLanguages: languages,
          }),

          // Dark theme
          oneDark,

          // Wiki link support
          createWikiLinkExtension((target, heading) => {
            // Use the ref to get the latest callback
            onWikiLinkClickRef.current(target, heading);
          }),

          // Markdown live preview styling (headings, bold, italic)
          createMarkdownStylingExtension(),

          // Update listener for onChange
          updateListener,

          // Placeholder
          EditorView.contentAttributes.of({ "data-placeholder": placeholder }),

          // Custom styles
          EditorView.theme({
            "&": {
              height: "100%",
              fontSize: "14px",
            },
            ".cm-scroller": {
              overflow: "auto",
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
            },
            ".cm-content": {
              padding: "16px 0",
            },
            ".cm-line": {
              padding: "0 16px",
            },
            ".cm-gutters": {
              backgroundColor: "#1e293b",
              border: "none",
            },
            ".cm-gutter": {
              minWidth: "48px",
            },
            // Placeholder styling
            ".cm-content:empty::before": {
              content: "attr(data-placeholder)",
              color: "#64748b",
              position: "absolute",
              pointerEvents: "none",
              paddingLeft: "16px",
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
    }, []); // Only run once on mount

    // Update editor content when content prop changes externally
    useEffect(() => {
      const view = viewRef.current;
      if (!view) return;

      const currentContent = view.state.doc.toString();
      if (content !== currentContent) {
        isExternalUpdate.current = true;
        view.dispatch({
          changes: {
            from: 0,
            to: currentContent.length,
            insert: content,
          },
        });
        isExternalUpdate.current = false;
      }
    }, [content]);

    // Update wiki link click handler when it changes
    useEffect(() => {
      // Since we can't dynamically update extensions in CodeMirror 6,
      // we use a ref to store the latest handler
    }, [onWikiLinkClick]);

    return (
      <div
        ref={editorRef}
        className={`markdown-editor h-full w-full overflow-hidden rounded-lg border border-border-default bg-bg-secondary ${className}`}
      />
    );
  }
);
