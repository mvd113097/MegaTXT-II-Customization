import React from "react";

export interface IndividualCardConfig {
  enabled: boolean;
  bgMode?: "inherit" | "custom" | "solid";
  customColor?: string; // hex
  backgroundColor?: string; // alias for customColor
  opacity?: number; // 0 - 100 (%)
  blur?: number; // 0 - 30 (px)
  borderMode?: "inherit" | "custom" | "none";
  borderColor?: string;
  borderWidth?: number; // 0, 1, 2, 3, 4 px
  radius?: "inherit" | "sleek" | "standard" | "rounded" | "ultra" | "pill" | string;
  borderRadius?: "inherit" | "sleek" | "standard" | "rounded" | "ultra" | "pill" | string; // alias
  padding?: "inherit" | "compact" | "standard" | "relaxed" | "spacious" | string;
  shadow?: "inherit" | "none" | "subtle" | "medium" | "deep" | "neon-glow" | string;
}

export interface SavedUserPreset {
  id: string;
  name: string;
  createdAt: number;
  config: VisualAppearanceConfig;
}

export type UserSavedPreset = SavedUserPreset;

export interface VisualAppearanceConfig {
  // Card transparency & Glass
  cardOpacity: number; // 0 - 100 (%)
  cardBlur: number; // 0 - 30 (px)
  subcardOpacity: number; // 0 - 100 (%)
  subcardBlur: number; // 0 - 20 (px)
  cardTint: "default" | "clear" | "dark-smoke" | "sakura" | "emerald" | "amber" | "cyber" | "solid" | "custom";
  cardCustomColor?: string; // hex
  
  // Card dimensions & geometry
  cardMaxWidth: "narrow" | "standard" | "wide" | "ultrawide" | "full";
  cardPadding: "compact" | "standard" | "relaxed" | "spacious";
  cardRadius: "sleek" | "standard" | "rounded" | "ultra" | "pill";
  cardBorder: "glass" | "subtle" | "glow" | "none" | "custom";
  cardBorderWidth: number; // 0, 1, 2, 3, 4 px
  cardBorderColor?: string;
  cardShadow: "none" | "subtle" | "medium" | "deep" | "neon-glow";

  // Individual Card Specific Customizations
  completeCard?: IndividualCardConfig; // Specifically requested to change Complete card color/outline/size
  progressCard?: IndividualCardConfig; // Progress gauge & metrics card
  headerCard?: IndividualCardConfig;   // Novel header card
  queueCard?: IndividualCardConfig;    // Chapter activity & queue items
  uploadCard?: IndividualCardConfig;   // Upload dropzone & sample loader
  individualCards?: { [key: string]: Partial<IndividualCardConfig> };

  // Typography & Font Colors
  fontFamily: "system" | "modern" | "serif" | "mono" | "rounded";
  fontScale: number; // 85 - 130 (%)
  fontWeight: "normal" | "medium" | "bold" | "black";
  fontColorMode: "adaptive" | "white" | "dark" | "sakura" | "gold" | "cyan" | "emerald" | "custom";
  customFontColor?: string;
  customHeadingColor?: string;
  customAccentColor?: string;
  textShadow: "none" | "subtle" | "crisp" | "glow";
  highContrastText: boolean;

  // Buttons
  buttonTheme: "sakura" | "royal-violet" | "cyber-neon" | "crimson-gold" | "emerald" | "sunset" | "stealth" | "custom";
  buttonGradientStart?: string;
  buttonGradientEnd?: string;
  buttonRadius: "pill" | "rounded" | "sleek";
  buttonSize: "compact" | "standard" | "large";
  buttonGlow: boolean;
}

export const DEFAULT_INDIVIDUAL_CARD: IndividualCardConfig = {
  enabled: false,
  bgMode: "inherit",
  customColor: "#10b981",
  opacity: 45,
  blur: 16,
  borderMode: "inherit",
  borderColor: "#10b981",
  borderWidth: 1,
  radius: "inherit",
  padding: "inherit",
  shadow: "inherit",
};

