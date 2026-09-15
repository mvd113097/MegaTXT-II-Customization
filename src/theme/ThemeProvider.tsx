import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { BUILTIN_ASSETS, createBuiltinThemes } from "./builtinThemes";
import { exportThemeZip, importThemeZip, loadInstalledThemes, removeStoredTheme } from "./themeStorage";
import type { InstalledTheme } from "./themeTypes";
import { loadAppearanceConfig, applyAppearanceToDOM } from "./visualAppearance";

interface ThemeContextValue {
  themes: InstalledTheme[];
  activeTheme: InstalledTheme;
  setActiveTheme: (id: string) => void;
  importTheme: (file: File) => Promise<InstalledTheme>;
  deleteTheme: (id: string) => Promise<void>;
  exportTheme: (theme: InstalledTheme) => Promise<Blob>;
  ready: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const ACTIVE_KEY = "megatext_active_theme_v1";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themes, setThemes] = useState<InstalledTheme[]>(() => createBuiltinThemes());
  const [activeId, setActiveId] = useState(() => localStorage.getItem(ACTIVE_KEY) || "storybook");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    loadInstalledThemes().then((stored) => {
      if (!alive) return;
      setThemes([...createBuiltinThemes(), ...stored]);
      setReady(true);
    }).catch(() => setReady(true));
    return () => { alive = false; };
  }, []);

  const activeTheme = useMemo(() => themes.find((t) => t.id === activeId) || themes[0], [themes, activeId]);

  useEffect(() => {
    if (!activeTheme) return;
    const root = document.documentElement;
    root.dataset.megatextTheme = activeTheme.id;
    if (activeTheme.assetUrls.scene) root.dataset.megatextThemeScene = "true";
    else delete root.dataset.megatextThemeScene;

    const applyThemeTokens = () => {
      const isDark = root.classList.contains("dark");

      let bg = activeTheme.colors.background;
      let surface = activeTheme.colors.surface;
      let surfaceAlt = activeTheme.colors.surfaceAlt;
      let text = activeTheme.colors.text;
      let muted = activeTheme.colors.mutedText;
      let border = activeTheme.colors.border;
      let ring = activeTheme.colors.ring;
      let primary = activeTheme.colors.primary;
      let primaryStrong = activeTheme.colors.primaryStrong;
      let accent = activeTheme.colors.accent;

      if (isDark) {
        if (activeTheme.id === "midnight-ink" || activeTheme.id === "crimson-dynasty") {
          // Native dark themes keep their bespoke rich dark colors
          bg = activeTheme.colors.background;
          surface = activeTheme.colors.surface;
          surfaceAlt = activeTheme.colors.surfaceAlt;
          text = activeTheme.colors.text;
          muted = activeTheme.colors.mutedText;
          border = activeTheme.colors.border;
          ring = activeTheme.colors.ring;
          primary = activeTheme.colors.primary;
          primaryStrong = activeTheme.colors.primaryStrong;
          accent = activeTheme.colors.accent;
        } else {
          // Adapt light themes smoothly when user toggles dark mode
          bg = "#0E0A1A";
          surface = "#1A142E";
          surfaceAlt = "#251D3E";
          text = "#FDF4F8";
          muted = "#D1C5E2";
          border = "rgba(192, 132, 252, 0.24)";
          ring = activeTheme.colors.ring || "#C084FC";
          primary = activeTheme.colors.primary;
          primaryStrong = activeTheme.colors.primaryStrong;
          accent = activeTheme.colors.accent;
        }
      } else {
        if (activeTheme.id === "storybook") {
          text = "#241838"; // Deep plum-slate for pristine crisp contrast in light mode
          muted = "#635178";
          border = "#E8DDF7";
        }
      }

      root.style.setProperty("--mx-bg", bg);
      root.style.setProperty("--mx-surface", surface);
      root.style.setProperty("--mx-surface-alt", surfaceAlt);
      root.style.setProperty("--mx-text", text);
      root.style.setProperty("--mx-muted", muted);
      root.style.setProperty("--mx-primary", primary);
      root.style.setProperty("--mx-primary-strong", primaryStrong);
      root.style.setProperty("--mx-accent", accent);
      root.style.setProperty("--mx-border", border);
      root.style.setProperty("--mx-ring", ring);
      root.style.setProperty("--mx-radius", activeTheme.radius === "sharp" ? "12px" : activeTheme.radius === "rounded" ? "18px" : "26px");
      root.style.setProperty("--mx-font", activeTheme.fontFamily || "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif");
      root.style.setProperty("--mx-header-image", activeTheme.assetUrls.header ? `url("${activeTheme.assetUrls.header}")` : "none");
      root.style.setProperty("--mx-background-image", activeTheme.assetUrls.background ? `url("${activeTheme.assetUrls.background}")` : "none");
      root.style.setProperty("--mx-scene-image", activeTheme.assetUrls.scene ? `url("${activeTheme.assetUrls.scene}")` : "none");
      root.style.setProperty("--mx-cat-image", activeTheme.assetUrls.cat ? `url("${activeTheme.assetUrls.cat}")` : "none");
      
      // Re-apply live customizable appearance over the active theme base
      applyAppearanceToDOM(loadAppearanceConfig());
    };

    applyThemeTokens();
    localStorage.setItem(ACTIVE_KEY, activeTheme.id);

    const handleAppearanceEvent = (e: any) => {
      if (e.detail) {
        applyAppearanceToDOM(e.detail);
      }
    };
    window.addEventListener("megatext_appearance_changed", handleAppearanceEvent);

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "attributes" && m.attributeName === "class") {
          applyThemeTokens();
        }
      }
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => {
      window.removeEventListener("megatext_appearance_changed", handleAppearanceEvent);
      observer.disconnect();
    };
  }, [activeTheme]);

  const value = useMemo<ThemeContextValue>(() => ({
    themes,
    activeTheme,
    ready,
    setActiveTheme: (id) => setActiveId(id),
    importTheme: async (file) => {
      const imported = await importThemeZip(file);
      setThemes((prev) => [...prev.filter((t) => t.id !== imported.id), imported]);
      setActiveId(imported.id);
      return imported;
    },
    deleteTheme: async (id) => {
      const theme = themes.find((t) => t.id === id);
      if (!theme || theme.builtIn) return;
      Object.values(theme.assetUrls || {}).forEach((url: string) => URL.revokeObjectURL(url));
      await removeStoredTheme(id);
      setThemes((prev) => prev.filter((t) => t.id !== id));
      if (activeId === id) setActiveId("storybook");
    },
    exportTheme: exportThemeZip,
  }), [themes, activeTheme, ready, activeId]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemes() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useThemes must be used inside ThemeProvider");
  return value;
}
