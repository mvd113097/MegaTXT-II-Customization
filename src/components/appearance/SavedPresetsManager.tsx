import React, { useState } from "react";
import {
  VisualAppearanceConfig,
  UserSavedPreset,
  loadSavedUserPresets,
  saveUserPreset,
  deleteUserPreset,
} from "../../theme/visualAppearance";
import {
  BookmarkPlus,
  Save,
  Trash2,
  Check,
  Clock,
  Sparkles,
  Zap,
  RotateCcw,
} from "lucide-react";

interface SavedPresetsManagerProps {
  currentConfig: VisualAppearanceConfig;
  onApplyPreset: (config: VisualAppearanceConfig) => void;
}

export const SavedPresetsManager: React.FC<SavedPresetsManagerProps> = ({
  currentConfig,
  onApplyPreset,
}) => {
  const [savedPresets, setSavedPresets] = useState<UserSavedPreset[]>(() =>
    loadSavedUserPresets()
  );
  const [presetName, setPresetName] = useState("");
  const [justSaved, setJustSaved] = useState(false);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetName.trim()) return;

    const updated = saveUserPreset(presetName.trim(), currentConfig);
    setSavedPresets(updated);
    setPresetName("");
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteUserPreset(id);
    setSavedPresets(updated);
  };

  const handleApply = (preset: UserSavedPreset) => {
    onApplyPreset(preset.config);
    setAppliedId(preset.id);
    setTimeout(() => setAppliedId(null), 2000);
  };

  const curatedPresets: {
    name: string;
    desc: string;
    badge: string;
    config: Partial<VisualAppearanceConfig>;
  }[] = [
    {
      name: "Sakura Glass (Default)",
      desc: "Soft frosted lavender, glowing sakura pills & white outlines",
      badge: "🌸 Cozy",
      config: {
        cardOpacity: 35,
        cardBlur: 14,
        cardTint: "default",
        buttonTheme: "sakura",
        fontColorMode: "adaptive",
        cardMaxWidth: "standard",
        cardPadding: "standard",
        cardRadius: "rounded",
      },
    },
    {
      name: "Crystal Clear Focus",
      desc: "Maximum wallpaper visibility with high-contrast text halo",
      badge: "💎 Minimal",
      config: {
        cardOpacity: 12,
        cardBlur: 18,
        cardTint: "clear",
        textShadow: "crisp",
        highContrastText: true,
        buttonTheme: "royal-violet",
        buttonRadius: "pill",
      },
    },
    {
      name: "Emerald Masterpiece",
      desc: "Custom emerald 'Complete' card with sleek dark glass body",
      badge: "🍃 Contrast",
      config: {
        cardOpacity: 40,
        cardBlur: 16,
        cardTint: "dark-smoke",
        buttonTheme: "emerald",
        individualCards: {
          complete: {
            enabled: true,
            backgroundColor: "rgba(5, 150, 105, 0.45)",
            borderColor: "#34d399",
            borderWidth: 2,
            padding: "relaxed",
            borderRadius: "rounded",
            shadow: "glow",
            opacity: 90,
          },
          progress: { enabled: false, backgroundColor: "", borderColor: "", borderWidth: 1, padding: "inherit", borderRadius: "inherit", shadow: "inherit", opacity: 85 },
          header: { enabled: false, backgroundColor: "", borderColor: "", borderWidth: 1, padding: "inherit", borderRadius: "inherit", shadow: "inherit", opacity: 85 },
          queue: { enabled: false, backgroundColor: "", borderColor: "", borderWidth: 1, padding: "inherit", borderRadius: "inherit", shadow: "inherit", opacity: 85 },
          upload: { enabled: false, backgroundColor: "", borderColor: "", borderWidth: 1, padding: "inherit", borderRadius: "inherit", shadow: "inherit", opacity: 85 },
        },
      },
    },
    {
      name: "Cyber Neon Night",
      desc: "High-voltage cyan, bold outlines & terminal vibrancy",
      badge: "⚡ Cyber",
      config: {
        cardOpacity: 45,
        cardBlur: 20,
        cardTint: "cyber",
        cardBorder: "glow",
        cardBorderWidth: 2,
        buttonTheme: "cyber-neon",
        fontColorMode: "cyan",
        textShadow: "glow",
      },
    },
    {
      name: "Solid Editorial",
      desc: "100% opaque crisp contrast, classic serif font & zero blur",
      badge: "📖 Classic",
      config: {
        cardOpacity: 98,
        cardBlur: 0,
        cardTint: "solid",
        cardBorderWidth: 1,
        fontFamily: "serif",
        fontColorMode: "adaptive",
        highContrastText: false,
      },
    },
  ];

  return (
    <div className="space-y-4 rounded-3xl border border-purple-100 dark:border-purple-900/50 bg-white/60 dark:bg-slate-800/40 p-4 sm:p-5 shadow-xs">
      <div className="border-b border-purple-100 dark:border-purple-900/60 pb-3">
        <div className="flex items-center gap-2">
          <BookmarkPlus className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Saved Custom Setups & Quick Presets
          </h3>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-purple-300/70 mt-0.5">
          Save your current customized card sizes, colors, and outlines to reload anytime with 1 click!
        </p>
      </div>

      {/* Save Current Settings Form */}
      <form
        onSubmit={handleSave}
        className="rounded-2xl border border-purple-200/80 dark:border-purple-800/60 bg-white/80 dark:bg-slate-900/60 p-3 sm:p-4 space-y-2.5"
      >
        <label className="block text-xs font-black text-slate-800 dark:text-slate-200">
          💾 Save Your Current Setup
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="e.g. My Favorite Emerald Glass Setup"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            className="flex-1 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={!presetName.trim()}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black transition cursor-pointer shadow-xs whitespace-nowrap ${
              presetName.trim()
                ? "bg-purple-600 hover:bg-purple-700 text-white active:scale-95"
                : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
            }`}
          >
            {justSaved ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Save Setup</span>
              </>
            )}
          </button>
        </div>
        {justSaved && (
          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
            ✓ Setup successfully saved to your browser! You can apply it anytime below.
          </p>
        )}
      </form>

      {/* User's Saved Setups */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <span>📁 Your Saved Setups</span>
            <span className="rounded-full bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300">
              {savedPresets.length}
            </span>
          </span>
        </div>

        {savedPresets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-purple-200 dark:border-purple-900/60 p-4 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              No custom setups saved yet. Type a name above and click "Save Setup" to save your current look!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {savedPresets.map((preset) => {
              const isApplied = appliedId === preset.id;
              const dateStr = new Date(preset.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={preset.id}
                  className="flex items-center justify-between p-3 rounded-2xl border border-purple-200/80 dark:border-purple-800/60 bg-white/80 dark:bg-slate-900/60 shadow-2xs hover:border-purple-400 transition"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate">
                        {preset.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>{dateStr}</span>
                      </span>
                      <span>·</span>
                      <span>{preset.config.cardOpacity}% Opacity</span>
                      {preset.config.individualCards?.complete?.enabled && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            Complete Card Styled
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleApply(preset)}
                      className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-black transition cursor-pointer active:scale-95 shadow-2xs ${
                        isApplied
                          ? "bg-emerald-600 text-white"
                          : "bg-purple-600 hover:bg-purple-700 text-white"
                      }`}
                      title="Apply this saved setup to the app"
                    >
                      {isApplied ? (
                        <>
                          <Check className="h-3 w-3" />
                          <span>Applied!</span>
                        </>
                      ) : (
                        <>
                          <Zap className="h-3 w-3" />
                          <span>Apply</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(preset.id, e)}
                      className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-700 transition cursor-pointer"
                      title="Delete this saved setup"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 1-Click Curated Presets */}
      <div className="space-y-2 pt-2 border-t border-purple-100 dark:border-purple-900/40">
        <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-purple-600" />
          <span>Curated One-Click Themes</span>
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {curatedPresets.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => onApplyPreset({ ...currentConfig, ...item.config })}
              className="flex flex-col items-start p-3 rounded-2xl border border-purple-200/80 dark:border-purple-900/50 bg-white/70 dark:bg-slate-800/60 hover:border-purple-400 hover:bg-white text-left transition cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-300">
                  {item.name}
                </span>
                <span className="rounded-full bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 text-[9px] font-bold text-purple-700 dark:text-purple-300">
                  {item.badge}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                {item.desc}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