export const DEFAULT_APPEARANCE: VisualAppearanceConfig = {
  // Card Glass
  cardOpacity: 35,
  cardBlur: 16,
  subcardOpacity: 25,
  subcardBlur: 10,
  cardTint: "default",
  cardCustomColor: "#8b5cf6",

  // Geometry
  cardMaxWidth: "standard",
  cardPadding: "standard",
  cardRadius: "rounded",
  cardBorder: "glass",
  cardBorderWidth: 1,
  cardBorderColor: "#ffffff",
  cardShadow: "medium",

  // Individual Card Defaults
  completeCard: {
    enabled: false,
    bgMode: "custom",
    customColor: "#10b981",
    opacity: 50,
    blur: 16,
    borderMode: "custom",
    borderColor: "#34d399",
    borderWidth: 1,
    radius: "inherit",
    padding: "inherit",
    shadow: "inherit",
  },
  progressCard: {
    enabled: false,
    bgMode: "inherit",
    customColor: "#6366f1",
    opacity: 35,
    blur: 16,
    borderMode: "inherit",
    borderColor: "#ffffff",
    borderWidth: 1,
    radius: "inherit",
    padding: "inherit",
    shadow: "inherit",
  },
  headerCard: {
    enabled: false,
    bgMode: "inherit",
    customColor: "#8b5cf6",
    opacity: 35,
    blur: 16,
    borderMode: "inherit",
    borderColor: "#ffffff",
    borderWidth: 1,
    radius: "inherit",
    padding: "inherit",
    shadow: "inherit",
  },
  queueCard: {
    enabled: false,
    bgMode: "inherit",
    customColor: "#ec4899",
    opacity: 30,
    blur: 14,
    borderMode: "inherit",
    borderColor: "#ffffff",
    borderWidth: 1,
    radius: "inherit",
    padding: "inherit",
    shadow: "inherit",
  },
  uploadCard: {
    enabled: false,
    bgMode: "inherit",
    customColor: "#8b5cf6",
    opacity: 35,
    blur: 16,
    borderMode: "inherit",
    borderColor: "#ffffff",
    borderWidth: 1,
    radius: "inherit",
    padding: "inherit",
    shadow: "inherit",
  },

  // Typography
  fontFamily: "system",
  fontScale: 100,
  fontWeight: "medium",
  fontColorMode: "adaptive",
  customFontColor: "#ffffff",
  customHeadingColor: "#ffffff",
  customAccentColor: "#f472b6",
  textShadow: "subtle",
  highContrastText: true,

  // Buttons
  buttonTheme: "sakura",
  buttonGradientStart: "#9333ea",
  buttonGradientEnd: "#ec4899",
  buttonRadius: "rounded",
  buttonSize: "standard",
  buttonGlow: true,
};

const STORAGE_KEY = "megatext_visual_appearance_v2";
const SAVED_COLORS_KEY = "megatext_custom_saved_colors_v1";
const SAVED_PRESETS_KEY = "megatext_user_saved_presets_v1";

let appearanceSyncTimer: any = null;

export function syncSiteAppearanceToServer(partialData: {
  config?: VisualAppearanceConfig;
  customBg?: string;
  bgBlur?: number;
  bgOpacity?: number;
  savedColors?: string[];
  theme?: "light" | "dark";
}) {
  if (appearanceSyncTimer) {
    clearTimeout(appearanceSyncTimer);
  }
  appearanceSyncTimer = setTimeout(async () => {
    try {
      await fetch("/api/site-appearance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partialData),
      });
    } catch (err) {
      console.warn("Could not sync appearance to server:", err);
    }
  }, 300);
}

export const DEFAULT_SAVED_COLORS: string[] = [
  "#8b5cf6", // Purple
  "#ec4899", // Sakura Pink
  "#10b981", // Emerald Mint
  "#06b6d4", // Cyber Cyan
  "#f59e0b", // Golden Amber
  "#3b82f6", // Royal Blue
  "#ef4444", // Crimson Rose
  "#ffffff", // Clean White
  "#0f172a", // Obsidian Dark
  "#4f46e5", // Indigo
  "#14b8a6", // Teal
  "#e11d48", // Rose Red
];

