import { syntaxTree } from "@codemirror/language";
import { Extension, RangeSetBuilder } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { createDynamicPreviewTheme } from "./editorTheme";

/**
 * Widget for rendering horizontal rules
 */
class HorizontalRuleWidget extends WidgetType {
  toDOM() {
    const hr = document.createElement("hr");
    hr.className = "cm-hr";
    return hr;
  }

  eq() {
    return true;
  }
}

/**
 * View plugin that provides full preview decorations for markdown
 * - Hides ALL syntax characters (#, *, **, `, -, >, etc.)
 * - Applies styling classes to ALL markdown elements
 */
const fullPreviewPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
      // Rebuild decorations on document changes or viewport changes
      // Note: No selection tracking needed in preview mode (read-only)
      if (update.docChanged || update.viewportChanged) {
        this.decorations = this.buildDecorations(update.view);
      }
    }

    buildDecorations(view: EditorView): DecorationSet {
      const builder = new RangeSetBuilder<Decoration>();

      // Track positions to avoid overlapping decorations
      const decorations: Array<{
        from: number;
        to: number;
        decoration: Decoration;
        priority: number; // Higher priority = applied later
      }> = [];

      // Iterate through the syntax tree
      syntaxTree(view.state).iterate({
        enter: (node) => {
          const typeName = node.type.name;

          // Process headings
          if (typeName.startsWith("ATXHeading")) {
            this.processHeading(view, node, decorations);
          }

          // Process strong emphasis (bold)
          if (typeName === "StrongEmphasis") {
            this.processStrongEmphasis(node, decorations);
          }

          // Process emphasis (italic)
          if (typeName === "Emphasis") {
            this.processEmphasis(node, decorations);
          }

          // Process inline code
          if (typeName === "InlineCode") {
            this.processInlineCode(node, decorations);
          }

          // Process code blocks (fenced and indented)
          if (typeName === "FencedCode" || typeName === "CodeBlock") {
            this.processCodeBlock(node, decorations);
          }

          // Process lists
          if (typeName === "BulletList" || typeName === "OrderedList") {
            this.processList(node, decorations);
          }

          // Process list items
          if (typeName === "ListItem") {
            this.processListItem(node, decorations);
          }

          // Process blockquotes
          if (typeName === "Blockquote") {
            this.processBlockquote(node, decorations);
          }

          // Process horizontal rules
          if (typeName === "HorizontalRule") {
            this.processHorizontalRule(node, decorations);
          }

          // Process standard markdown links
          if (typeName === "URL" || typeName === "LinkMark") {
            this.processStandardLink(node, decorations);
          }
        },
      });

      // Sort by position, then by priority (higher priority applied last)
      decorations.sort((a, b) => {
        if (a.from !== b.from) return a.from - b.from;
        return a.priority - b.priority;
      });

      // Add sorted decorations to builder
      for (const { from, to, decoration } of decorations) {
        builder.add(from, to, decoration);
      }

      return builder.finish();
    }

    /**
     * Process heading nodes
     */
    processHeading(
      view: EditorView,
      node: { type: { name: string }; from: number; to: number; node: any },
      decorations: Array<{ from: number; to: number; decoration: Decoration; priority: number }>
    ) {
      const { to } = node;
      const levelMatch = node.type.name.match(/ATXHeading(\d)/);
      if (!levelMatch) return;

      const level = parseInt(levelMatch[1]);
      const treeNode = node.node;

      // Find and hide HeaderMark (the # characters)
      if (treeNode) {
        let headerMarkFrom: number | null = null;
        let headerMarkTo: number | null = null;

        for (
          let child = treeNode.firstChild;
          child;
          child = child.nextSibling
        ) {
          if (child.type.name === "HeaderMark") {
            if (headerMarkFrom === null) {
              headerMarkFrom = child.from;
            }
            headerMarkTo = child.to;
          }
        }

        // Hide all # characters and the space after them
        if (headerMarkFrom !== null && headerMarkTo !== null) {
          const textAfterMarks = view.state.doc.sliceString(
            headerMarkTo,
            headerMarkTo + 1
          );
          const hideEnd = textAfterMarks === " " ? headerMarkTo + 1 : headerMarkTo;

          decorations.push({
            from: headerMarkFrom,
            to: hideEnd,
            decoration: Decoration.replace({}),
            priority: 10,
          });

          // Apply heading style to content
          decorations.push({
            from: hideEnd,
            to: to,
            decoration: Decoration.mark({ class: `cm-h${level}` }),
            priority: 1,
          });
        }
      }
    }

    /**
     * Process bold text
     */
    processStrongEmphasis(
      node: { from: number; to: number; node: any },
      decorations: Array<{ from: number; to: number; decoration: Decoration; priority: number }>
    ) {
      const { from, to } = node;

      // Hide opening ** or __
      decorations.push({
        from: from,
        to: from + 2,
        decoration: Decoration.replace({}),
        priority: 10,
      });

      // Hide closing ** or __
      decorations.push({
        from: to - 2,
        to: to,
        decoration: Decoration.replace({}),
        priority: 10,
      });

      // Apply bold style to content
      decorations.push({
        from: from + 2,
        to: to - 2,
        decoration: Decoration.mark({ class: "cm-strong" }),
        priority: 1,
      });
    }

    /**
     * Process italic text
     */
    processEmphasis(
      node: { from: number; to: number },
      decorations: Array<{ from: number; to: number; decoration: Decoration; priority: number }>
    ) {
      const { from, to } = node;

      // Hide opening * or _
      decorations.push({
        from: from,
        to: from + 1,
        decoration: Decoration.replace({}),
        priority: 10,
      });

      // Hide closing * or _
      decorations.push({
        from: to - 1,
        to: to,
        decoration: Decoration.replace({}),
        priority: 10,
      });

      // Apply italic style to content
      decorations.push({
        from: from + 1,
        to: to - 1,
        decoration: Decoration.mark({ class: "cm-emphasis" }),
        priority: 1,
      });
    }

    /**
     * Process inline code
     */
    processInlineCode(
      node: { from: number; to: number; node: any },
      decorations: Array<{ from: number; to: number; decoration: Decoration; priority: number }>
    ) {
      const { from, to } = node;
      const treeNode = node.node;

      // Find and hide backticks
      if (treeNode) {
        for (
          let child = treeNode.firstChild;
          child;
          child = child.nextSibling
        ) {
          if (child.type.name === "Backtick" || child.type.name === "CodeMark") {
            decorations.push({
              from: child.from,
              to: child.to,
              decoration: Decoration.replace({}),
              priority: 10,
            });
          }
        }
      }

      // Apply inline code style to entire node
      decorations.push({
        from: from,
        to: to,
        decoration: Decoration.mark({ class: "cm-inline-code" }),
        priority: 1,
      });
    }

    /**
     * Process code blocks
     */
    processCodeBlock(
      node: { from: number; to: number; node: any },
      decorations: Array<{ from: number; to: number; decoration: Decoration; priority: number }>
    ) {
      const { from, to } = node;
      const treeNode = node.node;

      // Find and hide fence marks (``` or ~~~)
      if (treeNode) {
        for (
          let child = treeNode.firstChild;
          child;
          child = child.nextSibling
        ) {
          if (child.type.name === "CodeMark" || child.type.name === "Fence") {
            decorations.push({
              from: child.from,
              to: child.to,
              decoration: Decoration.replace({}),
              priority: 10,
            });
          }
        }
      }

      // Apply code block style
      decorations.push({
        from: from,
        to: to,
        decoration: Decoration.mark({ class: "cm-code-block" }),
        priority: 1,
      });
    }

    /**
     * Process list markers (-, *, +, 1., etc.)
     */
    processList(
      node: { from: number; to: number; node: any },
      decorations: Array<{ from: number; to: number; decoration: Decoration; priority: number }>
    ) {
      const treeNode = node.node;

      // Hide list markers
      if (treeNode) {
        for (
          let child = treeNode.firstChild;
          child;
          child = child.nextSibling
        ) {
          if (child.type.name === "ListMark" || child.type.name === "ListDelimiter") {
            decorations.push({
              from: child.from,
              to: child.to,
              decoration: Decoration.replace({}),
              priority: 10,
            });
          }
        }
      }
    }

    /**
     * Process list items (indentation)
     */
    processListItem(
      node: { from: number; to: number },
      decorations: Array<{ from: number; to: number; decoration: Decoration; priority: number }>
    ) {
      // Apply list item style
      decorations.push({
        from: node.from,
        to: node.to,
        decoration: Decoration.mark({ class: "cm-list-item" }),
        priority: 1,
      });
    }

    /**
     * Process blockquotes (hide > markers)
     */
    processBlockquote(
      node: { from: number; to: number; node: any },
      decorations: Array<{ from: number; to: number; decoration: Decoration; priority: number }>
    ) {
      const treeNode = node.node;

      // Hide > markers
      if (treeNode) {
        for (
          let child = treeNode.firstChild;
          child;
          child = child.nextSibling
        ) {
          if (child.type.name === "QuoteMark") {
            decorations.push({
              from: child.from,
              to: child.to,
              decoration: Decoration.replace({}),
              priority: 10,
            });
          }
        }
      }

      // Apply blockquote style
      decorations.push({
        from: node.from,
        to: node.to,
        decoration: Decoration.mark({ class: "cm-blockquote" }),
        priority: 1,
      });
    }

    /**
     * Process horizontal rules (---, ***, ___)
     */
    processHorizontalRule(
      node: { from: number; to: number },
      decorations: Array<{ from: number; to: number; decoration: Decoration; priority: number }>
    ) {
      // Replace entire HR with a styled hr element
      decorations.push({
        from: node.from,
        to: node.to,
        decoration: Decoration.replace({
          widget: new HorizontalRuleWidget(),
        }),
        priority: 10,
      });
    }

    /**
     * Process standard markdown links [text](url)
     */
    processStandardLink(
      node: { from: number; to: number },
      decorations: Array<{ from: number; to: number; decoration: Decoration; priority: number }>
    ) {
      // Hide link marks [ and ]
      // This is a simplified version - full implementation would need more parsing
      decorations.push({
        from: node.from,
        to: node.to,
        decoration: Decoration.mark({ class: "cm-md-link" }),
        priority: 1,
      });
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

/**
 * Create the full markdown preview extension
 * Uses dynamic preview theme that respects CSS variables
 */
export function createPreviewStylingExtension(): Extension {
  return [fullPreviewPlugin, createDynamicPreviewTheme()];
}
