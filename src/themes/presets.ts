import type { Theme } from "../types/theme";

export const darkTheme: Theme = {
  name: "Dark",
  version: "1.0",
  author: "Open Note",
  colors: {
    background: {
      primary: "#111827",
      secondary: "#1f2937",
      tertiary: "#374151",
    },
    text: {
      primary: "#f3f4f6",
      secondary: "#d1d5db",
      muted: "#9ca3af",
    },
    border: {
      default: "#374151",
      focus: "#3b82f6",
    },
    accent: {
      primary: "#3b82f6",
      primaryHover: "#2563eb",
      danger: "#ef4444",
      dangerHover: "#dc2626",
      success: "#22c55e",
      warning: "#eab308",
    },
    editor: {
      background: "#1f2937",
      gutter: "#1e293b",
      cursor: "#f3f4f6",
      selection: "rgba(59, 130, 246, 0.3)",
      placeholder: "#64748b",
    },
    syntax: {
      heading1: "#f1f5f9",
      heading2: "#e2e8f0",
      heading3: "#cbd5e1",
      heading4: "#94a3b8",
      link: "#7dd3fc",
      code: "#fbbf24",
      codeBg: "rgba(175, 184, 193, 0.15)",
      quote: "#6366f1",
      quoteBg: "rgba(99, 102, 241, 0.05)",
      hr: "#374151",
    },
    unsavedDot: "#3b82f6",
  },
};

export const lightTheme: Theme = {
  name: "Light",
  version: "1.0",
  author: "Open Note",
  colors: {
    background: {
      primary: "#ffffff",
      secondary: "#f3f4f6",
      tertiary: "#e5e7eb",
    },
    text: {
      primary: "#111827",
      secondary: "#374151",
      muted: "#6b7280",
    },
    border: {
      default: "#d1d5db",
      focus: "#3b82f6",
    },
    accent: {
      primary: "#2563eb",
      primaryHover: "#1d4ed8",
      danger: "#dc2626",
      dangerHover: "#b91c1c",
      success: "#16a34a",
      warning: "#ca8a04",
    },
    editor: {
      background: "#ffffff",
      gutter: "#f3f4f6",
      cursor: "#111827",
      selection: "rgba(59, 130, 246, 0.2)",
      placeholder: "#9ca3af",
    },
    syntax: {
      heading1: "#0f172a",
      heading2: "#1e293b",
      heading3: "#334155",
      heading4: "#475569",
      link: "#0284c7",
      code: "#b45309",
      codeBg: "rgba(175, 184, 193, 0.2)",
      quote: "#7c3aed",
      quoteBg: "rgba(124, 58, 237, 0.05)",
      hr: "#d1d5db",
    },
    unsavedDot: "#2563eb",
  },
};

export const builtInThemes: Record<string, Theme> = {
  dark: darkTheme,
  light: lightTheme,
};

export function getBuiltInTheme(id: string): Theme | undefined {
  return builtInThemes[id];
}

export function isBuiltInTheme(id: string): boolean {
  return id in builtInThemes;
}
