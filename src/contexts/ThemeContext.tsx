import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Theme, BuiltInThemeId, ThemeContextType } from "../types/theme";
import { getBuiltInTheme, isBuiltInTheme, builtInThemes } from "../themes/presets";
import { listCustomThemes, importTheme as importThemeApi, exportTheme as exportThemeApi, deleteCustomTheme as deleteCustomThemeApi } from "../lib/notes";

const THEME_STORAGE_KEY = "open-note-theme";

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentThemeId, setCurrentThemeId] = useState<string>("dark");
  const [currentTheme, setCurrentTheme] = useState<Theme>(builtInThemes.dark);
  const [customThemes, setCustomThemes] = useState<Theme[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Apply theme to CSS variables
  const applyTheme = useCallback((theme: Theme, themeId: string) => {
    const root = document.documentElement;

    // Background colors
    root.style.setProperty("--bg-primary", theme.colors.background.primary);
    root.style.setProperty("--bg-secondary", theme.colors.background.secondary);
    root.style.setProperty("--bg-tertiary", theme.colors.background.tertiary);

    // Text colors
    root.style.setProperty("--text-primary", theme.colors.text.primary);
    root.style.setProperty("--text-secondary", theme.colors.text.secondary);
    root.style.setProperty("--text-muted", theme.colors.text.muted);

    // Border colors
    root.style.setProperty("--border-default", theme.colors.border.default);
    root.style.setProperty("--border-focus", theme.colors.border.focus);

    // Accent colors
    root.style.setProperty("--accent-primary", theme.colors.accent.primary);
    root.style.setProperty("--accent-primary-hover", theme.colors.accent.primaryHover);
    root.style.setProperty("--accent-danger", theme.colors.accent.danger);
    root.style.setProperty("--accent-danger-hover", theme.colors.accent.dangerHover);
    root.style.setProperty("--accent-success", theme.colors.accent.success);
    root.style.setProperty("--accent-warning", theme.colors.accent.warning);

    // Editor colors
    root.style.setProperty("--editor-bg", theme.colors.editor.background);
    root.style.setProperty("--editor-gutter", theme.colors.editor.gutter);
    root.style.setProperty("--editor-cursor", theme.colors.editor.cursor);
    root.style.setProperty("--editor-selection", theme.colors.editor.selection);
    root.style.setProperty("--editor-placeholder", theme.colors.editor.placeholder);

    // Syntax colors
    root.style.setProperty("--syntax-heading1", theme.colors.syntax.heading1);
    root.style.setProperty("--syntax-heading2", theme.colors.syntax.heading2);
    root.style.setProperty("--syntax-heading3", theme.colors.syntax.heading3);
    root.style.setProperty("--syntax-heading4", theme.colors.syntax.heading4);
    root.style.setProperty("--syntax-link", theme.colors.syntax.link);
    root.style.setProperty("--syntax-code", theme.colors.syntax.code);
    root.style.setProperty("--syntax-code-bg", theme.colors.syntax.codeBg);
    root.style.setProperty("--syntax-quote", theme.colors.syntax.quote);
    root.style.setProperty("--syntax-quote-bg", theme.colors.syntax.quoteBg);
    root.style.setProperty("--syntax-hr", theme.colors.syntax.hr);

    // Unsaved dot
    root.style.setProperty("--unsaved-dot", theme.colors.unsavedDot);

    // Update data-theme attribute for CSS selectors
    if (isBuiltInTheme(themeId)) {
      root.setAttribute("data-theme", themeId);
    } else {
      root.setAttribute("data-theme", "custom");
    }
  }, []);

  // Load custom themes from backend
  const loadCustomThemes = useCallback(async () => {
    try {
      const result = await listCustomThemes();
      if (result.success && result.data) {
        setCustomThemes(result.data);
      }
    } catch (error) {
      console.error("Failed to load custom themes:", error);
    }
  }, []);

  // Load theme from storage on mount
  useEffect(() => {
    const initTheme = async () => {
      // Load custom themes first
      await loadCustomThemes();

      // Then load saved theme preference
      const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedThemeId) {
        if (isBuiltInTheme(savedThemeId)) {
          const theme = getBuiltInTheme(savedThemeId);
          if (theme) {
            setCurrentThemeId(savedThemeId);
            setCurrentTheme(theme);
          }
        }
        // Custom themes will be loaded after loadCustomThemes completes
      }

      setIsLoaded(true);
    };

    initTheme();
  }, [loadCustomThemes]);

  // Apply saved custom theme after custom themes are loaded
  useEffect(() => {
    if (!isLoaded || customThemes.length === 0) return;

    const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedThemeId && !isBuiltInTheme(savedThemeId)) {
      const customTheme = customThemes.find(t => t.name === savedThemeId);
      if (customTheme) {
        setCurrentThemeId(savedThemeId);
        setCurrentTheme(customTheme);
      }
    }
  }, [isLoaded, customThemes]);

  // Apply theme whenever it changes
  useEffect(() => {
    if (isLoaded) {
      applyTheme(currentTheme, currentThemeId);
    }
  }, [currentTheme, currentThemeId, applyTheme, isLoaded]);

  // Set theme by ID
  const setTheme = useCallback((themeId: BuiltInThemeId | string) => {
    if (isBuiltInTheme(themeId)) {
      const theme = getBuiltInTheme(themeId);
      if (theme) {
        setCurrentThemeId(themeId);
        setCurrentTheme(theme);
        localStorage.setItem(THEME_STORAGE_KEY, themeId);
      }
    } else {
      // Look for custom theme
      const customTheme = customThemes.find(t => t.name === themeId);
      if (customTheme) {
        setCurrentThemeId(themeId);
        setCurrentTheme(customTheme);
        localStorage.setItem(THEME_STORAGE_KEY, themeId);
      }
    }
  }, [customThemes]);

  // Apply a custom theme directly
  const applyCustomTheme = useCallback((theme: Theme) => {
    setCurrentThemeId(theme.name);
    setCurrentTheme(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme.name);
  }, []);

  // Import theme from file
  const importTheme = useCallback(async (filePath: string): Promise<boolean> => {
    try {
      const result = await importThemeApi(filePath);
      if (result.success && result.data) {
        // Add to custom themes
        setCustomThemes(prev => {
          // Avoid duplicates
          if (prev.some(t => t.name === result.data!.name)) {
            return prev;
          }
          return [...prev, result.data!];
        });
        return true;
      }
      console.error("Failed to import theme:", result.error);
      return false;
    } catch (error) {
      console.error("Failed to import theme:", error);
      return false;
    }
  }, []);

  // Export theme to file
  const exportTheme = useCallback(async (filePath: string): Promise<boolean> => {
    try {
      const result = await exportThemeApi(currentTheme, filePath);
      if (result.success) {
        return true;
      }
      console.error("Failed to export theme:", result.error);
      return false;
    } catch (error) {
      console.error("Failed to export theme:", error);
      return false;
    }
  }, [currentTheme]);

  // Delete a custom theme
  const deleteTheme = useCallback(async (themeName: string): Promise<boolean> => {
    try {
      const result = await deleteCustomThemeApi(themeName);
      if (result.success) {
        setCustomThemes(prev => prev.filter(t => t.name !== themeName));
        // If the deleted theme was active, switch to dark
        if (currentThemeId === themeName) {
          setTheme("dark");
        }
        return true;
      }
      console.error("Failed to delete theme:", result.error);
      return false;
    } catch (error) {
      console.error("Failed to delete theme:", error);
      return false;
    }
  }, [currentThemeId, setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        currentThemeId,
        currentTheme,
        customThemes,
        setTheme,
        applyCustomTheme,
        importTheme,
        exportTheme,
        deleteTheme,
        loadCustomThemes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
