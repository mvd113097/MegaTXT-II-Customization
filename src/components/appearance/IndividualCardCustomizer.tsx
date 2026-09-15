import React, { useState } from "react";
import {
  IndividualCardConfig,
  VisualAppearanceConfig,
} from "../../theme/visualAppearance";
import { CustomColorPalettePicker } from "./CustomColorPalettePicker";
import {
  CheckCircle2,
  PieChart,
  BookOpen,
  ListOrdered,
  UploadCloud,
  Sliders,
  Maximize,
  Square,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  RotateCcw,
} from "lucide-react";

interface IndividualCardCustomizerProps {
  config: VisualAppearanceConfig;
  onUpdateConfig: (updated: VisualAppearanceConfig) => void;
  savedColors: string[];
  onSavedColorsChange: (colors: string[]) => void;
}

type TargetCardKey = "complete" | "progress" | "header" | "queue" | "upload";

export const IndividualCardCustomizer: React.FC<IndividualCardCustomizerProps> = ({
  config,
  onUpdateConfig,
  savedColors,
  onSavedColorsChange,
}) => {
  const [selectedCard, setSelectedCard] = useState<TargetCardKey>("complete");

  const cardTabs: { id: TargetCardKey; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: "complete",
      label: "Complete Card",
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
      desc: "Custom color & outline for the finished translation summary",
    },
    {
      id: "progress",
      label: "Progress & Gauge",
      icon: <PieChart className="h-4 w-4 text-sky-500" />,
      desc: "Circular percentage gauge & character count card",
    },
    {
      id: "header",
      label: "Novel Header",
      icon: <BookOpen className="h-4 w-4 text-purple-500" />,
      desc: "Top novel file name & word count header banner",
    },
    {
      id: "queue",
      label: "Chapter Queue",
      icon: <ListOrdered className="h-4 w-4 text-indigo-500" />,
      desc: "Recent activity & chapter queue list card",
    },
    {
      id: "upload",
      label: "Upload Card",
      icon: <UploadCloud className="h-4 w-4 text-pink-500" />,
      desc: "Initial TXT file upload & paste card",
    },
  ];

  const currentSettings: IndividualCardConfig =
    config.individualCards?.[selectedCard] ||
    (config as any)[`${selectedCard}Card`] || {
      enabled: false,
      backgroundColor: "",
      customColor: "",
      borderColor: "",
      borderWidth: 1,
      padding: "inherit",
      borderRadius: "inherit",
      radius: "inherit",
      shadow: "inherit",
      opacity: 85,
    };

  const updateSelectedCardSettings = (patch: Partial<IndividualCardConfig>) => {
    const rawColor = patch.customColor || patch.backgroundColor || currentSettings.customColor || currentSettings.backgroundColor;
    const rawRad = patch.radius || patch.borderRadius || currentSettings.radius || currentSettings.borderRadius || "inherit";
    const bw = patch.borderWidth !== undefined ? patch.borderWidth : (currentSettings.borderWidth !== undefined ? currentSettings.borderWidth : 1);
    
    const updated: IndividualCardConfig = {
      ...currentSettings,
      ...patch,
      bgMode: "custom",
      customColor: rawColor,
      backgroundColor: rawColor,
      radius: rawRad,
      borderRadius: rawRad,
      borderWidth: bw,
      borderMode: bw === 0 ? "none" : "custom",
    };

    const cardProp = `${selectedCard}Card` as "completeCard" | "progressCard" | "headerCard" | "queueCard" | "uploadCard";

    onUpdateConfig({
      ...config,
      [cardProp]: updated,
      individualCards: {
        ...config.individualCards,
        [selectedCard]: updated,
      },
    });
  };

  const resetCurrentCard = () => {
    const cardProp = `${selectedCard}Card` as "completeCard" | "progressCard" | "headerCard" | "queueCard" | "uploadCard";
    const resetObj: IndividualCardConfig = {
      enabled: false,
      backgroundColor: "",
      customColor: "",
      borderColor: "",
      borderWidth: 1,
      padding: "inherit",
      borderRadius: "inherit",
      radius: "inherit",
      shadow: "inherit",
      opacity: 85,
    };
    onUpdateConfig({
      ...config,
      [cardProp]: resetObj,
      individualCards: {
        ...config.individualCards,
        [selectedCard]: resetObj,
      },
    });
  };

  return (
    <div className="space-y-4 rounded-3xl border border-purple-100 dark:border-purple-900/50 bg-white/60 dark:bg-slate-800/40 p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-900/60 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <div>
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Individual Card Color, Size & Outline Customizer
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-purple-300/70">
              Customize specific cards independently (e.g. give the "Complete" card its own special color!)
            </p>
          </div>
        </div>

        {currentSettings.enabled && (
          <button
            type="button"
            onClick={resetCurrentCard}
            className="flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-bold text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-300 bg-white/60 dark:bg-slate-800 border border-purple-100 dark:border-purple-900 transition cursor-pointer"
            title="Reset this card to match global cards"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Match Global</span>
          </button>
        )}
      </div>

      {/* Card Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {cardTabs.map((tab) => {
          const isSelected = selectedCard === tab.id;
          const isEnabled = config.individualCards?.[tab.id]?.enabled;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCard(tab.id)}
              className={`flex flex-col items-start p-2.5 rounded-2xl border text-left transition cursor-pointer ${
                isSelected
                  ? "border-purple-600 bg-purple-100/90 dark:bg-purple-950 text-purple-900 dark:text-purple-100 ring-2 ring-purple-400 shadow-2xs"
                  : "border-purple-200/80 dark:border-purple-900/40 bg-white/70 dark:bg-slate-800/60 hover:bg-white text-slate-700 dark:text-slate-300"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                {tab.icon}
                {isEnabled ? (
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-xs" title="Custom style enabled" />
                ) : (
                  <span className="text-[9px] text-slate-400">Global</span>
                )}
              </div>
              <span className="text-xs font-black truncate w-full">{tab.label}</span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {tab.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Target Card Controller Box */}
      <div className="rounded-2xl border border-purple-200/80 dark:border-purple-800/60 bg-white/80 dark:bg-slate-900/60 p-4 space-y-4">
        {/* Enable Custom Override Toggle */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-100 dark:border-purple-900/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-900 dark:text-white">
                Enable Unique Style for{" "}
                <span className="text-purple-600 dark:text-purple-300">
                  {cardTabs.find((t) => t.id === selectedCard)?.label}
                </span>
              </span>
              {currentSettings.enabled ? (
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                  Active Override
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                  Inheriting Global Card Styles
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Turn this on to change this card's color, size, and outline independently from the rest of the site.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              const defaultColor =
                currentSettings.backgroundColor ||
                currentSettings.customColor ||
                (selectedCard === "complete"
                  ? "#10b981"
                  : selectedCard === "upload"
                  ? "#ec4899"
                  : selectedCard === "progress"
                  ? "#3b82f6"
                  : selectedCard === "header"
                  ? "#8b5cf6"
                  : "#6366f1");
              updateSelectedCardSettings({
                enabled: !currentSettings.enabled,
                backgroundColor: defaultColor,
                customColor: defaultColor,
                borderColor: currentSettings.borderColor || defaultColor,
              });
            }}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition cursor-pointer shadow-2xs ${
              currentSettings.enabled
                ? "bg-purple-600 text-white shadow-purple-500/20"
                : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300"
            }`}
          >
            {currentSettings.enabled ? (
              <>
                <ToggleRight className="h-4 w-4 text-white" />
                <span>Override ON</span>
              </>
            ) : (
              <>
                <ToggleLeft className="h-4 w-4" />
                <span>Override OFF</span>
              </>
            )}
          </button>
        </div>

        {currentSettings.enabled && (
          <div className="space-y-4 pt-1 animate-in fade-in duration-150">
            {/* 1. Card Background Color with Custom Palette */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3 p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50">
                <CustomColorPalettePicker
                  label={`🎨 ${cardTabs.find((t) => t.id === selectedCard)?.label} Color`}
                  value={currentSettings.customColor || currentSettings.backgroundColor || (selectedCard === "complete" ? "#10b981" : selectedCard === "upload" ? "#ec4899" : "#8b5cf6")}
                  onChange={(color) => updateSelectedCardSettings({ backgroundColor: color, customColor: color })}
                  savedColors={savedColors}
                  onSavedColorsChange={onSavedColorsChange}
                />

                {/* Opacity slider */}
                <div className="pt-2 border-t border-purple-200/60 dark:border-purple-800/40">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Card Opacity:</span>
                    <span className="font-mono text-purple-700 dark:text-purple-300">
                      {currentSettings.opacity ?? 85}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={currentSettings.opacity ?? 85}
                    onChange={(e) =>
                      updateSelectedCardSettings({ opacity: Number(e.target.value) })
                    }
                    className="w-full accent-purple-600 h-1.5 bg-purple-200 dark:bg-purple-900 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* 2. Card Outline / Border Color with Custom Palette */}
              <div className="space-y-3 p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50">
                <CustomColorPalettePicker
                  label={`✨ Outline / Border Color`}
                  value={currentSettings.borderColor || "#a855f7"}
                  onChange={(color) => updateSelectedCardSettings({ borderColor: color })}
                  savedColors={savedColors}
                  onSavedColorsChange={onSavedColorsChange}
                />

                {/* Border Width selector */}
                <div className="pt-2 border-t border-purple-200/60 dark:border-purple-800/40">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    <span>Outline Thickness:</span>
                    <span className="font-mono text-purple-700 dark:text-purple-300">
                      {currentSettings.borderWidth ?? 1}px
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {[0, 1, 2, 3, 4].map((width) => (
                      <button
                        key={width}
                        type="button"
                        onClick={() => updateSelectedCardSettings({ borderWidth: width })}
                        className={`rounded-lg py-1 text-center text-xs font-bold transition cursor-pointer ${
                          currentSettings.borderWidth === width
                            ? "bg-purple-600 text-white"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-purple-200 dark:border-purple-900"
                        }`}
                      >
                        {width === 0 ? "None" : `${width}px`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Card Size / Padding */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Maximize className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span>Card Size & Internal Padding</span>
                </span>
                <span className="font-mono text-purple-700 dark:text-pink-300 capitalize">
                  {currentSettings.padding}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {[
                  { id: "inherit", name: "Global Size", desc: "Follow global setting" },
                  { id: "compact", name: "Compact", desc: "10px padding" },
                  { id: "standard", name: "Standard", desc: "18px padding" },
                  { id: "relaxed", name: "Relaxed", desc: "24px padding" },
                  { id: "spacious", name: "Spacious", desc: "30px padding" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      updateSelectedCardSettings({
                        padding: opt.id as IndividualCardConfig["padding"],
                      })
                    }
                    className={`rounded-xl border p-2 text-left transition cursor-pointer ${
                      currentSettings.padding === opt.id
                        ? "border-purple-600 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 ring-2 ring-purple-400 font-bold"
                        : "border-purple-200 dark:border-purple-900/50 bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 text-[11px]"
                    }`}
                  >
                    <div className="font-black text-xs">{opt.name}</div>
                    <div className="text-[9px] text-slate-500 dark:text-slate-400">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Corner Curvature Radius */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Square className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span>Corner Curvature (Radius)</span>
                </span>
                <span className="font-mono text-purple-700 dark:text-pink-300 capitalize">
                  {currentSettings.borderRadius}
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {[
                  { id: "inherit", name: "Global" },
                  { id: "sleek", name: "Sleek (14px)" },
                  { id: "standard", name: "Normal (20px)" },
                  { id: "rounded", name: "Rounded (28px)" },
                  { id: "ultra", name: "Ultra (36px)" },
                  { id: "pill", name: "Pill (48px)" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      updateSelectedCardSettings({
                        borderRadius: opt.id as IndividualCardConfig["borderRadius"],
                      })
                    }
                    className={`rounded-xl border p-1.5 text-center text-xs font-bold transition cursor-pointer ${
                      currentSettings.borderRadius === opt.id
                        ? "border-purple-600 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 ring-2 ring-purple-400 font-bold"
                        : "border-purple-200 dark:border-purple-900/50 bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Shadow & Glow */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span>Shadow & Glow Intensity</span>
                </span>
                <span className="font-mono text-purple-700 dark:text-pink-300 capitalize">
                  {currentSettings.shadow}
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {[
                  { id: "inherit", name: "Global" },
                  { id: "none", name: "Flat (No Shadow)" },
                  { id: "subtle", name: "Subtle" },
                  { id: "medium", name: "Medium" },
                  { id: "deep", name: "Deep Float" },
                  { id: "glow", name: "Color Glow" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      updateSelectedCardSettings({
                        shadow: opt.id as IndividualCardConfig["shadow"],
                      })
                    }
                    className={`rounded-xl border p-1.5 text-center text-xs font-bold transition cursor-pointer ${
                      currentSettings.shadow === opt.id
                        ? "border-purple-600 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 ring-2 ring-purple-400 font-bold"
                        : "border-purple-200 dark:border-purple-900/50 bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