export function loadSavedCustomColors(): string[] {
  try {
    const saved = localStorage.getItem(SAVED_COLORS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to load saved custom colors:", e);
  }
  return DEFAULT_SAVED_COLORS;
}

export function saveCustomColorToPalette(hex: string): string[] {
  try {
    const current = loadSavedCustomColors();
    const cleanHex = hex.trim().toLowerCase();
    if (!current.some((c) => c.toLowerCase() === cleanHex)) {
      const updated = [cleanHex, ...current].slice(0, 32); // Keep up to 32 saved colors
      localStorage.setItem(SAVED_COLORS_KEY, JSON.stringify(updated));
      syncSiteAppearanceToServer({ savedColors: updated });
      return updated;
    }
    return current;
  } catch (e) {
    console.warn("Failed to save custom color:", e);
    return DEFAULT_SAVED_COLORS;
  }
}

export function deleteCustomColorFromPalette(hex: string): string[] {
  try {
    const current = loadSavedCustomColors();
    const cleanHex = hex.trim().toLowerCase();
    const updated = current.filter((c) => c.toLowerCase() !== cleanHex);
    localStorage.setItem(SAVED_COLORS_KEY, JSON.stringify(updated));
    syncSiteAppearanceToServer({ savedColors: updated });
    return updated;
  } catch (e) {
    console.warn("Failed to delete custom color:", e);
    return DEFAULT_SAVED_COLORS;
  }
}

export function loadSavedUserPresets(): SavedUserPreset[] {
  try {
    const saved = localStorage.getItem(SAVED_PRESETS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to load saved user presets:", e);
  }
  return [];
}

export function saveUserPreset(name: string, config: VisualAppearanceConfig): SavedUserPreset[] {
  try {
    const current = loadSavedUserPresets();
    const newPreset: SavedUserPreset = {
      id: "preset_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      name: name.trim() || `My Setup #${current.length + 1}`,
      createdAt: Date.now(),
      config: JSON.parse(JSON.stringify(config)),
    };
    const updated = [newPreset, ...current];
    localStorage.setItem(SAVED_PRESETS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn("Failed to save user preset:", e);
    return loadSavedUserPresets();
  }
}

export function deleteUserPreset(id: string): SavedUserPreset[] {
  try {
    const current = loadSavedUserPresets();
    const updated = current.filter((p) => p.id !== id);
    localStorage.setItem(SAVED_PRESETS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn("Failed to delete user preset:", e);
    return loadSavedUserPresets();
  }
}

export function loadAppearanceConfig(): VisualAppearanceConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_APPEARANCE, ...JSON.parse(saved) };
    }
    // Fallback check v1
    const v1Saved = localStorage.getItem("megatext_visual_appearance_v1");
    if (v1Saved) {
      return { ...DEFAULT_APPEARANCE, ...JSON.parse(v1Saved) };
    }
  } catch (e) {
    console.warn("Failed to load appearance config:", e);
  }
  return DEFAULT_APPEARANCE;
}

export function saveAppearanceConfig(config: VisualAppearanceConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    applyAppearanceToDOM(config);
    window.dispatchEvent(new CustomEvent("megatext_appearance_changed", { detail: config }));
    syncSiteAppearanceToServer({ config });
  } catch (e) {
    console.warn("Failed to save appearance config:", e);
  }
}

// Convert hex to rgb helper
function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return `${r}, ${g}, ${b}`;
  } else if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  }
  return "255, 255, 255";
}

