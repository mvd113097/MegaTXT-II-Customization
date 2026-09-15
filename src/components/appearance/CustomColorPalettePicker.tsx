import React, { useState } from "react";
import { Plus, Check, Trash2, Palette } from "lucide-react";
import {
  saveCustomColorToPalette,
  deleteCustomColorFromPalette,
} from "../../theme/visualAppearance";

interface CustomColorPalettePickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  savedColors: string[];
  onSavedColorsChange: (colors: string[]) => void;
  defaultColors?: string[];
}

export const CustomColorPalettePicker: React.FC<CustomColorPalettePickerProps> = ({
  label,
  value,
  onChange,
  savedColors,
  onSavedColorsChange,
  defaultColors = [
    "#9333ea", // Purple
    "#ec4899", // Pink
    "#3b82f6", // Blue
    "#06b6d4", // Cyan
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#ef4444", // Red
    "#8b5cf6", // Violet
    "#ffffff", // White
    "#1e1b4b", // Deep Indigo
    "#0f172a", // Dark Slate
  ],
}) => {
  const [justSaved, setJustSaved] = useState(false);

  const handleSaveColor = () => {
    if (!value) return;
    const updated = saveCustomColorToPalette(value);
    onSavedColorsChange(updated);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const handleDeleteColor = (colorToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteCustomColorFromPalette(colorToDelete);
    onSavedColorsChange(updated);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black text-slate-800 dark:text-slate-200">
          {label}
        </label>
        <span className="font-mono text-[11px] font-bold text-purple-700 dark:text-purple-300">
          {value || "#000000"}
        </span>
      </div>

      {/* Primary Color Input Row */}
      <div className="flex items-center gap-2">
        <div className="relative flex items-center">
          <input
            type="color"
            value={value && value.startsWith("#") ? value : "#9333ea"}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-12 rounded-xl cursor-pointer border border-purple-200 dark:border-purple-800 bg-white/70 dark:bg-slate-800 shadow-2xs"
          />
        </div>

        <input
          type="text"
          value={value}
          placeholder="#hex or rgba"
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-xl border border-purple-200 dark:border-purple-800 bg-white/70 dark:bg-slate-900/60 px-3 py-1.5 font-mono text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />

        <button
          type="button"
          onClick={handleSaveColor}
          className={`flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-bold transition shadow-2xs cursor-pointer ${
            justSaved
              ? "bg-emerald-600 text-white"
              : "bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/60 dark:hover:bg-purple-800/80 text-purple-700 dark:text-purple-300"
          }`}
          title="Save this color to your reusable palette"
        >
          {justSaved ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" />
              <span>Save Color</span>
            </>
          )}
        </button>
      </div>

      {/* Palette Row: User Saved Colors */}
      <div className="space-y-1.5 pt-1">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-purple-300/80 flex items-center gap-1">
          <Palette className="h-3 w-3 text-purple-500" />
          <span>Quick Palette (Click to Apply)</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 max-h-24 overflow-y-auto pr-1">
          {/* Default Core Swatches */}
          {defaultColors.map((col) => {
            const isSelected = value?.toLowerCase() === col.toLowerCase();
            return (
              <button
                key={`def-${col}`}
                type="button"
                onClick={() => onChange(col)}
                style={{ backgroundColor: col }}
                className={`h-6 w-6 rounded-full transition-all border border-black/15 dark:border-white/20 shadow-2xs hover:scale-110 cursor-pointer ${
                  isSelected ? "ring-2 ring-purple-600 ring-offset-1 scale-110" : ""
                }`}
                title={`Select ${col}`}
              />
            );
          })}

          {/* User Saved Custom Colors */}
          {savedColors.map((col) => {
            const isSelected = value?.toLowerCase() === col.toLowerCase();
            return (
              <div
                key={`user-${col}`}
                className="group relative flex items-center"
              >
                <button
                  type="button"
                  onClick={() => onChange(col)}
                  style={{ backgroundColor: col }}
                  className={`h-6 w-6 rounded-full transition-all border border-black/15 dark:border-white/20 shadow-2xs hover:scale-110 cursor-pointer ${
                    isSelected ? "ring-2 ring-pink-500 ring-offset-1 scale-110" : ""
                  }`}
                  title={`Saved custom color: ${col}`}
                />
                <button
                  type="button"
                  onClick={(e) => handleDeleteColor(col, e)}
                  className="absolute -top-1 -right-1 hidden h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-600 text-white text-[9px] group-hover:flex shadow-xs cursor-pointer"
                  title="Remove from saved palette"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
