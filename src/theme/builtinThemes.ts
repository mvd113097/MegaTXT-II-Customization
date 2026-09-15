import header from "../assets/images/reference_exact/header_exact.png";
import cat from "../assets/images/reference_exact/footer_cat_exact.png";
import complete from "../assets/images/reference_exact/complete_vignette_exact.png";
import uploadFooter from "../assets/images/reference_exact/upload_footer_exact.png";
import background from "../assets/images/reference_exact/header_exact.png";

import previewSakura from "../assets/images/design_sakura_storybook_1789398197680.jpg";
import previewMidnight from "../assets/images/design_midnight_orchid_1789398213488.jpg";
import previewEditorial from "../assets/images/design_cozy_editorial_1789398228460.jpg";
import previewCelestial from "../assets/images/theme_celestial_lotus_1789399211892.jpg";
import previewMatcha from "../assets/images/theme_matcha_tea_1789399226753.jpg";
import previewCrimson from "../assets/images/theme_crimson_dynasty_1789399240459.jpg";

import type { ThemeManifest, InstalledTheme } from "./themeTypes";

export const BUILTIN_MANIFESTS: ThemeManifest[] = [
  {
    schema: "megatext-theme",
    schemaVersion: 1,
    id: "storybook",
    name: "Sakura Storybook",
    version: "1.0.0",
    author: "MegaTXT",
    description: "Soft watercolor mountains, pagodas, sakura and the sleepy reading cat.",
    colors: {
      background: "#FAF8FE",
      surface: "#FFFFFF",
      surfaceAlt: "#F7F1FF",
      text: "#241838",
      mutedText: "#635178",
      primary: "#8B5CF6",
      primaryStrong: "#7C3AED",
      accent: "#F472B6",
      border: "#E9DDF7",
      ring: "#C4B5FD",
    },
    radius: "soft",
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
    assets: { header: "header", cat: "cat", complete: "complete", background: "background", preview: "preview" },
  },
  {
    schema: "megatext-theme",
    schemaVersion: 1,
    id: "midnight-ink",
    name: "Midnight Orchid & Pagoda",
    version: "1.0.0",
    author: "MegaTXT",
    description: "Deep midnight plum & luminous violet fantasy night mode.",
    colors: {
      background: "#0E0A1A",
      surface: "#1A142E",
      surfaceAlt: "#251D3E",
      text: "#FDF4F8",
      mutedText: "#D1C5E2",
      primary: "#C084FC",
      primaryStrong: "#A855F7",
      accent: "#F472B6",
      border: "rgba(192, 132, 252, 0.24)",
      ring: "#C084FC",
    },
    radius: "rounded",
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
    assets: { header: "header", cat: "cat", complete: "complete", background: "background", preview: "preview" },
  },
  {
    schema: "megatext-theme",
    schemaVersion: 1,
    id: "sakura-dawn",
    name: "Cozy Editorial & Rose Cream",
    version: "1.0.0",
    author: "MegaTXT",
    description: "Warm blush-rose & editorial cream reading atmosphere.",
    colors: {
      background: "#FFF8FA",
      surface: "#FFFFFF",
      surfaceAlt: "#FFF0F5",
      text: "#3A2830",
      mutedText: "#8D707C",
      primary: "#DB5A8A",
      primaryStrong: "#C63E72",
      accent: "#F59EBC",
      border: "#F3D5E0",
      ring: "#F3A7C0",
    },
    radius: "soft",
    fontFamily: "Georgia, Cambria, 'Times New Roman', serif",
    assets: { preview: "preview" },
  },
  {
    schema: "megatext-theme",
    schemaVersion: 1,
    id: "celestial-lotus",
    name: "Celestial Lotus & Starlight",
    version: "1.0.0",
    author: "MegaTXT",
    description: "Dreamy periwinkle blue, starlight cyan, and ethereal water ripples.",
    colors: {
      background: "#F0F7FF",
      surface: "#FFFFFF",
      surfaceAlt: "#E6F0FF",
      text: "#1E293B",
      mutedText: "#64748B",
      primary: "#6366F1",
      primaryStrong: "#4F46E5",
      accent: "#38BDF8",
      border: "#DCE7F5",
      ring: "#818CF8",
    },
    radius: "rounded",
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
    assets: { preview: "preview" },
  },
  {
    schema: "megatext-theme",
    schemaVersion: 1,
    id: "matcha-bamboo",
    name: "Matcha Tea & Bamboo Garden",
    version: "1.0.0",
    author: "MegaTXT",
    description: "Soothing sage green, matcha cream, and tranquil herbal tones.",
    colors: {
      background: "#F4F9F4",
      surface: "#FFFFFF",
      surfaceAlt: "#E8F3E8",
      text: "#1C3326",
      mutedText: "#5B7567",
      primary: "#059669",
      primaryStrong: "#047857",
      accent: "#34D399",
      border: "#D1E5D6",
      ring: "#6EE7B7",
    },
    radius: "soft",
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
    assets: { preview: "preview" },
  },
  {
    schema: "megatext-theme",
    schemaVersion: 1,
    id: "crimson-dynasty",
    name: "Crimson Palace & Imperial Gold",
    version: "1.0.0",
    author: "MegaTXT",
    description: "Deep imperial wine crimson, ornate dark silk, and radiant amber gold.",
    colors: {
      background: "#140B10",
      surface: "#1F1219",
      surfaceAlt: "#2D1A25",
      text: "#FFF1F2",
      mutedText: "#E2B7C1",
      primary: "#E11D48",
      primaryStrong: "#BE123C",
      accent: "#F59E0B",
      border: "rgba(245, 158, 11, 0.28)",
      ring: "#F59E0B",
    },
    radius: "rounded",
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
    assets: { preview: "preview" },
  },
];

export const BUILTIN_ASSETS: Record<string, Record<string, string>> = {
  storybook: { header, cat, complete, background, uploadFooter, preview: previewSakura },
  "midnight-ink": { header, cat, complete, background, uploadFooter, preview: previewMidnight },
  "sakura-dawn": { preview: previewEditorial },
  "celestial-lotus": { preview: previewCelestial },
  "matcha-bamboo": { preview: previewMatcha },
  "crimson-dynasty": { preview: previewCrimson },
};

export function createBuiltinThemes(): InstalledTheme[] {
  return BUILTIN_MANIFESTS.map((manifest) => ({
    ...manifest,
    builtIn: true,
    installedAt: 0,
    assetUrls: { ...(BUILTIN_ASSETS[manifest.id] || {}) },
  }));
}
