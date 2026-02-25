import { EditorView } from "@codemirror/view";

/**
 * Create a dynamic editor theme using CSS variables
 * This theme respects the current theme (dark/light) by using CSS variables
 */
export function createDynamicEditorTheme(): ReturnType<typeof EditorView.theme> {
  return EditorView.theme({
    "&": {
      height: "100%",
      fontSize: "14px",
      backgroundColor: "var(--editor-bg)",
      color: "var(--text-primary)",
    },
    ".cm-scroller": {
      overflow: "auto",
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
    },
    ".cm-content": {
      padding: "16px 0",
      caretColor: "var(--editor-cursor)",
    },
    ".cm-line": {
      padding: "0 16px",
    },
    ".cm-gutters": {
      backgroundColor: "var(--editor-gutter)",
      border: "none",
      color: "var(--text-muted)",
    },
    ".cm-gutter": {
      minWidth: "48px",
    },
    ".cm-cursor": {
      borderLeftColor: "var(--editor-cursor)",
    },
    ".cm-selectionBackground": {
      backgroundColor: "var(--editor-selection) !important",
    },
    "&.cm-focused .cm-selectionBackground": {
      backgroundColor: "var(--editor-selection) !important",
    },
    ".cm-selectionMatch": {
      backgroundColor: "var(--editor-selection)",
    },
    // Placeholder styling
    ".cm-content:empty::before": {
      content: "attr(data-placeholder)",
      color: "var(--editor-placeholder)",
      position: "absolute",
      pointerEvents: "none",
      paddingLeft: "16px",
    },
  });
}

/**
 * Create dynamic syntax highlighting theme using CSS variables
 */
export function createDynamicSyntaxTheme(): ReturnType<typeof EditorView.baseTheme> {
  return EditorView.baseTheme({
    // Heading styles - decreasing sizes from H1 to H6
    ".cm-h1": {
      fontSize: "2em",
      fontWeight: "bold",
      color: "var(--syntax-heading1)",
      lineHeight: "1.3",
    },
    ".cm-h2": {
      fontSize: "1.5em",
      fontWeight: "bold",
      color: "var(--syntax-heading2)",
      lineHeight: "1.3",
    },
    ".cm-h3": {
      fontSize: "1.25em",
      fontWeight: "bold",
      color: "var(--syntax-heading3)",
      lineHeight: "1.3",
    },
    ".cm-h4": {
      fontSize: "1.1em",
      fontWeight: "bold",
      color: "var(--syntax-heading3)",
      lineHeight: "1.3",
    },
    ".cm-h5": {
      fontSize: "1em",
      fontWeight: "bold",
      color: "var(--syntax-heading4)",
      lineHeight: "1.3",
    },
    ".cm-h6": {
      fontSize: "0.9em",
      fontWeight: "bold",
      color: "var(--syntax-heading4)",
      lineHeight: "1.3",
    },
    // Strong (bold) style
    ".cm-strong": {
      fontWeight: "700",
    },
    // Emphasis (italic) style
    ".cm-emphasis": {
      fontStyle: "italic",
    },
    // Wiki link styling (editor mode)
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
      userSelect: "none",
      WebkitUserSelect: "none",
    },
    ".cm-wiki-link:hover": {
      backgroundColor: "rgba(125, 211, 252, 0.25)",
    },
  });
}

/**
 * Create dynamic preview theme using CSS variables
 */
export function createDynamicPreviewTheme(): ReturnType<typeof EditorView.baseTheme> {
  return EditorView.baseTheme({
    // Heading styles for preview
    ".cm-h1": {
      fontSize: "2.25em",
      fontWeight: "700",
      color: "var(--syntax-heading1)",
      lineHeight: "1.2",
      marginTop: "1.5em",
      marginBottom: "0.75em",
      borderBottom: "1px solid var(--syntax-hr)",
      paddingBottom: "0.3em",
    },
    ".cm-h2": {
      fontSize: "1.75em",
      fontWeight: "600",
      color: "var(--syntax-heading2)",
      lineHeight: "1.3",
      marginTop: "1.25em",
      marginBottom: "0.5em",
    },
    ".cm-h3": {
      fontSize: "1.35em",
      fontWeight: "600",
      color: "var(--syntax-heading3)",
      lineHeight: "1.4",
      marginTop: "1em",
      marginBottom: "0.4em",
    },
    ".cm-h4": {
      fontSize: "1.15em",
      fontWeight: "600",
      color: "var(--syntax-heading3)",
      lineHeight: "1.4",
      marginTop: "0.8em",
      marginBottom: "0.3em",
    },
    ".cm-h5": {
      fontSize: "1em",
      fontWeight: "600",
      color: "var(--syntax-heading4)",
      lineHeight: "1.5",
      marginTop: "0.6em",
      marginBottom: "0.2em",
    },
    ".cm-h6": {
      fontSize: "0.9em",
      fontWeight: "600",
      color: "var(--syntax-heading4)",
      lineHeight: "1.5",
      marginTop: "0.5em",
      marginBottom: "0.2em",
    },

    // Strong (bold) style
    ".cm-strong": {
      fontWeight: "700",
      color: "var(--syntax-heading1)",
    },

    // Emphasis (italic) style
    ".cm-emphasis": {
      fontStyle: "italic",
      color: "var(--syntax-heading2)",
    },

    // Inline code
    ".cm-inline-code": {
      backgroundColor: "var(--syntax-code-bg)",
      color: "var(--syntax-code)",
      padding: "0.2em 0.4em",
      borderRadius: "4px",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: "0.9em",
    },

    // Code block
    ".cm-code-block": {
      backgroundColor: "var(--editor-gutter)",
      border: "1px solid var(--border-default)",
      borderRadius: "6px",
      padding: "1em",
      margin: "1em 0",
      overflow: "auto",
    },

    // List styles
    ".cm-list-item": {
      marginLeft: "1.5em",
      marginTop: "0.25em",
      marginBottom: "0.25em",
    },

    // Blockquote
    ".cm-blockquote": {
      borderLeft: "4px solid var(--syntax-quote)",
      paddingLeft: "1em",
      marginLeft: "0",
      marginRight: "0",
      color: "var(--text-muted)",
      fontStyle: "italic",
      backgroundColor: "var(--syntax-quote-bg)",
      padding: "0.5em 1em",
      borderRadius: "0 4px 4px 0",
      margin: "1em 0",
    },

    // Horizontal rule
    ".cm-hr": {
      border: "none",
      borderTop: "2px solid var(--syntax-hr)",
      margin: "2em 0",
    },

    // Link styling (standard MD links)
    ".cm-md-link": {
      color: "var(--syntax-link)",
      textDecoration: "underline",
      textDecorationStyle: "dotted",
    },

    // Wiki link styling (preview mode)
    ".cm-wiki-link-preview": {
      color: "var(--syntax-link)",
      backgroundColor: "var(--syntax-code-bg)",
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
    },
  });
}
