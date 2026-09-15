import React, { useState } from "react";
import {
  Sparkles,
  Sliders,
  Check,
  RotateCcw,
  Eye,
  Layers,
  Square,
  Circle,
  Zap,
  BookOpen,
  FileText,
  BookCheck,
  Clock,
  Play,
  UploadCloud,
  ChevronDown,
  Maximize2,
  Minimize2,
  Type,
  Palette,
  Maximize,
  Layout,
  Sun,
  Moon,
  MoveHorizontal,
  Scissors,
} from "lucide-react";
import {
  VisualAppearanceConfig,
  DEFAULT_APPEARANCE,
  loadAppearanceConfig,
  saveAppearanceConfig,
  loadSavedCustomColors,
} from "../theme/visualAppearance";
import { WholeSiteLivePreview } from "./appearance/WholeSiteLivePreview";
import { IndividualCardCustomizer } from "./appearance/IndividualCardCustomizer";
import { SavedPresetsManager } from "./appearance/SavedPresetsManager";
import { CustomColorPalettePicker } from "./appearance/CustomColorPalettePicker";

export const AppearanceCustomizer: React.FC = () => {
  const [config, setConfig] = useState<VisualAppearanceConfig>(() => loadAppearanceConfig());
  const [savedColors, setSavedColors] = useState<string[]>(() => loadSavedCustomColors());
  const [showSavedNotification, setShowSavedNotification] = useState(false);
  const [previewTab, setPreviewTab] = useState<"translation" | "upload" | "complete">("translation");
  const [isPreviewCompact, setIsPreviewCompact] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"all" | "individual" | "presets" | "cards" | "typography" | "buttons">("individual");

  // Apply changes immediately and save
  const updateConfig = (newConfig: VisualAppearanceConfig) => {
    setConfig(newConfig);
    saveAppearanceConfig(newConfig);
    setShowSavedNotification(true);
    setTimeout(() => setShowSavedNotification(false), 2000);
  };

  // Keep state in sync with external updates (e.g., cross-device sync)
  React.useEffect(() => {
    const handleAppearanceChange = () => {
      setConfig(loadAppearanceConfig());
      setSavedColors(loadSavedCustomColors());
    };
    window.addEventListener("megatext_appearance_changed", handleAppearanceChange);
    return () => {
      window.removeEventListener("megatext_appearance_changed", handleAppearanceChange);
    };
  }, []);

  const handleReset = () => {
    updateConfig(DEFAULT_APPEARANCE);
  };

  const applyPreset = (preset: Partial<VisualAppearanceConfig>) => {
    updateConfig({
      ...config,
      ...preset,
    });
  };

  const buttonPresets = [
    { id: "sakura", name: "Sakura Pink", start: "#9333ea", end: "#ec4899" },
    { id: "royal-violet", name: "Royal Violet", start: "#7c3aed", end: "#4f46e5" },
    { id: "cyber-neon", name: "Cyber Neon", start: "#06b6d4", end: "#3b82f6" },
    { id: "crimson-gold", name: "Crimson Gold", start: "#dc2626", end: "#d97706" },
    { id: "emerald", name: "Emerald Forest", start: "#059669", end: "#0d9488" },
    { id: "sunset", name: "Sunset Flame", start: "#f97316", end: "#db2777" },
    { id: "stealth", name: "Obsidian Slate", start: "#334155", end: "#0f172a" },
  ];

  const tintOptions: { id: VisualAppearanceConfig["cardTint"]; name: string; desc: string; preview: string }[] = [
    { id: "default", name: "Frosted Glass", desc: "Neutral translucent glass", preview: "rgba(255,255,255,0.4)" },
    { id: "clear", name: "Crystal Clear", desc: "Maximum wallpaper view", preview: "rgba(255,255,255,0.12)" },
    { id: "dark-smoke", name: "Dark Smoke", desc: "Sleek night acrylic", preview: "rgba(20,18,30,0.6)" },
    { id: "sakura", name: "Sakura Bloom", desc: "Soft rose & lavender", preview: "rgba(255,235,245,0.45)" },
    { id: "emerald", name: "Jade Mint", desc: "Fresh emerald glow", preview: "rgba(235,253,240,0.45)" },
    { id: "amber", name: "Golden Amber", desc: "Warm golden glow", preview: "rgba(255,248,230,0.45)" },
    { id: "cyber", name: "Cyber Cyan", desc: "Digital luminous blue", preview: "rgba(230,246,255,0.45)" },
    { id: "solid", name: "Solid Clean", desc: "100% Opaque cards", preview: "#ffffff" },
    { id: "custom", name: "Custom Color", desc: "Choose your own tint", preview: config.cardCustomColor || "#8b5cf6" },
  ];

  const fontColorPresets: { id: VisualAppearanceConfig["fontColorMode"]; name: string; sample: string; text: string }[] = [
    { id: "adaptive", name: "Adaptive", sample: "bg-slate-800 dark:bg-white", text: "Auto Light/Dark" },
    { id: "white", name: "Crisp White", sample: "bg-white text-slate-900", text: "Sharp White #FFF" },
    { id: "dark", name: "Deep Dark", sample: "bg-slate-950 text-white", text: "Deep Obsidian #0F172A" },
    { id: "sakura", name: "Sakura Plum", sample: "bg-pink-600 text-white", text: "Rose & Plum" },
    { id: "gold", name: "Golden Glow", sample: "bg-amber-500 text-white", text: "Golden Amber" },
    { id: "cyan", name: "Cyber Cyan", sample: "bg-cyan-500 text-white", text: "Electric Cyan" },
    { id: "emerald", name: "Emerald Mint", sample: "bg-emerald-600 text-white", text: "Jade Forest" },
    { id: "custom", name: "Custom Color", sample: "bg-purple-600 text-white", text: "Custom Hex Picker" },
  ];

  const fontFamilies: { id: VisualAppearanceConfig["fontFamily"]; name: string; desc: string; sample: string }[] = [
    { id: "system", name: "System Default", desc: "Standard native OS font", sample: "MegaText 123" },
    { id: "modern", name: "Modern Sans (Inter)", desc: "Ultra clean & geometric", sample: "MegaText 123" },
    { id: "rounded", name: "Soft Rounded", desc: "Friendly & cozy curves", sample: "MegaText 123" },
    { id: "serif", name: "Editorial Serif", desc: "Classic literary aesthetic", sample: "MegaText 123" },
    { id: "mono", name: "Code Monospace", desc: "Technical terminal style", sample: "MegaText 123" },
  ];

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-200">
      {/* ALWAYS VISIBLE STICKY WHOLE-SITE LIVE PREVIEW */}
      <div className="sticky -top-4 sm:-top-6 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md pt-1 pb-3 -mx-4 sm:-mx-6 px-4 sm:px-6 border-b border-purple-100/80 dark:border-purple-900/60 shadow-sm">
        <WholeSiteLivePreview config={config} showNotification={showSavedNotification} />
      </div>

      {/* QUICK CATEGORY NAV FILTER */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveCategory("individual")}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
            activeCategory === "individual"
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-purple-50 dark:bg-slate-800 text-slate-700 dark:text-purple-300 hover:bg-purple-100"
          }`}
        >
          🗂️ Individual Cards (Complete, etc.)
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory("presets")}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
            activeCategory === "presets"
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-purple-50 dark:bg-slate-800 text-slate-700 dark:text-purple-300 hover:bg-purple-100"
          }`}
        >
          ⚡ Saved Setups & Presets
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory("cards")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeCategory === "cards"
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-purple-50 dark:bg-slate-800 text-slate-700 dark:text-purple-300 hover:bg-purple-100"
          }`}
        >
          🪟 Global Cards & Glass
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory("typography")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeCategory === "typography"
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-purple-50 dark:bg-slate-800 text-slate-700 dark:text-purple-300 hover:bg-purple-100"
          }`}
        >
          ✍️ Font Colors & Text
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory("buttons")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeCategory === "buttons"
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-purple-50 dark:bg-slate-800 text-slate-700 dark:text-purple-300 hover:bg-purple-100"
          }`}
        >
          ✨ Buttons & Accents
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeCategory === "all"
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-purple-50 dark:bg-slate-800 text-slate-700 dark:text-purple-300 hover:bg-purple-100"
          }`}
        >
          All Settings
        </button>
      </div>

      {/* INDIVIDUAL CARD CUSTOMIZER */}
      {(activeCategory === "all" || activeCategory === "individual") && (
        <IndividualCardCustomizer
          config={config}
          onUpdateConfig={updateConfig}
          savedColors={savedColors}
          onSavedColorsChange={setSavedColors}
        />
      )}

      {/* SAVED PRESETS MANAGER */}
      {(activeCategory === "all" || activeCategory === "presets") && (
        <SavedPresetsManager
          currentConfig={config}
          onApplyPreset={updateConfig}
        />
      )}

      {/* 2. CARD TRANSPARENCY, SIZE, WIDTH & GEOMETRY */}
      {(activeCategory === "all" || activeCategory === "cards") && (
        <div className="space-y-4 rounded-3xl border border-purple-100 dark:border-purple-900/50 bg-white/60 dark:bg-slate-800/40 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-2 border-b border-purple-100 dark:border-purple-900/60 pb-2">
            <Layout className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Card Dimensions, Size & Transparency
            </h3>
          </div>

          {/* Card Max Width (Layout Scale) */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">
              <span className="flex items-center gap-1.5">
                <MoveHorizontal className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span>Card Width & Layout Scale</span>
              </span>
              <span className="font-extrabold text-purple-700 dark:text-pink-300 capitalize">
                {config.cardMaxWidth} ({config.cardMaxWidth === "narrow" ? "380px" : config.cardMaxWidth === "standard" ? "460px" : config.cardMaxWidth === "wide" ? "560px" : config.cardMaxWidth === "ultrawide" ? "680px" : "100%"})
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {[
                { id: "narrow", name: "Narrow", desc: "380px (Mobile mini)" },
                { id: "standard", name: "Standard", desc: "460px (Default)" },
                { id: "wide", name: "Wide", desc: "560px (Spacious)" },
                { id: "ultrawide", name: "Ultra-Wide", desc: "680px (Tablet)" },
                { id: "full", name: "Full Screen", desc: "100% Width" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateConfig({ ...config, cardMaxWidth: opt.id as VisualAppearanceConfig["cardMaxWidth"] })}
                  className={`rounded-xl border p-2 text-center transition cursor-pointer ${
                    config.cardMaxWidth === opt.id
                      ? "border-purple-600 bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 ring-2 ring-purple-400 font-bold"
                      : "border-purple-200 dark:border-purple-900/50 bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 text-[11px]"
                  }`}
                >
                  <div className="font-black text-xs">{opt.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Card Padding & Spacing */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Maximize className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span>Card Padding & Density</span>
              </span>
              <span className="font-extrabold text-purple-700 dark:text-pink-300 capitalize">
                {config.cardPadding}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "compact", name: "Compact", desc: "10px padding (dense)" },
                { id: "standard", name: "Standard", desc: "18px padding (balanced)" },
                { id: "relaxed", name: "Relaxed", desc: "24px padding (roomy)" },
                { id: "spacious", name: "Spacious", desc: "30px padding (airy)" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateConfig({ ...config, cardPadding: opt.id as VisualAppearanceConfig["cardPadding"] })}
                  className={`rounded-xl border p-2.5 text-left transition cursor-pointer ${
                    config.cardPadding === opt.id
                      ? "border-purple-600 bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 ring-2 ring-purple-400"
                      : "border-purple-200 dark:border-purple-900/50 bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="font-black text-xs">{opt.name}</div>
                  <div className="text-[9px] text-slate-500 dark:text-purple-300/70">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Card Corner Curvature / Radius */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">
              <span>Card Corner Curvature (Radius)</span>
              <span className="font-extrabold text-purple-700 dark:text-pink-300 capitalize">
                {config.cardRadius} ({config.cardRadius === "sleek" ? "14px" : config.cardRadius === "standard" ? "20px" : config.cardRadius === "rounded" ? "28px" : config.cardRadius === "ultra" ? "36px" : "48px"})
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {[
                { id: "sleek", name: "Sleek (14px)" },
                { id: "standard", name: "Normal (20px)" },
                { id: "rounded", name: "Rounded (28px)" },
                { id: "ultra", name: "Ultra (36px)" },
                { id: "pill", name: "Curved Pill (48px)" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateConfig({ ...config, cardRadius: opt.id as VisualAppearanceConfig["cardRadius"] })}
                  className={`rounded-xl border p-2 text-center transition cursor-pointer ${
                    config.cardRadius === opt.id
                      ? "border-purple-600 bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 ring-2 ring-purple-400 font-bold"
                      : "border-purple-200 dark:border-purple-900/50 bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 text-[11px]"
                  }`}
                >
                  <div className="font-black text-xs">{opt.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Card Opacity Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span>Card Glass Transparency / Opacity</span>
              </span>
              <span className="font-extrabold text-purple-700 dark:text-pink-300">
                {config.cardOpacity}% (
                {config.cardOpacity <= 20
                  ? "Crystal Clear"
                  : config.cardOpacity <= 45
                  ? "Translucent Glass"
                  : config.cardOpacity <= 75
                  ? "Frosted Acrylic"
                  : "Semi-Solid"}
                )
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={config.cardOpacity}
              onChange={(e) =>
                updateConfig({
                  ...config,
                  cardOpacity: Number(e.target.value),
                })
              }
              className="w-full accent-purple-600 h-2 bg-purple-200 dark:bg-purple-950 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 dark:text-purple-300/60 mt-1">
              <span>0% (Fully Transparent)</span>
              <span>50%</span>
              <span>100% (Solid)</span>
            </div>
          </div>

          {/* Card Blur Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span>Card Backdrop Frosted Blur</span>
              </span>
              <span className="font-extrabold text-purple-700 dark:text-pink-300">
                {config.cardBlur}px
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="2"
              value={config.cardBlur}
              onChange={(e) =>
                updateConfig({
                  ...config,
                  cardBlur: Number(e.target.value),
                })
              }
              className="w-full accent-purple-600 h-2 bg-purple-200 dark:bg-purple-950 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 dark:text-purple-300/60 mt-1">
              <span>0px (Clear Glass)</span>
              <span>15px (Frosted)</span>
              <span>30px (Deep Blur)</span>
            </div>
          </div>

          {/* Inner Subcard / Dropzone Opacity */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">
              <span>Inner Box / Dropzone Opacity</span>
              <span className="font-extrabold text-purple-700 dark:text-pink-300">
                {config.subcardOpacity}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={config.subcardOpacity}
              onChange={(e) =>
                updateConfig({
                  ...config,
                  subcardOpacity: Number(e.target.value),
                })
              }
              className="w-full accent-purple-600 h-2 bg-purple-200 dark:bg-purple-950 rounded-lg cursor-pointer"
            />
          </div>

          {/* Card Glass Tint */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-2">
              🎨 Card Glass Tint & Atmosphere
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {tintOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateConfig({ ...config, cardTint: opt.id })}
                  className={`rounded-2xl border p-2.5 text-left transition cursor-pointer ${
                    config.cardTint === opt.id
                      ? "border-purple-600 bg-purple-50 dark:bg-purple-950/60 ring-2 ring-purple-400"
                      : "border-purple-200/80 dark:border-purple-900/50 bg-white/60 dark:bg-slate-800/50 hover:border-purple-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                      {opt.name}
                    </span>
                    {config.cardTint === opt.id && (
                      <Check className="h-3.5 w-3.5 text-purple-600 dark:text-pink-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[9px] text-slate-500 dark:text-purple-300/70 mt-0.5">
                    {opt.desc}
                  </p>
                </button>
              ))}
            </div>

            {/* Custom Card Color Picker if custom tint is chosen */}
            {config.cardTint === "custom" && (
              <div className="mt-3 p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                <CustomColorPalettePicker
                  label="Pick & Save Custom Card Tint"
                  value={config.cardCustomColor || "#8b5cf6"}
                  onChange={(color) => updateConfig({ ...config, cardCustomColor: color })}
                  savedColors={savedColors}
                  onSavedColorsChange={setSavedColors}
                />
              </div>
            )}
          </div>

          {/* Border Width & Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-1.5">
                Border Thickness
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 0, name: "0px (None)" },
                  { id: 1, name: "1px (Thin)" },
                  { id: 2, name: "2px (Med)" },
                  { id: 3, name: "3px (Bold)" },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => updateConfig({ ...config, cardBorderWidth: b.id })}
                    className={`rounded-xl border p-2 text-center text-xs font-bold transition cursor-pointer ${
                      config.cardBorderWidth === b.id
                        ? "border-purple-600 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 ring-2 ring-purple-400"
                        : "border-purple-200 dark:border-purple-900/50 bg-white/70 dark:bg-slate-800/70"
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-1.5">
                Border & Glow Style
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: "glass", name: "Crisp Glass" },
                  { id: "glow", name: "Neon Glow" },
                  { id: "subtle", name: "Subtle" },
                  { id: "none", name: "Hidden" },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => updateConfig({ ...config, cardBorder: b.id as VisualAppearanceConfig["cardBorder"] })}
                    className={`rounded-xl border p-2 text-center text-xs font-bold transition cursor-pointer ${
                      config.cardBorder === b.id
                        ? "border-purple-600 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 ring-2 ring-purple-400"
                        : "border-purple-200 dark:border-purple-900/50 bg-white/70 dark:bg-slate-800/70"
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. FONT COLOR, SIZE & TYPOGRAPHY CUSTOMIZER */}
      {(activeCategory === "all" || activeCategory === "typography") && (
        <div className="space-y-4 rounded-3xl border border-purple-100 dark:border-purple-900/50 bg-white/60 dark:bg-slate-800/40 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-2 border-b border-purple-100 dark:border-purple-900/60 pb-2">
            <Type className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Font Color & Typography Customizer
            </h3>
          </div>

          {/* Font Color Palette Presets */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-2">
              🎨 Text & Heading Color Palette
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {fontColorPresets.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => updateConfig({ ...config, fontColorMode: f.id })}
                  className={`rounded-2xl border p-2.5 text-left transition cursor-pointer ${
                    config.fontColorMode === f.id
                      ? "border-purple-600 bg-purple-50 dark:bg-purple-950/60 ring-2 ring-purple-400"
                      : "border-purple-200/80 dark:border-purple-900/50 bg-white/60 dark:bg-slate-800/50 hover:border-purple-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`h-4 w-4 rounded-full ${f.sample} shadow-xs border border-white/40`} />
                    <span className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                      {f.name}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500 dark:text-purple-300/70">
                    {f.text}
                  </p>
                </button>
              ))}
            </div>

            {/* Custom Font Color Pickers if Custom is chosen */}
            {config.fontColorMode === "custom" && (
              <div className="mt-3 p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-3">
                <div className="text-xs font-black text-purple-900 dark:text-purple-200">
                  Custom Text Color Pickers:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <CustomColorPalettePicker
                    label="Body Text Color"
                    value={config.customFontColor || "#ffffff"}
                    onChange={(color) => updateConfig({ ...config, customFontColor: color })}
                    savedColors={savedColors}
                    onSavedColorsChange={setSavedColors}
                  />
                  <CustomColorPalettePicker
                    label="Heading Text Color"
                    value={config.customHeadingColor || "#ffffff"}
                    onChange={(color) => updateConfig({ ...config, customHeadingColor: color })}
                    savedColors={savedColors}
                    onSavedColorsChange={setSavedColors}
                  />
                  <CustomColorPalettePicker
                    label="Accent Text Color"
                    value={config.customAccentColor || "#f472b6"}
                    onChange={(color) => updateConfig({ ...config, customAccentColor: color })}
                    savedColors={savedColors}
                    onSavedColorsChange={setSavedColors}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Font Family Selection */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-2">
              🔤 Font Family & Typography Archetype
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {fontFamilies.map((ff) => (
                <button
                  key={ff.id}
                  type="button"
                  onClick={() => updateConfig({ ...config, fontFamily: ff.id })}
                  className={`rounded-2xl border p-3 text-left transition cursor-pointer flex items-center justify-between ${
                    config.fontFamily === ff.id
                      ? "border-purple-600 bg-purple-50 dark:bg-purple-950/60 ring-2 ring-purple-400"
                      : "border-purple-200/80 dark:border-purple-900/50 bg-white/60 dark:bg-slate-800/50 hover:border-purple-300"
                  }`}
                >
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-slate-100">
                      {ff.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-purple-300/70">
                      {ff.desc}
                    </div>
                  </div>
                  <div className="text-xs font-bold text-purple-600 dark:text-purple-300 bg-purple-100/60 dark:bg-purple-900/40 px-2 py-1 rounded-lg">
                    Aa Bb
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Font Scale Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">
              <span>Font Size & Scale</span>
              <span className="font-extrabold text-purple-700 dark:text-pink-300">
                {config.fontScale || 100}% ({config.fontScale <= 90 ? "Small" : config.fontScale <= 100 ? "Standard" : config.fontScale <= 115 ? "Large" : "Extra Large"})
              </span>
            </div>
            <input
              type="range"
              min="85"
              max="125"
              step="5"
              value={config.fontScale || 100}
              onChange={(e) =>
                updateConfig({
                  ...config,
                  fontScale: Number(e.target.value),
                })
              }
              className="w-full accent-purple-600 h-2 bg-purple-200 dark:bg-purple-950 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 dark:text-purple-300/60 mt-1">
              <span>85% (Compact)</span>
              <span>100% (Standard)</span>
              <span>125% (Large Display)</span>
            </div>
          </div>

          {/* Text Shadow & Halo for Wallpaper Readability */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-2">
              ✨ Text Contour & Readability Shadow
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "none", name: "None", desc: "Flat text" },
                { id: "subtle", name: "Subtle Soft", desc: "Light anti-glare" },
                { id: "crisp", name: "Crisp Outline", desc: "Sharp over bright photos" },
                { id: "glow", name: "Luminous Glow", desc: "Cyber neon halo" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => updateConfig({ ...config, textShadow: s.id as VisualAppearanceConfig["textShadow"] })}
                  className={`rounded-xl border p-2 text-left transition cursor-pointer ${
                    config.textShadow === s.id
                      ? "border-purple-600 bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 ring-2 ring-purple-400"
                      : "border-purple-200 dark:border-purple-900/50 bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="font-black text-xs">{s.name}</div>
                  <div className="text-[9px] text-slate-500 dark:text-purple-300/70">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast Text Mode Toggle */}
          <div className="flex items-center justify-between rounded-2xl border border-purple-100 dark:border-purple-900/40 bg-white/60 dark:bg-slate-800/40 p-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                High-Contrast Text Booster
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-purple-300/70">
                Guarantees readability over complex wallpapers and anime graphics
              </p>
            </div>
            <button
              type="button"
              onClick={() => updateConfig({ ...config, highContrastText: !config.highContrastText })}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 cursor-pointer ${
                config.highContrastText
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "border border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
              }`}
            >
              {config.highContrastText ? "✓ Enabled" : "Off"}
            </button>
          </div>
        </div>
      )}

      {/* 4. BUTTONS & ACCENTS */}
      {(activeCategory === "all" || activeCategory === "buttons") && (
        <div className="space-y-4 rounded-3xl border border-purple-100 dark:border-purple-900/50 bg-white/60 dark:bg-slate-800/40 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-2 border-b border-purple-100 dark:border-purple-900/60 pb-2">
            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Button Gradients, Shapes & Sizes
            </h3>
          </div>

          {/* Button Gradient Color Theme */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-2">
              ✨ Button Color & Gradient Theme
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {buttonPresets.map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() =>
                    updateConfig({
                      ...config,
                      buttonTheme: btn.id as VisualAppearanceConfig["buttonTheme"],
                      buttonGradientStart: btn.start,
                      buttonGradientEnd: btn.end,
                    })
                  }
                  className={`flex items-center gap-2.5 rounded-2xl border p-2.5 text-left transition cursor-pointer ${
                    config.buttonTheme === btn.id
                      ? "border-purple-600 bg-purple-50 dark:bg-purple-950/60 ring-2 ring-purple-400"
                      : "border-purple-200/80 dark:border-purple-900/50 bg-white/60 dark:bg-slate-800/50 hover:border-purple-300"
                  }`}
                >
                  <div
                    className="h-6 w-6 rounded-full shrink-0 shadow-xs"
                    style={{
                      background: `linear-gradient(to right, ${btn.start}, ${btn.end})`,
                    }}
                  />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {btn.name}
                  </span>
                </button>
              ))}

              {/* Custom Button Gradient Option */}
              <button
                type="button"
                onClick={() => updateConfig({ ...config, buttonTheme: "custom" })}
                className={`flex items-center gap-2.5 rounded-2xl border p-2.5 text-left transition cursor-pointer ${
                  config.buttonTheme === "custom"
                    ? "border-purple-600 bg-purple-50 dark:bg-purple-950/60 ring-2 ring-purple-400"
                    : "border-purple-200/80 dark:border-purple-900/50 bg-white/60 dark:bg-slate-800/50 hover:border-purple-300"
                }`}
              >
                <div
                  className="h-6 w-6 rounded-full shrink-0 shadow-xs border border-purple-300"
                  style={{
                    background: `linear-gradient(to right, ${config.buttonGradientStart || "#9333ea"}, ${config.buttonGradientEnd || "#ec4899"})`,
                  }}
                />
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  Custom Colors
                </span>
              </button>
            </div>

            {/* Custom Button Color Pickers */}
            {config.buttonTheme === "custom" && (
              <div className="mt-3 p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <CustomColorPalettePicker
                  label="Gradient Start Color"
                  value={config.buttonGradientStart || "#9333ea"}
                  onChange={(color) => updateConfig({ ...config, buttonGradientStart: color })}
                  savedColors={savedColors}
                  onSavedColorsChange={setSavedColors}
                />
                <CustomColorPalettePicker
                  label="Gradient End Color"
                  value={config.buttonGradientEnd || "#ec4899"}
                  onChange={(color) => updateConfig({ ...config, buttonGradientEnd: color })}
                  savedColors={savedColors}
                  onSavedColorsChange={setSavedColors}
                />
              </div>
            )}
          </div>

          {/* Button Shape & Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-1.5">
                🔲 Button Corner Shape
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => updateConfig({ ...config, buttonRadius: "rounded" })}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    config.buttonRadius === "rounded"
                      ? "border-purple-600 bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 ring-2 ring-purple-400"
                      : "border-purple-200 dark:border-purple-900/50 bg-white/70 dark:bg-slate-800/70"
                  }`}
                >
                  <Square className="h-4 w-4 rounded-md mb-0.5" />
                  <span>Rounded (18px)</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateConfig({ ...config, buttonRadius: "pill" })}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    config.buttonRadius === "pill"
                      ? "border-purple-600 bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 ring-2 ring-purple-400"
                      : "border-purple-200 dark:border-purple-900/50 bg-white/70 dark:bg-slate-800/70"
                  }`}
                >
                  <Circle className="h-4 w-4 mb-0.5" />
                  <span>Full Pill</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateConfig({ ...config, buttonRadius: "sleek" })}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    config.buttonRadius === "sleek"
                      ? "border-purple-600 bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 ring-2 ring-purple-400"
                      : "border-purple-200 dark:border-purple-900/50 bg-white/70 dark:bg-slate-800/70"
                  }`}
                >
                  <Square className="h-4 w-4 rounded-xs mb-0.5" />
                  <span>Sleek (10px)</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-1.5">
                📏 Button Size & Padding
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "compact", name: "Compact" },
                  { id: "standard", name: "Standard" },
                  { id: "large", name: "Large" },
                ].map((bs) => (
                  <button
                    key={bs.id}
                    type="button"
                    onClick={() => updateConfig({ ...config, buttonSize: bs.id as VisualAppearanceConfig["buttonSize"] })}
                    className={`p-2 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                      config.buttonSize === bs.id
                        ? "border-purple-600 bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 ring-2 ring-purple-400"
                        : "border-purple-200 dark:border-purple-900/50 bg-white/70 dark:bg-slate-800/70"
                    }`}
                  >
                    {bs.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset button */}
      <div className="pt-2 border-t border-purple-100 dark:border-purple-900/40 flex justify-between items-center">
        <span className="text-[11px] text-slate-500 dark:text-purple-300/70">
          All changes apply instantly in real-time.
        </span>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-slate-700 transition cursor-pointer shadow-2xs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset to Default Glass</span>
        </button>
      </div>
    </div>
  );
};