export function applyAppearanceToDOM(config: VisualAppearanceConfig): void {
  const root = document.documentElement;
  const isDark = root.classList.contains("dark");

  // 1. Card Background & Opacity
  const opacityRatio = Math.max(0, Math.min(100, config.cardOpacity)) / 100;
  const subcardOpacityRatio = Math.max(0, Math.min(100, config.subcardOpacity)) / 100;

  let tintRgbLight = "255, 255, 255";
  let tintRgbDark = "15, 12, 28";

  switch (config.cardTint) {
    case "clear":
      tintRgbLight = "255, 255, 255";
      tintRgbDark = "0, 0, 0";
      break;
    case "dark-smoke":
      tintRgbLight = "20, 18, 30";
      tintRgbDark = "10, 8, 18";
      break;
    case "sakura":
      tintRgbLight = "255, 240, 246";
      tintRgbDark = "32, 14, 26";
      break;
    case "emerald":
      tintRgbLight = "240, 253, 244";
      tintRgbDark = "10, 28, 20";
      break;
    case "amber":
      tintRgbLight = "255, 251, 235";
      tintRgbDark = "30, 22, 10";
      break;
    case "cyber":
      tintRgbLight = "238, 247, 255";
      tintRgbDark = "8, 20, 36";
      break;
    case "solid":
      tintRgbLight = "255, 255, 255";
      tintRgbDark = "18, 14, 30";
      break;
    case "custom":
      if (config.cardCustomColor) {
        const rgb = hexToRgb(config.cardCustomColor);
        tintRgbLight = rgb;
        tintRgbDark = rgb;
      }
      break;
    default:
      tintRgbLight = "255, 255, 255";
      tintRgbDark = "15, 12, 28";
      break;
  }

  const activeTintRgb = isDark ? tintRgbDark : tintRgbLight;

  root.style.setProperty("--custom-card-bg", `rgba(${activeTintRgb}, ${config.cardTint === "solid" ? 0.96 : opacityRatio})`);
  root.style.setProperty("--custom-subcard-bg", `rgba(${activeTintRgb}, ${config.cardTint === "solid" ? 0.85 : subcardOpacityRatio})`);
  root.style.setProperty("--custom-card-blur", `${config.cardBlur}px`);
  root.style.setProperty("--custom-subcard-blur", `${config.subcardBlur}px`);

  // 2. Card Dimensions & Geometry (Width, Padding, Radius)
  switch (config.cardMaxWidth) {
    case "narrow":
      root.style.setProperty("--custom-app-max-width", "380px");
      break;
    case "wide":
      root.style.setProperty("--custom-app-max-width", "560px");
      break;
    case "ultrawide":
      root.style.setProperty("--custom-app-max-width", "680px");
      break;
    case "full":
      root.style.setProperty("--custom-app-max-width", "100%");
      break;
    case "standard":
    default:
      root.style.setProperty("--custom-app-max-width", "460px");
      break;
  }

  switch (config.cardPadding) {
    case "compact":
      root.style.setProperty("--custom-card-padding", "10px 14px");
      root.style.setProperty("--custom-card-gap", "10px");
      break;
    case "relaxed":
      root.style.setProperty("--custom-card-padding", "22px 24px");
      root.style.setProperty("--custom-card-gap", "18px");
      break;
    case "spacious":
      root.style.setProperty("--custom-card-padding", "28px 30px");
      root.style.setProperty("--custom-card-gap", "22px");
      break;
    case "standard":
    default:
      root.style.setProperty("--custom-card-padding", "16px 20px");
      root.style.setProperty("--custom-card-gap", "14px");
      break;
  }

  switch (config.cardRadius) {
    case "sleek":
      root.style.setProperty("--custom-card-radius", "14px");
      break;
    case "standard":
      root.style.setProperty("--custom-card-radius", "20px");
      break;
    case "ultra":
      root.style.setProperty("--custom-card-radius", "36px");
      break;
    case "pill":
      root.style.setProperty("--custom-card-radius", "48px");
      break;
    case "rounded":
    default:
      root.style.setProperty("--custom-card-radius", "28px");
      break;
  }

  // 3. Card Border & Shadow
  const bWidth = config.cardBorderWidth !== undefined ? config.cardBorderWidth : 1;
  root.style.setProperty("--custom-card-border-width", `${bWidth}px`);

  if (bWidth === 0 || config.cardBorder === "none") {
    root.style.setProperty("--custom-card-border", "transparent");
  } else if (config.cardBorder === "custom" && config.cardBorderColor) {
    root.style.setProperty("--custom-card-border", config.cardBorderColor);
  } else if (config.cardBorder === "glow") {
    root.style.setProperty("--custom-card-border", isDark ? "rgba(236, 72, 153, 0.6)" : "rgba(236, 72, 153, 0.7)");
  } else if (config.cardBorder === "subtle") {
    root.style.setProperty("--custom-card-border", isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.35)");
  } else {
    // glass default
    root.style.setProperty("--custom-card-border", isDark ? "rgba(255, 255, 255, 0.18)" : "rgba(255, 255, 255, 0.75)");
  }

  switch (config.cardShadow) {
    case "none":
      root.style.setProperty("--custom-card-shadow", "none");
      break;
    case "subtle":
      root.style.setProperty("--custom-card-shadow", isDark ? "0 6px 20px rgba(0,0,0,0.3)" : "0 6px 20px rgba(139,92,246,0.06)");
      break;
    case "deep":
      root.style.setProperty("--custom-card-shadow", isDark ? "0 24px 60px rgba(0,0,0,0.75), 0 0 1px rgba(255,255,255,0.2)" : "0 24px 50px rgba(99, 102, 241, 0.2), 0 0 1px rgba(255,255,255,0.9)");
      break;
    case "neon-glow":
      root.style.setProperty("--custom-card-shadow", isDark ? "0 0 35px rgba(236, 72, 153, 0.4), 0 16px 40px rgba(0,0,0,0.8)" : "0 0 30px rgba(236, 72, 153, 0.35), 0 16px 40px rgba(139,92,246,0.15)");
      break;
    case "medium":
    default:
      root.style.setProperty("--custom-card-shadow", isDark ? "0 16px 40px rgba(0,0,0,0.55), inset 0 1px 1px rgba(255,255,255,0.1)" : "0 16px 40px rgba(139, 92, 246, 0.12), inset 0 1px 2px rgba(255,255,255,0.9)");
      break;
  }

  // 4. Typography & Font Styling
  switch (config.fontFamily) {
    case "modern":
      root.style.setProperty("--custom-font-family", "'Inter', system-ui, -apple-system, sans-serif");
      break;
    case "serif":
      root.style.setProperty("--custom-font-family", "Georgia, Cambria, 'Times New Roman', serif");
      break;
    case "mono":
      root.style.setProperty("--custom-font-family", "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace");
      break;
    case "rounded":
      root.style.setProperty("--custom-font-family", "'Quicksand', 'Nunito', 'Segoe UI', system-ui, sans-serif");
      break;
    case "system":
    default:
      root.style.setProperty("--custom-font-family", "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif");
      break;
  }

  const fontScale = config.fontScale ? config.fontScale / 100 : 1;
  root.style.setProperty("--custom-font-scale", `${fontScale}`);
  root.style.fontSize = `${16 * fontScale}px`;

  switch (config.fontWeight) {
    case "normal":
      root.style.setProperty("--custom-font-weight-body", "400");
      root.style.setProperty("--custom-font-weight-heading", "600");
      break;
    case "bold":
      root.style.setProperty("--custom-font-weight-body", "600");
      root.style.setProperty("--custom-font-weight-heading", "800");
      break;
    case "black":
      root.style.setProperty("--custom-font-weight-body", "700");
      root.style.setProperty("--custom-font-weight-heading", "900");
      break;
    case "medium":
    default:
      root.style.setProperty("--custom-font-weight-body", "500");
      root.style.setProperty("--custom-font-weight-heading", "700");
      break;
  }

  // 5. Font Colors
  let primaryTextColor = "";
  let headingTextColor = "";
  let accentTextColor = "";
  let mutedTextColor = "";
  let subtleTextColor = "";

  switch (config.fontColorMode) {
    case "white":
      primaryTextColor = "#ffffff";
      headingTextColor = "#ffffff";
      accentTextColor = "#fbcfe8";
      mutedTextColor = "rgba(255, 255, 255, 0.82)";
      subtleTextColor = "rgba(255, 255, 255, 0.65)";
      break;
    case "dark":
      primaryTextColor = "#0f172a";
      headingTextColor = "#020617";
      accentTextColor = "#7c3aed";
      mutedTextColor = "rgba(15, 23, 42, 0.82)";
      subtleTextColor = "rgba(15, 23, 42, 0.65)";
      break;
    case "sakura":
      primaryTextColor = isDark ? "#fce7f3" : "#831843";
      headingTextColor = isDark ? "#ffffff" : "#701a75";
      accentTextColor = "#ec4899";
      mutedTextColor = isDark ? "rgba(252, 231, 243, 0.82)" : "rgba(131, 24, 67, 0.82)";
      subtleTextColor = isDark ? "rgba(252, 231, 243, 0.65)" : "rgba(131, 24, 67, 0.65)";
      break;
    case "gold":
      primaryTextColor = isDark ? "#fef3c7" : "#78350f";
      headingTextColor = isDark ? "#fbbf24" : "#92400e";
      accentTextColor = "#f59e0b";
      mutedTextColor = isDark ? "rgba(254, 243, 199, 0.82)" : "rgba(120, 53, 15, 0.82)";
      subtleTextColor = isDark ? "rgba(254, 243, 199, 0.65)" : "rgba(120, 53, 15, 0.65)";
      break;
    case "cyan":
      primaryTextColor = isDark ? "#cffafe" : "#164e63";
      headingTextColor = isDark ? "#67e8f9" : "#0e7490";
      accentTextColor = "#06b6d4";
      mutedTextColor = isDark ? "rgba(207, 250, 254, 0.82)" : "rgba(22, 78, 99, 0.82)";
      subtleTextColor = isDark ? "rgba(207, 250, 254, 0.65)" : "rgba(22, 78, 99, 0.65)";
      break;
    case "emerald":
      primaryTextColor = isDark ? "#d1fae5" : "#064e3b";
      headingTextColor = isDark ? "#6ee7b7" : "#065f46";
      accentTextColor = "#10b981";
      mutedTextColor = isDark ? "rgba(209, 250, 229, 0.82)" : "rgba(6, 78, 59, 0.82)";
      subtleTextColor = isDark ? "rgba(209, 250, 229, 0.65)" : "rgba(6, 78, 59, 0.65)";
      break;
    case "custom": {
      primaryTextColor = config.customFontColor || "#ffffff";
      headingTextColor = config.customHeadingColor || primaryTextColor;
      accentTextColor = config.customAccentColor || "#f472b6";
      const pRgb = hexToRgb(primaryTextColor);
      mutedTextColor = `rgba(${pRgb}, 0.82)`;
      subtleTextColor = `rgba(${pRgb}, 0.65)`;
      break;
    }
    case "adaptive":
    default:
      primaryTextColor = isDark ? "#f8fafc" : "#1e1b4b";
      headingTextColor = isDark ? "#ffffff" : "#0f0c29";
      accentTextColor = isDark ? "#f472b6" : "#9333ea";
      mutedTextColor = isDark ? "rgba(248, 250, 252, 0.80)" : "rgba(30, 27, 75, 0.75)";
      subtleTextColor = isDark ? "rgba(248, 250, 252, 0.60)" : "rgba(30, 27, 75, 0.55)";
      break;
  }

  root.style.setProperty("--custom-text-primary", primaryTextColor);
  root.style.setProperty("--custom-text-heading", headingTextColor);
  root.style.setProperty("--custom-text-accent", accentTextColor);
  root.style.setProperty("--custom-text-muted", mutedTextColor);
  root.style.setProperty("--custom-text-subtle", subtleTextColor);

  // Text Shadow / Glow
  switch (config.textShadow) {
    case "none":
      root.style.setProperty("--custom-text-shadow", "none");
      root.style.setProperty("--custom-heading-shadow", "none");
      break;
    case "crisp":
      root.style.setProperty("--custom-text-shadow", "0 1px 2px rgba(0, 0, 0, 0.8), 0 0 1px rgba(0, 0, 0, 0.9)");
      root.style.setProperty("--custom-heading-shadow", "0 2px 4px rgba(0, 0, 0, 0.9), 0 0 2px rgba(0, 0, 0, 0.9)");
      break;
    case "glow":
      root.style.setProperty("--custom-text-shadow", "0 0 10px rgba(236, 72, 153, 0.6), 0 1px 3px rgba(0, 0, 0, 0.8)");
      root.style.setProperty("--custom-heading-shadow", "0 0 16px rgba(168, 85, 247, 0.8), 0 2px 4px rgba(0, 0, 0, 0.9)");
      break;
    case "subtle":
    default:
      root.style.setProperty("--custom-text-shadow", isDark ? "0 1px 2px rgba(0, 0, 0, 0.6)" : "0 1px 2px rgba(255, 255, 255, 0.8)");
      root.style.setProperty("--custom-heading-shadow", isDark ? "0 1px 3px rgba(0, 0, 0, 0.8)" : "0 1px 2px rgba(255, 255, 255, 0.9)");
      break;
  }

  // 6. Button Gradients & Themes
  let btnStart = "#9333ea";
  let btnEnd = "#ec4899";

  switch (config.buttonTheme) {
    case "royal-violet":
      btnStart = "#7c3aed";
      btnEnd = "#4f46e5";
      break;
    case "cyber-neon":
      btnStart = "#06b6d4";
      btnEnd = "#3b82f6";
      break;
    case "crimson-gold":
      btnStart = "#dc2626";
      btnEnd = "#d97706";
      break;
    case "emerald":
      btnStart = "#059669";
      btnEnd = "#0d9488";
      break;
    case "sunset":
      btnStart = "#f97316";
      btnEnd = "#db2777";
      break;
    case "stealth":
      btnStart = isDark ? "#334155" : "#1e293b";
      btnEnd = isDark ? "#1e293b" : "#0f172a";
      break;
    case "custom":
      btnStart = config.buttonGradientStart || "#9333ea";
      btnEnd = config.buttonGradientEnd || "#ec4899";
      break;
    case "sakura":
    default:
      btnStart = "#9333ea";
      btnEnd = "#ec4899";
      break;
  }

  root.style.setProperty("--custom-btn-gradient", `linear-gradient(to right, ${btnStart}, ${btnEnd})`);
  root.style.setProperty("--custom-btn-color-start", btnStart);
  root.style.setProperty("--custom-btn-color-end", btnEnd);

  // Button radius
  switch (config.buttonRadius) {
    case "pill":
      root.style.setProperty("--custom-btn-radius", "9999px");
      break;
    case "sleek":
      root.style.setProperty("--custom-btn-radius", "10px");
      break;
    case "rounded":
    default:
      root.style.setProperty("--custom-btn-radius", "18px");
      break;
  }

  // Button padding / size
  switch (config.buttonSize) {
    case "compact":
      root.style.setProperty("--custom-btn-padding", "10px 16px");
      root.style.setProperty("--custom-btn-font-size", "13px");
      break;
    case "large":
      root.style.setProperty("--custom-btn-padding", "18px 24px");
      root.style.setProperty("--custom-btn-font-size", "16px");
      break;
    case "standard":
    default:
      root.style.setProperty("--custom-btn-padding", "14px 20px");
      root.style.setProperty("--custom-btn-font-size", "14px");
      break;
  }

  // High contrast text mode
  if (config.highContrastText) {
    root.dataset.highContrastText = "true";
  } else {
    delete root.dataset.highContrastText;
  }

  // 7. Individual Card Overrides (Complete card, Progress card, Header card, Queue cards, Upload card)
  applyIndividualCardVars(root, "complete", config.completeCard || config.individualCards?.complete, config, isDark);
  applyIndividualCardVars(root, "progress", config.progressCard || config.individualCards?.progress, config, isDark);
  applyIndividualCardVars(root, "header", config.headerCard || config.individualCards?.header, config, isDark);
  applyIndividualCardVars(root, "queue", config.queueCard || config.individualCards?.queue, config, isDark);
  applyIndividualCardVars(root, "upload", config.uploadCard || config.individualCards?.upload, config, isDark);
}

