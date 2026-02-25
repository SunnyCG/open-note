import { syntaxTree } from "@codemirror/language";
import { Extension, RangeSetBuilder } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import { createDynamicSyntaxTheme } from "./editorTheme";

/**
 * Check if cursor is on the same line as a position
 */
function isCursorOnSameLine(
  view: EditorView,
  pos: number,
  cursorPos: number
): boolean {
  const nodeLine = view.state.doc.lineAt(pos);
  const cursorLine = view.state.doc.lineAt(cursorPos);
  return nodeLine.number === cursorLine.number;
}

/**
 * Check if cursor is within or adjacent to a range
 */
function isCursorNearby(cursorPos: number, from: number, to: number): boolean {
  return cursorPos >= from - 1 && cursorPos <= to + 1;
}

/**
 * View plugin that provides live preview decorations for markdown
 * - Hides syntax characters (#, *, **) when cursor is not nearby
 * - Applies styling classes to content (headings, bold, italic)
 */
const livePreviewPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
      // Rebuild decorations on document changes, viewport changes, or selection changes
      if (update.docChanged || update.viewportChanged || update.selectionSet) {
        this.decorations = this.buildDecorations(update.view);
      }
    }

    buildDecorations(view: EditorView): DecorationSet {
      const builder = new RangeSetBuilder<Decoration>();
      const cursorPos = view.state.selection.main.from;

      // Track positions to avoid overlapping decorations
      const decorations: Array<{
        from: number;
        to: number;
        decoration: Decoration;
      }> = [];

      // Iterate through the syntax tree
      syntaxTree(view.state).iterate({
        enter: (node) => {
          // Process ATX headings (# style)
          if (node.type.name.startsWith("ATXHeading")) {
            this.processHeading(view, node, cursorPos, decorations);
          }

          // Process strong emphasis (bold: **text**)
          if (node.type.name === "StrongEmphasis") {
            this.processStrongEmphasis(node, cursorPos, decorations);
          }

          // Process emphasis (italic: *text* or _text_)
          if (node.type.name === "Emphasis") {
            this.processEmphasis(node, cursorPos, decorations);
          }
        },
      });

      // Sort decorations by position and add to builder
      decorations.sort((a, b) => a.from - b.from);
      for (const { from, to, decoration } of decorations) {
        builder.add(from, to, decoration);
      }

      return builder.finish();
    }

    /**
     * Process heading nodes to hide # marks and apply heading styles
     */
    processHeading(
      view: EditorView,
      node: { type: { name: string }; from: number; to: number; node: any },
      cursorPos: number,
      decorations: Array<{ from: number; to: number; decoration: Decoration }>
    ) {
      const { from, to } = node;

      // Extract heading level from node name (ATXHeading1 -> 1)
      const levelMatch = node.type.name.match(/ATXHeading(\d)/);
      if (!levelMatch) return;

      const level = parseInt(levelMatch[1]);
      const isCursorOnLine = isCursorOnSameLine(view, from, cursorPos);

      // Get the actual syntax tree node to find HeaderMark children
      const treeNode = node.node;

      // Find and hide HeaderMark (the # characters) when cursor is not on the line
      if (!isCursorOnLine && treeNode) {
        let headerMarkFrom: number | null = null;
        let headerMarkTo: number | null = null;

        // Iterate through children to find HeaderMark
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

        // Hide all # characters at once (including the space after them)
        if (headerMarkFrom !== null && headerMarkTo !== null) {
          // Also hide the space after # marks
          const textAfterMarks = view.state.doc.sliceString(
            headerMarkTo,
            headerMarkTo + 1
          );
          const hideEnd = textAfterMarks === " " ? headerMarkTo + 1 : headerMarkTo;

          decorations.push({
            from: headerMarkFrom,
            to: hideEnd,
            decoration: Decoration.replace({}),
          });

          // Apply heading style to the rest of the line (content only)
          decorations.push({
            from: hideEnd,
            to: to,
            decoration: Decoration.mark({ class: `cm-h${level}` }),
          });
        }
      } else if (isCursorOnLine) {
        // Even when cursor is on the line, apply styling to the content (after # marks)
        // but don't hide the # characters
        let contentFrom = from;

        // Find where content starts (after HeaderMark)
        if (treeNode) {
          for (
            let child = treeNode.firstChild;
            child;
            child = child.nextSibling
          ) {
            if (child.type.name === "HeaderMark") {
              contentFrom = child.to;
              // Skip space after #
              const textAfter = view.state.doc.sliceString(
                contentFrom,
                contentFrom + 1
              );
              if (textAfter === " ") {
                contentFrom++;
              }
              break;
            }
          }
        }

        // Apply heading style to content
        if (contentFrom < to) {
          decorations.push({
            from: contentFrom,
            to: to,
            decoration: Decoration.mark({ class: `cm-h${level}` }),
          });
        }
      }
    }

    /**
     * Process bold text (**text**) to hide ** marks and apply bold style
     */
    processStrongEmphasis(
      node: { from: number; to: number },
      cursorPos: number,
      decorations: Array<{ from: number; to: number; decoration: Decoration }>
    ) {
      const { from, to } = node;
      const isNearby = isCursorNearby(cursorPos, from, to);

      if (!isNearby) {
        // Hide opening **
        decorations.push({
          from: from,
          to: from + 2,
          decoration: Decoration.replace({}),
        });

        // Hide closing **
        decorations.push({
          from: to - 2,
          to: to,
          decoration: Decoration.replace({}),
        });

        // Apply bold style to content
        decorations.push({
          from: from + 2,
          to: to - 2,
          decoration: Decoration.mark({ class: "cm-strong" }),
        });
      }
    }

    /**
     * Process italic text (*text* or _text_) to hide * marks and apply italic style
     */
    processEmphasis(
      node: { from: number; to: number },
      cursorPos: number,
      decorations: Array<{ from: number; to: number; decoration: Decoration }>
    ) {
      const { from, to } = node;
      const isNearby = isCursorNearby(cursorPos, from, to);

      if (!isNearby) {
        // Hide opening * or _
        decorations.push({
          from: from,
          to: from + 1,
          decoration: Decoration.replace({}),
        });

        // Hide closing * or _
        decorations.push({
          from: to - 1,
          to: to,
          decoration: Decoration.replace({}),
        });

        // Apply italic style to content
        decorations.push({
          from: from + 1,
          to: to - 1,
          decoration: Decoration.mark({ class: "cm-emphasis" }),
        });
      }
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

/**
 * Create the markdown styling extension for live preview
 * Uses dynamic syntax theme that respects CSS variables
 */
export function createMarkdownStylingExtension(): Extension {
  return [livePreviewPlugin, createDynamicSyntaxTheme()];
}
