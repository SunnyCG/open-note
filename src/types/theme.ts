// Theme type definitions for Open Note

export interface ThemeColors {
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  border: {
    default: string;
    focus: string;
  };
  accent: {
    primary: string;
    primaryHover: string;
    danger: string;
    dangerHover: string;
    success: string;
    warning: string;
  };
  editor: {
    background: string;
    gutter: string;
    cursor: string;
    selection: string;
    placeholder: string;
  };
  syntax: {
    heading1: string;
    heading2: string;
    heading3: string;
    heading4: string;
    link: string;
    code: string;
    codeBg: string;
    quote: string;
    quoteBg: string;
    hr: string;
  };
  unsavedDot: string;
}

export interface Theme {
  name: string;
  version: string;
  author?: string;
  colors: ThemeColors;
}

export type BuiltInThemeId = "dark" | "light";

export interface ThemeState {
  currentThemeId: BuiltInThemeId | string; // "dark", "light", or custom theme name
  currentTheme: Theme;
  customThemes: Theme[];
}

export interface ThemeContextType extends ThemeState {
  setTheme: (themeId: BuiltInThemeId | string) => void;
  applyCustomTheme: (theme: Theme) => void;
  importTheme: (filePath: string) => Promise<boolean>;
  exportTheme: (filePath: string) => Promise<boolean>;
  deleteTheme: (themeName: string) => Promise<boolean>;
  loadCustomThemes: () => Promise<void>;
}