function applyIndividualCardVars(
  root: HTMLElement,
  prefix: string,
  cardConfig: Partial<IndividualCardConfig> | undefined,
  globalConfig: VisualAppearanceConfig,
  isDark: boolean
): void {
  const resolved = cardConfig || globalConfig.individualCards?.[prefix];
  if (!resolved || !resolved.enabled) {
    root.style.setProperty(`--card-${prefix}-bg`, "var(--custom-card-bg)");
    root.style.setProperty(`--card-${prefix}-blur`, "var(--custom-card-blur)");
    root.style.setProperty(`--card-${prefix}-border`, "var(--custom-card-border)");
    root.style.setProperty(`--card-${prefix}-border-width`, "var(--custom-card-border-width, 1px)");
    root.style.setProperty(`--card-${prefix}-radius`, "var(--custom-card-radius)");
    root.style.setProperty(`--card-${prefix}-padding`, "var(--custom-card-padding)");
    root.style.setProperty(`--card-${prefix}-shadow`, "var(--custom-card-shadow)");
    return;
  }

  // Background & Opacity (Supports hex, rgba, and customColor / backgroundColor aliases)
  const color = resolved.customColor || resolved.backgroundColor;
  if (color) {
    const op = (resolved.opacity !== undefined ? resolved.opacity : globalConfig.cardOpacity) / 100;
    if (color.startsWith("#")) {
      const rgb = hexToRgb(color);
      root.style.setProperty(`--card-${prefix}-bg`, `rgba(${rgb}, ${op})`);
    } else if (color.startsWith("rgba")) {
      root.style.setProperty(`--card-${prefix}-bg`, color);
    } else if (color.startsWith("rgb")) {
      // Convert rgb(r, g, b) to rgba(r, g, b, op)
      const match = color.match(/\(([^)]+)\)/);
      if (match) {
        root.style.setProperty(`--card-${prefix}-bg`, `rgba(${match[1]}, ${op})`);
      } else {
        root.style.setProperty(`--card-${prefix}-bg`, color);
      }
    } else {
      const rgb = hexToRgb(color);
      root.style.setProperty(`--card-${prefix}-bg`, `rgba(${rgb}, ${op})`);
    }
  } else {
    root.style.setProperty(`--card-${prefix}-bg`, "var(--custom-card-bg)");
  }

  // Blur
  const blurVal = resolved.blur !== undefined ? resolved.blur : globalConfig.cardBlur;
  root.style.setProperty(`--card-${prefix}-blur`, `${blurVal}px`);

  // Border & Outline Color
  const bw = resolved.borderWidth !== undefined ? resolved.borderWidth : (globalConfig.cardBorderWidth || 1);
  if (resolved.borderMode === "none" || bw === 0) {
    root.style.setProperty(`--card-${prefix}-border`, "transparent");
    root.style.setProperty(`--card-${prefix}-border-width`, "0px");
  } else if (resolved.borderColor) {
    root.style.setProperty(`--card-${prefix}-border`, resolved.borderColor);
    root.style.setProperty(`--card-${prefix}-border-width`, `${bw}px`);
  } else {
    root.style.setProperty(`--card-${prefix}-border`, "var(--custom-card-border)");
    root.style.setProperty(`--card-${prefix}-border-width`, `${bw}px`);
  }

  // Radius
  const rad = resolved.radius || resolved.borderRadius;
  if (rad && rad !== "inherit") {
    switch (rad) {
      case "sleek":
        root.style.setProperty(`--card-${prefix}-radius`, "14px");
        break;
      case "standard":
        root.style.setProperty(`--card-${prefix}-radius`, "20px");
        break;
      case "ultra":
        root.style.setProperty(`--card-${prefix}-radius`, "36px");
        break;
      case "pill":
        root.style.setProperty(`--card-${prefix}-radius`, "48px");
        break;
      case "rounded":
      default:
        root.style.setProperty(`--card-${prefix}-radius`, "28px");
        break;
    }
  } else {
    root.style.setProperty(`--card-${prefix}-radius`, "var(--custom-card-radius)");
  }

  // Padding / Size
  const pad = resolved.padding;
  if (pad && pad !== "inherit") {
    switch (pad) {
      case "compact":
        root.style.setProperty(`--card-${prefix}-padding`, "10px 14px");
        break;
      case "relaxed":
        root.style.setProperty(`--card-${prefix}-padding`, "22px 24px");
        break;
      case "spacious":
        root.style.setProperty(`--card-${prefix}-padding`, "28px 30px");
        break;
      case "standard":
      default:
        root.style.setProperty(`--card-${prefix}-padding`, "16px 20px");
        break;
    }
  } else {
    root.style.setProperty(`--card-${prefix}-padding`, "var(--custom-card-padding)");
  }

  // Shadow
  const sh = resolved.shadow;
  if (sh && sh !== "inherit") {
    switch (sh) {
      case "none":
        root.style.setProperty(`--card-${prefix}-shadow`, "none");
        break;
      case "subtle":
        root.style.setProperty(
          `--card-${prefix}-shadow`,
          isDark ? "0 6px 20px rgba(0,0,0,0.3)" : "0 6px 20px rgba(139,92,246,0.06)"
        );
        break;
      case "deep":
        root.style.setProperty(
          `--card-${prefix}-shadow`,
          isDark ? "0 24px 60px rgba(0,0,0,0.75)" : "0 24px 50px rgba(99, 102, 241, 0.2)"
        );
        break;
      case "neon-glow":
      case "glow": {
        const glowCol = resolved.customColor || resolved.backgroundColor || "#ec4899";
        root.style.setProperty(
          `--card-${prefix}-shadow`,
          `0 0 25px ${glowCol}80, 0 10px 25px rgba(0,0,0,0.4)`
        );
        break;
      }
      case "medium":
      default:
        root.style.setProperty(
          `--card-${prefix}-shadow`,
          isDark ? "0 16px 40px rgba(0,0,0,0.55)" : "0 16px 40px rgba(139,92,246,0.12)"
        );
        break;
    }
  } else {
    root.style.setProperty(`--card-${prefix}-shadow`, "var(--custom-card-shadow)");
  }
}
